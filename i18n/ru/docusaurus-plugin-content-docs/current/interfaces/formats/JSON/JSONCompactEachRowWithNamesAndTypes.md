---
alias: []
description: 'Документация для формата JSONCompactEachRowWithNamesAndTypes'
input_format: true
keywords: ['JSONCompactEachRowWithNamesAndTypes']
output_format: true
slug: /interfaces/formats/JSONCompactEachRowWithNamesAndTypes
title: 'JSONCompactEachRowWithNamesAndTypes'
---

| Вход | Выход | Псевдоним |
|------|-------|-----------|
| ✔    | ✔     |           |

## Описание {#description}

Отличается от формата [`JSONCompactEachRow`](./JSONCompactEachRow.md) тем, что также печатает две строки заголовка с названиями и типами столбцов, аналогично формату [TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

:::note
Если настройка [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в `1`,
столбцы из входящих данных будут сопоставлены со столбцами из таблицы по их названиям, столбцы с неизвестными именами будут пропущены, если настройка [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в 1.
В противном случае первая строка будет пропущена.
Если настройка [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) установлена в `1`,
типы из входящих данных будут сравниваться с типами соответствующих столбцов из таблицы. В противном случае вторая строка будет пропущена.
:::
