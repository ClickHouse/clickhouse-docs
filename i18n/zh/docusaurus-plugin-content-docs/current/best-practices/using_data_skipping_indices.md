import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

数据跳过索引应该在遵循先前最佳实践的情况下考虑，即优化了类型，选择了好的主键，并利用了物化视图。

这些类型的索引可以在了解其工作原理的情况下，通过谨慎使用来加速查询性能。

ClickHouse 提供了一种强大的机制，称为 **数据跳过索引**，可以显著减少查询执行期间扫描的数据量 - 特别是在主键对特定过滤条件没有帮助时。与依赖基于行的二级索引（如 B-树）的传统数据库不同，ClickHouse 是一种列式存储，不以支持这种结构的方式存储行位置。相反，它使用跳过索引，帮助它避免读取保证不会匹配查询过滤条件的数据块。

跳过索引通过存储关于数据块的元数据 - 例如最小/最大值、值集或布隆过滤器表示 - 工作，并在查询执行过程中使用这些元数据来确定哪些数据块可以完全跳过。它们仅适用于 [MergeTree 家族](/engines/table-engines/mergetree-family/mergetree) 的表引擎，并使用一个表达式、一个索引类型、一个名称和一个定义每个索引块大小的粒度进行定义。这些索引存储在表数据旁，并在查询过滤匹配索引表达式时进行咨询。

有几种类型的数据跳过索引，每种都适用于不同类型的查询和数据分布：

* **minmax**：跟踪每个块的表达式的最小值和最大值。适用于对 loosely sorted 数据的范围查询。
* **set(N)**：跟踪每个块中最大为指定大小 N 的值集。对低基数列有效。
* **bloom_filter**：以概率方式确定值是否存在于块中，允许快速的大致过滤以检查集合成员。有效优化寻找“针在海中”的查询，其中需要正匹配。
* **tokenbf_v1 / ngrambf_v1**：专为在字符串中搜索令牌或字符序列设计的特殊布隆过滤器变种 - 特别适用于日志数据或文本搜索用例。

虽然强大，但跳过索引必须谨慎使用。它们仅在消除相当数量的数据块时提供好处，如果查询或数据结构不对齐，实际上可能会引入开销。如果一个块中存在甚至一个匹配值，则仍需读取整个块。

**有效的跳过索引使用通常依赖于被索引列与表的主键之间的强关联，或以分组相似值的方式插入数据。**

一般来说，在确保合适的主键设计和类型优化后，最好应用数据跳过索引。它们特别适用于：

* 整体基数高但块内基数低的列。
* 对搜索至关重要的稀有值（例如错误代码、特定 ID）。
* 在局部分布的非主键列上进行过滤的情况。

始终要：

1. 在真实数据上使用真实查询测试跳过索引。尝试不同的索引类型和粒度值。
2. 使用工具评估其影响，如 send_logs_level='trace' 和 `EXPLAIN indexes=1` 来查看索引有效性。
3. 始终评估索引的大小及其如何受到粒度的影响。减少粒度大小通常会提高性能，达到一个点后，导致更多的细粒度被过滤和需要扫描。然而，随着较低粒度导致的索引大小增加，性能也可能下降。测量各种粒度数据点的性能和索引大小。这在布隆过滤器索引上尤为重要。

<p/>
**当适当使用时，跳过索引可以提供显著的性能提升 - 盲目使用时，它们可能会增加不必要的成本。**

有关数据跳过索引的更详细指南，请参见 [这里](/sql-reference/statements/alter/skipping-index)。

## 示例 {#example}

考虑以下优化后的表。这包含 Stack Overflow 数据，每个帖子一行。

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

该表针对按帖子类型和日期进行过滤和聚合的查询进行了优化。假设我们想计数 2009 年后发布的超过 10,000,000 次观看的帖子数量。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

该查询能够使用主索引排除一些行（和细粒度）。然而，大多数行仍需读取，如上述响应和随后的 `EXPLAIN indexes=1` 所示：

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

简单分析显示 `ViewCount` 与 `CreationDate`（主键）存在相关性，正如预期的那样 - 一个帖子存在的时间越长，它被查看的时间就越多。

```sql
SELECT toDate(CreationDate) as day, avg(ViewCount) as view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

因此，这使得使用数据跳过索引成为合理的选择。考虑到数值类型，min_max 索引是合理的。我们使用以下 `ALTER TABLE` 命令添加索引 - 首先添加索引，然后“物化”它。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

该索引也可以在初始表创建时添加。架构中将 min max 索引定义为 DDL 的一部分：

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

以下动画说明了我们为示例表构建的 minmax 跳过索引，跟踪表中每块行（细粒度）的最小和最大 `ViewCount` 值：

<Image img={building_skipping_indices} size="lg" alt="Building skipping indices"/>

重复我们之前的查询显示了显著的性能提升。注意扫描的行数减少了：

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.012 sec. Processed 39.11 thousand rows, 321.39 KB (3.40 million rows/s., 27.93 MB/s.)
```

`EXPLAIN indexes=1` 确认索引的使用。

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

我们还展示了一种动画，说明 minmax 跳过索引如何修剪所有可能不包含 `ViewCount` > 10,000,000 谓词匹配的行块：

<Image img={using_skipping_indices} size="lg" alt="Using skipping indices"/>
