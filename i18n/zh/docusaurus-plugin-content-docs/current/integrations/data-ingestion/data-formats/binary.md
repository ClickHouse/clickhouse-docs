---
'sidebar_label': '二进制和原生'
'slug': '/integrations/data-formats/binary-native'
'title': '使用ClickHouse中的原生和二进制格式'
'description': '描述如何在ClickHouse中使用原生和二进制格式的页面'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 在 ClickHouse 中使用本地和二进制格式

ClickHouse 支持多种二进制格式，这些格式能带来更好的性能和空间效率。二进制格式在字符编码方面也很安全，因为数据以二进制形式保存。

我们将使用一些数据 [表](assets/some_data.sql) 和 [数据](assets/some_data.tsv) 进行演示，欢迎在您的 ClickHouse 实例上复现。

## 以本地 ClickHouse 格式导出 {#exporting-in-a-native-clickhouse-format}

在 ClickHouse 节点之间导入和导出数据的最有效数据格式是 [Native](/interfaces/formats.md/#native) 格式。导出通过使用 `INTO OUTFILE` 子句完成：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

这将创建 [data.clickhouse](assets/data.clickhouse) 文件，采用本地格式。

### 从本地格式导入 {#importing-from-a-native-format}

要导入数据，我们可以使用 [file()](/sql-reference/table-functions/file.md) 来处理较小的文件或进行探索：

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
使用 `file()` 函数时，在 ClickHouse Cloud 上，您需要在文件所在的机器上通过 `clickhouse client` 运行命令。另一种选择是使用 [`clickhouse-local`](/operations/utilities/clickhouse-local.md) 来在本地探索文件。
:::

在生产环境中，我们使用 `FROM INFILE` 来导入数据：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### 本地格式压缩 {#native-format-compression}

我们还可以在导出数据到本地格式时启用压缩（以及大多数其他格式），使用 `COMPRESSION` 子句：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

我们在导出中使用了 LZ4 压缩。在导入数据时，我们需指定此选项：

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## 导出为 RowBinary {#exporting-to-rowbinary}

另一种支持的二进制格式是 [RowBinary](/interfaces/formats.md/#rowbinary)，它允许以二进制表示的行进行数据的导入和导出：

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

这将生成 [data.binary](assets/data.binary) 文件，采用二进制行格式。

### 探索 RowBinary 文件 {#exploring-rowbinary-files}
此格式不支持自动模式推断，因此在加载之前，我们必须显式定义模式：

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

考虑使用 [RowBinaryWithNames](/interfaces/formats.md/#rowbinarywithnames)，它还会添加带有列列表的标题行。[RowBinaryWithNamesAndTypes](/interfaces/formats.md/#rowbinarywithnamesandtypes) 还将添加一行额外的标题，包含列类型。

### 从 RowBinary 文件导入 {#importing-from-rowbinary-files}
要从 RowBinary 文件加载数据，我们可以使用 `FROM INFILE` 子句：

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## 使用 RawBLOB 导入单个二进制值 {#importing-single-binary-value-using-rawblob}

假设我们想要读取整个二进制文件并将其保存到表中的一个字段。这时可以使用 [RawBLOB 格式](/interfaces/formats.md/#rawblob)。此格式仅能与单列表直接使用：

```sql
CREATE TABLE images(data String) Engine = Memory
```

让我们将图像文件保存到 `images` 表中：

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

我们可以检查 `data` 字段的长度，它将等于原始文件的大小：

```sql
SELECT length(data) FROM images
```
```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```

### 导出 RawBLOB 数据 {#exporting-rawblob-data}

此格式也可以使用 `INTO OUTFILE` 子句导出数据：

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

请注意，我们必须使用 `LIMIT 1`，因为导出多个值将导致文件损坏。

## MessagePack {#messagepack}

ClickHouse 支持使用 [MsgPack](/interfaces/formats.md/#msgpack) 导入和导出 [MessagePack](https://msgpack.org/)。要导出为 MessagePack 格式：

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

## Protocol Buffers {#protocol-buffers}

<CloudNotSupportedBadge/>

要使用 [Protocol Buffers](/interfaces/formats.md/#protobuf)，我们首先需要定义一个 [模式文件](assets/schema.proto)：

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

此模式文件（在我们的例子中是 `schema.proto`）的路径在 [Protobuf](/interfaces/formats.md/#protobuf) 格式的 `format_schema` 设置选项中设置：

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

这将数据保存到 [proto.bin](assets/proto.bin) 文件中。ClickHouse 还支持导入 Protobuf 数据和嵌套消息。考虑使用 [ProtobufSingle](/interfaces/formats.md/#protobufsingle) 来处理单个 Protocol Buffer 消息（在这种情况下，将省略长度分隔符）。

## Cap'n Proto {#capn-proto}

<CloudNotSupportedBadge/>

ClickHouse 还支持另一种流行的二进制序列化格式 [Cap'n Proto](https://capnproto.org/)。与 `Protobuf` 格式类似，我们必须在本例中定义一个模式文件（[`schema.capnp`](assets/schema.capnp)）：

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

现在我们可以使用 [CapnProto](/interfaces/formats.md/#capnproto) 格式和此模式进行导入和导出：

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

请注意，我们必须将 `Date` 列强制转换为 `UInt32` 以 [匹配相应的类型](/interfaces/formats/CapnProto#data_types-matching-capnproto)。

## 其他格式 {#other-formats}

ClickHouse 为许多格式引入支持，包括文本和二进制，以涵盖各种场景和平台。请在以下文章中探索更多格式及其使用方法：

- [CSV 和 TSV 格式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 格式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正则表达式和模板](templates-regex.md)
- **本地和二进制格式**
- [SQL 格式](sql.md)

同时请查看 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - 一个便携式全功能工具，可以在不启动 ClickHouse 服务器的情况下处理本地/远程文件。
