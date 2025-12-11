---
slug: /use-cases/observability/clickstack/ttl
title: '管理 TTL'
sidebar_label: '管理 TTL'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 管理 TTL'
doc_type: 'guide'
keywords: ['clickstack', 'ttl', '数据保留', '生命周期', '存储管理']
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';

## ClickStack 中的 TTL {#ttl-clickstack}

生存时间（Time-to-Live，TTL）是 ClickStack 中实现高效数据保留与管理的关键特性，尤其适用于持续产生海量数据的场景。TTL 允许对较旧数据进行自动过期和删除，在无需人工干预的情况下实现存储的最优利用并维持良好性能。这一能力对于保持数据库精简、降低存储成本，以及通过聚焦最相关和最新的数据来确保查询始终快速高效至关重要。此外，它还能通过系统化地管理数据生命周期，帮助遵循数据保留策略，从而提升整个可观测性解决方案的可持续性和可扩展性。

**默认情况下，ClickStack 会保留数据 3 天。要修改此设置，请参阅 [“修改 TTL”](#modifying-ttl)。**

在 ClickHouse 中，TTL 是在表级别进行控制的。下面以 logs 表的 schema 为例：

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
SETTINGS ttl_only_drop_parts = 1
```

在 ClickHouse 中进行分区，可以根据某一列或 SQL 表达式在磁盘上对数据进行逻辑划分。通过对数据进行逻辑分隔，每个分区都可以被独立操作，例如在其按 TTL 策略到期时将其删除。

如上述示例所示，分区是在最初定义表时通过 `PARTITION BY` 子句指定的。该子句可以包含对任意列的 SQL 表达式，其结果将决定每一行被路由到哪个分区。这样会使数据在磁盘上通过每个分区对应的公共文件夹名称前缀与该分区建立逻辑关联，从而可以单独查询各个分区。在上述示例中，默认的 `otel_logs` 模式通过表达式 `toDate(Timestamp)` 按天进行分区。随着行被插入 ClickHouse，该表达式会对每一行进行求值，并在结果对应的分区已存在时将其路由到该分区（如果该行是某一天的第一条记录，则会创建对应分区）。有关分区及其其他应用的更多详细信息，请参阅 [“Table Partitions”](/partitions)。

<Image img={observability_14} alt="Partitions" size="lg" />

表结构还包含 `TTL TimestampTime + toIntervalDay(3)` 以及设置 `ttl_only_drop_parts = 1`。前者确保数据在超过 3 天后会被删除。设置 `ttl_only_drop_parts = 1` 则保证只删除“整块”已全部过期的数据分片（而不是尝试部分删除行）。在按天分区从而确保不同日期的数据不会被“合并”的前提下，可以高效地删除这些数据。

:::important `ttl_only_drop_parts`
我们建议始终使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)。启用该设置后，当某个分片中的所有行都已过期时，ClickHouse 会直接删除整个分片。与其通过资源开销较大的 mutation（在 `ttl_only_drop_parts=0` 时执行）来对行进行部分 TTL 清理，删除整块分片的方式可以显著缩短 `merge_with_ttl_timeout` 时间，并降低对系统性能的影响。如果数据按与 TTL 过期粒度相同的单位进行分区（例如按天），那么每个分片自然只会包含该时间区间的数据，从而确保 `ttl_only_drop_parts=1` 能被高效地应用。
:::

默认情况下，当 ClickHouse [合并数据分片](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 时，会删除已过期 TTL 的数据。当 ClickHouse 检测到数据过期后，会执行一次“非计划”的合并。

:::note TTL 调度
正如上文所述，TTL 并不会立即执行，而是按一定调度周期执行。MergeTree 表设置 `merge_with_ttl_timeout` 用于设置带删除 TTL 的合并操作之间的最小重复间隔（以秒为单位）。默认值为 14400 秒（4 小时）。但这只是最小延迟；实际触发 TTL 合并可能需要更久。如果该值设置得过低，会触发大量“非计划”合并，消耗大量资源。可以通过执行命令 `ALTER TABLE my_table MATERIALIZE TTL` 强制触发一次 TTL 过期处理。
:::

## 修改 TTL {#modifying-ttl}

要修改 TTL，用户可以：

1. **修改数据表结构（schema）（推荐）**。这需要连接到 ClickHouse 实例，例如使用 [clickhouse-client](/interfaces/cli) 或 [Cloud SQL Console](/cloud/get-started/sql-console)。例如，我们可以使用以下 DDL 修改 `otel_logs` 表的 TTL：

```sql
ALTER TABLE default.otel_logs
MODIFY TTL TimestampTime + toIntervalDay(7);
```

2. **修改 OTel collector**。ClickStack OpenTelemetry collector 会在表不存在时在 ClickHouse 中创建相应的表。这是通过 ClickHouse exporter 完成的，该 exporter 提供了一个用于控制默认 TTL 表达式的 `ttl` 参数，例如：

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

### 列级 TTL {#column-level-ttl}

上述示例是在表级别设置数据过期。用户也可以在列级别设置数据过期策略。随着数据随时间推移而老化，可以借此删除那些在排障与分析中带来的价值不足以抵消其保留所需资源开销的列。例如，我们建议保留 `Body` 列，以防后续添加了在写入时尚未被提取的新动态元数据，例如新的 Kubernetes 标签。经过一段时间（例如 1 个月）后，如果明显这些附加元数据并无实际用处，那么继续保留 `Body` 列的价值就有限了。

下面展示如何在 30 天后删除 `Body` 列。

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
指定列级 TTL 时，用户需要自行定义 schema。无法在 OTel collector 中进行该配置。
:::
