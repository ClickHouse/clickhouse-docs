---
description: '行名付きバイナリ形式のドキュメント'
input_format: true
keywords: ['RowBinaryWithNames']
output_format: true
slug: /interfaces/formats/RowBinaryWithNames
title: '行名付きバイナリ'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[`RowBinary`](./RowBinary.md)形式に似ていますが、ヘッダーが追加されています。

- [`LEB128`](https://en.wikipedia.org/wiki/LEB128)でエンコードされたカラム数 (N)。
- N個の`String`でカラム名を指定します。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings/>

:::note
- 設定 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が `1` に設定されている場合、
入力データのカラムは、その名前によってテーブルのカラムにマッピングされ、未知の名前のカラムはスキップされます。
- 設定 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が `1` に設定されている場合は、最初の行がスキップされます。
:::
