---
slug: /best-practices/use-data-skipping-indices-where-appropriate
sidebar_position: 10
sidebar_label: '数据跳过索引'
title: '在合适的场景下使用数据跳过索引'
description: '介绍如何以及何时使用数据跳过索引的页面'
keywords: ['data skipping index', 'skip index']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

在已经遵循前面最佳实践的前提下（例如类型已优化、已选择合适的主键并充分利用了物化视图），才应考虑使用数据跳过索引。如果你刚接触跳过索引，[这篇指南](/optimize/skipping-indexes) 是一个很好的起点。

在了解其工作机制并谨慎使用的情况下，这类索引可以用来加速查询。

ClickHouse 提供了一种称为 **data skipping indices（数据跳过索引）** 的强大机制，可以在查询执行期间大幅减少扫描的数据量 —— 尤其是在主键对某个特定过滤条件帮助不大时。不同于依赖行级二级索引（如 B-tree）的传统数据库，ClickHouse 是列式存储，并不会以支持这类结构的方式存储行位置。它使用的是跳过索引，用于避免读取那些可以确定不会匹配查询过滤条件的数据块。

跳过索引通过为数据块存储元数据（例如最小/最大值、值集合，或 Bloom filter 表示），并在查询执行期间利用这些元数据来判断哪些数据块可以被完全跳过。它们仅适用于 [MergeTree 系列表引擎](/engines/table-engines/mergetree-family/mergetree)，并通过表达式、索引类型、名称以及定义每个索引块大小的粒度来定义。这些索引与表数据一同存储，并在查询过滤条件与索引表达式匹配时被使用。

数据跳过索引有多种类型，每种都适用于不同的查询模式和数据分布：

* **minmax**：为每个数据块记录表达式的最小值和最大值。非常适合在大致有序的数据上执行范围查询。
* **set(N)**：为每个数据块记录最多指定大小 N 的值集合。对每个块内基数较低的列效果较好。
* **bloom&#95;filter**：以概率方式判断某个值是否存在于数据块中，从而为集合成员判断提供快速的近似过滤。适用于优化“在草堆中找针”这类需要找到少量正匹配结果的查询。
* **tokenbf&#95;v1 / ngrambf&#95;v1**：为在字符串中搜索 token 或字符序列设计的专用 Bloom filter 变种 —— 对日志数据或文本检索场景尤其有用。

尽管功能强大，跳过索引必须谨慎使用。只有在能够剔除足够多的数据块时才会带来收益；如果查询模式或数据结构与之不匹配，反而会引入额外开销。如果某个数据块中哪怕只有一个可能匹配过滤条件的值，该整个数据块仍然必须被读取。

**有效利用跳过索引通常依赖于被索引列与表主键之间存在较强的相关性，或者以将相似值聚集在一起的方式写入数据。**

通常，在确保主键设计合理和类型优化充分之后，再考虑应用数据跳过索引是最佳实践。它们尤其适用于：

* 全局基数高但在单个块内基数较低的列。
* 对搜索至关重要的稀有值（例如错误码、特定 ID）。
* 在分布局部集中的非主键列上进行过滤的场景。

务必做到：

1. 在真实数据和真实查询上测试跳过索引。尝试不同的索引类型和粒度值。
2. 使用 send&#95;logs&#95;level=&#39;trace&#39; 和 `EXPLAIN indexes=1` 等工具评估其影响，查看索引效果。
3. 始终评估索引的大小以及粒度对其大小的影响。减小粒度通常会在一定程度上提升性能，因为会有更多 granule 被过滤，需要扫描的 granule 更少。然而，随着粒度降低导致索引大小增加，性能也可能开始退化。针对不同粒度的数据点测量性能和索引大小。这对 Bloom filter 索引尤为重要。

<p />

**在合适的场景下使用时，跳过索引可以带来显著的性能提升；而如果盲目使用，则可能增加不必要的开销。**

关于数据跳过索引的更详细说明，请参见[此处](/sql-reference/statements/alter/skipping-index)。


## 示例 {#example}

考虑以下优化后的表。该表包含 Stack Overflow 数据,每行对应一个帖子。

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

因此，它就成为数据跳过索引的一个合理选择。鉴于其数值类型，使用 `minmax` 索引是合适的。我们使用下面的 `ALTER TABLE` 命令添加这个索引——先添加它，然后再对其进行“物化”（materialize）。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

此索引也可以在最初创建表时添加。将 `minmax` 索引作为 DDL 一部分定义的表结构如下：

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

下方动画演示了如何为示例表构建 `minmax` 跳过索引，并记录表中每个行块（粒度）对应的 `ViewCount` 最小值和最大值：

<Image img={building_skipping_indices} size="lg" alt="Building skipping indices" />

再次运行前面的查询后，可以看到性能有了显著提升。请注意扫描的行数减少了：

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 行结果。耗时: 0.012 秒。处理了 39.11 千行，321.39 KB (3.40 百万行/秒，27.93 MB/秒)。
```

使用 `EXPLAIN indexes = 1` 可以确认索引已被使用。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)
```


┌─explain────────────────────────────────────────────────────────────┐
│ 表达式（（Project names + Projection））                           │
│   聚合                                                             │
│     表达式（GROUP BY 之前）                                        │
│       表达式                                                       │
│         ReadFromMergeTree (stackoverflow.posts)                    │
│         索引:                                                      │
│           MinMax                                                   │
│             键:                                                    │
│               CreationDate                                         │
│             条件: (CreationDate in (&#39;1230768000&#39;, +Inf))          │
│             数据部分: 123/128                                      │
│             粒度: 8513/8545                                        │
│           Partition                                                │
│             键:                                                    │
│               toYear(CreationDate)                                 │
│             条件: (toYear(CreationDate) in [2009, +Inf))           │
│             数据部分: 123/123                                      │
│             粒度: 8513/8513                                        │
│           PrimaryKey                                               │
│             键:                                                    │
│               toDate(CreationDate)                                 │
│             条件: (toDate(CreationDate) in [14245, +Inf))          │
│             数据部分: 123/123                                      │
│             粒度: 8513/8513                                        │
│           Skip                                                     │
│             名称: view&#95;count&#95;idx                                 │
│             描述: minmax GRANULARITY 1                             │
│             数据部分: 5/123                                        │
│             粒度: 23/8513                                          │
└────────────────────────────────────────────────────────────────────┘

29 行结果. 耗时: 0.211 秒.

```

我们还通过动画演示了 minmax 跳数索引如何在示例查询中剪枝所有不可能包含满足 `ViewCount` > 10,000,000 条件的行块:

<Image img={using_skipping_indices} size="lg" alt="使用跳数索引"/>
```


## 相关文档 {#related-docs}

- [数据跳数索引指南](/optimize/skipping-indexes)
- [数据跳数索引示例](/optimize/skipping-indexes/examples)
- [操作数据跳数索引](/sql-reference/statements/alter/skipping-index)
- [系统表信息](/operations/system-tables/data_skipping_indices)
