---
title: TabSeparatedWithNames
slug: /interfaces/formats/TabSeparatedWithNames
keywords: [TabSeparatedWithNames]
input_format: true
output_format: true
alias: ['TSVWithNames']
---

| 入力 | 出力 | エイリアス                    |
|------|------|-----------------------------|
| 	✔   | 	✔   | `TSVWithNames`, `RawWithNames` |

## 説明 {#description}

[`TabSeparated`](./TabSeparated.md) フォーマットと異なり、カラム名が最初の行に書かれています。

解析中は、最初の行にカラム名が含まれていると期待されます。カラム名を使用してその位置を特定し、正しさを確認することができます。

:::note
もし設定 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、入力データのカラムはその名前によってテーブルのカラムにマッピングされ、未知の名前のカラムは設定 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合はスキップされます。
そうでない場合、最初の行はスキップされます。
:::

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}
