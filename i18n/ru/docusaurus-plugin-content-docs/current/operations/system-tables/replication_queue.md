---
description: 'Системная таблица, содержащая информацию о задачах из очередей репликации, хранящихся в ClickHouse Keeper или ZooKeeper, для таблиц семейства `ReplicatedMergeTree`.'
slug: /operations/system-tables/replication_queue
title: 'system.replication_queue'
keywords: ['системная таблица', 'replication_queue']
---

Содержит информацию о задачах из очередей репликации, хранящихся в ClickHouse Keeper или ZooKeeper, для таблиц семейства `ReplicatedMergeTree`.

Колонки:

- `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных.

- `table` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы.

- `replica_name` ([String](../../sql-reference/data-types/string.md)) — Имя реплики в ClickHouse Keeper. Разные реплики одной и той же таблицы имеют разные имена.

- `position` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Позиция задачи в очереди.

- `node_name` ([String](../../sql-reference/data-types/string.md)) — Имя узла в ClickHouse Keeper.

- `type` ([String](../../sql-reference/data-types/string.md)) — Тип задачи в очереди, один из:

    - `GET_PART` — Получить часть от другой реплики.
    - `ATTACH_PART` — Подключить часть, возможно, от нашей собственной реплики (если найдена в папке `detached`). Вы можете считать это `GET_PART` с некоторыми оптимизациями, так как они почти идентичны.
    - `MERGE_PARTS` — Объединить части.
    - `DROP_RANGE` — Удалить части в указанной партиции в указанном диапазоне номеров.
    - `CLEAR_COLUMN` — ПРИМЕЧАНИЕ: Устарело. Удалить конкретную колонку из указанной партиции.
    - `CLEAR_INDEX` — ПРИМЕЧАНИЕ: Устарело. Удалить конкретный индекс из указанной партиции.
    - `REPLACE_RANGE` — Удалить определенный диапазон частей и заменить их новыми.
    - `MUTATE_PART` — Применить одну или несколько мутаций к части.
    - `ALTER_METADATA` — Применить изменение по глобальным путям /metadata и /columns.

- `create_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Дата и время, когда задача была отправлена на выполнение.

- `required_quorum` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Количество реплик, ожидающих завершения задачи с подтверждением завершения. Эта колонка актуальна только для задачи `GET_PARTS`.

- `source_replica` ([String](../../sql-reference/data-types/string.md)) — Имя исходной реплики.

- `new_part_name` ([String](../../sql-reference/data-types/string.md)) — Имя новой части.

- `parts_to_merge` ([Array](../../sql-reference/data-types/array.md) ([String](../../sql-reference/data-types/string.md))) — Имена частей для объединения или обновления.

- `is_detach` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Флаг, указывающий, находится ли задача `DETACH_PARTS` в очереди.

- `is_currently_executing` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Флаг, указывающий, выполняется ли конкретная задача в данный момент.

- `num_tries` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Количество неудачных попыток завершения задачи.

- `last_exception` ([String](../../sql-reference/data-types/string.md)) — Текстовое сообщение о последней произошедшей ошибке (если такая есть).

- `last_attempt_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Дата и время, когда задача была последний раз попытана.

- `num_postponed` ([UInt32](../../sql-reference/data-types/int-uint.md)) — Количество раз, когда действие было отложено.

- `postpone_reason` ([String](../../sql-reference/data-types/string.md)) — Причина, по которой задача была отложена.

- `last_postpone_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Дата и время, когда задача была последний раз отложена.

- `merge_type` ([String](../../sql-reference/data-types/string.md)) — Тип текущего объединения. Пусто, если это мутация.

**Пример**

``` sql
SELECT * FROM system.replication_queue LIMIT 1 FORMAT Vertical;
```

``` text
Row 1:
──────
database:               merge
table:                  visits_v2
replica_name:           mtgiga001-1t
position:               15
node_name:              queue-0009325559
type:                   MERGE_PARTS
create_time:            2020-12-07 14:04:21
required_quorum:        0
source_replica:         mtgiga001-1t
new_part_name:          20201130_121373_121384_2
parts_to_merge:         ['20201130_121373_121378_1','20201130_121379_121379_0','20201130_121380_121380_0','20201130_121381_121381_0','20201130_121382_121382_0','20201130_121383_121383_0','20201130_121384_121384_0']
is_detach:              0
is_currently_executing: 0
num_tries:              36
last_exception:         Code: 226, e.displayText() = DB::Exception: Marks file '/opt/clickhouse/data/merge/visits_v2/tmp_fetch_20201130_121373_121384_2/CounterID.mrk' does not exist (version 20.8.7.15 (official build))
last_attempt_time:      2020-12-08 17:35:54
num_postponed:          0
postpone_reason:
last_postpone_time:     1970-01-01 03:00:00
```

**Смотрите также**

- [Управление таблицами ReplicatedMergeTree](/sql-reference/statements/system#managing-replicatedmergetree-tables)
