---
'slug': '/best-practices/choosing-a-primary-key'
'sidebar_position': 10
'sidebar_label': '选择主键'
'title': '选择主键'
'description': '页面描述如何在 ClickHouse 中选择主键'
'keywords':
- 'primary key'
'show_related_blogs': true
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> 我们在本页中互换使用“排序键（ordering key）”一词来指代“主键（primary key）”。严格来说，[在 ClickHouse 中它们有所不同](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key)，但为了本文档的目的，读者可以互换使用这两个术语，其中排序键指的是在表中指定的 `ORDER BY` 列。

注意，ClickHouse 的主键与熟悉 OLTP 数据库（如 Postgres）中类似术语的用户 [非常不同](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse)。

在 ClickHouse 中选择有效的主键对于查询性能和存储效率至关重要。ClickHouse 将数据组织成分片，每个分片包含其自身的稀疏主索引。此索引通过减少扫描的数据量显著加快查询速度。此外，由于主键决定了磁盘上数据的物理顺序，它直接影响压缩效率。优化排序的数据可以更有效地压缩，从而通过减少 I/O 进一步提高性能。

1. 在选择排序键时，优先考虑在查询过滤器（即 `WHERE` 子句）中频繁使用的列，尤其是那些排除大量行的列。
2. 与表中其他数据高度相关的列也是有益的，因为连续存储可提高压缩率和 `GROUP BY` 和 `ORDER BY` 操作期间的内存效率。
<br/>
可以应用一些简单的规则来帮助选择排序键。以下规则有时可能会出现冲突，因此请按顺序考虑这些规则。**用户可以通过此过程识别多个键，通常 4-5 个即可**：

:::note 重要
排序键必须在表创建时定义，无法在之后添加。可以通过称为投影的功能在数据插入之后（或之前）向表中添加额外的排序键。请注意，这会导致数据重复。更多细节 [请参见这里](/sql-reference/statements/alter/projection)。
:::

## 示例 {#example}

考虑以下 `posts_unordered` 表。该表每行对应 Stack Overflow 的一篇帖子。

该表没有主键 - 正如 `ORDER BY tuple()` 所指示的那样。

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

假设用户希望计算 2024 年之后提交的问题数量，这代表了他们最常见的访问模式。

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

请注意此查询读取的行数和字节数。没有主键，查询必须扫描整个数据集。

使用 `EXPLAIN indexes=1` 确认由于缺乏索引而导致的完整表扫描。

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

假设一个名为 `posts_ordered` 的表，包含相同数据，定义的 `ORDER BY` 为 `(PostTypeId, toDate(CreationDate))`，即

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

`PostTypeId` 的基数为 8，是排序键中第一个条目的逻辑选择。认识到日期粒度过滤可能是足够的（它仍然可以受益于日期时间过滤），因此我们使用 `toDate(CreationDate)` 作为我们的键的第二个组件。这也会产生更小的索引，因为日期可以用 16 位表示，从而加快过滤速度。

以下动画展示了如何为 Stack Overflow 帖子表创建一个优化的稀疏主索引。索引不是针对单独的行，而是针对行块：

<Image img={create_primary_key} size="lg" alt="Primary key" />

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

此查询现在利用稀疏索引，显著减少了读取的数据量，并将执行时间提高了 4 倍 - 请注意读取的行数和字节的减少。

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

此外，我们可以可视化稀疏索引如何修剪所有不能包含匹配项的行块：

<Image img={primary_key} size="lg" alt="Primary key" />

:::note
表中所有列将根据指定排序键的值进行排序，无论它们是否包含在键中。例如，如果将 `CreationDate` 用作键，则所有其他列中的值的顺序将与 `CreationDate` 列中的值的顺序相对应。可以指定多个排序键 - 这将与 `SELECT` 查询中的 `ORDER BY` 子句具有相同的语义进行排序。
:::

关于选择主键的完整高级指南可以在 [这里](/guides/best-practices/sparse-primary-indexes) 找到。

有关排序键如何改善压缩并进一步优化存储的更深入见解，请探索有关 [ClickHouse 中的压缩](/data-compression/compression-in-clickhouse) 和 [列压缩编解码器](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) 的官方指南。
