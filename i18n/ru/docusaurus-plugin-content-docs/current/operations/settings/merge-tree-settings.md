---
slug: '/operations/settings/merge-tree-settings'
description: 'Настройки для MergeTree, которые находятся в `system.merge_tree_settings`'
title: 'MergeTree tables settings'
doc_type: reference
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

Системная таблица `system.merge_tree_settings` показывает глобально заданные настройки MergeTree.

Настройки MergeTree могут быть заданы в разделе `merge_tree` файла конфигурации сервера или указаны для каждой таблицы `MergeTree` отдельно в
клауза `SETTINGS` оператора `CREATE TABLE`.

Пример кастомизации настройки `max_suspicious_broken_parts`:

Настройка по умолчанию для всех таблиц `MergeTree` в файле конфигурации сервера:

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

Установить для конкретной таблицы:

```sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

Изменить настройки для конкретной таблицы с использованием `ALTER TABLE ... MODIFY SETTING`:

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- reset to global default (value from system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```
## Настройки MergeTree {#mergetree-settings}
<!-- Настройки ниже были автоматически сгенерированы скриптом на 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
-->
## adaptive_write_buffer_initial_size {#adaptive_write_buffer_initial_size} 
<SettingsInfoBlock type="UInt64" default_value="16384" />

Начальный размер адаптивного буфера записи
## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine} 
<SettingsInfoBlock type="Bool" default_value="0" />

Если true, добавляет неявное ограничение для колонки `sign` в таблице CollapsingMergeTree
или VersionedCollapsingMergeTree, разрешая только допустимые значения (`1` и `-1`).
## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>


Когда активировано, добавляются минимально-максимальные (пропускающие) индексы для всех числовых колонок
в таблице.
## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>


Когда активировано, добавляются минимально-максимальные (пропускающие) индексы для всех строковых колонок таблицы.
## allow_coalescing_columns_in_partition_or_order_key {#allow_coalescing_columns_in_partition_or_order_key} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "New setting to allow coalescing of partition or sorting key columns."}]}]}/>


Когда активировано, позволяет использовать объединяемые колонки в таблице CoalescingMergeTree в
ключе партиции или сортировки.
## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

Разрешить экспериментальные CLEANUP слияния для ReplacingMergeTree с колонкой `is_deleted`.
Когда включено, разрешает использование `OPTIMIZE ... FINAL CLEANUP` для ручного
слияния всех частей в партиции до одной части и удаления любых
удалённых строк.

Также позволяет включать такие слияния для автоматического выполнения в фоновом режиме
с настройками `min_age_to_force_merge_seconds`,
`min_age_to_force_merge_on_partition_only` и
`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`.
## allow_experimental_reverse_key {#allow_experimental_reverse_key} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>


Включает поддержку обратного порядка сортировки в ключах сортировки MergeTree. Эта
настройка особенно полезна для анализа временных рядов и запросов Top-N,
позволяющая хранить данные в обратном хронологическом порядке для оптимизации производительности запросов.

При включении `allow_experimental_reverse_key` вы можете определить обратный порядок сортировки
в клаузе `ORDER BY` таблицы MergeTree. Это позволяет использовать более эффективные оптимизации `ReadInOrder` вместо `ReadInReverseOrder`
для обратных запросов.

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

Используя `ORDER BY time DESC` в запросе, применяется `ReadInOrder`.

**Значение по умолчанию:** false
## allow_floating_point_partition_key {#allow_floating_point_partition_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использовать вещественные числа в качестве ключа партиции.

Возможные значения:
- `0` — Вещественный ключ партиции не разрешён.
- `1` — Вещественный ключ партиции разрешён.
## allow_nullable_key {#allow_nullable_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

Разрешить типы Nullable в качестве первичных ключей.
## allow_part_offset_column_in_projections {#allow_part_offset_column_in_projections} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Now projections can use _part_offset column."}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting, it protects from creating projections with parent part offset column until it is stabilized."}]}]}/>


Разрешить использование колонки '_part_offset' в запросе выборки проекций.
## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Now SMT will remove stale blocking parts from ZooKeeper by default"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>


Фоновая задача, которая уменьшает блокирующие части для общих таблиц merge tree.
Только в ClickHouse Cloud
## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

Не используйте эту настройку в производственной среде, так как она не готова.
## allow_summing_columns_in_partition_or_order_key {#allow_summing_columns_in_partition_or_order_key} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting to allow summing of partition or sorting key columns"}]}]}/>


Когда активировано, позволяет суммирующие колонки в таблице SummingMergeTree использовать в
ключе партиции или сортировки.
## allow_suspicious_indices {#allow_suspicious_indices} 
<SettingsInfoBlock type="Bool" default_value="0" />

Отклонить первичные/вторичные индексы и ключи сортировки с одинаковыми выражениями.
## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает вертикальные слияния из компактных в широкие части. Эта настройка должна иметь
одинаковое значение на всех репликах.
## always_fetch_merged_part {#always_fetch_merged_part} 
<SettingsInfoBlock type="Bool" default_value="0" />

Если true, эта реплика никогда не сливает части и всегда загружает объединенные части
из других реплик.

Возможные значения:
- true, false
## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks} 
<SettingsInfoBlock type="Bool" default_value="0" />

Всегда копировать данные вместо создания жестких ссылок во время мутаций/замен/отсоединений
и так далее.
## apply_patches_on_merge {#apply_patches_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>


Если true, патчи применяются к частям при слиянии.
## assign_part_uuids {#assign_part_uuids} 
<SettingsInfoBlock type="Bool" default_value="0" />

Когда включено, уникальный идентификатор части будет присваиваться для каждой новой части.
Перед включением проверьте, что все реплики поддерживают UUID версии 4.
## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="100" />

Как долго каждое вставочное изменение будет ждать обновления кэша async_block_ids.
## async_insert {#async_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

Если true, данные из запроса INSERT хранятся в очереди и позже выгружаются в
таблицу в фоновом режиме.
## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="50" />

Целевое время выполнения одного шага слияния или мутации. Может быть превышено, если
один шаг занимает больше времени.
## cache_populated_by_fetch {#cache_populated_by_fetch} 
<SettingsInfoBlock type="Bool" default_value="0" />

:::note
Эта настройка применяется только к ClickHouse Cloud.
:::

Когда `cache_populated_by_fetch` отключен (настройка по умолчанию), новые части данных
загружаются в кэш только при выполнении запроса, который требует этих
частей.

Если включено, `cache_populated_by_fetch` вместо этого заставит все узлы загружать
новые части данных из хранилища в свой кэш без необходимости для запроса инициировать такое действие.

**См. также**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)
## cache_populated_by_fetch_filename_regexp {#cache_populated_by_fetch_filename_regexp} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "New setting"}]}]}/>


:::note
Эта настройка применяется только к ClickHouse Cloud.
:::

Если не пусто, только файлы, соответствующие этому регулярному выражению, будут предварительно прогреваться в кэш после выборки (если `cache_populated_by_fetch` включен).
## check_delay_period {#check_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="60" />
Устаревшая настройка, ничего не делает.
## check_sample_column_is_correct {#check_sample_column_is_correct} 
<SettingsInfoBlock type="Bool" default_value="1" />

Включает проверку при создании таблицы, что тип данных колонки для
выборки или выражения выборки правильный. Тип данных должен быть одним из беззнаковых
[целочисленных типов](/sql-reference/data-types/int-uint): `UInt8`, `UInt16`,
`UInt32`, `UInt64`.

Возможные значения:
- `true`  — Проверка включена.
- `false` — Проверка отключена при создании таблицы.

Значение по умолчанию: `true`.

По умолчанию сервер ClickHouse проверяет при создании таблицы тип данных
колонки для выборки или выражения выборки. Если у вас уже есть таблицы с
неправильным выражением выборки и вы не хотите, чтобы сервер вызвал исключение
во время запуска, установите `check_sample_column_is_correct` в `false`.
## clean_deleted_rows {#clean_deleted_rows} 
<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />
Устаревшая настройка, ничего не делает.
## cleanup_delay_period {#cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />

Минимальный период для очистки старых журналов очередей, хешей блоков и частей.
## cleanup_delay_period_random_add {#cleanup_delay_period_random_add} 
<SettingsInfoBlock type="UInt64" default_value="10" />

Добавить равномерно распределённое значение от 0 до x секунд к cleanup_delay_period
для избежания эффекта громой стаи и последующего DoS ZooKeeper в случае
очень большого числа таблиц.
## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration} 
<SettingsInfoBlock type="UInt64" default_value="150" />

Предпочтительный размер пакета для фоновой очистки (точки являются абстрактными, но 1 точка
примерно эквивалентна 1 вставленному блоку).
## cleanup_threads {#cleanup_threads} 
<SettingsInfoBlock type="UInt64" default_value="128" />
Устаревшая настройка, ничего не делает.
## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "New setting to calculate columns and indices sizes lazily"}]}]}/>


Вычислить размеры колонок и вторичных индексов лениво при первом запросе вместо
при инициализации таблицы.
## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache} 


Список колонок, для которых необходимо предварительно прогреть кэш меток (если включено). Пусто означает все колонки.
## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="134217728" />

Доступно только в ClickHouse Cloud. Максимальное количество байтов, которые можно записать за один раз в
компактные части.
## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer} 
<SettingsInfoBlock type="UInt64" default_value="128" />

Доступно только в ClickHouse Cloud. Максимальное количество гранул, которое можно записать за один раз в
компактные части.
## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part} 
<SettingsInfoBlock type="UInt64" default_value="16777216" />

Доступно только в ClickHouse Cloud. Максимальный размер компактной части, которую можно считать целиком в память во время слияния.
## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key} 
<SettingsInfoBlock type="Bool" default_value="0" />

Разрешить создание таблицы с выражением выборки, не находящимся в первичном ключе. Это необходимо только
для временного разрешения работы сервера с неправильными таблицами ради
обратной совместимости.
## compress_marks {#compress_marks} 
<SettingsInfoBlock type="Bool" default_value="1" />

Метки поддерживают сжатие, уменьшают размер файлов меток и ускоряют сетевую
передачу.
## compress_primary_key {#compress_primary_key} 
<SettingsInfoBlock type="Bool" default_value="1" />

Первичный ключ поддерживает сжатие, уменьшает размер файла первичного ключа и ускоряет
сетевую передачу.
## concurrent_part_removal_threshold {#concurrent_part_removal_threshold} 
<SettingsInfoBlock type="UInt64" default_value="100" />

Активировать параллельное удаление частей (см. 'max_part_removal_threads') только если
число неактивных частей данных составляет хотя бы это значение.
## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode} 
<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "Do not allow to create inconsistent projection"}]}]}/>


Разрешить создавать проекцию для таблицы с неклассическим MergeTree,
то есть не (Replicated, Shared) MergeTree. Игнорировать опцию чисто для
совместимости, что может привести к неправильному ответу. В противном случае, если разрешено,
какое действие будет проводиться при слиянии проекций, либо удаление, либо восстановление. Таким образом классический
MergeTree проигнорирует эту настройку. Она также контролирует `OPTIMIZE DEDUPLICATE`,
но влияет на всех членов семейства MergeTree. Похожая на
опцию `lightweight_mutation_projection_mode`, это также на уровне частей.

