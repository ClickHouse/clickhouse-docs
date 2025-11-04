---
'slug': '/best-practices/choosing-a-primary-key'
'sidebar_position': 10
'sidebar_label': '选择主键'
'title': '选择主键'
'description': '页面描述如何在 ClickHouse 中选择主键'
'keywords':
- 'primary key'
'show_related_blogs': true
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> 我们在此页面上交替使用“ordering key”这个术语来指代“primary key”。严格来说， [这在 ClickHouse 中是不同的](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key)，但出于本文档的目的，读者可以将它们互换使用，其中 ordering key 指的是在表格 `ORDER BY` 中指定的列。

注意，ClickHouse 的主键与那些熟悉类似术语的 OLTP 数据库（例如 Postgres）的人有 [非常不同的工作方式](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse)。

在 ClickHouse 中选择有效的主键对查询性能和存储效率至关重要。ClickHouse 将数据组织成 parts，每个 part 都包含自己的稀疏主索引。该索引通过减少扫描的数据量显著加快查询速度。此外，由于主键决定了磁盘上数据的物理顺序，这直接影响压缩效率。最佳顺序的数据会更有效地压缩，这进一步通过减少 I/O 来提高性能。

1. 在选择 ordering key 时，优先考虑在查询过滤器中（即 `WHERE` 子句）常用的列，尤其是那些排除大量行的列。
2. 与表中其他数据高度相关的列也很有益，因为连续存储能够提高压缩比和在 `GROUP BY` 和 `ORDER BY` 操作中的内存效率。
<br/>
一些简单的规则可以帮助选择 ordering key。以下规则有时可能会发生冲突，因此请按照顺序考虑这些规则。 **用户可以从此过程中识别出多个键，通常 4-5 个就足够了**：

:::note Important
ordering keys 必须在表创建时定义，并且无法添加。可以通过称为 projections 的功能在数据插入后（或之前）向表中添加额外的 ordering。请注意这会导致数据重复。更多详细信息请点击 [这里](/sql-reference/statements/alter/projection)。
:::

## 示例 {#example}

考虑以下 `posts_unordered` 表。每行为一个 Stack Overflow 帖子。

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

假设用户希望计算在 2024 年之后提交的问题数量，这将代表他们最常见的访问模式。

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

注意该查询读取的行数和字节数。没有主键的情况下，查询必须扫描整个数据集。

使用 `EXPLAIN indexes=1` 确认由于缺乏索引而导致的全表扫描。

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

假设定义了一个包含相同数据的表 `posts_ordered`，其 `ORDER BY` 定义为 `(PostTypeId, toDate(CreationDate))` 即

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

`PostTypeId` 的基数为 8，是我们 ordering key 的逻辑首选项。考虑到日期粒度过滤可能会足够（它仍然会受益于日期时间过滤），我们使用 `toDate(CreationDate)` 作为我们键的第二个组成部分。这也将产生一个较小的索引，因为日期可以用 16 位表示，从而加快过滤速度。

以下动画展示了如何为 Stack Overflow 帖子表创建优化的稀疏主索引。索引不针对单个行，而是针对行块：

<Image img={create_primary_key} size="lg" alt="Primary key" />

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

此查询现在利用稀疏索引，显著减少了读取的数据量，并将执行时间加快了 4 倍 - 注意行数和字节数的减少。

可以通过 `EXPLAIN indexes=1` 确认索引的使用。

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

此外，我们可视化了稀疏索引如何修剪掉所有无法包含示例查询匹配的行块：

<Image img={primary_key} size="lg" alt="Primary key" />

:::note
表中的所有列将基于指定 ordering key 的值进行排序，而无论它们是否包含在密钥本身中。例如，如果 `CreationDate` 被用作键，则所有其他列中值的顺序将与 `CreationDate` 列中值的顺序对应。可以指定多个 ordering keys - 这将按与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义进行排序。
:::

有关选择主键的完整高级指南，请点击 [这里](/guides/best-practices/sparse-primary-indexes)。

要深入了解 ordering keys 如何改进压缩并进一步优化存储，请查看有关 [ClickHouse 中的压缩](/data-compression/compression-in-clickhouse) 和 [列压缩编码器](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) 的官方指南。
