---
title: '处理其他 JSON 格式'
slug: /integrations/data-formats/json/other-formats
description: '处理其他 JSON 格式'
sidebar_label: '处理其他格式'
keywords: ['json', 'formats', 'json formats']
doc_type: 'guide'
---



# 处理其他 JSON 格式

前面加载 JSON 数据的示例假定使用 [`JSONEachRow`](/interfaces/formats/JSONEachRow)（`NDJSON`）。这种格式会将每一行 JSON 中的键解析为列。例如：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
LIMIT 5

┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

5 行数据。耗时: 0.449 秒。
```

虽然这通常是 JSON 最常用的格式，但用户也可能会遇到其他格式，或者需要将整个 JSON 当作一个对象来读取。

下面我们给出在其他常见格式下读取和加载 JSON 的示例。


## 将 JSON 作为对象读取 {#reading-json-as-an-object}

前面的示例展示了 `JSONEachRow` 如何读取换行符分隔的 JSON,每一行作为独立对象读取并映射到表的一行,每个键映射到一列。这种方式非常适合 JSON 结构可预测且每列类型单一的场景。

相比之下,`JSONAsObject` 将每一行视为单个 `JSON` 对象,并将其存储在类型为 [`JSON`](/sql-reference/data-types/newjson) 的单列中,这使其更适合处理嵌套 JSON 数据以及键动态变化且可能具有多种类型的场景。

使用 `JSONEachRow` 进行逐行插入,使用 [`JSONAsObject`](/interfaces/formats/JSONAsObject) 存储灵活或动态的 JSON 数据。

对比上述示例,以下查询将相同的数据按每行一个 JSON 对象的方式读取:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONAsObject)
LIMIT 5

┌─json─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

返回 5 行。耗时:0.338 秒。
```

`JSONAsObject` 适用于使用单个 JSON 对象列向表中插入行,例如:

```sql
CREATE TABLE pypi
(
    `json` JSON
)
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONAsObject)
LIMIT 5;

SELECT *
FROM pypi
LIMIT 2;

┌─json─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

返回 2 行。耗时:0.003 秒。
```

`JSONAsObject` 格式在对象结构不一致的情况下读取换行符分隔的 JSON 时也很有用。例如,如果某个键在不同行中的类型不同(有时是字符串,有时是对象)。在这种情况下,ClickHouse 无法使用 `JSONEachRow` 推断出稳定的 schema,而 `JSONAsObject` 允许在不进行严格类型校验的情况下摄取数据,将每个 JSON 行作为整体存储在单列中。例如,注意 `JSONEachRow` 在以下示例中如何失败:

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONEachRow')

耗时:1.198 秒。

