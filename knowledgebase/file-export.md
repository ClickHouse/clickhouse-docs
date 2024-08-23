---
title: How do I export data from ClickHouse to a file?
toc_hidden: true
toc_priority: 10
date: 2023-03-22
---

# How Do I Export Data from ClickHouse to a File? {#how-to-export-to-file}

## Using INTO OUTFILE Clause {#using-into-outfile-clause}

Add an [INTO OUTFILE](https://clickhouse.com/docs/en/sql-reference/statements/select/into-outfile) clause to your query.

For example:

``` sql
SELECT * FROM table INTO OUTFILE 'file'
```

By default, ClickHouse uses the file extension of the filename to deteremine the output format and compression. For example, all of the rows in `nyc_taxi` will be exported to the `nyc_taxi.parquet` using the Parquet format:

``` sql
SELECT *
FROM nyc_taxi
INTO OUTFILE 'taxi_rides.parquet'
```

And the following file will be a compressed, tab-separated file:

``` sql
SELECT *
FROM nyc_taxi
INTO OUTFILE 'taxi_rides.tsv.gz'
```

If ClickHouse can not determine the format from the file extension, then the output format defaults to [TabSeparated](https://clickhouse.com/docs/en/interfaces/formats) for output data. To specify the [output format](https://clickhouse.com/docs/en/interfaces/formats), use the [FORMAT clause](https://clickhouse.com/docs/en/sql-reference/statements/select/format).

For example:

``` sql
SELECT *
FROM nyc_taxi
INTO OUTFILE 'taxi_rides.txt'
FORMAT CSV
```

## Using the File table engine {#using-a-file-engine-table}

Another option is to use the [File](https://clickhouse.com/docs/en/engines/table-engines/special/file) table engine, where ClickHouse uses the file to store the data. You can perform queries and inserts directly on the file.

For example:

```sql
CREATE TABLE my_table (
   x UInt32,
   y String,
   z DateTime
)
ENGINE = File(Parquet)
```

Insert a few rows:

```sql
INSERT INTO my_table VALUES
   (1, 'Hello', now()),
   (2, 'World', now()),
   (3, 'Goodbye', now())
```

The file is stored in the `data` folder of your ClickHouse server - specifically in `/data/default/my_table` in a file named `data.Parquet`.

:::note
Using the `File` table engine is incredibly handy for creating and querying files on your file system, but keep in mind that `File` tables are not `MergeTree` tables, so you don't get all the benefits that come with `MergeTree`. Use `File` for convenience when exporting data out of ClickHouse in convenient formats.
:::

## Using Command-Line Redirection {#using-command-line-redirection}

``` bash
$ clickhouse-client --query "SELECT * from table" --format FormatName > result.txt
```

See [clickhouse-client](https://clickhouse.com/docs/en/interfaces/cli).
