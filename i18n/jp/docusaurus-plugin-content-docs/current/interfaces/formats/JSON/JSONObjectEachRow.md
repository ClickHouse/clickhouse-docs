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

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |



## 説明 {#description}

この形式では、すべてのデータは 1 つの JSON オブジェクトとして表され、そのオブジェクト内で各行が個別のフィールドとして表現されます。これは [`JSONEachRow`](./JSONEachRow.md) 形式と同様です。



## 使用例 {#example-usage}

### 基本的な例 {#basic-example}

次のような JSON データがあるとします:

```json
{
  "row_1": {"num": 42, "str": "hello", "arr":  [0,1]},
  "row_2": {"num": 43, "str": "hello", "arr":  [0,1,2]},
  "row_3": {"num": 44, "str": "hello", "arr":  [0,1,2,3]}
}
```

オブジェクト名をカラム値として使用するには、専用の設定 [`format_json_object_each_row_column_for_object_name`](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name) を利用できます。
この設定には、結果オブジェクト内の各行に対して JSON のキーとして使用するカラム名を指定します。

#### 出力 {#output}

テーブル `test` に 2 つのカラムがあるとします。

```text
┌─object_name─┬─number─┐
│ first_obj   │      1 │
│ second_obj  │      2 │
│ third_obj   │      3 │
└─────────────┴────────┘
```

`JSONObjectEachRow` 形式で出力し、`format_json_object_each_row_column_for_object_name` 設定を使用します。

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

前の例の出力を `data.json` という名前のファイルに保存してあるとします。

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

これはスキーマ推論にも利用できます:

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

ClickHouse では次のことができます:

* オブジェクト内のキーと値のペアの順序は任意です。
* 一部の値を省略できます。

ClickHouse は要素間の空白や、オブジェクトの後に続くカンマを無視します。すべてのオブジェクトを 1 行で渡すことができます。改行で区切る必要はありません。

#### 省略された値の処理 {#omitted-values-processing}

ClickHouse は、省略された値を対応する[データ型](/sql-reference/data-types/index.md)のデフォルト値で補います。

