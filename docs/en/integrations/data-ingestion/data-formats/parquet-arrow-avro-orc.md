# Working with Parquet, Avro, Arrow and ORC data in ClickHouse

###### tags: `Data-formats`

Apache has released multiple data formats actively used in analytics environments, including most popular [Parquet](https://parquet.apache.org/), [Avro](https://avro.apache.org/), [Arrow](https://arrow.apache.org/), and [Orc](https://orc.apache.org/). ClickHouse supports importing and exporting data using any from that list.

## Working with Parquet data

Parquet is an efficient file format to store data in a column-oriented way.

### Importing from Parquet

Before loading data, we can use [file()](https://clickhouse.com/docs/en/sql-reference/functions/files/#file) function to explore an [example parquet file](https://github.com/mrcrypster/clickhouse-examples/blob/main/data-formats/data.parquet) structure:

```sql
DESCRIBE TABLE file('data.parquet', Parquet)
```

We've used [Parquet](https://clickhouse.com/docs/en/interfaces/formats/#data-format-parquet) as a second argument, so ClickHouse knows file format. This will print columns with types:

```bash
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

We can also explore file before actually importing data using all power of SQL:

```sql
SELECT *
FROM file('data.parquet', Parquet)
LIMIT 3
```
```response
┌─path──────────────────────┬─date───────┬─hits─┐
│ Akiba_Hebrew_Academy      │ 2017-08-01 │  241 │
│ Aegithina_tiphia          │ 2018-02-01 │   34 │
│ 1971-72_Utah_Stars_season │ 2016-10-01 │    1 │
└───────────────────────────┴────────────┴──────┘
```

### Importing to an existing table

Let's create a table to import parquet data to:

```sql
CREATE TABLE sometable
(
    `path` String,
    `date` Date,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY (date, path)
```

Now we can import data using `FROM INFILE` clause:


```sql
INSERT INTO sometable
FROM INFILE 'data.parquet' FORMAT Parquet;

SELECT *
FROM sometable
LIMIT 5
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

Note, how ClickHouse automatically converted parquet strings (in `date` column) to `Date` type. This is because ClickHouse does type casting automatically based on the types in the target table.


### Creating new table from parquet file

Since ClickHouse reads parquet file schema, we can alse a create table on the fly:

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

This will automatically create and populate a table from a given parquet file:

```sql
DESCRIBE TABLE imported_from_parquet
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

By default, ClickHouse is strict to the column names, types and values. But sometimes, we can skip unexistent columns or unsupported values during import. This can be managed with [Parquet settings](https://clickhouse.com/docs/en/interfaces/formats/#parquet-format-settings).


### Exporting to Parquet format

To export any table or query result to Parquet file, we can use `INTO OUTFILE` clause:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

This will create the `export.parquet` file in a current working directory.

### ClickHouse and Parquet data types
ClickHouse and Parquet data types are mostly identical, but still [differs a bit](https://clickhouse.com/docs/en/interfaces/formats/#data-types-matching-parquet). For example, ClickHouse will import Parquets' `TIME` type as UInt32 by default ([time.parquet file](https://github.com/mrcrypster/clickhouse-examples/blob/main/data-formats/time.parquet)):

```sql
SELECT * FROM file('time.parquet', Parquet)
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

In this case [type conversion](https://clickhouse.com/docs/en/sql-reference/functions/type-conversion-functions/) can be used:

```sql
SELECT
    n,
    toDateTime(time)                 <--- int to time
FROM file('time.parquet', Parquet)
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

## Importing and exporting in Avro format

ClickHouse supports both reading and writing [Apache Avro](https://avro.apache.org/) data files, which are widely used in Hadoop systems.

To import from an [avro file](https://github.com/mrcrypster/clickhouse-examples/blob/main/data-formats/data.avro), we should use [Avro](https://clickhouse.com/docs/en/interfaces/formats/#data-format-avro) format in the `INSERT` statement:

```sql
INSERT INTO sometable
FROM INFILE 'data.avro'
FORMAT Avro
```

With the [file()](https://clickhouse.com/docs/en/sql-reference/functions/files/#file) function we can also explore Avro files before actually importing data:

```sql
SELECT path, hits
FROM file('data.avro', Avro)
ORDER BY hits DESC
LIMIT 5
```
```response
┌─path────────────┬──hits─┐
│ Amy_Poehler     │ 62732 │
│ Adam_Goldberg   │ 42338 │
│ Aaron_Spelling  │ 25128 │
│ Absence_seizure │ 18152 │
│ Ammon_Bundy     │ 11890 │
└─────────────────┴───────┘
```

To export to Avro file:

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.avro'
FORMAT Avro;
```

### Avro and ClickHouse data types

Consider [data types matching](https://clickhouse.com/docs/en/interfaces/formats/#data_types-matching) whem importing or exporting Avro files. Use explicit type casting to convert when loading data from Avro files:

```sql
SELECT
    date,
    toDate(date)
FROM file('data.avro', Avro)
LIMIT 3

┌──date─┬─toDate(date)─┐
│ 16556 │   2015-05-01 │
│ 16556 │   2015-05-01 │
│ 16556 │   2015-05-01 │
└───────┴──────────────┘
```

### Avro messages in Kafka

When Kafka messages use Avro format, ClickHouse can read such streams using [AvroConfluent](https://clickhouse.com/docs/en/interfaces/formats/#data-format-avro-confluent) format and [Kafka](https://clickhouse.com/docs/en/engines/table-engines/integrations/kafka/) engine:

```sql
CREATE TABLE some_topic_stream
(
    field1 UInt32,
    field2 String
)
ENGINE = Kafka() SETTINGS
kafka_broker_list = 'localhost',
kafka_topic_list = 'some_topic',
kafka_group_name = 'some_group',
kafka_format = 'AvroConfluent';
```

## Working with Arrow format

Another columnar format is [Apache Arrow](https://arrow.apache.org/), also supported by ClickHouse for both import and export. To import data from an [Arrow file](https://github.com/mrcrypster/clickhouse-examples/blob/main/data-formats/data.arrow), we use the [Arrow](https://clickhouse.com/docs/en/interfaces/formats/#data-format-arrow) format:

```sql
INSERT INTO sometable
FROM INFILE 'data.arrow'
FORMAT Arrow
```

Exporting to Arrow file works the same way:

```sql
SELECT * FROM sometable
INTO OUTFILE 'export.arrow'
FORMAT Arrow
```

Also check [data types matching](https://clickhouse.com/docs/en/interfaces/formats/#data-types-matching-arrow) to know if any should be converted manually.

### Arrow data streaming

The [ArrowStream](https://clickhouse.com/docs/en/interfaces/formats/#data-format-arrow-stream) format can be used to work with Arrow streaming (used for in-memory processing). ClickHouse can read and write Arrow streams.

To demonstrate how ClickHouse can stream Arrow data, let's pipe to the following python script (it reads input stream in Arrow streaming format and outputs result as a Pandas table):

```python
import sys, pyarrow as pa

with pa.ipc.open_stream(sys.stdin.buffer) as reader:
  print(reader.read_pandas())
```

Now we can stream data from ClickHouse by piping its output to the script:

```bash
clickhouse-client -q "SELECT path, hits FROM some_data LIMIT 3 FORMAT ArrowStream" | python3 arrow.py

                           path  hits
0       b'Akiba_Hebrew_Academy'   241
1           b'Aegithina_tiphia'    34
2  b'1971-72_Utah_Stars_season'     1
```

ClickHouse can read Arrow streams as well using the same ArrowStream format:

```sql
arrow-stream | clickhouse-client -q "INSERT INTO sometable FORMAT ArrowStream"
```

We've used `arrow-stream` as a possible source of Arrow streaming data.

## Importing and exporting ORC data

[Apache ORC](https://orc.apache.org/) format is a columnar storage format, typically used for Hadoop. ClickHouse supports importing as well as exporting [Orc data](https://github.com/mrcrypster/clickhouse-examples/blob/main/data-formats/data.orc) using [ORC format](https://clickhouse.com/docs/en/interfaces/formats/#data-format-orc):

```sql!
SELECT *
FROM sometable
INTO OUTFILE 'data.orc'
FORMAT ORC;

INSERT INTO sometable
FROM INFILE 'data.orc'
FORMAT ORC;
```

Also, check [data types matching](https://clickhouse.com/docs/en/interfaces/formats/#data-types-matching-orc) as well as [additional settings](https://clickhouse.com/docs/en/interfaces/formats/#parquet-format-settings) to tune export and import.

## Further reading

- [CSV, TSV, and custom separated](https://docs.google.com/document/d/1iMsOOmIC2pMqgOYZvPawS4oHOA_egAgMgfRIHl0_x9A/edit#heading=h.ml8ju70e9n1)
- **Parquet, Avro, Arrow, ORC**
- [JSON](https://docs.google.com/document/d/1UcS4s-s9kSN9JZNj6EzpAJpKB98lQn40MrJB5BdWOXA/edit#heading=h.9bqw7squ9b6z)
- Custom text, regex/templates, XML
- Native and binary
- SQL

And also check the [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - portable full-featured tool to work on local/remote files without the need for Clickhouse server.
