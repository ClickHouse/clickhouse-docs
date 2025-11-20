---
title: '在 ClickHouse 中使用 JOIN'
description: '如何在 ClickHouse 中进行表关联'
keywords: ['joins', 'join tables']
slug: /guides/joining-tables
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import joins_1 from '@site/static/images/guides/joins-1.png';
import joins_2 from '@site/static/images/guides/joins-2.png';
import joins_3 from '@site/static/images/guides/joins-3.png';
import joins_4 from '@site/static/images/guides/joins-4.png';
import joins_5 from '@site/static/images/guides/joins-5.png';

ClickHouse 提供[完整的 `JOIN` 支持](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)，并内置多种连接算法可供选择。为最大化性能，我们建议遵循本指南中列出的连接优化建议。

* 为获得最佳性能，用户应尽量减少查询中的 `JOIN` 数量，尤其是在需要毫秒级响应的实时分析型负载中。建议单个查询中的连接数控制在最多 3 到 4 个。我们在[数据建模章节](/data-modeling/schema-design)中详细介绍了多种用于减少连接的策略，包括反规范化、字典和物化视图。
* 目前，ClickHouse 不会自动重排连接顺序。请始终确保最小的表位于 `JOIN` 的右侧。对于大多数连接算法，这个表会常驻内存，从而将查询的内存开销降到最低。
* 如果查询需要直接连接（即 `LEFT ANY JOIN`，如下所示），建议在可能的情况下使用 [Dictionaries](/dictionary)。

<Image img={joins_1} size="sm" alt="LEFT ANY JOIN 示例" />

* 如果执行的是内连接，通常将其改写为使用 `IN` 子句的子查询会更高效。请看下面这两个在功能上等价的查询。二者都用于查找在问题中未提到 ClickHouse、但在 `comments` 中提到 ClickHouse 的 `posts` 数量。

```sql
SELECT count()
FROM stackoverflow.posts AS p
ANY INNER `JOIN` stackoverflow.comments AS c ON p.Id = c.PostId
WHERE (p.Title != '') AND (p.Title NOT ILIKE '%clickhouse%') AND (p.Body NOT ILIKE '%clickhouse%') AND (c.Text ILIKE '%clickhouse%')

┌─count()─┐
│       86 │
└─────────┘

1 行在集合中。耗时：8.209 秒。处理了 1.502 亿行，56.05 GB（1830 万行/秒，6.83 GB/秒）。
峰值内存使用：1.23 GiB。
```

请注意，我们使用的是 `ANY INNER JOIN` 而不是普通的 `INNER JOIN`，因为我们不希望得到笛卡尔积，也就是说，我们希望每篇帖子只对应一个匹配结果。

这个 JOIN 可以改写为使用子查询，从而显著提升性能：

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (Title != '') AND (Title NOT ILIKE '%clickhouse%') AND (Body NOT ILIKE '%clickhouse%') AND (Id IN (
        SELECT PostId
        FROM stackoverflow.comments
        WHERE Text ILIKE '%clickhouse%'
))
┌─count()─┐
│       86 │
└─────────┘

1 row in set. Elapsed: 2.284 sec. Processed 150.20 million rows, 16.61 GB (65.76 million rows/s., 7.27 GB/s.)
Peak memory usage: 323.52 MiB.
```

虽然 ClickHouse 会尝试将条件下推到所有 `JOIN` 子句和子查询中，但我们仍然建议用户在可能的情况下始终手动将条件应用到所有子句中，从而最大限度地减少参与 `JOIN` 的数据量。考虑下面的示例，我们希望计算自 2020 年以来与 Java 相关的帖子获得的赞数。

一个朴素的查询（左侧为较大的表）在 56 秒内完成：

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.posts AS p
INNER JOIN stackoverflow.votes AS v ON p.Id = v.PostId
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘
```


1 行结果。耗时：56.642 秒。已处理 2.523 亿行，1.62 GB（445 万行/秒，28.60 MB/秒。）

````

重新调整此连接顺序可将性能显著提升至 1.5 秒:

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 1.519 sec. Processed 252.30 million rows, 1.62 GB (166.06 million rows/s., 1.07 GB/s.)
````

在左侧表上增加过滤条件后，性能进一步提升到了 0.5 秒。

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01') AND (v.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

返回 1 行。耗时: 0.597 秒。处理了 81.14 百万行，1.31 GB (135.82 百万行/秒，2.19 GB/秒)。
峰值内存使用: 249.42 MiB。
```

如前所述，还可以通过将 `INNER JOIN` 移动到子查询中，并在外层查询和内层查询中都保留相同的过滤条件，来进一步优化此查询。

```sql
SELECT count() AS upvotes
FROM stackoverflow.votes
WHERE (VoteTypeId = 2) AND (PostId IN (
        SELECT Id
        FROM stackoverflow.posts
        WHERE (CreationDate >= '2020-01-01') AND has(arrayFilter(t -> (t != ''), splitByChar('|', Tags)), 'java')
))

┌─upvotes─┐
│  261915 │
└─────────┘