`DEFAULT expr` が指定されている場合、ClickHouse は [input&#95;format&#95;defaults&#95;for&#95;omitted&#95;fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) 設定に応じて異なる補完ルールを使用します。

次のテーブルを考えてみます:

```sql title="Query"
CREATE TABLE IF NOT EXISTS example_table
(
    x UInt32,
    a DEFAULT x * 2
) ENGINE = Memory;
```

* `input_format_defaults_for_omitted_fields = 0` の場合、`x` と `a` のデフォルト値は `0`（`UInt32` データ型のデフォルト値）になります。
* `input_format_defaults_for_omitted_fields = 1` の場合、`x` のデフォルト値は `0` ですが、`a` のデフォルト値は `x * 2` になります。

:::note
`input_format_defaults_for_omitted_fields = 1` を指定してデータを挿入すると、`input_format_defaults_for_omitted_fields = 0` の場合と比べて、ClickHouse はより多くの計算リソースを消費します。
:::

### データの選択 {#json-selecting-data}

例として、`UserActivity` テーブルを使用します。


```response
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

クエリ `SELECT * FROM UserActivity FORMAT JSONEachRow` は次のような結果を返します：

```response
{"UserID":"4324182021466249494","PageViews":5,"Duration":146,"Sign":-1}
{"UserID":"4324182021466249494","PageViews":6,"Duration":185,"Sign":1}
```

[JSON](/interfaces/formats/JSON) フォーマットとは異なり、不正な UTF-8 シーケンスの置換は行われません。値は `JSON` と同じ方法でエスケープされます。

:::info
任意のバイト列を文字列として出力できます。テーブル内のデータを、情報を失うことなく JSON として整形できると確信できる場合は、[`JSONEachRow`](./JSONEachRow.md) フォーマットを使用してください。
:::

### ネスト構造の使用 {#jsoneachrow-nested}

[`Nested`](/sql-reference/data-types/nested-data-structures/index.md) データ型のカラムを持つテーブルがある場合、同じ構造を持つ JSON データを挿入できます。この機能は、[input&#95;format&#95;import&#95;nested&#95;json](/operations/settings/settings-formats.md/#input_format_import_nested_json) 設定を有効にすることで使用できます。

たとえば、次のテーブルを考えてみます。

```sql
CREATE TABLE json_each_row_nested (n Nested (s String, i Int32) ) ENGINE = Memory
```

`Nested` データ型の説明で確認できるように、ClickHouse はネストされた構造の各コンポーネントを個別のカラム（このテーブルでは `n.s` と `n.i`）として扱います。データは次のように挿入できます:

```sql
INSERT INTO json_each_row_nested FORMAT JSONEachRow {"n.s": ["abc", "def"], "n.i": [1, 23]}
```

データを階層的なJSONオブジェクトとして挿入するには、[`input_format_import_nested_json=1`](/operations/settings/settings-formats.md/#input_format_import_nested_json) を設定します。

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
コード: 117. DB::Exception: JSONEachRow形式の解析中に不明なフィールドが検出されました: n: (1行目)
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



| 設定                                                                                                                                                                           | 概要                                                                                                                     | デフォルト   | 注記                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`input_format_import_nested_json`](/operations/settings/settings-formats.md/#input_format_import_nested_json)                                                               | ネストされた JSON データをネストされたテーブルにマッピングします（JSONEachRow フォーマットで動作します）。                                                         | `false` |                                                                                                                                                                   |
| [`input_format_json_read_bools_as_numbers`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_numbers)                                               | JSON 入力フォーマットでブール値を数値として解釈できるようにします。                                                                                   | `true`  |                                                                                                                                                                   |
| [`input_format_json_read_bools_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_bools_as_strings)                                               | JSON入力フォーマットで、ブール値を文字列として解釈できるようにします。                                                                                  | `true`  |                                                                                                                                                                   |
| [`input_format_json_read_numbers_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_numbers_as_strings)                                           | JSON入力フォーマットで数値を文字列として解析できるようにします。                                                                                     | `true`  |                                                                                                                                                                   |
| [`input_format_json_read_arrays_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_arrays_as_strings)                                             | JSON入力フォーマットでJSON配列を文字列としてパースできるようにします。                                                                                | `true`  |                                                                                                                                                                   |
| [`input_format_json_read_objects_as_strings`](/operations/settings/settings-formats.md/#input_format_json_read_objects_as_strings)                                           | JSON入力フォーマットでJSONオブジェクトを文字列として解析できるようにします。                                                                             | `true`  |                                                                                                                                                                   |
| [`input_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#input_format_json_named_tuples_as_objects)                                           | NamedTuple 型の列を JSON オブジェクトとして解析します。                                                                                   | `true`  |                                                                                                                                                                   |
| [`input_format_json_try_infer_numbers_from_strings`](/operations/settings/settings-formats.md/#input_format_json_try_infer_numbers_from_strings)                             | スキーマ推論時に、文字列フィールドから数値型を推定しようとします。                                                                                      | `false` |                                                                                                                                                                   |
| [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/settings-formats.md/#input_format_json_try_infer_named_tuples_from_objects)                   | スキーマ推論時に JSON オブジェクトから名前付きタプル型を推論しようとします。                                                                              | `true`  |                                                                                                                                                                   |
| [`input_format_json_infer_incomplete_types_as_strings`](/operations/settings/settings-formats.md/#input_format_json_infer_incomplete_types_as_strings)                       | JSON 入力フォーマットのスキーマ推論時には、NULL または空のオブジェクト／配列だけが含まれるキーには型 String を使用します。                                                 | `true`  |                                                                                                                                                                   |
| [`input_format_json_defaults_for_missing_elements_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_defaults_for_missing_elements_in_named_tuple) | named tuple の解析時に、JSON オブジェクト内の不足している要素にデフォルト値を挿入する。                                                                   | `true`  |                                                                                                                                                                   |
| [`input_format_json_ignore_unknown_keys_in_named_tuple`](/operations/settings/settings-formats.md/#input_format_json_ignore_unknown_keys_in_named_tuple)                     | 名前付きタプルの JSON オブジェクト内に存在する未知のキーを無視します。                                                                                 | `false` |                                                                                                                                                                   |
| [`input_format_json_compact_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_json_compact_allow_variable_number_of_columns)         | JSONCompact/JSONCompactEachRow 形式で列数を可変にし、余分な列は無視して、存在しない列にはデフォルト値を使用します。                                              | `false` |                                                                                                                                                                   |
| [`input_format_json_throw_on_bad_escape_sequence`](/operations/settings/settings-formats.md/#input_format_json_throw_on_bad_escape_sequence)                                 | JSON 文字列に不正なエスケープシーケンスが含まれている場合は例外をスローします。無効にすると、不正なエスケープシーケンスはデータ内にそのまま残ります。                                          | `true`  |                                                                                                                                                                   |
| [`input_format_json_empty_as_default`](/operations/settings/settings-formats.md/#input_format_json_empty_as_default)                                                         | JSON 入力で空のフィールドをデフォルト値として扱います。                                                                                         | `false` | 複雑なデフォルト式を使用する場合は、[`input_format_defaults_for_omitted_fields`](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) も有効にする必要があります。 |
| [`output_format_json_quote_64bit_integers`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)                                               | JSON 出力形式で 64 ビット整数をクォート（文字列として出力）するかどうかを制御します。                                                                        | `true`  |                                                                                                                                                                   |
| [`output_format_json_quote_64bit_floats`](/operations/settings/settings-formats.md/#output_format_json_quote_64bit_floats)                                                   | JSON 出力形式における 64 ビット浮動小数点数のクォート方法を制御します。                                                                               | `false` |                                                                                                                                                                   |
| [`output_format_json_quote_denormals`](/operations/settings/settings-formats.md/#output_format_json_quote_denormals)                                                         | JSON 出力形式において &#39;+nan&#39;, &#39;-nan&#39;, &#39;+inf&#39;, &#39;-inf&#39; の出力を有効にします。                               | `false` |                                                                                                                                                                   |
| [`output_format_json_quote_decimals`](/operations/settings/settings-formats.md/#output_format_json_quote_decimals)                                                           | JSON 出力形式での 10 進数のクォート方法を制御します。                                                                                        | `false` |                                                                                                                                                                   |
| [`output_format_json_escape_forward_slashes`](/operations/settings/settings-formats.md/#output_format_json_escape_forward_slashes)                                           | JSON 出力形式で、文字列中のスラッシュ (/) をエスケープするかどうかを制御します。                                                                          | `true`  |                                                                                                                                                                   |
| [`output_format_json_named_tuples_as_objects`](/operations/settings/settings-formats.md/#output_format_json_named_tuples_as_objects)                                         | NamedTuple 型の列を JSON オブジェクトとしてシリアル化します。                                                                                | `true`  |                                                                                                                                                                   |
| [`output_format_json_array_of_rows`](/operations/settings/settings-formats.md/#output_format_json_array_of_rows)                                                             | すべての行を JSONEachRow(Compact) 形式の JSON 配列として出力します。                                                                       | `false` |                                                                                                                                                                   |
| [`output_format_json_validate_utf8`](/operations/settings/settings-formats.md/#output_format_json_validate_utf8)                                                             | JSON 出力フォーマットでの UTF-8 シーケンス検証を有効にします（ただし JSON/JSONCompact/JSONColumnsWithMetadata フォーマットには影響しません。これらは常に UTF-8 を検証します）。 | `false` |                                                                                                                                                                   |