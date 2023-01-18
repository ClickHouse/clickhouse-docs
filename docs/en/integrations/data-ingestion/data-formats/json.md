# Importing and exporting JSON data in ClickHouse

JSON is a popular format for exchanging data between different layers of modern applications. ClickHouse provides many tuning options to support almost any form of JSON data.


## Importing JSON data

To import JSON data, we first have to define which JSON type to use. This will depend on how the input data is structured.

### Importing from an array of JSON objects

One of the most popular forms of JSON data is having a list of JSON objects in a JSON array, like in [this example](assets/list.json):


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

Let’s create a table for this kind of data:

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

To import a list of JSON objects, we can use a [JSONEachRow](https://clickhouse.com/docs/en/interfaces/formats/#jsoneachrow) format:

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

We have used a [FROM INFILE](https://clickhouse.com/docs/en/sql-reference/statements/insert-into/#inserting-data-from-a-file) clause to load data from the local file, and we can see import was successful: 


```sql
SELECT *
FROM sometable;

┌─path──────────────────────┬──────month─┬─hits─┐
│ 1971-72_Utah_Stars_season │ 2016-10-01 │    1 │
│ Akiba_Hebrew_Academy      │ 2017-08-01 │  241 │
│ Aegithina_tiphia          │ 2018-02-01 │   34 │
└───────────────────────────┴────────────┴──────┘
```


#### JSON objects per line

Many apps can log data in JSON format so that each log line is an individual JSON object, like in [this file](assets/object-per-line.json):

```bash
> cat object-per-line.json
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
```

The same `JSONEachRow` format is capable of working with such files:

```sql
INSERT INTO sometable FROM INFILE 'object-per-line.json' FORMAT JSONEachRow;

SELECT * FROM sometable;

┌─path──────────────────────┬──────month─┬─hits─┐
│ Bob_Dolman                │ 2016-11-01 │  245 │
│ 1-krona                   │ 2017-01-01 │    4 │
│ Ahmadabad-e_Kalij-e_Sofla │ 2017-01-01 │    3 │
└───────────────────────────┴────────────┴──────┘
```


### Importing from JSON object keys

In some cases, the list of JSON objects can be encoded as object properties instead of array elements (see [objects.json](assets/objects.json) for example):

```
> cat objects.json
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

ClickHouse can load data from this kind of data using [JSONObjectEachRow](https://clickhouse.com/docs/en/interfaces/formats/#jsonobjecteachrow) format:

```sql
INSERT INTO sometable FROM INFILE 'objects.json' FORMAT JSONObjectEachRow;
SELECT * FROM sometable;

┌─path────────────┬──────month─┬─hits─┐
│ Abducens_palsy  │ 2016-05-01 │   28 │
│ Akahori_Station │ 2016-06-01 │   11 │
│ April_25,_2017  │ 2018-01-01 │    2 │
└─────────────────┴────────────┴──────┘
```


#### Importing parent object key values

Let’s say we also want to save values in parent object keys to the table. In this case, we can use the [following option](https://clickhouse.com/docs/en/operations/settings/settings/#format_json_object_each_row_column_for_object_name) to define the name of the column we want key values to be saved to:

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

Now we can check which data is going to be loaded from the original JSON file using [file()](https://clickhouse.com/docs/en/sql-reference/functions/files/#file) function:

```sql
SELECT *
FROM file('objects.json', JSONObjectEachRow);

┌─id─┬─path────────────┬──────month─┬─hits─┐
│ a  │ April_25,_2017  │ 2018-01-01 │    2 │
│ b  │ Akahori_Station │ 2016-06-01 │   11 │
│ c  │ Abducens_palsy  │ 2016-05-01 │   28 │
└────┴─────────────────┴────────────┴──────┘
```

Note how the `id` column has been populated by key values correctly and can now be stored in a table.


### Importing from JSON arrays

Sometimes, for the sake of saving space, JSON files are encoded in arrays instead of objects. In this case, we deal with a [list of JSON arrays](assets/arrays.json):


```bash
> cat arrays.json
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

In this case, ClickHouse will load this data and attribute each value to the corresponding column based on its order in the array. We use [JSONCompactEachRow](https://clickhouse.com/docs/en/interfaces/formats/#jsoncompacteachrow) format for that:

```sql
SELECT *
FROM sometable;

┌─path──────────────────────┬──────month─┬─hits─┐
│ 1971-72_Utah_Stars_season │ 2016-10-01 │    1 │
│ Akiba_Hebrew_Academy      │ 2017-08-01 │  241 │
│ Aegithina_tiphia          │ 2018-02-01 │   34 │
└───────────────────────────┴────────────┴──────┘
```



### Importing individual columns from JSON arrays

In some cases, data can be encoded column-wise instead of row-wise. In this case, a parent JSON object contains columns with values. Take a look at the [following file](assets/columns.json):

```bash
> cat columns.json
{
  "path": ["2007_Copa_America", "Car_dealerships_in_the_USA", "Dihydromyricetin_reductase"],
  "month": ["2016-07-01", "2015-07-01", "2015-07-01"],
  "hits": [178, 11, 1]
}
```

ClickHouse uses [JSONColumns](https://clickhouse.com/docs/en/interfaces/formats/#jsoncolumns) format to parse data formatted like that:

```sql
SELECT *
FROM file('columns.json', JSONColumns);

┌─path───────────────────────┬──────month─┬─hits─┐
│ 2007_Copa_America          │ 2016-07-01 │  178 │
│ Car_dealerships_in_the_USA │ 2015-07-01 │   11 │
│ Dihydromyricetin_reductase │ 2015-07-01 │    1 │
└────────────────────────────┴────────────┴──────┘
```

A more compact format is also supported when dealing with an [array of columns](assets/columns-array.json) instead of an object using [JSONCompactColumns](https://clickhouse.com/docs/en/interfaces/formats/#jsoncompactcolumns) format:

```sql
SELECT *
FROM file('columns-array.json', JSONCompactColumns);

┌─c1──────────────┬─────────c2─┬─c3─┐
│ Heidenrod       │ 2017-01-01 │ 10 │
│ Arthur_Henrique │ 2016-11-01 │ 12 │
│ Alan_Ebnother   │ 2015-11-01 │ 66 │
└─────────────────┴────────────┴────┘
```


### Saving JSON objects instead of parsing

There are cases you might want to save JSON objects to a single String (or JSON) column instead of parsing it. This can be useful when dealing with a list of JSON objects of different structures. Let’s take [this file](assets/custom.json), where we have multiple different JSON objects inside a parent list:

```bash
> cat custom.json
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

Now we can load data from the file into this table using [JSONAsString](https://clickhouse.com/docs/en/interfaces/formats/#jsonasstring) format to keep JSON objects instead of parsing them:

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

And we can use [JSON functions](https://clickhouse.com/docs/en/sql-reference/functions/json-functions/) to query saved objects:

```sql
SELECT
    JSONExtractString(data, 'type') AS type,
    data
FROM events;

┌─type───┬─data─────────────────────────────────────────────────┐
│ person │ {"name": "Joe", "age": 99, "type": "person"}         │
│ post   │ {"url": "/my.post.MD", "hits": 1263, "type": "post"} │
│ log    │ {"message": "Warning on disk usage", "type": "log"}  │
└────────┴──────────────────────────────────────────────────────┘
```

Consider using [JSONAsObject](https://clickhouse.com/docs/en/interfaces/schema-inference/#json-as-object) together with a new [JSON data type](https://clickhouse.com/docs/en/guides/developer/working-with-json/json-semi-structured/#json-object-type) to store and process JSON in tables in a more efficient way. Note that JSONAsString works perfectly fine in cases we have JSON object-per-line formatted files (usually used with `JSONEachRow` format).

## Data types detection when importing JSON data

ClickHouse does some magic to guess the best types while importing JSON data. We can use a `DESCRIBE` clause to check which types were defined:

```sql
DESCRIBE TABLE file('list.json', JSONEachRow);

┌─name──┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path  │ Nullable(String) │              │                    │         │                  │                │
│ month │ Nullable(Date)   │              │                    │         │                  │                │
│ hits  │ Nullable(Int64)  │              │                    │         │                  │                │
└───────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

This allows quickly creating tables from JSON files:

```sql
CREATE TABLE new_table
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('list.json', JSONEachRow)
```

Detected types will be used for this table:

```sql
DESCRIBE TABLE new_table;

┌─name──┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path  │ Nullable(String) │              │                    │         │                  │                │
│ month │ Nullable(Date)   │              │                    │         │                  │                │
│ hits  │ Nullable(Int64)  │              │                    │         │                  │                │
└───────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```


## Skipping unknown columns

By default, ClickHouse will ignore unknown columns when importing JSON data. Let’s try to import the original file into the table without the `month` column:

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

We can still insert the [original JSON data](assets/list.json) with 3 columns into this table:

```sql
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
SELECT * FROM shorttable;

┌─path──────────────────────┬─hits─┐
│ 1971-72_Utah_Stars_season │    1 │
│ Aegithina_tiphia          │   34 │
│ Akiba_Hebrew_Academy      │  241 │
└───────────────────────────┴──────┘
```

ClickHouse will ignore unknown columns while importing. This can be disabled with the [input_format_skip_unknown_fields](https://clickhouse.com/docs/en/operations/settings/settings/#input_format_skip_unknown_fields) settings option:

```sql
SET input_format_skip_unknown_fields = 0;

INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;

Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

ClickHouse will throw exceptions in cases of inconsistent JSON and table columns structure.

## Exporting JSON data

Almost any JSON format used for import can be used for export as well. The most popular is [JSONEachRow](https://clickhouse.com/docs/en/interfaces/formats/#jsoneachrow):

```sql
SELECT *
FROM sometable
FORMAT JSONEachRow;

{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
```

Or we can use JSONCompactEachRow to save disk space by skipping column names:

```sql
SELECT *
FROM sometable
FORMAT JSONCompactEachRow;

["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```


### Overriding data types as strings {#overriding-data-types-as-strings}

ClickHouse respects data types and will export JSON accordingly to standards. But in cases we need to have all values encoded as strings, we can use [JSONStringsEachRow](https://clickhouse.com/docs/en/interfaces/formats/#jsonstringseachrow) format:

```sql
SELECT *
FROM sometable
FORMAT JSONStringsEachRow;

{"path":"Bob_Dolman","month":"2016-11-01","hits":"245"}
{"path":"1-krona","month":"2017-01-01","hits":"4"}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":"3"}
```

Now `hits` numeric column is encoded as a string. Exporting as strings is supported for all JSON* formats, just explore `JSONStrings\*` and `JSONCompactStrings\*` formats:


```sql
SELECT *
FROM sometable
FORMAT JSONCompactStringsEachRow;

["Bob_Dolman", "2016-11-01", "245"]
["1-krona", "2017-01-01", "4"]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", "3"]
```


### Exporting metadata together with data

General [JSON](https://clickhouse.com/docs/en/interfaces/formats/#json) format, which is popular in apps, will export not only resulting data but column types and query stats:

```sql
SELECT *
FROM sometable
FORMAT JSON;

{
	"meta":
	[
		{
			"name": "path",
			"type": "String"
		},
		…
	],

	"data":
	[
		{
			"path": "Bob_Dolman",
			"month": "2016-11-01",
			"hits": 245
		},
		…
	],

	"rows": 3,

	"statistics":
	{
		"elapsed": 0.000497457,
		"rows_read": 3,
		"bytes_read": 87
	}
}
```

The [JSONCompact](https://clickhouse.com/docs/en/interfaces/formats/#jsoncompact) format will print the same metadata, but use a compacted form for the data itself:

```sql
SELECT *
FROM sometable
FORMAT JSONCompact;

{
	"meta":
	[
		{
			"name": "path",
			"type": "String"
		},
		…
	],

	"data":
	[
		["Bob_Dolman", "2016-11-01", 245],
		["1-krona", "2017-01-01", 4],
		["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]                                                                                                                                                     
	],

	"rows": 3,

	"statistics":
	{
		"elapsed": 0.00074981,
		"rows_read": 3,
		"bytes_read": 87
	}
}
```

Consider [JSONStrings](https://clickhouse.com/docs/en/interfaces/formats/#jsonstrings) or [JSONCompactStrings](https://clickhouse.com/docs/en/interfaces/formats/#jsoncompactstrings) variants to encode all values as strings.


#### Compact way to export JSON data and structure

A more efficient way to have data, as well as it’s structure, is to use [JSONCompactEachRowWithNamesAndTypes](https://clickhouse.com/docs/en/interfaces/formats/#jsoncompacteachrowwithnamesandtypes) format:


```sql
SELECT *
FROM sometable
FORMAT JSONCompactEachRowWithNamesAndTypes;

["path", "month", "hits"]
["String", "Date", "UInt32"]
["Bob_Dolman", "2016-11-01", 245]
["1-krona", "2017-01-01", 4]
["Ahmadabad-e_Kalij-e_Sofla", "2017-01-01", 3]
```

This will use a compact JSON format prepended by two header rows with column names and types. This format can then be used to ingest data into another ClickHouse instance (or other apps).


### Exporting JSON to a file

To save exported JSON data to a file, we can use an [INTO OUTFILE](https://clickhouse.com/docs/en/sql-reference/statements/select/into-outfile/) clause:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.json'
FORMAT JSONEachRow;

36838935 rows in set. Elapsed: 2.220 sec. Processed 36.84 million rows, 1.27 GB (16.60 million rows/s., 572.47 MB/s.)
```

It took ClickHouse only 2 seconds to export almost 37m records to a JSON file. We can also export using a `COMPRESSION` clause to enable compression on the fly:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.json.gz'
FORMAT JSONEachRow;

36838935 rows in set. Elapsed: 22.680 sec. Processed 36.84 million rows, 1.27 GB (1.62 million rows/s., 56.02 MB/s.)
```

It takes more time to accomplish but generates a much smaller compressed file:

```bash
2.2G	out.json
576M	out.json.gz
```


## Importing and exporting BSON

ClickHouse allows exporting to and importing data from [BSON](https://bsonspec.org/) encoded files. This format is used by some DBMSs, e.g. [MongoDB](https://github.com/mongodb/mongo) database.

To import BSON data, we use the [BSONEachRow](https://clickhouse.com/docs/en/interfaces/formats/#bsoneachrow) format. Let’s import data from [this BSON file](assets/data.bson):


```sql
SELECT *
FROM file('data.bson', BSONEachRow);

┌─path──────────────────────┬─month─┬─hits─┐
│ Bob_Dolman                │ 17106 │  245 │
│ 1-krona                   │ 17167 │    4 │
│ Ahmadabad-e_Kalij-e_Sofla │ 17167 │    3 │
└───────────────────────────┴───────┴──────┘
```

And we can also export to BSON files using the same format:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

After that, we’ll have our data exported to the `out.bson` file.

## Other formats

ClickHouse introduces support for many formats, both text, and binary, to cover various scenarios and platforms. Explore more formats and ways to work with them in the following articles:

- [CSV and TSV formats](csv-tsv.md)
- [Parquet, Avro, Arrow and ORC](parquet-arrow-avro-orc.md)
- **JSON formats**
- [Regex and templates](templates-regex.md)
- [Native and binary formats](binary.md)
- [SQL formats](sql.md)
