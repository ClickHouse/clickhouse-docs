---
description: '此引擎允许你将 Keeper/ZooKeeper 集群用作具有线性化写入和顺序一致性读取的一致性键值存储。'
sidebar_label: 'KeeperMap'
sidebar_position: 150
slug: /engines/table-engines/special/keeper-map
title: 'KeeperMap 表引擎'
doc_type: 'reference'
---



# KeeperMap 表引擎 {#keepermap-table-engine}

此引擎允许你将 Keeper/ZooKeeper 集群用作一致性的键值存储，支持线性化写入和顺序一致的读取。

要启用 KeeperMap 存储引擎，你需要通过 `<keeper_map_path_prefix>` 配置项定义用于存放表的 ZooKeeper 路径。

例如：

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

其中 `path` 可以是任意其他有效的 ZooKeeper 路径。


## 创建数据表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = KeeperMap(root_path, [keys_limit]) PRIMARY KEY(primary_key_name)
```

引擎参数：

* `root_path` - 存储 `table_name` 的 ZooKeeper 路径。\
  此路径不应包含在 `<keeper_map_path_prefix>` 配置中定义的前缀，因为该前缀会自动追加到 `root_path`。\
  另外，还支持 `auxiliary_zookeeper_cluster_name:/some/path` 的格式，其中 `auxiliary_zookeeper_cluster_name` 是在 `<auxiliary_zookeepers>` 配置中定义的 ZooKeeper 集群名称。\
  默认情况下，使用在 `<zookeeper>` 配置中定义的 ZooKeeper 集群。
* `keys_limit` - 表中允许存在的键数量。\
  该限制是软限制，在某些极端情况下，表中可能会出现更多的键。
* `primary_key_name` – 列表中的任意列名。
* 必须指定 `primary key`，并且主键只支持单列。主键将以二进制形式序列化为 ZooKeeper 中的 `node name`（节点名）。
* 主键以外的列将按对应顺序序列化为二进制，并作为由序列化键定义的结果节点的值进行存储。
* 带有 `equals` 或 `in` 键过滤条件的查询将被优化为从 `Keeper` 进行多键查找，否则将获取所有值。

示例：

```sql
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

使用

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

每个值（即 `(v1, v2, v3)` 的二进制序列化结果）都会存储在 `Keeper` 中的 `/keeper_map_tables/keeper_map_table/data/serialized_key` 路径下。
另外，键的数量有一个软上限，目前为 4 个。

如果在同一个 ZooKeeper 路径上创建了多个表，那么只要仍然至少有 1 个表在使用该路径，其对应的值就会被持久化。\
因此，在创建表时可以使用 `ON CLUSTER` 子句，在多个 ClickHouse 实例之间共享这些数据。\
当然，也可以在彼此无关联的 ClickHouse 实例上，手动使用相同路径运行 `CREATE TABLE`，以达到相同的数据共享效果。


## 支持的操作 {#supported-operations}

### 插入 {#inserts}

当向 `KeeperMap` 插入新行时，如果键不存在，则会为该键创建一个新条目。
如果键已存在且 `keeper_map_strict_mode` 被设为 `true`，则会抛出异常；否则，该键对应的值将被覆盖。

示例：

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### 删除 {#deletes}

可以使用 `DELETE` 查询或 `TRUNCATE` 删除行。
如果键存在，并且将 `keeper_map_strict_mode` 设置为 `true`，则只有在能够以原子方式执行时，获取和删除数据才会成功。

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

可以使用 `ALTER TABLE` 查询来更新值。主键不可更新。
如果将 `keeper_map_strict_mode` 设置为 `true`，只有在以原子方式执行时，读取和更新数据才会成功。

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```


## 相关内容 {#related-content}

- 博客文章：[使用 ClickHouse 和 Hex 构建实时分析应用](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
