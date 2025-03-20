---
title: 在 ClickHouse 中使用 JOIN
description: 如何在 ClickHouse 中连接表
keywords: ['joins', 'join tables']
---

import joins_1 from '@site/static/images/guides/joins-1.png';
import joins_2 from '@site/static/images/guides/joins-2.png';
import joins_3 from '@site/static/images/guides/joins-3.png';
import joins_4 from '@site/static/images/guides/joins-4.png';
import joins_5 from '@site/static/images/guides/joins-5.png';

ClickHouse 完全支持 [JOIN](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)，并提供多种连接算法。为了最大限度地提高性能，我们建议遵循本指南中列出的连接优化建议。

- 为了获得最佳性能，用户应尽量减少查询中的 `JOIN` 数量，特别是对于需要毫秒级性能的实时分析工作负载。建议最多在一个查询中使用 3 到 4 个连接。我们在 [数据建模部分](/data-modeling/schema-design) 中详细说明了多种减少连接的方法，包括非规范化、字典和物化视图。
- 目前，ClickHouse 不会重新排序连接。请始终确保最小的表位于连接的右侧。这将在大多数连接算法中保存在内存中，并确保查询的内存开销最低。
- 如果您的查询需要直接连接，例如 `LEFT ANY JOIN`（如下所示），我们建议在可能的地方使用 [字典](/dictionary)。

<br />

<img src={joins_1}
    alt="NEEDS ALT"
    class="image"
    style={{width: '250px'}}
/>

<br />

- 如果执行内部连接，通常将其作为使用 `IN` 子句的子查询来编写更为优化。考虑以下查询，这两个查询功能上等效。它们都查找未在问题中提及 ClickHouse，但在 `comments` 中提及的 `posts` 的数量。

```sql
SELECT count()
FROM stackoverflow.posts AS p
ANY INNER `JOIN` stackoverflow.comments AS c ON p.Id = c.PostId
WHERE (p.Title != '') AND (p.Title NOT ILIKE '%clickhouse%') AND (p.Body NOT ILIKE '%clickhouse%') AND (c.Text ILIKE '%clickhouse%')

┌─count()─┐
│  	86 │
└─────────┘

1 row in set. Elapsed: 8.209 sec. Processed 150.20 million rows, 56.05 GB (18.30 million rows/s., 6.83 GB/s.)
Peak memory usage: 1.23 GiB.
```

注意，我们使用 `ANY INNER JOIN` 而不是简单的 `INNER` 连接，因为我们不希望得到笛卡尔积，即我们希望每个帖子只有一个匹配。

这个连接可以通过使用子查询进行重写，从而显著提高性能：

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (Title != '') AND (Title NOT ILIKE '%clickhouse%') AND (Body NOT ILIKE '%clickhouse%') AND (Id IN (
	SELECT PostId
	FROM stackoverflow.comments
	WHERE Text ILIKE '%clickhouse%'
))
┌─count()─┐
│  	86 │
└─────────┘

1 row in set. Elapsed: 2.284 sec. Processed 150.20 million rows, 16.61 GB (65.76 million rows/s., 7.27 GB/s.)
Peak memory usage: 323.52 MiB.
```

虽然 ClickHouse 会尝试将条件推送到所有连接子句和子查询中，但我们建议用户始终在可能的情况下手动将条件应用于所有子子句，从而最小化要 `JOIN` 的数据大小。考虑以下示例，我们希望计算自 2020 年以来与 Java 相关的帖子获得的点赞数。

一个简单的查询，其中较大的表位于左侧，完成时间为 56 秒：

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.posts AS p
INNER JOIN stackoverflow.votes AS v ON p.Id = v.PostId
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 56.642 sec. Processed 252.30 million rows, 1.62 GB (4.45 million rows/s., 28.60 MB/s.)
```

重新排序此连接可显著提高性能，达到 1.5 秒：

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 1.519 sec. Processed 252.30 million rows, 1.62 GB (166.06 million rows/s., 1.07 GB/s.)
```

在右侧表中添加过滤器进一步提高了性能，达到 0.5 秒。

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01') AND (v.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 0.597 sec. Processed 81.14 million rows, 1.31 GB (135.82 million rows/s., 2.19 GB/s.)
Peak memory usage: 249.42 MiB.
```

如前所述，通过将 `INNER JOIN` 移到子查询中，可以进一步改善此查询，同时在外部和内部查询中保持过滤。

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

## 选择连接算法 {#choosing-a-join-algorithm}

