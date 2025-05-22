import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.view_refreshes

<SystemTableCloud/>

关于 [可刷新的物化视图](../../sql-reference/statements/create/view.md#refreshable-materialized-view) 的信息。包含所有可刷新的物化视图，无论是否有正在进行的刷新。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。
- `view` ([String](../../sql-reference/data-types/string.md)) — 表名。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 表的 uuid（原子数据库）。
- `status` ([String](../../sql-reference/data-types/string.md)) — 刷新的当前状态。
- `last_success_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 最近成功刷新开始的时间。如果自从服务器启动或表创建以来没有成功的刷新，则为 NULL。
- `last_success_duration_ms` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最近一次刷新的持续时间。
- `last_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 最近一次刷新尝试结束的时间（如果已知）或开始的时间（如果未知或仍在运行）。如果自服务器启动或表创建以来没有刷新尝试，则为 NULL。
- `last_refresh_replica` ([String](../../sql-reference/data-types/string.md)) — 如果启用了协调，则为当前正在进行的（如果运行）或之前的（如果未运行）刷新尝试的副本名称。
- `next_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 如果状态 = Scheduled，下一次刷新的预定开始时间。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 如果先前的尝试失败，来自错误消息。
- `retry` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 到目前为止，当前刷新的失败尝试次数。
- `progress` ([Float64](../../sql-reference/data-types/float.md)) — 当前刷新的进度，介于 0 和 1 之间。如果状态为 `RunningOnAnotherReplica`，则不可用。
- `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 当前刷新到目前为止读取的行数。如果状态为 `RunningOnAnotherReplica`，则不可用。
- `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 当前刷新期间读取的字节数。如果状态为 `RunningOnAnotherReplica`，则不可用。
- `total_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 当前刷新预计需要读取的总行数。如果状态为 `RunningOnAnotherReplica`，则不可用。
- `written_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 当前刷新期间写入的行数。如果状态为 `RunningOnAnotherReplica`，则不可用。
- `written_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 当前刷新期间写入的字节数。如果状态为 `RunningOnAnotherReplica`，则不可用。

**示例**

```sql
SELECT
    database,
    view,
    status,
    last_refresh_result,
    last_refresh_time,
    next_refresh_time
FROM system.view_refreshes

┌─database─┬─view───────────────────────┬─status────┬─last_refresh_result─┬───last_refresh_time─┬───next_refresh_time─┐
│ default  │ hello_documentation_reader │ Scheduled │ Finished            │ 2023-12-01 01:24:00 │ 2023-12-01 01:25:00 │
└──────────┴────────────────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┘
```
