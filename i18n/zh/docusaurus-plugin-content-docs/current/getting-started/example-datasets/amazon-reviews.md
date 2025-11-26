---
description: '超过 1.5 亿条 Amazon 商品的客户评论'
sidebar_label: 'Amazon 客户评论'
slug: /getting-started/example-datasets/amazon-reviews
title: 'Amazon 客户评论'
doc_type: 'guide'
keywords: ['Amazon reviews', 'customer reviews dataset', 'e-commerce data', 'example dataset', 'getting started']
---

该数据集包含超过 1.5 亿条 Amazon 商品的客户评论。数据以存储在 AWS S3 中的 snappy 压缩 Parquet 文件形式提供，压缩后总大小为 49GB。下面我们逐步演示如何将其导入 ClickHouse。

:::note
下面的查询是在 **Production** 环境的 ClickHouse Cloud 实例上执行的。更多信息请参阅
["Playground 规格说明"](/getting-started/playground#specifications)。
:::

## 加载数据集

1. 在不将数据插入 ClickHouse 的情况下，我们可以直接在原处对其进行查询。先取出几行数据，看看它们的样子：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet')
LIMIT 3
```

这些行如下所示：

```response
行 1:
──────
review_date:       16462
marketplace:       US
customer_id:       25444946 -- 2544 万
review_id:         R146L9MMZYG0WA
product_id:        B00NV85102
product_parent:    908181913 -- 9.08 亿
product_title:     XIKEZAN iPhone 6 Plus 5.5 inch Waterproof Case, Shockproof Dirtproof Snowproof Full Body Skin Case Protective Cover with Hand Strap & Headphone Adapter & Kickstand
product_category:  Wireless
star_rating:       4
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   case is sturdy and protects as I want
review_body:       I won't count on the waterproof part (I took off the rubber seals at the bottom because the got on my nerves). But the case is sturdy and protects as I want.

行 2:
──────
review_date:       16462
marketplace:       US
customer_id:       1974568 -- 197 万
review_id:         R2LXDXT293LG1T
product_id:        B00OTFZ23M
product_parent:    951208259 -- 9.51 亿
product_title:     Season.C Chicago Bulls Marilyn Monroe No.1 Hard Back Case Cover for Samsung Galaxy S5 i9600
product_category:  Wireless
star_rating:       1
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   One Star
review_body:       Cant use the case because its big for the phone. Waist of money!

行 3:
──────
review_date:       16462
marketplace:       US
customer_id:       24803564 -- 2480 万
review_id:         R7K9U5OEIRJWR
product_id:        B00LB8C4U4
product_parent:    524588109 -- 5.25 亿
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

2. 让我们在 ClickHouse 中定义一个名为 `amazon_reviews` 的新 `MergeTree` 表来存储这些数据：

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

3. 下面的 `INSERT` 命令使用了 `s3Cluster` 表函数，它可以利用集群中所有节点并行处理多个 S3 文件。我们还使用通配符来插入所有名称以 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet` 开头的文件：

```sql
INSERT INTO amazon.amazon_reviews SELECT *
FROM s3Cluster('default', 
'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet')
```


:::tip
在 ClickHouse Cloud 中，集群名称为 `default`。请将 `default` 更改为你的集群名称……或者如果你没有集群，可以使用 `s3` 表函数（而不是 `s3Cluster`）。
:::

5. 该查询执行时间很短——平均每秒大约处理 300,000 行数据。大约 5 分钟内你就应该能看到所有行都已插入：

```sql runnable
SELECT formatReadableQuantity(count())
FROM amazon.amazon_reviews
```

6. 查看数据占用的空间大小：

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

原始数据约为 70GB，在 ClickHouse 中压缩后仅占约 30GB。


## 示例查询

7. 现在来运行一些查询。下面是数据集中最有帮助的前 10 条评论：

```sql runnable
SELECT
    product_title,
    review_headline
FROM amazon.amazon_reviews
ORDER BY helpful_votes DESC
LIMIT 10
```

:::note
此查询使用 [projection](/data-modeling/projections) 来提升性能。
:::

8. 以下是在 Amazon 上评论数最多的前 10 款产品：

```sql runnable
SELECT
    any(product_title),
    count()
FROM amazon.amazon_reviews
GROUP BY product_id
ORDER BY 2 DESC
LIMIT 10;
```

9. 以下是每个产品每个月的平均评论评分（这是一道真实的 [Amazon 求职面试题](https://datalemur.com/questions/sql-avg-review-ratings)！）：

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

10. 以下是每个产品类别的总投票数。该查询速度很快，因为 `product_category` 是主键的一部分：

```sql runnable
SELECT
    sum(total_votes),
    product_category
FROM amazon.amazon_reviews
GROUP BY product_category
ORDER BY 1 DESC
```

11. 让我们查找在评论中 **&quot;awful&quot;** 这个单词出现最频繁的产品。这是一个很大的任务——需要解析超过 1.51 亿个字符串，只为查找这一个单词：

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

注意观察针对如此大规模数据的查询耗时。查询结果本身读起来也很有趣！

12. 我们可以再次运行相同的查询，不过这一次在评论中搜索 **awesome**：

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
