---
'description': '限制查询复杂度的设置。'
'sidebar_label': '查询复杂度的限制'
'sidebar_position': 59
'slug': '/operations/settings/query-complexity'
'title': '查询复杂度的限制'
'doc_type': 'reference'
---


# 查询复杂性限制

## 概述 {#overview}

作为[设置](/operations/settings/overview)的一部分，ClickHouse 提供了对查询复杂性施加限制的功能。这有助于防止潜在的资源密集型查询，确保执行更加安全和可预测，尤其是在使用用户界面时。

几乎所有的限制仅适用于 `SELECT` 查询，对于分布式查询处理，限制是分别在每个服务器上应用的。

ClickHouse 通常在数据部分完全处理后才检查限制，而不是对每一行进行限制检查。这可能导致在处理部分时违反限制的情况。

## `overflow_mode` 设置 {#overflow_mode_setting}

大多数限制都有一个 `overflow_mode` 设置，定义了超出限制时的处理方式，并可以取两个值之一：
- `throw`：抛出异常（默认）。
- `break`：停止执行查询并返回部分结果，仿佛源数据已用尽。

## `group_by_overflow_mode` 设置 {#group_by_overflow_mode_settings}

`group_by_overflow_mode` 设置还具有值 `any`：
- `any`：继续对进入集合的键进行聚合，但不为集合添加新键。

## 设置列表 {#relevant-settings}

以下设置用于施加查询复杂性限制。

:::note
“最大某物数量”的限制可以取值 `0`，这意味着“无限制”。
:::

