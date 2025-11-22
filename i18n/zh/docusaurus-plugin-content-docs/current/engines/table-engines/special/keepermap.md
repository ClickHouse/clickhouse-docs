---
description: '此引擎允许您将 Keeper/ZooKeeper 集群用作具有线性化写入和顺序一致性读取的一致性键值存储。'
sidebar_label: 'KeeperMap'
sidebar_position: 150
slug: /engines/table-engines/special/keeper-map
title: 'KeeperMap 表引擎'
doc_type: 'reference'
---



# KeeperMap 表引擎

此引擎允许你将 Keeper/ZooKeeper 集群用作具有线性化写入和顺序一致读取的一致性键值存储。

要启用 KeeperMap 存储引擎，你需要通过 `<keeper_map_path_prefix>` 配置项定义一个用于存储这些表的 ZooKeeper 路径。

例如：

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

其中，path 可以是任意有效的 ZooKeeper 路径。


## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = KeeperMap(root_path, [keys_limit]) PRIMARY KEY(primary_key_name)
```

引擎参数：

- `root_path` - 存储 `table_name` 的 ZooKeeper 路径。  
  此路径不应包含 `<keeper_map_path_prefix>` 配置中定义的前缀，因为该前缀会自动附加到 `root_path`。  
  此外，还支持 `auxiliary_zookeeper_cluster_name:/some/path` 格式，其中 `auxiliary_zookeeper_cluster` 是在 `<auxiliary_zookeepers>` 配置中定义的 ZooKeeper 集群。  
  默认情况下，使用 `<zookeeper>` 配置中定义的 ZooKeeper 集群。
- `keys_limit` - 表中允许的键数量。  
  此限制为软限制，在某些边界情况下，表中可能会包含更多键。
- `primary_key_name` – 列列表中的任意列名。
- 必须指定 `primary key`，主键仅支持单列。主键将以二进制形式序列化为 ZooKeeper 中的 `node name`。
- 主键以外的列将按相应顺序序列化为二进制，并作为由序列化键定义的结果节点的值进行存储。
- 使用键 `equals` 或 `in` 过滤的查询将被优化为从 `Keeper` 进行多键查找，否则将获取所有值。

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

配合以下配置：

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

每个值（即 `(v1, v2, v3)` 的二进制序列化）将存储在 `Keeper` 的 `/keeper_map_tables/keeper_map_table/data/serialized_key` 中。
此外，键的数量将有一个软限制，即 4 个键。

如果在同一 ZooKeeper 路径上创建多个表，则值将持久化，直到至少有 1 个表使用它。  
因此，在创建表时可以使用 `ON CLUSTER` 子句，并从多个 ClickHouse 实例共享数据。  
当然，也可以在不相关的 ClickHouse 实例上手动运行具有相同路径的 `CREATE TABLE`，以实现相同的数据共享效果。


## 支持的操作 {#supported-operations}

### 插入 {#inserts}

当向 `KeeperMap` 插入新行时,如果键不存在,则会为该键创建新条目。
如果键已存在,且设置 `keeper_map_strict_mode` 为 `true`,则会抛出异常;否则,该键的值将被覆盖。

示例:

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### 删除 {#deletes}

可以使用 `DELETE` 查询或 `TRUNCATE` 来删除行。
如果键存在,且设置 `keeper_map_strict_mode` 为 `true`,则只有在能够原子性执行的情况下,获取和删除数据操作才会成功。

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

可以使用 `ALTER TABLE` 查询来更新值。主键不能被更新。
如果设置 `keeper_map_strict_mode` 为 `true`,则只有在原子性执行的情况下,获取和更新数据操作才会成功。

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```


## 相关内容 {#related-content}

- 博客：[使用 ClickHouse 和 Hex 构建实时分析应用程序](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
