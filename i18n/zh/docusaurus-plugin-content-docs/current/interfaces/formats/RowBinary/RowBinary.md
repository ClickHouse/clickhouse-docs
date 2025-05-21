---
'alias': []
'description': 'RowBinary格式的文档'
'input_format': true
'keywords':
- 'RowBinary'
'output_format': true
'slug': '/interfaces/formats/RowBinary'
'title': 'RowBinary'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

`RowBinary` 格式以二进制格式逐行解析数据。  
行和数值按顺序列出，没有分隔符。  
由于数据是以二进制格式呈现，`FORMAT RowBinary` 之后的分隔符严格指定如下：  

- 任何数量的空格：
  - `' '` (空格 - 代码 `0x20`)
  - `'\t'` (制表符 - 代码 `0x09`)
  - `'\f'` (换页符 - 代码 `0x0C`) 
- 后面跟着一个换行序列：
  - Windows 风格 `"\r\n"` 
  - 或 Unix 风格 `'\n'`
- 紧接着二进制数据。

:::note
此格式的效率低于 [Native](../Native.md) 格式，因为它是基于行的。
:::

对于以下数据类型，需注意以下几点：

- [整数](../../../sql-reference/data-types/int-uint.md) 使用固定长度的小端表示法。例如，`UInt64` 使用 8 字节。
- [日期时间](../../../sql-reference/data-types/datetime.md) 表示为一个 `UInt32`，包含 Unix 时间戳作为值。
- [日期](../../../sql-reference/data-types/date.md) 表示为一个 `UInt16` 对象，包含自 `1970-01-01` 以来的天数作为值。
- [字符串](../../../sql-reference/data-types/string.md) 表示为一个可变宽度整数 (varint) (无符号 [`LEB128`](https://en.wikipedia.org/wiki/LEB128))，后跟字符串的字节。
- [固定字符串](../../../sql-reference/data-types/fixedstring.md) 简单表示为字节序列。
- [数组](../../../sql-reference/data-types/array.md) 表示为一个可变宽度整数 (varint) (无符号 [LEB128](https://en.wikipedia.org/wiki/LEB128))，后跟数组的连续元素。

为了支持 [NULL](/sql-reference/syntax#null)，在每个 [Nullable](/sql-reference/data-types/nullable.md) 值之前会增加一个包含 `1` 或 `0` 的额外字节。 
- 如果是 `1`，那么该值为 `NULL`，并且这个字节被解释为一个单独的值。 
- 如果是 `0`，则该字节后面的值不是 `NULL`。

有关 `RowBinary` 格式与 `RawBlob` 格式的比较，请参见：[原始格式比较](../RawBLOB.md/#raw-formats-comparison)

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<RowBinaryFormatSettings/>
