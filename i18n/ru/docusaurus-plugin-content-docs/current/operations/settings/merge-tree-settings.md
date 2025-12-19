---
description: 'Настройки таблиц MergeTree, определённые в `system.merge_tree_settings`'
slug: /operations/settings/merge-tree-settings
title: 'Настройки таблиц MergeTree'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

Системная таблица `system.merge_tree_settings` показывает глобальные настройки MergeTree.

Настройки MergeTree могут быть заданы в секции `merge_tree` конфигурационного файла сервера или указаны отдельно для каждой таблицы `MergeTree` в разделе `SETTINGS` запроса `CREATE TABLE`.

Пример настройки параметра `max_suspicious_broken_parts`:

Настройте значение по умолчанию для всех таблиц `MergeTree` в конфигурационном файле сервера:

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

Задаётся для отдельной таблицы:

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

-- reset to global default (value from system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```

## Настройки MergeTree {#mergetree-settings}

{/* Нижеуказанные настройки автоматически создаются скриптом по адресу 
  https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
  */ }

## adaptive_write_buffer_initial_size {#adaptive_write_buffer_initial_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16384" />

Начальный размер адаптивного буфера записи

## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение `true`, добавляет неявное ограничение для столбца `sign` таблицы CollapsingMergeTree
или VersionedCollapsingMergeTree, чтобы допускать только корректные значения (`1` и `-1`).

## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Когда параметр включён, для всех числовых столбцов таблицы добавляются min-max (пропускающие) индексы.

## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

При включении параметра для всех строковых столбцов таблицы добавляются минимально-максимальные (пропускающие) индексы.

## allow_coalescing_columns_in_partition_or_order_key {#allow_coalescing_columns_in_partition_or_order_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Новый параметр, который разрешает использовать объединяемые столбцы в ключе партиционирования или сортировки."}]}]}/>

При включении разрешает использовать объединяемые столбцы в таблице CoalescingMergeTree в качестве ключа партиционирования или сортировки.

## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает экспериментальные слияния CLEANUP для ReplacingMergeTree со столбцом `is_deleted`. При включении позволяет использовать `OPTIMIZE ... FINAL CLEANUP` для ручного
слияния всех частей в партиции в одну часть и удаления всех
удалённых строк.

Также позволяет включить автоматическое выполнение таких слияний в фоновом режиме
с помощью настроек `min_age_to_force_merge_seconds`,
`min_age_to_force_merge_on_partition_only` и
`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`.

## allow&#95;experimental&#95;reverse&#95;key {#allow_experimental_reverse_key}

<ExperimentalBadge />

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]} />

Включает поддержку сортировки по убыванию в ключах сортировки MergeTree. Этот
параметр особенно полезен для анализа временных рядов и запросов Top-N,
позволяя хранить данные в обратном хронологическом порядке для оптимизации
производительности запросов.

При включённом параметре `allow_experimental_reverse_key` вы можете задавать порядок
сортировки по убыванию в операторе `ORDER BY` таблицы MergeTree. Это позволяет
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
ORDER BY (time DESC, key)  -- Descending order on 'time' field
SETTINGS allow_experimental_reverse_key = 1;

SELECT * FROM example WHERE key = 'xxx' ORDER BY time DESC LIMIT 10;
```

При использовании в запросе `ORDER BY time DESC` будет применён `ReadInOrder`.

**Значение по умолчанию:** false

## allow_floating_point_partition_key {#allow_floating_point_partition_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает возможность использования числа с плавающей запятой в качестве ключа партиции.

Возможные значения:

- `0` — Ключ партиции с плавающей запятой не допускается.
- `1` — Ключ партиции с плавающей запятой допускается.

## allow_nullable_key {#allow_nullable_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использование типов Nullable в качестве первичных ключей.

## allow_part_offset_column_in_projections {#allow_part_offset_column_in_projections} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Теперь проекции могут использовать столбец _part_offset."}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "Новая настройка, она предотвращает создание проекций со столбцом смещения родительской части до стабилизации этого механизма."}]}]}/>

Разрешает использование столбца `_part_offset` в запросах SELECT с проекциями.

## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Теперь SMT по умолчанию будет удалять устаревшие блокирующие части из ZooKeeper"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Синхронизация с Cloud"}]}]}/>

Фоновая задача, которая уменьшает количество блокирующих частей для таблиц SharedMergeTree.
Только в ClickHouse Cloud.

## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Не используйте этот параметр в производственной среде, так как он ещё не готов.

## allow_summing_columns_in_partition_or_order_key {#allow_summing_columns_in_partition_or_order_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "Новый SETTING, разрешающий суммирование столбцов, входящих в ключ партиции или сортировки"}]}]}/>

При включении разрешает использовать суммируемые столбцы в таблице SummingMergeTree в ключе партиции или сортировки.

## allow_suspicious_indices {#allow_suspicious_indices} 

<SettingsInfoBlock type="Bool" default_value="0" />

Отклонять первичные/вторичные индексы и ключи сортировки с одинаковыми выражениями

## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает вертикальные слияния из компактных частей в широкие части. Этот параметр должен иметь одинаковое значение на всех репликах.

## alter_column_secondary_index_mode {#alter_column_secondary_index_mode} 

<SettingsInfoBlock type="AlterColumnSecondaryIndexMode" default_value="rebuild" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "rebuild"},{"label": "Изменено поведение, чтобы разрешить ALTER `column` при наличии зависимых вторичных индексов"}]}]}/>

Определяет, разрешать ли команды `ALTER`, которые изменяют столбцы, для которых построены вторичные индексы, и какое действие выполнять, если они разрешены. По умолчанию такие команды `ALTER` разрешены, и индексы перестраиваются.

Возможные значения:

- `rebuild` (по умолчанию): Перестраивает все вторичные индексы, на которые влияет столбец в команде `ALTER`.
- `throw`: Запрещает любые `ALTER` столбцов, для которых построены вторичные индексы, вызывая исключение.
- `drop`: Удаляет зависимые вторичные индексы. Новые части не будут содержать этих индексов, для их воссоздания потребуется `MATERIALIZE INDEX`.
- `compatibility`: Соответствует исходному поведению: `throw` для `ALTER ... MODIFY COLUMN` и `rebuild` для `ALTER ... UPDATE/DELETE`.
- `ignore`: Предназначен для опытных пользователей. Оставляет индексы в неконсистентном состоянии, что может привести к некорректным результатам запросов.

## always_fetch_merged_part {#always_fetch_merged_part} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение равно true, эта реплика никогда не объединяет части и всегда загружает объединённые части
с других реплик.

Возможные значения:

- true, false

## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks} 

<SettingsInfoBlock type="Bool" default_value="0" />

Всегда копирует данные вместо создания жёстких ссылок при выполнении мутаций, замен, отсоединений и так далее.

## apply_patches_on_merge {#apply_patches_on_merge} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

Если установлено значение true, части‑патчи применяются при слиянии

## assign_part_uuids {#assign_part_uuids} 

<SettingsInfoBlock type="Bool" default_value="0" />

При включении каждой новой части будет присвоен уникальный идентификатор.
Перед включением проверьте, что все реплики поддерживают UUID версии 4.

## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="100" />

Как долго каждая итерация вставки будет ждать обновления async_block_ids_cache.

## async_insert {#async_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если имеет значение true, данные из запроса INSERT помещаются в очередь и позже в фоновом режиме записываются в таблицу.

## auto_statistics_types {#auto_statistics_types} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "New setting"}]}]}/>

Список типов статистики, разделённый запятыми, которые автоматически рассчитываются для всех соответствующих столбцов.
Поддерживаемые типы статистики: tdigest, countmin, minmax, uniq.

## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="50" />

Целевое время выполнения одного шага операции слияния или мутации. Может быть превышено, если один шаг выполняется дольше.

## cache_populated_by_fetch {#cache_populated_by_fetch} 

<SettingsInfoBlock type="Bool" default_value="0" />

:::note
Этот параметр применяется только к ClickHouse Cloud.
:::

Когда `cache_populated_by_fetch` отключен (значение по умолчанию), новые
части данных загружаются в файловый кеш только при выполнении запроса, который
использует эти части.

Если параметр включен, `cache_populated_by_fetch` приведет к тому, что все узлы будут загружать
новые части данных из хранилища в свой файловый кеш без необходимости выполнения запроса
для инициирования такого действия.

**См. также**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)

## cache_populated_by_fetch_filename_regexp {#cache_populated_by_fetch_filename_regexp} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "New setting"}]}]}/>

:::note
Этот параметр применяется только к ClickHouse Cloud.
:::

Если значение не пустое, в кэш после операции fetch (если включен `cache_populated_by_fetch`) будут предварительно загружены только те файлы, которые соответствуют этому регулярному выражению.

## check_delay_period {#check_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="60" />

Устаревший параметр, ничего не делает.

## check_sample_column_is_correct {#check_sample_column_is_correct} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает проверку при создании таблицы, что тип данных столбца для сэмплирования или выражения сэмплирования корректен. Тип данных должен быть одним из беззнаковых
[целочисленных типов](/sql-reference/data-types/int-uint): `UInt8`, `UInt16`,
`UInt32`, `UInt64`.

Возможные значения:

- `true`  — проверка включена.
- `false` — проверка при создании таблицы отключена.

Значение по умолчанию: `true`.

По умолчанию сервер ClickHouse при создании таблицы проверяет тип данных
столбца для сэмплирования или выражения сэмплирования. Если у вас уже есть таблицы с
некорректным выражением сэмплирования и вы не хотите, чтобы сервер генерировал исключение
во время запуска, установите `check_sample_column_is_correct` в значение `false`.

## clean_deleted_rows {#clean_deleted_rows} 

<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />

Устаревшая настройка, не выполняет никаких действий.

## cleanup_delay_period {#cleanup_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="30" />

Минимальный интервал очистки старых логов очереди, хешей блоков и частей.

## cleanup_delay_period_random_add {#cleanup_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />

Добавляет равномерно распределённое значение от 0 до x секунд к cleanup_delay_period,
чтобы избежать эффекта «стада» (thundering herd) и последующей DoS-атаки на ZooKeeper при
очень большом числе таблиц.

## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration} 

<SettingsInfoBlock type="UInt64" default_value="150" />

Предпочитаемый размер пакета для фоновой очистки (points — абстрактная единица, но 1 point
приблизительно соответствует одному вставленному блоку).

## cleanup_threads {#cleanup_threads} 

<SettingsInfoBlock type="UInt64" default_value="128" />

Устаревшая настройка, не оказывает никакого эффекта.

## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Новая настройка для ленивого вычисления размеров столбцов и индексов"}]}]}/>

Вычислять размеры столбцов и вторичных индексов лениво при первом запросе
вместо вычисления при инициализации таблицы.

## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache} 

Список столбцов, для которых нужно предварительно прогреть кэш меток (если включено). Пустое значение означает, что будут использоваться все столбцы.

## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />

Доступен только в ClickHouse Cloud. Максимальное количество байт для записи в
один страйп в компактных частях.

## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="128" />

Доступен только в ClickHouse Cloud. Максимальное число гранул, которые можно записать в одну полосу компактных частей.

## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part} 

<SettingsInfoBlock type="UInt64" default_value="16777216" />

Доступен только в ClickHouse Cloud. Максимальный размер компактной части, которая может быть целиком прочитана в память во время слияния.

## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает создавать таблицу, в которой выражение выборки (sampling expression) не входит в первичный ключ. Параметр нужен только для временного запуска сервера с некорректными таблицами ради обеспечения обратной совместимости.

## compress_marks {#compress_marks} 

<SettingsInfoBlock type="Bool" default_value="1" />

Метки поддерживают сжатие, что уменьшает размер файлов меток и ускоряет их передачу по сети.

## compress_primary_key {#compress_primary_key} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает сжатие первичного ключа. Это уменьшает размер файла первичного ключа и ускоряет передачу данных по сети.

## concurrent_part_removal_threshold {#concurrent_part_removal_threshold} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Включает одновременное удаление частей (см. `max_part_removal_threads`) только если
количество неактивных частей данных не меньше этого значения.

## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode} 

<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "Не разрешать создание неконсистентной проекции"}]}]}/>

Разрешать ли создание проекции для таблицы с неклассическим движком MergeTree,
то есть не (ReplicatedMergeTree, SharedMergeTree). Опция `ignore` предназначена
исключительно для совместимости и может приводить к некорректным результатам.
В противном случае, если создание разрешено, определяет действие при слиянии
проекций: либо `drop`, либо `rebuild`. Классический MergeTree игнорирует
этот параметр. Он также управляет поведением `OPTIMIZE DEDUPLICATE`, при этом
влияет на все движки семейства MergeTree. Аналогично опции
`lightweight_mutation_projection_mode`, действует на уровне частей (parts).

Возможные значения:

- `ignore`
- `throw`
- `drop`
- `rebuild`

## default_compression_codec {#default_compression_codec} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "New setting"}]}]}/>

Определяет кодек сжатия по умолчанию, который будет использоваться, если для конкретного столбца в описании таблицы не задан кодек.
Порядок выбора кодека сжатия для столбца:

1. Кодек сжатия, заданный для столбца в описании таблицы
2. Кодек сжатия, заданный в `default_compression_codec` (данная настройка)
3. Кодек сжатия по умолчанию, заданный в настройках `compression`

Значение по умолчанию: пустая строка (не задано).

## detach_not_byte_identical_parts {#detach_not_byte_identical_parts} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает отсоединение части на реплике после слияния или
мутации, если она не является побайтно идентичной частям на других репликах. Если
параметр отключён, часть удаляется. Включите его, если хотите
проанализировать такие части позже.

Настройка применима к таблицам `MergeTree` с включённой
[репликацией данных](/engines/table-engines/mergetree-family/replacingmergetree).

Возможные значения:

- `0` — части удаляются;
- `1` — части отсоединяются.

## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica} 

<SettingsInfoBlock type="Bool" default_value="1" />

Не удалять старые локальные части при восстановлении потерянной реплики.

Возможные значения:

- `true`
- `false`

## disable_detach_partition_for_zero_copy_replication {#disable_detach_partition_for_zero_copy_replication} 

<SettingsInfoBlock type="Bool" default_value="1" />

Отключает запрос DETACH PARTITION для репликации без копирования данных.

## disable_fetch_partition_for_zero_copy_replication {#disable_fetch_partition_for_zero_copy_replication} 

<SettingsInfoBlock type="Bool" default_value="1" />

Отключает выполнение запроса FETCH PARTITION для репликации без копирования данных.

## disable_freeze_partition_for_zero_copy_replication {#disable_freeze_partition_for_zero_copy_replication} 

<SettingsInfoBlock type="Bool" default_value="1" />

Отключает выполнение запроса FREEZE PARTITION при репликации без копирования данных.

## disk {#disk} 

Имя диска для хранения данных. Можно указать вместо политики хранения.

## dynamic_serialization_version {#dynamic_serialization_version} 

<SettingsInfoBlock type="MergeTreeDynamicSerializationVersion" default_value="v2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Добавлена настройка для управления версиями динамической сериализации"}]}]}/>

Версия сериализации для типа данных Dynamic. Требуется для совместимости.

Возможные значения:

- `v1`
- `v2`
- `v3`

## enable_block_number_column {#enable_block_number_column} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включить сохранение столбца _block_number для каждой строки.

## enable_block_offset_column {#enable_block_offset_column} 

<SettingsInfoBlock type="Bool" default_value="0" />

Сохраняет виртуальный столбец `_block_number` во время слияний.

## enable_index_granularity_compression {#enable_index_granularity_compression} 

<SettingsInfoBlock type="Bool" default_value="1" />

Сжимать значения гранулярности индекса в памяти, если это возможно

## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Добавлена новая настройка для ограничения максимального объёма данных (в байтах) для min_age_to_force_merge."}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Определяет, должны ли настройки `min_age_to_force_merge_seconds` и
`min_age_to_force_merge_on_partition_only` учитывать настройку
`max_bytes_to_merge_at_max_space_in_pool`.

Возможные значения:

- `true`
- `false`

## enable_mixed_granularity_parts {#enable_mixed_granularity_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает переход к управлению размером гранулы с помощью
настройки `index_granularity_bytes`. До версии 19.11 существовала только
настройка `index_granularity` для ограничения размера гранулы. Настройка
`index_granularity_bytes` улучшает производительность ClickHouse при
выборке данных из таблиц с большими строками (десятки и сотни мегабайт).
Если у вас есть таблицы с большими строками, вы можете включить эту настройку для таблиц,
чтобы повысить эффективность запросов `SELECT`.

## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting to allow automatic cleanup merges for ReplacingMergeTree"}]}]}/>

Определяет, следует ли использовать слияния CLEANUP для ReplacingMergeTree при слиянии партиций
до одной части (part). Требует включения `allow_experimental_replacing_merge_with_cleanup`,
`min_age_to_force_merge_seconds` и `min_age_to_force_merge_on_partition_only`.

Возможные значения:

- `true`
- `false`

## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает использование идентификатора endpoint с префиксом имени Zookeeper для реплицируемой таблицы MergeTree.

## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm} 

<SettingsInfoBlock type="UInt64" default_value="1" />

Включает использование вертикального алгоритма слияния.

## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Если этот параметр включен для целевой таблицы запроса на манипуляцию с партициями
(`ATTACH/MOVE/REPLACE PARTITION`), то индексы и проекции в исходной и целевой таблицах должны совпадать.
В противном случае целевая таблица может содержать надмножество индексов и проекций по сравнению с исходной таблицей.

## escape_variant_subcolumn_filenames {#escape_variant_subcolumn_filenames} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Экранирование специальных символов в именах файлов, создаваемых для подстолбцов типа Variant в Wide-частях таблицы MergeTree"}]}]}/>

Экранирует специальные символы в именах файлов, создаваемых для подстолбцов типа данных Variant в Wide-частях таблицы MergeTree. Необходимо для обеспечения совместимости.

## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включен, при выборе частей для слияния используется оценочный реальный размер частей данных (то есть без учета тех строк,
которые были удалены с помощью `DELETE FROM`). Обратите внимание, что это поведение применяется только к тем частям данных,
на которые влияет `DELETE FROM`, выполненный после включения этого SETTING.

Возможные значения:

- `true`
- `false`

**См. также**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts)
настройки

## exclude&#95;materialize&#95;skip&#95;indexes&#95;on&#95;merge {#exclude_materialize_skip_indexes_on_merge}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "Новая настройка."}]}]} />

