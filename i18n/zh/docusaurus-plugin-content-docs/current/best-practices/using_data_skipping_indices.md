---
'slug': '/best-practices/use-data-skipping-indices-where-appropriate'
'sidebar_position': 10
'sidebar_label': '数据跳过索引'
'title': '在适当的地方使用数据跳过索引'
'description': '页面描述如何及何时使用数据跳过索引'
'keywords':
- 'data skipping index'
- 'skip index'
'show_related_blogs': true
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

数据跳过索引应该在遵循之前最佳实践的情况下考虑，即：类型已优化，选择了良好的主键，并充分利用了物化视图。

这类索引可用于加速查询性能，但需要谨慎使用，并了解其工作原理。

ClickHouse 提供了一种强大的机制，称为 **数据跳过索引**，可以显著减少查询执行期间扫描的数据量——特别是当主键对于特定的过滤条件不太有效时。与依赖基于行的二级索引（如 B-tree）的传统数据库不同，ClickHouse 是列式存储，并且不以支持这些结构的方式存储行位置。相反，它使用跳过索引，帮助避免读取那些确保不匹配查询过滤条件的数据块。

跳过索引通过存储有关数据块的元数据（例如最小/最大值、值集或布隆过滤器表示）来工作，并在查询执行期间利用这些元数据来确定可以完全跳过哪些数据块。它们仅适用于 [MergeTree 家族](/engines/table-engines/mergetree-family/mergetree) 的表引擎，并通过表达式、索引类型、名称以及定义每个索引块大小的粒度来定义。这些索引与表数据一起存储，并在查询过滤条件与索引表达式匹配时进行查阅。

有几种类型的数据跳过索引，每种索引适合不同类型的查询和数据分布：

* **minmax**：跟踪每个数据块表达式的最小值和最大值。非常适合用于松散排序数据的范围查询。
* **set(N)**：跟踪每个数据块中最多指定大小 N 的值集。对低基数的列有效。
* **bloom_filter**：概率性地确定一个值是否存在于数据块中，允许对集合成员资格进行快速近似过滤。有效优化寻找“针在干草堆中”的查询，其中需要正匹配。
* **tokenbf_v1 / ngrambf_v1**：专门的布隆过滤器变体，旨在搜索字符串中的标记或字符序列——特别适用于日志数据或文本搜索用例。

尽管功能强大，跳过索引必须谨慎使用。它们仅在消除大量数据块的情况下提供好处，如果查询或数据结构不一致，还可能引入开销。如果数据块中存在一个匹配的值，则仍需读取整个数据块。

**有效的跳过索引使用通常依赖于索引列与表主键之间的强相关性，或以一种将相似值聚集在一起的方式插入数据。**

一般来说，在确保适当的主键设计和类型优化后，数据跳过索引的应用效果最佳。它们特别适用于：

* 总体基数高但每个块内基数低的列。
* 对搜索至关重要的稀有值（例如错误代码、特定 ID）。
* 在具有本地分布的非主键列上发生过滤的情况。

始终：

1. 在真实数据上使用真实查询测试跳过索引。尝试不同的索引类型和粒度值。
2. 使用工具（如 send_logs_level='trace' 和 `EXPLAIN indexes=1`）评估它们的影响，以查看索引效果。
3. 始终评估索引的大小以及其如何受到粒度的影响。降低粒度大小通常会改善性能，但会导致更多的块被过滤和需要扫描。然而，随着索引大小的增加，性能也可能会下降。测量各种粒度数据点的性能和索引大小。这对布隆过滤器索引尤其重要。

<p/>
**当适当使用时，跳过索引可以显著提升性能——盲目使用则可能增加不必要的成本。**

有关数据跳过索引的更详细指南，请参见 [这里](/sql-reference/statements/alter/skipping-index)。

## 示例 {#example}

考虑以下优化后的表。这包含每个帖子一行的 Stack Overflow 数据。

```sql
CREATE TABLE stackoverflow.posts
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
  `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
  `AcceptedAnswerId` UInt32,
  `CreationDate` DateTime64(3, 'UTC'),
  `Score` Int32,
  `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
  `Body` String,
  `OwnerUserId` Int32,
  `OwnerDisplayName` String,
  `LastEditorUserId` Int32,
  `LastEditorDisplayName` String,
  `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
  `LastActivityDate` DateTime64(3, 'UTC'),
  `Title` String,
  `Tags` String,
  `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
  `CommentCount` UInt8,
  `FavoriteCount` UInt8,
  `ContentLicense` LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime64(3, 'UTC'),
  `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

该表针对按帖子类型和日期过滤和聚合的查询进行了优化。假设我们希望统计2009年后发布的访问量超过10,000,000的帖子数量。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

