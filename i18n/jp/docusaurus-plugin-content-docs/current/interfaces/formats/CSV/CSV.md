---
'alias': []
'description': 'CSVフォーマットに関するDocumentation'
'input_format': true
'keywords':
- 'CSV'
'output_format': true
'slug': '/interfaces/formats/CSV'
'title': 'CSV'
'doc_type': 'reference'
---

## 説明 {#description}

カンマ区切り値形式 ([RFC](https://tools.ietf.org/html/rfc4180))。
フォーマット時、行は二重引用符で囲まれます。文字列内の二重引用符は、二重の二重引用符として出力されます。
文字をエスケープするための他のルールはありません。

- 日付と日時は二重引用符で囲まれます。
- 数値は引用符なしで出力されます。
- 値はデリミタ文字で区切られ、デフォルトでは `,` です。 デリミタ文字は設定 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) で定義されます。
- 行はUnixラインフィード (LF) で区切られます。
- 配列は次のようにCSVでシリアライズされます：
  - まず、配列はタブ区切り形式として文字列にシリアライズされます。
  - 結果の文字列は二重引用符でCSVに出力されます。
- CSV形式のタプルは別々のカラムとしてシリアライズされます（つまり、タプル内のネストは失われます）。

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
デフォルトでは、デリミタは `,` です。
詳細については、[format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 設定を参照してください。
:::

パース時には、すべての値は引用符ありまたは引用符なしのいずれかでパース可能です。両方の二重引用符と単一引用符がサポートされています。

行も引用符なしで配置できます。この場合、デリミタ文字またはラインフィード (CRまたはLF) までパースされます。
ただし、RFCに違反して、引用符なしで行をパースする際、先頭および末尾のスペースとタブは無視されます。
ラインフィードは、Unix (LF)、Windows (CR LF)、および Mac OS Classic (CR LF) タイプをサポートしています。

`NULL` は設定 [format_csv_null_representation](/operations/settings/settings-formats.md/#format_csv_null_representation) に従ってフォーマットされます（デフォルト値は `\N` です）。

入力データでは、`ENUM` 値は名前またはIDで表現できます。
最初に、入力値をENUM名と照合しようとします。
失敗した場合、かつ入力値が数値の場合、その数値をENUM IDと照合しようとします。
入力データにENUM IDのみが含まれている場合は、`ENUM` パースを最適化するために設定 [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) を有効にすることをお勧めします。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                                    | 説明                                                                                                              | デフォルト | メモ                                                                                                                                                                                        |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                             | CSVデータでデリミタと見なす文字。                                                                                     | `,`     |                                                                                                                                                                                              |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                         | 単一引用符で囲まれた文字列を許可します。                                                                                     | `true`  |                                                                                                                                                                                              |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                         | 二重引用符で囲まれた文字列を許可します。                                                                                     | `true`  |                                                                                                                                                                                              |
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                         | CSV形式でのカスタムNULL表現。                                                                                             | `\N`    |                                                                                                                                                                                              |
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                                   | CSV入力の空のフィールドをデフォルト値として扱います。                                                                               | `true`  | 複雑なデフォルト式については、[input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) を有効にする必要があります。 |
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                                       | CSV形式で挿入された ENUM 値を ENUM インデックスとして扱います。                                                                     | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)          | CSV形式でスキーマを推測するためのいくつかの調整やヒューリスティックを使用します。無効にすると、すべてのフィールドが文字列として推測されます。           | `true`  |                                                                                                                                                                                              |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                         | CSVから配列を読み込むとき、その要素がネストされたCSVにシリアライズされ、文字列に挿入されたと仮定します。                                            | `false` |                                                                                                                                                                                              |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                               | trueに設定されている場合、CSV出力形式の行の終わりは `\r\n` になります。                                                       | `false` |                                                                                                                                                                                              |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                                 | データの先頭で指定された数の行をスキップします。                                                                                      | `0`     |                                                                                                                                                                                              |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                         | CSV形式で名前とタイプのヘッダーを自動的に検出します。                                                                        | `true`  |                                                                                                                                                                                              |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                                 | データの最後でトレーリング空行をスキップします。                                                                              | `false` |                                                                                                                                                                                              |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                                 | 非引用付きCSV文字列のスペースとタブをトリムします。                                                                           | `true`  |                                                                                                                                                                                              |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)       | CSV文字列のフィールドデリミタにホワイトスペースまたはタブを使用することを許可します。                                              | `false` |                                                                                                                                                                                              |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)               | CSV形式で列数の変動を許可し、余分な列を無視し、欠落した列にデフォルト値を使用します。                                           | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                               | CSVフィールドのデシリアライズが無効な値で失敗した場合に列にデフォルト値を設定できるようにします。                                     | `false` |                                                                                                                                                                                              |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)                   | スキーマ推測中に文字列フィールドから数値を推測しようとします。                                                            | `false` |                                                                                                                                                                                              |
