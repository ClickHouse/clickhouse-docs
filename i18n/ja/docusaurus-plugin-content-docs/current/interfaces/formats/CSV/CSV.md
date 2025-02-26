---
title : CSV
slug: /interfaces/formats/CSV
keywords : [CSV]
input_format: true
output_format: true
alias: []
---

## 説明 {#description}

カンマ区切り値形式（[RFC](https://tools.ietf.org/html/rfc4180)）。
フォーマット時、行はダブルクォーテーションで囲まれます。文字列内のダブルクォーテーションは、2つのダブルクォーテーションとして出力されます。
他にエスケープキャラクターについてのルールはありません。

- 日付および日時はダブルクォーテーションで囲まれます。
- 数字はクォーテーションなしで出力されます。
- 値はデフォルトで区切り文字 `,` で分けられます。区切り文字は設定 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) で定義されています。
- 行はUnix行フィード（LF）で区切られます。
- 配列は次のようにCSVとしてシリアライズされます：
  - まず、配列はタブ区切り形式のように文字列にシリアライズされます。
  - 結果の文字列はダブルクォーテーションで囲まれてCSVに出力されます。
- CSV形式のタプルは、異なるカラムとしてシリアライズされます（すなわち、タプル内のネストは失われます）。

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
デフォルトでは、区切り文字は `,` です。
詳細については、[format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 設定を参照してください。
:::

解析時、すべての値はクォーテーションありまたはなしで解析できます。ダブルクォーテーションとシングルクォーテーションの両方がサポートされています。

行はクォーテーションなしで配置することも可能です。この場合、区切り文字または行フィード（CRまたはLF）まで解析されます。
しかし、RFCに違反して、クォーテーションなしで行を解析する場合、先頭と末尾の空白およびタブは無視されます。
行フィードは以下をサポートします：Unix（LF）、Windows（CR LF）、およびMac OS Classic（CR LF）タイプ。

`NULL` は設定 [format_csv_null_representation](/operations/settings/settings-formats.md/#format_csv_null_representation) に従ってフォーマットされます（デフォルト値は `\N` です）。

入力データでは、`ENUM` 値は名前またはIDとして表現できます。
まず、入力値をENUM名と照合しようとします。
失敗した場合、入力値が数値であれば、この数値をENUM IDと照合しようとします。
入力データにENUM IDのみが含まれている場合、`ENUM` 解析を最適化するために設定 [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) を有効にすることをお勧めします。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                            | 説明                                                                                                            | デフォルト | 注意事項                                                                                                                                                                                       |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                     | CSVデータにおける区切り文字の設定。                                                                                     | `,`     |                                                                                                                                                                                              |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                 | シングルクォーテーションの文字列を許可します。                                                                                   | `true`  |                                                                                                                                                                                              |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                 | ダブルクォーテーションの文字列を許可します。                                                                                   | `true`  |                                                                                                                                                                                              | 
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                 | CSV形式におけるカスタムNULL表現。                                                                                      | `\N`    |                                                                                                                                                                                              |   
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                           | CSV入力の空のフィールドをデフォルト値として扱う。                                                                                    | `true`  | 複雑なデフォルト式の場合、[input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)も有効にする必要があります。 | 
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                               | CSV形式で挿入されたENUM値をENUMインデックスとして扱う。                                                                                  | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)     | CSV形式でスキーマ推測のためのいくつかの調整とヒューリスティックを使用します。無効にすると、すべてのフィールドが文字列として推測されます。 | `true`  |                                                                                                                                                                                              |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                   | CSVからArrayを読み取るとき、その要素がネストされたCSVでシリアライズされ、文字列に入っていると期待します。                             | `false` |                                                                                                                                                                                              |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                         | trueに設定すると、CSV出力形式の行の終わりは `\r\n` になります。                                                             | `false` |                                                                                                                                                                                              |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                           | データの先頭で指定された行数をスキップします。                                                                                | `0`     |                                                                                                                                                                                              |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                 | CSV形式の名前と型を持つヘッダーを自動的に検出します。                                                                            | `true`  |                                                                                                                                                                                              |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                         | データの最後でトレーリング空行をスキップします。                                                                                       | `false` |                                                                                                                                                                                              |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                           | 非クォーテーションCSV文字列の空白とタブをトリムします。                                                                        | `true`  |                                                                                                                                                                                              |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)   | CSV文字列内で空白またはタブをフィールド区切り文字として使用することを許可します。                                            | `false` |                                                                                                                                                                                              |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)           | CSV形式で可変数のカラムを許可し、余分なカラムを無視して欠落したカラムのデフォルト値を使用します。                    | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                         | CSVフィールドのデシリアライズが不良値で失敗した場合にカラムにデフォルト値を設定できます。                                    | `false` |                                                                                                                                                                                              |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)               | スキーマ推測中に文字列フィールドから数字を推測しようとします。                                                                | `false` |                                                                                                                                                                                              |
