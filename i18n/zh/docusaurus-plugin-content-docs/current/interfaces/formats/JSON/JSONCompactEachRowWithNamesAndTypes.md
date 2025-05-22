---
'alias': []
'description': 'JSON紧凑每行带名称和类型格式的文档'
'input_format': true
'keywords':
- 'JSONCompactEachRowWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/JSONCompactEachRowWithNamesAndTypes'
'title': 'JSON紧凑每行带名称和类型'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

与 [`JSONCompactEachRow`](./JSONCompactEachRow.md) 格式的不同之处在于，它还打印两行带有列名称和类型的表头，类似于 [TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md) 格式。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，
输入数据的列将通过其名称映射到表的列，未知名称的列将在设置 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 1 时被跳过。
否则，第一行将被跳过。
如果设置 [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) 为 `1`，
输入数据的类型将与表中相应列的类型进行比较。否则，第二行将被跳过。
:::
