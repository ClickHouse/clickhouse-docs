---
'alias': []
'description': 'ORC フォーマットのドキュメント'
'input_format': true
'keywords':
- 'ORC'
'output_format': true
'slug': '/interfaces/formats/ORC'
'title': 'ORC'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Apache ORC](https://orc.apache.org/) は、[Hadoop](https://hadoop.apache.org/) エコシステムで広く使用されている列指向ストレージ形式です。

## データ型の一致 {#data-types-matching-orc}

下の表は、サポートされている ORC データ型と、それに対応する ClickHouse の [データ型](/sql-reference/data-types/index.md) を `INSERT` および `SELECT` クエリで比較したものです。

| ORC データ型 (`INSERT`)              | ClickHouse データ型                                                                                              | ORC データ型 (`SELECT`) |
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

- 他の型はサポートされていません。
- 配列はネスト可能で、引数として `Nullable` 型の値を持つことができます。`Tuple` と `Map` 型もネスト可能です。
- ClickHouse テーブルカラムのデータ型は、対応する ORC データフィールドに一致する必要はありません。データを挿入する際、ClickHouse は上の表に従ってデータ型を解釈し、その後 [キャスト](/sql-reference/functions/type-conversion-functions#cast) して ClickHouse テーブルカラムに設定されたデータ型に変換します。

## 使用例 {#example-usage}

### データの挿入 {#inserting-data-orc}

以下のコマンドを使用して、ファイルから ClickHouse テーブルに ORC データを挿入できます：

```bash
$ cat filename.orc | clickhouse-client --query="INSERT INTO some_table FORMAT ORC"
```

### データの選択 {#selecting-data-orc}

以下のコマンドを使用して、ClickHouse テーブルからデータを選択し、ORC フォーマットのファイルに保存できます：

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT ORC" > {filename.orc}
```

## 形式設定 {#format-settings}

| 設定                                                                                                                                                                                            | 説明                                                                             | デフォルト |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|-----------|
| [`output_format_arrow_string_as_string`](/operations/settings/settings-formats.md/#output_format_arrow_string_as_string)                                                                    | 文字列カラムのためにバイナリではなく Arrow String 型を使用します。              | `false`   |
| [`output_format_orc_compression_method`](/operations/settings/settings-formats.md/#output_format_orc_compression_method)                                                                    | 出力 ORC 形式で使用される圧縮方法。デフォルト値                                | `none`    |
| [`input_format_arrow_case_insensitive_column_matching`](/operations/settings/settings-formats.md/#input_format_arrow_case_insensitive_column_matching)                                         | Arrow カラムと ClickHouse カラムの一致を確認する際に大文字と小文字を無視します。 | `false`   |
| [`input_format_arrow_allow_missing_columns`](/operations/settings/settings-formats.md/#input_format_arrow_allow_missing_columns)                                                             | Arrow データを読み取る際に欠落したカラムを許可します。                        | `false`   |
| [`input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference) | Arrow 形式のスキーマ推論中にサポートされていない型のカラムをスキップすることを許可します。| `false`   |

Hadoop とデータを交換するには、[HDFS テーブルエンジン](/engines/table-engines/integrations/hdfs.md)を使用できます。
