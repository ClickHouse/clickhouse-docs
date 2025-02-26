---
title: ORC
slug: /interfaces/formats/ORC
keywords: [ORC]
input_format: true
output_format: true
alias: []
---

| 入力  | 出力  | エイリアス |
|-------|--------|------------|
| ✔     | ✔      |            |

## 説明 {#description}

[Apache ORC](https://orc.apache.org/) は、[Hadoop](https://hadoop.apache.org/) エコシステムで広く使用されている列指向ストレージフォーマットです。

## データタイプの一致 {#data-types-matching-orc}

以下の表は、サポートされている ORC データタイプと、それに対応する ClickHouse の [データタイプ](/sql-reference/data-types/index.md) を `INSERT` および `SELECT` クエリで比較したものです。

| ORC データタイプ (`INSERT`)                      | ClickHouse データタイプ                                                                                             | ORC データタイプ (`SELECT`) |
|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|-------------------------------|
| `Boolean`                                       | [UInt8](/sql-reference/data-types/int-uint.md)                                                             | `Boolean`                     |
| `Tinyint`                                       | [Int8/UInt8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)         | `Tinyint`                     |
| `Smallint`                                      | [Int16/UInt16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md)      | `Smallint`                    |
| `Int`                                           | [Int32/UInt32](/sql-reference/data-types/int-uint.md)                                                      | `Int`                         |
| `Bigint`                                        | [Int64/UInt32](/sql-reference/data-types/int-uint.md)                                                      | `Bigint`                      |
| `Float`                                         | [Float32](/sql-reference/data-types/float.md)                                                              | `Float`                       |
| `Double`                                        | [Float64](/sql-reference/data-types/float.md)                                                              | `Double`                      |
| `Decimal`                                       | [Decimal](/sql-reference/data-types/decimal.md)                                                            | `Decimal`                     |
| `Date`                                          | [Date32](/sql-reference/data-types/date32.md)                                                              | `Date`                        |
| `Timestamp`                                     | [DateTime64](/sql-reference/data-types/datetime64.md)                                                      | `Timestamp`                   |
| `String`, `Char`, `Varchar`, `Binary`           | [String](/sql-reference/data-types/string.md)                                                              | `Binary`                      |
| `List`                                          | [Array](/sql-reference/data-types/array.md)                                                                | `List`                        |
| `Struct`                                        | [Tuple](/sql-reference/data-types/tuple.md)                                                                | `Struct`                      |
| `Map`                                           | [Map](/sql-reference/data-types/map.md)                                                                    | `Map`                         |
| `Int`                                           | [IPv4](/sql-reference/data-types/int-uint.md)                                                              | `Int`                         |
| `Binary`                                        | [IPv6](/sql-reference/data-types/ipv6.md)                                                                  | `Binary`                      |
| `Binary`                                        | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                                     | `Binary`                      |
| `Binary`                                        | [Decimal256](/sql-reference/data-types/decimal.md)                                                         | `Binary`                      |

- その他のタイプはサポートされていません。
- 配列はネスト可能で、引数として `Nullable` 型の値を持つことができます。`Tuple` および `Map` 型もネスト可能です。
- ClickHouse テーブルのカラムのデータタイプは、対応する ORC データフィールドと一致する必要はありません。データを挿入するとき、ClickHouse は上記の表に従ってデータタイプを解釈し、その後に [キャスト](/sql-reference/functions/type-conversion-functions.md/#type_conversion_function-cast) して ClickHouse テーブルカラムに設定されたデータタイプにデータを変更します。

## 使用例 {#example-usage}

### データの挿入 {#inserting-data-orc}

次のコマンドを使用して、ファイルから ClickHouse テーブルに ORC データを挿入できます。

```bash
$ cat filename.orc | clickhouse-client --query="INSERT INTO some_table FORMAT ORC"
```

### データの選択 {#selecting-data-orc}

次のコマンドを使用して、ClickHouse テーブルからデータを選択し、ORC フォーマットのファイルに保存できます。

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT ORC" > {filename.orc}
```

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                                                                     | 説明                                                                                 | デフォルト |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|-----------|
| [`output_format_arrow_string_as_string`](/operations/settings/settings-formats.md/#output_format_arrow_string_as_string)                                                                            | 文字列カラムのために、バイナリではなく Arrow 文字列タイプを使用します。            | `false`   |
| [`output_format_orc_compression_method`](/operations/settings/settings-formats.md/#output_format_orc_compression_method)                                                                            | 出力 ORC フォーマットに使用される圧縮方式です。デフォルト値                         | `none`    |
| [`input_format_arrow_case_insensitive_column_matching`](/operations/settings/settings-formats.md/#input_format_arrow_case_insensitive_column_matching)                                                | Arrow カラムと ClickHouse カラムをマッチさせる際に大文字小文字を無視します。      | `false`   |
| [`input_format_arrow_allow_missing_columns`](/operations/settings/settings-formats.md/#input_format_arrow_allow_missing_columns)                                                                      | Arrow データを読み取る際に欠損カラムを許可します。                                | `false`   |
| [`input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference) | Arrow フォーマットのスキーマ推論において、サポートされていないタイプのカラムをスキップできることを許可します。 | `false`   |

Hadoop とデータを交換するには、[HDFS テーブルエンジン](/engines/table-engines/integrations/hdfs.md)を使用できます。
