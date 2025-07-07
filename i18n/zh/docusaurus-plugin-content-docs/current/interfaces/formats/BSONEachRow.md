---
'alias': []
'description': 'BSONEachRow 格式的文档'
'input_format': true
'keywords':
- 'BSONEachRow'
'output_format': true
'slug': '/interfaces/formats/BSONEachRow'
'title': 'BSONEachRow'
---

| 输入   | 输出   | 别名   |
|--------|--------|--------|
| ✔      | ✔      |        |

## 描述 {#description}

`BSONEachRow` 格式将数据解析为一系列二进制 JSON (BSON) 文档，文档之间没有任何分隔符。每行格式化为一个单一文档，每列格式化为具有列名作为键的单一 BSON 文档字段。

## 数据类型匹配 {#data-types-matching}

对于输出，它使用 ClickHouse 类型与 BSON 类型之间的对应关系如下：

| ClickHouse 类型                                                                                                      | BSON 类型                                                                                                    |
|-----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| [Bool](/sql-reference/data-types/boolean.md)                                                                  | `\x08` boolean                                                                                               |
| [Int8/UInt8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)        | `\x10` int32                                                                                                 |
| [Int16/UInt16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md)      | `\x10` int32                                                                                                 |
| [Int32](/sql-reference/data-types/int-uint.md)                                                                | `\x10` int32                                                                                                 |
| [UInt32](/sql-reference/data-types/int-uint.md)                                                               | `\x12` int64                                                                                                 |
| [Int64/UInt64](/sql-reference/data-types/int-uint.md)                                                         | `\x12` int64                                                                                                 |
| [Float32/Float64](/sql-reference/data-types/float.md)                                                         | `\x01` double                                                                                                |
| [Date](/sql-reference/data-types/date.md)/[Date32](/sql-reference/data-types/date32.md)               | `\x10` int32                                                                                                 |
| [DateTime](/sql-reference/data-types/datetime.md)                                                             | `\x12` int64                                                                                                 |
| [DateTime64](/sql-reference/data-types/datetime64.md)                                                         | `\x09` datetime                                                                                              |
| [Decimal32](/sql-reference/data-types/decimal.md)                                                             | `\x10` int32                                                                                                 |
| [Decimal64](/sql-reference/data-types/decimal.md)                                                             | `\x12` int64                                                                                                 |
| [Decimal128](/sql-reference/data-types/decimal.md)                                                            | `\x05` binary, `\x00` binary subtype, size = 16                                                              |
| [Decimal256](/sql-reference/data-types/decimal.md)                                                            | `\x05` binary, `\x00` binary subtype, size = 32                                                              |
| [Int128/UInt128](/sql-reference/data-types/int-uint.md)                                                       | `\x05` binary, `\x00` binary subtype, size = 16                                                              |
| [Int256/UInt256](/sql-reference/data-types/int-uint.md)                                                       | `\x05` binary, `\x00` binary subtype, size = 32                                                              |
| [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md) | `\x05` binary, `\x00` binary subtype 或者 \x02 string，如果设置 output_format_bson_string_as_string 被启用 |
| [UUID](/sql-reference/data-types/uuid.md)                                                                     | `\x05` binary, `\x04` uuid subtype, size = 16                                                                |
| [Array](/sql-reference/data-types/array.md)                                                                   | `\x04` array                                                                                                 |
| [Tuple](/sql-reference/data-types/tuple.md)                                                                   | `\x04` array                                                                                                 |
| [Named Tuple](/sql-reference/data-types/tuple.md)                                                             | `\x03` document                                                                                              |
| [Map](/sql-reference/data-types/map.md)                                                                       | `\x03` document                                                                                              |
| [IPv4](/sql-reference/data-types/ipv4.md)                                                                     | `\x10` int32                                                                                                 |
| [IPv6](/sql-reference/data-types/ipv6.md)                                                                     | `\x05` binary, `\x00` binary subtype                                                                         |

对于输入，它使用 BSON 类型与 ClickHouse 类型之间的对应关系如下：

| BSON 类型                                   | ClickHouse 类型                                                                                                                                                                                                                              |
|---------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `\x01` double                               | [Float32/Float64](/sql-reference/data-types/float.md)                                                                                                                                                                                   |
| `\x02` string                               | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                                   |
| `\x03` document                             | [Map](/sql-reference/data-types/map.md)/[Named Tuple](/sql-reference/data-types/tuple.md)                                                                                                                                               |
| `\x04` array                                | [Array](/sql-reference/data-types/array.md)/[Tuple](/sql-reference/data-types/tuple.md)                                                                                                                                               |
| `\x05` binary, `\x00` binary subtype        | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)/[IPv6](/sql-reference/data-types/ipv6.md)                                                                                      |
| `\x05` binary, `\x02` 旧二进制子类型      | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                                    |
| `\x05` binary, `\x03` 旧 uuid 子类型       | [UUID](/sql-reference/data-types/uuid.md)                                                                                                                                                                                              |
| `\x05` binary, `\x04` uuid 子类型          | [UUID](/sql-reference/data-types/uuid.md)                                                                                                                                                                                              |
| `\x07` ObjectId                             | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                                   |
| `\x08` boolean                              | [Bool](/sql-reference/data-types/boolean.md)                                                                                                                                                                                           |
| `\x09` datetime                             | [DateTime64](/sql-reference/data-types/datetime64.md)                                                                                                                                                                                   |
| `\x0A` null 值                             | [NULL](/sql-reference/data-types/nullable.md)                                                                                                                                                                                        |
| `\x0D` JavaScript 代码                     | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                                   |
| `\x0E` 符号                              | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                                   |
| `\x10` int32                                | [Int32/UInt32](/sql-reference/data-types/int-uint.md)/[Decimal32](/sql-reference/data-types/decimal.md)/[IPv4](/sql-reference/data-types/ipv4.md)/[Enum8/Enum16](/sql-reference/data-types/enum.md)                                      |
| `\x12` int64                                | [Int64/UInt64](/sql-reference/data-types/int-uint.md)/[Decimal64](/sql-reference/data-types/decimal.md)/[DateTime64](/sql-reference/data-types/datetime64.md)                                                                       |

其他 BSON 类型不被支持。此外，它在不同整数类型之间执行转换。
例如，可以将 BSON `int32` 值作为 [`UInt8`](../../sql-reference/data-types/int-uint.md) 插入到 ClickHouse 中。

大整数和十进制，例如 `Int128`/`UInt128`/`Int256`/`UInt256`/`Decimal128`/`Decimal256` 可以从 BSON 二进制值中解析，与 `\x00` 二进制子类型一起使用。
在这种情况下，该格式将验证二进制数据的大小是否与预期值的大小相等。

:::note
该格式在大端平台上无法正常工作。
:::

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

| 设置                                                                                                                                                                                         | 描述                                                                                     | 默认值    |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|---------|
| [`output_format_bson_string_as_string`](../../operations/settings/settings-formats.md/#output_format_bson_string_as_string)                                                                  | 对于字符串列使用 BSON 字符串类型而不是二进制类型。                                          | `false` |
| [`input_format_bson_skip_fields_with_unsupported_types_in_schema_inference`](../../operations/settings/settings-formats.md/#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference) | 允许在格式 BSONEachRow 的模式推断过程中跳过具有不支持类型的列。                           | `false` |
