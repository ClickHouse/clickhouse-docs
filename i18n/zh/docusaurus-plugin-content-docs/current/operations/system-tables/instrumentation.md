---
description: '包含监控插桩点的系统表'
keywords: ['system table', '监控插桩']
slug: /operations/system-tables/instrumentation
title: 'system.instrumentation'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.instrumentation {#systeminstrumentation}

<SystemTableCloud />

包含使用 LLVM XRay 功能的插桩点信息。

列：

* `id` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 插桩点的 ID。
* `function_id` ([Int32](../../sql-reference/data-types/int-uint.md)) — 在 ELF 二进制文件的 `xray_instr_map` 段中分配给函数的 ID。
* `function_name` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 用于对该函数进行插桩的名称。
* `handler` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 处理器类型。
* `entry_type` ([Enum(&#39;Entry&#39; = 0, &#39;Exit&#39; = 1, &#39;EntryAndExit&#39; = 2)](../../sql-reference/data-types/enum.md)) — 入口类型：`Entry`、`Exit` 或 `EntryAndExit`。
* `symbol` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 完整且已还原名称修饰的符号。
* `parameters` ([Array(Dynamic)](../../sql-reference/data-types/array.md)) — 处理器调用时的参数。

**示例**

```sql
SELECT * FROM system.instrumentation FORMAT Vertical;
```

```text
第 1 行:
──────
id:            0
function_id:   231280
function_name: QueryMetricLog::startQuery
handler:       log
entry_type:    Entry
symbol:        DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)
parameters:    ['test']

第 2 行:
──────
id:            1
function_id:   231280
function_name: QueryMetricLog::startQuery
handler:       profile
entry_type:    EntryAndExit
symbol:        DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)
parameters:    []

第 3 行:
──────
id:            2
function_id:   231280
function_name: QueryMetricLog::startQuery
handler:       sleep
entry_type:    Exit
symbol:        DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)
parameters:    [0.3]

返回 3 行。耗时:0.302 秒。
```

**另请参阅**

* [SYSTEM INSTRUMENT](../../sql-reference/statements/system.md) — 添加或删除插桩点。
* [system.trace&#95;log](../../operations/system-tables/trace_log.md) - 查看性能分析日志。
