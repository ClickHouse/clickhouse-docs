---
'alias': []
'description': 'JSONObjectEachRowフォーマットのドキュメント'
'input_format': true
'keywords':
- 'JSONObjectEachRow'
'output_format': true
'slug': '/interfaces/formats/JSONObjectEachRow'
'title': 'JSONObjectEachRow'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

このフォーマットでは、すべてのデータが単一の JSON オブジェクトとして表現され、各行はこのオブジェクトの別々のフィールドとして表されます。これは、[`JSONEachRow`](./JSONEachRow.md) フォーマットに似ています。

## 使用例 {#example-usage}

### 基本例 {#basic-example}

以下の JSON があるとします：

```json
{
  "row_1": {"num": 42, "str": "hello", "arr":  [0,1]},
  "row_2": {"num": 43, "str": "hello", "arr":  [0,1,2]},
  "row_3": {"num": 44, "str": "hello", "arr":  [0,1,2,3]}
}
```

オブジェクト名をカラム値として使用するには、特別な設定である [`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name) を使用できます。
この設定の値は、結果のオブジェクト内の行に対して JSON キーとして使用されるカラムの名前に設定されます。

#### 出力 {#output}

テーブル `test` が次の二つのカラムを持っているとしましょう：

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

これを `JSONObjectEachRow` フォーマットで出力し、`format_json_object_each_row_column_for_object_name` 設定を使用しましょう：

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

前の例からの出力を `data.json` という名前のファイルに保存したとしましょう：

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

スキーマ推論にも対応しています：

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

ClickHouse では以下が可能です：

- オブジェクト内のキーと値のペアの順序に制限がない。
- 一部の値を省略すること。

ClickHouse は、要素間の空白やオブジェクト後のカンマを無視します。すべてのオブジェクトを1行で渡すことができます。行の改行で区切る必要はありません。

#### 省略値の処理 {#omitted-values-processing}

ClickHouse は省略された値を対応する [データ型](/sql-reference/data-types/index.md) のデフォルト値で置き換えます。

もし `DEFAULT expr` が指定されている場合、ClickHouse は [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 設定に応じて異なる置き換えルールを使用します。

以下のテーブルを考えましょう：

```sql title="Query"
CREATE TABLE IF NOT EXISTS example_table
(
    x UInt32,
    a DEFAULT x * 2
) ENGINE = Memory;
```

- `input_format_defaults_for_omitted_fields = 0` の場合、`x` と `a` のデフォルト値は `0` です（`UInt32` データ型のデフォルト値として）。
- `input_format_defaults_for_omitted_fields = 1` の場合、`x` のデフォルト値は `0` ですが、`a` のデフォルト値は `x * 2` になります。

:::note
`input_format_defaults_for_omitted_fields = 1` の設定でデータを挿入する場合、ClickHouse は `input_format_defaults_for_omitted_fields = 0` の設定での挿入と比べて、より多くの計算リソースを消費します。
:::

### データの選択 {#json-selecting-data}

`UserActivity` テーブルを例にとりましょう：

```response
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

クエリ `SELECT * FROM UserActivity FORMAT JSONEachRow` は以下を返します：

```response
{"UserID":"4324182021466249494","PageViews":5,"Duration":146,"Sign":-1}
{"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

[JSON](/interfaces/formats/JSON) フォーマットとは異なり、無効な UTF-8 シーケンスの置き換えは行われません。値は `JSON` と同様にエスケープされます。

:::info
任意のバイトセットを文字列として出力できます。テーブル内のデータが情報を失うことなく JSON 形式でフォーマットできると確信している場合は、[`JSONEachRow`](./JSONEachRow.md) フォーマットを使用してください。
:::

### 入れ子構造の使用 {#jsoneachrow-nested}

[`Nested`](/sql-reference/data-types/nested-data-structures/index.md) データ型のカラムを持つテーブルがある場合、同じ構造の JSON データを挿入することができます。この機能は、[input_format_import_nested_json](/operations/settings/settings-formats.md/#input_format_import_nested_json) 設定を有効にして使用します。

例えば、以下のテーブルを考えましょう：

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

`Nested` データ型の説明で示されているように、ClickHouse は入れ子構造の各コンポーネントを別々のカラム（私たちのテーブルに対しては `n.s` と `n.i`）として扱います。以下の方法でデータを挿入できます：

```sql
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n.s": ["abc", "def"], "n.i": [1, 23]}
```

階層的な JSON オブジェクトとしてデータを挿入するには、[`input_format_import_nested_json=1`](/operations/settings/settings-formats.md/#input_format_import_nested_json) を設定します。

```json
{
    "n": {
        "s": ["abc", "def"],
        "i": [1, 23]
    }
}
```

この設定がない場合、ClickHouse は例外をスローします。

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

| 設定                                                                                                                                                                            | 説明                                                                                                                                                             | デフォルト | メモ                                                                                                                                                                                         |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                              | 入れ子の JSON データを入れ子のテーブルにマッピングします（JSONEachRow フォーマットで機能します）。                                                                                         | `false`    |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                              | JSON 入力フォーマットでブール値を数値として解析できるようにします。                                                                                                                    | `true`     |                                                                                                                                                                                               |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                              | JSON 入力フォーマットでブール値を文字列として解析できるようにします。                                                                                                                    | `true`     |                                                                                                                                                                                               |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                          | JSON 入力フォーマットで数値を文字列として解析できるようにします。                                                                                                                  | `true`     |                                                                                                                                                                                               |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                            | JSON 入力フォーマットで JSON 配列を文字列として解析できるようにします。                                                                                                                   | `true`     |                                                                                                                                                                                               |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                          | JSON 入力フォーマットで JSON オブジェクトを文字列として解析できるようにします。                                                                                                              | `true`     |                                                                                                                                                                                               |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                          | 名前付きタプルカラムを JSON オブジェクトとして解析します。                                                                                                                           | `true`     |                                                                                                                                                                                               |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                            | スキーマ推論中に文字列フィールドから数値を推測しようとします。                                                                                                          | `false`    |                                                                                                                                                                                               |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)                  | スキーマ推論中に JSON オブジェクトから名前付きタプルを推測しようとします。                                                                                                      | `true`     |                                                                                                                                                                                               |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                      | JSON 入力フォーマットでスキーマ推論中に Nill または空のオブジェクト/配列のみを含むキーに対して型 String を使用します。                                                                      | `true`     |                                                                                                                                                                                               |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | 名前付きタプルを解析中に JSON オブジェクトの欠落している要素にデフォルト値を挿入します。                                                                                              | `true`     |                                                                                                                                                                                               |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                    | 名前付きタプルの JSON オブジェクト内の未知のキーを無視します。                                                                                                                    | `false`    |                                                                                                                                                                                               |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)        | JSONCompact/JSONCompactEachRow フォーマットで変数数のカラムを許可し、追加のカラムを無視し欠落したカラムにデフォルト値を使用します。                                                              | `false`    |                                                                                                                                                                                               |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                                | JSON 文字列に不正なエスケープシーケンスが含まれている場合、例外をスローします。無効にした場合、不正なエスケープシーケンスはデータ内でそのまま残ります。                                       | `true`     |                                                                                                                                                                                               |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                        | JSON 入力の空のフィールドをデフォルト値として扱います。                                                                                                                            | `false`    | 複雑なデフォルト式の場合、[`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) も有効にする必要があります。         |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                              | JSON 出力フォーマットで 64 ビット整数の引用を制御します。                                                                                                              | `true`     |                                                                                                                                                                                               |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                                  | JSON 出力フォーマットで 64 ビット浮動小数点数の引用を制御します。                                                                                                           | `false`    |                                                                                                                                                                                               |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                        | JSON 出力フォーマットで '+nan'、'-nan'、'+inf'、'-inf' の出力を有効にします。                                                                                         | `false`    |                                                                                                                                                                                               |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                          | JSON 出力フォーマットで小数の引用を制御します。                                                                                                                     | `false`    |                                                                                                                                                                                               |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                          | JSON 出力フォーマットで文字列出力のスラッシュをエスケープするかどうかを制御します。                                                                                             | `true`     |                                                                                                                                                                                               |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                        | 名前付きタプルカラムを JSON オブジェクトとしてシリアライズします。                                                                                                             | `true`     |                                                                                                                                                                                               |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                            | JSONEachRow(Compact) フォーマットで全行の JSON 配列を出力します。                                                                                                         | `false`    |                                                                                                                                                                                               |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                            | JSON 出力フォーマットで UTF-8 シーケンスの検証を有効にします（JSON/JSONCompact/JSONColumnsWithMetadata フォーマットには影響しないため、常に utf8 の検証が行われます）。 | `false`    |                                                                                                                                                                                               |
