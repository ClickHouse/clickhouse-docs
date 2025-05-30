---
'slug': '/best-practices/use-data-skipping-indices-where-appropriate'
'sidebar_position': 10
'sidebar_label': '数据跳过索引'
'title': '在适当的地方使用数据跳过索引'
'description': '页面描述如何以及何时使用数据跳过索引'
'keywords':
- 'data skipping index'
- 'skip index'
'show_related_blogs': true
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

数据跳过索引应该在遵循既往最佳实践的情况下考虑，即优化了类型，选择了良好的主键并利用了物化视图。

如果在充分理解其工作原理的前提下谨慎使用，这类索引可以加速查询性能。

ClickHouse 提供了一种强大的机制，称为 **数据跳过索引**，可以显著减少查询执行时扫描的数据量——尤其是在主键对特定过滤条件没有帮助的情况下。与依赖于基于行的传统数据库的二级索引（如 B 树）不同，ClickHouse 是一个列式存储，不以支持此类结构的方式存储行位置。相反，它使用跳过索引，这帮助它避免读取那些在保证不匹配查询过滤条件的情况下的块数据。

跳过索引通过存储有关数据块的元数据——例如最小/最大值、值集合或布隆过滤器表示——并在查询执行期间使用这些元数据来确定哪些数据块可以完全跳过。它们仅适用于 [MergeTree 家族](/engines/table-engines/mergetree-family/mergetree) 的表引擎，并通过一个表达式、一个索引类型、一个名称和定义每个索引块大小的粒度来进行定义。这些索引与表数据一起存储，并在查询过滤器与索引表达式匹配时进行咨询。

有几种类型的数据跳过索引，适用于不同类型的查询和数据分布：

* **minmax**：跟踪每个块的一个表达式的最小值和最大值。理想用于对于松散排序的数据的范围查询。
* **set(N)**：跟踪每个块中最大为 N 的值集合。有效用于低基数列的块。
* **bloom_filter**：以概率方式确定值是否存在于某个块中，允许快速近似过滤集合的成员资格。有效于优化在“干草堆中的针”场景中查找，其中需要正匹配。
* **tokenbf_v1 / ngrambf_v1**：专为在字符串中搜索令牌或字符序列而设计的特殊布隆过滤器变种——对日志数据或文本搜索用例特别有用。

虽然强大，跳过索引必须谨慎使用。当它们消除了大量数据块时才能提供益处，如果查询或数据结构不匹配，则可能引入开销。如果块中存在一个匹配值，则必须读取整个块。

**有效的跳过索引使用通常依赖于被索引列与表的主键之间强热点相关性，或者以一种将相似值分组的方式插入数据。**

通常，在确保有适当的主键设计和类型优化后，最好应用数据跳过索引。它们特别适用于：

* 整体基数高但块内基数低的列。
* 对于搜索至关重要的稀有值（例如错误代码、特定 ID）。
* 在非主键列上发生过滤的情况下，且具有局部分布。

始终：

1. 在真实数据上用现实查询测试跳过索引。尝试不同的索引类型和粒度值。
2. 使用像 send_logs_level='trace' 这样的工具评估其影响，并使用 `EXPLAIN indexes=1` 以查看索引的有效性。
3. 始终评估索引的大小以及如何受到粒度的影响。通常降低粒度的大小会改善性能，从而导致更多的粒度被过滤并需要被扫描。然而，随着索引大小随较低粒度增加，性能也可能恶化。测量不同粒度数据点的性能和索引大小。这在布隆过滤器索引上尤其相关。

<p/>
**当适当使用时，跳过索引能够大幅提升性能—当盲目使用时，它们可能增加不必要的成本。**

有关数据跳过索引的更详细指南请见 [这里](/sql-reference/statements/alter/skipping-index)。

## 示例 {#example}

考虑以下优化过的表。此表包含每个帖子的 Stack Overflow 数据。

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

该表针对按帖子类型和日期过滤和聚合的查询进行了优化。假设我们希望统计 2009 年后发布的超过 10,000,000 次浏览的帖子数量。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

此查询能够使用主索引排除一些行（和粒度）。然而，大多数行依旧需要阅读，如上面的响应和接下来的 `EXPLAIN indexes=1` 所示：

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

简单分析表明，`ViewCount` 与 `CreationDate`（主键）是相关的，正如人们所期望的那样——帖子存在越久，被查看的时间就越多。

```sql
SELECT toDate(CreationDate) as day, avg(ViewCount) as view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

因此，为数据跳过索引做出逻辑选择。考虑到数字类型，min_max 索引是有意义的。我们使用以下 `ALTER TABLE` 命令添加索引——首先添加它，然后“物化”它。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

此索引也可以在初始表创建期间添加。定义为 DDL 一部分的模式，带有 min max 索引：

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

以下动画说明了我们的 minmax 跳过索引是如何为示例表构建的，跟踪表中每个行块（粒度）的最小和最大 `ViewCount` 值：

<Image img={building_skipping_indices} size="lg" alt="Building skipping indices"/>

重复我们之前的查询显示了显著的性能改善。注意所有减少的被扫描行数：

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

我们还展示了一个动画，展示 minmax 跳过索引如何修剪不能包含示例查询中 `ViewCount` > 10,000,000 条件匹配的所有行块：

<Image img={using_skipping_indices} size="lg" alt="Using skipping indices"/>
