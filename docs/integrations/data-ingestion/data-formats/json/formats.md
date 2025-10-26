---
title: 'Handling other JSON formats'
slug: /integrations/data-formats/json/other-formats
description: 'Handling other JSON formats'
sidebar_label: 'Handling other formats'
keywords: ['json', 'formats', 'json formats']
doc_type: 'guide'
---

# Handling other JSON formats

Earlier examples of loading JSON data assume the use of [`JSONEachRow`](/interfaces/formats/JSONEachRow) (`NDJSON`). This format reads the keys in each JSON line as columns. For example:

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

While this is generally the most commonly used format for JSON, users will encounter other formats or need to read the JSON as a single object.

We provide examples of reading and loading JSON in other common formats below.

## Reading JSON as an object {#reading-json-as-an-object}

Our previous examples show how `JSONEachRow` reads newline-delimited JSON, with each line read as a separate object mapped to a table row and each key to a column. This is ideal for cases where the JSON is predictable with single types for each column. 

In contrast, `JSONAsObject` treats each line as a single `JSON` object and stores it in a single column, of type [`JSON`](/sql-reference/data-types/newjson), making it better suited for nested JSON payloads and cases where the keys are dynamic and have potentially more than one type. 

Use `JSONEachRow` for row-wise inserts, and [`JSONAsObject`](/interfaces/formats/JSONAsObject) when storing flexible or dynamic JSON data.

Contrast the above example, with the following query which reads the same data as a JSON object per line:

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

`JSONAsObject` is useful for inserting rows into a table using a single JSON object column e.g.

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

The `JSONAsObject` format may also be useful for reading newline-delimited JSON in cases where the structure of the objects is inconsistent. For example, if a key varies in type across rows (it may sometimes be a string, but other times an object). In such cases, ClickHouse cannot infer a stable schema using `JSONEachRow`, and `JSONAsObject` allows the data to be ingested without strict type enforcement, storing each JSON row as a whole in a single column. For example, notice how `JSONEachRow` fails on the following example:

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
 
Conversely, `JSONAsObject` can be used in this case as the `JSON` type supports multiple types for the same subcolumn.

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONAsObject')

┌─count()─┐
│ 1000000 │
└─────────┘

1 row in set. Elapsed: 0.480 sec. Processed 1.00 million rows, 256.00 B (2.08 million rows/s., 533.76 B/s.)
```

## Array of JSON objects {#array-of-json-objects}

One of the most popular forms of JSON data is having a list of JSON objects in a JSON array, like in [this example](../assets/list.json):

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

Let's create a table for this kind of data:

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

To import a list of JSON objects, we can use a [`JSONEachRow`](/interfaces/formats/JSONEachRow) format (inserting data from [list.json](../assets/list.json) file):

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

We have used a [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) clause to load data from the local file, and we can see the import was successful:

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

## JSON object keys {#json-object-keys}

In some cases, the list of JSON objects can be encoded as object properties instead of array elements (see [objects.json](../assets/objects.json) for example):

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

ClickHouse can load data from this kind of data using the [`JSONObjectEachRow`](/interfaces/formats/JSONObjectEachRow) format:

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

### Specifying parent object key values {#specifying-parent-object-key-values}

Let's say we also want to save values in parent object keys to the table. In this case, we can use the [following option](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name) to define the name of the column we want key values to be saved to:

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

Now, we can check which data is going to be loaded from the original JSON file using [`file()`](/sql-reference/functions/files.md/#file) function:

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

Note how the `id` column has been populated by key values correctly.

## JSON arrays {#json-arrays}

Sometimes, for the sake of saving space, JSON files are encoded in arrays instead of objects. In this case, we deal with a [list of JSON arrays](../assets/arrays.json):

```bash
cat arrays.json
```
```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

In this case, ClickHouse will load this data and attribute each value to the corresponding column based on its order in the array. We use [`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow) format for this:

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

### Importing individual columns from JSON arrays {#importing-individual-columns-from-json-arrays}

In some cases, data can be encoded column-wise instead of row-wise. In this case, a parent JSON object contains columns with values. Take a look at the [following file](../assets/columns.json):

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

ClickHouse uses the [`JSONColumns`](/interfaces/formats/JSONColumns) format to parse data formatted like that:

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

A more compact format is also supported when dealing with an [array of columns](../assets/columns-array.json) instead of an object using [`JSONCompactColumns`](/interfaces/formats/JSONCompactColumns) format:

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

## Saving JSON objects instead of parsing {#saving-json-objects-instead-of-parsing}

There are cases you might want to save JSON objects to a single `String` (or `JSON`) column instead of parsing it. This can be useful when dealing with a list of JSON objects of different structures. Let's take [this file](../assets/custom.json) for example, where we have multiple different JSON objects inside a parent list:

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

We want to save original JSON objects into the following table:

```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```

Now we can load data from the file into this table using [`JSONAsString`](/interfaces/formats/JSONAsString) format to keep JSON objects instead of parsing them:

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

And we can use [JSON functions](/sql-reference/functions/json-functions.md) to query saved objects:

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

Note that `JSONAsString` works perfectly fine in cases we have JSON object-per-line formatted files (usually used with `JSONEachRow` format).

## Schema for nested objects {#schema-for-nested-objects}

In cases when we're dealing with [nested JSON objects](../assets/list-nested.json), we can additionally define an explicit schema and use complex types ([`Array`](/sql-reference/data-types/array.md), [`JSON`](/integrations/data-formats/json/overview) or [`Tuple`](/sql-reference/data-types/tuple.md)) to load data:

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

## Accessing nested JSON objects {#accessing-nested-json-objects}

We can refer to [nested JSON keys](../assets/list-nested.json) by enabling the [following settings option](/operations/settings/settings-formats.md/#input_format_import_nested_json):

```sql
SET input_format_import_nested_json = 1
```

This allows us to refer to nested JSON object keys using dot notation (remember to wrap those with backtick symbols to work):

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

This way we can flatten nested JSON objects or use some nested values to save them as separate columns.

## Skipping unknown columns {#skipping-unknown-columns}

By default, ClickHouse will ignore unknown columns when importing JSON data. Let's try to import the original file into the table without the `month` column:

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

We can still insert the [original JSON data](../assets/list.json) with 3 columns into this table:

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

ClickHouse will ignore unknown columns while importing. This can be disabled with the [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) settings option:

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```
```response
Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

ClickHouse will throw exceptions in cases of inconsistent JSON and table columns structure.

## BSON {#bson}

ClickHouse allows exporting to and importing data from [BSON](https://bsonspec.org/) encoded files. This format is used by some DBMSs, e.g. [MongoDB](https://github.com/mongodb/mongo) database.

To import BSON data, we use the [BSONEachRow](/interfaces/formats/BSONEachRow) format. Let's import data from [this BSON file](../assets/data.bson):

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

We can also export to BSON files using the same format:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

After that, we'll have our data exported to the `out.bson` file.
