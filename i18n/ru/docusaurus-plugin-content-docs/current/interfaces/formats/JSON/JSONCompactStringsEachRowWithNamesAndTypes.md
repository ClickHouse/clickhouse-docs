---
title: 'JSONCompactStringsEachRowWithNamesAndTypes'
slug: '/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes'
keywords: ['JSONCompactStringsEachRowWithNamesAndTypes']
---

## Описание {#description}

Отличается от формата `JSONCompactEachRow` тем, что также выводит две строки заголовков с именами колонок и типами, аналогично [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedRawWithNamesAndTypes).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

:::note
Если настройка [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в 1,
колонки из входных данных будут сопоставлены с колонками из таблицы по их именам, колонки с неизвестными именами будут пропущены, если настройка [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в 1.
В противном случае первая строка будет пропущена.
:::

:::note
Если настройка [input_format_with_types_use_header](/operations/settings/settings-formats.md/#input_format_with_types_use_header) установлена в 1,
типы из входных данных будут сопоставлены с типами соответствующих колонок из таблицы. В противном случае вторая строка будет пропущена.
:::
