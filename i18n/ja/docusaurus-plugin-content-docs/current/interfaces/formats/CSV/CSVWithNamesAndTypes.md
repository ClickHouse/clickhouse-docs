---
title : CSVWithNamesAndTypes
slug: /interfaces/formats/CSVWithNamesAndTypes
keywords : [CSVWithNamesAndTypes]
input_format: true
output_format: true
alias: []
---

| 入力  | 出力   | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

このフォーマットは、[TabSeparatedWithNamesAndTypes](../formats/TabSeparatedWithNamesAndTypes)と同様に、カラム名とタイプのヘッダー行を2行印刷します。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
設定 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、
入力データのカラムはその名前によってテーブルのカラムにマッピングされます。未知の名前のカラムは、設定 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合はスキップされます。
そうでない場合は、最初の行がスキップされます。
:::

:::note
設定 [input_format_with_types_use_header](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、
入力データのタイプがテーブルの対応するカラムのタイプと比較されます。そうでない場合は、2行目がスキップされます。
:::
