---
slug: /optimize/query-parallelism
sidebar_label: '查询并行执行'
sidebar_position: 20
description: 'ClickHouse 通过处理通道和 max_threads 设置实现查询的并行执行。'
title: 'ClickHouse 如何并行执行查询'
doc_type: 'guide'
keywords: ['parallel processing', 'query optimization', 'performance', 'threading', 'best practices']
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';

import Image from '@theme/IdealImage';


# ClickHouse 如何并行执行查询

ClickHouse 是[为速度而构建的](/concepts/why-clickhouse-is-so-fast)。它以高度并行的方式执行查询，利用所有可用的 CPU 核心，将数据分布到多个处理通道上，并且常常将硬件性能推向极限。
 
本指南介绍 ClickHouse 中查询并行性的工作机制，以及如何对其进行调优或监控，以提升在大规模工作负载下的性能。

我们使用 [uk_price_paid_simple](/parts) 数据集上的一个聚合查询来说明关键概念。



## 逐步解析:ClickHouse 如何并行化聚合查询 {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

当 ClickHouse ① 执行带有表主键过滤条件的聚合查询时,它会 ② 将主索引加载到内存中,以便 ③ 识别哪些数据颗粒需要处理,哪些可以安全跳过:

<Image img={visual01} size='md' alt='索引分析' />

### 在处理通道间分配工作 {#distributing-work-across-processing-lanes}

