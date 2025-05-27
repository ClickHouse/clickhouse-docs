---
'description': 'MongoDB 引擎是只读的表引擎，允许从远程集合中读取数据。'
'sidebar_label': 'MongoDB'
'sidebar_position': 135
'slug': '/engines/table-engines/integrations/mongodb'
'title': 'MongoDB'
---


# MongoDB

MongoDB 引擎是一个只读表引擎，允许从远程 [MongoDB](https://www.mongodb.com/) 集合中读取数据。

只支持 MongoDB 服务器 v3.6+。
[种子列表(`mongodb+srv`)](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-seed-list) 目前不支持。

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

- `host:port` — MongoDB 服务器地址。

- `database` — 远程数据库名称。

- `collection` — 远程集合名称。

- `user` — MongoDB 用户。

- `password` — 用户密码。

- `options` — MongoDB 连接字符串选项（可选参数）。

- `oid_columns` - 需要在 WHERE 子句中视为 `oid` 的列的以逗号分隔的列表。默认为 `_id`。

:::tip
如果您使用的是 MongoDB Atlas 云服务，连接 URL 可以从 'Atlas SQL' 选项中获得。
种子列表(`mongodb**+srv**`) 目前不支持，但将在未来版本中添加。
:::

作为替代，您可以传递 URI：

```sql
ENGINE = MongoDB(uri, collection[, oid_columns]);
```

**引擎参数**

- `uri` — MongoDB 服务器的连接 URI。

- `collection` — 远程集合名称。

- `oid_columns` - 需要在 WHERE 子句中视为 `oid` 的列的以逗号分隔的列表。默认为 `_id`。

## 类型映射 {#types-mappings}

| MongoDB                 | ClickHouse                                                            |
|-------------------------|-----------------------------------------------------------------------|
| bool, int32, int64      | *任何数字类型*, String                                               |
| double                  | Float64, String                                                       |
| date                    | Date, Date32, DateTime, DateTime64, String                            |
| string                  | String                                                                |
| document                | String(作为 JSON)                                                    |
| array                   | Array, String(作为 JSON)                                             |
| oid                     | String                                                                |
| binary                  | 如果在列中则为 String，如果在数组或文档中则为 base64 编码字符串     |
| uuid (binary subtype 4) | UUID                                                                  |
| *其他*                  | String                                                                |

如果在 MongoDB 文档中未找到键（例如，列名不匹配），则将插入默认值或 `NULL`（如果该列是可空的）。

### OID {#oid}

如果您希望将 `String` 视为 WHERE 子句中的 `oid`，只需将列的名称放在表引擎的最后一个参数中。
当按 `_id` 列查询记录时，这可能是必要的，因为在 MongoDB 中 `_id` 默认具有 `oid` 类型。
如果表中的 `_id` 字段具有其他类型，例如 `uuid`，则需要指定空的 `oid_columns`，否则将使用此参数的默认值 `_id`。

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

默认情况下，只有 `_id` 被视为 `oid` 列。

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid');

SELECT count() FROM sample_oid WHERE _id = '67bf6cc44ebc466d33d42fb2'; --will output 1.
SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; --will output 0
```

在这种情况下，输出将是 `0`，因为 ClickHouse 并不知道 `another_oid_column` 具有 `oid` 类型，因此我们来修复它：

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid', '_id,another_oid_column');

-- or

CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('host', 'db', 'sample_oid', 'user', 'pass', '', '_id,another_oid_column');

SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; -- will output 1 now
```

## 支持的子句 {#supported-clauses}

仅支持具有简单表达式的查询（例如，`WHERE field = <constant> ORDER BY field2 LIMIT <constant>`）。
此类表达式将被转换为 MongoDB 查询语言，并在服务器端执行。
您可以使用 [mongodb_throw_on_unsupported_query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query) 禁用所有这些限制。
在这种情况下，ClickHouse 会尽力转换查询，但这可能会导致全表扫描和在 ClickHouse 端的处理。

:::note
明确设置文字的类型总是更好，因为 Mongo 要求严格的类型过滤。\
例如，您想按 `Date` 进行过滤：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

这将不起作用，因为 Mongo 不会将字符串转换为 `Date`，因此您需要手动转换：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

这适用于 `Date`，`Date32`，`DateTime`，`Bool`，`UUID`。

:::


## 使用示例 {#usage-example}


假设 MongoDB 中已加载 [sample_mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix) 数据集

在 ClickHouse 中创建一个表，以允许从 MongoDB 集合读取数据：

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
    year String,
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
-- JSONExtractString cannot be pushed down to MongoDB
SET mongodb_throw_on_unsupported_query = 0;

-- Find all 'Back to the Future' sequels with rating > 7.5
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
plot:      A young man is accidentally sent 30 years into the past in a time-traveling DeLorean invented by his friend, Dr. Emmett Brown, and must make sure his high-school-age parents unite in order to save his own existence.
genres:    ['Adventure','Comedy','Sci-Fi']
directors: ['Robert Zemeckis']
released:  1985-07-03

Row 2:
──────
title:     Back to the Future Part II
plot:      After visiting 2015, Marty McFly must repeat his visit to 1955 to prevent disastrous changes to 1985... without interfering with his first trip.
genres:    ['Action','Adventure','Comedy']
directors: ['Robert Zemeckis']
released:  1989-11-22
```

```sql
-- Find top 3 movies based on Cormac McCarthy's books
SELECT title, toFloat32(JSONExtractString(imdb, 'rating')) as rating
FROM sample_mflix_table
WHERE arrayExists(x -> x like 'Cormac McCarthy%', writers)
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

## 故障排除 {#troubleshooting}
您可以在 DEBUG 级别的日志中查看生成的 MongoDB 查询。

实现细节可以在 [mongocxx](https://github.com/mongodb/mongo-cxx-driver) 和 [mongoc](https://github.com/mongodb/mongo-c-driver) 文档中找到。
