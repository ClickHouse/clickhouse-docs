---
description: 'Настройки движка MergeTree, представленные в таблице `system.merge_tree_settings`'
slug: /operations/settings/merge-tree-settings
title: 'Настройки таблиц MergeTree'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

Системная таблица `system.merge_tree_settings` показывает глобальные настройки MergeTree.

Настройки MergeTree можно задать в секции `merge_tree` конфигурационного файла сервера или указать отдельно для каждой таблицы `MergeTree` в секции `SETTINGS` оператора `CREATE TABLE`.

Пример настройки параметра `max_suspicious_broken_parts`:

Настройте значение по умолчанию для всех таблиц `MergeTree` в конфигурационном файле сервера:

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

Устанавливается для конкретной таблицы:

```sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

Измените настройки для конкретной таблицы с помощью `ALTER TABLE ... MODIFY SETTING`:

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- сброс до глобального значения по умолчанию (значение из system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```


## Параметры MergeTree

{/* Приведённые ниже настройки автоматически генерируются скриптом по адресу 
  https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
  */ }

## adaptive&#95;write&#95;buffer&#95;initial&#95;size

<SettingsInfoBlock type="UInt64" default_value="16384" />

Начальный размер адаптивного буфера записи


## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine} 
<SettingsInfoBlock type="Bool" default_value="0" />

Если имеет значение `true`, добавляет неявное ограничение для столбца `sign` таблицы
типа CollapsingMergeTree или VersionedCollapsingMergeTree, чтобы разрешать
только корректные значения (`1` и `-1`).



## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>


Если параметр включён, для всех числовых столбцов таблицы создаются min-max (пропускающие) индексы.



## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>


При включении для всех строковых столбцов таблицы создаются min-max-индексы (skipping).



## allow_coalescing_columns_in_partition_or_order_key {#allow_coalescing_columns_in_partition_or_order_key} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Новая настройка, позволяющая использовать объединяемые столбцы таблицы CoalescingMergeTree в ключе партиционирования или сортировки."}]}]}/>


Если включена, позволяет использовать объединяемые столбцы в таблице CoalescingMergeTree в качестве ключа партиционирования или сортировки.



## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает экспериментальные слияния CLEANUP для ReplacingMergeTree со столбцом
`is_deleted`. При включении позволяет использовать `OPTIMIZE ... FINAL CLEANUP`
для ручного слияния всех частей в разделе в одну часть и удаления любых
удалённых строк.

Также позволяет включить автоматическое выполнение таких слияний в фоновом режиме с
использованием настроек `min_age_to_force_merge_seconds`,
`min_age_to_force_merge_on_partition_only` и
`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`.



## allow&#95;experimental&#95;reverse&#95;key

<ExperimentalBadge />

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]} />

Включает поддержку сортировки по убыванию в ключах сортировки MergeTree. Этот
параметр особенно полезен для анализа временных рядов и запросов Top-N,
позволяя хранить данные в обратном хронологическом порядке для оптимизации
производительности запросов.

При включённом `allow_experimental_reverse_key` вы можете задавать порядок
сортировки по убыванию в выражении `ORDER BY` таблицы MergeTree. Это позволяет
использовать более эффективные оптимизации `ReadInOrder` вместо `ReadInReverseOrder`
для запросов с сортировкой по убыванию.

**Пример**

```sql
CREATE TABLE example
(
time DateTime,
key Int32,
value String
) ENGINE = MergeTree
ORDER BY (time DESC, key)  -- Сортировка по убыванию по полю 'time'
SETTINGS allow_experimental_reverse_key = 1;

SELECT * FROM example WHERE key = 'xxx' ORDER BY time DESC LIMIT 10;
```

При указании в запросе `ORDER BY time DESC` применяется `ReadInOrder`.

**Значение по умолчанию:** false


## allow_floating_point_partition_key {#allow_floating_point_partition_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использование чисел с плавающей запятой в качестве ключа партиционирования.

Возможные значения:
- `0` — Ключ партиционирования с плавающей запятой не разрешён.
- `1` — Ключ партиционирования с плавающей запятой разрешён.



## allow_nullable_key {#allow_nullable_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использование типов данных Nullable в качестве первичных ключей.



## allow_part_offset_column_in_projections {#allow_part_offset_column_in_projections} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Теперь в проекциях можно использовать столбец _part_offset."}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "Новая настройка, предотвращающая создание проекций со столбцом _part_offset родительской части до его стабилизации."}]}]}/>


Разрешает использование столбца `_part_offset` в запросах `SELECT` к проекциям.



## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Теперь SMT по умолчанию будет удалять устаревшие блокирующие части из ZooKeeper"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Синхронизация с облаком"}]}]}/>


Фоновая задача, которая сокращает число блокирующих частей для общих таблиц MergeTree.
Только в ClickHouse Cloud.



## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

Не используйте эту настройку в продакшене, так как она ещё не готова к использованию.



## allow_summing_columns_in_partition_or_order_key {#allow_summing_columns_in_partition_or_order_key} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "Новый параметр, разрешающий суммирование столбцов, входящих в ключ партиционирования или сортировки"}]}]}/>


При включении разрешает использовать суммируемые столбцы таблицы SummingMergeTree
в качестве ключа партиционирования или сортировки.



## allow_suspicious_indices {#allow_suspicious_indices} 
<SettingsInfoBlock type="Bool" default_value="0" />

Отклоняет первичные и вторичные индексы, а также ключи сортировки с идентичными выражениями



## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает вертикальные слияния из компактных частей в широкие. Эта настройка должна иметь одинаковое значение на всех репликах.



## alter_column_secondary_index_mode {#alter_column_secondary_index_mode} 
<SettingsInfoBlock type="AlterColumnSecondaryIndexMode" default_value="rebuild" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "rebuild"},{"label": "Изменяет поведение, чтобы разрешить ALTER `COLUMN` для столбцов с зависимыми вторичными индексами"}]}]}/>


Настраивает, разрешать ли команды `ALTER`, которые изменяют столбцы, покрытые вторичными индексами, и какие действия выполнять, если они разрешены. По умолчанию такие команды `ALTER` разрешены, и индексы перестраиваются.

Возможные значения:
- `rebuild` (по умолчанию): Перестраивает все вторичные индексы, на которые влияет столбец в команде `ALTER`.
- `throw`: Запрещает любые `ALTER` столбцов, покрытых вторичными индексами, выбрасывая исключение.
- `drop`: Удаляет зависимые вторичные индексы. Новые части данных не будут содержать этих индексов, для их восстановления требуется выполнить `MATERIALIZE INDEX`.
- `compatibility`: Соответствует исходному поведению: `throw` для `ALTER ... MODIFY COLUMN` и `rebuild` для `ALTER ... UPDATE/DELETE`.
- `ignore`: Предназначено для опытных пользователей. Оставляет индексы в несогласованном состоянии, что может приводить к некорректным результатам запросов.



## always_fetch_merged_part {#always_fetch_merged_part} 
<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр установлен в true, эта реплика никогда не сливает парты и всегда загружает слитые парты
с других реплик.

Возможные значения:
- true, false



## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks} 
<SettingsInfoBlock type="Bool" default_value="0" />

Всегда копировать данные вместо создания жёстких ссылок во время мутаций, замен, отсоединений и т. д.



## apply_patches_on_merge {#apply_patches_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>


Если `true`, патчи частей применяются при слиянии



## assign_part_uuids {#assign_part_uuids} 
<SettingsInfoBlock type="Bool" default_value="0" />

Когда параметр включён, для каждой новой части будет назначаться уникальный идентификатор.
Перед включением убедитесь, что все реплики поддерживают UUID версии 4.



## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="100" />

Время ожидания обновления async_block_ids_cache в каждой итерации вставки



## async_insert {#async_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

При значении `true` данные из запроса INSERT помещаются в очередь и затем асинхронно записываются в таблицу в фоновом режиме.



## auto_statistics_types {#auto_statistics_types} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "Новая настройка"}]}]}/>


Список типов статистики, перечисленных через запятую, которые автоматически вычисляются для всех подходящих столбцов.
Поддерживаемые типы статистики: tdigest, countmin, minmax, uniq.



## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="50" />

Целевое время выполнения одного шага операции слияния или мутации. Может быть превышено, если выполнение одного шага занимает больше времени.



## cache_populated_by_fetch {#cache_populated_by_fetch} 
<SettingsInfoBlock type="Bool" default_value="0" />

:::note
Этот параметр применяется только к ClickHouse Cloud.
:::

Когда `cache_populated_by_fetch` отключён (значение по умолчанию), новые части
данных загружаются в кэш только при выполнении запроса, которому требуются эти
части.

Если параметр включён, `cache_populated_by_fetch` приводит к тому, что все узлы
загружают новые части данных из хранилища в свой кэш без необходимости запуска
запроса, чтобы инициировать это действие.

**См. также**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)



## cache_populated_by_fetch_filename_regexp {#cache_populated_by_fetch_filename_regexp} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "Новая настройка"}]}]}/>


:::note
Этот параметр применяется только к ClickHouse Cloud.
:::

Если значение не пустое, только файлы, имена которых соответствуют этому регулярному выражению, будут предварительно загружены в кэш после выполнения `fetch` (если включен `cache_populated_by_fetch`).



## check_delay_period {#check_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="60" />
Устаревшая настройка, не используется.
## check_sample_column_is_correct {#check_sample_column_is_correct} 
<SettingsInfoBlock type="Bool" default_value="1" />

Включает проверку при создании таблицы того, что тип данных столбца для
семплирования или выражения семплирования корректен. Тип данных должен быть одним из беззнаковых
[целочисленных типов](/sql-reference/data-types/int-uint): `UInt8`, `UInt16`,
`UInt32`, `UInt64`.

Возможные значения:
- `true`  — Проверка включена.
- `false` — Проверка при создании таблицы отключена.

Значение по умолчанию: `true`.

По умолчанию сервер ClickHouse при создании таблицы проверяет тип данных
столбца для семплирования или выражения семплирования. Если у вас уже есть таблицы с
некорректным выражением семплирования и вы не хотите, чтобы сервер выбрасывал исключение
во время запуска, установите для `check_sample_column_is_correct` значение `false`.



## clean_deleted_rows {#clean_deleted_rows} 
<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />
Устаревшая настройка, не используется.
## cleanup_delay_period {#cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />

Минимальный интервал для очистки старых логов очереди, хэшей блоков и кусков.



## cleanup_delay_period_random_add {#cleanup_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />

Добавляет равномерно распределённое значение от 0 до x секунд к cleanup_delay_period,
чтобы избежать проблемы «thundering herd» и последующей DoS-нагрузки на ZooKeeper в случае
очень большого числа таблиц.



## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration} 
<SettingsInfoBlock type="UInt64" default_value="150" />

Предпочитаемый размер пакета для фоновой очистки («поинты» являются абстракцией, но 1 поинт примерно соответствует 1 вставленному блоку).



## cleanup_threads {#cleanup_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />
Устаревший параметр, ничего не делает.
## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Новый параметр для ленивого вычисления размеров столбцов и индексов"}]}]}/>


Лениво вычислять размеры столбцов и вторичных индексов при первом запросе,
а не при инициализации таблицы.



## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache} 


Список столбцов, для которых нужно предварительно прогревать кэш меток (если он включён). Пустое значение означает, что выбираются все столбцы.



## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="134217728" />

Параметр доступен только в ClickHouse Cloud. Максимальный объём данных (в байтах), записываемых в один страйп в компактных партах.



## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="128" />

Доступна только в ClickHouse Cloud. Максимальное количество гранул, записываемых
в один страйп компактной части



## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part} 
<SettingsInfoBlock type="UInt64" default_value="16777216" />

Настройка доступна только в ClickHouse Cloud. Максимальный размер компактной части, которую можно целиком прочитать в память во время слияния.



## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает создавать таблицы с выражением выборки, которое не входит в первичный ключ. Это требуется только для временного запуска сервера с некорректными таблицами для обеспечения обратной совместимости.



## compress_marks {#compress_marks} 
<SettingsInfoBlock type="Bool" default_value="1" />

Метки поддерживают сжатие, что уменьшает размер файлов меток и ускоряет их передачу по сети.



## compress_primary_key {#compress_primary_key} 
<SettingsInfoBlock type="Bool" default_value="1" />

Первичный ключ поддерживает сжатие, что уменьшает размер соответствующего файла и ускоряет передачу по сети.



## concurrent_part_removal_threshold {#concurrent_part_removal_threshold} 
<SettingsInfoBlock type="UInt64" default_value="100" />

Включать параллельное удаление частей (см. «max_part_removal_threads») только если
число неактивных частей данных не меньше этого порогового значения.



## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode} 
<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "Do not allow to create inconsistent projection"}]}]}/>


Разрешать ли создание проекции для таблицы с неклассическим MergeTree,
то есть не с (Replicated, Shared) MergeTree. Опция `ignore` предназначена только для
совместимости и может приводить к некорректным результатам. В противном случае, если создание
разрешено, задаётся поведение при слиянии проекций — либо удалять, либо перестраивать. Классический
MergeTree будет игнорировать этот параметр. Он также управляет `OPTIMIZE DEDUPLICATE`,
но при этом влияет на все движки семейства MergeTree. Аналогично параметру
`lightweight_mutation_projection_mode`, он действует на уровне части данных.

Возможные значения:
- `ignore`
- `throw`
- `drop`
- `rebuild`



## default_compression_codec {#default_compression_codec} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "New setting"}]}]}/>


Указывает кодек сжатия по умолчанию, который будет использоваться, если для отдельного столбца в объявлении таблицы он не задан.
Порядок выбора кодека сжатия для столбца:
1. Кодек сжатия, определённый для столбца в объявлении таблицы
2. Кодек сжатия, определённый в `default_compression_codec` (этой настройке)
3. Кодек сжатия по умолчанию, определённый в настройках `compression`
Значение по умолчанию: пустая строка (не задано).



## detach_not_byte_identical_parts {#detach_not_byte_identical_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает отсоединение части данных на реплике после слияния или
мутации, если она не является побайтно идентичной частям данных на других репликах. Если
настройка отключена, часть данных удаляется. Включите эту настройку, если вы хотите
проанализировать такие части позже.

Эта настройка применима к таблицам `MergeTree` с включенной
[репликацией данных](/engines/table-engines/mergetree-family/replacingmergetree).

Возможные значения:

- `0` — части удаляются.
- `1` — части отсоединяются.



## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica} 
<SettingsInfoBlock type="Bool" default_value="1" />

Не удаляет старые локальные части при восстановлении утерянной реплики.

Возможные значения:
- `true`
- `false`



## disable_detach_partition_for_zero_copy_replication {#disable_detach_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

Отключает запрос DETACH PARTITION для репликации без копирования данных.



## disable_fetch_partition_for_zero_copy_replication {#disable_fetch_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

Отключает запрос FETCH PARTITION для репликации без копирования данных.



## disable_freeze_partition_for_zero_copy_replication {#disable_freeze_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

Отключает выполнение запроса FREEZE PARTITION при репликации с нулевым копированием.



## disk {#disk} 


Имя диска для хранения данных. Может быть указано вместо политики хранения.



## dynamic_serialization_version {#dynamic_serialization_version} 
<SettingsInfoBlock type="MergeTreeDynamicSerializationVersion" default_value="v2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Add a setting to control Dynamic serialization versions"}]}]}/>


Версия сериализации для типа данных Dynamic. Необходима для совместимости.

Возможные значения:
- `v1`
- `v2`
- `v3`



## enable_block_number_column {#enable_block_number_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

Включает сохранение столбца _block_number для каждой строки.



## enable_block_offset_column {#enable_block_offset_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

Сохраняет виртуальный столбец `_block_number` во время слияний.



## enable_index_granularity_compression {#enable_index_granularity_compression} 
<SettingsInfoBlock type="Bool" default_value="1" />

Сжимать в памяти значения гранулярности индекса, если возможно



## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Добавлена новая настройка для ограничения максимального числа байт для min_age_to_force_merge."}]}]}/>


Определяет, должны ли настройки `min_age_to_force_merge_seconds` и
`min_age_to_force_merge_on_partition_only` учитывать значение настройки
`max_bytes_to_merge_at_max_space_in_pool`.

Возможные значения:
- `true`
- `false`



## enable_mixed_granularity_parts {#enable_mixed_granularity_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает переход к управлению размером гранул с помощью настройки
`index_granularity_bytes`. До версии 19.11 существовала только настройка
`index_granularity` для ограничения размера гранул. Настройка
`index_granularity_bytes` повышает производительность ClickHouse при
выборке данных из таблиц с большими строками (десятки и сотни мегабайт).
Если у вас есть таблицы с большими строками, вы можете включить эту настройку для них,
чтобы повысить эффективность запросов `SELECT`.



## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "Новая настройка, позволяющая автоматически выполнять слияния типа CLEANUP для ReplacingMergeTree"}]}]}/>


Определяет, использовать ли слияния типа CLEANUP для ReplacingMergeTree при слиянии разделов
до одной части. Требует включения настроек `allow_experimental_replacing_merge_with_cleanup`,
`min_age_to_force_merge_seconds` и `min_age_to_force_merge_on_partition_only`.

Возможные значения:
- `true`
- `false`



## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix} 
<SettingsInfoBlock type="Bool" default_value="0" />

Включает использование идентификатора конечной точки с префиксом имени ZooKeeper для реплицируемой таблицы MergeTree.



## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm} 
<SettingsInfoBlock type="UInt64" default_value="1" />

Включает использование алгоритма вертикального слияния.



## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>


Если этот параметр включён для целевой таблицы в запросе операции с разделами
(`ATTACH/MOVE/REPLACE PARTITION`), индексы и проекции должны быть
идентичны в исходной и целевой таблицах. В противном случае в целевой
таблице может быть надмножество индексов и проекций по сравнению с исходной таблицей.



## escape_variant_subcolumn_filenames {#escape_variant_subcolumn_filenames} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Экранировать специальные символы в именах файлов, создаваемых для подколонок типа Variant в Wide-частях"}]}]}/>


Экранирует специальные символы в именах файлов, создаваемых для подколонок типа данных Variant в Wide-частях таблицы MergeTree. Необходимо для совместимости.



## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />

Если включено, при выборе частей данных для слияния будет использоваться оценочный фактический размер частей (то есть без учета строк, которые были удалены с помощью `DELETE FROM`). Обратите внимание, что это поведение применяется только к частям данных, затронутым операцией `DELETE FROM`, выполненной после включения этой настройки.

Возможные значения:
- `true`
- `false`

**См. также**
- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts) — настройка



## exclude&#95;materialize&#95;skip&#95;indexes&#95;on&#95;merge

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "New setting."}]}]} />

