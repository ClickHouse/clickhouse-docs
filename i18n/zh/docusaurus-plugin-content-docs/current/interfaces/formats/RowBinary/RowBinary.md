---
alias: []
description: 'RowBinary 格式文档'
input_format: true
keywords: ['RowBinary']
output_format: true
slug: /interfaces/formats/RowBinary
title: 'RowBinary'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✔  | ✔  |    |


## 描述 {#description}

`RowBinary` 格式以二进制格式按行解析数据。
行和值连续列出,无分隔符。
由于数据采用二进制格式,`FORMAT RowBinary` 之后的分隔符严格规定如下:

- 任意数量的空白字符:
  - `' '` (空格 - 代码 `0x20`)
  - `'\t'` (制表符 - 代码 `0x09`)
  - `'\f'` (换页符 - 代码 `0x0C`)
- 后跟恰好一个换行序列:
  - Windows 风格 `"\r\n"`
  - 或 Unix 风格 `'\n'`
- 紧接着二进制数据。

:::note
此格式的效率低于 [Native](../Native.md) 格式,因为它是基于行的。
:::

对于以下数据类型,需要注意:

- [整数](../../../sql-reference/data-types/int-uint.md) 使用固定长度的小端序表示。例如,`UInt64` 使用 8 字节。
- [DateTime](../../../sql-reference/data-types/datetime.md) 表示为包含 Unix 时间戳值的 `UInt32`。
- [Date](../../../sql-reference/data-types/date.md) 表示为 UInt16 对象,包含自 `1970-01-01` 以来的天数值。
- [String](../../../sql-reference/data-types/string.md) 表示为可变宽度整数 (varint)(无符号 [`LEB128`](https://en.wikipedia.org/wiki/LEB128)),后跟字符串的字节。
- [FixedString](../../../sql-reference/data-types/fixedstring.md) 简单表示为字节序列。
- [数组](../../../sql-reference/data-types/array.md) 表示为可变宽度整数 (varint)(无符号 [LEB128](https://en.wikipedia.org/wiki/LEB128)),后跟数组的连续元素。

为了支持 [NULL](/sql-reference/syntax#null),在每个 [Nullable](/sql-reference/data-types/nullable.md) 值之前添加一个包含 `1` 或 `0` 的额外字节。

- 如果为 `1`,则该值为 `NULL`,此字节被解释为独立值。
- 如果为 `0`,则该字节之后的值不是 `NULL`。

有关 `RowBinary` 格式和 `RawBlob` 格式的比较,请参阅:[原始格式比较](../RawBLOB.md/#raw-formats-comparison)


## 使用示例 {#example-usage}


## 格式设置 {#format-settings}

<RowBinaryFormatSettings />
