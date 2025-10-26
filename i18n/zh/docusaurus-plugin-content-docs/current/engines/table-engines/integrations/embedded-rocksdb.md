---
'description': '此引擎允许将ClickHouse与RocksDB集成'
'sidebar_label': 'EmbeddedRocksDB'
'sidebar_position': 50
'slug': '/engines/table-engines/integrations/embedded-rocksdb'
'title': '嵌入式RocksDB引擎'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 嵌入式RocksDB引擎

<CloudNotSupportedBadge />

该引擎允许将ClickHouse与[RocksDB](http://rocksdb.org/)集成。

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

引擎参数：

- `ttl` - 值的生存时间。TTL以秒为单位。如果TTL为0，则使用常规的RocksDB实例（无TTL）。
- `rocksdb_dir` - 已存在的RocksDB目录的路径或创建的RocksDB的目标路径。以指定的`rocksdb_dir`打开表。
- `read_only` - 当`read_only`设置为true时，使用只读模式。对于具有TTL的存储，不会触发压缩（无论是手动还是自动），因此不会删除过期条目。
- `primary_key_name` – 列表中的任意列名。
- `primary key`必须指定，主键只能支持一列。主键将被序列化为二进制形式作为`rocksdb key`。
- 除主键外的列将按相应顺序被序列化为二进制形式的`rocksdb value`。
- 使用key `equals`或`in`过滤的查询将优化为从`rocksdb`进行多key查找。

引擎设置：

- `optimize_for_bulk_insert` – 表被优化用于批量插入（插入管道将创建SST文件并导入到rocksdb数据库，而不是写入memtables）；默认值：`1`。
- `bulk_insert_block_size` - 通过批量插入创建的SST文件的最小大小（以行数为单位）；默认值：`1048449`。

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

## 指标 {#metrics}

还有`system.rocksdb`表，公开了rocksdb统计信息：

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

您还可以使用配置更改任何[RocksDB选项](https://github.com/facebook/rocksdb/wiki/Option-String-and-Option-Map)：

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

默认情况下，微不足道的近似计数优化被关闭，这可能会影响`count()`查询的性能。要启用此优化，请设置`optimize_trivial_approximate_count_query = 1`。此外，该设置会影响EmbeddedRocksDB引擎的`system.tables`，开启该设置以查看`total_rows`和`total_bytes`的近似值。

## 支持的操作 {#supported-operations}

### 插入 {#inserts}

当新行被插入到`EmbeddedRocksDB`中时，如果密钥已存在，值将被更新，否则将创建一个新密钥。

示例：

```sql
INSERT INTO test VALUES ('some key', 1, 'value', 3.2);
```

### 删除 {#deletes}

可以使用`DELETE`查询或`TRUNCATE`删除行。

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

可以使用`ALTER TABLE`查询更新值。主键不能被更新。

```sql
ALTER TABLE test UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

### 连接 {#joins}

支持与EmbeddedRocksDB表的特殊`direct`连接。
此直接连接避免在内存中形成哈希表，并直接从EmbeddedRocksDB访问数据。

在大连接中，您可能会看到直连的内存使用量大大降低，因为没有创建哈希表。

要启用直接连接：
```sql
SET join_algorithm = 'direct, hash'
```

:::tip
当`join_algorithm`设置为`direct, hash`时，将在可能的情况下使用直接连接，否则使用哈希连接。
:::

#### 示例 {#example}

##### 创建并填充一个EmbeddedRocksDB表 {#create-and-populate-an-embeddedrocksdb-table}
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

##### 创建并填充一个要与表`rdb`连接的表 {#create-and-populate-a-table-to-join-with-table-rdb}

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

##### 设置连接算法为`direct`{#set-the-join-algorithm-to-direct}

```sql
SET join_algorithm = 'direct'
```

##### 内连接 {#an-inner-join}
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

### 有关连接的更多信息 {#more-information-on-joins}
- [`join_algorithm`设置](/operations/settings/settings.md#join_algorithm)
- [JOIN子句](/sql-reference/statements/select/join.md)
