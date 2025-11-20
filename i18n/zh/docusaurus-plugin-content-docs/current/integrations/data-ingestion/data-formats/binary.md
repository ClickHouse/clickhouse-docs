---
sidebar_label: 'Binary 与 Native'
slug: /integrations/data-formats/binary-native
title: '在 ClickHouse 中使用 Native 与 Binary 格式'
description: '介绍如何在 ClickHouse 中使用 Native 与 Binary 格式的页面'
keywords: ['binary formats', 'native format', 'rowbinary', 'rawblob', 'messagepack', 'protobuf', 'capn proto', 'data formats', 'performance', 'compression']
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 在 ClickHouse 中使用 Native 和二进制格式

ClickHouse 支持多种二进制格式，可以带来更好的性能和空间利用率。二进制格式在字符编码方面同样是安全的，因为数据以二进制形式存储。

我们将使用 some_data 的[表](assets/some_data.sql)和[数据](assets/some_data.tsv)进行演示，你可以在自己的 ClickHouse 实例上复现这些操作。



## 以 Native ClickHouse 格式导出 {#exporting-in-a-native-clickhouse-format}

在 ClickHouse 节点之间导出和导入数据最高效的数据格式是 [Native](/interfaces/formats/Native) 格式。使用 `INTO OUTFILE` 子句进行导出:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

这将创建一个 Native 格式的 [data.clickhouse](assets/data.clickhouse) 文件。

### 从 Native 格式导入 {#importing-from-a-native-format}

要导入数据,可以使用 [file()](/sql-reference/table-functions/file.md) 函数处理较小的文件或用于探索目的:

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
使用 `file()` 函数时,在 ClickHouse Cloud 中需要在文件所在的机器上通过 `clickhouse client` 运行命令。另一个选择是使用 [`clickhouse-local`](/operations/utilities/clickhouse-local.md) 在本地探索文件。
:::

在生产环境中,使用 `FROM INFILE` 导入数据:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### Native 格式压缩 {#native-format-compression}

在导出数据到 Native 格式(以及大多数其他格式)时,还可以使用 `COMPRESSION` 子句启用压缩:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

这里使用了 LZ4 压缩进行导出。导入数据时需要指定相同的压缩方式:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```


## 导出为 RowBinary 格式 {#exporting-to-rowbinary}

另一种支持的二进制格式是 [RowBinary](/interfaces/formats/RowBinary),它允许以二进制行的形式导入和导出数据:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

这将生成二进制行格式的 [data.binary](assets/data.binary) 文件。

### 探索 RowBinary 文件 {#exploring-rowbinary-files}

此格式不支持自动模式推断,因此在加载前进行探索时,需要显式定义模式:

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

建议使用 [RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames),它会添加包含列名列表的标题行。[RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes) 还会额外添加包含列类型的标题行。

### 从 RowBinary 文件导入 {#importing-from-rowbinary-files}

要从 RowBinary 文件加载数据,可以使用 `FROM INFILE` 子句:

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```


## 使用 RawBLOB 导入单个二进制值 {#importing-single-binary-value-using-rawblob}

假设我们需要读取整个二进制文件并将其保存到表中的某个字段。
这种情况下可以使用 [RawBLOB 格式](/interfaces/formats/RawBLOB)。该格式只能直接用于单列表:

```sql
CREATE TABLE images(data String) ENGINE = Memory
```

将图像文件保存到 `images` 表中:

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

我们可以检查 `data` 字段的长度,该长度将等于原始文件大小:

```sql
SELECT length(data) FROM images
```

```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```

### 导出 RawBLOB 数据 {#exporting-rawblob-data}

该格式也可以通过 `INTO OUTFILE` 子句来导出数据:

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

注意,我们必须使用 `LIMIT 1`,因为导出多个值会生成损坏的文件。


## MessagePack {#messagepack}

ClickHouse 支持使用 [MsgPack](/interfaces/formats/MsgPack) 格式导入和导出 [MessagePack](https://msgpack.org/) 数据。导出为 MessagePack 格式：

```sql
SELECT *
FROM some_data
INTO OUTFILE 'data.msgpk'
FORMAT MsgPack
```

从 [MessagePack 文件](assets/data.msgpk)导入数据：

```sql
INSERT INTO sometable
FROM INFILE 'data.msgpk'
FORMAT MsgPack
```


## Protocol Buffers {#protocol-buffers}

<CloudNotSupportedBadge />

要使用 [Protocol Buffers](/interfaces/formats/Protobuf),首先需要定义一个[模式文件](assets/schema.proto):

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

该模式文件的路径(本例中为 `schema.proto`)需要在 [Protobuf](/interfaces/formats/Protobuf) 格式的 `format_schema` 设置选项中指定:

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

这会将数据保存到 [proto.bin](assets/proto.bin) 文件中。ClickHouse 还支持导入 Protobuf 数据以及嵌套消息。如需处理单个 Protocol Buffer 消息,可以使用 [ProtobufSingle](/interfaces/formats/ProtobufSingle)(此格式会省略长度分隔符)。


## Cap'n Proto {#capn-proto}

<CloudNotSupportedBadge />

ClickHouse 支持的另一种流行二进制序列化格式是 [Cap'n Proto](https://capnproto.org/)。与 `Protobuf` 格式类似,我们需要在示例中定义一个 schema 文件([`schema.capnp`](assets/schema.capnp)):

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

现在我们可以使用 [CapnProto](/interfaces/formats/CapnProto) 格式和该 schema 进行导入和导出:

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

注意,我们需要将 `Date` 列转换为 `UInt32` 以[匹配相应的类型](/interfaces/formats/CapnProto#data_types-matching-capnproto)。


## 其他格式 {#other-formats}

ClickHouse 支持多种文本和二进制格式,以满足各种应用场景和平台需求。您可以在以下文章中了解更多格式及其使用方法:

- [CSV 和 TSV 格式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正则表达式和模板](templates-regex.md)
- **原生和二进制格式**
- [SQL 格式](sql.md)

另外,您还可以了解 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) —— 一个功能完整的便携式工具,无需启动 ClickHouse 服务器即可处理本地或远程文件。
