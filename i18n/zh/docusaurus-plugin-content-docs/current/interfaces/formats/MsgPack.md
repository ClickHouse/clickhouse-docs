---
alias: []
description: 'MsgPack 格式文档'
input_format: true
keywords: ['MsgPack']
output_format: true
slug: /interfaces/formats/MsgPack
title: 'MsgPack'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 \\{#description\\}

ClickHouse 支持读写 [MessagePack](https://msgpack.org/) 数据文件。

## 数据类型对应关系 \\{#data-types-matching\\}

| MessagePack 数据类型（`INSERT`）                                   | ClickHouse 数据类型                                                                                    | MessagePack 数据类型（`SELECT`） |
|--------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|----------------------------------|
| `uint N`, `positive fixint`                                        | [`UIntN`](/sql-reference/data-types/int-uint.md)                                                  | `uint N`                         |
| `int N`, `negative fixint`                                         | [`IntN`](/sql-reference/data-types/int-uint.md)                                                   | `int N`                          |
| `bool`                                                             | [`UInt8`](/sql-reference/data-types/int-uint.md)                                                  | `uint 8`                         |
| `fixstr`, `str 8`, `str 16`, `str 32`, `bin 8`, `bin 16`, `bin 32` | [`String`](/sql-reference/data-types/string.md)                                                   | `bin 8`, `bin 16`, `bin 32`      |
| `fixstr`, `str 8`, `str 16`, `str 32`, `bin 8`, `bin 16`, `bin 32` | [`FixedString`](/sql-reference/data-types/fixedstring.md)                                         | `bin 8`, `bin 16`, `bin 32`      |
| `float 32`                                                         | [`Float32`](/sql-reference/data-types/float.md)                                                   | `float 32`                       |
| `float 64`                                                         | [`Float64`](/sql-reference/data-types/float.md)                                                   | `float 64`                       |
| `uint 16`                                                          | [`Date`](/sql-reference/data-types/date.md)                                                       | `uint 16`                        |
| `int 32`                                                           | [`Date32`](/sql-reference/data-types/date32.md)                                                   | `int 32`                         |
| `uint 32`                                                          | [`DateTime`](/sql-reference/data-types/datetime.md)                                               | `uint 32`                        |
| `uint 64`                                                          | [`DateTime64`](/sql-reference/data-types/datetime.md)                                             | `uint 64`                        |
| `fixarray`, `array 16`, `array 32`                                 | [`Array`](/sql-reference/data-types/array.md)/[`Tuple`](/sql-reference/data-types/tuple.md) | `fixarray`, `array 16`, `array 32` |
| `fixmap`, `map 16`, `map 32`                                       | [`Map`](/sql-reference/data-types/map.md)                                                         | `fixmap`, `map 16`, `map 32`     |
| `uint 32`                                                          | [`IPv4`](/sql-reference/data-types/ipv4.md)                                                       | `uint 32`                        |
| `bin 8`                                                            | [`String`](/sql-reference/data-types/string.md)                                                   | `bin 8`                          |
| `int 8`                                                            | [`Enum8`](/sql-reference/data-types/enum.md)                                                      | `int 8`                          |
| `bin 8`                                                            | [`(U)Int128`/`(U)Int256`](/sql-reference/data-types/int-uint.md)                                    | `bin 8`                          |
| `int 32`                                                           | [`Decimal32`](/sql-reference/data-types/decimal.md)                                               | `int 32`                         |
| `int 64`                                                           | [`Decimal64`](/sql-reference/data-types/decimal.md)                                               | `int 64`                         |
| `bin 8`                                                            | [`Decimal128`/`Decimal256`](/sql-reference/data-types/decimal.md)                                   | `bin 8 `                         |

## 示例用法 \\{#example-usage\\}

写入“.msgpk”文件：

```sql
$ clickhouse-client --query="CREATE TABLE msgpack (array Array(UInt8)) ENGINE = Memory;"
$ clickhouse-client --query="INSERT INTO msgpack VALUES ([0, 1, 2, 3, 42, 253, 254, 255]), ([255, 254, 253, 42, 3, 2, 1, 0])";
$ clickhouse-client --query="SELECT * FROM msgpack FORMAT MsgPack" > tmp_msgpack.msgpk;
```

## 格式设置 \\{#format-settings\\}

| 设置                                                                                                                                    | 描述                                                                                    | 默认值 |
|--------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|---------|
| [`input_format_msgpack_number_of_columns`](/operations/settings/settings-formats.md/#input_format_msgpack_number_of_columns)       | 插入的 MsgPack 数据中的列数。用于根据数据自动推断表结构。 | `0`     |
| [`output_format_msgpack_uuid_representation`](/operations/settings/settings-formats.md/#output_format_msgpack_uuid_representation) | UUID 在 MsgPack 格式中的输出表示方式。                                                  | `EXT`   |