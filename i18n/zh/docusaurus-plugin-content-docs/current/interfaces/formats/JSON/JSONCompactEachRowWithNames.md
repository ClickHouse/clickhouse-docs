---
'alias': []
'description': 'JSONCompactEachRowWithNames格式的文档'
'input_format': true
'keywords':
- 'JSONCompactEachRowWithNames'
'output_format': true
'slug': '/interfaces/formats/JSONCompactEachRowWithNames'
'title': 'JSONCompactEachRowWithNames'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |


## 描述 {#description}

与 [`JSONCompactEachRow`](./JSONCompactEachRow.md) 格式不同，它还会打印包含列名的表头行，类似于 [`TabSeparatedWithNames`](../TabSeparated/TabSeparatedWithNames.md) 格式。


## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 1，输入数据的列将根据其名称与表中的列进行映射，如果设置 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 1，则未知名称的列将被跳过。否则，第一行将被跳过。
:::
