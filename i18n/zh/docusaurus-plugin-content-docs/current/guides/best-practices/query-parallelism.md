---
slug: /optimize/query-parallelism
sidebar_label: '查询并行度'
sidebar_position: 20
description: 'ClickHouse 通过处理通道（processing lanes）和 max_threads 设置来并行执行查询。'
title: 'ClickHouse 如何以并行方式执行查询'
doc_type: 'guide'
keywords: ['并行处理', '查询优化', '性能', '线程', '最佳实践']
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';

import Image from '@theme/IdealImage';

# ClickHouse 如何并行执行查询 {#how-clickhouse-executes-a-query-in-parallel}

ClickHouse [为速度而生](/concepts/why-clickhouse-is-so-fast)。它以高度并行的方式执行查询，利用所有可用的 CPU 核心，将数据分布到各个处理通道，并且经常将硬件推至其性能极限。
 
本指南将介绍 ClickHouse 中查询并行机制的工作原理，以及如何对其进行调优或监控，以提升大规模工作负载下的性能。

我们使用 [uk_price_paid_simple](/parts) 数据集上的一个聚合查询来说明关键概念。

## 分步解析：ClickHouse 如何并行化聚合查询 {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

当 ClickHouse ① 在带有表主键过滤条件的情况下运行聚合查询时，它会 ② 将主索引加载到内存中，以 ③ 确定哪些 granule（数据粒度单元）需要被处理、哪些可以安全跳过：

<Image img={visual01} size="md" alt="索引分析"/>

### 在处理通道之间分配工作 {#distributing-work-across-processing-lanes}

