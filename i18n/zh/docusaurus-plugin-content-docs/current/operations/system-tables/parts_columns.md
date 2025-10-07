---
'description': '系统表，包含MergeTree表的分区片段和列的信息。'
'keywords':
- 'system table'
- 'parts_columns'
'slug': '/operations/system-tables/parts_columns'
'title': 'system.parts_columns'
'doc_type': 'reference'
---


# system.parts_columns

包含有关 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的部分和列的信息。

每一行描述一个数据部分。

列：

- `partition` ([String](../../sql-reference/data-types/string.md)) — 分区名称。要了解分区是什么，请参见 [ALTER](/sql-reference/statements/alter) 查询的描述。

    格式：

  - `YYYYMM` 用于按月自动分区。
  - `any_string` 用于手动分区。

- `name` ([String](../../sql-reference/data-types/string.md)) — 数据部分的名称。

- `part_type` ([String](../../sql-reference/data-types/string.md)) — 存储数据部分的格式。

    可能的值：

  - `Wide` — 每列在文件系统中的一个独立文件中存储。
  - `Compact` — 所有列在文件系统中的一个文件中存储。

    数据存储格式由 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 设置控制。

- `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 表示数据部分是否处于活动状态的标志。如果数据部分处于活动状态，则用于表中。否则，将被删除。在合并后，非活动数据部分仍然存在。

- `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 标记的数量。要获取数据部分中的大致行数，请将 `marks` 乘以索引粒度（通常是 8192）（此提示不适用于自适应粒度）。

- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 行数。

- `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 所有数据部分文件的总大小（以字节为单位）。

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 数据部分中压缩数据的总大小。所有辅助文件（例如，标记文件）不包括在内。

- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 数据部分中未压缩数据的总大小。所有辅助文件（例如，标记文件）不包括在内。

- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 标记文件的大小。

- `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 数据部分目录修改的时间。这通常对应于数据部分创建的时间。

- `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 数据部分变为非活动状态的时间。

- `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 数据部分使用的位置数量。大于 2 的值表示数据部分在查询或合并中使用。

- `min_date` ([Date](../../sql-reference/data-types/date.md)) — 数据部分中日期键的最小值。

- `max_date` ([Date](../../sql-reference/data-types/date.md)) — 数据部分中日期键的最大值。

- `partition_id` ([String](../../sql-reference/data-types/string.md)) — 分区的 ID。

- `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 合并后构成当前部分的数据部分的最小数量。

- `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 合并后构成当前部分的数据部分的最大数量。

- `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 合并树的深度。零表示当前部分是通过插入创建，而不是通过合并其他部分。

- `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 用于确定应应用于数据部分的哪些变更（版本高于 `data_version` 的变更）。

- `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 主键值占用的内存量（以字节为单位）。

- `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 为主键值保留的内存量（以字节为单位）。

- `database` ([String](../../sql-reference/data-types/string.md)) — 数据库名称。

- `table` ([String](../../sql-reference/data-types/string.md)) — 表名称。

- `engine` ([String](../../sql-reference/data-types/string.md)) — 不带参数的表引擎名称。

- `disk_name` ([String](../../sql-reference/data-types/string.md)) — 存储数据部分的磁盘名称。

- `path` ([String](../../sql-reference/data-types/string.md)) — 数据部分文件夹的绝对路径。

- `column` ([String](../../sql-reference/data-types/string.md)) — 列名称。

- `type` ([String](../../sql-reference/data-types/string.md)) — 列类型。

- `column_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 从 1 开始的列在表中的顺序位置。

- `default_kind` ([String](../../sql-reference/data-types/string.md)) — 默认值的表达式类型（`DEFAULT`，`MATERIALIZED`，`ALIAS`），如果未定义则为空字符串。

- `default_expression` ([String](../../sql-reference/data-types/string.md)) — 默认值的表达式，如果未定义则为空字符串。

- `column_bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列的总大小（以字节为单位）。

- `column_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列中压缩数据的总大小（以字节为单位）。

- `column_data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列中未压缩数据的总大小（以字节为单位）。

- `column_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 包含标记的列的大小（以字节为单位）。

- `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `bytes_on_disk` 的别名。

- `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `marks_bytes` 的别名。

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

**另请参见**

- [MergeTree 家族](../../engines/table-engines/mergetree-family/mergetree.md)
