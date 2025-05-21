---
'description': '包含由抽样查询分析器收集的堆栈跟踪的系统表。'
'keywords':
- 'system table'
- 'trace_log'
'slug': '/operations/system-tables/trace_log'
'title': '系统.跟踪日志'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.trace_log

<SystemTableCloud/>

包含由 [sampling query profiler](../../operations/optimizing-performance/sampling-query-profiler.md) 收集的堆栈跟踪。

当 [trace_log](../../operations/server-configuration-parameters/settings.md#trace_log) 服务器配置部分被设置时，ClickHouse 将创建此表。另见设置: [query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns), [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns), [memory_profiler_step](../../operations/settings/settings.md#memory_profiler_step),
[memory_profiler_sample_probability](../../operations/settings/settings.md#memory_profiler_sample_probability), [trace_profile_events](../../operations/settings/settings.md#trace_profile_events)。

要分析日志，请使用 `addressToLine`、`addressToLineWithInlines`、`addressToSymbol` 和 `demangle` 内省函数。

列：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 采样时刻的日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 采样时刻的时间戳。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 带有微秒精度的采样时刻时间戳。
- `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 以纳秒为单位的采样时刻时间戳。
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse 服务器构建修订版。

    当通过 `clickhouse-client` 连接到服务器时，您会看到类似于 `Connected to ClickHouse server version 19.18.1.` 的字符串。该字段包含 `revision`，但不包含服务器的 `version`。

- `trace_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 跟踪类型:
    - `Real` 表示通过实际时间收集堆栈跟踪。
    - `CPU` 表示通过 CPU 时间收集堆栈跟踪。
    - `Memory` 表示当内存分配超过后续水印时收集分配和释放。
    - `MemorySample` 表示收集随机分配和释放。
    - `MemoryPeak` 表示收集峰值内存使用情况的更新。
    - `ProfileEvent` 表示收集配置事件的增量。
- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 线程标识符。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 查询标识符，可用于获取在 [query_log](/operations/system-tables/query_log) 系统表中运行的查询的详细信息。
- `trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 采样时刻的堆栈跟踪。每个元素是 ClickHouse 服务器进程内的虚拟内存地址。
- `size` ([Int64](../../sql-reference/data-types/int-uint.md)) - 对于跟踪类型 `Memory`、`MemorySample` 或 `MemoryPeak`，这是分配的内存量，对于其他跟踪类型则为 0。
- `event` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) - 对于跟踪类型 `ProfileEvent`，这是更新的配置事件名称，对于其他跟踪类型则为空字符串。
- `increment` ([UInt64](../../sql-reference/data-types/int-uint.md)) - 对于跟踪类型 `ProfileEvent`，这是配置事件增量的数量，对于其他跟踪类型则为 0。
- `symbols` ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md))，如果启用了符号化，则包含与 `trace` 对应的去混淆符号名称。
- `lines` ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md))，如果启用了符号化，则包含与 `trace` 对应的带有行号的文件名字符串。

在服务器的配置文件中，可以在 `trace_log` 下的 `symbolize` 中启用或禁用符号化。

**示例**

```sql
SELECT * FROM system.trace_log LIMIT 1 \G
```

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2020-09-10
event_time:              2020-09-10 11:23:09
event_time_microseconds: 2020-09-10 11:23:09.872924
timestamp_ns:            1599762189872924510
revision:                54440
trace_type:              Memory
thread_id:               564963
query_id:
trace:                   [371912858,371912789,371798468,371799717,371801313,371790250,624462773,566365041,566440261,566445834,566460071,566459914,566459842,566459580,566459469,566459389,566459341,566455774,371993941,371988245,372158848,372187428,372187309,372187093,372185478,140222123165193,140222122205443]
size:                    5244400
```
