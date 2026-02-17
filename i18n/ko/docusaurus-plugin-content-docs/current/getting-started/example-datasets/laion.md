---
description: '영어 이미지 캡션이 포함된 4억 개 이미지 데이터세트'
sidebar_label: 'Laion-400M 데이터세트'
slug: /getting-started/example-datasets/laion-400m-dataset
title: 'Laion-400M 데이터세트'
doc_type: 'guide'
keywords: ['예제 데이터세트', 'laion', '이미지 임베딩', '샘플 데이터', '머신 러닝']
---

[Laion-400M 데이터세트](https://laion.ai/blog/laion-400-open-dataset/)에는 영어 이미지 캡션이 달린 4억 개의 이미지가 포함되어 있습니다. 현재 Laion은 [훨씬 더 큰 데이터세트](https://laion.ai/blog/laion-5b/)도 제공하지만, 사용하는 방식은 비슷합니다.

이 데이터세트에는 이미지 URL, 이미지와 이미지 캡션 각각에 대한 임베딩, 이미지와 이미지 캡션 간의 유사도 점수, 그리고 메타데이터(예를 들어 이미지 너비/높이, 라이선스, NSFW 플래그)가 포함됩니다. 이 데이터세트를 사용하여 ClickHouse에서 [근사 최근접 이웃 검색(approximate nearest neighbor search)](../../engines/table-engines/mergetree-family/annindexes.md)을 시연할 수 있습니다.

## 데이터 준비 \{#data-preparation\}

원시 데이터에서는 임베딩과 메타데이터가 별도 파일에 저장됩니다. 데이터 준비 단계에서는 데이터를 다운로드하여 파일을 병합하고,
CSV로 변환한 뒤 ClickHouse로 가져옵니다. 이를 위해 다음 `download.sh` 스크립트를 사용할 수 있습니다:

```bash
number=${1}
if [[ $number == '' ]]; then
    number=1
fi;
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/img_emb/img_emb_${number}.npy          # download image embedding
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/text_emb/text_emb_${number}.npy        # download text embedding
wget --tries=100 https://deploy.laion.ai/8f83b608504d46bb81708ec86e912220/embeddings/metadata/metadata_${number}.parquet    # download metadata
python3 process.py $number # merge files and convert to CSV
```

스크립트 `process.py`는 다음과 같이 정의되어 있습니다:

```python
import pandas as pd
import numpy as np
import os
import sys

str_i = str(sys.argv[1])
npy_file = "img_emb_" + str_i + '.npy'
metadata_file = "metadata_" + str_i + '.parquet'
text_npy =  "text_emb_" + str_i + '.npy'

# load all files
im_emb = np.load(npy_file)
text_emb = np.load(text_npy) 
data = pd.read_parquet(metadata_file)

# combine files
data = pd.concat([data, pd.DataFrame({"image_embedding" : [*im_emb]}), pd.DataFrame({"text_embedding" : [*text_emb]})], axis=1, copy=False)

# columns to be imported into ClickHouse
data = data[['url', 'caption', 'NSFW', 'similarity', "image_embedding", "text_embedding"]]

# transform np.arrays to lists
data['image_embedding'] = data['image_embedding'].apply(lambda x: x.tolist())
data['text_embedding'] = data['text_embedding'].apply(lambda x: x.tolist())

# this small hack is needed because caption sometimes contains all kind of quotes
data['caption'] = data['caption'].apply(lambda x: x.replace("'", " ").replace('"', " "))

# export data as CSV file
data.to_csv(str_i + '.csv', header=False)

# removed raw data files
os.system(f"rm {npy_file} {metadata_file} {text_npy}")
```

데이터 준비 파이프라인을 시작하려면 다음 명령을 실행합니다:

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

데이터 세트는 410개의 파일로 분할되어 있으며, 각 파일에는 약 100만 개의 행이 포함되어 있습니다. 더 작은 데이터 부분집합으로 작업하려면, 예를 들어 `seq 0 9 | ...`와 같이 limit 값을 조정하면 됩니다.

(위의 Python 스크립트는 매우 느리며(파일당 약 2~10분 소요), 메모리를 많이 사용하고(파일당 41 GB), 생성되는 CSV 파일의 크기도 매우 큽니다(각각 10 GB)이므로 주의해야 합니다. RAM이 충분하다면 더 높은 병렬성을 위해 `-P1` 값을 늘리십시오. 그래도 너무 느리다면 더 나은 수집 절차를 설계하는 것을 고려하십시오. 예를 들어 .npy 파일을 Parquet으로 변환한 다음, 나머지 처리는 모두 ClickHouse로 수행하는 방법이 있을 수 있습니다.)


## 테이블 생성 \{#create-table\}

처음에 인덱스 없이 테이블을 생성하려면 다음 명령을 실행합니다:

```sql
CREATE TABLE laion
(
    `id` Int64,
    `url` String,
    `caption` String,
    `NSFW` String,
    `similarity` Float32,
    `image_embedding` Array(Float32),
    `text_embedding` Array(Float32)
)
ENGINE = MergeTree
ORDER BY id
```

CSV 파일을 ClickHouse로 가져오려면 다음을 수행하십시오:

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

`id` 컬럼은 단지 예시를 위한 것이며, 스크립트에 의해 중복될 수 있는 값들로 채워집니다.


## 브루트포스 벡터 유사도 검색 실행 \{#run-a-brute-force-vector-similarity-search\}

브루트포스 근사 벡터 검색을 실행하려면 다음을 수행하십시오:

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

`target`는 512개 요소를 가진 배열이자 클라이언트 매개변수입니다.
이러한 배열을 편리하게 얻는 방법은 글의 마지막 부분에서 설명합니다.
우선은 임의의 LEGO Set 사진을 `target`으로 사용해 임베딩을 수행합니다.

**결과**

```markdown
    ┌─url───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption──────────────────────────────────────────────────────────────────────────┐
 1. │ https://s4.thcdn.com/productimg/600/600/11340490-9914447026352671.jpg                                                                                                                         │ LEGO Friends: Puppy Treats & Tricks (41304)                                      │
 2. │ https://www.avenuedelabrique.com/img/uploads/f20fd44bfa4bd49f2a3a5fad0f0dfed7d53c3d2f.jpg                                                                                                     │ Nouveau LEGO Friends 41334 Andrea s Park Performance 2018                        │
 3. │ http://images.esellerpro.com/2489/I/667/303/3938_box_in.jpg                                                                                                                                   │ 3938 LEGO Andreas Bunny House Girls Friends Heartlake Age 5-12 / 62 Pieces  New! │
 4. │ http://i.shopmania.org/180x180/7/7f/7f1e1a2ab33cde6af4573a9e0caea61293dfc58d.jpg?u=https%3A%2F%2Fs.s-bol.com%2Fimgbase0%2Fimagebase3%2Fextralarge%2FFC%2F4%2F0%2F9%2F9%2F9200000049789904.jpg │ LEGO Friends Avonturenkamp Boomhuis - 41122                                      │
 5. │ https://s.s-bol.com/imgbase0/imagebase/large/FC/5/5/9/4/1004004011684955.jpg                                                                                                                  │ LEGO Friends Andrea s Theatershow - 3932                                         │
 6. │ https://www.jucariicucubau.ro/30252-home_default/41445-lego-friends-ambulanta-clinicii-veterinare.jpg                                                                                         │ 41445 - LEGO Friends - Ambulanta clinicii veterinare                             │
 7. │ https://cdn.awsli.com.br/600x1000/91/91201/produto/24833262/234c032725.jpg                                                                                                                    │ LEGO FRIENDS 41336 EMMA S ART CAFÉ                                               │
 8. │ https://media.4rgos.it/s/Argos/6174930_R_SET?$Thumb150$&amp;$Web$                                                                                                                             │ more details on LEGO Friends Stephanie s Friendship Cake Set - 41308.            │
 9. │ https://thumbs4.ebaystatic.com/d/l225/m/mG4k6qAONd10voI8NUUMOjw.jpg                                                                                                                           │ Lego Friends Gymnast 30400 Polybag 26 pcs                                        │
10. │ http://www.ibrickcity.com/wp-content/gallery/41057/thumbs/thumbs_lego-41057-heartlake-horse-show-friends-3.jpg                                                                                │ lego-41057-heartlake-horse-show-friends-3                                        │
    └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────┘

10 rows in set. Elapsed: 4.605 sec. Processed 100.38 million rows, 309.98 GB (21.80 million rows/s., 67.31 GB/s.)
```


## 벡터 유사성 인덱스를 사용하여 근사 벡터 유사성 검색 실행하기 \{#run-an-approximate-vector-similarity-search-with-a-vector-similarity-index\}

이제 테이블에 두 개의 벡터 유사성 인덱스를 정의합니다.

```sql
ALTER TABLE laion ADD INDEX image_index image_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
ALTER TABLE laion ADD INDEX text_index text_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
```

인덱스 생성 및 검색을 위한 매개변수와 성능 관련 고려 사항은 [문서](../../engines/table-engines/mergetree-family/annindexes.md)에 설명되어 있습니다.
위 인덱스 정의는 거리 측정 지표로 「cosine distance」를 사용하는 HNSW 인덱스를 지정하며, 매개변수 「hnsw&#95;max&#95;connections&#95;per&#95;layer」를 64로, 매개변수 「hnsw&#95;candidate&#95;list&#95;size&#95;for&#95;construction」를 256으로 설정합니다.
이 인덱스는 메모리 사용량을 최적화하기 위해 절반 정밀도의 브레인 플로트(bfloat16)를 양자화 형식으로 사용합니다.

인덱스를 생성하고 구체화(Materialize)하려면 다음 SQL 문을 실행하십시오:

```sql
ALTER TABLE laion MATERIALIZE INDEX image_index;
ALTER TABLE laion MATERIALIZE INDEX text_index;
```

인덱스를 구축하고 저장하는 데에는 행의 수와 HNSW 인덱스 매개변수에 따라 몇 분에서 많게는 몇 시간까지 걸릴 수 있습니다.

벡터 검색을 수행하려면 동일한 쿼리를 다시 실행하면 됩니다:

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

**결과**


```response
    ┌─url───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─caption──────────────────────────────────────────────────────────────────────────┐
 1. │ https://s4.thcdn.com/productimg/600/600/11340490-9914447026352671.jpg                                                                                                                         │ LEGO Friends: Puppy Treats & Tricks (41304)                                      │
 2. │ https://www.avenuedelabrique.com/img/uploads/f20fd44bfa4bd49f2a3a5fad0f0dfed7d53c3d2f.jpg                                                                                                     │ Nouveau LEGO Friends 41334 Andrea s Park Performance 2018                        │
 3. │ http://images.esellerpro.com/2489/I/667/303/3938_box_in.jpg                                                                                                                                   │ 3938 LEGO Andreas Bunny House Girls Friends Heartlake Age 5-12 / 62 Pieces  New! │
 4. │ http://i.shopmania.org/180x180/7/7f/7f1e1a2ab33cde6af4573a9e0caea61293dfc58d.jpg?u=https%3A%2F%2Fs.s-bol.com%2Fimgbase0%2Fimagebase3%2Fextralarge%2FFC%2F4%2F0%2F9%2F9%2F9200000049789904.jpg │ LEGO Friends Avonturenkamp Boomhuis - 41122                                      │
 5. │ https://s.s-bol.com/imgbase0/imagebase/large/FC/5/5/9/4/1004004011684955.jpg                                                                                                                  │ LEGO Friends Andrea s Theatershow - 3932                                         │
 6. │ https://www.jucariicucubau.ro/30252-home_default/41445-lego-friends-ambulanta-clinicii-veterinare.jpg                                                                                         │ 41445 - LEGO Friends - Ambulanta clinicii veterinare                             │
 7. │ https://cdn.awsli.com.br/600x1000/91/91201/produto/24833262/234c032725.jpg                                                                                                                    │ LEGO FRIENDS 41336 EMMA S ART CAFÉ                                               │
 8. │ https://media.4rgos.it/s/Argos/6174930_R_SET?$Thumb150$&amp;$Web$                                                                                                                             │ more details on LEGO Friends Stephanie s Friendship Cake Set - 41308.            │
 9. │ https://thumbs4.ebaystatic.com/d/l225/m/mG4k6qAONd10voI8NUUMOjw.jpg                                                                                                                           │ Lego Friends Gymnast 30400 Polybag 26 pcs                                        │
10. │ http://www.ibrickcity.com/wp-content/gallery/41057/thumbs/thumbs_lego-41057-heartlake-horse-show-friends-3.jpg                                                                                │ lego-41057-heartlake-horse-show-friends-3                                        │
    └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────┘

10 rows in set. Elapsed: 0.019 sec. Processed 137.27 thousand rows, 24.42 MB (7.38 million rows/s., 1.31 GB/s.)
```

벡터 인덱스를 사용해 가장 가까운 이웃을 조회했기 때문에 쿼리 지연이 크게 감소했습니다.
벡터 유사도 인덱스를 사용한 벡터 유사도 검색은 브루트 포스 검색 결과와 약간 다른 결과를 반환할 수 있습니다.
HNSW 인덱스는 HNSW 파라미터를 신중하게 선택하고 인덱스 품질을 평가하면, 재현율을 거의 1에 가깝게(브루트 포스 검색과 동일한 정확도) 달성할 수 있습니다.


## UDF로 임베딩 생성하기 \{#creating-embeddings-with-udfs\}

일반적으로 새로운 이미지나 새로운 이미지 캡션에 대해 임베딩을 생성한 후, 데이터에서 유사한 이미지/이미지 캡션 쌍을 검색합니다. 클라이언트 측에서 벗어나지 않고 `target` 벡터를 생성하기 위해 [UDF](/sql-reference/functions/udf)를 사용할 수 있습니다. 데이터 생성 시와 검색을 위한 신규 임베딩 생성 시 동일한 모델을 사용하는 것이 중요합니다. 아래 스크립트는 데이터셋의 기반이 되는 `ViT-B/32` 모델을 활용합니다.

### 텍스트 임베딩 \{#text-embeddings\}

먼저 다음 Python 스크립트를 ClickHouse 데이터 경로의 `user_scripts/` 디렉터리에 저장한 후 실행 권한을 부여합니다 (`chmod +x encode_text.py`).

`encode_text.py`:

```python
#!/usr/bin/python3
#!Note: Change the above python3 executable location if a virtual env is being used.
import clip
import torch
import numpy as np
import sys

if __name__ == '__main__':
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model, preprocess = clip.load("ViT-B/32", device=device)
    for text in sys.stdin:
        inputs = clip.tokenize(text)
        with torch.no_grad():
            text_features = model.encode_text(inputs)[0].tolist()
            print(text_features)
        sys.stdout.flush()
```

그런 다음 ClickHouse 서버 설정 파일의 `<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>` 항목에서 참조하는 위치에 `encode_text_function.xml` 파일을 생성합니다.

```xml
<functions>
    <function>
        <type>executable</type>
        <name>encode_text</name>
        <return_type>Array(Float32)</return_type>
        <argument>
            <type>String</type>
            <name>text</name>
        </argument>
        <format>TabSeparated</format>
        <command>encode_text.py</command>
        <command_read_timeout>1000000</command_read_timeout>
    </function>
</functions>
```

이제 다음과 같이 간단히 사용하면 됩니다:

```sql
SELECT encode_text('cat');
```

첫 번째 실행은 모델을 로드해야 하므로 느리지만, 이후 반복 실행은 빠르게 진행됩니다. 그런 다음 출력 결과를 `SET param_target=...`에 복사하여 손쉽게 쿼리를 작성할 수 있습니다. 또는 `encode_text()` 함수를 `cosineDistance` 함수의 인자로 직접 사용할 수도 있습니다:

```SQL
SELECT url
FROM laion
ORDER BY cosineDistance(text_embedding, encode_text('a dog and a cat')) ASC
LIMIT 10
```

`encode_text()` UDF 자체가 임베딩 벡터를 계산하고 출력하는 데 몇 초 정도 걸릴 수 있습니다.


### 이미지 임베딩 \{#image-embeddings\}

이미지 임베딩도 같은 방식으로 생성할 수 있으며, 로컬 파일로 저장된 이미지에 대한 임베딩을 생성하는 Python 스크립트를 제공합니다.

`encode_image.py`

```python
#!/usr/bin/python3
#!Note: Change the above python3 executable location if a virtual env is being used.
import clip
import torch
import numpy as np
from PIL import Image
import sys

if __name__ == '__main__':
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model, preprocess = clip.load("ViT-B/32", device=device)
    for text in sys.stdin:
        image = preprocess(Image.open(text.strip())).unsqueeze(0).to(device)
        with torch.no_grad():
            image_features = model.encode_image(image)[0].tolist()
            print(image_features)
        sys.stdout.flush()
```

`encode_image_function.xml`

```xml
<functions>
    <function>
        <type>executable_pool</type>
        <name>encode_image</name>
        <return_type>Array(Float32)</return_type>
        <argument>
            <type>String</type>
            <name>path</name>
        </argument>
        <format>TabSeparated</format>
        <command>encode_image.py</command>
        <command_read_timeout>1000000</command_read_timeout>
    </function>
</functions>
```

검색에 사용할 예제 이미지를 가져오십시오:

```shell
# get a random image of a LEGO set
$ wget http://cdn.firstcry.com/brainbees/images/products/thumb/191325a.jpg
```

그런 다음 위의 이미지에 대한 임베딩을 생성하려면 다음 쿼리를 실행하십시오:

```sql
SELECT encode_image('/path/to/your/image');
```

전체 검색 쿼리는 다음과 같습니다:

```sql
SELECT
    url,
    caption
FROM laion
ORDER BY cosineDistance(image_embedding, encode_image('/path/to/your/image')) ASC
LIMIT 10
```
