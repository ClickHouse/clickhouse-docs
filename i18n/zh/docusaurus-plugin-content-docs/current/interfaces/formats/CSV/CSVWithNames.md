---
'alias': []
'description': 'CSV格式文档'
'input_format': true
'keywords':
- 'CSVWithNames'
'output_format': true
'slug': '/interfaces/formats/CSVWithNames'
'title': 'CSVWithNames'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

还会打印带有列名的标题行，类似于 [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)。

## Example Usage {#example-usage}

## Format Settings {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，
输入数据中的列将通过它们的名称映射到表中的列，未知名称的列将被跳过，如果设置 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`。
否则，第一行将被跳过。
:::
