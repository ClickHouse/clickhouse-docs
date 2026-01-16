---
description: '包含 MergeTree 表各数据部分及其列信息的系统表。'
keywords: ['系统表', 'parts_columns']
slug: /operations/system-tables/parts_columns
title: 'system.parts_columns'
doc_type: 'reference'
---

# system.parts_columns \{#systemparts_columns\}

包含 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的分区片段和列的信息。
每一行描述一个数据分区片段。

| Column                                  | Type     | Description                                                                                                          |
| --------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `partition`                             | String   | 分区名称。格式：按月自动分区时为 `YYYYMM`，或在手动分区时为 `any_string`。                                                                     |
| `name`                                  | String   | 数据分区片段的名称。                                                                                                           |
| `part_type`                             | String   | 数据分区片段的存储格式。取值：`Wide`（每一列单独一个文件）或 `Compact`（所有列在同一个文件中）。由 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 设置控制。 |
| `active`                                | UInt8    | 指示数据分区片段是否为 active 的标志。active 分区片段会被表使用；inactive 分区片段会被删除或在合并后保留。                                                    |
| `marks`                                 | UInt64   | mark 的数量。乘以索引粒度（通常为 8192）可以得到大致的行数。                                                                                  |
| `rows`                                  | UInt64   | 行数。                                                                                                                  |
| `bytes_on_disk`                         | UInt64   | 该数据分区片段所有文件的总大小（以字节计）。                                                                                               |
| `data_compressed_bytes`                 | UInt64   | 数据分区片段中已压缩数据的总大小（不包括 mark 等辅助文件）。                                                                                    |
| `data_uncompressed_bytes`               | UInt64   | 数据分区片段中未压缩数据的总大小（不包括 mark 等辅助文件）。                                                                                    |
| `marks_bytes`                           | UInt64   | 含有 mark 的文件大小。                                                                                                       |
| `modification_time`                     | DateTime | 含有该数据分区片段的目录被修改的时间（通常对应于创建时间）。                                                                                       |
| `remove_time`                           | DateTime | 数据分区片段变为 inactive 的时间。                                                                                               |
| `refcount`                              | UInt32   | 使用该数据分区片段的位置数量。值 &gt; 2 表示该分区片段正在被查询或合并使用。                                                                           |
| `min_date`                              | Date     | 该数据分区片段中日期键的最小值。                                                                                                     |
| `max_date`                              | Date     | 该数据分区片段中日期键的最大值。                                                                                                     |
| `partition_id`                          | String   | 分区的 ID。                                                                                                              |
| `min_block_number`                      | UInt64   | 合并后组成当前分区片段的数据分区片段的最小编号。                                                                                             |
| `max_block_number`                      | UInt64   | 合并后组成当前分区片段的数据分区片段的最大编号。                                                                                             |
| `level`                                 | UInt32   | MergeTree 的合并层级深度。0 表示通过插入创建，而不是通过合并创建。                                                                              |
| `data_version`                          | UInt64   | 用于确定应应用哪些 mutation 的编号（会应用版本号大于 `data_version` 的 mutation）。                                                          |
| `primary_key_bytes_in_memory`           | UInt64   | 主键值在内存中使用的字节数。                                                                                                       |
| `primary_key_bytes_in_memory_allocated` | UInt64   | 为主键值预留的内存字节数。                                                                                                        |
| `database`                              | String   | 数据库名称。                                                                                                               |
| `table`                                 | String   | 表名。                                                                                                                  |
| `engine`                                | String   | 不带参数的表引擎名称。                                                                                                          |
| `disk_name`                             | String   | 存储该数据分区片段的磁盘名称。                                                                                                      |
| `path`                                  | String   | 数据分区片段文件所在文件夹的绝对路径。                                                                                                  |
| `column`                                | String   | 列名。                                                                                                                  |
| `type`                                  | String   | 列类型。                                                                                                                 |
| `column_position`                       | UInt64   | 列在表中的序号位置，从 1 开始计数。                                                                                                  |
| `default_kind`                          | String   | 默认值表达式类型（`DEFAULT`、`MATERIALIZED`、`ALIAS`），如果未定义则为空字符串。                                                              |
| `default_expression`                    | String   | 默认值的表达式，如果未定义则为空字符串。                                                                                                 |
| `column_bytes_on_disk`                  | UInt64   | 列在磁盘上的总大小（以字节计）。                                                                                                     |
| `column_data_compressed_bytes`          | UInt64   | 列中已压缩数据的总大小（以字节计）。注意：compact 分区片段不会计算该值。                                                                             |
| `column_data_uncompressed_bytes`        | UInt64   | 列中解压缩后数据的总大小（以字节计）。注意：compact 分区片段不会计算该值。                                                                            |
| `column_marks_bytes`                    | UInt64   | 含有该列 mark 的文件大小（以字节计）。                                                                                               |
| `bytes`                                 | UInt64   | `bytes_on_disk` 的别名。                                                                                                 |
| `marks_size`                            | UInt64   | `marks_bytes` 的别名。                                                                                                   |

**示例**

```sql
SELECT * FROM system.parts_columns LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
partition:                             tuple()
name:                                  all_1_2_1
part_type:                             Wide
active:                                1
marks:                                 2
rows:                                  2
bytes_on_disk:                         155
data_compressed_bytes:                 56
data_uncompressed_bytes:               4
marks_bytes:                           96
modification_time:                     2020-09-23 10:13:36
remove_time:                           2106-02-07 06:28:15
refcount:                              1
min_date:                              1970-01-01
max_date:                              1970-01-01
partition_id:                          all
min_block_number:                      1
max_block_number:                      2
level:                                 1
data_version:                          1
primary_key_bytes_in_memory:           2
primary_key_bytes_in_memory_allocated: 64
database:                              default
table:                                 53r93yleapyears
engine:                                MergeTree
disk_name:                             default
path:                                  /var/lib/clickhouse/data/default/53r93yleapyears/all_1_2_1/
column:                                id
type:                                  Int8
column_position:                       1
default_kind:
default_expression:
column_bytes_on_disk:                  76
column_data_compressed_bytes:          28
column_data_uncompressed_bytes:        2
column_marks_bytes:                    48
```

**另请参阅**

* [MergeTree 系列表引擎](../../engines/table-engines/mergetree-family/mergetree.md)
* [计算 Compact 和 Wide 分区片段的数量和大小](/knowledgebase/count-parts-by-type)
