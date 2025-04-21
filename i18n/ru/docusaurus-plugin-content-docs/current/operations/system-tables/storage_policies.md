---
description: 'Системная таблица, содержащая информацию о политике хранения и томах, которые определены в конфигурации сервера.'
keywords: ['системная таблица', 'storage_policies']
slug: /operations/system-tables/storage_policies
title: 'system.storage_policies'
---


# system.storage_policies

Содержит информацию о политиках хранения и томах, которые определены в [конфигурации сервера](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure).

Столбцы:

- `policy_name` ([String](../../sql-reference/data-types/string.md)) — Имя политики хранения.
- `volume_name` ([String](../../sql-reference/data-types/string.md)) — Имя тома, определенное в политике хранения.
- `volume_priority` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Номер порядка тома в конфигурации, данные заполняют тома согласно этому приоритету, т.е. данные во время вставок и слияний записываются в тома с более низким приоритетом (с учетом других правил: TTL, `max_data_part_size`, `move_factor`).
- `disks` ([Array(String)](../../sql-reference/data-types/array.md)) — Имена дисков, определенные в политике хранения.
- `volume_type` ([Enum8](../../sql-reference/data-types/enum.md))  — Тип тома. Может иметь одно из следующих значений:
    - `JBOD` 
    - `SINGLE_DISK`
    - `UNKNOWN`
- `max_data_part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Максимальный размер части данных, который может храниться на дисках тома (0 — без ограничения).
- `move_factor` ([Float64](../../sql-reference/data-types/float.md)) — Соотношение свободного места на диске. Когда это соотношение превышает значение параметра конфигурации, ClickHouse начинает перемещать данные в следующий том по порядку.
- `prefer_not_to_merge` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Значение настройки `prefer_not_to_merge`. Должно всегда быть false. Когда эта настройка включена, вы допустили ошибку.
- `perform_ttl_move_on_insert` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Значение настройки `perform_ttl_move_on_insert`. — Отключает перемещение TTL при вставке части данных. По умолчанию, если мы вставляем часть данных, которая уже истекла по правилу перемещения TTL, она немедленно перемещается в том/диск, указанный в правиле перемещения. Это может значительно замедлить вставку в случае, если целевой том/диск медленный (например, S3).
- `load_balancing` ([Enum8](../../sql-reference/data-types/enum.md))  — Политика балансировки дисков. Может иметь одно из следующих значений:
    - `ROUND_ROBIN`
    - `LEAST_USED`

Если политика хранения содержит более одного тома, то информация для каждого тома хранится в отдельной строке таблицы.
