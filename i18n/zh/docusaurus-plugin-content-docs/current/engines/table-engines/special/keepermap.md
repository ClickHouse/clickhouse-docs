---
slug: /engines/table-engines/special/keeper-map
sidebar_position: 150
sidebar_label: KeeperMap
title: 'KeeperMap'
description: '该引擎允许您将 Keeper/ZooKeeper 集群用作一致的键值存储，支持线性可写和顺序一致的读取。'
---


# KeeperMap {#keepermap}

该引擎允许您将 Keeper/ZooKeeper 集群用作一致的键值存储，支持线性可写和顺序一致的读取。

为了启用 KeeperMap 存储引擎，您需要使用 `<keeper_map_path_prefix>` 配置定义一个 ZooKeeper 路径以存储表。

例如：

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

其中路径可以是任何其他有效的 ZooKeeper 路径。

## 创建表 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = KeeperMap(root_path, [keys_limit]) PRIMARY KEY(primary_key_name)
```

引擎参数：

- `root_path` - 存储 `table_name` 的 ZooKeeper 路径。  
该路径不应包含 `<keeper_map_path_prefix>` 配置定义的前缀，因为该前缀将自动附加到 `root_path`。  
此外，也支持格式为 `auxiliary_zookeeper_cluster_name:/some/path` 的路径，其中 `auxiliary_zookeeper_cluster` 是在 `<auxiliary_zookeepers>` 配置中定义的 ZooKeeper 集群。  
默认情况下，使用在 `<zookeeper>` 配置中定义的 ZooKeeper 集群。
- `keys_limit` - 表中允许的键的数量。  
该限制是一个软限制，在一些边界情况下，可能会出现超过该键数的情况。
- `primary_key_name` – 列表中的任意列名。
- 必须指定 `primary key`，只支持一个列作为主键。主键将以二进制形式序列化为 ZooKeeper 中的 `node name`。 
- 除主键之外的列将根据相应的顺序序列化为二进制并存储为由序列化键定义的结果节点的值。
- 使用键的 `equals` 或 `in` 过滤的查询将优化为从 `Keeper` 查找多个键，否则将提取所有值。

示例：

``` sql
CREATE TABLE keeper_map_table
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = KeeperMap('/keeper_map_table', 4)
PRIMARY KEY key
```

与

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```


每个值，即 `(v1, v2, v3)` 的二进制序列化，将存储在 `Keeper` 的 `/keeper_map_tables/keeper_map_table/data/serialized_key` 中。  
此外，键的数量将软限制为 4。

如果在同一 ZooKeeper 路径上创建多个表，则值会被持久化，直到至少有 1 个表在使用它。  
结果，在创建表时可以使用 `ON CLUSTER` 子句，并共享来自多个 ClickHouse 实例的数据。  
当然，可以手动在不相关的 ClickHouse 实例上使用相同路径运行 `CREATE TABLE`，以获得相同的数据共享效果。

## 支持的操作 {#supported-operations}

### 插入 {#inserts}

当新的行插入到 `KeeperMap` 时，如果键不存在，就会为该键创建一个新条目。
如果键存在，并且设置 `keeper_map_strict_mode` 为 `true`，则会抛出异常，否则该键的值会被覆盖。

示例：

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### 删除 {#deletes}

可以使用 `DELETE` 查询或 `TRUNCATE` 删除行。 
如果键存在，并且设置 `keeper_map_strict_mode` 为 `true`，则获取和删除数据将仅在可以原子执行时成功。

```sql
DELETE FROM keeper_map_table WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
ALTER TABLE keeper_map_table DELETE WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
TRUNCATE TABLE keeper_map_table;
```

### 更新 {#updates}

可以使用 `ALTER TABLE` 查询更新值。主键不可更新。
如果设置 `keeper_map_strict_mode` 为 `true`，则获取和更新数据仅在原子执行时成功。

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

## 相关内容 {#related-content}

- 博客: [使用 ClickHouse 和 Hex 构建实时分析应用](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
