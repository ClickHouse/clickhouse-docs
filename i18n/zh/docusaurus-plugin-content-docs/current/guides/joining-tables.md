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

ClickHouse 具备[完整的 `JOIN` 支持](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)，并提供多种连接算法可供选择。为获得最佳性能，我们建议遵循本指南中给出的连接优化建议。

* 为了获得最佳性能，用户应尽量减少查询中的 `JOIN` 数量，尤其是在需要毫秒级响应的实时分析型工作负载中。建议单条查询中的连接次数最多为 3 到 4 个。我们在[数据建模部分](/data-modeling/schema-design)中详细介绍了多种减少连接的方案，包括反规范化、字典以及物化视图。
* 当前 ClickHouse 不会对 join 顺序进行重排。请务必确保最小的表位于 Join 的右侧。对于大多数连接算法，这张表会常驻内存，从而将查询的内存开销降到最低。
* 如果查询需要直接连接（即 `LEFT ANY JOIN`）——如下所示，我们建议在可能的情况下使用 [Dictionaries](/dictionary)。

<Image img={joins_1} size="sm" alt="Left any join" />

* 如果执行的是内连接，通常将其改写为使用 `IN` 子查询会更加高效。请看下面两个在功能上等价的查询。它们都用于统计在问题中未提到 ClickHouse、但在 `comments` 中提到 ClickHouse 的 `posts` 数量。

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

请注意，我们使用的是 `ANY INNER JOIN` 而不是普通的 `INNER` join，因为我们不希望得到笛卡尔积，也就是说，我们只希望每篇帖子只匹配到一条记录。

这个 join 可以改写为使用子查询，从而显著提升性能：

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

尽管 ClickHouse 会尝试将条件下推到所有 `JOIN` 子句和子查询中，但我们仍然建议用户在可能的情况下手动将条件应用到所有子句中，从而最大程度减少参与 `JOIN` 的数据量。考虑下面这个示例，我们希望统计自 2020 年以来与 Java 相关的帖子所获得的赞成票数量。

一个朴素的查询（左侧为较大的表）需要 56 秒才能完成：

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.posts AS p
INNER JOIN stackoverflow.votes AS v ON p.Id = v.PostId
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘
```


1 行结果。耗时：56.642 秒。已处理 252.30 百万行，1.62 GB（4.45 百万行/秒，28.60 MB/秒）

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

返回 1 行。用时:1.519 秒。处理了 2.523 亿行,1.62 GB(每秒 1.6606 亿行,1.07 GB/秒)。
````

在左侧表上添加一个过滤条件会进一步提升性能，将查询时间缩短到 0.5 秒。

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01') AND (v.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

返回 1 行。用时:0.597 秒。处理了 8114 万行,1.31 GB(每秒 1.3582 亿行,2.19 GB/秒)。
峰值内存使用量:249.42 MiB。
```

如前所述，通过将 `INNER JOIN` 移入子查询，并在外层和内层查询中都保留该过滤条件，可以进一步改进此查询。

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

