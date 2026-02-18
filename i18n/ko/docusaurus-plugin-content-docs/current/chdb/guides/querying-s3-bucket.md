---
title: 'S3 버킷의 데이터를 쿼리하는 방법'
sidebar_label: 'S3 데이터 쿼리'
slug: /chdb/guides/querying-s3
description: 'chDB로 S3 버킷의 데이터를 쿼리하는 방법을 알아봅니다.'
keywords: ['chdb', 's3']
doc_type: 'guide'
---

전 세계의 상당수 데이터는 Amazon S3 버킷에 저장되어 있습니다.
이 가이드에서는 chDB를 사용하여 이러한 데이터를 쿼리하는 방법을 알아봅니다.

## 설정 \{#setup\}

먼저 가상 환경을 만듭니다:

```bash
python -m venv .venv
source .venv/bin/activate
```

이제 chDB를 설치하겠습니다.
버전 2.0.2 이상인지 확인하십시오:

```bash
pip install "chdb>=2.0.2"
```

이제 IPython을 설치합니다:

```bash
pip install ipython
```

이 가이드의 나머지 부분에서 사용할 명령은 `ipython`에서 실행할 것이며, 다음 명령으로 `ipython`을 시작하십시오.

```bash
ipython
```

Python 스크립트나 선호하는 노트북 환경에서 이 코드를 사용할 수도 있습니다.

## S3 버킷에서 파일 나열하기 \{#listing-files-in-an-s3-bucket\}

먼저 [Amazon 리뷰가 들어 있는 S3 버킷](/getting-started/example-datasets/amazon-reviews)에 있는 모든 파일을 나열합니다.
이를 위해 [`s3` table function](/sql-reference/table-functions/s3)을 사용하고, 파일 경로나 여러 파일을 가리키는 와일드카드 경로를 인자로 전달합니다.

:::tip
버킷 이름만 전달하면 예외가 발생합니다.
:::

또한 [`One`](/interfaces/formats/One) 입력 포맷을 사용하여 파일이 파싱되지 않도록 하고, 대신 파일마다 하나의 행만 반환되도록 합니다. 이렇게 하면 `_file` 가상 컬럼을 통해 파일을 참조할 수 있고, `_path` 가상 컬럼을 통해 경로를 참조할 수 있습니다.

```python
import chdb

chdb.query("""
SELECT
    _file,
    _path
FROM s3('s3://datasets-documentation/amazon_reviews/*.parquet', One)
SETTINGS output_format_pretty_row_numbers=0
""", 'PrettyCompact')
```

```text
┌─_file───────────────────────────────┬─_path─────────────────────────────────────────────────────────────────────┐
│ amazon_reviews_2010.snappy.parquet  │ datasets-documentation/amazon_reviews/amazon_reviews_2010.snappy.parquet  │
│ amazon_reviews_1990s.snappy.parquet │ datasets-documentation/amazon_reviews/amazon_reviews_1990s.snappy.parquet │
│ amazon_reviews_2013.snappy.parquet  │ datasets-documentation/amazon_reviews/amazon_reviews_2013.snappy.parquet  │
│ amazon_reviews_2015.snappy.parquet  │ datasets-documentation/amazon_reviews/amazon_reviews_2015.snappy.parquet  │
│ amazon_reviews_2014.snappy.parquet  │ datasets-documentation/amazon_reviews/amazon_reviews_2014.snappy.parquet  │
│ amazon_reviews_2012.snappy.parquet  │ datasets-documentation/amazon_reviews/amazon_reviews_2012.snappy.parquet  │
│ amazon_reviews_2000s.snappy.parquet │ datasets-documentation/amazon_reviews/amazon_reviews_2000s.snappy.parquet │
│ amazon_reviews_2011.snappy.parquet  │ datasets-documentation/amazon_reviews/amazon_reviews_2011.snappy.parquet  │
└─────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────┘
```

이 버킷에는 Parquet 파일만 있습니다.

## S3 버킷에서 파일 쿼리하기 \{#querying-files-in-an-s3-bucket\}

이제 해당 파일들을 어떻게 쿼리할 수 있는지 알아보겠습니다.
각 파일에 있는 행 수를 세고 싶다면, 다음 쿼리를 실행하면 됩니다:

```python
chdb.query("""
SELECT
    _file,
    count() AS count,
    formatReadableQuantity(count) AS readableCount    
FROM s3('s3://datasets-documentation/amazon_reviews/*.parquet')
GROUP BY ALL
SETTINGS output_format_pretty_row_numbers=0
""", 'PrettyCompact')
```

