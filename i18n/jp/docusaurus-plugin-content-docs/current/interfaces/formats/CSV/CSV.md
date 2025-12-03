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

## 説明 {#description}

コンマ区切り値（Comma Separated Values）形式（[RFC](https://tools.ietf.org/html/rfc4180)）。
フォーマット時、行は二重引用符で囲まれます。文字列中の二重引用符は、連続した 2 つの二重引用符として出力されます。
文字のエスケープに関するその他のルールはありません。

* 日付および日時は二重引用符で囲まれます。
* 数値は引用符なしで出力されます。
* 値は区切り文字で区切られ、デフォルトでは `,` が使用されます。区切り文字は設定 [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) で定義されます。
* 行は Unix の改行文字（LF）で区切られます。
* 配列は CSV では次のようにシリアライズされます:
  * まず、配列を TabSeparated 形式と同様に文字列へシリアライズします。
  * 得られた文字列を CSV では二重引用符で囲んで出力します。
* CSV 形式におけるタプルは、個別のカラムとしてシリアライズされます（つまり、タプル内でのネスト情報は失われます）。

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
デフォルトでは、区切り文字は `,` です。
詳細は、設定 [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) を参照してください。
:::

パース時、すべての値はクォートあり／なしのどちらでも解釈できます。ダブルクォートとシングルクォートの両方がサポートされています。

行はクォートなしで記述することもできます。この場合、区切り文字または改行文字（CR または LF）までを 1 つの値としてパースします。
ただし、RFC に反しますが、クォートなしの行をパースする場合は、先頭および末尾のスペースとタブは無視されます。
改行コードとしては、Unix (LF)、Windows (CR LF)、Mac OS Classic (CR LF) がサポートされています。

`NULL` は設定 [format&#95;csv&#95;null&#95;representation](/operations/settings/settings-formats.md/#format_csv_null_representation) に従ってフォーマットされます（デフォルト値は `\N`）。

入力データ内の `ENUM` 値は、名前または ID として表現できます。
最初に、入力値を ENUM 名と照合しようとします。
照合に失敗し、かつ入力値が数値である場合は、この数値を ENUM ID と照合しようとします。
入力データに ENUM ID のみが含まれている場合は、`ENUM` のパースを最適化するために、設定 [input&#95;format&#95;csv&#95;enum&#95;as&#95;number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) を有効にすることを推奨します。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

| Setting                                                                                                                                                            | 説明                                                                                                              | デフォルト | 備考                                                                                                                                                                                         |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                     | CSV データで区切り文字として扱う文字。                                                                            | `,`       |                                                                                                                                                                                              |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                 | 文字列で単一引用符（シングルクォート）の使用を許可する。                                                          | `true`    |                                                                                                                                                                                              |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                 | 文字列で二重引用符（ダブルクォート）の使用を許可する。                                                            | `true`    |                                                                                                                                                                                              | 
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                 | CSV フォーマットにおける NULL のカスタム表現。                                                                    | `\N`      |                                                                                                                                                                                              |   
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                           | CSV 入力で空フィールドをデフォルト値として扱う。                                                                  | `true`    | 複雑なデフォルト式を使用する場合は、[input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) も有効にする必要がある。 | 
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                               | CSV フォーマットで挿入された Enum 値を Enum のインデックスとして扱う。                                           | `false`   |                                                                                                                                                                                              |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)     | CSV フォーマットでスキーマ推論を行う際に、各種調整とヒューリスティックを用いて推論精度を高める。無効な場合、すべてのフィールドは String として推論される。 | `true`    |                                                                                                                                                                                              |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                   | CSV から Array を読み取る際、その要素がネストされた CSV としてシリアライズされ、その結果が文字列に格納されていることを前提とする。 | `false`   |                                                                                                                                                                                              |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                         | `true` に設定すると、CSV 出力の行末は `\n` ではなく `\r\n` になる。                                               | `false`   |                                                                                                                                                                                              |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                           | データの先頭から指定した行数をスキップする。                                                                      | `0`       |                                                                                                                                                                                              |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                 | CSV フォーマットで、名前および型を含むヘッダー行を自動検出する。                                                  | `true`    |                                                                                                                                                                                              |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                         | データ末尾の空行をスキップする。                                                                                  | `false`   |                                                                                                                                                                                              |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                           | 引用符で囲まれていない CSV 文字列内の空白およびタブをトリムする。                                                  | `true`    |                                                                                                                                                                                              |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)   | CSV 文字列でフィールド区切りとして空白またはタブを使用できるようにする。                                          | `false`   |                                                                                                                                                                                              |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)           | CSV フォーマットで可変数のカラム数を許可し、余分なカラムは無視し、欠損しているカラムにはデフォルト値を使用する。  | `false`   |                                                                                                                                                                                              |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                         | CSV フィールドのデシリアライズが不正な値で失敗した場合に、そのカラムにデフォルト値を設定できるようにする。        | `false`   |                                                                                                                                                                                              |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)               | スキーマ推論時に、文字列フィールドから数値型を推論しようとする。                                                   | `false`   |                                                                                                                                                                                              |