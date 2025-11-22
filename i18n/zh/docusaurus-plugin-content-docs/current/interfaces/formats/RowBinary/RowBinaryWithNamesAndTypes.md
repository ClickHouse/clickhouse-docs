---
alias: []
description: 'RowBinaryWithNamesAndTypes 格式文档'
input_format: true
keywords: ['RowBinaryWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/RowBinaryWithNamesAndTypes
title: 'RowBinaryWithNamesAndTypes'
doc_type: 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✔  | ✔  |    |


## Description {#description}

与 [RowBinary](./RowBinary.md) 格式类似,但增加了头部信息:

- 使用 [`LEB128`](https://en.wikipedia.org/wiki/LEB128) 编码的列数 (N)。
- N 个 `String` 类型,指定列名。
- N 个 `String` 类型,指定列类型。


## 使用示例 {#example-usage}


## 格式设置 {#format-settings}

<RowBinaryFormatSettings />

:::note
如果将设置 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 设为 1,
输入数据中的列将按名称映射到表中的列,若设置 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 1,则会跳过名称未知的列。
否则,将跳过第一行。
如果将设置 [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) 设为 `1`,
输入数据中的类型将与表中对应列的类型进行比较。否则,将跳过第二行。
:::
