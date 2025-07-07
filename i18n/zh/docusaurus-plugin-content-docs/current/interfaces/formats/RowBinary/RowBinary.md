---
'alias': []
'description': 'RowBinary 格式的 Documentation'
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

`RowBinary` 格式以二进制格式按行解析数据。 
行和数值依次列出，没有分隔符。 
由于数据是以二进制格式存储，`FORMAT RowBinary` 后的分隔符严格规定如下：

- 任意数量的空白字符：
  - `' '` (空格 - 代码 `0x20`)
  - `'\t'` (制表符 - 代码 `0x09`)
  - `'\f'` (换页符 - 代码 `0x0C`) 
- 紧接着是恰好一个换行序列：
  - Windows 风格 `"\r\n"` 
  - 或 Unix 风格 `'\n'`
- 紧接着是二进制数据。

:::note
由于是基于行的，此格式的效率低于 [Native](../Native.md) 格式。
:::

对于以下数据类型，需要注意：

- [整数](../../../sql-reference/data-types/int-uint.md) 使用固定长度的小端表示。例如，`UInt64` 使用 8 个字节。
- [日期时间](../../../sql-reference/data-types/datetime.md) 以 `UInt32` 表示，其中包含 Unix 时间戳的值。
- [日期](../../../sql-reference/data-types/date.md) 被表示为一个包含自 `1970-01-01` 以来的天数的 UInt16 对象。
- [字符串](../../../sql-reference/data-types/string.md) 被表示为一个可变宽度整数（varint）（无符号的 [`LEB128`](https://en.wikipedia.org/wiki/LEB128)），后面跟着字符串的字节。
- [FixedString](../../../sql-reference/data-types/fixedstring.md) 简单地表示为一系列字节。
- [数组](../../../sql-reference/data-types/array.md) 被表示为一个可变宽度整数（varint）（无符号的 [LEB128](https://en.wikipedia.org/wiki/LEB128)），后面跟着数组的连续元素。

为了支持 [NULL](/sql-reference/syntax#null)，在每个 [Nullable](/sql-reference/data-types/nullable.md) 值之前添加一个包含 `1` 或 `0` 的额外字节。
- 如果是 `1`，则该值为 `NULL`，并且该字节被解释为一个单独的值。 
- 如果是 `0`，则该字节后面的值不是 `NULL`。

有关 `RowBinary` 格式和 `RawBlob` 格式的比较，请参见：[原始格式比较](../RawBLOB.md/#raw-formats-comparison)

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<RowBinaryFormatSettings/>
