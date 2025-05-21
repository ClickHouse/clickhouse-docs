---
alias: []
description: 'JSONCompactEachRowWithNames形式に関するドキュメント'
input_format: true
keywords: ['JSONCompactEachRowWithNames']
output_format: true
slug: /interfaces/formats/JSONCompactEachRowWithNames
title: 'JSONCompactEachRowWithNames'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |


## 説明 {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md) 形式とは異なり、[`TabSeparatedWithNames`](../TabSeparated/TabSeparatedWithNames.md) 形式に似て、カラム名を持つヘッダ行も出力します。


## 使用例 {#example-usage}

## 形式設定 {#format-settings}

:::note
[`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が 1 に設定されている場合、
入力データのカラムは、その名前に基づいてテーブルのカラムにマッピングされます。未知らの名前を持つカラムは、[`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が 1 に設定されている場合はスキップされます。
そうでない場合は、最初の行がスキップされます。
:::
