---
sidebar_label: 'Loading JSON'
sidebar_position: 20
title: 'Working with JSON'
slug: /integrations/data-formats/json/loading
description: 'Loading JSON'
keywords: ['json', 'clickhouse', 'inserting', 'loading']
---

# Loading JSON

In this section, we assume the JSON data is in [NDJSON](https://github.com/ndjson/ndjson-spec) (Newline delimited JSON) format, known as [`JSONEachRow`](/interfaces/formats#jsoneachrow) in ClickHouse. This is the preferred format for loading JSON due to its brevity and efficient use of space, but others are supported for both [input and output](/interfaces/formats#json).

Consider the following JSON sample, representing a row from the [Python PyPI dataset](https://clickpy.clickhouse.com/):

```json
{
  "date": "2022-11-15",
  "country_code": "ES",
  "project": "clickhouse-connect",
  "type": "bdist_wheel",
  "installer": "pip",
  "python_minor": "3.9",
  "system": "Linux",
  "version": "0.3.0"
}
```

In order to load this JSON object into ClickHouse, a table schema must be defined. A simple schema for this is shown below, where **JSON keys are mapped to column names**:

```sql
CREATE TABLE pypi (
  `date` Date,
  `country_code` String,
  `project` String,
  `type` String,
  `installer` String,
  `python_minor` String,
  `system` String,
  `version` String
)
ENGINE = MergeTree
ORDER BY (project, date)
```

:::note Ordering keys
We have selected an ordering key here via the `ORDER BY` clause. For further details on ordering keys and how to choose them, see [here](/data-modeling/schema-design#choosing-an-ordering-key).
:::

ClickHouse can load data JSON in several formats, automatically inferring the type from the extension and contents. We can read JSON files for the above table using the [S3 function](/sql-reference/table-functions/s3):

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 row in set. Elapsed: 1.232 sec.
```

Note how we are not required to specify the file format. Instead, we use a glob pattern to read all `*.json.gz` files in the bucket. ClickHouse automatically infers the format is `JSONEachRow` (ndjson) from the file extension and contents. A format can be manually specified through parameter functions in case ClickHouse is unable to detect it.

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note Compressed files
The above files are also compressed. This is automatically detected and handled by ClickHouse.
:::

To load the rows in these files, we can use an [`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select):

```sql
INSERT INTO pypi SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
Ok.

0 rows in set. Elapsed: 10.445 sec. Processed 19.49 million rows, 35.71 MB (1.87 million rows/s., 3.42 MB/s.)

SELECT * FROM pypi LIMIT 2

┌───────date─┬─country_code─┬─project────────────┐
│ 2022-05-26 │ CN       	│ clickhouse-connect │
│ 2022-05-26 │ CN       	│ clickhouse-connect │
└────────────┴──────────────┴────────────────────┘

2 rows in set. Elapsed: 0.005 sec. Processed 8.19 thousand rows, 908.03 KB (1.63 million rows/s., 180.38 MB/s.)
```

Rows can also be loaded inline using the [`FORMAT` clause](/sql-reference/statements/select/format) e.g.

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
```

These examples assume the use of the JSONEachRow format. Other common JSON formats are supported, with examples provided of loading these [here](/integrations/data-formats/json/other-formats).

The above provided a very simple example of loading JSON data. For more complex JSON, including nested structures, see the guide [**Designing JSON schema**](/integrations/data-formats/json/schema).
