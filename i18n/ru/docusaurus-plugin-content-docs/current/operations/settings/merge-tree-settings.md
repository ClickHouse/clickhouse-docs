---
description: 'Настройки MergeTree, заданные в `system.merge_tree_settings`'
slug: /operations/settings/merge-tree-settings
title: 'Настройки таблиц MergeTree'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

Системная таблица `system.merge_tree_settings` показывает глобальные настройки MergeTree.

Настройки MergeTree могут быть заданы в секции `merge_tree` конфигурационного файла сервера или указаны для каждой таблицы `MergeTree` отдельно — в секции `SETTINGS` оператора `CREATE TABLE`.

Пример изменения настройки `max_suspicious_broken_parts`:

Настройте значение по умолчанию для всех таблиц `MergeTree` в конфигурационном файле сервера:

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

-- сброс до глобального значения по умолчанию (значение из system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```


## Настройки MergeTree {#mergetree-settings}

<!-- Настройки ниже генерируются автоматически скриптом, расположенным по адресу
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
-->

## adaptive_write_buffer_initial_size {#adaptive_write_buffer_initial_size}

<SettingsInfoBlock type='UInt64' default_value='16384' />

Начальный размер адаптивного буфера записи


## add_implicit_sign_column_constraint_for_collapsing_engine {#add_implicit_sign_column_constraint_for_collapsing_engine}

<SettingsInfoBlock type='Bool' default_value='0' />

Если включено, добавляет неявное ограничение для столбца `sign` таблиц CollapsingMergeTree
или VersionedCollapsingMergeTree, допускающее только корректные значения (`1` и `-1`).


## add_minmax_index_for_numeric_columns {#add_minmax_index_for_numeric_columns}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

При включении для всех числовых столбцов таблицы добавляются индексы min-max (индексы с пропуском данных).


## add_minmax_index_for_string_columns {#add_minmax_index_for_string_columns}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

При включении для всех строковых столбцов таблицы добавляются индексы min-max (индексы с пропуском данных).


## allow_coalescing_columns_in_partition_or_order_key {#allow_coalescing_columns_in_partition_or_order_key}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.6" },
        { label: "0" },
        {
          label:
            "Новая настройка, разрешающая использование столбцов слияния в ключе партиционирования или ключе сортировки."
        }
      ]
    }
  ]}
/>

При включении разрешает использование столбцов слияния в таблице CoalescingMergeTree в ключе партиционирования или ключе сортировки.


## allow_experimental_replacing_merge_with_cleanup {#allow_experimental_replacing_merge_with_cleanup}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />

Разрешает экспериментальные слияния CLEANUP для ReplacingMergeTree со столбцом `is_deleted`. При включении позволяет использовать `OPTIMIZE ... FINAL CLEANUP` для ручного слияния всех кусков партиции в один кусок с удалением всех удалённых строк.

Также позволяет включить автоматическое выполнение таких слияний в фоновом режиме с помощью настроек `min_age_to_force_merge_seconds`, `min_age_to_force_merge_on_partition_only` и `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`.


## allow_experimental_reverse_key {#allow_experimental_reverse_key}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "24.12" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

Включает поддержку порядка сортировки по убыванию в ключах сортировки MergeTree. Эта
настройка особенно полезна для анализа временных рядов и запросов Top-N,
позволяя хранить данные в обратном хронологическом порядке для оптимизации
производительности запросов.

При включенной настройке `allow_experimental_reverse_key` можно определять порядок сортировки
по убыванию в предложении `ORDER BY` таблицы MergeTree. Это позволяет использовать
более эффективные оптимизации `ReadInOrder` вместо `ReadInReverseOrder`
для запросов с сортировкой по убыванию.

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

При использовании `ORDER BY time DESC` в запросе применяется `ReadInOrder`.

**Значение по умолчанию:** false


## allow_floating_point_partition_key {#allow_floating_point_partition_key}

<SettingsInfoBlock type='Bool' default_value='0' />

Разрешает использование чисел с плавающей точкой в качестве ключа партиционирования.

Возможные значения:

- `0` — Ключ партиционирования с плавающей точкой запрещён.
- `1` — Ключ партиционирования с плавающей точкой разрешён.


## allow_nullable_key {#allow_nullable_key}

<SettingsInfoBlock type='Bool' default_value='0' />

Разрешает использование типов Nullable в качестве первичных ключей.


## allow_part_offset_column_in_projections {#allow_part_offset_column_in_projections}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "1" },
        { label: "Теперь проекции могут использовать колонку _part_offset." }
      ]
    },
    {
      id: "row-2",
      items: [
        { label: "25.5" },
        { label: "0" },
        {
          label:
            "Новая настройка, предотвращает создание проекций с колонкой смещения родительской части до её стабилизации."
        }
      ]
    }
  ]}
/>

Разрешает использование колонки '\_part_offset' в SELECT-запросах проекций.


## allow_reduce_blocking_parts_task {#allow_reduce_blocking_parts_task}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.2" },
        { label: "1" },
        {
          label:
            "Теперь SMT по умолчанию удаляет устаревшие блокирующие части из ZooKeeper"
        }
      ]
    },
    {
      id: "row-2",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Синхронизация с Cloud" }]
    }
  ]}
/>

Фоновая задача, которая уменьшает количество блокирующих частей для таблиц с движком Shared MergeTree.
Только в ClickHouse Cloud


## allow_remote_fs_zero_copy_replication {#allow_remote_fs_zero_copy_replication}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />

Не используйте эту настройку в промышленной эксплуатации, так как она ещё не готова.


## allow_summing_columns_in_partition_or_order_key {#allow_summing_columns_in_partition_or_order_key}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.4" },
        { label: "0" },
        {
          label:
            "Новая настройка, позволяющая использовать суммируемые столбцы в ключе партиционирования или ключе сортировки"
        }
      ]
    }
  ]}
/>

При включении позволяет использовать суммируемые столбцы таблицы SummingMergeTree в ключе партиционирования или ключе сортировки.


## allow_suspicious_indices {#allow_suspicious_indices}

<SettingsInfoBlock type='Bool' default_value='0' />

Отклонять первичные/вторичные индексы и ключи сортировки с одинаковыми выражениями


## allow_vertical_merges_from_compact_to_wide_parts {#allow_vertical_merges_from_compact_to_wide_parts}

<SettingsInfoBlock type='Bool' default_value='1' />

Разрешает вертикальные слияния компактных кусков с широкими кусками. Эта настройка должна иметь одинаковое значение на всех репликах.


## alter_column_secondary_index_mode {#alter_column_secondary_index_mode}

<SettingsInfoBlock
  type='AlterColumnSecondaryIndexMode'
  default_value='rebuild'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.12" },
        { label: "rebuild" },
        {
          label:
            "Изменено поведение для разрешения ALTER `column` при наличии зависимых вторичных индексов"
        }
      ]
    }
  ]}
/>

Определяет, разрешать ли команды `ALTER`, изменяющие столбцы, покрытые вторичными индексами, и какое действие выполнять в случае их разрешения. По умолчанию такие команды `ALTER` разрешены, и индексы перестраиваются.

Возможные значения:

- `rebuild` (по умолчанию): Перестраивает все вторичные индексы, затронутые столбцом в команде `ALTER`.
- `throw`: Предотвращает любые операции `ALTER` для столбцов, покрытых вторичными индексами, выбрасывая исключение.
- `drop`: Удаляет зависимые вторичные индексы. Новые части не будут содержать индексы, что потребует выполнения `MATERIALIZE INDEX` для их повторного создания.
- `compatibility`: Соответствует исходному поведению: `throw` для `ALTER ... MODIFY COLUMN` и `rebuild` для `ALTER ... UPDATE/DELETE`.
- `ignore`: Предназначено для экспертного использования. Оставляет индексы в несогласованном состоянии, что может привести к некорректным результатам запросов.


## always_fetch_merged_part {#always_fetch_merged_part}

<SettingsInfoBlock type='Bool' default_value='0' />

Если установлено значение true, данная реплика никогда не выполняет слияние кусков и всегда загружает слитые куски с других реплик.

Возможные значения:

- true, false


## always_use_copy_instead_of_hardlinks {#always_use_copy_instead_of_hardlinks}

<SettingsInfoBlock type='Bool' default_value='0' />

Всегда копировать данные вместо создания жёстких ссылок при выполнении мутаций, замен, отсоединений и т. д.


## apply_patches_on_merge {#apply_patches_on_merge}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "1" }, { label: "New setting" }]
    }
  ]}
/>

Если значение true, патч-части применяются при слияниях


## assign_part_uuids {#assign_part_uuids}

<SettingsInfoBlock type='Bool' default_value='0' />

При включении каждой новой части данных будет присваиваться уникальный идентификатор.
Перед включением убедитесь, что все реплики поддерживают UUID версии 4.


## async_block_ids_cache_update_wait_ms {#async_block_ids_cache_update_wait_ms}

<SettingsInfoBlock type='Milliseconds' default_value='100' />

Время ожидания обновления async_block_ids_cache на каждой итерации вставки


## async_insert {#async_insert}

<SettingsInfoBlock type='Bool' default_value='0' />

Если установлено значение true, данные из запроса INSERT помещаются в очередь и затем асинхронно записываются в таблицу в фоновом режиме.


## auto_statistics_types {#auto_statistics_types}

<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.10" }, { label: "" }, { label: "Новая настройка" }]
    }
  ]}
/>

Список типов статистики, разделённых запятыми, для автоматического вычисления по всем подходящим столбцам.
Поддерживаемые типы статистики: tdigest, countmin, minmax, uniq.


## background_task_preferred_step_execution_time_ms {#background_task_preferred_step_execution_time_ms}

<SettingsInfoBlock type='Milliseconds' default_value='50' />

Целевое время выполнения одного шага слияния или мутации. Может быть превышено, если выполнение шага занимает больше времени


## cache_populated_by_fetch {#cache_populated_by_fetch}

<SettingsInfoBlock type='Bool' default_value='0' />

:::note
Эта настройка применяется только к ClickHouse Cloud.
:::

Когда `cache_populated_by_fetch` отключена (значение по умолчанию), новые
части данных загружаются в кеш только при выполнении запроса, которому требуются эти
части.

Если включена, `cache_populated_by_fetch` приведёт к тому, что все узлы будут загружать
новые части данных из хранилища в свой кеш без необходимости выполнения запроса для
инициирования такого действия.

**См. также**

- [ignore_cold_parts_seconds](/operations/settings/settings#ignore_cold_parts_seconds)
- [prefer_warmed_unmerged_parts_seconds](/operations/settings/settings#prefer_warmed_unmerged_parts_seconds)
- [cache_warmer_threads](/operations/settings/settings#cache_warmer_threads)


## cache_populated_by_fetch_filename_regexp {#cache_populated_by_fetch_filename_regexp}

<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.6" }, { label: "" }, { label: "Новая настройка" }]
    }
  ]}
/>

:::note
Эта настройка применяется только к ClickHouse Cloud.
:::

Если не пусто, в кэш после получения будут предварительно загружены только файлы, соответствующие этому регулярному выражению (при условии, что включена настройка `cache_populated_by_fetch`).


## check_delay_period {#check_delay_period}

<SettingsInfoBlock type="UInt64" default_value="60" />
Устаревшая настройка, не выполняет никаких действий.
## check_sample_column_is_correct {#check_sample_column_is_correct} 
<SettingsInfoBlock type="Bool" default_value="1" />

Включает проверку при создании таблицы корректности типа данных столбца для сэмплирования или выражения сэмплирования. Тип данных должен быть одним из беззнаковых [целочисленных типов](/sql-reference/data-types/int-uint): `UInt8`, `UInt16`, `UInt32`, `UInt64`.

Возможные значения:

- `true` — Проверка включена.
- `false` — Проверка отключена при создании таблицы.

Значение по умолчанию: `true`.

По умолчанию сервер ClickHouse проверяет при создании таблицы тип данных столбца для сэмплирования или выражения сэмплирования. Если у вас уже есть таблицы с некорректным выражением сэмплирования и вы не хотите, чтобы сервер генерировал исключение при запуске, установите `check_sample_column_is_correct` в `false`.


## clean_deleted_rows {#clean_deleted_rows}

<SettingsInfoBlock type="CleanDeletedRows" default_value="Never" />
Устаревшая настройка, ничего не делает.
## cleanup_delay_period {#cleanup_delay_period} 
<SettingsInfoBlock type="UInt64" default_value="30" />

Минимальный период для очистки старых логов очереди, хешей блоков и партов.


## cleanup_delay_period_random_add {#cleanup_delay_period_random_add}

<SettingsInfoBlock type='UInt64' default_value='10' />

Добавляет равномерно распределённое значение от 0 до x секунд к cleanup_delay_period
для предотвращения эффекта «лавинообразного запроса» и последующей DoS-атаки на ZooKeeper при
очень большом количестве таблиц.


## cleanup_thread_preferred_points_per_iteration {#cleanup_thread_preferred_points_per_iteration}

<SettingsInfoBlock type='UInt64' default_value='150' />

Предпочтительный размер пакета для фоновой очистки (точки — абстрактная единица измерения, при этом 1 точка приблизительно соответствует 1 вставленному блоку).


## cleanup_threads {#cleanup_threads}

<SettingsInfoBlock type="UInt64" default_value="128" />
Устаревшая настройка, ничего не делает.
## columns_and_secondary_indices_sizes_lazy_calculation {#columns_and_secondary_indices_sizes_lazy_calculation} 
<SettingsInfoBlock type="Bool" default_value="1" />
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Новая настройка для отложенного вычисления размеров столбцов и индексов"}]}]}/>

Вычислять размеры столбцов и вторичных индексов отложенно при первом запросе, а не
при инициализации таблицы.


## columns_to_prewarm_mark_cache {#columns_to_prewarm_mark_cache}

Список столбцов для предварительного прогрева кеша засечек (если включено). Пустое значение означает все столбцы


## compact_parts_max_bytes_to_buffer {#compact_parts_max_bytes_to_buffer}

<SettingsInfoBlock type='UInt64' default_value='134217728' />

Доступно только в ClickHouse Cloud. Максимальное количество байтов для записи в
одну полосу компактных частей


## compact_parts_max_granules_to_buffer {#compact_parts_max_granules_to_buffer}

<SettingsInfoBlock type='UInt64' default_value='128' />

Доступно только в ClickHouse Cloud. Максимальное количество гранул для записи в одну полосу компактных частей


## compact_parts_merge_max_bytes_to_prefetch_part {#compact_parts_merge_max_bytes_to_prefetch_part}

<SettingsInfoBlock type='UInt64' default_value='16777216' />

Доступно только в ClickHouse Cloud. Максимальный размер компактной части для её полного чтения в память во время слияния.


## compatibility_allow_sampling_expression_not_in_primary_key {#compatibility_allow_sampling_expression_not_in_primary_key}

<SettingsInfoBlock type='Bool' default_value='0' />

Разрешает создание таблицы с выражением сэмплирования, которое не входит в первичный ключ. Это
необходимо только для временного запуска сервера с некорректными таблицами в целях
обеспечения обратной совместимости.


## compress_marks {#compress_marks}

<SettingsInfoBlock type='Bool' default_value='1' />

Метки поддерживают сжатие, что уменьшает размер файла меток и ускоряет сетевую передачу данных.


## compress_primary_key {#compress_primary_key}

<SettingsInfoBlock type='Bool' default_value='1' />

Включает сжатие первичного ключа, что уменьшает размер файла первичного ключа и ускоряет передачу данных по сети.


## concurrent_part_removal_threshold {#concurrent_part_removal_threshold}

<SettingsInfoBlock type='UInt64' default_value='100' />

Активирует параллельное удаление кусков данных (см. 'max_part_removal_threads'), только если
количество неактивных кусков данных не меньше этого значения.


## deduplicate_merge_projection_mode {#deduplicate_merge_projection_mode}

<SettingsInfoBlock
  type='DeduplicateMergeProjectionMode'
  default_value='throw'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "24.8" },
        { label: "throw" },
        { label: "Запрещает создание несогласованных проекций" }
      ]
    }
  ]}
/>

Определяет, разрешено ли создавать проекции для таблиц с неклассическими движками MergeTree,
то есть отличными от (Replicated, Shared) MergeTree. Опция ignore предназначена исключительно для
обеспечения совместимости и может приводить к некорректным результатам. В остальных случаях, если создание разрешено,
настройка определяет действие при слиянии проекций: удаление (drop) или перестроение (rebuild). Классические
движки MergeTree игнорируют эту настройку. Также управляет командой `OPTIMIZE DEDUPLICATE`,
но действует на все движки семейства MergeTree. Аналогично настройке
`lightweight_mutation_projection_mode`, применяется на уровне куска данных.

Возможные значения:

- `ignore`
- `throw`
- `drop`
- `rebuild`


## default_compression_codec {#default_compression_codec}

<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.4" }, { label: "" }, { label: "Новая настройка" }]
    }
  ]}
/>

Задаёт кодек сжатия по умолчанию, который будет использоваться, если для конкретного столбца в объявлении таблицы кодек не указан.
Порядок выбора кодека сжатия для столбца:

1. Кодек сжатия, указанный для столбца в объявлении таблицы
2. Кодек сжатия, указанный в `default_compression_codec` (данная настройка)
3. Кодек сжатия по умолчанию, указанный в настройках `compression`
   Значение по умолчанию: пустая строка (не задано).


## detach_not_byte_identical_parts {#detach_not_byte_identical_parts}

<SettingsInfoBlock type='Bool' default_value='0' />

Включает или отключает отсоединение куска данных на реплике после слияния или
мутации, если он не является побайтово идентичным кускам данных на других репликах. Если
отключено, кусок данных удаляется. Активируйте эту настройку, если хотите
проанализировать такие куски позже.

Настройка применима к таблицам `MergeTree` с включённой
[репликацией данных](/engines/table-engines/mergetree-family/replacingmergetree).

Возможные значения:

- `0` — Куски удаляются.
- `1` — Куски отсоединяются.


## detach_old_local_parts_when_cloning_replica {#detach_old_local_parts_when_cloning_replica}

<SettingsInfoBlock type='Bool' default_value='1' />

Не удалять старые локальные куски данных при восстановлении утраченной реплики.

Возможные значения:

- `true`
- `false`


## disable_detach_partition_for_zero_copy_replication {#disable_detach_partition_for_zero_copy_replication}

<SettingsInfoBlock type='Bool' default_value='1' />

Отключает запрос DETACH PARTITION для репликации с нулевым копированием.


## disable_fetch_partition_for_zero_copy_replication {#disable_fetch_partition_for_zero_copy_replication}

<SettingsInfoBlock type='Bool' default_value='1' />

Отключает выполнение запроса FETCH PARTITION при репликации с нулевым копированием.


## disable_freeze_partition_for_zero_copy_replication {#disable_freeze_partition_for_zero_copy_replication}

<SettingsInfoBlock type='Bool' default_value='1' />

Отключает запрос FREEZE PARTITION для репликации с нулевым копированием.


## disk {#disk}

Имя диска для хранения данных. Может быть указан вместо политики хранения.


## dynamic_serialization_version {#dynamic_serialization_version}

<SettingsInfoBlock
  type='MergeTreeDynamicSerializationVersion'
  default_value='v2'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "v2" },
        { label: "Добавлена настройка для управления версиями сериализации Dynamic" }
      ]
    }
  ]}
/>

Версия сериализации для типа данных Dynamic. Необходима для совместимости.

Возможные значения:

- `v1`
- `v2`
- `v3`


## enable_block_number_column {#enable_block_number_column}

<SettingsInfoBlock type='Bool' default_value='0' />

Включает постоянное сохранение столбца \_block_number для каждой строки.


## enable_block_offset_column {#enable_block_offset_column}

<SettingsInfoBlock type='Bool' default_value='0' />

Сохраняет виртуальный столбец `_block_number` при слияниях.


## enable_index_granularity_compression {#enable_index_granularity_compression}

<SettingsInfoBlock type='Bool' default_value='1' />

Сжимать значения гранулярности индекса в памяти, если это возможно


## enable_max_bytes_limit_for_min_age_to_force_merge {#enable_max_bytes_limit_for_min_age_to_force_merge}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Новая настройка" }]
    },
    {
      id: "row-2",
      items: [
        { label: "25.1" },
        { label: "0" },
        {
          label:
            "Добавлена новая настройка для ограничения максимального количества байтов для min_age_to_force_merge."
        }
      ]
    }
  ]}
/>

Определяет, должны ли настройки `min_age_to_force_merge_seconds` и
`min_age_to_force_merge_on_partition_only` учитывать настройку
`max_bytes_to_merge_at_max_space_in_pool`.

Возможные значения:

- `true`
- `false`


## enable_mixed_granularity_parts {#enable_mixed_granularity_parts}

<SettingsInfoBlock type='Bool' default_value='1' />

Включает или отключает переход к управлению размером гранул с помощью
настройки `index_granularity_bytes`. До версии 19.11 существовала только
настройка `index_granularity` для ограничения размера гранул. Настройка
`index_granularity_bytes` повышает производительность ClickHouse при
выборке данных из таблиц с большими строками (десятки и сотни мегабайт).
Если у вас есть таблицы с большими строками, можно включить эту настройку
для повышения эффективности запросов `SELECT`.


## enable_replacing_merge_with_cleanup_for_min_age_to_force_merge {#enable_replacing_merge_with_cleanup_for_min_age_to_force_merge}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.3" },
        { label: "0" },
        {
          label:
            "Новая настройка для автоматических слияний с очисткой для ReplacingMergeTree"
        }
      ]
    }
  ]}
/>

Определяет, использовать ли слияния CLEANUP для ReplacingMergeTree при объединении партиций
в одну часть. Требует включения настроек `allow_experimental_replacing_merge_with_cleanup`,
`min_age_to_force_merge_seconds` и `min_age_to_force_merge_on_partition_only`.

Возможные значения:

- `true`
- `false`


## enable_the_endpoint_id_with_zookeeper_name_prefix {#enable_the_endpoint_id_with_zookeeper_name_prefix}

<SettingsInfoBlock type='Bool' default_value='0' />

Включает использование идентификатора конечной точки с префиксом имени ZooKeeper для реплицируемых таблиц семейства MergeTree.


## enable_vertical_merge_algorithm {#enable_vertical_merge_algorithm}

<SettingsInfoBlock type='UInt64' default_value='1' />

Включает использование алгоритма вертикального слияния.


## enforce_index_structure_match_on_partition_manipulation {#enforce_index_structure_match_on_partition_manipulation}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "24.12" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

Если эта настройка включена для целевой таблицы запроса манипуляции с партициями
(`ATTACH/MOVE/REPLACE PARTITION`), индексы и проекции должны полностью
совпадать в исходной и целевой таблицах. В противном случае целевая
таблица может содержать надмножество индексов и проекций исходной таблицы.


## escape_variant_subcolumn_filenames {#escape_variant_subcolumn_filenames}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.11" },
        { label: "1" },
        {
          label:
            "Экранирование специальных символов в именах файлов, создаваемых для подстолбцов типа Variant в Wide-частях"
        }
      ]
    }
  ]}
/>

Экранирование специальных символов в именах файлов, создаваемых для подстолбцов типа данных Variant в Wide-частях таблиц MergeTree. Требуется для обеспечения совместимости.


## exclude_deleted_rows_for_part_size_in_merge {#exclude_deleted_rows_for_part_size_in_merge}

<SettingsInfoBlock type='Bool' default_value='0' />

Если включено, при выборе частей для слияния будет использоваться оценочный фактический размер частей данных (то есть за вычетом строк, удалённых с помощью `DELETE FROM`). Обратите внимание, что данное поведение применяется только к частям данных, затронутым командой `DELETE FROM`, выполненной после включения этой настройки.

Возможные значения:

- `true`
- `false`

**См. также**

- [load_existing_rows_count_for_old_parts](#load_existing_rows_count_for_old_parts)
  настройка


## exclude_materialize_skip_indexes_on_merge {#exclude_materialize_skip_indexes_on_merge}

<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.10" }, { label: "" }, { label: "Новая настройка." }]
    }
  ]}
/>

Исключает указанный список индексов пропуска (разделённый запятыми) из построения и сохранения во время слияний. Не действует, если
[materialize_skip_indexes_on_merge](#materialize_skip_indexes_on_merge) имеет значение false.

Исключённые индексы пропуска всё равно будут построены и сохранены при явном выполнении запроса
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index) или во время операций INSERT в зависимости от
настройки сессии [materialize_skip_indexes_on_insert](/operations/settings/settings.md/#materialize_skip_indexes_on_insert).

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

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- настройка не влияет на операции INSERT

-- idx_a будет исключён из обновления во время фонового или явного слияния через OPTIMIZE TABLE FINAL

-- можно исключить несколько индексов, указав список
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = 'idx_a, idx_b';

-- настройка по умолчанию, индексы не исключаются из обновления во время слияния
ALTER TABLE tab MODIFY SETTING exclude_materialize_skip_indexes_on_merge = '';
```


## execute_merges_on_single_replica_time_threshold {#execute_merges_on_single_replica_time_threshold}

<SettingsInfoBlock type='Seconds' default_value='0' />

Когда значение этой настройки больше нуля, только одна реплика немедленно
начинает слияние, а остальные реплики ожидают в течение указанного времени,
чтобы загрузить результат вместо локального выполнения слияния. Если выбранная
реплика не завершит слияние за указанное время, происходит
возврат к стандартному поведению.

Возможные значения:

- Любое положительное целое число.


## fault_probability_after_part_commit {#fault_probability_after_part_commit}

<SettingsInfoBlock type='Float' default_value='0' />

Для тестирования. Не изменяйте.


## fault_probability_before_part_commit {#fault_probability_before_part_commit}

<SettingsInfoBlock type='Float' default_value='0' />

Для тестирования. Не изменяйте.


## finished_mutations_to_keep {#finished_mutations_to_keep}

<SettingsInfoBlock type='UInt64' default_value='100' />

Количество записей о завершённых мутациях, которые необходимо хранить. Если значение равно нулю, хранятся все записи.


## force_read_through_cache_for_merges {#force_read_through_cache_for_merges}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />

Принудительное чтение через кэш файловой системы для слияний


## fsync_after_insert {#fsync_after_insert}

<SettingsInfoBlock type='Bool' default_value='0' />

Выполнять fsync для каждой вставленной части данных. Значительно снижает производительность
вставок, не рекомендуется использовать с широкими частями данных.


## fsync_part_directory {#fsync_part_directory}

<SettingsInfoBlock type='Bool' default_value='0' />

Выполнять fsync для директории куска после всех операций с куском (запись, переименование и т. д.).


## in_memory_parts_enable_wal {#in_memory_parts_enable_wal}

<SettingsInfoBlock type="Bool" default_value="1" />
Устаревшая настройка, ничего не делает.
## in_memory_parts_insert_sync {#in_memory_parts_insert_sync} 
<SettingsInfoBlock type="Bool" default_value="0" />
Устаревшая настройка, ничего не делает.
## inactive_parts_to_delay_insert {#inactive_parts_to_delay_insert} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество неактивных кусков в одной партиции таблицы превышает
значение `inactive_parts_to_delay_insert`, операция `INSERT` искусственно
замедляется.

:::tip
Полезно в случаях, когда сервер не успевает достаточно быстро очищать куски.
:::

Возможные значения:

- Любое положительное целое число.


## inactive_parts_to_throw_insert {#inactive_parts_to_throw_insert}

<SettingsInfoBlock type='UInt64' default_value='0' />

Если количество неактивных частей в одном разделе превышает значение
`inactive_parts_to_throw_insert`, операция `INSERT` прерывается со следующей
ошибкой:

> "Too many inactive parts (N). Parts cleaning are processing significantly
> slower than inserts" exception."

Возможные значения:

- Любое положительное целое число.


## index_granularity {#index_granularity}

<SettingsInfoBlock type='UInt64' default_value='8192' />

Максимальное количество строк данных между отметками индекса. Иными словами, сколько строк
соответствует одному значению первичного ключа.


## index_granularity_bytes {#index_granularity_bytes}

<SettingsInfoBlock type='UInt64' default_value='10485760' />

Максимальный размер гранул данных в байтах.

Чтобы ограничить размер гранулы только по количеству строк, установите значение `0` (не рекомендуется).


## initialization_retry_period {#initialization_retry_period}

<SettingsInfoBlock type='Seconds' default_value='60' />

Период повтора попыток инициализации таблицы в секундах.


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

По умолчанию облегчённое удаление `DELETE` не работает для таблиц с
проекциями. Это связано с тем, что строки в проекции могут быть затронуты
операцией `DELETE`. Поэтому значение по умолчанию — `throw`. Однако эта
настройка позволяет изменить поведение. При значении `drop` или `rebuild`
удаления будут работать с проекциями. Значение `drop` удалит проекцию, что может
ускорить выполнение текущего запроса за счёт удаления проекции, но
замедлит будущие запросы из-за отсутствия проекции. Значение `rebuild` пересоздаст
проекцию, что может снизить производительность текущего запроса, но
ускорит будущие запросы. Преимущество этих опций в том, что они работают только
на уровне куска данных, то есть проекции в кусках, которые не
затрагиваются, останутся нетронутыми без выполнения каких-либо действий, таких как
удаление или пересоздание.

Возможные значения:

- `throw`
- `drop`
- `rebuild`


## load_existing_rows_count_for_old_parts {#load_existing_rows_count_for_old_parts}

<SettingsInfoBlock type='Bool' default_value='0' />

Если включено вместе с [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge),
количество удалённых строк для существующих кусков данных будет рассчитано при
запуске таблицы. Обратите внимание, что это может замедлить загрузку таблицы при запуске.

Возможные значения:

- `true`
- `false`

**См. также**

- настройка [exclude_deleted_rows_for_part_size_in_merge](#exclude_deleted_rows_for_part_size_in_merge)


## lock_acquire_timeout_for_background_operations {#lock_acquire_timeout_for_background_operations}

<SettingsInfoBlock type='Seconds' default_value='120' />

Для фоновых операций, таких как слияния, мутации и т. д. Количество секунд перед
неудачной попыткой получения блокировок таблицы.


## marks_compress_block_size {#marks_compress_block_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='65536' />

Размер блока сжатия меток — фактический размер сжимаемого блока.


## marks_compression_codec {#marks_compression_codec}

<SettingsInfoBlock type='String' default_value='ZSTD(3)' />

Кодек сжатия, используемый для меток. Метки достаточно малы и кэшируются, поэтому по умолчанию используется сжатие ZSTD(3).


## materialize_skip_indexes_on_merge {#materialize_skip_indexes_on_merge}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1" }, { label: "Новая настройка" }]
    }
  ]}
