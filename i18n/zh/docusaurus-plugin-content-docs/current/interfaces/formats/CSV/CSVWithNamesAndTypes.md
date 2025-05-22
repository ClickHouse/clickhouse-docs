---
'alias': []
'description': 'CSV带名称和类型格式的文档'
'input_format': true
'keywords':
- 'CSVWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/CSVWithNamesAndTypes'
'title': 'CSV带名称和类型'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

还会打印两行包含列名和类型的标题，与 [TabSeparatedWithNamesAndTypes](../formats/TabSeparatedWithNamesAndTypes) 类似。

## Example Usage {#example-usage}

## Format Settings {#format-settings}

:::note
如果设置 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，输入数据中的列将通过其名称映射到表中的列，如果设置 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则未知名称的列将被跳过。否则，第一行将被跳过。
:::

:::note
如果设置 [input_format_with_types_use_header](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) 为 `1`，输入数据中的类型将与表中相应列的类型进行比较。否则，第二行将被跳过。
:::
