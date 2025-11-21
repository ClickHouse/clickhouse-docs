---
slug: /best-practices/use-data-skipping-indices-where-appropriate
sidebar_position: 10
sidebar_label: '数据跳过索引'
title: '在适当场景下使用数据跳过索引'
description: '介绍如何以及何时使用数据跳过索引的页面'
keywords: ['data skipping index', 'skip index']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

在已经遵循前述最佳实践的前提下（例如已经优化了数据类型、选好了合适的主键并充分利用了物化视图）才应考虑使用数据跳过索引。如果你刚接触跳过索引，可以先阅读[本指南](/optimize/skipping-indexes)。

在理解其工作机制并谨慎使用的前提下，此类索引可以用来加速查询性能。

ClickHouse 提供了一种称为 **数据跳过索引（data skipping indices）** 的强大机制，可以显著减少查询执行过程中需要扫描的数据量——尤其是在针对某个特定过滤条件时主键并不“给力”的场景下。与依赖行级二级索引（如 B-tree）的传统数据库不同，ClickHouse 是列式存储引擎，不会以支持此类结构的方式来存储行位置。相反，它使用跳过索引来避免读取那些必然不满足查询过滤条件的数据块。

跳过索引通过存储数据块的元数据——例如最小/最大值、值集合或 Bloom filter 表示——并在查询执行期间利用这些元数据来确定哪些数据块可以被完全跳过。它们仅适用于 [MergeTree 系列表引擎](/engines/table-engines/mergetree-family/mergetree)，通过一个表达式、索引类型、名称以及定义每个被索引块大小的粒度来定义。这些索引与表数据一起存储，当查询的过滤条件与索引表达式匹配时会被使用。

数据跳过索引有多种类型，每种都适用于不同类型的查询和数据分布：

* **minmax**：为每个块跟踪某个表达式的最小值和最大值。适用于在弱排序数据上的范围查询。
* **set(N)**：为每个块跟踪最多 N 个值的集合。对每个块内基数较低的列效果显著。
* **bloom&#95;filter**：以概率方式判断某个值是否存在于一个块中，为集合成员检查提供快速的近似过滤。适用于优化“在草堆中找针”这类需要找到正匹配结果的查询。
* **tokenbf&#95;v1 / ngrambf&#95;v1**：专门用于在字符串中搜索 token 或字符序列的 Bloom filter 变体——对日志数据或文本搜索场景尤其有用。

尽管功能强大，但必须谨慎使用跳过索引。只有在能排除有意义数量的数据块时才会带来收益；如果查询或数据结构与索引不匹配，反而会引入额外开销。如果某个块中存在哪怕一个匹配值，该整个块仍然必须被读取。

**有效使用跳过索引通常依赖于被索引列与表主键之间存在较强相关性，或者通过插入数据的方式使相似值聚集在一起。**

一般来说，应在确保主键设计合理且数据类型已优化之后，再考虑应用数据跳过索引。它们特别适用于：

* 全局基数高但单块内基数较低的列。
* 对搜索至关重要但出现频率较低的值（例如错误码、特定 ID）。
* 在分布局部集中的非主键列上进行过滤的场景。

应遵循以下原则：

1. 在真实数据和现实查询上测试跳过索引。尝试不同的索引类型和粒度值。
2. 使用诸如 send&#95;logs&#95;level=&#39;trace&#39; 和 `EXPLAIN indexes=1` 等工具评估其影响，以查看索引的有效性。
3. 始终评估索引大小以及粒度对其的影响。减小粒度通常会在一定程度上提升性能，因为可以过滤掉更多粒度、需要扫描的粒度更少。然而，随着粒度减小导致索引大小增加，性能也可能下降。请在不同粒度设置下测量性能和索引大小。这对 Bloom filter 索引尤为重要。

<p />

**在合理使用的情况下，跳过索引可以带来显著的性能提升——而如果盲目使用，则可能增加不必要的成本。**

有关数据跳过索引的更详细指南，请参见[此处](/sql-reference/statements/alter/skipping-index)。


## 示例 {#example}

考虑以下优化后的表。该表包含 Stack Overflow 数据,每篇帖子对应一行。

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

该表针对按帖子类型和日期进行过滤和聚合的查询进行了优化。假设我们希望统计 2009 年之后发布的浏览量超过 10,000,000 的帖子数量。

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

该查询能够使用主索引排除部分行(和颗粒)。然而,如上述响应和以下 `EXPLAIN indexes = 1` 所示,大部分行仍需要读取:

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

简单分析表明,`ViewCount` 与 `CreationDate`(主键)存在相关性,这符合预期——帖子存在的时间越长,被浏览的机会就越多。


```sql
SELECT toDate(CreationDate) AS day, avg(ViewCount) AS view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

因此，这就成为数据跳过索引的理想选择。鉴于其是数值类型，使用 minmax 索引是合乎逻辑的。我们通过以下 `ALTER TABLE` 命令添加索引——先添加索引，然后再对其进行“物化”处理。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

此索引也可以在最初创建表时添加。将 minmax 索引定义为 DDL 一部分的表结构如下：

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
  INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1 --此处为索引
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

下图动画演示了如何为示例表构建 minmax 跳过索引，它会为表中每个行块（粒度）跟踪 `ViewCount` 的最小值和最大值：

<Image img={building_skipping_indices} size="lg" alt="构建跳过索引" />

再次运行之前的查询可以看到明显的性能提升。请注意，被扫描的行数减少了：

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 行结果。耗时: 0.012 秒。处理了 39.11 千行，321.39 KB (3.40 百万行/秒，27.93 MB/秒)。
```

执行 `EXPLAIN indexes = 1` 可确认索引已被使用。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)
```


┌─explain────────────────────────────────────────────────────────────┐
│ 表达式 ((Project names + Projection))                             │
│   聚合                                                             │
│     表达式 (GROUP BY 之前)                                        │
│       表达式                                                       │
│         ReadFromMergeTree (stackoverflow.posts)                   │
│         索引：                                                     │
│           MinMax                                                   │
│             键：                                                   │
│               CreationDate                                         │
│             条件：(CreationDate in (&#39;1230768000&#39;, +Inf))        │
│             数据片段：123/128                                      │
│             粒度：8513/8545                                        │
│           Partition                                                │
│             键：                                                   │
│               toYear(CreationDate)                                 │
│             条件：(toYear(CreationDate) in [2009, +Inf))          │
│             数据片段：123/123                                      │
│             粒度：8513/8513                                        │
│           PrimaryKey                                               │
│             键：                                                   │
│               toDate(CreationDate)                                 │
│             条件：(toDate(CreationDate) in [14245, +Inf))         │
│             数据片段：123/123                                      │
│             粒度：8513/8513                                        │
│           Skip                                                     │
│             名称：view&#95;count&#95;idx                             │
│             描述：minmax GRANULARITY 1                            │
│             数据片段：5/123                                        │
│             粒度：23/8513                                          │
└────────────────────────────────────────────────────────────────────┘

共 29 行。耗时：0.211 秒。

```

我们还展示了一个动画，说明 minmax 跳数索引如何在示例查询中修剪所有不可能包含 `ViewCount` > 10,000,000 谓词匹配的行块：

<Image img={using_skipping_indices} size="lg" alt="使用跳数索引"/>
```


## 相关文档 {#related-docs}

- [数据跳数索引指南](/optimize/skipping-indexes)
- [数据跳数索引示例](/optimize/skipping-indexes/examples)
- [操作数据跳数索引](/sql-reference/statements/alter/skipping-index)
- [系统表信息](/operations/system-tables/data_skipping_indices)
