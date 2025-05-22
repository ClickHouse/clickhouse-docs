---
'alias': []
'description': 'JSONCompactEachRowWithNames 格式的文档'
'input_format': true
'keywords':
- 'JSONCompactEachRowWithNames'
'output_format': true
'slug': '/interfaces/formats/JSONCompactEachRowWithNames'
'title': 'JSONCompactEachRowWithNames'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |


## Description {#description}

与 [`JSONCompactEachRow`](./JSONCompactEachRow.md) 格式不同的是，它还打印了带列名的表头行，类似于 [`TabSeparatedWithNames`](../TabSeparated/TabSeparatedWithNames.md) 格式。


## Example Usage {#example-usage}

## Format Settings {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 1，则输入数据的列将根据名称映射到表的列，如果设置 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 1，则会跳过未知名称的列。否则，将跳过第一行。
:::
