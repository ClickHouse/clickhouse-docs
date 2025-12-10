---
description: '包含 MergeTree 表各数据部分及其列信息的系统表。'
keywords: ['系统表', 'parts_columns']
slug: /operations/system-tables/parts_columns
title: 'system.parts_columns'
doc_type: 'reference'
---

# system.parts&#95;columns {#systemparts&#95;columns}

包含 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的各个数据 part 及其列的信息。

每一行对应一个数据 part。

列：

* `partition` ([String](../../sql-reference/data-types/string.md)) — 分区名称。若要了解什么是分区，请参见 [ALTER](/sql-reference/statements/alter) 语句的说明。

  格式：

  * `YYYYMM` 表示按月自动分区。
  * `any_string` 表示手动指定分区。

* `name` ([String](../../sql-reference/data-types/string.md)) — 数据部分的名称。

* `part_type` ([String](../../sql-reference/data-types/string.md)) — 数据片段的存储格式。

  可能的值：

  * `Wide` — 在文件系统中，每一列都存储在单独的文件中。
  * `Compact` — 在文件系统中，所有列都存储在同一个文件中。

    数据存储格式由 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 设置项控制。

* `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 指示数据片段是否处于活动状态的标志。如果数据片段处于活动状态，则会在表中使用；否则会被删除。合并后，非活动数据片段会保留。

* `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 标记数。要估算一个数据部分中的大致行数，将 `marks` 乘以索引粒度（通常为 8192）（对于自适应粒度，此提示不适用）。

* `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 行数。

* `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 所有数据部分文件的总大小（以字节为单位）。

* `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 数据分片中压缩数据的总大小。不包括所有辅助文件（例如标记文件）。

* `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 数据部分中未压缩数据的总大小。不包括所有辅助文件（例如标记文件）。

* `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `marks` 文件的大小。

* `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 存放数据部分的目录的修改时间。通常对应于该数据部分的创建时间。

* `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 数据片段变为非活跃状态的时间。

* `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 数据部分被引用的次数。值大于 2 表示该数据部分正在被查询或参与合并。

* `min_date` ([Date](../../sql-reference/data-types/date.md)) — 数据部分中日期键的最小值。

* `max_date` ([Date](../../sql-reference/data-types/date.md)) — 该数据片段中日期键的最大值。

* `partition_id` ([String](../../sql-reference/data-types/string.md)) — 分区 ID。

* `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 合并后构成当前数据部分的源数据部分的最小编号。

* `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 合并后构成当前数据片段的所有数据片段中编号的最大值。

* `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 合并树的深度。0 表示当前数据片段是由插入生成的，而不是通过合并其他片段生成的。

* `data_version`（[UInt64](../../sql-reference/data-types/int-uint.md)）— 用于确定应对数据分片应用哪些变更的数字（会应用版本号高于当前 `data_version` 的变更）。

* `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 主键值在内存中占用的字节数。

* `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 为主键值分配的内存字节数。

* `database` ([String](../../sql-reference/data-types/string.md)) — 数据库名称。

* `table` ([String](../../sql-reference/data-types/string.md)) — 表的名称。

* `engine` ([String](../../sql-reference/data-types/string.md)) — 不带参数的表引擎的名称。

* `disk_name` ([String](../../sql-reference/data-types/string.md)) — 用于存储数据部分的磁盘名称。

* `path` ([String](../../sql-reference/data-types/string.md)) — 存放数据分片文件的文件夹的绝对路径。

* `column` ([String](../../sql-reference/data-types/string.md)) — 列名称。

* `type` ([String](../../sql-reference/data-types/string.md)) — 列的数据类型。

* `column_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列在表中的序号，从 1 开始。

* `default_kind`（[String](../../sql-reference/data-types/string.md)）— 默认值所使用的表达式类型（`DEFAULT`、`MATERIALIZED`、`ALIAS`），如果未定义则为空字符串。

* `default_expression` ([String](../../sql-reference/data-types/string.md)) — 默认值表达式；如果未定义，则为空字符串。

* `column_bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列在磁盘上的总大小，单位为字节。

* `column_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列中压缩数据的总大小，以字节为单位。

* `column_data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列中解压缩后数据的总大小（以字节为单位）。

* `column_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列标记数据的大小（字节）。

* `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `bytes_on_disk` 的别名。

* `marks_size`（[UInt64](../../sql-reference/data-types/int-uint.md)）— `marks_bytes` 的别名。

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
