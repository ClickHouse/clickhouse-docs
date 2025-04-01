---
alias: []
description: 'Документация для формата JSONCompactEachRowWithNames'
input_format: true
keywords: ['JSONCompactEachRowWithNames']
output_format: true
slug: /interfaces/formats/JSONCompactEachRowWithNames
title: 'JSONCompactEachRowWithNames'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |


## Описание {#description}

Отличается от формата [`JSONCompactEachRow`](./JSONCompactEachRow.md) тем, что также выводит строку заголовка с именами колонок, аналогично формату [`TabSeparatedWithNames`](../TabSeparated/TabSeparatedWithNames.md).


## Пример использования {#example-usage}

## Настройки формата {#format-settings}

:::note
Если настройка [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в 1, 
колонки из входных данных будут сопоставлены с колонками из таблицы по их именам, колонки с неизвестными именами будут пропущены, если настройка [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в 1. 
В противном случае первая строка будет пропущена.
:::
