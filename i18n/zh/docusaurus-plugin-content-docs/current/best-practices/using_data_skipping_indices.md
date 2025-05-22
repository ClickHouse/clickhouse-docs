---
'slug': '/best-practices/use-data-skipping-indices-where-appropriate'
'sidebar_position': 10
'sidebar_label': '数据跳过索引'
'title': '在适当的情况下使用数据跳过索引'
'description': '页面描述如何以及何时使用数据跳过索引'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

数据跳过索引应在遵循先前最佳实践的情况下考虑，即类型经过优化、选择了良好的主键并利用了物化视图。

如果在理解其工作原理的基础上谨慎使用，这些类型的索引可以加速查询性能。

ClickHouse 提供了一种强大的机制，称为 **data skipping indices**，它可以大幅减少查询执行期间扫描的数据量，特别是在主键对特定过滤条件不有帮助的情况下。与依赖于行基础的二级索引（如 B-树）传统数据库不同，ClickHouse 是一种列式存储，不以支持此类结构的方式存储行位置。相反，它使用跳过索引，帮助避免读取保证不会匹配查询过滤条件的数据块。

跳过索引的工作原理是存储有关数据块的元数据，如最小/最大值、值集合或布隆过滤器表示，并在查询执行期间使用这些元数据来确定哪些数据块可以完全跳过。它们仅适用于 [MergeTree family](/engines/table-engines/mergetree-family/mergetree) 的表引擎，并使用表达式、索引类型、名称和定义每个索引块大小的粒度进行定义。这些索引与表数据一起存储，并在查询过滤器匹配索引表达式时进行查询。

有几种类型的数据跳过索引，每种索引适用于不同类型的查询和数据分布：

* **minmax**: 跟踪每个块中表达式的最小和最大值。适用于松散排序数据的范围查询。
* **set(N)**: 跟踪每个块中指定大小 N 的值集合。对于每块具有低基数的列效果显著。
* **bloom_filter**: 概率性地确定值是否存在于某个块中，允许快速近似过滤集合成员资格。对于寻找“针”的查询效果显著，其中需要正面匹配。
* **tokenbf_v1 / ngrambf_v1**: 专门为在字符串中搜索标记或字符序列而设计的布隆过滤器变体 - 特别适用于日志数据或文本搜索用例。

虽然功能强大，但跳过索引必须小心使用。它们仅在消除大量数据块时提供好处，如果查询或数据结构不一致，可能会引入开销。如果一个块中存在一个匹配值，则仍然必须读取整个块。

**有效的跳过索引使用通常依赖于索引列与表的主键之间的强相关性，或者以将相似值分组的方式插入数据。**

一般来说，在确保正确的主键设计和类型优化后，最佳应用数据跳过索引。它们特别有效于：

* 整体基数高但每个块内基数低的列。
* 对搜索至关重要的稀有值（例如错误代码、特定 ID）。
* 在具有局部分布的非主键列上进行过滤的情况。

始终：

1. 在真实数据和真实查询上测试跳过索引。尝试不同的索引类型和粒度值。
2. 使用工具如 send_logs_level='trace' 和 `EXPLAIN indexes=1` 评估它们的影响以查看索引的有效性。
3. 始终评估索引的大小以及粒度的影响。减少粒度大小通常会在某种程度上提高性能，导致更多的颗粒被过滤并需要被扫描。然而，随着粒度降低，索引大小增加，性能也可能退化。测量不同粒度数据点的性能和索引大小。这对于布隆过滤器索引尤其重要。

<p/>
**在适当使用时，跳过索引可以显著提升性能 - 而盲目使用它们可能会增加不必要的成本。**

有关数据跳过索引的更详细指南，请参见 [这里](/sql-reference/statements/alter/skipping-index)。

## 示例 {#example}

考虑以下优化的表。此表包含每个帖子一行的 Stack Overflow 数据。

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

该表经过优化，适用于按帖子类型和日期过滤和聚合的查询。假设我们希望计算自 2009 年以来查看次数超过 10,000,000 的帖子数量。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

此查询能够使用主索引排除一些行（和颗粒）。然而，大多数行仍需读取，如上述响应和以下 `EXPLAIN indexes=1` 所示：

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

简单分析显示 `ViewCount` 与 `CreationDate`（主键）之间存在相关性，正如预期的那样 - 帖子存在越久，它被查看的时间就越长。

```sql
SELECT toDate(CreationDate) as day, avg(ViewCount) as view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

因此，这使得使用数据跳过索引成为逻辑选择。鉴于数字类型，使用 min_max 索引是合理的。我们使用以下 `ALTER TABLE` 命令添加索引 - 首先添加它，然后“物化”它。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

该索引也可以在初始表创建时添加。带有 min max 索引的 DDL 定义架构：

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

以下动画展示了我们的 minmax 跳过索引如何为示例表构建，跟踪表中每块行（颗粒）的最小和最大 `ViewCount` 值：

<Image img={building_skipping_indices} size="lg" alt="Building skipping indices"/>

重复我们之前的查询显示出显著的性能改善。注意扫描的行数减少：

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.012 sec. Processed 39.11 thousand rows, 321.39 KB (3.40 million rows/s., 27.93 MB/s.)
```

`EXPLAIN indexes=1` 确认使用了该索引。

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

我们还展示了一个动画，展示 minmax 跳过索引如何修剪在我们的示例查询中不可能包含 `ViewCount` > 10,000,000 谓词的所有行块：

<Image img={using_skipping_indices} size="lg" alt="Using skipping indices"/>
