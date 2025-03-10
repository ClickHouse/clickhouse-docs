---
title: CustomSeparatedWithNames
slug: /interfaces/formats/CustomSeparatedWithNames
keywords: ['CustomSeparatedWithNames']
input_format: true
output_format: true
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Также выводит строку заголовка с названиями колонок, аналогично [TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

:::note
Если настройка [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в `1`,
колонки из входных данных будут сопоставлены с колонками из таблицы по их названиям, 
колонки с неизвестными именами будут пропущены, если настройка [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`.
В противном случае первая строка будет пропущена.
:::
