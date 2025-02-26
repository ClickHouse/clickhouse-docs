---
title : JSONCompactEachRowWithNames
slug: /interfaces/formats/JSONCompactEachRowWithNames
keywords : [JSONCompactEachRowWithNames]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | 別名 |
|-------|--------|-------|
| ✔     | ✔      |       |


## 説明 {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md) フォーマットとは異なり、カラム名を含むヘッダー行も表示され、[`TabSeparatedWithNames`](../TabSeparated/TabSeparatedWithNames.md) フォーマットに似ています。


## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
[`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) を 1 に設定すると、
入力データのカラムがテーブルのカラムに名前でマッピングされ、[`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が 1 に設定されている場合、未知の名前のカラムはスキップされます。
それ以外の場合、最初の行はスキップされます。
:::
