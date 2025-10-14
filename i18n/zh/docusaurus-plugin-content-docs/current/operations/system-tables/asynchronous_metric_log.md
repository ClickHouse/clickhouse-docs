---
'description': '系统表包含 `system.asynchronous_metrics` 的历史值，这些值每个时间间隔（默认一秒钟）保存一次'
'keywords':
- 'system table'
- 'asynchronous_metric_log'
'slug': '/operations/system-tables/asynchronous_metric_log'
'title': 'system.asynchronous_metric_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含 `system.asynchronous_metrics` 的历史值，这些值每个时间间隔保存一次（默认每秒一次）。默认启用。

列:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件时间。
- `metric` ([String](../../sql-reference/data-types/string.md)) — 指标名称。
- `value` ([Float64](../../sql-reference/data-types/float.md)) — 指标值。

**示例**

```sql
SELECT * FROM system.asynchronous_metric_log LIMIT 3 \G
```

```text
Row 1:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2023-11-14
event_time: 2023-11-14 14:39:07
metric:     AsynchronousHeavyMetricsCalculationTimeSpent
value:      0.001

Row 2:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2023-11-14
event_time: 2023-11-14 14:39:08
metric:     AsynchronousHeavyMetricsCalculationTimeSpent
value:      0

Row 3:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2023-11-14
event_time: 2023-11-14 14:39:09
metric:     AsynchronousHeavyMetricsCalculationTimeSpent
value:      0
```

**另请参阅**

- [asynchronous_metric_log 设置](../../operations/server-configuration-parameters/settings.md#asynchronous_metric_log) — 启用和禁用该设置。
- [system.asynchronous_metrics](../system-tables/asynchronous_metrics.md) — 包含定期在后台计算的指标。
- [system.metric_log](../system-tables/metric_log.md) — 包含来自 `system.metrics` 和 `system.events` 表的指标值历史，定期刷新到磁盘。
