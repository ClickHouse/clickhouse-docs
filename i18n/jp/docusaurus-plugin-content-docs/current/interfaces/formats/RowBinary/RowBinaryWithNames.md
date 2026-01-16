---
description: 'RowBinaryWithNames 形式のドキュメント'
input_format: true
keywords: ['RowBinaryWithNames']
output_format: true
slug: /interfaces/formats/RowBinaryWithNames
title: 'RowBinaryWithNames'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | 別名 |
| -- | -- | -- |
| ✔  | ✔  |    |


## 説明 \\{#description\\}

[`RowBinary`](./RowBinary.md) フォーマットと類似していますが、ヘッダーが追加されています。

- 列数 (N) を表す [`LEB128`](https://en.wikipedia.org/wiki/LEB128) でエンコードされた数値。
- 列名を指定する N 個の `String`。



## 使用例 \\{#example-usage\\}



## フォーマット設定 \\{#format-settings\\}

<RowBinaryFormatSettings/>

:::note
- 設定 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、
  入力データの列は名前に基づいてテーブルの列にマッピングされます。
- 設定 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合は、不明な名前の列はスキップされます。
  それ以外の場合、最初の行がスキップされます。
:::