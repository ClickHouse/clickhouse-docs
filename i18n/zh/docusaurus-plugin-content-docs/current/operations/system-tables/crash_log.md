---
description: '记录致命错误堆栈跟踪信息的系统表。'
keywords: ['system table', 'crash_log']
slug: /operations/system-tables/crash_log
title: 'system.crash_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud />

包含有关致命错误的堆栈跟踪信息。该表在数据库中默认不存在，仅在发生致命错误时才会创建。

列：

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器主机名。
* `event_date` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件时间。
* `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 带纳秒精度的事件时间戳。
* `signal` ([Int32](../../sql-reference/data-types/int-uint.md)) — 信号编号。
* `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 线程 ID。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 查询 ID。
* `trace` ([Array](../../sql-reference/data-types/array.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 崩溃瞬间的堆栈跟踪。每个元素是 ClickHouse 服务器进程中的虚拟内存地址。
* `trace_full` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 崩溃瞬间的堆栈跟踪。每个元素包含 ClickHouse 服务器进程中被调用的方法。
* `version` ([String](../../sql-reference/data-types/string.md)) — ClickHouse 服务器版本。
* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse 服务器修订号。
* `build_id` ([String](../../sql-reference/data-types/string.md)) — 由编译器生成的 Build ID。

**示例**

查询：

```sql
SELECT * FROM system.crash_log ORDER BY event_time DESC LIMIT 1;
```

结果（部分输出）：

```text
第 1 行:
──────
主机名:       clickhouse.eu-central1.internal
事件日期:     2020-10-14
事件时间:     2020-10-14 15:47:40
时间戳(纳秒): 1602679660271312710
信号:         11
线程 ID:      23624
查询 ID:      428aab7c-8f5c-44e9-9607-d16b44467e69
跟踪:         [188531193,...]
完整跟踪:     ['3. DB::(anonymous namespace)::FunctionFormatReadableTimeDelta::executeImpl(std::__1::vector<DB::ColumnWithTypeAndName, std::__1::allocator<DB::ColumnWithTypeAndName> >&, std::__1::vector<unsigned long, std::__1::allocator<unsigned long> > const&, unsigned long, unsigned long) const @ 0xb3cc1f9 in /home/username/work/ClickHouse/build/programs/clickhouse',...]
版本:         ClickHouse 20.11.1.1
修订版本:     54442
构建 ID:
```

**另请参阅**

* [trace&#95;log](../../operations/system-tables/trace_log.md) 系统表
