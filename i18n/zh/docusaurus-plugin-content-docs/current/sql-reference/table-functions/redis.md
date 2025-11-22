---
description: '该表函数用于将 ClickHouse 与 Redis 集成。'
sidebar_label: 'redis'
sidebar_position: 170
slug: /sql-reference/table-functions/redis
title: 'redis'
doc_type: 'reference'
---



# Redis 表函数

此表函数用于将 ClickHouse 与 [Redis](https://redis.io/) 集成。



## 语法 {#syntax}

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```


## 参数 {#arguments}

| 参数    | 描述                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `host:port` | Redis 服务器地址,可以省略端口,默认使用 Redis 端口 6379。                                             |
| `key`       | 列列表中的任意列名。                                                                                             |
| `structure` | 该函数返回的 ClickHouse 表的结构定义。                                                                |
| `db_index`  | Redis 数据库索引,范围为 0 到 15,默认为 0。                                                                                |
| `password`  | 用户密码,默认为空字符串。                                                                                         |
| `pool_size` | Redis 最大连接池大小,默认为 16。                                                                                  |
| `primary`   | 必须指定,主键仅支持单列。主键将以二进制形式序列化为 Redis 键。 |

- 主键以外的列将按相应顺序以二进制形式序列化为 Redis 值。
- 带有键相等或 IN 过滤条件的查询将被优化为从 Redis 进行多键查找。如果查询不包含键过滤条件,将执行全表扫描,这是一个开销较大的操作。

目前 `redis` 表函数不支持[命名集合](/operations/named-collections.md)。


## 返回值 {#returned_value}

返回一个表对象,其中 key 列对应 Redis 键,其他列打包后对应 Redis 值。


## 使用示例 {#usage-example}

从 Redis 读取数据:

```sql
SELECT * FROM redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32'
)
```

向 Redis 插入数据:

```sql
INSERT INTO TABLE FUNCTION redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32') values ('1', '1', 1);
```


## 相关内容 {#related}

- [`Redis` 表引擎](/engines/table-engines/integrations/redis.md)
- [将 Redis 用作字典数据源](/sql-reference/dictionaries/index.md#redis)
