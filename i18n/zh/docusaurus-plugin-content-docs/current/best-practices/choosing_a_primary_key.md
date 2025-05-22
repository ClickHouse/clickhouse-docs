import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> 我们在本页面中可以互换使用“ordering key”（排序键）来指代“主键”。严格来说，[这在 ClickHouse 中有所不同](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key)，但出于本文档的目的，读者可以将它们互换使用，其中排序键指的是在表 `ORDER BY` 中指定的列。

请注意，ClickHouse 的主键与熟悉 OLTP 数据库（如 Postgres）中类似术语的人工作的方式 [非常不同](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse)。

在 ClickHouse 中选择有效的主键对于查询性能和存储效率至关重要。ClickHouse 将数据组织为多个部分，每个部分包含自己稀疏的主索引。这个索引通过减少扫描的数据量显著加快查询速度。此外，由于主键确定了磁盘上数据的物理顺序，因此它直接影响压缩效率。优化顺序的数据压缩效果更好，进而通过减少 I/O 提升性能。

1. 在选择排序键时，优先考虑在查询过滤器中频繁使用的列（即 `WHERE` 子句），特别是那些排除大量行的列。
2. 与表中其他数据高度相关的列也很有利，因为连续存储可以提高压缩比并在 `GROUP BY` 和 `ORDER BY` 操作期间提高内存效率。
<br/>
可以应用一些简单规则来帮助选择排序键。以下规则有时可能会相互冲突，因此依次考虑这些规则。**用户可以通过此过程识别出多个关键字，通常 4-5 个就足够了**：

:::note 重要
排序键必须在表创建时定义，不能在之后添加。可以通过称为投影的功能在插入数据后（或之前）向表添加附加排序。请注意这会导致数据重复。进一步的详细信息请见 [这里](/sql-reference/statements/alter/projection)。
:::

## 示例 {#example}

考虑以下 `posts_unordered` 表。每一行对应一个 Stack Overflow 帖子。

该表没有主键 - 通过 `ORDER BY tuple()` 指示。

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

注意此查询读取的行数和字节数。没有主键的情况下，查询必须扫描整个数据集。

使用 `EXPLAIN indexes=1` 确认由于缺乏索引而进行完整表扫描。

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

假设定义了一个名为 `posts_ordered` 的表，包含相同的数据，并以 `(PostTypeId, toDate(CreationDate))` 定义的 `ORDER BY`，即：

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

`PostTypeId` 的基数为 8，代表我们排序键的第一项逻辑选择。认识到日期粒度筛选可能是足够的（它仍然会受益于 datetime 筛选），所以我们将 `toDate(CreationDate)` 作为我们键的第二个组件。这也将产生一个较小的索引，因为日期可以用 16 位表示，从而加速过滤。

以下动画展示了如何为 Stack Overflow 帖子表创建优化的稀疏主索引。索引不是针对单独的行，而是针对行块：

<Image img={create_primary_key} size="lg" alt="主键" />

如果在一个具有此排序键的表上重复同样的查询：

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

这个查询现在利用了稀疏索引，显著减少了读取的数据量，并将执行时间加速了 4 倍 - 注意行数和字节数的减少。 

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

此外，我们可以可视化稀疏索引如何修剪所有无法包含我们示例查询匹配项的行块：

<Image img={primary_key} size="lg" alt="主键" />

:::note
表中的所有列将根据指定排序键的值进行排序，无论它们是否包含在键中。例如，如果 `CreationDate` 被用作键，则所有其他列中值的顺序将与 `CreationDate` 列中值的顺序相对应。可以指定多重排序键 - 这将以与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义进行排序。
:::

关于选择主键的完整高级指南可以在 [这里](/guides/best-practices/sparse-primary-indexes) 找到。

有关排序键如何改善压缩并进一步优化存储的深刻见解，请查看关于 [ClickHouse 中压缩](/data-compression/compression-in-clickhouse) 和 [列压缩编解码器](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec) 的官方指南。
