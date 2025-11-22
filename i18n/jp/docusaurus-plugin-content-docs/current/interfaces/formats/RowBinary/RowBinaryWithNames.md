---
description: 'RowBinaryWithNames 形式に関するドキュメント'
input_format: true
keywords: ['RowBinaryWithNames']
output_format: true
slug: /interfaces/formats/RowBinaryWithNames
title: 'RowBinaryWithNames'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | エイリアス |
| -- | -- | ----- |
| ✔  | ✔  |       |


## Description {#description}

[`RowBinary`](./RowBinary.md)形式と同様ですが、以下のヘッダーが追加されています:

- [`LEB128`](https://en.wikipedia.org/wiki/LEB128)でエンコードされた列数(N)
- 列名を指定するN個の`String`


## 使用例 {#example-usage}


## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings />

:::note

- [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 設定が `1` に設定されている場合、
  入力データの列は名前によってテーブルの列にマッピングされ、不明な名前の列はスキップされます。
- [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 設定が `1` に設定されている場合。
  それ以外の場合、最初の行がスキップされます。
  :::
