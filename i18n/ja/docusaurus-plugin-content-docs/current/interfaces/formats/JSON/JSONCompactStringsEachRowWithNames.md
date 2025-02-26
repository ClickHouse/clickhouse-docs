---
title : JSONCompactStringsEachRowWithNames
slug: /interfaces/formats/JSONCompactStringsEachRowWithNames
keywords : [JSONCompactStringsEachRowWithNames]
input_format: true
output_format: true
alias: []
---

| 入力 | 出力 | 別名 |
|------|------|------|
| ✔    | ✔    |      |

## 説明 {#description}

[`JSONCompactEachRow`](./JSONCompactEachRow.md) フォーマットと異なり、列名を含むヘッダー行も出力されるため、[TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md) フォーマットに類似しています。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

:::note
[`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) を `1` に設定する場合、入力データのカラムはテーブルのカラムに名前でマッピングされます。
未知の名前のカラムは、[`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) を `1` に設定している場合にはスキップされます。
そうでない場合、最初の行はスキップされます。
:::
