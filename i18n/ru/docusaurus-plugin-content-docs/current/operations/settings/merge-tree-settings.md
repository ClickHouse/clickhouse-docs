---
description: 'Настройки для MergeTree, которые находятся в `system.merge_tree_settings`'
slug: /operations/settings/merge-tree-settings
title: 'Настройки таблиц MergeTree'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';

Системная таблица `system.merge_tree_settings` показывает глобально установленные настройки MergeTree.

Настройки MergeTree могут быть заданы в разделе `merge_tree` файла конфигурации сервера или указаны для каждой таблицы `MergeTree` индивидуально в предложении `SETTINGS` оператора `CREATE TABLE`.

Пример настройки `max_suspicious_broken_parts`:

Настройка по умолчанию для всех таблиц `MergeTree` в файле конфигурации сервера:

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

Установка для конкретной таблицы:

```sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

Изменение настроек для конкретной таблицы с использованием `ALTER TABLE ... MODIFY SETTING`:

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- сброс к глобальному значению по умолчанию (значение из system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```
## Настройки MergeTree {#mergetree-settings}
<!-- Настройки ниже автоматически сгенерированы скриптом на 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
-->
## adaptive_write_buffer_initial_size {#adaptive_write_buffer_initial_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`16384`|


Начальный размер адаптивного буфера записи
## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Если true, добавляет неявное ограничение для колонки `sign` таблицы CollapsingMergeTree или VersionedCollapsingMergeTree, чтобы разрешить только допустимые значения (`1` и `-1`).
## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Когда включено, добавляются мини-макси (пропускающие) индексы для всех числовых колонок таблицы.
## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Когда включено, добавляются мини-макси (пропускающие) индексы для всех строковых колонок таблицы.
## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup} 

<ExperimentalBadge/>

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Разрешить экспериментальные CLEANUP слияния для ReplacingMergeTree с колонкой `is_deleted`. Когда включено, позволяет использовать `OPTIMIZE ... FINAL CLEANUP` для ручного слияния всех частей в партиции до одной части и удаления любых удалённых строк.

Также позволяет включить такие слияния для автоматического выполнения в фоновом режиме с настройками `min_age_to_force_merge_seconds`,
`min_age_to_force_merge_on_partition_only` и
`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`.
## allow_experimental_reverse_key {#allow_experimental_reverse_key} 

<ExperimentalBadge/>

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Включает поддержку порядка сортировки по убыванию в ключах сортировки MergeTree. Эта настройка особенно полезна для анализа временных рядов и запросов Top-N, позволяя данным храниться в обратном хронологическом порядке для оптимизации производительности запросов.

С включённой `allow_experimental_reverse_key` вы можете определить порядки сортировки по убыванию в предложении `ORDER BY` таблицы MergeTree. Это позволяет использовать более эффективные оптимизации `ReadInOrder` вместо `ReadInReverseOrder` для запросов по убыванию.

**Пример**

```sql
CREATE TABLE example
(
time DateTime,
key Int32,
value String
) ENGINE = MergeTree
ORDER BY (time DESC, key)  -- Порядок по убыванию для поля 'time'
SETTINGS allow_experimental_reverse_key = 1;

SELECT * FROM example WHERE key = 'xxx' ORDER BY time DESC LIMIT 10;
```

Используя `ORDER BY time DESC` в запросе, применяется `ReadInOrder`.

**Значение по умолчанию:** false
## allow_floating_point_partition_key {#allow_floating_point_partition_key} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Разрешает использование чисел с плавающей точкой в качестве ключа партиционирования.

Возможные значения:
- `0` — Ключ партиционирования с плавающей точкой не разрешён.
- `1` — Ключ партиционирования с плавающей точкой разрешён.
## allow_nullable_key {#allow_nullable_key} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Разрешить Nullable типы в качестве первичных ключей.
## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Фоновая задача, которая уменьшает блокирующие части для таблиц с общими слияниями. Только в ClickHouse Cloud
## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication} 

<BetaBadge/>

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Не используйте эту настройку в производстве, так как она не готова.
## allow_suspicious_indices {#allow_suspicious_indices} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Отклонять первичные/вторичные индексы и ключи сортировки с одинаковыми выражениями
## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Разрешает вертикальные слияния от компактных к широким частям. Эта настройка должна иметь одинаковое значение на всех репликах.
## always_fetch_merged_part {#always_fetch_merged_part} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Если true, эта реплика никогда не сливает части и всегда загружает слитые части из других реплик.

Возможные значения:
- true, false
## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Всегда копировать данные вместо создания жестких ссылок во время мутаций/замен/отключений и так далее.
## assign_part_uuids {#assign_part_uuids} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Когда включено, для каждой новой части будет назначен уникальный идентификатор части.
Перед включением проверьте, что все реплики поддерживают UUID версии 4.
## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms} 

|Тип|По умолчанию|
|---|---|
|`Milliseconds`|`100`|


Как долго каждая итерация вставки будет ждать обновления кэша async_block_ids_cache
## async_insert {#async_insert} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Если true, данные из запроса INSERT сохраняются в очереди и позднее выгружаются в таблицу в фоновом режиме.
## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms} 

|Тип|По умолчанию|
|---|---|
|`Milliseconds`|`50`|


Целевое время выполнения одного шага слияния или мутации. Может быть превышено, если один шаг занимает больше времени
## cache_populated_by_fetch {#cache_populated_by_fetch} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


:::note
Эта настройка применима только к ClickHouse Cloud.
:::

Когда `cache_populated_by_fetch` отключен (значение по умолчанию), новые части данных загружаются в кэш только тогда, когда запускается запрос, который требует этих частей.

Если включено, `cache_populated_by_fetch` приведет к тому, что все узлы будут загружать новые части данных из хранилища в свой кэш без необходимости запроса для запуска такого действия.

**Смотрите также**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)
## check_delay_period {#check_delay_period} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`60`|

Устаревшая настройка, ничего не делает.
## check_sample_column_is_correct {#check_sample_column_is_correct} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Включает проверку при создании таблицы, что тип данных колонки для выборки или выражения выборки корректен. Тип данных должен быть одним из беззнаковых
[целочисленных типов](/sql-reference/data-types/int-uint): `UInt8`, `UInt16`,
`UInt32`, `UInt64`.

Возможные значения:
- `true`  — Проверка включена.
- `false` — Проверка отключена при создании таблицы.

Значение по умолчанию: `true`.

По умолчанию сервер ClickHouse проверяет при создании таблицы тип данных колонки для выборки или выражения выборки. Если у вас уже есть таблицы с неверным выражением выборки и вы не хотите, чтобы сервер вызывал исключение во время загрузки, установите `check_sample_column_is_correct` в `false`.
## clean_deleted_rows {#clean_deleted_rows} 

|Тип|По умолчанию|
|---|---|
|`CleanDeletedRows`|`Never`|

Устаревшая настройка, ничего не делает.
## cleanup_delay_period {#cleanup_delay_period} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`30`|


Минимальный период для очистки старых журналов очереди, хешей блоков и частей.
## cleanup_delay_period_random_add {#cleanup_delay_period_random_add} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10`|


Добавить равномерно распределённое значение от 0 до x секунд к cleanup_delay_period, чтобы избежать эффекта стада и последующего DoS ZooKeeper в случае очень большого количества таблиц.
## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`150`|


Предпочитаемый размер пакета для фоновой очистки (точки абстрактны, но 1 точка примерно эквивалентна 1 вставленному блоку).
## cleanup_threads {#cleanup_threads} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`128`|


Потоки для очистки устаревших потоков. Доступно только в ClickHouse Cloud.
## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Вычислять размеры колонок и вторичных индексов лениво при первом запросе вместо инициализации таблицы.
## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache} 


Список колонок для предварительного прогрева кэша меток (если включено). Пустой означает все колонки.
## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`134217728`|


Доступно только в ClickHouse Cloud. Максимальное количество байт для записи в одну полосу в компактных частях.
## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`128`|


Доступно только в ClickHouse Cloud. Максимальное количество гранул для записи в одну полосу в компактных частях.
## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`16777216`|


Доступно только в ClickHouse Cloud. Максимальный размер компактной части, чтобы прочитать её целиком в память во время слияния.
## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Разрешить создание таблицы с выражением выборки, не входящим в первичный ключ. Это необходимо только временно для запуска сервера с неправильными таблицами для обеспечения обратной совместимости.
## compress_marks {#compress_marks} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Метки поддерживают сжатие, уменьшают размер файла меток и ускоряют сетевую передачу.
## compress_primary_key {#compress_primary_key} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Первичный ключ поддерживает сжатие, уменьшает размер файла первичного ключа и ускоряет сетевую передачу.
## concurrent_part_removal_threshold {#concurrent_part_removal_threshold} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`100`|


Активация параллельного удаления частей (см. 'max_part_removal_threads') только если количество неактивных частей данных не менее этого значения.
## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode} 

|Тип|По умолчанию|
|---|---|
|`DeduplicateMergeProjectionMode`|`throw`|


