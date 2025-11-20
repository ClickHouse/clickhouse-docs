---
'description': 'LAION 5B 데이터셋의 1억 개 벡터를 포함하는 데이터셋'
'sidebar_label': 'LAION 5B 데이터셋'
'slug': '/getting-started/example-datasets/laion-5b-dataset'
'title': 'LAION 5B 데이터셋'
'keywords':
- 'semantic search'
- 'vector similarity'
- 'approximate nearest neighbours'
- 'embeddings'
'doc_type': 'guide'
---

import search_results_image from '@site/static/images/getting-started/example-datasets/laion5b_visualization_1.png'
import Image from '@theme/IdealImage';

## Introduction {#introduction}

[LAION 5b 데이터셋](https://laion.ai/blog/laion-5b/)은 58억 5천만 개의 이미지-텍스트 임베딩과 연관된 이미지 메타데이터를 포함하고 있습니다. 이 임베딩은 `Open AI CLIP` 모델 [ViT-L/14](https://huggingface.co/sentence-transformers/clip-ViT-L-14)를 사용하여 생성되었습니다. 각 임베딩 벡터의 차원은 `768`입니다.

이 데이터셋은 대규모, 실세계 벡터 검색 응용 프로그램의 설계, 크기 조정 및 성능 측면을 모델링하는 데 사용할 수 있습니다. 이 데이터셋은 텍스트에서 이미지 검색뿐만 아니라 이미지에서 이미지 검색을 위해서도 사용할 수 있습니다.

## Dataset details {#dataset-details}

전체 데이터셋은 [the-eye.eu](https://the-eye.eu/public/AI/cah/laion5b/)에서 `npy` 및 `Parquet` 파일의 혼합 형태로 제공됩니다.

ClickHouse는 1억 개의 벡터를 `S3` 버킷에 제공하고 있습니다.
`S3` 버킷에는 각각 1천만 개의 행이 포함된 10개의 `Parquet` 파일이 있습니다.

사용자에게는 이 데이터셋의 저장소 및 메모리 요구 사항을 평가하기 위해 [문서](../../engines/table-engines/mergetree-family/annindexes.md)를 참조하여 크기 조정 작업을 먼저 실행할 것을 권장합니다.

## Steps {#steps}

<VerticalStepper headerLevel="h3">

### Create table {#create-table}

임베딩과 그 연관된 속성을 저장하기 위해 `laion_5b_100m` 테이블을 만듭니다:

```sql
CREATE TABLE laion_5b_100m
(
    id UInt32,
    image_path String,
    caption String,
    NSFW Nullable(String) default 'unknown',
    similarity Float32,
    LICENSE Nullable(String),
    url String,
    key String,
    status LowCardinality(String),
    width Int32,
    height Int32,
    original_width Int32,
    original_height Int32,
    exif Nullable(String),
    md5 String,
    vector Array(Float32) CODEC(NONE)
) ENGINE = MergeTree ORDER BY (id)
```

`id`는 단순히 증가하는 정수입니다. 추가 속성은 [문서](../../engines/table-engines/mergetree-family/annindexes.md)에서 설명한 대로 벡터 유사성 검색을 이해하는 데 사용될 수 있는 조건문에서 활용할 수 있습니다.

### Load data {#load-table}

모든 `Parquet` 파일에서 데이터셋을 로드하려면 다음 SQL 문을 실행합니다:

```sql
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_*.parquet');
```

테이블에 1억 개의 행을 로드하는 데 몇 분이 소요됩니다.

또는 특정 수의 파일/행을 로드하기 위해 개별 SQL 문을 실행할 수 있습니다.

```sql
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_part_1_of_10.parquet');
INSERT INTO laion_5b_100m SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/laion-5b/laion5b_100m_part_2_of_10.parquet');
⋮
```

### Run a brute-force vector similarity search {#run-a-brute-force-vector-similarity-search}

KNN (k - Nearest Neighbours) 검색 또는 브루트 포스 검색은 데이터셋 내 각 벡터와 검색 임베딩 벡터 간의 거리를 계산한 후, 이 거리들을 정렬하여 가장 가까운 이웃을 찾는 과정을 포함합니다. 우리는 데이터셋 자체의 벡터 중 하나를 검색 벡터로 사용할 수 있습니다. 예를 들어:

```sql title="Query"
SELECT id, url 
FROM laion_5b_100m
ORDER BY cosineDistance( vector, (SELECT vector FROM laion_5b_100m WHERE id = 9999) ) ASC
LIMIT 20

The vector in the row with id = 9999 is the embedding for an image of a Deli restaurant.
```

```response title="Response"
    ┌───────id─┬─url───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │     9999 │ https://certapro.com/belleville/wp-content/uploads/sites/1369/2017/01/McAlistersFairviewHgts.jpg                                                                                                                                  │
 2. │ 60180509 │ https://certapro.com/belleville/wp-content/uploads/sites/1369/2017/01/McAlistersFairviewHgts-686x353.jpg                                                                                                                          │
 3. │  1986089 │ https://www.gannett-cdn.com/-mm-/ceefab710d945bb3432c840e61dce6c3712a7c0a/c=30-0-4392-3280/local/-/media/2017/02/14/FortMyers/FortMyers/636226855169587730-McAlister-s-Exterior-Signage.jpg?width=534&amp;height=401&amp;fit=crop │
 4. │ 51559839 │ https://img1.mashed.com/img/gallery/how-rich-is-the-mcalisters-deli-ceo-and-whats-the-average-pay-of-its-employees/intro-1619793841.jpg                                                                                           │
 5. │ 22104014 │ https://www.restaurantmagazine.com/wp-content/uploads/2016/04/Largest-McAlisters-Deli-Franchisee-to-Expand-into-Nebraska.jpg                                                                                                      │
 6. │ 54337236 │ http://www.restaurantnews.com/wp-content/uploads/2015/11/McAlisters-Deli-Giving-Away-Gift-Cards-With-Win-One-Gift-One-Holiday-Promotion.jpg                                                                                       │
 7. │ 20770867 │ http://www.restaurantnews.com/wp-content/uploads/2016/04/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Florida-as-Chain-Enters-New-Markets.jpg                                                                               │
 8. │ 22493966 │ https://www.restaurantmagazine.com/wp-content/uploads/2016/06/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Columbus-Ohio-as-Chain-Expands-feature.jpg                                                                       │
 9. │  2224351 │ https://holttribe.com/wp-content/uploads/2019/10/60880046-879A-49E4-8E13-1EE75FB24980-900x675.jpeg                                                                                                                                │
10. │ 30779663 │ https://www.gannett-cdn.com/presto/2018/10/29/PMUR/685f3e50-cce5-46fb-9a66-acb93f6ea5e5-IMG_6587.jpg?crop=2166,2166,x663,y0&amp;width=80&amp;height=80&amp;fit=bounds                                                             │
11. │ 54939148 │ https://www.priceedwards.com/sites/default/files/styles/staff_property_listing_block/public/for-lease/images/IMG_9674%20%28Custom%29_1.jpg?itok=sa8hrVBT                                                                          │
12. │ 95371605 │ http://www.restaurantmagazine.com/wp-content/uploads/2015/08/McAlisters-Deli-Signs-Development-Agreement-with-Kingdom-Foods-to-Grow-in-Southern-Mississippi.jpg                                                                   │
13. │ 79564563 │ https://www.restaurantmagazine.com/wp-content/uploads/2016/05/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Denver-as-Chain-Expands.jpg                                                                                      │
14. │ 76429939 │ http://www.restaurantnews.com/wp-content/uploads/2016/08/McAlisters-Deli-Aims-to-Attract-New-Franchisees-in-Pennsylvania-as-Chain-Expands.jpg                                                                                     │
15. │ 96680635 │ https://img.claz.org/tc/400x320/9w3hll-UQNHGB9WFlhSGAVCWhheBQkeWh5SBAkUWh9SBgsJFxRcBUMNSR4cAQENXhJARwgNTRYcBAtDWh5WRQEJXR5SR1xcFkYKR1tYFkYGR1pVFiVyP0ImaTA                                                                        │
16. │ 48716846 │ http://tse2.mm.bing.net/th?id=OIP.nN2qJqGUJs_fVNdTiFyGnQHaEc                                                                                                                                                                      │
17. │  4472333 │ https://sgi.offerscdn.net/i/zdcs-merchants/05lG0FpXPIvsfiHnT3N8FQE.h200.w220.flpad.v22.bffffff.png                                                                                                                                │
18. │ 82667887 │ https://irs2.4sqi.net/img/general/200x200/11154479_OEGbrkgWB5fEGrrTkktYvCj1gcdyhZn7TSQSAqN2Yqw.jpg                                                                                                                                │
19. │ 57525607 │ https://knoji.com/images/logo/mcalistersdelicom.jpg                                                                                                                                                                               │
20. │ 15785896 │ https://www.groupnimb.com/mimg/merimg/mcalister-s-deli_1446088739.jpg                                                                                                                                                             │
    └──────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

#highlight-next-line
20 rows in set. Elapsed: 3.968 sec. Processed 100.38 million rows, 320.81 GB (25.30 million rows/s., 80.84 GB/s.)
```

쿼리 대기 시간을 기록하여 ANN (벡터 인덱스 사용) 쿼리 대기 시간과 비교할 수 있습니다. 1억 개의 행으로 구성된 위 쿼리는 벡터 인덱스 없이 몇 초에서 몇 분이 걸릴 수 있습니다.

### Build a vector similarity index {#build-vector-similarity-index}

다음 SQL을 실행하여 `laion_5b_100m` 테이블의 `vector` 컬럼에 대한 벡터 유사성 인덱스를 정의하고 빌드합니다:

```sql
ALTER TABLE laion_5b_100m ADD INDEX vector_index vector TYPE vector_similarity('hnsw', 'cosineDistance', 768, 'bf16', 64, 512);

ALTER TABLE laion_5b_100m MATERIALIZE INDEX vector_index SETTINGS mutations_sync = 2;
```

인덱스 생성 및 검색에 대한 매개변수와 성능 고려 사항은 [문서](../../engines/table-engines/mergetree-family/annindexes.md)에 설명되어 있습니다. 위의 문장은 HNSW 하이퍼파라미터 `M`과 `ef_construction`에 대해 각각 64와 512의 값을 사용합니다. 사용자는 선택한 값에 따른 인덱스 생성 시간과 검색 결과 품질을 평가하여 이러한 매개변수에 대한 최적의 값을 신중하게 선택해야 합니다.

인덱스를 빌드하고 저장하는 데는 사용 가능한 CPU 코어 수와 저장소 대역폭에 따라 전체 1억 데이터셋의 경우 몇 시간이 걸릴 수 있습니다.

### Perform ANN search {#perform-ann-search}

벡터 유사성 인덱스가 구축되면 벡터 검색 쿼리는 자동으로 인덱스를 사용합니다:

```sql title="Query"
SELECT id, url 
FROM laion_5b_100m
ORDER BY cosineDistance( vector, (SELECT vector FROM laion_5b_100m WHERE id = 9999) ) ASC
LIMIT 20

```

처음 벡터 인덱스를 메모리에 로드하는 데는 몇 초 또는 몇 분이 걸릴 수 있습니다.

### Generate embeddings for search query {#generating-embeddings-for-search-query}

`LAION 5b` 데이터셋 임베딩 벡터는 `OpenAI CLIP` 모델 `ViT-L/14`를 사용하여 생성되었습니다.

아래는 `CLIP` API를 사용하여 프로그래밍 방식으로 임베딩 벡터를 생성하는 방법을 설명하는 예제 Python 스크립트입니다. 검색 임베딩 벡터는 `SELECT` 쿼리의 [`cosineDistance()`](/sql-reference/functions/distance-functions#cosineDistance) 함수에 인수로 전달됩니다.

`clip` 패키지를 설치하려면 [OpenAI GitHub 레포지토리](https://github.com/openai/clip)를 참조하시기 바랍니다.

```python
import torch
import clip
import numpy as np
import sys
import clickhouse_connect

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-L/14", device=device)


# Search for images that contain both a dog and a cat
text = clip.tokenize(["a dog and a cat"]).to(device)

with torch.no_grad():
    text_features = model.encode_text(text)
    np_arr = text_features.detach().cpu().numpy()

    # Pass ClickHouse credentials here
    chclient = clickhouse_connect.get_client()

    params = {'v1': list(np_arr[0])}
    result = chclient.query("SELECT id, url FROM laion_5b_100m ORDER BY cosineDistance(vector, %(v1)s) LIMIT 100",
                            parameters=params)

    # Write the results to a simple HTML page that can be opened in the browser. Some URLs may have become obsolete.
    print("<html>")
    for r in result.result_rows:
        print("<img src = ", r[1], 'width="200" height="200">')
    print("</html>")
```

위 검색의 결과는 다음과 같습니다:

<Image img={search_results_image} alt="Vector Similarity Search Results" size="md"/>

</VerticalStepper>
