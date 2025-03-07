---
description: 'Системная таблица, которая показывает содержимое кэша запросов.'
slug: /operations/system-tables/query_cache
title: 'system.query_cache'
keywords: ['system table', 'query_cache']
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Показывает содержимое [кэша запросов](../query-cache.md).

Колонки:

- `query` ([String](../../sql-reference/data-types/string.md)) — Строка запроса.
- `query_id` ([String](../../sql-reference/data-types/string.md)) — ID запроса.
- `result_size` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Размер записи кэша запроса.
- `tag` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — Тег записи кэша запроса.
- `stale` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Если запись кэша запроса устарела.
- `shared` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Если запись кэша запроса совместная для нескольких пользователей.
- `compressed` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Если запись кэша запроса сжата.
- `expires_at` ([DateTime](../../sql-reference/data-types/datetime.md)) — Когда запись кэша запроса станет устаревшей.
- `key_hash` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — Хэш строки запроса, используемый как ключ для поиска записей кэша запросов.

**Пример**

``` sql
SELECT * FROM system.query_cache FORMAT Vertical;
```

``` text
Row 1:
──────
query:       SELECT 1 SETTINGS use_query_cache = 1
query_id:    7c28bbbb-753b-4eba-98b1-efcbe2b9bdf6
result_size: 128
tag:
stale:       0
shared:      0
compressed:  1
expires_at:  2023-10-13 13:35:45
key_hash:    12188185624808016954

1 row in set. Elapsed: 0.004 sec.
```
