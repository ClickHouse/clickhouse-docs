---
description: 'Системная таблица, содержащая информацию о политиках и томах хранения,
  заданных в конфигурации сервера.'
keywords: ['system table', 'storage_policies']
slug: /operations/system-tables/storage_policies
title: 'system.storage_policies'
doc_type: 'reference'
---

# system.storage_policies

Содержит информацию о политиках хранения и томах, которые определены в [конфигурации сервера](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure).

Столбцы:

- `policy_name` ([String](../../sql-reference/data-types/string.md)) — Имя политики хранения.
- `volume_name` ([String](../../sql-reference/data-types/string.md)) — Имя тома, определённого в политике хранения.
- `volume_priority` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Порядковый номер тома в конфигурации, данные заполняют тома в соответствии с этим приоритетом, то есть данные при вставках и слияниях записываются на тома с более низким приоритетом (с учётом других правил: TTL, `max_data_part_size`, `move_factor`).
- `disks` ([Array(String)](../../sql-reference/data-types/array.md)) — Имена дисков, определённых в политике хранения.
- `volume_type` ([Enum8](../../sql-reference/data-types/enum.md)) — Тип тома. Может принимать одно из следующих значений:
  - `JBOD` 
  - `SINGLE_DISK`
  - `UNKNOWN`
- `max_data_part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Максимальный размер куска данных, который может храниться на дисках тома (0 — без ограничения).
- `move_factor` ([Float64](../../sql-reference/data-types/float.md)) — Отношение свободного места на диске. Когда это отношение превышает значение параметра конфигурации, ClickHouse начинает перемещать данные на следующий том по порядку.
- `prefer_not_to_merge` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Значение настройки `prefer_not_to_merge`. Должно всегда быть false. Если эта настройка включена — вы допустили ошибку.
- `perform_ttl_move_on_insert` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Значение настройки `perform_ttl_move_on_insert`. Отключает перемещение по TTL при вставке куска данных (INSERT). По умолчанию, если вставляется кусок данных, срок хранения которого уже истёк по правилу перемещения TTL, он немедленно перемещается на том/диск, указанный в правиле перемещения. Это может значительно замедлить вставку, если целевой том/диск медленный (например, S3).
- `load_balancing` ([Enum8](../../sql-reference/data-types/enum.md)) — Политика балансировки дисков. Может принимать одно из следующих значений:
  - `ROUND_ROBIN`
  - `LEAST_USED`

Если политика хранения содержит более одного тома, то информация о каждом томе хранится в отдельной строке таблицы.