---
description: '超过 1.5 亿条 Amazon 商品的客户评价'
sidebar_label: 'Amazon 客户评价'
slug: /getting-started/example-datasets/amazon-reviews
title: 'Amazon 客户评价'
doc_type: 'guide'
keywords: ['Amazon reviews', 'customer reviews dataset', 'e-commerce data', 'example dataset', 'getting started']
---

该数据集包含超过 1.5 亿条 Amazon 商品的客户评价。数据以 Snappy 压缩的 Parquet 文件形式存储在 AWS S3 中，压缩后总大小为 49GB。下面将逐步演示如何将其导入 ClickHouse。

:::note
下面的查询是在 ClickHouse Cloud 的 **Production** 实例上执行的。更多信息请参阅
["Playground 规格说明"](/getting-started/playground#specifications)。
:::



## 加载数据集 {#loading-the-dataset}

1. 无需将数据插入 ClickHouse,我们可以直接查询。让我们获取一些行数据,看看它们的内容:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet')
LIMIT 3
```

行数据如下:

```response
Row 1:
──────
review_date:       16462
marketplace:       US
customer_id:       25444946 -- 2544 万
review_id:         R146L9MMZYG0WA
product_id:        B00NV85102
product_parent:    908181913 -- 9.0818 亿
product_title:     XIKEZAN iPhone 6 Plus 5.5 inch Waterproof Case, Shockproof Dirtproof Snowproof Full Body Skin Case Protective Cover with Hand Strap & Headphone Adapter & Kickstand
product_category:  Wireless
star_rating:       4
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   保护壳坚固,符合我的保护需求
review_body:       我不指望防水功能(我把底部的橡胶密封条拆掉了,因为它们让我很烦)。但保护壳很坚固,符合我的保护需求。

Row 2:
──────
review_date:       16462
marketplace:       US
customer_id:       1974568 -- 197 万
review_id:         R2LXDXT293LG1T
product_id:        B00OTFZ23M
product_parent:    951208259 -- 9.5121 亿
product_title:     Season.C Chicago Bulls Marilyn Monroe No.1 Hard Back Case Cover for Samsung Galaxy S5 i9600
product_category:  Wireless
star_rating:       1
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   一星
review_body:       无法使用这个保护壳,因为它对手机来说太大了。浪费钱!

Row 3:
──────
review_date:       16462
marketplace:       US
customer_id:       24803564 -- 2480 万
review_id:         R7K9U5OEIRJWR
product_id:        B00LB8C4U4
product_parent:    524588109 -- 5.2459 亿
product_title:     iPhone 5s Case, BUDDIBOX [Shield] Slim Dual Layer Protective Case with Kickstand for Apple iPhone 5 and 5s
product_category:  Wireless
star_rating:       4
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   但总体而言这个保护壳相当坚固,为手机提供了良好的保护
review_body:       前面板一开始有点难固定到手机上,但总体而言这个保护壳相当坚固,为手机提供了良好的保护,这正是我所需要的。我会再次购买这个保护壳。
```

2. 让我们定义一个名为 `amazon_reviews` 的新 `MergeTree` 表,用于在 ClickHouse 中存储这些数据:

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

3. 以下 `INSERT` 命令使用 `s3Cluster` 表函数,该函数允许使用集群的所有节点并行处理多个 S3 文件。我们还使用通配符来插入所有以 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet` 命名的文件:

```sql
INSERT INTO amazon.amazon_reviews SELECT *
FROM s3Cluster('default',
'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet')
```


:::tip
在 ClickHouse Cloud 中，集群名称为 `default`。将 `default` 替换为你的集群名称……或者如果你没有集群，可以使用 `s3` 表函数（而不是 `s3Cluster`）。
:::

5. 该查询执行得很快——平均每秒大约 300,000 行。大约 5 分钟内，你就应该能看到所有行都已插入：

```sql runnable
SELECT formatReadableQuantity(count())
FROM amazon.amazon_reviews
```

6. 来看看我们的数据占用多少空间：

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

原始数据大约为 70G，但在 ClickHouse 中压缩后仅占用约 30G。


## 示例查询 {#example-queries}

7. 让我们运行一些查询。以下是数据集中最有帮助的前 10 条评论:

```sql runnable
SELECT
    product_title,
    review_headline
FROM amazon.amazon_reviews
ORDER BY helpful_votes DESC
LIMIT 10
```

:::note
此查询使用了[投影](/data-modeling/projections)来提升性能。
:::

8. 以下是 Amazon 上评论数量最多的前 10 个产品:

```sql runnable
SELECT
    any(product_title),
    count()
FROM amazon.amazon_reviews
GROUP BY product_id
ORDER BY 2 DESC
LIMIT 10;
```

9. 以下是每个产品按月统计的平均评分(这是一道真实的 [Amazon 面试题](https://datalemur.com/questions/sql-avg-review-ratings)!):

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

10. 以下是每个产品类别的总投票数。此查询速度很快,因为 `product_category` 在主键中:

```sql runnable
SELECT
    sum(total_votes),
    product_category
FROM amazon.amazon_reviews
GROUP BY product_category
ORDER BY 1 DESC
```

11. 让我们找出评论中 **"awful"** 一词出现频率最高的产品。这是一项繁重的任务 - 需要解析超过 1.51 亿个字符串来查找单个单词:

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

请注意处理如此大量数据的查询时间。查询结果也很有意思!

12. 我们可以再次运行相同的查询,但这次我们在评论中搜索 **awesome**:

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