Исключает указанный через запятую список пропускаемых индексов из построения и хранения во время слияний. Не оказывает
никакого эффекта, если [materialize&#95;skip&#95;indexes&#95;on&#95;merge](#materialize_skip_indexes_on_merge) имеет значение `false`.

Исключённые пропускаемые индексы по‑прежнему будут создаваться и сохраняться явным
запросом [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) или во время операций INSERT в зависимости от
параметра сеанса [materialize&#95;skip&#95;indexes&#95;on&#95;insert](/operations/settings/settings.md/#materialize_skip_indexes_on_insert).

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

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- setting has no effect on INSERTs

-- idx_a will be excluded from update during background or explicit merge via OPTIMIZE TABLE FINAL

-- can exclude multiple indexes by providing a list
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = 'idx_a, idx_b';

-- default setting, no indexes excluded from being updated during merge
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = '';
```

## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold} 

<SettingsInfoBlock type="Seconds" default_value="0" />

Когда эта настройка имеет значение больше нуля, только одна реплика сразу
начинает слияние, а остальные реплики ждут указанное время, чтобы затем
скачать результат вместо выполнения слияний локально. Если выбранная реплика
не завершит слияние за это время, происходит возврат к стандартному
поведению.

Возможные значения:

- Любое положительное целое число.

## fault_probability_after_part_commit {#fault_probability_after_part_commit} 

<SettingsInfoBlock type="Float" default_value="0" />

Используется для тестирования. Не изменяйте его.

## fault_probability_before_part_commit {#fault_probability_before_part_commit} 

<SettingsInfoBlock type="Float" default_value="0" />

Для тестирования. Не изменяйте это значение.

## finished_mutations_to_keep {#finished_mutations_to_keep} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Сколько записей о завершённых мутациях хранить. Если значение равно нулю, сохраняются все записи.

## force_read_through_cache_for_merges {#force_read_through_cache_for_merges} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Принудительное чтение через файловый кеш при выполнении слияний

## fsync_after_insert {#fsync_after_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

Выполнять fsync для каждой вставленной части. Существенно снижает производительность
операций вставки, не рекомендуется использовать с широкими частями.

## fsync_part_directory {#fsync_part_directory} 

<SettingsInfoBlock type="Bool" default_value="0" />

Выполнять fsync для каталога части после выполнения всех операций с частью (записи, переименования и т. д.).

## in_memory_parts_enable_wal {#in_memory_parts_enable_wal} 

<SettingsInfoBlock type="Bool" default_value="1" />

Устаревшая настройка, не оказывает никакого эффекта.

## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 

<SettingsInfoBlock type="Bool" default_value="0" />

Устаревшая настройка, не имеет эффекта.

## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество неактивных частей в одной партиции таблицы превышает
значение `inactive_parts_to_delay_insert`, выполнение `INSERT` искусственно
замедляется.

:::tip
Эта настройка полезна, когда сервер не успевает достаточно быстро очищать части.
:::

Возможные значения:

- Любое положительное целое число.

## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество неактивных частей в одной партиции превышает значение
`inactive_parts_to_throw_insert`, выполнение `INSERT` прерывается
с ошибкой:

> "Too many inactive parts (N). Parts cleaning are processing significantly
slower than inserts".

Возможные значения:

- Любое положительное целое число.

## index_granularity {#index_granularity} 

<SettingsInfoBlock type="UInt64" default_value="8192" />

Максимальное количество строк данных между метками индекса. То есть, сколько строк приходится на одно значение первичного ключа.

## index_granularity_bytes {#index_granularity_bytes} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

Максимальный размер гранул данных в байтах.

Чтобы ограничить размер гранулы только количеством строк, установите значение `0` (не рекомендуется).

## initialization_retry_period {#initialization_retry_period} 

<SettingsInfoBlock type="Seconds" default_value="60" />

Период между повторными попытками инициализации таблицы, в секундах.

## kill_delay_period {#kill_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="30" />

Устаревшая настройка, не используется.

## kill_delay_period_random_add {#kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />

Устаревшая настройка, ни на что не влияет.

## kill_threads {#kill_threads} 

<SettingsInfoBlock type="UInt64" default_value="128" />

Эта настройка устарела и ни на что не влияет.

## lightweight_mutation_projection_mode {#lightweight_mutation_projection_mode} 

<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

По умолчанию легковесное удаление `DELETE` не работает для таблиц с
проекциями. Это связано с тем, что строки в проекции могут быть затронуты
операцией `DELETE`. Поэтому значение по умолчанию — `throw`. Однако эта
настройка может изменить поведение. При значении `drop` или `rebuild`
удаления будут работать с проекциями. `drop` удалит проекцию, поэтому
текущий запрос может выполняться быстрее, так как проекция удаляется, но
будущие запросы могут выполняться медленнее, так как проекция отсутствует. `rebuild` перестроит
проекцию, что может повлиять на производительность текущего запроса, но
может ускорить выполнение будущих запросов. Преимущество в том, что эти варианты действуют
только на уровне части, то есть проекции в частях, которых операция не
затрагивает, останутся нетронутыми и не вызовут никаких действий, таких как
drop или rebuild.

Возможные значения:

- `throw`
- `drop`
- `rebuild`

## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён вместе с [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge),
количество удалённых строк для существующих частей данных будет вычисляться при
запуске таблицы. Имейте в виду, что это может замедлить загрузку таблицы при её запуске.

Возможные значения:

- `true`
- `false`

**См. также**

- настройка [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge)

## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations} 

<SettingsInfoBlock type="Seconds" default_value="120" />

Для фоновых операций, таких как слияния, мутации и т. д. Определяет, сколько секунд ожидать, прежде чем признать попытку получения блокировок таблицы неудачной.

## marks_compress_block_size {#marks_compress_block_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

Размер блока сжатия меток; фактический размер сжимаемого блока.

## marks_compression_codec {#marks_compression_codec} 

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

Кодек сжатия, используемый для меток. Метки достаточно малы и кэшируются, поэтому по умолчанию используется ZSTD(3).

## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Если настройка включена, во время слияний для новых частей создаются и сохраняются индексы пропуска.
В противном случае они могут быть созданы/сохранены явной командой [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)
или [во время INSERT](/operations/settings/settings.md/#materialize_skip_indexes_on_insert).

См. также [exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge) для более точного управления.

## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only} 

<SettingsInfoBlock type="Bool" default_value="0" />

Пересчитывать информацию о TTL только при выполнении MATERIALIZE TTL

## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Проверка 'too many parts' в соответствии с 'parts_to_delay_insert' и
'parts_to_throw_insert' будет активна только в том случае, если средний размер части (в
соответствующей партиции) не превышает указанного порога. Если он
превышает указанный порог, операции INSERT не будут ни задерживаться, ни
отклоняться. Это позволяет иметь сотни терабайт в одной таблице на
одном сервере, если части успешно объединяются в более крупные части. Это
не влияет на пороги для неактивных частей или общего количества частей.

## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool} 

<SettingsInfoBlock type="UInt64" default_value="161061273600" />

Максимальный суммарный размер частей (в байтах), которые могут быть объединены в одну часть, если доступно достаточно ресурсов. Примерно соответствует максимальному возможному размеру части, создаваемой автоматическим фоновым слиянием. (0 означает, что слияния будут отключены)

Возможные значения:

- Любое неотрицательное целое число.

Планировщик слияний периодически анализирует размеры и количество частей в
партициях и, если в пуле достаточно свободных ресурсов, запускает фоновые слияния. Слияния выполняются до тех пор, пока суммарный размер исходных частей
не превысит `max_bytes_to_merge_at_max_space_in_pool`.

Слияния, инициированные командой [OPTIMIZE FINAL](/sql-reference/statements/optimize),
игнорируют `max_bytes_to_merge_at_max_space_in_pool` (учитывается только свободное место на диске).

## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Максимальный суммарный размер частей (в байтах), который может быть объединён в одну часть
при минимально доступных ресурсах в фоновом пуле.

Возможные значения:

- Любое положительное целое число.

`max_bytes_to_merge_at_min_space_in_pool` определяет максимальный суммарный размер
частей, которые могут быть объединены, несмотря на нехватку доступного дискового пространства (в пуле).
Это необходимо для уменьшения количества мелких частей и вероятности ошибок
`Too many parts`.
Слияния резервируют дисковое пространство, удваивая суммарный размер объединяемых частей.
Таким образом, при небольшом количестве свободного места на диске может возникнуть ситуация,
когда свободное пространство есть, но оно уже зарезервировано выполняющимися крупными слияниями,
поэтому другие слияния не могут запускаться, и количество мелких частей растёт
с каждой вставкой.

## max_cleanup_delay_period {#max_cleanup_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="300" />

Максимальный интервал для очистки старых журналов очереди, хэшей блоков и частей.

## max_compress_block_size {#max_compress_block_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер блоков несжатых данных перед сжатием при записи
в таблицу. Этот параметр также можно задать в глобальных настройках
(см. параметр [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size)).
Значение, указанное при создании таблицы, переопределяет глобальное
значение этого параметра.

## max&#95;concurrent&#95;queries {#max_concurrent_queries}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество одновременно выполняемых запросов для таблицы MergeTree.
Запросы по-прежнему будут ограничены другими настройками `max_concurrent_queries`.

Возможные значения:

* Положительное целое число.
* `0` — без ограничений.

Значение по умолчанию: `0` (без ограничений).

**Пример**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```

## max&#95;delay&#95;to&#95;insert {#max_delay_to_insert}

<SettingsInfoBlock type="UInt64" default_value="1" />

Значение в секундах, используемое для вычисления задержки операции `INSERT`, если
количество активных частей в одной партиции превышает значение
[parts&#95;to&#95;delay&#95;insert](#parts_to_delay_insert).

Возможные значения:

* Любое положительное целое число.

Задержка (в миллисекундах) для `INSERT` вычисляется по формуле:

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```

Например, если у партиции есть 299 активных частей и parts&#95;to&#95;throw&#95;insert
= 300, parts&#95;to&#95;delay&#95;insert = 150, max&#95;delay&#95;to&#95;insert = 1, то `INSERT`
задерживается на `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000`
миллисекунд.

Начиная с версии 23.1 формула была изменена:

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

Например, если у партиции 224 активные части и parts&#95;to&#95;throw&#95;insert
= 300, parts&#95;to&#95;delay&#95;insert = 150, max&#95;delay&#95;to&#95;insert = 1,
min&#95;delay&#95;to&#95;insert&#95;ms = 10, `INSERT` задерживается на `max( 10, 1 * 1000 *
(224 - 150 + 1) / (300 - 150) ) = 500` миллисекунд.

## max_delay_to_mutate_ms {#max_delay_to_mutate_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальная задержка мутации таблицы MergeTree в миллисекундах при большом количестве
незавершённых мутаций

## max_digestion_size_per_segment {#max_digestion_size_per_segment} 

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "268435456"},{"label": "Устаревшая настройка"}]}]}/>

Устаревшая настройка, ни на что не влияет.

## max_file_name_length {#max_file_name_length} 

<SettingsInfoBlock type="UInt64" default_value="127" />

Максимальная длина имени файла, при которой оно сохраняется как есть, без хеширования.
Применяется только если включена настройка `replace_long_file_name_to_hash`.
Значение этой настройки не включает длину расширения файла. Поэтому
рекомендуется задавать его меньше максимальной длины имени файла (обычно 255
байт) с некоторым запасом, чтобы избежать ошибок файловой системы.

## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns} 

<SettingsInfoBlock type="UInt64" default_value="75" />

Не применять ALTER, если число файлов для изменения (удаления, добавления)
превышает значение этой настройки.

Возможные значения:

- Любое положительное целое число.

Значение по умолчанию: 75

## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns} 

<SettingsInfoBlock type="UInt64" default_value="50" />

Не применять ALTER, если количество файлов для удаления больше значения этой
настройки.

Возможные значения:

- Любое положительное целое число.

## max_merge_delayed_streams_for_parallel_write {#max_merge_delayed_streams_for_parallel_write} 

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "New setting"}]}]}/>

Максимальное количество потоков (столбцов), которые могут одновременно сбрасываться
(аналог max_insert_delayed_streams_for_parallel_write при слияниях). Работает
только для вертикальных слияний.

## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms} 

<SettingsInfoBlock type="UInt64" default_value="60000" />

Максимальное время ожидания перед повторной попыткой выбрать части для слияния после того, как не была выбрана ни одна часть. Меньшее значение приводит к более частому выбору задач в background_schedule_pool, что в крупномасштабных кластерах приводит к большому количеству запросов к ZooKeeper.

## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool} 

<SettingsInfoBlock type="UInt64" default_value="2" />

Когда количество слияний с записями TTL в пуле превышает указанное значение, новые слияния с TTL не назначаются. Это позволяет сохранить свободные потоки для обычных слияний и избежать ошибки «Too many parts».

## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает количество мутаций частей на одну реплику до указанного значения.
Ноль означает отсутствие ограничения на число мутаций на реплику (выполнение всё равно может быть ограничено другими настройками).

## max_part_loading_threads {#max_part_loading_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

Устаревшая настройка, не оказывает никакого эффекта.

## max_part_removal_threads {#max_part_removal_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

Устаревший параметр, не оказывает эффекта.

## max_partitions_to_read {#max_partitions_to_read} 

<SettingsInfoBlock type="Int64" default_value="-1" />

Ограничивает максимальное количество партиций, которые могут быть прочитаны в одном запросе.

Значение настройки, заданное при создании таблицы, может быть переопределено
на уровне запроса.

Возможные значения:

- Любое положительное целое число.

Вы также можете задать настройку сложности запроса [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)
на уровне запроса / сессии / профиля.

## max_parts_in_total {#max_parts_in_total} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

Если общее количество активных частей во всех партициях таблицы превышает
значение `max_parts_in_total`, выполнение `INSERT` прерывается с исключением `Too many parts (N)`.

Возможные значения:

- Любое положительное целое число.

Большое количество частей в таблице снижает производительность запросов ClickHouse
и увеличивает время запуска ClickHouse. Чаще всего это является следствием
некорректного проектирования (ошибки при выборе стратегии партиционирования — слишком маленькие
партиции).

## max_parts_to_merge_at_once {#max_parts_to_merge_at_once} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Максимальное количество частей, которые могут быть объединены одновременно (0 — отключено). Не влияет на запрос OPTIMIZE FINAL.

## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms} 

<SettingsInfoBlock type="UInt64" default_value="300000" />

Максимальное время откладывания неудавшихся мутаций.

## max_postpone_time_for_failed_replicated_fetches_ms {#max_postpone_time_for_failed_replicated_fetches_ms} 

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Добавлена новая настройка, позволяющая откладывать задачи выборки в очереди репликации."}]}]}/>

Максимальное время откладывания неуспешных операций выборки в процессе репликации.

## max_postpone_time_for_failed_replicated_merges_ms {#max_postpone_time_for_failed_replicated_merges_ms} 

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Добавлен новый параметр, позволяющий откладывать задачи слияния в очереди репликации."}]}]}/>

Максимальное время откладывания неуспешных операций слияния в реплицируемых таблицах.

## max_postpone_time_for_failed_replicated_tasks_ms {#max_postpone_time_for_failed_replicated_tasks_ms} 

<SettingsInfoBlock type="UInt64" default_value="300000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "Добавлена настройка, позволяющая откладывать задачи в очереди репликации."}]}]}/>

Максимальное время откладывания выполнения задачи репликации, завершившейся с ошибкой. Это значение применяется, если задача не является операцией fetch, merge или mutation.

## max_projections {#max_projections} 

<SettingsInfoBlock type="UInt64" default_value="25" />

Максимальное количество проекций для таблиц MergeTree.

## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает максимальную скорость обмена данными по сети в байтах в секунду для выборок в
[реплицируемых](../../engines/table-engines/mergetree-family/replication.md)
таблицах. Этот параметр применяется к конкретной таблице, в отличие от
параметра [`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth),
который применяется к серверу.

Вы можете ограничить как сетевой трафик сервера, так и трафик для конкретной таблицы, но для
этого значение параметра на уровне таблицы должно быть меньше, чем на уровне сервера.
В противном случае сервер учитывает только параметр
`max_replicated_fetches_network_bandwidth_for_server`.

Ограничение по этому параметру соблюдается не строго точно.

Возможные значения:

- Положительное целое число.
- `0` — Без ограничений.

Значение по умолчанию: `0`.

**Использование**

Может использоваться для ограничения скорости репликации данных при добавлении
или замене узлов.

## max_replicated_logs_to_keep {#max_replicated_logs_to_keep} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Сколько записей может находиться в журнале ClickHouse Keeper, если есть неактивная
реплика. Неактивная реплика считается утерянной при превышении этого значения.

Возможные значения:

- Любое положительное целое число.

## max_replicated_merges_in_queue {#max_replicated_merges_in_queue} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Сколько задач по слиянию и мутации частей может одновременно находиться в очереди ReplicatedMergeTree.

## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue} 

<SettingsInfoBlock type="UInt64" default_value="1" />

Сколько задач по слиянию частей с TTL одновременно допускается в очереди ReplicatedMergeTree.

## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue} 

<SettingsInfoBlock type="UInt64" default_value="8" />

Сколько задач по модификации частей может одновременно находиться в
очереди ReplicatedMergeTree.

## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает максимальную скорость обмена данными по сети в байтах в
секунду для отправки данных из [реплицируемых таблиц](/engines/table-engines/mergetree-family/replacingmergetree).
Этот параметр применяется к конкретной таблице, в отличие от
настройки [`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth),
которая применяется ко всему серверу.

Вы можете ограничить как сетевую пропускную способность сервера, так и
сетевую пропускную способность для конкретной таблицы, но для этого
значение параметра на уровне таблицы должно быть меньше серверного.
В противном случае сервер учитывает только настройку
`max_replicated_sends_network_bandwidth_for_server`.

Настройка не гарантирует абсолютно точного соблюдения ограничения.

Возможные значения:

- Положительное целое число.
- `0` — без ограничений.

**Использование**

Может использоваться для ограничения скорости репликации данных при
добавлении или замене узлов.

## max_suspicious_broken_parts {#max_suspicious_broken_parts} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Если количество повреждённых частей в одной партиции превышает значение
`max_suspicious_broken_parts`, автоматическое удаление не выполняется.

Возможные значения:

- Любое положительное целое число.

## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Максимальный суммарный размер всех повреждённых частей; если он превышен, автоматическое удаление запрещается.

Возможные значения:

- Любое положительное целое число.

## max_uncompressed_bytes_in_patches {#max_uncompressed_bytes_in_patches} 

<SettingsInfoBlock type="UInt64" default_value="32212254720" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32212254720"},{"label": "Новая настройка"}]}]}/>

Максимальный несжатый объём данных во всех патч-частях, в байтах.
Если объём данных во всех патч-частях превышает это значение, легковесные обновления отклоняются.
0 — без ограничений.

## merge_max_block_size {#merge_max_block_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8192" />

Количество строк, которые считываются из сливаемых частей в память.

Возможные значения:

- Любое положительное целое число.

При слиянии строки считываются из частей блоками по `merge_max_block_size` строк, затем
объединяются и результат записывается в новую часть. Считываемый блок помещается в оперативную память,
поэтому `merge_max_block_size` влияет на объем оперативной памяти, необходимый для слияния.
Таким образом, операции слияния могут потреблять большой объем оперативной памяти для таблиц с очень широкими строками
(если средний размер строки — 100 KB, то при слиянии 10 частей
(100 KB * 10 * 8192) = ~ 8 GB оперативной памяти). Уменьшая `merge_max_block_size`,
вы можете сократить объем оперативной памяти, необходимый для слияния, но при этом замедлите его.

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

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "auto"},{"label": "Добавлен новый SETTING для ограничения числа динамических подстолбцов в Wide-части после слияния, независимо от параметров, указанных в типе данных"}]}]}/>

Максимальное количество динамических подстолбцов, которое может быть создано в каждом столбце Wide-части данных после слияния.
Это позволяет уменьшить число файлов, создаваемых в Wide-части данных, независимо от динамических параметров, указанных в типе данных.

Например, если таблица имеет столбец типа JSON(max_dynamic_paths=1024), а значение merge_max_dynamic_subcolumns_in_wide_part установлено в 128,
после слияния в Wide-часть данных количество динамических путей в этой части будет уменьшено до 128, и только 128 путей будет записано как динамические подстолбцы.

## merge_selecting_sleep_ms {#merge_selecting_sleep_ms} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

Минимальное время ожидания перед повторной попыткой выбрать части для слияния после того, как не были выбраны никакие части. Более низкое значение может привести к более частому запуску задач в background_schedule_pool, что в крупных кластерах приводит к большому количеству запросов к ZooKeeper.

## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor} 

<SettingsInfoBlock type="Float" default_value="1.2" />

Время ожидания задачи выбора частей для слияния умножается на этот коэффициент, когда
нет частей для слияния, и делится на него, когда операция слияния назначена.

## merge_selector_algorithm {#merge_selector_algorithm} 

<ExperimentalBadge/>

<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

Алгоритм выбора частей для выполнения слияний

## merge_selector_base {#merge_selector_base} 

<SettingsInfoBlock type="Float" default_value="5" />

Влияет на коэффициент write amplification
назначенных слияний (настройка для экспертов, не изменяйте её, если не понимаете,
как она работает). Работает для селекторов слияний Simple и StochasticSimple

## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Определяет, когда срабатывает логика по отношению к количеству частей в
партиции. Чем больше коэффициент, тем позже будет реакция.

## merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once {#merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает эвристику для простого селектора слияний, которая будет снижать максимальное ограничение при выборе слияний.
Таким образом, число одновременных слияний увеличится, что может помочь с ошибками TOO_MANY_PARTS,
но при этом увеличится write amplification.

## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает эвристику выбора частей для слияния, которая удаляет части с правой
границы диапазона, если их размер меньше заданного соотношения (0.01) от sum_size.
Работает для селекторов слияний Simple и StochasticSimple.

## merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent {#merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "5"},{"label": "New setting"}]}]}/>

Управляет значением показателя степени, используемым в формулах, описывающих нисходящую кривую. Уменьшение показателя степени приведёт к уменьшению ширины слияний, что увеличит коэффициент усиления записи. Обратное также верно.

## merge_selector_window_size {#merge_selector_window_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Сколько частей рассматривать за один раз.

## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache} 

<SettingsInfoBlock type="UInt64" default_value="16106127360" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>

Параметр доступен только в ClickHouse Cloud. Максимальный суммарный размер частей, подлежащих предварительному прогреву кэша во время слияния.

## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />

Устаревшая настройка, ничего не делает.

## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 

<SettingsInfoBlock type="UInt64" default_value="1" />

Устанавливает интервал в секундах, с которым ClickHouse выполняет очистку старых
частей, журналов WAL и мутаций.

Возможные значения:

- Любое положительное целое число.

## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds} 

<SettingsInfoBlock type="UInt64" default_value="60" />

Задает интервал в секундах между запусками очистки старых
временных каталогов в ClickHouse.

Возможные значения:

- Любое положительное целое число.

## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Устаревшая настройка, не используется.

## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 

<SettingsInfoBlock type="Int64" default_value="14400" />

Минимальная задержка в секундах перед повторным выполнением операции слияния с TTL-рекомпрессией.

## merge_with_ttl_timeout {#merge_with_ttl_timeout} 

<SettingsInfoBlock type="Int64" default_value="14400" />

Минимальная задержка в секундах перед повторным слиянием с TTL на удаление.

## merge_workload {#merge_workload} 

Используется для регулирования того, как ресурсы используются и распределяются между операциями слияния и
другими рабочими нагрузками. Указанное значение используется в качестве значения настройки `workload` для
фоновых слияний этой таблицы. Если значение не задано (пустая строка), вместо него используется серверная настройка `merge_workload`.

**См. также**

- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)

## min_absolute_delay_to_close {#min_absolute_delay_to_close} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальная абсолютная задержка до закрытия, остановки обработки запросов и прекращения возврата Ok во время проверки статуса.

## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only} 

<SettingsInfoBlock type="Bool" default_value="0" />

Следует ли `min_age_to_force_merge_seconds` применять только ко всей
партиции, а не к ее подмножеству.

По умолчанию игнорирует настройку `max_bytes_to_merge_at_max_space_in_pool` (см.
`enable_max_bytes_limit_for_min_age_to_force_merge`).

Возможные значения:

- true, false

## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Объединяет части, если каждая часть в диапазоне старше значения параметра
`min_age_to_force_merge_seconds`.

По умолчанию этот параметр игнорирует настройку `max_bytes_to_merge_at_max_space_in_pool`
(см. `enable_max_bytes_limit_for_min_age_to_force_merge`).

Возможные значения:

- Положительное целое число.

## min_bytes_for_compact_part {#min_bytes_for_compact_part} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Устаревшая настройка, ни на что не влияет.

## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Доступен только в ClickHouse Cloud. Минимальный несжатый размер в байтах для
использования полного типа хранилища для части данных вместо упакованного.

## min_bytes_for_wide_part {#min_bytes_for_wide_part} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

Минимальное количество байт/строк в части данных, которая может быть сохранена в формате `Wide`. Вы можете задать одну, обе или ни одну из этих настроек.

## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Минимальный размер данных (в несжатых байтах) для предварительного прогрева кэша меток и кэша первичного индекса для новых частей

## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает минимальный объем данных в байтах для включения балансировки при распределении новых крупных
частей по дискам тома [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures).

Возможные значения:

- Положительное целое число.
- `0` — балансировка отключена.

**Использование**

Значение настройки `min_bytes_to_rebalance_partition_over_jbod` не должно
быть меньше значения
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)
/ 1024. В противном случае ClickHouse выбрасывает исключение.

## min_columns_to_activate_adaptive_write_buffer {#min_columns_to_activate_adaptive_write_buffer} 

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "500"},{"label": "New setting"}]}]}/>

Позволяет снизить расход памяти для таблиц с большим числом столбцов за счёт использования адаптивных буферов записи.

Возможные значения:

- 0 — без ограничений
- 1 — всегда включено

## min_compress_block_size {#min_compress_block_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный размер блоков несжатых данных, которые требуется сжать перед
записью следующей метки. Это значение также можно задать в глобальных настройках
(см. настройку [min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size)).
Значение, заданное при создании таблицы, имеет приоритет над глобальным значением
этой настройки.

## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное число сжатых байт, после загрузки которых выполняется fsync для части (0 — отключено)

## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный объём сжатых данных для выполнения fsync части после слияния (0 — отключено)

## min_delay_to_insert_ms {#min_delay_to_insert_ms} 

<SettingsInfoBlock type="UInt64" default_value="10" />

Минимальная задержка вставки данных в таблицу MergeTree в миллисекундах, если
в одной партиции имеется много неслитых частей.

## min_delay_to_mutate_ms {#min_delay_to_mutate_ms} 

<SettingsInfoBlock type="UInt64" default_value="10" />

Минимальная задержка мутаций таблицы MergeTree в миллисекундах при большом количестве
незавершённых мутаций

## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество байт, которое должно оставаться свободным на диске, чтобы
можно было выполнить вставку данных. Если количество доступных свободных байт меньше
`min_free_disk_bytes_to_perform_insert`, будет сгенерировано исключение, и
операция вставки не будет выполнена. Обратите внимание, что этот параметр:

- учитывает параметр `keep_free_space_bytes`;
- не учитывает объём данных, который будет записан операцией
`INSERT`;
- проверяется только в том случае, если задано положительное (ненулевое) количество байт.

Возможные значения:

- Любое положительное целое число.

:::note
Если заданы оба параметра, `min_free_disk_bytes_to_perform_insert` и `min_free_disk_ratio_to_perform_insert`,
ClickHouse будет ориентироваться на то значение, которое позволит выполнять
вставки при большем объёме свободного места на диске.
:::

## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 

<SettingsInfoBlock type="Float" default_value="0" />

Минимальное отношение свободного дискового пространства к общему объёму диска для выполнения операции `INSERT`. Должно быть
числом с плавающей запятой в диапазоне от 0 до 1. Обратите внимание, что этот параметр:

- учитывает параметр `keep_free_space_bytes`.
- не учитывает объём данных, который будет записан
операцией `INSERT`.
- проверяется только в том случае, если задано положительное (ненулевое) значение отношения.

Возможные значения:

- Float, 0.0–1.0

Обратите внимание, что если одновременно заданы `min_free_disk_ratio_to_perform_insert` и
`min_free_disk_bytes_to_perform_insert`, ClickHouse будет ориентироваться
на значение, которое позволит выполнять вставки при большем объёме свободного
пространства.

## min_index_granularity_bytes {#min_index_granularity_bytes} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

Минимально допустимый размер гранул данных в байтах.

Служит защитой от случайного создания таблиц со слишком малым значением
`index_granularity_bytes`.

## min_level_for_full_part_storage {#min_level_for_full_part_storage} 

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Доступна только в ClickHouse Cloud. Минимальный уровень парта, начиная с которого для парта данных используется полный тип хранения вместо упакованного.

## min_level_for_wide_part {#min_level_for_wide_part} 

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

Минимальный уровень парта, начиная с которого часть данных создаётся в формате `Wide` вместо `Compact`.

## min&#95;marks&#95;to&#95;honor&#95;max&#95;concurrent&#95;queries {#min_marks_to_honor_max_concurrent_queries}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество меток, читаемых запросом, при котором применяется настройка [max&#95;concurrent&#95;queries](#max_concurrent_queries).

:::note
Запросы по-прежнему будут ограничены другими настройками `max_concurrent_queries`.
:::

Возможные значения:

* Положительное целое число.
* `0` — Отключено (ограничение `max_concurrent_queries` не применяется ни к каким запросам).

**Пример**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```

## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io} 

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

Минимальный объём данных для операции слияния, при котором используется прямой
доступ к диску хранения (direct I/O). При слиянии частей данных ClickHouse вычисляет
суммарный объём всех данных, подлежащих слиянию. Если объём превышает
`min_merge_bytes_to_use_direct_io` байт, ClickHouse читает и записывает
данные на диск хранения, используя интерфейс прямого ввода-вывода (опция `O_DIRECT`).
Если `min_merge_bytes_to_use_direct_io = 0`, прямой ввод-вывод отключается.

## min_parts_to_merge_at_once {#min_parts_to_merge_at_once} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество частей данных, которое селектор слияния может выбрать для одновременного слияния
(настройка экспертного уровня, не изменяйте, если вы не понимаете, что она делает).
0 — отключено. Работает для селекторов слияния Simple и StochasticSimple.

## min_relative_delay_to_close {#min_relative_delay_to_close} 

<SettingsInfoBlock type="UInt64" default_value="300" />

Минимальная задержка реплики относительно других, после превышения которой она закрывается, прекращает обслуживать запросы и перестаёт возвращать Ok при проверке статуса.

## min_relative_delay_to_measure {#min_relative_delay_to_measure} 

<SettingsInfoBlock type="UInt64" default_value="120" />

Вычислять относительную задержку реплики только в том случае, если абсолютная задержка не меньше этого значения.

## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership} 

<SettingsInfoBlock type="UInt64" default_value="120" />

Устаревший параметр, не используется.

## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 

<SettingsInfoBlock type="UInt64" default_value="10" />

Хранит примерно указанное количество последних записей в журнале ZooKeeper, даже если они
устарели. Это не влияет на работу таблиц: используется только для диагностики журнала
ZooKeeper перед очисткой.

Возможные значения:

- Любое положительное целое число.

## min_rows_for_compact_part {#min_rows_for_compact_part} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Устаревшая настройка, не используется.

## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Доступен только в ClickHouse Cloud. Минимальное количество строк, при котором для части данных используется полный тип хранения вместо упакованного

## min_rows_for_wide_part {#min_rows_for_wide_part} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное число строк, при котором часть данных создаётся в формате `Wide` вместо `Compact`.

## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество строк, при котором выполняется fsync парта после слияния (0 — отключено)

## mutation_workload {#mutation_workload} 

Используется для регулирования того, как ресурсы расходуются и распределяются между мутациями и другими типами нагрузки. Указанное значение используется как значение параметра `workload` для фоновых мутаций этой таблицы. Если не задано (пустая строка), вместо него используется серверный параметр `mutation_workload`.

**См. также**

- [Планирование нагрузки](/operations/workload-scheduling.md)

## non_replicated_deduplication_window {#non_replicated_deduplication_window} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Количество последних вставленных блоков в нереплицируемой таблице
[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md),
для которых сохраняются хэш-суммы для проверки на дубликаты.

Возможные значения:

- Любое положительное целое число.
- `0` (отключить дедупликацию).

Используется механизм дедупликации, аналогичный механизму для реплицируемых таблиц (см.
настройку [replicated_deduplication_window](#replicated_deduplication_window)).
Хэш-суммы созданных частей записываются в локальный файл на диске.

## notify_newest_block_number {#notify_newest_block_number} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

Уведомляет SharedJoin или SharedSet о самом последнем номере блока. Только в ClickHouse Cloud.

## nullable_serialization_version {#nullable_serialization_version} 

<SettingsInfoBlock type="MergeTreeNullableSerializationVersion" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "basic"},{"label": "Новая настройка"}]}]}/>

