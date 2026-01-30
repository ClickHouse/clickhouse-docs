---
slug: /use-cases/observability/clickstack/performance_tuning
title: 'ClickStack - 性能调优'
sidebar_label: '性能调优'
description: 'ClickStack 性能调优 - ClickHouse 可观测性栈'
doc_type: 'guide'
keywords: ['clickstack', 'observability', 'logs', 'performance', 'optimization']
---

import BetaBadge from '@theme/badges/BetaBadge';
import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import trace_filtering from '@site/static/images/clickstack/performance_guide/trace_filtering.png';
import trace_filtering_v2 from '@site/static/images/clickstack/performance_guide/trace_filtering_v2.png';
import select_merge_table from '@site/static/images/clickstack/performance_guide/select_merge_table.png';

import Image from '@theme/IdealImage';


## 介绍 \{#introduction\}

本指南重点介绍 ClickStack 最常见且最有效的性能优化方法，足以优化大多数真实生产环境中的可观测性工作负载，通常可应对每天数十 TB 级别的数据量。

这些优化按照精心设计的顺序呈现，从最简单且影响最大的技术开始，逐步推进到更高级和更专业的调优手段。应优先应用前期优化措施，它们往往单独就能带来可观的收益。随着数据规模增长和工作负载变得更加复杂和苛刻，后续的技术会越来越值得深入探索。

## ClickHouse 概念 \{#clickhouse-concepts\}

在应用本指南中描述的任何优化之前，先熟悉一些核心的 ClickHouse 概念非常重要。

在 ClickStack 中，每个**数据源都会直接映射到一个或多个 ClickHouse 表**。在使用 OpenTelemetry 时，ClickStack 会创建并管理一组默认表，用于存储日志、追踪和指标数据。如果你使用自定义 schema 或自行管理表，可能已经熟悉这些概念。不过，如果你只是通过 OpenTelemetry Collector 发送数据，这些表会自动创建，下面描述的所有优化也都会应用在这些表上。

