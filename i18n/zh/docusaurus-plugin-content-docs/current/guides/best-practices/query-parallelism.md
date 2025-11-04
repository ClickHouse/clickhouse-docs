---
'slug': '/optimize/query-parallelism'
'sidebar_label': '查询并行性'
'sidebar_position': 20
'description': 'ClickHouse 使用处理通道和 max_threads 设置来并行化查询执行。'
'title': 'ClickHouse 如何并行执行查询'
'doc_type': 'guide'
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';
import Image from '@theme/IdealImage';


# ClickHouse 如何并行执行查询

ClickHouse 是 [为速度而构建的](/concepts/why-clickhouse-is-so-fast)。它以高度并行的方式执行查询，利用所有可用的 CPU 核心，在处理通道之间分配数据，常常将硬件推向极限。

本指南将逐步介绍 ClickHouse 中查询并行性是如何工作的，以及如何调整或监控查询以提升大型工作负载的性能。

我们使用对 [uk_price_paid_simple](/parts) 数据集的聚合查询来说明关键概念。

## 步骤：ClickHouse 如何并行化聚合查询 {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

当 ClickHouse ① 运行一个在表的主键上带过滤器的聚合查询时，它 ② 将主索引加载到内存以 ③ 确定需要处理的粒度以及可以安全跳过的粒度：

<Image img={visual01} size="md" alt="索引分析"/>

### 在处理通道之间分配工作 {#distributing-work-across-processing-lanes}

