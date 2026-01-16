---
description: '用于限制查询复杂度的设置。'
sidebar_label: '查询复杂度限制'
sidebar_position: 59
slug: /operations/settings/query-complexity
title: '查询复杂度限制'
doc_type: 'reference'
---

# 对查询复杂度的限制 \\{#restrictions-on-query-complexity\\}

## 概览 \\{#overview\\}

作为[设置](/operations/settings/overview)的一部分，ClickHouse 支持
对查询复杂度进行限制。这样有助于防止潜在的高资源消耗查询，
从而确保执行过程更安全、更可预测，尤其是在使用用户界面时。

几乎所有限制仅适用于 `SELECT` 查询；对于分布式
查询处理，这些限制会在每台服务器上分别生效。

通常，ClickHouse 只会在数据片段（data parts）
全部处理完成后才检查这些限制，而不是对每一行进行检查。这可能
导致在处理某个片段的过程中就已经违反了限制条件。

## `overflow_mode` 设置 \\{#overflow_mode_setting\\}

大多数限制项也有一个 `overflow_mode` 设置，用于定义在超过限制时的处理方式，其取值可以是以下两种之一：
- `throw`：抛出异常（默认）。
- `break`：停止执行查询并返回部分结果，就像源数据已经耗尽一样。

## `group_by_overflow_mode` 设置 \\{#group_by_overflow_mode_settings\\}

`group_by_overflow_mode` 设置的一个取值为 `any`：
- `any`: 对已进入集合的键继续进行聚合，但不再向集合中添加新的键。

## 设置列表 \\{#relevant-settings\\}

以下设置用于限制查询的复杂度。

:::note
对“某项上限值”的限制可以设置为 `0`，
表示“不受限制”。
:::

