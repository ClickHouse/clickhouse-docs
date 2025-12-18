---
alias: []
description: 'RowBinaryWithNamesAndTypes 形式に関するドキュメント'
input_format: true
keywords: ['RowBinaryWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/RowBinaryWithNamesAndTypes
title: 'RowBinaryWithNamesAndTypes'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | 別名 |
| -- | -- | -- |
| ✔  | ✔  |    |


## 説明 {#description}

[RowBinary](./RowBinary.md) 形式と類似していますが、ヘッダーが追加されています。

- 列数 (N) を表す [`LEB128`](https://en.wikipedia.org/wiki/LEB128) でエンコードされた数値。
- 列名を指定する N 個の `String`。
- 列の型を指定する N 個の `String`。



## 使用例 {#example-usage}



## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings/>

:::note
[`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が 1 に設定されている場合、
入力データの列は名前に基づいてテーブルの列に対応付けられ、[`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が 1 に設定されている場合は、名前が不明な列はスキップされます。
それ以外の場合は、最初の行がスキップされます。
[`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、
入力データの型はテーブル内の対応する列の型と比較されます。そうでない場合は、2 行目がスキップされます。
:::