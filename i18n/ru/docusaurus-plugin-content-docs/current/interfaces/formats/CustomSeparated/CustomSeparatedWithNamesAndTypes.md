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
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Также выводит две строки заголовков с именами колонок и типами, аналогично [TabSeparatedWithNamesAndTypes](../TabSeparated/TabSeparatedWithNamesAndTypes.md).

## Пример Использования {#example-usage}

## Настройки Формата {#format-settings}

:::note
Если настройка [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в `1`,
колонки из входных данных будут сопоставлены с колонками из таблицы по их именам, колонки с неизвестными именами будут пропущены, если настройка [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`.
В противном случае первая строка будет пропущена.
:::

:::note
Если настройка [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) установлена в `1`,
типы из входных данных будут сравниваться с типами соответствующих колонок из таблицы. В противном случае вторая строка будет пропущена.
:::
