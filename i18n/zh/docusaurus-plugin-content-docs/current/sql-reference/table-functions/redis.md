---
'description': '这个表函数允许将 ClickHouse 与 Redis 集成。'
'sidebar_label': 'redis'
'sidebar_position': 170
'slug': '/sql-reference/table-functions/redis'
'title': 'redis'
---


# redis 表函数

此表函数允许将 ClickHouse 与 [Redis](https://redis.io/) 集成。

## 语法 {#syntax}

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```

## 参数 {#arguments}

| 参数          | 描述                                                                                                |
|---------------|-----------------------------------------------------------------------------------------------------|
| `host:port`   | Redis 服务器地址，可以忽略端口，默认 Redis 端口 6379 将被使用。                                          |
| `key`         | 列表中的任何列名。                                                                                  |
| `structure`   | 从此函数返回的 ClickHouse 表的模式。                                                                |
| `db_index`    | Redis db 索引范围为 0 到 15，默认为 0。                                                               |
| `password`    | 用户密码，默认为空字符串。                                                                          |
| `pool_size`   | Redis 最大连接池大小，默认为 16。                                                                    |
| `primary`     | 必须指定，只支持一个列作为主键。主键将以二进制格式序列化为 Redis 键。                                     |

- 除主键外的列将按照对应顺序以二进制格式序列化为 Redis 值。
- 如果查询的键相等或在过滤中，将优化为从 Redis 多键查找。如果查询没有过滤键，则会发生全表扫描，这是一个重操作。

目前不支持 `redis` 表函数的 [命名集合](/operations/named-collections.md)。

## 返回值 {#returned_value}

一个表对象，键作为 Redis 键，其他列打包为 Redis 值。

## 使用示例 {#usage-example}

从 Redis 中读取：

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

## 相关 {#related}

- [`Redis` 表引擎](/engines/table-engines/integrations/redis.md)
- [将 redis 用作字典源](/sql-reference/dictionaries/index.md#redis)
