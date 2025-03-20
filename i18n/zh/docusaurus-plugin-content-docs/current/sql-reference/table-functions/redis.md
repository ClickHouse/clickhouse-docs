---
slug: /sql-reference/table-functions/redis
sidebar_position: 170
sidebar_label: redis
title: 'redis'
description: '此表函数允许将 ClickHouse 与 Redis 集成。'
---


# redis 表函数

此表函数允许将 ClickHouse 与 [Redis](https://redis.io/) 集成。

**语法**

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```

**参数**

- `host:port` — Redis 服务器地址，您可以忽略端口，默认使用 Redis 端口 6379。

- `key` — 列表中的任何列名。

- `structure` — 此函数返回的 ClickHouse 表的模式。

- `db_index` — Redis 数据库索引范围为 0 到 15，默认值为 0。

- `password` — 用户密码，默认值为空字符串。

- `pool_size` — Redis 最大连接池大小，默认值为 16。

- `primary` 必须指定，仅支持一个主键列。主键将以二进制序列化为 Redis 键。

- 除主键外的列将按相应顺序以二进制序列化为 Redis 值。

- 与键相等或在过滤中使用的查询将优化为从 Redis 中多键查找。如果查询没有过滤键，将会进行全表扫描，这是一项重操作。

目前不支持 `redis` 表函数的 [命名集合](/operations/named-collections.md)。

**返回值**

一个表对象，其中键是 Redis 键，其他列打包在一起作为 Redis 值。

## 使用示例 {#usage-example}

从 Redis 读取：

```sql
SELECT * FROM redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32'
)
```

插入到 Redis：

```sql
INSERT INTO TABLE FUNCTION redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32') values ('1', '1', 1);
```

**另请参见**

- [`Redis` 表引擎](/engines/table-engines/integrations/redis.md)
- [使用 redis 作为字典源](/sql-reference/dictionaries/index.md#redis)
