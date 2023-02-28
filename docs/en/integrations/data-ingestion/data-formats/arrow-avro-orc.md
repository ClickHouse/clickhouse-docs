---
sidebar_label: Avro, Arrow and ORC
sidebar_position: 5
slug: /en/integrations/data-formats/arrow-avro-orc
---

# Working with Avro, Arrow, and ORC data in ClickHouse

Apache has released multiple data formats actively used in analytics environments, including the popular [Avro](https://avro.apache.org/), [Arrow](https://arrow.apache.org/), and [Orc](https://orc.apache.org/). ClickHouse supports importing and exporting data using any from that list.

## Importing and exporting in Avro format

ClickHouse supports reading and writing [Apache Avro](https://avro.apache.org/) data files, which are widely used in Hadoop systems.

To import from an [avro file](assets/data.avro), we should use [Avro](/docs/en/interfaces/formats.md/#data-format-avro) format in the `INSERT` statement:

```sql
INSERT INTO sometable
FROM INFILE 'data.avro'
FORMAT Avro
```

With the [file()](/docs/en/sql-reference/functions/files.md/#file) function, we can also explore Avro files before actually importing data:

```sql
SELECT path, hits
FROM file('data.avro', Avro)
ORDER BY hits DESC
LIMIT 5;
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

Consider [data types matching](/docs/en/interfaces/formats.md/#data_types-matching) when importing or exporting Avro files. Use explicit type casting to convert when loading data from Avro files:

```sql
SELECT
    date,
    toDate(date)
FROM file('data.avro', Avro)
LIMIT 3;
```
```response
┌──date─┬─toDate(date)─┐
│ 16556 │   2015-05-01 │
│ 16556 │   2015-05-01 │
│ 16556 │   2015-05-01 │
└───────┴──────────────┘
```

### Avro messages in Kafka

When Kafka messages use Avro format, ClickHouse can read such streams using [AvroConfluent](/docs/en/interfaces/formats.md/#data-format-avro-confluent) format and [Kafka](/docs/en/engines/table-engines/integrations/kafka.md) engine:

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

Another columnar format is [Apache Arrow](https://arrow.apache.org/), also supported by ClickHouse for import and export. To import data from an [Arrow file](assets/data.arrow), we use the [Arrow](/docs/en/interfaces/formats.md/#data-format-arrow) format:

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

Also, check [data types matching](/docs/en/interfaces/formats.md/#data-types-matching-arrow) to know if any should be converted manually.

### Arrow data streaming

The [ArrowStream](/docs/en/interfaces/formats.md/#data-format-arrow-stream) format can be used to work with Arrow streaming (used for in-memory processing). ClickHouse can read and write Arrow streams.

To demonstrate how ClickHouse can stream Arrow data, let's pipe it to the following python script (it reads input stream in Arrow streaming format and outputs the result as a Pandas table):

```python
import sys, pyarrow as pa

with pa.ipc.open_stream(sys.stdin.buffer) as reader:
  print(reader.read_pandas())
```

Now we can stream data from ClickHouse by piping its output to the script:

```bash
clickhouse-client -q "SELECT path, hits FROM some_data LIMIT 3 FORMAT ArrowStream" | python3 arrow.py
```
```response
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

[Apache ORC](https://orc.apache.org/) format is a columnar storage format typically used for Hadoop. ClickHouse supports importing as well as exporting [Orc data](assets/data.orc) using [ORC format](/docs/en/interfaces/formats.md/#data-format-orc):

```sql
SELECT *
FROM sometable
INTO OUTFILE 'data.orc'
FORMAT ORC;

INSERT INTO sometable
FROM INFILE 'data.orc'
FORMAT ORC;
```

Also, check [data types matching](/docs/en/interfaces/formats.md/#data-types-matching-orc) as well as [additional settings](/docs/en/interfaces/formats.md/#parquet-format-settings) to tune export and import.

## Further reading

ClickHouse introduces support for many formats, both text, and binary, to cover various scenarios and platforms. Explore more formats and ways to work with them in the following articles:

- [CSV and TSV formats](csv-tsv.md)
- [JSON formats](json.md)
- [Regex and templates](templates-regex.md)
- [Native and binary formats](binary.md)
- [SQL formats](sql.md)

And also check [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - a portable full-featured tool to work on local/remote files without the need for Clickhouse server.
