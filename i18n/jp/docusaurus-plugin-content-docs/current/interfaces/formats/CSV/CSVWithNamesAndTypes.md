---
title: CSVWithNamesAndTypes
slug: /interfaces/formats/CSVWithNamesAndTypes
keywords: [CSVWithNamesAndTypes]
input_format: true
output_format: true
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

また、カラム名とタイプを含む2つのヘッダ行を印刷します。これは[TabSeparatedWithNamesAndTypes](../formats/TabSeparatedWithNamesAndTypes)に類似しています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
設定 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、
入力データのカラムはその名前に基づいてテーブルのカラムにマッピングされ、未知の名前のカラムは設定 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合はスキップされます。
そうでない場合、最初の行はスキップされます。
:::

:::note
設定 [input_format_with_types_use_header](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、
入力データのタイプはテーブルの対応するカラムのタイプと比較されます。そうでない場合、2行目はスキップされます。
:::
