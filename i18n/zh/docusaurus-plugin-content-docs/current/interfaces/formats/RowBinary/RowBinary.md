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


## 描述 \\{#description\\}

`RowBinary` 格式按行以二进制形式解析数据。  
行和数值按顺序连续列出，没有分隔符。  
由于数据以二进制形式表示，`FORMAT RowBinary` 之后的分隔符必须严格按如下方式指定：

- 任意数量的空白字符：
  - `' '`（空格 - 代码 `0x20`）
  - `'\t'`（制表符 - 代码 `0x09`）
  - `'\f'`（换页符 - 代码 `0x0C`）
- 后面紧跟且只能跟一个换行序列：
  - Windows 风格 `"\r\n"`
  - 或 Unix 风格 `'\n'`
- 紧接着就是二进制数据。

:::note
由于是按行存储，该格式比 [Native](../Native.md) 格式效率更低。
:::

对于以下数据类型，需要注意：

- [整数](../../../sql-reference/data-types/int-uint.md) 使用定长小端表示。例如，`UInt64` 使用 8 字节。
- [DateTime](../../../sql-reference/data-types/datetime.md) 表示为 `UInt32`，其值为 Unix 时间戳。
- [Date](../../../sql-reference/data-types/date.md) 表示为 `UInt16`，其值为自 `1970-01-01` 起的天数。
- [String](../../../sql-reference/data-types/string.md) 表示为可变宽度整数（varint，使用无符号 [`LEB128`](https://en.wikipedia.org/wiki/LEB128) 编码），后面跟字符串的字节序列。
- [FixedString](../../../sql-reference/data-types/fixedstring.md) 表示为简单的字节序列。
- [Array](../../../sql-reference/data-types/array.md) 表示为可变宽度整数（varint，使用无符号 [LEB128](https://en.wikipedia.org/wiki/LEB128) 编码），后面跟数组的各个元素。

对于 [NULL](/sql-reference/syntax#null) 支持，每个 [Nullable](/sql-reference/data-types/nullable.md) 值前会额外增加一个包含 `1` 或 `0` 的字节。 
- 如果为 `1`，则该值为 `NULL`，并且这个字节本身被解释为一个独立的值。 
- 如果为 `0`，则该字节后面的值不是 `NULL`。

关于 `RowBinary` 格式与 `RawBlob` 格式的对比，请参阅：[原始格式比较](../RawBLOB.md/#raw-formats-comparison)



## 使用示例 \\{#example-usage\\}



## 格式设置 \\{#format-settings\\}

<RowBinaryFormatSettings/>