此查询能够利用主索引排除一些行（和块）。然而，大多数行仍需根据上述响应和随后 `EXPLAIN indexes=1` 的结果进行读取：

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)
LIMIT 1

┌─explain──────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                        │
│   Limit (preliminary LIMIT (without OFFSET))                     │
│     Aggregating                                                  │
│       Expression (Before GROUP BY)                               │
│         Expression                                               │
│           ReadFromMergeTree (stackoverflow.posts)                │
│           Indexes:                                               │
│             MinMax                                               │
│               Keys:                                              │
│                 CreationDate                                     │
│               Condition: (CreationDate in ('1230768000', +Inf))  │
│               Parts: 123/128                                     │
│               Granules: 8513/8545                                │
│             Partition                                            │
│               Keys:                                              │
│                 toYear(CreationDate)                             │
│               Condition: (toYear(CreationDate) in [2009, +Inf))  │
│               Parts: 123/123                                     │
│               Granules: 8513/8513                                │
│             PrimaryKey                                           │
│               Keys:                                              │
│                 toDate(CreationDate)                             │
│               Condition: (toDate(CreationDate) in [14245, +Inf)) │
│               Parts: 123/123                                     │
│               Granules: 8513/8513                                │
└──────────────────────────────────────────────────────────────────┘

25 rows in set. Elapsed: 0.070 sec.
```

简单分析显示 `ViewCount` 与 `CreationDate`（主键）之间存在相关性——帖子存在的时间越长，被查看的时间就越多。

```sql
SELECT toDate(CreationDate) AS day, avg(ViewCount) AS view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

因此，这是选择数据跳过索引的合逻辑选择。考虑到数值类型，使用 min_max 索引是合理的。我们通过以下 `ALTER TABLE` 命令添加索引——首先添加，它，然后“物化”它。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

该索引也可以在初始表创建期间添加。在 DDL 中定义 min max 索引的模式：

```sql
CREATE TABLE stackoverflow.posts
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
  `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
  `AcceptedAnswerId` UInt32,
  `CreationDate` DateTime64(3, 'UTC'),
  `Score` Int32,
  `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
  `Body` String,
  `OwnerUserId` Int32,
  `OwnerDisplayName` String,
  `LastEditorUserId` Int32,
  `LastEditorDisplayName` String,
  `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
  `LastActivityDate` DateTime64(3, 'UTC'),
  `Title` String,
  `Tags` String,
  `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
  `CommentCount` UInt8,
  `FavoriteCount` UInt8,
  `ContentLicense` LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime64(3, 'UTC'),
  `ClosedDate` DateTime64(3, 'UTC'),
  INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1 --index here
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

以下动画展示了为示例表构建我们的 minmax 跳过索引的过程，跟踪表中每个数据块（粒度）中的最小和最大 `ViewCount` 值：

<Image img={building_skipping_indices} size="lg" alt="Building skipping indices"/>

重复我们之前的查询显示出显著的性能提升。请注意扫描的行数减少：

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.012 sec. Processed 39.11 thousand rows, 321.39 KB (3.40 million rows/s., 27.93 MB/s.)
```

`EXPLAIN indexes=1` 确认了索引的使用。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                          │
│   Aggregating                                                      │
│     Expression (Before GROUP BY)                                   │
│       Expression                                                   │
│         ReadFromMergeTree (stackoverflow.posts)                    │
│         Indexes:                                                   │
│           MinMax                                                   │
│             Keys:                                                  │
│               CreationDate                                         │
│             Condition: (CreationDate in ('1230768000', +Inf))      │
│             Parts: 123/128                                         │
│             Granules: 8513/8545                                    │
│           Partition                                                │
│             Keys:                                                  │
│               toYear(CreationDate)                                 │
│             Condition: (toYear(CreationDate) in [2009, +Inf))      │
│             Parts: 123/123                                         │
│             Granules: 8513/8513                                    │
│           PrimaryKey                                               │
│             Keys:                                                  │
│               toDate(CreationDate)                                 │
│             Condition: (toDate(CreationDate) in [14245, +Inf))     │
│             Parts: 123/123                                         │
│             Granules: 8513/8513                                    │
│           Skip                                                     │
│             Name: view_count_idx                                   │
│             Description: minmax GRANULARITY 1                      │
│             Parts: 5/123                                           │
│             Granules: 23/8513                                      │
└────────────────────────────────────────────────────────────────────┘

29 rows in set. Elapsed: 0.211 sec.
```

我们还展示了一个动画，说明 minmax 跳过索引如何修剪所有不可能包含符合 `ViewCount` > 10,000,000 谓词的行块：

<Image img={using_skipping_indices} size="lg" alt="Using skipping indices"/>
