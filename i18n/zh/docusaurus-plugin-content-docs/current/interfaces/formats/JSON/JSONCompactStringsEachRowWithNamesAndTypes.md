---
'description': 'JSON紧凑字符串每行与名称和类型格式的文档'
'keywords':
- 'JSONCompactStringsEachRowWithNamesAndTypes'
'slug': '/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes'
'title': 'JSON紧凑字符串每行与名称和类型'
---

## 描述 {#description}

与 `JSONCompactEachRow` 格式不同的是，它还打印两行标题，包含列名和类型，类似于 [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedRawWithNamesAndTypes)。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 1，
输入数据中的列将根据它们的名称映射到表中的列，如果设置 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 1，则未知名称的列将被跳过。
否则，第一行将被跳过。
:::

:::note
如果设置 [input_format_with_types_use_header](/operations/settings/settings-formats.md/#input_format_with_types_use_header) 为 1，
输入数据中的类型将与表中相应列的类型进行比较。否则，第二行将被跳过。
:::