ClickHouse 支持多种 [连接算法](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。这些算法通常在内存使用和性能之间进行权衡。以下是按相对内存消耗和执行时间对 ClickHouse 连接算法的概述：

<br />

<img src={joins_2}
    alt='NEEDS ALT'
    class='image'
    style={{width: '500px'}}
/>

<br />

这些算法决定了连接查询的规划和执行方式。默认情况下，ClickHouse 根据所用连接类型和所连接表的严格性及引擎使用直接或哈希连接算法。或者，ClickHouse 可以配置为根据资源的可用性和使用情况自适应选择并动态更改连接算法：当 `join_algorithm=auto` 时，ClickHouse 首先尝试哈希连接算法，如果该算法的内存限制被违反，则该算法会动态切换到部分合并连接。您可以通过跟踪日志观察选择了哪个算法。ClickHouse 还允许用户通过 `join_algorithm` 设置指定所需的连接算法。

每种连接算法支持的 `JOIN` 类型如下，并应在优化之前考虑：

<br />

<img src={joins_3}
    alt='NEEDS ALT'
    class='image'
    style={{width: '600px'}}
/>

<br />

每种 `JOIN` 算法的详细描述可以在 [这里](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2) 找到，包括它们的优点、缺点和扩展特性。

选择合适的连接算法取决于您是希望优化内存还是性能。

## 优化 JOIN 性能 {#optimizing-join-performance}

如果您的关键优化指标是性能，并且您希望尽快执行连接，则可以使用以下决策树选择正确的连接算法：

<br />

<img src={joins_4}
    alt='NEEDS ALT'
    class='image'
    style={{width: '600px'}}
/>

<br />

- **(1)** 如果右侧表的数据可以预加载到内存中的低延迟键值数据结构中，例如字典，并且连接键与底层键值存储的键属性匹配，并且 `LEFT ANY JOIN` 语义足够 - 那么 **直接连接** 是适用的，并提供最快的方式。

- **(2)** 如果您的表的 [物理行顺序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) 与连接键的排序顺序匹配，则情况有所不同。在这种情况下，**全排序合并连接** [跳过](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order) 排序阶段，显著减少内存使用，并且根据数据大小和连接键值分布，执行时间比某些哈希连接算法更快。

- **(3)** 如果右侧表可以容纳在内存中，即使是 [额外的内存使用开销](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary) 也可以使用 **并行哈希连接**，那么此算法或哈希连接可能更快。具体取决于数据大小、数据类型和连接键列的值分布。

- **(4)** 如果右侧表不适合内存，则情况再次取决于。ClickHouse 提供三种无内存限制的连接算法。这三种算法都暂时将数据溢出到磁盘。**全排序合并连接** 和 **部分合并连接** 需要事先对数据进行排序。**Grace 哈希连接** 是从数据中构建哈希表。根据数据的量、数据类型和连接键列的值分布，可能会出现从数据构建哈希表比对数据进行排序更快的情况，反之亦然。

部分合并连接在连接大表时优化了内存使用，代价是连接速度较慢。当左侧表的物理行顺序与连接键的排序顺序不匹配时，尤其是如此。

Grace 哈希连接是三种无内存限制的连接算法中最灵活的，它通过其 [grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 设置提供了良好的内存使用与连接速度的控制。根据数据量，Grace 哈希连接可能比部分合并算法更快或更慢，当选择的 [桶](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2) 数量使两个算法的内存使用大致对齐时。如果配置 Grace 哈希连接的内存使用大致与全排序合并连接的内存使用对齐，则我们的测试结果中全排序合并连接的速度始终更快。

哪一个三种无内存限制算法最快取决于数据量、数据类型和连接键列的值分布。最好的做法是使用真实数据量进行一些基准测试，以确定哪个算法最快。

## 优化内存使用 {#optimizing-for-memory}

如果您希望优化连接以获得最低的内存使用，而不是最快的执行时间，则可以使用以下决策树：

<br />

<img src={joins_5}
    alt='NEEDS ALT'
    class='image'
    style={{width: '400px'}}
/>

<br />

- **(1)** 如果您的表的物理行顺序与连接键的排序顺序匹配，则 **全排序合并连接** 的内存使用将降到最低。此外，由于禁用排序阶段，连接速度也会良好。[](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)
- **(2)** 通过 [配置](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 高数量的 [桶](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2)，可以为 **Grace 哈希连接** 调整以达到非常低的内存使用，但代价是连接速度。**部分合并连接** 刻意使用较少的主内存。与部分合并连接相比，启用外部排序的 **全排序合并连接** 通常使用更多内存（假定行顺序与键排序顺序不匹配），而其执行时间会显著更好。

对于需要更多细节的用户，我们推荐以下 [博客系列](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。
