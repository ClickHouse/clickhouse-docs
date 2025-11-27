---
description: '系统表，包含表 `system.errors` 中错误值的历史记录，并定期刷新到磁盘。'
keywords: ['系统表', 'error_log']
slug: /operations/system-tables/system-error-log
title: 'system.error_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud />

包含来自表 `system.errors` 的错误值历史记录，这些数据会定期写入磁盘。

列：

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器主机名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件时间。
* `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 错误代码。
* `error` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - 错误名称。
* `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 该错误发生的次数。
* `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 远程异常（即在某个分布式查询期间接收到的异常）。
* `last_error_time` ([DateTime](../../sql-reference/data-types/datetime.md))  — 最近一次错误发生的时间。
* `last_error_message` ([String](../../sql-reference/data-types/string.md)) — 最近一次错误的消息内容。
* `last_error_query_id` ([String](../../sql-reference/data-types/string.md)) — 导致最近一次错误的查询 ID（如果可用）。
* `last_error_trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 堆栈跟踪信息，表示被调用方法存储所在物理地址的列表。

**示例**

```sql
SELECT * FROM system.error_log LIMIT 1 FORMAT Vertical;
```

```text
第 1 行：
──────
hostname:            clickhouse.testing.internal
event_date:          2025-11-11
event_time:          2025-11-11 11:35:28
code:                60
error:               UNKNOWN_TABLE
value:               1
remote:              0
last_error_time:     2025-11-11 11:35:28
last_error_message:  在 SELECT * FROM system.table_not_exist 的作用域中，表表达式标识符 'system.table_not_exist' 未知
last_error_query_id: 77ad9ece-3db7-4236-9b5a-f789bce4aa2e
last_error_trace:    [100506790044914,100506534488542,100506409937998,100506409936517,100506425182891,100506618154123,100506617994473,100506617990486,100506617988112,100506618341386,100506630272160,100506630266232,100506630276900,100506629795243,100506633519500,100506633495783,100506692143858,100506692248921,100506790779783,100506790781278,100506790390399,100506790380047,123814948752036,123814949330028]
```

**另请参阅**

* [error&#95;log 设置](../../operations/server-configuration-parameters/settings.md#error_log) — 启用和禁用该设置。
* [system.errors](../../operations/system-tables/errors.md) — 包含错误代码及其触发次数。
* [Monitoring](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
