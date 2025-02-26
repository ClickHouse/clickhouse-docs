---
title : CustomSeparatedWithNamesAndTypes
slug: /interfaces/formats/CustomSeparatedWithNamesAndTypes
keywords : [CustomSeparatedWithNamesAndTypes]
input_format: true
output_format: true
alias: []
---

| 入力  | 出力  | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

列名とタイプを含む2つのヘッダー行を出力します。この形式は、[TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md)に似ています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
[`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header)の設定が`1`に設定されている場合、入力データのカラムはテーブルのカラムに名前でマッピングされます。`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields)の設定が`1`に設定されている場合、未知の名前を持つカラムはスキップされます。それ以外の場合、最初の行はスキップされます。
:::

:::note
[`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header)の設定が`1`に設定されている場合、入力データのタイプはテーブルの対応するカラムのタイプと比較されます。それ以外の場合、2行目はスキップされます。
:::
