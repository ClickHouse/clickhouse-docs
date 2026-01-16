---
title: 'Настройки сессии'
sidebar_label: 'Настройки сессии'
slug: /operations/settings/settings
toc_max_heading_level: 2
description: 'Настройки, которые находятся в таблице ``system.settings``.'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

{/* Автоматически сгенерировано */ }

Все ниже перечисленные настройки также доступны в таблице [system.settings](/docs/operations/system-tables/settings). Эти настройки автоматически генерируются из [исходного кода](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/Settings.cpp).


## add_http_cors_header \\{#add_http_cors_header\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Добавлять HTTP-заголовок CORS.

## additional_result_filter \{#additional_result_filter\}

Дополнительное выражение фильтрации, применяемое к результату запроса `SELECT`.
Этот параметр не применяется к подзапросам.

**Пример**

```sql
INSERT INTO table_1 VALUES (1, 'a'), (2, 'bb'), (3, 'ccc'), (4, 'dddd');
SElECT * FROM table_1;
```

```response
┌─x─┬─y────┐
│ 1 │ a    │
│ 2 │ bb   │
│ 3 │ ccc  │
│ 4 │ dddd │
└───┴──────┘
```

```sql
SELECT *
FROM table_1
SETTINGS additional_result_filter = 'x != 2'
```

```response
┌─x─┬─y────┐
│ 1 │ a    │
│ 3 │ ccc  │
│ 4 │ dddd │
└───┴──────┘
```


## additional_table_filters \{#additional_table_filters\}

<SettingsInfoBlock type="Map" default_value="{}" />

Дополнительное фильтрующее выражение, которое применяется после чтения
из указанной таблицы.

**Пример**

```sql
INSERT INTO table_1 VALUES (1, 'a'), (2, 'bb'), (3, 'ccc'), (4, 'dddd');
SELECT * FROM table_1;
```

```response
┌─x─┬─y────┐
│ 1 │ a    │
│ 2 │ bb   │
│ 3 │ ccc  │
│ 4 │ dddd │
└───┴──────┘
```

```sql
SELECT *
FROM table_1
SETTINGS additional_table_filters = {'table_1': 'x != 2'}
```

```response
┌─x─┬─y────┐
│ 1 │ a    │
│ 3 │ ccc  │
│ 4 │ dddd │
└───┴──────┘
```


## aggregate_function_input_format \{#aggregate_function_input_format\}

<SettingsInfoBlock type="AggregateFunctionInputFormat" default_value="state" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "state"},{"label": "Новая настройка для управления форматом ввода AggregateFunction при операциях INSERT. Значение настройки по умолчанию — state"}]}]} />

Формат ввода для AggregateFunction при операциях INSERT.

Возможные значения:

* `state` — двоичная строка с сериализованным состоянием (значение по умолчанию). Это поведение по умолчанию, при котором значения AggregateFunction ожидаются в виде бинарных данных.
* `value` — формат ожидает одно значение аргумента агрегатной функции или, в случае нескольких аргументов, кортеж из них. Эти значения будут десериализованы с использованием соответствующих IDataType или DataTypeTuple, а затем агрегированы для формирования состояния.
* `array` — формат ожидает Array значений, как описано в варианте `value` выше. Все элементы массива будут агрегированы для формирования состояния.

**Примеры**

Для таблицы со структурой:

```sql
CREATE TABLE example (
    user_id UInt64,
    avg_session_length AggregateFunction(avg, UInt32)
);
```

При `aggregate_function_input_format = 'value'`:

```sql
INSERT INTO example FORMAT CSV
123,456
```

При `aggregate_function_input_format = 'array'`:

```sql
INSERT INTO example FORMAT CSV
123,"[456,789,101]"
```

Примечание: форматы `value` и `array` работают медленнее, чем формат по умолчанию `state`, так как при вставке требуется создавать значения и выполнять их агрегирование.


## aggregate_functions_null_for_empty \{#aggregate_functions_null_for_empty\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает перезапись всех агрегатных функций в запросе с добавлением к ним суффикса [-OrNull](/sql-reference/aggregate-functions/combinators#-ornull). Включите этот параметр для совместимости со стандартом SQL.
Реализовано посредством перезаписи запроса (аналогично настройке [count&#95;distinct&#95;implementation](#count_distinct_implementation)), чтобы получить согласованные результаты для распределённых запросов.

Возможные значения:

* 0 — Отключено.
* 1 — Включено.

**Пример**

Рассмотрим следующий запрос с агрегатными функциями:

```sql
SELECT SUM(-1), MAX(0) FROM system.one WHERE 0;
```

При `aggregate_functions_null_for_empty = 0` это приведёт к следующему результату:

```text
┌─SUM(-1)─┬─MAX(0)─┐
│       0 │      0 │
└─────────┴────────┘
```

При `aggregate_functions_null_for_empty = 1` результат будет следующим:

```text
┌─SUMOrNull(-1)─┬─MAXOrNull(0)─┐
│          NULL │         NULL │
└───────────────┴──────────────┘
```


## aggregation_in_order_max_block_bytes \\{#aggregation_in_order_max_block_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="50000000" />

Максимальный размер блока в байтах, накапливаемого во время агрегации в порядке первичного ключа. Меньший размер блока позволяет сильнее распараллелить финальную стадию слияния результатов агрегации.

## aggregation_memory_efficient_merge_threads \\{#aggregation_memory_efficient_merge_threads\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Количество потоков, используемых для слияния промежуточных результатов агрегации в режиме экономичного использования памяти. Чем больше значение, тем больше потребление памяти. 0 означает то же, что и `max_threads`.

## allow_aggregate_partitions_independently \\{#allow_aggregate_partitions_independently\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает независимую агрегацию партиций в отдельных потоках, когда ключ партиции совпадает с ключом `GROUP BY`. Полезно, когда количество партиций близко к количеству ядер и партиции имеют примерно одинаковый размер.

## allow_archive_path_syntax \\{#allow_archive_path_syntax\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "Добавлен новый параметр, позволяющий отключить синтаксис пути к архиву."}]}, {"id": "row-2","items": [{"label": "24.5"},{"label": "1"},{"label": "Добавлен новый параметр, позволяющий отключить синтаксис пути к архиву."}]}]}/>

Движки File/S3 и табличная функция будут интерпретировать пути с `::` как `<archive> :: <file>`, если архив имеет корректное расширение.

## allow_asynchronous_read_from_io_pool_for_merge_tree \\{#allow_asynchronous_read_from_io_pool_for_merge_tree\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать фоновый пул ввода-вывода для чтения из таблиц MergeTree. Этот параметр может повысить производительность для запросов, ограниченных скоростью операций ввода-вывода.

## allow_changing_replica_until_first_data_packet \\{#allow_changing_replica_until_first_data_packet\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, при hedged-запросах можно устанавливать новое соединение до получения первого пакета данных, даже если уже есть некоторый прогресс
(но он не обновлялся в течение таймаута `receive_data_timeout`), в противном случае смена реплики запрещается после первого момента, когда был достигнут прогресс.

## allow_create_index_without_type \\{#allow_create_index_without_type\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает выполнять запрос CREATE INDEX без TYPE. Такой запрос будет проигнорирован. Предназначено для тестов совместимости SQL.

## allow_custom_error_code_in_throwif \\{#allow_custom_error_code_in_throwif\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использование пользовательского кода ошибки в функции throwIf(). Если установлено значение true, выбрасываемые исключения могут иметь неожиданные коды ошибок.

## allow_ddl \\{#allow_ddl\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр имеет значение `true`, пользователю разрешается выполнять DDL-запросы.

## allow_deprecated_database_ordinary \\{#allow_deprecated_database_ordinary\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает создание баз данных с устаревшим движком Ordinary

## allow_deprecated_error_prone_window_functions \\{#allow_deprecated_error_prone_window_functions\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "Разрешить использование устаревших оконных функций, склонных к ошибкам (neighbor, runningAccumulate, runningDifferenceStartingWithFirstValue, runningDifference)"}]}]}/>

Разрешить использование устаревших оконных функций, склонных к ошибкам (neighbor, runningAccumulate, runningDifferenceStartingWithFirstValue, runningDifference)

## allow_deprecated_snowflake_conversion_functions \\{#allow_deprecated_snowflake_conversion_functions\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Отключены устаревшие функции snowflakeToDateTime[64] и dateTime[64]ToSnowflake."}]}]}/>

Функции `snowflakeToDateTime`, `snowflakeToDateTime64`, `dateTimeToSnowflake` и `dateTime64ToSnowflake` являются устаревшими и по умолчанию отключены.
Используйте вместо них функции `snowflakeIDToDateTime`, `snowflakeIDToDateTime64`, `dateTimeToSnowflakeID` и `dateTime64ToSnowflakeID`.

Чтобы повторно включить устаревшие функции (например, в переходный период), установите этот параметр в `true`.

## allow_deprecated_syntax_for_merge_tree \\{#allow_deprecated_syntax_for_merge_tree\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает создавать таблицы *MergeTree с устаревшим синтаксисом задания движка

## allow_distributed_ddl \\{#allow_distributed_ddl\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр установлен в значение `true`, пользователю разрешено выполнять распределённые DDL‑запросы.

## allow_drop_detached \\{#allow_drop_detached\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает запросы ALTER TABLE ... DROP DETACHED PART[ITION] ...

## allow_dynamic_type_in_join_keys \\{#allow_dynamic_type_in_join_keys\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "По умолчанию запрещает использование типа Dynamic в ключах JOIN"}]}]}/>

Разрешает использование типа Dynamic в ключах JOIN. Этот параметр добавлен для совместимости. Не рекомендуется использовать тип Dynamic в ключах JOIN, поскольку сравнение с другими типами может приводить к неожиданным результатам.

## allow_execute_multiif_columnar \\{#allow_execute_multiif_columnar\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает столбцовое выполнение функции multiIf

## allow_experimental_alias_table_engine \\{#allow_experimental_alias_table_engine\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Позволяет создавать таблицы с движком Alias.

## allow_experimental_analyzer \\{#allow_experimental_analyzer\\}

**Псевдонимы**: `enable_analyzer`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Анализатор и планировщик по умолчанию включены."}]}]}/>

Разрешает использование нового анализатора запросов.

## allow_experimental_codecs \\{#allow_experimental_codecs\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Если имеет значение true, позволяет указывать экспериментальные кодеки сжатия (но таких кодеков пока нет, поэтому эта опция ничего не делает).

## allow_experimental_correlated_subqueries \\{#allow_experimental_correlated_subqueries\\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Поддержка коррелированных подзапросов помечена как Beta."}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "Добавлена новая настройка, разрешающая выполнение коррелированных подзапросов."}]}]}/>

Разрешает выполнение коррелированных подзапросов.

## allow_experimental_database_glue_catalog \\{#allow_experimental_database_glue_catalog\\}

<BetaBadge/>

**Псевдонимы**: `allow_database_glue_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "Разрешает использование экспериментального движка базы данных DataLakeCatalog с catalog_type = 'glue'"}]}]}/>

Разрешает использование экспериментального движка базы данных DataLakeCatalog с catalog_type = 'glue'

## allow_experimental_database_hms_catalog \\{#allow_experimental_database_hms_catalog\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Разрешает использование экспериментального движка базы данных DataLakeCatalog с catalog_type = 'hive'"}]}]}/>

Разрешает использование экспериментального движка базы данных DataLakeCatalog с catalog_type = 'hms'

## allow_experimental_database_iceberg \\{#allow_experimental_database_iceberg\\}

<BetaBadge/>

**Псевдонимы**: `allow_database_iceberg`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting."}]}]}/>

Разрешает экспериментальный движок базы данных DataLakeCatalog с catalog_type = 'iceberg'

## allow_experimental_database_materialized_postgresql \\{#allow_experimental_database_materialized_postgresql\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Включает возможность создания базы данных с движком Engine=MaterializedPostgreSQL(...).

## allow_experimental_database_paimon_rest_catalog \\{#allow_experimental_database_paimon_rest_catalog\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Разрешает использование экспериментального движка базы данных DataLakeCatalog с catalog_type = 'paimon_rest'

## allow_experimental_database_unity_catalog \\{#allow_experimental_database_unity_catalog\\}

<BetaBadge/>

**Псевдонимы**: `allow_database_unity_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "Разрешить экспериментальный движок базы данных DataLakeCatalog с параметром catalog_type = 'unity'"}]}]}/>

Разрешить экспериментальный движок базы данных DataLakeCatalog с параметром catalog_type = 'unity'

## allow_experimental_delta_kernel_rs \\{#allow_experimental_delta_kernel_rs\\}

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

Разрешить использование экспериментальной реализации delta-kernel-rs.

## allow_experimental_delta_lake_writes \\{#allow_experimental_delta_lake_writes\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Включает функцию записи delta-kernel.

## allow_experimental_funnel_functions \\{#allow_experimental_funnel_functions\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Включает экспериментальные функции для анализа воронки.

## allow_experimental_hash_functions \\{#allow_experimental_hash_functions\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Включить экспериментальные хеш-функции

## allow_experimental_iceberg_compaction \\{#allow_experimental_iceberg_compaction\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Разрешает явное использование команды `OPTIMIZE` для таблиц Iceberg.

## allow_experimental_insert_into_iceberg \\{#allow_experimental_insert_into_iceberg\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting."}]}]}/>

Разрешает выполнение запросов `insert` в Iceberg.

## allow_experimental_join_right_table_sorting \\{#allow_experimental_join_right_table_sorting\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Если параметр установлен в true и выполнены условия `join_to_sort_minimum_perkey_rows` и `join_to_sort_maximum_table_rows`, правая таблица пересортировывается по ключу для повышения производительности левого или внутреннего хеш-соединения"}]}]}/>

Если параметр установлен в true и выполнены условия `join_to_sort_minimum_perkey_rows` и `join_to_sort_maximum_table_rows`, правая таблица пересортировывается по ключу для повышения производительности левого или внутреннего хеш-соединения.

## allow_experimental_kafka_offsets_storage_in_keeper \\{#allow_experimental_kafka_offsets_storage_in_keeper\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "Разрешает использование экспериментального движка хранения Kafka, который сохраняет зафиксированные смещения в ClickHouse Keeper"}]}]}/>

Разрешает экспериментальную функцию хранения смещений, связанных с Kafka, в ClickHouse Keeper. Когда параметр включен, для движка таблицы Kafka можно указать путь в ClickHouse Keeper и имя реплики. В результате вместо обычного движка Kafka будет использоваться новый тип движка хранения, который хранит зафиксированные смещения в первую очередь в ClickHouse Keeper.

## allow_experimental_kusto_dialect \\{#allow_experimental_kusto_dialect\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

Включает поддержку Kusto Query Language (KQL) — альтернативного варианта SQL.

## allow_experimental_materialized_postgresql_table \\{#allow_experimental_materialized_postgresql_table\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет использовать движок таблицы MaterializedPostgreSQL. По умолчанию отключено, так как эта функция является экспериментальной.

## allow_experimental_nlp_functions \\{#allow_experimental_nlp_functions\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Включает экспериментальные функции обработки естественного языка.

## allow_experimental_object_storage_queue_hive_partitioning \\{#allow_experimental_object_storage_queue_hive_partitioning\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "New setting."}]}]}/>

Разрешает использовать Hive‑партиционирование с движками S3Queue/AzureQueue

## allow_experimental_parallel_reading_from_replicas \\{#allow_experimental_parallel_reading_from_replicas\\}

**Псевдонимы**: `enable_parallel_replicas`

<SettingsInfoBlock type="UInt64" default_value="0" />

Использует при выполнении SELECT-запроса до `max_parallel_replicas` реплик из каждого сегмента. Чтение выполняется параллельно и координируется динамически. 0 — отключено, 1 — включено, при сбое они молча отключаются, 2 — включено, при сбое выбрасывается исключение.

## allow_experimental_prql_dialect \\{#allow_experimental_prql_dialect\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

Включает поддержку PRQL — альтернативы SQL.

## allow_experimental_query_deduplication \\{#allow_experimental_query_deduplication\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Экспериментальное удаление дубликатов данных для SELECT-запросов на основе UUID частей таблицы

## allow_experimental_statistics \\{#allow_experimental_statistics\\}

<ExperimentalBadge/>

**Псевдонимы**: `allow_experimental_statistic`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Параметр был переименован. Предыдущее имя — `allow_experimental_statistic`."}]}]}/>

Разрешает создавать столбцы со [статистикой](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-creating-a-table) и [управлять статистикой](../../engines/table-engines/mergetree-family/mergetree.md/#column-statistics).

## allow_experimental_time_series_aggregate_functions \\{#allow_experimental_time_series_aggregate_functions\\}

<ExperimentalBadge/>

**Псевдонимы**: `allow_experimental_ts_to_grid_aggregate_function`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Новая настройка, позволяющая включить экспериментальные агрегатные функции timeSeries*."}]}]}/>

Экспериментальные агрегатные функции timeSeries* для ресемплирования, расчёта скорости изменения (rate) и дельты для временных рядов в стиле Prometheus.

## allow_experimental_time_series_table \\{#allow_experimental_time_series_table\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "Добавлена новая настройка, разрешающая использование движка таблицы TimeSeries"}]}]}/>

Разрешает создание таблиц с движком таблицы [TimeSeries](../../engines/table-engines/integrations/time-series.md). Возможные значения:

- 0 — движок таблицы [TimeSeries](../../engines/table-engines/integrations/time-series.md) отключен.
- 1 — движок таблицы [TimeSeries](../../engines/table-engines/integrations/time-series.md) включен.

## allow_experimental_window_view \\{#allow_experimental_window_view\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Включить WINDOW VIEW. Функция пока недостаточно зрелая.

## allow_experimental_ytsaurus_dictionary_source \\{#allow_experimental_ytsaurus_dictionary_source\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Экспериментальный источник словаря для интеграции с YTsaurus.

## allow_experimental_ytsaurus_table_engine \\{#allow_experimental_ytsaurus_table_engine\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новый параметр."}]}]}/>

Экспериментальный движок таблицы для интеграции с YTsaurus.

## allow_experimental_ytsaurus_table_function \\{#allow_experimental_ytsaurus_table_function\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Экспериментальный табличный движок для интеграции с YTsaurus.

## allow_general_join_planning \\{#allow_general_join_planning\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Разрешает более общий алгоритм планирования JOIN при включенном алгоритме hash join."}]}]}/>

Разрешает использование более общего алгоритма планирования JOIN, который может обрабатывать более сложные условия, но работает только с hash join. Если hash join не включен, используется обычный алгоритм планирования JOIN независимо от значения этой настройки.

## allow_get_client_http_header \\{#allow_get_client_http_header\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Добавлена новая функция."}]}]}/>

Разрешает использовать функцию `getClientHTTPHeader`, которая позволяет получить значение заголовка из текущего HTTP‑запроса. По соображениям безопасности по умолчанию она отключена, поскольку некоторые заголовки, такие как `Cookie`, могут содержать конфиденциальную информацию. Обратите внимание, что заголовки `X-ClickHouse-*` и `Authentication` всегда недоступны и не могут быть получены с помощью этой функции.

## allow_hyperscan \\{#allow_hyperscan\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает использование функций, которые используют библиотеку Hyperscan. Отключите, чтобы избежать потенциально длительного времени компиляции и чрезмерного использования ресурсов.

## allow_introspection_functions \\{#allow_introspection_functions\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает [функции интроспекции](../../sql-reference/functions/introspection.md) для профилирования запросов.

Возможные значения:

- 1 — функции интроспекции включены.
- 0 — функции интроспекции отключены.

**См. также**

- [Sampling Query Profiler](../../operations/optimizing-performance/sampling-query-profiler.md)
- Системная таблица [trace_log](/operations/system-tables/trace_log)

## allow_materialized_view_with_bad_select \\{#allow_materialized_view_with_bad_select\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "Не разрешать создание materialized view, ссылающихся на несуществующие столбцы или таблицы"}]}, {"id": "row-2","items": [{"label": "24.9"},{"label": "1"},{"label": "Поддерживать (но пока не включать) более строгую проверку в CREATE MATERIALIZED VIEW"}]}]}/>

Разрешает CREATE MATERIALIZED VIEW с запросом SELECT, который обращается к несуществующим таблицам или столбцам. При этом запрос должен оставаться синтаксически корректным. Не применяется к обновляемым materialized view. Не применяется, если схему materialized view необходимо выводить из запроса SELECT (то есть если в CREATE отсутствует список столбцов и не указана таблица TO). Может использоваться для создания materialized view до создания его исходной таблицы.

## allow_named_collection_override_by_default \\{#allow_named_collection_override_by_default\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает по умолчанию переопределять поля именованных коллекций.

## allow_non_metadata_alters \\{#allow_non_metadata_alters\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает выполнять ALTER-запросы, которые затрагивают не только метаданные таблиц, но и данные на диске

## allow_nonconst_timezone_arguments \\{#allow_nonconst_timezone_arguments\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "Разрешить неконстантные аргументы часового пояса в некоторых функциях, связанных со временем, таких как toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*()."}]}]}/>

Разрешает неконстантные аргументы часового пояса в некоторых функциях, связанных со временем, таких как toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*().
Этот параметр предназначен исключительно для обеспечения совместимости. В ClickHouse часовой пояс является свойством типа данных и, соответственно, столбца.
Включение этого параметра создаёт неверное впечатление, что разные значения внутри столбца могут иметь разные часовые пояса.
Поэтому не следует включать этот параметр.

## allow_nondeterministic_mutations \{#allow_nondeterministic_mutations\}

<SettingsInfoBlock type="Bool" default_value="0" />

Пользовательская настройка, которая позволяет мутациям в реплицируемых таблицах использовать недетерминированные функции, такие как `dictGet`.

Поскольку, например, словари могут быть рассинхронизированы между узлами, мутации, которые извлекают из них значения, по умолчанию запрещены в реплицируемых таблицах. Включение этой настройки разрешает такое поведение и возлагает на пользователя ответственность за то, чтобы используемые данные были синхронизированы на всех узлах.

**Пример**

```xml
<profiles>
    <default>
        <allow_nondeterministic_mutations>1</allow_nondeterministic_mutations>

        <!-- ... -->
    </default>

    <!-- ... -->

</profiles>
```


## allow_nondeterministic_optimize_skip_unused_shards \\{#allow_nondeterministic_optimize_skip_unused_shards\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использование недетерминированных функций (например, `rand` или `dictGet`, так как у последней есть некоторые особенности при обновлениях) в ключе сегментирования.

Возможные значения:

- 0 — Запрещено.
- 1 — Разрешено.

## allow_prefetched_read_pool_for_local_filesystem \\{#allow_prefetched_read_pool_for_local_filesystem\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Предпочитать пул потоков с предварительной выборкой, если все части находятся в локальной файловой системе

## allow_prefetched_read_pool_for_remote_filesystem \\{#allow_prefetched_read_pool_for_remote_filesystem\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Предпочитать пул потоков с предварительной выборкой, если все части находятся в удалённой файловой системе

## allow_push_predicate_ast_for_distributed_subqueries \\{#allow_push_predicate_ast_for_distributed_subqueries\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Разрешает проталкивание предиката на уровне AST для распределённых подзапросов при включённом анализаторе

## allow_push_predicate_when_subquery_contains_with \\{#allow_push_predicate_when_subquery_contains_with\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает проталкивание предикатов, если подзапрос содержит предложение WITH

## allow_reorder_prewhere_conditions \\{#allow_reorder_prewhere_conditions\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

При переносе условий из WHERE в PREWHERE позволяет изменять порядок условий для оптимизации фильтрации

## allow_settings_after_format_in_insert \{#allow_settings_after_format_in_insert\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.4"},{"label": "0"},{"label": "Не разрешать использование SETTINGS после FORMAT в запросах INSERT, поскольку ClickHouse интерпретирует SETTINGS как значения, что вводит в заблуждение"}]}]} />

Управляет тем, разрешены ли `SETTINGS` после `FORMAT` в запросах `INSERT` или нет. Не рекомендуется использовать эту настройку, так как часть `SETTINGS` может быть интерпретирована как значения.

Пример:

```sql
INSERT INTO FUNCTION null('foo String') SETTINGS max_threads=1 VALUES ('bar');
```

Но следующий запрос будет работать только с `allow_settings_after_format_in_insert`:

```sql
SET allow_settings_after_format_in_insert=1;
INSERT INTO FUNCTION null('foo String') VALUES ('bar') SETTINGS max_threads=1;
```

Возможные значения:

* 0 — Запретить.
* 1 — Разрешить.

:::note
Используйте эту настройку только для обеспечения обратной совместимости, если ваши варианты использования зависят от старого синтаксиса.
:::


## allow_simdjson \\{#allow_simdjson\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает использовать библиотеку simdjson в функциях `JSON*`, если доступны инструкции AVX2. Если параметр отключён, будет использоваться rapidjson.

## allow_special_serialization_kinds_in_output_formats \\{#allow_special_serialization_kinds_in_output_formats\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Включить прямой вывод специальных представлений столбцов (например, Sparse/Replicated) в некоторых форматах вывода"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Добавить настройку, позволяющую выводить специальные представления столбцов, такие как Sparse/Replicated, без преобразования их в полные столбцы"}]}]}/>

Позволяет выводить столбцы со специальными вариантами сериализации, такими как разреженный (Sparse) и Replicated, без преобразования их в полное представление столбца.
Это позволяет избежать лишнего копирования данных при форматировании вывода.

## allow_statistics_optimize \\{#allow_statistics_optimize\\}

<BetaBadge/>

**Псевдонимы**: `allow_statistic_optimize`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "Включает эту оптимизацию по умолчанию."}]}, {"id": "row-2","items": [{"label": "24.6"},{"label": "0"},{"label": "Настройка была переименована. Предыдущее имя — `allow_statistic_optimize`."}]}]}/>

Разрешает использовать статистику для оптимизации запросов

## allow_suspicious_codecs \\{#allow_suspicious_codecs\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.5"},{"label": "0"},{"label": "Запретить указывать бессмысленные кодеки сжатия"}]}]}/>

Если установлено значение true, позволяет указывать бессмысленные кодеки сжатия.

## allow_suspicious_fixed_string_types \\{#allow_suspicious_fixed_string_types\\}

<SettingsInfoBlock type="Bool" default_value="0" />

В операторе CREATE TABLE эта настройка позволяет создавать столбцы типа FixedString(n) с n > 256. FixedString с длиной >= 256 является подозрительным и, скорее всего, указывает на некорректное использование.

## allow_suspicious_indices \\{#allow_suspicious_indices\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "Если установлено значение true, индекс может быть определён с идентичными выражениями"}]}]}/>

Отклоняет первичные/вторичные индексы и ключи сортировки с идентичными выражениями

## allow_suspicious_low_cardinality_types \\{#allow_suspicious_low_cardinality_types\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает или ограничивает использование [LowCardinality](../../sql-reference/data-types/lowcardinality.md) с типами данных фиксированного размера 8 байт или меньше: числовыми типами данных и `FixedString(8_bytes_or_less)`.

Для небольших фиксированных значений использование `LowCardinality` обычно неэффективно, потому что ClickHouse хранит числовой индекс для каждой строки. В результате:

- Использование дискового пространства может увеличиться.
- Потребление RAM может быть выше, в зависимости от размера словаря.
- Некоторые функции могут работать медленнее из-за дополнительных операций кодирования/декодирования.

Время слияния в таблицах на движке [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) может увеличиваться по всем перечисленным выше причинам.

Возможные значения:

- 1 — использование `LowCardinality` не ограничено.
- 0 — использование `LowCardinality` ограничено.

## allow_suspicious_primary_key \\{#allow_suspicious_primary_key\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Запретить подозрительные определения PRIMARY KEY/ORDER BY для MergeTree (например, с использованием SimpleAggregateFunction)"}]}]}/>

Разрешить подозрительные определения `PRIMARY KEY`/`ORDER BY` для MergeTree (например, с использованием SimpleAggregateFunction).

## allow_suspicious_ttl_expressions \\{#allow_suspicious_ttl_expressions\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.12"},{"label": "0"},{"label": "Это новый параметр, и в предыдущих версиях поведение было эквивалентно разрешению таких выражений."}]}]}/>

Отклонять выражения TTL, которые не зависят ни от одного из столбцов таблицы. В большинстве случаев это указывает на ошибку пользователя.

## allow_suspicious_types_in_group_by \\{#allow_suspicious_types_in_group_by\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "По умолчанию запрещать использование типов Variant/Dynamic в GROUP BY"}]}]}/>

Разрешает или запрещает использование типов данных [Variant](../../sql-reference/data-types/variant.md) и [Dynamic](../../sql-reference/data-types/dynamic.md) в ключах GROUP BY.

## allow_suspicious_types_in_order_by \\{#allow_suspicious_types_in_order_by\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "По умолчанию запретить использование типов Variant/Dynamic в ORDER BY"}]}]}/>

Разрешает или запрещает использование типов [Variant](../../sql-reference/data-types/variant.md) и [Dynamic](../../sql-reference/data-types/dynamic.md) в ключах ORDER BY.

## allow_suspicious_variant_types \\{#allow_suspicious_variant_types\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "По умолчанию создание типа Variant с подозрительными вариантами запрещено"}]}]}/>

В операторе CREATE TABLE этот параметр позволяет задавать тип Variant с вариантами схожих типов (например, с разными числовыми типами или типами дат). Включение этого параметра может вносить неоднозначность при работе со значениями схожих типов.

## allow_unrestricted_reads_from_keeper \\{#allow_unrestricted_reads_from_keeper\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает неограниченное (без условия на путь) чтение из таблицы system.zookeeper; может быть полезным, но это небезопасно для ZooKeeper

## alter_move_to_space_execute_async \\{#alter_move_to_space_execute_async\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Выполнять ALTER TABLE MOVE ... TO [DISK|VOLUME] в асинхронном режиме

## alter_partition_verbose_result \{#alter_partition_verbose_result\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает вывод информации о частях, к которым операции с партициями и частями были успешно применены.
Применимо для [ATTACH PARTITION|PART](/sql-reference/statements/alter/partition#attach-partitionpart) и [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition).

Возможные значения:

* 0 — отключить подробный вывод.
* 1 — включить подробный вывод.

**Пример**

```sql
CREATE TABLE test(a Int64, d Date, s String) ENGINE = MergeTree PARTITION BY toYYYYMDECLARE(d) ORDER BY a;
INSERT INTO test VALUES(1, '2021-01-01', '');
INSERT INTO test VALUES(1, '2021-01-01', '');
ALTER TABLE test DETACH PARTITION ID '202101';

ALTER TABLE test ATTACH PARTITION ID '202101' SETTINGS alter_partition_verbose_result = 1;

┌─command_type─────┬─partition_id─┬─part_name────┬─old_part_name─┐
│ ATTACH PARTITION │ 202101       │ 202101_7_7_0 │ 202101_5_5_0  │
│ ATTACH PARTITION │ 202101       │ 202101_8_8_0 │ 202101_6_6_0  │
└──────────────────┴──────────────┴──────────────┴───────────────┘

ALTER TABLE test FREEZE SETTINGS alter_partition_verbose_result = 1;

┌─command_type─┬─partition_id─┬─part_name────┬─backup_name─┬─backup_path───────────────────┬─part_backup_path────────────────────────────────────────────┐
│ FREEZE ALL   │ 202101       │ 202101_7_7_0 │ 8           │ /var/lib/clickhouse/shadow/8/ │ /var/lib/clickhouse/shadow/8/data/default/test/202101_7_7_0 │
│ FREEZE ALL   │ 202101       │ 202101_8_8_0 │ 8           │ /var/lib/clickhouse/shadow/8/ │ /var/lib/clickhouse/shadow/8/data/default/test/202101_8_8_0 │
└──────────────┴──────────────┴──────────────┴─────────────┴───────────────────────────────┴─────────────────────────────────────────────────────────────┘
```


## alter_sync \\{#alter_sync\\}

**Псевдонимы**: `replication_alter_partitions_sync`

<SettingsInfoBlock type="UInt64" default_value="1" />

Позволяет настроить ожидание выполнения действий на репликах при выполнении запросов [ALTER](../../sql-reference/statements/alter/index.md), [OPTIMIZE](../../sql-reference/statements/optimize.md) или [TRUNCATE](../../sql-reference/statements/truncate.md).

Возможные значения:

- `0` — Не ждать.
- `1` — Ждать выполнения на собственной реплике.
- `2` — Ждать выполнения на всех репликах.

Значение по умолчанию в Cloud: `1`.

:::note
`alter_sync` применим только к таблицам `Replicated`; при ALTER таблиц, не являющихся `Replicated`, он не оказывает эффекта.
:::

## alter_update_mode \\{#alter_update_mode\\}

<SettingsInfoBlock type="AlterUpdateMode" default_value="heavy" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "heavy"},{"label": "A new setting"}]}]}/>

Режим выполнения запросов `ALTER`, содержащих команды `UPDATE`.

Возможные значения:

- `heavy` — выполняет обычную мутацию.
- `lightweight` — выполняет легковесное обновление, если возможно, в противном случае выполняет обычную мутацию.
- `lightweight_force` — выполняет легковесное обновление, если возможно, в противном случае выбрасывает исключение.

## analyze_index_with_space_filling_curves \\{#analyze_index_with_space_filling_curves\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если в индексе таблицы используется кривая, заполняющая пространство, например `ORDER BY mortonEncode(x, y)` или `ORDER BY hilbertEncode(x, y)`, и запрос содержит условия на её аргументы, например `x >= 10 AND x <= 20 AND y >= 20 AND y <= 30`, то для анализа индекса используется эта кривая, заполняющая пространство.

## analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested \\{#analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Новая настройка."}]}]}/>

Разрешает добавлять составные идентификаторы в Nested. Это настройка совместимости, поскольку она изменяет результат запроса. Когда настройка отключена, `SELECT a.b.c FROM table ARRAY JOIN a` не работает, а `SELECT a FROM table` не включает столбец `a.b.c` в результат `Nested a`.

## analyzer_compatibility_join_using_top_level_identifier \\{#analyzer_compatibility_join_using_top_level_identifier\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Принудительное разрешение идентификатора в JOIN USING по проекции"}]}]}/>

Принудительно разрешает идентификатор в JOIN USING по проекции (например, в `SELECT a + 1 AS b FROM t1 JOIN t2 USING (b)` соединение будет выполняться по условию `t1.a + 1 = t2.b`, а не `t1.b = t2.b`).

## any_join_distinct_right_table_keys \\{#any_join_distinct_right_table_keys\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.14"},{"label": "0"},{"label": "Disable ANY RIGHT and ANY FULL JOINs by default to avoid inconsistency"}]}]}/>

Включает устаревшее поведение сервера ClickHouse в операциях `ANY INNER|LEFT JOIN`.

:::note
Используйте этот SETTING только для обратной совместимости, если ваши сценарии зависят от устаревшего поведения `JOIN`.
:::

Когда устаревшее поведение включено:

- Результаты операций `t1 ANY LEFT JOIN t2` и `t2 ANY RIGHT JOIN t1` не совпадают, поскольку ClickHouse использует логику сопоставления ключей таблиц слева направо по схеме «многие-к-одному».
- Результаты операций `ANY INNER JOIN` содержат все строки из левой таблицы, как и операции `SEMI LEFT JOIN`.

Когда устаревшее поведение отключено:

- Результаты операций `t1 ANY LEFT JOIN t2` и `t2 ANY RIGHT JOIN t1` совпадают, поскольку ClickHouse использует логику, которая обеспечивает сопоставление ключей по схеме «один-ко-многим» в операциях `ANY RIGHT JOIN`.
- Результаты операций `ANY INNER JOIN` содержат по одной строке на каждый ключ как из левой, так и из правой таблицы.

Возможные значения:

- 0 — устаревшее поведение отключено.
- 1 — устаревшее поведение включено.

См. также:

- [Строгость JOIN](/sql-reference/statements/select/join#settings)

## apply_deleted_mask \\{#apply_deleted_mask\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает фильтрацию строк, удалённых с помощью механизма легковесного удаления. Если отключено, запрос сможет читать эти строки. Это полезно для отладки и сценариев отмены удаления.

## apply_mutations_on_fly \\{#apply_mutations_on_fly\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение равно `true`, мутации (`UPDATE` и `DELETE`), которые ещё не материализованы в части данных, будут применяться при выполнении запросов `SELECT`.

## apply_patch_parts \\{#apply_patch_parts\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "A new setting"}]}]}/>

Если имеет значение true, патч-части (части, представляющие легковесные обновления) применяются при выполнении запросов SELECT.

## apply_patch_parts_join_cache_buckets \\{#apply_patch_parts_join_cache_buckets\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "New setting"}]}]}/>

Количество бакетов во временном кэше для применения частей патча в режиме JOIN.

## apply_prewhere_after_final \\{#apply_prewhere_after_final\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Новая настройка. При включении условия PREWHERE применяются после обработки FINAL."}]}]}/>

При включении условия PREWHERE применяются после обработки FINAL для ReplacingMergeTree и подобных движков.
Это может быть полезно, когда PREWHERE ссылается на столбцы, которые могут иметь разные значения в дублирующихся строках,
и вы хотите, чтобы FINAL выбрал итоговую строку до фильтрации. При выключении PREWHERE применяется во время чтения.
Примечание: если параметр apply_row_level_security_after_final включен и row policy использует столбцы, не входящие в ключ сортировки, применение PREWHERE также
будет отложено для сохранения корректного порядка выполнения (row policy должна быть применена до PREWHERE).

## apply_row_policy_after_final \\{#apply_row_policy_after_final\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Новая настройка, позволяющая управлять тем, будут ли политики строк (ROW POLICY) и PREWHERE применяться после обработки FINAL для таблиц семейства *MergeTree"}]}]}/>

Если параметр включён, политики строк (ROW POLICY) и PREWHERE применяются после обработки FINAL для таблиц семейства *MergeTree (особенно актуально для ReplacingMergeTree).
Если параметр выключен, политики строк применяются до FINAL, что может приводить к отличающимся результатам, когда политика
отфильтровывает строки, которые должны использоваться для дедупликации в ReplacingMergeTree или аналогичных движках.

Если выражение политики строк зависит только от столбцов в ORDER BY, оно по-прежнему будет применяться до FINAL в целях оптимизации,
так как такое фильтрование не может повлиять на результат дедупликации.

Возможные значения:

- 0 — политика строк и PREWHERE применяются до FINAL (по умолчанию).
- 1 — политика строк и PREWHERE применяются после FINAL.

## apply_settings_from_server \\{#apply_settings_from_server\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Код на стороне клиента (например, парсинг входных данных INSERT и форматирование вывода запроса) будет использовать те же настройки, что и сервер, включая настройки из конфигурации сервера."}]}]}/>

Определяет, должен ли клиент принимать настройки, отправленные сервером.

Это влияет только на операции, выполняемые на стороне клиента, в частности на разбор (парсинг) входных данных INSERT и форматирование результата запроса. Основная часть выполнения запроса происходит на сервере и не зависит от этой настройки.

Обычно эту настройку следует задавать в профиле пользователя (users.xml или запросы типа `ALTER USER`), а не через клиент (аргументы командной строки клиента, запрос `SET` или секция `SETTINGS` в запросе `SELECT`). Через клиент её можно изменить на false, но нельзя изменить на true (потому что сервер не будет отправлять настройки, если в профиле пользователя указано `apply_settings_from_server = false`).

Обратите внимание, что изначально (24.12) существовала серверная настройка (`send_settings_to_client`), но позже её заменили этой клиентской настройкой для улучшения удобства использования.

## archive_adaptive_buffer_max_size_bytes \\{#archive_adaptive_buffer_max_size_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="8388608" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "8388608"},{"label": "Новый параметр"}]}]}/>

Ограничивает максимальный размер адаптивного буфера, используемого при записи данных в архивные файлы (например, в tar-архивы).

## arrow_flight_request_descriptor_type \\{#arrow_flight_request_descriptor_type\\}

<SettingsInfoBlock type="ArrowFlightDescriptorType" default_value="path" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "path"},{"label": "Новая настройка. Тип дескриптора, используемого для Arrow Flight-запросов: 'path' или 'command'. Dremio требует 'command'."}]}]}/>

Тип дескриптора, используемого для Arrow Flight-запросов. 'path' отправляет имя набора данных как дескриптор пути. 'command' отправляет SQL-запрос как дескриптор команды (требуется для Dremio).

Возможные значения:

- 'path' — использовать FlightDescriptor::Path (значение по умолчанию, работает с большинством серверов Arrow Flight)
- 'command' — использовать FlightDescriptor::Command с запросом SELECT (требуется для Dremio)

## asterisk_include_alias_columns \\{#asterisk_include_alias_columns\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включать столбцы [ALIAS](../../sql-reference/statements/create/table.md/#alias) в результаты запросов с подстановочным символом (`SELECT *`).

Возможные значения:

- 0 - выключено
- 1 - включено

## asterisk_include_materialized_columns \\{#asterisk_include_materialized_columns\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включать столбцы [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) для запроса с подстановочным символом (`SELECT *`).

Возможные значения:

- 0 - отключено
- 1 - включено

## async_insert \\{#async_insert\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение равно true, данные из запроса INSERT помещаются в очередь и затем в фоновом режиме асинхронно записываются в таблицу. Если wait_for_async_insert имеет значение false, запрос INSERT выполняется практически мгновенно, в противном случае клиент будет ждать, пока данные не будут записаны в таблицу.

## async_insert_busy_timeout_decrease_rate \\{#async_insert_busy_timeout_decrease_rate\\}

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "Экспоненциальный коэффициент, с которым уменьшается адаптивный тайм-аут асинхронной вставки"}]}]}/>

Экспоненциальный коэффициент, с которым уменьшается адаптивный тайм-аут асинхронной вставки

## async_insert_busy_timeout_increase_rate \\{#async_insert_busy_timeout_increase_rate\\}

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "Коэффициент экспоненциального увеличения адаптивного таймаута асинхронной вставки"}]}]}/>

Коэффициент экспоненциального увеличения адаптивного таймаута асинхронной вставки

## async_insert_busy_timeout_max_ms \\{#async_insert_busy_timeout_max_ms\\}

**Псевдонимы**: `async_insert_busy_timeout_ms`

<SettingsInfoBlock type="Milliseconds" default_value="200" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "200"},{"label": "Минимальное значение тайм-аута асинхронной вставки в миллисекундах; async_insert_busy_timeout_ms является псевдонимом для async_insert_busy_timeout_max_ms"}]}]}/>

Максимальное время ожидания перед выгрузкой собранных данных для запроса с момента появления первых данных.

## async_insert_busy_timeout_min_ms \\{#async_insert_busy_timeout_min_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "50"},{"label": "Минимальное значение таймаута асинхронной вставки в миллисекундах; также служит начальным значением, которое может быть увеличено адаптивным алгоритмом"}]}]}/>

При включенной автонастройке через async_insert_use_adaptive_busy_timeout это минимальное время ожидания перед сбросом накопленных данных для каждого запроса с момента появления первых данных. Оно также служит начальным значением для адаптивного алгоритма.

## async_insert_deduplicate \\{#async_insert_deduplicate\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Для асинхронных запросов INSERT в реплицируемой таблице определяет, должна ли выполняться дедупликация вставляемых блоков.

## async_insert_max_data_size \\{#async_insert_max_data_size\\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10485760"},{"label": "Предыдущее значение оказалось слишком маленьким."}]}]}/>

Максимальный размер в байтах неразобранных данных, собираемых для одного запроса до вставки.

## async_insert_max_query_number \\{#async_insert_max_query_number\\}

<SettingsInfoBlock type="UInt64" default_value="450" />

Максимальное количество запросов INSERT перед вставкой.
Применяется только, если настройка [`async_insert_deduplicate`](#async_insert_deduplicate) равна 1.

## async_insert_poll_timeout_ms \\{#async_insert_poll_timeout_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10"},{"label": "Таймаут (в миллисекундах) опроса данных из очереди асинхронных вставок"}]}]}/>

Таймаут опроса данных из очереди асинхронных вставок

## async_insert_use_adaptive_busy_timeout \\{#async_insert_use_adaptive_busy_timeout\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Использование адаптивного таймаута асинхронной вставки"}]}]}/>

Если установлено в true, используется адаптивный таймаут занятости для асинхронных вставок

## async_query_sending_for_remote \\{#async_query_sending_for_remote\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.3"},{"label": "1"},{"label": "Создание подключений и асинхронная отправка запросов по сегментам"}]}]}/>

Включает асинхронное создание подключений и отправку запросов при выполнении удалённых запросов.

По умолчанию включено.

## async_socket_for_remote \\{#async_socket_for_remote\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.5"},{"label": "1"},{"label": "Исправлены все проблемы, и асинхронное чтение из сокета для удалённых запросов снова включено по умолчанию"}]}, {"id": "row-2","items": [{"label": "21.3"},{"label": "0"},{"label": "Асинхронное чтение из сокета для удалённых запросов отключено из-за некоторых проблем"}]}]}/>

Включает асинхронное чтение из сокета при выполнении удалённых запросов.

По умолчанию включено.

## automatic_parallel_replicas_min_bytes_per_replica \\{#automatic_parallel_replicas_min_bytes_per_replica\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Порог количества байт для чтения на реплику, при котором автоматически включаются параллельные реплики (применяется только, когда `automatic_parallel_replicas_mode`=1). Значение 0 означает отсутствие порога.

## automatic_parallel_replicas_mode \\{#automatic_parallel_replicas_mode\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Включает автоматическое переключение на выполнение с параллельными репликами на основе собранной статистики. Требуется включить `parallel_replicas_local_plan` и указать `cluster_for_parallel_replicas`.
0 — отключено, 1 — включено, 2 — включен только сбор статистики (переключение на выполнение с параллельными репликами отключено).

## azure_allow_parallel_part_upload \\{#azure_allow_parallel_part_upload\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "true"},{"label": "Использует несколько потоков для многосоставной загрузки в Azure."}]}]}/>

Использует несколько потоков для многосоставной загрузки в Azure.

## azure_check_objects_after_upload \\{#azure_check_objects_after_upload\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "Проверять каждый загруженный объект в Azure Blob Storage, чтобы убедиться в успешном завершении загрузки"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "Проверять каждый загруженный объект в Azure Blob Storage, чтобы убедиться в успешном завершении загрузки"}]}]}/>

Проверять каждый загруженный объект в Azure Blob Storage, чтобы убедиться в успешном завершении загрузки

## azure_connect_timeout_ms \\{#azure_connect_timeout_ms\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1000"},{"label": "New setting"}]}]}/>

Таймаут подключения к хосту при работе с дисками Azure.

## azure_create_new_file_on_insert \\{#azure_create_new_file_on_insert\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает создание нового файла при каждой вставке данных в таблицы движка Azure

## azure_ignore_file_doesnt_exist \\{#azure_ignore_file_doesnt_exist\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Разрешить возвращать 0 строк, когда запрошенные файлы отсутствуют, вместо выбрасывания исключения в движке таблиц AzureBlobStorage"}]}]}/>

Игнорировать отсутствие файлов при чтении указанных ключей.

Возможные значения:

- 1 — `SELECT` возвращает пустой результат.
- 0 — `SELECT` выбрасывает исключение.

## azure_list_object_keys_size \\{#azure_list_object_keys_size\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальное количество файлов, которые может вернуть один пакетный ответ на запрос ListObject

## azure_max_blocks_in_multipart_upload \\{#azure_max_blocks_in_multipart_upload\\}

<SettingsInfoBlock type="UInt64" default_value="50000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "50000"},{"label": "Максимальное количество блоков при multipart-загрузке в Azure."}]}]}/>

Максимальное количество блоков при multipart-загрузке в Azure.

## azure_max_get_burst \\{#azure_max_get_burst\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Максимальное число запросов, которые могут быть выполнены одновременно до достижения ограничения на число запросов в секунду. По умолчанию (0) равно `azure_max_get_rps`.

## azure_max_get_rps \\{#azure_max_get_rps\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Ограничение на число запросов Azure GET в секунду до начала ограничения скорости (throttling). Ноль означает отсутствие ограничений.

## azure_max_inflight_parts_for_one_file \\{#azure_max_inflight_parts_for_one_file\\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "20"},{"label": "Максимальное количество одновременно загружаемых частей в multipart-запросе на загрузку. 0 означает отсутствие ограничений."}]}]}/>

Максимальное количество одновременно загружаемых частей в multipart-запросе на загрузку. 0 означает отсутствие ограничений.

## azure_max_put_burst \\{#azure_max_put_burst\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Максимальное количество запросов, которое может быть отправлено одновременно до достижения ограничения на количество запросов в секунду. По умолчанию значение 0 соответствует `azure_max_put_rps`.

## azure_max_put_rps \\{#azure_max_put_rps\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Ограничение на число запросов PUT к Azure в секунду перед началом ограничения частоты запросов. Ноль означает отсутствие лимита.

## azure_max_redirects \\{#azure_max_redirects\\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "New setting"}]}]}/>

Максимальное допустимое число последовательных перенаправлений Azure.

## azure_max_single_part_copy_size \\{#azure_max_single_part_copy_size\\}

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268435456"},{"label": "Максимальный размер объекта при копировании одной частью в хранилище Azure Blob."}]}]}/>

Максимальный размер объекта при копировании одной частью в хранилище Azure Blob.

## azure_max_single_part_upload_size \\{#azure_max_single_part_upload_size\\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "33554432"},{"label": "Align with S3"}]}]}/>

Максимальный размер объекта при загрузке в Azure Blob Storage с использованием одночастной загрузки (singlepart upload).

## azure_max_single_read_retries \\{#azure_max_single_read_retries\\}

<SettingsInfoBlock type="UInt64" default_value="4" />

Максимальное количество повторных попыток при однократном чтении из Azure Blob Storage.

## azure_max_unexpected_write_error_retries \\{#azure_max_unexpected_write_error_retries\\}

<SettingsInfoBlock type="UInt64" default_value="4" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "4"},{"label": "Максимальное количество повторных попыток записи в случае неожиданных ошибок при записи в объектное хранилище Azure Blob Storage"}]}]}/>

Максимальное количество повторных попыток записи в случае неожиданных ошибок при записи в объектное хранилище Azure Blob Storage

## azure_max_upload_part_size \\{#azure_max_upload_part_size\\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5368709120"},{"label": "Максимальный размер части, загружаемой при многокомпонентной загрузке в Azure Blob Storage."}]}]}/>

Максимальный размер части, загружаемой при многокомпонентной загрузке в Azure Blob Storage.

## azure_min_upload_part_size \\{#azure_min_upload_part_size\\}

<SettingsInfoBlock type="UInt64" default_value="16777216" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "16777216"},{"label": "Минимальный размер части для загрузки при многочастичной загрузке в хранилище BLOB-объектов Azure."}]}]}/>

Минимальный размер части для загрузки при многочастичной загрузке в хранилище BLOB-объектов Azure.

## azure_request_timeout_ms \\{#azure_request_timeout_ms\\}

<SettingsInfoBlock type="UInt64" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>

Таймаут простоя при отправке данных в Azure и получении данных из Azure. Операция завершается с ошибкой, если один вызов чтения или записи по TCP остается заблокированным дольше этого времени.

## azure_sdk_max_retries \\{#azure_sdk_max_retries\\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Максимальное число повторных попыток в Azure SDK"}]}]}/>

Максимальное число повторных попыток в Azure SDK

## azure_sdk_retry_initial_backoff_ms \\{#azure_sdk_retry_initial_backoff_ms\\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Минимальная задержка между повторными попытками в Azure SDK"}]}]}/>

Минимальная задержка между повторными попытками в Azure SDK

## azure_sdk_retry_max_backoff_ms \\{#azure_sdk_retry_max_backoff_ms\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Максимальная задержка между повторными попытками в Azure SDK"}]}]}/>

Максимальная задержка между повторными попытками в Azure SDK

## azure_skip_empty_files \\{#azure_skip_empty_files\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Allow to skip empty files in azure table engine"}]}]}/>

Включает или отключает пропуск пустых файлов в движке S3.

Возможные значения:

- 0 — `SELECT` выбрасывает исключение, если пустой файл не совместим с запрошенным форматом.
- 1 — `SELECT` возвращает пустой результат для пустого файла.

## azure_strict_upload_part_size \\{#azure_strict_upload_part_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Точный размер части, загружаемой при многочастичной (multipart) загрузке в Azure Blob Storage."}]}]}/>

Точный размер части, загружаемой при многочастичной (multipart) загрузке в Azure Blob Storage.

## azure_throw_on_zero_files_match \\{#azure_throw_on_zero_files_match\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Разрешает выдавать ошибку, когда запрос ListObjects не может сопоставить ни одного файла в движке AzureBlobStorage, вместо возврата пустого результата запроса"}]}]}/>

Выдавать ошибку, если по правилам раскрытия glob не найдено ни одного файла.

Возможные значения:

- 1 — `SELECT` генерирует исключение.
- 0 — `SELECT` возвращает пустой результат.

## azure_truncate_on_insert \\{#azure_truncate_on_insert\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает усечение данных перед вставкой в таблицы движка Azure.

## azure_upload_part_size_multiply_factor \\{#azure_upload_part_size_multiply_factor\\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "2"},{"label": "Умножайте azure_min_upload_part_size на этот коэффициент каждый раз, когда в результате одной операции записи в хранилище Azure Blob было загружено azure_multiply_parts_count_threshold частей."}]}]}/>

Умножайте azure_min_upload_part_size на этот коэффициент каждый раз, когда в результате одной операции записи в хранилище Azure Blob было загружено azure_multiply_parts_count_threshold частей.

## azure_upload_part_size_multiply_parts_count_threshold \\{#azure_upload_part_size_multiply_parts_count_threshold\\}

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "500"},{"label": "Каждый раз при загрузке в Azure Blob Storage такого количества частей значение azure_min_upload_part_size умножается на azure_upload_part_size_multiply_factor."}]}]}/>

Каждый раз при загрузке в Azure Blob Storage такого количества частей значение azure_min_upload_part_size умножается на azure_upload_part_size_multiply_factor.

## azure_use_adaptive_timeouts \\{#azure_use_adaptive_timeouts\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

Если установлено значение `true`, то для всех запросов к Azure первые две попытки выполняются с короткими тайм-аутами на отправку и получение.
Если установлено значение `false`, то все попытки выполняются с одинаковыми тайм-аутами.

## backup_restore_batch_size_for_keeper_multi \\{#backup_restore_batch_size_for_keeper_multi\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальный размер пакета для запроса multi к [Zoo]Keeper при создании или восстановлении резервной копии

## backup_restore_batch_size_for_keeper_multiread \\{#backup_restore_batch_size_for_keeper_multiread\\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальный размер пакета для запроса multiread к [Zoo]Keeper при выполнении резервного копирования или восстановления.

## backup_restore_failure_after_host_disconnected_for_seconds \\{#backup_restore_failure_after_host_disconnected_for_seconds\\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "3600"},{"label": "Новая настройка."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "3600"},{"label": "Новая настройка."}]}]}/>

Если во время операции BACKUP ON CLUSTER или RESTORE ON CLUSTER хост не воссоздаёт свой эфемерный узел "alive" в ZooKeeper в течение этого времени, то весь процесс резервного копирования или восстановления считается завершённым с ошибкой.
Это значение должно быть больше любого разумного времени, которое может потребоваться хосту для повторного подключения к ZooKeeper после сбоя.
Ноль означает отсутствие ограничения.

## backup_restore_finish_timeout_after_error_sec \\{#backup_restore_finish_timeout_after_error_sec\\}

<SettingsInfoBlock type="UInt64" default_value="180" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "180"},{"label": "Новая настройка."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "180"},{"label": "Новая настройка."}]}]}/>

Как долго инициатор должен ждать, пока другой хост не отреагирует на узел `error` и не завершит выполнение текущей операции BACKUP ON CLUSTER или RESTORE ON CLUSTER.

## backup_restore_keeper_fault_injection_probability \\{#backup_restore_keeper_fault_injection_probability\\}

<SettingsInfoBlock type="Float" default_value="0" />

Приблизительная вероятность отказа запроса к Keeper во время резервного копирования или восстановления. Допустимое значение — в интервале [0.0f, 1.0f].

## backup_restore_keeper_fault_injection_seed \\{#backup_restore_keeper_fault_injection_seed\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

0 - случайное начальное значение, в противном случае используется значение настройки

## backup_restore_keeper_max_retries \\{#backup_restore_keeper_max_retries\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1000"},{"label": "Должно быть достаточно большим, чтобы операция BACKUP или RESTORE не завершилась с ошибкой из‑за временного сбоя [Zoo]Keeper во время её выполнения."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1000"},{"label": "Должно быть достаточно большим, чтобы операция BACKUP или RESTORE не завершилась с ошибкой из‑за временного сбоя [Zoo]Keeper во время её выполнения."}]}]}/>

Максимальное число повторных попыток для операций [Zoo]Keeper во время выполнения операции BACKUP или RESTORE.
Должно быть достаточно большим, чтобы вся операция не завершилась с ошибкой из‑за временного сбоя [Zoo]Keeper.

## backup_restore_keeper_max_retries_while_handling_error \\{#backup_restore_keeper_max_retries_while_handling_error\\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "Новая настройка."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "Новая настройка."}]}]}/>

Максимальное число повторных попыток операций [Zoo]Keeper при обработке ошибки операции BACKUP ON CLUSTER или RESTORE ON CLUSTER.

## backup_restore_keeper_max_retries_while_initializing \\{#backup_restore_keeper_max_retries_while_initializing\\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "Новая настройка."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "Новая настройка."}]}]}/>

Максимальное количество повторных попыток операций [Zoo]Keeper при инициализации операции BACKUP ON CLUSTER или RESTORE ON CLUSTER.

## backup_restore_keeper_retry_initial_backoff_ms \\{#backup_restore_keeper_retry_initial_backoff_ms\\}

<SettingsInfoBlock type="UInt64" default_value="100" />

Начальная задержка (backoff) для операций [Zoo]Keeper во время резервного копирования или восстановления

## backup_restore_keeper_retry_max_backoff_ms \\{#backup_restore_keeper_retry_max_backoff_ms\\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

Максимальное время ожидания (backoff) для операций [Zoo]Keeper при резервном копировании или восстановлении

## backup_restore_keeper_value_max_size \\{#backup_restore_keeper_value_max_size\\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Максимальный размер данных узла [Zoo]Keeper при создании резервной копии

## backup_restore_s3_retry_attempts \\{#backup_restore_s3_retry_attempts\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Настройка для Aws::Client::RetryStrategy, Aws::Client самостоятельно выполняет повторы, 0 означает отсутствие повторов. Применяется только для операций резервного копирования и восстановления."}]}]}/>

Настройка для Aws::Client::RetryStrategy, Aws::Client самостоятельно выполняет повторы, 0 означает отсутствие повторов. Применяется только для операций резервного копирования и восстановления.

## backup_restore_s3_retry_initial_backoff_ms \\{#backup_restore_s3_retry_initial_backoff_ms\\}

<SettingsInfoBlock type="UInt64" default_value="25" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "25"},{"label": "New setting"}]}]}/>

Начальная задержка (в миллисекундах) перед первой попыткой повтора операции во время резервного копирования и восстановления. Каждая последующая попытка повтора увеличивает задержку экспоненциально, вплоть до максимального значения, заданного в `backup_restore_s3_retry_max_backoff_ms`.

## backup_restore_s3_retry_jitter_factor \\{#backup_restore_s3_retry_jitter_factor\\}

<SettingsInfoBlock type="Float" default_value="0.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0.1"},{"label": "Новый параметр"}]}]}/>

Коэффициент джиттера, применяемый к задержке между повторными попытками (retry backoff delay) в Aws::Client::RetryStrategy во время операций резервного копирования и восстановления. Вычисленная задержка backoff умножается на случайный коэффициент в диапазоне [1.0, 1.0 + jitter], но не превышает значение `backup_restore_s3_retry_max_backoff_ms`. Значение должно находиться в интервале [0.0, 1.0].

## backup_restore_s3_retry_max_backoff_ms \\{#backup_restore_s3_retry_max_backoff_ms\\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5000"},{"label": "New setting"}]}]}/>

Максимальная задержка в миллисекундах между повторными попытками во время операций резервного копирования и восстановления.

## backup_slow_all_threads_after_retryable_s3_error \\{#backup_slow_all_threads_after_retryable_s3_error\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-3","items": [{"label": "25.10"},{"label": "0"},{"label": "Disable the setting by default"}]}]}/>

Если установлено в `true`, все потоки, выполняющие запросы к S3 к одной и той же конечной точке резервного копирования, замедляются после того, как любой отдельный запрос к S3 сталкивается с ошибкой S3, допускающей повторную попытку (retryable), такой как 'Slow Down'.
Если установлено в `false`, каждый поток обрабатывает backoff запросов к S3 независимо от других.

## cache_warmer_threads \\{#cache_warmer_threads\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="4" />

Действует только в ClickHouse Cloud. Количество фоновых потоков для упреждающей загрузки новых частей данных в файловый кэш, когда включён [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch). Ноль — чтобы отключить.

## calculate_text_stack_trace \\{#calculate_text_stack_trace\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Вычислять текстовый стек-трейс при возникновении исключений во время выполнения запроса. Это поведение по умолчанию. Для этого требуется поиск символов, что может замедлить фаззинг-тесты при выполнении очень большого количества ошибочных запросов. В обычных случаях не следует отключать эту настройку.

## cancel_http_readonly_queries_on_client_close \\{#cancel_http_readonly_queries_on_client_close\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Отменяет HTTP-запросы на чтение (например, `SELECT`), когда клиент закрывает соединение, не дожидаясь ответа.

Значение по умолчанию в Cloud: `0`.

## cast_ipv4_ipv6_default_on_conversion_error \\{#cast_ipv4_ipv6_default_on_conversion_error\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.3"},{"label": "0"},{"label": "Функции cast(value, 'IPv4') и cast(value, 'IPv6') ведут себя так же, как функции toIPv4 и toIPv6"}]}]}/>

Оператор CAST в тип IPv4, оператор CAST в тип IPv6 и функции toIPv4, toIPv6 будут возвращать значение по умолчанию вместо выброса исключения при ошибке преобразования.

## cast_keep_nullable \{#cast_keep_nullable\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает сохранение типа данных `Nullable` в операциях [CAST](/sql-reference/functions/type-conversion-functions#CAST).

Когда настройка включена и аргумент функции `CAST` имеет тип `Nullable`, результат также преобразуется к типу `Nullable`. Когда настройка отключена, результат всегда имеет точно целевой тип.

Возможные значения:

* 0 — Результат `CAST` имеет ровно указанный целевой тип.
* 1 — Если тип аргумента — `Nullable`, результат `CAST` преобразуется к типу `Nullable(DestinationDataType)`.

**Примеры**

Следующий запрос возвращает результат указанного целевого типа данных:

```sql
SET cast_keep_nullable = 0;
SELECT CAST(toNullable(toInt32(0)) AS Int32) as x, toTypeName(x);
```

Результат:

```text
┌─x─┬─toTypeName(CAST(toNullable(toInt32(0)), 'Int32'))─┐
│ 0 │ Int32                                             │
└───┴───────────────────────────────────────────────────┘
```

Следующий запрос приводит к применению модификатора `Nullable` к целевому типу данных:

```sql
SET cast_keep_nullable = 1;
SELECT CAST(toNullable(toInt32(0)) AS Int32) as x, toTypeName(x);
```

Результат:

```text
┌─x─┬─toTypeName(CAST(toNullable(toInt32(0)), 'Int32'))─┐
│ 0 │ Nullable(Int32)                                   │
└───┴───────────────────────────────────────────────────┘
```

**См. также**

* Функция [CAST](/sql-reference/functions/type-conversion-functions#CAST)


## cast_string_to_date_time_mode \\{#cast_string_to_date_time_mode\\}

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "basic"},{"label": "Разрешает использовать различные режимы разбора DateTime при приведении String к DateTime"}]}]}/>

Позволяет выбрать парсер текстового представления даты и времени при приведении из String к DateTime.

Возможные значения:

- `'best_effort'` — Включает расширенный разбор.

    ClickHouse может разбирать базовый формат `YYYY-MM-DD HH:MM:SS` и все форматы даты и времени [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601). Например, `'2018-06-08T01:02:03.000Z'`.

- `'best_effort_us'` — Аналогично `best_effort` (см. различия в [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parseDateTimeBestEffortUS))

- `'basic'` — Использует базовый парсер.

    ClickHouse может разбирать только базовый формат `YYYY-MM-DD HH:MM:SS` или `YYYY-MM-DD`. Например, `2019-08-20 10:18:56` или `2019-08-20`.

См. также:

- [Тип данных DateTime.](../../sql-reference/data-types/datetime.md)
- [Функции для работы с датами и временем.](../../sql-reference/functions/date-time-functions.md)

## cast_string_to_dynamic_use_inference \\{#cast_string_to_dynamic_use_inference\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "Добавлена настройка, позволяющая преобразовывать String в Dynamic с помощью парсинга"}]}]}/>

Использовать вывод типов при преобразовании String в Dynamic

## cast_string_to_variant_use_inference \\{#cast_string_to_variant_use_inference\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Новая настройка для включения/отключения вывода типов при выполнении CAST из String в Variant"}]}]}/>

Использовать вывод типов при преобразовании String в Variant.

## check_query_single_value_result \\{#check_query_single_value_result\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Changed setting to make CHECK TABLE more useful"}]}]}/>

Определяет уровень детализации результата выполнения запроса [CHECK TABLE](/sql-reference/statements/check-table) для движков семейства `MergeTree`.

Возможные значения:

- 0 — запрос показывает статус проверки для каждой отдельной части данных таблицы.
- 1 — запрос показывает общий статус проверки таблицы.

## check_referential_table_dependencies \\{#check_referential_table_dependencies\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Проверяет, что выполнение DDL-запроса (например, DROP TABLE или RENAME) не нарушит ссылочные зависимости

## check_table_dependencies \\{#check_table_dependencies\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Позволяет проверить, что DDL-запрос (например, DROP TABLE или RENAME) не приведёт к нарушению зависимостей

## checksum_on_read \\{#checksum_on_read\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Проверка контрольных сумм при чтении. По умолчанию настройка включена и всегда должна быть включена в production-среде. Не следует ожидать какой-либо выгоды от её отключения. Она может использоваться только для экспериментов и бенчмарков. Настройка применима только к таблицам семейства MergeTree. Для таблиц на других движках контрольные суммы всегда проверяются, а также при получении данных по сети.

## cloud_mode \\{#cloud_mode\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Режим Cloud

## cloud_mode_database_engine \\{#cloud_mode_database_engine\\}

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Движок базы данных, допустимый в Cloud. 1 — переписывать DDL-запросы для использования базы данных Replicated, 2 — переписывать DDL-запросы для использования базы данных Shared

## cloud_mode_engine \\{#cloud_mode_engine\\}

<SettingsInfoBlock type="UInt64" default_value="1" />

Семейство движков, допустимых в Cloud.

- 0 - разрешить всё
- 1 - переписывать операторы DDL так, чтобы использовать *ReplicatedMergeTree
- 2 - переписывать операторы DDL так, чтобы использовать SharedMergeTree
- 3 - переписывать операторы DDL так, чтобы использовать SharedMergeTree, за исключением случаев, когда явно указан удалённый диск
- 4 - то же, что и 3, плюс дополнительно использовать Alias вместо Distributed (таблица Alias будет указывать на целевую таблицу таблицы Distributed, поэтому будет использовать соответствующую локальную таблицу)

Тип UInt64, чтобы минимизировать публичную часть

## cluster_for_parallel_replicas \\{#cluster_for_parallel_replicas\\}

Кластер для сегмента, в котором находится текущий сервер

## cluster_function_process_archive_on_multiple_nodes \\{#cluster_function_process_archive_on_multiple_nodes\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "New setting"}]}]}/>

При значении `true` повышает производительность обработки архивов в кластерных функциях. Значение `false` следует использовать для обеспечения совместимости и во избежание ошибок при обновлении до версии 25.7+ при использовании кластерных функций с архивами в более ранних версиях.

## cluster_table_function_buckets_batch_size \\{#cluster_table_function_buckets_batch_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Определяет приблизительный размер пакета (в байтах), используемого при распределённой обработке задач в табличных функциях кластера с гранулярностью разбиения `bucket`. Система накапливает данные, пока их объём не достигнет по крайней мере этого значения. Фактический размер может быть немного больше для выравнивания по границам данных.

## cluster_table_function_split_granularity \\{#cluster_table_function_split_granularity\\}

<SettingsInfoBlock type="ObjectStorageGranularityLevel" default_value="file" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "file"},{"label": "New setting."}]}]}/>

Управляет способом разбиения данных на задачи при выполнении CLUSTER TABLE FUNCTION.

Этот параметр определяет уровень детализации распределения работы по кластеру:

- `file` — каждая задача обрабатывает целый файл.
- `bucket` — задачи создаются для каждого внутреннего блока данных файла (например, для групп строк Parquet).

Выбор более мелкой гранулярности (например, `bucket`) может повысить параллелизм при работе с небольшим количеством крупных файлов.
Например, если файл Parquet содержит несколько групп строк, включение гранулярности `bucket` позволяет каждой группе обрабатываться независимо разными рабочими процессами.

## collect_hash_table_stats_during_aggregation \\{#collect_hash_table_stats_during_aggregation\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает сбор статистики по хеш-таблицам для оптимизации выделения памяти.

## collect_hash_table_stats_during_joins \\{#collect_hash_table_stats_during_joins\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "New setting."}]}]}/>

Включает сбор статистики хеш-таблиц для оптимизации выделения памяти.

## compatibility \\{#compatibility\\}

Настройка `compatibility` указывает ClickHouse использовать набор настроек по умолчанию из предыдущей версии ClickHouse, при этом предыдущая версия указывается как значение настройки.

Если какие-либо настройки установлены в значения, отличные от значений по умолчанию, то именно эти значения имеют приоритет (настройка `compatibility` влияет только на те настройки, которые не были изменены).

Эта настройка принимает номер версии ClickHouse в виде строки, например `22.3`, `22.8`. Пустое значение означает, что настройка отключена.

По умолчанию отключена.

:::note
В ClickHouse Cloud значение настройки совместимости по умолчанию на уровне сервиса должно быть установлено службой поддержки ClickHouse Cloud. Пожалуйста, [создайте обращение](https://clickhouse.cloud/support), чтобы его задать.
Однако настройка `compatibility` может быть переопределена на уровне пользователя, роли, профиля, запроса или сеанса с помощью стандартных механизмов настройки ClickHouse, например `SET compatibility = '22.3'` в сеансе или `SETTINGS compatibility = '22.3'` в запросе.
:::

## compatibility_ignore_auto_increment_in_create_table \\{#compatibility_ignore_auto_increment_in_create_table\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать ключевое слово AUTO_INCREMENT в объявлении столбца, если параметр установлен в true, в противном случае возвращать ошибку. Это упрощает миграцию с MySQL.

## compatibility_ignore_collation_in_create_table \\{#compatibility_ignore_collation_in_create_table\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Игнорировать collation при создании таблицы (для совместимости)

## compatibility_s3_presigned_url_query_in_path \\{#compatibility_s3_presigned_url_query_in_path\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Совместимость: при включении параметры запроса предварительно подписанного URL (например, X-Amz-*) включаются в ключ S3 (устаревшее поведение),
так что «?» действует как подстановочный знак в пути. При отключении (по умолчанию) параметры запроса предварительно подписанного URL остаются в части запроса URL,
чтобы избежать интерпретации «?» как подстановочного знака.

## compile_aggregate_expressions \\{#compile_aggregate_expressions\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает JIT‑компиляцию агрегатных функций в нативный код. Включение этой настройки может улучшить производительность.

Возможные значения:

- 0 — агрегация выполняется без JIT‑компиляции.
- 1 — агрегация выполняется с использованием JIT‑компиляции.

**См. также**

- [min_count_to_compile_aggregate_expression](#min_count_to_compile_aggregate_expression)

## compile_expressions \\{#compile_expressions\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Мы считаем, что инфраструктура LLVM, лежащая в основе JIT‑компилятора, достаточно стабильна, чтобы включить этот параметр по умолчанию."}]}]}/>

Компилирует некоторые скалярные функции и операторы в нативный код.

## compile_sort_description \\{#compile_sort_description\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Компилирует описание сортировки в машинный код.

## connect_timeout \\{#connect_timeout\\}

<SettingsInfoBlock type="Seconds" default_value="10" />

Таймаут подключения при отсутствии реплик.

## connect_timeout_with_failover_ms \\{#connect_timeout_with_failover_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "Тайм-аут подключения по умолчанию увеличен из-за асинхронного подключения"}]}]}/>

Тайм-аут подключения в миллисекундах к удалённому серверу для движка distributed таблицы, если в определении кластера используются секции 'shard' и 'replica'.
В случае неудачи выполняется несколько попыток подключения к различным репликам.

## connect_timeout_with_failover_secure_ms \\{#connect_timeout_with_failover_secure_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "Увеличено значение таймаута безопасного подключения по умолчанию из-за асинхронного подключения"}]}]}/>

Таймаут на установление соединения при выборе первой работоспособной реплики (для защищённых подключений).

## connection_pool_max_wait_ms \\{#connection_pool_max_wait_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Время ожидания (в миллисекундах) при попытке установить соединение, когда пул соединений заполнен.

Возможные значения:

- Положительное целое число.
- 0 — бесконечное ожидание.

## connections_with_failover_max_tries \\{#connections_with_failover_max_tries\\}

<SettingsInfoBlock type="UInt64" default_value="3" />

Максимальное число попыток установления соединения с каждой репликой для движка distributed таблицы.

## convert_query_to_cnf \{#convert_query_to_cnf\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если установить `true`, запрос `SELECT` будет преобразован в конъюнктивную нормальную форму (CNF). В некоторых случаях выполнение запроса, переписанного в CNF, может быть быстрее (см. это [обсуждение на GitHub](https://github.com/ClickHouse/ClickHouse/issues/11749) с пояснениями).

Например, обратите внимание, что следующий запрос `SELECT` не изменяется (поведение по умолчанию):

```sql
EXPLAIN SYNTAX
SELECT *
FROM
(
    SELECT number AS x
    FROM numbers(20)
) AS a
WHERE ((x >= 1) AND (x <= 5)) OR ((x >= 10) AND (x <= 15))
SETTINGS convert_query_to_cnf = false;
```

Результат:

```response
┌─explain────────────────────────────────────────────────────────┐
│ SELECT x                                                       │
│ FROM                                                           │
│ (                                                              │
│     SELECT number AS x                                         │
│     FROM numbers(20)                                           │
│     WHERE ((x >= 1) AND (x <= 5)) OR ((x >= 10) AND (x <= 15)) │
│ ) AS a                                                         │
│ WHERE ((x >= 1) AND (x <= 5)) OR ((x >= 10) AND (x <= 15))     │
│ SETTINGS convert_query_to_cnf = 0                              │
└────────────────────────────────────────────────────────────────┘
```

Давайте установим `convert_query_to_cnf` равным `true` и посмотрим, что изменится:

```sql
EXPLAIN SYNTAX
SELECT *
FROM
(
    SELECT number AS x
    FROM numbers(20)
) AS a
WHERE ((x >= 1) AND (x <= 5)) OR ((x >= 10) AND (x <= 15))
SETTINGS convert_query_to_cnf = true;
```

Обратите внимание, что предложение `WHERE` переписано в КНФ, но результирующий набор данных остаётся тем же — булева логика не меняется:

```response
┌─explain───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SELECT x                                                                                                              │
│ FROM                                                                                                                  │
│ (                                                                                                                     │
│     SELECT number AS x                                                                                                │
│     FROM numbers(20)                                                                                                  │
│     WHERE ((x <= 15) OR (x <= 5)) AND ((x <= 15) OR (x >= 1)) AND ((x >= 10) OR (x <= 5)) AND ((x >= 10) OR (x >= 1)) │
│ ) AS a                                                                                                                │
│ WHERE ((x >= 10) OR (x >= 1)) AND ((x >= 10) OR (x <= 5)) AND ((x <= 15) OR (x >= 1)) AND ((x <= 15) OR (x <= 5))     │
│ SETTINGS convert_query_to_cnf = 1                                                                                     │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Допустимые значения: true, false


## correlated_subqueries_default_join_kind \\{#correlated_subqueries_default_join_kind\\}

<SettingsInfoBlock type="DecorrelationJoinKind" default_value="right" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "right"},{"label": "Новая настройка. Тип соединения по умолчанию для декоррелированного плана запроса."}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "right"},{"label": "Новая настройка. Тип соединения по умолчанию для декоррелированного плана запроса."}]}]}/>

Управляет типом соединения в декоррелированном плане запроса. Значение по умолчанию — `right`, что означает, что декоррелированный план будет содержать операции RIGHT JOIN с подзапросом в правой части.

Возможные значения:

- `left` — в результате декорреляции будут выполняться операции LEFT JOIN, а входная таблица будет находиться слева.
- `right` — в результате декорреляции будут выполняться операции RIGHT JOIN, а входная таблица будет находиться справа.

## correlated_subqueries_substitute_equivalent_expressions \\{#correlated_subqueries_substitute_equivalent_expressions\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "Новая настройка оптимизации планирования коррелированных подзапросов."}]}]}/>

Используйте фильтрующие выражения, чтобы выводить эквивалентные выражения и подставлять их вместо создания CROSS JOIN.

## correlated_subqueries_use_in_memory_buffer \\{#correlated_subqueries_use_in_memory_buffer\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "По умолчанию использовать буфер в оперативной памяти для входных данных коррелированных подзапросов."}]}]}/>

Использовать буфер в оперативной памяти для входных данных коррелированных подзапросов, чтобы избежать их повторного вычисления.

## count_distinct_implementation \\{#count_distinct_implementation\\}

<SettingsInfoBlock type="String" default_value="uniqExact" />

Определяет, какая из функций `uniq*` будет использоваться для реализации конструкции [COUNT(DISTINCT ...)](/sql-reference/aggregate-functions/reference/count).

Возможные значения:

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)

## count_distinct_optimization \\{#count_distinct_optimization\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Переписывает выражения COUNT DISTINCT в подзапрос с оператором GROUP BY

## count_matches_stop_at_empty_match \\{#count_matches_stop_at_empty_match\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Прекращает подсчёт, как только шаблон даёт совпадение нулевой длины в функции `countMatches`.

## create_if_not_exists \\{#create_if_not_exists\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "New setting."}]}]}/>

Включает использование `IF NOT EXISTS` по умолчанию для оператора `CREATE`. Если либо эта настройка включена, либо явно указано `IF NOT EXISTS`, и таблица с заданным именем уже существует, исключение не генерируется.

## create_index_ignore_unique \\{#create_index_ignore_unique\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорирует ключевое слово UNIQUE в операторе CREATE UNIQUE INDEX. Предназначена для тестов совместимости с SQL.

## create_replicated_merge_tree_fault_injection_probability \\{#create_replicated_merge_tree_fault_injection_probability\\}

<SettingsInfoBlock type="Float" default_value="0" />

Вероятность инъекции ошибки при создании таблицы после создания метаданных в ZooKeeper

## create_table_empty_primary_key_by_default \\{#create_table_empty_primary_key_by_default\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Better usability"}]}]}/>

Позволяет создавать таблицы *MergeTree с пустым первичным ключом, если не указаны ORDER BY и PRIMARY KEY

## cross_join_min_bytes_to_compress \\{#cross_join_min_bytes_to_compress\\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "1073741824"},{"label": "Минимальный размер блока для сжатия в CROSS JOIN. Нулевое значение означает отключение этого порога. Блок сжимается, когда достигнут хотя бы один из двух порогов (по строкам или по байтам)."}]}]}/>

Минимальный размер блока для сжатия в CROSS JOIN. Нулевое значение означает отключение этого порога. Блок сжимается, когда достигнут хотя бы один из двух порогов (по строкам или по байтам).

## cross_join_min_rows_to_compress \\{#cross_join_min_rows_to_compress\\}

<SettingsInfoBlock type="UInt64" default_value="10000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "10000000"},{"label": "Минимальное число строк для сжатия блока при выполнении CROSS JOIN. Нулевое значение отключает этот порог. Блок сжимается, когда достигается любой из двух порогов — по строкам или по байтам."}]}]}/>

Минимальное число строк для сжатия блока при выполнении CROSS JOIN. Нулевое значение отключает этот порог. Блок сжимается, когда достигается любой из двух порогов — по строкам или по байтам.

## cross_to_inner_join_rewrite \\{#cross_to_inner_join_rewrite\\}

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.7"},{"label": "2"},{"label": "Принудительно переписывать join через запятую в INNER JOIN"}]}]}/>

Использовать INNER JOIN вместо соединений через запятую/CROSS JOIN, если в секции WHERE есть условия соединения. Значения: 0 — не переписывать; 1 — по возможности применять для соединений через запятую и CROSS JOIN; 2 — принудительно переписывать все соединения через запятую, CROSS JOIN — по возможности.

## data_type_default_nullable \\{#data_type_default_nullable\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, что типы данных без явных модификаторов [NULL или NOT NULL](/sql-reference/statements/create/table#null-or-not-null-modifiers) в определении столбца будут [Nullable](/sql-reference/data-types/nullable).

Возможные значения:

- 1 — Типы данных в определениях столбцов по умолчанию считаются `Nullable`.
- 0 — Типы данных в определениях столбцов по умолчанию считаются не `Nullable`.

## database_atomic_wait_for_drop_and_detach_synchronously \\{#database_atomic_wait_for_drop_and_detach_synchronously\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Добавляет модификатор `SYNC` ко всем запросам `DROP` и `DETACH`.

Возможные значения:

- 0 — запросы выполняются с задержкой.
- 1 — запросы выполняются без задержки.

## database_replicated_allow_explicit_uuid \\{#database_replicated_allow_explicit_uuid\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Добавлена новая настройка, запрещающая явное указание UUID таблицы"}]}]}/>

0 — Не разрешать явное указание UUID для таблиц в реплицируемых базах данных. 1 — Разрешать. 2 — Разрешать, но игнорировать указанный UUID и вместо него генерировать случайный UUID.

## database_replicated_allow_heavy_create \\{#database_replicated_allow_heavy_create\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Длительные DDL-запросы (CREATE AS SELECT и POPULATE) для движка базы данных Replicated были запрещены"}]}]}/>

Разрешает длительные DDL-запросы (CREATE AS SELECT и POPULATE) в движке базы данных Replicated. Имейте в виду, что это может надолго заблокировать очередь DDL.

## database_replicated_allow_only_replicated_engine \\{#database_replicated_allow_only_replicated_engine\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает создавать в базе данных с движком Replicated только таблицы Replicated

## database_replicated_allow_replicated_engine_arguments \\{#database_replicated_allow_replicated_engine_arguments\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "По умолчанию явные аргументы запрещены"}]}]}/>

0 - Запрещает явное указание пути в ZooKeeper и имени реплики для таблиц *MergeTree в реплицируемых базах данных. 1 - Разрешает. 2 - Разрешает, но игнорирует указанный путь и вместо него использует путь по умолчанию. 3 - Разрешает и не записывает предупреждение в лог.

## database_replicated_always_detach_permanently \\{#database_replicated_always_detach_permanently\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Выполняет команду DETACH TABLE как DETACH TABLE PERMANENTLY, если используется движок базы данных Replicated

## database_replicated_enforce_synchronous_settings \\{#database_replicated_enforce_synchronous_settings\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Принудительно включает синхронное ожидание для некоторых запросов (см. также database_atomic_wait_for_drop_and_detach_synchronously, mutations_sync, alter_sync). Не рекомендуется включать эти настройки.

## database_replicated_initial_query_timeout_sec \\{#database_replicated_initial_query_timeout_sec\\}

<SettingsInfoBlock type="UInt64" default_value="300" />

Устанавливает время ожидания в секундах, в течение которого начальный DDL-запрос должен ждать, пока база данных Replicated обработает предыдущие записи в DDL-очереди.

Возможные значения:

- Положительное целое число.
- 0 — без ограничений.

## database_shared_drop_table_delay_seconds \\{#database_shared_drop_table_delay_seconds\\}

<SettingsInfoBlock type="UInt64" default_value="28800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "28800"},{"label": "Новая настройка."}]}]}/>

Задержка в секундах перед фактическим удалением таблицы из базы данных Shared после её удаления. Это позволяет восстановить таблицу в течение этого времени с помощью оператора `UNDROP TABLE`.

## decimal_check_overflow \\{#decimal_check_overflow\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Проверять переполнение при выполнении десятичных арифметических и сравнительных операций

## deduplicate_blocks_in_dependent_materialized_views \\{#deduplicate_blocks_in_dependent_materialized_views\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает проверку дедупликации для materialized view, получающих данные из таблиц Replicated\*.

Возможные значения:

0 — Отключено.
      1 — Включено.

При включении ClickHouse выполняет дедупликацию блоков в materialized view, зависящих от таблиц Replicated\*.
Этот параметр полезен для того, чтобы materialized view не содержали дублирующиеся данные при повторной попытке вставки после сбоя.

**См. также**

- [Обработка NULL в операторах IN](/guides/developer/deduplicating-inserts-on-retries#insert-deduplication-with-materialized-views)

## deduplicate_insert_select \\{#deduplicate_insert_select\\}

<SettingsInfoBlock type="DeduplicateInsertSelectMode" default_value="enable_when_possible" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "enable_when_possible"},{"label": "change the default behavior of deduplicate_insert_select to ENABLE_WHEN_PROSSIBLE"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "enable_even_for_bad_queries"},{"label": "New setting, replace insert_select_deduplicate"}]}]}/>

Включает или отключает дедупликацию блоков для `INSERT SELECT` (для таблиц Replicated\*).
Этот параметр переопределяет `insert_deduplicate` для запросов `INSERT SELECT`.
У этого параметра есть следующие возможные значения:

- disable — дедупликация отключена для запроса `INSERT SELECT`.
- force_enable — дедупликация включена для запроса `INSERT SELECT`. Если результат SELECT нестабилен, выбрасывается исключение.
- enable_when_possible — дедупликация включена, если `insert_deduplicate` включён и результат SELECT стабилен, иначе отключена.
- enable_even_for_bad_queries — дедупликация включена, если `insert_deduplicate` включён. Если результат SELECT нестабилен, записывается предупреждение, но запрос выполняется с дедупликацией. Эта опция предназначена для обратной совместимости. Рассмотрите возможность использования других опций, так как это может привести к непредсказуемым результатам.

## default_materialized_view_sql_security \\{#default_materialized_view_sql_security\\}

<SettingsInfoBlock type="SQLSecurityType" default_value="DEFINER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "DEFINER"},{"label": "Позволяет задать значение по умолчанию для параметра SQL SECURITY при создании materialized view"}]}]}/>

Позволяет задать значение по умолчанию для параметра SQL SECURITY при создании materialized view. [Подробнее о SQL SECURITY](../../sql-reference/statements/create/view.md/#sql_security).

Значение по умолчанию — `DEFINER`.

## default_max_bytes_in_join \\{#default_max_bytes_in_join\\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

Максимальный размер правой таблицы, если требуется ограничение по размеру, но `max_bytes_in_join` не установлен.

## default_normal_view_sql_security \\{#default_normal_view_sql_security\\}

<SettingsInfoBlock type="SQLSecurityType" default_value="INVOKER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "INVOKER"},{"label": "Позволяет задать значение по умолчанию для опции `SQL SECURITY` при создании обычного представления"}]}]}/>

Позволяет задать значение по умолчанию для опции `SQL SECURITY` при создании обычного представления. [Подробнее о SQL Security](../../sql-reference/statements/create/view.md/#sql_security).

Значение по умолчанию — `INVOKER`.

## default_table_engine \{#default_table_engine\}

<SettingsInfoBlock type="DefaultTableEngine" default_value="MergeTree" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "MergeTree"},{"label": "Set default table engine to MergeTree for better usability"}]}]} />

Движок таблицы по умолчанию, используемый, когда `ENGINE` не указан в операторе `CREATE`.

Возможные значения:

* строка с именем любого допустимого движка таблиц

Значение по умолчанию в Cloud: `SharedMergeTree`.

**Пример**

Запрос:

```sql
SET default_table_engine = 'Log';

SELECT name, value, changed FROM system.settings WHERE name = 'default_table_engine';
```

Результат:

```response
┌─name─────────────────┬─value─┬─changed─┐
│ default_table_engine │ Log   │       1 │
└──────────────────────┴───────┴─────────┘
```

В этом примере каждая новая таблица, в определении которой не указан `Engine`, будет использовать табличный движок `Log`:

Запрос:

```sql
CREATE TABLE my_table (
    x UInt32,
    y UInt32
);

SHOW CREATE TABLE my_table;
```

Результат:

```response
┌─statement────────────────────────────────────────────────────────────────┐
│ CREATE TABLE default.my_table
(
    `x` UInt32,
    `y` UInt32
)
ENGINE = Log
└──────────────────────────────────────────────────────────────────────────┘
```


## default_temporary_table_engine \{#default_temporary_table_engine\}

<SettingsInfoBlock type="DefaultTableEngine" default_value="Memory" />

То же самое, что и [default&#95;table&#95;engine](#default_table_engine), но для временных таблиц.

В этом примере любая новая временная таблица, для которой не указан `Engine`, будет использовать движок таблицы `Log`:

Запрос:

```sql
SET default_temporary_table_engine = 'Log';

CREATE TEMPORARY TABLE my_table (
    x UInt32,
    y UInt32
);

SHOW CREATE TEMPORARY TABLE my_table;
```

Результат:

```response
┌─statement────────────────────────────────────────────────────────────────┐
│ CREATE TEMPORARY TABLE default.my_table
(
    `x` UInt32,
    `y` UInt32
)
ENGINE = Log
└──────────────────────────────────────────────────────────────────────────┘
```


## default_view_definer \\{#default_view_definer\\}

<SettingsInfoBlock type="String" default_value="CURRENT_USER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "CURRENT_USER"},{"label": "Позволяет задать значение по умолчанию для параметра `DEFINER` при создании представления"}]}]}/>

Позволяет задать значение по умолчанию для параметра `DEFINER` при создании представления. [Подробнее о безопасности SQL](../../sql-reference/statements/create/view.md/#sql_security).

Значение по умолчанию — `CURRENT_USER`.

## delta_lake_enable_engine_predicate \\{#delta_lake_enable_engine_predicate\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

Включает внутренний механизм отсечения данных в delta-kernel.

## delta_lake_enable_expression_visitor_logging \\{#delta_lake_enable_expression_visitor_logging\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает логи уровня Test для визитора выражений DeltaLake. Эти логи могут быть слишком подробными даже для тестового логирования.

## delta_lake_insert_max_bytes_in_data_file \\{#delta_lake_insert_max_bytes_in_data_file\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "Новая настройка."}]}]}/>

Определяет максимальный размер в байтах для одного файла данных, вставляемого в Delta Lake.

## delta_lake_insert_max_rows_in_data_file \\{#delta_lake_insert_max_rows_in_data_file\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "Новое SETTING."}]}]}/>

Определяет максимальное количество строк в одном вставляемом файле данных Delta Lake.

## delta_lake_log_metadata \\{#delta_lake_log_metadata\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Включает логирование файлов метаданных Delta Lake в системную таблицу.

## delta_lake_snapshot_end_version \\{#delta_lake_snapshot_end_version\\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "-1"},{"label": "New setting."}]}]}/>

Конечная версия снапшота Delta Lake для чтения. Значение -1 означает, что будет прочитана последняя версия (значение 0 является допустимой версией снапшота).

## delta_lake_snapshot_start_version \\{#delta_lake_snapshot_start_version\\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "-1"},{"label": "New setting."}]}]}/>

Начальная версия снимка Delta Lake для чтения. Значение -1 означает чтение последней доступной версии (значение 0 является допустимой версией снимка).

## delta_lake_snapshot_version \\{#delta_lake_snapshot_version\\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "-1"},{"label": "New setting"}]}]}/>

Версия снимка Delta Lake для чтения. Значение -1 означает чтение последней версии (значение 0 является допустимой версией снимка).

## delta_lake_throw_on_engine_predicate_error \\{#delta_lake_throw_on_engine_predicate_error\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает генерацию исключения, если при анализе предиката сканирования в delta-kernel возникает ошибка.

## describe_compact_output \\{#describe_compact_output\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение true, в результат запроса DESCRIBE включаются только имена и типы столбцов

## describe_include_subcolumns \\{#describe_include_subcolumns\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает описание подстолбцов в запросе [DESCRIBE](../../sql-reference/statements/describe-table.md). Например, элементов [Tuple](../../sql-reference/data-types/tuple.md) или подстолбцов типов данных [Map](/sql-reference/data-types/map#reading-subcolumns-of-map), [Nullable](../../sql-reference/data-types/nullable.md/#finding-null) или [Array](../../sql-reference/data-types/array.md/#array-size).

Возможные значения:

- 0 — Подстолбцы не включаются в запросы `DESCRIBE`.
- 1 — Подстолбцы включаются в запросы `DESCRIBE`.

**Пример**

См. пример для команды [DESCRIBE](../../sql-reference/statements/describe-table.md).

## describe_include_virtual_columns \\{#describe_include_virtual_columns\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение true, виртуальные столбцы таблицы будут включены в результат запроса DESCRIBE.

## dialect \\{#dialect\\}

<SettingsInfoBlock type="Dialect" default_value="clickhouse" />

Диалект, используемый для разбора запроса

## dictionary_use_async_executor \\{#dictionary_use_async_executor\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Выполняет конвейер чтения данных из источника словаря в нескольких потоках. Поддерживается только для словарей с локальным источником CLICKHOUSE.

## dictionary_validate_primary_key_type \\{#dictionary_validate_primary_key_type\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Проверять тип первичного ключа для словарей. По умолчанию тип id для простых схем размещения неявно преобразуется в UInt64."}]}]}/>

Проверять тип первичного ключа для словарей. По умолчанию тип id для простых схем размещения неявно преобразуется в UInt64.

## distinct_overflow_mode \\{#distinct_overflow_mode\\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что происходит, когда объём данных превышает одно из ограничений.

Возможные значения:

- `throw`: выбросить исключение (по умолчанию).
- `break`: прекратить выполнение запроса и вернуть частичный результат, как если бы
исходные данные закончились.

## distributed_aggregation_memory_efficient \\{#distributed_aggregation_memory_efficient\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает режим экономии памяти для распределённой агрегации.

## distributed_background_insert_batch \\{#distributed_background_insert_batch\\}

**Псевдонимы**: `distributed_directory_monitor_batch_inserts`

<SettingsInfoBlock type="Bool" default_value="0" />

Включает/выключает отправку данных при вставке пакетами.

Когда пакетная отправка включена, движок таблицы [Distributed](../../engines/table-engines/special/distributed.md) пытается отправлять несколько файлов вставленных данных за одну операцию вместо отправки их по отдельности. Пакетная отправка повышает производительность кластера за счёт более эффективного использования ресурсов сервера и сети.

Возможные значения:

- 1 — Включено.
- 0 — Выключено.

## distributed_background_insert_max_sleep_time_ms \\{#distributed_background_insert_max_sleep_time_ms\\}

**Псевдонимы**: `distributed_directory_monitor_max_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

Максимальный интервал для отправки данных движком таблицы [Distributed](../../engines/table-engines/special/distributed.md). Ограничивает экспоненциальное увеличение интервала, задаваемого настройкой [distributed_background_insert_sleep_time_ms](#distributed_background_insert_sleep_time_ms).

Возможные значения:

- Положительное целое число миллисекунд.

## distributed_background_insert_sleep_time_ms \\{#distributed_background_insert_sleep_time_ms\\}

**Псевдонимы**: `distributed_directory_monitor_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="100" />

Базовый интервал, с которым движок таблицы [Distributed](../../engines/table-engines/special/distributed.md) отправляет данные. При возникновении ошибок фактический интервал увеличивается экспоненциально.

Возможные значения:

- Положительное целое число миллисекунд.

## distributed_background_insert_split_batch_on_failure \\{#distributed_background_insert_split_batch_on_failure\\}

**Псевдонимы**: `distributed_directory_monitor_split_batch_on_failure`

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает разбиение батчей при возникновении ошибок.

Иногда отправка отдельного батча на удалённый сегмент может завершиться неудачей из‑за сложного конвейера обработки (например, `MATERIALIZED VIEW` с `GROUP BY`) по причине `Memory limit exceeded` или похожих ошибок. В таком случае повторная попытка не поможет (и это «застопорит» распределённые отправки для таблицы), но пофайловая отправка из этого батча, когда файлы пересылаются по одному, может успешно выполнить INSERT.

Поэтому установка этого параметра в `1` отключит пакетную обработку для таких батчей (то есть временно отключит `distributed_background_insert_batch` для неуспешных батчей).

Возможные значения:

- 1 — Включено.
- 0 — Выключено.

:::note
Этот параметр также влияет на повреждённые батчи (которые могут появляться из‑за аварийного завершения работы сервера (машины) и отсутствия `fsync_after_insert`/`fsync_directories` для движка таблиц [Distributed](../../engines/table-engines/special/distributed.md)).
:::

:::note
Не следует полагаться на автоматическое разбиение батчей, так как это может негативно сказаться на производительности.
:::

## distributed_background_insert_timeout \\{#distributed_background_insert_timeout\\}

**Псевдонимы**: `insert_distributed_timeout`

<SettingsInfoBlock type="UInt64" default_value="0" />

Таймаут для запроса INSERT в распределённую таблицу (Distributed). Настройка используется только при включённом insert_distributed_sync. Нулевое значение означает отсутствие таймаута.

## distributed_cache_alignment \\{#distributed_cache_alignment\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "Переименование настройки distributed_cache_read_alignment"}]}]}/>

Оказывается только в ClickHouse Cloud. Настройка предназначена для тестирования, не изменяйте её.

## distributed_cache_bypass_connection_pool \\{#distributed_cache_bypass_connection_pool\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Позволяет обойти пул соединений распределённого кэша.

## distributed_cache_connect_backoff_max_ms \\{#distributed_cache_connect_backoff_max_ms\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "50"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Максимальное время задержки (в миллисекундах) при установлении соединения для распределённого кэша.

## distributed_cache_connect_backoff_min_ms \\{#distributed_cache_connect_backoff_min_ms\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Действует только в ClickHouse Cloud. Минимальная задержка (backoff) в миллисекундах при создании подключения к распределённому кэшу.

## distributed_cache_connect_max_tries \\{#distributed_cache_connect_max_tries\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5"},{"label": "Изменено значение настройки"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "20"},{"label": "Только Cloud"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "20"},{"label": "Настройка для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Количество попыток подключения к распределённому кэшу в случае неудачи

## distributed_cache_connect_timeout_ms \\{#distributed_cache_connect_timeout_ms\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "50"},{"label": "Новая настройка"}]}]}/>

Применяется только в ClickHouse Cloud. Таймаут ожидания при подключении к серверу распределённого кэша.

## distributed_cache_credentials_refresh_period_seconds \\{#distributed_cache_credentials_refresh_period_seconds\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "5"},{"label": "New private setting"}]}]}/>

Действует только в ClickHouse Cloud. Интервал обновления учетных данных.

## distributed_cache_data_packet_ack_window \\{#distributed_cache_data_packet_ack_window\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "5"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

Оказывает действие только в ClickHouse Cloud. Окно для отправки ACK для последовательности DataPacket в рамках одного запроса на чтение из распределённого кэша.

## distributed_cache_discard_connection_if_unread_data \\{#distributed_cache_discard_connection_if_unread_data\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "Новая настройка"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Оказывает действие только в ClickHouse Cloud. Разрывать соединение, если остались непрочитанные данные.

## distributed_cache_fetch_metrics_only_from_current_az \\{#distributed_cache_fetch_metrics_only_from_current_az\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Получает метрики только из текущей зоны доступности в system.distributed_cache_metrics и system.distributed_cache_events.

## distributed_cache_file_cache_name \\{#distributed_cache_file_cache_name\\}

<CloudOnlyBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": ""},{"label": "Новая настройка."}]}]}/>

Действует только в ClickHouse Cloud. Настройка используется только для CI‑тестов — имя кеша файловой системы, применяемого в распределённом кеше.

## distributed_cache_log_mode \\{#distributed_cache_log_mode\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCacheLogMode" default_value="on_error" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "on_error"},{"label": "Настройка для ClickHouse Cloud"}]}]}/>

Применяется только в ClickHouse Cloud. Режим логирования в таблицу system.distributed_cache_log.

## distributed_cache_max_unacked_inflight_packets \\{#distributed_cache_max_unacked_inflight_packets\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Применяется только в ClickHouse Cloud. Максимальное количество неподтверждённых пакетов в полёте в одном запросе чтения распределённого кэша.

## distributed_cache_min_bytes_for_seek \\{#distributed_cache_min_bytes_for_seek\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новый приватный параметр."}]}]}/>

Применяется только в ClickHouse Cloud. Минимальное количество байт, при котором выполняется операция seek в распределённом кэше.

## distributed_cache_pool_behaviour_on_limit \\{#distributed_cache_pool_behaviour_on_limit\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCachePoolBehaviourOnLimit" default_value="wait" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "wait"},{"label": "Только в ClickHouse Cloud"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "allocate_bypassing_pool"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Определяет поведение соединения распределённого кэша при достижении лимита пула подключений

## distributed_cache_prefer_bigger_buffer_size \\{#distributed_cache_prefer_bigger_buffer_size\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "Новый параметр."}]}]}/>

Действует только в ClickHouse Cloud. То же, что filesystem_cache_prefer_bigger_buffer_size, но для распределённого кэша.

## distributed_cache_read_only_from_current_az \\{#distributed_cache_read_only_from_current_az\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Разрешает чтение только из текущей зоны доступности. Если параметр отключён, чтение будет происходить со всех кэш-серверов во всех зонах доступности.

## distributed_cache_read_request_max_tries \\{#distributed_cache_read_request_max_tries\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "Изменено значение настройки"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "20"},{"label": "Новая настройка"}]}]}/>

Действует только в ClickHouse Cloud. Количество попыток выполнения запроса к распределённому кэшу при неудаче.

## distributed_cache_receive_response_wait_milliseconds \\{#distributed_cache_receive_response_wait_milliseconds\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "60000"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Время ожидания в миллисекундах для получения данных по запросу из распределённого кэша.

## distributed_cache_receive_timeout_milliseconds \\{#distributed_cache_receive_timeout_milliseconds\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10000"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Время ожидания в миллисекундах для получения любого ответа от распределённого кэша.

## distributed_cache_receive_timeout_ms \\{#distributed_cache_receive_timeout_ms\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Таймаут получения данных от сервера распределённого кэша, в миллисекундах. Если в течение этого интервала не было получено ни одного байта, генерируется исключение.

## distributed_cache_send_timeout_ms \\{#distributed_cache_send_timeout_ms\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "Новая настройка"}]}]}/>

Действует только в ClickHouse Cloud. Таймаут отправки данных на сервер распределённого кэша в миллисекундах. Если клиенту нужно отправить данные, но он не может отправить ни одного байта в течение этого интервала, генерируется исключение.

## distributed_cache_tcp_keep_alive_timeout_ms \\{#distributed_cache_tcp_keep_alive_timeout_ms\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="2900" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "2900"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Время в миллисекундах, в течение которого соединение с сервером распределённого кэша должно оставаться бездействующим, прежде чем TCP начнёт отправлять keepalive-пакеты.

## distributed_cache_throw_on_error \\{#distributed_cache_throw_on_error\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Повторно генерирует исключение, возникшее при взаимодействии с распределённым кэшем, или исключение, полученное от распределённого кэша. В противном случае при ошибке выполняется обход распределённого кэша.

## distributed_cache_use_clients_cache_for_read \\{#distributed_cache_use_clients_cache_for_read\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Использует клиентский кэш для запросов на чтение.

## distributed_cache_use_clients_cache_for_write \\{#distributed_cache_use_clients_cache_for_write\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Использует клиентский кэш для запросов записи.

## distributed_cache_wait_connection_from_pool_milliseconds \\{#distributed_cache_wait_connection_from_pool_milliseconds\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "100"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Время ожидания в миллисекундах для получения соединения из пула соединений, если distributed_cache_pool_behaviour_on_limit имеет значение wait.

## distributed_connections_pool_size \\{#distributed_connections_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

Максимальное количество одновременных подключений к удалённым серверам для распределённой обработки всех запросов к одной distributed таблице. Рекомендуется указывать значение не меньше количества серверов в кластере.

## distributed_ddl_entry_format_version \\{#distributed_ddl_entry_format_version\\}

<SettingsInfoBlock type="UInt64" default_value="5" />

Версия совместимости формата записей для распределённых запросов DDL (ON CLUSTER)

## distributed_ddl_output_mode \\{#distributed_ddl_output_mode\\}

<SettingsInfoBlock type="DistributedDDLOutputMode" default_value="throw" />

Задаёт формат результата распределённого DDL-запроса.

Возможные значения:

- `throw` — Возвращает результирующий набор со статусом выполнения запроса для всех хостов, где запрос завершён. Если запрос завершился с ошибкой на некоторых хостах, повторно выбрасывается первое исключение. Если запрос ещё не завершён на некоторых хостах и превышено значение [distributed_ddl_task_timeout](#distributed_ddl_task_timeout), выбрасывается исключение `TIMEOUT_EXCEEDED`.
- `none` — Аналогично `throw`, но распределённый DDL-запрос не возвращает результирующий набор.
- `null_status_on_timeout` — Возвращает `NULL` в качестве статуса выполнения в некоторых строках результирующего набора вместо выбрасывания `TIMEOUT_EXCEEDED`, если запрос не завершён на соответствующих хостах.
- `never_throw` — Не выбрасывать `TIMEOUT_EXCEEDED` и не повторно выбрасывать исключения, если запрос завершился с ошибкой на некоторых хостах.
- `none_only_active` — аналогично `none`, но не ждёт неактивные реплики базы данных `Replicated`. Примечание: с этим режимом невозможно определить, что запрос не был выполнен на некоторой реплике и будет выполнен в фоновом режиме.
- `null_status_on_timeout_only_active` — аналогично `null_status_on_timeout`, но не ждёт неактивные реплики базы данных `Replicated`.
- `throw_only_active` — аналогично `throw`, но не ждёт неактивные реплики базы данных `Replicated`.

Значение по умолчанию в Cloud: `throw`.

## distributed_ddl_task_timeout \\{#distributed_ddl_task_timeout\\}

<SettingsInfoBlock type="Int64" default_value="180" />

Устанавливает таймаут ожидания ответов на DDL-запросы от всех хостов в кластере. Если DDL-запрос не был выполнен на всех хостах, в ответе будет ошибка таймаута, а запрос будет выполняться в асинхронном режиме. Отрицательное значение означает бесконечный таймаут.

Возможные значения:

- Положительное целое число.
- 0 — асинхронный режим.
- Отрицательное целое число — бесконечный таймаут.

## distributed_foreground_insert \\{#distributed_foreground_insert\\}

**Псевдонимы**: `insert_distributed_sync`

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает синхронную вставку данных в таблицу [Distributed](/engines/table-engines/special/distributed).

По умолчанию при вставке данных в таблицу `Distributed` сервер ClickHouse отправляет данные на узлы кластера в фоновом режиме. Когда `distributed_foreground_insert=1`, данные обрабатываются синхронно, и операция `INSERT` считается успешной только после того, как все данные сохранены на всех сегментах (как минимум одна реплика для каждого сегмента, если `internal_replication` установлена в `true`).

Возможные значения:

- `0` — данные вставляются в фоновом режиме.
- `1` — данные вставляются в синхронном режиме.

Значение по умолчанию в Cloud: `0`.

**См. также**

- [Distributed Table Engine](/engines/table-engines/special/distributed)
- [Управление distributed таблицами](/sql-reference/statements/system#managing-distributed-tables)

## distributed_group_by_no_merge \{#distributed_group_by_no_merge\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Не объединять состояния агрегации с разных серверов при распределённой обработке запроса. Можно использовать, если заранее известно, что на разных сегментах используются разные ключи.

Возможные значения:

* `0` — Отключено (финальная обработка запроса выполняется на узле-инициаторе).
* `1` — Не объединять состояния агрегации с разных серверов при распределённой обработке запроса (запрос полностью обрабатывается на сегменте, инициатор лишь проксирует данные). Можно использовать, если заранее известно, что на разных сегментах используются разные ключи.
* `2` — То же, что и `1`, но `ORDER BY` и `LIMIT` выполняются на инициаторе (это невозможно, когда запрос полностью обрабатывается на удалённом узле, как при `distributed_group_by_no_merge=1`). Может использоваться для запросов с `ORDER BY` и/или `LIMIT`.

**Пример**

```sql
SELECT *
FROM remote('127.0.0.{2,3}', system.one)
GROUP BY dummy
LIMIT 1
SETTINGS distributed_group_by_no_merge = 1
FORMAT PrettyCompactMonoBlock

┌─dummy─┐
│     0 │
│     0 │
└───────┘
```

```sql
SELECT *
FROM remote('127.0.0.{2,3}', system.one)
GROUP BY dummy
LIMIT 1
SETTINGS distributed_group_by_no_merge = 2
FORMAT PrettyCompactMonoBlock

┌─dummy─┐
│     0 │
└───────┘
```


## distributed_insert_skip_read_only_replicas \\{#distributed_insert_skip_read_only_replicas\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Если установлено значение true, INSERT в Distributed будет пропускать реплики только для чтения"}]}]}/>

Включает пропуск реплик только для чтения для запросов INSERT в таблицы Distributed.

Возможные значения:

- 0 — INSERT выполняется как обычно; если он попадёт на реплику только для чтения, запрос завершится с ошибкой
- 1 — Узел-инициатор будет пропускать реплики только для чтения перед отправкой данных на сегменты.

## distributed_plan_default_reader_bucket_count \\{#distributed_plan_default_reader_bucket_count\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "Новая экспериментальная настройка."}]}]}/>

Количество задач по умолчанию для параллельного чтения при выполнении распределённого запроса. Задачи распределяются между репликами.

## distributed_plan_default_shuffle_join_bucket_count \\{#distributed_plan_default_shuffle_join_bucket_count\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "New experimental setting."}]}]}/>

Число бакетов по умолчанию для распределённого shuffle-hash join.

## distributed_plan_execute_locally \\{#distributed_plan_execute_locally\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Новая экспериментальная настройка."}]}]}/>

Выполняет все задачи распределённого плана запроса локально. Полезно для тестирования и отладки.

## distributed_plan_force_exchange_kind \\{#distributed_plan_force_exchange_kind\\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "Новая экспериментальная настройка."}]}]}/>

Принудительно использовать указанный тип операторов Exchange между стадиями распределённого запроса.

Возможные значения:

- '' - не принуждать использование какого-либо типа операторов Exchange, предоставить выбор оптимизатору,
 - 'Persisted' - использовать временные файлы в объектном хранилище,
 - 'Streaming' - передавать данные обмена по сети в потоковом режиме.

## distributed_plan_force_shuffle_aggregation \\{#distributed_plan_force_shuffle_aggregation\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

Использует стратегию агрегации Shuffle вместо PartialAggregation + Merge в распределённом плане запроса.

## distributed_plan_max_rows_to_broadcast \\{#distributed_plan_max_rows_to_broadcast\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="20000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "20000"},{"label": "Новая экспериментальная настройка."}]}]}/>

Максимальное количество строк, при котором в распределённом плане запроса используется broadcast join, а не shuffle join.

## distributed_plan_optimize_exchanges \\{#distributed_plan_optimize_exchanges\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Новая экспериментальная настройка."}]}]}/>

Удаляет лишние операции обмена данными в распределённом плане запроса. Отключите для отладки.

## distributed_product_mode \\{#distributed_product_mode\\}

<SettingsInfoBlock type="DistributedProductMode" default_value="deny" />

Изменяет поведение [distributed-подзапросов](../../sql-reference/operators/in.md).

ClickHouse применяет этот SETTING, когда запрос содержит декартово произведение distributed таблиц, то есть когда запрос к distributed таблице содержит не-GLOBAL подзапрос к distributed таблице.

Ограничения:

- Применяется только для подзапросов IN и JOIN.
- Только если секция FROM использует distributed таблицу, содержащую более одного сегмента.
- Только если подзапрос относится к distributed таблице, содержащей более одного сегмента.
- Не используется для табличной функции [remote](../../sql-reference/table-functions/remote.md).

Возможные значения:

- `deny` — значение по умолчанию. Запрещает использование этих типов подзапросов (вызывает исключение «Double-distributed IN/JOIN subqueries is denied»).
- `local` — заменяет базу данных и таблицу в подзапросе на локальные для целевого сервера (сегмента), при этом оставляет обычные `IN`/`JOIN`.
- `global` — заменяет запрос `IN`/`JOIN` на `GLOBAL IN`/`GLOBAL JOIN`.
- `allow` — разрешает использование этих типов подзапросов.

## distributed_push_down_limit \\{#distributed_push_down_limit\\}

<SettingsInfoBlock type="UInt64" default_value="1" />

Включает или отключает применение [LIMIT](#limit) отдельно на каждом сегменте.

Это позволяет избежать:

- Отправки лишних строк по сети;
- Обработки строк за пределами лимита на сервере-инициаторе.

Начиная с версии 21.9 невозможно получить неточные результаты, поскольку `distributed_push_down_limit` изменяет выполнение запроса только если выполняется хотя бы одно из условий:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge) > 0.
- В запросе **нет** `GROUP BY`/`DISTINCT`/`LIMIT BY`, но есть `ORDER BY`/`LIMIT`.
- В запросе **есть** `GROUP BY`/`DISTINCT`/`LIMIT BY` с `ORDER BY`/`LIMIT` и при этом:
    - [optimize_skip_unused_shards](#optimize_skip_unused_shards) включён.
    - [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key) включён.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

См. также:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)
- [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key)

## distributed_replica_error_cap \\{#distributed_replica_error_cap\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

- Тип: беззнаковое целое число
- Значение по умолчанию: 1000

Счетчик ошибок для каждой реплики ограничивается этим значением, что не позволяет одной реплике накапливать слишком много ошибок.

См. также:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_error_half_life \\{#distributed_replica_error_half_life\\}

<SettingsInfoBlock type="Seconds" default_value="60" />

- Тип: секунды
- Значение по умолчанию: 60 секунд

Определяет, как быстро обнуляются ошибки в distributed таблицах. Если реплика в течение некоторого времени недоступна, накапливает 5 ошибок, а distributed_replica_error_half_life установлен в 1 секунду, то реплика считается нормальной через 3 секунды после последней ошибки.

См. также:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_max_ignored_errors \\{#distributed_replica_max_ignored_errors\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

- Тип: беззнаковое целое число
- Значение по умолчанию: 0

Количество ошибок, которые будут игнорироваться при выборе реплик (в соответствии с алгоритмом `load_balancing`).

См. также:

- [load_balancing](#load_balancing-round_robin)
- [Движок таблиц Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)

## do_not_merge_across_partitions_select_final \\{#do_not_merge_across_partitions_select_final\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Выполнять слияние частей только внутри одной партиции в запросах с `FINAL`

## empty_result_for_aggregation_by_constant_keys_on_empty_set \\{#empty_result_for_aggregation_by_constant_keys_on_empty_set\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Возвращать пустой результат при агрегации по константным ключам для пустого Set.

## empty_result_for_aggregation_by_empty_set \\{#empty_result_for_aggregation_by_empty_set\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Возвращает пустой результат при агрегации без ключей на пустом множестве.

## enable_adaptive_memory_spill_scheduler \\{#enable_adaptive_memory_spill_scheduler\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Новая настройка. Адаптивное включение сброса данных из памяти во внешнее хранилище."}]}]}/>

Запускает обработчик для адаптивного сброса данных из оперативной памяти во внешнее хранилище. В настоящее время поддерживается GRACE JOIN.

## enable_add_distinct_to_in_subqueries \\{#enable_add_distinct_to_in_subqueries\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка для уменьшения размера временных таблиц, передаваемых для распределённых подзапросов IN."}]}]}/>

Включает использование `DISTINCT` в подзапросах `IN`. Это компромиссная настройка: её включение может существенно уменьшить размер временных таблиц, передаваемых для распределённых подзапросов IN, и значительно ускорить передачу данных между сегментами за счёт отправки только уникальных значений.
Однако включение этой настройки добавляет дополнительные операции слияния на каждом узле, поскольку необходимо выполнять дедупликацию (DISTINCT). Используйте эту настройку, когда сетевая передача является узким местом и дополнительные накладные расходы на слияние приемлемы.

## enable_blob_storage_log \\{#enable_blob_storage_log\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Записывает сведения об операциях blob-хранилища в таблицу system.blob_storage_log"}]}]}/>

Записывает сведения об операциях blob-хранилища в таблицу system.blob_storage_log

## enable_early_constant_folding \\{#enable_early_constant_folding\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию запроса, при которой анализируются результаты функций и подзапросов и запрос переписывается, если в них присутствуют константы

## enable_extended_results_for_datetime_functions \\{#enable_extended_results_for_datetime_functions\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает возврат результатов типа `Date32` с расширенным диапазоном значений (по сравнению с типом `Date`)
или `DateTime64` с расширенным диапазоном значений (по сравнению с типом `DateTime`).

Возможные значения:

- `0` — функции возвращают `Date` или `DateTime` для всех типов аргументов.
- `1` — функции возвращают `Date32` или `DateTime64` для аргументов типа `Date32` или `DateTime64`, а в остальных случаях — `Date` или `DateTime`.

Таблица ниже показывает поведение этого параметра для различных функций работы с датой и временем.

| Функция                   | `enable_extended_results_for_datetime_functions = 0`                                                                        | `enable_extended_results_for_datetime_functions = 1`                                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toStartOfYear`           | Возвращает значение типа `Date` или `DateTime`                                                                              | Возвращает `Date`/`DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для аргументов типа `Date32`/`DateTime64`               |
| `toStartOfISOYear`        | Возвращает значение типа `Date` или `DateTime`                                                                              | Возвращает `Date`/`DateTime` для входного значения типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для входного значения типа `Date32`/`DateTime64` |
| `toStartOfQuarter`        | Возвращает значение типа `Date` или `DateTime`                                                                              | Возвращает `Date`/`DateTime` для входного значения типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для входного значения типа `Date32`/`DateTime64` |
| `toStartOfMonth`          | Возвращает `Date` или `DateTime`                                                                                            | Возвращает `Date`/`DateTime` для аргументов `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для аргументов `Date32`/`DateTime64`                         |
| `toStartOfWeek`           | Возвращает значение типа `Date` или `DateTime`                                                                              | Возвращает `Date`/`DateTime` для аргумента `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для аргумента `Date32`/`DateTime64`                           |
| `toLastDayOfWeek`         | Возвращает значение типа `Date` или `DateTime`                                                                              | Возвращает `Date`/`DateTime` для аргумента типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для аргумента типа `Date32`/`DateTime64`                 |
| `toLastDayOfMonth`        | Возвращает значение типа `Date` или `DateTime`                                                                              | Возвращает `Date`/`DateTime` для аргумента типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для аргумента типа `Date32`/`DateTime64`                 |
| `toMonday`                | Возвращает значение типа `Date` или `DateTime`                                                                              | Возвращает `Date`/`DateTime` для аргумента `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для аргумента `Date32`/`DateTime64`                           |
| `toStartOfDay`            | Возвращает значение типа `DateTime`<br />*Примечание: Некорректные результаты для значений вне диапазона 1970–2149 годов*   | Возвращает `DateTime` для входных значений типов `Date`/`DateTime`<br />Возвращает `DateTime64` для входных значений типов `Date32`/`DateTime64`                 |
| `toStartOfHour`           | Возвращает `DateTime`<br />*Примечание: Некорректные результаты для значений за пределами диапазона 1970–2149*              | Возвращает `DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `DateTime64` для аргументов типа `Date32`/`DateTime64`                               |
| `toStartOfFifteenMinutes` | Возвращает значение типа `DateTime`<br />*Примечание: некорректные результаты для значений вне диапазона 1970–2149 годов*   | Возвращает `DateTime` для входных аргументов типа `Date`/`DateTime`<br />Возвращает `DateTime64` для входных аргументов типа `Date32`/`DateTime64`               |
| `toStartOfTenMinutes`     | Возвращает `DateTime`<br />*Примечание: может возвращать неверные результаты для значений за пределами диапазона 1970–2149* | Возвращает `DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `DateTime64` для аргументов типа `Date32`/`DateTime64`                               |
| `toStartOfFiveMinutes`    | Возвращает `DateTime`<br />*Примечание: Некорректные результаты для значений за пределами диапазона 1970–2149 годов*        | Возвращает `DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `DateTime64` для аргументов типа `Date32`/`DateTime64`                               |
| `toStartOfMinute`         | Возвращает значение типа `DateTime`<br />*Примечание: Некорректные результаты для значений вне диапазона 1970–2149 годов*   | Возвращает `DateTime` для входных значений типа `Date`/`DateTime`<br />Возвращает `DateTime64` для входных значений типа `Date32`/`DateTime64`                   |
| `timeSlot`                | Возвращает `DateTime`<br />*Примечание: некорректные результаты для значений вне диапазона 1970–2149 годов*                 | Возвращает `DateTime` для аргумента `Date`/`DateTime`<br />Возвращает `DateTime64` для аргумента `Date32`/`DateTime64`                                           |

## enable_filesystem_cache \\{#enable_filesystem_cache\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш для удалённой файловой системы. Этот параметр не включает и не отключает кэш для дисков (это должно выполняться через конфигурацию дисков), но позволяет при необходимости обходить кэш для отдельных запросов.

## enable_filesystem_cache_log \\{#enable_filesystem_cache_log\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает вести журнал кеширования файловой системы для каждого запроса

## enable_filesystem_cache_on_write_operations \\{#enable_filesystem_cache_on_write_operations\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает кэш `write-through`. Если установлено значение `false`, кэш `write-through` отключён для операций записи. Если установлено значение `true`, кэш `write-through` включён, пока параметр `cache_on_write_operations` активирован в разделе конфигурации дискового кэша в конфиге сервера.
См. раздел ["Использование локального кэша"](/operations/storing-data#using-local-cache) для получения более подробной информации.

## enable_filesystem_read_prefetches_log \\{#enable_filesystem_read_prefetches_log\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Записывать в system.filesystem prefetch_log во время выполнения запроса. Следует использовать только для тестирования или отладки; не рекомендуется включать по умолчанию

## enable_full_text_index \\{#enable_full_text_index\\}

<BetaBadge/>

**Псевдонимы**: `allow_experimental_full_text_index`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Текстовый индекс был переведён в статус Beta."}]}]}/>

Если имеет значение true, разрешает использование текстового индекса.

## enable_global_with_statement \\{#enable_global_with_statement\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.2"},{"label": "1"},{"label": "По умолчанию команды WITH распространяются на запросы UNION и все подзапросы"}]}]}/>

Распространяет команды WITH на запросы UNION и все подзапросы

## enable_hdfs_pread \\{#enable_hdfs_pread\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Новая настройка."}]}]}/>

Включает или отключает использование `pread` для файлов HDFS. По умолчанию используется `hdfsPread`. Если параметр отключён, для чтения файлов HDFS будут использоваться `hdfsRead` и `hdfsSeek`.

## enable_http_compression \\{#enable_http_compression\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "В целом должно быть полезно"}]}]}/>

Включает или отключает сжатие данных в ответе на HTTP-запрос.

Для получения дополнительной информации см. [описание HTTP-интерфейса](/interfaces/http).

Возможные значения:

- 0 — отключено.
- 1 — включено.

## enable_job_stack_trace \\{#enable_job_stack_trace\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Настройка была отключена по умолчанию, чтобы избежать накладных расходов по производительности."}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "0"},{"label": "Включает сбор стек-трейсов при планировании заданий. По умолчанию отключено, чтобы избежать накладных расходов по производительности."}]}]}/>

Выводит стек-трейс компонента, создавшего задание, если выполнение задания приводит к исключению. По умолчанию отключено, чтобы избежать накладных расходов по производительности.

## enable_join_runtime_filters \\{#enable_join_runtime_filters\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

Фильтрует левую часть JOIN по множеству ключей, собранных из правой части во время выполнения запроса.

## enable_lazy_columns_replication \\{#enable_lazy_columns_replication\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Ленивая репликация столбцов в JOIN и ARRAY JOIN по умолчанию включена"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Добавлена настройка для включения ленивой репликации столбцов в JOIN и ARRAY JOIN"}]}]}/>

Включает ленивую репликацию столбцов в JOIN и ARRAY JOIN, что позволяет избежать лишнего многократного копирования одинаковых строк в памяти.

## enable_lightweight_delete \\{#enable_lightweight_delete\\}

**Псевдонимы**: `allow_experimental_lightweight_delete`

<SettingsInfoBlock type="Bool" default_value="1" />

Включает мутации легковесного удаления (DELETE) для таблиц MergeTree.

## enable_lightweight_update \\{#enable_lightweight_update\\}

<BetaBadge/>

**Псевдонимы**: `allow_experimental_lightweight_update`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Легковесные обновления были переведены в статус Beta. Добавлен псевдоним для настройки 'allow_experimental_lightweight_update'."}]}]}/>

Разрешает использование легковесных обновлений.

## enable_memory_bound_merging_of_aggregation_results \\{#enable_memory_bound_merging_of_aggregation_results\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает стратегию слияния результатов агрегации с ограничением по памяти.

## enable_multiple_prewhere_read_steps \\{#enable_multiple_prewhere_read_steps\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Переносит больше условий из WHERE в PREWHERE и выполняет чтение с диска и фильтрацию в несколько шагов, если есть несколько условий, объединённых оператором AND

## enable_named_columns_in_function_tuple \\{#enable_named_columns_in_function_tuple\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Генерировать именованные кортежи в функции tuple(), когда все имена уникальны и могут рассматриваться как идентификаторы без кавычек."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "Отключено до улучшения удобства использования"}]}]}/>

Генерировать именованные кортежи в функции tuple(), когда все имена уникальны и могут рассматриваться как идентификаторы без кавычек.

## enable_optimize_predicate_expression \\{#enable_optimize_predicate_expression\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "18.12.17"},{"label": "1"},{"label": "Optimize predicates to subqueries by default"}]}]}/>

Включает проталкивание предикатов (predicate pushdown) в запросах `SELECT`.

Проталкивание предикатов может значительно уменьшить сетевой трафик для распределённых запросов.

Возможные значения:

- 0 — Выключено.
- 1 — Включено.

Использование

Рассмотрим следующие запросы:

1.  `SELECT count() FROM test_table WHERE date = '2018-10-10'`
2.  `SELECT count() FROM (SELECT * FROM test_table) WHERE date = '2018-10-10'`

Если `enable_optimize_predicate_expression = 1`, время выполнения этих запросов одинаково, потому что ClickHouse применяет `WHERE` к подзапросу при его обработке.

Если `enable_optimize_predicate_expression = 0`, время выполнения второго запроса значительно больше, потому что предикат `WHERE` применяется ко всем данным после завершения подзапроса.

## enable_optimize_predicate_expression_to_final_subquery \\{#enable_optimize_predicate_expression_to_final_subquery\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает проталкивание предикатов в подзапрос с `FINAL`.

## enable_order_by_all \{#enable_order_by_all\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает сортировку с использованием синтаксиса `ORDER BY ALL`, см. [ORDER BY](../../sql-reference/statements/select/order-by.md).

Возможные значения:

* 0 — отключить ORDER BY ALL.
* 1 — включить ORDER BY ALL.

**Пример**

Запрос:

```sql
CREATE TABLE TAB(C1 Int, C2 Int, ALL Int) ENGINE=Memory();

INSERT INTO TAB VALUES (10, 20, 30), (20, 20, 10), (30, 10, 20);

SELECT * FROM TAB ORDER BY ALL; -- returns an error that ALL is ambiguous

SELECT * FROM TAB ORDER BY ALL SETTINGS enable_order_by_all = 0;
```

Результат:

```text
┌─C1─┬─C2─┬─ALL─┐
│ 20 │ 20 │  10 │
│ 30 │ 10 │  20 │
│ 10 │ 20 │  30 │
└────┴────┴─────┘
```


## enable_parallel_blocks_marshalling \\{#enable_parallel_blocks_marshalling\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "true"},{"label": "A new setting"}]}]}/>

Влияет только на распределённые запросы. Если параметр включён, блоки будут (де)сериализовываться и (де)сжиматься в потоках конвейера (то есть с более высоким уровнем параллелизма, чем по умолчанию) до/после отправки инициатору запроса.

## enable_parsing_to_custom_serialization \\{#enable_parsing_to_custom_serialization\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

Если значение равно true, данные могут напрямую разбираться в столбцы с пользовательской сериализацией (например, разрежённой (Sparse)) в соответствии с подсказками по сериализации, полученными из таблицы.

## enable_positional_arguments \{#enable_positional_arguments\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.7"},{"label": "1"},{"label": "Enable positional arguments feature by default"}]}]} />

Включает или отключает поддержку позиционных аргументов для команд [GROUP BY](/sql-reference/statements/select/group-by), [LIMIT BY](../../sql-reference/statements/select/limit-by.md), [ORDER BY](../../sql-reference/statements/select/order-by.md).

Возможные значения:

* 0 — позиционные аргументы не поддерживаются.
* 1 — позиционные аргументы поддерживаются: вместо имён столбцов можно использовать их номера.

**Пример**

Запрос:

```sql
CREATE TABLE positional_arguments(one Int, two Int, three Int) ENGINE=Memory();

INSERT INTO positional_arguments VALUES (10, 20, 30), (20, 20, 10), (30, 10, 20);

SELECT * FROM positional_arguments ORDER BY 2,3;
```

Результат:

```text
┌─one─┬─two─┬─three─┐
│  30 │  10 │   20  │
│  20 │  20 │   10  │
│  10 │  20 │   30  │
└─────┴─────┴───────┘
```


## enable_positional_arguments_for_projections \\{#enable_positional_arguments_for_projections\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Новая настройка для управления позиционными аргументами в проекциях."}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "0"},{"label": "Новая настройка для управления позиционными аргументами в проекциях."}]}, {"id": "row-3","items": [{"label": "25.10"},{"label": "0"},{"label": "Новая настройка для управления позиционными аргументами в проекциях."}]}]}/>

Включает или отключает поддержку позиционных аргументов в определениях PROJECTION. См. также настройку [enable_positional_arguments](#enable_positional_arguments).

:::note
Это настройка для опытных пользователей; не изменяйте её, если вы только начинаете работу с ClickHouse.
:::

Возможные значения:

- 0 — позиционные аргументы не поддерживаются.
- 1 — позиционные аргументы поддерживаются: можно использовать номера столбцов вместо их имён.

## enable_producing_buckets_out_of_order_in_aggregation \\{#enable_producing_buckets_out_of_order_in_aggregation\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

Разрешает агрегации с экономным использованием памяти (см. `distributed_aggregation_memory_efficient`) формировать бакеты не по порядку.
Это может повысить производительность при неравномерных размерах бакетов агрегации, позволяя реплике отправлять инициатору бакеты с более высокими ID, пока он всё ещё обрабатывает тяжёлые бакеты с более низкими ID.
Недостатком может быть потенциально более высокое использование памяти.

## enable_qbit_type \\{#enable_qbit_type\\}

<BetaBadge/>

**Псевдонимы**: `allow_experimental_qbit_type`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "QBit был переведен в статус Beta. Добавлен псевдоним для настройки 'allow_experimental_qbit_type'."}]}]}/>

Позволяет создавать тип данных [QBit](../../sql-reference/data-types/qbit.md).

## enable_reads_from_query_cache \\{#enable_reads_from_query_cache\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включён, результаты запросов `SELECT` извлекаются из [кэша запросов](../query-cache.md).

Возможные значения:

- 0 — Отключено
- 1 — Включено

## enable_s3_requests_logging \\{#enable_s3_requests_logging\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает очень подробное логирование запросов к S3. Имеет смысл включать только для отладки.

## enable_scalar_subquery_optimization \\{#enable_scalar_subquery_optimization\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.18"},{"label": "1"},{"label": "Предотвращает (де)сериализацию больших скалярных значений в скалярных подзапросах и, возможно, позволяет избежать многократного выполнения одного и того же подзапроса"}]}]}/>

Если установлено значение true, предотвращает (де)сериализацию больших скалярных значений в скалярных подзапросах и, возможно, позволяет избежать многократного выполнения одного и того же подзапроса.

## enable_scopes_for_with_statement \\{#enable_scopes_for_with_statement\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "Новая настройка для обратной совместимости со старым анализатором."}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "1"},{"label": "Новая настройка для обратной совместимости со старым анализатором."}]}, {"id": "row-3","items": [{"label": "25.5"},{"label": "1"},{"label": "Новая настройка для обратной совместимости со старым анализатором."}]}, {"id": "row-4","items": [{"label": "25.4"},{"label": "1"},{"label": "Новая настройка для обратной совместимости со старым анализатором."}]}]}/>

Если отключено, объявления в родительских предложениях WITH будут рассматриваться так, как если бы они были сделаны в текущей области видимости.

Обратите внимание, что это параметр совместимости для нового анализатора, который позволяет выполнять некоторые некорректные запросы, которые старый анализатор мог исполнять.

## enable_shared_storage_snapshot_in_query \{#enable_shared_storage_snapshot_in_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Новая настройка, позволяющая совместно использовать StorageSnapshot в запросе"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "По умолчанию включено совместное использование StorageSnapshot в запросах"}]}]} />

Если настройка включена, все подзапросы в рамках одного запроса будут использовать один и тот же StorageSnapshot для каждой таблицы.
Это обеспечивает согласованное представление данных во всём запросе, даже если к одной и той же таблице обращаются несколько раз.

Это необходимо для запросов, в которых важна внутренняя согласованность частей данных. Пример:

```sql
SELECT
    count()
FROM events
WHERE (_part, _part_offset) IN (
    SELECT _part, _part_offset
    FROM events
    WHERE user_id = 42
)
```

Без этого параметра внешние и внутренние запросы могут работать с разными снимками данных, что приводит к некорректным результатам.

:::note
Включение этого параметра отключает оптимизацию, которая удаляет ненужные части из снимков после завершения этапа планирования.
В результате длительно выполняющиеся запросы могут удерживать устаревшие части на протяжении всего времени выполнения, что задерживает очистку частей и повышает нагрузку на хранилище.

В настоящее время этот параметр применяется только к таблицам семейства MergeTree.
:::

Возможные значения:

* 0 - отключено
* 1 - включено


## enable_sharing_sets_for_mutations \\{#enable_sharing_sets_for_mutations\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает совместное использование объектов Set, создаваемых для подзапросов с IN, между разными задачами одной и той же мутации. Это снижает потребление памяти и нагрузку на ЦП.

## enable_software_prefetch_in_aggregation \\{#enable_software_prefetch_in_aggregation\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает использование программной предварительной выборки (software prefetch) при агрегации

## enable_time_time64_type \\{#enable_time_time64_type\\}

**Псевдонимы**: `allow_experimental_time_time64_type`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Новый параметр. Позволяет использовать экспериментальные типы данных Time и Time64."}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "Включает типы Time и Time64 по умолчанию"}]}]}/>

Позволяет создавать типы данных [Time](../../sql-reference/data-types/time.md) и [Time64](../../sql-reference/data-types/time64.md).

## enable_unaligned_array_join \\{#enable_unaligned_array_join\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает выполнять ARRAY JOIN с несколькими массивами разного размера. Когда эта настройка включена, массивы будут приведены к длине самого длинного.

## enable_url_encoding \\{#enable_url_encoding\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Изменено значение по умолчанию существующего параметра"}]}]}/>

Включает или отключает кодирование и декодирование пути в URI в таблицах с движком [URL](../../engines/table-engines/special/url.md).

По умолчанию параметр отключен.

## enable_vertical_final \\{#enable_vertical_final\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Вертикальный FINAL снова включён по умолчанию после исправления ошибки"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "Вертикальный FINAL используется по умолчанию"}]}]}/>

Если включено, удалять дублирующиеся строки во время выполнения FINAL, помечая строки как удалённые и фильтруя их позже вместо объединения строк

## enable_writes_to_query_cache \\{#enable_writes_to_query_cache\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включён, результаты запросов `SELECT` сохраняются в [кэше запросов](../query-cache.md).

Возможные значения:

- 0 — отключено
- 1 — включено

## enforce_strict_identifier_format \\{#enforce_strict_identifier_format\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "New setting."}]}]}/>

Если параметр включён, разрешаются только идентификаторы, состоящие из буквенно-цифровых символов и символов подчёркивания.

## engine_file_allow_create_multiple_files \\{#engine_file_allow_create_multiple_files\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает создание нового файла при каждой вставке в таблицы движка `File`, если формат имеет суффикс (`JSON`, `ORC`, `Parquet` и т. д.). Если параметр включен, при каждой вставке будет создаваться новый файл с именем по следующему шаблону:

`data.Parquet` -> `data.1.Parquet` -> `data.2.Parquet` и т. д.

Возможные значения:

- 0 — запрос `INSERT` дописывает новые данные в конец файла.
- 1 — запрос `INSERT` создает новый файл.

## engine_file_empty_if_not_exists \\{#engine_file_empty_if_not_exists\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет выбирать данные из таблицы с движком File при отсутствии файла.

Возможные значения:

- 0 — `SELECT` выбрасывает исключение.
- 1 — `SELECT` возвращает пустой результат.

## engine_file_skip_empty_files \\{#engine_file_skip_empty_files\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает пропуск пустых файлов в таблицах с движком [File](../../engines/table-engines/special/file.md).

Возможные значения:

- 0 — `SELECT` выбрасывает исключение, если пустой файл не совместим с запрошенным форматом.
- 1 — `SELECT` возвращает пустой результат для пустого файла.

## engine_file_truncate_on_insert \\{#engine_file_truncate_on_insert\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает обрезку (truncate) файла перед вставкой в таблицах движка [File](../../engines/table-engines/special/file.md).

Возможные значения:

- 0 — запрос `INSERT` дописывает новые данные в конец файла.
- 1 — запрос `INSERT` заменяет существующее содержимое файла новыми данными.

## engine_url_skip_empty_files \\{#engine_url_skip_empty_files\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает пропуск пустых файлов в таблицах движка [URL](../../engines/table-engines/special/url.md).

Возможные значения:

- 0 — `SELECT` генерирует исключение, если пустой файл не совместим с запрошенным форматом.
- 1 — `SELECT` возвращает пустой результат для пустого файла.

## exact_rows_before_limit \\{#exact_rows_before_limit\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Когда параметр включён, ClickHouse будет возвращать точное значение статистики rows_before_limit_at_least, но при этом данные до достижения лимита придётся полностью прочитать

## except_default_mode \\{#except_default_mode\\}

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

Устанавливает режим по умолчанию для запросов EXCEPT. Возможные значения: пустая строка, 'ALL', 'DISTINCT'. Если задана пустая строка, запрос без указания режима завершится с исключением.

## exclude_materialize_skip_indexes_on_insert \{#exclude_materialize_skip_indexes_on_insert\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "Новая настройка."}]}]} />

Исключает указанные пропускающие индексы из процесса их построения и сохранения во время операций INSERT. Исключённые пропускающие индексы по‑прежнему будут строиться и сохраняться [во время слияний](merge-tree-settings.md/#materialize_skip_indexes_on_merge) или явным запросом
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index).

Не оказывает никакого эффекта, если [materialize&#95;skip&#95;indexes&#95;on&#95;insert](#materialize_skip_indexes_on_insert) имеет значение false.

Пример:

```sql
CREATE TABLE tab
(
    a UInt64,
    b UInt64,
    INDEX idx_a a TYPE minmax,
    INDEX idx_b b TYPE set(3)
)
ENGINE = MergeTree ORDER BY tuple();

SET exclude_materialize_skip_indexes_on_insert='idx_a'; -- idx_a will be not be updated upon insert
--SET exclude_materialize_skip_indexes_on_insert='idx_a, idx_b'; -- neither index would be updated on insert

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- only idx_b is updated

-- since it is a session setting it can be set on a per-query level
INSERT INTO tab SELECT number, number / 50 FROM numbers(100, 100) SETTINGS exclude_materialize_skip_indexes_on_insert='idx_b';

ALTER TABLE tab MATERIALIZE INDEX idx_a; -- this query can be used to explicitly materialize the index

SET exclude_materialize_skip_indexes_on_insert = DEFAULT; -- reset setting to default
```


## execute_exists_as_scalar_subquery \\{#execute_exists_as_scalar_subquery\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

Выполняет некоррелированные подзапросы EXISTS как скалярные подзапросы. Аналогично скалярным подзапросам, используется кэш, а к результату применяется свёртка констант.

## external_storage_connect_timeout_sec \\{#external_storage_connect_timeout_sec\\}

<SettingsInfoBlock type="UInt64" default_value="10" />

Таймаут подключения в секундах. В настоящее время поддерживается только для MySQL.

## external_storage_max_read_bytes \\{#external_storage_max_read_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает максимальный объём данных в байтах, при достижении которого таблица с внешним движком должна сбрасывать исторические данные. В настоящее время поддерживается только для движка таблиц MySQL, движка базы данных и словаря. Если равно 0, эта настройка отключена.

## external_storage_max_read_rows \\{#external_storage_max_read_rows\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает максимальное количество строк, при достижении которого таблица с внешним движком должна сбросить исторические данные. В настоящее время поддерживается только для движка таблицы MySQL, движка базы данных и словаря. При значении 0 этот параметр отключён.

## external_storage_rw_timeout_sec \\{#external_storage_rw_timeout_sec\\}

<SettingsInfoBlock type="UInt64" default_value="300" />

Таймаут операций чтения и записи, в секундах. На данный момент поддерживается только для MySQL.

## external_table_functions_use_nulls \\{#external_table_functions_use_nulls\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет, как табличные функции [mysql](../../sql-reference/table-functions/mysql.md), [postgresql](../../sql-reference/table-functions/postgresql.md) и [odbc](../../sql-reference/table-functions/odbc.md) используют столбцы типа Nullable.

Возможные значения:

- 0 — табличная функция явно использует столбцы типа Nullable.
- 1 — табличная функция неявно использует столбцы типа Nullable.

**Использование**

Если значение настройки равно `0`, табличная функция не делает столбцы типа Nullable и вставляет значения по умолчанию вместо NULL. Это также применимо к значениям NULL внутри массивов.

## external_table_strict_query \\{#external_table_strict_query\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение true, запрещается преобразовывать выражения в локальный фильтр для запросов к внешним таблицам.

## extract_key_value_pairs_max_pairs_per_row \\{#extract_key_value_pairs_max_pairs_per_row\\}

**Псевдонимы**: `extract_kvp_max_pairs_per_row`

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "Максимальное количество пар, которое может быть получено функцией `extractKeyValuePairs`. Используется как защита от чрезмерного потребления памяти."}]}]}/>

Максимальное количество пар, которое может быть получено функцией `extractKeyValuePairs`. Используется как защита от чрезмерного потребления памяти.

## extremes \\{#extremes\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, нужно ли учитывать экстремальные значения (минимумы и максимумы в столбцах результата запроса). Принимает значения 0 или 1. По умолчанию — 0 (отключено).
Дополнительные сведения см. в разделе «Экстремальные значения».

## fallback_to_stale_replicas_for_distributed_queries \\{#fallback_to_stale_replicas_for_distributed_queries\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Принудительно отправляет запрос на устаревшую реплику, если актуальные данные недоступны. См. [Replication](../../engines/table-engines/mergetree-family/replication.md).

ClickHouse выбирает наиболее актуальную среди устаревших реплик таблицы.

Используется при выполнении запроса `SELECT` из distributed таблицы, которая ссылается на реплицируемые таблицы.

По умолчанию — 1 (включено).

## filesystem_cache_allow_background_download \\{#filesystem_cache_allow_background_download\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Новая настройка для управления фоновыми загрузками в файловом кеше для каждого запроса."}]}]}/>

Разрешает файловому кешу ставить в очередь фоновые загрузки данных, читаемых из удалённого хранилища. Отключите, чтобы выполнять загрузки в основном потоке для текущего запроса/сессии.

## filesystem_cache_boundary_alignment \\{#filesystem_cache_boundary_alignment\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Выравнивание границ файлового кэша. Этот параметр применяется только для чтения, не выполняемого напрямую с диска (например, для кэша удалённых движков таблиц / табличных функций, но не для конфигурации хранилища таблиц MergeTree). Значение 0 означает отсутствие выравнивания.

## filesystem_cache_enable_background_download_during_fetch \\{#filesystem_cache_enable_background_download_during_fetch\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Время ожидания при блокировке кэша для резервирования места в кэше файловой системы

## filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage \\{#filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

Оказывает действие только в ClickHouse Cloud. Время ожидания при захвате блокировки кэша для резервирования пространства в файловом кэше

## filesystem_cache_max_download_size \\{#filesystem_cache_max_download_size\\}

<SettingsInfoBlock type="UInt64" default_value="137438953472" />

Максимальный объём данных в кэше удалённой файловой системы, который может быть загружен одним запросом

## filesystem_cache_name \\{#filesystem_cache_name\\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": ""},{"label": "Имя кэша файловой системы, используемое для табличных движков без состояния или озёр данных"}]}]}/>

Имя кэша файловой системы, используемое для табличных движков без состояния или озёр данных

## filesystem_cache_prefer_bigger_buffer_size \\{#filesystem_cache_prefer_bigger_buffer_size\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

При включенном кэше файловой системы использовать больший размер буфера, чтобы избежать записи небольших сегментов файла, ухудшающих производительность кэша. С другой стороны, включение этого параметра может увеличить потребление памяти.

## filesystem_cache_reserve_space_wait_lock_timeout_milliseconds \\{#filesystem_cache_reserve_space_wait_lock_timeout_milliseconds\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "Время ожидания при блокировке кэша для резервирования места в файловом кэше"}]}]}/>

Время ожидания при блокировке кэша для резервирования места в файловом кэше

## filesystem_cache_segments_batch_size \\{#filesystem_cache_segments_batch_size\\}

<SettingsInfoBlock type="UInt64" default_value="20" />

Ограничение на размер одного пакета файловых сегментов, которые буфер чтения может запрашивать из кэша. Слишком маленькое значение приведёт к избыточному числу запросов к кэшу, слишком большое — может замедлить вытеснение данных из кэша.

## filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit \\{#filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit\\}

**Псевдонимы**: `skip_download_if_exceeds_query_cache`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "Rename of setting skip_download_if_exceeds_query_cache_limit"}]}]}/>

Пропускать загрузку из удалённой файловой системы, если её размер превышает размер кэша запросов

## filesystem_prefetch_max_memory_usage \\{#filesystem_prefetch_max_memory_usage\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

Максимальный объём памяти, используемый для предварительной выборки.

## filesystem_prefetch_step_bytes \\{#filesystem_prefetch_step_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Шаг предварительной выборки в байтах. Ноль означает `auto` — примерно наилучший шаг предварительной выборки будет определён автоматически, но может быть не на 100% оптимальным. Фактическое значение может отличаться из‑за параметра filesystem_prefetch_min_bytes_for_single_read_task.

## filesystem_prefetch_step_marks \\{#filesystem_prefetch_step_marks\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Шаг предвыборки в метках. Ноль означает `auto` — примерно оптимальный шаг предвыборки будет определён автоматически, но может быть не на 100% оптимальным. Фактическое значение может отличаться из‑за настройки filesystem_prefetch_min_bytes_for_single_read_task.

## filesystem_prefetches_limit \\{#filesystem_prefetches_limit\\}

<SettingsInfoBlock type="UInt64" default_value="200" />

Максимальное число операций предварительного чтения. Ноль означает отсутствие ограничения. Если вы хотите ограничить количество таких операций, рекомендуется использовать параметр `filesystem_prefetches_max_memory_usage`.

## final \{#final\}

<SettingsInfoBlock type="Bool" default_value="0" />

Автоматически применяет модификатор [FINAL](../../sql-reference/statements/select/from.md/#final-modifier) ко всем таблицам в запросе, для которых он применим, включая таблицы, участвующие в JOIN, таблицы в подзапросах, а также [FINAL](../../sql-reference/statements/select/from.md/#final-modifier)-совместимые распределённые таблицы.

Возможные значения:

* 0 - отключено
* 1 - включено

Пример:

```sql
CREATE TABLE test
(
    key Int64,
    some String
)
ENGINE = ReplacingMergeTree
ORDER BY key;

INSERT INTO test FORMAT Values (1, 'first');
INSERT INTO test FORMAT Values (1, 'second');

SELECT * FROM test;
┌─key─┬─some───┐
│   1 │ second │
└─────┴────────┘
┌─key─┬─some──┐
│   1 │ first │
└─────┴───────┘

SELECT * FROM test SETTINGS final = 1;
┌─key─┬─some───┐
│   1 │ second │
└─────┴────────┘

SET final = 1;
SELECT * FROM test;
┌─key─┬─some───┐
│   1 │ second │
└─────┴────────┘
```


## flatten_nested \{#flatten_nested\}

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет формат данных [nested](../../sql-reference/data-types/nested-data-structures/index.md) столбцов.

Возможные значения:

* 1 — столбец типа Nested разворачивается в отдельные массивы.
* 0 — столбец типа Nested остается единым массивом кортежей.

**Использование**

Если параметр установлен в `0`, можно использовать произвольную глубину вложенности.

**Примеры**

Запрос:

```sql
SET flatten_nested = 1;
CREATE TABLE t_nest (`n` Nested(a UInt32, b UInt32)) ENGINE = MergeTree ORDER BY tuple();

SHOW CREATE TABLE t_nest;
```

Результат:

```text
┌─statement───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE default.t_nest
(
    `n.a` Array(UInt32),
    `n.b` Array(UInt32)
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS index_granularity = 8192 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Запрос:

```sql
SET flatten_nested = 0;

CREATE TABLE t_nest (`n` Nested(a UInt32, b UInt32)) ENGINE = MergeTree ORDER BY tuple();

SHOW CREATE TABLE t_nest;
```

Результат:

```text
┌─statement──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE default.t_nest
(
    `n` Nested(a UInt32, b UInt32)
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS index_granularity = 8192 │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


## force_aggregate_partitions_independently \\{#force_aggregate_partitions_independently\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Принудительно включает оптимизацию, когда она применима, даже если эвристика решила её не использовать

## force_aggregation_in_order \\{#force_aggregation_in_order\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Этот параметр используется сервером для поддержки распределённых запросов. Не изменяйте его вручную, так как это может нарушить нормальную работу. (Задаёт принудительное использование агрегации по порядку на удалённых узлах при распределённой агрегации).

## force_data_skipping_indices \{#force_data_skipping_indices\}

Отключает выполнение запроса, если указанные индексы пропуска данных не были задействованы.

Рассмотрим следующий пример:

```sql
CREATE TABLE data
(
    key Int,
    d1 Int,
    d1_null Nullable(Int),
    INDEX d1_idx d1 TYPE minmax GRANULARITY 1,
    INDEX d1_null_idx assumeNotNull(d1_null) TYPE minmax GRANULARITY 1
)
Engine=MergeTree()
ORDER BY key;

SELECT * FROM data_01515;
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices=''; -- query will produce CANNOT_PARSE_TEXT error.
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices='d1_idx'; -- query will produce INDEX_NOT_USED error.
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='d1_idx'; -- Ok.
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='`d1_idx`'; -- Ok (example of full featured parser).
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='`d1_idx`, d1_null_idx'; -- query will produce INDEX_NOT_USED error, since d1_null_idx is not used.
SELECT * FROM data_01515 WHERE d1 = 0 AND assumeNotNull(d1_null) = 0 SETTINGS force_data_skipping_indices='`d1_idx`, d1_null_idx'; -- Ok.
```


## force_grouping_standard_compatibility \\{#force_grouping_standard_compatibility\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.9"},{"label": "1"},{"label": "Make GROUPING function output the same as in SQL standard and other DBMS"}]}]}/>

Настраивает функцию GROUPING так, чтобы она возвращала 1, когда аргумент не используется как ключ агрегации

## force_index_by_date \\{#force_index_by_date\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Отключает выполнение запроса, если нельзя использовать индекс по дате.

Работает с таблицами из семейства MergeTree.

Если `force_index_by_date=1`, ClickHouse проверяет, содержит ли запрос условие по дате, которое может быть использовано для ограничения диапазонов данных. Если подходящего условия нет, генерируется исключение. Однако не проверяется, уменьшает ли это условие объём данных для чтения. Например, условие `Date != ' 2000-01-01 '` считается допустимым, даже если оно соответствует всем данным в таблице (то есть для выполнения запроса требуется полное сканирование). Для получения дополнительной информации о диапазонах данных в таблицах MergeTree см. раздел [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

## force_optimize_projection \\{#force_optimize_projection\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает обязательное использование [проекций](../../engines/table-engines/mergetree-family/mergetree.md/#projections) в запросах `SELECT`, когда включена оптимизация с использованием проекций (см. настройку [optimize_use_projections](#optimize_use_projections)).

Возможные значения:

- 0 — Оптимизация с использованием проекций не обязательна.
- 1 — Оптимизация с использованием проекций обязательна.

## force_optimize_projection_name \\{#force_optimize_projection_name\\}

Если параметр установлен в непустую строку, проверяется, что указанная PROJECTION используется в запросе хотя бы один раз.

Возможные значения:

- string: имя PROJECTION, используемой в запросе

## force_optimize_skip_unused_shards \\{#force_optimize_skip_unused_shards\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Включает или отключает выполнение запроса, если [optimize_skip_unused_shards](#optimize_skip_unused_shards) включён, но пропуск неиспользуемых сегментов невозможен. Если пропуск невозможен и параметр включён, будет сгенерировано исключение.

Возможные значения:

- 0 — Отключено. ClickHouse не генерирует исключение.
- 1 — Включено. Выполнение запроса запрещается только в том случае, если у таблицы есть ключ шардинга.
- 2 — Включено. Выполнение запроса запрещается независимо от того, определён ли для таблицы ключ шардинга.

## force_optimize_skip_unused_shards_nesting \\{#force_optimize_skip_unused_shards_nesting\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Определяет работу [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards) (и, соответственно, по‑прежнему требует включённого [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards)) в зависимости от уровня вложенности распределённого запроса (когда у вас есть таблица `Distributed`, которая обращается к другой таблице `Distributed`).

Возможные значения:

- 0 — Отключено, `force_optimize_skip_unused_shards` работает для всех уровней вложенности.
- 1 — Включает `force_optimize_skip_unused_shards` только для первого уровня.
- 2 — Включает `force_optimize_skip_unused_shards` до второго уровня включительно.

## force_primary_key \\{#force_primary_key\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Отключает выполнение запроса, если невозможно использовать индексацию по первичному ключу.

Работает с таблицами семейства MergeTree.

Если `force_primary_key=1`, ClickHouse проверяет, есть ли в запросе условие по первичному ключу, которое может быть использовано для ограничения диапазонов данных. Если подходящего условия нет, выбрасывается исключение. Однако не проверяется, уменьшает ли это условие объем данных для чтения. Дополнительные сведения о диапазонах данных в таблицах MergeTree см. в разделе [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

## force_remove_data_recursively_on_drop \\{#force_remove_data_recursively_on_drop\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Рекурсивно удаляет данные в запросе DROP. Позволяет избежать ошибки "Directory not empty", но может без предупреждения удалить отсоединённые данные

## formatdatetime_e_with_space_padding \\{#formatdatetime_e_with_space_padding\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Improved compatibility with MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

Форматтер '%e' в функции 'formatDateTime' выводит дни месяца, записанные одной цифрой, с ведущим пробелом, например ' 2' вместо '2'.

## formatdatetime_f_prints_scale_number_of_digits \\{#formatdatetime_f_prints_scale_number_of_digits\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting."}]}]}/>

Форматтер '%f' в функции 'formatDateTime' выводит количество цифр, соответствующее масштабу (scale) для DateTime64, вместо фиксированных 6 цифр.

## formatdatetime_f_prints_single_zero \\{#formatdatetime_f_prints_single_zero\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "Улучшена совместимость с MySQL DATE_FORMAT()/STR_TO_DATE()"}]}]}/>

Форматный спецификатор '%f' в функции 'formatDateTime' выводит один ноль вместо шести нулей, если форматируемое значение не содержит дробных секунд.

## formatdatetime_format_without_leading_zeros \\{#formatdatetime_format_without_leading_zeros\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Спецификаторы формата '%c', '%l' и '%k' в функции formatDateTime выводят месяцы и часы без ведущих нулей.

## formatdatetime_parsedatetime_m_is_month_name \\{#formatdatetime_parsedatetime_m_is_month_name\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1"},{"label": "Улучшена совместимость с MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

Спецификатор формата '%M' в функциях 'formatDateTime' и 'parseDateTime' теперь выводит и парсит название месяца, а не минуты.

## fsync_metadata \\{#fsync_metadata\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает вызов [fsync](http://pubs.opengroup.org/onlinepubs/9699919799/functions/fsync.html) при записи `.sql`-файлов. По умолчанию включено.

Имеет смысл отключить эту настройку, если на сервере есть миллионы очень маленьких таблиц, которые постоянно создаются и удаляются.

## function_date_trunc_return_type_behavior \\{#function_date_trunc_return_type_behavior\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "Добавлена новая настройка для сохранения прежнего поведения функции dateTrunc"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "Изменён тип результата для функции dateTrunc для аргументов DateTime64/Date32 на DateTime64/Date32 вне зависимости от временной единицы для получения корректного результата для отрицательных значений"}]}]}/>

Позволяет изменить поведение типа возвращаемого значения функции `dateTrunc`.

Возможные значения:

- 0 — Когда вторым аргументом является `DateTime64/Date32`, тип результата будет `DateTime64/Date32` независимо от временной единицы в первом аргументе.
- 1 — Для `Date32` результатом всегда является `Date`. Для `DateTime64` результатом является `DateTime` для временных единиц `second` и выше.

## function_implementation \\{#function_implementation\\}

Выберите реализацию функции для конкретной цели или варианта (экспериментально). Если не задано, включаются все реализации.

## function_json_value_return_type_allow_complex \{#function_json_value_return_type_allow_complex\}

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет тем, разрешено ли функции json&#95;value возвращать сложные типы данных (такие как struct, array, map).

```sql
SELECT JSON_VALUE('{"hello":{"world":"!"}}', '$.hello') settings function_json_value_return_type_allow_complex=true

┌─JSON_VALUE('{"hello":{"world":"!"}}', '$.hello')─┐
│ {"world":"!"}                                    │
└──────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Возможные значения:

* true — разрешить.
* false — запретить.


## function_json_value_return_type_allow_nullable \{#function_json_value_return_type_allow_nullable\}

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет тем, допускается ли возвращать `NULL`, если запрашиваемое значение отсутствует для функции JSON&#95;VALUE.

```sql
SELECT JSON_VALUE('{"hello":"world"}', '$.b') settings function_json_value_return_type_allow_nullable=true;

┌─JSON_VALUE('{"hello":"world"}', '$.b')─┐
│ ᴺᵁᴸᴸ                                   │
└────────────────────────────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

Возможные значения:

* true — разрешить.
* false — запретить.


## function_locate_has_mysql_compatible_argument_order \\{#function_locate_has_mysql_compatible_argument_order\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Повышена совместимость с функцией locate в MySQL."}]}]}/>

Определяет порядок аргументов в функции [locate](../../sql-reference/functions/string-search-functions.md/#locate).

Возможные значения:

- 0 — функция `locate` принимает аргументы `(haystack, needle[, start_pos])`.
- 1 — функция `locate` принимает аргументы `(needle, haystack, [, start_pos])` (поведение, совместимое с MySQL).

## function_range_max_elements_in_block \\{#function_range_max_elements_in_block\\}

<SettingsInfoBlock type="UInt64" default_value="500000000" />

Устанавливает безопасный порог по объёму данных, генерируемых функцией [range](/sql-reference/functions/array-functions#range). Определяет максимальное количество значений, генерируемых функцией для блока данных (сумма размеров массивов по каждой строке в блоке).

Возможные значения:

- Положительное целое число.

**См. также**

- [`max_block_size`](#max_block_size)
- [`min_insert_block_size_rows`](#min_insert_block_size_rows)

## function_sleep_max_microseconds_per_block \\{#function_sleep_max_microseconds_per_block\\}

<SettingsInfoBlock type="UInt64" default_value="3000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.7"},{"label": "3000000"},{"label": "В предыдущих версиях максимальное время задержки 3 секунды применялось только для функции `sleep`, но не для `sleepEachRow`. В новой версии мы вводим эту настройку. Если вы включите совместимость с предыдущими версиями, это ограничение будет полностью отключено."}]}]}/>

Максимальное количество микросекунд, в течение которых функция `sleep` может приостанавливать выполнение для каждого блока. Если пользователь вызывает её с большим значением, выбрасывается исключение. Это защитный порог.

## function_visible_width_behavior \\{#function_visible_width_behavior\\}

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "Мы изменили поведение по умолчанию `visibleWidth`, сделав его более точным"}]}]}/>

Версия поведения `visibleWidth`. 0 — считать только количество кодовых точек; 1 — корректно учитывать символы нулевой ширины и комбинируемые символы, считать символы полной ширины за два, оценивать ширину табуляции, учитывать символы удаления.

## geo_distance_returns_float64_on_float64_arguments \\{#geo_distance_returns_float64_on_float64_arguments\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Увеличение точности по умолчанию."}]}]}/>

Если все четыре аргумента функций `geoDistance`, `greatCircleDistance` и `greatCircleAngle` имеют тип Float64, эти функции возвращают значение типа Float64, а для внутренних вычислений используется двойная точность. В предыдущих версиях ClickHouse эти функции всегда возвращали Float32.

## geotoh3_argument_order \\{#geotoh3_argument_order\\}

<BetaBadge/>

<SettingsInfoBlock type="GeoToH3ArgumentOrder" default_value="lat_lon" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "lat_lon"},{"label": "Новая настройка для унаследованного поведения, определяющая порядок аргументов lon и lat"}]}]}/>

Функция `geoToH3` принимает аргументы в порядке (lon, lat), если задано значение `lon_lat`, и в порядке (lat, lon), если задано значение `lat_lon`.

## glob_expansion_max_elements \\{#glob_expansion_max_elements\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальное допустимое количество адресов (для внешних хранилищ, табличных функций и т. д.).

## grace_hash_join_initial_buckets \\{#grace_hash_join_initial_buckets\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1" />

Начальное количество бакетов grace hash join

## grace_hash_join_max_buckets \\{#grace_hash_join_max_buckets\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

Ограничение на максимальное количество бакетов в grace hash join

## group_by_overflow_mode \\{#group_by_overflow_mode\\}

<SettingsInfoBlock type="OverflowModeGroupBy" default_value="throw" />

Определяет, что происходит, когда количество уникальных ключей для агрегации превышает лимит:

- `throw`: сгенерировать исключение
- `break`: прекратить выполнение запроса и вернуть частичный результат
- `any`: продолжать агрегацию для ключей, которые уже попали во множество, но не добавлять в него новые ключи.

Использование значения `any` позволяет выполнять приближённый вариант GROUP BY. Качество
такого приближения зависит от статистических свойств данных.

## group_by_two_level_threshold \\{#group_by_two_level_threshold\\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

Начиная с какого количества ключей запускается двухуровневая агрегация. 0 — порог не установлен.

## group_by_two_level_threshold_bytes \\{#group_by_two_level_threshold_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="50000000" />

Размер агрегатного состояния в байтах, при достижении которого используется двухуровневая агрегация. 0 — порог не установлен. Двухуровневая агрегация используется, когда срабатывает хотя бы один из порогов.

## group_by_use_nulls \\{#group_by_use_nulls\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Изменяет способ, которым [предложение GROUP BY](/sql-reference/statements/select/group-by) обрабатывает типы ключей агрегации.
Когда используются спецификаторы `ROLLUP`, `CUBE` или `GROUPING SETS`, некоторые ключи агрегации могут не использоваться при формировании некоторых строк результата.
Столбцы для этих ключей заполняются либо значением по умолчанию, либо `NULL` в соответствующих строках в зависимости от этой настройки.

Возможные значения:

- 0 — Для формирования отсутствующих значений используется значение по умолчанию для типа ключа агрегации.
- 1 — ClickHouse выполняет `GROUP BY` так же, как указано в стандарте SQL. Типы ключей агрегации преобразуются в [Nullable](/sql-reference/data-types/nullable). Столбцы для соответствующих ключей агрегации заполняются [NULL](/sql-reference/syntax#null) для строк, в которых соответствующие ключи не использовались.

См. также:

- [Предложение GROUP BY](/sql-reference/statements/select/group-by)

## h3togeo_lon_lat_result_order \\{#h3togeo_lon_lat_result_order\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Функция 'h3ToGeo' возвращает (lon, lat), если значение равно true, в противном случае — (lat, lon).

## handshake_timeout_ms \\{#handshake_timeout_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

Таймаут в миллисекундах на получение пакета Hello от реплик при установлении соединения.

## hdfs_create_new_file_on_insert \\{#hdfs_create_new_file_on_insert\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает создание нового файла при каждой вставке в таблицы движка HDFS. Если включено, при каждой вставке будет создаваться новый файл HDFS с именем по следующему шаблону:

изначально: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` и т.д.

Возможные значения:

- 0 — запрос `INSERT` добавляет новые данные в конец файла.
- 1 — запрос `INSERT` создает новый файл.

## hdfs_ignore_file_doesnt_exist \\{#hdfs_ignore_file_doesnt_exist\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Позволяет возвращать 0 строк, когда запрашиваемые файлы отсутствуют, вместо генерации исключения в движке таблиц HDFS"}]}]}/>

Игнорирует отсутствие файла, если он не существует при чтении по определённым ключам.

Возможные значения:

- 1 — `SELECT` возвращает пустой результат.
- 0 — `SELECT` генерирует исключение.

## hdfs_replication \\{#hdfs_replication\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Фактическое количество реплик можно указать при создании файла HDFS.

## hdfs_skip_empty_files \\{#hdfs_skip_empty_files\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает пропуск пустых файлов в таблицах движка [HDFS](../../engines/table-engines/integrations/hdfs.md).

Возможные значения:

- 0 — `SELECT` выбрасывает исключение, если пустой файл не соответствует запрошенному формату.
- 1 — `SELECT` возвращает пустой результат для пустого файла.

## hdfs_throw_on_zero_files_match \\{#hdfs_throw_on_zero_files_match\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Разрешает генерировать ошибку, когда запрос ListObjects не находит ни одного файла в движке HDFS, вместо возврата пустого результата запроса"}]}]}/>

Генерирует ошибку, если по правилам расширения glob не найден ни один файл.

Возможные значения:

- 1 — `SELECT` генерирует исключение.
- 0 — `SELECT` возвращает пустой результат.

## hdfs_truncate_on_insert \\{#hdfs_truncate_on_insert\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает очистку файла перед вставкой в таблицы с движком HDFS. Если параметр отключен, при попытке вставки будет сгенерировано исключение, если файл в HDFS уже существует.

Возможные значения:

- 0 — запрос `INSERT` дописывает новые данные в конец файла.
- 1 — запрос `INSERT` заменяет существующее содержимое файла новыми данными.

## hedged_connection_timeout_ms \\{#hedged_connection_timeout_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "50"},{"label": "Начинать новое соединение в hedged-запросах через 50 мс вместо 100, чтобы соответствовать прежнему таймауту подключения"}]}]}/>

Таймаут при установлении соединения с репликой для hedged-запросов

## hnsw_candidate_list_size_for_search \\{#hnsw_candidate_list_size_for_search\\}

<SettingsInfoBlock type="UInt64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "256"},{"label": "Новая настройка. Ранее значение при необходимости указывалось в CREATE INDEX, по умолчанию — 64."}]}]}/>

Размер динамического списка кандидатов при поиске по индексу векторного сходства, также называемого `ef_search`.

## hsts_max_age \\{#hsts_max_age\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Срок действия HSTS. Значение 0 отключает HSTS.

## http_connection_timeout \\{#http_connection_timeout\\}

<SettingsInfoBlock type="Seconds" default_value="1" />

Таймаут HTTP‑подключения (в секундах).

Возможные значения:

- Любое положительное целое число.
- 0 — отключено (бесконечный таймаут).

## http_headers_progress_interval_ms \\{#http_headers_progress_interval_ms\\}

<SettingsInfoBlock type="UInt64" default_value="100" />

Не отправлять HTTP-заголовки X-ClickHouse-Progress чаще, чем один раз за указанный интервал.

## http_make_head_request \\{#http_make_head_request\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Настройка `http_make_head_request` позволяет выполнять запрос `HEAD` при чтении данных по HTTP, чтобы получить сведения о считываемом файле, например его размер. Поскольку она включена по умолчанию, может потребоваться отключить эту настройку, если сервер не поддерживает запросы `HEAD`.

## http_max_field_name_size \\{#http_max_field_name_size\\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

Максимальная длина имени поля в HTTP-заголовке

## http_max_field_value_size \\{#http_max_field_value_size\\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

Максимальная длина значения поля заголовка HTTP

## http_max_fields \\{#http_max_fields\\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

Максимальное количество полей в HTTP-заголовке

## http_max_multipart_form_data_size \\{#http_max_multipart_form_data_size\\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Ограничение на размер содержимого multipart/form-data. Значение этого параметра не может быть получено из параметров URL и должно быть задано в пользовательском профиле. Обратите внимание, что содержимое разбирается, а внешние таблицы создаются в памяти до начала выполнения запроса. Это единственное ограничение, которое действует на этой стадии (ограничения на максимальное использование памяти и максимальное время выполнения не влияют на чтение данных формы HTTP).

## http_max_request_param_data_size \\{#http_max_request_param_data_size\\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

Ограничение размера данных запроса, используемых в параметре запроса в предопределённых HTTP‑запросах.

## http_max_tries \\{#http_max_tries\\}

<SettingsInfoBlock type="UInt64" default_value="10" />

Максимальное количество попыток чтения через HTTP.

## http_max_uri_size \\{#http_max_uri_size\\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Устанавливает максимальную длину URI в HTTP-запросе.

Возможные значения:

- Положительное целое число.

## http_native_compression_disable_checksumming_on_decompress \\{#http_native_compression_disable_checksumming_on_decompress\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает проверку контрольной суммы при декомпрессии данных HTTP POST-запроса от клиента. Используется только для нативного формата сжатия ClickHouse (не используется с `gzip` или `deflate`).

Подробнее см. [описание HTTP-интерфейса](/interfaces/http).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## http_receive_timeout \\{#http_receive_timeout\\}

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "See http_send_timeout."}]}]}/>

Таймаут получения данных по HTTP (в секундах).

Возможные значения:

- Любое положительное целое число.
- 0 — отключено (бесконечный таймаут).

## http_response_buffer_size \\{#http_response_buffer_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Объём данных в байтах, который буферизуется в памяти сервера перед отправкой HTTP-ответа клиенту или записью на диск (когда включён `http_wait_end_of_query`).

## http_response_headers \\{#http_response_headers\\}

<SettingsInfoBlock type="Map" default_value="{}" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": ""},{"label": "Новый параметр."}]}]}/>

Позволяет добавлять или переопределять HTTP-заголовки, которые сервер будет возвращать в ответе при успешном результате запроса.
Параметр влияет только на HTTP-интерфейс.

Если заголовок уже задан по умолчанию, предоставленное значение его переопределит.
Если заголовок не был задан по умолчанию, он будет добавлен в список заголовков.
Заголовки, которые сервер задаёт по умолчанию и которые не переопределены этим параметром, сохранятся.

Параметр позволяет задать заголовок константным значением. В настоящее время нет способа задать заголовок динамически вычисляемым значением.

Ни имена, ни значения не могут содержать управляющие символы ASCII.

Если вы реализуете UI-приложение, которое позволяет пользователям изменять настройки, но при этом принимает решения на основе возвращаемых заголовков, рекомендуется сделать этот параметр доступным только для чтения.

Пример: `SET http_response_headers = '{"Content-Type": "image/png"}'`

## http_retry_initial_backoff_ms \\{#http_retry_initial_backoff_ms\\}

<SettingsInfoBlock type="UInt64" default_value="100" />

Минимальная длительность ожидания (backoff) в миллисекундах при повторной попытке чтения по HTTP

## http_retry_max_backoff_ms \\{#http_retry_max_backoff_ms\\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальная задержка (backoff) в миллисекундах при повторной попытке чтения по HTTP

## http_send_timeout \\{#http_send_timeout\\}

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "3 минуты кажутся неоправданно долгим временем. Обратите внимание, что это тайм-аут для одной сетевой операции записи, а не для всей операции загрузки."}]}]}/>

Тайм-аут отправки по HTTP (в секундах).

Возможные значения:

- Любое положительное целое число.
- 0 — отключен (бесконечный тайм-аут).

:::note
Применяется только к профилю по умолчанию. Для вступления изменений в силу требуется перезапуск сервера.
:::

## http_skip_not_found_url_for_globs \\{#http_skip_not_found_url_for_globs\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Пропускать URL, соответствующие glob-шаблонам, при ошибке HTTP_NOT_FOUND

## http_wait_end_of_query \\{#http_wait_end_of_query\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает буферизацию HTTP-ответов на стороне сервера.

## http_write_exception_in_output_format \\{#http_write_exception_in_output_format\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Изменено для единообразия форматов"}]}, {"id": "row-2","items": [{"label": "23.9"},{"label": "1"},{"label": "Выводить корректный JSON/XML при возникновении исключения в HTTP‑стриминге."}]}]}/>

Записывает исключение в выходном формате, чтобы обеспечить корректный вывод. Работает с форматами JSON и XML.

## http_zlib_compression_level \\{#http_zlib_compression_level\\}

<SettingsInfoBlock type="Int64" default_value="3" />

Устанавливает уровень сжатия данных в ответе на HTTP‑запрос, если [enable_http_compression = 1](#enable_http_compression).

Возможные значения: числа от 1 до 9.

## iceberg_delete_data_on_drop \\{#iceberg_delete_data_on_drop\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

Удалять ли все файлы Iceberg при выполнении операции DROP.

## iceberg_insert_max_bytes_in_data_file \\{#iceberg_insert_max_bytes_in_data_file\\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "New setting."}]}]}/>

Максимальный размер в байтах Parquet-файла данных Iceberg при выполнении операции INSERT.

## iceberg_insert_max_partitions \\{#iceberg_insert_max_partitions\\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "100"},{"label": "New setting."}]}]}/>

Максимально допустимое количество партиций для одной операции `INSERT` в таблицу с движком Iceberg.

## iceberg_insert_max_rows_in_data_file \\{#iceberg_insert_max_rows_in_data_file\\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "Новая настройка."}]}]}/>

Максимальное число строк в файле данных Iceberg в формате Parquet при выполнении операции INSERT.

## iceberg_metadata_compression_method \\{#iceberg_metadata_compression_method\\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "Новая настройка"}]}]}/>

Метод сжатия файла `.metadata.json`.

## iceberg_metadata_log_level \\{#iceberg_metadata_log_level\\}

<SettingsInfoBlock type="IcebergMetadataLogLevel" default_value="none" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "none"},{"label": "New setting."}]}]}/>

Управляет уровнем логирования метаданных для таблиц Iceberg в журнал system.iceberg_metadata_log.
Обычно этот параметр изменяют в целях отладки.

Возможные значения:

- none - Журнал метаданных отключен.
- metadata - Корневой файл metadata.json.
- manifest_list_metadata - Всё вышеперечисленное + метаданные из avro-списка манифестов, соответствующего снимку.
- manifest_list_entry - Всё вышеперечисленное + записи avro-списка манифестов.
- manifest_file_metadata - Всё вышеперечисленное + метаданные из avro-файлов манифестов, проходящих при обходе.
- manifest_file_entry - Всё вышеперечисленное + записи из avro-файлов манифестов, проходящих при обходе.

## iceberg_snapshot_id \\{#iceberg_snapshot_id\\}

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Выполните запрос к таблице Iceberg с использованием заданного идентификатора snapshot.

## iceberg_timestamp_ms \\{#iceberg_timestamp_ms\\}

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Позволяет выполнять запросы к таблице Iceberg, используя снимок, актуальный на заданный момент времени.

## idle_connection_timeout \\{#idle_connection_timeout\\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

Таймаут для закрытия неактивных TCP-соединений по истечении указанного количества секунд.

Возможные значения:

- Положительное целое число (0 — закрыть немедленно, через 0 секунд).

## ignore_cold_parts_seconds \\{#ignore_cold_parts_seconds\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

Действует только в ClickHouse Cloud. Исключает новые части данных из запросов SELECT до тех пор, пока они не будут либо предварительно разогреты (см. [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch)), либо не достигнут указанного возраста в секундах. Применяется только для Replicated-/SharedMergeTree.

## ignore_data_skipping_indices \{#ignore_data_skipping_indices\}

Игнорирует указанные индексы пропуска данных, если они используются запросом.

Рассмотрим следующий пример:

```sql
CREATE TABLE data
(
    key Int,
    x Int,
    y Int,
    INDEX x_idx x TYPE minmax GRANULARITY 1,
    INDEX y_idx y TYPE minmax GRANULARITY 1,
    INDEX xy_idx (x,y) TYPE minmax GRANULARITY 1
)
Engine=MergeTree()
ORDER BY key;

INSERT INTO data VALUES (1, 2, 3);

SELECT * FROM data;
SELECT * FROM data SETTINGS ignore_data_skipping_indices=''; -- query will produce CANNOT_PARSE_TEXT error.
SELECT * FROM data SETTINGS ignore_data_skipping_indices='x_idx'; -- Ok.
SELECT * FROM data SETTINGS ignore_data_skipping_indices='na_idx'; -- Ok.

SELECT * FROM data WHERE x = 1 AND y = 1 SETTINGS ignore_data_skipping_indices='xy_idx',force_data_skipping_indices='xy_idx' ; -- query will produce INDEX_NOT_USED error, since xy_idx is explicitly ignored.
SELECT * FROM data WHERE x = 1 AND y = 2 SETTINGS ignore_data_skipping_indices='xy_idx';
```

Запрос без игнорирования индексов:

```sql
EXPLAIN indexes = 1 SELECT * FROM data WHERE x = 1 AND y = 2;

Expression ((Projection + Before ORDER BY))
  Filter (WHERE)
    ReadFromMergeTree (default.data)
    Indexes:
      PrimaryKey
        Condition: true
        Parts: 1/1
        Granules: 1/1
      Skip
        Name: x_idx
        Description: minmax GRANULARITY 1
        Parts: 0/1
        Granules: 0/1
      Skip
        Name: y_idx
        Description: minmax GRANULARITY 1
        Parts: 0/0
        Granules: 0/0
      Skip
        Name: xy_idx
        Description: minmax GRANULARITY 1
        Parts: 0/0
        Granules: 0/0
```

Игнорирование индекса `xy_idx`:

```sql
EXPLAIN indexes = 1 SELECT * FROM data WHERE x = 1 AND y = 2 SETTINGS ignore_data_skipping_indices='xy_idx';

Expression ((Projection + Before ORDER BY))
  Filter (WHERE)
    ReadFromMergeTree (default.data)
    Indexes:
      PrimaryKey
        Condition: true
        Parts: 1/1
        Granules: 1/1
      Skip
        Name: x_idx
        Description: minmax GRANULARITY 1
        Parts: 0/1
        Granules: 0/1
      Skip
        Name: y_idx
        Description: minmax GRANULARITY 1
        Parts: 0/0
        Granules: 0/0
```

Работает с таблицами из семейства MergeTree.


## ignore_drop_queries_probability \\{#ignore_drop_queries_probability\\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "Разрешить игнорирование запросов DROP на сервере с заданной вероятностью в тестовых целях"}]}]}/>

Если параметр включен, сервер будет с указанной вероятностью игнорировать все запросы DROP TABLE (для движков Memory и JOIN он заменит DROP на TRUNCATE). Используется для тестирования.

## ignore_materialized_views_with_dropped_target_table \\{#ignore_materialized_views_with_dropped_target_table\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Добавлена новая настройка, позволяющая игнорировать materialized views с удалённой целевой таблицей"}]}]}/>

Игнорировать materialized views с удалённой целевой таблицей при проталкивании данных в представления

## ignore_on_cluster_for_replicated_access_entities_queries \\{#ignore_on_cluster_for_replicated_access_entities_queries\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорирует предложение ON CLUSTER при выполнении запросов управления реплицируемыми объектами доступа.

## ignore_on_cluster_for_replicated_database \\{#ignore_on_cluster_for_replicated_database\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "Добавлена новая настройка для игнорирования оператора ON CLUSTER в DDL-запросах с реплицируемой базой данных."}]}]}/>

Всегда игнорирует оператор ON CLUSTER в DDL-запросах с реплицируемыми базами данных.

## ignore_on_cluster_for_replicated_named_collections_queries \\{#ignore_on_cluster_for_replicated_named_collections_queries\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Игнорирует предложение ON CLUSTER в запросах управления реплицируемыми именованными коллекциями."}]}]}/>

Игнорирует предложение ON CLUSTER в запросах управления реплицируемыми именованными коллекциями.

## ignore_on_cluster_for_replicated_udf_queries \\{#ignore_on_cluster_for_replicated_udf_queries\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать предложение ON CLUSTER для запросов управления реплицируемыми UDF.

## implicit_select \\{#implicit_select\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Новый параметр."}]}]}/>

Разрешает писать простые SELECT‑запросы без начального ключевого слова SELECT, что упрощает использование в режиме калькулятора, например, `1 + 2` становится допустимым запросом.

В `clickhouse-local` этот параметр включён по умолчанию и может быть явно отключён.

## implicit_table_at_top_level \\{#implicit_table_at_top_level\\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "Новая настройка, используемая в clickhouse-local"}]}]}/>

Если значение настройки не пустое, запросы без FROM на верхнем уровне будут считывать данные из этой таблицы вместо system.one.

В clickhouse-local она используется для обработки входных данных.
Настройку можно явно задать пользователем, но она не предназначена для такого использования.

Подзапросы этой настройкой не затрагиваются (ни скалярные, ни подзапросы в секциях FROM или IN).
SELECT на верхнем уровне цепочек UNION, INTERSECT, EXCEPT обрабатываются единообразно и затрагиваются этой настройкой, независимо от их группировки в скобках.
Не определено, как эта настройка влияет на представления и распределённые запросы.

Настройка принимает имя таблицы (в этом случае таблица берётся из текущей базы данных) или полное имя в форме 'database.table'.
И имя базы данных, и имя таблицы должны указываться без кавычек — допускаются только простые идентификаторы.

## implicit_transaction \\{#implicit_transaction\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён и запрос ещё не выполняется в рамках транзакции, запрос автоматически оборачивается в полноценную транзакцию (begin + commit или rollback)

## inject_random_order_for_select_without_order_by \\{#inject_random_order_for_select_without_order_by\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

Если включено, добавляет `ORDER BY rand()` в запросы SELECT без предложения ORDER BY.
Применяется только для уровня вложенности подзапроса = 0. Подзапросы и INSERT INTO ... SELECT не затрагиваются.
Если верхнеуровневая конструкция — UNION, `ORDER BY rand()` добавляется отдельно для всех дочерних частей.
Полезно только для тестирования и разработки (отсутствие ORDER BY является источником недетерминированных результатов запросов).

## insert_allow_materialized_columns \\{#insert_allow_materialized_columns\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если настройка включена, в `INSERT` можно использовать `MATERIALIZED`-столбцы.

## insert_deduplicate \\{#insert_deduplicate\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает дедупликацию блоков при `INSERT` (для таблиц Replicated\*).

Возможные значения:

- 0 — Выключено.
- 1 — Включено.

По умолчанию блоки, вставляемые в реплицируемые таблицы с помощью оператора `INSERT`, дедуплицируются (см. [Data Replication](../../engines/table-engines/mergetree-family/replication.md)).
Для реплицируемых таблиц по умолчанию дедуплицируются только 100 последних блоков для каждой партиции (см. [replicated_deduplication_window](merge-tree-settings.md/#replicated_deduplication_window), [replicated_deduplication_window_seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds)).
Для нереплицируемых таблиц см. [non_replicated_deduplication_window](merge-tree-settings.md/#non_replicated_deduplication_window).

## insert_deduplication_token \{#insert_deduplication_token\}

Настройка позволяет пользователю задать собственную логику дедупликации в MergeTree/ReplicatedMergeTree.
Например, указывая уникальное значение для этой настройки в каждом операторе INSERT,
пользователь может избежать дедупликации одинаковых вставленных данных.

Возможные значения:

* Любая строка

`insert_deduplication_token` используется для дедупликации *только* если значение не пустое.

В реплицируемых таблицах по умолчанию дедуплицируются только 100 самых последних вставок для каждой партиции (см. [replicated&#95;deduplication&#95;window](merge-tree-settings.md/#replicated_deduplication_window), [replicated&#95;deduplication&#95;window&#95;seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds)).
Для нереплицируемых таблиц см. [non&#95;replicated&#95;deduplication&#95;window](merge-tree-settings.md/#non_replicated_deduplication_window).

:::note
`insert_deduplication_token` работает на уровне партиции (так же, как и контрольная сумма `insert_deduplication`). Несколько партиций могут иметь один и тот же `insert_deduplication_token`.
:::

Пример:

```sql
CREATE TABLE test_table
( A Int64 )
ENGINE = MergeTree
ORDER BY A
SETTINGS non_replicated_deduplication_window = 100;

INSERT INTO test_table SETTINGS insert_deduplication_token = 'test' VALUES (1);

-- the next insert won't be deduplicated because insert_deduplication_token is different
INSERT INTO test_table SETTINGS insert_deduplication_token = 'test1' VALUES (1);

-- the next insert will be deduplicated because insert_deduplication_token
-- is the same as one of the previous
INSERT INTO test_table SETTINGS insert_deduplication_token = 'test' VALUES (2);

SELECT * FROM test_table

┌─A─┐
│ 1 │
└───┘
┌─A─┐
│ 1 │
└───┘
```


## insert_keeper_fault_injection_probability \\{#insert_keeper_fault_injection_probability\\}

<SettingsInfoBlock type="Float" default_value="0" />

Приблизительная вероятность возникновения сбоя запроса к Keeper при вставке. Допустимые значения лежат в диапазоне [0.0f, 1.0f].

## insert_keeper_fault_injection_seed \\{#insert_keeper_fault_injection_seed\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

0 — случайное начальное значение генератора случайных чисел, иначе используется значение настройки

## insert_keeper_max_retries \{#insert_keeper_max_retries\}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "20"},{"label": "Включены переподключения к Keeper при INSERT, повышена надежность"}]}]} />

Этот параметр задает максимальное число повторных попыток запросов к ClickHouse Keeper (или ZooKeeper) при вставке в реплицированный MergeTree. Для повторных попыток учитываются только те запросы к Keeper, которые завершились ошибкой из‑за сетевой ошибки, истечения времени сессии Keeper или тайм-аута запроса.

Возможные значения:

* Положительное целое число.
* 0 — повторные попытки отключены.

Значение по умолчанию в Cloud: `20`.

Повторные попытки запросов к Keeper выполняются после некоторой задержки. Задержка контролируется следующими настройками: `insert_keeper_retry_initial_backoff_ms`, `insert_keeper_retry_max_backoff_ms`.
Первая повторная попытка выполняется по истечении `insert_keeper_retry_initial_backoff_ms`. Последующие интервалы ожидания вычисляются следующим образом:

```
timeout = min(insert_keeper_retry_max_backoff_ms, latest_timeout * 2)
```

Например, если `insert_keeper_retry_initial_backoff_ms=100`, `insert_keeper_retry_max_backoff_ms=10000` и `insert_keeper_max_retries=8`, то тайм-ауты будут равны `100, 200, 400, 800, 1600, 3200, 6400, 10000`.

Помимо повышения отказоустойчивости, повторные попытки призваны улучшить пользовательский опыт — они позволяют избежать возврата ошибки во время выполнения INSERT, если Keeper был перезапущен, например при обновлении.


## insert_keeper_retry_initial_backoff_ms \\{#insert_keeper_retry_initial_backoff_ms\\}

<SettingsInfoBlock type="UInt64" default_value="100" />

Начальный интервал ожидания (в миллисекундах) перед повторной отправкой неуспешного запроса Keeper при выполнении INSERT-запроса

Возможные значения:

- Положительное целое число.
- 0 — без ожидания

## insert_keeper_retry_max_backoff_ms \\{#insert_keeper_retry_max_backoff_ms\\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное время ожидания (в миллисекундах) при повторных попытках выполнения неуспешного запроса к Keeper во время выполнения запроса INSERT.

Возможные значения:

- Положительное целое число.
- 0 — максимальное время ожидания не ограничено

## insert_null_as_default \\{#insert_null_as_default\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает вставку [значений по умолчанию](/sql-reference/statements/create/table#default_values) вместо [NULL](/sql-reference/syntax#null) в столбцы с типом данных, который не является [Nullable](/sql-reference/data-types/nullable).
Если тип столбца не является Nullable и этот параметр отключен, то вставка `NULL` вызывает исключение. Если тип столбца является Nullable, то значения `NULL` вставляются без изменений, независимо от этого параметра.

Этот параметр применим к запросам [INSERT ... SELECT](../../sql-reference/statements/insert-into.md/#inserting-the-results-of-select). Обратите внимание, что подзапросы `SELECT` могут быть объединены с помощью оператора `UNION ALL`.

Возможные значения:

- 0 — Вставка `NULL` в столбец с типом, который не является Nullable, вызывает исключение.
- 1 — Вместо `NULL` вставляется значение столбца по умолчанию.

## insert_quorum \\{#insert_quorum\\}

<SettingsInfoBlock type="UInt64Auto" default_value="0" />

:::note
Этот параметр не применяется к SharedMergeTree, дополнительную информацию см. в разделе [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency).
:::

Включает кворумную запись.

- Если `insert_quorum < 2`, кворумная запись отключена.
- Если `insert_quorum >= 2`, кворумная запись включена.
- Если `insert_quorum = 'auto'`, в качестве размера кворума используется большинство (`number_of_replicas / 2 + 1`).

Кворумная запись

`INSERT` считается успешным только в том случае, если ClickHouse удаётся корректно записать данные на `insert_quorum` реплик в течение `insert_quorum_timeout`. Если по какой‑либо причине количество реплик с успешной записью не достигает значения `insert_quorum`, запись считается неуспешной, и ClickHouse удалит вставленный блок со всех реплик, на которые данные уже были записаны.

Когда `insert_quorum_parallel` отключён, все реплики в кворуме согласованы, то есть содержат данные из всех предыдущих запросов `INSERT` (последовательность `INSERT` линеаризована). При чтении данных, записанных с использованием `insert_quorum`, и при отключённом `insert_quorum_parallel`, вы можете включить последовательную согласованность для запросов `SELECT`, используя [select_sequential_consistency](#select_sequential_consistency).

ClickHouse выбрасывает исключение:

- Если количество доступных реплик на момент выполнения запроса меньше, чем `insert_quorum`.
- Когда `insert_quorum_parallel` отключён и выполняется попытка записи данных, в то время как предыдущий блок ещё не был вставлен на `insert_quorum` реплик. Эта ситуация может возникнуть, если пользователь пытается выполнить ещё один запрос `INSERT` в ту же таблицу до завершения предыдущего с `insert_quorum`.

См. также:

- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_parallel \\{#insert_quorum_parallel\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "По умолчанию используются параллельные кворумные вставки. Ими пользоваться значительно удобнее, чем последовательными кворумными вставками"}]}]}/>

:::note
Этот параметр не применяется к SharedMergeTree, см. раздел [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency) для получения дополнительной информации.
:::

Включает или отключает параллелизм для кворумных запросов `INSERT`. Если включен, дополнительные запросы `INSERT` могут быть отправлены, пока предыдущие запросы ещё не завершились. Если отключен, дополнительные операции записи в ту же таблицу будут отклонены.

Возможные значения:

- 0 — отключено.
- 1 — включено.

См. также:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_timeout \\{#insert_quorum_timeout\\}

<SettingsInfoBlock type="Milliseconds" default_value="600000" />

Таймаут ожидания записи в кворум в миллисекундах. Если таймаут истёк и запись ещё не была выполнена, ClickHouse сгенерирует исключение, и клиент должен повторить запрос, чтобы записать тот же блок в ту же или любую другую реплику.

См. также:

- [insert_quorum](#insert_quorum)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_shard_id \{#insert_shard_id\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если значение не равно `0`, задаёт сегмент таблицы [Distributed](/engines/table-engines/special/distributed), в который данные будут синхронно вставляться.

Если значение `insert_shard_id` некорректно, сервер выбросит исключение.

Чтобы получить количество сегментов в `requested_cluster`, вы можете проверить конфигурацию сервера или использовать этот запрос:

```sql
SELECT uniq(shard_num) FROM system.clusters WHERE cluster = 'requested_cluster';
```

Возможные значения:

* 0 — отключено.
* Любое число от `1` до `shards_num` соответствующей таблицы [Distributed](/engines/table-engines/special/distributed).

**Пример**

Запрос:

```sql
CREATE TABLE x AS system.numbers ENGINE = MergeTree ORDER BY number;
CREATE TABLE x_dist AS x ENGINE = Distributed('test_cluster_two_shards_localhost', currentDatabase(), x);
INSERT INTO x_dist SELECT * FROM numbers(5) SETTINGS insert_shard_id = 1;
SELECT * FROM x_dist ORDER BY number ASC;
```

Результат:

```text
┌─number─┐
│      0 │
│      0 │
│      1 │
│      1 │
│      2 │
│      2 │
│      3 │
│      3 │
│      4 │
│      4 │
└────────┘
```


## interactive_delay \\{#interactive_delay\\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

Интервал в микросекундах для проверки, не было ли выполнение запроса отменено, и для отправки информации о его прогрессе.

## intersect_default_mode \\{#intersect_default_mode\\}

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

Устанавливает режим по умолчанию в запросе INTERSECT. Возможные значения: пустая строка, 'ALL', 'DISTINCT'. Если значение не задано, запрос без указания режима приведёт к исключению.

## jemalloc_collect_profile_samples_in_trace_log \\{#jemalloc_collect_profile_samples_in_trace_log\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "Новый параметр"}]}]}/>

Собирать сэмплы операций выделения и освобождения памяти jemalloc в журнал трассировки.

## jemalloc_enable_profiler \\{#jemalloc_enable_profiler\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

Включить профилировщик jemalloc для запроса. Jemalloc будет выборочно отслеживать операции выделения памяти и все операции освобождения для выборочно отобранных выделений.
Профили можно выгружать с помощью SYSTEM JEMALLOC FLUSH PROFILE, что можно использовать для анализа выделения памяти.
Выборки также могут сохраняться в system.trace_log с помощью конфигурации jemalloc_collect_global_profile_samples_in_trace_log или с настройкой запроса jemalloc_collect_profile_samples_in_trace_log.
См. [Профилирование выделений](/operations/allocation-profiling).

## join_algorithm \\{#join_algorithm\\}

<SettingsInfoBlock type="JoinAlgorithm" default_value="direct,parallel_hash,hash" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "direct,parallel_hash,hash"},{"label": "'default' устарел, вместо него следует явно указывать алгоритмы JOIN; также parallel_hash теперь предпочтительнее hash"}]}]}/>

Определяет, какой алгоритм [JOIN](../../sql-reference/statements/select/join.md) используется.

Можно указать несколько алгоритмов, и для конкретного запроса будет выбран доступный алгоритм в зависимости от вида/строгости и движка таблицы.

Возможные значения:

- grace_hash

Используется [Grace hash join](https://en.wikipedia.org/wiki/Hash_join#Grace_hash_join). Grace hash предоставляет вариант алгоритма, который обеспечивает эффективные сложные соединения при ограниченном использовании памяти.

На первой фазе grace join читает правую таблицу и разбивает её на N бакетов в зависимости от хэш-значения ключевых столбцов (изначально N — `grace_hash_join_initial_buckets`). Это делается таким образом, чтобы каждый бакет можно было обрабатывать независимо. Строки из первого бакета добавляются во внутреннюю хэш-таблицу, а остальные сохраняются на диск. Если хэш-таблица выходит за пределы ограничения по памяти (например, заданного через [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)), увеличивается число бакетов и перераспределяется бакет, назначенный каждой строке. Любые строки, не принадлежащие текущему бакету, сбрасываются и переназначаются.

Поддерживает `INNER/LEFT/RIGHT/FULL ALL/ANY JOIN`.

- hash

Используется [алгоритм hash join](https://en.wikipedia.org/wiki/Hash_join). Наиболее универсальная реализация, поддерживающая все комбинации вида и строгости и несколько ключей соединения, объединённых с помощью `OR` в секции `JOIN ON`.

При использовании алгоритма `hash` правая часть `JOIN` загружается в RAM.

- parallel_hash

Вариант соединения `hash`, который разбивает данные на бакеты и параллельно строит несколько хэш-таблиц вместо одной для ускорения этого процесса.

При использовании алгоритма `parallel_hash` правая часть `JOIN` загружается в RAM.

- partial_merge

Вариант [алгоритма sort-merge](https://en.wikipedia.org/wiki/Sort-merge_join), при котором полностью сортируется только правая таблица.

`RIGHT JOIN` и `FULL JOIN` поддерживаются только со строгостью `ALL` (`SEMI`, `ANTI`, `ANY` и `ASOF` не поддерживаются).

При использовании алгоритма `partial_merge` ClickHouse сортирует данные и сбрасывает их на диск. Алгоритм `partial_merge` в ClickHouse немного отличается от классической реализации. Сначала ClickHouse сортирует правую таблицу по ключам соединения по блокам и создаёт min-max индекс для отсортированных блоков. Затем он сортирует части левой таблицы по `join key` и соединяет их с правой таблицей. Min-max индекс также используется для пропуска ненужных блоков правой таблицы.

- direct

Алгоритм `direct` (также известный как алгоритм nested loop, или алгоритм вложенных циклов) выполняет поиск в правой таблице, используя строки из левой таблицы в качестве ключей.
 Его поддерживают специальные хранилища, такие как [Dictionary](/engines/table-engines/special/dictionary), [EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md) и таблицы [MergeTree](/engines/table-engines/mergetree-family/mergetree).

Для таблиц MergeTree алгоритм проталкивает фильтры по ключам соединения непосредственно на уровень хранилища. Это может быть более эффективно, когда ключ может использовать первичный ключевой индекс таблицы для поиска; в противном случае выполняется полное сканирование правой таблицы для каждого блока левой таблицы.

Поддерживает соединения `INNER` и `LEFT` и только одностолбцовые ключи равенства без других условий.

- auto

Если установлено значение `auto`, сначала пробуется соединение `hash`, и алгоритм на лету переключается на другой, если нарушается ограничение по памяти.

- full_sorting_merge

[Алгоритм sort-merge](https://en.wikipedia.org/wiki/Sort-merge_join) с полной сортировкой соединяемых таблиц перед соединением.

- prefer_partial_merge

ClickHouse всегда пытается использовать соединение `partial_merge`, если это возможно, иначе используется `hash`. *Устарел*, эквивалентен `partial_merge,hash`.

- default (устарел)

Устаревшее значение, больше не используйте.
 Эквивалентно `direct,hash`, то есть сначала пробуется direct join, затем hash join (в таком порядке).

## join_any_take_last_row \\{#join_any_take_last_row\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Изменяет поведение операций соединения с жесткостью `ANY`.

:::note
Этот параметр применяется только к операциям `JOIN` с таблицами на движке [Join](../../engines/table-engines/special/join.md).
:::

Возможные значения:

- 0 — Если в правой таблице есть более чем одна подходящая строка, присоединяется только первая найденная.
- 1 — Если в правой таблице есть более чем одна подходящая строка, присоединяется только последняя найденная.

См. также:

- [Оператор JOIN](/sql-reference/statements/select/join)
- [Движок таблицы Join](../../engines/table-engines/special/join.md)
- [join_default_strictness](#join_default_strictness)

## join_default_strictness \\{#join_default_strictness\\}

<SettingsInfoBlock type="JoinStrictness" default_value="ALL" />

Устанавливает строгость по умолчанию для [операторов JOIN](/sql-reference/statements/select/join).

Возможные значения:

- `ALL` — Если в правой таблице есть несколько совпадающих строк, ClickHouse создаёт [декартово произведение](https://en.wikipedia.org/wiki/Cartesian_product) из совпадающих строк. Это стандартное поведение `JOIN` в SQL.
- `ANY` — Если в правой таблице есть несколько совпадающих строк, присоединяется только первая найденная. Если в правой таблице есть только одна совпадающая строка, результаты `ANY` и `ALL` совпадают.
- `ASOF` — Для объединения последовательностей с неопределённым соответствием.
- `Empty string` — Если в запросе не указано `ALL` или `ANY`, ClickHouse генерирует исключение.

## join_on_disk_max_files_to_merge \\{#join_on_disk_max_files_to_merge\\}

<SettingsInfoBlock type="UInt64" default_value="64" />

Ограничивает количество файлов, которые могут использоваться для параллельной сортировки в операциях `MergeJoin` при их выполнении на диске.

Чем больше значение настройки, тем больше используется оперативной памяти и тем меньше требуется дисковых операций ввода-вывода.

Возможные значения:

- Любое положительное целое число, начиная с 2.

## join_output_by_rowlist_perkey_rows_threshold \\{#join_output_by_rowlist_perkey_rows_threshold\\}

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "5"},{"label": "Нижний порог среднего количества строк на ключ в правой таблице для определения, следует ли выводить результат по списку строк в hash join."}]}]}/>

Нижний порог среднего количества строк на ключ в правой таблице для определения, следует ли выводить результат по списку строк в hash join.

## join_overflow_mode \\{#join_overflow_mode\\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, какое действие ClickHouse выполняет при достижении любого из следующих лимитов для JOIN:

- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)
- [max_rows_in_join](/operations/settings/settings#max_rows_in_join)

Возможные значения:

- `THROW` — ClickHouse выбрасывает исключение и прерывает выполнение операции.
- `BREAK` — ClickHouse прерывает выполнение операции и не выбрасывает исключение.

Значение по умолчанию: `THROW`.

**См. также**

- [Оператор JOIN](/sql-reference/statements/select/join)
- [Табличный движок Join](/engines/table-engines/special/join)

## join_runtime_bloom_filter_bytes \\{#join_runtime_bloom_filter_bytes\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "524288"},{"label": "New setting"}]}]}/>

Размер bloom-фильтра, используемого как runtime-фильтр для JOIN, в байтах (см. настройку enable_join_runtime_filters).

## join_runtime_bloom_filter_hash_functions \\{#join_runtime_bloom_filter_hash_functions\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3"},{"label": "New setting"}]}]}/>

Количество хэш-функций в фильтре Блума, используемом в качестве runtime-фильтра для JOIN (см. настройку enable_join_runtime_filters).

## join_runtime_bloom_filter_max_ratio_of_set_bits \\{#join_runtime_bloom_filter_max_ratio_of_set_bits\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Double" default_value="0.7" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0.7"},{"label": "New setting"}]}]}/>

Если доля установленных битов в runtime bloom-фильтре превышает это значение, фильтр полностью отключается, чтобы снизить накладные расходы.

## join_runtime_filter_blocks_to_skip_before_reenabling \\{#join_runtime_filter_blocks_to_skip_before_reenabling\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "30"},{"label": "New setting"}]}]}/>

Количество блоков, которые пропускаются до попытки динамически повторно включить runtime-фильтр, ранее отключённый из-за низкой эффективности фильтрации.

## join_runtime_filter_exact_values_limit \\{#join_runtime_filter_exact_values_limit\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "10000"},{"label": "New setting"}]}]}/>

Максимальное количество элементов в runtime-фильтре, которые хранятся без изменений в Set; при превышении этого порога фильтр переключается на Bloom-фильтр.

## join_runtime_filter_pass_ratio_threshold_for_disabling \\{#join_runtime_filter_pass_ratio_threshold_for_disabling\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Double" default_value="0.7" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0.7"},{"label": "Новая настройка"}]}]}/>

Если отношение числа прошедших строк к числу проверенных строк больше этого порога, runtime-фильтр считается неэффективным и отключается в течение следующих `join_runtime_filter_blocks_to_skip_before_reenabling` блоков для снижения накладных расходов.

## join_to_sort_maximum_table_rows \\{#join_to_sort_maximum_table_rows\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "10000"},{"label": "Максимальное количество строк в правой таблице для определения, нужно ли пересортировать правую таблицу по ключу в LEFT или INNER JOIN"}]}]}/>

Максимальное количество строк в правой таблице для определения, нужно ли пересортировать правую таблицу по ключу в LEFT или INNER JOIN.

## join_to_sort_minimum_perkey_rows \\{#join_to_sort_minimum_perkey_rows\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "40"},{"label": "Нижний предел среднего количества строк на ключ в правой таблице, используемый для определения, нужно ли пересортировать правую таблицу по ключу при left или inner join. Этот SETTING гарантирует, что оптимизация не применяется для разреженных ключей таблицы"}]}]}/>

Нижний предел среднего количества строк на ключ в правой таблице, используемый для определения, нужно ли пересортировать правую таблицу по ключу при left или inner join. Этот SETTING гарантирует, что оптимизация не применяется для разреженных ключей таблицы

## join_use_nulls \\{#join_use_nulls\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Задает тип поведения [JOIN](../../sql-reference/statements/select/join.md). При объединении таблиц могут появляться пустые ячейки. ClickHouse заполняет их по-разному в зависимости от этой настройки.

Возможные значения:

- 0 — пустые ячейки заполняются значением по умолчанию для соответствующего типа поля.
- 1 — `JOIN` ведет себя так же, как в стандартном SQL. Тип соответствующего поля преобразуется в [Nullable](/sql-reference/data-types/nullable), а пустые ячейки заполняются значением [NULL](/sql-reference/syntax).

## joined_block_split_single_row \\{#joined_block_split_single_row\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

Позволяет разбивать результат операции hash join на фрагменты по строкам, соответствующим одной строке из левой таблицы.
Это может уменьшить использование памяти в случае строки с большим количеством совпадений в правой таблице, но может увеличить нагрузку на CPU.
Обратите внимание, что условие `max_joined_block_size_rows != 0` является обязательным, чтобы эта настройка имела эффект.
Параметр `max_joined_block_size_bytes` в сочетании с этой настройкой помогает избежать чрезмерного потребления памяти в случае несбалансированных данных, когда некоторые большие строки имеют много совпадений в правой таблице.

## joined_subquery_requires_alias \\{#joined_subquery_requires_alias\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Обязывает указывать псевдонимы у соединённых подзапросов и табличных функций для корректной квалификации имён.

## kafka_disable_num_consumers_limit \\{#kafka_disable_num_consumers_limit\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Отключает ограничение на kafka_num_consumers, зависящее от числа доступных ядер CPU.

## kafka_max_wait_ms \\{#kafka_max_wait_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

Время ожидания в миллисекундах при чтении сообщений из [Kafka](/engines/table-engines/integrations/kafka) перед повторной попыткой.

Возможные значения:

- Положительное целое число.
- 0 — бесконечное время ожидания.

См. также:

- [Apache Kafka](https://kafka.apache.org/)

## keeper_map_strict_mode \\{#keeper_map_strict_mode\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Принудительно выполнять дополнительные проверки во время операций с KeeperMap. Например, выбрасывать исключение при попытке вставки уже существующего ключа.

## keeper_max_retries \\{#keeper_max_retries\\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "10"},{"label": "Максимальное число повторных попыток для обычных операций Keeper"}]}]}/>

Максимальное число повторных попыток для обычных операций Keeper

## keeper_retry_initial_backoff_ms \\{#keeper_retry_initial_backoff_ms\\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "100"},{"label": "Начальный таймаут бэкоффа для общих операций Keeper"}]}]}/>

Начальный таймаут бэкоффа для общих операций Keeper

## keeper_retry_max_backoff_ms \\{#keeper_retry_max_backoff_ms\\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5000"},{"label": "Максимальное время ожидания (backoff) для операций Keeper общего назначения"}]}]}/>

Максимальное время ожидания (backoff) для операций Keeper общего назначения

## least_greatest_legacy_null_behavior \\{#least_greatest_legacy_null_behavior\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Если настройка включена, функции `least` и `greatest` возвращают NULL, если один из их аргументов равен NULL.

## legacy_column_name_of_tuple_literal \\{#legacy_column_name_of_tuple_literal\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.7"},{"label": "0"},{"label": "Добавляйте этот параметр только для обеспечения совместимости. Имеет смысл установить значение 'true' при поэтапном (rolling) обновлении кластера с версии ниже 21.7 до более высокой версии"}]}]}/>

Перечисляет все имена элементов больших литералов кортежей в имени столбца вместо хеша. Этот параметр существует только по соображениям совместимости. Имеет смысл установить значение 'true' при поэтапном (rolling) обновлении кластера с версии ниже 21.7 до более высокой версии.

## lightweight_delete_mode \\{#lightweight_delete_mode\\}

<SettingsInfoBlock type="LightweightDeleteMode" default_value="alter_update" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "alter_update"},{"label": "Новая настройка"}]}]}/>

Режим внутреннего запроса обновления, который выполняется в рамках легковесного удаления.

Возможные значения:

- `alter_update` — выполнить запрос `ALTER UPDATE`, который создаёт тяжёлую мутацию.
- `lightweight_update` — выполнить легковесное обновление, если это возможно, иначе выполнить `ALTER UPDATE`.
- `lightweight_update_force` — выполнить легковесное обновление, если это возможно, в противном случае сгенерировать ошибку.

## lightweight_deletes_sync \\{#lightweight_deletes_sync\\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "2"},{"label": "То же, что и 'mutation_sync', но управляет только выполнением легковесных удалений"}]}]}/>

То же, что и [`mutations_sync`](#mutations_sync), но управляет только выполнением легковесных удалений.

Возможные значения:

| Value | Description                                                                                                                                           |
|-------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | Мутации выполняются асинхронно.                                                                                                                       |
| `1`   | Запрос ожидает завершения легковесных удалений на текущем сервере.                                                                                    |
| `2`   | Запрос ожидает завершения легковесных удалений на всех репликах (если они есть).                                                                      |
| `3`   | Запрос ожидает завершения только на активных репликах. Поддерживается только для `SharedMergeTree`. Для `ReplicatedMergeTree` ведёт себя так же, как `mutations_sync = 2`. |

**См. также**

- [Синхронность запросов ALTER](../../sql-reference/statements/alter/index.md/#synchronicity-of-alter-queries)
- [Мутации](../../sql-reference/statements/alter/index.md/#mutations)

## limit \\{#limit\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает максимальное число строк, получаемых из результата запроса. Корректирует значение, заданное оператором [LIMIT](/sql-reference/statements/select/limit), так, чтобы лимит, указанный в запросе, не мог превышать лимит, заданный этим SETTING-параметром.

Возможные значения:

- 0 — число строк не ограничено.
- Положительное целое число.

## load_balancing \\{#load_balancing\\}

<SettingsInfoBlock type="LoadBalancing" default_value="random" />

Определяет алгоритм выбора реплик, используемый при распределённой обработке запросов.

ClickHouse поддерживает следующие алгоритмы выбора реплик:

- [Random](#load_balancing-random) (по умолчанию)
- [Nearest hostname](#load_balancing-nearest_hostname)
- [Hostname levenshtein distance](#load_balancing-hostname_levenshtein_distance)
- [In order](#load_balancing-in_order)
- [First or random](#load_balancing-first_or_random)
- [Round robin](#load_balancing-round_robin)

См. также:

- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

### Случайный выбор (по умолчанию) \{#load_balancing-random\}

```sql
load_balancing = random
```

Количество ошибок подсчитывается для каждой реплики. Запрос отправляется на реплику с наименьшим числом ошибок, а если таких несколько — к любой из них.
Недостатки: близость сервера не учитывается; если реплики содержат разные данные, вы также получите разные данные.


### Ближайшее по расстоянию имя хоста \{#load_balancing-nearest_hostname\}

```sql
load_balancing = nearest_hostname
```

Количество ошибок учитывается для каждой реплики. Каждые 5 минут счётчик ошибок целочисленно делится пополам. Таким образом, число ошибок за недавнее время рассчитывается с экспоненциальным сглаживанием. Если есть одна реплика с минимальным числом ошибок (т. е. ошибки недавно происходили на других репликах), запрос отправляется на неё. Если есть несколько реплик с одинаковым минимальным числом ошибок, запрос отправляется на реплику с именем хоста, которое наиболее похоже на имя хоста сервера в конфигурационном файле (по количеству различающихся символов в одинаковых позициях, до минимальной длины обоих имён хоста).

Например, example01-01-1 и example01-01-2 различаются в одной позиции, а example01-01-1 и example01-02-2 отличаются в двух местах.
Этот метод может показаться примитивным, но он не требует внешних данных о топологии сети и не сравнивает IP-адреса, что было бы сложно для наших IPv6-адресов.

Таким образом, если реплики эквивалентны, предпочтение отдаётся ближайшей по имени.
Мы также можем предположить, что при отправке запроса на один и тот же сервер при отсутствии сбоев распределённый запрос также будет обращаться к тем же серверам. Поэтому, даже если на репликах размещены разные данные, запрос в большинстве случаев вернёт практически одинаковые результаты.


### Расстояние Левенштейна для имен хостов \{#load_balancing-hostname_levenshtein_distance\}

```sql
load_balancing = hostname_levenshtein_distance
```

Аналогична `nearest_hostname`, но выполняет сравнение имени хоста с использованием [расстояния Левенштейна](https://en.wikipedia.org/wiki/Levenshtein_distance). Например:

```text
example-clickhouse-0-0 ample-clickhouse-0-0
1

example-clickhouse-0-0 example-clickhouse-1-10
2

example-clickhouse-0-0 example-clickhouse-12-0
3
```


### По очереди \{#load_balancing-in_order\}

```sql
load_balancing = in_order
```

К репликам с одинаковым числом ошибок обращаются в том же порядке, в котором они перечислены в конфигурации.
Этот метод подходит, когда вы точно знаете, какая реплика предпочтительнее.


### Первый или случайный выбор \{#load_balancing-first_or_random\}

```sql
load_balancing = first_or_random
```

Этот алгоритм выбирает первую реплику в наборе или случайную реплику, если первая недоступна. Он эффективен в топологиях с перекрёстной репликацией, но бесполезен в других конфигурациях.

Алгоритм `first_or_random` решает проблему алгоритма `in_order`. При использовании `in_order`, если одна реплика выходит из строя, следующая получает двойную нагрузку, в то время как остальные реплики обрабатывают обычный объём трафика. При использовании алгоритма `first_or_random` нагрузка равномерно распределяется между репликами, которые всё ещё доступны.

Можно явно задать, какая реплика считается первой, с помощью настройки `load_balancing_first_offset`. Это даёт больше контроля над перераспределением нагрузки запросов между репликами.


### Циклическое (round-robin) распределение \{#load_balancing-round_robin\}

```sql
load_balancing = round_robin
```

Этот алгоритм использует политику `round-robin` между репликами с одинаковым количеством ошибок (учитываются только запросы с политикой `round_robin`).


## load_balancing_first_offset \\{#load_balancing_first_offset\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Какую реплику предпочтительнее использовать для отправки запроса при стратегии балансировки нагрузки FIRST_OR_RANDOM.

## load_marks_asynchronously \\{#load_marks_asynchronously\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Загружать метки MergeTree асинхронно

## local_filesystem_read_method \\{#local_filesystem_read_method\\}

<SettingsInfoBlock type="String" default_value="pread_threadpool" />

Метод чтения данных с локальной файловой системы, один из: read, pread, mmap, io_uring, pread_threadpool.

Метод `io_uring` является экспериментальным и не работает для Log, TinyLog, StripeLog, File, Set и Join, а также других таблиц с дописываемыми файлами при наличии одновременных операций чтения и записи.
Если вы читаете различные статьи об `io_uring` в интернете, не поддавайтесь впечатлению от них. Это не лучший метод чтения файлов, за исключением случая большого количества мелких операций ввода-вывода, что не соответствует характеру нагрузки в ClickHouse. Нет причин включать метод `io_uring`.

## local_filesystem_read_prefetch \\{#local_filesystem_read_prefetch\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать предварительную выборку при чтении данных с локальной файловой системы.

## lock_acquire_timeout \\{#lock_acquire_timeout\\}

<SettingsInfoBlock type="Seconds" default_value="120" />

Определяет, сколько секунд запрос блокировки ожидает перед возникновением ошибки.

Таймаут блокировки используется для защиты от взаимных блокировок при выполнении операций чтения и записи с таблицами. Когда таймаут истекает и запрос блокировки завершается с ошибкой, сервер ClickHouse генерирует исключение "Locking attempt timed out! Possible deadlock avoided. Client should retry." с кодом ошибки `DEADLOCK_AVOIDED`.

Возможные значения:

- Положительное целое число (в секундах).
- 0 — без таймаута блокировки.

## log_comment \{#log_comment\}

Определяет значение поля `log_comment` таблицы [system.query&#95;log](../system-tables/query_log.md) и текст комментария для серверного лога.

Может использоваться для улучшения читаемости серверных логов. Кроме того, помогает выбирать запросы, связанные с тестом, из `system.query_log` после запуска [clickhouse-test](../../development/tests.md).

Возможные значения:

* Любая строка длиной не более [max&#95;query&#95;size](#max_query_size). Если max&#95;query&#95;size будет превышено, сервер сгенерирует исключение.

**Пример**

Запрос:

```sql
SET log_comment = 'log_comment test', log_queries = 1;
SELECT 1;
SYSTEM FLUSH LOGS;
SELECT type, query FROM system.query_log WHERE log_comment = 'log_comment test' AND event_date >= yesterday() ORDER BY event_time DESC LIMIT 2;
```

Результат:

```text
┌─type────────┬─query─────┐
│ QueryStart  │ SELECT 1; │
│ QueryFinish │ SELECT 1; │
└─────────────┴───────────┘
```


## log_formatted_queries \\{#log_formatted_queries\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет записывать форматированные запросы в системную таблицу [system.query_log](../../operations/system-tables/query_log.md) (заполняет столбец `formatted_query` в таблице [system.query_log](../../operations/system-tables/query_log.md)).

Возможные значения:

- 0 — Форматированные запросы не записываются в системную таблицу.
- 1 — Форматированные запросы записываются в системную таблицу.

## log_processors_profiles \\{#log_processors_profiles\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Enable by default"}]}]}/>

Записывать в таблицу `system.processors_profile_log` время, которое процессор провёл в выполнении или ожидании данных.

См. также:

- [`system.processors_profile_log`](../../operations/system-tables/processors_profile_log.md)
- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md/#explain-pipeline)

## log_profile_events \\{#log_profile_events\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Записывает статистику производительности запросов в query_log, query_thread_log и query_views_log.

## log_queries \{#log_queries\}

<SettingsInfoBlock type="Bool" default_value="1" />

Настройка ведения журнала запросов.

Запросы, отправляемые в ClickHouse при такой конфигурации, регистрируются в журнале в соответствии с правилами серверного параметра конфигурации [query&#95;log](../../operations/server-configuration-parameters/settings.md/#query_log).

Пример:

```text
log_queries=1
```


## log_queries_cut_to_length \\{#log_queries_cut_to_length\\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

Если длина запроса превышает заданный порог (в байтах), то запрос усекается при записи в журнал запросов. Также ограничивается длина выводимого запроса в обычном текстовом логе.

## log_queries_min_query_duration_ms \\{#log_queries_min_query_duration_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Если задано ненулевое значение, запросы с длительностью меньше этого значения не будут записываться в лог (это можно рассматривать как аналог `long_query_time` для [MySQL Slow Query Log](https://dev.mysql.com/doc/refman/5.7/slow-query-log.html)), и это, по сути, означает, что вы не найдете их в следующих таблицах:

- `system.query_log`
- `system.query_thread_log`

В лог будут попадать только запросы со следующими типами:

- `QUERY_FINISH`
- `EXCEPTION_WHILE_PROCESSING`

- Тип: миллисекунды
- Значение по умолчанию: 0 (любой запрос)

## log_queries_min_type \{#log_queries_min_type\}

<SettingsInfoBlock type="LogQueriesType" default_value="QUERY_START" />

Минимальный тип записей, которые будут логироваться в `query_log`.

Возможные значения:

* `QUERY_START` (`=1`)
* `QUERY_FINISH` (`=2`)
* `EXCEPTION_BEFORE_START` (`=3`)
* `EXCEPTION_WHILE_PROCESSING` (`=4`)

Можно использовать для ограничения того, какие типы событий будут попадать в `query_log`. Например, если вас интересуют только ошибки, вы можете использовать `EXCEPTION_WHILE_PROCESSING`:

```text
log_queries_min_type='EXCEPTION_WHILE_PROCESSING'
```


## log_queries_probability \\{#log_queries_probability\\}

<SettingsInfoBlock type="Float" default_value="1" />

Позволяет записывать в системные таблицы [query_log](../../operations/system-tables/query_log.md), [query_thread_log](../../operations/system-tables/query_thread_log.md) и [query_views_log](../../operations/system-tables/query_views_log.md) только часть запросов, случайным образом выбранных с указанной вероятностью. Это помогает снизить нагрузку при большом объёме запросов в секунду.

Возможные значения:

- 0 — запросы не записываются в системные таблицы.
- Положительное число с плавающей запятой в диапазоне [0..1]. Например, если значение настройки равно `0.5`, в системные таблицы будет записываться примерно половина запросов.
- 1 — все запросы записываются в системные таблицы.

## log_query_settings \\{#log_query_settings\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Записывать настройки запроса в query_log и журнал спанов OpenTelemetry.

## log_query_threads \{#log_query_threads\}

<SettingsInfoBlock type="Bool" default_value="0" />

Настройка логирования потоков запросов.

Потоки запросов логируются в таблицу [system.query&#95;thread&#95;log](../../operations/system-tables/query_thread_log.md). Этот параметр учитывается только если [log&#95;queries](#log_queries) имеет значение true. Потоки запросов, выполняемых ClickHouse при такой настройке, логируются в соответствии с правилами параметра конфигурации сервера [query&#95;thread&#95;log](/operations/server-configuration-parameters/settings#query_thread_log).

Возможные значения:

* 0 — Отключено.
* 1 — Включено.

**Пример**

```text
log_query_threads=1
```


## log_query_views \{#log_query_views\}

<SettingsInfoBlock type="Bool" default_value="1" />

Настройка логирования представлений запросов.

Когда запрос, выполняемый ClickHouse при включённой этой настройке, имеет связанные представления (материализованные или live-представления), они записываются в журнал, заданный параметром конфигурации сервера [query&#95;views&#95;log](/operations/server-configuration-parameters/settings#query_views_log).

Пример:

```text
log_query_views=1
```


## low_cardinality_allow_in_native_format \\{#low_cardinality_allow_in_native_format\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает или запрещает использование типа данных [LowCardinality](../../sql-reference/data-types/lowcardinality.md) с форматом [Native](/interfaces/formats/Native).

Если использование `LowCardinality` ограничено, сервер ClickHouse преобразует столбцы `LowCardinality` в обычные для запросов `SELECT` и, наоборот, обычные столбцы в столбцы `LowCardinality` для запросов `INSERT`.

Этот параметр необходим главным образом для сторонних клиентов, которые не поддерживают тип данных `LowCardinality`.

Возможные значения:

- 1 — использование `LowCardinality` не ограничено.
- 0 — использование `LowCardinality` ограничено.

## low_cardinality_max_dictionary_size \\{#low_cardinality_max_dictionary_size\\}

<SettingsInfoBlock type="UInt64" default_value="8192" />

Задаёт максимальный размер в строках общего глобального словаря для типа данных [LowCardinality](../../sql-reference/data-types/lowcardinality.md), который может быть сохранён в файловой системе хранилища. Этот параметр предотвращает проблемы с ОЗУ в случае неограниченного роста словаря. Все данные, которые не могут быть закодированы из‑за ограничения на максимальный размер словаря, ClickHouse записывает обычным способом.

Возможные значения:

- Любое положительное целое число.

## low_cardinality_use_single_dictionary_for_part \\{#low_cardinality_use_single_dictionary_for_part\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает использование единого словаря для части данных.

По умолчанию сервер ClickHouse отслеживает размер словарей, и если словарь переполняется, сервер начинает записывать данные в новый. Чтобы запретить создание нескольких словарей, установите `low_cardinality_use_single_dictionary_for_part = 1`.

Возможные значения:

- 1 — Создание нескольких словарей для части данных запрещено.
- 0 — Создание нескольких словарей для части данных не запрещено.

## low_priority_query_wait_time_ms \\{#low_priority_query_wait_time_ms\\}

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1000"},{"label": "New setting."}]}]}/>

Когда используется механизм приоритизации запросов (см. настройку `priority`), низкоприоритетные запросы ожидают завершения выполнения высокоприоритетных запросов. Эта настройка задаёт продолжительность ожидания.

## make_distributed_plan \\{#make_distributed_plan\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Новая экспериментальная настройка."}]}]}/>

Создаёт распределённый план запроса.

## materialize_skip_indexes_on_insert \\{#materialize_skip_indexes_on_insert\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Added new setting to allow to disable materialization of skip indexes on insert"}]}]}/>

Определяет, строятся и сохраняются ли пропускающие индексы при выполнении INSERT. Если настройка отключена, пропускающие индексы будут строиться и сохраняться только [во время слияний](merge-tree-settings.md/#materialize_skip_indexes_on_merge) или явным вызовом [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index).

См. также [exclude_materialize_skip_indexes_on_insert](#exclude_materialize_skip_indexes_on_insert).

## materialize_statistics_on_insert \\{#materialize_statistics_on_insert\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Добавлена новая настройка, позволяющая отключить материализацию статистики при вставке"}]}]}/>

Определяет, будут ли операторы INSERT создавать и вставлять статистику. Если настройка отключена, статистика будет строиться и сохраняться во время слияний или явным выполнением MATERIALIZE STATISTICS.

## materialize_ttl_after_modify \\{#materialize_ttl_after_modify\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Применять TTL к ранее существующим данным после выполнения запроса ALTER MODIFY TTL

## materialized_views_ignore_errors \\{#materialized_views_ignore_errors\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет игнорировать ошибки в MATERIALIZED VIEW и передавать исходный блок в таблицу независимо от MVs.

## materialized_views_squash_parallel_inserts \\{#materialized_views_squash_parallel_inserts\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "Добавлена настройка для сохранения старого поведения при необходимости."}]}]}/>

Объединяет параллельные вставки, выполняемые одним запросом INSERT, в целевую таблицу materialized view, чтобы уменьшить количество создаваемых частей.
Если установлено значение false и включен `parallel_view_processing`, запрос INSERT будет создавать отдельную часть в целевой таблице для каждого потока `max_insert_thread`.

## max_analyze_depth \\{#max_analyze_depth\\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

Максимальное количество операций анализа, выполняемых интерпретатором.

## max_ast_depth \\{#max_ast_depth\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальная глубина вложенности синтаксического дерева запроса. При превышении этого значения выбрасывается исключение.

:::note
В настоящий момент это не проверяется на этапе парсинга, а только после разбора запроса.
Это означает, что на этапе парсинга может быть создано слишком глубокое синтаксическое дерево,
но выполнение запроса завершится с ошибкой.
:::

## max_ast_elements \\{#max_ast_elements\\}

<SettingsInfoBlock type="UInt64" default_value="50000" />

Максимальное количество элементов в синтаксическом дереве запроса. При превышении этого значения выбрасывается исключение.

:::note
На данный момент это не проверяется во время парсинга, а только после разбора запроса.
Это означает, что во время парсинга может быть создано слишком глубокое синтаксическое дерево,
но запрос завершится с ошибкой.
:::

## max_autoincrement_series \\{#max_autoincrement_series\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "A new setting"}]}]}/>

Ограничение на количество последовательностей, создаваемых функцией `generateSerialID`.

Поскольку каждая последовательность соответствует узлу в Keeper, рекомендуется иметь не более порядка двух миллионов таких узлов.

## max_backup_bandwidth \\{#max_backup_bandwidth\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость чтения данных в байтах в секунду для конкретной операции резервного копирования на сервере. Ноль означает отсутствие ограничений.

## max_block_size \\{#max_block_size\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

В ClickHouse данные обрабатываются блоками, которые представляют собой наборы частей столбцов. Внутренние циклы обработки одного блока эффективны, но при обработке каждого блока возникают заметные накладные расходы.

Настройка `max_block_size` указывает рекомендуемое максимальное количество строк, которые следует включать в один блок при выборке данных из таблиц. Блоки размером `max_block_size` не всегда загружаются из таблицы: если ClickHouse определяет, что нужно получить меньше данных, обрабатывается блок меньшего размера.

Размер блока не должен быть слишком маленьким, чтобы избежать заметных накладных расходов при обработке каждого блока. Он также не должен быть слишком большим, чтобы запросы с оператором LIMIT выполнялись быстро после обработки первого блока. При задании `max_block_size` цель состоит в том, чтобы избежать чрезмерного потребления памяти при извлечении большого числа столбцов в нескольких потоках и сохранить хотя бы некоторую локальность кэша.

## max_bytes_before_external_group_by \\{#max_bytes_before_external_group_by\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Значение по умолчанию в Cloud: половина объёма памяти на реплику.

Включает или отключает выполнение операций `GROUP BY` во внешней памяти.
(См. [GROUP BY во внешней памяти](/sql-reference/statements/select/group-by#group-by-in-external-memory))

Возможные значения:

- Максимальный объём ОЗУ (в байтах), который может быть использован одной операцией [GROUP BY](/sql-reference/statements/select/group-by).
- `0` — `GROUP BY` во внешней памяти отключён.

:::note
Если использование памяти во время операций GROUP BY превышает этот порог в байтах,
активируется режим «external aggregation» (сброс данных на диск).

Рекомендуемое значение — половина доступной системной памяти.
:::

## max_bytes_before_external_sort \\{#max_bytes_before_external_sort\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Значение по умолчанию в Cloud: половина объёма памяти на реплику.

Включает или отключает выполнение `ORDER BY` во внешней памяти. См. [ORDER BY Implementation Details](../../sql-reference/statements/select/order-by.md#implementation-details).
Если использование памяти во время операции `ORDER BY` превышает этот порог в байтах, активируется режим внешней сортировки (выгрузка данных на диск).

Возможные значения:

- Максимальный объём оперативной памяти (в байтах), который может быть использован одной операцией [ORDER BY](../../sql-reference/statements/select/order-by.md).
  Рекомендуемое значение — половина доступного объёма системной памяти.
- `0` — `ORDER BY` во внешней памяти отключён.

## max_bytes_before_remerge_sort \\{#max_bytes_before_remerge_sort\\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

В случае использования ORDER BY с LIMIT, когда объем потребляемой памяти превышает указанный порог, выполняются дополнительные этапы слияния блоков перед финальным слиянием, чтобы сохранить только первые LIMIT строк.

## max_bytes_in_distinct \\{#max_bytes_in_distinct\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт состояния (в несжатых байтах) в памяти, которое
занимает хеш-таблица при использовании DISTINCT.

## max_bytes_in_join \\{#max_bytes_in_join\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер в байтах хеш-таблицы, используемой при объединении таблиц.

Этот параметр применяется к операциям [SELECT ... JOIN](/sql-reference/statements/select/join)
и к [движку таблицы Join](/engines/table-engines/special/join).

Если запрос содержит JOIN, ClickHouse проверяет этот параметр для каждого промежуточного результата.

При достижении лимита ClickHouse может выполнить различные действия. Используйте
настройку [join_overflow_mode](/operations/settings/settings#join_overflow_mode), чтобы выбрать требуемое действие.

Возможные значения:

- Положительное целое число.
- 0 — контроль памяти отключен.

## max_bytes_in_set \\{#max_bytes_in_set\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт несжатых данных, используемых Set в условии IN,
построенном на подзапросе.

## max_bytes_ratio_before_external_group_by \\{#max_bytes_ratio_before_external_group_by\\}

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "Включить автоматический сброс на диск по умолчанию."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Доля доступной памяти, которая может быть использована для `GROUP BY`. После достижения этого порога
для агрегации используется внешняя память.

Например, если значение равно `0.6`, `GROUP BY` может использовать 60% доступной памяти
(для сервера/пользователя/слияний) в начале выполнения, после чего
будет использоваться внешняя агрегация.

## max_bytes_ratio_before_external_sort \\{#max_bytes_ratio_before_external_sort\\}

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "По умолчанию включён автоматический сброс на диск."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Доля доступной памяти, которая может быть использована для `ORDER BY`. После достижения этого порога используется внешняя сортировка.

Например, если установить значение `0.6`, `ORDER BY` позволит использовать `60%` доступной памяти (для сервера/пользователя/слияний) в начале выполнения, после чего будет использоваться внешняя сортировка.

Обратите внимание, что `max_bytes_before_external_sort` по‑прежнему учитывается: сброс на диск будет выполняться только если блок сортировки больше, чем `max_bytes_before_external_sort`.

## max_bytes_to_read \\{#max_bytes_to_read\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт (несжатых данных), которое можно прочитать из таблицы при выполнении запроса.
Ограничение проверяется для каждого обрабатываемого фрагмента данных, применяется только к
наиболее глубоко вложенному табличному выражению и при чтении с удалённого сервера проверяется только на удалённом сервере.

## max_bytes_to_read_leaf \\{#max_bytes_to_read_leaf\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт (несжатых данных), которое может быть прочитано из локальной
таблицы на листовом узле при выполнении распределённого запроса. Хотя распределённые запросы
могут отправлять несколько подзапросов к каждому сегменту (листовому узлу), этот лимит будет
проверяться только на стадии чтения на листовых узлах и игнорироваться на стадии
слияния результатов на корневом узле.

Например, кластер состоит из 2 сегментов, и каждый сегмент содержит таблицу со
100 байтами данных. Распределённый запрос, который должен прочитать все данные
из обеих таблиц с настройкой `max_bytes_to_read=150`, завершится с ошибкой, так как в сумме это
будет 200 байт. Запрос с `max_bytes_to_read_leaf=150` завершится успешно, поскольку
листовые узлы прочитают максимум по 100 байт.

Ограничение проверяется для каждого обрабатываемого фрагмента данных.

:::note
Эта настройка нестабильна при `prefer_localhost_replica=1`.
:::

## max_bytes_to_sort \\{#max_bytes_to_sort\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объём данных в байтах перед сортировкой. Если для выполнения операции ORDER BY требуется обработать несжатые данные объёмом, превышающим указанное значение, поведение будет определяться параметром `sort_overflow_mode`, который по умолчанию установлен в `throw`.

## max_bytes_to_transfer \\{#max_bytes_to_transfer\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт (несжатых данных), которое может быть передано на удалённый
сервер или сохранено во временной таблице при выполнении оператора GLOBAL IN/JOIN.

## max_columns_to_read \\{#max_columns_to_read\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество столбцов, которые могут быть прочитаны из таблицы в одном запросе.
Если запрос требует чтения большего числа столбцов, чем указано, будет выброшено исключение.

:::tip
Этот параметр полезен для предотвращения чрезмерно сложных запросов.
:::

Значение `0` означает отсутствие ограничений.

## max_compress_block_size \\{#max_compress_block_size\\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Максимальный размер блоков несжатых данных перед их сжатием при записи в таблицу. По умолчанию — 1 048 576 (1 MiB). Указание меньшего значения обычно приводит к чуть более низкому коэффициенту сжатия, скорость сжатия и распаковки немного увеличивается за счёт локальности кэша, а потребление памяти уменьшается.

:::note
Это настройка для экспертов, и вам не следует менять её, если вы только начинаете работу с ClickHouse.
:::

Не путайте блоки для сжатия (фрагмент памяти, состоящий из байт) с блоками для обработки запросов (набор строк из таблицы).

## max_concurrent_queries_for_all_users \{#max_concurrent_queries_for_all_users\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Генерировать исключение, если значение этого параметра меньше либо равно текущему количеству одновременно обрабатываемых запросов.

Пример: `max_concurrent_queries_for_all_users` может быть установлен в значение 99 для всех пользователей, а администратор базы данных может установить его равным 100 для себя, чтобы выполнять запросы для расследования даже при перегрузке сервера.

Изменение параметра для одного запроса или пользователя не влияет на другие запросы.

Возможные значения:

* Положительное целое число.
* 0 — без ограничения.

**Пример**

```xml
<max_concurrent_queries_for_all_users>99</max_concurrent_queries_for_all_users>
```

**См. также**

* [max&#95;concurrent&#95;queries](/operations/server-configuration-parameters/settings#max_concurrent_queries)


## max_concurrent_queries_for_user \{#max_concurrent_queries_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество одновременно обрабатываемых запросов для пользователя.

Возможные значения:

* Положительное целое число.
* 0 — без ограничений.

**Пример**

```xml
<max_concurrent_queries_for_user>5</max_concurrent_queries_for_user>
```


## max_distributed_connections \\{#max_distributed_connections\\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

Максимальное количество одновременных подключений к удалённым серверам для распределённой обработки одного запроса к одной distributed таблице. Рекомендуется указывать значение не меньше количества серверов в кластере.

Следующие параметры используются только при создании distributed таблиц (и при запуске сервера), поэтому нет смысла изменять их во время работы.

## max_distributed_depth \\{#max_distributed_depth\\}

<SettingsInfoBlock type="UInt64" default_value="5" />

Ограничивает максимальную глубину рекурсивных запросов для таблиц [Distributed](../../engines/table-engines/special/distributed.md).

При превышении значения сервер выбрасывает исключение.

Возможные значения:

- Положительное целое число.
- 0 — неограниченная глубина.

## max_download_buffer_size \\{#max_download_buffer_size\\}

<SettingsInfoBlock type="UInt64" default_value="10485760" />

Максимальный размер буфера для параллельной загрузки (например, для движка URL) для каждого потока.

## max_download_threads \\{#max_download_threads\\}

<SettingsInfoBlock type="MaxThreads" default_value="4" />

Максимальное количество потоков для загрузки данных (например, для движка URL).

## max_estimated_execution_time \\{#max_estimated_execution_time\\}

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Separate max_execution_time and max_estimated_execution_time"}]}]}/>

Максимальное предполагаемое время выполнения запроса в секундах. Проверяется для каждого блока данных,
когда истекает [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed).

## max_execution_speed \\{#max_execution_speed\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество обрабатываемых строк в секунду. Проверяется на каждом блоке данных, когда истекает
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed).
Если скорость выполнения слишком высока, она будет снижена.

## max_execution_speed_bytes \\{#max_execution_speed_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объём данных, обрабатываемых в секунду (в байтах). Проверяется на каждом блоке данных, когда
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
истекает. Если скорость выполнения слишком высокая, она будет снижена.

## max_execution_time \\{#max_execution_time\\}

<SettingsInfoBlock type="Seconds" default_value="0" />

Максимальное время выполнения запроса в секундах.

Параметр `max_execution_time` может быть немного неочевиден.
Он работает на основе интерполяции относительно текущей скорости выполнения запроса
(это поведение контролируется параметром [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)).

ClickHouse прервёт запрос, если прогнозируемое время выполнения превысит
указанное значение `max_execution_time`. По умолчанию `timeout_before_checking_execution_speed`
равен 10 секундам. Это означает, что через 10 секунд выполнения запроса ClickHouse
начнёт оценивать общее время выполнения. Если, например, `max_execution_time`
установлен в 3600 секунд (1 час), ClickHouse завершит запрос, если оценочное
время превысит этот предел в 3600 секунд. Если вы установите `timeout_before_checking_execution_speed`
в 0, ClickHouse будет использовать фактическое время по часам как основу для `max_execution_time`.

Если время выполнения запроса превышает указанное количество секунд, поведение будет
определяться параметром `timeout_overflow_mode`, который по умолчанию имеет значение `throw`.

:::note
Таймаут проверяется, и запрос может быть остановлен только в определённых местах во время обработки данных.
В настоящее время запрос нельзя остановить во время слияния состояний агрегации или во время анализа запроса,
и фактическое время выполнения будет больше значения этой настройки.
:::

## max_execution_time_leaf \{#max_execution_time_leaf\}

<SettingsInfoBlock type="Seconds" default_value="0" />

Семантически аналогичен [`max_execution_time`](#max_execution_time), но применяется
только к листовым узлам (leaf-узлам) для распределённых или удалённых запросов.

Например, если нужно ограничить время выполнения на листовом узле до `10s`, но
не ограничивать его на инициирующем узле, вместо использования `max_execution_time` в
настройках вложенного подзапроса:

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t SETTINGS max_execution_time = 10));
```

Мы можем использовать `max_execution_time_leaf` как настройку запроса:

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t)) SETTINGS max_execution_time_leaf = 10;
```


## max_expanded_ast_elements \\{#max_expanded_ast_elements\\}

<SettingsInfoBlock type="UInt64" default_value="500000" />

Максимальный размер синтаксического дерева запроса, измеряемый числом узлов, после разворачивания алиасов и звёздочки (`*`).

## max_fetch_partition_retries_count \\{#max_fetch_partition_retries_count\\}

<SettingsInfoBlock type="UInt64" default_value="5" />

Число повторных попыток при получении партиции с другого узла.

## max_final_threads \\{#max_final_threads\\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

Задает максимальное количество параллельных потоков для фазы чтения данных запроса `SELECT` с модификатором [FINAL](/sql-reference/statements/select/from#final-modifier).

Возможные значения:

- Положительное целое число.
- 0 или 1 — отключено. Запросы `SELECT` выполняются в одном потоке.

## max_http_get_redirects \\{#max_http_get_redirects\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество допустимых переходов при HTTP GET‑редиректах. Обеспечивает дополнительные меры безопасности, препятствуя тому, чтобы вредоносный сервер перенаправлял ваши запросы на неожиданные сервисы.\n\nРечь идет о ситуации, когда внешний сервер перенаправляет на другой адрес, но этот адрес оказывается внутренним для инфраструктуры компании, и, отправляя HTTP‑запрос на внутренний сервер, вы можете обратиться к внутреннему API из внутренней сети, обходя аутентификацию, или даже обратиться к другим сервисам, таким как Redis или Memcached. Если у вас нет внутренней инфраструктуры (включая что‑либо, работающее на вашем localhost), или вы доверяете серверу, разрешить редиректы безопасно. Однако имейте в виду, что если URL использует HTTP вместо HTTPS, вам придется доверять не только удаленному серверу, но также вашему интернет‑провайдеру и каждой сети по пути.

## max_hyperscan_regexp_length \{#max_hyperscan_regexp_length\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Определяет максимальную длину каждого регулярного выражения в [функциях многократного сопоставления Hyperscan](/sql-reference/functions/string-search-functions#multiMatchAny).

Возможные значения:

* Положительное целое число.
* 0 — длина не ограничена.

**Пример**

Запрос:

```sql
SELECT multiMatchAny('abcd', ['ab','bcd','c','d']) SETTINGS max_hyperscan_regexp_length = 3;
```

Результат:

```text
┌─multiMatchAny('abcd', ['ab', 'bcd', 'c', 'd'])─┐
│                                              1 │
└────────────────────────────────────────────────┘
```

Запрос:

```sql
SELECT multiMatchAny('abcd', ['ab','bcd','c','d']) SETTINGS max_hyperscan_regexp_length = 2;
```

Результат:

```text
Exception: Regexp length too large.
```

**См. также**

* [max&#95;hyperscan&#95;regexp&#95;total&#95;length](#max_hyperscan_regexp_total_length)


## max_hyperscan_regexp_total_length \{#max_hyperscan_regexp_total_length\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает максимальную суммарную длину всех регулярных выражений в каждой [функции Hyperscan для множественного сопоставления](/sql-reference/functions/string-search-functions#multiMatchAny).

Возможные значения:

* Положительное целое число.
* 0 — длина не ограничена.

**Пример**

Запрос:

```sql
SELECT multiMatchAny('abcd', ['a','b','c','d']) SETTINGS max_hyperscan_regexp_total_length = 5;
```

Результат:

```text
┌─multiMatchAny('abcd', ['a', 'b', 'c', 'd'])─┐
│                                           1 │
└─────────────────────────────────────────────┘
```

Запрос:

```sql
SELECT multiMatchAny('abcd', ['ab','bc','c','d']) SETTINGS max_hyperscan_regexp_total_length = 5;
```

Результат:

```text
Exception: Total regexp lengths too large.
```

**См. также**

* [max&#95;hyperscan&#95;regexp&#95;length](#max_hyperscan_regexp_length)


## max_insert_block_size \\{#max_insert_block_size\\}

**Псевдонимы**: `max_insert_block_size_rows`

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048449" />

Максимальный размер блоков (в количестве строк), формируемых при вставке в таблицу.

Этот параметр управляет формированием блоков при разборе форматов. Когда сервер разбирает построчные форматы ввода (CSV, TSV, JSONEachRow и т. д.) или формат Values из любого интерфейса (HTTP, clickhouse-client с inline-данными, gRPC, протокол PostgreSQL wire), он использует это значение, чтобы определить момент, когда нужно сформировать и выдать блок.
Примечание: при использовании clickhouse-client или clickhouse-local для чтения из файла данные разбирает сам клиент, и этот параметр применяется на стороне клиента.

Блок формируется, когда выполняется одно из условий:

- Минимальные пороги (AND): достигнуты и min_insert_block_size_rows, и min_insert_block_size_bytes
- Максимальные пороги (OR): достигнут один из max_insert_block_size или max_insert_block_size_bytes

Значение по умолчанию немного больше, чем max_block_size. Причина в том, что некоторые движки таблиц (`*MergeTree`) формируют часть данных (data part) на диске для каждого вставленного блока, а это довольно крупная сущность. Аналогично, таблицы `*MergeTree` сортируют данные во время вставки, и достаточно большой размер блока позволяет отсортировать больше данных в RAM.

Возможные значения:

- Положительное целое число.

## max_insert_block_size_bytes \\{#max_insert_block_size_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "Новый параметр, который позволяет контролировать размер блоков в байтах во время разбора данных в Row Input Format."}]}]}/>

Максимальный размер блоков (в байтах), формируемых для вставки в таблицу.

Этот параметр используется совместно с max_insert_block_size_rows и управляет формированием блоков в том же контексте. См. max_insert_block_size_rows для подробной информации о том, когда и как применяются эти параметры.

Возможные значения:

- Положительное целое число.
- 0 — параметр не участвует в формировании блоков.

## max_insert_delayed_streams_for_parallel_write \\{#max_insert_delayed_streams_for_parallel_write\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное число потоков (столбцов), для которых откладывается сброс окончательной части данных. По умолчанию — auto (100, если базовое хранилище поддерживает параллельную запись, например S3, и отключено в противном случае).

## max_insert_threads \\{#max_insert_threads\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество потоков, используемых для выполнения запроса `INSERT SELECT`.

Возможные значения:

- 0 (или 1) — `INSERT SELECT` без параллельного выполнения.
- Положительное целое число больше 1.

Значение по умолчанию в Cloud:

- `1` для узлов с 8 GiB памяти
- `2` для узлов с 16 GiB памяти
- `4` для более крупных узлов

Параллельный `INSERT SELECT` даёт эффект только в том случае, если часть `SELECT` выполняется параллельно, смотрите настройку [`max_threads`](#max_threads).
Более высокие значения приводят к увеличению потребления памяти.

## max_joined_block_size_bytes \\{#max_joined_block_size_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "4194304"},{"label": "Новая настройка"}]}]}/>

Максимальный размер блока в байтах для результата операции JOIN (если алгоритм JOIN поддерживает этот параметр). 0 означает отсутствие ограничения.

## max_joined_block_size_rows \\{#max_joined_block_size_rows\\}

<SettingsInfoBlock type="UInt64" default_value="65409" />

Максимальный размер блока для результата JOIN (если алгоритм соединения поддерживает его). 0 означает отсутствие ограничений.

## max_limit_for_vector_search_queries \\{#max_limit_for_vector_search_queries\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1000"},{"label": "Новая настройка"}]}]}/>

SELECT-запросы с LIMIT, превышающим это значение, не могут использовать индексы векторного сходства. Это помогает предотвратить переполнение памяти при использовании индексов векторного сходства.

## max_local_read_bandwidth \\{#max_local_read_bandwidth\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость локального чтения в байтах в секунду.

## max_local_write_bandwidth \\{#max_local_write_bandwidth\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость локальной записи в байтах в секунду.

## max_memory_usage \\{#max_memory_usage\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Значение по умолчанию в Cloud: зависит от объёма оперативной памяти на реплике.

Максимальный объём оперативной памяти, используемой для выполнения запроса на одном сервере.
Значение `0` означает отсутствие ограничения.

Этот параметр не учитывает объём доступной памяти или общий объём
памяти на машине. Ограничение применяется к одному запросу в рамках
одного сервера.

Вы можете использовать `SHOW PROCESSLIST`, чтобы увидеть текущее потребление памяти по каждому запросу.
Пиковое потребление памяти отслеживается для каждого запроса и записывается в лог.

Использование памяти не полностью отслеживается для состояний следующих агрегатных функций
из аргументов типа `String` и `Array`:

- `min`
- `max`
- `any`
- `anyLast`
- `argMin`
- `argMax`

Потребление памяти также ограничивается параметрами [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)
и [`max_server_memory_usage`](/operations/server-configuration-parameters/settings#max_server_memory_usage).

## max_memory_usage_for_user \{#max_memory_usage_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объем оперативной памяти, используемый для выполнения запросов пользователя на одном сервере. Ноль означает отсутствие ограничения.

По умолчанию объем не ограничен (`max_memory_usage_for_user = 0`).

См. также описание [`max_memory_usage`](/operations/settings/settings#max_memory_usage).

Например, если вы хотите установить `max_memory_usage_for_user` в 1000 байт для пользователя с именем `clickhouse_read`, вы можете использовать запрос

```sql
ALTER USER clickhouse_read SETTINGS max_memory_usage_for_user = 1000;
```

Вы можете убедиться, что всё работает, выйдя из клиента, снова войдя в него, а затем вызвав функцию `getSetting`:

```sql
SELECT getSetting('max_memory_usage_for_user');
```


## max_network_bandwidth \\{#max_network_bandwidth\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает скорость обмена данными по сети в байтах в секунду. Эта настройка применяется к каждому запросу.

Возможные значения:

- Положительное целое число.
- 0 — управление пропускной способностью отключено.

## max_network_bandwidth_for_all_users \\{#max_network_bandwidth_for_all_users\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает скорость обмена данными по сети, в байтах в секунду. Эта настройка применяется ко всем запросам, одновременно выполняющимся на сервере.

Возможные значения:

- Положительное целое число.
- 0 — контроль скорости передачи данных отключён.

## max_network_bandwidth_for_user \\{#max_network_bandwidth_for_user\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает скорость обмена данными по сети в байтах в секунду. Эта настройка применяется ко всем одновременно выполняемым запросам, запущенным одним пользователем.

Возможные значения:

- Положительное целое число.
- 0 — контроль скорости передачи данных отключён.

## max_network_bytes \\{#max_network_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает объём данных (в байтах), которые принимаются или передаются по сети при выполнении запроса. Этот параметр применяется к каждому отдельному запросу.

Возможные значения:

- Положительное целое число.
- 0 — контроль объёма данных отключён.

## max_number_of_partitions_for_independent_aggregation \\{#max_number_of_partitions_for_independent_aggregation\\}

<SettingsInfoBlock type="UInt64" default_value="128" />

Максимальное количество партиций в таблице для применения оптимизации

## max_os_cpu_wait_time_ratio_to_throw \\{#max_os_cpu_wait_time_ratio_to_throw\\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Значения настройки были изменены и задним числом применены в 25.4"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Максимальное соотношение между временем ожидания CPU в ОС (метрика OSCPUWaitMicroseconds) и временем занятости CPU (метрика OSCPUVirtualTimeMicroseconds), при котором запросы могут быть отклонены. Для вычисления вероятности используется линейная интерполяция между минимальным и максимальным значениями этого соотношения; при достижении этого значения вероятность равна 1.

## max_parallel_replicas \\{#max_parallel_replicas\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "По умолчанию используется до 1000 параллельных реплик."}]}]}/>

Максимальное число реплик для каждого сегмента при выполнении запроса.

Возможные значения:

- Положительное целое число.

**Дополнительная информация**

Эта настройка может приводить к различным результатам в зависимости от используемых настроек.

:::note
Эта настройка приведёт к некорректным результатам, если используются объединения (JOIN) или подзапросы и все таблицы не удовлетворяют определённым требованиям. Подробнее см. [Distributed Subqueries and max_parallel_replicas](/operations/settings/settings#max_parallel_replicas).
:::

### Параллельная обработка с использованием ключа `SAMPLE` \{#parallel-processing-using-sample-key\}

Запрос может выполняться быстрее, если он обрабатывается параллельно на нескольких серверах. Однако производительность запроса может снизиться в следующих случаях:

- Положение ключа выборки в ключе партиционирования не позволяет эффективно выполнять сканирование по диапазонам.
- Добавление ключа выборки в таблицу делает фильтрацию по другим столбцам менее эффективной.
- Ключ выборки представляет собой выражение, дорогое в вычислительном отношении.
- Распределение задержек в кластере имеет «длинный хвост», поэтому выполнение запроса на большем числе серверов увеличивает его общую задержку.

### Параллельная обработка с использованием [parallel_replicas_custom_key](#parallel_replicas_custom_key) \{#parallel-processing-using-parallel_replicas_custom_keyparallel_replicas_custom_key\}

Эта настройка полезна для любых реплицированных таблиц.

## max_parser_backtracks \\{#max_parser_backtracks\\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000000"},{"label": "Limiting the complexity of parsing"}]}]}/>

Максимальное число откатов парсера (сколько раз он пытается перебрать разные варианты в процессе рекурсивного нисходящего разбора).

## max_parser_depth \\{#max_parser_depth\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Ограничивает максимальную глубину рекурсии в рекурсивном нисходящем парсере. Позволяет контролировать размер стека вызовов.

Возможные значения:

- Положительное целое число.
- 0 — глубина рекурсии не ограничена.

## max_parsing_threads \\{#max_parsing_threads\\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "Добавлена отдельная настройка для управления количеством потоков при параллельном парсинге файлов"}]}]}/>

Максимальное количество потоков для парсинга данных во входных форматах, которые поддерживают параллельный парсинг. По умолчанию значение определяется автоматически.

## max_partition_size_to_drop \\{#max_partition_size_to_drop\\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

Ограничение на суммарный размер партиций, которые можно удалить в рамках одного запроса. Значение `0` означает, что вы можете удалять партиции без каких-либо ограничений.

Значение по умолчанию в Cloud: 1 ТБ.

:::note
Этот параметр запроса переопределяет одноимённый серверный параметр, см. [max_partition_size_to_drop](/operations/server-configuration-parameters/settings#max_partition_size_to_drop)
:::

## max_partitions_per_insert_block \\{#max_partitions_per_insert_block\\}

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.5"},{"label": "100"},{"label": "Добавлен лимит на количество партиций в одном блоке"}]}]}/>

Ограничивает максимальное количество партиций в одном вставляемом блоке;
если блок содержит слишком много партиций, генерируется исключение.

- Положительное целое число.
- `0` — неограниченное количество партиций.

**Подробности**

При вставке данных ClickHouse вычисляет количество партиций во
вставляемом блоке. Если количество партиций больше, чем
`max_partitions_per_insert_block`, ClickHouse либо записывает предупреждение в лог, либо генерирует
исключение в зависимости от значения `throw_on_max_partitions_per_insert_block`. Текст исключений:

> "Слишком много партиций для одного INSERT блока (`partitions_count` партиций, лимит " + toString(max_partitions) + ").
  Лимит контролируется настройкой 'max_partitions_per_insert_block'.
  Большое количество партиций — распространённое заблуждение. Это приведёт к серьёзному
  негативному влиянию на производительность, включая медленный запуск сервера, медленные запросы INSERT
  и медленные запросы SELECT. Рекомендуемое суммарное количество партиций для таблицы —
  менее 1000..10000. Обратите внимание, что партиционирование не предназначено для ускорения
  запросов SELECT (ключ ORDER BY сам по себе достаточен, чтобы сделать диапазонные запросы быстрыми).
  Партиции предназначены для манипуляций с данными (DROP PARTITION и т.д.)."

:::note
Эта настройка является защитным порогом, поскольку использование большого количества партиций — распространённое заблуждение.
:::

## max_partitions_to_read \\{#max_partitions_to_read\\}

<SettingsInfoBlock type="Int64" default_value="-1" />

Ограничивает максимальное количество партиций, к которым можно обратиться в одном запросе.

Значение этого параметра, заданное при создании таблицы, можно переопределить на уровне запроса.

Возможные значения:

- Положительное целое число
- `-1` — без ограничений (по умолчанию)

:::note
Вы также можете указать настройку MergeTree [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read) в параметрах таблицы.
:::

## max_parts_to_move \\{#max_parts_to_move\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1000"},{"label": "New setting"}]}]}/>

Ограничивает количество частей, которые могут быть перемещены в одном запросе. Значение 0 означает отсутствие ограничений.

## max_projection_rows_to_use_projection_index \\{#max_projection_rows_to_use_projection_index\\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

Если количество строк, которое предстоит прочитать из индекса PROJECTION, меньше или равно этому пороговому значению, ClickHouse попытается применить индекс PROJECTION при выполнении запроса.

## max_query_size \\{#max_query_size\\}

<SettingsInfoBlock type="UInt64" default_value="262144" />

Максимальное количество байт строки запроса, которую разбирает SQL-парсер.
Данные в секции VALUES запросов INSERT обрабатываются отдельным потоковым парсером (который потребляет O(1) RAM) и не ограничиваются этим параметром.

:::note
`max_query_size` нельзя задать внутри SQL-запроса (например, `SELECT now() SETTINGS max_query_size=10000`), потому что ClickHouse должен выделить буфер для разбора запроса, и размер этого буфера определяется настройкой `max_query_size`, которая должна быть настроена до выполнения запроса.
:::

## max_read_buffer_size \\{#max_read_buffer_size\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

Максимальный размер буфера при чтении из файловой системы.

## max_read_buffer_size_local_fs \\{#max_read_buffer_size_local_fs\\}

<SettingsInfoBlock type="UInt64" default_value="131072" />

Максимальный размер буфера для чтения с локальной файловой системы. Если установлено значение 0, используется значение max_read_buffer_size.

## max_read_buffer_size_remote_fs \\{#max_read_buffer_size_remote_fs\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер буфера для чтения из удалённой файловой системы. Если задано значение 0, будет использовано значение параметра max_read_buffer_size.

## max_recursive_cte_evaluation_depth \\{#max_recursive_cte_evaluation_depth\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1000"},{"label": "Максимальный предел глубины вычисления рекурсивного CTE"}]}]}/>

Максимальный предел глубины вычисления рекурсивного CTE

## max_remote_read_network_bandwidth \\{#max_remote_read_network_bandwidth\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость сетевого обмена данными при чтении, в байтах в секунду.

## max_remote_write_network_bandwidth \\{#max_remote_write_network_bandwidth\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость сетевого обмена данными при записи, в байтах в секунду.

## max_replica_delay_for_distributed_queries \\{#max_replica_delay_for_distributed_queries\\}

<SettingsInfoBlock type="UInt64" default_value="300" />

Отключает отстающие реплики для распределённых запросов. См. [Replication](../../engines/table-engines/mergetree-family/replication.md).

Задаёт время в секундах. Если отставание реплики больше или равно заданному значению, эта реплика не используется.

Возможные значения:

- Положительное целое число.
- 0 — отставание реплик не проверяется.

Чтобы запретить использование любой реплики с ненулевым отставанием, установите этот параметр в 1.

Используется при выполнении `SELECT` из distributed таблицы, которая ссылается на реплицируемые таблицы.

## max_result_bytes \\{#max_result_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает размер результата в байтах (в несжатом виде). Выполнение запроса будет остановлено после обработки очередного блока данных, если достигнут порог,
но последний блок результата не будет усечён, поэтому фактический размер результата может превышать порог.

**Особенности**

Для этого порога учитывается объём результата в памяти.
Даже если размер результата небольшой, он может ссылаться на более крупные структуры данных в памяти,
представляющие словари столбцов LowCardinality и арены столбцов AggregateFunction,
поэтому порог может быть превышен, несмотря на небольшой размер результата.

:::warning
Параметр достаточно низкоуровневый и должен использоваться с осторожностью
:::

## max_result_rows \\{#max_result_rows\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Значение по умолчанию в Cloud: `0`.

Ограничивает количество строк в результате. Ограничение также проверяется для подзапросов и на удалённых серверах при выполнении частей распределённого запроса.
Если значение равно `0`, ограничение не применяется.

Запрос будет остановлен после обработки блока данных, если достигнут порог, но
последний блок результата не будет обрезан, поэтому размер результата может
превышать пороговое значение.

## max_reverse_dictionary_lookup_cache_size_bytes \\{#max_reverse_dictionary_lookup_cache_size_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "104857600"},{"label": "Новая настройка. Максимальный размер в байтах кэша обратного поиска по словарю для одного запроса, используемого функцией `dictGetKeys`. Кэш хранит сериализованные кортежи ключей для каждого значения атрибута, чтобы избежать повторного сканирования словаря в рамках одного запроса."}]}]}/>

Максимальный размер в байтах кэша обратного поиска по словарю для одного запроса, используемого функцией `dictGetKeys`. Кэш хранит сериализованные кортежи ключей для каждого значения атрибута, чтобы избежать повторного сканирования словаря в рамках одного запроса. При достижении лимита записи вытесняются по алгоритму LRU. Установите значение 0, чтобы отключить кэширование.

## max_rows_in_distinct \\{#max_rows_in_distinct\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество уникальных строк при использовании DISTINCT.

## max_rows_in_join \\{#max_rows_in_join\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает количество строк в хеш-таблице, которая используется при выполнении операций JOIN.

Этот параметр применяется к операциям [SELECT ... JOIN](/sql-reference/statements/select/join)
и табличному движку [Join](/engines/table-engines/special/join).

Если запрос содержит несколько JOIN, ClickHouse проверяет этот параметр для каждого промежуточного результата.

При достижении лимита ClickHouse может выполнять различные действия. Используйте параметр
[`join_overflow_mode`](/operations/settings/settings#join_overflow_mode), чтобы выбрать нужное действие.

Возможные значения:

- Положительное целое число.
- `0` — Неограниченное количество строк.

## max_rows_in_set \\{#max_rows_in_set\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество строк для набора данных в условии `IN`, созданного из подзапроса.

## max_rows_in_set_to_optimize_join \\{#max_rows_in_set_to_optimize_join\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Отключена оптимизация join, так как она мешает оптимизации чтения по порядку"}]}]}/>

Максимальный размер Set, используемого для предварительной фильтрации присоединяемых таблиц по наборам строк друг друга перед выполнением join.

Возможные значения:

- 0 — отключить.
- Любое положительное целое число.

## max_rows_to_group_by \\{#max_rows_to_group_by\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество уникальных ключей, получаемых при агрегации. Этот параметр позволяет ограничить потребление памяти при агрегации.

Если при агрегации с использованием GROUP BY генерируется больше строк (уникальных ключей GROUP BY), чем указано, поведение будет определяться параметром `group_by_overflow_mode`, который по умолчанию равен `throw`, но также может быть переведён в режим приблизительного GROUP BY.

## max_rows_to_read \\{#max_rows_to_read\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество строк, которые может быть прочитано из таблицы при выполнении запроса.
Ограничение проверяется для каждого обрабатываемого фрагмента данных, применяется только к
самому глубокому табличному выражению, а при чтении с удалённого сервера проверяется только
на удалённом сервере.

## max_rows_to_read_leaf \\{#max_rows_to_read_leaf\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество строк, которые могут быть прочитаны из локальной таблицы на листовом узле (leaf‑ноде) при выполнении распределённого запроса. Хотя распределённые запросы могут отправлять несколько подзапросов к каждому сегменту (leaf), этот лимит будет проверяться только на стадии чтения на листовых узлах и игнорироваться на стадии слияния результатов на корневом узле.

Например, кластер состоит из 2 сегментов, и каждый сегмент содержит таблицу со 100 строками. Распределённый запрос, который должен прочитать все данные из обеих таблиц с настройкой `max_rows_to_read=150`, завершится с ошибкой, так как в сумме будет 200 строк. Запрос с `max_rows_to_read_leaf=150` будет выполнен успешно, поскольку листовые узлы прочитают максимум по 100 строк.

Ограничение проверяется для каждого обрабатываемого фрагмента данных.

:::note
Эта настройка нестабильна при `prefer_localhost_replica=1`.
:::

## max_rows_to_sort \\{#max_rows_to_sort\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество строк перед сортировкой. Это позволяет ограничить потребление памяти при сортировке.
Если при выполнении операции ORDER BY требуется обработать больше строк, чем указано,
поведение определяется параметром `sort_overflow_mode`, который по умолчанию имеет значение `throw`.

## max_rows_to_transfer \\{#max_rows_to_transfer\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер (в строках), который может быть передан на удалённый сервер или сохранён во временной таблице при выполнении конструкции GLOBAL IN/JOIN.

## max_sessions_for_user \{#max_sessions_for_user\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное число одновременных сеансов для каждого аутентифицированного пользователя сервера ClickHouse.

Пример:

```xml
<profiles>
    <single_session_profile>
        <max_sessions_for_user>1</max_sessions_for_user>
    </single_session_profile>
    <two_sessions_profile>
        <max_sessions_for_user>2</max_sessions_for_user>
    </two_sessions_profile>
    <unlimited_sessions_profile>
        <max_sessions_for_user>0</max_sessions_for_user>
    </unlimited_sessions_profile>
</profiles>
<users>
    <!-- User Alice can connect to a ClickHouse server no more than once at a time. -->
    <Alice>
        <profile>single_session_user</profile>
    </Alice>
    <!-- User Bob can use 2 simultaneous sessions. -->
    <Bob>
        <profile>two_sessions_profile</profile>
    </Bob>
    <!-- User Charles can use arbitrarily many of simultaneous sessions. -->
    <Charles>
        <profile>unlimited_sessions_profile</profile>
    </Charles>
</users>
```

Возможные значения:

* Положительное целое число
* `0` - бесконечное число одновременных сеансов (по умолчанию)


## max_size_to_preallocate_for_aggregation \\{#max_size_to_preallocate_for_aggregation\\}

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "Включает оптимизацию для больших таблиц."}]}, {"id": "row-2","items": [{"label": "22.12"},{"label": "100000000"},{"label": "Оптимизирует производительность"}]}]}/>

Максимальное количество элементов, для которых допускается предварительное выделение памяти во всех хеш-таблицах суммарно перед агрегацией

## max_size_to_preallocate_for_joins \\{#max_size_to_preallocate_for_joins\\}

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "100000000"},{"label": "Новая настройка."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "Включить оптимизацию для более крупных таблиц."}]}]}/>

Для какого количества элементов допускается предварительно выделить память во всех хеш-таблицах суммарно перед соедине

## max_streams_for_files_processing_in_cluster_functions \\{#max_streams_for_files_processing_in_cluster_functions\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Добавлена новая настройка, позволяющая ограничивать количество потоков для обработки файлов в *Cluster table functions"}]}]}/>

Если значение не равно нулю, ограничивает количество потоков, читающих данные из файлов в *Cluster table functions.

## max_streams_for_merge_tree_reading \\{#max_streams_for_merge_tree_reading\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если параметр не равен нулю, ограничивает количество потоков чтения для таблицы MergeTree.

## max_streams_multiplier_for_merge_tables \\{#max_streams_multiplier_for_merge_tables\\}

<SettingsInfoBlock type="Float" default_value="5" />

Запрашивать больше потоков при чтении из таблицы типа Merge. Потоки будут распределены между таблицами, которые использует таблица Merge. Это позволяет более равномерно распределять работу между потоками и особенно полезно, когда таблицы, входящие в Merge, различаются по размеру.

## max_streams_to_max_threads_ratio \\{#max_streams_to_max_threads_ratio\\}

<SettingsInfoBlock type="Float" default_value="1" />

Позволяет использовать больше источников, чем число потоков, чтобы более равномерно распределять работу между потоками. Предполагается, что это временное решение, так как в будущем можно будет сделать количество источников равным количеству потоков, но при этом для каждого источника динамически выбирать доступные ему задачи.

## max_subquery_depth \\{#max_subquery_depth\\}

<SettingsInfoBlock type="UInt64" default_value="100" />

Если запрос содержит более указанного числа вложенных подзапросов, будет выброшено
исключение.

:::tip
Это позволяет добавить проверку, защищающую пользователей вашего
кластера от написания чрезмерно сложных запросов.
:::

## max_table_size_to_drop \\{#max_table_size_to_drop\\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

Ограничение на удаление таблиц во время выполнения запроса. Значение `0` означает, что вы можете удалять любые таблицы без каких-либо ограничений.

Значение по умолчанию в Cloud: 1 TB.

:::note
Этот параметр запроса переопределяет одноимённый серверный параметр, см. [max_table_size_to_drop](/operations/server-configuration-parameters/settings#max_table_size_to_drop)
:::

## max_temporary_columns \\{#max_temporary_columns\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество временных столбцов, которые должны одновременно
храниться в оперативной памяти при выполнении запроса, включая константные столбцы. Если запрос в результате промежуточных вычислений генерирует в памяти больше временных столбцов, чем задано, генерируется исключение.

:::tip
Эта настройка полезна для предотвращения чрезмерно сложных запросов.
:::

Значение `0` означает отсутствие ограничения.

## max_temporary_data_on_disk_size_for_query \\{#max_temporary_data_on_disk_size_for_query\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объём данных во временных файлах на диске (в байтах) для всех
одновременно выполняемых запросов.

Возможные значения:

- Положительное целое число.
- `0` — без ограничений (по умолчанию)

## max_temporary_data_on_disk_size_for_user \\{#max_temporary_data_on_disk_size_for_user\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объём данных, потребляемый временными файлами на диске, в байтах для всех
одновременно выполняющихся пользовательских запросов.

Возможные значения:

- Положительное целое число.
- `0` — без ограничений (по умолчанию)

## max_temporary_non_const_columns \\{#max_temporary_non_const_columns\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Как и `max_temporary_columns`, максимальное число временных столбцов,
которые должны одновременно храниться в RAM при выполнении запроса, но при этом
без учета константных столбцов.

:::note
Константные столбцы образуются достаточно часто при выполнении запроса, но практически не требуют вычислительных ресурсов.
:::

## max_threads \\{#max_threads\\}

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

Максимальное количество потоков обработки запроса, за исключением потоков для получения данных с удалённых серверов (см. параметр ['max_distributed_connections'](/operations/settings/settings#max_distributed_connections)).

Этот параметр применяется к потокам, которые параллельно выполняют одни и те же стадии конвейера обработки запроса.
Например, при чтении из таблицы, если возможно параллельно вычислять выражения с функциями, фильтровать с помощью `WHERE` и выполнять предварительную агрегацию для `GROUP BY`, используя по крайней мере количество потоков, равное `max_threads`, то будет задействовано ровно `max_threads` потоков.

Для запросов, которые завершаются быстро из‑за LIMIT, можно задать меньшее значение `max_threads`.
Например, если необходимое количество записей находится в каждом блоке и `max_threads = 8`, то будет прочитано 8 блоков, хотя было бы достаточно прочитать только один.
Чем меньше значение `max_threads`, тем меньше потребление памяти.

По умолчанию значение настройки `max_threads` соответствует количеству аппаратных потоков, доступных ClickHouse.
Без SMT (например, Intel HyperThreading) это соответствует числу ядер CPU.

Для пользователей ClickHouse Cloud значение по умолчанию будет отображаться как `auto(N)`, где N совпадает с размером vCPU вашего сервиса, например 2vCPU/8GiB, 4vCPU/16GiB и т. д.
Список всех размеров сервисов см. на вкладке настроек в консоли ClickHouse Cloud.

## max_threads_for_indexes \\{#max_threads_for_indexes\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество потоков, используемых для обработки индексов.

## max_untracked_memory \\{#max_untracked_memory\\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

Небольшие выделения и освобождения памяти группируются в локальной для потока переменной и отслеживаются или профилируются только тогда, когда их общий объем (по абсолютному значению) становится больше указанного значения. Если это значение больше, чем `memory_profiler_step`, оно будет фактически уменьшено до `memory_profiler_step`.

## memory_overcommit_ratio_denominator \\{#memory_overcommit_ratio_denominator\\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "Включение функции overcommit памяти по умолчанию"}]}]}/>

Он задаёт мягкий лимит памяти, который применяется после достижения жёсткого лимита на глобальном уровне.
Это значение используется для вычисления коэффициента overcommit памяти для запроса.
Ноль означает, что запрос будет пропущен.
Подробнее см. в разделе [memory overcommit](memory-overcommit.md).

## memory_overcommit_ratio_denominator_for_user \\{#memory_overcommit_ratio_denominator_for_user\\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "Включает механизм оверкоммита памяти по умолчанию"}]}]}/>

Этот параметр задаёт мягкий лимит памяти, когда на уровне пользователя уже достигнут жёсткий лимит.
Это значение используется для вычисления коэффициента оверкоммита для запроса.
Нулевое значение означает, что запрос будет пропущен.
Подробнее см. в разделе [оверкоммит памяти](memory-overcommit.md).

## memory_profiler_sample_max_allocation_size \\{#memory_profiler_sample_max_allocation_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Собирать случайные выделения памяти размера, меньшего или равного указанному значению, с вероятностью, равной `memory_profiler_sample_probability`. 0 означает отключение. Рекомендуется установить `max_untracked_memory` в 0, чтобы этот порог работал ожидаемым образом.

## memory_profiler_sample_min_allocation_size \\{#memory_profiler_sample_min_allocation_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Собирать случайные выделения памяти размером не меньше заданного значения с вероятностью, равной `memory_profiler_sample_probability`. 0 — отключено. Возможно, вам потребуется установить параметр `max_untracked_memory` в 0, чтобы этот порог работал как ожидается.

## memory_profiler_sample_probability \\{#memory_profiler_sample_probability\\}

<SettingsInfoBlock type="Float" default_value="0" />

Собирает случайные операции выделения и освобождения памяти и записывает их в таблицу system.trace_log с trace_type 'MemorySample'. Вероятность применяется к каждой операции alloc/free независимо от размера выделения (можно изменить с помощью `memory_profiler_sample_min_allocation_size` и `memory_profiler_sample_max_allocation_size`). Обратите внимание, что семплирование производится только тогда, когда объём неотслеживаемой памяти превышает значение 'max_untracked_memory'. Для более детализированного семплирования вы можете установить значение 'max_untracked_memory' равным 0.

## memory_profiler_step \\{#memory_profiler_step\\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

Устанавливает шаг профилировщика памяти. Каждый раз, когда объём памяти, потребляемый запросом, превышает очередной шаг в байтах, профилировщик памяти собирает стек-трейс выделения и записывает его в [trace_log](/operations/system-tables/trace_log).

Возможные значения:

- Положительное целое число байт.

- 0 — для отключения профилировщика памяти.

## memory_tracker_fault_probability \\{#memory_tracker_fault_probability\\}

<SettingsInfoBlock type="Float" default_value="0" />

Для тестирования `exception safety` — генерировать исключение при каждом выделении памяти с указанной вероятностью.

## memory_usage_overcommit_max_wait_microseconds \\{#memory_usage_overcommit_max_wait_microseconds\\}

<SettingsInfoBlock type="UInt64" default_value="5000000" />

Максимальное время, в течение которого поток будет ждать, пока память не будет освобождена, в случае memory overcommit на уровне пользователя.
Если время ожидания истекло и память не была освобождена, генерируется исключение.
Подробнее см. в разделе [memory overcommit](memory-overcommit.md).

## merge_table_max_tables_to_look_for_schema_inference \\{#merge_table_max_tables_to_look_for_schema_inference\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "A new setting"}]}]}/>

При создании таблицы `Merge` без явной схемы или при использовании табличной функции `merge` схема определяется как объединение не более чем указанного количества подходящих таблиц.
Если таблиц больше, чем это количество, схема будет определена по первым таблицам в количестве, указанном в этом параметре.

## merge_tree_coarse_index_granularity \\{#merge_tree_coarse_index_granularity\\}

<SettingsInfoBlock type="UInt64" default_value="8" />

При поиске данных ClickHouse проверяет метки данных в файле индекса. Если ClickHouse обнаруживает, что необходимые ключи находятся в некотором диапазоне, он делит этот диапазон на `merge_tree_coarse_index_granularity` поддиапазонов и рекурсивно ищет необходимые ключи в них.

Возможные значения:

- Любое положительное чётное целое число.

## merge_tree_compact_parts_min_granules_to_multibuffer_read \\{#merge_tree_compact_parts_min_granules_to_multibuffer_read\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="16" />

Действует только в ClickHouse Cloud. Количество гранул в полосе компактной части таблиц MergeTree, при котором используется multibuffer reader, поддерживающий параллельное чтение и предвыборку данных (prefetch). При чтении из удалённой файловой системы использование multibuffer reader увеличивает количество запросов чтения.

## merge_tree_determine_task_size_by_prewhere_columns \\{#merge_tree_determine_task_size_by_prewhere_columns\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет, использовать ли только размер столбцов в PREWHERE для определения размера задачи чтения.

## merge_tree_max_bytes_to_use_cache \\{#merge_tree_max_bytes_to_use_cache\\}

<SettingsInfoBlock type="UInt64" default_value="2013265920" />

Если ClickHouse должен прочитать больше, чем `merge_tree_max_bytes_to_use_cache` байт в одном запросе, он не использует кэш несжатых блоков.

Кэш несжатых блоков хранит данные, извлечённые для запросов. ClickHouse использует этот кэш для ускорения ответов на повторяющиеся небольшие запросы. Эта настройка защищает кэш от засорения запросами, читающими большой объём данных. Серверный параметр [uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) определяет размер кэша несжатых блоков.

Возможные значения:

- Любое положительное целое число.

## merge_tree_max_rows_to_use_cache \\{#merge_tree_max_rows_to_use_cache\\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Если ClickHouse должен прочитать больше, чем `merge_tree_max_rows_to_use_cache` строк в одном запросе, он не использует кэш несжатых блоков.

Кэш несжатых блоков хранит данные, извлечённые для запросов. ClickHouse использует этот кэш для ускорения ответов на повторяющиеся небольшие запросы. Этот параметр защищает кэш от «засорения» запросами, читающими большие объёмы данных. Параметр сервера [uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) задаёт размер кэша несжатых блоков.

Возможные значения:

- Любое положительное целое число.

## merge_tree_min_bytes_for_concurrent_read \\{#merge_tree_min_bytes_for_concurrent_read\\}

<SettingsInfoBlock type="UInt64" default_value="251658240" />

Если объём данных, считываемых из одного файла таблицы с движком [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md), превышает `merge_tree_min_bytes_for_concurrent_read`, ClickHouse пытается читать этот файл параллельно в нескольких потоках.

Возможное значение:

- Положительное целое число.

## merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem \\{#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Настройка устарела"}]}]}/>

Минимальное количество байт, которое нужно прочитать из одного файла, прежде чем движок [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) сможет распараллелить чтение при чтении с удалённой файловой системы. Мы не рекомендуем использовать эту настройку.

Возможные значения:

- Положительное целое число.

## merge_tree_min_bytes_for_seek \\{#merge_tree_min_bytes_for_seek\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если расстояние между двумя блоками данных, которые нужно прочитать из одного файла, меньше `merge_tree_min_bytes_for_seek` байт, ClickHouse последовательно читает диапазон файла, содержащий оба блока, избегая лишних операций позиционирования (seek).

Возможные значения:

- Любое положительное целое число.

## merge_tree_min_bytes_per_task_for_remote_reading \\{#merge_tree_min_bytes_per_task_for_remote_reading\\}

**Псевдонимы**: `filesystem_prefetch_min_bytes_for_single_read_task`

<SettingsInfoBlock type="UInt64" default_value="2097152" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "2097152"},{"label": "Значение приведено к одному с `filesystem_prefetch_min_bytes_for_single_read_task`"}]}]}/>

Минимальное количество байт, считываемое одной задачей.

## merge_tree_min_read_task_size \\{#merge_tree_min_read_task_size\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "8"},{"label": "Новая настройка"}]}]}/>

Строгое нижнее ограничение на размер задачи (даже когда число гранул мало и число доступных потоков велико, мы не будем создавать задачи меньшего размера)

## merge_tree_min_rows_for_concurrent_read \\{#merge_tree_min_rows_for_concurrent_read\\}

<SettingsInfoBlock type="UInt64" default_value="163840" />

Если количество строк, подлежащих чтению из файла таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md), превышает `merge_tree_min_rows_for_concurrent_read`, ClickHouse пытается выполнять параллельное чтение из этого файла в нескольких потоках.

Возможные значения:

- Положительное целое число.

## merge_tree_min_rows_for_concurrent_read_for_remote_filesystem \\{#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Setting is deprecated"}]}]}/>

Минимальное количество строк, которое необходимо прочитать из одного файла до того, как движок [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) сможет выполнять параллельное чтение при работе с удалённой файловой системой. Мы не рекомендуем использовать эту настройку.

Возможные значения:

- Положительное целое число.

## merge_tree_min_rows_for_seek \\{#merge_tree_min_rows_for_seek\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если расстояние между двумя блоками данных, которые должны быть прочитаны из одного файла, меньше `merge_tree_min_rows_for_seek` строк, то ClickHouse не выполняет переход по файлу, а читает данные последовательно.

Возможные значения:

- Любое положительное целое число.

## merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability \\{#merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability\\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Для тестирования `PartsSplitter`: при каждом чтении из MergeTree с указанной вероятностью разделяет диапазоны чтения на пересекающиеся и непересекающиеся."}]}]}/>

Для тестирования `PartsSplitter`: при каждом чтении из MergeTree с указанной вероятностью разделяет диапазоны чтения на пересекающиеся и непересекающиеся.

## merge_tree_storage_snapshot_sleep_ms \\{#merge_tree_storage_snapshot_sleep_ms\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Новая настройка для отладки согласованности snapshot'а хранилища при выполнении запроса"}]}]}/>

Добавляет искусственную задержку (в миллисекундах) при создании snapshot'а хранилища для таблиц MergeTree.
Используется только для целей тестирования и отладки.

Возможные значения:

- 0 — без задержки (по умолчанию)
- N — задержка в миллисекундах

## merge_tree_use_const_size_tasks_for_remote_reading \\{#merge_tree_use_const_size_tasks_for_remote_reading\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать ли задачи фиксированного размера при чтении из удалённой таблицы.

## merge_tree_use_deserialization_prefixes_cache \\{#merge_tree_use_deserialization_prefixes_cache\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Новая настройка для управления использованием кэша префиксов десериализации в MergeTree"}]}]}/>

Включает кэширование метаданных столбцов из префиксов файлов при чтении с удалённых дисков в MergeTree.

## merge_tree_use_prefixes_deserialization_thread_pool \\{#merge_tree_use_prefixes_deserialization_thread_pool\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Новый параметр, управляющий использованием пула потоков для параллельной десериализации префиксов в MergeTree"}]}]}/>

Включает использование пула потоков для параллельной десериализации префиксов при чтении широких (Wide) частей в MergeTree. Размер этого пула потоков контролируется серверным параметром `max_prefixes_deserialization_thread_pool_size`.

## merge_tree_use_v1_object_and_dynamic_serialization \\{#merge_tree_use_v1_object_and_dynamic_serialization\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "Добавлена новая версия сериализации V2 для типов JSON и Dynamic"}]}]}/>

При включении в таблицах MergeTree будет использоваться версия V1 сериализации типов JSON и Dynamic вместо V2. Изменение этого параметра вступает в силу только после перезапуска сервера.

## metrics_perf_events_enabled \\{#metrics_perf_events_enabled\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, некоторые perf-события будут измеряться во время выполнения запросов.

## metrics_perf_events_list \\{#metrics_perf_events_list\\}

Список метрик `perf`, перечисленных через запятую, которые будут измеряться во время выполнения запросов. Пустое значение означает, что учитываются все события. Доступные события см. в `PerfEventInfo` в исходных кодах.

## min_bytes_to_use_direct_io \\{#min_bytes_to_use_direct_io\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный объем данных, необходимый для использования прямого ввода-вывода (direct I/O) при обращении к диску хранилища.

ClickHouse использует эту настройку при чтении данных из таблиц. Если общий объем всех данных, которые нужно прочитать, превышает `min_bytes_to_use_direct_io` байт, то ClickHouse читает данные с диска хранилища с опцией `O_DIRECT`.

Возможные значения:

- 0 — прямой ввод-вывод (Direct I/O) отключен.
- Положительное целое число.

## min_bytes_to_use_mmap_io \\{#min_bytes_to_use_mmap_io\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Это экспериментальная настройка. Задаёт минимальный объём данных для чтения больших файлов без копирования из ядра в пространство пользователя. Рекомендуемый порог — около 64 МБ, так как [mmap/munmap](https://en.wikipedia.org/wiki/Mmap) работают медленно. Имеет смысл только для крупных файлов и даёт эффект, только если данные уже находятся в page cache.

Возможные значения:

- Положительное целое число.
- 0 — крупные файлы читаются только с копированием данных из ядра в пространство пользователя.

## min_chunk_bytes_for_parallel_parsing \\{#min_chunk_bytes_for_parallel_parsing\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="10485760" />

- Тип: беззнаковое целое число (unsigned int)
- Значение по умолчанию: 1 МиБ

Минимальный размер фрагмента в байтах, который каждый поток будет обрабатывать параллельно.

## min_compress_block_size \\{#min_compress_block_size\\}

<SettingsInfoBlock type="UInt64" default_value="65536" />

Для таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Чтобы уменьшить задержку при обработке запросов, блок сжимается при записи следующей метки, если его размер не менее `min_compress_block_size`. По умолчанию — 65 536.

Фактический размер блока, если объём несжатых данных меньше `max_compress_block_size`, не может быть меньше этого значения и не может быть меньше объёма данных для одной метки.

Рассмотрим пример. Предположим, что при создании таблицы `index_granularity` был установлен в 8192.

Мы записываем столбец типа UInt32 (4 байта на значение). При записи 8192 строк суммарный объём данных составит 32 КБ. Поскольку min_compress_block_size = 65 536, сжатый блок будет формироваться на каждые две метки.

Мы записываем столбец URL типа String (средний размер 60 байт на значение). При записи 8192 строк средний объём данных будет чуть меньше 500 КБ. Так как это больше 65 536, сжатый блок будет формироваться для каждой метки. В этом случае при чтении данных с диска в диапазоне одной метки избыточные данные не будут разжаты.

:::note
Это настройка для экспертов, и вам не следует изменять её, если вы только начинаете работать с ClickHouse.
:::

## min_count_to_compile_aggregate_expression \\{#min_count_to_compile_aggregate_expression\\}

<SettingsInfoBlock type="UInt64" default_value="3" />

Минимальное количество идентичных агрегатных выражений, необходимых для запуска JIT-компиляции. Работает только при включённой настройке [compile_aggregate_expressions](#compile_aggregate_expressions).

Возможные значения:

- Положительное целое число.
- 0 — идентичные агрегатные выражения всегда JIT-компилируются.

## min_count_to_compile_expression \\{#min_count_to_compile_expression\\}

<SettingsInfoBlock type="UInt64" default_value="3" />

Минимальное количество выполнений одного и того же выражения, после которого оно компилируется.

## min_count_to_compile_sort_description \\{#min_count_to_compile_sort_description\\}

<SettingsInfoBlock type="UInt64" default_value="3" />

Количество одинаковых описаний сортировки, необходимое для выполнения их JIT-компиляции

## min_execution_speed \\{#min_execution_speed\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальная скорость выполнения, измеряемая в строках в секунду. Проверяется на каждом блоке данных, когда истекает значение параметра [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed). Если скорость выполнения ниже, выбрасывается исключение.

## min_execution_speed_bytes \\{#min_execution_speed_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество байт в секунду, обрабатываемых при выполнении. Проверяется на каждом блоке данных по истечении времени, заданного настройкой
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed).
Если скорость выполнения ниже, выбрасывается исключение.

## min_external_table_block_size_bytes \\{#min_external_table_block_size_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="268402944" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268402944"},{"label": "Объединяет блоки, передаваемые во внешнюю таблицу, в блоки указанного размера в байтах, если исходные блоки слишком малы."}]}]}/>

Объединяет блоки, передаваемые во внешнюю таблицу, в блоки указанного размера в байтах, если исходные блоки слишком малы.

## min_external_table_block_size_rows \\{#min_external_table_block_size_rows\\}

<SettingsInfoBlock type="UInt64" default_value="1048449" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1048449"},{"label": "Сжимает блоки, передаваемые во внешнюю таблицу, до указанного размера в строках, если их размер меньше указанного"}]}]}/>

Сжимает блоки, передаваемые во внешнюю таблицу, до указанного размера в строках, если их размер меньше указанного.

## min_free_disk_bytes_to_perform_insert \\{#min_free_disk_bytes_to_perform_insert\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Резервирует некоторый объем свободного дискового пространства при вставках, но при этом по-прежнему допускает временную запись."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Минимальный объем свободного дискового пространства в байтах, необходимый для выполнения вставки.

## min_free_disk_ratio_to_perform_insert \\{#min_free_disk_ratio_to_perform_insert\\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Поддерживать некоторый объём свободного дискового пространства, выраженный как отношение к общему дисковому пространству, для вставок, при этом по‑прежнему допуская временную запись."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Минимальная доля свободного дискового пространства, необходимая для выполнения операции вставки.

## min_free_disk_space_for_temporary_data \\{#min_free_disk_space_for_temporary_data\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный объем дискового пространства, который необходимо оставлять свободным при записи временных данных, используемых во внешней сортировке и агрегации.

## min_hit_rate_to_use_consecutive_keys_optimization \\{#min_hit_rate_to_use_consecutive_keys_optimization\\}

<SettingsInfoBlock type="Float" default_value="0.5" />

Минимальный коэффициент попаданий в кэш, при котором оптимизация последовательных ключей при агрегации остаётся включённой.

## min_insert_block_size_bytes \\{#min_insert_block_size_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="268402944" />

Минимальный размер блока (в байтах), формируемого при вставке в таблицу.

Этот параметр работает совместно с min_insert_block_size_rows и управляет формированием блоков в тех же контекстах (разбор формата и операции INSERT). См. min_insert_block_size_rows для подробной информации о том, когда и как применяются эти параметры.

Возможные значения:

- Положительное целое число.
- 0 — параметр не участвует в формировании блоков.

## min_insert_block_size_bytes_for_materialized_views \\{#min_insert_block_size_bytes_for_materialized_views\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает минимальный объём данных в байтах в блоке, который может быть вставлен в таблицу с помощью запроса `INSERT`. Блоки меньшего размера объединяются в более крупные. Этот параметр применяется только к блокам, вставляемым в [materialized view](../../sql-reference/statements/create/view.md). Настраивая этот параметр, можно контролировать объединение блоков при вставке в materialized view и избежать избыточного использования памяти.

Возможные значения:

- Любое положительное целое число.
- 0 — объединение отключено.

**См. также**

- [min_insert_block_size_bytes](#min_insert_block_size_bytes)

## min_insert_block_size_rows \\{#min_insert_block_size_rows\\}

<SettingsInfoBlock type="UInt64" default_value="1048449" />

Минимальный размер блоков (в строках), формируемых для вставки в таблицу.

Этот параметр управляет формированием блоков в двух контекстах:

1. Разбор форматов: когда сервер разбирает построчные входные форматы (CSV, TSV, JSONEachRow и т. д.) из любого интерфейса (HTTP, clickhouse-client с inline-данными, gRPC, протокол PostgreSQL wire), он использует этот параметр, чтобы определить, когда нужно сформировать и передать блок.  
Примечание: при использовании clickhouse-client или clickhouse-local для чтения из файла сам клиент разбирает данные, и этот параметр применяется на стороне клиента.
2. Операции INSERT: во время запросов `INSERT...SELECT`, а также когда данные проходят через materialized views, блоки укрупняются на основе этого параметра перед записью в хранилище.

Блок при разборе форматов формируется и передаётся, когда выполняется одно из условий:

- Минимальные пороги (И): достигнуты оба — min_insert_block_size_rows И min_insert_block_size_bytes
- Максимальные пороги (ИЛИ): достигнут один из — max_insert_block_size ИЛИ max_insert_block_size_bytes

Блоки меньшего размера при операциях вставки объединяются в более крупные и формируются, когда достигается один из порогов: min_insert_block_size_rows или min_insert_block_size_bytes.

Возможные значения:

- Положительное целое число.
- 0 — параметр не участвует в формировании блоков.

## min_insert_block_size_rows_for_materialized_views \\{#min_insert_block_size_rows_for_materialized_views\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Задает минимальное количество строк в блоке, который может быть вставлен в таблицу `INSERT`-запросом. Блоки меньшего размера объединяются в более крупные блоки. Этот параметр применяется только к блокам, вставляемым в [materialized view](../../sql-reference/statements/create/view.md). Настраивая этот параметр, вы управляете объединением блоков при записи в materialized view и избегаете чрезмерного расхода памяти.

Возможные значения:

- Любое положительное целое число.
- 0 — объединение отключено.

**См. также**

- [min_insert_block_size_rows](#min_insert_block_size_rows)

## min_joined_block_size_bytes \\{#min_joined_block_size_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "524288"},{"label": "Новая настройка."}]}]}/>

Минимальный размер блока в байтах для входных и выходных блоков JOIN (если алгоритм JOIN это поддерживает). Маленькие блоки будут объединены. Значение 0 означает отсутствие ограничений.

## min_joined_block_size_rows \\{#min_joined_block_size_rows\\}

<SettingsInfoBlock type="UInt64" default_value="65409" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "65409"},{"label": "New setting."}]}]}/>

Минимальный размер блока в строках для входных и выходных блоков JOIN (если алгоритм JOIN это поддерживает). Мелкие блоки будут объединены. 0 означает отсутствие ограничений.

## min_os_cpu_wait_time_ratio_to_throw \\{#min_os_cpu_wait_time_ratio_to_throw\\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Значения настройки были изменены и задним числом перенесены в 25.4"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Минимальное отношение между временем ожидания CPU в ОС (метрика OSCPUWaitMicroseconds) и временем занятости (метрика OSCPUVirtualTimeMicroseconds), при котором начинается рассмотрение отклонения запросов. Для расчёта вероятности отклонения используется линейная интерполяция между минимальным и максимальным отношением; в этой точке вероятность равна 0.

## min_outstreams_per_resize_after_split \\{#min_outstreams_per_resize_after_split\\}

<SettingsInfoBlock type="UInt64" default_value="24" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "24"},{"label": "New setting."}]}]}/>

Указывает минимальное количество выходных потоков процессора `Resize` или `StrictResize` после выполнения операции разделения при построении конвейера. Если результирующее количество потоков меньше этого значения, операция разделения не будет выполнена.

### Что такое узел Resize \{#what-is-a-resize-node\}

Узел `Resize` — это процессор в конвейере обработки запросов, который регулирует количество потоков данных, проходящих через конвейер. Он может как увеличивать, так и уменьшать число потоков, чтобы сбалансировать нагрузку между несколькими рабочими потоками или процессорами. Например, если запросу требуется большая степень параллелизма, узел `Resize` может разделить один поток на несколько. И наоборот, он может объединить несколько потоков в меньшее число, чтобы консолидировать обработку данных.

Узел `Resize` обеспечивает равномерное распределение данных по потокам, сохраняя структуру блоков данных. Это помогает оптимизировать использование ресурсов и повысить производительность выполнения запроса.

### Почему узел `Resize` нужно разделить \{#why-the-resize-node-needs-to-be-split\}

Во время выполнения конвейера за мьютекс ExecutingGraph::Node::status_mutex централизованного узла `Resize` идёт серьёзная конкуренция, особенно в средах с большим количеством ядер, что приводит к следующему:

1. Увеличивается латентность ExecutingGraph::updateNode, что напрямую влияет на производительность запроса.
2. Чрезмерное количество циклов CPU тратится на ожидание спин-блокировки (native_queued_spin_lock_slowpath), что снижает эффективность.
3. Снижается загрузка CPU, что ограничивает параллелизм и пропускную способность.

### Как выполняется разбиение узла Resize \{#how-the-resize-node-gets-split\}

1. Проверяется количество выходных потоков, чтобы убедиться, что разбиение можно выполнить: выходные потоки каждого процессора разбиения должны удовлетворять пороговому значению `min_outstreams_per_resize_after_split` или превышать его.
2. Узел `Resize` разбивается на несколько меньших узлов `Resize` с одинаковым количеством портов, каждый из которых обрабатывает подмножество входных и выходных потоков.
3. Каждая группа обрабатывается независимо, что снижает конкуренцию за блокировку.

### Разделение узла Resize с произвольными входами/выходами \{#splitting-resize-node-with-arbitrary-inputsoutputs\}

В некоторых случаях, когда число входов/выходов не кратно количеству узлов `Resize`, на которые выполняется разделение, часть входов подключается к `NullSource`, а часть выходов — к `NullSink`. Это позволяет выполнить разделение, не нарушая общий поток данных.

### Назначение настройки \{#purpose-of-the-setting\}

Настройка `min_outstreams_per_resize_after_split` гарантирует, что разбиение узлов `Resize` действительно осмысленно и не приводит к появлению слишком малого числа потоков, что может вызвать неэффективную параллельную обработку. Обеспечивая минимальное количество выходных потоков, эта настройка помогает поддерживать баланс между параллелизмом и накладными расходами, оптимизируя выполнение запроса в сценариях, связанных с разбиением и слиянием потоков.

### Отключение настройки \{#disabling-the-setting\}

Чтобы отключить разбиение узлов `Resize`, установите значение этой настройки в 0. Это предотвратит разбиение узлов `Resize` при генерации конвейера и позволит им сохранять свою исходную структуру без деления на более мелкие узлы.

## min_table_rows_to_use_projection_index \\{#min_table_rows_to_use_projection_index\\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

Если предполагаемое количество строк, читаемых из таблицы, больше или равно этому пороговому значению, ClickHouse попытается использовать индекс проекции при выполнении запроса.

## mongodb_throw_on_unsupported_query \\{#mongodb_throw_on_unsupported_query\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "1"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting."}]}]}/>

Если параметр включен, таблицы MongoDB будут возвращать ошибку, когда не удаётся построить запрос MongoDB. В противном случае ClickHouse считывает всю таблицу и обрабатывает её локально. Этот параметр не применяется, когда `allow_experimental_analyzer=0`.

## move_all_conditions_to_prewhere \\{#move_all_conditions_to_prewhere\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Перемещать все применимые условия из WHERE в PREWHERE

## move_primary_key_columns_to_end_of_prewhere \\{#move_primary_key_columns_to_end_of_prewhere\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Перемещает условия PREWHERE, содержащие столбцы первичного ключа, в конец цепочки AND. Скорее всего, эти условия учитываются при анализе первичного ключа и поэтому не будут существенно влиять на фильтрацию PREWHERE.

## multiple_joins_try_to_keep_original_names \\{#multiple_joins_try_to_keep_original_names\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Не добавлять псевдонимы в список выражений верхнего уровня при переписывании запросов с несколькими JOIN

## mutations_execute_nondeterministic_on_initiator \\{#mutations_execute_nondeterministic_on_initiator\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение `true`, константные недетерминированные функции (например, функция `now()`) выполняются на инициаторе запроса и подставляются как литералы в запросы `UPDATE` и `DELETE`. Это помогает сохранять синхронизацию данных на репликах при выполнении мутаций с константными недетерминированными функциями. Значение по умолчанию: `false`.

## mutations_execute_subqueries_on_initiator \\{#mutations_execute_subqueries_on_initiator\\}

<SettingsInfoBlock type="Bool" default_value="0" />

При значении `true` скалярные подзапросы выполняются на сервере-инициаторе запроса и заменяются литералами в запросах `UPDATE` и `DELETE`. Значение по умолчанию: `false`.

## mutations_max_literal_size_to_replace \\{#mutations_max_literal_size_to_replace\\}

<SettingsInfoBlock type="UInt64" default_value="16384" />

Максимальный размер сериализованного литерала в байтах, который будет заменён в запросах `UPDATE` и `DELETE`. Применяется только в том случае, если включена хотя бы одна из двух настроек выше. Значение по умолчанию: 16384 (16 KiB).

## mutations_sync \\{#mutations_sync\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Позволяет выполнять запросы `ALTER TABLE ... UPDATE|DELETE|MATERIALIZE INDEX|MATERIALIZE PROJECTION|MATERIALIZE COLUMN|MATERIALIZE STATISTICS` ([мутации](../../sql-reference/statements/alter/index.md/#mutations)) синхронно.

Возможные значения:

| Value | Description                                                                                                                                           |
|-------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | Мутации выполняются асинхронно.                                                                                                                       |
| `1`   | Запрос ожидает завершения всех мутаций на текущем сервере.                                                                                            |
| `2`   | Запрос ожидает завершения всех мутаций на всех репликах (если они есть).                                                                              |
| `3`   | Запрос ожидает завершения мутаций только на активных репликах. Поддерживается только для `SharedMergeTree`. Для `ReplicatedMergeTree` ведёт себя так же, как `mutations_sync = 2`.|

## mysql_datatypes_support_level \\{#mysql_datatypes_support_level\\}

Определяет, как типы MySQL преобразуются в соответствующие типы ClickHouse. Представляет собой список значений, разделённый запятыми, в любой комбинации `decimal`, `datetime64`, `date2Date32` или `date2String`.

- `decimal`: преобразовывать типы `NUMERIC` и `DECIMAL` в `Decimal`, когда это допускает точность.
- `datetime64`: преобразовывать типы `DATETIME` и `TIMESTAMP` в `DateTime64` вместо `DateTime`, когда точность не равна `0`.
- `date2Date32`: преобразовывать `DATE` в `Date32` вместо `Date`. Имеет приоритет над `date2String`.
- `date2String`: преобразовывать `DATE` в `String` вместо `Date`. Переопределяется параметром `datetime64`.

## mysql_map_fixed_string_to_text_in_show_columns \\{#mysql_map_fixed_string_to_text_in_show_columns\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Уменьшение объёма настроек для подключения ClickHouse к BI-инструментам."}]}]}/>

Если параметр включён, тип данных ClickHouse [FixedString](../../sql-reference/data-types/fixedstring.md) будет отображаться как `TEXT` в [SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns).

Имеет эффект только при подключении через wire-протокол MySQL.

- 0 - Использовать `BLOB`.
- 1 - Использовать `TEXT`.

## mysql_map_string_to_text_in_show_columns \\{#mysql_map_string_to_text_in_show_columns\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Снижает трудозатраты на настройку подключения ClickHouse к BI-инструментам."}]}]}/>

При включении настройки тип данных ClickHouse [String](../../sql-reference/data-types/string.md) будет отображаться как `TEXT` в команде [SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns).

Действует только при подключении через протокол MySQL (MySQL wire protocol).

- 0 - использовать `BLOB`;
- 1 - использовать `TEXT`.

## mysql_max_rows_to_insert \\{#mysql_max_rows_to_insert\\}

<SettingsInfoBlock type="UInt64" default_value="65536" />

Максимальное количество строк при пакетной вставке в MySQL для движка хранения MySQL

## network_compression_method \\{#network_compression_method\\}

<SettingsInfoBlock type="String" default_value="LZ4" />

Кодек, используемый для сжатия обмена данными между клиентом и сервером, а также между серверами.

Возможные значения:

- `NONE` — без сжатия.
- `LZ4` — использовать кодек LZ4.
- `LZ4HC` — использовать кодек LZ4HC.
- `ZSTD` — использовать кодек ZSTD.

**См. также**

- [network_zstd_compression_level](#network_zstd_compression_level)

## network_zstd_compression_level \\{#network_zstd_compression_level\\}

<SettingsInfoBlock type="Int64" default_value="1" />

Регулирует уровень сжатия ZSTD. Используется только, если [network_compression_method](#network_compression_method) установлен в значение `ZSTD`.

Возможные значения:

- Положительное целое число от 1 до 15.

## normalize_function_names \\{#normalize_function_names\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "Приводить имена функций к их каноническому виду, это необходимо для маршрутизации запросов с PROJECTION"}]}]}/>

Приводить имена функций к их каноническому виду

## number_of_mutations_to_delay \\{#number_of_mutations_to_delay\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если в изменяемой таблице содержится не меньше указанного количества незавершённых мутаций, мутации таблицы искусственно замедляются. 0 — отключено

## number_of_mutations_to_throw \\{#number_of_mutations_to_throw\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если изменяемая таблица содержит как минимум указанное количество незавершённых мутаций, выбрасывается исключение 'Too many mutations ...'. 0 — отключено

## odbc_bridge_connection_pool_size \\{#odbc_bridge_connection_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="16" />

Размер пула подключений для каждой строки параметров подключения в мосте ODBC.

## odbc_bridge_use_connection_pooling \\{#odbc_bridge_use_connection_pooling\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать пул соединений в ODBC Bridge. Если установлено значение false, каждый раз создаётся новое соединение.

## offset \{#offset\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Задает количество строк, которые нужно пропустить перед началом возврата строк из запроса. Корректирует смещение, установленное предложением [OFFSET](/sql-reference/statements/select/offset), так, что их значения суммируются.

Возможные значения:

* 0 — строки не пропускаются.
* Положительное целое число.

**Пример**

Входная таблица:

```sql
CREATE TABLE test (i UInt64) ENGINE = MergeTree() ORDER BY i;
INSERT INTO test SELECT number FROM numbers(500);
```

Запрос:

```sql
SET limit = 5;
SET offset = 7;
SELECT * FROM test LIMIT 10 OFFSET 100;
```

Результат:

```text
┌───i─┐
│ 107 │
│ 108 │
│ 109 │
└─────┘
```


## opentelemetry_start_trace_probability \\{#opentelemetry_start_trace_probability\\}

<SettingsInfoBlock type="Float" default_value="0" />

Задает вероятность того, что ClickHouse запустит трассировку для выполняемых запросов (если не передан родительский [контекст трассировки](https://www.w3.org/TR/trace-context/)).

Возможные значения:

- 0 — трассировка для всех выполняемых запросов отключена (если не передан родительский контекст трассировки).
- Положительное число с плавающей запятой в диапазоне [0..1]. Например, если значение настройки равно `0.5`, ClickHouse может запускать трассировку в среднем для половины запросов.
- 1 — трассировка для всех выполняемых запросов включена.

## opentelemetry_trace_cpu_scheduling \\{#opentelemetry_trace_cpu_scheduling\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка для трассировки возможности `cpu_slot_preemption`."}]}]}/>

Собирает спаны OpenTelemetry при преемптивном планировании CPU рабочих нагрузок.

## opentelemetry_trace_processors \\{#opentelemetry_trace_processors\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Собирать спаны OpenTelemetry для процессоров.

## optimize_aggregation_in_order \\{#optimize_aggregation_in_order\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает оптимизацию [`GROUP BY`](/sql-reference/statements/select/group-by) в запросах [`SELECT`](../../sql-reference/statements/select/index.md) для агрегации данных в соответствующем порядке сортировки в таблицах [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Возможные значения:

- 0 — оптимизация `GROUP BY` отключена.
- 1 — оптимизация `GROUP BY` включена.

**См. также**

- [Оптимизация `GROUP BY`](/sql-reference/statements/select/group-by#group-by-optimization-depending-on-table-sorting-key)

## optimize_aggregators_of_group_by_keys \\{#optimize_aggregators_of_group_by_keys\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Удаляет агрегирующие функции min/max/any/anyLast для ключей GROUP BY из секции SELECT

## optimize_and_compare_chain \\{#optimize_and_compare_chain\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Добавляет константные сравнения в цепочки условий AND, чтобы повысить эффективность фильтрации. Поддерживает операторы `<`, `<=`, `>`, `>=`, `=` и их комбинации. Например, выражение `(a < b) AND (b < c) AND (c < 5)` будет преобразовано в `(a < b) AND (b < c) AND (c < 5) AND (b < 5) AND (a < 5)`.

## optimize_append_index \\{#optimize_append_index\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Используйте [ограничения](../../sql-reference/statements/create/table.md/#constraints) для добавления условия индекса. Значение по умолчанию — `false`.

Возможные значения:

- true, false

## optimize_arithmetic_operations_in_aggregate_functions \\{#optimize_arithmetic_operations_in_aggregate_functions\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Выносит арифметические операции за пределы агрегатных функций

## optimize_const_name_size \\{#optimize_const_name_size\\}

<SettingsInfoBlock type="Int64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "256"},{"label": "Заменяет на скалярное значение и использует хэш в качестве имени для больших констант (размер оценивается по длине имени)"}]}]}/>

Заменяет на скалярное значение и использует хэш в качестве имени для больших констант (размер оценивается по длине имени).

Возможные значения:

- положительное целое число — максимальная длина имени,
- 0 — всегда,
- отрицательное целое число — никогда.

## optimize_count_from_files \\{#optimize_count_from_files\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию подсчёта строк в файлах в различных входных форматах. Применяется к табличным функциям и движкам `file`/`s3`/`url`/`hdfs`/`azureBlobStorage`.

Возможные значения:

- 0 — оптимизация отключена.
- 1 — оптимизация включена.

## optimize_distinct_in_order \\{#optimize_distinct_in_order\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию DISTINCT, если некоторые столбцы в DISTINCT образуют префикс сортировки. Например, префикс ключа сортировки в таблице семейства MergeTree или в выражении ORDER BY.

## optimize_distributed_group_by_sharding_key \\{#optimize_distributed_group_by_sharding_key\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Оптимизирует запросы `GROUP BY sharding_key`, избегая дорогостоящей агрегации на сервере-инициаторе (что снижает потребление памяти запросом на сервере-инициаторе).

Поддерживаются следующие типы запросов (и любые их комбинации):

- `SELECT DISTINCT [..., ]sharding_key[, ...] FROM dist`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...]`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] ORDER BY x`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1 BY x`

Следующие типы запросов не поддерживаются (поддержка некоторых из них может быть добавлена позже):

- `SELECT ... GROUP BY sharding_key[, ...] WITH TOTALS`
- `SELECT ... GROUP BY sharding_key[, ...] WITH ROLLUP`
- `SELECT ... GROUP BY sharding_key[, ...] WITH CUBE`
- `SELECT ... GROUP BY sharding_key[, ...] SETTINGS extremes=1`

Возможные значения:

- 0 — отключено.
- 1 — включено.

См. также:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [distributed_push_down_limit](#distributed_push_down_limit)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)

:::note
В настоящий момент эта настройка требует `optimize_skip_unused_shards` (причина в том, что однажды она может быть включена по умолчанию, и корректная работа будет гарантирована только в том случае, если данные вставлялись через distributed таблицу, то есть распределены в соответствии с sharding_key).
:::

## optimize_empty_string_comparisons \\{#optimize_empty_string_comparisons\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "Новая настройка."}]}]}/>

Преобразует выражения вида col = '' или '' = col в empty(col), а выражения col != '' или '' != col — в notEmpty(col),
только если столбец col имеет тип String или FixedString.

## optimize_extract_common_expressions \\{#optimize_extract_common_expressions\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Оптимизировать выражения WHERE, PREWHERE, ON, HAVING и QUALIFY путём вынесения общих выражений из дизъюнкции конъюнкций."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "Добавлена настройка для оптимизации выражений WHERE, PREWHERE, ON, HAVING и QUALIFY путём вынесения общих выражений из дизъюнкции конъюнкций."}]}]}/>

Позволяет извлекать общие выражения из дизъюнкций в выражениях WHERE, PREWHERE, ON, HAVING и QUALIFY. Логическое выражение вида `(A AND B) OR (A AND C)` может быть переписано как `A AND (B OR C)`, что может помочь эффективнее использовать:

- индексы в простых фильтрующих выражениях
- оптимизацию преобразования CROSS в INNER JOIN

## optimize_functions_to_subcolumns \\{#optimize_functions_to_subcolumns\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "Enabled settings by default"}]}]}/>

Включает или отключает оптимизацию за счёт преобразования некоторых функций так, чтобы они читали подстолбцы. Это снижает объём данных, которые нужно прочитать.

Могут быть преобразованы следующие функции:

- [length](/sql-reference/functions/array-functions#length) для чтения подстолбца [size0](../../sql-reference/data-types/array.md/#array-size).
- [empty](/sql-reference/functions/array-functions#empty) для чтения подстолбца [size0](../../sql-reference/data-types/array.md/#array-size).
- [notEmpty](/sql-reference/functions/array-functions#notEmpty) для чтения подстолбца [size0](../../sql-reference/data-types/array.md/#array-size).
- [isNull](/sql-reference/functions/functions-for-nulls#isNull) для чтения подстолбца [null](../../sql-reference/data-types/nullable.md/#finding-null).
- [isNotNull](/sql-reference/functions/functions-for-nulls#isNotNull) для чтения подстолбца [null](../../sql-reference/data-types/nullable.md/#finding-null).
- [count](/sql-reference/aggregate-functions/reference/count) для чтения подстолбца [null](../../sql-reference/data-types/nullable.md/#finding-null).
- [mapKeys](/sql-reference/functions/tuple-map-functions#mapKeys) для чтения подстолбца [keys](/sql-reference/data-types/map#reading-subcolumns-of-map).
- [mapValues](/sql-reference/functions/tuple-map-functions#mapValues) для чтения подстолбца [values](/sql-reference/data-types/map#reading-subcolumns-of-map).

Возможные значения:

- 0 — оптимизация отключена.
- 1 — оптимизация включена.

## optimize_group_by_constant_keys \\{#optimize_group_by_constant_keys\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.9"},{"label": "1"},{"label": "Optimize group by constant keys by default"}]}]}/>

Оптимизировать GROUP BY, если все ключи в блоке являются константами

## optimize_group_by_function_keys \\{#optimize_group_by_function_keys\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Устраняет функции от других ключей в секции GROUP BY

## optimize_if_chain_to_multiif \\{#optimize_if_chain_to_multiif\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Заменяет цепочки if(cond1, then1, if(cond2, ...)) на multiIf. В настоящее время это не даёт преимуществ по производительности для числовых типов.

## optimize_if_transform_strings_to_enum \\{#optimize_if_transform_strings_to_enum\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Заменяет строковые аргументы в функциях If и Transform на тип enum. По умолчанию отключена, поскольку может привести к неконсистентным изменениям в распределённом запросе и вызвать его сбой.

## optimize_injective_functions_in_group_by \\{#optimize_injective_functions_in_group_by\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "Заменяет инъективные функции на их аргументы в разделе GROUP BY в анализаторе"}]}]}/>

Заменяет инъективные функции на их аргументы в разделе GROUP BY

## optimize_injective_functions_inside_uniq \\{#optimize_injective_functions_inside_uniq\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Удаляет инъективные функции с одним аргументом внутри функций uniq*().

## optimize_inverse_dictionary_lookup \\{#optimize_inverse_dictionary_lookup\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

Позволяет избежать повторных обратных поисков в словаре, выполняя более быстрый поиск по предварительно вычисленному набору возможных значений ключей.

## optimize_min_equality_disjunction_chain_length \\{#optimize_min_equality_disjunction_chain_length\\}

<SettingsInfoBlock type="UInt64" default_value="3" />

Минимальная длина выражения вида `expr = x1 OR ... expr = xN` для оптимизации

## optimize_min_inequality_conjunction_chain_length \\{#optimize_min_inequality_conjunction_chain_length\\}

<SettingsInfoBlock type="UInt64" default_value="3" />

Минимальная длина выражения `expr <> x1 AND ... expr <> xN`, при которой выполняется оптимизация

## optimize_move_to_prewhere \\{#optimize_move_to_prewhere\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает автоматическую оптимизацию с использованием [PREWHERE](../../sql-reference/statements/select/prewhere.md) в запросах [SELECT](../../sql-reference/statements/select/index.md).

Работает только для таблиц [*MergeTree](../../engines/table-engines/mergetree-family/index.md).

Возможные значения:

- 0 — автоматическая оптимизация `PREWHERE` отключена.
- 1 — автоматическая оптимизация `PREWHERE` включена.

## optimize_move_to_prewhere_if_final \\{#optimize_move_to_prewhere_if_final\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает автоматическую оптимизацию [PREWHERE](../../sql-reference/statements/select/prewhere.md) в запросах [SELECT](../../sql-reference/statements/select/index.md) с модификатором [FINAL](/sql-reference/statements/select/from#final-modifier).

Работает только для таблиц семейства [*MergeTree](../../engines/table-engines/mergetree-family/index.md).

Возможные значения:

- 0 — автоматическая оптимизация `PREWHERE` в запросах `SELECT` с модификатором `FINAL` отключена.
- 1 — автоматическая оптимизация `PREWHERE` в запросах `SELECT` с модификатором `FINAL` включена.

**См. также**

- настройка [optimize_move_to_prewhere](#optimize_move_to_prewhere)

## optimize_multiif_to_if \\{#optimize_multiif_to_if\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Заменяет `multiIf` с единственным условием на `if`.

## optimize_normalize_count_variants \\{#optimize_normalize_count_variants\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "Переписывать агрегатные функции, семантически эквивалентные count(), в count() по умолчанию"}]}]}/>

Переписывает агрегатные функции, семантически эквивалентные count(), в count().

## optimize_on_insert \{#optimize_on_insert\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "Включить оптимизацию данных при INSERT по умолчанию для улучшения взаимодействия с пользователем"}]}]} />

Включает или отключает преобразование данных перед вставкой, как если бы операция merge была выполнена для этого блока (в соответствии с движком таблицы).

Возможные значения:

* 0 — Отключено.
* 1 — Включено.

**Пример**

Разница между включённой и отключённой настройкой:

Запрос:

```sql
SET optimize_on_insert = 1;

CREATE TABLE test1 (`FirstTable` UInt32) ENGINE = ReplacingMergeTree ORDER BY FirstTable;

INSERT INTO test1 SELECT number % 2 FROM numbers(5);

SELECT * FROM test1;

SET optimize_on_insert = 0;

CREATE TABLE test2 (`SecondTable` UInt32) ENGINE = ReplacingMergeTree ORDER BY SecondTable;

INSERT INTO test2 SELECT number % 2 FROM numbers(5);

SELECT * FROM test2;
```

Результат:

```text
┌─FirstTable─┐
│          0 │
│          1 │
└────────────┘

┌─SecondTable─┐
│           0 │
│           0 │
│           0 │
│           1 │
│           1 │
└─────────────┘
```

Обратите внимание, что этот параметр влияет на поведение [materialized view](/sql-reference/statements/create/view#materialized-view).


## optimize_or_like_chain \\{#optimize_or_like_chain\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Объединяет несколько условий OR LIKE в вызов multiMatchAny. Эту оптимизацию не следует включать по умолчанию, поскольку в некоторых случаях она нарушает анализ индексов.

## optimize_qbit_distance_function_reads \\{#optimize_qbit_distance_function_reads\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "New setting"}]}]}/>

Заменяет функции расстояния для типа данных `QBit` на эквивалентные, которые считывают из хранилища только необходимые для вычисления столбцы.

## optimize_read_in_order \\{#optimize_read_in_order\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию [ORDER BY](/sql-reference/statements/select/order-by#optimization-of-data-reading) в запросах [SELECT](../../sql-reference/statements/select/index.md) при чтении данных из таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Возможные значения:

- 0 — оптимизация `ORDER BY` отключена.
- 1 — оптимизация `ORDER BY` включена.

**См. также**

- [Оператор ORDER BY](/sql-reference/statements/select/order-by#optimization-of-data-reading)

## optimize_read_in_window_order \\{#optimize_read_in_window_order\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию ORDER BY в оконной части запроса для чтения данных в соответствующем порядке в таблицах MergeTree.

## optimize_redundant_functions_in_order_by \\{#optimize_redundant_functions_in_order_by\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Удаляет функции из ORDER BY, если их аргумент также указан в ORDER BY

## optimize_respect_aliases \\{#optimize_respect_aliases\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено значение true, будут учитываться алиасы в предложениях WHERE/GROUP BY/ORDER BY, что помогает при отсечении партиций, использовании вторичных индексов и работе настроек optimize_aggregation_in_order/optimize_read_in_order/optimize_trivial_count.

## optimize_rewrite_aggregate_function_with_if \\{#optimize_rewrite_aggregate_function_with_if\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Переписывает агрегатные функции с выражением `if` в качестве аргумента, когда это логически эквивалентно.
Например, `avg(if(cond, col, null))` может быть переписано в `avgOrNullIf(cond, col)`. Это может улучшить производительность.

:::note
Поддерживается только при использовании анализатора (`enable_analyzer = 1`).
:::

## optimize_rewrite_array_exists_to_has \\{#optimize_rewrite_array_exists_to_has\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Переписывает вызовы функции arrayExists() на has(), когда это логически эквивалентно. Например, arrayExists(x -> x = 1, arr) может быть переписана как has(arr, 1).

## optimize_rewrite_like_perfect_affix \\{#optimize_rewrite_like_perfect_affix\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "New setting"}]}]}/>

Переписывает выражения LIKE с полным префиксом или суффиксом (например, `col LIKE 'ClickHouse%'`) в вызовы функций startsWith или endsWith (например, `startsWith(col, 'ClickHouse')`).

## optimize_rewrite_regexp_functions \\{#optimize_rewrite_regexp_functions\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "A new setting"}]}]}/>

Преобразует функции работы с регулярными выражениями в более простые и эффективные формы

## optimize_rewrite_sum_if_to_count_if \\{#optimize_rewrite_sum_if_to_count_if\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "Доступна только для анализатора, где работает корректно"}]}]}/>

Переписывать вызовы функций sumIf() и sum(if()) в countIf(), когда они логически эквивалентны

## optimize_skip_merged_partitions \\{#optimize_skip_merged_partitions\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает оптимизацию для запроса [OPTIMIZE TABLE ... FINAL](../../sql-reference/statements/optimize.md), если существует только одна часть с уровнем > 0 и у неё нет просроченного TTL.

- `OPTIMIZE TABLE ... FINAL SETTINGS optimize_skip_merged_partitions=1`

По умолчанию запрос `OPTIMIZE TABLE ... FINAL` всё равно переписывает эту часть, даже если она единственная.

Возможные значения:

- 1 - Включить оптимизацию.
- 0 - Отключить оптимизацию.

## optimize_skip_unused_shards \\{#optimize_skip_unused_shards\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает пропуск неиспользуемых сегментов для запросов [SELECT](../../sql-reference/statements/select/index.md), которые имеют условие по ключу шардирования в `WHERE/PREWHERE`, и активирует связанные оптимизации для распределённых запросов (например, агрегацию по ключу шардирования).

:::note
Предполагается, что данные распределены по ключу шардирования, в противном случае запрос может вернуть некорректный результат.
:::

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## optimize_skip_unused_shards_limit \\{#optimize_skip_unused_shards_limit\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Лимит на количество значений ключа сегментирования; при достижении этого лимита `optimize_skip_unused_shards` отключается.

Слишком большое количество значений может потребовать значительных ресурсов на обработку, при этом выгода сомнительна, поскольку если у вас огромное количество значений в `IN (...)`, то, скорее всего, запрос всё равно будет отправлен на все сегменты.

## optimize_skip_unused_shards_nesting \\{#optimize_skip_unused_shards_nesting\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Определяет поведение [`optimize_skip_unused_shards`](#optimize_skip_unused_shards) (и поэтому по‑прежнему требует включения [`optimize_skip_unused_shards`](#optimize_skip_unused_shards)) в зависимости от уровня вложенности распределённого запроса (когда таблица `Distributed` читает данные из другой таблицы `Distributed`).

Возможные значения:

- 0 — Отключено, `optimize_skip_unused_shards` применяется на всех уровнях вложенности.
- 1 — Включает `optimize_skip_unused_shards` только для первого уровня вложенности.
- 2 — Включает `optimize_skip_unused_shards` до второго уровня вложенности включительно.

## optimize_skip_unused_shards_rewrite_in \\{#optimize_skip_unused_shards_rewrite_in\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Переписывает оператор IN в запросе для удалённых сегментов, чтобы исключить значения, которые не относятся к сегменту (требует optimize_skip_unused_shards).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## optimize_sorting_by_input_stream_properties \\{#optimize_sorting_by_input_stream_properties\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Оптимизировать сортировку с учётом свойств входного потока

## optimize_substitute_columns \\{#optimize_substitute_columns\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Используйте [ограничения](../../sql-reference/statements/create/table.md/#constraints) для подмены столбцов. Значение по умолчанию — `false`.

Возможные значения:

- true, false

## optimize_syntax_fuse_functions \{#optimize_syntax_fuse_functions\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает оптимизацию, которая объединяет агрегатные функции с одинаковым аргументом. Переписывает запрос, если он содержит как минимум две агрегатные функции [sum](/sql-reference/aggregate-functions/reference/sum), [count](/sql-reference/aggregate-functions/reference/count) или [avg](/sql-reference/aggregate-functions/reference/avg) с одинаковым аргументом, в [sumCount](/sql-reference/aggregate-functions/reference/sumcount).

Возможные значения:

* 0 — Функции с одинаковым аргументом не объединяются.
* 1 — Функции с одинаковым аргументом объединяются.

**Пример**

Запрос:

```sql
CREATE TABLE fuse_tbl(a Int8, b Int8) Engine = Log;
SET optimize_syntax_fuse_functions = 1;
EXPLAIN SYNTAX SELECT sum(a), sum(b), count(b), avg(b) from fuse_tbl FORMAT TSV;
```

Результат:

```text
SELECT
    sum(a),
    sumCount(b).1,
    sumCount(b).2,
    (sumCount(b).1) / (sumCount(b).2)
FROM fuse_tbl
```


## optimize_throw_if_noop \\{#optimize_throw_if_noop\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает генерацию исключения, если запрос [OPTIMIZE](../../sql-reference/statements/optimize.md) не выполнил слияние.

По умолчанию `OPTIMIZE` успешно завершается, даже если фактически ничего не сделал. Этот параметр позволяет различать такие ситуации и получать причину в сообщении об исключении.

Возможные значения:

- 1 — Генерация исключения включена.
- 0 — Генерация исключения отключена.

## optimize_time_filter_with_preimage \\{#optimize_time_filter_with_preimage\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Оптимизирует предикаты типов Date и DateTime, преобразуя функции в эквивалентные сравнения без дополнительных преобразований (например, toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31')"}]}]}/>

Оптимизирует предикаты типов Date и DateTime, преобразуя функции в эквивалентные сравнения без дополнительных преобразований (например, `toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'`)

## optimize_trivial_approximate_count_query \\{#optimize_trivial_approximate_count_query\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать приближённое значение для тривиальной оптимизации подсчёта в хранилищах, которые поддерживают такую оценку, например EmbeddedRocksDB.

Возможные значения:

- 0 — Оптимизация отключена.
   - 1 — Оптимизация включена.

## optimize_trivial_count_query \\{#optimize_trivial_count_query\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию тривиального запроса `SELECT count() FROM table` с использованием метаданных из MergeTree. Если вам нужно использовать защиту данных на уровне строк, отключите эту настройку.

Возможные значения:

- 0 — Optimization disabled.
   - 1 — Optimization enabled.
- 0 — Оптимизация отключена.
- 1 — Оптимизация включена.

См. также:

- [optimize_functions_to_subcolumns](#optimize_functions_to_subcolumns)

## optimize_trivial_insert_select \\{#optimize_trivial_insert_select\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Эта оптимизация во многих случаях не имеет смысла."}]}]}/>

Оптимизировать тривиальные запросы вида `INSERT INTO table SELECT ... FROM TABLES`

## optimize_uniq_to_count \\{#optimize_uniq_to_count\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Переписывает uniq и его варианты (кроме uniqUpTo) на count, если подзапрос содержит предложение DISTINCT или GROUP BY.

## optimize_use_implicit_projections \\{#optimize_use_implicit_projections\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Автоматически выбирать неявные PROJECTION при выполнении запроса SELECT

## optimize_use_projection_filtering \\{#optimize_use_projection_filtering\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "New setting"}]}]}/>

Включает использование проекций для фильтрации диапазонов партиций даже в тех случаях, когда проекции не задействованы при выполнении запроса SELECT.

## optimize_use_projections \\{#optimize_use_projections\\}

**Псевдонимы**: `allow_experimental_projection_optimization`

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию [проекций](../../engines/table-engines/mergetree-family/mergetree.md/#projections) при обработке запросов `SELECT`.

Возможные значения:

- 0 — Оптимизация проекций отключена.
- 1 — Оптимизация проекций включена.

## optimize_using_constraints \\{#optimize_using_constraints\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Используйте [ограничения](../../sql-reference/statements/create/table.md/#constraints) для оптимизации запросов. Значение по умолчанию — `false`.

Возможные значения:

- true, false

## os_threads_nice_value_materialized_view \\{#os_threads_nice_value_materialized_view\\}

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting."}]}]}/>

Значение `nice` в Linux для потоков materialized view. Меньшие значения означают более высокий приоритет на CPU.

Требует capability CAP_SYS_NICE, в противном случае параметр не оказывает эффекта (no-op).

Возможные значения: от -20 до 19.

## os_threads_nice_value_query \\{#os_threads_nice_value_query\\}

**Псевдонимы**: `os_thread_priority`

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Значение Linux nice для потоков обработки запросов. Меньшие значения означают более высокий приоритет для CPU.

Требует capability CAP_SYS_NICE, в противном случае не оказывает эффекта.

Возможные значения: от -20 до 19.

## page_cache_block_size \\{#page_cache_block_size\\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1048576"},{"label": "Этот параметр сделали настраиваемым на уровне отдельных запросов."}]}]}/>

Размер файловых фрагментов, которые сохраняются в пользовательском кэше страниц (userspace page cache), в байтах. Все операции чтения, проходящие через кэш, будут округляться до значения, кратного этому размеру.

Этот параметр можно настраивать на уровне отдельных запросов, но записи кэша с разными размерами блоков не могут быть повторно использованы. Изменение этого параметра фактически делает существующие записи в кэше недействительными.

Большее значение, например 1 MiB, подходит для запросов с высоким объемом обработки, а меньшее значение, например 64 KiB, — для точечных запросов с низкой задержкой.

## page_cache_inject_eviction \\{#page_cache_inject_eviction\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Добавлен кэш страниц в пространстве пользователя"}]}]}/>

Кэш страниц в пространстве пользователя иногда случайным образом сбрасывает некоторые страницы. Параметр предназначен для тестирования.

## page_cache_lookahead_blocks \\{#page_cache_lookahead_blocks\\}

<SettingsInfoBlock type="UInt64" default_value="16" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "16"},{"label": "Этот параметр можно настраивать на уровне отдельного запроса."}]}]}/>

При промахе кэша страниц в пространстве пользователя (userspace page cache miss) считывать за один раз до такого количества последовательных блоков из нижележащего хранилища, если они также отсутствуют в кэше. Каждый блок имеет размер page_cache_block_size байт.

Большее значение лучше подходит для высокопроизводительных запросов с большим объемом данных, тогда как точечные запросы с низкой задержкой будут работать лучше без предварительного чтения (readahead).

## parallel_distributed_insert_select \\{#parallel_distributed_insert_select\\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "2"},{"label": "Enable parallel distributed insert select by default"}]}]}/>

Включает параллельное выполнение распределённого запроса `INSERT ... SELECT`.

Если выполняются запросы `INSERT INTO distributed_table_a SELECT ... FROM distributed_table_b`, и обе таблицы используют один и тот же кластер, а также обе таблицы либо [реплицируемые](../../engines/table-engines/mergetree-family/replication.md), либо нереплицируемые, то такой запрос обрабатывается локально на каждом сегменте.

Возможные значения:

- `0` — Отключено.
- `1` — `SELECT` будет выполняться на каждом сегменте из базовой таблицы распределённого движка.
- `2` — `SELECT` и `INSERT` будут выполняться на каждом сегменте из/в базовую таблицу распределённого движка.

При использовании этого параметра необходимо включить настройку `enable_parallel_replicas = 1`.

## parallel_hash_join_threshold \\{#parallel_hash_join_threshold\\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100000"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-3","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

При использовании алгоритма соединения по хэшу это пороговое значение помогает выбрать между `hash` и `parallel_hash` (только если доступна оценка размера правой таблицы).
Вариант `hash` используется, когда известно, что размер правой таблицы меньше этого порогового значения.

## parallel_replica_offset \\{#parallel_replica_offset\\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

Это внутренняя настройка, не предназначенная для прямого использования; она является деталью реализации режима parallel replicas. Это значение автоматически задаётся сервером-инициатором для распределённых запросов к индексу реплики, участвующей в обработке запроса среди параллельных реплик.

## parallel_replicas_allow_in_with_subquery \\{#parallel_replicas_allow_in_with_subquery\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Если параметр включён, подзапрос в выражении IN выполняется на каждой ведомой реплике"}]}]}/>

Если параметр включён, подзапрос в выражении IN выполняется на каждой ведомой реплике.

## parallel_replicas_allow_materialized_views \\{#parallel_replicas_allow_materialized_views\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "Разрешает использование materialized views с параллельными репликами"}]}]}/>

Разрешает использование materialized views с параллельными репликами

## parallel_replicas_connect_timeout_ms \\{#parallel_replicas_connect_timeout_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="300" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "300"},{"label": "Отдельный таймаут подключения для запросов с параллельными репликами"}]}]}/>

Таймаут в миллисекундах для подключения к удалённой реплике во время выполнения запроса с параллельными репликами. Если таймаут истекает, соответствующая реплика не используется для выполнения запроса.

## parallel_replicas_count \\{#parallel_replicas_count\\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

Это внутренняя настройка, которая не должна использоваться напрямую и представляет собой деталь реализации режима «parallel replicas». Это значение будет автоматически установлено инициирующим сервером для распределённых запросов в значение, равное количеству параллельных реплик, участвующих в обработке запроса.

## parallel_replicas_custom_key \\{#parallel_replicas_custom_key\\}

<BetaBadge/>

Произвольное целочисленное выражение, которое можно использовать для распределения работы между репликами конкретной таблицы.
Значением может быть любое целочисленное выражение.

Предпочтительны простые выражения, использующие первичные ключи.

Если настройка используется в кластере, состоящем из одного сегмента с несколькими репликами, эти реплики будут преобразованы в виртуальные сегменты.
В остальных случаях параметр ведёт себя аналогично ключу `SAMPLE`: используются несколько реплик каждого сегмента.

## parallel_replicas_custom_key_range_lower \\{#parallel_replicas_custom_key_range_lower\\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Добавлены настройки для управления фильтром диапазона при использовании параллельных реплик с динамическими сегментами"}]}]}/>

Позволяет фильтру типа `range` равномерно распределять объём работы между репликами на основе пользовательского диапазона `[parallel_replicas_custom_key_range_lower, INT_MAX]`.

При совместном использовании с [parallel_replicas_custom_key_range_upper](#parallel_replicas_custom_key_range_upper) позволяет фильтру равномерно распределять работу между репликами для диапазона `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]`.

Примечание: эта настройка не приводит к дополнительной фильтрации данных во время обработки запроса, а изменяет точки разбиения диапазона `[0, INT_MAX]` для параллельной обработки.

## parallel_replicas_custom_key_range_upper \\{#parallel_replicas_custom_key_range_upper\\}

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Добавляет настройки для управления фильтром диапазона при использовании параллельных реплик с динамическими сегментами. Значение 0 отключает верхний предел."}]}]}/>

Позволяет фильтру типа `range` равномерно распределять нагрузку между репликами на основе пользовательского диапазона `[0, parallel_replicas_custom_key_range_upper]`. Значение 0 отключает верхнюю границу, устанавливая её равной максимальному значению выражения пользовательского ключа.

При совместном использовании с [parallel_replicas_custom_key_range_lower](#parallel_replicas_custom_key_range_lower) позволяет фильтру равномерно распределять нагрузку между репликами для диапазона `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]`.

Примечание: Эта настройка не приводит к дополнительной фильтрации данных во время обработки запроса, а лишь изменяет точки, в которых фильтр диапазона разбивает диапазон `[0, INT_MAX]` для параллельной обработки.

## parallel_replicas_for_cluster_engines \\{#parallel_replicas_for_cluster_engines\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "1"},{"label": "New setting."}]}]}/>

Заменяет движки табличных функций на их варианты с суффиксом -Cluster

## parallel_replicas_for_non_replicated_merge_tree \\{#parallel_replicas_for_non_replicated_merge_tree\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, ClickHouse будет использовать алгоритм параллельных реплик также для нереплицированных таблиц MergeTree

## parallel_replicas_index_analysis_only_on_coordinator \\{#parallel_replicas_index_analysis_only_on_coordinator\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "Анализ индексов выполняется только на реплике-координаторе и не выполняется на других репликах. Действует только при включённом parallel_replicas_local_plan"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "Анализ индексов выполняется только на реплике-координаторе и не выполняется на других репликах. Действует только при включённом parallel_replicas_local_plan"}]}]}/>

Анализ индексов выполняется только на реплике-координаторе и не выполняется на других репликах. Действует только при включённом parallel_replicas_local_pla

## parallel_replicas_insert_select_local_pipeline \\{#parallel_replicas_insert_select_local_pipeline\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Использовать локальный конвейер выполнения при распределённом INSERT SELECT с параллельными репликами. В настоящее время отключено из-за проблем с производительностью"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "Использовать локальный конвейер выполнения при распределённом INSERT SELECT с параллельными репликами. В настоящее время отключено из-за проблем с производительностью"}]}]}/>

Использовать локальный конвейер выполнения при распределённом INSERT SELECT с параллельными репликами

## parallel_replicas_local_plan \\{#parallel_replicas_local_plan\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Использовать локальный план для локальной реплики в запросах с параллельными репликами"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "Использовать локальный план для локальной реплики в запросах с параллельными репликами"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "1"},{"label": "Использовать локальный план для локальной реплики в запросах с параллельными репликами"}]}]}/>

Строить локальный план для локальной реплики

## parallel_replicas_mark_segment_size \\{#parallel_replicas_mark_segment_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Значение для этой настройки теперь определяется автоматически"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "128"},{"label": "Добавлена новая настройка для управления размером сегмента в новой реализации координатора параллельных реплик"}]}]}/>

Части виртуально разбиваются на сегменты для распределения между репликами при параллельном чтении. Эта настройка управляет размером этих сегментов. Не рекомендуется изменять этот параметр, пока вы не будете абсолютно уверены в своих действиях. Значение должно быть в диапазоне [128; 16384].

## parallel_replicas_min_number_of_rows_per_replica \\{#parallel_replicas_min_number_of_rows_per_replica\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает количество реплик, используемых в запросе, значением (оценочное количество строк, подлежащих чтению / min_number_of_rows_per_replica). Максимальное количество по‑прежнему ограничено параметром `max_parallel_replicas`.

## parallel_replicas_mode \\{#parallel_replicas_mode\\}

<SettingsInfoBlock type="ParallelReplicasMode" default_value="read_tasks" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "read_tasks"},{"label": "Этот параметр был добавлен как часть вывода функциональности параллельных реплик в статусе Beta"}]}]}/>

Тип фильтра, используемый с пользовательским ключом для параллельных реплик. `default` — использовать операцию взятия по модулю над пользовательским ключом, `range` — использовать фильтр по диапазону по пользовательскому ключу, перебирая все возможные значения для типа значения пользовательского ключа.

## parallel_replicas_only_with_analyzer \\{#parallel_replicas_only_with_analyzer\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Параллельные реплики поддерживаются только при включённом analyzer"}]}]}/>

Для использования параллельных реплик должен быть включён analyzer. При отключённом analyzer выполнение запроса возвращается к локальному, даже если включено параллельное чтение с реплик. Использование параллельных реплик при выключенном analyzer не поддерживается.

## parallel_replicas_prefer_local_join \\{#parallel_replicas_prefer_local_join\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Если имеет значение true и JOIN может быть выполнен с использованием алгоритма параллельных реплик, а все хранилища правой части JOIN используют движок *MergeTree, будет выполнен локальный JOIN вместо GLOBAL JOIN."}]}]}/>

Если имеет значение true и JOIN может быть выполнен с использованием алгоритма параллельных реплик, а все хранилища правой части JOIN используют движок *MergeTree, будет выполнен локальный JOIN вместо GLOBAL JOIN.

## parallel_replicas_support_projection \\{#parallel_replicas_support_projection\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Новая настройка. Оптимизацию проекций можно применять на параллельных репликах. Работает только при включенном parallel_replicas_local_plan и выключенном aggregation_in_order."}]}]}/>

Оптимизацию проекций можно применять на параллельных репликах. Работает только при включенном parallel_replicas_local_plan и выключенном aggregation_in_order.

## parallel_view_processing \\{#parallel_view_processing\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает параллельную запись в присоединённые представления вместо последовательной.

## parallelize_output_from_storages \\{#parallelize_output_from_storages\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "Разрешает параллелизм при выполнении запросов, которые читают из file/url/S3/и т. д. Это может изменить порядок строк."}]}]}/>

Параллелизует вывод на этапе чтения из хранилища. Включает параллельную обработку запроса непосредственно после чтения из хранилища, если это возможно.

## parsedatetime_e_requires_space_padding \\{#parsedatetime_e_requires_space_padding\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Improved compatibility with MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

Спецификатор формата '%e' в функции 'parseDateTime' ожидает, что однозначные значения дня будут дополнены пробелом, например, ' 2' принимается, а '2' приводит к ошибке.

## parsedatetime_parse_without_leading_zeros \\{#parsedatetime_parse_without_leading_zeros\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.11"},{"label": "1"},{"label": "Улучшена совместимость с MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

Спецификаторы формата '%c', '%l' и '%k' в функции 'parseDateTime' разбирают значения месяцев и часов без ведущих нулей.

## partial_merge_join_left_table_buffer_bytes \\{#partial_merge_join_left_table_buffer_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если не равно 0, объединяет блоки левой таблицы в более крупные при partial merge join. Может использовать до 2× указанного объёма памяти на каждый поток соединения.

## partial_merge_join_rows_in_right_blocks \\{#partial_merge_join_rows_in_right_blocks\\}

<SettingsInfoBlock type="UInt64" default_value="65536" />

Ограничивает размер блоков правой части соединения в алгоритме частичного соединения слиянием для запросов [JOIN](../../sql-reference/statements/select/join.md).

Сервер ClickHouse:

1.  Делит данные правой части соединения на блоки с числом строк не более указанного значения.
2.  Индексирует каждый блок по его минимальному и максимальному значениям.
3.  Выгружает подготовленные блоки на диск, если это возможно.

Возможные значения:

- Любое положительное целое число. Рекомендуемый диапазон значений: \[1000, 100000\].

## partial_result_on_first_cancel \\{#partial_result_on_first_cancel\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет запросу вернуть частичный результат после его отмены.

## parts_to_delay_insert \\{#parts_to_delay_insert\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если в целевой таблице в одной партиции уже содержится как минимум столько активных частей, вставка в таблицу искусственно замедляется.

## parts_to_throw_insert \\{#parts_to_throw_insert\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если активных частей в одной партиции таблицы назначения становится больше этого числа, выбрасывается исключение 'Too many parts ...'.

## per_part_index_stats \\{#per_part_index_stats\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

Логирует статистику индекса по каждому парту

## poll_interval \\{#poll_interval\\}

<SettingsInfoBlock type="UInt64" default_value="10" />

Блокирует цикл ожидания запросов на сервере на указанное количество секунд.

## postgresql_connection_attempt_timeout \\{#postgresql_connection_attempt_timeout\\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "Позволяет управлять параметром `connect_timeout` при подключении к PostgreSQL."}]}]}/>

Тайм-аут (в секундах) для одной попытки установления соединения с конечной точкой PostgreSQL.
Значение передается как параметр `connect_timeout` в URL подключения.

## postgresql_connection_pool_auto_close_connection \\{#postgresql_connection_pool_auto_close_connection\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Закрывать соединение перед возвратом его в пул.

## postgresql_connection_pool_retries \\{#postgresql_connection_pool_retries\\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "Позволяет управлять количеством повторных попыток в пуле соединений PostgreSQL."}]}]}/>

Количество повторных попыток операций push/pop в пуле соединений для табличного движка PostgreSQL и движка базы данных PostgreSQL.

## postgresql_connection_pool_size \\{#postgresql_connection_pool_size\\}

<SettingsInfoBlock type="UInt64" default_value="16" />

Размер пула подключений для движка таблиц PostgreSQL и движка базы данных PostgreSQL.

## postgresql_connection_pool_wait_timeout \\{#postgresql_connection_pool_wait_timeout\\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

Таймаут операций push/pop с пулом соединений при пустом пуле для движка таблицы PostgreSQL и движка базы данных PostgreSQL. По умолчанию при пустом пуле операции блокируются.

## postgresql_fault_injection_probability \\{#postgresql_fault_injection_probability\\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

Оценочная вероятность сбоя внутренних (репликационных) запросов PostgreSQL. Допустимое значение — в интервале [0.0f, 1.0f].

## prefer_column_name_to_alias \{#prefer_column_name_to_alias\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает использование исходных имён столбцов вместо псевдонимов в выражениях и предложениях запроса. Это особенно важно, когда псевдоним совпадает с именем столбца, см. [Псевдонимы выражений](/sql-reference/syntax#notes-on-usage). Включите этот параметр, чтобы правила синтаксиса псевдонимов в ClickHouse были более совместимы с большинством других движков баз данных.

Возможные значения:

* 0 — имя столбца заменяется псевдонимом.
* 1 — имя столбца не заменяется псевдонимом.

**Пример**

Разница между включённым и выключенным значением настройки:

Запрос:

```sql
SET prefer_column_name_to_alias = 0;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

Результат:

```text
Received exception from server (version 21.5.1):
Code: 184. DB::Exception: Received from localhost:9000. DB::Exception: Aggregate function avg(number) is found inside another aggregate function in query: While processing avg(number) AS number.
```

Запрос:

```sql
SET prefer_column_name_to_alias = 1;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

Результат:

```text
┌─number─┬─max(number)─┐
│    4.5 │           9 │
└────────┴─────────────┘
```


## prefer_external_sort_block_bytes \\{#prefer_external_sort_block_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="16744704" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "16744704"},{"label": "Использовать максимально возможный размер блока для внешней сортировки, чтобы уменьшить потребление памяти при слиянии."}]}]}/>

Использовать максимально возможный размер блока для внешней сортировки, чтобы уменьшить потребление памяти при слиянии.

## prefer_global_in_and_join \\{#prefer_global_in_and_join\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает замену операторов `IN`/`JOIN` на `GLOBAL IN`/`GLOBAL JOIN`.

Возможные значения:

- 0 — Отключено. Операторы `IN`/`JOIN` не заменяются на `GLOBAL IN`/`GLOBAL JOIN`.
- 1 — Включено. Операторы `IN`/`JOIN` заменяются на `GLOBAL IN`/`GLOBAL JOIN`.

**Использование**

Хотя `SET distributed_product_mode=global` может изменить поведение запросов для distributed таблиц, это не подходит для локальных таблиц или таблиц из внешних ресурсов. В этом случае используется настройка `prefer_global_in_and_join`.

Например, у нас есть узлы, обслуживающие запросы, которые содержат локальные таблицы, не подходящие для распределения. Нам нужно распределять их данные «на лету» во время распределённой обработки с помощью ключевого слова `GLOBAL` — `GLOBAL IN`/`GLOBAL JOIN`.

Другой вариант использования `prefer_global_in_and_join` — доступ к таблицам, созданным внешними движками. Эта настройка помогает сократить количество обращений к внешним источникам при соединении таких таблиц: выполняется только один вызов на каждый запрос.

**См. также:**

- [Распределённые подзапросы](/sql-reference/operators/in#distributed-subqueries) для получения дополнительной информации об использовании `GLOBAL IN`/`GLOBAL JOIN`

## prefer_localhost_replica \\{#prefer_localhost_replica\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает/отключает предпочтительное использование локальной реплики (localhost) при обработке распределённых запросов.

Возможные значения:

- 1 — ClickHouse всегда отправляет запрос на локальную реплику, если она существует.
- 0 — ClickHouse использует стратегию балансировки, заданную настройкой [load_balancing](#load_balancing).

:::note
Отключите эту настройку, если вы используете [max_parallel_replicas](#max_parallel_replicas) без [parallel_replicas_custom_key](#parallel_replicas_custom_key).
Если [parallel_replicas_custom_key](#parallel_replicas_custom_key) задан, отключайте эту настройку только в том случае, если она используется в кластере с несколькими сегментами, содержащими несколько реплик.
Если она используется в кластере с одним сегментом и несколькими репликами, отключение этой настройки негативно скажется на работе кластера.
:::

## prefer_warmed_unmerged_parts_seconds \\{#prefer_warmed_unmerged_parts_seconds\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

Действует только в ClickHouse Cloud. Если слитая часть была создана менее чем указанное количество секунд назад и не была предварительно прогрета (см. [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch)), но все её исходные части доступны и предварительно прогреты, запросы SELECT будут вместо этого читать из этих частей. Применяется только для Replicated-/SharedMergeTree. Учтите, что эта настройка лишь проверяет, обрабатывалась ли часть CacheWarmer: если часть была загружена в кэш чем‑то другим, она всё равно будет считаться «холодной», пока до неё не дойдёт CacheWarmer; если же она была прогрета, а затем вытеснена из кэша, она всё равно будет считаться «тёплой».

## preferred_block_size_bytes \\{#preferred_block_size_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

Этот параметр настраивает размер блока данных для обработки запроса и служит дополнительной тонкой настройкой по сравнению с более грубым параметром `max_block_size`. Если столбцы большие и при `max_block_size` строк размер блока, вероятно, будет больше заданного количества байт, его размер будет уменьшен для улучшения локальности кэша процессора.

## preferred_max_column_in_block_size_bytes \\{#preferred_max_column_in_block_size_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение максимального размера столбца в блоке при чтении. Помогает уменьшить количество промахов кэша. Значение должно быть близко к размеру кэша L2.

## preferred_optimize_projection_name \\{#preferred_optimize_projection_name\\}

Если параметр установлен в непустую строку, ClickHouse попытается применить указанную проекцию в запросе.

Возможные значения:

- string: имя предпочтительной проекции

## prefetch_buffer_size \\{#prefetch_buffer_size\\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Максимальный размер буфера опережающего чтения из файловой системы.

## print_pretty_type_names \{#print_pretty_type_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "Better user experience."}]}]} />

Позволяет выводить глубоко вложенные имена типов в удобочитаемом виде с отступами в запросе `DESCRIBE` и в функции `toTypeName()`.

Пример:

```sql
CREATE TABLE test (a Tuple(b String, c Tuple(d Nullable(UInt64), e Array(UInt32), f Array(Tuple(g String, h Map(String, Array(Tuple(i String, j UInt64))))), k Date), l Nullable(String))) ENGINE=Memory;
DESCRIBE TABLE test FORMAT TSVRaw SETTINGS print_pretty_type_names=1;
```

```
a   Tuple(
    b String,
    c Tuple(
        d Nullable(UInt64),
        e Array(UInt32),
        f Array(Tuple(
            g String,
            h Map(
                String,
                Array(Tuple(
                    i String,
                    j UInt64
                ))
            )
        )),
        k Date
    ),
    l Nullable(String)
)
```


## priority \\{#priority\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Приоритет запроса. 1 — наивысший, чем больше значение, тем ниже приоритет; 0 — не использовать приоритеты.

## promql_database \\{#promql_database\\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "Новый экспериментальный параметр"}]}]}/>

Указывает имя базы данных, используемой диалектом `promql`. Пустая строка означает текущую базу данных.

## promql_evaluation_time \\{#promql_evaluation_time\\}

<ExperimentalBadge/>

**Псевдонимы**: `evaluation_time`

<SettingsInfoBlock type="FloatAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "auto"},{"label": "Настройка была переименована. Предыдущее имя — `evaluation_time`."}]}]}/>

Задаёт момент времени, используемый при вычислении запросов в диалекте PromQL. Значение `auto` соответствует текущему времени.

## promql_table \\{#promql_table\\}

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "Новая экспериментальная настройка"}]}]}/>

Задает имя таблицы TimeSeries, используемой диалектом 'promql'.

## push_external_roles_in_interserver_queries \\{#push_external_roles_in_interserver_queries\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting."}]}]}/>

Включает передачу пользовательских ролей от узла-инициатора к другим узлам кластера при выполнении запроса.

## query_cache_compress_entries \\{#query_cache_compress_entries\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Сжимает записи в [кэше запросов](../query-cache.md). Уменьшает расход памяти кэша запросов, однако замедляет операции вставки в него и чтения из него.

Возможные значения:

- 0 - Отключено
- 1 - Включено

## query_cache_max_entries \\{#query_cache_max_entries\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество результатов запросов, которые текущий пользователь может хранить в [кэше запросов](../query-cache.md). 0 означает отсутствие ограничений.

Возможные значения:

- Положительное целое число >= 0.

## query_cache_max_size_in_bytes \\{#query_cache_max_size_in_bytes\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объем памяти (в байтах), который текущий пользователь может использовать в [кэше запросов](../query-cache.md). 0 означает без ограничений по размеру.

Возможные значения:

- Целое число >= 0.

## query_cache_min_query_duration \\{#query_cache_min_query_duration\\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Минимальное время выполнения запроса в миллисекундах, необходимое для сохранения его результата в [кэше запросов](../query-cache.md).

Возможные значения:

- Положительное целое число >= 0.

## query_cache_min_query_runs \\{#query_cache_min_query_runs\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество выполнений запроса `SELECT`, после которого его результат будет сохранён в [кэше запросов](../query-cache.md).

Возможные значения:

- Целое число, большее или равное 0.

## query_cache_nondeterministic_function_handling \\{#query_cache_nondeterministic_function_handling\\}

<SettingsInfoBlock type="QueryResultCacheNondeterministicFunctionHandling" default_value="throw" />

Определяет, как [кэш запросов](../query-cache.md) обрабатывает `SELECT`-запросы с недетерминированными функциями, такими как `rand()` или `now()`.

Возможные значения:

- `'throw'` — Генерировать исключение и не кэшировать результат запроса.
- `'save'` — Кэшировать результат запроса.
- `'ignore'` — Не кэшировать результат запроса и не генерировать исключение.

## query_cache_share_between_users \\{#query_cache_share_between_users\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если включено, результаты запросов `SELECT`, закешированные в [query cache](../query-cache.md), могут быть прочитаны другими пользователями.
По соображениям безопасности не рекомендуется включать этот параметр.

Возможные значения:

- 0 — Отключено
- 1 — Включено

## query_cache_squash_partial_results \\{#query_cache_squash_partial_results\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Объединяет частичные блоки результатов в блоки размера [max_block_size](#max_block_size). Снижает производительность вставок в [query cache](../query-cache.md), но улучшает степень сжатия элементов кэша (см. [query_cache_compress-entries](#query_cache_compress_entries)).

Возможные значения:

- 0 - Отключено
- 1 - Включено

## query_cache_system_table_handling \\{#query_cache_system_table_handling\\}

<SettingsInfoBlock type="QueryResultCacheSystemTableHandling" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "throw"},{"label": "Кэш запросов больше не кэширует результаты запросов к системным таблицам"}]}]}/>

Определяет, как [кэш запросов](../query-cache.md) обрабатывает запросы `SELECT` к системным таблицам, то есть таблицам в базах данных `system.*` и `information_schema.*`.

Возможные значения:

- `'throw'` — Генерировать исключение и не кэшировать результат запроса.
- `'save'` — Кэшировать результат запроса.
- `'ignore'` — Не кэшировать результат запроса и не генерировать исключение.

## query_cache_tag \\{#query_cache_tag\\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": ""},{"label": "Новая настройка для пометки настроек кэша запросов."}]}]}/>

Строка, которая используется как метка для записей [кэша запросов](../query-cache.md).
Один и тот же запрос с разными тегами кэш запросов рассматривает как разные запросы.

Возможные значения:

- Любая строка

## query_cache_ttl \\{#query_cache_ttl\\}

<SettingsInfoBlock type="Seconds" default_value="60" />

По истечении этого времени в секундах записи в [кеше запросов](../query-cache.md) становятся устаревшими.

Возможные значения:

- Положительное целое число >= 0.

## query_condition_cache_store_conditions_as_plaintext \\{#query_condition_cache_store_conditions_as_plaintext\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

Сохраняет условие фильтра для [кэша условий запроса](/operations/query-condition-cache) в виде обычного текста.
Если включено, system.query_condition_cache показывает исходное условие фильтра, что упрощает отладку проблем с кэшем.
По умолчанию отключено, так как условия фильтра в открытом виде могут раскрывать конфиденциальную информацию.

Возможные значения:

- 0 - Отключено
- 1 - Включено

## query_metric_log_interval \\{#query_metric_log_interval\\}

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "-1"},{"label": "Новая настройка."}]}]}/>

Интервал в миллисекундах, с которым выполняется сбор [query_metric_log](../../operations/system-tables/query_metric_log.md) для отдельных запросов.

Если установлено любое отрицательное значение, будет использовано значение `collect_interval_milliseconds` из [настройки query_metric_log](/operations/server-configuration-parameters/settings#query_metric_log), а если оно не задано — по умолчанию используется 1000.

Чтобы отключить сбор метрик для одного запроса, установите `query_metric_log_interval` в 0.

Значение по умолчанию: -1

## query_plan_aggregation_in_order \\{#query_plan_aggregation_in_order\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.12"},{"label": "1"},{"label": "Включение части рефакторинга плана запроса"}]}]}/>

Включает или отключает оптимизацию агрегирования по порядку на уровне плана запроса.
Применяется только если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка для экспертов, которую разработчикам следует использовать только для отладки. В будущем она может измениться с нарушением обратной совместимости или быть удалена.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_convert_any_join_to_semi_or_anti_join \\{#query_plan_convert_any_join_to_semi_or_anti_join\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

Разрешает преобразовывать ANY JOIN в SEMI или ANTI JOIN, если фильтр после JOIN всегда принимает логическое значение false как для сопоставленных, так и для несопоставленных строк

## query_plan_convert_join_to_in \\{#query_plan_convert_join_to_in\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

Разрешает преобразовывать оператор `JOIN` в подзапрос с `IN`, если выходные столбцы ссылаются только на левую таблицу. Может приводить к неверным результатам для типов `JOIN`, отличных от `ANY` (например, `ALL JOIN`, используемый по умолчанию).

## query_plan_convert_outer_join_to_inner_join \\{#query_plan_convert_outer_join_to_inner_join\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "Разрешает преобразование OUTER JOIN в INNER JOIN, если фильтр после JOIN всегда отфильтровывает строки со значениями по умолчанию"}]}]}/>

Разрешает преобразование `OUTER JOIN` в `INNER JOIN`, если фильтр после `JOIN` всегда отфильтровывает строки со значениями по умолчанию

## query_plan_direct_read_from_text_index \\{#query_plan_direct_read_from_text_index\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

Позволяет выполнять фильтрацию результатов полнотекстового поиска, используя в плане запроса только инвертированный текстовый индекс.

## query_plan_display_internal_aliases \\{#query_plan_display_internal_aliases\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

Отображать внутренние алиасы (например, __table1) в выводе EXPLAIN PLAN вместо тех, что указаны в исходном запросе.

## query_plan_enable_multithreading_after_window_functions \\{#query_plan_enable_multithreading_after_window_functions\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает многопоточную обработку после вычисления оконных функций для параллельной обработки потоков

## query_plan_enable_optimizations \\{#query_plan_enable_optimizations\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Переключает режим оптимизации запросов на уровне плана запроса.

:::note
Это параметр для экспертов, который должен использоваться только разработчиками для отладки. В будущем параметр может измениться с нарушением обратной совместимости или быть удалён.
:::

Возможные значения:

- 0 — Отключить все оптимизации на уровне плана запроса
- 1 — Включить оптимизации на уровне плана запроса (но отдельные оптимизации всё ещё могут быть отключены их собственными настройками)

## query_plan_execute_functions_after_sorting \\{#query_plan_execute_functions_after_sorting\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Переключает оптимизацию на уровне плана запроса, которая перемещает выражения после шагов сортировки.
Применяется только в том случае, если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка для экспертов, предназначенная только для разработчиков и применяемая для отладки. В будущем она может измениться с нарушением обратной совместимости или быть удалена.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_filter_push_down \\{#query_plan_filter_push_down\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию на уровне плана запроса, которая опускает фильтры ниже в плане выполнения.
Применяется только если настройка [query_plan_enable_optimizations](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка для экспертов, которую следует использовать только разработчикам для отладки. Настройка может в будущем измениться обратно несовместимым образом или быть удалена.
:::

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_join_shard_by_pk_ranges \\{#query_plan_join_shard_by_pk_ranges\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

Применяет распределение по сегментам для JOIN, если ключи соединения содержат префикс PRIMARY KEY для обеих таблиц. Поддерживается для алгоритмов hash, parallel_hash и full_sorting_merge. Обычно не ускоряет выполнение запросов, но может снизить потребление памяти.

## query_plan_join_swap_table \\{#query_plan_join_swap_table\\}

<SettingsInfoBlock type="BoolAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "auto"},{"label": "Новая настройка. Ранее всегда выбиралась правая таблица."}]}]}/>

Определяет, какая сторона соединения должна быть таблицей построения (build-таблицей, внутренней стороной соединения — той, строки которой вставляются в хеш-таблицу для hash join) в плане запроса. Эта настройка поддерживается только для строгости соединения `ALL` с предложением `JOIN ON`. Возможные значения:

- 'auto': позволить планировщику решить, какую таблицу использовать в качестве таблицы построения.
    - 'false': никогда не менять таблицы местами (правая таблица — таблица построения).
    - 'true': всегда менять таблицы местами (левая таблица — таблица построения).

## query_plan_lift_up_array_join \\{#query_plan_lift_up_array_join\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию на уровне плана запроса, которая поднимает `ARRAY JOIN` выше в плане выполнения.
Вступает в силу только в том случае, если настройка [query_plan_enable_optimizations](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка для экспертов, которую разработчикам следует использовать только для отладки. В будущем она может измениться с нарушением обратной совместимости или быть удалена.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_lift_up_union \\{#query_plan_lift_up_union\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Переключает оптимизацию на уровне плана запроса, которая перемещает более крупные поддеревья плана запроса в `UNION`, чтобы сделать возможными дальнейшие оптимизации.
Действует только, если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) имеет значение 1.

:::note
Это настройка для экспертов, которая должна использоваться только для отладки разработчиками. В будущем она может измениться несовместимым с предыдущими версиями образом или быть удалена.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_max_limit_for_lazy_materialization \\{#query_plan_max_limit_for_lazy_materialization\\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "10"},{"label": "Добавлена новая настройка для управления максимальным значением лимита, при котором может использоваться план запроса для оптимизации ленивой материализации. Если значение равно нулю, лимит отсутствует"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "10000"},{"label": "Увеличен лимит после улучшения производительности"}]}, {"id": "row-3","items": [{"label": "25.11"},{"label": "100"},{"label": "Более оптимальное значение"}]}]}/>

Управляет максимальным значением лимита, при котором может использоваться план запроса для оптимизации ленивой материализации. Если значение равно нулю, лимит отсутствует.

## query_plan_max_limit_for_top_k_optimization \\{#query_plan_max_limit_for_top_k_optimization\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1000"},{"label": "Новая настройка."}]}]}/>

Управляет максимальным значением `LIMIT`, при котором можно рассчитывать план запроса для оптимизации TopK с использованием minmax skip-индекса и динамической фильтрации по пороговым значениям. Если установлено в 0, ограничение отсутствует.

## query_plan_max_optimizations_to_apply \\{#query_plan_max_optimizations_to_apply\\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Ограничивает общее количество оптимизаций, применяемых к плану запроса, см. настройку [query_plan_enable_optimizations](#query_plan_enable_optimizations).
Полезно, чтобы избежать длительной оптимизации сложных запросов.
В запросе EXPLAIN PLAN оптимизации перестают применяться после достижения этого лимита, и план возвращается как есть.
При обычном выполнении запроса, если фактическое число оптимизаций превышает это значение настройки, будет выброшено исключение.

:::note
Это настройка экспертного уровня, которую следует использовать только для отладки разработчиками. Настройка может в будущем измениться несовместимым образом или быть удалена.
:::

## query_plan_max_step_description_length \\{#query_plan_max_step_description_length\\}

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "500"},{"label": "Новая настройка"}]}]}/>

Максимальная длина описания шага в EXPLAIN PLAN.

## query_plan_merge_expressions \\{#query_plan_merge_expressions\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию на уровне плана запроса, которая объединяет последовательные фильтры.
Действует только если значение настройки [query_plan_enable_optimizations](#query_plan_enable_optimizations) равно 1.

:::note
Это настройка для экспертов, которую разработчикам следует использовать только для отладки. В будущем она может измениться с нарушением обратной совместимости или быть удалена.
:::

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_merge_filter_into_join_condition \\{#query_plan_merge_filter_into_join_condition\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Добавлена новая настройка для объединения фильтра с условием `JOIN`"}]}]}/>

Позволяет объединять фильтр с условием `JOIN` и преобразовывать `CROSS JOIN` в `INNER JOIN`.

## query_plan_merge_filters \\{#query_plan_merge_filters\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Разрешает объединение фильтров в плане запроса"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "Разрешает объединение фильтров в плане запроса. Это необходимо для корректной поддержки проталкивания фильтров (filter push-down) новым анализатором."}]}]}/>

Разрешает объединение фильтров в плане запроса.

## query_plan_optimize_join_order_algorithm \\{#query_plan_optimize_join_order_algorithm\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="JoinOrderAlgorithm" default_value="greedy" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "greedy"},{"label": "New experimental setting."}]}]}/>

Указывает, какие алгоритмы определения порядка JOIN следует использовать при оптимизации плана запроса. Доступны следующие алгоритмы:

- 'greedy' — базовый жадный алгоритм, работает быстро, но может не дать наилучший порядок соединения.
- 'dpsize' — реализует алгоритм DPsize (в данный момент только для INNER JOIN); перебирает все возможные порядки соединений и находит наиболее оптимальный, но может быть медленным для запросов с большим количеством таблиц и предикатов соединения.

Можно указать несколько алгоритмов, например 'dpsize,greedy'.

## query_plan_optimize_join_order_limit \\{#query_plan_optimize_join_order_limit\\}

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "Новая настройка"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "10"},{"label": "По умолчанию разрешить изменение порядка операций JOIN для большего числа таблиц"}]}]}/>

Оптимизирует порядок операций JOIN в пределах одного подзапроса. В настоящее время поддерживается только для очень ограниченного набора случаев.
    Значение задаёт максимальное количество таблиц, для которых выполняется оптимизация.

## query_plan_optimize_lazy_materialization \\{#query_plan_optimize_lazy_materialization\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Добавлена новая настройка для использования плана выполнения запроса при оптимизации ленивой материализации"}]}]}/>

Использовать план выполнения запроса для оптимизации ленивой материализации.

## query_plan_optimize_prewhere \\{#query_plan_optimize_prewhere\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Включает проталкивание фильтра в выражение PREWHERE для поддерживаемых хранилищ"}]}]}/>

Включает проталкивание фильтра в выражение PREWHERE для поддерживаемых хранилищ

## query_plan_push_down_limit \\{#query_plan_push_down_limit\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Переключает оптимизацию на уровне плана выполнения запроса, которая перемещает оператор LIMIT вниз по плану выполнения.
Применяется только если настройка [query_plan_enable_optimizations](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка экспертного уровня, которую следует использовать только разработчиками для отладки. В будущем настройка может измениться с нарушением обратной совместимости или быть удалена.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_read_in_order \\{#query_plan_read_in_order\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Управляет оптимизацией чтения по порядку на уровне плана запроса.
Вступает в силу только если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка экспертного уровня, которая должна использоваться только разработчиками для отладки. В будущем она может измениться несовместимым образом или быть удалена.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_read_in_order_through_join \\{#query_plan_read_in_order_through_join\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

Сохраняет чтение в упорядоченном виде из левой таблицы в операциях JOIN, чтобы его могли использовать последующие шаги.

## query_plan_remove_redundant_distinct \\{#query_plan_remove_redundant_distinct\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "1"},{"label": "Remove redundant Distinct step in query plan"}]}]}/>

Включает или отключает оптимизацию на уровне плана запроса, которая удаляет избыточные шаги DISTINCT.
Оказывает эффект только если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) равна 1.

:::note
Это параметр для экспертов, который разработчики должны использовать только для отладки. В будущем он может измениться с нарушением обратной совместимости или быть удалён.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_remove_redundant_sorting \\{#query_plan_remove_redundant_sorting\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.1"},{"label": "1"},{"label": "Удаляет избыточную сортировку в плане запроса. Например, шаги сортировки, связанные с предложениями ORDER BY в подзапросах"}]}]}/>

Включает оптимизацию на уровне плана запроса, которая удаляет избыточные этапы сортировки, например в подзапросах.
Вступает в силу, только если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка для экспертов, которую следует использовать только разработчикам для отладки. В будущем параметр может измениться с нарушением обратной совместимости или быть удалён.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_remove_unused_columns \\{#query_plan_remove_unused_columns\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "Новая настройка. Добавлена оптимизация, удаляющая неиспользуемые столбцы в плане запроса."}]}]}/>

Переключает оптимизацию на уровне плана запроса, которая пытается удалить неиспользуемые столбцы (как входные, так и выходные) из шагов плана запроса.
Применяется только если настройка [query_plan_enable_optimizations](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка экспертного уровня, которую следует использовать разработчиками только для отладки. В будущем она может измениться с нарушением обратной совместимости или быть удалена.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_reuse_storage_ordering_for_window_functions \\{#query_plan_reuse_storage_ordering_for_window_functions\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию на уровне плана запроса, которая использует сортировку данных в хранилище при сортировке для оконных функций.
Влияет на поведение только в том случае, если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) установлена в 1.

:::note
Это настройка экспертного уровня, которую следует использовать только разработчикам для отладки. В будущем она может измениться несовместимым образом или быть удалена.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_split_filter \\{#query_plan_split_filter\\}

<SettingsInfoBlock type="Bool" default_value="1" />

:::note
Это настройка экспертного уровня, которую разработчикам следует использовать только для отладки. В будущем настройка может измениться несовместимым образом или быть удалена.
:::

Переключает оптимизацию на уровне плана запроса, которая разбивает условия фильтрации на отдельные выражения.
Вступает в силу только если настройка [query_plan_enable_optimizations](#query_plan_enable_optimizations) равна 1.

Возможные значения:

- 0 — отключить
- 1 — включить

## query_plan_text_index_add_hint \\{#query_plan_text_index_add_hint\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

Позволяет добавлять подсказку (additional predicate) для фильтрации, выполняемой с использованием инвертированного текстового индекса в плане запроса.

## query_plan_try_use_vector_search \\{#query_plan_try_use_vector_search\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "New setting."}]}]}/>

Переключает оптимизацию на уровне плана запроса, которая пытается использовать индекс векторного сходства.
Вступает в силу только в том случае, если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка для экспертов, которую следует использовать только для отладки разработчиками. В будущем она может измениться несовместимым с предыдущими версиями образом или быть удалена.
:::

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_use_new_logical_join_step \\{#query_plan_use_new_logical_join_step\\}

**Псевдонимы**: `query_plan_use_logical_join_step`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Включить новый шаг"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Новый шаг JOIN, внутреннее изменение"}]}]}/>

Использовать логический шаг JOIN в плане запроса.
Примечание: настройка `query_plan_use_new_logical_join_step` устарела, вместо неё используйте `query_plan_use_logical_join_step`.

## query_profiler_cpu_time_period_ns \\{#query_profiler_cpu_time_period_ns\\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

Задаёт период таймера, основанного на тактах CPU, для [профилировщика запросов](../../operations/optimizing-performance/sampling-query-profiler.md). Этот таймер учитывает только процессорное время.

Возможные значения:

- Положительное целое число наносекунд.

    Рекомендуемые значения:

            - 10000000 (100 раз в секунду) наносекунд и более для одиночных запросов.
            - 1000000000 (раз в секунду) для профилирования на уровне всего кластера.

- 0 — для отключения таймера.

См. также:

- Системная таблица [trace_log](/operations/system-tables/trace_log)

## query_profiler_real_time_period_ns \\{#query_profiler_real_time_period_ns\\}

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

Устанавливает период таймера реального времени для [профилировщика запросов](../../operations/optimizing-performance/sampling-query-profiler.md). Таймер реального времени измеряет так называемое «настенное» время (wall-clock time).

Возможные значения:

- Положительное целое число в наносекундах.

    Рекомендуемые значения:

            - 10000000 наносекунд (100 раз в секунду) и меньше — для отдельных запросов.
            - 1000000000 наносекунд (раз в секунду) — для профилирования всего кластера.

- 0 — для отключения таймера.

См. также:

- Системная таблица [trace_log](/operations/system-tables/trace_log)

## queue_max_wait_ms \\{#queue_max_wait_ms\\}

<SettingsInfoBlock type="Миллисекунды" default_value="0" />

Время ожидания в очереди запросов, если количество одновременных запросов превышает установленный максимум.

## rabbitmq_max_wait_ms \\{#rabbitmq_max_wait_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

Время ожидания перед повторной попыткой чтения из RabbitMQ.

## read_backoff_max_throughput \\{#read_backoff_max_throughput\\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Параметр для уменьшения числа потоков при медленном чтении. Подсчитывает события, когда пропускная способность чтения меньше указанного количества байт в секунду.

## read_backoff_min_concurrency \\{#read_backoff_min_concurrency\\}

<SettingsInfoBlock type="UInt64" default_value="1" />

Настройка, определяющая минимальное количество потоков, которое следует поддерживать при медленном чтении.

## read_backoff_min_events \\{#read_backoff_min_events\\}

<SettingsInfoBlock type="UInt64" default_value="2" />

Параметр для уменьшения числа потоков при медленном чтении. Количество событий, по истечении которого число потоков будет уменьшено.

## read_backoff_min_interval_between_events_ms \\{#read_backoff_min_interval_between_events_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

Параметр для уменьшения числа потоков в случае медленного чтения. Событие игнорируется, если с момента предыдущего прошло меньше заданного интервала времени.

## read_backoff_min_latency_ms \\{#read_backoff_min_latency_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

Настройка, уменьшающая число потоков в случае медленного чтения. Учитываются только операции чтения, которые длились не менее этого времени.

## read_from_distributed_cache_if_exists_otherwise_bypass_cache \\{#read_from_distributed_cache_if_exists_otherwise_bypass_cache\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Действует только в ClickHouse Cloud. Аналогичен read_from_filesystem_cache_if_exists_otherwise_bypass_cache, но для распределённого кэша.

## read_from_filesystem_cache_if_exists_otherwise_bypass_cache \\{#read_from_filesystem_cache_if_exists_otherwise_bypass_cache\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использовать кэш файловой системы в пассивном режиме — использовать уже существующие записи в кэше, но не добавлять в него новые. Если вы включите этот параметр для тяжёлых ad-hoc-запросов и оставите его отключённым для коротких запросов реального времени, это позволит избежать чрезмерного вытеснения данных из кэша тяжёлыми запросами и повысить общую эффективность системы.

## read_from_page_cache_if_exists_otherwise_bypass_cache \\{#read_from_page_cache_if_exists_otherwise_bypass_cache\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Добавлен кэш страниц в пространстве пользователя (userspace page cache)"}]}]}/>

Использует кэш страниц в пространстве пользователя (userspace page cache) в пассивном режиме, аналогично read_from_filesystem_cache_if_exists_otherwise_bypass_cache.

## read_in_order_two_level_merge_threshold \\{#read_in_order_two_level_merge_threshold\\}

<SettingsInfoBlock type="UInt64" default_value="100" />

Минимальное число частей, которые необходимо прочитать, чтобы выполнить предварительное слияние при многопоточном чтении в порядке первичного ключа.

## read_in_order_use_buffering \\{#read_in_order_use_buffering\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "Использовать буферизацию перед слиянием при чтении в порядке первичного ключа"}]}]}/>

Использовать буферизацию перед слиянием при чтении в порядке первичного ключа. Это повышает степень параллелизма выполнения запроса

## read_in_order_use_virtual_row \\{#read_in_order_use_virtual_row\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "Использовать виртуальную строку при чтении в порядке первичного ключа или его монотонной функции. Полезно при поиске по нескольким частям таблицы, так как затрагиваются только соответствующие части."}]}]}/>

Использовать виртуальную строку при чтении в порядке первичного ключа или его монотонной функции. Полезно при поиске по нескольким частям таблицы, так как затрагиваются только соответствующие части.

## read_overflow_mode \\{#read_overflow_mode\\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Что делать при превышении лимита.

## read_overflow_mode_leaf \\{#read_overflow_mode_leaf\\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что происходит, когда объём считываемых данных превышает один из листовых лимитов.

Возможные значения:

- `throw`: выбросить исключение (по умолчанию).
- `break`: остановить выполнение запроса и вернуть частичный результат.

## read_priority \\{#read_priority\\}

<SettingsInfoBlock type="Int64" default_value="0" />

Приоритет при чтении данных из локальной или удалённой файловой системы. Поддерживается только для метода 'pread_threadpool' для локальной файловой системы и для метода `threadpool` для удалённой файловой системы.

## read_through_distributed_cache \\{#read_through_distributed_cache\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Настройка для ClickHouse Cloud"}]}]}/>

Имеет эффект только в ClickHouse Cloud. Разрешает чтение из распределённого кэша.

## readonly \\{#readonly\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

0 — без ограничений на чтение и запись. 1 — только запросы на чтение, а также изменение явно разрешённых настроек. 2 — только запросы на чтение, а также изменение настроек, за исключением настройки «readonly».

## receive_data_timeout_ms \\{#receive_data_timeout_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="2000" />

Таймаут ожидания получения первого пакета данных или пакета с положительным прогрессом от реплики

## receive_timeout \\{#receive_timeout\\}

<SettingsInfoBlock type="Seconds" default_value="300" />

Таймаут ожидания получения данных из сети, в секундах. Если в течение этого интервала не было получено ни одного байта, будет сгенерировано исключение. Если вы задаёте этот параметр на клиенте, для сокета на сервере на соответствующем конце соединения также будет установлен `send_timeout`.

## regexp_dict_allow_hyperscan \\{#regexp_dict_allow_hyperscan\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает словарю regexp_tree использовать библиотеку Hyperscan.

## regexp_dict_flag_case_insensitive \\{#regexp_dict_flag_case_insensitive\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Использует регистронезависимое сопоставление для словаря regexp_tree. Может быть переопределено в отдельных выражениях с помощью флагов (?i) и (?-i).

## regexp_dict_flag_dotall \\{#regexp_dict_flag_dotall\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает символу «.» совпадать с символами новой строки в словаре regexp_tree.

## regexp_max_matches_per_row \\{#regexp_max_matches_per_row\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Устанавливает максимальное количество совпадений регулярного выражения в одной строке. Используйте этот параметр для защиты от чрезмерного потребления памяти при использовании жадного регулярного выражения в функции [extractAllGroupsHorizontal](/sql-reference/functions/string-search-functions#extractAllGroupsHorizontal).

Возможные значения:

- Положительное целое число.

## reject_expensive_hyperscan_regexps \\{#reject_expensive_hyperscan_regexps\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Отклонять шаблоны, которые, вероятно, будут ресурсоёмкими при обработке с помощью Hyperscan (из-за взрывного роста числа состояний NFA)

## remerge_sort_lowered_memory_bytes_ratio \\{#remerge_sort_lowered_memory_bytes_ratio\\}

<SettingsInfoBlock type="Float" default_value="2" />

Если использование памяти после повторного слияния не уменьшится как минимум в этом соотношении, повторное слияние будет отключено.

## remote_filesystem_read_method \\{#remote_filesystem_read_method\\}

<SettingsInfoBlock type="String" default_value="threadpool" />

Метод чтения данных из удаленной файловой системы, один из следующих: read, threadpool.

## remote_filesystem_read_prefetch \\{#remote_filesystem_read_prefetch\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Следует использовать упреждающую выборку (prefetching) при чтении данных из удалённой файловой системы.

## remote_fs_read_backoff_max_tries \\{#remote_fs_read_backoff_max_tries\\}

<SettingsInfoBlock type="UInt64" default_value="5" />

Максимальное количество попыток чтения с применением механизма backoff

## remote_fs_read_max_backoff_ms \\{#remote_fs_read_max_backoff_ms\\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное время ожидания при попытке прочитать данные с удалённого диска.

## remote_read_min_bytes_for_seek \\{#remote_read_min_bytes_for_seek\\}

<SettingsInfoBlock type="UInt64" default_value="4194304" />

Минимальный объем данных (в байтах), при котором при удалённом чтении (URL, S3) выполняется seek вместо чтения с последующим игнорированием.

## rename_files_after_processing \\{#rename_files_after_processing\\}

- **Тип:** String

- **Значение по умолчанию:** Пустая строка

Этот параметр позволяет задать шаблон переименования файлов, обрабатываемых табличной функцией `file`. Если параметр задан, все файлы, прочитанные табличной функцией `file`, будут переименованы в соответствии с указанным шаблоном с плейсхолдерами, но только в случае их успешной обработки.

### Подстановки \{#placeholders\}

- `%a` — Полное исходное имя файла (например, "sample.csv").
- `%f` — Исходное имя файла без расширения (например, "sample").
- `%e` — Исходное расширение файла с точкой (например, ".csv").
- `%t` — Временная метка (в микросекундах).
- `%%` — Знак процента ("%").

### Пример \{#example\}

- Опция: `--rename_files_after_processing="processed_%f_%t%e"`

- Запрос: `SELECT * FROM file('sample.csv')`

Если чтение файла `sample.csv` прошло успешно, файл будет переименован в `processed_sample_1683473210851438.csv`

## replace_running_query \\{#replace_running_query\\}

<SettingsInfoBlock type="Bool" default_value="0" />

При использовании HTTP-интерфейса можно передать параметр `query_id`. Это любая строка, которая служит идентификатором запроса.
Если в данный момент уже существует запрос от того же пользователя с тем же `query_id`, поведение зависит от параметра `replace_running_query`.

`0` (по умолчанию) – сгенерировать исключение (не позволять запросу выполняться, если запрос с тем же `query_id` уже выполняется).

`1` – отменить старый запрос и запустить новый.

Установите для этого параметра значение `1` для реализации подсказок при задании условий сегментации. После ввода очередного символа, если старый запрос ещё не завершён, он должен быть отменён.

## replace_running_query_max_wait_ms \\{#replace_running_query_max_wait_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

Время ожидания завершения уже выполняющегося запроса с тем же `query_id`, когда включена настройка [replace_running_query](#replace_running_query).

Возможные значения:

- Положительное целое число.
- 0 — выбрасывается исключение, не позволяющее запустить новый запрос, если сервер уже выполняет запрос с тем же `query_id`.

## replication_wait_for_inactive_replica_timeout \\{#replication_wait_for_inactive_replica_timeout\\}

<SettingsInfoBlock type="Int64" default_value="120" />

Указывает время (в секундах), в течение которого следует ждать выполнения запросов [`ALTER`](../../sql-reference/statements/alter/index.md), [`OPTIMIZE`](../../sql-reference/statements/optimize.md) или [`TRUNCATE`](../../sql-reference/statements/truncate.md) неактивными репликами.

Возможные значения:

- `0` — Не ждать.
- Отрицательное целое число — Ждать неограниченное время.
- Положительное целое число — Количество секунд ожидания.

## restore_replace_external_dictionary_source_to_null \\{#restore_replace_external_dictionary_source_to_null\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "New setting."}]}]}/>

Заменять внешние источники словаря на значение Null при восстановлении. Полезно для тестирования.

## restore_replace_external_engines_to_null \\{#restore_replace_external_engines_to_null\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "New setting."}]}]}/>

Для тестирования. Заменяет все внешние движки на Null, чтобы не устанавливать внешние подключения.

## restore_replace_external_table_functions_to_null \\{#restore_replace_external_table_functions_to_null\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Для тестирования. Заменяет все внешние табличные функции на Null, чтобы не устанавливать внешние подключения.

## restore_replicated_merge_tree_to_shared_merge_tree \\{#restore_replicated_merge_tree_to_shared_merge_tree\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Заменяет табличный движок Replicated*MergeTree на Shared*MergeTree при выполнении RESTORE.

## result_overflow_mode \{#result_overflow_mode\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Значение по умолчанию в Cloud: `throw`

Определяет, что делать, если объём результата превышает один из лимитов.

Возможные значения:

* `throw`: сгенерировать исключение (значение по умолчанию).
* `break`: остановить выполнение запроса и вернуть частичный результат, как если бы
  исходные данные закончились.

Использование &#39;break&#39; аналогично использованию LIMIT. `Break` прерывает выполнение только на
уровне блока. Это означает, что количество возвращённых строк будет больше,
чем [`max_result_rows`](/operations/settings/settings#max_result_rows), кратно [`max_block_size`](/operations/settings/settings#max_block_size)
и зависит от [`max_threads`](/operations/settings/settings#max_threads).

**Пример**

```sql title="Query"
SET max_threads = 3, max_block_size = 3333;
SET max_result_rows = 3334, result_overflow_mode = 'break';

SELECT *
FROM numbers_mt(100000)
FORMAT Null;
```

```text title="Result"
6666 rows in set. ...
```


## rewrite_count_distinct_if_with_count_distinct_implementation \\{#rewrite_count_distinct_if_with_count_distinct_implementation\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.8"},{"label": "1"},{"label": "Переписывать countDistinctIf с конфигурацией count_distinct_implementation"}]}]}/>

Позволяет переписывать функцию `countDistcintIf` в соответствии с настройкой [count_distinct_implementation](#count_distinct_implementation).

Возможные значения:

- true — разрешить.
- false — запретить.

## rewrite_in_to_join \\{#rewrite_in_to_join\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

Переписывает выражения вида `x IN subquery` в JOIN. Это может быть полезно для оптимизации всего запроса за счёт изменения порядка выполнения JOIN.

## rows_before_aggregation \\{#rows_before_aggregation\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "Предоставляет точное значение статистики rows_before_aggregation, отражающей количество строк, прочитанных до агрегации"}]}]}/>

Если параметр включён, ClickHouse предоставляет точное значение статистики rows_before_aggregation, отражающей количество строк, прочитанных до агрегации.

## s3_allow_multipart_copy \\{#s3_allow_multipart_copy\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Новая настройка."}]}]}/>

Разрешает многокомпонентное (multipart) копирование в S3.

## s3_allow_parallel_part_upload \\{#s3_allow_parallel_part_upload\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать несколько потоков для multipart-загрузки в S3. Это может привести к немного большему расходу памяти.

## s3_check_objects_after_upload \\{#s3_check_objects_after_upload\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Проверять каждый загруженный объект в S3 с помощью HEAD-запроса, чтобы убедиться, что загрузка прошла успешно.

## s3_connect_timeout_ms \\{#s3_connect_timeout_ms\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "Добавлена отдельная настройка таймаута подключения к S3"}]}]}/>

Таймаут подключения к хосту для S3-дисков.

## s3_create_new_file_on_insert \\{#s3_create_new_file_on_insert\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает создание нового файла при каждой вставке в таблицы движка S3. Если параметр включён, при каждой вставке будет создаваться новый объект S3 с ключом по следующему шаблону:

изначально: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` и т.д.

Возможные значения:

- 0 — запрос `INSERT` создаёт новый файл или завершает выполнение с ошибкой, если файл существует и s3_truncate_on_insert не задан.
- 1 — запрос `INSERT` создаёт новый файл при каждой вставке, используя суффикс (начиная со второго), если s3_truncate_on_insert не задан.

Подробнее см. [здесь](/integrations/s3#inserting-data).

## s3_disable_checksum \\{#s3_disable_checksum\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Не вычислять контрольную сумму при отправке файла в S3. Это ускоряет операции записи, поскольку исключаются лишние проходы обработки файла. В большинстве случаев это безопасно, поскольку данные таблиц MergeTree в любом случае проверяются контрольными суммами в ClickHouse, а при доступе к S3 по HTTPS уровень TLS уже обеспечивает целостность данных при передаче по сети. Дополнительные контрольные суммы на стороне S3 при этом обеспечивают дополнительный уровень (многоуровневой) защиты.

## s3_ignore_file_doesnt_exist \\{#s3_ignore_file_doesnt_exist\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Разрешить возвращать 0 строк, если запрошенные файлы отсутствуют, вместо выбрасывания исключения в движке таблиц S3"}]}]}/>

Игнорировать отсутствие файлов при чтении определённых ключей.

Возможные значения:

- 1 — `SELECT` возвращает пустой результат.
- 0 — `SELECT` выбрасывает исключение.

## s3_list_object_keys_size \\{#s3_list_object_keys_size\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальное количество файлов, которое может быть возвращено одним пакетным запросом ListObject

## s3_max_connections \\{#s3_max_connections\\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

Максимальное количество соединений на один сервер.

## s3_max_get_burst \\{#s3_max_get_burst\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество запросов, которые могут быть отправлены одновременно до достижения лимита по запросам в секунду. По умолчанию (0) — значение `s3_max_get_rps`.

## s3_max_get_rps \\{#s3_max_get_rps\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Порог по числу запросов S3 GET в секунду, после превышения которого включается троттлинг. Ноль означает отсутствие ограничения.

## s3_max_inflight_parts_for_one_file \\{#s3_max_inflight_parts_for_one_file\\}

<SettingsInfoBlock type="UInt64" default_value="20" />

Максимальное количество одновременно загружаемых частей в multipart‑запросе на многокомпонентную загрузку. Значение 0 означает отсутствие ограничения.

## s3_max_part_number \\{#s3_max_part_number\\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "10000"},{"label": "Максимальный номер части при многочастичной загрузке в S3"}]}]}/>

Максимальный номер части при многочастичной загрузке в S3.

## s3_max_put_burst \\{#s3_max_put_burst\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество запросов, которые могут быть выполнены одновременно до достижения лимита на число запросов в секунду. По умолчанию (0) соответствует значению `s3_max_put_rps`.

## s3_max_put_rps \\{#s3_max_put_rps\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Лимит скорости S3 PUT-запросов в секунду до начала троттлинга. Ноль означает отсутствие ограничений.

## s3_max_single_operation_copy_size \\{#s3_max_single_operation_copy_size\\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "33554432"},{"label": "Максимальный размер данных для одной операции копирования в S3"}]}]}/>

Максимальный размер данных для однократной операции копирования в S3. Этот параметр используется только, если s3_allow_multipart_copy имеет значение true.

## s3_max_single_part_upload_size \\{#s3_max_single_part_upload_size\\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

Максимальный размер объекта для загрузки в S3 с использованием однократной (single-part) загрузки.

## s3_max_single_read_retries \\{#s3_max_single_read_retries\\}

<SettingsInfoBlock type="UInt64" default_value="4" />

Максимальное количество повторных попыток при одном чтении из S3.

## s3_max_unexpected_write_error_retries \\{#s3_max_unexpected_write_error_retries\\}

<SettingsInfoBlock type="UInt64" default_value="4" />

Максимальное количество повторных попыток в случае непредвиденных ошибок при записи в S3.

## s3_max_upload_part_size \\{#s3_max_upload_part_size\\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

Максимальный размер части при многокомпонентной загрузке (multipart upload) в S3.

## s3_min_upload_part_size \\{#s3_min_upload_part_size\\}

<SettingsInfoBlock type="UInt64" default_value="16777216" />

Минимальный размер части данных при многочастной (multipart) загрузке в S3.

## s3_path_filter_limit \\{#s3_path_filter_limit\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1000"},{"label": "New setting"}]}]}/>

Максимальное количество значений `_path`, которые могут быть извлечены из фильтров запроса и использованы для итерации по файлам
вместо перечисления по glob-шаблону. 0 означает, что настройка отключена.

## s3_request_timeout_ms \\{#s3_request_timeout_ms\\}

<SettingsInfoBlock type="UInt64" default_value="30000" />

Таймаут бездействия при отправке и получении данных в S3 и из него. Запрос завершается с ошибкой, если один вызов чтения или записи по TCP блокируется дольше этого времени.

## s3_skip_empty_files \\{#s3_skip_empty_files\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "Надеемся, это улучшит UX"}]}]}/>

Включает или отключает пропуск пустых файлов в таблицах движка [S3](../../engines/table-engines/integrations/s3.md).

Возможные значения:

- 0 — `SELECT` выбрасывает исключение, если пустой файл не совместим с запрошенным форматом.
- 1 — `SELECT` возвращает пустой результат для пустого файла.

## s3_slow_all_threads_after_network_error \\{#s3_slow_all_threads_after_network_error\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

Если имеет значение `true`, все потоки, выполняющие запросы к S3 к одной и той же конечной точке резервного копирования, замедляются после того, как любой отдельный запрос к S3 сталкивается с сетевой ошибкой, допускающей повторную попытку, например тайм-аутом сокета.
Если имеет значение `false`, каждый поток обрабатывает замедление (backoff) S3‑запросов независимо от других.

## s3_strict_upload_part_size \\{#s3_strict_upload_part_size\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Точный размер части, которую необходимо загрузить при многокомпонентной (multipart) загрузке в S3 (некоторые реализации не поддерживают переменный размер частей).

## s3_throw_on_zero_files_match \\{#s3_throw_on_zero_files_match\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Возвращать ошибку, если запрос ListObjects не находит ни одного файла.

## s3_truncate_on_insert \\{#s3_truncate_on_insert\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает предварительную очистку (truncate) перед вставками в таблицы движка s3. Если параметр отключен, при попытке вставки будет сгенерировано исключение, если объект S3 уже существует.

Возможные значения:

- 0 — запрос `INSERT` создает новый файл или завершится с ошибкой, если файл существует и s3_create_new_file_on_insert не задан.
- 1 — запрос `INSERT` заменяет существующее содержимое файла новыми данными.

Подробнее см. [здесь](/integrations/s3#inserting-data).

## s3_upload_part_size_multiply_factor \\{#s3_upload_part_size_multiply_factor\\}

<SettingsInfoBlock type="UInt64" default_value="2" />

Умножайте s3_min_upload_part_size на этот коэффициент каждый раз, когда при одной операции записи в S3 загружается количество частей, равное s3_multiply_parts_count_threshold.

## s3_upload_part_size_multiply_parts_count_threshold \\{#s3_upload_part_size_multiply_parts_count_threshold\\}

<SettingsInfoBlock type="UInt64" default_value="500" />

Каждый раз, когда в S3 загружается такое количество частей, значение s3_min_upload_part_size умножается на s3_upload_part_size_multiply_factor.

## s3_use_adaptive_timeouts \\{#s3_use_adaptive_timeouts\\}

<SettingsInfoBlock type="Bool" default_value="1" />

При значении `true` для всех запросов к S3 первые две попытки выполняются с короткими тайм-аутами отправки и получения.
При значении `false` все попытки выполняются с одинаковыми тайм-аутами.

## s3_validate_request_settings \\{#s3_validate_request_settings\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Возможность отключить проверку настроек запросов S3"}]}]}/>

Включает проверку настроек запросов S3.
Возможные значения:

- 1 — проверять настройки.
- 0 — не проверять настройки.

## s3queue_default_zookeeper_path \\{#s3queue_default_zookeeper_path\\}

<SettingsInfoBlock type="String" default_value="/clickhouse/s3queue/" />

Префикс пути ZooKeeper по умолчанию для движка S3Queue

## s3queue_enable_logging_to_s3queue_log \\{#s3queue_enable_logging_to_s3queue_log\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает логирование в system.s3queue_log. Значение может быть переопределено на уровне отдельной таблицы с помощью настроек таблицы.

## s3queue_keeper_fault_injection_probability \\{#s3queue_keeper_fault_injection_probability\\}

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting."}]}]}/>

Вероятность инъекции сбоев в Keeper для S3Queue.

## s3queue_migrate_old_metadata_to_buckets \\{#s3queue_migrate_old_metadata_to_buckets\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Преобразовывать старую структуру метаданных таблицы S3Queue в новую

## schema_inference_cache_require_modification_time_for_url \\{#schema_inference_cache_require_modification_time_for_url\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать схему из кэша для URL-адреса с проверкой времени последнего изменения (для URL-адресов с заголовком Last-Modified)

## schema_inference_use_cache_for_azure \\{#schema_inference_use_cache_for_azure\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш при выводе схемы с табличной функцией Azure

## schema_inference_use_cache_for_file \\{#schema_inference_use_cache_for_file\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использует кэш при определении схемы при использовании табличной функции file

## schema_inference_use_cache_for_hdfs \\{#schema_inference_use_cache_for_hdfs\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш при определении схемы при использовании табличной функции hdfs

## schema_inference_use_cache_for_s3 \\{#schema_inference_use_cache_for_s3\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш при выводе схемы при использовании табличной функции S3

## schema_inference_use_cache_for_url \\{#schema_inference_use_cache_for_url\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш для вывода схемы при использовании табличной функции url

## secondary_indices_enable_bulk_filtering \\{#secondary_indices_enable_bulk_filtering\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Новый алгоритм фильтрации по индексам пропуска данных"}]}]}/>

Включает алгоритм пакетной фильтрации для индексов. Ожидается, что он всегда будет эффективнее, но эта настройка предусмотрена для совместимости и контроля.

## select_sequential_consistency \\{#select_sequential_consistency\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

:::note
Поведение этой настройки различается между SharedMergeTree и ReplicatedMergeTree. См. раздел [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency) для получения дополнительной информации о поведении `select_sequential_consistency` в SharedMergeTree.
:::

Включает или отключает последовательную согласованность для запросов `SELECT`. Требует, чтобы настройка `insert_quorum_parallel` была отключена (по умолчанию включена).

Возможные значения:

- 0 — отключено.
- 1 — включено.

Использование

Когда последовательная согласованность включена, ClickHouse позволяет клиенту выполнять запрос `SELECT` только к тем репликам, которые содержат данные из всех предыдущих запросов `INSERT`, выполненных с `insert_quorum`. Если клиент обращается к неполной реплике, ClickHouse сгенерирует исключение. Запрос `SELECT` не будет включать данные, которые ещё не были записаны в кворум реплик.

Когда `insert_quorum_parallel` включен (значение по умолчанию), `select_sequential_consistency` не работает. Это связано с тем, что параллельные запросы `INSERT` могут быть записаны в разные наборы кворумных реплик, поэтому нет гарантии, что одна реплика получила все записи.

См. также:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)

## send_logs_level \\{#send_logs_level\\}

<SettingsInfoBlock type="LogsLevel" default_value="fatal" />

Отправляет текстовые логи сервера клиенту, начиная с указанного минимального уровня. Допустимые значения: 'trace', 'debug', 'information', 'warning', 'error', 'fatal', 'none'

## send_logs_source_regexp \\{#send_logs_source_regexp\\}

Отправляет текстовые логи сервера, имя источника которых соответствует указанному регулярному выражению. Пустое значение означает все источники.

## send_profile_events \\{#send_profile_events\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Новая настройка. Управляет отправкой событий профилирования (ProfileEvents) клиентам."}]}]}/>

Включает или отключает отправку пакетов [ProfileEvents](/native-protocol/server.md#profile-events) клиенту.

Эту настройку можно отключить, чтобы сократить сетевой трафик для клиентов, которым не нужны события профилирования (ProfileEvents).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## send_progress_in_http_headers \\{#send_progress_in_http_headers\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает HTTP‑заголовки `X-ClickHouse-Progress` в ответах `clickhouse-server`.

Дополнительные сведения см. в [описании HTTP-интерфейса](/interfaces/http).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## send_timeout \\{#send_timeout\\}

<SettingsInfoBlock type="Seconds" default_value="300" />

Таймаут отправки данных в сеть, в секундах. Если клиенту нужно отправить данные, но в течение этого интервала не удаётся отправить ни одного байта, генерируется исключение. Если вы задаёте этот параметр на клиенте, то `receive_timeout` для сокета также будет установлен на соответствующей стороне соединения на сервере.

## serialize_query_plan \\{#serialize_query_plan\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "NewSetting"}]}]}/>

Сериализовать план запроса для распределённой обработки

## serialize_string_in_memory_with_zero_byte \\{#serialize_string_in_memory_with_zero_byte\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

Сериализует строковые значения (String) при агрегации, добавляя нулевой байт в конец. Включайте для сохранения совместимости при выполнении запросов к кластеру с несовместимыми версиями.

## session_timezone \{#session_timezone\}

<BetaBadge />

Устанавливает неявный часовой пояс текущего сеанса или запроса.
Неявный часовой пояс — это часовой пояс, применяемый к значениям типов DateTime/DateTime64, у которых явно не указан часовой пояс.
Этот параметр имеет приоритет над глобально настроенным (на уровне сервера) неявным неявным часовым поясом.
Значение &#39;&#39; (пустая строка) означает, что неявный часовой пояс текущего сеанса или запроса равен [часовому поясу сервера](../server-configuration-parameters/settings.md/#timezone).

Можно использовать функции `timeZone()` и `serverTimeZone()` для получения часового пояса сеанса и часового пояса сервера.

Возможные значения:

* Любое имя часового пояса из `system.time_zones`, например `Europe/Berlin`, `UTC` или `Zulu`

Примеры:

```sql
SELECT timeZone(), serverTimeZone() FORMAT CSV

"Europe/Berlin","Europe/Berlin"
```

```sql
SELECT timeZone(), serverTimeZone() SETTINGS session_timezone = 'Asia/Novosibirsk' FORMAT CSV

"Asia/Novosibirsk","Europe/Berlin"
```

Назначьте сеансовый часовой пояс &#39;America/Denver&#39; внутреннему DateTime без явного указания часового пояса:

```sql
SELECT toDateTime64(toDateTime64('1999-12-12 23:23:23.123', 3), 3, 'Europe/Zurich') SETTINGS session_timezone = 'America/Denver' FORMAT TSV

1999-12-13 07:23:23.123
```

:::warning
Не все функции разбора DateTime/DateTime64 учитывают `session_timezone`. Это может приводить к неочевидным ошибкам.
Смотрите следующий пример и объяснение.
:::

```sql
CREATE TABLE test_tz (`d` DateTime('UTC')) ENGINE = Memory AS SELECT toDateTime('2000-01-01 00:00:00', 'UTC');

SELECT *, timeZone() FROM test_tz WHERE d = toDateTime('2000-01-01 00:00:00') SETTINGS session_timezone = 'Asia/Novosibirsk'
0 rows in set.

SELECT *, timeZone() FROM test_tz WHERE d = '2000-01-01 00:00:00' SETTINGS session_timezone = 'Asia/Novosibirsk'
┌───────────────────d─┬─timeZone()───────┐
│ 2000-01-01 00:00:00 │ Asia/Novosibirsk │
└─────────────────────┴──────────────────┘
```

Это происходит из-за разных конвейеров разбора:

* `toDateTime()` без явного указания часового пояса, используемая в первом запросе `SELECT`, учитывает значение настройки `session_timezone` и глобальный часовой пояс.
* Во втором запросе значение DateTime разбирается из String и наследует тип и часовой пояс существующего столбца `d`. Таким образом, настройки `session_timezone` и глобальный часовой пояс не учитываются.

**См. также**

* [timezone](../server-configuration-parameters/settings.md/#timezone)


## set_overflow_mode \\{#set_overflow_mode\\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что происходит, когда объем данных превышает одно из ограничений.

Возможные значения:

- `throw`: генерировать исключение (по умолчанию).
- `break`: прекратить выполнение запроса и вернуть частичный результат, как если бы
исходные данные закончились.

## shared_merge_tree_sync_parts_on_partition_operations \\{#shared_merge_tree_sync_parts_on_partition_operations\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "Новая настройка. По умолчанию части всегда синхронизируются"}]}]}/>

Автоматически синхронизирует набор частей данных после операций с партициями MOVE|REPLACE|ATTACH в таблицах SMT. Только для Cloud.

## short_circuit_function_evaluation \\{#short_circuit_function_evaluation\\}

<SettingsInfoBlock type="ShortCircuitFunctionEvaluation" default_value="enable" />

Позволяет вычислять функции [if](../../sql-reference/functions/conditional-functions.md/#if), [multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf), [and](/sql-reference/functions/logical-functions#and) и [or](/sql-reference/functions/logical-functions#or) по [сокращённой схеме](https://en.wikipedia.org/wiki/Short-circuit_evaluation). Это помогает оптимизировать выполнение сложных выражений в этих функциях и предотвращать возможные исключения (например, деление на ноль в ветке, которая фактически не выполняется).

Возможные значения:

- `enable` — Включает сокращённое вычисление для функций, для которых оно уместно (могут выбрасывать исключение или являются вычислительно затратными).
- `force_enable` — Включает сокращённое вычисление для всех функций.
- `disable` — Отключает сокращённое вычисление функций.

## short_circuit_function_evaluation_for_nulls \\{#short_circuit_function_evaluation_for_nulls\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Разрешить выполнять функции с аргументами типа Nullable только для строк, в которых во всех аргументах нет значений NULL"}]}]}/>

Оптимизирует вычисление функций, которые возвращают NULL, если любой из аргументов равен NULL. Когда доля значений NULL в аргументах функции превышает short_circuit_function_evaluation_for_nulls_threshold, система пропускает вычисление функции по строкам. Вместо этого она сразу возвращает NULL для всех строк, избегая лишних вычислений.

## short_circuit_function_evaluation_for_nulls_threshold \\{#short_circuit_function_evaluation_for_nulls_threshold\\}

<SettingsInfoBlock type="Double" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Порог доли значений NULL, при котором функции с аргументами типа Nullable выполняются только для строк, в которых все аргументы не содержат NULL. Применяется, когда включена настройка short_circuit_function_evaluation_for_nulls."}]}]}/>

Порог доли значений NULL, при котором функции с аргументами типа Nullable выполняются только для строк, в которых все аргументы не содержат NULL. Применяется, когда включена настройка short_circuit_function_evaluation_for_nulls.
Когда отношение количества строк, содержащих значения NULL, к общему количеству строк превышает этот порог, строки с такими значениями NULL не вычисляются.

## show_data_lake_catalogs_in_system_tables \\{#show_data_lake_catalogs_in_system_tables\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Новая настройка"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Отключить каталоги озер данных в системных таблицах по умолчанию"}]}]}/>

Включает отображение каталогов озер данных в системных таблицах.

## show_processlist_include_internal \\{#show_processlist_include_internal\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "New setting."}]}]}/>

Показывать внутренние вспомогательные процессы в выводе запроса `SHOW PROCESSLIST`.

К внутренним процессам относятся перезагрузки словарей, перезагрузки refreshable materialized view, служебные запросы `SELECT`, выполняемые в запросах `SHOW ...`, служебные запросы `CREATE DATABASE ...`, выполняемые внутри сервера для устранения проблем с повреждёнными таблицами, и другие подобные операции.

## show_table_uuid_in_table_create_query_if_not_nil \\{#show_table_uuid_in_table_create_query_if_not_nil\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.7"},{"label": "0"},{"label": "Прекращено отображение UUID таблицы в запросе CREATE для Engine=Atomic"}]}]}/>

Определяет отображение запроса `SHOW TABLE`.

Возможные значения:

- 0 — запрос будет отображаться без UUID таблицы.
- 1 — запрос будет отображаться с UUID таблицы.

## single_join_prefer_left_table \\{#single_join_prefer_left_table\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Для одиночного JOIN при неоднозначности идентификаторов отдавать предпочтение левой таблице

## skip_redundant_aliases_in_udf \{#skip_redundant_aliases_in_udf\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "Если параметр включён, это позволяет использовать одну и ту же пользовательскую функцию (UDF) несколько раз для нескольких материализованных столбцов в одной и той же таблице."}]}]} />

Избыточные псевдонимы не используются (не подставляются) в пользовательских функциях, чтобы упростить их использование.

Возможные значения:

* 1 — Псевдонимы пропускаются (подставляются) в UDF.
* 0 — Псевдонимы не пропускаются (не подставляются) в UDF.

**Example**

Разница между включённым и выключенным параметром:

Запрос:

```sql
SET skip_redundant_aliases_in_udf = 0;
CREATE FUNCTION IF NOT EXISTS test_03274 AS ( x ) -> ((x + 1 as y, y + 2));

EXPLAIN SYNTAX SELECT test_03274(4 + 2);
```

Результат:

```text
SELECT ((4 + 2) + 1 AS y, y + 2)
```

Запрос:

```sql
SET skip_redundant_aliases_in_udf = 1;
CREATE FUNCTION IF NOT EXISTS test_03274 AS ( x ) -> ((x + 1 as y, y + 2));

EXPLAIN SYNTAX SELECT test_03274(4 + 2);
```

Результат:

```text
SELECT ((4 + 2) + 1, ((4 + 2) + 1) + 2)
```


## skip_unavailable_shards \\{#skip_unavailable_shards\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает тихий пропуск недоступных сегментов.

Сегмент считается недоступным, если все его реплики недоступны. Реплика недоступна в следующих случаях:

- ClickHouse не может подключиться к реплике по какой-либо причине.

    При подключении к реплике ClickHouse выполняет несколько попыток. Если все эти попытки завершаются неудачно, реплика считается недоступной.

- Реплика не может быть разрешена через DNS.

    Если имя хоста реплики не может быть разрешено через DNS, это может указывать на следующие ситуации:

    - У хоста реплики нет DNS-записи. Это может происходить в системах с динамическим DNS, например, в [Kubernetes](https://kubernetes.io), где имена узлов могут не разрешаться во время простоя, и это не является ошибкой.

    - Ошибка конфигурации. Файл конфигурации ClickHouse содержит неправильное имя хоста.

Возможные значения:

- 1 — пропуск включен.

    Если сегмент недоступен, ClickHouse возвращает результат на основе частичных данных и не сообщает о проблемах с доступностью узла.

- 0 — пропуск отключен.

    Если сегмент недоступен, ClickHouse выбрасывает исключение.

## sleep_after_receiving_query_ms \\{#sleep_after_receiving_query_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Время задержки после получения запроса в TCPHandler

## sleep_in_send_data_ms \\{#sleep_in_send_data_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Время задержки при отправке данных в TCPHandler

## sleep_in_send_tables_status_ms \\{#sleep_in_send_tables_status_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Время задержки перед отправкой ответа о статусе таблиц в TCPHandler

## sort_overflow_mode \\{#sort_overflow_mode\\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что происходит, если количество строк, полученных до сортировки, превышает одно из ограничений.

Возможные значения:

- `throw`: сгенерировать исключение.
- `break`: остановить выполнение запроса и вернуть частичный результат.

## split_intersecting_parts_ranges_into_layers_final \\{#split_intersecting_parts_ranges_into_layers_final\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Разрешает разбивать диапазоны пересекающихся частей на слои при оптимизации FINAL"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "Разрешает разбивать диапазоны пересекающихся частей на слои при оптимизации FINAL"}]}]}/>

Разбивать диапазоны пересекающихся частей на слои при оптимизации FINAL

## split_parts_ranges_into_intersecting_and_non_intersecting_final \\{#split_parts_ranges_into_intersecting_and_non_intersecting_final\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Разрешить разделять диапазоны частей на пересекающиеся и непересекающиеся во время оптимизации FINAL"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "Разрешить разделять диапазоны частей на пересекающиеся и непересекающиеся во время оптимизации FINAL"}]}]}/>

Разделять диапазоны частей на пересекающиеся и непересекающиеся во время оптимизации FINAL

## splitby_max_substrings_includes_remaining_string \\{#splitby_max_substrings_includes_remaining_string\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, будет ли функция [splitBy*()](../../sql-reference/functions/splitting-merging-functions.md) с аргументом `max_substrings` > 0 включать оставшуюся часть строки в последний элемент результирующего массива.

Возможные значения:

- `0` - Оставшаяся часть строки не будет включена в последний элемент результирующего массива.
- `1` - Оставшаяся часть строки будет включена в последний элемент результирующего массива. Это поведение функции [`split()`](https://spark.apache.org/docs/3.1.2/api/python/reference/api/pyspark.sql.functions.split.html) в Spark и метода ['string.split()'](https://docs.python.org/3/library/stdtypes.html#str.split) в Python.

## stop_refreshable_materialized_views_on_startup \\{#stop_refreshable_materialized_views_on_startup\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

При запуске сервера предотвращает планирование refreshable materialized views, аналогично `SYSTEM STOP VIEWS`. Позже вы можете запустить их вручную с помощью `SYSTEM START VIEWS` или `SYSTEM START VIEW <name>`. Также применяется к вновь создаваемым представлениям. Не влияет на materialized view, не являющиеся refreshable materialized views.

## storage_file_read_method \\{#storage_file_read_method\\}

<SettingsInfoBlock type="LocalFSReadMethod" default_value="pread" />

Метод чтения данных из файла хранилища. Возможные значения: `read`, `pread`, `mmap`. Метод `mmap` не применяется к clickhouse-server (он предназначен для clickhouse-local).

## storage_system_stack_trace_pipe_read_timeout_ms \\{#storage_system_stack_trace_pipe_read_timeout_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="100" />

Максимальное время ожидания чтения из канала для получения информации от потоков при выполнении запроса к таблице `system.stack_trace`. Этот параметр используется для целей тестирования и не предназначен для изменения пользователями.

## stream_flush_interval_ms \\{#stream_flush_interval_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="7500" />

Применяется для таблиц с потоковой вставкой (streaming) при срабатывании тайм-аута или когда поток формирует блок из [max_insert_block_size](#max_insert_block_size) строк.

Значение по умолчанию — 7500.

Чем меньше значение, тем чаще данные записываются в таблицу. Слишком маленькое значение приводит к низкой производительности.

## stream_like_engine_allow_direct_select \\{#stream_like_engine_allow_direct_select\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.12"},{"label": "0"},{"label": "По умолчанию прямой SELECT для Kafka/RabbitMQ/FileLog не разрешён"}]}]}/>

Разрешает выполнять прямой SELECT‑запрос для движков Kafka, RabbitMQ, FileLog, Redis Streams, S3Queue, AzureQueue и NATS. Если есть привязанные materialized view, запрос SELECT не разрешён, даже если этот параметр включён.
Если привязанных materialized view нет, включение этого параметра позволяет читать данные. Имейте в виду, что обычно прочитанные данные удаляются из очереди. Чтобы избежать удаления прочитанных данных, необходимо корректно настроить соответствующие настройки движка.

## stream_like_engine_insert_queue \\{#stream_like_engine_insert_queue\\}

Когда движок потокового типа читает из нескольких очередей, пользователю нужно будет выбрать одну очередь для записи данных. Используется в Redis Streams и NATS.

## stream_poll_timeout_ms \\{#stream_poll_timeout_ms\\}

<SettingsInfoBlock type="Milliseconds" default_value="500" />

Таймаут для опроса данных из/в стриминговые хранилища.

## system_events_show_zero_values \{#system_events_show_zero_values\}

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет отбирать события с нулевыми значениями из [`system.events`](../../operations/system-tables/events.md).

Некоторые системы мониторинга требуют передавать им все значения метрик для каждого чекпоинта, даже если значение метрики равно нулю.

Возможные значения:

* 0 — Отключено.
* 1 — Включено.

**Примеры**

Запрос

```sql
SELECT * FROM system.events WHERE event='QueryMemoryLimitExceeded';
```

Результат

```text
Ok.
```

Запрос

```sql
SET system_events_show_zero_values = 1;
SELECT * FROM system.events WHERE event='QueryMemoryLimitExceeded';
```

Результат

```text
┌─event────────────────────┬─value─┬─description───────────────────────────────────────────┐
│ QueryMemoryLimitExceeded │     0 │ Number of times when memory limit exceeded for query. │
└──────────────────────────┴───────┴───────────────────────────────────────────────────────┘
```


## table_engine_read_through_distributed_cache \\{#table_engine_read_through_distributed_cache\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Разрешает чтение из распределённого кэша через табличные движки и табличные функции (S3, Azure и т. д.).

## table_function_remote_max_addresses \\{#table_function_remote_max_addresses\\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Задает максимальное количество адресов, получаемых по шаблонам для функции [remote](../../sql-reference/table-functions/remote.md).

Возможные значения:

- Положительное целое число.

## tcp_keep_alive_timeout \\{#tcp_keep_alive_timeout\\}

<SettingsInfoBlock type="Seconds" default_value="290" />

Время простоя соединения (в секундах) перед тем, как TCP начнёт отправлять keepalive-пакеты

## temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds \\{#temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds\\}

<SettingsInfoBlock type="UInt64" default_value="600000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "600000"},{"label": "Время ожидания при блокировке кэша для резервирования места под временные данные в файловом кэше"}]}]}/>

Время ожидания при блокировке кэша для резервирования места под временные данные в файловом кэше

## temporary_files_buffer_size \\{#temporary_files_buffer_size\\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1048576"},{"label": "New setting"}]}]}/>

Размер буфера для записи во временные файлы. Увеличение размера буфера уменьшает число системных вызовов, но повышает потребление памяти.

## temporary_files_codec \\{#temporary_files_codec\\}

<SettingsInfoBlock type="String" default_value="LZ4" />

Устанавливает кодек сжатия для временных файлов, используемых при операциях сортировки и соединения, выполняемых на диске.

Возможные значения:

- LZ4 — применяется сжатие [LZ4](https://en.wikipedia.org/wiki/LZ4_(compression_algorithm)).
- NONE — сжатие не применяется.

## text_index_hint_max_selectivity \\{#text_index_hint_max_selectivity\\}

<SettingsInfoBlock type="Float" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0.2"},{"label": "Новая настройка"}]}]}/>

Максимальная селективность фильтра для использования подсказки, основанной на инвертированном текстовом индексе.

## text_index_use_bloom_filter \\{#text_index_use_bloom_filter\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "Новая настройка."}]}]}/>

Для тестирования позволяет включать или отключать использование bloom-фильтра в текстовом индексе.

## throw_if_no_data_to_insert \\{#throw_if_no_data_to_insert\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает или запрещает пустые INSERT-запросы, по умолчанию включено (выбрасывает ошибку при попытке пустой вставки). Применяется только к INSERT-запросам с использованием [`clickhouse-client`](/interfaces/cli) или интерфейса [gRPC](/interfaces/grpc).

## throw_on_error_from_cache_on_write_operations \\{#throw_on_error_from_cache_on_write_operations\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать ошибки, возникающие в кэше при кэшировании во время операций записи (INSERT, слияния)

## throw_on_max_partitions_per_insert_block \\{#throw_on_max_partitions_per_insert_block\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Позволяет контролировать поведение при достижении `max_partitions_per_insert_block`.

Возможные значения:

- `true`  - Когда блок вставки достигает `max_partitions_per_insert_block`, генерируется исключение.
- `false` - При достижении `max_partitions_per_insert_block` в лог записывается предупреждение.

:::tip
Это может быть полезно, если вы пытаетесь оценить влияние на пользователей при изменении [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block).
:::

## throw_on_unsupported_query_inside_transaction \\{#throw_on_unsupported_query_inside_transaction\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

Выбрасывать исключение, если внутри транзакции используется неподдерживаемый запрос

## timeout_before_checking_execution_speed \\{#timeout_before_checking_execution_speed\\}

<SettingsInfoBlock type="Seconds" default_value="10" />

Проверяет, что скорость выполнения не становится слишком низкой (не ниже `min_execution_speed`),
по истечении указанного времени в секундах.

## timeout_overflow_mode \\{#timeout_overflow_mode\\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что делать, если запрос выполняется дольше, чем `max_execution_time`, или
оценочное время выполнения превышает `max_estimated_execution_time`.

Возможные значения:

- `throw`: вызвать исключение (значение по умолчанию).
- `break`: остановить выполнение запроса и вернуть частичный результат, как если бы
исходные данные были исчерпаны.

## timeout_overflow_mode_leaf \\{#timeout_overflow_mode_leaf\\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что происходит, когда запрос на листовом узле выполняется дольше, чем `max_execution_time_leaf`.

Возможные значения:

- `throw`: сгенерировать исключение (по умолчанию).
- `break`: остановить выполнение запроса и вернуть частичный результат, как будто
исходные данные закончились.

## totals_auto_threshold \\{#totals_auto_threshold\\}

<SettingsInfoBlock type="Float" default_value="0.5" />

Пороговое значение для `totals_mode = 'auto'`.
См. раздел «Модификатор WITH TOTALS».

## totals_mode \\{#totals_mode\\}

<SettingsInfoBlock type="TotalsMode" default_value="after_having_exclusive" />

Как вычислять TOTALS при использовании HAVING, а также при установленных max_rows_to_group_by и group_by_overflow_mode = 'any'.
См. раздел «WITH TOTALS modifier».

## trace_profile_events \\{#trace_profile_events\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает сбор трассировок стека при каждом обновлении событий профилирования (profile events) вместе с именем события, значением инкремента и последующей отправкой этих данных в [trace_log](/operations/system-tables/trace_log).

Возможные значения:

- 1 — трассировка событий профилирования включена.
- 0 — трассировка событий профилирования отключена.

## trace_profile_events_list \\{#trace_profile_events_list\\}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": ""},{"label": "New setting"}]}]}/>

Когда параметр `trace_profile_events` включен, можно ограничить трассируемые события указанным списком имён, разделённых запятыми.
Если `trace_profile_events_list` — пустая строка (по умолчанию), трассируются все события профилирования.

Пример значения: 'DiskS3ReadMicroseconds,DiskS3ReadRequestsCount,SelectQueryTimeMicroseconds,ReadBufferFromS3Bytes'

Использование этого параметра позволяет более точно собирать данные для большого количества запросов, так как в противном случае огромное количество событий может переполнить внутреннюю очередь системного журнала, и часть из них будет отброшена.

## transfer_overflow_mode \\{#transfer_overflow_mode\\}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что происходит, когда объём данных превышает один из лимитов.

Возможные значения:

- `throw`: сгенерировать исключение (значение по умолчанию).
- `break`: прекратить выполнение запроса и вернуть частичный результат, как если бы
исходные данные закончились.

## transform_null_in \{#transform_null_in\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает трактовку значений [NULL](/sql-reference/syntax#null) как равных при использовании оператора [IN](../../sql-reference/operators/in.md).

По умолчанию значения `NULL` нельзя сравнивать, потому что `NULL` означает неопределённое значение. Следовательно, сравнение `expr = NULL` всегда должно возвращать `false`. При включении этой настройки выражение `NULL = NULL` для оператора `IN` возвращает `true`.

Возможные значения:

* 0 — сравнение значений `NULL` в операторе `IN` возвращает `false`;
* 1 — сравнение значений `NULL` в операторе `IN` возвращает `true`.

**Пример**

Рассмотрим таблицу `null_in`:

```text
┌──idx─┬─────i─┐
│    1 │     1 │
│    2 │  NULL │
│    3 │     3 │
└──────┴───────┘
```

Запрос:

```sql
SELECT idx, i FROM null_in WHERE i IN (1, NULL) SETTINGS transform_null_in = 0;
```

Результат:

```text
┌──idx─┬────i─┐
│    1 │    1 │
└──────┴──────┘
```

Запрос:

```sql
SELECT idx, i FROM null_in WHERE i IN (1, NULL) SETTINGS transform_null_in = 1;
```

Результат:

```text
┌──idx─┬─────i─┐
│    1 │     1 │
│    2 │  NULL │
└──────┴───────┘
```

**См. также**

* [Обработка NULL в операторах IN](/sql-reference/operators/in#null-processing)


## traverse_shadow_remote_data_paths \\{#traverse_shadow_remote_data_paths\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Обходить теневой каталог при выполнении запроса system.remote_data_paths."}]}]}/>

Обходить замороженные данные (теневой каталог) помимо фактических данных таблицы при выполнении запроса system.remote_data_paths

## union_default_mode \\{#union_default_mode\\}

Задаёт режим объединения результатов запросов `SELECT`. Параметр используется только при совместном использовании с [UNION](../../sql-reference/statements/select/union.md) без явного указания `UNION ALL` или `UNION DISTINCT`.

Возможные значения:

- `'DISTINCT'` — ClickHouse выводит строки как результат объединения запросов, удаляя дубликаты.
- `'ALL'` — ClickHouse выводит все строки как результат объединения запросов, включая дубликаты.
- `''` — ClickHouse генерирует исключение при использовании с `UNION`.

Примеры см. в разделе [UNION](../../sql-reference/statements/select/union.md).

## unknown_packet_in_send_data \\{#unknown_packet_in_send_data\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Отправлять неизвестный пакет вместо N-го пакета данных

## update_parallel_mode \\{#update_parallel_mode\\}

<SettingsInfoBlock type="UpdateParallelMode" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "A new setting"}]}]}/>

Определяет поведение параллельных запросов `UPDATE`.

Возможные значения:

- `sync` - выполнять все запросы `UPDATE` последовательно.
- `auto` - выполнять последовательно только те запросы `UPDATE`, для которых есть зависимости между столбцами, обновляемыми в одном запросе, и столбцами, используемыми в выражениях другого запроса.
- `async` - не синхронизировать выполнение запросов `UPDATE`.

## update_sequential_consistency \\{#update_sequential_consistency\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Если установлено значение true, набор частей обновляется до последней версии перед выполнением обновления.

## use_async_executor_for_materialized_views \\{#use_async_executor_for_materialized_views\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting."}]}]}/>

Использование асинхронного и потенциально многопоточного выполнения запросов materialized view может ускорить обработку представлений во время INSERT, однако при этом потребляется больше памяти.

## use_cache_for_count_from_files \\{#use_cache_for_count_from_files\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает кэширование количества строк при вычислении `count` по файлам в табличных функциях `file`/`s3`/`url`/`hdfs`/`azureBlobStorage`.

Включено по умолчанию.

## use_client_time_zone \\{#use_client_time_zone\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать часовой пояс клиента для интерпретации строковых значений DateTime вместо часового пояса сервера.

## use_compact_format_in_distributed_parts_names \\{#use_compact_format_in_distributed_parts_names\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "Use compact format for async INSERT into Distributed tables by default"}]}]}/>

Использует компактный формат для хранения блоков при фоновых (`distributed_foreground_insert`) операциях INSERT в таблицы с движком `Distributed`.

Возможные значения:

- 0 — Использует формат каталогов `user[:password]@host:port#default_database`.
- 1 — Использует формат каталогов `[shard{shard_index}[_replica{replica_index}]]`.

:::note

- при `use_compact_format_in_distributed_parts_names=0` изменения из определения кластера не будут применяться для фоновых операций INSERT;
- при `use_compact_format_in_distributed_parts_names=1` изменение порядка узлов в определении кластера приведёт к изменению значений `shard_index`/`replica_index`, имейте это в виду.
:::

## use_concurrency_control \\{#use_concurrency_control\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "Включить контроль конкуренции по умолчанию"}]}]}/>

Учитывать контроль конкуренции сервера (см. глобальные настройки сервера `concurrent_threads_soft_limit_num` и `concurrent_threads_soft_limit_ratio_to_cores`). Если параметр отключён, можно использовать большее количество потоков, даже если сервер перегружен (не рекомендуется для обычного использования и в основном нужно для тестов).

## use_hash_table_stats_for_join_reordering \\{#use_hash_table_stats_for_join_reordering\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "Новая настройка. Ранее повторяла поведение настройки `collect_hash_table_stats_during_joins`."}]}]}/>

Включает использование собранной статистики хеш-таблиц для оценки кардинальности при переупорядочивании операций JOIN.

## use_hedged_requests \\{#use_hedged_requests\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.9"},{"label": "1"},{"label": "Включить функцию Hedged Requests по умолчанию"}]}]}/>

Включает логику hedged-запросов для удалённых запросов. Позволяет устанавливать несколько соединений с разными репликами для одного запроса.
Новое соединение создаётся, если существующее или существующие соединения с репликой или репликами не были установлены в течение `hedged_connection_timeout`
или данные не были получены в течение `receive_data_timeout`. Запрос использует первое соединение, которое отправит непустой пакет прогресса (или пакет данных, если `allow_changing_replica_until_first_data_packet`);
остальные соединения отменяются. Поддерживаются запросы с `max_parallel_replicas > 1`.

Включено по умолчанию.

Значение по умолчанию в Cloud: `1`

## use_hive_partitioning \\{#use_hive_partitioning\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Настройка включена по умолчанию."}]}, {"id": "row-2","items": [{"label": "24.8"},{"label": "0"},{"label": "Позволяет использовать партиционирование в стиле Hive для движков File, URL, S3, AzureBlobStorage и HDFS."}]}]}/>

Если настройка включена, ClickHouse будет обнаруживать партиционирование в стиле Hive в пути (`/name=value/`) в табличных движках файлового типа [File](/sql-reference/table-functions/file#hive-style-partitioning)/[S3](/sql-reference/table-functions/s3#hive-style-partitioning)/[URL](/sql-reference/table-functions/url#hive-style-partitioning)/[HDFS](/sql-reference/table-functions/hdfs#hive-style-partitioning)/[AzureBlobStorage](/sql-reference/table-functions/azureBlobStorage#hive-style-partitioning) и позволит использовать столбцы партиций в качестве виртуальных столбцов в запросе. Эти виртуальные столбцы будут иметь те же имена, что и в пути партиционирования, но начинаться с `_`.

## use_iceberg_metadata_files_cache \\{#use_iceberg_metadata_files_cache\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting"}]}]}/>

Если параметр включён, табличная функция iceberg и хранилище iceberg могут использовать кэш файлов метаданных iceberg.

Возможные значения:

- 0 - Отключено
- 1 - Включено

## use_iceberg_partition_pruning \\{#use_iceberg_partition_pruning\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "По умолчанию включено отсечение партиций Iceberg."}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка для отсечения партиций Iceberg."}]}]}/>

Использует отсечение партиций Iceberg для таблиц Iceberg

## use_index_for_in_with_subqueries \\{#use_index_for_in_with_subqueries\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Пробовать использовать индекс, если в правой части оператора IN есть подзапрос или табличное выражение.

## use_index_for_in_with_subqueries_max_values \\{#use_index_for_in_with_subqueries_max_values\\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер набора в правой части оператора IN, при котором для фильтрации используется индекс таблицы. Это позволяет избежать деградации производительности и повышенного расхода памяти из‑за подготовки дополнительных структур данных для больших запросов. Ноль означает отсутствие лимита.

## use_join_disjunctions_push_down \\{#use_join_disjunctions_push_down\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "Эта оптимизация включена."}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Включает проталкивание частей условий JOIN, соединённых через OR, на соответствующие входные стороны («частичное проталкивание»).
Это позволяет движкам хранения выполнять фильтрацию раньше, что может сократить объём считываемых данных.
Оптимизация не изменяет семантику запроса и применяется только в том случае, если каждая верхнеуровневая ветвь по OR даёт как минимум один детерминированный предикат для соответствующей стороны.

## use_legacy_to_time \\{#use_legacy_to_time\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Новая настройка. Позволяет использовать прежнюю логику работы функции toTime, которая соответствует toTimeWithFixedDate."}]}]}/>

Если включено, позволяет использовать устаревшую функцию toTime, которая преобразует дату со временем в определённую фиксированную дату, сохраняя время.
В противном случае используется новая функция toTime, которая преобразует разные типы данных в тип Time.
Прежняя функция также всегда доступна как toTimeWithFixedDate.

## use_page_cache_for_disks_without_file_cache \\{#use_page_cache_for_disks_without_file_cache\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Добавлен userspace page cache"}]}]}/>

Использовать userspace page cache для удалённых дисков, на которых не включён кэш файловой системы.

## use_page_cache_with_distributed_cache \\{#use_page_cache_with_distributed_cache\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

Использовать кэш страниц в пространстве пользователя при использовании распределённого кэша.

## use_paimon_partition_pruning \\{#use_paimon_partition_pruning\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Использует отсечение партиций Paimon для табличных функций Paimon

## use_primary_key \\{#use_primary_key\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "Новая настройка, управляющая использованием первичного ключа для отсечения гранул в MergeTree."}]}]}/>

Использовать первичный ключ для отсечения гранул при выполнении запросов для таблиц MergeTree.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_query_cache \\{#use_query_cache\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, запросы `SELECT` могут использовать [кэш запросов](../query-cache.md). Параметры [enable_reads_from_query_cache](#enable_reads_from_query_cache)
и [enable_writes_to_query_cache](#enable_writes_to_query_cache) более детально управляют тем, как используется кэш.

Возможные значения:

- 0 — отключено
- 1 — включено

## use_query_condition_cache \\{#use_query_condition_cache\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Новая оптимизация"}]}, {"id": "row-2","items": [{"label": "25.3"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Включает [кэш условий запроса](/operations/query-condition-cache). Кэш сохраняет диапазоны гранул в частях данных, которые не удовлетворяют условию в предикате `WHERE`,
и повторно использует эту информацию как временный индекс для последующих запросов.

Возможные значения:

- 0 - Отключено
- 1 - Включено

## use_roaring_bitmap_iceberg_positional_deletes \\{#use_roaring_bitmap_iceberg_positional_deletes\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Использовать roaring bitmap для позиционных удалений в формате Iceberg.

## use_skip_indexes \\{#use_skip_indexes\\}

<SettingsInfoBlock type="Bool" default_value="1" />

При выполнении запросов использовать индексы пропуска данных.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_skip_indexes_for_disjunctions \\{#use_skip_indexes_for_disjunctions\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

Оценивает фильтры WHERE со смешанными условиями AND и OR с использованием skip-индексов. Пример: WHERE A = 5 AND (B = 5 OR C = 5).
Если отключено, skip-индексы по-прежнему используются для вычисления условий WHERE, однако они могут содержать только выражения, соединённые оператором AND.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_skip_indexes_for_top_k \\{#use_skip_indexes_for_top_k\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting."}]}]}/>

Включает использование индексов пропуска данных при фильтрации TopK.

Когда параметр включен, если на столбце, указанном в запросе `ORDER BY <column> LIMIT n`, существует minmax-индекс пропуска данных, оптимизатор попытается использовать этот minmax-индекс, чтобы пропустить гранулы, не относящиеся к итоговому результату. Это может снизить время выполнения запроса.

Возможные значения:

- 0 — отключено.
- 1 — включено.

## use_skip_indexes_if_final \\{#use_skip_indexes_if_final\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Изменение значения настройки по умолчанию"}]}]}/>

Определяет, используются ли пропускающие индексы при выполнении запроса с модификатором FINAL.

Пропускающие индексы могут исключать строки (гранулы), содержащие самые последние данные, что может привести к некорректным результатам запроса с модификатором FINAL. Когда эта настройка включена, пропускающие индексы применяются даже с модификатором FINAL, что потенциально повышает производительность, но несет риск пропуска недавних обновлений. Эту настройку следует включать совместно с настройкой use_skip_indexes_if_final_exact_mode (по умолчанию включена).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_skip_indexes_if_final_exact_mode \\{#use_skip_indexes_if_final_exact_mode\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Изменение значения настройки по умолчанию"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "Эта настройка была добавлена, чтобы запрос с модификатором FINAL возвращал корректные результаты при использовании пропускающих индексов"}]}]}/>

Определяет, разворачиваются ли гранулы, возвращённые пропускающим индексом, в более новых частях, чтобы вернуть корректные результаты при выполнении запроса с модификатором FINAL.

Использование пропускающих индексов может исключить строки (гранулы), содержащие последние данные, что может привести к некорректным результатам. Эта настройка может гарантировать возврат корректных результатов за счёт сканирования более новых частей, которые пересекаются с диапазонами, возвращёнными пропускающим индексом. Эту настройку следует отключать только в том случае, если для приложения приемлемы приближённые результаты, основанные на поиске по пропускающему индексу.

Возможные значения:

- 0 — Отключена.
- 1 — Включена.

## use_skip_indexes_on_data_read \\{#use_skip_indexes_on_data_read\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает использование индексов пропуска данных при чтении.

Если параметр включён, индексы пропуска данных вычисляются динамически в момент чтения каждой гранулы данных, а не анализируются заранее до начала выполнения запроса. Это может сократить время запуска запроса.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_statistics_cache \\{#use_statistics_cache\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Использовать кэш статистики в запросе, чтобы избежать накладных расходов на загрузку статистики для каждой части.

## use_structure_from_insertion_table_in_table_functions \\{#use_structure_from_insertion_table_in_table_functions\\}

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.11"},{"label": "2"},{"label": "Improve using structure from insertion table in table functions"}]}]}/>

Использовать структуру таблицы, в которую выполняется вставка, вместо определения схемы по данным. Возможные значения: 0 - отключено, 1 - включено, 2 - авто

## use_text_index_dictionary_cache \\{#use_text_index_dictionary_cache\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Определяет, использовать ли кэш десериализованного блока словаря текстового индекса.
Использование кэша блока словаря текстового индекса может значительно уменьшить задержки и увеличить пропускную способность при выполнении большого числа запросов по текстовому индексу.

## use_text_index_header_cache \\{#use_text_index_header_cache\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Нужно ли использовать кэш десериализованного заголовка текстового индекса.
Использование кэша заголовка текстового индекса может значительно уменьшить задержки и увеличить пропускную способность при работе с большим количеством запросов к текстовому индексу.

## use_text_index_postings_cache \\{#use_text_index_postings_cache\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Определяет, использовать ли кэш десериализованных списков вхождений текстового индекса.
Использование кэша списков вхождений текстового индекса может существенно снизить задержку и повысить пропускную способность при работе с большим количеством запросов к текстовому индексу.

## use_top_k_dynamic_filtering \\{#use_top_k_dynamic_filtering\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting."}]}]}/>

Включает оптимизацию динамической фильтрации при выполнении запроса `ORDER BY <column> LIMIT n`.

Когда параметр включен, движок выполнения запроса будет пытаться пропускать гранулы и строки, которые не попадут в итоговые `top N` строк в результирующем наборе. Эта оптимизация является динамической по своей природе, а снижение задержки зависит от распределения данных и наличия других предикатов в запросе.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_uncompressed_cache \\{#use_uncompressed_cache\\}

<SettingsInfoBlock type="Bool" default_value="0" />

Следует ли использовать кэш несжатых блоков (uncompressed cache). Принимает значения 0 или 1. По умолчанию — 0 (отключено).
Использование uncompressed cache (только для таблиц семейства MergeTree) может значительно снизить задержку и увеличить пропускную способность при работе с большим количеством коротких запросов. Включайте этот параметр для пользователей, которые отправляют частые короткие запросы. Также обратите внимание на конфигурационный параметр [uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) (задается только в конфигурационном файле) — размер блоков uncompressed cache. По умолчанию — 8 GiB. Uncompressed cache заполняется по мере необходимости, а наименее используемые данные автоматически удаляются.

Для запросов, которые читают хотя бы относительно большой объем данных (один миллион строк и более), uncompressed cache автоматически отключается, чтобы освободить место для действительно маленьких запросов. Это означает, что вы можете всегда оставлять настройку `use_uncompressed_cache` равной 1.

## use_variant_as_common_type \{#use_variant_as_common_type\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Разрешить использование Variant в if/multiIf при отсутствии общего типа"}]}]} />

Позволяет использовать тип `Variant` в качестве результирующего типа для функций [if](../../sql-reference/functions/conditional-functions.md/#if)/[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)/[array](../../sql-reference/functions/array-functions.md)/[map](../../sql-reference/functions/tuple-map-functions.md), если для аргументов не существует общего типа.

Пример:

```sql
SET use_variant_as_common_type = 1;
SELECT toTypeName(if(number % 2, number, range(number))) as variant_type FROM numbers(1);
SELECT if(number % 2, number, range(number)) as variant FROM numbers(5);
```

```text
┌─variant_type───────────────────┐
│ Variant(Array(UInt64), UInt64) │
└────────────────────────────────┘
┌─variant───┐
│ []        │
│ 1         │
│ [0,1]     │
│ 3         │
│ [0,1,2,3] │
└───────────┘
```

```sql
SET use_variant_as_common_type = 1;
SELECT toTypeName(multiIf((number % 4) = 0, 42, (number % 4) = 1, [1, 2, 3], (number % 4) = 2, 'Hello, World!', NULL)) AS variant_type FROM numbers(1);
SELECT multiIf((number % 4) = 0, 42, (number % 4) = 1, [1, 2, 3], (number % 4) = 2, 'Hello, World!', NULL) AS variant FROM numbers(4);
```

```text
─variant_type─────────────────────────┐
│ Variant(Array(UInt8), String, UInt8) │
└──────────────────────────────────────┘

┌─variant───────┐
│ 42            │
│ [1,2,3]       │
│ Hello, World! │
│ ᴺᵁᴸᴸ          │
└───────────────┘
```

```sql
SET use_variant_as_common_type = 1;
SELECT toTypeName(array(range(number), number, 'str_' || toString(number))) as array_of_variants_type from numbers(1);
SELECT array(range(number), number, 'str_' || toString(number)) as array_of_variants FROM numbers(3);
```

```text
┌─array_of_variants_type────────────────────────┐
│ Array(Variant(Array(UInt64), String, UInt64)) │
└───────────────────────────────────────────────┘

┌─array_of_variants─┐
│ [[],0,'str_0']    │
│ [[0],1,'str_1']   │
│ [[0,1],2,'str_2'] │
└───────────────────┘
```

```sql
SET use_variant_as_common_type = 1;
SELECT toTypeName(map('a', range(number), 'b', number, 'c', 'str_' || toString(number))) as map_of_variants_type from numbers(1);
SELECT map('a', range(number), 'b', number, 'c', 'str_' || toString(number)) as map_of_variants FROM numbers(3);
```

```text
┌─map_of_variants_type────────────────────────────────┐
│ Map(String, Variant(Array(UInt64), String, UInt64)) │
└─────────────────────────────────────────────────────┘

┌─map_of_variants───────────────┐
│ {'a':[],'b':0,'c':'str_0'}    │
│ {'a':[0],'b':1,'c':'str_1'}   │
│ {'a':[0,1],'b':2,'c':'str_2'} │
└───────────────────────────────┘
```


## use_variant_default_implementation_for_comparisons \\{#use_variant_default_implementation_for_comparisons\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "Включает стандартную реализацию типа Variant в функциях сравнения"}]}]}/>

Включает или отключает стандартную реализацию типа Variant в функциях сравнения.

## use_with_fill_by_sorting_prefix \\{#use_with_fill_by_sorting_prefix\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "Столбцы, предшествующие столбцам WITH FILL в предложении ORDER BY, образуют сортировочный префикс. Строки с разными значениями сортировочного префикса заполняются независимо."}]}]}/>

Столбцы, предшествующие столбцам WITH FILL в предложении ORDER BY, образуют сортировочный префикс. Строки с разными значениями сортировочного префикса заполняются независимо.

## validate_enum_literals_in_operators \\{#validate_enum_literals_in_operators\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

Если параметр включён, проверяются литералы enum в операторах `IN`, `NOT IN`, `==`, `!=` на соответствие типу enum и выбрасывается исключение, если литерал не является допустимым значением enum.

## validate_mutation_query \\{#validate_mutation_query\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "Новая настройка для проверки запросов мутаций по умолчанию."}]}]}/>

Проверять запросы мутаций до их принятия. Мутации выполняются в фоновом режиме, и запуск некорректного запроса приведёт к зависанию мутаций, что потребует ручного вмешательства.

Изменяйте эту настройку только в том случае, если вы столкнулись с ошибкой, несовместимой с предыдущими версиями.

## validate_polygons \\{#validate_polygons\\}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.4"},{"label": "1"},{"label": "По умолчанию функция pointInPolygon генерирует исключение, если многоугольник некорректен, вместо возврата потенциально неверных результатов"}]}]}/>

Включает или отключает генерацию исключения в функции [pointInPolygon](/sql-reference/functions/geo/coordinates#pointinpolygon), если многоугольник самопересекающийся или самокасательный.

Возможные значения:

- 0 — генерация исключения отключена. `pointInPolygon` принимает некорректные многоугольники и возвращает для них потенциально неверные результаты.
- 1 — генерация исключения включена.

## vector_search_filter_strategy \\{#vector_search_filter_strategy\\}

<SettingsInfoBlock type="VectorSearchFilterStrategy" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "New setting"}]}]}/>

Если запрос векторного поиска содержит предложение WHERE, этот параметр определяет, будет ли оно вычисляться первым (предварительная фильтрация, pre-filtering) ИЛИ сначала будет использоваться индекс векторного сходства (последующая фильтрация, post-filtering). Возможные значения:

- 'auto' — последующая фильтрация (точная семантика может измениться в будущем).
- 'postfilter' — сначала использовать индекс векторного сходства для определения ближайших соседей, затем применять остальные фильтры.
- 'prefilter' — сначала вычислять остальные фильтры, затем выполнять полный перебор (brute-force search) для определения ближайших соседей.

## vector_search_index_fetch_multiplier \\{#vector_search_index_fetch_multiplier\\}

**Псевдонимы**: `vector_search_postfilter_multiplier`

<SettingsInfoBlock type="Float" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Псевдоним для настройки 'vector_search_postfilter_multiplier'"}]}]}/>

Умножает количество извлечённых ближайших соседей из индекса поиска по векторному сходству на это число. Применяется только при постфильтрации с другими предикатами или если установлена настройка `vector_search_with_rescoring = 1`.

## vector_search_with_rescoring \\{#vector_search_with_rescoring\\}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

Определяет, выполняет ли ClickHouse перерасчет оценок (rescoring) для запросов, которые используют индекс векторного сходства.
Без перерасчета индекс векторного сходства напрямую возвращает строки, содержащие наилучшие совпадения.
С перерасчетом строки расширяются до уровня гранулы, и все строки в грануле проверяются повторно.
В большинстве случаев перерасчет лишь незначительно улучшает точность, но при этом существенно ухудшает производительность запросов векторного поиска.
Примечание: запрос, выполняемый без перерасчета и с включенными параллельными репликами, может автоматически перейти в режим с перерасчетом.

## wait_changes_become_visible_after_commit_mode \\{#wait_changes_become_visible_after_commit_mode\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="TransactionsWaitCSNMode" default_value="wait_unknown" />

Ожидать, пока зафиксированные изменения не станут видимыми в последнем снимке

## wait_for_async_insert \\{#wait_for_async_insert\\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если значение равно `true`, ожидает завершения обработки асинхронной вставки

## wait_for_async_insert_timeout \\{#wait_for_async_insert_timeout\\}

<SettingsInfoBlock type="Seconds" default_value="120" />

Таймаут ожидания обработки асинхронной вставки данных

## wait_for_window_view_fire_signal_timeout \\{#wait_for_window_view_fire_signal_timeout\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="10" />

Тайм-аут ожидания сигнала срабатывания window view при обработке по времени события

## window_view_clean_interval \\{#window_view_clean_interval\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="60" />

Интервал очистки оконного представления в секундах для удаления устаревших данных.

## window_view_heartbeat_interval \\{#window_view_heartbeat_interval\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="15" />

Интервал в секундах, показывающий, что watch‑запрос продолжает выполняться.

## нагрузка \\{#workload\\}

<SettingsInfoBlock type="String" default_value="default" />

Имя рабочей нагрузки, которое будет использоваться для доступа к ресурсам

## write_full_path_in_iceberg_metadata \\{#write_full_path_in_iceberg_metadata\\}

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Записывать полные пути (включая s3://) в файлы метаданных формата Iceberg.

## write_through_distributed_cache \\{#write_through_distributed_cache\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Разрешает запись в распределённый кэш (при этом запись в S3 также будет выполняться через распределённый кэш).

## write_through_distributed_cache_buffer_size \\{#write_through_distributed_cache_buffer_size\\}

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "Новая настройка для Cloud"}]}]}/>

Имеет эффект только в ClickHouse Cloud. Задает размер буфера для сквозного (write-through) распределенного кэша. Если значение равно 0, используется размер буфера, который был бы использован, если бы распределенного кэша не было.

## zstd_window_log_max \\{#zstd_window_log_max\\}

<SettingsInfoBlock type="Int64" default_value="0" />

Позволяет задать максимальный параметр window log для ZSTD (не применяется к семейству MergeTree)