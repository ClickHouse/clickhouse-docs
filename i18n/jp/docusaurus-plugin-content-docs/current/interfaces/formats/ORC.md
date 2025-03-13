---
title: ORC
slug: /interfaces/formats/ORC
keywords: [ORC]
input_format: true
output_format: true
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Apache ORC](https://orc.apache.org/) は、[Hadoop](https://hadoop.apache.org/) エコシステムで広く使用されている列指向ストレージフォーマットです。

## データ型の対応 {#data-types-matching-orc}

下の表は、サポートされているORCデータ型と、それに対応するClickHouseの[データ型](/sql-reference/data-types/index.md)を`INSERT`および`SELECT`クエリにおいて比較しています。

| ORCデータ型 (`INSERT`)                       | ClickHouseデータ型                                                                                              | ORCデータ型 (`SELECT`) |
|---------------------------------------|-------------------------------------------------------------------------------------------------------------------|--------------------------|
| `Boolean`                             | [UInt8](/sql-reference/data-types/int-uint.md)                                                            | `Boolean`                |
| `Tinyint`                             | [Int8/UInt8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)    | `Tinyint`                |
| `Smallint`                            | [Int16/UInt16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) | `Smallint`               |
| `Int`                                 | [Int32/UInt32](/sql-reference/data-types/int-uint.md)                                                     | `Int`                    |
| `Bigint`                              | [Int64/UInt32](/sql-reference/data-types/int-uint.md)                                                     | `Bigint`                 |
| `Float`                               | [Float32](/sql-reference/data-types/float.md)                                                             | `Float`                  |
| `Double`                              | [Float64](/sql-reference/data-types/float.md)                                                             | `Double`                 |
| `Decimal`                             | [Decimal](/sql-reference/data-types/decimal.md)                                                           | `Decimal`                |
| `Date`                                | [Date32](/sql-reference/data-types/date32.md)                                                             | `Date`                   |
| `Timestamp`                           | [DateTime64](/sql-reference/data-types/datetime64.md)                                                     | `Timestamp`              |
| `String`, `Char`, `Varchar`, `Binary` | [String](/sql-reference/data-types/string.md)                                                             | `Binary`                 |
| `List`                                | [Array](/sql-reference/data-types/array.md)                                                               | `List`                   |
| `Struct`                              | [Tuple](/sql-reference/data-types/tuple.md)                                                               | `Struct`                 |
| `Map`                                 | [Map](/sql-reference/data-types/map.md)                                                                   | `Map`                    |
| `Int`                                 | [IPv4](/sql-reference/data-types/int-uint.md)                                                             | `Int`                    |
| `Binary`                              | [IPv6](/sql-reference/data-types/ipv6.md)                                                                 | `Binary`                 |
| `Binary`                              | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                                    | `Binary`                 |
| `Binary`                              | [Decimal256](/sql-reference/data-types/decimal.md)                                                        | `Binary`                 |

- その他の型はサポートされていません。
- 配列はネスト可能で、引数として`Nullable`型の値を持つことができます。`Tuple`および`Map`型もネスト可能です。
- ClickHouseテーブルカラムのデータ型は、対応するORCデータフィールドと一致する必要はありません。データを挿入する際、ClickHouseは上のテーブルに従ってデータ型を解釈し、その後、[キャスト](/sql-reference/functions/type-conversion-functions#cast)してClickHouseテーブルカラムに設定されたデータ型に変換します。

## 使用例 {#example-usage}

### データの挿入 {#inserting-data-orc}

ファイルからClickHouseテーブルにORCデータを挿入するには、次のコマンドを使用します：

```bash
$ cat filename.orc | clickhouse-client --query="INSERT INTO some_table FORMAT ORC"
```

### データの選択 {#selecting-data-orc}

ClickHouseテーブルからデータを選択し、ORC形式でファイルに保存するには、次のコマンドを使用します：

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT ORC" > {filename.orc}
```

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                                                                      | 説明                                                                                   | デフォルト |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|---------|
| [`output_format_arrow_string_as_string`](/operations/settings/settings-formats.md/#output_format_arrow_string_as_string)                                                                             | StringカラムのためにBinaryの代わりにArrow String型を使用します。                             | `false` |
| [`output_format_orc_compression_method`](/operations/settings/settings-formats.md/#output_format_orc_compression_method)                                                                             | 出力ORCフォーマットで使用される圧縮メソッド。デフォルト値                                | `none`  |
| [`input_format_arrow_case_insensitive_column_matching`](/operations/settings/settings-formats.md/#input_format_arrow_case_insensitive_column_matching)                                               | ClickHouseカラムとArrowカラムをマッチさせる際に大文字と小文字を無視します。                   | `false` |
| [`input_format_arrow_allow_missing_columns`](/operations/settings/settings-formats.md/#input_format_arrow_allow_missing_columns)                                                                     | Arrowデータを読み込む際に欠落カラムを許可します。                                        | `false` |
| [`input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference) | Arrowフォーマットのスキーマ推論時にサポートされていない型の列をスキップすることを許可します。 | `false` |

Hadoopとデータを交換するには、[HDFSテーブルエンジン](/engines/table-engines/integrations/hdfs.md)を使用できます。
