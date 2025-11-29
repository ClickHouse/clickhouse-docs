---
description: 'RowBinaryWithNames 格式文档'
input_format: true
keywords: ['RowBinaryWithNames']
output_format: true
slug: /interfaces/formats/RowBinaryWithNames
title: 'RowBinaryWithNames'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✔  | ✔  |    |


## 描述 {#description}

与 [`RowBinary`](./RowBinary.md) 格式类似，但在前面增加了头部：

- 使用 [`LEB128`](https://en.wikipedia.org/wiki/LEB128) 编码的列数（N）。
- N 个 `String`，用于指定列名。



## 使用示例 {#example-usage}



## 格式设置 {#format-settings}

<RowBinaryFormatSettings/>

:::note
- 当将 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 设置为 `1` 时，将按列名把输入数据中的列映射到表中的列。
- 当将 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 设置为 `1` 时，具有未知名称的列会被跳过；否则，第一行会被跳过。
:::