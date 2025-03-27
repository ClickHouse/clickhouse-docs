---
alias: []
description: 'Документация для формата CustomSeparated'
input_format: true
keywords: ['CustomSeparated']
output_format: true
slug: /interfaces/formats/CustomSeparated
title: 'CustomSeparated'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Похоже на [Template](../Template/Template.md), но он выводит или читает все имена и типы столбцов и использует правила экранирования из настройки [format_custom_escaping_rule](../../../operations/settings/settings-formats.md/#format_custom_escaping_rule) и разделители из следующих настроек:

- [format_custom_field_delimiter](/operations/settings/settings-formats.md/#format_custom_field_delimiter)
- [format_custom_row_before_delimiter](/operations/settings/settings-formats.md/#format_custom_row_before_delimiter)
- [format_custom_row_after_delimiter](/operations/settings/settings-formats.md/#format_custom_row_after_delimiter)
- [format_custom_row_between_delimiter](/operations/settings/settings-formats.md/#format_custom_row_between_delimiter)
- [format_custom_result_before_delimiter](/operations/settings/settings-formats.md/#format_custom_result_before_delimiter)
- [format_custom_result_after_delimiter](/operations/settings/settings-formats.md/#format_custom_result_after_delimiter)

note:::
Он не использует правила экранирования и разделители из строк формата.
:::

Существует также формат [`CustomSeparatedIgnoreSpaces`](../CustomSeparated/CustomSeparatedIgnoreSpaces.md), который похож на [TemplateIgnoreSpaces](../Template//TemplateIgnoreSpaces.md).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

Дополнительные настройки:

| Настройка                                                                                                                                                       | Описание                                                                                                                   | По умолчанию |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|--------------|
| [input_format_custom_detect_header](../../../operations/settings/settings-formats.md/#input_format_custom_detect_header)                                      | включает автоматическое определение заголовка с именами и типами, если таковые имеются.                                  | `true`       |
| [input_format_custom_skip_trailing_empty_lines](../../../operations/settings/settings-formats.md/#input_format_custom_skip_trailing_empty_lines)              | пропускает конечные пустые строки в конце файла.                                                                          | `false`      |
| [input_format_custom_allow_variable_number_of_columns](../../../operations/settings/settings-formats.md/#input_format_custom_allow_variable_number_of_columns) | разрешает переменное количество столбцов в формате CustomSeparated, игнорирует лишние столбцы и использует значения по умолчанию для отсутствующих столбцов. | `false`      |
