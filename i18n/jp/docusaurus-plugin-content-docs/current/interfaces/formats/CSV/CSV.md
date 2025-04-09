---
title: CSV
slug: /interfaces/formats/CSV
keywords: [CSV]
input_format: true
output_format: true
alias: []
---

## 説明 {#description}

カンマ区切り値形式 ([RFC](https://tools.ietf.org/html/rfc4180))。
フォーマットする際、行はダブルクォートで囲まれます。文字列内のダブルクォートは、連続した二つのダブルクォートとして出力されます。
文字のエスケープに関する他のルールはありません。

- 日付および日時はダブルクォートで囲まれます。
- 数字はクォートなしで出力されます。
- 値はデリミタキャラクタで区切られます。デフォルトでは `,` です。デリミタキャラクタは設定 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) で定義されています。
- 行は Unix ラインフィード (LF) を使って区切られます。
- 配列は CSV で以下のようにシリアライズされます：
  - 最初に、配列は TabSeparated 形式の文字列にシリアライズされます
  - 結果の文字列はダブルクォートで囲まれて CSV に出力されます。
- CSV 形式のタプルは、別々のカラムとしてシリアライズされます（つまり、タプル内のネストは失われます）。

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
デフォルトでは、デリミタは `,` です。
詳細は設定 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) を参照してください。
:::

パースする際、すべての値はクォートありでもなしでもパースできます。ダブルクォートとシングルクォートの両方がサポートされています。

行はクォートなしでも配置できます。この場合、デリミタキャラクタまたはラインフィード (CR または LF) に到達するまでパースされます。
ただし、RFC に反して、クォートなしで行をパースする際には、先頭と末尾の空白およびタブは無視されます。
ラインフィードには、Unix (LF)、Windows (CR LF)、および Mac OS Classic (CR) のタイプがサポートされています。

`NULL` は設定 [format_csv_null_representation](/operations/settings/settings-formats.md/#format_csv_null_representation) に従ってフォーマットされます（デフォルト値は `\N` です）。

入力データ中の `ENUM` 値は名前またはIDとして表現できます。
まず、入力値を `ENUM` 名に一致させようとします。
失敗した場合、入力値が数値であれば、この数値を `ENUM` ID に一致させようとします。
入力データが `ENUM` ID のみを含む場合、`ENUM` のパースを最適化するために設定 [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) を有効にすることを推奨します。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                            | 説明                                                                                                        | デフォルト | 注釈                                                                                                                                                                                        |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                     | CSV データにおいてデリミタとして考慮されるキャラクタ。                                                         | `,`     |                                                                                                                                                                                             |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                 | シングルクォートで囲まれた文字列を許可します。                                                                 | `true`  |                                                                                                                                                                                             |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                 | ダブルクォートで囲まれた文字列を許可します。                                                                 | `true`  |                                                                                                                                                                                             |
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                 | CSV 形式におけるカスタムNULL表現。                                                                            | `\N`    |                                                                                                                                                                                             |
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                           | CSV入力の空のフィールドをデフォルト値として扱います。                                                                  | `true`  | 複雑なデフォルト式の場合、[input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) を有効にする必要があります。 |
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                               | CSV形式で挿入された列挙型の値を列挙型のインデックスとして扱います。                                                | `false` |                                                                                                                                                                                             |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)     | CSV形式でスキーマを推測するためにいくつかの調整やヒューリスティックを使用します。無効にすると、すべてのフィールドが文字列として推測されます。 | `true`  |                                                                                                                                                                                             |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                   | CSVから配列を読み取る際、その要素がネストされたCSV内にシリアライズされ、その後文字列に入れられたと期待します。      | `false` |                                                                                                                                                                                             |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                         | これが true に設定されている場合、CSV出力形式の行末は `\r\n` になります。                                          | `false` |                                                                                                                                                                                             |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                           | データの最初に指定した行数をスキップします。                                                                  | `0`     |                                                                                                                                                                                             |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                 | CSV形式で名前と型を持つヘッダーを自動的に検出します。                                                            | `true`  |                                                                                                                                                                                             |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                         | データの最後にある空の行をスキップします。                                                                      | `false` |                                                                                                                                                                                             |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                           | 非クォートCSV文字列内の空白やタブをトリムします。                                                                | `true`  |                                                                                                                                                                                             |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)   | CSV文字列内でのフィールドデリミタとして空白やタブの使用を許可します。                                          | `false` |                                                                                                                                                                                             |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)           | CSV形式で可変数のカラムを許可し、余分なカラムは無視し、欠落カラムにはデフォルト値を使用します。                    | `false` |                                                                                                                                                                                             |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                         | CSVフィールドのデシリアライズが悪い値で失敗した場合にカラムにデフォルト値を設定することを許可します。               | `false` |                                                                                                                                                                                             |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)               | スキーマ推測時に文字列フィールドから数字を推測しようとします。                                                | `false` |                                                                                                                                                                                             |

