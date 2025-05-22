---
'alias': []
'description': '自定义分隔符带名称和类型格式的文档'
'input_format': true
'keywords':
- 'CustomSeparatedWithNamesAndTypes'
'output_format': true
'slug': '/interfaces/formats/CustomSeparatedWithNamesAndTypes'
'title': '自定义分隔符带名称和类型'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

还会打印两行包含列名称和类型的标题，类似于 [TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md)。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 的值为 `1`，
则输入数据中的列将根据其名称映射到表中的列。如果设置 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 的值为 `1`，则未识别名称的列将被跳过。
否则，第一行将被跳过。
:::

:::note
如果设置 [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) 的值为 `1`，
则输入数据中的类型将与表中对应列的类型进行比较。否则，第二行将被跳过。
:::
