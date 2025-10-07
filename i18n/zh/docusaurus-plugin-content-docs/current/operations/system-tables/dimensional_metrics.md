---
'description': '这个表包含可以即时计算并以 Prometheus 格式导出的维度指标。它始终是最新的。'
'keywords':
- 'system table'
- 'dimensional_metrics'
'slug': '/operations/system-tables/dimensional_metrics'
'title': 'system.dimensional_metrics'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# dimensional_metrics {#dimensional_metrics}

<SystemTableCloud/>

该表包含可以瞬时计算和以 Prometheus 格式导出的维度指标。它始终是最新的。

列：

- `metric` ([String](../../sql-reference/data-types/string.md)) — 指标名称。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — 指标值。
- `description` ([String](../../sql-reference/data-types/string.md)) — 指标描述。
- `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — 指标标签。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric` 的别名。

**示例**

您可以使用如下查询导出所有维度指标的 Prometheus 格式。
```sql
SELECT
  metric AS name,
  toFloat64(value) AS value,
  description AS help,
  labels,
  'gauge' AS type
FROM system.dimensional_metrics
FORMAT Prometheus
```

## Metric descriptions {#metric_descriptions}

### merge_failures {#merge_failures}
自启动以来所有失败合并的数量。

### startup_scripts_failure_reason {#startup_scripts_failure_reason}
按错误类型指示启动脚本故障。启动脚本失败时设置为 1，并标记上错误名称。

### merge_tree_parts {#merge_tree_parts}
合并树数据部分的数量，按部分状态、部分类型以及是否为投影部分标记。

**另请参阅**
- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 包含定期计算的指标。
- [system.events](/operations/system-tables/events) — 包含发生的多个事件。
- [system.metric_log](/operations/system-tables/metric_log) — 包含来自 `system.metrics` 和 `system.events` 的指标值历史。
- [Monitoring](../../operations/monitoring.md) — ClickHouse 监控的基础概念。
