---
'description': 'RowBinaryWithNames 格式的 Documentation'
'input_format': true
'keywords':
- 'RowBinaryWithNames'
'output_format': true
'slug': '/interfaces/formats/RowBinaryWithNames'
'title': 'RowBinaryWithNames'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

类似于 [`RowBinary`](./RowBinary.md) 格式，但添加了标题：

- [`LEB128`](https://en.wikipedia.org/wiki/LEB128) 编码的列数 (N)。
- N 个 `String` 指定列名。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<RowBinaryFormatSettings/>

:::note
- 如果设置 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 设为 `1`，则输入数据中的列将通过其名称映射到表中的列，名称未知的列将被跳过。
- 如果设置 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 设为 `1`。否则，第一行将被跳过。
:::
