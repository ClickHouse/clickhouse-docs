---
title: RowBinary
slug: /interfaces/formats/RowBinary
keywords: ['RowBinary']
input_format: true
output_format: true
alias: []
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

`RowBinary` 格式以二进制格式逐行解析数据。 
行和数值连续列出，没有分隔符。 
由于数据是二进制格式，因此在 `FORMAT RowBinary` 之后的分隔符严格指定如下： 

- 任意数量的空白字符：
  - `' '` (空格 - 代码 `0x20`)
  - `'\t'` (制表符 - 代码 `0x09`)
  - `'\f'` (换页符 - 代码 `0x0C`) 
- 后面跟着一个换行序列：
  - Windows 风格 `"\r\n"` 
  - 或 Unix 风格 `'\n'`
- 紧接着是二进制数据。

:::note
该格式的效率低于 [Native](../Native.md) 格式，因为它是基于行的。
:::

对于以下数据类型，重要的是要注意：

- [整数](../../../sql-reference/data-types/int-uint.md) 使用固定长度的小端表示法。例如， `UInt64` 使用 8 字节。
- [日期时间](../../../sql-reference/data-types/datetime.md) 被表示为包含 Unix 时间戳的 `UInt32`。
- [日期](../../../sql-reference/data-types/date.md) 被表示为一个 UInt16 对象，其中包含自 `1970-01-01` 以来的天数。
- [字符串](../../../sql-reference/data-types/string.md) 被表示为可变宽度整数 (varint) (无符号 [`LEB128`](https://en.wikipedia.org/wiki/LEB128))，后面跟着字符串的字节。
- [固定字符串](../../../sql-reference/data-types/fixedstring.md) 被简单表示为字节序列。
- [数组](../../../sql-reference/data-types/array.md) 被表示为可变宽度整数 (varint) (无符号 [LEB128](https://en.wikipedia.org/wiki/LEB128))，后面跟着数组的连续元素。

为了支持 [NULL](/sql-reference/syntax#null)，在每个 [Nullable](/sql-reference/data-types/nullable.md) 值之前添加一个额外的字节，其中包含 `1` 或 `0`。 
- 如果为 `1`，则值为 `NULL`，该字节被解释为一个单独的值。 
- 如果为 `0`，则该字节之后的值不是 `NULL`。

有关 `RowBinary` 格式和 `RawBlob` 格式的比较，请参见：[原始格式比较](../RawBLOB.md/#raw-formats-comparison)

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<RowBinaryFormatSettings/>
