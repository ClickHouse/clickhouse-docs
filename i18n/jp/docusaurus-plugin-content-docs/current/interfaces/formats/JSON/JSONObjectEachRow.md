---
'alias': []
'description': 'JSONObjectEachRow形式のドキュメント'
'input_format': true
'keywords':
- 'JSONObjectEachRow'
'output_format': true
'slug': '/interfaces/formats/JSONObjectEachRow'
'title': 'JSONObjectEachRow'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

このフォーマットでは、すべてのデータが単一のJSONオブジェクトとして表現され、各行がこのオブジェクトの別々のフィールドとして表現されます。これは、[`JSONEachRow`](./JSONEachRow.md)フォーマットに似ています。

## 使用例 {#example-usage}

### 基本的な例 {#basic-example}

いくつかのJSONが与えられたとします:

```json
{
  "row_1": {"num": 42, "str": "hello", "arr":  [0,1]},
  "row_2": {"num": 43, "str": "hello", "arr":  [0,1,2]},
  "row_3": {"num": 44, "str": "hello", "arr":  [0,1,2,3]}
}
```

オブジェクト名をカラム値として使用するには、特別な設定[`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)を使用します。
この設定の値は、結果のオブジェクト内の行のJSONキーとして使用されるカラムの名前に設定されます。

#### 出力 {#output}

`test`というテーブルが2つのカラムを持っているとしましょう:

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

`JSONObjectEachRow`フォーマットで出力し、`format_json_object_each_row_column_for_object_name`設定を使用します:

```sql title="Query"
SELECT * FROM test SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```json title="Response"
{
    "first_obj": {"number": 1},
    "second_obj": {"number": 2},
    "third_obj": {"number": 3}
}
```

#### 入力 {#input}

前の例の出力を`data.json`というファイルに保存したとしましょう:

```sql title="Query"
SELECT * FROM file('data.json', JSONObjectEachRow, 'object_name String, number UInt64') SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```response title="Response"
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

スキーマ推論にも対応しています:

```sql title="Query"
DESCRIBE file('data.json', JSONObjectEachRow) SETTING format_json_object_each_row_column_for_object_name='object_name'
```

```response title="Response"
┌─name────────┬─type────────────┐
│ object_name │ String          │
│ number      │ Nullable(Int64) │
└─────────────┴─────────────────┘
```

### データの挿入 {#json-inserting-data}

```sql title="Query"
INSERT INTO UserActivity FORMAT JSONEachRow {"PageViews":5, "UserID":"4324182021466249494", "Duration":146,"Sign":-1} {"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

ClickHouseでは次のことが可能です:

- オブジェクト内のキーと値のペアの順序は任意です。
- 値の一部を省略することができます。

ClickHouseは、要素間のスペースとオブジェクトの後のカンマを無視します。すべてのオブジェクトを1行として渡すことができます。改行で区切る必要はありません。

#### 省略された値の処理 {#omitted-values-processing}

ClickHouseは、省略された値を対応する[データ型](/sql-reference/data-types/index.md)のデフォルト値に置き換えます。

`DEFAULT expr`が指定されると、ClickHouseは[input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)設定に応じて異なる置き換えルールを使用します。

次のテーブルを考えてみましょう:

```sql title="Query"
CREATE TABLE IF NOT EXISTS example_table
(
    x UInt32,
    a DEFAULT x * 2
) ENGINE = Memory;
```

- `input_format_defaults_for_omitted_fields = 0`の場合、`x`と`a`のデフォルト値は`0`（`UInt32`データ型のデフォルト値）に等しくなります。
- `input_format_defaults_for_omitted_fields = 1`の場合、`x`のデフォルト値は`0`に等しいですが、`a`のデフォルト値は`x * 2`に等しくなります。

:::note
`input_format_defaults_for_omitted_fields = 1`を使用してデータを挿入する際、ClickHouseは`input_format_defaults_for_omitted_fields = 0`での挿入に比べてより多くの計算リソースを消費します。
:::

### データの選択 {#json-selecting-data}

`UserActivity`テーブルを例に考えてみましょう:

```response
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

クエリ`SELECT * FROM UserActivity FORMAT JSONEachRow`は次のように返します:

```response
{"UserID":"4324182021466249494","PageViews":5,"Duration":146,"Sign":-1}
{"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

[JSON](/interfaces/formats/JSON)フォーマットとは異なり、無効なUTF-8シーケンスの置き換えは行われません。値は`JSON`の場合と同様にエスケープされます。

:::info
任意のバイトセットを文字列として出力できます。テーブル内のデータが情報を失うことなくJSONとしてフォーマットできると確信している場合は、[`JSONEachRow`](./JSONEachRow.md)フォーマットを使用してください。
:::

### ネストされた構造の使用 {#jsoneachrow-nested}

[`Nested`](/sql-reference/data-types/nested-data-structures/index.md)データ型カラムを持つテーブルがある場合、同じ構造のJSONデータを挿入できます。この機能は[input_format_import_nested_json](/operations/settings/settings-formats.md/#input_format_import_nested_json)設定を有効にすることで使用できます。

例えば、次のテーブルを考えてみましょう:

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

`Nested`データ型の説明に見られるように、ClickHouseはネストされた構造の各コンポーネントを別々のカラム（当テーブルでは`n.s`と`n.i`）として扱います。データは次のように挿入できます:

```sql
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n.s": ["abc", "def"], "n.i": [1, 23]}
```

階層JSONオブジェクトとしてデータを挿入するには、[`input_format_import_nested_json=1`](/operations/settings/settings-formats.md/#input_format_import_nested_json)を設定します。

```json
{
    "n": {
        "s": ["abc", "def"],
        "i": [1, 23]
    }
}
```

この設定がない場合、ClickHouseは例外をスローします。

```sql title="Query"
SELECT name, value FROM system.settings WHERE name = 'input_format_import_nested_json'
```

```response title="Response"
┌─name────────────────────────────┬─value─┐
│ input_format_import_nested_json │ 0     │
└─────────────────────────────────┴───────┘
```

```sql title="Query"
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n": {"s": ["abc", "def"], "i": [1, 23]}}
```

```response title="Response"
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: n: (at row 1)
```

```sql title="Query"
SET input_format_import_nested_json=1
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n": {"s": ["abc", "def"], "i": [1, 23]}}
SELECT * FROM json_each_row_nested
```

```response title="Response"
┌─n.s───────────┬─n.i────┐
│ ['abc','def'] │ [1,23] │
└───────────────┴────────┘
```

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                                            | 説明                                                                                                                                                             | デフォルト  | メモ                                                                                                                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                              | ネストされたJSONデータをネストされたテーブルにマップします（JSONEachRowフォーマットで動作します）。                                                                                                | `false`  |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                              | JSON入力フォーマットでブール値を数値として解析できるようにします。                                                                                                                  | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                              | JSON入力フォーマットでブール値を文字列として解析できるようにします。                                                                                                                  | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                          | JSON入力フォーマットで数値を文字列として解析できるようにします。                                                                                                                | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                            | JSON入力フォーマットでJSON配列を文字列として解析できるようにします。                                                                                                            | `true`   |                                                                                                                                                                                               |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                          | JSON入力フォーマットでJSONオブジェクトを文字列として解析できるようにします。                                                                                                           | `true`   |                                                                                                                                                                                               |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                          | 名前付きタプルカラムをJSONオブジェクトとして解析します。                                                                                                                              | `true`   |                                                                                                                                                                                               |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                            | スキーマ推論中に文字列フィールドから数値を推測しようとします。                                                                                                         | `false`  |                                                                                                                                                                                               |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)                  | スキーマ推論中にJSONオブジェクトから名前付きタプルを推測しようとします。                                                                                                     | `true`   |                                                                                                                                                                                               |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                      | JSON入力フォーマットにおいてNullまたは空のオブジェクト/配列のみを含むキーに対して、スキーマ推論中に型Stringを使用します。                                                | `true`   |                                                                                                                                                                                               |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | 名前付きタプルを解析する際にJSONオブジェクト内の欠落要素にデフォルト値を挿入します。                                                                                   | `true`   |                                                                                                                                                                                               |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                    | 名前付きタプルのためにJSONオブジェクト内の未知のキーを無視します。                                                                                                                    | `false`  |                                                                                                                                                                                               |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)        | JSONCompact/JSONCompactEachRowフォーマットにおいて可変数のカラムを許可し、追加のカラムを無視し、欠落したカラムにはデフォルト値を使用します。                              | `false`  |                                                                                                                                                                                               |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                                | JSON文字列に不正なエスケープシーケンスが含まれている場合、例外をスローします。無効化すると、不正なエスケープシーケンスはデータ内にそのまま残ります。                                        | `true`   |                                                                                                                                                                                               |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                        | JSON入力内の空のフィールドをデフォルト値として扱います。                                                                                                                     | `false`  | 複雑なデフォルト式のためには[`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)も有効にする必要があります。 |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                              | JSON出力フォーマットにおける64ビット整数の引用を制御します。                                                                                                              | `true`   |                                                                                                                                                                                               |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                                  | JSON出力フォーマットにおける64ビット浮動小数点数の引用を制御します。                                                                                                                | `false`  |                                                                                                                                                                                               |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                        | JSON出力フォーマットにおいて「+nan」、「-nan」、「+inf」、「-inf」といった出力を有効にします。                                                                                                   | `false`  |                                                                                                                                                                                               |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                          | JSON出力フォーマットにおける小数の引用を制御します。                                                                                                                     | `false`  |                                                                                                                                                                                               |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                          | JSON出力フォーマットにおける文字列出力のためのスラッシュのエスケープを制御します。                                                                                             | `true`   |                                                                                                                                                                                               |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                        | 名前付きタプルカラムをJSONオブジェクトとしてシリアライズします。                                                                                                                          | `true`   |                                                                                                                                                                                               |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                            | JSONEachRow(Compact)フォーマットで全行のJSON配列を出力します。                                                                                                         | `false`  |                                                                                                                                                                                               |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                            | JSON出力フォーマットでUTF-8シーケンスのバリデーションを有効にします（JSON/JSONCompact/JSONColumnsWithMetadataフォーマットには影響しないことに注意してください。常にUTF-8がバリデートされます）。 | `false`  |                                                                                                                                                                                               |
