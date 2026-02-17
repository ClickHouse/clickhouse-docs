---
description: 'Amazon 상품에 대한 1억 5천만 개가 넘는 고객 리뷰'
sidebar_label: 'Amazon 고객 리뷰'
slug: /getting-started/example-datasets/amazon-reviews
title: 'Amazon 고객 리뷰'
doc_type: 'guide'
keywords: ['Amazon 리뷰', '고객 리뷰 데이터셋', '전자상거래 데이터', '예제 데이터셋', '시작하기']
---

이 데이터셋에는 Amazon 상품에 대한 1억 5천만 개가 넘는 고객 리뷰가 포함됩니다. 데이터는 총 49GB(압축 기준) 크기의 Snappy로 압축된 Parquet 파일 형태로 AWS S3에 저장되어 있습니다. 이제 이 데이터를 ClickHouse에 적재하는 절차를 단계별로 살펴봅니다.

:::note
아래 쿼리들은 **Production** 환경의 ClickHouse Cloud 인스턴스에서 실행되었습니다. 자세한 내용은
[&quot;Playground 사양&quot;](/getting-started/playground#specifications)을 참조하십시오.
:::

## 데이터셋 로딩 \{#loading-the-dataset\}

1. 데이터를 ClickHouse에 삽입하지 않고도 원본 위치에서 바로 쿼리할 수 있습니다. 몇 개의 행을 조회해서 어떤 데이터인지 살펴보겠습니다.

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet')
LIMIT 3
```

데이터 행은 다음과 같습니다:

```response
Row 1:
──────
review_date:       16462
marketplace:       US
customer_id:       25444946 -- 25.44 million
review_id:         R146L9MMZYG0WA
product_id:        B00NV85102
product_parent:    908181913 -- 908.18 million
product_title:     XIKEZAN iPhone 6 Plus 5.5 inch Waterproof Case, Shockproof Dirtproof Snowproof Full Body Skin Case Protective Cover with Hand Strap & Headphone Adapter & Kickstand
product_category:  Wireless
star_rating:       4
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   case is sturdy and protects as I want
review_body:       I won't count on the waterproof part (I took off the rubber seals at the bottom because the got on my nerves). But the case is sturdy and protects as I want.

Row 2:
──────
review_date:       16462
marketplace:       US
customer_id:       1974568 -- 1.97 million
review_id:         R2LXDXT293LG1T
product_id:        B00OTFZ23M
product_parent:    951208259 -- 951.21 million
product_title:     Season.C Chicago Bulls Marilyn Monroe No.1 Hard Back Case Cover for Samsung Galaxy S5 i9600
product_category:  Wireless
star_rating:       1
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   One Star
review_body:       Cant use the case because its big for the phone. Waist of money!

Row 3:
──────
review_date:       16462
marketplace:       US
customer_id:       24803564 -- 24.80 million
review_id:         R7K9U5OEIRJWR
product_id:        B00LB8C4U4
product_parent:    524588109 -- 524.59 million
product_title:     iPhone 5s Case, BUDDIBOX [Shield] Slim Dual Layer Protective Case with Kickstand for Apple iPhone 5 and 5s
product_category:  Wireless
star_rating:       4
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   but overall this case is pretty sturdy and provides good protection for the phone
review_body:       The front piece was a little difficult to secure to the phone at first, but overall this case is pretty sturdy and provides good protection for the phone, which is what I need. I would buy this case again.
```

2. ClickHouse에 이 데이터를 저장할 `amazon_reviews`라는 이름의 새로운 `MergeTree` 테이블을 정의합니다:

```sql
CREATE DATABASE amazon

CREATE TABLE amazon.amazon_reviews
(
    `review_date` Date,
    `marketplace` LowCardinality(String),
    `customer_id` UInt64,
    `review_id` String,
    `product_id` String,
    `product_parent` UInt64,
    `product_title` String,
    `product_category` LowCardinality(String),
    `star_rating` UInt8,
    `helpful_votes` UInt32,
    `total_votes` UInt32,
    `vine` Bool,
    `verified_purchase` Bool,
    `review_headline` String,
    `review_body` String,
    PROJECTION helpful_votes
    (
        SELECT *
        ORDER BY helpful_votes
    )
)
ENGINE = MergeTree
ORDER BY (review_date, product_category)
```

3. 다음 `INSERT` 명령어는 `s3Cluster` 테이블 함수를 사용합니다. 이 함수는 클러스터의 모든 노드를 사용하여 여러 S3 파일을 병렬로 처리할 수 있게 해줍니다. 또한 와일드카드를 사용하여 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet`로 시작하는 모든 파일을 삽입합니다:

```sql
INSERT INTO amazon.amazon_reviews SELECT *
FROM s3Cluster('default', 
'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet')
```

:::tip
ClickHouse Cloud에서는 클러스터 이름이 `default`입니다. `default`를 실제 클러스터 이름으로 변경하거나, 클러스터가 없다면 `s3Cluster` 대신 `s3` 테이블 함수(table function)를 사용하십시오.
:::

5. 해당 쿼리는 오래 걸리지 않으며, 초당 평균 약 300,000개의 행을 처리합니다. 약 5분 정도 지나면 모든 행이 삽입된 것을 확인할 수 있습니다:

```sql runnable
SELECT formatReadableQuantity(count())
FROM amazon.amazon_reviews
```

6. 이제 데이터가 얼마나 많은 공간을 차지하는지 확인해 보겠습니다:

```sql runnable
SELECT
    disk_name,
    formatReadableSize(sum(data_compressed_bytes) AS size) AS compressed,
    formatReadableSize(sum(data_uncompressed_bytes) AS usize) AS uncompressed,
    round(usize / size, 2) AS compr_rate,
    sum(rows) AS rows,
    count() AS part_count
FROM system.parts
WHERE (active = 1) AND (table = 'amazon_reviews')
GROUP BY disk_name
ORDER BY size DESC
```

원본 데이터는 약 70G였지만, ClickHouse에서 압축하면 약 30G 정도의 용량만 차지합니다.

## 예시 쿼리 \{#example-queries\}

7. 이제 몇 가지 쿼리를 실행해 보겠습니다. 다음은 데이터셋에서 가장 유용한 리뷰 상위 10개입니다:

```sql runnable
SELECT
    product_title,
    review_headline
FROM amazon.amazon_reviews
ORDER BY helpful_votes DESC
LIMIT 10
```

:::note
이 쿼리는 성능 향상을 위해 [프로젝션](/data-modeling/projections)을 사용합니다.
:::

8. 다음은 Amazon에서 리뷰가 가장 많은 상위 10개 상품입니다.

```sql runnable
SELECT
    any(product_title),
    count()
FROM amazon.amazon_reviews
GROUP BY product_id
ORDER BY 2 DESC
LIMIT 10;
```

9. 다음은 각 제품의 월별 평균 리뷰 평점입니다(실제 [Amazon 채용 면접 질문](https://datalemur.com/questions/sql-avg-review-ratings)입니다!):

```sql runnable
SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon.amazon_reviews
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20;
```

10. 다음은 제품 카테고리별 총 투표 수입니다. 이 쿼리는 `product_category`가 기본 키에 포함되어 있어 빠르게 실행됩니다:

```sql runnable
SELECT
    sum(total_votes),
    product_category
FROM amazon.amazon_reviews
GROUP BY product_category
ORDER BY 1 DESC
```

11. 리뷰에서 **&quot;awful&quot;**이라는 단어가 가장 자주 등장하는 제품을 찾아봅니다. 이는 상당히 큰 작업으로, 단어 하나를 찾기 위해 1억 5,100만 개가 넘는 문자열을 파싱해야 합니다:

```sql runnable settings={'enable_parallel_replicas':1}
SELECT
    product_id,
    any(product_title),
    avg(star_rating),
    count() AS count
FROM amazon.amazon_reviews
WHERE position(review_body, 'awful') > 0
GROUP BY product_id
ORDER BY count DESC
LIMIT 50;
```

이처럼 방대한 양의 데이터에 대해 쿼리가 얼마나 빠르게 실행되는지 확인하십시오. 결과를 읽어 보는 것도 재미있습니다!

12. 동일한 쿼리를 다시 실행할 수 있는데, 이번에는 리뷰에서 **awesome** 이라는 단어를 검색합니다.

```sql runnable settings={'enable_parallel_replicas':1}
SELECT 
    product_id,
    any(product_title),
    avg(star_rating),
    count() AS count
FROM amazon.amazon_reviews
WHERE position(review_body, 'awesome') > 0
GROUP BY product_id
ORDER BY count DESC
LIMIT 50;
```
