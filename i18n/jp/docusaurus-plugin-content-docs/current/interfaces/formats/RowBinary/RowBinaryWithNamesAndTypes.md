---
alias: []
description: 'RowBinaryWithNamesAndTypesフォーマットのドキュメント'
input_format: true
keywords: ['RowBinaryWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/RowBinaryWithNamesAndTypes
title: 'RowBinaryWithNamesAndTypes'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

[RowBinary](./RowBinary.md)フォーマットに似ていますが、ヘッダーが追加されています：

- [`LEB128`](https://en.wikipedia.org/wiki/LEB128)でエンコードされたカラム数 (N)。
- N個の`String`がカラム名を指定します。
- N個の`String`がカラムタイプを指定します。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings/>

:::note
設定 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) が1に設定されている場合、
入力データのカラムは、その名前によってテーブルのカラムにマッピングされます。名前が不明なカラムは、設定 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) が1に設定されている場合にはスキップされます。
そうでない場合、最初の行はスキップされます。
設定 [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) が`1`に設定されている場合、
入力データのタイプはテーブルの対応するカラムのタイプと比較されます。そうでない場合、2行目はスキップされます。
:::