1 row in set. Elapsed: 0.383 sec. Processed 99.64 million rows, 804.55 MB (259.85 million rows/s., 2.10 GB/s.)
Peak memory usage: 250.66 MiB.
```


## 选择 JOIN 算法 {#choosing-a-join-algorithm}

ClickHouse 支持多种 [JOIN 算法](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。这些算法通常需要在内存使用和性能之间进行权衡。下图根据相对内存消耗和执行时间概述了 ClickHouse 的 JOIN 算法:

<br />

<Image img={joins_2} size='lg' alt='JOIN 的速度与内存关系' />

<br />

这些算法决定了 JOIN 查询的规划和执行方式。默认情况下,ClickHouse 会根据所使用的 JOIN 类型、严格性以及被连接表的引擎来选择 direct 或 hash join 算法。此外,ClickHouse 还可以配置为根据资源可用性和使用情况在运行时自适应选择并动态更改所使用的 JOIN 算法:当设置 `join_algorithm=auto` 时,ClickHouse 会首先尝试 hash join 算法,如果该算法超出内存限制,则会即时切换到 partial merge join 算法。您可以通过跟踪日志来观察选择了哪种算法。ClickHouse 还允许用户通过 `join_algorithm` 设置自行指定所需的 JOIN 算法。

下图展示了每种 JOIN 算法所支持的 `JOIN` 类型,在进行优化之前应予以考虑:

<br />

<Image img={joins_3} size='lg' alt='JOIN 特性' />

<br />

关于每种 `JOIN` 算法的完整详细说明(包括其优点、缺点和扩展特性)可以在[此处](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)找到。

选择合适的 JOIN 算法取决于您是希望优化内存使用还是性能表现。


## 优化 JOIN 性能 {#optimizing-join-performance}

如果您的核心优化指标是性能,并且希望尽可能快地执行连接操作,可以使用以下决策树来选择合适的连接算法:

<br />

<Image img={joins_4} size='lg' alt='连接流程图' />

<br />

- **(1)** 如果右表的数据可以预加载到内存中的低延迟键值数据结构(例如字典)中,并且连接键与底层键值存储的键属性匹配,且 `LEFT ANY JOIN` 语义能够满足需求,那么 **direct join**(直接连接)适用,并且能提供最快的执行方式。

- **(2)** 如果表的[物理行顺序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)与连接键的排序顺序匹配,则需要视情况而定。在这种情况下,**full sorting merge join**(完全排序归并连接)会[跳过](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)排序阶段,从而显著减少内存使用量,并且根据数据大小和连接键值分布,执行时间可能比某些哈希连接算法更快。

- **(3)** 如果右表能够放入内存,即使考虑到 **parallel hash join**(并行哈希连接)的[额外内存使用开销](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary),该算法或哈希连接可能会更快。这取决于数据大小、数据类型以及连接键列的值分布。

- **(4)** 如果右表无法放入内存,则需要再次视情况而定。ClickHouse 提供三种非内存限制的连接算法。这三种算法都会临时将数据溢出到磁盘。**Full sorting merge join**(完全排序归并连接)和 **partial merge join**(部分归并连接)需要预先对数据进行排序。**Grace hash join**(Grace 哈希连接)则是从数据构建哈希表。根据数据量、数据类型和连接键列的值分布,可能存在从数据构建哈希表比排序数据更快的场景,反之亦然。

Partial merge join 针对大表连接时最小化内存使用进行了优化,但代价是连接速度较慢。当左表的物理行顺序与连接键排序顺序不匹配时,这种情况尤为明显。

Grace hash join 是三种非内存限制连接算法中最灵活的,通过其 [grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 设置可以很好地控制内存使用与连接速度之间的平衡。根据数据量,当选择的[桶](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2)数量使两种算法的内存使用大致相当时,grace hash 可能比 partial merge 算法更快或更慢。当 grace hash join 的内存使用配置为与 full sorting merge 的内存使用大致相当时,在我们的测试中,full sorting merge 始终更快。

三种非内存限制算法中哪一种最快取决于数据量、数据类型以及连接键列的值分布。最佳做法是使用真实的数据量和真实数据运行基准测试,以确定哪种算法最快。


## 内存优化 {#optimizing-for-memory}

如果您希望优化 join 操作以实现最低内存使用而非最快执行时间,可以使用以下决策树:

<br />

<Image img={joins_5} size='lg' alt='Join 内存优化决策树' />

<br />

- **(1)** 如果表的物理行顺序与 join 键排序顺序一致,则**完全排序归并 join**的内存使用量将达到最低。同时还具有良好 join 速度的额外优势,因为排序阶段被[禁用](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)。
- **(2)** **grace hash join** 可以通过[配置](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)大量[桶](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2)来调优以实现极低的内存使用,但会牺牲 join 速度。**部分归并 join**有意使用较少的主内存。启用外部排序的**完全排序归并 join**通常比部分归并 join 使用更多内存(假设行顺序与键排序顺序不一致),但具有显著更好的 join 执行时间优势。

对于需要了解更多详细信息的用户,我们推荐阅读以下[博客系列](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。
