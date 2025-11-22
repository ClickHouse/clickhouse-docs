---
description: '限制查询复杂度的相关设置。'
sidebar_label: '查询复杂度限制'
sidebar_position: 59
slug: /operations/settings/query-complexity
title: '查询复杂度限制'
doc_type: 'reference'
---



# 对查询复杂度的限制



## 概述 {#overview}

作为[设置](/operations/settings/overview)的一部分,ClickHouse 提供了对查询复杂度进行限制的功能。这有助于防范可能消耗大量资源的查询,确保执行过程更加安全和可预测,尤其是在使用用户界面时。

几乎所有限制都仅适用于 `SELECT` 查询,而对于分布式查询处理,限制会在每个服务器上分别应用。

ClickHouse 通常只在数据分片完全处理后才检查限制,而不是逐行检查限制。这可能导致在处理数据分片的过程中出现违反限制的情况。


## `overflow_mode` 设置 {#overflow_mode_setting}

大多数限制还具有 `overflow_mode` 设置,用于定义超出限制时的行为,可以取以下两个值之一:

- `throw`:抛出异常(默认值)。
- `break`:停止执行查询并返回部分结果,如同源数据已用尽。


## `group_by_overflow_mode` 设置 {#group_by_overflow_mode_settings}

`group_by_overflow_mode` 设置还支持 `any` 值:

- `any`:继续对已进入集合的键进行聚合,但不再向集合中添加新键。


## 设置列表 {#relevant-settings}

以下设置用于对查询复杂度进行限制。

:::note
关于"最大数量"的限制可以设置为 `0` 值，
表示"不受限制"。
:::


