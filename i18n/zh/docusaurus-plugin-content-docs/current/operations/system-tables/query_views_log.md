import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.query_views_log

<SystemTableCloud/>

包含在运行查询时执行的依赖视图的信息，例如，视图类型或执行时间。

要开始记录：

1. 在 [query_views_log](../../operations/server-configuration-parameters/settings.md#query_views_log) 部分配置参数。
2. 设置 [log_query_views](/operations/settings/settings#log_query_views) 为 1。

数据的刷新周期在 [query_views_log](../../operations/server-configuration-parameters/settings.md#query_views_log) 服务器设置部分的 `flush_interval_milliseconds` 参数中设置。要强制刷新，请使用 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 查询。

ClickHouse 不会自动删除表中的数据。有关更多详细信息，请参见 [Introduction](/operations/system-tables/overview#system-tables-introduction)。

您可以使用 [log_queries_probability](/operations/settings/settings#log_queries_probability) 设置来减少在 `query_views_log` 表中注册的查询数量。

列：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 最后一个视图事件发生的日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 视图完成执行的日期和时间。
- `event_time_microseconds` ([DateTime](../../sql-reference/data-types/datetime.md)) — 视图完成执行的时间，精确到微秒。
- `view_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 视图执行的持续时间（各阶段的总和），以毫秒为单位。
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 初始查询的 ID（对于分布式查询执行）。
- `view_name` ([String](../../sql-reference/data-types/string.md)) — 视图的名称。
- `view_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 视图的 UUID。
- `view_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 视图的类型。值：
    - `'Default' = 1` — [默认视图](/sql-reference/statements/create/view#normal-view)。不应出现在此日志中。
    - `'Materialized' = 2` — [物化视图](/sql-reference/statements/create/view#materialized-view)。
    - `'Live' = 3` — [实时视图](../../sql-reference/statements/create/view.md#live-view)。
- `view_query` ([String](../../sql-reference/data-types/string.md)) — 视图执行的查询。
- `view_target` ([String](../../sql-reference/data-types/string.md)) — 视图目标表的名称。
- `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 读取的行数。
- `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 读取的字节数。
- `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 写入的行数。
- `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 写入的字节数。
- `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — 该视图的上下文中，分配和释放的内存之间的最大差异。
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/array.md)) — 测量不同指标的 ProfileEvents。它们的描述可以在 [system.events](/operations/system-tables/events) 表中找到。
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — 视图的状态。值：
    - `'QueryStart' = 1` — 视图执行成功开始。不应出现。
    - `'QueryFinish' = 2` — 视图执行成功结束。
    - `'ExceptionBeforeStart' = 3` — 视图执行开始前的异常。
    - `'ExceptionWhileProcessing' = 4` — 视图执行中的异常。
- `exception_code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 异常代码。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 异常消息。
- `stack_trace` ([String](../../sql-reference/data-types/string.md)) — [堆栈跟踪](https://en.wikipedia.org/wiki/Stack_trace)。如果查询成功完成，则为一个空字符串。

**示例**

查询：

```sql
SELECT * FROM system.query_views_log LIMIT 1 \G;
```

结果：

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2021-06-22
event_time:              2021-06-22 13:23:07
event_time_microseconds: 2021-06-22 13:23:07.738221
view_duration_ms:        0
initial_query_id:        c3a1ac02-9cad-479b-af54-9e9c0a7afd70
view_name:               default.matview_inner
view_uuid:               00000000-0000-0000-0000-000000000000
view_type:               Materialized
view_query:              SELECT * FROM default.table_b
view_target:             default.`.inner.matview_inner`
read_rows:               4
read_bytes:              64
written_rows:            2
written_bytes:           32
peak_memory_usage:       4196188
ProfileEvents:           {'FileOpen':2,'WriteBufferFromFileDescriptorWrite':2,'WriteBufferFromFileDescriptorWriteBytes':187,'IOBufferAllocs':3,'IOBufferAllocBytes':3145773,'FunctionExecute':3,'DiskWriteElapsedMicroseconds':13,'InsertedRows':2,'InsertedBytes':16,'SelectedRows':4,'SelectedBytes':48,'ContextLock':16,'RWLockAcquiredReadLocks':1,'RealTimeMicroseconds':698,'SoftPageFaults':4,'OSReadChars':463}
status:                  QueryFinish
exception_code:          0
exception:
stack_trace:
```

**另见**

- [system.query_log](/operations/system-tables/query_log) — 描述包含关于查询执行的一般信息的 `query_log` 系统表。
- [system.query_thread_log](/operations/system-tables/query_thread_log) — 此表包含有关每个查询执行线程的信息。
