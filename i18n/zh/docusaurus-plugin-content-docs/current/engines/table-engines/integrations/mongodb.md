---
description: 'MongoDB 引擎是一种只读表引擎，支持从远程集合读取数据。'
sidebar_label: 'MongoDB'
sidebar_position: 135
slug: /engines/table-engines/integrations/mongodb
title: 'MongoDB 表引擎'
doc_type: 'reference'
---



# MongoDB 表引擎

MongoDB 引擎是一个只读表引擎，用于从远程 [MongoDB](https://www.mongodb.com/) 集合中读取数据。

仅支持 MongoDB v3.6 及以上版本的服务器。
暂不支持 [种子列表 (`mongodb+srv`)](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-seed-list)。



## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = MongoDB(host:port, database, collection, user, password[, options[, oid_columns]]);
```

**引擎参数**

| 参数          | 描述                                                                                                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host:port`   | MongoDB 服务器地址。                                                                                                                                                                                        |
| `database`    | 远程数据库名称。                                                                                                                                                                                              |
| `collection`  | 远程集合名称。                                                                                                                                                                                               |
| `user`        | MongoDB 用户名。                                                                                                                                                                                             |
| `password`    | 用户密码。                                                                                                                                                                                                  |
| `options`     | 可选参数。MongoDB 连接字符串[选项](https://www.mongodb.com/docs/manual/reference/connection-string-options/#connection-options),采用 URL 格式的字符串。例如:`'authSource=admin&ssl=true'`                              |
| `oid_columns` | 以逗号分隔的列名列表,这些列在 WHERE 子句中将被视为 `oid` 类型。默认值为 `_id`。                                                                                                                                                      |

:::tip
如果您使用 MongoDB Atlas 云服务,可以从"Atlas SQL"选项中获取连接 URL。
种子列表(`mongodb**+srv**`)目前暂不支持,但将在未来版本中添加。
:::

或者,您也可以传递 URI:

```sql
ENGINE = MongoDB(uri, collection[, oid_columns]);
```

**引擎参数**

| 参数          | 描述                                                                                   |
| ------------- | -------------------------------------------------------------------------------------- |
| `uri`         | MongoDB 服务器的连接 URI。                                                                |
| `collection`  | 远程集合名称。                                                                            |
| `oid_columns` | 以逗号分隔的列名列表,这些列在 WHERE 子句中将被视为 `oid` 类型。默认值为 `_id`。                              |


## 类型映射 {#types-mappings}

| MongoDB                 | ClickHouse                                                            |
| ----------------------- | --------------------------------------------------------------------- |
| bool, int32, int64      | _除 Decimal 外的任意数值类型_、Boolean、String                   |
| double                  | Float64、String                                                       |
| date                    | Date、Date32、DateTime、DateTime64、String                            |
| string                  | String、_格式正确时可为除 Decimal 外的任意数值类型_    |
| document                | String(作为 JSON)                                                       |
| array                   | Array、String(作为 JSON)                                                |
| oid                     | String                                                                |
| binary                  | 列中为 String,数组或文档中为 base64 编码字符串 |
| uuid (binary subtype 4) | UUID                                                                  |
| _任何其他类型_             | String                                                                |

如果在 MongoDB 文档中未找到键(例如列名不匹配),将插入默认值或 `NULL`(如果列可为空)。

### OID {#oid}

如果希望在 WHERE 子句中将 `String` 视为 `oid`,只需将列名放在表引擎的最后一个参数中。
当通过 `_id` 列查询记录时可能需要这样做,因为在 MongoDB 中该列默认为 `oid` 类型。
如果表中的 `_id` 字段为其他类型(例如 `uuid`),则需要指定空的 `oid_columns`,否则将使用此参数的默认值 `_id`。

```javascript
db.sample_oid.insertMany([{ another_oid_column: ObjectId() }])

db.sample_oid.find()
;[
  {
    _id: { $oid: "67bf6cc44ebc466d33d42fb2" },
    another_oid_column: { $oid: "67bf6cc40000000000ea41b1" }
  }
]
```

默认情况下,仅 `_id` 被视为 `oid` 列。

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid');

SELECT count() FROM sample_oid WHERE _id = '67bf6cc44ebc466d33d42fb2'; --将输出 1
SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; --将输出 0
```

在这种情况下输出将为 `0`,因为 ClickHouse 不知道 `another_oid_column` 为 `oid` 类型,让我们修复它:

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


## 支持的子句 {#supported-clauses}

仅支持包含简单表达式的查询(例如,`WHERE field = <constant> ORDER BY field2 LIMIT <constant>`)。
此类表达式会被转换为 MongoDB 查询语言并在服务器端执行。
您可以使用 [mongodb_throw_on_unsupported_query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query) 禁用所有这些限制。
在这种情况下,ClickHouse 会尽力转换查询,但这可能导致全表扫描并在 ClickHouse 端进行处理。

:::note
始终建议显式设置字面量的类型,因为 MongoDB 要求严格的类型化过滤器。\
例如,您想按 `Date` 进行过滤:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

这将无法工作,因为 MongoDB 不会将字符串转换为 `Date`,因此您需要手动进行转换:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

这适用于 `Date`、`Date32`、`DateTime`、`Bool`、`UUID`。

:::


## 使用示例 {#usage-example}

假设 MongoDB 已加载 [sample_mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix) 数据集

在 ClickHouse 中创建一个表,用于从 MongoDB 集合读取数据:

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

查询:

```sql
SELECT count() FROM sample_mflix_table
```

```text
   ┌─count()─┐
1. │   21349 │
   └─────────┘
```

```sql
-- JSONExtractString 无法下推到 MongoDB
SET mongodb_throw_on_unsupported_query = 0;

-- 查找所有评分 > 7.5 的《回到未来》系列电影
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
plot:      一个年轻人意外被他的朋友埃米特·布朗博士发明的时光旅行 DeLorean 送到了 30 年前,他必须确保他高中时代的父母结合,以保证自己的存在。
genres:    ['Adventure','Comedy','Sci-Fi']
directors: ['Robert Zemeckis']
released:  1985-07-03

Row 2:
──────
title:     Back to the Future Part II
plot:      在访问 2015 年后,马蒂·麦克弗莱必须再次回到 1955 年,以防止 1985 年发生灾难性的变化……同时不能干扰他的第一次旅行。
genres:    ['Action','Adventure','Comedy']
directors: ['Robert Zemeckis']
released:  1989-11-22
```

```sql
-- 查找根据 Cormac McCarthy 作品改编的评分最高的 3 部电影
SELECT title, toFloat32(JSONExtractString(imdb, 'rating')) AS rating
FROM sample_mflix_table
WHERE arrayExists(x -> x LIKE 'Cormac McCarthy%', writers)
ORDER BY rating DESC
LIMIT 3;
```

```text
   ┌─title──────────────────┬─rating─┐
1. │ No Country for Old Men │    8.1 │
2. │ The Sunset Limited     │    7.4 │
3. │ The Road               │    7.3 │
   └────────────────────────┴────────┘
```


## 故障排查 {#troubleshooting}

您可以在 DEBUG 级别日志中查看生成的 MongoDB 查询语句。

实现细节请参阅 [mongocxx](https://github.com/mongodb/mongo-cxx-driver) 和 [mongoc](https://github.com/mongodb/mongo-c-driver) 文档。
