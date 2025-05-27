---
'description': '系统表 containing 关于 Refreshable 物化视图 的 信息.'
'keywords':
- 'system table'
- 'view_refreshes'
'slug': '/operations/system-tables/view_refreshes'
'title': 'system.view_refreshes'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.view_refreshes

<SystemTableCloud/>

关于 [可刷新物化视图](../../sql-reference/statements/create/view.md#refreshable-materialized-view) 的信息。包含所有可刷新物化视图，无论当前是否有刷新正在进行。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。
- `view` ([String](../../sql-reference/data-types/string.md)) — 表名。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 表的 uuid（原子数据库）。
- `status` ([String](../../sql-reference/data-types/string.md)) — 刷新的当前状态。
- `last_success_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 最后一次成功刷新开始的时间。如果自服务器启动或表创建以来没有成功刷新，则为 NULL。
- `last_success_duration_ms` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最后一次刷新耗时。
- `last_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 最后一次刷新尝试完成的时间（如果已知）或开始的时间（如果未知或仍在运行）。如果自服务器启动或表创建以来没有刷新尝试，则为 NULL。
- `last_refresh_replica` ([String](../../sql-reference/data-types/string.md)) — 如果协调已启用，则为当前（如果正在运行）或之前（如果未运行）的刷新尝试所使用的副本名称。
- `next_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 如果状态 = Scheduled，则为计划开始下一个刷新的时间。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 如果上一次尝试失败，则返回的错误信息。
- `retry` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 到目前为止，当前刷新有多少次失败的尝试。
- `progress` ([Float64](../../sql-reference/data-types/float.md)) — 当前刷新的进度，在 0 和 1 之间。如果状态为 `RunningOnAnotherReplica`，则不可用。
- `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 当前刷新迄今读取的行数。如果状态为 `RunningOnAnotherReplica`，则不可用。
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