Разрешает ли создание проекции для таблицы с неклассическим MergeTree, который не является (Replicated, Shared) MergeTree. Игнорировать эту опцию следует только для обратной совместимости, что может привести к неправильному ответу. В противном случае, если разрешено, каково действие при слиянии проекций: удалить или перестроить. Так классический MergeTree будет игнорировать эту настройку. Она также управляет `OPTIMIZE DEDUPLICATE`, но имеет эффект на всех членах семьи MergeTree. Похоже на опцию `lightweight_mutation_projection_mode`, она также является частью уровня.

Возможные значения:
- `ignore`
- `throw`
- `drop`
- `rebuild`
## detach_not_byte_identical_parts {#detach_not_byte_identical_parts} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Включает или отключает отсоединение части данных на реплике после слияния или мутации, если она не идентична по байтам данным частям на других репликах. Если отключено, часть данных удаляется. Активируйте эту настройку, если хотите проанализировать такие части позже.

Настройка применяется к таблицам `MergeTree` с включённой
[репликацией данных](/engines/table-engines/mergetree-family/replacingmergetree).

Возможные значения:

- `0` — Части удаляются.
- `1` — Части отсоединяются.
## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Не удалять старые локальные части при восстановлении потерянной реплики.

Возможные значения:
- `true`
- `false`
## disable_detach_partition_for_zero_copy_replication {#disable_detach_partition_for_zero_copy_replication} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Отключить запрос DETACH PARTITION для репликации без копирования.
## disable_fetch_partition_for_zero_copy_replication {#disable_fetch_partition_for_zero_copy_replication} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Отключить запрос FETCH PARTITION для репликации без копирования.
## disable_freeze_partition_for_zero_copy_replication {#disable_freeze_partition_for_zero_copy_replication} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Отключить запрос FREEZE PARTITION для репликации без копирования.
## disk {#disk} 

Имя диска хранения. Может быть указано вместо политики хранения.
## enable_block_number_column {#enable_block_number_column} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Включить сохранение колонки _block_number для каждой строки.
## enable_block_offset_column {#enable_block_offset_column} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Сохраняет виртуальную колонку `_block_number` при слияниях.
## enable_index_granularity_compression {#enable_index_granularity_compression} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Сжимать в памяти значения гранулярности индекса, если это возможно.
## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Если настройки `min_age_to_force_merge_seconds` и
`min_age_to_force_merge_on_partition_only` должны учитывать настройку
`max_bytes_to_merge_at_max_space_in_pool`.

Возможные значения:
- `true`
- `false`
## enable_mixed_granularity_parts {#enable_mixed_granularity_parts} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Включает или отключает переход к контролю размера гранулы с помощью настройки
`index_granularity_bytes`. До версии 19.11 существовала только настройка
`index_granularity` для ограничения размера гранулы. Настройка
`index_granularity_bytes` улучшает производительность ClickHouse при
выборке данных из таблиц с большими строками (десятки и сотни мегабайт).
Если у вас есть таблицы с большими строками, вы можете включить эту настройку для таблиц, чтобы улучшить эффективность запросов `SELECT`.
## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge} 

<ExperimentalBadge/>

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Использовать ли CLEANUP слияния для ReplacingMergeTree при слиянии партиций
до одной части. Требуются включенные `allow_experimental_replacing_merge_with_cleanup`,
`min_age_to_force_merge_seconds` и `min_age_to_force_merge_on_partition_only`.

Возможные значения:
- `true`
- `false`
## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Включить идентификатор конечной точки с префиксом имени ZooKeeper для таблицы реплицированного merge tree.
## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1`|


Включить использование алгоритма вертикального слияния.
## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Если эта настройка включена для целевой таблицы запроса манипуляции партицией
(`ATTACH/MOVE/REPLACE PARTITION`), индексы и проекции должны быть
идентичными между исходными и целевыми таблицами. В противном случае целевая
таблица может иметь надмножество индексов и проекций исходной таблицы.
## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Если включено, будет использоваться оцениваемый фактический размер частей данных (т.е., исключая те строки, которые были удалены через `DELETE FROM`) при выборе частей для слияния. Обратите внимание, что это поведение вызывается только для частей данных, затронутых `DELETE FROM`, выполненным после включения этой настройки.

Возможные значения:
- `true`
- `false`

**Смотрите также**
- Настройка [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts)
## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`0`|


Когда это значение больше нуля, только одна реплика начинает
слияние немедленно, а другие реплики ждут до этого времени для
скачивания результата вместо выполнения слияний локально. Если выбранная реплика
не завершает слияние в указанное время, происходит откат к стандартному
поведению.

Возможные значения:
- Любое положительное целое число.
## fault_probability_after_part_commit {#fault_probability_after_part_commit} 

|Тип|По умолчанию|
|---|---|
|`Float`|`0`|


Для тестирования. Не изменяйте это.
## fault_probability_before_part_commit {#fault_probability_before_part_commit} 

|Тип|По умолчанию|
|---|---|
|`Float`|`0`|


Для тестирования. Не изменяйте это.
## finished_mutations_to_keep {#finished_mutations_to_keep} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`100`|


Сколько записей о завершённых мутациях сохранять. Если ноль, то сохранять все.
## force_read_through_cache_for_merges {#force_read_through_cache_for_merges} 

<ExperimentalBadge/>

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Принудительное чтение через файловую систему кэша для слияний.
## fsync_after_insert {#fsync_after_insert} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Выполнять fsync для каждой вставленной части. Значительно снижает производительность
вставок, не рекомендуется использовать с широкими частями.
## fsync_part_directory {#fsync_part_directory} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Выполнять fsync для директории части после всех операций с частями (записи, переименования и т.д.).
## in_memory_parts_enable_wal {#in_memory_parts_enable_wal} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|

Устаревшая настройка, ничего не делает.
## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|

Устаревшая настройка, ничего не делает.
## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Если количество неактивных частей в одной партиции таблицы превышает
значение `inactive_parts_to_delay_insert`, операция `INSERT` искусственно
замедляется.

:::tip
Это полезно, когда сервер не успевает быстро очистить части.
:::

Возможные значения:
- Любое положительное целое число.
## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Если количество неактивных частей в одной партиции превышает
значение `inactive_parts_to_throw_insert`, операция `INSERT` прерывается с
следующей ошибкой:

> "Слишком много неактивных частей (N). Очистка частей происходит значительно
медленнее, чем вставка" исключение."

Возможные значения:
- Любое положительное целое число.
## index_granularity {#index_granularity} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`8192`|


Максимальное количество строк данных между метками индекса. То есть, сколько строк
соответствует одному значению первичного ключа.
## index_granularity_bytes {#index_granularity_bytes} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10485760`|


Максимальный размер гранул данных в байтах.

Чтобы ограничить размер гранулы только по количеству строк, установите `0` (не рекомендуется).
## initialization_retry_period {#initialization_retry_period} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`60`|


Период повторной попытки инициализации таблицы в секундах.
## kill_delay_period {#kill_delay_period} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`30`|

Устаревшая настройка, ничего не делает.
## kill_delay_period_random_add {#kill_delay_period_random_add} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10`|

Устаревшая настройка, ничего не делает.
## kill_threads {#kill_threads} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`128`|

Устаревшая настройка, ничего не делает.
## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode} 

|Тип|По умолчанию|
|---|---|
|`LightweightMutationProjectionMode`|`throw`|


По умолчанию легковесное удаление `DELETE` не работает для таблиц с проекциями. Это связано с тем, что строки в проекции могут быть затронуты операцией `DELETE`. Поэтому значение по умолчанию будет `throw`. Однако этот параметр может изменить поведение. Со значением `drop` или `rebuild` удаления будут работать с проекциями. `drop` удалит проекцию, поэтому это может быть быстро в текущем запросе, когда проекция удалена, но медленно в будущих запросах, так как проекция не привязана. `rebuild` перестроит проекцию, что может повлиять на производительность текущего запроса, но может ускорить будущие запросы. Хорошая новость заключается в том, что эти параметры будут работать только на уровне частей, что означает, что проекции в частях, которые не затрагиваются, останутся нетронутыми и не вызовут никаких действий, таких как удаление или перестройка.

Возможные значения:
- `throw`
- `drop`
- `rebuild`
## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Если включено вместе с [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge),
число удалённых строк для существующих частей данных будет рассчитываться при старте таблицы. Обратите внимание, что это может замедлить загрузку таблицы при старте.

Возможные значения:
- `true`
- `false`

**Смотрите также**
- Настройка [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge)
## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`120`|


Для фоновых операций, таких как слияния, мутации и т.д. Сколько секунд до сбоя в получении блокировок таблицы.
## marks_compress_block_size {#marks_compress_block_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`65536`|


Размер блока сжатия меток, фактический размер блока для сжатия.
## marks_compression_codec {#marks_compression_codec} 

|Тип|По умолчанию|
|---|---|
|`String`|`ZSTD(3)`|


Кодек сжатия, используемый метками; метки достаточно малы и кэшируются, поэтому
по умолчанию используется ZSTD(3).
## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Когда включено, слияния создают и сохраняют пропускающие индексы для новых частей.
В противном случае они могут быть созданы/сохранены с помощью явного MATERIALIZE INDEX.
## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Только пересчитывать информацию ttl, когда MATERIALIZE TTL.
## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1073741824`|


