# Inserting and dumping SQL data in ClickHouse

ClickHouse can be easily integrated into OLTP database infrastructures in many ways. One way is to transfer data between other databases and ClickHouse using SQL dumps.

## Creating SQL dumps

Data can be dumped in SQL format using [SQLInsert](https://clickhouse.com/docs/en/interfaces/formats#sqlinsert). ClickHouse will write data in `INSERT INTO <table name> VALUES(...` form and use [`output_format_sql_insert_table_name`](https://clickhouse.com/docs/en/operations/settings/settings/#output_format_sql_insert_table_name) settings option as a table name:

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

Columns names can be omitted by disabling [`output_format_sql_insert_include_column_names`](https://clickhouse.com/docs/en/operations/settings/settings/#output_format_sql_insert_include_column_names) option:

```sql
SET output_format_sql_insert_include_column_names = 0
```

Now we can feed [dump.sql](assets/dump.sql) file to another OLTP database:

```bash
mysql some_db < dump.sql
```

We assume that the `some_table` table exists in the `some_db` MySQL database.

### Exporting a set of values

ClickHouse has [Values](https://clickhouse.com/docs/en/interfaces/formats#data-format-values) format, which is similar to SQLInsert, but omits an `INSERT INTO table VALUES` part and returns only a set of values:

```sql
SELECT * FROM some_data LIMIT 3 FORMAT Values;

('Bangor_City_Forest','2015-07-01',34),('Alireza_Afzal','2017-02-01',24),('Akhaura-Laksam-Chittagong_Line','2015-09-01',30)
```


## Inserting data from SQL dumps

To read SQL dumps, [MySQLDump](https://clickhouse.com/docs/en/interfaces/formats#mysqldump) is used:

```sql
SELECT *
FROM file('dump.sql', MySQLDump)
LIMIT 5

┌─path───────────────────────────┬──────month─┬─hits─┐
│ Bangor_City_Forest             │ 2015-07-01 │   34 │
│ Alireza_Afzal                  │ 2017-02-01 │   24 │
│ Akhaura-Laksam-Chittagong_Line │ 2015-09-01 │   30 │
│ 1973_National_500              │ 2017-10-01 │   80 │
│ Attachment                     │ 2017-09-01 │ 1356 │
└────────────────────────────────┴────────────┴──────┘
```

By default, ClickHouse will skip unknown columns (controlled by [input_format_skip_unknown_fields](https://clickhouse.com/docs/en/operations/settings/settings/#input_format_skip_unknown_fields) option) and process data for the first found table in a dump (in case multiple tables were dumped to a single file). DDL statements will be skipped. To load data from MySQL dump into a table ([mysql.sql](assets/mysql.sql) file):

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

We can also create a table automatically from the MySQL dump file:

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

Here we've created a table named `table_from_mysql` based on a structure that ClickHouse automatically inferred.  ClickHouse either detects types based on data or uses DDL when available:

```sql
DESCRIBE TABLE table_from_mysql;

┌─name──┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path  │ Nullable(String) │              │                    │         │                  │                │
│ month │ Nullable(Date32) │              │                    │         │                  │                │
│ hits  │ Nullable(UInt32) │              │                    │         │                  │                │
└───────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

## Other formats

ClickHouse introduces support for many formats, both text, and binary, to cover various scenarios and platforms. Explore more formats and ways to work with them in the following articles:

- [CSV and TSV formats](csv-tsv.md)
- [Parquet, Avro, Arrow and ORC](parquet-arrow-avro-orc.md)
- [JSON formats](json.sql)
- [Regex and templates](templates-regex.md)
- [Native and binary formats](binary.md)
- **SQL formats**
