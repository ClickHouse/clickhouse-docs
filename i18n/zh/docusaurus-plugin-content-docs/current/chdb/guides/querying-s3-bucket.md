---
title: '如何查询 S3 存储桶中的数据'
sidebar_label: '在 S3 中查询数据'
slug: /chdb/guides/querying-s3
description: '了解如何使用 chDB 查询 S3 存储桶中的数据。'
keywords: ['chdb', 's3']
doc_type: 'guide'
---

世界上的大量数据都存储在 Amazon S3 存储桶中。
在本指南中，我们将学习如何使用 chDB 查询这些数据。



## 设置 {#setup}

首先创建一个虚拟环境:

```bash
python -m venv .venv
source .venv/bin/activate
```

然后安装 chDB。
请确保版本为 2.0.2 或更高:

```bash
pip install "chdb>=2.0.2"
```

接下来安装 IPython:

```bash
pip install ipython
```

本指南后续部分将使用 `ipython` 来运行命令,可以通过以下方式启动:

```bash
ipython
```

您也可以在 Python 脚本或您常用的 notebook 中使用这些代码。


## 列出 S3 存储桶中的文件 {#listing-files-in-an-s3-bucket}

让我们从列出[包含 Amazon 评论数据的 S3 存储桶](/getting-started/example-datasets/amazon-reviews)中的所有文件开始。
为此,我们可以使用 [`s3` 表函数](/sql-reference/table-functions/s3),并传入文件路径或使用通配符来匹配一组文件。

:::tip
如果仅传入存储桶名称,将会抛出异常。
:::

我们还将使用 [`One`](/interfaces/formats/One) 输入格式,这样文件不会被解析,而是每个文件返回一行数据,我们可以通过 `_file` 虚拟列访问文件名,通过 `_path` 虚拟列访问路径。

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

此存储桶仅包含 Parquet 文件。


## 查询 S3 存储桶中的文件 {#querying-files-in-an-s3-bucket}

接下来,我们将学习如何查询这些文件。
如果要统计每个文件的行数,可以运行以下查询:

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

我们也可以传入 S3 存储桶的 HTTP URI,将获得相同的结果:

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

接下来使用 `DESCRIBE` 子句查看这些 Parquet 文件的架构:

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

现在我们根据评论数量计算排名靠前的产品类别,并计算平均星级评分:

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
 1. │ 玩具             │  4864056 │ 4.21 │
 2. │ 服装             │  5906085 │ 4.11 │
 3. │ 箱包             │   348644 │ 4.22 │
 4. │ 厨房用品         │  4880297 │ 4.21 │
 5. │ 图书             │ 19530930 │ 4.34 │
 6. │ 户外用品         │  2302327 │ 4.24 │
 7. │ 影音             │   380596 │ 4.19 │
 8. │ 食品杂货         │  2402365 │ 4.31 │
 9. │ 鞋类             │  4366757 │ 4.24 │
10. │ 珠宝首饰         │  1767667 │ 4.14 │
    └──────────────────┴──────────┴──────┘
```


## 查询私有 S3 存储桶中的文件 {#querying-files-in-a-private-s3-bucket}

如果要查询私有 S3 存储桶中的文件,需要传入访问密钥和密文。
可以将这些凭证传递给 `s3` 表函数:

```python
chdb.query("""
SELECT product_category, count() AS reviews, round(avg(star_rating), 2) as avg
FROM s3('s3://datasets-documentation/amazon_reviews/*.parquet', 'access-key', 'secret')
GROUP BY ALL
LIMIT 10
""", 'PrettyCompact')
```

:::note
此查询无法运行,因为这是一个公共存储桶!
:::

另一种方法是使用[命名集合](/operations/named-collections),但 chDB 目前尚不支持此方法。
