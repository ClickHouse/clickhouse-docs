---
title: JSON schema inference
slug: /en/integrations/data-formats/json/inference
description: How to use JSON schema inference
keywords: [json, schema, inference, schema inference]
---

ClickHouse can automatically determine the structure of JSON data. This can be used to query JSON data directly e.g. on disk with `clickhouse-local` or S3 buckets, and/or automatically create schemas prior to loading the data into ClickHouse.

## When to use type inference

* **Consistent structure** - The data from which you are going to infer types contains all the columns that you are interested in. Data with additional columns added after the type inference will be ignored and can't be queried.
* **Consistent types** - Data types for specific columns need to be compatible.

:::note Important
If you have more dynamic JSON, to which new keys are added without sufficient warning to modify the schema e.g. Kubernetes labels in logs, we recommend reading [**Designing JSON schema**](/docs/en/integrations/data-formats/json/schema).
:::

## Detecting types

Our previous examples used a simple version of the [Python PyPI dataset](https://clickpy.clickhouse.com/) in NDJSON format. In this section, we explore a more complex dataset with nested structures - the [arXiv dataset](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download) containing 2.5m scholarly papers. Each row in this dataset, distributed as NDJSON, represents a published academic paper. An example row is shown below:

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "Number Parsing at a Gigabyte per Second",
  "comments": "Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/",
  "journal-ref": "Software: Practice and Experience 51 (8), 2021",
  "doi": "10.1002/spe.2984",
  "report-no": null,
  "categories": "cs.DS cs.MS",
  "license": "http://creativecommons.org/licenses/by/4.0/",
  "abstract": "With disks and networks providing gigabytes per second ....\n",
  "versions": [
    {
      "created": "Mon, 11 Jan 2021 20:31:27 GMT",
      "version": "v1"
    },
    {
      "created": "Sat, 30 Jan 2021 23:57:29 GMT",
      "version": "v2"
    }
  ],
  "update_date": "2022-11-07",
  "authors_parsed": [
    [
      "Lemire",
      "Daniel",
      ""
    ]
  ]
}
```

This data requires a far more complex schema than previous examples. We outline the process of defining this schema below, introducing complex types such as `Tuple` and `Array`.

This dataset is stored in a public S3 bucket at `s3://datasets-documentation/arxiv/arxiv.json.gz`.

You can see that the dataset above contains nested JSON objects. While users should draft and version their schemas, inference allows types to be inferred from the data. This allows the schema DDL to be auto-generated, avoiding the need to build it manually and accelerating the development process.

:::note Auto format detection
As well as detecting the schema, JSON schema inference will automatically infer the format of the data from the file extension and contents. The above file is detected as being NDJSON automatically as a result.
:::

Using the [s3 function](/en/sql-reference/table-functions/s3) with the `DESCRIBE` command shows the types that will be inferred.


