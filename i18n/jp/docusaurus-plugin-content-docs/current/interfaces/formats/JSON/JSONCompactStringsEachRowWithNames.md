---
alias: []
description: 'JSONCompactStringsEachRowWithNames形式のドキュメント'
input_format: true
keywords:
- 'JSONCompactStringsEachRowWithNames'
output_format: true
slug: '/interfaces/formats/JSONCompactStringsEachRowWithNames'
title: 'JSONCompactStringsEachRowWithNames'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md) 形式とは異なり、[TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md) 形式と同様に、カラム名を含むヘッダー行を出力します。

## 使用例 {#example-usage}

## 形式設定 {#format-settings}

:::note
[`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) の設定が `1` に設定されている場合、入力データのカラムは、その名前によってテーブルのカラムにマッピングされ、未知の名前のカラムは [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) の設定が `1` に設定されている場合にはスキップされます。それ以外の場合、最初の行はスキップされます。
:::
