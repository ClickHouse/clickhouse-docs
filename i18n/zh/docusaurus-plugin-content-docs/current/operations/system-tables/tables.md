---
description: '包含服务器已知的所有表的元数据的系统表。'
keywords: ['system table', 'tables']
slug: /operations/system-tables/tables
title: 'system.tables'
doc_type: '参考'
---

# system.tables {#systemtables}

包含服务器已知的每个表的元数据。

[已分离](../../sql-reference/statements/detach.md) 的表不会在 `system.tables` 中显示。

[临时表](../../sql-reference/statements/create/table.md#temporary-tables) 只有在创建它们的会话中才会在 `system.tables` 中可见。它们会以 `database` 字段为空且 `is_temporary` 标志已开启的形式显示。

列：

* `database` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。

* `name` ([String](../../sql-reference/data-types/string.md)) — 表名。

* `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — 表的 UUID（Atomic 数据库）。

* `engine` ([String](../../sql-reference/data-types/string.md)) — 表引擎的名称（不含参数）。

* `is_temporary` ([UInt8](../../sql-reference/data-types/int-uint.md)) - 标志位，表示该表是否为临时表。

* `data_paths` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 表数据在文件系统中的路径。

* `metadata_path` ([String](../../sql-reference/data-types/string.md)) - 表在文件系统中的元数据路径。

* `metadata_modification_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - 表的元数据最后修改时间。

* `metadata_version` ([Int32](../../sql-reference/data-types/int-uint.md)) - ReplicatedMergeTree 表的元数据版本号；对于非 ReplicatedMergeTree 表，该值为 0。

* `dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 数据库依赖项。

* `dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 表的依赖关系（依赖于当前表的[物化视图](/sql-reference/statements/create/view#materialized-view)）。

* `create_table_query` ([String](../../sql-reference/data-types/string.md)) - 用于创建该表的 SQL 查询语句。

* `engine_full` ([String](../../sql-reference/data-types/string.md)) - 表引擎参数。

* `as_select` ([String](../../sql-reference/data-types/string.md)) - 用于视图的 `SELECT` 查询。

* `parameterized_view_parameters` ([Array](../../sql-reference/data-types/array.md) of [Tuple](../../sql-reference/data-types/tuple.md)) — 参数化视图的参数。

* `partition_key` ([String](../../sql-reference/data-types/string.md)) - 在表中指定的分区键表达式。

* `sorting_key` ([String](../../sql-reference/data-types/string.md)) - 在表中指定的排序键表达式。

* `primary_key` ([String](../../sql-reference/data-types/string.md)) - 表中指定的主键表达式。

* `sampling_key` ([String](../../sql-reference/data-types/string.md)) - 在表中指定的采样键表达式。

* `storage_policy` ([String](../../sql-reference/data-types/string.md)) - 存储策略：

  * [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)
  * [分布式](/engines/table-engines/special/distributed)

* `total_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 如果能够快速确定表中的精确行数，则为总行数，否则为 `NULL`（包括底层的 `Buffer` 表）。

* `total_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 字节总数（包括索引和投影）。如果可以快速确定存储中该表的精确字节数，则返回该值，否则为 `NULL`（不包括任何底层存储）。

  * 如果表将数据存储在磁盘上，则返回磁盘上已用空间（即压缩后大小）。
  * 如果表将数据存储在内存中，则返回已使用内存字节数的近似值。

* `total_bytes_uncompressed` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 未压缩字节的总数（包括索引和投影）。如果可以根据存储中该表各个分片的校验和快速精确地计算字节数，则返回该值；否则为 `NULL`（不考虑底层存储（如果有））。

* `lifetime_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 自服务器启动以来 INSERT 的总行数（仅用于 `Buffer` 表）。

* `lifetime_bytes` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) - 自服务器启动以来已 INSERT 的总字节数（仅适用于 `Buffer` 表）。

* `comment` ([String](../../sql-reference/data-types/string.md)) - 表的注释。

* `has_own_data` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 标志用于指示该表本身是否在磁盘上存储一定数据，或者仅访问其他数据源。

* `loading_dependencies_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 数据库加载依赖项（在当前对象之前需要加载的对象列表）。

* `loading_dependencies_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 表加载依赖（需要在当前对象之前加载的对象列表）。

* `loading_dependent_database` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 加载所依赖的数据库。

* `loading_dependent_table` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) - 依赖加载的表列表。

`system.tables` 表在实现 `SHOW TABLES` 查询时使用。

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
