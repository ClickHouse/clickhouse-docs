---
alias: []
description: 'CSVフォーマットに関するドキュメント'
input_format: true
keywords: ['CSVWithNames']
output_format: true
slug: /interfaces/formats/CSVWithNames
title: 'CSVWithNames'
---

| 入力  | 出力  | エイリアス |
|-------|-------|------------|
| ✔     | ✔     |            |

## 説明 {#description}

[TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames) に似て、カラム名を含むヘッダー行も印刷します。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
[`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、入力データのカラムはその名前に基づいてテーブルのカラムにマッピングされ、未知の名前のカラムは [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されているときにスキップされます。
そうでない場合、最初の行はスキップされます。
:::