/>

При включении этой настройки слияния создают и сохраняют индексы пропуска для новых кусков данных.
В противном случае они могут быть созданы/сохранены с помощью явной команды [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index)
или [при выполнении INSERT](/operations/settings/settings.md/#materialize_skip_indexes_on_insert).

См. также [exclude_materialize_skip_indexes_on_merge](#exclude_materialize_skip_indexes_on_merge) для более точного управления.


## materialize_ttl_recalculate_only {#materialize_ttl_recalculate_only}

<SettingsInfoBlock type='Bool' default_value='0' />

Только пересчитывать информацию о TTL при выполнении MATERIALIZE TTL


## max_avg_part_size_for_too_many_parts {#max_avg_part_size_for_too_many_parts}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />

Проверка «слишком много кусков» согласно параметрам `parts_to_delay_insert` и
`parts_to_throw_insert` будет активна только в том случае, если средний размер куска (в
соответствующей партиции) не превышает указанное пороговое значение. Если средний размер
превышает указанное пороговое значение, операции INSERT не будут ни задерживаться, ни
отклоняться. Это позволяет хранить сотни терабайт данных в одной таблице на
одном сервере при условии успешного слияния кусков в более крупные. Данная настройка
не влияет на пороговые значения для неактивных кусков или общего количества кусков.


## max_bytes_to_merge_at_max_space_in_pool {#max_bytes_to_merge_at_max_space_in_pool}

<SettingsInfoBlock type='UInt64' default_value='161061273600' />

Максимальный общий размер кусков данных (в байтах), которые могут быть объединены в один кусок при наличии достаточных ресурсов. Приблизительно соответствует максимально возможному размеру куска, создаваемого автоматическим фоновым слиянием. (Значение 0 отключает слияния)

Возможные значения:

- Любое неотрицательное целое число.

Планировщик слияний периодически анализирует размеры и количество кусков в партициях и при наличии достаточных свободных ресурсов в пуле запускает фоновые слияния. Слияния выполняются до тех пор, пока общий размер исходных кусков не превысит значение `max_bytes_to_merge_at_max_space_in_pool`.

Слияния, инициированные командой [OPTIMIZE FINAL](/sql-reference/statements/optimize), игнорируют параметр `max_bytes_to_merge_at_max_space_in_pool` (учитывается только свободное дисковое пространство).


## max_bytes_to_merge_at_min_space_in_pool {#max_bytes_to_merge_at_min_space_in_pool}

<SettingsInfoBlock type='UInt64' default_value='1048576' />

Максимальный общий размер кусков (в байтах) для объединения в один кусок
при минимальных доступных ресурсах в фоновом пуле.

Возможные значения:

- Любое положительное целое число.

Параметр `max_bytes_to_merge_at_min_space_in_pool` определяет максимальный общий размер
кусков, которые могут быть объединены даже при недостатке доступного дискового пространства (в пуле).
Это необходимо для уменьшения количества мелких кусков и снижения вероятности
ошибок `Too many parts`.
Слияния резервируют дисковое пространство, удваивая общий размер объединяемых кусков.
Таким образом, при небольшом объёме свободного дискового пространства может возникнуть ситуация, когда
свободное место есть, но оно уже зарезервировано выполняющимися крупными слияниями,
из-за чего другие слияния не могут начаться, и количество мелких кусков увеличивается
с каждой вставкой.


## max_cleanup_delay_period {#max_cleanup_delay_period}

<SettingsInfoBlock type='UInt64' default_value='300' />

Максимальный период для очистки старых логов очереди, хешей блоков и партов.


## max_compress_block_size {#max_compress_block_size}

<SettingsInfoBlock type='UInt64' default_value='0' />

Максимальный размер блоков несжатых данных перед сжатием при записи
в таблицу. Эту настройку также можно задать в глобальных настройках
(см. настройку [max_compress_block_size](/operations/settings/merge-tree-settings#max_compress_block_size)). Значение, заданное при создании таблицы, переопределяет глобальное
значение этой настройки.


## max_concurrent_queries {#max_concurrent_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />

Максимальное количество одновременно выполняемых запросов к таблице MergeTree.
Запросы также будут ограничены другими настройками `max_concurrent_queries`.

Возможные значения:

- Положительное целое число.
- `0` — без ограничений.

Значение по умолчанию: `0` (без ограничений).

**Пример**

```xml
<max_concurrent_queries>50</max_concurrent_queries>
```


## max_delay_to_insert {#max_delay_to_insert}

<SettingsInfoBlock type='UInt64' default_value='1' />

Значение в секундах, которое используется для расчёта задержки `INSERT`, если
количество активных кусков данных в одной партиции превышает значение
[parts_to_delay_insert](#parts_to_delay_insert).

Возможные значения:

- Любое положительное целое число.

Задержка (в миллисекундах) для `INSERT` рассчитывается по формуле:

```code
max_k = parts_to_throw_insert - parts_to_delay_insert
k = 1 + parts_count_in_partition - parts_to_delay_insert
delay_milliseconds = pow(max_delay_to_insert * 1000, k / max_k)
```

Например, если партиция содержит 299 активных кусков данных и parts_to_throw_insert
= 300, parts_to_delay_insert = 150, max_delay_to_insert = 1, то `INSERT`
задерживается на `pow( 1 * 1000, (1 + 299 - 150) / (300 - 150) ) = 1000`
миллисекунд.

Начиная с версии 23.1 формула изменена на:

```code
allowed_parts_over_threshold = parts_to_throw_insert - parts_to_delay_insert
parts_over_threshold = parts_count_in_partition - parts_to_delay_insert + 1
delay_milliseconds = max(min_delay_to_insert_ms, (max_delay_to_insert * 1000)
* parts_over_threshold / allowed_parts_over_threshold)
```

Например, если партиция содержит 224 активных куска данных и parts_to_throw_insert
= 300, parts_to_delay_insert = 150, max_delay_to_insert = 1,
min_delay_to_insert_ms = 10, то `INSERT` задерживается на `max( 10, 1 * 1000 *
(224 - 150 + 1) / (300 - 150) ) = 500` миллисекунд.


## max_delay_to_mutate_ms {#max_delay_to_mutate_ms}

<SettingsInfoBlock type='UInt64' default_value='1000' />

Максимальная задержка выполнения мутаций таблицы MergeTree в миллисекундах при наличии большого количества незавершённых мутаций


## max_digestion_size_per_segment {#max_digestion_size_per_segment}

<SettingsInfoBlock type='UInt64' default_value='268435456' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "268435456" },
        { label: "Устаревший параметр" }
      ]
    }
  ]}
