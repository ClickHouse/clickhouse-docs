---
description: '允许对存储在远程 MongoDB 服务器上的数据执行 `SELECT` 查询。'
sidebar_label: 'mongodb'
sidebar_position: 135
slug: /sql-reference/table-functions/mongodb
title: 'mongodb'
doc_type: 'reference'
---



# MongoDB 表函数 {#mongodb-table-function}

可以对存储在远程 MongoDB 服务器中的数据执行 `SELECT` 查询。



## 语法 {#syntax}

```sql
mongodb(host:port, database, collection, user, password, structure[, options[, oid_columns]])
```


## 参数 {#arguments}

| 参数            | 描述                                              |
| ------------- | ----------------------------------------------- |
| `host:port`   | MongoDB 服务器地址。                                  |
| `database`    | 远程数据库名称。                                        |
| `collection`  | 远程集合名称。                                         |
| `user`        | MongoDB 用户名。                                    |
| `password`    | 用户密码。                                           |
| `structure`   | 此函数返回的 ClickHouse 表的 schema（表结构）。               |
| `options`     | MongoDB 连接字符串选项（可选参数）。                          |
| `oid_columns` | 在 WHERE 子句中应作为 `oid` 处理的列名列表，使用逗号分隔。默认值为 `_id`。 |

:::tip
如果您使用的是 MongoDB Atlas 云服务，请添加以下选项：

```ini
'connectTimeoutMS=10000&ssl=true&authSource=admin'
```

:::

你还可以使用 URI 进行连接：

```sql
mongodb(uri, collection, structure[, oid_columns])
```

| 参数            | 描述                                         |
| ------------- | ------------------------------------------ |
| `uri`         | 连接字符串。                                     |
| `collection`  | 远程集合名称。                                    |
| `structure`   | 此函数返回的 ClickHouse 表的模式（schema）。            |
| `oid_columns` | 在 WHERE 子句中应被视为 `oid` 的列的逗号分隔列表。默认为 `_id`。 |


## 返回值 {#returned_value}

一个表对象，其列与原始 MongoDB 表的列相同。



## 示例 {#examples}

假设我们在名为 `test` 的 MongoDB 数据库中有一个名为 `my_collection` 的集合，并向其中插入了几条文档：

```sql
db.createUser({user:"test_user",pwd:"password",roles:[{role:"readWrite",db:"test"}]})

db.createCollection("my_collection")

db.my_collection.insertOne(
    { log_type: "event", host: "120.5.33.9", command: "check-cpu-usage -w 75 -c 90" }
)

db.my_collection.insertOne(
    { log_type: "event", host: "120.5.33.4", command: "system-check"}
)
```

使用 `mongodb` 表函数查询该集合：

```sql
SELECT * FROM mongodb(
    '127.0.0.1:27017',
    'test',
    'my_collection',
    'test_user',
    'password',
    'log_type String, host String, command String',
    'connectTimeoutMS=10000'
)
```

或者：

```sql
SELECT * FROM mongodb(
    'mongodb://test_user:password@127.0.0.1:27017/test?connectionTimeoutMS=10000',
    'my_collection',
    'log_type String, host String, command String'
)
```


## 相关 {#related}

- [`MongoDB` 表引擎](engines/table-engines/integrations/mongodb.md)
- [将 MongoDB 用作字典源](sql-reference/dictionaries/index.md#mongodb)
