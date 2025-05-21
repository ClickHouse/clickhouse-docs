---
alias: []
description: 'カスタム区切り形式に関するドキュメント'
input_format: true
keywords: ['CustomSeparated']
output_format: true
slug: /interfaces/formats/CustomSeparated
title: 'CustomSeparated'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Template](../Template/Template.md) と似ていますが、すべてのカラムの名前とタイプを出力または読み込み、[format_custom_escaping_rule](../../../operations/settings/settings-formats.md/#format_custom_escaping_rule) 設定からエスケープルールを使用し、以下の設定から区切り文字を使用します：

- [format_custom_field_delimiter](/operations/settings/settings-formats.md/#format_custom_field_delimiter)
- [format_custom_row_before_delimiter](/operations/settings/settings-formats.md/#format_custom_row_before_delimiter)
- [format_custom_row_after_delimiter](/operations/settings/settings-formats.md/#format_custom_row_after_delimiter)
- [format_custom_row_between_delimiter](/operations/settings/settings-formats.md/#format_custom_row_between_delimiter)
- [format_custom_result_before_delimiter](/operations/settings/settings-formats.md/#format_custom_result_before_delimiter)
- [format_custom_result_after_delimiter](/operations/settings/settings-formats.md/#format_custom_result_after_delimiter)

note:::
フォーマット文字列からエスケープルール設定および区切り文字は使用しません。
:::

[`CustomSeparatedIgnoreSpaces`](../CustomSeparated/CustomSeparatedIgnoreSpaces.md) フォーマットもあります。これは [TemplateIgnoreSpaces](../Template//TemplateIgnoreSpaces.md) に似ています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

追加の設定：

| 設定                                                                                                                                                        | 説明                                                                                                                 | デフォルト |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|---------|
| [input_format_custom_detect_header](../../../operations/settings/settings-formats.md/#input_format_custom_detect_header)                                       | ヘッダーに名前とタイプがある場合、自動検出を有効にします。                                                          | `true`  |
| [input_format_custom_skip_trailing_empty_lines](../../../operations/settings/settings-formats.md/#input_format_custom_skip_trailing_empty_lines)               | ファイルの最後にあるトレーリング空行をスキップします。                                                              | `false` |
| [input_format_custom_allow_variable_number_of_columns](../../../operations/settings/settings-formats.md/#input_format_custom_allow_variable_number_of_columns) | CustomSeparated 形式で可変数のカラムを許可し、余分なカラムを無視し、欠落しているカラムにはデフォルト値を使用します。 | `false` |
