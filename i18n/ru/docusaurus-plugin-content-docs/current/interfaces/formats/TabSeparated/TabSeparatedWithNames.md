---
alias: ['TSVWithNames']
description: 'Документация для формата TabSeparatedWithNames'
input_format: true
keywords: ['TabSeparatedWithNames']
output_format: true
slug: /interfaces/formats/TabSeparatedWithNames
title: 'TabSeparatedWithNames'
---

| Входные данные | Выходные данные | Псевдоним                      |
|----------------|----------------|---------------------------------|
|     ✔          |     ✔          | `TSVWithNames`, `RawWithNames` |

## Описание {#description}

Отличается от формата [`TabSeparated`](./TabSeparated.md) тем, что имена колонок записаны в первой строке.

При парсинге ожидается, что первая строка будет содержать имена колонок. Вы можете использовать имена колонок, чтобы определить их позиции и проверить их корректность.

:::note
Если настройка [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) установлена на `1`,
колонки из входящих данных будут сопоставлены с колонками таблицы по их именам; колонки с неизвестными именами будут пропущены, если настройка [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлена на `1`.
В противном случае первая строка будет пропущена.
:::

## Пример использования {#example-usage}

## Настройки формата {#format-settings}
