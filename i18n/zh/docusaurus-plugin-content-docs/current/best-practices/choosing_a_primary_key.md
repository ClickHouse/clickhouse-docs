---
'slug': '/best-practices/choosing-a-primary-key'
'sidebar_position': 10
'sidebar_label': '选择主键'
'title': '选择主键'
'description': '页面描述如何在 ClickHouse 中选择主键'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> 我们在此页面中交替使用“ordering key”一词来指代“主键”。严格来说，[在 ClickHouse 中它们是不同的](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key)，但为了本文件的目的，读者可以将其互换使用，其中 ordering key 指的是在表 `ORDER BY` 中指定的列。

请注意，ClickHouse 主键与那些熟悉 OLTP 数据库（如 Postgres）中的类似术语的人有很大的不同，具体表现为[非常不同](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse)。

在 ClickHouse 中选择有效的主键对于查询性能和存储效率至关重要。ClickHouse 将数据组织成多个部分，每个部分包含自己的稀疏主索引。这个索引通过减少扫描的数据量显著加速查询。另外，由于主键决定了磁盘上数据的物理顺序，因此它直接影响压缩效率。最佳排序的数据能更有效地压缩，进而通过减少 I/O 来进一步增强性能。

1. 在选择排序键时，优先考虑经常用于查询过滤器（即 `WHERE` 子句）的列，特别是那些排除大量行的列。
2. 与表中其他数据高度相关的列也很有益，因为连续存储会在 `GROUP BY` 和 `ORDER BY` 操作期间改善压缩比和内存效率。
<br/>
可以应用一些简单规则来帮助选择排序键。以下规则有时可能会相互冲突，因此按顺序考虑这些规则。**用户可以从这个过程中识别出多个键，通常4-5个就足够了**：

:::note 重要
排序键必须在创建表时定义，无法添加。可以通过一种称为投影的功能在（或之前）数据插入后向表添加额外的排序。请注意，这会导致数据重复。进一步详情请见 [这里](/sql-reference/statements/alter/projection)。
:::

## 示例 {#example}

考虑以下 `posts_unordered` 表。该表每行代表一个 Stack Overflow 帖子。

该表没有主键 - 通过 `ORDER BY tuple()` 表示。

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

假设用户希望计算 2024 年后提交的问题数量，这代表他们最常见的访问模式。

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

注意此查询读取的行数和字节数。没有主键时，查询必须扫描整个数据集。

使用 `EXPLAIN indexes=1` 确认了由于缺乏索引而导致全表扫描的情况。

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

假设定义了一个表 `posts_ordered`，该表包含相同的数据，`ORDER BY` 定义为 `(PostTypeId, toDate(CreationDate))`，即

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

`PostTypeId` 的基数为 8，是我们排序键首个条目的合理选择。考虑到日期粒度过滤可能足够（它依然会从日期时间过滤中受益），因此我们使用 `toDate(CreationDate)` 作为键的第二个组成部分。这也将产生一个较小的索引，因为日期可以用 16 位表示，从而加速过滤。

以下动画展示了为 Stack Overflow 帖子表创建优化的稀疏主索引的过程。索引不再是针对单独的行，而是针对行的块：

<Image img={create_primary_key} size="lg" alt="主键" />

如果在具有此排序键的表上重复相同的查询：

```sql
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 row in set. Elapsed: 0.013 sec. Processed 196.53 thousand rows, 1.77 MB (14.64 million rows/s., 131.78 MB/s.)
```

此查询现在利用稀疏索引，显著减少读取的数据量，并将执行时间缩短了 4 倍 - 注意读取的行数和字节数减少。

可以使用 `EXPLAIN indexes=1` 确认索引的使用。

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
```

此外，我们可以可视化如何通过稀疏索引修剪出无法包含匹配项的所有行块：

<Image img={primary_key} size="lg" alt="主键" />

:::note
表中的所有列都将根据指定排序键的值进行排序，无论它们是否包括在键中。例如，如果 `CreationDate` 被用作键，则所有其他列中的值顺序将与 `CreationDate` 列中的值顺序相对应。可以指定多个排序键 - 这将按照与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义进行排序。
:::

有关选择主键的完整高级指南，请参见 [这里](/guides/best-practices/sparse-primary-indexes)。

有关排序键如何改善压缩和进一步优化存储的深入见解，请查看官方指南 [ClickHouse 中的压缩](/data-compression/compression-in-clickhouse) 和 [列压缩编解码器](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。
