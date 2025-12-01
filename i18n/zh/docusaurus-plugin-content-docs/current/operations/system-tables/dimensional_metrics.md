---
description: '该表包含可实时计算并以 Prometheus 格式导出的维度指标，始终保持最新。'
keywords: ['system table', 'dimensional_metrics']
slug: /operations/system-tables/dimensional_metrics
title: 'system.dimensional_metrics'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# dimensional&#95;metrics {#dimensional_metrics}

<SystemTableCloud />

此表包含可以实时计算并以 Prometheus 格式导出的维度指标，且始终保持最新。

列：

* `metric` ([String](../../sql-reference/data-types/string.md)) — 指标名称。
* `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — 指标值。
* `description` ([String](../../sql-reference/data-types/string.md)) — 指标描述。
* `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — 指标标签。
* `name` ([String](../../sql-reference/data-types/string.md)) — `metric` 的别名。

**Example**

可以使用如下查询将所有维度指标以 Prometheus 格式导出。

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


## 指标说明 {#metric_descriptions}

### merge_failures {#merge_failures}
自启动以来所有合并失败的总次数。

### startup_scripts_failure_reason {#startup_scripts_failure_reason}
按错误类型指示启动脚本失败情况。当某个启动脚本失败时，该指标会被设置为 1，并使用错误名称进行标记。

### merge_tree_parts {#merge_tree_parts}
MergeTree 数据部分的数量，按部分状态、部分类型以及是否为投影部分进行标记。

**另请参阅**
- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 包含周期性计算的指标。
- [system.events](/operations/system-tables/events) — 包含已发生事件的数量。
- [system.metric_log](/operations/system-tables/metric_log) — 包含来自 `system.metrics` 和 `system.events` 表的指标值历史记录。
- [Monitoring](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
