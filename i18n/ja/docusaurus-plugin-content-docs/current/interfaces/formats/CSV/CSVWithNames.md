---
title: CSVWithNames
slug: /interfaces/formats/CSVWithNames
keywords: [CSVWithNames]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | 別名 |
|------|------|------|
| ✔    | ✔    |      |

## 説明 {#description}

[TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames) と似て、カラム名付きのヘッダ行を印刷します。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
設定 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、入力データのカラムはテーブルのカラムに名前でマッピングされます。もし設定 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されていると、未知の名前のカラムはスキップされます。それ以外の場合、最初の行はスキップされます。
:::
