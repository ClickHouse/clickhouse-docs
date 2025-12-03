---
description: '包含由查询采样分析器收集的堆栈跟踪的系统表。'
keywords: ['系统表', 'trace_log']
slug: /operations/system-tables/trace_log
title: 'system.trace_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.trace&#95;log {#systemtrace&#95;log}

<SystemTableCloud />

包含由 [sampling query profiler](../../operations/optimizing-performance/sampling-query-profiler.md) 收集的堆栈跟踪信息。

在配置了 [trace&#95;log](../../operations/server-configuration-parameters/settings.md#trace_log) 服务器配置部分后，ClickHouse 会创建此表。另请参阅以下设置：[query&#95;profiler&#95;real&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns)、[query&#95;profiler&#95;cpu&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns)、[memory&#95;profiler&#95;step](../../operations/settings/settings.md#memory_profiler_step)、[memory&#95;profiler&#95;sample&#95;probability](../../operations/settings/settings.md#memory_profiler_sample_probability)、[trace&#95;profile&#95;events](../../operations/settings/settings.md#trace_profile_events)。

要分析日志，请使用 `addressToLine`、`addressToLineWithInlines`、`addressToSymbol` 和 `demangle` 内省函数。

列：

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器主机名。

* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 采样时刻的日期。

* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 采样时刻的时间戳。

* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 具有微秒精度的采样时刻时间戳。

* `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 以纳秒为单位的采样时刻时间戳。

* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse 服务器构建修订版本号。

  通过 `clickhouse-client` 连接到服务器时，你会看到类似 `Connected to ClickHouse server version 19.18.1.` 的字符串。该字段包含的是服务器的 `revision`，而不是 `version`。

* `trace_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 跟踪类型：
  * `Real` 表示按墙钟时间收集栈跟踪。
  * `CPU` 表示按 CPU 时间收集栈跟踪。
  * `Memory` 表示在内存分配超过后续水位线阈值时收集分配和释放。
  * `MemorySample` 表示随机收集分配和释放。
  * `MemoryPeak` 表示收集内存峰值使用的更新。
  * `ProfileEvent` 表示收集 profile 事件的增量。
  * `JemallocSample` 表示收集 jemalloc 样本。
  * `MemoryAllocatedWithoutCheck` 表示在忽略任何内存限制的情况下收集大额分配（&gt;16MiB）（仅供 ClickHouse 开发者使用）。
  * `Instrumentation` 表示通过 XRay 进行 instrumentation 所收集的跟踪。

* `cpu_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — CPU 标识符。

* `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 线程标识符。

* `query_id` ([String](../../sql-reference/data-types/string.md)) — 查询标识符，可用于从 [query&#95;log](/operations/system-tables/query_log) 系统表中获取曾经运行的查询的详细信息。

* `trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 采样时刻的栈跟踪。每个元素是 ClickHouse 服务器进程内的虚拟内存地址。

* `size` ([Int64](../../sql-reference/data-types/int-uint.md)) - 对于 `Memory`、`MemorySample` 或 `MemoryPeak` 跟踪类型，是已分配内存的大小；对于其他跟踪类型为 0。

* `event` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) - 对于 `ProfileEvent` 跟踪类型，是更新后的 profile 事件名称；对于其他跟踪类型是空字符串。

* `increment` ([UInt64](../../sql-reference/data-types/int-uint.md)) - 对于 `ProfileEvent` 跟踪类型，是 profile 事件的增量值；对于其他跟踪类型为 0。

* `symbols`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), 如果启用了符号化，包含与 `trace` 对应的已还原符号名称。

* `lines`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), 如果启用了符号化，包含与 `trace` 对应的、带有行号的文件名字符串。

* `function_id` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)), 对于 Instrumentation 跟踪类型，是在 elf-binary 的 xray&#95;instr&#95;map 段中分配给该函数的 ID。

* `function_name` ([Nullable(String)](../../sql-reference/data-types/nullable.md)), 对于 Instrumentation 跟踪类型，是被插桩（instrumented）的函数名称。

* `handler` ([Nullable(String)](../../sql-reference/data-types/nullable.md)), 对于 Instrumentation 跟踪类型，是被插桩函数的处理程序。

* `entry_type` ([Nullable(Enum(&#39;Entry&#39; = 0, &#39;Exit&#39; = 1))](../../sql-reference/data-types/nullable.md)), 对于 Instrumentation 跟踪类型，是该跟踪的入口类型。

* `duration_nanoseconds` ([Nullable(UInt64)](../../sql-reference/data-types/nullable.md)), 对于 Instrumentation 跟踪类型，是函数的运行时间（纳秒）。

可以在服务器配置文件的 `trace_log` 部分，通过 `symbolize` 启用或禁用符号化。

**示例**

```sql
SELECT * FROM system.trace_log LIMIT 1 \G
```

```text
行 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2025-11-11
event_time:              2025-11-11 11:53:59
event_time_microseconds: 2025-11-11 11:53:59.128333
timestamp_ns:            1762862039128333000
revision:                54504
trace_type:              Instrumentation
cpu_id:                  19
thread_id:               3166432 -- 317 万
query_id:                ef462508-e189-4ea2-b231-4489506728e8
trace:                   [350594916,447733712,447742095,447727324,447726659,221642873,450882315,451852359,451905441,451885554,512404306,512509092,612861767,612863269,612466367,612455825,137631896259267,137631896856768]
size:                    0
ptr:                     0
memory_context:          Unknown
memory_blocked_context:  Unknown
event:
increment:               0
symbols:                 ['StackTrace::StackTrace()','DB::InstrumentationManager::createTraceLogElement(DB::InstrumentationManager::InstrumentedPointInfo const&, XRayEntryType, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>) const','DB::InstrumentationManager::profile(XRayEntryType, DB::InstrumentationManager::InstrumentedPointInfo const&)','DB::InstrumentationManager::dispatchHandlerImpl(int, XRayEntryType)','DB::InstrumentationManager::dispatchHandler(int, XRayEntryType)','__xray_FunctionEntry','DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)','DB::logQueryStart(std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>> const&, std::__1::shared_ptr<DB::Context> const&, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, unsigned long, std::__1::shared_ptr<DB::IAST> const&, DB::QueryPipeline const&, DB::IInterpreter const*, bool, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, bool)','DB::executeQueryImpl(char const*, char const*, std::__1::shared_ptr<DB::Context>, DB::QueryFlags, DB::QueryProcessingStage::Enum, std::__1::unique_ptr<DB::ReadBuffer, std::__1::default_delete<DB::ReadBuffer>>&, std::__1::shared_ptr<DB::IAST>&, std::__1::shared_ptr<DB::ImplicitTransactionControlExecutor>, std::__1::function<void ()>)','DB::executeQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::shared_ptr<DB::Context>, DB::QueryFlags, DB::QueryProcessingStage::Enum)','DB::TCPHandler::runImpl()','DB::TCPHandler::run()','Poco::Net::TCPServerConnection::start()','Poco::Net::TCPServerDispatcher::run()','Poco::PooledThread::run()','Poco::ThreadImpl::runnableEntry(void*)','start_thread','__clone3']
lines:                   ['./build/../src/Common/StackTrace.cpp:395','./src/Common/StackTrace.h:62','./contrib/llvm-project/libcxx/include/__memory/shared_ptr.h:738','./build/./src/Interpreters/InstrumentationManager.cpp:257','./build/./src/Interpreters/InstrumentationManager.cpp:225','/home/ubuntu/ClickHouse/ClickHouse/build/programs/clickhouse','./build/./src/Interpreters/QueryMetricLog.cpp:0','./contrib/llvm-project/libcxx/include/__memory/shared_ptr.h:667','./build/./src/Interpreters/executeQuery.cpp:0','./build/./src/Interpreters/executeQuery.cpp:0','./contrib/llvm-project/libcxx/include/__memory/shared_ptr.h:744','./contrib/llvm-project/libcxx/include/__memory/shared_ptr.h:583','./build/../base/poco/Net/src/TCPServerConnection.cpp:54','../contrib/llvm-project/libcxx/include/__memory/unique_ptr.h:80','./build/../base/poco/Foundation/src/ThreadPool.cpp:219','../base/poco/Foundation/include/Poco/AutoPtr.h:77','/home/ubuntu/ClickHouse/ClickHouse/build/programs/clickhouse','/home/ubuntu/ClickHouse/ClickHouse/build/programs/clickhouse']
function_id:             231255
function_name:           DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)
handler:                 profile
entry_type:              Exit
duration_nanoseconds:   58435
```

# 转换为 Chrome 事件跟踪格式 {#chrome-event-trace-format}

可以使用以下查询将性能剖析数据转换为 Chrome 的 Event Trace Format。将该查询保存为 `chrome_trace.sql` 文件：

```sql
WITH traces AS (
    SELECT * FROM system.trace_log
    WHERE event_date >= today() AND trace_type = 'Instrumentation' AND handler = 'profile'
    ORDER BY event_time, entry_type
)
SELECT
    format(
        '{{"traceEvents": [{}\n]}}',
        arrayStringConcat(
            groupArray(
                format(
                    '\n{{"name": "{}", "cat": "clickhouse", "ph": "{}", "ts": {}, "pid": 1, "tid": {}, "args": {{"query_id": "{}", "cpu_id": {}, "stack": [{}]}}}},',
                    function_name,
                    if(entry_type = 0, 'B', 'E'),
                    timestamp_ns/1000,
                    toString(thread_id),
                    query_id,
                    cpu_id,
                    arrayStringConcat(arrayMap((x, y) -> concat('"', x, ': ', y, '", '), lines, symbols))
                )
            )
        )
    )
FROM traces;
```

并使用 ClickHouse Client 执行，将结果导出为一个 `trace.json` 文件，之后我们可以使用 [Perfetto](https://ui.perfetto.dev/) 或 [speedscope](https://www.speedscope.app/) 导入该文件。

```bash
echo $(clickhouse client --query "$(cat chrome_trace.sql)") > trace.json
```

如果我们希望得到更紧凑但信息量更少的 trace，可以省略 stack 部分。

**另请参阅**

* [SYSTEM INSTRUMENT](../../sql-reference/statements/system.md#instrument) — 添加或删除插桩点。
* [system.instrumentation](../../operations/system-tables/instrumentation.md) — 查看已插桩的点。
* [system.symbols](../../operations/system-tables/symbols.md) — 查看符号以添加插桩点。
