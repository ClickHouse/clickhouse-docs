---
description: 'Системная таблица, содержащая информацию о политиках хранения и томах,
  определённых в конфигурации сервера.'
keywords: ['системная таблица', 'storage_policies']
slug: /operations/system-tables/storage_policies
title: 'system.storage_policies'
doc_type: 'reference'
---

# system.storage&#95;policies {#systemstorage&#95;policies}

Содержит информацию о политиках хранения и томах, которые определены в [конфигурации сервера](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure).

Столбцы:

* `policy_name` ([String](../../sql-reference/data-types/string.md)) — Имя политики хранения.
* `volume_name` ([String](../../sql-reference/data-types/string.md)) — Имя тома, определённого в политике хранения.
* `volume_priority` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Порядковый номер тома в конфигурации, данные заполняют тома в соответствии с этим приоритетом, т.е. данные во время вставок и слияний записываются на тома с более низким значением приоритета (с учётом других правил: TTL, `max_data_part_size`, `move_factor`).
* `disks` ([Array(String)](../../sql-reference/data-types/array.md)) — Имена дисков, определённых в политике хранения.
* `volume_type` ([Enum8](../../sql-reference/data-types/enum.md))  — Тип тома. Может принимать одно из следующих значений:
  * `JBOD`
  * `SINGLE_DISK`
  * `UNKNOWN`
* `max_data_part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Максимальный размер части данных, которая может быть сохранена на дисках тома (0 — без ограничений).
* `move_factor` ([Float64](../../sql-reference/data-types/float.md)) — Доля свободного дискового пространства. Когда эта доля превышает значение параметра конфигурации, ClickHouse начинает перемещать данные на следующий том по порядку.
* `prefer_not_to_merge` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Значение настройки `prefer_not_to_merge`. Всегда должно быть `false`. Если эта настройка включена, вы допустили ошибку.
* `perform_ttl_move_on_insert` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Значение настройки `perform_ttl_move_on_insert`. Отключает перемещение по TTL при вставке части данных (INSERT). По умолчанию, если вставляется часть данных, срок жизни которой уже истёк по правилу перемещения TTL, она немедленно попадает на том/диск, указанный в правиле перемещения. Это может существенно замедлить вставку, если целевой том/диск медленный (например, S3).
* `load_balancing` ([Enum8](../../sql-reference/data-types/enum.md))  — Политика балансировки нагрузки по дискам. Может принимать одно из следующих значений:
  * `ROUND_ROBIN`
  * `LEAST_USED`

Если политика хранения содержит более одного тома, то информация по каждому тому хранится в отдельной строке таблицы.