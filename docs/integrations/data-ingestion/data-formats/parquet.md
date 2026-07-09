---
sidebar_label: 'Parquet'
sidebar_position: 3
slug: /integrations/data-formats/parquet
title: 'Working with Parquet in ClickHouse'
description: 'Page describing how to work with Parquet in ClickHouse'
doc_type: 'guide'
keywords: ['parquet', 'columnar format', 'data format', 'compression', 'apache parquet']
---


Parquet is an efficient file format to store data in a column-oriented way.
ClickHouse provides support for both reading and writing Parquet files.

:::tip
When you reference a file path in a query, where ClickHouse attempts to read from will depend on the variant of ClickHouse that you're using.

If you're using [`clickhouse-local`](/operations/utilities/clickhouse-local.md) it will read from a location relative to where you launched ClickHouse Local.
If you're using ClickHouse Server or ClickHouse Cloud via `clickhouse client`, it will read from a location relative to the `/var/lib/clickhouse/user_files/` directory on the server.
:::

## Importing from Parquet {#importing-from-parquet}

Before loading data, we can use [file()](/sql-reference/functions/files.md/#file) function to explore an [example parquet file](https://clickhouse-docs-assets.s3.us-east-1.amazonaws.com/data.parquet) structure:

```sql
DESCRIBE TABLE file('data.parquet', Parquet);
```

We've used [Parquet](/interfaces/formats/Parquet) as a second argument, so ClickHouse knows the file format. This will print columns with the types:

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

We can also explore files before actually importing data using all power of SQL:

```sql
SELECT *
FROM file('data.parquet', Parquet)
LIMIT 3;
```
```response
┌─path──────────────────────┬─date───────┬─hits─┐
│ Akiba_Hebrew_Academy      │ 2017-08-01 │  241 │
│ Aegithina_tiphia          │ 2018-02-01 │   34 │
│ 1971-72_Utah_Stars_season │ 2016-10-01 │    1 │
└───────────────────────────┴────────────┴──────┘
```

:::tip
We can skip explicit format setting for `file()` and `INFILE`/`OUTFILE`.
In that case, ClickHouse will automatically detect format based on file extension.
:::

## Importing to an existing table {#importing-to-an-existing-table}

Let's create a table into which we'll import Parquet data:

```sql
CREATE TABLE sometable
(
    `path` String,
    `date` Date,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY (date, path);
```

Now we can import data using the `FROM INFILE` clause:

```sql
INSERT INTO sometable
FROM INFILE 'data.parquet' FORMAT Parquet;

SELECT *
FROM sometable
LIMIT 5;
```
```response
┌─path──────────────────────────┬───────date─┬─hits─┐
│ 1988_in_philosophy            │ 2015-05-01 │   70 │
│ 2004_Green_Bay_Packers_season │ 2015-05-01 │  970 │
│ 24_hours_of_lemans            │ 2015-05-01 │   37 │
│ 25604_Karlin                  │ 2015-05-01 │   20 │
│ ASCII_ART                     │ 2015-05-01 │    9 │
└───────────────────────────────┴────────────┴──────┘
```

Note how ClickHouse automatically converted Parquet strings (in the `date` column) to the `Date` type. This is because ClickHouse does a typecast automatically based on the types in the target table.

## Inserting a local file to remote server {#inserting-a-local-file-to-remote-server}

If you want to insert a local Parquet file to a remote ClickHouse server, you can do this by piping the contents of the file into `clickhouse-client`, as shown below:

```sql
clickhouse client -q "INSERT INTO sometable FORMAT Parquet" < data.parquet
```

## Creating new tables from Parquet files {#creating-new-tables-from-parquet-files}

Since ClickHouse reads parquet file schema, we can create tables on the fly:

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

This will automatically create and populate a table from a given parquet file:

```sql
DESCRIBE TABLE imported_from_parquet;
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

By default, ClickHouse is strict with column names, types, and values. But sometimes, we can skip nonexistent columns or unsupported values during import. This can be managed with [Parquet settings](/interfaces/formats/Parquet#format-settings).

## Exporting to Parquet format {#exporting-to-parquet-format}

:::tip
When using `INTO OUTFILE` with ClickHouse Cloud you will need to run the commands in `clickhouse client` on the machine where the file will be written to.
:::

To export any table or query result to the Parquet file, we can use an `INTO OUTFILE` clause:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

This will create the `export.parquet` file in a working directory.

## ClickHouse and Parquet data types {#clickhouse-and-parquet-data-types}
ClickHouse and Parquet data types are mostly identical but still [differ a bit](/interfaces/formats/Parquet#data-types-matching-parquet). For example, ClickHouse will export `DateTime` type as a Parquets' `int64`. If we then import that back to ClickHouse, we're going to see numbers ([time.parquet file](https://clickhouse-docs-assets.s3.us-east-1.amazonaws.com/time.parquet)):

```sql
SELECT * FROM file('time.parquet', Parquet);
```
```response
┌─n─┬───────time─┐
│ 0 │ 1673622611 │
│ 1 │ 1673622610 │
│ 2 │ 1673622609 │
│ 3 │ 1673622608 │
│ 4 │ 1673622607 │
└───┴────────────┘
```

In this case [type conversion](/sql-reference/functions/type-conversion-functions.md) can be used:

```sql
SELECT
    n,
    toDateTime(time)                 <--- int to time
FROM file('time.parquet', Parquet);
```
```response
┌─n─┬────toDateTime(time)─┐
│ 0 │ 2023-01-13 15:10:11 │
│ 1 │ 2023-01-13 15:10:10 │
│ 2 │ 2023-01-13 15:10:09 │
│ 3 │ 2023-01-13 15:10:08 │
│ 4 │ 2023-01-13 15:10:07 │
└───┴─────────────────────┘
```

## Further reading {#further-reading}

ClickHouse introduces support for many formats, both text, and binary, to cover various scenarios and platforms. Explore more formats and ways to work with them in the following articles:

- [CSV and TSV formats](csv-tsv.md)
- [Avro, Arrow and ORC](arrow-avro-orc.md)
- [JSON formats](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regex and templates](templates-regex.md)
- [Native and binary formats](binary.md)
- [SQL formats](sql.md)

And also check [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - a portable full-featured tool to work on local/remote files without the need for Clickhouse server.
