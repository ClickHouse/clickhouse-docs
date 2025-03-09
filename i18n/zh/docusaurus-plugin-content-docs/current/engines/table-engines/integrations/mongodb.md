---
slug: /engines/table-engines/integrations/mongodb
sidebar_position: 135
sidebar_label: MongoDB
title: 'MongoDB'
description: 'MongoDB engine is read-only table engine which allows to read data from a remote collection.'
---


# MongoDB

MongoDB 引擎是只读表引擎，允许从远程 [MongoDB](https://www.mongodb.com/) 集合中读取数据。

仅支持 MongoDB v3.6+ 服务器。
[种子列表(`mongodb+srv`)](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-seed-list) 目前不受支持。

:::note
如果您遇到问题，请报告该问题，并尝试使用 [遗留实现](../../../operations/server-configuration-parameters/settings.md#use_legacy_mongodb_integration)。
请记住，它已被弃用，并将在下一个版本中移除。
:::

## 创建表 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = MongoDB(host:port, database, collection, user, password [, options]);
```

**引擎参数**

- `host:port` — MongoDB 服务器地址。

- `database` — 远程数据库名称。

- `collection` — 远程集合名称。

- `user` — MongoDB 用户。

- `password` — 用户密码。

- `options` — MongoDB 连接字符串选项（可选参数）。

:::tip
如果您使用的是 MongoDB Atlas 云服务，可以通过“Atlas SQL”选项获取连接 URL。
种子列表(`mongodb**+srv**`) 目前不受支持，但将在未来版本中添加。
:::

此外，您还可以简单地传递一个 URI：

``` sql
ENGINE = MongoDB(uri, collection);
```

**引擎参数**

- `uri` — MongoDB 服务器的连接 URI

- `collection` — 远程集合名称。


## 类型映射 {#types-mappings}

| MongoDB            | ClickHouse                                                            |
|--------------------|-----------------------------------------------------------------------|
| bool, int32, int64 | *任何数值类型*, String                                               |
| double             | Float64, String                                                       |
| date               | Date, Date32, DateTime, DateTime64, String                            |
| string             | String, UUID                                                          |
| document           | String(as JSON)                                                       |
| array              | Array, String(as JSON)                                                |
| oid                | String                                                                |
| binary             | 如果在列中为 String，如果在数组或文档中为 base64 编码的字符串     |
| *其他*            | String                                                                |

如果在 MongoDB 文档中未找到关键字（例如，列名不匹配），将插入默认值或 `NULL`（如果列是可空的）。

## 支持的子句 {#supported-clauses}

仅支持带有简单表达式的查询（例如，`WHERE field = <常量> ORDER BY field2 LIMIT <常量>`）。
这些表达式被转换为 MongoDB 查询语言并在服务器端执行。
您可以使用 [mongodb_throw_on_unsupported_query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query) 禁用所有这些限制。
在那种情况下，ClickHouse 尝试尽力转换查询，但这可能导致全表扫描和在 ClickHouse 方面的处理。

:::note
最好显式设置文字类型，因为 Mongo 需要严格类型的过滤器。\
例如，您想按 `Date` 进行过滤：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

这将无法工作，因为 Mongo 不会将字符串转换为 `Date`，因此您需要手动转换：

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

这适用于 `Date`、`Date32`、`DateTime`、`Bool`、`UUID`。

:::


## 使用示例 {#usage-example}


假设 MongoDB 已加载 [sample_mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix) 数据集

在 ClickHouse 中创建一个表，以允许从 MongoDB 集合中读取数据：

``` sql
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

``` sql
SELECT count() FROM sample_mflix_table
```

``` text
   ┌─count()─┐
1. │   21349 │
   └─────────┘
```

```sql
-- JSONExtractString 无法下推到 MongoDB
SET mongodb_throw_on_unsupported_query = 0;

-- 查找所有评分 > 7.5 的《回到未来》续集
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
plot:      一位年轻男子意外地被送回过去 30 年，驾驭着他的朋友艾默特·布朗博士发明的时光机器德罗宁，必须确保他的父母能相遇以拯救自己的存在。
genres:    ['冒险', '喜剧', '科幻']
directors: ['罗伯特·泽米吉斯']
released:  1985-07-03

Row 2:
──────
title:     Back to the Future Part II
plot:      在访问 2015 年后，马蒂·麦克弗莱必须重返 1955 年，以防止对 1985 年的灾难性更改……而不干扰他的第一次旅行。
genres:    ['动作', '冒险', '喜剧']
directors: ['罗伯特·泽米吉斯']
released:  1989-11-22
```

```sql
-- 查找基于科马克·麦卡锡书籍的前 3 部电影
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
您可以在 DEBUG 级别日志中查看生成的 MongoDB 查询。

实现细节可以在 [mongocxx](https://github.com/mongodb/mongo-cxx-driver) 和 [mongoc](https://github.com/mongodb/mongo-c-driver) 文档中找到。
