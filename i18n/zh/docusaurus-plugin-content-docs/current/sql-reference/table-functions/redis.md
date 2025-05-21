---
'description': 'This table function allows integrating ClickHouse with Redis.'
'sidebar_label': 'Redis'
'sidebar_position': 170
'slug': '/sql-reference/table-functions/redis'
'title': 'Redis'
---




# redis 表函数

该表函数允许将 ClickHouse 与 [Redis](https://redis.io/) 集成。

## 语法 {#syntax}

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```

## 参数 {#arguments}

| 参数        | 描述                                                                                                      |
|-------------|-----------------------------------------------------------------------------------------------------------|
| `host:port` | Redis 服务器地址，可以忽略端口，系统将使用默认的 Redis 端口 6379。                                            |
| `key`       | 列表中的任意列名。                                                                                        |
| `structure` | 从该函数返回的 ClickHouse 表的模式。                                                                       |
| `db_index`  | Redis 数据库索引范围从 0 到 15，默认值为 0。                                                              |
| `password`  | 用户密码，默认值为空字符串。                                                                              |
| `pool_size` | Redis 最大连接池大小，默认值为 16。                                                                        |
| `primary`   | 必须指定，主键只支持一列。主键会以二进制形式序列化为 Redis 键。                                            |

- 除主键之外的其他列将按相应顺序以二进制形式序列化为 Redis 值。
- 查询中如果包含相等或过滤的键，将会优化为从 Redis 多键查找。如果没有过滤键的查询，则会进行全表扫描，该操作较为繁重。

目前，`redis` 表函数不支持 [命名集合](/operations/named-collections.md)。

## 返回值 {#returned_value}

一个表对象，使用 Redis 键作为键，其他列打包在一起作为 Redis 值。

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

## 相关内容 {#related}

- [Redis 表引擎](/engines/table-engines/integrations/redis.md)
- [将 redis 用作字典源](/sql-reference/dictionaries/index.md#redis)
