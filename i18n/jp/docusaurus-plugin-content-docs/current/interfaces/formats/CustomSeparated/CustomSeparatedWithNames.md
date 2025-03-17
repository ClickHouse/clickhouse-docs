---
title: CustomSeparatedWithNames
slug: /interfaces/formats/CustomSeparatedWithNames
keywords: [CustomSeparatedWithNames]
input_format: true
output_format: true
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md)と同様に、カラム名を持つヘッダ行も印刷されます。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
設定 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、入力データのカラムはその名前に基づいてテーブルのカラムにマッピングされます。 
名前が不明なカラムは、設定 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合にはスキップされます。 
そうでなければ、最初の行はスキップされます。
:::
