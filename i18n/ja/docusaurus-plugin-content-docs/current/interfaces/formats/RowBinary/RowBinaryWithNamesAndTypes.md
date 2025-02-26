---
title : RowBinaryWithNamesAndTypes
slug: /interfaces/formats/RowBinaryWithNamesAndTypes
keywords : [RowBinaryWithNamesAndTypes]
input_format: true
output_format: true
alias: []
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[RowBinary](./RowBinary.md)フォーマットに似ていますが、追加のヘッダーがあります：

- [`LEB128`](https://en.wikipedia.org/wiki/LEB128)エンコードされたカラム数 (N)。
- N個の`String`がカラム名を指定します。
- N個の`String`がカラムの型を指定します。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings/>

:::note
[`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header)の設定が1に設定されている場合、
入力データのカラムはその名前によってテーブルのカラムにマッピングされ、未知の名前のカラムは設定が1の時にスキップされます。
そうでなければ、最初の行はスキップされます。
[`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header)の設定が`1`に設定されている場合、
入力データの型はテーブルの対応するカラムの型と比較されます。そうでなければ、2行目はスキップされます。
:::
