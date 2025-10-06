---
'alias': []
'description': 'RowBinary フォーマットに関する Documentation'
'input_format': true
'keywords':
- 'RowBinary'
'output_format': true
'slug': '/interfaces/formats/RowBinary'
'title': 'RowBinary'
'doc_type': 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`RowBinary` 形式は、バイナリ形式でデータを行単位でパースします。 
行と値は連続してリストされ、区切りはありません。 
バイナリ形式でデータがあるため、`FORMAT RowBinary` の後の区切りは次のように厳密に指定されています: 

- 任意の数の空白:
  - `' '` (スペース - コード `0x20`)
  - `'\t'` (タブ - コード `0x09`)
  - `'\f'` (フォームフィード - コード `0x0C`) 
- 正確に1つの新しい行シーケンスの後に続く:
  - Windowsスタイル `"\r\n"` 
  - またはUnixスタイル `'\n'`
- その直後にバイナリデータが続く。

:::note
この形式は行指向であるため、[Native](../Native.md) 形式と比べて効率が低いです。
:::

以下のデータ型については、次の点に注意することが重要です:

- [整数](../../../sql-reference/data-types/int-uint.md) は固定長のリトルエンディアン表現を使用します。例えば、`UInt64` は8バイトを使用します。
- [DateTime](../../../sql-reference/data-types/datetime.md) は、Unixタイムスタンプを値として含む `UInt32` として表現されます。
- [Date](../../../sql-reference/data-types/date.md) は、`1970-01-01` からの経過日数を値として含む UInt16 オブジェクトとして表現されます。
- [String](../../../sql-reference/data-types/string.md) は、可変幅の整数 (varint) (符号なし [`LEB128`](https://en.wikipedia.org/wiki/LEB128)) として表現され、その後に文字列のバイトが続きます。
- [FixedString](../../../sql-reference/data-types/fixedstring.md) は、単純にバイトのシーケンスとして表現されます。
- [配列](../../../sql-reference/data-types/array.md) は、可変幅の整数 (varint) (符号なし [LEB128](https://en.wikipedia.org/wiki/LEB128)) として表現され、その後に配列の連続した要素が続きます。

[NULL](/sql-reference/syntax#null) サポートのために、各 [Nullable](/sql-reference/data-types/nullable.md) 値の前に `1` または `0` を含む追加のバイトが加えられます。 
- `1` の場合、値は `NULL` であり、このバイトは別の値として解釈されます。 
- `0` の場合、そのバイトの後の値は `NULL` ではありません。

`RowBinary` 形式と `RawBlob` 形式の比較については、[Raw Formats Comparison](../RawBLOB.md/#raw-formats-comparison) を参照してください。

## 使用例 {#example-usage}

## 形式設定 {#format-settings}

<RowBinaryFormatSettings/>
