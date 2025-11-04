---
'alias': []
'description': 'RowBinary 格式的文档'
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

## Description {#description}

`RowBinary` 格式以二进制格式逐行解析数据。 
行和值连续列出，没有分隔符。 
由于数据是以二进制格式存储，因此在 `FORMAT RowBinary` 之后的分隔符严格指定如下： 

- 任何数量的空白字符：
  - `' '` (空格 - 代码 `0x20`)
  - `'\t'` (制表符 - 代码 `0x09`)
  - `'\f'` (换页 - 代码 `0x0C`) 
- 紧接着是确切的一个换行序列：
  - Windows 样式 `"\r\n"` 
  - 或 Unix 样式 `'\n'`
- 紧接着是二进制数据。

:::note
这种格式的效率低于 [Native](../Native.md) 格式，因为它是基于行的。
:::

对于以下数据类型，需要注意的是：

- [Integers](../../../sql-reference/data-types/int-uint.md) 使用固定长度的小端表示法。例如，`UInt64` 使用 8 字节。
- [DateTime](../../../sql-reference/data-types/datetime.md) 表示为包含 Unix 时间戳的 `UInt32`。
- [Date](../../../sql-reference/data-types/date.md) 表示为一个 UInt16 对象，包含自 `1970-01-01` 以来的天数。
- [String](../../../sql-reference/data-types/string.md) 表示为一个可变长度的整数 (varint) (无符号 [`LEB128`](https://en.wikipedia.org/wiki/LEB128))，后跟字符串的字节。
- [FixedString](../../../sql-reference/data-types/fixedstring.md) 则简单表示为字节序列。
- [Arrays](../../../sql-reference/data-types/array.md) 表示为一个可变长度的整数 (varint) (无符号 [LEB128](https://en.wikipedia.org/wiki/LEB128))，后跟数组的连续元素。

对于 [NULL](/sql-reference/syntax#null) 支持，每个 [Nullable](/sql-reference/data-types/nullable.md) 值之前添加一个包含 `1` 或 `0` 的额外字节。 
- 如果是 `1`，则该值为 `NULL`，而这个字节被解释为一个独立的值。 
- 如果是 `0`，则这个字节后的值不是 `NULL`。

有关 `RowBinary` 格式与 `RawBlob` 格式的比较，请参见：[Raw Formats Comparison](../RawBLOB.md/#raw-formats-comparison)

## Example usage {#example-usage}

## Format settings {#format-settings}

<RowBinaryFormatSettings/>
