---
title: RowBinary
slug: /interfaces/formats/RowBinary
keywords: [RowBinary]
input_format: true
output_format: true
alias: []
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | 別名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`RowBinary` 形式は、バイナリ形式でデータを行ごとに解析します。  
行と値は連続してリストされ、区切り文字はありません。  
データはバイナリ形式であるため、`FORMAT RowBinary` の後の区切り文字は次のように厳密に指定されています：

- 任意の数のホワイトスペース：
  - `' '` (スペース - コード `0x20`)
  - `'\t'` (タブ - コード `0x09`)
  - `'\f'` (フォームフィード - コード `0x0C`) 
- 正確に1つの改行シーケンスが続く：
  - Windowsスタイル `"\r\n"` 
  - またはUnixスタイル `'\n'`
- すぐにバイナリデータが続く。

:::note
この形式は、行ベースであるため、[Native](../Native.md) 形式よりも効率が悪いです。
:::

次のデータ型に関して重要な点は以下の通りです：

- [整数](../../../sql-reference/data-types/int-uint.md)は、固定長のリトルエンディアン表現を使用します。たとえば、`UInt64` は8バイト使用します。
- [DateTime](../../../sql-reference/data-types/datetime.md)は、Unixタイムスタンプを値として含む `UInt32` として表現されます。
- [Date](../../../sql-reference/data-types/date.md)は、`1970-01-01` からの日数を値として含むUInt16オブジェクトとして表現されます。
- [String](../../../sql-reference/data-types/string.md)は、可変幅整数（varint）（符号なしの [`LEB128`](https://en.wikipedia.org/wiki/LEB128)）として表現され、その後に文字列のバイトが続きます。
- [FixedString](../../../sql-reference/data-types/fixedstring.md)は、単にバイトのシーケンスとして表現されます。
- [配列](../../../sql-reference/data-types/array.md)は、可変幅整数（varint）（符号なしの [LEB128](https://en.wikipedia.org/wiki/LEB128)）として表現され、その後に配列の連続要素が続きます。

[NULL](/sql-reference/syntax.md/#null-literal) サポートのために、各 [Nullable](/sql-reference/data-types/nullable.md) 値の前に `1` または `0` を含む追加のバイトが追加されます。  
- `1` の場合、その値は `NULL` であり、このバイトは別の値として解釈されます。  
- `0` の場合、このバイトの後の値は `NULL` ではありません。

`RowBinary` 形式と `RawBlob` 形式の比較については、[Raw Formats Comparison](../RawBLOB.md/#raw-formats-comparison) を参照してください。

## 使用例 {#example-usage}

## 形式設定 {#format-settings}

<RowBinaryFormatSettings/>
