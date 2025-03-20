---
slug: /operations/system-tables/parts
title: 'system.parts'
keywords: ['system table', 'parts']
---

包含关于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表分部的信息。

每一行描述一个数据部分。

列：

- `partition` ([String](../../sql-reference/data-types/string.md)) – 分区名称。要了解什么是分区，请参阅 [ALTER](/sql-reference/statements/alter) 查询的说明。

    格式：

    - `YYYYMM` 用于按月份进行自动分区。
    - `any_string` 用于手动分区。

- `name` ([String](../../sql-reference/data-types/string.md)) – 数据部分的名称。部分命名结构可用于确定许多数据、摄取和合并模式方面。部分命名格式如下：

```text
<partition_id>_<minimum_block_number>_<maximum_block_number>_<level>_<data_version>
```

* 定义：
     - `partition_id` - 标识分区键
     - `minimum_block_number` - 标识部分中的最小块编号。ClickHouse 始终合并连续块
     - `maximum_block_number` - 标识部分中的最大块编号
     - `level` - 每次额外合并时增加一。0 表示这是一个尚未合并的新部分。重要的是要记住，ClickHouse 中的所有部分始终是不可变的
     - `data_version` - 可选值，在部分发生变更时递增（同样，变更的数据始终只写入新部分，因为部分是不可变的）

- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) - 数据部分的 UUID。

- `part_type` ([String](../../sql-reference/data-types/string.md)) — 数据部分存储格式。

    可选值：

    - `Wide` — 每列保存在文件系统中的单独文件中。
    - `Compact` — 所有列保存在文件系统中的一个文件中。

    数据存储格式由 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 设置控制。

- `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) – 指示数据部分是否处于活动状态的标志。如果数据部分处于活动状态，则在表中使用。否则，已删除。在合并后，非活动的数据部分仍然存在。

- `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 标记数量。要获取数据部分中行的近似数量，请将 `marks` 乘以索引粒度（通常为 8192）（此提示在自适应粒度下不起作用）。

- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 行数。

- `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 数据部分文件的总大小（以字节为单位）。

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 数据部分中压缩数据的总大小。所有辅助文件（例如，带有标记的文件）不包含在内。

- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 数据部分中未压缩数据的总大小。所有辅助文件（例如，带有标记的文件）不包含在内。

- `primary_key_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 磁盘上 primary.idx/cidx 文件中主键值使用的内存量（以字节为单位）。

- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 包含标记的文件的大小。

- `secondary_indices_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 数据部分中二级索引的压缩数据的总大小。所有辅助文件（例如，带有标记的文件）不包含在内。

- `secondary_indices_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 数据部分中二级索引的未压缩数据的总大小。所有辅助文件（例如，带有标记的文件）不包含在内。

- `secondary_indices_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 二级索引的标记文件的大小。

- `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 数据部分目录的修改时间。这通常对应于数据部分创建的时间。

- `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 数据部分变为非活动状态的时间。

- `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) – 数据部分使用的地方数量。大于 2 的值表示数据部分在查询或合并中被使用。

- `min_date` ([Date](../../sql-reference/data-types/date.md)) – 数据部分中日期键的最小值。

- `max_date` ([Date](../../sql-reference/data-types/date.md)) – 数据部分中日期键的最大值。

- `min_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 数据部分中日期和时间键的最小值。

- `max_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 数据部分中日期和时间键的最大值。

- `partition_id` ([String](../../sql-reference/data-types/string.md)) – 分区的 ID。

- `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 合并后组成当前部分的最小数据块编号。

- `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 合并后组成当前部分的最大数据块编号。

- `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) – 合并树的深度。零表示当前部分是通过插入而非合并其他部分创建的。

- `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 用于确定应应用于数据部分的哪些变更的号码（版本高于 `data_version` 的变更）。

- `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 主键值使用的内存量（以字节为单位）。

- `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 为主键值保留的内存量（以字节为单位）。

- `is_frozen` ([UInt8](../../sql-reference/data-types/int-uint.md)) – 显示分区数据备份是否存在的标志。1，备份存在。0，备份不存在。有关更多详细信息，请参阅 [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)

