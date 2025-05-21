---
'slug': '/optimize/query-parallelism'
'sidebar_label': '查询并行性'
'sidebar_position': 20
'description': 'ClickHouse使用处理通道和max_threads设置并行化查询执行。'
'title': 'ClickHouse如何并行执行查询'
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';
import Image from '@theme/IdealImage';


# ClickHouse 如何并行执行查询

ClickHouse 是 [为速度而设计](/concepts/why-clickhouse-is-so-fast)。它以高度并行的方式执行查询，利用所有可用的 CPU 核心，将数据分配到处理通道中，并且通常将硬件推向极限。

本指南将介绍 ClickHouse 中查询并行性的工作原理，以及如何调优或监控以提高大工作负载的性能。

我们使用对 [uk_price_paid_simple](/parts) 数据集的聚合查询来说明关键概念。

## 步骤：ClickHouse 如何并行化聚合查询 {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

当 ClickHouse ① 运行一个带有表主键过滤的聚合查询时，它 ② 将主索引加载到内存中，以 ③ 识别需要处理的 granules 和可以安全跳过的 granules：

<Image img={visual01} size="md" alt="索引分析"/>

### 在处理通道中分配工作 {#distributing-work-across-processing-lanes}

选定的数据会在 `n` 个并行的 [处理通道](/academic_overview#4-2-multi-core-parallelization) 中 [动态](#load-balancing-across-processing-lanes) 分配，这些通道以块为单位流式处理数据，最终结果逐块生成：

<Image img={visual02} size="md" alt="4 个并行处理通道"/>

<br/><br/>
并行处理通道的数量由 [max_threads](/operations/settings/settings#max_threads) 设置控制，默认情况下与服务器上可用于 ClickHouse 的 CPU 核心数量相匹配。在上面的示例中，我们假设有 `4` 个核心。

在具有 `8` 个核心的机器上，查询处理吞吐量大约会翻倍（但内存使用也会相应增加），因为更多的通道并行处理数据：

<Image img={visual03} size="md" alt="8 个并行处理通道"/>

<br/><br/>
高效的通道分配是最大化 CPU 利用率和减少总体查询时间的关键。

### 在分片表上处理查询 {#processing-queries-on-sharded-tables}

当表数据分布在多台服务器上作为 [分片](/shards) 时，每台服务器并行处理其分片。每台服务器内部，局部数据使用并行处理通道进行处理，如上所述：

<Image img={visual04} size="md" alt="分布式通道"/>

<br/><br/>
最初接收查询的服务器收集所有来自分片的子结果，并将其合并为最终的全局结果。

在分片之间分配查询负载允许横向扩展并行性，特别适用于高吞吐环境。

:::note ClickHouse Cloud 使用并行副本而不是分片
在 ClickHouse Cloud 中，这种并行性是通过 [并行副本](https://clickhouse.com/docs/deployment-guides/parallel-replicas) 实现的，这在共享无状态集群中功能类似于分片。每个 ClickHouse Cloud 副本—一个无状态计算节点—并行处理数据的一部分并对最终结果作出贡献，就像独立的分片一样。
:::

## 监控查询并行性 {#monitoring-query-parallelism}

使用这些工具验证您的查询是否充分利用可用的 CPU 资源，并诊断其未能充分利用的原因。

我们在一台拥有 59 个 CPU 核心的测试服务器上运行，这使 ClickHouse 能够充分展示其查询并行性。

为了观察示例查询是如何执行的，我们可以指示 ClickHouse 服务器在聚合查询期间返回所有跟踪级别的日志条目。为了本次演示，我们移除了查询的谓词——否则，只会处理 3 个 granules，不足以让 ClickHouse 利用多个并行处理通道：
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

我们可以看到：

* ① ClickHouse 需要读取 3,609 个 granules（在跟踪日志中标记为 marks），跨越 3 个数据范围。
* ② 在 59 个 CPU 核心下，它将这项工作分配到 59 个并行处理流中——每个通道一个。

或者，我们可以使用 [EXPLAIN](/sql-reference/statements/explain#explain-pipeline) 子句检查聚合查询的 [物理操作计划](/academic_overview#4-2-multi-core-parallelization)，也称为“查询管道”：
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

注意：从下到上阅读上面的操作计划。每一行表示物理执行计划中的一个阶段，最底部是从存储中读取数据，而顶部是最终处理步骤。标记为 `× 59` 的操作在 59 个并行处理通道的非重叠数据区域上并发执行。这反映了 `max_threads` 的值，并说明了查询的每个阶段是如何在 CPU 核心之间并行化的。

ClickHouse 的 [嵌入式 Web UI](/interfaces/http)（可在 `/play` 端点访问）可以将上述物理计划以图形方式呈现。在此示例中，我们将 `max_threads` 设置为 `4`，以保持可视化紧凑，仅显示 4 个并行处理通道：

<Image img={visual05} alt="查询管道"/>

注意：从左到右阅读可视化。每一行代表一个并行处理通道，以块为单位流式传输数据，应用转换操作，如过滤、聚合和最终处理阶段。在此示例中，您可以看到对应于 `max_threads = 4` 设置的四个并行通道。

### 在处理通道中负载均衡 {#load-balancing-across-processing-lanes}

注意，物理计划中的 `Resize` 操作符会 [重新分区和重新分配](/academic_overview#4-2-multi-core-parallelization) 数据块流在处理通道之间以保持它们的均匀利用率。这个重新平衡在数据范围在满足查询谓词的行数上差异较大时尤为重要，否则某些通道可能会过载，而其他通道则处于空闲状态。通过重新分配工作，更快的通道能够有效帮助较慢的通道，从而优化总体查询运行时。

## 为什么 max_threads 并不总是被遵循 {#why-max-threads-isnt-always-respected}

如上所述，`n` 个并行处理通道的数量由 `max_threads` 设置控制，默认情况下与服务器上可用于 ClickHouse 的 CPU 核心数量相匹配：
```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

但是，`max_threads` 值可能会被忽略，具体取决于选定处理的数据量：
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

如上面的操作计划提取所示，即使 `max_threads` 设置为 `59`，ClickHouse 也仅使用 **30** 个并发流来扫描数据。

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

如上面的输出所示，查询处理了 2.31 百万行并读取了 13.66MB 的数据。这是因为，在索引分析阶段，ClickHouse 选择了 **282 个 granules** 进行处理，每个包含 8,192 行，总计约 2.31 百万行：

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

无论配置了多少 `max_threads` 值，ClickHouse 只会在有足够数据证明使用额外并行处理通道时分配它们。`max_threads` 中的“max”指的是一个上限，而不是实际使用的线程数。

什么是“足够数据”的定义主要取决于两个设置，这些设置定义了每个处理通道应处理的最小行数（默认 163,840）和最小字节数（默认 2,097,152）：

对于共享无状态集群：
* [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

对于拥有共享存储的集群（例如 ClickHouse Cloud）：
* [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

此外，还有一个读取任务大小的硬下限，由以下内容控制：
* [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning 不要修改这些设置
我们不建议在生产环境中修改这些设置。这里显示它们纯粹是为了说明为什么 `max_threads` 并不总是决定实际的并行级别。
:::

出于演示目的，我们来查看物理计划，强制覆盖这些设置以强制最大并发性：
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

现在 ClickHouse 使用 59 个并发流来扫描数据，充分遵循配置的 `max_threads`。

这表明，对于小数据集上的查询，ClickHouse 会故意限制并发性。仅在测试中使用设置覆盖，而不要在生产中使用，因为它们可能导致低效的执行或资源争用。

## 关键要点 {#key-takeaways}

* ClickHouse 通过与 `max_threads` 相关的处理通道并行化查询。
* 实际的通道数量取决于选定处理的数据的大小。
* 使用 `EXPLAIN PIPELINE` 和跟踪日志来分析通道的使用情况。

## 更多信息来源 {#where-to-find-more-information}

如果您想更深入了解 ClickHouse 如何并行执行查询，以及它如何在规模上实现高性能，请探索以下资源：

* [查询处理层 – VLDB 2024 论文（Web 版）](/academic_overview#4-query-processing-layer) - 详细分析 ClickHouse 的内部执行模型，包括调度、管道和操作符设计。

* [部分聚合状态解析](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - 深入技术分析如何通过部分聚合状态实现高效的并行执行。

* 一个详细演示 ClickHouse 查询处理步骤的视频教程：
<iframe width="1024" height="576" src="https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
