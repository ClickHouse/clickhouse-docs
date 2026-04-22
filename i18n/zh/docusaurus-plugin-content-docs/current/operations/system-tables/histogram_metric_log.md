---
description: '包含定期采集并写入磁盘的直方图指标快照的系统表。'
keywords: ['系统表', 'histogram_metric_log']
sidebar_label: 'histogram_metric_log'
sidebar_position: 65
slug: /operations/system-tables/histogram_metric_log
title: 'system.histogram_metric_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud />

## 描述 \{#description\}

`system.histogram_metrics` 的历史数据。每隔 `collect_interval_milliseconds` 采集一次快照，并写入磁盘。

## 列 \{#columns\}

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 服务器主机名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件时间。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 精确到微秒的事件时间。
* `metric` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 指标名称。
* `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — 指标标签。
* `histogram` ([Map(Float64, UInt64)](../../sql-reference/data-types/map.md)) — 从桶上界到累计计数的映射。`+inf` 为最后一个桶。
* `count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 观测总数。等于 `histogram[+inf]`。
* `sum` ([Float64](../../sql-reference/data-types/float.md)) — 观测值总和。

## 示例 \{#example\}

```sql
SELECT event_time, metric, labels, histogram
FROM system.histogram_metric_log
WHERE metric = 'keeper_response_time_ms'
ORDER BY event_time DESC
LIMIT 1
FORMAT Vertical;
```

## 另请参阅 \{#see-also\}

* [system.histogram&#95;metrics](/operations/system-tables/histogram_metrics) — 实时直方图指标。
* [system.metric&#95;log](/operations/system-tables/metric_log) — `system.metrics` 和 `system.events` 的历史数据。