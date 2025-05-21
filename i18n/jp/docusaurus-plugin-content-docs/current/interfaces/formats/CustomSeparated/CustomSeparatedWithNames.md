---
alias: []
description: 'CustomSeparatedWithNamesフォーマットのドキュメント'
input_format: true
keywords: ['CustomSeparatedWithNames']
output_format: true
slug: /interfaces/formats/CustomSeparatedWithNames
title: 'CustomSeparatedWithNames'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

ヘッダー行にカラム名を印刷し、[TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md)に似ています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
[`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header)の設定が`1`に設定されている場合、
入力データのカラムはその名前によってテーブルのカラムにマッピングされます。
未知の名前のカラムは、設定[`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields)が`1`に設定されている場合はスキップされます。
それ以外の場合、最初の行はスキップされます。
:::
