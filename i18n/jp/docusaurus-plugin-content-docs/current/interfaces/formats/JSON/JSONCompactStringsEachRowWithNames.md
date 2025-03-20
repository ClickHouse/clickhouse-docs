---
title: JSONCompactStringsEachRowWithNames
slug: /interfaces/formats/JSONCompactStringsEachRowWithNames
keywords: [JSONCompactStringsEachRowWithNames]
input_format: true
output_format: true
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md)フォーマットとは異なり、カラム名を含むヘッダー行も印刷されるため、[TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md)フォーマットに似ています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
設定[`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header)が`1`に設定されている場合、
入力データのカラムはテーブルのカラムにその名前でマッピングされます。未知の名前のカラムは、設定[`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)が`1`に設定されている場合はスキップされます。
そうでない場合、最初の行はスキップされます。
:::
