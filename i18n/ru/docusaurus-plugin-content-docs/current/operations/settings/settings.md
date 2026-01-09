---
title: 'Настройки сеанса'
sidebar_label: 'Настройки сеанса'
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

Все перечисленные ниже настройки также доступны в таблице [system.settings](/docs/operations/system-tables/settings). Эти настройки автоматически генерируются из [исходного кода](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/Settings.cpp).


## add_http_cors_header {#add_http_cors_header} 

<SettingsInfoBlock type="Bool" default_value="0" />

Добавлять HTTP-заголовок CORS.

## additional&#95;result&#95;filter {#additional_result_filter}

Дополнительное выражение фильтрации, применяемое к результату запроса `SELECT`.
Эта настройка не применяется ни к каким подзапросам.

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


## additional&#95;table&#95;filters {#additional_table_filters}

<SettingsInfoBlock type="Map" default_value="{}" />

Дополнительное выражение фильтрации, которое применяется после чтения данных
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


## aggregate&#95;function&#95;input&#95;format {#aggregate_function_input_format}

<SettingsInfoBlock type="AggregateFunctionInputFormat" default_value="state" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "state"},{"label": "Новая настройка для управления форматом ввода AggregateFunction во время операций INSERT. Значение настройки по умолчанию — state"}]}]} />

Формат ввода для AggregateFunction во время операций INSERT.

Возможные значения:

* `state` — двоичная строка с сериализованным состоянием (значение по умолчанию). Это поведение по умолчанию, при котором значения AggregateFunction передаются в виде двоичных данных.
* `value` — формат ожидает одно значение аргумента агрегатной функции или, в случае нескольких аргументов, кортеж этих значений. Они десериализуются с помощью соответствующего IDataType или DataTypeTuple, а затем агрегируются для формирования состояния.
* `array` — формат ожидает массив (Array) значений, как описано в варианте `value` выше. Все элементы массива будут агрегированы для формирования состояния.

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

При значении `aggregate_function_input_format = 'array'`:

```sql
INSERT INTO example FORMAT CSV
123,"[456,789,101]"
```

Примечание: форматы `value` и `array` работают медленнее, чем формат по умолчанию `state`, так как при вставке необходимо создавать и агрегировать значения.


## aggregate&#95;functions&#95;null&#95;for&#95;empty {#aggregate_functions_null_for_empty}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает перезапись всех агрегатных функций в запросе с добавлением к ним суффикса [-OrNull](/sql-reference/aggregate-functions/combinators#-ornull). Включите для обеспечения совместимости со стандартом SQL.
Реализуется через перезапись запроса (аналогично настройке [count&#95;distinct&#95;implementation](#count_distinct_implementation)), чтобы получать согласованные результаты для распределённых запросов.

Возможные значения:

* 0 — отключено.
* 1 — включено.

**Пример**

Рассмотрим следующий запрос с агрегатными функциями:

```sql
SELECT SUM(-1), MAX(0) FROM system.one WHERE 0;
```

С `aggregate_functions_null_for_empty = 0` это даст следующий результат:

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


## aggregation_in_order_max_block_bytes {#aggregation_in_order_max_block_bytes} 

<SettingsInfoBlock type="UInt64" default_value="50000000" />

Максимальный размер блока в байтах, накапливаемого при агрегации в порядке первичного ключа. Уменьшение размера блока позволяет лучше распараллелить финальный этап слияния агрегации.

## aggregation_memory_efficient_merge_threads {#aggregation_memory_efficient_merge_threads} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Количество потоков, используемых для слияния промежуточных результатов агрегации в режиме экономного использования памяти. Чем больше значение, тем больше потребление памяти. 0 означает то же самое, что и для «max_threads».

## allow_aggregate_partitions_independently {#allow_aggregate_partitions_independently} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает независимую агрегацию партиций в отдельных потоках, когда ключ партиции совпадает с ключом GROUP BY. Полезно, когда количество партиций близко к количеству ядер CPU и партиции имеют примерно одинаковый размер.

## allow_archive_path_syntax {#allow_archive_path_syntax} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "Добавлен новый параметр, позволяющий отключить синтаксис пути архива."}]}, {"id": "row-2","items": [{"label": "24.5"},{"label": "1"},{"label": "Добавлен новый параметр, позволяющий отключить синтаксис пути архива."}]}]}/>

Движки File/S3 и табличная функция будут интерпретировать пути, содержащие '::', как `<archive>::<file>`, если архив имеет корректное расширение.

## allow_asynchronous_read_from_io_pool_for_merge_tree {#allow_asynchronous_read_from_io_pool_for_merge_tree} 

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать фоновый пул ввода-вывода для чтения из таблиц MergeTree. Этот параметр может повысить производительность запросов, производительность которых ограничена операциями ввода-вывода.

## allow_changing_replica_until_first_data_packet {#allow_changing_replica_until_first_data_packet} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, в запросах с хеджированием можно устанавливать новое соединение до получения первого пакета данных, даже если уже был достигнут некоторый прогресс
(но прогресс не обновлялся в течение таймаута `receive_data_timeout`); в противном случае смена реплики запрещается после первого момента, когда был достигнут прогресс.

## allow_create_index_without_type {#allow_create_index_without_type} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешить запрос CREATE INDEX без указания TYPE. Запрос будет проигнорирован. Предназначено для тестов совместимости с SQL.

## allow_custom_error_code_in_throwif {#allow_custom_error_code_in_throwif} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает использование пользовательского кода ошибки в функции throwIf(). Если установлено значение true, генерируемые исключения могут иметь неожиданные коды ошибок.

## allow_ddl {#allow_ddl} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр имеет значение true, пользователю разрешено выполнять DDL-запросы.

## allow_deprecated_database_ordinary {#allow_deprecated_database_ordinary} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает создавать базы данных с устаревшим движком Ordinary

## allow_deprecated_error_prone_window_functions {#allow_deprecated_error_prone_window_functions} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "Разрешает использование устаревших ошибкоопасных оконных функций (neighbor, runningAccumulate, runningDifferenceStartingWithFirstValue, runningDifference)"}]}]}/>

Разрешает использование устаревших ошибкоопасных оконных функций (neighbor, runningAccumulate, runningDifferenceStartingWithFirstValue, runningDifference)

## allow_deprecated_snowflake_conversion_functions {#allow_deprecated_snowflake_conversion_functions} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Отключены устаревшие функции snowflakeToDateTime[64] и dateTime[64]ToSnowflake."}]}]}/>

Функции `snowflakeToDateTime`, `snowflakeToDateTime64`, `dateTimeToSnowflake` и `dateTime64ToSnowflake` помечены как устаревшие и по умолчанию отключены.
Используйте вместо них функции `snowflakeIDToDateTime`, `snowflakeIDToDateTime64`, `dateTimeToSnowflakeID` и `dateTime64ToSnowflakeID`.

Чтобы снова включить устаревшие функции (например, на период миграции), установите для этого параметра значение `true`.

## allow_deprecated_syntax_for_merge_tree {#allow_deprecated_syntax_for_merge_tree} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает создавать таблицы *MergeTree с устаревшим синтаксисом определения движка таблицы

## allow_distributed_ddl {#allow_distributed_ddl} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр имеет значение true, пользователю разрешается выполнять распределённые DDL-запросы.

## allow_drop_detached {#allow_drop_detached} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает выполнять запросы ALTER TABLE ... DROP DETACHED PART[ITION] ...

## allow_dynamic_type_in_join_keys {#allow_dynamic_type_in_join_keys} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "По умолчанию запрещает использование типа Dynamic в ключах JOIN"}]}]}/>

Разрешает использование типа Dynamic в ключах JOIN. Добавлен для совместимости. Не рекомендуется использовать тип Dynamic в ключах JOIN, так как сравнение с другими типами может привести к непредвиденным результатам.

## allow_execute_multiif_columnar {#allow_execute_multiif_columnar} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает выполнять функцию multiIf в столбцовом режиме

## allow_experimental_alias_table_engine {#allow_experimental_alias_table_engine} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Разрешает создание таблиц с движком Alias.

## allow_experimental_analyzer {#allow_experimental_analyzer} 

**Aliases**: `enable_analyzer`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Включает анализатор и планировщик запросов по умолчанию."}]}]}/>

Разрешает использование нового анализатора запросов.

## allow_experimental_codecs {#allow_experimental_codecs} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение true, можно указывать экспериментальные кодеки сжатия (но пока таких кодеков нет, поэтому эта опция ничего не делает).

## allow_experimental_correlated_subqueries {#allow_experimental_correlated_subqueries} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Поддержка коррелированных подзапросов помечена как Beta."}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "Добавлена новая настройка для разрешения выполнения коррелированных подзапросов."}]}]}/>

Разрешает выполнять коррелированные подзапросы.

## allow_experimental_database_glue_catalog {#allow_experimental_database_glue_catalog} 

<BetaBadge/>

**Псевдонимы**: `allow_database_glue_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "Разрешает использование экспериментального движка базы данных DataLakeCatalog с catalog_type = 'glue'"}]}]}/>

Разрешает использование экспериментального движка базы данных DataLakeCatalog с catalog_type = 'glue'

## allow_experimental_database_hms_catalog {#allow_experimental_database_hms_catalog} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Разрешает экспериментальный движок базы данных DataLakeCatalog с catalog_type = 'hive'"}]}]}/>

Разрешает экспериментальный движок базы данных DataLakeCatalog с catalog_type = 'hms'

## allow_experimental_database_iceberg {#allow_experimental_database_iceberg} 

<BetaBadge/>

**Псевдонимы**: `allow_database_iceberg`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "Новый параметр."}]}]}/>

Разрешает использование экспериментального движка базы данных DataLakeCatalog с catalog_type = 'iceberg'

## allow_experimental_database_materialized_postgresql {#allow_experimental_database_materialized_postgresql} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает создание базы данных с движком Engine=MaterializedPostgreSQL(...).

## allow_experimental_database_paimon_rest_catalog {#allow_experimental_database_paimon_rest_catalog} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Разрешает использовать экспериментальный движок базы данных DataLakeCatalog с catalog_type = 'paimon_rest'

## allow_experimental_database_unity_catalog {#allow_experimental_database_unity_catalog} 

<BetaBadge/>

**Псевдонимы**: `allow_database_unity_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "Allow experimental database engine DataLakeCatalog with catalog_type = 'unity'"}]}]}/>

Разрешает использование экспериментального движка базы данных DataLakeCatalog с catalog_type = 'unity'

## allow_experimental_delta_kernel_rs {#allow_experimental_delta_kernel_rs} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

Разрешает использование экспериментальной реализации delta-kernel-rs.

## allow_experimental_delta_lake_writes {#allow_experimental_delta_lake_writes} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting."}]}]}/>

Включает функцию записи с использованием delta-kernel.

## allow_experimental_funnel_functions {#allow_experimental_funnel_functions} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Включить экспериментальные функции для анализа воронок.

## allow_experimental_hash_functions {#allow_experimental_hash_functions} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Включает экспериментальные хэш-функции

## allow_experimental_iceberg_compaction {#allow_experimental_iceberg_compaction} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Разрешает явное использование `OPTIMIZE` для таблиц Iceberg.

## allow_experimental_insert_into_iceberg {#allow_experimental_insert_into_iceberg} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting."}]}]}/>

Разрешает выполнять запросы `insert` в Iceberg.

## allow_experimental_join_right_table_sorting {#allow_experimental_join_right_table_sorting} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Если установлено в значение true и выполняются условия `join_to_sort_minimum_perkey_rows` и `join_to_sort_maximum_table_rows`, правая таблица будет пересортирована по ключу для повышения производительности левого или внутреннего hash join"}]}]}/>

Если установлено в значение true и выполняются условия `join_to_sort_minimum_perkey_rows` и `join_to_sort_maximum_table_rows`, правая таблица будет пересортирована по ключу для повышения производительности левого или внутреннего hash join.

## allow_experimental_kafka_offsets_storage_in_keeper {#allow_experimental_kafka_offsets_storage_in_keeper} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "Разрешить использование экспериментального движка хранения Kafka, который сохраняет зафиксированные смещения в ClickHouse Keeper"}]}]}/>

Разрешает экспериментальную возможность хранения смещений, связанных с Kafka, в ClickHouse Keeper. При включении параметра для движка таблицы Kafka можно указать путь в ClickHouse Keeper и имя реплики. В результате вместо обычного движка Kafka будет использоваться новый тип движка хранения, который будет хранить зафиксированные смещения преимущественно в ClickHouse Keeper.

## allow_experimental_kusto_dialect {#allow_experimental_kusto_dialect} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

Включает язык запросов Kusto (KQL) — альтернативу SQL.

## allow_experimental_materialized_postgresql_table {#allow_experimental_materialized_postgresql_table} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использовать движок таблицы MaterializedPostgreSQL. По умолчанию параметр отключён, так как это экспериментальная возможность.

## allow_experimental_nlp_functions {#allow_experimental_nlp_functions} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Включает экспериментальные функции для обработки естественного языка.

## allow_experimental_object_storage_queue_hive_partitioning {#allow_experimental_object_storage_queue_hive_partitioning} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "Новый параметр."}]}]}/>

Разрешает использовать партиционирование Hive с движками S3Queue/AzureQueue

## allow_experimental_parallel_reading_from_replicas {#allow_experimental_parallel_reading_from_replicas} 

**Псевдонимы**: `enable_parallel_replicas`

<SettingsInfoBlock type="UInt64" default_value="0" />

Использовать до `max_parallel_replicas` реплик из каждого сегмента для выполнения SELECT-запроса. Чтение выполняется параллельно и координируется динамически. 0 — отключено, 1 — включено, при сбое реплики тихо отключаются, 2 — включено, при сбое выбрасывается исключение

## allow_experimental_prql_dialect {#allow_experimental_prql_dialect} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Включить PRQL — альтернативу SQL.

## allow_experimental_qbit_type {#allow_experimental_qbit_type} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

Позволяет создавать тип данных [QBit](../../sql-reference/data-types/qbit.md).

## allow_experimental_query_deduplication {#allow_experimental_query_deduplication} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Экспериментальная дедупликация данных для запросов SELECT на основе UUID частей

## allow_experimental_statistics {#allow_experimental_statistics} 

<ExperimentalBadge/>

**Псевдонимы**: `allow_experimental_statistic`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Параметр был переименован. Предыдущее имя — `allow_experimental_statistic`."}]}]}/>

Разрешает задавать столбцы со [статистикой](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-creating-a-table) и [выполнять операции со статистикой](../../engines/table-engines/mergetree-family/mergetree.md/#column-statistics).

## allow_experimental_time_series_aggregate_functions {#allow_experimental_time_series_aggregate_functions} 

<ExperimentalBadge/>

**Псевдонимы**: `allow_experimental_ts_to_grid_aggregate_function`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Новая настройка, позволяющая включить экспериментальные агрегатные функции timeSeries*."}]}]}/>

Экспериментальные агрегатные функции timeSeries* для ресемплинга временных рядов в стиле Prometheus, расчёта скорости изменений (rate) и дельты.

## allow_experimental_time_series_table {#allow_experimental_time_series_table} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "Добавлена новая настройка для включения табличного движка TimeSeries"}]}]}/>

Разрешает создание таблиц с табличным движком [TimeSeries](../../engines/table-engines/integrations/time-series.md). Возможные значения:

- 0 — табличный движок [TimeSeries](../../engines/table-engines/integrations/time-series.md) отключен.
- 1 — табличный движок [TimeSeries](../../engines/table-engines/integrations/time-series.md) включен.

## allow_experimental_window_view {#allow_experimental_window_view} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Включает WINDOW VIEW. Функциональность пока недостаточно стабильна.

## allow_experimental_ytsaurus_dictionary_source {#allow_experimental_ytsaurus_dictionary_source} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Экспериментальный источник словаря для интеграции с YTsaurus.

## allow_experimental_ytsaurus_table_engine {#allow_experimental_ytsaurus_table_engine} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новый параметр."}]}]}/>

Экспериментальный движок таблицы для интеграции с YTsaurus.

## allow_experimental_ytsaurus_table_function {#allow_experimental_ytsaurus_table_function} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

Экспериментальный табличный движок для интеграции с YTsaurus.

## allow_general_join_planning {#allow_general_join_planning} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Разрешает более общий алгоритм планирования JOIN при включённом алгоритме hash JOIN."}]}]}/>

Разрешает использование более общего алгоритма планирования JOIN, который может обрабатывать более сложные условия, но работает только с hash JOIN. Если hash JOIN не включён, используется обычный алгоритм планирования JOIN независимо от значения этого SETTING.

## allow_get_client_http_header {#allow_get_client_http_header} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Introduced a new function."}]}]}/>

Разрешает использование функции `getClientHTTPHeader`, которая позволяет получить значение заголовка текущего HTTP‑запроса. По умолчанию параметр отключен в целях безопасности, так как некоторые заголовки, например `Cookie`, могут содержать конфиденциальную информацию. Обратите внимание, что заголовки `X-ClickHouse-*` и `Authentication` всегда недоступны и не могут быть получены с помощью этой функции.

## allow_hyperscan {#allow_hyperscan} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает функции, использующие библиотеку Hyperscan. Отключите, чтобы избежать потенциально долгой компиляции и чрезмерного расхода ресурсов.

## allow_introspection_functions {#allow_introspection_functions} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает [функции интроспекции](../../sql-reference/functions/introspection.md) для профилирования запросов.

Возможные значения:

- 1 — функции интроспекции включены.
- 0 — функции интроспекции отключены.

**См. также**

- [Sampling Query Profiler](../../operations/optimizing-performance/sampling-query-profiler.md)
- Системная таблица [trace_log](/operations/system-tables/trace_log)

## allow_materialized_view_with_bad_select {#allow_materialized_view_with_bad_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "Запретить создание materialized view, ссылающихся на несуществующие столбцы или таблицы"}]}, {"id": "row-2","items": [{"label": "24.9"},{"label": "1"},{"label": "Поддерживать (но пока не включать) более строгую проверку при CREATE MATERIALIZED VIEW"}]}]}/>

Разрешает CREATE MATERIALIZED VIEW с запросом SELECT, который ссылается на несуществующие таблицы или столбцы. Запрос при этом по‑прежнему должен быть синтаксически корректным. Не применяется к обновляемым materialized view. Не применяется, если схему materialized view нужно выводить из запроса SELECT (то есть если в CREATE нет списка столбцов и нет таблицы TO). Может использоваться для создания materialized view до создания исходной таблицы.

## allow_named_collection_override_by_default {#allow_named_collection_override_by_default} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает по умолчанию переопределение полей именованных коллекций.

## allow_non_metadata_alters {#allow_non_metadata_alters} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает выполнять операции ALTER, которые затрагивают не только метаданные таблиц, но и данные на диске

## allow_nonconst_timezone_arguments {#allow_nonconst_timezone_arguments} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "Разрешает неконстантные аргументы часового пояса в некоторых функциях, связанных со временем, таких как toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*()."}]}]}/>

Разрешает неконстантные аргументы часового пояса в некоторых функциях, связанных со временем, таких как toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*().
Этот параметр SETTING существует только по причинам совместимости. В ClickHouse часовой пояс — это свойство типа данных и, соответственно, столбца.
Включение этого параметра SETTING создаёт неверное впечатление, что разные значения внутри одного столбца могут иметь разные часовые пояса.
Поэтому не следует включать этот параметр SETTING.

## allow&#95;nondeterministic&#95;mutations {#allow_nondeterministic_mutations}

<SettingsInfoBlock type="Bool" default_value="0" />

Пользовательская настройка, позволяющая выполнять мутации в реплицируемых таблицах с использованием недетерминированных функций, таких как `dictGet`.

Поскольку, например, словари могут быть несинхронизированы между узлами, мутации, которые извлекают из них значения, по умолчанию запрещены для реплицируемых таблиц. Включение этой настройки разрешает такое поведение и возлагает на пользователя ответственность за то, чтобы используемые данные были синхронизированы на всех узлах.

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


## allow_nondeterministic_optimize_skip_unused_shards {#allow_nondeterministic_optimize_skip_unused_shards} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использование недетерминированных функций (например, `rand` или `dictGet`; при этом у `dictGet` есть некоторые особенности при обновлениях) в ключе распределения по сегментам.

Возможные значения:

- 0 — Запрещено.
- 1 — Разрешено.

## allow_prefetched_read_pool_for_local_filesystem {#allow_prefetched_read_pool_for_local_filesystem} 

<SettingsInfoBlock type="Bool" default_value="0" />

Предпочитать пул потоков предвыборочного чтения, если все части находятся в локальной файловой системе

## allow_prefetched_read_pool_for_remote_filesystem {#allow_prefetched_read_pool_for_remote_filesystem} 

<SettingsInfoBlock type="Bool" default_value="1" />

Предпочитать пул потоков с предварительной выборкой, если все части находятся в удалённой файловой системе

## allow_push_predicate_ast_for_distributed_subqueries {#allow_push_predicate_ast_for_distributed_subqueries} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "A new setting"}]}]}/>

Разрешает проталкивание предикатов на уровне AST для распределённых подзапросов при включённом анализаторе

## allow_push_predicate_when_subquery_contains_with {#allow_push_predicate_when_subquery_contains_with} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает проталкивание предиката, если подзапрос содержит предложение WITH

## allow_reorder_prewhere_conditions {#allow_reorder_prewhere_conditions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

При переносе условий из WHERE в PREWHERE разрешает переупорядочивать их для оптимизации фильтрации

## allow&#95;settings&#95;after&#95;format&#95;in&#95;insert {#allow_settings_after_format_in_insert}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.4"},{"label": "0"},{"label": "Не разрешать использование SETTINGS после FORMAT для запросов INSERT, поскольку ClickHouse интерпретирует SETTINGS как некоторые значения, что вводит в заблуждение"}]}]} />

Управляет тем, разрешено ли использование `SETTINGS` после `FORMAT` в запросах `INSERT`. Использовать этот параметр не рекомендуется, так как часть `SETTINGS` может быть интерпретирована как значения.

Пример:

```sql
INSERT INTO FUNCTION null('foo String') SETTINGS max_threads=1 VALUES ('bar');
```

Однако приведённый ниже запрос будет работать только при включённом параметре `allow_settings_after_format_in_insert`:

```sql
SET allow_settings_after_format_in_insert=1;
INSERT INTO FUNCTION null('foo String') VALUES ('bar') SETTINGS max_threads=1;
```

Возможные значения:

* 0 — Запретить.
* 1 — Разрешить.

:::note
Используйте эту настройку только для обеспечения обратной совместимости, если ваши сценарии использования зависят от старого синтаксиса.
:::


## allow_simdjson {#allow_simdjson} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает использование библиотеки simdjson в функциях `JSON*`, если доступны инструкции AVX2. Если параметр отключён, будет использоваться библиотека rapidjson.

## allow_special_serialization_kinds_in_output_formats {#allow_special_serialization_kinds_in_output_formats} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Включить прямой вывод специальных представлений столбцов, таких как Sparse/Replicated, в некоторых форматах вывода"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Добавить настройку, позволяющую выводить специальные представления столбцов, такие как Sparse/Replicated, без преобразования их в полные столбцы"}]}]}/>

Позволяет выводить столбцы со специальными видами сериализации, такими как Sparse и Replicated, без преобразования их в полное представление столбцов.
Это помогает избежать лишнего копирования данных при форматировании.

## allow_statistics_optimize {#allow_statistics_optimize} 

<BetaBadge/>

**Псевдонимы**: `allow_statistic_optimize`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "Включает эту оптимизацию по умолчанию."}]}, {"id": "row-2","items": [{"label": "24.6"},{"label": "0"},{"label": "Параметр был переименован. Предыдущее имя — `allow_statistic_optimize`."}]}]}/>

Разрешает использование статистики для оптимизации запросов

## allow_suspicious_codecs {#allow_suspicious_codecs} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.5"},{"label": "0"},{"label": "Запрещает указывать бессмысленные кодеки сжатия"}]}]}/>

Если значение — true, позволяет указывать бессмысленные кодеки сжатия.

## allow_suspicious_fixed_string_types {#allow_suspicious_fixed_string_types} 

<SettingsInfoBlock type="Bool" default_value="0" />

В операторе CREATE TABLE позволяет создавать столбцы типа FixedString(n) с n > 256. FixedString с длиной >= 256 считается подозрительным и, скорее всего, указывает на неправильное использование.

## allow_suspicious_indices {#allow_suspicious_indices} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "Если установлено значение true, индекс может быть определён с одинаковыми выражениями"}]}]}/>

Отклоняет первичные/вторичные индексы и ключи сортировки с одинаковыми выражениями

## allow_suspicious_low_cardinality_types {#allow_suspicious_low_cardinality_types} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает или запрещает использование [LowCardinality](../../sql-reference/data-types/lowcardinality.md) с типами данных фиксированного размера 8 байт или меньше: числовыми типами данных и `FixedString(8_bytes_or_less)`.

Для небольших фиксированных значений использование `LowCardinality` обычно неэффективно, так как ClickHouse хранит числовой индекс для каждой строки. В результате:

- Использование дискового пространства может увеличиться.
- Потребление RAM может быть выше в зависимости от размера словаря.
- Некоторые функции могут работать медленнее из-за дополнительных операций кодирования/декодирования.

Время слияний в таблицах с движком [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) может увеличиваться по всем причинам, описанным выше.

Возможные значения:

- 1 — использование `LowCardinality` не ограничено.
- 0 — использование `LowCardinality` ограничено.

## allow_suspicious_primary_key {#allow_suspicious_primary_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Запретить подозрительные PRIMARY KEY/ORDER BY для MergeTree (например, SimpleAggregateFunction)"}]}]}/>

Разрешить использование подозрительных `PRIMARY KEY`/`ORDER BY` для MergeTree (например, SimpleAggregateFunction).

## allow_suspicious_ttl_expressions {#allow_suspicious_ttl_expressions} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.12"},{"label": "0"},{"label": "Это новый параметр, и в предыдущих версиях поведение было эквивалентно разрешению таких выражений."}]}]}/>

Отклоняет выражения TTL, которые не зависят ни от одного столбца таблицы. В большинстве случаев это указывает на ошибку пользователя.

## allow_suspicious_types_in_group_by {#allow_suspicious_types_in_group_by} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "По умолчанию запрещает использование типов Variant и Dynamic в ключах GROUP BY"}]}]}/>

Разрешает или запрещает использование типов [Variant](../../sql-reference/data-types/variant.md) и [Dynamic](../../sql-reference/data-types/dynamic.md) в ключах GROUP BY.

## allow_suspicious_types_in_order_by {#allow_suspicious_types_in_order_by} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "По умолчанию не разрешает использование типов Variant/Dynamic в ORDER BY"}]}]}/>

Разрешает или запрещает использование типов [Variant](../../sql-reference/data-types/variant.md) и [Dynamic](../../sql-reference/data-types/dynamic.md) в ключах ORDER BY.

## allow_suspicious_variant_types {#allow_suspicious_variant_types} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "По умолчанию запрещено создавать тип Variant с подозрительными вариантами"}]}]}/>

В операторе CREATE TABLE можно указывать тип Variant с вариантами похожих типов (например, с разными числовыми типами или типами даты). Включение этого параметра может привести к неоднозначности при работе со значениями с похожими типами.

## allow_unrestricted_reads_from_keeper {#allow_unrestricted_reads_from_keeper} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает неограниченное (без условия по пути) чтение из таблицы system.zookeeper; может быть удобным, но небезопасно для ZooKeeper.

## alter_move_to_space_execute_async {#alter_move_to_space_execute_async} 

<SettingsInfoBlock type="Bool" default_value="0" />

Выполнять ALTER TABLE MOVE ... TO [DISK|VOLUME] в асинхронном режиме

## alter&#95;partition&#95;verbose&#95;result {#alter_partition_verbose_result}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает отображение информации о частях, к которым были успешно применены операции по работе с партициями и частями.
Применимо к [ATTACH PARTITION|PART](/sql-reference/statements/alter/partition#attach-partitionpart) и [FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition).

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


## alter_sync {#alter_sync} 

**Псевдонимы**: `replication_alter_partitions_sync`

<SettingsInfoBlock type="UInt64" default_value="1" />

Позволяет настроить ожидание выполнения действий на репликах при выполнении запросов [ALTER](../../sql-reference/statements/alter/index.md), [OPTIMIZE](../../sql-reference/statements/optimize.md) или [TRUNCATE](../../sql-reference/statements/truncate.md).

Возможные значения:

- `0` — Не ждать.
- `1` — Ждать выполнения на собственной реплике.
- `2` — Ждать выполнения на всех репликах.

Значение по умолчанию в Cloud: `1`.

:::note
`alter_sync` применим только к таблицам `Replicated`; на изменения таблиц, не являющихся `Replicated`, он никак не влияет.
:::

## alter_update_mode {#alter_update_mode} 

<SettingsInfoBlock type="AlterUpdateMode" default_value="heavy" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "heavy"},{"label": "A new setting"}]}]}/>

Режим выполнения `ALTER`-запросов, которые содержат команды `UPDATE`.

Возможные значения:

- `heavy` — выполняется обычная мутация.
- `lightweight` — выполняется легковесное обновление, если это возможно, в противном случае — обычная мутация.
- `lightweight_force` — выполняется легковесное обновление, если это возможно, в противном случае выбрасывается исключение.

## analyze_index_with_space_filling_curves {#analyze_index_with_space_filling_curves} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если таблица использует кривую, заполняющую пространство, в своём индексе, например `ORDER BY mortonEncode(x, y)` или `ORDER BY hilbertEncode(x, y)`, и в запросе есть условия по её аргументам, например `x >= 10 AND x <= 20 AND y >= 20 AND y <= 30`, то для анализа индекса используется эта кривая.

## analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested {#analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Новая настройка."}]}]}/>

Разрешает добавлять составные идентификаторы к полю типа `Nested`. Это настройка совместимости, поскольку она изменяет результат запроса. Если настройка отключена, `SELECT a.b.c FROM table ARRAY JOIN a` не работает, а `SELECT a FROM table` не включает столбец `a.b.c` в результат для `Nested a`.

## analyzer_compatibility_join_using_top_level_identifier {#analyzer_compatibility_join_using_top_level_identifier} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Принудительное разрешение идентификатора в JOIN USING на основе проекции"}]}]}/>

Принудительно разрешать идентификатор в JOIN USING на основе проекции (например, в запросе `SELECT a + 1 AS b FROM t1 JOIN t2 USING (b)` соединение будет выполняться по условию `t1.a + 1 = t2.b`, а не по `t1.b = t2.b`).

## any_join_distinct_right_table_keys {#any_join_distinct_right_table_keys} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.14"},{"label": "0"},{"label": "Отключить ANY RIGHT и ANY FULL JOIN по умолчанию, чтобы избежать несогласованности"}]}]}/>

Включает устаревшее поведение сервера ClickHouse в операциях `ANY INNER|LEFT JOIN`.

:::note
Используйте этот параметр только для обратной совместимости, если ваши сценарии зависят от устаревшего поведения `JOIN`.
:::

Когда устаревшее поведение включено:

- Результаты операций `t1 ANY LEFT JOIN t2` и `t2 ANY RIGHT JOIN t1` не одинаковы, потому что ClickHouse использует логику отображения ключей таблицы слева направо по схеме «многие-к-одному».
- Результаты операций `ANY INNER JOIN` содержат все строки из левой таблицы, как и операции `SEMI LEFT JOIN`.

Когда устаревшее поведение отключено:

- Результаты операций `t1 ANY LEFT JOIN t2` и `t2 ANY RIGHT JOIN t1` одинаковы, потому что ClickHouse использует логику, обеспечивающую отображение ключей по схеме «один-ко-многим» в операциях `ANY RIGHT JOIN`.
- Результаты операций `ANY INNER JOIN` содержат одну строку на ключ из левой и правой таблиц.

Возможные значения:

- 0 — устаревшее поведение отключено.
- 1 — устаревшее поведение включено.

См. также:

- [JOIN strictness](/sql-reference/statements/select/join#settings)

## apply_deleted_mask {#apply_deleted_mask} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает фильтрацию строк, удалённых с помощью легковесного удаления (lightweight DELETE). Если параметр отключён, запрос сможет читать эти строки. Это полезно для отладки и сценариев «undelete».

## apply_mutations_on_fly {#apply_mutations_on_fly} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение равно true, мутации (операторы UPDATE и DELETE), которые не материализованы в части данных, будут применяться при выполнении запросов SELECT.

## apply_patch_parts {#apply_patch_parts} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "A new setting"}]}]}/>

Если значение равно true, патч-части (которые представляют легковесные обновления) применяются при выполнении запросов SELECT.

## apply_patch_parts_join_cache_buckets {#apply_patch_parts_join_cache_buckets} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "New setting"}]}]}/>

Количество бакетов во временном кэше для применения частей патча в режиме Join.

## apply_prewhere_after_final {#apply_prewhere_after_final} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Новая настройка. При включении условия PREWHERE применяются после обработки FINAL."}]}]}/>

При включении условия PREWHERE применяются после обработки FINAL для ReplacingMergeTree и аналогичных движков.
Это может быть полезно, когда PREWHERE ссылается на столбцы, которые могут иметь разные значения в дублирующихся строках,
и вы хотите, чтобы FINAL сначала выбрал итоговую строку, а уже затем выполнялась фильтрация. При отключении PREWHERE применяется во время чтения.
Примечание: если включен apply_row_level_security_after_final и ROW POLICY использует столбцы, не входящие в ключ сортировки, выполнение PREWHERE также
будет отложено, чтобы сохранить корректный порядок выполнения (ROW POLICY должен быть применён до PREWHERE).

## apply_row_policy_after_final {#apply_row_policy_after_final} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting to control if row policies and PREWHERE are applied after FINAL processing for *MergeTree tables"}]}]}/>

Если параметр включён, политики ROW POLICY и PREWHERE применяются после обработки FINAL для таблиц на движках *MergeTree (особенно для ReplacingMergeTree).
Если параметр отключён, политики ROW POLICY применяются до FINAL, что может приводить к отличающимся результатам, когда политика
отфильтровывает строки, которые должны использоваться для дедупликации в ReplacingMergeTree или аналогичных движках.

Если выражение ROW POLICY зависит только от столбцов в ORDER BY, оно всё равно будет применяться до FINAL в целях оптимизации,
поскольку такое фильтрование не может повлиять на результат дедупликации.

Возможные значения:

- 0 — политики ROW POLICY и PREWHERE применяются до FINAL (по умолчанию).
- 1 — политики ROW POLICY и PREWHERE применяются после FINAL.

## apply_settings_from_server {#apply_settings_from_server} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Код на стороне клиента (например, разбор входных данных INSERT и форматирование результатов запроса) будет использовать те же настройки, что и сервер, включая настройки из конфигурации сервера."}]}]}/>

Определяет, должен ли клиент принимать настройки с сервера.

Это влияет только на операции, выполняемые на стороне клиента, в частности на разбор входных данных для INSERT и форматирование результата запроса. Основная часть выполнения запроса происходит на сервере и не зависит от этого параметра.

Обычно этот параметр следует задавать в профиле пользователя (users.xml или запросы типа `ALTER USER`), а не через клиент (аргументы командной строки клиента, запрос `SET` или секция `SETTINGS` запроса `SELECT`). Через клиент его можно изменить на `false`, но нельзя изменить на `true` (потому что сервер не будет отправлять настройки, если в профиле пользователя указано `apply_settings_from_server = false`).

Обратите внимание, что изначально (24.12) существовал серверный параметр (`send_settings_to_client`), но позже он был заменён этим клиентским параметром для повышения удобства использования.

## arrow_flight_request_descriptor_type {#arrow_flight_request_descriptor_type} 

<SettingsInfoBlock type="ArrowFlightDescriptorType" default_value="path" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "path"},{"label": "Новая настройка. Тип дескриптора, используемого для запросов Arrow Flight: 'path' или 'command'. Для Dremio требуется 'command'."}]}]}/>

Тип дескриптора, используемого для запросов Arrow Flight. 'path' отправляет имя набора данных в виде дескриптора пути. 'command' отправляет SQL-запрос в виде дескриптора команды (требуется для Dremio).

Возможные значения:

- 'path' — использовать FlightDescriptor::Path (значение по умолчанию, работает с большинством серверов Arrow Flight)
- 'command' — использовать FlightDescriptor::Command с запросом SELECT (требуется для Dremio)

## asterisk_include_alias_columns {#asterisk_include_alias_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включать столбцы [ALIAS](../../sql-reference/statements/create/table.md/#alias) для запроса с подстановочным символом (`SELECT *`).

Возможные значения:

- 0 — отключено
- 1 — включено

## asterisk_include_materialized_columns {#asterisk_include_materialized_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включать столбцы [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) для запросов с подстановочным символом (`SELECT *`).

Возможные значения:

- 0 - отключено
- 1 - включено

## async_insert {#async_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение установлено в true, данные из запроса INSERT помещаются в очередь и затем в фоновом режиме записываются в таблицу. Если wait_for_async_insert равно false, запрос INSERT обрабатывается почти мгновенно, в противном случае клиент будет ждать, пока данные не будут записаны в таблицу.

## async_insert_busy_timeout_decrease_rate {#async_insert_busy_timeout_decrease_rate} 

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "Коэффициент экспоненциального уменьшения адаптивного тайм-аута асинхронной вставки"}]}]}/>

Коэффициент экспоненциального уменьшения адаптивного тайм-аута асинхронной вставки

## async_insert_busy_timeout_increase_rate {#async_insert_busy_timeout_increase_rate} 

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "Экспоненциальный коэффициент увеличения адаптивного таймаута асинхронной вставки"}]}]}/>

Экспоненциальный коэффициент увеличения адаптивного таймаута асинхронной вставки

## async_insert_busy_timeout_max_ms {#async_insert_busy_timeout_max_ms} 

**Псевдонимы**: `async_insert_busy_timeout_ms`

<SettingsInfoBlock type="Milliseconds" default_value="200" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "200"},{"label": "Минимальное значение тайм-аута асинхронной вставки в миллисекундах; async_insert_busy_timeout_ms является псевдонимом параметра async_insert_busy_timeout_max_ms"}]}]}/>

Максимальное время ожидания перед сбросом накопленных данных для запроса с момента появления первых данных.

## async_insert_busy_timeout_min_ms {#async_insert_busy_timeout_min_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "50"},{"label": "Минимальное значение тайм-аута асинхронной вставки в миллисекундах; также служит начальным значением, которое впоследствии может быть увеличено адаптивным алгоритмом"}]}]}/>

Если автонастройка включена с помощью параметра async_insert_use_adaptive_busy_timeout, это минимальное время ожидания перед сбросом (dumping) накопленных данных на запрос, отсчитываемое с момента появления первых данных. Также служит начальнным значением для адаптивного алгоритма.

## async_insert_deduplicate {#async_insert_deduplicate} 

<SettingsInfoBlock type="Bool" default_value="0" />

Для асинхронных запросов INSERT в реплицируемой таблице определяет, нужно ли выполнять дедупликацию вставляемых блоков.

## async_insert_max_data_size {#async_insert_max_data_size} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10485760"},{"label": "Предыдущее значение оказалось слишком маленьким."}]}]}/>

Максимальный размер в байтах необработанных данных, собираемых для одного запроса перед вставкой.

## async_insert_max_query_number {#async_insert_max_query_number} 

<SettingsInfoBlock type="UInt64" default_value="450" />

Максимальное количество запросов INSERT, прежде чем данные будут фактически вставлены.
Действует только если настройка [`async_insert_deduplicate`](#async_insert_deduplicate) установлена в 1.

## async_insert_poll_timeout_ms {#async_insert_poll_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10"},{"label": "Тайм-аут опроса очереди асинхронных вставок в миллисекундах"}]}]}/>

Тайм-аут опроса очереди асинхронных вставок

## async_insert_use_adaptive_busy_timeout {#async_insert_use_adaptive_busy_timeout} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Использовать адаптивный таймаут ожидания занятости при асинхронных вставках"}]}]}/>

Если значение параметра — true, используется адаптивный таймаут ожидания занятости для асинхронных вставок.

## async_query_sending_for_remote {#async_query_sending_for_remote} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.3"},{"label": "1"},{"label": "Создание подключений и асинхронная отправка запросов по сегментам"}]}]}/>

Включает асинхронное создание подключений и отправку запросов при выполнении удалённого запроса.

По умолчанию параметр включён.

## async_socket_for_remote {#async_socket_for_remote} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.5"},{"label": "1"},{"label": "Исправлены все проблемы, асинхронное чтение из сокета для удалённых запросов снова включено по умолчанию"}]}, {"id": "row-2","items": [{"label": "21.3"},{"label": "0"},{"label": "Асинхронное чтение из сокета для удалённых запросов отключено из-за некоторых проблем"}]}]}/>

Включает асинхронное чтение из сокета при выполнении удалённого запроса.

Включено по умолчанию.

## automatic_parallel_replicas_min_bytes_per_replica {#automatic_parallel_replicas_min_bytes_per_replica} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Порог объёма данных в байтах, читаемых с одной реплики, начиная с которого параллельные реплики включаются автоматически (применяется только при `automatic_parallel_replicas_mode`=1). Значение 0 означает отсутствие порога.

## automatic_parallel_replicas_mode {#automatic_parallel_replicas_mode} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Включает автоматическое переключение на выполнение запросов с параллельными репликами на основе собранной статистики. Требует включения `parallel_replicas_local_plan` и указания `cluster_for_parallel_replicas`.
0 — отключено, 1 — включено, 2 — включен только сбор статистики (переключение на выполнение с параллельными репликами отключено).

## azure_allow_parallel_part_upload {#azure_allow_parallel_part_upload} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "true"},{"label": "Использует несколько потоков для многосоставной (multipart) загрузки в Azure."}]}]}/>

Использует несколько потоков для многосоставной (multipart) загрузки в Azure.

## azure_check_objects_after_upload {#azure_check_objects_after_upload} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "Проверять каждый загруженный объект в Azure Blob Storage, чтобы убедиться, что загрузка выполнена успешно"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "Проверять каждый загруженный объект в Azure Blob Storage, чтобы убедиться, что загрузка выполнена успешно"}]}]}/>

Проверять каждый загруженный объект в Azure Blob Storage, чтобы убедиться, что загрузка выполнена успешно

## azure_connect_timeout_ms {#azure_connect_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1000"},{"label": "New setting"}]}]}/>

Таймаут подключения к хосту для дисков Azure.

## azure_create_new_file_on_insert {#azure_create_new_file_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает создание нового файла при каждой вставке в таблицы движка Azure

## azure_ignore_file_doesnt_exist {#azure_ignore_file_doesnt_exist} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Позволяет возвращать 0 строк, если запрошенные файлы отсутствуют, вместо генерации исключения в движке таблиц AzureBlobStorage"}]}]}/>

Игнорировать отсутствие файла при чтении по определённым ключам.

Возможные значения:

- 1 — `SELECT` возвращает пустой результат.
- 0 — `SELECT` генерирует исключение.

## azure_list_object_keys_size {#azure_list_object_keys_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальное количество файлов, которое может быть возвращено одним пакетным запросом ListObject

## azure_max_blocks_in_multipart_upload {#azure_max_blocks_in_multipart_upload} 

<SettingsInfoBlock type="UInt64" default_value="50000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "50000"},{"label": "Максимальное количество блоков в multipart‑загрузке для Azure."}]}]}/>

Максимальное количество блоков в multipart‑загрузке для Azure.

## azure_max_get_burst {#azure_max_get_burst} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Максимальное количество запросов, которые могут быть выполнены одновременно до достижения лимита запросов в секунду. По умолчанию значение `0` соответствует `azure_max_get_rps`.

## azure_max_get_rps {#azure_max_get_rps} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Порог числа Azure GET-запросов в секунду, после которого включается ограничение скорости. Ноль означает отсутствие лимита.

## azure_max_inflight_parts_for_one_file {#azure_max_inflight_parts_for_one_file} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "20"},{"label": "Максимальное количество одновременно загружаемых частей в запросе многочастичной загрузки. 0 означает без ограничений."}]}]}/>

Максимальное количество одновременно загружаемых частей в запросе многочастичной загрузки. 0 означает без ограничений.

## azure_max_put_burst {#azure_max_put_burst} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Максимальное число запросов, которые могут быть выполнены одновременно до достижения предела запросов в секунду. Значение по умолчанию (0) соответствует `azure_max_put_rps`.

## azure_max_put_rps {#azure_max_put_rps} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Ограничение на количество запросов PUT к Azure в секунду до начала применения троттлинга. Ноль означает отсутствие ограничений.

## azure_max_redirects {#azure_max_redirects} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "Новая настройка"}]}]}/>

Максимальное допустимое количество переходов при перенаправлении Azure.

## azure_max_single_part_copy_size {#azure_max_single_part_copy_size} 

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268435456"},{"label": "Максимальный размер объекта для копирования с использованием одночастичного копирования в хранилище Azure Blob Storage."}]}]}/>

Максимальный размер объекта для копирования с использованием одночастичного копирования в хранилище Azure Blob Storage.

## azure_max_single_part_upload_size {#azure_max_single_part_upload_size} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "33554432"},{"label": "Приведено в соответствие с S3"}]}]}/>

Максимальный размер объекта для однокомпонентной загрузки (singlepart upload) в Azure Blob Storage.

## azure_max_single_read_retries {#azure_max_single_read_retries} 

<SettingsInfoBlock type="UInt64" default_value="4" />

Максимальное количество повторных попыток при одиночном чтении из Azure Blob Storage.

## azure_max_unexpected_write_error_retries {#azure_max_unexpected_write_error_retries} 

<SettingsInfoBlock type="UInt64" default_value="4" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "4"},{"label": "Максимальное количество повторных попыток в случае непредвиденных ошибок при записи в Azure Blob Storage"}]}]}/>

Максимальное количество повторных попыток в случае непредвиденных ошибок при записи в Azure Blob Storage

## azure_max_upload_part_size {#azure_max_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5368709120"},{"label": "Максимальный размер фрагмента при многокомпонентной (multipart) загрузке в Azure Blob Storage."}]}]}/>

Максимальный размер фрагмента при многокомпонентной (multipart) загрузке в Azure Blob Storage.

## azure_min_upload_part_size {#azure_min_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="16777216" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "16777216"},{"label": "Минимальный размер части, отправляемой при многосоставной загрузке в Azure Blob Storage."}]}]}/>

Минимальный размер части, отправляемой при многосоставной загрузке в Azure Blob Storage.

## azure_request_timeout_ms {#azure_request_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>

Таймаут простоя при отправке и получении данных в/из Azure. Операция считается неуспешной, если один вызов чтения или записи по TCP блокируется дольше этого времени.

## azure_sdk_max_retries {#azure_sdk_max_retries} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Максимальное количество повторных попыток в Azure SDK"}]}]}/>

Максимальное количество повторных попыток в Azure SDK

## azure_sdk_retry_initial_backoff_ms {#azure_sdk_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Минимальная задержка между повторными попытками в Azure SDK"}]}]}/>

Минимальная задержка между повторными попытками в Azure SDK

## azure_sdk_retry_max_backoff_ms {#azure_sdk_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Максимальный интервал ожидания между повторными попытками в Azure SDK"}]}]}/>

Максимальный интервал ожидания между повторными попытками в Azure SDK

## azure_skip_empty_files {#azure_skip_empty_files} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Позволяет пропускать пустые файлы в табличном движке Azure"}]}]}/>

Включает или отключает пропуск пустых файлов в движке S3.

Возможные значения:

- 0 — `SELECT` выбрасывает исключение, если пустой файл не совместим с запрошенным форматом.
- 1 — `SELECT` возвращает пустой результат для пустого файла.

## azure_strict_upload_part_size {#azure_strict_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Точный размер части, загружаемой при многосоставной (multipart) загрузке в Azure Blob Storage."}]}]}/>

Точный размер части, загружаемой при многосоставной (multipart) загрузке в Azure Blob Storage.

## azure_throw_on_zero_files_match {#azure_throw_on_zero_files_match} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Позволяет выдавать ошибку, если запрос ListObjects не находит ни одного файла в движке AzureBlobStorage, вместо возврата пустого результата запроса"}]}]}/>

Выдавать ошибку, если по правилам раскрытия шаблона (glob) не было найдено ни одного файла.

Возможные значения:

- 1 — `SELECT` генерирует исключение.
- 0 — `SELECT` возвращает пустой результат.

## azure_truncate_on_insert {#azure_truncate_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает очистку таблицы перед вставкой в таблицы движка Azure.

## azure_upload_part_size_multiply_factor {#azure_upload_part_size_multiply_factor} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "2"},{"label": "Умножает azure_min_upload_part_size на этот коэффициент каждый раз, когда в результате одной операции записи в Azure Blob Storage было загружено не менее azure_multiply_parts_count_threshold частей."}]}]}/>

Умножает azure_min_upload_part_size на этот коэффициент каждый раз, когда в результате одной операции записи в Azure Blob Storage было загружено не менее azure_multiply_parts_count_threshold частей.

## azure_upload_part_size_multiply_parts_count_threshold {#azure_upload_part_size_multiply_parts_count_threshold} 

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "500"},{"label": "Каждый раз, когда в Azure Blob Storage загружается указанное количество частей, значение azure_min_upload_part_size умножается на azure_upload_part_size_multiply_factor."}]}]}/>

Каждый раз, когда в Azure Blob Storage загружается указанное количество частей, значение azure_min_upload_part_size умножается на azure_upload_part_size_multiply_factor.

## azure_use_adaptive_timeouts {#azure_use_adaptive_timeouts} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

Если параметр имеет значение `true`, то для всех запросов к Azure первые две попытки выполняются с короткими тайм-аутами отправки и получения.
Если параметр имеет значение `false`, то все попытки выполняются с одинаковыми тайм-аутами.

## backup_restore_batch_size_for_keeper_multi {#backup_restore_batch_size_for_keeper_multi} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальный размер пакета для запроса `multi` к [Zoo]Keeper при выполнении резервного копирования или восстановления

## backup_restore_batch_size_for_keeper_multiread {#backup_restore_batch_size_for_keeper_multiread} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальный размер пакета для запроса multiread к [Zoo]Keeper при выполнении резервного копирования или восстановления

## backup_restore_failure_after_host_disconnected_for_seconds {#backup_restore_failure_after_host_disconnected_for_seconds} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "3600"},{"label": "Новая настройка."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "3600"},{"label": "Новая настройка."}]}]}/>

Если хост во время операции BACKUP ON CLUSTER или RESTORE ON CLUSTER не воссоздаёт свой эфемерный узел «alive» в ZooKeeper в течение этого времени, то вся операция резервного копирования или восстановления считается неуспешной.
Это значение должно быть больше любого разумного времени, необходимого хосту для повторного подключения к ZooKeeper после сбоя.
Ноль означает отсутствие ограничения.

## backup_restore_finish_timeout_after_error_sec {#backup_restore_finish_timeout_after_error_sec} 

<SettingsInfoBlock type="UInt64" default_value="180" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "180"},{"label": "Новый параметр."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "180"},{"label": "Новый параметр."}]}]}/>

Время, в течение которого инициатор должен ждать, пока другие хосты отреагируют на узел «error» и прекратят работу над текущей операцией BACKUP ON CLUSTER или RESTORE ON CLUSTER.

## backup_restore_keeper_fault_injection_probability {#backup_restore_keeper_fault_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

Приблизительная вероятность сбоя запроса к Keeper во время операции резервного копирования или восстановления. Допустимые значения лежат в диапазоне [0.0f, 1.0f].

## backup_restore_keeper_fault_injection_seed {#backup_restore_keeper_fault_injection_seed} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 — случайное значение (seed), в противном случае — значение настройки

## backup_restore_keeper_max_retries {#backup_restore_keeper_max_retries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1000"},{"label": "Значение должно быть достаточно большим, чтобы операция BACKUP или RESTORE не завершилась с ошибкой из-за временного сбоя [Zoo]Keeper во время её выполнения."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1000"},{"label": "Значение должно быть достаточно большим, чтобы операция BACKUP или RESTORE не завершилась с ошибкой из-за временного сбоя [Zoo]Keeper во время её выполнения."}]}]}/>

Максимальное количество повторных попыток для операций [Zoo]Keeper, выполняемых во время операции BACKUP или RESTORE.
Значение должно быть достаточно большим, чтобы вся операция не завершилась с ошибкой из-за временного сбоя [Zoo]Keeper.

## backup_restore_keeper_max_retries_while_handling_error {#backup_restore_keeper_max_retries_while_handling_error} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "New setting."}]}]}/>

Максимальное количество повторных попыток выполнения операций [Zoo]Keeper при обработке ошибки операций BACKUP ON CLUSTER или RESTORE ON CLUSTER.

## backup_restore_keeper_max_retries_while_initializing {#backup_restore_keeper_max_retries_while_initializing} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "New setting."}]}]}/>

Максимальное число повторных попыток выполнения операций [Zoo]Keeper при инициализации операции BACKUP ON CLUSTER или RESTORE ON CLUSTER.

## backup_restore_keeper_retry_initial_backoff_ms {#backup_restore_keeper_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Начальный интервал ожидания (backoff) для операций [Zoo]Keeper во время резервного копирования или восстановления

## backup_restore_keeper_retry_max_backoff_ms {#backup_restore_keeper_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

Максимальный интервал ожидания (backoff) перед повторной попыткой операций [Zoo]Keeper во время резервного копирования или восстановления

## backup_restore_keeper_value_max_size {#backup_restore_keeper_value_max_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Максимальный размер данных узла [Zoo]Keeper во время резервного копирования

## backup_restore_s3_retry_attempts {#backup_restore_s3_retry_attempts} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Настройка для Aws::Client::RetryStrategy; Aws::Client самостоятельно выполняет повторные попытки, значение 0 отключает повторы. Применяется только для операций резервного копирования и восстановления."}]}]}/>

Настройка для Aws::Client::RetryStrategy; Aws::Client самостоятельно выполняет повторные попытки, значение 0 отключает повторы. Применяется только для операций резервного копирования и восстановления.

## backup_restore_s3_retry_initial_backoff_ms {#backup_restore_s3_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="25" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "25"},{"label": "New setting"}]}]}/>

Начальная задержка в миллисекундах перед первой повторной попыткой во время резервного копирования и восстановления. При каждой последующей попытке задержка увеличивается экспоненциально, вплоть до максимального значения, заданного параметром `backup_restore_s3_retry_max_backoff_ms`.

## backup_restore_s3_retry_jitter_factor {#backup_restore_s3_retry_jitter_factor} 

<SettingsInfoBlock type="Float" default_value="0.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0.1"},{"label": "New setting"}]}]}/>

Коэффициент джиттера, применяемый к интервалу ожидания перед повторной попыткой (backoff delay) в Aws::Client::RetryStrategy во время операций резервного копирования и восстановления. Вычисленный backoff delay умножается на случайный коэффициент в диапазоне [1.0, 1.0 + jitter], но не превышает максимальное значение `backup_restore_s3_retry_max_backoff_ms`. Должен находиться в диапазоне [0.0, 1.0].

## backup_restore_s3_retry_max_backoff_ms {#backup_restore_s3_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5000"},{"label": "New setting"}]}]}/>

Максимальная задержка в миллисекундах между повторными попытками при операциях резервного копирования и восстановления.

## backup_slow_all_threads_after_retryable_s3_error {#backup_slow_all_threads_after_retryable_s3_error} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-3","items": [{"label": "25.10"},{"label": "0"},{"label": "Disable the setting by default"}]}]}/>

Если установлено значение `true`, все потоки, выполняющие S3-запросы к одной и той же конечной точке резервного копирования, замедляются после того, как любой из S3-запросов сталкивается с ошибкой S3, для которой возможна повторная попытка (retryable), например «Slow Down».  
Если установлено значение `false`, каждый поток обрабатывает задержку (backoff) при S3-запросах независимо от остальных.

## cache_warmer_threads {#cache_warmer_threads} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="4" />

Применяется только в ClickHouse Cloud. Количество фоновых потоков для предварительной загрузки новых частей данных в файловый кэш, когда включен [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch). Ноль — чтобы отключить.

## calculate_text_stack_trace {#calculate_text_stack_trace} 

<SettingsInfoBlock type="Bool" default_value="1" />

Генерировать текстовую трассировку стека в случае исключений во время выполнения запроса. Это значение по умолчанию. Для этого требуется разрешение символов, что может замедлить фаззинговые тесты при выполнении большого количества ошибочных запросов. В нормальных случаях не следует отключать эту опцию.

## cancel_http_readonly_queries_on_client_close {#cancel_http_readonly_queries_on_client_close} 

<SettingsInfoBlock type="Bool" default_value="0" />

Отменяет HTTP-запросы на чтение (например, `SELECT`), когда клиент закрывает соединение, не дожидаясь ответа.

Значение по умолчанию в Cloud: `0`.

## cast_ipv4_ipv6_default_on_conversion_error {#cast_ipv4_ipv6_default_on_conversion_error} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.3"},{"label": "0"},{"label": "Заставляет функции cast(value, 'IPv4') и cast(value, 'IPv6') вести себя так же, как функции toIPv4 и toIPv6"}]}]}/>

Оператор CAST к типу IPv4, оператор CAST к типу IPv6, а также функции toIPv4 и toIPv6 будут возвращать значение по умолчанию вместо генерации исключения при ошибке преобразования.

## cast&#95;keep&#95;nullable {#cast_keep_nullable}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает сохранение типа данных `Nullable` при операциях [CAST](/sql-reference/functions/type-conversion-functions#CAST).

Если настройка включена и аргумент функции `CAST` имеет тип `Nullable`, результат также приводится к типу `Nullable`. Если настройка отключена, результат всегда имеет точно целевой тип.

Возможные значения:

* 0 — результат `CAST` имеет точно указанный целевой тип.
* 1 — если тип аргумента — `Nullable`, результат `CAST` приводится к `Nullable(DestinationDataType)`.

**Примеры**

Следующий запрос возвращает результат точно целевого типа данных:

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

Следующий запрос добавляет модификатор `Nullable` к целевому типу данных:

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


## cast_string_to_date_time_mode {#cast_string_to_date_time_mode} 

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "basic"},{"label": "Allow to use different DateTime parsing mode in String to DateTime cast"}]}]}/>

Позволяет выбрать парсер текстового представления даты и времени при приведении значения типа `String` к `DateTime`.

Возможные значения:

- `'best_effort'` — Включает расширенный парсинг.

    ClickHouse может разбирать базовый формат `YYYY-MM-DD HH:MM:SS` и все форматы даты и времени [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601). Например, `'2018-06-08T01:02:03.000Z'`.

- `'best_effort_us'` — Аналогичен `best_effort` (см. различия в [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parseDateTimeBestEffortUS))

- `'basic'` — Использовать базовый парсер.

    ClickHouse может разбирать только базовый формат `YYYY-MM-DD HH:MM:SS` или `YYYY-MM-DD`. Например, `2019-08-20 10:18:56` или `2019-08-20`.

См. также:

- [Тип данных DateTime.](../../sql-reference/data-types/datetime.md)
- [Функции для работы с датой и временем.](../../sql-reference/functions/date-time-functions.md)

## cast_string_to_dynamic_use_inference {#cast_string_to_dynamic_use_inference} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "Добавлена настройка, позволяющая преобразовывать String в Dynamic с помощью парсинга"}]}]}/>

Использовать вывод типов при преобразовании String в Dynamic

## cast_string_to_variant_use_inference {#cast_string_to_variant_use_inference} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Новая настройка для включения/отключения определения типов при CAST из String в Variant"}]}]}/>

Использовать определение типов при преобразовании String в Variant.

## check_query_single_value_result {#check_query_single_value_result} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Изменён параметр, чтобы сделать команду CHECK TABLE более полезной"}]}]}/>

Определяет уровень детализации результата выполнения запроса [CHECK TABLE](/sql-reference/statements/check-table) для движков семейства `MergeTree`.

Возможные значения:

- 0 — запрос показывает статус проверки для каждой отдельной части данных таблицы.
- 1 — запрос показывает общий статус проверки таблицы.

## check_referential_table_dependencies {#check_referential_table_dependencies} 

<SettingsInfoBlock type="Bool" default_value="0" />

Проверить, что DDL‑запрос (например, DROP TABLE или RENAME) не нарушит ссылочные зависимости

## check_table_dependencies {#check_table_dependencies} 

<SettingsInfoBlock type="Bool" default_value="1" />

Проверять, что DDL-запрос (например, DROP TABLE или RENAME) не приводит к нарушению зависимостей

## checksum_on_read {#checksum_on_read} 

<SettingsInfoBlock type="Bool" default_value="1" />

Проверяет контрольные суммы при чтении. По умолчанию параметр включён и всегда должен быть включён в продакшене. Не ожидайте каких-либо преимуществ от его отключения. Его можно использовать только для экспериментов и бенчмарков. Настройка применима только к таблицам семейства MergeTree. Контрольные суммы всегда проверяются для других движков таблиц и при получении данных по сети.

## cloud_mode {#cloud_mode} 

<SettingsInfoBlock type="Bool" default_value="0" />

Режим Cloud

## cloud_mode_database_engine {#cloud_mode_database_engine} 

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "Настройка для ClickHouse Cloud"}]}]}/>

Движок базы данных, допускаемый в Cloud. 1 — переписывать DDL‑запросы для использования базы данных Replicated, 2 — переписывать DDL‑запросы для использования базы данных Shared

## cloud_mode_engine {#cloud_mode_engine} 

<SettingsInfoBlock type="UInt64" default_value="1" />

Семейство движков, разрешённое в Cloud.

- 0 - разрешить всё
- 1 - переписывать DDL-запросы на использование *ReplicatedMergeTree
- 2 - переписывать DDL-запросы на использование SharedMergeTree
- 3 - переписывать DDL-запросы на использование SharedMergeTree, за исключением случаев, когда явно указан переданный remote-диск
- 4 - то же, что в 3, плюс дополнительно использовать Alias вместо Distributed

UInt64, чтобы минимизировать публичную часть

## cluster_for_parallel_replicas {#cluster_for_parallel_replicas} 

Кластер для сегмента, в котором расположен текущий сервер

## cluster_function_process_archive_on_multiple_nodes {#cluster_function_process_archive_on_multiple_nodes} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "New setting"}]}]}/>

Если имеет значение `true`, повышает производительность обработки архивов в кластерных функциях. Для обеспечения совместимости и предотвращения ошибок при обновлении до версии 25.7+ при использовании кластерных функций с архивами в более ранних версиях должно иметь значение `false`.

## cluster_table_function_buckets_batch_size {#cluster_table_function_buckets_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Определяет приблизительный размер пакета данных (в байтах), используемого при распределённой обработке задач в табличных функциях кластера с разбиением по `bucket`. Система накапливает данные, пока не будет достигнуто как минимум это значение. Фактический размер может быть немного больше для выравнивания по границам данных.

## cluster_table_function_split_granularity {#cluster_table_function_split_granularity} 

<SettingsInfoBlock type="ObjectStorageGranularityLevel" default_value="file" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "file"},{"label": "New setting."}]}]}/>

Определяет, как данные разбиваются на задания при выполнении CLUSTER TABLE FUNCTION.

Этот параметр задаёт гранулярность распределения работы по кластеру:

- `file` — каждое задание обрабатывает целый файл.
- `bucket` — задания создаются для каждого внутреннего блока данных внутри файла (например, для групп строк в Parquet).

Выбор более мелкой гранулярности (например, `bucket`) может повысить степень параллелизма при работе с небольшим числом крупных файлов.
Например, если Parquet-файл содержит несколько групп строк, использование гранулярности `bucket` позволяет обрабатывать каждую группу независимо разными воркерами.

## collect_hash_table_stats_during_aggregation {#collect_hash_table_stats_during_aggregation} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает сбор статистики хеш-таблиц для оптимизации распределения памяти

## collect_hash_table_stats_during_joins {#collect_hash_table_stats_during_joins} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "Новая настройка."}]}]}/>

Включает сбор статистики хеш-таблиц для оптимизации выделения памяти.

## compatibility {#compatibility} 

Параметр `compatibility` приводит к тому, что ClickHouse использует значения параметров по умолчанию из предыдущей версии ClickHouse, при этом предыдущая версия указывается в значении этого параметра.

Если для параметров заданы значения, отличные от значений по умолчанию, то они сохраняются (параметр `compatibility` влияет только на параметры, которые не были изменены).

Этот параметр принимает номер версии ClickHouse в виде строки, например `22.3`, `22.8`. Пустое значение означает, что параметр отключён.

По умолчанию параметр отключён.

:::note
В ClickHouse Cloud значение параметра совместимости по умолчанию на уровне сервиса должно быть установлено службой поддержки ClickHouse Cloud. Пожалуйста, [создайте обращение](https://clickhouse.cloud/support), чтобы его установить.
Однако параметр совместимости может быть переопределён на уровне пользователя, роли, профиля, запроса или сессии, используя стандартные механизмы настройки ClickHouse — например, `SET compatibility = '22.3'` в сессии или `SETTINGS compatibility = '22.3'` в запросе.
:::

## compatibility_ignore_auto_increment_in_create_table {#compatibility_ignore_auto_increment_in_create_table} 

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать ключевое слово AUTO_INCREMENT в объявлении столбца, если установлено значение true, в противном случае возвращать ошибку. Это упрощает миграцию с MySQL.

## compatibility_ignore_collation_in_create_table {#compatibility_ignore_collation_in_create_table} 

<SettingsInfoBlock type="Bool" default_value="1" />

Совместимость: игнорировать COLLATION в CREATE TABLE

## compatibility_s3_presigned_url_query_in_path {#compatibility_s3_presigned_url_query_in_path} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting."}]}]}/>

Совместимость: при включении переносит параметры запроса предварительно подписанного URL (например, X-Amz-*) в ключ S3 (устаревшее поведение),
так что «?» действует как подстановочный знак в пути. При отключении (по умолчанию) параметры запроса предварительно подписанного URL остаются в query-части URL,
чтобы избежать интерпретации «?» как подстановочного знака.

## compile_aggregate_expressions {#compile_aggregate_expressions} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает JIT-компиляцию агрегатных функций в нативный код. Включение этого параметра может повысить производительность.

Возможные значения:

- 0 — Агрегация выполняется без JIT-компиляции.
- 1 — Агрегация выполняется с использованием JIT-компиляции.

**См. также**

- [min_count_to_compile_aggregate_expression](#min_count_to_compile_aggregate_expression)

## compile_expressions {#compile_expressions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Мы считаем, что инфраструктура LLVM, лежащая в основе JIT-компилятора, достаточно стабильна, чтобы включить этот параметр в качестве значения по умолчанию."}]}]}/>

Компилирует некоторые скалярные функции и операторы в нативный код.

## compile_sort_description {#compile_sort_description} 

<SettingsInfoBlock type="Bool" default_value="1" />

Компилировать описание сортировки в нативный код.

## connect_timeout {#connect_timeout} 

<SettingsInfoBlock type="Seconds" default_value="10" />

Таймаут подключения при отсутствии реплик.

## connect_timeout_with_failover_ms {#connect_timeout_with_failover_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "Increase default connect timeout because of async connect"}]}]}/>

Таймаут в миллисекундах для подключения к удалённому серверу для движка distributed таблицы, если в определении кластера заданы секции `shard` и `replica`.
В случае неудачи выполняется несколько попыток подключения к различным репликам.

## connect_timeout_with_failover_secure_ms {#connect_timeout_with_failover_secure_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "Увеличено значение таймаута защищённого соединения по умолчанию из-за асинхронного установления соединения"}]}]}/>

Таймаут подключения при выборе первой здоровой реплики (для защищённых соединений).

## connection_pool_max_wait_ms {#connection_pool_max_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Время ожидания подключения в миллисекундах, когда пул подключений заполнен.

Возможные значения:

- Положительное целое число.
- 0 — бесконечное время ожидания.

## connections_with_failover_max_tries {#connections_with_failover_max_tries} 

<SettingsInfoBlock type="UInt64" default_value="3" />

Максимальное количество попыток подключения к каждой реплике для движка таблицы Distributed.

## convert&#95;query&#95;to&#95;cnf {#convert_query_to_cnf}

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение `true`, запрос `SELECT` будет преобразован в конъюнктивную нормальную форму (CNF). В некоторых сценариях переписывание запроса в CNF может выполняться быстрее (см. этот [Github issue](https://github.com/ClickHouse/ClickHouse/issues/11749) с объяснением).

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

Установим параметр `convert_query_to_cnf` в значение `true` и посмотрим, что изменится:

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

Обратите внимание, что предложение `WHERE` переписано в КНФ, но результирующий набор данных идентичен — булева логика не изменилась:

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

Возможные значения: true, false


## correlated_subqueries_default_join_kind {#correlated_subqueries_default_join_kind} 

<SettingsInfoBlock type="DecorrelationJoinKind" default_value="right" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "right"},{"label": "Новая настройка. Тип соединения по умолчанию для декоррелированного плана запроса."}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "right"},{"label": "Новая настройка. Тип соединения по умолчанию для декоррелированного плана запроса."}]}]}/>

Управляет типом JOIN в декоррелированном плане запроса. Значение по умолчанию — `right`, что означает, что декоррелированный план будет содержать операции RIGHT JOIN с подзапросом в правой части.

Возможные значения:

- `left` — в процессе декорреляции будут формироваться операции LEFT JOIN, а входная таблица будет находиться слева.
- `right` — в процессе декорреляции будут формироваться операции RIGHT JOIN, а входная таблица будет находиться справа.

## correlated_subqueries_substitute_equivalent_expressions {#correlated_subqueries_substitute_equivalent_expressions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "Новая настройка для оптимизации планирования коррелированных подзапросов."}]}]}/>

Используйте фильтрующие выражения для вывода эквивалентных выражений и их подстановки вместо создания CROSS JOIN.

## correlated_subqueries_use_in_memory_buffer {#correlated_subqueries_use_in_memory_buffer} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "По умолчанию использовать буфер в оперативной памяти для входных данных коррелированных подзапросов."}]}]}/>

Использовать буфер в оперативной памяти для входных данных коррелированных подзапросов, чтобы избежать их повторного вычисления.

## count_distinct_implementation {#count_distinct_implementation} 

<SettingsInfoBlock type="String" default_value="uniqExact" />

Определяет, какая из функций семейства `uniq*` должна использоваться для вычисления выражения [COUNT(DISTINCT ...)](/sql-reference/aggregate-functions/reference/count).

Возможные значения:

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)

## count_distinct_optimization {#count_distinct_optimization} 

<SettingsInfoBlock type="Bool" default_value="0" />

Переписывать выражение `count distinct` в подзапрос с использованием `GROUP BY`

## count_matches_stop_at_empty_match {#count_matches_stop_at_empty_match} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Останавливает подсчёт, как только шаблон даёт совпадение нулевой длины в функции `countMatches`.

## create_if_not_exists {#create_if_not_exists} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "New setting."}]}]}/>

Включает `IF NOT EXISTS` для оператора `CREATE` по умолчанию. Если включена эта настройка или указан `IF NOT EXISTS`, и таблица с указанным именем уже существует, исключение не будет сгенерировано.

## create_index_ignore_unique {#create_index_ignore_unique} 

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорирует ключевое слово UNIQUE в CREATE UNIQUE INDEX. Используется для тестов совместимости с SQL.

## create_replicated_merge_tree_fault_injection_probability {#create_replicated_merge_tree_fault_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

Вероятность инъекции ошибки при создании таблицы после создания метаданных в ZooKeeper

## create_table_empty_primary_key_by_default {#create_table_empty_primary_key_by_default} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Улучшение удобства использования"}]}]}/>

Разрешает создавать таблицы *MergeTree без первичного ключа, если не указаны ORDER BY и PRIMARY KEY

## cross_join_min_bytes_to_compress {#cross_join_min_bytes_to_compress} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "1073741824"},{"label": "Минимальный размер блока для сжатия в CROSS JOIN. Нулевое значение отключает этот порог. Блок сжимается, когда достигнут хотя бы один из двух порогов (по строкам или по байтам)."}]}]}/>

Минимальный размер блока для сжатия в CROSS JOIN. Нулевое значение отключает этот порог. Блок сжимается, когда достигнут хотя бы один из двух порогов (по строкам или по байтам).

## cross_join_min_rows_to_compress {#cross_join_min_rows_to_compress} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "10000000"},{"label": "Минимальное количество строк для сжатия блока в CROSS JOIN. Нулевое значение означает отключение этого порога. Блок сжимается, как только достигается один из двух порогов (по строкам или по байтам)."}]}]}/>

Минимальное количество строк для сжатия блока в CROSS JOIN. Нулевое значение означает отключение этого порога. Блок сжимается, как только достигается один из двух порогов (по строкам или по байтам).

## data_type_default_nullable {#data_type_default_nullable} 

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, будут ли типы данных без явных модификаторов [NULL или NOT NULL](/sql-reference/statements/create/table#null-or-not-null-modifiers) в определении столбца считаться [Nullable](/sql-reference/data-types/nullable).

Возможные значения:

- 1 — Типы данных в определениях столбцов по умолчанию считаются `Nullable`.
- 0 — Типы данных в определениях столбцов по умолчанию считаются не `Nullable`.

## database_atomic_wait_for_drop_and_detach_synchronously {#database_atomic_wait_for_drop_and_detach_synchronously} 

<SettingsInfoBlock type="Bool" default_value="0" />

Добавляет модификатор `SYNC` ко всем запросам `DROP` и `DETACH`.

Возможные значения:

- 0 — запросы выполняются с задержкой.
- 1 — запросы выполняются без задержки.

## database_replicated_allow_explicit_uuid {#database_replicated_allow_explicit_uuid} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Добавлена настройка, запрещающая явное указание UUID таблицы"}]}]}/>

0 — Запретить явное указание UUID для таблиц в реплицируемых базах данных. 1 — Разрешить. 2 — Разрешить, но игнорировать указанный UUID и вместо этого генерировать случайный.

## database_replicated_allow_heavy_create {#database_replicated_allow_heavy_create} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Долго выполняющиеся DDL-запросы (CREATE AS SELECT и POPULATE) для движка базы данных Replicated были запрещены"}]}]}/>

Разрешить долго выполняющиеся DDL-запросы (CREATE AS SELECT и POPULATE) в движке базы данных Replicated. Учтите, что это может надолго заблокировать очередь DDL-запросов.

## database_replicated_allow_only_replicated_engine {#database_replicated_allow_only_replicated_engine} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает создавать в базе данных с движком Replicated только таблицы Replicated

## database_replicated_allow_replicated_engine_arguments {#database_replicated_allow_replicated_engine_arguments} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "По умолчанию явное указание аргументов запрещено"}]}]}/>

0 - Не разрешать явно указывать путь ZooKeeper и имя реплики для таблиц *MergeTree в реплицируемых базах данных. 1 - Разрешать. 2 - Разрешать, но игнорировать указанный путь и вместо этого использовать путь по умолчанию. 3 - Разрешать и не выводить предупреждение в лог.

## database_replicated_always_detach_permanently {#database_replicated_always_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="0" />

Выполнять DETACH TABLE как DETACH TABLE PERMANENTLY, если в качестве движка базы данных используется Replicated

## database_replicated_enforce_synchronous_settings {#database_replicated_enforce_synchronous_settings} 

<SettingsInfoBlock type="Bool" default_value="0" />

Принудительно выполняет синхронное ожидание для некоторых запросов (см. также database_atomic_wait_for_drop_and_detach_synchronously, mutations_sync, alter_sync). Не рекомендуется включать этот параметр.

## database_replicated_initial_query_timeout_sec {#database_replicated_initial_query_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="300" />

Задает интервал (в секундах), в течение которого начальный DDL-запрос должен ожидать, пока база данных Replicated обработает предыдущие элементы очереди DDL.

Возможные значения:

- Положительное целое число.
- 0 — без ограничений.

## database_shared_drop_table_delay_seconds {#database_shared_drop_table_delay_seconds} 

<SettingsInfoBlock type="UInt64" default_value="28800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "28800"},{"label": "Новая настройка."}]}]}/>

Задержка в секундах перед фактическим удалением таблицы из базы данных типа Shared. Это позволяет восстановить таблицу в течение этого времени с помощью оператора `UNDROP TABLE`.

## decimal_check_overflow {#decimal_check_overflow} 

<SettingsInfoBlock type="Bool" default_value="1" />

Проверка переполнения при выполнении десятичных арифметических и сравнительных операций

## deduplicate_blocks_in_dependent_materialized_views {#deduplicate_blocks_in_dependent_materialized_views} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает проверку дедупликации для materialized view, которые получают данные из таблиц Replicated\*.

Возможные значения:

0 — отключено.  
1 — включено.

При включении ClickHouse выполняет дедупликацию блоков в materialized view, которые зависят от таблиц Replicated\*.
Этот параметр полезен для того, чтобы materialized view не содержали дублирующихся данных, когда операция вставки повторяется из-за сбоя.

**См. также**

- [Обработка NULL в операторах IN](/guides/developer/deduplicating-inserts-on-retries#insert-deduplication-with-materialized-views)

## default_materialized_view_sql_security {#default_materialized_view_sql_security} 

<SettingsInfoBlock type="SQLSecurityType" default_value="DEFINER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "DEFINER"},{"label": "Позволяет задать значение по умолчанию для параметра SQL SECURITY при создании materialized view"}]}]}/>

Позволяет задать значение по умолчанию для параметра SQL SECURITY при создании materialized view. [Подробнее о SQL SECURITY](../../sql-reference/statements/create/view.md/#sql_security).

Значение по умолчанию — `DEFINER`.

## default_max_bytes_in_join {#default_max_bytes_in_join} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

Максимальный размер таблицы с правой стороны, если необходимо ограничение, но `max_bytes_in_join` не установлен.

## default_normal_view_sql_security {#default_normal_view_sql_security} 

<SettingsInfoBlock type="SQLSecurityType" default_value="INVOKER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "INVOKER"},{"label": "Allows to set default `SQL SECURITY` option while creating a normal view"}]}]}/>

Позволяет задать значение по умолчанию для опции `SQL SECURITY` при создании обычного представления. [Подробнее о SQL security](../../sql-reference/statements/create/view.md/#sql_security).

Значение по умолчанию — `INVOKER`.

## default&#95;table&#95;engine {#default_table_engine}

<SettingsInfoBlock type="DefaultTableEngine" default_value="MergeTree" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "MergeTree"},{"label": "Движок таблиц по умолчанию установлен на MergeTree для повышения удобства использования"}]}]} />

Движок таблицы по умолчанию, используемый, когда `ENGINE` не задан в операторе `CREATE`.

Возможные значения:

* строка с любым допустимым именем движка таблицы

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

В этом примере любая новая таблица, для которой не указан `Engine`, будет использовать движок таблицы `Log`:

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


## default&#95;temporary&#95;table&#95;engine {#default_temporary_table_engine}

<SettingsInfoBlock type="DefaultTableEngine" default_value="Memory" />

То же, что и [default&#95;table&#95;engine](#default_table_engine), но для временных таблиц.

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


## default_view_definer {#default_view_definer} 

<SettingsInfoBlock type="String" default_value="CURRENT_USER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "CURRENT_USER"},{"label": "Позволяет задать значение `DEFINER` по умолчанию при создании представления"}]}]}/>

Позволяет задать значение `DEFINER` по умолчанию при создании представления. [Подробнее о безопасности SQL](../../sql-reference/statements/create/view.md/#sql_security).

Значение по умолчанию — `CURRENT_USER`.

## delta_lake_enable_engine_predicate {#delta_lake_enable_engine_predicate} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

Включает внутреннее отсечение данных в delta-kernel.

## delta_lake_enable_expression_visitor_logging {#delta_lake_enable_expression_visitor_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает логирование уровня Test для посетителя выражений DeltaLake. Такие логи могут быть чрезмерно подробными даже для тестового логирования.

## delta_lake_insert_max_bytes_in_data_file {#delta_lake_insert_max_bytes_in_data_file} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "New setting."}]}]}/>

Определяет предельный размер в байтах для одного файла данных, вставляемого в Delta Lake.

## delta_lake_insert_max_rows_in_data_file {#delta_lake_insert_max_rows_in_data_file} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "Новая настройка."}]}]}/>

Задаёт максимальное число строк в одном вставляемом файле данных Delta Lake.

## delta_lake_log_metadata {#delta_lake_log_metadata} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Включает логирование файлов метаданных Delta Lake в системную таблицу.

## delta_lake_snapshot_end_version {#delta_lake_snapshot_end_version} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "-1"},{"label": "Новый SETTING."}]}]}/>

Конечная версия snapshot’а Delta Lake для чтения. Значение -1 означает чтение последней версии (значение 0 — допустимая версия snapshot’а).

## delta_lake_snapshot_start_version {#delta_lake_snapshot_start_version} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "-1"},{"label": "Новая настройка."}]}]}/>

Начальная версия снимка Delta Lake для чтения. Значение -1 означает чтение последней версии (значение 0 является допустимой версией снимка).

## delta_lake_snapshot_version {#delta_lake_snapshot_version} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "-1"},{"label": "Новая настройка"}]}]}/>

Версия снимка Delta Lake для чтения. Значение -1 означает, что будет прочитана последняя версия (значение 0 является допустимой версией снимка).

## delta_lake_throw_on_engine_predicate_error {#delta_lake_throw_on_engine_predicate_error} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Включает выброс исключения при ошибке анализа предиката сканирования в delta-kernel.

## describe_compact_output {#describe_compact_output} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если включено, в результат запроса DESCRIBE включаются только имена столбцов и их типы.

## describe_include_subcolumns {#describe_include_subcolumns} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает вывод описаний подстолбцов для запроса [DESCRIBE](../../sql-reference/statements/describe-table.md). Например, элементов типа [Tuple](../../sql-reference/data-types/tuple.md) или подстолбцов типов данных [Map](/sql-reference/data-types/map#reading-subcolumns-of-map), [Nullable](../../sql-reference/data-types/nullable.md/#finding-null) или [Array](../../sql-reference/data-types/array.md/#array-size).

Возможные значения:

- 0 — Подстолбцы не включаются в запросы `DESCRIBE`.
- 1 — Подстолбцы включаются в запросы `DESCRIBE`.

**Пример**

См. пример использования команды [DESCRIBE](../../sql-reference/statements/describe-table.md).

## describe_include_virtual_columns {#describe_include_virtual_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение параметра равно true, виртуальные столбцы таблицы будут включены в результат запроса DESCRIBE

## dialect {#dialect} 

<SettingsInfoBlock type="Dialect" default_value="clickhouse" />

Какой диалект будет использоваться для парсинга запроса

## dictionary_validate_primary_key_type {#dictionary_validate_primary_key_type} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Проверять тип первичного ключа для словарей. По умолчанию тип id для простых макетов словаря неявно приводится к UInt64."}]}]}/>

Проверять тип первичного ключа для словарей. По умолчанию тип id для простых макетов словаря неявно приводится к UInt64.

## distinct_overflow_mode {#distinct_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что происходит, когда объём данных превышает одно из ограничений.

Возможные значения:

- `throw`: сгенерировать исключение (значение по умолчанию).
- `break`: остановить выполнение запроса и вернуть частичный результат так, как если бы исходные данные закончились.

## distributed_aggregation_memory_efficient {#distributed_aggregation_memory_efficient} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает режим экономии памяти при распределённой агрегации.

## distributed_background_insert_batch {#distributed_background_insert_batch} 

**Псевдонимы**: `distributed_directory_monitor_batch_inserts`

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает отправку вставляемых данных пакетами.

Когда пакетная отправка включена, движок таблицы [Distributed](../../engines/table-engines/special/distributed.md) пытается отправлять несколько файлов с вставленными данными за одну операцию вместо отправки каждого файла отдельно. Пакетная отправка повышает производительность кластера за счет более эффективного использования ресурсов сервера и сети.

Возможные значения:

- 1 — Включено.
- 0 — Отключено.

## distributed_background_insert_max_sleep_time_ms {#distributed_background_insert_max_sleep_time_ms} 

**Псевдонимы**: `distributed_directory_monitor_max_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

Максимальный интервал между отправками данных движком таблицы [Distributed](../../engines/table-engines/special/distributed.md). Ограничивает экспоненциальный рост значения интервала, задаваемого параметром [distributed_background_insert_sleep_time_ms](#distributed_background_insert_sleep_time_ms).

Возможные значения:

- Положительное целое число миллисекунд.

## distributed_background_insert_sleep_time_ms {#distributed_background_insert_sleep_time_ms} 

**Псевдонимы**: `distributed_directory_monitor_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="100" />

Базовый интервал отправки данных для табличного движка [Distributed](../../engines/table-engines/special/distributed.md). Фактический интервал экспоненциально увеличивается при возникновении ошибок.

Возможные значения:

- Положительное целое число миллисекунд.

## distributed_background_insert_split_batch_on_failure {#distributed_background_insert_split_batch_on_failure} 

**Псевдонимы**: `distributed_directory_monitor_split_batch_on_failure`

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает разбиение пакетов при сбоях.

Иногда отправка конкретного пакета на удалённый сегмент может завершиться сбоем из-за сложного конвейера обработки (например, `MATERIALIZED VIEW` с `GROUP BY`) по причине `Memory limit exceeded` или аналогичных ошибок. В таком случае повторная попытка не поможет (и это «застопорит» фоновые распределённые вставки для таблицы), но отправка файлов из этого пакета по одному может завершиться успешной операцией INSERT.

Поэтому установка этой настройки в `1` отключит пакетную отправку для таких пакетов (т. е. временно отключит `distributed_background_insert_batch` для неудачных пакетов).

Возможные значения:

- 1 — Включено.
- 0 — Отключено.

:::note
Эта настройка также влияет на повреждённые пакеты (которые могут появиться из-за аварийного завершения работы сервера (машины) и отсутствия `fsync_after_insert`/`fsync_directories` для движка таблицы [Distributed](../../engines/table-engines/special/distributed.md)).
:::

:::note
Не стоит полагаться на автоматическое разбиение пакетов, так как это может негативно сказаться на производительности.
:::

## distributed_background_insert_timeout {#distributed_background_insert_timeout} 

**Псевдонимы**: `insert_distributed_timeout`

<SettingsInfoBlock type="UInt64" default_value="0" />

Тайм-аут для запроса INSERT в распределённую таблицу. Настройка используется только при включённом `insert_distributed_sync`. Нулевое значение означает отсутствие тайм-аута.

## distributed_cache_alignment {#distributed_cache_alignment} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "Переименование distributed_cache_read_alignment"}]}]}/>

Оказывает влияние только в ClickHouse Cloud. Эта настройка предназначена для тестирования, не изменяйте её.

## distributed_cache_bypass_connection_pool {#distributed_cache_bypass_connection_pool} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Позволяет обходить пул подключений распределённого кэша.

## distributed_cache_connect_backoff_max_ms {#distributed_cache_connect_backoff_max_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "50"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Максимальное значение экспоненциальной задержки (в миллисекундах) при создании подключения к распределённому кэшу.

## distributed_cache_connect_backoff_min_ms {#distributed_cache_connect_backoff_min_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Минимальное время экспоненциальной задержки (в миллисекундах) при установлении соединения с распределённым кэшем.

## distributed_cache_connect_max_tries {#distributed_cache_connect_max_tries} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5"},{"label": "Изменено значение настройки"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "20"},{"label": "Только Cloud"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "20"},{"label": "Настройка для ClickHouse Cloud"}]}]}/>

Применяется только в ClickHouse Cloud. Количество повторных попыток подключения к распределённому кэшу при неудаче.

## distributed_cache_connect_timeout_ms {#distributed_cache_connect_timeout_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "50"},{"label": "Новая настройка"}]}]}/>

Действует только в ClickHouse Cloud. Таймаут при подключении к серверу распределённого кэша.

## distributed_cache_credentials_refresh_period_seconds {#distributed_cache_credentials_refresh_period_seconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "5"},{"label": "New private setting"}]}]}/>

Действует только в ClickHouse Cloud. Период обновления учетных данных.

## distributed_cache_data_packet_ack_window {#distributed_cache_data_packet_ack_window} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "5"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Размер окна отправки ACK для последовательности DataPacket в пределах одного запроса на чтение распределённого кэша.

## distributed_cache_discard_connection_if_unread_data {#distributed_cache_discard_connection_if_unread_data} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "Новая настройка"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Действует только в ClickHouse Cloud. Разрывать соединение, если остаются непрочитанные данные.

## distributed_cache_fetch_metrics_only_from_current_az {#distributed_cache_fetch_metrics_only_from_current_az} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Получать метрики только из текущей зоны доступности в system.distributed_cache_metrics и system.distributed_cache_events.

## distributed_cache_file_cache_name {#distributed_cache_file_cache_name} 

<CloudOnlyBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": ""},{"label": "Новая настройка."}]}]}/>

Действует только в ClickHouse Cloud. Настройка, используемая только в CI-тестах — имя файлового кэша, используемого в распределённом кэше.

## distributed_cache_log_mode {#distributed_cache_log_mode} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCacheLogMode" default_value="on_error" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "on_error"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Режим записи в system.distributed_cache_log.

## distributed_cache_max_unacked_inflight_packets {#distributed_cache_max_unacked_inflight_packets} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Максимальное число неподтверждённых пакетов «в полёте» в одном запросе чтения распределённого кэша.

## distributed_cache_min_bytes_for_seek {#distributed_cache_min_bytes_for_seek} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая приватная настройка."}]}]}/>

Работает только в ClickHouse Cloud. Минимальный объём данных (в байтах) для выполнения операции seek в распределённом кэше.

## distributed_cache_pool_behaviour_on_limit {#distributed_cache_pool_behaviour_on_limit} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCachePoolBehaviourOnLimit" default_value="wait" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "wait"},{"label": "Cloud only"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "allocate_bypassing_pool"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Определяет поведение соединения с распределённым кэшем при достижении лимита пула.

## distributed_cache_prefer_bigger_buffer_size {#distributed_cache_prefer_bigger_buffer_size} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Действует только в ClickHouse Cloud. Аналогична filesystem_cache_prefer_bigger_buffer_size, но применяется к распределённому кэшу.

## distributed_cache_read_only_from_current_az {#distributed_cache_read_only_from_current_az} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Новый параметр"}]}]}/>

Действует только в ClickHouse Cloud. Разрешает чтение только из текущей зоны доступности. Если отключён, чтение выполняется со всех серверов кэша во всех зонах доступности.

## distributed_cache_read_request_max_tries {#distributed_cache_read_request_max_tries} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "Changed setting value"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "20"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Количество попыток повторного выполнения запроса к распределённому кэшу в случае неудачи.

## distributed_cache_receive_response_wait_milliseconds {#distributed_cache_receive_response_wait_milliseconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "60000"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

Применяется только в ClickHouse Cloud. Время ожидания в миллисекундах получения данных по запросу из распределённого кэша.

## distributed_cache_receive_timeout_milliseconds {#distributed_cache_receive_timeout_milliseconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10000"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Применяется только в ClickHouse Cloud. Время ожидания в миллисекундах для получения любого ответа от распределённого кэша.

## distributed_cache_receive_timeout_ms {#distributed_cache_receive_timeout_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "Новая настройка"}]}]}/>

Действует только в ClickHouse Cloud. Тайм-аут ожидания получения данных от сервера распределённого кэша в миллисекундах. Если за этот интервал не было получено ни одного байта, будет сгенерировано исключение.

## distributed_cache_send_timeout_ms {#distributed_cache_send_timeout_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Таймаут отправки данных на сервер распределённого кэша, в миллисекундах. Если клиенту нужно отправить данные, но он не может передать ни одного байта в течение этого интервала, выбрасывается исключение.

## distributed_cache_tcp_keep_alive_timeout_ms {#distributed_cache_tcp_keep_alive_timeout_ms} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="2900" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "2900"},{"label": "Новая настройка"}]}]}/>

Применяется только в ClickHouse Cloud. Время простоя соединения с сервером распределённого кэша в миллисекундах, по истечении которого TCP начинает отправлять keepalive-пакеты.

## distributed_cache_throw_on_error {#distributed_cache_throw_on_error} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Повторно выбрасывает исключение, возникшее во время взаимодействия с распределённым кэшем, или исключение, полученное от распределённого кэша. В противном случае при ошибке происходит отказ от использования распределённого кэша.

## distributed_cache_use_clients_cache_for_read {#distributed_cache_use_clients_cache_for_read} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

Применяется только в ClickHouse Cloud. При обработке запросов на чтение использует кэш клиентов.

## distributed_cache_use_clients_cache_for_write {#distributed_cache_use_clients_cache_for_write} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Использовать кэш клиентских соединений для запросов на запись.

## distributed_cache_wait_connection_from_pool_milliseconds {#distributed_cache_wait_connection_from_pool_milliseconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "100"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Работает только в ClickHouse Cloud. Время ожидания в миллисекундах для получения соединения из пула подключений, если distributed_cache_pool_behaviour_on_limit установлен в значение wait.

## distributed_connections_pool_size {#distributed_connections_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

Максимальное количество одновременных подключений к удалённым серверам для распределённой обработки всех запросов к одной distributed таблице. Рекомендуется устанавливать значение не меньше числа серверов в кластере.

## distributed_ddl_entry_format_version {#distributed_ddl_entry_format_version} 

<SettingsInfoBlock type="UInt64" default_value="5" />

Версия совместимости для распределённых DDL‑запросов (ON CLUSTER)

## distributed_ddl_output_mode {#distributed_ddl_output_mode} 

<SettingsInfoBlock type="DistributedDDLOutputMode" default_value="throw" />

Устанавливает формат результата распределённого DDL-запроса.

Возможные значения:

- `throw` — Возвращает результирующий набор со статусом выполнения запроса для всех хостов, на которых запрос был завершён. Если запрос завершился с ошибкой на некоторых хостах, повторно выбрасывает первое исключение. Если запрос ещё не завершён на некоторых хостах и значение [distributed_ddl_task_timeout](#distributed_ddl_task_timeout) превышено, выбрасывает исключение `TIMEOUT_EXCEEDED`.
- `none` — Аналогично `throw`, но распределённый DDL-запрос не возвращает результирующий набор.
- `null_status_on_timeout` — Возвращает `NULL` в качестве статуса выполнения в некоторых строках результирующего набора вместо того, чтобы выбрасывать `TIMEOUT_EXCEEDED`, если запрос не завершён на соответствующих хостах.
- `never_throw` — Не выбрасывает `TIMEOUT_EXCEEDED` и не пробрасывает исключения повторно, если запрос завершился с ошибкой на некоторых хостах.
- `none_only_active` — Аналогично `none`, но не ждёт неактивные реплики базы данных `Replicated`. Примечание: в этом режиме невозможно определить, что запрос не был выполнен на некоторой реплике и будет выполнен в фоновом режиме.
- `null_status_on_timeout_only_active` — Аналогично `null_status_on_timeout`, но не ждёт неактивные реплики базы данных `Replicated`.
- `throw_only_active` — Аналогично `throw`, но не ждёт неактивные реплики базы данных `Replicated`.

Значение по умолчанию в Cloud: `throw`.

## distributed_ddl_task_timeout {#distributed_ddl_task_timeout} 

<SettingsInfoBlock type="Int64" default_value="180" />

Устанавливает таймаут для ответов на DDL-запросы от всех хостов в кластере. Если DDL-запрос не был выполнен на всех хостах, ответ будет содержать ошибку по таймауту, и запрос будет выполнен в асинхронном режиме. Отрицательное значение означает бесконечный таймаут.

Возможные значения:

- Положительное целое число.
- 0 — асинхронный режим.
- Отрицательное целое число — бесконечный таймаут.

## distributed_foreground_insert {#distributed_foreground_insert} 

**Псевдонимы**: `insert_distributed_sync`

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или выключает синхронную вставку данных в таблицу [Distributed](/engines/table-engines/special/distributed).

По умолчанию при вставке данных в таблицу `Distributed` сервер ClickHouse отправляет данные на узлы кластера в фоновом режиме. При `distributed_foreground_insert=1` данные обрабатываются синхронно, и операция `INSERT` считается успешно выполненной только после того, как все данные будут сохранены на всех сегментах (как минимум одна реплика для каждого сегмента, если `internal_replication` равен true).

Возможные значения:

- `0` — данные вставляются в фоновом режиме.
- `1` — данные вставляются в синхронном режиме.

Значение по умолчанию в Cloud: `0`.

**См. также**

- [Движок таблицы Distributed](/engines/table-engines/special/distributed)
- [Управление distributed таблицами](/sql-reference/statements/system#managing-distributed-tables)

## distributed&#95;group&#95;by&#95;no&#95;merge {#distributed_group_by_no_merge}

<SettingsInfoBlock type="UInt64" default_value="0" />

Не объединять состояния агрегации с разных серверов при обработке распределённого запроса. Можно использовать, если точно известно, что на разных сегментах находятся разные ключи.

Возможные значения:

* `0` — отключено (финальная обработка запроса выполняется на инициирующем узле).
* `1` — не объединять состояния агрегации с разных серверов при обработке распределённого запроса (запрос полностью обрабатывается на сегменте, инициатор только проксирует данные). Можно использовать, если точно известно, что на разных сегментах находятся разные ключи.
* `2` — то же, что и `1`, но `ORDER BY` и `LIMIT` (что невозможно, когда запрос полностью обрабатывается на удалённом узле, как при `distributed_group_by_no_merge=1`) применяются на инициаторе (может использоваться для запросов с `ORDER BY` и/или `LIMIT`).

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


## distributed_insert_skip_read_only_replicas {#distributed_insert_skip_read_only_replicas} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Если значение true, INSERT в Distributed будет пропускать реплики только для чтения"}]}]}/>

Включает пропуск реплик только для чтения для запросов INSERT в Distributed.

Возможные значения:

- 0 — INSERT выполняется как обычно, и если данные попадут на реплику только для чтения, запрос завершится с ошибкой
- 1 — инициатор будет пропускать реплики только для чтения перед отправкой данных на сегменты.

## distributed_plan_default_reader_bucket_count {#distributed_plan_default_reader_bucket_count} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "New experimental setting."}]}]}/>

Количество задач по умолчанию при параллельном чтении в распределённом запросе. Задачи распределяются между репликами.

## distributed_plan_default_shuffle_join_bucket_count {#distributed_plan_default_shuffle_join_bucket_count} 

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "Новая экспериментальная настройка."}]}]}/>

Количество бакетов по умолчанию для распределённого shuffle-hash join.

## distributed_plan_execute_locally {#distributed_plan_execute_locally} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Новый экспериментальный параметр."}]}]}/>

Выполнять локально все задачи распределённого плана запроса. Полезно для тестирования и отладки.

## distributed_plan_force_exchange_kind {#distributed_plan_force_exchange_kind} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "Новое экспериментальное SETTING."}]}]}/>

Принудительно использует указанный тип операторов Exchange между стадиями распределённого запроса.

Возможные значения:

- '' — не задавать принудительно тип операторов Exchange, предоставить выбор оптимизатору,
 - 'Persisted' — использовать временные файлы в объектном хранилище,
 - 'Streaming' — передавать данные обмена по сети в потоковом режиме.

## distributed_plan_force_shuffle_aggregation {#distributed_plan_force_shuffle_aggregation} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "Новая экспериментальная настройка"}]}]}/>

Использовать стратегию агрегации Shuffle вместо PartialAggregation + Merge в распределённом плане выполнения запроса.

## distributed_plan_max_rows_to_broadcast {#distributed_plan_max_rows_to_broadcast} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="20000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "20000"},{"label": "Новая экспериментальная настройка."}]}]}/>

Максимальное количество строк, при котором в распределённом плане запроса используется broadcast join вместо shuffle join.

## distributed_plan_optimize_exchanges {#distributed_plan_optimize_exchanges} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Новый экспериментальный параметр."}]}]}/>

Удаляет лишние операции обмена данными в распределённом плане запроса. Отключите для отладки.

## distributed_product_mode {#distributed_product_mode} 

<SettingsInfoBlock type="DistributedProductMode" default_value="deny" />

Изменяет поведение [распределённых подзапросов](../../sql-reference/operators/in.md).

ClickHouse применяет этот параметр, когда запрос содержит декартово произведение распределённых таблиц, то есть когда запрос к распределённой таблице содержит не-GLOBAL подзапрос к распределённой таблице.

Ограничения:

- Применяется только для подзапросов IN и JOIN.
- Только если в секции FROM используется распределённая таблица, содержащая более одного шарда.
- Если сам подзапрос касается распределённой таблицы, содержащей более одного шарда.
- Не используется для табличной функции [remote](../../sql-reference/table-functions/remote.md).

Возможные значения:

- `deny` — значение по умолчанию. Запрещает использование таких типов подзапросов (возвращается исключение «Double-distributed in/JOIN subqueries is denied»).
- `local` — заменяет базу данных и таблицу в подзапросе на локальные для целевого сервера (шарда), оставляя обычные `IN`/`JOIN`.
- `global` — заменяет запрос `IN`/`JOIN` на `GLOBAL IN`/`GLOBAL JOIN`.
- `allow` — разрешает использование таких типов подзапросов.

## distributed_push_down_limit {#distributed_push_down_limit} 

<SettingsInfoBlock type="UInt64" default_value="1" />

Включает или отключает применение [LIMIT](#limit) отдельно на каждом сегменте.

Это позволяет избежать:

- Отправки лишних строк по сети;
- Обработки строк сверх лимита на инициирующем сервере.

Начиная с версии 21.9 вы больше не можете получить неточные результаты, поскольку `distributed_push_down_limit` изменяет выполнение запроса только если выполняется хотя бы одно из следующих условий:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge) > 0.
- В запросе **нет** `GROUP BY`/`DISTINCT`/`LIMIT BY`, но есть `ORDER BY`/`LIMIT`.
- В запросе **есть** `GROUP BY`/`DISTINCT`/`LIMIT BY` с `ORDER BY`/`LIMIT`, и при этом:
    - [optimize_skip_unused_shards](#optimize_skip_unused_shards) включён.
    - [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key) включён.

Возможные значения:

- 0 — Отключён.
- 1 — Включён.

См. также:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)
- [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key)

## distributed_replica_error_cap {#distributed_replica_error_cap} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

- Тип: беззнаковое целое число (unsigned int)
- Значение по умолчанию: 1000

Счётчик ошибок каждой реплики ограничивается этим значением, что предотвращает накопление слишком большого числа ошибок одной репликой.

См. также:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_error_half_life {#distributed_replica_error_half_life} 

<SettingsInfoBlock type="Seconds" default_value="60" />

- Тип: секунды
- Значение по умолчанию: 60 секунд

Определяет, как быстро ошибки в distributed таблицах обнуляются. Если реплика была недоступна некоторое время, накопила 5 ошибок, а distributed_replica_error_half_life установлен на 1 секунду, то реплика считается нормальной через 3 секунды после последней ошибки.

См. также:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_max_ignored_errors {#distributed_replica_max_ignored_errors} 

<SettingsInfoBlock type="UInt64" default_value="0" />

- Тип: unsigned int
- Значение по умолчанию: 0

Количество ошибок, которые будут игнорироваться при выборе реплик (в соответствии с алгоритмом `load_balancing`).

См. также:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)

## do_not_merge_across_partitions_select_final {#do_not_merge_across_partitions_select_final} 

<SettingsInfoBlock type="Bool" default_value="0" />

Объединять части только в пределах одной партиции при выполнении SELECT FINAL

## empty_result_for_aggregation_by_constant_keys_on_empty_set {#empty_result_for_aggregation_by_constant_keys_on_empty_set} 

<SettingsInfoBlock type="Bool" default_value="1" />

Возвращать пустой результат при агрегации по константным ключам над пустым набором данных.

## empty_result_for_aggregation_by_empty_set {#empty_result_for_aggregation_by_empty_set} 

<SettingsInfoBlock type="Bool" default_value="0" />

Возвращать пустой результат при агрегации без ключей над пустым набором.

## enable_adaptive_memory_spill_scheduler {#enable_adaptive_memory_spill_scheduler} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Новый SETTING. Включает адаптивный сброс данных из памяти во внешнее хранилище."}]}]}/>

Инициирует работу процессора для адаптивного сброса данных из памяти во внешнее хранилище. В настоящее время поддерживается `grace join`.

## enable_add_distinct_to_in_subqueries {#enable_add_distinct_to_in_subqueries} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка для уменьшения размера временных таблиц, передаваемых для распределённых подзапросов IN."}]}]}/>

Включает `DISTINCT` в подзапросах `IN`. Это компромиссная настройка: её включение может значительно уменьшить размер временных таблиц, передаваемых для распределённых подзапросов `IN`, и существенно ускорить передачу данных между сегментами, обеспечивая отправку только уникальных значений.
Однако включение этой настройки добавляет дополнительные затраты на слияние на каждом узле, так как необходимо выполнять дедупликацию (`DISTINCT`). Используйте эту настройку, когда узким местом является передача по сети и дополнительные затраты на слияние приемлемы.

## enable_blob_storage_log {#enable_blob_storage_log} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Записывать информацию об операциях с blob-хранилищем в таблицу system.blob_storage_log"}]}]}/>

Записывать информацию об операциях с blob-хранилищем в таблицу system.blob_storage_log

## enable_early_constant_folding {#enable_early_constant_folding} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию запросов: анализируются результаты функций и подзапросов, и запрос переписывается, если в них есть константы

## enable_extended_results_for_datetime_functions {#enable_extended_results_for_datetime_functions} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает возврат результатов типа `Date32` с расширенным диапазоном значений (по сравнению с типом `Date`)
или `DateTime64` с расширенным диапазоном значений (по сравнению с типом `DateTime`).

Возможные значения:

- `0` — функции возвращают `Date` или `DateTime` для всех типов аргументов.
- `1` — функции возвращают `Date32` или `DateTime64` для аргументов типа `Date32` или `DateTime64` и `Date` или `DateTime` в остальных случаях.

В таблице ниже показано поведение этой настройки для различных функций работы с датой и временем.

| Функция                   | `enable_extended_results_for_datetime_functions = 0`                                                                         | `enable_extended_results_for_datetime_functions = 1`                                                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toStartOfYear`           | Возвращает `Date` или `DateTime`                                                                                             | Возвращает `Date`/`DateTime` для входного значения типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для входного значения типа `Date32`/`DateTime64`     |
| `toStartOfISOYear`        | Возвращает `Date` или `DateTime`                                                                                             | Возвращает `Date`/`DateTime` для аргумента типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для аргумента типа `Date32`/`DateTime64`                     |
| `toStartOfQuarter`        | Возвращает значение типа `Date` или `DateTime`                                                                               | Возвращает `Date`/`DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для аргументов типа `Date32`/`DateTime64`                   |
| `toStartOfMonth`          | Возвращает `Date` или `DateTime`                                                                                             | Возвращает `Date`/`DateTime` для входных данных типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для входных данных типа `Date32`/`DateTime64`           |
| `toStartOfWeek`           | Возвращает `Date` или `DateTime`                                                                                             | Возвращает `Date`/`DateTime` для входного параметра типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для входного параметра типа `Date32`/`DateTime64`   |
| `toLastDayOfWeek`         | Возвращает значение типа `Date` или `DateTime`                                                                               | Возвращает `Date`/`DateTime` для входных значений `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для входных значений `Date32`/`DateTime64`                 |
| `toLastDayOfMonth`        | Возвращает значение типа `Date` или `DateTime`                                                                               | Возвращает `Date`/`DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для аргументов типа `Date32`/`DateTime64`                   |
| `toMonday`                | Возвращает `Date` или `DateTime`                                                                                             | Возвращает `Date`/`DateTime` для входных аргументов типов `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для входных аргументов типов `Date32`/`DateTime64` |
| `toStartOfDay`            | Возвращает `DateTime`<br />*Примечание: для значений вне диапазона 1970–2149 могут возвращаться некорректные результаты*     | Возвращает `DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `DateTime64` для аргументов типа `Date32`/`DateTime64`                                   |
| `toStartOfHour`           | Возвращает `DateTime`<br />*Примечание: для значений вне диапазона 1970–2149 возвращаются неверные результаты*               | Возвращает `DateTime` для аргументов `Date`/`DateTime`<br />Возвращает `DateTime64` для аргументов `Date32`/`DateTime64`                                             |
| `toStartOfFifteenMinutes` | Возвращает `DateTime`<br />*Примечание: может возвращать некорректные результаты для значений вне диапазона 1970–2149 годов* | Возвращает `DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `DateTime64` для аргументов типа `Date32`/`DateTime64`                                   |
| `toStartOfTenMinutes`     | Возвращает `DateTime`<br />*Примечание: возможны некорректные результаты для значений вне диапазона 1970–2149*               | Возвращает `DateTime` для значений типов `Date`/`DateTime`<br />Возвращает `DateTime64` для значений типов `Date32`/`DateTime64`                                     |
| `toStartOfFiveMinutes`    | Возвращает `DateTime`<br />*Примечание: может возвращать некорректные результаты для значений вне диапазона 1970–2149*       | Возвращает `DateTime` для аргумента типа `Date`/`DateTime`<br />Возвращает `DateTime64` для аргумента типа `Date32`/`DateTime64`                                     |
| `toStartOfMinute`         | Возвращает `DateTime`<br />*Примечание: некорректные результаты для значений вне диапазона 1970–2149 годов*                  | Возвращает `DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `DateTime64` для аргументов типа `Date32`/`DateTime64`                                   |
| `timeSlot`                | Возвращает `DateTime`<br />*Примечание: может возвращать некорректные результаты для значений вне диапазона 1970–2149 годов* | Возвращает `DateTime` для входных аргументов `Date`/`DateTime`<br />Возвращает `DateTime64` для входных аргументов `Date32`/`DateTime64`                             |

## enable_filesystem_cache {#enable_filesystem_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш для удалённой файловой системы. Этот параметр не включает и не отключает кэш для дисков (это необходимо делать через конфигурацию дисков), но позволяет при необходимости обходить кэш для отдельных запросов.

## enable_filesystem_cache_log {#enable_filesystem_cache_log} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает ведение журнала кэширования файловой системы для каждого запроса

## enable_filesystem_cache_on_write_operations {#enable_filesystem_cache_on_write_operations} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает кэш `write-through`. Если установлено значение `false`, кэш `write-through` отключается для операций записи. Если установлено значение `true`, кэш `write-through` включён до тех пор, пока параметр `cache_on_write_operations` включён в разделе конфигурации дискового кэша в конфигурации сервера.
Дополнительные сведения см. в разделе ["Использование локального кэша"](/operations/storing-data#using-local-cache).

## enable_filesystem_read_prefetches_log {#enable_filesystem_read_prefetches_log} 

<SettingsInfoBlock type="Bool" default_value="0" />

Записывать в журнал system.filesystem prefetch_log во время выполнения запроса. Использовать только для тестирования или отладки, не рекомендуется включать по умолчанию.

## enable_full_text_index {#enable_full_text_index} 

<BetaBadge/>

**Псевдонимы**: `allow_experimental_full_text_index`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Текстовый индекс был переведён в статус Beta."}]}]}/>

Если значение параметра равно true, разрешается использование текстового индекса.

## enable_global_with_statement {#enable_global_with_statement} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.2"},{"label": "1"},{"label": "По умолчанию распространять выражения WITH на запросы UNION и все подзапросы"}]}]}/>

По умолчанию распространять выражения WITH на запросы UNION и все подзапросы

## enable_hdfs_pread {#enable_hdfs_pread} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting."}]}]}/>

Включает или отключает режим `pread` для файлов HDFS. По умолчанию используется `hdfsPread`. Если параметр отключён, для чтения файлов HDFS будут использоваться `hdfsRead` и `hdfsSeek`.

## enable_http_compression {#enable_http_compression} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "В общем случае полезно"}]}]}/>

Включает или отключает сжатие данных в ответе на HTTP-запрос.

Для получения дополнительной информации см. [описание HTTP-интерфейса](/interfaces/http).

Возможные значения:

- 0 — отключено.
- 1 — включено.

## enable_job_stack_trace {#enable_job_stack_trace} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Настройка отключена по умолчанию, чтобы избежать накладных расходов на производительность."}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "0"},{"label": "Включает сбор стек-трейсов при планировании заданий. По умолчанию отключена, чтобы избежать накладных расходов на производительность."}]}]}/>

Выводит стек-трейс создателя задания, когда задание приводит к исключению. По умолчанию отключена, чтобы избежать накладных расходов на производительность.

## enable_join_runtime_filters {#enable_join_runtime_filters} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Фильтрует левую часть JOIN по набору ключей, собранных с правой части во время выполнения запроса.

## enable_lazy_columns_replication {#enable_lazy_columns_replication} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Включена ленивая репликация столбцов в JOIN и ARRAY JOIN по умолчанию"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Добавлена настройка для включения ленивой репликации столбцов в JOIN и ARRAY JOIN"}]}]}/>

Включает ленивую репликацию столбцов в JOIN и ARRAY JOIN, что позволяет избежать избыточного многократного копирования одинаковых строк в памяти.

## enable_lightweight_delete {#enable_lightweight_delete} 

**Псевдонимы**: `allow_experimental_lightweight_delete`

<SettingsInfoBlock type="Bool" default_value="1" />

Включает легковесные мутации DELETE для таблиц MergeTree.

## enable_lightweight_update {#enable_lightweight_update} 

<BetaBadge/>

**Синонимы**: `allow_experimental_lightweight_update`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Легковесные обновления переведены в статус Beta. Добавлен синоним для настройки \"allow_experimental_lightweight_update\"."}]}]}/>

Разрешает использовать легковесные обновления.

## enable_memory_bound_merging_of_aggregation_results {#enable_memory_bound_merging_of_aggregation_results} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включить стратегию слияния результатов агрегации с учётом ограничений по памяти.

## enable_multiple_prewhere_read_steps {#enable_multiple_prewhere_read_steps} 

<SettingsInfoBlock type="Bool" default_value="1" />

Переносит больше условий из WHERE в PREWHERE и выполняет чтение с диска и фильтрацию в несколько шагов, если есть несколько условий, объединённых оператором AND

## enable_named_columns_in_function_tuple {#enable_named_columns_in_function_tuple} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Генерировать именованные кортежи в функции tuple() при условии, что все имена уникальны и могут интерпретироваться как идентификаторы без кавычек."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "Отключено до внесения улучшений в удобство использования"}]}]}/>

Генерировать именованные кортежи в функции tuple() при условии, что все имена уникальны и могут интерпретироваться как идентификаторы без кавычек.

## enable_optimize_predicate_expression {#enable_optimize_predicate_expression} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "18.12.17"},{"label": "1"},{"label": "Оптимизация предикатов в подзапросах по умолчанию"}]}]}/>

Включает проталкивание предикатов (predicate pushdown) в запросах `SELECT`.

Проталкивание предикатов может значительно сократить сетевой трафик для распределённых запросов.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

Использование

Рассмотрим следующие запросы:

1.  `SELECT count() FROM test_table WHERE date = '2018-10-10'`
2.  `SELECT count() FROM (SELECT * FROM test_table) WHERE date = '2018-10-10'`

Если `enable_optimize_predicate_expression = 1`, время выполнения этих запросов одинаково, потому что ClickHouse применяет `WHERE` к подзапросу при его обработке.

Если `enable_optimize_predicate_expression = 0`, время выполнения второго запроса намного больше, потому что условие `WHERE` применяется ко всем данным после завершения подзапроса.

## enable_optimize_predicate_expression_to_final_subquery {#enable_optimize_predicate_expression_to_final_subquery} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает проталкивание предикатов в подзапрос с FINAL.

## enable&#95;order&#95;by&#95;all {#enable_order_by_all}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает сортировку с использованием синтаксиса `ORDER BY ALL`, см. [ORDER BY](../../sql-reference/statements/select/order-by.md).

Возможные значения:

* 0 — Отключить ORDER BY ALL.
* 1 — Включить ORDER BY ALL.

**Пример**

Запрос:

```sql
CREATE TABLE TAB(C1 Int, C2 Int, ALL Int) ENGINE=Memory();

INSERT INTO TAB VALUES (10, 20, 30), (20, 20, 10), (30, 10, 20);

SELECT * FROM TAB ORDER BY ALL; -- возвращает ошибку о неоднозначности ALL

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


## enable_parallel_blocks_marshalling {#enable_parallel_blocks_marshalling} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "true"},{"label": "A new setting"}]}]}/>

Влияет только на распределённые запросы. Если параметр включён, блоки будут (де)сериализовываться и (де)сжиматься в потоках конвейера (т. е. с большей степенью параллелизма, чем по умолчанию) перед/после отправки инициатору запроса.

## enable_parsing_to_custom_serialization {#enable_parsing_to_custom_serialization} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

Если значение равно `true`, данные могут быть напрямую распарсены в столбцы с пользовательской сериализацией (например, разреженной) на основе подсказок по сериализации, полученных из таблицы.

## enable&#95;positional&#95;arguments {#enable_positional_arguments}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.7"},{"label": "1"},{"label": "Enable positional arguments feature by default"}]}]} />

Включает или отключает поддержку позиционных аргументов в командах [GROUP BY](/sql-reference/statements/select/group-by), [LIMIT BY](../../sql-reference/statements/select/limit-by.md), [ORDER BY](../../sql-reference/statements/select/order-by.md).

Возможные значения:

* 0 — позиционные аргументы не поддерживаются.
* 1 — позиционные аргументы поддерживаются: можно использовать номера столбцов вместо имен столбцов.

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


## enable_positional_arguments_for_projections {#enable_positional_arguments_for_projections} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Новая настройка для управления позиционными аргументами в определениях PROJECTION."}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "0"},{"label": "Новая настройка для управления позиционными аргументами в определениях PROJECTION."}]}, {"id": "row-3","items": [{"label": "25.10"},{"label": "0"},{"label": "Новая настройка для управления позиционными аргументами в определениях PROJECTION."}]}]}/>

Включает или отключает поддержку позиционных аргументов в определениях PROJECTION. См. также настройку [enable_positional_arguments](#enable_positional_arguments).

:::note
Это настройка для экспертов, и вам не следует изменять её, если вы только начинаете работу с ClickHouse.
:::

Возможные значения:

- 0 — позиционные аргументы не поддерживаются.
- 1 — позиционные аргументы поддерживаются: можно использовать номера столбцов вместо имён столбцов.

## enable_producing_buckets_out_of_order_in_aggregation {#enable_producing_buckets_out_of_order_in_aggregation} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

Разрешает памяти-эффективной агрегации (см. `distributed_aggregation_memory_efficient`) выдавать бакеты в произвольном порядке.
Это может улучшить производительность, когда размеры бакетов агрегирования сильно различаются, позволяя реплике отправлять инициатору бакеты с более высокими идентификаторами, пока она всё ещё обрабатывает тяжёлые бакеты с более низкими идентификаторами.
Недостатком является потенциально более высокое потребление памяти.

## enable_reads_from_query_cache {#enable_reads_from_query_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если включено, результаты запросов `SELECT` извлекаются из [кэша запросов](../query-cache.md).

Возможные значения:

- 0 - Отключено
- 1 - Включено

## enable_s3_requests_logging {#enable_s3_requests_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает максимально подробное логирование запросов к S3. Имеет смысл только для отладки.

## enable_scalar_subquery_optimization {#enable_scalar_subquery_optimization} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.18"},{"label": "1"},{"label": "Предотвращает (де)сериализацию больших скалярных значений в скалярных подзапросах и, при возможности, позволяет избежать повторного выполнения одного и того же подзапроса"}]}]}/>

Если параметр имеет значение true, предотвращает (де)сериализацию больших скалярных значений в скалярных подзапросах и, при возможности, позволяет избежать повторного выполнения одного и того же подзапроса.

## enable_scopes_for_with_statement {#enable_scopes_for_with_statement} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "Новая настройка для обратной совместимости со старым анализатором."}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "1"},{"label": "Новая настройка для обратной совместимости со старым анализатором."}]}, {"id": "row-3","items": [{"label": "25.5"},{"label": "1"},{"label": "Новая настройка для обратной совместимости со старым анализатором."}]}, {"id": "row-4","items": [{"label": "25.4"},{"label": "1"},{"label": "Новая настройка для обратной совместимости со старым анализатором."}]}]}/>

Если настройка отключена, объявления в родительских конструкциях WITH будут рассматриваться как объявленные в текущей области видимости.

Обратите внимание, что это настройка совместимости для нового анализатора, позволяющая выполнять некоторые некорректные запросы, которые мог исполнять старый анализатор.

## enable&#95;shared&#95;storage&#95;snapshot&#95;in&#95;query {#enable_shared_storage_snapshot_in_query}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "A new setting to share storage snapshot in query"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "Enable share storage snapshot in query by default"}]}]} />

Если параметр включён, все подзапросы внутри одного запроса будут использовать один и тот же StorageSnapshot для каждой таблицы.
Это обеспечивает единый согласованный вид данных для всего запроса, даже если к одной и той же таблице обращаются несколько раз.

Это требуется для запросов, в которых важна внутренняя согласованность частей данных. Пример:

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
В результате длительно выполняющиеся запросы могут удерживать устаревшие части на протяжении всего времени выполнения, откладывая их очистку и увеличивая нагрузку на хранилище.

В настоящее время этот параметр применяется только к таблицам семейства MergeTree.
:::

Возможные значения:

* 0 - Отключено
* 1 - Включено


## enable_sharing_sets_for_mutations {#enable_sharing_sets_for_mutations} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает совместное использование объектов множеств, построенных для подзапросов с оператором IN, между различными задачами одной и той же мутации. Это снижает использование памяти и потребление CPU.

## enable_software_prefetch_in_aggregation {#enable_software_prefetch_in_aggregation} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает использование программной предварительной выборки данных (software prefetch) при агрегации.

## enable_time_time64_type {#enable_time_time64_type} 

**Псевдонимы**: `allow_experimental_time_time64_type`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Новая настройка. Позволяет использовать экспериментальные типы данных Time и Time64."}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "Типы данных Time и Time64 включены по умолчанию."}]}]}/>

Позволяет создавать типы данных [Time](../../sql-reference/data-types/time.md) и [Time64](../../sql-reference/data-types/time64.md).

## enable_unaligned_array_join {#enable_unaligned_array_join} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использовать ARRAY JOIN с несколькими массивами разного размера. Когда эта настройка включена, массивы будут автоматически приведены к длине самого длинного.

## enable_url_encoding {#enable_url_encoding} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Changed existing setting's default value"}]}]}/>

Позволяет включить или отключить кодирование/декодирование пути в URI в таблицах с движком [URL](../../engines/table-engines/special/url.md).

По умолчанию — отключено.

## enable_vertical_final {#enable_vertical_final} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Снова включить вертикальный FINAL по умолчанию после исправления ошибки"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "Использовать вертикальный FINAL по умолчанию"}]}]}/>

Если включено, во время FINAL дублирующиеся строки не сливаются, а помечаются как удалённые и отфильтровываются позже

## enable_writes_to_query_cache {#enable_writes_to_query_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если включена, результаты запросов `SELECT` записываются в [кэш запросов](../query-cache.md).

Возможные значения:

- 0 — отключено
- 1 — включено

## enforce_strict_identifier_format {#enforce_strict_identifier_format} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "New setting."}]}]}/>

Если параметр включён, допускаются только идентификаторы, содержащие буквы, цифры и символ подчёркивания.

## engine_file_allow_create_multiple_files {#engine_file_allow_create_multiple_files} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает создание нового файла при каждой операции вставки (`INSERT`) в таблицы движка `File`, если формат имеет суффикс (`JSON`, `ORC`, `Parquet` и т. д.). Если параметр включен, при каждом `INSERT` будет создаваться новый файл с именем по следующему шаблону:

`data.Parquet` -> `data.1.Parquet` -> `data.2.Parquet` и т. д.

Возможные значения:

- 0 — запрос `INSERT` дописывает новые данные в конец файла.
- 1 — запрос `INSERT` создает новый файл.

## engine_file_empty_if_not_exists {#engine_file_empty_if_not_exists} 

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет выполнять выборку данных из таблицы движка File при отсутствии файла.

Возможные значения:

- 0 — `SELECT` выбрасывает исключение.
- 1 — `SELECT` возвращает пустой результат.

## engine_file_skip_empty_files {#engine_file_skip_empty_files} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает пропуск пустых файлов в таблицах с движком [File](../../engines/table-engines/special/file.md).

Возможные значения:

- 0 — `SELECT` выбрасывает исключение, если пустой файл не совместим с запрошенным форматом.
- 1 — `SELECT` возвращает пустой результат для пустого файла.

## engine_file_truncate_on_insert {#engine_file_truncate_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает очистку файла перед вставкой в таблицы движка [File](../../engines/table-engines/special/file.md).

Возможные значения:

- 0 — запрос `INSERT` дописывает новые данные в конец файла.
- 1 — запрос `INSERT` заменяет существующее содержимое файла новыми данными.

## engine_url_skip_empty_files {#engine_url_skip_empty_files} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает пропуск пустых файлов в таблицах движка [URL](../../engines/table-engines/special/url.md).

Возможные значения:

- 0 — `SELECT` выбрасывает исключение, если пустой файл не совместим с запрошенным форматом.
- 1 — `SELECT` возвращает пустой результат для пустого файла.

## except_default_mode {#except_default_mode} 

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

Устанавливает режим по умолчанию для запроса EXCEPT. Возможные значения: пустая строка, `ALL`, `DISTINCT`. Если установлена пустая строка, выполнение запроса без указания режима завершится ошибкой.

## exclude&#95;materialize&#95;skip&#95;indexes&#95;on&#95;insert {#exclude_materialize_skip_indexes_on_insert}

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "Новая настройка."}]}]} />

Исключает указанные skip-индексы из построения и сохранения во время операций INSERT. Исключённые skip-индексы по‑прежнему будут построены и сохранены [во время слияний](merge-tree-settings.md/#materialize_skip_indexes_on_merge) или при явном выполнении запроса [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index).

Не влияет, если [materialize&#95;skip&#95;indexes&#95;on&#95;insert](#materialize_skip_indexes_on_insert) имеет значение false.

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

SET exclude_materialize_skip_indexes_on_insert='idx_a'; -- idx_a не будет обновляться при вставке
--SET exclude_materialize_skip_indexes_on_insert='idx_a, idx_b'; -- ни один из индексов не будет обновляться при вставке

INSERT INTO tab SELECT number, number / 50 FROM numbers(100); -- обновляется только idx_b

-- поскольку это настройка сеанса, её можно установить на уровне отдельного запроса
INSERT INTO tab SELECT number, number / 50 FROM numbers(100, 100) SETTINGS exclude_materialize_skip_indexes_on_insert='idx_b';

ALTER TABLE tab MATERIALIZE INDEX idx_a; -- этот запрос можно использовать для явной материализации индекса

SET exclude_materialize_skip_indexes_on_insert = DEFAULT; -- сброс настройки на значение по умолчанию
```


## execute_exists_as_scalar_subquery {#execute_exists_as_scalar_subquery} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

Некоррелированные подзапросы EXISTS выполняются как скалярные подзапросы. Аналогично скалярным подзапросам используется кэш, а к результату применяется свёртка констант.

## external_storage_connect_timeout_sec {#external_storage_connect_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="10" />

Таймаут подключения в секундах. Поддерживается только для MySQL.

## external_storage_max_read_bytes {#external_storage_max_read_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает максимальное количество байт, которое может быть прочитано при сбросе исторических данных таблицей с внешним движком. В настоящее время поддерживается только для движка таблиц MySQL, движка базы данных и словаря. Если значение равно 0, данный SETTING отключён.

## external_storage_max_read_rows {#external_storage_max_read_rows} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает максимальное количество строк, после достижения которого таблица с внешним движком должна сбрасывать исторические данные. В настоящее время поддерживается только для табличного движка MySQL, движка базы данных и словаря. Если значение равно 0, параметр отключен.

## external_storage_rw_timeout_sec {#external_storage_rw_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="300" />

Таймаут чтения/записи в секундах. На данный момент поддерживается только для MySQL.

## external_table_functions_use_nulls {#external_table_functions_use_nulls} 

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет, как табличные функции [mysql](../../sql-reference/table-functions/mysql.md), [postgresql](../../sql-reference/table-functions/postgresql.md) и [odbc](../../sql-reference/table-functions/odbc.md) используют столбцы типа Nullable.

Возможные значения:

- 0 — табличная функция явно использует столбцы типа Nullable.
- 1 — табличная функция неявно использует столбцы типа Nullable.

**Использование**

Если параметр имеет значение `0`, табличная функция не создаёт столбцы типа Nullable и вставляет значения по умолчанию вместо NULL. Это также применимо к значениям NULL внутри массивов.

## external_table_strict_query {#external_table_strict_query} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение true, для запросов к внешним таблицам недопустимо преобразование выражений в локальный фильтр.

## extract_key_value_pairs_max_pairs_per_row {#extract_key_value_pairs_max_pairs_per_row} 

**Псевдонимы**: `extract_kvp_max_pairs_per_row`

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "Максимальное количество пар, которое может быть получено функцией `extractKeyValuePairs`. Используется как защита от избыточного потребления памяти."}]}]}/>

Максимальное количество пар, которое может быть получено функцией `extractKeyValuePairs`. Используется как защита от избыточного потребления памяти.

## extremes {#extremes} 

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, нужно ли учитывать экстремальные значения (минимальные и максимальные значения в столбцах результата запроса). Принимает 0 или 1. По умолчанию — 0 (отключено).
Дополнительные сведения см. в разделе «Экстремальные значения».

## fallback_to_stale_replicas_for_distributed_queries {#fallback_to_stale_replicas_for_distributed_queries} 

<SettingsInfoBlock type="Bool" default_value="1" />

Принудительно выполняет запрос к устаревшей реплике, если обновлённые данные недоступны. См. раздел [Replication](../../engines/table-engines/mergetree-family/replication.md).

ClickHouse выбирает наиболее актуальную среди устаревших реплик таблицы.

Используется при выполнении `SELECT` из distributed таблицы, которая ссылается на реплицированные таблицы.

По умолчанию — 1 (включено).

## filesystem_cache_allow_background_download {#filesystem_cache_allow_background_download} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Новая настройка для управления фоновыми загрузками в кеше файловой системы для каждого запроса."}]}]}/>

Разрешает кешу файловой системы ставить в очередь фоновые загрузки данных, считываемых из удалённого хранилища. Отключите, чтобы выполнять загрузки синхронно для текущего запроса/сессии.

## filesystem_cache_boundary_alignment {#filesystem_cache_boundary_alignment} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Выравнивание границ кэша файловой системы. Этот параметр применяется только для недискового чтения (например, для кэша удалённых движков таблиц / табличных функций, но не для конфигурации хранения таблиц MergeTree). Значение 0 означает отсутствие выравнивания.

## filesystem_cache_enable_background_download_during_fetch {#filesystem_cache_enable_background_download_during_fetch} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Время ожидания при захвате блокировки кэша для резервирования места в файловом кэше.

## filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage {#filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Время ожидания блокировки кэша для резервирования пространства в файловом кэше.

## filesystem_cache_max_download_size {#filesystem_cache_max_download_size} 

<SettingsInfoBlock type="UInt64" default_value="137438953472" />

Максимальный размер кэша удалённой файловой системы, который может быть скачан одним запросом

## filesystem_cache_name {#filesystem_cache_name} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": ""},{"label": "Имя кэша файловой системы для табличных движков без состояния или озёр данных"}]}]}/>

Имя кэша файловой системы для табличных движков без состояния или озёр данных

## filesystem_cache_prefer_bigger_buffer_size {#filesystem_cache_prefer_bigger_buffer_size} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

При включённом кешировании файловой системы использовать увеличенный размер буфера, чтобы избежать записи небольших сегментов файлов, ухудшающих производительность кэша. С другой стороны, включение этого параметра может привести к увеличению потребления памяти.

## filesystem_cache_reserve_space_wait_lock_timeout_milliseconds {#filesystem_cache_reserve_space_wait_lock_timeout_milliseconds} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "Таймаут ожидания блокировки кэша для резервирования места в файловом кэше"}]}]}/>

Таймаут ожидания блокировки кэша для резервирования места в файловом кэше

## filesystem_cache_segments_batch_size {#filesystem_cache_segments_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="20" />

Ограничение на размер одного пакета файловых сегментов, который буфер чтения может запрашивать из кэша. Слишком маленькое значение приведёт к чрезмерному количеству запросов к кэшу, а слишком большое может замедлить вытеснение из кэша.

## filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit {#filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit} 

**Псевдонимы**: `skip_download_if_exceeds_query_cache`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "Переименование настройки skip_download_if_exceeds_query_cache_limit"}]}]}/>

Пропускать загрузку из удалённой файловой системы, если объём данных превышает размер кэша запросов

## filesystem_prefetch_max_memory_usage {#filesystem_prefetch_max_memory_usage} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

Максимальный объем памяти, используемый для предварительной подзагрузки.

## filesystem_prefetch_step_bytes {#filesystem_prefetch_step_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Шаг предварительной выборки в байтах. Ноль означает `auto` — примерно оптимальный шаг будет определён автоматически, но он может быть не на 100% лучшим. Фактическое значение может отличаться из‑за настройки filesystem_prefetch_min_bytes_for_single_read_task.

## filesystem_prefetch_step_marks {#filesystem_prefetch_step_marks} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Шаг предзагрузки в отметках. Ноль означает `auto` — примерно оптимальный шаг предзагрузки будет выбран автоматически, но может быть не на 100% лучшим. Фактическое значение может отличаться из‑за настройки filesystem_prefetch_min_bytes_for_single_read_task.

## filesystem_prefetches_limit {#filesystem_prefetches_limit} 

<SettingsInfoBlock type="UInt64" default_value="200" />

Максимальное количество предзагрузок. Нулевое значение означает отсутствие ограничения. Если вы хотите ограничить количество предзагрузок, рекомендуется использовать настройку `filesystem_prefetches_max_memory_usage`.

## final {#final}

<SettingsInfoBlock type="Bool" default_value="0" />

Автоматически применяет модификатор [FINAL](../../sql-reference/statements/select/from.md/#final-modifier) во всех таблицах запроса, для которых [FINAL](../../sql-reference/statements/select/from.md/#final-modifier) применим, включая соединённые таблицы, таблицы во вложенных запросах, а также distributed таблицы.

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


## flatten&#95;nested {#flatten_nested}

<SettingsInfoBlock type="Bool" default_value="1" />

Задает формат данных столбцов типа [Nested](../../sql-reference/data-types/nested-data-structures/index.md).

Возможные значения:

* 1 — вложенный столбец разворачивается в отдельные массивы.
* 0 — вложенный столбец остается единым массивом кортежей.

**Использование**

Если параметр установлен в значение `0`, можно использовать произвольный уровень вложенности.

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


## force_aggregate_partitions_independently {#force_aggregate_partitions_independently} 

<SettingsInfoBlock type="Bool" default_value="0" />

Принудительно использовать оптимизацию, когда она применима, даже если эвристики решили её не использовать.

## force_aggregation_in_order {#force_aggregation_in_order} 

<SettingsInfoBlock type="Bool" default_value="0" />

Этот параметр используется сервером для поддержки распределённых запросов. Не изменяйте его вручную — это нарушит нормальную работу. (Принудительно включает использование агрегации в порядке следования данных на удалённых узлах при распределённой агрегации).

## force&#95;data&#95;skipping&#95;indices {#force_data_skipping_indices}

Отключает выполнение запроса, если переданные индексы пропуска данных не были задействованы.

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
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices=''; -- запрос приведет к ошибке CANNOT_PARSE_TEXT.
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices='d1_idx'; -- запрос приведет к ошибке INDEX_NOT_USED.
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='d1_idx'; -- Корректно.
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='`d1_idx`'; -- Корректно (пример полнофункционального парсера).
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='`d1_idx`, d1_null_idx'; -- запрос приведет к ошибке INDEX_NOT_USED, так как индекс d1_null_idx не используется.
SELECT * FROM data_01515 WHERE d1 = 0 AND assumeNotNull(d1_null) = 0 SETTINGS force_data_skipping_indices='`d1_idx`, d1_null_idx'; -- Корректно.
```


## force_grouping_standard_compatibility {#force_grouping_standard_compatibility} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.9"},{"label": "1"},{"label": "Сделать результат функции GROUPING таким же, как в стандарте SQL и других СУБД"}]}]}/>

Заставляет функцию GROUPING возвращать 1, если аргумент не используется в качестве ключа агрегирования

## force_index_by_date {#force_index_by_date} 

<SettingsInfoBlock type="Bool" default_value="0" />

Отключает выполнение запроса, если индекс не может быть использован по дате.

Работает с таблицами семейства MergeTree.

Если `force_index_by_date=1`, ClickHouse проверяет, содержит ли запрос условие по ключу даты, которое может быть использовано для ограничения диапазонов данных. Если подходящего условия нет, будет выброшено исключение. При этом не проверяется, уменьшает ли условие объем данных для чтения. Например, условие `Date != ' 2000-01-01 '` допустимо, даже если оно соответствует всем данным в таблице (то есть выполнение запроса требует полного сканирования). Подробнее о диапазонах данных в таблицах MergeTree см. [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

## force_optimize_projection {#force_optimize_projection} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает обязательное использование [проекций](../../engines/table-engines/mergetree-family/mergetree.md/#projections) в запросах `SELECT`, когда включена оптимизация проекций (см. настройку [optimize_use_projections](#optimize_use_projections)).

Возможные значения:

- 0 — Оптимизация проекций не является обязательной.
- 1 — Оптимизация проекций является обязательной.

## force_optimize_projection_name {#force_optimize_projection_name} 

Если задано непустое строковое значение, проверяется, что эта проекция используется в запросе как минимум один раз.

Возможные значения:

- string: имя проекции, которая используется в запросе

## force_optimize_skip_unused_shards {#force_optimize_skip_unused_shards} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Разрешает или запрещает выполнение запроса, если [optimize_skip_unused_shards](#optimize_skip_unused_shards) включён и пропуск неиспользуемых сегментов невозможен. Если пропуск невозможен и параметр включён, генерируется исключение.

Возможные значения:

- 0 — Отключено. ClickHouse не генерирует исключение.
- 1 — Включено. Запрос не выполняется только если у таблицы есть ключ сегментирования.
- 2 — Включено. Запрос не выполняется независимо от того, определён ли для таблицы ключ сегментирования.

## force_optimize_skip_unused_shards_nesting {#force_optimize_skip_unused_shards_nesting} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Управляет поведением [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards) (и, соответственно, всё равно требует включения [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards)) в зависимости от уровня вложенности распределённого запроса (случай, когда у вас есть таблица `Distributed`, которая обращается к другой таблице `Distributed`).

Возможные значения:

- 0 — Отключено, `force_optimize_skip_unused_shards` всегда работает.
- 1 — Включает `force_optimize_skip_unused_shards` только для первого уровня.
- 2 — Включает `force_optimize_skip_unused_shards` до второго уровня включительно.

## force_primary_key {#force_primary_key} 

<SettingsInfoBlock type="Bool" default_value="0" />

Запрещает выполнение запроса, если индексация по первичному ключу невозможна.

Работает с таблицами семейства MergeTree.

Если `force_primary_key=1`, ClickHouse проверяет, содержит ли запрос условие по первичному ключу, которое можно использовать для ограничения диапазонов данных. Если подходящего условия нет, генерируется исключение. Однако не проверяется, сокращает ли это условие объём данных для чтения. Дополнительную информацию о диапазонах данных в таблицах MergeTree см. в разделе [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

## force_remove_data_recursively_on_drop {#force_remove_data_recursively_on_drop} 

<SettingsInfoBlock type="Bool" default_value="0" />

Рекурсивно удаляет данные при выполнении запроса DROP. Позволяет избежать ошибки «Directory not empty», но может незаметно удалить отсоединённые данные

## formatdatetime_e_with_space_padding {#formatdatetime_e_with_space_padding} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Улучшена совместимость с MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

Форматтер '%e' в функции 'formatDateTime' выводит однозначные дни месяца с ведущим пробелом, например ' 2' вместо '2'.

## formatdatetime_f_prints_scale_number_of_digits {#formatdatetime_f_prints_scale_number_of_digits} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Форматтер '%f' в функции 'formatDateTime' выводит только количество цифр, соответствующее масштабу типа DateTime64, вместо фиксированных 6 цифр.

## formatdatetime_f_prints_single_zero {#formatdatetime_f_prints_single_zero} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "Улучшена совместимость с MySQL DATE_FORMAT()/STR_TO_DATE()"}]}]}/>

Форматировщик '%f' в функции 'formatDateTime' выводит один ноль вместо шести нулей, если форматируемое значение не содержит дробной части секунд.

## formatdatetime_format_without_leading_zeros {#formatdatetime_format_without_leading_zeros} 

<SettingsInfoBlock type="Bool" default_value="0" />

Спецификаторы формата '%c', '%l' и '%k' в функции `formatDateTime` выводят месяцы и часы без ведущих нулей.

## formatdatetime_parsedatetime_m_is_month_name {#formatdatetime_parsedatetime_m_is_month_name} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1"},{"label": "Улучшена совместимость с MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

Форматтер '%M' в функциях 'formatDateTime' и 'parseDateTime' выводит/распознаёт название месяца вместо минут.

## fsync_metadata {#fsync_metadata} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает [fsync](http://pubs.opengroup.org/onlinepubs/9699919799/functions/fsync.html) при записи файлов `.sql`. По умолчанию включено.

Имеет смысл отключить этот параметр, если на сервере есть миллионы крошечных таблиц, которые постоянно создаются и удаляются.

## function_date_trunc_return_type_behavior {#function_date_trunc_return_type_behavior} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "Добавлена новая настройка для сохранения старого поведения функции dateTrunc"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "Изменён тип результата функции dateTrunc для аргументов DateTime64/Date32 на DateTime64/Date32 независимо от единицы времени, чтобы получить корректный результат для отрицательных значений"}]}]}/>

Настройка позволяет изменить поведение определения типа результата функции `dateTrunc`.

Возможные значения:

- 0 — если второй аргумент имеет тип `DateTime64/Date32`, тип результата будет `DateTime64/Date32` независимо от единицы времени в первом аргументе.
- 1 — для `Date32` результатом всегда является `Date`. Для `DateTime64` результатом является `DateTime` для единиц времени `second` и более крупных.

## function_implementation {#function_implementation} 

Выберите реализацию функции для конкретного таргета или варианта (экспериментальная возможность). Если оставить пустым, будут включены все реализации.

## function&#95;json&#95;value&#95;return&#95;type&#95;allow&#95;complex {#function_json_value_return_type_allow_complex}

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет тем, разрешено ли функции json&#95;value возвращать сложные типы данных (такие как struct, array, map).

```sql
SELECT JSON_VALUE('{"hello":{"world":"!"}}', '$.hello') settings function_json_value_return_type_allow_complex=true

┌─JSON_VALUE('{"hello":{"world":"!"}}', '$.hello')─┐
│ {"world":"!"}                                    │
└──────────────────────────────────────────────────┘

Получена 1 строка. Прошло: 0.001 сек.
```

Возможные значения:

* true — разрешено.
* false — запрещено.


## function&#95;json&#95;value&#95;return&#95;type&#95;allow&#95;nullable {#function_json_value_return_type_allow_nullable}

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, можно ли возвращать `NULL`, если запрошенное значение для функции JSON&#95;VALUE отсутствует.

```sql
SELECT JSON_VALUE('{"hello":"world"}', '$.b') settings function_json_value_return_type_allow_nullable=true;

┌─JSON_VALUE('{"hello":"world"}', '$.b')─┐
│ ᴺᵁᴸᴸ                                   │
└────────────────────────────────────────┘

Получена 1 строка. Прошло: 0.001 сек.
```

Возможные значения:

* true — разрешить.
* false — запретить.


## function_locate_has_mysql_compatible_argument_order {#function_locate_has_mysql_compatible_argument_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Повышена совместимость с функцией locate в MySQL."}]}]}/>

Определяет порядок аргументов в функции [locate](../../sql-reference/functions/string-search-functions.md/#locate).

Возможные значения:

- 0 — функция `locate` принимает аргументы `(haystack, needle[, start_pos])`.
- 1 — функция `locate` принимает аргументы `(needle, haystack[, start_pos])` (поведение, совместимое с MySQL)

## function_range_max_elements_in_block {#function_range_max_elements_in_block} 

<SettingsInfoBlock type="UInt64" default_value="500000000" />

Устанавливает порог безопасности для объёма данных, генерируемых функцией [range](/sql-reference/functions/array-functions#range). Определяет максимальное количество значений, генерируемых функцией для блока данных (сумма размеров массивов для каждой строки в блоке).

Возможные значения:

- Положительное целое число.

**См. также**

- [`max_block_size`](#max_block_size)
- [`min_insert_block_size_rows`](#min_insert_block_size_rows)

## function_sleep_max_microseconds_per_block {#function_sleep_max_microseconds_per_block} 

<SettingsInfoBlock type="UInt64" default_value="3000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.7"},{"label": "3000000"},{"label": "В предыдущих версиях максимальное время задержки 3 секунды применялось только для функции `sleep`, но не для функции `sleepEachRow`. В новой версии мы вводим этот параметр. Если вы установите совместимость с предыдущими версиями, это ограничение будет полностью отключено."}]}]}/>

Максимальное количество микросекунд, на которое функция `sleep` может приостанавливать выполнение для каждого блока. Если функция вызывается с большим значением, генерируется исключение. Это защитное ограничение.

## function_visible_width_behavior {#function_visible_width_behavior} 

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "Мы изменили поведение `visibleWidth` по умолчанию, чтобы сделать его более точным"}]}]}/>

Версия логики работы `visibleWidth`. 0 — считать только количество кодовых точек; 1 — корректно учитывать символы нулевой ширины и комбинирующие символы, считать полноширинные символы за два, оценивать ширину табуляции, учитывать символы удаления.

## geo_distance_returns_float64_on_float64_arguments {#geo_distance_returns_float64_on_float64_arguments} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Увеличена точность по умолчанию."}]}]}/>

Если все четыре аргумента функций `geoDistance`, `greatCircleDistance` и `greatCircleAngle` имеют тип Float64, возвращается Float64 и для внутренних вычислений используется двойная точность. В предыдущих версиях ClickHouse эти функции всегда возвращали Float32.

## geotoh3_argument_order {#geotoh3_argument_order} 

<BetaBadge/>

<SettingsInfoBlock type="GeoToH3ArgumentOrder" default_value="lat_lon" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "lat_lon"},{"label": "Новая настройка для устаревшего поведения, задающая порядок аргументов lon и lat"}]}]}/>

Функция `geoToH3` принимает (lon, lat), если значение равно `lon_lat`, и (lat, lon), если значение равно `lat_lon`.

## glob_expansion_max_elements {#glob_expansion_max_elements} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальное количество разрешённых адресов (для внешних хранилищ, табличных функций и т. д.).

## grace_hash_join_initial_buckets {#grace_hash_join_initial_buckets} 

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1" />

Начальное количество бакетов для Grace Hash Join

## grace_hash_join_max_buckets {#grace_hash_join_max_buckets} 

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

Ограничение на число бакетов в grace hash join

## group_by_overflow_mode {#group_by_overflow_mode} 

<SettingsInfoBlock type="OverflowModeGroupBy" default_value="throw" />

Определяет, что происходит, когда количество уникальных ключей для агрегации превышает лимит:

- `throw`: выдать исключение
- `break`: остановить выполнение запроса и вернуть частичный результат
- `any`: продолжить агрегацию для ключей, которые попали в множество, но не добавлять в множество новые ключи.

Использование значения `any` позволяет выполнять приближённый GROUP BY. Качество
такого приближения зависит от статистических свойств данных.

## group_by_two_level_threshold {#group_by_two_level_threshold} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

С какого количества ключей начинается двухуровневая агрегация. 0 — порог не установлен.

## group_by_two_level_threshold_bytes {#group_by_two_level_threshold_bytes} 

<SettingsInfoBlock type="UInt64" default_value="50000000" />

Размер состояния агрегации в байтах, начиная с которого используется двухуровневая агрегация. 0 — порог не установлен. Двухуровневая агрегация используется, когда срабатывает как минимум один из порогов.

## group_by_use_nulls {#group_by_use_nulls} 

<SettingsInfoBlock type="Bool" default_value="0" />

Изменяет способ, которым [оператор GROUP BY](/sql-reference/statements/select/group-by) обрабатывает типы ключей агрегации.
Когда используются спецификаторы `ROLLUP`, `CUBE` или `GROUPING SETS`, некоторые ключи агрегации могут не использоваться при получении отдельных строк результата.
Столбцы для этих ключей заполняются либо значением по умолчанию, либо `NULL` в соответствующих строках, в зависимости от этого параметра.

Возможные значения:

- 0 — Для отсутствующих значений используется значение по умолчанию для типа ключа агрегации.
- 1 — ClickHouse выполняет `GROUP BY` в соответствии со стандартом SQL. Типы ключей агрегации преобразуются в [Nullable](/sql-reference/data-types/nullable). Столбцы для соответствующих ключей агрегации заполняются значением [NULL](/sql-reference/syntax#null) для строк, в которых этот ключ не использовался.

См. также:

- [Оператор GROUP BY](/sql-reference/statements/select/group-by)

## h3togeo_lon_lat_result_order {#h3togeo_lon_lat_result_order} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Функция 'h3ToGeo' возвращает (lon, lat), если установлено значение true, в противном случае — (lat, lon).

## handshake_timeout_ms {#handshake_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

Тайм-аут в миллисекундах на получение пакета Hello от реплик во время рукопожатия.

## hdfs_create_new_file_on_insert {#hdfs_create_new_file_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает создание нового файла при каждом выполнении `INSERT` в таблицы движка HDFS. Если опция включена, при каждой вставке будет создаваться новый файл HDFS с именем, соответствующим следующему шаблону:

изначально: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` и т. д.

Возможные значения:

- 0 — запрос `INSERT` дописывает новые данные в конец файла.
- 1 — запрос `INSERT` создает новый файл.

## hdfs_ignore_file_doesnt_exist {#hdfs_ignore_file_doesnt_exist} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Позволяет возвращать 0 строк, если запрошенные файлы отсутствуют, вместо выбрасывания исключения в движке таблиц HDFS"}]}]}/>

Игнорировать отсутствие файла, если запрошенный файл отсутствует при чтении по определённым ключам.

Возможные значения:

- 1 — `SELECT` возвращает пустой результат.
- 0 — `SELECT` выбрасывает исключение.

## hdfs_replication {#hdfs_replication} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Фактическое количество реплик можно указать при создании файла в HDFS.

## hdfs_skip_empty_files {#hdfs_skip_empty_files} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает игнорирование пустых файлов в таблицах движка [HDFS](../../engines/table-engines/integrations/hdfs.md).

Возможные значения:

- 0 — `SELECT` выбрасывает исключение, если пустой файл не совместим с запрошенным форматом.
- 1 — `SELECT` возвращает пустой результат для пустого файла.

## hdfs_throw_on_zero_files_match {#hdfs_throw_on_zero_files_match} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Позволяет генерировать ошибку, когда запрос ListObjects не находит ни одного файла в движке HDFS, вместо возврата пустого результата запроса"}]}]}/>

Генерировать ошибку, если не найдено ни одного файла в соответствии с правилами раскрытия шаблонов glob.

Возможные значения:

- 1 — `SELECT` генерирует исключение.
- 0 — `SELECT` возвращает пустой результат.

## hdfs_truncate_on_insert {#hdfs_truncate_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает очистку (truncate) файла перед вставкой в таблицы движка HDFS. При отключённой опции при попытке вставки будет сгенерировано исключение, если файл в HDFS уже существует.

Возможные значения:

- 0 — запрос `INSERT` дописывает новые данные в конец файла.
- 1 — запрос `INSERT` заменяет существующее содержимое файла новыми данными.

## hedged_connection_timeout_ms {#hedged_connection_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "50"},{"label": "Запуск нового соединения в hedged-запросах через 50 мс вместо 100 мс для соответствия предыдущему тайм-ауту подключения"}]}]}/>

Тайм-аут ожидания установки соединения с репликой для hedged-запросов

## hnsw_candidate_list_size_for_search {#hnsw_candidate_list_size_for_search} 

<SettingsInfoBlock type="UInt64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "256"},{"label": "Новая настройка. Ранее значение при необходимости указывалось в CREATE INDEX и по умолчанию было равно 64."}]}]}/>

Размер динамического списка кандидатов при поиске по векторному индексу сходства, также известному как «ef_search».

## hsts_max_age {#hsts_max_age} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Срок действия HSTS. Значение 0 отключает HSTS.

## http_connection_timeout {#http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="1" />

Таймаут HTTP-соединения (в секундах).

Возможные значения:

- Любое положительное целое число.
- 0 — отключено (бесконечный таймаут).

## http_headers_progress_interval_ms {#http_headers_progress_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Не отправлять HTTP-заголовки X-ClickHouse-Progress чаще, чем один раз за указанный интервал.

## http_make_head_request {#http_make_head_request} 

<SettingsInfoBlock type="Bool" default_value="1" />

Параметр `http_make_head_request` позволяет выполнять запрос `HEAD` при чтении данных по HTTP, чтобы получить информацию о файле, который требуется прочитать, например о его размере. Поскольку этот параметр включён по умолчанию, в случаях, когда сервер не поддерживает запросы `HEAD`, может быть целесообразно его отключить.

## http_max_field_name_size {#http_max_field_name_size} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

Максимальная длина имени поля в HTTP-заголовке

## http_max_field_value_size {#http_max_field_value_size} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

Максимальная длина значения поля заголовка HTTP

## http_max_fields {#http_max_fields} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

Максимальное количество полей в HTTP-заголовке

## http_max_multipart_form_data_size {#http_max_multipart_form_data_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Ограничение на размер содержимого multipart/form-data. Этот параметр не может быть задан через параметры URL и должен быть указан в профиле пользователя. Обратите внимание, что содержимое разбирается, а внешние таблицы создаются в памяти до начала выполнения запроса. Это единственное ограничение, влияющее на этот этап (ограничения на максимальное использование памяти и максимальное время выполнения не действуют при чтении данных из HTTP-формы).

## http_max_request_param_data_size {#http_max_request_param_data_size} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

Ограничение на размер данных запроса, используемых как параметр в предопределённых HTTP-запросах.

## http_max_tries {#http_max_tries} 

<SettingsInfoBlock type="UInt64" default_value="10" />

Максимальное количество попыток чтения через HTTP.

## http_max_uri_size {#http_max_uri_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Задает максимальную длину URI HTTP-запроса.

Возможные значения:

- Положительное целое число.

## http_native_compression_disable_checksumming_on_decompress {#http_native_compression_disable_checksumming_on_decompress} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает проверку контрольной суммы при декомпрессии данных HTTP POST-запроса от клиента. Используется только для нативного формата сжатия ClickHouse (не используется с `gzip` или `deflate`).

Для получения дополнительной информации см. [описание HTTP-интерфейса](/interfaces/http).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## http_receive_timeout {#http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "См. http_send_timeout."}]}]}/>

Тайм-аут получения данных по HTTP (в секундах).

Возможные значения:

- Любое положительное целое число.
- 0 — отключено (бесконечный тайм-аут).

## http_response_buffer_size {#http_response_buffer_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Количество байт, которые буферизуются в памяти сервера перед отправкой HTTP-ответа клиенту или сбросом на диск (когда включён `http_wait_end_of_query`).

## http_response_headers {#http_response_headers} 

<SettingsInfoBlock type="Map" default_value="{}" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": ""},{"label": "Новая настройка."}]}]}/>

Позволяет добавить или переопределить HTTP-заголовки, которые сервер будет возвращать в ответе при успешном выполнении запроса.
Это влияет только на HTTP-интерфейс.

Если заголовок уже установлен по умолчанию, заданное значение его переопределит.
Если заголовок не был установлен по умолчанию, он будет добавлен в список заголовков.
Заголовки, которые устанавливаются сервером по умолчанию и не переопределены этой настройкой, останутся без изменений.

Настройка позволяет задать заголовок постоянным значением. В настоящий момент нет способа задать заголовок значением, вычисляемым динамически.

Ни имена, ни значения не могут содержать управляющие символы ASCII.

Если вы реализуете приложение с пользовательским интерфейсом, которое позволяет пользователям изменять настройки, но в то же время принимает решения на основе возвращаемых заголовков, рекомендуется ограничить эту настройку режимом «только для чтения» (readonly).

Пример: `SET http_response_headers = '{"Content-Type": "image/png"}'`

## http_retry_initial_backoff_ms {#http_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Минимальное время задержки в миллисекундах перед повторной попыткой чтения по HTTP

## http_retry_max_backoff_ms {#http_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное значение задержки в миллисекундах при повторных попытках чтения по HTTP

## http_send_timeout {#http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "3 минуты — безумно долго. Обратите внимание, что это таймаут для одного сетевого вызова записи, а не для всей операции загрузки."}]}]}/>

Таймаут отправки по HTTP (в секундах).

Возможные значения:

- Любое положительное целое число.
- 0 — отключено (бесконечный таймаут).

:::note
Применяется только к профилю по умолчанию. Для вступления изменений в силу требуется перезагрузка сервера.
:::

## http_skip_not_found_url_for_globs {#http_skip_not_found_url_for_globs} 

<SettingsInfoBlock type="Bool" default_value="1" />

Пропускать URL-адреса, соответствующие glob-шаблонам, при ошибке HTTP_NOT_FOUND

## http_wait_end_of_query {#http_wait_end_of_query} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает буферизацию HTTP-ответов на стороне сервера.

## http_write_exception_in_output_format {#http_write_exception_in_output_format} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Изменено для согласованности во всех форматах"}]}, {"id": "row-2","items": [{"label": "23.9"},{"label": "1"},{"label": "Выводить корректный JSON/XML при исключении при потоковой передаче по HTTP."}]}]}/>

Записывать исключение в выходной формат для формирования корректного вывода. Работает с форматами JSON и XML.

## http_zlib_compression_level {#http_zlib_compression_level} 

<SettingsInfoBlock type="Int64" default_value="3" />

Устанавливает уровень сжатия данных в ответе на HTTP‑запрос, если [enable_http_compression = 1](#enable_http_compression).

Возможные значения: числа от 1 до 9.

## iceberg_delete_data_on_drop {#iceberg_delete_data_on_drop} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

Определяет, нужно ли удалять все файлы Iceberg при выполнении операции DROP.

## iceberg_insert_max_bytes_in_data_file {#iceberg_insert_max_bytes_in_data_file} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "Новая настройка."}]}]}/>

Максимальный размер в байтах файла данных Iceberg Parquet при операции вставки.

## iceberg_insert_max_partitions {#iceberg_insert_max_partitions} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "100"},{"label": "New setting."}]}]}/>

Максимально допустимое число партиций за одну операцию вставки для табличного движка Iceberg.

## iceberg_insert_max_rows_in_data_file {#iceberg_insert_max_rows_in_data_file} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "Новая настройка."}]}]}/>

Максимальное количество строк в файле данных формата Iceberg Parquet при выполнении операции INSERT.

## iceberg_metadata_compression_method {#iceberg_metadata_compression_method} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "Новая настройка"}]}]}/>

Метод сжатия файла `.metadata.json`.

## iceberg_metadata_log_level {#iceberg_metadata_log_level} 

<SettingsInfoBlock type="IcebergMetadataLogLevel" default_value="none" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "none"},{"label": "New setting."}]}]}/>

Управляет уровнем логирования метаданных для таблиц Iceberg в журнал system.iceberg_metadata_log.
Обычно этот параметр изменяют в целях отладки.

Возможные значения:

- none — без лога метаданных.
- metadata — корневой файл metadata.json.
- manifest_list_metadata — всё вышеперечисленное + метаданные из avro-списка манифестов, соответствующего снимку.
- manifest_list_entry — всё вышеперечисленное + записи avro-списка манифестов.
- manifest_file_metadata — всё вышеперечисленное + метаданные из avro-файлов манифестов, обход которых выполняется.
- manifest_file_entry — всё вышеперечисленное + записи avro-файлов манифестов, обход которых выполняется.

## iceberg_snapshot_id {#iceberg_snapshot_id} 

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Выполняет запрос к таблице Iceberg с использованием указанного идентификатора снимка.

## iceberg_timestamp_ms {#iceberg_timestamp_ms} 

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Позволяет выполнять запрос к таблице Iceberg, используя снимок, актуальный по состоянию на указанный момент времени.

## idle_connection_timeout {#idle_connection_timeout} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

Таймаут для закрытия неактивных TCP-соединений по истечении заданного количества секунд.

Возможные значения:

- Положительное целое число (0 — закрыть немедленно, через 0 секунд).

## ignore_cold_parts_seconds {#ignore_cold_parts_seconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

Действует только в ClickHouse Cloud. Исключает новые части из запросов SELECT, пока они не будут предварительно разогреты (см. [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch)) или пока с момента их создания не пройдет указанное количество секунд. Применимо только к Replicated-/SharedMergeTree.

## ignore&#95;data&#95;skipping&#95;indices {#ignore_data_skipping_indices}

Игнорирует указанные индексы пропуска данных, если запрос пытается их использовать.

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
SELECT * FROM data SETTINGS ignore_data_skipping_indices=''; -- запрос приведёт к ошибке CANNOT_PARSE_TEXT.
SELECT * FROM data SETTINGS ignore_data_skipping_indices='x_idx'; -- Ок.
SELECT * FROM data SETTINGS ignore_data_skipping_indices='na_idx'; -- Ок.

SELECT * FROM data WHERE x = 1 AND y = 1 SETTINGS ignore_data_skipping_indices='xy_idx',force_data_skipping_indices='xy_idx' ; -- запрос приведёт к ошибке INDEX_NOT_USED, так как индекс xy_idx явно игнорируется.
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

Поддерживает таблицы семейства MergeTree.


## ignore_drop_queries_probability {#ignore_drop_queries_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "Позволяет игнорировать запросы DROP на сервере с заданной вероятностью в тестовых целях"}]}]}/>

Если параметр включен, сервер будет с заданной вероятностью игнорировать все запросы DROP TABLE (для движков Memory и JOIN оператор DROP будет заменён на TRUNCATE). Используется в тестовых целях.

## ignore_materialized_views_with_dropped_target_table {#ignore_materialized_views_with_dropped_target_table} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Добавлена новая настройка, позволяющая игнорировать materialized views с удалённой целевой таблицей"}]}]}/>

Игнорировать materialized views с удалённой целевой таблицей при передаче данных в представления

## ignore_on_cluster_for_replicated_access_entities_queries {#ignore_on_cluster_for_replicated_access_entities_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорирует предложение ON CLUSTER в запросах управления реплицируемыми объектами доступа.

## ignore_on_cluster_for_replicated_database {#ignore_on_cluster_for_replicated_database} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "Добавлен новый параметр для игнорирования предложения ON CLUSTER в DDL-запросах к реплицируемой базе данных."}]}]}/>

Всегда игнорирует предложение ON CLUSTER в DDL-запросах к реплицируемым базам данных.

## ignore_on_cluster_for_replicated_named_collections_queries {#ignore_on_cluster_for_replicated_named_collections_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Игнорирует предложение ON CLUSTER в запросах управления реплицированными именованными коллекциями."}]}]}/>

Игнорирует предложение ON CLUSTER в запросах управления реплицированными именованными коллекциями.

## ignore_on_cluster_for_replicated_udf_queries {#ignore_on_cluster_for_replicated_udf_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорирует предложение ON CLUSTER для запросов управления реплицируемыми UDF.

## implicit_select {#implicit_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "A new setting."}]}]}/>

Разрешает выполнять простые запросы SELECT без начального ключевого слова SELECT, что упрощает использование в режиме калькулятора. Например, `1 + 2` становится допустимым запросом.

В `clickhouse-local` этот режим включён по умолчанию и может быть явно отключён.

## implicit_table_at_top_level {#implicit_table_at_top_level} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "Новая настройка, используемая в clickhouse-local"}]}]}/>

Если настройка не пуста, запросы без FROM на верхнем уровне будут читать из этой таблицы вместо system.one.

Она используется в clickhouse-local для обработки входных данных.
Пользователь может явно задать эту настройку, но она не предназначена для такого типа использования.

Подзапросы не затрагиваются этой настройкой (ни скалярные, ни подзапросы в FROM или IN).
SELECT на верхнем уровне цепочек UNION, INTERSECT, EXCEPT обрабатываются единообразно и затрагиваются этой настройкой, независимо от их группировки в скобках.
Не определено, как эта настройка влияет на представления и распределённые запросы.

Настройка принимает имя таблицы (тогда таблица берётся из текущей базы данных) или полное имя в формате 'database.table'.
И имя базы данных, и имя таблицы должны указываться без кавычек — допускаются только простые идентификаторы.

## implicit_transaction {#implicit_transaction} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Если настройка включена и запрос ещё не выполняется внутри транзакции, запрос оборачивается в полную транзакцию (begin + commit или rollback).

## inject_random_order_for_select_without_order_by {#inject_random_order_for_select_without_order_by} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

Если параметр включён, в запросы SELECT без предложения ORDER BY автоматически добавляется 'ORDER BY rand()'.
Применяется только при глубине подзапроса = 0. Вложенные подзапросы и INSERT INTO ... SELECT не затрагиваются.
Если верхнеуровневая конструкция — UNION, 'ORDER BY rand()' добавляется к каждому дочернему запросу независимо.
Полезно только для тестирования и разработки (отсутствие ORDER BY приводит к недетерминированным результатам запросов).

## input_format_parallel_parsing {#input_format_parallel_parsing} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает параллельный парсинг данных с сохранением порядка. Поддерживается только для форматов [TabSeparated (TSV)](/interfaces/formats/TabSeparated), [TSKV](/interfaces/formats/TSKV), [CSV](/interfaces/formats/CSV) и [JSONEachRow](/interfaces/formats/JSONEachRow).

Возможные значения:

- 1 — включено.
- 0 — отключено.

## insert_allow_materialized_columns {#insert_allow_materialized_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если настройка включена, допускается указание материализованных столбцов в INSERT.

## insert_deduplicate {#insert_deduplicate} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает дедупликацию блоков при выполнении `INSERT` (для таблиц Replicated\*).

Возможные значения:

- 0 — отключено.
- 1 — включено.

По умолчанию блоки, вставляемые в реплицируемые таблицы оператором `INSERT`, дедуплицируются (см. [Data Replication](../../engines/table-engines/mergetree-family/replication.md)).
Для реплицируемых таблиц по умолчанию дедуплицируются только 100 последних блоков для каждой партиции (см. [replicated_deduplication_window](merge-tree-settings.md/#replicated_deduplication_window), [replicated_deduplication_window_seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds)).
Для нереплицируемых таблиц см. [non_replicated_deduplication_window](merge-tree-settings.md/#non_replicated_deduplication_window).

## insert&#95;deduplication&#95;token {#insert_deduplication_token}

Эта настройка позволяет пользователю задать собственную семантику дедупликации в MergeTree/ReplicatedMergeTree.
Например, указывая уникальное значение для этой настройки в каждом операторе INSERT,
пользователь может избежать дедупликации одинаковых вставленных данных.

Возможные значения:

* Любая строка

`insert_deduplication_token` используется для дедупликации *только* если он непустой.

Для реплицируемых таблиц по умолчанию только 100 самых последних вставок для каждой партиции подвергаются дедупликации (см. [replicated&#95;deduplication&#95;window](merge-tree-settings.md/#replicated_deduplication_window), [replicated&#95;deduplication&#95;window&#95;seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds)).
Для нереплицируемых таблиц см. [non&#95;replicated&#95;deduplication&#95;window](merge-tree-settings.md/#non_replicated_deduplication_window).

:::note
`insert_deduplication_token` работает на уровне партиции (так же, как контрольная сумма `insert_deduplication`). Несколько партиций могут иметь один и тот же `insert_deduplication_token`.
:::

Пример:

```sql
CREATE TABLE test_table
( A Int64 )
ENGINE = MergeTree
ORDER BY A
SETTINGS non_replicated_deduplication_window = 100;

INSERT INTO test_table SETTINGS insert_deduplication_token = 'test' VALUES (1);

-- следующая вставка не будет дедуплицирована, поскольку insert_deduplication_token отличается
INSERT INTO test_table SETTINGS insert_deduplication_token = 'test1' VALUES (1);

-- следующая вставка будет дедуплицирована, поскольку insert_deduplication_token
-- совпадает с одним из предыдущих
INSERT INTO test_table SETTINGS insert_deduplication_token = 'test' VALUES (2);

SELECT * FROM test_table

┌─A─┐
│ 1 │
└───┘
┌─A─┐
│ 1 │
└───┘
```


## insert_keeper_fault_injection_probability {#insert_keeper_fault_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

Приблизительная вероятность сбоя запроса к Keeper во время вставки. Допустимое значение находится в интервале [0.0f, 1.0f].

## insert_keeper_fault_injection_seed {#insert_keeper_fault_injection_seed} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 — случайное начальное значение (seed), иначе значение настройки

## insert&#95;keeper&#95;max&#95;retries {#insert_keeper_max_retries}

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "20"},{"label": "Enable reconnections to Keeper on INSERT, improve reliability"}]}]} />

Эта настройка задаёт максимальное количество повторных попыток выполнения запросов к ClickHouse Keeper (или ZooKeeper) при вставке в реплицированную таблицу MergeTree. Для повторных попыток учитываются только те запросы к Keeper, которые завершились с ошибкой из‑за сетевой ошибки, тайм-аута сессии Keeper или тайм-аута запроса.

Возможные значения:

* Положительное целое число.
* 0 — повторные попытки отключены.

Значение по умолчанию в Cloud: `20`.

Повторные попытки запросов к Keeper выполняются после некоторой задержки. Эти задержки контролируются следующими настройками: `insert_keeper_retry_initial_backoff_ms`, `insert_keeper_retry_max_backoff_ms`.
Первая повторная попытка выполняется после задержки `insert_keeper_retry_initial_backoff_ms`. Последующие задержки будут рассчитаны следующим образом:

```
timeout = min(insert_keeper_retry_max_backoff_ms, latest_timeout * 2)
```

Например, если `insert_keeper_retry_initial_backoff_ms=100`, `insert_keeper_retry_max_backoff_ms=10000` и `insert_keeper_max_retries=8`, то таймауты будут равны `100, 200, 400, 800, 1600, 3200, 6400, 10000`.

Помимо отказоустойчивости, повторные попытки призваны улучшить опыт работы пользователя — они позволяют избежать возврата ошибки во время выполнения INSERT, если Keeper был перезапущен, например, из‑за обновления.


## insert_keeper_retry_initial_backoff_ms {#insert_keeper_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Начальный тайм-аут (в миллисекундах) перед повторной попыткой неудавшегося запроса к Keeper во время выполнения запроса INSERT

Возможные значения:

- Положительное целое число.
- 0 — нет тайм-аута

## insert_keeper_retry_max_backoff_ms {#insert_keeper_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное время ожидания (в миллисекундах) для повторной попытки неудачного запроса к Keeper при выполнении запроса INSERT

Возможные значения:

- Положительное целое число
- 0 — максимальное время ожидания не ограничено

## insert_null_as_default {#insert_null_as_default} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает вставку [значений по умолчанию](/sql-reference/statements/create/table#default_values) вместо [NULL](/sql-reference/syntax#null) в столбцы с не [Nullable](/sql-reference/data-types/nullable) типом данных.
Если тип столбца не Nullable и эта настройка отключена, то вставка `NULL` приводит к исключению. Если тип столбца Nullable, то значения `NULL` вставляются как есть, независимо от этой настройки.

Эта настройка применяется к запросам [INSERT ... SELECT](../../sql-reference/statements/insert-into.md/#inserting-the-results-of-select). Обратите внимание, что подзапросы `SELECT` могут быть объединены с помощью оператора `UNION ALL`.

Возможные значения:

- 0 — вставка `NULL` в не Nullable столбец приводит к исключению.
- 1 — вместо `NULL` вставляется значение столбца по умолчанию.

## insert_quorum {#insert_quorum} 

<SettingsInfoBlock type="UInt64Auto" default_value="0" />

:::note
Этот параметр не применяется к SharedMergeTree, см. раздел [Согласованность SharedMergeTree](/cloud/reference/shared-merge-tree#consistency) для получения подробной информации.
:::

Включает режим кворумной записи.

- Если `insert_quorum < 2`, кворумная запись отключена.
- Если `insert_quorum >= 2`, кворумная запись включена.
- Если `insert_quorum = 'auto'`, в качестве размера кворума используется большинство реплик (`number_of_replicas / 2 + 1`).

Кворумная запись

`INSERT` считается успешным только в том случае, если ClickHouse удаётся корректно записать данные на число реплик, равное `insert_quorum`, в течение `insert_quorum_timeout`. Если по какой-либо причине количество реплик с успешной записью не достигает `insert_quorum`, запись считается неуспешной, и ClickHouse удаляет вставленный блок со всех реплик, на которые данные уже были записаны.

Когда `insert_quorum_parallel` отключён, все реплики в кворуме согласованы, т. е. они содержат данные всех предыдущих запросов `INSERT` (последовательность `INSERT` линеаризуется). При чтении данных, записанных с использованием `insert_quorum`, и отключённом `insert_quorum_parallel` вы можете включить последовательную согласованность для запросов `SELECT`, используя [select_sequential_consistency](#select_sequential_consistency).

ClickHouse генерирует исключение:

- Если количество доступных реплик на момент запроса меньше, чем `insert_quorum`.
- Когда `insert_quorum_parallel` отключён и выполняется попытка записи данных, в то время как предыдущий блок ещё не был вставлен на `insert_quorum` реплик. Эта ситуация может возникнуть, если пользователь пытается выполнить ещё один запрос `INSERT` к той же таблице до завершения предыдущего с `insert_quorum`.

См. также:

- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_parallel {#insert_quorum_parallel} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "По умолчанию используются параллельные кворумные вставки. Они значительно удобнее, чем последовательные кворумные вставки"}]}]}/>

:::note
Этот параметр не применяется к SharedMergeTree, см. [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency) для получения дополнительной информации.
:::

Включает или отключает параллелизм для кворумных запросов `INSERT`. Если включён, можно отправлять дополнительные запросы `INSERT`, пока предыдущие ещё не завершены. Если отключён, дополнительные вставки в ту же таблицу будут отклонены.

Возможные значения:

- 0 — Отключён.
- 1 — Включён.

См. также:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_timeout {#insert_quorum_timeout} 

<SettingsInfoBlock type="Milliseconds" default_value="600000" />

Таймаут ожидания кворума при записи, в миллисекундах. Если этот интервал истёк и запись ещё не произошла, ClickHouse сгенерирует исключение, и клиент должен повторить запрос, чтобы записать тот же блок в ту же или любую другую реплику.

См. также:

- [insert_quorum](#insert_quorum)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_select_deduplicate {#insert_select_deduplicate} 

<SettingsInfoBlock type="BoolAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "auto"},{"label": "New setting"}]}]}/>

Включает или отключает дедупликацию блоков для `INSERT SELECT` (для таблиц с движком Replicated\*).
Эта настройка переопределяет `insert_deduplicate` для запросов `INSERT SELECT`.
У этой настройки есть три возможных значения:

- 0 — дедупликация отключена для запроса `INSERT SELECT`.
- 1 — дедупликация включена для запроса `INSERT SELECT`. Если результат запроса SELECT нестабилен, генерируется исключение.
- auto — дедупликация включена, если `insert_deduplicate` включена и результат запроса SELECT стабилен, в противном случае — отключена.

## insert&#95;shard&#95;id {#insert_shard_id}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если значение не равно `0`, задаёт сегмент таблицы [Distributed](/engines/table-engines/special/distributed), в который данные будут синхронно вставляться.

Если значение `insert_shard_id` некорректно, сервер выбросит исключение.

Чтобы получить количество сегментов в кластере `requested_cluster`, вы можете проверить конфигурацию сервера или выполнить этот запрос:

```sql
SELECT uniq(shard_num) FROM system.clusters WHERE cluster = 'requested_cluster';
```

Возможные значения:

* 0 — отключено.
* Любое целое число от `1` до `shards_num` соответствующей таблицы [Distributed](/engines/table-engines/special/distributed).

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


## interactive_delay {#interactive_delay} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

Интервал в микросекундах, с которым выполняется проверка отмены выполнения запроса и отправка информации о его прогрессе.

## intersect_default_mode {#intersect_default_mode} 

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

Устанавливает режим по умолчанию для запросов INTERSECT. Возможные значения: пустая строка, 'ALL', 'DISTINCT'. Если значение пустое, запрос без указанного режима вызовет исключение.

## jemalloc_collect_profile_samples_in_trace_log {#jemalloc_collect_profile_samples_in_trace_log} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Собирать в журнал трассировки выборки операций выделения и освобождения памяти jemalloc.

## jemalloc_enable_profiler {#jemalloc_enable_profiler} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Включает профилировщик jemalloc для запроса. Jemalloc будет выполнять выборочное профилирование выделений и всех освобождений для этих выборочно отобранных выделений.
Профили можно сбрасывать командой SYSTEM JEMALLOC FLUSH PROFILE, которую можно использовать для анализа выделений.
Выборки также могут сохраняться в system.trace_log с использованием конфигурации jemalloc_collect_global_profile_samples_in_trace_log или с помощью настройки запроса jemalloc_collect_profile_samples_in_trace_log.
См. раздел [Профилирование выделений](/operations/allocation-profiling).

## join_algorithm {#join_algorithm} 

<SettingsInfoBlock type="JoinAlgorithm" default_value="direct,parallel_hash,hash" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "direct,parallel_hash,hash"},{"label": "'default' был объявлен устаревшим в пользу явно указанных алгоритмов JOIN, также parallel_hash теперь предпочитается вместо hash"}]}]}/>

Указывает, какой алгоритм [JOIN](../../sql-reference/statements/select/join.md) используется.

Можно указать несколько алгоритмов, и для конкретного запроса будет выбран один из доступных на основе типа/строгости JOIN и движка таблицы.

Возможные значения:

- grace_hash

Используется [Grace hash join](https://en.wikipedia.org/wiki/Hash_join#Grace_hash_join). Grace hash предоставляет вариант алгоритма, который обеспечивает эффективные сложные JOIN при ограниченном использовании памяти.

На первой фазе Grace hash join читает правую таблицу и разбивает её на N бакетов в зависимости от хеш-значения столбцов ключа (изначально N — это `grace_hash_join_initial_buckets`). Это делается таким образом, чтобы каждый бакет мог обрабатываться независимо. Строки из первого бакета добавляются в размещённую в памяти хеш-таблицу, а остальные сохраняются на диск. Если хеш-таблица превышает лимит памяти (например, заданный [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)), количество бакетов увеличивается и для каждой строки пересчитывается номер бакета. Любые строки, которые не принадлежат текущему бакету, сбрасываются и переназначаются.

Поддерживает `INNER/LEFT/RIGHT/FULL ALL/ANY JOIN`.

- hash

Используется [алгоритм hash join](https://en.wikipedia.org/wiki/Hash_join). Наиболее универсальная реализация, которая поддерживает все комбинации типа и строгости, а также несколько ключей JOIN, объединённых с помощью `OR` в секции `JOIN ON`.

При использовании алгоритма `hash` правая часть `JOIN` загружается в оперативную память.

- parallel_hash

Вариация `hash` join, которая разбивает данные на бакеты и параллельно строит несколько хеш-таблиц вместо одной, чтобы ускорить этот процесс.

При использовании алгоритма `parallel_hash` правая часть `JOIN` загружается в оперативную память.

- partial_merge

Вариация [алгоритма sort-merge](https://en.wikipedia.org/wiki/Sort-merge_join), в которой полностью сортируется только правая таблица.

`RIGHT JOIN` и `FULL JOIN` поддерживаются только со строгостью `ALL` (`SEMI`, `ANTI`, `ANY` и `ASOF` не поддерживаются).

При использовании алгоритма `partial_merge` ClickHouse сортирует данные и сбрасывает их на диск. Алгоритм `partial_merge` в ClickHouse немного отличается от классической реализации. Сначала ClickHouse сортирует правую таблицу по ключам JOIN блоками и создаёт min-max индекс для отсортированных блоков. Затем он сортирует части левой таблицы по `join key` и выполняет JOIN с правой таблицей. Min-max индекс также используется, чтобы пропускать ненужные блоки правой таблицы.

- direct

Алгоритм `direct` (также известный как nested loop) выполняет поиск в правой таблице, используя строки из левой таблицы в качестве ключей.
Он поддерживается специальными хранилищами, такими как [Dictionary](/engines/table-engines/special/dictionary), [EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md) и таблицами [MergeTree](/engines/table-engines/mergetree-family/mergetree).

Для таблиц MergeTree алгоритм проталкивает фильтры по ключам JOIN непосредственно на уровень хранилища. Это может быть более эффективно, когда ключ может использовать первичный ключевой индекс таблицы для поиска, иначе выполняется полное сканирование правой таблицы для каждого блока левой таблицы.

Поддерживает `INNER` и `LEFT` JOIN и только одностолбцовые ключи соединения по равенству без других условий.

- auto

Когда установлено значение `auto`, сначала пробуется `hash` join, и при превышении лимита памяти алгоритм на лету переключается на другой.

- full_sorting_merge

[Алгоритм sort-merge](https://en.wikipedia.org/wiki/Sort-merge_join) с полной сортировкой присоединяемых таблиц перед выполнением JOIN.

- prefer_partial_merge

ClickHouse всегда пытается использовать JOIN `partial_merge`, если это возможно, иначе используется `hash`. *Устарело*, то же, что и `partial_merge,hash`.

- default (устарело)

Устаревшее значение, пожалуйста, больше не используйте.
То же, что и `direct,hash`, то есть сначала выполняется direct join, затем hash join (в таком порядке).

## join_any_take_last_row {#join_any_take_last_row} 

<SettingsInfoBlock type="Bool" default_value="0" />

Изменяет поведение операций соединения со строгостью `ANY`.

:::note
Этот параметр применяется только к операциям `JOIN` с таблицами с движком [Join](../../engines/table-engines/special/join.md).
:::

Возможные значения:

- 0 — Если в правой таблице есть более одной совпадающей строки, соединяется только первая найденная строка.
- 1 — Если в правой таблице есть более одной совпадающей строки, соединяется только последняя найденная строка.

См. также:

- [Оператор JOIN](/sql-reference/statements/select/join)
- [Движок таблиц Join](../../engines/table-engines/special/join.md)
- [join_default_strictness](#join_default_strictness)

## join_default_strictness {#join_default_strictness} 

<SettingsInfoBlock type="JoinStrictness" default_value="ALL" />

Устанавливает строгость по умолчанию для [предложений JOIN](/sql-reference/statements/select/join).

Возможные значения:

- `ALL` — Если в правой таблице несколько совпадающих строк, ClickHouse создаёт [декартово произведение](https://en.wikipedia.org/wiki/Cartesian_product) из совпадающих строк. Это обычное поведение `JOIN` в стандартном SQL.
- `ANY` — Если в правой таблице несколько совпадающих строк, присоединяется только первая найденная. Если в правой таблице только одна совпадающая строка, результаты `ANY` и `ALL` совпадают.
- `ASOF` — Для соединения последовательностей с неопределённым соответствием.
- `Empty string` — Если в запросе не указано `ALL` или `ANY`, ClickHouse выдаёт исключение.

## join_on_disk_max_files_to_merge {#join_on_disk_max_files_to_merge} 

<SettingsInfoBlock type="UInt64" default_value="64" />

Ограничивает количество файлов, которые могут использоваться для параллельной сортировки в операциях MergeJoin, когда они выполняются на диске.

Чем больше значение настройки, тем больше используется оперативной памяти и тем меньше требуется операций ввода-вывода с диском.

Возможные значения:

- Любое положительное целое число, начиная с 2.

## join_output_by_rowlist_perkey_rows_threshold {#join_output_by_rowlist_perkey_rows_threshold} 

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "5"},{"label": "Нижний порог среднего количества строк на ключ в правой таблице, определяющий, следует ли выводить результат в виде списка строк при hash join."}]}]}/>

Нижний порог среднего количества строк на ключ в правой таблице, определяющий, следует ли выводить результат в виде списка строк при hash join.

## join_overflow_mode {#join_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, какое действие ClickHouse выполняет при достижении любого из следующих лимитов для операций JOIN:

- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)
- [max_rows_in_join](/operations/settings/settings#max_rows_in_join)

Возможные значения:

- `THROW` — ClickHouse выбрасывает исключение и прерывает операцию.
- `BREAK` — ClickHouse прерывает операцию и не выбрасывает исключение.

Значение по умолчанию: `THROW`.

**См. также**

- [Предложение JOIN](/sql-reference/statements/select/join)
- [Табличный движок JOIN](/engines/table-engines/special/join)

## join_runtime_bloom_filter_bytes {#join_runtime_bloom_filter_bytes} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "524288"},{"label": "Новая настройка"}]}]}/>

Размер в байтах bloom-фильтра, используемого в качестве runtime-фильтра для JOIN (см. настройку enable_join_runtime_filters).

## join_runtime_bloom_filter_hash_functions {#join_runtime_bloom_filter_hash_functions} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3"},{"label": "New setting"}]}]}/>

Количество хеш-функций в фильтре Блума, используемом как runtime-фильтр для операций JOIN (см. настройку enable_join_runtime_filters).

## join_runtime_bloom_filter_max_ratio_of_set_bits {#join_runtime_bloom_filter_max_ratio_of_set_bits} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Double" default_value="0.7" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0.7"},{"label": "Новая настройка"}]}]}/>

Если доля установленных битов в runtime bloom-фильтре превышает заданное значение, фильтр полностью отключается для снижения накладных расходов.

## join_runtime_filter_blocks_to_skip_before_reenabling {#join_runtime_filter_blocks_to_skip_before_reenabling} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "30"},{"label": "New setting"}]}]}/>

Количество блоков, которые пропускаются до попытки динамически снова включить runtime-фильтр, ранее отключённый из-за низкой эффективности фильтрации.

## join_runtime_filter_exact_values_limit {#join_runtime_filter_exact_values_limit} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "10000"},{"label": "Новая настройка"}]}]}/>

Максимальное количество элементов в runtime-фильтре, которые хранятся как есть в виде множества; при превышении этого порога фильтр переключается на Bloom-фильтр.

## join_runtime_filter_pass_ratio_threshold_for_disabling {#join_runtime_filter_pass_ratio_threshold_for_disabling} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Double" default_value="0.7" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0.7"},{"label": "Новая настройка"}]}]}/>

Если отношение количества прошедших строк к количеству проверенных строк больше этого порога, runtime-фильтр считается неэффективным и отключается на следующие `join_runtime_filter_blocks_to_skip_before_reenabling` блоки для снижения накладных расходов.

## join_to_sort_maximum_table_rows {#join_to_sort_maximum_table_rows} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "10000"},{"label": "Максимальное количество строк в правой таблице, используемое для определения, нужно ли пересортировать правую таблицу по ключу при выполнении LEFT или INNER JOIN"}]}]}/>

Максимальное количество строк в правой таблице, используемое для определения, нужно ли пересортировать правую таблицу по ключу при выполнении LEFT или INNER JOIN.

## join_to_sort_minimum_perkey_rows {#join_to_sort_minimum_perkey_rows} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "40"},{"label": "Нижний предел среднего количества строк на ключ в правой таблице для определения, нужно ли пересортировать правую таблицу по ключу в LEFT или INNER JOIN. Этот SETTING гарантирует, что оптимизация не будет применяться к разреженным ключам таблицы"}]}]}/>

Нижний предел среднего количества строк на ключ в правой таблице для определения, нужно ли пересортировать правую таблицу по ключу в LEFT или INNER JOIN. Этот SETTING гарантирует, что оптимизация не будет применяться к разреженным ключам таблицы

## join_use_nulls {#join_use_nulls} 

<SettingsInfoBlock type="Bool" default_value="0" />

Задает тип поведения операции [JOIN](../../sql-reference/statements/select/join.md). При объединении таблиц могут появляться пустые ячейки. ClickHouse заполняет их по-разному в зависимости от значения этой настройки.

Возможные значения:

- 0 — пустые ячейки заполняются значением по умолчанию для соответствующего типа поля.
- 1 — `JOIN` ведет себя так же, как в стандартном SQL. Тип соответствующего поля преобразуется в [Nullable](/sql-reference/data-types/nullable), а пустые ячейки заполняются значением [NULL](/sql-reference/syntax).

## joined_block_split_single_row {#joined_block_split_single_row} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает разбиение результата хеш‑соединения на фрагменты по строкам, соответствующим одной строке из левой таблицы.
Это может снизить потребление памяти в случае строки с большим количеством совпадений в правой таблице, но может увеличить нагрузку на CPU.
Обратите внимание, что для действия этой настройки параметр `max_joined_block_size_rows != 0` обязателен.
Параметр `max_joined_block_size_bytes` в сочетании с этой настройкой помогает избежать чрезмерного потребления памяти в случае несбалансированных данных, когда некоторые крупные строки имеют много совпадений в правой таблице.

## joined_subquery_requires_alias {#joined_subquery_requires_alias} 

<SettingsInfoBlock type="Bool" default_value="1" />

Требует, чтобы подзапросы и табличные функции, используемые в JOIN, имели псевдонимы для корректной квалификации имён.

## kafka_disable_num_consumers_limit {#kafka_disable_num_consumers_limit} 

<SettingsInfoBlock type="Bool" default_value="0" />

Отключает ограничение на `kafka_num_consumers`, зависящее от количества доступных ядер CPU.

## kafka_max_wait_ms {#kafka_max_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

Время ожидания в миллисекундах при чтении сообщений из [Kafka](/engines/table-engines/integrations/kafka) перед повторной попыткой.

Возможные значения:

- Положительное целое число.
- 0 — бесконечное время ожидания.

См. также:

- [Apache Kafka](https://kafka.apache.org/)

## keeper_map_strict_mode {#keeper_map_strict_mode} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включить дополнительные проверки во время операций с KeeperMap. Например, выбрасывать исключение при попытке вставки ключа, который уже существует.

## keeper_max_retries {#keeper_max_retries} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "10"},{"label": "Максимальное количество повторных попыток выполнения общих операций Keeper"}]}]}/>

Максимальное количество повторных попыток выполнения общих операций Keeper

## keeper_retry_initial_backoff_ms {#keeper_retry_initial_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "100"},{"label": "Начальная задержка перед повторной попыткой для общих операций Keeper"}]}]}/>

Начальная задержка перед повторной попыткой для общих операций Keeper

## keeper_retry_max_backoff_ms {#keeper_retry_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5000"},{"label": "Максимальный интервал ожидания (backoff) для общих операций Keeper"}]}]}/>

Максимальный интервал ожидания (backoff) для общих операций Keeper

## least_greatest_legacy_null_behavior {#least_greatest_legacy_null_behavior} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

При включении этого параметра функции `least` и `greatest` возвращают NULL, если один из их аргументов равен NULL.

## legacy_column_name_of_tuple_literal {#legacy_column_name_of_tuple_literal} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.7"},{"label": "0"},{"label": "Добавляйте этот параметр только из соображений совместимости. Имеет смысл установить значение 'true' при поэтапном (rolling) обновлении кластера с версии ниже 21.7 до более высокой"}]}]}/>

Перечисляет все имена элементов больших литералов кортежей в именах соответствующих столбцов вместо использования хеша. Этот параметр существует только из соображений совместимости. Имеет смысл установить значение 'true' при поэтапном (rolling) обновлении кластера с версии ниже 21.7 до более высокой.

## lightweight_delete_mode {#lightweight_delete_mode} 

<SettingsInfoBlock type="LightweightDeleteMode" default_value="alter_update" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "alter_update"},{"label": "Новая настройка"}]}]}/>

Режим внутреннего запроса на обновление, который выполняется как часть легковесного удаления.

Возможные значения:

- `alter_update` - выполняет запрос `ALTER UPDATE`, который создаёт тяжеловесную мутацию.
- `lightweight_update` - выполняет легковесное обновление, если это возможно, в противном случае выполняет `ALTER UPDATE`.
- `lightweight_update_force` - выполняет легковесное обновление, если это возможно, в противном случае выбрасывает исключение.

## lightweight_deletes_sync {#lightweight_deletes_sync} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "2"},{"label": "То же, что и `mutations_sync`, но контролирует только выполнение легковесных удалений"}]}]}/>

То же, что и [`mutations_sync`](#mutations_sync), но контролирует только выполнение легковесных удалений.

Возможные значения:

| Значение | Описание                                                                                                                                           |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`      | Мутации выполняются асинхронно.                                                                                                                    |
| `1`      | Запрос ожидает завершения легковесных удалений на текущем сервере.                                                                                 |
| `2`      | Запрос ожидает завершения легковесных удалений на всех репликах (если они есть).                                                                   |
| `3`      | Запрос ожидает завершения только на активных репликах. Поддерживается только для `SharedMergeTree`. Для `ReplicatedMergeTree` ведёт себя так же, как `mutations_sync = 2`. |

**См. также**

- [Синхронность запросов ALTER](../../sql-reference/statements/alter/index.md/#synchronicity-of-alter-queries)
- [Мутации](../../sql-reference/statements/alter/index.md/#mutations)

## limit {#limit} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает максимальное количество строк, которое можно получить из результата запроса. Корректирует значение, заданное предложением [LIMIT](/sql-reference/statements/select/limit), так, что лимит, указанный в запросе, не может превышать лимит, заданный этой настройкой.

Возможные значения:

- 0 — количество строк не ограничено.
- Положительное целое число.

## load_balancing {#load_balancing} 

<SettingsInfoBlock type="LoadBalancing" default_value="random" />

Указывает алгоритм выбора реплик для распределённой обработки запросов.

ClickHouse поддерживает следующие алгоритмы выбора реплик:

- [Случайный](#load_balancing-random) (по умолчанию)
- [Ближайший хост](#load_balancing-nearest_hostname)
- [По расстоянию Левенштейна для имён хостов](#load_balancing-hostname_levenshtein_distance)
- [По порядку](#load_balancing-in_order)
- [Первый или случайный](#load_balancing-first_or_random)
- [Циклический (round-robin)](#load_balancing-round_robin)

См. также:

- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

### Случайный режим (по умолчанию) {#load_balancing-random}

```sql
load_balancing = random
```

Количество ошибок подсчитывается для каждой реплики. Запрос отправляется на реплику с наименьшим количеством ошибок, а если таких несколько — на любую из них.
Недостатки: не учитывается близость сервера; если данные на репликах различаются, вы также получите разные данные.


### Имя ближайшего хоста {#load_balancing-nearest_hostname}

```sql
load_balancing = nearest_hostname
```

Количество ошибок подсчитывается для каждой реплики. Каждые 5 минут количество ошибок целочисленно делится на 2. Таким образом, число ошибок за недавний период рассчитывается с экспоненциальным сглаживанием. Если есть одна реплика с минимальным числом ошибок (то есть ошибки недавно возникли на других репликах), запрос отправляется на неё. Если есть несколько реплик с одинаковым минимальным числом ошибок, запрос отправляется на реплику с именем хоста, которое наиболее похоже на имя хоста сервера в конфигурационном файле (по количеству различных символов в одинаковых позициях, до минимальной длины обоих имён хоста).

Например, example01-01-1 и example01-01-2 отличаются в одной позиции, а example01-01-1 и example01-02-2 различаются в двух местах.
Этот метод может показаться примитивным, но он не требует внешних данных о топологии сети и не сравнивает IP-адреса, что было бы сложно для наших IPv6-адресов.

Таким образом, если есть эквивалентные реплики, предпочтение отдаётся наиболее близкой по имени.
Мы также можем предположить, что при отправке запроса на тот же сервер, при отсутствии сбоев, распределённый запрос также будет попадать на те же серверы. Поэтому, даже если на репликах размещены разные данные, запрос в основном будет возвращать одинаковые результаты.


### Расстояние Левенштейна для имён хостов {#load_balancing-hostname_levenshtein_distance}

```sql
load_balancing = hostname_levenshtein_distance
```

Аналогично `nearest_hostname`, но выполняет сравнение имени хоста на основе [расстояния Левенштейна](https://en.wikipedia.org/wiki/Levenshtein_distance). Например:

```text
example-clickhouse-0-0 ample-clickhouse-0-0
1

example-clickhouse-0-0 example-clickhouse-1-10
2

example-clickhouse-0-0 example-clickhouse-12-0
3
```


### По шагам {#load_balancing-in_order}

```sql
load_balancing = in_order
```

Реплики с одинаковым числом ошибок запрашиваются в том же порядке, в котором они указаны в конфигурации.
Этот метод подходит, когда вы точно знаете, какая реплика предпочтительна.


### Первый или случайный {#load_balancing-first_or_random}

```sql
load_balancing = first_or_random
```

Этот алгоритм выбирает первую реплику в наборе или случайную реплику, если первая недоступна. Он эффективен в топологиях с кросс-репликацией, но не приносит пользы в других конфигурациях.

Алгоритм `first_or_random` решает проблему алгоритма `in_order`. При использовании `in_order`, если одна реплика выходит из строя, следующая получает двойную нагрузку, в то время как остальные реплики обрабатывают обычный объем трафика. При использовании алгоритма `first_or_random` нагрузка равномерно распределяется между репликами, которые все еще доступны.

Можно явно задать, какая реплика считается первой, с помощью настройки `load_balancing_first_offset`. Это дает больше контроля при перебалансировке нагрузки от запросов между репликами.


### Циклический алгоритм (Round Robin) {#load_balancing-round_robin}

```sql
load_balancing = round_robin
```

Этот алгоритм использует политику round-robin по репликам с одинаковым числом ошибок (при этом учитываются только запросы с политикой `round_robin`).


## load_balancing_first_offset {#load_balancing_first_offset} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Реплика, на которую предпочтительно отправлять запрос при использовании стратегии балансировки нагрузки FIRST_OR_RANDOM.

## load_marks_asynchronously {#load_marks_asynchronously} 

<SettingsInfoBlock type="Bool" default_value="0" />

Загружать метки MergeTree асинхронно

## local_filesystem_read_method {#local_filesystem_read_method} 

<SettingsInfoBlock type="String" default_value="pread_threadpool" />

Метод чтения данных из локальной файловой системы, один из следующих: read, pread, mmap, io_uring, pread_threadpool.

Метод `io_uring` является экспериментальным и не работает для Log, TinyLog, StripeLog, File, Set и Join, а также других таблиц с файлами, допускающими дозапись, при наличии конкурентных операций чтения и записи.
Если вы читаете различные статьи об `io_uring` в Интернете, не поддавайтесь создаваемому вокруг него ажиотажу. Это не более эффективный метод чтения файлов, за исключением случаев с очень большим количеством мелких операций ввода-вывода, что не характерно для ClickHouse. Нет причин включать `io_uring`.

## local_filesystem_read_prefetch {#local_filesystem_read_prefetch} 

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать предварительную подзагрузку при чтении данных из локальной файловой системы.

## lock_acquire_timeout {#lock_acquire_timeout} 

<SettingsInfoBlock type="Seconds" default_value="120" />

Определяет, сколько секунд запрос на блокировку ожидает до завершения с ошибкой.

Таймаут блокировки используется для защиты от взаимоблокировок при выполнении операций чтения/записи с таблицами. Когда таймаут истекает и запрос на блокировку завершается с ошибкой, сервер ClickHouse генерирует исключение "Locking attempt timed out! Possible deadlock avoided. Client should retry." с кодом ошибки `DEADLOCK_AVOIDED`.

Возможные значения:

- Положительное целое число (в секундах).
- 0 — без таймаута блокировки.

## log&#95;comment {#log_comment}

Задаёт значение для поля `log_comment` таблицы [system.query&#95;log](../system-tables/query_log.md) и текст комментария для серверного лога.

Может использоваться для повышения читаемости серверных логов. Также помогает выбрать запросы, связанные с тестом, из `system.query_log` после запуска [clickhouse-test](../../development/tests.md).

Возможные значения:

* Любая строка длиной не более [max&#95;query&#95;size](#max_query_size). Если значение `max_query_size` превышено, сервер генерирует исключение.

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


## log_formatted_queries {#log_formatted_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет записывать отформатированные запросы в системную таблицу [system.query_log](../../operations/system-tables/query_log.md) (заполняет столбец `formatted_query` в [system.query_log](../../operations/system-tables/query_log.md)).

Возможные значения:

- 0 — Отформатированные запросы не записываются в системную таблицу.
- 1 — Отформатированные запросы записываются в системную таблицу.

## log_processors_profiles {#log_processors_profiles} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Enable by default"}]}]}/>

Записывать в таблицу `system.processors_profile_log` время, которое процессор тратит на выполнение и ожидание данных.

См. также:

- [`system.processors_profile_log`](../../operations/system-tables/processors_profile_log.md)
- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md/#explain-pipeline)

## log_profile_events {#log_profile_events} 

<SettingsInfoBlock type="Bool" default_value="1" />

Записывать статистику производительности запросов в журналы `query_log`, `query_thread_log` и `query_views_log`.

## log&#95;queries {#log_queries}

<SettingsInfoBlock type="Bool" default_value="1" />

Настройка логирования запросов.

Запросы, отправленные в ClickHouse при включении этого параметра, записываются в лог в соответствии с правилами серверного параметра конфигурации [query&#95;log](../../operations/server-configuration-parameters/settings.md/#query_log).

Пример:

```text
log_queries=1
```


## log_queries_cut_to_length {#log_queries_cut_to_length} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

Если длина запроса превышает заданный порог (в байтах), запрос усекается при записи в журнал запросов. Также ограничивается длина запроса, выводимого в обычный текстовый журнал.

## log_queries_min_query_duration_ms {#log_queries_min_query_duration_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Если параметр включен (имеет ненулевое значение), запросы, выполняющиеся быстрее указанного значения этой настройки, не будут записываться в журнал (можно рассматривать это как аналог `long_query_time` для [MySQL Slow Query Log](https://dev.mysql.com/doc/refman/5.7/slow-query-log.html)), и это по сути означает, что вы не найдете их в следующих таблицах:

- `system.query_log`
- `system.query_thread_log`

В журнал будут попадать только запросы со следующими типами:

- `QUERY_FINISH`
- `EXCEPTION_WHILE_PROCESSING`

- Тип: миллисекунды
- Значение по умолчанию: 0 (любой запрос)

## log&#95;queries&#95;min&#95;type {#log_queries_min_type}

<SettingsInfoBlock type="LogQueriesType" default_value="QUERY_START" />

Минимальный тип записей в `query_log`.

Возможные значения:

* `QUERY_START` (`=1`)
* `QUERY_FINISH` (`=2`)
* `EXCEPTION_BEFORE_START` (`=3`)
* `EXCEPTION_WHILE_PROCESSING` (`=4`)

Настройку можно использовать, чтобы ограничить, какие записи будут попадать в `query_log`. Например, если вас интересуют только ошибки, вы можете использовать `EXCEPTION_WHILE_PROCESSING`:

```text
log_queries_min_type='EXCEPTION_WHILE_PROCESSING'
```


## log_queries_probability {#log_queries_probability} 

<SettingsInfoBlock type="Float" default_value="1" />

Позволяет записывать в системные таблицы [query_log](../../operations/system-tables/query_log.md), [query_thread_log](../../operations/system-tables/query_thread_log.md) и [query_views_log](../../operations/system-tables/query_views_log.md) только часть запросов, случайным образом отобранных с указанной вероятностью. Это помогает снизить нагрузку при большом количестве запросов в секунду.

Возможные значения:

- 0 — запросы не записываются в системные таблицы.
- Положительное число с плавающей запятой в диапазоне [0..1]. Например, если значение настройки равно `0.5`, в системные таблицы записывается примерно половина запросов.
- 1 — все запросы записываются в системные таблицы.

## log_query_settings {#log_query_settings} 

<SettingsInfoBlock type="Bool" default_value="1" />

Записывать настройки запросов в query_log и журнал спанов OpenTelemetry.

## log&#95;query&#95;threads {#log_query_threads}

<SettingsInfoBlock type="Bool" default_value="0" />

Настройка логирования потоков выполнения запросов.

Потоки запросов записываются в таблицу [system.query&#95;thread&#95;log](../../operations/system-tables/query_thread_log.md). Этот параметр имеет эффект только если [log&#95;queries](#log_queries) имеет значение true. Потоки запросов, выполняемые ClickHouse при такой настройке, логируются в соответствии с правилами серверного параметра конфигурации [query&#95;thread&#95;log](/operations/server-configuration-parameters/settings#query_thread_log).

Возможные значения:

* 0 — Отключено.
* 1 — Включено.

**Пример**

```text
log_query_threads=1
```


## log&#95;query&#95;views {#log_query_views}

<SettingsInfoBlock type="Bool" default_value="1" />

Настройка логирования представлений запросов.

Когда запрос, выполняемый ClickHouse при включённой данной настройке, имеет связанные представления (материализованные или live-представления), сведения о них записываются в журнал, задаваемый параметром конфигурации сервера [query&#95;views&#95;log](/operations/server-configuration-parameters/settings#query_views_log).

Пример:

```text
log_query_views=1
```


## low_cardinality_allow_in_native_format {#low_cardinality_allow_in_native_format} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает или запрещает использование типа данных [LowCardinality](../../sql-reference/data-types/lowcardinality.md) с форматом [Native](/interfaces/formats/Native).

Если использование `LowCardinality` запрещено, сервер ClickHouse преобразует столбцы типа `LowCardinality` в обычные для запросов `SELECT` и преобразует обычные столбцы в столбцы типа `LowCardinality` для запросов `INSERT`.

Этот параметр главным образом нужен для сторонних клиентов, которые не поддерживают тип данных `LowCardinality`.

Возможные значения:

- 1 — использование `LowCardinality` не ограничено;
- 0 — использование `LowCardinality` ограничено.

## low_cardinality_max_dictionary_size {#low_cardinality_max_dictionary_size} 

<SettingsInfoBlock type="UInt64" default_value="8192" />

Задает максимальный размер (в строках) общего глобального словаря для типа данных [LowCardinality](../../sql-reference/data-types/lowcardinality.md), который может быть записан в файловую систему хранилища. Этот параметр предотвращает проблемы с ОЗУ при неограниченном росте словаря. Все данные, которые не могут быть закодированы из‑за ограничения максимального размера словаря, ClickHouse записывает обычным способом.

Возможные значения:

- Любое положительное целое число.

## low_cardinality_use_single_dictionary_for_part {#low_cardinality_use_single_dictionary_for_part} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает использование единственного словаря для части данных.

По умолчанию сервер ClickHouse отслеживает размер словарей, и если словарь переполняется, сервер начинает записывать следующий. Чтобы запретить создание нескольких словарей, установите `low_cardinality_use_single_dictionary_for_part = 1`.

Возможные значения:

- 1 — Создание нескольких словарей для части данных запрещено.
- 0 — Создание нескольких словарей для части данных не запрещено.

## low_priority_query_wait_time_ms {#low_priority_query_wait_time_ms} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1000"},{"label": "Новый параметр."}]}]}/>

Когда используется механизм приоритизации запросов (см. настройку `priority`), запросы с низким приоритетом ожидают завершения запросов с более высоким приоритетом. Этот параметр задает время ожидания.

## make_distributed_plan {#make_distributed_plan} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Новая экспериментальная настройка."}]}]}/>

Создаёт распределённый план запроса.

## materialize_skip_indexes_on_insert {#materialize_skip_indexes_on_insert} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Добавлена настройка, позволяющая отключить материализацию пропускающих индексов при вставке"}]}]}/>

Определяет, будут ли операции INSERT строить и сохранять пропускающие индексы. Если отключена, пропускающие индексы будут создаваться и сохраняться только [во время слияний](merge-tree-settings.md/#materialize_skip_indexes_on_merge) или явным вызовом [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index).

См. также [exclude_materialize_skip_indexes_on_insert](#exclude_materialize_skip_indexes_on_insert).

## materialize_statistics_on_insert {#materialize_statistics_on_insert} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Добавлена новая настройка, позволяющая отключить материализацию статистики при вставке"}]}]}/>

Если включено, операции INSERT создают и материализуют статистику. Если отключено, статистика будет создаваться и сохраняться во время слияний или при явном выполнении MATERIALIZE STATISTICS.

## materialize_ttl_after_modify {#materialize_ttl_after_modify} 

<SettingsInfoBlock type="Bool" default_value="1" />

Применять TTL к ранее записанным данным после выполнения запроса ALTER MODIFY TTL

## materialized_views_ignore_errors {#materialized_views_ignore_errors} 

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет игнорировать ошибки при обработке MATERIALIZED VIEW и передавать исходный блок в таблицу независимо от связанных materialized view.

## materialized_views_squash_parallel_inserts {#materialized_views_squash_parallel_inserts} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "Добавлена настройка для сохранения старого поведения при необходимости."}]}]}/>

Схлопывать параллельные вставки одного запроса INSERT в целевую таблицу materialized view, чтобы уменьшить количество создаваемых частей.
Если установлено в значение false и `parallel_view_processing` включён, запрос INSERT будет создавать в целевой таблице отдельную часть для каждого `max_insert_thread`.

## max_analyze_depth {#max_analyze_depth} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

Максимальное число операций анализа, выполняемых интерпретатором.

## max_ast_depth {#max_ast_depth} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальная глубина вложенности синтаксического дерева запроса. При превышении этого значения генерируется исключение.

:::note
В настоящее время это ограничение не проверяется во время разбора запроса, а только после него.
Это означает, что во время разбора может быть создано слишком глубокое синтаксическое дерево,
но запрос всё равно завершится с ошибкой.
:::

## max_ast_elements {#max_ast_elements} 

<SettingsInfoBlock type="UInt64" default_value="50000" />

Максимальное количество элементов в синтаксическом дереве запроса. При превышении этого значения генерируется исключение.

:::note
В настоящее время это не проверяется во время разбора (парсинга) запроса, а только после его завершения.
Это означает, что в процессе разбора может быть создано слишком глубокое синтаксическое дерево,
но запрос в итоге завершится с ошибкой.
:::

## max_autoincrement_series {#max_autoincrement_series} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "A new setting"}]}]}/>

Ограничение на количество серий, создаваемых функцией `generateSerialID`.

Поскольку каждая серия соответствует узлу в Keeper, рекомендуется не создавать более пары миллионов таких серий.

## max_backup_bandwidth {#max_backup_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость чтения в байтах в секунду для конкретной резервной копии на сервере. Ноль означает отсутствие ограничений.

## max_block_size {#max_block_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

В ClickHouse данные обрабатываются блоками, которые представляют собой наборы частей столбцов. Внутренние циклы обработки для одного блока эффективны, но при обработке каждого блока возникают заметные накладные расходы.

Параметр `max_block_size` задаёт рекомендуемое максимальное количество строк в одном блоке при загрузке данных из таблиц. Блоки размера `max_block_size` не всегда загружаются из таблицы: если ClickHouse определяет, что нужно извлечь меньше данных, обрабатывается блок меньшего размера.

Размер блока не должен быть слишком маленьким, чтобы избежать заметных накладных расходов при обработке каждого блока. Он также не должен быть слишком большим, чтобы запросы с оператором LIMIT выполнялись быстро после обработки первого блока. При выборе значения `max_block_size` цель состоит в том, чтобы избежать чрезмерного потребления памяти при извлечении большого количества столбцов в нескольких потоках и сохранить хотя бы некоторую локальность кэша.

## max_bytes_before_external_group_by {#max_bytes_before_external_group_by} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Значение по умолчанию в Cloud: половина объёма памяти на реплику.

Включает или отключает выполнение `GROUP BY` во внешней памяти.
(См. [GROUP BY во внешней памяти](/sql-reference/statements/select/group-by#group-by-in-external-memory))

Возможные значения:

- Максимальный объём ОЗУ (в байтах), который может быть использован одной операцией [GROUP BY](/sql-reference/statements/select/group-by).
- `0` — `GROUP BY` во внешней памяти отключён.

:::note
Если использование памяти во время операций GROUP BY превышает этот порог в байтах,
активируется режим «external aggregation» (выгрузка данных на диск).

Рекомендуемое значение — половина доступной системной памяти.
:::

## max_bytes_before_external_sort {#max_bytes_before_external_sort} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Значение по умолчанию в Cloud: половина объёма памяти на реплику.

Включает или отключает выполнение операторов `ORDER BY` с использованием внешней памяти. См. [ORDER BY Implementation Details](../../sql-reference/statements/select/order-by.md#implementation-details).  
Если использование памяти во время операции ORDER BY превышает этот порог в байтах, активируется режим «external sorting» (сброс данных на диск).

Возможные значения:

- Максимальный объём ОЗУ (в байтах), который может быть использован одной операцией [ORDER BY](../../sql-reference/statements/select/order-by.md).  
  Рекомендуемое значение — половина доступной системной памяти.
- `0` — выполнение `ORDER BY` с использованием внешней памяти отключено.

## max_bytes_before_remerge_sort {#max_bytes_before_remerge_sort} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

В случае ORDER BY с LIMIT, когда использование памяти превышает заданный порог, выполняются дополнительные этапы слияния блоков перед финальным слиянием, чтобы сохранить только первые LIMIT строк.

## max_bytes_in_distinct {#max_bytes_in_distinct} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт состояния (в несжатом виде) в памяти, которое
используется хеш-таблицей при выполнении DISTINCT.

## max_bytes_in_join {#max_bytes_in_join} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер в байтах хеш-таблицы, используемой при объединении таблиц.

Этот параметр применяется к операциям [SELECT ... JOIN](/sql-reference/statements/select/join)
и к [движку таблицы Join](/engines/table-engines/special/join).

Если запрос содержит операции JOIN, ClickHouse проверяет эту SETTING для каждого промежуточного результата.

При достижении лимита ClickHouse может выполнить различные действия. Используйте
SETTING [join_overflow_mode](/operations/settings/settings#join_overflow_mode), чтобы выбрать действие.

Возможные значения:

- Положительное целое число.
- 0 — контроль использования памяти отключен.

## max_bytes_in_set {#max_bytes_in_set} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт (несжатых данных), используемых множеством в операторе IN,
создаваемым подзапросом.

## max_bytes_ratio_before_external_group_by {#max_bytes_ratio_before_external_group_by} 

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "Автоматическая выгрузка на диск включена по умолчанию."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Доля доступной памяти, которая может быть использована под `GROUP BY`. После достижения этого значения
для агрегации используется внешняя память.

Например, если значение установлено на `0.6`, `GROUP BY` сможет использовать 60% доступной памяти
(для сервера/пользователя/слияний) в начале выполнения, после чего
начнет использовать внешнюю агрегацию.

## max_bytes_ratio_before_external_sort {#max_bytes_ratio_before_external_sort} 

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "Enable automatic spilling to disk by default."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting."}]}]}/>

Доля доступной памяти, которую допускается использовать для `ORDER BY`. После достижения этого порога будет использоваться внешняя сортировка.

Например, если установлено значение `0.6`, `ORDER BY` позволит использовать `60%` доступной памяти (для сервера/пользователя/слияний) в начале выполнения, после чего начнёт использовать внешнюю сортировку.

Учтите, что `max_bytes_before_external_sort` по-прежнему учитывается: сброс на диск будет выполняться только в том случае, если размер сортируемого блока превышает `max_bytes_before_external_sort`.

## max_bytes_to_read {#max_bytes_to_read} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт (несжатых данных), которое можно прочитать из таблицы при выполнении запроса.
Ограничение проверяется для каждого обрабатываемого фрагмента данных, применяется только к самому глубоко вложенному табличному выражению и при чтении с удалённого сервера проверяется только на удалённом сервере.

## max_bytes_to_read_leaf {#max_bytes_to_read_leaf} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт (несжатых данных), которое может быть прочитано из локальной
таблицы на листьевом узле при выполнении распределённого запроса. Хотя распределённые запросы
могут отправлять несколько подзапросов к каждому сегменту (листьевому узлу), этот лимит будет
проверяться только на этапе чтения на листьевых узлах и будет игнорироваться на этапе
слияния результатов на корневом узле.

Например, кластер состоит из 2 сегментов, и каждый сегмент содержит таблицу со
100 байтами данных. Распределённый запрос, который должен прочитать все данные
из обеих таблиц с параметром `max_bytes_to_read=150`, завершится с ошибкой, так как в сумме будет
200 байт. Запрос с `max_bytes_to_read_leaf=150` завершится успешно, поскольку
листьевые узлы прочитают максимум по 100 байт.

Ограничение проверяется для каждого обрабатываемого фрагмента данных.

:::note
Эта настройка ведёт себя нестабильно при `prefer_localhost_replica=1`.
:::

## max_bytes_to_sort {#max_bytes_to_sort} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт до начала сортировки. Если для выполнения операции ORDER BY требуется обработать больше несжатых байт, чем указано, поведение будет определяться настройкой `sort_overflow_mode`, которая по умолчанию имеет значение `throw`.

## max_bytes_to_transfer {#max_bytes_to_transfer} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт (несжатых данных), которое может быть передано на удалённый сервер или сохранено во временной таблице при выполнении GLOBAL IN/JOIN.

## max_columns_to_read {#max_columns_to_read} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество столбцов, которые можно прочитать из таблицы в одном запросе.
Если запрос требует чтения большего количества столбцов, чем указано, генерируется
исключение.

:::tip
Этот параметр полезен для предотвращения чрезмерно сложных запросов.
:::

Значение `0` означает отсутствие ограничения.

## max_compress_block_size {#max_compress_block_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Максимальный размер блоков несжатых данных перед сжатием при записи в таблицу. По умолчанию — 1 048 576 (1 MiB). Указание меньшего размера блока обычно приводит к немного более низкому коэффициенту сжатия, небольшому увеличению скорости сжатия и распаковки за счёт локальности в кэше, а также снижению потребления памяти.

:::note
Это параметр для экспертов; не изменяйте его, если вы только начинаете работать с ClickHouse.
:::

Не путайте блоки для сжатия (фрагмент памяти, состоящий из байтов) с блоками для обработки запросов (набор строк из таблицы).

## max&#95;concurrent&#95;queries&#95;for&#95;all&#95;users {#max_concurrent_queries_for_all_users}

<SettingsInfoBlock type="UInt64" default_value="0" />

Генерирует исключение, если значение этой настройки меньше или равно текущему количеству одновременно обрабатываемых запросов.

Пример: `max_concurrent_queries_for_all_users` можно установить равным 99 для всех пользователей, а администратор базы данных может установить его равным 100 для себя, чтобы выполнять диагностические запросы даже при перегрузке сервера.

Изменение настройки для одного запроса или пользователя не влияет на другие запросы.

Возможные значения:

* Положительное целое число.
* 0 — без ограничения.

**Пример**

```xml
<max_concurrent_queries_for_all_users>99</max_concurrent_queries_for_all_users>
```

**См. также**

* [max&#95;concurrent&#95;queries](/operations/server-configuration-parameters/settings#max_concurrent_queries)


## max&#95;concurrent&#95;queries&#95;for&#95;user {#max_concurrent_queries_for_user}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество одновременно обрабатываемых запросов для одного пользователя.

Возможные значения:

* Положительное целое число.
* 0 — без ограничения.

**Пример**

```xml
<max_concurrent_queries_for_user>5</max_concurrent_queries_for_user>
```


## max_distributed_connections {#max_distributed_connections} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

Максимальное количество одновременных соединений с удалёнными серверами для распределённой обработки одного запроса к одной distributed таблице. Рекомендуется задавать значение не меньше количества серверов в кластере.

Следующие параметры используются только при создании distributed таблиц (и при запуске сервера), поэтому нет смысла изменять их в процессе работы.

## max_distributed_depth {#max_distributed_depth} 

<SettingsInfoBlock type="UInt64" default_value="5" />

Ограничивает максимальную глубину рекурсивных запросов для таблиц [Distributed](../../engines/table-engines/special/distributed.md).

Если значение превышено, сервер выбрасывает исключение.

Возможные значения:

- Положительное целое число.
- 0 — неограниченная глубина.

## max_download_buffer_size {#max_download_buffer_size} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

Максимальный размер буфера для параллельной загрузки (например, для URL-движка) для каждого потока.

## max_download_threads {#max_download_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="4" />

Максимальное количество потоков для загрузки данных (например, в движке URL).

## max_estimated_execution_time {#max_estimated_execution_time} 

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Разделение max_execution_time и max_estimated_execution_time"}]}]}/>

Максимальное оценочное время выполнения запроса в секундах. Проверяется для каждого блока данных, когда истекает [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed).

## max_execution_speed {#max_execution_speed} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное число обрабатываемых строк в секунду. Проверяется на каждом блоке данных, когда истекает
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed).
Если скорость выполнения слишком высока, она будет снижена.

## max_execution_speed_bytes {#max_execution_speed_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт, обрабатываемых в секунду при выполнении запроса. Проверяется для каждого блока данных, когда
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)
истекает. Если скорость выполнения слишком высока, она будет ограничена.

## max_execution_time {#max_execution_time} 

<SettingsInfoBlock type="Seconds" default_value="0" />

Максимальное время выполнения запроса в секундах.

Параметр `max_execution_time` может быть немного неочевидным.
Он работает на основе интерполяции относительно текущей скорости выполнения запроса
(это поведение контролируется параметром [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)).

ClickHouse прервёт запрос, если прогнозируемое время выполнения превысит
указанное значение `max_execution_time`. По умолчанию `timeout_before_checking_execution_speed`
установлен в 10 секунд. Это означает, что через 10 секунд выполнения запроса ClickHouse
начинает оценивать общее время выполнения. Если, например, `max_execution_time`
установлен в 3600 секунд (1 час), ClickHouse завершит запрос, если оценочное
время превысит этот предел в 3600 секунд. Если вы установите `timeout_before_checking_execution_speed`
в 0, ClickHouse будет использовать фактическое (настенное) время как основу для `max_execution_time`.

Если время выполнения запроса превышает указанное количество секунд, поведение будет
определяться параметром `timeout_overflow_mode`, который по умолчанию имеет значение `throw`.

:::note
Таймаут проверяется, и запрос может быть остановлен только в определённых местах в процессе обработки данных.
В настоящее время запрос не может быть остановлен во время слияния состояний агрегации или во время анализа запроса,
и фактическое время выполнения будет больше значения этой настройки.
:::

## max&#95;execution&#95;time&#95;leaf {#max_execution_time_leaf}

<SettingsInfoBlock type="Seconds" default_value="0" />

Семантически похож на [`max_execution_time`](#max_execution_time), но
применяется только к листовым узлам для распределённых или удалённых запросов.

Например, если мы хотим ограничить время выполнения на листовом узле до `10s`, но
не иметь ограничения на начальном узле, то вместо использования `max_execution_time` в
настройках вложенного подзапроса:

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t SETTINGS max_execution_time = 10));
```

Мы можем использовать `max_execution_time_leaf` в качестве настройки запроса:

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t)) SETTINGS max_execution_time_leaf = 10;
```


## max_expanded_ast_elements {#max_expanded_ast_elements} 

<SettingsInfoBlock type="UInt64" default_value="500000" />

Максимальный размер синтаксического дерева запроса по числу узлов после раскрытия алиасов и звёздочки.

## max_fetch_partition_retries_count {#max_fetch_partition_retries_count} 

<SettingsInfoBlock type="UInt64" default_value="5" />

Количество повторных попыток при получении партиции с другого узла.

## max_final_threads {#max_final_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

Устанавливает максимальное количество параллельных потоков на этапе чтения данных запроса `SELECT` с модификатором [FINAL](/sql-reference/statements/select/from#final-modifier).

Возможные значения:

- Положительное целое число.
- 0 или 1 — отключено. Запросы `SELECT` выполняются в одном потоке.

## max_http_get_redirects {#max_http_get_redirects} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество переходов при перенаправлениях HTTP GET. Обеспечивает дополнительные меры безопасности, предотвращающие перенаправление ваших запросов на неожиданные сервисы со стороны вредоносного сервера.\n\nРассмотрим ситуацию, когда внешний сервер перенаправляет на другой адрес, но этот адрес выглядит как внутренний для инфраструктуры компании, и, отправив HTTP-запрос на внутренний сервер, вы можете обратиться к внутреннему API из внутренней сети, обойти аутентификацию или даже отправлять запросы к другим сервисам, таким как Redis или Memcached. Если у вас нет внутренней инфраструктуры (включая что-либо, запущенное на localhost) или вы доверяете серверу, разрешать перенаправления безопасно. Однако имейте в виду, что если URL использует HTTP вместо HTTPS, вам придется доверять не только удалённому серверу, но также вашему интернет‑провайдеру и каждой промежуточной сети.

## max&#95;hyperscan&#95;regexp&#95;length {#max_hyperscan_regexp_length}

<SettingsInfoBlock type="UInt64" default_value="0" />

Определяет максимальную длину каждого регулярного выражения в [функциях множественного сопоставления Hyperscan](/sql-reference/functions/string-search-functions#multiMatchAny).

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
Исключение: Длина регулярного выражения слишком велика.
```

**Смотрите также**

* [max&#95;hyperscan&#95;regexp&#95;total&#95;length](#max_hyperscan_regexp_total_length)


## max&#95;hyperscan&#95;regexp&#95;total&#95;length {#max_hyperscan_regexp_total_length}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает максимальную суммарную длину всех регулярных выражений в каждой [функции Hyperscan для поиска с несколькими совпадениями](/sql-reference/functions/string-search-functions#multiMatchAny).

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
Исключение: Суммарная длина регулярных выражений слишком велика.
```

**См. также**

* [max&#95;hyperscan&#95;regexp&#95;length](#max_hyperscan_regexp_length)


## max_insert_block_size {#max_insert_block_size} 

**Псевдонимы**: `max_insert_block_size_rows`

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048449" />

Максимальный размер блоков (в количестве строк), формируемых для вставки в таблицу.

Этот параметр управляет формированием блоков при разборе форматов. Когда сервер разбирает строчно-ориентированные форматы ввода (CSV, TSV, JSONEachRow и т. д.) или формат Values из любого интерфейса (HTTP, clickhouse-client с inline‑данными, gRPC, протокол PostgreSQL wire), он использует это значение, чтобы определить момент выдачи блока.
Примечание: при использовании clickhouse-client или clickhouse-local для чтения из файла сам клиент разбирает данные, и эта настройка применяется на стороне клиента.

Блок выдаётся, когда выполнено одно из условий:

- Минимальные пороги (И): одновременно достигнуты и `min_insert_block_size_rows`, и `min_insert_block_size_bytes`
- Максимальные пороги (ИЛИ): достигнут либо `max_insert_block_size`, либо `max_insert_block_size_bytes`

Значение по умолчанию немного больше, чем max_block_size. Причина в том, что некоторые движки таблиц (`*MergeTree`) формируют на диске часть данных (data part) для каждого вставленного блока, и это довольно крупная сущность. Аналогично, таблицы `*MergeTree` сортируют данные во время вставки, и достаточно большой размер блока позволяет отсортировать больше данных в оперативной памяти.

Возможные значения:

- Положительное целое число.

## max_insert_block_size_bytes {#max_insert_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "0"},{"label": "Новая настройка, которая позволяет контролировать размер блоков в байтах при разборе данных в Row Input Format."}]}]}/>

Максимальный размер блоков (в байтах), формируемых при вставке в таблицу.

Эта настройка работает совместно с max_insert_block_size_rows и управляет формированием блоков в том же контексте. См. max_insert_block_size_rows для подробной информации о том, когда и как применяются эти настройки.

Возможные значения:

- Положительное целое число.
- 0 — настройка не участвует в формировании блоков.

## max_insert_delayed_streams_for_parallel_write {#max_insert_delayed_streams_for_parallel_write} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество потоков (столбцов), для которых откладывается запись финальной части данных. По умолчанию — автоматически (100, если базовое хранилище поддерживает параллельную запись, например S3; иначе — отключено).

## max_insert_threads {#max_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество потоков для выполнения запроса `INSERT SELECT`.

Возможные значения:

- 0 (или 1) — `INSERT SELECT` без параллельного выполнения.
- Положительное целое число, больше 1.

Значение по умолчанию в Cloud:

- `1` для узлов с 8 GiB памяти
- `2` для узлов с 16 GiB памяти
- `4` для более крупных узлов

Параллельное выполнение `INSERT SELECT` имеет эффект только в том случае, если часть `SELECT` выполняется параллельно, см. настройку [`max_threads`](#max_threads).
Более высокие значения приводят к большему расходу памяти.

## max_joined_block_size_bytes {#max_joined_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "4194304"},{"label": "New setting"}]}]}/>

Максимальный размер блока в байтах для результата JOIN (если алгоритм JOIN это поддерживает). 0 означает отсутствие ограничений.

## max_joined_block_size_rows {#max_joined_block_size_rows} 

<SettingsInfoBlock type="UInt64" default_value="65409" />

Максимальный размер блока для результата JOIN (если алгоритм соединения поддерживает данный параметр). Значение 0 означает отсутствие ограничения.

## max_limit_for_vector_search_queries {#max_limit_for_vector_search_queries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1000"},{"label": "Новая настройка"}]}]}/>

Запросы SELECT с LIMIT, превышающим значение этой настройки, не могут использовать индексы векторного сходства. Это помогает предотвращать переполнения памяти в индексах векторного сходства.

## max_local_read_bandwidth {#max_local_read_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость локального чтения в байтах в секунду.

## max_local_write_bandwidth {#max_local_write_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость локальной записи в байтах в секунду.

## max_memory_usage {#max_memory_usage} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Значение по умолчанию в Cloud: зависит от объема RAM на реплике.

Максимальный объем RAM, используемый для выполнения запроса на одном сервере.
Значение `0` означает отсутствие ограничения.

Этот параметр не учитывает объем доступной памяти или общий объем
памяти на машине. Ограничение применяется к одному запросу на одном сервере.

Можно использовать `SHOW PROCESSLIST`, чтобы увидеть текущее потребление памяти для каждого запроса.
Пиковое потребление памяти отслеживается для каждого запроса и записывается в лог.

Потребление памяти отслеживается не полностью для состояний следующих агрегатных функций
с аргументами типов `String` и `Array`:

- `min`
- `max`
- `any`
- `anyLast`
- `argMin`
- `argMax`

Потребление памяти также ограничивается параметрами [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)
и [`max_server_memory_usage`](/operations/server-configuration-parameters/settings#max_server_memory_usage).

## max&#95;memory&#95;usage&#95;for&#95;user {#max_memory_usage_for_user}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объем оперативной памяти, используемой для выполнения запросов пользователя на одном сервере. Ноль означает отсутствие ограничения.

По умолчанию объем не ограничен (`max_memory_usage_for_user = 0`).

См. также описание [`max_memory_usage`](/operations/settings/settings#max_memory_usage).

Например, если вы хотите установить `max_memory_usage_for_user` в 1000 байт для пользователя `clickhouse_read`, вы можете использовать следующий оператор

```sql
ALTER USER clickhouse_read SETTINGS max_memory_usage_for_user = 1000;
```

Вы можете убедиться, что всё сработало, выйдя из клиента, снова войдя в него, а затем вызвав функцию `getSetting`:

```sql
SELECT getSetting('max_memory_usage_for_user');
```


## max_network_bandwidth {#max_network_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает скорость обмена данными по сети в байтах в секунду. Этот параметр применяется для каждого запроса.

Возможные значения:

- Положительное целое число.
- 0 — ограничение пропускной способности отключено.

## max_network_bandwidth_for_all_users {#max_network_bandwidth_for_all_users} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает скорость обмена данными по сети, измеряемую в байтах в секунду. Этот параметр применяется ко всем одновременно выполняемым запросам на сервере.

Возможные значения:

- Положительное целое число.
- 0 — ограничение скорости передачи данных отключено.

## max_network_bandwidth_for_user {#max_network_bandwidth_for_user} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает скорость обмена данными по сети в байтах в секунду. Этот параметр применяется ко всем одновременно выполняющимся запросам одного пользователя.

Возможные значения:

- Положительное целое число.
- 0 — контроль скорости передачи данных отключён.

## max_network_bytes {#max_network_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает объём данных (в байтах), которые принимаются или передаются по сети при выполнении запроса. Эта настройка применяется к каждому отдельному запросу.

Возможные значения:

- Положительное целое число.
- 0 — контроль объёма данных отключён.

## max_number_of_partitions_for_independent_aggregation {#max_number_of_partitions_for_independent_aggregation} 

<SettingsInfoBlock type="UInt64" default_value="128" />

Максимальное количество партиций в таблице, при котором применяется оптимизация.

## max_os_cpu_wait_time_ratio_to_throw {#max_os_cpu_wait_time_ratio_to_throw} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Setting values were changed and backported to 25.4"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

Максимально допустимое отношение времени ожидания CPU в ОС (метрика OSCPUWaitMicroseconds) к времени занятости (метрика OSCPUVirtualTimeMicroseconds), при котором запросы могут быть отклонены. Для вычисления вероятности используется линейная интерполяция между минимальным и максимальным значениями этого отношения; при максимальном значении вероятность равна 1.

## max_parallel_replicas {#max_parallel_replicas} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "По умолчанию использовать до 1000 параллельных реплик."}]}]}/>

Максимальное количество реплик для каждого сегмента при выполнении запроса.

Возможные значения:

- Положительное целое число.

**Дополнительная информация**

Этот параметр может приводить к различным результатам в зависимости от используемых настроек.

:::note
Этот параметр приведёт к некорректным результатам, если используются JOIN или подзапросы и не все таблицы удовлетворяют определённым требованиям. Подробности см. в разделе [Distributed Subqueries and max_parallel_replicas](/operations/settings/settings#max_parallel_replicas).
:::

### Параллельная обработка с использованием ключа `SAMPLE` {#parallel-processing-using-sample-key}

Запрос может быть обработан быстрее, если он выполняется параллельно на нескольких серверах. Однако производительность запроса может ухудшиться в следующих случаях:

- Положение ключа выборки в ключе партиционирования не позволяет эффективно выполнять сканирование по диапазонам.
- Добавление ключа выборки в таблицу снижает эффективность фильтрации по другим столбцам.
- Ключ выборки представляет собой выражение с высокой вычислительной стоимостью.
- Распределение задержек в кластере имеет «длинный хвост», поэтому опрос большего числа серверов увеличивает суммарную задержку выполнения запроса.

### Параллельная обработка с помощью [parallel_replicas_custom_key](#parallel_replicas_custom_key) {#parallel-processing-using-parallel_replicas_custom_keyparallel_replicas_custom_key}

Этот параметр полезен для любой реплицированной таблицы.

## max_parser_backtracks {#max_parser_backtracks} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000000"},{"label": "Ограничение сложности разбора"}]}]}/>

Максимальное количество откатов парсера (сколько раз он пытается разные варианты при рекурсивном нисходящем разборе).

## max_parser_depth {#max_parser_depth} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Ограничивает максимальную глубину рекурсии в парсере рекурсивного спуска. Позволяет контролировать размер стека.

Возможные значения:

- Положительное целое число.
- 0 — глубина рекурсии не ограничена.

## max_parsing_threads {#max_parsing_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "Добавлена отдельная настройка для управления количеством потоков при параллельном разборе данных из файлов"}]}]}/>

Максимальное количество потоков для разбора данных во входных форматах, поддерживающих параллельный разбор. По умолчанию значение определяется автоматически.

## max_partition_size_to_drop {#max_partition_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

Ограничение на размер партиций, которые можно удалять во время выполнения запросов. Значение `0` означает, что вы можете удалять партиции без каких-либо ограничений.

Значение по умолчанию в Cloud: 1 ТБ.

:::note
Этот параметр запроса переопределяет одноимённый параметр сервера, см. [max_partition_size_to_drop](/operations/server-configuration-parameters/settings#max_partition_size_to_drop)
:::

## max_partitions_per_insert_block {#max_partitions_per_insert_block} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.5"},{"label": "100"},{"label": "Добавлен лимит на количество партиций в одном блоке"}]}]}/>

Ограничивает максимальное количество партиций в одном вставляемом блоке,
и если блок содержит слишком много партиций, выбрасывается исключение.

- Положительное целое число.
- `0` — неограниченное количество партиций.

**Подробности**

При вставке данных ClickHouse вычисляет количество партиций во
вставляемом блоке. Если количество партиций превышает
`max_partitions_per_insert_block`, ClickHouse либо записывает предупреждение в лог, либо выбрасывает
исключение в зависимости от значения `throw_on_max_partitions_per_insert_block`. Исключения имеют
следующий текст:

> "Too many partitions for a single INSERT block (`partitions_count` partitions, limit is " + toString(max_partitions) + ").
  The limit is controlled by the 'max_partitions_per_insert_block' setting.
  A large number of partitions is a common misconception. It will lead to severe
  negative performance impact, including slow server startup, slow INSERT queries
  and slow SELECT queries. Recommended total number of partitions for a table is
  under 1000..10000. Please note, that partitioning is not intended to speed up
  SELECT queries (ORDER BY key is sufficient to make range queries fast).
  Partitions are intended for data manipulation (DROP PARTITION, etc)."

:::note
Этот параметр является защитным порогом, поскольку использование большого числа партиций — распространённое заблуждение.
:::

## max_partitions_to_read {#max_partitions_to_read} 

<SettingsInfoBlock type="Int64" default_value="-1" />

Ограничивает максимальное количество партиций, к которым можно получить доступ в одном запросе.

Значение настройки, заданное при создании таблицы, может быть переопределено на уровне запроса.

Возможные значения:

- Положительное целое число
- `-1` — без ограничений (по умолчанию)

:::note
Вы также можете указать настройку MergeTree [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read) в настройках таблицы.
:::

## max_parts_to_move {#max_parts_to_move} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1000"},{"label": "Новая настройка"}]}]}/>

Ограничивает количество частей, которые могут быть перемещены в одном запросе. Ноль означает отсутствие ограничений.

## max_projection_rows_to_use_projection_index {#max_projection_rows_to_use_projection_index} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

Если количество строк, которые нужно прочитать из индекса проекции, меньше или равно этому порогу, ClickHouse попытается использовать индекс проекции при выполнении запроса.

## max_query_size {#max_query_size} 

<SettingsInfoBlock type="UInt64" default_value="262144" />

Максимальное количество байт в строке запроса, которую разбирает SQL-парсер.
Данные в части VALUES запросов INSERT обрабатываются отдельным потоковым парсером (который потребляет O(1) RAM), и на них это ограничение не распространяется.

:::note
`max_query_size` нельзя установить внутри SQL-запроса (например, `SELECT now() SETTINGS max_query_size=10000`), потому что ClickHouse должен выделить буфер для разбора запроса, а размер этого буфера определяется настройкой `max_query_size`, которая должна быть задана до выполнения запроса.
:::

## max_read_buffer_size {#max_read_buffer_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

Максимальный размер буфера при чтении данных из файловой системы.

## max_read_buffer_size_local_fs {#max_read_buffer_size_local_fs} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

Максимальный размер буфера для чтения из локальной файловой системы. Если установлено значение 0, будет использоваться max_read_buffer_size.

## max_read_buffer_size_remote_fs {#max_read_buffer_size_remote_fs} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер буфера для чтения из удалённой файловой системы. Если установлено значение 0, будет использоваться max_read_buffer_size.

## max_recursive_cte_evaluation_depth {#max_recursive_cte_evaluation_depth} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1000"},{"label": "Максимальная глубина вычисления рекурсивного CTE"}]}]}/>

Максимальная глубина вычисления рекурсивного CTE

## max_remote_read_network_bandwidth {#max_remote_read_network_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость сетевого обмена данными при чтении (в байтах в секунду).

## max_remote_write_network_bandwidth {#max_remote_write_network_bandwidth} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость передачи данных по сети при записи, в байтах в секунду.

## max_replica_delay_for_distributed_queries {#max_replica_delay_for_distributed_queries} 

<SettingsInfoBlock type="UInt64" default_value="300" />

Отключает отстающие реплики для распределённых запросов. См. [Replication](../../engines/table-engines/mergetree-family/replication.md).

Задаёт время в секундах. Если отставание реплики больше или равно заданному значению, эта реплика не используется.

Возможные значения:

- Положительное целое число.
- 0 — отставание реплик не проверяется.

Чтобы исключить использование любой реплики с ненулевым отставанием, установите этот параметр в 1.

Используется при выполнении `SELECT` из distributed таблицы, указывающей на реплицируемые таблицы.

## max_result_bytes {#max_result_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает размер результата в байтах (в несжатом виде). Запрос будет остановлен после обработки блока данных, если порог достигнут,
но последний блок результата не будет обрезан, поэтому размер результата может быть больше порогового значения.

**Особенности**

Для этого порога учитывается размер результата в памяти.
Даже если размер результата небольшой, он может ссылаться на более крупные структуры данных в памяти,
представляющие словари столбцов LowCardinality и Arenas столбцов AggregateFunction,
так что порог может быть превышен, несмотря на небольшой размер результата.

:::warning
Этот параметр довольно низкоуровневый и должен использоваться с осторожностью
:::

## max_result_rows {#max_result_rows} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Значение по умолчанию в Cloud: `0`.

Ограничивает количество строк в результате. Ограничение также проверяется для подзапросов и на удалённых серверах при выполнении частей распределённого запроса.
Если значение равно `0`, ограничение не применяется.

Запрос будет остановлен после обработки блока данных, если порог достигнут, но
последний блок результата не будет усечён, поэтому размер результата может быть
больше порогового значения.

## max_reverse_dictionary_lookup_cache_size_bytes {#max_reverse_dictionary_lookup_cache_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "104857600"},{"label": "Новая настройка. Максимальный размер в байтах кэша обратного поиска по словарю в рамках одного запроса, используемого функцией `dictGetKeys`. Кэш хранит сериализованные кортежи ключей для каждого значения атрибута, чтобы избежать повторного сканирования словаря в пределах одного и того же запроса."}]}]}/>

Максимальный размер в байтах кэша обратного поиска по словарю в рамках одного запроса, используемого функцией `dictGetKeys`. Кэш хранит сериализованные кортежи ключей для каждого значения атрибута, чтобы избежать повторного сканирования словаря в пределах одного и того же запроса. При достижении лимита элементы вытесняются по алгоритму LRU. Установите 0, чтобы отключить кэширование.

## max_rows_in_distinct {#max_rows_in_distinct} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество уникальных строк при использовании DISTINCT.

## max_rows_in_join {#max_rows_in_join} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает количество строк в хеш-таблице, которая используется при объединении таблиц.

Этот параметр применяется к операциям [SELECT ... JOIN](/sql-reference/statements/select/join)
и табличному движку [Join](/engines/table-engines/special/join).

Если запрос содержит несколько операций JOIN, ClickHouse проверяет этот параметр для каждого промежуточного результата.

Когда достигается лимит, ClickHouse может выполнить различные действия. Используйте
настройку [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode), чтобы выбрать нужное действие.

Возможные значения:

- Положительное целое число.
- `0` — неограниченное количество строк.

## max_rows_in_set {#max_rows_in_set} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество строк для набора данных в выражении IN, созданном из подзапроса.

## max_rows_in_set_to_optimize_join {#max_rows_in_set_to_optimize_join} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Отключить оптимизацию join, так как она мешает оптимизации чтения в порядке следования"}]}]}/>

Максимальный размер множества, используемого для фильтрации соединяемых таблиц по наборам строк друг друга до выполнения соединения.

Возможные значения:

- 0 — отключить.
- Любое положительное целое число.

## max_rows_to_group_by {#max_rows_to_group_by} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество уникальных ключей, полученных при агрегации. Этот параметр
позволяет ограничить потребление памяти при агрегации.

Если при агрегации в GROUP BY генерируется больше строк (уникальных ключей GROUP BY),
чем указано в этой настройке, поведение будет определяться параметром
`group_by_overflow_mode`, который по умолчанию равен `throw`, но может быть
переключён в режим приблизительного GROUP BY.

## max_rows_to_read {#max_rows_to_read} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество строк, которое может быть прочитано из таблицы при выполнении запроса.
Ограничение проверяется для каждого обрабатываемого фрагмента данных, применяется только к
наиболее глубокому табличному выражению и при чтении с удалённого сервера проверяется только на
удалённом сервере.

## max_rows_to_read_leaf {#max_rows_to_read_leaf} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество строк, которые могут быть прочитаны из локальной таблицы на leaf-узле при
выполнении распределённого запроса. Хотя распределённые запросы могут выполнять несколько подзапросов
к каждому сегменту (leaf), это ограничение будет проверяться только на этапе чтения на
leaf-узлах и игнорироваться на этапе слияния результатов на корневом узле.

Например, кластер состоит из 2 сегментов, и каждый сегмент содержит таблицу со
100 строками. Распределённый запрос, который должен прочитать все данные из обеих
таблиц с настройкой `max_rows_to_read=150`, завершится с ошибкой, так как в сумме будет
200 строк. Запрос с `max_rows_to_read_leaf=150` выполнится успешно, поскольку leaf-узлы
прочитают максимум по 100 строк.

Ограничение проверяется для каждого обрабатываемого фрагмента данных.

:::note
Этот параметр работает нестабильно при `prefer_localhost_replica=1`.
:::

## max_rows_to_sort {#max_rows_to_sort} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество строк, участвующих в сортировке. Это позволяет ограничить потребление памяти при сортировке.
Если для операции ORDER BY необходимо обработать больше строк, чем указано,
то поведение будет определяться параметром `sort_overflow_mode`, который по умолчанию имеет значение `throw`.

## max_rows_to_transfer {#max_rows_to_transfer} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество строк, которое может быть передано на удалённый сервер или сохранено во
временной таблице при выполнении части GLOBAL IN/JOIN.

## max&#95;sessions&#95;for&#95;user {#max_sessions_for_user}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное число одновременных сеансов для одного аутентифицированного пользователя сервера ClickHouse.

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
    <!-- Пользователь Alice может подключаться к серверу ClickHouse не более одного раза одновременно. -->
    <Alice>
        <profile>single_session_user</profile>
    </Alice>
    <!-- Пользователь Bob может использовать 2 одновременных сессии. -->
    <Bob>
        <profile>two_sessions_profile</profile>
    </Bob>
    <!-- Пользователь Charles может использовать неограниченное количество одновременных сессий. -->
    <Charles>
        <profile>unlimited_sessions_profile</profile>
    </Charles>
</users>
```

Возможные значения:

* Положительное целое число
* `0` — бесконечное количество одновременных сеансов (по умолчанию)


## max_size_to_preallocate_for_aggregation {#max_size_to_preallocate_for_aggregation} 

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "Включает оптимизацию для более крупных таблиц."}]}, {"id": "row-2","items": [{"label": "22.12"},{"label": "100000000"},{"label": "Оптимизирует производительность."}]}]}/>

Допустимое количество элементов для предварительного выделения памяти во всех хеш-таблицах в сумме перед агрегацией.

## max_size_to_preallocate_for_joins {#max_size_to_preallocate_for_joins} 

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "100000000"},{"label": "Новая настройка."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "Включает оптимизацию для более крупных таблиц."}]}]}/>

Максимальное количество элементов, для которых допускается предварительное выделение памяти во всех хеш-таблицах суммарно перед выполнением операции JOIN

## max_streams_for_files_processing_in_cluster_functions {#max_streams_for_files_processing_in_cluster_functions} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Добавлена новая настройка, позволяющая ограничить количество потоков для обработки файлов в *Cluster table functions"}]}]}/>

Если значение параметра не равно нулю, ограничивает количество потоков, читающих данные из файлов в *Cluster table functions.

## max_streams_for_merge_tree_reading {#max_streams_for_merge_tree_reading} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если параметр не равен нулю, ограничивает количество потоков чтения для таблиц MergeTree.

## max_streams_multiplier_for_merge_tables {#max_streams_multiplier_for_merge_tables} 

<SettingsInfoBlock type="Float" default_value="5" />

Запрашивать больше потоков при чтении из таблицы Merge. Потоки будут распределены между таблицами, которые использует таблица Merge. Это позволяет более равномерно распределять работу между потоками и особенно полезно, когда объединяемые таблицы различаются по размеру.

## max_streams_to_max_threads_ratio {#max_streams_to_max_threads_ratio} 

<SettingsInfoBlock type="Float" default_value="1" />

Позволяет использовать больше источников, чем количество потоков, чтобы более равномерно распределять работу между потоками. Предполагается, что это временное решение, так как в будущем можно будет сделать количество источников равным количеству потоков, однако каждый источник будет динамически выбирать доступную ему работу.

## max_subquery_depth {#max_subquery_depth} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Если запрос содержит больше вложенных подзапросов, чем указано в параметре, генерируется
исключение.

:::tip
Это позволяет ввести дополнительную проверку и защитить пользователей вашего
кластера от написания чрезмерно сложных запросов.
:::

## max_table_size_to_drop {#max_table_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

Ограничение на удаление таблиц при выполнении запроса. Значение `0` означает, что вы можете удалять любые таблицы без ограничений.

Значение по умолчанию в Cloud: 1 ТБ.

:::note
Этот параметр запроса переопределяет эквивалентный параметр на стороне сервера, см. [max_table_size_to_drop](/operations/server-configuration-parameters/settings#max_table_size_to_drop)
:::

## max_temporary_columns {#max_temporary_columns} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество временных столбцов, которые должны одновременно находиться в оперативной памяти
при выполнении запроса, включая константные столбцы. Если запрос в результате промежуточных
вычислений создает в памяти больше временных столбцов, чем указано, будет сгенерировано исключение.

:::tip
Этот параметр полезен для предотвращения чрезмерно сложных запросов.
:::

Значение `0` означает отсутствие ограничения.

## max_temporary_data_on_disk_size_for_query {#max_temporary_data_on_disk_size_for_query} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объём данных во временных файлах на диске в байтах для всех
одновременно выполняемых запросов.

Возможные значения:

- Положительное целое число.
- `0` — без ограничений (значение по умолчанию)

## max_temporary_data_on_disk_size_for_user {#max_temporary_data_on_disk_size_for_user} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объем данных, потребляемый временными файлами на диске (в байтах), для всех одновременно выполняемых запросов пользователя.

Возможные значения:

- Положительное целое число.
- `0` — без ограничений (значение по умолчанию)

## max_temporary_non_const_columns {#max_temporary_non_const_columns} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Подобно настройке `max_temporary_columns`, задаёт максимальное количество временных столбцов, которые
должны одновременно находиться в оперативной памяти при выполнении запроса, но без учёта константных
столбцов.

:::note
Константные столбцы формируются довольно часто при выполнении запроса, но практически не требуют
вычислительных ресурсов.
:::

## max_threads {#max_threads} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

Максимальное количество потоков обработки запроса, не включая потоки для получения данных с удалённых серверов (см. параметр [`max_distributed_connections`](/operations/settings/settings#max_distributed_connections)).

Этот параметр применяется к потокам, которые параллельно выполняют одни и те же этапы конвейера обработки запроса.
Например, при чтении из таблицы, если возможно параллельно вычислять выражения с функциями, выполнять фильтрацию с помощью `WHERE` и предварительную агрегацию для `GROUP BY` с использованием как минимум `max_threads` потоков, то будет задействовано значение `max_threads`.

Для запросов, которые завершаются быстро из‑за `LIMIT`, можно установить меньшее значение `max_threads`.
Например, если необходимое количество записей находится в каждом блоке и `max_threads = 8`, то извлекается 8 блоков, хотя было бы достаточно прочитать только один.
Чем меньше значение `max_threads`, тем меньше потребляется памяти.

По умолчанию значение `max_threads` соответствует количеству аппаратных потоков, доступных для ClickHouse.
Без SMT (например, Intel HyperThreading) это соответствует количеству ядер CPU.

Для пользователей ClickHouse Cloud значение по умолчанию отображается как `auto(N)`, где N соответствует vCPU‑размеру вашего сервиса, например 2vCPU/8GiB, 4vCPU/16GiB и т. д.
Список всех размеров сервисов см. на вкладке настроек в консоли Cloud.

## max_threads_for_indexes {#max_threads_for_indexes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество потоков, обрабатывающих индексы.

## max_untracked_memory {#max_untracked_memory} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

Мелкие операции выделения и освобождения памяти группируются в локальной для потока переменной и отслеживаются или профилируются только тогда, когда их суммарный объем (в абсолютном выражении) превышает заданное значение. Если это значение больше, чем `memory_profiler_step`, оно будет автоматически снижено до `memory_profiler_step`.

## memory_overcommit_ratio_denominator {#memory_overcommit_ratio_denominator} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "Включить функцию memory overcommit по умолчанию"}]}]}/>

Он задаёт «мягкий» лимит памяти, действующий после достижения глобального жёсткого лимита.
Это значение используется для расчёта коэффициента overcommit для запроса.
Нулевое значение означает, что запрос будет пропущен.
Подробнее см. в разделе [memory overcommit](memory-overcommit.md).

## memory_overcommit_ratio_denominator_for_user {#memory_overcommit_ratio_denominator_for_user} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "Enable memory overcommit feature by default"}]}]}/>

Это мягкое ограничение памяти на уровне пользователя, которое применяется при достижении жёсткого лимита.
Это значение используется для вычисления коэффициента overcommit для запроса.
Ноль означает, что запрос пропускается.
Подробнее см. в разделе [memory overcommit](memory-overcommit.md).

## memory_profiler_sample_max_allocation_size {#memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Собирать случайные выделения памяти размером, меньшим или равным указанному значению, с вероятностью `memory_profiler_sample_probability`. 0 означает отключено. Имеет смысл установить `max_untracked_memory` в 0, чтобы это пороговое значение работало как ожидается.

## memory_profiler_sample_min_allocation_size {#memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Собирать случайные выделения памяти размером не меньше указанного значения с вероятностью, равной `memory_profiler_sample_probability`. 0 означает отключено. Имеет смысл установить параметр `max_untracked_memory` в 0, чтобы этот порог работал, как ожидается.

## memory_profiler_sample_probability {#memory_profiler_sample_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

Собирать случайные события выделения и освобождения памяти и записывать их в system.trace_log с trace_type 'MemorySample'. Вероятность применяется к каждому событию выделения/освобождения независимо от размера этого выделения (может быть изменена параметрами `memory_profiler_sample_min_allocation_size` и `memory_profiler_sample_max_allocation_size`). Обратите внимание, что семплирование происходит только тогда, когда объём неотслеживаемой памяти превышает значение 'max_untracked_memory'. Для более детализированного семплирования имеет смысл установить 'max_untracked_memory' в 0.

## memory_profiler_step {#memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

Задает шаг профилировщика памяти. Каждый раз, когда потребление памяти запросом превышает очередной шаг (в байтах), профилировщик памяти собирает стек-трейс выделения и записывает его в [trace_log](/operations/system-tables/trace_log).

Возможные значения:

- Положительное целое число байт.

- 0 — для отключения профилировщика памяти.

## memory_tracker_fault_probability {#memory_tracker_fault_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

Для тестирования `exception safety` — генерировать исключение при каждом выделении памяти с указанной вероятностью.

## memory_usage_overcommit_max_wait_microseconds {#memory_usage_overcommit_max_wait_microseconds} 

<SettingsInfoBlock type="UInt64" default_value="5000000" />

Максимальное время ожидания, в течение которого поток будет ждать освобождения памяти в случае превышения лимита памяти на уровне пользователя.
Если время ожидания истечёт и память не будет освобождена, выбрасывается исключение.
Подробнее о [memory overcommit](memory-overcommit.md).

## merge_table_max_tables_to_look_for_schema_inference {#merge_table_max_tables_to_look_for_schema_inference} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Новая настройка"}]}]}/>

При создании таблицы `Merge` без явной схемы или при использовании табличной функции `merge` схема определяется как объединение не более чем указанного числа подходящих таблиц.
Если таблиц больше, схема будет определена только на основе первых таблиц в указанном количестве.

## merge_tree_coarse_index_granularity {#merge_tree_coarse_index_granularity} 

<SettingsInfoBlock type="UInt64" default_value="8" />

При поиске данных ClickHouse проверяет метки в файле индекса. Если ClickHouse определяет, что требуемые ключи находятся в некотором диапазоне, он делит этот диапазон на `merge_tree_coarse_index_granularity` поддиапазонов и рекурсивно ищет в них требуемые ключи.

Возможные значения:

- Любое положительное чётное целое число.

## merge_tree_compact_parts_min_granules_to_multibuffer_read {#merge_tree_compact_parts_min_granules_to_multibuffer_read} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="16" />

Оказывает влияние только в ClickHouse Cloud. Количество гранул в полосе компактной части таблиц MergeTree, при котором используется многобуферный ридер, поддерживающий параллельное чтение и опережающую выборку (prefetch). При чтении из удалённой файловой системы использование многобуферного ридера увеличивает количество операций чтения.

## merge_tree_determine_task_size_by_prewhere_columns {#merge_tree_determine_task_size_by_prewhere_columns} 

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет, следует ли использовать для определения размера задачи чтения только размер столбцов из PREWHERE.

## merge_tree_max_bytes_to_use_cache {#merge_tree_max_bytes_to_use_cache} 

<SettingsInfoBlock type="UInt64" default_value="2013265920" />

Если ClickHouse нужно прочитать более `merge_tree_max_bytes_to_use_cache` байт в одном запросе, он не использует кэш несжатых блоков.

Кэш несжатых блоков хранит данные, извлечённые для запросов. ClickHouse использует этот кэш для ускорения ответа на повторяющиеся небольшие запросы. Эта настройка защищает кэш от засорения запросами, которые читают большой объём данных. Серверная настройка [uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) определяет размер кэша несжатых блоков.

Возможные значения:

- Любое положительное целое число.

## merge_tree_max_rows_to_use_cache {#merge_tree_max_rows_to_use_cache} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Если в рамках одного запроса ClickHouse должен прочитать больше строк, чем `merge_tree_max_rows_to_use_cache`, он не использует кэш несжатых блоков.

Кэш несжатых блоков хранит данные, извлечённые для запросов. ClickHouse использует этот кэш для ускорения ответов на повторяющиеся небольшие запросы. Этот параметр защищает кэш от засорения запросами, которые читают большой объём данных. Параметр сервера [uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) задаёт размер кэша несжатых блоков.

Возможные значения:

- Любое положительное целое число.

## merge_tree_min_bytes_for_concurrent_read {#merge_tree_min_bytes_for_concurrent_read} 

<SettingsInfoBlock type="UInt64" default_value="251658240" />

Если количество байт, которое нужно прочитать из одного файла таблицы движка [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md), превышает `merge_tree_min_bytes_for_concurrent_read`, ClickHouse пытается выполнять параллельное чтение этого файла в нескольких потоках.

Возможное значение:

- Положительное целое число.

## merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem {#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Setting is deprecated"}]}]}/>

Минимальное количество байт, которое должно быть прочитано из одного файла, прежде чем движок [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) сможет распараллелить чтение при работе с удалённой файловой системой. Мы не рекомендуем использовать этот параметр.

Возможные значения:

- Положительное целое число.

## merge_tree_min_bytes_for_seek {#merge_tree_min_bytes_for_seek} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если расстояние между двумя блоками данных, которые нужно прочитать из одного файла, меньше `merge_tree_min_bytes_for_seek` байт, ClickHouse последовательно читает диапазон файла, содержащий оба блока, тем самым избегая дополнительной операции seek.

Возможные значения:

- Любое положительное целое число.

## merge_tree_min_bytes_per_task_for_remote_reading {#merge_tree_min_bytes_per_task_for_remote_reading} 

**Псевдонимы**: `filesystem_prefetch_min_bytes_for_single_read_task`

<SettingsInfoBlock type="UInt64" default_value="2097152" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "2097152"},{"label": "Значение приведено к одному с `filesystem_prefetch_min_bytes_for_single_read_task`"}]}]}/>

Минимальное количество байт для чтения на одну задачу.

## merge_tree_min_read_task_size {#merge_tree_min_read_task_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "8"},{"label": "Новая настройка"}]}]}/>

Жёсткий нижний предел размера задачи (даже если число гранул невелико и количество доступных потоков велико, задачи меньшего размера не будут выделяться).

## merge_tree_min_rows_for_concurrent_read {#merge_tree_min_rows_for_concurrent_read} 

<SettingsInfoBlock type="UInt64" default_value="163840" />

Если количество строк для чтения из файла таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает `merge_tree_min_rows_for_concurrent_read`, ClickHouse пытается выполнить параллельное чтение этого файла в нескольких потоках.

Возможные значения:

- Положительное целое число.

## merge_tree_min_rows_for_concurrent_read_for_remote_filesystem {#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Setting is deprecated"}]}]}/>

Минимальное количество строк, которое нужно прочитать из одного файла, прежде чем движок [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) сможет распараллелить чтение при работе с удалённой файловой системой. Мы не рекомендуем использовать этот параметр.

Возможные значения:

- Положительное целое число.

## merge_tree_min_rows_for_seek {#merge_tree_min_rows_for_seek} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если расстояние между двумя блоками данных в одном файле, которые требуется прочитать, меньше `merge_tree_min_rows_for_seek` строк, ClickHouse не выполняет перемещение по файлу, а читает данные последовательно.

Возможные значения:

- Любое положительное целое число.

## merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability {#merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Для тестирования `PartsSplitter` — разбивает диапазоны чтения на пересекающиеся и непересекающиеся при каждом чтении из MergeTree с указанной вероятностью."}]}]}/>

Для тестирования `PartsSplitter` — разбивает диапазоны чтения на пересекающиеся и непересекающиеся при каждом чтении из MergeTree с указанной вероятностью.

## merge_tree_storage_snapshot_sleep_ms {#merge_tree_storage_snapshot_sleep_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Новая настройка для отладки согласованности снимка хранилища в запросе"}]}]}/>

Вставляет искусственную задержку (в миллисекундах) при создании снимка хранилища для таблиц MergeTree.
Используется только для тестирования и отладки.

Возможные значения:

- 0 — без задержки (по умолчанию)
- N — задержка в миллисекундах

## merge_tree_use_const_size_tasks_for_remote_reading {#merge_tree_use_const_size_tasks_for_remote_reading} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать ли задачи фиксированного размера при чтении из удалённой таблицы.

## merge_tree_use_deserialization_prefixes_cache {#merge_tree_use_deserialization_prefixes_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Новая настройка для управления использованием кэша префиксов десериализации в MergeTree"}]}]}/>

Включает кэширование метаданных столбцов по префиксам файлов при чтении данных с удаленных дисков в таблицах MergeTree.

## merge_tree_use_prefixes_deserialization_thread_pool {#merge_tree_use_prefixes_deserialization_thread_pool} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Новая настройка, управляющая использованием пула потоков для параллельной десериализации префиксов в MergeTree"}]}]}/>

Включает использование пула потоков для параллельного чтения префиксов в Wide-частях MergeTree. Размер этого пула потоков контролируется серверной настройкой `max_prefixes_deserialization_thread_pool_size`.

## merge_tree_use_v1_object_and_dynamic_serialization {#merge_tree_use_v1_object_and_dynamic_serialization} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "Добавлена новая версия сериализации V2 для типов JSON и Dynamic"}]}]}/>

При включении в MergeTree будет использоваться версия сериализации V1 для типов JSON и Dynamic вместо V2. Изменение этой настройки вступает в силу только после перезапуска сервера.

## metrics_perf_events_enabled {#metrics_perf_events_enabled} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, некоторые perf-события будут измеряться в ходе выполнения запросов.

## metrics_perf_events_list {#metrics_perf_events_list} 

Список perf-метрик, разделённых запятыми, которые будут измеряться во время выполнения запросов. Пустое значение означает, что учитываются все события. См. PerfEventInfo в исходном коде для списка доступных событий.

## min_bytes_to_use_direct_io {#min_bytes_to_use_direct_io} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный объем данных, при котором используется прямой ввод-вывод (Direct I/O) при работе с дисковым хранилищем.

ClickHouse использует этот параметр при чтении данных из таблиц. Если общий объем всех данных, подлежащих чтению, превышает `min_bytes_to_use_direct_io` байт, ClickHouse читает данные с диска с опцией `O_DIRECT`.

Возможные значения:

- 0 — прямой ввод-вывод (Direct I/O) отключен.
- Положительное целое число.

## min_bytes_to_use_mmap_io {#min_bytes_to_use_mmap_io} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Это экспериментальный параметр. Задаёт минимальный объём памяти для чтения больших файлов без копирования данных из ядра в пользовательское пространство. Рекомендуемый порог — около 64 МБ, так как вызовы [mmap/munmap](https://en.wikipedia.org/wiki/Mmap) выполняются медленно. Имеет смысл только для больших файлов и помогает только в том случае, если данные находятся в кэше страниц.

Возможные значения:

- Положительное целое число.
- 0 — большие файлы читаются только с копированием данных из ядра в пользовательское пространство.

## min_chunk_bytes_for_parallel_parsing {#min_chunk_bytes_for_parallel_parsing} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="10485760" />

- Тип: unsigned int
- Значение по умолчанию: 1 MiB

Минимальный размер фрагмента в байтах, обрабатываемого каждым потоком параллельно.

## min_compress_block_size {#min_compress_block_size} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

Применяется к таблицам [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Чтобы уменьшить задержку при обработке запросов, блок сжимается при записи следующей метки, если его размер не менее `min_compress_block_size`. По умолчанию — 65 536.

Фактический размер блока, если объём несжатых данных меньше `max_compress_block_size`, не меньше этого значения и не меньше объёма данных для одной метки.

Рассмотрим пример. Предположим, что при создании таблицы параметр `index_granularity` был установлен равным 8192.

Мы записываем столбец типа UInt32 (4 байта на значение). При записи 8192 строк получится 32 КБ данных. Поскольку min_compress_block_size = 65 536, сжатый блок будет формироваться на каждые две метки.

Мы записываем столбец URL типа String (средний размер 60 байт на значение). При записи 8192 строк средний объём будет немного меньше 500 КБ данных. Поскольку это больше 65 536, сжатый блок будет формироваться для каждой метки. В этом случае при чтении данных с диска в диапазоне одной метки лишние данные не будут распакованы.

:::note
Это настройка для опытных пользователей, и вам не следует изменять её, если вы только начинаете работать с ClickHouse.
:::

## min_count_to_compile_aggregate_expression {#min_count_to_compile_aggregate_expression} 

<SettingsInfoBlock type="UInt64" default_value="3" />

Минимальное количество идентичных агрегатных выражений для запуска JIT-компиляции. Работает только если включена настройка [compile_aggregate_expressions](#compile_aggregate_expressions).

Возможные значения:

- Положительное целое число.
- 0 — идентичные агрегатные выражения всегда JIT-компилируются.

## min_count_to_compile_expression {#min_count_to_compile_expression} 

<SettingsInfoBlock type="UInt64" default_value="3" />

Минимальное число раз, которое выражение должно быть выполнено, прежде чем оно будет скомпилировано.

## min_count_to_compile_sort_description {#min_count_to_compile_sort_description} 

<SettingsInfoBlock type="UInt64" default_value="3" />

Количество идентичных описаний сортировки, при достижении которого они компилируются с помощью JIT

## min_execution_speed {#min_execution_speed} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальная скорость выполнения в строках в секунду. Проверяется для каждого блока данных по истечении времени действия
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed).
Если скорость выполнения ниже, выбрасывается исключение.

## min_execution_speed_bytes {#min_execution_speed_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное число байт, обрабатываемых в секунду при выполнении запроса. Проверяется на каждом блоке данных по истечении
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed).
Если скорость выполнения ниже, выбрасывается исключение.

## min_external_table_block_size_bytes {#min_external_table_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="268402944" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268402944"},{"label": "Объединяет блоки, передаваемые во внешнюю таблицу, до указанного размера в байтах, если их размер меньше указанного."}]}]}/>

Объединяет блоки, передаваемые во внешнюю таблицу, до указанного размера в байтах, если их размер меньше указанного.

## min_external_table_block_size_rows {#min_external_table_block_size_rows} 

<SettingsInfoBlock type="UInt64" default_value="1048449" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1048449"},{"label": "Объединять блоки, передаваемые во внешнюю таблицу, до указанного размера в строках, если их размер меньше указанного"}]}]}/>

Объединять блоки, передаваемые во внешнюю таблицу, до указанного размера в строках, если их размер меньше указанного.

## min_free_disk_bytes_to_perform_insert {#min_free_disk_bytes_to_perform_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Резервирует часть свободного дискового пространства (в байтах) от вставок, при этом продолжает разрешать временную запись."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Минимальный объём свободного дискового пространства (в байтах), необходимый для выполнения операции вставки.

## min_free_disk_ratio_to_perform_insert {#min_free_disk_ratio_to_perform_insert} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Поддерживает некоторый объём свободного дискового пространства, выраженный как доля от общего объёма диска, зарезервированным от вставок, при этом по‑прежнему позволяя временную запись."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Минимальное отношение свободного дискового пространства к общему объёму диска, необходимое для выполнения вставки.

## min_free_disk_space_for_temporary_data {#min_free_disk_space_for_temporary_data} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный объём свободного дискового пространства, который необходимо сохранять при записи временных данных, используемых для внешней сортировки и агрегации.

## min_hit_rate_to_use_consecutive_keys_optimization {#min_hit_rate_to_use_consecutive_keys_optimization} 

<SettingsInfoBlock type="Float" default_value="0.5" />

Минимальный коэффициент попаданий кэша, при котором оптимизация агрегации по последовательным ключам остается включенной.

## min_insert_block_size_bytes {#min_insert_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="268402944" />

Минимальный размер блока (в байтах), формируемого для вставки в таблицу.

Этот параметр работает совместно с min_insert_block_size_rows и управляет формированием блоков в тех же контекстах (разбор формата и операции `INSERT`). Подробную информацию о том, когда и как применяются эти параметры, см. в описании min_insert_block_size_rows.

Возможные значения:

- Положительное целое число.
- 0 — параметр не участвует в формировании блоков.

## min_insert_block_size_bytes_for_materialized_views {#min_insert_block_size_bytes_for_materialized_views} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает минимальный размер блока в байтах, который может быть вставлен в таблицу запросом `INSERT`. Блоки меньшего размера объединяются в более крупные. Этот параметр применяется только к блокам, вставляемым в [materialized view](../../sql-reference/statements/create/view.md). Настраивая этот параметр, вы управляете объединением блоков при вставке в materialized view и избегаете избыточного использования памяти.

Возможные значения:

- Любое положительное целое число.
- 0 — объединение отключено.

**См. также**

- [min_insert_block_size_bytes](#min_insert_block_size_bytes)

## min_insert_block_size_rows {#min_insert_block_size_rows} 

<SettingsInfoBlock type="UInt64" default_value="1048449" />

Минимальный размер блоков (в строках), формируемых для вставки в таблицу.

Этот параметр управляет формированием блоков в двух контекстах:

1. Разбор форматов: когда сервер разбирает построчные форматы ввода (CSV, TSV, JSONEachRow и т. д.) из любого интерфейса (HTTP, clickhouse-client со встроенными данными, gRPC, протокол PostgreSQL wire), он использует этот параметр, чтобы определить момент формирования блока.
Примечание: при использовании clickhouse-client или clickhouse-local для чтения из файла разбор данных выполняет сам клиент, и этот параметр применяется на стороне клиента.
2. Операции INSERT: во время запросов INSERT...SELECT и когда данные проходят через materialized views, блоки объединяются на основе этого параметра перед записью в хранилище.

Блок при разборе формата формируется, когда выполняется одно из условий:

- Минимальные пороги (И): достигнуты оба параметра min_insert_block_size_rows И min_insert_block_size_bytes
- Максимальные пороги (ИЛИ): достигнут один из параметров max_insert_block_size ИЛИ max_insert_block_size_bytes

Блоки меньшего размера для операций вставки объединяются в более крупные и формируются, когда достигается одно из значений min_insert_block_size_rows или min_insert_block_size_bytes.

Возможные значения:

- Положительное целое число.
- 0 — параметр не участвует в формировании блоков.

## min_insert_block_size_rows_for_materialized_views {#min_insert_block_size_rows_for_materialized_views} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает минимальное количество строк в блоке, которые могут быть вставлены в таблицу `INSERT`-запросом. Блоки меньшего размера объединяются в более крупные. Этот параметр применяется только к блокам, вставляемым в [materialized view](../../sql-reference/statements/create/view.md). Настраивая этот параметр, вы управляете объединением блоков при записи в materialized view и избегаете избыточного использования памяти.

Возможные значения:

- Любое положительное целое число.
- 0 — объединение отключено.

**Смотрите также**

- [min_insert_block_size_rows](#min_insert_block_size_rows)

## min_joined_block_size_bytes {#min_joined_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "524288"},{"label": "Новая настройка."}]}]}/>

Минимальный размер блока в байтах для входных и выходных блоков JOIN (если алгоритм JOIN это поддерживает). Маленькие блоки будут объединены. 0 — без ограничений.

## min_joined_block_size_rows {#min_joined_block_size_rows} 

<SettingsInfoBlock type="UInt64" default_value="65409" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "65409"},{"label": "Новая настройка."}]}]}/>

Минимальный размер блока в строках для входных и выходных блоков JOIN (если алгоритм соединения это поддерживает). Небольшие блоки будут объединены. 0 означает отсутствие ограничений.

## min_os_cpu_wait_time_ratio_to_throw {#min_os_cpu_wait_time_ratio_to_throw} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Значения настройки были изменены и задним числом применены к версии 25.4"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Минимальное отношение между временем ожидания CPU в ОС (метрика OSCPUWaitMicroseconds) и временем занятости CPU (метрика OSCPUVirtualTimeMicroseconds), при котором система начинает рассматривать возможность отклонения запросов. Для вычисления вероятности используется линейная интерполяция между минимальным и максимальным значениями этого отношения; при этом значении вероятность равна 0.

## min_outstreams_per_resize_after_split {#min_outstreams_per_resize_after_split} 

<SettingsInfoBlock type="UInt64" default_value="24" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "24"},{"label": "New setting."}]}]}/>

Задает минимальное количество выходных потоков процессора `Resize` или `StrictResize` после выполнения разбиения при построении конвейера. Если получившееся количество потоков меньше этого значения, операция разбиения не будет выполнена.

### Что такое узел Resize {#what-is-a-resize-node}

Узел `Resize` — это процессор в конвейере запроса, который регулирует количество потоков данных, проходящих через конвейер. Он может как увеличивать, так и уменьшать количество потоков, чтобы сбалансировать нагрузку между несколькими потоками выполнения или процессорами. Например, если запросу требуется больше параллелизма, узел `Resize` может разделить один поток на несколько потоков. И наоборот, он может объединить несколько потоков в меньшее количество потоков, чтобы консолидировать обработку данных.

Узел `Resize` обеспечивает равномерное распределение данных между потоками, сохраняя структуру блоков данных. Это помогает оптимизировать использование ресурсов и улучшить производительность запроса.

### Почему узел Resize необходимо разделить {#why-the-resize-node-needs-to-be-split}

Во время выполнения конвейера мьютекс ExecutingGraph::Node::status_mutex центрального узла `Resize` становится точкой сильной конкуренции за доступ, особенно в средах с большим количеством ядер, и это приводит к следующему:

1. Увеличению задержки для ExecutingGraph::updateNode, что напрямую влияет на производительность запросов.
2. Избыточное количество циклов ЦП тратится на ожидание в спинлоке (native_queued_spin_lock_slowpath), что снижает эффективность.
3. Снижению загрузки ЦП, что ограничивает параллелизм и пропускную способность.

### Как происходит разбиение узла Resize {#how-the-resize-node-gets-split}

1. Проверяется количество выходных потоков, чтобы убедиться, что разбиение может быть выполнено: выходные потоки каждого процессора разбиения достигают или превышают порог `min_outstreams_per_resize_after_split`.
2. Узел `Resize` делится на несколько меньших узлов `Resize` с одинаковым количеством портов, каждый из которых обрабатывает подмножество входных и выходных потоков.
3. Каждая группа обрабатывается независимо, снижая конкуренцию за блокировки.

### Разбиение узла Resize с произвольными входами/выходами {#splitting-resize-node-with-arbitrary-inputsoutputs}

В некоторых случаях, когда число входов/выходов не делится на количество узлов `Resize`, на которые выполняется разбиение, часть входов подключается к `NullSource`, а часть выходов — к `NullSink`. Это позволяет выполнить разбиение, не затрагивая общий поток данных.

### Назначение настройки {#purpose-of-the-setting}

Настройка `min_outstreams_per_resize_after_split` гарантирует, что разбиение узлов `Resize` является осмысленным и не приводит к созданию слишком небольшого числа потоков, что могло бы вызвать неэффективную параллельную обработку. Обеспечивая минимальное количество выходных потоков, эта настройка помогает поддерживать баланс между параллелизмом и накладными расходами, оптимизируя выполнение запросов в сценариях, связанных с разбиением и слиянием потоков.

### Отключение настройки {#disabling-the-setting}

Чтобы отключить разбиение узлов `Resize`, установите эту настройку в 0. Это предотвратит разбиение узлов `Resize` при построении конвейера, позволяя им сохранять свою исходную структуру без разделения на более мелкие узлы.

## min_table_rows_to_use_projection_index {#min_table_rows_to_use_projection_index} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

Если оценочное количество строк, считываемых из таблицы, больше либо равно этому порогу, ClickHouse попытается использовать индекс проекции при выполнении запроса.

## mongodb_throw_on_unsupported_query {#mongodb_throw_on_unsupported_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "1"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting."}]}]}/>

Если настройка включена, таблицы MongoDB возвращают ошибку, если невозможно построить запрос MongoDB. В противном случае ClickHouse считывает всю таблицу и обрабатывает её локально. Эта настройка не действует, когда `allow_experimental_analyzer=0`.

## move_all_conditions_to_prewhere {#move_all_conditions_to_prewhere} 

<SettingsInfoBlock type="Bool" default_value="1" />

Перенос всех подходящих условий из WHERE в PREWHERE

## move_primary_key_columns_to_end_of_prewhere {#move_primary_key_columns_to_end_of_prewhere} 

<SettingsInfoBlock type="Bool" default_value="1" />

Перемещать условия PREWHERE, содержащие столбцы первичного ключа, в конец цепочки условий AND. Скорее всего, эти условия уже учитываются при анализе первичного ключа и поэтому мало влияют на фильтрацию на этапе PREWHERE.

## multiple_joins_try_to_keep_original_names {#multiple_joins_try_to_keep_original_names} 

<SettingsInfoBlock type="Bool" default_value="0" />

Не добавлять псевдонимы в список выражений верхнего уровня при преобразовании запросов с несколькими JOIN

## mutations_execute_nondeterministic_on_initiator {#mutations_execute_nondeterministic_on_initiator} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение `true`, константные недетерминированные функции (например, функция `now()`) выполняются на инициаторе и заменяются на литералы в запросах `UPDATE` и `DELETE`. Это помогает поддерживать согласованность данных на репликах при выполнении мутаций с константными недетерминированными функциями. Значение по умолчанию: `false`.

## mutations_execute_subqueries_on_initiator {#mutations_execute_subqueries_on_initiator} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включен, скалярные подзапросы выполняются на сервере-инициаторе и заменяются литералами в запросах `UPDATE` и `DELETE`. Значение по умолчанию: `false`.

## mutations_max_literal_size_to_replace {#mutations_max_literal_size_to_replace} 

<SettingsInfoBlock type="UInt64" default_value="16384" />

Максимальный размер сериализованного литерала в байтах для замены в запросах `UPDATE` и `DELETE`. Вступает в силу только в том случае, если включена хотя бы одна из двух настроек выше. Значение по умолчанию: 16384 (16 KiB).

## mutations_sync {#mutations_sync} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Позволяет выполнять запросы `ALTER TABLE ... UPDATE|DELETE|MATERIALIZE INDEX|MATERIALIZE PROJECTION|MATERIALIZE COLUMN|MATERIALIZE STATISTICS` ([мутации](../../sql-reference/statements/alter/index.md/#mutations)) синхронно.

Возможные значения:

| Значение | Описание                                                                                                                                           |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`      | Мутации выполняются асинхронно.                                                                                                                    |
| `1`      | Запрос ожидает завершения всех мутаций на текущем сервере.                                                                                         |
| `2`      | Запрос ожидает завершения всех мутаций на всех репликах (если они есть).                                                                           |
| `3`      | Запрос ожидает завершения мутаций только на активных репликах. Поддерживается только для `SharedMergeTree`. Для `ReplicatedMergeTree` ведёт себя так же, как `mutations_sync = 2`.|

## mysql_datatypes_support_level {#mysql_datatypes_support_level} 

Определяет, как типы MySQL преобразуются в соответствующие типы ClickHouse. Значение задаётся в виде списка через запятую с любыми комбинациями `decimal`, `datetime64`, `date2Date32` или `date2String`.

- `decimal`: преобразовывать типы `NUMERIC` и `DECIMAL` в `Decimal`, если это позволяет точность.
- `datetime64`: преобразовывать типы `DATETIME` и `TIMESTAMP` в `DateTime64` вместо `DateTime`, если точность не равна `0`.
- `date2Date32`: преобразовывать `DATE` в `Date32` вместо `Date`. Имеет приоритет над `date2String`.
- `date2String`: преобразовывать `DATE` в `String` вместо `Date`. Переопределяется параметром `datetime64`.

## mysql_map_fixed_string_to_text_in_show_columns {#mysql_map_fixed_string_to_text_in_show_columns} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Уменьшает объём настроек при подключении ClickHouse к BI‑инструментам."}]}]}/>

При включённой настройке тип данных ClickHouse [FixedString](../../sql-reference/data-types/fixedstring.md) будет отображаться как `TEXT` в [SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns).

Влияет только на подключения по MySQL wire protocol.

- 0 — использовать `BLOB`.
- 1 — использовать `TEXT`.

## mysql_map_string_to_text_in_show_columns {#mysql_map_string_to_text_in_show_columns} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Снижает трудозатраты на настройку подключения ClickHouse к BI-инструментам."}]}]}/>

Если параметр включён, тип данных ClickHouse [String](../../sql-reference/data-types/string.md) будет отображаться как `TEXT` в [SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns).

Параметр влияет только при подключении через протокол MySQL (wire protocol).

- 0 - использовать `BLOB`.
- 1 - использовать `TEXT`.

## mysql_max_rows_to_insert {#mysql_max_rows_to_insert} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

Максимальное число строк при пакетной вставке в движке таблиц MySQL

## network_compression_method {#network_compression_method} 

<SettingsInfoBlock type="String" default_value="LZ4" />

Кодек для сжатия обмена данными между клиентом и сервером, а также между серверами.

Возможные значения:

- `NONE` — без сжатия.
- `LZ4` — использовать кодек LZ4.
- `LZ4HC` — использовать кодек LZ4HC.
- `ZSTD` — использовать кодек ZSTD.

**См. также**

- [network_zstd_compression_level](#network_zstd_compression_level)

## network_zstd_compression_level {#network_zstd_compression_level} 

<SettingsInfoBlock type="Int64" default_value="1" />

Регулирует уровень сжатия ZSTD. Используется только, когда [network_compression_method](#network_compression_method) имеет значение `ZSTD`.

Возможные значения:

- Положительное целое число от 1 до 15.

## normalize_function_names {#normalize_function_names} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "Приводит имена функций к их каноническому виду; это требуется для маршрутизации запросов по проекциям"}]}]}/>

Приводить имена функций к их каноническому виду

## number_of_mutations_to_delay {#number_of_mutations_to_delay} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если изменяемая таблица содержит как минимум то количество незавершённых мутаций, мутации таблицы искусственно замедляются. 0 — отключено.

## number_of_mutations_to_throw {#number_of_mutations_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если изменяемая таблица содержит не менее указанного количества незавершённых мутаций, генерируется исключение 'Too many mutations ...'. 0 — отключено

## odbc_bridge_connection_pool_size {#odbc_bridge_connection_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />

Размер пула соединений для каждой строки параметров подключения в мосте ODBC.

## odbc_bridge_use_connection_pooling {#odbc_bridge_use_connection_pooling} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать пул подключений в ODBC bridge. Если значение установлено в false, новое подключение создаётся при каждом обращении.

## offset {#offset}

<SettingsInfoBlock type="UInt64" default_value="0" />

Задает количество строк, которые нужно пропустить перед началом возврата строк из запроса. Корректирует смещение, заданное клаузой [OFFSET](/sql-reference/statements/select/offset), таким образом, что эти два значения суммируются.

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


## opentelemetry_start_trace_probability {#opentelemetry_start_trace_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

Задаёт вероятность того, что ClickHouse начнёт трассировку выполняемых запросов (если не передан родительский [контекст трассировки](https://www.w3.org/TR/trace-context/)).

Возможные значения:

- 0 — трассировка для всех выполняемых запросов отключена (если не передан родительский контекст трассировки).
- Положительное число с плавающей запятой в диапазоне [0..1]. Например, если значение настройки равно `0,5`, ClickHouse будет запускать трассу в среднем для половины запросов.
- 1 — трассировка для всех выполняемых запросов включена.

## opentelemetry_trace_cpu_scheduling {#opentelemetry_trace_cpu_scheduling} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка для трассировки механизма `cpu_slot_preemption`."}]}]}/>

Собирать спаны OpenTelemetry для вытесняющего планирования CPU рабочих нагрузок.

## opentelemetry_trace_processors {#opentelemetry_trace_processors} 

<SettingsInfoBlock type="Bool" default_value="0" />

Собирать спаны OpenTelemetry для процессоров.

## optimize_aggregation_in_order {#optimize_aggregation_in_order} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает оптимизацию [GROUP BY](/sql-reference/statements/select/group-by) в запросах [SELECT](../../sql-reference/statements/select/index.md) для агрегации данных в соответствующем порядке сортировки в таблицах [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Возможные значения:

- 0 — оптимизация `GROUP BY` отключена.
- 1 — оптимизация `GROUP BY` включена.

**См. также**

- [Оптимизация `GROUP BY`](/sql-reference/statements/select/group-by#group-by-optimization-depending-on-table-sorting-key)

## optimize_aggregators_of_group_by_keys {#optimize_aggregators_of_group_by_keys} 

<SettingsInfoBlock type="Bool" default_value="1" />

Устраняет использование агрегирующих функций min/max/any/anyLast для ключей GROUP BY в секции SELECT.

## optimize_and_compare_chain {#optimize_and_compare_chain} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "A new setting"}]}]}/>

Дополняет цепочки AND константными сравнениями, чтобы повысить эффективность фильтрации. Поддерживает операторы `<`, `<=`, `>`, `>=`, `=` и их комбинации. Например, выражение `(a < b) AND (b < c) AND (c < 5)` будет преобразовано в `(a < b) AND (b < c) AND (c < 5) AND (b < 5) AND (a < 5)`.

## optimize_append_index {#optimize_append_index} 

<SettingsInfoBlock type="Bool" default_value="0" />

Используйте [constraints](../../sql-reference/statements/create/table.md/#constraints) для добавления условия индекса. Значение по умолчанию — `false`.

Возможные значения:

- true, false

## optimize_arithmetic_operations_in_aggregate_functions {#optimize_arithmetic_operations_in_aggregate_functions} 

<SettingsInfoBlock type="Bool" default_value="1" />

Переносить арифметические операции за пределы агрегатных функций

## optimize_const_name_size {#optimize_const_name_size} 

<SettingsInfoBlock type="Int64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "256"},{"label": "Заменять на скаляр и использовать хэш в качестве имени для больших констант (размер оценивается по длине имени)"}]}]}/>

Заменять на скаляр и использовать хэш в качестве имени для больших констант (размер оценивается по длине имени).

Возможные значения:

- положительное целое число — максимальная длина имени,
- 0 — всегда,
- отрицательное целое число — никогда.

## optimize_count_from_files {#optimize_count_from_files} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию подсчёта числа строк из файлов в различных входных форматах. Применяется к табличным функциям и движкам `file`/`s3`/`url`/`hdfs`/`azureBlobStorage`.

Возможные значения:

- 0 — оптимизация отключена.
- 1 — оптимизация включена.

## optimize_distinct_in_order {#optimize_distinct_in_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию DISTINCT, если некоторые столбцы в DISTINCT образуют префикс сортировки. Например, префикс ключа сортировки в MergeTree или выражения ORDER BY.

## optimize_distributed_group_by_sharding_key {#optimize_distributed_group_by_sharding_key} 

<SettingsInfoBlock type="Bool" default_value="1" />

Оптимизирует запросы `GROUP BY sharding_key`, избегая затратной агрегации на сервере-инициаторе (что снижает потребление памяти этим запросом на сервере-инициаторе).

Поддерживаются следующие типы запросов (и любые их комбинации):

- `SELECT DISTINCT [..., ]sharding_key[, ...] FROM dist`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...]`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] ORDER BY x`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1`
- `SELECT ... FROM dist GROUP BY sharding_key[, ...] LIMIT 1 BY x`

Следующие типы запросов не поддерживаются (поддержка некоторых из них может быть добавлена позднее):

- `SELECT ... GROUP BY sharding_key[, ...] WITH TOTALS`
- `SELECT ... GROUP BY sharding_key[, ...] WITH ROLLUP`
- `SELECT ... GROUP BY sharding_key[, ...] WITH CUBE`
- `SELECT ... GROUP BY sharding_key[, ...] SETTINGS extremes=1`

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

См. также:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [distributed_push_down_limit](#distributed_push_down_limit)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)

:::note
В настоящее время для работы требуется `optimize_skip_unused_shards` (причина в том, что в будущем эта настройка может быть включена по умолчанию, и она будет работать корректно только в случае, если данные были вставлены через distributed таблицу, то есть распределены в соответствии с `sharding_key`).
:::

## optimize_empty_string_comparisons {#optimize_empty_string_comparisons} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "A new setting."}]}]}/>

Преобразует выражения вида col = '' или '' = col в empty(col), а col != '' или '' != col — в notEmpty(col),
только если col имеет тип данных String или FixedString.

## optimize_extract_common_expressions {#optimize_extract_common_expressions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Оптимизировать выражения WHERE, PREWHERE, ON, HAVING и QUALIFY путем вынесения общих подвыражений из дизъюнкций конъюнкций."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "Добавлена настройка для оптимизации выражений WHERE, PREWHERE, ON, HAVING и QUALIFY путем вынесения общих подвыражений из дизъюнкций конъюнкций."}]}]}/>

Позволяет выносить общие подвыражения из дизъюнкций в выражениях WHERE, PREWHERE, ON, HAVING и QUALIFY. Логическое выражение вида `(A AND B) OR (A AND C)` может быть переписано как `A AND (B OR C)`, что может помочь задействовать:

- индексы в простых фильтрующих выражениях
- оптимизацию преобразования CROSS JOIN в INNER JOIN

## optimize_functions_to_subcolumns {#optimize_functions_to_subcolumns} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "Настройка включена по умолчанию"}]}]}/>

Включает или отключает оптимизацию, при которой некоторые функции заменяются чтением подстолбцов. Это уменьшает объём считываемых данных.

Следующие функции могут быть преобразованы:

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

## optimize_group_by_constant_keys {#optimize_group_by_constant_keys} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.9"},{"label": "1"},{"label": "По умолчанию оптимизирует группировку по константным ключам"}]}]}/>

Оптимизировать GROUP BY, когда все ключи в блоке являются константами

## optimize_group_by_function_keys {#optimize_group_by_function_keys} 

<SettingsInfoBlock type="Bool" default_value="1" />

Исключает функции от других ключей в секции GROUP BY

## optimize_if_chain_to_multiif {#optimize_if_chain_to_multiif} 

<SettingsInfoBlock type="Bool" default_value="0" />

Заменяет цепочки if(cond1, then1, if(cond2, ...)) на multiIf. На данный момент это не даёт преимуществ для числовых типов.

## optimize_if_transform_strings_to_enum {#optimize_if_transform_strings_to_enum} 

<SettingsInfoBlock type="Bool" default_value="0" />

Заменяет аргументы строкового типа в функциях `if` и `transform` на enum. По умолчанию отключен, так как может привести к несогласованным изменениям в распределённом запросе и его последующему сбою.

## optimize_injective_functions_in_group_by {#optimize_injective_functions_in_group_by} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "Заменить инъективные функции на их аргументы в разделе GROUP BY анализатора"}]}]}/>

Заменяет инъективные функции на их аргументы в разделе GROUP BY

## optimize_injective_functions_inside_uniq {#optimize_injective_functions_inside_uniq} 

<SettingsInfoBlock type="Bool" default_value="1" />

Удаляет инъективные функции от одного аргумента внутри uniq*().

## optimize_inverse_dictionary_lookup {#optimize_inverse_dictionary_lookup} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

Позволяет избежать повторных обратных поисков по словарю, выполняя более быстрый поиск в предварительно вычисленном наборе возможных значений ключей.

## optimize_min_equality_disjunction_chain_length {#optimize_min_equality_disjunction_chain_length} 

<SettingsInfoBlock type="UInt64" default_value="3" />

Минимальная длина выражения `expr = x1 OR ... expr = xN` для оптимизации.

## optimize_min_inequality_conjunction_chain_length {#optimize_min_inequality_conjunction_chain_length} 

<SettingsInfoBlock type="UInt64" default_value="3" />

Минимальная длина выражения вида `expr <> x1 AND ... expr <> xN` для оптимизации

## optimize_move_to_prewhere {#optimize_move_to_prewhere} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает автоматическую оптимизацию [PREWHERE](../../sql-reference/statements/select/prewhere.md) в запросах [SELECT](../../sql-reference/statements/select/index.md).

Работает только для таблиц семейства [*MergeTree](../../engines/table-engines/mergetree-family/index.md).

Возможные значения:

- 0 — автоматическая оптимизация `PREWHERE` отключена.
- 1 — автоматическая оптимизация `PREWHERE` включена.

## optimize_move_to_prewhere_if_final {#optimize_move_to_prewhere_if_final} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает автоматическую оптимизацию [PREWHERE](../../sql-reference/statements/select/prewhere.md) в запросах [SELECT](../../sql-reference/statements/select/index.md) с модификатором [FINAL](/sql-reference/statements/select/from#final-modifier).

Работает только для таблиц семейства [*MergeTree](../../engines/table-engines/mergetree-family/index.md).

Возможные значения:

- 0 — автоматическая оптимизация `PREWHERE` в запросах `SELECT` с модификатором `FINAL` отключена.
- 1 — автоматическая оптимизация `PREWHERE` в запросах `SELECT` с модификатором `FINAL` включена.

**См. также**

- настройка [optimize_move_to_prewhere](#optimize_move_to_prewhere)

## optimize_multiif_to_if {#optimize_multiif_to_if} 

<SettingsInfoBlock type="Bool" default_value="1" />

Заменяет функцию `multiIf` с единственным условием на функцию `if`.

## optimize_normalize_count_variants {#optimize_normalize_count_variants} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "Переписывать агрегатные функции, семантически эквивалентные count(), в count() по умолчанию"}]}]}/>

Переписывать агрегатные функции, семантически эквивалентные count(), в count().

## optimize&#95;on&#95;insert {#optimize_on_insert}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "Включить оптимизацию данных при INSERT по умолчанию для улучшения взаимодействия с пользователем"}]}]} />

Включает или отключает преобразование данных перед вставкой, как если бы к этому блоку был применён merge (в соответствии с движком таблицы).

Возможные значения:

* 0 — Отключено.
* 1 — Включено.

**Пример**

Разница между включённым и отключённым значениями:

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

Обратите внимание, что данный параметр влияет на поведение [materialized view](/sql-reference/statements/create/view#materialized-view).


## optimize_or_like_chain {#optimize_or_like_chain} 

<SettingsInfoBlock type="Bool" default_value="0" />

Оптимизирует несколько условий OR LIKE в multiMatchAny. Эту оптимизацию не следует включать по умолчанию, поскольку в некоторых случаях она нарушает анализ индексов.

## optimize_qbit_distance_function_reads {#optimize_qbit_distance_function_reads} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Заменяет функции расстояния для типа данных `QBit` на эквивалентные функции, которые считывают из хранилища только те столбцы, которые требуются для вычисления.

## optimize_read_in_order {#optimize_read_in_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию [ORDER BY](/sql-reference/statements/select/order-by#optimization-of-data-reading) в запросах [SELECT](../../sql-reference/statements/select/index.md) для чтения данных из таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Возможные значения:

- 0 — оптимизация `ORDER BY` отключена.
- 1 — оптимизация `ORDER BY` включена.

**См. также**

- [Оператор ORDER BY](/sql-reference/statements/select/order-by#optimization-of-data-reading)

## optimize_read_in_window_order {#optimize_read_in_window_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию ORDER BY в оконном предложении для чтения данных в соответствующем порядке сортировки в таблицах MergeTree.

## optimize_redundant_functions_in_order_by {#optimize_redundant_functions_in_order_by} 

<SettingsInfoBlock type="Bool" default_value="1" />

Удаляет функции из ORDER BY, если их аргумент также указан в ORDER BY

## optimize_respect_aliases {#optimize_respect_aliases} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено значение true, используются алиасы в WHERE/GROUP BY/ORDER BY, что улучшает отсечение партиций, использование вторичных индексов, а также работу optimize_aggregation_in_order/optimize_read_in_order/optimize_trivial_count.

## optimize_rewrite_aggregate_function_with_if {#optimize_rewrite_aggregate_function_with_if} 

<SettingsInfoBlock type="Bool" default_value="1" />

Переписывает агрегатные функции с выражением `if` в качестве аргумента, когда это логически эквивалентно.
Например, `avg(if(cond, col, null))` может быть переписано как `avgOrNullIf(cond, col)`. Это может улучшить производительность.

:::note
Поддерживается только при использовании анализатора (`enable_analyzer = 1`).
:::

## optimize_rewrite_array_exists_to_has {#optimize_rewrite_array_exists_to_has} 

<SettingsInfoBlock type="Bool" default_value="0" />

Переписывает вызовы функции arrayExists() на has(), когда это логически эквивалентно. Например, arrayExists(x -> x = 1, arr) может быть переписана как has(arr, 1).

## optimize_rewrite_like_perfect_affix {#optimize_rewrite_like_perfect_affix} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "Новый параметр"}]}]}/>

Переписывает выражения LIKE с точным префиксом или суффиксом (например, `col LIKE 'ClickHouse%'`) в вызовы функций startsWith или endsWith (например, `startsWith(col, 'ClickHouse')`).

## optimize_rewrite_regexp_functions {#optimize_rewrite_regexp_functions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Преобразует функции, связанные с регулярными выражениями, в более простые и эффективные варианты

## optimize_rewrite_sum_if_to_count_if {#optimize_rewrite_sum_if_to_count_if} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "Доступно только для анализатора, где работает корректно"}]}]}/>

Переписывать вызовы sumIf() и sum(if()) в countIf(), когда это логически эквивалентно

## optimize_skip_merged_partitions {#optimize_skip_merged_partitions} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает оптимизацию для запроса [OPTIMIZE TABLE ... FINAL](../../sql-reference/statements/optimize.md), если есть только одна часть с уровнем > 0 и для неё не истёк TTL.

- `OPTIMIZE TABLE ... FINAL SETTINGS optimize_skip_merged_partitions=1`

По умолчанию запрос `OPTIMIZE TABLE ... FINAL` перезаписывает эту часть, даже если в таблице есть только одна часть.

Возможные значения:

- 1 — включить оптимизацию.
- 0 — отключить оптимизацию.

## optimize_skip_unused_shards {#optimize_skip_unused_shards} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает пропуск неиспользуемых сегментов для запросов [SELECT](../../sql-reference/statements/select/index.md), которые содержат условие по ключу шардинга в `WHERE`/`PREWHERE`, и активирует связанные оптимизации для распределённых запросов (например, агрегацию по ключу шардинга).

:::note
Предполагается, что данные распределены по ключу шардинга; в противном случае запрос может вернуть некорректный результат.
:::

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## optimize_skip_unused_shards_limit {#optimize_skip_unused_shards_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Ограничение на количество значений ключа сегментирования; при достижении лимита `optimize_skip_unused_shards` отключается.

Слишком большое количество значений может потребовать значительных ресурсов на обработку, при этом выгода сомнительна: если в `IN (...)` указано огромное количество значений, то, скорее всего, запрос всё равно будет отправлен на все сегменты.

## optimize_skip_unused_shards_nesting {#optimize_skip_unused_shards_nesting} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Определяет поведение [`optimize_skip_unused_shards`](#optimize_skip_unused_shards) (и, следовательно, по‑прежнему требует включённого [`optimize_skip_unused_shards`](#optimize_skip_unused_shards)) в зависимости от уровня вложенности распределённого запроса (когда у вас есть таблица `Distributed`, обращающаяся к другой таблице `Distributed`).

Возможные значения:

- 0 — Отключено, `optimize_skip_unused_shards` всегда работает.
- 1 — Включает `optimize_skip_unused_shards` только для первого уровня.
- 2 — Включает `optimize_skip_unused_shards` до второго уровня.

## optimize_skip_unused_shards_rewrite_in {#optimize_skip_unused_shards_rewrite_in} 

<SettingsInfoBlock type="Bool" default_value="1" />

Переписывает оператор IN в запросах к удалённым сегментам, чтобы исключить значения, которые не принадлежат этому сегменту (требуется настройка optimize_skip_unused_shards).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## optimize_sorting_by_input_stream_properties {#optimize_sorting_by_input_stream_properties} 

<SettingsInfoBlock type="Bool" default_value="1" />

Оптимизирует сортировку на основе свойств сортировки входного потока

## optimize_substitute_columns {#optimize_substitute_columns} 

<SettingsInfoBlock type="Bool" default_value="0" />

Используйте [ограничения](../../sql-reference/statements/create/table.md/#constraints) для подстановки столбцов. По умолчанию — `false`.

Возможные значения:

- true, false

## optimize&#95;syntax&#95;fuse&#95;functions {#optimize_syntax_fuse_functions}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает объединение агрегатных функций с одинаковым аргументом. Переписывает запрос, если он содержит как минимум две агрегатные функции [sum](/sql-reference/aggregate-functions/reference/sum), [count](/sql-reference/aggregate-functions/reference/count) или [avg](/sql-reference/aggregate-functions/reference/avg) с одинаковым аргументом, в [sumCount](/sql-reference/aggregate-functions/reference/sumcount).

Возможные значения:

* 0 — функции с одинаковым аргументом не объединяются.
* 1 — функции с одинаковым аргументом объединяются.

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


## optimize_throw_if_noop {#optimize_throw_if_noop} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает выбрасывание исключения, если запрос [OPTIMIZE](../../sql-reference/statements/optimize.md) не выполнил слияние.

По умолчанию `OPTIMIZE` завершается успешно, даже если он ничего не сделал. Этот параметр позволяет различать такие ситуации и получать причину в сообщении об исключении.

Возможные значения:

- 1 — Выбрасывание исключения включено.
- 0 — Выбрасывание исключения отключено.

## optimize_time_filter_with_preimage {#optimize_time_filter_with_preimage} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Оптимизация предикатов для типов Date и DateTime за счёт преобразования функций в эквивалентные сравнения без преобразований типов (например, toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31')"}]}]}/>

Оптимизация предикатов для типов Date и DateTime за счёт преобразования функций в эквивалентные сравнения без преобразований типов (например, `toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'`)

## optimize_trivial_approximate_count_query {#optimize_trivial_approximate_count_query} 

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать приблизительное значение для тривиальной оптимизации операции COUNT в хранилищах, поддерживающих такую оценку, например EmbeddedRocksDB.

Возможные значения:

- 0 — оптимизация отключена.
   - 1 — оптимизация включена.

## optimize_trivial_count_query {#optimize_trivial_count_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию тривиального запроса `SELECT count() FROM table` с использованием метаданных движка MergeTree. Если вам необходимо использовать защиту на уровне строк (row-level security), отключите эту настройку.

Возможные значения:

- 0 — Optimization disabled.
   - 1 — Optimization enabled.

См. также:

- [optimize_functions_to_subcolumns](#optimize_functions_to_subcolumns)

## optimize_trivial_insert_select {#optimize_trivial_insert_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Оптимизация не имеет смысла во многих случаях."}]}]}/>

Оптимизировать тривиальный запрос 'INSERT INTO table SELECT ... FROM TABLES'

## optimize_uniq_to_count {#optimize_uniq_to_count} 

<SettingsInfoBlock type="Bool" default_value="1" />

Заменяет uniq и его варианты (кроме uniqUpTo) на count, если подзапрос содержит DISTINCT или оператор GROUP BY.

## optimize_use_implicit_projections {#optimize_use_implicit_projections} 

<SettingsInfoBlock type="Bool" default_value="1" />

Автоматически использовать неявные PROJECTION при выполнении запроса SELECT

## optimize_use_projection_filtering {#optimize_use_projection_filtering} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "New setting"}]}]}/>

Включает использование проекций для фильтрации диапазонов частей, даже если проекции не выбраны для выполнения запроса SELECT.

## optimize_use_projections {#optimize_use_projections} 

**Псевдонимы**: `allow_experimental_projection_optimization`

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию [проекций](../../engines/table-engines/mergetree-family/mergetree.md/#projections) при обработке запросов `SELECT`.

Возможные значения:

- 0 — оптимизация проекций отключена.
- 1 — оптимизация проекций включена.

## optimize_using_constraints {#optimize_using_constraints} 

<SettingsInfoBlock type="Bool" default_value="0" />

Используйте [ограничения](../../sql-reference/statements/create/table.md/#constraints) для оптимизации запросов. По умолчанию — `false`.

Возможные значения:

- true, false

## os_threads_nice_value_materialized_view {#os_threads_nice_value_materialized_view} 

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Значение nice в Linux для потоков materialized view. Чем ниже значение, тем выше приоритет использования CPU.

Требуется привилегия CAP_SYS_NICE, иначе параметр не оказывает эффекта.

Возможные значения: от -20 до 19.

## os_threads_nice_value_query {#os_threads_nice_value_query} 

**Псевдонимы**: `os_thread_priority`

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Значение параметра nice в Linux для потоков обработки запросов. Чем ниже значение, тем выше приоритет на CPU.

Требуется привилегия CAP_SYS_NICE, в противном случае параметр не оказывает эффекта.

Возможные значения: от -20 до 19.

## output_format_compression_level {#output_format_compression_level} 

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "3"},{"label": "Позволяет изменять уровень сжатия выходных данных запроса"}]}]}/>

Уровень сжатия по умолчанию, если выходные данные запроса сжимаются. Настройка применяется, когда запрос `SELECT` содержит `INTO OUTFILE` или при записи в табличные функции `file`, `url`, `hdfs`, `s3` или `azureBlobStorage`.

Возможные значения: от `1` до `22`

## output_format_compression_zstd_window_log {#output_format_compression_zstd_window_log} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Позволяет изменять параметр window log алгоритма zstd в выводе запроса при использовании сжатия zstd"}]}]}/>

Может использоваться, когда метод сжатия выходных данных — `zstd`. Если значение больше `0`, этот параметр явно задаёт размер окна сжатия (степень числа 2) и включает режим long-range для сжатия zstd. Это может помочь достичь лучшего коэффициента сжатия.

Возможные значения: неотрицательные числа. Обратите внимание, что если значение слишком маленькое или слишком большое, `zstdlib` выбросит исключение. Типичные значения — от `20` (размер окна = `1 МБ`) до `30` (размер окна = `1 ГБ`).

## output_format_parallel_formatting {#output_format_parallel_formatting} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает параллельное форматирование данных. Поддерживается только для форматов [TSV](/interfaces/formats/TabSeparated), [TSKV](/interfaces/formats/TSKV), [CSV](/interfaces/formats/CSV) и [JSONEachRow](/interfaces/formats/JSONEachRow).

Возможные значения:

- 1 — включено.
- 0 — отключено.

## page_cache_block_size {#page_cache_block_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1048576"},{"label": "Made this setting adjustable on a per-query level."}]}]}/>

Размер фрагментов файлов, которые сохраняются в кэше страниц в пространстве пользователя, в байтах. Все чтения, которые проходят через кэш, будут округлены до кратного этому размеру.

Этот параметр может настраиваться на уровне отдельного запроса, но записи кэша с разными размерами блоков не могут повторно использоваться. Изменение этого параметра фактически делает существующие записи в кэше недействительными.

Большее значение, например 1 MiB, подходит для запросов с высокой пропускной способностью, а меньшее значение, например 64 KiB, — для точечных запросов с низкой задержкой.

## page_cache_inject_eviction {#page_cache_inject_eviction} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Добавлен кэш страниц в пространстве пользователя"}]}]}/>

Кэш страниц в пространстве пользователя иногда будет случайным образом сбрасывать отдельные страницы. Предназначено для тестирования.

## page_cache_lookahead_blocks {#page_cache_lookahead_blocks} 

<SettingsInfoBlock type="UInt64" default_value="16" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "16"},{"label": "Этот параметр можно настраивать на уровне отдельного запроса."}]}]}/>

При промахе в кэше страниц в пространстве пользователя за один раз считывается до такого количества последовательных блоков из базового хранилища, если их также нет в кэше. Размер каждого блока — page_cache_block_size байт.

Большее значение подходит для высокопроизводительных запросов с большим объёмом данных, тогда как низколатентные точечные запросы будут работать лучше без опережающего чтения.

## parallel_distributed_insert_select {#parallel_distributed_insert_select} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "2"},{"label": "Включение параллельного распределённого INSERT SELECT по умолчанию"}]}]}/>

Включает параллельное распределённое выполнение запроса `INSERT ... SELECT`.

Если выполняются запросы вида `INSERT INTO distributed_table_a SELECT ... FROM distributed_table_b`, и обе таблицы используют один и тот же кластер, и обе таблицы либо [реплицируемые](../../engines/table-engines/mergetree-family/replication.md), либо нереплицируемые, то такой запрос обрабатывается локально на каждом сегменте.

Возможные значения:

- `0` — Отключено.
- `1` — `SELECT` будет выполняться на каждом сегменте из базовой таблицы движка `Distributed`.
- `2` — `SELECT` и `INSERT` будут выполняться на каждом сегменте из/в базовую таблицу движка `Distributed`.

При использовании этого SETTING необходимо задать `enable_parallel_replicas = 1`.

## parallel_hash_join_threshold {#parallel_hash_join_threshold} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100000"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-3","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

Когда используется хеш-алгоритм соединения, этот порог помогает выбрать между использованием `hash` и `parallel_hash` (только если доступна оценка размера правой таблицы).
Вариант `hash` используется, когда известно, что размер правой таблицы ниже этого порога.

## parallel_replica_offset {#parallel_replica_offset} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

Это внутренний параметр настройки, который не должен использоваться напрямую и отражает детали реализации режима parallel replicas. Этот параметр будет автоматически установлен сервером-инициатором для распределённых запросов к индексу реплики, участвующей в обработке запроса среди параллельных реплик.

## parallel_replicas_allow_in_with_subquery {#parallel_replicas_allow_in_with_subquery} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Если значение равно true, подзапрос для IN будет выполняться на каждой ведомой реплике"}]}]}/>

Если значение равно true, подзапрос для IN будет выполняться на каждой ведомой реплике.

## parallel_replicas_allow_materialized_views {#parallel_replicas_allow_materialized_views} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "Разрешает использование materialized view с параллельными репликами"}]}]}/>

Разрешает использование materialized view с параллельными репликами

## parallel_replicas_connect_timeout_ms {#parallel_replicas_connect_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="300" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "300"},{"label": "Отдельный тайм-аут подключения для запросов с параллельными репликами"}]}]}/>

Тайм-аут в миллисекундах для подключения к удалённой реплике при выполнении запроса с параллельными репликами. Если тайм-аут истекает, соответствующая реплика не используется для выполнения запроса.

## parallel_replicas_count {#parallel_replicas_count} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

Это внутренний параметр, не предназначенный для прямого использования, и является деталью реализации режима «parallel replicas». Этот параметр будет автоматически установлен инициирующим сервером для распределённых запросов и задаёт количество параллельных реплик, участвующих в обработке запроса.

## parallel_replicas_custom_key {#parallel_replicas_custom_key} 

<BetaBadge/>

Произвольное целочисленное выражение, которое можно использовать для разделения нагрузки между репликами для отдельной таблицы.
Значение может быть любым целочисленным выражением.

Предпочтительны простые выражения на основе первичного ключа.

Если SETTING используется в кластере, состоящем из одного сегмента с несколькими репликами, эти реплики будут преобразованы в виртуальные сегменты.
В противном случае оно будет вести себя так же, как ключ `SAMPLE`: будут использоваться несколько реплик каждого сегмента.

## parallel_replicas_custom_key_range_lower {#parallel_replicas_custom_key_range_lower} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Добавлены настройки для управления фильтром по диапазону при использовании параллельных реплик с динамическими сегментами"}]}]}/>

Позволяет фильтру типа `range` равномерно распределять работу между репликами на основе заданного пользователем диапазона `[parallel_replicas_custom_key_range_lower, INT_MAX]`.

При совместном использовании с [parallel_replicas_custom_key_range_upper](#parallel_replicas_custom_key_range_upper) позволяет фильтру равномерно распределять работу между репликами для диапазона `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]`.

Примечание: эта настройка не приводит к дополнительной фильтрации данных в процессе обработки запроса, а только изменяет точки, в которых фильтр по диапазону разбивает диапазон `[0, INT_MAX]` для параллельной обработки.

## parallel_replicas_custom_key_range_upper {#parallel_replicas_custom_key_range_upper} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Добавлены настройки для управления диапазонным фильтром при использовании параллельных реплик с динамическими сегментами. Значение 0 отключает верхнюю границу"}]}]}/>

Позволяет фильтру типа `range` равномерно распределять работу между репликами на основе пользовательского диапазона `[0, parallel_replicas_custom_key_range_upper]`. Значение 0 отключает верхнюю границу, устанавливая её равной максимальному значению выражения пользовательского ключа.

При совместном использовании с [parallel_replicas_custom_key_range_lower](#parallel_replicas_custom_key_range_lower) позволяет фильтру равномерно распределять работу между репликами для диапазона `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]`.

Примечание: эта настройка не приводит к дополнительной фильтрации данных в процессе обработки запроса, а лишь изменяет точки, в которых диапазонный фильтр разбивает диапазон `[0, INT_MAX]` для параллельной обработки.

## parallel_replicas_for_cluster_engines {#parallel_replicas_for_cluster_engines} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "1"},{"label": "New setting."}]}]}/>

Заменяет движки табличных функций на их аналоги -Cluster

## parallel_replicas_for_non_replicated_merge_tree {#parallel_replicas_for_non_replicated_merge_tree} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение установлено в `true`, ClickHouse также будет использовать алгоритм параллельных реплик для нереплицируемых таблиц MergeTree.

## parallel_replicas_index_analysis_only_on_coordinator {#parallel_replicas_index_analysis_only_on_coordinator} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "Анализ индексов выполняется только на реплике-координаторе и не выполняется на остальных репликах. Действует только при включённом parallel_replicas_local_plan"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "Анализ индексов выполняется только на реплике-координаторе и не выполняется на остальных репликах. Действует только при включённом parallel_replicas_local_plan"}]}]}/>

Анализ индексов выполняется только на реплике-координаторе и не выполняется на остальных репликах. Действует только при включённом parallel_replicas_local_pla

## parallel_replicas_insert_select_local_pipeline {#parallel_replicas_insert_select_local_pipeline} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Использовать локальный конвейер при выполнении распределённой операции INSERT SELECT с параллельными репликами. В настоящее время отключён из-за проблем с производительностью"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "Использовать локальный конвейер при выполнении распределённой операции INSERT SELECT с параллельными репликами. В настоящее время отключён из-за проблем с производительностью"}]}]}/>

Использовать локальный конвейер при выполнении распределённой операции INSERT SELECT с параллельными репликами

## parallel_replicas_local_plan {#parallel_replicas_local_plan} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Использовать локальный план для локальной реплики в запросе с параллельными репликами"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "Использовать локальный план для локальной реплики в запросе с параллельными репликами"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "1"},{"label": "Использовать локальный план для локальной реплики в запросе с параллельными репликами"}]}]}/>

Строить локальный план для локальной реплики

## parallel_replicas_mark_segment_size {#parallel_replicas_mark_segment_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Значение для этого SETTING теперь определяется автоматически"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "128"},{"label": "Добавлен новый SETTING для управления размером сегмента в новой реализации координатора параллельных реплик"}]}]}/>

Части виртуально делятся на сегменты для распределения между репликами при параллельном чтении. Этот параметр определяет размер этих сегментов. Не рекомендуется изменять его, пока вы не будете полностью уверены в своих действиях. Значение должно быть в диапазоне [128; 16384].

## parallel_replicas_min_number_of_rows_per_replica {#parallel_replicas_min_number_of_rows_per_replica} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает число реплик, используемых в запросе, значением (оценочное количество строк для чтения / min_number_of_rows_per_replica). Максимальное число по-прежнему ограничено параметром `max_parallel_replicas`.

## parallel_replicas_mode {#parallel_replicas_mode} 

<SettingsInfoBlock type="ParallelReplicasMode" default_value="read_tasks" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "read_tasks"},{"label": "Этот параметр был добавлен в рамках перевода функциональности parallel replicas в статус Beta"}]}]}/>

Тип фильтра, используемого с пользовательским ключом для parallel replicas. `default` — использовать операцию взятия по модулю для пользовательского ключа; `range` — использовать фильтр по диапазону для пользовательского ключа, перебирая все возможные значения его типа.

## parallel_replicas_only_with_analyzer {#parallel_replicas_only_with_analyzer} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Параллельные реплики поддерживаются только при включённом анализаторе"}]}]}/>

Чтобы использовать параллельные реплики, анализатор должен быть включён. При отключённом анализаторе выполнение запроса переходит к локальному, даже если включено параллельное чтение с реплик. Использование параллельных реплик без включённого анализатора не поддерживается.

## parallel_replicas_prefer_local_join {#parallel_replicas_prefer_local_join} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Если установлено значение true, JOIN может быть выполнен с использованием алгоритма параллельных реплик, и все хранилища правой части JOIN являются *MergeTree, будет использован локальный JOIN вместо GLOBAL JOIN."}]}]}/>

Если установлено значение true, JOIN может быть выполнен с использованием алгоритма параллельных реплик, и все хранилища правой части JOIN являются *MergeTree, будет использован локальный JOIN вместо GLOBAL JOIN.

## parallel_replicas_support_projection {#parallel_replicas_support_projection} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Новая настройка. Оптимизация проекций может применяться на параллельных репликах. Действует только при включённом parallel_replicas_local_plan и отключённом aggregation_in_order."}]}]}/>

Оптимизация проекций может применяться на параллельных репликах. Действует только при включённом parallel_replicas_local_plan и отключённом aggregation_in_order.

## parallel_view_processing {#parallel_view_processing} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает параллельную отправку данных в присоединённые представления вместо последовательной.

## parallelize_output_from_storages {#parallelize_output_from_storages} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "Разрешает параллелизм при выполнении запросов, читающих из file/url/s3/и т. д. Это может привести к изменению порядка строк."}]}]}/>

Включает параллельный вывод на шаге чтения из хранилища. При возможности позволяет распараллелить обработку запроса сразу после чтения из хранилища.

## parsedatetime_e_requires_space_padding {#parsedatetime_e_requires_space_padding} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Улучшена совместимость с MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

Форматтер '%e' в функции 'parseDateTime' ожидает, что однозначные значения дня будут дополняться пробелом; например, ' 2' принимается, а '2' приводит к ошибке.

## parsedatetime_parse_without_leading_zeros {#parsedatetime_parse_without_leading_zeros} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.11"},{"label": "1"},{"label": "Улучшена совместимость с MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

Спецификаторы формата '%c', '%l' и '%k' в функции 'parseDateTime' обрабатывают месяцы и часы без ведущих нулей.

## partial_merge_join_left_table_buffer_bytes {#partial_merge_join_left_table_buffer_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если значение не равно 0, объединяет блоки левой таблицы в более крупные для левой стороны partial merge join. При этом используется до 2× указанного объёма памяти на каждый поток, выполняющий соединение.

## partial_merge_join_rows_in_right_blocks {#partial_merge_join_rows_in_right_blocks} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

Ограничивает размер блоков данных правой части соединения в алгоритме частичного объединения методом слияния для запросов [JOIN](../../sql-reference/statements/select/join.md).

Сервер ClickHouse:

1.  Разбивает данные правой части соединения на блоки с количеством строк не более указанного значения.
2.  Индексирует каждый блок по его минимальным и максимальным значениям.
3.  Выгружает подготовленные блоки на диск, если это возможно.

Возможные значения:

- Любое положительное целое число. Рекомендуемый диапазон значений: \[1000, 100000\].

## partial_result_on_first_cancel {#partial_result_on_first_cancel} 

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет запросу возвращать частичный результат после его отмены.

## parts_to_delay_insert {#parts_to_delay_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если целевая таблица содержит как минимум такое количество активных частей в одной партиции, операции вставки в таблицу искусственно замедляются.

## parts_to_throw_insert {#parts_to_throw_insert} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если в одной партиции целевой таблицы число активных частей превышает это значение, будет выброшено исключение 'Too many parts ...'.

## per_part_index_stats {#per_part_index_stats} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Логирует статистику индекса по каждой части

## poll_interval {#poll_interval} 

<SettingsInfoBlock type="UInt64" default_value="10" />

Задерживать выполнение цикла ожидания запроса на сервере на указанное число секунд.

## postgresql_connection_attempt_timeout {#postgresql_connection_attempt_timeout} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "Позволяет управлять параметром 'connect_timeout' подключения PostgreSQL."}]}]}/>

Таймаут в секундах для отдельной попытки подключения к конечной точке PostgreSQL.
Значение передается как параметр `connect_timeout` URL подключения.

## postgresql_connection_pool_auto_close_connection {#postgresql_connection_pool_auto_close_connection} 

<SettingsInfoBlock type="Bool" default_value="0" />

Закрывать соединение перед возвратом его в пул.

## postgresql_connection_pool_retries {#postgresql_connection_pool_retries} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "Позволяет управлять количеством повторных попыток в пуле соединений PostgreSQL."}]}]}/>

Количество попыток повторного выполнения операций push/pop в пуле соединений PostgreSQL для движка таблицы и движка базы данных.

## postgresql_connection_pool_size {#postgresql_connection_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />

Размер пула подключений для табличного движка PostgreSQL и движка базы данных PostgreSQL.

## postgresql_connection_pool_wait_timeout {#postgresql_connection_pool_wait_timeout} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

Таймаут операций push/pop в пуле подключений при пустом пуле для движков PostgreSQL (движка таблиц и движка баз данных). По умолчанию при пустом пуле операции будут блокироваться.

## postgresql_fault_injection_probability {#postgresql_fault_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "New setting"}]}]}/>

Примерная вероятность отказа выполнения внутренних (для репликации) запросов PostgreSQL. Допустимое значение — в интервале [0.0f, 1.0f].

## prefer&#95;column&#95;name&#95;to&#95;alias {#prefer_column_name_to_alias}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает использование исходных имен столбцов вместо псевдонимов в выражениях и предложениях запроса. Это особенно важно, когда псевдоним совпадает с именем столбца, см. раздел [Псевдонимы выражений](/sql-reference/syntax#notes-on-usage). Включите этот параметр, чтобы сделать правила синтаксиса псевдонимов в ClickHouse более совместимыми с большинством других движков баз данных.

Возможные значения:

* 0 — имя столбца заменяется псевдонимом.
* 1 — имя столбца не заменяется псевдонимом.

**Пример**

Разница между включенным и отключенным параметром:

Запрос:

```sql
SET prefer_column_name_to_alias = 0;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

Результат:

```text
Получено исключение от сервера (версия 21.5.1):
Код: 184. DB::Exception: Получено от localhost:9000. DB::Exception: Агрегатная функция avg(number) обнаружена внутри другой агрегатной функции в запросе: При обработке avg(number) AS number.
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


## prefer_external_sort_block_bytes {#prefer_external_sort_block_bytes} 

<SettingsInfoBlock type="UInt64" default_value="16744704" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "16744704"},{"label": "Использовать максимально возможный размер блока для внешней сортировки, чтобы уменьшить использование памяти при слиянии."}]}]}/>

Использовать максимально возможный размер блока для внешней сортировки, чтобы уменьшить использование памяти при слиянии.

## prefer_global_in_and_join {#prefer_global_in_and_join} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает замену операторов `IN`/`JOIN` на `GLOBAL IN`/`GLOBAL JOIN`.

Возможные значения:

- 0 — Отключено. Операторы `IN`/`JOIN` не заменяются на `GLOBAL IN`/`GLOBAL JOIN`.
- 1 — Включено. Операторы `IN`/`JOIN` заменяются на `GLOBAL IN`/`GLOBAL JOIN`.

**Использование**

Хотя `SET distributed_product_mode=global` может изменить поведение запросов для distributed таблиц, он не подходит для локальных таблиц или таблиц из внешних ресурсов. В таких случаях используется настройка `prefer_global_in_and_join`.

Например, у нас есть узлы обработки запросов, которые содержат локальные таблицы, не предназначенные для распределения. Нам нужно распределять их данные на лету во время распределённой обработки с использованием ключевого слова `GLOBAL` — `GLOBAL IN`/`GLOBAL JOIN`.

Ещё один вариант использования `prefer_global_in_and_join` — доступ к таблицам, созданным внешними движками. Эта настройка помогает сократить число обращений к внешним источникам при соединении таких таблиц: только один вызов на каждый запрос.

**См. также:**

- [Distributed subqueries](/sql-reference/operators/in#distributed-subqueries) для получения дополнительной информации о том, как использовать `GLOBAL IN`/`GLOBAL JOIN`

## prefer_localhost_replica {#prefer_localhost_replica} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает приоритетное использование локальной реплики (localhost) при обработке распределённых запросов.

Возможные значения:

- 1 — ClickHouse всегда отправляет запрос на локальную реплику, если она существует.
- 0 — ClickHouse использует стратегию балансировки нагрузки, заданную настройкой [load_balancing](#load_balancing).

:::note
Отключите эту настройку, если вы используете [max_parallel_replicas](#max_parallel_replicas) без [parallel_replicas_custom_key](#parallel_replicas_custom_key).
Если задан [parallel_replicas_custom_key](#parallel_replicas_custom_key), отключайте эту настройку только в том случае, если он используется в кластере с несколькими сегментами, содержащими несколько реплик.
Если он используется в кластере с одним сегментом и несколькими репликами, отключение этой настройки приведёт к негативным последствиям.
:::

## prefer_warmed_unmerged_parts_seconds {#prefer_warmed_unmerged_parts_seconds} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

Действует только в ClickHouse Cloud. Если слитая часть младше указанного количества секунд и не была заранее прогрета (см. [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch)), но все ее исходные части доступны и заранее прогреты, запросы SELECT будут читать данные из этих исходных частей вместо слитой. Применяется только для Replicated-/SharedMergeTree. Обратите внимание, что здесь проверяется только, была ли часть обработана CacheWarmer; если часть была загружена в кэш чем-то другим, она все равно будет считаться «холодной», пока до нее не дойдет CacheWarmer; если часть была прогрета, а затем вытеснена из кэша, она по-прежнему будет считаться «теплой».

## preferred_block_size_bytes {#preferred_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

Этот параметр регулирует размер блока данных для обработки запроса и является дополнительной, более тонкой настройкой по сравнению с более грубым параметром `max_block_size`. Если столбцы большие и при числе строк, равном `max_block_size`, размер блока, вероятнее всего, превышает заданное количество байт, его размер будет уменьшен для улучшения локальности кэша CPU.

## preferred_max_column_in_block_size_bytes {#preferred_max_column_in_block_size_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на максимально допустимый размер столбца в блоке при чтении. Помогает уменьшить количество промахов кэша. Значение должно быть близко к размеру кэша L2.

## preferred_optimize_projection_name {#preferred_optimize_projection_name} 

Если задано непустое строковое значение, ClickHouse будет пытаться использовать указанную проекцию в запросе.

Возможные значения:

- string: имя предпочитаемой проекции

## prefetch_buffer_size {#prefetch_buffer_size} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Максимальный размер буфера предварительного чтения из файловой системы.

## print&#95;pretty&#95;type&#95;names {#print_pretty_type_names}

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "Улучшенный пользовательский опыт."}]}]} />

Позволяет выводить глубоко вложенные имена типов в удобочитаемом формате с отступами в запросе `DESCRIBE` и в функции `toTypeName()`.

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


## priority {#priority} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Приоритет запроса. 1 — наивысший, чем больше значение, тем ниже приоритет; 0 — приоритет не используется.

## promql_database {#promql_database} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "Новый экспериментальный параметр"}]}]}/>

Указывает имя базы данных, используемой диалектом «promql». Пустая строка означает текущую базу данных.

## promql_evaluation_time {#promql_evaluation_time} 

<ExperimentalBadge/>

**Псевдонимы**: `evaluation_time`

<SettingsInfoBlock type="FloatAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "auto"},{"label": "Параметр был переименован. Предыдущее имя — `evaluation_time`."}]}]}/>

Устанавливает время вычисления, используемое для диалекта PromQL. Значение `auto` означает текущее время.

## promql_table {#promql_table} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "Новый экспериментальный параметр"}]}]}/>

Указывает имя таблицы TimeSeries, используемой диалектом promql.

## push_external_roles_in_interserver_queries {#push_external_roles_in_interserver_queries} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting."}]}]}/>

Включает передачу пользовательских ролей с узла-инициатора на другие узлы при выполнении запроса.

## query_cache_compress_entries {#query_cache_compress_entries} 

<SettingsInfoBlock type="Bool" default_value="1" />

Сжимает записи в [кэше запросов](../query-cache.md). Это уменьшает потребление памяти кэшем запросов за счёт более медленных операций вставки и чтения.

Возможные значения:

- 0 — отключено
- 1 — включено

## query_cache_max_entries {#query_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество результатов запросов, которые текущий пользователь может хранить в [кэше запросов](../query-cache.md). 0 означает отсутствие ограничений.

Возможные значения:

- Целое неотрицательное число (>= 0).

## query_cache_max_size_in_bytes {#query_cache_max_size_in_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объем памяти (в байтах), который текущий пользователь может выделить в [кеше запросов](../query-cache.md). Значение `0` означает отсутствие ограничений.

Возможные значения:

- Положительное целое число >= 0.

## query_cache_min_query_duration {#query_cache_min_query_duration} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Минимальная длительность выполнения запроса в миллисекундах, при которой его результат сохраняется в [кэше запросов](../query-cache.md).

Возможные значения:

- Положительное целое число >= 0.

## query_cache_min_query_runs {#query_cache_min_query_runs} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество запусков запроса `SELECT` до того, как его результат будет сохранён в [кеше запросов](../query-cache.md).

Возможные значения:

- Целое число >= 0.

## query_cache_nondeterministic_function_handling {#query_cache_nondeterministic_function_handling} 

<SettingsInfoBlock type="QueryResultCacheNondeterministicFunctionHandling" default_value="throw" />

Определяет, как [кэш запросов](../query-cache.md) обрабатывает запросы `SELECT` с недетерминированными функциями, такими как `rand()` или `now()`.

Возможные значения:

- `'throw'` — вызывать исключение и не кэшировать результат запроса.
- `'save'` — кэшировать результат запроса.
- `'ignore'` — не кэшировать результат запроса и не вызывать исключение.

## query_cache_share_between_users {#query_cache_share_between_users} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если включено, результат запросов `SELECT`, кэшированных в [query cache](../query-cache.md), может быть прочитан другими пользователями.
По соображениям безопасности не рекомендуется включать эту настройку.

Возможные значения:

- 0 - Отключено
- 1 - Включено

## query_cache_squash_partial_results {#query_cache_squash_partial_results} 

<SettingsInfoBlock type="Bool" default_value="1" />

Объединяет блоки частичных результатов в блоки размера [max_block_size](#max_block_size). Уменьшает производительность вставок в [кэш запросов](../query-cache.md), но улучшает сжимаемость элементов кэша (см. [query_cache_compress-entries](#query_cache_compress_entries)).

Возможные значения:

- 0 — Отключено
- 1 — Включено

## query_cache_system_table_handling {#query_cache_system_table_handling} 

<SettingsInfoBlock type="QueryResultCacheSystemTableHandling" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "throw"},{"label": "Кэш запросов больше не сохраняет результаты запросов к системным таблицам"}]}]}/>

Определяет, как [кэш запросов](../query-cache.md) обрабатывает запросы `SELECT` к системным таблицам, то есть таблицам в базах данных `system.*` и `information_schema.*`.

Возможные значения:

- `'throw'` — Выдавать исключение и не кэшировать результат запроса.
- `'save'` — Кэшировать результат запроса.
- `'ignore'` — Не кэшировать результат запроса и не выдавать исключение.

## query_cache_tag {#query_cache_tag} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": ""},{"label": "Новая настройка для пометки записей в кэше запросов."}]}]}/>

Строка, которая используется как метка для записей [кэша запросов](../query-cache.md).
Одинаковые запросы с разными тегами считаются различными для кэша запросов.

Возможные значения:

- Любая строка

## query_cache_ttl {#query_cache_ttl} 

<SettingsInfoBlock type="Seconds" default_value="60" />

По истечении указанного количества секунд записи в [кэше запросов](../query-cache.md) считаются устаревшими.

Возможные значения:

- Положительное целое число >= 0.

## query_condition_cache_store_conditions_as_plaintext {#query_condition_cache_store_conditions_as_plaintext} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Сохраняет условие фильтра для [кэша условий запроса](/operations/query-condition-cache) в виде открытого текста.
Если параметр включён, system.query_condition_cache показывает условие фильтра дословно, что упрощает отладку проблем с кэшем.
По умолчанию параметр отключён, так как условия фильтра в открытом виде могут раскрывать конфиденциальную информацию.

Возможные значения:

- 0 — Отключено
- 1 — Включено

## query_metric_log_interval {#query_metric_log_interval} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "-1"},{"label": "Новая настройка."}]}]}/>

Интервал в миллисекундах, с которым собирается [query_metric_log](../../operations/system-tables/query_metric_log.md) для отдельных запросов.

Если задано отрицательное значение, будет использоваться значение `collect_interval_milliseconds` из [настройки query_metric_log](/operations/server-configuration-parameters/settings#query_metric_log), либо 1000 по умолчанию, если оно не задано.

Чтобы отключить сбор метрик для отдельного запроса, установите `query_metric_log_interval` в 0.

Значение по умолчанию: -1

## query_plan_aggregation_in_order {#query_plan_aggregation_in_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.12"},{"label": "1"},{"label": "Включает часть рефакторинга, связанного с планом запроса"}]}]}/>

Переключает оптимизацию агрегирования in-order на уровне плана запроса.
Оказывает эффект только если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) установлена в 1.

:::note
Это экспертная настройка, которую следует использовать только для отладки разработчиками. В будущем она может быть изменена с нарушением обратной совместимости или удалена.
:::

Возможные значения:

- 0 - Отключено
- 1 - Включено

## query_plan_convert_any_join_to_semi_or_anti_join {#query_plan_convert_any_join_to_semi_or_anti_join} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

Разрешает преобразовывать ANY JOIN в SEMI или ANTI JOIN, если фильтр после JOIN всегда принимает значение `false` для несопоставленных или сопоставленных строк

## query_plan_convert_join_to_in {#query_plan_convert_join_to_in} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

Позволяет преобразовывать `JOIN` в подзапрос с `IN`, если выходные столбцы зависят только от левой таблицы. Может приводить к неверным результатам для типов JOIN, отличных от ANY (например, ALL JOIN, который используется по умолчанию).

## query_plan_convert_outer_join_to_inner_join {#query_plan_convert_outer_join_to_inner_join} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "Разрешить преобразование OUTER JOIN в INNER JOIN, если фильтр после JOIN всегда отфильтровывает только значения по умолчанию"}]}]}/>

Разрешает преобразовывать `OUTER JOIN` в `INNER JOIN`, если фильтр после `JOIN` всегда отфильтровывает только значения по умолчанию

## query_plan_direct_read_from_text_index {#query_plan_direct_read_from_text_index} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

Позволяет выполнять фильтрацию результатов полнотекстового поиска, используя только инвертированный текстовый индекс в плане выполнения запроса.

## query_plan_display_internal_aliases {#query_plan_display_internal_aliases} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "Новый параметр"}]}]}/>

Показывать внутренние псевдонимы (например, __table1) в выводе EXPLAIN PLAN вместо тех, что указаны в исходном запросе.

## query_plan_enable_multithreading_after_window_functions {#query_plan_enable_multithreading_after_window_functions} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает многопоточность после вычисления оконных функций, позволяя выполнять параллельную обработку потоков

## query_plan_enable_optimizations {#query_plan_enable_optimizations} 

<SettingsInfoBlock type="Bool" default_value="1" />

Переключает оптимизацию запроса на уровне плана запроса.

:::note
Это настройка экспертного уровня, которую следует использовать только для отладки разработчиками. В будущем эта настройка может измениться несовместимым с предыдущими версиями образом или быть удалена.
:::

Возможные значения:

- 0 - Отключить все оптимизации на уровне плана запроса
- 1 - Включить оптимизации на уровне плана запроса (но отдельные оптимизации всё ещё могут быть отключены через соответствующие параметры)

## query_plan_execute_functions_after_sorting {#query_plan_execute_functions_after_sorting} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию на уровне плана запроса, которая переносит вычисление выражений на этапы после сортировки.
Применяется только если параметр [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) установлен в значение 1.

:::note
Это параметр для экспертов, который должен использоваться только для отладки разработчиками. В будущем его поведение может измениться с нарушением обратной совместимости или он может быть удалён.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_filter_push_down {#query_plan_filter_push_down} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию на уровне плана запроса, которая переносит фильтры ниже по плану выполнения.
Начинает действовать только если настройка [query_plan_enable_optimizations](#query_plan_enable_optimizations) имеет значение 1.

:::note
Это параметр для экспертов, который разработчикам следует использовать только для отладки. В будущем он может быть изменён несовместимым образом или удалён.
:::

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_join_shard_by_pk_ranges {#query_plan_join_shard_by_pk_ranges} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

Применять разбиение на сегменты при выполнении JOIN, если ключи соединения содержат префикс PRIMARY KEY для обеих таблиц. Поддерживается для алгоритмов hash, parallel_hash и full_sorting_merge. Обычно не ускоряет запросы, но может снизить потребление памяти.

## query_plan_join_swap_table {#query_plan_join_swap_table} 

<SettingsInfoBlock type="BoolAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "auto"},{"label": "Новая настройка. Ранее всегда выбиралась правая таблица."}]}]}/>

Определяет, какая сторона соединения должна быть таблицей построения (также называемой внутренней, то есть той, которая вставляется в хеш-таблицу при хеш-соединении) в плане выполнения запроса. Эта настройка поддерживается только для строгости соединения `ALL` с использованием предложения `JOIN ON`. Возможные значения:

- 'auto': планировщик сам выбирает таблицу, которую использовать в качестве таблицы построения.
    - 'false': никогда не менять таблицы местами (таблица построения — правая таблица).
    - 'true': всегда менять таблицы местами (таблица построения — левая таблица).

## query_plan_lift_up_array_join {#query_plan_lift_up_array_join} 

<SettingsInfoBlock type="Bool" default_value="1" />

Переключает оптимизацию на уровне плана запроса, которая поднимает операции ARRAY JOIN вверх по плану выполнения.
Применяется только если настройка [query_plan_enable_optimizations](#query_plan_enable_optimizations) установлена в 1.

:::note
Это настройка экспертного уровня, которая должна использоваться только для отладки разработчиками. В будущем настройка может быть изменена с нарушением обратной совместимости или удалена.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_lift_up_union {#query_plan_lift_up_union} 

<SettingsInfoBlock type="Bool" default_value="1" />

Переключает оптимизацию на уровне плана запроса, которая перемещает более крупные поддеревья плана запроса в `UNION`, чтобы позволить дальнейшие оптимизации.
Действует только в том случае, если параметр [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) равен 1.

:::note
Это настройка для экспертов, которая должна использоваться только разработчиками для отладки. В будущем настройка может измениться с нарушением обратной совместимости или быть удалена.
:::

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_max_limit_for_lazy_materialization {#query_plan_max_limit_for_lazy_materialization} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "10"},{"label": "Добавлена новая настройка, задающая максимальное значение лимита, при котором может использоваться план запроса для оптимизации ленивой материализации. Если значение равно нулю, лимит отсутствует"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "10000"},{"label": "Лимит увеличен после улучшения производительности"}]}, {"id": "row-3","items": [{"label": "25.11"},{"label": "100"},{"label": "Более оптимальное значение"}]}]}/>

Задает максимальное значение лимита, при котором может использоваться план запроса для оптимизации ленивой материализации. Если значение равно нулю, лимит отсутствует.

## query_plan_max_limit_for_top_k_optimization {#query_plan_max_limit_for_top_k_optimization} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1000"},{"label": "Новая настройка"}]}]}/>

Определяет максимальное значение `LIMIT`, при котором выполняется оценка плана запроса для оптимизации TopK с использованием индекса пропуска minmax и динамической фильтрации по пороговому значению. Если значение равно нулю, ограничение отсутствует.

## query_plan_max_optimizations_to_apply {#query_plan_max_optimizations_to_apply} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Ограничивает общее количество оптимизаций, применяемых к плану выполнения запроса, см. настройку [query_plan_enable_optimizations](#query_plan_enable_optimizations).
Полезна для предотвращения слишком долгой оптимизации сложных запросов.
В запросе EXPLAIN PLAN оптимизации перестают применяться после достижения этого лимита, и возвращается план как есть.
При обычном выполнении запроса, если фактическое число оптимизаций превышает это значение, генерируется исключение.

:::note
Это настройка для экспертов, которую следует использовать только для отладки разработчиками. В будущем настройка может измениться несовместимым образом или быть удалена.
:::

## query_plan_max_step_description_length {#query_plan_max_step_description_length} 

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "500"},{"label": "Новая настройка"}]}]}/>

Максимальная длина описания шага в EXPLAIN PLAN.

## query_plan_merge_expressions {#query_plan_merge_expressions} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию на уровне плана запроса, которая объединяет последовательные фильтры.
Применяется только в том случае, если параметр [query_plan_enable_optimizations](#query_plan_enable_optimizations) имеет значение 1.

:::note
Это параметр для экспертов, который должен использоваться только для отладки разработчиками. В будущем он может быть изменён с нарушением обратной совместимости или удалён.
:::

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_merge_filter_into_join_condition {#query_plan_merge_filter_into_join_condition} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Добавлена новая настройка для объединения фильтра с условием `JOIN`"}]}]}/>

Позволяет объединять фильтр с условием `JOIN` и преобразовывать `CROSS JOIN` в `INNER JOIN`.

## query_plan_merge_filters {#query_plan_merge_filters} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Разрешить объединение фильтров в плане запроса"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "Разрешить объединение фильтров в плане запроса. Это необходимо для корректной поддержки механизма filter-push-down новым анализатором."}]}]}/>

Разрешить объединение фильтров в плане запроса.

## query_plan_optimize_join_order_algorithm {#query_plan_optimize_join_order_algorithm} 

<ExperimentalBadge/>

<SettingsInfoBlock type="JoinOrderAlgorithm" default_value="greedy" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "greedy"},{"label": "Новая экспериментальная настройка."}]}]}/>

Определяет, какие алгоритмы выбора порядка JOIN следует пробовать при оптимизации плана запроса. Доступны следующие алгоритмы:

- 'greedy' — базовый жадный алгоритм, работает быстро, но может не дать наилучший порядок соединения;
- 'dpsize' — реализует алгоритм DPsize (в данный момент только для INNER JOIN); рассматривает все возможные порядки соединения и находит оптимальный, но может работать медленно для запросов с большим количеством таблиц и предикатов соединения.

Можно указать несколько алгоритмов, например: 'dpsize,greedy'.

## query_plan_optimize_join_order_limit {#query_plan_optimize_join_order_limit} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "Новая настройка"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "10"},{"label": "По умолчанию разрешить перестановку JOIN для большего числа таблиц"}]}]}/>

Оптимизирует порядок операций JOIN в рамках одного подзапроса. В настоящее время поддерживается только для очень ограниченных случаев.
Значение задаёт максимальное количество таблиц, для которых выполняется оптимизация.

## query_plan_optimize_lazy_materialization {#query_plan_optimize_lazy_materialization} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Добавлена новая настройка для использования плана запроса при оптимизации ленивой материализации"}]}]}/>

Использует план запроса для оптимизации ленивой материализации.

## query_plan_optimize_prewhere {#query_plan_optimize_prewhere} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Разрешает проталкивать фильтр в выражение PREWHERE для поддерживаемых хранилищ"}]}]}/>

Разрешает проталкивать фильтр в выражение PREWHERE для поддерживаемых хранилищ

## query_plan_push_down_limit {#query_plan_push_down_limit} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию на уровне плана запроса, которая проталкивает операторы LIMIT вниз по плану выполнения.
Применяется только, если настройка [query_plan_enable_optimizations](#query_plan_enable_optimizations) установлена в 1.

:::note
Это настройка для экспертов, предназначенная исключительно для использования разработчиками при отладке. В будущем она может измениться с нарушением обратной совместимости или быть удалена.
:::

Возможные значения:

- 0 — отключить
- 1 — включить

## query_plan_read_in_order {#query_plan_read_in_order} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию чтения в исходном порядке на уровне плана запроса.
Вступает в силу только если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка для экспертов, которую разработчики должны использовать только для отладки. В будущем она может быть изменена с нарушением обратной совместимости или удалена.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_read_in_order_through_join {#query_plan_read_in_order_through_join} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

Сохраняет порядок чтения строк из левой таблицы в операциях JOIN, что может быть использовано последующими шагами.

## query_plan_remove_redundant_distinct {#query_plan_remove_redundant_distinct} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "1"},{"label": "Удаление избыточного шага Distinct в плане запроса"}]}]}/>

Переключает оптимизацию на уровне плана запроса, которая удаляет избыточные шаги DISTINCT.
Вступает в силу только если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) установлена в 1.

:::note
Это настройка для экспертов, предназначенная только для отладки разработчиками. В будущем она может быть изменена несовместимым образом или удалена.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_remove_redundant_sorting {#query_plan_remove_redundant_sorting} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.1"},{"label": "1"},{"label": "Удаление избыточных операций сортировки в плане запроса. Например, шагов сортировки, связанных с предложениями ORDER BY в подзапросах"}]}]}/>

Переключает оптимизацию на уровне плана запроса, которая удаляет избыточные шаги сортировки, например в подзапросах.
Вступает в силу только если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка для экспертов, которая должна использоваться только разработчиками для отладки. В будущем её поведение может измениться несовместимым образом или она может быть удалена.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_remove_unused_columns {#query_plan_remove_unused_columns} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "Новая настройка. Добавлена оптимизация для удаления неиспользуемых столбцов в плане запроса."}]}]}/>

Переключает оптимизацию на уровне плана запроса, которая пытается удалить неиспользуемые столбцы (как входные, так и выходные) из шагов плана запроса.
Оказывает эффект только если настройка [query_plan_enable_optimizations](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка уровня экспертов, которую разработчики должны использовать только для отладки. В будущем она может измениться без сохранения обратной совместимости или быть удалена.
:::

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_reuse_storage_ordering_for_window_functions {#query_plan_reuse_storage_ordering_for_window_functions} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию на уровне плана запроса, которая использует сортировку в хранилище при сортировке для оконных функций.
Применяется только если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) имеет значение 1.

:::note
Это настройка для экспертов, которую разработчикам следует использовать только для отладки. В будущем она может измениться несовместимым с предыдущими версиями образом или быть удалена.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_split_filter {#query_plan_split_filter} 

<SettingsInfoBlock type="Bool" default_value="1" />

:::note
Это настройка экспертного уровня, которую следует использовать только разработчикам для отладки. В будущем она может измениться с нарушением обратной совместимости или быть удалена.
:::

Включает оптимизацию на уровне плана запроса, которая разбивает фильтры на выражения.
Оказывает эффект только если настройка [query_plan_enable_optimizations](#query_plan_enable_optimizations) установлена в 1.

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_text_index_add_hint {#query_plan_text_index_add_hint} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

Разрешает добавлять подсказку (дополнительный предикат) к фильтрации на основе инвертированного текстового индекса в плане запроса.

## query_plan_try_use_vector_search {#query_plan_try_use_vector_search} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Новая настройка."}]}]}/>

Переключает оптимизацию на уровне плана запроса, которая пытается использовать индекс векторного сходства.
Вступает в силу только если значение настройки [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) равно 1.

:::note
Это параметр для экспертов, который должен использоваться только разработчиками для отладки. Параметр может измениться в будущем с нарушением обратной совместимости или быть удалён.
:::

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_use_new_logical_join_step {#query_plan_use_new_logical_join_step} 

**Псевдонимы**: `query_plan_use_logical_join_step`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Включить новый шаг"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Новый шаг логического JOIN, внутреннее изменение"}]}]}/>

Использует логический шаг JOIN в плане запроса.  
Примечание: настройка `query_plan_use_new_logical_join_step` устарела, вместо неё используйте `query_plan_use_logical_join_step`.

## query_profiler_cpu_time_period_ns {#query_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

Устанавливает период тактового таймера CPU для [профилировщика запросов](../../operations/optimizing-performance/sampling-query-profiler.md). Этот таймер учитывает только процессорное время.

Возможные значения:

- Положительное целое число наносекунд.

    Рекомендуемые значения:

            - 10000000 (100 раз в секунду) наносекунд и более для одиночных запросов.
            - 1000000000 (один раз в секунду) для профилирования на уровне всего кластера.

- 0 для отключения таймера.

См. также:

- Системная таблица [trace_log](/operations/system-tables/trace_log)

## query_profiler_real_time_period_ns {#query_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

Устанавливает период таймера по реальному времени для [query profiler](../../operations/optimizing-performance/sampling-query-profiler.md). Таймер по реальному времени отсчитывает время по настенным часам (wall-clock time).

Возможные значения:

- Положительное целое число в наносекундах.

    Рекомендуемые значения:

            - 10000000 (100 раз в секунду) наносекунд и меньше для одиночных запросов.
            - 1000000000 (раз в секунду) для профилирования всего кластера.

- 0 для отключения таймера.

См. также:

- Системная таблица [trace_log](/operations/system-tables/trace_log)

## queue_max_wait_ms {#queue_max_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Время ожидания в очереди запросов, если число одновременных запросов превышает максимально допустимое значение.

## rabbitmq_max_wait_ms {#rabbitmq_max_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

Время ожидания при чтении из RabbitMQ перед повторной попыткой.

## read_backoff_max_throughput {#read_backoff_max_throughput} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Настройка для уменьшения числа потоков при медленном чтении. События учитываются, когда пропускная способность чтения меньше указанного количества байт в секунду.

## read_backoff_min_concurrency {#read_backoff_min_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="1" />

Настройка, позволяющая стараться сохранять минимальное число потоков при медленном чтении.

## read_backoff_min_events {#read_backoff_min_events} 

<SettingsInfoBlock type="UInt64" default_value="2" />

Параметр для уменьшения числа потоков в случае медленного чтения. Количество событий, после достижения которого число потоков будет уменьшено.

## read_backoff_min_interval_between_events_ms {#read_backoff_min_interval_between_events_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

Параметр для уменьшения числа потоков в случае медленного чтения. Событие игнорируется, если с момента предыдущего прошло меньше определённого промежутка времени.

## read_backoff_min_latency_ms {#read_backoff_min_latency_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

Параметр для уменьшения числа потоков в случае медленного чтения. Учитываются только операции чтения, которые длятся не менее указанного времени.

## read_from_distributed_cache_if_exists_otherwise_bypass_cache {#read_from_distributed_cache_if_exists_otherwise_bypass_cache} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "Новый параметр"}]}]}/>

Действует только в ClickHouse Cloud. Аналогично read_from_filesystem_cache_if_exists_otherwise_bypass_cache, но для распределённого кэша.

## read_from_filesystem_cache_if_exists_otherwise_bypass_cache {#read_from_filesystem_cache_if_exists_otherwise_bypass_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использовать файловый кэш в пассивном режиме — использовать уже существующие записи в кэше, но не добавлять новые. Если включать этот параметр для тяжёлых ad‑hoc‑запросов и оставлять его выключенным для коротких запросов реального времени, это позволяет избежать трешинга кэша из‑за слишком тяжёлых запросов и повысить общую эффективность системы.

## read_from_page_cache_if_exists_otherwise_bypass_cache {#read_from_page_cache_if_exists_otherwise_bypass_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Добавлен кэш страниц в пространстве пользователя"}]}]}/>

Использовать кэш страниц в пространстве пользователя в пассивном режиме, аналогично read_from_filesystem_cache_if_exists_otherwise_bypass_cache.

## read_in_order_two_level_merge_threshold {#read_in_order_two_level_merge_threshold} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Минимальное число частей, которые нужно прочитать, чтобы выполнить предварительный шаг слияния при многопоточном чтении в порядке первичного ключа.

## read_in_order_use_buffering {#read_in_order_use_buffering} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "Использовать буферизацию перед слиянием при чтении в порядке первичного ключа"}]}]}/>

Использовать буферизацию перед слиянием при чтении в порядке первичного ключа. Это повышает параллелизм выполнения запросов.

## read_in_order_use_virtual_row {#read_in_order_use_virtual_row} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "Использовать виртуальную строку при чтении в порядке первичного ключа или его монотонной функции. Полезно при поиске по нескольким частям, так как затрагиваются только нужные части."}]}]}/>

Использовать виртуальную строку при чтении в порядке первичного ключа или его монотонной функции. Полезно при поиске по нескольким частям, так как затрагиваются только нужные части.

## read_overflow_mode {#read_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Что делать при превышении предела.

## read_overflow_mode_leaf {#read_overflow_mode_leaf} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что происходит, когда объём считываемых данных превышает один из лимитов на уровне листового узла.

Возможные значения:

- `throw`: сгенерировать исключение (по умолчанию).
- `break`: прекратить выполнение запроса и вернуть частичный результат.

## read_priority {#read_priority} 

<SettingsInfoBlock type="Int64" default_value="0" />

Приоритет чтения данных из локальной или удалённой файловой системы. Поддерживается только в методе 'pread_threadpool' для локальной файловой системы и в методе `threadpool` для удалённой файловой системы.

## read_through_distributed_cache {#read_through_distributed_cache} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Разрешает чтение из распределённого кэша

## readonly {#readonly} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 — без ограничений (чтение и запись разрешены). 1 — только запросы на чтение, а также изменение явно разрешённых настроек. 2 — только запросы на чтение, а также изменение настроек, за исключением настройки 'readonly'.

## receive_data_timeout_ms {#receive_data_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="2000" />

Таймаут ожидания получения первого пакета данных или пакета с положительным значением прогресса от реплики

## receive_timeout {#receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="300" />

Тайм-аут получения данных из сети, в секундах. Если за этот интервал не было получено ни одного байта, генерируется исключение. Если вы задаёте этот параметр на клиенте, то `send_timeout` для сокета также будет установлен на серверной стороне соединения.

## regexp_max_matches_per_row {#regexp_max_matches_per_row} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Задает максимальное количество совпадений одного регулярного выражения для одной строки. Используйте этот параметр для защиты от чрезмерного расхода памяти при использовании жадных регулярных выражений в функции [extractAllGroupsHorizontal](/sql-reference/functions/string-search-functions#extractAllGroupsHorizontal).

Возможные значения:

- Положительное целое число.

## reject_expensive_hyperscan_regexps {#reject_expensive_hyperscan_regexps} 

<SettingsInfoBlock type="Bool" default_value="1" />

Отклонять шаблоны, вычисление которых с использованием hyperscan, вероятнее всего, будет слишком ресурсоёмким (из‑за взрывного роста числа состояний NFA)

## remerge_sort_lowered_memory_bytes_ratio {#remerge_sort_lowered_memory_bytes_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />

Если использование памяти после повторной сортировки не снизится как минимум в заданное число раз, повторная сортировка будет отключена.

## remote_filesystem_read_method {#remote_filesystem_read_method} 

<SettingsInfoBlock type="String" default_value="threadpool" />

Метод чтения данных из удалённой файловой системы, одно из следующих значений: read, threadpool.

## remote_filesystem_read_prefetch {#remote_filesystem_read_prefetch} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать упреждающее чтение (prefetching) при чтении данных из удалённой файловой системы.

## remote_fs_read_backoff_max_tries {#remote_fs_read_backoff_max_tries} 

<SettingsInfoBlock type="UInt64" default_value="5" />

Максимальное количество повторных попыток чтения с задержкой (backoff)

## remote_fs_read_max_backoff_ms {#remote_fs_read_max_backoff_ms} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное время ожидания при попытке прочитать данные с удалённого диска.

## remote_read_min_bytes_for_seek {#remote_read_min_bytes_for_seek} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

Минимальный объём данных в байтах, необходимый при удалённом чтении (url, S3), чтобы выполнять переход по смещению (seek), а не последовательное чтение с отбросом данных.

## rename_files_after_processing {#rename_files_after_processing} 

- **Тип:** String

- **Значение по умолчанию:** Пустая строка

Этот параметр позволяет указать шаблон переименования для файлов, обрабатываемых табличной функцией `file`. Если параметр задан, все файлы, прочитанные табличной функцией `file`, будут переименованы по указанному шаблону с плейсхолдерами, но только если обработка файлов завершилась успешно.

### Подстановки {#placeholders}

- `%a` — Полное исходное имя файла (например, «sample.csv»).
- `%f` — Исходное имя файла без расширения (например, «sample»).
- `%e` — Исходное расширение файла с точкой (например, «.csv»).
- `%t` — Метка времени (в микросекундах).
- `%%` — Символ процента («%»).

### Пример {#example}

- Опция: `--rename_files_after_processing="processed_%f_%t%e"`

- Запрос: `SELECT * FROM file('sample.csv')`

Если чтение файла `sample.csv` прошло успешно, файл будет переименован в `processed_sample_1683473210851438.csv`

## replace_running_query {#replace_running_query} 

<SettingsInfoBlock type="Bool" default_value="0" />

При использовании HTTP-интерфейса можно передать параметр `query_id`. Это произвольная строка, которая служит идентификатором запроса.
Если в данный момент уже существует запрос от того же пользователя с тем же `query_id`, поведение зависит от параметра `replace_running_query`.

`0` (по умолчанию) – выбрасывать исключение (не разрешать выполнение запроса, если запрос с тем же `query_id` уже выполняется).

`1` – отменить старый запрос и начать выполнение нового.

Установите значение этого параметра равным 1 для реализации подсказок при задании условий сегментации. После ввода следующего символа, если старый запрос ещё не завершён, он должен быть отменён.

## replace_running_query_max_wait_ms {#replace_running_query_max_wait_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

Время ожидания завершения запроса с тем же `query_id`, когда включена настройка [replace_running_query](#replace_running_query).

Возможные значения:

- Положительное целое число.
- 0 — генерируется исключение, которое не позволяет запустить новый запрос, если сервер уже выполняет запрос с тем же `query_id`.

## replication_wait_for_inactive_replica_timeout {#replication_wait_for_inactive_replica_timeout} 

<SettingsInfoBlock type="Int64" default_value="120" />

Определяет, сколько времени (в секундах) ждать выполнения неактивными репликами запросов [`ALTER`](../../sql-reference/statements/alter/index.md), [`OPTIMIZE`](../../sql-reference/statements/optimize.md) или [`TRUNCATE`](../../sql-reference/statements/truncate.md).

Возможные значения:

- `0` — не ждать;
- отрицательное целое число — ждать неограниченное время;
- положительное целое число — количество секунд ожидания.

## restore_replace_external_dictionary_source_to_null {#restore_replace_external_dictionary_source_to_null} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "New setting."}]}]}/>

Заменять источники внешних словарей на Null при восстановлении. Полезно для тестирования.

## restore_replace_external_engines_to_null {#restore_replace_external_engines_to_null} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Для тестирования. Заменяет все внешние движки на Null, чтобы не инициировать внешние подключения.

## restore_replace_external_table_functions_to_null {#restore_replace_external_table_functions_to_null} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

В целях тестирования. Заменяет все внешние табличные функции на значение Null, чтобы не устанавливать внешние соединения.

## restore_replicated_merge_tree_to_shared_merge_tree {#restore_replicated_merge_tree_to_shared_merge_tree} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Меняет движок таблицы с Replicated*MergeTree на Shared*MergeTree во время выполнения RESTORE.

## result&#95;overflow&#95;mode {#result_overflow_mode}

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Значение по умолчанию в Cloud: `throw`

Определяет, что делать, если объем результата превышает один из лимитов.

Возможные значения:

* `throw`: сгенерировать исключение (по умолчанию).
* `break`: прекратить выполнение запроса и вернуть частичный результат, как если бы
  исходные данные закончились.

Использование `break` аналогично использованию LIMIT. `break` прерывает выполнение только на
уровне блока. Это означает, что количество возвращаемых строк будет больше, чем
значение [`max_result_rows`](/operations/settings/settings#max_result_rows), кратно [`max_block_size`](/operations/settings/settings#max_block_size)
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
6666 строк в наборе. ...
```


## rewrite_count_distinct_if_with_count_distinct_implementation {#rewrite_count_distinct_if_with_count_distinct_implementation} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.8"},{"label": "1"},{"label": "Переписывать countDistinctIf с конфигурацией count_distinct_implementation"}]}]}/>

Позволяет переписывать `countDistcintIf` с использованием настройки [count_distinct_implementation](#count_distinct_implementation).

Возможные значения:

- true — Разрешить.
- false — Запретить.

## rewrite_in_to_join {#rewrite_in_to_join} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

Преобразует выражения вида 'x IN subquery' в JOIN. Это может быть полезно для оптимизации всего запроса за счёт перестановки соединений (JOIN).

## s3_allow_multipart_copy {#s3_allow_multipart_copy} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Новая настройка."}]}]}/>

Разрешает многокомпонентное копирование в S3.

## s3_allow_parallel_part_upload {#s3_allow_parallel_part_upload} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использует несколько потоков для multipart-загрузки в S3. Это может привести к незначительному увеличению расхода памяти.

## s3_check_objects_after_upload {#s3_check_objects_after_upload} 

<SettingsInfoBlock type="Bool" default_value="0" />

Проверять каждый загруженный объект в S3 с помощью HEAD‑запроса, чтобы убедиться, что загрузка прошла успешно.

## s3_connect_timeout_ms {#s3_connect_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "Добавлена новая отдельная настройка для тайм-аута подключения к S3"}]}]}/>

Тайм-аут подключения к хосту для S3-дисков.

## s3_create_new_file_on_insert {#s3_create_new_file_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает создание нового файла при каждой вставке в таблицы движка s3. Если параметр включен, при каждой вставке будет создаваться новый объект S3 с ключом по шаблону, например:

`data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` и т.д.

Возможные значения:

- 0 — запрос `INSERT` создает новый файл или завершится с ошибкой, если файл уже существует и s3_truncate_on_insert не задан.
- 1 — запрос `INSERT` создает новый файл при каждой вставке, используя суффикс (начиная со второго), если s3_truncate_on_insert не задан.

Подробнее см. [здесь](/integrations/s3#inserting-data).

## s3_disable_checksum {#s3_disable_checksum} 

<SettingsInfoBlock type="Bool" default_value="0" />

Не вычислять контрольную сумму при отправке файла в S3. Это ускоряет операции записи, так как нет необходимости выполнять лишние проходы обработки файла. В большинстве случаев это безопасно, поскольку данные таблиц MergeTree в любом случае снабжаются контрольными суммами на стороне ClickHouse, а при доступе к S3 по HTTPS уровень TLS уже обеспечивает целостность данных при передаче по сети. При этом дополнительные контрольные суммы на S3 дают дополнительный уровень защиты.

## s3_ignore_file_doesnt_exist {#s3_ignore_file_doesnt_exist} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Позволяет возвращать 0 строк, когда запрошенные файлы отсутствуют, вместо генерации исключения в табличном движке S3"}]}]}/>

Игнорировать отсутствие файла при чтении определённых ключей.

Возможные значения:

- 1 — `SELECT` возвращает пустой результат.
- 0 — `SELECT` генерирует исключение.

## s3_list_object_keys_size {#s3_list_object_keys_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальное количество файлов, которое может быть возвращено в одном ответе на запрос ListObject

## s3_max_connections {#s3_max_connections} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

Максимальное количество соединений для одного сервера.

## s3_max_get_burst {#s3_max_get_burst} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество запросов, которые могут быть выполнены одновременно до достижения ограничения на число запросов в секунду. По умолчанию значение `0` соответствует `s3_max_get_rps`.

## s3_max_get_rps {#s3_max_get_rps} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Порог числа S3 GET-запросов в секунду, после которого включается ограничение скорости. Ноль означает отсутствие ограничений.

## s3_max_inflight_parts_for_one_file {#s3_max_inflight_parts_for_one_file} 

<SettingsInfoBlock type="UInt64" default_value="20" />

Максимальное количество одновременно загружаемых частей в запросе multipart-загрузки. 0 означает отсутствие ограничений.

## s3_max_part_number {#s3_max_part_number} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "10000"},{"label": "Максимальный номер части при многочастичной загрузке в S3"}]}]}/>

Максимальный номер части при многочастичной загрузке в S3.

## s3_max_put_burst {#s3_max_put_burst} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество запросов, которые могут быть выполнены одновременно до достижения предела запросов в секунду. По умолчанию значение `0` соответствует `s3_max_put_rps`.

## s3_max_put_rps {#s3_max_put_rps} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на скорость (RPS) запросов S3 PUT перед применением троттлинга. Ноль означает отсутствие ограничения.

## s3_max_single_operation_copy_size {#s3_max_single_operation_copy_size} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "33554432"},{"label": "Максимальный размер для одной операции копирования в S3"}]}]}/>

Максимальный размер для операции копирования за один вызов в S3. Этот SETTING используется только, если s3_allow_multipart_copy имеет значение true.

## s3_max_single_part_upload_size {#s3_max_single_part_upload_size} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

Максимальный размер объекта, загружаемого одной частью в S3.

## s3_max_single_read_retries {#s3_max_single_read_retries} 

<SettingsInfoBlock type="UInt64" default_value="4" />

Максимальное количество повторных попыток чтения из S3 за одну операцию.

## s3_max_unexpected_write_error_retries {#s3_max_unexpected_write_error_retries} 

<SettingsInfoBlock type="UInt64" default_value="4" />

Максимальное количество повторных попыток в случае непредвиденных ошибок при записи в S3.

## s3_max_upload_part_size {#s3_max_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

Максимальный размер части, загружаемой при многочастичной загрузке в S3.

## s3_min_upload_part_size {#s3_min_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="16777216" />

Минимальный размер части при многочастичной загрузке в S3.

## s3_path_filter_limit {#s3_path_filter_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1000"},{"label": "Новая настройка"}]}]}/>

Максимальное количество значений `_path`, которое может быть извлечено из фильтров запроса и использовано для итерации по файлам
вместо перечисления файлов по glob-шаблону. Значение 0 означает, что настройка отключена.

## s3_request_timeout_ms {#s3_request_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="30000" />

Таймаут простоя при отправке и получении данных в/из S3. Операция завершается с ошибкой, если отдельный вызов чтения или записи по TCP блокируется дольше этого значения.

## s3_skip_empty_files {#s3_skip_empty_files} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "Мы надеемся, что это обеспечит лучший UX"}]}]}/>

Включает или отключает пропуск пустых файлов в таблицах движка [S3](../../engines/table-engines/integrations/s3.md).

Возможные значения:

- 0 — `SELECT` выбрасывает исключение, если пустой файл не соответствует запрошенному формату.
- 1 — `SELECT` возвращает пустой результат для пустого файла.

## s3_slow_all_threads_after_network_error {#s3_slow_all_threads_after_network_error} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

Если установлено значение `true`, все потоки, выполняющие запросы к S3 к одной и той же конечной точке резервного копирования, замедляются
после того, как любой запрос к S3 сталкивается с повторяемой сетевой ошибкой, например тайм-аутом сокета.
Если установлено значение `false`, каждый поток обрабатывает задержку повторных запросов к S3 (backoff) независимо от остальных.

## s3_strict_upload_part_size {#s3_strict_upload_part_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Точный размер части, отправляемой при multipart-загрузке в S3 (некоторые реализации не поддерживают части переменного размера).

## s3_throw_on_zero_files_match {#s3_throw_on_zero_files_match} 

<SettingsInfoBlock type="Bool" default_value="0" />

Выдавать ошибку, если запрос ListObjects не находит ни одного файла

## s3_truncate_on_insert {#s3_truncate_on_insert} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает усечение (очистку) файлов перед вставками в таблицы с движком S3. При отключённой опции при попытке вставки будет сгенерировано исключение, если объект S3 уже существует.

Возможные значения:

- 0 — запрос `INSERT` создаёт новый файл или завершается с ошибкой, если файл уже существует и s3_create_new_file_on_insert не установлен.
- 1 — запрос `INSERT` заменяет существующее содержимое файла новыми данными.

Подробнее см. [здесь](/integrations/s3#inserting-data).

## s3_upload_part_size_multiply_factor {#s3_upload_part_size_multiply_factor} 

<SettingsInfoBlock type="UInt64" default_value="2" />

Умножайте s3_min_upload_part_size на этот коэффициент каждый раз, когда при одной операции записи в S3 было загружено s3_multiply_parts_count_threshold частей.

## s3_upload_part_size_multiply_parts_count_threshold {#s3_upload_part_size_multiply_parts_count_threshold} 

<SettingsInfoBlock type="UInt64" default_value="500" />

Каждый раз, когда в S3 загружается указанное количество частей, значение s3_min_upload_part_size умножается на s3_upload_part_size_multiply_factor.

## s3_use_adaptive_timeouts {#s3_use_adaptive_timeouts} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено значение `true`, для всех запросов к S3 первые две попытки выполняются с уменьшенными таймаутами отправки и получения.
Если установлено значение `false`, все попытки выполняются с одинаковыми таймаутами.

## s3_validate_request_settings {#s3_validate_request_settings} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Позволяет отключить проверку настроек запросов к S3"}]}]}/>

Включает проверку настроек запросов к S3.
Возможные значения:

- 1 — проверять настройки.
- 0 — не проверять настройки.

## s3queue_default_zookeeper_path {#s3queue_default_zookeeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/s3queue/" />

Префикс пути в ZooKeeper для движка S3Queue по умолчанию

## s3queue_enable_logging_to_s3queue_log {#s3queue_enable_logging_to_s3queue_log} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает запись в system.s3queue_log. Значение может быть переопределено для отдельной таблицы с помощью настроек таблицы.

## s3queue_keeper_fault_injection_probability {#s3queue_keeper_fault_injection_probability} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Вероятность инъекции отказов Keeper для S3Queue.

## s3queue_migrate_old_metadata_to_buckets {#s3queue_migrate_old_metadata_to_buckets} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "New setting."}]}]}/>

Перенос старой структуры метаданных таблицы S3Queue на новую.

## schema_inference_cache_require_modification_time_for_url {#schema_inference_cache_require_modification_time_for_url} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать схему из кэша для URL-адресов с проверкой времени последней модификации (для URL-адресов с заголовком Last-Modified)

## schema_inference_use_cache_for_azure {#schema_inference_use_cache_for_azure} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш при выводе схемы при использовании табличной функции azure

## schema_inference_use_cache_for_file {#schema_inference_use_cache_for_file} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш при определении схемы при использовании табличной функции file

## schema_inference_use_cache_for_hdfs {#schema_inference_use_cache_for_hdfs} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш при определении схемы для табличной функции hdfs

## schema_inference_use_cache_for_s3 {#schema_inference_use_cache_for_s3} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш при определении схемы при использовании табличной функции S3

## schema_inference_use_cache_for_url {#schema_inference_use_cache_for_url} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш при определении схемы при использовании табличной функции url

## secondary_indices_enable_bulk_filtering {#secondary_indices_enable_bulk_filtering} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Новый алгоритм фильтрации по индексам пропуска данных"}]}]}/>

Включает алгоритм пакетной фильтрации для индексов. Предполагается, что он всегда работает лучше, но эта настройка сохранена для совместимости и контроля.

## select_sequential_consistency {#select_sequential_consistency} 

<SettingsInfoBlock type="UInt64" default_value="0" />

:::note
Эта настройка отличается по поведению в SharedMergeTree и ReplicatedMergeTree. Дополнительную информацию о поведении `select_sequential_consistency` в SharedMergeTree см. в разделе [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency).
:::

Включает или отключает последовательную согласованность для запросов `SELECT`. Требует, чтобы `insert_quorum_parallel` был отключён (по умолчанию он включён).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

Использование

Когда последовательная согласованность включена, ClickHouse позволяет клиенту выполнять запрос `SELECT` только на тех репликах, которые содержат данные из всех предыдущих запросов `INSERT`, выполненных с `insert_quorum`. Если клиент обращается к реплике с неполными данными, ClickHouse выдаст исключение. Запрос `SELECT` не будет включать данные, которые ещё не были записаны в кворум реплик.

Когда `insert_quorum_parallel` включён (значение по умолчанию), `select_sequential_consistency` не работает. Это связано с тем, что параллельные запросы `INSERT` могут быть записаны в разные наборы реплик кворума, поэтому нет гарантии, что одна реплика получила все записи.

См. также:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)

## send_logs_level {#send_logs_level} 

<SettingsInfoBlock type="LogsLevel" default_value="fatal" />

Отправлять текстовые логи сервера клиенту с указанным минимальным уровнем. Допустимые значения: 'trace', 'debug', 'information', 'warning', 'error', 'fatal', 'none'

## send_logs_source_regexp {#send_logs_source_regexp} 

Отправлять текстовые серверные логи, имя источника которых соответствует указанному регулярному выражению. Пустое значение означает все источники.

## send_profile_events {#send_profile_events} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Новая настройка. Управляет отправкой событий профилирования клиентам."}]}]}/>

Включает или отключает отправку клиенту пакетов [ProfileEvents](/native-protocol/server.md#profile-events).

Можно отключить, чтобы сократить сетевой трафик для клиентов, которым не требуются события профилирования.

Возможные значения:

- 0 — отключено.
- 1 — включено.

## send_progress_in_http_headers {#send_progress_in_http_headers} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает HTTP-заголовки `X-ClickHouse-Progress` в ответах `clickhouse-server`.

Дополнительные сведения см. в [описании HTTP-интерфейса](/interfaces/http).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## send_timeout {#send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="300" />

Тайм-аут отправки данных по сети в секундах. Если клиенту необходимо отправить данные, но в течение этого интервала не удаётся отправить ни одного байта, генерируется исключение. Если вы задаёте этот параметр на клиенте, то `receive_timeout` для сокета также будет установлен на соответствующей стороне соединения на сервере.

## serialize_query_plan {#serialize_query_plan} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "NewSetting"}]}]}/>

Сериализовать план запроса для распределённой обработки

## serialize_string_in_memory_with_zero_byte {#serialize_string_in_memory_with_zero_byte} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

Сериализует значения типа String при агрегации с нулевым байтом в конце. Включите, чтобы сохранить совместимость при выполнении запросов к кластеру с несовместимыми версиями.

## session&#95;timezone {#session_timezone}

<BetaBadge />

Устанавливает неявный часовой пояс для текущей сессии или запроса.
Неявный часовой пояс — это часовой пояс, применяемый к значениям типа DateTime/DateTime64, для которых явно не указан часовой пояс.
Настройка имеет приоритет над глобально сконфигурированным (на уровне сервера) неявным часовым поясом.
Значение &#39;&#39; (пустая строка) означает, что неявный часовой пояс текущей сессии или запроса равен [часовому поясу сервера](../server-configuration-parameters/settings.md/#timezone).

Можно использовать функции `timeZone()` и `serverTimeZone()` для получения часового пояса сессии и часового пояса сервера.

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

Установите часовой пояс сеанса &#39;America/Denver&#39; для внутреннего DateTime без явно указанного часового пояса:

```sql
SELECT toDateTime64(toDateTime64('1999-12-12 23:23:23.123', 3), 3, 'Europe/Zurich') SETTINGS session_timezone = 'America/Denver' FORMAT TSV

1999-12-13 07:23:23.123
```

:::warning
Не все функции, которые обрабатывают DateTime/DateTime64, учитывают `session_timezone`. Это может приводить к малозаметным ошибкам.
См. следующий пример и пояснение.
:::

```sql
CREATE TABLE test_tz (`d` DateTime('UTC')) ENGINE = Memory AS SELECT toDateTime('2000-01-01 00:00:00', 'UTC');

SELECT *, timeZone() FROM test_tz WHERE d = toDateTime('2000-01-01 00:00:00') SETTINGS session_timezone = 'Asia/Novosibirsk'
0 строк в результате.

SELECT *, timeZone() FROM test_tz WHERE d = '2000-01-01 00:00:00' SETTINGS session_timezone = 'Asia/Novosibirsk'
┌───────────────────d─┬─timeZone()───────┐
│ 2000-01-01 00:00:00 │ Asia/Novosibirsk │
└─────────────────────┴──────────────────┘
```

Это происходит из-за различных конвейеров разбора:

* `toDateTime()` без явного указания часового пояса, используемая в первом запросе `SELECT`, учитывает настройку `session_timezone` и глобальный часовой пояс.
* Во втором запросе значение типа DateTime разбирается из значения типа String и наследует тип и часовой пояс существующего столбца `d`. Поэтому настройка `session_timezone` и глобальный часовой пояс не учитываются.

**См. также**

* [timezone](../server-configuration-parameters/settings.md/#timezone)


## set_overflow_mode {#set_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Задает, что происходит, когда объем данных превышает один из лимитов.

Возможные значения:

- `throw`: сгенерировать исключение (по умолчанию).
- `break`: остановить выполнение запроса и вернуть частичный результат, как если бы
исходные данные закончились.

## shared_merge_tree_sync_parts_on_partition_operations {#shared_merge_tree_sync_parts_on_partition_operations} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "Новая настройка. По умолчанию части всегда синхронизируются"}]}]}/>

Автоматически синхронизирует набор частей данных после операций с партициями MOVE|REPLACE|ATTACH в таблицах SMT. Только для Cloud

## short_circuit_function_evaluation {#short_circuit_function_evaluation} 

<SettingsInfoBlock type="ShortCircuitFunctionEvaluation" default_value="enable" />

Позволяет выполнять функции [if](../../sql-reference/functions/conditional-functions.md/#if), [multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf), [and](/sql-reference/functions/logical-functions#and) и [or](/sql-reference/functions/logical-functions#or) с использованием [укороченного (short-circuit) вычисления](https://en.wikipedia.org/wiki/Short-circuit_evaluation). Это помогает оптимизировать выполнение сложных выражений в этих функциях и предотвращать возможные исключения (например, деление на ноль в ветке, которая фактически не должна вычисляться).

Возможные значения:

- `enable` — Включает укороченное вычисление для функций, к которым оно применимо (которые могут выбрасывать исключения или являются вычислительно затратными).
- `force_enable` — Включает укороченное вычисление для всех функций.
- `disable` — Отключает укороченное вычисление функций.

## short_circuit_function_evaluation_for_nulls {#short_circuit_function_evaluation_for_nulls} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Разрешает выполнять функции с аргументами типа Nullable только для строк, в которых во всех аргументах нет значений NULL"}]}]}/>

Оптимизирует вычисление функций, которые возвращают NULL, если любой из аргументов равен NULL. Если доля значений NULL в аргументах функции превышает short_circuit_function_evaluation_for_nulls_threshold, система пропускает построчное вычисление функции. Вместо этого она немедленно возвращает NULL для всех строк, избегая лишних вычислений.

## short_circuit_function_evaluation_for_nulls_threshold {#short_circuit_function_evaluation_for_nulls_threshold} 

<SettingsInfoBlock type="Double" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Пороговое значение доли значений NULL, при котором функции с аргументами типа Nullable выполняются только для строк, где все аргументы имеют значения, отличные от NULL. Применяется, когда включена настройка short_circuit_function_evaluation_for_nulls."}]}]}/>

Пороговое значение доли значений NULL, при котором функции с аргументами типа Nullable выполняются только для строк, где все аргументы имеют значения, отличные от NULL. Применяется, когда включена настройка short_circuit_function_evaluation_for_nulls.
Если отношение количества строк, содержащих значения NULL, к общему количеству строк превышает этот порог, строки, содержащие значения NULL, не будут участвовать в вычислении.

## show_data_lake_catalogs_in_system_tables {#show_data_lake_catalogs_in_system_tables} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Новая настройка"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "По умолчанию каталоги в системных таблицах отключены"}]}]}/>

Включает отображение каталогов озер данных в системных таблицах.

## show_processlist_include_internal {#show_processlist_include_internal} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "New setting."}]}]}/>

Показывать внутренние служебные процессы в выводе запроса `SHOW PROCESSLIST`.

К внутренним процессам относятся перезагрузки словарей, перезагрузки refreshable materialized view, служебные `SELECT`-запросы, выполняемые в рамках `SHOW ...`-запросов, служебные `CREATE DATABASE ...`-запросы, выполняемые внутренне для обработки повреждённых таблиц, и другие.

## show_table_uuid_in_table_create_query_if_not_nil {#show_table_uuid_in_table_create_query_if_not_nil} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.7"},{"label": "0"},{"label": "Перестаёт отображать UID таблицы в её запросе CREATE для Engine=Atomic"}]}]}/>

Определяет формат отображения результата запроса `SHOW TABLE`.

Возможные значения:

- 0 — запрос отображается без UUID таблицы.
- 1 — запрос отображается с UUID таблицы.

## single_join_prefer_left_table {#single_join_prefer_left_table} 

<SettingsInfoBlock type="Bool" default_value="1" />

При одиночном JOIN в случае неоднозначности идентификаторов предпочитать левую таблицу

## skip&#95;redundant&#95;aliases&#95;in&#95;udf {#skip_redundant_aliases_in_udf}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "When enabled, this allows you to use the same user defined function several times for several materialized columns in the same table."}]}]} />

Избыточные псевдонимы не используются (подставляются) в определяемых пользователем функциях, чтобы упростить их использование.

Возможные значения:

* 1 — Псевдонимы пропускаются (подставляются) в UDF.
* 0 — Псевдонимы не пропускаются (подставляются) в UDF.

**Пример**

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


## skip_unavailable_shards {#skip_unavailable_shards} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает молчаливый пропуск недоступных сегментов.

Сегмент считается недоступным, если все его реплики недоступны. Реплика недоступна в следующих случаях:

- ClickHouse не может подключиться к реплике по любой причине.

    При подключении к реплике ClickHouse выполняет несколько попыток. Если все эти попытки завершаются неудачно, реплика считается недоступной.

- Имя реплики не удаётся разрешить через DNS.

    Если имя хоста реплики не может быть разрешено через DNS, это может указывать на следующие ситуации:

    - У хоста реплики нет DNS-записи. Это может происходить в системах с динамическим DNS, например, в [Kubernetes](https://kubernetes.io), где узлы могут быть неразрешимыми во время простоя, и это не является ошибкой.

    - Ошибка конфигурации. Конфигурационный файл ClickHouse содержит некорректное имя хоста.

Возможные значения:

- 1 — пропуск включён.

    Если сегмент недоступен, ClickHouse возвращает результат на основе неполных данных и не сообщает о проблемах с доступностью узла.

- 0 — пропуск выключен.

    Если сегмент недоступен, ClickHouse генерирует исключение.

## sleep_after_receiving_query_ms {#sleep_after_receiving_query_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Задержка после получения запроса в TCPHandler

## sleep_in_send_data_ms {#sleep_in_send_data_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Время паузы при отправке данных в TCPHandler

## sleep_in_send_tables_status_ms {#sleep_in_send_tables_status_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Время паузы при отправке ответа о статусе таблиц в TCPHandler

## sort_overflow_mode {#sort_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Задает поведение при превышении одного из лимитов количеством строк, полученных до сортировки.

Возможные значения:

- `throw`: выбросить исключение.
- `break`: прекратить выполнение запроса и вернуть частичный результат.

## split_intersecting_parts_ranges_into_layers_final {#split_intersecting_parts_ranges_into_layers_final} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Разрешает разбиение пересекающихся диапазонов частей на слои при оптимизации FINAL"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "Разрешает разбиение пересекающихся диапазонов частей на слои при оптимизации FINAL"}]}]}/>

Разбивает пересекающиеся диапазоны частей на слои при оптимизации FINAL

## split_parts_ranges_into_intersecting_and_non_intersecting_final {#split_parts_ranges_into_intersecting_and_non_intersecting_final} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Позволяет разделять диапазоны частей на пересекающиеся и непересекающиеся при оптимизации с использованием FINAL"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "Позволяет разделять диапазоны частей на пересекающиеся и непересекающиеся при оптимизации с использованием FINAL"}]}]}/>

Разделяет диапазоны частей на пересекающиеся и непересекающиеся при оптимизации с использованием FINAL

## splitby_max_substrings_includes_remaining_string {#splitby_max_substrings_includes_remaining_string} 

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, будет ли функция [splitBy*()](../../sql-reference/functions/splitting-merging-functions.md) с аргументом `max_substrings` > 0 включать оставшуюся часть строки в последний элемент результирующего массива.

Возможные значения:

- `0` - Оставшаяся часть строки не включается в последний элемент результирующего массива.
- `1` - Оставшаяся часть строки включается в последний элемент результирующего массива. Это соответствует поведению функции Spark [`split()`](https://spark.apache.org/docs/3.1.2/api/python/reference/api/pyspark.sql.functions.split.html) и метода Python [`string.split()`](https://docs.python.org/3/library/stdtypes.html#str.split).

## stop_refreshable_materialized_views_on_startup {#stop_refreshable_materialized_views_on_startup} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

При запуске сервера предотвращает планирование refreshable materialized views, как если бы была выполнена команда SYSTEM STOP VIEWS. Позже вы можете запустить их вручную с помощью `SYSTEM START VIEWS` или `SYSTEM START VIEW <name>`. Распространяется также на вновь создаваемые представления. Не влияет на non-refreshable materialized views.

## storage_file_read_method {#storage_file_read_method} 

<SettingsInfoBlock type="LocalFSReadMethod" default_value="pread" />

Метод чтения данных из файла хранилища; возможные значения: `read`, `pread`, `mmap`. Метод `mmap` не применяется к clickhouse-server (он предназначен для clickhouse-local).

## storage_system_stack_trace_pipe_read_timeout_ms {#storage_system_stack_trace_pipe_read_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="100" />

Максимальное время чтения из канала для получения информации из потоков при выполнении запроса к таблице `system.stack_trace`. Этот параметр используется для целей тестирования и не предназначен для изменения пользователями.

## stream_flush_interval_ms {#stream_flush_interval_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="7500" />

Применяется к таблицам с потоковой записью в случае тайм-аута или когда поток выполнения генерирует [max_insert_block_size](#max_insert_block_size) строк.

Значение по умолчанию — 7500.

Чем меньше значение, тем чаще данные записываются в таблицу. Слишком маленькое значение приводит к снижению производительности.

## stream_like_engine_allow_direct_select {#stream_like_engine_allow_direct_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.12"},{"label": "0"},{"label": "По умолчанию не разрешать прямой SELECT для Kafka/RabbitMQ/FileLog"}]}]}/>

Разрешает выполнение прямого запроса SELECT для движков Kafka, RabbitMQ, FileLog, Redis Streams, S3Queue, AzureQueue и NATS. При наличии подключённых materialized views выполнение запроса SELECT запрещено, даже если этот параметр включён.
Если нет подключённых materialized views, включение этого параметра позволяет читать данные. Имейте в виду, что обычно прочитанные данные удаляются из очереди. Чтобы избежать удаления прочитанных данных, соответствующие настройки движка должны быть настроены должным образом.

## stream_like_engine_insert_queue {#stream_like_engine_insert_queue} 

Когда движок stream-like читает из нескольких очередей, пользователю необходимо выбрать одну очередь для вставки при записи. Используется в Redis Streams и NATS.

## stream_poll_timeout_ms {#stream_poll_timeout_ms} 

<SettingsInfoBlock type="Milliseconds" default_value="500" />

Таймаут опроса при чтении и записи данных в потоковые хранилища.

## system&#95;events&#95;show&#95;zero&#95;values {#system_events_show_zero_values}

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет выбирать события с нулевыми значениями из [`system.events`](../../operations/system-tables/events.md).

Некоторые системы мониторинга требуют передавать им все значения метрик для каждой контрольной точки, даже если значение метрики равно нулю.

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
│ QueryMemoryLimitExceeded │     0 │ Количество превышений лимита памяти для запроса. │
└──────────────────────────┴───────┴───────────────────────────────────────────────────────┘
```


## table_engine_read_through_distributed_cache {#table_engine_read_through_distributed_cache} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Действует только в ClickHouse Cloud. Позволяет читать данные из распределённого кэша через движки таблиц и табличные функции (S3, Azure и т. д.).

## table_function_remote_max_addresses {#table_function_remote_max_addresses} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Устанавливает максимальное количество адресов, сгенерированных по шаблонам для функции [remote](../../sql-reference/table-functions/remote.md).

Возможные значения:

- Положительное целое число.

## tcp_keep_alive_timeout {#tcp_keep_alive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="290" />

Время в секундах, в течение которого соединение должно оставаться в состоянии простоя, прежде чем TCP начнёт отправлять keepalive‑пакеты

## temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds {#temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds} 

<SettingsInfoBlock type="UInt64" default_value="600000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "600000"},{"label": "Время ожидания получения блокировки кэша для резервирования места под временные данные в файловом кэше"}]}]}/>

Время ожидания получения блокировки кэша для резервирования места под временные данные в файловом кэше

## temporary_files_buffer_size {#temporary_files_buffer_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1048576"},{"label": "Новая настройка"}]}]}/>

Размер буфера для записи во временные файлы. Увеличение размера буфера приводит к меньшему количеству системных вызовов, но к большему потреблению памяти.

## temporary_files_codec {#temporary_files_codec} 

<SettingsInfoBlock type="String" default_value="LZ4" />

Задает кодек сжатия для временных файлов, используемых при операциях сортировки и соединения на диске.

Возможные значения:

- LZ4 — применяется сжатие [LZ4](https://en.wikipedia.org/wiki/LZ4_(compression_algorithm)).
- NONE — сжатие не применяется.

## text_index_hint_max_selectivity {#text_index_hint_max_selectivity} 

<SettingsInfoBlock type="Float" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0.2"},{"label": "New setting"}]}]}/>

Максимальная селективность фильтра для использования подсказки, сформированной по инвертированному текстовому индексу.

## text_index_use_bloom_filter {#text_index_use_bloom_filter} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

Для целей тестирования включает или отключает использование блум-фильтра в текстовом индексе.

## throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert {#throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Дедупликация в зависимых materialized view не может работать вместе с асинхронными вставками."}]}]}/>

Генерирует исключение при выполнении запроса INSERT, когда настройка `deduplicate_blocks_in_dependent_materialized_views` включена одновременно с `async_insert`. Это обеспечивает корректность, поскольку эти функции несовместимы.

## throw_if_no_data_to_insert {#throw_if_no_data_to_insert} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает или запрещает пустые INSERT-запросы, по умолчанию параметр включен (выдает ошибку при попытке пустого INSERT). Применяется только к INSERT-запросам, выполняемым через [`clickhouse-client`](/interfaces/cli) или [gRPC-интерфейс](/interfaces/grpc).

## throw_on_error_from_cache_on_write_operations {#throw_on_error_from_cache_on_write_operations} 

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать ошибки кэша при кэшировании в операциях записи (INSERT, слияния)

## throw_on_max_partitions_per_insert_block {#throw_on_max_partitions_per_insert_block} 

<SettingsInfoBlock type="Bool" default_value="1" />

Позволяет управлять тем, как система ведёт себя при достижении `max_partitions_per_insert_block`.

Возможные значения:

- `true`  - Когда вставляемый блок достигает `max_partitions_per_insert_block`, выбрасывается исключение.
- `false` - При достижении `max_partitions_per_insert_block` записывается предупреждение в журнал.

:::tip
Это может быть полезно, если вы пытаетесь оценить влияние на пользователей при изменении [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block).
:::

## throw_on_unsupported_query_inside_transaction {#throw_on_unsupported_query_inside_transaction} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

Выбрасывать исключение, если внутри транзакции используется неподдерживаемый запрос.

## timeout_before_checking_execution_speed {#timeout_before_checking_execution_speed} 

<SettingsInfoBlock type="Seconds" default_value="10" />

Проверяет, что скорость выполнения не слишком низкая (не меньше `min_execution_speed`),
по истечении указанного количества секунд.

## timeout_overflow_mode {#timeout_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что делать, если запрос выполняется дольше, чем `max_execution_time`, или
оценочное время выполнения превышает `max_estimated_execution_time`.

Возможные значения:

- `throw`: бросить исключение (значение по умолчанию).
- `break`: остановить выполнение запроса и вернуть частичный результат, как если бы
исходные данные исчерпались.

## timeout_overflow_mode_leaf {#timeout_overflow_mode_leaf} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что происходит, когда запрос на листовом узле выполняется дольше, чем `max_execution_time_leaf`.

Возможные значения:

- `throw`: вызвать исключение (значение по умолчанию).
- `break`: остановить выполнение запроса и вернуть частичный результат, как если бы
исходные данные закончились.

## totals_auto_threshold {#totals_auto_threshold} 

<SettingsInfoBlock type="Float" default_value="0.5" />

Пороговое значение для `totals_mode = 'auto'`.
См. раздел «Модификатор WITH TOTALS».

## totals_mode {#totals_mode} 

<SettingsInfoBlock type="TotalsMode" default_value="after_having_exclusive" />

Способ вычисления TOTALS при наличии HAVING, а также при использовании max_rows_to_group_by и group_by_overflow_mode = 'any'.
См. раздел «Модификатор WITH TOTALS».

## trace_profile_events {#trace_profile_events} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает сбор стек-трейсов при каждом обновлении события профиля вместе с именем события профиля и значением инкремента, а также их отправку в [trace_log](/operations/system-tables/trace_log).

Возможные значения:

- 1 — трассировка событий профиля включена.
- 0 — трассировка событий профиля отключена.

## trace_profile_events_list {#trace_profile_events_list} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": ""},{"label": "New setting"}]}]}/>

Когда настройка `trace_profile_events` включена, с помощью этого параметра можно ограничить отслеживаемые события указанным списком имён, разделённых запятыми.
Если `trace_profile_events_list` — пустая строка (по умолчанию), отслеживаются все события профилирования.

Пример значения: 'DiskS3ReadMicroseconds,DiskS3ReadRequestsCount,SelectQueryTimeMicroseconds,ReadBufferFromS3Bytes'

Использование этой настройки позволяет более точно собирать данные для большого количества запросов, потому что в противном случае огромный объём событий может переполнить внутреннюю очередь системного журнала, и часть из них будет отброшена.

## transfer_overflow_mode {#transfer_overflow_mode} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Задаёт поведение при превышении одного из лимитов по объёму данных.

Возможные значения:

- `throw`: выбрасывает исключение (значение по умолчанию).
- `break`: останавливает выполнение запроса и возвращает частичный результат, как если бы исходные данные закончились.

## transform&#95;null&#95;in {#transform_null_in}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает трактовку значений [NULL](/sql-reference/syntax#null) как равных для оператора [IN](../../sql-reference/operators/in.md).

По умолчанию значения `NULL` невозможно сравнивать, потому что `NULL` означает неопределённое значение. Поэтому сравнение `expr = NULL` всегда должно возвращать `false`. При включении этого параметра выражение `NULL = NULL` для оператора `IN` возвращает `true`.

Возможные значения:

* 0 — Сравнение значений `NULL` в операторе `IN` возвращает `false`.
* 1 — Сравнение значений `NULL` в операторе `IN` возвращает `true`.

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


## traverse_shadow_remote_data_paths {#traverse_shadow_remote_data_paths} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Обходить теневой каталог при выполнении запроса к таблице system.remote_data_paths."}]}]}/>

Обходить замороженные данные (теневой каталог) в дополнение к основным данным таблиц при выполнении запросов к таблице system.remote_data_paths

## union_default_mode {#union_default_mode} 

Устанавливает режим объединения результатов запроса `SELECT`. Настройка используется только при использовании с [UNION](../../sql-reference/statements/select/union.md) без явного указания `UNION ALL` или `UNION DISTINCT`.

Возможные значения:

- `'DISTINCT'` — ClickHouse выводит строки как результат объединения запросов, удаляя дубликаты строк.
- `'ALL'` — ClickHouse выводит все строки как результат объединения запросов, включая дубликаты строк.
- `''` — ClickHouse генерирует исключение при использовании с `UNION`.

См. примеры в [UNION](../../sql-reference/statements/select/union.md).

## unknown_packet_in_send_data {#unknown_packet_in_send_data} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Отправлять неизвестный пакет вместо N-го пакета данных

## update_parallel_mode {#update_parallel_mode} 

<SettingsInfoBlock type="UpdateParallelMode" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "Новая настройка"}]}]}/>

Определяет поведение одновременных запросов `UPDATE`.

Возможные значения:

- `sync` - выполнять все запросы `UPDATE` последовательно.
- `auto` - выполнять последовательно только те запросы `UPDATE`, между которыми есть зависимости между столбцами, изменяемыми в одном запросе, и столбцами, используемыми в выражениях другого запроса.
- `async` - не синхронизировать запросы `UPDATE`.

## update_sequential_consistency {#update_sequential_consistency} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "A new setting"}]}]}/>

Если установлено значение true, набор частей обновляется до последней версии перед выполнением обновления.

## use_async_executor_for_materialized_views {#use_async_executor_for_materialized_views} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Включает асинхронное и потенциально многопоточное выполнение запроса materialized view, что может ускорить обработку представлений при INSERT, но также приводит к большему расходу памяти.

## use_cache_for_count_from_files {#use_cache_for_count_from_files} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает кэширование количества строк при подсчёте по файлам с помощью табличных функций `file`/`s3`/`url`/`hdfs`/`azureBlobStorage`.

Включено по умолчанию.

## use_client_time_zone {#use_client_time_zone} 

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать часовой пояс клиента при интерпретации строковых значений типа DateTime вместо часового пояса сервера.

## use_compact_format_in_distributed_parts_names {#use_compact_format_in_distributed_parts_names} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "По умолчанию используется компактный формат для асинхронного INSERT в Distributed таблицы"}]}]}/>

Использует компактный формат для хранения блоков при фоновых (`distributed_foreground_insert`) операциях INSERT в таблицы с движком `Distributed`.

Возможные значения:

- 0 — Используется формат каталога `user[:password]@host:port#default_database`.
- 1 — Используется формат каталога `[shard{shard_index}[_replica{replica_index}]]`.

:::note

- при `use_compact_format_in_distributed_parts_names=0` изменения из определения кластера не будут применяться для фоновых операций INSERT.
- при `use_compact_format_in_distributed_parts_names=1` изменение порядка узлов в определении кластера изменит значения `shard_index`/`replica_index`, имейте это в виду.
:::

## use_concurrency_control {#use_concurrency_control} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "Включить контроль параллелизма по умолчанию"}]}]}/>

Учитывать контроль параллелизма на сервере (см. глобальные серверные настройки `concurrent_threads_soft_limit_num` и `concurrent_threads_soft_limit_ratio_to_cores`). При отключении параметра можно использовать большее число потоков, даже если сервер перегружен (не рекомендуется для обычного использования и в основном требуется для тестов).

## use_hedged_requests {#use_hedged_requests} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.9"},{"label": "1"},{"label": "Включить функцию Hedged Requests по умолчанию"}]}]}/>

Включает логику hedged-запросов для удалённых запросов. Позволяет устанавливать несколько подключений к разным репликам для одного запроса.
Новое подключение создаётся, если существующие подключения к репликам не были установлены в течение `hedged_connection_timeout`
или данные не были получены в течение `receive_data_timeout`. Запрос использует первое подключение, которое отправит непустой пакет прогресса (или пакет данных, если включено `allow_changing_replica_until_first_data_packet`);
остальные подключения отменяются. Поддерживаются запросы с `max_parallel_replicas > 1`.

Включено по умолчанию.

Значение по умолчанию в Cloud: `1`

## use_hive_partitioning {#use_hive_partitioning} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Настройка включена по умолчанию."}]}, {"id": "row-2","items": [{"label": "24.8"},{"label": "0"},{"label": "Позволяет использовать Hive‑стиль партиционирования для движков File, URL, S3, AzureBlobStorage и HDFS."}]}]}/>

При включённой настройке ClickHouse будет распознавать Hive‑стиль партиционирования в пути (`/name=value/`) в табличных движках файлового типа [File](/sql-reference/table-functions/file#hive-style-partitioning)/[S3](/sql-reference/table-functions/s3#hive-style-partitioning)/[URL](/sql-reference/table-functions/url#hive-style-partitioning)/[HDFS](/sql-reference/table-functions/hdfs#hive-style-partitioning)/[AzureBlobStorage](/sql-reference/table-functions/azureBlobStorage#hive-style-partitioning) и позволит использовать партиционные столбцы как виртуальные столбцы в запросе. Эти виртуальные столбцы будут иметь те же имена, что и в пути партиций, но с префиксом `_`.

## use_iceberg_metadata_files_cache {#use_iceberg_metadata_files_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Если параметр включён, табличная функция iceberg и хранилище iceberg могут использовать кэш файлов метаданных iceberg.

Возможные значения:

- 0 - Отключено
- 1 - Включено

## use_iceberg_partition_pruning {#use_iceberg_partition_pruning} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Включить по умолчанию отсечение партиций Iceberg."}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка для отсечения партиций Iceberg."}]}]}/>

Использует отсечение партиций Iceberg для таблиц Iceberg

## use_index_for_in_with_subqueries {#use_index_for_in_with_subqueries} 

<SettingsInfoBlock type="Bool" default_value="1" />

Попробуйте использовать индекс, если справа от оператора IN находится подзапрос или табличное выражение.

## use_index_for_in_with_subqueries_max_values {#use_index_for_in_with_subqueries_max_values} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер множества в правой части оператора IN, при котором для фильтрации может использоваться индекс таблицы. Это позволяет избежать деградации производительности и повышенного расхода памяти из‑за подготовки дополнительных структур данных для больших запросов. Ноль означает отсутствие ограничения.

## use_join_disjunctions_push_down {#use_join_disjunctions_push_down} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "Эта оптимизация включена."}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Включает проталкивание (pushdown) частей условий JOIN, соединённых оператором OR, на соответствующие входы («частичный pushdown»).
Это позволяет движкам хранилища выполнять фильтрацию раньше, что может уменьшить объём считываемых данных.
Оптимизация сохраняет семантику запроса и применяется только тогда, когда каждая ветвь верхнего уровня по OR вносит по крайней мере один детерминированный предикат для целевой стороны.

## use_legacy_to_time {#use_legacy_to_time} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Новая настройка. Позволяет пользователю использовать старую логику функции toTime, которая работает как toTimeWithFixedDate."}]}]}/>

Если параметр включён, позволяет использовать устаревшую функцию toTime, которая преобразует дату со временем в определённую фиксированную дату, сохраняя время.
В противном случае используется новая функция toTime, которая преобразует различные типы данных в тип Time.
Старая функция также всегда доступна как toTimeWithFixedDate.

## use_page_cache_for_disks_without_file_cache {#use_page_cache_for_disks_without_file_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Добавлен userspace-кэш страниц"}]}]}/>

Использует userspace-кэш страниц для удалённых дисков, для которых не включён кэш файловой системы.

## use_page_cache_with_distributed_cache {#use_page_cache_with_distributed_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

Использовать кэш страниц в пространстве пользователя при работе с распределённым кэшем.

## use_paimon_partition_pruning {#use_paimon_partition_pruning} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Включает использование отсечения партиций Paimon для табличных функций Paimon

## use_primary_key {#use_primary_key} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "26.1"},{"label": "1"},{"label": "Новая настройка, определяющая, используется ли первичный ключ в MergeTree для отсечения на уровне гранул."}]}]}/>

Использовать первичный ключ для отсечения гранул во время выполнения запросов для таблиц семейства MergeTree.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_query_cache {#use_query_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если включено, `SELECT`-запросы могут использовать [кэш запросов](../query-cache.md). Параметры [enable_reads_from_query_cache](#enable_reads_from_query_cache)
и [enable_writes_to_query_cache](#enable_writes_to_query_cache) более детально контролируют использование кэша.

Возможные значения:

- 0 - Отключено
- 1 - Включено

## use_query_condition_cache {#use_query_condition_cache} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Новая оптимизация"}]}, {"id": "row-2","items": [{"label": "25.3"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Включает [кэш условий запроса](/operations/query-condition-cache). Кэш сохраняет диапазоны гранул в частях данных, которые не удовлетворяют условию в предложении `WHERE`,
и повторно использует эту информацию как временный индекс для последующих запросов.

Возможные значения:

- 0 — Отключено
- 1 — Включено

## use_roaring_bitmap_iceberg_positional_deletes {#use_roaring_bitmap_iceberg_positional_deletes} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Использовать roaring bitmap для позиционных удалений в Iceberg.

## use_skip_indexes {#use_skip_indexes} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать индексы пропуска данных при выполнении запросов.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_skip_indexes_for_disjunctions {#use_skip_indexes_for_disjunctions} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Вычислять фильтры WHERE со смешанными условиями AND и OR с использованием пропускающих индексов. Пример: WHERE A = 5 AND (B = 5 OR C = 5).
Если отключено, пропускающие индексы по-прежнему используются для вычисления условий WHERE, но они должны содержать только выражения, объединённые оператором AND.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_skip_indexes_for_top_k {#use_skip_indexes_for_top_k} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting."}]}]}/>

Включает использование индексов пропуска данных для фильтрации TopK.

При включении, если существует minmax-индекс пропуска данных для столбца в запросе `ORDER BY <column> LIMIT n`, оптимизатор попытается использовать minmax-индекс, чтобы пропустить гранулы, не имеющие отношения к итоговому результату. Это может снизить задержку выполнения запроса.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_skip_indexes_if_final {#use_skip_indexes_if_final} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Change in default value of setting"}]}]}/>

Определяет, используются ли пропускающие индексы при выполнении запроса с модификатором FINAL.

Пропускающие индексы могут исключать строки (гранулы), содержащие самые свежие данные, что может привести к некорректным результатам запроса с модификатором FINAL. Когда этот параметр включён, пропускающие индексы применяются даже с модификатором FINAL, что потенциально улучшает производительность, но несёт риск пропуска недавних обновлений. Этот параметр следует включать согласованно с параметром use_skip_indexes_if_final_exact_mode (по умолчанию он включён).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_skip_indexes_if_final_exact_mode {#use_skip_indexes_if_final_exact_mode} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Изменение значения настройки по умолчанию"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "Эта настройка была добавлена, чтобы запрос с модификатором FINAL возвращал корректные результаты при использовании пропускающих индексов"}]}]}/>

Определяет, нужно ли разворачивать гранулы, возвращаемые пропускающим индексом, в более новых частях для получения корректных результатов при выполнении запроса с модификатором FINAL.

Использование пропускающих индексов может исключать строки (гранулы), содержащие самые свежие данные, что может приводить к некорректным результатам. Эта настройка позволяет обеспечить корректные результаты за счёт сканирования более новых частей, пересекающихся с диапазонами, возвращёнными пропускающим индексом. Эту настройку следует отключать только в том случае, если для приложения допустимы приблизительные результаты, основанные на использовании пропускающего индекса.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_skip_indexes_on_data_read {#use_skip_indexes_on_data_read} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Включает использование индексов пропуска данных при чтении данных.

Если настройка включена, индексы пропуска данных оцениваются динамически во время чтения каждой гранулы данных, а не анализируются заранее до начала выполнения запроса. Это может уменьшить задержку запуска запроса.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_statistics_cache {#use_statistics_cache} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Использовать кэш статистики в запросах, чтобы избежать накладных расходов на загрузку статистики для каждой части.

## use_structure_from_insertion_table_in_table_functions {#use_structure_from_insertion_table_in_table_functions} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.11"},{"label": "2"},{"label": "Улучшено использование структуры таблицы вставки в табличных функциях"}]}]}/>

Использовать структуру таблицы, в которую выполняется вставка, вместо определения схемы на основе данных. Возможные значения: 0 - отключено, 1 - включено, 2 - авто

## use_text_index_dictionary_cache {#use_text_index_dictionary_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Определяет, использовать ли кэш десериализованного блока словаря текстового индекса.
Использование кэша блока словаря текстового индекса может существенно снизить задержку и увеличить пропускную способность при обработке большого числа запросов по текстовому индексу.

## use_text_index_header_cache {#use_text_index_header_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Определяет, использовать ли кэш десериализованного заголовка текстового индекса.
Использование кэша заголовка текстового индекса может значительно уменьшить задержку и увеличить пропускную способность при выполнении большого количества запросов к текстовому индексу.

## use_text_index_postings_cache {#use_text_index_postings_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Определяет, использовать ли кэш десериализованных списков вхождений текстового индекса.
Использование кэша списков вхождений текстового индекса может значительно снизить задержку и увеличить пропускную способность при выполнении большого числа запросов по текстовому индексу.

## use_top_k_dynamic_filtering {#use_top_k_dynamic_filtering} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "New setting."}]}]}/>

Включает оптимизацию динамической фильтрации при выполнении запроса `ORDER BY <column> LIMIT n`.

При включении движок выполнения запросов будет пытаться пропускать гранулы и строки, которые не будут частью итоговых `top N` строк в результирующем наборе. Эта оптимизация имеет динамический характер, и уменьшение задержки зависит от распределения данных и наличия других предикатов в запросе.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_uncompressed_cache {#use_uncompressed_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать ли кэш несжатых блоков. Принимает значения 0 или 1. По умолчанию — 0 (отключено).
Использование кэша несжатых данных (только для таблиц семейства MergeTree) может существенно снизить задержку и увеличить пропускную способность при работе с большим количеством коротких запросов. Включите этот параметр для пользователей, которые отправляют частые короткие запросы. Также обратите внимание на параметр конфигурации [uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) (задаётся только в конфигурационном файле) — размер блоков кэша несжатых данных. По умолчанию он равен 8 ГиБ. Кэш несжатых данных заполняется по мере необходимости, а наименее востребованные данные автоматически удаляются.

Для запросов, которые читают хотя бы относительно большой объём данных (один миллион строк и более), кэш несжатых данных автоматически отключается, чтобы освободить место для действительно небольших запросов. Это означает, что вы можете всегда держать параметр `use_uncompressed_cache` равным 1.

## use&#95;variant&#95;as&#95;common&#95;type {#use_variant_as_common_type}

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Разрешает использовать Variant в if/multiIf при отсутствии общего типа"}]}]} />

Разрешает использовать тип `Variant` как результирующий тип для функций [if](../../sql-reference/functions/conditional-functions.md/#if)/[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)/[array](../../sql-reference/functions/array-functions.md)/[map](../../sql-reference/functions/tuple-map-functions.md) при отсутствии общего типа для типов аргументов.

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


## use_with_fill_by_sorting_prefix {#use_with_fill_by_sorting_prefix} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "Столбцы, предшествующие столбцам WITH FILL в предложении ORDER BY, образуют префикс сортировки. Строки с разными значениями префикса сортировки заполняются независимо друг от друга"}]}]}/>

Столбцы, предшествующие столбцам WITH FILL в предложении ORDER BY, образуют префикс сортировки. Строки с разными значениями префикса сортировки заполняются независимо друг от друга

## validate_enum_literals_in_operators {#validate_enum_literals_in_operators} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Если параметр включён, выполняется проверка литералов перечислений в операторах `IN`, `NOT IN`, `==`, `!=` на соответствие типу перечисления, и генерируется исключение, если литерал не является допустимым значением перечисления.

## validate_mutation_query {#validate_mutation_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "Новый параметр, по умолчанию проверяющий запросы мутаций."}]}]}/>

Проверять запросы мутаций перед их принятием. Мутации выполняются в фоновом режиме, и запуск некорректного запроса приведёт к зависанию мутаций и необходимости ручного вмешательства.

Изменяйте этот параметр только при возникновении ошибки, нарушающей обратную совместимость.

## validate_polygons {#validate_polygons} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.4"},{"label": "1"},{"label": "По умолчанию выбрасывать исключение в функции pointInPolygon, если полигон некорректен, вместо возврата потенциально неверных результатов"}]}]}/>

Включает или отключает выбрасывание исключения в функции [pointInPolygon](/sql-reference/functions/geo/coordinates#pointinpolygon), если полигон самопересекается или имеет точки самокасания.

Возможные значения:

- 0 — выбрасывание исключения отключено. `pointInPolygon` принимает некорректные полигоны и возвращает для них потенциально неверные результаты.
- 1 — выбрасывание исключения включено.

## vector_search_filter_strategy {#vector_search_filter_strategy} 

<SettingsInfoBlock type="VectorSearchFilterStrategy" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "New setting"}]}]}/>

Если запрос векторного поиска содержит предикат WHERE, этот параметр определяет, будет ли он вычисляться первым (предварительная фильтрация) ИЛИ сначала будет использоваться векторный индекс сходства (постфильтрация). Возможные значения:

- 'auto' — постфильтрация (точная семантика может измениться в будущем).
- 'postfilter' — использовать векторный индекс сходства для определения ближайших соседей, затем применять остальные фильтры.
- 'prefilter' — сначала вычислять остальные фильтры, затем выполнять поиск полным перебором для определения соседей.

## vector_search_index_fetch_multiplier {#vector_search_index_fetch_multiplier} 

**Псевдонимы**: `vector_search_postfilter_multiplier`

<SettingsInfoBlock type="Float" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Псевдоним настройки 'vector_search_postfilter_multiplier'"}]}]}/>

Умножает число извлекаемых ближайших соседей из индекса векторного сходства на этот множитель. Применяется только при постфильтрации с другими предикатами или если установлена настройка 'vector_search_with_rescoring = 1'.

## vector_search_with_rescoring {#vector_search_with_rescoring} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Определяет, выполняет ли ClickHouse повторную оценку результатов (rescoring) для запросов, использующих индекс векторного сходства.
Без повторной оценки индекс векторного сходства напрямую возвращает строки с наилучшими совпадениями.
При включённой повторной оценке результаты расширяются до уровня гранулы, и все строки в грануле проверяются повторно.
В большинстве случаев повторная оценка лишь незначительно повышает точность, но при этом существенно ухудшает производительность запросов векторного поиска.
Примечание: запрос, выполняемый без повторной оценки и с включёнными параллельными репликами, может в итоге выполняться с повторной оценкой.

## wait_changes_become_visible_after_commit_mode {#wait_changes_become_visible_after_commit_mode} 

<ExperimentalBadge/>

<SettingsInfoBlock type="TransactionsWaitCSNMode" default_value="wait_unknown" />

Ожидать, пока зафиксированные изменения не станут действительно видимыми в последнем снепшоте

## wait_for_async_insert {#wait_for_async_insert} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено значение true, ожидать завершения обработки асинхронной вставки.

## wait_for_async_insert_timeout {#wait_for_async_insert_timeout} 

<SettingsInfoBlock type="Секунды" default_value="120" />

Время ожидания обработки асинхронной вставки

## wait_for_window_view_fire_signal_timeout {#wait_for_window_view_fire_signal_timeout} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="10" />

Таймаут ожидания сигнала срабатывания window view при обработке по времени события

## window_view_clean_interval {#window_view_clean_interval} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="60" />

Интервал очистки представления window view в секундах для удаления устаревших данных.

## window_view_heartbeat_interval {#window_view_heartbeat_interval} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="15" />

Интервал в секундах между сигналами, подтверждающими, что наблюдаемый запрос активен.

## workload {#workload} 

<SettingsInfoBlock type="String" default_value="default" />

Имя рабочей нагрузки, используемое для доступа к ресурсам

## write_full_path_in_iceberg_metadata {#write_full_path_in_iceberg_metadata} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Записывает полные пути (включая s3://) в файлы метаданных Iceberg.

## write_through_distributed_cache {#write_through_distributed_cache} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Разрешает выполнять запись в распределённый кэш (запись в S3 также будет выполняться через распределённый кэш).

## write_through_distributed_cache_buffer_size {#write_through_distributed_cache_buffer_size} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "Новый параметр в Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Задает размер буфера для сквозного распределенного кэша (write-through distributed cache). Если значение равно 0, используется размер буфера, который был бы использован при отсутствии распределенного кэша.

## zstd_window_log_max {#zstd_window_log_max} 

<SettingsInfoBlock type="Int64" default_value="0" />

Позволяет задать максимальный window log для ZSTD (не используется для семейства MergeTree)