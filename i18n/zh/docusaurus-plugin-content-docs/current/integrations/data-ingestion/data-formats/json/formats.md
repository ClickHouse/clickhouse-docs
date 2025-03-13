---
title: 处理其他 JSON 格式
slug: /integrations/data-formats/json/other-formats
description: 处理其他 JSON 格式
keywords: ['json', 'formats', 'json formats']
---


# 处理其他格式

之前加载 JSON 数据的示例假设使用 [`JSONEachRow`](/interfaces/formats#jsoneachrow) (ndjson)。下面我们提供了在其他常见格式下加载 JSON 的示例。

## JSON 对象数组 {#array-of-json-objects}

最常见的 JSON 数据形式之一是将 JSON 对象列表放在 JSON 数组中，如 [这个示例](../assets/list.json)：

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

让我们为这种类型的数据创建一个表：

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

要导入 JSON 对象列表，我们可以使用 [`JSONEachRow`](/interfaces/formats.md/#jsoneachrow) 格式（插入来自 [list.json](../assets/list.json) 文件的数据）：

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

我们使用了 [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 子句从本地文件加载数据，可以看到导入成功：

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

## 处理 NDJSON（行分隔的 JSON） {#handling-ndjson-line-delimited-json}

许多应用程序可以以 JSON 格式记录数据，使得每一行日志都是单独的 JSON 对象，如 [这个文件](../assets/object-per-line.json) 中所示：

```bash
cat object-per-line.json
```
```response
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
```

相同的 `JSONEachRow` 格式可以处理这样的文件：

```sql
INSERT INTO sometable FROM INFILE 'object-per-line.json' FORMAT JSONEachRow;
SELECT * FROM sometable;
```
```response
┌─path──────────────────────┬──────month─┬─hits─┐
│ Bob_Dolman                │ 2016-11-01 │  245 │
│ 1-krona                   │ 2017-01-01 │    4 │
│ Ahmadabad-e_Kalij-e_Sofla │ 2017-01-01 │    3 │
└───────────────────────────┴────────────┴──────┘
```

## JSON 对象键 {#json-object-keys}

在某些情况下，JSON 对象的列表可以编码为对象属性而不是数组元素（例如，见 [objects.json](../assets/objects.json)）：

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

ClickHouse 可以使用 [`JSONObjectEachRow`](/interfaces/formats.md/#jsonobjecteachrow) 格式加载这种格式的数据：

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

假设我们还想将父对象键中的值保存到表中。在这种情况下，我们可以使用 [以下选项](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name) 来定义我们想要保存键值的列名称：

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

现在，我们可以使用 [`file()`](/sql-reference/functions/files.md/#file) 函数检查将从原始 JSON 文件加载的数据：

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

有时，为了节省空间，JSON 文件以数组形式编码而不是对象。这种情况下，我们处理的是一个 [JSON 数组列表](../assets/arrays.json)：

```bash
cat arrays.json
```
```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

在这种情况下，ClickHouse 将加载这些数据，并根据数组中值的位置将每个值归属到对应的列。我们使用 [`JSONCompactEachRow`](/interfaces/formats.md/#jsoncompacteachrow) 格式来处理这个：

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

### 从 JSON 数组导入单个列 {#importing-individual-columns-from-json-arrays}

在某些情况下，数据可以编码为列而不是行为方向。在这种情况下，父 JSON 对象包含列及其值。请查看 [以下文件](../assets/columns.json)：

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

ClickHouse 使用 [`JSONColumns`](/interfaces/formats.md/#jsoncolumns) 格式解析这种格式化的数据：

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

当处理 [列数组](../assets/columns-array.json) 而不是对象时，较紧凑的格式也可以使用 [`JSONCompactColumns`](/interfaces/formats.md/#jsoncompactcolumns) 格式来支持：

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

## 保存 JSON 对象而不是解析 {#saving-json-objects-instead-of-parsing}

某些情况下，您可能希望将 JSON 对象保存到单个 `String` （或 JSON）列中，而不是解析它。这在处理具有不同结构的 JSON 对象列表时非常有用。请查看 [这个文件](../assets/custom.json)，我们有多个不同的 JSON 对象在一个父列表中：

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

我们希望将原始 JSON 对象保存到以下表中：

```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```

现在，我们可以使用 [`JSONAsString`](/interfaces/formats.md/#jsonasstring) 格式从文件加载数据，以保持 JSON 对象而不是解析它们：

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

我们可以使用 [JSON 函数](/sql-reference/functions/json-functions.md) 查询保存的对象：

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

注意，`JSONAsString` 在我们有 JSON 对象按行格式化的文件（通常与 `JSONEachRow` 格式一起使用）中工作得很好。

## 嵌套对象的架构 {#schema-for-nested-objects}

在处理 [嵌套 JSON 对象](../assets/list-nested.json) 时，我们可以另外定义架构并使用复杂类型 ([`Array`](/sql-reference/data-types/array.md)、[`Object Data Type`](/sql-reference/data-types/object-data-type) 或 [`Tuple`](/sql-reference/data-types/tuple.md)) 来加载数据：

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

我们可以通过启用 [以下设置选项](/operations/settings/settings-formats.md/#input_format_import_nested_json) 来引用 [嵌套 JSON 键](../assets/list-nested.json)：

```sql
SET input_format_import_nested_json = 1
```

这使我们能够使用点表示法引用嵌套 JSON 对象键（记得用反引号包裹，以便正常工作）：

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

这样我们可以扁平化嵌套 JSON 对象或者使用一些嵌套值将它们作为单独的列保存。

## 跳过未知列 {#skipping-unknown-columns}

默认情况下，ClickHouse 在导入 JSON 数据时会忽略未知列。让我们尝试将原始文件导入到没有 `month` 列的表中：

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

我们仍然可以将 [原始 JSON 数据](../assets/list.json) 的 3 列插入到这个表中：

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

ClickHouse 会在导入时忽略未知列。可以使用 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 设置选项禁用此功能：

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```
```response
Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

在 JSON 和表列结构不一致的情况下，ClickHouse 会抛出异常。

## BSON {#bson}

ClickHouse 允许从 [BSON](https://bsonspec.org/) 编码的文件中导入和导出数据。此格式被某些数据库管理系统使用，例如 [MongoDB](https://github.com/mongodb/mongo) 数据库。

要导入 BSON 数据，我们使用 [BSONEachRow](/interfaces/formats.md/#bsoneachrow) 格式。让我们从 [这个 BSON 文件](../assets/data.bson) 导入数据：

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

我们也可以使用相同的格式导出到 BSON 文件：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

之后，我们的数据将导出到 `out.bson` 文件中。