Проверка "слишком много частей" в соответствии с 'parts_to_delay_insert' и
'parts_to_throw_insert' будет активна только если средний размер части (в соответствующей партиции) не превышает заданный порог. Если превышает, вставки не будут задерживаться или отклоняться. Это позволяет иметь сотни терабайт в одной таблице на одном сервере, если части успешно соединяются в более крупные части. Это не влияет на пороги для неактивных частей или общего числа частей.
## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`161061273600`|


Максимальный общий размер частей (в байтах), которые могут быть объединены в одну часть, если есть достаточные ресурсы. Это примерно соответствует максимальному возможному размеру части, созданной автоматическим фоновым слиянием.

Возможные значения:

- Любое положительное целое число.

Планировщик слияний периодически анализирует размеры и количество частей в партициях, и если в пуле достаточно свободных ресурсов, он начинает фоновые слияния. Слияния происходят, пока общий размер исходных частей не превышает `max_bytes_to_merge_at_max_space_in_pool`.

Слияния, инициированные [OPTIMIZE FINAL](/sql-reference/statements/optimize), игнорируют `max_bytes_to_merge_at_max_space_in_pool` (учитывается только свободное дисковое пространство).
## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1048576`|


Максимальный общий размер части (в байтах), который может быть объединен в одну часть, при минимально доступных ресурсах в фоновом пуле.

Возможные значения:
- Любое положительное целое число.

`max_bytes_to_merge_at_min_space_in_pool` определяет максимальный общий размер частей, которые могут быть объединены, несмотря на нехватку доступного дискового пространства (в пуле).
Это необходимо для уменьшения количества малых частей и шанса ошибок "Слишком много частей".
Слияния резервируют дисковое пространство, удваивая общий размер сливаемых частей.
Таким образом, при малом количестве свободного дискового пространства может возникнуть ситуация, когда свободное пространство уже забронировано текущими крупными слияниями, так что другие слияния не могут быть запущены, и количество малых частей возрастает с каждой вставкой.
## max_cleanup_delay_period {#max_cleanup_delay_period} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`300`|


Максимальный период для очистки старых журналов очереди, блоков хешей и частей.
## max_compress_block_size {#max_compress_block_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Максимальный размер блоков несжатых данных перед сжатием для записи в таблицу. Вы также можете указать эту настройку в глобальных настройках
(см. [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size)
настройка). Значение, указанное при создании таблицы, переопределяет глобальное значение для этой настройки.
## max_concurrent_queries {#max_concurrent_queries} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Максимальное количество одновременно выполняемых запросов, связанных с таблицей MergeTree.
Запросы все еще будут ограничены другими настройками `max_concurrent_queries`.

Возможные значения:
- Положительное целое число.
- `0` — Без предела.

Значение по умолчанию: `0` (без предела).

**Пример**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```
## max_delay_to_insert {#max_delay_to_insert} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1`|


