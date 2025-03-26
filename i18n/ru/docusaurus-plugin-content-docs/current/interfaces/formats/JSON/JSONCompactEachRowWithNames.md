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


## Description {#description}

Отличается от формата [`JSONCompactEachRow`](./JSONCompactEachRow.md) тем, что также выводит строку заголовка с именами столбцов, аналогично формату [`TabSeparatedWithNames`](../TabSeparated/TabSeparatedWithNames.md).


## Example Usage {#example-usage}

## Format Settings {#format-settings}

:::note
Если настройка [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в 1, 
столбцы из входных данных будут сопоставлены со столбцами таблицы по их именам, столбцы с неизвестными именами будут пропущены, если настройка [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в 1. 
В противном случае первая строка будет пропущена.
:::
