---
alias: []
description: 'JSONObjectEachRow形式のドキュメント'
input_format: true
keywords: ['JSONObjectEachRow']
output_format: true
slug: /interfaces/formats/JSONObjectEachRow
title: 'JSONObjectEachRow'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

この形式では、すべてのデータが単一のJSONオブジェクトとして表現され、各行がこのオブジェクトの個別のフィールドとして表現されます。これは[`JSONEachRow`](./JSONEachRow.md)形式と似ています。

## 使用例 {#example-usage}

### 基本的な例 {#basic-example}

次のようなJSONがあるとします:

```json
{
  "row_1": {"num": 42, "str": "hello", "arr":  [0,1]},
  "row_2": {"num": 43, "str": "hello", "arr":  [0,1,2]},
  "row_3": {"num": 44, "str": "hello", "arr":  [0,1,2,3]}
}
```

オブジェクト名をカラム値として使用するには、特別な設定[`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)を使用できます。 この設定の値は、結果オブジェクトにおける行のJSONキーとして使用されるカラムの名前に設定されます。

#### 出力 {#output}

例えば、`test`というテーブルがあり、2つのカラムがあるとしましょう:

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

これを`JSONObjectEachRow`形式で出力し、`format_json_object_each_row_column_for_object_name`設定を使用します:

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

前の例の出力を`data.json`という名前のファイルに保存したとします:

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

スキーマ推論にも機能します:

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

ClickHouseは次を許可します:

- オブジェクト内のキーと値のペアの順序は任意。
- 一部の値を省略することが可能。

ClickHouseは要素間のスペースやオブジェクト後のカンマを無視します。すべてのオブジェクトを1行で渡すことができます。改行で分ける必要はありません。

#### 省略された値の処理 {#omitted-values-processing}

ClickHouseは省略された値を対応する[data types](/sql-reference/data-types/index.md)のデフォルト値で置き換えます。

`DEFAULT expr`が指定されている場合、ClickHouseは[input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)設定に応じて異なる置換ルールを使用します。

次のようなテーブルを考えてみます:

```sql title="クエリ"
CREATE TABLE IF NOT EXISTS example_table
(
    x UInt32,
    a DEFAULT x * 2
) ENGINE = Memory;
```

- `input_format_defaults_for_omitted_fields = 0` の場合、`x`と`a`のデフォルト値は`0`になります（`UInt32`データ型のデフォルト値として）。
- `input_format_defaults_for_omitted_fields = 1` の場合、`x`のデフォルト値は`0`になりますが、`a`のデフォルト値は`x * 2`になります。

:::note
`input_format_defaults_for_omitted_fields = 1`でデータを挿入する際、ClickHouseは`input_format_defaults_for_omitted_fields = 0`の場合と比べてより多くの計算リソースを消費します。
:::

### データの選択 {#json-selecting-data}

`UserActivity`テーブルを例に考えます:

```response
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

クエリ`SELECT * FROM UserActivity FORMAT JSONEachRow`は次を返します:

```response
{"UserID":"4324182021466249494","PageViews":5,"Duration":146,"Sign":-1}
{"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

[JSON](/interfaces/formats/JSON)形式とは異なり、不正なUTF-8シーケンスの置換はありません。値は`JSON`と同じ方法でエスケープされます。

:::info
任意のバイトセットを文字列に出力できます。テーブル内のデータがJSONとしてフォーマット可能であり、情報を失うことがないと確信している場合は、[`JSONEachRow`](./JSONEachRow.md)形式を使用してください。
:::

### ネスト構造の使用 {#jsoneachrow-nested}

[`Nested`](/sql-reference/data-types/nested-data-structures/index.md)データ型カラムを持つテーブルがある場合、同じ構造のJSONデータを挿入できます。この機能を[input_format_import_nested_json](/operations/settings/settings-formats.md/#input_format_import_nested_json)設定で有効にします。

次のようなテーブルを考えてみます:

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

`Nested`データ型の説明のように、ClickHouseはネスト構造の各コンポーネントを個別のカラム（当テーブルの場合は`n.s`と`n.i`）として扱います。次のようにデータを挿入できます:

```sql
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n.s": ["abc", "def"], "n.i": [1, 23]}
```

階層JSONオブジェクトとしてデータを挿入するには、[`input_format_import_nested_json=1`](/operations/settings/settings-formats.md/#input_format_import_nested_json)に設定します。

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
Code: 117. DB::Exception: JSONEachRow形式の解析中に見つかった未知のフィールド: n: (行1にて)
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

## 形式設定 {#format-settings}

| 設定                                                                                                                                                                            | 説明                                                                                                                                                             | デフォルト  | ノート                                                                                                                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                              | ネストされたJSONデータをネストされたテーブルにマップします（JSONEachRow形式で動作します）。                                                                                                | `false`  |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                              | JSON入力形式でブールを数値として解析できるようにします。                                                                                                                  | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                              | JSON入力形式でブールを文字列として解析できるようにします。                                                                                                                  | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                          | JSON入力形式で数値を文字列として解析できるようにします。                                                                                                                | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                            | JSON入力形式でJSON配列を文字列として解析できるようにします。                                                                                                            | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                          | JSON入力形式でJSONオブジェクトを文字列として解析できるようにします。                                                                                                           | `true`   |                                                                                                                                                                                               |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                          | 名前付きタプルカラムをJSONオブジェクトとして解析します。                                                                                                                              | `true`   |                                                                                                                                                                                               |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                            | スキーマ推論中に文字列フィールドから数値を推測しようとします。                                                                                                         | `false`  |                                                                                                                                                                                               |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)                  | スキーマ推論中にJSONオブジェクトから名前付きタプルを推測しようとします。                                                                                                     | `true`   |                                                                                                                                                                                               |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                      | JSON入力形式でスキーマ推論中にヌルまたは空のオブジェクト/配列のみを含むキーに対してString型を使用します。                                                | `true`   |                                                                                                                                                                                               |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | 名前付きタプルを解析する際にJSONオブジェクト内の欠損要素にデフォルト値を挿入します。                                                                                   | `true`   |                                                                                                                                                                                               |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                    | 名前付きタプルのJSONオブジェクトで未知のキーを無視します。                                                                                                                    | `false`  |                                                                                                                                                                                               |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)        | JSONCompact/JSONCompactEachRow形式で列の数を可変にし、余分な列を無視し、欠損列にはデフォルト値を使用できるようにします。                              | `false`  |                                                                                                                                                                                               |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                                | JSON文字列に不正なエスケープシーケンスが含まれる場合は例外をスローします。無効にした場合、不正なエスケープシーケンスはデータの中でそのままとなります。                                        | `true`   |                                                                                                                                                                                               |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                       | JSON入力内の空のフィールドをデフォルト値として処理します。                                                                                                                     | `false`. | 複雑なデフォルト式のためには、`[input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)`も有効にする必要があります。 |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                              | JSON出力形式における64ビット整数の引用を制御します。                                                                                                              | `true`   |                                                                                                                                                                                               |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                                  | JSON出力形式における64ビット浮動小数点の引用を制御します。                                                                                                                | `false`  |                                                                                                                                                                                               |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                        | JSON出力形式における'+nan', '-nan', '+inf', '-inf'の出力を有効にします。                                                                                                   | `false`  |                                                                                                                                                                                               |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                          | JSON出力形式における小数の引用を制御します。                                                                                                                     | `false`  |                                                                                                                                                                                               |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                          | JSON出力形式における文字列出力でのスラッシュのエスケープを制御します。                                                                                             | `true`   |                                                                                                                                                                                               |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                        | 名前付きタプルカラムをJSONオブジェクトとしてシリアライズします。                                                                                                                          | `true`   |                                                                                                                                                                                               |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                            | JSONEachRow(Compact)形式でのすべての行のJSON配列を出力します。                                                                                                         | `false`  |                                                                                                                                                                                               |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                            | JSON出力形式におけるUTF-8シーケンスの検証を有効にします（注意：これはJSON/JSONCompact/JSONColumnsWithMetadata形式には影響しません。これらは常にUTF-8を検証します）。 | `false`  |                                                                                                                                                                                               |
