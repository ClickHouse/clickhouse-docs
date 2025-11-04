---
'description': '这个引擎允许将 ClickHouse 与 Redis 集成。'
'sidebar_label': 'Redis'
'sidebar_position': 175
'slug': '/engines/table-engines/integrations/redis'
'title': 'Redis'
'doc_type': 'guide'
---


# Redis

该引擎允许将 ClickHouse 与 [Redis](https://redis.io/) 集成。由于 Redis 采用键值模型，我们强烈建议您仅以点的方式进行查询，例如 `where k=xx` 或 `where k in (xx, xx)`。

## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = Redis({host:port[, db_index[, password[, pool_size]]] | named_collection[, option=value [,..]] })
PRIMARY KEY(primary_key_name);
```

**引擎参数**

- `host:port` — Redis 服务器地址，您可以忽略端口，默认使用 Redis 端口 6379。
- `db_index` — Redis 数据库索引范围从 0 到 15，默认值为 0。
- `password` — 用户密码，默认值为空字符串。
- `pool_size` — Redis 最大连接池大小，默认值为 16。
- `primary_key_name` - 列表中的任何列名称。

:::note 序列化
`PRIMARY KEY` 仅支持一个列。主键将以二进制形式序列化为 Redis 键。除了主键以外的列将按照相应的顺序以二进制形式序列化为 Redis 值。
:::

参数也可以通过 [命名集合](/operations/named-collections.md) 传递。在这种情况下，`host` 和 `port` 应该单独指定。建议在生产环境中使用这种方法。此时，通过命名集合传递给 Redis 的所有参数都是必需的。

:::note 过滤
带有 `key equals` 或 `in filtering` 的查询将被优化为从 Redis 多键查找。如果查询没有过滤键，则会发生全表扫描，这是一个重操作。
:::

## 使用示例 {#usage-example}

使用简单参数在 ClickHouse 中创建一个使用 `Redis` 引擎的表：

```sql
CREATE TABLE redis_table
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = Redis('redis1:6379') PRIMARY KEY(key);
```

或使用 [命名集合](/operations/named-collections.md):

```xml
<named_collections>
    <redis_creds>
        <host>localhost</host>
        <port>6379</port>
        <password>****</password>
        <pool_size>16</pool_size>
        <db_index>s0</db_index>
    </redis_creds>
</named_collections>
```

```sql
CREATE TABLE redis_table
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = Redis(redis_creds) PRIMARY KEY(key);
```

插入数据：

```sql
INSERT INTO redis_table VALUES('1', 1, '1', 1.0), ('2', 2, '2', 2.0);
```

查询：

```sql
SELECT COUNT(*) FROM redis_table;
```

```text
┌─count()─┐
│       2 │
└─────────┘
```

```sql
SELECT * FROM redis_table WHERE key='1';
```

```text
┌─key─┬─v1─┬─v2─┬─v3─┐
│ 1   │  1 │ 1  │  1 │
└─────┴────┴────┴────┘
```

```sql
SELECT * FROM redis_table WHERE v1=2;
```

```text
┌─key─┬─v1─┬─v2─┬─v3─┐
│ 2   │  2 │ 2  │  2 │
└─────┴────┴────┴────┘
```

更新：

请注意，主键无法更新。

```sql
ALTER TABLE redis_table UPDATE v1=2 WHERE key='1';
```

删除：

```sql
ALTER TABLE redis_table DELETE WHERE key='1';
```

截断：

异步刷新 Redis 数据库。同时 `Truncate` 支持 SYNC 模式。

```sql
TRUNCATE TABLE redis_table SYNC;
```

连接：

与其他表连接。

```sql
SELECT * FROM redis_table JOIN merge_tree_table ON merge_tree_table.key=redis_table.key;
```

## 限制 {#limitations}

Redis 引擎也支持扫描查询，例如 `where k > xx`，但它有一些限制：
1. 扫描查询在极少数情况下可能会产生一些重复的键，当它正在重新哈希时。有关详细信息，请参见 [Redis Scan](https://github.com/redis/redis/blob/e4d183afd33e0b2e6e8d1c79a832f678a04a7886/src/dict.c#L1186-L1269)。
2. 在扫描过程中，可能会创建和删除键，因此结果数据集无法表示有效的时间点。