Исключает указанный список skip-индексов, разделённый запятыми, из построения и хранения при операциях слияния (merge). Не оказывает никакого эффекта, если
[materialize&#95;skip&#95;indexes&#95;on&#95;merge](#materialize_skip_indexes_on_merge) имеет значение false.

Исключённые skip-индексы всё равно будут построены и сохранены явным запросом
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) или во время операций INSERT в зависимости от
сеансовой настройки [materialize&#95;skip&#95;indexes&#95;on&#95;insert](/operations/settings/settings.md/#materialize_skip_indexes_on_insert).

Пример:

```sql
CREATE TABLE tab
(
a UInt64,
b UInt64,
INDEX idx_a a TYPE minmax,
INDEX idx_b b TYPE set(3)
)
ENGINE = MergeTree ORDER BY tuple() SETTINGS exclude_materialize_skip_indexes_on_merge = 'idx_a';

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- настройка не действует на INSERT

-- idx_a будет исключён из обновления при фоновом или явном слиянии через OPTIMIZE TABLE FINAL

-- можно исключить несколько индексов, передав список
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = 'idx_a, idx_b';

-- настройка по умолчанию, индексы не исключаются из обновления при слиянии
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = '';
```


## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="0" />

Когда этому параметру установлено значение больше нуля, слияние немедленно запускается
только на одной реплике, а остальные реплики в течение указанного времени ожидают,
чтобы загрузить результат вместо выполнения локальных слияний. Если выбранная
реплика не завершит слияние за это время, происходит возврат к стандартному
поведению.

Возможные значения:
- Любое положительное целое число.



## fault_probability_after_part_commit {#fault_probability_after_part_commit} 
<SettingsInfoBlock type="Float" default_value="0" />

Для тестирования. Не изменяйте этот параметр.



## fault_probability_before_part_commit {#fault_probability_before_part_commit} 
<SettingsInfoBlock type="Float" default_value="0" />

Для тестирования. Не изменяйте это значение.



## finished_mutations_to_keep {#finished_mutations_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="100" />

Сколько записей о завершённых мутациях сохранять. Если 0, сохраняются все записи.



## force_read_through_cache_for_merges {#force_read_through_cache_for_merges} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

Принудительное чтение через файловый кеш при слияниях



## fsync_after_insert {#fsync_after_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

Выполнять `fsync` для каждой вставленной части данных. Существенно снижает производительность вставок, не рекомендуется использовать с широкими частями.



## fsync_part_directory {#fsync_part_directory} 
<SettingsInfoBlock type="Bool" default_value="0" />

Выполнять fsync для каталога части после завершения всех операций над частью (запись, переименование и т. д.).



## in_memory_parts_enable_wal {#in_memory_parts_enable_wal} 
<SettingsInfoBlock type="Bool" default_value="1" />
Устаревшая настройка, ничего не делает.
## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 
<SettingsInfoBlock type="Bool" default_value="0" />
Устаревшая настройка, ничего не делает.
## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество неактивных частей в одной партиции таблицы превышает
значение `inactive_parts_to_delay_insert`, выполнение `INSERT` искусственно
замедляется.

:::tip
Полезно, если сервер не успевает достаточно быстро удалять части.
:::

Возможные значения:
- Любое положительное целое число.



## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Если число неактивных частей в одной партиции превышает значение
`inactive_parts_to_throw_insert`, выполнение `INSERT` прерывается
с ошибкой:

> "Too many inactive parts (N). Parts cleaning are processing significantly
slower than inserts" exception."

Возможные значения:
- Любое положительное целое число.



## index_granularity {#index_granularity} 
<SettingsInfoBlock type="UInt64" default_value="8192" />

Максимальное количество строк данных между метками индекса. То есть, сколько строк
соответствует одному значению первичного ключа.



## index_granularity_bytes {#index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

Максимальный размер гранулы данных в байтах.

Чтобы ограничить размер гранулы только числом строк, установите значение `0` (не рекомендуется).



## initialization_retry_period {#initialization_retry_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

Интервал между попытками инициализации таблицы, в секундах.



## kill_delay_period {#kill_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />
Устаревшая настройка, ничего не делает.
## kill_delay_period_random_add {#kill_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />
Устаревшая настройка, ничего не делает.
## kill_threads {#kill_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />
Устаревшая настройка, ничего не делает.
## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode} 
<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

По умолчанию облегчённая операция `DELETE` не работает для таблиц с
проекциями. Это связано с тем, что строки в проекции могут затрагиваться
операцией `DELETE`. Поэтому значение по умолчанию — `throw`. Однако эта
настройка может изменить поведение. При значении `drop` или `rebuild`
операции удаления будут работать с проекциями. `drop` удалит проекцию, поэтому
текущий запрос может выполниться быстрее, так как проекция удаляется, но
будущие запросы могут выполняться медленнее, так как проекция отсутствует.
`rebuild` будет перестраивать проекцию, что может повлиять на производительность
текущего запроса, но может ускорить будущие запросы. Преимущество в том, что эти
режимы работают только на уровне парта, то есть проекции в парте, который не
затрагивается операцией, останутся нетронутыми, и для них не будет инициировано
никаких действий, таких как удаление или перестроение.

Возможные значения:
- `throw`
- `drop`
- `rebuild`



## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

Если включено вместе с [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge),
количество удалённых строк в существующих частях данных будет вычисляться при
запуске таблицы. Учтите, что это может замедлить загрузку таблицы при запуске.

Возможные значения:
- `true`
- `false`

**См. также**
- настройка [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge)



## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations} 
<SettingsInfoBlock type="Seconds" default_value="120" />

Для фоновых операций, таких как слияния, мутации и т. д. Количество секунд ожидания при получении блокировок таблиц до возникновения ошибки.



## marks_compress_block_size {#marks_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

Размер блока сжатия меток — фактический размер блока, который сжимается.



## marks_compression_codec {#marks_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

Кодек сжатия, используемый для меток. Метки достаточно малы и кэшируются, поэтому по умолчанию используется сжатие ZSTD(3).



## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "New setting"}]}]}/>


Когда настройка включена, при слияниях для новых партий создаются и сохраняются пропускающие индексы.
В противном случае они могут быть созданы/сохранены явной командой [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)
или [во время операций INSERT](/operations/settings/settings.md/#materialize_skip_indexes_on_insert).

См. также [exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge) для более детального управления.



## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

Пересчитывать сведения о TTL только при выполнении MATERIALIZE TTL



## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Проверка «too many parts» в соответствии с `parts_to_delay_insert` и
`parts_to_throw_insert` будет выполняться только в том случае, если средний размер куска (в
соответствующей партиции) не превышает указанного порога. Если он
превышает указанный порог, операции INSERT не будут ни задерживаться, ни
отклоняться. Это позволяет иметь сотни терабайт в одной таблице на
одном сервере, если куски успешно объединяются в более крупные. Это
не влияет на пороги для неактивных кусков или общего количества кусков.



## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="161061273600" />

Максимальный суммарный размер кусков (в байтах), которые могут быть объединены в один кусок при наличии достаточных ресурсов. Примерно соответствует максимально возможному размеру куска, создаваемого автоматическим фоновым слиянием. (0 означает отключение слияний)

Возможные значения:

- Любое неотрицательное целое число.

Планировщик слияний периодически анализирует размеры и количество кусков в
разделах и, если в пуле достаточно свободных ресурсов, запускает фоновые слияния. Слияния выполняются до тех пор, пока общий размер исходных кусков
не превысит `max_bytes_to_merge_at_max_space_in_pool`.

Слияния, инициированные командой [OPTIMIZE FINAL](/sql-reference/statements/optimize),
игнорируют `max_bytes_to_merge_at_max_space_in_pool` (учитывается только свободное место на диске).



## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="1048576" />

Максимальный суммарный размер частей (в байтах), которые будут слиты в одну
часть при минимально доступных ресурсах фонового пула.

Возможные значения:
- Любое положительное целое число.

`max_bytes_to_merge_at_min_space_in_pool` задаёт максимальный суммарный размер
частей, которые могут быть слиты, несмотря на недостаток доступного дискового
пространства (в пуле). Это необходимо для уменьшения количества мелких частей
и вероятности возникновения ошибок `Too many parts`.
Слияния резервируют дисковое пространство, удваивая суммарные размеры
сливаемых частей. Таким образом, при небольшом количестве свободного места
на диске может возникнуть ситуация, при которой свободное место есть, но оно
уже зарезервировано выполняющимися крупными слияниями, поэтому другие слияния
не могут запуститься, и количество мелких частей растёт с каждой вставкой данных.



## max_cleanup_delay_period {#max_cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="300" />

Максимальный период для очистки старых журналов очереди, хешей блоков и частей.



## max_compress_block_size {#max_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер блоков несжатых данных перед сжатием при записи
в таблицу. Эту настройку также можно задать в глобальных настройках
(см. настройку [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size)).
Значение, указанное при создании таблицы, переопределяет глобальное
значение этой настройки.



## max&#95;concurrent&#95;queries

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное число запросов, которые могут выполняться одновременно для таблицы MergeTree.
Запросы также будут ограничены другими настройками `max_concurrent_queries`.

Возможные значения:

* Положительное целое число.
* `0` — без ограничения.

Значение по умолчанию: `0` (без ограничения).

**Пример**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```


## max&#95;delay&#95;to&#95;insert

<SettingsInfoBlock type="UInt64" default_value="1" />

Значение в секундах, которое используется для расчёта задержки `INSERT`, если
число активных частей в одной партиции превышает значение
[parts&#95;to&#95;delay&#95;insert](#parts_to_delay_insert).

Возможные значения:

* Любое положительное целое число.

Задержка операции `INSERT` (в миллисекундах) рассчитывается по формуле:

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```

Например, если у партиции 299 активных частей и parts&#95;to&#95;throw&#95;insert
= 300, parts&#95;to&#95;delay&#95;insert = 150, max&#95;delay&#95;to&#95;insert = 1, выполнение `INSERT`
задерживается на `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000`
миллисекунд.

Начиная с версии 23.1 формула изменена на:

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

Например, если в разделе 224 активные части и parts&#95;to&#95;throw&#95;insert
= 300, parts&#95;to&#95;delay&#95;insert = 150, max&#95;delay&#95;to&#95;insert = 1,
min&#95;delay&#95;to&#95;insert&#95;ms = 10, выполнение `INSERT` задерживается на `max( 10, 1 * 1000 *
(224 - 150 + 1) / (300 - 150) ) = 500` миллисекунд.


## max_delay_to_mutate_ms {#max_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальная задержка мутации таблицы MergeTree в миллисекундах при большом количестве
незавершённых мутаций



## max_digestion_size_per_segment {#max_digestion_size_per_segment} 
<SettingsInfoBlock type="UInt64" default_value="268435456" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "268435456"},{"label": "Устаревшая настройка"}]}]}/>



Устаревшая настройка, ничего не делает.
## max_file_name_length {#max_file_name_length} 
<SettingsInfoBlock type="UInt64" default_value="127" />

Максимальная длина имени файла, при которой оно остается без изменений, без хеширования.
Применяется только в том случае, если включена настройка `replace_long_file_name_to_hash`.
Значение этой настройки не включает длину расширения файла, поэтому
рекомендуется задавать его ниже максимальной длины имени файла (обычно 255
байт) с некоторым запасом, чтобы избежать ошибок файловой системы.



## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="75" />

Не применять `ALTER`, если количество файлов для изменения (удаления, добавления)
превышает значение этой настройки.

Возможные значения:

- Любое положительное целое число.

Значение по умолчанию: 75



## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="50" />

Не применять ALTER, если количество файлов для удаления больше этого
значения.

Возможные значения:
- Любое положительное целое число.



## max_merge_delayed_streams_for_parallel_write {#max_merge_delayed_streams_for_parallel_write} 
<SettingsInfoBlock type="UInt64" default_value="40" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "New setting"}]}]}/>


Максимальное количество потоков (столбцов), которые могут сбрасываться на диск параллельно
(аналог `max_insert_delayed_streams_for_parallel_write` для слияний). Работает
только для вертикальных слияний.



## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />

Максимальное время ожидания перед следующей попыткой выбрать части для слияния после того, как ни одна часть не была выбрана. Более низкое значение приведёт к более частому выбору задач в background_schedule_pool, что в крупных кластерах приведёт к большому количеству запросов к ZooKeeper.



## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="2" />
Если количество слияний с записями TTL в пуле превышает заданное значение, не назначать новые слияния с TTL. Это позволяет оставить свободные потоки для обычных слияний и избежать ошибки «Too many parts».



## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает количество мутаций частей для одной реплики указанным значением.
Нулевое значение означает отсутствие ограничения на количество мутаций для реплики (выполнение по-прежнему может ограничиваться другими настройками).



## max_part_loading_threads {#max_part_loading_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(16)'" />
Устаревшая настройка, не используется.
## max_part_removal_threads {#max_part_removal_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(16)'" />
Устаревшая настройка, не используется.
## max_partitions_to_read {#max_partitions_to_read} 
<SettingsInfoBlock type="Int64" default_value="-1" />

Ограничивает максимальное число партиций, к которым можно обратиться в одном запросе.

Значение настройки, указанное при создании таблицы, может быть переопределено
на уровне запроса.

Возможные значения:
- Любое положительное целое число.

Вы также можете задать настройку сложности запроса [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)
на уровне запроса, сессии или профиля.



## max_parts_in_total {#max_parts_in_total} 
<SettingsInfoBlock type="UInt64" default_value="100000" />

Если общее количество активных частей во всех партициях таблицы превышает
значение `max_parts_in_total`, выполнение `INSERT` прерывается с исключением `Too many parts
(N)`.

Возможные значения:
- Любое положительное целое число.

Большое количество частей в таблице снижает производительность запросов ClickHouse
и увеличивает время запуска ClickHouse. Чаще всего это является следствием
некорректного проектирования (ошибки при выборе стратегии партиционирования — слишком мелкие партиции).



## max_parts_to_merge_at_once {#max_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="100" />

Максимальное количество частей, которые могут быть объединены за один раз (0 — отключено). Не влияет на запрос OPTIMIZE FINAL.



## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />

Максимальное время откладывания повторного выполнения неудачных мутаций.



## max_postpone_time_for_failed_replicated_fetches_ms {#max_postpone_time_for_failed_replicated_fetches_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Added new setting to enable postponing fetch tasks in the replication queue."}]}]}/>


Максимальное время, на которое откладываются неудачные операции fetch репликации.



## max_postpone_time_for_failed_replicated_merges_ms {#max_postpone_time_for_failed_replicated_merges_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Добавлена настройка для отложения задач слияния в очереди репликации."}]}]}/>


Максимальное время отложения неудавшихся реплицируемых слияний.



## max_postpone_time_for_failed_replicated_tasks_ms {#max_postpone_time_for_failed_replicated_tasks_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "Добавлена новая настройка для отложенного выполнения задач в очереди репликации."}]}]}/>


Максимальное время, на которое откладывается неуспешная задача репликации. Значение используется, если задача не является операцией `fetch`, `merge` или `mutation`.



## max_projections {#max_projections} 
<SettingsInfoBlock type="UInt64" default_value="25" />

Максимальное количество проекций MergeTree.



## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает максимальную скорость сетевого обмена данными в байтах в секунду для [реплицированных](../../engines/table-engines/mergetree-family/replication.md) операций fetch. Этот параметр применяется к конкретной таблице, в отличие от настройки [`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth), которая применяется к серверу.

Вы можете ограничить как сетевой трафик сервера, так и трафик для конкретной таблицы, но для этого значение настройки на уровне таблицы должно быть меньше, чем на уровне сервера. В противном случае сервер учитывает только настройку
`max_replicated_fetches_network_bandwidth_for_server`.

Настройка не всегда соблюдается с идеальной точностью.

Возможные значения:

- Положительное целое число.
- `0` — без ограничений.

Значение по умолчанию: `0`.

**Использование**

Можно использовать для ограничения скорости при репликации данных при добавлении или замене узлов.



## max_replicated_logs_to_keep {#max_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

Сколько записей может быть в журнале ClickHouse Keeper при наличии неактивной
реплики. Неактивная реплика считается потерянной, когда количество записей превышает это значение.

Возможные значения:
- Любое положительное целое число.



## max_replicated_merges_in_queue {#max_replicated_merges_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

Сколько заданий по слиянию и мутации частей может одновременно находиться
в очереди ReplicatedMergeTree.



## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1" />

Сколько задач по слиянию частей с TTL может выполняться одновременно в очереди ReplicatedMergeTree.



## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="8" />

Сколько задач по изменению частей данных может одновременно находиться в очереди ReplicatedMergeTree.



## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает максимальную скорость обмена данными по сети в байтах в
секунду для [реплицированных](/engines/table-engines/mergetree-family/replacingmergetree)
отправок. Этот параметр применяется к конкретной таблице, в отличие от
параметра [`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth),
который применяется ко всему серверу.

Вы можете ограничить как сетевой трафик сервера, так и трафик для
конкретной таблицы, но для этого значение параметра на уровне таблицы
должно быть меньше, чем на уровне сервера. В противном случае сервер
учитывает только параметр
`max_replicated_sends_network_bandwidth_for_server`.

Параметр не обеспечивает идеальной точности.

Возможные значения:

- Положительное целое число.
- `0` — без ограничений.

**Использование**

Может использоваться для ограничения скорости при репликации данных при
добавлении или замене узлов.



## max_suspicious_broken_parts {#max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="100" />

Если количество повреждённых кусков данных в одной партиции превышает
значение `max_suspicious_broken_parts`, автоматическое удаление не выполняется.

Возможные значения:
- Любое положительное целое число.



## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Максимальный суммарный размер всех повреждённых частей; при превышении — автоматическое удаление запрещается.

Возможные значения:
- Любое положительное целое число.



## max_uncompressed_bytes_in_patches {#max_uncompressed_bytes_in_patches} 
<SettingsInfoBlock type="UInt64" default_value="32212254720" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32212254720"},{"label": "New setting"}]}]}/>


Максимальный несжатый объём данных во всех patch-частях в байтах.
Если объём данных во всех patch-частях превышает это значение, облегчённые обновления будут отклонены.
0 - без ограничений.



## merge_max_block_size {#merge_max_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="8192" />

Количество строк, считываемых в память из сливаемых частей.

Возможные значения:
- Любое положительное целое число.

Слияние считывает строки из частей блоками по `merge_max_block_size` строк,
затем сливает их и записывает результат в новую часть. Считываемый блок
размещается в оперативной памяти, поэтому `merge_max_block_size` влияет на
объём ОЗУ, необходимый для слияния. Таким образом, операции слияния могут
потреблять большой объём ОЗУ для таблиц с очень широкими строками (если
средний размер строки составляет 100 КБ, то при слиянии 10 частей
(100 КБ * 10 * 8192) = ~ 8 ГБ ОЗУ). Уменьшая `merge_max_block_size`, вы можете
сократить объём ОЗУ, необходимый для слияния, но замедлите выполнение слияния.



## merge_max_block_size_bytes {#merge_max_block_size_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

Сколько байт должно быть в блоках, формируемых при операциях слияния. По умолчанию
имеет то же значение, что и `index_granularity_bytes`.



## merge_max_bytes_to_prewarm_cache {#merge_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>


Доступен только в ClickHouse Cloud. Максимальный размер части (compact или packed) для предварительного прогрева кэша во время слияния.



## merge_max_dynamic_subcolumns_in_wide_part {#merge_max_dynamic_subcolumns_in_wide_part} 
<SettingsInfoBlock type="UInt64Auto" default_value="auto" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "auto"},{"label": "Добавлена новая настройка для ограничения количества динамических подстолбцов (subcolumns) в части данных формата Wide после слияния, независимо от параметров, указанных в типе данных"}]}]}/>


Максимальное количество динамических подстолбцов (subcolumns), которое может быть создано в каждом столбце части данных формата Wide после слияния.
Позволяет уменьшить количество файлов, создаваемых в части данных формата Wide, независимо от динамических параметров, указанных в типе данных.

Например, если таблица имеет столбец типа JSON(max_dynamic_paths=1024) и настройка merge_max_dynamic_subcolumns_in_wide_part установлена в значение 128,
то после слияния в часть данных формата Wide количество динамических путей в этой части будет уменьшено до 128, и только 128 путей будут записаны как динамические подстолбцы.



## merge_selecting_sleep_ms {#merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />

Минимальное время ожидания перед повторной попыткой выбрать части для слияния, если при предыдущей попытке ни одна часть не была выбрана. Более низкое значение приводит к более частому выбору задач в background_schedule_pool, что в крупных кластерах вызывает большое количество запросов к ZooKeeper.



## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor} 
<SettingsInfoBlock type="Float" default_value="1.2" />

Время ожидания для задачи выбора слияний умножается на этот коэффициент, когда
нет доступных слияний, и делится на него, когда слияние назначено.



## merge_selector_algorithm {#merge_selector_algorithm} 

<ExperimentalBadge/>
<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

Алгоритм выбора частей данных при назначении слияний



## merge_selector_base {#merge_selector_base} 
<SettingsInfoBlock type="Float" default_value="5" />
Влияет на амплификацию записи при выполнении назначенных слияний (настройка для экспертов, не изменяйте ее, если не понимаете, что она делает). Применяется к селекторам слияний Simple и StochasticSimple.



## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Определяет, когда срабатывает логика в зависимости от числа частей в партиции.
Чем больше этот коэффициент, тем более запоздалой будет реакция.



## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right} 
<SettingsInfoBlock type="Bool" default_value="1" />

Включить эвристический алгоритм выбора частей для слияния, который удаляет части с правого края диапазона, если их размер меньше заданной доли (0.01) суммарного размера (sum_size).
Работает для селекторов слияния Simple и StochasticSimple.



## merge_selector_window_size {#merge_selector_window_size} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

Сколько частей рассматривать одновременно.



## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="16106127360" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>


Доступна только в ClickHouse Cloud. Максимальный суммарный размер частей данных для предварительного прогрева
кэша во время слияния.



## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds} 
<SettingsInfoBlock type="UInt64" default_value="2592000" />
Устаревшая настройка, не оказывает никакого эффекта.
## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="1" />

Задает интервал в секундах, через который ClickHouse выполняет очистку старых
частей, журналов WAL и мутаций.

Возможные значения:
- Любое положительное целое число.



## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="60" />

Задает интервал в секундах, через который ClickHouse выполняет очистку старых
временных директорий.

Возможные значения:
- Любое положительное целое число.



## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached} 
<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревшая настройка, ничего не делает.
## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

Минимальная задержка в секундах перед повторным выполнением слияния с перекомпрессией по TTL.



## merge_with_ttl_timeout {#merge_with_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

Минимальная задержка в секундах перед повторным выполнением слияния с TTL удаления.



## merge_workload {#merge_workload} 


Используется для управления тем, как ресурсы расходуются и распределяются между слияниями и другими нагрузками. Указанное значение применяется как значение параметра `workload` для фоновых слияний этой таблицы. Если значение не указано (пустая строка), вместо него используется серверный параметр `merge_workload`.

**См. также**
- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)



## min_absolute_delay_to_close {#min_absolute_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальная абсолютная задержка перед закрытием, остановкой обслуживания запросов и прекращением возврата статуса OK при проверке состояния.



## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

Следует ли применять настройку `min_age_to_force_merge_seconds` только ко всей партиции,
а не к её части.

По умолчанию эта настройка игнорирует параметр `max_bytes_to_merge_at_max_space_in_pool` (см.
`enable_max_bytes_limit_for_min_age_to_force_merge`).

Возможные значения:
- true, false



## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Объединяет части, если каждая часть в диапазоне старше значения
`min_age_to_force_merge_seconds`.

По умолчанию игнорирует настройку `max_bytes_to_merge_at_max_space_in_pool`
(см. `enable_max_bytes_limit_for_min_age_to_force_merge`).

Возможные значения:
- Положительное целое число.



## min_bytes_for_compact_part {#min_bytes_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревшая настройка, не используется.
## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Доступно только в ClickHouse Cloud. Минимальный несжатый размер в байтах для
использования полного типа хранилища для части данных вместо упакованного.



## min_bytes_for_wide_part {#min_bytes_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

Минимальное количество байт/строк в части данных, которая может храниться в формате `Wide`. Можно задать один, оба или ни один из этих параметров.



## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>


Минимальный размер (в несжатых байтах) данных для предварительного прогрева кэша меток и кэша первичного индекса для новых частей



## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает минимальный объём данных в байтах для включения балансировки при распределении новых крупных
частей по дискам тома [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures).

Возможные значения:

- Положительное целое число.
- `0` — балансировка отключена.

**Использование**

Значение настройки `min_bytes_to_rebalance_partition_over_jbod` не должно
быть меньше значения
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)
/ 1024. В противном случае ClickHouse генерирует исключение.



## min_compress_block_size {#min_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный размер блоков несжатых данных, необходимый для сжатия при
записи следующей метки. Этот параметр можно также задать в глобальных настройках
(см. параметр [min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size)).
Значение, указанное при создании таблицы, переопределяет глобальное значение
этого параметра.



## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество сжатых байт, после загрузки которых для части выполняется fsync (0 — отключено)



## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный объём сжатых данных (в байтах), после которого выполняется fsync части после слияния (0 — отключено)



## min_delay_to_insert_ms {#min_delay_to_insert_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

Минимальная задержка вставки данных в таблицу MergeTree в миллисекундах, если
в одной партиции имеется много неслитых частей.



## min_delay_to_mutate_ms {#min_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

Минимальная задержка выполнения мутаций таблицы MergeTree в миллисекундах при большом количестве незавершённых мутаций



## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество байт, которое должно быть свободно на диске для
вставки данных. Если количество доступных свободных байт меньше
`min_free_disk_bytes_to_perform_insert`, выбрасывается исключение, и
вставка не выполняется. Обратите внимание, что этот параметр:
- учитывает параметр `keep_free_space_bytes`;
- не учитывает объём данных, который будет записан операцией
`INSERT`;
- проверяется только в том случае, если указано положительное (ненулевое) количество байт.

Возможные значения:
- Любое положительное целое число.

:::note
Если заданы и `min_free_disk_bytes_to_perform_insert`, и `min_free_disk_ratio_to_perform_insert`,
ClickHouse будет использовать то значение, которое позволит выполнять
вставки при большем объёме свободного дискового пространства.
:::



## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 
<SettingsInfoBlock type="Float" default_value="0" />

Минимальное отношение свободного пространства на диске к общему объёму диска для выполнения `INSERT`. Должно быть числом с плавающей запятой в диапазоне от 0 до 1. Обратите внимание, что этот параметр:
- учитывает значение параметра `keep_free_space_bytes`;
- не учитывает объём данных, который будет записан операцией
`INSERT`;
- проверяется только в том случае, если указано положительное (ненулевое) значение отношения.

Возможные значения:
- Float, 0.0–1.0

Обратите внимание, что если заданы оба параметра — `min_free_disk_ratio_to_perform_insert` и
`min_free_disk_bytes_to_perform_insert`, ClickHouse будет ориентироваться на то значение,
которое позволит выполнять вставки при большем объёме свободного дискового пространства.



## min_index_granularity_bytes {#min_index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1024" />

Минимально допустимый размер гранул данных в байтах.

Чтобы предотвратить случайное создание таблиц с очень низким значением
`index_granularity_bytes`.



## min_level_for_full_part_storage {#min_level_for_full_part_storage} 
<SettingsInfoBlock type="UInt32" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>


Доступно только в ClickHouse Cloud. Минимальный уровень парта,
начиная с которого используется полный тип хранилища для части данных вместо упакованного



## min_level_for_wide_part {#min_level_for_wide_part} 
<SettingsInfoBlock type="UInt32" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>


Минимальный уровень парта, начиная с которого часть данных создаётся в формате `Wide` вместо `Compact`.



## min&#95;marks&#95;to&#95;honor&#95;max&#95;concurrent&#95;queries

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество меток, считываемых запросом, при котором применяется настройка [max&#95;concurrent&#95;queries](#max_concurrent_queries).

:::note
Запросы по-прежнему будут ограничены другими настройками `max_concurrent_queries`.
:::

Возможные значения:

* Положительное целое число.
* `0` — Отключено (ограничение `max_concurrent_queries` не применяется к запросам).

**Пример**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```


## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

Минимальный объем данных для операции слияния, при котором используется прямой
I/O-доступ к диску хранения. При слиянии частей данных ClickHouse вычисляет
суммарный объем всех данных, подлежащих слиянию. Если объем превышает
`min_merge_bytes_to_use_direct_io` байт, ClickHouse читает и записывает
данные на диск хранения, используя интерфейс прямого ввода-вывода (опция `O_DIRECT`).
Если `min_merge_bytes_to_use_direct_io = 0`, прямой ввод-вывод отключен.



## min_parts_to_merge_at_once {#min_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество частей данных, которые селектор слияния может выбрать для слияния за один раз
(настройка для экспертов, не изменяйте, если не понимаете, что она делает).
0 — отключено. Работает для селекторов слияния Simple и StochasticSimple.



## min_relative_delay_to_close {#min_relative_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="300" />

Минимальное относительное отставание от других реплик, при достижении которого реплика закрывается, прекращает обслуживать
запросы и перестаёт возвращать Ok при проверке статуса.



## min_relative_delay_to_measure {#min_relative_delay_to_measure} 
<SettingsInfoBlock type="UInt64" default_value="120" />

Вычислять относительную задержку реплики только если абсолютная задержка не меньше заданного значения.



## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership} 
<SettingsInfoBlock type="UInt64" default_value="120" />
Устаревшая настройка, ничего не делает.
## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="10" />

Хранить примерно указанное количество последних записей в журнале ZooKeeper, даже если они
устарели. Не влияет на работу таблиц: используется только для диагностики журнала
ZooKeeper перед очисткой.

Возможные значения:
- Любое положительное целое число.



## min_rows_for_compact_part {#min_rows_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревшая настройка, не используется.
## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Доступна только в ClickHouse Cloud. Минимальное количество строк для использования полного типа хранения части данных вместо упакованного.



## min_rows_for_wide_part {#min_rows_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное число строк, при котором часть данных создаётся в формате `Wide` вместо `Compact`.



## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество строк, при котором выполняется fsync для части после слияния (0 — отключено)



## mutation_workload {#mutation_workload} 


Используется для управления использованием и распределением ресурсов между мутациями и другими типами нагрузок. Указанное значение используется как значение настройки `workload` для фоновых мутаций этой таблицы. Если не указано (пустая строка), то вместо этого используется серверная настройка `mutation_workload`.

**См. также**
- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)



