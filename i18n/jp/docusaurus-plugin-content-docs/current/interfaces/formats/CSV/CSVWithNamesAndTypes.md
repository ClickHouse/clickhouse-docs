---
alias: []
description: 'CSVWithNamesAndTypes 形式のドキュメント'
input_format: true
keywords:
- 'CSVWithNamesAndTypes'
output_format: true
slug: '/interfaces/formats/CSVWithNamesAndTypes'
title: 'CSVWithNamesAndTypes'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

これは、[TabSeparatedWithNamesAndTypes](../formats/TabSeparatedWithNamesAndTypes)に似たカラム名とタイプを持つ2つのヘッダーロウを印刷します。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
設定 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、入力データのカラムは、テーブルのカラムに名前でマッピングされます。未知の名前のカラムは、設定 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合、スキップされます。それ以外の場合、最初の行はスキップされます。
:::

:::note
設定 [input_format_with_types_use_header](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、入力データのタイプはテーブルの対応するカラムのタイプと比較されます。それ以外の場合、2行目はスキップされます。
:::