```text
┌─_file───────────────────────────────┬────count─┬─readableCount───┐
│ amazon_reviews_2013.snappy.parquet  │ 28034255 │ 28.03 million   │
│ amazon_reviews_1990s.snappy.parquet │   639532 │ 639.53 thousand │
│ amazon_reviews_2011.snappy.parquet  │  6112495 │ 6.11 million    │
│ amazon_reviews_2015.snappy.parquet  │ 41905631 │ 41.91 million   │
│ amazon_reviews_2012.snappy.parquet  │ 11541011 │ 11.54 million   │
│ amazon_reviews_2000s.snappy.parquet │ 14728295 │ 14.73 million   │
│ amazon_reviews_2014.snappy.parquet  │ 44127569 │ 44.13 million   │
│ amazon_reviews_2010.snappy.parquet  │  3868472 │ 3.87 million    │
└─────────────────────────────────────┴──────────┴─────────────────┘
```

S3 버킷에 대한 HTTP URI를 전달할 수도 있으며, 동일한 결과를 얻을 수 있습니다.

```python
chdb.query("""
SELECT
    _file,
    count() AS count,
    formatReadableQuantity(count) AS readableCount    
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/*.parquet')
GROUP BY ALL
SETTINGS output_format_pretty_row_numbers=0
""", 'PrettyCompact')
```

`DESCRIBE` 절을 사용하여 이 Parquet 파일들의 스키마를 확인해 보겠습니다.

```python
chdb.query("""
DESCRIBE s3('s3://datasets-documentation/amazon_reviews/*.parquet')
SETTINGS describe_compact_output=1
""", 'PrettyCompact')
```

```text
    ┌─name──────────────┬─type─────────────┐
 1. │ review_date       │ Nullable(UInt16) │
 2. │ marketplace       │ Nullable(String) │
 3. │ customer_id       │ Nullable(UInt64) │
 4. │ review_id         │ Nullable(String) │
 5. │ product_id        │ Nullable(String) │
 6. │ product_parent    │ Nullable(UInt64) │
 7. │ product_title     │ Nullable(String) │
 8. │ product_category  │ Nullable(String) │
 9. │ star_rating       │ Nullable(UInt8)  │
10. │ helpful_votes     │ Nullable(UInt32) │
11. │ total_votes       │ Nullable(UInt32) │
12. │ vine              │ Nullable(Bool)   │
13. │ verified_purchase │ Nullable(Bool)   │
14. │ review_headline   │ Nullable(String) │
15. │ review_body       │ Nullable(String) │
    └───────────────────┴──────────────────┘
```

이제 리뷰 수를 기준으로 상위 상품 카테고리를 구하고, 평균 별점도 함께 계산해 보겠습니다.

```python
chdb.query("""
SELECT product_category, count() AS reviews, round(avg(star_rating), 2) as avg
FROM s3('s3://datasets-documentation/amazon_reviews/*.parquet')
GROUP BY ALL
LIMIT 10
""", 'PrettyCompact')
```

```text
    ┌─product_category─┬──reviews─┬──avg─┐
 1. │ Toys             │  4864056 │ 4.21 │
 2. │ Apparel          │  5906085 │ 4.11 │
 3. │ Luggage          │   348644 │ 4.22 │
 4. │ Kitchen          │  4880297 │ 4.21 │
 5. │ Books            │ 19530930 │ 4.34 │
 6. │ Outdoors         │  2302327 │ 4.24 │
 7. │ Video            │   380596 │ 4.19 │
 8. │ Grocery          │  2402365 │ 4.31 │
 9. │ Shoes            │  4366757 │ 4.24 │
10. │ Jewelry          │  1767667 │ 4.14 │
    └──────────────────┴──────────┴──────┘
```

## 비공개 S3 버킷의 파일 쿼리하기 \{#querying-files-in-a-private-s3-bucket\}

비공개 S3 버킷의 파일을 쿼리할 때는 액세스 키와 시크릿을 전달해야 합니다.
이 자격 증명은 `s3` 테이블 함수에 전달할 수 있습니다:

```python
chdb.query("""
SELECT product_category, count() AS reviews, round(avg(star_rating), 2) as avg
FROM s3('s3://datasets-documentation/amazon_reviews/*.parquet', 'access-key', 'secret')
GROUP BY ALL
LIMIT 10
""", 'PrettyCompact')
```

:::note
이 쿼리는 퍼블릭 버킷이기 때문에 작동하지 않습니다!
:::

대안으로 [named collections](/operations/named-collections)를 사용하는 방법이 있지만, 이 방식은 아직 chDB에서 지원되지 않습니다.
