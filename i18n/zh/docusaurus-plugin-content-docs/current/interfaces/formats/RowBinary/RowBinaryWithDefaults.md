---
title: RowBinaryWithDefaults
slug: /interfaces/formats/RowBinaryWithDefaults
keywords: ['RowBinaryWithDefaults']
input_format: true
output_format: false
alias: []
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 输入  | 输出  | 别名 |
|-------|-------|-------|
| ✔     | ✗     |       |

## 描述 {#description}

与 [`RowBinary`](./RowBinary.md) 格式类似，但在每列之前有一个额外的字节，指示是否应使用默认值。

## 示例用法 {#example-usage}

示例：

```sql title="查询"
SELECT * FROM FORMAT('RowBinaryWithDefaults', 'x UInt32 default 42, y UInt32', x'010001000000')
```
```response title="响应"
┌──x─┬─y─┐
│ 42 │ 1 │
└────┴───┘
```

- 对于列 `x`，只有一个字节 `01`，指示应使用默认值，并且在此字节之后没有提供其他数据。
- 对于列 `y`，数据以字节 `00` 开始，指示该列具有应从后续数据 `01000000` 中读取的实际值。

## 格式设置 {#format-settings}

<RowBinaryFormatSettings/>
