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


## Description {#description}

与 [`RowBinary`](./RowBinary.md) 格式类似,但增加了头部信息:

- 使用 [`LEB128`](https://en.wikipedia.org/wiki/LEB128) 编码的列数 (N)。
- N 个指定列名的 `String` 类型值。


## 使用示例 {#example-usage}


## 格式设置 {#format-settings}

<RowBinaryFormatSettings />

:::note

- 如果将设置 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 设为 `1`,
  输入数据中的列将按名称映射到表中的列,名称未知的列将被跳过。
- 如果将设置 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 设为 `1`。
  否则,将跳过第一行。
  :::
