---
title: CustomSeparated
slug: /interfaces/formats/CustomSeparated
keywords: [CustomSeparated]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Template](../Template/Template.md) と似ていますが、すべてのカラムの名前とタイプを印刷または読み取り、[format_custom_escaping_rule](../../../operations/settings/settings-formats.md/#format_custom_escaping_rule) 設定のエスケープルールと、以下の設定からの区切り文字を使用します：

- [format_custom_field_delimiter](/operations/settings/settings-formats.md/#format_custom_field_delimiter)
- [format_custom_row_before_delimiter](/operations/settings/settings-formats.md/#format_custom_row_before_delimiter)
- [format_custom_row_after_delimiter](/operations/settings/settings-formats.md/#format_custom_row_after_delimiter)
- [format_custom_row_between_delimiter](/operations/settings/settings-formats.md/#format_custom_row_between_delimiter)
- [format_custom_result_before_delimiter](/operations/settings/settings-formats.md/#format_custom_result_before_delimiter)
- [format_custom_result_after_delimiter](/operations/settings/settings-formats.md/#format_custom_result_after_delimiter)

note:::
フォーマット文字列からのエスケープルール設定と区切り文字は使用しません。
:::

[`CustomSeparatedIgnoreSpaces`](../CustomSeparated/CustomSeparatedIgnoreSpaces.md) フォーマットもあり、これは [TemplateIgnoreSpaces](../Template//TemplateIgnoreSpaces.md) に似ています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

追加設定：

| 設定                                                                                                                                                                        | 説明                                                                                                                     | デフォルト |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|-----------|
| [input_format_custom_detect_header](../../../operations/settings/settings-formats.md/#input_format_custom_detect_header)                                                   | 名前とタイプのヘッダーを自動的に検出を有効にします。                                                                   | `true`    |
| [input_format_custom_skip_trailing_empty_lines](../../../operations/settings/settings-formats.md/#input_format_custom_skip_trailing_empty_lines)                         | ファイルの末尾にある余分な空行をスキップします。                                                                          | `false`   |
| [input_format_custom_allow_variable_number_of_columns](../../../operations/settings/settings-formats.md/#input_format_custom_allow_variable_number_of_columns)           | CustomSeparatedフォーマットで可変数のカラムを許可し、追加のカラムを無視し、欠落しているカラムに対してデフォルト値を使用します。 | `false`   |
