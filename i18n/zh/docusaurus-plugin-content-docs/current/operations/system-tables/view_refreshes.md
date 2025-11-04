---
'description': '系统表包含关于可刷新的物化视图的信息。'
'keywords':
- 'system table'
- 'view_refreshes'
'slug': '/operations/system-tables/view_refreshes'
'title': 'system.view_refreshes'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.view_refreshes

<SystemTableCloud/>

关于 [可刷新的物化视图](../../sql-reference/statements/create/view.md#refreshable-materialized-view) 的信息。包含所有可刷新的物化视图，无论是否正在进行刷新。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。
- `view` ([String](../../sql-reference/data-types/string.md)) — 表名。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 表的 uuid（原子数据库）。
- `status` ([String](../../sql-reference/data-types/string.md)) — 刷新的当前状态。
- `last_success_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 最新成功刷新的开始时间。如果自服务器启动或表创建以来没有成功的刷新，则为 NULL。
- `last_success_duration_ms` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最近一次刷新的持续时间。
- `last_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 最新刷新尝试完成（如果已知）或开始（如果未知或仍在运行）时的时间。如果自服务器启动或表创建以来没有刷新尝试，则为 NULL。
- `last_refresh_replica` ([String](../../sql-reference/data-types/string.md)) — 如果启用了协调，则当前（如果正在运行）或之前（如果未运行）刷新尝试的副本名称。
- `next_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 下次刷新的计划开始时间，如果状态为 Scheduled。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 如果之前的尝试失败，则为错误消息。
- `retry` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 到目前为止，此次刷新已失败的尝试次数。
- `progress` ([Float64](../../sql-reference/data-types/float.md)) — 当前刷新的进度，介于 0 和 1 之间。如果状态为 `RunningOnAnotherReplica`，则不可用。
- `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 当前刷新已读取的行数。如果状态为 `RunningOnAnotherReplica`，则不可用。
- `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 当前刷新期间读取的字节数。如果状态为 `RunningOnAnotherReplica`，则不可用。
- `total_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 当前刷新需要读取的估计总行数。如果状态为 `RunningOnAnotherReplica`，则不可用。
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
