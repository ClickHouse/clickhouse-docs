---
description: 'Документация для формата TabSeparatedWithNamesAndTypes'
keywords: ['TabSeparatedWithNamesAndTypes']
slug: /interfaces/formats/TabSeparatedWithNamesAndTypes
title: 'TabSeparatedWithNamesAndTypes'
---

| Ввод | Вывод | Псевдоним                                   |
|------|-------|---------------------------------------------|
|     ✔   |     ✔    | `TSVWithNamesAndTypes`, `RawWithNamesAndTypes` |

## Описание {#description}

Отличается от формата [`TabSeparated`](./TabSeparated.md) тем, что имена столбцов записываются в первой строке, а типы столбцов — во второй строке.

:::note
- Если параметр [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) установлен в `1`,
столбцы из входных данных будут сопоставлены со столбцами в таблице по их именам, столбцы с неизвестными именами будут пропущены, если параметр [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлен в `1`.
В противном случае первая строка будет пропущена.
- Если параметр [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) установлен в `1`,
типы из входных данных будут сравниваться с типами соответствующих столбцов из таблицы. В противном случае вторая строка будет пропущена.
:::

## Пример использования {#example-usage}

## Настройки формата {#format-settings}
