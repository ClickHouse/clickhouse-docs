---
description: '系统表，包含服务器已知的每个表的元数据。'
slug: /operations/system-tables/tables
title: 'system.tables'
keywords: ['system table', 'tables']
---

包含服务器已知的每个表的元数据。

[Detached](../../sql-reference/statements/detach.md) 表不会显示在 `system.tables` 中。

[Temporary tables](../../sql-reference/statements/create/table.md#temporary-tables) 仅在其被创建的会话中可见于 `system.tables` 中。它们的 `database` 字段为空，同时 `is_temporary` 标志被设置为开启。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。

- `name` ([String](../../sql-reference/data-types/string.md)) — 表名。

- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 表的 uuid（原子数据库）。

- `engine` ([String](../../sql-reference/data-types/string.md)) — 表引擎名称（不带参数）。

- `is_temporary` ([UInt8](../../sql-reference/data-types/int-uint.md)) - 指示表是否为临时的标志。

- `data_paths` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 文件系统中表数据的路径。

- `metadata_path` ([String](../../sql-reference/data-types/string.md)) - 文件系统中表元数据的路径。

- `metadata_modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - 表元数据的最新修改时间。

- `metadata_version` ([Int32](../../sql-reference/data-types/int-uint.md)) - ReplicatedMergeTree 表的元数据版本，非 ReplicatedMergeTree 表为 0。

- `dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 数据库依赖。

- `dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 表依赖（当前表的 [materialized views](/sql-reference/statements/create/view#materialized-view)）。

- `create_table_query` ([String](../../sql-reference/data-types/string.md)) - 用于创建表的查询。

- `engine_full` ([String](../../sql-reference/data-types/string.md)) - 表引擎的参数。

- `as_select` ([String](../../sql-reference/data-types/string.md)) - 用于视图的 `SELECT` 查询。

- `partition_key` ([String](../../sql-reference/data-types/string.md)) - 表中指定的分区键表达式。

- `sorting_key` ([String](../../sql-reference/data-types/string.md)) - 表中指定的排序键表达式。

- `primary_key` ([String](../../sql-reference/data-types/string.md)) - 表中指定的主键表达式。

- `sampling_key` ([String](../../sql-reference/data-types/string.md)) - 表中指定的采样键表达式。

- `storage_policy` ([String](../../sql-reference/data-types/string.md)) - 存储策略：

    - [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)
    - [Distributed](/engines/table-engines/special/distributed)

- `total_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 总行数，如果可以快速确定表中行的确切数量，则返回该值，否则返回 `NULL`（包括底层的 `Buffer` 表）。

- `total_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 总字节数，如果可以快速确定存储中表的确切字节数，则返回该值，否则返回 `NULL`（不包括任何底层存储）。

    - 如果表将数据存储在磁盘上，则返回磁盘上使用的空间（即压缩的）。
    - 如果表将数据存储在内存中，则返回使用的字节数的近似值。

- `total_bytes_uncompressed` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 总未压缩字节数，如果可以快速确定来自表在存储中所有分片校验和的确切字节数，则返回该值，否则返回 `NULL`（不考虑底层存储（如果有））。

- `lifetime_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 自服务器启动以来插入的总行数（仅适用于 `Buffer` 表）。

- `lifetime_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 自服务器启动以来插入的总字节数（仅适用于 `Buffer` 表）。

- `comment` ([String](../../sql-reference/data-types/string.md)) - 表的注释。

- `has_own_data` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 指示表本身是否在磁盘上存储某些数据或仅访问其他来源的标志。

- `loading_dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 数据库加载依赖（应在当前对象之前加载的对象列表）。

- `loading_dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 表加载依赖（应在当前对象之前加载的对象列表）。

- `loading_dependent_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 依赖加载的数据库。

- `loading_dependent_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 依赖加载的表。

`system.tables` 表用于 `SHOW TABLES` 查询的实现。

**示例**

```sql
SELECT * FROM system.tables LIMIT 2 FORMAT Vertical;
```

```text
Row 1:
──────
database:                   base
name:                       t1
uuid:                       81b1c20a-b7c6-4116-a2ce-7583fb6b6736
engine:                     MergeTree
is_temporary:               0
data_paths:                 ['/var/lib/clickhouse/store/81b/81b1c20a-b7c6-4116-a2ce-7583fb6b6736/']
metadata_path:              /var/lib/clickhouse/store/461/461cf698-fd0b-406d-8c01-5d8fd5748a91/t1.sql
metadata_modification_time: 2021-01-25 19:14:32
dependencies_database:      []
dependencies_table:         []
create_table_query:         CREATE TABLE base.t1 (`n` UInt64) ENGINE = MergeTree ORDER BY n SETTINGS index_granularity = 8192
engine_full:                MergeTree ORDER BY n SETTINGS index_granularity = 8192
as_select:                  SELECT database AS table_catalog
partition_key:
sorting_key:                n
primary_key:                n
sampling_key:
storage_policy:             default
total_rows:                 1
total_bytes:                99
lifetime_rows:              ᴺᵁᴸᴸ
lifetime_bytes:             ᴺᵁᴸᴸ
comment:
has_own_data:               0
loading_dependencies_database: []
loading_dependencies_table:    []
loading_dependent_database:    []
loading_dependent_table:       []

Row 2:
──────
database:                   default
name:                       53r93yleapyears
uuid:                       00000000-0000-0000-0000-000000000000
engine:                     MergeTree
is_temporary:               0
data_paths:                 ['/var/lib/clickhouse/data/default/53r93yleapyears/']
metadata_path:              /var/lib/clickhouse/metadata/default/53r93yleapyears.sql
metadata_modification_time: 2020-09-23 09:05:36
dependencies_database:      []
dependencies_table:         []
create_table_query:         CREATE TABLE default.`53r93yleapyears` (`id` Int8, `febdays` Int8) ENGINE = MergeTree ORDER BY id SETTINGS index_granularity = 8192
engine_full:                MergeTree ORDER BY id SETTINGS index_granularity = 8192
as_select:                  SELECT name AS catalog_name
partition_key:
sorting_key:                id
primary_key:                id
sampling_key:
storage_policy:             default
total_rows:                 2
total_bytes:                155
lifetime_rows:              ᴺᵁᴸᴸ
lifetime_bytes:             ᴺᵁᴸᴸ
comment:
has_own_data:               0
loading_dependencies_database: []
loading_dependencies_table:    []
loading_dependent_database:    []
loading_dependent_table:       []
```
