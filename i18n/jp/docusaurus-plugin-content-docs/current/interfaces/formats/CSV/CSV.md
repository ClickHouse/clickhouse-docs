---
'alias': []
'description': 'CSV 形式のドキュメント'
'input_format': true
'keywords':
- 'CSV'
'output_format': true
'slug': '/interfaces/formats/CSV'
'title': 'CSV'
---



## 説明 {#description}

カンマ区切り値形式 ([RFC](https://tools.ietf.org/html/rfc4180))。
フォーマットの際、行はダブルクォートで囲まれます。文字列内のダブルクォートは、2つのダブルクォートとして出力されます。 
他にエスケープ文字のルールはありません。 

- 日付と日付時刻はダブルクォートで囲まれます。 
- 数値はダブルクォートなしで出力されます。
- 値はデリミタ文字によって区切られ、デフォルトでは `,` です。デリミタ文字は設定 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) で定義されています。 
- 行はUnix行フィード (LF) で区切られます。 
- 配列はCSVで以下のようにシリアル化されます: 
  - 最初に、配列はタブ区切り形式で文字列にシリアル化されます
  - 結果の文字列はダブルクォートでCSVに出力されます。
- CSV形式のタプルは、別々のカラムとしてシリアル化されます（つまり、タプル内のネストは失われます）。

```bash
$ clickhouse-client --format_csv_delimiter="|" --query="INSERT INTO test.csv FORMAT CSV" < data.csv
```

:::note
デフォルトでは、デリミタは `,` です。 
詳細は設定 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) を参照してください。
:::

解析する際、すべての値はダブルクォートありまたはなしで解析できます。ダブルクォートとシングルクォートの両方がサポートされています。

行はクォートなしでも配置できます。この場合、デリミタ文字または行フィード (CRまたはLF) まで解析されます。
ただし、RFCに反して、クォートなしで行を解析する場合、先頭と末尾のスペースとタブは無視されます。
行フィードは、Unix (LF)、Windows (CR LF)、Mac OS Classic (CR LF) タイプをサポートします。

`NULL` は設定 [format_csv_null_representation](/operations/settings/settings-formats.md/#format_csv_null_representation) に従ってフォーマットされます（デフォルト値は `\N` です）。

入力データでは、`ENUM` 値は名前またはIDとして表現できます。 
最初に、入力値をENUM名にマッチさせようとします。 
失敗した場合、かつ入力値が数値であれば、この数値をENUM IDにマッチさせようとします。
入力データにENUM IDのみが含まれている場合は、`ENUM` 解析の最適化のために設定 [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number) を有効にすることをお勧めします。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

| 設定                                                                                                                                                             | 説明                                                                                                           | デフォルト | ノート                                                                                                                                                                                         |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter)                                                                      | CSVデータでデリミタと見なされる文字。                                                                         | `,`     |                                                                                                                                                                                              |
| [format_csv_allow_single_quotes](/operations/settings/settings-formats.md/#format_csv_allow_single_quotes)                                                  | シングルクォートで囲まれた文字列を許可します。                                                              | `true`  |                                                                                                                                                                                              |
| [format_csv_allow_double_quotes](/operations/settings/settings-formats.md/#format_csv_allow_double_quotes)                                                  | ダブルクォートで囲まれた文字列を許可します。                                                              | `true`  |                                                                                                                                                                                              |
| [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                                  | CSV形式でのカスタムNULL表現。                                                                                | `\N`    |                                                                                                                                                                                              |   
| [input_format_csv_empty_as_default](/operations/settings/settings-formats.md/#input_format_csv_empty_as_default)                                            | CSV入力の空のフィールドをデフォルト値として扱います。                                                        | `true`  | 複雑なデフォルト式の場合は、 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) も有効にする必要があります。 | 
| [input_format_csv_enum_as_number](/operations/settings/settings-formats.md/#input_format_csv_enum_as_number)                                                | CSV形式の挿入されたENUM値をENUMインデックスとして扱います。                                                | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_best_effort_in_schema_inference](/operations/settings/settings-formats.md/#input_format_csv_use_best_effort_in_schema_inference)      | CSV形式でのスキーマ推論にいくつかの微調整とヒューリスティックを使用します。無効にすると、すべてのフィールドは文字列として推論されます。 | `true`  |                                                                                                                                                                                              |
| [input_format_csv_arrays_as_nested_csv](/operations/settings/settings-formats.md/#input_format_csv_arrays_as_nested_csv)                                    | CSVから配列を読む際、要素がネストされたCSVでシリアル化されて文字列に挿入されることを期待します。        | `false` |                                                                                                                                                                                              |
| [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line)                                          | これがtrueに設定されている場合、CSV出力形式の行の終わりは `\r\n` になります。                             | `false` |                                                                                                                                                                                              |
| [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines)                                           | データの最初の指定行数をスキップします。                                                                     | `0`     |                                                                                                                                                                                              |
| [input_format_csv_detect_header](/operations/settings/settings-formats.md/#input_format_csv_detect_header)                                                  | CSV形式で名前と型を持つヘッダーを自動的に検出します。                                                       | `true`  |                                                                                                                                                                                              |
| [input_format_csv_skip_trailing_empty_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_trailing_empty_lines)                          | データの末尾にあるトレーリング空行をスキップします。                                                       | `false` |                                                                                                                                                                                              |
| [input_format_csv_trim_whitespaces](/operations/settings/settings-formats.md/#input_format_csv_trim_whitespaces)                                            | 非引用のCSV文字列のスペースとタブをトリムします。                                                             | `true`  |                                                                                                                                                                                              |
| [input_format_csv_allow_whitespace_or_tab_as_delimiter](/operations/settings/settings-formats.md/#input_format_csv_allow_whitespace_or_tab_as_delimiter)  | CSV文字列のフィールドデリミタとしてスペースまたはタブの使用を許可します。                                 | `false` |                                                                                                                                                                                              |
| [input_format_csv_allow_variable_number_of_columns](/operations/settings/settings-formats.md/#input_format_csv_allow_variable_number_of_columns)            | CSV形式で列数を可変にし、余分な列を無視し、欠損列にはデフォルト値を使用することを許可します。           | `false` |                                                                                                                                                                                              |
| [input_format_csv_use_default_on_bad_values](/operations/settings/settings-formats.md/#input_format_csv_use_default_on_bad_values)                          | CSVフィールドのデシリアライズが不正な値で失敗した場合に、カラムにデフォルト値を設定することを許可します。  | `false` |                                                                                                                                                                                              |
| [input_format_csv_try_infer_numbers_from_strings](/operations/settings/settings-formats.md/#input_format_csv_try_infer_numbers_from_strings)                | スキーマ推論中に文字列フィールドから数値を推測しようとします。                                             | `false` |                                                                                                                                                                                              |
