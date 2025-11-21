---
title: '如何查询 Parquet 文件'
sidebar_label: '查询 Parquet 文件'
slug: /chdb/guides/querying-parquet
description: '了解如何使用 chDB 查询 Parquet 文件。'
keywords: ['chdb', 'parquet']
doc_type: 'guide'
---

世界上大量数据存放在 Amazon S3 存储桶中。
在本指南中，我们将介绍如何使用 chDB 查询这些数据。



## 设置 {#setup}

首先创建一个虚拟环境:

```bash
python -m venv .venv
source .venv/bin/activate
```

接下来安装 chDB。
请确保版本为 2.0.2 或更高版本:

```bash
pip install "chdb>=2.0.2"
```

然后安装 IPython:

```bash
pip install ipython
```

本指南后续部分将使用 `ipython` 来运行命令,可以通过以下方式启动:

```bash
ipython
```

您也可以在 Python 脚本或您常用的 notebook 中使用这些代码。


## 探索 Parquet 元数据 {#exploring-parquet-metadata}

我们将探索 [Amazon reviews](/getting-started/example-datasets/amazon-reviews) 数据集中的一个 Parquet 文件。
首先，让我们安装 `chDB`：

```python
import chdb
```

查询 Parquet 文件时,我们可以使用 [`ParquetMetadata`](/interfaces/formats/ParquetMetadata) 输入格式来返回 Parquet 元数据,而不是文件内容。
让我们使用 `DESCRIBE` 子句查看使用此格式时返回的字段:

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

现在让我们查看该文件的元数据。
`columns` 和 `row_groups` 都包含具有多个属性的元组数组,因此我们暂时排除它们。

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

从此输出可以看出,该 Parquet 文件包含超过 4000 万行数据,分布在 42 个行组中,每行包含 15 列数据。
行组是将数据按行进行逻辑水平分区的单位。
每个行组都有关联的元数据,查询工具可以利用这些元数据高效地查询文件。

让我们查看其中一个行组:

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
                 名称  总压缩大小  总未压缩大小                                                最小值                                                最大值
0         评论日期                    493                      646                                              16455                                              16472
1         市场                     66                       64                                                 US                                                 US
2         客户ID                5207967                  7997207                                              10049                                           53096413
3           评论ID               14748425                 17991290                                     R10004U8OQDOGE                                      RZZZUTBAV1RYI
4          产品ID                8003456                 13969668                                         0000032050                                         BT00DDVMVQ
5      父产品                5758251                  7974737                                                645                                          999999730
6       产品标题               41068525                 63355320  ! Small S 1pc Black 1pc Navy (Blue) Replacemen...                            🌴 Vacation On The Beach
7    产品类别                   1726                     1815                                            服装                                       宠物用品
8         星级评分                 369036                   374046                                                  1                                                  5
9       有用投票数                 538940                  1022990                                                  0                                               3440
10        总投票数                 610902                  1080520                                                  0                                               3619
11               Vine会员                  11426                   125999                                                  0                                                  1
12  已验证购买                 102634                   125999                                                  0                                                  1
13    评论标题               16538189                 27634740                                                     🤹🏽‍♂️🎤Great product. Practice makes perfect. D...
14        评论正文              145886383                232457911                                                                                              🚅 +🐧=💥 😀
```


## 查询 Parquet 文件 {#querying-parquet-files}

接下来,让我们查询文件的内容。
我们可以通过调整上述查询来移除 `ParquetMetadata`,然后计算所有评论中最常见的 `star_rating`:

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

有趣的是,5 星评论的数量比所有其他评分加起来还要多!
看起来人们喜欢亚马逊上的产品,或者即使不喜欢,他们也不会提交评分。
