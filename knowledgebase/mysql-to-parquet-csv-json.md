---
date: 2023-03-21
---

# Export MySQL data to Parquet, CSV or JSON

The `clickhouse-local` tool makes it quick and easy to read data from MySQL and output the data into lots of different formats, including Parquet, CSV, and JSON. We are going to:

- Use the [`mysql` table function](https://clickhouse.com/docs/en/sql-reference/table-functions/mysql) to read the data
- Use the `INTO OUTFILE _filename_ FORMAT` clause and specify the desired output format

The `clickhouse-local` tool is a part of the ClickHouse binary. Download it using the following:

```bash
curl https://clickhouse.com/ | sh
```

## Export MySQL to Parquet

The `mysql` table function creates a table based on the results of a query sent to a MySQL instance. For example:

```bash
SELECT *
FROM
   mysql(
    'localhost:3306',
    'my_sql_database',
    'my_sql_table',
    'user',
    'password'
);
```

We can pipe the output of this query to a file using `INTO OUTFILE`. Use `FORMAT` to specify the format of the file to be created. Let's grab the entire contents of a MySQL table, and send its contents to a Parquet file:

```bash
./clickhouse local -q "SELECT * FROM
   mysql(
    'localhost:3306',
    'my_sql_database',
    'my_sql_table',
    'user',
    'password'
)
INTO OUTFILE 'my_output_file.parquet'"
```

:::note
Because the name of the output file has a `.parquet` extension, ClickHouse assumes we want the Parquet format, so notice we omitted the `FORMAT Parquet` clause.
:::

## Export MySQL to CSV

It's the same as for Parquet, except this time we use a `.csv` extension on the filename. ClickHouse will realize we want a comma-separated output and that's how the data will be written to the file:

```bash
./clickhouse local -q "SELECT * FROM
   mysql(
    'localhost:3306',
    'my_sql_database',
    'my_sql_table',
    'user',
    'password'
)
INTO OUTFILE 'my_output_file.csv'"
```

## Export MySQL to JSON

To go from MySQL to JSON, just change the extension on the filename to `jsonl` or `ndjson`:

```bash
./clickhouse local -q "SELECT * FROM
   mysqlql(
    'localhost:3306',
    'my_sql_database',
    'my_sql_table',
    'user',
    'password'
)
INTO OUTFILE 'my_output_file.ndjson'"
```

It's impressive how simple yet powerful the `clickhouse-local` tool really is. You can easily read data from a database like MySQL and output it into [all types of different output formats](https://clickhouse.com/docs/en/sql-reference/formats/).