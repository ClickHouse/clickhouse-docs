---
'alias': []
'description': 'JSONCompactStringsEachRowWithNames 格式的文档'
'input_format': true
'keywords':
- 'JSONCompactStringsEachRowWithNames'
'output_format': true
'slug': '/interfaces/formats/JSONCompactStringsEachRowWithNames'
'title': 'JSONCompactStringsEachRowWithNames'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

与 [`JSONCompactEachRow`](./JSONCompactEachRow.md) 格式的不同之处在于，它还会打印带有列名的标题行，类似于 [TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md) 格式。

## Example Usage {#example-usage}

## Format Settings {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，输入数据中的列将根据其名称映射到表中的列，如果设置 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则未知名称的列将被跳过。否则，第一行将被跳过。
:::