/>


Устаревшая настройка, ничего не делает.

## max_file_name_length {#max_file_name_length}

<SettingsInfoBlock type='UInt64' default_value='127' />

Максимальная длина имени файла, при которой оно сохраняется без хеширования.
Действует только при включённой настройке `replace_long_file_name_to_hash`.
Значение этой настройки не включает длину расширения файла. Поэтому
рекомендуется устанавливать его ниже максимальной длины имени файла (обычно 255
байт) с некоторым запасом, чтобы избежать ошибок файловой системы.


## max_files_to_modify_in_alter_columns {#max_files_to_modify_in_alter_columns}

<SettingsInfoBlock type='UInt64' default_value='75' />

Не применять ALTER, если количество файлов для модификации (удаление, добавление)
превышает это значение.

Возможные значения:

- Любое положительное целое число.

Значение по умолчанию: 75


## max_files_to_remove_in_alter_columns {#max_files_to_remove_in_alter_columns}

<SettingsInfoBlock type='UInt64' default_value='50' />

Не применять ALTER, если количество файлов для удаления превышает это
значение.

Возможные значения:

- Любое положительное целое число.


## max_merge_delayed_streams_for_parallel_write {#max_merge_delayed_streams_for_parallel_write}

<SettingsInfoBlock type='UInt64' default_value='40' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.4" }, { label: "40" }, { label: "Новая настройка" }]
    }
  ]}
/>

Максимальное количество потоков (столбцов), которые могут быть сброшены параллельно
(аналог max_insert_delayed_streams_for_parallel_write для слияний). Работает
только для вертикальных слияний (Vertical merges).


## max_merge_selecting_sleep_ms {#max_merge_selecting_sleep_ms}

<SettingsInfoBlock type='UInt64' default_value='60000' />

Максимальное время ожидания перед повторной попыткой выбора частей для слияния, если ни одна часть не была выбрана. Меньшее значение приведет к частому запуску задач выбора в background_schedule_pool, что вызовет большое количество запросов к ZooKeeper в крупномасштабных кластерах


## max_number_of_merges_with_ttl_in_pool {#max_number_of_merges_with_ttl_in_pool}

<SettingsInfoBlock type='UInt64' default_value='2' />
Если в пуле находится больше указанного количества слияний с записями TTL, новые слияния с TTL не назначаются. Это необходимо для того, чтобы оставить свободные потоки для обычных слияний и избежать ошибки «Too many parts»


## max_number_of_mutations_for_replica {#max_number_of_mutations_for_replica}

<SettingsInfoBlock type='UInt64' default_value='0' />

Ограничивает количество мутаций частей данных на реплику указанным значением.
Ноль означает отсутствие ограничения на количество мутаций на реплику (выполнение
по-прежнему может ограничиваться другими настройками).


## max_part_loading_threads {#max_part_loading_threads}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(16)'" />
Устаревшая настройка, ничего не делает.
## max_part_removal_threads {#max_part_removal_threads} 
<SettingsInfoBlock type="MaxThreads" default_value="'auto(16)'" />
Устаревшая настройка, ничего не делает.
## max_partitions_to_read {#max_partitions_to_read} 
<SettingsInfoBlock type="Int64" default_value="-1" />

Ограничивает максимальное количество партиций, доступных для чтения в одном запросе.

Значение настройки, указанное при создании таблицы, может быть переопределено настройкой на уровне запроса.

Возможные значения:

- Любое положительное целое число.

Также можно указать настройку сложности запроса [max_partitions_to_read](/operations/settings/settings#max_partitions_to_read)
на уровне запроса/сессии/профиля.


## max_parts_in_total {#max_parts_in_total}

<SettingsInfoBlock type='UInt64' default_value='100000' />

Если общее количество активных кусков во всех партициях таблицы превышает значение `max_parts_in_total`, выполнение `INSERT` прерывается с исключением `Too many parts (N)`.

Возможные значения:

- Любое положительное целое число.

Большое количество кусков в таблице снижает производительность запросов ClickHouse и увеличивает время запуска ClickHouse. Чаще всего это следствие неправильного проектирования (ошибки при выборе стратегии партиционирования — слишком мелкие партиции).


## max_parts_to_merge_at_once {#max_parts_to_merge_at_once}

<SettingsInfoBlock type='UInt64' default_value='100' />

Максимальное количество частей, которые могут быть объединены за один раз (0 — отключено). Не влияет на запрос OPTIMIZE FINAL.


## max_postpone_time_for_failed_mutations_ms {#max_postpone_time_for_failed_mutations_ms}

<SettingsInfoBlock type='UInt64' default_value='300000' />

Максимальное время отсрочки для неудачных мутаций.


## max_postpone_time_for_failed_replicated_fetches_ms {#max_postpone_time_for_failed_replicated_fetches_ms}

<SettingsInfoBlock type='UInt64' default_value='60000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.4" },
        { label: "60000" },
        {
          label:
            "Добавлена новая настройка для включения отсрочки задач загрузки в очереди репликации."
        }
      ]
    }
  ]}
/>

Максимальное время отсрочки для неудачных реплицированных загрузок.


## max_postpone_time_for_failed_replicated_merges_ms {#max_postpone_time_for_failed_replicated_merges_ms}

<SettingsInfoBlock type='UInt64' default_value='60000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.4" },
        { label: "60000" },
        {
          label:
            "Добавлена новая настройка для отсрочки задач слияния в очереди репликации."
        }
      ]
    }
  ]}
/>

Максимальное время отсрочки для неудавшихся реплицируемых слияний.


## max_postpone_time_for_failed_replicated_tasks_ms {#max_postpone_time_for_failed_replicated_tasks_ms}

<SettingsInfoBlock type='UInt64' default_value='300000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.4" },
        { label: "300000" },
        {
          label:
            "Добавлена новая настройка для включения отсрочки задач в очереди репликации."
        }
      ]
    }
  ]}
/>

Максимальное время отсрочки для неудавшейся реплицируемой задачи. Значение используется, если задача не является операцией fetch, merge или mutation.


## max_projections {#max_projections}

<SettingsInfoBlock type='UInt64' default_value='25' />

Максимальное количество проекций таблиц семейства MergeTree.


## max_replicated_fetches_network_bandwidth {#max_replicated_fetches_network_bandwidth}

<SettingsInfoBlock type='UInt64' default_value='0' />

