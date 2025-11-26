---
slug: /use-cases/observability/clickstack/ttl
title: '管理 TTL'
sidebar_label: '管理 TTL'
pagination_prev: null
pagination_next: null
description: '借助 ClickStack 管理 TTL'
doc_type: 'guide'
keywords: ['clickstack', 'ttl', 'data retention', 'lifecycle', 'storage management']
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';


## ClickStack 中的 TTL

生存时间（Time-to-Live，TTL）是 ClickStack 中实现高效数据保留与管理的关键功能，特别适用于持续产出海量数据的场景。TTL 可以让较旧数据自动过期并被删除，确保存储资源得到最优利用，并在无需人工干预的情况下维持良好性能。此功能对于保持数据库精简、降低存储成本，以及通过聚焦最相关、最新的数据来保证查询始终快速高效至关重要。此外，它还通过系统化管理数据生命周期，有助于满足数据保留策略的合规要求，从而提升整个可观测性解决方案的可持续性和可扩展性。

**默认情况下，ClickStack 仅保留 3 天的数据。要修改此设置，请参阅 [&quot;修改 TTL&quot;](#modifying-ttl)。**

在 ClickHouse 中，TTL 是在表级别进行控制的。下面展示了日志表的示例 schema：

```sql
CREATE TABLE default.otel_logs
(
    `Timestamp` DateTime64(9) CODEC(Delta(8), ZSTD(1)),
    `TimestampTime` DateTime DEFAULT toDateTime(Timestamp),
    `TraceId` String CODEC(ZSTD(1)),
    `SpanId` String CODEC(ZSTD(1)),
    `TraceFlags` UInt8,
    `SeverityText` LowCardinality(String) CODEC(ZSTD(1)),
    `SeverityNumber` UInt8,
    `ServiceName` LowCardinality(String) CODEC(ZSTD(1)),
    `Body` String CODEC(ZSTD(1)),
    `ResourceSchemaUrl` LowCardinality(String) CODEC(ZSTD(1)),
    `ResourceAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `ScopeSchemaUrl` LowCardinality(String) CODEC(ZSTD(1)),
    `ScopeName` String CODEC(ZSTD(1)),
    `ScopeVersion` LowCardinality(String) CODEC(ZSTD(1)),
    `ScopeAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    `LogAttributes` Map(LowCardinality(String), String) CODEC(ZSTD(1)),
    INDEX idx_trace_id TraceId TYPE bloom_filter(0.001) GRANULARITY 1,
    INDEX idx_res_attr_key mapKeys(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_res_attr_value mapValues(ResourceAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_key mapKeys(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_scope_attr_value mapValues(ScopeAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_key mapKeys(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_log_attr_value mapValues(LogAttributes) TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_body Body TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 8
)
ENGINE = MergeTree
PARTITION BY toDate(TimestampTime)
PRIMARY KEY (ServiceName, TimestampTime)
ORDER BY (ServiceName, TimestampTime, Timestamp)
TTL TimestampTime + toIntervalDay(3)
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1
```

在 ClickHouse 中，分区允许根据某一列或 SQL 表达式在磁盘上对数据进行逻辑划分。通过对数据进行逻辑分离，每个分区都可以被独立操作，例如在根据 TTL 策略到期时单独删除。

如上例所示，在最初创建表时通过 `PARTITION BY` 子句指定分区。该子句可以包含针对任意列的 SQL 表达式，其结果将决定每一行被发送到哪个分区。这样会使磁盘上的数据通过与各分区对应的公共文件夹名称前缀建立逻辑关联，从而可以对每个分区进行独立查询。以上例来说，默认的 `otel_logs` 模式使用表达式 `toDate(Timestamp)` 按天进行分区。当行被插入 ClickHouse 时，该表达式会对每一行求值，并在目标分区存在时将其路由到该分区（如果该行为某一天的第一行，则会创建该分区）。关于分区及其其他用途的更多详细信息，请参见 [&quot;Table Partitions&quot;](/partitions)。

<Image img={observability_14} alt="Partitions" size="lg" />


表结构中还包含 `TTL TimestampTime + toIntervalDay(3)` 和参数设置 `ttl_only_drop_parts = 1`。前者用于确保数据在超过 3 天后会被删除。参数 `ttl_only_drop_parts = 1` 则保证只删除其中所有数据都已过期的数据分片（而不是尝试部分删除行）。结合按天分区以确保不同日期的数据不会被“合并”，即可高效地删除过期数据。 

:::important `ttl_only_drop_parts`
我们建议始终使用参数 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)。启用该参数后，当某个分片中的所有行都过期时，ClickHouse 会直接删除整个分片。相比在 `ttl_only_drop_parts=0` 时通过高开销的 mutation 对 TTL 过期的行进行部分清理，删除整片数据可以缩短 `merge_with_ttl_timeout` 的时间，并降低对系统性能的影响。如果数据采用与你执行 TTL 过期相同的粒度进行分区（例如按天分区），那么每个分片自然只会包含该时间区间内的数据，从而确保可以高效地应用 `ttl_only_drop_parts=1`。
:::

默认情况下，当 ClickHouse [合并数据分片](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 时，会删除已过 TTL 的数据。当 ClickHouse 检测到数据已过期时，会触发一次非计划内的合并。

:::note TTL 调度
如上所述，TTL 不会立即生效，而是按调度周期执行。MergeTree 表设置 `merge_with_ttl_timeout` 用于设置带删除 TTL 的合并操作之间的最小间隔时间（秒）。默认值为 14400 秒（4 小时）。但这只是最小延迟，实际触发 TTL 合并可能需要更长时间。如果该值设置得过低，系统会执行大量非计划合并，从而消耗大量资源。你可以通过命令 `ALTER TABLE my_table MATERIALIZE TTL` 强制执行一次 TTL 过期处理。
:::



## 修改 TTL

要修改 TTL，用户可以选择：

1. **修改表结构（推荐）**。这需要连接到 ClickHouse 实例，例如使用 [clickhouse-client](/interfaces/cli) 或 [Cloud SQL Console](/cloud/get-started/sql-console)。例如，我们可以使用以下 DDL 修改 `otel_logs` 表的 TTL：

```sql
ALTER TABLE default.otel_logs
MODIFY TTL TimestampTime + toIntervalDay(7);
```

2. **修改 OTel collector**。ClickStack OpenTelemetry collector 会在目标表不存在时在 ClickHouse 中创建表。这是通过 ClickHouse exporter 实现的，该 exporter 提供一个 `ttl` 参数，用于控制默认的 TTL 表达式，例如：

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

### 列级 TTL

上面的示例是在表级别设置数据过期。用户也可以在列级别设置数据过期策略。随着数据老化，可以通过这种方式删除那些在排障/分析中带来的价值不足以抵消其保留资源开销的列。例如，我们建议保留 `Body` 列，以防插入时尚未被提取的新动态元数据被加入，比如新的 Kubernetes 标签。经过一段时间，例如 1 个月后，可能会发现这些额外的元数据并无用处——此时继续保留 `Body` 列的价值就有限了。

下面展示了如何在 30 天后删除 `Body` 列。

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String TTL Timestamp + INTERVAL 30 DAY,
        `Timestamp` DateTime,
 ...
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

:::note
要在列级设置 TTL，用户必须自行定义表结构（schema）。这无法通过 OTel collector 进行配置。
:::
