---
alias: []
description: 'Документация для формата CustomSeparated'
input_format: true
keywords: ['CustomSeparated']
output_format: true
slug: /interfaces/formats/CustomSeparated
title: 'CustomSeparated'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Аналогично [Template](../Template/Template.md), но он выводит или считывает все имена и типы колонок и использует правила экранирования из настройки [format_custom_escaping_rule](../../../operations/settings/settings-formats.md/#format_custom_escaping_rule) и разделители из следующих настроек:

- [format_custom_field_delimiter](/operations/settings/settings-formats.md/#format_custom_field_delimiter)
- [format_custom_row_before_delimiter](/operations/settings/settings-formats.md/#format_custom_row_before_delimiter)
- [format_custom_row_after_delimiter](/operations/settings/settings-formats.md/#format_custom_row_after_delimiter)
- [format_custom_row_between_delimiter](/operations/settings/settings-formats.md/#format_custom_row_between_delimiter)
- [format_custom_result_before_delimiter](/operations/settings/settings-formats.md/#format_custom_result_before_delimiter)
- [format_custom_result_after_delimiter](/operations/settings/settings-formats.md/#format_custom_result_after_delimiter)

note:::
Он не использует настройки правил экранирования и разделители из строк формата.
:::

Существует также формат [`CustomSeparatedIgnoreSpaces`](../CustomSeparated/CustomSeparatedIgnoreSpaces.md), который аналогичен [TemplateIgnoreSpaces](../Template//TemplateIgnoreSpaces.md).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

Дополнительные настройки:

| Настройка                                                                                                                                                          | Описание                                                                                                                   | По умолчанию |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|--------------|
| [input_format_custom_detect_header](../../../operations/settings/settings-formats.md/#input_format_custom_detect_header)                                           | включает автоматическое определение заголовка с именами и типами, если таковые имеются.                                 | `true`       |
| [input_format_custom_skip_trailing_empty_lines](../../../operations/settings/settings-formats.md/#input_format_custom_skip_trailing_empty_lines)                   | пропускать пустые строки в конце файла.                                                                                    | `false`      |
| [input_format_custom_allow_variable_number_of_columns](../../../operations/settings/settings-formats.md/#input_format_custom_allow_variable_number_of_columns)     | разрешить переменное количество колонок в формате CustomSeparated, игнорировать дополнительные колонки и использовать значения по умолчанию для отсутствующих колонок. | `false`      |
