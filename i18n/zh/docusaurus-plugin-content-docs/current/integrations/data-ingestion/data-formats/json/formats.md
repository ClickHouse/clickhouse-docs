---
title: '处理其他 JSON 格式'
slug: /integrations/data-formats/json/other-formats
description: '处理其他 JSON 格式'
sidebar_label: '处理其他格式'
keywords: ['json', 'formats', 'json formats']
doc_type: 'guide'
---

# 处理其他 JSON 格式 {#handling-other-json-formats}

此前的 JSON 数据加载示例假定使用 [`JSONEachRow`](/interfaces/formats/JSONEachRow)（`NDJSON`）。这种格式会将每一行 JSON 中的键读取为列。例如：

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

虽然这通常是最常用的 JSON 格式，但用户也可能遇到其他格式，或者需要将整个 JSON 当作单个对象来读取。

下面我们提供了一些示例，展示如何读取和加载其他常见格式的 JSON。

## 将 JSON 读取为对象 {#reading-json-as-an-object}

之前的示例展示了 `JSONEachRow` 如何读取按行分隔的 JSON：每一行被读取为一个独立对象，并映射到一行表记录，每个键对应一列。对于各列类型单一且可预期的 JSON，这种方式非常理想。

相比之下，`JSONAsObject` 将每一行视为单个 `JSON` 对象，并将其存储在一个类型为 [`JSON`](/sql-reference/data-types/newjson) 的单独列中，这使其更适合嵌套 JSON 负载，以及键名动态且同一键可能具有多种类型的场景。

在逐行插入时使用 `JSONEachRow`，在需要存储灵活或动态 JSON 数据时则使用 [`JSONAsObject`](/interfaces/formats/JSONAsObject)。

对比上面的示例，下面这个查询会将同样的数据逐行读取为 JSON 对象：

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

结果集包含 5 行。用时：0.338 秒。
```

`JSONAsObject` 在使用单个 JSON 对象列向表中插入行时非常有用，例如：

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

2 rows in set. Elapsed: 0.003 sec.
```

在对象结构不一致的情况下，`JSONAsObject` 格式在读取按行分隔（newline-delimited）的 JSON 时也非常有用。比如，当某个键在不同行中的类型不一致（有时是字符串，有时又是对象）。在这类场景中，ClickHouse 无法使用 `JSONEachRow` 推断出稳定的模式，而 `JSONAsObject` 允许在不进行严格类型约束的前提下摄取数据，将每一行 JSON 作为整体存储在单个列中。比如，请注意 `JSONEachRow` 在下面的示例中是如何无法处理的：

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONEachRow')

耗时：1.198 秒。
```

从服务器收到异常（版本 24.12.1）：
代码：636。DB::Exception：从 sql-clickhouse.clickhouse.com:9440 收到。DB::Exception：无法从 JSONEachRow 格式的文件中提取表结构。错误：
代码：117。DB::Exception：JSON 对象中的数据存在歧义：在某些对象中，路径 &#39;record.subject&#39; 的类型为 &#39;String&#39;，而在另一些对象中，其类型为 &#39;Tuple(`$type` String, cid String, uri String)&#39;。可以启用设置 input&#95;format&#95;json&#95;use&#95;string&#95;type&#95;for&#95;ambiguous&#95;paths&#95;in&#95;named&#95;tuples&#95;inference&#95;from&#95;objects，以对路径 &#39;record.subject&#39; 使用 String 类型。(INCORRECT&#95;DATA)（版本 24.12.1.18239 (official build)）
要增加用于结构推断的最大读取行数/字节数，请使用设置 input&#95;format&#95;max&#95;rows&#95;to&#95;read&#95;for&#95;schema&#95;inference/input&#95;format&#95;max&#95;bytes&#95;to&#95;read&#95;for&#95;schema&#95;inference。
可以手动指定结构：（在文件/URI bluesky/file&#95;0001.json.gz 中）。（CANNOT&#95;EXTRACT&#95;TABLE&#95;STRUCTURE）

````
 
相反,在这种情况下可以使用 `JSONAsObject`,因为 `JSON` 类型支持同一子列使用多种类型。

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONAsObject')

┌─count()─┐
│ 1000000 │
└─────────┘

1 row in set. Elapsed: 0.480 sec. Processed 1.00 million rows, 256.00 B (2.08 million rows/s., 533.76 B/s.)
````

## JSON 对象数组 {#array-of-json-objects}

最常见的 JSON 数据形式之一，是在一个 JSON 数组中包含一系列 JSON 对象，就像[这个示例](../assets/list.json)中那样：

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

让我们为此类数据创建一张表：

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

要导入一组 JSON 对象，我们可以使用 [`JSONEachRow`](/interfaces/formats/JSONEachRow) 格式（从 [list.json](../assets/list.json) 文件中插入数据）：

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

我们使用 [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 子句从本地文件加载数据，可以看到导入已经成功：

```sql
SELECT *
FROM sometable
```

```response
┌─路径──────────────────────┬──────月份─┬─点击─┐
│ 1971-72_Utah_Stars_season │ 2016-10-01 │    1 │
│ Akiba_Hebrew_Academy      │ 2017-08-01 │  241 │
│ Aegithina_tiphia          │ 2018-02-01 │   34 │
└───────────────────────────┴────────────┴──────┘
```

## JSON 对象键 {#json-object-keys}

在某些情况下，JSON 对象的列表可以表示为对象属性，而不是数组元素（示例参见 [objects.json](../assets/objects.json)）：

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

ClickHouse 可以使用 [`JSONObjectEachRow`](/interfaces/formats/JSONObjectEachRow) 格式从这类数据中加载数据：

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

### 指定父对象键的值 {#specifying-parent-object-key-values}

假设我们还希望将父对象键对应的值保存到表中。在这种情况下，我们可以使用[以下选项](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)来定义用于保存键值的列名：

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

现在，我们可以使用 [`file()`](/sql-reference/functions/files.md/#file) 函数来检查将从原始 JSON 文件加载哪些数据：

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

请注意，`id` 列已经根据键值被正确填充。

## JSON 数组 {#json-arrays}

有时，为了节省空间，JSON 文件会被编码为数组形式而不是对象。在这种情况下，我们要处理的是一个由 JSON 数组组成的[列表](../assets/arrays.json)：

```bash
cat arrays.json
```

```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

