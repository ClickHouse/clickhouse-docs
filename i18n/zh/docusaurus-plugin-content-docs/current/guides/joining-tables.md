---
'title': '在 ClickHouse 中使用 JOINs'
'description': '如何在 ClickHouse 中连接 TABLE'
'keywords':
- 'joins'
- 'join tables'
'slug': '/guides/joining-tables'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import joins_1 from '@site/static/images/guides/joins-1.png';
import joins_2 from '@site/static/images/guides/joins-2.png';
import joins_3 from '@site/static/images/guides/joins-3.png';
import joins_4 from '@site/static/images/guides/joins-4.png';
import joins_5 from '@site/static/images/guides/joins-5.png';

ClickHouse 具有 [完整的 `JOIN` 支持](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)，提供了多种连接算法。为了最大化性能，我们建议遵循本指南中列出的连接优化建议。

- 对于最佳性能，用户应尽量减少查询中的 `JOIN` 数量，特别是在需要毫秒性能的实时分析工作负载中。一个查询的最大连接数应为 3 到 4 个。我们在 [数据建模部分](/data-modeling/schema-design) 中详细介绍了一些减少连接的变化，包括非规范化、字典和物化视图。
- 目前，ClickHouse 不会重新排序连接。始终确保最小的表位于 JOIN 的右侧。这将被大多数连接算法保存在内存中，并确保查询的内存开销最低。
- 如果您的查询需要直接连接，即 `LEFT ANY JOIN` - 如下所示，我们建议在可能的情况下使用 [字典](/dictionary)。

<Image img={joins_1} size="sm" alt="左任意连接"/>

- 如果执行内部连接，通常将其写为使用 `IN` 子句的子查询更为优化。考虑以下两个功能上等效的查询。两者都查找在问题中不提及 ClickHouse 但在 `comments` 中提及的 `posts` 数量。

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

请注意，我们使用 `ANY INNER JOIN` 而不是普通的 `INNER` 连接，因为我们不想要笛卡尔积，即我们希望每个帖子仅匹配一次。

此连接可以使用子查询重写，从而显著提高性能：

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

尽管 ClickHouse 尝试将条件下推到所有连接子句和子查询中，我们仍然建议用户总是手动将条件应用于所有子子句，以尽量减少要 `JOIN` 的数据大小。考虑以下示例，我们希望计算自 2020 年以来与 Java 相关的帖子点赞数量。

一个朴素的查询，左侧是较大的表，完成时间为 56 秒：

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

将此 JOIN 重新排序显著提高了性能，时间缩短至 1.5 秒：

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

向左侧表添加过滤器使性能进一步提升至 0.5 秒。

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

如前所述，通过将 `INNER JOIN` 移动到子查询中，此查询可以进一步改进，同时保持外部和内部查询的过滤器。

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

ClickHouse 支持多种 [连接算法](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。这些算法通常在性能和内存使用之间进行权衡。以下是基于 ClickHouse 连接算法的相对内存消耗和执行时间的概述：

<br />

<Image img={joins_2} size="lg" alt="按内存速度连接"/>

<br />

这些算法决定了连接查询的计划和执行方式。默认情况下，ClickHouse 根据所使用的连接类型、严格性和连接表的引擎使用直接或哈希连接算法。或者，ClickHouse 可以配置为在运行时根据资源可用性和使用情况自适应选择并动态更改要使用的连接算法：当 `join_algorithm=auto` 时，ClickHouse 首先尝试哈希连接算法，如果该算法的内存限制被违反，则算法会动态切换至部分合并连接。您可以通过跟踪日志观察选择了哪个算法。ClickHouse 还允许用户通过 `join_algorithm` 设置指定所需的连接算法。

下面显示了每种连接算法支持的 `JOIN` 类型，优化前应考虑这些类型：

<br />

<Image img={joins_3} size="lg" alt="连接特性"/>

<br />

每种 `JOIN` 算法的详细描述可以在 [这里](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2) 找到，包括它们的优缺点和扩展特性。

选择合适的连接算法取决于您是希望优化内存还是性能。

## 优化 JOIN 性能 {#optimizing-join-performance}

如果您的关键优化指标是性能，并且希望尽快执行连接，可以使用以下决策树来选择合适的连接算法：

<br />

<Image img={joins_4} size="lg" alt="连接流程图"/>

<br />

- **(1)** 如果来自右侧表的数据可以预加载到一个内存中低延迟的键值数据结构中，例如字典，并且连接键与底层键值存储的键属性匹配，如果 `LEFT ANY JOIN` 语义是足够的 - 则 **直接连接** 适用，并提供最快的方法。

- **(2)** 如果您表的 [物理行顺序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) 与连接键排序顺序匹配，那么这要看情况。在这种情况下，**全排序合并连接** [跳过](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order) 排序阶段，从而显著减少内存使用，加之根据数据大小和连接键值的分布，执行时间比某些哈希连接算法更快。

- **(3)** 如果右侧表可以适应内存，即使有 [额外的内存使用开销](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary) 的 **并行哈希连接**，那么此算法或哈希连接可能更快。这取决于数据大小、数据类型和连接键列的值分布。

- **(4)** 如果右侧表不能适应内存，则这又要看情况。ClickHouse 提供三种不依赖于内存的连接算法。所有这三种算法都暂时将数据溢出到磁盘。**全排序合并连接** 和 **部分合并连接** 需要对数据进行预排序。**Grace 哈希连接** 则从数据构建哈希表。根据数据量、数据类型和连接键列的值分布，某些情况下，从数据构建哈希表的速度可能快于对数据进行排序，反之亦然。

部分合并连接在连接大表时优化了内存的使用，但牺牲了连接速度，因此速度相当慢。尤其是在左表的物理行顺序与连接键排序顺序不匹配时。

Grace 哈希连接是三种不依赖于内存的连接算法中最灵活的，提供了良好的内存使用与连接速度的控制，其 [grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 设置。根据数据量，当选择的 [buckets](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2) 数量使得两种算法的内存使用大致对齐时，Grace 哈希可能比部分合并算法快或慢。当 Grace 哈希连接的内存使用配置得大致与全排序合并的内存使用对齐时，在我们的测试运行中，全排序合并总是更快。

三种非内存约束算法中哪个算法最快取决于数据的数量、数据类型和连接键列的值分布。最好使用现实数据量的真实数据运行一些基准测试，以确定哪个算法是最快的。

## 优化内存使用 {#optimizing-for-memory}

如果您希望将连接优化为最低的内存使用，而不是最快的执行时间，则可以使用以下决策树：

<br />

<Image img={joins_5} size="lg" alt="连接内存优化决策树" />

<br />

- **(1)** 如果您的表的物理行顺序与连接键的排序顺序匹配，则 **全排序合并连接** 的内存使用是最低的。再加上良好的连接速度，因为排序阶段是 [禁用](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order) 的。
- **(2)** **Grace 哈希连接** 可以通过 [配置](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 高数量的 [buckets](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2) 来调优，以非常低的内存使用为代价。**部分合并连接** 有意使用较少的主内存。**全排序合并连接** 启用外部排序的情况下通常使用的内存比部分合并连接多（假设行顺序与键排序顺序不匹配），其好处是显著更好的连接执行时间。

对于需要更多详细信息的用户，我们推荐以下 [博客系列](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。
