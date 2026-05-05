---
title: 'Parquet 파일을 쿼리하는 방법'
sidebar_label: 'Parquet 파일 쿼리하기'
slug: /chdb/guides/querying-parquet
description: 'chDB로 Parquet 파일을 쿼리하는 방법을 알아봅니다.'
keywords: ['chdb', 'parquet']
doc_type: 'guide'
---

전 세계의 데이터 상당 부분은 Amazon S3 버킷에 저장되어 있습니다.
이 가이드에서는 chDB를 사용하여 해당 데이터를 쿼리하는 방법을 알아봅니다.

## 설정 \{#setup\}

먼저 가상 환경을 생성합니다.

```bash
python -m venv .venv
source .venv/bin/activate
```

이제 chDB를 설치합니다.
버전 2.0.2 이상이 설치되어 있는지 확인하십시오:

```bash
pip install "chdb>=2.0.2"
```

이제 IPython을 설치합니다:

```bash
pip install ipython
```

이 가이드의 나머지 부분에서 명령을 실행하기 위해 `ipython`을 사용할 예정이며, 다음 명령으로 실행하십시오.

```bash
ipython
```

Python 스크립트나 선호하는 노트북 환경에서도 이 코드를 사용할 수 있습니다.

## Parquet 메타데이터 탐색 \{#exploring-parquet-metadata\}

[Amazon reviews](/getting-started/example-datasets/amazon-reviews) 데이터셋에서 Parquet 파일 하나를 살펴보겠습니다.
먼저 `chDB`를 설치하십시오:

```python
import chdb
```

Parquet 파일을 쿼리할 때 [`ParquetMetadata`](/interfaces/formats/ParquetMetadata) 입력 포맷을 사용하면 파일의 실제 내용이 아니라 Parquet 메타데이터를 반환하도록 할 수 있습니다.
이 포맷을 사용할 때 어떤 필드가 반환되는지 확인하기 위해 `DESCRIBE` 절을 사용해 보겠습니다:

```python
query = """
DESCRIBE s3(
  'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet', 
  ParquetMetadata
)
SETTINGS describe_compact_output=1
"""

chdb.query(query, 'TabSeparated')
```

```text
num_columns     UInt64
num_rows        UInt64
num_row_groups  UInt64
format_version  String
metadata_size   UInt64
total_uncompressed_size UInt64
total_compressed_size   UInt64
columns Array(Tuple(name String, path String, max_definition_level UInt64, max_repetition_level UInt64, physical_type String, logical_type String, compression String, total_uncompressed_size UInt64, total_compressed_size UInt64, space_saved String, encodings Array(String)))
row_groups      Array(Tuple(num_columns UInt64, num_rows UInt64, total_uncompressed_size UInt64, total_compressed_size UInt64, columns Array(Tuple(name String, path String, total_compressed_size UInt64, total_uncompressed_size UInt64, have_statistics Bool, statistics Tuple(num_values Nullable(UInt64), null_count Nullable(UInt64), distinct_count Nullable(UInt64), min Nullable(String), max Nullable(String))))))
```

이제 이 파일의 메타데이터를 살펴보겠습니다.
`columns`와 `row_groups`에는 모두 여러 속성을 담은 튜플의 배열이 들어 있으므로, 지금은 이 둘은 제외하겠습니다.

```python
query = """
SELECT * EXCEPT(columns, row_groups)
FROM s3(
  'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet', 
  ParquetMetadata
)
"""

chdb.query(query, 'Vertical')
```

```text
Row 1:
──────
num_columns:             15
num_rows:                41905631
num_row_groups:          42
format_version:          2.6
metadata_size:           79730
total_uncompressed_size: 14615827169
total_compressed_size:   9272262304
```

이 출력 결과를 보면 이 Parquet 파일에는 4천만 개가 넘는 행이 있고, 42개의 row group으로 나뉘어 있으며, 각 행은 15개의 컬럼으로 구성되어 있음을 알 수 있습니다.
row group은 데이터를 행 단위로 수평 분할한 논리적 파티션입니다.
각 row group에는 메타데이터가 포함되어 있으며, 쿼리 도구는 이 메타데이터를 활용해 파일을 효율적으로 쿼리할 수 있습니다.

이제 row group 중 하나를 살펴보겠습니다.

```python
query = """
WITH rowGroups AS (
    SELECT rg
    FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet',
    ParquetMetadata
    )
    ARRAY JOIN row_groups AS rg
    LIMIT 1
)
SELECT tupleElement(c, 'name') AS name, tupleElement(c, 'total_compressed_size') AS total_compressed_size, 
       tupleElement(c, 'total_uncompressed_size') AS total_uncompressed_size,
       tupleElement(tupleElement(c, 'statistics'), 'min') AS min,
       tupleElement(tupleElement(c, 'statistics'), 'max') AS max
FROM rowGroups
ARRAY JOIN tupleElement(rg, 'columns') AS c
"""

chdb.query(query, 'DataFrame')
```

```text
                 name  total_compressed_size  total_uncompressed_size                                                min                                                max
0         review_date                    493                      646                                              16455                                              16472
1         marketplace                     66                       64                                                 US                                                 US
2         customer_id                5207967                  7997207                                              10049                                           53096413
3           review_id               14748425                 17991290                                     R10004U8OQDOGE                                      RZZZUTBAV1RYI
4          product_id                8003456                 13969668                                         0000032050                                         BT00DDVMVQ
5      product_parent                5758251                  7974737                                                645                                          999999730
6       product_title               41068525                 63355320  ! Small S 1pc Black 1pc Navy (Blue) Replacemen...                            🌴 Vacation On The Beach
7    product_category                   1726                     1815                                            Apparel                                       Pet Products
8         star_rating                 369036                   374046                                                  1                                                  5
9       helpful_votes                 538940                  1022990                                                  0                                               3440
10        total_votes                 610902                  1080520                                                  0                                               3619
11               vine                  11426                   125999                                                  0                                                  1
12  verified_purchase                 102634                   125999                                                  0                                                  1
13    review_headline               16538189                 27634740                                                     🤹🏽‍♂️🎤Great product. Practice makes perfect. D...
14        review_body              145886383                232457911                                                                                              🚅 +🐧=💥 😀
```

## Parquet 파일 쿼리하기 \{#querying-parquet-files\}

이제 파일의 내용을 쿼리해 보겠습니다.
이를 위해 위 쿼리에서 `ParquetMetadata`를 제거하고, 예를 들어 모든 리뷰에서 가장 많이 나타나는 `star_rating` 값을 계산해 보겠습니다:

```python
query = """
SELECT star_rating, count() AS count, formatReadableQuantity(count)
FROM s3(
  'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet'
)
GROUP BY ALL
ORDER BY star_rating
"""

chdb.query(query, 'DataFrame')
```

```text
   star_rating     count formatReadableQuantity(count())
0            1   3253070                    3.25 million
1            2   1865322                    1.87 million
2            3   3130345                    3.13 million
3            4   6578230                    6.58 million
4            5  27078664                   27.08 million
```

흥미롭게도, 별점 5점 리뷰 수가 다른 모든 평점을 합한 것보다 더 많습니다.
사람들이 Amazon의 상품을 좋아하거나, 마음에 들지 않으면 아예 평점을 남기지 않는 것처럼 보입니다.
