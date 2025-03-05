---
title: JSONObjectEachRow
slug: /interfaces/formats/JSONObjectEachRow
keywords: [JSONObjectEachRow]
input_format: true
output_format: true
alias: []
---

| 入力  | 出力  | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

このフォーマットでは、すべてのデータが単一のJSONオブジェクトとして表され、各行はこのオブジェクトの別々のフィールドとして表現されます。これは、[`JSONEachRow`](./JSONEachRow.md)フォーマットに似ています。

## 使用例 {#example-usage}

### 基本的な例 {#basic-example}

いくつかのJSONが次のように与えられたとします。

```json
{
  "row_1": {"num": 42, "str": "hello", "arr":  [0,1]},
  "row_2": {"num": 43, "str": "hello", "arr":  [0,1,2]},
  "row_3": {"num": 44, "str": "hello", "arr":  [0,1,2,3]}
}
```

オブジェクト名をカラムの値として使用するには、特別な設定 [`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)を使用できます。 この設定の値は、結果のオブジェクト内の行に対するJSONキーとして使われるカラムの名前に設定されます。

#### 出力 {#output}

テーブル `test` が二つのカラムを持っていると仮定します。

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

`JSONObjectEachRow`フォーマットで出力し、`format_json_object_each_row_column_for_object_name`設定を使用してみましょう。

```sql title="クエリ"
SELECT * FROM test SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```json title="レスポンス"
{
	"first_obj": {"number": 1},
	"second_obj": {"number": 2},
	"third_obj": {"number": 3}
}
```

#### 入力 {#input}

前の例からの出力を `data.json` というファイルに保存したと仮定します。

```sql title="クエリ"
SELECT * FROM file('data.json', JSONObjectEachRow, 'object_name String, number UInt64') SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```response title="レスポンス"
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

スキーマ推論にも機能します。

```sql title="クエリ"
DESCRIBE file('data.json', JSONObjectEachRow) SETTING format_json_object_each_row_column_for_object_name='object_name'
```

```response title="レスポンス"
┌─name────────┬─type────────────┐
│ object_name │ String          │
│ number      │ Nullable(Int64) │
└─────────────┴─────────────────┘
```

### データの挿入 {#json-inserting-data}

```sql title="クエリ"
INSERT INTO UserActivity FORMAT JSONEachRow {"PageViews":5, "UserID":"4324182021466249494", "Duration":146,"Sign":-1} {"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

ClickHouseでは以下が可能です：

- オブジェクト内のキー-バリュー対の順序は任意です。
- 一部の値を省略することができます。

ClickHouseは要素間のスペースとオブジェクト後のカンマを無視します。すべてのオブジェクトを一行で渡すことができます。行の改行で区切る必要はありません。

#### 省略された値の処理 {#omitted-values-processing}

ClickHouseは省略された値を対応する[データ型](/sql-reference/data-types/index.md)のデフォルト値で置き換えます。

`DEFAULT expr` が指定される場合、ClickHouseは設定 [`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)に応じて異なる置換ルールを使用します。

次のテーブルを考えてみてください。

```sql title="クエリ"
CREATE TABLE IF NOT EXISTS example_table
(
    x UInt32,
    a DEFAULT x * 2
) ENGINE = Memory;
```

- `input_format_defaults_for_omitted_fields = 0` の場合、`x` と `a` のデフォルト値は `0` （`UInt32`データ型のデフォルト値）になります。
- `input_format_defaults_for_omitted_fields = 1` の場合、`x` のデフォルト値は `0` ですが、`a` のデフォルト値は `x * 2` になります。

:::note
`input_format_defaults_for_omitted_fields = 1`でデータを挿入すると、ClickHouseは`input_format_defaults_for_omitted_fields = 0`での挿入に比べて、より多くの計算リソースを消費します。
:::

### データの選択 {#json-selecting-data}

`UserActivity`テーブルを例として考えます。

