---
description: '系统表，包含关于可刷新的物化视图的信息。'
slug: /operations/system-tables/view_refreshes
title: 'system.view_refreshes'
keywords: ['system table', 'view_refreshes']
---
import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

关于 [可刷新的物化视图](../../sql-reference/statements/create/view.md#refreshable-materialized-view) 的信息。包含所有可刷新的物化视图，无论是否有刷新正在进行。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。
- `view` ([String](../../sql-reference/data-types/string.md)) — 表名。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 表的 uuid（原子数据库）。
- `status` ([String](../../sql-reference/data-types/string.md)) — 刷新的当前状态。
- `last_success_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 最新成功刷新的开始时间。如果自服务器启动或表创建以来没有成功刷新，则为 NULL。
- `last_success_duration_ms` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最新刷新所花费的时间。
- `last_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 最新刷新尝试完成的时间（如果已知）或开始的时间（如果未知或仍在进行中）。如果自服务器启动或表创建以来没有刷新尝试，则为 NULL。
- `last_refresh_replica` ([String](../../sql-reference/data-types/string.md)) — 如果启用了协调，当前（如果正在进行中）或之前（如果没有正在进行中的）刷新尝试所涉及的副本名称。
- `next_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 下一个刷新计划开始的时间，如果状态为 Scheduled。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 上一次尝试失败时的错误消息。
- `retry` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 到目前为止，当前刷新的失败尝试次数。
- `progress` ([Float64](../../sql-reference/data-types/float.md)) — 当前刷新的进度，范围在 0 和 1 之间。如果状态为 `RunningOnAnotherReplica` 则不可用。
- `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 当前刷新到目前为止读取的行数。如果状态为 `RunningOnAnotherReplica` 则不可用。
- `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 当前刷新期间读取的字节数。如果状态为 `RunningOnAnotherReplica` 则不可用。
- `total_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 当前刷新需要读取的预估总行数。如果状态为 `RunningOnAnotherReplica` 则不可用。
- `written_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 当前刷新期间写入的行数。如果状态为 `RunningOnAnotherReplica` 则不可用。
- `written_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 当前刷新期间写入的字节数。如果状态为 `RunningOnAnotherReplica` 则不可用。

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
