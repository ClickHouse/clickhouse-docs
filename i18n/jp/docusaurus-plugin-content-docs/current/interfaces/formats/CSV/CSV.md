---
alias: []
description: 'CSVフォーマットのドキュメンテーション'
input_format: true
keywords: ['CSV']
output_format: true
slug: /interfaces/formats/CSV
title: 'CSV'
---
```

## 説明 {#description}

カンマ区切り値フォーマット ([RFC](https://tools.ietf.org/html/rfc4180))。
フォーマット時、行は二重引用符で囲まれます。文字列内の二重引用符は、二重の二重引用符として出力されます。
文字のエスケープに関する他のルールはありません。

- 日付および日時は二重引用符で囲まれます。
- 数値は引用符なしで出力されます。
- 値はデフォルトでカンマ `,` という区切り文字によって区切られます。区切り文字は設定 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) で定義されています。
- 行はUnixの改行 (LF) によって区切られます。
- 配列は次のようにCSVにシリアライズされます：
  - まず、配列はタブ区切りフォーマットのように文字列にシリアライズされます。
  - 結果の文字列は二重引用符で囲まれてCSVに出力されます。
- CSVフォーマットのタプルは、別々のカラムとしてシリアライズされます（つまり、タプル内のネストは失われます）。

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
デフォルトでは、区切り文字は `,` です。
詳細については設定 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) を参照してください。
:::

解析時、すべての値は引用符ありまたは引用符なしで解析できます。両方の二重引用符と単一引用符がサポートされています。

行は引用符なしで配置することもできます。この場合、区切り文字または改行（CRまたはLF）まで解析されます。
ただし、RFCに違反して、引用符なしで行を解析する場合、前後のスペースやタブは無視されます。
改行にはUnix (LF)、Windows (CR LF)、およびMac OS Classic (CR LF) タイプがサポートされています。

`NULL` は設定 [format_csv_null_representation](/operations/settings/settings-formats.md/#format_csv_null_representation) に従ってフォーマットされます（デフォルト値は `\N` です）。

入力データでは、`ENUM` 値は名前またはIDとして表すことができます。
最初に、入力値を `ENUM` 名前に一致させようとします。
失敗した場合、入力値が数字であれば、この数字を `ENUM` IDに一致させようとします。
入力データに `ENUM` IDのみが含まれている場合は、`ENUM` 解析を最適化するために設定 [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) を有効にすることをお勧めします。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                            | 説明                                                                                                            | デフォルト | ノート                                                                                                                                                                                          |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                     | CSVデータで区切り文字とみなされるキャラクター。                                                        | `,`     |                                                                                                                                                                                              |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                 | 単一引用符の文字列を許可します。                                                                                  | `true`  |                                                                                                                                                                                              |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                 | 二重引用符の文字列を許可します。                                                                                  | `true`  |                                                                                                                                                                                              |
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                 | CSVフォーマットにおけるカスタムNULL表現。                                                                          | `\N`    |                                                                                                                                                                                              |
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                           | CSV入力の空フィールドをデフォルト値として扱います。                                                              | `true`  | 複雑なデフォルト式の場合、[input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) を有効にする必要があります。    |
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                               | CSVフォーマットで挿入されたENUM値をENUMインデックスとして扱います。                                            | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)     | CSVフォーマットでスキーマを推論するための調整とヒューリスティックスを使用します。無効にすると、すべてのフィールドは文字列として推論されます。 | `true`  |                                                                                                                                                                                              |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                   | CSVから配列を読み取るとき、その要素がネストされたCSVでシリアライズされ、その後文字列に格納されることを期待します。 | `false` |                                                                                                                                                                                              |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                         | trueに設定すると、CSV出力フォーマットの行の終わりは `\r\n` になります。                                      | `false` |                                                                                                                                                                                              |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                           | データの最初に指定された行数をスキップします。                                                                 | `0`     |                                                                                                                                                                                              |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                 | CSVフォーマットで名前とタイプを持つヘッダーを自動的に検出します。                                            | `true`  |                                                                                                                                                                                              |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                         | データの最後の空行をスキップします。                                                                              | `false` |                                                                                                                                                                                              |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                           | 非引用符のCSV文字列内のスペースとタブをトリムします。                                                          | `true`  |                                                                                                                                                                                              |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)   | CSV文字列内でのフィールド区切り文字としてスペースまたはタブを使用することを許可します。                      | `false` |                                                                                                                                                                                              |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)           | CSVフォーマットで可変数のカラムを許可し、余分なカラムを無視し、欠けているカラムにデフォルト値を使用します。    | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                         | CSVフィールドのデシリアライズが不正な値で失敗した場合、カラムにデフォルト値を設定できるようにします。         | `false` |                                                                                                                                                                                              |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)               | スキーマ推論中に文字列フィールドから数字を推論しようとします。                                                  | `false` |                                                                                                                                                                                              |
