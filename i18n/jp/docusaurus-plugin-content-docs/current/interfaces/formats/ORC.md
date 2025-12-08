---
alias: []
description: 'ORC 形式のドキュメント'
input_format: true
keywords: ['ORC']
output_format: true
slug: /interfaces/formats/ORC
title: 'ORC'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Apache ORC](https://orc.apache.org/) は、[Hadoop](https://hadoop.apache.org/) エコシステムで広く使用されている列指向ストレージ形式です。

## データ型の対応関係 {#data-types-matching-orc}

次の表は、`INSERT` および `SELECT` クエリにおいてサポートされる ORC データ型と、それに対応する ClickHouse の [データ型](/sql-reference/data-types/index.md) を比較したものです。

| ORC data type (`INSERT`)              | ClickHouse data type                                                                                              | ORC data type (`SELECT`) |
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

- 上記以外の型はサポートされていません。
- 配列はネスト可能であり、要素として `Nullable` 型の値を取ることができます。`Tuple` および `Map` 型もネスト可能です。
- ClickHouse テーブルの列のデータ型は、対応する ORC データフィールドと一致している必要はありません。データを挿入する際、ClickHouse は上記の表に従ってデータ型を解釈し、その後 ClickHouse テーブルの列に設定されているデータ型へデータを[キャスト](/sql-reference/functions/type-conversion-functions#cast)します。

## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

次のデータが入った ORC ファイル（名前は `football.orc`）を使用します。

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

### データの読み込み {#reading-data}

`ORC` 形式でデータを読み込みます：

```sql
SELECT *
FROM football
INTO OUTFILE 'football.orc'
FORMAT ORC
```

:::tip
ORC はバイナリ形式のため、ターミナル上で人間が読める形で表示することはできません。`INTO OUTFILE` 句を使用して ORC ファイルとして出力してください。
:::

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                                                                      | 説明                                                                                   | デフォルト |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|------------|
| [`output_format_arrow_string_as_string`](/operations/settings/settings-formats.md/#output_format_arrow_string_as_string)                                                                             | String 列に対して Binary 型ではなく Arrow の String 型を使用します。                 | `false`    |
| [`output_format_orc_compression_method`](/operations/settings/settings-formats.md/#output_format_orc_compression_method)                                                                             | 出力 ORC フォーマットで使用される圧縮方式を指定します。                               | `none`     |
| [`input_format_arrow_case_insensitive_column_matching`](/operations/settings/settings-formats.md/#input_format_arrow_case_insensitive_column_matching)                                               | Arrow の列を ClickHouse の列に対応付ける際に大文字小文字を区別しません。              | `false`    |
| [`input_format_arrow_allow_missing_columns`](/operations/settings/settings-formats.md/#input_format_arrow_allow_missing_columns)                                                                     | Arrow データの読み取り時に、欠落している列を許可します。                              | `false`    |
| [`input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference) | Arrow フォーマットのスキーマ推論時に、未サポート型を持つ列をスキップすることを許可します。 | `false`    |

Hadoop とデータをやり取りするには、[HDFS テーブルエンジン](/engines/table-engines/integrations/hdfs.md) を使用できます。