Возможные значения:
- `ignore`
- `throw`
- `drop`
- `rebuild`
## default_compression_codec {#default_compression_codec} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "New setting"}]}]}/>


Указывает кодек сжатия по умолчанию, который будет использоваться, если для определённой колонки в декларации таблицы ничего не определено.
Порядок выбора кодека сжатия для колонки:
1. Кодек сжатия, определённый для колонки в декларации таблицы
2. Кодек сжатия, определённый в `default_compression_codec` (эта настройка)
3. Кодек сжатия по умолчанию, определённый в настройках `compression`.
Значение по умолчанию: пустая строка (не определено).
## detach_not_byte_identical_parts {#detach_not_byte_identical_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает отсоединение части данных на реплике после слияния или мутации, если она не является байтово-идентичной частям данных на других репликах. Если отключено, часть данных удаляется. Активируйте эту настройку, если вы хотите
анализировать такие части позже.

Настройка применима к таблицам `MergeTree` с включенной
[репликацией данных](/engines/table-engines/mergetree-family/replacingmergetree).

Возможные значения:

- `0` — Части удаляются.
- `1` — Части отсоединяются.
## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica} 
<SettingsInfoBlock type="Bool" default_value="1" />

Не удалять старые локальные части при восстановлении потерянной реплики.

Возможные значения:
- `true`
- `false`
## disable_detach_partition_for_zero_copy_replication {#disable_detach_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

Отключить запрос DETACH PARTITION для репликации без копий.
## disable_fetch_partition_for_zero_copy_replication {#disable_fetch_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

Отключить запрос FETCH PARTITION для репликации без копий.
## disable_freeze_partition_for_zero_copy_replication {#disable_freeze_partition_for_zero_copy_replication} 
<SettingsInfoBlock type="Bool" default_value="1" />

Отключить запрос FREEZE PARTITION для репликации без копий.
## disk {#disk} 


Имя диска хранения. Может быть указано вместо политики хранения.
## dynamic_serialization_version {#dynamic_serialization_version} 
<SettingsInfoBlock type="MergeTreeDynamicSerializationVersion" default_value="v2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Add a setting to control Dynamic serialization versions"}]}]}/>


Версия сериализации для динамического типа данных. Требуется для совместимости.

Возможные значения:
- `v1`
- `v2`
- `v3`
## enable_block_number_column {#enable_block_number_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

Включает хранение колонки _block_number для каждой строки.
## enable_block_offset_column {#enable_block_offset_column} 
<SettingsInfoBlock type="Bool" default_value="0" />

Сохраняет виртуальную колонку `_block_number` при слияниях.
## enable_index_granularity_compression {#enable_index_granularity_compression} 
<SettingsInfoBlock type="Bool" default_value="1" />

Сжимает в памяти значения границ индекса, если это возможно.
## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Added new setting to limit max bytes for min_age_to_force_merge."}]}]}/>


Если настройки `min_age_to_force_merge_seconds` и
`min_age_to_force_merge_on_partition_only` должны учитывать настройку
`max_bytes_to_merge_at_max_space_in_pool`.

Возможные значения:
- `true`
- `false`
## enable_mixed_granularity_parts {#enable_mixed_granularity_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает переход к контролю размера гранулы с помощью
настройки `index_granularity_bytes`. До версии 19.11 существовала только
настройка `index_granularity` для ограничения размера гранулы. Настройка
`index_granularity_bytes` улучшает производительность ClickHouse при
выборке данных из таблиц с большими строками (десятки и сотни мегабайтов).
Если у вас есть таблицы с большими строками, вы можете включить эту настройку для таблиц
для повышения эффективности запросов `SELECT`.
## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting to allow automatic cleanup merges for ReplacingMergeTree"}]}]}/>


Следует ли использовать CLEANUP слияния для ReplacingMergeTree при слиянии партиций
до одной части. Требуется включение `allow_experimental_replacing_merge_with_cleanup`,
`min_age_to_force_merge_seconds` и `min_age_to_force_merge_on_partition_only`.

Возможные значения:
- `true`
- `false`
## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix} 
<SettingsInfoBlock type="Bool" default_value="0" />

Включить идентификатор конечной точки с префиксом имени zookeeper для таблицы реплики merge tree.
## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm} 
<SettingsInfoBlock type="UInt64" default_value="1" />

Включить использование вертикального алгоритма слияния.
## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>


Если эта настройка включена для целевой таблицы запроса манипуляции партицией
(`ATTACH/MOVE/REPLACE PARTITION`), индексы и проекции должны быть
идентичны между исходной и целевой таблицами. В противном случае целевая
таблица может иметь супермножество индексов и проекций исходной таблицы.
## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge} 
<SettingsInfoBlock type="Bool" default_value="0" />

Если включено, оцененный фактический размер частей данных (то есть, исключая строки,
которые были удалены через `DELETE FROM`) будет использоваться при выборе
частей для слияния. Обратите внимание, что это поведение срабатывает только для частей данных
подверженных `DELETE FROM`, выполненному после включения этой настройки.

Возможные значения:
- `true`
- `false`

**См. также**
- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts)
настройка
## exclude_materialize_skip_indexes_on_merge {#exclude_materialize_skip_indexes_on_merge} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "New setting."}]}]}/>


Исключает предоставленный запятую разделённый список пропускных индексов из построения и хранения во время слияний. Не имеет эффекта, если
[materialize_skip_indexes_on_merge](#materialize_skip_indexes_on_merge) равно false.

Исключенные пропускные индексы всё равно будут построены и сохранены с помощью явного
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) запроса или во время INSERT в зависимости от
настройки [materialize_skip_indexes_on_insert](/operations/settings/settings.md/#materialize_skip_indexes_on_insert)
сессии.

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

Когда это значение больше нуля, только одна реплика начинает
слияние немедленно, а другие реплики ждут до этой суммы времени, чтобы
скачать результат вместо того, чтобы выполнять слияния локально. Если выбранная реплика
не завершает слияние за это время, происходит переход к стандартному
поведению.

Возможные значения:
- Любое положительное целое число.
## fault_probability_after_part_commit {#fault_probability_after_part_commit} 
<SettingsInfoBlock type="Float" default_value="0" />

Для тестирования. Не изменяйте это.
## fault_probability_before_part_commit {#fault_probability_before_part_commit} 
<SettingsInfoBlock type="Float" default_value="0" />

Для тестирования. Не изменяйте это.
## finished_mutations_to_keep {#finished_mutations_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="100" />

Сколько записей о мутациях, которые уже завершены, следует сохранить. Если ноль, то сохраняются
все.
## force_read_through_cache_for_merges {#force_read_through_cache_for_merges} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

Принудительное чтение через файловый кеш для слияний.
## fsync_after_insert {#fsync_after_insert} 
<SettingsInfoBlock type="Bool" default_value="0" />

Выполнить fsync для каждой вставленной части. Значительно снижает производительность
вставок, не рекомендуется использовать с широкими частями.
## fsync_part_directory {#fsync_part_directory} 
<SettingsInfoBlock type="Bool" default_value="0" />

Выполнить fsync для каталога частей после всех операций с частями (записи, переименования и т.д.).
## in_memory_parts_enable_wal {#in_memory_parts_enable_wal} 
<SettingsInfoBlock type="Bool" default_value="1" />
Устаревшая настройка, ничего не делает.
## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 
<SettingsInfoBlock type="Bool" default_value="0" />
Устаревшая настройка, ничего не делает.
## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Если число неактивных частей в одной партиции таблицы превышает
значение `inactive_parts_to_delay_insert`, операция `INSERT` искусственно
замедляется.

:::tip
Это полезно, когда сервер не успевает быстро очищать части.
:::

Возможные значения:
- Любое положительное целое число.
## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Если число неактивных частей в одной партиции больше, чем значение
`inactive_parts_to_throw_insert`, операция `INSERT` прерывается с ошибкой:

> "Слишком много неактивных частей (N). Удаление частей происходит значительно
медленнее, чем вставки." исключение.

Возможные значения:
- Любое положительное целое число.
## index_granularity {#index_granularity} 
<SettingsInfoBlock type="UInt64" default_value="8192" />

Максимальное количество строк данных между метками индекса. То есть, сколько строк
соответствует одному значению первичного ключа.
## index_granularity_bytes {#index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

Максимальный размер гранул данных в байтах.

Чтобы ограничить размер гранулы только по количеству строк, установите в `0` (не рекомендуется).
## initialization_retry_period {#initialization_retry_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

Период повторной попытки для инициализации таблицы, в секундах.
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

По умолчанию, легковесное удаление `DELETE` не работает для таблиц с
проекциями. Это связано с тем, что строки в проекции могут быть затронуты операцией
`DELETE`. Таким образом, значение по умолчанию будет `throw`. Однако эта
опция может изменить поведение. Со значением либо `drop`, либо `rebuild`,
удаления будут работать с проекциями. `drop` удалит проекцию, так что это
может быть быстро в текущем запросе, так как проекция будет удалена, но медленно в
будущих запросах, так как проекция не будет прикреплена. `rebuild` перестроит
проекцию, что может повлиять на производительность текущего запроса, но
может ускорить будущие запросы. Хорошо, что эти опции работают только на уровне части,
что означает, что проекции в части, которые не затрагиваются, остаются нетронутыми и не
вызывают никаких действий, таких как
удаление или восстановление.

Возможные значения:
- `throw`
- `drop`
- `rebuild`
## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

Если включено вместе с [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge),
количество удалённых строк для существующих частей данных будет вычисляться во время запуска таблицы.
Обратите внимание, что это может замедлить загрузку таблицы при старте.

Возможные значения:
- `true`
- `false`

**См. также**
- [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge) настройка
## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations} 
<SettingsInfoBlock type="Seconds" default_value="120" />

Для фоновых операций, таких как слияния, мутации и т. д. Сколько секунд до
неудачи при получении блокировок таблицы.
## marks_compress_block_size {#marks_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

Размер блока сжатия меток, фактический размер блока для сжатия.
## marks_compression_codec {#marks_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

Кодек сжатия, используемый для меток, метки достаточно малы и кэшируются, поэтому
по умолчанию используется сжатие ZSTD(3).
## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "New setting"}]}]}/>


Когда включено, слияния строят и хранят пропускные индексы для новых частей.
В противном случае они могут быть созданы/сохранены с помощью явного
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)
или [во время вставок](/operations/settings/settings.md/#materialize_skip_indexes_on_insert).

См. также [exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge) для более детального контроля.
## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

Только пересчитывает информацию ttl, когда MATERIALIZE TTL.
## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Проверка "слишком много частей" согласно 'parts_to_delay_insert' и
'parts_to_throw_insert' будет активна только если средний размер части (в
соответствующей партиции) не превышает заданный порог. Если он
больше указанного порога, операции INSERT будут ни задержаны, ни
отклонены. Это позволяет иметь сотни терабайт в одной таблице на одном
сервере, если части успешно сливаются в более крупные части. Это
не влияет на пороги на неактивные части или общее количество частей.
## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="161061273600" />

Максимальный общий размер частей (в байтах), который будет слит в одну часть, если есть
достаточно ресурсов. Приблизительно соответствует максимальному возможному
размеру части, созданной автоматически в фоновом режиме. (0 означает, что слияния будут отключены)

Возможные значения:

- Любое неотрицательное целое число.

Планировщик слияний периодически анализирует размеры и количество частей в
партициях, и если в пуле достаточно свободных ресурсов, он запускает
фоновое слияние. Слияния происходят, пока общий размер исходных частей
не превышает `max_bytes_to_merge_at_max_space_in_pool`.

Слияния, инициированные [OPTIMIZE FINAL](/sql-reference/statements/optimize)
игнорируют `max_bytes_to_merge_at_max_space_in_pool` (учитывается только
свободное дисковое пространство).
## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="1048576" />

Максимальный общий размер частей (в байтах), который будет слит в одну часть, с
минимальным доступными ресурсами в фоновом.pool.

Возможные значения:
- Любое положительное целое число.

`max_bytes_to_merge_at_min_space_in_pool` определяет максимальный общий размер
частей, который может быть слит, несмотря на отсутствие свободного дискового пространства (в пуле).
Это необходимо для сокращения числа мелких частей и снижения вероятности ошибок
"Слишком много частей".
Слияния резервируют дисковое пространство, удваивая общий размер слитых частей.
Таким образом, при малом количестве свободного дискового пространства может возникнуть ситуация,
когда свободное место есть, но это место уже зарезервировано текущими крупными слияниями,
так что другие слияния не могут начаться, и число мелких частей увеличивается с каждой вставкой.
## max_cleanup_delay_period {#max_cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="300" />

Максимальный срок очистки старых журналов очередей, хешей блоков и частей.
## max_compress_block_size {#max_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер блоков не сжатых данных перед сжатием для записи
в таблицу. Вы также можете указать эту настройку в глобальных настройках
(см. [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size)
настройку). Значение, указанное при создании таблицы, переопределяет глобальное
значение для этой настройки.
## max_concurrent_queries {#max_concurrent_queries} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество одновременно выполняемых запросов, связанных с таблицей MergeTree.
Запросы по-прежнему будут ограничены другими настройками `max_concurrent_queries`.

Возможные значения:
- Положительное целое число.
- `0` — Без ограничений.

Значение по умолчанию: `0` (без ограничений).

**Пример**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```
## max_delay_to_insert {#max_delay_to_insert} 
<SettingsInfoBlock type="UInt64" default_value="1" />

Значение в секундах, которое используется для расчета задержки `INSERT`, если число
активных частей в одной партиции превышает значение
[parts_to_delay_insert](#parts_to_delay_insert).

Возможные значения:
- Любое положительное целое число.

Задержка (в миллисекундах) для `INSERT` рассчитывается по формуле:

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```
Например, если в партиции 299 активных частей и parts_to_throw_insert
= 300, parts_to_delay_insert = 150, max_delay_to_insert = 1, операция `INSERT` задерживается на `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000`
миллисекунд.

Начиная с версии 23.1 формула была изменена на:

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

Например, если в партиции 224 активных частей и parts_to_throw_insert
= 300, parts_to_delay_insert = 150, max_delay_to_insert = 1,
min_delay_to_insert_ms = 10, операция `INSERT` задерживается на `max( 10, 1 * 1000 *
(224 - 150 + 1) / (300 - 150) ) = 500`milliseconds.
## max_delay_to_mutate_ms {#max_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальная задержка мутации таблицы MergeTree в миллисекундах, если много
незавершённых мутаций.
## max_digestion_size_per_segment {#max_digestion_size_per_segment} 
<SettingsInfoBlock type="UInt64" default_value="268435456" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "268435456"},{"label": "Obsolete setting"}]}]}/>

