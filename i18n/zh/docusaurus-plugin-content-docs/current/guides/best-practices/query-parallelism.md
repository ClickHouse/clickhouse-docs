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

我们可以看到：

* ① ClickHouse 需要在 3 个数据范围中读取 3,609 个 granule（在 trace 日志中以 mark 表示）。
* ② 在具有 59 个 CPU 核心的情况下，它会将这项工作分配到 59 个并行处理流中——每条“通道”一个。

或者，我们可以使用 [EXPLAIN](/sql-reference/statements/explain#explain-pipeline) 子句来检查该聚合查询的 [physical operator plan](/academic_overview#4-2-multi-core-parallelization)，也称为“query pipeline”：

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

注意：请自下而上阅读上面的算子计划。每一行代表物理执行计划中的一个阶段，从最底部的从存储读取数据开始，到最顶部的最终处理步骤结束。标记为 `× 59` 的算子会在 59 条并行处理通道上，并发地作用于互不重叠的数据区域。这反映了 `max_threads` 的取值，并展示了查询的每个阶段是如何在 CPU 核心之间并行化的。

ClickHouse 的[内嵌 Web UI](/interfaces/http)（在 `/play` 端点可用）可以将上面的物理计划渲染为图形化展示。在本例中，我们将 `max_threads` 设置为 `4` 以保持可视化紧凑，只展示 4 条并行处理通道：

<Image img={visual05} alt="Query pipeline" />

注意：请从左到右阅读该可视化。每一行代表一条并行处理通道，它以数据块为单位进行流式处理，并应用过滤、聚合以及最终处理阶段等转换。在本例中，你可以看到与 `max_threads = 4` 设置对应的四条并行通道。

### 在处理通道之间进行负载均衡 {#load-balancing-across-processing-lanes}

请注意，物理计划中的 `Resize` 算子会[重新分区并重新分发](/academic_overview#4-2-multi-core-parallelization)数据块流到各个处理通道，以保持它们的利用率均衡。当不同数据范围中满足查询谓词的行数相差较大时，这种再平衡尤为重要，否则某些通道可能会过载，而其他通道则处于空闲状态。通过重新分配工作量，较快的通道可以有效帮助较慢的通道，从而优化整体查询执行时间。


## 为什么 max&#95;threads 并不总是被严格遵守 {#why-max-threads-isnt-always-respected}

如上所述，`n` 条并行处理通道的数量由 `max_threads` 参数控制，其默认值等于 ClickHouse 在该服务器上可用的 CPU 内核数量：

```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

然而，视所选处理的数据量不同，`max_threads` 的设置值可能会被忽略：

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

如上方执行计划片段所示，即使将 `max_threads` 设置为 `59`，ClickHouse 也只使用 **30** 条并发流来扫描数据。

现在我们来运行这个查询：

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

如上面的输出所示，该查询处理了约 231 万行数据并读取了 13.66 MB 的数据。原因是在索引分析阶段，ClickHouse 选择了 **282 个 granule（粒度单元）** 进行处理，每个 granule 包含 8,192 行，总计约 231 万行：

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

无论将 `max_threads` 配置为多少值，ClickHouse 只会在确实有足够数据值得这么做时，才分配额外的并行处理通道。`max_threads` 中的 “max” 表示的是上限，而不是实际一定会使用的线程数量。

这里的 “足够数据” 主要由两个设置决定，它们定义了每个处理通道应处理的最少行数（默认 163,840）和最少字节数（默认 2,097,152）：

对于 shared-nothing 集群：

* [merge&#95;tree&#95;min&#95;rows&#95;for&#95;concurrent&#95;read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge&#95;tree&#95;min&#95;bytes&#95;for&#95;concurrent&#95;read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

对于具有共享存储的集群（例如 ClickHouse Cloud）：

* [merge&#95;tree&#95;min&#95;rows&#95;for&#95;concurrent&#95;read&#95;for&#95;remote&#95;filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge&#95;tree&#95;min&#95;bytes&#95;for&#95;concurrent&#95;read&#95;for&#95;remote&#95;filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

此外，还存在一个由以下设置控制的读取任务大小的硬性下限：

* [Merge&#95;tree&#95;min&#95;read&#95;task&#95;size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge&#95;tree&#95;min&#95;bytes&#95;per&#95;task&#95;for&#95;remote&#95;reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)


:::warning 不要修改这些设置
我们不建议在生产环境中修改这些设置。这里只是为了说明为什么 `max_threads` 并不总是决定实际的并行度。
:::

出于演示目的，我们来查看在重写这些设置以强制使用最大并发时的物理计划：

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