| 设置                                                                                                                | 简短描述                                                                                                                                               |
|----------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`max_memory_usage`](/operations/settings/settings#max_memory_usage)                                               | 在单个服务器上运行查询时可使用的最大 RAM 数量。                                                                                                         |
| [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)                             | 在单个服务器上运行用户查询时可使用的最大 RAM 数量。                                                                                                  |
| [`max_rows_to_read`](/operations/settings/settings#max_rows_to_read)                                               | 运行查询时从表中可以读取的最大行数。                                                                                                                  |
| [`max_bytes_to_read`](/operations/settings/settings#max_bytes_to_read)                                             | 运行查询时从表中可以读取的最大字节数（未压缩的数据）。                                                                                                |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                                 | 设置读取的数据量超过某个叶子限制时发生的情况。                                                                                                         |
| [`max_rows_to_read_leaf`](/operations/settings/settings#max_rows_to_read_leaf)                                     | 运行分布式查询时，从叶子节点本地表中可以读取的最大行数。                                                                                                |
| [`max_bytes_to_read_leaf`](/operations/settings/settings#max_bytes_to_read_leaf)                                   | 运行分布式查询时，从叶子节点本地表中可以读取的最大字节数（未压缩的数据）。                                                                            |
| [`read_overflow_mode_leaf`](/docs/operations/settings/settings#read_overflow_mode_leaf)                            | 设置读取的数据量超过某个叶子限制时发生的情况。                                                                                                         |
| [`max_rows_to_group_by`](/operations/settings/settings#max_rows_to_group_by)                                       | 从聚合接收到的唯一键的最大数量。                                                                                                                       |
| [`group_by_overflow_mode`](/operations/settings/settings#group_by_overflow_mode)                                   | 设置聚合唯一键的数量超过限制时发生的情况。                                                                                                           |
| [`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)           | 启用或禁用在外部内存中执行 `GROUP BY` 子句。                                                                                                           |
| [`max_bytes_ratio_before_external_group_by`](/operations/settings/settings#max_bytes_ratio_before_external_group_by) | 允许用于 `GROUP BY` 的可用内存比例。一旦达到该比例，将使用外部内存进行聚合。                                                                          |
| [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)                     | 启用或禁用在外部内存中执行 `ORDER BY` 子句。                                                                                                           |
| [`max_bytes_ratio_before_external_sort`](/operations/settings/settings#max_bytes_ratio_before_external_sort)       | 允许用于 `ORDER BY` 的可用内存比例。一旦达到该比例，将使用外部排序。                                                                                 |
| [`max_rows_to_sort`](/operations/settings/settings#max_rows_to_sort)                                               | 排序前的最大行数。允许在排序时限制内存消耗。                                                                                                          |
| [`max_bytes_to_sort`](/operations/settings/settings#max_rows_to_sort)                                              | 排序前的最大字节数。                                                                                                                                 |
| [`sort_overflow_mode`](/operations/settings/settings#sort_overflow_mode)                                           | 设置在排序前接收到的行数超过限制的情况下发生的情况。                                                                                                   |
| [`max_result_rows`](/operations/settings/settings#max_result_rows)                                                 | 限制结果中的行数。                                                                                                                                   |
| [`max_result_bytes`](/operations/settings/settings#max_result_bytes)                                               | 限制结果大小（未压缩）的字节数。                                                                                                                       |
| [`result_overflow_mode`](/operations/settings/settings#result_overflow_mode)                                       | 设置当结果的大小超过限制时该怎么做。                                                                                                                  |
| [`max_execution_time`](/operations/settings/settings#max_execution_time)                                           | 查询的最大执行时间（秒）。                                                                                                                            |
| [`timeout_overflow_mode`](/operations/settings/settings#timeout_overflow_mode)                                     | 设置当查询运行时间超过 `max_execution_time` 或估计运行时间超过 `max_estimated_execution_time` 时该怎么做。                                           |
| [`max_execution_time_leaf`](/operations/settings/settings#max_execution_time_leaf)                                 | 语义上类似于 `max_execution_time`，但仅应用于分布式或远程查询的叶子节点。                                                                             |
| [`timeout_overflow_mode_leaf`](/operations/settings/settings#timeout_overflow_mode_leaf)                           | 设置当叶子节点中的查询运行时间超过 `max_execution_time_leaf` 时发生的情况。                                                                         |
| [`min_execution_speed`](/operations/settings/settings#min_execution_speed)                                         | 每秒的最小执行速度（行数）。                                                                                                                           |
| [`min_execution_speed_bytes`](/operations/settings/settings#min_execution_speed_bytes)                             | 每秒的最小执行字节数。                                                                                                                                 |
| [`max_execution_speed`](/operations/settings/settings#max_execution_speed)                                         | 每秒的最大执行行数。                                                                                                                                   |
| [`max_execution_speed_bytes`](/operations/settings/settings#max_execution_speed_bytes)                             | 每秒的最大执行字节数。                                                                                                                                 |
| [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed) | 在指定的时间（秒）过期后，检查执行速度是否不太慢（不低于 `min_execution_speed`）。                                                                     |
| [`max_estimated_execution_time`](/operations/settings/settings#max_estimated_execution_time)                       | 最大查询估计执行时间（秒）。                                                                                                                          |
| [`max_columns_to_read`](/operations/settings/settings#max_columns_to_read)                                         | 在单个查询中可以从表中读取的最大列数。                                                                                                                 |
| [`max_temporary_columns`](/operations/settings/settings#max_temporary_columns)                                     | 在运行查询时必须同时保存在 RAM 中的最大临时列数，包括常量列。                                                                                         |
| [`max_temporary_non_const_columns`](/operations/settings/settings#max_temporary_non_const_columns)                 | 在运行查询时必须同时保存在 RAM 中的最大临时列数，但不计算常量列。                                                                                   |
| [`max_subquery_depth`](/operations/settings/settings#max_subquery_depth)                                           | 设置如果查询具有超出指定数量的嵌套子查询时发生的情况。                                                                                                 |
| [`max_ast_depth`](/operations/settings/settings#max_ast_depth)                                                     | 查询语法树的最大嵌套深度。                                                                                                                             |
| [`max_ast_elements`](/operations/settings/settings#max_ast_elements)                                               | 查询语法树中元素的最大数量。                                                                                                                           |
| [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)                                               | 从子查询创建的 IN 子句中数据集的最大行数。                                                                                                              |
| [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)                                               | 从子查询创建的 IN 子句中使用的最大字节数（未压缩的数据）。                                                                                            |
| [`set_overflow_mode`](/operations/settings/settings#max_bytes_in_set)                                              | 设置当数据量超过限制时发生的情况。                                                                                                                     |
| [`max_rows_in_distinct`](/operations/settings/settings#max_rows_in_distinct)                                       | 使用 DISTINCT 时不同的最大行数。                                                                                                                       |
| [`max_bytes_in_distinct`](/operations/settings/settings#max_bytes_in_distinct)                                     | 使用 DISTINCT 时哈希表所用状态的最大字节数（未压缩字节）。                                                                                            |
| [`distinct_overflow_mode`](/operations/settings/settings#distinct_overflow_mode)                                   | 设置当数据量超过限制时发生的情况。                                                                                                                     |
| [`max_rows_to_transfer`](/operations/settings/settings#max_rows_to_transfer)                                       | 当执行 GLOBAL IN/JOIN 部分时可以传递给远程服务器或保存到临时表的最大大小（行数）。                                                                   |
| [`max_bytes_to_transfer`](/operations/settings/settings#max_bytes_to_transfer)                                     | 当执行 GLOBAL IN/JOIN 部分时可以传递给远程服务器或保存到临时表的最大字节数（未压缩的数据）。                                                      |
| [`transfer_overflow_mode`](/operations/settings/settings#transfer_overflow_mode)                                   | 设置当数据量超过限制时发生的情况。                                                                                                                     |
| [`max_rows_in_join`](/operations/settings/settings#max_rows_in_join)                                               | 限制在连接表时用于哈希表的行数。                                                                                                                       |
| [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)                                             | 连接表时用于哈希表的最大字节数。                                                                                                                       |
| [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode)                                           | 定义当达到以下连接限制时 ClickHouse 执行的操作。                                                                                                        |
| [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)                 | 限制单个插入块中的最大分区数量，如果块包含过多的分区，则抛出异常。                                                                                     |
| [`throw_on_max_partitions_per_insert_block`](/operations/settings/settings#throw_on_max_partitions_per_insert_block) | 允许您控制达到 `max_partitions_per_insert_block` 时的行为。                                                                                           |
| [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#throw_on_max_partitions_per_insert_block) | 所有并发运行的用户查询在磁盘上由临时文件消耗的最大数据量（字节）。                                                                                   |
| [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query) | 所有并发运行的查询在磁盘上由临时文件消耗的最大数据量（字节）。                                                                                     |
| [`max_sessions_for_user`](/operations/settings/settings#max_sessions_for_user)                                     | 每个经过身份验证的用户对 ClickHouse 服务器的最大并发会话数。                                                                                         |
| [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)                                   | 限制单个查询中可以访问的最大分区数量。                                                                                                                  |

## 弃用的设置 {#obsolete-settings}

:::note
以下设置已弃用
:::

### max_pipeline_depth {#max-pipeline-depth}

最大管道深度。对应于每个数据块在查询处理过程中经过的转换数量。限制在单个服务器的范围内计数。如果管道深度更大，则会抛出异常。
