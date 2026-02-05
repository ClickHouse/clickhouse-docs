---
slug: /use-cases/observability/clickstack/performance_tuning
title: 'ClickStack - 性能调优'
sidebar_label: '性能调优'
description: 'ClickStack 性能调优指南——ClickHouse 可观测性栈'
doc_type: 'guide'
keywords: ['clickstack', '可观测性', '日志', '性能', '优化']
---

import BetaBadge from '@theme/badges/BetaBadge';
import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import trace_filtering from '@site/static/images/clickstack/performance_guide/trace_filtering.png';
import trace_filtering_v2 from '@site/static/images/clickstack/performance_guide/trace_filtering_v2.png';
import select_merge_table from '@site/static/images/clickstack/performance_guide/select_merge_table.png';

import Image from '@theme/IdealImage';


## 引言 \{#introduction\}

本指南聚焦于 ClickStack 最常见且最有效的性能优化方法，足以优化绝大多数实际可观测性工作负载，通常可应对每天高达数十 TB 的数据量。

这些优化按精心设计的顺序呈现，从最简单且影响最大的技术开始，逐步过渡到更高级和更专业的调优。应优先应用前面这些优化，它们往往单独就能带来显著收益。随着数据量增长和工作负载要求提高，后续技术将愈发值得深入探索。

## ClickHouse 概念 \{#clickhouse-concepts\}

在应用本指南中描述的任何优化之前，了解一些核心的 ClickHouse 概念非常重要。

在 ClickStack 中，每个**数据源都直接映射到一个或多个 ClickHouse 表**。使用 OpenTelemetry 时，ClickStack 会创建并管理一组默认表，用于存储日志、追踪和指标数据。如果你使用自定义 schema 或自行管理表，可能已经熟悉这些概念。但如果你只是通过 OpenTelemetry Collector 发送数据，这些表会自动创建，且下文描述的所有优化都会应用在这些表上。

