---
'alias': []
'description': 'ORCフォーマットに関するDocumentation'
'input_format': true
'keywords':
- 'ORC'
'output_format': true
'slug': '/interfaces/formats/ORC'
'title': 'ORC'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Apache ORC](https://orc.apache.org/)は、[Hadoop](https://hadoop.apache.org/)エコシステムで広く使用されている列指向ストレージ形式です。

## データ型のマッピング {#data-types-matching-orc}

以下の表は、サポートされているORCデータ型と、それに対応するClickHouseの[data types](/sql-reference/data-types/index.md)を`INSERT`および`SELECT`クエリで比較したものです。

| ORCデータ型 (`INSERT`)              | ClickHouseデータ型                                                                                              | ORCデータ型 (`SELECT`) |
|-------------------------------------|----------------------------------------------------------------------------------------------------------------|--------------------------|
| `Boolean`                           | [UInt8](/sql-reference/data-types/int-uint.md)                                                              | `Boolean`                |
| `Tinyint`                           | [Int8/UInt8](/sql-reference/data-types/int-uint.md)/[Enum8](/sql-reference/data-types/enum.md)    | `Tinyint`                |
| `Smallint`                          | [Int16/UInt16](/sql-reference/data-types/int-uint.md)/[Enum16](/sql-reference/data-types/enum.md) | `Smallint`               |
| `Int`                               | [Int32/UInt32](/sql-reference/data-types/int-uint.md)                                                       | `Int`                    |
| `Bigint`                            | [Int64/UInt32](/sql-reference/data-types/int-uint.md)                                                       | `Bigint`                 |
| `Float`                             | [Float32](/sql-reference/data-types/float.md)                                                               | `Float`                  |
| `Double`                            | [Float64](/sql-reference/data-types/float.md)                                                               | `Double`                 |
| `Decimal`                           | [Decimal](/sql-reference/data-types/decimal.md)                                                             | `Decimal`                |
| `Date`                              | [Date32](/sql-reference/data-types/date32.md)                                                               | `Date`                   |
| `Timestamp`                         | [DateTime64](/sql-reference/data-types/datetime64.md)                                                       | `Timestamp`              |
| `String`, `Char`, `Varchar`, `Binary` | [String](/sql-reference/data-types/string.md)                                                               | `Binary`                 |
| `List`                              | [Array](/sql-reference/data-types/array.md)                                                                 | `List`                   |
| `Struct`                            | [Tuple](/sql-reference/data-types/tuple.md)                                                                 | `Struct`                 |
| `Map`                               | [Map](/sql-reference/data-types/map.md)                                                                     | `Map`                    |
| `Int`                               | [IPv4](/sql-reference/data-types/int-uint.md)                                                               | `Int`                    |
| `Binary`                            | [IPv6](/sql-reference/data-types/ipv6.md)                                                                   | `Binary`                 |
| `Binary`                            | [Int128/UInt128/Int256/UInt256](/sql-reference/data-types/int-uint.md)                                    | `Binary`                 |
| `Binary`                            | [Decimal256](/sql-reference/data-types/decimal.md)                                                          | `Binary`                 |

- その他のタイプはサポートされていません。
- 配列はネスト可能で、引数として`Nullable`型の値を持つことができます。`Tuple`および`Map`型もネスト可能です。
- ClickHouseテーブルのカラムのデータ型は、対応するORCデータフィールドと一致する必要はありません。データを挿入する際、ClickHouseは上の表に従ってデータ型を解釈し、次に[キャスト](/sql-reference/functions/type-conversion-functions#cast)してClickHouseテーブルカラムに設定されたデータ型にデータを変換します。

## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

以下のデータを持つORCファイルを使用し、`football.orc`として名前を付けます:

```text
    ┌───────date─┬─season─┬─home_team─────────────┬─away_team───────────┬─home_team_goals─┬─away_team_goals─┐
 1. │ 2022-04-30 │   2021 │ Sutton United         │ Bradford City       │               1 │               4 │
 2. │ 2022-04-30 │   2021 │ Swindon Town          │ Barrow              │               2 │               1 │
 3. │ 2022-04-30 │   2021 │ Tranmere Rovers       │ Oldham Athletic     │               2 │               0 │
 4. │ 2022-05-02 │   2021 │ Port Vale             │ Newport County      │               1 │               2 │
 5. │ 2022-05-02 │   2021 │ Salford City          │ Mansfield Town      │               2 │               2 │
 6. │ 2022-05-07 │   2021 │ Barrow                │ Northampton Town    │               1 │               3 │
 7. │ 2022-05-07 │   2021 │ Bradford City         │ Carlisle United     │               2 │               0 │
 8. │ 2022-05-07 │   2021 │ Bristol Rovers        │ Scunthorpe United   │               7 │               0 │
 9. │ 2022-05-07 │   2021 │ Exeter City           │ Port Vale           │               0 │               1 │
10. │ 2022-05-07 │   2021 │ Harrogate Town A.F.C. │ Sutton United       │               0 │               2 │
11. │ 2022-05-07 │   2021 │ Hartlepool United     │ Colchester United   │               0 │               2 │
12. │ 2022-05-07 │   2021 │ Leyton Orient         │ Tranmere Rovers     │               0 │               1 │
13. │ 2022-05-07 │   2021 │ Mansfield Town        │ Forest Green Rovers │               2 │               2 │
14. │ 2022-05-07 │   2021 │ Newport County        │ Rochdale            │               0 │               2 │
15. │ 2022-05-07 │   2021 │ Oldham Athletic       │ Crawley Town        │               3 │               3 │
16. │ 2022-05-07 │   2021 │ Stevenage Borough     │ Salford City        │               4 │               2 │
17. │ 2022-05-07 │   2021 │ Walsall               │ Swindon Town        │               0 │               3 │
    └────────────┴────────┴───────────────────────┴─────────────────────┴─────────────────┴─────────────────┘
```

データを挿入します:

```sql
INSERT INTO football FROM INFILE 'football.orc' FORMAT ORC;
```

### データの読み取り {#reading-data}

`ORC`形式を使用してデータを読み取ります:

```sql
SELECT *
FROM football
INTO OUTFILE 'football.orc'
FORMAT ORC
```

:::tip
ORCはバイナリ形式であり、端末で人間が読み取れる形では表示されません。`INTO OUTFILE`を使用してORCファイルを出力してください。
:::

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                                                                          | 説明                                                                     | デフォルト |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|-----------|
| [`output_format_arrow_string_as_string`](/operations/settings/settings-formats.md/#output_format_arrow_string_as_string)                                                                                     | 文字列カラムに対してバイナリの代わりにArrow String型を使用します。    | `false`   |
| [`output_format_orc_compression_method`](/operations/settings/settings-formats.md/#output_format_orc_compression_method)                                                                                     | 出力ORC形式で使用される圧縮方法。デフォルト値                        | `none`    |
| [`input_format_arrow_case_insensitive_column_matching`](/operations/settings/settings-formats.md/#input_format_arrow_case_insensitive_column_matching)                                                       | ArrowカラムとClickHouseカラムを照合する際に大文字と小文字を無視します。| `false`   |
| [`input_format_arrow_allow_missing_columns`](/operations/settings/settings-formats.md/#input_format_arrow_allow_missing_columns)                                                                               | Arrowデータを読み取る際に欠落したカラムを許可します。                 | `false`   |
| [`input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference)     | Arrow形式のスキーマ推論においてサポートされていない型のカラムをスキップできます。 | `false`   |

Hadoopとのデータ交換には、[HDFSテーブルエンジン](/engines/table-engines/integrations/hdfs.md)を使用できます。