```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS describe_compact_output = 1
```
```response
┌─name───────────┬─type────────────────────────────────────────────────────────────────────┐
│ id             │ Nullable(String)                                                        │
│ submitter      │ Nullable(String)                                                        │
│ authors        │ Nullable(String)                                                        │
│ title          │ Nullable(String)                                                        │
│ comments       │ Nullable(String)                                                        │
│ journal-ref    │ Nullable(String)                                                        │
│ doi            │ Nullable(String)                                                        │
│ report-no      │ Nullable(String)                                                        │
│ categories     │ Nullable(String)                                                        │
│ license        │ Nullable(String)                                                        │
│ abstract       │ Nullable(String)                                                        │
│ versions       │ Array(Tuple(created Nullable(String),version Nullable(String)))         │
│ update_date    │ Nullable(Date)                                                          │
│ authors_parsed │ Array(Array(Nullable(String)))                                          │
└────────────────┴─────────────────────────────────────────────────────────────────────────┘
```
:::note Avoid nulls
You can see a lot of the columns are detected as Nullable. We [do not recommend using the Nullable](https://clickhouse.com/docs/en/sql-reference/data-types/nullable#storage-features) type when not absolutely needed. You can use [schema_inference_make_columns_nullable](https://clickhouse.com/docs/en/interfaces/schema-inference#schema_inference_make_columns_nullable) to control the behavior of when Nullable is applied.
:::

We can see that most columns have automatically been detected as `String`, with `update_date` column correctly detected as a `Date`. The `versions` column has been created as an `Array(Tuple(created String, version String))` to store a list of objects, with `authors_parsed` being defined as `Array(Array(String))` for nested arrays.

:::note Controlling type detection
The auto-detection of dates and datetimes can be controlled through the settings [`input_format_try_infer_dates`](/docs/en/interfaces/schema-inference#input_format_try_infer_dates) and [`input_format_try_infer_datetimes`](/docs/en/interfaces/schema-inference#input_format_try_infer_datetimes) respectively (both enabled by default). The inference of objects as tuples is controlled by the setting [`input_format_json_try_infer_named_tuples_from_objects`](/docs/en/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects). Other settings which control schema inference for JSON, such as the auto-detection of numbers, can be found [here](/docs/en/interfaces/schema-inference#text-formats).
:::

## Querying JSON

We can rely on schema inference to query JSON data in place. Below, we find the top authors for each year, exploiting the fact the dates and arrays are automatically detected.

```sql
SELECT
    toYear(update_date) AS year,
    authors,
    count() AS c
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
GROUP BY
    year,
    authors
ORDER BY
    year ASC,
    c DESC
LIMIT 1 BY year

┌─year─┬─authors────────────────────────────────────┬───c─┐
│ 2007 │ The BABAR Collaboration, B. Aubert, et al  │  98 │
│ 2008 │ The OPAL collaboration, G. Abbiendi, et al │  59 │
│ 2009 │ Ashoke Sen                                 │  77 │
│ 2010 │ The BABAR Collaboration, B. Aubert, et al  │ 117 │
│ 2011 │ Amelia Carolina Sparavigna                 │  21 │
│ 2012 │ ZEUS Collaboration                         │ 140 │
│ 2013 │ CMS Collaboration                          │ 125 │
│ 2014 │ CMS Collaboration                          │  87 │
│ 2015 │ ATLAS Collaboration                        │ 118 │
│ 2016 │ ATLAS Collaboration                        │ 126 │
│ 2017 │ CMS Collaboration                          │ 122 │
│ 2018 │ CMS Collaboration                          │ 138 │
│ 2019 │ CMS Collaboration                          │ 113 │
│ 2020 │ CMS Collaboration                          │  94 │
│ 2021 │ CMS Collaboration                          │  69 │
│ 2022 │ CMS Collaboration                          │  62 │
│ 2023 │ ATLAS Collaboration                        │ 128 │
│ 2024 │ ATLAS Collaboration                        │ 120 │
└──────┴────────────────────────────────────────────┴─────┘

18 rows in set. Elapsed: 20.172 sec. Processed 2.52 million rows, 1.39 GB (124.72 thousand rows/s., 68.76 MB/s.)
```

Schema inference allows us to query JSON files without needing to specify the schema, accelerating ad-hoc data analysis tasks.

## Creating tables

We can rely on schema inference to create the schema for a table. The following `CREATE AS EMPTY` command causes the DDL for the table to be inferred and the table to created. This does not load any data:

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS schema_inference_make_columns_nullable = 0
```

To confirm the table schema, we use the `SHOW CREATE TABLE` command:

```sql
SHOW CREATE TABLE arxiv

CREATE TABLE arxiv
(
    `id` String,
    `submitter` String,
    `authors` String,
    `title` String,
    `comments` String,
    `journal-ref` String,
    `doi` String,
    `report-no` String,
    `categories` String,
    `license` String,
    `abstract` String,
    `versions` Array(Tuple(created String, version String)),
    `update_date` Date,
    `authors_parsed` Array(Array(String))
)
ENGINE = MergeTree
ORDER BY update_date
SETTINGS index_granularity = 8192
```

The above is the correct schema for this data. Schema inference is based on sampling the data and reading the data row by row. Column values are extracted according to the format, with recursive parsers and heuristics used to determine the type for each value. The maximum number of rows and bytes read from the data in schema inference is controlled by the settings [`input_format_max_rows_to_read_for_schema_inference`](/docs/en/interfaces/schema-inference#input_format_max_rows_to_read_for_schema_inferenceinput_format_max_bytes_to_read_for_schema_inference) (25000 by default) and [`input_format_max_bytes_to_read_for_schema_inference`](/docs/en/interfaces/schema-inference#input_format_max_rows_to_read_for_schema_inferenceinput_format_max_bytes_to_read_for_schema_inference) (32MB by default). In the event detection is not correct, users can provide hints as described [here](/docs/en/interfaces/schema-inference#schema_inference_hints).

### Creating tables from snippets

The above example uses a file on S3 to create the table schema. Users may wish to create a schema from a single-row snippet. This can be achieved using the [format](/docs/en/sql-reference/table-functions/format) function as shown below:

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM format(JSONEachRow, '{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"Withdisks and networks providing gigabytes per second ","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}') SETTINGS schema_inference_make_columns_nullable = 0

SHOW CREATE TABLE arxiv

CREATE TABLE arxiv
(
    `id` String,
    `submitter` String,
    `authors` String,
    `title` String,
    `comments` String,
    `doi` String,
    `report-no` String,
    `categories` String,
    `license` String,
    `abstract` String,
    `versions` Array(Tuple(created String, version String)),
    `update_date` Date,
    `authors_parsed` Array(Array(String))
)
ENGINE = MergeTree
ORDER BY update_date
```

## Loading JSON data

The previous commands created a table to which data can be loaded. You can now insert the data into your table using the following `INSERT INTO SELECT`:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

For examples of loading data from other sources e.g. file, see [here](/docs/en/sql-reference/statements/insert-into).

Once loaded, we can query our data, optionally using the format `PrettyJSONEachRow` to show the rows in their original structure:

```sql
SELECT *
FROM arxiv
LIMIT 1
FORMAT PrettyJSONEachRow

{
    "id": "0704.0004",
    "submitter": "David Callan",
    "authors": "David Callan",
    "title": "A determinant of Stirling cycle numbers counts unlabeled acyclic",
    "comments": "11 pages",
    "journal-ref": "",
    "doi": "",
    "report-no": "",
    "categories": "math.CO",
    "license": "",
    "abstract": "  We show that a determinant of Stirling cycle numbers counts unlabeled acyclic\nsingle-source automata.",
    "versions": [
        {
            "created": "Sat, 31 Mar 2007 03:16:14 GMT",
            "version": "v1"
        }
    ],
    "update_date": "2007-05-23",
    "authors_parsed": [
        [
            "Callan",
            "David"
        ]
    ]
}

1 row in set. Elapsed: 0.009 sec.
```

## Handling errors

Sometimes, you might have bad data. For example, specific columns that do not have the right type or an improperly formatted JSON. For this, you can use the setting [`input_format_allow_errors_ratio`](/docs/en/operations/settings/formats#input_format_allow_errors_ratio) to allow a certain number of rows to be ignored if the data is triggering insert errors. Additionally, [hints](/docs/en/interfaces/schema-inference#schema_inference_hints) can be provided to assist inference.

## Further reading

To learn more about the data type inference, you can refer to [this](/en/interfaces/schema-inference) documentation page.