Определяет метод сериализации, который используется для столбцов `Nullable(T)`.

Возможные значения:

- basic — Использовать стандартную сериализацию для `Nullable(T)`.

- allow_sparse — Разрешить использовать разреженное кодирование для `Nullable(T)`.

## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation} 

<SettingsInfoBlock type="UInt64" default_value="20" />

Если количество свободных элементов в пуле меньше заданного значения, мутации частей не выполняются. Это нужно для того, чтобы оставить свободные потоки для обычных слияний и избежать ошибок "Too many parts".

Возможные значения:

- Любое положительное целое число.

**Использование**

Значение настройки `number_of_free_entries_in_pool_to_execute_mutation`
должно быть меньше значения [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio).
В противном случае, ClickHouse выбросит исключение.

## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition} 

<SettingsInfoBlock type="UInt64" default_value="25" />

Когда количество свободных элементов в пуле меньше заданного, оптимизация всей партиции в фоновом режиме не выполняется (это задание создаётся,
когда установлено значение `min_age_to_force_merge_seconds` и включено
`min_age_to_force_merge_on_partition_only`). Это сделано для того, чтобы оставить свободные потоки
для обычных слияний и избежать ошибки «Too many parts».

Возможные значения:

- Положительное целое число.

Значение настройки `number_of_free_entries_in_pool_to_execute_optimize_entire_partition`
должно быть меньше значения параметра
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

