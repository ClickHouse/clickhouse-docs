---
description: 'Настройки для MergeTree, которые заданы в `system.merge_tree_settings`'
slug: /operations/settings/merge-tree-settings
title: 'Настройки таблиц MergeTree'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

Системная таблица `system.merge_tree_settings` показывает глобально установленные настройки MergeTree.

Настройки MergeTree могут быть заданы в секции `merge_tree` файла конфигурации сервера или указаны отдельно для каждой таблицы `MergeTree` в
секции `SETTINGS` оператора `CREATE TABLE`.

Пример настройки параметра `max_suspicious_broken_parts`:

Задайте значение по умолчанию для всех таблиц `MergeTree` в конфигурационном файле сервера:

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

Задаётся для конкретной таблицы:

```sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

Измените настройки конкретной таблицы с помощью `ALTER TABLE ... MODIFY SETTING`:

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- reset to global default (value from system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```


## Настройки MergeTree \{#mergetree-settings\}

{/* Следующие настройки автоматически сгенерированы скриптом
  https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
  */ }


## adaptive_write_buffer_initial_size \{#adaptive_write_buffer_initial_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16384" />

Начальный размер адаптивного буфера записи

## add_implicit_sign_column_constraint_for_collapsing_engine \{#add_implicit_sign_column_constraint_for_collapsing_engine\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение параметра равно `true`, добавляет неявное ограничение для столбца `sign` таблицы CollapsingMergeTree
или VersionedCollapsingMergeTree, чтобы разрешать только корректные значения (`1` и `-1`).

## add_minmax_index_for_numeric_columns \{#add_minmax_index_for_numeric_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting"}]}]}/>

Если параметр включен, для всех числовых столбцов таблицы добавляются минимально-максимальные пропускающие индексы.

## add_minmax_index_for_string_columns \{#add_minmax_index_for_string_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

При включении для всех строковых столбцов таблицы добавляются пропускающие индексы min-max.

## allow_coalescing_columns_in_partition_or_order_key \{#allow_coalescing_columns_in_partition_or_order_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Новая настройка, позволяющая использовать столбцы coalescing в ключе партиционирования или сортировки."}]}]}/>

При включении позволяет использовать столбцы coalescing в таблице CoalescingMergeTree в ключе партиционирования или сортировки.

## allow_experimental_replacing_merge_with_cleanup \{#allow_experimental_replacing_merge_with_cleanup\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает экспериментальные слияния CLEANUP для ReplacingMergeTree со
столбцом `is_deleted`. Когда настройка включена, можно использовать
`OPTIMIZE ... FINAL CLEANUP` для ручного слияния всех частей в партиции
в одну часть и удаления всех помеченных как удалённые строк.

Также позволяет включить автоматическое выполнение таких слияний в фоновом
режиме с помощью настроек `min_age_to_force_merge_seconds`,
`min_age_to_force_merge_on_partition_only` и
`enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`.

## allow_experimental_reverse_key \{#allow_experimental_reverse_key\}

<ExperimentalBadge />

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]} />

Включает поддержку сортировки в порядке убывания в ключах сортировки MergeTree. Этот параметр особенно полезен для анализа временных рядов и Top-N‑запросов, позволяя хранить данные в обратном хронологическом порядке для оптимизации производительности запросов.

При включённом `allow_experimental_reverse_key` вы можете задавать сортировку по убыванию в секции `ORDER BY` таблицы MergeTree. Это позволяет использовать более эффективные оптимизации `ReadInOrder` вместо `ReadInReverseOrder` для запросов с сортировкой по убыванию.

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

Если в запросе используется `ORDER BY time DESC`, применяется `ReadInOrder`.

**Значение по умолчанию:** false


## allow_floating_point_partition_key \{#allow_floating_point_partition_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использование числа с плавающей запятой в качестве ключа партиции.

Возможные значения:

- `0` — Ключ партиции с плавающей запятой не допускается.
- `1` — Ключ партиции с плавающей запятой допускается.

## allow_nullable_key \{#allow_nullable_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использовать типы Nullable в качестве первичных ключей.

## allow_part_offset_column_in_projections \{#allow_part_offset_column_in_projections\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Теперь проекции могут использовать столбец _part_offset."}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "Новая настройка, которая защищает от создания проекций со столбцом смещения родительской партиции до его стабилизации."}]}]}/>

Разрешает использование столбца `_part_offset` в запросах SELECT для проекций.

## allow_reduce_blocking_parts_task \{#allow_reduce_blocking_parts_task\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Теперь SMT по умолчанию будет удалять устаревшие блокирующие части из ZooKeeper"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Синхронизация с Cloud"}]}]}/>

Фоновая задача, которая сокращает число блокирующих частей для таблиц SharedMergeTree.
Только в ClickHouse Cloud.

## allow_remote_fs_zero_copy_replication \{#allow_remote_fs_zero_copy_replication\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Не используйте эту настройку в промышленной эксплуатации, потому что она ещё не готова.

## allow_summing_columns_in_partition_or_order_key \{#allow_summing_columns_in_partition_or_order_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "Новая настройка, разрешающая использовать суммируемые столбцы в ключе партиционирования или сортировки"}]}]}/>

При включении параметра позволяет использовать суммируемые столбцы в таблице SummingMergeTree в качестве ключа партиционирования или сортировки.

## allow_suspicious_indices \{#allow_suspicious_indices\}

<SettingsInfoBlock type="Bool" default_value="0" />

Отклоняет первичные и вторичные индексы и ключи сортировки с одинаковыми выражениями

## allow_vertical_merges_from_compact_to_wide_parts \{#allow_vertical_merges_from_compact_to_wide_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает вертикальные слияния из компактных частей в широкие части. Эта настройка должна иметь одинаковое значение на всех репликах.

## alter_column_secondary_index_mode \{#alter_column_secondary_index_mode\}

<SettingsInfoBlock type="AlterColumnSecondaryIndexMode" default_value="rebuild" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "rebuild"},{"label": "Изменение поведения, чтобы разрешить выполнение ALTER `column` для столбцов с зависимыми вторичными индексами"}]}]}/>

Определяет, разрешать ли команды `ALTER`, которые изменяют столбцы, покрытые вторичными индексами, и какие действия предпринимать в таком случае. По умолчанию такие команды `ALTER` разрешены, и индексы перестраиваются.

Возможные значения:

- `rebuild` (по умолчанию): Перестраивает все вторичные индексы, затронутые столбцом в команде `ALTER`.
- `throw`: Запрещает выполнение любых команд `ALTER` для столбцов, покрытых **явными** вторичными индексами, выбрасывая исключение. Неявные индексы не подпадают под это ограничение и будут перестроены.
- `drop`: Удаляет зависимые вторичные индексы. Новые части не будут содержать индексы, потребуется выполнение `MATERIALIZE INDEX` для их воссоздания.
- `compatibility`: Соответствует исходному поведению: `throw` для `ALTER ... MODIFY COLUMN` и `rebuild` для `ALTER ... UPDATE/DELETE`.
- `ignore`: Предназначено для опытных пользователей. Оставляет индексы в несогласованном состоянии, что может приводить к некорректным результатам запросов.

## always_fetch_merged_part \{#always_fetch_merged_part\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение `true`, эта реплика никогда не объединяет части и всегда загружает объединённые части
с других реплик.

Возможные значения:

- true, false

## always_use_copy_instead_of_hardlinks \{#always_use_copy_instead_of_hardlinks\}

<SettingsInfoBlock type="Bool" default_value="0" />

Всегда копировать данные вместо использования жёстких ссылок при выполнении мутаций, замен, отсоединений и т. п.

## apply_patches_on_merge \{#apply_patches_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

Если установлено значение `true`, части-патчи применяются при слияниях

## assign_part_uuids \{#assign_part_uuids\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если настройка включена, каждому новому парту будет присвоен уникальный идентификатор.
Перед включением убедитесь, что все реплики поддерживают UUID версии 4.

## async_block_ids_cache_update_wait_ms \{#async_block_ids_cache_update_wait_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="100" />

Время, в течение которого каждая итерация вставки ожидает обновления async_block_ids_cache

## async_insert \{#async_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение true, данные из запроса INSERT помещаются в очередь и затем в фоновом режиме записываются в таблицу.

## auto_statistics_types \{#auto_statistics_types\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "Новая настройка"}]}]}/>

Список типов STATISTICS, разделённых запятыми, которые автоматически вычисляются для всех подходящих столбцов.
Поддерживаемые типы STATISTICS: tdigest, countmin, minmax, uniq.

## background_task_preferred_step_execution_time_ms \{#background_task_preferred_step_execution_time_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="50" />

Целевое время выполнения одного шага операции слияния или мутации. Может быть превышено, если один шаг занимает больше времени.

## cache_populated_by_fetch \{#cache_populated_by_fetch\}

<SettingsInfoBlock type="Bool" default_value="0" />

:::note
Этот параметр применяется только к ClickHouse Cloud.
:::

Когда `cache_populated_by_fetch` отключён (значение по умолчанию), новые
части загружаются в файловый кэш только при выполнении запроса, которому
требуются эти части.

Если параметр включён, `cache_populated_by_fetch` вместо этого заставит все узлы
загружать новые части данных из хранилища в их файловый кэш без необходимости
выполнения запроса для инициирования этого действия.

**См. также**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)

## cache_populated_by_fetch_filename_regexp \{#cache_populated_by_fetch_filename_regexp\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": ""},{"label": "Новая настройка"}]}]}/>

:::note
Эта настройка применяется только в ClickHouse Cloud.
:::

Если значение не пустое, только файлы, которые соответствуют этому регулярному выражению, будут предварительно загружены в кэш после операции fetch (если включен `cache_populated_by_fetch`).

## check_delay_period \{#check_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="60" />

Устаревший параметр, ничего не делает.

## check_sample_column_is_correct \{#check_sample_column_is_correct\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает проверку при создании таблицы, что тип данных столбца для сэмплирования или выражения сэмплирования корректен. Тип данных должен быть одним из беззнаковых [целочисленных типов](/sql-reference/data-types/int-uint): `UInt8`, `UInt16`, `UInt32`, `UInt64`.

Возможные значения:

- `true`  — Проверка включена.
- `false` — Проверка при создании таблицы отключена.

Значение по умолчанию: `true`.

По умолчанию сервер ClickHouse при создании таблицы проверяет тип данных столбца для сэмплирования или выражения сэмплирования. Если у вас уже есть таблицы с некорректным выражением сэмплирования и вы не хотите, чтобы сервер выбрасывал исключение при запуске, установите параметр `check_sample_column_is_correct` в значение `false`.

## clean_deleted_rows \{#clean_deleted_rows\}

<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />

Устаревший параметр, не оказывает никакого действия.

## cleanup_delay_period \{#cleanup_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="30" />

Минимальный интервал очистки старых журналов очереди, хэшей блоков и частей.

## cleanup_delay_period_random_add \{#cleanup_delay_period_random_add\}

<SettingsInfoBlock type="UInt64" default_value="10" />

Добавляет к `cleanup_delay_period` равномерно распределённое случайное значение от 0 до x секунд,
чтобы избежать эффекта «thundering herd» и последующей DoS-атаки на ZooKeeper в случае
очень большого числа таблиц.

## cleanup_thread_preferred_points_per_iteration \{#cleanup_thread_preferred_points_per_iteration\}

<SettingsInfoBlock type="UInt64" default_value="150" />

Предпочитаемый размер пакета для фоновой очистки (поинты — абстрактная единица, но 1 поинт
примерно соответствует одному вставленному блоку).

## cleanup_threads \{#cleanup_threads\}

<SettingsInfoBlock type="UInt64" default_value="128" />

Устаревший параметр, не имеет эффекта.

## Отложенный расчёт размеров столбцов и вторичных индексов \{#columns_and_secondary_indices_sizes_lazy_calculation\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Новая настройка для отложенного вычисления размеров столбцов и вторичных индексов"}]}]}/>

Вычислять размеры столбцов и вторичных индексов отложенно при первом запросе, а не при инициализации таблицы.

## columns_to_prewarm_mark_cache \{#columns_to_prewarm_mark_cache\}

Список столбцов, для которых нужно предварительно прогреть кэш меток (если он включен). Пустое значение означает все столбцы.

## compact_parts_max_bytes_to_buffer \{#compact_parts_max_bytes_to_buffer\}

<SettingsInfoBlock type="UInt64" default_value="134217728" />

Параметр доступен только в ClickHouse Cloud. Максимальное количество байт для записи в один страйп в компактных частях.

## compact_parts_max_granules_to_buffer \{#compact_parts_max_granules_to_buffer\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="128" />

Этот параметр доступен только в ClickHouse Cloud. Максимальное количество гранул, которые можно записать в один страйп в компактных частях.

## compact_parts_merge_max_bytes_to_prefetch_part \{#compact_parts_merge_max_bytes_to_prefetch_part\}

<SettingsInfoBlock type="UInt64" default_value="16777216" />

Настройка доступна только в ClickHouse Cloud. Максимальный размер компактной части, которую можно целиком прочитать в память при слиянии.

## compatibility_allow_sampling_expression_not_in_primary_key \{#compatibility_allow_sampling_expression_not_in_primary_key\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает создавать таблицу с выражением выборки, не входящим в первичный ключ. Это
необходимо только для временного запуска сервера с некорректными таблицами для
обеспечения обратной совместимости.

## compress_marks \{#compress_marks\}

<SettingsInfoBlock type="Bool" default_value="1" />

Метки поддерживают сжатие, что уменьшает размер файлов меток и ускоряет передачу данных по сети.

## compress_primary_key \{#compress_primary_key\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает сжатие первичного ключа, что уменьшает размер файла первичного ключа и ускоряет сетевую передачу.

