import Image from '@theme/IdealImage';
import joins_1 from '@site/static/images/guides/joins-1.png';
import joins_2 from '@site/static/images/guides/joins-2.png';
import joins_3 from '@site/static/images/guides/joins-3.png';
import joins_4 from '@site/static/images/guides/joins-4.png';
import joins_5 from '@site/static/images/guides/joins-5.png';

ClickHouse 具有 [完整的 `JOIN` 支持](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)，并提供了多种连接算法。为了最大化性能，我们建议遵循本指南中列出的连接优化建议。

- 为了获得最佳性能，用户应力求减少查询中的 `JOIN` 数量，特别是在需要毫秒性能的实时分析工作负载中。一个查询中最多应有 3 到 4 个连接。我们在 [数据建模部分](/data-modeling/schema-design) 中详细说明了一些减少连接的变化，包括非规范化、字典和物化视图。
- 当前，ClickHouse 不会重新排序连接。始终确保最小的表位于连接的右侧。对于大多数连接算法，这将被保留在内存中，并确保查询的内存开销最低。
- 如果您的查询需要直接连接 i.e. `LEFT ANY JOIN` - 如下所示，我们建议在可能的地方使用 [字典](/dictionary)。

<Image img={joins_1} size="sm" alt="左任意连接"/>

- 如果执行内部连接，通常将其写为使用 `IN` 子句的子查询更加优化。考虑以下查询，这两个查询在功能上是等价的。两者都找出在问题中未提及 ClickHouse 但在 `comments` 中提及的 `posts` 数量。

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

请注意，我们使用 `ANY INNER JOIN` 而不是仅仅是 `INNER` 连接，因为我们不希望产生笛卡尔积，即我们只想要每个帖子的一次匹配。

此连接可以重写为使用子查询，显著提高性能：

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

尽管 ClickHouse 会尝试将条件下推到所有连接子句和子查询中，但我们建议用户始终手动将条件应用于所有子子句，以最小化 `JOIN` 的数据大小。考虑以下示例，其中我们希望计算自 2020 年以来与 Java 相关的帖子上投票数。

一个天真的查询，较大表在左侧，完成时间为 56 秒：

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

重新排序此连接显著提高性能至 1.5 秒：

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

在右侧表中添加过滤器进一步提高性能至 0.5 秒。

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

如前所述，这个查询还可以通过将 `INNER JOIN` 移动到子查询中来进一步改进，同时在外部和内部查询上保持过滤器。

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

ClickHouse 支持多种 [连接算法](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。这些算法通常在内存使用和性能之间进行权衡。以下提供了根据相对内存消耗和执行时间的 ClickHouse 连接算法概述：

<br />

<Image img={joins_2} size="lg" alt="按内存和连接速度"/>

<br />

这些算法决定了连接查询的规划和执行方式。默认情况下，ClickHouse 根据所使用的连接类型、严格性和连接表的引擎使用直接连接或哈希连接算法。或者，ClickHouse 可以被配置为在运行时自适应选择和动态更改连接算法，具体取决于资源的可用性和使用情况：当 `join_algorithm=auto`时，ClickHouse 首先尝试哈希连接算法，并且如果该算法的内存限制被违反，则算法会动态切换到部分合并连接。您可以通过跟踪日志观察选择了哪个算法。ClickHouse 还允许用户通过 `join_algorithm` 设置自行指定所需的连接算法。

以下是每种连接算法支持的 `JOIN` 类型，应在优化之前考虑：

<br />

<Image img={joins_3} size="lg" alt="连接特性"/>

<br />

每个 `JOIN` 算法的详细描述可以在 [此处](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2) 找到，包括其优缺点和扩展特性。

选择适当的连接算法取决于您是希望优化内存还是性能。

## 优化 JOIN 性能 {#optimizing-join-performance}

如果您的关键优化指标是性能，并且您希望尽快执行连接，则可以使用以下决策树选择合适的连接算法：

<br />

<Image img={joins_4} size="lg" alt="连接流程图"/>

<br />

- **(1)** 如果右侧表的数据可以预加载到内存中低延迟的键值数据结构中，例如字典，并且连接键符合底层键值存储的键属性，并且 `LEFT ANY JOIN` 的语义是合适的 - 则 **直接连接** 适用，并提供最快的方法。

- **(2)** 如果您表的 [物理行顺序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) 与连接键的排序顺序相匹配，那么就取决于情况。在这种情况下，**全排序合并连接** [跳过](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order) 排序阶段，从而显著降低内存使用量，并且根据数据大小和连接键值分布，执行时间比某些哈希连接算法更快。

- **(3)** 如果右侧表可以适合内存，即使有 [额外内存使用开销](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary) 的 **并行哈希连接**，那么该算法或哈希连接可能更快。这取决于数据大小、数据类型和连接键列的值分布。

- **(4)** 如果右侧表不适合内存，则这又取决于情况。ClickHouse 提供了三种非内存限制的连接算法。这三种算法都将数据临时溢出到磁盘。**全排序合并连接** 和 **部分合并连接** 需要对数据进行先前排序。**格雷斯哈希连接** 则是从数据构建哈希表。根据数据量、数据类型和连接键列的值分布，构建哈希表的速度可能比排序数据快，反之亦然。

部分合并连接优化用于在连接大型表时最小化内存使用，牺牲连接速度，连接速度相当慢。这尤其在左表的物理行顺序与连接键排序顺序不匹配时更为明显。

格雷斯哈希连接是三种非内存限制连接算法中最灵活的，利用其 [grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 设置提供良好的内存使用与连接速度之间的控制。根据数据量，格雷斯哈希的速度可能快或慢于部分合并算法，具体取决于所选择的 [buckets](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2) 数量，使得两个算法的内存使用量大致对齐。当格雷斯哈希连接的内存使用配置与全排序合并的内存使用大致对齐时，在我们的测试运行中，全排序合并总是更快。

哪一种三种非内存限制算法更快取决于数据量、数据类型和连接键列的值分布。最好在现实的数据量中运行一些基准测试以确定哪种算法是最快的。

## 优化内存 {#optimizing-for-memory}

如果您希望为最低内存使用而不是最快执行时间优化连接，则可以使用这个决策树：

<br />

<Image img={joins_5} size="lg" alt="连接内存优化决策树" />

<br />

- **(1)** 如果您表的物理行顺序与连接键的排序顺序相匹配，则 **全排序合并连接** 的内存使用最低。附带好连接速度的额外好处，因为排序阶段是 [禁用的](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)。
- **(2)** **格雷斯哈希连接** 可以通过 [配置](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 高数量的 [buckets](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2) 来调优以实现非常低的内存使用，尽管这会牺牲连接速度。**部分合并连接** 刻意使用少量主内存。启用了外部排序的 **全排序合并连接** 通常会比部分合并连接使用更多内存（假设行顺序与键排序顺序不匹配），但具有显著更好的连接执行时间。

对于需要更多详细信息的用户，我们推荐以下 [博客系列](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。
