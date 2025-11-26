---
description: 'MongoDB 引擎是一个只读表引擎，支持从远程集合读取数据。'
sidebar_label: 'MongoDB'
sidebar_position: 135
slug: /engines/table-engines/integrations/mongodb
title: 'MongoDB 表引擎'
doc_type: 'reference'
---



# MongoDB 表引擎

MongoDB 引擎是一种只读表引擎，用于从远程 [MongoDB](https://www.mongodb.com/) 集合中读取数据。

仅支持 MongoDB v3.6 及更高版本的服务器。
尚不支持 [种子列表（`mongodb+srv`）](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-seed-list)。



## 创建表

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = MongoDB(host:port, database, collection, user, password[, options[, oid_columns]]);
```

**引擎参数**

| 参数            | 描述                                                                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host:port`   | MongoDB 服务器地址。                                                                                                                                                       |
| `database`    | 远程数据库名称。                                                                                                                                                             |
| `collection`  | 远程集合名称。                                                                                                                                                              |
| `user`        | MongoDB 用户。                                                                                                                                                          |
| `password`    | 用户密码。                                                                                                                                                                |
| `options`     | 可选。以 URL 格式字符串形式提供的 MongoDB 连接字符串[选项](https://www.mongodb.com/docs/manual/reference/connection-string-options/#connection-options)，例如：`'authSource=admin&ssl=true'`。 |
| `oid_columns` | 以逗号分隔的列名列表，这些列在 WHERE 子句中将被视为 `oid`。默认值为 `_id`。                                                                                                                      |

:::tip
如果你使用的是 MongoDB Atlas 云服务，可以从 “Atlas SQL” 选项中获取连接 URL。
种子列表（`mongodb**+srv**`）目前尚不支持，但会在后续版本中加入。
:::

或者，你也可以传入一个 URI：

```sql
ENGINE = MongoDB(uri, collection[, oid_columns]);
```

**引擎参数**

| 参数            | 说明                                                 |
| ------------- | -------------------------------------------------- |
| `uri`         | MongoDB 服务器的连接 URI。                                |
| `collection`  | 远程集合的名称。                                           |
| `oid_columns` | 以逗号分隔的列名列表，这些列在 WHERE 子句中将被视为 `oid` 类型。默认值为 `_id`。 |


## 类型映射

| MongoDB                 | ClickHouse                               |
| ----------------------- | ---------------------------------------- |
| bool, int32, int64      | *除 Decimal 外的任意数值类型*，Boolean，String      |
| double                  | Float64，String                           |
| date                    | Date，Date32，DateTime，DateTime64，String   |
| string                  | String，*如果格式正确，则为除 Decimal 外的任意数值类型*     |
| document                | String（作为 JSON）                          |
| array                   | Array，String（作为 JSON）                    |
| oid                     | String                                   |
| binary                  | 如果在列中则为 String，如果在数组或文档中则为 base64 编码的字符串 |
| uuid (binary subtype 4) | UUID                                     |
| *any other*             | String                                   |

如果在 MongoDB 文档中未找到键（例如列名不匹配），将插入默认值，或者在列可为 `NULL` 的情况下插入 `NULL`。

### OID

如果希望在 WHERE 子句中将某个 `String` 视为 `oid`，只需将该列名作为表引擎的最后一个参数传入。
在按 `_id` 列查询记录时可能需要这样做，因为在 MongoDB 中 `_id` 列默认具有 `oid` 类型。
如果表中的 `_id` 字段具有其他类型，例如 `uuid`，则需要将 `oid_columns` 设为空，否则会使用该参数的默认值 `_id`。

```javascript
db.sample_oid.insertMany([
    {"another_oid_column": ObjectId()},
]);

db.sample_oid.find();
[
    {
        "_id": {"$oid": "67bf6cc44ebc466d33d42fb2"},
        "another_oid_column": {"$oid": "67bf6cc40000000000ea41b1"}
    }
]
```

默认情况下，只有 `_id` 会被视为 `oid` 列。

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid');

SELECT count() FROM sample_oid WHERE _id = '67bf6cc44ebc466d33d42fb2'; --输出结果为 1。
SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; --输出结果为 0
```

在这种情况下，输出将是 `0`，因为 ClickHouse 并不知道列 `another_oid_column` 的类型是 `oid`，所以我们来修正一下：

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid', '_id,another_oid_column');

-- 或

CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('host', 'db', 'sample_oid', 'user', 'pass', '', '_id,another_oid_column');

SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; -- 现在将输出 1
```


## 支持的子句

仅支持包含简单表达式的查询（例如，`WHERE field = <constant> ORDER BY field2 LIMIT <constant>`）。
此类表达式会被转换为 MongoDB 查询语言并在服务器端执行。
你可以通过 [mongodb&#95;throw&#95;on&#95;unsupported&#95;query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query) 来禁用这些限制。
在这种情况下，ClickHouse 会尽力转换查询，但可能会导致在 ClickHouse 端进行全表扫描和处理。

:::note
最好始终显式指定字面量的类型，因为 Mongo 要求严格类型化的过滤条件。\
例如，你希望按 `Date` 字段进行过滤：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

这样不起作用，因为 Mongo 不会自动将字符串转换为 `Date`，所以你需要手动进行转换：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

这适用于 `Date`、`Date32`、`DateTime`、`Bool` 和 `UUID` 类型。


## 使用示例

假设 MongoDB 中已经加载了 [sample&#95;mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix) 数据集

在 ClickHouse 中创建一张表，用于从 MongoDB 集合中读取数据：

```sql
CREATE TABLE sample_mflix_table
(
    _id String,
    title String,
    plot String,
    genres Array(String),
    directors Array(String),
    writers Array(String),
    released Date,
    imdb String,
    year String
) ENGINE = MongoDB('mongodb://<USERNAME>:<PASSWORD>@atlas-sql-6634be87cefd3876070caf96-98lxs.a.query.mongodb.net/sample_mflix?ssl=true&authSource=admin', 'movies');
```

查询：

```sql
SELECT count() FROM sample_mflix_table
```

```text
   ┌─count()─┐
1. │   21349 │
   └─────────┘
```

```sql
-- JSONExtractString 无法下推至 MongoDB
SET mongodb_throw_on_unsupported_query = 0;

-- 查找评分 > 7.5 的所有《回到未来》系列电影
SELECT title, plot, genres, directors, released FROM sample_mflix_table
WHERE title IN ('Back to the Future', 'Back to the Future Part II', 'Back to the Future Part III')
    AND toFloat32(JSONExtractString(imdb, 'rating')) > 7.5
ORDER BY year
FORMAT Vertical;
```

```text
Row 1:
──────
title:     Back to the Future
plot:      一个年轻人意外地被他的朋友埃米特·布朗博士发明的时光旅行DeLorean汽车送回到30年前,他必须确保他高中时期的父母结合,以保证自己的存在。
genres:    ['Adventure','Comedy','Sci-Fi']
directors: ['Robert Zemeckis']
released:  1985-07-03

Row 2:
──────
title:     Back to the Future Part II
plot:      在访问2015年之后,马蒂·麦克弗莱必须再次回到1955年,以防止1985年发生灾难性的变化……同时不能干扰他的第一次旅行。
genres:    ['Action','Adventure','Comedy']
directors: ['Robert Zemeckis']
released:  1989-11-22
```

```sql
-- 查找基于 Cormac McCarthy 作品改编的前 3 部电影
SELECT title, toFloat32(JSONExtractString(imdb, 'rating')) AS rating
FROM sample_mflix_table
WHERE arrayExists(x -> x LIKE 'Cormac McCarthy%', writers)
ORDER BY rating DESC
LIMIT 3;
```

```text
   ┌─标题───────────────────┬─评分───┐
1. │ 老无所依               │    8.1 │
2. │ 日落有限公司           │    7.4 │
3. │ 末日危途               │    7.3 │
   └────────────────────────┴────────┘
```


## 故障排查 {#troubleshooting}
您可以在 DEBUG 级别日志中看到生成的 MongoDB 查询。

实现细节可以在 [mongocxx](https://github.com/mongodb/mongo-cxx-driver) 和 [mongoc](https://github.com/mongodb/mongo-c-driver) 的文档中找到。
