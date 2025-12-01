---
alias: []
description: 'MsgPack フォーマットに関するドキュメント'
input_format: true
keywords: ['MsgPack']
output_format: true
slug: /interfaces/formats/MsgPack
title: 'MsgPack'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |



## 説明 {#description}

ClickHouse は [MessagePack](https://msgpack.org/) データファイルの読み書きをサポートしています。



## データ型の対応 {#data-types-matching}

| MessagePack データ型（`INSERT`）                                   | ClickHouse のデータ型                                                                                 | MessagePack データ型（`SELECT`） |
|--------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|----------------------------------|
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
| `bin 8`                                                            | [`(U)Int128`/`(U)Int256`](/sql-reference/data-types/int-uint.md)                                  | `bin 8`                          |
| `int 32`                                                           | [`Decimal32`](/sql-reference/data-types/decimal.md)                                               | `int 32`                         |
| `int 64`                                                           | [`Decimal64`](/sql-reference/data-types/decimal.md)                                               | `int 64`                         |
| `bin 8`                                                            | [`Decimal128`/`Decimal256`](/sql-reference/data-types/decimal.md)                                 | `bin 8`                          |



## 使用例 {#example-usage}

「.msgpk」ファイルへの書き込み:

```sql
$ clickhouse-client --query="CREATE TABLE msgpack (array Array(UInt8)) ENGINE = Memory;"
$ clickhouse-client --query="INSERT INTO msgpack VALUES ([0, 1, 2, 3, 42, 253, 254, 255]), ([255, 254, 253, 42, 3, 2, 1, 0])";
$ clickhouse-client --query="SELECT * FROM msgpack FORMAT MsgPack" > tmp_msgpack.msgpk;
```


## フォーマット設定 {#format-settings}

| 設定                                                                                                                                    | 説明                                                                                         | 既定値 |
|--------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|---------|
| [`input_format_msgpack_number_of_columns`](/operations/settings/settings-formats.md/#input_format_msgpack_number_of_columns)       | 挿入される MsgPack データの列数。データからの自動スキーマ推論に使用されます。 | `0`     |
| [`output_format_msgpack_uuid_representation`](/operations/settings/settings-formats.md/#output_format_msgpack_uuid_representation) | MsgPack 形式における UUID の出力方法を指定します。                                    | `EXT`   |