Устаревшая настройка, ничего не делает.
## max_file_name_length {#max_file_name_length} 
<SettingsInfoBlock type="UInt64" default_value="127" />

Максимальная длина имени файла, чтобы сохранить его в оригинальном виде без хеширования.
Вступает в силу только если настройка `replace_long_file_name_to_hash` включена.
Значение этой настройки не включает длину расширения файла. Поэтому
рекомендуется установить его ниже максимальной длины имени файла (обычно 255
байт) с небольшим запасом, чтобы избежать ошибок файловой системы.
## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="75" />

Не применять ALTER, если количество файлов для модификации (удаление, добавление)
превышает эту настройку.

Возможные значения:

- Любое положительное целое число.

Значение по умолчанию: 75
## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns} 
<SettingsInfoBlock type="UInt64" default_value="50" />

Не применять ALTER, если количество файлов для удаления превышает эту
настройку.

Возможные значения:
- Любое положительное целое число.
## max_merge_delayed_streams_for_parallel_write {#max_merge_delayed_streams_for_parallel_write} 
<SettingsInfoBlock type="UInt64" default_value="40" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "New setting"}]}]}/>


Максимальное количество потоков (колонок), которые могут быть сброшены параллельно
(аналог max_insert_delayed_streams_for_parallel_write для слияний). Работает
только для вертикальных слияний.
## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />

Максимальное время ожидания перед повторной попыткой выбора частей для слияния, если не
было выбрано частей. Более низкая настройка приведёт к частому запуску задач выборки в
фоновом пуле, что приведёт к большому количеству
запросов к zookeeper в крупномасштабных кластерах.
## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool} 
<SettingsInfoBlock type="UInt64" default_value="2" />
Когда есть
больше, чем указанное количество слияний с записями TTL в пуле, не назначайте
новое слияние с TTL. Это нужно, чтобы оставить свободные потоки для обычных слияний и
избежать "Слишком много частей".
## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничьте количество мутаций частей для реплики до указанного количества.
Ноль означает отсутствие ограничения на количество мутаций для реплики (из-за этого выполнение
по-прежнему может быть ограничено другими настройками).
## max_part_loading_threads {#max_part_loading_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(14)'" />
Устаревшая настройка, ничего не делает.
## max_part_removal_threads {#max_part_removal_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(14)'" />
Устаревшая настройка, ничего не делает.
## max_partitions_to_read {#max_partitions_to_read} 
<SettingsInfoBlock type="Int64" default_value="-1" />

Ограничивает максимальное количество партиций, к которым можно получить доступ в одном запросе.

Значение настройки, указанное при создании таблицы, может быть переопределено с помощью
настройки на уровне запроса.

Допустимые значения:
- Любое положительное целое число.

Вы также можете указать настройку сложности запроса [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)
на уровне запроса / сессии / профиля.
## max_parts_in_total {#max_parts_in_total} 
<SettingsInfoBlock type="UInt64" default_value="100000" />

Если общее количество активных частей во всех партициях таблицы превышает
значение `max_parts_in_total`, `INSERT` прерывается с исключением `Слишком много частей (N)`.

Допустимые значения:
- Любое положительное целое число.

Большое количество частей в таблице снижает производительность запросов ClickHouse
и увеличивает время загрузки ClickHouse. Чаще всего это следствие
некорректного проектирования (ошибки при выборе стратегии партиционирования - слишком маленькие
партиции).
## max_parts_to_merge_at_once {#max_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="100" />

Максимальное количество частей, которые могут быть объединены одновременно (0 - отключено). Не влияет
на запрос OPTIMIZE FINAL.
## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />

Максимальное время задержки для неудавшихся мутаций.
## max_postpone_time_for_failed_replicated_fetches_ms {#max_postpone_time_for_failed_replicated_fetches_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Added new setting to enable postponing fetch tasks in the replication queue."}]}]}/>

Максимальное время задержки для неудавшихся реплицированных выборок.
## max_postpone_time_for_failed_replicated_merges_ms {#max_postpone_time_for_failed_replicated_merges_ms} 
<SettingsInfoBlock type="UInt64" default_value="60000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Added new setting to enable postponing merge tasks in the replication queue."}]}]}/>

Максимальное время задержки для неудавшихся реплицированных слияний.
## max_postpone_time_for_failed_replicated_tasks_ms {#max_postpone_time_for_failed_replicated_tasks_ms} 
<SettingsInfoBlock type="UInt64" default_value="300000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "Added new setting to enable postponing tasks in the replication queue."}]}]}/>

Максимальное время задержки для неудавшейся реплицированной задачи. Значение используется, если задача не является выборкой, слиянием или мутацией.
## max_projections {#max_projections} 
<SettingsInfoBlock type="UInt64" default_value="25" />

Максимальное количество проекций merge tree.
## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает максимальную скорость обмена данными по сети в байтах в секунду для [реплицированных](../../engines/table-engines/mergetree-family/replication.md) выборок. Эта настройка применяется к конкретной таблице, в отличие от
[`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth)
настройки, которая применяется к серверу.

Вы можете ограничить как сетевой обмен на сервере, так и в конкретной таблице, но
для этого значение настройки на уровне таблицы должно быть меньше, чем на уровне сервера.
В противном случае сервер учитывает только
настройку `max_replicated_fetches_network_bandwidth_for_server`.

Настройка не соблюдается совершенно точно.

Допустимые значения:

- Положительное целое число.
- `0` — Без ограничений.

Значение по умолчанию: `0`.

**Использование**

Может быть использовано для ограничения скорости при репликации данных для добавления или замены
новых узлов.
## max_replicated_logs_to_keep {#max_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

Сколько записей может быть в журнале ClickHouse Keeper, если есть неактивная
реплика. Неактивная реплика становится потерянной, когда это число превышается.

Допустимые значения:
- Любое положительное целое число.
## max_replicated_merges_in_queue {#max_replicated_merges_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

Сколько задач слияния и мутации частей разрешено одновременно в очереди ReplicatedMergeTree.
## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="1" />

Сколько задач слияния частей с TTL разрешено одновременно в очереди ReplicatedMergeTree.
## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue} 
<SettingsInfoBlock type="UInt64" default_value="8" />

Сколько задач мутации частей разрешено одновременно в очереди ReplicatedMergeTree.
## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает максимальную скорость обмена данными по сети в байтах в секунду для [реплицированных](/engines/table-engines/mergetree-family/replacingmergetree) отправок. Эта настройка применяется к конкретной таблице, в отличие от
[`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth)
настройки, которая применяется к серверу.

Вы можете ограничить как сетевой обмен на сервере, так и в конкретной таблице, но
для этого значение настройки на уровне таблицы должно быть меньше, чем на уровне сервера.
В противном случае сервер учитывает только
настройку `max_replicated_sends_network_bandwidth_for_server`.

Настройка не соблюдается совершенно точно.

Допустимые значения:

- Положительное целое число.
- `0` — Без ограничений.

**Использование**

Может быть использовано для ограничения скорости при репликации данных для добавления или замены
новых узлов.
## max_suspicious_broken_parts {#max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="100" />

Если количество поврежденных частей в одной партиции превышает
значение `max_suspicious_broken_parts`, автоматическое удаление запрещено.

Допустимые значения:
- Любое положительное целое число.
## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Максимальный размер всех поврежденных частей, если больше - запрещает автоматическое удаление.

