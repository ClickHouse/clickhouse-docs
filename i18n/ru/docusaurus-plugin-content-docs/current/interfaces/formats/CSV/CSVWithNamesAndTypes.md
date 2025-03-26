---
alias: []
description: 'Документация для формата CSVWithNamesAndTypes'
input_format: true
keywords: ['CSVWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/CSVWithNamesAndTypes
title: 'CSVWithNamesAndTypes'
---

| Вход | Выход | Псевдоним |
|------|-------|-----------|
| ✔    | ✔     |           |

## Описание {#description}

Также выводит две строки заголовков с именами и типами столбцов, аналогично [TabSeparatedWithNamesAndTypes](../formats/TabSeparatedWithNamesAndTypes).

## Пример Использования {#example-usage}

## Настройки Формата {#format-settings}

:::note
Если настройка [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в `1`,
столбцы из входных данных будут сопоставлены со столбцами из таблицы по их именам, столбцы с неизвестными именами будут пропущены, если настройка [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`.
В противном случае первая строка будет пропущена.
:::

:::note
Если настройка [input_format_with_types_use_header](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) установлена в `1`,
типы из входных данных будут сравниваться с типами соответствующих столбцов из таблицы. В противном случае вторая строка будет пропущена.
:::
