---
description: '包含来自 `system.events` 表的单个查询的内存和指标值历史记录，定期刷新到磁盘的系统表。'
slug: /operations/system-tables/query_metric_log
title: 'system.query_metric_log'
keywords: ['system table', 'query_metric_log']
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含来自 `system.events` 表的单个查询的内存和指标值历史记录，定期刷新到磁盘。

查询启动后，数据会在 `query_metric_log_interval` 毫秒（默认为 1000） 的间隔中收集。当查询花费的时间超过 `query_metric_log_interval` 时，查询完成时也会收集数据。

列：
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 查询的 ID。
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件时间。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 具有微秒分辨率的事件时间。

**示例**

``` sql
SELECT * FROM system.query_metric_log LIMIT 1 FORMAT Vertical;
```

``` text
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

**另见**

- [query_metric_log setting](../../operations/server-configuration-parameters/settings.md#query_metric_log) — 启用和禁用设置。
- [query_metric_log_interval](../../operations/settings/settings.md#query_metric_log_interval)
- [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md) — 包含定期计算的指标。
- [system.events](/operations/system-tables/events) — 包含发生的若干事件。
- [system.metrics](../../operations/system-tables/metrics.md) — 包含即时计算的指标。
- [Monitoring](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
