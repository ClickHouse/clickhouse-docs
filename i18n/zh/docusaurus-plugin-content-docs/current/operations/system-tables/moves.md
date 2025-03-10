---
description: '包含关于正在进行的数据分片移动的系统表信息。每个数据分片移动由单行表示。'
slug: /operations/system-tables/moves
title: 'system.moves'
keywords: ['system table', 'moves']
---

该表包含有关 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 表的正在进行的 [数据分片移动](/sql-reference/statements/alter/partition#move-partitionpart) 的信息。每个数据分片移动由单行表示。

列：

- `database` ([String](/sql-reference/data-types/string.md)) — 数据库名称。

- `table` ([String](/sql-reference/data-types/string.md)) — 包含正在移动数据分片的表名称。

- `elapsed` ([Float64](../../sql-reference/data-types/float.md)) — 自数据分片移动开始以来经过的时间（以秒为单位）。

- `target_disk_name` ([String](disks.md)) — 数据分片正在移动到的 [磁盘](/operations/system-tables/disks/) 的名称。

- `target_disk_path` ([String](disks.md)) — 文件系统中 [磁盘](/operations/system-tables/disks/) 的挂载点路径。

- `part_name` ([String](/sql-reference/data-types/string.md)) — 正在移动的数据分片名称。

- `part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 数据分片大小。

- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 执行移动的线程标识符。

**示例**

```sql
SELECT * FROM system.moves
```

```response
┌─database─┬─table─┬─────elapsed─┬─target_disk_name─┬─target_disk_path─┬─part_name─┬─part_size─┬─thread_id─┐
│ default  │ test2 │ 1.668056039 │ s3               │ ./disks/s3/      │ all_3_3_0 │       136 │    296146 │
└──────────┴───────┴─────────────┴──────────────────┴──────────────────┴───────────┴───────────┴───────────┘
```

**另请参阅**

- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) 表引擎
- [使用多个块设备进行数据存储](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)
- [ALTER TABLE ... MOVE PART](/sql-reference/statements/alter/partition#move-partitionpart) 命令
