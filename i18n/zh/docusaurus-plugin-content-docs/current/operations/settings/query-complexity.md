---
'description': '限制查询复杂度的设置。'
'sidebar_label': '查询复杂度的限制'
'sidebar_position': 59
'slug': '/operations/settings/query-complexity'
'title': '查询复杂度的限制'
---


# 查询复杂度的限制

## 概述 {#overview}

作为 [settings](/operations/settings/overview) 的一部分，ClickHouse 提供对查询复杂度施加限制的能力。这有助于防止潜在的资源密集型查询，确保执行时更安全且更可预测，特别是在使用用户界面时。

几乎所有的限制仅适用于 `SELECT` 查询，对于分布式查询处理，限制在每个服务器上单独应用。

ClickHouse 通常仅在数据部分完全处理后检查限制，而不是逐行检查限制。这可能导致在处理部分时违反限制的情况。

## `overflow_mode` 设置 {#overflow_mode_setting}

大多数限制还有一个 `overflow_mode` 设置，该设置定义了超出限制时发生的情况，并可以取两个值之一：
- `throw`: 抛出异常（默认）。
- `break`: 停止执行查询并返回部分结果，就像源数据耗尽一样。

## `group_by_overflow_mode` 设置 {#group_by_overflow_mode_settings}

`group_by_overflow_mode` 设置还具有 `any` 值：
- `any`: 继续对进入集合的键进行聚合，但不向集合添加新键。

## 设置列表 {#relevant-settings}

以下设置用于施加对查询复杂度的限制。

:::note
对“最大某个量”的限制可以取值 `0`，这意味着“无限制”。
:::

