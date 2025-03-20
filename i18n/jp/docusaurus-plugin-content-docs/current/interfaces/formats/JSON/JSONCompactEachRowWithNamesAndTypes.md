---
title: JSONCompactEachRowWithNamesAndTypes
slug: /interfaces/formats/JSONCompactEachRowWithNamesAndTypes
keywords: [JSONCompactEachRowWithNamesAndTypes]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md)形式と異なり、カラム名とタイプを含む2つのヘッダー行を出力する点が特徴で、[TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md)形式に似ています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
設定 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、入力データのカラムはテーブルのカラムにその名前でマッピングされ、未知の名前のカラムは設定 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合にはスキップされます。そうでない場合、最初の行はスキップされます。
設定 [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、入力データのタイプはテーブルの対応するカラムのタイプと比較されます。そうでない場合、2番目の行はスキップされます。
:::
