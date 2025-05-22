---
'alias': []
'description': 'CSV格式的文档'
'input_format': true
'keywords':
- 'CSVWithNames'
'output_format': true
'slug': '/interfaces/formats/CSVWithNames'
'title': 'CSVWithNames'
---

| 输入 | 输出 | 别名 |
|------|------|------|
| ✔    | ✔    |      |

## 描述 {#description}

同样打印带有列名称的标题行，类似于 [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

:::note
如果设置 [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) 为 `1`，输入数据的列将根据它们的名称映射到表的列，未知名称的列将在设置 [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 为 `1` 时被跳过。否则，第一行将被跳过。
:::
