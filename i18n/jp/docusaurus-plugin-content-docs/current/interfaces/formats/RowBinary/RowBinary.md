---
alias: []
description: 'RowBinaryフォーマットのドキュメント'
input_format: true
keywords:
- 'RowBinary'
output_format: true
slug: '/interfaces/formats/RowBinary'
title: 'RowBinary'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`RowBinary`フォーマットは、バイナリフォーマットで行ごとにデータを解析します。
行と値は連続してリストされ、区切り文字はありません。
データがバイナリフォーマットであるため、`FORMAT RowBinary`の後の区切り文字は次のように厳密に指定されます：

- 任意の数のホワイトスペース：
  - `' '`（スペース - コード `0x20`）
  - `'\t'`（タブ - コード `0x09`）
  - `'\f'`（フォームフィード - コード `0x0C`） 
- 正確に1つの改行シーケンスの後：
  - Windowsスタイル `"\r\n"` 
  - またはUnixスタイル `'\n'`
- すぐにバイナリデータが続きます。

:::note
このフォーマットは、行ベースであるため、[Native](../Native.md)フォーマットより効率が低いです。
:::

次のデータ型については、注意が必要です：

- [整数](../../../sql-reference/data-types/int-uint.md)は固定長のリトルエンディアン表現を使用します。例えば、`UInt64`は8バイトを使用します。
- [DateTime](../../../sql-reference/data-types/datetime.md)はUnixタイムスタンプを値として持つ`UInt32`として表現されます。
- [Date](../../../sql-reference/data-types/date.md)は`1970-01-01`からの日数を値として持つUInt16オブジェクトとして表現されます。
- [String](../../../sql-reference/data-types/string.md)は可変幅整数（varint）（符号なしの[`LEB128`](https://en.wikipedia.org/wiki/LEB128)）として表現され、その後に文字列のバイトが続きます。
- [FixedString](../../../sql-reference/data-types/fixedstring.md)は、単にバイトの列として表現されます。
- [配列](../../../sql-reference/data-types/array.md)は可変幅整数（varint）（符号なしの[LEB128](https://en.wikipedia.org/wiki/LEB128)）として表現され、その後に配列の要素が続きます。

[NULL](/sql-reference/syntax#null)サポートのために、各[Nullable](/sql-reference/data-types/nullable.md)値の前に`1`または`0`を含む追加のバイトが追加されます。
- `1`の場合、その値は`NULL`であり、このバイトは別の値として解釈されます。
- `0`の場合、そのバイトの後の値は`NULL`ではありません。

`RowBinary`フォーマットと`RawBlob`フォーマットの比較については、[Raw Formats Comparison](../RawBLOB.md/#raw-formats-comparison)を参照してください。

## 使用例 {#example-usage}

## フォーマット設定 {#format-settings}

<RowBinaryFormatSettings/>
