---
slug: '/zh/operations/system-tables/histogram_metrics'
---
import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# histogram_metrics {#histogram_metrics}

<SystemTableCloud/>

此表包含可以即时计算并以 Prometheus 格式导出的直方图指标。它始终保持最新。

列：

- `metric` ([String](../../sql-reference/data-types/string.md)) — 指标名称。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — 指标值。
- `description` ([String](../../sql-reference/data-types/string.md)) — 指标描述。
- `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — 指标标签。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric` 的别名。

**示例**

您可以使用如下查询将所有直方图指标以 Prometheus 格式导出。
``` sql
SELECT
  metric AS name,
  toFloat64(value) AS value,
  description AS help,
  labels,
  'histogram' AS type
FROM system.histogram_metrics
FORMAT Prometheus
```

## 指标描述 {#metric_descriptions}

### keeper_response_time_ms_bucket {#keeper_response_time_ms_bucket}
Keeper 的响应时间，以毫秒为单位。

**另请参阅**
- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 包含定期计算的指标。
- [system.events](/operations/system-tables/events) — 包含发生的多个事件。
- [system.metric_log](/operations/system-tables/metric_log) — 包含 `system.metrics` 和 `system.events` 表的指标值历史记录。
- [监控](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