返回 1 行。用时:0.383 秒。已处理 9964 万行,804.55 MB(259.85 百万行/秒,2.10 GB/秒)。
内存峰值:250.66 MiB。
```


## 选择 JOIN 算法 {#choosing-a-join-algorithm}

ClickHouse 支持多种 [JOIN 算法](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。这些算法通常需要在内存使用和性能之间进行权衡。下图根据相对内存消耗和执行时间概述了 ClickHouse 的 JOIN 算法:

<br />

<Image img={joins_2} size='lg' alt='JOIN 的速度与内存关系' />

<br />

这些算法决定了 JOIN 查询的规划和执行方式。默认情况下,ClickHouse 会根据所使用的 JOIN 类型、严格性以及被连接表的引擎来选择 direct 或 hash JOIN 算法。此外,ClickHouse 还可以配置为根据资源可用性和使用情况在运行时自适应地选择并动态更改所使用的 JOIN 算法:当设置 `join_algorithm=auto` 时,ClickHouse 会首先尝试 hash JOIN 算法,如果该算法超出内存限制,则会即时切换到 partial merge JOIN 算法。您可以通过跟踪日志来观察选择了哪种算法。ClickHouse 还允许用户通过 `join_algorithm` 设置自行指定所需的 JOIN 算法。

下图显示了每种 JOIN 算法所支持的 `JOIN` 类型,在进行优化之前应予以考虑:

<br />

<Image img={joins_3} size='lg' alt='JOIN 特性' />

<br />

关于每种 `JOIN` 算法的完整详细说明(包括其优点、缺点和扩展特性)可以在[此处](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)找到。

选择合适的 JOIN 算法取决于您是希望优化内存使用还是性能表现。


## 优化 JOIN 性能 {#optimizing-join-performance}

如果您的核心优化指标是性能，并且希望尽可能快地执行连接操作，可以使用以下决策树来选择合适的连接算法:

<br />

<Image img={joins_4} size='lg' alt='连接流程图' />

<br />

- **(1)** 如果右表的数据可以预加载到内存中的低延迟键值数据结构(例如字典)中,并且连接键与底层键值存储的键属性匹配,且 `LEFT ANY JOIN` 语义满足需求,那么 **direct join**(直接连接)适用并提供最快的方式。

- **(2)** 如果表的[物理行顺序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)与连接键的排序顺序匹配,则取决于具体情况。在这种情况下,**full sorting merge join**(完全排序归并连接)会[跳过](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)排序阶段,从而显著减少内存使用量,并且根据数据大小和连接键值分布,执行时间可能比某些哈希连接算法更快。

- **(3)** 如果右表可以放入内存,即使考虑到 **parallel hash join**(并行哈希连接)的[额外内存使用开销](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary),该算法或哈希连接可能会更快。这取决于数据大小、数据类型以及连接键列的值分布。

- **(4)** 如果右表无法放入内存,则再次取决于具体情况。ClickHouse 提供三种非内存限制的连接算法。这三种算法都会临时将数据溢出到磁盘。**Full sorting merge join**(完全排序归并连接)和 **partial merge join**(部分归并连接)需要预先对数据进行排序。**Grace hash join** 则是从数据构建哈希表。根据数据量、数据类型和连接键列的值分布,可能存在从数据构建哈希表比排序数据更快的场景,反之亦然。

Partial merge join 针对大表连接时最小化内存使用进行了优化,但代价是连接速度相当慢。当左表的物理行顺序与连接键排序顺序不匹配时,这种情况尤为明显。

Grace hash join 是三种非内存限制连接算法中最灵活的,通过其 [grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 设置可以很好地控制内存使用与连接速度之间的平衡。根据数据量,当选择的 [bucket](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2) 数量使两种算法的内存使用大致相当时,grace hash 可能比 partial merge 算法更快或更慢。当 grace hash join 的内存使用配置为与 full sorting merge 的内存使用大致相当时,在我们的测试运行中,full sorting merge 总是更快。

三种非内存限制算法中哪一种最快取决于数据量、数据类型以及连接键列的值分布。最好始终使用真实数据的实际数据量运行一些基准测试,以确定哪种算法最快。


## 内存优化 {#optimizing-for-memory}

如果您希望优化连接操作以实现最低内存使用而非最快执行时间,可以使用以下决策树:

<br />

<Image img={joins_5} size='lg' alt='连接内存优化决策树' />

<br />

- **(1)** 如果表的物理行顺序与连接键排序顺序一致,则**完全排序归并连接**的内存使用量将达到最低。同时还具有良好连接速度的额外优势,因为排序阶段已被[禁用](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)。
- **(2)** 通过[配置](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)大量[桶](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2),可以将 **grace hash join** 调优至极低的内存使用量,但会牺牲连接速度。**部分归并连接**有意使用较少的主内存。启用外部排序的**完全排序归并连接**通常比部分归并连接使用更多内存(假设行顺序与键排序顺序不一致),但其优势在于连接执行时间显著更短。

如需了解更多详细信息,我们推荐阅读以下[博客系列](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。
