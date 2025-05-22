---
'alias': []
'description': 'JSONCompactEachRowWithNamesAndTypes フォーマットのドキュメント'
'input_format': true
'keywords':
- 'JSONCompactEachRowWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/JSONCompactEachRowWithNamesAndTypes'
'title': 'JSONCompactEachRowWithNamesAndTypes'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md) フォーマットとは異なり、列の名前と型の2つのヘッダ行を出力します。これは、[TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md) フォーマットに似ています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
設定 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、
入力データのカラムは、名前によってテーブルのカラムにマッピングされます。未知の名前のカラムは、設定 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合、スキップされます。
そうでない場合、最初の行はスキップされます。
設定 [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、
入力データの型は、テーブルの対応するカラムの型と比較されます。そうでない場合、2行目はスキップされます。
:::
