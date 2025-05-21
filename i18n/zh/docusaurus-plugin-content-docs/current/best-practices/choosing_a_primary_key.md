---
'slug': '/best-practices/choosing-a-primary-key'
'sidebar_position': 10
'sidebar_label': '选择主键'
'title': '选择主键'
'description': '描述在ClickHouse中如何选择主键的页面'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> 我们在本页面中交替使用“ordering key”这一术语来指代“主键”。严格来说，[这在 ClickHouse 中有所不同](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key)，但对于本文档的目的，读者可以交替使用这两个术语，其中 ordering key 指的是在表 `ORDER BY` 中指定的列。

请注意，ClickHouse 的主键与熟悉类似术语的 OLTP 数据库（如 Postgres）[非常不同](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse)。

在 ClickHouse 中选择有效的主键对查询性能和存储效率至关重要。ClickHouse 将数据组织成分区，每个分区包含自己的稀疏主索引。此索引通过减少扫描的数据量显著加快查询速度。此外，由于主键决定了磁盘上数据的物理顺序，它直接影响压缩效率。最佳排序的数据可以更有效地进行压缩，这进一步通过减少 I/O 来提升性能。

1. 在选择 ordering key 时，优先考虑在查询过滤条件中（即 `WHERE` 子句中）频繁使用的列，特别是那些排除大量行的列。
2. 与表中其他数据高度相关的列也很有用，因为连续存储可以在 `GROUP BY` 和 `ORDER BY` 操作中提高压缩比和内存效率。
<br/>
可以应用一些简单的规则来帮助选择 ordering key。以下因素有时可能会产生冲突，因此请按顺序考虑这些因素。 **用户可以从此过程中识别出多个键，通常 4-5 个就足够**：

:::note 注意
ordering keys 必须在表创建时定义，不能后续添加。可以通过称为 projections 的功能在数据插入后（或之前）向表添加额外的排序。但要注意，这会导致数据重复。更多详细信息 [请参见这里](/sql-reference/statements/alter/projection)。
:::

## 示例 {#example}

考虑以下 `posts_unordered` 表。它包含每个 Stack Overflow 帖子的一行。

该表没有主键 - 如 `ORDER BY tuple()` 所示。

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

假设用户希望计算 2024 年后提交的问题数量，这代表了他们最常见的访问模式。

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

请注意此查询读取的行数和字节数。没有主键的情况下，查询必须扫描整个数据集。

使用 `EXPLAIN indexes=1` 确认由于缺乏索引而进行全表扫描。

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

假设定义了一个表 `posts_ordered`，它包含相同的数据，并将 `ORDER BY` 定义为 `(PostTypeId, toDate(CreationDate))`，即：

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

`PostTypeId` 的基数为 8，代表着我们 ordering key 的第一个条目是逻辑选择。认识到日期粒度过滤可能是足够的（它仍然会受益于日期时间过滤），因此我们使用 `toDate(CreationDate)` 作为我们键的第二个组件。这也会产生更小的索引，因为日期可以用 16 位表示，从而加速过滤。

以下动画展示了如何为 Stack Overflow 帖子表创建优化的稀疏主索引。此索引针对的是行块，，而不是单个行进行索引：

<Image img={create_primary_key} size="lg" alt="主键" />

如果在具有此 ordering key 的表上重复相同的查询：

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

此查询现在利用了稀疏索引，显著减少了读取的数据量，并将执行时间提升了 4 倍 - 请注意行数和读取字节数的减少。

使用 `EXPLAIN indexes=1` 可以确认索引的使用。

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

此外，我们可视化稀疏索引如何修剪所有可能不包含匹配的行块，以满足我们的示例查询：

<Image img={primary_key} size="lg" alt="主键" />

:::note
所有列将基于指定 ordering key 的值进行排序，无论它们是否包含在键中。例如，如果 `CreationDate` 被用作键，则所有其他列中值的顺序将与 `CreationDate` 列中值的顺序相对应。可以指定多个 ordering keys - 这将以与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义进行排序。
:::

关于如何选择主键的完整高级指南可以在 [这里]( /guides/best-practices/sparse-primary-indexes) 找到。

有关如何提高压缩和进一步优化存储的深入见解，请探索公式指南 [ClickHouse 中的压缩](/data-compression/compression-in-clickhouse) 和 [列压缩编码](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec)。