| Data type                        | Table                                                                                                                  |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------|
| Logs                             | [otel_logs](/use-cases/observability/clickstack/ingesting-data/schemas#logs)                                          |
| Traces                           | [otel_traces](/use-cases/observability/clickstack/ingesting-data/schemas#traces)                                       |
| Metrics (gauges)                 | [otel_metrics_gauge](/use-cases/observability/clickstack/ingesting-data/schemas#gauge)                                 |
| Metrics (sums)                   | [otel_metrics_sum](/use-cases/observability/clickstack/ingesting-data/schemas#sum)                                     |
| Metrics (histogram)              | [otel_metrics_histogram](/use-cases/observability/clickstack/ingesting-data/schemas#histogram)                         |
| Metrics (Exponential histograms) | [otel_metrics_exponentialhistogram](/use-cases/observability/clickstack/ingesting-data/schemas#exponential-histograms) |
| Metrics (summary)                | [otel_metrics_summary](/use-cases/observability/clickstack/ingesting-data/schemas#summary-table)                       |
| Sessions                         | [hyperdx_sessions](/use-cases/observability/clickstack/ingesting-data/schemas#sessions)                                |

在 ClickHouse 中，表会被分配到[数据库](/sql-reference/statements/create/database)。默认会使用 `default` 数据库——这一点可以在 [OpenTelemetry Collector 中进行修改](/use-cases/observability/clickstack/config#otel-collector)。

:::important 重点关注日志和追踪
在大多数情况下，性能调优主要集中在日志和追踪表。虽然指标表也可以针对过滤进行优化，但其 schema 是为 Prometheus 风格的负载特意设计的，通常不需要为标准图表做修改。相比之下，日志和追踪支持更广泛的访问模式，因此最能从调优中获益。会话数据提供的是固定的用户体验，其 schema 几乎不需要修改。
:::

至少需要理解以下 ClickHouse 基础概念：

| Concept | Description |
|---------|-------------|
| **Tables** | ClickStack 中的数据源如何对应到底层 ClickHouse 表。ClickHouse 中的表主要使用 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 引擎。 |
| **Parts** | 数据如何以不可变的分区片段写入，并随着时间推移被合并。 |
| **Partitions** | 分区会将表的分区片段分组为有组织的逻辑单元。这些单元更易于管理、查询和优化。 |
| **Merges** | 将分区片段合并在一起的内部过程，用于确保需要查询的分区片段数量更少。这对于维持查询性能至关重要。 |
| **Granules** | ClickHouse 在查询执行期间读取和裁剪的最小数据单元。 |
| **Primary (ordering) keys** | `ORDER BY` 键如何决定磁盘上的数据布局、压缩方式以及查询时的数据裁剪。 |

这些概念是 ClickHouse 性能的核心。它们决定了数据如何写入、如何在磁盘上组织，以及 ClickHouse 在查询时跳过读取数据的效率。本指南中的每一项优化——无论是物化列、跳过索引、主键、PROJECTION，还是 materialized view——都建立在这些核心机制之上。

建议在进行任何调优之前先查阅以下 ClickHouse 文档：

- [Creating tables in ClickHouse](/guides/creating-tables) - 关于表的简单介绍。
- [Parts](/parts)
- [Partitions](/partitions)
- [Merges](/merges)
- [Primary keys/indexes](/primary-indexes)
- [How ClickHouse stores data: parts and granules](/guides/best-practices/sparse-primary-indexes) - 更高级的指南，详细介绍 ClickHouse 中数据的组织和查询方式，涵盖 granules 和主键的细节。
- [MergeTree](/engines/table-engines/mergetree-family/mergetree) - 高级 MergeTree 参考指南，对命令和内部细节很有帮助。

如下所述的所有优化都可以使用标准 ClickHouse SQL 直接应用到底层表，可以通过 [ClickHouse Cloud SQL console](/integrations/sql-clients/sql-console) 或 [ClickHouse client](/interfaces/cli) 来执行。

## 优化 1. 物化经常被查询的属性 \{#materialize-frequently-queried-attributes\}

对 ClickStack 用户来说，首要且最简单的优化，是在 `LogAttributes`、`ScopeAttributes` 和 `ResourceAttributes` 中识别常被查询的属性，并使用物化列将它们提升为顶层列。

仅凭这一项优化，通常就足以将 ClickStack 部署扩展到每天数十 TB 级的数据量，并且应在考虑更高级的调优技术之前优先采用。

### 为什么要物化属性 \{#why-materialize-attributes\}

ClickStack 将 Kubernetes label、服务元数据以及自定义属性等元数据存储在 `Map(String, String)` 列中。虽然这种方式非常灵活，但对 Map 子键进行查询会带来显著的性能开销。

当从一个 Map 列中查询单个 key 时，ClickHouse 必须从磁盘读取整个 Map 列。如果 Map 中包含大量 key，相比读取独立列，这会导致不必要的 I/O 开销并使查询变慢。

通过在写入时提取值并将其存储为独立列，物化经常访问的属性可以避免这部分开销。

物化列：

- 在 INSERT 时自动计算
- 不能在 INSERT 语句中显式设置
- 支持任意 ClickHouse 表达式
- 允许将 String 转换为更高效的数值或日期类型
- 支持 skip 索引和主键的使用
- 通过避免对整个 Map 的访问来减少磁盘读取

:::note
ClickStack 会自动检测从 Map 中提取的物化列，并在查询执行期间透明地使用它们，即使用户仍然查询原始属性路径。
:::

### 示例 \{#materialize-column-example\}

以 ClickStack 中 traces 的默认 schema 为例，其中 Kubernetes 元数据存储在 `ResourceAttributes` 中：

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

用户可以使用 Lucene 语法来过滤 trace，例如：`ResourceAttributes.k8s.pod.name:"checkout-675775c4cc-f2p9c"`：

<Image img={trace_filtering} size="lg" alt="Trace filtering" />

这将得到一个类似于如下的 SQL 谓词：

```sql
ResourceAttributes['k8s.pod.name'] = 'checkout-675775c4cc-f2p9c'
```

由于这是在访问一个 Map 键，ClickHouse 必须为每一条匹配的行读取完整的 `ResourceAttributes` 列——如果该 Map 包含很多键，这一列可能会非常大。

如果这个属性被频繁查询，就应该将其物化为一个顶层列。

要在插入时提取 pod（容器组）名称，请添加一个物化列：

```sql
ALTER TABLE otel_v2.otel_traces
ADD COLUMN PodName String
MATERIALIZED ResourceAttributes['k8s.pod.name']
```

从此之后，**新** 写入的数据会将 Pod 名称作为独立的列 `PodName` 进行存储。

用户现在可以使用 Lucene 语法高效地按 pod（容器组）名称进行查询，例如：`PodName:"checkout-675775c4cc-f2p9c"`

<Image img={trace_filtering_v2} size="lg" alt="Trace filtering v2" />

对于新插入的数据，这完全避免了对 map 的访问，并显著减少了 I/O 开销。


但是，即使用户仍然通过原始属性路径发起查询，例如 `ResourceAttributes.k8s.pod.name:"checkout-675775c4cc-f2p9c"`，**ClickStack 也会在内部自动重写查询**，改为使用物化后的 `PodName` 列，即使用如下谓词：

```sql
PodName = 'checkout-675775c4cc-f2p9c'
```

这样，用户无需更改仪表板、告警或已保存的查询就能从该优化中获益。

:::note
默认情况下，物化列不会包含在 `SELECT *` 查询的结果中。这样可以保持一个不变式：查询结果始终可以重新插入到表中。
:::


### 物化历史数据 \{#materializing-historical-data\}

物化列只会自动应用于在该列创建之后插入的数据。对于已有数据，对物化列的查询会透明地回退为从原始 map 中读取。

如果对历史数据的查询性能也很关键，可以通过 mutation 对该列进行回填，例如：

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE COLUMN PodName
```

这会重写现有的[分区片段](/parts)，以填充该列。变更在每个分区片段上以单线程执行，在大型数据集上可能需要较长时间。为降低影响，可以将变更限定到特定分区：

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE COLUMN PodName
IN PARTITION '2026-01-02'
```

可以使用 `system.mutations` 表来监控变更进度，例如：

```sql
SELECT *
FROM system.mutations
WHERE database = 'otel'
  AND table = 'otel_traces'
ORDER BY create_time DESC;
```

等待相应 mutation 的 `is_done` 变为 `1`。

:::important
Mutation 会带来额外的 IO 和 CPU 开销，应尽量少用。在许多情况下，只需让旧数据自然过期淘汰，并依赖新摄取数据带来的性能提升就已足够。
:::


## 优化 2. 添加数据跳过索引 \{#adding-skip-indices\}

在将常用查询中涉及的属性物化之后，下一步的优化是添加数据跳过索引，以进一步减少 ClickHouse 在查询执行过程中需要读取的数据量。

数据跳过索引可以让 ClickHouse 在确定不存在匹配值时避免扫描整个数据块。与传统的二级索引不同，数据跳过索引在 granule（粒度）级别工作，并且在查询过滤条件可以排除数据集中大部分数据时最为有效。如果使用得当，它们可以在不改变查询语义的情况下，大幅加速对高基数属性的过滤。

考虑 ClickStack 的默认 traces 架构，其中包含数据跳过索引：

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

这些索引侧重于两种常见模式：

* 高基数字符串过滤，例如 TraceId、会话标识符、属性键或属性值
* 数值范围过滤，例如 span 持续时间


### Bloom 过滤器 \{#bloom-filters\}

Bloom 过滤器索引是 ClickStack 中最常用的 skip 索引类型。这类索引非常适合高基数的字符串列，通常至少包含数万种不同的取值。将误报率设置为 0.01、粒度为 1 是一个不错的默认起点，在存储开销和有效数据剪枝之间取得了平衡。

延续优化 1 中的示例，假设 Kubernetes pod（容器组）名称已经从 ResourceAttributes 中物化出来：

```sql
ALTER TABLE otel_traces
ADD COLUMN PodName String
MATERIALIZED ResourceAttributes['k8s.pod.name']
```

然后可以添加 Bloom filter 跳过索引，以加速该列上的过滤操作：

```sql
ALTER TABLE otel_traces
ADD INDEX idx_pod_name PodName
TYPE bloom_filter(0.01)
GRANULARITY 1
```

添加后，必须对 skip index 进行物化 —— 参见 [&quot;Materialize skip index.&quot;](#materialize-skip-index)

创建并物化后，ClickHouse 可以跳过所有已经确定不包含所请求 pod（容器组）名称的 granule，从而在诸如 `PodName:"checkout-675775c4cc-f2p9c"` 之类的查询中，有望减少读取的数据量。

当值的分布使得某个给定值只出现在相对较少数量的分区片段中时，Bloom filter 的效果最佳。这在可观测性工作负载中经常自然发生，此类场景下，诸如 pod（容器组）名称、trace ID 或会话标识符等元数据会与时间相关联，因此会根据表的排序键进行聚簇。

与所有 skip index 一样，Bloom filter 应该有选择性地添加，并根据实际查询模式进行验证，以确保其带来可度量的收益 —— 参见 [&quot;Evaluating skip index effectiveness.&quot;](#evaluating-skip-index-effectiveness)


### Min-max 索引 \{#min-max-indices\}

Min-max 索引按每个 granule 存储最小值和最大值，开销极低。它们对数值列和范围查询尤其有效。尽管并不能加速所有查询，但成本很低，对数值字段几乎总是值得添加。

当数值要么天然有序、要么在每个 part 内被限制在较窄范围时，Min-max 索引效果最佳。

假设经常根据 Kafka 偏移量从 `SpanAttributes` 中进行查询：

```sql
SpanAttributes['messaging.kafka.offset']
```

该值可以物化后再转换为数值类型：

```sql
ALTER TABLE otel_traces
ADD COLUMN KafkaOffset UInt64
MATERIALIZED toUInt64(SpanAttributes['messaging.kafka.offset'])
```

然后可以添加一个 minmax 索引：

```sql
ALTER TABLE otel_traces
ADD INDEX idx_kafka_offset KafkaOffset TYPE minmax GRANULARITY 1
```

这使得 ClickHouse 在按 Kafka offset 范围进行过滤时可以高效跳过分区片段，例如在调试消费滞后或消息重放行为时。

同样，必须先对该索引进行[物化](#materialize-skip-index)，之后它才会可用。


### 物化 skip 索引 \{#materialize-skip-index\}

添加 skip 索引之后，它仅适用于新摄取的数据。历史数据在显式物化之前无法从该索引中获益。

如果你已经添加了一个 skip 索引，例如：

```sql
ALTER TABLE otel_traces ADD INDEX idx_kafka_offset KafkaOffset TYPE minmax GRANULARITY 1;
```

你必须显式地为现有数据构建索引：

```sql
ALTER TABLE otel_traces MATERIALIZE INDEX idx_kafka_offset;
```

:::note[物化 skip index]
物化 skip index 通常开销较小，且运行安全，尤其是对于 minmax 索引。对于大规模数据集上的 Bloom filter 索引，用户可能更倾向于按分区物化，以便更好地控制资源使用，例如：

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE INDEX idx_kafka_offset
IN PARTITION '2026-01-02';
```

:::

物化跳过索引会作为一次 mutation 执行，其执行进度可以通过 system 表进行监控。

```sql

SELECT *
FROM system.mutations
WHERE database = 'otel'
  AND table = 'otel_traces'
ORDER BY create_time DESC;
```

等待对应变更的 `is_done` 变为 1。

完成后，确认索引数据已经创建：

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

需要注意，跳过索引的大小会直接影响查询性能。非常大的跳过索引（数量级在数十或数百 GB）在查询执行期间评估可能会花费显著时间，从而降低甚至抵消其带来的性能收益。

在实际使用中，minmax 索引通常非常小且评估开销低，因此几乎总是可以安全地物化。另一方面，Bloom 过滤器索引的大小会根据基数、粒度以及假阳性概率显著增长。

通过提高允许的假阳性率可以减小 Bloom 过滤器的大小。例如，将 probability 参数从 `0.01` 增加到 `0.05`，会得到一个更小、评估更快的索引，但代价是剪枝不那么激进。尽管被跳过的粒度单元（granule）可能减少，但由于索引评估更快，整体查询延迟仍有可能降低。

因此，调优 Bloom 过滤器参数是一种依赖于具体工作负载的优化，应结合真实的查询模式和接近生产环境的数据量进行验证。

有关数据跳过索引的更多细节，请参阅指南 [“Understanding ClickHouse data skipping indexes.”](/optimize/skipping-indexes/examples)


### 评估跳过索引的有效性 \{#evaluating-skip-index-effectiveness\}

评估跳过索引剪枝效果最可靠的方法是使用 `EXPLAIN indexes = 1`，它会显示在查询规划的每个阶段被消除的 [parts](/parts) 和 [granules](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing) 数量。大多数情况下，你希望在 Skip 阶段看到 granule 数量大幅减少，并且最好是在主键已经缩小搜索空间之后。跳过索引是在分区剪枝和主键剪枝之后进行评估的，因此最适合相对于剩余的分区片段和 granule 来衡量其影响。

`EXPLAIN` 可以确认是否发生了剪枝，但它并不保证一定能带来净性能提升。跳过索引本身也有评估成本，尤其是在索引较大的情况下。在添加并物化一个索引之前和之后，一定要对查询进行基准测试，以确认实际的性能提升。

例如，考虑默认 Traces schema 中为 TraceId 字段提供的默认 Bloom filter 跳过索引：

```sql
INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1
```

你可以使用 `EXPLAIN indexes = 1` 来查看它在处理高选择性查询时的效果：

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

在这种情况下，主键过滤首先大幅缩小了数据集（从 35898 个数据块减少到 255 个），然后 Bloom 过滤器进一步将其缩减到单个数据块（1/255）。这就是 skip 索引的理想模式：先通过主键剪枝来缩小搜索范围，再由 skip 索引剔除剩余数据中的大部分。

要验证实际影响，请在稳定的配置下对查询进行基准测试并比较执行时间。使用 `FORMAT Null` 以避免结果序列化开销，并禁用查询条件缓存，以保持多次运行结果的可重复性：

```sql
SELECT *
FROM otel_traces
WHERE (ServiceName = 'accountingservice') AND (TraceId = '4512e822ca3c0c68bbf5d4a263f9943d')
SETTINGS use_query_condition_cache = 0

2 rows in set. Elapsed: 0.025 sec. Processed 8.52 thousand rows, 299.78 KB (341.22 thousand rows/s., 12.00 MB/s.)
Peak memory usage: 41.97 MiB.
```

现在在禁用 skip 索引的情况下，再运行一次相同的查询：

```sql
SELECT *
FROM otel_traces
WHERE (ServiceName = 'accountingservice') AND (TraceId = '4512e822ca3c0c68bbf5d4a263f9943d')
FORMAT Null
SETTINGS use_query_condition_cache = 0, use_skip_indexes = 0;

0 rows in set. Elapsed: 0.702 sec. Processed 1.62 million rows, 56.62 MB (2.31 million rows/s., 80.71 MB/s.)
Peak memory usage: 198.39 MiB.
```

关闭 `use_query_condition_cache` 可确保查询结果不受缓存过滤决策的影响，而设置 `use_skip_indexes = 0` 则为对比提供一个干净的基线。如果剪枝有效且索引评估成本较低，那么带索引的查询应当会明显更快，就像上面的示例那样。

:::tip
如果 `EXPLAIN` 显示 granule 剪枝很少，或者 skip 索引非常庞大，那么评估索引的开销可能会抵消所有收益。使用 `EXPLAIN indexes = 1` 来确认剪枝情况，然后通过基准测试来验证端到端的性能改善。
:::


### 何时添加跳过索引 \{#when-to-add-skip-indexes\}

应有选择性地添加跳过索引，依据用户最常使用的过滤条件类型，以及数据在分区片段和颗粒中的分布形态。目标是在剪枝掉足够多的颗粒的同时，抵消评估索引本身的开销，这也是为什么必须在类似生产环境的数据上进行基准测试。

**对于用于过滤条件的数值列，`minmax` 跳过索引几乎总是一个不错的选择。** 它轻量、评估成本低，并且对范围谓词通常很有效——尤其是在值大致有序，或在分区片段内部被限制在较窄范围时。即使 `minmax` 对某个特定的查询模式没有帮助，其开销通常也足够低，仍然值得保留。

**字符串列：当基数很高且值比较稀疏时，请使用 Bloom 过滤器。**

Bloom 过滤器在高基数字符串列上最为有效，此时每个值的出现频率相对较低，也就是说大多数分区片段和颗粒都不包含被搜索的值。作为经验法则，当列至少有 10,000 个不同值时，Bloom 过滤器就开始变得有前景，而在具有 100,000+ 不同值时往往表现最佳。当匹配值聚集在少量连续分区片段中时，它们也更有效，这通常发生在该列与排序键存在关联的情况下。同样，实际效果可能有所差异——真实环境中的测试是必不可少的。

## 优化 3. 修改主键 \{#modifying-the-primary-key\}

对于大多数工作负载而言，主键是 ClickHouse 性能调优中最重要的组件之一。要有效地对其进行调优，必须理解它的工作原理以及它与查询模式的交互方式。最终，主键应与用户访问数据的方式保持一致，尤其是最常被用于过滤的列。

虽然主键也会影响压缩和存储布局，但其首要目的仍然是提升查询性能。在 ClickStack 中，开箱即用的主键已经针对最常见的可观测性访问模式以及高压缩率进行了优化。日志、追踪和指标表的默认键旨在为典型工作流提供良好性能。

在主键中越靠前的列上进行过滤，比在越靠后的列上进行过滤更高效。尽管默认配置对大多数用户来说已经足够，但在某些情况下，为特定工作负载修改主键可以进一步提升性能。

:::note[关于术语的说明]
在本文档中，“ordering key（排序键）”一词与“primary key（主键）”交替使用。严格来讲，这两者在 ClickHouse 中是不同的，但在 ClickStack 中，它们通常都指表中 `ORDER BY` 子句中指定的相同列。详情请参阅 [ClickHouse 文档](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key)中关于如何选择与排序键不同的主键的说明。
:::

在修改任何主键之前，我们强烈建议先阅读这篇关于[理解 ClickHouse 中主索引工作原理的指南](/primary-indexes)：

主键调优与具体表和数据类型密切相关。对某个表和某种数据类型有益的变更，可能并不适用于其他情况。目标始终是针对特定数据类型进行优化，例如日志。

**通常只需对日志和追踪表进行优化。很少需要对其他数据类型进行主键更改。**

下面是 ClickStack 中日志和指标表的默认主键。

- 日志（[`otel_logs`](/use-cases/observability/clickstack/ingesting-data/schemas#logs)） - `(ServiceName, TimestampTime, Timestamp)`
- 追踪（['otel_traces](/use-cases/observability/clickstack/ingesting-data/schemas#traces)） - `(ServiceName, SpanName, toDateTime(Timestamp))`

有关其他数据类型表所使用主键的信息，请参阅「[ClickStack 使用的表和 schema](/use-cases/observability/clickstack/ingesting-data/schemas)」。例如，追踪表针对按服务名和 span 名称进行过滤进行了优化，其次是按时间戳和 trace ID。相反，日志表则优化为先按服务名过滤，然后按日期，再按时间戳过滤。尽管最优的情况是用户按照主键顺序应用过滤条件，但即便以任意顺序对这些列进行过滤，查询仍将显著受益，因为 ClickHouse 会在读取之前[裁剪数据](/optimize/skipping-indexes)。

在选择主键时，对于列的最优排序还有其他需要考虑的因素。参见「[选择主键](#choosing-a-primary-key)」。

**主键应针对每张表独立修改。对日志合理的设置，未必适用于追踪或指标。**

### 选择主键 \{#choosing-a-primary-key\}

首先，确定你的访问模式是否与特定表的默认设置有明显差异。比如，如果你最常见的日志过滤方式是先按 Kubernetes 节点再按服务名，并且这是占主导的工作流，那么就可能有理由修改主键。

:::note[修改默认主键]
默认主键在大多数情况下已经足够。只有在清楚理解查询模式的前提下，才应谨慎进行修改。修改主键可能会降低其他工作流的性能，因此测试至关重要。
:::

在提取出你期望使用的列之后，就可以开始优化你的排序键/主键。

可以应用一些简单规则来帮助选择排序键。下面这些规则有时可能互相冲突，因此请按顺序考虑。目标是通过这一过程最多选择 4–5 个键：

1. 选择与你的常见过滤条件和访问模式对齐的列。如果你通常在可观测性排障中是从按某个特定列（例如 pod 名称）过滤开始，那么该列会在 `WHERE` 子句中经常使用。优先把这些列包括进键中，而不是那些使用频率较低的列。
2. 优先选择在过滤时能排除掉总行数中很大比例的列，从而减少需要读取的数据量。服务名和状态码通常是不错的候选——对状态码而言，只有在你按能排除大多数行的值过滤时才是如此；比如按 200 过滤在大多数系统中会匹配大部分行，而 500 错误通常只对应一个较小子集。
3. 优先选择很可能与表中其他列高度关联的列。这将有助于确保这些值也被连续存储，从而提升压缩率。
4. 对排序键中的列进行 `GROUP BY`（用于图表聚合）和 `ORDER BY`（排序）操作时，可以更节省内存。

在确定排序键所用列的子集之后，还必须以特定顺序声明这些列。这个顺序会显著影响查询中过滤排序键中后续列的效率，以及表数据文件的压缩比。通常，最好按基数从低到高对键排序。同时需要权衡的是，对排序键中排在后面的列进行过滤会比对排在前面的列过滤效率更低。要在这些行为之间取得平衡，并结合你的访问模式来考虑。最重要的是，对不同变体进行测试。若想进一步理解排序键以及如何优化它们，推荐阅读[Choosing a Primary Key](/best-practices/choosing-a-primary-key)。如需对主键调优和内部数据结构获得更深入的见解，请参阅[A practical introduction to primary indexes in ClickHouse](/guides/best-practices/sparse-primary-indexes)。

### 更改主键 \{#changing-the-primary-key\}

如果在数据摄取之前已经比较确定访问模式，只需针对相关数据类型删除并重新创建表即可。

下面的示例展示了一种简单方式：在沿用现有 schema 的基础上创建一个新的日志表，但使用一个新的主键，在 `ServiceName` 之前增加列 `SeverityText`。

<VerticalStepper headerLevel="h4">

#### 创建新表 \{#create-new-table-with-key\}

```sql
CREATE TABLE otel_logs_temp AS otel_logs
PRIMARY KEY (SeverityText, ServiceName, TimestampTime)
ORDER BY (SeverityText, ServiceName, TimestampTime)
```

:::note 排序键 vs 主键
注意在上述示例中，必须同时指定 `PRIMARY KEY` 和 `ORDER BY`。
在 ClickStack 中，它们几乎总是相同的。
`ORDER BY` 控制物理数据布局，而 `PRIMARY KEY` 定义稀疏索引。
在极少数、规模非常大的工作负载中，它们可能会不同，但大多数用户应保持二者一致。
:::

#### 交换并删除表 \{#exhange-and-drop-table\}

`EXCHANGE` 语句用于[原子地](/concepts/glossary#atomicity)交换两个表的名称。临时表（此时已变为旧的默认表）可以被删除。

```sql
EXCHANGE TABLES otel_logs_temp AND otel_logs
DROP TABLE otel_logs_temp
```

</VerticalStepper>

但是，**无法在现有表上直接修改主键**。更改主键需要创建一个新表。

可以使用以下流程来确保旧数据仍可保留并被透明查询（如果需要，在 HyperDX 中仍然使用其现有键），同时通过一个针对用户访问模式优化的新表对外暴露新数据。此方法确保无需修改摄取流水线，数据依然写入默认表名，对用户完全透明。

:::note
在大规模场景下，将现有数据回填到新表通常得不偿失。计算和 IO 成本通常很高，往往不足以抵消性能收益。更好的做法是让旧数据通过[生存时间 (TTL)](/use-cases/observability/clickstack/ttl) 自动过期，而让新数据受益于改进后的键。
:::

<VerticalStepper headerLevel="h4">

下面继续使用相同示例，即将 `SeverityText` 作为主键中的第一列。在这种情况下，为新数据创建一个表，并保留旧表用于历史分析。

#### 创建新表 \{#create-new-table-with-key-2\}

使用所需的主键创建新表。注意 `_23_01_2025` 后缀 —— 将其替换为当前日期，例如：

```sql
CREATE TABLE otel_logs_23_01_2025 AS otel_logs
PRIMARY KEY (SeverityText, ServiceName, TimestampTime)
ORDER BY (SeverityText, ServiceName, TimestampTime)
```

#### 创建 Merge 表 \{#create-merge-table\}

[Merge 引擎](/engines/table-engines/special/merge)（不要与 MergeTree 混淆）本身不存储数据，而是允许同时从任意数量的其他表中读取数据。

```sql
CREATE TABLE otel_logs_merge
AS otel_logs
ENGINE = Merge(currentDatabase(), 'otel_logs*')
```

:::note
`currentDatabase()` 假定命令在正确的数据库中执行。否则，请显式指定数据库名称。
:::

现在可以查询此表，以确认它会返回来自 `otel_logs` 的数据。

#### 更新 HyperDX 以从 Merge 表读取 \{#update-hyperdx-to-read-from-merge-tree\}

将 HyperDX 配置为使用 `otel_logs_merge` 作为日志数据源所使用的表。

<Image img={select_merge_table} size="lg" alt="Select Merge Table"/>

此时，写入仍然发送到使用原始主键的 `otel_logs`，而读取则通过 Merge 表完成。对用户没有可见变化，对摄取也没有影响。

#### 交换表 \{#exchange-the-tables\}

现在使用 `EXCHANGE` 语句，原子性地交换 `otel_logs` 和 `otel_logs_23_01_2025` 两个表的名称。

```sql
EXCHANGE TABLES otel_logs AND otel_logs_23_01_2025
```

此后，写入会进入具有更新后主键的新 `otel_logs` 表。现有数据保留在 `otel_logs_23_01_2025` 中，并且仍可通过 Merge 表访问。该后缀表明变更应用的日期，也代表该表中包含的最新时间戳。

此过程可以在不打断摄取且对用户无可见影响的情况下完成主键更改。

</VerticalStepper>

该流程在后续需要再次修改主键时同样适用。比如，一周之后你可能会决定应当将 `SeverityNumber` 而不是 `SeverityText` 作为主键的一部分。只要需要调整主键，就可以按需多次重复并改造下面的流程。

<VerticalStepper headerLevel="h4">

#### Create new table \{#create-new-table-with-key-3\}

使用所需的主键创建新表。
在下面的示例中，`30_01_2025` 被用作后缀来表示该表的日期，例如：

```sql
CREATE TABLE otel_logs_30_01_2025 AS otel_logs
PRIMARY KEY (SeverityNumber, ServiceName, TimestampTime)
ORDER BY (SeverityNumber, ServiceName, TimestampTime)
```

#### Exchange the tables \{#exchange-the-tables-v2\}

现在使用 `EXCHANGE` 语句以原子方式交换 `otel_logs` 和 `otel_logs_30_01_2025` 两个表的名称。

```sql
EXCHANGE TABLES otel_logs AND otel_logs_30_01_2025
```

此时写入将进入新的、具有更新后主键的 `otel_logs` 表。旧数据保留在 `otel_logs_30_01_2025` 中，可通过 merge 表进行访问。

</VerticalStepper>

:::note 冗余表
如果已配置生存时间 (TTL) 策略（推荐这样做），那么使用旧主键且不再接收写入的表会随着数据过期逐渐被清空。应对这些表进行监控，在其不再包含任何数据时定期清理。目前，这个清理过程是手动完成的。
:::

## 优化 4. 利用 Materialized View \{#exploting-materialied-views\}

<BetaBadge/>

ClickStack 可以利用 [增量materialized view](/materialized-view/incremental-materialized-view) 来加速依赖大量聚合查询的可视化，例如按时间维度计算每分钟的平均请求时长。此功能可以显著提升查询性能，通常对规模较大的部署（例如每天约 10 TB 及以上）最为有利，同时支持扩展到每天 PB 级的数据量。增量materialized view 目前处于 Beta 阶段，应谨慎使用。

有关在 ClickStack 中使用此功能的详细信息，请参阅我们的专门指南 ["ClickStack - Materialized Views."](/use-cases/observability/clickstack/materialized_views)

## 优化 5：利用 PROJECTION \{#exploting-projections\}

PROJECTION 是一种最终的高级优化手段，通常在你已经评估完物化列、skip 索引、主键和 materialized view 之后再考虑使用。虽然 PROJECTION 和 materialized view 在表面上看起来相似，但在 ClickStack 中，它们承担着不同的角色，并且各自适用于不同的使用场景。

<iframe width="560" height="315" src="https://www.youtube.com/embed/6CdnUdZSEG0?si=1zUyrP-tCvn9tXse" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

在实践中，**可以把 PROJECTION 看作是表的一个额外的、隐藏的副本**，它以**不同的物理顺序**存储相同的行。这使得该 PROJECTION 拥有独立于基础表 `ORDER BY` 键之外的主索引，从而使 ClickHouse 能够在访问模式与原始排序不一致时，更有效地进行数据剪枝。

Materialized view 则可以通过显式地将行写入一个具有不同排序键的目标表，达到类似的效果。关键区别在于，**PROJECTION 由 ClickHouse 自动且透明地维护**，而 materialized view 是显式的表，必须由 ClickStack 明确注册并在查询时有意识地选择和使用。

当查询目标是基础表时，ClickHouse 会评估基础表布局及所有可用的 PROJECTION，采样它们的主索引，并选择在读取最少 granule 的前提下仍能产生正确结果的布局。该决策由查询分析器自动完成。

在 ClickStack 中，PROJECTION 因此最适合用于**纯数据重排**，适用场景包括：

- 访问模式与默认主键存在根本性差异
- 无法用单一排序键覆盖所有工作流
- 希望由 ClickHouse 以透明方式选择最优物理布局

对于预聚合和指标加速，ClickStack 强烈推荐使用**显式的 materialized view**，从而让应用层可以对视图的选择与使用保持完全控制。

如需更多背景信息，请参阅：

- [PROJECTION 指南](/data-modeling/projections)
- [何时使用 PROJECTION](/data-modeling/projections#when-to-use-projections)
- [Materialized view 与 PROJECTION 的对比](/managing-data/materialized-views-versus-projections)

### 示例 PROJECTION \{#example-projections\}

假设你的 traces 表已经针对 ClickStack 的默认访问模式进行了优化：

```sql
ORDER BY (ServiceName, SpanName, toDateTime(Timestamp))
```

如果你的主要工作流之一是按 TraceId 进行筛选（或者经常围绕 TraceId 进行分组和筛选），可以添加一个 PROJECTION，用于按 TraceId 和时间排序存储行：

```sql
ALTER TABLE otel_v2.otel_traces
ADD PROJECTION prj_traceid_time
(
    SELECT *
    ORDER BY (TraceId, toDateTime(Timestamp))
);
```

:::note 使用通配符
在上面的示例 projection 中，使用了通配符（`SELECT *`）。虽然只选择部分列可以减少写入开销，但这也会限制 projection 的使用场景，因为只有完全由这些列满足的查询才可以使用该 projection。在 ClickStack 中，这通常会将 projection 的使用局限在非常狭窄的少数场景中。因此，一般推荐使用通配符，以最大化适用性。
:::

与其他数据布局变更一样，projection 只会影响新写入的分区片段。要为已有数据构建它，请将其物化：

```sql
ALTER TABLE otel_v2.otel_traces
MATERIALIZE PROJECTION prj_traceid_time;
```

:::note
物化一个 projection 可能需要很长时间并消耗大量资源。由于可观测性数据通常会通过生存时间 (TTL) 过期，只有在绝对必要时才应这样做。在大多数情况下，让 projection 仅应用于新摄取的数据就足够了，这样可以优化最常被查询的时间范围，例如最近 24 小时。
:::

当 ClickHouse 判断使用某个 projection 需要扫描的 granule 少于使用基础表布局时，可能会自动选择该 projection。当 projection 表示对完整行数据集（`SELECT *`）的简单重排，并且查询过滤条件与该 projection 的 `ORDER BY` 高度对齐时，projection 的效果最可靠。

对 TraceId 进行过滤（尤其是等值过滤）并包含时间范围的查询，将能从上述 projection 中获益。例如：

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

对于不约束 `TraceId`，或主要在 projection 排序键中非前置的其他维度上进行过滤的查询，通常收益不大（并且可能会退回为通过基础布局进行读取）。

:::note
Projection 也可以存储聚合（类似于 materialized view）。在 ClickStack 中，一般不推荐使用基于 projection 的聚合，因为具体选用哪个 projection 取决于 ClickHouse 分析器，其行为更难以控制和理解。相较之下，更推荐使用显式的 materialized view，这样 ClickStack 可以在应用层有意识地注册并有选择地使用它们。
:::

在实践中，projection 最适合用于你经常需要从更宽泛的搜索频繁切换到以 trace 为中心的下钻分析的工作流（例如，获取某个特定 TraceId 的所有 span）。


### 成本与指导 \{#projection-costs-and-guidance\}

- **插入开销**：采用不同排序键的 `SELECT *` projection 实际上相当于将数据写入两遍，这会增加写入 I/O，并可能需要额外的 CPU 和磁盘吞吐量来维持摄取。
- **谨慎使用**：Projections 最适合用于访问模式确实存在明显差异的场景，此时第二种物理排序可以为大量查询带来有意义的数据剪枝效果，例如两个团队以截然不同的方式查询同一数据集。
- **通过基准测试验证**：与所有调优一样，在添加并物化 projection 之前和之后，应对比真实查询延迟和资源使用情况。

如需更深入的背景，请参阅：

- [ClickHouse projections 指南](/data-modeling/projections#when-to-use-projections)
- [materialized views 与 projections 的比较](/managing-data/materialized-views-versus-projections)

### 使用 `_part_offset` 的轻量级 Projection \{#lightweight-projections\}

<BetaBadge/>

:::note[用于 ClickStack 的轻量级 Projection 处于 Beta 阶段]
基于 `_part_offset` 的轻量级 Projection 暂不推荐用于 ClickStack 工作负载。尽管它们可以减少存储和写入 I/O，但会在查询时引入更多随机读取，其在可观测性规模下的生产环境行为仍在评估中。随着该特性逐渐成熟并且我们获得更多运维数据，此建议可能会发生变化。
:::

较新的 ClickHouse 版本还支持更轻量级的 Projection，它们仅存储 Projection 排序键以及指向基础表的 `_part_offset` 指针，而不是复制完整行。这可以大幅降低存储开销，且最近的改进支持在 granule 级别进行剪枝，使其行为更像真正的二级索引。参见：

- [使用 _part_offset 的更智能存储](/data-modeling/projections#smarter_storage_with_part_offset)
- [博客说明和示例](https://clickhouse.com/blog/projections-secondary-indices#example-combining-multiple-projection-indexes)

### 替代方案 \{#projection-alternatives\}

如果需要多个排序键，PROJECTION 并不是唯一的选项。根据运维约束以及希望 ClickStack 如何路由查询，可以考虑：

- 配置 OpenTelemetry collector，将数据写入两个具有不同 `ORDER BY` 键的表，并为每个表分别创建 ClickStack source。
- 将 materialized view 用作复制（copy）管道，即将一个 materialized view 附加到主表上，从主表中选取原始行并写入到一个具有不同排序键的次级表中（这是一种反规范化或路由模式）。为该目标表创建一个 source。示例可在[这里](/materialized-view/incremental-materialized-view#filtering-and-transformation)找到。