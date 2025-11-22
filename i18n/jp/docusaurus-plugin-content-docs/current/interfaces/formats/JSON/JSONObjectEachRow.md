---
alias: []
description: 'JSONObjectEachRow フォーマットに関するドキュメント'
input_format: true
keywords: ['JSONObjectEachRow']
output_format: true
slug: /interfaces/formats/JSONObjectEachRow
title: 'JSONObjectEachRow'
doc_type: 'reference'
---

| 入力 | 出力 | 別名 |
|-------|--------|-------|
| ✔     | ✔      |       |



## Description {#description}

このフォーマットでは、すべてのデータが単一のJSONオブジェクトとして表現され、各行は[`JSONEachRow`](./JSONEachRow.md)フォーマットと同様に、このオブジェクトの個別のフィールドとして表現されます。


## 使用例 {#example-usage}

### 基本的な例 {#basic-example}

次のようなJSONがあるとします：

```json
{
  "row_1": { "num": 42, "str": "hello", "arr": [0, 1] },
  "row_2": { "num": 43, "str": "hello", "arr": [0, 1, 2] },
  "row_3": { "num": 44, "str": "hello", "arr": [0, 1, 2, 3] }
}
```

オブジェクト名をカラム値として使用するには、特別な設定[`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name)を使用できます。
この設定の値には、結果のオブジェクト内で行のJSONキーとして使用されるカラムの名前を指定します。

#### 出力 {#output}

2つのカラムを持つテーブル`test`があるとします：

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

これを`JSONObjectEachRow`形式で出力し、`format_json_object_each_row_column_for_object_name`設定を使用してみましょう：

```sql title="クエリ"
SELECT * FROM test SETTINGS format_json_object_each_row_column_for_object_name='object_name'
```

```json title="レスポンス"
{
  "first_obj": { "number": 1 },
  "second_obj": { "number": 2 },
  "third_obj": { "number": 3 }
}
```

#### 入力 {#input}

前の例の出力を`data.json`という名前のファイルに保存したとします：

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

スキーマ推論でも機能します：

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

- オブジェクト内のキーと値のペアの任意の順序
- 一部の値の省略

ClickHouseは要素間のスペースとオブジェクト後のカンマを無視します。すべてのオブジェクトを1行で渡すことができます。改行で区切る必要はありません。

#### 省略された値の処理 {#omitted-values-processing}

ClickHouseは省略された値を対応する[データ型](/sql-reference/data-types/index.md)のデフォルト値で置き換えます。

`DEFAULT expr`が指定されている場合、ClickHouseは[input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)設定に応じて異なる置換ルールを使用します。

次のテーブルを考えてみましょう：

```sql title="クエリ"
CREATE TABLE IF NOT EXISTS example_table
(
    x UInt32,
    a DEFAULT x * 2
) ENGINE = Memory;
```

- `input_format_defaults_for_omitted_fields = 0`の場合、`x`と`a`のデフォルト値は`0`になります（`UInt32`データ型のデフォルト値として）。
- `input_format_defaults_for_omitted_fields = 1`の場合、`x`のデフォルト値は`0`ですが、`a`のデフォルト値は`x * 2`になります。

:::note
`input_format_defaults_for_omitted_fields = 1`でデータを挿入する場合、ClickHouseは`input_format_defaults_for_omitted_fields = 0`での挿入と比較して、より多くの計算リソースを消費します。
:::

### データの選択 {#json-selecting-data}

例として`UserActivity`テーブルを考えてみましょう：


```response
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

クエリ `SELECT * FROM UserActivity FORMAT JSONEachRow` は以下を返します:

```response
{"UserID":"4324182021466249494","PageViews":5,"Duration":146,"Sign":-1}
{"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

[JSON](/interfaces/formats/JSON)フォーマットとは異なり、無効なUTF-8シーケンスの置換は行われません。値は`JSON`と同じ方法でエスケープされます。

:::info
文字列には任意のバイト列を出力できます。テーブル内のデータが情報を失うことなくJSONとしてフォーマットできることが確実な場合は、[`JSONEachRow`](./JSONEachRow.md)フォーマットを使用してください。
:::

### ネスト構造の使用 {#jsoneachrow-nested}

[`Nested`](/sql-reference/data-types/nested-data-structures/index.md)データ型のカラムを持つテーブルがある場合、同じ構造のJSONデータを挿入できます。この機能を有効にするには、[input_format_import_nested_json](/operations/settings/settings-formats.md/#input_format_import_nested_json)設定を使用します。

例えば、以下のテーブルを考えてみましょう:

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

`Nested`データ型の説明で確認できるように、ClickHouseはネスト構造の各コンポーネントを個別のカラムとして扱います(このテーブルでは`n.s`と`n.i`)。以下の方法でデータを挿入できます:

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


| 設定                                                                                                                                                                           | 説明                                                                                                                       | デフォルト    | 注記                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                               | ネストされた JSON データをネストされたテーブルにマッピングします（JSONEachRow 形式で動作します）。                                                               | `false`  |                                                                                                                                                                   |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                               | JSON入力フォーマットでブール値を数値として解析できるようにします。                                                                                      | `true`   |                                                                                                                                                                   |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                               | JSON入力フォーマットにおいて、bool値を文字列として解析できるようにします。                                                                                | `true`   |                                                                                                                                                                   |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                           | JSON入力フォーマットで数値を文字列としてパースできるようにします。                                                                                      | `true`   |                                                                                                                                                                   |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                             | JSON入力フォーマットでJSON配列を文字列として解析できるようにします。                                                                                   | `true`   |                                                                                                                                                                   |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                           | JSON入力フォーマットでJSONオブジェクトを文字列として解析できるようにします。                                                                               | `true`   |                                                                                                                                                                   |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                           | 名前付きタプル列を JSON オブジェクトとして解析します。                                                                                           | `true`   |                                                                                                                                                                   |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                             | スキーマ推論時に文字列フィールドから数値型を推定しようとします。                                                                                         | `false`  |                                                                                                                                                                   |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)                   | スキーマ推論時に、JSON オブジェクトから名前付きタプルを推測しようとします。                                                                                 | `true`   |                                                                                                                                                                   |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                       | JSON 入力フォーマットのスキーマ推論時には、NULL または空のオブジェクト／配列のみを含むキーには String 型を使用します。                                                     | `true`   |                                                                                                                                                                   |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | named tuple をパースする際に、JSON オブジェクト内で不足している要素にデフォルト値を補完します。                                                                 | `true`   |                                                                                                                                                                   |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                     | Named Tuple の JSON オブジェクト内にある未知のキーを無視する。                                                                                 | `false`  |                                                                                                                                                                   |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)         | JSONCompact/JSONCompactEachRow 形式で列数の可変を許可し、余分な列は無視し、不足している列にはデフォルト値を使用します。                                              | `false`  |                                                                                                                                                                   |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                                 | JSON 文字列に不正なエスケープシーケンスが含まれている場合に例外をスローします。無効にすると、不正なエスケープシーケンスはデータ内にそのまま残ります。                                            | `true`   |                                                                                                                                                                   |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                         | JSON 入力の空のフィールドをデフォルト値として扱います。                                                                                           | `false`。 | 複雑なデフォルト式を使用する場合は、[`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) も有効にする必要があります。 |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                               | JSON 出力形式における 64 ビット整数のクォート方法を制御します。                                                                                     | `true`   |                                                                                                                                                                   |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                                   | JSON 出力フォーマットで 64 ビット浮動小数点数を文字列としてクオートするかどうかを制御します。                                                                      | `false`  |                                                                                                                                                                   |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                         | JSON 出力フォーマットで &#39;+nan&#39;, &#39;-nan&#39;, &#39;+inf&#39;, &#39;-inf&#39; の出力を有効にします。                                | `false`  |                                                                                                                                                                   |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                           | JSON 出力形式における小数値のクオート方法を制御します。                                                                                           | `false`  |                                                                                                                                                                   |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                           | JSON 出力形式で、文字列出力内のスラッシュ (/) をエスケープするかどうかを制御します。                                                                          | `true`   |                                                                                                                                                                   |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                         | 名前付きタプルのカラムを JSON オブジェクトとしてシリアライズします。                                                                                    | `true`   |                                                                                                                                                                   |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                             | JSONEachRow(Compact) 形式の各行を含む JSON 配列を出力します。                                                                             | `false`  |                                                                                                                                                                   |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                             | JSON 出力フォーマットにおける UTF-8 シーケンスの検証を有効にします（なお、JSON/JSONCompact/JSONColumnsWithMetadata フォーマットには影響しません。これらは常に UTF-8 を検証します）。 | `false`  |                                                                                                                                                                   |