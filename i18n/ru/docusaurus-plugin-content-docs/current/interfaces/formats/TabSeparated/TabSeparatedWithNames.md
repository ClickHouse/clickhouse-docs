---
title: TabSeparatedWithNames
slug: /interfaces/formats/TabSeparatedWithNames
keywords: ['TabSeparatedWithNames']
input_format: true
output_format: true
alias: ['TSVWithNames']
---

| Входные данные | Выходные данные | Псевдоним                   |
|----------------|----------------|-----------------------------|
|  ✔             |  ✔             | `TSVWithNames`, `RawWithNames` |

## Описание {#description}

Отличается от формата [`TabSeparated`](./TabSeparated.md) тем, что имена колонок записываются в первой строке.

При разборе ожидается, что первая строка будет содержать имена колонок. Вы можете использовать имена колонок, чтобы определить их позицию и проверить их корректность.

:::note
Если параметр [`input_format_with_names_use_header`](../../../operations/settings/settings-formats.md/#input_format_with_names_use_header) установлен в `1`, 
то колонки из входных данных будут сопоставлены с колонками таблицы по их именам, колонки с неизвестными именами будут пропущены, если параметр [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md/#input_format_skip_unknown_fields) установлен в `1`. 
В противном случае первая строка будет пропущена.
:::

## Пример использования {#example-usage}

## Настройки формата {#format-settings}
