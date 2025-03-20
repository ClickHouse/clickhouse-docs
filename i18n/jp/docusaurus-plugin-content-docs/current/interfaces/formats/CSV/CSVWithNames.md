---
title: CSVWithNames
slug: /interfaces/formats/CSVWithNames
keywords: [CSVWithNames]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

列名を含むヘッダー行を出力します。これは、[TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)と似ています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
[`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、
入力データのカラムは、その名前に基づいてテーブルのカラムにマッピングされ、名前が不明なカラムは、[input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合にスキップされます。
そうでない場合、最初の行はスキップされます。
:::