Значение в секундах, используемое для вычисления задержки `INSERT`, если
количество активных частей в одной партиции превышает значение
[parts_to_delay_insert](#parts_to_delay_insert).

Возможные значения:
- Любое положительное целое число.

Задержка (в миллисекундах) для `INSERT` рассчитывается по формуле:

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```
Например, если в партиции 299 активных частей, а parts_to_throw_insert
= 300, parts_to_delay_insert = 150, max_delay_to_insert = 1, `INSERT` задерживается на `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000`
миллисекунд.

Начиная с версии 23.1 формула была изменена на:

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

Например, если в партиции 224 активных частей, а parts_to_throw_insert 
= 300, parts_to_delay_insert = 150, max_delay_to_insert = 1,
min_delay_to_insert_ms = 10, `INSERT` задерживается на `max( 10, 1 * 1000 *
(224 - 150 + 1) / (300 - 150) ) = 500` миллисекунд.
## max_delay_to_mutate_ms {#max_delay_to_mutate_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000`|


Максимальная задержка мутирующей таблицы MergeTree в миллисекундах, если существует множество незавершённых мутаций.
## max_digestion_size_per_segment {#max_digestion_size_per_segment} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`268435456`|


Максимальное количество байт для обработки на сегмент для построения GIN-индекса.
## max_file_name_length {#max_file_name_length} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`127`|


Максимальная длина имени файла, чтобы оставить его как есть без хеширования.
Влияет только в том случае, если настройка `replace_long_file_name_to_hash` включена.
Значение этой настройки не включает длину расширения файла. Поэтому рекомендуется устанавливать его ниже максимальной длины имени файла (обычно 255
байт) с зазором, чтобы избежать ошибок файловой системы.
## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`75`|


Не применять ALTER, если количество файлов для модификации (удаления, добавления)
больше этой настройки.

Возможные значения:

- Любое положительное целое число.

Значение по умолчанию: 75
## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`50`|


Не применять ALTER, если количество файлов для удаления больше этой
настройки.

Возможные значения:
- Любое положительное целое число.
## max_merge_delayed_streams_for_parallel_write {#max_merge_delayed_streams_for_parallel_write} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`40`|


Максимальное количество потоков (колонок), которые могут быть очищены параллельно
(аналог max_insert_delayed_streams_for_parallel_write для слияний). Работает
только для вертикальных слияний.
## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`60000`|

Максимальное время ожидания перед повторной попыткой выбрать части для слияния после того, как части не были выбраны. Более низкая настройка будет часто инициировать задачи выбора в `background_schedule_pool`, что приводит к большому количеству запросов к ZooKeeper в крупных кластерах.

## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`2`|

Когда в пуле больше указанного количества слияний с записями TTL, новые слияния с TTL назначаться не будут. Это необходимо для того, чтобы оставить свободные потоки для обычных слияний и избежать ошибки «Слишком много частей».

## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Ограничивает количество мутаций частей на реплику до указанного значения. Ноль означает отсутствие ограничения на количество мутаций на реплику (выполнение все еще может быть ограничено другими настройками).

## max_part_loading_threads {#max_part_loading_threads} 

|Тип|По умолчанию|
|---|---|
|`MaxThreads`|`'auto(14)'`|

Устаревшая настройка, ничего не делает.

## max_part_removal_threads {#max_part_removal_threads} 

|Тип|По умолчанию|
|---|---|
|`MaxThreads`|`'auto(14)'`|

Устаревшая настройка, ничего не делает.

## max_partitions_to_read {#max_partitions_to_read} 

|Тип|По умолчанию|
|---|---|
|`Int64`|`-1`|

Ограничивает максимальное количество партиций, которые можно получить в одном запросе.

Значение настройки, указанное при создании таблицы, может быть переопределено на уровне запроса.

Возможные значения:
- Любое положительное целое число.

Вы также можете указать настройку сложности запроса [max_partitions_to_read](query-complexity#max_partitions_to_read) на уровне запроса / сессии / профиля.

## max_parts_in_total {#max_parts_in_total} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`100000`|

Если общее количество активных частей во всех партициях таблицы превышает значение `max_parts_in_total`, `INSERT` будет прерван с исключением `Слишком много частей (N)`.

Возможные значения:
- Любое положительное целое число.

Большое количество частей в таблице снижает производительность запросов ClickHouse и увеличивает время загрузки ClickHouse. Чаще всего это является следствием неправильного проектирования (ошибки при выборе стратегии партиционирования - слишком маленькие партиции).

## max_parts_to_merge_at_once {#max_parts_to_merge_at_once} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`100`|

Максимальное количество частей, которые могут быть объединены одновременно (0 - отключено). Не влияет на запрос `OPTIMIZE FINAL`.

## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`300000`|

Максимальное время отсрочки для неудачных мутаций.

## max_projections {#max_projections} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`25`|

Максимальное количество проекций слияния дерева.

## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Ограничивает максимальную скорость обмена данными по сети в байтах в секунду для [реплицированных](../../engines/table-engines/mergetree-family/replication.md) выборок. Эта настройка применяется к конкретной таблице, в отличие от настройки [`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth), которая применяется к серверу.

Вы можете ограничить как сетевой трафик сервера, так и сетевой трафик для конкретной таблицы, но для этого значение настройки на уровне таблицы должно быть меньше значения на уровне сервера. В противном случае сервер учитывает только настройку `max_replicated_fetches_network_bandwidth_for_server`.

Настройка не всегда соблюдается точно.

Возможные значения:
- Положительное целое число.
- `0` — Неограничено.

Значение по умолчанию: `0`.

**Использование**

Может быть использовано для ограничения скорости при репликации данных для добавления или замены новых узлов.

## max_replicated_logs_to_keep {#max_replicated_logs_to_keep} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000`|

Сколько записей может быть в журнале ClickHouse Keeper, если есть неактивная реплика. Неактивная реплика становится потерянной, когда это число превышено.

Возможные значения:
- Любое положительное целое число.

## max_replicated_merges_in_queue {#max_replicated_merges_in_queue} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000`|

Сколько задач слияния и мутации частей разрешено одновременно в очереди ReplicatedMergeTree.

## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1`|

Сколько задач слияния частей с TTL разрешено одновременно в очереди ReplicatedMergeTree.

## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`8`|

Сколько задач мутации частей разрешено одновременно в очереди ReplicatedMergeTree.

## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Ограничивает максимальную скорость обмена данными по сети в байтах в секунду для [реплицированных](/engines/table-engines/mergetree-family/replacingmergetree) отправок. Эта настройка применяется к конкретной таблице, в отличие от настройки [`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth), которая применяется к серверу.

Вы можете ограничить как сетевой трафик сервера, так и сетевой трафик для конкретной таблицы, но для этого значение настройки на уровне таблицы должно быть меньше значения на уровне сервера. В противном случае сервер учитывает только настройку `max_replicated_sends_network_bandwidth_for_server`.

Настройка не всегда соблюдается точно.

Возможные значения:
- Положительное целое число.
- `0` — Неограничено.

**Использование**

Может быть использовано для ограничения скорости при репликации данных для добавления или замены новых узлов.

## max_suspicious_broken_parts {#max_suspicious_broken_parts} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`100`|

Если количество сломанных частей в одной партиции превышает значение `max_suspicious_broken_parts`, автоматическое удаление запрещено.

Возможные значения:
- Любое положительное целое число.

## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1073741824`|

Максимальный размер всех сломанных частей, если больше - запретить автоматическое удаление.

Возможные значения:
- Любое положительное целое число.

## merge_max_block_size {#merge_max_block_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`8192`|

Количество строк, которые читаются из объединяемых частей в память.

Возможные значения:
- Любое положительное целое число.

Слияние читает строки из частей в блоках по `merge_max_block_size` строк, затем объединяет и записывает результат в новую часть. Читаемый блок помещается в ОЗУ, поэтому `merge_max_block_size` влияет на размер необходимой ОЗУ для слияния. Таким образом, слияния могут потреблять большое количество ОЗУ для таблиц с очень широкими строками (если средний размер строки составляет 100 КБ, то при слиянии 10 частей (100 КБ * 10 * 8192) = ~ 8 ГБ ОЗУ). Уменьшая `merge_max_block_size`, вы можете уменьшить количество ОЗУ, необходимое для слияния, но замедлите само слияние.

## merge_max_block_size_bytes {#merge_max_block_size_bytes} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10485760`|

Сколько байт в блоках должно быть сформировано для операций слияния. По умолчанию имеет то же значение, что и `index_granularity_bytes`.

## merge_max_bytes_to_prewarm_cache {#merge_max_bytes_to_prewarm_cache} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1073741824`|

Доступно только в ClickHouse Cloud. Максимальный размер части (компактной или упакованной), чтобы предварительно разогреть кеш во время слияния.

## merge_selecting_sleep_ms {#merge_selecting_sleep_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`5000`|

Минимальное время ожидания перед повторной попыткой выбрать части для слияния после того, как части не были выбраны. Более низкая настройка будет часто инициировать задачи выбора в `background_schedule_pool`, что приводит к большому количеству запросов к ZooKeeper в крупных кластерах.

## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor} 

|Тип|По умолчанию|
|---|---|
|`Float`|`1.2`|

Время ожидания для задачи выбора слияния умножается на этот коэффициент, когда нечего объединять, и делится, когда слияние было назначено.

## merge_selector_algorithm {#merge_selector_algorithm} 

<ExperimentalBadge/>

|Тип|По умолчанию|
|---|---|
|`MergeSelectorAlgorithm`|`Simple`|

Алгоритм выбора частей для назначения слияний.

## merge_selector_base {#merge_selector_base} 

|Тип|По умолчанию|
|---|---|
|`Float`|`5`|

Влияет на увеличение записи назначенных слияний (настройка уровня экспертов, не изменяйте, если не понимаете, что она делает). Работает для простых и стохастических простых селекторов слияния.

## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Контролирует, когда логика начинает действовать относительно количества частей в партиции. Чем больше коэффициент, тем более запоздалая реакция будет.

## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|

Включает эвристику для выбора частей для слияния, которая удаляет части с правой стороны диапазона, если их размер меньше указанного отношения (0.01) от sum_size. Работает для простых и стохастических простых селекторов слияния.

## merge_selector_window_size {#merge_selector_window_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000`|

Сколько частей рассматривать одновременно.

## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`16106127360`|

Доступно только в ClickHouse Cloud. Максимальный размер частей в целом, чтобы предварительно разогреть кеш во время слияния.

## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`2592000`|

Устаревшая настройка, ничего не делает.

## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1`|

Устанавливает интервал в секундах для ClickHouse для выполнения очистки старых частей, WAL и мутаций.

Возможные значения:
- Любое положительное целое число.

## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`60`|

Устанавливает интервал в секундах для ClickHouse для выполнения очистки старых временных каталогов.

Возможные значения:
- Любое положительное целое число.

## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Устаревшая настройка, ничего не делает.

## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 

|Тип|По умолчанию|
|---|---|
|`Int64`|`14400`|

Минимальная задержка в секундах перед повторным слиянием с рекомпрессией TTL.

## merge_with_ttl_timeout {#merge_with_ttl_timeout} 

|Тип|По умолчанию|
|---|---|
|`Int64`|`14400`|

Минимальная задержка в секундах перед повторным слиянием с удалением TTL.

## merge_workload {#merge_workload} 

Используется для регулирования того, как ресурсы используются и распределяются между слияниями и другими рабочими нагрузками. Указанное значение используется как значение настройки `workload` для фоновых слияний этой таблицы. Если не указано (пустая строка), то вместо этого используется настройка сервера `merge_workload`.

**Смотрите также**
- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)

## min_absolute_delay_to_close {#min_absolute_delay_to_close} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Минимальная абсолютная задержка для закрытия, остановки обслуживания запросов и недопущения возврата Ok во время проверки статуса.

## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|

Применяется ли `min_age_to_force_merge_seconds` только к всей партиции, а не к ее подмножеству.

По умолчанию игнорирует настройку `max_bytes_to_merge_at_max_space_in_pool` (см. `enable_max_bytes_limit_for_min_age_to_force_merge`).

Возможные значения:
- true, false

## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Объединить части, если каждая часть в диапазоне старше значения `min_age_to_force_merge_seconds`.

По умолчанию игнорирует настройку `max_bytes_to_merge_at_max_space_in_pool` (см. `enable_max_bytes_limit_for_min_age_to_force_merge`).

Возможные значения:
- Положительное целое число.

## min_bytes_for_compact_part {#min_bytes_for_compact_part} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Устаревшая настройка, ничего не делает.

## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Доступно только в ClickHouse Cloud. Минимальный необработанный размер в байтах, чтобы использовать полный тип хранения для части данных вместо упакованного.

## min_bytes_for_wide_part {#min_bytes_for_wide_part} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10485760`|

Минимальное количество байт/строк в части данных, которые можно хранить в формате `Wide`. Вы можете установить одно, оба или ни одно из этих настроек.

## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Минимальный размер (необработанные байты), чтобы предварительно разогреть кеш меток и кеш первичного индекса для новых частей.

## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Устанавливает минимальное количество байт для включения балансировки при распределении новых больших частей по дискам объемов [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures).

Возможные значения:
- Положительное целое число.
- `0` — Балансировка отключена.

**Использование**

Значение настройки `min_bytes_to_rebalance_partition_over_jbod` не должно быть меньше значения [max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) / 1024. В противном случае ClickHouse сгенерирует исключение.

## min_compress_block_size {#min_compress_block_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Минимальный размер блоков необработанных данных, необходимых для сжатия при записи следующей метки. Вы также можете указать эту настройку в глобальных настройках (см. настройку [min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size)). Значение, указанное при создании таблицы, переопределяет глобальное значение для этой настройки.

## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Минимальное количество сжатых байт для выполнения fsync для части после извлечения (0 - отключено).

## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Минимальное количество сжатых байт для выполнения fsync для части после слияния (0 - отключено).

## min_delay_to_insert_ms {#min_delay_to_insert_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10`|

Минимальная задержка вставки данных в таблицу MergeTree в миллисекундах, если есть много несоединившихся частей в одной партиции.

## min_delay_to_mutate_ms {#min_delay_to_mutate_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10`|

Минимальная задержка мутации таблицы MergeTree в миллисекундах, если есть много незавершенных мутаций.

## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Минимальное количество байт, которые должны быть свободны в дисковом пространстве, чтобы вставить данные. Если количество доступных свободных байт меньше `min_free_disk_bytes_to_perform_insert`, то выбрасывается исключение и вставка не выполняется. Обратите внимание, что эта настройка:
- учитывает настройку `keep_free_space_bytes`.
- не учитывает количество данных, которые будут записаны операцией `INSERT`.
- проверяется только в случае, если указано положительное (не нулевое) количество байт.

Возможные значения:
- Любое положительное целое число.

:::note
Если указаны как `min_free_disk_bytes_to_perform_insert`, так и `min_free_disk_ratio_to_perform_insert`, ClickHouse будет ориентироваться на значение, которое позволяет выполнить вставки при большем объеме свободной памяти.
:::

## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 

|Тип|По умолчанию|
|---|---|
|`Float`|`0`|

Минимальное соотношение свободного к общему дисковому пространству для выполнения `INSERT`. Должно быть числом с плавающей запятой в диапазоне от 0 до 1. Обратите внимание, что эта настройка:
- учитывает настройку `keep_free_space_bytes`.
- не учитывает количество данных, которые будут записаны операцией `INSERT`.
- проверяется только в случае, если указан положительный (не нулевой) коэффициент.

Возможные значения:
- Float, 0.0 - 1.0.

Обратите внимание, что если указаны как `min_free_disk_ratio_to_perform_insert`, так и `min_free_disk_bytes_to_perform_insert`, ClickHouse будет ориентироваться на значение, которое позволяет выполнить вставки при большем объеме свободной памяти.

## min_index_granularity_bytes {#min_index_granularity_bytes} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1024`|

Минимальный допустимый размер данных гранул в байтах.

Чтобы обеспечить защиту от случайного создания таблиц с очень низким `index_granularity_bytes`.

## min_marks_to_honor_max_concurrent_queries {#min_marks_to_honor_max_concurrent_queries} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Минимальное количество меток, считанных запросом, для применения настройки [max_concurrent_queries](#max_concurrent_queries).

:::note
Запросы по-прежнему будут ограничены другими настройками `max_concurrent_queries`.
:::

Возможные значения:
- Положительное целое число.
- `0` — Отключено (`max_concurrent_queries` ограничение не применяется ни к одному запросу).

**Пример**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```

## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10737418240`|

Минимальный объем данных для операции слияния, необходимый для использования прямого доступа к диску хранения. При слиянии частей данных ClickHouse рассчитывает общий объем хранения всех данных, которые будут объединены. Если объем превышает `min_merge_bytes_to_use_direct_io` байт, ClickHouse читает и записывает данные на диск хранения, используя интерфейс прямого доступа (`O_DIRECT` опция). Если `min_merge_bytes_to_use_direct_io = 0`, то прямой доступ отключен.

## min_parts_to_merge_at_once {#min_parts_to_merge_at_once} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Минимальное количество частей данных, которые селектор слияния может выбрать для объединения одновременно (настройка уровня экспертов, не изменяйте, если не понимаете, что она делает). 0 - отключено. Работает для простых и стохастических простых селекторов слияния.

## min_relative_delay_to_close {#min_relative_delay_to_close} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`300`|

Минимальная задержка от других реплик для закрытия, остановки обслуживания запросов и недопущения возврата Ok во время проверки статуса.

## min_relative_delay_to_measure {#min_relative_delay_to_measure} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`120`|

Расчет относительной задержки реплики только в том случае, если абсолютная задержка не менее этого значения.

## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`120`|

Устаревшая настройка, ничего не делает.

## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10`|

Сохранять около этого числа последних записей в журнале ZooKeeper, даже если они устарели. Это не влияет на работу таблиц: используется только для диагностики журнала ZooKeeper перед очисткой.

Возможные значения:
- Любое положительное целое число.

## min_rows_for_compact_part {#min_rows_for_compact_part} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Устаревшая настройка, ничего не делает.

## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Доступно только в ClickHouse Cloud. Минимальное количество строк для использования полного типа хранения для части данных вместо упакованного.

## min_rows_for_wide_part {#min_rows_for_wide_part} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Минимальное количество строк для создания части в широком формате вместо компактного.

## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Минимальное количество строк для выполнения fsync для части после слияния (0 - отключено).

## mutation_workload {#mutation_workload} 

Используется для регулирования того, как ресурсы используются и распределяются между мутациями и другими рабочими нагрузками. Указанное значение используется как значение настройки `workload` для фоновых мутаций этой таблицы. Если не указано (пустая строка), то вместо этого используется настройка сервера `mutation_workload`.

**Смотрите также**
- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)