选定的数据随后会[动态](#load-balancing-across-processing-lanes)分配到 `n` 个并行[处理通道](/academic_overview#4-2-multi-core-parallelization)中,这些通道以[数据块](/development/architecture#block)为单位流式处理数据并生成最终结果:

<Image img={visual02} size='md' alt='4 个并行处理通道' />

<br />
<br />
并行处理通道的数量 `n` 由 [max_threads](/operations/settings/settings#max_threads) 设置控制,默认情况下与服务器上 ClickHouse 可用的 CPU 核心数相匹配。在上述示例中,我们假设有 `4` 个核心。

在具有 `8` 个核心的机器上,查询处理吞吐量大约会翻倍(但内存使用量也会相应增加),因为有更多通道并行处理数据:

<Image img={visual03} size='md' alt='8 个并行处理通道' />

<br />
<br />
高效的通道分配是最大化 CPU 利用率和缩短总查询时间的关键。

### 在分片表上处理查询 {#processing-queries-on-sharded-tables}

当表数据以[分片](/shards)形式分布在多个服务器上时,每个服务器并行处理其分片。在每个服务器内部,本地数据使用并行处理通道进行处理,就像上文所述:

<Image img={visual04} size='md' alt='分布式通道' />

<br />
<br />
最初接收查询的服务器会收集来自各个分片的所有子结果,并将它们合并为最终的全局结果。

在分片间分配查询负载可以实现并行性的水平扩展,特别适用于高吞吐量环境。

:::note ClickHouse Cloud 使用并行副本而非分片
在 ClickHouse Cloud 中,这种并行性是通过[并行副本](https://clickhouse.com/docs/deployment-guides/parallel-replicas)实现的,其功能类似于无共享集群中的分片。每个 ClickHouse Cloud 副本(一个无状态计算节点)并行处理一部分数据并贡献到最终结果,就像独立分片一样。
:::


## 监控查询并行度 {#monitoring-query-parallelism}

使用这些工具验证查询是否充分利用了可用的 CPU 资源,并在未充分利用时进行诊断。

我们在一台拥有 59 个 CPU 核心的测试服务器上运行此示例,这使 ClickHouse 能够充分展示其查询并行能力。

为了观察示例查询的执行过程,我们可以指示 ClickHouse 服务器在聚合查询期间返回所有跟踪级别的日志条目。在本演示中,我们移除了查询的谓词条件——否则只会处理 3 个颗粒,这些数据量不足以让 ClickHouse 使用多个并行处理通道:

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

- ① ClickHouse 需要从 3 个数据范围中读取 3,609 个颗粒(在跟踪日志中显示为 marks)。
- ② 借助 59 个 CPU 核心,它将这项工作分配到 59 个并行处理流中——每个通道一个流。

或者,我们可以使用 [EXPLAIN](/sql-reference/statements/explain#explain-pipeline) 子句来检查聚合查询的[物理算子计划](/academic_overview#4-2-multi-core-parallelization)——也称为"查询管道":

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

注意:从下往上阅读上述算子计划。每一行代表物理执行计划中的一个阶段,从底部的存储数据读取开始,到顶部的最终处理步骤结束。标记为 `× 59` 的算子在 59 个并行处理通道上对不重叠的数据区域并发执行。这反映了 `max_threads` 的值,并说明了查询的每个阶段如何跨 CPU 核心并行化。

ClickHouse 的[嵌入式 Web UI](/interfaces/http)(可在 `/play` 端点访问)可以将上述物理计划渲染为图形化可视化。在本示例中,我们将 `max_threads` 设置为 `4` 以保持可视化的紧凑性,仅显示 4 个并行处理通道:

<Image img={visual05} alt='查询管道' />

注意:从左到右阅读可视化图。每一行代表一个并行处理通道,逐块流式传输数据,应用过滤、聚合和最终处理阶段等转换操作。在本示例中,您可以看到与 `max_threads = 4` 设置相对应的四个并行通道。

### 跨处理通道的负载均衡 {#load-balancing-across-processing-lanes}

请注意,上述物理计划中的 `Resize` 算子会[重新分区和重新分配](/academic_overview#4-2-multi-core-parallelization)数据块流到各个处理通道,以保持均衡利用。当数据范围中匹配查询谓词的行数差异较大时,这种重新平衡尤为重要,否则某些通道可能会过载,而其他通道则处于空闲状态。通过重新分配工作,较快的通道可以有效地帮助较慢的通道,从而优化整体查询运行时间。


## 为什么 max_threads 并不总是生效 {#why-max-threads-isnt-always-respected}

如上所述,`n` 个并行处理通道的数量由 `max_threads` 设置控制,该设置默认与服务器上 ClickHouse 可用的 CPU 核心数相匹配:

```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

然而,`max_threads` 的值可能会被忽略,具体取决于选择处理的数据量:

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

如上述算子计划摘录所示,即使 `max_threads` 设置为 `59`,ClickHouse 也仅使用 **30** 个并发流来扫描数据。

现在让我们运行该查询:

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

如上述输出所示,该查询处理了 231 万行并读取了 13.66MB 的数据。这是因为在索引分析阶段,ClickHouse 选择了 **282 个颗粒**进行处理,每个颗粒包含 8,192 行,总计约 231 万行:

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

无论配置的 `max_threads` 值是多少,ClickHouse 只有在数据量足够大时才会分配额外的并行处理通道。`max_threads` 中的"max"指的是上限,而不是保证使用的线程数。

"足够大的数据量"主要由两个设置决定,这些设置定义了每个处理通道应处理的最小行数(默认为 163,840)和最小字节数(默认为 2,097,152):

对于无共享架构集群:

- [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
- [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

对于共享存储集群(例如 ClickHouse Cloud):

- [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
- [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

此外,读取任务大小还有一个硬性下限,由以下设置控制:

- [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)


:::warning 不要修改这些设置
我们不建议在生产环境中修改这些设置。这里展示它们只是为了说明，为什么 `max_threads` 并不总是决定实际的并行度。
:::

为了演示，我们来看一下在覆盖这些设置以强制启用最大并发时的物理执行计划：

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

现在，ClickHouse 使用 59 个并发流来扫描数据，严格遵守配置的 `max_threads`。

这表明，对于小数据集的查询，ClickHouse 会有意限制并发度。仅在测试中使用设置覆写——不要在生产环境中使用——因为它们可能导致执行效率低下或资源争用。


## 关键要点 {#key-takeaways}

- ClickHouse 通过与 `max_threads` 关联的处理通道实现查询并行化。
- 实际通道数量取决于待处理数据的大小。
- 使用 `EXPLAIN PIPELINE` 和跟踪日志分析通道使用情况。


## 获取更多信息 {#where-to-find-more-information}

如果您想深入了解 ClickHouse 如何并行执行查询以及如何在大规模场景下实现高性能,请参考以下资源:

- [查询处理层 – VLDB 2024 论文(网页版)](/academic_overview#4-query-processing-layer) - 详细剖析 ClickHouse 的内部执行模型,包括调度、流水线和算子设计。

- [部分聚合状态详解](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - 深入探讨部分聚合状态如何在处理通道之间实现高效并行执行。

- 详细介绍 ClickHouse 查询处理各个步骤的视频教程:
  <iframe
    width='1024'
    height='576'
    src='https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe'
    title='YouTube 视频播放器'
    frameborder='0'
    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    referrerpolicy='strict-origin-when-cross-origin'
    allowfullscreen
  ></iframe>
