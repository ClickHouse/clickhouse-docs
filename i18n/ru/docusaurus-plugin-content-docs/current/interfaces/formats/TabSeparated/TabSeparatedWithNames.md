---
alias: ['TSVWithNames']
description: 'Документация для формата TabSeparatedWithNames'
input_format: true
keywords: ['TabSeparatedWithNames']
output_format: true
slug: /interfaces/formats/TabSeparatedWithNames
title: 'TabSeparatedWithNames'
---

| Input | Output | Alias                          |
|-------|--------|--------------------------------|
|     ✔    |     ✔     | `TSVWithNames`, `RawWithNames` |

## Description {#description}

Отличается от формата [`TabSeparated`](./TabSeparated.md) тем, что имена столбцов записаны в первой строке.

Во время парсинга ожидается, что первая строка будет содержать имена столбцов. Вы можете использовать имена столбцов для определения их позиции и для проверки их корректности.

:::note
Если параметр [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) установлен в `1`,
столбцы исходных данных будут сопоставлены со столбцами таблицы по их именам, столбцы с неизвестными именами будут пропущены, если параметр [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлен в `1`.
В противном случае первая строка будет пропущена.
:::

## Example Usage {#example-usage}

## Format Settings {#format-settings}
