---
description: '系统表，包含针对各个查询、从 `system.events` 表收集的内存和指标值历史记录，并定期写入磁盘。'
keywords: ['系统表', 'query_metric_log']
slug: /operations/system-tables/query_metric_log
title: 'system.query_metric_log'
doc_type: '参考'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.query&#95;metric&#95;log \{#systemquery&#95;metric&#95;log\}

<SystemTableCloud />

包含来自表 `system.events` 的各个查询的内存和指标值历史记录，并定期刷新到磁盘。

一旦查询开始，就会按照 `query_metric_log_interval` 毫秒的周期采集数据（默认值为 1000 毫秒）。如果查询耗时超过 `query_metric_log_interval`，则在查询结束时也会采集一次数据。

列：

* `query_id` ([String](../../sql-reference/data-types/string.md)) — 查询的 ID。
* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行该查询的服务器主机名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件时间。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 具有微秒精度的事件时间。

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

**另请参阅**

* [query&#95;metric&#95;log setting](../../operations/server-configuration-parameters/settings.md#query_metric_log) — 启用或禁用该设置项。
* [query&#95;metric&#95;log&#95;interval](../../operations/settings/settings.md#query_metric_log_interval)
* [system.asynchronous&#95;metrics](../../operations/system-tables/asynchronous_metrics.md) — 包含定期计算的指标。
* [system.events](/operations/system-tables/events) — 包含已发生的一系列事件。
* [system.metrics](../../operations/system-tables/metrics.md) — 包含实时计算的指标。
* [Monitoring](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