- `database` ([String](../../sql-reference/data-types/string.md)) – 数据库名称。

- `table` ([String](../../sql-reference/data-types/string.md)) – 表名称。

- `engine` ([String](../../sql-reference/data-types/string.md)) – 不带参数的表引擎名称。

- `path` ([String](../../sql-reference/data-types/string.md)) – 数据部分文件夹的绝对路径。

- `disk_name` ([String](../../sql-reference/data-types/string.md)) – 存储数据部分的磁盘名称。

- `hash_of_all_files` ([String](../../sql-reference/data-types/string.md)) – [sipHash128](/sql-reference/functions/hash-functions#siphash128) 的压缩文件。

- `hash_of_uncompressed_files` ([String](../../sql-reference/data-types/string.md)) – [sipHash128](/sql-reference/functions/hash-functions#siphash128) 的未压缩文件（带有标记的文件、索引文件等）。

- `uncompressed_hash_of_compressed_files` ([String](../../sql-reference/data-types/string.md)) – [sipHash128](/sql-reference/functions/hash-functions#siphash128) 的压缩文件中数据的哈希，视为未压缩。

- `delete_ttl_info_min` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE 规则](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl) 的日期和时间键的最小值。

- `delete_ttl_info_max` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE 规则](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl) 的日期和时间键的最大值。

- `move_ttl_info.expression` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 表达式数组。每个表达式定义了一个 [TTL MOVE 规则](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)。

:::note
`move_ttl_info.expression` 数组主要为了向后兼容，现在检查 `TTL MOVE` 规则的最简单方法是使用 `move_ttl_info.min` 和 `move_ttl_info.max` 字段。
:::

- `move_ttl_info.min` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 日期和时间值数组。每个元素描述 [TTL MOVE 规则](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl) 的最小键值。

- `move_ttl_info.max` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 日期和时间值数组。每个元素描述 [TTL MOVE 规则](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl) 的最大键值。

- `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – `bytes_on_disk` 的别名。

- `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – `marks_bytes` 的别名。

**示例**

``` sql
SELECT * FROM system.parts LIMIT 1 FORMAT Vertical;
```

``` text
Row 1:
──────
partition:                             tuple()
name:                                  all_1_4_1_6
part_type:                             Wide
active:                                1
marks:                                 2
rows:                                  6
bytes_on_disk:                         310
data_compressed_bytes:                 157
data_uncompressed_bytes:               91
secondary_indices_compressed_bytes:    58
secondary_indices_uncompressed_bytes:  6
secondary_indices_marks_bytes:         48
marks_bytes:                           144
modification_time:                     2020-06-18 13:01:49
remove_time:                           1970-01-01 00:00:00
refcount:                              1
min_date:                              1970-01-01
max_date:                              1970-01-01
min_time:                              1970-01-01 00:00:00
max_time:                              1970-01-01 00:00:00
partition_id:                          all
min_block_number:                      1
max_block_number:                      4
level:                                 1
data_version:                          6
primary_key_bytes_in_memory:           8
primary_key_bytes_in_memory_allocated: 64
is_frozen:                             0
database:                              default
table:                                 months
engine:                                MergeTree
disk_name:                             default
path:                                  /var/lib/clickhouse/data/default/months/all_1_4_1_6/
hash_of_all_files:                     2d0657a16d9430824d35e327fcbd87bf
hash_of_uncompressed_files:            84950cc30ba867c77a408ae21332ba29
uncompressed_hash_of_compressed_files: 1ad78f1c6843bbfb99a2c931abe7df7d
delete_ttl_info_min:                   1970-01-01 00:00:00
delete_ttl_info_max:                   1970-01-01 00:00:00
move_ttl_info.expression:              []
move_ttl_info.min:                     []
move_ttl_info.max:                     []
```

**另请参阅**

- [MergeTree family](../../engines/table-engines/mergetree-family/mergetree.md)
- [TTL for Columns and Tables](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)
