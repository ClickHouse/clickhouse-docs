---
description: '系统表，包含当前用户配额使用情况的信息，例如已使用的配额和剩余的配额。'
slug: /operations/system-tables/quota_usage
title: 'system.quota_usage'
keywords: ['system table', 'quota_usage']
---
import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

当前用户的配额使用情况：已使用多少，剩余多少。

列：
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — 配额名称。
- `quota_key`([String](../../sql-reference/data-types/string.md)) — 键值。例如，如果键 = \[`ip address`\]，`quota_key` 可能的值为 '192.168.1.1'。
- `start_time`([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 计算资源消耗的开始时间。
- `end_time`([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 计算资源消耗的结束时间。
- `duration` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 计算资源消耗的时间间隔长度，单位为秒。
- `queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 该时间间隔内的请求总数。
- `query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 该时间间隔内的选择请求总数。
- `query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 该时间间隔内的插入请求总数。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大请求数。
- `errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 引发异常的查询数量。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大错误数。
- `result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 返回结果的行总数。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大结果行数。
- `result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 用于存储查询结果的 RAM 占用字节数。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 存储查询结果所用的最大 RAM 占用字节数。
- `read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 为运行查询而从所有远程服务器上的表中读取的源行总数。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 从所有参与查询的表和表函数中读取的最大行数。
- `read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 从所有参与查询的表和表函数中读取的总字节数。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 从所有表和表函数中读取的最大字节数。
- `failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — 连续身份验证失败的总次数。如果用户在超过 `failed_sequential_authentications` 阈值之前输入正确的密码，则计数器将重置。
- `max_failed_sequential_authentications` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/float.md))) — 最大连续身份验证失败次数。
- `execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — 查询的总执行时间，单位为秒（墙时间）。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — 查询执行时间的最大值。

## 另请参见 {#see-also}

- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
