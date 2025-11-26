---
alias: []
description: 'CSV 形式に関するドキュメント'
input_format: true
keywords: ['CSV']
output_format: true
slug: /interfaces/formats/CSV
title: 'CSV'
doc_type: 'reference'
---



## 説明

Comma Separated Values（CSV）形式（[RFC](https://tools.ietf.org/html/rfc4180)）。
この形式では、行は二重引用符で囲まれます。文字列内の二重引用符は、連続する 2 つの二重引用符として出力されます。
文字のエスケープに関するその他の規則はありません。

* `Date` および日付時刻は二重引用符で囲まれます。
* 数値は引用符なしで出力されます。
* 値はデリミタ文字で区切られます。デフォルトでは `,` です。デリミタ文字は設定 [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) で定義されます。
* 行は Unix の改行コード（LF）で区切られます。
* 配列は CSV では次のようにシリアライズされます:
  * まず、配列は TabSeparated 形式と同様に文字列へシリアライズされます。
  * 得られた文字列は、CSV では二重引用符で囲んで出力されます。
* CSV 形式におけるタプルは個別の列としてシリアライズされます（つまり、タプル内でのネスト構造は失われます）。

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
デフォルトでは、区切り文字は `,` です。
詳細は [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 設定を参照してください。
:::

パース時には、すべての値はクォートあり・なしのどちらの形式でも解釈できます。ダブルクォートとシングルクォートの両方がサポートされています。

行はクォートなしで記述することもできます。この場合、区切り文字または改行文字（CR または LF）までがパース対象になります。
ただし、RFC に反して、クォートなしの行をパースする場合は、先頭および末尾のスペースとタブは無視されます。
改行コードとしては、Unix (LF)、Windows (CR LF)、Mac OS Classic (CR LF) がサポートされています。

`NULL` は設定 [format&#95;csv&#95;null&#95;representation](/operations/settings/settings-formats.md/#format_csv_null_representation) に従ってフォーマットされます（デフォルト値は `\N` です）。

入力データ中の `ENUM` 値は、名前または ID として表現できます。
まず、入力値を ENUM 名にマッチさせようとします。
失敗し、かつ入力値が数値であれば、その数値を ENUM ID にマッチさせようとします。
入力データに ENUM ID のみが含まれる場合は、`ENUM` のパースを最適化するために、設定 [input&#95;format&#95;csv&#95;enum&#95;as&#95;number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) を有効にすることを推奨します。


## 使用例 {#example-usage}



## フォーマット設定 {#format-settings}

| Setting                                                                                                                                                            | Description                                                                                                        | Default | Notes                                                                                                                                                                                        |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                     | CSV データで区切り文字として扱う文字。                                                         | `,`     |                                                                                                                                                                                              |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                 | 文字列でシングルクォートを使用することを許可します。                                                                                    | `true`  |                                                                                                                                                                                              |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                 | 文字列でダブルクォートを使用することを許可します。                                                                                    | `true`  |                                                                                                                                                                                              | 
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                 | CSV 形式での NULL のカスタム表現。                                                                          | `\N`    |                                                                                                                                                                                              |   
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                           | CSV 入力で空フィールドをデフォルト値として扱います。                                                                 | `true`  | 複雑なデフォルト式を使用する場合は、[input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) も有効にする必要があります。 | 
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                               | CSV 形式で挿入された enum 値を enum インデックスとして扱います。                                                         | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)     | CSV 形式のスキーマ推論のために、いくつかの調整とヒューリスティクスを使用します。無効な場合、すべてのフィールドは String 型として推論されます。 | `true`  |                                                                                                                                                                                              |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                   | CSV から Array を読み取る際、要素が入れ子の CSV としてシリアライズされ、その後文字列に格納されていることを想定します。      | `false` |                                                                                                                                                                                              |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                         | `true` に設定した場合、CSV 出力形式の行末は `\n` ではなく `\r\n` になります。                             | `false` |                                                                                                                                                                                              |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                           | データの先頭から指定した行数をスキップします。                                                       | `0`     |                                                                                                                                                                                              |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                 | CSV 形式で名前と型を持つヘッダーを自動検出します。                                                    | `true`  |                                                                                                                                                                                              |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                         | データ末尾の空行をスキップします。                                                                      | `false` |                                                                                                                                                                                              |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                           | 引用符で囲まれていない CSV 文字列内のスペースとタブをトリムします。                                                                    | `true`  |                                                                                                                                                                                              |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)   | CSV 文字列でフィールド区切りとして空白またはタブを使用することを許可します。                                                  | `false` |                                                                                                                                                                                              |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)           | CSV 形式で列数の可変を許可し、余分な列は無視し、欠損している列にはデフォルト値を使用します。    | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                         | CSV フィールドのデシリアライズが不正な値で失敗した場合、その列にデフォルト値を設定することを許可します。                           | `false` |                                                                                                                                                                                              |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)               | スキーマ推論時に、文字列フィールドから数値を推論しようと試みます。                                                    | `false` |                                                                                                                                                                                              |