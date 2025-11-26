---
description: '该引擎允许将 ClickHouse 与 RocksDB 集成'
sidebar_label: 'EmbeddedRocksDB'
sidebar_position: 50
slug: /engines/table-engines/integrations/embedded-rocksdb
title: 'EmbeddedRocksDB 表引擎'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# EmbeddedRocksDB 表引擎

<CloudNotSupportedBadge />

该引擎用于将 ClickHouse 与 [RocksDB](http://rocksdb.org/) 集成。



## 创建数据表

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = EmbeddedRocksDB([ttl, rocksdb_dir, read_only]) PRIMARY KEY(primary_key_name)
[ SETTINGS name=value, ... ]
```

引擎参数：

* `ttl` - 值的生存时间（time to live），单位为秒。如果 TTL 为 0，则使用常规 RocksDB 实例（无 TTL）。
* `rocksdb_dir` - 已存在的 RocksDB 目录路径，或新建 RocksDB 的目标路径。使用指定的 `rocksdb_dir` 打开表。
* `read_only` - 当 `read_only` 设为 true 时，使用只读模式。对于带 TTL 的存储，不会触发压实（无论手动还是自动），因此不会删除过期条目。
* `primary_key_name` – 列表中的任意列名。
* 必须指定 `primary key`，且主键只支持单列。主键将以二进制形式序列化为 `rocksdb key`。
* 除主键外的其他列将按对应顺序，以二进制形式序列化为 `rocksdb` value。
* 对键使用 `equals` 或 `in` 过滤条件的查询，将被优化为从 `rocksdb` 进行多键查找。

引擎设置：

* `optimize_for_bulk_insert` – 使表针对批量插入进行优化（插入流水线会创建 SST 文件并导入到 RocksDB 数据库，而不是写入 memtables）；默认值：`1`。
* `bulk_insert_block_size` - 批量插入时创建的 SST 文件的最小大小（按行数计）；默认值：`1048449`。

示例：

```sql
CREATE TABLE test
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = EmbeddedRocksDB
PRIMARY KEY key
```


## 指标

还有一个 `system.rocksdb` 表，用于公开 RocksDB 的统计信息：

```sql
SELECT
    name,
    value
FROM system.rocksdb

┌─name──────────────────────┬─value─┐
│ no.file.opens             │     1 │
│ number.block.decompressed │     1 │
└───────────────────────────┴───────┘
```


## 配置

你也可以通过配置更改任何 [RocksDB 选项](https://github.com/facebook/rocksdb/wiki/Option-String-and-Option-Map)：

```xml
<rocksdb>
    <options>
        <max_background_jobs>8</max_background_jobs>
    </options>
    <column_family_options>
        <num_levels>2</num_levels>
    </column_family_options>
    <tables>
        <table>
            <name>TABLE</name>
            <options>
                <max_background_jobs>8</max_background_jobs>
            </options>
            <column_family_options>
                <num_levels>2</num_levels>
            </column_family_options>
        </table>
    </tables>
</rocksdb>
```

默认情况下，“trivial approximate count” 优化是关闭的，这可能会影响 `count()` 查询的性能。要启用此优化，请将 `optimize_trivial_approximate_count_query` 设置为 `1`。此外，该设置还会影响 EmbeddedRocksDB 引擎的 `system.tables`，启用后可以看到 `total_rows` 和 `total_bytes` 的近似值。


## 支持的操作

### 插入

当向 `EmbeddedRocksDB` 插入新行时，如果键已存在，则会更新对应的值；否则会创建一个新的键。

示例：

```sql
INSERT INTO test VALUES ('some key', 1, 'value', 3.2);
```

### 删除

可以使用 `DELETE` 查询或 `TRUNCATE` 语句删除行。

```sql
DELETE FROM test WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
ALTER TABLE test DELETE WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
TRUNCATE TABLE test;
```

### 更新

可以使用 `ALTER TABLE` 语句来更新值。主键不允许更新。

```sql
ALTER TABLE test UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

### 联接

在 EmbeddedRocksDB 表上支持一种特殊的 `direct` 联接。
这种 `direct` 联接避免在内存中构建哈希表，而是直接从 EmbeddedRocksDB 访问数据。

在进行大规模联接时，由于不会创建哈希表，使用 `direct` 联接可以显著降低内存占用。

要启用 `direct` 联接：

```sql
SET join_algorithm = 'direct, hash'
```

:::tip
当 `join_algorithm` 设置为 `direct, hash` 时，将在可行时优先使用 direct 联接，否则使用 hash 联接。
:::

#### 示例

##### 创建并填充 EmbeddedRocksDB 表

```sql
CREATE TABLE rdb
(
    `key` UInt32,
    `value` Array(UInt32),
    `value2` String
)
ENGINE = EmbeddedRocksDB
PRIMARY KEY key
```

```sql
INSERT INTO rdb
    SELECT
        toUInt32(sipHash64(number) % 10) AS key,
        [key, key+1] AS value,
        ('val2' || toString(key)) AS value2
    FROM numbers_mt(10);
```

##### 创建并填充一个表，以便与 `rdb` 表进行 JOIN

```sql
CREATE TABLE t2
(
    `k` UInt16
)
ENGINE = TinyLog
```

```sql
INSERT INTO t2 SELECT number AS k
FROM numbers_mt(10)
```

##### 将 join 算法设为 `direct`

```sql
SET join_algorithm = 'direct'
```

##### INNER JOIN（内连接）

```sql
SELECT *
FROM
(
    SELECT k AS key
    FROM t2
) AS t2
INNER JOIN rdb ON rdb.key = t2.key
ORDER BY key ASC
```

```response
┌─key─┬─rdb.key─┬─value──┬─value2─┐
│   0 │       0 │ [0,1]  │ val20  │
│   2 │       2 │ [2,3]  │ val22  │
│   3 │       3 │ [3,4]  │ val23  │
│   6 │       6 │ [6,7]  │ val26  │
│   7 │       7 │ [7,8]  │ val27  │
│   8 │       8 │ [8,9]  │ val28  │
│   9 │       9 │ [9,10] │ val29  │
└─────┴─────────┴────────┴────────┘
```

### 关于 JOIN 的更多信息

* [`join_algorithm` 设置](/operations/settings/settings.md#join_algorithm)
* [JOIN 子句](/sql-reference/statements/select/join.md)
