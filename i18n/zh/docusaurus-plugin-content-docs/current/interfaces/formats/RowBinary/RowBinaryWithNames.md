---
'description': 'RowBinaryWithNames 格式的文档'
'input_format': true
'keywords':
- 'RowBinaryWithNames'
'output_format': true
'slug': '/interfaces/formats/RowBinaryWithNames'
'title': 'RowBinaryWithNames'
'doc_type': 'reference'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

类似于 [`RowBinary`](./RowBinary.md) 格式，但增加了头部:

- [`LEB128`](https://en.wikipedia.org/wiki/LEB128) 编码的列数 (N)。
- N 个 `String` 指定列名。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<RowBinaryFormatSettings/>

:::note
- 如果设置 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 的值为 `1`，那么输入数据的列将根据名称映射到表的列，未知名称的列将被跳过。
- 如果设置 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 的值为 `1`。否则，将跳过第一行。
:::
