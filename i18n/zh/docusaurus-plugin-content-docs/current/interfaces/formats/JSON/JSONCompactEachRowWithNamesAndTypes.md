---
'alias': []
'description': 'JSONCompactEachRowWithNamesAndTypes 格式的 Documentation'
'input_format': true
'keywords':
- 'JSONCompactEachRowWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/JSONCompactEachRowWithNamesAndTypes'
'title': 'JSONCompactEachRowWithNamesAndTypes'
---

| 输入 | 输出 | 别名 |
|------|------|------|
| ✔    | ✔    |      |

## 描述 {#description}

与 [`JSONCompactEachRow`](./JSONCompactEachRow.md) 格式不同，它还会打印两个包含列名称和类型的标题行，类似于 [TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md) 格式。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，则输入数据的列将根据名称映射到表中的列，未知名称的列将在设置 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1` 时被跳过。否则，将跳过第一行。
如果设置 [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) 为 `1`，则输入数据的类型将与表中相应列的类型进行比较。否则，将跳过第二行。
:::
