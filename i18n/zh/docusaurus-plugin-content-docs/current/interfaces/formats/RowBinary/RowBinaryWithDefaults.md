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

与 [`RowBinary`](./RowBinary.md) 格式类似，但在每一列前多了一个字节，用于表示是否使用默认值。



## 使用示例 {#example-usage}

示例：

```sql title="Query"
SELECT * FROM FORMAT('RowBinaryWithDefaults', 'x UInt32 default 42, y UInt32', x'010001000000')
```

```response title="Response"
┌──x─┬─y─┐
│ 42 │ 1 │
└────┴───┘
```

* 对于列 `x`，只有一个字节 `01`，它表示应使用默认值，在此字节之后不再提供其他数据。
* 对于列 `y`，数据以字节 `00` 开头，它表示该列包含实际值，应从后续数据 `01000000` 中读取。


## 格式设置 {#format-settings}

<RowBinaryFormatSettings/>
