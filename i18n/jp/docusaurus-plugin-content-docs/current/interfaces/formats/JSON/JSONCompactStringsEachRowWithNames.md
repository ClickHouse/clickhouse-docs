---
alias: []
description: 'JSONCompactStringsEachRowWithNames形式のドキュメント'
input_format: true
keywords: ['JSONCompactStringsEachRowWithNames']
output_format: true
slug: /interfaces/formats/JSONCompactStringsEachRowWithNames
title: 'JSONCompactStringsEachRowWithNames'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md)形式とは異なり、カラム名を持つヘッダー行も印刷されます。これは、[TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md)形式に似ています。

## 使用例 {#example-usage}

## 形式設定 {#format-settings}

:::note
設定 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、入力データのカラムは、名前によってテーブルのカラムにマッピングされます。名前が不明なカラムは、設定 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合、スキップされます。そうでなければ、最初の行はスキップされます。
:::
