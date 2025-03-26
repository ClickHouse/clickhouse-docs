---
description: 'Системная таблица, которая показывает содержание кэша условий запроса.'
keywords: ['системная таблица', 'кэш_условий_запроса']
slug: /operations/system-tables/query_condition_cache
title: 'system.query_condition_cache'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_condition_cache

<SystemTableCloud/>

Показывает содержание [кэша условий запроса](../query-condition-cache.md).

Колонки:

- `table_uuid` ([String](../../sql-reference/data-types/string.md)) — UUID таблицы.
- `part_name` ([String](../../sql-reference/data-types/string.md)) — Имя части.
- `key_hash` ([String](/sql-reference/data-types/string.md)) — Хеш условия фильтра.
- `entry_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер записи в байтах.
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
key_hash:       5456494897146899690 -- 5.46 квинтильона
entry_size:     40
matching_marks: [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

1 row in set. Elapsed: 0.004 sec.
```
