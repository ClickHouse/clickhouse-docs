---
alias: []
description: 'BSONEachRowフォーマットのドキュメント'
input_format: true
keywords:
- 'BSONEachRow'
output_format: true
slug: '/interfaces/formats/BSONEachRow'
title: 'BSONEachRow'
---




| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`BSONEachRow` フォーマットは、区切り文字なしにバイナリ JSON (BSON) 文書のシーケンスとしてデータを解析します。
各行は単一の文書としてフォーマットされ、各カラムはカラム名をキーとする単一の BSON 文書フィールドとしてフォーマットされます。

## データ型の対応 {#data-types-matching}

出力には、ClickHouse 型と BSON 型の間の次の対応を使用します。

| ClickHouse 型                                                                                                       | BSON 型                                                                                                     |
|-------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| [Bool](/sql-reference/data-types/boolean.md)                                                                  | `\x08` boolean                                                                                                |
| [Int8/UInt8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)        | `\x10` int32                                                                                                  |
| [Int16/UInt16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md)      | `\x10` int32                                                                                                  |
| [Int32](/sql-reference/data-types/int-uint.md)                                                                | `\x10` int32                                                                                                  |
| [UInt32](/sql-reference/data-types/int-uint.md)                                                               | `\x12` int64                                                                                                  |
| [Int64/UInt64](/sql-reference/data-types/int-uint.md)                                                         | `\x12` int64                                                                                                  |
| [Float32/Float64](/sql-reference/data-types/float.md)                                                         | `\x01` double                                                                                                 |
| [Date](/sql-reference/data-types/date.md)/[Date32](/sql-reference/data-types/date32.md)               | `\x10` int32                                                                                                  |
| [DateTime](/sql-reference/data-types/datetime.md)                                                             | `\x12` int64                                                                                                  |
| [DateTime64](/sql-reference/data-types/datetime64.md)                                                         | `\x09` datetime                                                                                               |
| [Decimal32](/sql-reference/data-types/decimal.md)                                                             | `\x10` int32                                                                                                  |
| [Decimal64](/sql-reference/data-types/decimal.md)                                                             | `\x12` int64                                                                                                  |
| [Decimal128](/sql-reference/data-types/decimal.md)                                                            | `\x05` binary, `\x00` binary subtype, size = 16                                                               |
| [Decimal256](/sql-reference/data-types/decimal.md)                                                            | `\x05` binary, `\x00` binary subtype, size = 32                                                               |
| [Int128/UInt128](/sql-reference/data-types/int-uint.md)                                                       | `\x05` binary, `\x00` binary subtype, size = 16                                                               |
| [Int256/UInt256](/sql-reference/data-types/int-uint.md)                                                       | `\x05` binary, `\x00` binary subtype, size = 32                                                               |
| [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md) | `\x05` binary, `\x00` binary subtype または、設定 output_format_bson_string_as_string が有効な場合は \x02 string |
| [UUID](/sql-reference/data-types/uuid.md)                                                                     | `\x05` binary, `\x04` uuid subtype, size = 16                                                                 |
| [Array](/sql-reference/data-types/array.md)                                                                   | `\x04` array                                                                                                  |
| [Tuple](/sql-reference/data-types/tuple.md)                                                                   | `\x04` array                                                                                                  |
| [Named Tuple](/sql-reference/data-types/tuple.md)                                                             | `\x03` document                                                                                               |
| [Map](/sql-reference/data-types/map.md)                                                                       | `\x03` document                                                                                               |
| [IPv4](/sql-reference/data-types/ipv4.md)                                                                     | `\x10` int32                                                                                                  |
| [IPv6](/sql-reference/data-types/ipv6.md)                                                                     | `\x05` binary, `\x00` binary subtype                                                                          |

入力には、BSON 型と ClickHouse 型の間の次の対応を使用します。

| BSON 型                                | ClickHouse 型                                                                                                                                                                                                                             |
|----------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `\x01` double                          | [Float32/Float64](/sql-reference/data-types/float.md)                                                                                                                                                                               |
| `\x02` string                          | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x03` document                        | [Map](/sql-reference/data-types/map.md)/[Named Tuple](/sql-reference/data-types/tuple.md)                                                                                                                                   |
| `\x04` array                           | [Array](/sql-reference/data-types/array.md)/[Tuple](/sql-reference/data-types/tuple.md)                                                                                                                                     |
| `\x05` binary, `\x00` binary subtype   | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)/[IPv6](/sql-reference/data-types/ipv6.md)                                                             |
| `\x05` binary, `\x02` old binary subtype | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x05` binary, `\x03` old uuid subtype | [UUID](/sql-reference/data-types/uuid.md)                                                                                                                                                                                           |
| `\x05` binary, `\x04` uuid subtype     | [UUID](/sql-reference/data-types/uuid.md)                                                                                                                                                                                           |
| `\x07` ObjectId                        | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x08` boolean                         | [Bool](/sql-reference/data-types/boolean.md)                                                                                                                                                                                        |
| `\x09` datetime                        | [DateTime64](/sql-reference/data-types/datetime64.md)                                                                                                                                                                               |
| `\x0A` null value                      | [NULL](/sql-reference/data-types/nullable.md)                                                                                                                                                                                       |
| `\x0D` JavaScript code                 | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x0E` symbol                          | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x10` int32                           | [Int32/UInt32](/sql-reference/data-types/int-uint.md)/[Decimal32](/sql-reference/data-types/decimal.md)/[IPv4](/sql-reference/data-types/ipv4.md)/[Enum8/Enum16](/sql-reference/data-types/enum.md) |
| `\x12` int64                           | [Int64/UInt64](/sql-reference/data-types/int-uint.md)/[Decimal64](/sql-reference/data-types/decimal.md)/[DateTime64](/sql-reference/data-types/datetime64.md)                                                       |

他の BSON 型はサポートされていません。また、異なる整数型の間での変換も行います。
例えば、BSON `int32` 値を ClickHouse に [`UInt8`](../../sql-reference/data-types/int-uint.md) として挿入することが可能です。

`Int128`/`UInt128`/`Int256`/`UInt256`/`Decimal128`/`Decimal256` などの大きな整数と小数は、BSON バイナリ値から `\x00` バイナリサブタイプで解析できます。
この場合、フォーマットはバイナリデータのサイズが期待される値のサイズに等しいことを検証します。

:::note
このフォーマットはビッグエンディアンプラットフォームでは正しく機能しません。
:::

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                                                               | 説明                                                                                      | デフォルト  |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|----------|
| [`output_format_bson_string_as_string`](../../operations/settings/settings-formats.md/#output_format_bson_string_as_string)                                                                           | 文字列カラムのためにバイナリではなく BSON 文字列型を使用します。                                   | `false`  |
| [`input_format_bson_skip_fields_with_unsupported_types_in_schema_inference`](../../operations/settings/settings-formats.md/#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference) | フォーマット BSONEachRow のスキーマ推論中にサポートされていない型のカラムをスキップできるようにします。 | `false`  |
