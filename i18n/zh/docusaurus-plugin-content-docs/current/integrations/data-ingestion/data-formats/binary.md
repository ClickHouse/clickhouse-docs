---
sidebar_label: '二进制和原生'
slug: /integrations/data-formats/binary-native
title: '在 ClickHouse 中使用原生和二进制格式'
description: '介绍如何在 ClickHouse 中使用原生和二进制格式的页面'
keywords: ['二进制格式', '原生格式', 'rowbinary', 'rawblob', 'messagepack', 'protobuf', 'capn proto', '数据格式', '性能', '压缩']
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 在 ClickHouse 中使用 Native 和二进制格式 \\{#using-native-and-binary-formats-in-clickhouse\\}

ClickHouse 支持多种二进制格式，可以带来更好的性能和空间利用率。二进制格式在字符编码处理方面也更安全，因为数据是以二进制形式保存的。

我们将使用 some_data [表](assets/some_data.sql) 和 [数据](assets/some_data.tsv) 进行演示，可在自己的 ClickHouse 实例上进行复现。

## 以 ClickHouse 原生格式导出 \\{#exporting-in-a-native-clickhouse-format\\}

在 ClickHouse 节点之间导出和导入数据时，最高效的数据格式是 [Native](/interfaces/formats/Native) 格式。导出通过使用 `INTO OUTFILE` 子句完成：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

这将在原生格式下创建 [data.clickhouse](assets/data.clickhouse) 文件。

### 从原生格式导入 \\{#importing-from-a-native-format\\}

要导入数据，我们可以使用 [file()](/sql-reference/table-functions/file.md) 来处理较小的文件或用于探索性分析：

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
在使用 `file()` 函数并搭配 ClickHouse Cloud 时，需要在文件所在的那台机器上，通过 `clickhouse client` 运行相关命令。另一种方式是使用 [`clickhouse-local`](/operations/utilities/clickhouse-local.md) 在本地查看这些文件。
:::

在生产环境中，我们使用 `FROM INFILE` 来导入数据：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### 原生格式压缩 \\{#native-format-compression\\}

在将数据导出为 Native 格式时（以及大多数其他格式），我们也可以通过 `COMPRESSION` 子句启用压缩：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

我们在导出时使用了 LZ4 压缩，因此在导入数据时也需要指定该压缩格式：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## 导出为 RowBinary \\{#exporting-to-rowbinary\\}

另一种受支持的二进制格式是 [RowBinary](/interfaces/formats/RowBinary)，它支持以二进制行的形式导入和导出数据：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

这将生成一个采用二进制行格式的 [data.binary](assets/data.binary) 文件。

### 探索 RowBinary 文件 \\{#exploring-rowbinary-files\\}

此格式不支持自动 schema 推断，因此如果要在加载前进行探索，必须显式定义 schema：

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

可以考虑使用 [RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames)，它会额外添加一行包含列名的表头。 [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes) 则会再添加一行包含列类型的表头。

### 从 RowBinary 文件导入 \\{#importing-from-rowbinary-files\\}

要从 RowBinary 文件加载数据，可以使用 `FROM INFILE` 子句：

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## 使用 RawBLOB 导入单个二进制值 \\{#importing-single-binary-value-using-rawblob\\}

假设我们想要读取整个二进制文件，并将其保存到表中的某个字段中。
在这种情况下，可以使用 [RawBLOB 格式](/interfaces/formats/RawBLOB)。此格式只能直接用于仅包含单列的表：

```sql
CREATE TABLE images(data String) ENGINE = Memory
```

我们来将一个图片文件保存到 `images` 表中：

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

我们可以检查 `data` 字段的长度，其值应等于原始文件大小：

```sql
SELECT length(data) FROM images
```

```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```

### 导出 RawBLOB 数据 \\{#exporting-rawblob-data\\}

此格式也可用于配合 `INTO OUTFILE` 子句导出数据：

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

请注意，我们必须使用 `LIMIT 1`，否则导出多个值会导致文件损坏。

## MessagePack \\{#messagepack\\}

ClickHouse 支持使用 [MsgPack](/interfaces/formats/MsgPack) 以 [MessagePack](https://msgpack.org/) 格式进行导入和导出。要导出为 MessagePack 格式：

```sql
SELECT *
FROM some_data
INTO OUTFILE 'data.msgpk'
FORMAT MsgPack
```

要从 [MessagePack 文件](assets/data.msgpk) 导入数据：

```sql
INSERT INTO sometable
FROM INFILE 'data.msgpk'
FORMAT MsgPack
```

## Protocol Buffers \\{#protocol-buffers\\}

<CloudNotSupportedBadge />

要使用 [Protocol Buffers](/interfaces/formats/Protobuf)，首先需要定义一个 [模式文件（schema 文件）](assets/schema.proto)：

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

此模式文件的路径（在本例中为 `schema.proto`）通过为 [Protobuf](/interfaces/formats/Protobuf) 格式设置的 `format_schema` 选项进行配置：

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

这会将数据保存到 [proto.bin](assets/proto.bin) 文件中。ClickHouse 还支持导入 Protobuf 数据以及包含嵌套消息的数据。对于处理单个 Protocol Buffer 消息的场景（此时会省略长度分隔符），请考虑使用 [ProtobufSingle](/interfaces/formats/ProtobufSingle)。

## Cap&#39;n Proto \\{#capn-proto\\}

<CloudNotSupportedBadge />

ClickHouse 支持的另一种流行二进制序列化格式是 [Cap&#39;n Proto](https://capnproto.org/)。与 `Protobuf` 格式类似，我们也需要在本示例中定义一个 schema 文件（[`schema.capnp`](assets/schema.capnp)）：

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

现在，我们可以使用 [CapnProto](/interfaces/formats/CapnProto) 格式和以下模式进行导入和导出：

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

请注意，我们需要将 `Date` 列强制转换为 `UInt32` 类型，以便[与对应的数据类型匹配](/interfaces/formats/CapnProto#data_types-matching-capnproto)。

## 其他格式 \\{#other-formats\\}

ClickHouse 支持多种格式，包括文本和二进制格式，以满足各种场景和平台的需求。可以在以下文章中了解更多格式以及如何使用它们：

- [CSV 和 TSV 格式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正则表达式和模板](templates-regex.md)
- **Native 和二进制格式**
- [SQL 格式](sql.md)

此外，还可以查看 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) —— 一款便携的全功能工具，可在不启动 ClickHouse 服务器的情况下处理本地/远程文件。
