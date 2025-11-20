---
slug: /best-practices/use-data-skipping-indices-where-appropriate
sidebar_position: 10
sidebar_label: '数据跳跃索引'
title: '在合适的场景下使用数据跳跃索引'
description: '介绍如何以及何时使用数据跳跃索引的页面'
keywords: ['data skipping index', 'skip index']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

在已经遵循前面最佳实践的前提下才应考虑使用数据跳过索引，即：已经完成类型优化、选择了良好的主键并充分利用了物化视图。如果你刚接触跳过索引，可以从[这篇指南](/optimize/skipping-indexes)开始。

在理解其工作原理的基础上谨慎使用时，此类索引可以用于加速查询性能。

ClickHouse 提供了一种称为 **data skipping indices（数据跳过索引）** 的强大机制，可以在查询执行过程中显著减少被扫描的数据量——尤其是在主键对某个特定过滤条件帮助不大的情况下。与依赖基于行的二级索引（如 B-tree）的传统数据库不同，ClickHouse 是列式存储，并不会以支持此类结构的方式存储行位置。相反，它使用跳过索引来避免读取那些可以确定不满足查询过滤条件的数据块。

跳过索引通过存储数据块的元数据（例如最小/最大值、取值集合或 Bloom filter 表示），并在查询执行期间使用这些元数据来确定哪些数据块可以被完全跳过。这些索引仅适用于 [MergeTree family](/engines/table-engines/mergetree-family/mergetree) 表引擎，通过一个表达式、索引类型、名称以及定义每个被索引数据块大小的粒度来定义。这些索引与表数据一同存储，并会在查询过滤条件与索引表达式匹配时被使用。

数据跳过索引有多种类型，每种类型适用于不同的查询类型和数据分布：

* **minmax**：为每个数据块跟踪表达式的最小值和最大值。适用于在大致有序数据上的范围查询。
* **set(N)**：为每个数据块跟踪最多 N 个值的集合。对每块内基数较低的列效果显著。
* **bloom&#95;filter**：以概率方式判断某个值是否存在于某个数据块中，从而为集合成员资格提供快速的近似过滤。适用于优化查找“大海捞针”这类场景中需要正向匹配的查询。
* **tokenbf&#95;v1 / ngrambf&#95;v1**：专门用于在字符串中搜索 token 或字符序列的 Bloom filter 变体——对日志数据或文本搜索场景特别有用。

尽管功能强大，但必须谨慎使用跳过索引。只有在能够排除有意义数量的数据块时，它们才会带来收益；如果查询或数据结构与索引不匹配，实际上会引入额外开销。如果某个数据块中存在哪怕一个匹配值，该整块数据仍然必须被读取。

**有效地使用跳过索引通常依赖于被索引列与表主键之间存在较强的相关性，或者通过插入数据时将相似值聚集在一起来实现。**

总体而言，在确保合理的主键设计和类型优化之后，再考虑应用数据跳过索引效果最佳。它们在以下情况下特别有用：

* 列整体基数较高，但在单个数据块内基数较低。
* 稀有但对搜索至关重要的值（例如错误码、特定 ID）。
* 在具有局部化分布的非主键列上进行过滤的场景。

请务必：

1. 使用真实数据和真实查询测试跳过索引。尝试不同的索引类型和粒度值。
2. 使用如 send&#95;logs&#95;level=&#39;trace&#39; 和 `EXPLAIN indexes=1` 等工具评估其影响，以查看索引效果。
3. 始终评估索引的大小及其受粒度影响的情况。减小粒度通常会在一定程度上提升性能，因为会有更多粒度被过滤并无需扫描。然而，由于较小粒度会增大索引尺寸，性能也可能因此下降。针对不同粒度取值测量性能和索引大小。这一点对 Bloom filter 索引尤为重要。

<p />

**在合适的场景下使用时，跳过索引可以带来显著的性能提升——而如果盲目使用，它们则可能增加不必要的成本。**

有关数据跳过索引的更详细指南，请参见[此处](/sql-reference/statements/alter/skipping-index)。


## 示例 {#example}

考虑以下经过优化的表。该表包含 Stack Overflow 数据,每行对应一篇帖子。

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

该表针对按帖子类型和日期进行过滤和聚合的查询进行了优化。假设我们希望统计 2009 年之后发布且浏览量超过 10,000,000 的帖子数量。

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

因此，它就成为数据跳过索引的一个合乎逻辑的选择。鉴于其数值类型，使用 `minmax` 索引是合理的。我们使用以下 `ALTER TABLE` 命令添加索引——先添加索引，然后再对其进行“物化”。

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

此索引也可以在最初创建表时添加。将 `minmax` 索引定义为 DDL 一部分的表结构如下：

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

下方动画展示了在示例表上构建 `minmax` 跳过索引的过程，它会为表中每个行块（粒度）跟踪 `ViewCount` 的最小值和最大值：

<Image img={building_skipping_indices} size="lg" alt="构建跳过索引" />

再次执行之前的查询，可以看到性能有了显著提升。请注意扫描的行数减少了：

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 行结果。耗时: 0.012 秒。处理了 39.11 千行，321.39 KB (3.40 百万行/秒，27.93 MB/秒)。
```

`EXPLAIN indexes = 1` 可以确认索引已被使用。

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)
```


┌─explain────────────────────────────────────────────────────────────┐
│ Expression（（Project names + Projection））                        │
│   Aggregating                                                      │
│     Expression（GROUP BY 之前）                                     │
│       Expression                                                   │
│         ReadFromMergeTree (stackoverflow.posts)                    │
│         Indexes:                                                   │
│           MinMax                                                   │
│             Keys:                                                  │
│               CreationDate                                         │
│             Condition: (CreationDate in (&#39;1230768000&#39;, +Inf))      │
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
│             Name: view&#95;count&#95;idx                                   │
│             Description: minmax GRANULARITY 1                      │
│             Parts: 5/123                                           │
│             Granules: 23/8513                                      │
└────────────────────────────────────────────────────────────────────┘

29 行。耗时：0.211 秒。

```

我们还展示了一个动画，说明 minmax 跳数索引如何在示例查询中修剪所有不可能包含 `ViewCount` > 10,000,000 谓词匹配的行块：

<Image img={using_skipping_indices} size="lg" alt="使用跳数索引"/>
```


## 相关文档 {#related-docs}

- [数据跳数索引指南](/optimize/skipping-indexes)
- [数据跳数索引示例](/optimize/skipping-indexes/examples)
- [操作数据跳数索引](/sql-reference/statements/alter/skipping-index)
- [系统表信息](/operations/system-tables/data_skipping_indices)