## non_replicated_deduplication_window {#non_replicated_deduplication_window} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Количество недавно вставленных блоков в нереплицированной таблице [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md), для которых хранятся контрольные суммы для проверки на дубликаты.

Возможные значения:
- Любое положительное целое число.
- `0` (отключить дедупликацию).

Механизм дедупликации используется, аналогично реплицированным таблицам (см. настройку [replicated_deduplication_window](#replicated_deduplication_window)). Контрольные суммы созданных частей записываются в локальный файл на диске.

## notify_newest_block_number {#notify_newest_block_number} 

<ExperimentalBadge/>

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|

Уведомить номер самого нового блока для SharedJoin или SharedSet. Только в ClickHouse Cloud.

## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`20`|

Когда в пуле остается менее указанного количества свободных записей, не выполняйте мутации частей. Это необходимо для того, чтобы оставить свободные потоки для обычных слияний и избежать ошибок «Слишком много частей».

Возможные значения:
- Любое положительное целое число.

**Использование**

Значение настройки `number_of_free_entries_in_pool_to_execute_mutation` должно быть меньше значения [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) * [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio). В противном случае ClickHouse сгенерирует исключение.

## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`25`|

Когда в пуле остается менее указанного количества свободных записей, не выполняйте оптимизацию всей партиции в фоновом режиме (эта задача генерируется при установке `min_age_to_force_merge_seconds` и включении `min_age_to_force_merge_on_partition_only`). Это необходимо для того, чтобы оставить свободные потоки для обычных слияний и избежать ошибок «Слишком много частей».

Возможные значения:
- Положительное целое число.

Значение настройки `number_of_free_entries_in_pool_to_execute_optimize_entire_partition` должно быть меньше значения [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) * [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio). В противном случае ClickHouse сгенерирует исключение.

## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`8`|

Когда в пуле остается меньше указанного количества свободных записей (или в реплицированной очереди), начните уменьшать максимальный размер слияния для обработки (или для помещения в очередь). Это необходимо для того, чтобы небольшие слияния могли обрабатываться, не заполняя пул длительными слияниями.

Возможные значения:
- Любое положительное целое число.

## number_of_mutations_to_delay {#number_of_mutations_to_delay} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`500`|

Если в таблице есть как минимум столько незавершенных мутаций, искусственно замедляйте мутации таблицы. Отключено, если установлено в 0.

## number_of_mutations_to_throw {#number_of_mutations_to_throw} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000`|

Если в таблице есть как минимум столько незавершенных мутаций, выбросьте исключение «Слишком много мутаций». Отключено, если установлено в 0.

## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10`|

Доступно только в ClickHouse Cloud. До верхних N партиций, которые мы будем рассматривать для слияния. Партиции выбираются случайным взвешенным образом, где вес — это количество частей данных, которые можно объединить в этой партиции.

## old_parts_lifetime {#old_parts_lifetime} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`480`|

Время (в секундах) хранения неактивных частей для защиты от потери данных во время спонтанной перезагрузки сервера.

Возможные значения:
- Любое положительное целое число.

После слияния нескольких частей в новую часть ClickHouse помечает оригинальные части как неактивные и удаляет их только через `old_parts_lifetime` секунд. Неактивные части удаляются, если они не используются текущими запросами, т. е. если `refcount` части равен 1.

`fsync` не вызывается для новых частей, поэтому какое-то время новые части существуют только в ОЗУ сервера (кэш ОС). Если сервер будет перезагружен спонтанно, новые части могут быть потеряны или повреждены. Для защиты данных неактивные части не удаляются немедленно.

Во время старта ClickHouse проверяет целостность частей. Если объединенная часть повреждена, ClickHouse возвращает неактивные части в активный список и позже снова объединяет их. Затем поврежденная часть переименовывается (приписывается префикс `broken_`) и перемещается в папку `detached`. Если объединенная часть не повреждена, оригинальные неактивные части переименовываются (приписывается префикс `ignored_`) и перемещаются в папку `detached`.

Значение по умолчанию для `dirty_expire_centisecs` (настройка ядра Linux) составляет 30 секунд (максимальное время, в течение которого записанные данные сохраняются только в ОЗУ), но при высокой нагрузке на дисковую систему данные могут записываться гораздо позже. Экспериментально было выбрано значение 480 секунд для `old_parts_lifetime`, в течение которого новая часть гарантированно будет записана на диск.

## optimize_row_order {#optimize_row_order} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|

Управляет тем, следует ли оптимизировать порядок строк во время вставок, чтобы улучшить сжимаемость новой вставленной части таблицы.

Воздействует только на обычные таблицы с движком MergeTree. Ничего не делает для специализированных таблиц движка MergeTree (например, CollapsingMergeTree).

Таблицы MergeTree (по желанию) сжимаются с использованием [кодеков сжатия](/sql-reference/statements/create/table#column_compression_codec). Общие кодеки сжатия, такие как LZ4 и ZSTD, достигают максимальных коэффициентов сжатия, если данные показывают закономерности. Долгие последовательности одинаковых значений обычно сжимаются очень хорошо.

Если эта настройка включена, ClickHouse пытается хранить данные в вновь вставленных частях в таком порядке строк, который минимизирует количество равных значений в пределах колонок новой части таблицы. Другими словами, небольшое количество равных пробегов означает, что отдельные пробеги длинные и хорошо сжимаются.

Поиск оптимального порядка строк вычислительно трудоемок (NP-трудная задача). Поэтому ClickHouse использует эвристику для быстрого нахождения порядка строк, который все же улучшает коэффициенты сжатия по сравнению с оригинальным порядком строк.

<details markdown="1">

<summary>Эвристика для нахождения порядка строк</summary>

В общем, возможно произвольно перемешивать строки таблицы (или части таблицы), так как SQL считает, что одна и та же таблица (часть таблицы) в разном порядке строк эквивалентна.

Эта свобода перемешивания строк ограничивается, когда для таблицы определяется первичный ключ. В ClickHouse первичный ключ `C1, C2, ..., CN` заставляет таблицу сортироваться по колонкам `C1`, `C2`, ... `Cn` ([кластерный индекс](https://en.wikipedia.org/wiki/Database_index#Clustered)). В результате строки могут быть перемешаны только внутри «эквивалентных классов» строк, т.д. строк, которые имеют одинаковые значения в своих столбцах первичного ключа. Интуиция заключается в том, что первичные ключи с высокой кардинальностью, например, первичные ключи, включающие столбец временной метки `DateTime64`, приводят к множеству маленьких эквивалентных классов. Аналогично, таблицы с первичным ключом с низкой кардинальностью создают немного, но большие эквивалентные классы. Таблица без первичного ключа представляет крайний случай одного эквивалентного класса, охватывающего все строки.

Чем меньше и больше эквивалентные классы, тем выше степень свободы при повторной сортировке строк.

Эвристика, применяемая для нахождения лучшего порядка строк внутри каждого эквивалентного класса, предложена D. Lemire, O. Kaser в [Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002) и основана на сортировке строк внутри каждого эквивалентного класса по возрастанию кардинальности ненастоящих ключевых колонок.

Она выполняет три шага:
1. Найти все эквивалентные классы на основе значений строк в колонках первичного ключа.
2. Для каждого эквивалентного класса вычислить (обычно оценить) кардинальности ненастоящих ключевых колонок.
3. Для каждого эквивалентного класса отсортировать строки в порядке возрастания кардинальности ненастоящих ключевых колонок.

</details>

Если включено, операции вставки несут дополнительные затраты на CPU для анализа и оптимизации порядка строк новых данных. Операции INSERT ожидаются на 30-50% дольше в зависимости от характеристик данных. Коэффициенты сжатия LZ4 или ZSTD улучшаются в среднем на 20–40%.

Эта настройка работает лучше всего для таблиц без первичного ключа или с первичным ключом с низкой кардинальностью, т.е. для таблицы с небольшим количеством различных значений первичного ключа. Первичные ключи с высокой кардинальностью, например, включающие временные метки типа `DateTime64`, не ожидается, что получат выгоду от этой настройки.

## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds} 

<ExperimentalBadge/>

|Тип|По умолчанию|
|---|---|
|`UInt64`|`30`|

Время ожидания до/после перемещения частей между шардом.

## part_moves_between_shards_enable {#part_moves_between_shards_enable} 

<ExperimentalBadge/>

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Экспериментальная/незавершенная функция для перемещения частей между шардом. Не учитывает выражения шардирования.
## parts_to_delay_insert {#parts_to_delay_insert} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000`|


Если число активных частей в одной партиции превышает
значение `parts_to_delay_insert`, то `INSERT` искусственно замедляется.

Допустимые значения:
- Любое положительное целое число.

ClickHouse искусственно выполняет `INSERT` дольше (добавляет 'sleep'), чтобы
фоновый процесс слияния мог объединять части быстрее, чем они добавляются.
## parts_to_throw_insert {#parts_to_throw_insert} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`3000`|


Если число активных частей в одной партиции превышает
значение `parts_to_throw_insert`, `INSERT` прерывается с исключением `Слишком много
частей (N). Слияние обрабатывается значительно медленнее, чем вставки`.
 
Допустимые значения:
- Любое положительное целое число.

Для достижения максимальной производительности запросов `SELECT` необходимо
минимизировать количество обрабатываемых частей, см. [Merge Tree](/development/architecture#merge-tree).

До версии 23.6 эта настройка была установлена на 300. Вы можете установить
большее значение, это уменьшит вероятность ошибки `Слишком много частей`, но в
то же время производительность `SELECT` может ухудшиться. Также в случае
проблем со слиянием (например, из-за недостаточного места на диске) вы
заметите это позже, чем с оригинальными 300.
## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10737418240`|


Если сумма размера частей превышает этот порог и время с момента
создания записи в журнале репликации превышает
`prefer_fetch_merged_part_time_threshold`, то предпочтительно вытягивать объединённую часть
с реплики вместо выполнения слияния локально. Это сделано для ускорения очень длительных
слияний.

Допустимые значения:
- Любое положительное целое число.
## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`3600`|


Если время, прошедшее с момента создания записи в журнале репликации
(ClickHouse Keeper или ZooKeeper), превышает этот порог, и сумма размера частей больше,
чем `prefer_fetch_merged_part_size_threshold`, то предпочтительно вытягивать
объединённую часть с реплики вместо выполнения слияния локально. Это сделано для 
ускорения очень длительных слияний.

Допустимые значения:
- Любое положительное целое число.
## prewarm_mark_cache {#prewarm_mark_cache} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|

Если истинно, кэш меток будет
предварительно загружен, сохраняя метки в кэше меток при вставках, слияниях, извлечении и при
запуске сервера.
## prewarm_primary_key_cache {#prewarm_primary_key_cache} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|

Если истинно, кэш первичного индекса
будет предварительно загружен, сохраняя метки в кэше меток при вставках, слияниях,
извлечениях и при запуске сервера.
## primary_key_compress_block_size {#primary_key_compress_block_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`65536`|


Размер блока сжатия первичного блока, фактический размер блока для сжатия.
## primary_key_compression_codec {#primary_key_compression_codec} 

|Тип|По умолчанию|
|---|---|
|`String`|`ZSTD(3)`|


Кодек сжатия, используемый первичным, первичный ключ достаточно мал и кэшируется,
поэтому кодек по умолчанию — ZSTD(3).
## primary_key_lazy_load {#primary_key_lazy_load} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|

Загружайте первичный ключ в память при
первом использовании вместо инициализации таблицы. Это может сэкономить память в
наличии большого количества таблиц.
## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns} 

|Тип|По умолчанию|
|---|---|
|`Float`|`0.9`|


Если значение столбца первичного ключа в части данных изменяется хотя бы в
таком соотношении, пропускайте загрузку следующих столбцов в память. Это позволяет 
сэкономить использование памяти, не загружая ненужные столбцы первичного ключа.
## ratio_of_defaults_for_sparse_serialization {#ratio_of_defaults_for_sparse_serialization} 

|Тип|По умолчанию|
|---|---|
|`Float`|`0.9375`|


Минимальное соотношение числа _значений по умолчанию_ к числу _всех_ значений
в столбце. Установка этого значения приводит к тому, что столбец будет храниться с
использованием разреженной сериализации.

Если столбец разреженный (содержит в основном нули), ClickHouse может закодировать его в
разреженный формат и автоматически оптимизировать вычисления — данные не требуют 
полной декомпрессии во время запросов. Чтобы включить эту разреженную
сериализацию, определите значение `ratio_of_defaults_for_sparse_serialization`
меньше 1.0. Если значение больше или равно 1.0,
то столбцы всегда будут записываться с использованием нормальной полной сериализации.

Допустимые значения:

- Float между `0` и `1` для включения разреженной сериализации
- `1.0` (или больше), если вы не хотите использовать разреженную сериализацию

**Пример**

Обратите внимание, что столбец `s` в следующей таблице является пустой строкой для 95% строк. В `my_regular_table` мы не используем разреженную сериализацию, а в
`my_sparse_table` мы устанавливаем `ratio_of_defaults_for_sparse_serialization` на
0.95:

```sql
CREATE TABLE my_regular_table
(
`id` UInt64,
`s` String
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO my_regular_table
SELECT
number AS id,
number % 20 = 0 ? toString(number): '' AS s
FROM
numbers(10000000);


CREATE TABLE my_sparse_table
(
`id` UInt64,
`s` String
)
ENGINE = MergeTree
ORDER BY id
SETTINGS ratio_of_defaults_for_sparse_serialization = 0.95;

INSERT INTO my_sparse_table
SELECT
number,
number % 20 = 0 ? toString(number): ''
FROM
numbers(10000000);
```

Обратите внимание, что столбец `s` в `my_sparse_table` использует меньше места на диске:

```sql
SELECT table, name, data_compressed_bytes, data_uncompressed_bytes FROM system.columns
WHERE table LIKE 'my_%_table';
```

```response
┌─table────────────┬─name─┬─data_compressed_bytes─┬─data_uncompressed_bytes─┐
│ my_regular_table │ id   │              37790741 │                75488328 │
│ my_regular_table │ s    │               2451377 │                12683106 │
│ my_sparse_table  │ id   │              37790741 │                75488328 │
│ my_sparse_table  │ s    │               2283454 │                 9855751 │
└──────────────────┴──────┴───────────────────────┴─────────────────────────┘
```

Вы можете проверить, использует ли столбец разреженное кодирование, просмотрев
столбец `serialization_kind` таблицы `system.parts_columns`:

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

Вы можете увидеть, какие части `s` были сохранены с использованием разреженной сериализации:

```response
┌─column─┬─serialization_kind─┐
│ id     │ Default            │
│ s      │ Default            │
│ id     │ Default            │
│ s      │ Default            │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
│ id     │ Default            │
│ s      │ Sparse             │
└────────┴────────────────────┘
```
## reduce_blocking_parts_sleep_ms {#reduce_blocking_parts_sleep_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`5000`|


Доступно только в ClickHouse Cloud. Минимальное время ожидания перед тем,
как попробовать снова уменьшить блокирующие части после того, как диапазоны не были
удалены/заменены. Более низкая настройка приведет к частому запуску задач в 
background_schedule_pool, что приводит к большому количеству запросов к ZooKeeper в масштабируемых кластерах.
## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`10800`|


Когда это значение больше нуля, только одна реплика начинается
слияние немедленно, если объединённая часть на общем хранилище и
`allow_remote_fs_zero_copy_replication` включен.

:::note
Репликация без копий не готова к производству
Репликация без копий отключена по умолчанию в ClickHouse версии 22.8 и
выше.

Эта функция не рекомендуется для производственного использования.
:::

Допустимые значения:
- Любое положительное целое число.
## remote_fs_zero_copy_path_compatible_mode {#remote_fs_zero_copy_path_compatible_mode} 

<ExperimentalBadge/>

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Запуск нулевой копии в совместимом режиме во время процесса преобразования.
## remote_fs_zero_copy_zookeeper_path {#remote_fs_zero_copy_zookeeper_path} 

<ExperimentalBadge/>

|Тип|По умолчанию|
|---|---|
|`String`|`/clickhouse/zero_copy`|


Путь ZooKeeper для информации о нулевой копии, независимой от таблицы.
## remove_empty_parts {#remove_empty_parts} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Удаление пустых частей после их обрезки с помощью TTL, мутации или алгоритма
слияния коллапса.
## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately} 

<ExperimentalBadge/>

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Настройка для неполной экспериментальной функции.
## replace_long_file_name_to_hash {#replace_long_file_name_to_hash} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Если имя файла для столбца слишком длинное (более 
`max_file_name_length` байт), замените его на SipHash128.
## replicated_can_become_leader {#replicated_can_become_leader} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Если истинно, реплики таблиц реплицируемых на этом узле будут пытаться
приобрести лидерство.

Допустимые значения:
- `true`
- `false`
## replicated_deduplication_window {#replicated_deduplication_window} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000`|


Количество самых недавно вставленных блоков, для которых ClickHouse Keeper хранит
хеш-суммы для проверки дубликатов.

Допустимые значения:
- Любое положительное целое число.
- 0 (отключить дедупликацию)

Команда `Insert` создаёт один или несколько блоков (частей). Для
[дедупликации вставок](../../engines/table-engines/mergetree-family/replication.md)
при записи в реплицированные таблицы ClickHouse записывает хеш-суммы созданных
частей в ClickHouse Keeper. Хеш-суммы хранятся только для самых
недавних `replicated_deduplication_window` блоков. Самые старые хеш-суммы
удаляются из ClickHouse Keeper.

Большое число для `replicated_deduplication_window` замедляет `Inserts`, так как нужно
сравнивать больше записей. Хеш-сумма вычисляется по составу имен и типов полей
и данных вставленной части (потока байтов).
## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10000`|


Количество самых недавно асинхронно вставленных блоков, для которых ClickHouse Keeper
хранит хеш-суммы для проверки дубликатов.

Допустимые значения:
- Любое положительное целое число.
- 0 (отключить дедупликацию для async_inserts)

Команда [Async Insert](/operations/settings/settings#async_insert) 
будет кэшироваться в одном или нескольких блоках (частях). Для [дедупликации вставок](/engines/table-engines/mergetree-family/replication)
при записи в реплицированные таблицы ClickHouse записывает хеш-суммы каждой вставки
в ClickHouse Keeper. Хеш-суммы хранятся только для самых последних 
`replicated_deduplication_window_for_async_inserts` блоков. Самые старые хеши
удаляются из ClickHouse Keeper.
Большое количество `replicated_deduplication_window_for_async_inserts` замедляет
`Async Inserts`, так как необходимо сравнивать больше записей.
Хеш-сумма вычисляется из состава имен и типов полей и данных вставки (потока байтов).
## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`604800`|


Количество секунд, через которые хеш-суммы вставленных блоков будут
удалены из ClickHouse Keeper.

Допустимые значения:
- Любое положительное целое число.

Аналогично [replicated_deduplication_window](#replicated_deduplication_window),
`replicated_deduplication_window_seconds` указывает, как долго хранить хеш-суммы
блоков для дедупликации вставок. Хеш-суммы старше
`replicated_deduplication_window_seconds` удаляются из ClickHouse Keeper,
даже если они меньше, чем `replicated_deduplication_window`.

Время отсчитывается относительно времени самой последней записи, а не текущего времени. Если это единственная запись, она будет храниться вечно.
## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`604800`|


Количество секунд, по истечении которых хеш-суммы асинхронных вставок будут
удалены из ClickHouse Keeper.

Допустимые значения:
- Любое положительное целое число.

Аналогично [replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts),
`replicated_deduplication_window_seconds_for_async_inserts` указывает, как
долго хранить хеш-суммы блоков для дедупликации асинхронных вставок. Хеш-суммы
старше `replicated_deduplication_window_seconds_for_async_inserts` удаляются
из ClickHouse Keeper, даже если они меньше, чем
`replicated_deduplication_window_for_async_inserts`.

Время отсчитывается относительно времени самой последней записи, а не текущего времени. Если это единственная запись, она будет храниться вечно.
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`0`|

Устаревшая настройка, ничего не делает.
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`0`|

Устаревшая настройка, ничего не делает.
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`0`|

Устаревшая настройка, ничего не делает.
## replicated_max_mutations_in_one_entry {#replicated_max_mutations_in_one_entry} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10000`|


Максимальное количество команд мутации, которые могут быть объединены и выполнены в
одной записи MUTATE_PART (0 значит неограничено).
## replicated_max_parallel_fetches {#replicated_max_parallel_fetches} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Устаревшая настройка, ничего не делает.
## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`15`|

Устаревшая настройка, ничего не делает.
## replicated_max_parallel_fetches_for_table {#replicated_max_parallel_fetches_for_table} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Устаревшая настройка, ничего не делает.
## replicated_max_parallel_sends {#replicated_max_parallel_sends} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Устаревшая настройка, ничего не делает.
## replicated_max_parallel_sends_for_table {#replicated_max_parallel_sends_for_table} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Устаревшая настройка, ничего не делает.
## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts} 

|Тип|По умолчанию|
|---|---|
|`Float`|`0.5`|


Если соотношение неправильных частей к общему числу частей меньше этого -
разрешить запуск.

Допустимые значения:
- Float, 0.0 - 1.0.
## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Включает создание метаданных по репликам /metadata и /columns в ZooKeeper.
Доступно только в ClickHouse Cloud.
## shared_merge_tree_disable_merges_and_mutations_assignment {#shared_merge_tree_disable_merges_and_mutations_assignment} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Остановите задание слияний для объединённого дерева. Доступно только в ClickHouse
Cloud.
## shared_merge_tree_enable_keeper_parts_extra_data {#shared_merge_tree_enable_keeper_parts_extra_data} 

<ExperimentalBadge/>

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Включает запись атрибутов в виртуальные части и фиксирование блоков в Keeper.
## shared_merge_tree_enable_outdated_parts_check {#shared_merge_tree_enable_outdated_parts_check} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Включение проверки устаревших частей. Доступно только в ClickHouse Cloud.
## shared_merge_tree_idle_parts_update_seconds {#shared_merge_tree_idle_parts_update_seconds} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`3600`|


Интервал в секундах для обновления частей без триггера от наблюдения ZooKeeper
в общем дереве. Доступно только в ClickHouse Cloud.
## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`50`|


Первичный параметр ожидания для обновления частей. Доступно только в ClickHouse Cloud.
## shared_merge_tree_interserver_http_connection_timeout_ms {#shared_merge_tree_interserver_http_connection_timeout_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`100`|


Таймауты для межсерверного HTTP-соединения. Доступно только в ClickHouse Cloud.
## shared_merge_tree_interserver_http_timeout_ms {#shared_merge_tree_interserver_http_timeout_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10000`|


Таймауты для межсерверного HTTP-общения. Доступно только в ClickHouse Cloud.
## shared_merge_tree_leader_update_period_random_add_seconds {#shared_merge_tree_leader_update_period_random_add_seconds} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10`|


Добавьте равномерно распределённое значение от 0 до x секунд к
периоду обновления лидера shared_merge_tree, чтобы избежать эффекта 
стадности. Доступно только в ClickHouse Cloud.
## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`30`|


Максимальный период повторной проверки лидерства для обновления частей. Доступно только в
ClickHouse Cloud.
## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000`|


Максимальное количество устаревших частей, которые лидер попытается подтвердить на
одном HTTP-запросе. Доступно только в ClickHouse Cloud.
## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`5000`|


Максимальное ожидание для обновления частей. Доступно только в ClickHouse Cloud.
## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`6`|


Максимальное количество лидеров обновления частей. Доступно только в ClickHouse Cloud.
## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`2`|


Максимальное количество лидеров обновления частей. Доступно только в ClickHouse Cloud.
## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10`|


Максимальное количество реплик, которые будут участвовать в удалении частей (поток убийцы). 
Доступно только в ClickHouse Cloud.
## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`5`|


Максимальное количество реплик, которые будут пытаться назначить потенциально конфликтующие слияния 
(позволяет избегать избыточных конфликтов при назначении слияний). 0 означает отключённо. Доступно только в ClickHouse Cloud.
## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Максимальное количество повреждённых частей для SMT, если больше — отклонить автоматическое отсоединение.
## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Максимальный размер всех повреждённых частей для SMT, если больше — отклонить автоматическое отсоединение.
## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds} 

|Тип|По умолчанию|
|---|---|
|`Int64`|`1800`|


В течение какого времени мы храним идентификаторы мемоизации вставок, чтобы избежать неверных действий при
повторных попытках вставки. Доступно только в ClickHouse Cloud.
## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations} 

|Тип|По умолчанию|
|---|---|
|`Float`|`0.5`|


Будет перезагружено условие слияния в задаче выбора для слияния/мутации, если
соотношение `<кандидатные
партиции для мутаций только (партиции, которые не могут быть объединены)>/<кандидатные
партиции для мутаций>` выше настройки. Доступно только в ClickHouse Cloud.
## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`32`|


Количество задач загрузки метаданных частей для запланированной обработки за раз. Доступно только в ClickHouse Cloud.
## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Время, в течение которого следует хранить локально объединённую часть без начала нового слияния с
включением этой части. Позволяет другим репликам получить часть и начать это слияние.
Доступно только в ClickHouse Cloud.
## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000000`|


Минимальный размер части (в строках), чтобы отложить назначение следующего слияния сразу после
объединения её локально. Доступно только в ClickHouse Cloud.
## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10`|


Время, в течение которого следует хранить локально объединённую часть без начала нового слияния
с этой частью. Позволяет другим репликам получить часть и начать это слияние.
Доступно только в ClickHouse Cloud.
## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Читать виртуальные части от лидера, когда это возможно. Доступно только в ClickHouse
Cloud.
## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Если включено, все реплики попытаются получить данные части в памяти
(такие как первичный ключ, информация о партиции и так далее) от других реплик, где это уже существует.
## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Включает запрос кэшированных подсказок FS из памяти
кэша на других репликах. Доступно только в ClickHouse Cloud.
## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Использовать компактный формат для устаревших частей: уменьшает нагрузку на Keeper, улучшает
обработку устаревших частей. Доступно только в ClickHouse Cloud.
## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Если включено, счётчик слишком большого количества частей будет полагаться на общие данные в Keeper, а не на
локальное состояние реплики. Доступно только в ClickHouse Cloud.
## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Если существует много устаревших частей, поток очистки попытается удалить до
`simultaneous_parts_removal_limit` частей за одну итерацию.
`simultaneous_parts_removal_limit`, установленный на `0`, означает неограниченное.
## sleep_before_commit_local_part_in_replicated_table_ms {#sleep_before_commit_local_part_in_replicated_table_ms} 

|Тип|По умолчанию|
|---|---|
|`Milliseconds`|`0`|


Для тестирования. Не изменяйте это.
## sleep_before_loading_outdated_parts_ms {#sleep_before_loading_outdated_parts_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Для тестирования. Не изменяйте это.
## storage_policy {#storage_policy} 

|Тип|По умолчанию|
|---|---|
|`String`|`default`|


Имя политики дисков хранения.
## table_disk {#table_disk} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Это диск таблицы, путь/конечная точка должны указывать на данные таблицы, а не на
данные базы данных. Может быть установлен только для s3_plain/s3_plain_rewritable/web.
## temporary_directories_lifetime {#temporary_directories_lifetime} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`86400`|


Сколько секунд хранить директории tmp_. Не следует понижать это значение, 
так как слияния и мутации могут не работать с низким значением этой
настройки.
## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`7200`|


Тайм-аут (в секундах) перед началом слияния с рекомпрессией. В течение этого
времени ClickHouse пытается получить рекомпрессированную часть от реплики, которая
назначила это слияние с рекомпрессией.

Рекомпрессия работает медленно в большинстве случаев, поэтому мы не запускаем слияние с
рекомпрессией до истечения этого таймаута и пытаемся получить рекомпрессированную часть от
реплики, которая назначила это слияние с рекомпрессией.

Допустимые значения:
- Любое положительное целое число.
## ttl_only_drop_parts {#ttl_only_drop_parts} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Управляет тем, удаляются ли части данных полностью в таблицах MergeTree, когда все
строки в этой части истекли согласно их настройкам `TTL`.

Когда `ttl_only_drop_parts` отключен (по умолчанию), то удаляются только строки, которые
истекли в соответствии с их настройками `TTL`.

Когда `ttl_only_drop_parts` включен, вся часть удаляется, если все
строки в этой части истекли в соответствии с их настройками `TTL`.
## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Позволяет использовать адаптивные буферы записи при записи динамических подстолбцов
для сокращения использования памяти.
## use_async_block_ids_cache {#use_async_block_ids_cache} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Если истинно, мы кэшируем хеш-суммы асинхронных вставок.

Допустимые значения:
- `true`
- `false`

Блок, содержащий несколько асинхронных вставок, создаст несколько хеш-сумм.
Когда некоторые из вставок дублируются, Keeper вернёт лишь одну
дублированную хеш-сумму в одном RPC, что вызовет ненужные повторные попытки RPC.
Этот кэш будет следить за путём хеш-сумм в Keeper. Если в Keeper будут
замечены изменения, кэш обновится как можно скорее, чтобы мы смогли
отфильтровать дублированные вставки в памяти.
## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Включает компактный режим для бинарной сериализации дискриминаторов в
типе данных Variant.
Этот режим позволяет существенно сэкономить память при хранении дискриминаторов
в частях, когда в основном присутствует один вариант или много значений NULL.
## use_const_adaptive_granularity {#use_const_adaptive_granularity} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Всегда используйте постоянную гранулярность для всей части. Это позволяет сжимать в
памяти значения гранулярности индекса. Может быть полезно в чрезвычайно больших
нагрузках с тонкими таблицами.
## use_metadata_cache {#use_metadata_cache} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|

Устаревшая настройка, ничего не делает.
## use_minimalistic_checksums_in_zookeeper {#use_minimalistic_checksums_in_zookeeper} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Используйте малый формат (десятки байт) для хеш-сумм частей в ZooKeeper вместо
обычных (десятки КБ). Перед включением проверьте, что все реплики поддерживают
новый формат.
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Метод хранения заголовков данных частей в ZooKeeper. Если включён, ZooKeeper
сохраняет меньше данных. Подробности см. [здесь](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper).
## use_primary_key_cache {#use_primary_key_cache} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|

Используйте кэш для первичного индекса
вместо сохранения всех индексов в памяти. Может быть полезно для очень больших таблиц.
## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Минимальный (приблизительный) несжатый размер в байтах в сливаемых частях для активации
вертикального алгоритма слияния.
## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`11`|


Минимальное количество ненулевых PK столбцов для активации вертикального алгоритма слияния.
## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`131072`|


Минимальная (приблизительная) сумма строк в
сливаемых частях для активации вертикального алгоритма слияния.
## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Если истинно, будет использовано предварительное извлечение данных из удалённой файловой системы для следующего
столбца во время слияния.
## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms} 

|Тип|По умолчанию|
|---|---|
|`Milliseconds`|`0`|


Перед завершением работы таблица будет ожидать необходимое количество времени, чтобы уникальные части
(существующие только на текущей реплике) были извлечены другими репликами (0 означает
отключено).
## write_ahead_log_bytes_to_fsync {#write_ahead_log_bytes_to_fsync} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`104857600`|

Устаревшая настройка, ничего не делает.
## write_ahead_log_interval_ms_to_fsync {#write_ahead_log_interval_ms_to_fsync} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`100`|

Устаревшая настройка, ничего не делает.
## write_ahead_log_max_bytes {#write_ahead_log_max_bytes} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1073741824`|

Устаревшая настройка, ничего не делает.
## write_final_mark {#write_final_mark} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|

Устаревшая настройка, ничего не делает.
## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio} 

|Тип|По умолчанию|
|---|---|
|`Float`|`0.05`|


Максимальный процент верхнего уровня частей, которые можно отложить для удаления
с целью получения меньших независимых диапазонов. Рекомендуется не изменять.
## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`5`|


Максимальная глубина рекурсии для разделения независимых устаревших диапазонов
на более мелкие поддиапазоны. Рекомендуется не изменять.
## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1073741824`|


Если включена репликация без копий, случайным образом подождите некоторое время перед попыткой
заблокировать в зависимости от размера частей для слияния или мутации.
## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Если включена репликация без копий, случайным образом подождите время до 500ms
перед попыткой заблокировать для слияния или мутации.
## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`60`|


Период проверки истечения сессии ZooKeeper в секундах.

Возможные значения:
- Любое положительное целое число.