## concurrent_part_removal_threshold \{#concurrent_part_removal_threshold\}

<SettingsInfoBlock type="UInt64" default_value="100" />

Параллельное удаление частей (см. `max_part_removal_threads`) активируется только в том случае, если
число неактивных частей данных не меньше этого значения.

## deduplicate_merge_projection_mode \{#deduplicate_merge_projection_mode\}

<SettingsInfoBlock type="DeduplicateMergeProjectionMode" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "throw"},{"label": "Do not allow to create inconsistent projection"}]}]}/>

Определяет, разрешено ли создавать проекцию для таблицы с неклассическим движком MergeTree,
то есть с вариантом, отличным от (Replicated, Shared) MergeTree. Опция `ignore` предназначена исключительно для
совместимости и может приводить к некорректным результатам. Если создание проекции разрешено,
эта настройка задаёт действие при слиянии проекций: либо `drop`, либо `rebuild`. Классический
MergeTree будет игнорировать этот параметр. Эта настройка также управляет `OPTIMIZE DEDUPLICATE`
и при этом оказывает влияние на все движки семейства MergeTree. Аналогично параметру
`lightweight_mutation_projection_mode`, применяется на уровне парта.

Возможные значения:

- `ignore`
- `throw`
- `drop`
- `rebuild`

## default_compression_codec \{#default_compression_codec\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": ""},{"label": "New setting"}]}]}/>

Определяет кодек сжатия по умолчанию, который будет использоваться, если для конкретного столбца в объявлении таблицы он не задан.
Порядок выбора кодека сжатия для столбца:

1. Кодек сжатия, определённый для столбца в объявлении таблицы
2. Кодек сжатия, определённый в `default_compression_codec` (эта настройка)
3. Кодек сжатия по умолчанию, определённый в настройках `compression`

Значение по умолчанию: пустая строка (не определено).

## detach_not_byte_identical_parts \{#detach_not_byte_identical_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает отсоединение части на реплике после слияния или
мутации, если она не является байтово идентичной частям на других репликах. Если
настройка отключена, часть удаляется. Активируйте эту настройку, если вы хотите
позднее проанализировать такие части.

Настройка применима к таблицам `MergeTree` с включённой
[репликацией данных](/engines/table-engines/mergetree-family/replacingmergetree).

Возможные значения:

- `0` — части удаляются.
- `1` — части отсоединяются.

## detach_old_local_parts_when_cloning_replica \{#detach_old_local_parts_when_cloning_replica\}

<SettingsInfoBlock type="Bool" default_value="1" />

Не удалять старые локальные части при восстановлении потерянной реплики.

Возможные значения:

- `true`
- `false`

## disable_detach_partition_for_zero_copy_replication \{#disable_detach_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

Отключает выполнение запроса DETACH PARTITION при zero copy репликации.

## disable_fetch_partition_for_zero_copy_replication \{#disable_fetch_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

Отключает запрос FETCH PARTITION для репликации без копирования данных.

## disable_freeze_partition_for_zero_copy_replication \{#disable_freeze_partition_for_zero_copy_replication\}

<SettingsInfoBlock type="Bool" default_value="1" />

Отключает выполнение запроса FREEZE PARTITION при репликации без копирования данных.

## disk \{#disk\}

Имя диска хранения данных. Может быть указано вместо политики хранения.

## dynamic_serialization_version \{#dynamic_serialization_version\}

<SettingsInfoBlock type="MergeTreeDynamicSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Добавлена настройка для управления версиями сериализации Dynamic"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "Включена по умолчанию версия сериализации v3 для Dynamic для более эффективной сериализации и десериализации"}]}]}/>

Версия сериализации для типа данных Dynamic. Используется для обеспечения совместимости.

Возможные значения:

- `v1`
- `v2`
- `v3`

## enable_block_number_column \{#enable_block_number_column\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает сохранение столбца _block_number для каждой строки.

## enable_block_offset_column \{#enable_block_offset_column\}

<SettingsInfoBlock type="Bool" default_value="0" />

Сохраняет виртуальный столбец `_block_number` во время слияний.

## enable_index_granularity_compression \{#enable_index_granularity_compression\}

<SettingsInfoBlock type="Bool" default_value="1" />

Сжимать в памяти значения гранулярности индекса, если это возможно

## enable_max_bytes_limit_for_min_age_to_force_merge \{#enable_max_bytes_limit_for_min_age_to_force_merge\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Добавлена новая настройка для ограничения максимального объёма данных (в байтах) для min_age_to_force_merge."}]}]}/>

Определяет, должны ли настройки `min_age_to_force_merge_seconds` и
`min_age_to_force_merge_on_partition_only` учитывать настройку
`max_bytes_to_merge_at_max_space_in_pool`.

Возможные значения:

- `true`
- `false`

## enable_mixed_granularity_parts \{#enable_mixed_granularity_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает переход на управление размером гранулы с помощью настройки
`index_granularity_bytes`. До версии 19.11 существовала только настройка
`index_granularity` для ограничения размера гранулы. Настройка
`index_granularity_bytes` улучшает производительность ClickHouse при
выборке данных из таблиц с большими строками (десятки и сотни мегабайт).
Если у вас есть таблицы с большими строками, вы можете включить эту настройку на уровне таблиц,
чтобы повысить эффективность запросов `SELECT`.

## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge \{#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "Новый параметр, позволяющий автоматически выполнять слияния CLEANUP для ReplacingMergeTree"}]}]}/>

Определяет, следует ли использовать слияния CLEANUP для ReplacingMergeTree при объединении партиций
в одну часть. Требует включенных `allow_experimental_replacing_merge_with_cleanup`,
`min_age_to_force_merge_seconds` и `min_age_to_force_merge_on_partition_only`.

Возможные значения:

- `true`
- `false`

## enable_the_endpoint_id_with_zookeeper_name_prefix \{#enable_the_endpoint_id_with_zookeeper_name_prefix\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает добавление префикса имени ZooKeeper к endpoint ID для реплицируемой таблицы семейства MergeTree.

## enable_vertical_merge_algorithm \{#enable_vertical_merge_algorithm\}

<SettingsInfoBlock type="UInt64" default_value="1" />

Включает использование вертикального алгоритма слияния.

## enforce_index_structure_match_on_partition_manipulation \{#enforce_index_structure_match_on_partition_manipulation\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Если эта настройка включена для таблицы-приёмника запроса, выполняющего операции с партициями
(`ATTACH/MOVE/REPLACE PARTITION`), индексы и проекции должны быть
идентичны между исходной и целевой таблицами. В противном случае таблица
назначения может иметь надмножество индексов и проекций исходной таблицы.

## escape_variant_subcolumn_filenames \{#escape_variant_subcolumn_filenames\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Экранирование специальных символов в именах файлов, создаваемых для подстолбцов типа Variant в широких частях"}]}]}/>

Экранирует специальные символы в именах файлов подстолбцов типа данных Variant, создаваемых в широких частях таблицы MergeTree. Требуется для совместимости.

## exclude_deleted_rows_for_part_size_in_merge \{#exclude_deleted_rows_for_part_size_in_merge\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, при выборе частей для слияния будет использоваться оценка фактического размера частей данных (то есть без учёта тех строк,
которые были удалены с помощью `DELETE FROM`). Обратите внимание, что такое поведение применяется только к тем частям данных,
на которые повлиял оператор `DELETE FROM`, выполненный после включения этого параметра.

Возможные значения:

- `true`
- `false`

**См. также**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts)
параметр

## exclude_materialize_skip_indexes_on_merge \{#exclude_materialize_skip_indexes_on_merge\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "Новая настройка."}]}]} />

Исключает переданный список skip-индексов, разделённый запятыми, из построения и сохранения во время слияний. Не оказывает эффекта, если
[materialize&#95;skip&#95;indexes&#95;on&#95;merge](#materialize_skip_indexes_on_merge) имеет значение false.

Исключённые skip-индексы по-прежнему будут построены и сохранены явным запросом
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) или во время INSERT в зависимости от
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

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- setting has no effect on INSERTs

-- idx_a will be excluded from update during background or explicit merge via OPTIMIZE TABLE FINAL

-- can exclude multiple indexes by providing a list
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = 'idx_a, idx_b';

