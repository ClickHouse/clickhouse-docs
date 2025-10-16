---
slug: '/operations/system-tables/moves'
description: 'Системная таблица, содержащая информацию о движении частей данных'
title: system.moves
keywords: ['системная таблица', 'перемещения']
doc_type: reference
---
# system.moves

Таблица содержит информацию о текущих [перемещениях частей данных](/sql-reference/statements/alter/partition#move-partitionpart) в таблицах [MergeTree](/engines/table-engines/mergetree-family/mergetree.md). Каждое перемещение части данных представлено отдельной строкой.

Столбцы:

- `database` ([String](/sql-reference/data-types/string.md)) — Название базы данных.

- `table` ([String](/sql-reference/data-types/string.md)) — Название таблицы, содержащей перемещаемую часть данных.

- `elapsed` ([Float64](../../sql-reference/data-types/float.md)) — Время, прошедшее (в секундах) с момента начала перемещения части данных.

- `target_disk_name` ([String](disks.md)) — Название [диска](/operations/system-tables/disks/), на который перемещается часть данных.

- `target_disk_path` ([String](disks.md)) — Путь к точке монтирования [диска](/operations/system-tables/disks/) в файловой системе.

- `part_name` ([String](/sql-reference/data-types/string.md)) — Название перемещаемой части данных.

- `part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер части данных.

- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Идентификатор потока, выполняющего перемещение.

**Пример**

```sql
SELECT * FROM system.moves
```

```response
┌─database─┬─table─┬─────elapsed─┬─target_disk_name─┬─target_disk_path─┬─part_name─┬─part_size─┬─thread_id─┐
│ default  │ test2 │ 1.668056039 │ s3               │ ./disks/s3/      │ all_3_3_0 │       136 │    296146 │
└──────────┴───────┴─────────────┴──────────────────┴──────────────────┴───────────┴───────────┴───────────┘
```

**См. Также**

- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) движок таблицы
- [Использование нескольких блочных устройств для хранения данных](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)
- [ALTER TABLE ... MOVE PART](/sql-reference/statements/alter/partition#move-partitionpart) команда