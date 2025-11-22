---
description: '包含来自 `system.metrics` 和 `system.events` 表的指标值历史记录的系统表，数据会周期性刷新到磁盘。'
keywords: ['系统表', 'metric_log']
slug: /operations/system-tables/metric_log
title: 'system.metric_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.metric&#95;log

<SystemTableCloud />

包含来自 `system.metrics` 和 `system.events` 表的指标值历史数据，并会定期刷新写入磁盘。

列：

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器主机名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件时间。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 精度为微秒的事件时间。

**示例**

```sql
SELECT * FROM system.metric_log LIMIT 1 FORMAT Vertical;
```

```text
第 1 行:
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

**模式**
可以使用 XML 标签 `<schema_type>` 将此表配置为不同的模式类型。默认的模式类型为 `wide`，其中每个 metric 或 profile event 存储为单独的一列。对于单列读取，此模式具有最高的性能和效率。

`transposed` 模式以类似于 `system.asynchronous_metric_log` 的格式存储数据，其中 metrics 和 events 以行的形式存储。由于在合并过程中可以降低资源消耗，此模式对于资源受限的环境非常有用。

还存在一种兼容性模式 `transposed_with_wide_view`，它将实际数据存储在采用转置模式的表（`system.transposed_metric_log`）中，并在其之上基于宽模式创建视图。该视图查询转置表，因此对于从 `wide` 模式迁移到 `transposed` 模式非常有用。

**另请参阅**

* [metric&#95;log setting](../../operations/server-configuration-parameters/settings.md#metric_log) — 启用和禁用该设置。
* [system.asynchronous&#95;metrics](../../operations/system-tables/asynchronous_metrics.md) — 包含周期性计算的指标。
* [system.events](/operations/system-tables/events) — 包含若干已发生的事件。
* [system.metrics](../../operations/system-tables/metrics.md) — 包含即时计算的指标。
* [Monitoring](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
