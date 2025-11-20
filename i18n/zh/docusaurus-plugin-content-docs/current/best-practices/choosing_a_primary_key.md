---
slug: /best-practices/choosing-a-primary-key
sidebar_position: 10
sidebar_label: '选择主键'
title: '选择主键'
description: '介绍如何在 ClickHouse 中选择主键'
keywords: ['primary key']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> 在本页中,我们交替使用&quot;排序键&quot;和&quot;主键&quot;这两个术语。严格来说,[这两者在 ClickHouse 中是有区别的](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key),但在本文档中,读者可以将它们视为等同,排序键指的是表 `ORDER BY` 中指定的列。

请注意,ClickHouse 主键的工作原理与 OLTP 数据库(如 Postgres)中的同名概念[截然不同](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse)。

在 ClickHouse 中选择有效的主键对查询性能和存储效率至关重要。ClickHouse 将数据组织为多个数据分片(part),每个分片都包含自己的稀疏主索引。该索引通过减少需要扫描的数据量来显著加快查询速度。此外,由于主键决定了数据在磁盘上的物理排列顺序,因此直接影响压缩效率。排序优化的数据能够实现更高效的压缩,从而通过减少 I/O 操作进一步提升性能。

1. 选择排序键时,应优先考虑在查询过滤条件(即 `WHERE` 子句)中频繁使用的列,尤其是那些能够过滤掉大量数据行的列。
2. 与表中其他数据高度相关的列同样有益,因为连续存储可以提高压缩率,并在执行 `GROUP BY` 和 `ORDER BY` 操作时提升内存使用效率。

<br />

可以应用一些简单的规则来帮助选择排序键。以下规则有时可能相互冲突,因此请按顺序考虑。**用户可以通过此流程确定多个候选键,通常 4-5 个即可满足需求**:

:::note 重要提示
排序键必须在创建表时定义,且无法后续添加。可以通过投影(projection)功能在数据插入之后(或之前)为表添加额外的排序方式。请注意,这会导致数据重复存储。更多详情请参见[此处](/sql-reference/statements/alter/projection)。
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

注意此查询读取的行数和字节数。如果没有主键,查询必须扫描整个数据集。

使用 `EXPLAIN indexes=1` 可以确认由于缺少索引而进行了全表扫描。

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

`PostTypeId` 的基数为 8,是排序键第一个条目的合理选择。考虑到日期粒度过滤通常已经足够(它仍然能够优化日期时间过滤),因此我们使用 `toDate(CreationDate)` 作为键的第二个组成部分。这还将生成更小的索引,因为日期可以用 16 位表示,从而加快过滤速度。

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
1 row in set. 耗时：0.013 秒。已处理 19.65 万行，1.77 MB（1464 万行/秒，131.78 MB/秒）

````

此查询现在利用稀疏索引,显著减少了数据读取量,执行时间提升了 4 倍——注意读取的行数和字节数均有所减少。 

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

此外,我们通过可视化展示稀疏索引如何剪枝所有不可能包含示例查询匹配结果的行块:

<Image img={primary_key} size="lg" alt="主键" />

:::note
表中的所有列都将根据指定排序键的值进行排序,无论这些列是否包含在排序键中。例如,如果使用 `CreationDate` 作为排序键,则所有其他列中值的顺序将与 `CreationDate` 列中值的顺序保持一致。可以指定多个排序键——排序语义与 `SELECT` 查询中的 `ORDER BY` 子句相同。
:::

关于如何选择主键的完整高级指南,请参阅[此处](/guides/best-practices/sparse-primary-indexes)。

要深入了解排序键如何提升压缩效果并进一步优化存储,请参阅官方指南 [ClickHouse 中的压缩](/data-compression/compression-in-clickhouse)和[列压缩编解码器](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。
