---
'title': '在 ClickHouse 中使用 JOINs'
'description': '如何在 ClickHouse 中连接 TABLES'
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

ClickHouse 具有 [完整的 `JOIN` 支持](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)，提供多种连接算法。为了最大化性能，我们建议遵循本指南中列出的连接优化建议。

- 为了获得最佳性能，用户应尽量减少查询中的 `JOIN` 数量，特别是在实时分析工作负载中，要求毫秒级性能。查询中的 `JOIN` 数量应以 3 到 4 次为上限。我们在 [数据建模部分](/data-modeling/schema-design) 中详细介绍了许多减少连接的方法，包括反规范化、字典和物化视图。
- 当前，ClickHouse 不会重新排序连接。始终确保最小的表位于连接的右侧。这将在大多数连接算法中保留在内存中，并确保查询的内存开销最低。
- 如果您的查询需要直接连接，例如 `LEFT ANY JOIN` - 如下所示，我们建议在可能的情况下使用 [字典](/dictionary)。

<Image img={joins_1} size="sm" alt="左任何连接"/>

- 如果执行内部连接，通常更优的做法是将其写为使用 `IN` 子句的子查询。考虑以下查询，它们在功能上是等价的。两个查询都找出问题中没有提到 ClickHouse 但在 `comments` 中提到的 `posts` 数量。

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

请注意，我们使用 `ANY INNER JOIN` 而不是单纯的 `INNER` 连接，因为我们不想要笛卡尔积，即每个帖子只希望有一个匹配。

这个连接可以通过使用子查询来改写，显著提高性能：

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

尽管 ClickHouse 尝试将条件下推到所有连接子句和子查询中，我们建议用户始终在可能的情况下手动将条件应用于所有子子句，从而最小化需要 `JOIN` 的数据大小。考虑以下示例，我们希望计算自 2020 年以来与 Java 相关的帖子获得的点赞数。

一个天真的查询，当较大的表在左侧时，完成时间为 56 秒：

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

重新排序此连接后，性能显著提升至 1.5 秒：

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

在右侧表中添加过滤器将性能进一步提高到 0.5 秒。

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

通过将 `INNER JOIN` 移动到子查询中，此查询能够得到更大的提升，正如前面提到的，保持外部和内部查询的过滤器。

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

ClickHouse 支持多种 [连接算法](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。这些算法通常在性能和内存使用之间权衡。以下是基于相对内存消耗和执行时间的 ClickHouse 连接算法概述：

<br />

<Image img={joins_2} size="lg" alt="按内存速度排序的连接"/>

<br />

这些算法决定了连接查询的规划和执行方式。默认情况下，ClickHouse 根据所使用的连接类型及连接表的严格性和引擎使用直接或哈希连接算法。或者，ClickHouse 可以配置为在运行时根据资源可用性和使用情况动态选择和更改连接算法：当 `join_algorithm=auto` 时，ClickHouse 首先尝试哈希连接算法，如果该算法的内存限制被违反，算法会动态切换为部分合并连接。您可以通过跟踪日志查看选择了哪个算法。ClickHouse 还允许用户通过 `join_algorithm` 设置来指定希望使用的连接算法。

下表显示了每种连接算法支持的 `JOIN` 类型，并应在优化之前考虑：

<br />

<Image img={joins_3} size="lg" alt="连接特性"/>

<br />

每种 `JOIN` 算法的详细描述可以在 [这里](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2) 找到，包括它们的优缺点和扩展特性。

选择合适的连接算法取决于您是想优化内存还是性能。

## 优化 JOIN 性能 {#optimizing-join-performance}

如果您的主要优化指标是性能，并希望尽快执行连接，您可以使用以下决策树来选择合适的连接算法：

<br />

<Image img={joins_4} size="lg" alt="连接流程图"/>

<br />

- **(1)** 如果右侧表中的数据可以预先加载到一个内存中的低延迟键值数据结构中，例如一个字典，并且如果连接键与基础键值存储的键属性匹配，并且如果 `LEFT ANY JOIN` 语义足够的话 - 那么 **直接连接** 是适用的，并提供最快的方法。

- **(2)** 如果表的 [物理行顺序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) 与连接键排序顺序匹配，情况就要具体情况而定。在这种情况下，**全排序合并连接** [跳过](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order) 排序阶段，从而显著降低内存使用，并且根据数据大小和连接键值分布，执行时间可能比某些哈希连接算法更快。

- **(3)** 如果右侧表适合内存，即使考虑到 **并行哈希连接** 的 [额外内存使用开销](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary)，那么这个算法或哈希连接可能会更快。这取决于数据大小、数据类型和连接键列的值分布。

- **(4)** 如果右侧表不适合内存，那么情况又要具体情况而定。ClickHouse 提供三种非内存绑定的连接算法。所有这三种算法都会临时将数据溢出到磁盘。**全排序合并连接** 和 **部分合并连接** 需要对数据进行提前排序。而 **Grace 哈希连接** 是根据数据构建哈希表。根据数据的体量、数据类型和连接键列的值分布，构建哈希表可能比排序数据要快，反之亦然。

部分合并连接旨在减少内存使用，但代价是连接速度相对较慢。当左表的物理行顺序不与连接键的排序顺序匹配时，尤其如此。

Grace 哈希连接是三种非内存绑定连接算法中最灵活的一个，并提供了良好的内存使用与连接速度的控制，其 [grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 设置。根据数据量，Grace 哈希连接可能比部分合并算法速度更快或更慢，当选择的 [桶](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2) 数量使得这两种算法的内存使用基本对齐时。如果 Grace 哈希连接的内存使用配置约等于与全排序合并的内存使用量，则在我们的测试运行中，全排序合并连接的速度总是更快。

三种非内存绑定算法中哪一种最快取决于数据量、数据类型和连接键列的值分布。始终最好使用真实的数据量进行基准测试，以确定哪种算法是最快的。

## 针对内存进行优化 {#optimizing-for-memory}

如果您希望优化连接以实现最低的内存使用，而不是最快的执行时间，那么您可以使用这个决策树：

<br />

<Image img={joins_5} size="lg" alt="连接内存优化决策树" />

<br />

- **(1)** 如果您的表的物理行顺序与连接键排序顺序匹配，那么 **全排序合并连接** 的内存使用将降至最低。并且在排序阶段 [禁用](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order) 的情况下，会有良好的连接速度。
- **(2)** 可以通过 [配置](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 高数量的 [桶](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2) 来调优 **Grace 哈希连接** 以实现极低的内存使用，代价是连接速度。**部分合并连接** 刻意使用较少的主内存。启用外部排序的 **全排序合并连接** 通常会比部分合并连接使用更多的内存（假设行顺序不匹配键排序顺序），但在连接执行时间上具有显著的好处。

对于需要 above 内容更多详细信息的用户，我们推荐以下 [博客系列](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。
