---
description: '此引擎使 ClickHouse 能与 RocksDB 集成'
sidebar_label: 'EmbeddedRocksDB'
sidebar_position: 50
slug: /engines/table-engines/integrations/embedded-rocksdb
title: 'EmbeddedRocksDB 表引擎'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# EmbeddedRocksDB 表引擎

<CloudNotSupportedBadge />

该引擎支持将 ClickHouse 与 [RocksDB](http://rocksdb.org/) 集成。



## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = EmbeddedRocksDB([ttl, rocksdb_dir, read_only]) PRIMARY KEY(primary_key_name)
[ SETTINGS name=value, ... ]
```

引擎参数:

- `ttl` - 值的存活时间。TTL 以秒为单位。如果 TTL 为 0,则使用常规 RocksDB 实例(不带 TTL)。
- `rocksdb_dir` - 已存在的 RocksDB 目录路径或新建 RocksDB 的目标路径。使用指定的 `rocksdb_dir` 打开表。
- `read_only` - 当 `read_only` 设置为 true 时,将使用只读模式。对于带有 TTL 的存储,压缩操作不会被触发(无论手动还是自动),因此过期条目不会被删除。
- `primary_key_name` – 列列表中的任意列名。
- 必须指定 `primary key`,主键仅支持单列。主键将以二进制形式序列化为 `rocksdb key`。
- 主键以外的列将按相应顺序以二进制形式序列化为 `rocksdb` 值。
- 使用 `equals` 或 `in` 键过滤的查询将被优化为从 `rocksdb` 进行多键查找。

引擎设置:

- `optimize_for_bulk_insert` – 表针对批量插入进行了优化(插入管道将创建 SST 文件并导入到 rocksdb 数据库,而不是写入 memtable);默认值:`1`。
- `bulk_insert_block_size` - 批量插入创建的 SST 文件的最小大小(以行数为单位);默认值:`1048449`。

示例:

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


## 指标 {#metrics}

此外还有 `system.rocksdb` 表，用于公开 RocksDB 统计信息：

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


## 配置 {#configuration}

您还可以通过配置文件更改任何 [rocksdb 选项](https://github.com/facebook/rocksdb/wiki/Option-String-and-Option-Map):

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

默认情况下,简单近似计数优化处于关闭状态,这可能会影响 `count()` 查询的性能。要启用此优化,请设置 `optimize_trivial_approximate_count_query = 1`。此外,该设置还会影响 EmbeddedRocksDB 引擎的 `system.tables` 表,启用该设置后可以查看 `total_rows` 和 `total_bytes` 的近似值。


## 支持的操作 {#supported-operations}

### 插入 {#inserts}

当新行插入到 `EmbeddedRocksDB` 时,如果键已存在,则会更新其值,否则会创建新键。

示例:

```sql
INSERT INTO test VALUES ('some key', 1, 'value', 3.2);
```

### 删除 {#deletes}

可以使用 `DELETE` 查询或 `TRUNCATE` 来删除行。

```sql
DELETE FROM test WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
ALTER TABLE test DELETE WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
TRUNCATE TABLE test;
```

### 更新 {#updates}

可以使用 `ALTER TABLE` 查询来更新值。主键无法更新。

```sql
ALTER TABLE test UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

### 连接 {#joins}

支持与 EmbeddedRocksDB 表进行特殊的 `direct` 连接。
这种直接连接避免在内存中构建哈希表,而是直接从 EmbeddedRocksDB 访问数据。

对于大型连接,使用直接连接可以显著降低内存使用量,因为无需创建哈希表。

启用直接连接:

```sql
SET join_algorithm = 'direct, hash'
```

:::tip
当 `join_algorithm` 设置为 `direct, hash` 时,会在可能的情况下使用直接连接,否则使用哈希连接。
:::

#### 示例 {#example}

##### 创建并填充 EmbeddedRocksDB 表 {#create-and-populate-an-embeddedrocksdb-table}

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

##### 创建并填充要与表 `rdb` 连接的表 {#create-and-populate-a-table-to-join-with-table-rdb}

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

##### 将连接算法设置为 `direct` {#set-the-join-algorithm-to-direct}

```sql
SET join_algorithm = 'direct'
```

##### INNER JOIN {#an-inner-join}

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

### 关于连接的更多信息 {#more-information-on-joins}

- [`join_algorithm` 设置](/operations/settings/settings.md#join_algorithm)
- [JOIN 子句](/sql-reference/statements/select/join.md)