## non_replicated_deduplication_window {#non_replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Количество последних вставленных блоков в нереплицируемой
таблице [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md), 
для которых хранятся хэш-суммы, используемые для проверки на дубликаты.

Возможные значения:
- Любое положительное целое число.
- `0` (отключить дедупликацию).

Используется механизм дедупликации, аналогичный реплицируемым таблицам (см.
настройку [replicated_deduplication_window](#replicated_deduplication_window)).
Хэш-суммы созданных частей записываются в локальный файл на диске.



## notify_newest_block_number {#notify_newest_block_number} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


Сообщать в SharedJoin или SharedSet о последнем номере блока. Доступно только в ClickHouse Cloud.



## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation} 
<SettingsInfoBlock type="UInt64" default_value="20" />

Если количество свободных слотов в пуле меньше указанного значения, мутации частей не
выполняются. Это позволяет оставить свободные потоки для обычных слияний и
избежать ошибок «Too many parts».

Возможные значения:
- Любое положительное целое число.

**Использование**

Значение настройки `number_of_free_entries_in_pool_to_execute_mutation`
должно быть меньше значения [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)
* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio).
В противном случае ClickHouse сгенерирует исключение.



## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition} 
<SettingsInfoBlock type="UInt64" default_value="25" />

Когда количество свободных слотов в пуле меньше указанного значения, не
выполнять оптимизацию всей партиции в фоновом режиме (эта задача создаётся,
когда задан `min_age_to_force_merge_seconds` и включён
`min_age_to_force_merge_on_partition_only`). Это нужно для того, чтобы оставить свободные потоки
для обычных слияний и избежать ошибки «Too many parts».

Возможные значения:
- Положительное целое число.

Значение настройки `number_of_free_entries_in_pool_to_execute_optimize_entire_partition`
должно быть меньше произведения
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)
* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio).
В противном случае ClickHouse генерирует исключение.



## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge} 
<SettingsInfoBlock type="UInt64" default_value="8" />

Когда количество свободных элементов в пуле
(или реплицированной очереди) становится меньше указанного значения,
начинается понижение максимального размера слияния для обработки
(или постановки в очередь).
Это позволяет обрабатывать небольшие слияния, не заполняя пул
долго выполняющимися слияниями.

Возможные значения:
- Любое положительное целое число.



## number_of_mutations_to_delay {#number_of_mutations_to_delay} 
<SettingsInfoBlock type="UInt64" default_value="500" />
Если в таблице имеется как минимум
такое количество незавершённых мутаций, выполнение мутаций для этой таблицы искусственно замедляется.
Параметр отключается при значении 0



## number_of_mutations_to_throw {#number_of_mutations_to_throw} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

Если в таблице есть как минимум указанное количество незавершённых мутаций, генерируется исключение «Too many mutations».
Опция отключается при значении 0.



## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


Доступно только в ClickHouse Cloud. Для слияния рассматриваются до N партиций с наибольшим приоритетом. Партиции выбираются случайным взвешенным образом, где вес равен количеству частей данных, которые можно объединить в этой партиции.



## object_serialization_version {#object_serialization_version} 
<SettingsInfoBlock type="MergeTreeObjectSerializationVersion" default_value="v2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Add a setting to control JSON serialization versions"}]}]}/>


Версия сериализации для типа данных JSON. Необходима для обеспечения совместимости.

Возможные значения:
- `v1`
- `v2`
- `v3`

Только версия `v3` поддерживает изменение версии сериализации разделяемых данных.



## object_shared_data_buckets_for_compact_part {#object_shared_data_buckets_for_compact_part} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "Добавлена настройка для управления числом бакетов для общих данных при JSON-сериализации в компактных партах"}]}]}/>


Число бакетов для JSON-сериализации общих данных в компактных партах. Работает с сериализациями общих данных `map_with_buckets` и `advanced`.



## object_shared_data_buckets_for_wide_part {#object_shared_data_buckets_for_wide_part} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="32" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32"},{"label": "Добавлена настройка для управления количеством бакетов для общих данных при JSON-сериализации в широких частях"}]}]}/>


Количество бакетов для JSON-сериализации общих данных в широких частях. Работает с сериализациями общих данных `map_with_buckets` и `advanced`.



## object_shared_data_serialization_version {#object_shared_data_serialization_version} 
<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Add a setting to control JSON serialization versions"}]}]}/>


Версия сериализации для общих данных внутри типа данных JSON.

Возможные значения:
- `map` — хранить общие данные как `Map(String, String)`
- `map_with_buckets` — хранить общие данные в виде нескольких отдельных столбцов `Map(String, String)`. Использование бакетов (buckets) улучшает чтение отдельных путей из общих данных.
- `advanced` — специальная сериализация общих данных, предназначенная для значительного ускорения чтения отдельных путей из общих данных.
Обратите внимание, что эта сериализация увеличивает объем занимаемого общими данными места на диске, поскольку хранится много дополнительной информации.

Количество бакетов для сериализаций `map_with_buckets` и `advanced` определяется настройками
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part).



## object_shared_data_serialization_version_for_zero_level_parts {#object_shared_data_serialization_version_for_zero_level_parts} 
<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Добавлена настройка для управления версиями сериализации JSON для частей нулевого уровня"}]}]}/>


Этот параметр позволяет задать версию сериализации разделяемых данных типа JSON для частей нулевого уровня, которые создаются при вставках.
Рекомендуется не использовать `advanced`-сериализацию разделяемых данных для частей нулевого уровня, поскольку это может значительно увеличить время вставки данных.



## old_parts_lifetime {#old_parts_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="480" />

Время (в секундах) хранения неактивных частей для защиты от потери данных
во время неожиданных перезагрузок сервера.

Возможные значения:
- Любое положительное целое число.

После слияния нескольких частей в новую часть ClickHouse помечает исходные
части как неактивные и удаляет их только по истечении `old_parts_lifetime` секунд.
Неактивные части удаляются, если они не используются текущими запросами, то есть если
`refcount` части равен 1.

Для новых частей не вызывается `fsync`, поэтому некоторое время новые части существуют
только в RAM сервера (кэше ОС). Если произойдёт неожиданная перезагрузка сервера, новые
части могут быть потеряны или повреждены. Для защиты данных неактивные части не удаляются
сразу.

При запуске ClickHouse проверяет целостность частей. Если слитая
часть повреждена, ClickHouse возвращает неактивные части в список активных
и позже снова их сливает. Затем повреждённая часть переименовывается (добавляется префикс `broken_`)
и перемещается в каталог `detached`. Если слитая часть
не повреждена, исходные неактивные части переименовываются (добавляется префикс `ignored_`)
и перемещаются в каталог `detached`.

Значение по умолчанию для `dirty_expire_centisecs` (настройка ядра Linux) — 30
секунд (максимальное время, в течение которого записанные данные хранятся только в RAM), но при
большой нагрузке на дисковую подсистему данные могут быть записаны значительно позже. Экспериментально
для `old_parts_lifetime` было выбрано значение 480 секунд, в течение которых
новая часть гарантированно будет записана на диск.



## optimize_row_order {#optimize_row_order} 
<SettingsInfoBlock type="Bool" default_value="0" />

Управляет оптимизацией порядка строк во время вставок, чтобы повысить
степень сжатия только что вставленной части таблицы.

Оказывает влияние только на обычные таблицы движка MergeTree. Не влияет на
специализированные таблицы движка MergeTree (например, CollapsingMergeTree).

