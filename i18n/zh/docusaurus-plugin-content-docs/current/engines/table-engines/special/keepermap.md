---
'description': 'This engine allows you to use Keeper/ZooKeeper cluster as consistent
  key-value store with linearizable writes and sequentially consistent reads.'
'sidebar_label': 'KeeperMap'
'sidebar_position': 150
'slug': '/engines/table-engines/special/keeper-map'
'title': 'KeeperMap'
---




# KeeperMap {#keepermap}

此引擎允许您使用 Keeper/ZooKeeper 集群作为一致的键值存储，支持线性可写入和顺序一致的读取。

要启用 KeeperMap 存储引擎，您需要使用 `<keeper_map_path_prefix>` 配置定义会存储表的 ZooKeeper 路径。

例如：

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

其中路径可以是任何其他有效的 ZooKeeper 路径。

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

- `root_path` - ZooKeeper 路径，用于存储 `table_name`。  
此路径不应包含由 `<keeper_map_path_prefix>` 配置定义的前缀，因为该前缀会自动附加到 `root_path`。  
此外，支持格式为 `auxiliary_zookeeper_cluster_name:/some/path`，其中 `auxiliary_zookeeper_cluster` 是在 `<auxiliary_zookeepers>` 配置中定义的 ZooKeeper 集群。  
默认情况下，使用在 `<zookeeper>` 配置中定义的 ZooKeeper 集群。
- `keys_limit` - 表中允许的键的数量。  
这个限制是一个软限制，对于某些边缘情况，可能会出现更多的键最终存储在表中。
- `primary_key_name` – 列表中任意列的名称。
- 必须指定 `primary key`，它仅支持一个列作为主键。主键将以二进制形式序列化为 ZooKeeper 中的 `node name`。 
- 除主键以外的列将按照相应的顺序序列化为二进制，并存储为由序列化键定义的结果节点的值。
- 使用键的 `equals` 或 `in` 过滤的查询将被优化为对 `Keeper` 的多键查找，否则将获取所有值。

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

与

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```


每个值，代表 `(v1, v2, v3)` 的二进制序列化，将存储在 `Keeper` 中的 `/keeper_map_tables/keeper_map_table/data/serialized_key`。
此外，键的数量将有一个软限制为 4。

如果在同一个 ZooKeeper 路径上创建多个表，值将持久化，直到至少有一个表在使用它。  
因此，在创建表时可以使用 `ON CLUSTER` 子句，并从多个 ClickHouse 实例中共享数据。  
当然，也可以在不相关的 ClickHouse 实例上手动运行具有相同路径的 `CREATE TABLE`，以实现相同的数据共享效果。

## 支持的操作 {#supported-operations}

### 插入 {#inserts}

当新行插入到 `KeeperMap` 时，如果键不存在，则为该键创建一个新条目。  
如果键存在，并且设置 `keeper_map_strict_mode` 为 `true`，则会抛出异常；否则，将覆盖该键的值。

示例：

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### 删除 {#deletes}

可以使用 `DELETE` 查询或 `TRUNCATE` 删除行。  
如果键存在，并且设置 `keeper_map_strict_mode` 设置为 `true`，则仅在可以原子执行时才会成功获取和删除数据。

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

可以使用 `ALTER TABLE` 查询更新值。主键不能被更新。  
如果设置 `keeper_map_strict_mode` 为 `true`，则在执行原子操作时才能成功获取和更新数据。

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

## 相关内容 {#related-content}

- 博客: [使用 ClickHouse 和 Hex 构建实时分析应用程序](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
