---
description: '此表函数允许将 ClickHouse 与 Redis 集成。'
sidebar_label: 'redis'
sidebar_position: 170
slug: /sql-reference/table-functions/redis
title: 'redis'
doc_type: 'reference'
---

# redis 表函数 \{#redis-table-function\}

此表函数用于将 ClickHouse 与 [Redis](https://redis.io/) 集成。

## 语法 \{#syntax\}

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```

## 参数 \{#arguments\}

| Argument    | Description                                                                                                |
|-------------|------------------------------------------------------------------------------------------------------------|
| `host:port` | Redis 服务器地址，可以省略端口，此时将使用 Redis 默认端口 6379。                          |
| `key`       | 列表中的任意列名。                                                                        |
| `structure` | 此函数返回的 ClickHouse 表的表结构（schema）。                                             |
| `db_index`  | Redis 数据库索引，范围为 0 到 15，默认值为 0。                                                             |
| `password`  | 用户密码，默认是空字符串。                                                                    |
| `pool_size` | Redis 最大连接池大小，默认值为 16。                                                               |
| `primary`   | 必须指定，仅支持主键中的单列。主键将以二进制形式序列化为 Redis key。 |

- 主键以外的列将按对应顺序以二进制形式序列化为 Redis value。
- 带有 `key =` 或 `key IN (...)` 过滤条件的查询会被优化为从 Redis 进行多 key 查找。如果查询不包含 key 过滤条件，则会执行全表扫描，这是一个开销很大的操作。

目前 `redis` 表函数不支持使用 [Named collections](/operations/named-collections.md)。

## 返回值 \{#returned_value\}

一个表对象，其键为 Redis 键，其余各列打包在一起作为 Redis 值。

## 使用示例 \{#usage-example\}

从 Redis 读取：

```sql
SELECT * FROM redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32'
)
```

写入 Redis：

```sql
INSERT INTO TABLE FUNCTION redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32') values ('1', '1', 1);
```

## 相关 \{#related\}

- [`Redis` 表引擎](/engines/table-engines/integrations/redis.md)
- [将 Redis 用作字典源](/sql-reference/dictionaries/index.md#redis)