```


从服务器收到异常（版本 24.12.1）：
Code: 636. DB::Exception: 从 sql-clickhouse.clickhouse.com:9440 收到。DB::Exception: 无法从 JSONEachRow 格式的文件中提取表结构。错误：
Code: 117. DB::Exception: JSON 对象中存在歧义数据：在某些对象中路径 &#39;record.subject&#39; 的类型是 &#39;String&#39;，而在另一些对象中则是 &#39;Tuple(`$type` String, cid String, uri String)&#39;。你可以启用设置 input&#95;format&#95;json&#95;use&#95;string&#95;type&#95;for&#95;ambiguous&#95;paths&#95;in&#95;named&#95;tuples&#95;inference&#95;from&#95;objects，以便对路径 &#39;record.subject&#39; 使用 String 类型。(INCORRECT&#95;DATA) (version 24.12.1.18239 (official build))
要增加用于结构推断的最大读取行数/字节数，请使用设置 input&#95;format&#95;max&#95;rows&#95;to&#95;read&#95;for&#95;schema&#95;inference/input&#95;format&#95;max&#95;bytes&#95;to&#95;read&#95;for&#95;schema&#95;inference。
你可以手动指定结构：（在文件/URI bluesky/file&#95;0001.json.gz 中）。(CANNOT&#95;EXTRACT&#95;TABLE&#95;STRUCTURE)

````
 
相反,在这种情况下可以使用 `JSONAsObject`,因为 `JSON` 类型支持同一子列使用多种数据类型。

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONAsObject')

┌─count()─┐
│ 1000000 │
└─────────┘

返回 1 行。用时:0.480 秒。已处理 100 万行,256.00 B(208 万行/秒,533.76 B/秒)。
````


## JSON 对象数组 {#array-of-json-objects}

JSON 数据最常见的形式之一是在 JSON 数组中包含 JSON 对象列表,如[此示例](../assets/list.json)所示:

```bash
> cat list.json
[
  {
    "path": "Akiba_Hebrew_Academy",
    "month": "2017-08-01",
    "hits": 241
  },
  {
    "path": "Aegithina_tiphia",
    "month": "2018-02-01",
    "hits": 34
  },
  ...
]
```

为这类数据创建表:

```sql
CREATE TABLE sometable
(
    `path` String,
    `month` Date,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY tuple(month, path)
```

要导入 JSON 对象列表,可以使用 [`JSONEachRow`](/interfaces/formats/JSONEachRow) 格式(从 [list.json](../assets/list.json) 文件插入数据):

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

这里使用了 [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 子句从本地文件加载数据,可以看到导入成功:

```sql
SELECT *
FROM sometable
```

```response
┌─path──────────────────────┬──────month─┬─hits─┐
│ 1971-72_Utah_Stars_season │ 2016-10-01 │    1 │
│ Akiba_Hebrew_Academy      │ 2017-08-01 │  241 │
│ Aegithina_tiphia          │ 2018-02-01 │   34 │
└───────────────────────────┴────────────┴──────┘
```


## JSON 对象键 {#json-object-keys}

在某些情况下,JSON 对象列表可以编码为对象属性而非数组元素(参见 [objects.json](../assets/objects.json) 示例):

```bash
cat objects.json
```

```response
{
  "a": {
    "path":"April_25,_2017",
    "month":"2018-01-01",
    "hits":2
  },
  "b": {
    "path":"Akahori_Station",
    "month":"2016-06-01",
    "hits":11
  },
  ...
}
```

ClickHouse 可以使用 [`JSONObjectEachRow`](/interfaces/formats/JSONObjectEachRow) 格式加载此类数据:

```sql
INSERT INTO sometable FROM INFILE 'objects.json' FORMAT JSONObjectEachRow;
SELECT * FROM sometable;
```

```response
┌─path────────────┬──────month─┬─hits─┐
│ Abducens_palsy  │ 2016-05-01 │   28 │
│ Akahori_Station │ 2016-06-01 │   11 │
│ April_25,_2017  │ 2018-01-01 │    2 │
└─────────────────┴────────────┴──────┘
```

### 指定父对象键值 {#specifying-parent-object-key-values}

假设我们还想将父对象键的值保存到表中。此时,可以使用[以下选项](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)来定义用于保存键值的列名:

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

现在,我们可以使用 [`file()`](/sql-reference/functions/files.md/#file) 函数检查将从原始 JSON 文件加载的数据:

```sql
SELECT * FROM file('objects.json', JSONObjectEachRow)
```

```response
┌─id─┬─path────────────┬──────month─┬─hits─┐
│ a  │ April_25,_2017  │ 2018-01-01 │    2 │
│ b  │ Akahori_Station │ 2016-06-01 │   11 │
│ c  │ Abducens_palsy  │ 2016-05-01 │   28 │
└────┴─────────────────┴────────────┴──────┘
```

注意 `id` 列已正确填充键值。


## JSON 数组 {#json-arrays}

有时为了节省空间,JSON 文件会以数组而非对象的形式进行编码。在这种情况下,我们需要处理一个 [JSON 数组列表](../assets/arrays.json):

```bash
cat arrays.json
```

```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

在这种情况下,ClickHouse 会加载这些数据,并根据数组中的顺序将每个值分配到相应的列。我们使用 [`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow) 格式来处理:

```sql
SELECT * FROM sometable
```

```response
┌─c1────────────────────────┬─────────c2─┬──c3─┐
│ Akiba_Hebrew_Academy      │ 2017-08-01 │ 241 │
│ Aegithina_tiphia          │ 2018-02-01 │  34 │
│ 1971-72_Utah_Stars_season │ 2016-10-01 │   1 │
└───────────────────────────┴────────────┴─────┘
```

### 从 JSON 数组导入单独的列 {#importing-individual-columns-from-json-arrays}

在某些情况下,数据可以按列而非按行进行编码。在这种情况下,父级 JSON 对象包含带有值的列。请查看[以下文件](../assets/columns.json):

```bash
cat columns.json
```

```response
{
  "path": ["2007_Copa_America", "Car_dealerships_in_the_USA", "Dihydromyricetin_reductase"],
  "month": ["2016-07-01", "2015-07-01", "2015-07-01"],
  "hits": [178, 11, 1]
}
```

ClickHouse 使用 [`JSONColumns`](/interfaces/formats/JSONColumns) 格式来解析这种格式的数据:

```sql
SELECT * FROM file('columns.json', JSONColumns)
```

```response
┌─path───────────────────────┬──────month─┬─hits─┐
│ 2007_Copa_America          │ 2016-07-01 │  178 │
│ Car_dealerships_in_the_USA │ 2015-07-01 │   11 │
│ Dihydromyricetin_reductase │ 2015-07-01 │    1 │
└────────────────────────────┴────────────┴──────┘
```

当处理[列数组](../assets/columns-array.json)而非对象时,还支持使用 [`JSONCompactColumns`](/interfaces/formats/JSONCompactColumns) 格式的更紧凑形式:

```sql
SELECT * FROM file('columns-array.json', JSONCompactColumns)
```

```response
┌─c1──────────────┬─────────c2─┬─c3─┐
│ Heidenrod       │ 2017-01-01 │ 10 │
│ Arthur_Henrique │ 2016-11-01 │ 12 │
│ Alan_Ebnother   │ 2015-11-01 │ 66 │
└─────────────────┴────────────┴────┘
```


## 保存 JSON 对象而非解析 {#saving-json-objects-instead-of-parsing}

在某些情况下,您可能希望将 JSON 对象保存到单个 `String`(或 `JSON`)列中,而不对其进行解析。当处理具有不同结构的 JSON 对象列表时,这种方式会很有用。以[此文件](../assets/custom.json)为例,其中父列表内包含多个不同的 JSON 对象:

```bash
cat custom.json
```

```response
[
  {"name": "Joe", "age": 99, "type": "person"},
  {"url": "/my.post.MD", "hits": 1263, "type": "post"},
  {"message": "Warning on disk usage", "type": "log"}
]
```

我们希望将原始 JSON 对象保存到以下表中:

```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```

现在我们可以使用 [`JSONAsString`](/interfaces/formats/JSONAsString) 格式将文件中的数据加载到此表中,以保留 JSON 对象而非解析它们:

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

然后我们可以使用 [JSON 函数](/sql-reference/functions/json-functions.md)来查询已保存的对象:

```sql
SELECT
    JSONExtractString(data, 'type') AS type,
    data
FROM events
```

```response
┌─type───┬─data─────────────────────────────────────────────────┐
│ person │ {"name": "Joe", "age": 99, "type": "person"}         │
│ post   │ {"url": "/my.post.MD", "hits": 1263, "type": "post"} │
│ log    │ {"message": "Warning on disk usage", "type": "log"}  │
└────────┴──────────────────────────────────────────────────────┘
```

请注意,`JSONAsString` 在处理每行一个 JSON 对象格式的文件(通常与 `JSONEachRow` 格式配合使用)时同样适用。


## 嵌套对象的架构 {#schema-for-nested-objects}

在处理[嵌套 JSON 对象](../assets/list-nested.json)时,我们可以额外定义显式架构,并使用复杂类型([`Array`](/sql-reference/data-types/array.md)、[`JSON`](/integrations/data-formats/json/overview) 或 [`Tuple`](/sql-reference/data-types/tuple.md))来加载数据:

```sql
SELECT *
FROM file('list-nested.json', JSONEachRow, 'page Tuple(path String, title String, owner_id UInt16), month Date, hits UInt32')
LIMIT 1
```

```response
┌─page───────────────────────────────────────────────┬──────month─┬─hits─┐
│ ('Akiba_Hebrew_Academy','Akiba Hebrew Academy',12) │ 2017-08-01 │  241 │
└────────────────────────────────────────────────────┴────────────┴──────┘
```


## 访问嵌套 JSON 对象 {#accessing-nested-json-objects}

通过启用[以下设置选项](/operations/settings/settings-formats.md/#input_format_import_nested_json),可以引用[嵌套 JSON 键](../assets/list-nested.json):

```sql
SET input_format_import_nested_json = 1
```

这样就可以使用点表示法引用嵌套 JSON 对象的键(注意需要用反引号包裹才能正常使用):

```sql
SELECT *
FROM file('list-nested.json', JSONEachRow, '`page.owner_id` UInt32, `page.title` String, month Date, hits UInt32')
LIMIT 1
```

```results
┌─page.owner_id─┬─page.title───────────┬──────month─┬─hits─┐
│            12 │ Akiba Hebrew Academy │ 2017-08-01 │  241 │
└───────────────┴──────────────────────┴────────────┴──────┘
```

通过这种方式,可以展平嵌套 JSON 对象,或将某些嵌套值保存为单独的列。


## 跳过未知列 {#skipping-unknown-columns}

默认情况下,ClickHouse 在导入 JSON 数据时会忽略未知列。让我们尝试将原始文件导入到不包含 `month` 列的表中:

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

我们仍然可以将包含 3 列的[原始 JSON 数据](../assets/list.json)插入到此表中:

```sql
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
SELECT * FROM shorttable
```

```response
┌─path──────────────────────┬─hits─┐
│ 1971-72_Utah_Stars_season │    1 │
│ Aegithina_tiphia          │   34 │
│ Akiba_Hebrew_Academy      │  241 │
└───────────────────────────┴──────┘
```

ClickHouse 在导入时会忽略未知列。可以通过 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 设置选项来禁用此行为:

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```

```response
Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

当 JSON 与表列结构不一致时,ClickHouse 将抛出异常。


## BSON {#bson}

ClickHouse 支持从 [BSON](https://bsonspec.org/) 编码文件导入和导出数据。某些数据库管理系统使用此格式,例如 [MongoDB](https://github.com/mongodb/mongo) 数据库。

要导入 BSON 数据,需要使用 [BSONEachRow](/interfaces/formats/BSONEachRow) 格式。以下示例从[此 BSON 文件](../assets/data.bson)导入数据:

```sql
SELECT * FROM file('data.bson', BSONEachRow)
```

```response
┌─path──────────────────────┬─month─┬─hits─┐
│ Bob_Dolman                │ 17106 │  245 │
│ 1-krona                   │ 17167 │    4 │
│ Ahmadabad-e_Kalij-e_Sofla │ 17167 │    3 │
└───────────────────────────┴───────┴──────┘
```

同样可以使用相同的格式导出到 BSON 文件:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

执行后,数据将被导出到 `out.bson` 文件中。