* умноженного на значение параметра [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio).
В противном случае ClickHouse генерирует исключение.

## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge} 

<SettingsInfoBlock type="UInt64" default_value="8" />

Когда количество свободных записей в пуле
(или реплицированной очереди) становится меньше заданного значения,
начинается понижение максимального размера слияния для обработки
(или для помещения в очередь).
Это позволяет обрабатывать небольшие слияния, не заполняя пул
длительными слияниями.

Возможные значения:

- Любое положительное целое число.

## number_of_mutations_to_delay {#number_of_mutations_to_delay} 

<SettingsInfoBlock type="UInt64" default_value="500" />

Если в таблице имеется как минимум
столько незавершённых мутаций, выполнение мутаций для этой таблицы искусственно замедляется.
Параметр отключён, если установлено значение 0

## number_of_mutations_to_throw {#number_of_mutations_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если в таблице есть как минимум столько незавершённых мутаций, выбрасывается исключение `Too many mutations`. При значении 0 параметр отключён.

## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Синхронизация с Cloud"}]}]}/>

Доступно только в ClickHouse Cloud. До top N партиций, которые будут рассматриваться для слияния. Партиции выбираются случайным взвешенным образом, где вес — это количество частей, которые можно слить в данной партиции.

## object_serialization_version {#object_serialization_version} 

<SettingsInfoBlock type="MergeTreeObjectSerializationVersion" default_value="v2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Добавлена настройка для управления версиями сериализации JSON"}]}]}/>

Версия сериализации для типа данных JSON. Требуется для обеспечения совместимости.

Возможные значения:

- `v1`
- `v2`
- `v3`

Только версия `v3` поддерживает изменение версии сериализации общих данных.

## object_shared_data_buckets_for_compact_part {#object_shared_data_buckets_for_compact_part} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "Добавлена настройка для управления количеством бакетов общих данных при JSON-сериализации в компактных частях"}]}]}/>

Количество бакетов общих данных при JSON-сериализации в компактных частях (Compact). Работает с вариантами сериализации общих данных `map_with_buckets` и `advanced`.

## object_shared_data_buckets_for_wide_part {#object_shared_data_buckets_for_wide_part} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="32" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32"},{"label": "Добавлена настройка для управления количеством бакетов общей JSON-сериализации данных в широких (Wide) частях"}]}]}/>

Количество бакетов для общей JSON-сериализации данных в широких (Wide) частях. Используется с режимами сериализации общих данных `map_with_buckets` и `advanced`.

## object_shared_data_serialization_version {#object_shared_data_serialization_version} 

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Добавлена настройка, позволяющая управлять версиями сериализации JSON"}]}]}/>

Версия сериализации общих данных в типе данных JSON.

Возможные значения:

- `map` — хранить общие данные в виде `Map(String, String)`
- `map_with_buckets` — хранить общие данные в виде нескольких отдельных столбцов `Map(String, String)`. Использование бакетов улучшает чтение отдельных путей из общих данных.
- `advanced` — специальная сериализация общих данных, разработанная для существенного улучшения чтения отдельных путей из общих данных.
Обратите внимание, что эта сериализация увеличивает размер общих данных на диске, поскольку мы храним много дополнительной информации.

Количество бакетов для сериализаций `map_with_buckets` и `advanced` определяется настройками
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part).

## object_shared_data_serialization_version_for_zero_level_parts {#object_shared_data_serialization_version_for_zero_level_parts} 

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Добавлена настройка для управления версиями сериализации JSON для частей нулевого уровня"}]}]}/>

Эта настройка позволяет задать отдельную версию сериализации общих данных внутри типа JSON для частей нулевого уровня, которые создаются при вставке данных.
Не рекомендуется использовать `advanced` сериализацию общих данных для частей нулевого уровня, поскольку это может значительно увеличить время вставки.

## old_parts_lifetime {#old_parts_lifetime} 

<SettingsInfoBlock type="Seconds" default_value="480" />

Время (в секундах) хранения неактивных частей для защиты от потери данных
при внезапных перезагрузках сервера.

Возможные значения:

- Любое положительное целое число.

После слияния нескольких частей в новую часть ClickHouse помечает исходные
части как неактивные и удаляет их только по истечении `old_parts_lifetime` секунд.
Неактивные части удаляются, если они не используются текущими запросами, т.е. если
`refcount` части равен 1.

`fsync` не вызывается для новых частей, поэтому некоторое время новые части
существуют только в RAM сервера (кэше ОС). Если сервер перезагружается
внезапно, новые части могут быть потеряны или повреждены. Для защиты данных
неактивные части не удаляются немедленно.

При запуске ClickHouse проверяет целостность частей. Если слитая
часть повреждена, ClickHouse возвращает неактивные части в список активных
и позже сливает их снова. Затем повреждённая часть переименовывается (к имени
добавляется префикс `broken_`) и перемещается в папку `detached`. Если слитая
часть не повреждена, исходные неактивные части переименовываются (к имени
добавляется префикс `ignored_`) и перемещаются в папку `detached`.

Значение по умолчанию для `dirty_expire_centisecs` (параметр ядра Linux) — 30
секунд (максимальное время, в течение которого записанные данные хранятся только
в RAM), но при высокой нагрузке на дисковую подсистему данные могут быть записаны
значительно позже. Экспериментально было выбрано значение 480 секунд для
`old_parts_lifetime`, в течение которых новая часть гарантированно будет
записана на диск.

## optimize_row_order {#optimize_row_order} 

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, должен ли порядок строк оптимизироваться во время вставок для улучшения
сжимаемости вновь вставленной части таблицы.

Оказывает влияние только на обычные таблицы движка MergeTree. Ничего не делает для
специализированных таблиц движка MergeTree (например, CollapsingMergeTree).

