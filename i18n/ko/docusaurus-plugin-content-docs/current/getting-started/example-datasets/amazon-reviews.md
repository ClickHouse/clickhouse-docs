---
'description': '150M 이상의 Amazon 제품에 대한 고객 리뷰'
'sidebar_label': '아마존 고객 리뷰'
'slug': '/getting-started/example-datasets/amazon-reviews'
'title': '아마존 고객 리뷰'
'doc_type': 'guide'
'keywords':
- 'Amazon reviews'
- 'customer reviews dataset'
- 'e-commerce data'
- 'example dataset'
- 'getting started'
---

This dataset contains over 150M customer reviews of Amazon products. The data is in snappy-compressed Parquet files in AWS S3 that total 49GB in size (compressed). Let's walk through the steps to insert it into ClickHouse.

:::note
The queries below were executed on a **Production** instance of ClickHouse Cloud. For more information see
["Playground specifications"](/getting-started/playground#specifications).
:::

## Loading the dataset {#loading-the-dataset}

1. Without inserting the data into ClickHouse, we can query it in place. Let's grab some rows, so we can see what they look like:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet')
LIMIT 3
```

The rows look like:

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

2. Let's define a new `MergeTree` 테이블 named `amazon_reviews` to store this data in ClickHouse:

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

3. The following `INSERT` 명령은 `s3Cluster` 테이블 함수를 사용합니다. 이 함수는 클러스터의 모든 노드를 사용하여 여러 S3 파일을 병렬로 처리할 수 있게 해줍니다. 또한 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet`라는 이름으로 시작하는 파일을 삽입하기 위해 와일드카드를 사용합니다:

```sql
INSERT INTO amazon.amazon_reviews SELECT *
FROM s3Cluster('default', 
'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet')
```

:::tip
In ClickHouse Cloud, the name of the cluster is `default`. Change `default` to the name of your cluster...or use the `s3` table function (instead of `s3Cluster`) if you do not have a cluster.
:::

5. 그 쿼리는 오래 걸리지 않으며 - 평균적으로 초당 약 300,000 행을 처리합니다. 약 5분 이내에 모든 행이 삽입된 것을 볼 수 있어야 합니다:

```sql runnable
SELECT formatReadableQuantity(count())
FROM amazon.amazon_reviews
```

6. 우리의 데이터가 얼마나 많은 공간을 사용하는지 확인해봅시다:

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

원본 데이터는 약 70G였지만 ClickHouse에서는 약 30G를 차지합니다.

## Example queries {#example-queries}

7. 몇 가지 쿼리를 실행해봅시다. 다음은 데이터 세트에서 가장 유용한 10개의 리뷰입니다:

```sql runnable
SELECT
    product_title,
    review_headline
FROM amazon.amazon_reviews
ORDER BY helpful_votes DESC
LIMIT 10
```

:::note
This query is using a [projection](/data-modeling/projections) to speed up performance.
:::

8. 다음은 Amazon에서 리뷰가 가장 많은 상위 10개 제품입니다:

```sql runnable
SELECT
    any(product_title),
    count()
FROM amazon.amazon_reviews
GROUP BY product_id
ORDER BY 2 DESC
LIMIT 10;
```

9. 다음은 각 제품에 대한 월별 평균 리뷰 평점입니다 (실제 [Amazon 직무 면접 질문](https://datalemur.com/questions/sql-avg-review-ratings)!):

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

10. 다음은 제품 카테고리별 총 투표 수입니다. 이 쿼리는 `product_category`가 기본 키에 있기 때문에 빠릅니다:

```sql runnable
SELECT
    sum(total_votes),
    product_category
FROM amazon.amazon_reviews
GROUP BY product_category
ORDER BY 1 DESC
```

11. 리뷰에서 **"awful"**이라는 단어가 가장 많이 발생하는 제품을 찾아봅시다. 이는 큰 작업으로, 1억 5천 1백만 개 이상의 문자열을 구문 분석하여 단어 하나를 찾아야 합니다:

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

대량의 데이터에 대한 쿼리 시간을 주목하세요. 결과는 읽는 재미도 있습니다!

12. 동일한 쿼리를 다시 실행할 수 있지만, 이번에는 리뷰에서 **awesome**을 검색합니다:

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
