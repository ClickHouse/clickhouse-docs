---
description: '超过 1.5 亿条关于 Amazon 商品的客户评论'
sidebar_label: 'Amazon 客户评论'
slug: /getting-started/example-datasets/amazon-reviews
title: 'Amazon 客户评论'
doc_type: 'guide'
keywords: ['Amazon reviews', 'customer reviews dataset', 'e-commerce data', 'example dataset', 'getting started']
---

该数据集包含超过 1.5 亿条关于 Amazon 商品的客户评论。数据以 Snappy 压缩的 Parquet 文件形式存储在 AWS S3 中，压缩后总大小为 49GB。下面将逐步演示如何将其导入 ClickHouse。

:::note
下面的查询是在 **生产环境** 的 ClickHouse Cloud 实例上执行的。更多信息请参见
["Playground 规格说明"](/getting-started/playground#specifications)。
:::



## 加载数据集

1. 无需将数据插入 ClickHouse，我们可以直接在原位置查询它。先获取几行数据，看看它们的实际情况：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet')
LIMIT 3
```

这些行的格式如下：

```response
Row 1:
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
review_headline:   外壳坚固,保护效果符合预期
review_body:       我不指望防水功能(我把底部的橡胶密封条拆了,因为它们让我很烦)。但外壳很坚固,保护效果符合我的预期。

Row 2:
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
review_headline:   一星
review_body:       无法使用这个外壳,因为它对这款手机来说太大了。浪费钱!

Row 3:
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
review_headline:   但总体来说,这个外壳相当坚固,为手机提供了良好的保护
review_body:       前面板一开始有点难固定到手机上,但总体来说,这个外壳相当坚固,为手机提供了良好的保护,这正是我需要的。我会再次购买这个外壳。
```

2. 接下来，我们在 ClickHouse 中定义一个名为 `amazon_reviews` 的新 `MergeTree` 表来存储这些数据：

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

3. 以下 `INSERT` 命令使用 `s3Cluster` 表函数，它允许使用集群中所有节点对多个 S3 文件进行并行处理。我们还使用通配符来插入所有以 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet` 开头的文件：

```sql
INSERT INTO amazon.amazon_reviews SELECT *
FROM s3Cluster('default', 
'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet')
```


:::tip
在 ClickHouse Cloud 中，集群名称为 `default`。请将 `default` 修改为你的集群名称……或者，如果你没有集群，可以使用 `s3` 表函数（而不是 `s3Cluster`）。
:::

5. 该查询执行时间很短——平均每秒约 300,000 行。大约 5 分钟内，你就应该能看到所有行都已插入：

```sql runnable
SELECT formatReadableQuantity(count())
FROM amazon.amazon_reviews
```

6. 查看一下我们的数据占用了多少空间：

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

7. 我们来运行一些查询。下面是该数据集中最有用的前 10 条评论：

```sql runnable
SELECT
    product_title,
    review_headline
FROM amazon.amazon_reviews
ORDER BY helpful_votes DESC
LIMIT 10
```

:::note
此查询使用[投影](/data-modeling/projections)来提升查询性能。
:::

8. 以下是在 Amazon 上评论数最多的前 10 个产品：

```sql runnable
SELECT
    any(product_title),
    count()
FROM amazon.amazon_reviews
GROUP BY product_id
ORDER BY 2 DESC
LIMIT 10;
```

9. 以下是每个产品按月统计的平均评价得分（一道真实的 [亚马逊求职面试题](https://datalemur.com/questions/sql-avg-review-ratings)！）：

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

10. 下面是按产品类别统计的投票总数。该查询之所以很快，是因为 `product_category` 是主键的一部分：

```sql runnable
SELECT
    sum(total_votes),
    product_category
FROM amazon.amazon_reviews
GROUP BY product_category
ORDER BY 1 DESC
```

11. 让我们找出在评论中 **&quot;awful&quot;** 一词出现最频繁的产品。这是一个庞大的任务——需要在超过 1.51 亿条字符串中解析并查找这个单词：

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

注意留意在如此大规模数据下的查询耗时。查询结果本身读起来也很有趣！

12. 我们可以再次运行相同的查询，不过这次在评论中搜索 **awesome**：

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