```response
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

クエリ `SELECT * FROM UserActivity FORMAT JSONEachRow` は次のように返します。

```response
{"UserID":"4324182021466249494","PageViews":5,"Duration":146,"Sign":-1}
{"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

[JSON](/interfaces/formats/JSON)フォーマットとは異なり、無効なUTF-8シーケンスの置換は行われません。値は `JSON` と同じ方法でエスケープされます。

:::info
任意のバイトセットを文字列に出力できます。データが情報を失うことなくJSONとしてフォーマットできると確信している場合は、[`JSONEachRow`](./JSONEachRow.md)フォーマットを使用してください。
:::

### ネストされた構造の使用 {#jsoneachrow-nested}

[`Nested`](/sql-reference/data-types/nested-data-structures/index.md)データ型カラムを持つテーブルがある場合、同じ構造を持つJSONデータを挿入できます。この機能は、[input_format_import_nested_json](/operations/settings/settings-formats.md/#input_format_import_nested_json)設定を有効にすることで使用できます。

例えば、次のテーブルを考えてみましょう。

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

`Nested`データ型の説明にあるように、ClickHouseはネストされた構造の各コンポーネントを別々のカラムとして扱います（私たちのテーブルの場合、`n.s` と `n.i`）。データを次のように挿入できます。

```sql
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n.s": ["abc", "def"], "n.i": [1, 23]}
```

階層的なJSONオブジェクトとしてデータを挿入するには、[`input_format_import_nested_json=1`](/operations/settings/settings-formats.md/#input_format_import_nested_json)を設定します。

```json
{
    "n": {
        "s": ["abc", "def"],
        "i": [1, 23]
    }
}
```

この設定がない場合、ClickHouseは例外をスローします。

```sql title="クエリ"
SELECT name, value FROM system.settings WHERE name = 'input_format_import_nested_json'
```

```response title="レスポンス"
┌─name────────────────────────────┬─value─┐
│ input_format_import_nested_json │ 0     │
└─────────────────────────────────┴───────┘
```

```sql title="クエリ"
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n": {"s": ["abc", "def"], "i": [1, 23]}}
```

```response title="レスポンス"
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: n: (at row 1)
```

```sql title="クエリ"
SET input_format_import_nested_json=1
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n": {"s": ["abc", "def"], "i": [1, 23]}}
SELECT * FROM json_each_row_nested
```

```response title="レスポンス"
┌─n.s───────────┬─n.i────┐
│ ['abc','def'] │ [1,23] │
└───────────────┴────────┘
```

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                                            | 説明                                                                                                                                                             | デフォルト  | ノート                                                                                                                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                              | ネストされたJSONデータをネストされたテーブルにマップします（JSONEachRowフォーマットでも機能します）。                                                                                              | `false`  |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                              | JSON入力フォーマットでブール値を数値として解析することを許可します。                                                                                                                  | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                              | JSON入力フォーマットでブール値を文字列として解析することを許可します。                                                                                                                  | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                          | JSON入力フォーマットで数値を文字列として解析することを許可します。                                                                                                                | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                            | JSON入力フォーマットで配列を文字列として解析することを許可します。                                                                                                            | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                          | JSON入力フォーマットでオブジェクトを文字列として解析することを許可します。                                                                                                           | `true`   |                                                                                                                                                                                               |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                          | 名前付きタプルカラムをJSONオブジェクトとして解析します。                                                                                                                              | `true`   |                                                                                                                                                                                               |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                            | スキーマ推論中に文字列フィールドから数値を推測しようとします。                                                                                                         | `false`  |                                                                                                                                                                                               |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)                  | スキーマ推論中にJSONオブジェクトから名前付きタプルを推論しようとします。                                                                                                     | `true`   |                                                                                                                                                                                               |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                      | JSON入力フォーマットのスキーマ推論中に、すべてのNullまたは空のオブジェクト/配列を含むキーに対して、String型を使用します。                                                | `true`   |                                                                                                                                                                                               |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | 名前付きタプルを解析する際にJSONオブジェクト内の欠けている要素のデフォルト値を挿入します。                                                                                   | `true`   |                                                                                                                                                                                               |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                    | 名前付きタプル用のJSONオブジェクト内の未知のキーを無視します。                                                                                                                    | `false`  |                                                                                                                                                                                               |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)        | JSONCompact/JSONCompactEachRowフォーマットにおいて可変数のカラムを許可し、余分なカラムを無視し、欠けているカラムにデフォルト値を使用します。                              | `false`  |                                                                                                                                                                                               |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                                | JSON文字列が不正なエスケープシーケンスを含む場合は例外をスローします。無効にすると、不正なエスケープシーケンスはデータにそのまま残ります。                                        | `true`   |                                                                                                                                                                                               |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                        | JSON入力内の空のフィールドをデフォルト値として扱います。                                                                                                                     | `false`  | 複雑なデフォルト式に対しては、[`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) も有効にする必要があります。 |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                              | JSON出力フォーマットでの64ビット整数の引用を制御します。                                                                                                              | `true`   |                                                                                                                                                                                               |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                                  | JSON出力フォーマットでの64ビット浮動小数点数の引用を制御します。                                                                                                                | `false`  |                                                                                                                                                                                               |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                        | JSON出力フォーマットにおける '+nan', '-nan', '+inf', '-inf' の出力を有効にします。                                                                                                   | `false`  |                                                                                                                                                                                               |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                          | JSON出力フォーマットでの小数の引用を制御します。                                                                                                                     | `false`  |                                                                                                                                                                                               |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                          | JSON出力フォーマットでの文字列出力のスラッシュのエスケープを制御します。                                                                                             | `true`   |                                                                                                                                                                                               |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                        | 名前付きタプルカラムをJSONオブジェクトとしてシリアライズします。                                                                                                                          | `true`   |                                                                                                                                                                                               |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                            | JSONEachRow(Compact)フォーマットで、すべての行のJSON配列を出力します。                                                                                                         | `false`  |                                                                                                                                                                                               |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                            | JSON出力フォーマットにおいてUTF-8シーケンスの検証を有効にします（注：JSON/JSONCompact/JSONColumnsWithMetadataフォーマットには影響しません。これらは常にutf8を検証します）。 | `false`  |                                                                                                                                                                                               |
