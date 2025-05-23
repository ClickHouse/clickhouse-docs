---
'alias': []
'description': 'Capnproto 的文档'
'input_format': true
'keywords':
- 'CapnProto'
'output_format': true
'slug': '/interfaces/formats/CapnProto'
'title': 'CapnProto'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge/>

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

`CapnProto` 格式是一种类似于 [`Protocol Buffers`](https://developers.google.com/protocol-buffers/) 格式和 [Thrift](https://en.wikipedia.org/wiki/Apache_Thrift) 的二进制消息格式，但与 [JSON](./JSON/JSON.md) 或 [MessagePack](https://msgpack.org/) 不同。
CapnProto 消息是严格类型且不自描述，这意味着它们需要外部模式描述。该模式在查询时动态应用并缓存。

另请参见 [格式模式](/interfaces/formats/#formatschema)。

## 数据类型匹配 {#data_types-matching-capnproto}

下表展示了支持的数据类型，以及它们在 `INSERT` 和 `SELECT` 查询中如何匹配 ClickHouse 的 [数据类型](/sql-reference/data-types/index.md)。

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

- 整数类型可以在输入/输出过程中互相转换。
- 使用 CapnProto 格式处理 `Enum` 时，请使用设置 [format_capn_proto_enum_comparising_mode](/operations/settings/settings-formats.md/#format_capn_proto_enum_comparising_mode)。
- 数组可以嵌套，可以将 `Nullable` 类型作为参数。`Tuple` 和 `Map` 类型也可以嵌套。

## 示例用法 {#example-usage}

### 插入和选择数据 {#inserting-and-selecting-data-capnproto}

您可以通过以下命令将 CapnProto 数据从文件插入到 ClickHouse 表中：

```bash
$ cat capnproto_messages.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_schema = 'schema:Message' FORMAT CapnProto"
```

其中 `schema.capnp` 的内容如下：

```capnp
struct Message {
  SearchPhrase @0 :Text;
  c @1 :Uint64;
}
```

您可以从 ClickHouse 表中选择数据并使用以下命令将它们保存为 `CapnProto` 格式的文件：

```bash
$ clickhouse-client --query = "SELECT * FROM test.hits FORMAT CapnProto SETTINGS format_schema = 'schema:Message'"
```

### 使用自动生成的模式 {#using-autogenerated-capn-proto-schema}

如果您没有外部的 `CapnProto` 模式，您仍然可以使用自动生成的模式在 `CapnProto` 格式中输出/输入数据。

例如：

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS format_capn_proto_use_autogenerated_schema=1
```

在这种情况下，ClickHouse 将根据表结构使用函数 [structureToCapnProtoSchema](/sql-reference/functions/other-functions.md#structure_to_capn_proto_schema) 自动生成 CapnProto 模式，并使用此模式将数据序列化为 CapnProto 格式。

您还可以读取具有自动生成模式的 CapnProto 文件（在这种情况下，该文件必须使用相同的模式创建）：

```bash
$ cat hits.bin | clickhouse-client --query "INSERT INTO test.hits SETTINGS format_capn_proto_use_autogenerated_schema=1 FORMAT CapnProto"
```

## 格式设置 {#format-settings}

设置 [`format_capn_proto_use_autogenerated_schema`](../../operations/settings/settings-formats.md/#format_capn_proto_use_autogenerated_schema) 默认启用，并适用于未设置 [`format_schema`](/interfaces/formats#formatschema) 的情况。

您还可以使用设置 [`output_format_schema`](/operations/settings/formats#output_format_schema) 在输入/输出过程中将自动生成的模式保存到文件中。

例如：

```sql
SELECT * FROM test.hits 
FORMAT CapnProto 
SETTINGS 
    format_capn_proto_use_autogenerated_schema=1,
    output_format_schema='path/to/schema/schema.capnp'
```
在这种情况下，自动生成的 `CapnProto` 模式将保存在文件 `path/to/schema/schema.capnp` 中。
