---
description: '该引擎使 ClickHouse 能与 Redis 集成。'
sidebar_label: 'Redis'
sidebar_position: 175
slug: /engines/table-engines/integrations/redis
title: 'Redis 表引擎'
doc_type: 'guide'
---

# Redis 表引擎 \\{#redis-table-engine\\}

该引擎允许将 ClickHouse 与 [Redis](https://redis.io/) 集成。由于 Redis 采用键值（KV）模型，我们强烈建议仅执行点查询，例如使用 `where k = xx` 或 `where k in (xx, xx)`。

## 创建数据表 \\{#creating-a-table\\}

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

* `host:port` — Redis 服务器地址，可以省略端口，此时将使用 Redis 默认端口 6379。
* `db_index` — Redis 数据库索引，索引范围为 0 到 15，默认值为 0。
* `password` — 用户密码，默认是空字符串。
* `pool_size` — Redis 最大连接池大小，默认值为 16。
* `primary_key_name` - 列表中的任意一列列名。

:::note Serialization
`PRIMARY KEY` 只支持单列。主键会以二进制形式序列化为 Redis key。
除主键外的列会按对应顺序以二进制形式序列化为 Redis value。
:::

参数也可以通过 [named collections](/operations/named-collections.md) 传入。在这种情况下，`host` 和 `port` 应分别指定。生产环境推荐使用这种方式。目前，通过 named collections 传递给 Redis 的所有参数都是必需的。

:::note Filtering
带有 `key equals` 或 `in filtering` 的查询将被优化为从 Redis 进行多键查找。对于未按键过滤的查询，将会执行全表扫描，这是一种开销很大的操作。
:::

## 使用示例 \\{#usage-example\\}

在 ClickHouse 中使用 `Redis` 引擎和基本参数创建一张表：

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

或者使用[命名集合](/operations/named-collections.md)：

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

插入：

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

请注意，主键不可更新。

```sql
ALTER TABLE redis_table UPDATE v1=2 WHERE key='1';
```

删除：

```sql
ALTER TABLE redis_table DELETE WHERE key='1';
```

Truncate：

以异步方式清空 Redis 数据库。此外，`Truncate` 也支持 SYNC（同步）模式。

```sql
TRUNCATE TABLE redis_table SYNC;
```

Join:

与其他表进行关联（JOIN）。

```sql
SELECT * FROM redis_table JOIN merge_tree_table ON merge_tree_table.key=redis_table.key;
```

## 限制 \\{#limitations\\}

Redis 引擎也支持扫描查询，例如 `where k > xx`，但存在一些限制：
1. 在极少数情况下，当正在进行 rehashing 时，扫描查询可能会产生一些重复的键。详情参见 [Redis Scan](https://github.com/redis/redis/blob/e4d183afd33e0b2e6e8d1c79a832f678a04a7886/src/dict.c#L1186-L1269)。
2. 在扫描过程中，键可能被创建或删除，因此结果数据集无法表示某个时间点上的有效快照。
