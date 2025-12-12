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

5 rows in set. Elapsed: 0.449 sec.
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

5 rows in set. Elapsed: 0.338 sec.
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

Elapsed: 1.198 sec.

Received exception from server (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: The table structure cannot be extracted from a JSONEachRow format file. Error:
Code: 117. DB::Exception: JSON objects have ambiguous data: in some objects path 'record.subject' has type 'String' and in some - 'Tuple(`$type` String, cid String, uri String)'. You can enable setting input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects to use String type for path 'record.subject'. (INCORRECT_DATA) (version 24.12.1.18239 (official build))
To increase the maximum number of rows/bytes to read for structure determination, use setting input_format_max_rows_to_read_for_schema_inference/input_format_max_bytes_to_read_for_schema_inference.
You can specify the structure manually: (in file/uri bluesky/file_0001.json.gz). (CANNOT_EXTRACT_TABLE_STRUCTURE)
```

从服务器收到异常（版本 24.12.1）：
代码：636。DB::Exception：从 sql-clickhouse.clickhouse.com:9440 收到。DB::Exception：无法从 JSONEachRow 格式的文件中提取表结构。错误：
代码：117。DB::Exception：JSON 对象中的数据存在歧义：在某些对象中，路径 &#39;record.subject&#39; 的类型为 &#39;String&#39;，而在另一些对象中，其类型为 &#39;Tuple(`$type` String, cid String, uri String)&#39;。可以启用设置 input&#95;format&#95;json&#95;use&#95;string&#95;type&#95;for&#95;ambiguous&#95;paths&#95;in&#95;named&#95;tuples&#95;inference&#95;from&#95;objects，以对路径 &#39;record.subject&#39; 使用 String 类型。(INCORRECT&#95;DATA)（版本 24.12.1.18239 (official build)）
要增加用于结构推断的最大读取行数/字节数，请使用设置 input&#95;format&#95;max&#95;rows&#95;to&#95;read&#95;for&#95;schema&#95;inference/input&#95;format&#95;max&#95;bytes&#95;to&#95;read&#95;for&#95;schema&#95;inference。
可以手动指定结构：（在文件/URI bluesky/file&#95;0001.json.gz 中）。（CANNOT&#95;EXTRACT&#95;TABLE&#95;STRUCTURE）

````sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONAsObject')

┌─count()─┐
│ 1000000 │
└─────────┘

1 row in set. Elapsed: 0.480 sec. Processed 1.00 million rows, 256.00 B (2.08 million rows/s., 533.76 B/s.)
```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONAsObject')

┌─count()─┐
│ 1000000 │
└─────────┘

1 row in set. Elapsed: 0.480 sec. Processed 1.00 million rows, 256.00 B (2.08 million rows/s., 533.76 B/s.)
````bash
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
```sql
CREATE TABLE sometable
(
    `path` String,
    `month` Date,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY tuple(month, path)
```sql
CREATE TABLE sometable
(
    `path` String,
    `month` Date,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY tuple(month, path)
```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```sql
SELECT *
FROM sometable
```sql
SELECT *
FROM sometable
```response
┌─path──────────────────────┬──────month─┬─hits─┐
│ 1971-72_Utah_Stars_season │ 2016-10-01 │    1 │
│ Akiba_Hebrew_Academy      │ 2017-08-01 │  241 │
│ Aegithina_tiphia          │ 2018-02-01 │   34 │
└───────────────────────────┴────────────┴──────┘
```response
┌─路径──────────────────────┬──────月份─┬─点击─┐
│ 1971-72_Utah_Stars_season │ 2016-10-01 │    1 │
│ Akiba_Hebrew_Academy      │ 2017-08-01 │  241 │
│ Aegithina_tiphia          │ 2018-02-01 │   34 │
└───────────────────────────┴────────────┴──────┘
```bash
cat objects.json
```bash
cat objects.json
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
```sql
INSERT INTO sometable FROM INFILE 'objects.json' FORMAT JSONObjectEachRow;
SELECT * FROM sometable;
```sql
INSERT INTO sometable FROM INFILE 'objects.json' FORMAT JSONObjectEachRow;
SELECT * FROM sometable;
```response
┌─path────────────┬──────month─┬─hits─┐
│ Abducens_palsy  │ 2016-05-01 │   28 │
│ Akahori_Station │ 2016-06-01 │   11 │
│ April_25,_2017  │ 2018-01-01 │    2 │
└─────────────────┴────────────┴──────┘
```response
┌─path────────────┬──────month─┬─hits─┐
│ Abducens_palsy  │ 2016-05-01 │   28 │
│ Akahori_Station │ 2016-06-01 │   11 │
│ April_25,_2017  │ 2018-01-01 │    2 │
└─────────────────┴────────────┴──────┘
```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```sql
SELECT * FROM file('objects.json', JSONObjectEachRow)
```sql
SELECT * FROM file('objects.json', JSONObjectEachRow)
```response
┌─id─┬─path────────────┬──────month─┬─hits─┐
│ a  │ April_25,_2017  │ 2018-01-01 │    2 │
│ b  │ Akahori_Station │ 2016-06-01 │   11 │
│ c  │ Abducens_palsy  │ 2016-05-01 │   28 │
└────┴─────────────────┴────────────┴──────┘
```response
┌─id─┬─path────────────┬──────month─┬─hits─┐
│ a  │ April_25,_2017  │ 2018-01-01 │    2 │
│ b  │ Akahori_Station │ 2016-06-01 │   11 │
│ c  │ Abducens_palsy  │ 2016-05-01 │   28 │
└────┴─────────────────┴────────────┴──────┘
```bash
cat arrays.json
```bash
cat arrays.json
```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```sql
SELECT * FROM sometable
```sql
SELECT * FROM sometable
```response
┌─c1────────────────────────┬─────────c2─┬──c3─┐
│ Akiba_Hebrew_Academy      │ 2017-08-01 │ 241 │
│ Aegithina_tiphia          │ 2018-02-01 │  34 │
│ 1971-72_Utah_Stars_season │ 2016-10-01 │   1 │
└───────────────────────────┴────────────┴─────┘
```response
┌─c1────────────────────────┬─────────c2─┬──c3─┐
│ Akiba_Hebrew_Academy      │ 2017-08-01 │ 241 │
│ Aegithina_tiphia          │ 2018-02-01 │  34 │
│ 1971-72_Utah_Stars_season │ 2016-10-01 │   1 │
└───────────────────────────┴────────────┴─────┘
```bash
cat columns.json
```bash
cat columns.json
```response
{
  "path": ["2007_Copa_America", "Car_dealerships_in_the_USA", "Dihydromyricetin_reductase"],
  "month": ["2016-07-01", "2015-07-01", "2015-07-01"],
  "hits": [178, 11, 1]
}
```response
{
  "path": ["2007_Copa_America", "Car_dealerships_in_the_USA", "Dihydromyricetin_reductase"],
  "month": ["2016-07-01", "2015-07-01", "2015-07-01"],
  "hits": [178, 11, 1]
}
```sql
SELECT * FROM file('columns.json', JSONColumns)
```sql
SELECT * FROM file('columns.json', JSONColumns)
```response
┌─path───────────────────────┬──────month─┬─hits─┐
│ 2007_Copa_America          │ 2016-07-01 │  178 │
│ Car_dealerships_in_the_USA │ 2015-07-01 │   11 │
│ Dihydromyricetin_reductase │ 2015-07-01 │    1 │
└────────────────────────────┴────────────┴──────┘
```response
┌─path───────────────────────┬──────month─┬─hits─┐
│ 2007_Copa_America          │ 2016-07-01 │  178 │
│ Car_dealerships_in_the_USA │ 2015-07-01 │   11 │
│ Dihydromyricetin_reductase │ 2015-07-01 │    1 │
└────────────────────────────┴────────────┴──────┘
```sql
SELECT * FROM file('columns-array.json', JSONCompactColumns)
```sql
SELECT * FROM file('columns-array.json', JSONCompactColumns)
```response
┌─c1──────────────┬─────────c2─┬─c3─┐
│ Heidenrod       │ 2017-01-01 │ 10 │
│ Arthur_Henrique │ 2016-11-01 │ 12 │
│ Alan_Ebnother   │ 2015-11-01 │ 66 │
└─────────────────┴────────────┴────┘
```response
┌─c1──────────────┬─────────c2─┬─c3─┐
│ Heidenrod       │ 2017-01-01 │ 10 │
│ Arthur_Henrique │ 2016-11-01 │ 12 │
│ Alan_Ebnother   │ 2015-11-01 │ 66 │
└─────────────────┴────────────┴────┘
```bash
cat custom.json
```bash
cat custom.json
```response
[
  {"name": "Joe", "age": 99, "type": "person"},
  {"url": "/my.post.MD", "hits": 1263, "type": "post"},
  {"message": "Warning on disk usage", "type": "log"}
]
```response
[
  {"name": "Joe", "age": 99, "type": "person"},
  {"url": "/my.post.MD", "hits": 1263, "type": "post"},
  {"message": "磁盘使用率警告", "type": "log"}
]
```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```sql
SELECT
    JSONExtractString(data, 'type') AS type,
    data
FROM events
```sql
SELECT
    JSONExtractString(data, 'type') AS type,
    data
FROM events
```response
┌─type───┬─data─────────────────────────────────────────────────┐
│ person │ {"name": "Joe", "age": 99, "type": "person"}         │
│ post   │ {"url": "/my.post.MD", "hits": 1263, "type": "post"} │
│ log    │ {"message": "Warning on disk usage", "type": "log"}  │
└────────┴──────────────────────────────────────────────────────┘
```response
┌─type───┬─data─────────────────────────────────────────────────┐
│ person │ {"name": "Joe", "age": 99, "type": "person"}         │
│ post   │ {"url": "/my.post.MD", "hits": 1263, "type": "post"} │
│ log    │ {"message": "Warning on disk usage", "type": "log"}  │
└────────┴──────────────────────────────────────────────────────┘
```sql
SELECT *
FROM file('list-nested.json', JSONEachRow, 'page Tuple(path String, title String, owner_id UInt16), month Date, hits UInt32')
LIMIT 1
```sql
SELECT *
FROM file('list-nested.json', JSONEachRow, 'page Tuple(path String, title String, owner_id UInt16), month Date, hits UInt32')
LIMIT 1
```response
┌─page───────────────────────────────────────────────┬──────month─┬─hits─┐
│ ('Akiba_Hebrew_Academy','Akiba Hebrew Academy',12) │ 2017-08-01 │  241 │
└────────────────────────────────────────────────────┴────────────┴──────┘
```response
┌─page───────────────────────────────────────────────┬──────month─┬─hits─┐
│ ('Akiba_Hebrew_Academy','Akiba Hebrew Academy',12) │ 2017-08-01 │  241 │
└────────────────────────────────────────────────────┴────────────┴──────┘
```sql
SET input_format_import_nested_json = 1
```sql
SET input_format_import_nested_json = 1
```sql
SELECT *
FROM file('list-nested.json', JSONEachRow, '`page.owner_id` UInt32, `page.title` String, month Date, hits UInt32')
LIMIT 1
```sql
SELECT *
FROM file('list-nested.json', JSONEachRow, '`page.owner_id` UInt32, `page.title` String, month Date, hits UInt32')
LIMIT 1
```results
┌─page.owner_id─┬─page.title───────────┬──────month─┬─hits─┐
│            12 │ Akiba Hebrew Academy │ 2017-08-01 │  241 │
└───────────────┴──────────────────────┴────────────┴──────┘
```results
┌─page.owner_id─┬─page.title───────────┬──────month─┬─hits─┐
│            12 │ Akiba Hebrew Academy │ 2017-08-01 │  241 │
└───────────────┴──────────────────────┴────────────┴──────┘
```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```sql
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
SELECT * FROM shorttable
```sql
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
SELECT * FROM shorttable
```response
┌─path──────────────────────┬─hits─┐
│ 1971-72_Utah_Stars_season │    1 │
│ Aegithina_tiphia          │   34 │
│ Akiba_Hebrew_Academy      │  241 │
└───────────────────────────┴──────┘
```response
┌─path──────────────────────┬─hits─┐
│ 1971-72_Utah_Stars_season │    1 │
│ Aegithina_tiphia          │   34 │
│ Akiba_Hebrew_Academy      │  241 │
└───────────────────────────┴──────┘
```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```response
Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```response
Ok.
客户端异常:
Code: 117. DB::Exception: 解析 JSONEachRow 格式时发现未知字段: month: (位于文件/URI /data/clickhouse/user_files/list.json): (第 1 行)
```sql
SELECT * FROM file('data.bson', BSONEachRow)
```sql
SELECT * FROM file('data.bson', BSONEachRow)
```response
┌─path──────────────────────┬─month─┬─hits─┐
│ Bob_Dolman                │ 17106 │  245 │
│ 1-krona                   │ 17167 │    4 │
│ Ahmadabad-e_Kalij-e_Sofla │ 17167 │    3 │
└───────────────────────────┴───────┴──────┘
```response
┌─path──────────────────────┬─month─┬─hits─┐
│ Bob_Dolman                │ 17106 │  245 │
│ 1-krona                   │ 17167 │    4 │
│ Ahmadabad-e_Kalij-e_Sofla │ 17167 │    3 │
└───────────────────────────┴───────┴──────┘
```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

接下来，我们的数据会被导出到 `out.bson` 文件中。