-- default setting, no indexes excluded from being updated during merge
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = '';
```


## execute_merges_on_single_replica_time_threshold \{#execute_merges_on_single_replica_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="0" />

Когда эта настройка имеет значение больше нуля, только одна реплика немедленно
начинает слияние, а другие реплики ждут до указанного времени, чтобы
загрузить результат вместо выполнения слияний локально. Если выбранная реплика
не завершит слияние за это время, происходит возврат к стандартному
поведению.

Возможные значения:

- Любое положительное целое число.

## fault_probability_after_part_commit \{#fault_probability_after_part_commit\}

<SettingsInfoBlock type="Float" default_value="0" />

Используется для тестирования. Не изменяйте.

## fault_probability_before_part_commit \{#fault_probability_before_part_commit\}

<SettingsInfoBlock type="Float" default_value="0" />

Для тестирования. Не изменяйте этот параметр.

## finished_mutations_to_keep \{#finished_mutations_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="100" />

Сколько записей о завершённых мутациях хранить. Если ноль, то хранить
все.

## force_read_through_cache_for_merges \{#force_read_through_cache_for_merges\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Принудительное чтение данных через кэш файловой системы при слияниях

## fsync_after_insert \{#fsync_after_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

Выполнять fsync для каждой вставленной части. Существенно снижает производительность
операций вставки, не рекомендуется использовать с широкими частями.

## fsync_part_directory \{#fsync_part_directory\}

<SettingsInfoBlock type="Bool" default_value="0" />

Выполнять `fsync` для директории парта после выполнения всех операций с ним (запись, переименование и т. д.).

## in_memory_parts_enable_wal \{#in_memory_parts_enable_wal\}

<SettingsInfoBlock type="Bool" default_value="1" />

Устаревшая настройка, ни на что не влияет.

## in_memory_parts_insert_sync \{#in_memory_parts_insert_sync\}

<SettingsInfoBlock type="Bool" default_value="0" />

Устаревшая настройка, не оказывает никакого эффекта.

## inactive_parts_to_delay_insert \{#inactive_parts_to_delay_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество неактивных частей в одной партиции таблицы превышает
значение `inactive_parts_to_delay_insert`, операция `INSERT` искусственно
замедляется.

:::tip
Полезно, когда сервер не успевает достаточно быстро удалять части.
:::

Возможные значения:

- Любое положительное целое число.

## inactive_parts_to_throw_insert \{#inactive_parts_to_throw_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество неактивных частей в одной партиции превышает значение
`inactive_parts_to_throw_insert`, выполнение `INSERT` прерывается
со следующей ошибкой:

> "Too many inactive parts (N). Parts cleaning are processing significantly
slower than inserts" exception."

Возможные значения:

- Любое положительное целое число.

## index_granularity \{#index_granularity\}

<SettingsInfoBlock type="UInt64" default_value="8192" />

Максимальное количество строк между метками индекса, то есть сколько строк
приходится на одно значение первичного ключа.

## index_granularity_bytes \{#index_granularity_bytes\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

Максимальный размер гранул данных в байтах.

Чтобы ограничить размер гранул только количеством строк, установите значение `0` (не рекомендуется).

## initialization_retry_period \{#initialization_retry_period\}

<SettingsInfoBlock type="Seconds" default_value="60" />

Период между повторными попытками инициализации таблицы, в секундах.

## kill_delay_period \{#kill_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="30" />

Устаревший параметр, не используется.

## kill_delay_period_random_add \{#kill_delay_period_random_add\}

<SettingsInfoBlock type="UInt64" default_value="10" />

Устаревшая настройка, не оказывает никакого эффекта.

## kill_threads \{#kill_threads\}

<SettingsInfoBlock type="UInt64" default_value="128" />

Устаревшая настройка, не оказывает никакого эффекта.

## lightweight_mutation_projection_mode \{#lightweight_mutation_projection_mode\}

<SettingsInfoBlock type="LightweightMutationProjectionMode" default_value="throw" />

По умолчанию легковесное удаление `DELETE` не работает для таблиц с
проекциями. Это связано с тем, что строки в проекции могут быть затронуты
операцией `DELETE`. Поэтому значение по умолчанию — `throw`. Однако эта
настройка может изменить поведение. При значении `drop` или `rebuild`
удаления будут работать с проекциями. `drop` удалит проекцию, поэтому
текущий запрос может выполниться быстрее, так как проекция просто удаляется, но
будущие запросы могут работать медленнее, так как проекция больше недоступна.
`rebuild` перестроит проекцию, что может повлиять на производительность
текущего запроса, но потенциально ускорит будущие запросы. Плюсом является то, что
эти режимы действуют только на уровне части (part), что означает, что
проекции в части, которая не затронута, останутся нетронутыми, и для них
не будет инициировано никаких действий, таких как drop или rebuild.

Возможные значения:

- `throw`
- `drop`
- `rebuild`

## load_existing_rows_count_for_old_parts \{#load_existing_rows_count_for_old_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если настройка включена вместе с [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge),
количество удалённых строк для существующих частей данных таблицы будет вычислено при
запуске таблицы. Обратите внимание, что это может замедлить загрузку таблицы при запуске.

Возможные значения:

- `true`
- `false`

**См. также**

- настройка [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge)

## lock_acquire_timeout_for_background_operations \{#lock_acquire_timeout_for_background_operations\}

<SettingsInfoBlock type="Seconds" default_value="120" />

Для фоновых операций, таких как слияния, мутации и т. д. Количество секунд ожидания при получении блокировок таблиц до возникновения ошибки.

## marks_compress_block_size \{#marks_compress_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

Размер блока сжатия меток — фактический размер сжимаемого блока.

## marks_compression_codec \{#marks_compression_codec\}

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

Кодек сжатия, используемый для меток: метки достаточно малы и кэшируются, поэтому по умолчанию используется ZSTD(3).

## materialize_skip_indexes_on_merge \{#materialize_skip_indexes_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "New setting"}]}]}/>

Когда параметр включен, при слияниях создаются и сохраняются пропускающие индексы для новых частей.
В противном случае они могут быть созданы/сохранены явной командой [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)
или [во время операций INSERT](/operations/settings/settings.md/#materialize_skip_indexes_on_insert).

См. также [exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge) для более детального управления.

## materialize_statistics_on_merge \{#materialize_statistics_on_merge\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "New setting"}]}]}/>

Если параметр включен, во время слияний будет строиться и сохраняться статистика для новых частей.
В противном случае её можно создать и сохранить явным вызовом [MATERIALIZE STATISTICS](/sql-reference/statements/alter/statistics.md)
или [во время INSERT-запросов](/operations/settings/settings.md#materialize_statistics_on_insert).

## materialize_ttl_recalculate_only \{#materialize_ttl_recalculate_only\}

<SettingsInfoBlock type="Bool" default_value="0" />

Пересчитывать информацию TTL только во время выполнения MATERIALIZE TTL

## max_avg_part_size_for_too_many_parts \{#max_avg_part_size_for_too_many_parts\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Проверка «слишком много частей» в соответствии с `parts_to_delay_insert` и
`parts_to_throw_insert` будет активна только в том случае, если средний размер части (в
соответствующей партиции) не превышает заданный порог. Если он
превышает заданный порог, операции INSERT не будут ни задерживаться, ни
отклоняться. Это позволяет иметь сотни терабайт в одной таблице на
одном сервере, если части успешно сливаются в более крупные части. Это
не влияет на пороговые значения для неактивных частей или на общее количество частей.

## max_bytes_to_merge_at_max_space_in_pool \{#max_bytes_to_merge_at_max_space_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="161061273600" />

Максимальный суммарный размер частей (в байтах), которые могут быть объединены в одну часть, если доступно достаточно ресурсов. Приблизительно соответствует максимальному возможному размеру части, создаваемой автоматическим фоновым слиянием. (0 означает, что слияния будут отключены)

Возможные значения:

- Любое неотрицательное целое число.

Планировщик слияний периодически анализирует размеры и количество частей в
партициях и, если в пуле достаточно свободных ресурсов, запускает фоновые слияния. Слияния выполняются до тех пор, пока общий размер исходных частей
не превысит `max_bytes_to_merge_at_max_space_in_pool`.

Слияния, инициированные с помощью [OPTIMIZE FINAL](/sql-reference/statements/optimize),
игнорируют `max_bytes_to_merge_at_max_space_in_pool` (учитывается только
свободное место на диске).

## max_bytes_to_merge_at_min_space_in_pool \{#max_bytes_to_merge_at_min_space_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Максимальный суммарный размер частей (в байтах), которые могут быть объединены в одну часть при минимально доступных ресурсах в фоновом пуле.

Возможные значения:

- Любое положительное целое число.

`max_bytes_to_merge_at_min_space_in_pool` определяет максимальный суммарный размер
частей, которые могут быть слиты, несмотря на нехватку доступного дискового пространства (в пуле).
Это необходимо для уменьшения количества мелких частей и вероятности ошибок
`Too many parts`.
Слияния резервируют дисковое пространство, удваивая суммарные размеры сливаемых частей.
Таким образом, при небольшом количестве свободного дискового пространства может возникнуть ситуация, когда
есть свободное место, но оно уже зарезервировано текущими крупными слияниями,
поэтому другие слияния не могут запуститься, и количество мелких частей растёт
с каждой вставкой.

## max_cleanup_delay_period \{#max_cleanup_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="300" />

Максимальный интервал очистки старых журналов очереди, хэшей блоков и частей.

## max_compress_block_size \{#max_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер блоков несжатых данных перед сжатием при записи
в таблицу. Эту настройку также можно задать в глобальных настройках
(см. настройку [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size)).
Значение, указанное при создании таблицы, переопределяет глобальное
значение для этой настройки.

## max_concurrent_queries \{#max_concurrent_queries\}

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


## max_delay_to_insert \{#max_delay_to_insert\}

<SettingsInfoBlock type="UInt64" default_value="1" />

Значение в секундах, которое используется для расчёта задержки `INSERT`, если
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

Например, если у партиции 299 активных частей и parts&#95;to&#95;throw&#95;insert
= 300, parts&#95;to&#95;delay&#95;insert = 150, max&#95;delay&#95;to&#95;insert = 1, операция `INSERT`
задерживается на `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000`
миллисекунд.

Начиная с версии 23.1, формула изменена на:

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

Например, если в партиции 224 активные части и parts&#95;to&#95;throw&#95;insert
= 300, parts&#95;to&#95;delay&#95;insert = 150, max&#95;delay&#95;to&#95;insert = 1,
min&#95;delay&#95;to&#95;insert&#95;ms = 10, выполнение `INSERT` задерживается на `max( 10, 1 * 1000 *
(224 - 150 + 1) / (300 - 150) ) = 500` миллисекунд.


## max_delay_to_mutate_ms \{#max_delay_to_mutate_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальная задержка модификации таблицы MergeTree в миллисекундах при большом количестве незавершённых мутаций

## max_digestion_size_per_segment \{#max_digestion_size_per_segment\}

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "268435456"},{"label": "Устаревшая настройка"}]}]}/>

Устаревшая настройка, ничего не делает.

## max_file_name_length \{#max_file_name_length\}

<SettingsInfoBlock type="UInt64" default_value="127" />

Максимальная длина имени файла, при которой оно оставляется без изменений, без хеширования.
Вступает в силу только если включена настройка `replace_long_file_name_to_hash`.
Значение этой настройки не включает длину расширения файла. Поэтому
рекомендуется задавать его ниже максимальной длины имени файла (обычно 255
байт) с некоторым запасом, чтобы избежать ошибок файловой системы.

## max_files_to_modify_in_alter_columns \{#max_files_to_modify_in_alter_columns\}

<SettingsInfoBlock type="UInt64" default_value="75" />

Не выполнять ALTER, если количество файлов для модификации (удаления, добавления)
превышает эту настройку.

Возможные значения:

- Любое положительное целое число.

Значение по умолчанию: 75

## max_files_to_remove_in_alter_columns \{#max_files_to_remove_in_alter_columns\}

<SettingsInfoBlock type="UInt64" default_value="50" />

Не применять ALTER, если количество файлов для удаления больше этого
настройки.

Возможные значения:

- Любое положительное целое число.

## max_merge_delayed_streams_for_parallel_write \{#max_merge_delayed_streams_for_parallel_write\}

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "40"},{"label": "New setting"}]}]}/>

Максимальное количество потоков (столбцов), которые могут сбрасываться на диск параллельно
(аналог max_insert_delayed_streams_for_parallel_write для слияний). Работает
только для вертикальных слияний.

## max_merge_selecting_sleep_ms \{#max_merge_selecting_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

Максимальное время ожидания перед следующей попыткой выбрать части для слияния, если ранее ни одна часть не была выбрана. Меньшее значение параметра приводит к более частому выбору задач в background_schedule_pool и, соответственно, к большему числу запросов к ZooKeeper в крупных кластерах.

## max_number_of_merges_with_ttl_in_pool \{#max_number_of_merges_with_ttl_in_pool\}

<SettingsInfoBlock type="UInt64" default_value="2" />

Если в пуле количество слияний с TTL превышает указанное значение, новые
слияния с TTL не назначаются. Это позволяет оставить свободные потоки для обычных слияний и
избежать ошибки «Too many parts».

## max_number_of_mutations_for_replica \{#max_number_of_mutations_for_replica\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает количество мутаций частей на реплику до указанного значения.
Ноль означает отсутствие ограничения на количество мутаций на реплику (выполнение
по-прежнему может быть ограничено другими настройками).

## max_part_loading_threads \{#max_part_loading_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

Устаревший параметр, не оказывает никакого эффекта.

## max_part_removal_threads \{#max_part_removal_threads\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(17)'" />

Устаревший параметр; не оказывает эффекта.

## max_partitions_to_read \{#max_partitions_to_read\}

<SettingsInfoBlock type="Int64" default_value="-1" />

Ограничивает максимальное количество партиций, доступных в одном запросе.

Значение настройки, указанное при создании таблицы, может быть переопределено
на уровне запроса.

Возможные значения:

- Любое положительное целое число.

Вы также можете задать настройку сложности запроса [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)
на уровне запроса / сессии / профиля.

## max_parts_in_total \{#max_parts_in_total\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

Если общее количество активных частей во всех партициях таблицы превышает
значение `max_parts_in_total`, операция `INSERT` прерывается с исключением `Too many parts
(N)`.

Возможные значения:

- Любое положительное целое число.

Большое количество частей в таблице снижает производительность запросов ClickHouse
и увеличивает время запуска ClickHouse. Чаще всего это является следствием
некорректного проектирования таблицы (ошибки при выборе стратегии партиционирования — слишком маленькие
партиции).

## max_parts_to_merge_at_once \{#max_parts_to_merge_at_once\}

<SettingsInfoBlock type="UInt64" default_value="100" />

Максимальное количество частей, которые могут быть слиты одновременно (0 — отключено). Не влияет на запрос OPTIMIZE FINAL.

## max_postpone_time_for_failed_mutations_ms \{#max_postpone_time_for_failed_mutations_ms\}

<SettingsInfoBlock type="UInt64" default_value="300000" />

Максимальное время отсрочки для неуспешных мутаций.

## max_postpone_time_for_failed_replicated_fetches_ms \{#max_postpone_time_for_failed_replicated_fetches_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Добавлена новая настройка, позволяющая откладывать задачи выборки в очереди репликации."}]}]}/>

Максимальное время откладывания неуспешных операций выборки в репликации.

## max_postpone_time_for_failed_replicated_merges_ms \{#max_postpone_time_for_failed_replicated_merges_ms\}

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "60000"},{"label": "Добавлена новая настройка для включения отложенного выполнения задач слияния в очереди репликации."}]}]}/>

Максимальное время, на которое откладывается выполнение неудачных реплицируемых слияний.

## max_postpone_time_for_failed_replicated_tasks_ms \{#max_postpone_time_for_failed_replicated_tasks_ms\}

<SettingsInfoBlock type="UInt64" default_value="300000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "300000"},{"label": "Добавлена новая настройка для включения откладывания задач в очереди репликации."}]}]}/>

Максимальное время отложенного выполнения для неудавшейся реплицируемой задачи. Значение используется, если задача не относится к типам fetch, merge или mutation.

## max_projections \{#max_projections\}

<SettingsInfoBlock type="UInt64" default_value="25" />

Максимальное количество проекций PROJECTION в таблицах MergeTree.

## max_replicated_fetches_network_bandwidth \{#max_replicated_fetches_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает максимальную скорость обмена данными по сети в байтах в
секунду для [реплицируемых](../../engines/table-engines/mergetree-family/replication.md)
fetch-запросов. Этот параметр применяется к конкретной таблице, в отличие от
настройки [`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth),
которая применяется к серверу.

Вы можете ограничить как сетевой трафик сервера, так и трафик для конкретной таблицы, но
для этого значение настройки на уровне таблицы должно быть меньше, чем на уровне сервера.
В противном случае сервер учитывает только настройку
`max_replicated_fetches_network_bandwidth_for_server`.

Настройка не обеспечивает строгое соблюдение ограничения.

Возможные значения:

- Положительное целое число.
- `0` — без ограничений.

Значение по умолчанию: `0`.

**Использование**

Может использоваться для ограничения скорости при репликации данных при добавлении
или замене узлов.

## max_replicated_logs_to_keep \{#max_replicated_logs_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Сколько записей может быть в журнале ClickHouse Keeper при наличии неактивной
реплики. Неактивная реплика считается утерянной, как только это число будет превышено.

Возможные значения:

- Любое положительное целое число.

## max_replicated_merges_in_queue \{#max_replicated_merges_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Сколько задач по слиянию и мутации частей может одновременно находиться в очереди ReplicatedMergeTree.

## max_replicated_merges_with_ttl_in_queue \{#max_replicated_merges_with_ttl_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="1" />

Сколько задач по слиянию частей с TTL может одновременно находиться в очереди ReplicatedMergeTree.

## max_replicated_mutations_in_queue \{#max_replicated_mutations_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="8" />

Сколько задач по мутации частей допускается одновременно в очереди ReplicatedMergeTree.

