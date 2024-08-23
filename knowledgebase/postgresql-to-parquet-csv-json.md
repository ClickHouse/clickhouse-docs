---
date: 2023-03-22
---

# Export PostgreSQL data to Parquet, CSV or JSON

This one is easy with `clickhouse-local`:

- Use the [`postgresql` table function](https://clickhouse.com/docs/en/sql-reference/table-functions/postgresql) to read the data
- Use the `INTO OUTFILE _filename_ FORMAT` clause and specify the desired output format

The output format can be any of the supported [ouput formats](https://clickhouse.com/docs/en/interfaces/formats) in ClickHouse. Let's look at a few examples...

These examples use `clickhouse-local`, which is a part of the ClickHouse binary. Download it using the following:

```bash
curl https://clickhouse.com/ | sh
```

## Export PostgreSQL to Parquet

The `postgresql` table function allows `SELECT` (and `INSERT`) queries to be performed on data that is stored on a remote PostgreSQL server. For example, to view the entire contents of a table in PostgreSQL:

```bash
SELECT *
FROM
   postgresql(
    'localhost:5432',
    'postgres_database',
    'postgres_table',
    'user',
    'password'
);
```

We can pipe the output of this query to a file using `INTO OUTFILE`. Use `FORMAT` to specify the format of the file to be created. Let's grab the entire contents of the PostgreSQL table, and send its contents to a Parquet file:

```bash
./clickhouse local -q "SELECT * FROM
   postgresql(
    'localhost:5432',
    'postgres_database',
    'postgres_table',
    'user',
    'password'
)
INTO OUTFILE 'my_output_file.parquet'"
```

:::note
Because the name of the output file has a `.parquet` extension, ClickHouse assumes we want the Parquet format, so notice we omitted the `FORMAT Parquet` clause.
:::

## Export PostgreSQL to CSV

It's the same as for Parquet, except we specify a more approriate filename for the output:

```bash
./clickhouse local -q "SELECT * FROM
   postgresql(
    'localhost:5432',
    'postgres_database',
    'postgres_table',
    'user',
    'password'
)
INTO OUTFILE 'my_output_file.csv'"
```

That's it! ClickHouse sees the `.csv` extension on the output file name and outputs the data as comma-separated. Otherwise, it's the exact same command as above.

## Export PostgreSQL to JSON

To go from PostgreSQL to JSON, we just change the filename and ClickHouse will figure out the format:

```bash
./clickhouse local -q "SELECT * FROM
   postgresql(
    'localhost:5432',
    'postgres_database',
    'postgres_table',
    'user',
    'password'
)
INTO OUTFILE 'my_output_file.ndjson'"
```

:::note
You don't have to stop here - you can use `clickhouse-local` to pull data from PostgreSQL and send it to [all types of output formats](https://clickhouse.com/docs/en/sql-reference/formats/).

If ClickHouse can not determine the output type by the filename extension, or if you want to specifically choose a format, add the `FOMRAT` clause:

```sql
```bash
./clickhouse local -q "SELECT * FROM
   postgresql(
    'localhost:5432',
    'postgres_database',
    'postgres_table',
    'user',
    'password'
)
INTO OUTFILE 'my_output_file.ndjson'
FORMAT JSONEachRow"
```
:::

## Stream PostgreSQL to another process

Instead of using `INTO OUTFILE`, you can stream the results of a table function to another process. Here's a simple example to demonstrate the syntax - we count the number of rows using the Linux `wc -l` command:

```bash
./clickhouse local -q "SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet'
FORMAT JSONEachRow
)" | wc -l
```

However, we could easily stream the rows to a shell script, Python script, or any other process that you want.