Допустимые значения:
- Любое положительное целое число.
## max_uncompressed_bytes_in_patches {#max_uncompressed_bytes_in_patches} 
<SettingsInfoBlock type="UInt64" default_value="32212254720" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32212254720"},{"label": "New setting"}]}]}/>

Максимальный размер не сжатых данных во всех частях патчей в байтах.
Если объем данных во всех частях патчей превышает это значение, легковесные обновления будут отклонены.
0 - без ограничений.
## merge_max_block_size {#merge_max_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="8192" />

Количество строк, которые читаются из объединенных частей в память.

Допустимые значения:
- Любое положительное целое число.

Объединение считывает строки из частей блоками по `merge_max_block_size` строк, затем объединяет и записывает результат в новую часть. Прочитанный блок помещается в ОЗУ,
поэтому `merge_max_block_size` влияет на размер ОЗУ, необходимого для объединения.
Таким образом, объединения могут потреблять большое количество ОЗУ для таблиц с очень широкими строками
(если средний размер строки составляет 100 Кб, то при объединении 10 частей,
(100 Кб * 10 * 8192) = ~ 8 Гб ОЗУ). Уменьшив `merge_max_block_size`,
вы можете уменьшить количество ОЗУ, необходимого для объединения, но замедлить само объединение.
## merge_max_block_size_bytes {#merge_max_block_size_bytes} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

Сколько байтов в блоках должно быть сформировано для операций объединения. По умолчанию
имеет то же значение, что и `index_granularity_bytes`.
## merge_max_bytes_to_prewarm_cache {#merge_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>

Доступно только в ClickHouse Cloud. Максимальный размер части (компактной или упакованной)
для предварительного разогрева кэша во время объединения.
## merge_selecting_sleep_ms {#merge_selecting_sleep_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />

Минимальное время ожидания перед повторной попыткой выбрать части для объединения после того, как не было выбрано частей. Более низкая настройка приведет к частому выбору задач в
background_schedule_pool, что приведет к большому количеству запросов
к zooKeeper в крупных кластерах.
## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor} 
<SettingsInfoBlock type="Float" default_value="1.2" />

Время ожидания для задачи выбора объединения умножается на этот коэффициент, когда
нет ничего для объединения, и делится, когда назначено объединение.
## merge_selector_algorithm {#merge_selector_algorithm} 

<ExperimentalBadge/>
<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

Алгоритм выбора частей для назначения объединений.
## merge_selector_base {#merge_selector_base} 
<SettingsInfoBlock type="Float" default_value="5" />

Влияет на увеличение записи назначенных объединений (настройка уровня эксперта, не изменяйте, если не понимаете, что она делает). Работает для простых и стохастических селекторов объединений.
## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Контролирует, когда логика вступает в силу относительно числа частей в
партиции. Чем больше фактор, тем более запоздалая реакция будет.
## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right} 
<SettingsInfoBlock type="Bool" default_value="1" />

Включить эвристику для выбора частей для объединения, которая удаляет части с правой
стороны диапазона, если их размер меньше указанного соотношения (0.01) от sum_size.
Работает для простых и стохастических селекторов объединений.
## merge_selector_window_size {#merge_selector_window_size} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

Сколько частей просматривать за раз.
## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache} 
<SettingsInfoBlock type="UInt64" default_value="16106127360" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>

Доступно только в ClickHouse Cloud. Максимальный размер частей в целом для предварительного разогрева
кэша во время объединения.
## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds} 
<SettingsInfoBlock type="UInt64" default_value="2592000" />
Устаревшая настройка, ничего не делает.
## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="1" />

Устанавливает интервал в секундах для ClickHouse для выполнения очистки старых
частей, WAL и мутаций.

Допустимые значения:
- Любое положительное целое число.
## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="60" />

Устанавливает интервал в секундах для ClickHouse для выполнения очистки старых
временных директорий.

Допустимые значения:
- Любое положительное целое число.
## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached} 
<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревшая настройка, ничего не делает.
## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

Минимальная задержка в секундах перед повторным объединением с рекомпрессией TTL.
## merge_with_ttl_timeout {#merge_with_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

Минимальная задержка в секундах перед повторным объединением с удалением TTL.
## merge_workload {#merge_workload} 

Используется для регулирования того, как ресурсы используются и распределяются между объединениями и
другими загрузками. Указанное значение используется как значение настройки `workload` для
фоновыми объединениями этой таблицы. Если не указано (пустая строка), то вместо этого используется
настройка сервера `merge_workload`.

**Смотрите также**
- [Планирование нагрузок](/operations/workload-scheduling.md)
## min_absolute_delay_to_close {#min_absolute_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальная абсолютная задержка перед закрытием, остановкой обслуживания запросов и не
возвращением Ok во время проверки статуса.
## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only} 
<SettingsInfoBlock type="Bool" default_value="0" />

Должна ли `min_age_to_force_merge_seconds` применяться только ко всей
партиции, а не к подмножеству.

По умолчанию игнорирует настройку `max_bytes_to_merge_at_max_space_in_pool` (см.
`enable_max_bytes_limit_for_min_age_to_force_merge`).

Допустимые значения:
- true, false
## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Объединять части, если каждая часть в диапазоне старше значения
`min_age_to_force_merge_seconds`.

По умолчанию игнорирует настройку `max_bytes_to_merge_at_max_space_in_pool`
(см. `enable_max_bytes_limit_for_min_age_to_force_merge`).

Допустимые значения:
- Положительное целое число.
## min_bytes_for_compact_part {#min_bytes_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревшая настройка, ничего не делает.
## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Доступно только в ClickHouse Cloud. Минимальный несжатый размер в байтах для
использования полного типа хранения для части данных вместо упакованного.
## min_bytes_for_wide_part {#min_bytes_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="10485760" />

Минимальное количество байтов/строк в части данных, которое можно хранить в формате `Wide`.
Вы можете установить одну, обе или ни одной из этих настроек.
## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Минимальный размер (несжатые байты), чтобы предварительно разогреть кэш меток и кэш первичного индекса для новых частей.
## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает минимальное количество байтов для включения балансировки при распределении новых больших
частей по дискам объемов [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures).

Допустимые значения:

- Положительное целое число.
- `0` — Балансировка отключена.

**Использование**

Значение настройки `min_bytes_to_rebalance_partition_over_jbod` не должно быть меньше значения
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)
/ 1024. В противном случае ClickHouse выдаст исключение.
## min_compress_block_size {#min_compress_block_size} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный размер блоков несжатых данных, требуемых для сжатия, при записи следующей метки. Вы также можете указать эту настройку в глобальных настройках
(см. [min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size)
настройку). Значение, указанное при создании таблицы, переопределяет глобальное значение для этой настройки.
## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество сжатых байтов для вызова fsync для части после выборки (0 - отключено).
## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество сжатых байтов для вызова fsync для части после объединения (0 - отключено).
## min_delay_to_insert_ms {#min_delay_to_insert_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

Минимальная задержка вставки данных в таблицу MergeTree в миллисекундах, если в одной партиции
много неслитых частей.
## min_delay_to_mutate_ms {#min_delay_to_mutate_ms} 
<SettingsInfoBlock type="UInt64" default_value="10" />

Минимальная задержка мутации таблицы MergeTree в миллисекундах, если много
незавершенных мутаций.
## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество байтов, которое должно быть свободным в дисковом пространстве для
вставки данных. Если количество доступных свободных байтов меньше
`min_free_disk_bytes_to_perform_insert`, тогда возникает исключение и
вставка не выполняется. Обратите внимание, что эта настройка:
- учитывает настройку `keep_free_space_bytes`.
- не учитывает объем данных, который будет записан в результате операции
`INSERT`.
- проверяется только в случае, если указано положительное (не нулевое) количество байтов.

Допустимые значения:
- Любое положительное целое число.

:::note
Если указаны как `min_free_disk_bytes_to_perform_insert`, так и `min_free_disk_ratio_to_perform_insert`,
ClickHouse будет опираться на значение, которое позволит выполнять
вставки при большем количестве свободной памяти.
:::
## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 
<SettingsInfoBlock type="Float" default_value="0" />

Минимальное соотношение свободного к общему дисковому пространству для выполнения `INSERT`. Должно быть 
числом с плавающей точкой между 0 и 1. Обратите внимание, что эта настройка:
- учитывает настройку `keep_free_space_bytes`.
- не учитывает объем данных, который будет записан в результате операции
`INSERT`.
- проверяется только в случае, если указано положительное (не нулевое) соотношение.

Допустимые значения:
- Число с плавающей точкой, 0.0 - 1.0.

Обратите внимание, что если указаны как `min_free_disk_ratio_to_perform_insert`, так и
`min_free_disk_bytes_to_perform_insert`, ClickHouse будет опираться на значение, которое позволит выполнять
вставки при большем количестве свободной памяти.
## min_index_granularity_bytes {#min_index_granularity_bytes} 
<SettingsInfoBlock type="UInt64" default_value="1024" />

Минимально допустимый размер гранул данных в байтах.

Чтобы обеспечить защиту от случайного создания таблиц с очень низким
`index_granularity_bytes`.
## min_marks_to_honor_max_concurrent_queries {#min_marks_to_honor_max_concurrent_queries} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество меток, прочитанных запросом для применения настройки [max_concurrent_queries](#max_concurrent_queries).

:::note
Запросы все равно будут ограничены другими настройками `max_concurrent_queries`.
:::

Допустимые значения:
- Положительное целое число.
- `0` — Отключено (`лимит max_concurrent_queries применяется к
всем запросам`).

