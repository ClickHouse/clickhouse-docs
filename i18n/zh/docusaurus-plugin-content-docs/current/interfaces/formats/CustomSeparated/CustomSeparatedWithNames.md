---
'alias': []
'description': 'CustomSeparatedWithNames 格式的文档'
'input_format': true
'keywords':
- 'CustomSeparatedWithNames'
'output_format': true
'slug': '/interfaces/formats/CustomSeparatedWithNames'
'title': 'CustomSeparatedWithNames'
---

| 输入 | 输出 | 别名 |
|------|------|------|
| ✔    | ✔    |      |

## 描述 {#description}

类似于 [TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md)，也会打印带有列名的标题行。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，
输入数据的列将根据其名称映射到表中的列，
如果设置 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1`，则未知名称的列将被跳过。
否则，将跳过第一行。
:::
