---
title: '自定义分隔格式'
slug: /interfaces/formats/CustomSeparated
keywords: ['CustomSeparated']
input_format: true
output_format: true
alias: []
---

| 输入  | 输出  | 别名  |
|-------|--------|-------|
| ✔     | ✔      |       |

## 描述 {#description}

类似于 [模板](../Template/Template.md)，但它打印或读取所有列的名称和类型，并使用 [format_custom_escaping_rule](../../../operations/settings/settings-formats.md/#format_custom_escaping_rule) 设置中的转义规则和以下设置中的分隔符：

- [format_custom_field_delimiter](/operations/settings/settings-formats.md/#format_custom_field_delimiter)
- [format_custom_row_before_delimiter](/operations/settings/settings-formats.md/#format_custom_row_before_delimiter)
- [format_custom_row_after_delimiter](/operations/settings/settings-formats.md/#format_custom_row_after_delimiter)
- [format_custom_row_between_delimiter](/operations/settings/settings-formats.md/#format_custom_row_between_delimiter)
- [format_custom_result_before_delimiter](/operations/settings/settings-formats.md/#format_custom_result_before_delimiter)
- [format_custom_result_after_delimiter](/operations/settings/settings-formats.md/#format_custom_result_after_delimiter)

注意:::
它不使用格式字符串中的转义规则设置和分隔符。
:::

还有 [`CustomSeparatedIgnoreSpaces`](../CustomSeparated/CustomSeparatedIgnoreSpaces.md) 格式，它类似于 [TemplateIgnoreSpaces](../Template//TemplateIgnoreSpaces.md)。

## 示例用法 {#example-usage}

## 格式设置 {#format-settings}

其他设置：

| 设置                                                                                                                                                                   | 描述                                                                                                                       | 默认值  |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|---------|
| [input_format_custom_detect_header](../../../operations/settings/settings-formats.md/#input_format_custom_detect_header)                                               | 如果有，则启用名称和类型的头部自动检测。                                                                                   | `true`  |
| [input_format_custom_skip_trailing_empty_lines](../../../operations/settings/settings-formats.md/#input_format_custom_skip_trailing_empty_lines)                         | 跳过文件末尾的空行。                                                                                                     | `false` |
| [input_format_custom_allow_variable_number_of_columns](../../../operations/settings/settings-formats.md/#input_format_custom_allow_variable_number_of_columns)         | 允许在自定义分隔格式中使用可变数量的列，忽略额外的列并对缺失的列使用默认值。                                            | `false` |
