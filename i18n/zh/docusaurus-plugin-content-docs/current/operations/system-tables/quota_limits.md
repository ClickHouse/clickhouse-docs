---
description: '包含所有配额各时间区间最大值信息的系统表。一个配额可以对应任意数量的行（包括零行）。'
keywords: ['系统表', 'quota_limits']
slug: /operations/system-tables/quota_limits
title: 'system.quota_limits'
doc_type: 'reference'
---

# system.quota&#95;limits \{#systemquota&#95;limits\}

包含所有配额各个时间区间的最大限制信息。一个配额可以对应任意数量的行，也可以为零行。

列：

* `quota_name` ([String](../../sql-reference/data-types/string.md)) — 配额名称。
* `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 用于计算资源消耗的时间区间长度，单位为秒。
* `is_randomized_interval` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 逻辑值。指示该时间区间是否被随机化。如果未随机化，区间总是从同一时间开始。例如，1 分钟的区间总是从整数分钟开始（即可以从 11:20:00 开始，但绝不会从 11:20:01 开始），一天的区间总是从 UTC 午夜开始。如果区间被随机化，第一个区间从随机时间开始，后续区间依次顺延。取值：
* `0` — 区间未随机化。
* `1` — 区间被随机化。
* `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大查询次数。
* `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大 `SELECT` 查询次数。
* `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大 `INSERT` 查询次数。
* `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大错误次数。
* `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 结果行数上限。
* `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 用于存储查询结果的 RAM 使用量上限（字节数）。
* `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 从查询中涉及的所有表和表函数读取的最大行数。
* `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 从查询中涉及的所有表和表函数读取的最大字节数。
* `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — 查询执行时间上限，单位为秒。