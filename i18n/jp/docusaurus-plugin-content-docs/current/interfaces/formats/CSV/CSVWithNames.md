---
'alias': []
'description': 'CSV フォーマットのドキュメント'
'input_format': true
'keywords':
- 'CSVWithNames'
'output_format': true
'slug': '/interfaces/formats/CSVWithNames'
'title': 'CSVWithNames'
---



| 入力 | 出力 | エイリアス |
|-----|------|---------|
| ✔   | ✔    |         |

## 説明 {#description}

カラム名とともにヘッダー行も印刷され、[TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames) に類似しています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
[`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) の設定が `1` に設定されている場合、入力データのカラムはその名前によってテーブルのカラムにマッピングされ、名前が不明なカラムは[環境設定](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields)で `1` に設定されている場合はスキップされます。
そうでない場合、最初の行はスキップされます。
:::
