---
slug: '/operations/system-tables/query_condition_cache'
description: 'Системная таблица, которая показывает содержащее кэш условий запросов.'
title: system.query_condition_cache
keywords: ['системная таблица', 'кэш_условий_запросов']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_condition_cache

<SystemTableCloud/>

Показывает содержимое [кэша условий запроса](../query-condition-cache.md).

Столбцы:

- `table_uuid` ([String](../../sql-reference/data-types/string.md)) — UUID таблицы.
- `part_name` ([String](../../sql-reference/data-types/string.md)) — имя части.
- `condition` ([String](/sql-reference/data-types/string.md)) — захэшированное условие фильтра. Устанавливается только если настройка query_condition_cache_store_conditions_as_plaintext = true.
- `condition_hash` ([UInt64](/sql-reference/data-types/int-uint.md)) — хеш условия фильтра.
- `entry_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — размер записи в байтах.
- `matching_marks` ([String](../../sql-reference/data-types/string.md)) — соответствующие метки.

**Пример**

```sql
SELECT * FROM system.query_condition_cache FORMAT Vertical;
```

```text
Row 1:
──────
table_uuid:     28270a24-ea27-49f6-99cd-97b9bee976ac
part_name:      all_1_1_0
condition:      or(equals(b, 10000_UInt16), equals(c, 10000_UInt16))
condition_hash: 5456494897146899690 -- 5.46 quintillion
entry_size:     40
matching_marks: 111111110000000000000000000000000000000000000000000000000111111110000000000000000

1 row in set. Elapsed: 0.004 sec.
```