选择的数据随后在 `n` 个并行的 [处理通道](/academic_overview#4-2-multi-core-parallelization) 中 [动态](#load-balancing-across-processing-lanes) 分配，这些通道将数据逐块流式处理到最终结果中：

<Image img={visual02} size="md" alt="4 个并行处理通道"/>

<br/><br/>
并行处理通道的数量 `n` 由 [max_threads](/operations/settings/settings#max_threads) 设置控制，默认情况下与 ClickHouse 在服务器上可用的 CPU 核心数量匹配。在上述例子中，我们假设有 `4` 个核心。

在一台具有 `8` 个核心的机器上，查询处理吞吐量大约会翻倍（但内存使用量也会相应增加），因为更多的通道并行处理数据：

<Image img={visual03} size="md" alt="8 个并行处理通道"/>

<br/><br/>
有效的通道分配是最大化 CPU 利用率和减少总查询时间的关键。

### 在分片表上处理查询 {#processing-queries-on-sharded-tables}

当表数据在多个服务器之间分布为 [分片](/shards) 时，每台服务器并行处理其分片。在每台服务器内部，本地数据的处理也使用前面描述的并行处理通道：

<Image img={visual04} size="md" alt="分布式通道"/>

<br/><br/>
最初接收查询的服务器收集来自各个分片的所有子结果，并将它们合并为最终的全局结果。

在分片之间分配查询负载允许横向扩展并行性，特别适合高吞吐量环境。

:::note ClickHouse Cloud 使用并行副本而不是分片
在 ClickHouse Cloud 中，这种并行性是通过 [并行副本](https://clickhouse.com/docs/deployment-guides/parallel-replicas) 实现的，类似于在无共享集群中的分片。每个 ClickHouse Cloud 副本——一个无状态计算节点——并行处理一部分数据，并为最终结果做出贡献，就像独立分片一样。
:::

## 监控查询并行性 {#monitoring-query-parallelism}

使用这些工具来验证查询是否充分利用可用的 CPU 资源，并诊断何时没有做到这一点。

我们在一台具有 59 个 CPU 核心的测试服务器上运行此操作，这使 ClickHouse 能够充分展示其查询并行性。

为了观察示例查询的执行方式，我们可以指示 ClickHouse 服务器在聚合查询期间返回所有跟踪级别的日志条目。在此演示中，我们移除了查询的谓词——否则仅会处理 3 个粒度，这不足以让 ClickHouse 利用更多的并行处理通道：
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
SETTINGS send_logs_level='trace';
```

```txt
① <Debug> ...: 3609 marks to read from 3 ranges
② <Trace> ...: Spreading mark ranges among streams
② <Debug> ...: Reading approx. 29564928 rows with 59 streams
```

我们可以看到

* ① ClickHouse 需要读取 3,609 个粒度（在跟踪日志中表示为标记），覆盖 3 个数据范围。
* ② 通过 59 个 CPU 核心，它将这项工作分配到 59 条并行处理流中——每条通道一个。

另外，我们可以使用 [EXPLAIN](/sql-reference/statements/explain#explain-pipeline) 子句来检查 [物理操作计划](/academic_overview#4-2-multi-core-parallelization)，也称为"查询管道"，以获取聚合查询的详细信息：
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple;
```

```txt
    ┌─explain───────────────────────────────────────────────────────────────────────────┐
 1. │ (Expression)                                                                      │
 2. │ ExpressionTransform × 59                                                          │
 3. │   (Aggregating)                                                                   │
 4. │   Resize 59 → 59                                                                  │
 5. │     AggregatingTransform × 59                                                     │
 6. │       StrictResize 59 → 59                                                        │
 7. │         (Expression)                                                              │
 8. │         ExpressionTransform × 59                                                  │
 9. │           (ReadFromMergeTree)                                                     │
10. │           MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59 0 → 1 │
    └───────────────────────────────────────────────────────────────────────────────────┘
```

注意：请从下往上阅读上述操作计划。每一行代表物理执行计划中的一个阶段，从底部的存储读取数据开始，到顶部的最终处理步骤结束。标记为 `× 59` 的操作是在 59 条并行处理通道上对不重叠的数据区域并发执行的。这反映了 `max_threads` 的值，并说明了查询的每个阶段如何在 CPU 核心之间并行化。

ClickHouse 的 [嵌入式 Web UI](/interfaces/http)（在 `/play` 端点可用）可以将上述物理计划呈现为图形可视化。在此示例中，我们将 `max_threads` 设置为 `4` 以保持可视化紧凑，仅显示 4 条并行处理通道：

<Image img={visual05} alt="查询管道"/>

注意：从左到右阅读可视化。每一行代表一条并行处理通道，该通道逐块流式处理数据，并应用过滤、聚合和最终处理阶段等变换。在此示例中，您可以看到四条与 `max_threads = 4` 设置对应的并行通道。

### 在处理通道之间进行负载均衡 {#load-balancing-across-processing-lanes}

注意，物理计划中的 `Resize` 操作 [重新划分和重新分配](/academic_overview#4-2-multi-core-parallelization) 数据块流，以保持通道的均匀利用。这种重新平衡在数据范围中匹配查询谓词的行数变化时尤其重要，否则某些通道可能会超负荷，而其他通道则闲置。通过重新分配工作，快速通道有效地帮助较慢的通道，优化整体查询运行时间。

## 为什么 `max_threads` 并不总是被尊重 {#why-max-threads-isnt-always-respected}

如上所述，并行处理通道的数量 `n` 由 `max_threads` 设置控制，默认情况下与 ClickHouse 在服务器上可用的 CPU 核心数量匹配：
```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

但是，`max_threads` 的值可能会被忽略，这取决于选定的数据量：
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
...   
(ReadFromMergeTree)
MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 30
```

如上面的操作计划摘录所示，即使 `max_threads` 设置为 `59`，ClickHouse 也只使用 **30** 条并发流来扫描数据。

现在让我们运行查询：
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
   ┌─max(price)─┐
1. │  594300000 │ -- 594.30 million
   └────────────┘

1 row in set. Elapsed: 0.013 sec. Processed 2.31 million rows, 13.66 MB (173.12 million rows/s., 1.02 GB/s.)
Peak memory usage: 27.24 MiB.   
```

如上面的输出所示，查询处理了 231 万行，读取了 13.66MB 的数据。这是因为在索引分析阶段，ClickHouse 选择了 **282 个粒度** 进行处理，每个粒度包含 8,192 行，合计大约 231 万行：

```sql runnable=false
EXPLAIN indexes = 1
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
    ┌─explain───────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))             │
 2. │   Aggregating                                         │
 3. │     Expression (Before GROUP BY)                      │
 4. │       Expression                                      │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple)   │
 6. │         Indexes:                                      │
 7. │           PrimaryKey                                  │
 8. │             Keys:                                     │
 9. │               town                                    │
10. │             Condition: (town in ['LONDON', 'LONDON']) │
11. │             Parts: 3/3                                │
12. │             Granules: 282/3609                        │
    └───────────────────────────────────────────────────────┘  
```

无论配置的 `max_threads` 值如何，ClickHouse 仅在有足够数据 justify 它们时才会分配额外的并行处理通道。`max_threads` 中的 "max" 指的是一个上限，而不是使用线程的保证数量。

"足够的数据" 主要由两个设置决定，它们定义了每个处理通道应处理的最小行数（默认 163,840 行）和最小字节数（默认 2,097,152 字节）：

对于无共享集群：
* [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

对于具有共享存储的集群（例如 ClickHouse Cloud）：
* [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

此外，还有一个读取任务大小的硬性下限，由以下设置控制：
* [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning 不要修改这些设置
我们不推荐在生产环境中修改这些设置。这里展示它们仅是为了说明为什么 `max_threads` 并不总是决定实际的并行级别。
:::

为了演示目的，让我们检查一下物理计划，强制最大并发的这些设置被覆盖：
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON'
SETTINGS
  max_threads = 59,
  merge_tree_min_read_task_size = 0,
  merge_tree_min_rows_for_concurrent_read_for_remote_filesystem = 0, 
  merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem = 0;
```

```txt
...   
(ReadFromMergeTree)
MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59
```

现在 ClickHouse 使用 59 条并发流来扫描数据，完全尊重配置的 `max_threads`。

这表明对于小数据集的查询，ClickHouse 会故意限制并发性。仅在测试中使用设置覆盖——不要在生产环境中使用，因为它们可能导致效率低下的执行或资源争用。

## 关键要点 {#key-takeaways}

* ClickHouse 使用与 `max_threads` 相关的处理通道并行化查询。
* 实际的通道数量取决于选定处理的数据的大小。
* 使用 `EXPLAIN PIPELINE` 和跟踪日志分析通道使用情况。

## 更多信息来源 {#where-to-find-more-information}

如果您想深入了解 ClickHouse 如何并行执行查询以及如何在规模下实现高性能，请探索以下资源：

* [查询处理层 - VLDB 2024 论文（网页版）](/academic_overview#4-query-processing-layer) - ClickHouse 内部执行模型的详细分解，包括调度、管道化和操作符设计。

* [部分聚合状态的解释](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - 深入探讨部分聚合状态如何促进处理通道之间的高效并行执行的技术细节。

* 一段视频教程详细介绍 ClickHouse 查询处理的所有步骤：
<iframe width="1024" height="576" src="https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