Таблицы MergeTree (опционально) сжимаются с помощью [кодеков сжатия](/sql-reference/statements/create/table#column_compression_codec).
Универсальные кодеки сжатия, такие как LZ4 и ZSTD, достигают максимальных коэффициентов
сжатия, если данные демонстрируют выраженные шаблоны. Длинные последовательности
одинаковых значений, как правило, сжимаются очень хорошо.

Если этот SETTING включен, ClickHouse пытается сохранить данные во вновь
вставленных частях в таком порядке строк, который минимизирует количество серий
одинаковых значений по столбцам новой части таблицы.
Другими словами, небольшое количество серий одинаковых значений означает, что
отдельные серии длинные и хорошо сжимаются.

Нахождение оптимального порядка строк вычислительно неосуществимо (NP-трудная задача).
Поэтому ClickHouse использует эвристику, чтобы быстро найти порядок строк,
который всё же улучшает коэффициенты сжатия по сравнению с исходным порядком строк.

<details markdown="1">

<summary>Эвристика для поиска порядка строк</summary>

В общем случае строки таблицы (или части таблицы) можно свободно
перемешивать, поскольку SQL считает одну и ту же таблицу (часть таблицы)
в разных порядках строк эквивалентной.

Эта свобода перемешивания строк ограничивается, когда для таблицы определён
первичный ключ. В ClickHouse первичный ключ `C1, C2, ..., CN` требует, чтобы
строки таблицы были отсортированы по столбцам `C1`, `C2`, ... `Cn` ([кластерный индекс](https://en.wikipedia.org/wiki/Database_index#Clustered)).
В результате строки можно перемешивать только внутри «классов эквивалентности»
строк, то есть строк, у которых одинаковые значения в столбцах первичного ключа.
Интуитивно первичные ключи с высокой кардинальностью, например первичные ключи,
включающие столбец с меткой времени типа `DateTime64`, приводят к множеству
маленьких классов эквивалентности. Аналогично, таблицы с первичным ключом
с низкой кардинальностью создают немногочисленные, но крупные классы
эквивалентности. Таблица без первичного ключа представляет собой экстремальный
случай единственного класса эквивалентности, охватывающего все строки.

Чем реже встречаются и чем крупнее классы эквивалентности, тем выше степень
свободы при повторном перемешивании строк.

Эвристика, применяемая для поиска наилучшего порядка строк в каждом классе
эквивалентности, предложена D. Lemire, O. Kaser в работе
[Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002)
и основана на сортировке строк внутри каждого класса эквивалентности по
возрастающей кардинальности столбцов, не входящих в первичный ключ.

Она выполняет три шага:
1. Найти все классы эквивалентности на основе значений строк в столбцах первичного ключа.
2. Для каждого класса эквивалентности вычислить (обычно оценить) кардинальности
столбцов, не входящих в первичный ключ.
3. Для каждого класса эквивалентности отсортировать строки в порядке возрастания
кардинальности столбцов, не входящих в первичный ключ.

</details>

Если включено, операции вставки несут дополнительные затраты CPU на анализ и
оптимизацию порядка строк новых данных. Ожидается, что операции INSERT будут выполняться
на 30–50% дольше в зависимости от характеристик данных.
Коэффициенты сжатия LZ4 или ZSTD в среднем улучшаются на 20–40%.

Этот SETTING лучше всего работает для таблиц без первичного ключа или с
первичным ключом с низкой кардинальностью, то есть таблиц с небольшим числом
различных значений первичного ключа.
Первичные ключи с высокой кардинальностью, например включающие столбцы меток
времени типа `DateTime64`, как правило, не дают заметного выигрыша от этого SETTING.

## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="30" />

Время ожидания перед и после перемещения частей между сегментами.

## part_moves_between_shards_enable {#part_moves_between_shards_enable} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

Экспериментальная/незавершённая функция перемещения частей между сегментами. Не учитывает выражения для сегментирования.

## parts_to_delay_insert {#parts_to_delay_insert} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если количество активных частей в одной партиции превышает значение
`parts_to_delay_insert`, выполнение `INSERT` искусственно замедляется.

Возможные значения:

- Любое положительное целое число.

ClickHouse искусственно выполняет `INSERT` дольше (добавляет задержку `sleep`), чтобы фоновый процесс слияния мог сливать части быстрее, чем они добавляются.

## parts_to_throw_insert {#parts_to_throw_insert} 

<SettingsInfoBlock type="UInt64" default_value="3000" />

Если количество активных частей в одной партиции превышает значение
`parts_to_throw_insert`, выполнение `INSERT` прерывается с исключением
`Too many
parts (N). Merges are processing significantly slower than inserts`.

Возможные значения:

- Любое положительное целое число.

Для достижения максимальной производительности запросов `SELECT` необходимо
минимизировать количество обрабатываемых частей, см. [Merge Tree](/development/architecture#merge-tree).

До версии 23.6 это значение было равно 300. Вы можете задать более
высокое значение — это снизит вероятность ошибки `Too many parts`,
но при этом производительность `SELECT` может ухудшиться. Также в случае
проблем со слияниями (например, из-за недостаточного дискового пространства)
вы обнаружите их позже, чем с исходным значением 300.

## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold} 

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

Если сумма размеров частей превышает этот порог и время, прошедшее с момента
создания записи журнала репликации, больше, чем
`prefer_fetch_merged_part_time_threshold`, то предпочтительнее запрашивать
слиянную часть с реплики, а не выполнять слияние локально. Это позволяет
ускорить очень долгие слияния.

Возможные значения:

- Любое положительное целое число.

## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold} 

<SettingsInfoBlock type="Seconds" default_value="3600" />

Если время, прошедшее с момента создания записи в журнале репликации (ClickHouse Keeper или ZooKeeper),
превышает этот порог, и сумма размеров частей
больше, чем `prefer_fetch_merged_part_size_threshold`, то следует предпочесть получение
объединённой части с реплики вместо выполнения локального слияния. Это позволяет ускорить очень долгие слияния.

Возможные значения:

- Любое положительное целое число.

## prewarm_mark_cache {#prewarm_mark_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение `true`, кэш меток будет
предварительно заполняться путём сохранения меток в кэш меток при вставках, слияниях, выборках и при
запуске сервера.

## prewarm_primary_key_cache {#prewarm_primary_key_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Если установлено значение `true`, кэш первичного индекса
будет предварительно прогрет за счёт сохранения меток в кэше меток при вставках, слияниях,
выборках и при запуске сервера

## primary_key_compress_block_size {#primary_key_compress_block_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

Размер блока при первичном сжатии — фактический размер блока, подлежащего сжатию.

## primary_key_compression_codec {#primary_key_compression_codec} 

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

Кодек сжатия, используемый для первичного ключа. Первичный ключ достаточно мал и кэшируется,
поэтому по умолчанию используется сжатие ZSTD(3).

## primary_key_lazy_load {#primary_key_lazy_load} 

<SettingsInfoBlock type="Bool" default_value="1" />

Загружать первичный ключ в память при первом обращении, а не при инициализации таблицы. Это может сэкономить память при наличии большого количества таблиц.

## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns} 

<SettingsInfoBlock type="Float" default_value="0.9" />

Если значение столбца первичного ключа в части данных изменяется как минимум в
такой доле случаев, то последующие столбцы не загружаются в память. Это позволяет экономить
память за счёт незагрузки ненужных столбцов первичного ключа.

## ratio&#95;of&#95;defaults&#95;for&#95;sparse&#95;serialization {#ratio_of_defaults_for_sparse_serialization}

<SettingsInfoBlock type="Float" default_value="0.9375" />

Минимальное отношение количества *значений по умолчанию* к количеству *всех*
значений в столбце. При установке этого значения столбец хранится с
использованием разрежённой сериализации.

Если столбец является разрежённым (содержит в основном нули), ClickHouse
может закодировать его в разрежённом формате и автоматически оптимизировать
вычисления — данные не требуют полной декомпрессии во время выполнения
запросов. Чтобы включить такую разрежённую сериализацию, задайте для
параметра `ratio_of_defaults_for_sparse_serialization` значение меньше 1.0.
Если значение больше либо равно 1.0, то столбцы всегда будут записываться
с использованием обычной полной сериализации.

Возможные значения:

* Число с плавающей запятой между `0` и `1` для включения разрежённой сериализации
* `1.0` (или больше), если вы не хотите использовать разрежённую сериализацию

**Пример**

Обратите внимание, что в следующей таблице столбец `s` содержит пустую
строку в 95% строк. В `my_regular_table` мы не используем разрежённую
сериализацию, а в `my_sparse_table` задаём значение
`ratio_of_defaults_for_sparse_serialization` равным 0.95:

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

Обратите внимание, что столбец `s` в таблице `my_sparse_table` занимает меньше места на диске:

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

Вы можете проверить, используется ли для столбца разреженное кодирование, просмотрев
столбец `serialization_kind` в таблице `system.parts_columns`:

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

Вы можете увидеть, какие части `s` были сохранены в разрежённом формате сериализации:

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

Доступна только в ClickHouse Cloud. Минимальное время ожидания перед повторной
попыткой уменьшить количество блокирующих частей после того, как ни один диапазон не был
удалён или заменён. Более низкое значение настройки будет чаще запускать задачи
в background_schedule_pool, что приводит к большому количеству запросов к
ZooKeeper в крупных кластерах.

## refresh_parts_interval {#refresh_parts_interval} 

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "A new setting"}]}]}/>

Если значение больше нуля, список частей данных обновляется из базовой файловой системы, чтобы проверить, были ли данные обновлены в фоновом режиме.
Этот параметр можно задать только в том случае, если таблица расположена на дисках, доступных только для чтения (что означает, что это реплика только для чтения, в то время как данные записываются другой репликой).

## refresh_statistics_interval {#refresh_statistics_interval} 

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Интервал обновления кэша статистики в секундах. Если значение равно нулю, обновление будет отключено.

## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold} 

<SettingsInfoBlock type="Seconds" default_value="10800" />

Когда эта настройка имеет значение больше нуля, только одна реплика
немедленно запускает слияние, если объединённая часть находится в общем хранилище.

:::note
Zero-copy replication не готова для использования в продакшене.
Zero-copy replication по умолчанию отключена в ClickHouse версии 22.8 и
выше.

Эта функция не рекомендуется для использования в продакшене.
:::

Возможные значения:

- Любое положительное целое число.

## remote_fs_zero_copy_path_compatible_mode {#remote_fs_zero_copy_path_compatible_mode} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Выполняет zero-copy в режиме совместимости во время конвертации.

## remote_fs_zero_copy_zookeeper_path {#remote_fs_zero_copy_zookeeper_path} 

<ExperimentalBadge/>

<SettingsInfoBlock type="String" default_value="/clickhouse/zero_copy" />

Путь в ZooKeeper для информации о zero-copy, не зависящей от таблиц.

## remove_empty_parts {#remove_empty_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

Удалять пустые части после того, как они были очищены TTL, мутациями или алгоритмом схлопывающего слияния.

## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

Параметр для незавершённой экспериментальной функции.

## remove_unused_patch_parts {#remove_unused_patch_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Удаляет в фоновом режиме патч-части, которые применены ко всем активным частям.

## replace_long_file_name_to_hash {#replace_long_file_name_to_hash} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если имя файла для столбца слишком длинное (более 'max_file_name_length'
байт), оно заменяется на SipHash128

## replicated_can_become_leader {#replicated_can_become_leader} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если значение `true`, реплики реплицируемых таблиц на этом узле будут пытаться получить роль лидера.

Возможные значения:

- `true`
- `false`

## replicated_deduplication_window {#replicated_deduplication_window} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "10000"},{"label": "увеличено значение по умолчанию"}]}]}/>

Количество последних вставленных блоков, для которых ClickHouse Keeper хранит
хэш-суммы для проверки на наличие дубликатов.

Возможные значения:

- Любое положительное целое число.
- 0 (отключить дедупликацию)

Команда `Insert` создает один или несколько блоков (частей). Для
[insert deduplication](../../engines/table-engines/mergetree-family/replication.md),
при записи в реплицируемые таблицы ClickHouse записывает хэш-суммы созданных
частей в ClickHouse Keeper. Хэш-суммы хранятся только для последних
`replicated_deduplication_window` блоков. Самые старые хэш-суммы
удаляются из ClickHouse Keeper.

Слишком большое значение `replicated_deduplication_window` замедляет операции `Insert`,
поскольку требуется сравнивать больше записей. Хэш-сумма вычисляется
из совокупности имен и типов полей и данных вставляемой части (потока байт).

## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Количество последних асинхронно вставленных блоков, для которых ClickHouse Keeper
хранит хэш-суммы для проверки дубликатов.

Возможные значения:

- Любое положительное целое число.
- 0 (отключить deduplication для async_inserts)

