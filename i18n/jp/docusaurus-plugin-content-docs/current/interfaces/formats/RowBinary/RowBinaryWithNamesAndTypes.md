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

| 入力 | 出力 | エイリアス |
| -- | -- | ----- |
| ✔  | ✔  |       |


## Description {#description}

[RowBinary](./RowBinary.md)フォーマットと同様ですが、以下のヘッダーが追加されています:

- [`LEB128`](https://en.wikipedia.org/wiki/LEB128)でエンコードされた列数(N)
- 列名を指定するN個の`String`
- 列の型を指定するN個の`String`


## 使用例 {#example-usage}


## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings />

:::note
設定 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が1に設定されている場合、
入力データの列は名前によってテーブルの列にマッピングされます。設定 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が1に設定されている場合、未知の名前を持つ列はスキップされます。
それ以外の場合は、最初の行がスキップされます。
設定 [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) が `1` に設定されている場合、
入力データの型はテーブルの対応する列の型と比較されます。それ以外の場合は、2行目がスキップされます。
:::
