---
description: '包含 fatal 错误的堆栈跟踪信息的系统表。'
slug: /operations/system-tables/crash-log
title: 'system.crash_log'
keywords: ['system table', 'crash_log']
---
import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含 fatal 错误的堆栈跟踪信息。该表在数据库中默认不存在，仅在发生 fatal 错误时创建。

列：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `event_date` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件的日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件的时间。
- `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 带有纳秒的事件时间戳。
- `signal` ([Int32](../../sql-reference/data-types/int-uint.md)) — 信号编号。
- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 线程 ID。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 查询 ID。
- `trace` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 崩溃时的堆栈跟踪。每个元素都是 ClickHouse 服务器进程中的虚拟内存地址。
- `trace_full` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 崩溃时的堆栈跟踪。每个元素包含 ClickHouse 服务器进程中调用的方法。
- `version` ([String](../../sql-reference/data-types/string.md)) — ClickHouse 服务器版本。
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse 服务器修订版。
- `build_id` ([String](../../sql-reference/data-types/string.md)) — 编译器生成的 BuildID。

**示例**

查询：

``` sql
SELECT * FROM system.crash_log ORDER BY event_time DESC LIMIT 1;
```

结果（不完整）：

``` text
Row 1:
──────
hostname:     clickhouse.eu-central1.internal
event_date:   2020-10-14
event_time:   2020-10-14 15:47:40
timestamp_ns: 1602679660271312710
signal:       11
thread_id:    23624
query_id:     428aab7c-8f5c-44e9-9607-d16b44467e69
trace:        [188531193,...]
trace_full:   ['3. DB::(anonymous namespace)::FunctionFormatReadableTimeDelta::executeImpl(std::__1::vector<DB::ColumnWithTypeAndName, std::__1::allocator<DB::ColumnWithTypeAndName> >&, std::__1::vector<unsigned long, std::__1::allocator<unsigned long> > const&, unsigned long, unsigned long) const @ 0xb3cc1f9 in /home/username/work/ClickHouse/build/programs/clickhouse',...]
version:      ClickHouse 20.11.1.1
revision:     54442
build_id:
```

**另请参阅**
- [trace_log](../../operations/system-tables/trace_log.md) 系统表
