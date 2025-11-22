---
alias: []
description: 'RowBinaryWithDefaults 格式文档'
input_format: true
keywords: ['RowBinaryWithDefaults']
output_format: false
slug: /interfaces/formats/RowBinaryWithDefaults
title: 'RowBinaryWithDefaults'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✔  | ✗  |    |


## 描述 {#description}

类似于 [`RowBinary`](./RowBinary.md) 格式,但在每列前增加了一个额外的字节,用于指示是否使用默认值。


## 使用示例 {#example-usage}

示例：

```sql title="查询"
SELECT * FROM FORMAT('RowBinaryWithDefaults', 'x UInt32 default 42, y UInt32', x'010001000000')
```

```response title="响应"
┌──x─┬─y─┐
│ 42 │ 1 │
└────┴───┘
```

- 对于列 `x`，只有一个字节 `01` 表示应使用默认值，该字节之后不再提供其他数据。
- 对于列 `y`，数据以字节 `00` 开头，表示该列有实际值，需要从后续数据 `01000000` 中读取。


## 格式设置 {#format-settings}

<RowBinaryFormatSettings />
