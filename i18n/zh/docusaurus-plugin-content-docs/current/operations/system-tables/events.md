---
description: '包含有关系统中发生的事件数量的信息的系统表。'
slug: /operations/system-tables/events
title: 'system.events'
keywords: ['系统表', '事件']
---
import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含有关系统中发生的事件数量的信息。例如，在该表中，您可以找到自ClickHouse服务器启动以来处理的`SELECT`查询数量。

列：

- `event` ([String](../../sql-reference/data-types/string.md)) — 事件名称。
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 发生的事件数量。
- `description` ([String](../../sql-reference/data-types/string.md)) — 事件描述。
- `name` ([String](../../sql-reference/data-types/string.md)) — `event` 的别名。

您可以在源文件 [src/Common/ProfileEvents.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/ProfileEvents.cpp) 中找到所有支持的事件。

**示例**

``` sql
SELECT * FROM system.events LIMIT 5
```

``` text
┌─event─────────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Query                                 │    12 │ 被解释并可能执行的查询数量。不包括解析失败或由于AST大小限制、配额限制或同时运行查询数量限制而被拒绝的查询。可能包括ClickHouse本身发起的内部查询。不计算子查询。                  │
│ SelectQuery                           │     8 │ 与Query相同，但仅针对SELECT查询。                                                                                                                                                                                                                │
│ FileOpen                              │    73 │ 打开文件的数量。                                                                                                                                                                                                                                    │
│ ReadBufferFromFileDescriptorRead      │   155 │ 从文件描述符读取的读取次数（read/pread）。不包括套接字。                                                                                                                                                                             │
│ ReadBufferFromFileDescriptorReadBytes │  9931 │ 从文件描述符读取的字节数。如果文件被压缩，这将显示压缩数据的大小。                                                                                                                                              │
└───────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**参见其他信息**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 包含定期计算的指标。
- [system.metrics](/operations/system-tables/metrics) — 包含即时计算的指标。
- [system.metric_log](/operations/system-tables/metric_log) — 包含表`system.metrics`和`system.events`的指标值历史。
- [Monitoring](../../operations/monitoring.md) — ClickHouse监控的基本概念。
