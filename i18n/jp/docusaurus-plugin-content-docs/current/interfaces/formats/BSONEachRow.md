---
'alias': []
'description': 'BSONEachRow フォーマットに関するドキュメント'
'input_format': true
'keywords':
- 'BSONEachRow'
'output_format': true
'slug': '/interfaces/formats/BSONEachRow'
'title': 'BSONEachRow'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`BSONEachRow` フォーマットは、区切りなしでバイナリ JSON (BSON) ドキュメントのシーケンスとしてデータを解析します。各行は単一のドキュメントとしてフォーマットされ、各カラムはカラム名をキーとした単一の BSON ドキュメントフィールドとしてフォーマットされます。

## データ型の対応 {#data-types-matching}

出力では、ClickHouse タイプと BSON タイプの間に以下の対応を使用します。

| ClickHouse type                                                                                                       | BSON Type                                                                                                     |
|-----------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
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
| [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md) | `\x05` binary, `\x00` binary subtype または \x02 string if setting output_format_bson_string_as_string is enabled |
| [UUID](/sql-reference/data-types/uuid.md)                                                                     | `\x05` binary, `\x04` uuid subtype, size = 16                                                                 |
| [Array](/sql-reference/data-types/array.md)                                                                   | `\x04` array                                                                                                  |
| [Tuple](/sql-reference/data-types/tuple.md)                                                                   | `\x04` array                                                                                                  |
| [Named Tuple](/sql-reference/data-types/tuple.md)                                                             | `\x03` document                                                                                               |
| [Map](/sql-reference/data-types/map.md)                                                                       | `\x03` document                                                                                               |
| [IPv4](/sql-reference/data-types/ipv4.md)                                                                     | `\x10` int32                                                                                                  |
| [IPv6](/sql-reference/data-types/ipv6.md)                                                                     | `\x05` binary, `\x00` binary subtype                                                                          |

入力では、BSON タイプと ClickHouse タイプの間に以下の対応を使用します。

| BSON Type                                | ClickHouse Type                                                                                                                                                                                                                             |
|------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `\x01` double                            | [Float32/Float64](/sql-reference/data-types/float.md)                                                                                                                                                                               |
| `\x02` string                            | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x03` document                          | [Map](/sql-reference/data-types/map.md)/[Named Tuple](/sql-reference/data-types/tuple.md)                                                                                                                                   |
| `\x04` array                             | [Array](/sql-reference/data-types/array.md)/[Tuple](/sql-reference/data-types/tuple.md)                                                                                                                                     |
| `\x05` binary, `\x00` binary subtype     | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)/[IPv6](/sql-reference/data-types/ipv6.md)                                                             |
| `\x05` binary, `\x02` old binary subtype | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x05` binary, `\x03` old uuid subtype   | [UUID](/sql-reference/data-types/uuid.md)                                                                                                                                                                                           |
| `\x05` binary, `\x04` uuid subtype       | [UUID](/sql-reference/data-types/uuid.md)                                                                                                                                                                                           |
| `\x07` ObjectId                          | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x08` boolean                           | [Bool](/sql-reference/data-types/boolean.md)                                                                                                                                                                                        |
| `\x09` datetime                          | [DateTime64](/sql-reference/data-types/datetime64.md)                                                                                                                                                                               |
| `\x0A` null value                        | [NULL](/sql-reference/data-types/nullable.md)                                                                                                                                                                                       |
| `\x0D` JavaScript code                   | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x0E` symbol                            | [String](/sql-reference/data-types/string.md)/[FixedString](/sql-reference/data-types/fixedstring.md)                                                                                                                       |
| `\x10` int32                             | [Int32/UInt32](/sql-reference/data-types/int-uint.md)/[Decimal32](/sql-reference/data-types/decimal.md)/[IPv4](/sql-reference/data-types/ipv4.md)/[Enum8/Enum16](/sql-reference/data-types/enum.md) |
| `\x12` int64                             | [Int64/UInt64](/sql-reference/data-types/int-uint.md)/[Decimal64](/sql-reference/data-types/decimal.md)/[DateTime64](/sql-reference/data-types/datetime64.md)                                                       |

他の BSON タイプはサポートされていません。さらに、異なる整数型間の変換を実施します。例えば、BSON `int32` 値を ClickHouse に [`UInt8`](../../sql-reference/data-types/int-uint.md) として挿入することが可能です。

`Int128`/`UInt128`/`Int256`/`UInt256`/`Decimal128`/`Decimal256` のような大きな整数および十進数は、 `\x00` バイナリサブタイプを持つ BSON バイナリ値から解析できます。この場合、フォーマットはバイナリデータのサイズが期待される値のサイズと等しいことを検証します。

:::note
このフォーマットはビッグエンディアンプラットフォームでは正しく動作しません。
:::

## 使用例 {#example-usage}

### データの挿入 {#inserting-data}

以下のデータを持つ BSON ファイルを使用し、名前を `football.bson` とします。

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

データを挿入します：

```sql
INSERT INTO football FROM INFILE 'football.bson' FORMAT BSONEachRow;
```

### データの読み取り {#reading-data}

`BSONEachRow` フォーマットを使用してデータを読み取ります：

```sql
SELECT *
FROM football INTO OUTFILE 'docs_data/bson/football.bson'
FORMAT BSONEachRow
```

:::tip
BSON は、端末で人間が読み取れる形式で表示されないバイナリフォーマットです。BSON ファイルを出力するには `INTO OUTFILE` を使用してください。
:::

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                                                               | 説明                                                                                       | デフォルト  |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|----------|
| [`output_format_bson_string_as_string`](../../operations/settings/settings-formats.md/#output_format_bson_string_as_string)                                                                           | 文字列カラムのためにバイナリの代わりに BSON 文字列型を使用します。                             | `false`  |
| [`input_format_bson_skip_fields_with_unsupported_types_in_schema_inference`](../../operations/settings/settings-formats.md/#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference) | フォーマット BSONEachRow のスキーマ推論中にサポートされていないタイプのカラムをスキップを許可します。 | `false`  |
