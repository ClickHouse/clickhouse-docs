---
alias: []
description: 'Документация для формата CustomSeparatedWithNamesAndTypes'
input_format: true
keywords: ['CustomSeparatedWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/CustomSeparatedWithNamesAndTypes
title: 'CustomSeparatedWithNamesAndTypes'
---

| Вход | Выход | Псевдоним |
|------|-------|-----------|
| ✔    | ✔     |           |

## Описание {#description}

Также печатает две строки заголовков с названиями и типами столбцов, аналогично [TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

:::note
Если настройка [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в `1`,
столбцы из входных данных будут сопоставлены со столбцами из таблицы по их названиям; столбцы с неизвестными названиями будут пропущены, если настройка [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`.
В противном случае первая строка будет пропущена.
:::

:::note
Если настройка [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) установлена в `1`,
типы из входных данных будут сравниваться с типами соответствующих столбцов из таблицы. В противном случае вторая строка будет пропущена.
:::