Таблицы MergeTree могут (опционально) сжиматься с использованием [кодеков сжатия](/sql-reference/statements/create/table#column_compression_codec).
Универсальные кодеки сжатия, такие как LZ4 и ZSTD, достигают максимальных коэффициентов
сжатия, если данные демонстрируют выраженные шаблоны. Длинные последовательности
одинаковых значений обычно очень хорошо сжимаются.

Если этот параметр включен, ClickHouse пытается сохранить данные во вновь
вставляемых частях в таком порядке строк, который минимизирует количество
последовательностей одинаковых значений по столбцам новой части таблицы.
Другими словами, небольшое количество последовательностей одинаковых значений
означает, что отдельные последовательности длинные и хорошо сжимаются.

Нахождение оптимального порядка строк вычислительно неразрешимо (NP-трудно).
Поэтому ClickHouse использует эвристику, чтобы быстро найти порядок строк,
который всё же улучшает коэффициенты сжатия по сравнению с исходным порядком строк.

<details markdown="1">

<summary>Эвристика поиска порядка строк</summary>

В общем случае строки таблицы (или части таблицы) можно свободно
переставлять, так как SQL считает одну и ту же таблицу (часть таблицы) с разным
порядком строк эквивалентной.

Эта свобода перестановки строк ограничивается, когда для таблицы определён
первичный ключ. В ClickHouse первичный ключ `C1, C2, ..., CN` требует, чтобы
строки таблицы были отсортированы по столбцам `C1`, `C2`, ... `Cn` ([кластеризованный индекс](https://en.wikipedia.org/wiki/Database_index#Clustered)).
В результате строки можно переставлять только внутри «классов эквивалентности»
строк, то есть строк, имеющих одинаковые значения в столбцах первичного ключа.
Интуитивно понятно, что первичные ключи с высокой кардинальностью, например
первичные ключи, включающие столбец временной метки типа `DateTime64`,
приводят к большому количеству маленьких классов эквивалентности. Аналогично,
таблицы с первичным ключом низкой кардинальности создают небольшое количество
больших классов эквивалентности. Таблица без первичного ключа представляет
собой крайний случай одного класса эквивалентности, охватывающего все строки.

Чем меньше по количеству и чем крупнее по размеру классы эквивалентности,
тем выше степень свободы при повторной перестановке строк.

Эвристика, применяемая для нахождения наилучшего порядка строк внутри каждого
класса эквивалентности, предложена D. Lemire, O. Kaser в
[Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002)
и основана на сортировке строк внутри каждого класса эквивалентности
по возрастанию кардинальности столбцов, не входящих в первичный ключ.

Она выполняет три шага:
1. Найти все классы эквивалентности на основе значений строк в столбцах первичного ключа.
2. Для каждого класса эквивалентности вычислить (обычно оценить) кардинальности
столбцов, не входящих в первичный ключ.
3. Для каждого класса эквивалентности отсортировать строки в порядке возрастания
кардинальности столбцов, не входящих в первичный ключ.

</details>

При включении этого параметра операции вставки несут дополнительные затраты
CPU на анализ и оптимизацию порядка строк новых данных. Ожидается, что операции
INSERT будут выполняться на 30–50% дольше в зависимости от характеристик данных.
Коэффициенты сжатия LZ4 или ZSTD в среднем улучшаются на 20–40%.

Этот параметр лучше всего работает для таблиц без первичного ключа или с
первичным ключом низкой кардинальности, то есть для таблиц с небольшим числом
различных значений первичного ключа. Первичные ключи высокой кардинальности,
например включающие столбцы временной метки типа `DateTime64`, маловероятно
получат выигрыш от этого параметра.



## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="30" />

Время ожидания перед и после перемещения частей между шардами.



## part_moves_between_shards_enable {#part_moves_between_shards_enable} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="0" />

Экспериментальная/незавершённая возможность перемещения частей между шардами. Не учитывает
выражения для шардинга.



## parts_to_delay_insert {#parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

Если количество активных частей в одном разделе превышает значение
`parts_to_delay_insert`, выполнение `INSERT` искусственно замедляется.

Возможные значения:
- Любое положительное целое число.

ClickHouse искусственно увеличивает время выполнения `INSERT` (добавляет "sleep"), чтобы
фоновый процесс слияния мог объединять части быстрее, чем они добавляются.



## parts_to_throw_insert {#parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="3000" />

Если количество активных частей в одном разделе превышает значение
`parts_to_throw_insert`, выполнение `INSERT` прерывается с исключением
`Too many parts (N). Merges are processing significantly slower than inserts`.

Возможные значения:
- Любое положительное целое число.

Для достижения максимальной производительности запросов `SELECT` необходимо
минимизировать количество обрабатываемых частей, см. [Merge Tree](/development/architecture#merge-tree).

До версии 23.6 этот параметр имел значение 300. Вы можете задать
более высокое значение — это уменьшит вероятность ошибки `Too many parts`,
но при этом производительность `SELECT` может снизиться. Также в случае
проблем со слияниями (например, из‑за недостатка дискового пространства) вы
обнаружите их позже, чем при исходном значении 300.




## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

Если сумма размеров кусков превышает этот порог и время, прошедшее с момента создания
записи в журнале репликации, превышает
`prefer_fetch_merged_part_time_threshold`, то предпочтительнее получать
слитый кусок с реплики, чем выполнять слияние локально. Это позволяет
ускорить очень долгие слияния.

Возможные значения:
- Любое положительное целое число.



## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="3600" />

Если время, прошедшее с момента создания записи в журнале репликации (ClickHouse Keeper или ZooKeeper),
превышает это пороговое значение и суммарный размер частей
больше, чем `prefer_fetch_merged_part_size_threshold`, то предпочтительнее получить
слитую часть с реплики вместо выполнения слияния локально. Это позволяет ускорить очень долгие слияния.

Возможные значения:
- Любое положительное целое число.



## prewarm_mark_cache {#prewarm_mark_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
Если установлено значение true, кэш меток будет предварительно прогреваться путём сохранения меток в кэш при вставках, слияниях, выборках и при запуске сервера.



## prewarm_primary_key_cache {#prewarm_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Если имеет значение `true`, кэш первичного индекса
будет предварительно прогреваться путём сохранения меток в кэше меток при вставках, слияниях,
чтениях и при запуске сервера.



## primary_key_compress_block_size {#primary_key_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

Размер первичного блока сжатия — фактический размер блока, подлежащего сжатию.



## primary_key_compression_codec {#primary_key_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

Кодек сжатия, используемый для первичного ключа. Поскольку первичный ключ достаточно мал и кэшируется, кодеком сжатия по умолчанию является ZSTD(3).



## primary_key_lazy_load {#primary_key_lazy_load} 
<SettingsInfoBlock type="Bool" default_value="1" />
Загружает первичный ключ в память при первом использовании, а не при инициализации таблицы. Это может сэкономить память при наличии большого числа таблиц.



## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns} 
<SettingsInfoBlock type="Float" default_value="0.9" />

Если значение столбца первичного ключа в части данных меняется как минимум в
такой доле случаев, последующие столбцы не загружаются в память. Это позволяет экономить
память за счёт того, что не загружаются неиспользуемые столбцы первичного ключа.



## ratio&#95;of&#95;defaults&#95;for&#95;sparse&#95;serialization

<SettingsInfoBlock type="Float" default_value="0.9375" />

Минимальное отношение количества *значений по умолчанию* к количеству *всех* значений
в столбце. При таком значении столбец хранится с использованием
разреженной сериализации.

Если столбец разреженный (содержит преимущественно нули), ClickHouse может кодировать его
в разреженном формате и автоматически оптимизировать вычисления — данные не требуют
полной декомпрессии при выполнении запросов. Чтобы включить эту разреженную
сериализацию, задайте настройку `ratio_of_defaults_for_sparse_serialization`
меньше 1.0. Если значение больше или равно 1.0,
столбцы всегда будут записываться с использованием обычной полной сериализации.

Возможные значения:

* Число с плавающей запятой между `0` и `1` для включения разреженной сериализации
* `1.0` (или больше), если вы не хотите использовать разреженную сериализацию

**Пример**

Обратите внимание, что столбец `s` в следующей таблице содержит пустую строку в 95%
строк. В `my_regular_table` мы не используем разреженную сериализацию, а в
`my_sparse_table` задаём `ratio_of_defaults_for_sparse_serialization`, равный
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

Обратите внимание, что столбец `s` в `my_sparse_table` использует меньше дискового пространства:

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

Вы можете проверить, используется ли в столбце разрежённое кодирование, просмотрев
столбец `serialization_kind` в таблице `system.parts_columns`:

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

Вы можете увидеть, какие части `s` были сохранены с помощью разреженной сериализации:

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
<SettingsInfoBlock type="UInt64" default_value="5000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5000"},{"label": "Cloud sync"}]}]}/>


Доступен только в ClickHouse Cloud. Минимальное время ожидания перед повторной попыткой
уменьшить количество блокирующих частей, если ни один диапазон не был
удалён или заменён. Более низкое значение приводит к более частому запуску задач в
`background_schedule_pool`, что в крупных кластерах приводит к большому числу запросов
к ZooKeeper.



## refresh_parts_interval {#refresh_parts_interval} 
<SettingsInfoBlock type="Seconds" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "A new setting"}]}]}/>


Если значение больше нуля, периодически обновляет список частей данных из базовой файловой системы, чтобы проверить, были ли данные обновлены на уровне хранилища.
Может быть задано только в том случае, если таблица размещена на дисках только для чтения (что означает, что это реплика только для чтения, а данные записываются другой репликой).



## refresh_statistics_interval {#refresh_statistics_interval} 
<SettingsInfoBlock type="Seconds" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>


Интервал обновления кэша статистики в секундах. Если значение равно нулю, обновление отключено.



## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="10800" />

Когда эта настройка имеет значение больше нуля, только одна реплика немедленно
запускает слияние, если объединённая часть находится в общем хранилище.

:::note
Репликация zero-copy не готова для промышленной эксплуатации.
Репликация zero-copy по умолчанию отключена в ClickHouse версии 22.8 и
выше.

Эту функцию не рекомендуется использовать в промышленной эксплуатации.
:::

Возможные значения:
- Любое положительное целое число.



## remote_fs_zero_copy_path_compatible_mode {#remote_fs_zero_copy_path_compatible_mode} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

Выполнять операции zero-copy в совместимом режиме в процессе конвертации.



## remote_fs_zero_copy_zookeeper_path {#remote_fs_zero_copy_zookeeper_path} 

<ExperimentalBadge/>
<SettingsInfoBlock type="String" default_value="/clickhouse/zero_copy" />

Путь в ZooKeeper для информации механизма zero-copy, не зависящей от таблиц.



## remove_empty_parts {#remove_empty_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

Удалять пустые части, образовавшиеся после применения TTL, мутаций или алгоритма слияния Collapsing.



## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="1" />

Настройка для экспериментальной, ещё не завершённой функции.



## remove_unused_patch_parts {#remove_unused_patch_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>


Удаляет в фоновом режиме части патча, уже применённые ко всем активным частям.



## replace_long_file_name_to_hash {#replace_long_file_name_to_hash} 
<SettingsInfoBlock type="Bool" default_value="1" />

Если имя файла столбца слишком длинное (более 'max_file_name_length' байт), заменять его на SipHash128



## replicated_can_become_leader {#replicated_can_become_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />

Если `true`, реплики реплицируемых таблиц на этом узле будут пытаться стать лидером.

Возможные значения:
- `true`
- `false`



## replicated_deduplication_window {#replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "10000"},{"label": "increase default value"}]}]}/>


Количество последних вставленных блоков, для которых ClickHouse Keeper хранит
хэш-суммы для проверки наличия дубликатов.

Возможные значения:
- Любое положительное целое число.
- 0 (отключить дедупликацию)

Команда `INSERT` создает один или несколько блоков (частей). Для
[дедупликации вставок](../../engines/table-engines/mergetree-family/replication.md)
при записи в реплицируемые таблицы ClickHouse записывает хэш-суммы
созданных частей в ClickHouse Keeper. Хэш-суммы хранятся только для
последних `replicated_deduplication_window` блоков. Самые старые хэш-суммы
удаляются из ClickHouse Keeper.

Слишком большое значение `replicated_deduplication_window` замедляет `INSERT`,
поскольку нужно сравнивать больше записей. Хэш-сумма вычисляется из
сочетания имен и типов полей и данных вставляемой
части (потока байт).



## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

Количество последних блоков асинхронных вставок, для которых ClickHouse Keeper
хранит хэш-суммы для проверки на дубликаты.

Возможные значения:
- Любое положительное целое число.
- 0 (отключить дедупликацию для async_inserts)

