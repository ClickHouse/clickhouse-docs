---
'description': 'System table containing history of metrics values from tables `system.metrics`
  and `system.events`, periodically flushed to disk.'
'keywords':
- 'system table'
- 'metric_log'
'slug': '/operations/system-tables/metric_log'
'title': 'system.metric_log'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.metric_log

<SystemTableCloud/>

包含来自 `system.metrics` 和 `system.events` 表的指标值历史记录，定期刷新到磁盘。

列:
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件时间。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 事件时间，精确到微秒。

**示例**

```sql
SELECT * FROM system.metric_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:                                                        clickhouse.eu-central1.internal
event_date:                                                      2020-09-05
event_time:                                                      2020-09-05 16:22:33
event_time_microseconds:                                         2020-09-05 16:22:33.196807
milliseconds:                                                    196
ProfileEvent_Query:                                              0
ProfileEvent_SelectQuery:                                        0
ProfileEvent_InsertQuery:                                        0
ProfileEvent_FailedQuery:                                        0
ProfileEvent_FailedSelectQuery:                                  0
...
...
CurrentMetric_Revision:                                          54439
CurrentMetric_VersionInteger:                                    20009001
CurrentMetric_RWLockWaitingReaders:                              0
CurrentMetric_RWLockWaitingWriters:                              0
CurrentMetric_RWLockActiveReaders:                               0
CurrentMetric_RWLockActiveWriters:                               0
CurrentMetric_GlobalThread:                                      74
CurrentMetric_GlobalThreadActive:                                26
CurrentMetric_LocalThread:                                       0
CurrentMetric_LocalThreadActive:                                 0
CurrentMetric_DistributedFilesToInsert:                          0
```

**架构**
该表可以使用 XML 标签 `<schema_type>` 配置为不同的架构类型。默认架构类型为 `wide`，每个指标或配置事件作为单独的列存储。该架构对于单列读取是性能最佳和效率最高的。

`transposed` 架构以类似于 `system.asynchronous_metric_log` 的格式存储数据，其中指标和事件作为行存储。该架构对于资源使用较低的设置非常有用，因为它在合并期间减少了资源消耗。

还有一个兼容性架构 `transposed_with_wide_view`，它使用转置架构（`system.transposed_metric_log`）在表中存储实际数据，并在其上使用宽架构创建视图。此视图查询转置表，因此在从 `wide` 架构迁移到 `transposed` 架构时非常有用。

**另见**

- [metric_log 设置](../../operations/server-configuration-parameters/settings.md#metric_log) — 启用和禁用该设置。
- [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md) — 包含定期计算的指标。
- [system.events](/operations/system-tables/events) — 包含发生的一些事件。
- [system.metrics](../../operations/system-tables/metrics.md) — 包含即时计算的指标。
- [监控](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
