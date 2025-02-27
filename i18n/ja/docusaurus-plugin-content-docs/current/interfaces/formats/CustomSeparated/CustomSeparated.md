---
title : CustomSeparated
slug: /interfaces/formats/CustomSeparated
keywords : [CustomSeparated]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Template](../Template/Template.md)に似ていますが、すべてのカラムの名前とタイプを印刷または読み取り、[format_custom_escaping_rule](../../../operations/settings/settings-formats.md/#format_custom_escaping_rule)設定からエスケープルールを使用し、以下の設定から区切り文字を使用します:

- [format_custom_field_delimiter](/operations/settings/settings-formats.md/#format_custom_field_delimiter)
- [format_custom_row_before_delimiter](/operations/settings/settings-formats.md/#format_custom_row_before_delimiter)
- [format_custom_row_after_delimiter](/operations/settings/settings-formats.md/#format_custom_row_after_delimiter)
- [format_custom_row_between_delimiter](/operations/settings/settings-formats.md/#format_custom_row_between_delimiter)
- [format_custom_result_before_delimiter](/operations/settings/settings-formats.md/#format_custom_result_before_delimiter)
- [format_custom_result_after_delimiter](/operations/settings/settings-formats.md/#format_custom_result_after_delimiter) 

note:::
フォーマット文字列からのエスケープルール設定や区切り文字は使用しません。
:::

[`CustomSeparatedIgnoreSpaces`](../CustomSeparated/CustomSeparatedIgnoreSpaces.md)フォーマットもあり、これは[TemplateIgnoreSpaces](../Template//TemplateIgnoreSpaces.md)に似ています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

追加設定:

| 設定                                                                                                                                                        | 説明                                                                                                                 | デフォルト |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|---------|
| [input_format_custom_detect_header](../../../operations/settings/settings-formats.md/#input_format_custom_detect_header)                                       | 名前とタイプを持つヘッダーの自動検出を有効にします。                                                          | `true`  |
| [input_format_custom_skip_trailing_empty_lines](../../../operations/settings/settings-formats.md/#input_format_custom_skip_trailing_empty_lines)               | ファイルの最後にある空の行をスキップします。                                                                              | `false` |
| [input_format_custom_allow_variable_number_of_columns](../../../operations/settings/settings-formats.md/#input_format_custom_allow_variable_number_of_columns) | CustomSeparated形式で可変数のカラムを許可し、余分なカラムを無視し、不足しているカラムにデフォルト値を使用します。 | `false` |
