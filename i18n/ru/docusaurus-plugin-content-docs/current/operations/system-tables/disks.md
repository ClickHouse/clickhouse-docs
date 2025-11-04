---
slug: '/operations/system-tables/disks'
description: 'Системная таблица, содержащая информацию о DISK, определенных в файлах'
title: system.disks
keywords: ['системная таблица', 'диски']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит информацию о дисках, определенных в [конфигурации сервера](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure).

Столбцы:

- `name` ([String](../../sql-reference/data-types/string.md)) — Имя диска в конфигурации сервера.
- `path` ([String](../../sql-reference/data-types/string.md)) — Путь к точке монтирования в файловой системе.
- `free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Свободное пространство на диске в байтах.
- `total_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Объем диска в байтах.
- `unreserved_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Свободное пространство, которое не занято резервами (`free_space` минус размер резервов, занятых слияниями, вставками и другими операциями записи на диск, которые в данный момент выполняются).
- `keep_free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество дискового пространства, которое должно оставаться свободным на диске в байтах. Определено в параметре `keep_free_space_bytes` конфигурации диска.

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