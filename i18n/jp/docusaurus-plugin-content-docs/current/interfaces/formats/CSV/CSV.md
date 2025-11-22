---
alias: []
description: 'CSV 形式のドキュメント'
input_format: true
keywords: ['CSV']
output_format: true
slug: /interfaces/formats/CSV
title: 'CSV'
doc_type: 'reference'
---



## 説明 {#description}

カンマ区切り値形式（[RFC](https://tools.ietf.org/html/rfc4180)）。
フォーマット時、行は二重引用符で囲まれます。文字列内の二重引用符は、連続した2つの二重引用符として出力されます。
文字のエスケープに関する他のルールはありません。

- 日付と日時は二重引用符で囲まれます。
- 数値は引用符なしで出力されます。
- 値は区切り文字で区切られ、デフォルトは `,` です。区切り文字は設定 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) で定義されます。
- 行はUnix改行文字（LF）で区切られます。
- 配列はCSVで次のようにシリアル化されます：
  - まず、配列はTabSeparated形式と同様に文字列にシリアル化されます
  - 結果の文字列は二重引用符で囲まれてCSVに出力されます。
- CSV形式のタプルは個別の列としてシリアル化されます（つまり、タプル内のネスト構造は失われます）。

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
デフォルトでは、区切り文字は `,` です。
詳細については、[format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 設定を参照してください。
:::

解析時、すべての値は引用符の有無にかかわらず解析できます。二重引用符と一重引用符の両方がサポートされています。

行は引用符なしで配置することもできます。この場合、区切り文字または改行文字（CRまたはLF）まで解析されます。
ただし、RFCに違反して、引用符なしで行を解析する場合、先頭と末尾のスペースとタブは無視されます。
改行文字は、Unix（LF）、Windows（CR LF）、Mac OS Classic（CR LF）の各タイプをサポートしています。

`NULL` は設定 [format_csv_null_representation](/operations/settings/settings-formats.md/#format_csv_null_representation) に従ってフォーマットされます（デフォルト値は `\N` です）。

入力データでは、`ENUM` 値は名前またはIDとして表現できます。
まず、入力値をENUM名と照合します。
それが失敗し、入力値が数値である場合、この数値をENUM IDと照合します。
入力データにENUM IDのみが含まれている場合、`ENUM` 解析を最適化するために設定 [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) を有効にすることを推奨します。


## 使用例 {#example-usage}


## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                  | 説明                                                                                                        | デフォルト | 備考                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                   | CSVデータの区切り文字として使用される文字。                                                         | `,`     |                                                                                                                                                                                      |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                               | シングルクォートで囲まれた文字列を許可する。                                                                                    | `true`  |                                                                                                                                                                                      |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                               | ダブルクォートで囲まれた文字列を許可する。                                                                                    | `true`  |                                                                                                                                                                                      |
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                               | CSV形式におけるカスタムNULL表現。                                                                          | `\N`    |                                                                                                                                                                                      |
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                         | CSV入力の空フィールドをデフォルト値として扱う。                                                                 | `true`  | 複雑なデフォルト式の場合、[input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)も有効にする必要があります。 |
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                             | CSV形式で挿入されたenum値をenumインデックスとして扱う。                                                         | `false` |                                                                                                                                                                                      |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)   | CSV形式でスキーマを推論する際に調整とヒューリスティックを使用する。無効にすると、すべてのフィールドがString型として推論されます。 | `true`  |                                                                                                                                                                                      |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                 | CSVからArray型を読み取る際、その要素がネストされたCSVとしてシリアライズされ、文字列に格納されていることを想定する。      | `false` |                                                                                                                                                                                      |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                       | trueに設定すると、CSV出力形式の行末が`\n`の代わりに`\r\n`になります。                             | `false` |                                                                                                                                                                                      |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                         | データの先頭から指定された行数をスキップする。                                                       | `0`     |                                                                                                                                                                                      |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                               | CSV形式で名前と型を含むヘッダーを自動的に検出する。                                                    | `true`  |                                                                                                                                                                                      |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                       | データの末尾にある空行をスキップする。                                                                      | `false` |                                                                                                                                                                                      |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                         | クォートで囲まれていないCSV文字列内のスペースとタブをトリミングする。                                                    | `true`  |                                                                                                                                                                                      |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter) | CSV文字列でフィールド区切り文字として空白またはタブの使用を許可する。                                                  | `false` |                                                                                                                                                                                      |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)         | CSV形式で可変数の列を許可し、余分な列を無視し、欠落している列にはデフォルト値を使用する。    | `false` |                                                                                                                                                                                      |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                       | 不正な値によりCSVフィールドのデシリアライゼーションが失敗した場合に、列にデフォルト値を設定することを許可する。                           | `false` |                                                                                                                                                                                      |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)             | スキーマ推論時に文字列フィールドから数値を推論しようと試みる。                                                    | `false` |                                                                                                                                                                                      |
