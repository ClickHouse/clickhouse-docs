---
description: '包含 MergeTree 数据分片信息的 system 表'
keywords: ['system 表', '数据分片']
slug: /operations/system-tables/parts
title: 'system.parts'
doc_type: 'reference'
---

# system.parts \\{#systemparts\\}

包含关于 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表数据分片（parts）的信息。

每一行描述一个数据分片。

列：

* `partition` ([String](../../sql-reference/data-types/string.md)) – 分区名称。要了解什么是分区，请参阅 [ALTER](/sql-reference/statements/alter) 查询的说明。

  格式：

  * `YYYYMM`：按月自动分区。
  * `any_string`：手动分区时使用任意字符串。

* `name` ([String](../../sql-reference/data-types/string.md)) – 数据分片名称。分片命名结构可用于判断数据、摄取以及合并模式等多个方面。分片命名格式如下：

```text
<partition_id>_<minimum_block_number>_<maximum_block_number>_<level>_<data_version>
```

* 定义：
  * `partition_id` - 标识分区 ID
  * `minimum_block_number` - 标识该 part 中的最小块号。ClickHouse 始终合并连续的块
  * `maximum_block_number` - 标识该 part 中的最大块号
  * `level` - 每对该 part 进行一次合并，该值加一。level 为 0 表示这是一个尚未被合并的新 part。需要牢记的是，ClickHouse 中的所有 part 始终都是不可变的
  * `data_version` - 可选值，在对 part 执行 mutate 操作时递增（同样，变更后的数据始终只会写入新的 part，因为 part 是不可变的）

* `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) - 数据部件的 UUID。

* `part_type` ([String](../../sql-reference/data-types/string.md)) — 数据部分的存储格式。

  可选值：

  * `Wide` — 每一列都作为单独的文件存储在文件系统中。
  * `Compact` — 所有列都存储在文件系统中的同一个文件中。

    数据存储格式由 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 表中的 `min_bytes_for_wide_part` 和 `min_rows_for_wide_part` 设置项控制。

* `active` ([UInt8](../../sql-reference/data-types/int-uint.md)) – 指示数据部分是否处于活动状态的标志位。处于活动状态的数据部分会在表中被使用，否则会被删除。合并后，非活动的数据部分仍会保留。

* `marks` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 标记数量。要获得一个数据部分中大致的行数，将 `marks` 乘以索引粒度（通常为 8192）（此提示不适用于自适应粒度）。

* `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 行数。

* `bytes_on_disk` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 所有数据部分文件的总大小（字节）。

* `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 数据分片中压缩数据的总大小。不包含任何辅助文件（例如标记文件）。

* `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 数据片段中未压缩数据的总大小。不包括所有辅助文件（例如标记文件）。

* `primary_key_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 磁盘上 primary.idx/cidx 文件中主键值所占用的字节数。

* `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 标记文件的大小（字节）。

* `secondary_indices_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 数据部分中二级索引压缩数据的总大小。不包括任何辅助文件（例如标记文件）。

* `secondary_indices_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 数据部分中二级索引未压缩数据的总大小。不包括任何辅助文件（例如标记文件）。

* `secondary_indices_marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 二级索引标记文件的大小（字节数）。

* `modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 数据部分所在目录的修改时间。该时间通常对应于数据部分的创建时间。

* `remove_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 数据片段变为非活跃状态的时间。

* `refcount` ([UInt32](../../sql-reference/data-types/int-uint.md)) – 该数据分片被使用的引用次数。大于 2 的值表示该数据分片正被查询或合并操作使用。

* `min_date` ([Date](../../sql-reference/data-types/date.md)) – 数据片段中日期键的最小值。

* `max_date` ([Date](../../sql-reference/data-types/date.md)) – 数据部分中日期键的最大值。

* `min_time` ([DateTime](../../sql-reference/data-types/datetime.md)) – 数据部分中日期时间键的最小值。

* `max_time`([DateTime](../../sql-reference/data-types/datetime.md)) – 数据部分中日期时间键的最大值。

* `partition_id` ([String](../../sql-reference/data-types/string.md)) – 分区 ID。

* `min_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 合并后构成当前部分的数据块的最小编号。

* `max_block_number` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 合并后构成当前数据片段的最大数据块编号。

* `level` ([UInt32](../../sql-reference/data-types/int-uint.md)) – 合并树的层级深度。零表示当前数据部件是通过插入创建的，而不是由其他部件合并得到的。

* `data_version` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 用于确定应对该数据部分应用哪些变更（会应用版本号高于当前 `data_version` 的变更）的数字。

* `primary_key_bytes_in_memory` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 内存中主键值占用的字节数（当 `primary_key_lazy_load=1` 且 `use_primary_key_cache=1` 时，该值为 `0`）。

* `primary_key_bytes_in_memory_allocated` ([UInt64](../../sql-reference/data-types/int-uint.md)) – 为主键值预留的内存大小（以字节为单位，当 `primary_key_lazy_load=1` 且 `use_primary_key_cache=1` 时，该值为 `0`）。

* `is_frozen` ([UInt8](../../sql-reference/data-types/int-uint.md)) – 标志位，表示是否存在该分区的数据备份。1 表示备份存在，0 表示备份不存在。更多详情请参见 [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)

* `database` ([String](../../sql-reference/data-types/string.md)) – 数据库名称。

* `table` ([String](../../sql-reference/data-types/string.md)) – 表名。

* `engine` ([String](../../sql-reference/data-types/string.md)) – 表引擎的名称，不含参数。

* `path` ([String](../../sql-reference/data-types/string.md)) – 包含数据部分文件的文件夹的绝对路径。

* `disk_name` ([String](../../sql-reference/data-types/string.md)) – 用于存储该数据部分的磁盘名称。

* `hash_of_all_files` ([String](../../sql-reference/data-types/string.md)) – 压缩文件的 [sipHash128](/sql-reference/functions/hash-functions#sipHash128) 哈希值。

* `hash_of_uncompressed_files`（[String](../../sql-reference/data-types/string.md)）– 未压缩文件（标记文件、索引文件等）的 [sipHash128](/sql-reference/functions/hash-functions#sipHash128) 哈希值。

* `uncompressed_hash_of_compressed_files` ([String](../../sql-reference/data-types/string.md)) – 将压缩文件中的数据视为未压缩时所计算的 [sipHash128](/sql-reference/functions/hash-functions#sipHash128) 哈希值。

* `delete_ttl_info_min` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE 规则](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl) 中日期时间键的最小值。

* `delete_ttl_info_max` ([DateTime](../../sql-reference/data-types/datetime.md)) — [TTL DELETE 规则](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)的日期时间键的最大值。

* `move_ttl_info.expression` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 由表达式组成的数组。每个表达式都定义一条 [TTL MOVE 规则](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)。

:::note
`move_ttl_info.expression` 数组主要是为了向后兼容而保留，现在检查 `TTL MOVE` 规则最简单的方式是使用 `move_ttl_info.min` 和 `move_ttl_info.max` 字段。
:::

* `move_ttl_info.min` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 日期和时间值的数组。每个元素表示 [TTL MOVE 规则](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)的最小键值。

* `move_ttl_info.max` ([Array](../../sql-reference/data-types/array.md)([DateTime](../../sql-reference/data-types/datetime.md))) — 日期和时间值的数组。每个元素表示 [TTL MOVE 规则](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)的最大键值。

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

* [MergeTree 系列](../../engines/table-engines/mergetree-family/mergetree.md)
* [列和表的 TTL](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-ttl)