选定的数据随后被[动态](#load-balancing-across-processing-lanes)分布到 `n` 个并行的[处理通道](/academic_overview#4-2-multi-core-parallelization)中，这些通道按数据[块](/development/architecture#block)以流式方式逐块处理并计算数据，最终生成结果：

<Image img={visual02} size="md" alt="4 个并行处理通道"/>

<br/><br/>
`n` 个并行处理通道的数量由 [max_threads](/operations/settings/settings#max_threads) 设置控制，默认情况下与 ClickHouse 在该服务器上可用的 CPU 核心数相匹配。在上面的示例中，我们假设有 `4` 个核心。 

在一台具有 `8` 个核心的机器上，查询处理吞吐量大致会提升一倍（但内存使用也会相应增加），因为会有更多通道并行处理数据：

<Image img={visual03} size="md" alt="8 个并行处理通道"/>

<br/><br/>
高效的通道分配是最大化 CPU 利用率并缩短整体查询时间的关键。

### 在分片表上处理查询 {#processing-queries-on-sharded-tables}

当表数据以[分片](/shards)的形式分布在多台服务器上时，每台服务器都会并行处理自己的分片。在每台服务器内部，本地数据会通过并行处理通道进行处理，就像前文所描述的那样：

<Image img={visual04} size="md" alt="分布式通道"/>

<br/><br/>
最先接收到查询的那台服务器会收集来自各个分片的所有子结果，并将它们合并为最终的全局结果。

将查询负载分布到多个分片上，可以实现并行度的横向扩展，尤其适用于高吞吐量环境。

:::note ClickHouse Cloud 使用并行副本而不是分片
在 ClickHouse Cloud 中，同样的并行能力是通过[并行副本](https://clickhouse.com/docs/deployment-guides/parallel-replicas)实现的，其工作方式类似于共享无关集群中的分片。每个 ClickHouse Cloud 副本（无状态计算节点）都会并行处理一部分数据，并像独立分片一样对最终结果作出贡献。
:::

## 监控查询并行度 {#monitoring-query-parallelism}

使用这些工具来验证你的查询是否充分利用了可用的 CPU 资源，并在没有充分利用时进行诊断。

我们在一台具有 59 核 CPU 的测试服务器上运行这项测试，这使得 ClickHouse 能够充分展示其查询并行能力。

为了观察示例查询是如何执行的，我们可以指示 ClickHouse 服务器在聚合查询期间返回所有 trace 级别的日志条目。为了便于演示，我们移除了查询的谓词——否则只会处理 3 个 granule，这些数据不足以让 ClickHouse 利用多条并行处理通道：

```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
SETTINGS send_logs_level='trace';
```

```txt
① <Debug> ...: 从 3 个范围读取 3609 个标记
② <Trace> ...: 在流之间分配标记范围
② <Debug> ...: 使用 59 个流读取约 29564928 行数据
```

We can see that

* ① ClickHouse needs to read 3,609 granules (indicated as marks in the trace logs) across 3 data ranges.
* ② With 59 CPU cores, it distributes this work across 59 parallel processing streams—one per lane.

Alternatively, we can use the [EXPLAIN](/sql-reference/statements/explain#explain-pipeline) clause to inspect the [physical operator plan](/academic_overview#4-2-multi-core-parallelization)—also known as the "query pipeline"—for the aggregation query:
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

Note: Read the operator plan above from bottom to top. Each line represents a stage in the physical execution plan, starting with reading data from storage at the bottom and ending with the final processing steps at the top. Operators marked with `× 59` are executed concurrently on non-overlapping data regions across 59 parallel processing lanes. This reflects the value of `max_threads` and illustrates how each stage of the query is parallelized across CPU cores.

ClickHouse's [embedded web UI](/interfaces/http) (available at the `/play` endpoint) can render the physical plan from above as a graphical visualization. In this example, we set `max_threads` to `4` to keep the visualization compact, showing just 4 parallel processing lanes:

<Image img={visual05} alt="Query pipeline"/>

Note: Read the visualization from left to right. Each row represents a parallel processing lane that streams data block by block, applying transformations such as filtering, aggregation, and final processing stages. In this example, you can see four parallel lanes corresponding to the `max_threads = 4` setting.

### Load balancing across processing lanes {#load-balancing-across-processing-lanes}

Note that the `Resize` operators in the physical plan above [repartition and redistribute](/academic_overview#4-2-multi-core-parallelization) data block streams across processing lanes to keep them evenly utilized. This rebalancing is especially important when data ranges vary in how many rows match the query predicates, otherwise, some lanes may become overloaded while others sit idle. By redistributing the work, faster lanes effectively help out slower ones, optimizing overall query runtime.

## Why max_threads isn't always respected {#why-max-threads-isnt-always-respected}

As mentioned above, the number of `n` parallel processing lanes is controlled by the `max_threads` setting, which by default matches the number of CPU cores available to ClickHouse on the server:
```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

However, the `max_threads` value may be ignored depending on the amount of data selected for processing:
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

As shown in the operator plan extract above, even though `max_threads` is set to `59`, ClickHouse uses only **30** concurrent streams to scan the data.

Now let's run the query:
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
   ┌─max(price)─┐
1. │  594300000 │ -- 5.943 亿
   └────────────┘
   
返回 1 行。耗时：0.013 秒。已处理 231 万行，13.66 MB（173.12 百万行/秒，1.02 GB/秒）
峰值内存使用量：27.24 MiB。   
```

As shown in the output above, the query processed 2.31 million rows and read 13.66MB of data. This is because, during the index analysis phase, ClickHouse selected **282 granules** for processing, each containing 8,192 rows, totaling approximately 2.31 million rows:

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

Regardless of the configured `max_threads` value, ClickHouse only allocates additional parallel processing lanes when there's enough data to justify them. The "max" in `max_threads` refers to an upper limit, not a guaranteed number of threads used.

What "enough data" means is primarily determined by two settings, which define the minimum number of rows (163,840 by default) and the minimum number of bytes (2,097,152 by default) that each processing lane should handle:

For shared-nothing clusters:
* [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

For clusters with shared storage (e.g. ClickHouse Cloud):
* [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

Additionally, there's a hard lower limit for read task size, controlled by:
* [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning Don't modify these settings
We don't recommend modifying these settings in production. They're shown here solely to illustrate why `max_threads` doesn't always determine the actual level of parallelism.
:::

For demonstration purposes, let's inspect the physical plan with these settings overridden to force maximum concurrency:
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

现在，ClickHouse 使用 59 个并发流来扫描数据，完全遵循配置的 `max_threads`。

这表明，对于小数据集上的查询，ClickHouse 会有意限制并发度。仅在测试环境中临时覆盖这些设置——不要在生产环境中这样做——因为这可能导致执行效率低下或资源争用。

## 关键要点 {#key-takeaways}

* ClickHouse 使用与 `max_threads` 绑定的处理通道来并行执行查询。
* 实际的通道数量取决于被选中用于处理的数据量大小。
* 使用 `EXPLAIN PIPELINE` 和跟踪日志来分析通道的使用情况。

## 在哪里可以了解更多信息  {#where-to-find-more-information}

如果你希望更深入地了解 ClickHouse 如何并行执行查询，以及它如何在大规模场景下实现高性能，可以查阅以下资源： 

* [查询处理层 – VLDB 2024 论文（网页版）](/academic_overview#4-query-processing-layer) - 对 ClickHouse 内部执行模型的详细解析，包括调度、流水线处理以及算子设计。

* [Partial aggregation states explained](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - 深入剖析 partial aggregation states 如何在多个处理通道之间实现高效的并行执行。

* 一段视频教程，详细讲解 ClickHouse 查询处理的所有步骤：
<iframe width="1024" height="576" src="https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
