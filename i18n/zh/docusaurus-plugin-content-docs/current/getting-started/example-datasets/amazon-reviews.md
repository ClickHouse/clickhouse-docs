---
'description': '超过 1.5 亿条 亚马逊 产品的客户评价'
'sidebar_label': '亚马逊客户评价'
'slug': '/getting-started/example-datasets/amazon-reviews'
'title': '亚马逊客户评价'
'doc_type': 'reference'
---

这个数据集包含超过 1.5 亿条关于亚马逊产品的客户评价。这些数据以 snappy 压缩的 Parquet 文件形式存储在 AWS S3 中，压缩后的总大小为 49GB。让我们逐步了解如何将其插入到 ClickHouse 中。

:::note
下面的查询是在 **生产** 实例的 ClickHouse Cloud 上执行的。有关更多信息，请参见
["Playground specifications"](/getting-started/playground#specifications).
:::

## 加载数据集 {#loading-the-dataset}

1. 在不将数据插入 ClickHouse 的情况下，我们可以直接查询它。让我们抓取一些行，以查看它们的样子：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet')
LIMIT 3
```

这些行看起来像：

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

2. 让我们定义一个名为 `amazon_reviews` 的新 `MergeTree` 表，以在 ClickHouse 中存储这些数据：

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

3. 以下 `INSERT` 命令使用 `s3Cluster` 表函数，允许使用集群的所有节点并行处理多个 S3 文件。我们还使用通配符插入任何以 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet` 开头的文件：

```sql
INSERT INTO amazon.amazon_reviews SELECT *
FROM s3Cluster('default', 
'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet')
```

:::tip
在 ClickHouse Cloud 中，集群的名称是 `default`。如果没有集群，将 `default` 更改为您集群的名称……或者使用 `s3` 表函数（而不是 `s3Cluster`）。
:::

5. 该查询的时间不长——平均约 30 万行每秒。大约 5 分钟内，您应该会看到所有行插入：

```sql runnable
SELECT formatReadableQuantity(count())
FROM amazon.amazon_reviews
```

6. 让我们查看一下我们的数据占用了多少空间：

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

原始数据大约为 70GB，但在 ClickHouse 中压缩后占用大约 30GB。

## 示例查询 {#example-queries}

7. 让我们运行一些查询。以下是数据集中前 10 条最有帮助的评论：

```sql runnable
SELECT
    product_title,
    review_headline
FROM amazon.amazon_reviews
ORDER BY helpful_votes DESC
LIMIT 10
```

:::note
该查询使用了一个 [projection](/data-modeling/projections) 来加速性能。
:::

8. 这是在亚马逊上评论最多的前 10 种产品：

```sql runnable
SELECT
    any(product_title),
    count()
FROM amazon.amazon_reviews
GROUP BY product_id
ORDER BY 2 DESC
LIMIT 10;
```

9. 这是每个产品每月的平均评价评分（实际的 [亚马逊面试问题](https://datalemur.com/questions/sql-avg-review-ratings)!）：

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

10. 这是每个产品类别的投票总数。该查询速度很快，因为 `product_category` 在主键中：

```sql runnable
SELECT
    sum(total_votes),
    product_category
FROM amazon.amazon_reviews
GROUP BY product_category
ORDER BY 1 DESC
```

11. 让我们找出在评论中出现“**awful**”这个词频率最高的产品。这是一项大任务——需要解析超过 1.51 亿个字符串以寻找一个单词：

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

注意对于如此大量数据的查询时间。结果也非常有趣！

12. 我们可以再次运行相同的查询，这次在评论中搜索 **awesome**：

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
