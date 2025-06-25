---
'alias': []
'description': 'CustomSeparated フォーマットのドキュメント'
'input_format': true
'keywords':
- 'CustomSeparated'
'output_format': true
'slug': '/interfaces/formats/CustomSeparated'
'title': 'CustomSeparated'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[Template](../Template/Template.md) と似ていますが、すべてのカラムの名前とタイプを出力または読み込みし、[format_custom_escaping_rule](../../../operations/settings/settings-formats.md/#format_custom_escaping_rule) 設定からエスケープルールを使用し、以下の設定からデリミタを使用します。

- [format_custom_field_delimiter](/operations/settings/settings-formats.md/#format_custom_field_delimiter)
- [format_custom_row_before_delimiter](/operations/settings/settings-formats.md/#format_custom_row_before_delimiter)
- [format_custom_row_after_delimiter](/operations/settings/settings-formats.md/#format_custom_row_after_delimiter)
- [format_custom_row_between_delimiter](/operations/settings/settings-formats.md/#format_custom_row_between_delimiter)
- [format_custom_result_before_delimiter](/operations/settings/settings-formats.md/#format_custom_result_before_delimiter)
- [format_custom_result_after_delimiter](/operations/settings/settings-formats.md/#format_custom_result_after_delimiter)

note:::
エスケープルール設定やフォーマット文字列からのデリミタは使用されません。
:::

[`CustomSeparatedIgnoreSpaces`](../CustomSeparated/CustomSeparatedIgnoreSpaces.md) フォーマットもあり、[TemplateIgnoreSpaces](../Template//TemplateIgnoreSpaces.md) に似ています。

## 例の使用法 {#example-usage}

## フォーマット設定 {#format-settings}

追加設定:

| 設定                                                                                                                                                                | 説明                                                                                                                     | デフォルト |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|-----------|
| [input_format_custom_detect_header](../../../operations/settings/settings-formats.md/#input_format_custom_detect_header)                                           | ある場合は、名前とタイプのヘッダーを自動的に検出するようにします。                                                           | `true`    |
| [input_format_custom_skip_trailing_empty_lines](../../../operations/settings/settings-formats.md/#input_format_custom_skip_trailing_empty_lines)                     | ファイルの終わりにあるトレーリングの空行をスキップします。                                                                        | `false`   |
| [input_format_custom_allow_variable_number_of_columns](../../../operations/settings/settings-formats.md/#input_format_custom_allow_variable_number_of_columns)     | CustomSeparatedフォーマットで可変数のカラムを許可し、余分なカラムを無視し、欠損カラムにはデフォルト値を使用します。                     | `false`   |
