---
sidebar_label: Binary and Native
slug: /en/integrations/data-formats/binary-native
---

# Using native and binary formats in ClickHouse

ClickHouse supports multiple binary formats, which result in better performance and space efficiency. Binary formats are also safe in character encoding since data is saved in a binary form.

We're going to use some_data [table](assets/some_data.sql) and [data](assets/some_data.tsv) for demonstration, feel free to reproduce that on your ClickHouse instance.

## Exporting in a Native ClickHouse format

The most efficient data format to export and import data between ClickHouse nodes is [Native](/docs/en/interfaces/formats.md/#native) format. Exporting is done using `INTO OUTFILE` clause:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

This will create [data.clickhouse](assets/data.clickhouse) file in a native format.

### Importing from a Native format

To import data, we can use [file()](/docs/en/sql-reference/table-functions/file.md) for smaller files or exploration purposes:

```sql
DESCRIBE file('data.clickhouse', Native);
```
```response
┌─name──┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path  │ String │              │                    │         │                  │                │
│ month │ Date   │              │                    │         │                  │                │
│ hits  │ UInt32 │              │                    │         │                  │                │
└───────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

:::tip
When using the `file()` function, with ClickHouse Cloud you will need to run the commands in `clickhouse client` on the machine where the file resides. Another option is to use [`clickhouse-local`](/docs/en/operations/utilities/clickhouse-local.md) to explore files locally.
:::

In production, we use `FROM INFILE` to import data:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### Native format compression

We can also enable compression while exporting data to Native format (as well as most other formats) using a `COMPRESSION` clause:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

We've used LZ4 compression for export. We'll have to specify it while importing data:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## Exporting to RowBinary

Another binary format supported is [RowBinary](/docs/en/interfaces/formats.md/#rowbinary), which allows importing and exporting data in binary-represented rows:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

This will generate [data.binary](assets/data.binary) file in a binary rows format.

### Exploring RowBinary files
Automatic schema inference is not supported for this format, so to explore before loading, we have to define schema explicitly:

```sql
SELECT *
FROM file('data.binary', RowBinary, 'path String, month Date, hits UInt32')
LIMIT 5
```
```response
┌─path───────────────────────────┬──────month─┬─hits─┐
│ Bangor_City_Forest             │ 2015-07-01 │   34 │
│ Alireza_Afzal                  │ 2017-02-01 │   24 │
│ Akhaura-Laksam-Chittagong_Line │ 2015-09-01 │   30 │
│ 1973_National_500              │ 2017-10-01 │   80 │
│ Attachment                     │ 2017-09-01 │ 1356 │
└────────────────────────────────┴────────────┴──────┘
```

Consider using [RowBinaryWithNames](/docs/en/interfaces/formats.md/#rowbinarywithnames), which also adds a header row with a columns list. [RowBinaryWithNamesAndTypes](/docs/en/interfaces/formats.md/#rowbinarywithnamesandtypes) will also add an additional header row with column types.

### Importing from RowBinary files
To load data from a RowBinary file, we can use a `FROM INFILE` clause:

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## Importing single binary value using RawBLOB

Suppose we want to read an entire binary file and save it into a field in a table.
This is the case when the [RawBLOB format](/docs/en/interfaces/formats.md/#rawblob) can be used. This format can be directly used with a single-column table only:

```sql
CREATE TABLE images(data String) Engine = Memory
```

Let's save an image file to the `images` table:

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

We can check the `data` field length which will be equal to the original file size:

```sql
SELECT length(data) FROM images
```
```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```

### Exporting RawBLOB data

This format can also be used to export data using an `INTO OUTFILE` clause:

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

Note that we had to use `LIMIT 1` because exporting more than a single value will create a corrupted file.

## MessagePack

ClickHouse supports importing and exporting to [MessagePack](https://msgpack.org/) using the [MsgPack](/docs/en/interfaces/formats.md/#msgpack). To export to MessagePack format:

```sql
SELECT *
FROM some_data
INTO OUTFILE 'data.msgpk'
FORMAT MsgPack
```

To import data from a [MessagePack file](assets/data.msgpk):

```sql
INSERT INTO sometable
FROM INFILE 'data.msgpk'
FORMAT MsgPack
```

## Protocol Buffers

To work with [Protocol Buffers](/docs/en/interfaces/formats.md/#protobuf) we first need to define a [schema file](assets/schema.proto):

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

Path to this schema file (`schema.proto` in our case) is set in a `format_schema` settings option for the [Protobuf](/docs/en/interfaces/formats.md/#protobuf) format:

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

This saves data to the [proto.bin](assets/proto.bin) file. ClickHouse also supports importing Protobuf data as well as nested messages. Consider using [ProtobufSingle](/docs/en/interfaces/formats.md/#protobufsingle) to work with a single Protocol Buffer message (length delimiters will be omitted in this case).

## Cap’n Proto

Another popular binary serialization format supported by ClickHouse is [Cap’n Proto](https://capnproto.org/). Similarly to `Protobuf` format, we have to define a schema file ([schema.capnp](assets/schema.capnp)) in our example:

```
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

Now we can import and export using [CapnProto](/docs/en/interfaces/formats.md/#capnproto) format and this schema:

```sql
SELECT
    path,
    CAST(month, 'UInt32') AS month,
    hits
FROM some_data
INTO OUTFILE 'capnp.bin'
FORMAT CapnProto
SETTINGS format_schema = 'schema:PathStats'
```

Note that we had to cast the `Date` column as `UInt32` to [match corresponding types](/docs/en/interfaces/formats.md/#data_types-matching-capnproto).

## Other formats

ClickHouse introduces support for many formats, both text, and binary, to cover various scenarios and platforms. Explore more formats and ways to work with them in the following articles:

- [CSV and TSV formats](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON formats](json.md)
- [Regex and templates](templates-regex.md)
- **Native and binary formats**
- [SQL formats](sql.md)

And also check [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - a portable full-featured tool to work on local/remote files without starting ClickHouse server.
