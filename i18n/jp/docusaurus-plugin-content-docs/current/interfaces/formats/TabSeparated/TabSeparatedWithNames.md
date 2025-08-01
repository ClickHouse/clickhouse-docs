---
alias:
- 'TSVWithNames'
description: 'TabSeparatedWithNames フォーマットのドキュメント'
input_format: true
keywords:
- 'TabSeparatedWithNames'
output_format: true
slug: '/interfaces/formats/TabSeparatedWithNames'
title: 'TabSeparatedWithNames'
---



| Input | Output | Alias                          |
|-------|--------|--------------------------------|
|     ✔    |     ✔     | `TSVWithNames`, `RawWithNames` |

## 説明 {#description}

[`TabSeparated`](./TabSeparated.md) 形式と異なり、最初の行にカラム名が書かれています。

解析中、最初の行にはカラム名が含まれていることが期待されます。カラム名を使用して、その位置を特定し、正しさを確認できます。

:::note
[`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 設定が `1` に設定されている場合、
入力データのカラムはその名前によってテーブルのカラムにマッピングされます。未知の名前のカラムは、[`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 設定が `1` に設定されている場合はスキップされます。
そうでなければ、最初の行はスキップされます。
:::

## 使用例 {#example-usage}

## 形式設定 {#format-settings}
