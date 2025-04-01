---
description: 'Системная таблица, содержащая коды ошибок с количеством их срабатываний.'
keywords: ['системная таблица', 'ошибки']
slug: /operations/system-tables/errors
title: 'system.errors'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит коды ошибок с количеством их срабатываний.

Колонки:

- `name` ([String](../../sql-reference/data-types/string.md)) — имя ошибки (`errorCodeToName`).
- `code` ([Int32](../../sql-reference/data-types/int-uint.md)) — код ошибки.
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — количество раз, когда произошла эта ошибка.
- `last_error_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — время, когда произошла последняя ошибка.
- `last_error_message` ([String](../../sql-reference/data-types/string.md)) — сообщение для последней ошибки.
- `last_error_trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — [стек вызовов](https://en.wikipedia.org/wiki/Stack_trace), представляющий собой список физических адресов, где хранятся вызванные методы.
- `remote` ([UInt8](../../sql-reference/data-types/int-uint.md)) — удаленное исключение (т.е. полученное во время одного из распределенных запросов).

:::note
Счетчики некоторых ошибок могут увеличиваться в процессе успешного выполнения запроса. Не рекомендуется использовать эту таблицу для мониторинга сервера, если вы не уверены, что соответствующая ошибка не может быть ложноположительной.
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
