---
title: 'JSONCompactEachRowWithNamesAndTypes'
slug: '/interfaces/formats/JSONCompactEachRowWithNamesAndTypes'
keywords: ['JSONCompactEachRowWithNamesAndTypes']
input_format: true
output_format: true
alias: []
---

| Входные данные | Выходные данные | Псевдоним |
|----------------|----------------|-----------|
| ✔              | ✔              |           |

## Описание {#description}

Отличается от формата [`JSONCompactEachRow`](./JSONCompactEachRow.md) тем, что также выводит две строки заголовка с именами и типами колонок, аналогично формату [TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

:::note
Если настройка [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в `1`,
колонки из входных данных будут отображаться на колонки таблицы по их именам; колонки с неизвестными именами будут пропущены, если настройка [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`.
В противном случае первая строка будет пропущена.
Если настройка [`input_format_with_types_use_header`](/operations/settings/settings-formats.md/#input_format_with_types_use_header) установлена в `1`,
типы из входных данных будут сопоставляться с типами соответствующих колонок из таблицы. В противном случае вторая строка будет пропущена.
:::
