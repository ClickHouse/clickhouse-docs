---
'description': '系统表，包含有关所有配额的所有时间段的最大值的信息。任意数量的行或零可以对应于一个配额。'
'keywords':
- 'system table'
- 'quota_limits'
'slug': '/operations/system-tables/quota_limits'
'title': 'system.quota_limits'
---


# system.quota_limits

包含有关所有配额所有时间间隔的最大值的信息。可以对应于一个配额的行数可以是任意数量或零。

列：
- `quota_name` ([String](../../sql-reference/data-types/string.md)) — 配额名称。
- `duration` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 用于计算资源消耗的时间间隔长度，以秒为单位。
- `is_randomized_interval` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 逻辑值。它指示时间间隔是否是随机的。如果间隔未随机化，则总是从相同的时间开始。例如，1分钟的间隔总是从整数分钟开始（即可以在11:20:00开始，但绝不会在11:20:01开始），一天的间隔总是从UTC的午夜开始。如果间隔是随机的，则第一个间隔在随机时间开始，后续间隔一个接一个开始。值：
  - `0` — 间隔未随机化。
  - `1` — 间隔已随机化。
- `max_queries` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大查询数。
- `max_query_selects` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大选择查询数。
- `max_query_inserts` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大插入查询数。
- `max_errors` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大错误数。
- `max_result_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 最大结果行数。
- `max_result_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 用于存储查询结果的最大RAM字节数。
- `max_read_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 从所有参与查询的表和表函数中读取的最大行数。
- `max_read_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 从所有参与查询的表和表函数中读取的最大字节数。
- `max_execution_time` ([Nullable](../../sql-reference/data-types/nullable.md)([Float64](../../sql-reference/data-types/float.md))) — 查询的最大执行时间，以秒为单位。
