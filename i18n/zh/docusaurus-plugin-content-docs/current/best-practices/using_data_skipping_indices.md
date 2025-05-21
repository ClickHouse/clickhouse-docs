---
'slug': '/best-practices/use-data-skipping-indices-where-appropriate'
'sidebar_position': 10
'sidebar_label': '数据跳过索引'
'title': '在适当的情况下使用数据跳过索引'
'description': '页面描述何时以及如何使用数据跳过索引'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

数据跳过索引应在遵循先前最佳实践的情况下考虑，即类型经过优化，已经选择了良好的主键，并且利用了物化视图。

如果小心使用并理解它们的工作原理，这些类型的索引可以用来加速查询性能。

ClickHouse 提供了一种强大的机制，称为 **数据跳过索引**，可以显著减少查询执行期间扫描的数据量 - 特别是当主键对特定过滤条件不相帮助时。与依赖基于行的二级索引（如 B-树）的传统数据库不同，ClickHouse 是一个列式存储，不以支持这种结构的方式存储行的位置。相反，它使用跳过索引，这帮助它避免读取那些保证不匹配查询过滤条件的数据块。

跳过索引通过存储有关数据块的元数据进行工作 - 例如最小/最大值、值集合或布隆过滤器表示 - 并在查询执行时使用这些元数据来确定哪些数据块可以被完全跳过。它们仅适用于 [MergeTree 家族](/engines/table-engines/mergetree-family/mergetree) 的表引擎，并定义了一个表达式、一个索引类型、一个名称，以及定义每个索引块大小的粒度。这些索引与表数据一起存储，并在查询过滤器与索引表达式匹配时被引用。

有几种类型的数据跳过索引，每种都适合不同类型的查询和数据分布：

* **minmax**：跟踪每个块上表达式的最小值和最大值。适合于对松散排序数据的范围查询。
* **set(N)**：跟踪每个块中最多指定大小 N 的值集。有效用于低基数的列。
* **bloom_filter**：概率性地确定一个值是否存在于某个块中，允许快速近似过滤集合成员。对于寻求“干草堆中的针”的查询有效，其中需要正匹配。
* **tokenbf_v1 / ngrambf_v1**：专门设计用于在字符串中搜索标记或字符序列的布隆过滤器变体 - 对于日志数据或文本搜索应用非常有用。

虽然功能强大，但跳过索引必须谨慎使用。仅当它们消除大量的数据块时，才会提供好处；如果查询或数据结构不一致，实际上可能会引入开销。如果块中存在甚至一个匹配值，则必须仍然读取整个块。

**有效的跳过索引使用通常依赖于被索引列与表的主键之间的强相关性，或以一种将相似值分组的方式插入数据。**

一般来说，在确保正确的主键设计和类型优化后，数据跳过索引是最佳应用的。它们特别有用于：

* 总体基数高但每个块内基数低的列。
* 对于搜索至关重要的稀有值（例如错误代码、特定 ID）。
* 在具有局部分布的非主键列上进行过滤的情况。

始终：

1. 在真实数据上测试跳过索引，并使用现实查询。尝试不同的索引类型和粒度值。
2. 使用工具如 send_logs_level='trace' 和 `EXPLAIN indexes=1` 评估它们的影响，以查看索引的有效性。
3. 始终评估索引的大小及其受粒度影响的方式。降低粒度大小通常会在一定程度上提高性能，导致更多的小颗粒被过滤并需要扫描。然而，随着较低粒度导致索引大小增加，性能也可能下降。测量不同粒度数据点的性能和索引大小。这在布隆过滤器索引上尤其相关。

<p/>
**当适当使用时，跳过索引可以提供显著的性能提升；但盲目使用时，它们可能增加不必要的成本。**

有关数据跳过索引的更详细指南，请参见 [这里](/sql-reference/statements/alter/skipping-index)。

## 示例 {#example}

考虑以下经过优化的表。此表包含每个帖子的 Stack Overflow 数据。

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

该表针对按帖子类型和日期过滤和聚合的查询进行了优化。假设我们希望统计在 2009 年后发布的浏览量超过 10,000,000 的帖子数量。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

该查询能够使用主索引排除一些行（和小颗粒）。然而，正如上面响应和随后的 `EXPLAIN indexes=1` 所示，大多数行仍然需要读取：

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

简单分析表明 `ViewCount` 与 `CreationDate`（主键）相关联，如人们所料 - 帖子存在的时间越长，越有可能被查看。

```sql
SELECT toDate(CreationDate) as day, avg(ViewCount) as view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

因此，这是一个逻辑上合理的数据跳过索引选择。考虑到数字类型，采用 min_max 索引是合理的。我们使用以下 `ALTER TABLE` 命令添加索引 - 首先添加它，然后“物化”它。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

该索引也可以在初始表创建期间添加。以下是将 min max 索引定义为 DDL 一部分的架构：

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

以下动画展示了我们为示例表构建的 minmax 跳过索引，跟踪表中每个行块（小颗粒）的最小和最大 `ViewCount` 值：

<Image img={building_skipping_indices} size="lg" alt="Building skipping indices"/>

重复我们之前的查询显示出显著的性能提升。注意所有减少的扫描行数：

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.012 sec. Processed 39.11 thousand rows, 321.39 KB (3.40 million rows/s., 27.93 MB/s.)
```

一个 `EXPLAIN indexes=1` 确认了索引的使用。

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

我们还展示了一个动画，说明 minmax 跳过索引将所有无法包含匹配的行块修剪掉，这些块不能可能包含例子查询中的 `ViewCount` > 10,000,000 的谓词：

<Image img={using_skipping_indices} size="lg" alt="Using skipping indices"/>