Команда [Async Insert](/operations/settings/settings#async_insert) будет
кэшироваться в одном или нескольких блоках (частях). Для [insert deduplication](/engines/table-engines/mergetree-family/replication),
при записи в реплицируемые таблицы ClickHouse записывает хэш-суммы каждой
вставки в ClickHouse Keeper. Хэш-суммы хранятся только для последних
`replicated_deduplication_window_for_async_inserts` блоков. Самые старые хэш-
суммы удаляются из ClickHouse Keeper.
Слишком большое значение `replicated_deduplication_window_for_async_inserts` замедляет
Async Insert, потому что нужно сравнивать больше записей.
Хэш-сумма вычисляется на основе комбинации имён и типов полей
и данных вставки (потока байтов).

## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3600"},{"label": "decrease default value"}]}]}/>

Количество секунд, по истечении которых хеш-суммы вставленных блоков
удаляются из ClickHouse Keeper.

Возможные значения:

- Любое положительное целое число.

Аналогично [replicated_deduplication_window](#replicated_deduplication_window),
`replicated_deduplication_window_seconds` задаёт, как долго хранить хеш-суммы
блоков для дедупликации вставок. Хеш-суммы старше
`replicated_deduplication_window_seconds` удаляются из ClickHouse Keeper,
даже если они меньше, чем `replicated_deduplication_window`.

Время отсчитывается относительно времени самой последней записи, а не
реального (настенного) времени. Если это единственная запись, она будет храниться неограниченное время.

## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts} 

<SettingsInfoBlock type="UInt64" default_value="604800" />

Количество секунд, по истечении которых хеш-суммы асинхронных вставок
удаляются из ClickHouse Keeper.

Возможные значения:

- Любое положительное целое число.

Подобно [replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts),
`replicated_deduplication_window_seconds_for_async_inserts` задает,
как долго хранить хеш-суммы блоков для дедупликации асинхронных вставок.
Хеш-суммы, старше, чем `replicated_deduplication_window_seconds_for_async_inserts`,
удаляются из ClickHouse Keeper, даже если их возраст меньше
`replicated_deduplication_window_for_async_inserts`.

Время отсчитывается относительно момента самой последней записи, а не
реального времени. Если это единственная запись, она будет храниться
бессрочно.

## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />

Устаревшая настройка, ни на что не влияет.

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />

Устаревшая настройка, ничего не делает.

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />

Устаревшая настройка, не оказывает никакого эффекта.

## replicated_max_mutations_in_one_entry {#replicated_max_mutations_in_one_entry} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество команд мутации, которые могут быть объединены и выполнены
в одной записи MUTATE_PART (0 означает отсутствие ограничений)

## replicated_max_parallel_fetches {#replicated_max_parallel_fetches} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Устаревшая настройка, не оказывает никакого эффекта.

## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host} 

<SettingsInfoBlock type="UInt64" default_value="15" />

Устаревшая настройка, не оказывает эффекта.

## replicated_max_parallel_fetches_for_table {#replicated_max_parallel_fetches_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Устаревшая настройка, ни на что не влияет.

## replicated_max_parallel_sends {#replicated_max_parallel_sends} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Устаревшая настройка, не используется.

## replicated_max_parallel_sends_for_table {#replicated_max_parallel_sends_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Устаревший параметр настройки. Ничего не делает.

## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts} 

<SettingsInfoBlock type="Float" default_value="0.5" />

Если отношение неправильных частей к общему числу частей меньше этого значения —
запуск разрешается.

Возможные значения:

- Float, 0.0 - 1.0

## search_orphaned_parts_disks {#search_orphaned_parts_disks} 

<SettingsInfoBlock type="SearchOrphanedPartsDisks" default_value="any" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "any"},{"label": "New setting"}]}]}/>

ClickHouse сканирует все диски на наличие осиротевших частей при выполнении любой операции ATTACH или CREATE TABLE,
чтобы не допустить пропуска частей данных на неопределённых (не включённых в политику) дисках.
Осиротевшие части появляются в результате потенциально небезопасной переконфигурации хранилища, например, если диск был исключён из политики хранилища.
Этот SETTING ограничивает перечень дисков, по которым выполняется поиск, по их типу.

Возможные значения:

- any — область поиска не ограничена.
- local — область поиска ограничена локальными дисками.
- none — пустая область, поиск не выполняется.

## serialization_info_version {#serialization_info_version} 

<SettingsInfoBlock type="MergeTreeSerializationInfoVersion" default_value="with_types" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_types"},{"label": "Change to the newer format allowing custom string serialization"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "basic"},{"label": "New setting"}]}]}/>

Версия информации о сериализации, используемая при записи `serialization.json`.
Этот параметр необходим для обеспечения совместимости во время обновления кластера.

Возможные значения:

- `basic` — базовый формат.
- `with_types` — формат с дополнительным полем `types_serialization_versions`, позволяющим задавать версии сериализации для каждого типа.
Это делает параметры, такие как `string_serialization_version`, задействованными.

Во время поэтапного обновления установите значение `basic`, чтобы новые серверы создавали
части данных, совместимые со старыми серверами. После завершения обновления
переключитесь на `WITH_TYPES`, чтобы включить версии сериализации для каждого типа.

## shared_merge_tree_activate_coordinated_merges_tasks {#shared_merge_tree_activate_coordinated_merges_tasks} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "Новые настройки"}]}, {"id": "row-2","items": [{"label": "25.8"},{"label": "0"},{"label": "Новые настройки"}]}, {"id": "row-3","items": [{"label": "25.7"},{"label": "0"},{"label": "Новые настройки"}]}, {"id": "row-4","items": [{"label": "25.6"},{"label": "0"},{"label": "Новые настройки"}]}, {"id": "row-5","items": [{"label": "25.10"},{"label": "0"},{"label": "Новые настройки"}]}]}/>

Активирует перепланирование задач скоординированных слияний. Это может быть полезно даже если
shared_merge_tree_enable_coordinated_merges=0, поскольку в этом случае будет собираться статистика координатора слияний
и это поможет при холодном запуске.

## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Уменьшает объем метаданных в Keeper."}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "1"},{"label": "Синхронизация с Cloud"}]}]}/>

Включает создание узлов /metadata и /columns в ZooKeeper для каждой реплики.
Доступно только в ClickHouse Cloud.

## shared_merge_tree_disable_merges_and_mutations_assignment {#shared_merge_tree_disable_merges_and_mutations_assignment} 

<SettingsInfoBlock type="Bool" default_value="0" />

Отключает назначение слияний для shared merge tree. Доступно только в ClickHouse Cloud.

## shared_merge_tree_empty_partition_lifetime {#shared_merge_tree_empty_partition_lifetime} 

<SettingsInfoBlock type="Seconds" default_value="86400" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "86400"},{"label": "New setting"}]}]}/>

В течение какого времени в секундах партиция будет храниться в Keeper, если у неё нет частей.

## shared_merge_tree_enable_automatic_empty_partitions_cleanup {#shared_merge_tree_enable_automatic_empty_partitions_cleanup} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает очистку записей Keeper для пустых партиций.

## shared_merge_tree_enable_coordinated_merges {#shared_merge_tree_enable_coordinated_merges} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Включает стратегию координированных слияний

## shared_merge_tree_enable_keeper_parts_extra_data {#shared_merge_tree_enable_keeper_parts_extra_data} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает запись атрибутов в виртуальные части и фиксацию блоков в Keeper

## shared_merge_tree_enable_outdated_parts_check {#shared_merge_tree_enable_outdated_parts_check} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Синхронизация Cloud"}]}]}/>

Включает проверку на наличие устаревших частей. Доступна только в ClickHouse Cloud.

## shared_merge_tree_idle_parts_update_seconds {#shared_merge_tree_idle_parts_update_seconds} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Синхронизация с Cloud"}]}]}/>

Интервал в секундах для обновления частей, не инициированного срабатыванием watch-события ZooKeeper
в shared merge tree. Доступно только в ClickHouse Cloud.

## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "New setting"}]}]}/>

Начальная задержка для обновления частей. Доступно только в ClickHouse Cloud

## shared_merge_tree_interserver_http_connection_timeout_ms {#shared_merge_tree_interserver_http_connection_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "New setting"}]}]}/>

Таймауты для межсерверных HTTP‑соединений. Доступно только в ClickHouse Cloud.

## shared_merge_tree_interserver_http_timeout_ms {#shared_merge_tree_interserver_http_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>

Таймаут для межсерверного HTTP-взаимодействия. Доступно только в ClickHouse
Cloud

## shared_merge_tree_leader_update_period_random_add_seconds {#shared_merge_tree_leader_update_period_random_add_seconds} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

Добавляет к shared_merge_tree_leader_update_period равномерно распределённую случайную величину в диапазоне от 0 до x секунд, чтобы избежать эффекта «thundering herd». Параметр доступен только в ClickHouse Cloud

## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds} 

<SettingsInfoBlock type="UInt64" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>

Максимальный интервал повторной проверки статуса лидера при обновлении частей. Доступно только в ClickHouse Cloud

## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Синхронизация с Cloud"}]}]}/>

Максимальное количество устаревших частей, которые лидер попытается подтвердить для удаления за один HTTP-запрос. Доступно только в ClickHouse Cloud.

## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "Новый параметр"}]}]}/>

Максимальная задержка между попытками обновления частей. Доступен только в ClickHouse Cloud.

## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total} 

<SettingsInfoBlock type="UInt64" default_value="6" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>

Максимальное количество лидеров обновления частей. Параметр доступен только в ClickHouse Cloud.

## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>

Максимальное количество лидеров обновления частей. Доступно только в ClickHouse Cloud.

## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

Максимальное число реплик, которые могут участвовать в удалении частей (поток-«убийца»). Доступно только в ClickHouse Cloud.

## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range} 

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>

Максимальное число реплик, которые могут пытаться назначить потенциально конфликтующие слияния (это позволяет избежать лишних конфликтов при назначении слияний). 0 — отключено. Доступно только в ClickHouse Cloud.

## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Максимальное количество повреждённых частей для SMT; если их больше — запретить автоматическое отсоединение"}]}]}/>

Максимальное количество повреждённых частей для SMT; если их больше — запретить автоматическое отсоединение.

## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Максимальный суммарный размер всех повреждённых частей для SMT; при превышении автоматическое отсоединение запрещается"}]}]}/>

Максимальный суммарный размер всех повреждённых частей для SMT; при превышении автоматическое отсоединение запрещается.

## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds} 

<SettingsInfoBlock type="Int64" default_value="1800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>

Как долго хранятся идентификаторы мемоизации вставок, чтобы избежать некорректных действий во время
повторных попыток вставки. Эта настройка доступна только в ClickHouse Cloud.

## shared_merge_tree_merge_coordinator_election_check_period_ms {#shared_merge_tree_merge_coordinator_election_check_period_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "Новая настройка"}]}]}/>

Интервал между запусками потока выборов координатора слияний

## shared_merge_tree_merge_coordinator_factor {#shared_merge_tree_merge_coordinator_factor} 

<BetaBadge/>

<SettingsInfoBlock type="Float" default_value="1.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1.100000023841858"},{"label": "Новая настройка"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "1.100000023841858"},{"label": "Снижено время ожидания координатора после загрузки"}]}]}/>

Коэффициент изменения задержки потока координатора во времени

## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms {#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "Новая настройка"}]}]}/>

Как часто координатор слияний должен синхронизироваться с ZooKeeper, чтобы получать актуальные метаданные.

## shared_merge_tree_merge_coordinator_max_merge_request_size {#shared_merge_tree_merge_coordinator_max_merge_request_size} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>

Максимальное количество слияний, которые координатор может одновременно запросить у MergerMutator

## shared_merge_tree_merge_coordinator_max_period_ms {#shared_merge_tree_merge_coordinator_max_period_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "Новая настройка"}]}]}/>

Максимальное время между запусками потока координатора слияний

## shared_merge_tree_merge_coordinator_merges_prepare_count {#shared_merge_tree_merge_coordinator_merges_prepare_count} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

Количество записей о слиянии, которые координатор должен подготовить и распределить между рабочими узлами.