| 设置                                                                                                                     | 简要说明                                                                                |
| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [`max_memory_usage`](/operations/settings/settings#max_memory_usage)                                                   | 在单台服务器上执行查询时可使用的最大内存。                                                               |
| [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)                                 | 在单个服务器上执行某个用户查询时可使用的最大内存量。                                                          |
| [`max_rows_to_read`](/operations/settings/settings#max_rows_to_read)                                                   | 在执行查询时可从表中读取的最大行数。                                                                  |
| [`max_bytes_to_read`](/operations/settings/settings#max_bytes_to_read)                                                 | 在执行查询时允许从表中读取的未压缩数据的最大字节数。                                                          |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                                     | 设置当读取的数据量超过任一叶子限制时的处理行为                                                             |
| [`max_rows_to_read_leaf`](/operations/settings/settings#max_rows_to_read_leaf)                                         | 在执行分布式查询时，可从叶节点上的本地表读取的最大行数                                                         |
| [`max_bytes_to_read_leaf`](/operations/settings/settings#max_bytes_to_read_leaf)                                       | 在执行分布式查询时，从叶节点上的本地表可读取的未压缩数据的最大字节数。                                                 |
| [`read_overflow_mode_leaf`](/docs/operations/settings/settings#read_overflow_mode_leaf)                                | 设置当读取的数据量超过某个叶级限制时应采取的行为。                                                           |
| [`max_rows_to_group_by`](/operations/settings/settings#max_rows_to_group_by)                                           | 聚合接收到的唯一键数量上限。                                                                      |
| [`group_by_overflow_mode`](/operations/settings/settings#group_by_overflow_mode)                                       | 设置在用于聚合的唯一键数量超过限制时的处理策略                                                             |
| [`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)               | 启用或禁用在外部内存中执行 `GROUP BY` 子句的功能。                                                     |
| [`max_bytes_ratio_before_external_group_by`](/operations/settings/settings#max_bytes_ratio_before_external_group_by)   | 允许 `GROUP BY` 使用的可用内存比例。达到该比例后，将使用外部内存执行聚合。                                         |
| [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)                       | 启用或禁用在外部内存中执行 `ORDER BY` 子句。                                                        |
| [`max_bytes_ratio_before_external_sort`](/operations/settings/settings#max_bytes_ratio_before_external_sort)           | 允许 `ORDER BY` 使用的可用内存占比。一旦达到该占比，就会使用外部排序。                                           |
| [`max_rows_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                   | 排序前的最大行数。用于在排序时限制内存占用。                                                              |
| [`max_bytes_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                  | 排序前的最大字节数。                                                                          |
| [`sort_overflow_mode`](/operations/settings/settings#sort_overflow_mode)                                               | 设置当排序前接收的行数超过任一限制时要执行的操作。                                                           |
| [`max_result_rows`](/operations/settings/settings#max_result_rows)                                                     | 限制结果返回的行数。                                                                          |
| [`max_result_bytes`](/operations/settings/settings#max_result_bytes)                                                   | 限制结果大小（未压缩，以字节为单位）                                                                  |
| [`result_overflow_mode`](/operations/settings/settings#result_overflow_mode)                                           | 设置当结果大小超出任一限制时要执行的操作。                                                               |
| [`max_execution_time`](/operations/settings/settings#max_execution_time)                                               | 查询的最⼤执⾏时间（秒）。                                                                       |
| [`timeout_overflow_mode`](/operations/settings/settings#timeout_overflow_mode)                                         | 设置在查询运行时间超过 `max_execution_time` 或其预计运行时间超过 `max_estimated_execution_time` 时应执行的操作。 |
| [`max_execution_time_leaf`](/operations/settings/settings#max_execution_time_leaf)                                     | 在语义上与 `max_execution_time` 类似，但仅在分布式或远程查询中应用于叶节点。                                   |
| [`timeout_overflow_mode_leaf`](/operations/settings/settings#timeout_overflow_mode_leaf)                               | 指定当叶节点上的查询运行时间超过 `max_execution_time_leaf` 时的处理方式。                                  |
| [`min_execution_speed`](/operations/settings/settings#min_execution_speed)                                             | 以每秒处理行数计的最低执行速度。                                                                    |
| [`min_execution_speed_bytes`](/operations/settings/settings#min_execution_speed_bytes)                                 | 每秒执行的最小字节数。                                                                         |
| [`max_execution_speed`](/operations/settings/settings#max_execution_speed)                                             | 每秒最大执行行数。                                                                           |
| [`max_execution_speed_bytes`](/operations/settings/settings#max_execution_speed_bytes)                                 | 每秒可执行的最大字节数。                                                                        |
| [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)     | 在经过指定的秒数后，检查执行速度是否不低于 `min_execution_speed`。                                        |
| [`max_estimated_execution_time`](/operations/settings/settings#max_estimated_execution_time)                           | 查询的最大预估执行时间（秒）。                                                                     |
| [`max_columns_to_read`](/operations/settings/settings#max_columns_to_read)                                             | 在单个查询中可以从表中读取的最大列数。                                                                 |
| [`max_temporary_columns`](/operations/settings/settings#max_temporary_columns)                                         | 在执行查询时必须同时保存在内存中的临时列（包括常量列）的最大数量。                                                   |
| [`max_temporary_non_const_columns`](/operations/settings/settings#max_temporary_non_const_columns)                     | 在执行查询时需要同时保存在内存（RAM）中的临时列的最大数量，不包括常量列。                                              |
| [`max_subquery_depth`](/operations/settings/settings#max_subquery_depth)                                               | 设置当查询中的嵌套子查询数量超过指定值时的处理行为。                                                          |
| [`max_ast_depth`](/operations/settings/settings#max_ast_depth)                                                         | 查询语法树的最大嵌套深度。                                                                       |
| [`max_ast_elements`](/operations/settings/settings#max_ast_elements)                                                   | 查询语法树中元素的最大数量。                                                                      |
| [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)                                                     | 由子查询生成并用于 IN 子句的数据集所允许的最大行数。                                                        |
| [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)                                                   | 在由子查询在 IN 子句中创建的集合中可使用的未压缩数据的最大字节数。                                                 |
| [`set_overflow_mode`](/operations/settings/settings#max_bytes_in_set)                                                  | 设置当数据量超过任一限制时的处理方式。                                                                 |
| [`max_rows_in_distinct`](/operations/settings/settings#max_rows_in_distinct)                                           | 使用 DISTINCT 时的最大不同行数。                                                               |
| [`max_bytes_in_distinct`](/operations/settings/settings#max_bytes_in_distinct)                                         | 在使用 DISTINCT 时，哈希表在内存中可占用的状态最大字节数（按未压缩字节计算）。                                        |
| [`distinct_overflow_mode`](/operations/settings/settings#distinct_overflow_mode)                                       | 设置当数据量超过任一限制时的处理方式。                                                                 |
| [`max_rows_to_transfer`](/operations/settings/settings#max_rows_to_transfer)                                           | 在执行 GLOBAL IN/JOIN 子句时，可传递到远程服务器或保存到临时表中的数据的最大行数。                                   |
| [`max_bytes_to_transfer`](/operations/settings/settings#max_bytes_to_transfer)                                         | 在执行 GLOBAL IN/JOIN 子句时，可传递到远程服务器或保存到临时表中的未压缩数据的最大字节数。                               |
| [`transfer_overflow_mode`](/operations/settings/settings#transfer_overflow_mode)                                       | 设置当数据量超过任一限制时的处理策略。                                                                 |
| [`max_rows_in_join`](/operations/settings/settings#max_rows_in_join)                                                   | 限制用于表连接的哈希表中的最大行数。                                                                  |
| [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)                                                 | 用于表连接的哈希表的最大字节数。                                                                    |
| [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode)                                               | 定义当达到以下任一 JOIN 限制时，ClickHouse 将执行的操作。                                               |
| [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)                     | 限制单个插入块中可包含的最大分区数；如果该块中的分区数量超出此限制，则抛出异常。                                            |
| [`throw_on_max_partitions_per_insert_block`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | 用于控制在达到 `max_partitions_per_insert_block` 限制时的行为。                                   |
| [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | 所有并发运行的用户查询在磁盘上用于临时文件的数据最大总量（以字节为单位）。                                               |
| [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query) | 所有并发运行查询在磁盘上的临时文件可消耗的最大数据量（以字节为单位）。                                                 |
| [`max_sessions_for_user`](/operations/settings/settings#max_sessions_for_user)                                         | 每个已认证用户连接到 ClickHouse 服务器时允许的最大并发会话数。                                               |
| [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)                                       | 限制在单个查询中可访问的最大分区数量。                                                                 |



## 已过时的设置 \\{#obsolete-settings\\}

:::note
以下设置已过时
:::

### max_pipeline_depth \\{#max-pipeline-depth\\}

最大管道深度。表示每个数据块在查询处理过程中经历的转换次数。仅在单个服务器内计算。如果管道深度过大，将抛出异常。
