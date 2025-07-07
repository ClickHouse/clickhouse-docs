---
'alias': []
'description': 'JSONCompactEachRowWithNames形式のドキュメント'
'input_format': true
'keywords':
- 'JSONCompactEachRowWithNames'
'output_format': true
'slug': '/interfaces/formats/JSONCompactEachRowWithNames'
'title': 'JSONCompactEachRowWithNames'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |


## 説明 {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md) フォーマットと異なり、カラム名を含むヘッダ行も表示され、[`TabSeparatedWithNames`](../TabSeparated/TabSeparatedWithNames.md) フォーマットに似ています。


## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
設定 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が 1 に設定されている場合、
入力データからのカラムは、その名前によってテーブルのカラムにマッピングされます。未知の名前のカラムは、設定 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が 1 に設定されている場合にスキップされます。
そうでなければ、最初の行はスキップされます。
:::
