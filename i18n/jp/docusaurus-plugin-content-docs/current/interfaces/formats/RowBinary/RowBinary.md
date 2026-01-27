---
alias: []
description: 'RowBinary 形式のドキュメント'
input_format: true
keywords: ['RowBinary']
output_format: true
slug: /interfaces/formats/RowBinary
title: 'RowBinary'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | エイリアス |
| -- | -- | ----- |
| ✔  | ✔  |       |


## 説明 \{#description\}

`RowBinary` フォーマットは、バイナリ形式で行ごとにデータをパースします。
行および値は区切り文字なしで連続して並びます。
データがバイナリ形式であるため、`FORMAT RowBinary` の後に続く区切り文字は次のように厳密に決められています。

- 任意数の空白文字:
  - `' '` (スペース - コード `0x20`)
  - `'\t'` (タブ - コード `0x09`)
  - `'\f'` (フォームフィード - コード `0x0C`) 
- 続いて、正確に 1 つの改行シーケンス:
  - Windows スタイルの `"\r\n"` 
  - または Unix スタイルの `'\n'`
- その直後にバイナリデータが続きます。

:::note
このフォーマットは行ベースであるため、[Native](../Native.md) フォーマットより効率が劣ります。
:::

以下のデータ型については、次の点が重要です。

- [Integers](../../../sql-reference/data-types/int-uint.md) は固定長のリトルエンディアン表現を使用します。たとえば、`UInt64` は 8 バイトを使用します。
- [DateTime](../../../sql-reference/data-types/datetime.md) は、値として Unix タイムスタンプを含む `UInt32` で表現されます。
- [Date](../../../sql-reference/data-types/date.md) は、`1970-01-01` からの日数を値として含む `UInt16` として表現されます。
- [String](../../../sql-reference/data-types/string.md) は可変長整数 (varint) (符号なし [`LEB128`](https://en.wikipedia.org/wiki/LEB128)) で長さを表し、その後に文字列のバイト列が続きます。
- [FixedString](../../../sql-reference/data-types/fixedstring.md) は単にバイト列として表現されます。
- [Arrays](../../../sql-reference/data-types/array.md) は可変長整数 (varint) (符号なし [LEB128](https://en.wikipedia.org/wiki/LEB128)) で要素数を表し、その後に配列要素が順に続きます。

[NULL](/sql-reference/syntax#null) をサポートするために、各 [Nullable](/sql-reference/data-types/nullable.md) 値の前に `1` または `0` を含む追加の 1 バイトが挿入されます。
- `1` の場合、その値は `NULL` であり、このバイトは別個の値として解釈されます。
- `0` の場合、そのバイトの後の値は `NULL` ではありません。

`RowBinary` フォーマットと `RawBlob` フォーマットの比較については、[Raw Formats Comparison](../RawBLOB.md/#raw-formats-comparison) を参照してください。



## 使用例 \{#example-usage\}



## フォーマット設定 \{#format-settings\}

<RowBinaryFormatSettings/>