---
'title': 'Parquet 파일 쿼리하는 방법'
'sidebar_label': 'Parquet 파일 쿼리하기'
'slug': '/chdb/guides/querying-parquet'
'description': 'chDB로 Parquet 파일을 쿼리하는 방법을 배워보세요.'
'keywords':
- 'chdb'
- 'parquet'
'doc_type': 'guide'
---

A lot of the world's data lives in Amazon S3 buckets.  
In this guide, we'll learn how to query that data using chDB.

## Setup {#setup}

Let's first create a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

And now we'll install chDB.  
Make sure you have version 2.0.2 or higher:

```bash
pip install "chdb>=2.0.2"
```

And now we're going to install IPython:

```bash
pip install ipython
```

We're going to use `ipython` to run the commands in the rest of the guide, which you can launch by running:

```bash
ipython
```

You can also use the code in a Python script or in your favorite notebook.

## Exploring Parquet metadata {#exploring-parquet-metadata}

We're going to explore a Parquet file from the [Amazon reviews](/getting-started/example-datasets/amazon-reviews) dataset.  
But first, let's install `chDB`:

```python
import chdb
```

When querying Parquet files, we can use the [`ParquetMetadata`](/interfaces/formats/ParquetMetadata) input format to have it return Parquet metadata rather than the content of the file.  
Let's use the `DESCRIBE` clause to see the fields returned when we use this format:

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

Let's have now have a look at the metadata for this file.  
`columns` and `row_groups` both contain arrays of tuples containing many properties, so we'll exclude those for now.

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

From this output, we learn that this Parquet file has over 40 million rows, split across 42 row groups, with 15 columns of data per row.  
A row group is a logical horizontal partitioning of the data into rows.  
Each row group has associated metadata and querying tools can make use of that metadata to efficiently query the file.

Let's take a look at one of the row groups:

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

## Querying Parquet files {#querying-parquet-files}

Next, let's query the contents of the file.  
We can do this by adjusting the above query to remove `ParquetMetadata` and then, say, compute the most popular `star_rating` across all reviews:

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

Interestingly, there are more 5 star reviews than all the other ratings combined!  
It looks like people like the products on Amazon or, if they don't, they just don't submit a rating.

---

아래는 번역된 내용입니다.

많은 세계의 데이터가 Amazon S3 버킷에 저장되어 있습니다.  
이 가이드에서는 chDB를 사용하여 해당 데이터를 쿼리하는 방법을 배우겠습니다.

## 설정 {#setup}

먼저 가상 환경을 만들겠습니다:

```bash
python -m venv .venv
source .venv/bin/activate
```

이제 chDB를 설치하겠습니다.  
버전 2.0.2 이상인지 확인하세요:

```bash
pip install "chdb>=2.0.2"
```

이제 IPython을 설치하겠습니다:

```bash
pip install ipython
```

이 가이드의 나머지 명령을 실행하기 위해 `ipython`을 사용할 것이며, 다음과 같이 실행할 수 있습니다:

```bash
ipython
```

Python 스크립트나 좋아하는 노트북에서 코드를 사용할 수도 있습니다.

## Parquet 메타데이터 탐색 {#exploring-parquet-metadata}

[Amazon 리뷰](/getting-started/example-datasets/amazon-reviews) 데이터 세트에서 Parquet 파일을 탐색할 것입니다.  
하지만 먼저 `chDB`를 설치합시다:

```python
import chdb
```

Parquet 파일을 쿼리할 때는 [`ParquetMetadata`](/interfaces/formats/ParquetMetadata) 입력 형식을 사용하여 파일의 내용이 아닌 Parquet 메타데이터를 반환하게 할 수 있습니다.  
이 형식을 사용할 때 반환되는 필드를 보려면 `DESCRIBE` 절을 사용해 보겠습니다:

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
`columns`와 `row_groups`는 둘 다 많은 속성을 포함하는 튜플의 배열을 포함하고 있으므로, 지금은 이를 제외하겠습니다.

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

이 출력으로부터, 이 Parquet 파일은 4천만 개 이상의 행을 가지고 있으며, 42개의 행 그룹에 나누어져 있고, 행당 15개의 데이터 컬럼이 있습니다.  
행 그룹은 데이터를 행으로 논리적으로 수평 분할하는 것입니다.  
각 행 그룹은 관련 메타데이터를 가지고 있으며, 쿼리 도구는 해당 메타데이터를 사용하여 파일을 효율적으로 쿼리할 수 있습니다.

행 그룹 중 하나를 살펴보겠습니다:

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

## Parquet 파일 쿼리하기 {#querying-parquet-files}

다음으로, 파일의 내용을 쿼리해 보겠습니다.  
위 쿼리에서 `ParquetMetadata`를 제거하고, 모든 리뷰에 대해 가장 인기 있는 `star_rating`를 계산해 보겠습니다:

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

흥미롭게도, 5성 리뷰가 모든 다른 평점을 합친 것보다 더 많습니다!  
사람들이 Amazon의 제품을 좋아하는 것 같거나, 그렇지 않다면 평점을 제출하지 않는 것 같습니다.
