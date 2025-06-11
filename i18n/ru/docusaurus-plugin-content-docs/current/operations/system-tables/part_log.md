---
description: 'Системная таблица, содержащая информацию о событиях, которые произошли с частями данных в таблицах семейства MergeTree, таких как добавление или слияние данных.'
keywords: ['системная таблица', 'part_log']
slug: /operations/system-tables/part_log
title: 'system.part_log'
---

import SystemTableCloud from '@site/i18n/docusaurus-plugin-content-docs/ru/current/_snippets/_system_table_cloud.md';


# system.part_log

<SystemTableCloud/>

Таблица `system.part_log` создается только в том случае, если указана серверная настройка [part_log](/operations/server-configuration-parameters/settings#part_log).

Эта таблица содержит информацию о событиях, которые произошли с [частями данных](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) в таблицах семейства [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md), таких как добавление или слияние данных.

Таблица `system.part_log` содержит следующие колонки:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `query_id` ([String](../../sql-reference/data-types/string.md)) — Идентификатор запроса `INSERT`, который создал эту часть данных.
- `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — Тип события, которое произошло с частью данных. Может иметь одно из следующих значений:
    - `NewPart` — Вставка новой части данных.
    - `MergePartsStart` — Началось слияние частей данных.
    - `MergeParts` — Слияние частей данных завершено.
    - `DownloadPart` — Загрузка части данных.
    - `RemovePart` — Удаление или отсоединение части данных с использованием [DETACH PARTITION](/sql-reference/statements/alter/partition#detach-partitionpart).
    - `MutatePartStart` — Началось изменение части данных.
    - `MutatePart` — Изменение части данных завершено.
    - `MovePart` — Перемещение части данных с одного диска на другой.
- `merge_reason` ([Enum8](../../sql-reference/data-types/enum.md)) — Причина события с типом `MERGE_PARTS`. Может иметь одно из следующих значений:
    - `NotAMerge` — Текущее событие имеет тип, отличный от `MERGE_PARTS`.
    - `RegularMerge` — Некоторое обычное слияние.
    - `TTLDeleteMerge` — Очистка истекших данных.
    - `TTLRecompressMerge` — Перекомпоновка части данных.
- `merge_algorithm` ([Enum8](../../sql-reference/data-types/enum.md)) — Алгоритм слияния для события с типом `MERGE_PARTS`. Может иметь одно из следующих значений:
    - `Undecided`
    - `Horizontal`
    - `Vertical`
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата события.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время события.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Время события с точностью до микросекунд.
- `duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Продолжительность.
- `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных, в которой находится часть данных.
- `table` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы, в которой находится часть данных.
- `part_name` ([String](../../sql-reference/data-types/string.md)) — Имя части данных.
- `partition_id` ([String](../../sql-reference/data-types/string.md)) — ID партиции, в которую была вставлена часть данных. Столбец принимает значение `all`, если парционирование выполняется по `tuple()`.
- `path_on_disk` ([String](../../sql-reference/data-types/string.md)) — Абсолютный путь к папке с файлами частей данных.
- `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество строк в части данных.
- `size_in_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер части данных в байтах.
- `merged_from` ([Array(String)](../../sql-reference/data-types/array.md)) — Массив имен частей, из которых составлена текущая часть (после слияния).
- `bytes_uncompressed` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер несжатых байтов.
- `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество строк, прочитанных во время слияния.
- `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество байтов, прочитанных во время слияния.
- `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — Максимальная разница между объемом выделенной и освобожденной памяти в контексте этого потока.
- `error` ([UInt16](../../sql-reference/data-types/int-uint.md)) — Код ошибки, которая произошла.
- `exception` ([String](../../sql-reference/data-types/string.md)) — Текстовое сообщение о произошедшей ошибке.

Таблица `system.part_log` создается после первой вставки данных в таблицу `MergeTree`.

**Пример**

```sql
SELECT * FROM system.part_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:                      clickhouse.eu-central1.internal
query_id:                      983ad9c7-28d5-4ae1-844e-603116b7de31
event_type:                    NewPart
merge_reason:                  NotAMerge
merge_algorithm:               Undecided
event_date:                    2021-02-02
event_time:                    2021-02-02 11:14:28
event_time_microseconds:       2021-02-02 11:14:28.861919
duration_ms:                   35
database:                      default
table:                         log_mt_2
part_name:                     all_1_1_0
partition_id:                  all
path_on_disk:                  db/data/default/log_mt_2/all_1_1_0/
rows:                          115418
size_in_bytes:                 1074311
merged_from:                   []
bytes_uncompressed:            0
read_rows:                     0
read_bytes:                    0
peak_memory_usage:             0
error:                         0
exception:
```
