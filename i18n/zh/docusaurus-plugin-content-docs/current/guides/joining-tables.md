---
title: '在 ClickHouse 中使用 JOIN'
description: '如何在 ClickHouse 中进行表连接'
keywords: ['JOIN', '表连接']
slug: /guides/joining-tables
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import joins_1 from '@site/static/images/guides/joins-1.png';
import joins_2 from '@site/static/images/guides/joins-2.png';
import joins_3 from '@site/static/images/guides/joins-3.png';
import joins_4 from '@site/static/images/guides/joins-4.png';
import joins_5 from '@site/static/images/guides/joins-5.png';

ClickHouse 具有[完整的 `JOIN` 支持](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)，并提供多种连接算法可供选择。为最大化性能，我们建议遵循本指南中列出的连接优化建议。

* 为获得最佳性能，用户应尽量减少查询中的 `JOIN` 数量，特别是对于需要毫秒级性能的实时分析型工作负载。单个查询中的 `JOIN` 数量最好控制在 3 到 4 个以内。我们在[数据建模章节](/data-modeling/schema-design)中详细介绍了多种减少 `JOIN` 的方式，包括反规范化、字典以及物化视图。
* 当前 ClickHouse 不会自动重排 `JOIN` 的顺序。请始终确保最小的表位于 `JOIN` 的右侧。对于大多数连接算法，右侧的表会被保留在内存中，从而保证查询的内存开销最低。
* 如果查询需要直接连接（例如 `LEFT ANY JOIN`，如下所示），在可能的情况下，我们建议使用 [Dictionaries](/dictionary)。

<Image img={joins_1} size="sm" alt="Left any join" />

* 如果执行的是内连接（inner join），通常将其改写为使用 `IN` 子查询会更加高效。请考虑下面两个在功能上等价的查询。两者都用于查找这样一些 `posts`：在问题中没有提到 ClickHouse，但在 `comments` 中提到了。

```sql
SELECT count()
FROM stackoverflow.posts AS p
ANY INNER `JOIN` stackoverflow.comments AS c ON p.Id = c.PostId
WHERE (p.Title != '') AND (p.Title NOT ILIKE '%clickhouse%') AND (p.Body NOT ILIKE '%clickhouse%') AND (c.Text ILIKE '%clickhouse%')

┌─count()─┐
│      86 │
└─────────┘

1 row in set. Elapsed: 8.209 sec. Processed 150.20 million rows, 56.05 GB (18.30 million rows/s., 6.83 GB/s.)
Peak memory usage: 1.23 GiB.
```

请注意，我们使用的是 `ANY INNER JOIN` 而不是普通的 `INNER JOIN`，因为我们不希望产生笛卡尔积，也就是说，我们只希望每篇帖子只对应一个匹配结果。

这个 join 可以通过使用子查询来重写，从而显著提升性能：

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

尽管 ClickHouse 会尝试将过滤条件下推到所有 `JOIN` 子句和子查询中，但我们仍然建议用户在可能的情况下始终在所有相关子句中手动应用这些条件，从而最大限度减少参与 `JOIN` 的数据量。请看下面的示例，我们希望统计自 2020 年以来与 Java 相关的帖子获得的点赞数量。

