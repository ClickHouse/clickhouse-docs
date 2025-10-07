---
slug: '/operations/system-tables/storage_policies'
description: 'Системная таблица, содержащая информацию о политиках хранения и томах,'
title: system.storage_policies
keywords: ['системная таблица', 'storage_policies']
doc_type: reference
---
# system.storage_policies

Содержит информацию о политиках хранения и томах, которые определены в [конфигурации сервера](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure).

Столбцы:

- `policy_name` ([String](../../sql-reference/data-types/string.md)) — Название политики хранения.
- `volume_name` ([String](../../sql-reference/data-types/string.md)) — Название тома, определенного в политике хранения.
- `volume_priority` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Номер порядка тома в конфигурации, данные заполняют тома согласно этому приоритету, т.е. данные при вставках и слияниях записываются в тома с более низким приоритетом (с учетом других правил: TTL, `max_data_part_size`, `move_factor`).
- `disks` ([Array(String)](../../sql-reference/data-types/array.md)) — Названия дисков, определенные в политике хранения.
- `volume_type` ([Enum8](../../sql-reference/data-types/enum.md)) — Тип тома. Может иметь одно из следующих значений:
  - `JBOD` 
  - `SINGLE_DISK`
  - `UNKNOWN`
- `max_data_part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Максимальный размер части данных, который может храниться на дисках тома (0 — без ограничений).
- `move_factor` ([Float64](../../sql-reference/data-types/float.md)) — Соотношение свободного дискового пространства. Когда это соотношение превышает значение параметра конфигурации, ClickHouse начинает перемещать данные в следующий том по порядку.
- `prefer_not_to_merge` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Значение настройки `prefer_not_to_merge`. Должно всегда быть ложным. Когда эта настройка включена, вы допустили ошибку.
- `perform_ttl_move_on_insert` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Значение настройки `perform_ttl_move_on_insert`. — Отключает перемещение по TTL при вставке части данных. По умолчанию, если мы вставляем часть данных, которая уже истекла по правилу перемещения TTL, она немедленно отправляется в объем/диск, указанный в правиле перемещения. Это может существенно замедлить вставку, если целевой объем/диск медленный (например, S3).
- `load_balancing` ([Enum8](../../sql-reference/data-types/enum.md)) — Политика балансировки дисков. Может иметь одно из следующих значений:
  - `ROUND_ROBIN`
  - `LEAST_USED`

Если политика хранения содержит более одного тома, то информация для каждого тома хранится в отдельной строке таблицы.