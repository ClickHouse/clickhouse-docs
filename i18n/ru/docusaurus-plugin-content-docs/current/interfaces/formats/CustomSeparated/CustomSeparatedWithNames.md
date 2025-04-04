---
alias: []
description: 'Документация для формата CustomSeparatedWithNames'
input_format: true
keywords: ['CustomSeparatedWithNames']
output_format: true
slug: /interfaces/formats/CustomSeparatedWithNames
title: 'CustomSeparatedWithNames'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

Также выводит строку заголовка с названиями колонок, аналогично [TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md).

## Example Usage {#example-usage}

## Format Settings {#format-settings}

:::note
Если настройка [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в `1`,
то колонки из входных данных будут сопоставлены с колонками из таблицы по их названиям. 
Колонки с неизвестными названиями будут пропущены, если настройка [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`.
В противном случае первая строка будет пропущена.
:::