## shared_merge_tree_merge_coordinator_min_period_ms {#shared_merge_tree_merge_coordinator_min_period_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Минимальное время между запусками потока координатора слияния

## shared_merge_tree_merge_worker_fast_timeout_ms {#shared_merge_tree_merge_worker_fast_timeout_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

Таймаут, который поток-обработчик слияний использует для обновления своего состояния после выполнения немедленного действия

## shared_merge_tree_merge_worker_regular_timeout_ms {#shared_merge_tree_merge_worker_regular_timeout_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "Новая настройка"}]}]}/>

Интервал между запусками рабочего потока слияния

## shared_merge_tree_outdated_parts_group_size {#shared_merge_tree_outdated_parts_group_size} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "2"},{"label": "New setting"}]}]}/>

Сколько реплик будет входить в одну группу rendezvous-хеширования при очистке устаревших частей.
Параметр доступен только в ClickHouse Cloud.

## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations} 

<SettingsInfoBlock type="Float" default_value="0.5" />

Перезагружает предикат слияния в задаче выбора merge/mutate, когда отношение `<candidate
partitions for mutations only (partitions that cannot be merged)>/<candidate
partitions for mutations>` становится больше значения настройки. Доступно только в ClickHouse Cloud

## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />

Количество одновременно планируемых задач по загрузке метаданных частей. Доступно только в
ClickHouse Cloud

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Синхронизация с Cloud"}]}]}/>

Время, в течение которого локально слитая часть сохраняется, не начиная новое слияние, включающее
эту часть. Даёт другим репликам возможность забрать эту часть и запустить это слияние.
Доступно только в ClickHouse Cloud.

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>

Минимальный размер части (в строках), при котором откладывается назначение следующего слияния непосредственно после её локального слияния. Доступно только в ClickHouse Cloud.

## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

Время, в течение которого локально слитая часть хранится без запуска нового слияния, содержащего эту часть. Даёт другим репликам возможность получить эту часть и запустить это слияние.
Доступна только в ClickHouse Cloud.

## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

Читать виртуальные части с лидера, если это возможно. Доступно только в ClickHouse
Cloud

## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка для получения данных частей из других реплик"}]}]}/>

Если включено, все реплики пытаются получить данные части, находящиеся в памяти (такие как первичный ключ, информация о партиции и т. д.), из других реплик, где они уже существуют.

## shared_merge_tree_update_replica_flags_delay_ms {#shared_merge_tree_update_replica_flags_delay_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "Новая настройка"}]}]}/>

Как часто реплика пытается обновлять свои флаги в соответствии с фоновым расписанием.

## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

Позволяет запрашивать подсказки для кеша файловой системы из кеша в памяти на других репликах. Доступно только в ClickHouse Cloud.

## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "Включить устаревшие части v3 по умолчанию"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Синхронизация с Cloud"}]}]}/>

Использовать компактный формат для устаревших частей: снижает нагрузку на Keeper, улучшает
обработку устаревших частей. Доступна только в ClickHouse Cloud.

## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Синхронизация с Cloud"}]}]}/>

Если параметр включён, счётчик избыточного количества частей будет опираться на общие данные в Keeper, а не на локальное состояние реплики. Доступно только в ClickHouse Cloud.

## shared_merge_tree_virtual_parts_discovery_batch {#shared_merge_tree_virtual_parts_discovery_batch} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Сколько обнаружений партиций должно быть объединено в один пакет

## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если имеется много устаревших частей, поток очистки попытается удалить до
`simultaneous_parts_removal_limit` частей за одну итерацию.
Значение `simultaneous_parts_removal_limit`, установленное в `0`, означает отсутствие ограничения.

## sleep_before_commit_local_part_in_replicated_table_ms {#sleep_before_commit_local_part_in_replicated_table_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Для тестирования. Не изменяйте этот параметр.

## sleep_before_loading_outdated_parts_ms {#sleep_before_loading_outdated_parts_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Только для тестирования. Не изменяйте этот параметр.

## storage_policy {#storage_policy} 

<SettingsInfoBlock type="String" default_value="default" />

Имя политики хранения на диске

## string_serialization_version {#string_serialization_version} 

<SettingsInfoBlock type="MergeTreeStringSerializationVersion" default_value="with_size_stream" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_size_stream"},{"label": "Переход на более новый формат с отдельными размерами"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "single_stream"},{"label": "Новый параметр"}]}]}/>

Управляет форматом сериализации для столбцов верхнего уровня типа `String`.

Этот параметр действует только, если `serialization_info_version` установлен в "with_types".
Если задано значение `with_size_stream`, столбцы верхнего уровня типа `String` сериализуются
с отдельным подстолбцом `.size`, в котором хранятся длины строк, а не inline. Это позволяет
использовать реальные подстолбцы `.size` и может повысить эффективность сжатия.

Вложенные типы `String` (например, внутри `Nullable`, `LowCardinality`, `Array` или `Map`)
не затрагиваются, за исключением случаев, когда они появляются в `Tuple`.

Возможные значения:

- `single_stream` — использовать стандартный формат сериализации с inline-размерами.
- `with_size_stream` — использовать отдельный поток для размеров для столбцов верхнего уровня типа `String`.

## table_disk {#table_disk} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Это диск таблицы; путь/endpoint должен указывать на данные таблицы, а не на
данные базы данных. Может быть задан только для s3_plain/s3_plain_rewritable/web.

## temporary_directories_lifetime {#temporary_directories_lifetime} 

<SettingsInfoBlock type="Seconds" default_value="86400" />

Сколько секунд хранить временные каталоги с префиксом tmp_. Не следует занижать это значение,
так как слияния и мутации могут работать некорректно при слишком низком
значении этого SETTING.

## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout} 

<SettingsInfoBlock type="Seconds" default_value="7200" />

Таймаут (в секундах) перед запуском слияния с повторным сжатием. В течение этого
времени ClickHouse пытается получить повторно сжатую часть с реплики, которой
было назначено это слияние с повторным сжатием.

Повторное сжатие в большинстве случаев выполняется медленно, поэтому слияние с
повторным сжатием не запускается до истечения этого таймаута — в это время выполняется попытка получить повторно сжатую часть с
реплики, которой было назначено это слияние с повторным сжатием.

Возможные значения:

- Любое положительное целое число.

## ttl_only_drop_parts {#ttl_only_drop_parts} 

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет тем, удаляются ли части данных целиком в таблицах MergeTree, когда срок действия всех строк в этой части истёк в соответствии с их настройками `TTL`.

Когда `ttl_only_drop_parts` отключён (по умолчанию), удаляются только те строки, срок действия которых истёк согласно их настройкам `TTL`.

Когда `ttl_only_drop_parts` включён, вся часть удаляется, если срок действия всех строк в этой части истёк в соответствии с их настройками `TTL`.

## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns} 

<SettingsInfoBlock type="Bool" default_value="1" />

Позволяет использовать адаптивные буферы записи при записи динамических подстолбцов для уменьшения расхода памяти

## use_async_block_ids_cache {#use_async_block_ids_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если `true`, кэшируются хеш-суммы асинхронных вставок.

Возможные значения:

- `true`
- `false`

Блок, содержащий несколько асинхронных вставок, сгенерирует несколько хеш-сумм.
Когда часть вставок дублируется, Keeper вернёт только одну
дублированную хеш-сумму в одном RPC, что приведёт к необходимости лишних повторных RPC-вызовов.
Этот кэш будет отслеживать путь, по которому в Keeper хранятся хеш-суммы. Если в Keeper
обнаруживаются обновления, кэш обновится как можно быстрее, чтобы можно было
отфильтровывать дублированные вставки в памяти.

## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает компактный режим двоичной сериализации дискриминаторов в типе данных Variant.
Этот режим позволяет значительно сократить использование памяти для хранения дискриминаторов
в частях, когда в данных в основном присутствует один вариант или много значений NULL.

## use_const_adaptive_granularity {#use_const_adaptive_granularity} 

<SettingsInfoBlock type="Bool" default_value="0" />

Всегда использовать постоянную зернистость для всей части. Это позволяет сжимать в памяти значения зернистости индекса. Может быть полезно при экстремально больших нагрузках с «тонкими» таблицами.

## use_metadata_cache {#use_metadata_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

Устаревший параметр, не оказывает никакого эффекта.

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

Использовать кэш для первичного индекса
вместо хранения всех индексов в памяти. Может быть полезно для очень больших таблиц.

## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный (приблизительный) несжатый размер объединяемых частей в байтах, при котором активируется вертикальный алгоритм слияния.

## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate} 

<SettingsInfoBlock type="UInt64" default_value="11" />

Минимальное количество столбцов, не входящих в первичный ключ (PK), при котором активируется вертикальный алгоритм слияния.

## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

Минимальное (приблизительное) суммарное количество строк в
сливаемых частях для активации алгоритма вертикального слияния.

## vertical_merge_optimize_lightweight_delete {#vertical_merge_optimize_lightweight_delete} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

Если включено, легковесное удаление оптимизируется при вертикальных слияниях.

## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если значение равно `true`, используется предзагрузка данных из удалённой файловой системы для следующего столбца при слиянии.

## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Перед завершением работы таблица будет ожидать заданное время, чтобы уникальные части
(существующие только на текущей реплике) были загружены другими репликами (0 означает,
что ожидание отключено).

## write_ahead_log_bytes_to_fsync {#write_ahead_log_bytes_to_fsync} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />

Устаревшая настройка, ничего не делает.

## write_ahead_log_interval_ms_to_fsync {#write_ahead_log_interval_ms_to_fsync} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Устаревшая настройка, не оказывает эффекта.

## write_ahead_log_max_bytes {#write_ahead_log_max_bytes} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Устаревшая настройка, не оказывает никакого эффекта.

## write_final_mark {#write_final_mark} 

<SettingsInfoBlock type="Bool" default_value="1" />

Устаревшая настройка, ни на что не влияет.

## write_marks_for_substreams_in_compact_parts {#write_marks_for_substreams_in_compact_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Включить по умолчанию запись меток для подпотоков в компактных частях"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Включает запись меток для каждого подпотока вместо каждого столбца в компактных частях.
Это позволяет эффективно читать отдельные подстолбцы из части данных.

Например, столбец `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` сериализуется в следующие подпотоки:

- `t.a` для данных String элемента кортежа `a`
- `t.b` для данных UInt32 элемента кортежа `b`
- `t.c.size0` для размеров массива элемента кортежа `c`
- `t.c.null` для null-карты вложенных элементов массива элемента кортежа `c`
- `t.c` для данных UInt32 вложенных элементов массива элемента кортежа `c`

Когда эта настройка включена, для каждого из этих 5 подпотоков записывается метка, что означает, что при необходимости можно читать
данные каждого отдельного подпотока из гранулы независимо. Например, если нужно прочитать подстолбец `t.c`, будут прочитаны только данные
подпотоков `t.c.size0`, `t.c.null` и `t.c`, и не будут читаться данные из подпотоков `t.a` и `t.b`. Когда эта настройка отключена,
метка записывается только для столбца верхнего уровня `t`, что означает, что из гранулы всегда будет читаться весь столбец целиком, даже если нужны только данные некоторых подпотоков.

## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio} 

<SettingsInfoBlock type="Float" default_value="0.05" />

Максимальный процент частей верхнего уровня, удаление которых можно отложить, чтобы получить меньшие независимые диапазоны. Рекомендуется не изменять.

## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times} 

<SettingsInfoBlock type="UInt64" default_value="5" />

Максимальная глубина рекурсии для разбиения независимых диапазонов устаревших частей на
более мелкие поддиапазоны. Не рекомендуется изменять.

## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Если zero-copy репликация включена, выполнение приостанавливается на случайный промежуток времени перед попыткой
получения блокировки в зависимости от размера частей для слияния или мутации

## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

Если zero-copy репликация включена, делать случайную паузу до 500 мс
перед попыткой получить блокировку на слияние или мутацию.

## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period} 

<SettingsInfoBlock type="Seconds" default_value="60" />

Период проверки истечения срока действия сессии ZooKeeper (в секундах).

Возможные значения:

- Любое положительное целое число.