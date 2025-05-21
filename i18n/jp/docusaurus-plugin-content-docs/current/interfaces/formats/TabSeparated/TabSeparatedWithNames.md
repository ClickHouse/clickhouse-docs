---
alias: ['TSVWithNames']
description: 'TabSeparatedWithNames形式のドキュメント'
input_format: true
keywords: ['TabSeparatedWithNames']
output_format: true
slug: /interfaces/formats/TabSeparatedWithNames
title: 'TabSeparatedWithNames'
---

| 入力 | 出力 | エイリアス                   |
|------|------|-----------------------------|
|    ✔   |    ✔   | `TSVWithNames`, `RawWithNames` |

## 説明 {#description}

[`TabSeparated`](./TabSeparated.md)形式とは異なり、カラム名が最初の行に書かれています。

パース中に、最初の行にはカラム名が含まれていることが期待されます。カラム名を使用して位置を特定し、その正確性をチェックできます。

:::note
設定 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、入力データのカラムはその名前によってテーブルのカラムにマッピングされ、未知の名前のカラムは設定 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合にはスキップされます。
そうでなければ、最初の行はスキップされます。
:::

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}
