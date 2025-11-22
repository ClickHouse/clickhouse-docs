---
description: '包含服务器已知的所有表元数据的系统表。'
keywords: ['系统表', '表']
slug: /operations/system-tables/tables
title: 'system.tables'
doc_type: 'reference'
---

# system.tables

包含服务器已知的每个表的元数据。

[Detached](../../sql-reference/statements/detach.md) 表不会出现在 `system.tables` 中。

[Temporary tables](../../sql-reference/statements/create/table.md#temporary-tables) 仅在创建它们的会话中会在 `system.tables` 中可见。它们显示时 `database` 字段为空，并且 `is_temporary` 标志被设置为启用。

Columns:

* `database` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。

* `name` ([String](../../sql-reference/data-types/string.md)) — 表名。

* `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — Atomic 数据库中的 uuid 表。

* `engine` ([String](../../sql-reference/data-types/string.md)) — 表的引擎名称（不含参数）。

* `is_temporary` ([UInt8](../../sql-reference/data-types/int-uint.md)) - 标志，用于指示该表是否为临时表。

* `data_paths` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 表数据在文件系统中的路径。

* `metadata_path` ([String](../../sql-reference/data-types/string.md)) - 文件系统中表元数据的路径。

* `metadata_modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - 表的元数据最近一次修改的时间。

* `metadata_version` ([Int32](../../sql-reference/data-types/int-uint.md)) - ReplicatedMergeTree 表的元数据版本，非 ReplicatedMergeTree 表则为 0。

* `dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 所依赖的数据库。

* `dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 表的依赖对象（基于当前表创建的[物化视图](/sql-reference/statements/create/view#materialized-view)）。

* `create_table_query` ([String](../../sql-reference/data-types/string.md)) - 用于创建该表的查询语句。

* `engine_full` ([String](../../sql-reference/data-types/string.md)) - 表引擎参数。

* `as_select` ([String](../../sql-reference/data-types/string.md)) - 该视图的 `SELECT` 查询。

* `parameterized_view_parameters` ([Array](../../sql-reference/data-types/array.md) of [Tuple](../../sql-reference/data-types/tuple.md)) — 参数化视图的参数。

* `partition_key` ([String](../../sql-reference/data-types/string.md)) - 在表中指定的分区键表达式。

* `sorting_key` ([String](../../sql-reference/data-types/string.md)) - 在表中指定的排序键表达式。

* `primary_key` ([String](../../sql-reference/data-types/string.md)) - 在表中指定的主键表达式。

* `sampling_key` ([String](../../sql-reference/data-types/string.md)) - 在表中指定的采样键表达式。

* `storage_policy` ([String](../../sql-reference/data-types/string.md)) - 存储策略：

  * [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)
  * [Distributed](/engines/table-engines/special/distributed)

* `total_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 如果可以快速确定表中的精确行数，则为总行数，否则为 `NULL`（包括其底层的 `Buffer` 表在内）。

* `total_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 字节总数（包括索引和投影）。如果能够快速确定存储中该表精确的字节数，则返回该值，否则为 `NULL`（不包括任何底层存储的占用）。

  * 如果表将数据存储在磁盘上，则返回磁盘上已使用的空间（即压缩后的大小）。
  * 如果表将数据存储在内存中，则返回内存中已使用字节数的近似值。

* `total_bytes_uncompressed` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 未压缩字节的总数（包括索引和投影）。如果可以根据存储中该表各数据部分的校验和快速精确地确定该字节总数，则使用该值，否则为 `NULL`（不考虑底层存储（如果有））。

* `lifetime_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 自服务器启动以来插入的总行数（仅适用于 `Buffer` 表）。

* `lifetime_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 自服务器启动以来通过 INSERT 写入的总字节数（仅适用于 `Buffer` 表）。

* `comment` ([String](../../sql-reference/data-types/string.md)) - 表注释。

* `has_own_data` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 标志，表示该表本身是否在磁盘上存储数据，还是仅访问其他数据源。

* `loading_dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 数据库加载依赖项（在当前对象之前需要加载的对象列表）。

* `loading_dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 表加载依赖项（在当前对象之前需要加载的对象列表）。

* `loading_dependent_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 加载时所依赖的数据库。

* `loading_dependent_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 依赖加载的表。

`system.tables` 表在 `SHOW TABLES` 查询的实现中使用。

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
