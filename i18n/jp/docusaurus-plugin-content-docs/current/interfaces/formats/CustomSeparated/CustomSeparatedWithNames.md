---
'alias': []
'description': 'CustomSeparatedWithNames formatのドキュメント'
'input_format': true
'keywords':
- 'CustomSeparatedWithNames'
'output_format': true
'slug': '/interfaces/formats/CustomSeparatedWithNames'
'title': 'CustomSeparatedWithNames'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

列名を含むヘッダー行を印刷し、[TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md)に似ています。

## 例の使用法 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
設定 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、
入力データのカラムは、名前によってテーブルのカラムにマッピングされ、
設定 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合、未知の名前のカラムはスキップされます。
そうでなければ、最初の行がスキップされます。
:::
