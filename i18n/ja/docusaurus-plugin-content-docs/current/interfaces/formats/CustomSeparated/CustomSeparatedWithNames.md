---
title : CustomSeparatedWithNames
slug: /interfaces/formats/CustomSeparatedWithNames
keywords : [CustomSeparatedWithNames]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md)と似て、カラム名を含むヘッダ行を出力します。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
[`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) を `1` に設定した場合、 
入力データのカラムはその名前に基づいてテーブルのカラムにマッピングされます。 
未知の名前を持つカラムは、[`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合にスキップされます。 
そうでない場合、最初の行はスキップされます。
:::