一个较为朴素的查询，将较大的表放在左侧，完成耗时为 56 秒：
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
```

在左侧表格上添加筛选条件后，性能进一步提升到 0.5 秒。

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

正如前面所述，还可以通过将 `INNER JOIN` 移动到子查询中来进一步改进此查询，同时在外层查询和内层查询中都保留该过滤条件。

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

ClickHouse 支持多种 [JOIN 算法](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。这些算法通常在内存使用与性能之间进行权衡。下文根据相对内存消耗和执行时间，对 ClickHouse 的 JOIN 算法进行概览：

<br />

<Image img={joins_2} size="lg" alt="按内存消耗划分的 JOIN 速度"/>

<br />

这些算法决定了 JOIN 查询的规划和执行方式。默认情况下，ClickHouse 会根据使用的 JOIN 类型、严格性以及参与 JOIN 的表引擎，在 direct 或 hash JOIN 算法之间进行选择。也可以将 ClickHouse 配置为在运行时根据资源可用性和使用情况，自适应选择并动态切换所用的 JOIN 算法：当 `join_algorithm=auto` 时，ClickHouse 会首先尝试 hash JOIN 算法，如果该算法触发了内存限制，则会在执行过程中即时切换为 partial merge join。可以通过 trace 日志查看最终选择了哪种算法。ClickHouse 也允许用户通过 `join_algorithm` 设置显式指定期望的 JOIN 算法。

每种 JOIN 算法所支持的 `JOIN` 类型如下所示，在进行优化之前应加以考虑：

<br />

<Image img={joins_3} size="lg" alt="JOIN 功能特性"/>

<br />

关于每种 `JOIN` 算法的完整详细说明（包括其优缺点以及扩展性特征）可在[此处](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)查阅。

选择合适的 JOIN 算法取决于是优先优化内存占用，还是优先优化性能。



## 优化 JOIN 性能 {#optimizing-join-performance}

如果你的首要优化指标是性能，并且希望尽可能快地执行 join，可以使用下面的决策树来选择合适的 join 算法：

<br />

<Image img={joins_4} size="lg" alt="join flowchart"/>

<br />

- **(1)** 如果右侧表中的数据可以预先加载到内存中的低延迟键值数据结构（例如字典）中，并且 join key 与底层键值存储的键属性相匹配，且 `LEFT ANY JOIN` 语义已经足够——那么可以使用 **direct join**，它是速度最快的方式。

- **(2)** 如果你的表的[物理行顺序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)与 join key 的排序顺序一致，那么就要视情况而定。在这种情况下，**full sorting merge join（全排序合并 JOIN）** 会[跳过](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)排序阶段，从而显著降低内存使用量，并且根据数据大小和 join key 值分布的不同，其执行时间可能比某些 hash join 算法更快。

- **(3)** 如果右表可以完全装入内存，即便考虑到 **parallel hash join（并行哈希 JOIN）** 的[额外内存开销](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary)，那么该算法或普通 hash join 可能会更快。这取决于数据大小、数据类型以及 join key 列的值分布。

- **(4)** 如果右表无法装入内存，那么仍然要视情况而定。ClickHouse 提供了三种非内存绑定（non-memory bound）的 join 算法。这三种算法都会临时将数据写入磁盘。**Full sorting merge join（全排序合并 JOIN）** 和 **partial merge join（部分合并 JOIN）** 需要事先对数据进行排序，而 **Grace hash join** 则是基于数据构建哈希表。根据数据量、数据类型以及 join key 列的值分布，有些场景下基于数据构建哈希表会比对数据排序更快，反之亦然。

Partial merge join 针对大表 join 场景在尽量降低内存使用方面进行了优化，但代价是 join 速度较慢。尤其当左表的物理行顺序与 join key 的排序顺序不一致时更为明显。

Grace hash join 是三种非内存绑定 join 算法中最灵活的一种，并通过其 [grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 设置，为在内存使用与 join 速度之间进行权衡提供了良好的控制能力。取决于数据量，当 [buckets](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2) 的数量选择得使两种算法的内存使用大致相当时，grace hash 的速度可能比 partial merge 算法更快，也可能更慢。而当 grace hash join 的内存使用被配置为与 full sorting merge 的内存使用大致一致时，在我们的测试中 full sorting merge 始终更快。

这三种非内存绑定算法中哪一种最快，取决于数据量、数据类型以及 join key 列的值分布。为了确定哪一种算法最快，最好始终在具有真实数据规模和真实数据特征的情况下进行基准测试。



## 针对内存进行优化 {#optimizing-for-memory}

如果你希望在一次 join 中优先优化为尽可能低的内存占用，而不是追求最快的执行时间，那么可以使用下面这棵决策树：

<br />

<Image img={joins_5} size="lg" alt="Join 内存优化决策树" />

<br />

- **(1)** 如果你的表的物理行顺序与 join 键的排序顺序一致，那么 **full sorting merge join** 的内存占用已经低到极致。同时还能获得不错的 join 速度，因为排序阶段会被[禁用](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)。
- **(2)** 通过[配置](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)较多的[buckets](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2)，可以将 **grace hash join** 调优到非常低的内存占用，但会以 join 速度为代价。**partial merge join** 刻意只使用少量主内存。开启外部排序的 **full sorting merge join** 通常会比 partial merge join 使用更多内存（假设行顺序与键排序顺序不匹配），但能显著缩短 join 的执行时间。

对于需要了解上述内容更多细节的用户，我们推荐阅读这一[博客系列](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。
