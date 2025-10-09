---
'description': '系统表包含关于 MergeTree 系列表投影部分列的信息'
'keywords':
- 'system table'
- 'projection_parts_columns'
'slug': '/operations/system-tables/projection_parts_columns'
'title': 'system.projection_parts_columns'
'doc_type': 'reference'
---


# system.projection_parts_columns

该表包含有关 MergeTree 家族表的投影部分中列的信息。

## Columns {#columns}

| Column                                  | Description                                                                                                                              | Type               |
|-----------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|--------------------|
| `partition`                             | 分区名称。                                                                                                                          | String             |
| `name`                                  | 数据部分的名称。                                                                                                                       | String             |
| `part_type`                             | 存储数据部分的格式。                                                                                                                | String             |
| `parent_name`                           | 源（父）数据部分的名称。                                                                                                               | String             |
| `parent_uuid`                           | 源（父）数据部分的 UUID。                                                                                                             | UUID               |
| `parent_part_type`                      | 源（父）数据部分的存储格式。                                                                                                          | String             |
| `active`                                | 表示数据部分是否处于活动状态的标志                                                                                                      | UInt8              |
| `marks`                                 | 标记数量。                                                                                                                            | UInt64             |
| `rows`                                  | 行数。                                                                                                                                | UInt64             |
| `bytes_on_disk`                         | 所有数据部分文件的总大小（以字节为单位）。                                                                                           | UInt64             |
| `data_compressed_bytes`                 | 数据部分中压缩数据的总大小。所有辅助文件（例如，标记文件）不包括在内。                                                        | UInt64             |
| `data_uncompressed_bytes`               | 数据部分中未压缩数据的总大小。所有辅助文件（例如，标记文件）不包括在内。                                                      | UInt64             |
| `marks_bytes`                           | 带有标记的文件的大小。                                                                                                                   | UInt64             |
| `parent_marks`                          | 源（父）部分中的标记数量。                                                                                                            | UInt64             |
| `parent_rows`                           | 源（父）部分中的行数。                                                                                                                 | UInt64             |
| `parent_bytes_on_disk`                  | 所有源（父）数据部分文件的总大小（以字节为单位）。                                                                                   | UInt64             |
| `parent_data_compressed_bytes`          | 源（父）数据部分中压缩数据的总大小。                                                                                                | UInt64             |
| `parent_data_uncompressed_bytes`        | 源（父）数据部分中未压缩数据的总大小。                                                                                              | UInt64             |
| `parent_marks_bytes`                    | 源（父）数据部分中带有标记的文件的大小。                                                                                            | UInt64             |
| `modification_time`                     | 数据部分目录被修改的时间。这通常与数据部分创建时间相对应。                                                                       | DateTime           |
| `remove_time`                           | 数据部分变为非活动状态的时间。                                                                                                         | DateTime           |
| `refcount`                              | 使用数据部分的位置数量。大于 2 的值表示数据部分在查询或合并中被使用。                                                            | UInt32             |
| `min_date`                              | 如果该值包含在分区键中，则为日期列的最小值。                                                                                         | Date               |
| `max_date`                              | 如果该值包含在分区键中，则为日期列的最大值。                                                                                         | Date               |
| `min_time`                              | 如果该值包含在分区键中，则为日期时间列的最小值。                                                                                     | DateTime           |
| `max_time`                              | 如果该值包含在分区键中，则为日期时间列的最大值。                                                                                     | DateTime           |
| `partition_id`                          | 分区的 ID。                                                                                                                             | String             |
| `min_block_number`                      | 合并后组成当前部分的数据部分的最小数量。                                                                                              | Int64              |
| `max_block_number`                      | 合并后组成当前部分的数据部分的最大数量。                                                                                              | Int64              |
| `level`                                 | 合并树的深度。零表示当前部分是通过插入而不是通过合并其他部分创建的。                                                              | UInt32             |
| `data_version`                          | 用于确定哪些变更应该应用于数据部分的号码（版本高于 data_version 的变更）。                                                        | UInt64             |
| `primary_key_bytes_in_memory`           | 主键值所占用的内存量（以字节为单位）。                                                                                                   | UInt64             |
| `primary_key_bytes_in_memory_allocated` | 为主键值保留的内存量（以字节为单位）。                                                                                                  | UInt64             |
| `database`                              | 数据库的名称。                                                                                                                        | String             |
| `table`                                 | 表的名称。                                                                                                                             | String             |
| `engine`                                | 表引擎的名称，不带参数。                                                                                                              | String             |
| `disk_name`                             | 存储数据部分的磁盘名称。                                                                                                                | String             |
| `path`                                  | 数据部分文件的绝对路径。                                                                                                               | String             |
| `column`                                | 列的名称。                                                                                                                          | String             |
| `type`                                  | 列类型。                                                                                                                             | String             |
| `column_position`                       | 表中列的序数位置，从 1 开始。                                                                                                        | UInt64             |
| `default_kind`                          | 默认值的表达式类型（DEFAULT，MATERIALIZED，ALIAS），如果未定义则为空字符串。                                                       | String             |
| `default_expression`                    | 默认值的表达式，如果未定义则为空字符串。                                                                                               | String             |
| `column_bytes_on_disk`                  | 列的总大小（以字节为单位）。                                                                                                           | UInt64             |
| `column_data_compressed_bytes`          | 列中压缩数据的总大小（以字节为单位）。                                                                                                   | UInt64             |
| `column_data_uncompressed_bytes`        | 列中未压缩数据的总大小（以字节为单位）。                                                                                                 | UInt64             |
| `column_marks_bytes`                    | 带有标记的列的大小（以字节为单位）。                                                                                                   | UInt64             |
| `column_modification_time`              | 列最后一次被修改的时间。                                                                                                                  | Nullable(DateTime) |
| `bytes`                                 | bytes_on_disk 的别名                                                                                                                  | UInt64             |
| `marks_size`                            | marks_bytes 的别名                                                                                                                    | UInt64             |
| `part_name`                             | name 的别名                                                                                                                           | String             |
