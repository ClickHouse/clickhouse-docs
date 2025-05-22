---
'alias': []
'description': 'CSVWithNamesAndTypes 格式的文档'
'input_format': true
'keywords':
- 'CSVWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/CSVWithNamesAndTypes'
'title': 'CSVWithNamesAndTypes'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

还会打印两行标题，包含列的名称和类型，类似于 [TabSeparatedWithNamesAndTypes](../formats/TabSeparatedWithNamesAndTypes)。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，输入数据的列将根据其名称映射到表中的列，如果设置 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，未知名称的列将被跳过。否则，第一行将被跳过。
:::

:::note
如果设置 [input_format_with_types_use_header](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) 为 `1`，输入数据的类型将与表中相应列的类型进行比较。否则，第二行将被跳过。
:::
