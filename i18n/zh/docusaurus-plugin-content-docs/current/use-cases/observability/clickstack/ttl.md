---
slug: /use-cases/observability/clickstack/ttl
title: 'TTL 管理'
sidebar_label: 'TTL 管理'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 进行 TTL 管理'
doc_type: 'guide'
keywords: ['clickstack', 'ttl', 'data retention', 'lifecycle', 'storage management']
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';


## ClickStack 中的 TTL {#ttl-clickstack}

生存时间(TTL)是 ClickStack 中用于高效数据保留和管理的关键功能,尤其是在持续生成海量数据的情况下。TTL 允许自动过期和删除旧数据,确保存储得到最优利用,并在无需人工干预的情况下保持性能。此功能对于保持数据库精简、降低存储成本以及通过聚焦于最相关和最新的数据来确保查询保持快速高效至关重要。此外,它通过系统化地管理数据生命周期来帮助遵守数据保留策略,从而增强可观测性解决方案的整体可持续性和可扩展性。

**默认情况下,ClickStack 保留数据 3 天。要修改此设置,请参阅["修改 TTL"](#modifying-ttl)。**

TTL 在 ClickHouse 中是在表级别控制的。例如,日志的表结构如下所示:

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

ClickHouse 中的分区允许根据列或 SQL 表达式在磁盘上逻辑分离数据。通过逻辑分离数据,每个分区可以独立操作,例如根据 TTL 策略在过期时删除。

如上例所示,分区在表初始定义时通过 `PARTITION BY` 子句指定。此子句可以包含针对任何列的 SQL 表达式,其结果将决定行被发送到哪个分区。这会使数据在磁盘上通过公共文件夹名称前缀与每个分区逻辑关联,然后可以单独查询。对于上面的示例,默认的 `otel_logs` 表结构使用表达式 `toDate(Timestamp)` 按天分区。当行插入到 ClickHouse 时,此表达式将针对每一行进行计算,并路由到相应的分区(如果该分区存在)(如果该行是某一天的第一行,则会创建该分区)。有关分区及其其他应用的更多详细信息,请参阅["表分区"](/partitions)。

<Image img={observability_14} alt='Partitions' size='lg' />


表结构还包括一个 `TTL TimestampTime + toIntervalDay(3)` 设置以及 `ttl_only_drop_parts = 1`。前者确保数据在超过 3 天后会被删除。设置 `ttl_only_drop_parts = 1` 会强制仅删除其中所有数据都已过期的 part（而不是尝试部分删除行）。结合分区保证来自不同日期的数据不会被“合并”，从而可以高效地删除数据。 

:::important `ttl_only_drop_parts`
我们建议始终使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)。启用该设置后，ClickHouse 会在一个 part 中所有行都过期时删除整个 part。删除整个 part，而不是对 TTL 已过期的行进行部分清理（当 `ttl_only_drop_parts=0` 时，需要通过资源开销较大的 mutation 来实现），可以缩短 `merge_with_ttl_timeout` 的等待时间，并降低对系统性能的影响。如果数据使用与 TTL 过期相同的时间单位进行分区，例如按天分区，那么各个 part 自然只包含该时间区间内的数据。这将确保可以高效应用 `ttl_only_drop_parts=1`。
:::

默认情况下，TTL 已过期的数据会在 ClickHouse [合并数据 part](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 时被删除。当 ClickHouse 检测到数据已过期时，会执行一次非计划内的合并。

:::note TTL 调度
TTL 不是立即应用，而是按调度执行，如上所述。MergeTree 表设置 `merge_with_ttl_timeout` 用于设置在重复执行带删除 TTL 的合并前的最小延迟时间（秒）。默认值为 14400 秒（4 小时）。但这只是最小延迟；触发 TTL 合并可能需要更长时间。如果该值过低，将会执行大量非计划内的合并，可能会消耗大量资源。可以使用命令 `ALTER TABLE my_table MATERIALIZE TTL` 强制立即执行一次 TTL 过期操作。
:::



## 修改 TTL {#modifying-ttl}

要修改 TTL,用户可以采用以下任一方式:

1. **修改表结构(推荐)**。这需要连接到 ClickHouse 实例,例如使用 [clickhouse-client](/interfaces/cli) 或 [Cloud SQL Console](/cloud/get-started/sql-console)。例如,我们可以使用以下 DDL 修改 `otel_logs` 表的 TTL:

```sql
ALTER TABLE default.otel_logs
MODIFY TTL TimestampTime + toIntervalDay(7);
```

2. **修改 OTel 收集器**。ClickStack OpenTelemetry 收集器会在表不存在时在 ClickHouse 中创建表。这是通过 ClickHouse 导出器实现的,该导出器提供了一个 `ttl` 参数,用于控制默认的 TTL 表达式,例如:

```yaml
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
    ttl: 72h
```

### 列级 TTL {#column-level-ttl}

上述示例在表级别使数据过期。用户也可以在列级别使数据过期。随着数据老化,可以使用此功能删除那些在调查分析中的价值不足以证明保留它们所需资源开销的列。例如,我们建议保留 `Body` 列,以防添加了在插入时未提取的新动态元数据,例如新的 Kubernetes 标签。一段时间后,例如 1 个月,可能会明显看出这些额外的元数据并不有用——从而降低了保留 `Body` 列的价值。

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
指定列级 TTL 需要用户自行定义表结构。这无法在 OTel 收集器中指定。
:::
