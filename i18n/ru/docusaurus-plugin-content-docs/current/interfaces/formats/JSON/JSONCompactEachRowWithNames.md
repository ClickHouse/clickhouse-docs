---
title: 'JSONCompactEachRowWithNames'
slug: '/interfaces/formats/JSONCompactEachRowWithNames'
keywords: ['JSONCompactEachRowWithNames']
input_format: true
output_format: true
alias: []
---

| Входные данные | Выходные данные | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |


## Описание {#description}

Отличается от формата [`JSONCompactEachRow`](./JSONCompactEachRow.md) тем, что также выводит строку заголовка с названиями колонок, подобно формату [`TabSeparatedWithNames`](../TabSeparated/TabSeparatedWithNames.md).


## Пример использования {#example-usage}

## Настройки формата {#format-settings}

:::note
Если настройка [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в 1,
колонки из входных данных будут сопоставлены с колонками из таблицы по их названиям, колонки с неизвестными именами будут пропущены, если настройка [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в 1.
В противном случае первая строка будет пропущена.
:::
