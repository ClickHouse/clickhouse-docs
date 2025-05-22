
# system.moves

该表包含关于正在进行的 [data part moves](/sql-reference/statements/alter/partition#move-partitionpart) 的信息，适用于 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 表。每个数据部分的移动由一行表示。

列：

- `database` ([String](/sql-reference/data-types/string.md)) — 数据库的名称。

- `table` ([String](/sql-reference/data-types/string.md)) — 包含移动数据部分的表名称。

- `elapsed` ([Float64](../../sql-reference/data-types/float.md)) — 自数据部分移动开始以来经过的时间（单位：秒）。

- `target_disk_name` ([String](disks.md)) — 数据部分正在移动到的 [disk](/operations/system-tables/disks/) 名称。

- `target_disk_path` ([String](disks.md)) — 文件系统中 [disk](/operations/system-tables/disks/) 的挂载点路径。

- `part_name` ([String](/sql-reference/data-types/string.md)) — 被移动的数据部分名称。

- `part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 数据部分大小。

- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 执行移动操作的线程标识符。

**示例**

```sql
SELECT * FROM system.moves
```

```response
┌─database─┬─table─┬─────elapsed─┬─target_disk_name─┬─target_disk_path─┬─part_name─┬─part_size─┬─thread_id─┐
│ default  │ test2 │ 1.668056039 │ s3               │ ./disks/s3/      │ all_3_3_0 │       136 │    296146 │
└──────────┴───────┴─────────────┴──────────────────┴──────────────────┴───────────┴───────────┴───────────┘
```

**另请参见**

- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 表引擎
- [使用多个块设备进行数据存储](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)
- [ALTER TABLE ... MOVE PART](/sql-reference/statements/alter/partition#move-partitionpart) 命令
