---
'description': '这个表函数允许将 ClickHouse 与 Redis 集成。'
'sidebar_label': 'redis'
'sidebar_position': 170
'slug': '/sql-reference/table-functions/redis'
'title': 'redis'
'doc_type': 'reference'
---


# redis 表函数

该表函数允许将 ClickHouse 与 [Redis](https://redis.io/) 集成。

## 语法 {#syntax}

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```

## 参数 {#arguments}

| 参数         | 描述                                                                                 |
|--------------|--------------------------------------------------------------------------------------|
| `host:port`  | Redis 服务器地址，您可以忽略端口，将使用默认的 Redis 端口 6379。                          |
| `key`        | 列表中的任何列名。                                                                  |
| `structure`  | 从此函数返回的 ClickHouse 表的模式。                                                  |
| `db_index`   | Redis 数据库索引，范围从 0 到 15，默认为 0。                                             |
| `password`   | 用户密码，默认为空字符串。                                                            |
| `pool_size`  | Redis 最大连接池大小，默认为 16。                                                     |
| `primary`    | 必须指定，只支持主键中的一个列。主键将以二进制序列化为 Redis 键。                         |

- 除主键外的列将按照对应顺序以二进制序列化为 Redis 值。
- 带有等于键或在过滤中的查询将优化为从 Redis 进行多键查找。如果没有过滤键的查询将导致全表扫描，这是一个繁重的操作。

目前不支持 `redis` 表函数的 [命名集合](/operations/named-collections.md)。

## 返回值 {#returned_value}

一个表对象，其中键为 Redis 键，其他列打包在一起作为 Redis 值。

## 使用示例 {#usage-example}

从 Redis 中读取：

```sql
SELECT * FROM redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32'
)
```

插入到 Redis 中：

```sql
INSERT INTO TABLE FUNCTION redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32') values ('1', '1', 1);
```

## 相关 {#related}

- [`Redis` 表引擎](/engines/table-engines/integrations/redis.md)
- [将 redis 作为字典源](/sql-reference/dictionaries/index.md#redis)
