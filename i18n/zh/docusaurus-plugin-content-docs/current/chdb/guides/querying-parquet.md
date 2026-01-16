---
title: '如何查询 Parquet 文件'
sidebar_label: '查询 Parquet 文件'
slug: /chdb/guides/querying-parquet
description: '了解如何使用 chDB 查询 Parquet 文件。'
keywords: ['chdb', 'parquet']
doc_type: 'guide'
---

全球有大量数据存储在 Amazon S3 存储桶中。
在本指南中，我们将学习如何使用 chDB 查询这些数据。

## 设置 \\{#setup\\}

首先，创建一个虚拟环境：

```bash
python -m venv .venv
source .venv/bin/activate
```

接下来我们将安装 chDB。
请确保已安装的版本为 2.0.2 或更高：

```bash
pip install "chdb>=2.0.2"
```

接下来我们来安装 IPython：

```bash
pip install ipython
```

在本指南接下来的内容中，我们将使用 `ipython` 来运行命令。你可以通过执行以下命令来启动它：

```bash
ipython
```

你也可以在 Python 脚本或常用的 Notebook 中使用这段代码。

## 探索 Parquet 元数据 \\{#exploring-parquet-metadata\\}

我们将探索一个来自 [Amazon Reviews](/getting-started/example-datasets/amazon-reviews) 数据集的 Parquet 文件。
但在此之前，先安装 `chDB`：

```python
import chdb
```

在查询 Parquet 文件时，我们可以使用 [`ParquetMetadata`](/interfaces/formats/ParquetMetadata) 输入格式，从而返回 Parquet 元数据而不是文件内容。
让我们使用 `DESCRIBE` 子句来查看在使用此格式时返回的字段：

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

现在我们来查看一下该文件的元数据。
`columns` 和 `row_groups` 都是由包含许多属性的元组组成的数组，因此我们暂时不予展开。

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

从这个输出中可以看出，该 Parquet 文件包含超过 4,000 万行数据，被划分为 42 个行组，每行有 15 列数据。
行组是对数据按行进行的逻辑水平分区。
每个行组都有对应的元数据，查询工具可以利用这些元数据高效地查询该文件。

我们来看一下其中一个行组：

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

## 查询 Parquet 文件 \\{#querying-parquet-files\\}

接下来，让我们来查询该文件的内容。
我们可以通过调整上面的查询来移除 `ParquetMetadata`，然后例如计算所有评论中最常见的 `star_rating`：

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

有意思的是，5 星评价的数量比其他所有评分加起来还多！
看起来大家要么很喜欢亚马逊上的商品，要么如果不喜欢，就干脆不评分。
