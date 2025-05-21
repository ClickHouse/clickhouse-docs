---
'alias': []
'description': 'RowBinaryWithNamesAndTypes格式的文档'
'input_format': true
'keywords':
- 'RowBinaryWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/RowBinaryWithNamesAndTypes'
'title': '带名称和类型的RowBinary格式'
---

import RowBinaryFormatSettings from './_snippets/common-row-binary-format-settings.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

类似于 [RowBinary](./RowBinary.md) 格式，但添加了头部信息：

- [`LEB128`](https://en.wikipedia.org/wiki/LEB128) 编码的列数 (N)。
- N 个 `String` 指定列名。
- N 个 `String` 指定列类型。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

<RowBinaryFormatSettings/>

:::note
如果设置 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 1，那么输入数据中的列将根据列名映射到表中的列，若设置 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 1，则未知列名的列将被跳过。
否则，第一行将被跳过。
如果设置 [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) 为 `1`，则输入数据的类型将与表中相应列的类型进行比较。否则，第二行将被跳过。
:::
