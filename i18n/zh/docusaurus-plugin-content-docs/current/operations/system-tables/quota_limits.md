---
description: '包含所有配额各个时间区间最大值信息的系统表。一个配额可以对应任意数量的行，也可以没有行。'
keywords: ['system table', 'quota_limits']
slug: /operations/system-tables/quota_limits
title: 'system.quota_limits'
doc_type: 'reference'
---

# system.quota_limits

包含关于所有配额在各个时间区间上的最大限制信息。一个配额可以对应任意数量（包括零）行。

列：

- `quota_name` ([String](../../sql-reference/data-types/string.md)) — 配额名称。
- `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 计算资源消耗的时间区间长度，以秒为单位。
- `is_randomized_interval` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 逻辑值。指示区间是否随机化。如果未随机化，则区间总是从同一时间点开始。例如，1 分钟的区间总是从整分钟开始（即可以从 11:20:00 开始，但永远不会从 11:20:01 开始），1 天的区间总是从 UTC 午夜开始。如果区间是随机化的，第一个区间从随机时间点开始，后续区间依次顺延。取值：
- `0` — 区间未随机化。
- `1` — 区间已随机化。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大查询数量。
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大 `SELECT` 查询数量。
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大 `INSERT` 查询数量。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大错误数量。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 结果行的最大数量。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 用于存储查询结果的内存（RAM）最大字节数。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 从参与查询的所有表和表函数中读取的行的最大数量。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 从参与查询的所有表和表函数中读取的字节的最大数量。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — 查询执行时间的最大值，以秒为单位。