| 设置                                                                                                                     | 简要描述                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [`max_memory_usage`](/operations/settings/settings#max_memory_usage)                                                   | 在单个服务器上执行查询时可使用的最大 RAM 容量。                                                           |
| [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)                                 | 在单个服务器上为某个用户的查询运行所能使用的最大 RAM 容量。                                                     |
| [`max_rows_to_read`](/operations/settings/settings#max_rows_to_read)                                                   | 运行查询时从表中可读取的最大行数。                                                                    |
| [`max_bytes_to_read`](/operations/settings/settings#max_bytes_to_read)                                                 | 在执行查询时，从表中可读取的未压缩数据的最大字节数。                                                           |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                                     | 设置当读取的数据量超过某个 leaf 限制时的行为                                                            |
| [`max_rows_to_read_leaf`](/operations/settings/settings#max_rows_to_read_leaf)                                         | 在执行分布式查询时，从叶节点上的本地表可读取的最大行数                                                          |
| [`max_bytes_to_read_leaf`](/operations/settings/settings#max_bytes_to_read_leaf)                                       | 在执行分布式查询时，可从叶节点上的本地表读取的未压缩数据的最大字节数。                                                  |
| [`read_overflow_mode_leaf`](/docs/operations/settings/settings#read_overflow_mode_leaf)                                | 设置当读取的数据量超过任一叶子节点设定的上限时的处理方式。                                                        |
| [`max_rows_to_group_by`](/operations/settings/settings#max_rows_to_group_by)                                           | 聚合过程中接收到的唯一键的最大数量。                                                                   |
| [`group_by_overflow_mode`](/operations/settings/settings#group_by_overflow_mode)                                       | 设置当用于聚合的唯一键数量超出限制时的处理方式                                                              |
| [`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)               | 启用或禁用在外部内存中执行 `GROUP BY` 子句的功能。                                                      |
| [`max_bytes_ratio_before_external_group_by`](/operations/settings/settings#max_bytes_ratio_before_external_group_by)   | `GROUP BY` 可占用的可用内存比例。达到该比例后，将使用外部内存进行聚合。                                            |
| [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)                       | 启用或禁用在外部内存中执行 `ORDER BY` 子句的功能。                                                      |
| [`max_bytes_ratio_before_external_sort`](/operations/settings/settings#max_bytes_ratio_before_external_sort)           | `ORDER BY` 操作可使用的可用内存比例。达到该比例后，将启用外部排序。                                              |
| [`max_rows_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                   | 排序前待排序的最大行数。用于在排序时限制内存占用。                                                            |
| [`max_bytes_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                  | 排序前的最大字节数。                                                                           |
| [`sort_overflow_mode`](/operations/settings/settings#sort_overflow_mode)                                               | 设置在排序前接收的行数超过任一限制值时的处理方式。                                                            |
| [`max_result_rows`](/operations/settings/settings#max_result_rows)                                                     | 限制结果集中的行数。                                                                           |
| [`max_result_bytes`](/operations/settings/settings#max_result_bytes)                                                   | 限制结果的未压缩大小（字节）                                                                       |
| [`result_overflow_mode`](/operations/settings/settings#result_overflow_mode)                                           | 设置当结果体量超过任一限制时的处理方式。                                                                 |
| [`max_execution_time`](/operations/settings/settings#max_execution_time)                                               | 查询最大执行时间（秒）。                                                                         |
| [`timeout_overflow_mode`](/operations/settings/settings#timeout_overflow_mode)                                         | 设置当查询实际运行时间超过 `max_execution_time` 或预估运行时间超过 `max_estimated_execution_time` 时应执行的操作。 |
| [`max_execution_time_leaf`](/operations/settings/settings#max_execution_time_leaf)                                     | 在语义上与 `max_execution_time` 相似，但只在分布式或远程查询的叶子节点上生效。                                   |
| [`timeout_overflow_mode_leaf`](/operations/settings/settings#timeout_overflow_mode_leaf)                               | 设置当叶节点上的查询运行时间超过 `max_execution_time_leaf` 时的行为。                                     |
| [`min_execution_speed`](/operations/settings/settings#min_execution_speed)                                             | 最小执行速度，单位为行/秒。                                                                       |
| [`min_execution_speed_bytes`](/operations/settings/settings#min_execution_speed_bytes)                                 | 每秒最少处理的字节数。                                                                          |
| [`max_execution_speed`](/operations/settings/settings#max_execution_speed)                                             | 每秒最多可处理的行数。                                                                          |
| [`max_execution_speed_bytes`](/operations/settings/settings#max_execution_speed_bytes)                                 | 每秒可执行的最大字节数。                                                                         |
| [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)     | 在经过指定的秒数后，检查执行速度是否不低于 `min_execution_speed`。                                         |
| [`max_estimated_execution_time`](/operations/settings/settings#max_estimated_execution_time)                           | 查询的最大预估执行时间（秒）。                                                                      |
| [`max_columns_to_read`](/operations/settings/settings#max_columns_to_read)                                             | 在一次查询中可以从表中读取的最大列数。                                                                  |
| [`max_temporary_columns`](/operations/settings/settings#max_temporary_columns)                                         | 在执行查询时（包括常量列），必须同时保存在 RAM 中的临时列的最大数量。                                                |
| [`max_temporary_non_const_columns`](/operations/settings/settings#max_temporary_non_const_columns)                     | 在执行查询时需要同时保存在 RAM 中的临时列的最大数量，不包括常量列。                                                 |
| [`max_subquery_depth`](/operations/settings/settings#max_subquery_depth)                                               | 设置在查询中嵌套子查询数量超过指定上限时的处理方式。                                                           |
| [`max_ast_depth`](/operations/settings/settings#max_ast_depth)                                                         | 查询语法树允许的最大嵌套深度。                                                                      |
| [`max_ast_elements`](/operations/settings/settings#max_ast_elements)                                                   | 查询语法树中的最大节点数。                                                                        |
| [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)                                                     | 由子查询生成的 IN 子句中数据集的最大行数。                                                              |
| [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)                                                   | 由子查询在 IN 子句中生成的集合可使用的未压缩数据的最大字节数。                                                    |
| [`set_overflow_mode`](/operations/settings/settings#max_bytes_in_set)                                                  | 设置当数据量超出任一限制时的处理方式。                                                                  |
| [`max_rows_in_distinct`](/operations/settings/settings#max_rows_in_distinct)                                           | 使用 DISTINCT 时允许的最大不同数量的行数。                                                           |
| [`max_bytes_in_distinct`](/operations/settings/settings#max_bytes_in_distinct)                                         | 在使用 DISTINCT 时，哈希表在内存中存储状态所允许的最大字节数（以未压缩字节计）。                                        |
| [`distinct_overflow_mode`](/operations/settings/settings#distinct_overflow_mode)                                       | 设置在数据量超过任一限制时的处理方式。                                                                  |
| [`max_rows_to_transfer`](/operations/settings/settings#max_rows_to_transfer)                                           | 在执行 GLOBAL IN/JOIN 子句时，可以传递给远程服务器或保存到临时表中的数据的最大行数。                                   |
| [`max_bytes_to_transfer`](/operations/settings/settings#max_bytes_to_transfer)                                         | 在执行 GLOBAL IN/JOIN 子句时，可以传递到远程服务器或保存在临时表中的未压缩数据的最大字节数。                               |
| [`transfer_overflow_mode`](/operations/settings/settings#transfer_overflow_mode)                                       | 设置在数据量超过任一限制时的处理方式。                                                                  |
| [`max_rows_in_join`](/operations/settings/settings#max_rows_in_join)                                                   | 限制在执行表 JOIN 时所使用哈希表中的行数。                                                             |
| [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)                                                 | 在进行表关联（JOIN）时使用的哈希表的最大大小（以字节为单位）。                                                    |
| [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode)                                               | 定义当达到以下任一 JOIN 限制时，ClickHouse 将执行的操作。                                                |
| [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)                     | 限制单次插入的数据块中分区数量的上限，如果该数据块包含的分区过多，则会抛出异常。                                             |
| [`throw_on_max_partitions_per_insert_block`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | 用于控制在达到 `max_partitions_per_insert_block` 时的行为。                                      |
| [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | 磁盘上临时文件因所有并发运行的用户查询而消耗的数据总量上限（以字节为单位）。                                               |
| [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query) | 所有并发运行的查询在磁盘上用于临时文件的数据总量上限（以字节为单位）。                                                  |
| [`max_sessions_for_user`](/operations/settings/settings#max_sessions_for_user)                                         | 每个已认证用户在 ClickHouse 服务器上的最大并发会话数。                                                    |
| [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)                                       | 限制单个查询可访问的分区最大数量。                                                                    |





## 已废弃的设置 {#obsolete-settings}

:::note
以下设置已废弃
:::

### max_pipeline_depth {#max-pipeline-depth}

最大管道深度。对应于查询处理期间每个数据块所经历的转换次数。在单个服务器范围内计数。如果管道深度超过此值,将抛出异常。
