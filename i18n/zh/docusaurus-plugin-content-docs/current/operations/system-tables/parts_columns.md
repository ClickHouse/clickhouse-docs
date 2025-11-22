---
description: '包含 MergeTree 表数据片段及列信息的系统表。'
keywords: ['system table', 'parts_columns']
slug: /operations/system-tables/parts_columns
title: 'system.parts_columns'
doc_type: 'reference'
---

# system.parts_columns

包含 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的数据部分及其列的信息。

每一行描述一个数据部分。

列：

* `partition` ([String](../../sql-reference/data-types/string.md)) — 分区名称。要了解分区的概念，请参阅 [ALTER](/sql-reference/statements/alter) 查询的说明。

  格式：

  * `YYYYMM` 用于按月自动分区。
  * `any_string` 用于进行手动分区。

* `name` ([String](../../sql-reference/data-types/string.md)) — 数据部分的名称。

* `part_type` ([String](../../sql-reference/data-types/string.md)) — 数据部分的存储格式。

  可选值：

  * `Wide` — 每一列都以单独的文件形式存储在文件系统中。
  * `Compact` — 所有列都存储在文件系统中的同一个文件中。

    数据存储格式由 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 设置控制。

* `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 标志，指示数据部分是否为活动状态。若数据部分为活动状态，则会在表中使用；否则会被删除。合并后会保留非活动的数据部分。

* `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 标记（mark）的数量。要获取某个数据部分中大致的行数，将 `marks` 乘以索引粒度（通常为 8192）（该提示对自适应粒度无效）。

* `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 行数。

* `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 所有数据部分文件的总大小（以字节计）。

* `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 数据分片中压缩数据的总大小。不包括任何辅助文件（例如标记文件）。

* `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 数据部分中未压缩数据的总大小。不包括任何辅助文件（例如标记文件）。

* `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 包含标记的文件的大小。

* `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 数据部分所在目录的修改时间。通常与该数据部分的创建时间相对应。

* `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 数据分片变为非活动状态的时间。

* `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 数据分片被引用或使用的位置数量。值大于 2 表示该数据分片正被查询或合并操作使用。

* `min_date` ([Date](../../sql-reference/data-types/date.md)) — 数据部分中日期键的最小值。

* `max_date` ([Date](../../sql-reference/data-types/date.md)) — 数据分片中日期键的最大日期值。

* `partition_id` ([String](../../sql-reference/data-types/string.md)) — 分区 ID。

* `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 合并生成当前部分的所有数据部分中最小的块编号。

* `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 合并后构成当前数据部分的数据片段中最大的编号。

* `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 合并树的深度。0 表示当前数据片段是通过插入生成的，而不是由合并其他数据片段生成的。

* `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 用于确定应对数据分片应用哪些变更的数字（会应用那些版本号高于 `data_version` 的变更）。

* `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 主键值在内存中占用的字节数。

* `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 为主键值预留的内存量（以字节为单位）。

* `database` ([String](../../sql-reference/data-types/string.md)) — 数据库名称。

* `table` ([String](../../sql-reference/data-types/string.md)) — 表的名称。

* `engine` ([String](../../sql-reference/data-types/string.md)) — 表引擎名称（不含参数）。

* `disk_name` ([String](../../sql-reference/data-types/string.md)) — 存储该数据部分的磁盘名称。

* `path` ([String](../../sql-reference/data-types/string.md)) — 数据分片文件所在目录的绝对路径。

* `column` ([String](../../sql-reference/data-types/string.md)) — 列名。

* `type` ([String](../../sql-reference/data-types/string.md)) — 列的数据类型。

* `column_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列在表中的序号，从 1 开始计数。

* `default_kind`（[String](../../sql-reference/data-types/string.md)）— 表示默认值的表达式类型（`DEFAULT`、`MATERIALIZED`、`ALIAS`），如果未定义则为空字符串。

* `default_expression` ([String](../../sql-reference/data-types/string.md)) — 默认值表达式，如果未定义，则为空字符串。

* `column_bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列在磁盘上的总字节数。

* `column_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列中压缩数据的总大小（以字节为单位）。

* `column_data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列中解压缩后数据的总大小（以字节为单位）。

* `column_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 标记列的大小，以字节为单位。

* `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 是 `bytes_on_disk` 的别名。

* `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 是 `marks_bytes` 的别名。

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
