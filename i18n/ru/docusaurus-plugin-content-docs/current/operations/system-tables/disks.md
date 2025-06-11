---
description: 'Системная таблица, содержащая информацию о дисках, определённых в конфигурации сервера'
keywords: ['системная таблица', 'диски']
slug: /operations/system-tables/disks
title: 'system.disks'
---

import SystemTableCloud from '@site/i18n/docusaurus-plugin-content-docs/ru/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит информацию о дисках, определённых в [конфигурации сервера](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure).

Столбцы:

- `name` ([String](../../sql-reference/data-types/string.md)) — Имя диска в конфигурации сервера.
- `path` ([String](../../sql-reference/data-types/string.md)) — Путь к точке монтирования в файловой системе.
- `free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Доступное пространство на диске в байтах.
- `total_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Объём диска в байтах.
- `unreserved_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Доступное пространство, которое не занято резервированиями (`free_space` минус размер резервирований, занятых слияниями, вставками и другими операциями записи на диск, которые в настоящее время выполняются).
- `keep_free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Объём дискoвого пространства, который должен оставаться свободным на диске в байтах. Определяется в параметре `keep_free_space_bytes` конфигурации диска.

**Пример**

```sql
SELECT * FROM system.disks;
```

```response
┌─name────┬─path─────────────────┬───free_space─┬──total_space─┬─keep_free_space─┐
│ default │ /var/lib/clickhouse/ │ 276392587264 │ 490652508160 │               0 │
└─────────┴──────────────────────┴──────────────┴──────────────┴─────────────────┘

1 rows in set. Elapsed: 0.001 sec.
```
