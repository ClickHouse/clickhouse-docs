---
'description': '系统表包含关于所有配额所有时间段的最大值的信息。可以对应于一个配额的行数可以是任意数量或零。'
'keywords':
- 'system table'
- 'quota_limits'
'slug': '/operations/system-tables/quota_limits'
'title': 'system.quota_limits'
---


# system.quota_limits

包含所有配额的所有时间间隔的最大值的信息。任何数量的行或零都可以对应于一个配额。

列：
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — 配额名称。
- `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 用于计算资源消耗的时间间隔长度，以秒为单位。
- `is_randomized_interval` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 逻辑值。它表示该时间间隔是否是随机的。如果间隔不是随机的，则总是从同一时间开始。例如，1分钟的间隔始终在整数分钟数时开始（即可以在11:20:00时开始，但从不在11:20:01时开始），一天的间隔始终在UTC的午夜时开始。如果间隔是随机的，则第一个间隔在随机时间开始，随后间隔一个接一个地开始。值：
    - `0` — 间隔不是随机的。
    - `1` — 间隔是随机的。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大查询数量。
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大选择查询数量。
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大插入查询数量。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大错误数量。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大结果行数。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 用于存储查询结果的最大RAM字节数。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 从参与查询的所有表和表函数中读取的最大行数。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 从参与查询的所有表和表函数中读取的最大字节数。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — 查询执行时间的最大值，以秒为单位。
