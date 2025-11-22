---
description: 'Системная таблица, содержащая информацию о событиях, произошедших с
  кусками данных в таблицах семейства MergeTree, например, о добавлении или слиянии данных.'
keywords: ['system table', 'part_log']
slug: /operations/system-tables/part_log
title: 'system.part_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.part_log

<SystemTableCloud/>

Таблица `system.part_log` создаётся только в том случае, если указана настройка сервера [part_log](/operations/server-configuration-parameters/settings#part_log).

Эта таблица содержит информацию о событиях, произошедших с [частями данных](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) в таблицах семейства [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md), например о добавлении или слиянии данных.

Таблица `system.part_log` содержит следующие столбцы:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — имя хоста сервера, на котором выполняется запрос.
* `query_id` ([String](../../sql-reference/data-types/string.md)) — идентификатор запроса `INSERT`, который создал данную часть данных.
* `event_type` ([Enum8](../../sql-reference/data-types/enum.md)) — тип события, произошедшего с частью данных. Может принимать одно из следующих значений:
  * `NewPart` — Вставка новой части данных.
  * `MergePartsStart` — Начало слияния частей данных.
  * `MergeParts` — Завершение слияния частей данных.
  * `DownloadPart` — Загрузка части данных.
  * `RemovePart` — Удаление или отсоединение части данных с помощью [DETACH PARTITION](/sql-reference/statements/alter/partition#detach-partitionpart).
  * `MutatePartStart` — Начало мутации части данных.
  * `MutatePart` — Завершение мутации части данных.
  * `MovePart` — Перемещение части данных с одного диска на другой.
* `merge_reason` ([Enum8](../../sql-reference/data-types/enum.md)) — причина события типа `MERGE_PARTS`. Может иметь одно из следующих значений:`
  * `NotAMerge` — Текущее событие имеет тип, отличный от `MERGE_PARTS`.
  * `RegularMerge` — Обычное слияние.
  * `TTLDeleteMerge` — Удаление устаревших данных.
  * `TTLRecompressMerge` — Пересжатие части данных с использованием ...
* `merge_algorithm` ([Enum8](../../sql-reference/data-types/enum.md)) — алгоритм слияния для события типа `MERGE_PARTS`. Может принимать одно из следующих значений:
  * `Undecided`
  * `Horizontal`
  * `Vertical`
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата события.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — время события
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — время события с точностью до микросекунд.
* `duration_ms` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Длительность в миллисекундах.
* `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных, в которой находится часть данных.
* `table` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы, в которой находится часть данных.
* `table_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — UUID таблицы, к которой относится часть данных.
* `part_name` ([String](../../sql-reference/data-types/string.md)) — Имя части данных.
* `partition_id` ([String](../../sql-reference/data-types/string.md)) — идентификатор раздела, в который была вставлена часть данных. Столбец принимает значение `all`, если используется партиционирование по `tuple()`.
* `partition` ([String](../../sql-reference/data-types/string.md)) - Имя раздела.
* `part_type` ([String](../../sql-reference/data-types/string.md)) — тип части. Допустимые значения: Wide и Compact.
* `disk_name` ([String](../../sql-reference/data-types/string.md)) — имя диска, на котором размещён кусок данных.
* `path_on_disk` ([String](../../sql-reference/data-types/string.md)) — Абсолютный путь к каталогу, содержащему файлы частей данных.
* `rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — количество строк в части данных.
* `size_in_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Размер части данных в байтах.
* `merged_from` ([Array(String)](../../sql-reference/data-types/array.md)) — массив имен частей, из которых была сформирована текущая часть (после слияния).
* `bytes_uncompressed` ([UInt64](../../sql-reference/data-types/int-uint.md)) — размер несжатых данных (в байтах).
* `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество строк, прочитанных при слиянии.
* `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — количество байт, прочитанных во время слияния.
* `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — максимальная разница между объемом выделенной и освобожденной памяти в контексте этого потока.
* `error` ([UInt16](../../sql-reference/data-types/int-uint.md)) — числовой код произошедшей ошибки.
* `exception` ([String](../../sql-reference/data-types/string.md)) — Текстовое сообщение об ошибке.
* `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — счетчики ProfileEvents, измеряющие различные метрики. Их описание можно найти в таблице [system.events](/operations/system-tables/events).

Таблица `system.part_log` создается после первой операции вставки данных в таблицу `MergeTree`.

**Пример**

```sql
SELECT * FROM system.part_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
query_id:
event_type:              MergeParts
merge_reason:            RegularMerge
merge_algorithm:         Vertical
event_date:              2025-07-19
event_time:              2025-07-19 23:54:19
event_time_microseconds: 2025-07-19 23:54:19.710761
duration_ms:             2158
database:                default
table:                   github_events
table_uuid:              1ad33424-f5f5-402b-ac03-ec82282634ab
part_name:               all_1_7_1
partition_id:            all
partition:               tuple()
part_type:               Wide
disk_name:               default
path_on_disk:            ./data/store/1ad/1ad33424-f5f5-402b-ac03-ec82282634ab/all_1_7_1/
rows:                    3285726 -- 3,29 млн
size_in_bytes:           438968542 -- 438,97 млн
merged_from:             ['all_1_1_0','all_2_2_0','all_3_3_0','all_4_4_0','all_5_5_0','all_6_6_0','all_7_7_0']
bytes_uncompressed:      1373137767 -- 1,37 млрд
read_rows:               3285726 -- 3,29 млн
read_bytes:              1429206946 -- 1,43 млрд
peak_memory_usage:       303611887 -- 303,61 млн
error:                   0
exception:
ProfileEvents:           {'FileOpen':703,'ReadBufferFromFileDescriptorRead':3824,'ReadBufferFromFileDescriptorReadBytes':439601681,'WriteBufferFromFileDescriptorWrite':592,'WriteBufferFromFileDescriptorWriteBytes':438988500,'ReadCompressedBytes':439601681,'CompressedReadBufferBlocks':6314,'CompressedReadBufferBytes':1539835748,'OpenedFileCacheHits':50,'OpenedFileCacheMisses':484,'OpenedFileCacheMicroseconds':222,'IOBufferAllocs':1914,'IOBufferAllocBytes':319810140,'ArenaAllocChunks':8,'ArenaAllocBytes':131072,'MarkCacheMisses':7,'CreatedReadBufferOrdinary':534,'DiskReadElapsedMicroseconds':139058,'DiskWriteElapsedMicroseconds':51639,'AnalyzePatchRangesMicroseconds':28,'ExternalProcessingFilesTotal':1,'RowsReadByMainReader':170857759,'WaitMarksLoadMicroseconds':988,'LoadedMarksFiles':7,'LoadedMarksCount':14,'LoadedMarksMemoryBytes':728,'Merge':2,'MergeSourceParts':14,'MergedRows':3285733,'MergedColumns':4,'GatheredColumns':51,'MergedUncompressedBytes':1429207058,'MergeTotalMilliseconds':2158,'MergeExecuteMilliseconds':2155,'MergeHorizontalStageTotalMilliseconds':145,'MergeHorizontalStageExecuteMilliseconds':145,'MergeVerticalStageTotalMilliseconds':2008,'MergeVerticalStageExecuteMilliseconds':2006,'MergeProjectionStageTotalMilliseconds':5,'MergeProjectionStageExecuteMilliseconds':4,'MergingSortedMilliseconds':7,'GatheringColumnMilliseconds':56,'ContextLock':2091,'PartsLockHoldMicroseconds':77,'PartsLockWaitMicroseconds':1,'RealTimeMicroseconds':2157475,'CannotWriteToWriteBufferDiscard':36,'LogTrace':6,'LogDebug':59,'LoggerElapsedNanoseconds':514040,'ConcurrencyControlSlotsGranted':53,'ConcurrencyControlSlotsAcquired':53}
```
