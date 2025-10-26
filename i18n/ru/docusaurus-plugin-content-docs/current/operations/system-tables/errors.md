---
slug: '/operations/system-tables/errors'
description: 'Система таблица, содержащая коды ошибок с количеством раз, когда они'
title: system.errors
keywords: ['системная таблица', 'ошибки']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит коды ошибок с количеством их возникновения.

Чтобы показать все возможные коды ошибок, включая те, которые не были вызваны, установите параметр [system_events_show_zero_values](../settings/settings.md#system_events_show_zero_values) в 1.

Колонки:

- `name` ([String](../../sql-reference/data-types/string.md)) — название ошибки (`errorCodeToName`).
- `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — числовой код ошибки.
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — количество возникновений этой ошибки.
- `last_error_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — время, когда произошла последняя ошибка.
- `last_error_message` ([String](../../sql-reference/data-types/string.md)) — сообщение о последней ошибке.
- `last_error_trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — [стек вызовов](https://en.wikipedia.org/wiki/Stack_trace), представляющий собой список физических адресов, где хранятся вызванные методы.
- `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — удаленное исключение (т.е. полученное во время одного из распределенных запросов).

:::note
Счетчики для некоторых ошибок могут увеличиваться во время успешного выполнения запроса. Не рекомендуется использовать эту таблицу для мониторинга сервера, если вы не уверены, что соответствующая ошибка не может быть ложным срабатыванием.
:::

**Пример**

```sql
SELECT name, code, value
FROM system.errors
WHERE value > 0
ORDER BY code ASC
LIMIT 1

┌─name─────────────┬─code─┬─value─┐
│ CANNOT_OPEN_FILE │   76 │     1 │
└──────────────────┴──────┴───────┘
```

```sql
WITH arrayMap(x -> demangle(addressToSymbol(x)), last_error_trace) AS all
SELECT name, arrayStringConcat(all, '\n') AS res
FROM system.errors
LIMIT 1
SETTINGS allow_introspection_functions=1\G
```