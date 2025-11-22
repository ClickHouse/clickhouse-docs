---
description: '包含 MergeTree 部件信息的系统表'
keywords: ['系统表', '部件']
slug: /operations/system-tables/parts
title: 'system.parts'
doc_type: 'reference'
---

# system.parts

包含关于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表各个数据分片的信息。

每一行描述一个数据分片。

列：

* `partition` ([String](../../sql-reference/data-types/string.md)) – 分区名称。要了解什么是分区，请参阅 [ALTER](/sql-reference/statements/alter) 查询的说明。

  格式：

  * `YYYYMM` 表示按月自动分区。
  * `any_string` 表示手动分区。

* `name` ([String](../../sql-reference/data-types/string.md)) – 数据分片名称。分片命名结构可用于确定数据、写入与合并模式的诸多方面。分片命名格式如下：

```text
<partition_id>_<minimum_block_number>_<maximum_block_number>_<level>_<data_version>
```

* 定义：
  * `partition_id` - 标识分区键
  * `minimum_block_number` - 标识该 part 中的最小块号。ClickHouse 始终合并连续编号的块
  * `maximum_block_number` - 标识该 part 中的最大块号
  * `level` - 每在该 part 上执行一次额外合并就加 1。值为 0 表示这是一个尚未被合并的新 part。需要牢记的是，ClickHouse 中的所有 part 始终是不可变的
  * `data_version` - 可选值，在 part 被变更（mutation）时递增（同样，变更后的数据始终只会写入新的 part，因为 part 是不可变的）


* `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) -  数据部分的 UUID。

* `part_type` ([String](../../sql-reference/data-types/string.md)) — 数据分片的存储格式。

  可能的值：

  * `Wide` — 每一列都在文件系统中存储为单独的文件。
  * `Compact` — 所有列都存储在文件系统中的同一个文件中。

    数据存储格式由 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表的 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 两个设置控制。

* `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) – 标志，指示数据部分是否处于激活状态。若数据部分处于激活状态，则会在表中使用；否则会被删除。未激活的数据部分在合并后仍会保留。

* `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 标记数量。要获得某个数据部分中大致的行数，将 `marks` 乘以索引粒度（通常为 8192）（此方法不适用于自适应粒度）。

* `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 行数。

* `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 所有数据部分文件的总大小（字节）。

* `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 数据分片中压缩数据的总大小。不包括辅助文件（例如标记文件）。

* `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 数据分片中未压缩数据的总大小。不包括任何辅助文件（例如标记文件）。

* `primary_key_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 磁盘上 primary.idx/cidx 文件中主键值占用的内存量（字节）。

* `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 标记文件的大小。

* `secondary_indices_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 数据分片中二级索引压缩数据的总大小。不包括所有辅助文件（例如标记文件）。

* `secondary_indices_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 数据部分中二级索引未压缩数据的总大小。不包括任何辅助文件（例如标记文件）。

* `secondary_indices_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 存储二级索引标记的文件大小。

* `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 数据部分所在目录的修改时间。通常对应于数据部分的创建时间。

* `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 数据部分变为非活动状态的时间。

* `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) – 数据部分被使用的位置数。值大于 2 表示该数据部分正在被查询或合并操作使用。

* `min_date` ([Date](../../sql-reference/data-types/date.md)) – 数据片段中日期键的最小值。

* `max_date` ([Date](../../sql-reference/data-types/date.md)) – 数据部分中日期键的最大值。

* `min_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 数据部分中日期时间键的最小值。

* `max_time`([DateTime](../../sql-reference/data-types/datetime.md)) – 数据片段中日期时间键的最大值。

* `partition_id` ([String](../../sql-reference/data-types/string.md)) – 分区 ID。

* `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 合并后构成当前分片的数据块中最小的块号。

* `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 合并后构成当前数据部分的最大数据块编号。

* `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) – 合并树的深度。零表示当前数据分片是通过插入生成的，而不是通过合并其他分片生成的。

* `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 用于确定需要对该数据片段应用哪些变更的编号（版本号高于 `data_version` 的变更）。

* `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 主键值在内存中所占用的字节数（当 `primary_key_lazy_load=1` 且 `use_primary_key_cache=1` 时为 `0`）。

* `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 为主键值分配的内存大小（以字节为单位）（当 `primary_key_lazy_load=1` 且 `use_primary_key_cache=1` 时，该值为 `0`）。

* `is_frozen` ([UInt8](../../sql-reference/data-types/int-uint.md)) – 标记，用于指示分区数据备份是否存在。1 表示备份存在，0 表示备份不存在。更多信息请参阅 [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)

* `database` ([String](../../sql-reference/data-types/string.md)) – 数据库名称。

* `table` ([String](../../sql-reference/data-types/string.md)) – 表的名称。

* `engine` ([String](../../sql-reference/data-types/string.md)) – 表引擎的名称，不含参数。

* `path` ([String](../../sql-reference/data-types/string.md)) – 包含数据分片文件的文件夹的绝对路径。

* `disk_name` ([String](../../sql-reference/data-types/string.md)) – 存储该数据部分的磁盘名称。

* `hash_of_all_files` ([String](../../sql-reference/data-types/string.md)) – 所有压缩文件的 [sipHash128](/sql-reference/functions/hash-functions#sipHash128) 哈希值。

* `hash_of_uncompressed_files` ([String](../../sql-reference/data-types/string.md)) – 未压缩文件（带有标记的文件、索引文件等）的 [sipHash128](/sql-reference/functions/hash-functions#sipHash128) 哈希值。

* `uncompressed_hash_of_compressed_files` ([String](../../sql-reference/data-types/string.md)) – 将压缩文件中的数据视作未压缩时计算得到的 [sipHash128](/sql-reference/functions/hash-functions#sipHash128) 哈希值。

* `delete_ttl_info_min` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE 规则](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)中日期时间键的最小值。

* `delete_ttl_info_max` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE 规则](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)中日期时间键的最大值。

* `move_ttl_info.expression` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 由表达式组成的数组。数组中的每个表达式都定义一个 [TTL MOVE 规则](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)。

:::note
数组 `move_ttl_info.expression` 主要是为了兼容历史版本而保留，现在检查 `TTL MOVE` 规则最简单的方法是使用 `move_ttl_info.min` 和 `move_ttl_info.max` 字段。
:::

* `move_ttl_info.min` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 日期和时间值的数组。数组中的每个元素表示[TTL MOVE 规则](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)的最小键值。

* `move_ttl_info.max` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 日期和时间值的数组。数组中的每个元素表示[TTL MOVE 规则](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)的最大键值。

* `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – `bytes_on_disk` 的别名。

* `marks_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – `marks_bytes` 的别名。

**示例**

```sql
SELECT * FROM system.parts LIMIT 1 FORMAT Vertical;
```

```text
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

* [MergeTree 系列表引擎](../../engines/table-engines/mergetree-family/mergetree.md)
* [列和表的 TTL](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)
