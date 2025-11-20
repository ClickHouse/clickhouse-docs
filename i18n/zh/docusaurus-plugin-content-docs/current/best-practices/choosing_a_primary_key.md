---
slug: /best-practices/choosing-a-primary-key
sidebar_position: 10
sidebar_label: '选择主键'
title: '选择主键'
description: '介绍如何在 ClickHouse 中选择主键的页面'
keywords: ['primary key']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> 在本页中，我们交替使用 “ordering key” 一词来指代 “primary key”。严格来说，[在 ClickHouse 中这两个概念是有区别的](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key)，但在本文档的语境下，读者可以将其视为同义，其中 ordering key 指的是在表的 `ORDER BY` 中指定的列。

请注意，ClickHouse 中的 primary key 与 OLTP 数据库（如 Postgres）中类似术语[在行为上有着非常大的差异](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse)。

在 ClickHouse 中选择一个合适的 primary key 对查询性能和存储效率至关重要。ClickHouse 将数据组织为多个 part，每个 part 都包含自己的稀疏主索引（sparse primary index）。该索引通过减少需要扫描的数据量显著加速查询。此外，由于 primary key 决定了磁盘上数据的物理排序方式，它会直接影响压缩效率。按最佳顺序排列的数据可以被压缩得更好，通过减少 I/O 进一步提升性能。

1. 在选择 ordering key 时，应优先考虑在查询过滤条件（即 `WHERE` 子句）中经常使用的列，尤其是那些能排除大量行的列。
2. 与表中其他数据高度相关的列也很有帮助，因为连续存储可以提升压缩率，并在执行 `GROUP BY` 和 `ORDER BY` 操作时提高内存效率。

<br />

可以遵循一些简单规则来帮助选择 ordering key。下述规则有时会相互冲突，因此请按顺序考虑。**用户可以通过这一过程确定若干键，通常 4–5 个就足够了**：

:::note Important
Ordering key 必须在建表时定义，之后无法新增。可以通过名为 projections 的特性在数据插入之后（或之前）为表添加额外的排序。请注意，这会导致数据重复。更多细节见[此处](/sql-reference/statements/alter/projection)。
:::


## 示例 {#example}

考虑以下 `posts_unordered` 表。该表中每一行对应一个 Stack Overflow 帖子。

该表没有主键 - 由 `ORDER BY tuple()` 表示。

```sql
CREATE TABLE posts_unordered
(
  `Id` Int32,
  `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4,
  'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
  `AcceptedAnswerId` UInt32,
  `CreationDate` DateTime,
  `Score` Int32,
  `ViewCount` UInt32,
  `Body` String,
  `OwnerUserId` Int32,
  `OwnerDisplayName` String,
  `LastEditorUserId` Int32,
  `LastEditorDisplayName` String,
  `LastEditDate` DateTime,
  `LastActivityDate` DateTime,
  `Title` String,
  `Tags` String,
  `AnswerCount` UInt16,
  `CommentCount` UInt8,
  `FavoriteCount` UInt8,
  `ContentLicense`LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime,
  `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
```

假设用户希望计算 2024 年之后提交的问题数量,这是他们最常见的访问模式。

```sql
SELECT count()
FROM stackoverflow.posts_unordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 row in set. Elapsed: 0.055 sec. Processed 59.82 million rows, 361.34 MB (1.09 billion rows/s., 6.61 GB/s.)
```

注意此查询读取的行数和字节数。在没有主键的情况下,查询必须扫描整个数据集。

使用 `EXPLAIN indexes=1` 可以确认由于缺少索引而执行了全表扫描。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts_unordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─explain───────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                 │
│   Aggregating                                             │
│     Expression (Before GROUP BY)                          │
│       Expression                                          │
│         ReadFromMergeTree (stackoverflow.posts_unordered) │
└───────────────────────────────────────────────────────────┘

5 rows in set. Elapsed: 0.003 sec.
```

假设包含相同数据的表 `posts_ordered` 定义了 `ORDER BY` 为 `(PostTypeId, toDate(CreationDate))`,即:

```sql
CREATE TABLE posts_ordered
(
  `Id` Int32,
  `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6,
  'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
...
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate))
```

`PostTypeId` 的基数为 8,是排序键第一个条目的合理选择。考虑到日期粒度的过滤通常已经足够(它仍然能够优化 datetime 过滤),因此我们使用 `toDate(CreationDate)` 作为键的第二个组成部分。这还将生成更小的索引,因为日期可以用 16 位表示,从而加快过滤速度。

以下动画展示了如何为 Stack Overflow 帖子表创建优化的稀疏主索引。索引不是针对单个行,而是针对行块:

<Image img={create_primary_key} size='lg' alt='Primary key' />

如果在具有此排序键的表上重复执行相同的查询:

```sql
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

```


┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 行结果。耗时：0.013 秒。已处理 196.53 千行，1.77 MB（14.64 百万行/秒，131.78 MB/秒）

````

此查询现在利用稀疏索引,显著减少了数据读取量,执行时间提升了 4 倍——注意读取的行数和字节数都有所减少。 

可以通过 `EXPLAIN indexes=1` 确认索引的使用情况。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─explain─────────────────────────────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                                                   │
│   Aggregating                                                                               │
│     Expression (Before GROUP BY)                                                            │
│       Expression                                                                            │
│         ReadFromMergeTree (stackoverflow.posts_ordered)                                     │
│         Indexes:                                                                            │
│           PrimaryKey                                                                        │
│             Keys:                                                                           │
│               PostTypeId                                                                    │
│               toDate(CreationDate)                                                          │
│             Condition: and((PostTypeId in [1, 1]), (toDate(CreationDate) in [19723, +Inf))) │
│             Parts: 14/14                                                                    │
│             Granules: 39/7578                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

13 rows in set. Elapsed: 0.004 sec.
````

此外，我们通过可视化展示稀疏索引是如何裁剪掉所有不可能包含示例查询匹配结果的行块的：

<Image img={primary_key} size="lg" alt="Primary key" />

:::note
表中的所有列都会根据指定排序键的值进行排序，而不论它们是否包含在该键本身中。例如，如果将 `CreationDate` 用作键，则所有其他列中的值顺序将与 `CreationDate` 列中的值顺序相对应。可以指定多个排序键——其排序语义与 `SELECT` 查询中的 `ORDER BY` 子句相同。
:::

关于如何选择主键的完整进阶指南可在[此处](/guides/best-practices/sparse-primary-indexes)查看。

若想深入了解排序键如何提升压缩效果并进一步优化存储，请参阅官方指南：[Compression in ClickHouse](/data-compression/compression-in-clickhouse) 和 [Column Compression Codecs](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。
