---
'title': '处理其他 JSON 格式'
'slug': '/integrations/data-formats/json/other-formats'
'description': '处理其他 JSON 格式'
'sidebar_label': '处理其他格式'
'keywords':
- 'json'
- 'formats'
- 'json formats'
'doc_type': 'guide'
---


# 处理其他 JSON 格式

早期加载 JSON 数据的示例假设使用 [`JSONEachRow`](/interfaces/formats/JSONEachRow)（`NDJSON`）。该格式将每行 JSON 中的键作为列读取。例如：

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

5 rows in set. Elapsed: 0.449 sec.
```

虽然这通常是 JSON 最常用的格式，但用户可能会遇到其他格式，或者需要将 JSON 作为单个对象读取。

我们在下面提供了读取和加载其他常见格式 JSON 的示例。

## 将 JSON 作为对象读取 {#reading-json-as-an-object}

我们之前的示例展示了 `JSONEachRow` 如何读取以换行符分隔的 JSON，每行作为单独的对象映射到表行，每个键映射到列。这对于 JSON 可预测且每列只有单一类型的情况是理想的。

相反，`JSONAsObject` 将每行视为一个单一的 `JSON` 对象，并将其存储在类型为 [`JSON`](/sql-reference/data-types/newjson) 的单个列中，这使得它更适合嵌套 JSON 有效载荷和键动态且可能具有多个类型的情况。

在进行逐行插入时使用 `JSONEachRow`，而在存储灵活或动态 JSON 数据时使用 [`JSONAsObject`](/interfaces/formats/JSONAsObject)。

将上面的示例与以下查询进行对比，该查询每行读取相同数据作为 JSON 对象：

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

5 rows in set. Elapsed: 0.338 sec.
```

`JSONAsObject` 对于使用单个 JSON 对象列插入表行非常有用，例如：

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

当对象结构不一致时，`JSONAsObject` 格式对于读取以换行符分隔的 JSON 也可能很有用。例如，如果一个键在不同的行中类型不一致（它有时是字符串，有时是对象）。在这种情况下，ClickHouse 无法通过 `JSONEachRow` 推断出稳定的模式，而 `JSONAsObject` 允许数据在不强制类型的情况下被摄取，将每个 JSON 行作为整体存储在单个列中。例如，注意 `JSONEachRow` 在以下示例中失败：

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONEachRow')

Elapsed: 1.198 sec.

