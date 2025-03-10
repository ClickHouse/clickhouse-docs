---
description: '系统表包含有关已执行删除表操作的信息，但尚未执行数据清理'
slug: /operations/system-tables/dropped_tables
title: 'system.dropped_tables'
keywords: ['system table', 'dropped_tables']
---

包含有关已执行删除表操作的信息，但尚未执行数据清理。

列：

- `index` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 标记的 deleted_tables 队列中的索引。
- `database` ([String](../../sql-reference/data-types/string.md)) — 数据库。
- `table` ([String](../../sql-reference/data-types/string.md)) — 表名。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 表的 uuid。
- `engine` ([String](../../sql-reference/data-types/string.md)) — 表引擎名称。
- `metadata_dropped_path` ([String](../../sql-reference/data-types/string.md)) — 元数据删除目录中表的元数据文件路径。
- `table_dropped_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 下一个计划删除表数据的时间。通常是在表被删除时加上 `database_atomic_delay_before_drop_table_sec` 的时间。

**示例**

以下示例展示如何获取关于 `dropped_tables` 的信息。

``` sql
SELECT *
FROM system.dropped_tables\G
```

``` text
行 1:
──────
index:                 0
database:              default
table:                 test
uuid:                  03141bb2-e97a-4d7c-a172-95cc066bb3bd
engine:                MergeTree
metadata_dropped_path: /data/ClickHouse/build/programs/data/metadata_dropped/default.test.03141bb2-e97a-4d7c-a172-95cc066bb3bd.sql
table_dropped_time:    2023-03-16 23:43:31
```