Команда [Async Insert](/operations/settings/settings#async_insert) будет
записана в один или несколько блоков (частей). Для [дедупликации вставок](/engines/table-engines/mergetree-family/replication),
при записи в реплицируемые таблицы ClickHouse записывает хэш-суммы каждой
вставки в ClickHouse Keeper. Хэш-суммы хранятся только для последних
`replicated_deduplication_window_for_async_inserts` блоков. Самые старые хэш-суммы
удаляются из ClickHouse Keeper.
Большое значение `replicated_deduplication_window_for_async_inserts` замедляет
`Async Inserts`, потому что нужно сравнивать больше записей.
Хэш-сумма вычисляется на основе комбинации имён и типов полей,
а также данных вставки (потока байт).



## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds} 
<SettingsInfoBlock type="UInt64" default_value="3600" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3600"},{"label": "decrease default value"}]}]}/>


Количество секунд, по истечении которых хэш-суммы вставленных блоков
удаляются из ClickHouse Keeper.

Возможные значения:
- Любое положительное целое число.

Аналогично [replicated_deduplication_window](#replicated_deduplication_window),
`replicated_deduplication_window_seconds` определяет, как долго хранить хэш-суммы
блоков для дедупликации вставок. Хэш-суммы старше
`replicated_deduplication_window_seconds` удаляются из ClickHouse Keeper,
даже если они моложе, чем `replicated_deduplication_window`.

Время отсчитывается относительно момента самой последней записи, а не
реального времени (wall time). Если это единственная запись, она будет храниться неограниченное время.



## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="604800" />

Количество секунд, по истечении которых хэш-суммы асинхронных вставок
удаляются из ClickHouse Keeper.

Возможные значения:
- Любое положительное целое число.

Подобно [replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts),
`replicated_deduplication_window_seconds_for_async_inserts` определяет,
как долго хранить хэш-суммы блоков для дедупликации асинхронных вставок. Хэш-суммы,
которые старше `replicated_deduplication_window_seconds_for_async_inserts`,
удаляются из ClickHouse Keeper, даже если их количество меньше
`replicated_deduplication_window_for_async_inserts`.

Время отсчитывается относительно момента самой последней записи, а не
относительно реального времени (wall time). Если это единственная запись, она будет храниться бессрочно.



## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
Устаревший параметр, не используется.
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
Устаревший параметр, не используется.
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
Устаревший параметр, не используется.
## replicated_max_mutations_in_one_entry {#replicated_max_mutations_in_one_entry} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество команд мутаций, которые могут быть объединены и выполнены
в одной записи MUTATE_PART (0 означает без ограничения).



## replicated_max_parallel_fetches {#replicated_max_parallel_fetches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревшая настройка, не используется.
## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host} 
<SettingsInfoBlock type="UInt64" default_value="15" />
Устаревшая настройка, не используется.
## replicated_max_parallel_fetches_for_table {#replicated_max_parallel_fetches_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревшая настройка, не используется.
## replicated_max_parallel_sends {#replicated_max_parallel_sends} 
<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревшая настройка, не используется.
## replicated_max_parallel_sends_for_table {#replicated_max_parallel_sends_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревшая настройка, не используется.
## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts} 
<SettingsInfoBlock type="Float" default_value="0.5" />

Если доля некорректных частей от общего числа частей меньше этого значения, запуск разрешён.

Возможные значения:
- Float, 0.0–1.0



## search_orphaned_parts_disks {#search_orphaned_parts_disks} 
<SettingsInfoBlock type="SearchOrphanedPartsDisks" default_value="any" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "any"},{"label": "New setting"}]}]}/>


ClickHouse сканирует все диски на наличие осиротевших партов при любом выполнении операций ATTACH или CREATE TABLE,
чтобы не допустить потери партов данных на неопределённых дисках (не включённых в политику хранения).
Осиротевшие парты возникают в результате потенциально небезопасной переконфигурации хранилища, например, если диск был исключён из политики хранения.
Этот параметр ограничивает набор дисков для поиска в зависимости от их характеристик.

Возможные значения:
- any — область поиска не ограничена.
- local — область поиска ограничена локальными дисками.
- none — пустая область поиска, поиск не выполняется.



## serialization_info_version {#serialization_info_version} 
<SettingsInfoBlock type="MergeTreeSerializationInfoVersion" default_value="with_types" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_types"},{"label": "Change to the newer format allowing custom string serialization"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "basic"},{"label": "New setting"}]}]}/>


Версия сведений о сериализации, используемая при записи `serialization.json`.
Этот параметр необходим для обеспечения совместимости во время обновлений кластера.

Возможные значения:
- `basic` — базовый формат.
- `with_types` — формат с дополнительным полем `types_serialization_versions`, позволяющим задавать версии сериализации по типам.
Это делает параметры, такие как `string_serialization_version`, задействованными.

Во время поэтапных (rolling) обновлений установите значение `basic`, чтобы новые серверы создавали
части данных, совместимые со старыми серверами. После завершения обновления
переключитесь на `WITH_TYPES`, чтобы включить версии сериализации по типам.



## shared_merge_tree_activate_coordinated_merges_tasks {#shared_merge_tree_activate_coordinated_merges_tasks} 

<BetaBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-2","items": [{"label": "25.8"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-3","items": [{"label": "25.7"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-4","items": [{"label": "25.6"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-5","items": [{"label": "25.10"},{"label": "0"},{"label": "New settings"}]}]}/>


Активирует перепланирование задач координируемых слияний. Может быть полезно даже при
shared_merge_tree_enable_coordinated_merges=0, поскольку в этом случае заполняется статистика
координатора слияний и облегчается холодный старт.



## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Сокращает объём метаданных в Keeper."}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "1"},{"label": "Облачная синхронизация"}]}]}/>


Включает создание узлов /metadata и /columns для каждой реплики в ZooKeeper.
Доступно только в ClickHouse Cloud.



## shared_merge_tree_disable_merges_and_mutations_assignment {#shared_merge_tree_disable_merges_and_mutations_assignment} 
<SettingsInfoBlock type="Bool" default_value="0" />

Отключает назначение слияний для shared merge tree. Доступно только в ClickHouse Cloud



## shared_merge_tree_empty_partition_lifetime {#shared_merge_tree_empty_partition_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="86400" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "86400"},{"label": "New setting"}]}]}/>


Сколько секунд раздел будет храниться в Keeper, если он не содержит частей.



## shared_merge_tree_enable_automatic_empty_partitions_cleanup {#shared_merge_tree_enable_automatic_empty_partitions_cleanup} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>


Включает очистку записей Keeper для пустых партиций.



## shared_merge_tree_enable_coordinated_merges {#shared_merge_tree_enable_coordinated_merges} 

<BetaBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>


Включает стратегию координированных слияний



## shared_merge_tree_enable_keeper_parts_extra_data {#shared_merge_tree_enable_keeper_parts_extra_data} 

<BetaBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>


Включает запись атрибутов в виртуальные части и фиксацию блоков в Keeper



## shared_merge_tree_enable_outdated_parts_check {#shared_merge_tree_enable_outdated_parts_check} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>


Включает проверку устаревших частей. Доступно только в ClickHouse Cloud.



## shared_merge_tree_idle_parts_update_seconds {#shared_merge_tree_idle_parts_update_seconds} 
<SettingsInfoBlock type="UInt64" default_value="3600" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud sync"}]}]}/>


Интервал в секундах для обновления партиций без срабатывания
наблюдателя ZooKeeper (watch) в общем дереве слияний (shared merge tree). Доступен только в ClickHouse Cloud.



## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="50" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "New setting"}]}]}/>


Начальная задержка (backoff) для обновления частей. Доступна только в ClickHouse Cloud.



## shared_merge_tree_interserver_http_connection_timeout_ms {#shared_merge_tree_interserver_http_connection_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "New setting"}]}]}/>


Таймауты межсерверного HTTP-подключения. Параметр доступен только в ClickHouse Cloud.



## shared_merge_tree_interserver_http_timeout_ms {#shared_merge_tree_interserver_http_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>


Тайм-ауты для HTTP-взаимодействия между серверами. Доступно только в ClickHouse Cloud.



## shared_merge_tree_leader_update_period_random_add_seconds {#shared_merge_tree_leader_update_period_random_add_seconds} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


Добавляет к shared_merge_tree_leader_update_period равномерно распределённое случайное значение от 0 до x секунд, чтобы избежать эффекта лавинообразной одновременной нагрузки (thundering herd effect). Параметр доступен только в ClickHouse Cloud



## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds} 
<SettingsInfoBlock type="UInt64" default_value="30" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>


Максимальный интервал между повторными проверками статуса лидера при обновлении частей. Доступен только в
ClickHouse Cloud



## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once} 
<SettingsInfoBlock type="UInt64" default_value="1000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>


Максимальное количество устаревших частей, которое лидер попытается подтвердить к удалению за один HTTP‑запрос. Доступно только в ClickHouse Cloud.



## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "New setting"}]}]}/>


Максимальное время backoff при обновлении частей. Доступен только в ClickHouse Cloud



## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total} 
<SettingsInfoBlock type="UInt64" default_value="6" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>


Максимальное количество лидеров обновления частей. Параметр доступен только в ClickHouse Cloud.



## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az} 
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>


Максимальное количество лидеров обновления частей. Параметр доступен только в ClickHouse Cloud.



## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


Максимальное число реплик, которые будут участвовать в удалении частей (killer‑поток). Доступно только в ClickHouse Cloud.



## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range} 
<SettingsInfoBlock type="UInt64" default_value="5" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>


Максимальное число реплик, которые будут пытаться назначать потенциально конфликтующие слияния (помогает избежать избыточных конфликтов при назначении слияний). Значение 0 отключает этот механизм. Доступно только в ClickHouse Cloud.



## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Максимальное число поврежденных частей SMT; при превышении — запретить автоматическое отсоединение"}]}]}/>


Максимальное число поврежденных частей SMT; при превышении — запретить автоматическое отсоединение.



## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Максимальный размер всех подозрительно повреждённых частей для SMT; при превышении — запретить автоматическое отсоединение"}]}]}/>


Максимальный размер всех подозрительно повреждённых частей для SMT; при превышении — запретить автоматическое отсоединение.



## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds} 
<SettingsInfoBlock type="Int64" default_value="1800" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>


Как долго хранятся идентификаторы мемоизации вставок, чтобы избежать некорректных действий при повторных попытках вставки. Параметр доступен только в ClickHouse Cloud.



## shared_merge_tree_merge_coordinator_election_check_period_ms {#shared_merge_tree_merge_coordinator_election_check_period_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="30000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>


Время между запусками потока выбора координатора слияний



## shared_merge_tree_merge_coordinator_factor {#shared_merge_tree_merge_coordinator_factor} 

<BetaBadge/>
<SettingsInfoBlock type="Float" default_value="1.1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1.100000023841858"},{"label": "Новая настройка"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "1.100000023841858"},{"label": "Уменьшено время ожидания координатора после нагрузки"}]}]}/>


Коэффициент изменения во времени задержки потока координатора



## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms {#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>


Как часто координатор слияний должен синхронизироваться с ZooKeeper, чтобы получать актуальные метаданные.



## shared_merge_tree_merge_coordinator_max_merge_request_size {#shared_merge_tree_merge_coordinator_max_merge_request_size} 

<BetaBadge/>
<SettingsInfoBlock type="UInt64" default_value="20" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>


Количество операций слияния, которые координатор может запросить у MergerMutator одновременно



## shared_merge_tree_merge_coordinator_max_period_ms {#shared_merge_tree_merge_coordinator_max_period_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>


Максимальное время между запусками потока координатора слияний



## shared_merge_tree_merge_coordinator_merges_prepare_count {#shared_merge_tree_merge_coordinator_merges_prepare_count} 

<BetaBadge/>
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>


Количество записей о слияниях, которые координатор должен подготовить и распределить между рабочими узлами



## shared_merge_tree_merge_coordinator_min_period_ms {#shared_merge_tree_merge_coordinator_min_period_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>


Минимальное время между запусками потока-координатора слияний



## shared_merge_tree_merge_worker_fast_timeout_ms {#shared_merge_tree_merge_worker_fast_timeout_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>


Таймаут, который поток merge worker будет использовать, если потребуется обновить своё состояние после немедленного действия.



## shared_merge_tree_merge_worker_regular_timeout_ms {#shared_merge_tree_merge_worker_regular_timeout_ms} 

<BetaBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>


Время между запусками рабочего потока слияния



## shared_merge_tree_outdated_parts_group_size {#shared_merge_tree_outdated_parts_group_size} 
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "2"},{"label": "New setting"}]}]}/>


