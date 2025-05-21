---
'alias': []
'description': 'JSONCompactEachRowWithNamesAndTypes格式的文档'
'input_format': true
'keywords':
- 'JSONCompactEachRowWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/JSONCompactEachRowWithNamesAndTypes'
'title': 'JSONCompactEachRowWithNamesAndTypes'
---



| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

与 [`JSONCompactEachRow`](./JSONCompactEachRow.md) 格式不同的是，它还打印了两行带有列名和类型的表头，类似于 [TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md) 格式。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，输入数据中的列将根据它们的名称映射到表中的列，若设置 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，未知名称的列将被跳过。否则，第一行将被跳过。
如果设置 [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) 为 `1`，输入数据中的类型将与表中对应列的类型进行比较。否则，第二行将被跳过。
:::
