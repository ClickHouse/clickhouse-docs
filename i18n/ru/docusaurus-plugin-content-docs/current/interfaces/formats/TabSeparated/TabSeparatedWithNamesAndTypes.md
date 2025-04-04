---
description: 'Документация для формата TabSeparatedWithNamesAndTypes'
keywords: ['TabSeparatedWithNamesAndTypes']
slug: /interfaces/formats/TabSeparatedWithNamesAndTypes
title: 'TabSeparatedWithNamesAndTypes'
---

| Входные данные | Выходные данные | Альяс                                        |
|----------------|----------------|----------------------------------------------|
|     ✔          |     ✔          | `TSVWithNamesAndTypes`, `RawWithNamesAndTypes` |

## Описание {#description}

Отличается от формата [`TabSeparated`](./TabSeparated.md) тем, что имена колонок записываются в первую строку, а типы колонок находятся во второй строке.

:::note
- Если настройка [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена в `1`,
колонки из входных данных будут сопоставлены с колонками в таблице по их именам; колонки с неизвестными именами будут пропущены, если настройка [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена в `1`.
В противном случае первая строка будет пропущена.
- Если настройка [`input_format_with_types_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_types_use_header) установлена в `1`,
типы из входных данных будут сравниваться с типами соответствующих колонок из таблицы. В противном случае вторая строка будет пропущена.
:::

## Пример использования {#example-usage}

## Настройки формата {#format-settings}