| 设置                                                                                                                    | 简短描述                                                                                                                                                 |
|------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`max_memory_usage`](/operations/settings/settings#max_memory_usage)                                                 | 在单个服务器上运行查询所使用的最大 RAM 数量。                                                                                                             |
| [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)                               | 在单个服务器上运行用户查询所使用的最大 RAM 数量。                                                                                                        |
| [`max_rows_to_read`](/operations/settings/settings#max_rows_to_read)                                                 | 在运行查询时可以从一个表中读取的最大行数。                                                                                                              |
| [`max_bytes_to_read`](/operations/settings/settings#max_bytes_to_read)                                               | 在运行查询时可以从一个表中读取的最大字节数（未压缩数据）。                                                                                                |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                                     | 在读取的数据量超过某个叶子限制时设置发生的情况。                                                                                                          |
| [`max_rows_to_read_leaf`](/operations/settings/settings#max_rows_to_read_leaf)                                         | 在运行分布式查询时，从叶节点的本地表中可以读取的最大行数。                                                                                                |
| [`max_bytes_to_read_leaf`](/operations/settings/settings#max_bytes_to_read_leaf)                                       | 在运行分布式查询时，从叶节点的本地表中可以读取的最大字节数（未压缩数据）。                                                                              |
| [`read_overflow_mode_leaf`](/docs/operations/settings/settings#read_overflow_mode_leaf)                                | 在读取的数据量超过某个叶子限制时设置发生的情况。                                                                                                          |
| [`max_rows_to_group_by`](/operations/settings/settings#max_rows_to_group_by)                                           | 从聚合接收到的唯一键的最大数量。                                                                                                                          |
| [`group_by_overflow_mode`](/operations/settings/settings#group_by_overflow_mode)                                       | 当聚合的唯一键数量超过限制时设置发生的情况。                                                                                                              |
| [`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)               | 启用或禁用在外部内存中执行 `GROUP BY` 子句。                                                                                                              |
| [`max_bytes_ratio_before_external_group_by`](/operations/settings/settings#max_bytes_ratio_before_external_group_by)   | 允许用于 `GROUP BY` 的可用内存比例。一旦达到，则使用外部内存进行聚合。                                                                                   |
| [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)                       | 启用或禁用在外部内存中执行 `ORDER BY` 子句。                                                                                                              |
| [`max_bytes_ratio_before_external_sort`](/operations/settings/settings#max_bytes_ratio_before_external_sort)           | 允许用于 `ORDER BY` 的可用内存比例。一旦达到，则使用外部排序。                                                                                        |
| [`max_rows_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                 | 排序之前的最大行数。在排序时允许限制内存消耗。                                                                                                           |
| [`max_bytes_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                | 排序之前的最大字节数。                                                                                                                                   |
| [`sort_overflow_mode`](/operations/settings/settings#sort_overflow_mode)                                             | 如果在排序之前接收到的行数超过其中一个限制，则设置发生的情况。                                                                                           |
| [`max_result_rows`](/operations/settings/settings#max_result_rows)                                                   | 限制结果中的行数。                                                                                                                                      |
| [`max_result_bytes`](/operations/settings/settings#max_result_bytes)                                                 | 限制结果大小，以字节（未压缩）。                                                                                                                         |
| [`result_overflow_mode`](/operations/settings/settings#result_overflow_mode)                                           | 设置当结果的量超过某个限制时该怎么做。                                                                                                                   |
| [`max_execution_time`](/operations/settings/settings#max_execution_time)                                             | 最大查询执行时间，以秒为单位。                                                                                                                            |
| [`timeout_overflow_mode`](/operations/settings/settings#timeout_overflow_mode)                                         | 设置当查询运行超过 `max_execution_time` 或预估的运行时间超过 `max_estimated_execution_time` 时该怎么做。                                                |
| [`max_execution_time_leaf`](/operations/settings/settings#max_execution_time_leaf)                                     | 在语义上类似于 `max_execution_time`，但仅在分布式或远程查询的叶节点上应用。                                                                             |
| [`timeout_overflow_mode_leaf`](/operations/settings/settings#timeout_overflow_mode_leaf)                               | 设置当叶节点中的查询运行超过 `max_execution_time_leaf` 时发生的情况。                                                                                      |
| [`min_execution_speed`](/operations/settings/settings#min_execution_speed)                                             | 每秒的最小执行速度（行数）。                                                                                                                             |
| [`min_execution_speed_bytes`](/operations/settings/settings#min_execution_speed_bytes)                                 | 每秒的最小执行字节数。                                                                                                                                   |
| [`max_execution_speed`](/operations/settings/settings#max_execution_speed)                                             | 每秒的最大执行行数。                                                                                                                                     |
| [`max_execution_speed_bytes`](/operations/settings/settings#max_execution_speed_bytes)                                 | 每秒的最大执行字节数。                                                                                                                                   |
| [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)     | 在指定时间（以秒为单位）到期后检查执行速度是否过慢（不低于 `min_execution_speed`）。                                                                        |
| [`max_estimated_execution_time`](/operations/settings/settings#max_estimated_execution_time)                           | 最大查询估计执行时间，以秒为单位。                                                                                                                        |
| [`max_columns_to_read`](/operations/settings/settings#max_columns_to_read)                                             | 在单个查询中可以从一个表中读取的最大列数。                                                                                                              |
| [`max_temporary_columns`](/operations/settings/settings#max_temporary_columns)                                         | 在运行查询时必须同时保留在 RAM 中的最大临时列数，包括常数列。                                                                                          |
| [`max_temporary_non_const_columns`](/operations/settings/settings#max_temporary_non_const_columns)                     | 在运行查询时必须同时保留在 RAM 中的最大临时列数，但不计算常数列。                                                                                     |
| [`max_subquery_depth`](/operations/settings/settings#max_subquery_depth)                                             | 设置如果查询具有超过指定数量的嵌套子查询时发生的情况。                                                                                                   |
| [`max_ast_depth`](/operations/settings/settings#max_ast_depth)                                                       | 查询语法树的最大嵌套深度。                                                                                                                                 |
| [`max_ast_elements`](/operations/settings/settings#max_ast_elements)                                                 | 查询语法树中元素的最大数量。                                                                                                                                 |
| [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)                                                   | 在通过子查询创建的 IN 子句中，数据集的最大行数。                                                                                                          |
| [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)                                                 | 在通过子查询创建的 IN 子句中，集合使用的最大字节数（未压缩数据）。                                                                                     |
| [`set_overflow_mode`](/operations/settings/settings#max_bytes_in_set)                                                | 设置当数据量超过其中一个限制时发生的情况。                                                                                                                |
| [`max_rows_in_distinct`](/operations/settings/settings#max_rows_in_distinct)                                         | 使用 DISTINCT 时的最大不同行数。                                                                                                                          |
| [`max_bytes_in_distinct`](/operations/settings/settings#max_bytes_in_distinct)                                       | 使用 DISTINCT 时在内存中状态的最大字节数（未压缩字节）。                                                                                                 |
| [`distinct_overflow_mode`](/operations/settings/settings#distinct_overflow_mode)                                      | 设置当数据量超过其中一个限制时发生的情况。                                                                                                                |
| [`max_rows_to_transfer`](/operations/settings/settings#max_rows_to_transfer)                                          | 可以传递到远程服务器或在执行 GLOBAL IN/JOIN 部分时保存到临时表的最大行数。                                                                                |
| [`max_bytes_to_transfer`](/operations/settings/settings#max_bytes_to_transfer)                                        | 可以传递到远程服务器或在执行 GLOBAL IN/JOIN 部分时保存到临时表的最大字节数（未压缩数据）。                                                          |
| [`transfer_overflow_mode`](/operations/settings/settings#transfer_overflow_mode)                                      | 设置当数据量超过其中一个限制时发生的情况。                                                                                                                |
| [`max_rows_in_join`](/operations/settings/settings#max_rows_in_join)                                                 | 限制连接表时在哈希表中的行数。                                                                                                                           |
| [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)                                               | 限制连接表时哈希表的最大字节数。                                                                                                                         |
| [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode)                                             | 定义当达到以下任何连接限制时 ClickHouse 采取的操作。                                                                                                     |
| [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)                   | 限制单个插入块中最大分区数，如果此块包含过多分区，则会抛出异常。                                                                                         |
| [`throw_on_max_partitions_per_insert_block`](/operations/settings/settings#throw_on_max_partitions_per_insert_block) | 允许您控制当达到 `max_partitions_per_insert_block` 时的行为。                                                                                          |
| [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | 针对所有同时运行的用户查询，在磁盘上临时文件消耗的最大字节数。                                                                                            |
| [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query) | 针对所有同时运行的查询，在磁盘上临时文件消耗的最大字节数。                                                                                            |
| [`max_sessions_for_user`](/operations/settings/settings#max_sessions_for_user)                                       | 每个经过身份验证的用户在 ClickHouse 服务器上最大同时会话数。                                                                                           |
| [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)                                       | 限制在单个查询中可以访问的最大分区数。                                                                                                                  |

## 过时的设置 {#obsolete-settings}

:::note
以下设置已经过时
:::

### max_pipeline_depth {#max-pipeline-depth}

最大管道深度。它对应于每个数据块在查询处理过程中经过的转换次数。计算在单个服务器的限制内。如果管道深度更大，则会抛出异常。
