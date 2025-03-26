---
description: 'Документация для формата JSONCompactStringsEachRowWithNamesAndTypes'
keywords: ['JSONCompactStringsEachRowWithNamesAndTypes']
slug: /interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes
title: 'JSONCompactStringsEachRowWithNamesAndTypes'
---

## Описание {#description}

Отличается от формата `JSONCompactEachRow` тем, что также печатает две строки заголовка с именами и типами столбцов, аналогично [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedRawWithNamesAndTypes).

## Пример использования {#example-usage}

## Настройки формата {#format-settings}

:::note
Если настройка [input_format_with_names_use_header](/operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в 1,
столбцы из входных данных будут сопоставлены со столбцами таблицы по их именам, столбцы с неизвестными именами будут пропущены, если настройка [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в 1.
В противном случае первая строка будет пропущена.
:::

:::note
Если настройка [input_format_with_types_use_header](/operations/settings/settings-formats.md/#input_format_with_types_use_header) установлена в 1,
типы из входных данных будут сопоставляться с типами соответствующих столбцов таблицы. В противном случае вторая строка будет пропущена.
:::
