---
alias: []
description: 'CapnProto 文档'
input_format: true
keywords: ['CapnProto']
output_format: true
slug: /interfaces/formats/CapnProto
title: 'CapnProto'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✔  | ✔  |    |

## 描述 {#description}

`CapnProto` 格式是一种二进制消息格式，类似 [`Protocol Buffers`](https://developers.google.com/protocol-buffers/) 格式和 [Thrift](https://en.wikipedia.org/wiki/Apache_Thrift)，但不同于 [JSON](./JSON/JSON.md) 或 [MessagePack](https://msgpack.org/)。
CapnProto 消息是严格类型且非自描述的，这意味着它们需要外部的 schema 定义。Schema 会在运行时应用，并针对每个查询进行缓存。

另请参阅 [Format Schema](/interfaces/formats/#formatschema)。

## 数据类型匹配 {#data_types-matching-capnproto}

下表显示了支持的数据类型，以及它们在 `INSERT` 和 `SELECT` 查询中对应的 ClickHouse [数据类型](/sql-reference/data-types/index.md)。

| CapnProto 数据类型（`INSERT`）                       | ClickHouse 数据类型                                                                                                                                                           | CapnProto 数据类型（`SELECT`）                       |
|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| `UINT8`, `BOOL`                                      | [UInt8](/sql-reference/data-types/int-uint.md)                                                                                                                         | `UINT8`                                              |
| `INT8`                                               | [Int8](/sql-reference/data-types/int-uint.md)                                                                                                                          | `INT8`                                               |
| `UINT16`                                             | [UInt16](/sql-reference/data-types/int-uint.md), [Date](/sql-reference/data-types/date.md)                                                                     | `UINT16`                                             |
| `INT16`                                              | [Int16](/sql-reference/data-types/int-uint.md)                                                                                                                         | `INT16`                                              |
| `UINT32`                                             | [UInt32](/sql-reference/data-types/int-uint.md), [DateTime](/sql-reference/data-types/datetime.md)                                                             | `UINT32`                                             |
| `INT32`                                              | [Int32](/sql-reference/data-types/int-uint.md), [Decimal32](/sql-reference/data-types/decimal.md)                                                              | `INT32`                                              |
| `UINT64`                                             | [UInt64](/sql-reference/data-types/int-uint.md)                                                                                                                        | `UINT64`                                             |
| `INT64`                                              | [Int64](/sql-reference/data-types/int-uint.md), [DateTime64](/sql-reference/data-types/datetime.md), [Decimal64](/sql-reference/data-types/decimal.md) | `INT64`                                              |
| `FLOAT32`                                            | [Float32](/sql-reference/data-types/float.md)                                                                                                                          | `FLOAT32`                                            |
| `FLOAT64`                                            | [Float64](/sql-reference/data-types/float.md)                                                                                                                          | `FLOAT64`                                            |
| `TEXT, DATA`                                         | [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md)                                                         | `TEXT, DATA`                                         |
| `union(T, Void), union(Void, T)`                     | [Nullable(T)](/sql-reference/data-types/date.md)                                                                                                                       | `union(T, Void), union(Void, T)`                     |
| `ENUM`                                               | [Enum(8/16)](/sql-reference/data-types/enum.md)                                                                                                                        | `ENUM`                                               |
| `LIST`                                               | [Array](/sql-reference/data-types/array.md)                                                                                                                            | `LIST`                                               |
| `STRUCT`                                             | [Tuple](/sql-reference/data-types/tuple.md)                                                                                                                            | `STRUCT`                                             |
| `UINT32`                                             | [IPv4](/sql-reference/data-types/ipv4.md)                                                                                                                              | `UINT32`                                             |
| `DATA`                                               | [IPv6](/sql-reference/data-types/ipv6.md)                                                                                                                              | `DATA`                                               |
| `DATA`                                               | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                                                                                                 | `DATA`                                               |
| `DATA`                                               | [Decimal128/Decimal256](/sql-reference/data-types/decimal.md)                                                                                                          | `DATA`                                               |
| `STRUCT(entries LIST(STRUCT(key Key, value Value)))` | [Map](/sql-reference/data-types/map.md)                                                                                                                                | `STRUCT(entries LIST(STRUCT(key Key, value Value)))` |

- 整数类型在输入和输出时可以相互转换。
- 要在 CapnProto 格式中使用 `Enum`，请使用 [format_capn_proto_enum_comparising_mode](/operations/settings/settings-formats.md/#format_capn_proto_enum_comparising_mode) 设置。
- 数组可以嵌套，并且其元素可以是 `Nullable` 类型。`Tuple` 和 `Map` 类型也可以嵌套。

## 示例用法 {#example-usage}

### 插入和查询数据 {#inserting-and-selecting-data-capnproto}

可以通过以下命令，将文件中的 CapnProto 数据插入到 ClickHouse 表中：

```bash
$ cat capnproto_messages.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_schema = 'schema:Message' FORMAT CapnProto"
```

其中 `schema.capnp` 文件内容如下：

```capnp
struct Message {
  SearchPhrase @0 :Text;
  c @1 :Uint64;
}
```

您可以通过以下命令，从 ClickHouse 表中查询数据，并将其以 `CapnProto` 格式保存到某个文件中：

```bash
$ clickhouse-client --query = "SELECT * FROM test.hits FORMAT CapnProto SETTINGS format_schema = 'schema:Message'"
```

### 使用自动生成的 schema {#using-autogenerated-capn-proto-schema}

如果你的数据没有外部定义的 `CapnProto` schema，你仍然可以使用自动生成的 schema 以 `CapnProto` 格式输入/输出数据。

例如：

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS format_capn_proto_use_autogenerated_schema=1
```

在这种情况下，ClickHouse 会根据表结构使用函数 [structureToCapnProtoSchema](/sql-reference/functions/other-functions.md#structureToCapnProtoSchema) 自动生成 CapnProto schema，并使用该 schema 以 CapnProto 格式序列化数据。

你也可以读取使用自动生成 schema 的 CapnProto 文件（在这种情况下，文件必须使用相同的 schema 创建）：

```bash
$ cat hits.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_capn_proto_use_autogenerated_schema=1 FORMAT CapnProto"
```

## 格式设置 {#format-settings}

设置 [`format_capn_proto_use_autogenerated_schema`](../../operations/settings/settings-formats.md/#format_capn_proto_use_autogenerated_schema) 默认启用，仅在未设置 [`format_schema`](/interfaces/formats#formatschema) 时生效。

你也可以在输入/输出时通过设置 [`output_format_schema`](/operations/settings/formats#output_format_schema) 将自动生成的 schema 保存到文件中。

例如：

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS 
    format_capn_proto_use_autogenerated_schema=1,
    output_format_schema='path/to/schema/schema.capnp'
```

在这种情况下，自动生成的 `CapnProto` 模式将会保存在文件 `path/to/schema/schema.capnp` 中。
