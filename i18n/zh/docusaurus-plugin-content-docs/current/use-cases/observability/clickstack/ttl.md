---
slug: /use-cases/observability/clickstack/ttl
title: '管理 生存时间 (TTL)'
sidebar_label: '管理 生存时间 (TTL)'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 管理 生存时间 (TTL)'
doc_type: 'guide'
keywords: ['clickstack', 'ttl', '数据保留', '生命周期', '存储管理']
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';
import OtelLogsSchema from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ingesting-data/_snippets/_schema_otel_logs.md';

## ClickStack 中的 生存时间 (TTL) \{#ttl-clickstack\}

生存时间 (TTL) 是 ClickStack 中实现高效数据保留与管理的一项关键功能，尤其适用于持续产生海量数据的场景。生存时间 (TTL) 可自动让较旧的数据过期并将其删除，从而确保存储得到最佳利用，并在无需人工干预的情况下保持系统性能。这项能力对于保持数据库精简、降低存储成本，以及通过聚焦最相关、最新的数据来确保查询持续快速高效，至关重要。此外，它还能通过系统化管理数据生命周期，帮助满足数据保留策略方面的合规要求，从而提升整个可观测性解决方案的可持续性和可扩展性。

**默认情况下，ClickStack 会保留 3 天的数据。要修改此设置，请参见[“修改 生存时间 (TTL)”](#modifying-ttl)。**

在 ClickHouse 中，生存时间 (TTL) 在表级别控制。例如，下方展示了日志的默认 schema；当 collector 创建表时，`${TABLES_TTL}` 会被替换为已配置的保留时长 (若未修改则为 3 天) ：

<OtelLogsSchema />

在 ClickHouse 中，分区允许根据某一列或 SQL 表达式在磁盘上对数据进行逻辑划分。通过这种逻辑划分，每个分区都可以独立操作，例如在根据 生存时间 (TTL) 策略过期时被删除。

如上例所示，分区是在表初始定义时通过 `PARTITION BY` 子句指定的。该子句可以包含针对任意列的 SQL 表达式，其结果将决定某一行会被写入哪个分区。这会使数据在磁盘上与各个分区建立逻辑关联 (通过共同的文件夹名称前缀) ，从而能够单独查询。以上述示例为例，默认的 `otel_logs` schema 使用表达式 `toDate(Timestamp)` 按天分区。当行被插入 ClickHouse 时，该表达式会针对每一行进行计算，并将其路由到对应分区 (如果该行是某一天的第一行，则会创建该分区) 。有关分区及其其他用途的更多详情，请参见[“表分区”](/partitions)。

<Image img={observability_14} alt="Partitions" size="lg" />

表结构还包含 `TTL toDateTime(Timestamp) + ${TABLES_TTL}` 以及设置 `ttl_only_drop_parts = 1`。前者确保数据在超过已配置 生存时间 (TTL) 后会被删除 (默认为 3 天) 。设置 `ttl_only_drop_parts = 1` 则保证只删除“整块”已全部过期的数据分片 (而不是尝试部分删除行) 。在按天分区从而确保不同日期的数据不会被“合并”的前提下，可以高效地删除这些数据。

:::important `ttl_only_drop_parts`
我们建议始终使用设置 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)。启用该设置后，当某个分片中的所有行都已过期时，ClickHouse 会直接删除整个分片。与其通过资源开销较大的 mutation (在 `ttl_only_drop_parts=0` 时执行) 来对行进行部分 生存时间 (TTL) 清理，删除整块分片的方式可以显著缩短 `merge_with_ttl_timeout` 时间，并降低对系统性能的影响。如果数据按与 生存时间 (TTL) 过期粒度相同的单位进行分区 (例如按天) ，那么每个分片自然只会包含该时间区间的数据，从而确保 `ttl_only_drop_parts=1` 能被高效地应用。
:::

默认情况下，当 ClickHouse [合并数据分片](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage) 时，会删除已过期 生存时间 (TTL) 的数据。当 ClickHouse 检测到数据过期后，会执行一次“非计划”的合并。

:::note 生存时间 (TTL) 调度
正如上文所述，生存时间 (TTL) 并不会立即执行，而是按一定调度周期执行。MergeTree 表设置 `merge_with_ttl_timeout` 用于设置带删除 生存时间 (TTL) 的合并操作之间的最小重复间隔 (以秒为单位) 。默认值为 14400 秒 (4 小时) 。但这只是最小延迟；实际触发 生存时间 (TTL) 合并可能需要更久。如果该值设置得过低，会触发大量“非计划”合并，消耗大量资源。可以通过执行命令 `ALTER TABLE my_table MATERIALIZE TTL` 强制触发一次 生存时间 (TTL) 过期处理。
:::

## 修改 TTL \{#modifying-ttl\}

要修改 TTL，你可以：

1. **修改数据表结构 (schema)  (推荐)&#x20;**。这需要连接到 ClickHouse 实例，例如使用 [clickhouse-client](/interfaces/cli) 或 [Cloud SQL Console](/cloud/get-started/sql-console)。例如，我们可以使用以下 DDL 修改 `otel_logs` 表的 TTL：

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

### 列级 TTL \{#column-level-ttl\}

上述示例是在表级别设置数据过期。你也可以在列级别设置数据过期策略。随着数据随时间推移而老化，可以借此删除那些在排障与分析中带来的价值不足以抵消其保留所需资源开销的列。例如，我们建议保留 `Body` 列，以防后续添加了在写入时尚未被提取的新动态元数据，例如新的 Kubernetes 标签。经过一段时间 (例如 1 个月) 后，如果明显这些附加元数据并无实际用处，那么继续保留 `Body` 列的价值就有限了。

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
