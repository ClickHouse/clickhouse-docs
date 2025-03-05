---
title: JSONCompactEachRowWithNames
slug: /interfaces/formats/JSONCompactEachRowWithNames
keywords: [JSONCompactEachRowWithNames]
input_format: true
output_format: true
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |


## 説明 {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md) フォーマットとは異なり、カラム名のヘッダー行も印刷され、[`TabSeparatedWithNames`](../TabSeparated/TabSeparatedWithNames.md) フォーマットに似ています。


## 例の使い方 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
[`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) を 1 に設定すると、
入力データのカラムは、その名前に基づいてテーブルのカラムにマッピングされ、未知の名前のカラムは、[`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が 1 に設定されている場合はスキップされます。
そうでなければ、最初の行はスキップされます。
:::
