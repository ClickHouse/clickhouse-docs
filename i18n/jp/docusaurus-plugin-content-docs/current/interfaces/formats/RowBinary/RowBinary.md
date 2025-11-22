---
alias: []
description: 'RowBinary フォーマットに関するドキュメント'
input_format: true
keywords: ['RowBinary']
output_format: true
slug: /interfaces/formats/RowBinary
title: 'RowBinary'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | 別名 |
| -- | -- | -- |
| ✔  | ✔  |    |


## 説明 {#description}

`RowBinary`形式は、データを行単位でバイナリ形式として解析します。
行と値は区切り文字なしで連続して並べられます。
データがバイナリ形式であるため、`FORMAT RowBinary`の後の区切り文字は以下のように厳密に指定されています:

- 任意の数の空白文字:
  - `' '` (スペース - コード `0x20`)
  - `'\t'` (タブ - コード `0x09`)
  - `'\f'` (フォームフィード - コード `0x0C`)
- その後、正確に1つの改行シーケンス:
  - Windows形式 `"\r\n"`
  - またはUnix形式 `'\n'`
- 直後にバイナリデータが続きます。

:::note
この形式は行ベースであるため、[Native](../Native.md)形式よりも効率が劣ります。
:::

以下のデータ型については、次の点に注意してください:

- [整数型](../../../sql-reference/data-types/int-uint.md)は固定長のリトルエンディアン表現を使用します。例えば、`UInt64`は8バイトを使用します。
- [DateTime](../../../sql-reference/data-types/datetime.md)は、Unixタイムスタンプを値として含む`UInt32`として表現されます。
- [Date](../../../sql-reference/data-types/date.md)は、`1970-01-01`からの日数を値として含むUInt16オブジェクトとして表現されます。
- [String](../../../sql-reference/data-types/string.md)は、可変長整数(varint)(符号なし[`LEB128`](https://en.wikipedia.org/wiki/LEB128))として表現され、その後に文字列のバイト列が続きます。
- [FixedString](../../../sql-reference/data-types/fixedstring.md)は単純にバイト列として表現されます。
- [配列](../../../sql-reference/data-types/array.md)は、可変長整数(varint)(符号なし[LEB128](https://en.wikipedia.org/wiki/LEB128))として表現され、その後に配列の連続する要素が続きます。

[NULL](/sql-reference/syntax#null)のサポートのため、各[Nullable](/sql-reference/data-types/nullable.md)値の前に`1`または`0`を含む追加のバイトが追加されます。

- `1`の場合、値は`NULL`であり、このバイトは独立した値として解釈されます。
- `0`の場合、バイトの後の値は`NULL`ではありません。

`RowBinary`形式と`RawBlob`形式の比較については、[Raw形式の比較](../RawBLOB.md/#raw-formats-comparison)を参照してください。


## 使用例 {#example-usage}


## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings />
