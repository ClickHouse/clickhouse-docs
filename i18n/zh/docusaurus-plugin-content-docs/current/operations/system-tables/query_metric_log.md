---
'description': '系统表，包含来自表 `system.events` 的个别查询的内存和指标值的历史记录，定期刷新到磁盘。'
'keywords':
- 'system table'
- 'query_metric_log'
'slug': '/operations/system-tables/query_metric_log'
'title': 'system.query_metric_log'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_metric_log

<SystemTableCloud/>

包含来自 `system.events` 表的个别查询的内存和指标值的历史记录，定期刷新到磁盘。

一旦查询开始，数据将在 `query_metric_log_interval` 毫秒（默认设置为 1000） 的周期性间隔内收集。如果查询持续时间超过 `query_metric_log_interval`，则在查询完成时也会收集数据。

列：
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 查询的 ID。
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件时间。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 具有微秒分辨率的事件时间。

**示例**

```sql
SELECT * FROM system.query_metric_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
query_id:                                                        97c8ba04-b6d4-4bd7-b13e-6201c5c6e49d
hostname:                                                        clickhouse.eu-central1.internal
event_date:                                                      2020-09-05
event_time:                                                      2020-09-05 16:22:33
event_time_microseconds:                                         2020-09-05 16:22:33.196807
memory_usage:                                                    313434219
peak_memory_usage:                                               598951986
ProfileEvent_Query:                                              0
ProfileEvent_SelectQuery:                                        0
ProfileEvent_InsertQuery:                                        0
ProfileEvent_FailedQuery:                                        0
ProfileEvent_FailedSelectQuery:                                  0
...
```

**另请参见**

- [query_metric_log 设置](../../operations/server-configuration-parameters/settings.md#query_metric_log) — 启用和禁用该设置。
- [query_metric_log_interval](../../operations/settings/settings.md#query_metric_log_interval)
- [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md) — 包含定期计算的指标。
- [system.events](/operations/system-tables/events) — 包含发生的大量事件。
- [system.metrics](../../operations/system-tables/metrics.md) — 包含即时计算的指标。
- [监控](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
