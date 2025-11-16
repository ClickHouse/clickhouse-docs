---
'description': '영어 이미지 캡션이 포함된 400 백만 이미지를 포함하는 데이터셋'
'sidebar_label': 'Laion-400M 데이터셋'
'slug': '/getting-started/example-datasets/laion-400m-dataset'
'title': 'Laion-400M 데이터셋'
'doc_type': 'guide'
'keywords':
- 'example dataset'
- 'laion'
- 'image embeddings'
- 'sample data'
- 'machine learning'
---

The [Laion-400M 데이터셋](https://laion.ai/blog/laion-400-open-dataset/)은 4억 개의 이미지와 영어 이미지 캡션을 포함하고 있습니다. Laion은 현재 [더 큰 데이터셋](https://laion.ai/blog/laion-5b/)를 제공하지만, 그것을 사용하는 방법은 비슷합니다.

데이터셋은 이미지 URL, 이미지와 이미지 캡션의 임베딩, 이미지와 이미지 캡션 사이의 유사도 점수, 그리고 메타데이터(예: 이미지 너비/높이, 라이센스, NSFW 플래그 등)를 포함하고 있습니다. 우리는 이 데이터셋을 사용하여 ClickHouse에서 [근사 최근접 이웃 검색](../../engines/table-engines/mergetree-family/annindexes.md)을 시연할 수 있습니다.

## 데이터 준비 {#data-preparation}

임베딩과 메타데이터는 원시 데이터의 별도 파일에 저장됩니다. 데이터 준비 단계에서는 데이터를 다운로드하고 파일을 병합하며, 이들을 CSV로 변환하고 ClickHouse로 가져옵니다. 이를 위해 다음의 `download.sh` 스크립트를 사용할 수 있습니다:

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
스크립트 `process.py`는 다음과 같이 정의됩니다:

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

데이터 준비 파이프라인을 시작하려면 다음을 실행하십시오:

```bash
seq 0 409 | xargs -P1 -I{} bash -c './download.sh {}'
```

데이터셋은 410개의 파일로 나뉘어 있으며, 각 파일에는 약 100만 개의 행이 포함되어 있습니다. 데이터의 더 작은 하위 집합으로 작업하려면 한계 값을 조정하면 됩니다. 예: `seq 0 9 | ...`.

(위의 파이썬 스크립트는 매우 느리며(~2-10 분/파일), 많은 메모리를 소모하고(파일당 41GB), 결과 CSV 파일의 크기가 크므로(각 10GB) 주의해야 합니다. RAM이 충분하다면 병렬성을 높이기 위해 `-P1` 숫자를 늘리십시오. 여전히 너무 느리면 더 나은 수집 절차를 고려해 보십시오 - .npy 파일을 parquet으로 변환한 다음, ClickHouse로 모든 다른 처리를 수행하는 방법일 수 있습니다.)

## 테이블 생성 {#create-table}

인덱스 없이 처음에 테이블을 생성하려면 다음을 실행하십시오:

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
SETTINGS index_granularity = 8192
```

CSV 파일을 ClickHouse로 가져오려면:

```sql
INSERT INTO laion FROM INFILE '{path_to_csv_files}/*.csv'
```

`id` 컬럼은 단지 예시용이며, 스크립트에 의해 비고유 값으로 채워집니다.

## 브루트 포스 벡터 유사도 검색 수행 {#run-a-brute-force-vector-similarity-search}

브루트 포스 근사 벡터 검색을 수행하려면 다음을 실행하십시오:

```sql
SELECT url, caption FROM laion ORDER BY cosineDistance(image_embedding, {target:Array(Float32)}) LIMIT 10
```

`target`은 512 요소의 배열과 클라이언트 파라미터입니다. 이러한 배열을 얻는 편리한 방법은 기사의 끝부분에서 제공됩니다. 지금은 임의의 LEGO 세트 사진의 임베딩을 `target`으로 실행할 수 있습니다.

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

## 벡터 유사도 인덱스를 사용한 근사 벡터 유사도 검색 수행 {#run-an-approximate-vector-similarity-search-with-a-vector-similarity-index}

이제 테이블에 두 개의 벡터 유사도 인덱스를 정의합시다.

```sql
ALTER TABLE laion ADD INDEX image_index image_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
ALTER TABLE laion ADD INDEX text_index text_embedding TYPE vector_similarity('hnsw', 'cosineDistance', 512, 'bf16', 64, 256)
```

인덱스 생성 및 검색을 위한 파라미터와 성능 고려사항은 [문서](../../engines/table-engines/mergetree-family/annindexes.md)에서 설명되어 있습니다. 위의 인덱스 정의는 "코사인 거리"를 거리 메트릭으로 사용하는 HNSW 인덱스를 지정하며, "hnsw_max_connections_per_layer" 파라미터는 64로 설정하고, "hnsw_candidate_list_size_for_construction" 파라미터는 256으로 설정합니다. 인덱스는 메모리 사용을 최적화하기 위해 반정밀도 뇌 플롯(bfloat16)을 양자화로 사용합니다.

인덱스를 구축하고 물리화하려면 다음 명령어를 실행하십시오:

```sql
ALTER TABLE laion MATERIALIZE INDEX image_index;
ALTER TABLE laion MATERIALIZE INDEX text_index;
```

인덱스를 구축하고 저장하는 데는 행 수와 HNSW 인덱스 파라미터에 따라 몇 분 또는 몇 시간이 걸릴 수 있습니다.

벡터 검색을 수행하려면 같은 쿼리를 다시 실행하기만 하면 됩니다:

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

쿼리 대기 시간이 크게 줄어들었습니다. 이는 벡터 인덱스를 사용하여 가장 가까운 이웃을 검색했기 때문입니다. 벡터 유사도 인덱스를 사용한 벡터 유사도 검색은 브루트 포스 검색 결과와 약간 다른 결과를 반환할 수 있습니다. HNSW 인덱스는 적절한 HNSW 파라미터 선택과 인덱스 품질 평가를 통해 1에 가까운 재현율에 도달할 수 있습니다(브루트 포스 검색과 동일한 정확도).

## UDF로 임베딩 생성 {#creating-embeddings-with-udfs}

보통 새 이미지 또는 새 이미지 캡션에 대한 임베딩을 생성하고 데이터에서 유사한 이미지/이미지 캡션 쌍을 검색하고 싶어합니다. 우리는 클라이언트를 떠나지 않고 `target` 벡터를 생성하기 위해 [UDF](/sql-reference/functions/udf)를 사용할 수 있습니다. 검색을 위해 데이터를 생성하고 새로운 임베딩을 만들 때 동일한 모델을 사용하는 것이 중요합니다. 다음 스크립트는 데이터셋의 기반이 되는 모델인 `ViT-B/32` 모델을 활용합니다.

### 텍스트 임베딩 {#text-embeddings}

먼저, 다음의 파이썬 스크립트를 ClickHouse 데이터 경로의 `user_scripts/` 디렉토리에 저장하고 실행 가능하게 만듭니다(`chmod +x encode_text.py`).

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

그런 다음 ClickHouse 서버 구성 파일에서 `<user_defined_executable_functions_config>/path/to/*_function.xml</user_defined_executable_functions_config>`로 참조되는 위치에 `encode_text_function.xml`을 생성합니다.

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

이제 단순히 다음을 사용할 수 있습니다:

```sql
SELECT encode_text('cat');
```
첫 번째 실행은 모델을 로드하므로 느리지만 반복 실행은 빠릅니다. 그런 다음 출력을 `SET param_target=...`로 복사하고 쉽게 쿼리를 작성할 수 있습니다. 또는 `encode_text()` 함수를 `cosineDistance` 함수의 인수로 직접 사용할 수 있습니다:

```SQL
SELECT url
FROM laion
ORDER BY cosineDistance(text_embedding, encode_text('a dog and a cat')) ASC
LIMIT 10
```

`encode_text()` UDF 자체가 임베딩 벡터를 계산하고 방출하는 데 몇 초가 걸릴 수 있다는 점에 유의하십시오.

### 이미지 임베딩 {#image-embeddings}

이미지 임베딩은 유사하게 생성할 수 있으며, 우리는 로컬에 저장된 파일로부터 이미지를 임베딩하는 파이썬 스크립트를 제공합니다.

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

검색할 예제 이미지를 가져옵니다:

```shell

# get a random image of a LEGO set
$ wget http://cdn.firstcry.com/brainbees/images/products/thumb/191325a.jpg
```

그런 다음 위 이미지를 위한 임베딩을 생성하기 위해 이 쿼리를 실행하십시오:

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
