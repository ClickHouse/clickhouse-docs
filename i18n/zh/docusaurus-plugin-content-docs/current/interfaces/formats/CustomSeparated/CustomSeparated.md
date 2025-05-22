---
'alias': []
'description': 'CustomSeparated 格式的文档'
'input_format': true
'keywords':
- 'CustomSeparated'
'output_format': true
'slug': '/interfaces/formats/CustomSeparated'
'title': 'CustomSeparated'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

类似于 [Template](../Template/Template.md)，但它打印或读取所有列的名称和类型，并使用 [format_custom_escaping_rule](../../../operations/settings/settings-formats.md/#format_custom_escaping_rule) 设置中的转义规则和以下设置中的分隔符：

- [format_custom_field_delimiter](/operations/settings/settings-formats.md/#format_custom_field_delimiter)
- [format_custom_row_before_delimiter](/operations/settings/settings-formats.md/#format_custom_row_before_delimiter)
- [format_custom_row_after_delimiter](/operations/settings/settings-formats.md/#format_custom_row_after_delimiter)
- [format_custom_row_between_delimiter](/operations/settings/settings-formats.md/#format_custom_row_between_delimiter)
- [format_custom_result_before_delimiter](/operations/settings/settings-formats.md/#format_custom_result_before_delimiter)
- [format_custom_result_after_delimiter](/operations/settings/settings-formats.md/#format_custom_result_after_delimiter) 

note:::
它不使用格式字符串中的转义规则设置和分隔符。
:::

还有 [`CustomSeparatedIgnoreSpaces`](../CustomSeparated/CustomSeparatedIgnoreSpaces.md) 格式，类似于 [TemplateIgnoreSpaces](../Template//TemplateIgnoreSpaces.md)。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

其他设置：

| 设置                                                                                                                                                          | 描述                                                                                                                    | 默认  |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|-------|
| [input_format_custom_detect_header](../../../operations/settings/settings-formats.md/#input_format_custom_detect_header)                                       | 启用自动检测是否有名称和类型的头部。                                                                                 | `true`  |
| [input_format_custom_skip_trailing_empty_lines](../../../operations/settings/settings-formats.md/#input_format_custom_skip_trailing_empty_lines)               | 跳过文件末尾的空行。                                                                                                 | `false` |
| [input_format_custom_allow_variable_number_of_columns](../../../operations/settings/settings-formats.md/#input_format_custom_allow_variable_number_of_columns) | 允许在 CustomSeparated 格式中使用可变数量的列，忽略额外列并使用默认值填充缺失的列。                                   | `false` |
