---
title: CustomSeparated
slug: /interfaces/formats/CustomSeparated
keywords: ['CustomSeparated']
input_format: true
output_format: true
alias: []
---

| Входные данные | Выходные данные | Псевдоним |
|----------------|----------------|-----------|
| ✔              | ✔              |           |

## Описание {#description}

Похож на [Template](../Template/Template.md), но выводит или считывает все имена и типы колонок и использует правила экранирования из настройки [format_custom_escaping_rule](../../../operations/settings/settings-formats.md/#format_custom_escaping_rule) и разделители из следующих настроек:

- [format_custom_field_delimiter](/operations/settings/settings-formats.md/#format_custom_field_delimiter)
- [format_custom_row_before_delimiter](/operations/settings/settings-formats.md/#format_custom_row_before_delimiter)
- [format_custom_row_after_delimiter](/operations/settings/settings-formats.md/#format_custom_row_after_delimiter)
- [format_custom_row_between_delimiter](/operations/settings/settings-formats.md/#format_custom_row_between_delimiter)
- [format_custom_result_before_delimiter](/operations/settings/settings-formats.md/#format_custom_result_before_delimiter)
- [format_custom_result_after_delimiter](/operations/settings/settings-formats.md/#format_custom_result_after_delimiter) 

note:::
Не использует настройки правил экранирования и разделители из строк формата.
:::

Существует также формат [`CustomSeparatedIgnoreSpaces`](../CustomSeparated/CustomSeparatedIgnoreSpaces.md), который похож на [TemplateIgnoreSpaces](../Template//TemplateIgnoreSpaces.md).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

Дополнительные настройки:

| Настройка                                                                                                                                                         | Описание                                                                                                                  | По умолчанию |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|--------------|
| [input_format_custom_detect_header](../../../operations/settings/settings-formats.md/#input_format_custom_detect_header)                                         | включает автоматическое обнаружение заголовка с именами и типами, если таковые имеются.                                | `true`       |
| [input_format_custom_skip_trailing_empty_lines](../../../operations/settings/settings-formats.md/#input_format_custom_skip_trailing_empty_lines)               | пропускает заключительные пустые строки в конце файла.                                                                  | `false`      |
| [input_format_custom_allow_variable_number_of_columns](../../../operations/settings/settings-formats.md/#input_format_custom_allow_variable_number_of_columns) | позволяет переменное количество колонок в формате CustomSeparated, игнорирует дополнительные колонки и использует значения по умолчанию для отсутствующих колонок. | `false`      |
