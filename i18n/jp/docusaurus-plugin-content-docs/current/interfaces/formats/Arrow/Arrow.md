---
alias: []
description: 'Arrow形式のドキュメント'
input_format: true
keywords: ['Arrow']
output_format: true
slug: /interfaces/formats/Arrow
title: 'Arrow'
---
```

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Apache Arrow](https://arrow.apache.org/) は、2つの組み込みの列指向ストレージフォーマットを提供します。ClickHouseはこれらのフォーマットの読み書き操作をサポートしています。
`Arrow` はApache Arrowの「ファイルモード」フォーマットで、インメモリのランダムアクセス用に設計されています。

## データ型の対応 {#data-types-matching}

以下の表は、サポートされているデータ型と、それらがClickHouseの [データ型](/sql-reference/data-types/index.md) にどのように対応するかを示しています。 `INSERT` および `SELECT` クエリでの使用があります。

| Arrowデータ型 (`INSERT`)              | ClickHouseデータ型                                                                                       | Arrowデータ型 (`SELECT`) |
|-----------------------------------------|------------------------------------------------------------------------------------------------------------|----------------------------|
| `BOOL`                                  | [Bool](/sql-reference/data-types/boolean.md)                                                       | `BOOL`                     |
| `UINT8`, `BOOL`                         | [UInt8](/sql-reference/data-types/int-uint.md)                                                     | `UINT8`                    |
| `INT8`                                  | [Int8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)   | `INT8`                     |
| `UINT16`                                | [UInt16](/sql-reference/data-types/int-uint.md)                                                    | `UINT16`                   |
| `INT16`                                 | [Int16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) | `INT16`                    |
| `UINT32`                                | [UInt32](/sql-reference/data-types/int-uint.md)                                                    | `UINT32`                   |
| `INT32`                                 | [Int32](/sql-reference/data-types/int-uint.md)                                                     | `INT32`                    |
| `UINT64`                                | [UInt64](/sql-reference/data-types/int-uint.md)                                                    | `UINT64`                   |
| `INT64`                                 | [Int64](/sql-reference/data-types/int-uint.md)                                                     | `INT64`                    |
| `FLOAT`, `HALF_FLOAT`                   | [Float32](/sql-reference/data-types/float.md)                                                      | `FLOAT32`                  |
| `DOUBLE`                                | [Float64](/sql-reference/data-types/float.md)                                                      | `FLOAT64`                  |
| `DATE32`                                | [Date32](/sql-reference/data-types/date32.md)                                                      | `UINT16`                   |
| `DATE64`                                | [DateTime](/sql-reference/data-types/datetime.md)                                                  | `UINT32`                   |
| `TIMESTAMP`, `TIME32`, `TIME64`         | [DateTime64](/sql-reference/data-types/datetime64.md)                                              | `TIMESTAMP`                |
| `STRING`, `BINARY`                      | [String](/sql-reference/data-types/string.md)                                                      | `BINARY`                   |
| `STRING`, `BINARY`, `FIXED_SIZE_BINARY` | [FixedString](/sql-reference/data-types/fixedstring.md)                                            | `FIXED_SIZE_BINARY`        |
| `DECIMAL`                               | [Decimal](/sql-reference/data-types/decimal.md)                                                    | `DECIMAL`                  |
| `DECIMAL256`                            | [Decimal256](/sql-reference/data-types/decimal.md)                                                 | `DECIMAL256`               |
| `LIST`                                  | [Array](/sql-reference/data-types/array.md)                                                        | `LIST`                     |
| `STRUCT`                                | [Tuple](/sql-reference/data-types/tuple.md)                                                        | `STRUCT`                   |
| `MAP`                                   | [Map](/sql-reference/data-types/map.md)                                                            | `MAP`                      |
| `UINT32`                                | [IPv4](/sql-reference/data-types/ipv4.md)                                                          | `UINT32`                   |
| `FIXED_SIZE_BINARY`, `BINARY`           | [IPv6](/sql-reference/data-types/ipv6.md)                                                          | `FIXED_SIZE_BINARY`        |
| `FIXED_SIZE_BINARY`, `BINARY`           | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                             | `FIXED_SIZE_BINARY`        |

配列はネストでき、引数として `Nullable` 型の値を持つことができます。`Tuple` および `Map` 型もネスト可能です。

`DICTIONARY` 型は `INSERT` クエリでサポートされており、`SELECT` クエリでは [`output_format_arrow_low_cardinality_as_dictionary`](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary) 設定を使用して、[LowCardinality](/sql-reference/data-types/lowcardinality.md) 型を `DICTIONARY` 型として出力することができます。

サポートされていないArrowデータ型: 
- `FIXED_SIZE_BINARY`
- `JSON`
- `UUID`
- `ENUM`.

ClickHouseテーブルカラムのデータ型は、対応するArrowデータフィールドと一致する必要はありません。データを挿入する際、ClickHouseは上記の表に従ってデータ型を解釈し、その後 [casts](/sql-reference/functions/type-conversion-functions#cast) を使用して、ClickHouseテーブルカラムに設定されたデータ型にデータを変換します。

## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

次のコマンドを使用して、ファイルからClickHouseテーブルにArrowデータを挿入することができます：

```bash
$ cat filename.arrow | clickhouse-client --query="INSERT INTO some_table FORMAT Arrow"
```

### データの選択 {#selecting-data}

次のコマンドを使用して、ClickHouseテーブルからデータを選択し、Arrow形式でファイルに保存することができます：

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Arrow" > {filename.arrow}
```

## フォーマット設定 {#format-settings}

| 設定                                                                                                                  | 説明                                                                                        | デフォルト      |
|--------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|--------------|
| `input_format_arrow_allow_missing_columns`                                                                               | Arrow入力フォーマットを読み取る際に、欠落しているカラムを許可します                                            | `1`          |
| `input_format_arrow_case_insensitive_column_matching`                                                                    | ArrowカラムとCHカラムをマッチングする際に、大文字小文字を無視します。                                           | `0`          |
| `input_format_arrow_import_nested`                                                                                       | 廃止された設定で、何も行いません。                                                                    | `0`          |
| `input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference`                                             | フォーマットArrowのスキーマ推論中に、サポートされていない型のカラムをスキップします                        | `0`          |
| `output_format_arrow_compression_method`                                                                                 | Arrow出力フォーマットの圧縮方法。サポートされているコーデック: lz4_frame, zstd, none (未圧縮) | `lz4_frame`  |
| `output_format_arrow_fixed_string_as_fixed_byte_array`                                                                   | FixedStringカラムのためにArrow FIXED_SIZE_BINARY型を使用します。                        | `1`          |
| `output_format_arrow_low_cardinality_as_dictionary`                                                                      | LowCardinality型をDictionary Arrow型として出力することを有効にします                                         | `0`          |
| `output_format_arrow_string_as_string`                                                                                   | StringカラムのためにArrow String型を使用します。                                         | `1`          |
| `output_format_arrow_use_64_bit_indexes_for_dictionary`                                                                  | Arrowフォーマットで辞書インデックスに常に64ビット整数を使用します                                  | `0`          |
| `output_format_arrow_use_signed_indexes_for_dictionary`                                                                  | Arrowフォーマットで辞書インデックスに符号付き整数を使用します                                         | `1`          |
