---
'slug': '/use-cases/observability/clickstack/ttl'
'title': '管理生存时间 (TTL)'
'sidebar_label': '管理生存时间 (TTL)'
'pagination_prev': null
'pagination_next': null
'description': '使用 ClickStack 管理生存时间 (TTL)'
'doc_type': 'guide'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';

## TTL in ClickStack {#ttl-clickstack}

生存时间 (TTL) 是 ClickStack 中一个关键特性，旨在有效管理和保留数据，尤其是在大量数据不断生成的情况下。TTL 允许自动过期和删除旧数据，确保存储得到最佳利用，同时不需要人工干预来维持性能。这一能力对保持数据库的轻量化、降低存储成本、以及确保查询速度快且高效，因而专注于最相关和最新的数据至关重要。此外，它通过系统管理数据生命周期，有助于遵守数据保留政策，从而增强可观察解决方案的整体可持续性和可扩展性。

**默认情况下，ClickStack 会保留数据 3 天。要修改此设置，请参见 ["Modifying TTL"](#modifying-ttl)。**

在 ClickHouse 中，TTL 是在表级别控制的。例如，日志的模式如下所示：

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

ClickHouse 中的分区允许数据根据列或 SQL 表达式在磁盘上进行逻辑分离。通过逻辑分离数据，每个分区可以独立操作，例如在根据 TTL 策略过期时进行删除。

如上例所示，分区在表最初通过 `PARTITION BY` 子句定义时指定。此子句可以包含任何列的 SQL 表达式，结果将定义一行数据发送到哪个分区。这会导致数据与磁盘上每个分区通过一个共同的文件夹名称前缀逻辑关联，从而可以独立查询。对于上述示例，默认的 `otel_logs` 模式使用表达式 `toDate(Timestamp)` 按天进行分区。当行数据插入 ClickHouse 时，此表达式会对每行进行评估，并在结果分区存在时将其路由到该分区（如果该行是某天的第一行，将会创建该分区）。有关分区及其其他应用的详细信息，请参见 ["Table Partitions"](/partitions)。

<Image img={observability_14} alt="Partitions" size="lg"/>

表模式还包括 `TTL TimestampTime + toIntervalDay(3)` 和设置 `ttl_only_drop_parts = 1`。前者确保数据在超过 3 天后将被删除。设置 `ttl_only_drop_parts = 1` 强制仅删除所有数据均已过期的数据分区（而不是试图部分删除行）。通过分区确保来自不同日期的数据从未“合并”，因此可以有效地删除数据。

:::important `ttl_only_drop_parts`
我们建议始终使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)。启用此设置时，ClickHouse 会在所有行过期时删除整个分区。与部分清理 TTL 行（通过资源密集型突变实现，当 `ttl_only_drop_parts=0` 时）相比，删除整个分区允许更短的 `merge_with_ttl_timeout` 时间并降低对系统性能的影响。如果数据按您执行 TTL 过期的相同单位进行分区，比如天，分区自然只会包含来自定义时间间隔的数据。这将确保可以高效地应用 `ttl_only_drop_parts=1`。
:::

默认情况下，具有过期 TTL 的数据会在 ClickHouse [合并数据分区](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 时被移除。当 ClickHouse 检测到数据过期时，会执行一个非计划的合并。

:::note TTL schedule
TTL 不是立即应用的，而是按照计划进行，如上所述。MergeTree 表设置 `merge_with_ttl_timeout` 设置在使用删除 TTL 之前重复合并的最小延迟（以秒为单位）。默认值为 14400 秒（4 小时）。但这只是最小延迟，触发 TTL 合并可能需要更长时间。如果值设置得过低，会执行许多非计划的合并，这可能会消耗大量资源。可以使用命令 `ALTER TABLE my_table MATERIALIZE TTL` 强制执行 TTL 过期。
:::

## Modifying TTL {#modifying-ttl}

要修改 TTL，用户可以选择以下两种方式：

1. **修改表模式（推荐）**。这需要连接到 ClickHouse 实例，例如使用 [clickhouse-client](/interfaces/cli) 或 [Cloud SQL Console](/cloud/get-started/sql-console)。例如，我们可以使用以下 DDL 修改 `otel_logs` 表的 TTL：

```sql
ALTER TABLE default.otel_logs
MODIFY TTL TimestampTime + toIntervalDay(7);
```

2. **修改 OTel 收集器**。ClickStack OpenTelemetry 收集器如果表不存在则会在 ClickHouse 中创建表。这是通过 ClickHouse 导出器实现的，该导出器本身公开了一个用于控制默认 TTL 表达式的 `ttl` 参数，例如：

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

### Column level TTL {#column-level-ttl}

上述示例在表级别上过期数据。用户还可以在列级别上过期数据。随着数据的老化，可以用于删除在调查中其值不值得保留的列。例如，我们建议保留 `Body` 列，以防在插入时尚未提取新的动态元数据，例如新的 Kubernetes 标签。在一段时间后，例如 1 个月，可能会明显发现这些额外的元数据没有用处，从而限制了保留 `Body` 列的价值。

下面，我们展示了如何在 30 天后删除 `Body` 列。

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
指定列级 TTL 要求用户提供自己的模式。这不能在 OTel 收集器中指定。
:::
