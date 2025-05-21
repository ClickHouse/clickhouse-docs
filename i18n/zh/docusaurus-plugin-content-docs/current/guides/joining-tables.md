---
'title': '在 ClickHouse 中使用 JOIN'
'description': '如何在 ClickHouse 中连接表'
'keywords':
- 'joins'
- 'join tables'
'slug': '/guides/joining-tables'
---

import Image from '@theme/IdealImage';
import joins_1 from '@site/static/images/guides/joins-1.png';
import joins_2 from '@site/static/images/guides/joins-2.png';
import joins_3 from '@site/static/images/guides/joins-3.png';
import joins_4 from '@site/static/images/guides/joins-4.png';
import joins_5 from '@site/static/images/guides/joins-5.png';

ClickHouse 现在支持 [完整的 `JOIN` 功能](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)，并提供广泛的连接算法。为了最大化性能，我们建议遵循本指南中列出的连接优化建议。

- 为了获得最佳性能，用户应尽量减少查询中的 `JOIN` 数量，特别是在需要毫秒级性能的实时分析工作负载中。每个查询中的连接数应以 3 到 4 个为上限。我们在 [数据建模部分](/data-modeling/schema-design) 中详细介绍了最小化连接的多个变更，包括反规范化、字典和物化视图。
- 当前，ClickHouse 不会重新排列连接。始终确保最小的表位于连接的右侧。这将对大多数连接算法保留在内存中，并确保查询的内存开销最低。
- 如果您的查询需要直接连接，即 `LEFT ANY JOIN`，如下面所示，我们建议尽可能使用 [字典](/dictionary)。

<Image img={joins_1} size="sm" alt="Left any join"/>

- 如果执行内部连接，通常将其作为使用 `IN` 子句的子查询书写会更为优化。考虑以下查询，这两个查询在功能上是等价的。它们都查找在问题中未提及 ClickHouse 但在 `comments` 中提到的 `posts` 数量。

```sql
SELECT count()
FROM stackoverflow.posts AS p
ANY INNER `JOIN` stackoverflow.comments AS c ON p.Id = c.PostId
WHERE (p.Title != '') AND (p.Title NOT ILIKE '%clickhouse%') AND (p.Body NOT ILIKE '%clickhouse%') AND (c.Text ILIKE '%clickhouse%')

┌─count()─┐
│       86 │
└─────────┘

1 row in set. Elapsed: 8.209 sec. Processed 150.20 million rows, 56.05 GB (18.30 million rows/s., 6.83 GB/s.)
Peak memory usage: 1.23 GiB.
```

注意，我们使用 `ANY INNER JOIN` 而不是简单的 `INNER` 连接，因为我们不希望得到笛卡尔积，即每个帖子只希望有一个匹配。

可以通过使用子查询重写此连接，从而显著提高性能：

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

尽管 ClickHouse 会尝试将条件下推到所有连接子句和子查询，我们建议用户始终手动将条件应用到所有子子句中，从而最小化要 `JOIN` 的数据大小。考虑以下示例，我们希望计算自 2020 年以来与 Java 相关的帖子中的好评数。

一个天真的查询，将较大的表放在左侧，完成需要 56 秒：

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

重新排序此连接将性能显著提高到 1.5 秒：

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

向右侧表添加过滤条件将进一步提高性能，达到 0.5 秒。

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

如前所述，通过将 `INNER JOIN` 移到子查询中，可以更进一步地提升查询性能，同时在外部查询和内部查询中保持过滤条件。

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

