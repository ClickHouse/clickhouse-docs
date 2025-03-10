---
slug: /sql-reference/table-functions/mongodb
sidebar_position: 135
sidebar_label: mongodb
title: 'mongodb'
description: '允许对存储在远程 MongoDB 服务器上的数据执行 `SELECT` 查询。'
---


# mongodb 表函数

允许对存储在远程 MongoDB 服务器上的数据执行 `SELECT` 查询。

**语法**

``` sql
mongodb(host:port, database, collection, user, password, structure [, options])
```

**参数**

- `host:port` — MongoDB 服务器地址。

- `database` — 远程数据库名称。

- `collection` — 远程集合名称。

- `user` — MongoDB 用户。

- `password` — 用户密码。

- `structure` - 从此函数返回的 ClickHouse 表的模式。

- `options` - MongoDB 连接字符串选项（可选参数）。

:::tip
如果您使用的是 MongoDB Atlas 云服务，请添加以下选项：

```ini
'connectTimeoutMS=10000&ssl=true&authSource=admin'
```

:::

此外，您还可以通过 URI 连接：
``` sql
mongodb(uri, collection, structure)
```
**参数**

- `uri` — 连接字符串。

- `collection` — 远程集合名称。

- `structure` — 从此函数返回的 ClickHouse 表的模式。

**返回值**

具有与原始 MongoDB 表相同列的表对象。


**示例**

假设我们在名为 `test` 的 MongoDB 数据库中有一个名为 `my_collection` 的集合，并且我们插入了一些文档：

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

让我们使用 `mongodb` 表函数查询该集合：

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

或：

```sql
SELECT * FROM mongodb(
    'mongodb://test_user:password@127.0.0.1:27017/test?connectionTimeoutMS=10000',
    'my_collection',
    'log_type String, host String, command String'
)
```

**另请参阅**

- [MongoDB 表引擎](engines/table-engines/integrations/mongodb.md)
- [使用 MongoDB 作为字典源](sql-reference/dictionaries/index.md#mongodb)
