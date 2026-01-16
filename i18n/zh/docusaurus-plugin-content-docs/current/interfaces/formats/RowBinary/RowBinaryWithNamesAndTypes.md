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


## 描述 \{#description\}

与 [RowBinary](./RowBinary.md) 格式类似，但增加了头部：

- 使用 [`LEB128`](https://en.wikipedia.org/wiki/LEB128) 编码的列数（N）。
- N 个 `String`，指定列名。
- N 个 `String`，指定列类型。



## 用法示例 \{#example-usage\}



## 格式设置 \{#format-settings\}

<RowBinaryFormatSettings/>

:::note
如果将 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 设置为 1，
则输入数据中的列会按照名称映射到表中的列；如果将 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 设置为 1，则名称未知的列将被忽略。
否则，第一行将被跳过。
如果将 [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) 设置为 `1`，
则输入数据中的类型会与表中相应列的类型进行比较。否则，第二行将被跳过。
:::