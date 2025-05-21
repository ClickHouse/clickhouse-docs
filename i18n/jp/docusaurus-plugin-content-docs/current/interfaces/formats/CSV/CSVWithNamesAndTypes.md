---
alias: []
description: 'CSVWithNamesAndTypesフォーマットのドキュメント'
input_format: true
keywords: ['CSVWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/CSVWithNamesAndTypes
title: 'CSVWithNamesAndTypes'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

このフォーマットは、[TabSeparatedWithNamesAndTypes](../formats/TabSeparatedWithNamesAndTypes)と似て、カラム名とタイプの2 行のヘッダーを印刷します。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
設定 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、
入力データのカラムはテーブルのカラムに名前でマッピングされ、未知の名前のカラムは設定 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合はスキップされます。
そうでなければ、最初の行はスキップされます。
:::

:::note
設定 [input_format_with_types_use_header](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、
入力データのタイプはテーブルの対応するカラムのタイプと比較されます。そうでなければ、2 行目はスキップされます。
:::