## max_replicated_sends_network_bandwidth \{#max_replicated_sends_network_bandwidth\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает максимальную скорость обмена данными по сети, в байтах в
секунду, при отправке данных на [реплицируемые таблицы](/engines/table-engines/mergetree-family/replacingmergetree).
Этот параметр применяется к конкретной таблице, в отличие от
параметра [`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth),
который применяется ко всему серверу.

Вы можете ограничить как сетевой трафик сервера, так и трафик для конкретной таблицы, но
для этого значение параметра на уровне таблицы должно быть меньше, чем
на уровне сервера. В противном случае сервер учитывает только параметр
`max_replicated_sends_network_bandwidth_for_server`.

Значение параметра не выдерживается с идеальной точностью.

Возможные значения:

- Положительное целое число.
- `0` — без ограничений.

**Использование**

Может использоваться для ограничения скорости при репликации данных при добавлении
или замене узлов.

## max_suspicious_broken_parts \{#max_suspicious_broken_parts\}

<SettingsInfoBlock type="UInt64" default_value="100" />

Если количество повреждённых частей в одной партиции превышает значение
`max_suspicious_broken_parts`, автоматическое удаление не выполняется.

Возможные значения:

- Любое положительное целое число.

## max_suspicious_broken_parts_bytes \{#max_suspicious_broken_parts_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Максимальный суммарный размер всех повреждённых частей; при превышении автоматическое удаление запрещается.

Возможные значения:

- Любое положительное целое число.

## max_uncompressed_bytes_in_patches \{#max_uncompressed_bytes_in_patches\}

<SettingsInfoBlock type="UInt64" default_value="32212254720" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32212254720"},{"label": "New setting"}]}]}/>

Максимальный несжатый объём данных во всех патч-частях, в байтах.
Если объём данных во всех патч-частях превышает это значение, легковесные обновления будут отклоняться.
0 — без ограничений.

## merge_max_block_size \{#merge_max_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8192" />

Количество строк, считываемых из сливаемых частей в память.

Возможные значения:

- Любое положительное целое число.

Слияние считывает строки из частей блоками по `merge_max_block_size` строк, затем
объединяет их и записывает результат в новую часть. Считываемый блок помещается в оперативную память (RAM),
поэтому `merge_max_block_size` влияет на объём RAM, необходимый для слияния.
Таким образом, слияния могут потреблять большой объём RAM для таблиц с очень «широкими» строками
(если средний размер строки — 100 КБ, то при слиянии 10 частей
(100 КБ * 10 * 8192) = ~ 8 ГБ RAM). Уменьшая `merge_max_block_size`,
вы можете сократить объём RAM, необходимый для слияния, но замедлить его выполнение.

## merge_max_block_size_bytes \{#merge_max_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

Сколько байт должно быть в блоках, формируемых при операциях слияния. По умолчанию это значение совпадает со значением `index_granularity_bytes`.

## merge_max_bytes_to_prewarm_cache \{#merge_max_bytes_to_prewarm_cache\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1073741824"},{"label": "Cloud sync"}]}]}/>

Параметр доступен только в ClickHouse Cloud. Максимальный размер части (compact или packed)
для предварительного прогрева кэша при слиянии.

## merge_max_dynamic_subcolumns_in_wide_part \{#merge_max_dynamic_subcolumns_in_wide_part\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "auto"},{"label": "Добавлена новая настройка для ограничения числа динамических подстолбцов в Wide-части после слияния, независимо от параметров, указанных в типе данных"}]}]}/>

Максимальное число динамических подстолбцов, которое может быть создано в каждом столбце в Wide-части данных после слияния.
Это позволяет уменьшить количество файлов, создаваемых в Wide-части данных, независимо от динамических параметров, указанных в типе данных.

Например, если таблица имеет столбец с типом JSON(max_dynamic_paths=1024), а настройка merge_max_dynamic_subcolumns_in_wide_part установлена в значение 128,
то после слияния в Wide-часть данных число динамических путей в этой части будет уменьшено до 128, и только 128 путей будут записаны как динамические подстолбцы.

## merge_selecting_sleep_ms \{#merge_selecting_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

Минимальное время ожидания перед следующей попыткой выбрать части для слияния, если при предыдущей попытке не была выбрана ни одна часть. Более низкое значение настройки будет чаще запускать задачи выбора в background_schedule_pool, что в кластерах крупного масштаба приводит к большому количеству запросов к ZooKeeper.

## merge_selecting_sleep_slowdown_factor \{#merge_selecting_sleep_slowdown_factor\}

<SettingsInfoBlock type="Float" default_value="1.2" />

Время ожидания задачи выбора слияния умножается на этот коэффициент, когда нет задач на слияние, и делится на него, когда слияние назначено

## merge_selector_algorithm \{#merge_selector_algorithm\}

<ExperimentalBadge/>

<SettingsInfoBlock type="MergeSelectorAlgorithm" default_value="Simple" />

Алгоритм выбора частей для выполнения слияний

## merge_selector_base \{#merge_selector_base\}

<SettingsInfoBlock type="Float" default_value="5" />

Влияет на write amplification назначенных слияний (настройка для опытных пользователей, не изменяйте эту настройку, если вы не понимаете, что она делает). Работает для селекторов слияний Simple и StochasticSimple.

## merge_selector_blurry_base_scale_factor \{#merge_selector_blurry_base_scale_factor\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Определяет, когда срабатывает логика по отношению к количеству частей в
партиции. Чем больше коэффициент, тем позже она сработает.

## merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once \{#merge_selector_enable_heuristic_to_lower_max_parts_to_merge_at_once\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Включает эвристику для простого селектора слияний, которая уменьшает максимальное ограничение при выборе слияния.
В результате увеличивается число одновременно выполняемых слияний, что может помочь с ошибками TOO_MANY_PARTS,
но при этом усиливается write amplification.

## merge_selector_enable_heuristic_to_remove_small_parts_at_right \{#merge_selector_enable_heuristic_to_remove_small_parts_at_right\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает эвристику выбора частей для слияния, которая исключает части с правой
стороны диапазона, если их размер меньше указанной доли (0.01) от sum_size.
Работает для селекторов слияния Simple и StochasticSimple.

## merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent \{#merge_selector_heuristic_to_lower_max_parts_to_merge_at_once_exponent\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "5"},{"label": "New setting"}]}]}/>

Управляет значением показателя степени, используемым в формулах, задающих понижающую кривую. Уменьшение показателя степени
уменьшит ширину операций слияния (merge), что приведёт к росту амплификации записи (write amplification). Обратное также верно.

## merge_selector_window_size \{#merge_selector_window_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Количество частей, рассматриваемых одновременно.

## merge_total_max_bytes_to_prewarm_cache \{#merge_total_max_bytes_to_prewarm_cache\}

<SettingsInfoBlock type="UInt64" default_value="16106127360" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "16106127360"},{"label": "Cloud sync"}]}]}/>

Доступен только в ClickHouse Cloud. Максимальный суммарный размер частей для предварительного прогрева кэша при слиянии.

## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds \{#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds\}

<SettingsInfoBlock type="UInt64" default_value="2592000" />

Устаревшая настройка, не используется.

## merge_tree_clear_old_parts_interval_seconds \{#merge_tree_clear_old_parts_interval_seconds\}

<SettingsInfoBlock type="UInt64" default_value="1" />

Задает интервал в секундах между запусками очистки старых частей, WAL и мутаций в ClickHouse.

Возможные значения:

- Любое положительное целое число.

## merge_tree_clear_old_temporary_directories_interval_seconds \{#merge_tree_clear_old_temporary_directories_interval_seconds\}

<SettingsInfoBlock type="UInt64" default_value="60" />

Задает интервал в секундах, через который ClickHouse выполняет очистку старых
временных каталогов.

Возможные значения:

- Любое положительное целое число.

## merge_tree_enable_clear_old_broken_detached \{#merge_tree_enable_clear_old_broken_detached\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устаревший параметр, не оказывает никакого эффекта.

## merge_with_recompression_ttl_timeout \{#merge_with_recompression_ttl_timeout\}

<SettingsInfoBlock type="Int64" default_value="14400" />

Минимальная задержка в секундах перед повторным выполнением слияния с перекомпрессией по TTL.

## merge_with_ttl_timeout \{#merge_with_ttl_timeout\}

<SettingsInfoBlock type="Int64" default_value="14400" />

Минимальная задержка в секундах перед повторным выполнением слияния с TTL для удаления.

## merge_workload \{#merge_workload\}

Используется для регулирования использования и распределения ресурсов между слияниями и другими нагрузками. Указанное значение используется как значение настройки `workload` для фоновых слияний этой таблицы. Если не указано (пустая строка), вместо него используется серверная настройка `merge_workload`.

**См. также**

- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)

## min_absolute_delay_to_close \{#min_absolute_delay_to_close\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальная абсолютная задержка до завершения работы: прекратить обслуживание запросов и не возвращать Ok во время проверки состояния.

## min_age_to_force_merge_on_partition_only \{#min_age_to_force_merge_on_partition_only\}

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, должно ли `min_age_to_force_merge_seconds` применяться только ко всей
партиции, а не к её подмножеству.

По умолчанию игнорирует настройку `max_bytes_to_merge_at_max_space_in_pool` (см.
`enable_max_bytes_limit_for_min_age_to_force_merge`).

Возможные значения:

- true, false

## min_age_to_force_merge_seconds \{#min_age_to_force_merge_seconds\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Объединяет части, если каждая часть в диапазоне старше значения параметра
`min_age_to_force_merge_seconds`.

По умолчанию эта настройка игнорирует параметр `max_bytes_to_merge_at_max_space_in_pool`
(см. `enable_max_bytes_limit_for_min_age_to_force_merge`).

Возможные значения:

- Положительное целое число.

## min_bytes_for_compact_part \{#min_bytes_for_compact_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устаревший параметр, не оказывает никакого эффекта.

## min_bytes_for_full_part_storage \{#min_bytes_for_full_part_storage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Доступно только в ClickHouse Cloud. Минимальный несжатый размер части данных в байтах, при котором используется полноценный тип хранилища вместо упакованного.

## min_bytes_for_wide_part \{#min_bytes_for_wide_part\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

Минимальное количество байт или строк в части данных, которая может храниться в формате `Wide`. Вы можете задать одну, обе или ни одну из этих настроек.

## min_bytes_to_prewarm_caches \{#min_bytes_to_prewarm_caches\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Минимальный объём (в несжатых байтах) данных, необходимый для предварительного прогрева кэша меток и кэша первичного индекса
для новых частей

## min_bytes_to_rebalance_partition_over_jbod \{#min_bytes_to_rebalance_partition_over_jbod\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает минимальный объём данных в байтах для включения балансировки при распределении новых крупных
частей по дискам JBOD-тома [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures).

Возможные значения:

- Положительное целое число.
- `0` — балансировка отключена.

**Использование**

Значение параметра `min_bytes_to_rebalance_partition_over_jbod` не должно
быть меньше значения
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)
/ 1024. В противном случае ClickHouse генерирует исключение.

## min_columns_to_activate_adaptive_write_buffer \{#min_columns_to_activate_adaptive_write_buffer\}

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "500"},{"label": "New setting"}]}]}/>

Позволяет уменьшить потребление памяти для таблиц с большим числом столбцов за счёт использования адаптивных буферов записи.

Возможные значения:

- 0 — без ограничений
- 1 — всегда включено

## min_compress_block_size \{#min_compress_block_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный размер блоков несжатых данных, требуемый для сжатия при
записи следующей метки. Этот параметр также можно указать в глобальных настройках
(см. параметр [min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size)).
Значение, указанное при создании таблицы, переопределяет глобальное значение
для этого параметра.

## min_compressed_bytes_to_fsync_after_fetch \{#min_compressed_bytes_to_fsync_after_fetch\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество сжатых байт для выполнения fsync для части после получения (0 — отключено)

## min_compressed_bytes_to_fsync_after_merge \{#min_compressed_bytes_to_fsync_after_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество сжатых байт для выполнения fsync над партом после слияния (0 — отключено)

## min_delay_to_insert_ms \{#min_delay_to_insert_ms\}

<SettingsInfoBlock type="UInt64" default_value="10" />

Минимальная задержка вставки данных в таблицу MergeTree в миллисекундах, если в одной партиции имеется много неслитых частей.

## min_delay_to_mutate_ms \{#min_delay_to_mutate_ms\}

<SettingsInfoBlock type="UInt64" default_value="10" />

Минимальная задержка выполнения мутаций таблицы MergeTree в миллисекундах, если имеется большое количество незавершённых мутаций

## min_free_disk_bytes_to_perform_insert \{#min_free_disk_bytes_to_perform_insert\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество байт свободного дискового пространства, необходимое для
выполнения вставки данных. Если количество доступных свободных байт меньше
`min_free_disk_bytes_to_perform_insert`, генерируется исключение и
вставка не выполняется. Обратите внимание, что этот параметр:

- учитывает параметр `keep_free_space_bytes`;
- не учитывает объем данных, который будет записан операцией
`INSERT`;
- проверяется только в том случае, если задано положительное (ненулевое) количество байт.

Возможные значения:

- Любое положительное целое число.

:::note
Если заданы оба параметра — `min_free_disk_bytes_to_perform_insert` и `min_free_disk_ratio_to_perform_insert`,
ClickHouse будет ориентироваться на то значение, которое позволит выполнять
вставки при большем объеме свободного дискового пространства.
:::

## min_free_disk_ratio_to_perform_insert \{#min_free_disk_ratio_to_perform_insert\}

<SettingsInfoBlock type="Float" default_value="0" />

Минимальное отношение объёма свободного места на диске к общему объёму диска для выполнения `INSERT`. Должно быть
числом с плавающей запятой в диапазоне от 0 до 1. Обратите внимание, что данный параметр:

- учитывает настройку `keep_free_space_bytes`;
- не учитывает объём данных, который будет записан операцией
`INSERT`;
- проверяется только в том случае, если задано положительное (ненулевое) значение отношения.

Возможные значения:

- Float, 0.0–1.0

Обратите внимание, что если указаны оба параметра — `min_free_disk_ratio_to_perform_insert` и
`min_free_disk_bytes_to_perform_insert`, ClickHouse будет ориентироваться
на значение, которое позволит выполнять вставки при большем объёме свободного
места на диске.

## min_index_granularity_bytes \{#min_index_granularity_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

Минимально допустимый размер гранул данных в байтах.

Позволяет избежать случайного создания таблиц с очень маленьким значением
`index_granularity_bytes`.

## min_level_for_full_part_storage \{#min_level_for_full_part_storage\}

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

Настройка доступна только в ClickHouse Cloud. Минимальный уровень части данных, при котором для неё используется полный формат хранения вместо упакованного.

## min_level_for_wide_part \{#min_level_for_wide_part\}

<SettingsInfoBlock type="UInt32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

Минимальный уровень парта, при котором часть данных создаётся в формате `Wide` вместо `Compact`.

## min_marks_to_honor_max_concurrent_queries \{#min_marks_to_honor_max_concurrent_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество меток, считанных запросом, при котором применяется настройка
[max&#95;concurrent&#95;queries](#max_concurrent_queries).

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


## min_merge_bytes_to_use_direct_io \{#min_merge_bytes_to_use_direct_io\}

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

Минимальный объем данных при операции слияния, начиная с которого используется прямой
доступ ввода-вывода (I/O) к дисковому хранилищу. При слиянии частей данных ClickHouse вычисляет
общий объем хранимых данных, подлежащих слиянию. Если объем превышает
`min_merge_bytes_to_use_direct_io` байт, ClickHouse читает и записывает
данные на дисковое хранилище, используя интерфейс прямого I/O (опция `O_DIRECT`).
Если `min_merge_bytes_to_use_direct_io = 0`, то прямой I/O отключен.

## min_parts_to_merge_at_once \{#min_parts_to_merge_at_once\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество частей данных, которые селектор слияния может выбрать для объединения за один раз
(настройка для экспертов, не изменяйте её, если вы не понимаете, как она работает).
0 — отключено. Работает для селекторов слияния Simple и StochasticSimple.

## min_relative_delay_to_close \{#min_relative_delay_to_close\}

<SettingsInfoBlock type="UInt64" default_value="300" />

Минимальная допустимая задержка реплики относительно других, после которой она будет отключена, перестанет обслуживать запросы и при проверке статуса перестанет возвращать OK.

## min_relative_delay_to_measure \{#min_relative_delay_to_measure\}

<SettingsInfoBlock type="UInt64" default_value="120" />

Вычислять относительную задержку реплики только в том случае, если абсолютная задержка не меньше этого значения.

## min_relative_delay_to_yield_leadership \{#min_relative_delay_to_yield_leadership\}

<SettingsInfoBlock type="UInt64" default_value="120" />

Устаревший параметр, не оказывает никакого эффекта.

## min_replicated_logs_to_keep \{#min_replicated_logs_to_keep\}

<SettingsInfoBlock type="UInt64" default_value="10" />

Сохраняет примерно указанное количество последних записей в журнале ZooKeeper, даже если они устарели. Не влияет на работу таблиц и используется только для диагностики журнала ZooKeeper перед его очисткой.

Возможные значения:

- Любое положительное целое число.

## min_rows_for_compact_part \{#min_rows_for_compact_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устаревшая настройка. Не используется.

## min_rows_for_full_part_storage \{#min_rows_for_full_part_storage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Доступно только в ClickHouse Cloud. Минимальное количество строк для использования полного формата хранения части данных вместо упакованного.

## min_rows_for_wide_part \{#min_rows_for_wide_part\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество строк, при котором часть данных создаётся в формате `Wide` вместо `Compact`.

## min_rows_to_fsync_after_merge \{#min_rows_to_fsync_after_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество строк, при котором выполняется fsync парта после слияния (0 — отключено)

## mutation_workload \{#mutation_workload\}

Используется для регулирования того, как ресурсы используются и разделяются между мутациями и другими рабочими нагрузками. Указанное значение используется как значение настройки `workload` для фоновых мутаций этой таблицы. Если значение не задано (пустая строка), то вместо него используется серверная настройка `mutation_workload`.

**См. также**

- [Планирование нагрузок](/operations/workload-scheduling.md)

## non_replicated_deduplication_window \{#non_replicated_deduplication_window\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Количество последних вставленных блоков в нереплицируемой таблице
[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md),
для которых сохраняются хэш-суммы для проверки на дубликаты.

Возможные значения:

- Любое положительное целое число.
- `0` (отключает дедупликацию).

Используется механизм дедупликации, аналогичный механизму в реплицируемых таблицах (см.
настройку [replicated_deduplication_window](#replicated_deduplication_window)).
Хэш-суммы созданных частей записываются в локальный файл на диске.

## notify_newest_block_number \{#notify_newest_block_number\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

Уведомлять SharedJoin или SharedSet о номере самого нового блока. Доступно только в ClickHouse Cloud.

## nullable_serialization_version \{#nullable_serialization_version\}

<SettingsInfoBlock type="MergeTreeNullableSerializationVersion" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "basic"},{"label": "New setting"}]}]}/>

Определяет метод сериализации, используемый для столбцов `Nullable(T)`.

Возможные значения:

- basic — Использовать стандартную сериализацию для `Nullable(T)`.

- allow_sparse — Разрешить использование разрежённого кодирования для `Nullable(T)`.

## number_of_free_entries_in_pool_to_execute_mutation \{#number_of_free_entries_in_pool_to_execute_mutation\}

<SettingsInfoBlock type="UInt64" default_value="20" />

Если количество свободных слотов в пуле меньше заданного значения, мутации частей
не выполняются. Это позволяет оставить свободные потоки для обычных слияний и
избежать ошибок «Too many parts».

Возможные значения:

- Любое положительное целое число.

**Использование**

Значение настройки `number_of_free_entries_in_pool_to_execute_mutation`
должно быть меньше значения произведения [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio).
В противном случае ClickHouse выдаст исключение.

## number_of_free_entries_in_pool_to_execute_optimize_entire_partition \{#number_of_free_entries_in_pool_to_execute_optimize_entire_partition\}

<SettingsInfoBlock type="UInt64" default_value="25" />

Если количество свободных элементов в пуле меньше указанного значения, оптимизацию всей партиции в фоновом режиме не выполнять (эта задача создаётся,
когда установлено значение `min_age_to_force_merge_seconds` и включена настройка
`min_age_to_force_merge_on_partition_only`). Это делается для того, чтобы оставить свободные потоки
для обычных слияний и избежать ошибки «Too many parts».

Возможные значения:

- Положительное целое число.

Значение настройки `number_of_free_entries_in_pool_to_execute_optimize_entire_partition`
должно быть меньше значения
[background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size)

* [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio).
В противном случае ClickHouse выбрасывает исключение.

## number_of_free_entries_in_pool_to_lower_max_size_of_merge \{#number_of_free_entries_in_pool_to_lower_max_size_of_merge\}

<SettingsInfoBlock type="UInt64" default_value="8" />

Когда количество свободных записей в пуле (или реплицируемой очереди) становится меньше указанного числа, система начинает понижать максимальный размер слияния для обработки (или постановки в очередь).
Это позволяет обрабатывать небольшие слияния, не заполняя пул длительными операциями слияния.

Возможные значения:

- Любое положительное целое число.

## number_of_mutations_to_delay \{#number_of_mutations_to_delay\}

<SettingsInfoBlock type="UInt64" default_value="500" />

Если в таблице насчитывается как минимум столько незавершённых мутаций, мутации этой таблицы искусственно замедляются.
Отключается при значении 0

## number_of_mutations_to_throw \{#number_of_mutations_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если в таблице имеется как минимум указанное количество незавершённых мутаций, будет выброшено исключение 'Too many mutations'. Значение 0 отключает проверку.

## number_of_partitions_to_consider_for_merge \{#number_of_partitions_to_consider_for_merge\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

Доступен только в ClickHouse Cloud. Не более чем N партиций будут
рассматриваться для слияния. Партиции выбираются случайным взвешенным образом, при этом весом является количество частей данных, которые могут быть слиты в этой партиции.

## object_serialization_version \{#object_serialization_version\}

<SettingsInfoBlock type="MergeTreeObjectSerializationVersion" default_value="v3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "v2"},{"label": "Добавлена настройка для управления версиями сериализации JSON"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "v3"},{"label": "Версия сериализации v3 для JSON включена по умолчанию для использования расширенной сериализации общих данных"}]}]}/>

Версия сериализации типа данных JSON. Требуется для обеспечения совместимости.

Возможные значения:

- `v1`
- `v2`
- `v3`

Только версия `v3` поддерживает изменение версии сериализации общих данных.

## object_shared_data_buckets_for_compact_part \{#object_shared_data_buckets_for_compact_part\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "Добавлена настройка для управления количеством бакетов для сериализации общих данных в формате JSON в компактных частях"}]}]}/>

Количество бакетов для сериализации общих данных в формате JSON в компактных частях. Используется с вариантами сериализации общих данных `map_with_buckets` и `advanced`.

## object_shared_data_buckets_for_wide_part \{#object_shared_data_buckets_for_wide_part\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="32" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "32"},{"label": "Добавлена настройка для управления количеством бакетов сериализации разделяемых данных в JSON в широких частях"}]}]}/>

Количество бакетов сериализации разделяемых данных в JSON в широких частях. Используется с сериализациями разделяемых данных `map_with_buckets` и `advanced`.

## object_shared_data_serialization_version \{#object_shared_data_serialization_version\}

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="advanced" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Add a setting to control JSON serialization versions"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "advanced"},{"label": "Enable advanced shared data serialization version by default"}]}]}/>

Версия сериализации разделяемых данных внутри типа данных JSON.

Возможные значения:

- `map` — хранить разделяемые данные как `Map(String, String)`
- `map_with_buckets` — хранить разделяемые данные как несколько отдельных столбцов `Map(String, String)`. Использование бакетов улучшает чтение отдельных путей из разделяемых данных.
- `advanced` — специальная сериализация разделяемых данных, предназначенная для значительного улучшения чтения отдельных путей из разделяемых данных. Обратите внимание, что такая сериализация увеличивает размер хранимых на диске разделяемых данных, поскольку сохраняется много дополнительной информации.

Количество бакетов для сериализаций `map_with_buckets` и `advanced` задаётся настройками
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part).

## object_shared_data_serialization_version_for_zero_level_parts \{#object_shared_data_serialization_version_for_zero_level_parts\}

<SettingsInfoBlock type="MergeTreeObjectSharedDataSerializationVersion" default_value="map_with_buckets" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "map"},{"label": "Добавлена настройка для управления версиями JSON-сериализации для нулевого уровня частей"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "map_with_buckets"},{"label": "По умолчанию включена версия сериализации общих данных map_with_buckets для нулевого уровня частей"}]}]}/>

Эта настройка позволяет указывать различную версию сериализации общих данных внутри типа JSON для нулевого уровня частей, которые создаются при вставке данных.
Рекомендуется не использовать `advanced` сериализацию общих данных для нулевого уровня частей, так как это может значительно увеличить время вставки.

## old_parts_lifetime \{#old_parts_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="480" />

Время (в секундах) хранения неактивных частей для защиты от потери данных
во время непредвиденных перезагрузок сервера.

Возможные значения:

- Любое положительное целое число.

После слияния нескольких частей в новую часть ClickHouse помечает исходные
части как неактивные и удаляет их только по истечении `old_parts_lifetime` секунд.
Неактивные части удаляются, если они не используются текущими запросами, т.е.
если `refcount` части равен 1.

`fsync` не вызывается для новых частей, поэтому какое-то время новые части
существуют только в оперативной памяти сервера (кэше ОС). Если сервер будет
непредвиденно перезагружен, новые части могут быть потеряны или повреждены. Для
защиты данных неактивные части не удаляются немедленно.

При старте ClickHouse проверяет целостность частей. Если слитая
часть повреждена, ClickHouse возвращает неактивные части в список активных
и позднее снова объединяет их. Затем повреждённая часть переименовывается
(добавляется префикс `broken_`) и перемещается в каталог `detached`. Если
слитая часть не повреждена, то исходные неактивные части
переименовываются (добавляется префикс `ignored_`) и перемещаются в каталог
`detached`.

Значение по умолчанию `dirty_expire_centisecs` (параметр ядра Linux) — 30
секунд (максимальное время, в течение которого записанные данные хранятся
только в оперативной памяти), но при высокой нагрузке на дисковую систему
данные могут быть записаны гораздо позднее. Экспериментально было выбрано
значение 480 секунд для `old_parts_lifetime`, в течение которых
гарантируется запись новой части на диск.

## optimize_row_order \{#optimize_row_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет тем, следует ли оптимизировать порядок строк во время вставки для улучшения
сжимаемости вновь вставленной части таблицы.

Оказывает влияние только на обычные таблицы с движком MergeTree. Ничего не делает для
специализированных таблиц с движком MergeTree (например, CollapsingMergeTree).

Таблицы MergeTree (опционально) сжимаются с использованием [кодеков сжатия](/sql-reference/statements/create/table#column_compression_codec).
Универсальные кодеки сжатия, такие как LZ4 и ZSTD, достигают максимальной степени сжатия,
если данные демонстрируют закономерности. Длинные последовательности одинаковых значений обычно
сжимаются очень хорошо.

Если эта настройка включена, ClickHouse пытается сохранять данные во вновь
вставляемых частях в таком порядке строк, который минимизирует количество серий равных значений
по столбцам новой части таблицы.
Иными словами, небольшое количество серий равных значений означает, что отдельные серии
длинные и хорошо сжимаются.

Нахождение оптимального порядка строк вычислительно неосуществимо (NP-трудная задача).
Поэтому ClickHouse использует эвристику для быстрого поиска порядка строк, который
всё же улучшает степень сжатия по сравнению с исходным порядком строк.

<details markdown="1">

<summary>Эвристика для поиска порядка строк</summary>

В общем случае строки таблицы (или части таблицы) можно произвольно переставлять,
так как SQL рассматривает одну и ту же таблицу (часть таблицы) в разном порядке строк
как эквивалентную.

Эта свобода перестановки строк ограничена, когда для таблицы задан первичный ключ.
В ClickHouse первичный ключ `C1, C2, ..., CN` требует, чтобы строки таблицы были
отсортированы по столбцам `C1`, `C2`, ... `Cn` ([кластерный индекс](https://en.wikipedia.org/wiki/Database_index#Clustered)).
В результате строки можно переставлять только внутри "классов эквивалентности" строк,
то есть строк, имеющих одинаковые значения в столбцах первичного ключа.
Интуитивно, первичные ключи с высокой кардинальностью, например первичные ключи,
включающие столбец метки времени `DateTime64`, приводят к большому количеству маленьких
классов эквивалентности. Аналогично, таблицы с первичным ключом низкой кардинальности
создают немногочисленные, но большие классы эквивалентности. Таблица без первичного
ключа представляет собой крайний случай одного класса эквивалентности, охватывающего все строки.

Чем меньше по количеству и больше по размеру классы эквивалентности, тем выше степень свободы
при повторной перестановке строк.

Эвристика, применяемая для поиска наилучшего порядка строк в каждом классе
эквивалентности, предложена D. Lemire, O. Kaser в статье
[Reordering columns for smaller indexes](https://doi.org/10.1016/j.ins.2011.02.002)
и основана на сортировке строк внутри каждого класса эквивалентности по возрастанию
кардинальности столбцов, не входящих в первичный ключ.

Она выполняет три шага:
1. Найти все классы эквивалентности на основе значений строк в столбцах первичного ключа.
2. Для каждого класса эквивалентности вычислить (обычно оценить) кардинальности
столбцов, не входящих в первичный ключ.
3. Для каждого класса эквивалентности отсортировать строки в порядке возрастания
кардинальности столбцов, не входящих в первичный ключ.

</details>

Если включено, операции вставки влекут за собой дополнительные затраты CPU на анализ и
оптимизацию порядка строк новых данных. Ожидается, что операции INSERT будут выполняться на 30–50%
дольше в зависимости от характеристик данных.
Степень сжатия LZ4 или ZSTD в среднем улучшается на 20–40%.

Эта настройка лучше всего работает для таблиц без первичного ключа или с первичным ключом
низкой кардинальности, то есть таблиц с небольшим числом различных значений первичного ключа.
Первичные ключи высокой кардинальности, например включающие столбцы меток времени типа
`DateTime64`, как правило, не выигрывают от этой настройки.

## part_moves_between_shards_delay_seconds \{#part_moves_between_shards_delay_seconds\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="30" />

Время ожидания перед/после перемещения частей между сегментами.

## part_moves_between_shards_enable \{#part_moves_between_shards_enable\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

Экспериментальная/незавершённая функциональность для перемещения частей между сегментами. Не учитывает выражения шардирования.

## parts_to_delay_insert \{#parts_to_delay_insert\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если количество активных частей в одной партиции превышает значение
`parts_to_delay_insert`, выполнение `INSERT` искусственно замедляется.

Возможные значения:

- Любое положительное целое число.

ClickHouse искусственно выполняет `INSERT` дольше (добавляет паузу «sleep»), чтобы
фоновый процесс слияния мог сливать части быстрее, чем они добавляются.

## parts_to_throw_insert \{#parts_to_throw_insert\}

<SettingsInfoBlock type="UInt64" default_value="3000" />

Если количество активных частей в одной партиции превышает значение
`parts_to_throw_insert`, операция `INSERT` прерывается с исключением `Too many
parts (N). Merges are processing significantly slower than inserts`.

Возможные значения:

- Любое положительное целое число.

Для достижения максимальной производительности запросов `SELECT` необходимо
минимизировать количество обрабатываемых частей, см. [Merge Tree](/development/architecture#merge-tree).

До версии 23.6 это значение было равно 300. Вы можете задать большее
значение — это уменьшит вероятность ошибки `Too many parts`,
но при этом производительность `SELECT` может снизиться. Также в случае
проблем со слияниями (например, из-за недостатка дискового пространства) вы
обнаружите их позже, чем с исходным значением 300.

## prefer_fetch_merged_part_size_threshold \{#prefer_fetch_merged_part_size_threshold\}

<SettingsInfoBlock type="UInt64" default_value="10737418240" />

Если сумма размеров частей превышает этот порог и время, прошедшее с момента
создания записи в журнале репликации, больше, чем
`prefer_fetch_merged_part_time_threshold`, то следует предпочитать получение
слитой части с реплики вместо локального слияния. Это позволяет ускорить очень
длительные слияния.

Возможные значения:

- Любое положительное целое число.

## prefer_fetch_merged_part_time_threshold \{#prefer_fetch_merged_part_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="3600" />

Если время, прошедшее с момента создания записи в журнале репликации (ClickHouse Keeper или ZooKeeper),
превышает этот порог, и сумма размеров частей
больше, чем `prefer_fetch_merged_part_size_threshold`, то предпочтительнее
загрузить слитую часть с реплики, чем выполнять слияние локально. Это позволяет ускорить очень долгие слияния.

Возможные значения:

- Любое положительное целое число.

## prewarm_mark_cache \{#prewarm_mark_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение `true`, кэш меток будет заранее прогреваться путём сохранения меток в кэш при вставках, слияниях, выборках и при запуске сервера.

## prewarm_primary_key_cache \{#prewarm_primary_key_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Если включено, кэш первичного индекса
будет заранее прогреваться за счёт сохранения меток в кэш меток при вставках, слияниях,
выборках и при запуске сервера.

## primary_key_compress_block_size \{#primary_key_compress_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65536" />

Размер первичного блока сжатия, фактический размер блока, который сжимается.

## primary_key_compression_codec \{#primary_key_compression_codec\}

<SettingsInfoBlock type="String" default_value="ZSTD(3)" />

Кодек сжатия, используемый для первичного ключа. Так как первичный ключ достаточно мал и кэшируется,
алгоритм сжатия по умолчанию — ZSTD(3).

## primary_key_lazy_load \{#primary_key_lazy_load\}

<SettingsInfoBlock type="Bool" default_value="1" />

Загружает первичный ключ в память при первом обращении вместо загрузки при инициализации таблицы. Это позволяет экономить память при большом количестве таблиц.

## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns \{#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns\}

<SettingsInfoBlock type="Float" default_value="0.9" />

Если значение столбца первичного ключа в части данных меняется как минимум в
такой доле случаев, пропускается загрузка последующих столбцов в память. Это позволяет
сэкономить память за счёт того, что не загружаются лишние столбцы первичного ключа.

## ratio_of_defaults_for_sparse_serialization \{#ratio_of_defaults_for_sparse_serialization\}

<SettingsInfoBlock type="Float" default_value="0.9375" />

Минимальное отношение количества *значений по умолчанию* к количеству *всех* значений
в столбце. Задание этого порога приводит к тому, что столбец хранится с использованием
разрежённой сериализации.

Если столбец разрежённый (содержит в основном нули), ClickHouse может кодировать его
в разрежённом формате и автоматически оптимизировать вычисления — данные не требуют
полной декомпрессии при выполнении запросов. Чтобы включить эту разрежённую
сериализацию, задайте для настройки `ratio_of_defaults_for_sparse_serialization`
значение меньше 1.0. Если значение больше либо равно 1.0,
то столбцы всегда будут записываться с использованием обычной полной сериализации.

Возможные значения:

* Число с плавающей запятой между `0` и `1` для включения разрежённой сериализации
* `1.0` (или больше), если вы не хотите использовать разрежённую сериализацию

**Пример**

Обратите внимание, что столбец `s` в следующей таблице — это пустая строка для 95%
строк. В `my_regular_table` мы не используем разрежённую сериализацию, а в
`my_sparse_table` задаём `ratio_of_defaults_for_sparse_serialization` равным
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

Обратите внимание, что столбец `s` в `my_sparse_table` занимает меньше места на диске:

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

Вы можете проверить, используется ли для столбца разреженное кодирование, просмотрев столбец `serialization_kind` таблицы `system.parts_columns`:

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

Вы можете увидеть, какие части `s` были записаны с использованием разреженной сериализации:

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


## reduce_blocking_parts_sleep_ms \{#reduce_blocking_parts_sleep_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5000"},{"label": "Cloud sync"}]}]}/>

Доступен только в ClickHouse Cloud. Минимальный интервал ожидания перед повторной
попыткой уменьшить блокирующие части после того, как ни один диапазон не был
удалён или заменён. Более низкое значение настройки будет чаще запускать задачи
в background_schedule_pool, что приводит к большому количеству запросов к
ZooKeeper в крупных кластерах.

## refresh_parts_interval \{#refresh_parts_interval\}

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "A new setting"}]}]}/>

Если значение больше нуля, список частей данных обновляется из нижележащей файловой системы, чтобы проверить, были ли данные изменены.
Параметр можно задать только в том случае, если таблица расположена на дисках только для чтения (это означает, что это реплика только для чтения, а данные записываются другой репликой).

## refresh_statistics_interval \{#refresh_statistics_interval\}

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Интервал обновления кэша статистики в секундах. Если значение установлено равным нулю, обновление будет отключено.

## remote_fs_execute_merges_on_single_replica_time_threshold \{#remote_fs_execute_merges_on_single_replica_time_threshold\}

<SettingsInfoBlock type="Seconds" default_value="10800" />

Если значение этого параметра больше нуля, только одна реплика немедленно
запускает слияние, если результирующая часть находится на общем хранилище.

:::note
Zero-copy репликация не готова к использованию в production-среде
Zero-copy репликация по умолчанию отключена в ClickHouse версии 22.8 и
выше.

Эта функция не рекомендуется для использования в production-среде.
:::

Возможные значения:

- Любое положительное целое число.

## remote_fs_zero_copy_path_compatible_mode \{#remote_fs_zero_copy_path_compatible_mode\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Выполняет zero-copy в режиме совместимости во время процесса преобразования.

## remote_fs_zero_copy_zookeeper_path \{#remote_fs_zero_copy_zookeeper_path\}

<ExperimentalBadge/>

<SettingsInfoBlock type="String" default_value="/clickhouse/zero_copy" />

Путь в ZooKeeper к информации zero-copy, не зависящей от таблиц.

## remove_empty_parts \{#remove_empty_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

Удаляет пустые части после того, как они были очищены TTL, мутациями или алгоритмом слияния Collapsing.

## remove_rolled_back_parts_immediately \{#remove_rolled_back_parts_immediately\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

Настройка для незавершённой экспериментальной возможности.

## remove_unused_patch_parts \{#remove_unused_patch_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

Удаляет в фоновом режиме патч-части, уже применённые ко всем активным частям.

## replace_long_file_name_to_hash \{#replace_long_file_name_to_hash\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если имя файла столбца слишком длинное (больше 'max_file_name_length'
байт), оно заменяется на SipHash128

## replicated_can_become_leader \{#replicated_can_become_leader\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено значение `true`, реплики реплицируемых таблиц на этом узле будут пытаться стать лидером.

Возможные значения:

- `true`
- `false`

## replicated_deduplication_window \{#replicated_deduplication_window\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "10000"},{"label": "increase default value"}]}]}/>

Количество последних вставленных блоков, для которых ClickHouse Keeper хранит
хэш-суммы для проверки на дубликаты.

Возможные значения:

- Любое положительное целое число.
- 0 (отключить дедупликацию)

Команда `Insert` создает один или несколько блоков (частей). Для
[дедупликации вставок](../../engines/table-engines/mergetree-family/replication.md)
при записи в реплицированные таблицы ClickHouse записывает хэш-суммы созданных
частей в ClickHouse Keeper. Хэш-суммы хранятся только для последних
`replicated_deduplication_window` блоков. Более старые хэш-суммы удаляются
из ClickHouse Keeper.

Слишком большое значение параметра `replicated_deduplication_window` замедляет `Insert`,
поскольку требуется сравнивать больше записей. Хэш-сумма вычисляется по
сочетанию имен и типов столбцов и данных вставленной части (потока байт).

## replicated_deduplication_window_for_async_inserts \{#replicated_deduplication_window_for_async_inserts\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Количество последних асинхронно вставленных блоков, для которых ClickHouse Keeper
хранит хеш-суммы для проверки на дубликаты.

Возможные значения:

- Любое положительное целое число.
- 0 (отключить дедупликацию для async_inserts)

Команда [Async Insert](/operations/settings/settings#async_insert)
кэшируется в одном или нескольких блоках (частях). Для [дедупликации вставок](/engines/table-engines/mergetree-family/replication),
при записи в реплицируемые таблицы ClickHouse записывает хеш-суммы каждой
вставки в ClickHouse Keeper. Хеш-суммы хранятся только для последних
`replicated_deduplication_window_for_async_inserts` блоков. Самые старые хеш-
суммы удаляются из ClickHouse Keeper.
Большое значение `replicated_deduplication_window_for_async_inserts` замедляет
Async Inserts, потому что необходимо сравнивать больше записей.
Хеш-сумма вычисляется из комбинации имен и типов полей
и данных вставки (потока байт).

## replicated_deduplication_window_seconds \{#replicated_deduplication_window_seconds\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3600"},{"label": "decrease default value"}]}]}/>

Количество секунд, по истечении которых хеш‑суммы вставленных блоков
удаляются из ClickHouse Keeper.

Возможные значения:

- Любое положительное целое число.

Аналогично [replicated_deduplication_window](#replicated_deduplication_window),
`replicated_deduplication_window_seconds` задаёт, как долго хранить хеш‑суммы
блоков для дедупликации вставок. Хеш‑суммы старше
`replicated_deduplication_window_seconds` удаляются из ClickHouse Keeper,
даже если они меньше, чем `replicated_deduplication_window`.

Отсчёт времени ведётся относительно времени самой последней записи, а не
реального (wall‑clock) времени. Если это единственная запись, она будет храниться
бессрочно.

## replicated_deduplication_window_seconds_for_async_inserts \{#replicated_deduplication_window_seconds_for_async_inserts\}

<SettingsInfoBlock type="UInt64" default_value="604800" />

Количество секунд, по истечении которых хеш-суммы асинхронных вставок
удаляются из ClickHouse Keeper.

Возможные значения:

- Любое положительное целое число.

Аналогично [replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts),
`replicated_deduplication_window_seconds_for_async_inserts` задает,
как долго следует хранить хеш-суммы блоков для дедупликации асинхронных вставок. Хеш-суммы,
старше `replicated_deduplication_window_seconds_for_async_inserts`,
удаляются из ClickHouse Keeper, даже если они меньше, чем
`replicated_deduplication_window_for_async_inserts`.

Время отсчитывается относительно времени самой последней записи, а не
реального времени. Если это единственная запись, она будет храниться бесконечно долго.

## replicated_fetches_http_connection_timeout \{#replicated_fetches_http_connection_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

Устаревшая настройка, не имеет эффекта.

## replicated_fetches_http_receive_timeout \{#replicated_fetches_http_receive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

Устаревший параметр, не оказывает никакого эффекта.

## replicated_fetches_http_send_timeout \{#replicated_fetches_http_send_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />

Устаревший параметр, не используется.

## replicated_max_mutations_in_one_entry \{#replicated_max_mutations_in_one_entry\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество команд мутаций, которые могут быть объединены и выполнены
в одной записи MUTATE_PART (0 — без ограничений)

## replicated_max_parallel_fetches \{#replicated_max_parallel_fetches\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устаревшая настройка, не используется.

## replicated_max_parallel_fetches_for_host \{#replicated_max_parallel_fetches_for_host\}

<SettingsInfoBlock type="UInt64" default_value="15" />

Устаревший параметр, сейчас не используется.

## replicated_max_parallel_fetches_for_table \{#replicated_max_parallel_fetches_for_table\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устаревший параметр, не используется.

## replicated_max_parallel_sends \{#replicated_max_parallel_sends\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устаревший параметр, не оказывает никакого эффекта.

## replicated_max_parallel_sends_for_table \{#replicated_max_parallel_sends_for_table\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устаревшая настройка. Не используется.

## replicated_max_ratio_of_wrong_parts \{#replicated_max_ratio_of_wrong_parts\}

<SettingsInfoBlock type="Float" default_value="0.5" />

Если отношение количества неверных частей к общему числу частей меньше этого значения, запуск разрешён.

Возможные значения:

- Float, 0.0 - 1.0

## search_orphaned_parts_disks \{#search_orphaned_parts_disks\}

<SettingsInfoBlock type="SearchOrphanedPartsDisks" default_value="any" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "any"},{"label": "New setting"}]}]}/>

ClickHouse сканирует все диски в поисках осиротевших частей при любом выполнении команд ATTACH или CREATE TABLE,
чтобы не допустить пропуска частей данных на неопределённых (не включённых в политику) дисках.
Осиротевшие части появляются в результате потенциально небезопасной переконфигурации хранилища, например, если диск был исключён из политики хранения.
Этот параметр ограничивает перечень дисков для поиска по характеристикам дисков.

Возможные значения:

- any — область поиска не ограничена.
- local — область поиска ограничена локальными дисками.
- none — пустая область, поиск не выполняется.

## serialization_info_version \{#serialization_info_version\}

<SettingsInfoBlock type="MergeTreeSerializationInfoVersion" default_value="with_types" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_types"},{"label": "Переход на более новый формат, допускающий пользовательскую сериализацию строк"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "basic"},{"label": "Новая настройка"}]}]}/>

Версия сведений о сериализации, используемая при записи `serialization.json`.
Эта настройка требуется для обеспечения совместимости во время обновления кластера.

Возможные значения:

- `basic` — базовый формат.
- `with_types` — формат с дополнительным полем `types_serialization_versions`, позволяющим использовать версии сериализации для каждого типа.
Это делает настройки, такие как `string_serialization_version`, применимыми.

Во время поэтапного обновления кластера установите значение `basic`, чтобы новые серверы создавали
части, совместимые со старыми серверами. После завершения обновления
переключитесь на `WITH_TYPES`, чтобы включить версии сериализации для каждого типа.

## shared_merge_tree_activate_coordinated_merges_tasks \{#shared_merge_tree_activate_coordinated_merges_tasks\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-2","items": [{"label": "25.8"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-3","items": [{"label": "25.7"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-4","items": [{"label": "25.6"},{"label": "0"},{"label": "New settings"}]}, {"id": "row-5","items": [{"label": "25.10"},{"label": "0"},{"label": "New settings"}]}]}/>

Включает перепланирование задач согласованных слияний. Это может быть полезно даже когда
shared_merge_tree_enable_coordinated_merges=0, поскольку позволяет собирать статистику
координатора слияний и помогает при холодном старте.

## shared_merge_tree_create_per_replica_metadata_nodes \{#shared_merge_tree_create_per_replica_metadata_nodes\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Сокращение объёма метаданных в Keeper."}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "1"},{"label": "Синхронизация с Cloud"}]}]}/>

Включает создание узлов /metadata и /columns в ZooKeeper для каждой реплики.
Доступно только в ClickHouse Cloud.

## shared_merge_tree_disable_merges_and_mutations_assignment \{#shared_merge_tree_disable_merges_and_mutations_assignment\}

<SettingsInfoBlock type="Bool" default_value="0" />

Останавливает назначение слияний и мутаций для shared MergeTree. Доступно только в ClickHouse Cloud

## shared_merge_tree_empty_partition_lifetime \{#shared_merge_tree_empty_partition_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="86400" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "86400"},{"label": "Новая настройка"}]}]}/>

В течение какого времени (в секундах) партиция будет храниться в Keeper, если она не содержит частей.

## shared_merge_tree_enable_automatic_empty_partitions_cleanup \{#shared_merge_tree_enable_automatic_empty_partitions_cleanup\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает очистку записей Keeper для пустых партиций.

## shared_merge_tree_enable_coordinated_merges \{#shared_merge_tree_enable_coordinated_merges\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает стратегию координированных слияний

## shared_merge_tree_enable_keeper_parts_extra_data \{#shared_merge_tree_enable_keeper_parts_extra_data\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Включает запись атрибутов в виртуальные части и фиксацию блоков в Keeper

## shared_merge_tree_enable_outdated_parts_check \{#shared_merge_tree_enable_outdated_parts_check\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

Включает проверку устаревших частей. Доступно только в ClickHouse Cloud.

## shared_merge_tree_idle_parts_update_seconds \{#shared_merge_tree_idle_parts_update_seconds\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "3600"},{"label": "Cloud sync"}]}]}/>

Интервал в секундах, с которым части обновляются без срабатывания наблюдения ZooKeeper
в shared merge tree. Доступно только в ClickHouse Cloud

## shared_merge_tree_initial_parts_update_backoff_ms \{#shared_merge_tree_initial_parts_update_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "50"},{"label": "New setting"}]}]}/>

Начальный интервал ожидания (backoff) перед обновлением частей. Доступна только в ClickHouse Cloud

## shared_merge_tree_interserver_http_connection_timeout_ms \{#shared_merge_tree_interserver_http_connection_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "100"},{"label": "New setting"}]}]}/>

Таймауты межсерверных HTTP‑подключений. Настройка доступна только в ClickHouse Cloud

## shared_merge_tree_interserver_http_timeout_ms \{#shared_merge_tree_interserver_http_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10000"},{"label": "Cloud sync"}]}]}/>

Тайм-ауты HTTP-взаимодействия между серверами. Доступно только в ClickHouse
Cloud

## shared_merge_tree_leader_update_period_random_add_seconds \{#shared_merge_tree_leader_update_period_random_add_seconds\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

Добавляет равномерно распределённую случайную величину от 0 до x секунд к
shared_merge_tree_leader_update_period, чтобы избежать эффекта
лавинообразного одновременного доступа (thundering herd). Параметр доступен только в ClickHouse Cloud.

## shared_merge_tree_leader_update_period_seconds \{#shared_merge_tree_leader_update_period_seconds\}

<SettingsInfoBlock type="UInt64" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "30"},{"label": "Cloud sync"}]}]}/>

Максимальный интервал между повторами проверки лидерства при обновлении частей. Доступно только в ClickHouse Cloud.

## shared_merge_tree_max_outdated_parts_to_process_at_once \{#shared_merge_tree_max_outdated_parts_to_process_at_once\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Cloud sync"}]}]}/>

Максимальное количество устаревших частей, удаление которых лидер попытается подтвердить за один HTTP-запрос. Доступно только в ClickHouse Cloud.

## shared_merge_tree_max_parts_update_backoff_ms \{#shared_merge_tree_max_parts_update_backoff_ms\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "5000"},{"label": "New setting"}]}]}/>

Максимальное время ожидания перед обновлением частей. Доступно только в ClickHouse Cloud.

## shared_merge_tree_max_parts_update_leaders_in_total \{#shared_merge_tree_max_parts_update_leaders_in_total\}

<SettingsInfoBlock type="UInt64" default_value="6" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "6"},{"label": "Cloud sync"}]}]}/>

Максимальное общее количество лидеров обновления частей. Доступно только в ClickHouse Cloud.

## shared_merge_tree_max_parts_update_leaders_per_az \{#shared_merge_tree_max_parts_update_leaders_per_az\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "2"},{"label": "Cloud sync"}]}]}/>

Максимальное число лидеров обновления частей. Параметр доступен только в ClickHouse Cloud.

## shared_merge_tree_max_replicas_for_parts_deletion \{#shared_merge_tree_max_replicas_for_parts_deletion\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

Максимальное число реплик, которые могут участвовать в удалении частей (killer thread). Доступно только в ClickHouse Cloud.

## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range \{#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range\}

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "5"},{"label": "Cloud sync"}]}]}/>

Максимальное число реплик, которые будут пытаться назначать потенциально конфликтующие слияния (позволяет избежать избыточных конфликтов при назначении слияний). Значение 0 означает отключение. Доступно только в ClickHouse Cloud.

## shared_merge_tree_max_suspicious_broken_parts \{#shared_merge_tree_max_suspicious_broken_parts\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Максимальное допустимое количество повреждённых частей для SMT; при превышении автоматическое отсоединение запрещается"}]}]}/>

Максимальное допустимое количество повреждённых частей для SMT; при превышении автоматическое отсоединение запрещается.

## shared_merge_tree_max_suspicious_broken_parts_bytes \{#shared_merge_tree_max_suspicious_broken_parts_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Максимальный суммарный размер всех повреждённых частей для SMT; если превышен — автоматическое отсоединение запрещается"}]}]}/>

Максимальный суммарный размер всех повреждённых частей для SMT; если превышен — автоматическое отсоединение запрещается.

## shared_merge_tree_memo_ids_remove_timeout_seconds \{#shared_merge_tree_memo_ids_remove_timeout_seconds\}

<SettingsInfoBlock type="Int64" default_value="1800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1800"},{"label": "Cloud sync"}]}]}/>

Время хранения идентификаторов мемоизации вставок, чтобы избежать некорректных действий при повторных попытках вставки. Доступно только в ClickHouse Cloud

## shared_merge_tree_merge_coordinator_election_check_period_ms \{#shared_merge_tree_merge_coordinator_election_check_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "30000"},{"label": "New setting"}]}]}/>

Интервал между запусками потока выборов координатора операций слияния

## shared_merge_tree_merge_coordinator_factor \{#shared_merge_tree_merge_coordinator_factor\}

<BetaBadge/>

<SettingsInfoBlock type="Float" default_value="1.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1.100000023841858"},{"label": "Новая настройка"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "1.100000023841858"},{"label": "Уменьшено время ожидания координатора после загрузки"}]}]}/>

Коэффициент изменения задержки потока координатора

## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms \{#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

Как часто координатор слияний должен выполнять синхронизацию с ZooKeeper, чтобы получать обновлённые метаданные

## shared_merge_tree_merge_coordinator_max_merge_request_size \{#shared_merge_tree_merge_coordinator_max_merge_request_size\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "20"},{"label": "New setting"}]}]}/>

Количество слияний, которые координатор может единовременно запросить у MergerMutator

## shared_merge_tree_merge_coordinator_max_period_ms \{#shared_merge_tree_merge_coordinator_max_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "New setting"}]}]}/>

Максимальное время между запусками потока координатора слияний

## shared_merge_tree_merge_coordinator_merges_prepare_count \{#shared_merge_tree_merge_coordinator_merges_prepare_count\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

Количество заданий слияния, которые координатор должен подготовить и распределить между рабочими узлами

## shared_merge_tree_merge_coordinator_min_period_ms \{#shared_merge_tree_merge_coordinator_min_period_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

Минимальный интервал между запусками потока координатора слияний

## shared_merge_tree_merge_worker_fast_timeout_ms \{#shared_merge_tree_merge_worker_fast_timeout_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100"},{"label": "New setting"}]}]}/>

Таймаут, который поток merge worker будет использовать, когда ему требуется обновить своё состояние после немедленного действия

## shared_merge_tree_merge_worker_regular_timeout_ms \{#shared_merge_tree_merge_worker_regular_timeout_ms\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "10000"},{"label": "Новая настройка"}]}]}/>

Время между запусками потока рабочего процесса слияния

## shared_merge_tree_outdated_parts_group_size \{#shared_merge_tree_outdated_parts_group_size\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "2"},{"label": "New setting"}]}]}/>

Сколько реплик будет входить в одну и ту же группу rendezvous-хэша при очистке устаревших частей.
Эта настройка доступна только в ClickHouse Cloud.

## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations \{#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations\}

<SettingsInfoBlock type="Float" default_value="0.5" />

Повторно загружает предикат слияния в задаче выбора для операций merge/mutate, когда отношение `<candidate
partitions for mutations only (partitions that cannot be merged)>/<candidate
partitions for mutations>` превышает значение настройки. Доступно только в ClickHouse Cloud.

## shared_merge_tree_parts_load_batch_size \{#shared_merge_tree_parts_load_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="32" />

Количество одновременно планируемых заданий выборки метаданных частей. Доступно только в ClickHouse Cloud.

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms \{#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

Время, в течение которого локально объединённая часть хранится без запуска нового слияния, включающего
эту часть. Даёт другим репликам возможность забрать эту часть и запустить это слияние.
Доступно только в ClickHouse Cloud.

## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold \{#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000000"},{"label": "Cloud sync"}]}]}/>

Минимальный размер части (в строках), при котором откладывается назначение следующего слияния сразу после её локального слияния. Доступно только в ClickHouse Cloud.

## shared_merge_tree_range_for_merge_window_size \{#shared_merge_tree_range_for_merge_window_size\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "10"},{"label": "Cloud sync"}]}]}/>

Время, в течение которого локально слитая часть хранится без запуска нового слияния,
включающего эту часть. Это даёт другим репликам возможность получить часть и
запустить это слияние.
Доступно только в ClickHouse Cloud

## shared_merge_tree_read_virtual_parts_from_leader \{#shared_merge_tree_read_virtual_parts_from_leader\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

По возможности читать виртуальные части с лидера. Доступно только в ClickHouse Cloud

## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas \{#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка для получения данных частей из других реплик"}]}]}/>

Если настройка включена, все реплики пытаются получить данные частей, находящиеся в памяти (например, первичный ключ, информацию о партиции и т.д.), из других реплик, где они уже есть.

## shared_merge_tree_update_replica_flags_delay_ms \{#shared_merge_tree_update_replica_flags_delay_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "Новая настройка"}]}]}/>

Как часто реплика будет пытаться перезагружать свои флаги по фоновому расписанию.

## shared_merge_tree_use_metadata_hints_cache \{#shared_merge_tree_use_metadata_hints_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Cloud sync"}]}]}/>

Разрешает запрашивать подсказки кеша файловой системы (FS cache) из кеша в памяти на других репликах. Доступно только в ClickHouse Cloud.

## shared_merge_tree_use_outdated_parts_compact_format \{#shared_merge_tree_use_outdated_parts_compact_format\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "Enable outdated parts v3 by default"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Cloud sync"}]}]}/>

Использовать компактный формат для устаревших частей: уменьшает нагрузку на Keeper, улучшает обработку устаревших частей. Доступно только в ClickHouse Cloud.

## shared_merge_tree_use_too_many_parts_count_from_virtual_parts \{#shared_merge_tree_use_too_many_parts_count_from_virtual_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Синхронизация с Cloud"}]}]}/>

Если включено, счётчик превышения числа частей будет опираться на общие данные в Keeper, а не на состояние локальной реплики. Доступно только в ClickHouse Cloud.

## shared_merge_tree_virtual_parts_discovery_batch \{#shared_merge_tree_virtual_parts_discovery_batch\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

Сколько операций обнаружения партиций следует объединять в один пакет

## simultaneous_parts_removal_limit \{#simultaneous_parts_removal_limit\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если есть много устаревших частей, поток очистки попытается удалить до
`simultaneous_parts_removal_limit` частей за одну итерацию.
Значение `simultaneous_parts_removal_limit`, установленное в `0`, означает отсутствие ограничения.

## sleep_before_commit_local_part_in_replicated_table_ms \{#sleep_before_commit_local_part_in_replicated_table_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Используется для тестирования. Не изменяйте этот параметр.

## sleep_before_loading_outdated_parts_ms \{#sleep_before_loading_outdated_parts_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Используется только для тестирования. Не изменяйте.

## storage_policy \{#storage_policy\}

<SettingsInfoBlock type="String" default_value="default" />

Имя политики хранения на дисках

## string_serialization_version \{#string_serialization_version\}

<SettingsInfoBlock type="MergeTreeStringSerializationVersion" default_value="with_size_stream" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "with_size_stream"},{"label": "Переход на новый формат с отдельным хранением размеров"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "single_stream"},{"label": "Новая настройка"}]}]}/>

Управляет форматом сериализации столбцов `String` верхнего уровня.

Эта настройка действует только в том случае, если `serialization_info_version` имеет значение "with_types".
Если установлено значение `with_size_stream`, столбцы `String` верхнего уровня сериализуются с отдельным
подстолбцом `.size`, в котором хранятся длины строк, а не во встроенном виде. Это позволяет использовать реальные подстолбцы
`.size` и может повысить эффективность сжатия.

Вложенные типы `String` (например, внутри `Nullable`, `LowCardinality`, `Array` или `Map`)
этой настройкой не затрагиваются, за исключением случаев, когда они встречаются в `Tuple`.

Возможные значения:

- `single_stream` — использовать стандартный формат сериализации со встроенными размерами.
- `with_size_stream` — использовать отдельный поток размеров для столбцов `String` верхнего уровня.

## table_disk \{#table_disk\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

Это диск таблицы, путь/endpoint должен указывать на данные таблицы, а не на
данные базы данных. Может быть установлено только для s3_plain/s3_plain_rewritable/web.

## temporary_directories_lifetime \{#temporary_directories_lifetime\}

<SettingsInfoBlock type="Seconds" default_value="86400" />

Сколько секунд хранить директории tmp_*. Не следует уменьшать это значение,
поскольку слияния и мутации данных могут не работать при слишком малом значении этого
SETTING.

## try_fetch_recompressed_part_timeout \{#try_fetch_recompressed_part_timeout\}

<SettingsInfoBlock type="Seconds" default_value="7200" />

Тайм-аут (в секундах) перед началом слияния с перекомпрессией. В течение этого
времени ClickHouse пытается получить перекомпрессированную часть с реплики, которой
было назначено это слияние с перекомпрессией.

Перекомпрессия в большинстве случаев работает медленно, поэтому до истечения этого
тайм-аута слияние с перекомпрессией не запускается: вместо этого ClickHouse пытается
получить перекомпрессированную часть с реплики, которой было назначено это слияние.

Возможные значения:

- Любое положительное целое число.

## ttl_only_drop_parts \{#ttl_only_drop_parts\}

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, будут ли части данных в таблицах MergeTree полностью удаляться, когда срок действия всех строк в этой части истёк в соответствии с их настройками `TTL`.

Когда `ttl_only_drop_parts` отключён (по умолчанию), удаляются только те строки, срок действия которых истёк на основании их настроек TTL.

Когда `ttl_only_drop_parts` включён, вся часть удаляется, если срок действия всех строк в этой части истёк в соответствии с их настройками `TTL`.

## use_adaptive_write_buffer_for_dynamic_subcolumns \{#use_adaptive_write_buffer_for_dynamic_subcolumns\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает использование адаптивных буферов записи при записи динамических подстолбцов для уменьшения расхода памяти

## use_async_block_ids_cache \{#use_async_block_ids_cache\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если включено, хэш-суммы асинхронных вставок кэшируются.

Возможные значения:

- `true`
- `false`

Блок, содержащий несколько асинхронных вставок, сгенерирует несколько хэш-сумм.
Когда часть вставок дублируется, Keeper вернёт только одну
повторяющуюся хэш-сумму за один RPC, что приведёт к лишним повторным RPC-вызовам.
Этот кэш будет отслеживать путь, по которому в Keeper хранятся хэш-суммы. Если в Keeper обнаруживаются обновления,
кэш обновится как можно быстрее, чтобы мы могли отфильтровать
дублирующиеся вставки в памяти.

## use_compact_variant_discriminators_serialization \{#use_compact_variant_discriminators_serialization\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает компактный режим двоичной сериализации дискриминаторов в типе данных Variant.
Этот режим позволяет использовать значительно меньше памяти для хранения дискриминаторов
в частях, когда преимущественно используется один вариант или много значений NULL.

## use_const_adaptive_granularity \{#use_const_adaptive_granularity\}

<SettingsInfoBlock type="Bool" default_value="0" />

Всегда использовать постоянную гранулярность для всей части данных. Это позволяет сжимать в памяти значения гранулярности индекса. Может быть полезно при экстремально больших нагрузках с узкими таблицами.

## use_metadata_cache \{#use_metadata_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

Устаревший параметр, не оказывает никакого эффекта.

## use_minimalistic_checksums_in_zookeeper \{#use_minimalistic_checksums_in_zookeeper\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать компактный формат (десятки байт) для контрольных сумм частей в ZooKeeper вместо
обычного формата (десятки КБ). Перед включением убедитесь, что все реплики поддерживают
новый формат.

## use_minimalistic_part_header_in_zookeeper \{#use_minimalistic_part_header_in_zookeeper\}

<SettingsInfoBlock type="Bool" default_value="1" />

Способ хранения заголовков частей данных в ZooKeeper. При включении настройки ZooKeeper
хранит меньше данных. Подробности см. [здесь](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper).

## use_primary_key_cache \{#use_primary_key_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Использовать кэш для первичного индекса
вместо хранения всех индексов в памяти. Может быть полезно для очень больших таблиц.

## vertical_merge_algorithm_min_bytes_to_activate \{#vertical_merge_algorithm_min_bytes_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный (приблизительный) несжатый размер объединяемых частей в байтах для активации
вертикального алгоритма слияния.

## vertical_merge_algorithm_min_columns_to_activate \{#vertical_merge_algorithm_min_columns_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="11" />

Минимальное количество столбцов, не входящих в первичный ключ, для активации вертикального алгоритма слияния.

## vertical_merge_algorithm_min_rows_to_activate \{#vertical_merge_algorithm_min_rows_to_activate\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

Минимальное (приблизительное) суммарное количество строк
в сливаемых частях для активации вертикального алгоритма слияния.

## vertical_merge_optimize_lightweight_delete \{#vertical_merge_optimize_lightweight_delete\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

Если параметр включён, легковесное удаление оптимизируется при вертикальном слиянии.

## vertical_merge_remote_filesystem_prefetch \{#vertical_merge_remote_filesystem_prefetch\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если имеет значение `true`, при слиянии выполняется предварительная выборка данных с удалённой файловой системы для следующего столбца

## wait_for_unique_parts_send_before_shutdown_ms \{#wait_for_unique_parts_send_before_shutdown_ms\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Перед завершением работы таблица будет ждать заданное время, чтобы уникальные части
(существующие только на текущей реплике) успели быть забраны другими репликами (0 означает,
что ожидание отключено).

## write_ahead_log_bytes_to_fsync \{#write_ahead_log_bytes_to_fsync\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />

Устаревшая настройка, не используется.

## write_ahead_log_interval_ms_to_fsync \{#write_ahead_log_interval_ms_to_fsync\}

<SettingsInfoBlock type="UInt64" default_value="100" />

Устаревший параметр, не используется.

## write_ahead_log_max_bytes \{#write_ahead_log_max_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Устаревший параметр, сейчас не используется.

## write_final_mark \{#write_final_mark\}

<SettingsInfoBlock type="Bool" default_value="1" />

Устаревшая настройка. Ничего не делает.

## write_marks_for_substreams_in_compact_parts \{#write_marks_for_substreams_in_compact_parts\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "По умолчанию включена запись меток для подпотоков в компактных частях"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Включает запись меток для каждого подпотока вместо каждого столбца в компактных частях.
Это позволяет эффективно читать отдельные подстолбцы из части данных.

Например, столбец `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` сериализуется в следующие подпотоки:

- `t.a` — для данных типа String элемента кортежа `a`
- `t.b` — для данных типа UInt32 элемента кортежа `b`
- `t.c.size0` — для размеров массива элемента кортежа `c`
- `t.c.null` — для карты null-значений вложенных элементов массива элемента кортежа `c`
- `t.c` — для данных типа UInt32 вложенных элементов массива элемента кортежа `c`

Когда эта настройка включена, метка записывается для каждого из этих 5 подпотоков. Это означает, что при необходимости можно читать
данные каждого отдельного подпотока из гранулы по отдельности. Например, если нужно прочитать подстолбец `t.c`, будут прочитаны только данные
подпотоков `t.c.size0`, `t.c.null` и `t.c`, и не будут прочитаны данные из подпотоков `t.a` и `t.b`. Когда эта настройка отключена,
метка записывается только для столбца верхнего уровня `t`, что означает, что из гранулы всегда будут читаться все данные столбца, даже если нужны только данные отдельных подпотоков.

## zero_copy_concurrent_part_removal_max_postpone_ratio \{#zero_copy_concurrent_part_removal_max_postpone_ratio\}

<SettingsInfoBlock type="Float" default_value="0.05" />

Максимальный процент частей верхнего уровня, удаление которых можно отложить, чтобы получить более мелкие независимые диапазоны. Не рекомендуется изменять это значение.

## zero_copy_concurrent_part_removal_max_split_times \{#zero_copy_concurrent_part_removal_max_split_times\}

<SettingsInfoBlock type="UInt64" default_value="5" />

Максимальная глубина рекурсии для разбиения независимых диапазонов устаревших частей на более мелкие поддиапазоны. Не рекомендуется изменять значение.

## zero_copy_merge_mutation_min_parts_size_sleep_before_lock \{#zero_copy_merge_mutation_min_parts_size_sleep_before_lock\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Если включена zero-copy репликация, подождать случайное время перед попыткой
захвата блокировки в зависимости от размера частей для merge или mutation

## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock \{#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

Если включена репликация zero-copy, засыпать на случайное время до 500 мс
перед попыткой взять блокировку на слияние или мутацию.

## zookeeper_session_expiration_check_period \{#zookeeper_session_expiration_check_period\}

<SettingsInfoBlock type="Seconds" default_value="60" />

Период проверки истечения срока действия сессии ZooKeeper (в секундах).

Возможные значения:

- Любое положительное целое число.