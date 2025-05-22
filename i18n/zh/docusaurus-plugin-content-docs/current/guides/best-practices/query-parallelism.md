---
'slug': '/optimize/query-parallelism'
'sidebar_label': '查询并行性'
'sidebar_position': 20
'description': 'ClickHouse 使用处理通道和 max_threads 设置来并行化查询执行。'
'title': 'ClickHouse 如何并行执行查询'
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';
import Image from '@theme/IdealImage';


# ClickHouse 如何并行执行查询

ClickHouse 是 [为速度而构建的](/concepts/why-clickhouse-is-so-fast)。它以高度并行的方式执行查询，利用所有可用的 CPU 核心，将数据分配到处理通道，并且通常将硬件推向其极限。

本指南介绍了 ClickHouse 如何实现查询并行性，以及如何调整或监控它以提高大型工作负载的性能。

我们使用对 [uk_price_paid_simple](/parts) 数据集的聚合查询来说明关键概念。


## 步骤：ClickHouse 如何并行化聚合查询 {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

当 ClickHouse ① 执行一个带有过滤条件的聚合查询时，它 ② 将主键索引加载到内存中，以 ③ 确定需要处理哪些粒度，以及哪些可以安全跳过：

<Image img={visual01} size="md" alt="Index analysis"/>

### 在处理通道之间分配工作 {#distributing-work-across-processing-lanes}