Received exception from server (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: The table structure cannot be extracted from a JSONEachRow format file. Error:
Code: 117. DB::Exception: JSON objects have ambiguous data: in some objects path 'record.subject' has type 'String' and in some - 'Tuple(`$type` String, cid String, uri String)'. You can enable setting input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects to use String type for path 'record.subject'. (INCORRECT_DATA) (version 24.12.1.18239 (official build))
To increase the maximum number of rows/bytes to read for structure determination, use setting input_format_max_rows_to_read_for_schema_inference/input_format_max_bytes_to_read_for_schema_inference.
You can specify the structure manually: (in file/uri bluesky/file_0001.json.gz). (CANNOT_EXTRACT_TABLE_STRUCTURE)
```
 
相反，`JSONAsObject` 可以在这种情况下使用，因为 `JSON` 类型支持同一子列的多种类型。

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONAsObject')

┌─count()─┐
│ 1000000 │
└─────────┘

1 row in set. Elapsed: 0.480 sec. Processed 1.00 million rows, 256.00 B (2.08 million rows/s., 533.76 B/s.)
```

## JSON 对象数组 {#array-of-json-objects}

JSON 数据中最流行的形式之一是在 JSON 数组中拥有 JSON 对象列表，例如 [这个示例](../assets/list.json)：

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

让我们为这种数据创建一个表：

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

要导入 JSON 对象列表，我们可以使用 [`JSONEachRow`](/interfaces/formats.md/#jsoneachrow) 格式（从 [list.json](../assets/list.json) 文件插入数据）：

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

我们使用了 [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 子句从本地文件加载数据，我们可以看到导入成功：

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

在某些情况下，JSON 对象列表可以被编码为对象属性，而不是数组元素（参见 [objects.json](../assets/objects.json) 作为示例）：

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

ClickHouse 可以使用 [`JSONObjectEachRow`](/interfaces/formats.md/#jsonobjecteachrow) 格式从这种数据加载数据：

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

假设我们还想将父对象键中的值保存到表中。在这种情况下，我们可以使用 [以下选项](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name) 来定义我们希望保存键值的列的名称：

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

现在，我们可以使用 [`file()`](/sql-reference/functions/files.md/#file) 函数检查将从原始 JSON 文件加载哪些数据：

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

有时，为了节省空间，JSON 文件被编码为数组而不是对象。在这种情况下，我们处理的是 [JSON 数组列表](../assets/arrays.json)：

```bash
cat arrays.json
```
```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

在这种情况下，ClickHouse 将加载此数据并根据数组中的顺序将每个值归属到相应的列。我们使用 [`JSONCompactEachRow`](/interfaces/formats.md/#jsoncompacteachrow) 格式来处理：

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

### 从 JSON 数组导入单独列 {#importing-individual-columns-from-json-arrays}

在某些情况下，数据可以被编码为列式而不是行式。在这种情况下，一个父 JSON 对象包含带有值的列。看看 [以下文件](../assets/columns.json)：

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

ClickHouse 使用 [`JSONColumns`](/interfaces/formats.md/#jsoncolumns) 格式解析如此格式的数据：

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

在处理 [列数组](../assets/columns-array.json) 而不是使用 [`JSONCompactColumns`](/interfaces/formats.md/#jsoncompactcolumns) 格式的对象时，还支持更紧凑的格式：

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

在某些情况下，您可能希望将 JSON 对象保存到单个 `String`（或 `JSON`）列中，而不是解析它。当处理具有不同结构的 JSON 对象列表时，这可能会很有用。以 [这个文件](../assets/custom.json) 为例，我们在一个父列表中有多个不同的 JSON 对象：

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

现在我们可以使用 [`JSONAsString`](/interfaces/formats.md/#jsonasstring) 格式从文件加载数据，以保持 JSON 对象而不是解析它们：

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

我们可以使用 [JSON 函数](/sql-reference/functions/json-functions.md) 来查询保存的对象：

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

注意 `JSONAsString` 在我们有 JSON 对象逐行格式化文件（通常与 `JSONEachRow` 格式一起使用）时非常有效。

## 嵌套对象的模式 {#schema-for-nested-objects}

在处理 [嵌套 JSON 对象](../assets/list-nested.json) 的情况下，我们还可以定义明确的模式，并使用复杂类型（[`Array`](/sql-reference/data-types/array.md)，[`JSON`](/integrations/data-formats/json/overview) 或 [`Tuple`](/sql-reference/data-types/tuple.md)）来加载数据：

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

这使我们能够使用点符号引用嵌套 JSON 对象键（记得用反引号符号包裹以生效）：

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

这样我们可以将嵌套 JSON 对象扁平化或使用某些嵌套值将它们保存为独立的列。

## 跳过未知列 {#skipping-unknown-columns}

默认情况下，ClickHouse 在导入 JSON 数据时会忽略未知列。让我们尝试将原始文件导入到不包含 `month` 列的表中：

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

我们仍然可以将 [原始 JSON 数据](../assets/list.json) 以 3 列插入此表：

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

ClickHouse 在导入时将忽略未知列。这可以通过 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 设置选项禁用：

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```
```response
Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

在 JSON 和表列结构不一致的情况下，ClickHouse 将抛出异常。

## BSON {#bson}

ClickHouse 允许从 [BSON](https://bsonspec.org/) 编码文件中导出和导入数据。该格式被一些 DBMS 使用，例如 [MongoDB](https://github.com/mongodb/mongo) 数据库。

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

我们还可以使用相同格式导出到 BSON 文件：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

之后，我们的数据将导出到 `out.bson` 文件中。
