---
title: CSVWithNames
slug: /interfaces/formats/CSVWithNames
keywords: ['CSVWithNames']
input_format: true
output_format: true
alias: []
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Также выводит заголовок со строками с именами колонок, аналогично [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

:::note
Если настройка [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в `1`,
колонки из входных данных будут сопоставлены с колонками таблицы по их именам, колонки с неизвестными именами будут пропущены, если настройка [input_format_skip_unknown_fields](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`.
В противном случае первая строка будет пропущена.
:::