在这种情况下，ClickHouse 会加载这些数据，并根据数组中值的顺序，将每个值映射到对应的列。为此，我们使用 [`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow) 格式：

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

### 从 JSON 数组中导入单个列 {#importing-individual-columns-from-json-arrays}

在某些情况下，数据可以按列编码，而不是按行编码。在这种情况下，父级 JSON 对象中包含各个列及其对应的值。请查看[以下文件](../assets/columns.json)：

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

ClickHouse 使用 [`JSONColumns`](/interfaces/formats/JSONColumns) 格式来解析此类格式的数据：

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

在处理 [列数组](../assets/columns-array.json) 而非对象时，还支持一种更紧凑的格式，即使用 [`JSONCompactColumns`](/interfaces/formats/JSONCompactColumns) 格式：

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

## 将 JSON 对象直接保存而不进行解析 {#saving-json-objects-instead-of-parsing}

在某些情况下，可能希望将 JSON 对象保存到单个 `String`（或 `JSON`）列中，而不是对其进行解析。当处理结构各不相同的一组 JSON 对象时，这样做会很有用。以[这个文件](../assets/custom.json)为例，其中在一个父列表中包含多个不同的 JSON 对象：

```bash
cat custom.json
```

```response
[
  {"name": "Joe", "age": 99, "type": "person"},
  {"url": "/my.post.MD", "hits": 1263, "type": "post"},
  {"message": "磁盘使用率警告", "type": "log"}
]
```

要将原始 JSON 对象存入下表：

```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```

现在我们可以使用 [`JSONAsString`](/interfaces/formats/JSONAsString) 格式将文件中的数据加载到该表中，以保留 JSON 对象本身，而不是对其进行解析：

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

然后我们可以使用 [JSON 函数](/sql-reference/functions/json-functions.md) 来查询已存储的对象：

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

请注意，对于每行一个 JSON 对象的文件（通常与 `JSONEachRow` 格式一起使用），`JSONAsString` 完全可以正常工作。

## 嵌套对象的模式 {#schema-for-nested-objects}

在处理[嵌套 JSON 对象](../assets/list-nested.json)时，我们还可以显式定义模式，并使用复杂类型（[`Array`](/sql-reference/data-types/array.md)、[`JSON`](/integrations/data-formats/json/overview) 或 [`Tuple`](/sql-reference/data-types/tuple.md)）来加载数据：

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

我们可以通过启用[以下设置选项](/operations/settings/settings-formats.md/#input_format_import_nested_json)来访问[嵌套 JSON 键](../assets/list-nested.json)：

```sql
SET input_format_import_nested_json = 1
```

这使我们可以使用点号表示法来引用嵌套的 JSON 对象键（记得将这些键名用反引号包裹起来才能生效）：

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

通过这种方式，我们可以展开嵌套的 JSON 对象，或者利用其中的一些嵌套字段，将它们保存为单独的列。

## 跳过未知列 {#skipping-unknown-columns}

默认情况下，ClickHouse 在导入 JSON 数据时会忽略未知列。我们来尝试在不包含 `month` 列的情况下，将原始文件导入该表中：

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

我们仍然可以将这份包含 3 列的[原始 JSON 数据](../assets/list.json)插入到该表中：

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

ClickHouse 在导入数据时会忽略未知列。可以通过 [input&#95;format&#95;skip&#95;unknown&#95;fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 设置选项来禁用此行为：

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```

```response
Ok.
客户端异常:
Code: 117. DB::Exception: 解析 JSONEachRow 格式时发现未知字段: month: (位于文件/URI /data/clickhouse/user_files/list.json): (第 1 行)
```

在 JSON 结构与表的列结构不一致的情况下，ClickHouse 会抛出异常。

## BSON {#bson}

ClickHouse 允许将数据导出到 [BSON](https://bsonspec.org/) 编码文件，也支持从中导入数据。该格式被一些 DBMS 使用，例如 [MongoDB](https://github.com/mongodb/mongo) 数据库。

要导入 BSON 数据，我们使用 [BSONEachRow](/interfaces/formats/BSONEachRow) 格式。让我们从[这个 BSON 文件](../assets/data.bson)中导入数据：

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

我们也可以使用同样的格式导出为 BSON 文件：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

接下来，我们的数据会被导出到 `out.bson` 文件中。
