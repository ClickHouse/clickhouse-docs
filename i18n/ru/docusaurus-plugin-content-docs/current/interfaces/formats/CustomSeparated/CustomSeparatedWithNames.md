---
alias: []
description: 'Документация для формата CustomSeparatedWithNames'
input_format: true
keywords: ['CustomSeparatedWithNames']
output_format: true
slug: /interfaces/formats/CustomSeparatedWithNames
title: 'CustomSeparatedWithNames'
---

| Вход | Выход | Псевдоним |
|------|-------|-----------|
| ✔    | ✔     |           |

## Описание {#description}

Также выводит строку заголовка с названиями столбцов, аналогично [TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

:::note
Если настройка [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в `1`,
столбцы из входных данных будут сопоставлены со столбцами из таблицы по их названиям, 
столбцы с неизвестными названиями будут пропущены, если настройка [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`.
В противном случае первая строка будет пропущена.
:::
