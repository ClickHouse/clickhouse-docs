---
description: 'Системная таблица, показывающая содержимое кэша условий запросов.'
keywords: ['системная таблица', 'кэш_условий_запросов']
slug: /operations/system-tables/query_condition_cache
title: 'system.query_condition_cache'
---

import SystemTableCloud from '@site/i18n/ru/current/_snippets/_system_table_cloud.md';


# system.query_condition_cache

<SystemTableCloud/>

Показывает содержимое [кэша условий запросов](../query-condition-cache.md).

Столбцы:

- `table_uuid` ([String](../../sql-reference/data-types/string.md)) — UUID таблицы.
- `part_name` ([String](../../sql-reference/data-types/string.md)) — Имя части.
- `condition` ([String](/sql-reference/data-types/string.md)) — Хешированное условие фильтра. Устанавливается только если настройка query_condition_cache_store_conditions_as_plaintext = true.
- `condition_hash` ([String](/sql-reference/data-types/string.md)) — Хеш условия фильтра.
- `entry_size` ([UInt64](../../sql-reference/data-types/int- uint.md)) — Размер записи в байтах.
- `matching_marks` ([String](../../sql-reference/data-types/string.md)) — Совпадающие метки.

**Пример**

``` sql
SELECT * FROM system.query_condition_cache FORMAT Vertical;
```

``` text
Row 1:
──────
table_uuid:     28270a24-ea27-49f6-99cd-97b9bee976ac
part_name:      all_1_1_0
condition:      or(equals(b, 10000_UInt16), equals(c, 10000_UInt16))
condition_hash: 5456494897146899690 -- 5.46 квинтильонов
entry_size:     40
matching_marks: 111111110000000000000000000000000000000000000000000000000111111110000000000000000

1 row in set. Elapsed: 0.004 sec.
```