选择的数据随后通过 `n` 个并行的 [处理通道](/academic_overview#4-2-multi-core-parallelization) 进行 [动态](#load-balancing-across-processing-lanes) 分配，这些通道按块流式处理数据并生成最终结果：

<Image img={visual02} size="md" alt="4 parallel processing lanes"/>

<br/><br/>
`n` 个并行处理通道的数量由 [max_threads](/operations/settings/settings#max_threads) 设置控制，默认情况下与服务器上可用的 CPU 核心数量匹配。在上面的示例中，我们假设有 `4` 个核心。

在一台具有 `8` 个核心的机器上，查询处理的吞吐量大致会翻倍（但内存使用也会相应增加），因为更多的通道并行处理数据：

<Image img={visual03} size="md" alt="8 parallel processing lanes"/>

<br/><br/>
有效的通道分配是最大化 CPU 利用率和减少总查询时间的关键。

### 在分片表上处理查询 {#processing-queries-on-sharded-tables}

当表数据分布在多个服务器作为 [分片](/shards) 时，每台服务器并行处理其分片。在每台服务器内部，本地数据使用并行处理通道进行处理，正如上面描述的那样：

<Image img={visual04} size="md" alt="Distributed lanes"/>

<br/><br/>
最初接收查询的服务器会收集来自各个分片的所有子结果，并将它们合并为最终的全局结果。

在分片之间分配查询负载允许并行性的水平扩展，特别适合高吞吐量环境。

:::note ClickHouse Cloud 使用并行副本而不是分片
在 ClickHouse Cloud 中，通过 [并行副本](https://clickhouse.com/docs/deployment-guides/parallel-replicas) 实现相同的并行性，这些副本在无状态计算节点中类似于共享无集群中的分片。每个 ClickHouse Cloud 副本处理部分数据并行处理并贡献于最终结果，就像独立的分片一样。
:::

## 监控查询并行性 {#monitoring-query-parallelism}

使用这些工具验证您的查询是否充分利用了可用 CPU 资源，并在不利用时进行诊断。

我们在一台具有 59 个 CPU 核心的测试服务器上运行此查询，这允许 ClickHouse 充分展示其查询并行性。

为了观察示例查询是如何执行的，我们可以指示 ClickHouse 服务器在聚合查询期间返回所有跟踪级别的日志条目。为了展示，我们移除了查询的谓词——否则只会处理 3 个粒度，这不足以让 ClickHouse 利用更多的并行处理通道：
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



* ① ClickHouse 需要读取 3,609 个粒度（在跟踪日志中标记为标记），分布在 3 个数据范围内。
* ② 使用 59 个 CPU 核心，它通过 59 个并行处理通道分配这项工作——一个通道对应一条流。

或者，我们可以使用 [EXPLAIN](/sql-reference/statements/explain#explain-pipeline) 子句检查 [物理操作计划](/academic_overview#4-2-multi-core-parallelization)——也称为“查询管道”——以了解聚合查询的执行情况：
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

注意：从底部向顶部读取上述操作计划。每一行表示物理执行计划中的一个阶段，从底部的存储读取数据开始，到顶部的最终处理步骤结束。标记为 `× 59` 的操作在非重叠的数据区域上并发执行，跨 59 个并行处理通道。这反映了 `max_threads` 的值，并说明查询的每个阶段如何跨 CPU 核心并行化。

ClickHouse 的 [嵌入式网络用户界面](/interfaces/http)（可通过 `/play` 端点访问）可以将上述物理计划呈现为图形可视化。在此示例中，我们将 `max_threads` 设置为 `4`，以保持可视化紧凑，仅显示 4 个并行处理通道：

<Image img={visual05} alt="Query pipeline"/>

注意：从左到右读取可视化。每一行代表一个并行处理通道，逐块流式传输数据，并应用过滤、聚合和最终处理步骤等转换。在此示例中，您可以看到与 `max_threads = 4` 设置对应的四个并行通道。


### 在处理通道之间进行负载均衡 {#load-balancing-across-processing-lanes}

请注意，物理计划中的 `Resize` 操作会 [重新分区和重新分配](/academic_overview#4-2-multi-core-parallelization) 数据块流，以确保它们被均匀利用。当数据范围在匹配查询谓词的行数上有所差异时，这种重新平衡尤其重要，否则某些通道可能会过载，而另一些则处于空闲状态。通过重新分配工作，快速通道有效地帮助较慢的通道，从而优化整体查询运行时间。


## 为什么 max_threads 并不总是被遵循 {#why-max-threads-isnt-always-respected}

如上所述，`n` 个并行处理通道的数量由 `max_threads` 设置控制，默认情况下与服务器上可用的 CPU 核心数量匹配：
```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

但是，`max_threads` 值可能会被忽略，具体取决于选择的处理数据量：
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

如上面操作计划提取所示，即使 `max_threads` 设置为 `59`，ClickHouse 仍然使用仅 **30** 个并发流来扫描数据。

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

如上面输出所示，查询处理了 231 万行，并读取了 13.66MB 的数据。这是因为在索引分析阶段，ClickHouse 为处理选择了 **282** 个粒度，每个粒度包含 8,192 行，总计约 231 万行：

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

无论配置的 `max_threads` 值如何，ClickHouse 只会在有足够数据的情况下分配额外的并行处理通道。“max” 的含义是一个上限，而不是使用线程的保证数量。

“足够的数据”主要由两个设置决定，这两个设置定义了每个处理通道应处理的最小行数（默认 163,840 行）和最小字节数（默认 2,097,152 字节）：

对于无共享的集群：
* [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

对于具有共享存储的集群（例如 ClickHouse Cloud）：
* [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

另外，还有一个读取任务大小的硬性下限，由以下设置控制：
* [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning 请勿修改这些设置
我们不建议在生产环境中修改这些设置。这些设置在这里仅用于说明为什么 `max_threads` 并不总是决定实际的并行级别。
:::


出于演示目的，让我们检查物理计划，并覆盖这些设置以强制最大并发：
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

现在 ClickHouse 使用 59 个并发流扫描数据，完全遵循配置的 `max_threads`。

这表明，对于小数据集的查询，ClickHouse 会主动限制并发。仅在测试中使用设置覆盖——而不是在生产中——因为它们可能导致低效的执行或资源争用。

## 关键要点 {#key-takeaways}

* ClickHouse 使用与 `max_threads` 绑定的处理通道对查询进行并行化。
* 实际的通道数量取决于选择处理的数据的大小。
* 使用 `EXPLAIN PIPELINE` 和跟踪日志分析通道使用情况。


## 了解更多信息的地方 {#where-to-find-more-information}

如果您想深入了解 ClickHouse 如何并行执行查询以及如何在规模上实现高性能，请探索以下资源：

* [查询处理层 – VLDB 2024 论文（网页版）](/academic_overview#4-query-processing-layer) - 详细分析 ClickHouse 的内部执行模型，包括调度、管道化和操作符设计。

* [部分聚合状态解释](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - 对部分聚合状态如何使处理通道实现高效并行执行的技术深入探讨。

* 一段详细介绍 ClickHouse 查询处理步骤的视频教程：
<iframe width="1024" height="576" src="https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
