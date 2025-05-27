---
'description': 'JSONCompactStringsEachRowWithNamesAndTypes フォーマットのドキュメント'
'keywords':
- 'JSONCompactStringsEachRowWithNamesAndTypes'
'slug': '/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes'
'title': 'JSONCompactStringsEachRowWithNamesAndTypes'
---



## 説明 {#description}

`JSONCompactEachRow` フォーマットとは異なり、カラム名とタイプの2つのヘッダ行を印刷します。これは、[TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedRawWithNamesAndTypes) に似ています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
設定 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が 1 に設定されている場合、入力データのカラムはその名前によってテーブルのカラムにマッピングされます。カラム名が不明なものは、設定 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が 1 に設定されている場合、スキップされます。そうでない場合、最初の行はスキップされます。
:::

:::note
設定 [input_format_with_types_use_header](/operations/settings/settings-formats.md/#input_format_with_types_use_header) が 1 に設定されている場合、入力データのタイプは、テーブルの対応するカラムのタイプと比較されます。そうでない場合、2行目はスキップされます。
:::
