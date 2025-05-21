---
'description': 'JSONCompactStringsEachRowWithNamesAndTypes格式的文档'
'keywords':
- 'JSONCompactStringsEachRowWithNamesAndTypes'
'slug': '/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes'
'title': 'JSONCompactStringsEachRowWithNamesAndTypes'
---



## 描述 {#description}

与 `JSONCompactEachRow` 格式不同，它还打印两行带有列名和类型的表头，类似于 [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedRawWithNamesAndTypes)。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 被设为 1，
输入数据的列将通过其名称映射到表的列，如果设置 [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 被设为 1，则未知名称的列将被跳过。
否则，将跳过第一行。
:::

:::note
如果设置 [input_format_with_types_use_header](/operations/settings/settings-formats.md/#input_format_with_types_use_header) 被设为 1，
输入数据的类型将与表中相应列的类型进行比较。否则，将跳过第二行。
:::