Ограничивает максимальную скорость обмена данными по сети в байтах в
секунду для [реплицируемых](../../engines/table-engines/mergetree-family/replication.md)
загрузок. Эта настройка применяется к конкретной таблице, в отличие от
настройки [`max_replicated_fetches_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_fetches_network_bandwidth),
которая применяется к серверу.

Можно ограничить как сетевой трафик сервера, так и сетевой трафик для конкретной таблицы, но для
этого значение настройки на уровне таблицы должно быть меньше значения на уровне
сервера. В противном случае сервер учитывает только
настройку `max_replicated_fetches_network_bandwidth_for_server`.

Настройка соблюдается не абсолютно точно.

Возможные значения:

- Положительное целое число.
- `0` — без ограничений.

Значение по умолчанию: `0`.

**Использование**

Может использоваться для ограничения скорости при репликации данных для добавления или замены
новых узлов.


## max_replicated_logs_to_keep {#max_replicated_logs_to_keep}

<SettingsInfoBlock type='UInt64' default_value='1000' />

Максимальное количество записей в журнале ClickHouse Keeper при наличии неактивной
реплики. Неактивная реплика считается потерянной при превышении этого значения.

Возможные значения:

- Любое положительное целое число.


## max_replicated_merges_in_queue {#max_replicated_merges_in_queue}

<SettingsInfoBlock type='UInt64' default_value='1000' />

Максимальное количество задач слияния и мутации частей данных, которые могут одновременно находиться в очереди ReplicatedMergeTree.


## max_replicated_merges_with_ttl_in_queue {#max_replicated_merges_with_ttl_in_queue}

<SettingsInfoBlock type='UInt64' default_value='1' />

Максимальное количество задач слияния частей с TTL, которые могут выполняться одновременно в очереди ReplicatedMergeTree.


## max_replicated_mutations_in_queue {#max_replicated_mutations_in_queue}

<SettingsInfoBlock type='UInt64' default_value='8' />

Сколько задач мутации кусков данных может одновременно находиться в
очереди ReplicatedMergeTree.


## max_replicated_sends_network_bandwidth {#max_replicated_sends_network_bandwidth}

<SettingsInfoBlock type='UInt64' default_value='0' />

Ограничивает максимальную скорость обмена данными по сети в байтах в
секунду для отправки данных при [репликации](/engines/table-engines/mergetree-family/replacingmergetree).
Эта настройка применяется к конкретной таблице, в отличие от настройки
[`max_replicated_sends_network_bandwidth_for_server`](/operations/settings/merge-tree-settings#max_replicated_sends_network_bandwidth),
которая применяется на уровне сервера.

Можно ограничить как сетевой трафик сервера, так и сетевой трафик для конкретной таблицы, но
для этого значение настройки на уровне таблицы должно быть меньше,
чем значение на уровне сервера. В противном случае сервер учитывает только настройку
`max_replicated_sends_network_bandwidth_for_server`.

Настройка соблюдается не абсолютно точно.

Возможные значения:

- Положительное целое число.
- `0` — без ограничений.

**Использование**

Может использоваться для ограничения скорости при репликации данных для добавления или замены
новых узлов.


## max_suspicious_broken_parts {#max_suspicious_broken_parts}

<SettingsInfoBlock type='UInt64' default_value='100' />

Если количество повреждённых кусков в одной партиции превышает значение
`max_suspicious_broken_parts`, автоматическое удаление отключается.

Возможные значения:

- Любое положительное целое число.


## max_suspicious_broken_parts_bytes {#max_suspicious_broken_parts_bytes}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />

Максимальный размер всех поврежденных частей. Если размер превышен, автоматическое удаление запрещено.

Возможные значения:

- Любое положительное целое число.


## max_uncompressed_bytes_in_patches {#max_uncompressed_bytes_in_patches}

<SettingsInfoBlock type='UInt64' default_value='32212254720' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "32212254720" },
        { label: "Новая настройка" }
      ]
    }
  ]}
/>

Максимальный размер несжатых данных во всех частях патчей в байтах.
Если объём данных во всех частях патчей превышает это значение, лёгкие обновления будут отклонены.
0 — без ограничений.


## merge_max_block_size {#merge_max_block_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='8192' />

Количество строк, считываемых из объединяемых кусков в память.

Возможные значения:

- Любое положительное целое число.

При слиянии строки считываются из кусков блоками по `merge_max_block_size` строк, затем
объединяются и записываются в новый кусок. Считанный блок размещается в оперативной памяти,
поэтому `merge_max_block_size` влияет на объём оперативной памяти, требуемой для слияния.
Таким образом, слияния могут потреблять большой объём оперативной памяти для таблиц с очень широкими строками
(если средний размер строки составляет 100 КБ, то при слиянии 10 кусков
(100 КБ _ 10 _ 8192) = ~ 8 ГБ оперативной памяти). Уменьшая значение `merge_max_block_size`,
можно снизить объём оперативной памяти, требуемой для слияния, но это замедлит процесс слияния.


## merge_max_block_size_bytes {#merge_max_block_size_bytes}

<SettingsInfoBlock type='UInt64' default_value='10485760' />

Определяет размер блоков в байтах, формируемых для операций слияния. По умолчанию
имеет то же значение, что и `index_granularity_bytes`.


## merge_max_bytes_to_prewarm_cache {#merge_max_bytes_to_prewarm_cache}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.1" },
        { label: "1073741824" },
        { label: "Cloud sync" }
      ]
    }
  ]}
/>

Доступно только в ClickHouse Cloud. Максимальный размер части (compact или packed)
для предварительного прогрева кеша во время слияния.


## merge_max_dynamic_subcolumns_in_wide_part {#merge_max_dynamic_subcolumns_in_wide_part}

<SettingsInfoBlock type='UInt64Auto' default_value='auto' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.11" },
        { label: "auto" },
        {
          label:
            "Добавлена новая настройка для ограничения количества динамических подстолбцов в Wide-части после слияния независимо от параметров, указанных в типе данных"
        }
      ]
    }
  ]}
/>

Максимальное количество динамических подстолбцов, которые могут быть созданы в каждом столбце Wide-части данных после слияния.
Позволяет уменьшить количество создаваемых файлов в Wide-части данных независимо от динамических параметров, указанных в типе данных.

Например, если таблица содержит столбец типа JSON(max_dynamic_paths=1024) и настройка merge_max_dynamic_subcolumns_in_wide_part установлена в значение 128,
после слияния в Wide-часть данных количество динамических путей в этой части будет уменьшено до 128, и только 128 путей будут записаны как динамические подстолбцы.


## merge_selecting_sleep_ms {#merge_selecting_sleep_ms}

<SettingsInfoBlock type='UInt64' default_value='5000' />

Минимальное время ожидания перед повторной попыткой выбора кусков для слияния, если ни один кусок не был выбран. Меньшее значение приведет к частому запуску задач выбора в background_schedule_pool, что вызовет большое количество запросов к ZooKeeper в крупномасштабных кластерах


## merge_selecting_sleep_slowdown_factor {#merge_selecting_sleep_slowdown_factor}

<SettingsInfoBlock type='Float' default_value='1.2' />

Время ожидания задачи выбора слияний умножается на этот коэффициент, когда
отсутствуют слияния для выполнения, и делится на него при назначении слияния


## merge_selector_algorithm {#merge_selector_algorithm}

<ExperimentalBadge />
<SettingsInfoBlock type='MergeSelectorAlgorithm' default_value='Simple' />

Алгоритм выбора кусков данных для назначения слияний


## merge_selector_base {#merge_selector_base}

<SettingsInfoBlock type='Float' default_value='5' />
Влияет на коэффициент усиления записи при назначенных слияниях (настройка экспертного уровня, не
изменяйте, если не понимаете её назначение). Работает для селекторов слияний Simple и
StochasticSimple


## merge_selector_blurry_base_scale_factor {#merge_selector_blurry_base_scale_factor}

<SettingsInfoBlock type='UInt64' default_value='0' />

Управляет моментом активации логики в зависимости от количества кусков в
партиции. Чем больше коэффициент, тем более отложенной будет реакция.


## merge_selector_enable_heuristic_to_remove_small_parts_at_right {#merge_selector_enable_heuristic_to_remove_small_parts_at_right}

<SettingsInfoBlock type='Bool' default_value='1' />

Включает эвристику для выбора кусков данных при слиянии, которая исключает куски
с правой стороны диапазона, если их размер меньше заданного соотношения (0.01) от sum_size.
Работает для селекторов слияния Simple и StochasticSimple


## merge_selector_window_size {#merge_selector_window_size}

<SettingsInfoBlock type='UInt64' default_value='1000' />

Количество частей для одновременного рассмотрения.


## merge_total_max_bytes_to_prewarm_cache {#merge_total_max_bytes_to_prewarm_cache}

<SettingsInfoBlock type='UInt64' default_value='16106127360' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.1" },
        { label: "16106127360" },
        { label: "Синхронизация с Cloud" }
      ]
    }
  ]}
/>

Доступно только в ClickHouse Cloud. Максимальный суммарный размер частей для предварительного прогрева
кеша во время слияния.


## merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds {#merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds}

<SettingsInfoBlock type="UInt64" default_value="2592000" />
Устаревшая настройка, ничего не делает.
## merge_tree_clear_old_parts_interval_seconds {#merge_tree_clear_old_parts_interval_seconds} 
<SettingsInfoBlock type="UInt64" default_value="1" />

Задает интервал в секундах, с которым ClickHouse выполняет очистку старых
частей, WAL и мутаций.

Возможные значения:

- Любое положительное целое число.


## merge_tree_clear_old_temporary_directories_interval_seconds {#merge_tree_clear_old_temporary_directories_interval_seconds}

<SettingsInfoBlock type='UInt64' default_value='60' />

Задаёт интервал в секундах, с которым ClickHouse выполняет очистку старых
временных каталогов.

Возможные значения:

- Любое положительное целое число.


## merge_tree_enable_clear_old_broken_detached {#merge_tree_enable_clear_old_broken_detached}

<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревшая настройка, ничего не делает.
## merge_with_recompression_ttl_timeout {#merge_with_recompression_ttl_timeout} 
<SettingsInfoBlock type="Int64" default_value="14400" />

Минимальная задержка в секундах перед повторным слиянием с TTL-перекомпрессией.


## merge_with_ttl_timeout {#merge_with_ttl_timeout}

<SettingsInfoBlock type='Int64' default_value='14400' />

Минимальная задержка в секундах перед повторным слиянием с TTL удаления.


## merge_workload {#merge_workload}

Используется для регулирования использования и распределения ресурсов между слияниями и другими рабочими нагрузками. Указанное значение используется в качестве значения настройки `workload` для фоновых слияний этой таблицы. Если не указано (пустая строка), то используется серверная настройка `merge_workload`.

**См. также**

- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)


## min_absolute_delay_to_close {#min_absolute_delay_to_close}

<SettingsInfoBlock type='UInt64' default_value='0' />

Минимальная абсолютная задержка перед закрытием, прекращением обслуживания запросов и возвратом статуса, отличного от Ok, при проверке состояния.


## min_age_to_force_merge_on_partition_only {#min_age_to_force_merge_on_partition_only}

<SettingsInfoBlock type='Bool' default_value='0' />

Определяет, должен ли параметр `min_age_to_force_merge_seconds` применяться только ко всему разделу целиком, а не к его подмножеству.

По умолчанию игнорирует параметр `max_bytes_to_merge_at_max_space_in_pool` (см. `enable_max_bytes_limit_for_min_age_to_force_merge`).

Возможные значения:

- true, false


## min_age_to_force_merge_seconds {#min_age_to_force_merge_seconds}

<SettingsInfoBlock type='UInt64' default_value='0' />

Объединяет части, если каждая часть в диапазоне старше значения
`min_age_to_force_merge_seconds`.

По умолчанию игнорирует настройку `max_bytes_to_merge_at_max_space_in_pool`
(см. `enable_max_bytes_limit_for_min_age_to_force_merge`).

Возможные значения:

- Положительное целое число.


## min_bytes_for_compact_part {#min_bytes_for_compact_part}

<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревший параметр, не используется.
## min_bytes_for_full_part_storage {#min_bytes_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Доступно только в ClickHouse Cloud. Минимальный размер несжатых данных в байтах для
использования полного типа хранения части данных вместо упакованного


## min_bytes_for_wide_part {#min_bytes_for_wide_part}

<SettingsInfoBlock type='UInt64' default_value='10485760' />

Минимальное количество байтов/строк в куске данных, который может храниться в формате `Wide`. Можно задать один из этих параметров, оба или ни одного.


## min_bytes_to_prewarm_caches {#min_bytes_to_prewarm_caches}

<SettingsInfoBlock type='UInt64' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "24.12" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

Минимальный размер (в несжатых байтах) для предварительного прогрева кэша меток и кэша первичного индекса
для новых кусков данных


## min_bytes_to_rebalance_partition_over_jbod {#min_bytes_to_rebalance_partition_over_jbod}

<SettingsInfoBlock type='UInt64' default_value='0' />

Задает минимальный объем данных в байтах для включения балансировки при распределении новых крупных
кусков данных по дискам тома [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures).

Возможные значения:

- Положительное целое число.
- `0` — балансировка отключена.

**Использование**

Значение настройки `min_bytes_to_rebalance_partition_over_jbod` не должно
быть меньше значения
[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)
/ 1024. В противном случае ClickHouse генерирует исключение.


## min_compress_block_size {#min_compress_block_size}

<SettingsInfoBlock type='UInt64' default_value='0' />

Минимальный размер блоков несжатых данных, требуемый для сжатия при
записи следующей метки. Эту настройку также можно задать в глобальных настройках
(см. настройку [min_compress_block_size](/operations/settings/merge-tree-settings#min_compress_block_size)). Значение, указанное при создании таблицы, переопределяет глобальное значение
данной настройки.


## min_compressed_bytes_to_fsync_after_fetch {#min_compressed_bytes_to_fsync_after_fetch}

<SettingsInfoBlock type='UInt64' default_value='0' />

Минимальное количество сжатых байтов для выполнения fsync для куска данных после получения (0 — отключено)


## min_compressed_bytes_to_fsync_after_merge {#min_compressed_bytes_to_fsync_after_merge}

<SettingsInfoBlock type='UInt64' default_value='0' />

Минимальное количество сжатых байтов для выполнения fsync для куска данных после слияния (0 — отключено)


## min_delay_to_insert_ms {#min_delay_to_insert_ms}

<SettingsInfoBlock type='UInt64' default_value='10' />

Минимальная задержка вставки данных в таблицу MergeTree в миллисекундах, если
в одной партиции содержится большое количество несмерженных кусков.


## min_delay_to_mutate_ms {#min_delay_to_mutate_ms}

<SettingsInfoBlock type='UInt64' default_value='10' />

Минимальная задержка выполнения мутаций таблицы MergeTree в миллисекундах при наличии большого количества незавершённых мутаций


## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert}

<SettingsInfoBlock type='UInt64' default_value='0' />

Минимальное количество байт, которое должно быть свободно на диске для
выполнения вставки данных. Если количество доступных свободных байт меньше
`min_free_disk_bytes_to_perform_insert`, то генерируется исключение и
вставка не выполняется. Обратите внимание, что эта настройка:

- учитывает настройку `keep_free_space_bytes`.
- не учитывает объем данных, который будет записан операцией
  `INSERT`.
- проверяется только при указании положительного (ненулевого) количества байт

Возможные значения:

- Любое положительное целое число.

:::note
Если указаны обе настройки `min_free_disk_bytes_to_perform_insert` и `min_free_disk_ratio_to_perform_insert`,
ClickHouse будет ориентироваться на значение, которое позволит выполнять
вставки при большем объеме свободного дискового пространства.
:::


## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert}

<SettingsInfoBlock type='Float' default_value='0' />

Минимальное соотношение свободного места к общему объёму диска для выполнения операции `INSERT`. Должно быть числом с плавающей точкой в диапазоне от 0 до 1. Обратите внимание, что эта настройка:

- учитывает настройку `keep_free_space_bytes`;
- не учитывает объём данных, который будет записан операцией `INSERT`;
- проверяется только при указании положительного (ненулевого) соотношения.

Возможные значения:

- Float, 0.0 - 1.0

Обратите внимание: если указаны обе настройки `min_free_disk_ratio_to_perform_insert` и
`min_free_disk_bytes_to_perform_insert`, ClickHouse будет использовать значение, которое позволит выполнять вставки при большем объёме свободного дискового пространства.


## min_index_granularity_bytes {#min_index_granularity_bytes}

<SettingsInfoBlock type='UInt64' default_value='1024' />

Минимально допустимый размер гранул данных в байтах.

Предотвращает случайное создание таблиц с очень низким значением
`index_granularity_bytes`.


## min_level_for_full_part_storage {#min_level_for_full_part_storage}

<SettingsInfoBlock type='UInt32' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.10" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

Доступно только в ClickHouse Cloud. Минимальный уровень куска для
использования полного типа хранилища для куска данных вместо упакованного


## min_level_for_wide_part {#min_level_for_wide_part}

<SettingsInfoBlock type='UInt32' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.10" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

Минимальный уровень части для создания куска данных в формате `Wide` вместо `Compact`.


## min_marks_to_honor_max_concurrent_queries {#min_marks_to_honor_max_concurrent_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />

Минимальное количество засечек, которое должен прочитать запрос для применения настройки [max_concurrent_queries](#max_concurrent_queries).

:::note
Запросы всё равно будут ограничены другими настройками `max_concurrent_queries`.
:::

Возможные значения:

- Положительное целое число.
- `0` — отключено (ограничение `max_concurrent_queries` не применяется ни к одному запросу).

**Пример**

```xml
<min_marks_to_honor_max_concurrent_queries>10</min_marks_to_honor_max_concurrent_queries>
```


## min_merge_bytes_to_use_direct_io {#min_merge_bytes_to_use_direct_io}

<SettingsInfoBlock type='UInt64' default_value='10737418240' />

Минимальный объём данных для операции слияния, при котором используется прямой
доступ I/O к диску хранилища. При слиянии кусков данных ClickHouse вычисляет
общий объём всех данных, подлежащих слиянию. Если объём превышает
`min_merge_bytes_to_use_direct_io` байт, ClickHouse выполняет чтение и запись
данных на диск хранилища с использованием интерфейса прямого I/O (опция `O_DIRECT`).
Если `min_merge_bytes_to_use_direct_io = 0`, прямой I/O отключён.


## min_parts_to_merge_at_once {#min_parts_to_merge_at_once}

<SettingsInfoBlock type='UInt64' default_value='0' />

Минимальное количество кусков данных, которое селектор слияния может выбрать для слияния за один раз
(настройка экспертного уровня, не изменяйте её, если не понимаете, что она делает).
0 — отключено. Работает для селекторов слияния Simple и StochasticSimple.


## min_relative_delay_to_close {#min_relative_delay_to_close}

<SettingsInfoBlock type='UInt64' default_value='300' />

Минимальная задержка относительно других реплик, при которой реплика закрывается, прекращает обслуживание запросов и возвращает статус, отличный от Ok, при проверке состояния.


## min_relative_delay_to_measure {#min_relative_delay_to_measure}

<SettingsInfoBlock type='UInt64' default_value='120' />

Вычислять относительную задержку реплики только в том случае, если абсолютная задержка не меньше данного значения.


## min_relative_delay_to_yield_leadership {#min_relative_delay_to_yield_leadership}

<SettingsInfoBlock type="UInt64" default_value="120" />
Устаревший параметр, не используется.
## min_replicated_logs_to_keep {#min_replicated_logs_to_keep} 
<SettingsInfoBlock type="UInt64" default_value="10" />

Сохранять примерно указанное количество последних записей в журнале ZooKeeper, даже если они
устарели. Не влияет на работу таблиц: используется только для диагностики журнала ZooKeeper
перед очисткой.

Возможные значения:

- Любое положительное целое число.


## min_rows_for_compact_part {#min_rows_for_compact_part}

<SettingsInfoBlock type="UInt64" default_value="0" />
Устаревший параметр, не используется.
## min_rows_for_full_part_storage {#min_rows_for_full_part_storage} 
<SettingsInfoBlock type="UInt64" default_value="0" />

Доступно только в ClickHouse Cloud. Минимальное количество строк для использования полного типа
хранилища для части данных вместо упакованного


## min_rows_for_wide_part {#min_rows_for_wide_part}

<SettingsInfoBlock type='UInt64' default_value='0' />

Минимальное количество строк для создания куска данных в формате `Wide` вместо `Compact`.


## min_rows_to_fsync_after_merge {#min_rows_to_fsync_after_merge}

<SettingsInfoBlock type='UInt64' default_value='0' />

Минимальное количество строк для выполнения fsync куска данных после слияния (0 — отключено)


## mutation_workload {#mutation_workload}

Используется для регулирования использования и распределения ресурсов между мутациями и другими рабочими нагрузками. Указанное значение используется в качестве значения настройки `workload` для фоновых мутаций этой таблицы. Если не указано (пустая строка), то используется серверная настройка `mutation_workload`.

**См. также**

- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)


## non_replicated_deduplication_window {#non_replicated_deduplication_window}

<SettingsInfoBlock type='UInt64' default_value='0' />

Количество последних вставленных блоков в нереплицируемой таблице
[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md),
для которых сохраняются хеш-суммы для проверки на дубликаты.

Возможные значения:

- Любое положительное целое число.
- `0` (дедупликация отключена).

Используется механизм дедупликации, аналогичный механизму для реплицируемых таблиц (см.
настройку [replicated_deduplication_window](#replicated_deduplication_window)).
Хеш-суммы созданных кусков записываются в локальный файл на диске.


## notify_newest_block_number {#notify_newest_block_number}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Cloud sync" }]
    }
  ]}
/>

Уведомляет SharedJoin или SharedSet о номере новейшего блока. Только в ClickHouse Cloud.


## number_of_free_entries_in_pool_to_execute_mutation {#number_of_free_entries_in_pool_to_execute_mutation}

<SettingsInfoBlock type='UInt64' default_value='20' />

Если количество свободных записей в пуле меньше указанного значения, мутации частей данных не выполняются. Это позволяет оставить свободные потоки для обычных слияний и избежать ошибок «Too many parts».

Возможные значения:

- Любое положительное целое число.

**Использование**

Значение настройки `number_of_free_entries_in_pool_to_execute_mutation` должно быть меньше произведения значений [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) * [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio). В противном случае ClickHouse выдаст исключение.


## number_of_free_entries_in_pool_to_execute_optimize_entire_partition {#number_of_free_entries_in_pool_to_execute_optimize_entire_partition}

<SettingsInfoBlock type='UInt64' default_value='25' />

Если количество свободных записей в пуле меньше указанного значения, оптимизация всей партиции в фоновом режиме не выполняется (эта задача создается при установке `min_age_to_force_merge_seconds` и включении `min_age_to_force_merge_on_partition_only`). Это позволяет оставить свободные потоки для обычных слияний и избежать ошибки «Too many parts».

Возможные значения:

- Положительное целое число.

Значение настройки `number_of_free_entries_in_pool_to_execute_optimize_entire_partition` должно быть меньше произведения значений [background_pool_size](/operations/server-configuration-parameters/settings.md/#background_pool_size) и [background_merges_mutations_concurrency_ratio](/operations/server-configuration-parameters/settings.md/#background_merges_mutations_concurrency_ratio). В противном случае ClickHouse выбрасывает исключение.


## number_of_free_entries_in_pool_to_lower_max_size_of_merge {#number_of_free_entries_in_pool_to_lower_max_size_of_merge}

<SettingsInfoBlock type='UInt64' default_value='8' />

Когда количество свободных записей в пуле
(или в реплицируемой очереди) становится меньше указанного значения, начинается уменьшение максимального размера слияния для обработки
(или для добавления в очередь).
Это позволяет обрабатывать небольшие слияния, не заполняя пул длительными слияниями.

Возможные значения:

- Любое положительное целое число.


## number_of_mutations_to_delay {#number_of_mutations_to_delay}

<SettingsInfoBlock type='UInt64' default_value='500' />
Если в таблице накопилось как минимум указанное количество незавершённых мутаций, выполнение мутаций таблицы искусственно замедляется. Отключается при значении 0


## number_of_mutations_to_throw {#number_of_mutations_to_throw}

<SettingsInfoBlock type='UInt64' default_value='1000' />

Если в таблице накопилось не менее указанного количества незавершённых мутаций, выбрасывается исключение 'Too many mutations'. Отключается при значении 0


## number_of_partitions_to_consider_for_merge {#number_of_partitions_to_consider_for_merge}

<SettingsInfoBlock type='UInt64' default_value='10' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "10" }, { label: "Cloud sync" }]
    }
  ]}
/>

Доступно только в ClickHouse Cloud. Для слияния рассматриваются до N партиций с наибольшим приоритетом. Партиции выбираются случайным образом с учётом весов, где вес определяется количеством частей данных, которые могут быть объединены в данной партиции.


## object_serialization_version {#object_serialization_version}

<SettingsInfoBlock
  type='MergeTreeObjectSerializationVersion'
  default_value='v2'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "v2" },
        { label: "Добавлена настройка для управления версиями сериализации JSON" }
      ]
    }
  ]}
/>

Версия сериализации для типа данных JSON. Необходима для обеспечения совместимости.

Возможные значения:

- `v1`
- `v2`
- `v3`

Только версия `v3` поддерживает изменение версии сериализации разделяемых данных.


## object_shared_data_buckets_for_compact_part {#object_shared_data_buckets_for_compact_part}

<SettingsInfoBlock type='NonZeroUInt64' default_value='8' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "8" },
        {
          label:
            "Добавлена настройка для управления количеством бакетов для общих данных при JSON-сериализации в компактных частях"
        }
      ]
    }
  ]}
/>

Количество бакетов для JSON-сериализации общих данных в компактных частях. Работает с сериализациями общих данных `map_with_buckets` и `advanced`.


## object_shared_data_buckets_for_wide_part {#object_shared_data_buckets_for_wide_part}

<SettingsInfoBlock type='NonZeroUInt64' default_value='32' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "32" },
        {
          label:
            "Добавлена настройка для управления количеством бакетов для общих данных при JSON-сериализации в wide-партициях"
        }
      ]
    }
  ]}
/>

Количество бакетов для JSON-сериализации общих данных в Wide-партициях. Работает с сериализациями общих данных `map_with_buckets` и `advanced`.


## object_shared_data_serialization_version {#object_shared_data_serialization_version}

<SettingsInfoBlock
  type='MergeTreeObjectSharedDataSerializationVersion'
  default_value='map'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "map" },
        { label: "Добавлена настройка для управления версиями сериализации JSON" }
      ]
    }
  ]}
/>

Версия сериализации для разделяемых данных внутри типа данных JSON.

Возможные значения:

- `map` — хранение разделяемых данных в виде `Map(String, String)`
- `map_with_buckets` — хранение разделяемых данных в виде нескольких отдельных столбцов `Map(String, String)`. Использование сегментов улучшает чтение отдельных путей из разделяемых данных.
- `advanced` — специальная сериализация разделяемых данных, предназначенная для значительного улучшения чтения отдельных путей из разделяемых данных.
  Обратите внимание, что эта сериализация увеличивает размер хранилища разделяемых данных на диске, так как сохраняется большой объём дополнительной информации.

Количество сегментов для сериализаций `map_with_buckets` и `advanced` определяется настройками
[object_shared_data_buckets_for_compact_part](#object_shared_data_buckets_for_compact_part)/[object_shared_data_buckets_for_wide_part](#object_shared_data_buckets_for_wide_part).


## object_shared_data_serialization_version_for_zero_level_parts {#object_shared_data_serialization_version_for_zero_level_parts}

<SettingsInfoBlock
  type='MergeTreeObjectSharedDataSerializationVersion'
  default_value='map'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.8" },
        { label: "map" },
        {
          label:
            "Добавлена настройка для управления версиями сериализации JSON для частей нулевого уровня"
        }
      ]
    }
  ]}
/>

Эта настройка позволяет указать версию сериализации
общих данных внутри типа JSON для частей нулевого уровня, создаваемых при вставке данных.
Не рекомендуется использовать сериализацию общих данных `advanced` для частей нулевого уровня, так как это может значительно увеличить
время вставки.


## old_parts_lifetime {#old_parts_lifetime}

<SettingsInfoBlock type='Seconds' default_value='480' />

Время (в секундах) хранения неактивных кусков для защиты от потери данных
при внезапных перезагрузках сервера.

Возможные значения:

- Любое положительное целое число.

После слияния нескольких кусков в новый кусок ClickHouse помечает исходные
куски как неактивные и удаляет их только через `old_parts_lifetime` секунд.
Неактивные куски удаляются, если они не используются текущими запросами, т. е. если
`refcount` куска равен 1.

Для новых кусков `fsync` не вызывается, поэтому некоторое время новые куски существуют только
в оперативной памяти сервера (кэш ОС). При внезапной перезагрузке сервера новые
куски могут быть потеряны или повреждены. Для защиты данных неактивные куски не удаляются
немедленно.

При запуске ClickHouse проверяет целостность кусков. Если объединённый
кусок повреждён, ClickHouse возвращает неактивные куски в список активных
и позднее объединяет их снова. Затем повреждённый кусок переименовывается (добавляется
префикс `broken_`) и перемещается в папку `detached`. Если объединённый кусок
не повреждён, то исходные неактивные куски переименовываются (добавляется
префикс `ignored_`) и перемещаются в папку `detached`.

Значение по умолчанию для `dirty_expire_centisecs` (параметр ядра Linux) составляет 30
секунд (максимальное время, в течение которого записанные данные хранятся только в оперативной памяти), но при
высоких нагрузках на дисковую подсистему данные могут быть записаны значительно позже. Экспериментальным путём
было выбрано значение 480 секунд для `old_parts_lifetime`, в течение которого
новый кусок гарантированно записывается на диск.


## optimize_row_order {#optimize_row_order}

<SettingsInfoBlock type='Bool' default_value='0' />

Управляет оптимизацией порядка строк при вставке для улучшения
сжимаемости вновь вставляемой части таблицы.

Действует только для обычных таблиц с движком MergeTree. Не влияет на
специализированные таблицы с движком MergeTree (например, CollapsingMergeTree).

Таблицы MergeTree (опционально) сжимаются с использованием [кодеков сжатия](/sql-reference/statements/create/table#column_compression_codec).
Универсальные кодеки сжатия, такие как LZ4 и ZSTD, достигают максимальной степени сжатия,
если данные содержат повторяющиеся паттерны. Длинные последовательности одинаковых значений обычно
сжимаются очень хорошо.

Если эта настройка включена, ClickHouse пытается сохранить данные во вновь
вставляемых частях в таком порядке строк, который минимизирует количество последовательностей одинаковых значений
в столбцах новой части таблицы.
Другими словами, малое количество последовательностей одинаковых значений означает, что отдельные последовательности
длинные и хорошо сжимаются.

Поиск оптимального порядка строк вычислительно невыполним (NP-сложная задача).
Поэтому ClickHouse использует эвристику для быстрого нахождения порядка строк, который
всё же улучшает степень сжатия по сравнению с исходным порядком строк.

<details markdown="1">

<summary>Эвристика для нахождения порядка строк</summary>

В общем случае возможно свободно перемешивать строки таблицы (или части таблицы),
поскольку SQL считает одну и ту же таблицу (часть таблицы) с разным порядком строк
эквивалентной.

Эта свобода перемешивания строк ограничивается, когда для таблицы определён
первичный ключ. В ClickHouse первичный ключ `C1, C2, ..., CN` требует, чтобы
строки таблицы были отсортированы по столбцам `C1`, `C2`, ... `Cn` ([кластеризованный индекс](https://en.wikipedia.org/wiki/Database_index#Clustered)).
В результате строки могут перемешиваться только внутри «классов эквивалентности» строк,
то есть строк, которые имеют одинаковые значения в столбцах первичного ключа.

Интуитивно понятно, что первичные ключи с высокой кардинальностью, например, первичные ключи,
включающие столбец временной метки `DateTime64`, приводят к множеству малых классов
эквивалентности. Аналогично, таблицы с первичным ключом низкой кардинальности создают мало
больших классов эквивалентности. Таблица без первичного ключа представляет крайний
случай единственного класса эквивалентности, охватывающего все строки.

Чем меньше и крупнее классы эквивалентности, тем выше степень
свободы при перемешивании строк.

Эвристика, применяемая для нахождения наилучшего порядка строк внутри каждого класса
эквивалентности, предложена D. Lemire, O. Kaser в работе
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

При включении операции вставки требуют дополнительных затрат процессора на анализ и
оптимизацию порядка строк новых данных. Ожидается, что операции INSERT будут выполняться на 30-50%
дольше в зависимости от характеристик данных.
Степень сжатия LZ4 или ZSTD улучшается в среднем на 20-40%.

Эта настройка работает лучше всего для таблиц без первичного ключа или с первичным ключом низкой кардинальности,
то есть таблиц с небольшим количеством различных значений первичного ключа.
Первичные ключи высокой кардинальности, например, включающие столбцы временных меток типа
`DateTime64`, вероятно, не получат выигрыша от этой настройки.


## part_moves_between_shards_delay_seconds {#part_moves_between_shards_delay_seconds}

<ExperimentalBadge />
<SettingsInfoBlock type='UInt64' default_value='30' />

Время ожидания до и после перемещения кусков данных между шардами.


## part_moves_between_shards_enable {#part_moves_between_shards_enable}

<ExperimentalBadge />
<SettingsInfoBlock type='UInt64' default_value='0' />

Экспериментальная/незавершённая функция для перемещения кусков между шардами. Не учитывает выражения шардирования.


## parts_to_delay_insert {#parts_to_delay_insert}

<SettingsInfoBlock type='UInt64' default_value='1000' />

Если количество активных кусков в одной партиции превышает значение
`parts_to_delay_insert`, операция `INSERT` искусственно замедляется.

Возможные значения:

- Любое положительное целое число.

ClickHouse искусственно увеличивает время выполнения `INSERT` (добавляет паузу), чтобы фоновый процесс слияния успевал объединять куски быстрее, чем они добавляются.


## parts_to_throw_insert {#parts_to_throw_insert}

<SettingsInfoBlock type='UInt64' default_value='3000' />

Если количество активных кусков в одной партиции превышает значение
`parts_to_throw_insert`, операция `INSERT` прерывается с исключением `Too many
parts (N). Merges are processing significantly slower than inserts`.

Возможные значения:

- Любое положительное целое число.

Для достижения максимальной производительности запросов `SELECT` необходимо
минимизировать количество обрабатываемых кусков, см. [Merge Tree](/development/architecture#merge-tree).

До версии 23.6 значение этой настройки составляло 300. Вы можете установить более
высокое значение — это снизит вероятность ошибки `Too many parts`,
однако при этом производительность `SELECT` может снизиться. Кроме того, в случае
проблем со слиянием (например, из-за нехватки дискового пространства) вы
обнаружите их позже, чем при исходном значении 300.


## prefer_fetch_merged_part_size_threshold {#prefer_fetch_merged_part_size_threshold}

<SettingsInfoBlock type='UInt64' default_value='10737418240' />

Если суммарный размер частей превышает этот порог, и время с момента создания
записи в журнале репликации больше, чем
`prefer_fetch_merged_part_time_threshold`, то предпочтительнее получить объединённую часть
с реплики, а не выполнять слияние локально. Это ускоряет очень длительные
слияния.

Возможные значения:

- Любое положительное целое число.


## prefer_fetch_merged_part_time_threshold {#prefer_fetch_merged_part_time_threshold}

<SettingsInfoBlock type='Seconds' default_value='3600' />

Если время, прошедшее с момента создания записи в журнале репликации (ClickHouse Keeper или ZooKeeper), превышает этот порог, и суммарный размер частей больше `prefer_fetch_merged_part_size_threshold`, то предпочтительнее получить объединённую часть с реплики, а не выполнять слияние локально. Это ускоряет очень длительные слияния.

Возможные значения:

- Любое положительное целое число.


## prewarm_mark_cache {#prewarm_mark_cache}

<SettingsInfoBlock type='Bool' default_value='0' />
Если установлено значение true, кэш меток будет предварительно прогреваться путём сохранения меток в кэш при вставке данных,
слияниях, получении данных и при запуске сервера


## prewarm_primary_key_cache {#prewarm_primary_key_cache}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "24.12" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

Если установлено значение true, кэш первичного индекса
будет предварительно прогрет путём сохранения засечек в кэш засечек при вставках, слияниях,
загрузках данных и при запуске сервера


## primary_key_compress_block_size {#primary_key_compress_block_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='65536' />

Размер блока сжатия первичного ключа — фактический размер сжимаемого блока.


## primary_key_compression_codec {#primary_key_compression_codec}

<SettingsInfoBlock type='String' default_value='ZSTD(3)' />

Кодек сжатия, используемый для первичного ключа. Первичный ключ достаточно мал и кэшируется,
поэтому по умолчанию применяется сжатие ZSTD(3).


## primary_key_lazy_load {#primary_key_lazy_load}

<SettingsInfoBlock type='Bool' default_value='1' />
Загружать первичный ключ в память при первом обращении, а не при инициализации таблицы. Это позволяет экономить память при работе с большим количеством таблиц.


## primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns {#primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns}

<SettingsInfoBlock type='Float' default_value='0.9' />

Если значение столбца первичного ключа в куске данных изменяется как минимум
в указанной доле случаев, пропускается загрузка последующих столбцов в память. Это позволяет сократить
потребление памяти за счёт отказа от загрузки неиспользуемых столбцов первичного ключа.


## ratio_of_defaults_for_sparse_serialization {#ratio_of_defaults_for_sparse_serialization}

<SettingsInfoBlock type='Float' default_value='0.9375' />

Минимальное соотношение количества значений _по умолчанию_ к общему количеству значений
в столбце. Установка этого параметра приводит к тому, что столбец сохраняется с использованием разреженной
сериализации.

Если столбец является разреженным (содержит в основном значения по умолчанию), ClickHouse может закодировать его в
разреженном формате и автоматически оптимизировать вычисления — данные не
требуют полной декомпрессии во время выполнения запросов. Чтобы включить разреженную
сериализацию, установите параметр `ratio_of_defaults_for_sparse_serialization`
меньше 1.0. Если значение больше или равно 1.0,
столбцы всегда будут записываться с использованием обычной полной сериализации.

Возможные значения:

- Число с плавающей точкой от `0` до `1` для включения разреженной сериализации
- `1.0` (или больше), если вы не хотите использовать разреженную сериализацию

**Пример**

Обратите внимание, что столбец `s` в следующей таблице является пустой строкой для 95%
строк. В таблице `my_regular_table` мы не используем разреженную сериализацию, а в
таблице `my_sparse_table` устанавливаем `ratio_of_defaults_for_sparse_serialization` равным
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

Вы можете проверить, использует ли столбец разреженное кодирование, просмотрев
столбец `serialization_kind` таблицы `system.parts_columns`:

```sql
SELECT column, serialization_kind FROM system.parts_columns
WHERE table LIKE 'my_sparse_table';
```

Вы можете увидеть, какие части столбца `s` были сохранены с использованием разреженной сериализации:

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

<SettingsInfoBlock type='UInt64' default_value='5000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "5000" }, { label: "Cloud sync" }]
    }
  ]}
/>

Доступно только в ClickHouse Cloud. Минимальное время ожидания перед повторной попыткой
сокращения блокирующих частей после того, как ни один диапазон не был удалён или заменён. Меньшее
значение приведёт к частому запуску задач в background_schedule_pool, что
вызовет большое количество запросов к ZooKeeper в крупномасштабных кластерах


## refresh_parts_interval {#refresh_parts_interval}

<SettingsInfoBlock type='Seconds' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.4" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

Если значение больше нуля — обновлять список частей данных из базовой файловой системы для проверки, были ли данные изменены напрямую в файловой системе.
Может быть установлено только если таблица расположена на дисках только для чтения (что означает, что это реплика только для чтения, в то время как данные записываются другой репликой).


## refresh_statistics_interval {#refresh_statistics_interval}

<SettingsInfoBlock type='Seconds' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.11" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

Интервал обновления кэша статистики в секундах. Если установлено значение ноль, обновление будет отключено.


## remote_fs_execute_merges_on_single_replica_time_threshold {#remote_fs_execute_merges_on_single_replica_time_threshold}

<SettingsInfoBlock type='Seconds' default_value='10800' />

Когда значение этой настройки больше нуля, только одна реплика немедленно начинает
слияние, если объединённая часть находится в общем хранилище.

:::note
Репликация с нулевым копированием не готова для production-использования
Репликация с нулевым копированием отключена по умолчанию в ClickHouse версии 22.8 и
выше.

Эта функция не рекомендуется для использования в production-среде.
:::

Возможные значения:

- Любое положительное целое число.


## remote_fs_zero_copy_path_compatible_mode {#remote_fs_zero_copy_path_compatible_mode}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='0' />

Запускать zero-copy в режиме совместимости во время процесса преобразования.


## remote_fs_zero_copy_zookeeper_path {#remote_fs_zero_copy_zookeeper_path}

<ExperimentalBadge />
<SettingsInfoBlock type='String' default_value='/clickhouse/zero_copy' />

Путь в ZooKeeper для хранения информации zero-copy, не зависящей от таблиц.


## remove_empty_parts {#remove_empty_parts}

<SettingsInfoBlock type='Bool' default_value='1' />

Удалять пустые части после их очистки по TTL, мутации или алгоритму
сворачивающего слияния.


## remove_rolled_back_parts_immediately {#remove_rolled_back_parts_immediately}

<ExperimentalBadge />
<SettingsInfoBlock type='Bool' default_value='1' />

Настройка для незавершенной экспериментальной функции.


## remove_unused_patch_parts {#remove_unused_patch_parts}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "1" }, { label: "Новая настройка" }]
    }
  ]}
/>

Удалять в фоновом режиме части-патчи, которые применены ко всем активным частям.


## replace_long_file_name_to_hash {#replace_long_file_name_to_hash}

<SettingsInfoBlock type='Bool' default_value='1' />

Если имя файла для столбца слишком длинное (более `max_file_name_length`
байтов), заменяет его на SipHash128


## replicated_can_become_leader {#replicated_can_become_leader}

<SettingsInfoBlock type='Bool' default_value='1' />

Если установлено значение true, реплики реплицируемых таблиц на этом узле будут пытаться стать лидером.

Возможные значения:

- `true`
- `false`


## replicated_deduplication_window {#replicated_deduplication_window}

<SettingsInfoBlock type='UInt64' default_value='10000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.9" },
        { label: "10000" },
        { label: "увеличено значение по умолчанию" }
      ]
    }
  ]}
/>

Количество последних вставленных блоков, для которых ClickHouse Keeper хранит
хеш-суммы для проверки на дубликаты.

Возможные значения:

- Любое положительное целое число.
- 0 (отключает дедупликацию)

Команда `Insert` создаёт один или несколько блоков (частей). Для
[дедупликации вставок](../../engines/table-engines/mergetree-family/replication.md)
при записи в реплицируемые таблицы ClickHouse записывает хеш-суммы
созданных частей в ClickHouse Keeper. Хеш-суммы хранятся только для
последних `replicated_deduplication_window` блоков. Самые старые хеш-суммы
удаляются из ClickHouse Keeper.

Большое значение `replicated_deduplication_window` замедляет операции `Insert`,
так как требуется сравнивать больше записей. Хеш-сумма вычисляется на основе
состава имён и типов полей, а также данных вставляемой
части (потока байтов).


## replicated_deduplication_window_for_async_inserts {#replicated_deduplication_window_for_async_inserts}

<SettingsInfoBlock type='UInt64' default_value='10000' />

Количество последних асинхронно вставленных блоков, для которых ClickHouse Keeper
хранит хеш-суммы для проверки на дубликаты.

Возможные значения:

- Любое положительное целое число.
- 0 (отключает дедупликацию для async_inserts)

Команда [Async Insert](/operations/settings/settings#async_insert) 
кэшируется в одном или нескольких блоках (партициях). При [дедупликации вставок](/engines/table-engines/mergetree-family/replication)
во время записи в реплицируемые таблицы ClickHouse записывает хеш-суммы каждой
вставки в ClickHouse Keeper. Хеш-суммы сохраняются только для последних
`replicated_deduplication_window_for_async_inserts` блоков. Самые старые хеш-суммы
удаляются из ClickHouse Keeper.
Большое значение `replicated_deduplication_window_for_async_inserts` замедляет
выполнение `Async Inserts`, так как требуется сравнивать больше записей.
Хеш-сумма вычисляется на основе комбинации имен и типов полей,
а также данных вставки (потока байтов).


## replicated_deduplication_window_seconds {#replicated_deduplication_window_seconds}

<SettingsInfoBlock type='UInt64' default_value='3600' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.10" },
        { label: "3600" },
        { label: "уменьшено значение по умолчанию" }
      ]
    }
  ]}
/>

Количество секунд, по истечении которых хеш-суммы вставленных блоков
удаляются из ClickHouse Keeper.

Возможные значения:

- Любое положительное целое число.

Аналогично [replicated_deduplication_window](#replicated_deduplication_window),
`replicated_deduplication_window_seconds` определяет, как долго хранить хеш-суммы
блоков для дедупликации вставок. Хеш-суммы старше
`replicated_deduplication_window_seconds` удаляются из ClickHouse Keeper,
даже если их количество меньше ` replicated_deduplication_window`.

Время отсчитывается относительно времени самой последней записи, а не астрономического
времени. Если это единственная запись, она будет храниться бесконечно.


## replicated_deduplication_window_seconds_for_async_inserts {#replicated_deduplication_window_seconds_for_async_inserts}

<SettingsInfoBlock type='UInt64' default_value='604800' />

Количество секунд, по истечении которых хеш-суммы асинхронных вставок
удаляются из ClickHouse Keeper.

Возможные значения:

- Любое положительное целое число.

Аналогично [replicated_deduplication_window_for_async_inserts](#replicated_deduplication_window_for_async_inserts),
параметр `replicated_deduplication_window_seconds_for_async_inserts` определяет,
как долго хранить хеш-суммы блоков для дедупликации асинхронных вставок. Хеш-суммы
старше `replicated_deduplication_window_seconds_for_async_inserts`
удаляются из ClickHouse Keeper, даже если их количество меньше значения
`replicated_deduplication_window_for_async_inserts`.

Время отсчитывается относительно времени самой последней записи, а не астрономического
времени. Если это единственная запись, она будет храниться бесконечно.


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

Максимальное количество команд мутации, которые могут быть объединены и выполнены в
одной записи MUTATE_PART (0 — без ограничений)


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

Если доля поврежденных частей от общего количества частей меньше этого значения —
разрешается запуск.

Possible values:

- Float, 0.0 - 1.0


## search_orphaned_parts_disks {#search_orphaned_parts_disks}

<SettingsInfoBlock type='SearchOrphanedPartsDisks' default_value='any' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.8" }, { label: "any" }, { label: "Новая настройка" }]
    }
  ]}
/>

ClickHouse сканирует все диски на наличие потерянных частей при выполнении любой операции ATTACH или CREATE TABLE,
чтобы не пропустить части данных на неопределённых дисках (не включённых в политику хранения).
Потерянные части возникают в результате потенциально небезопасной реконфигурации хранилища, например, если диск был исключён из политики хранения.
Данная настройка ограничивает область поиска дисков по их характеристикам.

Возможные значения:

- any — область не ограничена.
- local — область ограничена локальными дисками.
- none — пустая область, поиск не выполняется.


## serialization_info_version {#serialization_info_version}

<SettingsInfoBlock
  type='MergeTreeSerializationInfoVersion'
  default_value='with_types'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.11" },
        { label: "with_types" },
        {
          label:
            "Переход на новый формат с поддержкой пользовательской сериализации строк"
        }
      ]
    },
    {
      id: "row-2",
      items: [{ label: "25.10" }, { label: "basic" }, { label: "Новая настройка" }]
    }
  ]}
/>

Версия информации о сериализации, используемая при записи `serialization.json`.
Эта настройка необходима для обеспечения совместимости при обновлении кластера.

Возможные значения:

- `basic` — базовый формат.
- `with_types` — формат с дополнительным полем `types_serialization_versions`, позволяющий задавать версии сериализации для каждого типа данных.
  Это делает эффективными такие настройки, как `string_serialization_version`.

При последовательном обновлении установите значение `basic`, чтобы новые серверы создавали
части данных, совместимые со старыми серверами. После завершения обновления
переключитесь на `with_types`, чтобы включить версии сериализации для каждого типа.


## shared_merge_tree_activate_coordinated_merges_tasks {#shared_merge_tree_activate_coordinated_merges_tasks}

<BetaBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.9" }, { label: "0" }, { label: "Новая настройка" }]
    },
    {
      id: "row-2",
      items: [{ label: "25.8" }, { label: "0" }, { label: "Новая настройка" }]
    },
    {
      id: "row-3",
      items: [{ label: "25.7" }, { label: "0" }, { label: "Новая настройка" }]
    },
    {
      id: "row-4",
      items: [{ label: "25.6" }, { label: "0" }, { label: "Новая настройка" }]
    },
    {
      id: "row-5",
      items: [{ label: "25.10" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

Активирует переназначение задач координированных слияний. Может быть полезна даже при
shared_merge_tree_enable_coordinated_merges=0, так как это позволит собрать статистику координатора
слияний и облегчит холодный старт.


## shared_merge_tree_create_per_replica_metadata_nodes {#shared_merge_tree_create_per_replica_metadata_nodes}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.11" },
        { label: "0" },
        { label: "Сокращение объема метаданных в Keeper." }
      ]
    },
    {
      id: "row-2",
      items: [{ label: "25.1" }, { label: "1" }, { label: "Синхронизация с Cloud" }]
    }
  ]}
/>

Включает создание узлов /metadata и /columns для каждой реплики в ZooKeeper.
Доступно только в ClickHouse Cloud


## shared_merge_tree_disable_merges_and_mutations_assignment {#shared_merge_tree_disable_merges_and_mutations_assignment}

<SettingsInfoBlock type='Bool' default_value='0' />

Отключает назначение слияний для shared merge tree. Доступно только в ClickHouse Cloud


## shared_merge_tree_empty_partition_lifetime {#shared_merge_tree_empty_partition_lifetime}

<SettingsInfoBlock type='Seconds' default_value='86400' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.9" }, { label: "86400" }, { label: "New setting" }]
    }
  ]}
/>

Количество секунд, в течение которых пустая партиция будет храниться в keeper.


## shared_merge_tree_enable_automatic_empty_partitions_cleanup {#shared_merge_tree_enable_automatic_empty_partitions_cleanup}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.9" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

Включает очистку записей Keeper для пустых партиций.


## shared_merge_tree_enable_coordinated_merges {#shared_merge_tree_enable_coordinated_merges}

<BetaBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "0" }, { label: "New setting" }]
    }
  ]}
/>

Включает стратегию координированного слияния


## shared_merge_tree_enable_keeper_parts_extra_data {#shared_merge_tree_enable_keeper_parts_extra_data}

<BetaBadge />
<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.3" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

Включает запись атрибутов в виртуальные части и фиксацию блоков в Keeper


## shared_merge_tree_enable_outdated_parts_check {#shared_merge_tree_enable_outdated_parts_check}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1" }, { label: "Cloud sync" }]
    }
  ]}
/>

Включает проверку устаревших частей. Доступно только в ClickHouse Cloud


## shared_merge_tree_idle_parts_update_seconds {#shared_merge_tree_idle_parts_update_seconds}

<SettingsInfoBlock type='UInt64' default_value='3600' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "3600" }, { label: "Cloud sync" }]
    }
  ]}
/>

Интервал в секундах для обновления частей без инициирования через механизм watch ZooKeeper в shared merge tree. Доступно только в ClickHouse Cloud


## shared_merge_tree_initial_parts_update_backoff_ms {#shared_merge_tree_initial_parts_update_backoff_ms}

<SettingsInfoBlock type='UInt64' default_value='50' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.2" }, { label: "50" }, { label: "Новая настройка" }]
    }
  ]}
/>

Начальная задержка перед обновлением частей. Доступно только в ClickHouse Cloud


## shared_merge_tree_interserver_http_connection_timeout_ms {#shared_merge_tree_interserver_http_connection_timeout_ms}

<SettingsInfoBlock type='UInt64' default_value='100' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.2" }, { label: "100" }, { label: "New setting" }]
    }
  ]}
/>

Таймауты для межсерверных HTTP-соединений. Доступно только в ClickHouse Cloud


## shared_merge_tree_interserver_http_timeout_ms {#shared_merge_tree_interserver_http_timeout_ms}

<SettingsInfoBlock type='UInt64' default_value='10000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "10000" }, { label: "Cloud sync" }]
    }
  ]}
/>

Таймауты для межсерверного HTTP-взаимодействия. Доступно только в ClickHouse Cloud


## shared_merge_tree_leader_update_period_random_add_seconds {#shared_merge_tree_leader_update_period_random_add_seconds}

<SettingsInfoBlock type='UInt64' default_value='10' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "10" }, { label: "Cloud sync" }]
    }
  ]}
/>

Добавляет равномерно распределённое значение от 0 до x секунд к параметру
shared_merge_tree_leader_update_period для предотвращения
эффекта «лавинообразного наплыва запросов» (thundering herd). Доступно только в ClickHouse Cloud


## shared_merge_tree_leader_update_period_seconds {#shared_merge_tree_leader_update_period_seconds}

<SettingsInfoBlock type='UInt64' default_value='30' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "30" }, { label: "Cloud sync" }]
    }
  ]}
/>

Максимальный период повторной проверки лидерства для обновления партиций. Доступно только в ClickHouse Cloud


## shared_merge_tree_max_outdated_parts_to_process_at_once {#shared_merge_tree_max_outdated_parts_to_process_at_once}

<SettingsInfoBlock type='UInt64' default_value='1000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1000" }, { label: "Cloud sync" }]
    }
  ]}
/>

Максимальное количество устаревших частей, которые лидер попытается подтвердить для удаления в рамках
одного HTTP-запроса. Доступно только в ClickHouse Cloud.


## shared_merge_tree_max_parts_update_backoff_ms {#shared_merge_tree_max_parts_update_backoff_ms}

<SettingsInfoBlock type='UInt64' default_value='5000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.2" }, { label: "5000" }, { label: "Новая настройка" }]
    }
  ]}
/>

Максимальная задержка для обновления частей. Доступно только в ClickHouse Cloud


## shared_merge_tree_max_parts_update_leaders_in_total {#shared_merge_tree_max_parts_update_leaders_in_total}

<SettingsInfoBlock type='UInt64' default_value='6' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "6" }, { label: "Cloud sync" }]
    }
  ]}
/>

Максимальное количество лидеров обновления частей данных. Доступно только в ClickHouse Cloud


## shared_merge_tree_max_parts_update_leaders_per_az {#shared_merge_tree_max_parts_update_leaders_per_az}

<SettingsInfoBlock type='UInt64' default_value='2' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "2" }, { label: "Cloud sync" }]
    }
  ]}
/>

Максимальное количество лидеров обновления частей данных. Доступно только в ClickHouse Cloud


## shared_merge_tree_max_replicas_for_parts_deletion {#shared_merge_tree_max_replicas_for_parts_deletion}

<SettingsInfoBlock type='UInt64' default_value='10' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "10" }, { label: "Cloud sync" }]
    }
  ]}
/>

Максимальное количество реплик, которые будут участвовать в удалении частей данных (поток удаления). Доступно только в ClickHouse Cloud


## shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range {#shared_merge_tree_max_replicas_to_merge_parts_for_each_parts_range}

<SettingsInfoBlock type='UInt64' default_value='5' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "5" }, { label: "Cloud sync" }]
    }
  ]}
/>

Максимальное количество реплик, которые будут пытаться назначить потенциально конфликтующие слияния (позволяет избежать избыточных конфликтов при назначении слияний). Значение 0 означает отключение. Доступно только в ClickHouse Cloud


## shared_merge_tree_max_suspicious_broken_parts {#shared_merge_tree_max_suspicious_broken_parts}

<SettingsInfoBlock type='UInt64' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.2" },
        { label: "0" },
        { label: "Максимальное количество поврежденных частей для SMT, при превышении которого автоматическое отсоединение запрещается" }
      ]
    }
  ]}
/>

Максимальное количество поврежденных частей для SMT, при превышении которого автоматическое отсоединение запрещается.


## shared_merge_tree_max_suspicious_broken_parts_bytes {#shared_merge_tree_max_suspicious_broken_parts_bytes}

<SettingsInfoBlock type='UInt64' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.2" },
        { label: "0" },
        {
          label:
            "Максимальный размер всех поврежденных частей для SMT; если превышен — автоматическое отсоединение запрещается"
        }
      ]
    }
  ]}
/>

Максимальный размер всех поврежденных частей для SMT; если превышен — автоматическое отсоединение запрещается.


## shared_merge_tree_memo_ids_remove_timeout_seconds {#shared_merge_tree_memo_ids_remove_timeout_seconds}

<SettingsInfoBlock type='Int64' default_value='1800' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1800" }, { label: "Cloud sync" }]
    }
  ]}
/>

Время хранения идентификаторов мемоизации вставок для предотвращения ошибочных действий при повторных попытках вставки. Доступно только в ClickHouse Cloud


## shared_merge_tree_merge_coordinator_election_check_period_ms {#shared_merge_tree_merge_coordinator_election_check_period_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='30000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "30000" }, { label: "New setting" }]
    }
  ]}
/>

Интервал между запусками потока выборов координатора слияний


## shared_merge_tree_merge_coordinator_factor {#shared_merge_tree_merge_coordinator_factor}

<BetaBadge />
<SettingsInfoBlock type='Float' default_value='1.1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.5" },
        { label: "1.100000023841858" },
        { label: "Новая настройка" }
      ]
    },
    {
      id: "row-2",
      items: [
        { label: "25.10" },
        { label: "1.100000023841858" },
        { label: "Уменьшено время ожидания координатора после загрузки" }
      ]
    }
  ]}
/>

Коэффициент изменения времени задержки потока координатора


## shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms {#shared_merge_tree_merge_coordinator_fetch_fresh_metadata_period_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='10000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "10000" }, { label: "Новая настройка" }]
    }
  ]}
/>

Как часто координатор слияний должен синхронизироваться с ZooKeeper для получения свежих метаданных


## shared_merge_tree_merge_coordinator_max_merge_request_size {#shared_merge_tree_merge_coordinator_max_merge_request_size}

<BetaBadge />
<SettingsInfoBlock type='UInt64' default_value='20' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "20" }, { label: "New setting" }]
    }
  ]}
/>

Количество слияний, которые координатор может запросить у MergerMutator за один раз


## shared_merge_tree_merge_coordinator_max_period_ms {#shared_merge_tree_merge_coordinator_max_period_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='10000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "10000" }, { label: "New setting" }]
    }
  ]}
/>

Максимальное время между запусками потока координатора слияния


## shared_merge_tree_merge_coordinator_merges_prepare_count {#shared_merge_tree_merge_coordinator_merges_prepare_count}

<BetaBadge />
<SettingsInfoBlock type='UInt64' default_value='100' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "100" }, { label: "Новая настройка" }]
    }
  ]}
/>

Количество записей слияния, которые координатор должен подготовить и распределить между рабочими узлами


## shared_merge_tree_merge_coordinator_min_period_ms {#shared_merge_tree_merge_coordinator_min_period_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "1" }, { label: "New setting" }]
    }
  ]}
/>

Минимальное время между запусками потока координатора слияния


## shared_merge_tree_merge_worker_fast_timeout_ms {#shared_merge_tree_merge_worker_fast_timeout_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='100' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "100" }, { label: "New setting" }]
    }
  ]}
/>

Таймаут, который рабочий поток слияния будет использовать при необходимости обновления своего состояния после выполнения немедленного действия


## shared_merge_tree_merge_worker_regular_timeout_ms {#shared_merge_tree_merge_worker_regular_timeout_ms}

<BetaBadge />
<SettingsInfoBlock type='Milliseconds' default_value='10000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.5" }, { label: "10000" }, { label: "New setting" }]
    }
  ]}
/>

Время между запусками рабочего потока слияния


## shared_merge_tree_outdated_parts_group_size {#shared_merge_tree_outdated_parts_group_size}

<SettingsInfoBlock type='UInt64' default_value='2' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.9" }, { label: "2" }, { label: "Новая настройка" }]
    }
  ]}
/>

Количество реплик в одной группе rendezvous-хеширования для очистки устаревших частей.
Доступно только в ClickHouse Cloud.


## shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations {#shared_merge_tree_partitions_hint_ratio_to_reload_merge_pred_for_mutations}

<SettingsInfoBlock type='Float' default_value='0.5' />

Перезагружает предикат слияния в задаче выбора слияния/мутации, когда соотношение `<партиции-кандидаты только для мутаций (партиции, которые не могут быть объединены)>/<партиции-кандидаты для мутаций>` превышает значение настройки. Доступно только в ClickHouse Cloud


## shared_merge_tree_parts_load_batch_size {#shared_merge_tree_parts_load_batch_size}

<SettingsInfoBlock type='UInt64' default_value='32' />

Количество заданий по получению метаданных частей, планируемых одновременно. Доступно только в
ClickHouse Cloud


## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_ms}

<SettingsInfoBlock type='UInt64' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Cloud sync" }]
    }
  ]}
/>

Время хранения локально объединённой части без запуска нового слияния, включающего
эту часть. Даёт другим репликам возможность получить эту часть и запустить слияние.
Доступно только в ClickHouse Cloud.


## shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold {#shared_merge_tree_postpone_next_merge_for_locally_merged_parts_rows_threshold}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1000000" }, { label: "Cloud sync" }]
    }
  ]}
/>

Минимальный размер части (в строках), при котором откладывается назначение следующего слияния сразу после её локального слияния. Доступно только в ClickHouse Cloud.


## shared_merge_tree_range_for_merge_window_size {#shared_merge_tree_range_for_merge_window_size}

<SettingsInfoBlock type='UInt64' default_value='10' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "10" }, { label: "Cloud sync" }]
    }
  ]}
/>

Время хранения локально объединённой части без запуска нового слияния, включающего
эту часть. Даёт другим репликам возможность получить эту часть и начать слияние.
Доступно только в ClickHouse Cloud


## shared_merge_tree_read_virtual_parts_from_leader {#shared_merge_tree_read_virtual_parts_from_leader}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1" }, { label: "Cloud sync" }]
    }
  ]}
/>

Читать виртуальные части с лидера, когда это возможно. Доступно только в ClickHouse
Cloud


## shared_merge_tree_try_fetch_part_in_memory_data_from_replicas {#shared_merge_tree_try_fetch_part_in_memory_data_from_replicas}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.1" },
        { label: "0" },
        { label: "Новая настройка для получения данных кусков из других реплик" }
      ]
    }
  ]}
/>

Если включено, все реплики пытаются получить данные куска, хранящиеся в памяти (такие как первичный ключ, информация о партиции и т.д.), из других реплик, где они уже существуют.


## shared_merge_tree_update_replica_flags_delay_ms {#shared_merge_tree_update_replica_flags_delay_ms}

<SettingsInfoBlock type='Milliseconds' default_value='30000' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.8" }, { label: "30000" }, { label: "Новая настройка" }]
    }
  ]}
/>

Как часто реплика будет пытаться перезагрузить свои флаги согласно фоновому расписанию.


## shared_merge_tree_use_metadata_hints_cache {#shared_merge_tree_use_metadata_hints_cache}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "1" }, { label: "Cloud sync" }]
    }
  ]}
/>

Включает запрос подсказок кэша FS из кэша в оперативной памяти
на других репликах. Доступно только в ClickHouse Cloud


## shared_merge_tree_use_outdated_parts_compact_format {#shared_merge_tree_use_outdated_parts_compact_format}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.9" },
        { label: "1" },
        { label: "Включить версию v3 устаревших частей по умолчанию" }
      ]
    },
    {
      id: "row-2",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Синхронизация с Cloud" }]
    }
  ]}
/>

Использовать компактный формат для устаревших частей: снижает нагрузку на Keeper, улучшает
обработку устаревших частей. Доступно только в ClickHouse Cloud


## shared_merge_tree_use_too_many_parts_count_from_virtual_parts {#shared_merge_tree_use_too_many_parts_count_from_virtual_parts}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.1" }, { label: "0" }, { label: "Cloud sync" }]
    }
  ]}
/>

Если включено, счётчик избыточного количества частей будет опираться на общие данные в Keeper, а не на локальное состояние реплики. Доступно только в ClickHouse Cloud


## shared_merge_tree_virtual_parts_discovery_batch {#shared_merge_tree_virtual_parts_discovery_batch}

<ExperimentalBadge />
<SettingsInfoBlock type='UInt64' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.8" }, { label: "1" }, { label: "New setting" }]
    }
  ]}
/>

Количество обнаружений партиций, которые должны быть объединены в пакет


## simultaneous_parts_removal_limit {#simultaneous_parts_removal_limit}

<SettingsInfoBlock type='UInt64' default_value='0' />

Если накопилось большое количество устаревших кусков данных, поток очистки будет пытаться удалить до
`simultaneous_parts_removal_limit` кусков за одну итерацию.
Значение `simultaneous_parts_removal_limit`, равное `0`, означает отсутствие ограничений.


## sleep_before_commit_local_part_in_replicated_table_ms {#sleep_before_commit_local_part_in_replicated_table_ms}

<SettingsInfoBlock type='Milliseconds' default_value='0' />

Для тестирования. Не изменяйте.


## sleep_before_loading_outdated_parts_ms {#sleep_before_loading_outdated_parts_ms}

<SettingsInfoBlock type='UInt64' default_value='0' />

Для тестирования. Не изменяйте.


## storage_policy {#storage_policy}

<SettingsInfoBlock type='String' default_value='default' />

Название политики хранения данных


## string_serialization_version {#string_serialization_version}

<SettingsInfoBlock
  type='MergeTreeStringSerializationVersion'
  default_value='with_size_stream'
/>
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [
        { label: "25.11" },
        { label: "with_size_stream" },
        { label: "Переход на новый формат с раздельным хранением размеров" }
      ]
    },
    {
      id: "row-2",
      items: [
        { label: "25.10" },
        { label: "single_stream" },
        { label: "Новая настройка" }
      ]
    }
  ]}
/>

Управляет форматом сериализации для столбцов `String` верхнего уровня.

Эта настройка действует только при установке `serialization_info_version` в значение "with_types".
При включении столбцы `String` верхнего уровня сериализуются с отдельным подстолбцом `.size`,
в котором хранятся длины строк, вместо встроенного способа хранения. Это позволяет использовать полноценные подстолбцы `.size`
и может повысить эффективность сжатия.

Вложенные типы `String` (например, внутри `Nullable`, `LowCardinality`, `Array` или `Map`)
не затрагиваются, за исключением случаев, когда они находятся внутри `Tuple`.

Возможные значения:

- `single_stream` — использовать стандартный формат сериализации со встроенным хранением размеров.
- `with_size_stream` — использовать отдельный поток для хранения размеров столбцов `String` верхнего уровня.


## table_disk {#table_disk}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.2" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

Это табличный диск, путь/конечная точка должны указывать на данные таблицы, а не на данные базы данных. Может быть установлена только для s3_plain/s3_plain_rewritable/web.


## temporary_directories_lifetime {#temporary_directories_lifetime}

<SettingsInfoBlock type='Seconds' default_value='86400' />

Время хранения tmp\_-директорий в секундах. Не рекомендуется уменьшать это значение,
так как слияния и мутации могут работать некорректно при низком значении данной
настройки.


## try_fetch_recompressed_part_timeout {#try_fetch_recompressed_part_timeout}

<SettingsInfoBlock type='Seconds' default_value='7200' />

Таймаут (в секундах) перед началом слияния с перекомпрессией. В течение этого
времени ClickHouse пытается получить перекомпрессированный кусок от реплики, которой назначено
данное слияние с перекомпрессией.

Перекомпрессия в большинстве случаев выполняется медленно, поэтому слияние с
перекомпрессией не начинается до истечения этого таймаута, и ClickHouse пытается получить перекомпрессированный кусок от
реплики, которой назначено данное слияние с перекомпрессией.

Возможные значения:

- Любое положительное целое число.


## ttl_only_drop_parts {#ttl_only_drop_parts}

<SettingsInfoBlock type='Bool' default_value='0' />

Определяет, будут ли куски данных полностью удалены в таблицах MergeTree, когда срок действия всех строк в этом куске истёк согласно настройкам `TTL`.

Когда `ttl_only_drop_parts` отключён (по умолчанию), удаляются только те строки, срок действия которых истёк согласно настройкам TTL.

Когда `ttl_only_drop_parts` включён, весь кусок удаляется, если срок действия всех строк в этом куске истёк согласно настройкам `TTL`.


## use_adaptive_write_buffer_for_dynamic_subcolumns {#use_adaptive_write_buffer_for_dynamic_subcolumns}

<SettingsInfoBlock type='Bool' default_value='1' />

Разрешает использование адаптивных буферов записи при записи динамических подстолбцов для
снижения потребления памяти


## use_async_block_ids_cache {#use_async_block_ids_cache}

<SettingsInfoBlock type='Bool' default_value='1' />

Если установлено значение true, хеш-суммы асинхронных вставок кэшируются.

Возможные значения:

- `true`
- `false`

Блок, содержащий несколько асинхронных вставок, генерирует несколько хеш-сумм.
Когда некоторые вставки дублируются, Keeper возвращает только одну
дублированную хеш-сумму за один RPC-вызов, что приводит к ненужным повторным RPC-запросам.
Этот кэш отслеживает путь к хеш-суммам в Keeper. При обнаружении обновлений
в Keeper кэш обновляется как можно быстрее, что позволяет фильтровать дублированные вставки в памяти.


## use_compact_variant_discriminators_serialization {#use_compact_variant_discriminators_serialization}

<SettingsInfoBlock type='Bool' default_value='1' />

Включает компактный режим бинарной сериализации дискриминаторов в типе данных Variant.
Этот режим позволяет значительно сократить объём памяти для хранения дискриминаторов
в партах, когда преобладает один вариант или присутствует большое количество значений NULL.


## use_const_adaptive_granularity {#use_const_adaptive_granularity}

<SettingsInfoBlock type='Bool' default_value='0' />

Всегда использовать постоянную гранулярность для всего куска данных. Это позволяет сжимать 
значения гранулярности индекса в памяти. Может быть полезно при работе с очень большими 
нагрузками на узких таблицах.


## use_metadata_cache {#use_metadata_cache}

<SettingsInfoBlock type="Bool" default_value="0" />
Устаревшая настройка, ничего не делает.
## use_minimalistic_checksums_in_zookeeper {#use_minimalistic_checksums_in_zookeeper} 
<SettingsInfoBlock type="Bool" default_value="1" />

Использует компактный формат (десятки байт) для контрольных сумм частей в ZooKeeper вместо
обычного формата (десятки КБ). Перед включением убедитесь, что все реплики поддерживают
новый формат.


## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

<SettingsInfoBlock type='Bool' default_value='1' />

Метод хранения заголовков частей данных в ZooKeeper. При включении данной настройки ZooKeeper
хранит меньший объём данных. Подробнее см. [здесь](/operations/server-configuration-parameters/settings#use_minimalistic_part_header_in_zookeeper).


## use_primary_key_cache {#use_primary_key_cache}

<SettingsInfoBlock type='Bool' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "24.12" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

Использовать кэш для первичного индекса
вместо хранения всех индексов в памяти. Может быть полезно для очень больших таблиц


## vertical_merge_algorithm_min_bytes_to_activate {#vertical_merge_algorithm_min_bytes_to_activate}

<SettingsInfoBlock type='UInt64' default_value='0' />

Минимальный (приблизительный) несжатый размер в байтах объединяемых частей для активации
алгоритма вертикального слияния.


## vertical_merge_algorithm_min_columns_to_activate {#vertical_merge_algorithm_min_columns_to_activate}

<SettingsInfoBlock type='UInt64' default_value='11' />

Минимальное количество столбцов, не входящих в первичный ключ, необходимое для активации алгоритма вертикального слияния.


## vertical_merge_algorithm_min_rows_to_activate {#vertical_merge_algorithm_min_rows_to_activate}

<SettingsInfoBlock type='UInt64' default_value='131072' />

Минимальное (приблизительное) количество строк в
объединяемых частях для активации алгоритма вертикального слияния.


## vertical_merge_optimize_lightweight_delete {#vertical_merge_optimize_lightweight_delete}

<SettingsInfoBlock type='Bool' default_value='1' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.9" }, { label: "1" }, { label: "Новая настройка" }]
    }
  ]}
/>

Если значение true, легковесное удаление оптимизируется при вертикальном слиянии.


## vertical_merge_remote_filesystem_prefetch {#vertical_merge_remote_filesystem_prefetch}

<SettingsInfoBlock type='Bool' default_value='1' />

Если значение true, то во время слияния используется предварительная загрузка данных из удалённой файловой системы для следующего столбца


## wait_for_unique_parts_send_before_shutdown_ms {#wait_for_unique_parts_send_before_shutdown_ms}

<SettingsInfoBlock type='Milliseconds' default_value='0' />

Перед завершением работы таблица будет ожидать в течение указанного времени, пока уникальные части
(существующие только на текущей реплике) не будут получены другими репликами (значение 0 означает
отключение функции).


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
<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Включение записи меток для подпотоков в компактных частях по умолчанию"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Включает запись меток для каждого подпотока вместо записи для каждого столбца в компактных частях.
Позволяет эффективно читать отдельные подстолбцы из части данных.

Например, столбец `t Tuple(a String, b UInt32, c Array(Nullable(UInt32)))` сериализуется в следующие подпотоки:

- `t.a` для данных String элемента кортежа `a`
- `t.b` для данных UInt32 элемента кортежа `b`
- `t.c.size0` для размеров массива элемента кортежа `c`
- `t.c.null` для карты null вложенных элементов массива элемента кортежа `c`
- `t.c` для данных UInt32 вложенных элементов массива элемента кортежа `c`

Когда эта настройка включена, метка записывается для каждого из этих 5 подпотоков, что позволяет при необходимости читать
данные каждого отдельного подпотока из гранулы независимо. Например, если требуется прочитать подстолбец `t.c`, будут прочитаны только данные
подпотоков `t.c.size0`, `t.c.null` и `t.c`, а данные из подпотоков `t.a` и `t.b` читаться не будут. Когда эта настройка отключена,
метка записывается только для столбца верхнего уровня `t`, что означает, что всегда будут читаться все данные столбца из гранулы, даже если требуются данные только некоторых подпотоков.


## zero_copy_concurrent_part_removal_max_postpone_ratio {#zero_copy_concurrent_part_removal_max_postpone_ratio}

<SettingsInfoBlock type='Float' default_value='0.05' />

Максимальный процент частей верхнего уровня, удаление которых следует отложить для получения
меньших независимых диапазонов. Не рекомендуется изменять.


## zero_copy_concurrent_part_removal_max_split_times {#zero_copy_concurrent_part_removal_max_split_times}

<SettingsInfoBlock type='UInt64' default_value='5' />

Максимальная глубина рекурсии для разделения независимых диапазонов устаревших частей на меньшие поддиапазоны. Изменять не рекомендуется.


## zero_copy_merge_mutation_min_parts_size_sleep_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_before_lock}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />

Если включена репликация с нулевым копированием, перед попыткой установки блокировки выполняется ожидание случайного промежутка времени в зависимости от размера кусков данных для слияния или мутации


## zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock {#zero_copy_merge_mutation_min_parts_size_sleep_no_scale_before_lock}

<SettingsInfoBlock type='UInt64' default_value='0' />
<VersionHistory
  rows={[
    {
      id: "row-1",
      items: [{ label: "25.3" }, { label: "0" }, { label: "Новая настройка" }]
    }
  ]}
/>

Если включена репликация с нулевым копированием, выполняется случайная задержка до 500 мс
перед попыткой блокировки для слияния или мутации.


## zookeeper_session_expiration_check_period {#zookeeper_session_expiration_check_period}

<SettingsInfoBlock type='Seconds' default_value='60' />

Период проверки истечения срока действия сессии ZooKeeper, в секундах.

Возможные значения:

- Любое положительное целое число.
