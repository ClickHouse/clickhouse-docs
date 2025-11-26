---
title: 'Настройки сеанса'
sidebar_label: 'Настройки сеанса'
slug: /operations/settings/settings
toc_max_heading_level: 2
description: 'Настройки, доступные в таблице ``system.settings``.'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

{/* Сгенерировано автоматически */ }

Все приведённые ниже настройки также доступны в таблице [system.settings](/docs/operations/system-tables/settings). Эти настройки автоматически генерируются на основе [исходного кода](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/Settings.cpp).


## add_http_cors_header \{#add_http_cors_header\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Добавлять HTTP-заголовок CORS.

## additional&#95;result&#95;filter

Дополнительное выражение фильтра, применяемое к результату запроса `SELECT`.
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


## additional&#95;table&#95;filters

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


## aggregate&#95;functions&#95;null&#95;for&#95;empty

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает переписывание всех агрегатных функций в запросе с добавлением суффикса [-OrNull](/sql-reference/aggregate-functions/combinators#-ornull). Включите этот параметр для совместимости со стандартом SQL.
Реализовано через переписывание запроса (аналогично настройке [count&#95;distinct&#95;implementation](#count_distinct_implementation)), чтобы обеспечить согласованные результаты для распределённых запросов.

Возможные значения:

* 0 — Отключено.
* 1 — Включено.

**Пример**

Рассмотрим следующий запрос с агрегатными функциями:

```sql
SELECT SUM(-1), MAX(0) FROM system.one WHERE 0;
```

С `aggregate_functions_null_for_empty = 0` это даст:

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


## aggregation_in_order_max_block_bytes \{#aggregation_in_order_max_block_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="50000000" />

Максимальный размер блока в байтах, накапливаемого во время агрегации в порядке первичного ключа. Меньший размер блока позволяет шире распараллелить заключительный этап итогового слияния при агрегации.

## aggregation_memory_efficient_merge_threads \{#aggregation_memory_efficient_merge_threads\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Количество потоков, используемых для слияния промежуточных результатов агрегации в режиме экономного использования памяти. Чем выше значение, тем больше расход памяти. 0 означает то же значение, что и у `max_threads`.

## allow_aggregate_partitions_independently \{#allow_aggregate_partitions_independently\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает независимую агрегацию партиций в отдельных потоках, когда ключ партиционирования совпадает с ключом `GROUP BY`. Полезно, когда количество партиций близко к количеству ядер процессора и партиции имеют примерно одинаковый размер.

## allow_archive_path_syntax \{#allow_archive_path_syntax\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "Добавлена новая настройка, позволяющая отключить синтаксис путей к архивам."}]}, {"id": "row-2","items": [{"label": "24.5"},{"label": "1"},{"label": "Добавлена новая настройка, позволяющая отключить синтаксис путей к архивам."}]}]}/>

Движки File/S3 и табличная функция будут интерпретировать пути с '::' как `<archive> :: <file>`, если у архива корректное расширение.

## allow_asynchronous_read_from_io_pool_for_merge_tree \{#allow_asynchronous_read_from_io_pool_for_merge_tree\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать фоновый пул ввода-вывода для чтения из таблиц MergeTree. Этот параметр может повысить производительность запросов, ограниченных по вводу-выводу.

## allow_changing_replica_until_first_data_packet \{#allow_changing_replica_until_first_data_packet\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, в подстраховывающих (hedged) запросах мы можем инициировать новое соединение до получения первого пакета данных, даже если уже был достигнут некоторый прогресс
(но прогресс не обновлялся в течение таймаута `receive_data_timeout`), в противном случае после первого зафиксированного прогресса смена реплики запрещается.

## allow_create_index_without_type \{#allow_create_index_without_type\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает выполнение запроса CREATE INDEX без указания TYPE. Такой запрос будет игнорироваться. Предназначено для тестов совместимости SQL.

## allow_custom_error_code_in_throwif \{#allow_custom_error_code_in_throwif\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает возможность использования пользовательского кода ошибки в функции throwIf(). Если установлено значение true, выбрасываемые исключения могут иметь непредвиденные коды ошибок.

## allow_ddl \{#allow_ddl\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено значение `true`, то пользователю разрешено выполнять DDL‑запросы.

## allow_deprecated_database_ordinary \{#allow_deprecated_database_ordinary\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает создавать базы данных с устаревшим движком базы данных Ordinary

## allow_deprecated_error_prone_window_functions \{#allow_deprecated_error_prone_window_functions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "Разрешить использование устаревших ошибкоопасных оконных функций (neighbor, runningAccumulate, runningDifferenceStartingWithFirstValue, runningDifference)"}]}]}/>

Разрешить использование устаревших ошибкоопасных оконных функций (neighbor, runningAccumulate, runningDifferenceStartingWithFirstValue, runningDifference)

## allow_deprecated_snowflake_conversion_functions \{#allow_deprecated_snowflake_conversion_functions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Устаревшие функции snowflakeToDateTime[64] и dateTime[64]ToSnowflake отключены."}]}]}/>

Функции `snowflakeToDateTime`, `snowflakeToDateTime64`, `dateTimeToSnowflake` и `dateTime64ToSnowflake` устарели и по умолчанию отключены.
Используйте вместо них функции `snowflakeIDToDateTime`, `snowflakeIDToDateTime64`, `dateTimeToSnowflakeID` и `dateTime64ToSnowflakeID`.

Чтобы повторно включить устаревшие функции (например, на переходный период), установите для этого параметра значение `true`.

## allow_deprecated_syntax_for_merge_tree \{#allow_deprecated_syntax_for_merge_tree\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает создавать таблицы *MergeTree с устаревшим синтаксисом определения движка таблицы

## allow_distributed_ddl \{#allow_distributed_ddl\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено значение `true`, пользователю разрешено выполнять распределённые DDL-запросы.

## allow_drop_detached \{#allow_drop_detached\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает выполнение запросов ALTER TABLE ... DROP DETACHED PART[ITION] ...

## allow_dynamic_type_in_join_keys \{#allow_dynamic_type_in_join_keys\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "По умолчанию запрещает использование типа Dynamic в ключах JOIN"}]}]}/>

Разрешает использование типа Dynamic в ключах JOIN. Настройка добавлена для совместимости. Не рекомендуется использовать тип Dynamic в ключах JOIN, поскольку сравнение с другими типами может приводить к неожиданным результатам.

## allow_execute_multiif_columnar \{#allow_execute_multiif_columnar\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает выполнять функцию multiIf в колоночном режиме

## allow_experimental_alias_table_engine \{#allow_experimental_alias_table_engine\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Разрешает создавать таблицы с движком Alias.

## allow_experimental_analyzer \{#allow_experimental_analyzer\} 

**Синонимы**: `enable_analyzer`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Включить анализатор и планировщик по умолчанию."}]}]}/>

Разрешает использование нового анализа́тора запросов.

## allow_experimental_codecs \{#allow_experimental_codecs\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено в true, разрешает указывать экспериментальные кодеки сжатия (но таких кодеков пока нет, поэтому параметр ни на что не влияет).

## allow_experimental_correlated_subqueries \{#allow_experimental_correlated_subqueries\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Поддержка коррелированных подзапросов помечена как бета-функция."}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "Добавлена новая настройка для включения выполнения коррелированных подзапросов."}]}]}/>

Позволяет выполнять коррелированные подзапросы.

## allow_experimental_database_glue_catalog \{#allow_experimental_database_glue_catalog\} 

<BetaBadge/>

**Псевдонимы**: `allow_database_glue_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "Разрешает использование экспериментального движка базы данных DataLakeCatalog с catalog_type = 'glue'"}]}]}/>

Разрешает использование экспериментального движка базы данных DataLakeCatalog с catalog_type = 'glue'

## allow_experimental_database_hms_catalog \{#allow_experimental_database_hms_catalog\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Разрешить экспериментальный движок базы данных DataLakeCatalog с параметром catalog_type = 'hive'"}]}]}/>

Разрешить экспериментальный движок базы данных DataLakeCatalog с параметром catalog_type = 'hms'

## allow_experimental_database_iceberg \{#allow_experimental_database_iceberg\} 

<BetaBadge/>

**Псевдонимы**: `allow_database_iceberg`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Разрешает экспериментальный движок базы данных DataLakeCatalog с параметром `catalog_type = 'iceberg'`.

## allow_experimental_database_materialized_postgresql \{#allow_experimental_database_materialized_postgresql\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает создание базы данных с движком Engine=MaterializedPostgreSQL(...).

## allow_experimental_database_unity_catalog \{#allow_experimental_database_unity_catalog\} 

<BetaBadge/>

**Псевдонимы**: `allow_database_unity_catalog`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "Разрешает использование экспериментального движка базы данных DataLakeCatalog с catalog_type = 'unity'"}]}]}/>

Разрешает использование экспериментального движка базы данных DataLakeCatalog с catalog_type = 'unity'

## allow_experimental_delta_kernel_rs \{#allow_experimental_delta_kernel_rs\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

Разрешает использование экспериментальной реализации delta-kernel-rs.

## allow_experimental_delta_lake_writes \{#allow_experimental_delta_lake_writes\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Включает возможность записи через delta-kernel.

## allow_experimental_full_text_index \{#allow_experimental_full_text_index\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Включить экспериментальный полнотекстовый индекс"}]}]}/>

Если установлено в значение true, разрешает использование экспериментального полнотекстового индекса.

## allow_experimental_funnel_functions \{#allow_experimental_funnel_functions\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Включает экспериментальные функции для анализа воронок.

## allow_experimental_hash_functions \{#allow_experimental_hash_functions\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Включает экспериментальные хеш-функции

## allow_experimental_iceberg_compaction \{#allow_experimental_iceberg_compaction\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting "}]}]}/>

Позволяет явно использовать команду `OPTIMIZE` для таблиц Iceberg.

## allow_experimental_insert_into_iceberg \{#allow_experimental_insert_into_iceberg\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting."}]}]}/>

Разрешает выполнение запросов `INSERT` в таблицы Iceberg.

## allow_experimental_join_right_table_sorting \{#allow_experimental_join_right_table_sorting\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Если параметр имеет значение true и выполняются условия `join_to_sort_minimum_perkey_rows` и `join_to_sort_maximum_table_rows`, правая таблица переупорядочивается по ключу для улучшения производительности левого или внутреннего хеш-соединения"}]}]}/>

Если параметр имеет значение true и выполняются условия `join_to_sort_minimum_perkey_rows` и `join_to_sort_maximum_table_rows`, правая таблица переупорядочивается по ключу для улучшения производительности левого или внутреннего хеш-соединения.

## allow_experimental_kafka_offsets_storage_in_keeper \{#allow_experimental_kafka_offsets_storage_in_keeper\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "Разрешить использование экспериментального движка хранения Kafka, который сохраняет зафиксированные смещения в ClickHouse Keeper"}]}]}/>

Включает экспериментальную возможность хранения смещений Kafka в ClickHouse Keeper. При включении параметра для движка таблицы Kafka можно указать путь в ClickHouse Keeper и имя реплики. В результате вместо обычного движка Kafka используется новый тип движка хранения, который в первую очередь сохраняет зафиксированные смещения в ClickHouse Keeper.

## allow_experimental_kusto_dialect \{#allow_experimental_kusto_dialect\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

Включает поддержку Kusto Query Language (KQL) — альтернативы SQL.

## allow_experimental_materialized_postgresql_table \{#allow_experimental_materialized_postgresql_table\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использование табличного движка MaterializedPostgreSQL. По умолчанию параметр отключён, так как эта возможность является экспериментальной.

## allow_experimental_nlp_functions \{#allow_experimental_nlp_functions\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Включить экспериментальные функции обработки естественного языка.

## allow_experimental_parallel_reading_from_replicas \{#allow_experimental_parallel_reading_from_replicas\} 

<BetaBadge/>

**Псевдонимы**: `enable_parallel_replicas`

<SettingsInfoBlock type="UInt64" default_value="0" />

Использует до `max_parallel_replicas` реплик с каждого шарда для выполнения запроса SELECT. Чтение выполняется параллельно и динамически координируется. 0 — отключено, 1 — включено, в случае сбоя реплики тихо отключаются, 2 — включено, в случае сбоя генерируется исключение

## allow_experimental_prql_dialect \{#allow_experimental_prql_dialect\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

Включить PRQL — альтернативный язык запросов к SQL.

## allow_experimental_qbit_type \{#allow_experimental_qbit_type\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "Новая экспериментальная настройка"}]}]}/>

Разрешает создание типа данных [QBit](../../sql-reference/data-types/qbit.md).

## allow_experimental_query_deduplication \{#allow_experimental_query_deduplication\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Экспериментальная дедупликация данных для запросов SELECT по UUID частей

## allow_experimental_statistics \{#allow_experimental_statistics\} 

<ExperimentalBadge/>

**Псевдонимы**: `allow_experimental_statistic`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Параметр был переименован. Предыдущее имя — `allow_experimental_statistic`."}]}]}/>

Позволяет задавать столбцы со [статистикой](../../engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-creating-a-table) и [управлять статистикой](../../engines/table-engines/mergetree-family/mergetree.md/#column-statistics).

## allow_experimental_time_series_aggregate_functions \{#allow_experimental_time_series_aggregate_functions\} 

<ExperimentalBadge/>

**Псевдонимы**: `allow_experimental_ts_to_grid_aggregate_function`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Новая настройка, включающая экспериментальные агрегатные функции семейства timeSeries*."}]}]}/>

Экспериментальные агрегатные функции семейства timeSeries* для ресэмплинга временных рядов в стиле Prometheus, вычисления скорости изменения (rate) и дельты.

## allow_experimental_time_series_table \{#allow_experimental_time_series_table\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "Добавлена новая настройка для включения движка таблицы TimeSeries"}]}]}/>

Разрешает создание таблиц с движком таблицы [TimeSeries](../../engines/table-engines/integrations/time-series.md). Возможные значения:

- 0 — движок таблицы [TimeSeries](../../engines/table-engines/integrations/time-series.md) отключен.
- 1 — движок таблицы [TimeSeries](../../engines/table-engines/integrations/time-series.md) включен.

## allow_experimental_window_view \{#allow_experimental_window_view\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Включить WINDOW VIEW. Функциональность ещё недостаточно стабильна.

## allow_experimental_ytsaurus_dictionary_source \{#allow_experimental_ytsaurus_dictionary_source\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Экспериментальный источник словаря для интеграции с YTsaurus.

## allow_experimental_ytsaurus_table_engine \{#allow_experimental_ytsaurus_table_engine\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Экспериментальный движок таблиц для интеграции с YTsaurus.

## allow_experimental_ytsaurus_table_function \{#allow_experimental_ytsaurus_table_function\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Экспериментальный табличный движок для интеграции с YTsaurus.

## allow_general_join_planning \{#allow_general_join_planning\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Разрешает использование более универсального алгоритма планирования соединений (JOIN) при включённом алгоритме хешированного соединения."}]}]}/>

Разрешает использование более универсального алгоритма планирования соединений (JOIN), который может обрабатывать более сложные условия, но работает только с хешированным соединением. Если хешированное соединение не включено, используется обычный алгоритм планирования соединений независимо от значения этого параметра.

## allow_get_client_http_header \{#allow_get_client_http_header\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Добавлена новая функция."}]}]}/>

Разрешает использование функции `getClientHTTPHeader`, которая позволяет получить значение заголовка в текущем HTTP-запросе. По соображениям безопасности по умолчанию эта возможность отключена, так как некоторые заголовки, например `Cookie`, могут содержать конфиденциальную информацию. Обратите внимание, что заголовки `X-ClickHouse-*` и `Authentication` всегда недоступны для получения с помощью этой функции.

## allow_hyperscan \{#allow_hyperscan\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает использование функций, использующих библиотеку Hyperscan. Отключите параметр, чтобы избежать потенциально длительного времени компиляции и чрезмерного потребления ресурсов.

## allow_introspection_functions \{#allow_introspection_functions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает [функции интроспекции](../../sql-reference/functions/introspection.md) для профилирования запросов.

Возможные значения:

- 1 — функции интроспекции включены.
- 0 — функции интроспекции отключены.

**См. также**

- [Sampling Query Profiler](../../operations/optimizing-performance/sampling-query-profiler.md)
- Системная таблица [trace_log](/operations/system-tables/trace_log)

## allow_materialized_view_with_bad_select \{#allow_materialized_view_with_bad_select\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "Запрещает создание материализованных представлений (MV), ссылающихся на несуществующие столбцы или таблицы"}]}, {"id": "row-2","items": [{"label": "24.9"},{"label": "1"},{"label": "Поддержка (но пока без включения по умолчанию) более строгой проверки в CREATE MATERIALIZED VIEW"}]}]}/>

Разрешает выполнение CREATE MATERIALIZED VIEW с запросом SELECT, который ссылается на несуществующие таблицы или столбцы. Запрос при этом всё равно должен оставаться синтаксически корректным. Не применяется к обновляемым MV. Не применяется, если схему MV нужно вывести из запроса SELECT (то есть если в CREATE нет списка столбцов и нет целевой таблицы TO). Может использоваться для создания MV до создания его исходной таблицы.

## allow_named_collection_override_by_default \{#allow_named_collection_override_by_default\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешить по умолчанию переопределение полей именованных коллекций.

## allow_non_metadata_alters \{#allow_non_metadata_alters\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает выполнение ALTER-запросов, которые затрагивают не только метаданные таблиц, но и данные на диске

## allow_nonconst_timezone_arguments \{#allow_nonconst_timezone_arguments\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "Разрешает использование неконстантных аргументов часового пояса в некоторых функциях, связанных с временем, таких как toTimeZone(), fromUnixTimestamp*(), snowflakeToDateTime*()."}]}]}/>

Разрешает использование неконстантных аргументов часового пояса в некоторых функциях, связанных с временем, таких как `toTimeZone()`, `fromUnixTimestamp*()`, `snowflakeToDateTime*()`.
Этот параметр существует только по соображениям совместимости. В ClickHouse часовой пояс является свойством типа данных и, соответственно, столбца.
Включение этого параметра создаёт ошибочное впечатление, что отдельные значения в одном столбце могут иметь разные часовые пояса.
Поэтому не включайте этот параметр.

## allow&#95;nondeterministic&#95;mutations

<SettingsInfoBlock type="Bool" default_value="0" />

Пользовательская настройка, которая позволяет мутациям в реплицируемых таблицах использовать недетерминированные функции, такие как `dictGet`.

Поскольку словари, например, могут быть рассинхронизированы между узлами, по умолчанию мутации, которые извлекают значения из них, запрещены в реплицируемых таблицах. Включение этой настройки позволяет такое поведение и возлагает на пользователя ответственность за то, чтобы используемые данные были синхронизированы на всех узлах.

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


## allow_nondeterministic_optimize_skip_unused_shards \{#allow_nondeterministic_optimize_skip_unused_shards\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешить использование недетерминированных функций (таких как `rand` или `dictGet`, поскольку у последней есть некоторые особенности при обновлениях) в качестве ключа шардинга.

Возможные значения:

- 0 — Запрещено.
- 1 — Разрешено.

## allow_not_comparable_types_in_comparison_functions \{#allow_not_comparable_types_in_comparison_functions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "По умолчанию несравнимые типы в функциях сравнения запрещены"}]}]}/>

Разрешает или запрещает использование несравнимых типов (например, JSON/AggregateFunction) в функциях сравнения `equal/less/greater/etc`.

## allow_not_comparable_types_in_order_by \{#allow_not_comparable_types_in_order_by\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "По умолчанию запрещает использование несравнимых типов в ORDER BY"}]}]}/>

Разрешает или запрещает использование несравнимых типов (таких как JSON/AggregateFunction) в ключах ORDER BY.

## allow_prefetched_read_pool_for_local_filesystem \{#allow_prefetched_read_pool_for_local_filesystem\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Предпочитать пул потоков упреждающего чтения, если все части находятся в локальной файловой системе

## allow_prefetched_read_pool_for_remote_filesystem \{#allow_prefetched_read_pool_for_remote_filesystem\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Предпочитать пул потоков для опережающего чтения, если все части находятся в удалённой файловой системе

## allow_push_predicate_ast_for_distributed_subqueries \{#allow_push_predicate_ast_for_distributed_subqueries\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "A new setting"}]}]}/>

Разрешает проталкивание предиката на уровне AST для распределённых подзапросов при включённом анализаторе

## allow_push_predicate_when_subquery_contains_with \{#allow_push_predicate_when_subquery_contains_with\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает проталкивание предикатов, если подзапрос содержит предложение WITH

## allow_reorder_prewhere_conditions \{#allow_reorder_prewhere_conditions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

При переносе условий из WHERE в PREWHERE позволяет менять их порядок для оптимизации фильтрации.

## allow&#95;settings&#95;after&#95;format&#95;in&#95;insert

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.4"},{"label": "0"},{"label": "Не разрешать SETTINGS после FORMAT в запросах INSERT, поскольку ClickHouse интерпретирует SETTINGS как значения, что вводит в заблуждение"}]}]} />

Определяет, допускается ли использование `SETTINGS` после `FORMAT` в запросах `INSERT`. Не рекомендуется использовать этот параметр, так как часть `SETTINGS` может быть интерпретирована как значения.

Пример:

```sql
INSERT INTO FUNCTION null('foo String') SETTINGS max_threads=1 VALUES ('bar');
```

Однако следующий запрос будет работать только при включённом параметре `allow_settings_after_format_in_insert`:

```sql
SET allow_settings_after_format_in_insert=1;
INSERT INTO FUNCTION null('foo String') VALUES ('bar') SETTINGS max_threads=1;
```

Возможные значения:

* 0 — запретить.
* 1 — разрешить.

:::note
Используйте этот параметр только для обеспечения обратной совместимости, если ваши сценарии зависят от устаревшего синтаксиса.
:::


## allow_simdjson \{#allow_simdjson\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает использование библиотеки simdjson в функциях `JSON*`, если доступны инструкции AVX2. При отключении параметра используется rapidjson.

## allow_special_serialization_kinds_in_output_formats \{#allow_special_serialization_kinds_in_output_formats\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Включает прямой вывод специальных представлений столбцов, таких как Sparse/Replicated, в некоторых форматах вывода"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Добавляет настройку, позволяющую выводить специальные представления столбцов, такие как Sparse/Replicated, без преобразования их в полноценные столбцы"}]}]}/>

Позволяет выводить столбцы со специальными типами сериализации, такими как Sparse и Replicated, без преобразования их в полноценное представление столбца.
Это позволяет избежать лишнего копирования данных при форматировании.

## allow_statistics_optimize \{#allow_statistics_optimize\} 

<ExperimentalBadge/>

**Псевдонимы**: `allow_statistic_optimize`

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Настройка была переименована. Прежнее имя — `allow_statistic_optimize`."}]}]}/>

Разрешает использовать статистику для оптимизации запросов

## allow_suspicious_codecs \{#allow_suspicious_codecs\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.5"},{"label": "0"},{"label": "Не позволяет указывать бессмысленные кодеки сжатия"}]}]}/>

Если установлено в значение `true`, позволяет указывать бессмысленные кодеки сжатия.

## allow_suspicious_fixed_string_types \{#allow_suspicious_fixed_string_types\} 

<SettingsInfoBlock type="Bool" default_value="0" />

В операторе CREATE TABLE позволяет создавать столбцы типа FixedString(n) с n > 256. FixedString с длиной >= 256 считается подозрительным и, скорее всего, указывает на неправильное использование.

## allow_suspicious_indices \{#allow_suspicious_indices\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "Если включён, индекс может быть определён с одинаковыми выражениями"}]}]}/>

Отклоняет первичные и вторичные индексы, а также ключи сортировки с одинаковыми выражениями

## allow_suspicious_low_cardinality_types \{#allow_suspicious_low_cardinality_types\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает или запрещает использование [LowCardinality](../../sql-reference/data-types/lowcardinality.md) с типами данных фиксированного размера 8 байт или меньше: числовыми типами данных и `FixedString(8_bytes_or_less)`.

Для значений небольшого фиксированного размера использование `LowCardinality` обычно неэффективно, так как ClickHouse хранит числовой индекс для каждой строки. В результате:

- Может увеличиться объём используемого дискового пространства.
- Потребление оперативной памяти (RAM) может быть выше в зависимости от размера словаря.
- Некоторые функции могут работать медленнее из-за дополнительных операций кодирования/декодирования.

Время слияний в таблицах движка [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) может увеличиваться по всем перечисленным выше причинам.

Возможные значения:

- 1 — использование `LowCardinality` не ограничено.
- 0 — использование `LowCardinality` ограничено.

## allow_suspicious_primary_key \{#allow_suspicious_primary_key\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Запрещает подозрительные PRIMARY KEY/ORDER BY для MergeTree (например, SimpleAggregateFunction)"}]}]}/>

Разрешить подозрительные `PRIMARY KEY`/`ORDER BY` для MergeTree (например, SimpleAggregateFunction).

## allow_suspicious_ttl_expressions \{#allow_suspicious_ttl_expressions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.12"},{"label": "0"},{"label": "Это новый параметр настройки, в предыдущих версиях поведение было эквивалентно его включению."}]}]}/>

Отклоняет выражения TTL, которые не зависят ни от одного столбца таблицы. В большинстве случаев это свидетельствует об ошибке пользователя.

## allow_suspicious_types_in_group_by \{#allow_suspicious_types_in_group_by\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "По умолчанию не разрешает использование типов Variant/Dynamic в GROUP BY"}]}]}/>

Разрешает или запрещает использование типов [Variant](../../sql-reference/data-types/variant.md) и [Dynamic](../../sql-reference/data-types/dynamic.md) в ключах GROUP BY.

## allow_suspicious_types_in_order_by \{#allow_suspicious_types_in_order_by\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "По умолчанию запрещать использование типов Variant/Dynamic в ORDER BY"}]}]}/>

Разрешает или запрещает использование типов [Variant](../../sql-reference/data-types/variant.md) и [Dynamic](../../sql-reference/data-types/dynamic.md) в ключах ORDER BY.

## allow_suspicious_variant_types \{#allow_suspicious_variant_types\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "По умолчанию запрещено создавать тип Variant с подозрительными вариантами"}]}]}/>

В операторе CREATE TABLE эта настройка позволяет указывать тип Variant с вариантами схожих типов (например, с различными числовыми типами или типами даты). Включение этой настройки может вносить некоторую неоднозначность при работе со значениями схожих типов.

## allow_unrestricted_reads_from_keeper \{#allow_unrestricted_reads_from_keeper\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает неограниченное (без ограничения по пути) чтение из таблицы system.zookeeper. Может быть полезно, но небезопасно для ZooKeeper.

## alter_move_to_space_execute_async \{#alter_move_to_space_execute_async\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Выполнять `ALTER TABLE MOVE ... TO [DISK|VOLUME]` в асинхронном режиме

## alter&#95;partition&#95;verbose&#95;result

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает отображение информации о партах, к которым операции над партициями и партами были успешно применены.
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


## alter_sync \{#alter_sync\} 

**Псевдонимы**: `replication_alter_partitions_sync`

<SettingsInfoBlock type="UInt64" default_value="1" />

Позволяет задать ожидание выполнения действий на репликах для запросов [ALTER](../../sql-reference/statements/alter/index.md), [OPTIMIZE](../../sql-reference/statements/optimize.md) или [TRUNCATE](../../sql-reference/statements/truncate.md).

Возможные значения:

- `0` — не ждать.
- `1` — ждать завершения собственного запроса.
- `2` — ждать завершения на всех репликах.

Облачное значение по умолчанию: `1`.

:::note
`alter_sync` применим только к `Replicated`-таблицам, он не влияет на ALTER-запросы к не-`Replicated`-таблицам.
:::

## alter_update_mode \{#alter_update_mode\} 

<SettingsInfoBlock type="AlterUpdateMode" default_value="heavy" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "heavy"},{"label": "A new setting"}]}]}/>

Режим выполнения запросов `ALTER`, содержащих команды `UPDATE`.

Возможные значения:

- `heavy` — выполнить обычную мутацию.
- `lightweight` — выполнить облегчённое обновление, если возможно, иначе выполнить обычную мутацию.
- `lightweight_force` — выполнить облегчённое обновление, если возможно, иначе выбросить ошибку.

## analyze_index_with_space_filling_curves \{#analyze_index_with_space_filling_curves\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если в индексе таблицы используется кривая, заполняющая пространство, например `ORDER BY mortonEncode(x, y)` или `ORDER BY hilbertEncode(x, y)`, и в запросе есть условия по её аргументам, например `x >= 10 AND x <= 20 AND y >= 20 AND y <= 30`, то для анализа индекса используется эта кривая.

## analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested \{#analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting."}]}]}/>

Разрешает добавлять составные идентификаторы во вложенный столбец типа Nested. Это параметр совместимости, так как изменяет результат запроса. При отключении `SELECT a.b.c FROM table ARRAY JOIN a` не работает, а `SELECT a FROM table` не включает столбец `a.b.c` в результат `Nested a`.

## analyzer_compatibility_join_using_top_level_identifier \{#analyzer_compatibility_join_using_top_level_identifier\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Force to resolve identifier in JOIN USING from projection"}]}]}/>

Принудительно разрешать идентификатор в `JOIN USING` на основе проекции (например, в запросе `SELECT a + 1 AS b FROM t1 JOIN t2 USING (b)` соединение будет выполняться по условию `t1.a + 1 = t2.b`, а не `t1.b = t2.b`).

## any_join_distinct_right_table_keys \{#any_join_distinct_right_table_keys\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.14"},{"label": "0"},{"label": "Отключить ANY RIGHT и ANY FULL JOIN по умолчанию, чтобы избежать неконсистентности результатов"}]}]}/>

Включает устаревшее поведение сервера ClickHouse в операциях `ANY INNER|LEFT JOIN`.

:::note
Используйте этот параметр только для обеспечения обратной совместимости, если ваши сценарии зависят от устаревшего поведения `JOIN`.
:::

Когда устаревшее поведение включено:

- Результаты операций `t1 ANY LEFT JOIN t2` и `t2 ANY RIGHT JOIN t1` не равны, потому что ClickHouse использует логику с отображением ключей таблиц «многие-к-одному» слева направо.
- Результаты операций `ANY INNER JOIN` содержат все строки из левой таблицы, аналогично операциям `SEMI LEFT JOIN`.

Когда устаревшее поведение отключено:

- Результаты операций `t1 ANY LEFT JOIN t2` и `t2 ANY RIGHT JOIN t1` равны, потому что ClickHouse использует логику, обеспечивающую отображение ключей «один-ко-многим» в операциях `ANY RIGHT JOIN`.
- Результаты операций `ANY INNER JOIN` содержат одну строку на ключ из обеих таблиц — левой и правой.

Возможные значения:

- 0 — устаревшее поведение отключено.
- 1 — устаревшее поведение включено.

См. также:

- [Строгость JOIN](/sql-reference/statements/select/join#settings)

## apply_deleted_mask \{#apply_deleted_mask\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает фильтрацию строк, удалённых с помощью lightweight DELETE. Если параметр отключён, запрос сможет читать эти строки. Это полезно для отладки и сценариев «undelete».

## apply_mutations_on_fly \{#apply_mutations_on_fly\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если имеет значение `true`, мутации (`UPDATE` и `DELETE`), которые ещё не материализованы в части данных, будут применяться при выполнении запросов `SELECT`.

## apply_patch_parts \{#apply_patch_parts\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "A new setting"}]}]}/>

Если значение равно `true`, части‑патчи (представляющие собой легковесные обновления) применяются в запросах `SELECT`.

## apply_patch_parts_join_cache_buckets \{#apply_patch_parts_join_cache_buckets\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "8"},{"label": "Новая настройка"}]}]}/>

Количество бакетов временного кэша, используемого для применения частей патча в режиме Join.

## apply_settings_from_server \{#apply_settings_from_server\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Код на стороне клиента (например, разбор входных данных INSERT и форматирование вывода результата запроса) будет использовать те же настройки, что и сервер, включая настройки из конфигурации сервера."}]}]}/>

Определяет, должен ли клиент принимать настройки от сервера.

Это влияет только на операции, выполняемые на стороне клиента, в частности на разбор входных данных INSERT и форматирование результата запроса. Основная часть выполнения запроса происходит на сервере и не зависит от этого параметра.

Обычно этот параметр следует задавать в профиле пользователя (users.xml или запросы типа `ALTER USER`), а не через клиент (аргументы командной строки клиента, запрос `SET` или секция `SETTINGS` запроса `SELECT`). Через клиент его можно изменить на false, но нельзя изменить на true (потому что сервер не будет отправлять настройки, если в профиле пользователя указано `apply_settings_from_server = false`).

Обратите внимание, что изначально (24.12) существовал серверный параметр (`send_settings_to_client`), но позже он был заменён этим клиентским параметром для улучшения удобства использования.

## arrow_flight_request_descriptor_type \{#arrow_flight_request_descriptor_type\} 

<SettingsInfoBlock type="ArrowFlightDescriptorType" default_value="path" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "path"},{"label": "Новая настройка. Тип дескриптора, используемого для запросов Arrow Flight: 'path' или 'command'. Для Dremio требуется 'command'."}]}]}/>

Тип дескриптора, используемого для запросов Arrow Flight. Значение 'path' отправляет имя набора данных как дескриптор пути. Значение 'command' отправляет SQL‑запрос как дескриптор команды (обязательно для Dremio).

Возможные значения:

- 'path' — использовать FlightDescriptor::Path (значение по умолчанию, работает с большинством серверов Arrow Flight)
- 'command' — использовать FlightDescriptor::Command с запросом SELECT (обязательно для Dremio)

## asterisk_include_alias_columns \{#asterisk_include_alias_columns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает столбцы-алиасы ([ALIAS](../../sql-reference/statements/create/table.md/#alias)) в результат запроса с подстановочным символом (`SELECT *`).

Возможные значения:

- 0 — отключено
- 1 — включено

## asterisk_include_materialized_columns \{#asterisk_include_materialized_columns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включать столбцы [MATERIALIZED](/sql-reference/statements/create/view#materialized-view) в запросах с подстановочным символом (`SELECT *`).

Возможные значения:

- 0 - отключено
- 1 - включено

## async_insert \{#async_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение true, данные из запроса INSERT помещаются в очередь и позже записываются в таблицу в фоновом режиме. Если wait_for_async_insert имеет значение false, запрос INSERT обрабатывается почти мгновенно, в противном случае клиент будет ждать, пока данные не будут записаны в таблицу.

## async_insert_busy_timeout_decrease_rate \{#async_insert_busy_timeout_decrease_rate\} 

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "Коэффициент экспоненциального уменьшения адаптивного тайм-аута асинхронной вставки"}]}]}/>

Коэффициент экспоненциального уменьшения адаптивного тайм-аута асинхронной вставки

## async_insert_busy_timeout_increase_rate \{#async_insert_busy_timeout_increase_rate\} 

<SettingsInfoBlock type="Double" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0.2"},{"label": "Коэффициент экспоненциального роста, с которым увеличивается адаптивный тайм-аут асинхронной вставки"}]}]}/>

Коэффициент экспоненциального роста, с которым увеличивается адаптивный тайм-аут асинхронной вставки

## async_insert_busy_timeout_max_ms \{#async_insert_busy_timeout_max_ms\} 

**Aliases**: `async_insert_busy_timeout_ms`

<SettingsInfoBlock type="Milliseconds" default_value="200" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "200"},{"label": "Минимально допустимое значение тайм‑аута асинхронной вставки в миллисекундах; async_insert_busy_timeout_ms является псевдонимом для async_insert_busy_timeout_max_ms"}]}]}/>

Максимальное время ожидания с момента появления первых данных до сброса собранных данных для запроса.

## async_insert_busy_timeout_min_ms \{#async_insert_busy_timeout_min_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "50"},{"label": "Минимальное значение таймаута асинхронной вставки в миллисекундах; также служит начальным значением, которое впоследствии может быть увеличено адаптивным алгоритмом"}]}]}/>

Если автонастройка таймаута включена параметром async_insert_use_adaptive_busy_timeout, это минимальное время ожидания перед сбросом собранных данных по запросу с момента появления первых данных. Также служит начальным значением для адаптивного алгоритма.

## async_insert_deduplicate \{#async_insert_deduplicate\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Для асинхронных запросов INSERT в реплицируемой таблице указывает, что должна выполняться дедупликация вставляемых блоков.

## async_insert_max_data_size \{#async_insert_max_data_size\} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10485760"},{"label": "Предыдущее значение оказалось слишком маленьким."}]}]}/>

Максимальный размер в байтах неразобранных данных, собираемых для одного запроса перед вставкой.

## async_insert_max_query_number \{#async_insert_max_query_number\} 

<SettingsInfoBlock type="UInt64" default_value="450" />

Максимальное количество запросов `INSERT` перед выполнением вставки.
Настройка применяется только если параметр [`async_insert_deduplicate`](#async_insert_deduplicate) равен 1.

## async_insert_poll_timeout_ms \{#async_insert_poll_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "10"},{"label": "Тайм-аут в миллисекундах для опроса данных из очереди асинхронных вставок"}]}]}/>

Тайм-аут для опроса данных из очереди асинхронных вставок

## async_insert_use_adaptive_busy_timeout \{#async_insert_use_adaptive_busy_timeout\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Адаптивный таймаут асинхронных вставок"}]}]}/>

Если установлено в значение true, используется адаптивный таймаут ожидания при занятости для асинхронных вставок

## async_query_sending_for_remote \{#async_query_sending_for_remote\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.3"},{"label": "1"},{"label": "Асинхронное создание подключений и отправка запросов по шардам"}]}]}/>

Включает асинхронное создание подключений и асинхронную отправку запросов при выполнении удалённого запроса.

По умолчанию включено.

## async_socket_for_remote \{#async_socket_for_remote\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.5"},{"label": "1"},{"label": "Устранены все проблемы, асинхронное чтение из сокета для удалённых запросов снова включено по умолчанию"}]}, {"id": "row-2","items": [{"label": "21.3"},{"label": "0"},{"label": "Асинхронное чтение из сокета для удалённых запросов отключено из-за некоторых проблем"}]}]}/>

Включает асинхронное чтение из сокета при выполнении удалённого запроса.

Включено по умолчанию.

## azure_allow_parallel_part_upload \{#azure_allow_parallel_part_upload\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "true"},{"label": "Использует несколько потоков для многокомпонентной загрузки в Azure."}]}]}/>

Использует несколько потоков для многокомпонентной загрузки в Azure.

## azure_check_objects_after_upload \{#azure_check_objects_after_upload\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "Проверяет каждый загруженный объект в Azure Blob Storage, чтобы убедиться в успешной загрузке"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "Проверяет каждый загруженный объект в Azure Blob Storage, чтобы убедиться в успешной загрузке"}]}]}/>

Проверяет каждый загруженный объект в Azure Blob Storage, чтобы убедиться в успешной загрузке

## azure_connect_timeout_ms \{#azure_connect_timeout_ms\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1000"},{"label": "New setting"}]}]}/>

Тайм-аут подключения к хосту с дисками Azure.

## azure_create_new_file_on_insert \{#azure_create_new_file_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает создание нового файла при каждой вставке в таблицы движка Azure

## azure_ignore_file_doesnt_exist \{#azure_ignore_file_doesnt_exist\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Позволяет возвращать 0 строк, когда запрошенные файлы отсутствуют, вместо выбрасывания исключения в движке таблиц AzureBlobStorage"}]}]}/>

Игнорировать отсутствие файла при чтении определённых ключей.

Возможные значения:

- 1 — `SELECT` возвращает пустой результат.
- 0 — `SELECT` выбрасывает исключение.

## azure_list_object_keys_size \{#azure_list_object_keys_size\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальное количество файлов, которое может быть возвращено одним пакетным запросом ListObject

## azure_max_blocks_in_multipart_upload \{#azure_max_blocks_in_multipart_upload\} 

<SettingsInfoBlock type="UInt64" default_value="50000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "50000"},{"label": "Максимальное количество блоков в многокомпонентной загрузке для Azure."}]}]}/>

Максимальное количество блоков в многокомпонентной загрузке для Azure.

## azure_max_get_burst \{#azure_max_get_burst\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Максимальное количество запросов, которые могут быть отправлены одновременно до достижения ограничения на количество запросов в секунду. По умолчанию значение `0` соответствует `azure_max_get_rps`.

## azure_max_get_rps \{#azure_max_get_rps\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Ограничение на количество GET-запросов к Azure в секунду, после превышения которого включается ограничение (throttling). Ноль означает отсутствие ограничения.

## azure_max_inflight_parts_for_one_file \{#azure_max_inflight_parts_for_one_file\} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "20"},{"label": "Максимальное количество одновременно загружаемых частей в multipart-запросе загрузки. 0 — без ограничений."}]}]}/>

Максимальное количество одновременно загружаемых частей в multipart-запросе загрузки. 0 — без ограничений.

## azure_max_put_burst \{#azure_max_put_burst\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Максимальное количество запросов, которые могут быть отправлены одновременно перед достижением ограничения на количество запросов в секунду. По умолчанию (0) значение совпадает с `azure_max_put_rps`.

## azure_max_put_rps \{#azure_max_put_rps\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Предел скорости Azure PUT-запросов (количество запросов в секунду) перед применением ограничения скорости (throttling). Ноль означает отсутствие ограничения.

## azure_max_redirects \{#azure_max_redirects\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "New setting"}]}]}/>

Максимально допустимое количество последовательных перенаправлений Azure.

## azure_max_single_part_copy_size \{#azure_max_single_part_copy_size\} 

<SettingsInfoBlock type="UInt64" default_value="268435456" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268435456"},{"label": "Максимальный размер объекта, который можно скопировать одной операцией копирования в хранилище BLOB-объектов Azure."}]}]}/>

Максимальный размер объекта, который можно скопировать одной операцией копирования в хранилище BLOB-объектов Azure.

## azure_max_single_part_upload_size \{#azure_max_single_part_upload_size\} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "33554432"},{"label": "Приведено в соответствие с S3"}]}]}/>

Максимальный размер объекта для загрузки при одночастичной (single-part) загрузке в Azure Blob Storage.

## azure_max_single_read_retries \{#azure_max_single_read_retries\} 

<SettingsInfoBlock type="UInt64" default_value="4" />

Максимальное количество повторных попыток при однократном чтении из объектного хранилища Azure Blob.

## azure_max_unexpected_write_error_retries \{#azure_max_unexpected_write_error_retries\} 

<SettingsInfoBlock type="UInt64" default_value="4" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "4"},{"label": "Максимальное количество повторных попыток при возникновении неожиданных ошибок при записи в хранилище Azure Blob Storage"}]}]}/>

Максимальное количество повторных попыток при возникновении неожиданных ошибок при записи в хранилище Azure Blob Storage

## azure_max_upload_part_size \{#azure_max_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5368709120"},{"label": "Максимальный размер фрагмента данных при многочастичной загрузке в хранилище объектов Azure (Azure Blob Storage)."}]}]}/>

Максимальный размер фрагмента данных при многочастичной загрузке в хранилище объектов Azure (Azure Blob Storage).

## azure_min_upload_part_size \{#azure_min_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="16777216" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "16777216"},{"label": "Минимальный размер части при многочастичной (multipart) загрузке в Azure Blob Storage."}]}]}/>

Минимальный размер части при многочастичной (multipart) загрузке в Azure Blob Storage.

## azure_request_timeout_ms \{#azure_request_timeout_ms\} 

<SettingsInfoBlock type="UInt64" default_value="30000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "30000"},{"label": "New setting"}]}]}/>

Таймаут бездействия при отправке и получении данных в/из Azure. Генерируется ошибка, если один вызов чтения или записи по TCP блокируется дольше этого времени.

## azure_sdk_max_retries \{#azure_sdk_max_retries\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Максимальное число повторных попыток в Azure SDK"}]}]}/>

Максимальное число повторных попыток в Azure SDK

## azure_sdk_retry_initial_backoff_ms \{#azure_sdk_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "10"},{"label": "Минимальный интервал ожидания между повторными попытками в Azure SDK"}]}]}/>

Минимальный интервал ожидания между повторными попытками в Azure SDK

## azure_sdk_retry_max_backoff_ms \{#azure_sdk_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Максимальная задержка между повторными попытками в Azure SDK"}]}]}/>

Максимальная задержка между повторными попытками в Azure SDK

## azure_skip_empty_files \{#azure_skip_empty_files\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Разрешить пропускать пустые файлы в движке таблиц Azure"}]}]}/>

Включает или отключает пропуск пустых файлов в движке S3.

Возможные значения:

- 0 — `SELECT` выбрасывает исключение, если пустой файл не соответствует запрошенному формату.
- 1 — `SELECT` возвращает пустой результат для пустого файла.

## azure_strict_upload_part_size \{#azure_strict_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Точный размер фрагмента, загружаемого при многочастичной загрузке в хранилище Azure Blob."}]}]}/>

Точный размер фрагмента, загружаемого при многочастичной загрузке в хранилище Azure Blob.

## azure_throw_on_zero_files_match \{#azure_throw_on_zero_files_match\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Позволяет возвращать ошибку, если запрос ListObjects не находит ни одного файла в движке AzureBlobStorage, вместо возврата пустого результата запроса"}]}]}/>

Возвращать ошибку, если по правилам раскрытия шаблонов glob не найдено ни одного файла.

Возможные значения:

- 1 — `SELECT` возвращает исключение.
- 0 — `SELECT` возвращает пустой результат.

## azure_truncate_on_insert \{#azure_truncate_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает очистку перед вставкой в таблицы движка Azure.

## azure_upload_part_size_multiply_factor \{#azure_upload_part_size_multiply_factor\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "2"},{"label": "Умножать azure_min_upload_part_size на этот коэффициент каждый раз, когда в ходе одной операции записи в Azure Blob Storage было загружено azure_multiply_parts_count_threshold частей."}]}]}/>

Умножать azure_min_upload_part_size на этот коэффициент каждый раз, когда в ходе одной операции записи в Azure Blob Storage было загружено azure_multiply_parts_count_threshold частей.

## azure_upload_part_size_multiply_parts_count_threshold \{#azure_upload_part_size_multiply_parts_count_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "500"},{"label": "Каждый раз, когда в Azure Blob Storage загружается указанное число частей, параметр `azure_min_upload_part_size` умножается на `azure_upload_part_size_multiply_factor`."}]}]}/>

Каждый раз, когда в Azure Blob Storage загружается указанное число частей, параметр `azure_min_upload_part_size` умножается на `azure_upload_part_size_multiply_factor`.

## azure_use_adaptive_timeouts \{#azure_use_adaptive_timeouts\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

Если установлено значение `true`, для всех запросов к Azure первые две попытки выполняются с небольшими таймаутами отправки и получения.
Если установлено значение `false`, все попытки выполняются с одинаковыми таймаутами.

## backup_restore_batch_size_for_keeper_multi \{#backup_restore_batch_size_for_keeper_multi\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальный размер пакета для multi-запроса к [Zoo]Keeper при создании резервной копии или восстановлении.

## backup_restore_batch_size_for_keeper_multiread \{#backup_restore_batch_size_for_keeper_multiread\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальный размер пакета для запроса multiread к [Zoo]Keeper во время создания резервной копии или восстановления

## backup_restore_failure_after_host_disconnected_for_seconds \{#backup_restore_failure_after_host_disconnected_for_seconds\} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "3600"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "3600"},{"label": "New setting."}]}]}/>

Если во время выполнения `BACKUP ON CLUSTER` или `RESTORE ON CLUSTER` хост не воссоздаёт свой эфемерный узел `alive` в ZooKeeper в течение этого времени, вся операция резервного копирования или восстановления считается завершившейся с ошибкой.
Это значение должно быть больше любого разумного времени, необходимого хосту для переподключения к ZooKeeper после сбоя.
Ноль означает отсутствие ограничения по времени.

## backup_restore_finish_timeout_after_error_sec \{#backup_restore_finish_timeout_after_error_sec\} 

<SettingsInfoBlock type="UInt64" default_value="180" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "180"},{"label": "Новая настройка."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "180"},{"label": "Новая настройка."}]}]}/>

Время, в течение которого инициатор должен ожидать, пока другие хосты отреагируют на узел `error` и прекратят выполнение текущей операции BACKUP ON CLUSTER или RESTORE ON CLUSTER.

## backup_restore_keeper_fault_injection_probability \{#backup_restore_keeper_fault_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

Приблизительная вероятность сбоя запроса к keeper во время операций резервного копирования или восстановления. Допустимое значение находится в интервале [0.0f, 1.0f]

## backup_restore_keeper_fault_injection_seed \{#backup_restore_keeper_fault_injection_seed\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 — случайное значение seed, иначе — значение настройки

## backup_restore_keeper_max_retries \{#backup_restore_keeper_max_retries\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1000"},{"label": "Значение должно быть достаточно большим, чтобы операция BACKUP или RESTORE не завершилась сбоем из‑за временного сбоя [Zoo]Keeper во время её выполнения."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1000"},{"label": "Значение должно быть достаточно большим, чтобы операция BACKUP или RESTORE не завершилась сбоем из‑за временного сбоя [Zoo]Keeper во время её выполнения."}]}]}/>

Максимальное число повторных попыток операций [Zoo]Keeper во время выполнения операции BACKUP или RESTORE.
Значение должно быть достаточно большим, чтобы вся операция не завершилась сбоем из‑за временного сбоя [Zoo]Keeper.

## backup_restore_keeper_max_retries_while_handling_error \{#backup_restore_keeper_max_retries_while_handling_error\} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "New setting."}]}]}/>

Максимальное количество повторных попыток выполнения операций [Zoo]Keeper при обработке ошибок операций BACKUP ON CLUSTER или RESTORE ON CLUSTER.

## backup_restore_keeper_max_retries_while_initializing \{#backup_restore_keeper_max_retries_while_initializing\} 

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "20"},{"label": "New setting."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "20"},{"label": "New setting."}]}]}/>

Максимальное количество повторных попыток выполнения операций [Zoo]Keeper при инициализации операции BACKUP ON CLUSTER или RESTORE ON CLUSTER.

## backup_restore_keeper_retry_initial_backoff_ms \{#backup_restore_keeper_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Начальное время задержки (backoff) для повторных операций [Zoo]Keeper во время резервного копирования или восстановления

## backup_restore_keeper_retry_max_backoff_ms \{#backup_restore_keeper_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

Максимальный интервал ожидания (backoff) для операций [Zoo]Keeper во время резервного копирования или восстановления

## backup_restore_keeper_value_max_size \{#backup_restore_keeper_value_max_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Максимальный размер данных узла [Zoo]Keeper при создании резервной копии

## backup_restore_s3_retry_attempts \{#backup_restore_s3_retry_attempts\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1000"},{"label": "Параметр конфигурации для Aws::Client::RetryStrategy, сам Aws::Client выполняет повторные попытки, 0 означает отсутствие повторных попыток. Используется только при операциях резервного копирования и восстановления."}]}]}/>

Параметр конфигурации для Aws::Client::RetryStrategy, сам Aws::Client выполняет повторные попытки, 0 означает отсутствие повторных попыток. Используется только при операциях резервного копирования и восстановления.

## backup_restore_s3_retry_initial_backoff_ms \{#backup_restore_s3_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="25" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "25"},{"label": "New setting"}]}]}/>

Начальная задержка (backoff) в миллисекундах перед первой повторной попыткой во время резервного копирования и восстановления. Каждая последующая попытка увеличивает задержку экспоненциально, до максимального значения, заданного параметром `backup_restore_s3_retry_max_backoff_ms`.

## backup_restore_s3_retry_jitter_factor \{#backup_restore_s3_retry_jitter_factor\} 

<SettingsInfoBlock type="Float" default_value="0.1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0.1"},{"label": "New setting"}]}]}/>

Коэффициент джиттера (jitter), применяемый к задержке отката между повторами (retry backoff delay) в Aws::Client::RetryStrategy во время операций резервного копирования и восстановления. Вычисленная задержка умножается на случайный коэффициент в диапазоне [1.0, 1.0 + jitter], но не более максимального значения `backup_restore_s3_retry_max_backoff_ms`. Должен находиться в интервале [0.0, 1.0].

## backup_restore_s3_retry_max_backoff_ms \{#backup_restore_s3_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5000"},{"label": "New setting"}]}]}/>

Максимальная задержка в миллисекундах между повторными попытками при операциях резервного копирования и восстановления.

## backup_slow_all_threads_after_retryable_s3_error \{#backup_slow_all_threads_after_retryable_s3_error\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка"}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "0"},{"label": "Новая настройка"}]}, {"id": "row-3","items": [{"label": "25.10"},{"label": "0"},{"label": "Настройка по умолчанию отключена"}]}]}/>

Если установлено в `true`, все потоки, выполняющие S3‑запросы к одной и той же конечной точке резервного копирования, замедляются
после того, как любой отдельный S3‑запрос получает ошибку S3, допускающую повторную попытку (retryable), например `Slow Down`.
Если установлено в `false`, каждый поток обрабатывает backoff S3‑запросов независимо от остальных.

## cache_warmer_threads \{#cache_warmer_threads\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="4" />

Параметр действует только в ClickHouse Cloud. Количество фоновых потоков для опережающей загрузки новых частей данных в файловый кэш, когда параметр [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch) включён. Установите 0, чтобы отключить.

## calculate_text_stack_trace \{#calculate_text_stack_trace\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Вычислять текстовый стек вызовов при возникновении исключений во время выполнения запроса. Это значение по умолчанию. Для этого требуется поиск символов, который может замедлить фаззинг‑тесты, когда выполняется большое количество некорректных запросов. В обычных случаях не следует отключать эту настройку.

## cancel_http_readonly_queries_on_client_close \{#cancel_http_readonly_queries_on_client_close\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Отменяет HTTP-запросы только для чтения (например, SELECT), когда клиент закрывает соединение, не дожидаясь ответа.

Значение по умолчанию в Cloud: `0`.

## cast_ipv4_ipv6_default_on_conversion_error \{#cast_ipv4_ipv6_default_on_conversion_error\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.3"},{"label": "0"},{"label": "Сделать так, чтобы функции cast(value, 'IPv4') и cast(value, 'IPv6') вели себя так же, как функции toIPv4 и toIPv6"}]}]}/>

Оператор CAST в тип IPv4, оператор CAST в тип IPv6, а также функции toIPv4 и toIPv6 будут возвращать значение по умолчанию вместо возбуждения исключения при ошибке преобразования.

## cast&#95;keep&#95;nullable

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает сохранение типа данных `Nullable` в операциях [CAST](/sql-reference/functions/type-conversion-functions#cast).

Когда настройка включена и аргумент функции `CAST` имеет тип `Nullable`, результат также имеет тип `Nullable`. Когда настройка отключена, результат всегда имеет точно целевой тип.

Возможные значения:

* 0 — результат `CAST` имеет точно указанный целевой тип.
* 1 — если тип аргумента — `Nullable`, результат `CAST` преобразуется в `Nullable(DestinationDataType)`.

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

* Функция [CAST](/sql-reference/functions/type-conversion-functions#cast)


## cast_string_to_date_time_mode \{#cast_string_to_date_time_mode\} 

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "basic"},{"label": "Allow to use different DateTime parsing mode in String to DateTime cast"}]}]}/>

Позволяет выбрать режим разбора текстового представления даты и времени при приведении типа из String к DateTime.

Возможные значения:

- `'best_effort'` — Включает расширенный разбор.

    ClickHouse может разбирать базовый формат `YYYY-MM-DD HH:MM:SS` и все форматы даты и времени [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601). Например, `'2018-06-08T01:02:03.000Z'`.

- `'best_effort_us'` — Аналогичен `best_effort` (см. различия в [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parsedatetimebesteffortus)).

- `'basic'` — Использовать базовый парсер.

    ClickHouse может разбирать только базовый формат `YYYY-MM-DD HH:MM:SS` или `YYYY-MM-DD`. Например, `2019-08-20 10:18:56` или `2019-08-20`.

См. также:

- [Тип данных DateTime.](../../sql-reference/data-types/datetime.md)
- [Функции для работы с датой и временем.](../../sql-reference/functions/date-time-functions.md)

## cast_string_to_dynamic_use_inference \{#cast_string_to_dynamic_use_inference\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "0"},{"label": "Добавлена настройка, позволяющая преобразовывать String в Dynamic с помощью парсинга"}]}]}/>

Использовать вывод типов при преобразовании String в Dynamic

## cast_string_to_variant_use_inference \{#cast_string_to_variant_use_inference\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Новая настройка для включения/отключения вывода типов при приведении типов (CAST) из String в Variant"}]}]}/>

Использовать вывод типов при приведении типов (CAST) из String в Variant.

## check_query_single_value_result \{#check_query_single_value_result\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Изменена настройка, чтобы сделать CHECK TABLE более информативной"}]}]}/>

Определяет уровень детализации результата запроса [CHECK TABLE](/sql-reference/statements/check-table) для движков семейства `MergeTree`.

Возможные значения:

- 0 — запрос показывает статус проверки для каждой отдельной части данных таблицы.
- 1 — запрос показывает общий статус проверки таблицы.

## check_referential_table_dependencies \{#check_referential_table_dependencies\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Проверяет, что DDL-запрос (например, DROP TABLE или RENAME) не нарушает ссылочные зависимости

## check_table_dependencies \{#check_table_dependencies\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Проверяет, что DDL-запрос (например, DROP TABLE или RENAME) не приведёт к нарушению зависимостей

## checksum_on_read \{#checksum_on_read\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Проверяет контрольные суммы при чтении. По умолчанию параметр включён и всегда должен оставаться включённым в продакшене. Не следует ожидать каких-либо преимуществ от его отключения. Он может использоваться только для экспериментов и бенчмарков. Настройка применима только к таблицам семейства MergeTree. Для других движков таблиц, а также при получении данных по сети контрольные суммы всегда проверяются.

## cloud_mode \{#cloud_mode\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Облачный режим

## cloud_mode_database_engine \{#cloud_mode_database_engine\} 

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "Настройка для ClickHouse Cloud"}]}]}/>

Движок базы данных, разрешённый в ClickHouse Cloud. 1 — переписывать DDL для использования базы данных Replicated, 2 — переписывать DDL для использования базы данных Shared.

## cloud_mode_engine \{#cloud_mode_engine\} 

<SettingsInfoBlock type="UInt64" default_value="1" />

Семейство движков, разрешённое в облаке.

- 0 — разрешить всё
- 1 — переписывать DDL для использования *ReplicatedMergeTree
- 2 — переписывать DDL для использования SharedMergeTree
- 3 — переписывать DDL для использования SharedMergeTree, за исключением случаев, когда явно указан удалённый диск

UInt64, чтобы минимизировать публичную часть

## cluster_for_parallel_replicas \{#cluster_for_parallel_replicas\} 

<BetaBadge/>

Кластер для шарда, в который входит текущий сервер

## cluster_function_process_archive_on_multiple_nodes \{#cluster_function_process_archive_on_multiple_nodes\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "New setting"}]}]}/>

Если установлено в значение `true`, повышает производительность обработки архивов в кластерных функциях. Для обеспечения совместимости и во избежание ошибок при обновлении до версии 25.7+ при использовании кластерных функций с архивами в более ранних версиях, следует установить значение `false`.

## cluster_table_function_buckets_batch_size \{#cluster_table_function_buckets_batch_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Определяет примерный размер пакета (в байтах), используемого при распределённой обработке задач в табличных функциях `cluster` с гранулярностью разбиения `bucket`. Система накапливает данные до тех пор, пока не будет достигнут как минимум этот объём. Фактический размер может быть немного больше для выравнивания по границам данных.

## cluster_table_function_split_granularity \{#cluster_table_function_split_granularity\} 

<SettingsInfoBlock type="ObjectStorageGranularityLevel" default_value="file" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "file"},{"label": "New setting."}]}]}/>

Определяет, как данные разбиваются на задачи при выполнении табличной функции CLUSTER.

Этот параметр задаёт гранулярность распределения работы по кластеру:

- `file` — каждая задача обрабатывает целый файл.
- `bucket` — задачи создаются для каждого внутреннего блока данных внутри файла (например, для групп строк в Parquet).

Выбор более мелкой гранулярности (такой как `bucket`) может повысить степень параллелизма при работе с небольшим количеством крупных файлов.
Например, если файл Parquet содержит несколько групп строк, использование гранулярности `bucket` позволяет обрабатывать каждую группу независимо разными исполнителями.

## collect_hash_table_stats_during_aggregation \{#collect_hash_table_stats_during_aggregation\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает сбор статистики хеш-таблиц для оптимизации выделения памяти.

## collect_hash_table_stats_during_joins \{#collect_hash_table_stats_during_joins\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "New setting."}]}]}/>

Включает сбор статистики хеш-таблиц для оптимизации распределения памяти.

## compatibility \{#compatibility\} 

Настройка `compatibility` заставляет ClickHouse использовать настройки по умолчанию из предыдущей версии ClickHouse, при этом предыдущая версия указывается в значении настройки.

Если некоторые настройки заданы незначениями по умолчанию, то эти настройки сохраняются (настройка `compatibility` влияет только на параметры, которые не были изменены).

Для этой настройки указывается номер версии ClickHouse в виде строки, например `22.3`, `22.8`. Пустое значение означает, что эта настройка отключена.

По умолчанию отключена.

:::note
В ClickHouse Cloud значение настройки совместимости по умолчанию на уровне сервиса должно быть установлено службой поддержки ClickHouse Cloud. Пожалуйста, [откройте обращение](https://clickhouse.cloud/support), чтобы его установить.
Однако настройку совместимости можно переопределить на уровне пользователя, роли, профиля, запроса или сеанса, используя стандартные механизмы настройки ClickHouse, такие как `SET compatibility = '22.3'` в сеансе или `SETTINGS compatibility = '22.3'` в запросе.
:::

## compatibility_ignore_auto_increment_in_create_table \{#compatibility_ignore_auto_increment_in_create_table\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать ключевое слово AUTO_INCREMENT в объявлении столбца, если параметр установлен в значение true, в противном случае возвращать ошибку. Упрощает миграцию с MySQL.

## compatibility_ignore_collation_in_create_table \{#compatibility_ignore_collation_in_create_table\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Игнорировать collation в CREATE TABLE (для совместимости)

## compile_aggregate_expressions \{#compile_aggregate_expressions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает JIT-компиляцию агрегатных функций в нативный код. Включение этого параметра может повысить производительность.

Возможные значения:

- 0 — Агрегирование выполняется без JIT-компиляции.
- 1 — Агрегирование выполняется с использованием JIT-компиляции.

**См. также**

- [min_count_to_compile_aggregate_expression](#min_count_to_compile_aggregate_expression)

## compile_expressions \{#compile_expressions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Мы считаем, что инфраструктура LLVM, используемая JIT-компилятором, достаточно стабильна, чтобы этот параметр был включён по умолчанию."}]}]}/>

Компилирует некоторые скалярные функции и операторы в нативный код.

## compile_sort_description \{#compile_sort_description\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Компилирует описание сортировки в машинный код.

## connect_timeout \{#connect_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="10" />

Время ожидания подключения при отсутствии реплик.

## connect_timeout_with_failover_ms \{#connect_timeout_with_failover_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "Increase default connect timeout because of async connect"}]}]}/>

Таймаут в миллисекундах для подключения к удалённому серверу для движка таблиц `Distributed`, если в определении кластера используются секции `shard` и `replica`.
В случае неудачи выполняется несколько попыток подключения к различным репликам.

## connect_timeout_with_failover_secure_ms \{#connect_timeout_with_failover_secure_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1000"},{"label": "Увеличено значение таймаута защищённого подключения по умолчанию из‑за асинхронного установления соединения"}]}]}/>

Таймаут подключения для выбора первой работоспособной реплики (для защищённых подключений).

## connection_pool_max_wait_ms \{#connection_pool_max_wait_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Время ожидания подключения в миллисекундах, когда пул соединений заполнен.

Возможные значения:

- Положительное целое число.
- 0 — бесконечный таймаут.

## connections_with_failover_max_tries \{#connections_with_failover_max_tries\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

Максимальное количество попыток установления соединения с каждой репликой при использовании движка таблиц Distributed.

## convert&#95;query&#95;to&#95;cnf

<SettingsInfoBlock type="Bool" default_value="0" />

Если установить значение `true`, запрос `SELECT` будет преобразован в конъюнктивную нормальную форму (CNF). В ряде случаев выполнение запроса, переписанного в CNF, может быть быстрее (см. это [обсуждение в GitHub](https://github.com/ClickHouse/ClickHouse/issues/11749) для пояснения).

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

Установим параметр `convert_query_to_cnf` в `true` и посмотрим, что изменится:

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

Обратите внимание, что выражение `WHERE` переписано в КНФ, но результирующий набор данных идентичен — булева логика не изменилась:

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


## correlated_subqueries_default_join_kind \{#correlated_subqueries_default_join_kind\} 

<SettingsInfoBlock type="DecorrelationJoinKind" default_value="right" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "right"},{"label": "Новая настройка. Тип соединения по умолчанию для декоррелированного плана запроса."}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "right"},{"label": "Новая настройка. Тип соединения по умолчанию для декоррелированного плана запроса."}]}]}/>

Определяет тип соединений в декоррелированном плане запроса. Значение по умолчанию — `right`, что означает, что декоррелированный план будет содержать операции RIGHT JOIN с подзапросом в правой части.

Возможные значения:

- `left` — в процессе декорреляции будут создаваться операции LEFT JOIN, и входная таблица будет располагаться слева.
- `right` — в процессе декорреляции будут создаваться операции RIGHT JOIN, и входная таблица будет располагаться справа.

## correlated_subqueries_substitute_equivalent_expressions \{#correlated_subqueries_substitute_equivalent_expressions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "Новая настройка для оптимизации планирования коррелированных подзапросов."}]}]}/>

Использует фильтрующие выражения, чтобы определять эквивалентные выражения и подставлять их вместо использования CROSS JOIN.

## count_distinct_implementation \{#count_distinct_implementation\} 

<SettingsInfoBlock type="String" default_value="uniqExact" />

Указывает, какая из функций `uniq*` используется при вычислении выражения [COUNT(DISTINCT ...)](/sql-reference/aggregate-functions/reference/count).

Возможные значения:

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)

## count_distinct_optimization \{#count_distinct_optimization\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Преобразовывать `count distinct` в подзапрос с `GROUP BY`

## count_matches_stop_at_empty_match \{#count_matches_stop_at_empty_match\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "New setting."}]}]}/>

Останавливает подсчёт, как только в функции `countMatches` происходит пустое совпадение по шаблону.

## create_if_not_exists \{#create_if_not_exists\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Включает `IF NOT EXISTS` для оператора `CREATE` по умолчанию. Если включена эта настройка или указано `IF NOT EXISTS`, и таблица с данным именем уже существует, исключение не будет выброшено.

## create_index_ignore_unique \{#create_index_ignore_unique\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорирует ключевое слово UNIQUE в CREATE UNIQUE INDEX. Используется для тестов совместимости с SQL.

## create_replicated_merge_tree_fault_injection_probability \{#create_replicated_merge_tree_fault_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

Вероятность внесения сбоя при создании таблицы после создания метаданных в ZooKeeper

## create_table_empty_primary_key_by_default \{#create_table_empty_primary_key_by_default\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Better usability"}]}]}/>

Позволяет создавать таблицы MergeTree с пустым первичным ключом, если не заданы ORDER BY и PRIMARY KEY

## cross_join_min_bytes_to_compress \{#cross_join_min_bytes_to_compress\} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "1073741824"},{"label": "Минимальный размер блока для сжатия в CROSS JOIN. Нулевое значение означает отключение этого порога. Блок сжимается, когда достигнут любой из двух порогов (по строкам или по байтам)."}]}]}/>

Минимальный размер блока для сжатия в CROSS JOIN. Нулевое значение означает отключение этого порога. Блок сжимается, когда достигнут любой из двух порогов (по строкам или по байтам).

## cross_join_min_rows_to_compress \{#cross_join_min_rows_to_compress\} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "10000000"},{"label": "Минимальное число строк для сжатия блока в CROSS JOIN. Нулевое значение означает, что этот порог отключён. Блок сжимается, когда достигается любой из двух порогов (по числу строк или по размеру в байтах)."}]}]}/>

Минимальное число строк для сжатия блока в CROSS JOIN. Нулевое значение означает, что этот порог отключён. Блок сжимается, когда достигается любой из двух порогов (по числу строк или по размеру в байтах).

## data_type_default_nullable \{#data_type_default_nullable\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, что типы данных без явных модификаторов [NULL или NOT NULL](/sql-reference/statements/create/table#null-or-not-null-modifiers) в определении столбца будут считаться [Nullable](/sql-reference/data-types/nullable).

Возможные значения:

- 1 — Типы данных в определениях столбцов по умолчанию считаются `Nullable`.
- 0 — Типы данных в определениях столбцов по умолчанию считаются не `Nullable`.

## database_atomic_wait_for_drop_and_detach_synchronously \{#database_atomic_wait_for_drop_and_detach_synchronously\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Добавляет модификатор `SYNC` ко всем запросам `DROP` и `DETACH`.

Возможные значения:

- 0 — Запросы будут выполняться с задержкой.
- 1 — Запросы будут выполняться без задержки.

## database_replicated_allow_explicit_uuid \{#database_replicated_allow_explicit_uuid\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Добавлена новая настройка, запрещающая явное указание UUID таблицы"}]}]}/>

0 — Запретить явное указание UUID таблиц в реплицируемых базах данных. 1 — Разрешить. 2 — Разрешить, но игнорировать указанный UUID и вместо него генерировать случайный.

## database_replicated_allow_heavy_create \{#database_replicated_allow_heavy_create\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Длительно выполняющиеся DDL-запросы (CREATE AS SELECT и POPULATE) для движка базы данных Replicated были запрещены"}]}]}/>

Разрешает длительно выполняющиеся DDL-запросы (CREATE AS SELECT и POPULATE) в движке базы данных Replicated. Учтите, что это может надолго заблокировать очередь DDL.

## database_replicated_allow_only_replicated_engine \{#database_replicated_allow_only_replicated_engine\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает создавать в базе данных с движком Replicated только таблицы семейства Replicated

## database_replicated_allow_replicated_engine_arguments \{#database_replicated_allow_replicated_engine_arguments\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "По умолчанию явные аргументы не разрешены"}]}]}/>

0 - Не разрешать явное указание пути в ZooKeeper и имени реплики для таблиц *MergeTree в базах данных Replicated. 1 - Разрешать. 2 - Разрешать, но игнорировать указанный путь и использовать вместо него путь по умолчанию. 3 - Разрешать и не выводить предупреждение в лог.

## database_replicated_always_detach_permanently \{#database_replicated_always_detach_permanently\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Выполняет команду DETACH TABLE как DETACH TABLE PERMANENTLY, если используется движок базы данных Replicated

## database_replicated_enforce_synchronous_settings \{#database_replicated_enforce_synchronous_settings\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Обеспечивает принудительное синхронное ожидание выполнения некоторых запросов (см. также database_atomic_wait_for_drop_and_detach_synchronously, mutations_sync, alter_sync). Не рекомендуется включать эти настройки.

## database_replicated_initial_query_timeout_sec \{#database_replicated_initial_query_timeout_sec\} 

<SettingsInfoBlock type="UInt64" default_value="300" />

Устанавливает время (в секундах), в течение которого первоначальный DDL‑запрос ожидает, пока реплицируемая база данных обработает предыдущие записи в очереди DDL.

Возможные значения:

- Положительное целое число.
- 0 — без ограничения.

## database_shared_drop_table_delay_seconds \{#database_shared_drop_table_delay_seconds\} 

<SettingsInfoBlock type="UInt64" default_value="28800" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "28800"},{"label": "New setting."}]}]}/>

Задержка в секундах перед тем, как таблица, помеченная на удаление, будет фактически удалена из базы данных Shared. В течение этого времени таблицу можно восстановить с помощью оператора `UNDROP TABLE`.

## decimal_check_overflow \{#decimal_check_overflow\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Проверять переполнение при выполнении десятичных арифметических и сравнительных операций

## deduplicate_blocks_in_dependent_materialized_views \{#deduplicate_blocks_in_dependent_materialized_views\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает проверку на дублирование для материализованных представлений, которые получают данные из таблиц Replicated\*.

Возможные значения:

0 — Отключено.
      1 — Включено.

Когда параметр включен, ClickHouse удаляет дубликаты блоков в материализованных представлениях, зависящих от таблиц Replicated\*.
Этот параметр полезен для обеспечения того, чтобы материализованные представления не содержали дублирующихся данных при повторной попытке вставки из-за сбоя.

**См. также**

- [Обработка NULL в операторах IN](/guides/developer/deduplicating-inserts-on-retries#insert-deduplication-with-materialized-views)

## default_materialized_view_sql_security \{#default_materialized_view_sql_security\} 

<SettingsInfoBlock type="SQLSecurityType" default_value="DEFINER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "DEFINER"},{"label": "Позволяет задать значение по умолчанию для параметра SQL SECURITY при создании материализованного представления"}]}]}/>

Позволяет задать значение по умолчанию для параметра SQL SECURITY при создании материализованного представления. [Подробнее о безопасности SQL](../../sql-reference/statements/create/view.md/#sql_security).

Значение по умолчанию — `DEFINER`.

## default_max_bytes_in_join \{#default_max_bytes_in_join\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

Максимальный размер правой таблицы, если требуется ограничение, но `max_bytes_in_join` не задан.

## default_normal_view_sql_security \{#default_normal_view_sql_security\} 

<SettingsInfoBlock type="SQLSecurityType" default_value="INVOKER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "INVOKER"},{"label": "Позволяет задать параметр `SQL SECURITY` по умолчанию при создании обычного представления"}]}]}/>

Позволяет задать параметр `SQL SECURITY` по умолчанию при создании обычного представления. [Подробнее о параметре `SQL SECURITY`](../../sql-reference/statements/create/view.md/#sql_security).

Значение по умолчанию — `INVOKER`.

## default&#95;table&#95;engine

<SettingsInfoBlock type="DefaultTableEngine" default_value="MergeTree" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "MergeTree"},{"label": "Движок таблиц по умолчанию установлен в MergeTree для повышения удобства использования"}]}]} />

Движок таблиц по умолчанию, который используется, если `ENGINE` не задан в операторе `CREATE`.

Возможные значения:

* строка с любым допустимым именем движка таблиц

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

В этом примере любая новая таблица, для которой не указан параметр `Engine`, будет использовать табличный движок `Log`:

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


## default&#95;temporary&#95;table&#95;engine

<SettingsInfoBlock type="DefaultTableEngine" default_value="Memory" />

То же, что и [default&#95;table&#95;engine](#default_table_engine), но для временных таблиц.

В этом примере любая новая временная таблица, в которой не указан `Engine`, будет использовать движок таблицы `Log`:

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


## default_view_definer \{#default_view_definer\} 

<SettingsInfoBlock type="String" default_value="CURRENT_USER" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "CURRENT_USER"},{"label": "Позволяет установить значение параметра `DEFINER` по умолчанию при создании представления"}]}]}/>

Позволяет установить значение параметра `DEFINER` по умолчанию при создании представления. [Подробнее о SQL-безопасности](../../sql-reference/statements/create/view.md/#sql_security).

Значение по умолчанию — `CURRENT_USER`.

## delta_lake_enable_engine_predicate \{#delta_lake_enable_engine_predicate\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Включает внутреннее отсечение данных в delta-kernel.

## delta_lake_enable_expression_visitor_logging \{#delta_lake_enable_expression_visitor_logging\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает логирование на уровне Test для обходчика выражений DeltaLake. Такие логи могут быть слишком подробными даже для тестового логирования.

## delta_lake_insert_max_bytes_in_data_file \{#delta_lake_insert_max_bytes_in_data_file\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "Новая настройка."}]}]}/>

Определяет ограничение по размеру в байтах для одного вставляемого файла данных в Delta Lake.

## delta_lake_insert_max_rows_in_data_file \{#delta_lake_insert_max_rows_in_data_file\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "Новая настройка."}]}]}/>

Определяет ограничение на количество строк в одном файле данных при вставке в Delta Lake.

## delta_lake_log_metadata \{#delta_lake_log_metadata\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting."}]}]}/>

Включает логирование файлов метаданных Delta Lake в системную таблицу.

## delta_lake_snapshot_version \{#delta_lake_snapshot_version\} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "-1"},{"label": "New setting"}]}]}/>

Версия снимка Delta Lake, которую следует использовать при чтении. Значение -1 означает чтение последней версии (значение 0 — допустимая версия снимка).

## delta_lake_throw_on_engine_predicate_error \{#delta_lake_throw_on_engine_predicate_error\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает выброс исключения при ошибке анализа предиката сканирования в delta-kernel.

## describe_compact_output \{#describe_compact_output\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если включено, в результате запроса DESCRIBE выводятся только имена и типы столбцов

## describe_include_subcolumns \{#describe_include_subcolumns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает вывод подстолбцов в запросах [DESCRIBE](../../sql-reference/statements/describe-table.md). Например, элементов типа [Tuple](../../sql-reference/data-types/tuple.md) или подстолбцов типов [Map](/sql-reference/data-types/map#reading-subcolumns-of-map), [Nullable](../../sql-reference/data-types/nullable.md/#finding-null) или [Array](../../sql-reference/data-types/array.md/#array-size).

Возможные значения:

- 0 — Подстолбцы не включаются в результаты запросов `DESCRIBE`.
- 1 — Подстолбцы включаются в результаты запросов `DESCRIBE`.

**Пример**

См. пример использования оператора [DESCRIBE](../../sql-reference/statements/describe-table.md).

## describe_include_virtual_columns \{#describe_include_virtual_columns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр установлен в true, виртуальные столбцы таблицы будут включены в результат запроса DESCRIBE.

## dialect \{#dialect\} 

<SettingsInfoBlock type="Dialect" default_value="clickhouse" />

Какой диалект будет использоваться для парсинга запроса

## dictionary_validate_primary_key_type \{#dictionary_validate_primary_key_type\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Проверять тип первичного ключа словарей. По умолчанию тип идентификатора (id) для простых макетов будет неявно преобразован в UInt64."}]}]}/>

Проверять тип первичного ключа словарей. По умолчанию тип идентификатора (id) для простых макетов будет неявно преобразован в UInt64.

## distinct_overflow_mode \{#distinct_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что происходит, когда объём данных превышает одно из ограничений.

Возможные значения:

- `throw`: сгенерировать исключение (значение по умолчанию).
- `break`: остановить выполнение запроса и вернуть частичный результат, как если бы
исходные данные закончились.

## distributed_aggregation_memory_efficient \{#distributed_aggregation_memory_efficient\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включён ли режим экономного использования памяти при распределённой агрегации.

## distributed_background_insert_batch \{#distributed_background_insert_batch\} 

**Псевдонимы**: `distributed_directory_monitor_batch_inserts`

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает отправку вставляемых данных пакетами.

Когда пакетная отправка включена, табличный движок [Distributed](../../engines/table-engines/special/distributed.md) пытается отправлять несколько файлов с вставленными данными за одну операцию вместо отправки каждого файла отдельно. Пакетная отправка повышает производительность кластера за счёт более эффективного использования ресурсов сервера и сети.

Возможные значения:

- 1 — Включено.
- 0 — Отключено.

## distributed_background_insert_max_sleep_time_ms \{#distributed_background_insert_max_sleep_time_ms\} 

**Псевдонимы**: `distributed_directory_monitor_max_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="30000" />

Максимальный интервал между отправками данных движком таблицы [Distributed](../../engines/table-engines/special/distributed.md). Ограничивает экспоненциальный рост интервала, заданного настройкой [distributed_background_insert_sleep_time_ms](#distributed_background_insert_sleep_time_ms).

Возможные значения:

- Положительное целое число миллисекунд.

## distributed_background_insert_sleep_time_ms \{#distributed_background_insert_sleep_time_ms\} 

**Синонимы**: `distributed_directory_monitor_sleep_time_ms`

<SettingsInfoBlock type="Milliseconds" default_value="100" />

Базовый интервал, используемый движком таблицы [Distributed](../../engines/table-engines/special/distributed.md) для отправки данных. При возникновении ошибок фактический интервал увеличивается экспоненциально.

Возможные значения:

- Положительное целое число миллисекунд.

## distributed_background_insert_split_batch_on_failure \{#distributed_background_insert_split_batch_on_failure\} 

**Псевдонимы**: `distributed_directory_monitor_split_batch_on_failure`

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает разбиение пакетов при ошибках.

Иногда отправка конкретного пакета на удалённый шард может завершиться неудачно из‑за сложного конвейера обработки (например, `MATERIALIZED VIEW` с `GROUP BY`) по причине ошибки `Memory limit exceeded` или аналогичных. В таком случае повторная попытка не поможет (и это «застопорит» фоновые распределённые вставки для таблицы), но отправка файлов из этого пакета по одному может завершиться успешной вставкой (INSERT).

Поэтому установка этого параметра в `1` отключит формирование пакетов для таких пакетов (то есть временно отключит `distributed_background_insert_batch` для проблемных пакетов).

Возможные значения:

- 1 — Включено.
- 0 — Выключено.

:::note
Этот параметр также влияет на повреждённые пакеты (которые могут появиться из‑за ненормального завершения работы сервера (машины) и отсутствия `fsync_after_insert`/`fsync_directories` для движка таблиц [Distributed](../../engines/table-engines/special/distributed.md)).
:::

:::note
Не следует полагаться на автоматическое разбиение пакетов, поскольку это может ухудшить производительность.
:::

## distributed_background_insert_timeout \{#distributed_background_insert_timeout\} 

**Синонимы**: `insert_distributed_timeout`

<SettingsInfoBlock type="UInt64" default_value="0" />

Таймаут для запроса `INSERT` в распределённую таблицу. Настройка используется только при включённой `insert_distributed_sync`. Нулевое значение означает, что таймаут отсутствует.

## distributed_cache_alignment \{#distributed_cache_alignment\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "Переименование параметра distributed_cache_read_alignment"}]}]}/>

Действует только в ClickHouse Cloud. Этот параметр используется только для тестирования, не изменяйте его.

## distributed_cache_bypass_connection_pool \{#distributed_cache_bypass_connection_pool\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Позволяет обходить пул соединений распределённого кэша.

## distributed_cache_connect_backoff_max_ms \{#distributed_cache_connect_backoff_max_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "50"},{"label": "New setting"}]}]}/>

Применяется только в ClickHouse Cloud. Максимальная задержка (в миллисекундах) перед повторной попыткой установления подключения к распределённому кэшу.

## distributed_cache_connect_backoff_min_ms \{#distributed_cache_connect_backoff_min_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Действует только в ClickHouse Cloud. Минимальное время задержки в миллисекундах при создании соединения с распределённым кэшем.

## distributed_cache_connect_max_tries \{#distributed_cache_connect_max_tries\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "5"},{"label": "Изменено значение настройки"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "20"},{"label": "Только для ClickHouse Cloud"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "20"},{"label": "Настройка для ClickHouse Cloud"}]}]}/>

Работает только в ClickHouse Cloud. Количество попыток подключения к распределённому кэшу, если подключение не удалось.

## distributed_cache_connect_timeout_ms \{#distributed_cache_connect_timeout_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "50"},{"label": "New setting"}]}]}/>

Применяется только в ClickHouse Cloud. Таймаут при установлении соединения с сервером распределённого кэша.

## distributed_cache_credentials_refresh_period_seconds \{#distributed_cache_credentials_refresh_period_seconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "5"},{"label": "New private setting"}]}]}/>

Работает только в ClickHouse Cloud. Интервал обновления учетных данных.

## distributed_cache_data_packet_ack_window \{#distributed_cache_data_packet_ack_window\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "5"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Применяется только в ClickHouse Cloud. Окно для отправки ACK для последовательности DataPacket в рамках одного запроса на чтение из распределённого кэша

## distributed_cache_discard_connection_if_unread_data \{#distributed_cache_discard_connection_if_unread_data\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Разрывает соединение, если остались непрочитанные данные.

## distributed_cache_fetch_metrics_only_from_current_az \{#distributed_cache_fetch_metrics_only_from_current_az\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "Настройка для ClickHouse Cloud"}]}]}/>

Оказывает действие только в ClickHouse Cloud. Получает метрики только из текущей зоны доступности в system.distributed_cache_metrics и system.distributed_cache_events.

## distributed_cache_log_mode \{#distributed_cache_log_mode\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCacheLogMode" default_value="on_error" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "on_error"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Режим записи в system.distributed_cache_log

## distributed_cache_max_unacked_inflight_packets \{#distributed_cache_max_unacked_inflight_packets\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Максимальное количество неподтверждённых пакетов, находящихся в обработке, в одном запросе на чтение из распределённого кэша.

## distributed_cache_min_bytes_for_seek \{#distributed_cache_min_bytes_for_seek\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая приватная настройка."}]}]}/>

Применяется только в ClickHouse Cloud. Минимальное количество байт для выполнения операции seek в распределённом кэше.

## distributed_cache_pool_behaviour_on_limit \{#distributed_cache_pool_behaviour_on_limit\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="DistributedCachePoolBehaviourOnLimit" default_value="wait" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "wait"},{"label": "Только в облаке"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "allocate_bypassing_pool"},{"label": "Настройка для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Определяет поведение подключения к распределённому кэшу при достижении лимита пула.

## distributed_cache_prefer_bigger_buffer_size \{#distributed_cache_prefer_bigger_buffer_size\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Действует только в ClickHouse Cloud. Аналогична параметру filesystem_cache_prefer_bigger_buffer_size, но для распределённого кэша.

## distributed_cache_read_only_from_current_az \{#distributed_cache_read_only_from_current_az\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Разрешает чтение только из текущей зоны доступности. Если параметр отключён, чтение будет выполняться со всех серверов кэша во всех зонах доступности.

## distributed_cache_read_request_max_tries \{#distributed_cache_read_request_max_tries\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "10"},{"label": "Changed setting value"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "20"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Количество попыток выполнения запроса к распределённому кэшу в случае неудачи.

## distributed_cache_receive_response_wait_milliseconds \{#distributed_cache_receive_response_wait_milliseconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="60000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "60000"},{"label": "Настройка для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Время ожидания в миллисекундах для получения данных по запросу из распределённого кэша.

## distributed_cache_receive_timeout_milliseconds \{#distributed_cache_receive_timeout_milliseconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "10000"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Время ожидания в миллисекундах для получения любого ответа от распределённого кэша.

## distributed_cache_receive_timeout_ms \{#distributed_cache_receive_timeout_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "Новая настройка"}]}]}/>

Применяется только в ClickHouse Cloud. Таймаут ожидания данных от сервера распределённого кэша, в миллисекундах. Если в течение этого интервала не был получен ни один байт, будет выброшено исключение.

## distributed_cache_send_timeout_ms \{#distributed_cache_send_timeout_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="3000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3000"},{"label": "New setting"}]}]}/>

Применяется только в ClickHouse Cloud. Таймаут отправки данных на сервер распределённого кэша, в миллисекундах. Если клиенту нужно отправить данные, но он не может передать ни одного байта в течение этого интервала, генерируется исключение.

## distributed_cache_tcp_keep_alive_timeout_ms \{#distributed_cache_tcp_keep_alive_timeout_ms\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="2900" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "2900"},{"label": "New setting"}]}]}/>

Применяется только в ClickHouse Cloud. Время в миллисекундах, в течение которого соединение с сервером распределённого кэша должно оставаться неактивным, прежде чем TCP начнёт отправлять keepalive‑пакеты.

## distributed_cache_throw_on_error \{#distributed_cache_throw_on_error\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Работает только в ClickHouse Cloud. Повторно выбрасывает исключение, возникшее во время взаимодействия с распределённым кэшем, или исключение, полученное от распределённого кэша. В противном случае используется резервное поведение: при ошибке распределённый кэш пропускается.

## distributed_cache_wait_connection_from_pool_milliseconds \{#distributed_cache_wait_connection_from_pool_milliseconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "100"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Время ожидания в миллисекундах получения соединения из пула соединений, если distributed_cache_pool_behaviour_on_limit установлено в значение `wait`.

## distributed_connections_pool_size \{#distributed_connections_pool_size\} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

Максимальное количество одновременных соединений с удалёнными серверами для распределённой обработки всех запросов к одной таблице движка `Distributed`. Рекомендуется устанавливать значение не меньше количества серверов в кластере.

## distributed_ddl_entry_format_version \{#distributed_ddl_entry_format_version\} 

<SettingsInfoBlock type="UInt64" default_value="5" />

Версия совместимости распределённых DDL-запросов (ON CLUSTER)

## distributed_ddl_output_mode \{#distributed_ddl_output_mode\} 

<SettingsInfoBlock type="DistributedDDLOutputMode" default_value="throw" />

Задаёт формат результата распределённого DDL‑запроса.

Возможные значения:

- `throw` — Возвращает результирующий набор со статусом выполнения запроса для всех хостов, на которых запрос завершён. Если запрос завершился с ошибкой на некоторых хостах, повторно выбрасывается первое исключение. Если запрос ещё не завершён на некоторых хостах и превышен [distributed_ddl_task_timeout](#distributed_ddl_task_timeout), выбрасывается исключение `TIMEOUT_EXCEEDED`.
- `none` — Аналогично `throw`, но распределённый DDL‑запрос не возвращает результирующий набор.
- `null_status_on_timeout` — Возвращает `NULL` в качестве статуса выполнения в некоторых строках результирующего набора вместо выброса `TIMEOUT_EXCEEDED`, если запрос не завершён на соответствующих хостах.
- `never_throw` — Не выбрасывает `TIMEOUT_EXCEEDED` и не повторно выбрасывает исключения, даже если запрос завершился с ошибкой на некоторых хостах.
- `none_only_active` — Аналогично `none`, но не ждёт неактивные реплики базы данных `Replicated`. Примечание: в этом режиме невозможно определить, что запрос не был выполнен на какой‑то реплике и будет выполнен в фоновом режиме.
- `null_status_on_timeout_only_active` — Аналогично `null_status_on_timeout`, но не ждёт неактивные реплики базы данных `Replicated`.
- `throw_only_active` — Аналогично `throw`, но не ждёт неактивные реплики базы данных `Replicated`.

Значение по умолчанию в облаке: `throw`.

## distributed_ddl_task_timeout \{#distributed_ddl_task_timeout\} 

<SettingsInfoBlock type="Int64" default_value="180" />

Устанавливает тайм-аут ожидания ответов на DDL-запросы от всех узлов в кластере. Если DDL-запрос не был выполнен на всех узлах, ответ будет содержать ошибку тайм-аута, а запрос будет выполнен в асинхронном режиме. Отрицательное значение означает бесконечный тайм-аут.

Возможные значения:

- Положительное целое число.
- 0 — асинхронный режим.
- Отрицательное целое число — бесконечный тайм-аут.

## distributed_foreground_insert \{#distributed_foreground_insert\} 

**Синонимы**: `insert_distributed_sync`

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает синхронную вставку данных в таблицу [Distributed](/engines/table-engines/special/distributed).

По умолчанию при вставке данных в таблицу `Distributed` сервер ClickHouse отправляет данные на узлы кластера в фоновом режиме. Когда `distributed_foreground_insert=1`, данные обрабатываются синхронно, и операция `INSERT` считается успешной только после того, как все данные будут сохранены на всех шардах (как минимум одна реплика для каждого шарда, если `internal_replication` равно true).

Возможные значения:

- `0` — данные вставляются в фоновом режиме.
- `1` — данные вставляются синхронно.

Значение по умолчанию в Cloud: `0`.

**См. также**

- [Движок таблиц Distributed](/engines/table-engines/special/distributed)
- [Управление распределёнными таблицами](/sql-reference/statements/system#managing-distributed-tables)

## distributed&#95;group&#95;by&#95;no&#95;merge

<SettingsInfoBlock type="UInt64" default_value="0" />

Не объединять состояния агрегации с разных серверов при распределённой обработке запроса. Можно использовать в случае, когда точно известно, что на разных шардах находятся разные ключи.

Возможные значения:

* `0` — Отключено (финальная обработка запроса выполняется на инициирующем узле).
* `1` — Не объединять состояния агрегации с разных серверов при распределённой обработке запроса (запрос полностью обрабатывается на шарде, инициатор только проксирует данные). Может использоваться в случае, когда точно известно, что на разных шардах находятся разные ключи.
* `2` — То же, что и `1`, но инициатор применяет `ORDER BY` и `LIMIT` (это невозможно, когда запрос полностью обрабатывается на удалённом узле, как при `distributed_group_by_no_merge=1`) и может использоваться для запросов с `ORDER BY` и/или `LIMIT`.

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


## distributed_insert_skip_read_only_replicas \{#distributed_insert_skip_read_only_replicas\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "If true, INSERT into Distributed will skip read-only replicas"}]}]}/>

Включает пропуск реплик в режиме только для чтения для запросов INSERT в таблицы типа Distributed.

Возможные значения:

- 0 — INSERT выполняется как обычно; если он попадёт на реплику в режиме только для чтения, запрос завершится с ошибкой.
- 1 — Инициатор пропускает реплики в режиме только для чтения перед отправкой данных на шарды.

## distributed_plan_default_reader_bucket_count \{#distributed_plan_default_reader_bucket_count\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "New experimental setting."}]}]}/>

Количество задач для параллельного чтения в распределённом запросе по умолчанию. Задачи распределяются между репликами.

## distributed_plan_default_shuffle_join_bucket_count \{#distributed_plan_default_shuffle_join_bucket_count\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "8"},{"label": "Новая экспериментальная настройка."}]}]}/>

Количество бакетов по умолчанию для распределённого shuffle-hash-join.

## distributed_plan_execute_locally \{#distributed_plan_execute_locally\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "New experimental setting."}]}]}/>

Выполняет все задачи распределённого плана запроса локально. Удобно для тестирования и отладки.

## distributed_plan_force_exchange_kind \{#distributed_plan_force_exchange_kind\} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "New experimental setting."}]}]}/>

Принудительно задаёт указанный тип операторов Exchange между стадиями распределённого запроса.

Возможные значения:

- '' — не фиксировать тип операторов Exchange, предоставить выбор оптимизатору,
 - 'Persisted' — использовать временные файлы в объектном хранилище,
 - 'Streaming' — передавать данные обмена по сети в потоковом режиме.

## distributed_plan_force_shuffle_aggregation \{#distributed_plan_force_shuffle_aggregation\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

Использовать стратегию агрегации Shuffle вместо PartialAggregation + Merge в распределённом плане выполнения запроса.

## distributed_plan_max_rows_to_broadcast \{#distributed_plan_max_rows_to_broadcast\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="20000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "20000"},{"label": "Новый экспериментальный параметр."}]}]}/>

Максимальное число строк, при котором в распределённом плане запроса используется широковещательное соединение вместо shuffle-соединения.

## distributed_plan_optimize_exchanges \{#distributed_plan_optimize_exchanges\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Новая экспериментальная настройка."}]}]}/>

Удаляет ненужные операции обмена данными в распределённом плане запроса. Отключите её для отладки.

## distributed_product_mode \{#distributed_product_mode\} 

<SettingsInfoBlock type="DistributedProductMode" default_value="deny" />

Изменяет поведение [распределённых подзапросов](../../sql-reference/operators/in.md).

ClickHouse применяет этот параметр, когда запрос содержит декартово произведение распределённых таблиц, то есть когда запрос к распределённой таблице содержит не-GLOBAL подзапрос к распределённой таблице.

Ограничения:

- Применяется только к подзапросам IN и JOIN.
- Применяется только если в операторе FROM используется распределённая таблица, содержащая более одного шарда.
- Применяется только если подзапрос относится к распределённой таблице, содержащей более одного шарда.
- Не используется для табличной функции [remote](../../sql-reference/table-functions/remote.md).

Возможные значения:

- `deny` — значение по умолчанию. Запрещает использование таких типов подзапросов (генерирует исключение «Double-distributed IN/JOIN subqueries is denied»).
- `local` — заменяет базу данных и таблицу в подзапросе на локальные для целевого сервера (шарда), при этом оставляет обычные `IN`/`JOIN`.
- `global` — заменяет запрос `IN`/`JOIN` на `GLOBAL IN`/`GLOBAL JOIN`.
- `allow` — разрешает использование таких типов подзапросов.

## distributed_push_down_limit \{#distributed_push_down_limit\} 

<SettingsInfoBlock type="UInt64" default_value="1" />

Включает или отключает применение [LIMIT](#limit) отдельно на каждом шарде.

Это позволяет избежать:

- отправки лишних строк по сети;
- обработки строк за пределами лимита на инициирующем сервере.

Начиная с версии 21.9 вы больше не можете получить неточные результаты, поскольку `distributed_push_down_limit` изменяет выполнение запроса только если выполняется хотя бы одно из условий:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge) > 0.
- В запросе **нет** `GROUP BY`/`DISTINCT`/`LIMIT BY`, но есть `ORDER BY`/`LIMIT`.
- В запросе **есть** `GROUP BY`/`DISTINCT`/`LIMIT BY` с `ORDER BY`/`LIMIT`, и при этом:
    - [optimize_skip_unused_shards](#optimize_skip_unused_shards) включён.
    - [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key) включён.

Возможные значения:

- 0 — отключено.
- 1 — включено.

См. также:

- [distributed_group_by_no_merge](#distributed_group_by_no_merge)
- [optimize_skip_unused_shards](#optimize_skip_unused_shards)
- [optimize_distributed_group_by_sharding_key](#optimize_distributed_group_by_sharding_key)

## distributed_replica_error_cap \{#distributed_replica_error_cap\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

- Тип: UInt64
- Значение по умолчанию: 1000

Счётчик ошибок для каждой реплики ограничен этим значением, что предотвращает накопление одной репликой слишком большого количества ошибок.

См. также:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_error_half_life \{#distributed_replica_error_half_life\} 

<SettingsInfoBlock type="Seconds" default_value="60" />

- Тип: секунды
- Значение по умолчанию: 60 секунд

Определяет, как быстро общее число ошибок в распределённых таблицах снижается до нуля. Если реплика некоторое время недоступна, накапливает 5 ошибок, и `distributed_replica_error_half_life` установлен в 1 секунду, то такая реплика будет считаться нормальной через 3 секунды после последней ошибки.

См. также:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_max_ignored_errors](#distributed_replica_max_ignored_errors)

## distributed_replica_max_ignored_errors \{#distributed_replica_max_ignored_errors\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

- Тип: беззнаковое целое число (unsigned int)
- Значение по умолчанию: 0

Количество ошибок, которые будут игнорироваться при выборе реплик (в соответствии с алгоритмом `load_balancing`).

См. также:

- [load_balancing](#load_balancing-round_robin)
- [Table engine Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap](#distributed_replica_error_cap)
- [distributed_replica_error_half_life](#distributed_replica_error_half_life)

## do_not_merge_across_partitions_select_final \{#do_not_merge_across_partitions_select_final\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Объединять парты только в пределах одного раздела в запросах `SELECT FINAL`

## empty_result_for_aggregation_by_constant_keys_on_empty_set \{#empty_result_for_aggregation_by_constant_keys_on_empty_set\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Возвращает пустой результат при агрегации по константным ключам для пустого набора данных.

## empty_result_for_aggregation_by_empty_set \{#empty_result_for_aggregation_by_empty_set\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Возвращать пустой результат при агрегации без ключей над пустым набором.

## enable_adaptive_memory_spill_scheduler \{#enable_adaptive_memory_spill_scheduler\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Новая настройка. Включает адаптивный сброс данных из памяти во внешнее хранилище."}]}]}/>

Запускает обработчик, который адаптивно сбрасывает данные из памяти во внешнее хранилище. В настоящее время поддерживается grace join.

## enable_add_distinct_to_in_subqueries \{#enable_add_distinct_to_in_subqueries\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка для уменьшения размера временных таблиц, передаваемых для распределённых подзапросов с IN."}]}]}/>

Включает `DISTINCT` в подзапросах `IN`. Это компромиссная настройка: её включение может значительно уменьшить размер временных таблиц, передаваемых для распределённых подзапросов с IN, и существенно ускорить передачу данных между шардами за счёт отправки только уникальных значений.
Однако включение этой настройки приводит к дополнительным затратам на объединение данных на каждом узле, так как требуется выполнять дедупликацию (DISTINCT). Используйте эту настройку, когда узким местом является передача по сети и дополнительные затраты на объединение приемлемы.

## enable_blob_storage_log \{#enable_blob_storage_log\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Записывать информацию об операциях с blob-хранилищем в таблицу system.blob_storage_log"}]}]}/>

Записывать информацию об операциях с blob-хранилищем в таблицу system.blob_storage_log

## enable_deflate_qpl_codec \{#enable_deflate_qpl_codec\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, кодек DEFLATE_QPL может использоваться для сжатия столбцов.

## enable_early_constant_folding \{#enable_early_constant_folding\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию запросов, при которой анализируются результаты функций и подзапросов, а запрос переписывается, если в них присутствуют константы

## enable_extended_results_for_datetime_functions \{#enable_extended_results_for_datetime_functions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает возврат результатов типа `Date32` с расширенным диапазоном значений (по сравнению с типом `Date`)
или `DateTime64` с расширенным диапазоном значений (по сравнению с типом `DateTime`).

Возможные значения:

- `0` — функции возвращают `Date` или `DateTime` для всех типов аргументов.
- `1` — функции возвращают `Date32` или `DateTime64` для аргументов типа `Date32` или `DateTime64`, а в остальных случаях — `Date` или `DateTime`.

В таблице ниже показано поведение этой настройки для различных функций работы с датой и временем.

| Функция                   | `enable_extended_results_for_datetime_functions = 0`                                                                              | `enable_extended_results_for_datetime_functions = 1`                                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toStartOfYear`           | Возвращает `Date` или `DateTime`                                                                                                  | Возвращает `Date`/`DateTime` для аргумента типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для аргумента типа `Date32`/`DateTime64`         |
| `toStartOfISOYear`        | Возвращает значение типа `Date` или `DateTime`                                                                                    | Возвращает `Date`/`DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для аргументов типа `Date32`/`DateTime64`       |
| `toStartOfQuarter`        | Возвращает `Date` или `DateTime`                                                                                                  | Возвращает `Date`/`DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для аргументов типа `Date32`/`DateTime64`       |
| `toStartOfMonth`          | Возвращает `Date` или `DateTime`                                                                                                  | Возвращает `Date`/`DateTime` для аргумента типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для аргумента типа `Date32`/`DateTime64`         |
| `toStartOfWeek`           | Возвращает `Date` или `DateTime`.                                                                                                 | Возвращает `Date`/`DateTime` для входных значений `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для входных значений `Date32`/`DateTime64`     |
| `toLastDayOfWeek`         | Возвращает `Date` или `DateTime`                                                                                                  | Возвращает `Date`/`DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для аргументов типа `Date32`/`DateTime64`       |
| `toLastDayOfMonth`        | Возвращает значение типа `Date` или `DateTime`                                                                                    | Возвращает `Date`/`DateTime` для аргумента типа `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для аргумента типа `Date32`/`DateTime64`         |
| `toMonday`                | Возвращает значение типа `Date` или `DateTime`                                                                                    | Возвращает `Date`/`DateTime` для входных аргументов `Date`/`DateTime`<br />Возвращает `Date32`/`DateTime64` для входных аргументов `Date32`/`DateTime64` |
| `toStartOfDay`            | Возвращает `DateTime`<br />*Примечание: возможны некорректные результаты для значений вне диапазона 1970–2149*                    | Возвращает `DateTime` для аргумента типа `Date`/`DateTime`<br />Возвращает `DateTime64` для аргумента типа `Date32`/`DateTime64`                         |
| `toStartOfHour`           | Возвращает `DateTime`<br />*Примечание: может возвращать некорректные результаты для значений вне диапазона 1970–2149 годов*      | Возвращает `DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `DateTime64` для аргументов типа `Date32`/`DateTime64`                       |
| `toStartOfFifteenMinutes` | Возвращает `DateTime`<br />*Примечание: возможны некорректные результаты для значений вне диапазона 1970–2149*                    | Возвращает `DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `DateTime64` для аргументов типа `Date32`/`DateTime64`                       |
| `toStartOfTenMinutes`     | Возвращает значение типа `DateTime`<br />*Примечание: результаты могут быть неверными для значений вне диапазона 1970–2149 годов* | Возвращает `DateTime` для аргументов типов `Date`/`DateTime`<br />Возвращает `DateTime64` для аргументов типов `Date32`/`DateTime64`                     |
| `toStartOfFiveMinutes`    | Возвращает `DateTime`<br />*Примечание: Некорректные результаты для значений за пределами диапазона 1970–2149 годов*              | Возвращает `DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `DateTime64` для аргументов типа `Date32`/`DateTime64`                       |
| `toStartOfMinute`         | Возвращает `DateTime`<br />*Примечание: возможны некорректные результаты для значений вне диапазона 1970–2149*                    | Возвращает `DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `DateTime64` для аргументов типа `Date32`/`DateTime64`                       |
| `timeSlot`                | Возвращает `DateTime`<br />*Примечание: может возвращать неверные результаты для значений вне диапазона 1970–2149*                | Возвращает `DateTime` для аргументов типа `Date`/`DateTime`<br />Возвращает `DateTime64` для аргументов типа `Date32`/`DateTime64`                       |

## enable_filesystem_cache \{#enable_filesystem_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш для удалённой файловой системы. Этот параметр не включает и не отключает кэш для дисков (это нужно делать через конфигурацию диска), но позволяет при необходимости не использовать кэш для некоторых запросов.

## enable_filesystem_cache_log \{#enable_filesystem_cache_log\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает ведение журнала кэширования файловой системы для каждого запроса

## enable_filesystem_cache_on_write_operations \{#enable_filesystem_cache_on_write_operations\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает кэш `write-through`. Если установлено значение `false`, кэш `write-through` для операций записи отключён. Если установлено значение `true`, кэш `write-through` включён до тех пор, пока параметр `cache_on_write_operations` включён в разделе настройки диска кэша в конфигурации сервера.
См. раздел ["Использование локального кэша"](/operations/storing-data#using-local-cache) для более подробной информации.

## enable_filesystem_read_prefetches_log \{#enable_filesystem_read_prefetches_log\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Записывать данные в таблицу system.filesystem_prefetch_log во время выполнения запроса. Следует использовать только для тестирования или отладки, не рекомендуется включать по умолчанию.

## enable_global_with_statement \{#enable_global_with_statement\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.2"},{"label": "1"},{"label": "Распространять выражения WITH в запросы UNION и во все подзапросы по умолчанию"}]}]}/>

Распространять выражения WITH в запросы UNION и во все подзапросы

## enable_hdfs_pread \{#enable_hdfs_pread\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Новый параметр."}]}]}/>

Включает или отключает `pread` для файлов HDFS. По умолчанию используется `hdfsPread`. Если параметр отключён, для чтения файлов HDFS будут использоваться `hdfsRead` и `hdfsSeek`.

## enable_http_compression \{#enable_http_compression\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "Обычно это полезно"}]}]}/>

Включает или отключает сжатие данных в ответе на HTTP-запрос.

Для получения дополнительной информации см. [описание HTTP-интерфейса](../../interfaces/http.md).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## enable_job_stack_trace \{#enable_job_stack_trace\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Настройка по умолчанию отключена, чтобы избежать потерь производительности."}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "0"},{"label": "Включает сбор трассировок стека при планировании заданий. По умолчанию отключено, чтобы избежать потерь производительности."}]}]}/>

Выводит трассировку стека потока, создавшего задание, если задание приводит к исключению. По умолчанию отключено, чтобы избежать потерь производительности.

## enable_join_runtime_filters \{#enable_join_runtime_filters\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

Фильтрует левую сторону по набору ключей JOIN, собранных с правой стороны во время выполнения запроса.

## enable_lazy_columns_replication \{#enable_lazy_columns_replication\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Ленивая репликация столбцов в JOIN и ARRAY JOIN включена по умолчанию"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Добавлена настройка для включения ленивой репликации столбцов в JOIN и ARRAY JOIN"}]}]}/>

Включает ленивую репликацию столбцов в JOIN и ARRAY JOIN, что позволяет избежать многократного ненужного копирования одинаковых строк в памяти.

## enable_lightweight_delete \{#enable_lightweight_delete\} 

**Псевдонимы**: `allow_experimental_lightweight_delete`

<SettingsInfoBlock type="Bool" default_value="1" />

Включает легковесные мутации DELETE для таблиц MergeTree.

## enable_lightweight_update \{#enable_lightweight_update\} 

<BetaBadge/>

**Псевдонимы**: `allow_experimental_lightweight_update`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Облегчённые обновления переведены в статус Beta. Добавлен псевдоним для настройки 'allow_experimental_lightweight_update'."}]}]}/>

Разрешает использование облегчённых обновлений.

## enable_memory_bound_merging_of_aggregation_results \{#enable_memory_bound_merging_of_aggregation_results\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает стратегию слияния результатов агрегации с ограничением по памяти.

## enable_multiple_prewhere_read_steps \{#enable_multiple_prewhere_read_steps\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Перемещает больше условий из WHERE в PREWHERE и выполняет чтение с диска и фильтрацию в несколько этапов, если имеется несколько условий, объединённых оператором AND

## enable_named_columns_in_function_tuple \{#enable_named_columns_in_function_tuple\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Генерирует именованные кортежи в функции tuple(), если все имена уникальны и могут рассматриваться как некавыченные идентификаторы."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "Отключено до улучшения удобства использования"}]}]}/>

Генерирует именованные кортежи в функции `tuple()`, если все имена уникальны и могут рассматриваться как некавыченные идентификаторы.

## enable_optimize_predicate_expression \{#enable_optimize_predicate_expression\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "18.12.17"},{"label": "1"},{"label": "Optimize predicates to subqueries by default"}]}]}/>

Включает проталкивание предикатов (predicate pushdown) в запросах `SELECT`.

Проталкивание предикатов может значительно сократить сетевой трафик для распределённых запросов.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

Использование

Рассмотрим следующие запросы:

1.  `SELECT count() FROM test_table WHERE date = '2018-10-10'`
2.  `SELECT count() FROM (SELECT * FROM test_table) WHERE date = '2018-10-10'`

Если `enable_optimize_predicate_expression = 1`, то время выполнения этих запросов одинаково, потому что ClickHouse применяет `WHERE` к подзапросу при его обработке.

Если `enable_optimize_predicate_expression = 0`, то время выполнения второго запроса существенно больше, потому что предложение `WHERE` применяется ко всем данным только после завершения подзапроса.

## enable_optimize_predicate_expression_to_final_subquery \{#enable_optimize_predicate_expression_to_final_subquery\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает проталкивать предикат в подзапрос с FINAL.

## enable&#95;order&#95;by&#95;all

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает сортировку с использованием синтаксиса `ORDER BY ALL`, см. [ORDER BY](../../sql-reference/statements/select/order-by.md).

Возможные значения:

* 0 — отключает ORDER BY ALL.
* 1 — включает ORDER BY ALL.

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


## enable_parallel_blocks_marshalling \{#enable_parallel_blocks_marshalling\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "true"},{"label": "A new setting"}]}]}/>

Влияет только на распределённые запросы. Если настройка включена, блоки будут (де)сериализовываться и (де)сжиматься в потоках конвейера (то есть с большей степенью параллелизма, чем по умолчанию) до/после отправки инициатору запроса.

## enable_parsing_to_custom_serialization \{#enable_parsing_to_custom_serialization\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1"},{"label": "New setting"}]}]}/>

Если имеет значение `true`, данные могут парситься напрямую в столбцы с пользовательской сериализацией (например, Sparse) в соответствии с подсказками по сериализации, полученными из таблицы.

## enable&#95;positional&#95;arguments

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.7"},{"label": "1"},{"label": "Функция позиционных аргументов по умолчанию включена"}]}]} />

Включает или отключает поддержку позиционных аргументов для операторов [GROUP BY](/sql-reference/statements/select/group-by), [LIMIT BY](../../sql-reference/statements/select/limit-by.md), [ORDER BY](../../sql-reference/statements/select/order-by.md).

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


## enable_producing_buckets_out_of_order_in_aggregation \{#enable_producing_buckets_out_of_order_in_aggregation\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}]}/>

Разрешает памяти-эффективной агрегации (см. `distributed_aggregation_memory_efficient`) выдавать бакеты в неупорядоченном виде.
Это может улучшить производительность, когда размеры бакетов агрегации существенно различаются, позволяя реплике отправлять бакеты с более высокими идентификаторами инициатору, пока он всё ещё обрабатывает «тяжёлые» бакеты с более низкими идентификаторами.
Недостатком является потенциально более высокий расход памяти.

## enable_reads_from_query_cache \{#enable_reads_from_query_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включён, результаты запросов `SELECT` берутся из [кеша запросов](../query-cache.md).

Возможные значения:

- 0 - Отключено
- 1 - Включено

## enable_s3_requests_logging \{#enable_s3_requests_logging\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает максимально подробное логирование запросов к S3. Имеет смысл только для отладки.

## enable_scalar_subquery_optimization \{#enable_scalar_subquery_optimization\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.18"},{"label": "1"},{"label": "Предотвращает (де)сериализацию больших скалярных значений в скалярных подзапросах и, возможно, позволяет избежать повторного выполнения одного и того же подзапроса"}]}]}/>

Если параметр установлен в `true`, предотвращает (де)сериализацию больших скалярных значений в скалярных подзапросах и, возможно, позволяет избежать повторного выполнения одного и того же подзапроса.

## enable_scopes_for_with_statement \{#enable_scopes_for_with_statement\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "1"},{"label": "Новая настройка для обратной совместимости со старым анализатором."}]}, {"id": "row-2","items": [{"label": "25.6"},{"label": "1"},{"label": "Новая настройка для обратной совместимости со старым анализатором."}]}, {"id": "row-3","items": [{"label": "25.5"},{"label": "1"},{"label": "Новая настройка для обратной совместимости со старым анализатором."}]}, {"id": "row-4","items": [{"label": "25.4"},{"label": "1"},{"label": "Новая настройка для обратной совместимости со старым анализатором."}]}]}/>

Если параметр отключён, объявления в родительских предложениях WITH будут вести себя так, как если бы они были сделаны в текущей области видимости.

Обратите внимание, что это настройка совместимости для нового анализатора, позволяющая выполнять некоторые некорректные запросы, которые старый анализатор обрабатывал.

## enable&#95;shared&#95;storage&#95;snapshot&#95;in&#95;query

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "A new setting to share storage snapshot in query"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "1"},{"label": "Better consistency guarantees."}]}]} />

Если настройка включена, все подзапросы в рамках одного запроса будут использовать одинаковый `StorageSnapshot` для каждой таблицы.
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
Включение этого параметра отключает оптимизацию, которая удаляет лишние части данных из снимков после завершения этапа планирования.
В результате запросы с длительным временем выполнения могут удерживать устаревшие части на протяжении всего времени работы, откладывая очистку частей и повышая нагрузку на хранилище.

На данный момент этот параметр применяется только к таблицам семейства MergeTree.
:::

Возможные значения:

* 0 - Отключено
* 1 - Включено


## enable_sharing_sets_for_mutations \{#enable_sharing_sets_for_mutations\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает повторное использование объектов set, созданных для подзапросов IN, между разными задачами одной мутации. Это снижает использование памяти и нагрузку на CPU.

## enable_software_prefetch_in_aggregation \{#enable_software_prefetch_in_aggregation\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включить использование программной предварительной выборки данных (software prefetch) при агрегации.

## enable_time_time64_type \{#enable_time_time64_type\} 

**Псевдонимы**: `allow_experimental_time_time64_type`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Новая настройка. Позволяет использовать экспериментальные типы данных Time и Time64."}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "1"},{"label": "Включает типы данных Time и Time64 по умолчанию."}]}]}/>

Позволяет создавать типы данных [Time](../../sql-reference/data-types/time.md) и [Time64](../../sql-reference/data-types/time64.md).

## enable_unaligned_array_join \{#enable_unaligned_array_join\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает выполнять ARRAY JOIN с несколькими массивами разного размера. Когда этот параметр включён, размеры массивов будут приведены к длине самого длинного.

## enable_url_encoding \{#enable_url_encoding\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Changed existing setting's default value"}]}]}/>

Позволяет включить или отключить кодирование и декодирование пути в URI в таблицах с движком [URL](../../engines/table-engines/special/url.md).

По умолчанию отключено.

## enable_vertical_final \{#enable_vertical_final\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Снова включить вертикальный FINAL по умолчанию после исправления ошибки"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "Использовать вертикальный FINAL по умолчанию"}]}]}/>

Если настройка включена, дублирующиеся строки при выполнении FINAL удаляются путём пометки строк как удалённых с последующей фильтрацией вместо их слияния.

## enable_writes_to_query_cache \{#enable_writes_to_query_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если включено, результаты запросов `SELECT` сохраняются в [кэше запросов](../query-cache.md).

Возможные значения:

- 0 — отключено
- 1 — включено

## enable_zstd_qat_codec \{#enable_zstd_qat_codec\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Добавлен новый кодек ZSTD_QAT"}]}]}/>

При включении кодек ZSTD_QAT может использоваться для сжатия столбцов.

## enforce_strict_identifier_format \{#enforce_strict_identifier_format\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "New setting."}]}]}/>

Если настройка включена, разрешены только идентификаторы, содержащие буквенно-цифровые символы и символы подчёркивания.

## engine_file_allow_create_multiple_files \{#engine_file_allow_create_multiple_files\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает создание нового файла при каждой вставке в таблицы движка `File`, если формат имеет суффикс (`JSON`, `ORC`, `Parquet` и т.д.). Если настройка включена, при каждой вставке будет создаваться новый файл с именем по следующему шаблону:

`data.Parquet` -> `data.1.Parquet` -> `data.2.Parquet` и т.д.

Возможные значения:

- 0 — запрос `INSERT` дописывает новые данные в конец файла.
- 1 — запрос `INSERT` создает новый файл.

## engine_file_empty_if_not_exists \{#engine_file_empty_if_not_exists\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет выполнять выборку данных из таблицы движка `File` при отсутствии файла.

Возможные значения:

- 0 — `SELECT` генерирует исключение.
- 1 — `SELECT` возвращает пустой результат.

## engine_file_skip_empty_files \{#engine_file_skip_empty_files\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает пропуск пустых файлов в таблицах с движком [File](../../engines/table-engines/special/file.md).

Возможные значения:

- 0 — `SELECT` выбрасывает исключение, если пустой файл не совместим с запрошенным форматом.
- 1 — `SELECT` возвращает пустой результат для пустого файла.

## engine_file_truncate_on_insert \{#engine_file_truncate_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает очистку файла перед вставкой данных в таблицы движка [File](../../engines/table-engines/special/file.md).

Возможные значения:

- 0 — запрос `INSERT` добавляет новые данные в конец файла.
- 1 — запрос `INSERT` заменяет существующее содержимое файла новыми данными.

## engine_url_skip_empty_files \{#engine_url_skip_empty_files\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает пропуск пустых файлов в таблицах движка [URL](../../engines/table-engines/special/url.md).

Возможные значения:

- 0 — `SELECT` вызывает исключение, если пустой файл не совместим с запрошенным форматом.
- 1 — `SELECT` возвращает пустой результат для пустого файла.

## except_default_mode \{#except_default_mode\} 

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

Устанавливает режим операции EXCEPT по умолчанию. Возможные значения: пустая строка, 'ALL', 'DISTINCT'. Если значение пустое, запрос без указания режима вызовет исключение.

## exclude&#95;materialize&#95;skip&#95;indexes&#95;on&#95;insert

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": ""},{"label": "Новая настройка."}]}]} />

Исключает указанные skip-индексы из построения и сохранения во время выполнения INSERT-запросов. Исключённые skip-индексы по-прежнему будут строиться и сохраняться [во время слияний](merge-tree-settings.md/#materialize_skip_indexes_on_merge) или по явному запросу
[MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index).

Не влияет, если [materialize&#95;skip&#95;indexes&#95;on&#95;insert](#materialize_skip_indexes_on_insert) имеет значение `false`.

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

-- так как это настройка сеанса, её можно задать на уровне отдельного запроса
INSERT INTO tab SELECT number, number / 50 FROM numbers(100, 100) SETTINGS exclude_materialize_skip_indexes_on_insert='idx_b';

ALTER TABLE tab MATERIALIZE INDEX idx_a; -- этот запрос можно использовать для явной материализации индекса

SET exclude_materialize_skip_indexes_on_insert = DEFAULT; -- сброс настройки на значение по умолчанию
```


## execute_exists_as_scalar_subquery \{#execute_exists_as_scalar_subquery\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "New setting"}]}]}/>

Выполнять некоррелированные подзапросы EXISTS как скалярные подзапросы. Аналогично скалярным подзапросам используется кэш, а к результату применяется свёртка констант.

## external_storage_connect_timeout_sec \{#external_storage_connect_timeout_sec\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

Таймаут подключения (в секундах). Пока поддерживается только для MySQL.

## external_storage_max_read_bytes \{#external_storage_max_read_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает максимальное число байт, которое таблица с внешним движком может прочитать при сбросе исторических данных. В настоящее время поддерживается только для табличного движка MySQL, движка баз данных и словарей. Если значение равно 0, эта настройка отключена.

## external_storage_max_read_rows \{#external_storage_max_read_rows\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает максимальное число строк при сбросе исторических данных таблицей с внешним движком. В настоящий момент поддерживается только для движка таблиц MySQL, движка базы данных и словаря. Если равно 0, эта настройка отключена.

## external_storage_rw_timeout_sec \{#external_storage_rw_timeout_sec\} 

<SettingsInfoBlock type="UInt64" default_value="300" />

Таймаут чтения/записи в секундах. Сейчас поддерживается только для MySQL.

## external_table_functions_use_nulls \{#external_table_functions_use_nulls\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет, как табличные функции [mysql](../../sql-reference/table-functions/mysql.md), [postgresql](../../sql-reference/table-functions/postgresql.md) и [odbc](../../sql-reference/table-functions/odbc.md) используют столбцы типа `Nullable`.

Возможные значения:

- 0 — Табличная функция явно использует столбцы типа `Nullable`.
- 1 — Табличная функция неявно использует столбцы типа `Nullable`.

**Использование**

Если параметр установлен в `0`, табличная функция не делает столбцы `Nullable` и вставляет значения по умолчанию вместо `NULL`. Это также относится к значениям `NULL` внутри массивов.

## external_table_strict_query \{#external_table_strict_query\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр имеет значение true, в запросах к внешним таблицам запрещается преобразовывать выражения в локальные фильтры.

## extract_key_value_pairs_max_pairs_per_row \{#extract_key_value_pairs_max_pairs_per_row\} 

**Псевдонимы**: `extract_kvp_max_pairs_per_row`

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "0"},{"label": "Максимальное количество пар, которое может быть извлечено функцией `extractKeyValuePairs`. Используется как защита от чрезмерного расхода памяти."}]}]}/>

Максимальное количество пар, которое может быть извлечено функцией `extractKeyValuePairs`. Используется как защита от чрезмерного расхода памяти.

## extremes \{#extremes\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Учитывать ли экстремальные значения (минимальные и максимальные значения в столбцах результата запроса). Принимает 0 или 1. По умолчанию — 0 (отключено).
Для получения дополнительной информации см. раздел «Экстремальные значения».

## fallback_to_stale_replicas_for_distributed_queries \{#fallback_to_stale_replicas_for_distributed_queries\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Принудительно выполняет запрос к устаревшей реплике, если обновлённые данные недоступны. См. [Репликация](../../engines/table-engines/mergetree-family/replication.md).

ClickHouse выбирает наименее устаревшую реплику таблицы.

Используется при выполнении `SELECT` из распределённой таблицы, которая указывает на реплицируемые таблицы.

По умолчанию — 1 (включено).

## filesystem_cache_allow_background_download \{#filesystem_cache_allow_background_download\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Новая настройка для управления фоновыми загрузками файлового кэша на уровне запроса."}]}]}/>

Разрешает файловому кэшу ставить в очередь фоновые загрузки данных, читаемых из удалённого хранилища. Отключите, чтобы выполнять загрузки синхронно в рамках текущего запроса/сессии.

## filesystem_cache_boundary_alignment \{#filesystem_cache_boundary_alignment\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Выравнивание границ файлового кэша. Этот параметр применяется только для операций чтения не с диска (например, для кэша удалённых движков таблиц / табличных функций, но не для конфигурации хранилища таблиц MergeTree). Значение 0 означает, что выравнивание не выполняется.

## filesystem_cache_enable_background_download_during_fetch \{#filesystem_cache_enable_background_download_during_fetch\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. Время ожидания при блокировке кэша для резервирования места в файловом кэше.

## filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage \{#filesystem_cache_enable_background_download_for_metadata_files_in_packed_storage\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Действует только в ClickHouse Cloud. Время ожидания при блокировке кэша для резервирования места в файловом кэше

## filesystem_cache_max_download_size \{#filesystem_cache_max_download_size\} 

<SettingsInfoBlock type="UInt64" default_value="137438953472" />

Максимальный размер кэша удалённой файловой системы, который может быть скачан одним запросом

## filesystem_cache_name \{#filesystem_cache_name\} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": ""},{"label": "Имя файлового кэша, используемого для табличных движков без состояния или озёр данных"}]}]}/>

Имя файлового кэша, используемого для табличных движков без состояния или озёр данных

## filesystem_cache_prefer_bigger_buffer_size \{#filesystem_cache_prefer_bigger_buffer_size\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting"}]}]}/>

При включённом файловом кеше отдавать предпочтение большему размеру буфера, чтобы избежать записи небольших сегментов файлов, ухудшающих производительность кеша. Однако включение этого параметра может привести к увеличению потребления памяти.

## filesystem_cache_reserve_space_wait_lock_timeout_milliseconds \{#filesystem_cache_reserve_space_wait_lock_timeout_milliseconds\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "Время ожидания получения блокировки кэша для резервирования пространства в файловом кэше"}]}]}/>

Время ожидания получения блокировки кэша для резервирования пространства в файловом кэше

## filesystem_cache_segments_batch_size \{#filesystem_cache_segments_batch_size\} 

<SettingsInfoBlock type="UInt64" default_value="20" />

Ограничение размера одного пакета файловых сегментов, которые буфер чтения может запросить из кэша. Слишком маленькое значение приведёт к избыточному количеству запросов к кэшу, слишком большое может замедлить вытеснение из кэша.

## filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit \{#filesystem_cache_skip_download_if_exceeds_per_query_cache_write_limit\} 

**Псевдонимы**: `skip_download_if_exceeds_query_cache`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "Переименование настройки skip_download_if_exceeds_query_cache_limit"}]}]}/>

Пропуск скачивания из удалённой файловой системы, если размер превышает размер кэша запроса

## filesystem_prefetch_max_memory_usage \{#filesystem_prefetch_max_memory_usage\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1073741824" />

Максимальный объём памяти, используемый для упреждающего чтения.

## filesystem_prefetch_step_bytes \{#filesystem_prefetch_step_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Шаг предварительной выборки в байтах. Ноль означает `auto` — примерно оптимальный шаг предварительной выборки будет определён автоматически, но может быть не полностью оптимальным. Фактическое значение может отличаться из‑за настройки filesystem_prefetch_min_bytes_for_single_read_task.

## filesystem_prefetch_step_marks \{#filesystem_prefetch_step_marks\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Шаг предварительной выборки по меткам. Нулевое значение означает `auto`: примерно подходящий шаг предварительной выборки будет определён автоматически, хотя он может быть не полностью оптимальным. Фактическое значение может отличаться из‑за настройки filesystem_prefetch_min_bytes_for_single_read_task.

## filesystem_prefetches_limit \{#filesystem_prefetches_limit\} 

<SettingsInfoBlock type="UInt64" default_value="200" />

Максимальное количество предзагрузок. Ноль означает отсутствие ограничения. Если вы хотите ограничить количество предзагрузок, предпочтительнее использовать настройку `filesystem_prefetches_max_memory_usage`.

## final

<SettingsInfoBlock type="Bool" default_value="0" />

Автоматически применяет модификатор [FINAL](../../sql-reference/statements/select/from.md/#final-modifier) ко всем таблицам в запросе, к которым применим [FINAL](../../sql-reference/statements/select/from.md/#final-modifier), включая объединённые таблицы, таблицы в подзапросах и распределённые таблицы.

Возможные значения:

* 0 — отключено
* 1 — включено

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


## flatten&#95;nested

<SettingsInfoBlock type="Bool" default_value="1" />

Задаёт формат данных для [вложенных](../../sql-reference/data-types/nested-data-structures/index.md) столбцов.

Возможные значения:

* 1 — вложенный столбец разворачивается в отдельные массивы.
* 0 — вложенный столбец остаётся одним массивом кортежей.

**Использование**

Если настройка установлена в `0`, можно использовать произвольный уровень вложенности.

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


## force_aggregate_partitions_independently \{#force_aggregate_partitions_independently\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Принудительно включает оптимизацию, если она применима, но эвристика решила её не использовать

## force_aggregation_in_order \{#force_aggregation_in_order\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Эта настройка используется самим сервером для поддержки распределённых запросов. Не изменяйте её вручную, так как это нарушит нормальную работу. (Принудительно включает использование агрегации по порядку на удалённых узлах при распределённой агрегации).

## force&#95;data&#95;skipping&#95;indices

Запрещает выполнение запроса, если переданные индексы пропуска данных не были использованы.

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
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices=''; -- запрос приведёт к ошибке CANNOT_PARSE_TEXT.
SELECT * FROM data_01515 SETTINGS force_data_skipping_indices='d1_idx'; -- запрос приведёт к ошибке INDEX_NOT_USED.
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='d1_idx'; -- Корректно.
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='`d1_idx`'; -- Корректно (пример полнофункционального парсера).
SELECT * FROM data_01515 WHERE d1 = 0 SETTINGS force_data_skipping_indices='`d1_idx`, d1_null_idx'; -- запрос приведёт к ошибке INDEX_NOT_USED, так как d1_null_idx не используется.
SELECT * FROM data_01515 WHERE d1 = 0 AND assumeNotNull(d1_null) = 0 SETTINGS force_data_skipping_indices='`d1_idx`, d1_null_idx'; -- Корректно.
```


## force_grouping_standard_compatibility \{#force_grouping_standard_compatibility\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.9"},{"label": "1"},{"label": "Делает результат функции GROUPING таким же, как в стандарте SQL и других СУБД"}]}]}/>

Заставляет функцию GROUPING возвращать 1, если аргумент не используется в качестве ключа агрегации

## force_index_by_date \{#force_index_by_date\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Отключает выполнение запроса, если индекс нельзя использовать по дате.

Применяется к таблицам семейства MergeTree.

Если `force_index_by_date=1`, ClickHouse проверяет, есть ли в запросе условие по ключу даты, которое может быть использовано для ограничения диапазонов данных. Если подходящего условия нет, генерируется исключение. При этом не проверяется, уменьшает ли условие объем данных для чтения. Например, условие `Date != ' 2000-01-01 '` является допустимым, даже если оно соответствует всем данным в таблице (то есть для выполнения запроса требуется полное сканирование таблицы). Дополнительную информацию о диапазонах данных в таблицах MergeTree см. в разделе [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

## force_optimize_projection \{#force_optimize_projection\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает обязательное использование [проекций](../../engines/table-engines/mergetree-family/mergetree.md/#projections) в `SELECT`‑запросах, когда включена оптимизация проекций (см. настройку [optimize_use_projections](#optimize_use_projections)).

Возможные значения:

- 0 — Оптимизация проекций не является обязательной.
- 1 — Оптимизация проекций является обязательной.

## force_optimize_projection_name \{#force_optimize_projection_name\} 

Если задано непустое строковое значение, проверяется, что эта проекция используется в запросе хотя бы один раз.

Возможные значения:

- string: имя проекции, используемой в запросе

## force_optimize_skip_unused_shards \{#force_optimize_skip_unused_shards\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Включает или отключает выполнение запроса, если параметр [optimize_skip_unused_shards](#optimize_skip_unused_shards) включён, но пропуск неиспользуемых шардов невозможен. Если пропуск невозможен и настройка включена, выбрасывается исключение.

Возможные значения:

- 0 — Отключено. ClickHouse не выбрасывает исключение.
- 1 — Включено. Запрос не выполняется только в том случае, если у таблицы есть ключ шардинга.
- 2 — Включено. Запрос не выполняется независимо от того, определён ли для таблицы ключ шардинга.

## force_optimize_skip_unused_shards_nesting \{#force_optimize_skip_unused_shards_nesting\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Определяет, как [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards) применяется в зависимости от уровня вложенности распределённого запроса (когда таблица `Distributed` ссылается на другую таблицу `Distributed`). Для работы этого параметра по‑прежнему требуется включённый [`force_optimize_skip_unused_shards`](#force_optimize_skip_unused_shards).

Возможные значения:

- 0 — Отключено, `force_optimize_skip_unused_shards` всегда включён.
- 1 — Включает `force_optimize_skip_unused_shards` только для первого уровня.
- 2 — Включает `force_optimize_skip_unused_shards` до второго уровня включительно.

## force_primary_key \{#force_primary_key\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Запрещает выполнение запроса, если использование индекса по первичному ключу невозможно.

Применяется к таблицам семейства MergeTree.

Если `force_primary_key=1`, ClickHouse проверяет, содержит ли запрос условие по первичному ключу, которое можно использовать для ограничения диапазонов данных. Если подходящего условия нет, генерируется исключение. При этом не проверяется, уменьшает ли это условие объем данных для чтения. Для получения дополнительной информации о диапазонах данных в таблицах MergeTree см. [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

## force_remove_data_recursively_on_drop \{#force_remove_data_recursively_on_drop\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Рекурсивно удаляет данные при выполнении запроса DROP. Позволяет избежать ошибки «Directory not empty», но может незаметно удалить отсоединённые данные

## formatdatetime_e_with_space_padding \{#formatdatetime_e_with_space_padding\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Улучшена совместимость с MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

Спецификатор формата '%e' в функции 'formatDateTime' выводит однозначные значения дня месяца с ведущим пробелом, например ' 2' вместо '2'.

## formatdatetime_f_prints_scale_number_of_digits \{#formatdatetime_f_prints_scale_number_of_digits\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Форматтер '%f' в функции 'formatDateTime' для типа DateTime64 выводит только количество знаков после запятой, соответствующее его масштабу, вместо фиксированных 6 знаков.

## formatdatetime_f_prints_single_zero \{#formatdatetime_f_prints_single_zero\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "0"},{"label": "Улучшена совместимость с MySQL DATE_FORMAT()/STR_TO_DATE()"}]}]}/>

Спецификатор формата '%f' в функции `formatDateTime` выводит один ноль вместо шести нулей, если форматируемое значение не содержит дробной части секунд.

## formatdatetime_format_without_leading_zeros \{#formatdatetime_format_without_leading_zeros\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Форматы '%c', '%l' и '%k' в функции 'formatDateTime' выводят месяцы и часы без ведущих нулей.

## formatdatetime_parsedatetime_m_is_month_name \{#formatdatetime_parsedatetime_m_is_month_name\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "1"},{"label": "Улучшена совместимость с MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

Форматтер '%M' в функциях `formatDateTime` и `parseDateTime` выводит и разбирает название месяца вместо минут.

## fsync_metadata \{#fsync_metadata\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает [fsync](http://pubs.opengroup.org/onlinepubs/9699919799/functions/fsync.html) при записи `.sql`‑файлов. По умолчанию включено.

Имеет смысл отключить этот параметр, если на сервере есть миллионы небольших таблиц, которые постоянно создаются и удаляются.

## function_date_trunc_return_type_behavior \{#function_date_trunc_return_type_behavior\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "Добавлена новая настройка для сохранения старого поведения функции dateTrunc"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "Изменен тип возвращаемого результата функции dateTrunc для аргументов DateTime64/Date32 на DateTime64/Date32 независимо от единицы времени для корректной обработки отрицательных значений"}]}]}/>

Позволяет изменять поведение возвращаемого типа функции `dateTrunc`.

Возможные значения:

- 0 — когда второй аргумент имеет тип `DateTime64/Date32`, тип возвращаемого результата будет `DateTime64/Date32` независимо от единицы времени в первом аргументе.
- 1 — для `Date32` результат всегда имеет тип `Date`. Для `DateTime64` результат имеет тип `DateTime` для единиц времени `second` и более крупных.

## function_implementation \{#function_implementation\} 

Выберите реализацию функции для конкретной цели или варианта (экспериментально). Если оставить пустым, будут включены все реализации.

## function&#95;json&#95;value&#95;return&#95;type&#95;allow&#95;complex

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, можно ли возвращать сложные типы данных (struct, array, map) из функции json&#95;value.

```sql
SELECT JSON_VALUE('{"hello":{"world":"!"}}', '$.hello') settings function_json_value_return_type_allow_complex=true

┌─JSON_VALUE('{"hello":{"world":"!"}}', '$.hello')─┐
│ {"world":"!"}                                    │
└──────────────────────────────────────────────────┘

Получена 1 строка. Прошло: 0.001 сек.
```

Возможные значения:

* true — разрешить.
* false — запретить.


## function&#95;json&#95;value&#95;return&#95;type&#95;allow&#95;nullable

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, разрешено ли возвращать `NULL`, когда запрошенное значение для функции JSON&#95;VALUE отсутствует.

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


## function_locate_has_mysql_compatible_argument_order \{#function_locate_has_mysql_compatible_argument_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Повышение совместимости с функцией locate в MySQL."}]}]}/>

Управляет порядком аргументов в функции [locate](../../sql-reference/functions/string-search-functions.md/#locate).

Возможные значения:

- 0 — функция `locate` принимает аргументы `(haystack, needle[, start_pos])`.
- 1 — функция `locate` принимает аргументы `(needle, haystack[, start_pos])` (поведение, совместимое с MySQL).

## function_range_max_elements_in_block \{#function_range_max_elements_in_block\} 

<SettingsInfoBlock type="UInt64" default_value="500000000" />

Устанавливает предельный безопасный порог объёма данных, генерируемых функцией [range](/sql-reference/functions/array-functions#range). Определяет максимальное количество значений, генерируемых функцией для одного блока данных (сумма размеров массивов для каждой строки в блоке).

Возможные значения:

- Положительное целое число.

**См. также**

- [`max_block_size`](#max_block_size)
- [`min_insert_block_size_rows`](#min_insert_block_size_rows)

## function_sleep_max_microseconds_per_block \{#function_sleep_max_microseconds_per_block\} 

<SettingsInfoBlock type="UInt64" default_value="3000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.7"},{"label": "3000000"},{"label": "В предыдущих версиях максимальное время ожидания 3 секунды применялось только к функции `sleep`, но не к функции `sleepEachRow`. В новой версии мы вводим этот параметр. Если вы включите совместимость с предыдущими версиями, это ограничение будет полностью отключено."}]}]}/>

Максимальное количество микросекунд, в течение которых функция `sleep` может приостанавливать выполнение для каждого блока. Если пользователь вызовет её с большим значением, будет выброшено исключение. Это защитный порог.

## function_visible_width_behavior \{#function_visible_width_behavior\} 

<SettingsInfoBlock type="UInt64" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "Мы изменили поведение по умолчанию для `visibleWidth`, чтобы сделать его более точным"}]}]}/>

Версия поведения `visibleWidth`. 0 — учитывать только число кодовых точек; 1 — корректно учитывать символы нулевой ширины и комбинируемые символы, считать полноширинные символы за два, оценивать ширину табуляции, учитывать символы удаления.

## geo_distance_returns_float64_on_float64_arguments \{#geo_distance_returns_float64_on_float64_arguments\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Увеличена точность по умолчанию."}]}]}/>

Если все четыре аргумента функций `geoDistance`, `greatCircleDistance`, `greatCircleAngle` имеют тип Float64, эти функции возвращают значение типа Float64 и используют двойную точность для внутренних вычислений. В предыдущих версиях ClickHouse эти функции всегда возвращали Float32.

## geotoh3_argument_order \{#geotoh3_argument_order\} 

<BetaBadge/>

<SettingsInfoBlock type="GeoToH3ArgumentOrder" default_value="lat_lon" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "lat_lon"},{"label": "Новая настройка для устаревшего поведения, определяющая порядок аргументов lon и lat"}]}]}/>

Функция `geoToH3` принимает (lon, lat), если установлено значение `lon_lat`, и (lat, lon), если установлено значение `lat_lon`.

## glob_expansion_max_elements \{#glob_expansion_max_elements\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальное количество допустимых адресов (для внешних хранилищ, табличных функций и т. д.).

## grace_hash_join_initial_buckets \{#grace_hash_join_initial_buckets\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1" />

Начальное число бакетов для grace hash join

## grace_hash_join_max_buckets \{#grace_hash_join_max_buckets\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

Ограничение на максимальное число корзин (bucket) для grace hash join

## group_by_overflow_mode \{#group_by_overflow_mode\} 

<SettingsInfoBlock type="OverflowModeGroupBy" default_value="throw" />

Определяет, что происходит, когда количество уникальных ключей для агрегации превышает лимит:

- `throw`: сгенерировать исключение
- `break`: остановить выполнение запроса и вернуть частичный результат
- `any`: продолжить агрегацию по ключам, которые уже попали во множество, но не добавлять в него новые ключи.

Использование значения `any` позволяет выполнять приближённый вариант операции GROUP BY. Качество
такого приближения зависит от статистических свойств данных.

## group_by_two_level_threshold \{#group_by_two_level_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

Пороговое количество ключей, начиная с которого используется двухуровневая агрегация. 0 — порог не задан.

## group_by_two_level_threshold_bytes \{#group_by_two_level_threshold_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="50000000" />

Размер состояния агрегации в байтах, начиная с которого применяется двухуровневая агрегация. 0 — порог не установлен. Двухуровневая агрегация используется, когда срабатывает хотя бы один из порогов.

## group_by_use_nulls \{#group_by_use_nulls\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Изменяет то, как [предложение GROUP BY](/sql-reference/statements/select/group-by) обрабатывает типы ключей агрегации.
Когда используются спецификаторы `ROLLUP`, `CUBE` или `GROUPING SETS`, некоторые ключи агрегации могут не использоваться при формировании отдельных строк результата.
Столбцы для этих ключей в соответствующих строках заполняются либо значением по умолчанию, либо `NULL` в зависимости от этой настройки.

Возможные значения:

- 0 — Для заполнения отсутствующих значений используется значение по умолчанию для типа ключа агрегации.
- 1 — ClickHouse выполняет `GROUP BY` в соответствии со стандартом SQL. Типы ключей агрегации преобразуются в [Nullable](/sql-reference/data-types/nullable). Столбцы для соответствующих ключей агрегации заполняются значением [NULL](/sql-reference/syntax#null) для строк, в которых этот ключ не использовался.

См. также:

- [Предложение GROUP BY](/sql-reference/statements/select/group-by)

## h3togeo_lon_lat_result_order \{#h3togeo_lon_lat_result_order\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Функция `h3ToGeo` возвращает (lon, lat), если значение установлено в `true`, иначе — (lat, lon).

## handshake_timeout_ms \{#handshake_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="10000" />

Тайм-аут в миллисекундах на ожидание пакета Hello от реплик во время рукопожатия.

## hdfs_create_new_file_on_insert \{#hdfs_create_new_file_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает создание нового файла при каждом `INSERT` в таблицы с движком HDFS. Если включено, при каждом `INSERT` будет создаваться новый файл HDFS с именем, соответствующим следующему шаблону:

исходно: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` и т. д.

Возможные значения:

- 0 — запрос `INSERT` дописывает новые данные в конец файла.
- 1 — запрос `INSERT` создает новый файл.

## hdfs_ignore_file_doesnt_exist \{#hdfs_ignore_file_doesnt_exist\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Позволяет возвращать 0 строк, когда запрошенные файлы отсутствуют, вместо генерации исключения в движке таблиц HDFS"}]}]}/>

Игнорирует отсутствие файлов при чтении определённых ключей.

Возможные значения:

- 1 — `SELECT` возвращает пустой результат.
- 0 — `SELECT` генерирует исключение.

## hdfs_replication \{#hdfs_replication\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Фактический коэффициент репликации может быть задан при создании файла в HDFS.

## hdfs_skip_empty_files \{#hdfs_skip_empty_files\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает пропуск пустых файлов в таблицах движка [HDFS](../../engines/table-engines/integrations/hdfs.md).

Возможные значения:

- 0 — `SELECT` выдаёт исключение, если пустой файл не совместим с запрошенным форматом.
- 1 — `SELECT` возвращает пустой результат для пустого файла.

## hdfs_throw_on_zero_files_match \{#hdfs_throw_on_zero_files_match\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Позволяет выдавать ошибку, если запрос ListObjects не находит ни одного файла в движке HDFS, вместо возврата пустого результата запроса"}]}]}/>

Выдаёт ошибку, если при расширении glob не было найдено ни одного файла.

Возможные значения:

- 1 — `SELECT` генерирует исключение.
- 0 — `SELECT` возвращает пустой результат.

## hdfs_truncate_on_insert \{#hdfs_truncate_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает очистку файла перед вставкой в таблицы движка HDFS. Если параметр отключён, при попытке вставки будет выброшено исключение, если файл в HDFS уже существует.

Возможные значения:

- 0 — запрос `INSERT` дописывает новые данные в конец файла.
- 1 — запрос `INSERT` заменяет существующее содержимое файла новыми данными.

## hedged_connection_timeout_ms \{#hedged_connection_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="50" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.4"},{"label": "50"},{"label": "Запуск нового соединения для hedged-запросов через 50 мс вместо 100 мс, чтобы соответствовать предыдущему таймауту установления соединения"}]}]}/>

Таймаут установления соединения с репликой для hedged-запросов

## hnsw_candidate_list_size_for_search \{#hnsw_candidate_list_size_for_search\} 

<SettingsInfoBlock type="UInt64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "256"},{"label": "Новая настройка. Ранее значение можно было при необходимости указать в CREATE INDEX, а по умолчанию оно было равно 64."}]}]}/>

Размер динамического списка кандидатов при поиске по индексу векторного сходства (параметр `ef_search`).

## hsts_max_age \{#hsts_max_age\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Срок действия HSTS. 0 означает отключение HSTS.

## http_connection_timeout \{#http_connection_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="1" />

Таймаут HTTP-соединения (в секундах).

Возможные значения:

- Любое положительное целое число.
- 0 — отключено (бесконечный таймаут).

## http_headers_progress_interval_ms \{#http_headers_progress_interval_ms\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Не отправлять HTTP-заголовки X-ClickHouse-Progress чаще, чем один раз в указанный интервал.

## http_make_head_request \{#http_make_head_request\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Параметр `http_make_head_request` позволяет выполнить запрос `HEAD` при чтении данных по HTTP, чтобы получить информацию о файле, который будет прочитан, например, его размер. Поскольку этот параметр включён по умолчанию, в случаях, когда сервер не поддерживает запросы `HEAD`, может потребоваться его отключить.

## http_max_field_name_size \{#http_max_field_name_size\} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

Максимальная длина имени поля в HTTP-заголовке

## http_max_field_value_size \{#http_max_field_value_size\} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

Максимальная длина значения поля в HTTP-заголовке

## http_max_fields \{#http_max_fields\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

Максимальное количество полей в HTTP‑заголовке

## http_max_multipart_form_data_size \{#http_max_multipart_form_data_size\} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Ограничение на размер содержимого multipart/form-data. Этот параметр не может быть задан через параметры URL и должен быть установлен в пользовательском профиле. Обратите внимание, что содержимое разбирается, а внешние таблицы создаются в памяти до начала выполнения запроса. И это единственное ограничение, которое влияет на этот этап (ограничения на максимальное использование памяти и максимальное время выполнения не влияют при чтении данных HTTP‑формы).

## http_max_request_param_data_size \{#http_max_request_param_data_size\} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

Ограничение на размер данных запроса, используемых в качестве параметра в предопределённых HTTP-запросах.

## http_max_tries \{#http_max_tries\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

Максимальное количество попыток чтения через HTTP.

## http_max_uri_size \{#http_max_uri_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Устанавливает максимально допустимую длину URI HTTP-запроса.

Возможные значения:

- Положительное целое число.

## http_native_compression_disable_checksumming_on_decompress \{#http_native_compression_disable_checksumming_on_decompress\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает проверку контрольной суммы при декомпрессии данных HTTP POST, поступающих от клиента. Используется только для нативного формата сжатия ClickHouse (не используется с `gzip` или `deflate`).

Для получения дополнительной информации см. [описание HTTP‑интерфейса](../../interfaces/http.md).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## http_receive_timeout \{#http_receive_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "См. http_send_timeout."}]}]}/>

Таймаут приёма HTTP-запроса (в секундах).

Возможные значения:

- Любое положительное целое число.
- 0 — отключено (бесконечный таймаут).

## http_response_buffer_size \{#http_response_buffer_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Количество байт, буферизуемых в памяти сервера перед отправкой HTTP-ответа клиенту или сбросом данных на диск (когда включен `http_wait_end_of_query`).

## http_response_headers \{#http_response_headers\} 

<SettingsInfoBlock type="Map" default_value="{}" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": ""},{"label": "Новая настройка."}]}]}/>

Позволяет добавить или переопределить HTTP‑заголовки, которые сервер вернёт в ответе при успешном выполнении запроса.
Это влияет только на HTTP‑интерфейс.

Если заголовок уже установлен по умолчанию, указанное значение его переопределит.
Если заголовок не был установлен по умолчанию, он будет добавлен в список заголовков.
Заголовки, которые устанавливаются сервером по умолчанию и не переопределяются этой настройкой, сохранятся.

Настройка позволяет задать заголовок константным значением. В настоящее время нет возможности задать заголовок динамически вычисляемым значением.

Ни имена, ни значения не могут содержать управляющие символы ASCII.

Если вы реализуете UI‑приложение, которое позволяет пользователям изменять настройки и одновременно принимает решения на основе возвращаемых заголовков, рекомендуется ограничить эту настройку режимом «только для чтения».

Пример: `SET http_response_headers = '{"Content-Type": "image/png"}'`

## http_retry_initial_backoff_ms \{#http_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Минимальный интервал (в миллисекундах) задержки (backoff) при повторных попытках чтения по HTTP

## http_retry_max_backoff_ms \{#http_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное время ожидания в миллисекундах (backoff) при повторных попытках чтения по HTTP

## http_send_timeout \{#http_send_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="30" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.6"},{"label": "30"},{"label": "3 минуты кажутся чрезмерно большим значением. Обратите внимание, что это тайм-аут для одного сетевого вызова записи, а не для всей операции загрузки."}]}]}/>

Тайм-аут отправки HTTP-запросов (в секундах).

Возможные значения:

- Любое положительное целое число.
- 0 — отключено (неограниченный тайм-аут).

:::note
Применимо только к профилю по умолчанию. Для вступления изменений в силу требуется перезапуск сервера.
:::

## http_skip_not_found_url_for_globs \{#http_skip_not_found_url_for_globs\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Пропускать URL, соответствующие шаблонам (globs), при ошибке HTTP_NOT_FOUND

## http_wait_end_of_query \{#http_wait_end_of_query\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает буферизацию HTTP-ответов на стороне сервера.

## http_write_exception_in_output_format \{#http_write_exception_in_output_format\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "Изменено для согласованности во всех форматах"}]}, {"id": "row-2","items": [{"label": "23.9"},{"label": "1"},{"label": "Выводить валидный JSON/XML при исключении в HTTP‑потоке."}]}]}/>

Записывает исключение в формате вывода, чтобы сформировать валидный результат. Работает с форматами JSON и XML.

## http_zlib_compression_level \{#http_zlib_compression_level\} 

<SettingsInfoBlock type="Int64" default_value="3" />

Устанавливает уровень сжатия данных в ответе на HTTP-запрос, если [enable_http_compression = 1](#enable_http_compression).

Возможные значения: числа от 1 до 9.

## iceberg_delete_data_on_drop \{#iceberg_delete_data_on_drop\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Определяет, следует ли удалять все файлы Iceberg при выполнении операции DROP.

## iceberg_insert_max_bytes_in_data_file \{#iceberg_insert_max_bytes_in_data_file\} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1073741824"},{"label": "New setting."}]}]}/>

Максимальный размер в байтах Parquet-файла данных Iceberg при выполнении операции вставки.

## iceberg_insert_max_partitions \{#iceberg_insert_max_partitions\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "100"},{"label": "New setting."}]}]}/>

Максимально допустимое количество разделов при одной операции вставки для табличного движка Iceberg.

## iceberg_insert_max_rows_in_data_file \{#iceberg_insert_max_rows_in_data_file\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1000000"},{"label": "New setting."}]}]}/>

Максимальное количество строк в Parquet-файле с данными Iceberg при операции вставки.

## iceberg_metadata_compression_method \{#iceberg_metadata_compression_method\} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "Новая настройка"}]}]}/>

Метод, используемый для сжатия файла `.metadata.json`.

## iceberg_metadata_log_level \{#iceberg_metadata_log_level\} 

<SettingsInfoBlock type="IcebergMetadataLogLevel" default_value="none" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "none"},{"label": "New setting."}]}]}/>

Определяет уровень логирования метаданных для таблиц Iceberg в таблицу system.iceberg_metadata_log.
Обычно этот параметр изменяют для целей отладки.

Возможные значения:

- none — без журнала метаданных.
- metadata — корневой файл metadata.json.
- manifest_list_metadata — всё вышеуказанное + метаданные из avro manifest list, соответствующего снимку (snapshot).
- manifest_list_entry — всё вышеуказанное + записи avro manifest list.
- manifest_file_metadata — всё вышеуказанное + метаданные из просматриваемых файлов avro manifest.
- manifest_file_entry — всё вышеуказанное + записи из просматриваемых файлов avro manifest.

## iceberg_snapshot_id \{#iceberg_snapshot_id\} 

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Выполнить запрос к таблице Iceberg, используя указанный идентификатор снимка (snapshot ID).

## iceberg_timestamp_ms \{#iceberg_timestamp_ms\} 

<SettingsInfoBlock type="Int64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Выполняет запрос к таблице Iceberg с использованием снимка, который был актуален на указанный момент времени.

## idle_connection_timeout \{#idle_connection_timeout\} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

Таймаут для закрытия неактивных TCP-подключений по истечении указанного количества секунд.

Возможные значения:

- Положительное целое число (0 — закрыть немедленно, через 0 секунд).

## ignore_cold_parts_seconds \{#ignore_cold_parts_seconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

Действует только в ClickHouse Cloud. Исключает новые части данных из запросов SELECT до тех пор, пока они либо не будут предварительно прогреты (см. [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch)), либо не пройдёт указанное количество секунд. Применяется только к Replicated-/SharedMergeTree.

## ignore&#95;data&#95;skipping&#95;indices

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
SELECT * FROM data SETTINGS ignore_data_skipping_indices=''; -- запрос приведет к ошибке CANNOT_PARSE_TEXT.
SELECT * FROM data SETTINGS ignore_data_skipping_indices='x_idx'; -- Ок.
SELECT * FROM data SETTINGS ignore_data_skipping_indices='na_idx'; -- Ок.

SELECT * FROM data WHERE x = 1 AND y = 1 SETTINGS ignore_data_skipping_indices='xy_idx',force_data_skipping_indices='xy_idx' ; -- запрос приведет к ошибке INDEX_NOT_USED, так как xy_idx явно игнорируется.
SELECT * FROM data WHERE x = 1 AND y = 2 SETTINGS ignore_data_skipping_indices='xy_idx';
```

Запрос, который не игнорирует индексы:

```sql
EXPLAIN indexes = 1 SELECT * FROM data WHERE x = 1 AND y = 2;

Expression ((Проекция + До ORDER BY))
  Filter (WHERE)
    ReadFromMergeTree (default.data)
    Индексы:
      PrimaryKey
        Условие: true
        Кусков: 1/1
        Гранул: 1/1
      Skip
        Название: x_idx
        Описание: minmax GRANULARITY 1
        Кусков: 0/1
        Гранул: 0/1
      Skip
        Название: y_idx
        Описание: minmax GRANULARITY 1
        Кусков: 0/0
        Гранул: 0/0
      Skip
        Название: xy_idx
        Описание: minmax GRANULARITY 1
        Кусков: 0/0
        Гранул: 0/0
```

Игнорируем индекс `xy_idx`:

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

Работает с таблицами семейства MergeTree.


## ignore_drop_queries_probability \{#ignore_drop_queries_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "Позволяет серверу игнорировать запросы DROP с указанной вероятностью в тестовых целях"}]}]}/>

Если включено, сервер будет игнорировать все запросы DROP TABLE с указанной вероятностью (для движков Memory и JOIN он будет заменять DROP на TRUNCATE). Используется только в тестовых целях.

## ignore_materialized_views_with_dropped_target_table \{#ignore_materialized_views_with_dropped_target_table\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Добавлена новая настройка, позволяющая игнорировать материализованные представления с удалённой целевой таблицей"}]}]}/>

Игнорировать материализованные представления с удалённой целевой таблицей при проталкивании данных в представления

## ignore_on_cluster_for_replicated_access_entities_queries \{#ignore_on_cluster_for_replicated_access_entities_queries\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорирует предложение ON CLUSTER в запросах управления реплицируемыми объектами доступа.

## ignore_on_cluster_for_replicated_named_collections_queries \{#ignore_on_cluster_for_replicated_named_collections_queries\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Игнорирует клаузу ON CLUSTER в запросах управления реплицируемыми именованными коллекциями."}]}]}/>

Игнорирует клаузу ON CLUSTER в запросах управления реплицируемыми именованными коллекциями.

## ignore_on_cluster_for_replicated_udf_queries \{#ignore_on_cluster_for_replicated_udf_queries\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать оператор ON CLUSTER в запросах управления реплицируемыми UDF.

## implicit_select \{#implicit_select\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "A new setting."}]}]}/>

Позволяет выполнять простые запросы без начального ключевого слова SELECT, что упрощает использование «как в калькуляторе», например `1 + 2` становится корректным запросом.

В `clickhouse-local` этот параметр по умолчанию включён и может быть явно отключён.

## implicit_table_at_top_level \{#implicit_table_at_top_level\} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": ""},{"label": "Новая настройка, используемая в clickhouse-local"}]}]}/>

Если значение не пустое, запросы без FROM на верхнем уровне будут читать из этой таблицы вместо system.one.

Эта настройка используется в clickhouse-local для обработки входных данных.
Настройка может быть явно задана пользователем, но не предназначена для такого способа использования.

Подзапросы не затрагиваются этой настройкой (ни скалярные, ни подзапросы в FROM или IN).
Операторы SELECT на верхнем уровне цепочек UNION, INTERSECT, EXCEPT обрабатываются единообразно и затрагиваются этой настройкой, независимо от их группировки в скобках.
Не уточняется, как эта настройка влияет на представления и распределённые запросы.

Настройка принимает имя таблицы (тогда таблица определяется из текущей базы данных) или полное имя в форме 'database.table'.
И имена базы данных, и таблицы должны быть без кавычек — допускаются только простые идентификаторы.

## implicit_transaction \{#implicit_transaction\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Если включено и запрос ещё не находится внутри транзакции, оборачивает его в полную транзакцию (BEGIN + COMMIT или ROLLBACK)

## inject_random_order_for_select_without_order_by \{#inject_random_order_for_select_without_order_by\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

Если параметр включён, добавляет `ORDER BY rand()` в запросы SELECT без клаузы ORDER BY.
Применяется только для запросов с глубиной подзапроса = 0. Подзапросы и INSERT INTO ... SELECT не затрагиваются.
Если верхнеуровневой конструкцией является UNION, `ORDER BY rand()` добавляется во все дочерние запросы независимо.
Полезно только для тестирования и разработки (отсутствие ORDER BY является источником недетерминированных результатов запросов).

## input_format_parallel_parsing \{#input_format_parallel_parsing\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает параллельный разбор данных с сохранением порядка. Поддерживается только для форматов [TabSeparated (TSV)](/interfaces/formats/TabSeparated), [TSKV](/interfaces/formats/TSKV), [CSV](/interfaces/formats/CSV) и [JSONEachRow](/interfaces/formats/JSONEachRow).

Возможные значения:

- 1 — включено.
- 0 — отключено.

## insert_allow_materialized_columns \{#insert_allow_materialized_columns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если настройка включена, разрешает использование материализованных столбцов в запросах INSERT.

## insert_deduplicate \{#insert_deduplicate\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает дедупликацию блоков при выполнении `INSERT` (для реплицируемых таблиц Replicated\*).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

По умолчанию блоки, вставляемые в реплицируемые таблицы оператором `INSERT`, дедуплицируются (см. [Data Replication](../../engines/table-engines/mergetree-family/replication.md)).
По умолчанию для реплицируемых таблиц дедуплицируются только 100 последних блоков в каждой партиции (см. [replicated_deduplication_window](merge-tree-settings.md/#replicated_deduplication_window), [replicated_deduplication_window_seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds)).
Для нереплицируемых таблиц см. [non_replicated_deduplication_window](merge-tree-settings.md/#non_replicated_deduplication_window).

## insert&#95;deduplication&#95;token

Этот параметр позволяет пользователю задать собственную семантику дедупликации в MergeTree/ReplicatedMergeTree.
Например, указывая уникальное значение этого параметра в каждом операторе INSERT,
пользователь может избежать дедупликации одинаковых вставок данных.

Возможные значения:

* Любая строка

`insert_deduplication_token` используется для дедупликации *только* если он не пуст.

Для реплицируемых таблиц по умолчанию дедуплицируются только 100 последних вставок для каждой партиции (см. [replicated&#95;deduplication&#95;window](merge-tree-settings.md/#replicated_deduplication_window), [replicated&#95;deduplication&#95;window&#95;seconds](merge-tree-settings.md/#replicated_deduplication_window_seconds)).
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

-- следующая вставка не будет дедуплицирована, так как insert_deduplication_token отличается
INSERT INTO test_table SETTINGS insert_deduplication_token = 'test1' VALUES (1);

-- следующая вставка будет дедуплицирована, так как insert_deduplication_token
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


## insert_keeper_fault_injection_probability \{#insert_keeper_fault_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

Приблизительная вероятность сбоя запроса к Keeper при выполнении операции вставки. Допустимое значение находится в диапазоне [0.0f, 1.0f].

## insert_keeper_fault_injection_seed \{#insert_keeper_fault_injection_seed\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 — случайное начальное значение генератора случайных чисел, в противном случае — значение параметра

## insert&#95;keeper&#95;max&#95;retries

<SettingsInfoBlock type="UInt64" default_value="20" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "20"},{"label": "Enable reconnections to Keeper on INSERT, improve reliability"}]}]} />

Этот параметр задаёт максимальное количество повторных попыток для запросов к ClickHouse Keeper (или ZooKeeper) при вставке данных в реплицированную таблицу MergeTree. Для повторных попыток учитываются только те запросы к Keeper, которые завершились сбоем из‑за сетевой ошибки, таймаута сессии Keeper или таймаута запроса.

Возможные значения:

* Положительное целое число.
* 0 — повторные попытки отключены.

Значение по умолчанию в Cloud: `20`.

Повторные попытки запросов к Keeper выполняются после задержки. Эта задержка управляется следующими настройками: `insert_keeper_retry_initial_backoff_ms`, `insert_keeper_retry_max_backoff_ms`.
Первая повторная попытка выполняется после таймаута `insert_keeper_retry_initial_backoff_ms`. Последующие задержки вычисляются следующим образом:

```
timeout = min(insert_keeper_retry_max_backoff_ms, latest_timeout * 2)
```

Например, если `insert_keeper_retry_initial_backoff_ms=100`, `insert_keeper_retry_max_backoff_ms=10000` и `insert_keeper_max_retries=8`, тогда таймауты будут равны `100, 200, 400, 800, 1600, 3200, 6400, 10000`.

Помимо отказоустойчивости, повторные попытки призваны обеспечить более удобную работу пользователя — они позволяют избежать ошибки при выполнении INSERT, если Keeper перезапускается, например после обновления.


## insert_keeper_retry_initial_backoff_ms \{#insert_keeper_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Начальное время ожидания (в миллисекундах) при повторной попытке неудачного запроса к Keeper во время выполнения INSERT-запроса.

Возможные значения:

- Положительное целое число.
- 0 — без ожидания.

## insert_keeper_retry_max_backoff_ms \{#insert_keeper_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное время ожидания (в миллисекундах) при повторной попытке выполнения неудавшегося запроса к Keeper во время выполнения запроса INSERT.

Возможные значения:

- Положительное целое число.
- 0 — максимальное время ожидания не ограничено.

## insert_null_as_default \{#insert_null_as_default\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает вставку [значений по умолчанию](/sql-reference/statements/create/table#default_values) вместо [NULL](/sql-reference/syntax#null) в столбцы с типом данных, не являющимся [Nullable](/sql-reference/data-types/nullable).
Если тип столбца не является Nullable и эта настройка отключена, то вставка `NULL` приводит к исключению. Если тип столбца Nullable, то значения `NULL` вставляются как есть, независимо от этой настройки.

Эта настройка применяется к запросам [INSERT ... SELECT](../../sql-reference/statements/insert-into.md/#inserting-the-results-of-select). Обратите внимание, что подзапросы `SELECT` могут быть объединены оператором `UNION ALL`.

Возможные значения:

- 0 — вставка `NULL` в столбец с не Nullable типом приводит к исключению.
- 1 — вместо `NULL` вставляется значение столбца по умолчанию.

## insert_quorum \{#insert_quorum\} 

<SettingsInfoBlock type="UInt64Auto" default_value="0" />

:::note
Этот параметр не применяется к SharedMergeTree, дополнительную информацию см. в разделе [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency).
:::

Включает кворумные записи.

- Если `insert_quorum < 2`, кворумные записи отключены.
- Если `insert_quorum >= 2`, кворумные записи включены.
- Если `insert_quorum = 'auto'`, в качестве размера кворума используется большинство (`number_of_replicas / 2 + 1`).

Кворумные записи

`INSERT` считается успешным только тогда, когда ClickHouse удаётся корректно записать данные на `insert_quorum` реплик в течение `insert_quorum_timeout`. Если по какой-либо причине число реплик с успешной записью не достигает `insert_quorum`, запись считается неуспешной, и ClickHouse удалит вставленный блок со всех реплик, на которые данные уже были записаны.

Когда `insert_quorum_parallel` отключён, все реплики в кворуме согласованы, т. е. содержат данные из всех предыдущих запросов `INSERT` (последовательность `INSERT` линеаризована). При чтении данных, записанных с использованием `insert_quorum`, и отключённом `insert_quorum_parallel` вы можете включить последовательную согласованность для запросов `SELECT`, используя [select_sequential_consistency](#select_sequential_consistency).

ClickHouse выбрасывает исключение:

- если число доступных реплик на момент выполнения запроса меньше `insert_quorum`;
- когда `insert_quorum_parallel` отключён и выполняется попытка записи данных, пока предыдущий блок ещё не был вставлен на `insert_quorum` реплик. Такая ситуация может возникнуть, если пользователь пытается выполнить ещё один запрос `INSERT` в ту же таблицу до завершения предыдущего запроса с `insert_quorum`.

См. также:

- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_parallel \{#insert_quorum_parallel\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "Использовать параллельные кворумные вставки по умолчанию. Это значительно удобнее, чем последовательные кворумные вставки."}]}]}/>

:::note
Этот параметр не применяется к SharedMergeTree, дополнительную информацию см. в разделе [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency).
:::

Включает или выключает параллелизм для кворумных запросов `INSERT`. Если включено, дополнительные запросы `INSERT` можно отправлять, даже если предыдущие запросы ещё не завершены. Если выключено, дополнительные операции записи в ту же таблицу будут отклонены.

Возможные значения:

- 0 — отключено.
- 1 — включено.

См. также:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [select_sequential_consistency](#select_sequential_consistency)

## insert_quorum_timeout \{#insert_quorum_timeout\} 

<SettingsInfoBlock type="Milliseconds" default_value="600000" />

Таймаут записи в кворум в миллисекундах. Если таймаут истёк и запись ещё не была выполнена, ClickHouse сгенерирует исключение, и клиент должен повторить запрос на запись того же блока на ту же или любую другую реплику.

См. также:

- [insert_quorum](#insert_quorum)
- [insert_quorum_parallel](#insert_quorum_parallel)
- [select_sequential_consistency](#select_sequential_consistency)

## insert&#95;shard&#95;id

<SettingsInfoBlock type="UInt64" default_value="0" />

Если значение не равно `0`, указывает шард таблицы [Distributed](/engines/table-engines/special/distributed), в который данные будут вставлены синхронно.

Если значение `insert_shard_id` некорректно, сервер выбросит исключение.

Чтобы получить количество шардов в кластере `requested_cluster`, можно проверить конфигурацию сервера или выполнить следующий запрос:

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


## interactive_delay \{#interactive_delay\} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

Интервал в микросекундах для проверки, было ли выполнение запроса отменено, и отправки информации о его прогрессе.

## intersect_default_mode \{#intersect_default_mode\} 

<SettingsInfoBlock type="SetOperationMode" default_value="ALL" />

Устанавливает режим по умолчанию для запроса INTERSECT. Допустимые значения: пустая строка, `ALL`, `DISTINCT`. Если установлено пустое значение, запрос без указания режима приведёт к выбросу исключения.

## jemalloc_collect_profile_samples_in_trace_log \{#jemalloc_collect_profile_samples_in_trace_log\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

Собирать выборки операций выделения и освобождения памяти jemalloc в журнал трассировки.

## jemalloc_enable_profiler \{#jemalloc_enable_profiler\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает профилировщик jemalloc для запроса. Jemalloc будет выборочно сэмплировать выделения памяти и отслеживать все освобождения для отобранных выделений.
Профили можно сбрасывать с помощью SYSTEM JEMALLOC FLUSH PROFILE, что может использоваться для анализа выделений.
Сэмплы также могут сохраняться в system.trace_log с помощью настройки jemalloc_collect_global_profile_samples_in_trace_log или с помощью настройки запроса jemalloc_collect_profile_samples_in_trace_log.
См. раздел [Allocation Profiling](/operations/allocation-profiling).

## join_algorithm \{#join_algorithm\} 

<SettingsInfoBlock type="JoinAlgorithm" default_value="direct,parallel_hash,hash" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "direct,parallel_hash,hash"},{"label": "'default' объявлен устаревшим в пользу явного указания алгоритмов соединения, кроме того, parallel_hash теперь предпочтителен по сравнению с hash"}]}]}/>

Определяет, какой алгоритм [JOIN](../../sql-reference/statements/select/join.md) используется.

Можно указать несколько алгоритмов, и для конкретного запроса будет выбран доступный алгоритм на основе вида/строгости соединения и движка таблицы.

Возможные значения:

- grace_hash

Используется [Grace hash join](https://en.wikipedia.org/wiki/Hash_join#Grace_hash_join). Алгоритм grace hash позволяет эффективно выполнять сложные соединения при ограниченном использовании памяти.

На первом этапе grace hash join читает правую таблицу и разбивает её на N бакетов в зависимости от хеш-значения ключевых столбцов (изначально N — это `grace_hash_join_initial_buckets`). Это делается так, чтобы каждый бакет можно было обрабатывать независимо. Строки из первого бакета добавляются во внутреннюю хеш-таблицу, а остальные сохраняются на диск. Если хеш-таблица выходит за пределы лимита памяти (например, заданного параметром [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)), увеличивается количество бакетов и перераспределяется бакет для каждой строки. Все строки, которые не принадлежат текущему бакету, сбрасываются на диск и переназначаются.

Поддерживает `INNER/LEFT/RIGHT/FULL ALL/ANY JOIN`.

- hash

Используется [алгоритм хеш-соединения](https://en.wikipedia.org/wiki/Hash_join). Наиболее универсальная реализация, которая поддерживает все комбинации вида и строгости, а также несколько ключей соединения, объединённых с помощью `OR` в секции `JOIN ON`.

При использовании алгоритма `hash` правая часть `JOIN` загружается в оперативную память.

- parallel_hash

Вариант соединения `hash`, который разбивает данные на бакеты и параллельно строит несколько хеш-таблиц вместо одной, чтобы ускорить процесс.

При использовании алгоритма `parallel_hash` правая часть `JOIN` загружается в оперативную память.

- partial_merge

Вариант [алгоритма сортирующего соединения](https://en.wikipedia.org/wiki/Sort-merge_join), при котором полностью сортируется только правая таблица.

`RIGHT JOIN` и `FULL JOIN` поддерживаются только со строгостью `ALL` (`SEMI`, `ANTI`, `ANY` и `ASOF` не поддерживаются).

При использовании алгоритма `partial_merge` ClickHouse сортирует данные и сбрасывает их на диск. Алгоритм `partial_merge` в ClickHouse немного отличается от классической реализации. Сначала ClickHouse сортирует правую таблицу по ключам соединения блоками и создаёт min-max индекс для отсортированных блоков. Затем он сортирует части левой таблицы по ключу соединения (`join key`) и соединяет их с правой таблицей. Min-max индекс также используется для пропуска ненужных блоков правой таблицы.

- direct

Этот алгоритм может применяться, когда хранилище для правой таблицы поддерживает запросы вида ключ-значение.

Алгоритм `direct` выполняет поиск в правой таблице, используя строки из левой таблицы в качестве ключей. Поддерживается только особыми типами хранилищ, такими как [Dictionary](/engines/table-engines/special/dictionary) или [EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md), и только для `LEFT` и `INNER` JOIN.

- auto

Если установлено значение `auto`, сначала пробуется соединение `hash`, а при превышении лимита памяти алгоритм на лету переключается на другой.

- full_sorting_merge

[Алгоритм сортирующего соединения](https://en.wikipedia.org/wiki/Sort-merge_join) с полной сортировкой соединяемых таблиц перед соединением.

- prefer_partial_merge

ClickHouse всегда пытается использовать соединение `partial_merge`, если это возможно, в противном случае используется `hash`. *Устарело*, эквивалентно `partial_merge,hash`.

- default (deprecated)

Устаревшее значение, больше не используйте его.
 То же, что и `direct,hash`, то есть попытаться сначала использовать direct join, а затем hash join (в таком порядке).

## join_any_take_last_row \{#join_any_take_last_row\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Изменяет поведение операций `JOIN` со строгостью `ANY`.

:::note
Эта настройка применяется только к операциям `JOIN` с таблицами на движке [Join](../../engines/table-engines/special/join.md).
:::

Возможные значения:

- 0 — Если в правой таблице более одной подходящей строки, присоединяется только первая найденная.
- 1 — Если в правой таблице более одной подходящей строки, присоединяется только последняя найденная.

См. также:

- [Оператор JOIN](/sql-reference/statements/select/join)
- [Движок таблиц Join](../../engines/table-engines/special/join.md)
- [join_default_strictness](#join_default_strictness)

## join_default_strictness \{#join_default_strictness\} 

<SettingsInfoBlock type="JoinStrictness" default_value="ALL" />

Устанавливает строгость по умолчанию для [операторов JOIN](/sql-reference/statements/select/join).

Возможные значения:

- `ALL` — Если в правой таблице несколько совпадающих строк, ClickHouse создаёт [декартово произведение](https://en.wikipedia.org/wiki/Cartesian_product) из совпадающих строк. Это стандартное поведение `JOIN` в стандартном SQL.
- `ANY` — Если в правой таблице несколько совпадающих строк, присоединяется только первая найденная. Если в правой таблице только одна совпадающая строка, результаты `ANY` и `ALL` совпадают.
- `ASOF` — Для соединения последовательностей с неточным соответствием.
- `Empty string` — Если в запросе не указано `ALL` или `ANY`, ClickHouse выбрасывает исключение.

## join_on_disk_max_files_to_merge \{#join_on_disk_max_files_to_merge\} 

<SettingsInfoBlock type="UInt64" default_value="64" />

Ограничивает количество файлов, которые можно использовать для параллельной сортировки в операциях `MergeJoin`, когда они выполняются на диске.

Чем больше значение настройки, тем больше используется оперативной памяти и тем меньше требуется операций ввода-вывода на диск.

Возможные значения:

- Любое положительное целое число, начиная с 2.

## join_output_by_rowlist_perkey_rows_threshold \{#join_output_by_rowlist_perkey_rows_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "5"},{"label": "Минимальное среднее количество строк на ключ в правой таблице, определяющее, следует ли использовать вывод по списку строк в хеш-соединении."}]}]}/>

Минимальное среднее количество строк на ключ в правой таблице, определяющее, следует ли использовать вывод по списку строк в хеш-соединении.

## join_overflow_mode \{#join_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет действие, которое выполняет ClickHouse при достижении любого из следующих ограничений `JOIN`:

- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)
- [max_rows_in_join](/operations/settings/settings#max_rows_in_join)

Возможные значения:

- `THROW` — ClickHouse генерирует исключение и прерывает операцию.
- `BREAK` — ClickHouse прерывает операцию и не генерирует исключение.

Значение по умолчанию: `THROW`.

**См. также**

- [Оператор JOIN](/sql-reference/statements/select/join)
- [Движок таблиц Join](/engines/table-engines/special/join)

## join_runtime_bloom_filter_bytes \{#join_runtime_bloom_filter_bytes\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "524288"},{"label": "New setting"}]}]}/>

Размер в байтах фильтра Блума, используемого в качестве runtime-фильтра для JOIN (см. настройку enable_join_runtime_filters).

## join_runtime_bloom_filter_hash_functions \{#join_runtime_bloom_filter_hash_functions\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "3"},{"label": "New setting"}]}]}/>

Количество хеш-функций в фильтре Блума, используемом как runtime-фильтр для JOIN (см. настройку enable_join_runtime_filters).

## join_runtime_filter_exact_values_limit \{#join_runtime_filter_exact_values_limit\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "10000"},{"label": "New setting"}]}]}/>

Максимальное количество элементов в runtime-фильтре, которые хранятся в наборе как есть; после превышения этого порога используется Bloom-фильтр.

## join_to_sort_maximum_table_rows \{#join_to_sort_maximum_table_rows\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "10000"},{"label": "Максимальное количество строк в правой таблице для определения, нужно ли пересортировать правую таблицу по ключу при выполнении LEFT или INNER JOIN"}]}]}/>

Максимальное количество строк в правой таблице для определения, нужно ли пересортировать правую таблицу по ключу при выполнении LEFT или INNER JOIN.

## join_to_sort_minimum_perkey_rows \{#join_to_sort_minimum_perkey_rows\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="UInt64" default_value="40" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "40"},{"label": "Минимальное среднее число строк на ключ в правой таблице, используемое для определения, нужно ли пересортировать правую таблицу по ключу при LEFT JOIN или INNER JOIN. Этот параметр гарантирует, что оптимизация не применяется для разрежённых ключей таблицы"}]}]}/>

Минимальное среднее число строк на ключ в правой таблице, используемое для определения, нужно ли пересортировать правую таблицу по ключу при LEFT JOIN или INNER JOIN. Этот параметр гарантирует, что оптимизация не применяется для разрежённых ключей таблицы

## join_use_nulls \{#join_use_nulls\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Задает тип поведения операции [JOIN](../../sql-reference/statements/select/join.md). При объединении таблиц могут появляться пустые ячейки. ClickHouse заполняет их по-разному в зависимости от этой настройки.

Возможные значения:

- 0 — Пустые ячейки заполняются значением по умолчанию для соответствующего типа поля.
- 1 — `JOIN` ведет себя так же, как в стандартном SQL. Тип соответствующего поля преобразуется в [Nullable](/sql-reference/data-types/nullable), а пустые ячейки заполняются значением [NULL](/sql-reference/syntax).

## joined_block_split_single_row \{#joined_block_split_single_row\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

Позволяет разбивать результат хеш-соединения на чанки по строкам, соответствующим одной строке из левой таблицы.
Это может снизить потребление памяти в случае строки с большим количеством совпадений в правой таблице, но может увеличить нагрузку на CPU.
Обратите внимание, что условие `max_joined_block_size_rows != 0` обязательно для того, чтобы эта настройка действовала.
Параметр `max_joined_block_size_bytes` в сочетании с этой настройкой полезен для предотвращения избыточного использования памяти в случае перекошенного распределения данных, когда некоторые большие строки имеют много совпадений в правой таблице.

## joined_subquery_requires_alias \{#joined_subquery_requires_alias\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Требует указания псевдонимов для присоединённых подзапросов и табличных функций для корректной квалификации имён.

## kafka_disable_num_consumers_limit \{#kafka_disable_num_consumers_limit\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Отключает ограничение на `kafka_num_consumers`, которое зависит от количества доступных ядер CPU.

## kafka_max_wait_ms \{#kafka_max_wait_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

Время ожидания в миллисекундах при чтении сообщений из [Kafka](/engines/table-engines/integrations/kafka) перед повторной попыткой.

Возможные значения:

- Положительное целое число.
- 0 — бесконечное ожидание.

См. также:

- [Apache Kafka](https://kafka.apache.org/)

## keeper_map_strict_mode \{#keeper_map_strict_mode\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает дополнительные проверки во время операций с KeeperMap. Например, генерирует исключение при попытке вставить уже существующий ключ

## keeper_max_retries \{#keeper_max_retries\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "10"},{"label": "Максимальное количество повторных попыток для общих операций Keeper"}]}]}/>

Максимальное количество повторных попыток для общих операций Keeper

## keeper_retry_initial_backoff_ms \{#keeper_retry_initial_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "100"},{"label": "Начальный интервал ожидания (backoff) для общих операций Keeper"}]}]}/>

Начальный интервал ожидания (backoff) для общих операций Keeper

## keeper_retry_max_backoff_ms \{#keeper_retry_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "5000"},{"label": "Максимальный интервал задержки (backoff) для общих операций Keeper"}]}]}/>

Максимальный интервал задержки (backoff) для общих операций Keeper

## least_greatest_legacy_null_behavior \{#least_greatest_legacy_null_behavior\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting"}]}]}/>

Если настройка включена, функции 'least' и 'greatest' возвращают NULL, если один из их аргументов равен NULL.

## legacy_column_name_of_tuple_literal \{#legacy_column_name_of_tuple_literal\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.7"},{"label": "0"},{"label": "Добавляйте эту настройку только по причинам совместимости. Имеет смысл установить в 'true' во время rolling-обновления кластера с версии ниже 21.7 на более высокую"}]}]}/>

Выводить все имена элементов больших литералов-кортежей в именах их столбцов вместо хеша. Эта настройка существует только по причинам совместимости. Имеет смысл установить в 'true' во время rolling-обновления кластера с версии ниже 21.7 на более высокую.

## lightweight_delete_mode \{#lightweight_delete_mode\} 

<SettingsInfoBlock type="LightweightDeleteMode" default_value="alter_update" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "alter_update"},{"label": "A new setting"}]}]}/>

Режим выполнения внутреннего запроса обновления, который является частью lightweight delete.

Возможные значения:

- `alter_update` — выполнить запрос `ALTER UPDATE`, который создаёт тяжёлую мутацию.
- `lightweight_update` — выполнить lightweight update, если возможно, иначе выполнить `ALTER UPDATE`.
- `lightweight_update_force` — выполнить lightweight update, если возможно, иначе выбросить исключение.

## lightweight_deletes_sync \{#lightweight_deletes_sync\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "2"},{"label": "То же, что и 'mutations_sync', но управляет только выполнением облегчённых удалений"}]}]}/>

То же, что и [`mutations_sync`](#mutations_sync), но управляет только выполнением облегчённых удалений.

Возможные значения:

| Value | Description                                                                                                                                           |
|-------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`   | Мутации выполняются асинхронно.                                                                                                                       |
| `1`   | Запрос ожидает завершения облегчённых удалений на текущем сервере.                                                                                   |
| `2`   | Запрос ожидает завершения облегчённых удалений на всех репликах (если они существуют).                                                               |
| `3`   | Запрос ожидает завершения облегчённых удалений только на активных репликах. Поддерживается только для `SharedMergeTree`. Для `ReplicatedMergeTree` ведёт себя так же, как `mutations_sync = 2`.|

**См. также**

- [Синхронность запросов ALTER](../../sql-reference/statements/alter/index.md/#synchronicity-of-alter-queries)
- [Мутации](../../sql-reference/statements/alter/index.md/#mutations)

## limit \{#limit\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает максимальное количество строк, извлекаемых из результата запроса. Ограничивает значение, заданное оператором [LIMIT](/sql-reference/statements/select/limit), так, что лимит, указанный в запросе, не может превышать лимит, заданный этой настройкой.

Возможные значения:

- 0 — количество строк не ограничено.
- Положительное целое число.

## load_balancing \{#load_balancing\} 

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

### Случайный (по умолчанию)

```sql
load_balancing = random
```

Количество ошибок подсчитывается для каждой реплики. Запрос отправляется на реплику с наименьшим числом ошибок, а если таких несколько — на любую из них.
Недостатки: близость сервера не учитывается; если у реплик различаются данные, вы получите разные данные.


### Ближайшее имя узла

```sql
load_balancing = nearest_hostname
```

Количество ошибок подсчитывается для каждой реплики. Каждые 5 минут счётчик ошибок целочисленно делится на 2. Таким образом, количество ошибок за недавний период вычисляется с использованием экспоненциального сглаживания. Если есть одна реплика с минимальным количеством ошибок (т. е. ошибки недавно возникали на других репликах), запрос отправляется на неё. Если есть несколько реплик с одинаковым минимальным количеством ошибок, запрос отправляется на реплику с именем хоста, которое наиболее похоже на имя хоста сервера в конфигурационном файле (по количеству различающихся символов в одинаковых позициях, до минимальной длины обоих имён хостов).

Например, example01-01-1 и example01-01-2 отличаются в одной позиции, а example01-01-1 и example01-02-2 различаются в двух местах.
Этот метод может показаться примитивным, но он не требует внешних данных о сетевой топологии и не сравнивает IP-адреса, что было бы сложной задачей для наших IPv6-адресов.

Таким образом, при наличии эквивалентных реплик предпочтение отдаётся ближайшей по имени.
Можно также считать, что при отправке запроса на один и тот же сервер, при отсутствии сбоев, распределённый запрос также будет попадать на одни и те же серверы. Поэтому, даже если на репликах размещены разные данные, запрос будет возвращать в основном одинаковые результаты.


### Расстояние Левенштейна для имени хоста

```sql
load_balancing = hostname_levenshtein_distance
```

Подобно `nearest_hostname`, но сравнивает имя хоста по [расстоянию Левенштейна](https://en.wikipedia.org/wiki/Levenshtein_distance). Например:

```text
example-clickhouse-0-0 ample-clickhouse-0-0
1

example-clickhouse-0-0 example-clickhouse-1-10
2

example-clickhouse-0-0 example-clickhouse-12-0
3
```


### Последовательно

```sql
load_balancing = in_order
```

К репликам с одинаковым количеством ошибок обращаются в том же порядке, в котором они указаны в конфигурации.
Этот метод подходит, когда вы точно знаете, какая реплика является предпочтительной.


### Первый или случайный

```sql
load_balancing = first_or_random
```

Этот алгоритм выбирает первую реплику в наборе либо случайную реплику, если первая недоступна. Он эффективен в топологиях с перекрёстной репликацией, но бесполезен в других конфигурациях.

Алгоритм `first_or_random` решает проблему алгоритма `in_order`. При использовании `in_order`, если одна реплика выходит из строя, следующая получает двойную нагрузку, в то время как остальные реплики обрабатывают обычный объём трафика. При использовании алгоритма `first_or_random` нагрузка равномерно распределяется между репликами, которые всё ещё доступны.

Можно явно задать, какая реплика считается первой, с помощью настройки `load_balancing_first_offset`. Это даёт больше контроля над перераспределением нагрузки запросов между репликами.


### Циклический алгоритм (Round Robin)

```sql
load_balancing = round_robin
```

Этот алгоритм использует стратегию циклического перебора (round-robin) между репликами с одинаковым числом ошибок (учитываются только запросы со стратегией `round_robin`).


## load_balancing_first_offset \{#load_balancing_first_offset\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Какую реплику следует предпочесть для отправки запроса при использовании стратегии балансировки нагрузки FIRST_OR_RANDOM.

## load_marks_asynchronously \{#load_marks_asynchronously\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Загружать метки MergeTree асинхронно

## local_filesystem_read_method \{#local_filesystem_read_method\} 

<SettingsInfoBlock type="String" default_value="pread_threadpool" />

Метод чтения данных с локальной файловой системы, один из: read, pread, mmap, io_uring, pread_threadpool.

Метод `io_uring` является экспериментальным и не работает для Log, TinyLog, StripeLog, File, Set и Join, а также других таблиц с дописываемыми файлами при наличии одновременных операций чтения и записи.
Если вы читаете различные статьи об `io_uring` в Интернете, не поддавайтесь на красивые обещания. Это не более эффективный метод чтения файлов, за исключением случая большого количества мелких операций ввода-вывода, что не относится к ClickHouse. Нет причин включать `io_uring`.

## local_filesystem_read_prefetch \{#local_filesystem_read_prefetch\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать предварительную выборку при чтении данных из локальной файловой системы.

## lock_acquire_timeout \{#lock_acquire_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="120" />

Определяет, сколько секунд запрос на установку блокировки ожидает до завершения с ошибкой.

Таймаут блокировки используется для защиты от взаимоблокировок при выполнении операций чтения и записи с таблицами. Когда таймаут истекает и запрос блокировки завершается с ошибкой, сервер ClickHouse выбрасывает исключение "Locking attempt timed out! Possible deadlock avoided. Client should retry." с кодом ошибки `DEADLOCK_AVOIDED`.

Возможные значения:

- Положительное целое число (в секундах).
- 0 — без таймаута блокировки.

## log&#95;comment

Задает значение для поля `log_comment` таблицы [system.query&#95;log](../system-tables/query_log.md) и текст комментария для серверного лога.

Может использоваться для улучшения читаемости серверных логов. Кроме того, помогает выбрать запросы, относящиеся к тесту, из `system.query_log` после запуска [clickhouse-test](../../development/tests.md).

Возможные значения:

* Любая строка длиной не более [max&#95;query&#95;size](#max_query_size). Если это ограничение превышено, сервер генерирует исключение.

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


## log_formatted_queries \{#log_formatted_queries\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет записывать форматированные запросы в системную таблицу [system.query_log](../../operations/system-tables/query_log.md) (заполняет столбец `formatted_query` в [system.query_log](../../operations/system-tables/query_log.md)).

Возможные значения:

- 0 — Форматированные запросы не записываются в системную таблицу.
- 1 — Форматированные запросы записываются в системную таблицу.

## log_processors_profiles \{#log_processors_profiles\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Enable by default"}]}]}/>

Записывает время, потраченное процессором на выполнение и ожидание поступления данных, в таблицу `system.processors_profile_log`.

См. также:

- [`system.processors_profile_log`](../../operations/system-tables/processors_profile_log.md)
- [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md/#explain-pipeline)

## log_profile_events \{#log_profile_events\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Записывает статистику производительности запросов в `query_log`, `query_thread_log` и `query_views_log`.

## log&#95;queries

<SettingsInfoBlock type="Bool" default_value="1" />

Настройка логирования запросов.

Запросы, отправляемые в ClickHouse при такой настройке, записываются в журнал в соответствии с правилами параметра конфигурации сервера [query&#95;log](../../operations/server-configuration-parameters/settings.md/#query_log).

Пример:

```text
log_queries=1
```


## log_queries_cut_to_length \{#log_queries_cut_to_length\} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

Если длина запроса превышает заданный порог (в байтах), то запрос усекается при записи в журнал запросов. Также ограничивается длина выводимого запроса в обычном текстовом журнале.

## log_queries_min_query_duration_ms \{#log_queries_min_query_duration_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Если параметр включён (имеет ненулевое значение), запросы, которые выполняются быстрее указанного значения настройки, не будут логироваться (можно рассматривать это как аналог `long_query_time` для [MySQL Slow Query Log](https://dev.mysql.com/doc/refman/5.7/slow-query-log.html)), и это, по сути, означает, что вы не найдёте их в следующих таблицах:

- `system.query_log`
- `system.query_thread_log`

В журнал будут попадать только запросы со следующими типами:

- `QUERY_FINISH`
- `EXCEPTION_WHILE_PROCESSING`

- Тип: миллисекунды
- Значение по умолчанию: 0 (любой запрос)

## log&#95;queries&#95;min&#95;type

<SettingsInfoBlock type="LogQueriesType" default_value="QUERY_START" />

Минимальный тип событий, которые записываются в `query_log`.

Возможные значения:

* `QUERY_START` (`=1`)
* `QUERY_FINISH` (`=2`)
* `EXCEPTION_BEFORE_START` (`=3`)
* `EXCEPTION_WHILE_PROCESSING` (`=4`)

Может использоваться для ограничения того, какие события будут попадать в `query_log`. Например, если вас интересуют только ошибки, вы можете использовать `EXCEPTION_WHILE_PROCESSING`:

```text
log_queries_min_type='EXCEPTION_WHILE_PROCESSING'
```


## log_queries_probability \{#log_queries_probability\} 

<SettingsInfoBlock type="Float" default_value="1" />

Позволяет записывать в системные таблицы [query_log](../../operations/system-tables/query_log.md), [query_thread_log](../../operations/system-tables/query_thread_log.md) и [query_views_log](../../operations/system-tables/query_views_log.md) только часть запросов, случайным образом отобранных с указанной вероятностью. Это помогает снизить нагрузку при большом количестве запросов в секунду.

Возможные значения:

- 0 — Запросы не логируются в системных таблицах.
- Положительное число с плавающей запятой в диапазоне [0..1]. Например, если значение настройки `0.5`, примерно половина запросов логируется в системных таблицах.
- 1 — Все запросы логируются в системных таблицах.

## log_query_settings \{#log_query_settings\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Записывать настройки запросов в `query_log` и журнал спанов OpenTelemetry.

## log&#95;query&#95;threads

<SettingsInfoBlock type="Bool" default_value="0" />

Настройка журналирования потоков запросов.

Потоки запросов записываются в таблицу [system.query&#95;thread&#95;log](../../operations/system-tables/query_thread_log.md). Этот параметр действует только в том случае, если [log&#95;queries](#log_queries) имеет значение `true`. Потоки запросов, выполняемые ClickHouse при такой настройке, журналируются в соответствии с правилами серверного параметра конфигурации [query&#95;thread&#95;log](/operations/server-configuration-parameters/settings#query_thread_log).

Возможные значения:

* 0 — отключено.
* 1 — включено.

**Пример**

```text
log_query_threads=1
```


## log&#95;query&#95;views

<SettingsInfoBlock type="Bool" default_value="1" />

Настройка логирования представлений запросов.

Когда выполняемый в ClickHouse запрос при включённой этой настройке имеет связанные представления (материализованные или live‑представления), они записываются в журнал, задаваемый параметром конфигурации сервера [query&#95;views&#95;log](/operations/server-configuration-parameters/settings#query_views_log).

Пример:

```text
log_query_views=1
```


## low_cardinality_allow_in_native_format \{#low_cardinality_allow_in_native_format\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает или запрещает использование типа данных [LowCardinality](../../sql-reference/data-types/lowcardinality.md) с форматом [Native](/interfaces/formats/Native).

Если использование `LowCardinality` ограничено, сервер ClickHouse преобразует столбцы `LowCardinality` в обычные для запросов `SELECT` и преобразует обычные столбцы в столбцы `LowCardinality` для запросов `INSERT`.

Эта настройка требуется в основном для сторонних клиентов, которые не поддерживают тип данных `LowCardinality`.

Возможные значения:

- 1 — использование `LowCardinality` не ограничено.
- 0 — использование `LowCardinality` ограничено.

## low_cardinality_max_dictionary_size \{#low_cardinality_max_dictionary_size\} 

<SettingsInfoBlock type="UInt64" default_value="8192" />

Устанавливает максимальный размер (в строках) общего глобального словаря типа данных [LowCardinality](../../sql-reference/data-types/lowcardinality.md), который может быть сохранён в файловой системе хранилища. Этот параметр предотвращает проблемы с ОЗУ в случае неограниченного роста словаря. Все данные, которые не могут быть закодированы из‑за ограничения максимального размера словаря, ClickHouse записывает обычным способом.

Возможные значения:

- Любое положительное целое число.

## low_cardinality_use_single_dictionary_for_part \{#low_cardinality_use_single_dictionary_for_part\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает использование одного словаря для части данных.

По умолчанию сервер ClickHouse отслеживает размер словарей, и если словарь переполняется, сервер начинает записывать следующий. Чтобы запретить создание нескольких словарей, установите значение параметра `low_cardinality_use_single_dictionary_for_part = 1`.

Возможные значения:

- 1 — Создание нескольких словарей для части данных запрещено.
- 0 — Создание нескольких словарей для части данных разрешено.

## low_priority_query_wait_time_ms \{#low_priority_query_wait_time_ms\} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1000"},{"label": "New setting."}]}]}/>

Когда используется механизм приоритизации запросов (см. настройку `priority`), запросы с низким приоритетом ожидают завершения высокоприоритетных запросов. Эта настройка задаёт время ожидания.

## make_distributed_plan \{#make_distributed_plan\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Новая экспериментальная настройка."}]}]}/>

Формирует распределённый план запроса.

## materialize_skip_indexes_on_insert \{#materialize_skip_indexes_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Added new setting to allow to disable materialization of skip indexes on insert"}]}]}/>

Если настройка включена, запросы `INSERT` создают и сохраняют пропускающие индексы. Если выключена, пропускающие индексы создаются и сохраняются только [во время слияний](merge-tree-settings.md/#materialize_skip_indexes_on_merge) или с помощью явной команды [MATERIALIZE INDEX](/sql-reference/statements/alter/skipping-index.md/#materialize-index).

См. также [exclude_materialize_skip_indexes_on_insert](#exclude_materialize_skip_indexes_on_insert).

## materialize_statistics_on_insert \{#materialize_statistics_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Добавлена новая настройка, позволяющая отключить материализацию статистики при вставке"}]}]}/>

При включённой настройке операции `INSERT` вычисляют и записывают статистику. При отключении статистика будет вычисляться и сохраняться во время слияний или явным вызовом `MATERIALIZE STATISTICS`.

## materialize_ttl_after_modify \{#materialize_ttl_after_modify\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Применять TTL к старым данным после выполнения запроса ALTER MODIFY TTL

## materialized_views_ignore_errors \{#materialized_views_ignore_errors\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет игнорировать ошибки для MATERIALIZED VIEW и отправлять исходный блок в таблицу независимо от материализованных представлений.

## materialized_views_squash_parallel_inserts \{#materialized_views_squash_parallel_inserts\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "Добавлена настройка для сохранения старого поведения при необходимости."}]}]}/>

Объединяет результаты параллельных вставок в таблицу назначения материализованного представления в рамках одного запроса INSERT, чтобы уменьшить количество создаваемых частей.
Если значение — false и `parallel_view_processing` включён, запрос INSERT будет создавать отдельную часть в таблице назначения для каждого `max_insert_thread`.

## max_analyze_depth \{#max_analyze_depth\} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

Максимальное количество операций анализа, выполняемых интерпретатором.

## max_ast_depth \{#max_ast_depth\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальная глубина вложенности синтаксического дерева запроса. При превышении этого значения выбрасывается исключение.

:::note
В настоящее время это не проверяется во время разбора, а только после разбора запроса.
Это означает, что во время разбора может быть создано слишком глубокое синтаксическое дерево,
но выполнение запроса завершится ошибкой.
:::

## max_ast_elements \{#max_ast_elements\} 

<SettingsInfoBlock type="UInt64" default_value="50000" />

Максимальное количество элементов в синтаксическом дереве запроса. При превышении этого значения выбрасывается исключение.

:::note
В данный момент проверка не выполняется во время парсинга, а только после разбора запроса.
Это означает, что во время парсинга может быть создано слишком глубокое синтаксическое дерево,
но выполнение запроса завершится с ошибкой.
:::

## max_autoincrement_series \{#max_autoincrement_series\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "A new setting"}]}]}/>

Ограничение на количество серий, создаваемых функцией `generateSerialID`.

Поскольку каждая серия соответствует отдельному узлу в Keeper, рекомендуется иметь не более пары миллионов таких серий.

## max_backup_bandwidth \{#max_backup_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость чтения в байтах в секунду для конкретной резервной копии на сервере. Ноль означает отсутствие ограничений.

## max_block_size \{#max_block_size\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

В ClickHouse данные обрабатываются блоками, представляющими собой наборы частей столбцов. Внутренние циклы обработки одного блока эффективны, но при обработке каждого блока есть заметные накладные расходы.

Настройка `max_block_size` задаёт рекомендуемое максимальное число строк в одном блоке при загрузке данных из таблиц. Блоки размера `max_block_size` загружаются из таблицы не всегда: если ClickHouse определяет, что нужно извлечь меньше данных, обрабатывается меньший блок.

Размер блока не должен быть слишком маленьким, чтобы избежать заметных накладных расходов при обработке каждого блока. Он также не должен быть слишком большим, чтобы запросы с оператором LIMIT выполнялись быстро после обработки первого блока. При выборе значения `max_block_size` следует стремиться к тому, чтобы не допустить чрезмерного расхода памяти при извлечении большого числа столбцов в нескольких потоках и сохранить хотя бы некоторую локальность кэша.

## max_bytes_before_external_group_by \{#max_bytes_before_external_group_by\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Значение по умолчанию в Cloud: половина объёма памяти на реплику.

Включает или отключает выполнение операций `GROUP BY` во внешней памяти.
(См. [GROUP BY во внешней памяти](/sql-reference/statements/select/group-by#group-by-in-external-memory))

Возможные значения:

- Максимальный объём оперативной памяти (в байтах), который может быть использован одной операцией [GROUP BY](/sql-reference/statements/select/group-by).
- `0` — `GROUP BY` во внешней памяти отключён.

:::note
Если использование памяти при операциях `GROUP BY` превышает этот порог в байтах,
включается режим внешней агрегации (данные сбрасываются на диск).

Рекомендуемое значение — половина доступной системной памяти.
:::

## max_bytes_before_external_sort \{#max_bytes_before_external_sort\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Значение по умолчанию в Cloud: половина объёма памяти на реплику.

Включает или отключает выполнение предложений `ORDER BY` во внешней памяти. См. [ORDER BY Implementation Details](../../sql-reference/statements/select/order-by.md#implementation-details).
Если использование памяти во время операции `ORDER BY` превышает данный порог в байтах, активируется режим «external sorting» (сброс данных на диск).

Возможные значения:

- Максимальный объём ОЗУ (в байтах), который может быть использован одной операцией [ORDER BY](../../sql-reference/statements/select/order-by.md).
  Рекомендуемое значение — половина доступной системной памяти.
- `0` — `ORDER BY` во внешней памяти отключён.

## max_bytes_before_remerge_sort \{#max_bytes_before_remerge_sort\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

В случае ORDER BY с LIMIT, когда использование памяти превышает указанный порог, выполняются дополнительные этапы слияния блоков перед финальным слиянием, чтобы сохранить только первые LIMIT строк.

## max_bytes_in_distinct \{#max_bytes_in_distinct\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объём памяти в байтах для хранения состояния (в несжатом виде), который
используется хеш-таблицей при выполнении DISTINCT.

## max_bytes_in_join \{#max_bytes_in_join\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер в байтах хеш-таблицы, используемой при объединении таблиц.

Этот параметр применяется к операциям [SELECT ... JOIN](/sql-reference/statements/select/join)
и к [движку таблиц Join](/engines/table-engines/special/join).

Если запрос содержит JOIN, ClickHouse проверяет эту настройку для каждого промежуточного результата.

При достижении лимита ClickHouse может выполнить различные действия. Используйте
настройку [join_overflow_mode](/operations/settings/settings#join_overflow_mode), чтобы выбрать действие.

Возможные значения:

- Положительное целое число.
- 0 — контроль памяти отключен.

## max_bytes_in_set \{#max_bytes_in_set\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт (несжатых данных), используемых множеством в операторе IN,
сформированном на основе подзапроса.

## max_bytes_ratio_before_external_group_by \{#max_bytes_ratio_before_external_group_by\} 

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "Включить автоматический сброс на диск по умолчанию."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Доля доступной памяти, которую можно использовать для `GROUP BY`. После достижения этого значения для агрегации используется внешняя память.

Например, если указано `0.6`, `GROUP BY` сможет использовать 60% доступной памяти
(для сервера/пользователя/слияний) в начале выполнения, после чего
начнет использовать внешнюю агрегацию.

## max_bytes_ratio_before_external_sort \{#max_bytes_ratio_before_external_sort\} 

<SettingsInfoBlock type="Double" default_value="0.5" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0.5"},{"label": "Автоматическая выгрузка на диск включена по умолчанию."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Доля доступной памяти, которую разрешено использовать для `ORDER BY`. После достижения этого порога используется внешняя сортировка.

Например, если указано значение `0.6`, `ORDER BY` сможет использовать `60%` доступной памяти (для сервера/пользователя/слияний) в начале выполнения, после чего начнет использовать внешнюю сортировку.

Обратите внимание, что `max_bytes_before_external_sort` по‑прежнему учитывается: выгрузка на диск будет выполняться только в том случае, если блок сортировки больше, чем `max_bytes_before_external_sort`.

## max_bytes_to_read \{#max_bytes_to_read\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт (несжатых данных), которое можно прочитать из таблицы при выполнении запроса.
Ограничение проверяется для каждого обрабатываемого фрагмента данных, применяется только к
наиболее глубоко вложенному табличному выражению и при чтении с удалённого сервера проверяется только на
этом удалённом сервере.

## max_bytes_to_read_leaf \{#max_bytes_to_read_leaf\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт (несжатых данных), которое можно прочитать из локальной
таблицы на leaf-узле при выполнении распределённого запроса. Хотя распределённые запросы
могут отправлять несколько подзапросов каждому шарду (leaf), это ограничение
проверяется только на этапе чтения на leaf-узлах и игнорируется на этапе
слияния результатов на корневом узле.

Например, кластер состоит из 2 шардов, и каждый шард содержит таблицу со
100 байтами данных. Распределённый запрос, который должен прочитать все данные
из обеих таблиц с параметром `max_bytes_to_read=150`, завершится с ошибкой, так как всего
будет прочитано 200 байт. Запрос с `max_bytes_to_read_leaf=150` завершится успешно, поскольку
leaf-узлы прочитают максимум по 100 байт.

Ограничение проверяется для каждого обрабатываемого фрагмента данных.

:::note
Эта настройка ведёт себя нестабильно при `prefer_localhost_replica=1`.
:::

## max_bytes_to_sort \{#max_bytes_to_sort\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт до начала сортировки. Если для операции ORDER BY требуется обработать больше несжатых байт, чем указано в этом параметре, поведение будет определяться настройкой `sort_overflow_mode`, которая по умолчанию имеет значение `throw`.

## max_bytes_to_transfer \{#max_bytes_to_transfer\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт (несжатых данных), которое может быть передано на удалённый сервер или сохранено во временной таблице при выполнении части запроса GLOBAL IN/JOIN.

## max_columns_to_read \{#max_columns_to_read\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество столбцов, которое можно прочитать из таблицы в одном запросе.
Если запрос требует чтения большего числа столбцов, чем указано, выбрасывается исключение.

:::tip
Этот параметр полезен для предотвращения чрезмерно сложных запросов.
:::

Значение `0` означает отсутствие ограничения.

## max_compress_block_size \{#max_compress_block_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Максимальный размер блоков несжатых данных перед сжатием при записи в таблицу. По умолчанию — 1 048 576 (1 MiB). Указание меньшего размера блока, как правило, приводит к незначительному снижению степени сжатия, небольшому увеличению скорости сжатия и распаковки за счёт локальности кэша и снижению потребления памяти.

:::note
Это настройка экспертного уровня, и вам не следует менять её, если вы только начинаете работать с ClickHouse.
:::

Не путайте блоки для сжатия (область памяти, состоящая из байт) с блоками для обработки запросов (набор строк из таблицы).

## max&#95;concurrent&#95;queries&#95;for&#95;all&#95;users

<SettingsInfoBlock type="UInt64" default_value="0" />

Выбрасывает исключение, если значение этой настройки меньше или равно текущему количеству одновременно обрабатываемых запросов.

Пример: `max_concurrent_queries_for_all_users` может быть установлено равным 99 для всех пользователей, а администратор базы данных может установить его равным 100 для себя, чтобы запускать запросы для диагностики даже при перегрузке сервера.

Изменение настройки для одного запроса или пользователя не влияет на другие запросы.

Возможные значения:

* Положительное целое число.
* 0 — без ограничений.

**Пример**

```xml
<max_concurrent_queries_for_all_users>99</max_concurrent_queries_for_all_users>
```

**См. также**

* [max&#95;concurrent&#95;queries](/operations/server-configuration-parameters/settings#max_concurrent_queries)


## max&#95;concurrent&#95;queries&#95;for&#95;user

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество одновременно обрабатываемых запросов для одного пользователя.

Возможные значения:

* Положительное целое число.
* 0 — без ограничения.

**Пример**

```xml
<max_concurrent_queries_for_user>5</max_concurrent_queries_for_user>
```


## max_distributed_connections \{#max_distributed_connections\} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

Максимальное количество одновременных подключений к удалённым серверам для распределённой обработки одного запроса к одной таблице типа Distributed. Рекомендуется задавать значение не меньше количества серверов в кластере.

Следующие параметры используются только при создании таблиц типа Distributed (и при запуске сервера), поэтому нет причин изменять их во время работы сервера.

## max_distributed_depth \{#max_distributed_depth\} 

<SettingsInfoBlock type="UInt64" default_value="5" />

Ограничивает максимальную глубину рекурсивных запросов для таблиц [Distributed](../../engines/table-engines/special/distributed.md).

Если предел превышен, сервер генерирует исключение.

Возможные значения:

- Положительное целое число.
- 0 — неограниченная глубина.

## max_download_buffer_size \{#max_download_buffer_size\} 

<SettingsInfoBlock type="UInt64" default_value="10485760" />

Максимальный размер буфера для параллельной загрузки (например, для движка URL) для каждого потока.

## max_download_threads \{#max_download_threads\} 

<SettingsInfoBlock type="MaxThreads" default_value="4" />

Максимальное число потоков, используемых для загрузки данных (например, в движке URL).

## max_estimated_execution_time \{#max_estimated_execution_time\} 

<SettingsInfoBlock type="Seconds" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Разделены max_execution_time и max_estimated_execution_time"}]}]}/>

Максимальное оценочное время выполнения запроса в секундах. Проверяется для каждого блока данных, когда истекает тайм-аут [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed).

## max_execution_speed \{#max_execution_speed\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество обрабатываемых строк в секунду. Проверяется на каждом блоке данных, когда истекает значение
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed).
Если фактическая скорость выполнения слишком высока, она будет снижена.

## max_execution_speed_bytes \{#max_execution_speed_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество байт, обрабатываемых в секунду. Проверяется для каждого блока данных, когда истекает значение настройки
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed).
Если скорость выполнения слишком высока, она будет снижена.

## max_execution_time \{#max_execution_time\} 

<SettingsInfoBlock type="Seconds" default_value="0" />

Максимальное время выполнения запроса в секундах.

Параметр `max_execution_time` может быть немного сложен для понимания.
Он работает на основе интерполяции относительно текущей скорости выполнения запроса
(это поведение контролируется настройкой [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)).

ClickHouse прерывает запрос, если прогнозируемое время выполнения превышает
указанное значение `max_execution_time`. По умолчанию `timeout_before_checking_execution_speed`
равен 10 секундам. Это означает, что через 10 секунд выполнения запроса ClickHouse
начинает оценивать общее время выполнения. Если, например, `max_execution_time`
установлен на 3600 секунд (1 час), ClickHouse завершит запрос, если оценочное
время превысит этот лимит в 3600 секунд. Если установить `timeout_before_checking_execution_speed`
в 0, ClickHouse будет использовать время по часам как основу для `max_execution_time`.

Если время выполнения запроса превышает заданное количество секунд, поведение будет
определяться параметром `timeout_overflow_mode`, который по умолчанию имеет значение `throw`.

:::note
Таймаут проверяется, и запрос может быть остановлен только в определённых местах во время обработки данных.
В данный момент он не может быть остановлен во время слияния состояний агрегации или во время анализа запроса,
поэтому фактическое время выполнения будет больше значения этой настройки.
:::

## max&#95;execution&#95;time&#95;leaf

<SettingsInfoBlock type="Seconds" default_value="0" />

Семантически похож на [`max_execution_time`](#max_execution_time), но
применяется только на листовых узлах для распределённых или удалённых запросов.

Например, если мы хотим ограничить время выполнения на листовом узле до `10s`,
но не ограничивать его на начальном узле, вместо использования `max_execution_time`
в настройках вложенного подзапроса:

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t SETTINGS max_execution_time = 10));
```

В качестве настройки запроса можно использовать `max_execution_time_leaf`:

```sql
SELECT count()
FROM cluster(cluster, view(SELECT * FROM t)) SETTINGS max_execution_time_leaf = 10;
```


## max_expanded_ast_elements \{#max_expanded_ast_elements\} 

<SettingsInfoBlock type="UInt64" default_value="500000" />

Максимальный размер синтаксического дерева запроса в количестве узлов после раскрытия алиасов и звёздочки.

## max_fetch_partition_retries_count \{#max_fetch_partition_retries_count\} 

<SettingsInfoBlock type="UInt64" default_value="5" />

Количество повторных попыток при получении партиции с другого хоста.

## max_final_threads \{#max_final_threads\} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

Устанавливает максимальное количество параллельных потоков для фазы чтения данных запроса `SELECT` с модификатором [FINAL](/sql-reference/statements/select/from#final-modifier).

Возможные значения:

- Положительное целое число.
- 0 или 1 — отключено. Запросы `SELECT` выполняются в одном потоке.

## max_http_get_redirects \{#max_http_get_redirects\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное число допустимых переходов при HTTP GET‑редиректах. Обеспечивает дополнительные меры безопасности, предотвращая перенаправление ваших запросов на неожиданные сервисы со стороны вредоносного сервера.\n\nРассмотрим случай, когда внешний сервер перенаправляет на другой адрес, но этот адрес оказывается внутренним для инфраструктуры компании, и, отправляя HTTP‑запрос на внутренний сервер, вы можете обратиться к внутреннему API из внутренней сети, обходя аутентификацию, или даже выполнять запросы к другим сервисам, таким как Redis или Memcached. Когда у вас нет внутренней инфраструктуры (включая что‑либо, работающее на вашем localhost), или вы доверяете серверу, разрешить редиректы безопасно. Имейте в виду, что если URL использует HTTP вместо HTTPS, вам придется доверять не только удаленному серверу, но также вашему интернет‑провайдеру и каждой промежуточной сети.

## max&#95;hyperscan&#95;regexp&#95;length

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
Исключение: Длина регулярного выражения слишком велика.
```

**См. также**

* [max&#95;hyperscan&#95;regexp&#95;total&#95;length](#max_hyperscan_regexp_total_length)


## max&#95;hyperscan&#95;regexp&#95;total&#95;length

<SettingsInfoBlock type="UInt64" default_value="0" />

Задает максимально допустимую суммарную длину всех регулярных выражений в каждой [multi-match функции Hyperscan](/sql-reference/functions/string-search-functions#multiMatchAny).

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
Исключение: Общая длина регулярных выражений слишком велика.
```

**См. также**

* [max&#95;hyperscan&#95;regexp&#95;length](#max_hyperscan_regexp_length)


## max_insert_block_size \{#max_insert_block_size\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048449" />

Размер блоков (в количестве строк), формируемых для вставки в таблицу.
Этот параметр применяется только в случаях, когда блоки формирует сервер.
Например, при выполнении INSERT через HTTP-интерфейс сервер парсит формат данных и формирует блоки указанного размера.
Но при использовании clickhouse-client клиент парсит данные самостоятельно, и настройка `max_insert_block_size` на сервере не влияет на размер вставляемых блоков.
Этот параметр также не используется при INSERT SELECT, так как данные вставляются теми же блоками, которые формируются после SELECT.

Значение по умолчанию немного больше, чем `max_block_size`. Причина в том, что некоторые движки таблиц (`*MergeTree`) формируют на диске часть данных для каждого вставленного блока, которая сама по себе является довольно крупной сущностью. Аналогично, таблицы `*MergeTree` сортируют данные при вставке, и достаточно большой размер блока позволяет отсортировать больше данных в оперативной памяти.

## max_insert_delayed_streams_for_parallel_write \{#max_insert_delayed_streams_for_parallel_write\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество потоков (столбцов), для которых откладывается окончательная запись части данных. Значение по умолчанию — auto (100, если используемое хранилище поддерживает параллельную запись, например S3, и 0 — отключено — в противном случае).

## max_insert_threads \{#max_insert_threads\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество потоков для выполнения запроса `INSERT SELECT`.

Возможные значения:

- 0 (или 1) — `INSERT SELECT` без параллельного выполнения.
- Положительное целое число, больше 1.

Значение по умолчанию в Cloud:

- `1` для узлов с 8 GiB памяти
- `2` для узлов с 16 GiB памяти
- `4` для более крупных узлов

Параллельное выполнение `INSERT SELECT` даёт эффект только в том случае, если часть `SELECT` выполняется параллельно, см. настройку [`max_threads`](#max_threads).
Более высокие значения приводят к большему потреблению памяти.

## max_joined_block_size_bytes \{#max_joined_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "4194304"},{"label": "New setting"}]}]}/>

Максимальный размер блока в байтах для результата операции JOIN (если используемый алгоритм JOIN поддерживает это). Значение 0 означает отсутствие ограничения.

## max_joined_block_size_rows \{#max_joined_block_size_rows\} 

<SettingsInfoBlock type="UInt64" default_value="65409" />

Максимальный размер блока для результата JOIN (если алгоритм соединения его поддерживает). 0 — без ограничений.

## max_limit_for_vector_search_queries \{#max_limit_for_vector_search_queries\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1000"},{"label": "New setting"}]}]}/>

SELECT-запросы с LIMIT, превышающим значение этой настройки, не могут использовать индексы векторного сходства. Это помогает предотвратить переполнение памяти в индексах векторного сходства.

## max_local_read_bandwidth \{#max_local_read_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость локального чтения в байтах в секунду.

## max_local_write_bandwidth \{#max_local_write_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость локальных операций записи, в байтах в секунду.

## max_memory_usage \{#max_memory_usage\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Значение по умолчанию в Cloud: зависит от объёма оперативной памяти на реплике.

Максимальный объём оперативной памяти, который может быть использован для выполнения одного запроса на одном сервере.
Значение `0` означает отсутствие ограничения.

Этот параметр не учитывает объём доступной памяти или общий объём
памяти на машине. Ограничение применяется к одному запросу на
одном сервере.

Вы можете использовать `SHOW PROCESSLIST`, чтобы увидеть текущее потребление памяти для каждого запроса.
Пиковое потребление памяти отслеживается для каждого запроса и записывается в журнал.

Потребление памяти не полностью отслеживается для состояний следующих агрегатных функций
с аргументами типов `String` и `Array`:

- `min`
- `max`
- `any`
- `anyLast`
- `argMin`
- `argMax`

Потребление памяти также ограничивается параметрами [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)
и [`max_server_memory_usage`](/operations/server-configuration-parameters/settings#max_server_memory_usage).

## max&#95;memory&#95;usage&#95;for&#95;user

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объём оперативной памяти, используемый для выполнения запросов пользователя на одном сервере. Ноль означает отсутствие ограничений.

По умолчанию объём не ограничен (`max_memory_usage_for_user = 0`).

См. также описание [`max_memory_usage`](/operations/settings/settings#max_memory_usage).

Например, если вы хотите установить значение `max_memory_usage_for_user` равным 1000 байт для пользователя с именем `clickhouse_read`, вы можете выполнить следующий запрос:

```sql
ALTER USER clickhouse_read SETTINGS max_memory_usage_for_user = 1000;
```

Вы можете убедиться, что всё работает, выйдя из клиента, снова войдя в него, а затем вызвав функцию `getSetting`:

```sql
SELECT getSetting('max_memory_usage_for_user');
```


## max_network_bandwidth \{#max_network_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает скорость обмена данными по сети в байтах в секунду. Этот параметр применяется для каждого запроса.

Возможные значения:

- Положительное целое число.
- 0 — ограничение пропускной способности отключено.

## max_network_bandwidth_for_all_users \{#max_network_bandwidth_for_all_users\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает скорость обмена данными по сети в байтах в секунду. Этот параметр применяется ко всем одновременно выполняющимся на сервере запросам.

Возможные значения:

- Положительное целое число.
- 0 — управление скоростью передачи данных отключено.

## max_network_bandwidth_for_user \{#max_network_bandwidth_for_user\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает скорость обмена данными по сети в байтах в секунду. Этот параметр применяется ко всем одновременно выполняющимся запросам одного пользователя.

Возможные значения:

- Положительное целое число.
- 0 — контроль скорости передачи данных отключён.

## max_network_bytes \{#max_network_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает объём данных (в байтах), которые передаются или принимаются по сети при выполнении запроса. Этот параметр применяется к каждому отдельному запросу.

Возможные значения:

- Положительное целое число.
- 0 — контроль объёма данных отключён.

## max_number_of_partitions_for_independent_aggregation \{#max_number_of_partitions_for_independent_aggregation\} 

<SettingsInfoBlock type="UInt64" default_value="128" />

Максимальное количество партиций таблицы, к которым может быть применена оптимизация

## max_os_cpu_wait_time_ratio_to_throw \{#max_os_cpu_wait_time_ratio_to_throw\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Значения настройки были изменены и задним числом применены в 25.4"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Максимальное отношение между временем ожидания CPU в ОС (метрика OSCPUWaitMicroseconds) и временем занятости (метрика OSCPUVirtualTimeMicroseconds), при котором запросы могут отклоняться. Для вычисления вероятности используется линейная интерполяция между минимальным и максимальным значениями этого отношения, причём при максимальном значении вероятность равна 1.

## max_parallel_replicas \{#max_parallel_replicas\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "По умолчанию используется до 1000 параллельных реплик."}]}]}/>

Максимальное количество реплик для каждого шарда при выполнении запроса.

Возможные значения:

- Положительное целое число.

**Дополнительная информация**

Эта настройка может приводить к разным результатам в зависимости от других используемых настроек.

:::note
Эта настройка приведёт к некорректным результатам, когда задействованы операторы JOIN или подзапросы и не все таблицы удовлетворяют определённым требованиям. Подробнее см. раздел [Распределённые подзапросы и max_parallel_replicas](/operations/settings/settings#max_parallel_replicas).
:::

### Параллельная обработка с использованием ключа выборки `SAMPLE`

Запрос может выполняться быстрее, если его выполнять параллельно на нескольких серверах. Однако производительность запроса может ухудшиться в следующих случаях:

- Положение ключа выборки в ключе партиционирования не позволяет эффективно выполнять сканирование диапазонов.
- Добавление ключа выборки в таблицу делает фильтрацию по другим столбцам менее эффективной.
- Ключ выборки представляет собой выражение, вычисление которого требует значительных ресурсов.
- Распределение задержек в кластере имеет «длинный хвост», поэтому опрос большего числа серверов увеличивает суммарную задержку выполнения запроса.

### Параллельная обработка с использованием [parallel_replicas_custom_key](#parallel_replicas_custom_key)

Эта настройка полезна для любой реплицируемой таблицы.

## max_parser_backtracks \{#max_parser_backtracks\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000000"},{"label": "Ограничение сложности разбора"}]}]}/>

Максимальное число возвратов парсера (сколько раз он пробует различные варианты в процессе рекурсивного нисходящего разбора).

## max_parser_depth \{#max_parser_depth\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Ограничивает максимальную глубину рекурсии в рекурсивном нисходящем парсере. Позволяет контролировать размер стека.

Возможные значения:

- Положительное целое число.
- 0 — глубина рекурсии не ограничена.

## max_parsing_threads \{#max_parsing_threads\} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "0"},{"label": "Добавлена отдельная настройка для управления количеством потоков при параллельном разборе данных из файлов"}]}]}/>

Максимальное количество потоков для разбора данных во входных форматах, поддерживающих параллельный разбор. По умолчанию значение определяется автоматически.

## max_partition_size_to_drop \{#max_partition_size_to_drop\} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

Ограничение на удаление партиций при выполнении запроса. Значение `0` означает, что вы можете удалять партиции без каких-либо ограничений.

Значение по умолчанию в облаке: 1 ТБ.

:::note
Эта настройка запроса переопределяет эквивалентную настройку сервера, см. [max_partition_size_to_drop](/operations/server-configuration-parameters/settings#max_partition_size_to_drop)
:::

## max_partitions_per_insert_block \{#max_partitions_per_insert_block\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "19.5"},{"label": "100"},{"label": "Add a limit for the number of partitions in one block"}]}]}/>

Ограничивает максимальное количество партиций в одном вставляемом блоке;
если блок содержит слишком много партиций, выбрасывается исключение.

- Положительное целое число.
- `0` — неограниченное количество партиций.

**Подробности**

При вставке данных ClickHouse вычисляет количество партиций во
вставляемом блоке. Если количество партиций больше,
чем `max_partitions_per_insert_block`, ClickHouse либо записывает
предупреждение в лог, либо выбрасывает исключение в зависимости от
`throw_on_max_partitions_per_insert_block`. Текст исключений следующий:

> "Too many partitions for a single INSERT block (`partitions_count` partitions, limit is " + toString(max_partitions) + ").
  The limit is controlled by the 'max_partitions_per_insert_block' setting.
  A large number of partitions is a common misconception. It will lead to severe
  negative performance impact, including slow server startup, slow INSERT queries
  and slow SELECT queries. Recommended total number of partitions for a table is
  under 1000..10000. Please note, that partitioning is not intended to speed up
  SELECT queries (ORDER BY key is sufficient to make range queries fast).
  Partitions are intended for data manipulation (DROP PARTITION, etc)."

:::note
Этот параметр служит предохранительным порогом, поскольку использование большого количества партиций — распространённое заблуждение.
:::

## max_partitions_to_read \{#max_partitions_to_read\} 

<SettingsInfoBlock type="Int64" default_value="-1" />

Ограничивает максимальное количество партиций, к которым можно получить доступ в одном запросе.

Значение настройки, указанное при создании таблицы, может быть переопределено на уровне запроса.

Возможные значения:

- Положительное целое число
- `-1` — без ограничений (по умолчанию)

:::note
Вы также можете указать настройку MergeTree [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read) в настройках таблицы.
:::

## max_parts_to_move \{#max_parts_to_move\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "1000"},{"label": "New setting"}]}]}/>

Ограничивает количество частей, которые могут быть перемещены в одном запросе. Нулевое значение снимает ограничение.

## max_projection_rows_to_use_projection_index \{#max_projection_rows_to_use_projection_index\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "New setting"}]}]}/>

Если количество строк, считываемых из индекса проекции, меньше или равно этому порогу, ClickHouse попытается использовать индекс проекции при выполнении запроса.

## max_query_size \{#max_query_size\} 

<SettingsInfoBlock type="UInt64" default_value="262144" />

Максимальное количество байт в строке запроса, анализируемой SQL-парсером.
Данные в предложении VALUES запросов INSERT обрабатываются отдельным потоковым парсером (который потребляет O(1) оперативной памяти) и не подпадают под это ограничение.

:::note
`max_query_size` не может быть задан внутри SQL-запроса (например, `SELECT now() SETTINGS max_query_size=10000`), потому что ClickHouse должен выделить буфер для разбора запроса, и размер этого буфера определяется настройкой `max_query_size`, которая должна быть задана до выполнения запроса.
:::

## max_read_buffer_size \{#max_read_buffer_size\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="1048576" />

Максимальный размер буфера при чтении из файловой системы.

## max_read_buffer_size_local_fs \{#max_read_buffer_size_local_fs\} 

<SettingsInfoBlock type="UInt64" default_value="131072" />

Максимальный размер буфера для чтения из локальной файловой системы. Если установлено значение 0, используется значение max_read_buffer_size.

## max_read_buffer_size_remote_fs \{#max_read_buffer_size_remote_fs\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер буфера чтения из удалённой файловой системы. Если установлено значение 0, будет использоваться `max_read_buffer_size`.

## max_recursive_cte_evaluation_depth \{#max_recursive_cte_evaluation_depth\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1000"},{"label": "Максимальная глубина вычисления рекурсивного CTE"}]}]}/>

Максимальная глубина вычисления рекурсивного CTE

## max_remote_read_network_bandwidth \{#max_remote_read_network_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость чтения данных по сети, в байтах в секунду.

## max_remote_write_network_bandwidth \{#max_remote_write_network_bandwidth\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость сетевого обмена данными при записи (в байтах в секунду).

## max_replica_delay_for_distributed_queries \{#max_replica_delay_for_distributed_queries\} 

<SettingsInfoBlock type="UInt64" default_value="300" />

Отключает использование отстающих реплик при выполнении распределённых запросов. См. раздел [Replication](../../engines/table-engines/mergetree-family/replication.md).

Задаёт время в секундах. Если отставание реплики больше либо равно заданному значению, эта реплика не используется.

Возможные значения:

- Положительное целое число.
- 0 — отставание реплик не проверяется.

Чтобы исключить использование любой реплики с ненулевым отставанием, установите этот параметр в 1.

Используется при выполнении `SELECT` из распределённой таблицы, которая ссылается на реплицируемые таблицы.

## max_result_bytes \{#max_result_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает размер результата в байтах (в несжатом виде). Запрос будет остановлен после обработки блока данных, если порог достигнут,
но последний блок результата не будет обрезан, поэтому размер результата может быть больше порогового значения.

**Особенности**

При вычислении этого порога учитывается размер результата в памяти.
Даже если результат небольшой, он может ссылаться на более крупные структуры данных в памяти,
такие как словари для столбцов LowCardinality и «арены» для столбцов AggregateFunction,
поэтому порог может быть превышен, несмотря на небольшой размер результата.

:::warning
Настройка достаточно низкоуровневая и должна использоваться с осторожностью
:::

## max_result_rows \{#max_result_rows\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Значение по умолчанию в Cloud: `0`.

Ограничивает количество строк в результате. Также проверяется для подзапросов и на удалённых серверах при выполнении фрагментов распределённого запроса.
Если значение равно `0`, ограничение не применяется.

Запрос будет остановлен после обработки блока данных при достижении порога, но последний блок результата не будет усечён, поэтому размер результата может быть больше порогового значения.

## max_reverse_dictionary_lookup_cache_size_bytes \{#max_reverse_dictionary_lookup_cache_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "104857600"},{"label": "Новая настройка. Максимальный размер в байтах кэша обратного поиска по словарю на уровне отдельного запроса, используемого функцией `dictGetKeys`. Кэш хранит сериализованные кортежи ключей для каждого значения атрибута, чтобы избежать повторного сканирования словаря в рамках одного и того же запроса."}]}]}/>

Максимальный размер в байтах кэша обратного поиска по словарю на уровне отдельного запроса, используемого функцией `dictGetKeys`. Кэш хранит сериализованные кортежи ключей для каждого значения атрибута, чтобы избежать повторного сканирования словаря в рамках одного и того же запроса. При достижении лимита элементы вытесняются по принципу LRU. Установите 0, чтобы отключить кэширование.

## max_rows_in_distinct \{#max_rows_in_distinct\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество различных строк при использовании DISTINCT.

## max_rows_in_join \{#max_rows_in_join\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает количество строк в хеш-таблице, которая используется при выполнении операций объединения таблиц.

Этот параметр применяется к операциям [SELECT ... JOIN](/sql-reference/statements/select/join)
и к движку таблиц [Join](/engines/table-engines/special/join).

Если запрос содержит несколько операций JOIN, ClickHouse проверяет эту настройку для каждого промежуточного результата.

Когда предел достигнут, ClickHouse может выполнить различные действия. Используйте настройку
[`join_overflow_mode`](/operations/settings/settings#join_overflow_mode), чтобы выбрать действие.

Возможные значения:

- Положительное целое число.
- `0` — неограниченное количество строк.

## max_rows_in_set \{#max_rows_in_set\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное число строк в наборе данных в выражении IN, сформированном подзапросом.

## max_rows_in_set_to_optimize_join \{#max_rows_in_set_to_optimize_join\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Отключение оптимизации JOIN, так как она мешает оптимизации чтения в порядке сортировки"}]}]}/>

Максимальный размер множества, используемого для фильтрации объединяемых таблиц по наборам строк друг друга перед выполнением соединения.

Возможные значения:

- 0 — отключить.
- Любое положительное целое число.

## max_rows_to_group_by \{#max_rows_to_group_by\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество уникальных ключей, полученных в результате агрегирования. Этот параметр позволяет ограничить потребление памяти при выполнении агрегации.

Если при агрегировании с `GROUP BY` генерируется больше строк (уникальных ключей `GROUP BY`), чем указано в настройке, поведение будет определяться параметром `group_by_overflow_mode`, который по умолчанию имеет значение `throw`, но может быть также переключён в режим приблизительного `GROUP BY`.

## max_rows_to_read \{#max_rows_to_read\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество строк, которое может быть прочитано из таблицы при выполнении запроса.
Ограничение проверяется для каждого обрабатываемого блока данных, применяется только к
наиболее глубоко вложенному табличному выражению, а при чтении с удалённого сервера — только на
этом удалённом сервере.

## max_rows_to_read_leaf \{#max_rows_to_read_leaf\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество строк, которое может быть прочитано из локальной таблицы на листовом узле при выполнении распределённого запроса. Хотя распределённые запросы могут отправлять несколько подзапросов на каждый шард (лист), этот лимит будет проверяться только на стадии чтения на листовых узлах и игнорироваться на стадии слияния результатов на корневом узле.

Например, кластер состоит из 2 шардов, и каждый шард содержит таблицу со 100 строками. Распределённый запрос, который должен прочитать все данные из обеих таблиц с настройкой `max_rows_to_read=150`, завершится ошибкой, так как в сумме будет 200 строк. Запрос с `max_rows_to_read_leaf=150` выполнится успешно, поскольку листовые узлы прочитают максимум по 100 строк.

Ограничение проверяется для каждой обрабатываемой порции данных.

:::note
Эта настройка ведёт себя нестабильно при `prefer_localhost_replica=1`.
:::

## max_rows_to_sort \{#max_rows_to_sort\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество строк перед сортировкой. Позволяет ограничить потребление памяти при сортировке.
Если для операции ORDER BY требуется обработать больше записей, чем указано,
поведение будет определяться настройкой `sort_overflow_mode`, которая по умолчанию имеет значение `throw`.

## max_rows_to_transfer \{#max_rows_to_transfer\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер (в строках), который может быть передан на удалённый сервер или сохранён во
временной таблице при выполнении части запроса GLOBAL IN/JOIN.

## max&#95;sessions&#95;for&#95;user

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество одновременных сеансов для одного аутентифицированного пользователя сервера ClickHouse.

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
    <!-- Пользователь Alice может подключиться к серверу ClickHouse не более одного раза одновременно. -->
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


## max_size_to_preallocate_for_aggregation \{#max_size_to_preallocate_for_aggregation\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "Включает оптимизацию для больших таблиц."}]}, {"id": "row-2","items": [{"label": "22.12"},{"label": "100000000"},{"label": "Оптимизирует производительность."}]}]}/>

Максимальное количество элементов, для которого разрешено предварительно выделять память во всех хэш-таблицах суммарно до начала агрегации.

## max_size_to_preallocate_for_joins \{#max_size_to_preallocate_for_joins\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "100000000"},{"label": "Новая настройка."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "1000000000000"},{"label": "Включена оптимизация для более крупных таблиц."}]}]}/>

Для какого максимального количества элементов допускается предварительное выделение памяти во всех хеш-таблицах суммарно перед joi

## max_streams_for_merge_tree_reading \{#max_streams_for_merge_tree_reading\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если параметр не равен нулю, ограничивает количество потоков чтения для таблицы MergeTree.

## max_streams_multiplier_for_merge_tables \{#max_streams_multiplier_for_merge_tables\} 

<SettingsInfoBlock type="Float" default_value="5" />

Запрашивать больше потоков при чтении из таблицы Merge. Потоки будут распределены по таблицам, входящим в Merge-таблицу. Это позволяет более равномерно распределять работу между потоками и особенно полезно, когда объединяемые таблицы различаются по размеру.

## max_streams_to_max_threads_ratio \{#max_streams_to_max_threads_ratio\} 

<SettingsInfoBlock type="Float" default_value="1" />

Позволяет использовать больше источников, чем число потоков, чтобы равномернее распределять работу между потоками. Предполагается, что это временное решение: в будущем планируется сделать количество источников равным количеству потоков, при этом каждый источник будет динамически выбирать доступную для себя работу.

## max_subquery_depth \{#max_subquery_depth\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Если запрос содержит больше указанного количества вложенных подзапросов, выбрасывается
исключение.

:::tip
Это позволяет выполнить проверку на корректность и защитить ваш кластер от пользователей,
которые пишут чрезмерно сложные запросы.
:::

## max_table_size_to_drop \{#max_table_size_to_drop\} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

Ограничение на удаление таблиц во время выполнения запросов. Значение `0` означает, что вы можете удалять любые таблицы без ограничений.

Значение по умолчанию в облаке: 1 ТБ.

:::note
Этот параметр запроса переопределяет одноимённый параметр сервера, см. [max_table_size_to_drop](/operations/server-configuration-parameters/settings#max_table_size_to_drop)
:::

## max_temporary_columns \{#max_temporary_columns\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество временных столбцов, которые должны одновременно храниться
в оперативной памяти при выполнении запроса, включая константные столбцы. Если запрос в результате промежуточных вычислений создаёт в памяти больше временных столбцов, чем указано, будет выброшено исключение.

:::tip
Этот параметр полезен для предотвращения чрезмерно сложных запросов.
:::

Значение `0` означает отсутствие ограничения.

## max_temporary_data_on_disk_size_for_query \{#max_temporary_data_on_disk_size_for_query\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объем данных во временных файлах на диске в байтах для всех
одновременно выполняемых запросов.

Возможные значения:

- Положительное целое число.
- `0` — без ограничений (значение по умолчанию)

## max_temporary_data_on_disk_size_for_user \{#max_temporary_data_on_disk_size_for_user\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объём данных во временных файлах на диске в байтах для всех
одновременно выполняемых пользовательских запросов.

Возможные значения:

- Положительное целое число.
- `0` — без ограничений (по умолчанию)

## max_temporary_non_const_columns \{#max_temporary_non_const_columns\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Аналогично `max_temporary_columns`, задаёт максимальное количество временных столбцов, которые
необходимо одновременно держать в оперативной памяти при выполнении запроса, при этом константные
столбцы не учитываются.

:::note
Константные столбцы формируются довольно часто при выполнении запроса, но практически не требуют
вычислительных ресурсов.
:::

## max_threads \{#max_threads\} 

<SettingsInfoBlock type="MaxThreads" default_value="'auto(N)'" />

Максимальное количество потоков обработки запроса, не включая потоки для получения данных с удалённых серверов (см. параметр `max_distributed_connections`).

Этот параметр применяется к потокам, которые параллельно выполняют одни и те же этапы конвейера обработки запроса.
Например, при чтении из таблицы, если возможно параллельно вычислять выражения с функциями, фильтровать по WHERE и выполнять предварительную агрегацию для GROUP BY с использованием по крайней мере `max_threads` потоков, то будет задействовано столько потоков, сколько указано в `max_threads`.

Для запросов, которые завершаются быстро из-за LIMIT, вы можете установить меньшее значение `max_threads`. Например, если необходимое количество записей находится в каждом блоке и `max_threads = 8`, то будет прочитано 8 блоков, хотя было бы достаточно прочитать только один.

Чем меньше значение `max_threads`, тем меньше расход памяти.

Значение по умолчанию в Cloud: `auto(3)`

## max_threads_for_indexes \{#max_threads_for_indexes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество потоков, используемых для обработки индексов.

## max_untracked_memory \{#max_untracked_memory\} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

Малые выделения и освобождения памяти группируются в потоковой локальной переменной и учитываются или профилируются только тогда, когда их объём (в абсолютном выражении) становится больше указанного значения. Если значение превышает `memory_profiler_step`, оно будет фактически уменьшено до `memory_profiler_step`.

## memory_overcommit_ratio_denominator \{#memory_overcommit_ratio_denominator\} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "Включить функцию перераспределения памяти (memory overcommit) по умолчанию"}]}]}/>

Это мягкое ограничение по памяти, действующее после достижения жесткого лимита на глобальном уровне.
Это значение используется для вычисления коэффициента перераспределения памяти (overcommit ratio) для запроса.
Нулевое значение означает, что запрос пропускается.
Подробнее см. в разделе [memory overcommit](memory-overcommit.md).

## memory_overcommit_ratio_denominator_for_user \{#memory_overcommit_ratio_denominator_for_user\} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.5"},{"label": "1073741824"},{"label": "Функция memory overcommit включена по умолчанию"}]}]}/>

Определяет мягкий лимит памяти, применяемый после достижения жесткого лимита на уровне пользователя.
Это значение используется для вычисления коэффициента overcommit для запроса.
Нулевое значение означает, что запрос будет пропущен.
Подробнее см. в разделе [memory overcommit](memory-overcommit.md).

## memory_profiler_sample_max_allocation_size \{#memory_profiler_sample_max_allocation_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Собирать случайные выделения памяти размером не больше указанного значения с вероятностью `memory_profiler_sample_probability`. Значение 0 означает, что сбор отключён. Рекомендуется установить `max_untracked_memory` в 0, чтобы этот порог работал ожидаемым образом.

## memory_profiler_sample_min_allocation_size \{#memory_profiler_sample_min_allocation_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Собирать случайные выделения памяти размером не меньше указанного значения с вероятностью, равной `memory_profiler_sample_probability`. 0 означает отключено. Возможно, вам потребуется установить `max_untracked_memory` в 0, чтобы этот порог работал как ожидается.

## memory_profiler_sample_probability \{#memory_profiler_sample_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

Собирает случайные операции выделения и освобождения памяти и записывает их в system.trace_log с trace_type 'MemorySample'. Вероятность применяется к каждой операции alloc/free независимо от размера выделения (может быть изменена с помощью `memory_profiler_sample_min_allocation_size` и `memory_profiler_sample_max_allocation_size`). Обратите внимание, что семплирование происходит только тогда, когда объём неотслеживаемой памяти превышает 'max_untracked_memory'. Для более детального семплирования можно установить 'max_untracked_memory' в 0.

## memory_profiler_step \{#memory_profiler_step\} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

Задает шаг профилировщика памяти. Каждый раз, когда потребление памяти запросом превышает очередной порог (в байтах), профилировщик памяти собирает стек трассировки выделения памяти и записывает его в [trace_log](/operations/system-tables/trace_log).

Возможные значения:

- Положительное целое число байт.

- 0 — для отключения профилировщика памяти.

## memory_tracker_fault_probability \{#memory_tracker_fault_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

Для тестирования устойчивости к исключениям — выбрасывает исключение при каждом выделении памяти с указанной вероятностью.

## memory_usage_overcommit_max_wait_microseconds \{#memory_usage_overcommit_max_wait_microseconds\} 

<SettingsInfoBlock type="UInt64" default_value="5000000" />

Максимальное время, в течение которого поток будет ждать освобождения памяти в случае перерасхода памяти на пользовательском уровне.
Если время ожидания истекло, а память не освобождена, генерируется исключение.
Подробнее о [перерасходе памяти](memory-overcommit.md).

## merge_table_max_tables_to_look_for_schema_inference \{#merge_table_max_tables_to_look_for_schema_inference\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1000"},{"label": "Новая настройка"}]}]}/>

При создании таблицы `Merge` без явной схемы или при использовании табличной функции `merge` схема определяется как объединение не более чем указанного числа подходящих таблиц.
Если таблиц больше, схема будет определена по первым таблицам, количество которых равно указанному значению.

## merge_tree_coarse_index_granularity \{#merge_tree_coarse_index_granularity\} 

<SettingsInfoBlock type="UInt64" default_value="8" />

При поиске данных ClickHouse проверяет метки данных в файле индекса. Если ClickHouse определяет, что нужные ключи находятся в некотором диапазоне, он делит этот диапазон на `merge_tree_coarse_index_granularity` поддиапазонов и рекурсивно ищет в них нужные ключи.

Возможные значения:

- Любое положительное чётное целое число.

## merge_tree_compact_parts_min_granules_to_multibuffer_read \{#merge_tree_compact_parts_min_granules_to_multibuffer_read\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="16" />

Применяется только в ClickHouse Cloud. Количество гранул в полосе компактной части таблиц MergeTree, при котором используется multibuffer-ридер, поддерживающий параллельное чтение и предварительную подзагрузку (prefetch). При чтении из удалённой файловой системы использование multibuffer-ридера увеличивает количество запросов на чтение.

## merge_tree_determine_task_size_by_prewhere_columns \{#merge_tree_determine_task_size_by_prewhere_columns\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет, использовать ли только размер столбцов `PREWHERE` для определения размера задания чтения.

## merge_tree_max_bytes_to_use_cache \{#merge_tree_max_bytes_to_use_cache\} 

<SettingsInfoBlock type="UInt64" default_value="2013265920" />

Если ClickHouse должен прочитать более `merge_tree_max_bytes_to_use_cache` байт в одном запросе, он не использует кэш несжатых блоков.

Кэш несжатых блоков хранит данные, извлечённые для запросов. ClickHouse использует этот кэш для ускорения ответов на повторяющиеся небольшие запросы. Этот параметр защищает кэш от засорения запросами, которые читают большой объём данных. Серверная настройка [uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) определяет размер кэша несжатых блоков.

Возможные значения:

- Любое положительное целое число.

## merge_tree_max_rows_to_use_cache \{#merge_tree_max_rows_to_use_cache\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Если для одного запроса ClickHouse должен прочитать более `merge_tree_max_rows_to_use_cache` строк, он не использует кэш несжатых блоков.

Кэш несжатых блоков хранит данные, извлечённые для запросов. ClickHouse использует этот кэш для ускорения ответов на повторяющиеся небольшие запросы. Этот параметр защищает кэш от «засорения» запросами, которые читают большой объём данных. Параметр сервера [uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) определяет размер кэша несжатых блоков.

Возможные значения:

- Любое положительное целое число.

## merge_tree_min_bytes_for_concurrent_read \{#merge_tree_min_bytes_for_concurrent_read\} 

<SettingsInfoBlock type="UInt64" default_value="251658240" />

Если количество байт, которое требуется прочитать из одного файла таблицы движка [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md), превышает `merge_tree_min_bytes_for_concurrent_read`, ClickHouse пытается выполнять параллельное чтение этого файла в нескольких потоках.

Возможное значение:

- Положительное целое число.

## merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem \{#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Параметр объявлен устаревшим"}]}]}/>

Минимальное количество байт, которое необходимо прочитать из одного файла, прежде чем движок [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) сможет распараллелить чтение при чтении с удалённой файловой системы. Мы не рекомендуем использовать этот параметр.

Возможные значения:

- Положительное целое число.

## merge_tree_min_bytes_for_seek \{#merge_tree_min_bytes_for_seek\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если расстояние между двумя блоками данных, которые нужно прочитать из одного файла, меньше `merge_tree_min_bytes_for_seek` байт, ClickHouse последовательно читает диапазон файла, включающий оба блока, избегая дополнительной операции seek.

Возможные значения:

- Любое положительное целое число.

## merge_tree_min_bytes_per_task_for_remote_reading \{#merge_tree_min_bytes_per_task_for_remote_reading\} 

**Псевдонимы**: `filesystem_prefetch_min_bytes_for_single_read_task`

<SettingsInfoBlock type="UInt64" default_value="2097152" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "2097152"},{"label": "Значение унифицировано с `filesystem_prefetch_min_bytes_for_single_read_task`"}]}]}/>

Минимальный объём данных (в байтах), считываемый в рамках одной задачи.

## merge_tree_min_read_task_size \{#merge_tree_min_read_task_size\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="8" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "8"},{"label": "New setting"}]}]}/>

Жесткое нижнее ограничение на размер задачи (даже если количество гранул мало, а число доступных потоков велико, задачи меньшего размера выделяться не будут).

## merge_tree_min_rows_for_concurrent_read \{#merge_tree_min_rows_for_concurrent_read\} 

<SettingsInfoBlock type="UInt64" default_value="163840" />

Если количество строк, которые нужно прочитать из файла таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md), превышает `merge_tree_min_rows_for_concurrent_read`, то ClickHouse пытается выполнять параллельное чтение из этого файла в нескольких потоках.

Возможные значения:

- Положительное целое число.

## merge_tree_min_rows_for_concurrent_read_for_remote_filesystem \{#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Настройка устарела"}]}]}/>

Минимальное количество строк, которое нужно прочитать из одного файла до того, как движок [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) сможет выполнять параллельное чтение при работе с удалённой файловой системой. Мы не рекомендуем использовать эту настройку.

Возможные значения:

- Положительное целое число.

## merge_tree_min_rows_for_seek \{#merge_tree_min_rows_for_seek\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если расстояние между двумя блоками данных, которые должны быть прочитаны из одного файла, меньше `merge_tree_min_rows_for_seek` строк, ClickHouse не выполняет произвольный переход по файлу, а читает данные последовательно.

Возможные значения:

- Любое положительное целое число.

## merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability \{#merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Для тестирования `PartsSplitter` — разбивает диапазоны чтения на пересекающиеся и непересекающиеся при каждом чтении из MergeTree с заданной вероятностью."}]}]}/>

Для тестирования `PartsSplitter` — разбивает диапазоны чтения на пересекающиеся и непересекающиеся при каждом чтении из MergeTree с заданной вероятностью.

## merge_tree_storage_snapshot_sleep_ms \{#merge_tree_storage_snapshot_sleep_ms\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "0"},{"label": "Новая настройка для отладки согласованности снимка хранилища при выполнении запроса"}]}]}/>

Добавляет искусственную задержку (в миллисекундах) при создании снимка хранилища для таблиц MergeTree.
Используется только для тестирования и отладки.

Возможные значения:

- 0 — без задержки (по умолчанию)
- N — задержка в миллисекундах

## merge_tree_use_const_size_tasks_for_remote_reading \{#merge_tree_use_const_size_tasks_for_remote_reading\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет, использовать ли задачи фиксированного размера для чтения из удалённой таблицы.

## merge_tree_use_deserialization_prefixes_cache \{#merge_tree_use_deserialization_prefixes_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Новая настройка для управления использованием кэша префиксов десериализации в MergeTree"}]}]}/>

Включает кэширование метаданных столбцов по префиксам файлов при чтении с удалённых дисков в MergeTree.

## merge_tree_use_prefixes_deserialization_thread_pool \{#merge_tree_use_prefixes_deserialization_thread_pool\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Новый параметр, управляющий использованием пула потоков для параллельной десериализации префиксов в MergeTree"}]}]}/>

Включает использование пула потоков для параллельного чтения префиксов в Wide‑частях таблиц MergeTree. Размер этого пула потоков контролируется параметром сервера `max_prefixes_deserialization_thread_pool_size`.

## merge_tree_use_v1_object_and_dynamic_serialization \{#merge_tree_use_v1_object_and_dynamic_serialization\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "Добавлена новая версия сериализации V2 для типов JSON и Dynamic"}]}]}/>

Если параметр включен, в MergeTree для типов JSON и Dynamic будет использоваться версия сериализации V1 вместо V2. Изменение этого параметра вступает в силу только после перезапуска сервера.

## metrics_perf_events_enabled \{#metrics_perf_events_enabled\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, часть perf-событий будет измеряться при выполнении запросов.

## metrics_perf_events_list \{#metrics_perf_events_list\} 

Список метрик perf, разделённый запятыми, которые будут измеряться при выполнении запросов. Пустое значение означает, что измеряются все события. См. PerfEventInfo в исходном коде для списка доступных событий.

## min_bytes_to_use_direct_io \{#min_bytes_to_use_direct_io\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный объём данных, при котором используется прямой ввод-вывод (direct I/O) при обращении к диску хранилища.

ClickHouse использует этот параметр при чтении данных из таблиц. Если общий объём всех данных, подлежащих чтению, превышает `min_bytes_to_use_direct_io` байт, ClickHouse читает данные с диска хранилища с опцией `O_DIRECT`.

Возможные значения:

- 0 — прямой ввод-вывод отключён.
- Положительное целое число.

## min_bytes_to_use_mmap_io \{#min_bytes_to_use_mmap_io\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Это экспериментальная настройка. Устанавливает минимальный объём памяти для чтения больших файлов без копирования данных из ядра в пользовательское пространство. Рекомендуемый порог — около 64 МБ, так как операции [mmap/munmap](https://en.wikipedia.org/wiki/Mmap) выполняются медленно. Имеет смысл только для больших файлов и даёт эффект только в том случае, если данные находятся в кэше страниц.

Возможные значения:

- Положительное целое число.
- 0 — большие файлы читаются только с копированием данных из ядра в пользовательское пространство.

## min_chunk_bytes_for_parallel_parsing \{#min_chunk_bytes_for_parallel_parsing\} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="10485760" />

- Тип: беззнаковое целое число (unsigned int)
- Значение по умолчанию: 1 MiB

Минимальный размер фрагмента в байтах, который каждый поток будет обрабатывать параллельно.

## min_compress_block_size \{#min_compress_block_size\} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

Для таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Чтобы уменьшить задержку при обработке запросов, блок сжимается при записи следующей метки, если его размер не менее `min_compress_block_size`. По умолчанию — 65 536.

Фактический размер блока, если объём несжатых данных меньше `max_compress_block_size`, не может быть меньше этого значения и не может быть меньше объёма данных для одной метки.

Рассмотрим пример. Предположим, что при создании таблицы параметр `index_granularity` был установлен равным 8192.

Мы записываем столбец типа UInt32 (4 байта на значение). При записи 8192 строк объём данных составит 32 КБ. Поскольку min_compress_block_size = 65 536, сжатый блок будет формироваться на каждые две метки.

Мы записываем столбец URL типа String (средний размер 60 байт на значение). При записи 8192 строк объём данных будет немного меньше 500 КБ. Так как это больше 65 536, сжатый блок будет формироваться для каждой метки. В этом случае при чтении данных с диска в диапазоне одной метки лишние данные не будут распакованы.

:::note
Это настройка экспертного уровня, и вам не следует изменять её, если вы только начинаете работать с ClickHouse.
:::

## min_count_to_compile_aggregate_expression \{#min_count_to_compile_aggregate_expression\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

Минимальное количество идентичных агрегатных выражений для начала JIT‑компиляции. Работает только при включённой настройке [compile_aggregate_expressions](#compile_aggregate_expressions).

Возможные значения:

- Положительное целое число.
- 0 — идентичные агрегатные выражения всегда компилируются с помощью JIT.

## min_count_to_compile_expression \{#min_count_to_compile_expression\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

Минимальное количество выполнений одного и того же выражения, прежде чем оно будет скомпилировано.

## min_count_to_compile_sort_description \{#min_count_to_compile_sort_description\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

Количество одинаковых описаний сортировки, прежде чем они будут скомпилированы с помощью JIT

## min_execution_speed \{#min_execution_speed\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальная скорость выполнения в строках в секунду. Проверяется на каждом блоке данных после истечения
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed).
Если скорость выполнения ниже, выбрасывается исключение.

## min_execution_speed_bytes \{#min_execution_speed_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное число байт, обрабатываемых в секунду. Проверяется на каждом блоке данных по истечении интервала,
[`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed).
Если скорость выполнения ниже этого значения, выбрасывается исключение.

## min_external_table_block_size_bytes \{#min_external_table_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="268402944" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "268402944"},{"label": "Сжимать блоки, передаваемые во внешнюю таблицу, до указанного размера в байтах, если они меньше этого размера."}]}]}/>

Сжимает блоки, передаваемые во внешнюю таблицу, до указанного размера в байтах, если они меньше этого размера.

## min_external_table_block_size_rows \{#min_external_table_block_size_rows\} 

<SettingsInfoBlock type="UInt64" default_value="1048449" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1048449"},{"label": "Объединяет блоки, передаваемые во внешнюю таблицу, до указанного размера (в строках), если их размер меньше этого значения"}]}]}/>

Объединяет блоки, передаваемые во внешнюю таблицу, до указанного размера (в строках), если их размер меньше этого значения.

## min_free_disk_bytes_to_perform_insert \{#min_free_disk_bytes_to_perform_insert\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Сохраняет некоторый объём свободного дискового пространства при вставках, при этом всё ещё позволяя временную запись."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Минимальный объём свободного дискового пространства (в байтах), необходимый для выполнения операции вставки.

## min_free_disk_ratio_to_perform_insert \{#min_free_disk_ratio_to_perform_insert\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Обеспечивает резерв свободного места на диске, выраженный как доля от общего объёма диска, сохраняемого при операциях вставки, при этом временная запись по‑прежнему допускается."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Минимальная доля свободного дискового пространства, необходимая для выполнения вставки.

## min_free_disk_space_for_temporary_data \{#min_free_disk_space_for_temporary_data\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальный объем дискового пространства, который необходимо оставлять свободным при записи временных данных, используемых для внешней сортировки и агрегации.

## min_hit_rate_to_use_consecutive_keys_optimization \{#min_hit_rate_to_use_consecutive_keys_optimization\} 

<SettingsInfoBlock type="Float" default_value="0.5" />

Минимальный уровень попаданий в кэш, при котором оптимизация для последовательных ключей в агрегировании остаётся включённой

## min_insert_block_size_bytes \{#min_insert_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="268402944" />

Устанавливает минимальный размер блока в байтах, который может быть вставлен в таблицу с помощью запроса `INSERT`. Блоки меньшего размера объединяются в более крупные.

Возможные значения:

- Положительное целое число.
- 0 — объединение отключено.

## min_insert_block_size_bytes_for_materialized_views \{#min_insert_block_size_bytes_for_materialized_views\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает минимальный размер блока в байтах, который может быть вставлен в таблицу запросом `INSERT`. Блоки меньшего размера объединяются в более крупные. Этот параметр применяется только к блокам, вставляемым в [материализованное представление](../../sql-reference/statements/create/view.md). Настраивая этот параметр, вы управляете объединением блоков при записи в материализованное представление и позволяете избежать чрезмерного потребления памяти.

Возможные значения:

- Любое положительное целое число.
- 0 — объединение отключено.

**См. также**

- [min_insert_block_size_bytes](#min_insert_block_size_bytes)

## min_insert_block_size_rows \{#min_insert_block_size_rows\} 

<SettingsInfoBlock type="UInt64" default_value="1048449" />

Задает минимальное количество строк в блоке при вставке данных в таблицу с помощью запроса `INSERT`. Блоки меньшего размера объединяются в более крупные.

Возможные значения:

- Положительное целое число.
- 0 — объединение отключено.

## min_insert_block_size_rows_for_materialized_views \{#min_insert_block_size_rows_for_materialized_views\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает минимальное количество строк в блоке, которые могут быть вставлены в таблицу запросом `INSERT`. Блоки меньшего размера объединяются в более крупные. Этот параметр применяется только к блокам, вставляемым в [материализованное представление](../../sql-reference/statements/create/view.md). Регулируя этот параметр, вы управляете объединением блоков при вставке в материализованное представление и избегаете чрезмерного расхода памяти.

Возможные значения:

- Любое положительное целое число.
- 0 — объединение отключено.

**См. также**

- [min_insert_block_size_rows](#min_insert_block_size_rows)

## min_joined_block_size_bytes \{#min_joined_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="524288" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "524288"},{"label": "Новая настройка."}]}]}/>

Минимальный размер блока в байтах для входных и выходных блоков операции JOIN (если алгоритм соединения это поддерживает). Маленькие блоки будут объединяться. Значение 0 означает отсутствие ограничения.

## min_joined_block_size_rows \{#min_joined_block_size_rows\} 

<SettingsInfoBlock type="UInt64" default_value="65409" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "65409"},{"label": "New setting."}]}]}/>

Минимальный размер блока в строках для входных и выходных блоков JOIN (если выбранный алгоритм JOIN это поддерживает). Мелкие блоки будут объединены. Значение 0 означает отсутствие ограничений.

## min_os_cpu_wait_time_ratio_to_throw \{#min_os_cpu_wait_time_ratio_to_throw\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Значения настройки были изменены и задним числом применены к 25.4"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Минимальное соотношение между временем ожидания CPU в ОС (метрика OSCPUWaitMicroseconds) и временем занятости (метрика OSCPUVirtualTimeMicroseconds), при котором запросы могут быть отклонены. Для вычисления вероятности отклонения используется линейная интерполяция между минимальным и максимальным значениями соотношения, при этом в этой точке вероятность равна 0.

## min_outstreams_per_resize_after_split \{#min_outstreams_per_resize_after_split\} 

<SettingsInfoBlock type="UInt64" default_value="24" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "24"},{"label": "Новая настройка."}]}]}/>

Определяет минимальное количество выходных потоков процессора `Resize` или `StrictResize` после выполнения операции разбиения при генерации конвейера. Если результирующее количество потоков меньше этого значения, операция разбиения не выполняется.

### Что такое узел Resize

Узел `Resize` — это процессор в конвейере запросов, который регулирует количество потоков данных, проходящих через конвейер. Он может как увеличивать, так и уменьшать число потоков, чтобы сбалансировать нагрузку между несколькими потоками выполнения или процессорами. Например, если запросу требуется больше параллелизма, узел `Resize` может разделить один поток на несколько потоков. Напротив, он может объединить несколько потоков в меньшее их число для консолидации обработки данных.

Узел `Resize` обеспечивает равномерное распределение данных по потокам, сохраняя структуру блоков данных. Это помогает оптимизировать использование ресурсов и повысить производительность запросов.

### Почему узел Resize необходимо разделить

Во время выполнения конвейера мьютекс ExecutingGraph::Node::status_mutex центрального узла‑хаба `Resize` испытывает сильную конкуренцию за захват, особенно в средах с большим количеством ядер, и это приводит к следующему:

1. Увеличению задержки при ExecutingGraph::updateNode, что напрямую влияет на производительность запросов.
2. Чрезмерному расходу циклов CPU из‑за конкуренции за спинлок (native_queued_spin_lock_slowpath), что ухудшает эффективность.
3. Снижению загрузки CPU, что ограничивает параллелизм и пропускную способность.

### Как выполняется разбиение узла Resize

1. Проверяется количество выходных потоков, чтобы убедиться, что разбиение возможно: выходные потоки каждого узла после разбиения достигают или превышают порог `min_outstreams_per_resize_after_split`.
2. Узел `Resize` разбивается на несколько меньших узлов `Resize` с одинаковым количеством портов, каждый из которых обрабатывает подмножество входных и выходных потоков.
3. Каждая группа обрабатывается независимо, что снижает конкуренцию за блокировки.

### Разбиение узла Resize с произвольными входами/выходами

В некоторых случаях, когда количество входов/выходов не делится нацело на число узлов `Resize`, на которые выполняется разбиение, часть входов подключается к `NullSource`, а часть выходов — к `NullSink`. Это позволяет выполнить разбиение, не влияя на общий поток данных.

### Назначение настройки

Настройка `min_outstreams_per_resize_after_split` гарантирует, что разбиение узлов `Resize` действительно имеет смысл и предотвращает создание слишком малого количества потоков, что могло бы привести к неэффективной параллельной обработке. Задавая минимальное число выходных потоков, эта настройка помогает поддерживать баланс между параллелизмом и накладными расходами, оптимизируя выполнение запросов в сценариях, связанных с разбиением и слиянием потоков.

### Отключение настройки

Чтобы отключить разбиение узлов `Resize`, установите эту настройку в 0. Это предотвратит разбиение узлов `Resize` при генерации пайплайна, позволяя им сохранять свою исходную структуру без деления на более мелкие узлы.

## min_table_rows_to_use_projection_index \{#min_table_rows_to_use_projection_index\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1000000"},{"label": "Новая настройка"}]}]}/>

Если оценённое число строк для чтения из таблицы больше либо равно этому порогу, ClickHouse попытается использовать проекционный индекс при выполнении запроса.

## mongodb_throw_on_unsupported_query \{#mongodb_throw_on_unsupported_query\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "1"},{"label": "Новая настройка."}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "Новая настройка."}]}]}/>

Если настройка включена, таблицы MongoDB будут возвращать ошибку, когда невозможно построить запрос MongoDB. В противном случае ClickHouse считывает всю таблицу целиком и обрабатывает её локально. Эта опция не применяется, когда `allow_experimental_analyzer=0`.

## move_all_conditions_to_prewhere \{#move_all_conditions_to_prewhere\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Перемещает все применимые условия из WHERE в PREWHERE

## move_primary_key_columns_to_end_of_prewhere \{#move_primary_key_columns_to_end_of_prewhere\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Перемещать условия PREWHERE, содержащие столбцы первичного ключа, в конец цепочки условий AND. Скорее всего, эти условия уже учитываются при анализе первичного ключа и, следовательно, почти не влияют на фильтрацию на этапе PREWHERE.

## multiple_joins_try_to_keep_original_names \{#multiple_joins_try_to_keep_original_names\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Не добавлять псевдонимы к выражениям верхнего уровня в списке выражений при переписывании запросов с несколькими JOIN

## mutations_execute_nondeterministic_on_initiator \{#mutations_execute_nondeterministic_on_initiator\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение `true`, константные недетерминированные функции (например, функция `now()`) выполняются на инициаторе запроса и заменяются литералами в запросах `UPDATE` и `DELETE`. Это помогает сохранять согласованность данных на репликах при выполнении мутаций с константными недетерминированными функциями. Значение по умолчанию: `false`.

## mutations_execute_subqueries_on_initiator \{#mutations_execute_subqueries_on_initiator\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если `true`, скалярные подзапросы выполняются на инициаторе и подставляются как литералы в запросах `UPDATE` и `DELETE`. Значение по умолчанию: `false`.

## mutations_max_literal_size_to_replace \{#mutations_max_literal_size_to_replace\} 

<SettingsInfoBlock type="UInt64" default_value="16384" />

Максимальный размер сериализованного литерала в байтах, который может быть заменён в запросах `UPDATE` и `DELETE`. Параметр применяется только в том случае, если включена хотя бы одна из двух настроек выше. Значение по умолчанию: 16384 (16 KiB).

## mutations_sync \{#mutations_sync\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Позволяет выполнять запросы `ALTER TABLE ... UPDATE|DELETE|MATERIALIZE INDEX|MATERIALIZE PROJECTION|MATERIALIZE COLUMN|MATERIALIZE STATISTICS` ([мутации](../../sql-reference/statements/alter/index.md/#mutations)) синхронно.

Возможные значения:

| Значение | Описание                                                                                                                                           |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `0`      | Мутации выполняются асинхронно.                                                                                                                    |
| `1`      | Запрос ожидает завершения всех мутаций на текущем сервере.                                                                                         |
| `2`      | Запрос ожидает завершения всех мутаций на всех репликах (если они есть).                                                                           |
| `3`      | Запрос ожидает завершения мутаций только на активных репликах. Поддерживается только для `SharedMergeTree`. Для `ReplicatedMergeTree` ведёт себя так же, как при `mutations_sync = 2`.|

## mysql_datatypes_support_level \{#mysql_datatypes_support_level\} 

Определяет, как типы MySQL преобразуются в соответствующие типы ClickHouse. Представляет собой список, разделённый запятыми, с любой комбинацией значений `decimal`, `datetime64`, `date2Date32` или `date2String`.

- `decimal`: преобразовывать типы `NUMERIC` и `DECIMAL` в `Decimal`, если позволяет точность.
- `datetime64`: преобразовывать типы `DATETIME` и `TIMESTAMP` в `DateTime64` вместо `DateTime`, когда точность не равна `0`.
- `date2Date32`: преобразовывать `DATE` в `Date32` вместо `Date`. Имеет приоритет над `date2String`.
- `date2String`: преобразовывать `DATE` в `String` вместо `Date`. Переопределяется параметром `datetime64`.

## mysql_map_fixed_string_to_text_in_show_columns \{#mysql_map_fixed_string_to_text_in_show_columns\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Снижает трудозатраты на настройку подключения ClickHouse к BI-инструментам."}]}]}/>

При включении тип данных ClickHouse [FixedString](../../sql-reference/data-types/fixedstring.md) будет отображаться как `TEXT` в [SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns).

Влияет только в том случае, если подключение устанавливается через протокол MySQL (wire protocol).

- 0 — использовать `BLOB`.
- 1 — использовать `TEXT`.

## mysql_map_string_to_text_in_show_columns \{#mysql_map_string_to_text_in_show_columns\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Reduce the configuration effort to connect ClickHouse with BI tools."}]}]}/>

Когда этот параметр включен, тип данных ClickHouse [String](../../sql-reference/data-types/string.md) будет отображаться как `TEXT` в [SHOW COLUMNS](../../sql-reference/statements/show.md/#show_columns).

Действует только при подключении по протоколу MySQL (wire protocol).

- 0 — использовать `BLOB`.
- 1 — использовать `TEXT`.

## mysql_max_rows_to_insert \{#mysql_max_rows_to_insert\} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

Максимальное количество строк в пакетной вставке для табличного движка MySQL

## network_compression_method \{#network_compression_method\} 

<SettingsInfoBlock type="String" default_value="LZ4" />

Кодек для сжатия обмена данными клиент/сервер и сервер/сервер.

Возможные значения:

- `NONE` — без сжатия.
- `LZ4` — использовать кодек LZ4.
- `LZ4HC` — использовать кодек LZ4HC.
- `ZSTD` — использовать кодек ZSTD.

**См. также**

- [network_zstd_compression_level](#network_zstd_compression_level)

## network_zstd_compression_level \{#network_zstd_compression_level\} 

<SettingsInfoBlock type="Int64" default_value="1" />

Задает уровень сжатия ZSTD. Используется только если [network_compression_method](#network_compression_method) имеет значение `ZSTD`.

Возможные значения:

- Положительное целое число от 1 до 15.

## normalize_function_names \{#normalize_function_names\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "Приводит имена функций к каноническому виду, это было необходимо для маршрутизации запросов с проекциями"}]}]}/>

Приводит имена функций к каноническому виду

## number_of_mutations_to_delay \{#number_of_mutations_to_delay\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если изменяемая таблица содержит не менее заданного количества незавершённых мутаций, мутации для этой таблицы искусственно замедляются. 0 — отключено

## number_of_mutations_to_throw \{#number_of_mutations_to_throw\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если изменяемая таблица содержит как минимум указанное количество незавершённых мутаций, выбрасывается исключение «Too many mutations ...». 0 — отключено

## odbc_bridge_connection_pool_size \{#odbc_bridge_connection_pool_size\} 

<SettingsInfoBlock type="UInt64" default_value="16" />

Размер пула подключений для каждой строки параметров подключения в ODBC-мосте.

## odbc_bridge_use_connection_pooling \{#odbc_bridge_use_connection_pooling\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать пул подключений в мосте ODBC. Если установлено значение false, при каждом обращении создаётся новое подключение.

## offset

<SettingsInfoBlock type="UInt64" default_value="0" />

Задаёт количество строк, которые нужно пропустить перед тем, как запрос начнёт возвращать строки. Корректирует смещение, заданное предложением [OFFSET](/sql-reference/statements/select/offset), таким образом, что эти два значения суммируются.

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


## opentelemetry_start_trace_probability \{#opentelemetry_start_trace_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

Задаёт вероятность того, что ClickHouse начнёт трассировку для выполняемых запросов (если не передан родительский [trace context](https://www.w3.org/TR/trace-context/)).

Возможные значения:

- 0 — трассировка для всех выполняемых запросов отключена (если не передан родительский [trace context](https://www.w3.org/TR/trace-context/)).
- Положительное число с плавающей запятой в диапазоне [0..1]. Например, если значение параметра равно `0,5`, ClickHouse может начинать трассировку в среднем для половины запросов.
- 1 — трассировка для всех выполняемых запросов включена.

## opentelemetry_trace_cpu_scheduling \{#opentelemetry_trace_cpu_scheduling\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "Новая настройка для трассировки функции `cpu_slot_preemption`."}]}]}/>

Собирать спаны OpenTelemetry, связанные с вытесняющим планированием CPU рабочих нагрузок.

## opentelemetry_trace_processors \{#opentelemetry_trace_processors\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Сбор спанов OpenTelemetry для процессоров.

## optimize_aggregation_in_order \{#optimize_aggregation_in_order\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает оптимизацию [GROUP BY](/sql-reference/statements/select/group-by) в запросах [SELECT](../../sql-reference/statements/select/index.md) для агрегации данных в порядке, соответствующем сортировочному ключу, в таблицах [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Возможные значения:

- 0 — оптимизация `GROUP BY` отключена.
- 1 — оптимизация `GROUP BY` включена.

**См. также**

- [Оптимизация GROUP BY](/sql-reference/statements/select/group-by#group-by-optimization-depending-on-table-sorting-key)

## optimize_aggregators_of_group_by_keys \{#optimize_aggregators_of_group_by_keys\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Исключает агрегатные функции min/max/any/anyLast над ключами GROUP BY в разделе SELECT

## optimize_and_compare_chain \{#optimize_and_compare_chain\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "A new setting"}]}]}/>

Дополняет цепочки условий AND константными сравнениями для повышения эффективности фильтрации. Поддерживает операторы `<`, `<=`, `>`, `>=`, `=` и их произвольные комбинации. Например, выражение `(a < b) AND (b < c) AND (c < 5)` будет преобразовано в `(a < b) AND (b < c) AND (c < 5) AND (b < 5) AND (a < 5)`.

## optimize_append_index \{#optimize_append_index\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Используйте [constraints](../../sql-reference/statements/create/table.md/#constraints), чтобы добавить условие индекса. Значение по умолчанию: `false`.

Возможные значения:

- true, false

## optimize_arithmetic_operations_in_aggregate_functions \{#optimize_arithmetic_operations_in_aggregate_functions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Выносит арифметические операции за пределы агрегатных функций

## optimize_const_name_size \{#optimize_const_name_size\} 

<SettingsInfoBlock type="Int64" default_value="256" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "256"},{"label": "Заменять константы на скаляры и использовать хэш как имя для больших констант (размер оценивается по длине имени)"}]}]}/>

Заменять константы на скаляры и использовать хэш как имя для больших констант (размер оценивается по длине имени).

Возможные значения:

- положительное целое число — максимальная длина имени;
- 0 — всегда;
- отрицательное целое число — никогда.

## optimize_count_from_files \{#optimize_count_from_files\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию подсчёта числа строк в файлах для различных форматов входных данных. Применяется к табличным функциям/движкам `file`/`s3`/`url`/`hdfs`/`azureBlobStorage`.

Возможные значения:

- 0 — оптимизация отключена.
- 1 — оптимизация включена.

## optimize_distinct_in_order \{#optimize_distinct_in_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию DISTINCT, если некоторые столбцы в выражении DISTINCT образуют префикс сортировки. Например, префикс ключа сортировки в движке семейства MergeTree или в выражении ORDER BY.

## optimize_distributed_group_by_sharding_key \{#optimize_distributed_group_by_sharding_key\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Оптимизирует запросы `GROUP BY sharding_key`, избегая дорогостоящей агрегации на сервере-инициаторе (что уменьшает потребление памяти запросом на сервере-инициаторе).

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
В настоящий момент для работы этой настройки требуется `optimize_skip_unused_shards` (причина в том, что в будущем она может быть включена по умолчанию и будет корректно работать только в том случае, если данные вставлялись через таблицу Distributed, то есть распределены в соответствии с sharding_key).
:::

## optimize_empty_string_comparisons \{#optimize_empty_string_comparisons\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "Новая настройка."}]}]}/>

Преобразует выражения вида col = '' или '' = col в empty(col), а col != '' или '' != col — в notEmpty(col), только если col имеет тип String или FixedString.

## optimize_extract_common_expressions \{#optimize_extract_common_expressions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Оптимизировать выражения WHERE, PREWHERE, ON, HAVING и QUALIFY за счёт вынесения общих подвыражений из дизъюнкций конъюнкций."}]}, {"id": "row-2","items": [{"label": "24.12"},{"label": "0"},{"label": "Добавить настройку для оптимизации выражений WHERE, PREWHERE, ON, HAVING и QUALIFY за счёт вынесения общих подвыражений из дизъюнкций конъюнкций."}]}]}/>

Позволяет выносить общие подвыражения из дизъюнкций в выражениях WHERE, PREWHERE, ON, HAVING и QUALIFY. Логическое выражение вида `(A AND B) OR (A AND C)` может быть переписано как `A AND (B OR C)`, что может помочь лучше использовать:

- индексы в простых фильтрующих выражениях;
- оптимизацию преобразования CROSS JOIN в INNER JOIN.

## optimize_functions_to_subcolumns \{#optimize_functions_to_subcolumns\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "1"},{"label": "Параметр включён по умолчанию"}]}]}/>

Включает или отключает оптимизацию путём преобразования некоторых функций в чтение подстолбцов. Это уменьшает объём считываемых данных.

Могут быть преобразованы следующие функции:

- [length](/sql-reference/functions/array-functions#length) для чтения подстолбца [size0](../../sql-reference/data-types/array.md/#array-size).
- [empty](/sql-reference/functions/array-functions#empty) для чтения подстолбца [size0](../../sql-reference/data-types/array.md/#array-size).
- [notEmpty](/sql-reference/functions/array-functions#notEmpty) для чтения подстолбца [size0](../../sql-reference/data-types/array.md/#array-size).
- [isNull](/sql-reference/functions/functions-for-nulls#isNull) для чтения подстолбца [null](../../sql-reference/data-types/nullable.md/#finding-null).
- [isNotNull](/sql-reference/functions/functions-for-nulls#isNotNull) для чтения подстолбца [null](../../sql-reference/data-types/nullable.md/#finding-null).
- [count](/sql-reference/aggregate-functions/reference/count) для чтения подстолбца [null](../../sql-reference/data-types/nullable.md/#finding-null).
- [mapKeys](/sql-reference/functions/tuple-map-functions#mapkeys) для чтения подстолбца [keys](/sql-reference/data-types/map#reading-subcolumns-of-map).
- [mapValues](/sql-reference/functions/tuple-map-functions#mapvalues) для чтения подстолбца [values](/sql-reference/data-types/map#reading-subcolumns-of-map).

Возможные значения:

- 0 — оптимизация отключена.
- 1 — оптимизация включена.

## optimize_group_by_constant_keys \{#optimize_group_by_constant_keys\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.9"},{"label": "1"},{"label": "Включить оптимизацию группировки по константным ключам по умолчанию"}]}]}/>

Оптимизирует GROUP BY, если все ключи в блоке являются константами

## optimize_group_by_function_keys \{#optimize_group_by_function_keys\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Удаляет выражения-функции от других ключей в секции GROUP BY

## optimize_if_chain_to_multiif \{#optimize_if_chain_to_multiif\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Заменяет цепочки `if(cond1, then1, if(cond2, ...))` на `multiIf`. В данный момент это не даёт прироста производительности для числовых типов.

## optimize_if_transform_strings_to_enum \{#optimize_if_transform_strings_to_enum\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Заменяет строковые аргументы в `if` и `transform` на значения перечисляемого типа (enum). По умолчанию отключена, так как это может привести к несогласованным изменениям в распределённом запросе и его сбою.

## optimize_injective_functions_in_group_by \{#optimize_injective_functions_in_group_by\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "1"},{"label": "Заменяет инъективные функции на их аргументы в разделе GROUP BY в анализаторе запросов"}]}]}/>

Заменяет инъективные функции на их аргументы в разделе GROUP BY

## optimize_injective_functions_inside_uniq \{#optimize_injective_functions_inside_uniq\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Удаляет инъективные функции от одного аргумента внутри функций uniq*().

## optimize_min_equality_disjunction_chain_length \{#optimize_min_equality_disjunction_chain_length\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

Минимальная длина выражения `expr = x1 OR ... expr = xN` для оптимизации.

## optimize_min_inequality_conjunction_chain_length \{#optimize_min_inequality_conjunction_chain_length\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

Минимальная длина выражения `expr <> x1 AND ... expr <> xN` для оптимизации.

## optimize_move_to_prewhere \{#optimize_move_to_prewhere\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает автоматическую оптимизацию [PREWHERE](../../sql-reference/statements/select/prewhere.md) в запросах [SELECT](../../sql-reference/statements/select/index.md).

Работает только для таблиц семейства [*MergeTree](../../engines/table-engines/mergetree-family/index.md).

Возможные значения:

- 0 — автоматическая оптимизация `PREWHERE` отключена.
- 1 — автоматическая оптимизация `PREWHERE` включена.

## optimize_move_to_prewhere_if_final \{#optimize_move_to_prewhere_if_final\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает автоматическую оптимизацию [PREWHERE](../../sql-reference/statements/select/prewhere.md) в запросах [SELECT](../../sql-reference/statements/select/index.md) с модификатором [FINAL](/sql-reference/statements/select/from#final-modifier).

Работает только для таблиц семейства [*MergeTree](../../engines/table-engines/mergetree-family/index.md).

Возможные значения:

- 0 — автоматическая оптимизация `PREWHERE` в запросах `SELECT` с модификатором `FINAL` отключена.
- 1 — автоматическая оптимизация `PREWHERE` в запросах `SELECT` с модификатором `FINAL` включена.

**См. также**

- настройка [optimize_move_to_prewhere](#optimize_move_to_prewhere)

## optimize_multiif_to_if \{#optimize_multiif_to_if\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Заменяет вызов функции `multiIf` с одним условием на `if`.

## optimize_normalize_count_variants \{#optimize_normalize_count_variants\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.3"},{"label": "1"},{"label": "По умолчанию переписывать агрегатные функции, которые семантически эквивалентны count(), как count()"}]}]}/>

Переписывать агрегатные функции, которые семантически эквивалентны count(), как count().

## optimize&#95;on&#95;insert

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "Включить оптимизацию данных при INSERT по умолчанию для повышения удобства работы пользователей"}]}]} />

Включает или отключает преобразование данных перед вставкой так, как если бы над этим блоком было выполнено слияние (merge) в соответствии с движком таблицы.

Возможные значения:

* 0 — Отключено.
* 1 — Включено.

**Пример**

Разница между включённым и отключённым значением:

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

Обратите внимание, что данная настройка влияет на поведение [материализованного представления](/sql-reference/statements/create/view#materialized-view).


## optimize_or_like_chain \{#optimize_or_like_chain\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Объединяет несколько условий OR LIKE в multiMatchAny. Эту оптимизацию не следует включать по умолчанию, так как в некоторых случаях она сводит на нет анализ индексов.

## optimize_qbit_distance_function_reads \{#optimize_qbit_distance_function_reads\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "New setting"}]}]}/>

Заменяет функции вычисления расстояния для типа данных `QBit` эквивалентными функциями, которые считывают из хранилища только необходимые для вычисления столбцы.

## optimize_read_in_order \{#optimize_read_in_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию [ORDER BY](/sql-reference/statements/select/order-by#optimization-of-data-reading) в запросах [SELECT](../../sql-reference/statements/select/index.md) при чтении данных из таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Возможные значения:

- 0 — оптимизация `ORDER BY` отключена.
- 1 — оптимизация `ORDER BY` включена.

**См. также**

- [Секция ORDER BY](/sql-reference/statements/select/order-by#optimization-of-data-reading)

## optimize_read_in_window_order \{#optimize_read_in_window_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию ORDER BY в оконном предложении для чтения данных в соответствующем порядке в таблицах MergeTree.

## optimize_redundant_functions_in_order_by \{#optimize_redundant_functions_in_order_by\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Удаляет функции из ORDER BY, если их аргументы также указаны в ORDER BY

## optimize_respect_aliases \{#optimize_respect_aliases\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр имеет значение true, будут учитываться алиасы в WHERE/GROUP BY/ORDER BY, что помогает с отсечением партиций, использованием вторичных индексов, optimize_aggregation_in_order, optimize_read_in_order и optimize_trivial_count.

## optimize_rewrite_aggregate_function_with_if \{#optimize_rewrite_aggregate_function_with_if\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Переписывает агрегатные функции с выражением `if` в качестве аргумента в тех случаях, когда это логически эквивалентно.
Например, `avg(if(cond, col, null))` может быть преобразовано в `avgOrNullIf(cond, col)`. Это может повысить производительность.

:::note
Поддерживается только при использовании анализатора (`enable_analyzer = 1`).
:::

## optimize_rewrite_array_exists_to_has \{#optimize_rewrite_array_exists_to_has\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Переписывает вызовы функции arrayExists() на has(), когда это логически эквивалентно. Например, выражение arrayExists(x -> x = 1, arr) может быть заменено на has(arr, 1).

## optimize_rewrite_like_perfect_affix \{#optimize_rewrite_like_perfect_affix\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1"},{"label": "Новая настройка"}]}]}/>

Переписывает LIKE-выражения с точным префиксом или суффиксом (например, `col LIKE 'ClickHouse%'`) во вызовы функций `startsWith` или `endsWith` (например, `startsWith(col, 'ClickHouse')`).

## optimize_rewrite_regexp_functions \{#optimize_rewrite_regexp_functions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "A new setting"}]}]}/>

Переписывать функции, связанные с регулярными выражениями, в более простые и эффективные варианты

## optimize_rewrite_sum_if_to_count_if \{#optimize_rewrite_sum_if_to_count_if\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "Доступно только для анализатора, где работает корректно"}]}]}/>

Переписывает функции sumIf() и sum(if()) в функцию countIf(), когда это логически эквивалентно.

## optimize_skip_merged_partitions \{#optimize_skip_merged_partitions\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает оптимизацию для запроса [OPTIMIZE TABLE ... FINAL](../../sql-reference/statements/optimize.md), если есть только одна часть с уровнем > 0 и для неё не истёк TTL.

- `OPTIMIZE TABLE ... FINAL SETTINGS optimize_skip_merged_partitions=1`

По умолчанию запрос `OPTIMIZE TABLE ... FINAL` перезаписывает эту часть, даже если она единственная.

Возможные значения:

- 1 — включить оптимизацию.
- 0 — выключить оптимизацию.

## optimize_skip_unused_shards \{#optimize_skip_unused_shards\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает пропуск неиспользуемых шардов для запросов [SELECT](../../sql-reference/statements/select/index.md), которые содержат условие по шардирующему ключу в `WHERE/PREWHERE` (при условии, что данные распределены по шардирующему ключу, иначе запрос вернёт некорректный результат).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## optimize_skip_unused_shards_limit \{#optimize_skip_unused_shards_limit\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Ограничение на количество значений ключа шардирования. Если это ограничение достигнуто, настройка `optimize_skip_unused_shards` отключается.

Слишком большое количество значений может потребовать значительных вычислительных ресурсов на обработку, при этом выгода сомнительна, поскольку если у вас огромное количество значений в `IN (...)`, то, скорее всего, запрос всё равно будет отправлен на все шарды.

## optimize_skip_unused_shards_nesting \{#optimize_skip_unused_shards_nesting\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Определяет, как работает [`optimize_skip_unused_shards`](#optimize_skip_unused_shards) (и, следовательно, по‑прежнему требует включения [`optimize_skip_unused_shards`](#optimize_skip_unused_shards)) в зависимости от уровня вложенности распределённого запроса (когда у вас есть таблица `Distributed`, которая обращается к другой таблице `Distributed`).

Возможные значения:

- 0 — Отключено, `optimize_skip_unused_shards` всегда работает, независимо от уровня вложенности.
- 1 — Включает `optimize_skip_unused_shards` только для первого уровня.
- 2 — Включает `optimize_skip_unused_shards` до второго уровня включительно.

## optimize_skip_unused_shards_rewrite_in \{#optimize_skip_unused_shards_rewrite_in\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Переписывает оператор `IN` в запросе на удалённых шардах, чтобы исключить значения, которые не принадлежат этому шарду (требуется `optimize_skip_unused_shards`).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## optimize_sorting_by_input_stream_properties \{#optimize_sorting_by_input_stream_properties\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Оптимизирует сортировку с учётом свойств входного потока

## optimize_substitute_columns \{#optimize_substitute_columns\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать [ограничения](../../sql-reference/statements/create/table.md/#constraints) для замены столбцов. Значение по умолчанию — `false`.

Возможные значения:

- true, false

## optimize&#95;syntax&#95;fuse&#95;functions

<SettingsInfoBlock type="Bool" default_value="0" />

Включает объединение агрегатных функций с одинаковым аргументом. Переписывает запрос, который содержит как минимум две агрегатные функции [sum](/sql-reference/aggregate-functions/reference/sum), [count](/sql-reference/aggregate-functions/reference/count) или [avg](/sql-reference/aggregate-functions/reference/avg) с одинаковым аргументом, в [sumCount](/sql-reference/aggregate-functions/reference/sumcount).

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


## optimize_throw_if_noop \{#optimize_throw_if_noop\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает выбрасывание исключения, если запрос [OPTIMIZE](../../sql-reference/statements/optimize.md) не выполнил слияние.

По умолчанию `OPTIMIZE` успешно завершается, даже если он ничего не сделал. Этот параметр позволяет различать эти ситуации и узнать причину из сообщения об исключении.

Возможные значения:

- 1 — выбрасывание исключения включено.
- 0 — выбрасывание исключения отключено.

## optimize_time_filter_with_preimage \{#optimize_time_filter_with_preimage\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Оптимизировать предикаты типов Date и DateTime путём преобразования функций в эквивалентные сравнения без приведения типов (например, toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31')"}]}]}/>

Оптимизировать предикаты типов Date и DateTime путём преобразования функций в эквивалентные сравнения без приведения типов (например, `toYear(col) = 2023 -> col >= '2023-01-01' AND col <= '2023-12-31'`)

## optimize_trivial_approximate_count_query \{#optimize_trivial_approximate_count_query\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать приблизительное значение при тривиальной оптимизации COUNT в хранилищах, которые поддерживают такую оценку, например EmbeddedRocksDB.

Возможные значения:

- 0 — оптимизация отключена.
   - 1 — оптимизация включена.

## optimize_trivial_count_query \{#optimize_trivial_count_query\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию тривиального запроса `SELECT count() FROM table` с использованием метаданных из MergeTree. Если вам нужно использовать защиту на уровне строк (row-level security), отключите этот параметр.

Возможные значения:

- 0 — оптимизация отключена.
   - 1 — оптимизация включена.

См. также:

- [optimize_functions_to_subcolumns](#optimize_functions_to_subcolumns)

## optimize_trivial_insert_select \{#optimize_trivial_insert_select\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Оптимизация во многих случаях не имеет смысла."}]}]}/>

Оптимизация тривиальных запросов «INSERT INTO table SELECT ... FROM TABLES»

## optimize_uniq_to_count \{#optimize_uniq_to_count\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Переписывает `uniq` и его варианты (кроме `uniqUpTo`) в функцию `count`, если подзапрос использует `DISTINCT` или предложение `GROUP BY`.

## optimize_use_implicit_projections \{#optimize_use_implicit_projections\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Автоматически выбирать неявные проекции при выполнении запроса SELECT

## optimize_use_projection_filtering \{#optimize_use_projection_filtering\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "New setting"}]}]}/>

Включает использование проекций для фильтрации диапазонов партиций, даже если проекции не выбраны для выполнения запроса SELECT.

## optimize_use_projections \{#optimize_use_projections\} 

**Псевдонимы**: `allow_experimental_projection_optimization`

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию с использованием [проекций](../../engines/table-engines/mergetree-family/mergetree.md/#projections) при обработке запросов `SELECT`.

Возможные значения:

- 0 — Оптимизация с использованием проекций отключена.
- 1 — Оптимизация с использованием проекций включена.

## optimize_using_constraints \{#optimize_using_constraints\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать [ограничения](../../sql-reference/statements/create/table.md/#constraints) для оптимизации запросов. Значение по умолчанию — `false`.

Возможные значения:

- true, false

## os_threads_nice_value_materialized_view \{#os_threads_nice_value_materialized_view\} 

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting."}]}]}/>

Значение `nice` Linux для потоков материализованного представления. Более низкие значения означают более высокий приоритет использования CPU.

Требуется привилегия CAP_SYS_NICE, иначе параметр не оказывает эффекта.

Возможные значения: от -20 до 19.

## os_threads_nice_value_query \{#os_threads_nice_value_query\} 

**Псевдонимы**: `os_thread_priority`

<SettingsInfoBlock type="Int32" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Значение nice в Linux для потоков обработки запросов. Меньшие значения означают более высокий приоритет использования CPU.

Требуются привилегии CAP_SYS_NICE, в противном случае параметр не оказывает эффекта.

Возможные значения: от -20 до 19.

## output_format_compression_level \{#output_format_compression_level\} 

<SettingsInfoBlock type="UInt64" default_value="3" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "3"},{"label": "Добавлена возможность менять уровень сжатия в результирующем выводе запроса"}]}]}/>

Уровень сжатия по умолчанию, если вывод запроса сжимается. Параметр применяется, когда запрос `SELECT` содержит `INTO OUTFILE` или при записи в табличные функции `file`, `url`, `hdfs`, `s3` или `azureBlobStorage`.

Возможные значения: от `1` до `22`

## output_format_compression_zstd_window_log \{#output_format_compression_zstd_window_log\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Позволяет изменять zstd window log в выводе запроса при использовании сжатия zstd"}]}]}/>

Может использоваться, когда метод сжатия вывода — `zstd`. Если значение больше `0`, эта настройка явно задаёт размер окна сжатия (степень двойки) и включает режим long-range для сжатия zstd. Это может помочь достичь лучшего коэффициента сжатия.

Возможные значения: неотрицательные числа. Обратите внимание, что если значение слишком маленькое или слишком большое, `zstdlib` выбросит исключение. Типичные значения — от `20` (размер окна = `1 МБ`) до `30` (размер окна = `1 ГБ`).

## output_format_parallel_formatting \{#output_format_parallel_formatting\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает параллельное форматирование данных. Поддерживается только для форматов [TSV](/interfaces/formats/TabSeparated), [TSKV](/interfaces/formats/TSKV), [CSV](/interfaces/formats/CSV) и [JSONEachRow](/interfaces/formats/JSONEachRow).

Возможные значения:

- 1 — Включено.
- 0 — Отключено.

## page_cache_block_size \{#page_cache_block_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1048576"},{"label": "Сделали эту настройку регулируемой на уровне отдельного запроса."}]}]}/>

Размер файловых блоков для хранения в пользовательском кэше страниц (userspace page cache), в байтах. Все операции чтения, которые проходят через кэш, будут округляться в большую сторону до значения, кратного этому размеру.

Этот параметр можно изменять на уровне отдельного запроса, но элементы кэша с разными размерами блоков не могут повторно использоваться. Изменение этого параметра фактически делает существующие записи в кэше недействительными.

Большее значение, например 1 MiB, хорошо подходит для запросов с высокой пропускной способностью, а меньшее значение, например 64 KiB, хорошо подходит для точечных запросов с низкой задержкой.

## page_cache_inject_eviction \{#page_cache_inject_eviction\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Добавлен кэш страниц в пространстве пользователя"}]}]}/>

Кэш страниц в пространстве пользователя иногда будет случайным образом вытеснять отдельные страницы. Предназначен для тестирования.

## page_cache_lookahead_blocks \{#page_cache_lookahead_blocks\} 

<SettingsInfoBlock type="UInt64" default_value="16" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "16"},{"label": "Сделали эту настройку регулируемой на уровне отдельного запроса."}]}]}/>

При промахе по кэшу страниц в пространстве пользователя считывает до указанного количества последовательных блоков за один раз из нижележащего хранилища, если их также нет в кэше. Каждый блок имеет размер page_cache_block_size байт.

Большее значение подходит для запросов с высокой пропускной способностью, тогда как точечные запросы с низкой задержкой лучше работают без упреждающего чтения.

## parallel_distributed_insert_select \{#parallel_distributed_insert_select\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "2"},{"label": "Enable parallel distributed insert select by default"}]}]}/>

Включает параллельное распределённое выполнение запроса `INSERT ... SELECT`.

Если выполняются запросы `INSERT INTO distributed_table_a SELECT ... FROM distributed_table_b`, и обе таблицы используют один и тот же кластер, а обе таблицы являются либо [реплицируемыми](../../engines/table-engines/mergetree-family/replication.md), либо нереплицируемыми, то такой запрос обрабатывается локально на каждом шарде.

Возможные значения:

- `0` — Отключено.
- `1` — `SELECT` будет выполняться на каждом шарде по базовой таблице движка `Distributed`.
- `2` — `SELECT` и `INSERT` будут выполняться на каждом шарде из/в базовую таблицу движка `Distributed`.

При использовании этой настройки требуется установить `enable_parallel_replicas = 1`.

## parallel_hash_join_threshold \{#parallel_hash_join_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="100000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "100000"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}, {"id": "row-3","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

Когда используется алгоритм хеш-соединения (hash-based join), этот порог помогает выбрать между использованием `hash` и `parallel_hash` (только если доступна оценка размера правой таблицы).
Вариант `hash` применяется, когда известно, что размер правой таблицы ниже порога.

## parallel_replica_offset \{#parallel_replica_offset\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

Это внутренний параметр, который не следует использовать напрямую и который отражает детали реализации режима «parallel replicas». Этот параметр автоматически задаётся сервером-инициатором распределённых запросов для индекса реплики, участвующей в обработке запроса в режиме параллельных реплик.

## parallel_replicas_allow_in_with_subquery \{#parallel_replicas_allow_in_with_subquery\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Если значение равно true, подзапрос для IN будет выполняться на каждой ведомой реплике"}]}]}/>

Если значение равно true, подзапрос для IN будет выполняться на каждой ведомой реплике.

## parallel_replicas_connect_timeout_ms \{#parallel_replicas_connect_timeout_ms\} 

<BetaBadge/>

<SettingsInfoBlock type="Milliseconds" default_value="300" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "300"},{"label": "Separate connection timeout for parallel replicas queries"}]}]}/>

Таймаут в миллисекундах для подключения к удалённой реплике во время выполнения запроса с параллельными репликами. Если время ожидания истекло, соответствующая реплика не используется для выполнения запроса.

## parallel_replicas_count \{#parallel_replicas_count\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

Это внутренняя настройка, которую не следует использовать напрямую; она представляет собой деталь реализации режима `parallel replicas`. Для распределённых запросов эта настройка автоматически устанавливается сервером-инициатором в количество параллельных реплик, участвующих в обработке запроса.

## parallel_replicas_custom_key \{#parallel_replicas_custom_key\} 

<BetaBadge/>

Произвольное целочисленное выражение, которое может использоваться для распределения работы между репликами для отдельной таблицы.
Значением может быть любое целочисленное выражение.

Предпочтительно использовать простые выражения с первичными ключами.

Если настройка используется в кластере, состоящем из одного шарда с несколькими репликами, эти реплики будут преобразованы в виртуальные шарды.
В противном случае поведение будет таким же, как и для ключа `SAMPLE`: будут использоваться несколько реплик каждого шарда.

## parallel_replicas_custom_key_range_lower \{#parallel_replicas_custom_key_range_lower\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Добавлены настройки для управления фильтром диапазона при использовании параллельных реплик с динамическими шардами"}]}]}/>

Позволяет фильтру типа `range` равномерно распределять работу между репликами на основе пользовательского диапазона `[parallel_replicas_custom_key_range_lower, INT_MAX]`.

При совместном использовании с [parallel_replicas_custom_key_range_upper](#parallel_replicas_custom_key_range_upper) позволяет фильтру равномерно распределять работу между репликами для диапазона `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]`.

Примечание: эта настройка не приводит к дополнительной фильтрации данных при обработке запроса, а изменяет границы, по которым фильтр диапазона разбивает интервал `[0, INT_MAX]` для параллельной обработки.

## parallel_replicas_custom_key_range_upper \{#parallel_replicas_custom_key_range_upper\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Добавлены настройки для управления диапазонным фильтром при использовании параллельных реплик с динамическими шардами. Значение 0 отключает верхний предел."}]}]}/>

Позволяет фильтру типа `range` равномерно распределять объём работы между репликами на основе пользовательского диапазона `[0, parallel_replicas_custom_key_range_upper]`. Значение 0 отключает верхнюю границу, устанавливая её в максимальное значение выражения пользовательского ключа.

При совместном использовании с [parallel_replicas_custom_key_range_lower](#parallel_replicas_custom_key_range_lower) позволяет фильтру равномерно распределять объём работы между репликами для диапазона `[parallel_replicas_custom_key_range_lower, parallel_replicas_custom_key_range_upper]`.

Примечание: эта настройка не приводит к дополнительной фильтрации данных при выполнении запроса, а изменяет только точки, в которых диапазонный фильтр разбивает диапазон `[0, INT_MAX]` для параллельной обработки.

## parallel_replicas_for_cluster_engines \{#parallel_replicas_for_cluster_engines\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "1"},{"label": "Новая настройка."}]}]}/>

Замените движки табличных функций на их варианты -Cluster

## parallel_replicas_for_non_replicated_merge_tree \{#parallel_replicas_for_non_replicated_merge_tree\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено в true, ClickHouse будет использовать алгоритм parallel replicas также для нереплицированных таблиц MergeTree

## parallel_replicas_index_analysis_only_on_coordinator \{#parallel_replicas_index_analysis_only_on_coordinator\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "Анализ индексов выполняется только на реплике-координаторе и не выполняется на остальных репликах. Параметр действует только при включенном parallel_replicas_local_plan"}]}, {"id": "row-2","items": [{"label": "24.10"},{"label": "1"},{"label": "Анализ индексов выполняется только на реплике-координаторе и не выполняется на остальных репликах. Параметр действует только при включенном parallel_replicas_local_plan"}]}]}/>

Анализ индексов выполняется только на реплике-координаторе и не выполняется на остальных репликах. Параметр действует только при включенном parallel_replicas_local_pla

## parallel_replicas_insert_select_local_pipeline \{#parallel_replicas_insert_select_local_pipeline\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Использовать локальный конвейер при распределённом INSERT SELECT с параллельными репликами. В настоящее время отключено из-за проблем с производительностью"}]}, {"id": "row-2","items": [{"label": "25.4"},{"label": "0"},{"label": "Использовать локальный конвейер при распределённом INSERT SELECT с параллельными репликами. В настоящее время отключено из-за проблем с производительностью"}]}]}/>

Использовать локальный конвейер при распределённом INSERT SELECT с параллельными репликами

## parallel_replicas_local_plan \{#parallel_replicas_local_plan\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Использовать локальный план для локальной реплики в запросах с параллельными репликами"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "Использовать локальный план для локальной реплики в запросах с параллельными репликами"}]}, {"id": "row-3","items": [{"label": "24.10"},{"label": "1"},{"label": "Использовать локальный план для локальной реплики в запросах с параллельными репликами"}]}]}/>

Построить локальный план для локальной реплики

## parallel_replicas_mark_segment_size \{#parallel_replicas_mark_segment_size\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.9"},{"label": "0"},{"label": "Значение этого параметра теперь определяется автоматически"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "128"},{"label": "Добавлен новый параметр для управления размером сегмента в новой реализации координатора параллельных реплик"}]}]}/>

Части виртуально разбиваются на сегменты, которые распределяются между репликами для параллельного чтения. Этот параметр задаёт размер этих сегментов. Не рекомендуется изменять его, пока вы не будете абсолютно уверены в том, что делаете. Значение должно быть в диапазоне [128, 16384].

## parallel_replicas_min_number_of_rows_per_replica \{#parallel_replicas_min_number_of_rows_per_replica\} 

<BetaBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает количество реплик, используемых в запросе, значением (оценочным числом строк для чтения / parallel_replicas_min_number_of_rows_per_replica). Максимум по-прежнему ограничен параметром `max_parallel_replicas`.

## parallel_replicas_mode \{#parallel_replicas_mode\} 

<BetaBadge/>

<SettingsInfoBlock type="ParallelReplicasMode" default_value="read_tasks" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "read_tasks"},{"label": "Этот параметр был введён в рамках перевода функциональности параллельных реплик в статус бета-версии"}]}]}/>

Тип фильтра, используемого с пользовательским ключом для параллельных реплик. `default` — использовать операцию по модулю для пользовательского ключа, `range` — использовать диапазонный фильтр по пользовательскому ключу, используя все возможные значения типа данных этого ключа.

## parallel_replicas_only_with_analyzer \{#parallel_replicas_only_with_analyzer\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Параллельные реплики поддерживаются только при включённом анализаторе"}]}]}/>

Для использования параллельных реплик анализатор должен быть включён. Если анализатор отключён, выполнение запроса возвращается к локальному режиму, даже если параллельное чтение с реплик включено. Использование параллельных реплик при отключённом анализаторе не поддерживается.

## parallel_replicas_prefer_local_join \{#parallel_replicas_prefer_local_join\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Если параметр включен и JOIN может быть выполнен с использованием алгоритма параллельных реплик, а все хранилища правой части JOIN относятся к *MergeTree, будет использован локальный JOIN вместо GLOBAL JOIN."}]}]}/>

Если параметр включен и JOIN может быть выполнен с использованием алгоритма параллельных реплик, а все хранилища правой части JOIN относятся к *MergeTree, будет использован локальный JOIN вместо GLOBAL JOIN.

## parallel_replicas_support_projection \{#parallel_replicas_support_projection\} 

<BetaBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Новая настройка. Оптимизация проекций может применяться на параллельных репликах. Работает только при включённом parallel_replicas_local_plan и выключенном aggregation_in_order."}]}]}/>

Оптимизация проекций может применяться на параллельных репликах. Работает только при включённом parallel_replicas_local_plan и выключенном aggregation_in_order.

## parallel_view_processing \{#parallel_view_processing\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает параллельную запись данных в подключённые представления вместо последовательной.

## parallelize_output_from_storages \{#parallelize_output_from_storages\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "Включает параллелизм при выполнении запросов, читающих из файлов/URL/S3 и т. д. Порядок строк может измениться."}]}]}/>

Параллелизует вывод на этапе чтения из хранилищ. Это позволяет, по возможности, выполнять параллельную обработку запроса сразу после чтения из хранилищ.

## parsedatetime_e_requires_space_padding \{#parsedatetime_e_requires_space_padding\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "0"},{"label": "Улучшена совместимость с MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

Форматтер '%e' в функции 'parseDateTime' ожидает, что однозначные значения дня дополнены пробелом слева, например, `' 2'` принимается, а `'2'` приводит к ошибке.

## parsedatetime_parse_without_leading_zeros \{#parsedatetime_parse_without_leading_zeros\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.11"},{"label": "1"},{"label": "Улучшена совместимость с MySQL DATE_FORMAT/STR_TO_DATE"}]}]}/>

Спецификаторы формата '%c', '%l' и '%k' в функции 'parseDateTime' разбирают месяцы и часы без ведущих нулей.

## partial_merge_join_left_table_buffer_bytes \{#partial_merge_join_left_table_buffer_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если значение не равно 0, объединяет блоки левой таблицы в более крупные при частичном соединении слиянием (partial merge join). Использует до двукратного указанного объёма памяти на поток соединения.

## partial_merge_join_rows_in_right_blocks \{#partial_merge_join_rows_in_right_blocks\} 

<SettingsInfoBlock type="UInt64" default_value="65536" />

Ограничивает размер блоков данных правой части соединения в алгоритме частичного слияния для запросов [JOIN](../../sql-reference/statements/select/join.md).

Сервер ClickHouse:

1.  Разбивает данные правой части соединения на блоки с количеством строк не более заданного.
2.  Индексирует каждый блок по его минимальным и максимальным значениям.
3.  Выгружает подготовленные блоки на диск, если это возможно.

Возможные значения:

- Любое положительное целое число. Рекомендуемый диапазон значений: \[1000, 100000\].

## partial_result_on_first_cancel \{#partial_result_on_first_cancel\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет возвращать частичный результат при отмене запроса.

## parts_to_delay_insert \{#parts_to_delay_insert\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если целевая таблица содержит как минимум столько активных кусков в одном разделе, то вставка в таблицу будет искусственно замедлена.

## parts_to_throw_insert \{#parts_to_throw_insert\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если в одной партиции целевой таблицы число активных кусков превышает это значение, выбрасывается исключение 'Too many parts ...'.

## per_part_index_stats \{#per_part_index_stats\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

Логирует статистику индекса по частям

## poll_interval \{#poll_interval\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

Блокирует цикл ожидания запроса на сервере на указанное количество секунд.

## postgresql_connection_attempt_timeout \{#postgresql_connection_attempt_timeout\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "Позволяет управлять параметром 'connect_timeout' подключения к PostgreSQL."}]}]}/>

Тайм-аут в секундах для одной попытки установления соединения с конечной точкой PostgreSQL.
Значение передаётся как параметр `connect_timeout` в URL подключения.

## postgresql_connection_pool_auto_close_connection \{#postgresql_connection_pool_auto_close_connection\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Закрывать соединение перед возвратом его в пул.

## postgresql_connection_pool_retries \{#postgresql_connection_pool_retries\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "2"},{"label": "Позволяет задать число повторных попыток в пуле подключений PostgreSQL."}]}]}/>

Число повторных попыток операций push/pop в пуле подключений для движка таблицы PostgreSQL и движка базы данных PostgreSQL.

## postgresql_connection_pool_size \{#postgresql_connection_pool_size\} 

<SettingsInfoBlock type="UInt64" default_value="16" />

Размер пула подключений для движка таблицы PostgreSQL и движка базы данных PostgreSQL.

## postgresql_connection_pool_wait_timeout \{#postgresql_connection_pool_wait_timeout\} 

<SettingsInfoBlock type="UInt64" default_value="5000" />

Таймаут операций push/pop в пул соединений при пустом пуле для движка таблиц PostgreSQL и движка базы данных PostgreSQL. По умолчанию при пустом пуле операции будут блокироваться.

## postgresql_fault_injection_probability \{#postgresql_fault_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Новая настройка"}]}]}/>

Примерная вероятность отказа внутренних запросов PostgreSQL, используемых для репликации. Допустимое значение находится в интервале [0.0f, 1.0f].

## prefer&#95;column&#95;name&#95;to&#95;alias

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает использование исходных имён столбцов вместо алиасов в выражениях и конструкциях запроса. Это особенно важно, когда алиас совпадает с именем столбца, см. [Expression Aliases](/sql-reference/syntax#notes-on-usage). Включите этот параметр, чтобы сделать правила синтаксиса алиасов в ClickHouse более совместимыми с большинством других систем управления базами данных.

Возможные значения:

* 0 — Имя столбца заменяется алиасом.
* 1 — Имя столбца не заменяется алиасом.

**Пример**

Разница между включённой и отключённой настройкой:

Запрос:

```sql
SET prefer_column_name_to_alias = 0;
SELECT avg(number) AS number, max(number) FROM numbers(10);
```

Результат:

```text
Получено исключение от сервера (версия 21.5.1):
Код: 184. DB::Exception: Получено от localhost:9000. DB::Exception: Агрегатная функция avg(number) найдена внутри другой агрегатной функции в запросе: При обработке avg(number) AS number.
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


## prefer_external_sort_block_bytes \{#prefer_external_sort_block_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="16744704" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.5"},{"label": "16744704"},{"label": "Использовать максимально возможный размер блока для внешней сортировки, чтобы сократить потребление памяти при слиянии."}]}]}/>

Использовать максимально возможный размер блока для внешней сортировки, чтобы сократить потребление памяти при слиянии.

## prefer_global_in_and_join \{#prefer_global_in_and_join\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает замену операторов `IN`/`JOIN` на `GLOBAL IN`/`GLOBAL JOIN`.

Возможные значения:

- 0 — Отключено. Операторы `IN`/`JOIN` не заменяются на `GLOBAL IN`/`GLOBAL JOIN`.
- 1 — Включено. Операторы `IN`/`JOIN` заменяются на `GLOBAL IN`/`GLOBAL JOIN`.

**Использование**

Хотя `SET distributed_product_mode=global` может изменить поведение запросов для распределённых таблиц, эта настройка не подходит для локальных таблиц или таблиц из внешних источников. В таких случаях используется `prefer_global_in_and_join`.

Например, у нас есть узлы, обслуживающие запросы, которые содержат локальные таблицы, не предназначенные для распределения. Нам нужно «рассыпать» их данные на лету во время распределённой обработки с помощью ключевого слова `GLOBAL` — `GLOBAL IN`/`GLOBAL JOIN`.

Ещё один вариант использования `prefer_global_in_and_join` — доступ к таблицам, созданным внешними движками. Эта настройка помогает уменьшить количество вызовов к внешним источникам при объединении таких таблиц: выполняется только один вызов на запрос.

**См. также:**

- [Распределённые подзапросы](/sql-reference/operators/in#distributed-subqueries) для получения дополнительной информации о том, как использовать `GLOBAL IN`/`GLOBAL JOIN`

## prefer_localhost_replica \{#prefer_localhost_replica\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает предпочтительное использование локальной реплики (localhost) при обработке распределённых запросов.

Возможные значения:

- 1 — ClickHouse всегда отправляет запрос на локальную реплику (localhost), если она существует.
- 0 — ClickHouse использует стратегию балансировки, заданную настройкой [load_balancing](#load_balancing).

:::note
Отключите эту настройку, если вы используете [max_parallel_replicas](#max_parallel_replicas) без [parallel_replicas_custom_key](#parallel_replicas_custom_key).
Если [parallel_replicas_custom_key](#parallel_replicas_custom_key) задан, отключайте эту настройку только в том случае, если она используется в кластере с несколькими шардами, содержащими несколько реплик.
Если настройка используется в кластере с одним шардом и несколькими репликами, отключение этой настройки приведёт к негативным эффектам.
:::

## prefer_warmed_unmerged_parts_seconds \{#prefer_warmed_unmerged_parts_seconds\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Int64" default_value="0" />

Имеет эффект только в ClickHouse Cloud. Если слитая часть была создана менее чем указанное количество секунд назад и не была предварительно прогрета (см. [cache_populated_by_fetch](merge-tree-settings.md/#cache_populated_by_fetch)), но все её исходные части доступны и прогреты, то запросы SELECT будут читать данные из этих исходных частей. Применимо только к Replicated-/SharedMergeTree. Обратите внимание, что здесь проверяется только то, была ли часть обработана CacheWarmer: если часть была загружена в кэш чем-то ещё, она всё равно будет считаться холодной, пока до неё не дойдёт CacheWarmer; если она была прогрета, а затем вытеснена из кэша, она всё равно будет считаться тёплой.

## preferred_block_size_bytes \{#preferred_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />

Этот параметр настраивает размер блока данных для обработки запросов и служит дополнительной тонкой настройкой по сравнению с более грубым параметром `max_block_size`. Если столбцы большие и при `max_block_size` строк размер блока, вероятно, будет превышать заданное количество байт, его размер будет уменьшен для лучшего использования кэша процессора.

## preferred_max_column_in_block_size_bytes \{#preferred_max_column_in_block_size_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на максимальный размер столбца в блоке при чтении. Помогает уменьшить количество промахов кэша. Значение параметра должно быть близко к размеру кэша L2.

## preferred_optimize_projection_name \{#preferred_optimize_projection_name\} 

Если параметру задано непустое строковое значение, ClickHouse попытается применить указанную проекцию в запросе.

Возможные значения:

- string: имя предпочитаемой проекции

## prefetch_buffer_size \{#prefetch_buffer_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Максимальный размер буфера упреждающего чтения из файловой системы.

## print&#95;pretty&#95;type&#95;names

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


## priority \{#priority\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Приоритет запроса. 1 — самый высокий, большее значение — более низкий приоритет; 0 — не использовать приоритеты.

## promql_database \{#promql_database\} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "Новый экспериментальный параметр"}]}]}/>

Определяет имя базы данных, используемой диалектом `promql`. Пустая строка означает, что используется текущая база данных.

## promql_evaluation_time \{#promql_evaluation_time\} 

<ExperimentalBadge/>

**Псевдонимы**: `evaluation_time`

<SettingsInfoBlock type="FloatAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "auto"},{"label": "Настройка была переименована. Предыдущее название — `evaluation_time`."}]}]}/>

Задает момент времени вычисления, используемый диалектом PromQL. Значение `auto` означает текущее время.

## promql_table \{#promql_table\} 

<ExperimentalBadge/>

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": ""},{"label": "Новый экспериментальный параметр"}]}]}/>

Задаёт имя таблицы `TimeSeries`, используемой диалектом `promql`.

## push_external_roles_in_interserver_queries \{#push_external_roles_in_interserver_queries\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "New setting."}]}]}/>

Включает передачу пользовательских ролей от инициатора запроса на другие узлы при выполнении запроса.

## query_cache_compress_entries \{#query_cache_compress_entries\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Сжимает записи в [кэше запросов](../query-cache.md). Уменьшает потребление памяти кэшем запросов за счет более медленной вставки в него и чтения из него.

Возможные значения:

- 0 - Отключено
- 1 - Включено

## query_cache_max_entries \{#query_cache_max_entries\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество результатов запросов, которое текущий пользователь может хранить в [кеше запросов](../query-cache.md). 0 означает отсутствие ограничения.

Возможные значения:

- Положительное целое число, >= 0.

## query_cache_max_size_in_bytes \{#query_cache_max_size_in_bytes\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объем памяти (в байтах), который текущий пользователь может выделить для [кеша запросов](../query-cache.md). 0 означает отсутствие ограничений.

Возможные значения:

- Целое число, большее либо равное 0.

## query_cache_min_query_duration \{#query_cache_min_query_duration\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Минимальная продолжительность в миллисекундах, в течение которой запрос должен выполняться, чтобы его результат был сохранён в [кэше запросов](../query-cache.md).

Возможные значения:

- Положительное целое число >= 0.

## query_cache_min_query_runs \{#query_cache_min_query_runs\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Минимальное количество запусков запроса `SELECT`, прежде чем его результат будет сохранён в [кэше запросов](../query-cache.md).

Возможные значения:

- Положительное целое число >= 0.

## query_cache_nondeterministic_function_handling \{#query_cache_nondeterministic_function_handling\} 

<SettingsInfoBlock type="QueryResultCacheNondeterministicFunctionHandling" default_value="throw" />

Определяет, как [кэш запросов](../query-cache.md) обрабатывает `SELECT`‑запросы с недетерминированными функциями, например `rand()` или `now()`.

Возможные значения:

- `'throw'` — Сгенерировать исключение и не кэшировать результат запроса.
- `'save'` — Кэшировать результат запроса.
- `'ignore'` — Не кэшировать результат запроса и не генерировать исключение.

## query_cache_share_between_users \{#query_cache_share_between_users\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, результат запросов `SELECT`, кэшируемых в [кэше запросов](../query-cache.md), может быть прочитан другими пользователями.
Не рекомендуется включать этот параметр из соображений безопасности.

Возможные значения:

- 0 - Отключено
- 1 - Включено

## query_cache_squash_partial_results \{#query_cache_squash_partial_results\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Объединять блоки частичных результатов в блоки размера [max_block_size](#max_block_size). Снижает производительность вставок в [кэш запросов](../query-cache.md), но повышает степень сжатия записей кэша (см. [query_cache_compress-entries](#query_cache_compress_entries)).

Возможные значения:

- 0 - Отключено
- 1 - Включено

## query_cache_system_table_handling \{#query_cache_system_table_handling\} 

<SettingsInfoBlock type="QueryResultCacheSystemTableHandling" default_value="throw" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "throw"},{"label": "Кэш запросов больше не кэширует результаты запросов к системным таблицам"}]}]}/>

Определяет, как [кэш запросов](../query-cache.md) обрабатывает запросы `SELECT` к системным таблицам, то есть к таблицам в базах данных `system.*` и `information_schema.*`.

Возможные значения:

- `'throw'` — Выбросить исключение и не кэшировать результат запроса.
- `'save'` — Кэшировать результат запроса.
- `'ignore'` — Не кэшировать результат запроса и не выбрасывать исключение.

## query_cache_tag \{#query_cache_tag\} 

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": ""},{"label": "Новая настройка для добавления меток к записям кэша запросов."}]}]}/>

Строка, которая используется как метка для записей [кэша запросов](../query-cache.md).
Одинаковые запросы с разными метками считаются кэшем запросов разными.

Возможные значения:

- Любая строка

## query_cache_ttl \{#query_cache_ttl\} 

<SettingsInfoBlock type="Seconds" default_value="60" />

По истечении указанного количества секунд записи в [кеше запросов](../query-cache.md) считаются устаревшими.

Возможные значения:

- Положительное целое число ≥ 0.

## query_condition_cache_store_conditions_as_plaintext \{#query_condition_cache_store_conditions_as_plaintext\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

Хранит условие фильтра для [кэша условий запросов](/operations/query-condition-cache) в виде простого текста.
Если включено, `system.query_condition_cache` показывает условие фильтра дословно, что упрощает отладку проблем с кэшем.
По умолчанию отключено, так как условия фильтра в открытом виде могут раскрывать конфиденциальную информацию.

Возможные значения:

- 0 — Отключено
- 1 — Включено

## query_metric_log_interval \{#query_metric_log_interval\} 

<SettingsInfoBlock type="Int64" default_value="-1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "-1"},{"label": "Новая настройка."}]}]}/>

Интервал в миллисекундах, с которым собирается [query_metric_log](../../operations/system-tables/query_metric_log.md) для отдельных запросов.

Если установлено отрицательное значение, используется значение `collect_interval_milliseconds` из [настройки query_metric_log](/operations/server-configuration-parameters/settings#query_metric_log) или, если оно не задано, значение по умолчанию 1000.

Чтобы отключить сбор метрик для одного запроса, установите `query_metric_log_interval` в 0.

Значение по умолчанию: -1

## query_plan_aggregation_in_order \{#query_plan_aggregation_in_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.12"},{"label": "1"},{"label": "Enable some refactoring around query plan"}]}]}/>

Управляет оптимизацией плана запроса для агрегации в порядке следования данных (in-order).
Оказывает эффект только если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) установлена в 1.

:::note
Это настройка для экспертов, которую следует использовать только разработчикам для отладки. В будущем она может измениться с нарушением обратной совместимости или быть удалена.
:::

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_convert_any_join_to_semi_or_anti_join \{#query_plan_convert_any_join_to_semi_or_anti_join\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

Позволяет преобразовывать ANY JOIN в SEMI или ANTI JOIN, если фильтр после JOIN всегда принимает значение `false` для несопоставленных или сопоставленных строк

## query_plan_convert_join_to_in \{#query_plan_convert_join_to_in\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

Разрешает преобразовывать `JOIN` в подзапрос с `IN`, если используются только столбцы из левой таблицы. Может приводить к некорректным результатам для соединений, отличных от `ANY JOIN` (например, `ALL JOIN`, который используется по умолчанию).

## query_plan_convert_outer_join_to_inner_join \{#query_plan_convert_outer_join_to_inner_join\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "1"},{"label": "Разрешает преобразование OUTER JOIN в INNER JOIN, если фильтр после JOIN всегда отфильтровывает значения по умолчанию"}]}]}/>

Разрешает преобразование `OUTER JOIN` в `INNER JOIN`, если фильтр после `JOIN` всегда отфильтровывает значения по умолчанию

## query_plan_direct_read_from_text_index \{#query_plan_direct_read_from_text_index\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting."}]}]}/>

Позволяет выполнять фильтрацию полнотекстового поиска, используя в плане запроса только инвертированный текстовый индекс.

## query_plan_display_internal_aliases \{#query_plan_display_internal_aliases\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

Показывает внутренние псевдонимы (например, __table1) в EXPLAIN PLAN вместо псевдонимов, указанных в исходном запросе.

## query_plan_enable_multithreading_after_window_functions \{#query_plan_enable_multithreading_after_window_functions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает многопоточность после вычисления оконных функций, позволяя обрабатывать потоки параллельно

## query_plan_enable_optimizations \{#query_plan_enable_optimizations\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Переключает оптимизацию запросов на уровне плана запроса.

:::note
Это экспертная настройка, которую разработчикам следует использовать только для отладки. В будущем она может быть изменена с нарушением обратной совместимости или удалена.
:::

Возможные значения:

- 0 — отключить все оптимизации на уровне плана запроса
- 1 — включить оптимизации на уровне плана запроса (но отдельные оптимизации по-прежнему могут быть отключены в их собственных настройках)

## query_plan_execute_functions_after_sorting \{#query_plan_execute_functions_after_sorting\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Переключает оптимизацию на уровне плана запроса, которая переносит вычисление выражений после этапов сортировки.
Вступает в силу только если параметр [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) установлен в значение 1.

:::note
Это параметр экспертного уровня, который должен использоваться только разработчиками для отладки. В будущем параметр может измениться несовместимым с предыдущими версиями образом или быть удалён.
:::

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_filter_push_down \{#query_plan_filter_push_down\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию на уровне плана запроса, которая опускает фильтры ниже по плану выполнения.
Вступает в силу только если параметр [query_plan_enable_optimizations](#query_plan_enable_optimizations) равен 1.

:::note
Это параметр экспертного уровня, который должен использоваться только для отладки разработчиками. В будущем параметр может измениться с нарушением обратной совместимости или быть удалён.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_join_shard_by_pk_ranges \{#query_plan_join_shard_by_pk_ranges\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "New setting"}]}]}/>

Применяет шардинг для JOIN, если ключи соединения содержат префикс первичного ключа для обеих таблиц. Поддерживается для алгоритмов hash, parallel_hash и full_sorting_merge. Обычно не ускоряет выполнение запросов, но может снизить потребление памяти.

## query_plan_join_swap_table \{#query_plan_join_swap_table\} 

<SettingsInfoBlock type="BoolAuto" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "auto"},{"label": "Новая настройка. Ранее всегда выбиралась правая таблица."}]}]}/>

Определяет, какая сторона соединения будет build-таблицей (также называемой внутренней — той, которая вставляется в хеш-таблицу при хеш-соединении) в плане запроса. Эта настройка поддерживается только для строгости соединения `ALL` с предложением `JOIN ON`. Возможные значения:

- 'auto': планировщик сам выбирает, какую таблицу использовать как build-таблицу.
    - 'false': никогда не менять таблицы местами (правая таблица — build-таблица).
    - 'true': всегда менять таблицы местами (левая таблица — build-таблица).

## query_plan_lift_up_array_join \{#query_plan_lift_up_array_join\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию на уровне плана выполнения запроса, которая перемещает операции ARRAY JOIN выше по плану.
Вступает в силу только в том случае, если настройка [query_plan_enable_optimizations](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка для экспертов, которую разработчики должны использовать только для отладки. В будущем она может измениться с нарушением обратной совместимости или быть удалена.
:::

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_lift_up_union \{#query_plan_lift_up_union\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию на уровне плана запроса, которая перемещает крупные поддеревья плана запроса в оператор `UNION`, что позволяет выполнять дальнейшие оптимизации.
Вступает в силу только если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) установлена в 1.

:::note
Это настройка для экспертов, которую следует использовать только разработчикам для отладки. В будущем она может измениться несовместимым с предыдущими версиями образом или быть удалена.
:::

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_max_limit_for_lazy_materialization \{#query_plan_max_limit_for_lazy_materialization\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "10"},{"label": "Добавлена новая настройка для управления максимальным значением лимита, при котором можно использовать план запроса для оптимизации ленивой материализации. Если значение равно нулю, ограничение отсутствует"}]}, {"id": "row-2","items": [{"label": "25.11"},{"label": "100"},{"label": "Более оптимальное значение"}]}]}/>

Управляет максимальным значением лимита, при котором можно использовать план запроса для оптимизации ленивой материализации. Если значение равно нулю, ограничение отсутствует.

## query_plan_max_optimizations_to_apply \{#query_plan_max_optimizations_to_apply\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Ограничивает общее количество оптимизаций, применяемых к плану запроса, см. настройку [query_plan_enable_optimizations](#query_plan_enable_optimizations).
Полезно для предотвращения чрезмерно долгой оптимизации сложных запросов.
В запросе EXPLAIN PLAN оптимизации перестают применяться после достижения этого лимита, и план возвращается как есть.
Для обычного выполнения запроса, если фактическое количество оптимизаций превышает значение этого параметра, выбрасывается исключение.

:::note
Это настройка экспертного уровня, которую разработчики должны использовать только для отладки. Настройка может измениться в будущем несовместимым образом или быть удалена.
:::

## query_plan_max_step_description_length \{#query_plan_max_step_description_length\} 

<SettingsInfoBlock type="UInt64" default_value="500" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "500"},{"label": "New setting"}]}]}/>

Максимальная длина описания шага в EXPLAIN PLAN.

## query_plan_merge_expressions \{#query_plan_merge_expressions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию на уровне плана запроса, которая объединяет последовательные фильтры.
Применяется только если настройка [query_plan_enable_optimizations](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка экспертного уровня, которую следует использовать только для отладки разработчиками. В будущем настройка может быть изменена с нарушением обратной совместимости или удалена.
:::

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_merge_filter_into_join_condition \{#query_plan_merge_filter_into_join_condition\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Добавлена новая настройка для объединения фильтра с условием JOIN"}]}]}/>

Позволяет объединять фильтр с условием `JOIN` и преобразовывать `CROSS JOIN` в `INNER JOIN`.

## query_plan_merge_filters \{#query_plan_merge_filters\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "0"},{"label": "Разрешает слияние фильтров в плане запроса"}]}, {"id": "row-2","items": [{"label": "24.11"},{"label": "1"},{"label": "Разрешает слияние фильтров в плане запроса. Это требуется для корректной поддержки проталкивания фильтров (filter pushdown) с новым анализатором."}]}]}/>

Разрешает слияние фильтров в плане запроса.

## query_plan_optimize_join_order_limit \{#query_plan_optimize_join_order_limit\} 

<SettingsInfoBlock type="UInt64" default_value="10" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "New setting"}]}, {"id": "row-2","items": [{"label": "25.12"},{"label": "10"},{"label": "Allow JOIN reordering with more tables by default"}]}]}/>

Оптимизирует порядок `JOIN` в пределах одного подзапроса. В настоящее время поддерживается только для очень ограниченного числа случаев.
Значение определяет максимальное количество таблиц, для которых выполняется оптимизация.

## query_plan_optimize_lazy_materialization \{#query_plan_optimize_lazy_materialization\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Добавлена новая настройка, использующая план запроса для оптимизации ленивой материализации"}]}]}/>

Использует план запроса для оптимизации ленивой материализации.

## query_plan_optimize_prewhere \{#query_plan_optimize_prewhere\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Разрешает проталкивать фильтр в выражение PREWHERE для поддерживаемых хранилищ"}]}]}/>

Разрешает проталкивать фильтр в выражение PREWHERE для поддерживаемых хранилищ

## query_plan_push_down_limit \{#query_plan_push_down_limit\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает оптимизацию на уровне плана запроса, которая перемещает операторы `LIMIT` вниз по плану выполнения.
Оказывает эффект только если настройка [query_plan_enable_optimizations](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка экспертного уровня, которую следует использовать только разработчикам для отладки. В будущем она может измениться несовместимым образом или быть удалена.
:::

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_read_in_order \{#query_plan_read_in_order\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает оптимизацию чтения в заданном порядке на уровне плана запроса.
Вступает в силу только если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка экспертного уровня, которую следует использовать только для отладки разработчиками. В будущем она может измениться несовместимым образом или быть удалена.
:::

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_remove_redundant_distinct \{#query_plan_remove_redundant_distinct\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.2"},{"label": "1"},{"label": "Удаление избыточного шага DISTINCT в плане запроса"}]}]}/>

Переключает оптимизацию на уровне плана выполнения запроса, которая удаляет избыточные шаги DISTINCT.
Действует только если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка для экспертов, которую следует использовать только разработчикам для отладки. В будущем настройка может измениться с нарушением обратной совместимости или быть удалена.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_remove_redundant_sorting \{#query_plan_remove_redundant_sorting\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.1"},{"label": "1"},{"label": "Удаление избыточной сортировки в плане запроса. Например, шагов сортировки, связанных с предложениями ORDER BY во вложенных запросах"}]}]}/>

Переключает оптимизацию на уровне плана запроса, которая удаляет избыточные шаги сортировки, например во вложенных запросах.
Действует только в том случае, если настройка [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка для экспертов, которую следует использовать только разработчиками для отладки. В будущем она может измениться несовместимым с предыдущими версиями образом или быть удалена.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_remove_unused_columns \{#query_plan_remove_unused_columns\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "Новая настройка. Добавлена оптимизация удаления неиспользуемых столбцов в плане запроса."}]}]}/>

Включает или отключает оптимизацию на уровне плана запроса, которая пытается удалить неиспользуемые столбцы (как входные, так и выходные) из шагов плана запроса.
Применяется только, если настройка [query_plan_enable_optimizations](#query_plan_enable_optimizations) равна 1.

:::note
Это настройка экспертного уровня, которую разработчики должны использовать только для отладки. В будущем она может измениться несовместимым образом или быть удалена.
:::

Возможные значения:

- 0 — отключить
- 1 — включить

## query_plan_reuse_storage_ordering_for_window_functions \{#query_plan_reuse_storage_ordering_for_window_functions\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Переключает оптимизацию на уровне плана запроса, которая использует порядок сортировки данных в хранилище при сортировке для оконных функций.
Вступает в силу только если параметр [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) установлен в 1.

:::note
Это параметр для экспертов, который следует использовать только разработчикам для отладки. В будущем он может измениться несовместимым с предыдущими версиями образом или быть удалён.
:::

Возможные значения:

- 0 - Отключить
- 1 - Включить

## query_plan_split_filter \{#query_plan_split_filter\} 

<SettingsInfoBlock type="Bool" default_value="1" />

:::note
Это настройка экспертного уровня, которую следует использовать только для отладки разработчиками. В будущем она может быть изменена с нарушением обратной совместимости или удалена.
:::

Переключает оптимизацию на уровне плана запроса, которая разбивает фильтры на выражения.
Вступает в силу, только если настройка [query_plan_enable_optimizations](#query_plan_enable_optimizations) равна 1.

Возможные значения:

- 0 — Отключить
- 1 — Включить

## query_plan_text_index_add_hint \{#query_plan_text_index_add_hint\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "1"},{"label": "New setting"}]}]}/>

Разрешает добавлять хинт (дополнительный предикат) к фильтру, сформированному на основе инвертированного текстового индекса в плане запроса.

## query_plan_try_use_vector_search \{#query_plan_try_use_vector_search\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Новая настройка."}]}]}/>

Включает или отключает оптимизацию на уровне плана запроса, которая пытается использовать векторный индекс сходства.
Применяется только если параметр [`query_plan_enable_optimizations`](#query_plan_enable_optimizations) равен 1.

:::note
Это параметр экспертного уровня, который должен использоваться только разработчиками для отладки. В будущем он может измениться несовместимым образом или быть удалён.
:::

Возможные значения:

- 0 — отключить
- 1 — включить

## query_plan_use_new_logical_join_step \{#query_plan_use_new_logical_join_step\} 

**Псевдонимы**: `query_plan_use_logical_join_step`

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "Включить новый шаг"}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Новый шаг соединения, внутреннее изменение"}]}]}/>

Использовать логический шаг соединения в плане выполнения запроса.
Примечание: параметр `query_plan_use_new_logical_join_step` устарел, вместо него используйте `query_plan_use_logical_join_step`.

## query_profiler_cpu_time_period_ns \{#query_profiler_cpu_time_period_ns\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

Устанавливает период таймера процессорного времени для [профилировщика запросов](../../operations/optimizing-performance/sampling-query-profiler.md). Этот таймер учитывает только время работы CPU.

Возможные значения:

- Положительное целое число наносекунд.

    Рекомендуемые значения:

            - 10000000 (100 раз в секунду) наносекунд и больше для одиночных запросов.
            - 1000000000 (один раз в секунду) для профилирования на всем кластере.

- 0 — для отключения таймера.

**Временно отключено в ClickHouse Cloud.**

См. также:

- Системная таблица [trace_log](/operations/system-tables/trace_log)

## query_profiler_real_time_period_ns \{#query_profiler_real_time_period_ns\} 

<SettingsInfoBlock type="UInt64" default_value="1000000000" />

Задает период для таймера реального времени [профилировщика запросов](../../operations/optimizing-performance/sampling-query-profiler.md). Таймер реального времени измеряет фактическое (wall-clock) время.

Возможные значения:

- Положительное целое число в наносекундах.

    Рекомендуемые значения:

            - 10000000 (100 раз в секунду) наносекунд и меньше для одиночных запросов.
            - 1000000000 (один раз в секунду) для профилирования всего кластера.

- 0 для отключения таймера.

**Временно отключено в ClickHouse Cloud.**

См. также:

- Системная таблица [trace_log](/operations/system-tables/trace_log)

## queue_max_wait_ms \{#queue_max_wait_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Время ожидания в очереди запросов, когда количество одновременных запросов превышает максимальное значение.

## rabbitmq_max_wait_ms \{#rabbitmq_max_wait_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

Время ожидания при чтении из RabbitMQ перед повторной попыткой.

## read_backoff_max_throughput \{#read_backoff_max_throughput\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Настройка для уменьшения числа потоков в случае медленного чтения. Считает события, если скорость чтения меньше указанного количества байт в секунду.

## read_backoff_min_concurrency \{#read_backoff_min_concurrency\} 

<SettingsInfoBlock type="UInt64" default_value="1" />

Параметр задаёт минимальное число потоков, которое следует сохранять при медленных операциях чтения.

## read_backoff_min_events \{#read_backoff_min_events\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

Параметр для уменьшения числа потоков в случае медленного чтения. Количество событий, после достижения которого число потоков будет уменьшено.

## read_backoff_min_interval_between_events_ms \{#read_backoff_min_interval_between_events_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

Настройка для уменьшения числа потоков в случае медленного чтения. Игнорировать событие, если с момента предыдущего события прошло меньше заданного интервала времени.

## read_backoff_min_latency_ms \{#read_backoff_min_latency_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="1000" />

Параметр для уменьшения числа потоков в случае медленных чтений. Учитываются только те операции чтения, которые заняли не менее этого времени.

## read_from_distributed_cache_if_exists_otherwise_bypass_cache \{#read_from_distributed_cache_if_exists_otherwise_bypass_cache\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting"}]}]}/>

Действует только в ClickHouse Cloud. То же, что read_from_filesystem_cache_if_exists_otherwise_bypass_cache, но для распределённого кэша.

## read_from_filesystem_cache_if_exists_otherwise_bypass_cache \{#read_from_filesystem_cache_if_exists_otherwise_bypass_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет использовать кэш файловой системы в пассивном режиме — использовать преимущества уже существующих записей кэша, но не добавлять в него новые данные. Если вы включите этот параметр для тяжёлых разовых (ad-hoc) запросов и оставите его отключённым для коротких запросов реального времени, это позволит избежать «перемалывания» кэша слишком тяжёлыми запросами и повысить общую эффективность системы.

## read_from_page_cache_if_exists_otherwise_bypass_cache \{#read_from_page_cache_if_exists_otherwise_bypass_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Добавлен кэш страниц в пространстве пользователя"}]}]}/>

Использует кэш страниц в пространстве пользователя в пассивном режиме, аналогично `read_from_filesystem_cache_if_exists_otherwise_bypass_cache`.

## read_in_order_two_level_merge_threshold \{#read_in_order_two_level_merge_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Минимальное количество частей для чтения, при котором выполняется предварительный этап слияния при многопоточном чтении в порядке первичного ключа.

## read_in_order_use_buffering \{#read_in_order_use_buffering\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.7"},{"label": "1"},{"label": "Использовать буферизацию перед слиянием при чтении в порядке первичного ключа"}]}]}/>

Использовать буферизацию перед слиянием при чтении в порядке первичного ключа. Это увеличивает параллелизм выполнения запросов.

## read_in_order_use_virtual_row \{#read_in_order_use_virtual_row\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "0"},{"label": "Использовать виртуальную строку при чтении в порядке первичного ключа или его монотонной функции. Полезно при поиске по нескольким частям, так как обрабатываются только релевантные."}]}]}/>

Использовать виртуальную строку при чтении в порядке первичного ключа или его монотонной функции. Полезно при поиске по нескольким частям, так как обрабатываются только релевантные.

## read_overflow_mode \{#read_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Что делать при превышении установленного лимита.

## read_overflow_mode_leaf \{#read_overflow_mode_leaf\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет поведение при превышении объёма считываемых данных одного из листовых лимитов.

Возможные значения:

- `throw`: выбросить исключение (по умолчанию).
- `break`: остановить выполнение запроса и вернуть частичный результат.

## read_priority \{#read_priority\} 

<SettingsInfoBlock type="Int64" default_value="0" />

Приоритет чтения данных из локальной или удалённой файловой системы. Поддерживается только для метода 'pread_threadpool' для локальной файловой системы и метода `threadpool` для удалённой файловой системы.

## read_through_distributed_cache \{#read_through_distributed_cache\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "A setting for ClickHouse Cloud"}]}]}/>

Действует только в ClickHouse Cloud. Позволяет читать данные из распределённого кэша

## readonly \{#readonly\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

0 — без ограничений: разрешены операции чтения и записи. 1 — только запросы на чтение, а также изменение явно разрешённых настроек. 2 — только запросы на чтение, а также изменение настроек, за исключением настройки «readonly».

## receive_data_timeout_ms \{#receive_data_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="2000" />

Таймаут ожидания получения первого пакета данных или пакета с положительным значением прогресса от реплики.

## receive_timeout \{#receive_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="300" />

Таймаут получения данных из сети, в секундах. Если в течение этого интервала не было получено ни одного байта, генерируется исключение. Если вы задаёте эту настройку на клиенте, то `send_timeout` для сокета также будет установлен на соответствующем конце соединения на сервере.

## regexp_max_matches_per_row \{#regexp_max_matches_per_row\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Устанавливает максимальное количество совпадений одного регулярного выражения в одной строке. Используйте этот параметр для защиты от перегрузки памяти при использовании жадных регулярных выражений в функции [extractAllGroupsHorizontal](/sql-reference/functions/string-search-functions#extractAllGroupsHorizontal).

Возможные значения:

- Положительное целое число.

## reject_expensive_hyperscan_regexps \{#reject_expensive_hyperscan_regexps\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Отклонять шаблоны, вычисление которых с помощью Hyperscan, вероятнее всего, будет слишком ресурсоёмким (из-за взрывного роста числа состояний НКА)

## remerge_sort_lowered_memory_bytes_ratio \{#remerge_sort_lowered_memory_bytes_ratio\} 

<SettingsInfoBlock type="Float" default_value="2" />

Если после повторной сортировки использование памяти не снизилось как минимум в указанное количество раз, повторная сортировка будет отключена.

## remote_filesystem_read_method \{#remote_filesystem_read_method\} 

<SettingsInfoBlock type="String" default_value="threadpool" />

Метод чтения данных из удалённой файловой системы, одно из значений: read, threadpool.

## remote_filesystem_read_prefetch \{#remote_filesystem_read_prefetch\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать предварительную выборку при чтении данных из удалённой файловой системы.

## remote_fs_read_backoff_max_tries \{#remote_fs_read_backoff_max_tries\} 

<SettingsInfoBlock type="UInt64" default_value="5" />

Максимальное число попыток чтения с задержкой (backoff)

## remote_fs_read_max_backoff_ms \{#remote_fs_read_max_backoff_ms\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное время ожидания при попытке чтения данных с удалённого диска

## remote_read_min_bytes_for_seek \{#remote_read_min_bytes_for_seek\} 

<SettingsInfoBlock type="UInt64" default_value="4194304" />

Минимальный объём данных (в байтах), необходимый при удалённом чтении (url, S3) для использования позиционирования (seek) вместо последовательного чтения с игнорированием.

## rename_files_after_processing \{#rename_files_after_processing\} 

- **Тип:** String

- **Значение по умолчанию:** Пустая строка

Этот параметр позволяет задать шаблон переименования файлов, обрабатываемых табличной функцией `file`. Если опция включена, все файлы, прочитанные табличной функцией `file`, будут переименованы в соответствии с указанным шаблоном с плейсхолдерами, и только в случае успешной обработки файлов.

### Подстановки

- `%a` — Полное исходное имя файла (например, «sample.csv»).
- `%f` — Исходное имя файла без расширения (например, «sample»).
- `%e` — Исходное расширение файла с точкой (например, «.csv»).
- `%t` — Временная метка (в микросекундах).
- `%%` — Знак процента («%»).

### Пример

- Опция: `--rename_files_after_processing="processed_%f_%t%e"`

- Запрос: `SELECT * FROM file('sample.csv')`

Если файл `sample.csv` был успешно прочитан, он будет переименован в `processed_sample_1683473210851438.csv`

## replace_running_query \{#replace_running_query\} 

<SettingsInfoBlock type="Bool" default_value="0" />

При использовании HTTP-интерфейса можно передать параметр 'query_id'. Это любая строка, которая служит идентификатором запроса.
Если в данный момент уже существует запрос от того же пользователя с тем же 'query_id', поведение зависит от параметра 'replace_running_query'.

`0` (по умолчанию) – Выдать исключение (не допускать выполнения запроса, если запрос с тем же 'query_id' уже выполняется).

`1` – Отменить предыдущий запрос и начать выполнение нового.

Установите этот параметр в 1 для реализации подсказок по условиям сегментации. После ввода очередного символа, если предыдущий запрос ещё не завершился, его следует отменить.

## replace_running_query_max_wait_ms \{#replace_running_query_max_wait_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="5000" />

Время ожидания завершения выполняющегося запроса с тем же `query_id`, когда включена настройка [replace_running_query](#replace_running_query).

Возможные значения:

- Положительное целое число.
- 0 — выбрасывается исключение; новый запрос не запускается, если сервер уже выполняет запрос с тем же `query_id`.

## replication_wait_for_inactive_replica_timeout \{#replication_wait_for_inactive_replica_timeout\} 

<SettingsInfoBlock type="Int64" default_value="120" />

Определяет, как долго (в секундах) ждать выполнения запросов [`ALTER`](../../sql-reference/statements/alter/index.md), [`OPTIMIZE`](../../sql-reference/statements/optimize.md) или [`TRUNCATE`](../../sql-reference/statements/truncate.md) на неактивных репликах.

Возможные значения:

- `0` — Не ждать.
- Отрицательное целое число — Ждать неограниченное время.
- Положительное целое число — Количество секунд ожидания.

## restore_replace_external_dictionary_source_to_null \{#restore_replace_external_dictionary_source_to_null\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "New setting."}]}]}/>

При восстановлении заменяет источники внешних словарей на Null. Полезно для тестирования.

## restore_replace_external_engines_to_null \{#restore_replace_external_engines_to_null\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Для тестирования. Заменяет все внешние движки на Null, чтобы не устанавливать внешние подключения.

## restore_replace_external_table_functions_to_null \{#restore_replace_external_table_functions_to_null\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.8"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Для целей тестирования. Заменяет все внешние табличные функции на значение Null, чтобы не устанавливать внешние подключения.

## restore_replicated_merge_tree_to_shared_merge_tree \{#restore_replicated_merge_tree_to_shared_merge_tree\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Заменяет табличный движок Replicated*MergeTree на Shared*MergeTree при выполнении RESTORE.

## result&#95;overflow&#95;mode

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Значение по умолчанию в Cloud: `throw`

Определяет, что делать, если объём результата превышает один из лимитов.

Возможные значения:

* `throw`: выбросить исключение (значение по умолчанию).
* `break`: остановить выполнение запроса и вернуть частичный результат, как если бы
  исходные данные закончились.

Использование `break` похоже на использование LIMIT. `break` прерывает выполнение только на
уровне блоков. Это означает, что число возвращаемых строк будет больше значения
[`max_result_rows`](/operations/settings/settings#max_result_rows), кратно [`max_block_size`](/operations/settings/settings#max_block_size)
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


## rewrite_count_distinct_if_with_count_distinct_implementation \{#rewrite_count_distinct_if_with_count_distinct_implementation\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.8"},{"label": "1"},{"label": "Перезапись countDistinctIf с помощью настройки count_distinct_implementation"}]}]}/>

Позволяет перезаписывать `countDistcintIf` с использованием настройки [count_distinct_implementation](#count_distinct_implementation).

Возможные значения:

- true — разрешить.
- false — запретить.

## rewrite_in_to_join \{#rewrite_in_to_join\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New experimental setting"}]}]}/>

Переписывать выражения вида «x IN subquery» с использованием JOIN. Это может быть полезно для оптимизации всего запроса за счёт перестановки JOIN-ов.

## s3_allow_multipart_copy \{#s3_allow_multipart_copy\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.2"},{"label": "1"},{"label": "New setting."}]}]}/>

Разрешает многокомпонентное копирование в S3.

## s3_allow_parallel_part_upload \{#s3_allow_parallel_part_upload\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать несколько потоков для многосоставной (multipart) загрузки в S3. Это может немного увеличить потребление памяти.

## s3_check_objects_after_upload \{#s3_check_objects_after_upload\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Проверять каждый объект, загруженный в S3, с помощью запроса HEAD, чтобы убедиться, что операция загрузки прошла успешно

## s3_connect_timeout_ms \{#s3_connect_timeout_ms\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1000"},{"label": "Добавлен отдельный параметр для тайм‑аута подключения к s3"}]}]}/>

Тайм-аут подключения к хосту для дисков s3.

## s3_create_new_file_on_insert \{#s3_create_new_file_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает создание нового файла при каждой вставке в таблицы движка S3. Если включено, при каждой вставке будет создаваться новый объект S3 с ключом вида:

изначально: `data.Parquet.gz` -> `data.1.Parquet.gz` -> `data.2.Parquet.gz` и т. д.

Возможные значения:

- 0 — запрос `INSERT` создает новый файл или завершается с ошибкой, если файл уже существует и s3_truncate_on_insert не установлен.
- 1 — запрос `INSERT` создает новый файл при каждой вставке, используя суффикс (начиная со второго файла), если s3_truncate_on_insert не установлен.

Подробнее см. [здесь](/integrations/s3#inserting-data).

## s3_disable_checksum \{#s3_disable_checksum\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Не вычислять контрольную сумму при отправке файла в S3. Это ускоряет операции записи, исключая лишние проходы обработки файла. В большинстве случаев это безопасно, так как данные таблиц MergeTree в любом случае снабжаются контрольными суммами в ClickHouse, а при доступе к S3 по HTTPS уровень TLS уже обеспечивает контроль целостности при передаче по сети. При этом дополнительные контрольные суммы на стороне S3 дают дополнительный уровень защиты.

## s3_ignore_file_doesnt_exist \{#s3_ignore_file_doesnt_exist\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "0"},{"label": "Разрешает возвращать 0 строк, когда запрошенные файлы отсутствуют, вместо выбрасывания исключения в движке таблиц S3"}]}]}/>

Игнорировать отсутствие файлов при чтении по определённым ключам.

Возможные значения:

- 1 — `SELECT` возвращает пустой результат.
- 0 — `SELECT` выбрасывает исключение.

## s3_list_object_keys_size \{#s3_list_object_keys_size\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальное количество файлов, которое может быть возвращено запросом ListObject в одном пакете

## s3_max_connections \{#s3_max_connections\} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

Максимальное число соединений на один сервер.

## s3_max_get_burst \{#s3_max_get_burst\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество запросов, которые можно отправить одновременно до достижения ограничения на количество запросов в секунду. По умолчанию (0) равно `s3_max_get_rps`.

## s3_max_get_rps \{#s3_max_get_rps\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на число GET-запросов к S3 в секунду, после превышения которого начинается throttling. Ноль означает отсутствие ограничения.

## s3_max_inflight_parts_for_one_file \{#s3_max_inflight_parts_for_one_file\} 

<SettingsInfoBlock type="UInt64" default_value="20" />

Максимальное количество частей, загружаемых параллельно в одном запросе многокомпонентной (multipart) загрузки. 0 означает отсутствие ограничения.

## s3_max_part_number \{#s3_max_part_number\} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "10000"},{"label": "Максимальный номер части при загрузке в S3"}]}]}/>

Максимальный номер части при загрузке в S3.

## s3_max_put_burst \{#s3_max_put_burst\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное число запросов, которые могут быть выполнены одновременно до достижения лимита на количество запросов в секунду. По умолчанию значение `0` соответствует `s3_max_put_rps`.

## s3_max_put_rps \{#s3_max_put_rps\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на число S3 PUT-запросов в секунду до начала троттлинга. Ноль означает отсутствие ограничений.

## s3_max_single_operation_copy_size \{#s3_max_single_operation_copy_size\} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "33554432"},{"label": "Максимальный размер для одной операции копирования в S3"}]}]}/>

Максимальный размер для одной операции копирования в S3. Эта настройка используется только, если параметр s3_allow_multipart_copy имеет значение true.

## s3_max_single_part_upload_size \{#s3_max_single_part_upload_size\} 

<SettingsInfoBlock type="UInt64" default_value="33554432" />

Максимальный размер объекта при загрузке в S3 с использованием одиночной (singlepart) загрузки.

## s3_max_single_read_retries \{#s3_max_single_read_retries\} 

<SettingsInfoBlock type="UInt64" default_value="4" />

Максимальное количество повторных попыток во время одной операции чтения из S3.

## s3_max_unexpected_write_error_retries \{#s3_max_unexpected_write_error_retries\} 

<SettingsInfoBlock type="UInt64" default_value="4" />

Максимальное количество повторных попыток в случае неожиданных ошибок при записи в S3.

## s3_max_upload_part_size \{#s3_max_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

Максимальный размер части данных при многочастичной загрузке в S3.

## s3_min_upload_part_size \{#s3_min_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="16777216" />

Минимальный размер части при многокомпонентной (multipart) загрузке в S3.

## s3_request_timeout_ms \{#s3_request_timeout_ms\} 

<SettingsInfoBlock type="UInt64" default_value="30000" />

Таймаут простоя при отправке и получении данных в/из S3. Операция завершается с ошибкой, если один вызов чтения или записи по TCP блокируется дольше этого значения.

## s3_skip_empty_files \{#s3_skip_empty_files\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "Надеемся, что это улучшит пользовательский опыт"}]}]}/>

Включает или отключает пропуск пустых файлов в таблицах движка [S3](../../engines/table-engines/integrations/s3.md).

Возможные значения:

- 0 — `SELECT` генерирует исключение, если пустой файл не совместим с запрошенным форматом.
- 1 — `SELECT` возвращает пустой результат для пустого файла.

## s3_slow_all_threads_after_network_error \{#s3_slow_all_threads_after_network_error\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "New setting"}]}]}/>

Если значение — `true`, все потоки, выполняющие запросы к S3 к одной и той же конечной точке резервного копирования, замедляются
после того, как любой отдельный запрос к S3 получает повторяемую сетевую ошибку, такую как тайм-аут сокета.
Если значение — `false`, каждый поток обрабатывает задержку (backoff) перед повтором S3-запроса независимо от остальных.

## s3_strict_upload_part_size \{#s3_strict_upload_part_size\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Точный размер части для отправки при многочастичной (multipart) загрузке в S3 (некоторые реализации не поддерживают части переменного размера).

## s3_throw_on_zero_files_match \{#s3_throw_on_zero_files_match\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Выдавать ошибку, если запрос ListObjects не находит ни одного файла

## s3_truncate_on_insert \{#s3_truncate_on_insert\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает очистку (truncate) перед вставками в таблицы движка s3. Если параметр отключён, при попытке вставки будет выброшено исключение, если объект в S3 уже существует.

Возможные значения:

- 0 — запрос `INSERT` создаёт новый файл или завершается с ошибкой, если файл существует и s3_create_new_file_on_insert не установлен.
- 1 — запрос `INSERT` заменяет существующее содержимое файла новыми данными.

Подробности см. [здесь](/integrations/s3#inserting-data).

## s3_upload_part_size_multiply_factor \{#s3_upload_part_size_multiply_factor\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

Умножает значение `s3_min_upload_part_size` на этот коэффициент каждый раз, когда в результате одной операции записи в S3 было загружено `s3_multiply_parts_count_threshold` частей.

## s3_upload_part_size_multiply_parts_count_threshold \{#s3_upload_part_size_multiply_parts_count_threshold\} 

<SettingsInfoBlock type="UInt64" default_value="500" />

Каждый раз, когда в S3 загружается такое количество частей, значение s3_min_upload_part_size умножается на s3_upload_part_size_multiply_factor.

## s3_use_adaptive_timeouts \{#s3_use_adaptive_timeouts\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено в `true`, то для всех запросов к S3 первые две попытки выполняются с малыми тайм-аутами отправки и приёма.
Если установлено в `false`, то все попытки выполняются с одинаковыми тайм-аутами.

## s3_validate_request_settings \{#s3_validate_request_settings\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.6"},{"label": "1"},{"label": "Позволяет отключить проверку настроек запросов к S3"}]}]}/>

Включает проверку настроек запросов к S3.
Возможные значения:

- 1 — проверять настройки.
- 0 — не проверять настройки.

## s3queue_default_zookeeper_path \{#s3queue_default_zookeeper_path\} 

<SettingsInfoBlock type="String" default_value="/clickhouse/s3queue/" />

Префикс пути ZooKeeper по умолчанию для движка S3Queue

## s3queue_enable_logging_to_s3queue_log \{#s3queue_enable_logging_to_s3queue_log\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает ведение журнала в system.s3queue_log. Значение может быть переопределено для каждой таблицы с помощью настроек таблицы.

## s3queue_keeper_fault_injection_probability \{#s3queue_keeper_fault_injection_probability\} 

<SettingsInfoBlock type="Float" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Вероятность инъекции сбоев в Keeper для S3Queue.

## s3queue_migrate_old_metadata_to_buckets \{#s3queue_migrate_old_metadata_to_buckets\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Мигрирует старую структуру метаданных таблицы S3Queue на новую

## schema_inference_cache_require_modification_time_for_url \{#schema_inference_cache_require_modification_time_for_url\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать схему из кэша для URL-адресов с проверкой по времени последней модификации (для URL-адресов с заголовком Last-Modified)

## schema_inference_use_cache_for_azure \{#schema_inference_use_cache_for_azure\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш при определении схемы при использовании табличной функции Azure

## schema_inference_use_cache_for_file \{#schema_inference_use_cache_for_file\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш при выводе схемы при использовании табличной функции `file`

## schema_inference_use_cache_for_hdfs \{#schema_inference_use_cache_for_hdfs\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш при определении схемы табличной функции hdfs.

## schema_inference_use_cache_for_s3 \{#schema_inference_use_cache_for_s3\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш при определении схемы при использовании табличной функции S3

## schema_inference_use_cache_for_url \{#schema_inference_use_cache_for_url\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать кэш при определении схемы при использовании табличной функции url

## secondary_indices_enable_bulk_filtering \{#secondary_indices_enable_bulk_filtering\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "Новый алгоритм фильтрации по индексам пропуска данных"}]}]}/>

Включает алгоритм пакетной фильтрации для индексов. Ожидается, что он всегда будет предпочтительнее, но эта настройка сохранена для обеспечения совместимости и контроля.

## select_sequential_consistency \{#select_sequential_consistency\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

:::note
Эта настройка ведет себя по-разному в SharedMergeTree и ReplicatedMergeTree. Подробнее о поведении `select_sequential_consistency` в SharedMergeTree см. раздел [SharedMergeTree consistency](/cloud/reference/shared-merge-tree#consistency).
:::

Включает или отключает последовательную согласованность для запросов `SELECT`. Требует отключения `insert_quorum_parallel` (по умолчанию включен).

Возможные значения:

- 0 — отключено.
- 1 — включено.

Использование

Когда последовательная согласованность включена, ClickHouse позволяет клиенту выполнять запрос `SELECT` только для тех реплик, которые содержат данные всех предыдущих запросов `INSERT`, выполненных с `insert_quorum`. Если клиент обращается к реплике с неполными данными, ClickHouse сгенерирует исключение. Запрос `SELECT` не будет включать данные, которые еще не были записаны в кворум реплик.

Когда `insert_quorum_parallel` включен (значение по умолчанию), `select_sequential_consistency` не работает. Это связано с тем, что параллельные запросы `INSERT` могут быть записаны в разные наборы кворумных реплик, поэтому нет гарантии, что одна отдельная реплика получит все записи.

См. также:

- [insert_quorum](#insert_quorum)
- [insert_quorum_timeout](#insert_quorum_timeout)
- [insert_quorum_parallel](#insert_quorum_parallel)

## send_logs_level \{#send_logs_level\} 

<SettingsInfoBlock type="LogsLevel" default_value="fatal" />

Отправляет текстовые логи сервера клиенту с указанным минимальным уровнем. Допустимые значения: 'trace', 'debug', 'information', 'warning', 'error', 'fatal', 'none'

## send_logs_source_regexp \{#send_logs_source_regexp\} 

Отправляет текстовые журналы сервера, источник которых соответствует заданному регулярному выражению (regexp). Пустое значение означает все источники.

## send_profile_events \{#send_profile_events\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "Новая настройка. Определяет, нужно ли отправлять клиентам события профилирования."}]}]}/>

Включает или отключает отправку пакетов [ProfileEvents](/native-protocol/server.md#profile-events) клиенту.

Настройку можно отключить для уменьшения сетевого трафика у клиентов, которым не требуются события профилирования.

Возможные значения:

- 0 — выключено.
- 1 — включено.

## send_progress_in_http_headers \{#send_progress_in_http_headers\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает HTTP-заголовки `X-ClickHouse-Progress` в HTTP-ответах `clickhouse-server`.

Для получения дополнительной информации см. [описание HTTP-интерфейса](../../interfaces/http.md).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## send_timeout \{#send_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="300" />

Таймаут отправки данных в сеть, в секундах. Если клиенту необходимо отправить данные, но в течение этого интервала не удаётся отправить ни одного байта, будет сгенерировано исключение. Если вы задаёте этот параметр на клиенте, то `receive_timeout` для сокета также будет установлен на соответствующем конце соединения на сервере.

## serialize_query_plan \{#serialize_query_plan\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "0"},{"label": "NewSetting"}]}]}/>

Сериализует план запроса для распределённой обработки

## session&#95;timezone

<BetaBadge />

Устанавливает неявный часовой пояс для текущей сессии или запроса.
Неявный часовой пояс — это часовой пояс, применяемый к значениям типа DateTime/DateTime64, для которых явно не указан часовой пояс.
Этот параметр имеет приоритет над глобально настроенным (на уровне сервера) неявным часовым поясом.
Значение &#39;&#39; (пустая строка) означает, что неявный часовой пояс текущей сессии или запроса равен [часовому поясу сервера](../server-configuration-parameters/settings.md/#timezone).

Вы можете использовать функции `timeZone()` и `serverTimeZone()` для получения часового пояса текущей сессии и сервера.

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

Назначьте часовую зону сеанса &#39;America/Denver&#39; внутреннему DateTime, у которого явно не указана часовая зона:

```sql
SELECT toDateTime64(toDateTime64('1999-12-12 23:23:23.123', 3), 3, 'Europe/Zurich') SETTINGS session_timezone = 'America/Denver' FORMAT TSV

1999-12-13 07:23:23.123
```

:::warning
Не все функции, которые разбирают значения типов DateTime/DateTime64, учитывают `session_timezone`. Это может приводить к труднообнаруживаемым ошибкам.
См. пример и пояснение ниже.
:::

```sql
CREATE TABLE test_tz (`d` DateTime('UTC')) ENGINE = Memory AS SELECT toDateTime('2000-01-01 00:00:00', 'UTC');

SELECT *, timeZone() FROM test_tz WHERE d = toDateTime('2000-01-01 00:00:00') SETTINGS session_timezone = 'Asia/Novosibirsk'
Выбрано 0 строк.

SELECT *, timeZone() FROM test_tz WHERE d = '2000-01-01 00:00:00' SETTINGS session_timezone = 'Asia/Novosibirsk'
┌───────────────────d─┬─timeZone()───────┐
│ 2000-01-01 00:00:00 │ Asia/Novosibirsk │
└─────────────────────┴──────────────────┘
```

Это происходит из-за разных конвейеров разбора:

* `toDateTime()` без явно указанного часового пояса, используемый в первом запросе `SELECT`, учитывает настройку `session_timezone` и глобальный часовой пояс.
* Во втором запросе значение типа DateTime разбирается из строки типа String и наследует тип и часовой пояс существующего столбца `d`. Таким образом, настройка `session_timezone` и глобальный часовой пояс не учитываются.

**См. также**

* [timezone](../server-configuration-parameters/settings.md/#timezone)


## set_overflow_mode \{#set_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что происходит, когда объем данных превышает один из лимитов.

Возможные значения:

- `throw`: генерирует исключение (значение по умолчанию).
- `break`: останавливает выполнение запроса и возвращает частичный результат, как если бы исходные данные закончились.

## shared_merge_tree_sync_parts_on_partition_operations \{#shared_merge_tree_sync_parts_on_partition_operations\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "Новая настройка. По умолчанию части всегда синхронизируются"}]}]}/>

Автоматически синхронизирует набор частей данных после операций MOVE|REPLACE|ATTACH разделов (partition) в таблицах SMT. Только для ClickHouse Cloud

## short_circuit_function_evaluation \{#short_circuit_function_evaluation\} 

<SettingsInfoBlock type="ShortCircuitFunctionEvaluation" default_value="enable" />

Позволяет вычислять функции [if](../../sql-reference/functions/conditional-functions.md/#if), [multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf), [and](/sql-reference/functions/logical-functions#and) и [or](/sql-reference/functions/logical-functions#or) с использованием [укороченного вычисления](https://en.wikipedia.org/wiki/Short-circuit_evaluation). Это помогает оптимизировать выполнение сложных выражений в этих функциях и предотвращать возможные исключения (такие как деление на ноль, когда оно не должно выполняться).

Возможные значения:

- `enable` — Включает укороченное вычисление для функций, где это имеет смысл (которые могут выбрасывать исключение или являются вычислительно затратными).
- `force_enable` — Включает укороченное вычисление для всех функций.
- `disable` — Отключает укороченное вычисление функций.

## short_circuit_function_evaluation_for_nulls \{#short_circuit_function_evaluation_for_nulls\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Разрешить выполнение функций с аргументами типа Nullable только для строк, в которых все аргументы не равны NULL"}]}]}/>

Оптимизирует вычисление функций, которые возвращают NULL, если любой из аргументов равен NULL. Когда доля значений NULL в аргументах функции превышает значение настройки short_circuit_function_evaluation_for_nulls_threshold, система перестаёт вычислять функцию построчно. Вместо этого она немедленно возвращает NULL для всех строк, избегая лишних вычислений.

## short_circuit_function_evaluation_for_nulls_threshold \{#short_circuit_function_evaluation_for_nulls_threshold\} 

<SettingsInfoBlock type="Double" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Порог доли значений NULL, при котором функции с аргументами типа Nullable выполняются только для строк, где во всех аргументах значения не равны NULL. Применяется, когда включена настройка short_circuit_function_evaluation_for_nulls."}]}]}/>

Порог доли значений NULL, при котором функции с аргументами типа Nullable выполняются только для строк, где во всех аргументах значения не равны NULL. Применяется, когда включена настройка `short_circuit_function_evaluation_for_nulls`.
Когда отношение количества строк, содержащих значения NULL, к общему количеству строк превышает этот порог, строки с NULL не вычисляются.

## show_data_lake_catalogs_in_system_tables \{#show_data_lake_catalogs_in_system_tables\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Новая настройка"}]}, {"id": "row-2","items": [{"label": "25.10"},{"label": "0"},{"label": "Отключает отображение каталогов в системных таблицах по умолчанию"}]}]}/>

Включает отображение каталогов озера данных в системных таблицах.

## show_processlist_include_internal \{#show_processlist_include_internal\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "1"},{"label": "New setting."}]}]}/>

Показывать внутренние служебные процессы в выводе запроса `SHOW PROCESSLIST`.

К внутренним процессам относятся перезагрузки словарей, перезагрузки обновляемых материализованных представлений, вспомогательные запросы `SELECT`, выполняемые при выполнении запросов `SHOW ...`, вспомогательные запросы `CREATE DATABASE ...`, выполняемые внутренне для обслуживания проблемных таблиц, и другие.

## show_table_uuid_in_table_create_query_if_not_nil \{#show_table_uuid_in_table_create_query_if_not_nil\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.7"},{"label": "0"},{"label": "Перестать отображать UUID таблицы в её запросе CREATE для Engine=Atomic"}]}]}/>

Настраивает вывод команды `SHOW TABLE`.

Возможные значения:

- 0 — Запрос будет отображаться без UUID таблицы.
- 1 — Запрос будет отображаться с UUID таблицы.

## single_join_prefer_left_table \{#single_join_prefer_left_table\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Для одиночного JOIN при неоднозначности имён столбцов предпочитать левую таблицу

## skip&#95;redundant&#95;aliases&#95;in&#95;udf

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "При включении позволяет использовать одну и ту же пользовательскую функцию (UDF) несколько раз для нескольких материализованных столбцов в одной и той же таблице."}]}]} />

Избыточные псевдонимы не используются (не подставляются) в пользовательских функциях, чтобы упростить их использование.

Возможные значения:

* 1 — Псевдонимы пропускаются (подставляются) в UDF.
* 0 — Псевдонимы не пропускаются (не подставляются) в UDF.

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


## skip_unavailable_shards \{#skip_unavailable_shards\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает молчаливый пропуск недоступных шардов.

Шард считается недоступным, если все его реплики недоступны. Реплика считается недоступной в следующих случаях:

- ClickHouse не может подключиться к реплике по какой‑либо причине.

    При подключении к реплике ClickHouse выполняет несколько попыток. Если все эти попытки заканчиваются неуспешно, реплика считается недоступной.

- Реплику невозможно разрешить через DNS.

    Если имя хоста реплики не может быть разрешено через DNS, это может указывать на следующие ситуации:

    - У хоста реплики нет DNS‑записи. Это может происходить в системах с динамическим DNS, например, в [Kubernetes](https://kubernetes.io), где имена узлов могут не разрешаться во время простоя, и это не является ошибкой.

    - Ошибка конфигурации. Файл конфигурации ClickHouse содержит неверное имя хоста.

Возможные значения:

- 1 — пропуск включен.

    Если шард недоступен, ClickHouse возвращает результат на основе частичных данных и не сообщает о проблемах с доступностью узлов.

- 0 — пропуск отключен.

    Если шард недоступен, ClickHouse выбрасывает исключение.

## sleep_after_receiving_query_ms \{#sleep_after_receiving_query_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Время задержки после получения запроса в `TCPHandler`

## sleep_in_send_data_ms \{#sleep_in_send_data_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Время задержки при отправке данных в TCPHandler

## sleep_in_send_tables_status_ms \{#sleep_in_send_tables_status_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="0" />

Время паузы при отправке ответа о статусе таблиц в TCPHandler

## sort_overflow_mode \{#sort_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что происходит, если количество строк, полученных до сортировки, превышает одно из ограничений.

Возможные значения:

- `throw`: выдать исключение.
- `break`: остановить выполнение запроса и вернуть частичный результат.

## split_intersecting_parts_ranges_into_layers_final \{#split_intersecting_parts_ranges_into_layers_final\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Разрешить разбиение пересекающихся диапазонов частей на слои при оптимизации FINAL"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "Разрешить разбиение пересекающихся диапазонов частей на слои при оптимизации FINAL"}]}]}/>

Разбивать пересекающиеся диапазоны частей на слои при оптимизации FINAL

## split_parts_ranges_into_intersecting_and_non_intersecting_final \{#split_parts_ranges_into_intersecting_and_non_intersecting_final\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.2"},{"label": "1"},{"label": "Позволяет разделять диапазоны частей на пересекающиеся и непересекающиеся во время оптимизации FINAL"}]}, {"id": "row-2","items": [{"label": "24.1"},{"label": "1"},{"label": "Позволяет разделять диапазоны частей на пересекающиеся и непересекающиеся во время оптимизации FINAL"}]}]}/>

Разделять диапазоны частей на пересекающиеся и непересекающиеся во время оптимизации FINAL

## splitby_max_substrings_includes_remaining_string \{#splitby_max_substrings_includes_remaining_string\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, будет ли функция [splitBy*()](../../sql-reference/functions/splitting-merging-functions.md) с аргументом `max_substrings` > 0 включать оставшуюся часть строки в последний элемент результирующего массива.

Возможные значения:

- `0` - Оставшаяся часть строки не будет включена в последний элемент результирующего массива.
- `1` - Оставшаяся часть строки будет включена в последний элемент результирующего массива. Это соответствует поведению функции Spark [`split()`](https://spark.apache.org/docs/3.1.2/api/python/reference/api/pyspark.sql.functions.split.html) и метода Python ['string.split()'](https://docs.python.org/3/library/stdtypes.html#str.split).

## stop_refreshable_materialized_views_on_startup \{#stop_refreshable_materialized_views_on_startup\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

При запуске сервера предотвращает постановку в расписание обновляемых материализованных представлений, как если бы была выполнена команда SYSTEM STOP VIEWS. Позже вы можете запустить их вручную с помощью `SYSTEM START VIEWS` или `SYSTEM START VIEW <name>`. Также применяется к представлениям, созданным позже. Не влияет на необновляемые материализованные представления.

## storage_file_read_method \{#storage_file_read_method\} 

<SettingsInfoBlock type="LocalFSReadMethod" default_value="pread" />

Метод чтения данных из файла хранилища, одно из следующих значений: `read`, `pread`, `mmap`. Метод `mmap` не используется в clickhouse-server (он предназначен для clickhouse-local).

## storage_system_stack_trace_pipe_read_timeout_ms \{#storage_system_stack_trace_pipe_read_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="100" />

Максимальное время чтения из канала для получения данных из потоков при выполнении запроса к таблице `system.stack_trace`. Этот параметр используется только для тестирования и не предназначен для изменения пользователями.

## stream_flush_interval_ms \{#stream_flush_interval_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="7500" />

Применяется для таблиц со стримингом при истечении тайм-аута или когда поток генерирует [max_insert_block_size](#max_insert_block_size) строк.

Значение по умолчанию — 7500.

Чем меньше значение, тем чаще данные сбрасываются в таблицу. Слишком маленькое значение приводит к снижению производительности.

## stream_like_engine_allow_direct_select \{#stream_like_engine_allow_direct_select\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.12"},{"label": "0"},{"label": "По умолчанию не разрешает прямые запросы SELECT для Kafka/RabbitMQ/FileLog"}]}]}/>

Разрешает выполнять прямые запросы SELECT для движков Kafka, RabbitMQ, FileLog, Redis Streams и NATS. Если имеются присоединённые материализованные представления, запросы SELECT не разрешены, даже если этот параметр включён.

## stream_like_engine_insert_queue \{#stream_like_engine_insert_queue\} 

Когда движок потокового типа читает из нескольких очередей, пользователю необходимо выбрать одну очередь, в которую будут выполняться вставки при записи. Используется в Redis Streams и NATS.

## stream_poll_timeout_ms \{#stream_poll_timeout_ms\} 

<SettingsInfoBlock type="Milliseconds" default_value="500" />

Тайм-аут опроса данных при чтении из и записи в потоковые хранилища.

## system&#95;events&#95;show&#95;zero&#95;values

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет выбирать события с нулевыми значениями из [`system.events`](../../operations/system-tables/events.md).

Некоторые системы мониторинга требуют передавать им все значения метрик для каждой контрольной точки, даже если значение метрики равно нулю.

Возможные значения:

* 0 — Отключена.
* 1 — Включена.

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


## table_engine_read_through_distributed_cache \{#table_engine_read_through_distributed_cache\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "New setting"}]}]}/>

Работает только в ClickHouse Cloud. Позволяет выполнять чтение из распределённого кэша через движки таблиц и табличные функции (S3, Azure и т. д.).

## table_function_remote_max_addresses \{#table_function_remote_max_addresses\} 

<SettingsInfoBlock type="UInt64" default_value="1000" />

Устанавливает максимальное количество адресов, формируемых по шаблонам для функции [remote](../../sql-reference/table-functions/remote.md).

Возможные значения:

- Положительное целое число.

## tcp_keep_alive_timeout \{#tcp_keep_alive_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="290" />

Время в секундах, в течение которого соединение должно оставаться неактивным, прежде чем TCP начнёт отправлять keepalive-пакеты

## temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds \{#temporary_data_in_cache_reserve_space_wait_lock_timeout_milliseconds\} 

<SettingsInfoBlock type="UInt64" default_value="600000" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.4"},{"label": "600000"},{"label": "Время ожидания блокировки кэша для резервирования места в файловом кэше под временные данные"}]}]}/>

Время ожидания блокировки кэша для резервирования места в файловом кэше под временные данные

## temporary_files_buffer_size \{#temporary_files_buffer_size\} 

<SettingsInfoBlock type="UInt64" default_value="1048576" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "1048576"},{"label": "New setting"}]}]}/>

Размер буфера для записи во временные файлы. Увеличение размера буфера приводит к меньшему количеству системных вызовов, но большему потреблению памяти.

## temporary_files_codec \{#temporary_files_codec\} 

<SettingsInfoBlock type="String" default_value="LZ4" />

Устанавливает кодек сжатия для временных файлов, используемых при операциях сортировки и соединения на диске.

Возможные значения:

- LZ4 — применяется сжатие [LZ4](https://en.wikipedia.org/wiki/LZ4_(compression_algorithm)).
- NONE — сжатие не применяется.

## text_index_hint_max_selectivity \{#text_index_hint_max_selectivity\} 

<SettingsInfoBlock type="Float" default_value="0.2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0.2"},{"label": "Новая настройка"}]}]}/>

Максимальное значение селективности фильтра для использования подсказки, построенной на инвертированном текстовом индексе.

## text_index_use_bloom_filter \{#text_index_use_bloom_filter\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "1"},{"label": "Новая настройка."}]}]}/>

Для тестовых целей включает или отключает использование фильтра Блума в текстовом индексе.

## throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert \{#throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "1"},{"label": "Удаление дубликатов в зависимом материализованном представлении не может работать вместе с асинхронными вставками."}]}]}/>

Выбрасывать исключение при выполнении запроса INSERT, когда настройка `deduplicate_blocks_in_dependent_materialized_views` включена одновременно с `async_insert`. Это гарантирует корректность, поскольку эти механизмы не могут работать вместе.

## throw_if_no_data_to_insert \{#throw_if_no_data_to_insert\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает или запрещает выполнение пустых INSERT-запросов; по умолчанию параметр включён (при пустом INSERT генерируется ошибка). Применяется только к INSERT-запросам при использовании [`clickhouse-client`](/interfaces/cli) или [gRPC-интерфейса](/interfaces/grpc).

## throw_on_error_from_cache_on_write_operations \{#throw_on_error_from_cache_on_write_operations\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать ошибки кэша при кэшировании во время операций записи (INSERT, слияния)

## throw_on_max_partitions_per_insert_block \{#throw_on_max_partitions_per_insert_block\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Позволяет управлять поведением при достижении значения `max_partitions_per_insert_block`.

Возможные значения:

- `true`  - Когда вставляемый блок достигает `max_partitions_per_insert_block`, генерируется исключение.
- `false` - При достижении `max_partitions_per_insert_block` в лог записывается предупреждение.

:::tip
Это может быть полезно, если вы пытаетесь оценить влияние на пользователей при изменении [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block).
:::

## throw_on_unsupported_query_inside_transaction \{#throw_on_unsupported_query_inside_transaction\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="1" />

Выбрасывать исключение, если внутри транзакции используется неподдерживаемый запрос

## timeout_before_checking_execution_speed \{#timeout_before_checking_execution_speed\} 

<SettingsInfoBlock type="Seconds" default_value="10" />

Проверяет, что скорость выполнения не слишком низкая (не менее `min_execution_speed`) по истечении указанного времени в секундах.

## timeout_overflow_mode \{#timeout_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что делать, если запрос выполняется дольше, чем `max_execution_time`, или
оценочное время выполнения больше, чем `max_estimated_execution_time`.

Возможные значения:

- `throw`: сгенерировать исключение (значение по умолчанию).
- `break`: остановить выполнение запроса и вернуть частичный результат, как если бы
исходные данные были исчерпаны.

## timeout_overflow_mode_leaf \{#timeout_overflow_mode_leaf\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что происходит, когда выполнение запроса на листовом узле превышает `max_execution_time_leaf`.

Возможные значения:

- `throw`: сгенерировать исключение (по умолчанию).
- `break`: остановить выполнение запроса и вернуть частичный результат, как если бы
исходные данные закончились.

## totals_auto_threshold \{#totals_auto_threshold\} 

<SettingsInfoBlock type="Float" default_value="0.5" />

Порог для `totals_mode = 'auto'`.
См. раздел «WITH TOTALS modifier».

## totals_mode \{#totals_mode\} 

<SettingsInfoBlock type="TotalsMode" default_value="after_having_exclusive" />

Способ вычисления TOTALS при наличии условия HAVING, а также когда одновременно заданы max_rows_to_group_by и group_by_overflow_mode = 'any'.
См. раздел «Модификатор WITH TOTALS».

## trace_profile_events \{#trace_profile_events\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает сбор стек-трейсов при каждом обновлении событий профилирования вместе с именем события профилирования и значением инкремента, а также их отправку в [trace_log](/operations/system-tables/trace_log).

Возможные значения:

- 1 — трассировка событий профилирования включена.
- 0 — трассировка событий профилирования отключена.

## transfer_overflow_mode \{#transfer_overflow_mode\} 

<SettingsInfoBlock type="OverflowMode" default_value="throw" />

Определяет, что происходит, когда объём данных превышает один из лимитов.

Возможные значения:

- `throw`: вызывает исключение (по умолчанию).
- `break`: прекращает выполнение запроса и возвращает частичный результат, как если бы
исходные данные были исчерпаны.

## transform&#95;null&#95;in

<SettingsInfoBlock type="Bool" default_value="0" />

Включает трактовку значений [NULL](/sql-reference/syntax#null) как равных для оператора [IN](../../sql-reference/operators/in.md).

По умолчанию значения `NULL` нельзя сравнивать, потому что `NULL` означает неопределённое значение. Поэтому результат сравнения `expr = NULL` всегда должен быть `false`. При включении этой настройки выражение `NULL = NULL` для оператора `IN` возвращает `true`.

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


## traverse_shadow_remote_data_paths \{#traverse_shadow_remote_data_paths\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Обходить теневой каталог при выполнении запроса к system.remote_data_paths."}]}]}/>

Обходит замороженные данные (теневой каталог) наряду с фактическими данными таблицы при выполнении запроса к system.remote_data_paths

## union_default_mode \{#union_default_mode\} 

Задает режим объединения результатов запроса `SELECT`. Настройка используется только при использовании в сочетании с [UNION](../../sql-reference/statements/select/union.md) без явного указания `UNION ALL` или `UNION DISTINCT`.

Возможные значения:

- `'DISTINCT'` — ClickHouse выводит строки как результат объединения запросов, удаляя дублирующиеся строки.
- `'ALL'` — ClickHouse выводит все строки как результат объединения запросов, включая дублирующиеся строки.
- `''` — ClickHouse генерирует исключение при использовании с `UNION`.

См. примеры в [UNION](../../sql-reference/statements/select/union.md).

## unknown_packet_in_send_data \{#unknown_packet_in_send_data\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Отправлять неизвестный пакет вместо N-го пакета данных

## update_parallel_mode \{#update_parallel_mode\} 

<SettingsInfoBlock type="UpdateParallelMode" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "A new setting"}]}]}/>

Определяет поведение одновременных запросов `UPDATE`.

Возможные значения:

- `sync` — выполнять последовательно все запросы `UPDATE`.
- `auto` — выполнять последовательно только те запросы `UPDATE`, между которыми существуют зависимости по столбцам: между столбцами, обновляемыми в одном запросе, и столбцами, используемыми в выражениях другого запроса.
- `async` — не синхронизировать запросы `UPDATE`.

## update_sequential_consistency \{#update_sequential_consistency\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "1"},{"label": "A new setting"}]}]}/>

Если установлено в значение `true`, набор частей обновляется до последней версии перед выполнением операции UPDATE.

## use_async_executor_for_materialized_views \{#use_async_executor_for_materialized_views\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "0"},{"label": "New setting."}]}]}/>

Включает асинхронное, потенциально многопоточное выполнение запросов материализованных представлений; может ускорить обработку представлений во время INSERT, но приводит к большему расходу памяти.

## use_cache_for_count_from_files \{#use_cache_for_count_from_files\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Включает кэширование числа строк при выполнении `count` по файлам в табличных функциях `file`/`s3`/`url`/`hdfs`/`azureBlobStorage`.

Включено по умолчанию.

## use_client_time_zone \{#use_client_time_zone\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать часовой пояс клиента при интерпретации строковых значений DateTime вместо часового пояса сервера.

## use_compact_format_in_distributed_parts_names \{#use_compact_format_in_distributed_parts_names\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.1"},{"label": "1"},{"label": "По умолчанию используется компактный формат для асинхронных INSERT в таблицы Distributed"}]}]}/>

Использует компактный формат для хранения блоков для фоновых (`distributed_foreground_insert`) операций INSERT в таблицы с движком `Distributed`.

Возможные значения:

- 0 — Использует формат имени каталога `user[:password]@host:port#default_database`.
- 1 — Использует формат имени каталога `[shard{shard_index}[_replica{replica_index}]]`.

:::note

- При `use_compact_format_in_distributed_parts_names=0` изменения в определении кластера не будут применяться для фоновых INSERT.
- При `use_compact_format_in_distributed_parts_names=1` изменение порядка узлов в определении кластера изменит значения `shard_index`/`replica_index`, имейте это в виду.
:::

## use_concurrency_control \{#use_concurrency_control\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.12"},{"label": "1"},{"label": "Enable concurrency control by default"}]}]}/>

Учитывать контроль параллелизма на сервере (см. глобальные настройки сервера `concurrent_threads_soft_limit_num` и `concurrent_threads_soft_limit_ratio_to_cores`). Если параметр отключён, это позволяет использовать больше потоков, даже при перегруженном сервере (не рекомендуется для обычного использования и в основном требуется для тестов).

## use_hedged_requests \{#use_hedged_requests\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "21.9"},{"label": "1"},{"label": "Включить механизм hedged-запросов по умолчанию"}]}]}/>

Включает логику hedged-запросов для удалённых запросов. Она позволяет устанавливать несколько соединений с разными репликами для одного запроса.
Новое соединение создаётся в том случае, если существующие соединения с репликами не были установлены в течение `hedged_connection_timeout`
или данные не были получены в течение `receive_data_timeout`. Запрос использует первое соединение, которое отправило непустой пакет прогресса (или пакет данных, если включено `allow_changing_replica_until_first_data_packet`);
остальные соединения отменяются. Поддерживаются запросы с `max_parallel_replicas > 1`.

Включено по умолчанию.

Значение по умолчанию в облаке: `1`

## use_hive_partitioning \{#use_hive_partitioning\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "1"},{"label": "Настройка включена по умолчанию."}]}, {"id": "row-2","items": [{"label": "24.8"},{"label": "0"},{"label": "Позволяет использовать разбиение в стиле Hive (hive partitioning) для движков File, URL, S3, AzureBlobStorage и HDFS."}]}]}/>

При включении ClickHouse будет определять разбиение в стиле Hive в пути (`/name=value/`) в табличных движках файлового типа [File](/sql-reference/table-functions/file#hive-style-partitioning)/[S3](/sql-reference/table-functions/s3#hive-style-partitioning)/[URL](/sql-reference/table-functions/url#hive-style-partitioning)/[HDFS](/sql-reference/table-functions/hdfs#hive-style-partitioning)/[AzureBlobStorage](/sql-reference/table-functions/azureBlobStorage#hive-style-partitioning) и позволит использовать столбцы разбиения как виртуальные столбцы в запросе. Эти виртуальные столбцы будут иметь те же имена, что и в пути разбиения, но с префиксом `_`.

## use_iceberg_metadata_files_cache \{#use_iceberg_metadata_files_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "New setting"}]}]}/>

Если настройка включена, табличная функция `iceberg` и движок таблиц `iceberg` могут использовать кэш файлов метаданных `iceberg`.

Возможные значения:

- 0 — Отключено
- 1 — Включено

## use_iceberg_partition_pruning \{#use_iceberg_partition_pruning\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Включить отсечение разделов Iceberg по умолчанию."}]}, {"id": "row-2","items": [{"label": "25.1"},{"label": "0"},{"label": "Новая настройка для отсечения разделов Iceberg."}]}]}/>

Использовать отсечение разделов Iceberg для таблиц Iceberg

## use_index_for_in_with_subqueries \{#use_index_for_in_with_subqueries\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Пытаться использовать индекс, если справа от оператора IN находится подзапрос или табличное выражение.

## use_index_for_in_with_subqueries_max_values \{#use_index_for_in_with_subqueries_max_values\} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер множества в правой части оператора IN, при котором для фильтрации используется индекс таблицы. Это позволяет избежать деградации производительности и повышенного потребления памяти из‑за подготовки дополнительных структур данных для больших запросов. Ноль означает отсутствие ограничения.

## use_join_disjunctions_push_down \{#use_join_disjunctions_push_down\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.10"},{"label": "0"},{"label": "New setting."}]}]}/>

Включает проталкивание частей условия JOIN, соединённых оператором OR, на соответствующие входные стороны («частичное проталкивание»).
Это позволяет движкам хранилищ выполнять фильтрацию раньше, что может сократить объём читаемых данных.
Оптимизация сохраняет семантику и применяется только тогда, когда каждая верхнеуровневая ветка OR вносит по крайней мере один детерминированный предикат для целевой стороны соединения.

## use_legacy_to_time \{#use_legacy_to_time\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Новая настройка. Позволяет пользователю использовать старую логику функции toTime, которая работает как toTimeWithFixedDate."}]}]}/>

При включении параметра используется устаревшая функция toTime, которая преобразует дату со временем в заданную фиксированную дату, сохраняя при этом время.
В противном случае используется новая функция toTime, которая преобразует различные типы данных в тип Time.
Устаревшая функция также безусловно доступна под именем toTimeWithFixedDate.

## use_page_cache_for_disks_without_file_cache \{#use_page_cache_for_disks_without_file_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.3"},{"label": "0"},{"label": "Добавлен кэш страниц в пользовательском пространстве"}]}]}/>

Использовать кэш страниц в пользовательском пространстве для удалённых дисков, на которых не включён кэш файловой системы.

## use_page_cache_with_distributed_cache \{#use_page_cache_with_distributed_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.3"},{"label": "0"},{"label": "New setting"}]}]}/>

Использовать кэш страниц в пространстве пользователя при работе с распределённым кэшем.

## use_paimon_partition_pruning \{#use_paimon_partition_pruning\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.12"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Использовать отсечение партиций Paimon для табличных функций Paimon

## use_query_cache \{#use_query_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если включено, запросы `SELECT` могут использовать [кэш запросов](../query-cache.md). Параметры [enable_reads_from_query_cache](#enable_reads_from_query_cache)
и [enable_writes_to_query_cache](#enable_writes_to_query_cache) более подробно управляют использованием кэша.

Возможные значения:

- 0 — Отключено
- 1 — Включено

## use_query_condition_cache \{#use_query_condition_cache\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.4"},{"label": "1"},{"label": "Новая оптимизация"}]}, {"id": "row-2","items": [{"label": "25.3"},{"label": "0"},{"label": "Новая настройка."}]}]}/>

Включает [кэш условия запроса](/operations/query-condition-cache). Кэш хранит диапазоны гранул в частях данных, которые не удовлетворяют условию в предложении `WHERE`,
и повторно использует эту информацию как временный индекс для последующих запросов.

Возможные значения:

- 0 — Отключено
- 1 — Включено

## use_roaring_bitmap_iceberg_positional_deletes \{#use_roaring_bitmap_iceberg_positional_deletes\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting"}]}]}/>

Использовать Roaring Bitmap для позиционных удалений в Iceberg.

## use_skip_indexes \{#use_skip_indexes\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать пропускающие индексы при выполнении запроса.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_skip_indexes_if_final \{#use_skip_indexes_if_final\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Change in default value of setting"}]}]}/>

Определяет, используются ли пропускающие индексы при выполнении запроса с модификатором FINAL.

Пропускающие индексы могут исключать строки (гранулы), содержащие самые свежие данные, что может привести к некорректным результатам запроса с модификатором FINAL. При включении этой настройки пропускающие индексы применяются даже с модификатором FINAL, что потенциально улучшает производительность, но несет риск пропуска недавних обновлений. Эту настройку следует включать совместно с настройкой use_skip_indexes_if_final_exact_mode (по умолчанию она включена).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_skip_indexes_if_final_exact_mode \{#use_skip_indexes_if_final_exact_mode\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.6"},{"label": "1"},{"label": "Изменение значения настройки по умолчанию"}]}, {"id": "row-2","items": [{"label": "25.5"},{"label": "0"},{"label": "Эта настройка была добавлена, чтобы запрос с модификатором FINAL возвращал корректные результаты при использовании skip-индексов"}]}]}/>

Определяет, разворачиваются ли гранулы, возвращённые skip-индексом, в более новых партах для получения корректных результатов при выполнении запроса с модификатором FINAL.

Использование skip-индексов может исключать строки (гранулы), содержащие самые свежие данные, что может привести к некорректным результатам. Эта настройка позволяет гарантировать корректные результаты за счёт сканирования более новых партов, которые пересекаются с диапазонами, возвращёнными skip-индексом. Эту настройку следует отключать только в том случае, если для приложения приемлемы приближённые результаты, основанные на использовании skip-индекса.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_skip_indexes_on_data_read \{#use_skip_indexes_on_data_read\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.9"},{"label": "0"},{"label": "New setting"}]}]}/>

Включает использование пропускающих индексов при чтении данных.

Если параметр включен, пропускающие индексы вычисляются динамически в момент чтения каждой гранулы данных, а не анализируются заранее до начала выполнения запроса. Это может сократить время запуска запроса.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## use_statistics_cache \{#use_statistics_cache\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Использовать кэш статистики в запросе, чтобы избежать накладных расходов на загрузку статистики для всех частей

## use_structure_from_insertion_table_in_table_functions \{#use_structure_from_insertion_table_in_table_functions\} 

<SettingsInfoBlock type="UInt64" default_value="2" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "22.11"},{"label": "2"},{"label": "Improve using structure from insertion table in table functions"}]}]}/>

Использовать структуру таблицы, в которую производится вставка, вместо автоматического определения схемы по данным. Возможные значения: 0 — отключено, 1 — включено, 2 — авто

## use_text_index_dictionary_cache \{#use_text_index_dictionary_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Определяет, использовать ли кэш десериализованного блока словаря текстового индекса.
Использование кэша блока словаря текстового индекса может значительно снизить задержку и увеличить пропускную способность при обработке большого количества запросов к текстовому индексу.

## use_text_index_header_cache \{#use_text_index_header_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Определяет, использовать ли кэш десериализованного заголовка текстового индекса.
Использование кэша заголовка текстового индекса может существенно уменьшить задержку и увеличить пропускную способность при работе с большим количеством запросов к текстовому индексу.

## use_text_index_postings_cache \{#use_text_index_postings_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.11"},{"label": "0"},{"label": "New setting"}]}]}/>

Определяет, использовать ли кэш десериализованных списков вхождений текстового индекса.
Использование кэша списков вхождений текстового индекса может значительно снизить задержку и увеличить пропускную способность при выполнении большого числа запросов к текстовому индексу.

## use_uncompressed_cache \{#use_uncompressed_cache\} 

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, использовать ли кэш несжатых блоков. Принимает значения 0 или 1. По умолчанию — 0 (отключено).
Использование кэша несжатых данных (только для таблиц семейства MergeTree) может значительно снизить задержку и увеличить пропускную способность при работе с большим числом коротких запросов. Включайте этот параметр для пользователей, которые отправляют частые короткие запросы. Также обратите внимание на конфигурационный параметр [uncompressed_cache_size](/operations/server-configuration-parameters/settings#uncompressed_cache_size) (задаётся только в конфигурационном файле) — размер блоков кэша несжатых данных. По умолчанию он равен 8 GiB. Кэш несжатых данных заполняется по мере необходимости, а наименее используемые данные автоматически удаляются.

Для запросов, которые читают хотя бы относительно большой объём данных (один миллион строк и более), кэш несжатых данных автоматически отключается, чтобы освободить место для действительно малых запросов. Это означает, что вы можете держать настройку `use_uncompressed_cache` всегда установленной в значение 1.

## use&#95;variant&#95;as&#95;common&#95;type

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.1"},{"label": "0"},{"label": "Разрешает использовать Variant в if/multiIf при отсутствии общего типа"}]}]} />

Позволяет использовать тип `Variant` в качестве результирующего типа для функций [if](../../sql-reference/functions/conditional-functions.md/#if)/[multiIf](../../sql-reference/functions/conditional-functions.md/#multiIf)/[array](../../sql-reference/functions/array-functions.md)/[map](../../sql-reference/functions/tuple-map-functions.md), когда для типов аргументов не удаётся вывести общий тип.

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


## use_with_fill_by_sorting_prefix \{#use_with_fill_by_sorting_prefix\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "23.5"},{"label": "1"},{"label": "Столбцы, предшествующие столбцам WITH FILL в секции ORDER BY, образуют сортировочный префикс. Строки с разными значениями сортировочного префикса заполняются независимо"}]}]}/>

Столбцы, предшествующие столбцам WITH FILL в секции ORDER BY, образуют сортировочный префикс. Строки с разными значениями сортировочного префикса заполняются независимо

## validate_enum_literals_in_operators \{#validate_enum_literals_in_operators\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.1"},{"label": "0"},{"label": "A new setting"}]}]}/>

Если настройка включена, выполняется проверка литералов перечисления в операторах `IN`, `NOT IN`, `==`, `!=` на соответствие типу Enum, и выбрасывается исключение, если литерал не является допустимым значением Enum.

## validate_mutation_query \{#validate_mutation_query\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.11"},{"label": "1"},{"label": "Новая настройка для проверки корректности запросов мутаций по умолчанию."}]}]}/>

Проверяет запросы мутаций перед их принятием. Мутации выполняются в фоновом режиме, и запуск некорректного запроса приведёт к зависанию выполнения мутаций и необходимости ручного вмешательства.

Изменяйте эту настройку только при возникновении ошибки, связанной с обратной несовместимостью.

## validate_polygons \{#validate_polygons\} 

<SettingsInfoBlock type="Bool" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "20.4"},{"label": "1"},{"label": "По умолчанию функция pointInPolygon генерирует исключение, если многоугольник некорректен, вместо возврата потенциально неверных результатов"}]}]}/>

Включает или отключает генерацию исключения в функции [pointInPolygon](/sql-reference/functions/geo/coordinates#pointinpolygon), если многоугольник имеет самопересечения или самокасания.

Возможные значения:

- 0 — Генерация исключения отключена. `pointInPolygon` принимает некорректные многоугольники и возвращает для них потенциально неверные результаты.
- 1 — Генерация исключения включена.

## vector_search_filter_strategy \{#vector_search_filter_strategy\} 

<SettingsInfoBlock type="VectorSearchFilterStrategy" default_value="auto" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.5"},{"label": "auto"},{"label": "New setting"}]}]}/>

Если в запросе векторного поиска присутствует оператор WHERE, этот параметр определяет, что выполняется первым: условие WHERE (предварительная фильтрация) или сначала используется индекс векторного сходства (постфильтрация). Возможные значения:

- 'auto' — Постфильтрация (точная семантика может измениться в будущем).
- 'postfilter' — Использовать индекс векторного сходства для определения ближайших соседей, затем применять остальные фильтры.
- 'prefilter' — Сначала применять остальные фильтры, затем выполнять поиск полным перебором для определения соседей.

## vector_search_index_fetch_multiplier \{#vector_search_index_fetch_multiplier\} 

**Псевдонимы**: `vector_search_postfilter_multiplier`

<SettingsInfoBlock type="Float" default_value="1" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "1"},{"label": "Псевдоним для настройки 'vector_search_postfilter_multiplier'"}]}]}/>

Умножает число извлечённых ближайших соседей из индекса векторного сходства на это значение. Применяется только при постфильтрации с другими предикатами или если установлена настройка `vector_search_with_rescoring = 1`.

## vector_search_with_rescoring \{#vector_search_with_rescoring\} 

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

Определяет, выполняет ли ClickHouse повторный пересчёт оценок (rescoring) для запросов, использующих индекс векторного сходства.
Без повторного пересчёта индекс векторного сходства напрямую возвращает строки с наилучшим соответствием.
При включённом повторном пересчёте строки расширяются до уровня гранулы, и все строки в грануле проверяются заново.
В большинстве случаев повторный пересчёт лишь незначительно повышает точность, но при этом значительно ухудшает производительность запросов векторного поиска.
Примечание: запрос, выполняемый без повторного пересчёта и с включёнными параллельными репликами, в некоторых случаях может быть выполнен с пересчётом.

## wait_changes_become_visible_after_commit_mode \{#wait_changes_become_visible_after_commit_mode\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="TransactionsWaitCSNMode" default_value="wait_unknown" />

Ожидать, пока зафиксированные изменения не станут действительно видимыми в последнем снимке

## wait_for_async_insert \{#wait_for_async_insert\} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено значение `true`, ожидать завершения обработки асинхронной вставки

## wait_for_async_insert_timeout \{#wait_for_async_insert_timeout\} 

<SettingsInfoBlock type="Seconds" default_value="120" />

Время ожидания обработки асинхронной вставки данных

## wait_for_window_view_fire_signal_timeout \{#wait_for_window_view_fire_signal_timeout\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="10" />

Таймаут ожидания сигнала срабатывания оконного представления при обработке по времени события

## window_view_clean_interval \{#window_view_clean_interval\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="60" />

Интервал очистки оконного представления в секундах, используемый для удаления устаревших данных.

## window_view_heartbeat_interval \{#window_view_heartbeat_interval\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Seconds" default_value="15" />

Интервал (в секундах) отправки сигнала, показывающего, что запрос наблюдения (watch query) все ещё выполняется.

## workload \{#workload\} 

<SettingsInfoBlock type="String" default_value="default" />

Имя рабочей нагрузки, используемое для доступа к ресурсам

## write_full_path_in_iceberg_metadata \{#write_full_path_in_iceberg_metadata\} 

<ExperimentalBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.8"},{"label": "0"},{"label": "New setting."}]}]}/>

Записывает полные пути (включая префикс s3://) в файлы метаданных Iceberg.

## write_through_distributed_cache \{#write_through_distributed_cache\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="Bool" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "24.10"},{"label": "0"},{"label": "Параметр для ClickHouse Cloud"}]}]}/>

Оказывает действие только в ClickHouse Cloud. Разрешает запись в распределённый кэш (запись в S3 также будет выполняться через распределённый кэш).

## write_through_distributed_cache_buffer_size \{#write_through_distributed_cache_buffer_size\} 

<CloudOnlyBadge/>

<SettingsInfoBlock type="UInt64" default_value="0" />

<VersionHistory rows={[{"id": "row-1","items": [{"label": "25.7"},{"label": "0"},{"label": "Новая настройка для облака"}]}]}/>

Применяется только в ClickHouse Cloud. Устанавливает размер буфера для распределенного кэша в режиме сквозной записи (write-through). Если значение равно 0, используется размер буфера, который был бы применен при отсутствии распределенного кэша.

## zstd_window_log_max \{#zstd_window_log_max\} 

<SettingsInfoBlock type="Int64" default_value="0" />

Позволяет задать максимальное значение window_log для ZSTD (не используется для семейства MergeTree)