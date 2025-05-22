---
'alias': []
'description': 'CustomSeparatedWithNamesAndTypes 格式的文档'
'input_format': true
'keywords':
- 'CustomSeparatedWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/CustomSeparatedWithNamesAndTypes'
'title': 'CustomSeparatedWithNamesAndTypes'
---

| 输入   | 输出   | 别名  |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

还会打印两行带有列名称和类型的标题，类似于 [TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md)。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，输入数据的列将通过它们的名称映射到表的列，如果设置 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则未知名称的列将被跳过。否则，将跳过第一行。
:::

:::note
如果设置 [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) 为 `1`，输入数据的类型将与表中相应列的类型进行比较。否则，将跳过第二行。
:::
