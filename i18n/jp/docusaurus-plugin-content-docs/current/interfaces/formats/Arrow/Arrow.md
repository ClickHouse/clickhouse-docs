---
alias: []
description: 'Arrow 形式に関するドキュメント'
input_format: true
keywords: ['Arrow']
output_format: true
slug: /interfaces/formats/Arrow
title: 'Arrow'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Apache Arrow](https://arrow.apache.org/) には、組み込みのカラムナ型ストレージフォーマットが 2 つ用意されています。ClickHouse はこれらのフォーマットに対する読み書き処理をサポートしています。
`Arrow` は Apache Arrow の「ファイルモード」フォーマットです。メモリ上でのランダムアクセス向けに設計されています。

## データ型の対応関係 {#data-types-matching}

次の表は、サポートされているデータ型と、それらが `INSERT` および `SELECT` クエリで ClickHouse の [データ型](/sql-reference/data-types/index.md) にどのように対応するかを示しています。

| Arrow data type (`INSERT`)              | ClickHouse data type                                                                                       | Arrow data type (`SELECT`) |
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

配列は入れ子（ネスト）にすることができ、引数として `Nullable` 型の値を持つことができます。`Tuple` 型および `Map` 型も入れ子にすることができます。

`DICTIONARY` 型は `INSERT` クエリでサポートされており、`SELECT` クエリに対しては、[LowCardinality](/sql-reference/data-types/lowcardinality.md) 型を `DICTIONARY` 型として出力できるようにする [`output_format_arrow_low_cardinality_as_dictionary`](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary) 設定があります。

サポートされていない Arrow データ型は次のとおりです:

- `FIXED_SIZE_BINARY`
- `JSON`
- `UUID`
- `ENUM`.

ClickHouse テーブル列のデータ型は、対応する Arrow データフィールドと一致している必要はありません。データを挿入する際、ClickHouse はまず上記の表に従ってデータ型を解釈し、その後、ClickHouse テーブル列に設定されているデータ型へデータを[キャスト](/sql-reference/functions/type-conversion-functions#cast)します。

## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

次のコマンドを使用して、ファイルから ClickHouse テーブルに Arrow 形式のデータを挿入できます。

```bash
$ cat filename.arrow | clickhouse-client --query="INSERT INTO some_table FORMAT Arrow"
```

### データの選択 {#selecting-data}

次のコマンドを使用して、ClickHouse のテーブルからデータを抽出し、Arrow 形式のファイルに保存できます。

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Arrow" > {filename.arrow}
```

## フォーマット設定 {#format-settings}

| 設定                                                                                                                      | 説明                                                                                               | デフォルト   |
|--------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|--------------|
| `input_format_arrow_allow_missing_columns`                                                                               | Arrow 入力フォーマットの読み取り時に列の欠落を許可する                                            | `1`          |
| `input_format_arrow_case_insensitive_column_matching`                                                                    | Arrow の列と CH の列を照合する際に大文字小文字を区別しない                                         | `0`          |
| `input_format_arrow_import_nested`                                                                                       | 廃止された設定で、何もしない                                                                       | `0`          |
| `input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference`                                             | Arrow フォーマットのスキーマ推論時に、未対応の型を持つ列をスキップする                            | `0`          |
| `output_format_arrow_compression_method`                                                                                 | Arrow 出力フォーマットの圧縮方式。サポートされるコーデック: lz4_frame, zstd, none (非圧縮)        | `lz4_frame`  |
| `output_format_arrow_fixed_string_as_fixed_byte_array`                                                                   | FixedString 列に対して Binary 型の代わりに Arrow の FIXED_SIZE_BINARY 型を使用する                | `1`          |
| `output_format_arrow_low_cardinality_as_dictionary`                                                                      | LowCardinality 型を Dictionary Arrow 型として出力することを有効にする                             | `0`          |
| `output_format_arrow_string_as_string`                                                                                   | String 列に対して Binary 型の代わりに Arrow の String 型を使用する                                | `1`          |
| `output_format_arrow_use_64_bit_indexes_for_dictionary`                                                                  | Arrow フォーマットのディクショナリインデックスに常に 64 ビット整数を使用する                     | `0`          |
| `output_format_arrow_use_signed_indexes_for_dictionary`                                                                  | Arrow フォーマットのディクショナリインデックスに符号付き整数を使用する                           | `1`          |