**Пример**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```
## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

Минимальный объем данных для операции объединения, необходимый для использования прямого
доступа к диску хранения. При объединении частей данных ClickHouse вычисляет
общий объем хранения всех данных, которые нужно объединить. Если объем превышает
`min_merge_bytes_to_use_direct_io` байт, ClickHouse читает и записывает данные на дисковое хранилище
с использованием интерфейса прямого ввода-вывода (`O_DIRECT`).
Если `min_merge_bytes_to_use_direct_io = 0`, то прямой ввод-вывод отключен.
## min_parts_to_merge_at_once {#min_parts_to_merge_at_once} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество данных частей, которые селектор объединения может выбрать для объединения одновременно
(настройка уровня эксперта, не изменяйте, если не понимаете, что она делает).
0 - отключено. Работает для простых и стохастических селекторов объединений.
## min_relative_delay_to_close {#min_relative_delay_to_close} 
<SettingsInfoBlock type="UInt64" default_value="300" />

Минимальная задержка от других реплик для закрытия, остановки обслуживания
запросов и не возвращения Ok во время проверки статуса.
## min_relative_delay_to_measure {#min_relative_delay_to_measure} 
<SettingsInfoBlock type="UInt64" default_value="120" />

Расчет относительной задержки реплики только в том случае, если абсолютная задержка не меньше
этого значения.
## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership} 
<SettingsInfoBlock type="UInt64" default_value="120" />
Устаревшая настройка, ничего не делает.
## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="10" />

Сохранять примерно это количество последних записей в журнале ZooKeeper, даже если они являются
устаревшими. Это не влияет на работу таблиц: используется только для диагностики журнала ZooKeeper
перед очисткой.

Допустимые значения:
- Любое положительное целое число.
## min_rows_for_compact_part {#min_rows_for_compact_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревшая настройка, ничего не делает.
## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Доступно только в ClickHouse Cloud. Минимальное количество строк для использования полного типа
хранения для части данных вместо упакованного.
## min_rows_for_wide_part {#min_rows_for_wide_part} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество строк для создания части в широком формате вместо компактного.
## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество строк для вызова fsync для части после объединения (0 - отключено).
## mutation_workload {#mutation_workload} 

Используется для регулирования того, как ресурсы используются и распределяются между мутациями и
другими загрузками. Указанное значение используется как значение настройки `workload` для
фоновыми мутациями этой таблицы. Если не указано (пустая строка), то вместо этого используется
настройка сервера `mutation_workload`.

**Смотрите также**
- [Планирование нагрузок](/operations/workload-scheduling.md)
## non_replicated_deduplication_window {#non_replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Количество самых недавно вставленных блоков в непереплицированной
[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) таблице,
для которых хранятся контрольные суммы для проверки на дубликаты.

Допустимые значения:
- Любое положительное целое число.
- `0` (отключить дедупликацию).

Механизм дедупликации используется, аналогичный реплицированным таблицам (см.
настройку [replicated_deduplication_window](#replicated_deduplication_window)).
Контрольные суммы созданных частей записываются в локальный файл на диске.
## notify_newest_block_number {#notify_newest_block_number} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

Уведомить о новейшем номере блока SharedJoin или SharedSet. Только в ClickHouse Cloud.
## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation} 
<SettingsInfoBlock type="UInt64" default_value="20" />

Когда в пуле меньше указанного количества свободных записей, не выполнять мутации частей. Это необходимо, чтобы оставить свободные потоки для обычных объединений,
и избежать ошибок "Слишком много частей".

Допустимые значения:
- Любое положительное целое число.

**Использование**

Значение настройки `number_of_free_entries_in_pool_to_execute_mutation`
должно быть меньше значения
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)
* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio).
В противном случае ClickHouse выдаст исключение.
## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition} 
<SettingsInfoBlock type="UInt64" default_value="25" />

Когда в пуле меньше указанного количества свободных записей, не выполнять оптимизацию всей партиции в фоновом режиме (эта задача генерируется,
когда установлено `min_age_to_force_merge_seconds` и включен
`min_age_to_force_merge_on_partition_only`). Это необходимо, чтобы оставить свободные потоки
для обычных объединений и избежать "Слишком много частей".

Допустимые значения:
- Положительное целое число.

Значение настройки `number_of_free_entries_in_pool_to_execute_optimize_entire_partition`
должно быть меньше значения
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)
* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio).
В противном случае ClickHouse выдаст исключение.
## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge} 
<SettingsInfoBlock type="UInt64" default_value="8" />

Когда в пуле меньше указанного количества свободных записей 
(или в реплицированной очереди), начните уменьшать максимальный размер объединения для обработки
(или для постановки в очередь).
Это нужно для того, чтобы позволить обрабатывать небольшие объединения - не заполняя пул длительными
объединениями.

Допустимые значения:
- Любое положительное целое число.
## number_of_mutations_to_delay {#number_of_mutations_to_delay} 
<SettingsInfoBlock type="UInt64" default_value="500" />
Если у таблицы есть хотя бы
столько неоконченных мутаций, искусственно замедлить мутации таблицы.
Отключено, если установлено на 0.
## number_of_mutations_to_throw {#number_of_mutations_to_throw} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

Если у таблицы есть хотя бы столько неоконченных мутаций, выбросить исключение 'Слишком много мутаций'.
Отключено, если установлено на 0.
## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

Доступно только в ClickHouse Cloud. Данное количество партиций, которые мы будем
рассматривать для объединения. Партиции выбираются случайным образом с весом, где вес
- это количество частей данных, которые могут быть объединены в этой партиции.
## object_serialization_version {#object_serialization_version} 
<SettingsInfoBlock type="MergeTreeObjectSerializationVersion" default_value="v2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Add a setting to control JSON serialization versions"}]}]}/>

Версия сериализации для типа данных JSON. Требуется для совместимости.

Допустимые значения:
- `v1`
- `v2`
- `v3`

Только версия `v3` поддерживает изменение версии сериализации общей данных.
## object_shared_data_buckets_for_compact_part {#object_shared_data_buckets_for_compact_part} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "Add a setting to control number of buckets for shared data in JSON serialization in compact parts"}]}]}/>

Количество бакетов для сериализации общих данных JSON в компактных частях. Работает с `map_with_buckets` и `advanced` сериализациями общих данных.
## object_shared_data_buckets_for_wide_part {#object_shared_data_buckets_for_wide_part} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="32" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32"},{"label": "Add a setting to control number of buckets for shared data in JSON serialization in wide parts"}]}]}/>

Количество бакетов для сериализации общих данных JSON в широких частях. Работает с `map_with_buckets` и `advanced` сериализациями общих данных.
## object_shared_data_serialization_version {#object_shared_data_serialization_version} 
<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Add a setting to control JSON serialization versions"}]}]}/>

Версия сериализации для общих данных внутри типа данных JSON.

Допустимые значения:
- `map` - хранить общие данные как `Map(String, String)`
- `map_with_buckets` - хранить общие данные как несколько отдельных колонок `Map(String, String)`. Использование бакетов улучшает чтение отдельных путей из общих данных.
- `advanced` - специальная сериализация общих данных, предназначенная для значительного улучшения чтения отдельных путей из общих данных.
Обратите внимание, что эта сериализация увеличивает объем хранимых на диске общих данных, поскольку мы храним большое количество дополнительной информации.

Количество бакетов для сериализаций `map_with_buckets` и `advanced` определяется настройками
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part).
## object_shared_data_serialization_version_for_zero_level_parts {#object_shared_data_serialization_version_for_zero_level_parts} 
<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Add a setting to control JSON serialization versions  for zero level parts"}]}]}/>

Эта настройка позволяет указать другую версию сериализации общих данных внутри типа JSON для частей нулевого уровня, которые создаются в процессе вставок.
Рекомендуется не использовать сериализацию общих данных `advanced` для частей нулевого уровня, так как это может значительно увеличить
время вставки.
## old_parts_lifetime {#old_parts_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="480" />

Время (в секундах) хранения неактивных частей для защиты от потери данных
во время спонтанных перезапусков сервера.

Допустимые значения:
- Любое положительное целое число.

После объединения нескольких частей в новую часть, ClickHouse помечает оригинальные
части как неактивные и удаляет их только через `old_parts_lifetime` секунд.
Неактивные части удаляются, если они не используются текущими запросами, т.е. если
`refcount` части равен 1.

`fsync` не вызывается для новых частей, поэтому какое-то время новые
части существуют только в ОЗУ сервера (кэше ОС). Если сервер
внезапно перезапустится, новые части могут быть потеряны или повреждены. Чтобы защитить данные, неактивные части не удаляются
немедленно.

Во время старта ClickHouse проверяет целостность частей. Если объединенная
часть повреждена, ClickHouse возвращает неактивные части в активный список,
и позже снова объединяет их. Затем поврежденная часть переименовывается (добавляется префикс `broken_`)
и перемещается в папку `detached`. Если объединенная часть не повреждена, то оригинальные неактивные части переименовываются 
(добавляется префикс `ignored_`) и перемещаются в папку `detached`.

Значение по умолчанию `dirty_expire_centisecs` (настройка ядра Linux) составляет 30
секунд (максимальное время, в течение которого записанные данные хранятся только в ОЗУ), но при
высокой нагрузке на дисковую систему данные могут быть записаны намного позже. Экспериментально
выбрано значение 480 секунд для `old_parts_lifetime`, в течение которого новая
часть гарантированно будет записана на диск.
## optimize_row_order {#optimize_row_order} 
<SettingsInfoBlock type="Bool" default_value="0" />

Контролирует, следует ли оптимизировать порядок строк во время вставок для улучшения
сжимаемости вновь вставленной части таблицы.

Влияет только на обычные таблицы с использованием движка MergeTree. Ничто не делается для
специализированных таблиц с использованием движка MergeTree (например, CollapsingMergeTree).

Таблицы MergeTree (опционально) сжимаются с использованием [кодеков сжатия](/sql-reference/statements/create/table#column_compression_codec).
Универсальные кодеки сжатия, такие как LZ4 и ZSTD, достигают максимальных коэффициентов сжатия,
если данные подвержены закономерностям. Долгие прогоны одного и того же значения, как правило, хорошо
сжимают.

Если эта настройка включена, ClickHouse пытается хранить данные в вновь вставленных частях в порядке строк,
который минимизирует количество пробегов с одинаковыми значениями
по столбцам новой части таблицы.
Иными словами, небольшое количество пробегов с одинаковыми значениями означает, что индивидуальные пробеги
длинные и хорошо сжимаются.

Поиск оптимального порядка строк вычислительно невозможен (NP-сложный).
Поэтому ClickHouse использует эвристику для быстрого нахождения порядка строк, который
всё же улучшает коэффициенты сжатия по сравнению с оригинальным порядком строк.

<details markdown="1">

<summary>Эвристики для поиска порядка строк</summary>

В общем, можно свободно перемешивать строки таблицы (или части таблицы),
так как SQL считает одну и ту же таблицу (часть таблицы) с разным порядком строк
эквивалентной.

Эта свобода перемешивания строк ограничена, когда для таблицы определяется первичный ключ. В ClickHouse первичный ключ `C1, C2, ..., CN` обязывает 
сортировать строки таблицы по столбцам `C1`, `C2`, ... `Cn` ([кластерный индекс](https://en.wikipedia.org/wiki/Database_index#Clustered)).
В результате строки могут быть перемешаны только в пределах "классов эквивалентности" строк,
т.е. строк, которые имеют одинаковые значения в своих столбцах первичного ключа.
Интуиция заключается в том, что первичные ключи с высокой кардинальностью, например, первичные ключи,
содержащие столбец временной метки `DateTime64`, приводят к множеству маленьких классов эквивалентности. Соответственно, таблицы с первичным ключом с низкой кардинальностью создают мало и большие классы эквивалентности. Таблица без первичного ключа представляет собой крайний случай единственного
класса эквивалентности, охватывающего все строки.

Чем меньше и больше классы эквивалентности, тем выше степень свободы при повторном перемешивании строк.

Эвристики, применяемые для нахождения лучшего порядка строк в пределах каждого класса эквивалентности, предлагаются D. Lemire, O. Kaser в
[Переупорядочивание столбцов для меньших индексов](https://doi.org/10.1016/j.ins.2011.02.002)
и основаны на сортировке строк внутри каждого класса эквивалентности по возрастанию
кардинальности столбцов не первичного ключа.

Она выполняет три шага:
1. Найти все классы эквивалентности на основе значений строк в столбцах первичного ключа.
2. Для каждого класса эквивалентности оценить (обычно оценить) кардинальность
столбцов не первичного ключа.
3. Для каждого класса эквивалентности сортировать строки в порядке возрастания
кардинальности столбцов не первичного ключа.

</details>

Если включено, операции вставки несут дополнительные затраты на ЦП для анализа и
оптимизации порядка строк новых данных. Операции INSERT ожидается, что займут на 30-50%
дольше в зависимости от характеристик данных.
Коэффициенты сжатия LZ4 или ZSTD улучшаются в среднем на 20-40%.

Эта настройка работает лучше для таблиц без первичного ключа или с первичным ключом низкой кардинальности,
т.е. таблицы с небольшим количеством различных значений первичного ключа.
Высококардинальные первичные ключи, например, содержащие временные метки типа
`DateTime64`, не ожидается, что получат преимущества от этой настройки.
## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="30" />

Время ожидания перед/после перемещения частей между шардированными узлами.
## part_moves_between_shards_enable {#part_moves_between_shards_enable} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="0" />

Экспериментальная/недоконченная функция для перемещения частей между шардированными узлами. Не учитывает
выражения шардирования.
## parts_to_delay_insert {#parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="1000" />

Если количество активных частей в одной партиции превышает значение `parts_to_delay_insert`, вставка `INSERT` искусственно замедляется.

Возможные значения:
- Любое положительное целое число.

ClickHouse искусственно выполняет `INSERT` дольше (добавляет "сон"), чтобы фоновый процесс слияния мог объединять части быстрее, чем они добавляются.
## parts_to_throw_insert {#parts_to_throw_insert} 
<SettingsInfoBlock type="UInt64" default_value="3000" />

Если количество активных частей в одной партиции превышает значение `parts_to_throw_insert`, `INSERT` прерывается с исключением `Слишком много частей (N). Слияние выполняется значительно медленнее, чем вставка`.

Возможные значения:
- Любое положительное целое число.

Для достижения максимальной производительности запросов `SELECT` необходимо минимизировать количество обрабатываемых частей, см. [Merge Tree](/development/architecture#merge-tree).

До версии 23.6 это значение было установлено на 300. Вы можете задать другое более высокое значение, что уменьшит вероятность появления ошибки `Слишком много частей`, но одновременно производительность `SELECT` может ухудшиться. Также в случае проблемы со слиянием (например, из-за недостаточного места на диске) вы заметите её позже, чем это было бы с оригинальной цифрой 300.
## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold} 
<SettingsInfoBlock type="UInt64" default_value="10737418240" />

Если сумма размеров частей превышает этот порог, и время с момента создания записи в журнале репликации больше, чем `prefer_fetch_merged_part_time_threshold`, то предпочтение отдается извлечению объединенной части из реплики вместо выполнения слияния локально. Это необходимо для ускорения очень долгих слияний.

Возможные значения:
- Любое положительное целое число.
## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="3600" />

Если время, прошедшее с момента создания записи в журнале репликации (ClickHouse Keeper или ZooKeeper), превышает этот порог, и сумма размеров частей больше, чем `prefer_fetch_merged_part_size_threshold`, то предпочтение отдается извлечению объединенной части из реплики вместо выполнения слияния локально. Это необходимо для ускорения очень долгих слияний.

Возможные значения:
- Любое положительное целое число.
## prewarm_mark_cache {#prewarm_mark_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
Если установлено в true, кеш меток будет предварительно загружен, сохраняя метки в кеш меток при вставках, слияниях, извлечениях и при запуске сервера.
## prewarm_primary_key_cache {#prewarm_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Если установлено в true, кеш первичного индекса будет предварительно загружен, сохраняя метки в кеш меток при вставках, слияниях, извлечениях и при запуске сервера.
## primary_key_compress_block_size {#primary_key_compress_block_size} 
<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

Размер блока сжатия первичного ключа, фактический размер блока для сжатия.
## primary_key_compression_codec {#primary_key_compression_codec} 
<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

Кодек сжатия, используемый первичным ключом; первичный ключ достаточно мал и кешируется, поэтому по умолчанию используется ZSTD(3).
## primary_key_lazy_load {#primary_key_lazy_load} 
<SettingsInfoBlock type="Bool" default_value="1" />
Загружает первичный ключ в память при первом использовании, а не при инициализации таблицы. Это может сэкономить память при наличии большого количества таблиц.
## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns} 
<SettingsInfoBlock type="Float" default_value="0.9" />

Если значение колонки первичного ключа в части данных изменяется хотя бы в этом соотношении, пропустите загрузку следующих колонок в память. Это позволяет сэкономить память, не загружая ненужные колонки первичного ключа.
## ratio_of_defaults_for_sparse_serialization {#ratio_of_defaults_for_sparse_serialization} 
<SettingsInfoBlock type="Float" default_value="0.9375" />

Минимальное соотношение количества _умолчательных_ значений к количеству _всех_ значений в колонке. Установка этого значения приводит к тому, что колонка хранится с использованием разреженной сериализации.

Если колонка разреженная (содержит в основном нули), ClickHouse может закодировать её в разреженном формате и автоматически оптимизировать вычисления - данные не требуют полного декодирования во время запросов. Чтобы включить эту разреженную сериализацию, определите значение настройки `ratio_of_defaults_for_sparse_serialization` меньше 1.0. Если значение больше или равно 1.0, то колонки всегда будут записываться с использованием нормальной полной сериализации.

Возможные значения:

- Число с плавающей запятой между `0` и `1` для включения разреженной сериализации
- `1.0` (или больше), если вы не хотите использовать разреженную сериализацию

**Пример**

Обратите внимание, что колонка `s` в следующей таблице является пустой строкой для 95% строк. В `my_regular_table` мы не используем разреженную сериализацию, а в `my_sparse_table` мы установили `ratio_of_defaults_for_sparse_serialization` на 0.95:

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

Обратите внимание, что колонка `s` в `my_sparse_table` использует меньше места на диске:

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

Вы можете проверить, использует ли колонка разреженное кодирование, просмотрев колонку `serialization_kind` таблицы `system.parts_columns`:

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
<SettingsInfoBlock type="UInt64" default_value="5000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5000"},{"label": "Cloud sync"}]}]}/>

Доступно только в ClickHouse Cloud. Минимальное время ожидания перед повторной попыткой уменьшения блокирующих частей после того, как не было удаленных/замененных диапазонов. Более низкое значение приведет к частым вызовам задач в фоне, что приведет к большому количеству запросов к ZooKeeper в масштабных кластерах.
## refresh_parts_interval {#refresh_parts_interval} 
<SettingsInfoBlock type="Seconds" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "A new setting"}]}]}/>

Если оно больше нуля - обновить список частей данных из базовой файловой системы, чтобы проверить, были ли данные обновлены под капотом. Это можно установить только в том случае, если таблица находится на дисках только для чтения (что означает, что это реплика только для чтения, пока данные записываются другой репликой).
## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold} 
<SettingsInfoBlock type="Seconds" default_value="10800" />

Когда это значение превышает ноль, только одна реплика начинает слияние немедленно, если объединенная часть на общем хранилище.

:::note
Репликация без копий не готова к производству.
Репликация без копий по умолчанию отключена в ClickHouse версии 22.8 и выше.

Эта функция не рекомендуется для использования в производственной среде.
:::

Возможные значения:
- Любое положительное целое число.
## remote_fs_zero_copy_path_compatible_mode {#remote_fs_zero_copy_path_compatible_mode} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />

Запуск нулевой копии в совместимом режиме во время процесса преобразования.
## remote_fs_zero_copy_zookeeper_path {#remote_fs_zero_copy_zookeeper_path} 

<ExperimentalBadge/>
<SettingsInfoBlock type="String" default_value="/clickhouse/zero_copy" />

Путь ZooKeeper для нулевой копии, независимой от таблицы.
## remove_empty_parts {#remove_empty_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />

Удалить пустые части после того, как они были обрезаны по TTL, мутации или алгоритму слияния.
## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="1" />

Настройка для незавершенной экспериментальной функции.
## remove_unused_patch_parts {#remove_unused_patch_parts} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

Удалить в фоновом режиме части патчей, которые применяются ко всем активным частям.
## replace_long_file_name_to_hash {#replace_long_file_name_to_hash} 
<SettingsInfoBlock type="Bool" default_value="1" />

Если имя файла для колонки слишком длинное (более `max_file_name_length` байт), заменить его на SipHash128.
## replicated_can_become_leader {#replicated_can_become_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено в true, реплики реплицированных таблиц на этом узле попытаются получить лидерство.

Возможные значения:
- `true`
- `false`
## replicated_deduplication_window {#replicated_deduplication_window} 
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "10000"},{"label": "increase default value"}]}]}/>

Количество недавно вставленных блоков, для которых ClickHouse Keeper хранит хеш-суммы для проверки на дубликаты.

Возможные значения:
- Любое положительное целое число.
- 0 (отключить дедупликацию)

Команда `Insert` создает один или несколько блоков (частей). Для [дедупликации вставок](../../engines/table-engines/mergetree-family/replication.md), при записи в реплицированные таблицы, ClickHouse записывает хеш-суммы созданных частей в ClickHouse Keeper. Хеш-суммы хранятся только для самых последних блоков `replicated_deduplication_window`. Самые старые хеш-суммы удаляются из ClickHouse Keeper.

Большое количество для `replicated_deduplication_window` замедляет `Inserts`, так как нужно сравнивать больше записей. Хеш-сумма рассчитывается из состава названий и типов полей и данных вставленной части (поток байтов).
## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

Количество недавно асинхронно вставленных блоков, для которых ClickHouse Keeper хранит хеш-суммы для проверки на дубликаты.

Возможные значения:
- Любое положительное целое число.
- 0 (отключить дедупликацию для async_inserts)

Команда [Async Insert](/operations/settings/settings#async_insert) будет кэшироваться в одном или нескольких блоках (частях). Для [дедупликации вставок](/engines/table-engines/mergetree-family/replication), при записи в реплицированные таблицы, ClickHouse записывает хеш-суммы каждой вставки в ClickHouse Keeper. Хеш-суммы хранятся только для самых последних блоков `replicated_deduplication_window_for_async_inserts`. Самые старые хеш-суммы удаляются из ClickHouse Keeper. Большое количество `replicated_deduplication_window_for_async_inserts` замедляет `Async Inserts`, так как необходимо сравнивать больше записей. Хеш-сумма рассчитывается из состава названий и типов полей и данных вставки (поток байтов).
## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds} 
<SettingsInfoBlock type="UInt64" default_value="3600" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3600"},{"label": "decrease default value"}]}]}/>

Количество секунд, после которых хеш-суммы вставленных блоков удаляются из ClickHouse Keeper.

Возможные значения:
- Любое положительное целое число.

Похожим образом на [replicated_deduplication_window](#replicated_deduplication_window), `replicated_deduplication_window_seconds` указывает, как долго хранить хеш-суммы блоков для дедупликации вставок. Хеш-сумсы старше `replicated_deduplication_window_seconds` удаляются из ClickHouse Keeper, даже если они меньше `replicated_deduplication_window`.

Время относительно времени самой последней записи, а не по системному времени. Если это единственная запись, она будет храниться вечно.
## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts} 
<SettingsInfoBlock type="UInt64" default_value="604800" />

Количество секунд, после которых хеш-суммы асинхронных вставок удаляются из ClickHouse Keeper.

Возможные значения:
- Любое положительное целое число.

Аналогично [replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts), `replicated_deduplication_window_seconds_for_async_inserts` указывает, как долго хранить хеш-суммы блоков для дедупликации асинхронных вставок. Хеш-суммы старше `replicated_deduplication_window_seconds_for_async_inserts` удаляются из ClickHouse Keeper, даже если они меньше `replicated_deduplication_window_for_async_inserts`.

Время относительно времени самой последней записи, а не по системному времени. Если это единственная запись, она будет храниться вечно.
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
Устаревшая настройка, ничего не делает.
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
Устаревшая настройка, ничего не делает.
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 
<SettingsInfoBlock type="Seconds" default_value="0" />
Устаревшая настройка, ничего не делает.
## replicated_max_mutations_in_one_entry {#replicated_max_mutations_in_one_entry} 
<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество команд мутации, которые могут быть объединены и выполнены в одной записи MUTATE_PART (0 означает неограниченно).
## replicated_max_parallel_fetches {#replicated_max_parallel_fetches} 
<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревшая настройка, ничего не делает.
## replicated_max_parallel_fetches_for_host {#replicated_max_parallel_fetches_for_host} 
<SettingsInfoBlock type="UInt64" default_value="15" />
Устаревшая настройка, ничего не делает.
## replicated_max_parallel_fetches_for_table {#replicated_max_parallel_fetches_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревшая настройка, ничего не делает.
## replicated_max_parallel_sends {#replicated_max_parallel_sends} 
<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревшая настройка, ничего не делает.
## replicated_max_parallel_sends_for_table {#replicated_max_parallel_sends_for_table} 
<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревшая настройка, ничего не делает.
## replicated_max_ratio_of_wrong_parts {#replicated_max_ratio_of_wrong_parts} 
<SettingsInfoBlock type="Float" default_value="0.5" />

Если соотношение неправильных частей к общему количеству частей меньше этого - разрешить запуск.

Возможные значения:
- Число с плавающей запятой от 0.0 до 1.0.
## search_orphaned_parts_disks {#search_orphaned_parts_disks} 
<SettingsInfoBlock type="SearchOrphanedPartsDisks" default_value="any" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "any"},{"label": "New setting"}]}]}/>

ClickHouse сканирует все диски на наличие сиротских частей при любом ATTACH или CREATE таблицы, чтобы не пропустить части данных на неопределенных (не включенных в политику) дисках. Сиротские части возникают из-за потенциально небезопасной переконфигурации хранилища, например, если диск был исключен из политики хранения. Эта настройка ограничивает объем дисков для поиска по признакам дисков.

Возможные значения:
- any - объем не ограничен.
- local - объем ограничен локальными дисками.
- none - пустой объем, не искать.
## serialization_info_version {#serialization_info_version} 
<SettingsInfoBlock type="MergeTreeSerializationInfoVersion" default_value="default" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "default"},{"label": "New setting"}]}]}/>

Версия информации сериализации, используемая при записи `serialization.json`.
Эта настройка необходима для совместимости при обновлении кластера.

Возможные значения:
- `DEFAULT`

- `WITH_TYPES`
Запишите новый формат с полем `types_serialization_versions`, позволяющим задавать версии сериализации для каждого типа. Это делает настройки, такие как `string_serialization_version`, эффективными.

Во время обновлений с перерывом установки установите это значение на `DEFAULT`, чтобы новые сервера создавали части данных, совместимые со старыми серверами. После завершения обновления переключитесь на `WITH_TYPES`, чтобы включить версии сериализации для каждого типа.
## shared_merge_tree_activate_coordinated_merges_tasks {#shared_merge_tree_activate_coordinated_merges_tasks} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-2","items": [{"label": "25.8"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-3","items": [{"label": "25.7"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-4","items": [{"label": "25.6"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-5","items": [{"label": "25.10"},{"label": "0"},{"label": "New settings"}]}]}/>

Активирует повторное планирование задач координированных слияний. Это может быть полезно, даже когда `shared_merge_tree_enable_coordinated_merges=0`, поскольку это заполняет статистику координирующего слияния и помогает с холодным стартом.
## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

Включает создание узлов /metadata и /columns на каждую реплику в ZooKeeper. Доступно только в ClickHouse Cloud.
## shared_merge_tree_disable_merges_and_mutations_assignment {#shared_merge_tree_disable_merges_and_mutations_assignment} 
<SettingsInfoBlock type="Bool" default_value="0" />

Остановка назначения слияний для общего дерева слияния. Доступно только в ClickHouse Cloud.
## shared_merge_tree_empty_partition_lifetime {#shared_merge_tree_empty_partition_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="86400" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "86400"},{"label": "New setting"}]}]}/>

Сколько секунд партиция будет храниться в Keeper, если у нее нет частей.
## shared_merge_tree_enable_automatic_empty_partitions_cleanup {#shared_merge_tree_enable_automatic_empty_partitions_cleanup} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

Включено удаление записей Keeper пустой партиции.
## shared_merge_tree_enable_coordinated_merges {#shared_merge_tree_enable_coordinated_merges} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает стратегию координированных слияний.
## shared_merge_tree_enable_keeper_parts_extra_data {#shared_merge_tree_enable_keeper_parts_extra_data} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает запись атрибутов в виртуальные части и фиксацию блоков в Keeper.
## shared_merge_tree_enable_outdated_parts_check {#shared_merge_tree_enable_outdated_parts_check} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

Включить проверку устаревших частей. Доступно только в ClickHouse Cloud.
## shared_merge_tree_idle_parts_update_seconds {#shared_merge_tree_idle_parts_update_seconds} 
<SettingsInfoBlock type="UInt64" default_value="3600" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud sync"}]}]}/>

Интервал в секундах для обновления частей без триггера от наблюдения ZooKeeper в общем дереве слияний. Доступно только в ClickHouse Cloud.
## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="50" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "New setting"}]}]}/>

Начальный резерв для обновления частей. Доступно только в ClickHouse Cloud.
## shared_merge_tree_interserver_http_connection_timeout_ms {#shared_merge_tree_interserver_http_connection_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "New setting"}]}]}/>

Таймауты для межсерверного HTTP-соединения. Доступно только в ClickHouse Cloud.
## shared_merge_tree_interserver_http_timeout_ms {#shared_merge_tree_interserver_http_timeout_ms} 
<SettingsInfoBlock type="UInt64" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>

Таймауты для межсерверной HTTP-коммуникации. Доступно только в ClickHouse Cloud.
## shared_merge_tree_leader_update_period_random_add_seconds {#shared_merge_tree_leader_update_period_random_add_seconds} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

Добавляет равномерно распределенное значение от 0 до x секунд к `shared_merge_tree_leader_update_period`, чтобы избежать эффекта "громадного стада". Доступно только в ClickHouse Cloud.
## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds} 
<SettingsInfoBlock type="UInt64" default_value="30" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>

Максимальный период для повторной проверки лидерства при обновлении частей. Доступно только в ClickHouse Cloud.
## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once} 
<SettingsInfoBlock type="UInt64" default_value="1000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>

Максимальное количество устаревших частей, которые лидер попытается подтвердить на удаление за один HTTP-запрос. Доступно только в ClickHouse Cloud.
## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms} 
<SettingsInfoBlock type="UInt64" default_value="5000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "New setting"}]}]}/>

Максимальный резерв для обновления частей. Доступно только в ClickHouse Cloud.
## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total} 
<SettingsInfoBlock type="UInt64" default_value="6" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>

Максимальное количество лидеров обновления частей. Доступно только в ClickHouse Cloud.
## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az} 
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>

Максимальное количество лидеров обновления частей. Доступно только в ClickHouse Cloud.
## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

Максимум реплик, которые будут участвовать в удалении частей (убийственный поток). Доступно только в ClickHouse Cloud.
## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range} 
<SettingsInfoBlock type="UInt64" default_value="5" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>

Максимум реплик, которые попытаются назначить потенциально конфликтующие слияния (разрешают избежать избыточных конфликтов в назначении слияний). 0 означает отключено. Доступно только в ClickHouse Cloud.
## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Max broken parts for SMT, if more - deny automatic detach"}]}]}/>

Максимум поврежденных частей для SMT, если больше - запрещается автоматическое отсоединение.
## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Max size of all broken parts for SMT, if more - deny automatic detach"}]}]}/>

Максимальный размер всех поврежденных частей для SMT, если больше - запрещается автоматическое отсоединение.
## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds} 
<SettingsInfoBlock type="Int64" default_value="1800" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>

Как долго мы храним идентификаторы мемоизации вставок, чтобы избежать неверных действий во время повторных попыток вставки. Доступно только в ClickHouse Cloud.
## shared_merge_tree_merge_coordinator_election_check_period_ms {#shared_merge_tree_merge_coordinator_election_check_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="30000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>

Время между запусками потока выборов координирующего слияния.
## shared_merge_tree_merge_coordinator_factor {#shared_merge_tree_merge_coordinator_factor} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Float" default_value="1.1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1.100000023841858"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "1.100000023841858"},{"label": "Lower coordinator sleep time after load"}]}]}/>

Фактор времени для задержки потока координирующего слияния.
## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms {#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

Как часто координационный слияний должен синхронизироваться с ZooKeeper, чтобы получить свежую метаданных.
## shared_merge_tree_merge_coordinator_max_merge_request_size {#shared_merge_tree_merge_coordinator_max_merge_request_size} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="20" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>

Количество слияний, которые координирующий может запросить от MergerMutator за один раз.
## shared_merge_tree_merge_coordinator_max_period_ms {#shared_merge_tree_merge_coordinator_max_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

Максимальное время между запусками потока координации слияний.
## shared_merge_tree_merge_coordinator_merges_prepare_count {#shared_merge_tree_merge_coordinator_merges_prepare_count} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

Количество записей слияния, которые координирующий должен подготовить и распределить среди работников.
## shared_merge_tree_merge_coordinator_min_period_ms {#shared_merge_tree_merge_coordinator_min_period_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

Минимальное время между запусками потока координации слияний.
## shared_merge_tree_merge_worker_fast_timeout_ms {#shared_merge_tree_merge_worker_fast_timeout_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="100" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

Таймаут, который поток рабочего слияния использует, если необходимо обновить своё состояние после немедленного действия.
## shared_merge_tree_merge_worker_regular_timeout_ms {#shared_merge_tree_merge_worker_regular_timeout_ms} 

<ExperimentalBadge/>
<SettingsInfoBlock type="Milliseconds" default_value="10000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

Время между запусками потока рабочего слияния.
## shared_merge_tree_outdated_parts_group_size {#shared_merge_tree_outdated_parts_group_size} 
<SettingsInfoBlock type="UInt64" default_value="2" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "2"},{"label": "New setting"}]}]}/>

Сколько реплик будет в одной группе хеширования для очистки устаревших частей. Доступно только в ClickHouse Cloud.
## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations} 
<SettingsInfoBlock type="Float" default_value="0.5" />

Перезагрузит предикат слияния в задаче выбора слияния/мутации, когда соотношение `<кандидатные партиции для мутаций только (партиции, которые не могут быть объединены)>/<кандидатные партиции для мутаций>` будет выше установленного значения. Доступно только в ClickHouse Cloud.
## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size} 
<SettingsInfoBlock type="UInt64" default_value="32" />

Количество заданий по загрузке метаданных частей для планирования за раз. Доступно только в ClickHouse Cloud.
## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

Время, чтобы удерживать локально объединенную часть без запуска нового слияния с этой частью. Даёт другим репликам шанс извлечь часть и начать это слияние. Доступно только в ClickHouse Cloud.
## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold} 
<SettingsInfoBlock type="UInt64" default_value="1000000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>

Минимальный размер части (в строках), чтобы отложить назначение следующего слияния сразу после её локального объединения. Доступно только в ClickHouse Cloud.
## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size} 
<SettingsInfoBlock type="UInt64" default_value="10" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

Время, чтобы удерживать локально объединенную часть без запуска нового слияния с этой частью. Даёт другим репликам шанс извлечь часть и начать это слияние. Доступно только в ClickHouse Cloud.
## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

Читать виртуальные части от лидера, когда это возможно. Доступно только в ClickHouse Cloud.
## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting to fetch parts data from other replicas"}]}]}/>

Если включено, все реплики пытаются извлечь данные части из памяти (такие как первичный ключ, информация о партиции и так далее) из других реплик, где они уже существуют.
## shared_merge_tree_update_replica_flags_delay_ms {#shared_merge_tree_update_replica_flags_delay_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="30000" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>

Как часто реплика будет пытаться обновить свои флаги в соответствии с фоновым графиком.
## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

Включает запросы к кешу подсказок FS из кеша в памяти на других репликах. Доступно только в ClickHouse Cloud.
## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "Enable outdated parts v3 by default"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

Использует компактный формат для устаревших частей: уменьшает нагрузку на Keeper, улучшает обработку устаревших частей. Доступно только в ClickHouse Cloud.
## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

Если включено, счетчик слишком большого количества частей будет зависеть от общих данных в Keeper, а не от состояния локальной реплики. Доступно только в ClickHouse Cloud.
## shared_merge_tree_virtual_parts_discovery_batch {#shared_merge_tree_virtual_parts_discovery_batch} 

<ExperimentalBadge/>
<SettingsInfoBlock type="UInt64" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

Сколько открытий партиций должны быть упакованы в пачку.
## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Если существует много устаревших частей, поток очистки попытается удалить до `simultaneous_parts_removal_limit` частей за одну итерацию. Установленное значение `simultaneous_parts_removal_limit` равное `0` означает без ограничений.
## sleep_before_commit_local_part_in_replicated_table_ms {#sleep_before_commit_local_part_in_replicated_table_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

Для тестирования. Не изменять.
## sleep_before_loading_outdated_parts_ms {#sleep_before_loading_outdated_parts_ms} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Для тестирования. Не изменять.
## storage_policy {#storage_policy} 
<SettingsInfoBlock type="String" default_value="default" />

Имя политики хранения диска.
## string_serialization_version {#string_serialization_version} 
<SettingsInfoBlock type="MergeTreeStringSerializationVersion" default_value="default" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "default"},{"label": "New setting"}]}]}/>

Контролирует формат сериализации для верхнего уровня `String` колонок.

Эта настройка имеет эффект только при установке `serialization_info_version` в "with_types".
Когда включено, верхний уровень `String` колонки сериализуются с отдельной подколонкой `.size`, хранящей длину строки, а не inline. Это позволяет использовать реальные подколонки `.size` и может улучшить эффективность сжатия.

Вложенные типы `String` (например, внутри `Nullable`, `LowCardinality`, `Array` или `Map`) не затрагиваются, за исключением случаев, когда они появляются в `Tuple`.

Возможные значения:

- `DEFAULT` — Использовать стандартный формат сериализации с инлайн-размерами.
- `WITH_SIZE_STREAM` — Использовать отдельный размерный поток для верхнего уровня `String` колонок.
## table_disk {#table_disk} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

Это дисковая таблица, путь/конечная точка должны указывать на данные таблицы, а не на данные базы данных. Может быть установлен только для s3_plain/s3_plain_rewritable/web.
## temporary_directories_lifetime {#temporary_directories_lifetime} 
<SettingsInfoBlock type="Seconds" default_value="86400" />

Сколько секунд хранить временные директории. Не следует снижать это значение, так как слияния и мутации могут не работать при низком значении этой настройки.
## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout} 
<SettingsInfoBlock type="Seconds" default_value="7200" />

Таймаут (в секундах) перед началом слияния с рекомпрессией. В это время ClickHouse пытается получить рекомпрессированную часть из реплики, которая назначила это слияние с рекомпрессией.

Рекомпрессия обычно происходит медленно, поэтому мы не начинаем слияние с рекомпрессией до истечения этого таймаута и пытаемся получить рекомпрессированную часть из реплики, которая назначила это слияние с рекомпрессией.

Возможные значения:
- Любое положительное целое число.
## ttl_only_drop_parts {#ttl_only_drop_parts} 
<SettingsInfoBlock type="Bool" default_value="0" />

Контролирует, полностью ли удаляются части данных в таблицах MergeTree, когда все строки в этой части истекли в соответствии с их настройками `TTL`.

Когда `ttl_only_drop_parts` отключен (по умолчанию), удаляются только строки, которые истекли на основе их настроек TTL.

Когда `ttl_only_drop_parts` включен, вся часть удаляется, если все строки в этой части истекли в соответствии с их настройками `TTL`.
## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns} 
<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает использовать адаптивные буферы записи при записи динамических подколонок, чтобы уменьшить использование памяти.
## use_async_block_ids_cache {#use_async_block_ids_cache} 
<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено в true, мы кэшируем хеш-суммы асинхронных вставок.

Возможные значения:
- `true`
- `false`

Блок, содержащий несколько асинхронных вставок, будет генерировать несколько хеш-сумм. Когда некоторые из вставок дублируются, Keeper вернет лишь одну дублированную хеш-сумму в одном RPC, что вызовет ненужные повторные попытки RPC. Этот кэш будет следить за путём хеш-сумм в Keeper. Если обновления отслеживаются в Keeper, кэш будет обновлен как можно скорее, чтобы мы могли фильтровать дублированные вставки в памяти.
## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization} 
<SettingsInfoBlock type="Bool" default_value="1" />

Включает компактный режим для двоичной сериализации дискриминаторов в типе Variant. Этот режим позволяет значительно сократить использование памяти для хранения дискриминаторов в частях, когда в них в основном один вариант или много NULL-значений.
## use_const_adaptive_granularity {#use_const_adaptive_granularity} 
<SettingsInfoBlock type="Bool" default_value="0" />

Всегда использовать постоянную гранулярность для всей части. Это позволяет сжимать в памяти значения гранулярности индекса. Это может быть полезно в чрезвычайно больших нагрузках с тонкими таблицами.
## use_metadata_cache {#use_metadata_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
Устаревшая настройка, ничего не делает.
## use_minimalistic_checksums_in_zookeeper {#use_minimalistic_checksums_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

Использовать маленький формат (десятки байт) для контрольных сумм частей в ZooKeeper вместо обычных (десятки КБ). Перед включением проверьте, что все реплики поддерживают новый формат.
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

Метод хранения заголовков частей данных в ZooKeeper. Если включено, ZooKeeper
хранит меньше данных. Для получения подробной информации смотрите [здесь](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper).
## use_primary_key_cache {#use_primary_key_cache} 
<SettingsInfoBlock type="Bool" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Использовать кэш для первичного индекса
вместо сохранения всех индексов в памяти. Может быть полезно для очень больших таблиц.
## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный (приблизительный) несжатый размер в байтах при слиянии частей для активации
Алгоритма вертикального слияния.
## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="11" />

Минимальное количество не-ПК колонок для активации Алгоритма вертикального слияния.
## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate} 
<SettingsInfoBlock type="UInt64" default_value="131072" />

Минимальная (приблизительная) сумма строк в
сливающихся частях для активации Алгоритма вертикального слияния.
## vertical_merge_optimize_lightweight_delete {#vertical_merge_optimize_lightweight_delete} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

Если true, легковесное удаление оптимизируется при вертикальном слиянии.
## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch} 
<SettingsInfoBlock type="Bool" default_value="1" />

Если true, используется предзагрузка данных из удаленной файловой системы для следующей
колонки во время слияния.
## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms} 
<SettingsInfoBlock type="Milliseconds" default_value="0" />

Перед выключением таблица будет ожидать необходимое количество времени, чтобы уникальные части
(существующие только на текущей реплике) были получены другими репликами (0 означает
отключено).
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
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Enable writing marks for substreams in compact parts by default"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает запись меток для каждого подпотока вместо каждой колонки в компактных частях.
Это позволяет эффективно читать отдельные подколонки из части данных.

Например, колонка `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` сериализуется в следующих подпотоках:
- `t.a` для данных String элемента кортежа `a`
- `t.b` для данных UInt32 элемента кортежа `b`
- `t.c.size0` для размеров массива элемента кортежа `c`
- `t.c.null` для карты null элементов вложенного массива элемента кортежа `c`
- `t.c` для данных UInt32 вложенных элементов массива элемента кортежа `c`

Когда эта настройка включена, мы будем записывать метку для каждого из этих 5 подпотоков, что означает, что мы сможем читать
данные каждого конкретного подпотока из гранулы отдельно, если это необходимо. Например, если мы хотим прочитать подколонку `t.c`, мы будем читать только данные из
подпотоков `t.c.size0`, `t.c.null` и `t.c` и не будем читать данные из подпотоков `t.a` и `t.b`. Когда эта настройка отключена,
мы будем записывать метку только для верхнеуровневой колонки `t`, что означает, что мы всегда будем читать все данные колонки из гранулы, даже если нам нужны только данные некоторых подпотоков.
## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio} 
<SettingsInfoBlock type="Float" default_value="0.05" />

Максимальный процент верхнеуровневых частей, для которых задерживается удаление, чтобы получить
меньшие независимые диапазоны. Рекомендуется не изменять.
## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times} 
<SettingsInfoBlock type="UInt64" default_value="5" />

Максимальная глубина рекурсии для разбиения независимых диапазонов устаревших частей на
меньшие поддиапазоны. Рекомендуется не изменять.
## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Если включена репликация без копий, случайные временные промежутки перед попыткой
заблокировать в зависимости от размера частей для слияния или мутации.
## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock} 
<SettingsInfoBlock type="UInt64" default_value="0" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

Если включена репликация без копий, случайное время ожидания до 500 мс
перед попыткой заблокировать для слияния или мутации.
## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period} 
<SettingsInfoBlock type="Seconds" default_value="60" />

Период проверки истечения сессии ZooKeeper в секундах.

Возможные значения:
- Любое положительное целое число.