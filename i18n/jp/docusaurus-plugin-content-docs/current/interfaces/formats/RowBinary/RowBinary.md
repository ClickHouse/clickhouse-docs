---
alias: []
description: '行バイナリ形式のドキュメント'
input_format: true
keywords: ['RowBinary']
output_format: true
slug: /interfaces/formats/RowBinary
title: 'RowBinary'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 入力 | 出力 | 別名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`RowBinary` 形式は、バイナリ形式で行ごとにデータを解析します。  
行と値は区切りなしで連続して列挙されます。  
データがバイナリ形式であるため、`FORMAT RowBinary` の後の区切り文字は厳密に次のように指定されています： 

- 任意の数の空白：
  - `' '` (スペース - コード `0x20`)
  - `'\t'` (タブ - コード `0x09`)
  - `'\f'` (フォームフィード - コード `0x0C`) 
- 正確に1つの改行シーケンスに続く：
  - Windowsスタイル `"\r\n"` 
  - またはUnixスタイル `'\n'`
- 直後にバイナリデータが続く。

:::note
この形式は行ベースであるため、[Native](../Native.md) 形式よりも効率が劣ります。
:::

以下のデータ型に関しては、次の点に注意することが重要です：

- [整数](../../../sql-reference/data-types/int-uint.md)は固定長リトルエンディアン表現を使用します。例えば、`UInt64`は8バイトを使用します。
- [DateTime](../../../sql-reference/data-types/datetime.md)は、値としてUnixタイムスタンプを含む `UInt32` として表現されます。
- [日付](../../../sql-reference/data-types/date.md)は、値として `1970-01-01` 以降の日数を含むUInt16オブジェクトとして表現されます。
- [文字列](../../../sql-reference/data-types/string.md)は、バイト列の前に可変幅整数（varint）（符号なし[`LEB128`](https://en.wikipedia.org/wiki/LEB128））として表現され、その後に文字列のバイトが続きます。
- [FixedString](../../../sql-reference/data-types/fixedstring.md)は、単にバイトの列として表現されます。
- [配列](../../../sql-reference/data-types/array.md)は、可変幅整数（varint）（符号なし [LEB128](https://en.wikipedia.org/wiki/LEB128)）として表現され、その後に配列の要素が続きます。

[NULL](/sql-reference/syntax#null) サポートのために、各 [Nullable](/sql-reference/data-types/nullable.md) 値の前に `1` または `0` を含む追加のバイトが追加されます。 
- `1` の場合、値は `NULL` であり、このバイトは別の値として解釈されます。 
- `0` の場合、そのバイトの後の値は `NULL` ではありません。

`RowBinary` 形式と `RawBlob` 形式の比較については、[Raw Formats Comparison](../RawBLOB.md/#raw-formats-comparison)を参照してください。

## 使用例 {#example-usage}

## 形式設定 {#format-settings}

<RowBinaryFormatSettings/>
