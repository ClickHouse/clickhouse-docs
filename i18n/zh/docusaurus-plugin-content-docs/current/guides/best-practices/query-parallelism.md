import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';
import Image from '@theme/IdealImage';

# ClickHouse 如何并行执行查询

ClickHouse 是 [为速度而生](/concepts/why-clickhouse-is-so-fast) 的。它以高度并行的方式执行查询，利用所有可用的 CPU 核心，将数据分布到处理通道，并且经常将硬件推向极限。

本指南将讲解 ClickHouse 中查询并行性如何工作，以及您可以如何调整或监控它以在大型工作负载上提高性能。

我们使用对 [uk_price_paid_simple](/parts) 数据集的聚合查询来说明关键概念。

## 逐步解析：ClickHouse 如何并行化聚合查询 {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

当 ClickHouse ① 运行带有过滤器的聚合查询时，它会在表的主键上 ② 加载主索引到内存，以 ③ 确定哪些粒度需要被处理，哪些可以安全跳过：

<Image img={visual01} size="md" alt="索引分析"/>

### 数据在处理通道之间分配 {#distributing-work-across-processing-lanes}

选定的数据被 [动态](#load-balancing-across-processing-lanes) 分配到 `n` 个并行 [处理通道](/academic_overview#4-2-multi-core-parallelization) 中，这些通道逐块流式处理数据，直到生成最终结果：

<Image img={visual02} size="md" alt="4 个并行处理通道"/>

<br/><br/>
`n` 个并行处理通道的数量由 [max_threads](/operations/settings/settings#max_threads) 设置控制，默认情况下，它与 ClickHouse 在服务器上可用的 CPU 核心数量相匹配。在上面的示例中，我们假设有 `4` 个核心。

在具有 `8` 个核心的机器上，查询处理吞吐量大约会翻倍（但内存使用量也会相应增加），因为更多的通道并行处理数据：

<Image img={visual03} size="md" alt="8 个并行处理通道"/>

<br/><br/>
高效的通道分配是最大化 CPU 利用率和减少总查询时间的关键。

### 在分片表上处理查询 {#processing-queries-on-sharded-tables}

当表数据分布在多个服务器作为 [分片](/shards) 时，每个服务器并行处理其分片。在每个服务器内部，使用并行处理通道处理本地数据，正如上面所述：

<Image img={visual04} size="md" alt="分布式通道"/>

<br/><br/>
最初接收查询的服务器收集来自各个分片的所有子结果，并将其组合为最终的全局结果。

在分片之间分配查询负载允许横向扩展并行性，特别是在高吞吐量环境中。

:::note ClickHouse Cloud 使用并行副本而非分片
在 ClickHouse Cloud 中，同样的并行性通过 [并行副本](https://clickhouse.com/docs/deployment-guides/parallel-replicas) 实现，其功能类似于无共享集群中的分片。每个 ClickHouse Cloud 副本——一个无状态计算节点——并行处理一部分数据并贡献于最终结果，就像一个独立的分片一样。
:::

## 监控查询并行性 {#monitoring-query-parallelism}

使用这些工具来验证您的查询是否充分利用可用的 CPU 资源，并在未利用时进行诊断。

我们在具有 59 个 CPU 核心的测试服务器上运行此查询，这使得 ClickHouse 完全展示其查询并行性。

为了观察示例查询的执行方式，我们可以指示 ClickHouse 服务器在聚合查询期间返回所有跟踪级日志条目。为了演示，我们去掉了查询的谓词——否则将仅处理 3 个粒度，这对于 ClickHouse 来说不够以利用多个并行处理通道：
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

* ① ClickHouse 需要在 3 个数据范围内读取 3,609 个粒度（在跟踪日志中标记为标记）。
* ② 有了 59 个 CPU 核心，它会将这项工作分配到 59 个并行处理流中——每个通道一个。

另外，我们可以使用 [EXPLAIN](/sql-reference/statements/explain#explain-pipeline) 子句来检查 [物理操作计划](/academic_overview#4-2-multi-core-parallelization)——也称为“查询管道”——对于聚合查询：
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

注意：从下到上读取上述操作计划。每一行代表物理执行计划中的一个阶段，从底部开始读取存储中的数据，最后在顶部完成最终处理步骤。标记为 `× 59` 的操作在 59 个并行处理通道之间依赖非重叠数据区域并发执行。这反映了 `max_threads` 的值，并说明了查询每个阶段如何在 CPU 核心之间进行并行化。

ClickHouse 的 [嵌入式 web 界面](/interfaces/http)（可在 `/play` 端点访问）可以将上述物理计划呈现为图形可视化。在这个例子中，我们将 `max_threads` 设置为 `4` 以保持可视化紧凑，仅显示 4 个并行处理通道：

<Image img={visual05} alt="查询管道"/>

注意：从左到右读取可视化。每一行代表一个并行处理通道，逐块流式处理数据，应用过滤、聚合和最终处理等转换。在这个例子中，您可以看到四个并行通道对应于 `max_threads = 4` 的设置。

### 在处理通道之间进行负载均衡 {#load-balancing-across-processing-lanes}

请注意，上述物理计划中的 `Resize` 操作符 [重新分配和重新分发](/academic_overview#4-2-multi-core-parallelization) 数据块流，确保它们被均匀利用。当数据范围在与查询谓词匹配的行数上存在差异时，这种重新平衡尤其重要，否则某些通道可能会过载，而其他通道则处于闲置状态。通过重新分配工作，更快的通道可以有效帮助更慢的通道，从而优化总体查询运行时间。

## 为何 max_threads 并不总是被遵守 {#why-max-threads-isnt-always-respected}

如上所述，`n` 个并行处理通道的数量由 `max_threads` 设置控制，默认情况下，它与 ClickHouse 在服务器上可用的 CPU 核心数量相匹配：
```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

然而，`max_threads` 的值可能会被忽略，这取决于选定的处理数据量：
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

正如上面的操作计划摘录所示，即使 `max_threads` 设置为 `59`，ClickHouse也只使用 **30** 个并发流来扫描数据。

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

如上面的输出所示，查询处理了 231 万行并读取了 13.66MB 数据。这是因为，在索引分析阶段，ClickHouse 选择了 **282 个粒度** 进行处理，每个包含 8,192 行，总共约 231 万行：

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

无论配置的 `max_threads` 值是多少，ClickHouse 仅在有足够的数据来证明其合理性时才会分配额外的并行处理通道。`max_threads` 中的“max”指的是上限，而不是保证使用的线程数。

“足够的数据”主要由两个设置决定，它们定义每个处理通道应处理的最小行数（默认 163,840）和最小字节数（默认 2,097,152）：

对于无共享集群：
* [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

对于具有共享存储的集群（例如 ClickHouse Cloud）：
* [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

另外，读取任务大小的硬下限由以下设置控制：
* [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning 请勿修改这些设置
我们不建议在生产环境中修改这些设置。这里展示这些设置仅用于说明为何 `max_threads` 并不总是决定实际的并行性水平。
:::

为了演示目的，让我们检查物理计划并覆盖这些设置以强制最大并发：
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

现在 ClickHouse 使用 59 个并发流扫描数据，完全尊重配置的 `max_threads`。

这表明，对于小数据集的查询，ClickHouse 将故意限制并发性。仅在测试中使用设置覆盖——而非在生产中——因为它们可能导致低效执行或资源争用。

## 关键要点 {#key-takeaways}

* ClickHouse 使用与 `max_threads` 绑定的处理通道对查询进行并行化。
* 实际的通道数量取决于选定的数据大小。
* 使用 `EXPLAIN PIPELINE` 和跟踪日志来分析通道使用情况。

## 在哪里找到更多信息 {#where-to-find-more-information}

如果您想深入了解 ClickHouse 如何并行执行查询以及如何在大规模上实现高性能，请探索以下资源：

* [查询处理层 – VLDB 2024 论文（网页版）](/academic_overview#4-query-processing-layer) - 对 ClickHouse 内部执行模型的详细分解，包括调度、管道化和操作符设计。

* [部分聚合状态解析](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - 深入了解部分聚合状态如何在处理通道之间实现高效并行执行的技术深度分析。

* 一段视频教程，详细讲解 ClickHouse 查询处理的所有步骤：
<iframe width="1024" height="576" src="https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