| 数据类型                        | 表                                                                                                                  |
|---------------------------------|---------------------------------------------------------------------------------------------------------------------|
| Logs                            | [otel_logs](/use-cases/observability/clickstack/ingesting-data/schemas#logs)                                       |
| Traces                          | [otel_traces](/use-cases/observability/clickstack/ingesting-data/schemas#traces)                                   |
| Metrics (gauges)                | [otel_metrics_gauge](/use-cases/observability/clickstack/ingesting-data/schemas#gauge)                             |
| Metrics (sums)                  | [otel_metrics_sum](/use-cases/observability/clickstack/ingesting-data/schemas#sum)                                 |
| Metrics (histogram)             | [otel_metrics_histogram](/use-cases/observability/clickstack/ingesting-data/schemas#histogram)                     |
| Metrics (Exponential histograms)| [otel_metrics_exponentialhistogram](/use-cases/observability/clickstack/ingesting-data/schemas#exponential-histograms) |
| Metrics (summary)               | [otel_metrics_summary](/use-cases/observability/clickstack/ingesting-data/schemas#summary-table)                   |
| Sessions                        | [hyperdx_sessions](/use-cases/observability/clickstack/ingesting-data/schemas#sessions)                            |

在 ClickHouse 中，表会被分配到[数据库](/sql-reference/statements/create/database)。默认使用 `default` 数据库——这可以在 [OpenTelemetry Collector 中进行修改](/use-cases/observability/clickstack/config#otel-collector)。

:::important 专注于日志和追踪
在大多数情况下，性能调优主要聚焦在日志和追踪表。虽然也可以对指标表进行面向过滤的优化，但它们的 schema 是有意针对 Prometheus 风格的工作负载设计的，通常不需要为标准图表做修改。相比之下，日志和追踪支持更广泛的访问模式，因此最能从调优中获益。Session 数据在产品中提供的是固定的用户体验，其 schema 很少需要修改。
:::

至少，你需要理解以下 ClickHouse 基础概念：

| 概念 | 说明 |
|------|------|
| **Tables** | ClickStack 中的数据源如何对应到底层的 ClickHouse 表。ClickHouse 中的表主要使用 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 引擎。 |
| **Parts** | 数据如何以不可变的分区片段写入，并随时间进行合并。 |
| **Partitions** | 分区如何将表的分区片段分组为有组织的逻辑单元，使其更易于管理、查询和优化。 |
| **Merges** | 将分区片段合并在一起的内部过程，以确保需要查询的分区片段数量更少。这对于维持查询性能至关重要。 |
| **Granules** | ClickHouse 在查询执行期间读取和裁剪的最小数据单元。 |
| **Primary (ordering) keys** | `ORDER BY` 键如何决定磁盘上的数据布局、压缩方式以及查询裁剪行为。 |

这些概念是 ClickHouse 性能的核心。它们决定数据如何写入、如何在磁盘上组织，以及 ClickHouse 在查询时能以多高的效率跳过不需要读取的数据。本指南中的每一项优化——无论是物化列、跳过索引、主键、PROJECTION（投影），还是 materialized view——都建立在这些核心机制之上。

建议在进行任何调优之前先阅读以下 ClickHouse 文档：

- [在 ClickHouse 中创建表](/guides/creating-tables) - 对表的简单介绍。
- [Parts](/parts)
- [Partitions](/partitions)
- [Merges](/merges)
- [Primary keys/indexes](/primary-indexes)
- [ClickHouse 如何存储数据：parts 和 granules](/guides/best-practices/sparse-primary-indexes) - 更高级的指南，详细介绍 ClickHouse 中数据的组织和查询方式，涵盖 granules 和主键。
- [MergeTree](/engines/table-engines/mergetree-family/mergetree) - 高级 MergeTree 参考指南，对命令和内部细节非常有用。

下文所述的所有优化都可以使用标准 ClickHouse SQL 直接应用于底层表，可通过 [ClickHouse Cloud SQL 控制台](/integrations/sql-clients/sql-console) 或通过 [ClickHouse 客户端](/interfaces/cli) 执行。

## 优化 1. 物化常被查询的属性 \{#materialize-frequently-queried-attributes\}

对于 ClickStack 用户，首个也是最简单的优化，是在 `LogAttributes`、`ScopeAttributes` 和 `ResourceAttributes` 中识别常被查询的属性，并通过物化列将它们提升为顶级列。

仅此一项优化通常就足以将 ClickStack 部署扩展到每天数十 TB 的规模，并且应当在考虑更高级调优技术之前优先采用。

### 为什么要物化属性 \{#why-materialize-attributes\}

ClickStack 会将 Kubernetes 标签、服务元数据以及自定义属性等元数据存储在 `Map(String, String)` 列中。虽然这种方式非常灵活，但在查询 Map 子键时会带来重要的性能影响。

当从一个 Map 列中查询单个键时，ClickHouse 必须从磁盘读取整个 Map 列。如果 Map 中包含大量键，相比读取一个专用列，这会导致不必要的 I/O，并使查询变慢。

通过在写入时提取值并将其存储为普通的独立列，对常用属性进行物化可以避免这类开销。

物化列：

- 会在插入期间自动计算
- 不能在 INSERT 语句中显式设置
- 支持任意 ClickHouse 表达式
- 允许将 String 类型转换为更高效的数值或日期类型
- 支持跳过索引（skip index）和主键的使用
- 通过避免对整个 Map 的访问来减少磁盘读取

:::note
ClickStack 会自动检测从 Map 中提取出来的物化列，并在查询执行期间透明地使用它们，即使用户仍然查询原始属性路径。
:::

### 示例 \{#materialize-column-example\}

以 ClickStack 中用于 traces 的默认 schema 为例，其中 Kubernetes 元数据存储在 `ResourceAttributes` 中：

```sql
CREATE TABLE IF NOT EXISTS otel_traces
(
    `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `TraceId` String CODEC(ZSTD(1)),
    `SpanId` String CODEC(ZSTD(1)),
    `ParentSpanId` String CODEC(ZSTD(1)),
    `TraceState` String CODEC(ZSTD(1)),
    `SpanName` LowCardinality(String) CODEC(ZSTD(1)),
    `SpanKind` LowCardinality(String) CODEC(ZSTD(1)),
    `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
    `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `ScopeName` String CODEC(ZSTD(1)),
    `ScopeVersion` String CODEC(ZSTD(1)),
    `SpanAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `Duration` UInt64 CODEC(ZSTD(1)),
    `StatusCode` LowCardinality(String) CODEC(ZSTD(1)),
    `StatusMessage` String CODEC(ZSTD(1)),
    `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
    `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
    `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
    `Links.TraceId` Array(String) CODEC(ZSTD(1)),
    `Links.SpanId` Array(String) CODEC(ZSTD(1)),
    `Links.TraceState` Array(String) CODEC(ZSTD(1)),
    `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
    `__hdx_materialized_rum.sessionId` String MATERIALIZED ResourceAttributes['rum.sessionId'] CODEC(ZSTD(1)),
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_rum_session_id __hdx_materialized_rum.sessionId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_duration Duration TYPE minmax GRANULARITY 1,
    INDEX idx_lower_span_name lower(SpanName) TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 8
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toDateTime(Timestamp))
TTL toDate(Timestamp) + toIntervalDay(30)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;
```

用户可以使用 Lucene 语法来过滤追踪数据，例如：`ResourceAttributes.k8s.pod.name:"checkout-675775c4cc-f2p9c"`：

<Image img={trace_filtering} size="lg" alt="Trace filtering" />

这会生成一个类似如下的 SQL 谓词：

```sql
ResourceAttributes['k8s.pod.name'] = 'checkout-675775c4cc-f2p9c'
```

由于这是通过 Map 键进行访问，ClickHouse 必须为每一条匹配的行读取完整的 `ResourceAttributes` 列——如果该 Map 包含很多键，这一列可能会非常大。

如果该属性被频繁查询，应将其物化为一个顶层列。

要在插入时提取 pod（容器组）名称，请添加一个物化列：

```sql
ALTER TABLE otel_v2.otel_traces
ADD COLUMN PodName String
MATERIALIZED ResourceAttributes['k8s.pod.name']
```

从现在开始，**新的**数据会将 pod（容器组）名称存储在独立列 `PodName` 中。

用户现在可以使用 Lucene 语法高效地按 pod 名称进行查询，例如：`PodName:"checkout-675775c4cc-f2p9c"`。

<Image img={trace_filtering_v2} size="lg" alt="Trace filtering v2" />

对于新插入的数据，这完全避免了对 map 的访问，并显著减少了 I/O。


但是，即使用户仍然查询原始属性路径，例如 `ResourceAttributes.k8s.pod.name:"checkout-675775c4cc-f2p9c"`，**ClickStack 也会在内部自动重写查询**，改为使用物化后的 `PodName` 列，即使用如下谓词：

```sql
PodName = 'checkout-675775c4cc-f2p9c'
```

这可确保用户无需修改仪表盘、告警或已保存的查询即可受益于该优化。

:::note
默认情况下，物化列会从 `SELECT *` 查询中排除。这样可以保持一个不变量：查询结果始终可以被重新插入到该表中。
:::


### 物化历史数据 \{#materializing-historical-data\}

物化列只会自动作用于在该列创建之后插入的数据。对于已有数据，对物化列的查询会透明地回退为从原始 map 中读取。

如果历史数据的查询性能至关重要，可以通过一次 mutation 回填该列，例如：

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE COLUMN PodName
```

这会重写现有的 [分区片段](/parts) 以填充该列。Mutation 在每个分区片段上以单线程执行，在大型数据集上可能耗时较长。为降低影响，可以将 mutation 限定到特定的分区上：

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE COLUMN PodName
IN PARTITION '2026-01-02'
```

可以使用 `system.mutations` 表来监控 mutation 的进度，例如：

```sql
SELECT *
FROM system.mutations
WHERE database = 'otel'
  AND table = 'otel_traces'
ORDER BY create_time DESC;
```

等待对应 mutation 的 `is_done` 变为 1。

:::important
Mutation 操作会带来额外的 IO 和 CPU 开销，应尽量少用。在很多情况下，只需允许旧数据自然老化，并依靠新近摄取数据带来的性能改进就已足够。
:::


## 优化 2. 添加数据跳过索引 \{#adding-skip-indices\}

在将常用查询属性物化之后，下一步的优化是添加数据跳过索引，以进一步减少 ClickHouse 在查询执行期间需要读取的数据量。

数据跳过索引使 ClickHouse 能够在确定不存在匹配值时，避免扫描整个数据块。与传统的二级索引不同，数据跳过索引在 granule 级别工作，并且在查询过滤条件可以排除数据集中大部分数据时最为有效。正确使用时，它们可以在不改变查询语义的情况下，大幅加速对高基数属性的过滤。

以 ClickStack 的默认 traces 模式（schema）为例，其中包含了数据跳过索引：

```sql
CREATE TABLE IF NOT EXISTS otel_traces
(
    `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `TraceId` String CODEC(ZSTD(1)),
    `SpanId` String CODEC(ZSTD(1)),
    `ParentSpanId` String CODEC(ZSTD(1)),
    `TraceState` String CODEC(ZSTD(1)),
    `SpanName` LowCardinality(String) CODEC(ZSTD(1)),
    `SpanKind` LowCardinality(String) CODEC(ZSTD(1)),
    `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
    `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `ScopeName` String CODEC(ZSTD(1)),
    `ScopeVersion` String CODEC(ZSTD(1)),
    `SpanAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `Duration` UInt64 CODEC(ZSTD(1)),
    `StatusCode` LowCardinality(String) CODEC(ZSTD(1)),
    `StatusMessage` String CODEC(ZSTD(1)),
    `Events.Timestamp` Array(DateTime64(9)) CODEC(ZSTD(1)),
    `Events.Name` Array(LowCardinality(String)) CODEC(ZSTD(1)),
    `Events.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
    `Links.TraceId` Array(String) CODEC(ZSTD(1)),
    `Links.SpanId` Array(String) CODEC(ZSTD(1)),
    `Links.TraceState` Array(String) CODEC(ZSTD(1)),
    `Links.Attributes` Array(Map(LowCardinality(String), String)) CODEC(ZSTD(1)),
    `__hdx_materialized_rum.sessionId` String MATERIALIZED ResourceAttributes['rum.sessionId'] CODEC(ZSTD(1)),
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_rum_session_id __hdx_materialized_rum.sessionId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_span_attr_key mapKeys(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_span_attr_value mapValues(SpanAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_duration Duration TYPE minmax GRANULARITY 1,
    INDEX idx_lower_span_name lower(SpanName) TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 8
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toDateTime(Timestamp))
TTL toDate(Timestamp) + toIntervalDay(30)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;
```

这些索引主要针对两种常见模式：

* 高基数字符串过滤，例如 TraceId、会话 ID、属性键或属性值
* 数值范围过滤，例如 span 持续时间


### Bloom filters \{#bloom-filters\}

Bloom 过滤器索引是 ClickStack 中最常用的 skip index 类型。它们非常适合基数很高的字符串列，通常至少有数万种不同的取值。将误报率设置为 0.01 且粒度（granularity）为 1 是一个不错的默认起点，在存储开销和查询裁剪效果之间实现了良好平衡。

延续“优化 1”中的示例，假设 Kubernetes pod（容器组）名称已经从 ResourceAttributes 中物化出来：

```sql
ALTER TABLE otel_traces
ADD COLUMN PodName String
MATERIALIZED ResourceAttributes['k8s.pod.name']
```

接下来可以添加 Bloom filter 跳过索引，以加速对该列的过滤：

```sql
ALTER TABLE otel_traces
ADD INDEX idx_pod_name PodName
TYPE bloom_filter(0.01)
GRANULARITY 1
```

添加之后，skip index 必须进行物化 —— 参见[“物化 skip index。”](#materialize-skip-index)

一旦创建并物化，ClickHouse 就可以跳过整个可以保证不包含所请求 pod（容器组）名称的 granule，从而在诸如 `PodName:"checkout-675775c4cc-f2p9c"` 之类的查询中潜在地减少读取的数据量。

当值的分布特征使得某个给定值只会出现在相对较少数量的分区片段中时，Bloom filter 的效果最佳。在可观测性工作负载中，这种情况往往自然出现，因为诸如 pod（容器组）名称、trace ID 或会话标识符等元数据会与时间相关联，因此会按照表的排序键聚簇存储。

与所有 skip index 一样，应有选择地添加 Bloom filter，并基于真实的查询模式进行验证，以确保它们能带来可衡量的收益 —— 参见[“评估 skip index 的有效性。”](#evaluating-skip-index-effectiveness)


### 最小-最大索引 \{#min-max-indices\}

Minmax 索引在每个粒度上存储最小值和最大值，并且极其轻量。它们对数值列和范围查询特别有效。虽然它们可能不会加速每一次查询，但成本很低，对于数值字段几乎总是值得添加。

当数值要么天然有序，要么在每个数据 part 内被限制在较窄的取值范围时，Minmax 索引效果最佳。

假设经常需要从 `SpanAttributes` 中查询 Kafka 偏移量（offset）：

```sql
SpanAttributes['messaging.kafka.offset']
```

此值可以先物化，再转换为数值类型：

```sql
ALTER TABLE otel_traces
ADD COLUMN KafkaOffset UInt64
MATERIALIZED toUInt64(SpanAttributes['messaging.kafka.offset'])
```

随后可以添加一个 minmax 索引：

```sql
ALTER TABLE otel_traces
ADD INDEX idx_kafka_offset KafkaOffset TYPE minmax GRANULARITY 1
```

这使得 ClickHouse 能在按 Kafka offset 范围进行过滤时高效地跳过分区片段，例如在调试 consumer 滞后（lag）或消息重放行为时。

同样，索引必须先被[物化](#materialize-skip-index)，之后才能生效。


### 物化 skip 索引 \{#materialize-skip-index\}

在添加 skip 索引之后，它只会应用于新摄取的数据。历史数据在显式将其物化之前无法从该索引中受益。

如果已经添加了一个 skip 索引，例如：

```sql
ALTER TABLE otel_traces ADD INDEX idx_kafka_offset KafkaOffset TYPE minmax GRANULARITY 1;
```

必须显式地为已有数据构建索引：

```sql
ALTER TABLE otel_traces MATERIALIZE INDEX idx_kafka_offset;
```

:::note[物化跳过索引]
物化跳过索引通常开销较小，运行也比较安全，尤其是针对 minmax 索引。对于大型数据集上的 Bloom 过滤器索引，用户可以选择按分区分别物化，以便更好地控制资源使用，例如：

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE INDEX idx_kafka_offset
IN PARTITION '2026-01-02';
```

:::

将跳过索引物化会作为一次 mutation 操作执行。其进度可以在 system 表中进行监控。

```sql

SELECT *
FROM system.mutations
WHERE database = 'otel'
  AND table = 'otel_traces'
ORDER BY create_time DESC;
```

等待相应变更操作的 `is_done = 1`。

完成后，确认索引数据已创建：

```sql
SELECT database, table, name,
       data_compressed_bytes,
       data_uncompressed_bytes,
       marks_bytes
FROM system.data_skipping_indices
WHERE database = 'otel'
  AND table = 'otel_traces'
  AND name = 'idx_kafka_offset';
```

非零值表示索引已成功物化。

需要注意，跳过索引的大小会直接影响查询性能。非常大的跳过索引（数量级达到数十或数百 GB）在查询执行过程中评估时可能需要明显的时间，这会降低甚至抵消其带来的收益。

在实践中，minmax 索引通常非常小，评估开销也很低，因此几乎总是可以安全地物化。另一方面，Bloom filter 索引的大小则可能根据基数、粒度以及误报概率显著增长。

可以通过提高允许的误报率来减小 Bloom filter 的大小。例如，将概率参数从 `0.01` 提高到 `0.05`，会得到一个更小、评估更快的索引，但代价是剪枝不那么激进。即使被跳过的粒度单元（granule）变少，由于索引评估更快，整体查询延迟仍然可能得到改善。

因此，调优 Bloom filter 参数是一种与工作负载相关的优化，应使用真实的查询模式和接近生产的数据规模进行验证。

有关跳过索引的更多详细信息，请参阅指南 [&quot;Understanding ClickHouse data skipping indexes.&quot;](/optimize/skipping-indexes/examples)


### 评估跳过索引的有效性 \{#evaluating-skip-index-effectiveness\}

评估跳过索引剪枝最可靠的方法是使用 `EXPLAIN indexes = 1`，它会显示在查询规划的每个阶段消除了多少[分区片段](/parts)和[granules](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)。在大多数情况下，通常希望在 Skip 阶段看到 granules 有大幅减少，理想情况下是在主键已经先行缩小搜索空间之后再发生。跳过索引是在分区剪枝和主键剪枝之后进行评估的，因此评估其效果时，最好是相对于剩余的分区片段和 granules 来衡量。

`EXPLAIN` 可以确认是否发生了剪枝，但并不能保证净性能提升。跳过索引本身也有评估开销，尤其是当索引很大时更是如此。务必在添加并物化一个索引前后对查询进行基准测试，以确认实际性能是否得到提升。

例如，考虑 Traces 默认模式中随附的、针对 TraceId 的默认 Bloom 过滤器跳过索引：

```sql
INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1
```

你可以使用 `EXPLAIN indexes = 1` 来查看它在高选择性查询中的效果：

```sql
EXPLAIN indexes = 1
SELECT *
FROM otel_v2.otel_traces
WHERE (ServiceName = 'accounting')
  AND (TraceId = 'aeea7f401feb75fc5af8eb25ebc8e974');

ReadFromMergeTree (otel_v2.otel_traces)
Indexes:
  PrimaryKey
    Keys:
      ServiceName
    Parts: 6/18
    Granules: 255/35898
  Skip
    Name: idx_trace_id
    Description: bloom_filter GRANULARITY 1
    Parts: 1/6
    Granules: 1/255
```

在这种情况下，主键过滤首先将数据集大幅缩小（从 35898 个 granule 降到 255 个），然后 Bloom filter 进一步将其缩减到单个 granule（1/255）。这就是 skip 索引的理想用法：先通过主键裁剪来缩小搜索范围，再由 skip 索引去掉大部分剩余的数据。

要验证实际影响，请在稳定的设置下对查询进行基准测试并比较执行时间。使用 `FORMAT Null` 以避免结果序列化的开销，并禁用查询条件缓存，以保证多次运行具有可比性和可重复性：

```sql
SELECT *
FROM otel_traces
WHERE (ServiceName = 'accountingservice') AND (TraceId = '4512e822ca3c0c68bbf5d4a263f9943d')
SETTINGS use_query_condition_cache = 0

2 rows in set. Elapsed: 0.025 sec. Processed 8.52 thousand rows, 299.78 KB (341.22 thousand rows/s., 12.00 MB/s.)
Peak memory usage: 41.97 MiB.
```

现在在禁用 skip 索引的情况下运行相同的查询：

```sql
SELECT *
FROM otel_traces
WHERE (ServiceName = 'accountingservice') AND (TraceId = '4512e822ca3c0c68bbf5d4a263f9943d')
FORMAT Null
SETTINGS use_query_condition_cache = 0, use_skip_indexes = 0;

0 rows in set. Elapsed: 0.702 sec. Processed 1.62 million rows, 56.62 MB (2.31 million rows/s., 80.71 MB/s.)
Peak memory usage: 198.39 MiB.
```

禁用 `use_query_condition_cache` 可确保结果不会受到缓存过滤决策的影响，将 `use_skip_indexes` 设置为 0 则为对比测试提供了干净的基线。如果剪枝有效且索引评估开销较低，那么带索引的查询应当会明显更快，就像上面的示例一样。

:::tip
如果 `EXPLAIN` 显示粒度剪枝很少，或者 skip 索引非常大，那么评估索引的开销可能会抵消其带来的收益。使用 `EXPLAIN indexes = 1` 来确认剪枝效果，然后通过基准测试验证端到端性能改进。
:::


### 何时添加 skip 索引 \{#when-to-add-skip-indexes\}

应当有选择性地添加 skip 索引，依据是用户最常使用的过滤条件类型，以及数据在分区片段和 granule 中的分布形态。目标是在裁剪掉足够多的 granule 的同时，抵消评估索引本身的开销，这也是为什么在接近生产环境的数据上进行基准测试至关重要。

**对于参与过滤条件的数值列，minmax skip 索引几乎总是一个不错的选择。** 它轻量、评估成本低，并且对范围谓词很有效——尤其是在数值大致有序，或在某个分区片段内部被限制在较窄范围时。即使在某些特定查询模式下 minmax 并没有带来帮助，它的开销通常也足够低，因此保留它依然是合理的。

**字符串列：当基数较高且取值稀疏时，使用 Bloom filter。**

Bloom filter 在高基数字符串列上最为有效，此时每个取值本身出现频率相对较低，也就是说大多数分区片段和 granule 都不包含被搜索的值。经验法则是，当列至少具有 10,000 个不同取值时，Bloom filter 就变得很有前景；而在具有 100,000+ 个不同取值时通常表现最佳。当匹配的取值被聚集在少量连续的分区片段中时，它们也会更有效，这通常发生在该列与排序键存在关联的情况下。同样，你在这方面得到的收益可能会有所差异——没有任何东西可以替代真实环境下的测试。

## 优化 3. 修改主键 \{#modifying-the-primary-key\}

对于大多数工作负载而言，主键是 ClickHouse 性能调优中最重要的组件之一。要有效地进行调优，必须理解它的工作原理，以及它如何与查询模式交互。归根结底，主键应当与用户访问数据的方式保持一致，尤其是最常用于过滤的列。

虽然主键也会影响压缩率和存储布局，但其首要目的仍然是查询性能。在 ClickStack 中，开箱即用的主键已经针对最常见的可观测性访问模式以及高压缩比进行了优化。日志、跟踪和指标表的默认键被设计为在典型工作流中具有良好表现。

在主键中越靠前的列，用于过滤时就越高效；越靠后的列，用于过滤时就越低效。虽然默认配置对大多数用户已经足够，但在某些情况下，为特定工作负载修改主键可以提升性能。

:::note[术语说明]
在本文档中，“ordering key（排序键）”一词与“primary key（主键）”可互换使用。严格来说，在 ClickHouse 中它们有所区别，但对于 ClickStack，它们通常都指表中 `ORDER BY` 子句中指定的相同列。详情参见 ClickHouse 文档中关于[选择与排序键不同的主键](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key)的说明。
:::

在修改任何主键之前，我们强烈建议先阅读我们关于理解 ClickHouse 中[主索引工作原理的指南](/primary-indexes)：

主键调优是针对具体表和数据类型的。对某个表和数据类型有利的更改可能不适用于其他表。目标始终是针对某一特定数据类型进行优化，例如日志。

**通常情况下，你只需要为日志和跟踪表进行优化。很少需要对其他数据类型进行主键更改。**

下面是 ClickStack 中日志和指标表的默认主键。

- 日志（[`otel_logs`](/use-cases/observability/clickstack/ingesting-data/schemas#logs)）- `(ServiceName, TimestampTime, Timestamp)`
- 跟踪（[`otel_traces`](/use-cases/observability/clickstack/ingesting-data/schemas#traces)）- `(ServiceName, SpanName, toDateTime(Timestamp))`

关于其他数据类型表所使用的主键，请参见「[ClickStack 使用的表和 schema](/use-cases/observability/clickstack/ingesting-data/schemas)」。例如，跟踪表针对按服务名称和 span 名称进行过滤进行了优化，其次是按时间戳和 trace ID 过滤。相反，日志表则针对按服务名称、然后按日期、最后按时间戳进行过滤进行了优化。尽管最优情况是用户按照主键的顺序应用过滤条件，但只要对这些列中的任意列进行过滤（无论顺序如何），查询仍然会获益匪浅，因为 ClickHouse 会在读取之前[跳过无关数据](/optimize/skipping-indexes)。

在选择主键时，对于如何选择列的最佳排序还有其他需要考虑的因素。参见「[选择主键](#choosing-a-primary-key)」。

**主键应当在每个表上独立更改。对于日志合理的设计，可能并不适用于跟踪或指标表。**

### 选择主键 \{#choosing-a-primary-key\}

首先，确定你的访问模式是否与某个特定表的默认模式有显著差异。比如，如果你最常见的日志查询方式是先按 Kubernetes 节点过滤，然后再按服务名称过滤，而且这是主要的工作流，那么就可能值得调整主键。

:::note[修改默认主键]
默认主键在大多数情况下已经足够使用。只有在充分理解查询模式的前提下，才应谨慎进行修改。修改主键可能会降低其他工作流的性能，因此测试是必不可少的。
:::

一旦你提取出了所需的列，就可以开始优化排序键 / 主键。

在选择排序键时，可以应用一些简单的规则。下面这些规则有时会相互冲突，因此请按顺序考虑。目标是从这个过程中最多选择 4–5 个键：

1. 选择与你常见过滤条件和访问模式相匹配的列。如果你通常在可观测性排查时先通过某个特定列（例如 pod（容器组）名称）进行过滤，那么该列会在 `WHERE` 子句中被频繁使用。优先在键中包含这些列，而不是那些使用频率较低的列。
2. 优先选择在过滤时能排除大部分总行数的列，从而减少需要读取的数据量。服务名称和状态码通常是不错的候选——但对后者而言，仅当你按能排除大多数行的值进行过滤时才有效，例如，过滤 200 状态码在大多数系统中会匹配大部分行，而 500 错误通常只对应一个较小的子集。
3. 优先选择可能与表中其他列高度关联的列。这有助于确保这些值也能连续存储，从而提升压缩效果。
4. 对排序键中的列进行 `GROUP BY`（图表聚合）和 `ORDER BY`（排序）操作时，可以更加节省内存。

在确定了用于排序键的列子集之后，必须以特定顺序声明它们。这个顺序会显著影响查询中对排序键中后续列（次级键列）进行过滤的效率，以及表数据文件的压缩比。一般来说，最好按照基数从小到大对键进行排序。同时需要平衡的一点是：在排序键中位置越靠后的列，其过滤效率会低于排在元组前面的列。综合这些特性，并结合你的访问模式进行权衡。最重要的是，对不同变体进行测试。要进一步理解排序键以及如何优化它们，推荐阅读 ["Choosing a Primary Key."](/best-practices/choosing-a-primary-key)。若想更深入了解主键调优和内部数据结构，请参阅 ["A practical introduction to primary indexes in ClickHouse."](/guides/best-practices/sparse-primary-indexes)

### 更改主键 \{#changing-the-primary-key\}

如果您在数据摄取之前已经对访问模式有足够信心，可以直接删除并为相关数据类型重新创建表。

下面的示例展示了一种简单方式：在沿用现有表结构的基础上创建一个新的日志表，但使用一个新的主键，在 `ServiceName` 之前加入列 `SeverityText`。

<VerticalStepper headerLevel="h4">

#### 创建新表 \{#create-new-table-with-key\}

```sql
CREATE TABLE otel_logs_temp AS otel_logs
PRIMARY KEY (SeverityText, ServiceName, TimestampTime)
ORDER BY (SeverityText, ServiceName, TimestampTime)
```

:::note 排序键 vs 主键
注意在上面的示例中，需要同时指定 `PRIMARY KEY` 和 `ORDER BY`。
在 ClickStack 中，它们几乎总是相同的。
`ORDER BY` 控制物理数据布局，而 `PRIMARY KEY` 定义稀疏索引。
在极少数、规模非常大的负载下，它们可能会不同，但大多数用户应当保持两者一致。
:::

#### 交换并删除表 \{#exhange-and-drop-table\}

`EXCHANGE` 语句用于[原子地](/concepts/glossary#atomicity)交换表名。临时表（此时为旧的默认表）可以被删除。

```sql
EXCHANGE TABLES otel_logs_temp AND otel_logs
DROP TABLE otel_logs_temp
```

</VerticalStepper>

但是，**不能在已有表上直接修改主键**。更改主键需要创建一个新表。

可以使用以下流程来确保旧数据仍然被保留并可透明查询（如果需要，可在 HyperDX 中继续使用其现有键），同时新数据通过一个针对用户访问模式优化的新表对外暴露。该方法确保摄取流水线无需修改，数据仍然发送到默认表名，且对用户完全透明。

:::note
在大规模场景下，将已有数据回填到新表中通常并不划算。计算和 IO 成本往往很高，通常不足以抵消性能收益。相反，可以允许旧数据通过 [生存时间 (TTL)](/use-cases/observability/clickstack/ttl) 自动过期，同时让新数据受益于改进后的键。
:::

<VerticalStepper headerLevel="h4">

下面继续使用相同示例：将 `SeverityText` 作为主键中的第一列。在这种情况下，为新数据创建一个新表，同时保留旧表用于历史分析。

#### 创建新表 \{#create-new-table-with-key-2\}

使用所需的主键创建新表。注意后缀 `_23_01_2025` —— 请根据当前日期进行调整，例如：

```sql
CREATE TABLE otel_logs_23_01_2025 AS otel_logs
PRIMARY KEY (SeverityText, ServiceName, TimestampTime)
ORDER BY (SeverityText, ServiceName, TimestampTime)
```

#### 创建 Merge 表 \{#create-merge-table\}

[Merge 引擎](/engines/table-engines/special/merge)（不要与 MergeTree 混淆）本身不存储数据，但允许同时从任意数量的其他表中读取数据。

```sql
CREATE TABLE otel_logs_merge
AS otel_logs
ENGINE = Merge(currentDatabase(), 'otel_logs*')
```

:::note
`currentDatabase()` 假定命令在正确的数据库中执行。否则，请显式指定数据库名。
:::

现在可以查询该表，以确认它会返回来自 `otel_logs` 的数据。

#### 更新 HyperDX 以从 Merge 表读取数据 \{#update-hyperdx-to-read-from-merge-tree\}

将 HyperDX 配置为使用 `otel_logs_merge` 作为日志数据源的表。

<Image img={select_merge_table} size="lg" alt="选择 Merge 表"/>

此时，写入仍然进入使用原始主键的 `otel_logs`，而读取则使用 Merge 表。对用户没有可见变化，对摄取没有任何影响。

#### 交换这些表 \{#exchange-the-tables\}

现在使用 `EXCHANGE` 语句，以原子的方式交换 `otel_logs` 和 `otel_logs_23_01_2025` 两个表的名称。

```sql
EXCHANGE TABLES otel_logs AND otel_logs_23_01_2025
```

从现在起，写入会进入带有更新后主键的新 `otel_logs` 表。现有数据保留在 `otel_logs_23_01_2025` 中，并且仍然可以通过 Merge 表访问。该后缀表示变更生效的日期，同时也代表该表中包含的最新时间戳。

通过此流程，可以在不中断摄取、且对用户无可见影响的情况下完成主键变更。

</VerticalStepper>

如果之后需要进一步更改主键，可以按相同流程进行调整。例如，如果在一周后决定实际上应该将 `SeverityNumber` 而不是 `SeverityText` 作为主键的一部分，则可以再次执行以下流程。只要需要变更主键，就可以反复使用这一流程。

<VerticalStepper headerLevel="h4">

#### 创建新表 \{#create-new-table-with-key-3\}

使用所需的主键创建新表。
在下面的示例中，`30_01_2025` 被用作表名后缀来表示该表的日期，例如：

```sql
CREATE TABLE otel_logs_30_01_2025 AS otel_logs
PRIMARY KEY (SeverityNumber, ServiceName, TimestampTime)
ORDER BY (SeverityNumber, ServiceName, TimestampTime)
```

#### 交换表 \{#exchange-the-tables-v2\}

现在使用 `EXCHANGE` 语句以原子方式交换 `otel_logs` 和 `otel_logs_30_01_2025` 两张表的名称。

```sql
EXCHANGE TABLES otel_logs AND otel_logs_30_01_2025
```

此时写入会落到新的 `otel_logs` 表上，并使用更新后的主键。旧数据保留在 `otel_logs_30_01_2025` 中，并可通过 Merge 表访问。

</VerticalStepper>

:::note Redundant tables
如果已经配置了生存时间 (TTL) 策略（推荐这样做），那么不再接收写入且使用旧主键的表会随着数据过期逐渐变空。应对这些表进行监控，并在其不再包含数据时定期清理。目前，这一清理过程需要手动完成。
:::

## 优化 4. 利用 Materialized Views \{#exploting-materialied-views\}

<BetaBadge/>

ClickStack 可以利用 [增量 Materialized Views](/materialized-view/incremental-materialized-view) 来加速依赖重度聚合查询的可视化，例如随时间计算每分钟平均请求时长。该特性能显著提升查询性能，通常对规模较大的部署（例如每天约 10 TB 及以上）最为有利，同时能够扩展到每天 PB 级别的数据量。增量 Materialized Views 目前处于 Beta 阶段，使用时应当谨慎。

有关在 ClickStack 中使用此特性的详细信息，请参见我们的专用指南 [“ClickStack - Materialized Views.”](/use-cases/observability/clickstack/materialized_views)

## 优化 5：利用投影 \{#exploting-projections\}

在已经评估了物化列、跳过索引、主键以及 materialized view 之后，投影是一种可以考虑的最终高级优化手段。尽管投影和 materialized view 看起来相似，但在 ClickStack 中，它们承担不同的角色，且更适合用于不同的场景。

<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

在实践中，**可以将投影视为表的一个额外的、隐藏的副本**，它以**不同的物理顺序**存储相同的行。这样，投影就拥有一套独立于基础表 `ORDER BY` 键的主索引，从而使 ClickHouse 能够针对与原始排序不一致的访问模式更高效地裁剪要读取的数据。

materialized view 也可以通过将行显式写入具有不同排序键的独立目标表来实现类似效果。关键区别在于，**投影由 ClickHouse 自动且透明地维护**，而 materialized view 是显式的表，必须由 ClickStack 在应用层主动注册并选择使用。

当查询针对基础表时，ClickHouse 会评估基础布局和所有可用的投影，对它们的主索引进行抽样，并选择在读取最少 granule 的前提下仍能产生正确结果的布局。这个决策由查询分析器自动完成。

因此，在 ClickStack 中，投影最适合用于**纯数据重排**的场景，例如：

- 访问模式与默认主键存在根本性差异
- 无法用单一排序键覆盖所有工作流
- 你希望由 ClickHouse 透明地选择最优物理布局

对于预聚合和指标加速，ClickStack 强烈推荐使用**显式的 materialized view**，这使应用层能够完全控制视图的选择和使用方式。

更多背景信息，请参考：

- [投影指南](/data-modeling/projections)
- [何时使用投影](/data-modeling/projections#when-to-use-projections)
- [materialized view 与投影的对比](/managing-data/materialized-views-versus-projections)

### 示例投影 \{#example-projections\}

假设您的 traces 表已经针对 ClickStack 的默认访问模式进行了优化：

```sql
ORDER BY (ServiceName, SpanName, toDateTime(Timestamp))
```

如果您的主要查询工作流之一是按 TraceId 进行过滤（或经常围绕 TraceId 进行分组和过滤），可以添加一个 PROJECTION，将行按 TraceId 和时间排序后存储：

```sql
ALTER TABLE otel_v2.otel_traces
ADD PROJECTION prj_traceid_time
(
    SELECT *
    ORDER BY (TraceId, toDateTime(Timestamp))
);
```

:::note 使用通配符
在上面的示例 projection 中使用了通配符（`SELECT *`）。虽然只选择部分列可以减少写入开销，但这也会限制 projection 的使用时机，因为只有完全能由这些列满足的查询才符合使用条件。在 ClickStack 中，这通常会将 projection 的使用限制在非常狭窄的场景。因此，一般推荐使用通配符以最大化适用性。
:::

与其他数据布局更改一样，projection 只会影响新写入的分区片段。要为已有数据构建它，需要将其物化：

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE PROJECTION prj_traceid_time;
```

:::note
物化一个 projection 可能会花费很长时间，并消耗大量资源。由于可观测性数据通常会通过生存时间 (TTL) 自动过期，只有在绝对必要时才应这样做。在大多数情况下，只让 projection 应用于新摄取的数据就足够了，这样它可以优化最常被查询的时间范围，例如最近 24 小时。
:::

当 ClickHouse 估计某个 projection 扫描的 granule 少于基础表布局时，可能会自动选择该 projection。当 projection 只是对完整行集（`SELECT *`）的简单重排序，且查询过滤条件与该 projection 的 `ORDER BY` 高度吻合时，该 projection 的效果最可靠。

对 TraceId 进行过滤（尤其是等值过滤）并包含时间范围的查询，将会从上述 projection 中受益。例如：

```sql
-- Fetch a specific trace quickly
SELECT *
FROM otel_traces
WHERE TraceId = 'aeea7f401feb75fc5af8eb25ebc8e974'
  AND Timestamp >= now() - INTERVAL 1 DAY
ORDER BY Timestamp;

-- Trace-scoped aggregation
SELECT
  toStartOfMinute(Timestamp) AS t,
  count() AS spans
FROM otel_traces
WHERE TraceId = 'aeea7f401feb75fc5af8eb25ebc8e974'
  AND Timestamp >= now() - INTERVAL 1 DAY
GROUP BY t
ORDER BY t;
```

对于不限定 `TraceId`，或主要在不位于 Projection 排序键前导位置的其他维度上进行过滤的查询，通常不会从中受益（并且可能会退回通过基础布局进行读取）。

:::note
Projections 也可以存储聚合（类似于 materialized views）。在 ClickStack 中，一般不推荐使用基于 Projection 的聚合，因为其选择依赖于 ClickHouse 分析器，使用方式更难控制且不易推理。相较之下，更推荐使用显式的 materialized views，由 ClickStack 在应用层显式注册并有意识地选择使用。
:::

在实践中，Projections 最适合用于这样的工作流：你经常需要从更宽泛的搜索快速切换到以 trace 为中心的下钻分析（例如，获取某个特定 TraceId 的所有 span）。


### 成本与使用指导 \{#projection-costs-and-guidance\}

- **写入开销**：使用不同排序键的 `SELECT *` projection 实际上会将数据写入两次，这会增加写入 I/O，并可能需要额外的 CPU 和磁盘吞吐量来维持摄取能力。
- **谨慎使用**：Projections 更适用于确实存在多样化访问模式的场景，此时第二种物理排序可以为大量查询带来有意义的数据裁剪，例如两个团队以截然不同的方式查询同一数据集。
- **通过基准测试验证**：与所有调优工作一样，应在添加并 materialize projection 前后，对比真实查询延迟和资源使用情况。

如需更深入的背景介绍，请参阅：

- [ClickHouse projections 指南](/data-modeling/projections#when-to-use-projections)
- [Materialized views 与 projections 的比较](/managing-data/materialized-views-versus-projections)

### 使用 `_part_offset` 的轻量级投影 \{#lightweight-projections\}

<BetaBadge/>

:::note[轻量级投影在 ClickStack 中为 Beta 功能]
基于 `_part_offset` 的轻量级投影不建议用于 ClickStack 工作负载。虽然它们可以减少存储和写入 I/O，但会在查询时引入更多随机访问，而且其在可观测性场景下大规模生产环境中的行为仍在评估中。随着该特性逐渐成熟、我们获得更多运维数据，这一建议可能会发生变化。
:::

较新的 ClickHouse 版本还支持更轻量级的投影，这类投影只存储投影的排序键以及指向基础表的 `_part_offset` 指针，而不是重复存储完整行。这可以大幅降低存储开销，且最近的改进支持粒度级别的剪枝，使其行为更接近真正的二级索引。参见：

- [使用 _part_offset 的更智能存储](/data-modeling/projections#smarter_storage_with_part_offset)
- [博客说明和示例](https://clickhouse.com/blog/projections-secondary-indices#example-combining-multiple-projection-indexes)

### 替代方案 \{#projection-alternatives\}

如果需要多个排序键，projection 并非唯一选项。根据运维约束以及希望 ClickStack 如何路由查询，可以考虑：

- 配置 OpenTelemetry collector，将数据写入两个具有不同 `ORDER BY` 键的表，并为每个表分别创建 ClickStack source。
- 创建一个 materialized view 作为复制（copy）管道，即在主表上附加一个 materialized view，将原始行写入到具有不同排序键的次级表中（反规范化或路由模式）。为该目标表创建一个 source。示例可以在[这里](/materialized-view/incremental-materialized-view#filtering-and-transformation)找到。