Сколько реплик будет находиться в одной группе rendezvous-хеша для очистки устаревших частей.
Доступно только в ClickHouse Cloud.



## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations} 
<SettingsInfoBlock type="Float" default_value="0.5" />

Повторно загружает предикат слияния в задаче выбора merge/mutate, если отношение `<candidate
partitions for mutations only (partitions that cannot be merged)>/<candidate
partitions for mutations>` превышает значение этой настройки. Доступно только
в ClickHouse Cloud



## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size} 
<SettingsInfoBlock type="UInt64" default_value="32" />

Количество одновременно назначаемых заданий на выборку метаданных частей. Доступно только в
ClickHouse Cloud



## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


Время хранения локально слитой части без запуска нового слияния, включающего
эту часть. Даёт другим репликам возможность забрать эту часть и начать это слияние.
Доступно только в ClickHouse Cloud.



## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold} 
<SettingsInfoBlock type="UInt64" default_value="1000000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>


Минимальный размер части (в строках), при достижении которого назначение следующего слияния откладывается сразу после её локального слияния. Доступно только в ClickHouse Cloud.



## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>


Время, в течение которого локально слитая часть хранится без запуска нового слияния, включающего
эту часть. Даёт другим репликам возможность запросить эту часть и запустить это слияние.
Доступно только в ClickHouse Cloud.



## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>


Читать виртуальные части с лидера, если это возможно. Доступно только в ClickHouse Cloud



## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новый параметр для получения данных частей из других реплик"}]}]}/>


Если параметр включён, все реплики пытаются получать данные частей, находящиеся в памяти (например, первичный
ключ, информация о партициях и т. д.), из других реплик, где они уже существуют.



## shared_merge_tree_update_replica_flags_delay_ms {#shared_merge_tree_update_replica_flags_delay_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="30000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>


Как часто реплика будет пытаться повторно загружать свои флаги по фоновому расписанию.



## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>


Включает возможность запрашивать подсказки файлового кэша (FS cache) из кэша в памяти на других репликах. Доступно только в ClickHouse Cloud.



## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "Включить устаревшие части v3 по умолчанию"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Облачная синхронизация"}]}]}/>


Использовать компактный формат для устаревших частей: снижает нагрузку на Keeper и улучшает обработку устаревших частей. Доступно только в ClickHouse Cloud



## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


Если включено, счётчик избыточного количества частей будет опираться на общие данные в Keeper, а не на состояние локальной реплики. Доступно только в ClickHouse Cloud



## shared_merge_tree_virtual_parts_discovery_batch {#shared_merge_tree_virtual_parts_discovery_batch} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>


Сколько операций обнаружения партиций следует объединять в один пакет



## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Если имеется много устаревших частей, поток очистки попытается удалить до
`simultaneous_parts_removal_limit` частей за одну итерацию.
Значение `simultaneous_parts_removal_limit`, установленное в `0`, означает отсутствие ограничения.



## sleep_before_commit_local_part_in_replicated_table_ms {#sleep_before_commit_local_part_in_replicated_table_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

Для тестирования. Не изменяйте.



## sleep_before_loading_outdated_parts_ms {#sleep_before_loading_outdated_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Для тестирования. Не изменяйте этот параметр.



## storage_policy {#storage_policy} 
<SettingsInfoBlock type="String" default_value="default" />

Имя политики хранения данных на диске



## string_serialization_version {#string_serialization_version} 
<SettingsInfoBlock type="MergeTreeStringSerializationVersion" default_value="with_size_stream" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_size_stream"},{"label": "Переход на новый формат с отдельными размерами"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "single_stream"},{"label": "Новая настройка"}]}]}/>


Управляет форматом сериализации для столбцов типа `String` верхнего уровня.

Эта настройка действует только, если `serialization_info_version` установлена в значение "with_types".
Если настройка включена, столбцы `String` верхнего уровня сериализуются с отдельным подстолбцом `.size`,
в котором хранятся длины строк, а не встроенные в поток значения. Это позволяет использовать реальные подстолбцы `.size`
и может повысить эффективность сжатия.

Вложенные типы `String` (например, внутри `Nullable`, `LowCardinality`, `Array` или `Map`)
не затрагиваются, за исключением случаев, когда они встречаются в `Tuple`.

Возможные значения:

- `single_stream` — использовать стандартный формат сериализации со встроенными размерами.
- `with_size_stream` — использовать отдельный поток размеров для столбцов `String` верхнего уровня.



## table_disk {#table_disk} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>


Это диск таблицы: путь/endpoint должен указывать на данные таблицы, а не на
данные базы данных. Можно задать только для s3_plain/s3_plain_rewritable/web.



## temporary_directories_lifetime {#temporary_directories_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="86400" />

Количество секунд, в течение которых хранятся каталоги tmp_. Не следует занижать это значение,
так как при слишком низком значении этого параметра слияния и мутации могут не работать.



## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout} 
<SettingsInfoBlock type="Seconds" default_value="7200" />

Тайм-аут (в секундах) перед запуском слияния с перекомпрессией. В течение этого
времени ClickHouse пытается получить перекомпрессированную часть с реплики,
назначенной для этого слияния с перекомпрессией.

Перекомпрессия в большинстве случаев выполняется медленно, поэтому слияние
с перекомпрессией не запускается до истечения этого тайм-аута — в это время
система пытается получить перекомпрессированную часть с реплики, назначенной
для данного слияния с перекомпрессией.

Возможные значения:
- Любое положительное целое число.



## ttl_only_drop_parts {#ttl_only_drop_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, будут ли части данных в таблицах MergeTree полностью удаляться, когда срок действия `TTL` для всех строк в этой части истёк.

Когда `ttl_only_drop_parts` отключён (по умолчанию), удаляются только те строки, срок действия `TTL` для которых истёк.

Когда `ttl_only_drop_parts` включён, вся часть удаляется, если срок действия `TTL` для всех строк в этой части истёк.



## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns} 
<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает использование адаптивных буферов записи при записи динамических подстолбцов для снижения потребления памяти



## use_async_block_ids_cache {#use_async_block_ids_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено значение `true`, хэш-суммы асинхронных вставок кэшируются.

Возможные значения:
- `true`
- `false`

Блок, содержащий несколько асинхронных вставок, будет генерировать несколько хэш-сумм.
Когда часть вставок дублируется, Keeper вернёт только одну
дублированную хэш-сумму в одном RPC, что приведёт к лишним повторным вызовам RPC.
Этот кэш будет отслеживать путь к хэш-суммам в Keeper. Если в Keeper отслеживаются обновления,
кэш обновится как можно быстрее, чтобы мы могли отфильтровывать
дублирующиеся вставки в памяти.



## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization} 
<SettingsInfoBlock type="Bool" default_value="1" />

Включает компактный режим бинарной сериализации дискриминаторов в типе данных Variant.
Этот режим позволяет существенно уменьшить объём памяти, необходимый для хранения дискриминаторов
в частях данных, когда в основном используется один вариант или присутствует много значений NULL.



## use_const_adaptive_granularity {#use_const_adaptive_granularity} 
<SettingsInfoBlock type="Bool" default_value="0" />

Всегда использовать постоянную гранулярность для всей части. Это позволяет сжимать в памяти значения гранулярности индекса. Может быть полезно при экстремально высоких нагрузках и «узких» таблицах.



## use_metadata_cache {#use_metadata_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
Устаревшая настройка, не оказывает эффекта.
## use_minimalistic_checksums_in_zookeeper {#use_minimalistic_checksums_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

Использовать компактный формат (десятки байт) для контрольных сумм частей в ZooKeeper вместо обычного (десятки КБ). Перед включением убедитесь, что все реплики поддерживают новый формат.



## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

Способ хранения заголовков частей данных в ZooKeeper. Если параметр включён, ZooKeeper
хранит меньше данных. Подробности см. [здесь](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper).



## use_primary_key_cache {#use_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Использовать кеш первичного индекса
вместо хранения всех индексов в памяти. Может быть полезно для очень больших таблиц.



## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный (приблизительный) несжатый объём данных объединяемых партов в байтах для активации
вертикального алгоритма слияния.



## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="11" />

Минимальное количество столбцов, не входящих в первичный ключ, для включения вертикального алгоритма слияния.



## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="131072" />

Минимальная (приблизительная) суммарная количество строк в
сливаемых партах для активации алгоритма вертикального слияния.



## vertical_merge_optimize_lightweight_delete {#vertical_merge_optimize_lightweight_delete} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>


Если параметр имеет значение true, выполняется оптимизация легковесного удаления при вертикальных слияниях.



## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch} 
<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено значение `true`, используется предварительная выборка данных из удалённой файловой системы для следующего столбца при слиянии.



## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

Перед завершением работы таблица будет ожидать заданное время, чтобы уникальные части
(существующие только на текущей реплике) были запрошены другими репликами (0 означает, что ожидание отключено).



## write_ahead_log_bytes_to_fsync {#write_ahead_log_bytes_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="104857600" />
Устаревшая настройка, ничего не делает.
## write_ahead_log_interval_ms_to_fsync {#write_ahead_log_interval_ms_to_fsync} 
<SettingsInfoBlock type="UInt64" default_value="100" />
Устаревшая настройка, ничего не делает.
## write_ahead_log_max_bytes {#write_ahead_log_max_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
Устаревшая настройка, ничего не делает.
## write_final_mark {#write_final_mark} 
<SettingsInfoBlock type="Bool" default_value="1" />
Устаревшая настройка, ничего не делает.
## write_marks_for_substreams_in_compact_parts {#write_marks_for_substreams_in_compact_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "По умолчанию включена запись меток для подпотоков в компактных частях"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "Новая настройка"}]}]}/>


Включает запись меток для каждого подпотока вместо каждой колонки в компактных частях.
Это позволяет эффективно читать отдельные подколонки из части данных.

Например, колонка `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` сериализуется в следующие подпотоки:
- `t.a` для данных типа String элемента кортежа `a`
- `t.b` для данных типа UInt32 элемента кортежа `b`
- `t.c.size0` для размеров массива элемента кортежа `c`
- `t.c.null` для null-карты вложенных элементов массива элемента кортежа `c`
- `t.c` для данных типа UInt32 вложенных элементов массива элемента кортежа `c`

Когда эта настройка включена, для каждого из этих 5 подпотоков записывается метка, что означает, что при необходимости можно читать
данные каждого отдельного подпотока из гранулы раздельно. Например, если нужно прочитать подколонку `t.c`, будут прочитаны только данные
подпотоков `t.c.size0`, `t.c.null` и `t.c`, и не будут читаться данные из подпотоков `t.a` и `t.b`. Когда эта настройка выключена,
записывается метка только для колонки верхнего уровня `t`, что означает, что всегда будут читаться все данные колонки из гранулы, даже если нужны только данные некоторых подпотоков.



## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio} 
<SettingsInfoBlock type="Float" default_value="0.05" />

Максимальный процент частей верхнего уровня, удаление которых можно отложить, чтобы получить более мелкие независимые диапазоны. Рекомендуется не изменять это значение.



## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times} 
<SettingsInfoBlock type="UInt64" default_value="5" />

Максимальная глубина рекурсии для разбиения независимых диапазонов устаревших частей на более мелкие поддиапазоны. Не рекомендуется изменять это значение.



## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Если включена zero-copy репликация, перед попыткой захвата блокировки при слиянии или мутации выполняется случайная пауза, величина которой зависит от размера кусков.



## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>


Если включена репликация в режиме zero-copy, делает паузу на случайное время (до 500 мс) перед попыткой захватить блокировку для слияния или мутации.



## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

Периодичность проверки истечения срока действия сессии ZooKeeper, в секундах.

Возможные значения:
- Любое положительное целое число.