ClickHouse 支持多种 [连接算法](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。这些算法通常在内存使用和性能之间进行权衡。以下是 ClickHouse 连接算法的概述，基于其相对内存消耗和执行时间：

<br />

<Image img={joins_2} size="lg" alt="speed by memory for joins"/>

<br />

这些算法决定了连接查询的计划和执行方式。默认情况下，ClickHouse 基于使用的连接类型、严格性和连接表的引擎使用直接或哈希连接算法。或者，ClickHouse 可以配置为根据资源的可用性和使用情况，在运行时自适应选择和动态改变要使用的连接算法：当 `join_algorithm=auto` 时，ClickHouse 首先尝试哈希连接算法，如果该算法的内存限制被违反，算法会即时切换为部分合并连接。您可以通过跟踪日志观察选择了哪个算法。ClickHouse 还允许用户通过 `join_algorithm` 设置指定期望的连接算法。

每种连接算法支持的 `JOIN` 类型如下，优化前应考虑：

<br />

<Image img={joins_3} size="lg" alt="join features"/>

<br />

每种 `JOIN` 算法的详细描述可以在 [这里](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2) 找到，包括它们的优缺点和扩展特性。

选择合适的连接算法取决于您是希望优化内存，还是优化性能。

## 优化 JOIN 性能 {#optimizing-join-performance}

如果您的关键优化指标是性能，并且希望尽可能快地执行连接，则可以使用以下决策树来选择合适的连接算法：

<br />

<Image img={joins_4} size="lg" alt="join flowchart"/>

<br />

- **(1)** 如果来自右侧表的数据可以预加载到内存中的低延迟键值数据结构中，例如字典，并且如果连接键匹配底层键值存储的键属性，并且 `LEFT ANY JOIN` 语义是适当的 - 则适用 **直接连接**，并提供最快的方案。

- **(2)** 如果您的表的 [物理行顺序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) 与连接键的排序顺序匹配，那么这取决于情况。在这种情况下，**全排序合并连接** [跳过](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order) 排序阶段，从而显著减少内存使用，并且根据数据大小和连接键值分布，执行时间比一些哈希连接算法更快。

- **(3)** 如果右侧表可以放入内存，即使有 [额外的内存使用开销](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary) 的 **并行哈希连接**，那么此算法或哈希连接可能更快。这取决于数据大小、数据类型和连接键列的值分布。

- **(4)** 如果右侧表无法放入内存，那就又要看情况。ClickHouse 提供三种非内存限制的连接算法。所有这三种算法都会暂时将数据溢出到磁盘。**全排序合并连接** 和 **部分合并连接** 需要先对数据进行排序。**Grace 哈希连接** 则从数据中构建哈希表。根据数据量、数据类型和连接键列的值分布，可能会出现从数据中构建哈希表的速度快于排序数据的情况，反之亦然。

部分合并连接在连接大型表时优化以最小化内存使用，代价是连接速度较慢。这尤其在左表的物理行顺序与连接键的排序顺序不匹配时更为明显。

Grace 哈希连接是三种非内存限制连接算法中最灵活的，提供了良好的内存使用与连接速度之间的控制，其 [grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 设置。根据数据量的不同，当选择的 [buckets](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2) 数量使得这两种算法的内存使用大致对齐时，Grace 哈希可能比部分合并算法更快或更慢。当配置 Grace 哈希连接的内存使用大致与全排序合并的内存使用对齐时，我们的测试中全排序合并的速度总是更快。

哪一种三种非内存限制的算法最快，取决于数据量、数据类型和连接键列的值分布。最好使用真实的数据量进行一些基准测试，以确定哪种算法最快。

## 内存优化 {#optimizing-for-memory}

如果您希望优化连接以获得最低的内存使用，而不是最快的执行时间，则可以使用此决策树：

<br />

<Image img={joins_5} size="lg" alt="Join memory optimization decision tree" />

<br />

- **(1)** 如果您的表的物理行顺序与连接键的排序顺序匹配，则 **全排序合并连接** 的内存使用将降到最低。在排序阶段 [被禁用](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order) 的情况下，连接速度也会获得额外的好处。
- **(2)** **Grace 哈希连接** 可以通过 [配置](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 较高的 [buckets](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2) 数量来调优，以获得非常低的内存使用，但代价是连接速度。**部分合并连接** 刻意使用较少的主内存。一般来说，如果行顺序与键的排序顺序不匹配，启用外部排序的 **全排序合并连接** 会比部分合并连接使用更多的内存，但其连接执行时间显著更佳。

对于需要上述更多细节的用户，我们建议以下的 [博客系列](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。
