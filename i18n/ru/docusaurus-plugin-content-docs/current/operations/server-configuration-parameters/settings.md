---
description: 'Этот раздел содержит описание настроек сервера — параметров, которые нельзя изменить на уровне сессии или запроса.'
keywords: ['глобальные настройки сервера']
sidebar_label: 'Настройки сервера'
sidebar_position: 57
slug: /operations/server-configuration-parameters/settings
title: 'Настройки сервера'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/i18n/ru/docusaurus-plugin-content-docs/current/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';


# Настройки сервера {#server-settings}

В этом разделе содержатся описания настроек сервера. Это настройки,
которые нельзя изменить на уровне сессии или отдельного запроса.

Дополнительную информацию о конфигурационных файлах в ClickHouse см. в разделе [«Файлы конфигурации»](/operations/configuration-files).

Другие настройки описаны в разделе «[Настройки](/operations/settings/overview)».
Перед изучением настроек рекомендуется прочитать раздел [«Файлы конфигурации»](/operations/configuration-files)
и обратить внимание на использование подстановок (атрибуты `incl` и `optional`).

## abort_on_logical_error {#abort_on_logical_error} 

<SettingsInfoBlock type="Bool" default_value="0" />Принудительно аварийно завершать работу сервера при возникновении исключений LOGICAL_ERROR. Только для экспертов.

## access&#95;control&#95;improvements {#access_control_improvements}

Настройки для дополнительных улучшений в системе управления доступом.

| Setting                                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Default |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | Определяет, могут ли пользователи без разрешающих строковых политик (row policies) по‑прежнему читать строки с помощью запроса `SELECT`. Например, если есть два пользователя A и B, и строковая политика задана только для A, то, если этот параметр включен, пользователь B будет видеть все строки. Если параметр выключен, пользователь B не увидит ни одной строки.                                                                                                                                                                                                                | `true`  |
| `on_cluster_queries_require_cluster_grant`      | Определяет, требуют ли запросы `ON CLUSTER` привилегии `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `true`  |
| `select_from_system_db_requires_grant`          | Определяет, требует ли запрос `SELECT * FROM system.&lt;table&gt;` каких‑либо привилегий и может ли выполняться любым пользователем. Если параметр включен, то для этого запроса требуется `GRANT SELECT ON system.&lt;table&gt;` так же, как и для несистемных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые константные таблицы, такие как `one`, `contributors`) по‑прежнему доступны всем; также, если выдана привилегия `SHOW` (например, `SHOW USERS`), будет доступна соответствующая системная таблица (то есть `system.users`). | `true`  |
| `select_from_information_schema_requires_grant` | Определяет, требует ли запрос `SELECT * FROM information_schema.&lt;table&gt;` каких‑либо привилегий и может ли выполняться любым пользователем. Если параметр включен, то для этого запроса требуется `GRANT SELECT ON information_schema.&lt;table&gt;` так же, как и для обычных таблиц.                                                                                                                                                                                                                                                                                             | `true`  |
| `settings_constraints_replace_previous`         | Определяет, будет ли ограничение в профиле настроек для некоторой настройки отменять действие предыдущего ограничения (заданного в других профилях) для этой настройки, включая поля, которые не заданы новым ограничением. Также включает тип ограничения `changeable_in_readonly`.                                                                                                                                                                                                                                                                                                    | `true`  |
| `table_engines_require_grant`                   | Определяет, требуется ли привилегия для создания таблицы с конкретным движком таблицы.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `false` |
| `role_cache_expiration_time_seconds`            | Определяет количество секунд с момента последнего обращения, в течение которых роль хранится в кэше ролей (Role Cache).                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `600`   |

Пример:

```xml
<access_control_improvements>
    <users_without_row_policies_can_read_rows>true</users_without_row_policies_can_read_rows>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
    <select_from_system_db_requires_grant>true</select_from_system_db_requires_grant>
    <select_from_information_schema_requires_grant>true</select_from_information_schema_requires_grant>
    <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
    <table_engines_require_grant>false</table_engines_require_grant>
    <role_cache_expiration_time_seconds>600</role_cache_expiration_time_seconds>
</access_control_improvements>
```


## access_control_path {#access_control_path} 

Путь к каталогу, в котором сервер ClickHouse хранит конфигурации пользователей и ролей, созданные SQL-командами.

**См. также**

- [Управление доступом и учетными записями](/operations/access-rights#access-control-usage)

## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached} 

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />Действие, выполняемое при превышении максимального количества элементов массива в groupArray: `throw` — выбросить исключение, или `discard` — отбросить лишние значения

## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

<SettingsInfoBlock type="UInt64" default_value="16777215" />Максимальный размер элемента массива в байтах для функции groupArray. Этот лимит проверяется при сериализации и помогает избежать чрезмерного размера состояния.

## allow_feature_tier {#allow_feature_tier} 

<SettingsInfoBlock type="UInt32" default_value="0" />

Управляет тем, может ли пользователь изменять настройки, связанные с различными уровнями функциональности.

- `0` - Разрешены изменения любых настроек (experimental, beta, production).
- `1` - Разрешены только изменения настроек уровней beta и production. Попытки изменить настройки уровня experimental отклоняются.
- `2` - Разрешены только изменения настроек уровня production. Попытки изменить настройки уровней experimental или beta отклоняются.

Это эквивалентно установке ограничения readonly для всех функций с уровнями `EXPERIMENTAL` / `BETA`.

:::note
Значение `0` означает, что все настройки могут быть изменены.
:::

## allow_impersonate_user {#allow_impersonate_user} 

<SettingsInfoBlock type="Bool" default_value="0" />Включает или отключает возможность использования функции IMPERSONATE (EXECUTE AS target_user).

## allow&#95;implicit&#95;no&#95;password {#allow_implicit_no_password}

Запрещает создавать пользователя без пароля, если явно не указано &#39;IDENTIFIED WITH no&#95;password&#39;.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## allow&#95;no&#95;password {#allow_no_password}

Определяет, разрешено ли использование небезопасного типа пароля no&#95;password.

```xml
<allow_no_password>1</allow_no_password>
```


## allow&#95;plaintext&#95;password {#allow_plaintext_password}

Определяет, разрешено ли использование небезопасных паролей в открытом виде (plaintext).

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_use_jemalloc_memory {#allow_use_jemalloc_memory} 

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает использование памяти jemalloc.

## allowed_disks_for_table_engines {#allowed_disks_for_table_engines} 

Список дисков, разрешённых для использования механизмом таблиц Iceberg

## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

<SettingsInfoBlock type="Bool" default_value="1" />Если установлено значение `true`, очередь асинхронных вставок будет сброшена при корректном завершении работы

## async_insert_threads {#async_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков для разбора и вставки данных в фоновом режиме. Ноль означает, что асинхронный режим отключен.

## async&#95;load&#95;databases {#async_load_databases}

<SettingsInfoBlock type="Bool" default_value="1" />

Асинхронная загрузка баз данных и таблиц.

* Если `true`, все несистемные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружаться асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается обратиться к таблице, ещё не загруженной в память, будет ждать запуска именно этой таблицы. Если задание загрузки завершится с ошибкой, запрос повторно выбросит эту ошибку (вместо завершения работы всего сервера в случае `async_load_databases = false`). Таблица, которую ожидает хотя бы один запрос, будет загружаться с более высоким приоритетом. DDL‑запросы к базе данных будут ждать запуска именно этой базы данных. Также рассмотрите возможность установки ограничения `max_waiting_queries` на общее количество ожидающих запросов.
* Если `false`, все базы данных загружаются при запуске сервера.

**Пример**

```xml
<async_load_databases>true</async_load_databases>
```


## async&#95;load&#95;system&#95;database {#async_load_system_database}

<SettingsInfoBlock type="Bool" default_value="0" />

Асинхронная загрузка таблиц системной базы данных. Полезно, если в базе данных `system` много таблиц журналов и частей. Не зависит от настройки `async_load_databases`.

* Если значение — `true`, все системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружаться асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к ещё не загруженной системной таблице, будет ожидать запуска именно этой таблицы. Таблица, которую ожидает хотя бы один запрос, будет загружаться с более высоким приоритетом. Также рассмотрите настройку параметра `max_waiting_queries`, чтобы ограничить общее количество ожидающих запросов.
* Если значение — `false`, системная база данных загружается до запуска сервера.

**Пример**

```xml
<async_load_system_database>true</async_load_system_database>
```


## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="120" />Период обновления тяжёлых асинхронных метрик в секундах.

## asynchronous&#95;insert&#95;log {#asynchronous_insert_log}

Настройки системной таблицы [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log) для регистрации асинхронных вставок.

<SystemLogParameters />

**Пример**

```xml
<clickhouse>
    <asynchronous_insert_log>
        <database>system</database>
        <table>asynchronous_insert_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </asynchronous_insert_log>
</clickhouse>
```


## asynchronous&#95;metric&#95;log {#asynchronous_metric_log}

По умолчанию включен в развертываниях ClickHouse Cloud.

Если этот параметр по умолчанию не активирован в вашей среде, в зависимости от того, как был установлен ClickHouse, вы можете воспользоваться приведённой ниже инструкцией, чтобы включить или отключить его.

**Включение**

Чтобы вручную включить сбор истории журнала асинхронных метрик [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md), создайте файл `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
     <asynchronous_metric_log>
        <database>system</database>
        <table>asynchronous_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </asynchronous_metric_log>
</clickhouse>
```

**Отключение**

Чтобы отключить параметр `asynchronous_metric_log`, необходимо создать файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержимым:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />


## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics} 

<SettingsInfoBlock type="Bool" default_value="0" />Включает вычисление ресурсоёмких асинхронных метрик.

## asynchronous_metrics_keeper_metrics_only {#asynchronous_metrics_keeper_metrics_only} 

<SettingsInfoBlock type="Bool" default_value="0" />Наcтраивает асинхронные метрики так, что вычисляются только метрики, связанные с Keeper.

## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="1" />Интервал обновления асинхронных метрик в секундах.

## auth_use_forwarded_address {#auth_use_forwarded_address} 

Использовать исходный адрес для аутентификации клиентов, подключающихся через прокси-сервер.

:::note
Этот параметр следует использовать с особой осторожностью, поскольку переадресованные адреса легко подделать. Серверы, принимающие такую аутентификацию, не должны быть доступны напрямую; к ним следует обращаться только через доверенный прокси-сервер.
:::

## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которое будет использоваться для фонового выполнения операций сброса данных в таблицах с [движком Buffer](/engines/table-engines/special/buffer).

## background_common_pool_size {#background_common_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Максимальное количество потоков, используемых для выполнения различных фоновых операций (преимущественно по сборке мусора) с таблицами [*MergeTree-engine](/engines/table-engines/mergetree-family).

## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которые будут использоваться для выполнения распределённых отправок.

## background_fetches_pool_size {#background_fetches_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное число потоков, используемых для фоновой загрузки частей данных с другой реплики для таблиц на движках семейства [*MergeTree](/engines/table-engines/mergetree-family).

## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />

Задает соотношение между количеством потоков и количеством фоновых слияний и мутаций, которые могут выполняться параллельно.

Например, если коэффициент равен 2 и параметр [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) установлен равным 16, то ClickHouse может выполнять 32 фоновых слияния одновременно. Это возможно, потому что фоновые операции могут быть приостановлены и отложены. Это нужно для того, чтобы небольшие слияния имели более высокий приоритет выполнения.

:::note
Вы можете увеличить это соотношение во время работы сервера. Чтобы уменьшить его, необходимо перезапустить сервер.

Как и в случае с настройкой [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size), параметр [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) может быть задан из профиля `default` для обеспечения обратной совместимости.
:::

## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

<SettingsInfoBlock type="String" default_value="round_robin" />

Политика планирования фоновых слияний и мутаций. Возможные значения: `round_robin` и `shortest_task_first`.

Алгоритм, используемый для выбора следующего слияния или мутации, которые будут выполнены пулом фоновых потоков. Политику можно изменять во время работы без перезапуска сервера.
Может быть применена из профиля `default` для обеспечения обратной совместимости.

Возможные значения:

- `round_robin` — Все параллельные слияния и мутации выполняются циклически (round-robin), чтобы исключить голодание. Меньшие слияния завершаются быстрее, чем большие, просто потому что им нужно объединить меньше блоков.
- `shortest_task_first` — Всегда выполнять более мелкое слияние или мутацию. Слияниям и мутациям назначаются приоритеты на основе их результирующего размера. Слияния с меньшим размером строго предпочитаются большим. Эта политика обеспечивает максимально быстрое слияние маленьких кусков, но может приводить к бесконечному голоданию больших слияний в разделах, сильно перегруженных `INSERT`-ами.

## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которое будет использоваться для выполнения фоновых операций обработки потоков сообщений.

## background_move_pool_size {#background_move_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Максимальное количество потоков, которые будут использоваться для перемещения частей данных на другой диск или том для таблиц движка *MergeTree в фоновом режиме.

## background&#95;pool&#95;size {#background_pool_size}

<SettingsInfoBlock type="UInt64" default_value="16" />

Задает количество потоков, выполняющих фоновые слияния и мутации для таблиц с движками MergeTree.

:::note

* Этот параметр также может быть применён при запуске сервера из конфигурации профиля `default` для обеспечения обратной совместимости при старте сервера ClickHouse.
* Во время работы сервера вы можете только увеличивать количество потоков.
* Чтобы уменьшить количество потоков, необходимо перезапустить сервер.
* Регулируя этот параметр, вы управляете нагрузкой на CPU и диск.
  :::

:::danger
Меньший размер пула использует меньше ресурсов CPU и диска, но фоновые процессы выполняются медленнее, что в конечном итоге может повлиять на производительность запросов.
:::

Перед изменением этого параметра также ознакомьтесь со связанными настройками MergeTree, такими как:

* [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
* [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).
* [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**Пример**

```xml
<background_pool_size>16</background_pool_size>
```


## background_schedule_pool_max_parallel_tasks_per_type_ratio {#background_schedule_pool_max_parallel_tasks_per_type_ratio} 

<SettingsInfoBlock type="Float" default_value="0.8" />Максимальная доля потоков в пуле, которые могут одновременно выполнять задачи одного типа.

## background_schedule_pool_size {#background_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="512" />Максимальное количество потоков, которые будут использоваться для постоянного выполнения легковесных периодических операций с реплицируемыми таблицами, потоковой обработкой Kafka и обновлением кэша DNS.

## backup&#95;log {#backup_log}

Настройки системной таблицы [backup&#95;log](../../operations/system-tables/backup_log.md), в которой регистрируются операции `BACKUP` и `RESTORE`.

<SystemLogParameters />

**Пример**

```xml
<clickhouse>
    <backup_log>
        <database>system</database>
        <table>backup_log</table>
        <flush_interval_milliseconds>1000</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </backup_log>
</clickhouse>
```


## backup_threads {#backup_threads} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />Максимальное число потоков, используемых для выполнения запросов `BACKUP`.

## backups {#backups}

Настройки резервного копирования, используемые при выполнении операторов [`BACKUP` и `RESTORE`](../backup.md).

Следующие параметры можно настроить с помощью подтегов:

{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','Определяет, могут ли несколько операций резервного копирования выполняться параллельно на одном и том же хосте.', 'true'),
    ('allow_concurrent_restores', 'Bool', 'Определяет, могут ли несколько операций восстановления выполняться параллельно на одном и том же хосте.', 'true'),
    ('allowed_disk', 'String', 'Диск для резервного копирования при использовании `File()`. Этот параметр должен быть задан для использования `File`.', ''),
    ('allowed_path', 'String', 'Путь для резервного копирования при использовании `File()`. Этот параметр должен быть задан для использования `File`.', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', 'Количество попыток собрать метаданные перед переходом в режим ожидания в случае несоответствия после сравнения собранных метаданных.', '2'),
    ('collect_metadata_timeout', 'UInt64', 'Таймаут в миллисекундах на сбор метаданных во время резервного копирования.', '600000'),
    ('compare_collected_metadata', 'Bool', 'Если установлено значение true, сравнивает собранные метаданные с существующими, чтобы убедиться, что они не изменяются во время резервного копирования.', 'true'),
    ('create_table_timeout', 'UInt64', 'Таймаут в миллисекундах на создание таблиц во время восстановления.', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', 'Максимальное количество попыток повтора после возникновения ошибки неверной версии во время координированного резервного копирования/восстановления.', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Максимальное время ожидания в миллисекундах перед следующей попыткой собрать метаданные.', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Минимальное время ожидания в миллисекундах перед следующей попыткой собрать метаданные.', '5000'),
    ('remove_backup_files_after_failure', 'Bool', 'Если команда `BACKUP` завершилась с ошибкой, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до сбоя, иначе оставит скопированные файлы как есть.', 'true'),
    ('sync_period_ms', 'UInt64', 'Период синхронизации в миллисекундах для координированного резервного копирования/восстановления.', '5000'),
    ('test_inject_sleep', 'Bool', 'Задержка для тестирования', 'false'),
    ('test_randomize_order', 'Bool', 'Если установлено значение true, случайным образом изменяет порядок некоторых операций в тестовых целях.', 'false'),
    ('zookeeper_path', 'String', 'Путь в ZooKeeper, где хранятся метаданные резервного копирования и восстановления при использовании конструкции `ON CLUSTER`.', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }


| Параметр                                            | Тип    | Описание                                                                                                                                                                    | Значение по умолчанию |
| :-------------------------------------------------- | :----- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | Определяет, могут ли несколько операций создания резервной копии выполняться одновременно на одном и том же хосте.                                                          | `true`                |
| `allow_concurrent_restores`                         | Bool   | Определяет, могут ли несколько операций восстановления выполняться одновременно на одном и том же хосте.                                                                    | `true`                |
| `allowed_disk`                                      | String | Диск, на который выполняется резервное копирование при использовании `File()`. Для использования `File` этот параметр должен быть задан.                                    | ``                    |
| `allowed_path`                                      | String | Путь, по которому выполняется резервное копирование при использовании `File()`. Для использования `File` этот параметр должен быть задан.                                   | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | Количество попыток собрать метаданные перед переходом к ожиданию в случае несогласованности, обнаруженной после сравнения собранных метаданных.                             | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | Таймаут в миллисекундах для сбора метаданных во время резервного копирования.                                                                                               | `600000`              |
| `compare_collected_metadata`                        | Bool   | Если `true`, сравнивает собранные метаданные с существующими, чтобы убедиться, что они не были изменены во время резервного копирования.                                    | `true`                |
| `create_table_timeout`                              | UInt64 | Таймаут в миллисекундах для создания таблиц во время восстановления.                                                                                                        | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | Максимальное количество попыток повторить операцию после возникновения ошибки неверной версии при координированном резервном копировании/восстановлении.                    | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | Максимальное время ожидания в миллисекундах перед следующей попыткой собрать метаданные.                                                                                    | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | Минимальное время ожидания в миллисекундах перед следующей попыткой собрать метаданные.                                                                                     | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | Если команда `BACKUP` завершается с ошибкой, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до момента ошибки, иначе оставит скопированные файлы. | `true`                |
| `sync_period_ms`                                    | UInt64 | Период синхронизации в миллисекундах для координированного резервного копирования/восстановления.                                                                           | `5000`                |
| `test_inject_sleep`                                 | Bool   | Задержка для тестирования                                                                                                                                                   | `false`               |
| `test_randomize_order`                              | Bool   | Если `true`, перемешивает в случайном порядке порядок некоторых операций в целях тестирования.                                                                              | `false`               |
| `zookeeper_path`                                    | String | Путь в ZooKeeper, где хранятся метаданные резервного копирования и восстановления при использовании предложения `ON CLUSTER`.                                               | `/clickhouse/backups` |

По умолчанию этот параметр настроен как:

```xml
<backups>
    ....
</backups>
```


## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество заданий, которые могут быть запланированы в пул потоков ввода-вывода для резервных копий. Рекомендуется не ограничивать эту очередь из-за текущей логики резервного копирования в S3.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

## bcrypt&#95;workfactor {#bcrypt_workfactor}

Параметр сложности для типа аутентификации `bcrypt_password`, который использует [алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).
Этот параметр определяет количество вычислений и время, необходимые для вычисления хеша и проверки пароля.

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
Для приложений с частой аутентификацией
рассмотрите альтернативные методы аутентификации из-за
ресурсоёмкости bcrypt при более высоких значениях параметра сложности (work factor).
:::


## blob&#95;storage&#95;log {#blob_storage_log}

Параметры для системной таблицы [`blob_storage_log`](../system-tables/blob_storage_log.md).

<SystemLogParameters />

Пример:

```xml
<blob_storage_log>
    <database>system</database
    <table>blob_storage_log</table
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```


## builtin&#95;dictionaries&#95;reload&#95;interval {#builtin_dictionaries_reload_interval}

Интервал в секундах между перезагрузками встроенных словарей.

ClickHouse перезагружает встроенные словари каждые x секунд. Это позволяет редактировать словари «на лету» без перезапуска сервера.

**Пример**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Устанавливает максимальное допустимое отношение размера кэша к объёму ОЗУ. Позволяет уменьшить размер кэша на системах с ограниченным объёмом памяти.

## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

<SettingsInfoBlock type="Double" default_value="0" />Для тестирования.

## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

<SettingsInfoBlock type="UInt64" default_value="15" />

Интервал в секундах, в течение которого максимально допустимое потребление памяти сервером корректируется в соответствии с пороговым значением в cgroups.

Чтобы отключить наблюдатель cgroups, установите это значение в `0`.

## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Задает размер кеша (в элементах) для [скомпилированных выражений](../../operations/caches.md).

## compiled_expression_cache_size {#compiled_expression_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />Задает размер кеша (в байтах) для [скомпилированных выражений](../../operations/caches.md).

## compression {#compression}

Настройки сжатия данных для таблиц с движком [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

:::note
Рекомендуем не изменять этот параметр, если вы только начали использовать ClickHouse.
:::

**Шаблон конфигурации**:

```xml
<compression>
    <case>
      <min_part_size>...</min_part_size>
      <min_part_size_ratio>...</min_part_size_ratio>
      <method>...</method>
      <level>...</level>
    </case>
    ...
</compression>
```

**Поля `<case>`**:

* `min_part_size` – Минимальный размер части данных.
* `min_part_size_ratio` – Отношение размера части данных к размеру таблицы.
* `method` – Метод сжатия. Допустимые значения: `lz4`, `lz4hc`, `zstd`,`deflate_qpl`.
* `level` – Уровень сжатия. См. [Codecs](/sql-reference/statements/create/table#general-purpose-codecs).

:::note
Вы можете настроить несколько секций `<case>`.
:::

**Действия при выполнении условий**:

* Если часть данных соответствует набору условий, ClickHouse использует указанный метод сжатия.
* Если часть данных соответствует нескольким наборам условий, ClickHouse использует первый подходящий набор условий.

:::note
Если для части данных не выполнено ни одно условие, ClickHouse использует сжатие `lz4`.
:::

**Пример**

```xml
<compression incl="clickhouse_compression">
    <case>
        <min_part_size>10000000000</min_part_size>
        <min_part_size_ratio>0.01</min_part_size_ratio>
        <method>zstd</method>
        <level>1</level>
    </case>
</compression>
```


## concurrent_threads_scheduler {#concurrent_threads_scheduler} 

<SettingsInfoBlock type="String" default_value="fair_round_robin" />

Политика планирования слотов CPU, задаваемых параметрами `concurrent_threads_soft_limit_num` и `concurrent_threads_soft_limit_ratio_to_cores`. Алгоритм, который определяет, как ограниченное число слотов CPU распределяется между одновременными запросами. Планировщик можно изменить во время работы без перезапуска сервера.

Возможные значения:

- `round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads` слотов CPU. Один слот на поток. При конкурентном доступе слоты CPU выдаются запросам по принципу round-robin. Обратите внимание, что первый слот выделяется безусловно, что может приводить к несправедливому распределению и увеличенной задержке для запросов с высоким значением `max_threads` при большом числе запросов с `max_threads` = 1.
- `fair_round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads - 1` слотов CPU. Вариант `round_robin`, который не требует слот CPU для первого потока каждого запроса. Таким образом, запросы с `max_threads` = 1 не требуют ни одного слота и не могут несправедливо занять все слоты. Слоты не выделяются безусловно.

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество потоков обработки запросов, за исключением потоков для получения данных с удалённых серверов, разрешённое для одновременного выполнения всех запросов. Это не жёсткий, а мягкий лимит. Если лимит достигнут, запрос всё равно получит как минимум один поток для выполнения. В процессе выполнения запрос может увеличить число потоков до требуемого, если становятся доступны дополнительные потоки.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" />То же, что и [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num), но задаётся как коэффициент относительно числа ядер.

## config_reload_interval_ms {#config_reload_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="2000" />

Как часто ClickHouse будет перезагружать конфигурацию и проверять, не появились ли новые изменения

## core&#95;dump {#core_dump}

Настраивает мягкий лимит размера файла дампа ядра.

:::note
Жёсткий лимит настраивается с помощью системных инструментов.
:::

**Пример**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```


## cpu&#95;slot&#95;preemption {#cpu_slot_preemption}

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, как выполняется планирование нагрузки для CPU-ресурсов (MASTER THREAD и WORKER THREAD).

* Если `true` (рекомендуется), учет ведется на основе фактически потребленного процессорного времени. Конкурирующим нагрузкам выделяется справедливый объем процессорного времени. Слоты выделяются на ограниченный период времени и повторно запрашиваются после истечения этого периода. Запрос слота может блокировать выполнение потока в случае перегрузки по CPU-ресурсам, то есть может происходить вытеснение (preemption). Это обеспечивает справедливое распределение процессорного времени.
* Если `false` (по умолчанию), учет ведется на основе количества выделенных CPU-слотов. Конкурирующим нагрузкам выделяется справедливое количество CPU-слотов. Слот выделяется при старте потока, удерживается непрерывно и освобождается при завершении выполнения потока. Количество потоков, выделенных для выполнения запроса, может увеличиваться только с 1 до `max_threads` и никогда не уменьшаться. Такой режим более благоприятен для долго выполняющихся запросов и может приводить к голоданию по CPU для коротких запросов.

**Пример**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**См. также**

* [Планирование рабочих нагрузок](/operations/workload-scheduling.md)


## cpu&#95;slot&#95;preemption&#95;timeout&#95;ms {#cpu_slot_preemption_timeout_ms}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Определяет, сколько миллисекунд рабочий поток может ожидать во время вытеснения, то есть пока не будет выделен другой слот CPU. По истечении этого тайм-аута, если потоку не удалось получить новый слот CPU, он завершится, а запрос будет динамически уменьшен до меньшего числа одновременно выполняющихся потоков. Обратите внимание, что главный поток никогда не масштабируется вниз, но может быть вытеснен на неограниченное время. Имеет смысл только тогда, когда `cpu_slot_preemption` включён и ресурс CPU определён для WORKER THREAD.

**Пример**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**См. также**

* [Планирование рабочих нагрузок](/operations/workload-scheduling.md)


## cpu&#95;slot&#95;quantum&#95;ns {#cpu_slot_quantum_ns}

<SettingsInfoBlock type="UInt64" default_value="10000000" />

Определяет, сколько наносекунд процессорного времени потоку разрешено использовать после получения процессорного слота и до того, как он должен запросить следующий процессорный слот. Имеет смысл только, если `cpu_slot_preemption` включён и ресурс CPU задан для MASTER THREAD или WORKER THREAD.

**Пример**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**См. также**

* [Планирование рабочих нагрузок](/operations/workload-scheduling.md)


## crash&#95;log {#crash_log}

Настройки для работы системной таблицы [crash&#95;log](../../operations/system-tables/crash_log.md).

Следующие настройки могут быть заданы с помощью подтегов:

| Setting                            | Description                                                                                                                                                     | Default             | Note                                                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `database`                         | Имя базы данных.                                                                                                                                                |                     |                                                                                                                                 |
| `table`                            | Имя системной таблицы.                                                                                                                                          |                     |                                                                                                                                 |
| `engine`                           | [Определение движка MergeTree](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table) для системной таблицы.                |                     | Нельзя использовать, если определены `partition_by` или `order_by`. Если не задано, по умолчанию выбирается `MergeTree`         |
| `partition_by`                     | [Пользовательский ключ партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key.md) для системной таблицы.                            |                     | Если для системной таблицы задан `engine`, параметр `partition_by` должен быть указан непосредственно внутри &#39;engine&#39;   |
| `ttl`                              | Задает [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) таблицы.                                                             |                     | Если для системной таблицы задан `engine`, параметр `ttl` должен быть указан непосредственно внутри &#39;engine&#39;            |
| `order_by`                         | [Пользовательский ключ сортировки](/engines/table-engines/mergetree-family/mergetree#order_by) для системной таблицы. Нельзя использовать, если задан `engine`. |                     | Если для системной таблицы задан `engine`, параметр `order_by` должен быть указан непосредственно внутри &#39;engine&#39;       |
| `storage_policy`                   | Имя политики хранения, используемой для таблицы (необязательный параметр).                                                                                      |                     | Если для системной таблицы задан `engine`, параметр `storage_policy` должен быть указан непосредственно внутри &#39;engine&#39; |
| `settings`                         | [Дополнительные параметры](/engines/table-engines/mergetree-family/mergetree/#settings), управляющие поведением MergeTree (необязательный параметр).            |                     | Если для системной таблицы задан `engine`, параметр `settings` должен быть указан непосредственно внутри &#39;engine&#39;       |
| `flush_interval_milliseconds`      | Интервал сброса данных из буфера в памяти в таблицу.                                                                                                            | `7500`              |                                                                                                                                 |
| `max_size_rows`                    | Максимальный размер журналов в строках. Когда количество несброшенных журналов достигает `max_size_rows`, журналы сбрасываются на диск.                         | `1024`              |                                                                                                                                 |
| `reserved_size_rows`               | Предварительно выделенный объем памяти в строках для журналов.                                                                                                  | `1024`              |                                                                                                                                 |
| `buffer_size_rows_flush_threshold` | Порог по количеству строк. При достижении порога в фоновом режиме запускается сброс журналов на диск.                                                           | `max_size_rows / 2` |                                                                                                                                 |
| `flush_on_crash`                   | Определяет, должны ли журналы сбрасываться на диск в случае сбоя.                                                                                               | `false`             |                                                                                                                                 |

Файл конфигурации сервера по умолчанию `config.xml` содержит следующий раздел настроек:

```xml
<crash_log>
    <database>system</database>
    <table>crash_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1024</max_size_rows>
    <reserved_size_rows>1024</reserved_size_rows>
    <buffer_size_rows_flush_threshold>512</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</crash_log>
```


## custom&#95;cached&#95;disks&#95;base&#95;directory {#custom_cached_disks_base_directory}

Этот параметр задает путь к кэшу для пользовательских (созданных из SQL) кэшируемых дисков.
`custom_cached_disks_base_directory` имеет более высокий приоритет для пользовательских дисков, чем `filesystem_caches_path` (указанный в `filesystem_caches_path.xml`),
который используется, если первый отсутствует.
Путь параметра кэша файловой системы должен находиться внутри этого каталога,
в противном случае будет выброшено исключение, которое не позволит создать диск.

:::note
Это не повлияет на диски, созданные в более старой версии, с которой был выполнен апгрейд сервера.
В этом случае исключение выброшено не будет, чтобы сервер смог успешно запуститься.
:::

Пример:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```


## custom&#95;settings&#95;prefixes {#custom_settings_prefixes}

Список префиксов для [пользовательских настроек](/operations/settings/query-level#custom_settings). Префиксы должны быть разделены запятыми.

**Пример**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**См. также**

* [Пользовательские настройки](/operations/settings/query-level#custom_settings)


## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec} 

<SettingsInfoBlock type="UInt64" default_value="480" />

Задержка, в течение которой удалённую таблицу можно восстановить с помощью оператора [`UNDROP`](/sql-reference/statements/undrop.md). Если `DROP TABLE` выполнялся с модификатором `SYNC`, данная настройка игнорируется.
Значение по умолчанию для этой настройки — `480` (8 минут).

## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

<SettingsInfoBlock type="UInt64" default_value="5" />При ошибке удаления таблицы ClickHouse будет ждать указанное время, прежде чем повторить операцию.

## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="16" />Размер пула потоков, используемого при удалении таблиц.

## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

<SettingsInfoBlock type="UInt64" default_value="86400" />

Параметр задачи, которая очищает каталог `store/` от неиспользуемых данных.
Определяет периодичность выполнения задачи.

:::note
Значение `0` означает «никогда». Значение по умолчанию соответствует 1 дню.
:::

## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

Параметр задачи, которая удаляет мусор из каталога `store/`.
Если какой-либо подкаталог не используется сервером clickhouse-server и этот каталог не изменялся в течение последних
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) секунд, задача «скрывает» этот каталог,
удаляя все права доступа. Это также работает для каталогов, которые clickhouse-server не
ожидает увидеть внутри `store/`.

:::note
Значение `0` означает «немедленно».
:::

## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />

Параметр задачи, которая удаляет «мусор» из директории `store/`.
Если некоторый подкаталог не используется clickhouse-server и ранее был «скрыт»
(см. [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec)),
и этот каталог не изменялся в течение количества секунд,
заданного параметром
[`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec),
задача удалит этот каталог.
Это также работает для каталогов, которые clickhouse-server
не ожидает увидеть внутри `store/`.

:::note
Значение `0` означает «никогда». Значение по умолчанию соответствует 30 дням.
:::

## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает окончательное отсоединение таблиц в реплицируемых базах данных

## database_replicated_drop_broken_tables {#database_replicated_drop_broken_tables} 

<SettingsInfoBlock type="Bool" default_value="0" />Удалять лишние таблицы из реплицируемых баз данных вместо перемещения их в отдельную локальную базу данных

## dead&#95;letter&#95;queue {#dead_letter_queue}

Параметр системной таблицы «dead&#95;letter&#95;queue».

<SystemLogParameters />

Параметры по умолчанию:

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```


## default_database {#default_database} 

<SettingsInfoBlock type="String" default_value="default" />Имя базы данных по умолчанию.

## default&#95;password&#95;type {#default_password_type}

Устанавливает тип пароля, который будет автоматически использоваться в запросах вида `CREATE USER u IDENTIFIED BY 'p'`.

Допустимые значения:

* `plaintext_password`
* `sha256_password`
* `double_sha1_password`
* `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```


## default&#95;profile {#default_profile}

Профиль настроек по умолчанию. Профили настроек расположены в файле, указанном в параметре `user_config`.

**Пример**

```xml
<default_profile>default</default_profile>
```


## default&#95;replica&#95;name {#default_replica_name}

<SettingsInfoBlock type="String" default_value="{replica}" />

Имя реплики в ZooKeeper.

**Пример**

```xml
<default_replica_name>{replica}</default_replica_name>
```


## default&#95;replica&#95;path {#default_replica_path}

<SettingsInfoBlock type="String" default_value="/clickhouse/tables/{uuid}/{shard}" />

Путь к таблице в ZooKeeper.

**Пример**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```


## default&#95;session&#95;timeout {#default_session_timeout}

Тайм-аут сеанса по умолчанию, в секундах.

```xml
<default_session_timeout>60</default_session_timeout>
```


## dictionaries&#95;config {#dictionaries_config}

Путь к конфигурационному файлу для словарей.

Путь:

* Укажите абсолютный путь или путь относительно конфигурационного файла сервера.
* Путь может содержать подстановочные символы * и ?.

См. также:

* &quot;[Словари](../../sql-reference/dictionaries/index.md)&quot;.

**Пример**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```


## dictionaries&#95;lazy&#95;load {#dictionaries_lazy_load}

<SettingsInfoBlock type="Bool" default_value="1" />

Отложенная загрузка словарей.

* Если `true`, то каждый словарь загружается при первом обращении. Если загрузка не удалась, функция, использующая словарь, выбрасывает исключение.
* Если `false`, то сервер загружает все словари при запуске.

:::note
При запуске сервер будет ждать, пока все словари не завершат загрузку, прежде чем принимать какие-либо подключения
(исключение: если [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) установлено в значение `false`).
:::

**Пример**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```


## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Интервал в миллисекундах между попытками переподключения словарей MySQL и Postgres с включённым `background_reconnect` после сбоя подключения.

## disable_insertion_and_mutation {#disable_insertion_and_mutation} 

<SettingsInfoBlock type="Bool" default_value="0" />

Отключает запросы INSERT/ALTER/DELETE. Этот параметр включается, если нужны узлы только для чтения, чтобы операции вставки и мутаций не влияли на производительность чтения. Вставки во внешние движки (S3, DataLake, MySQL, PostgreSQL, Kafka и т. д.) разрешены независимо от этого параметра.

## disable_internal_dns_cache {#disable_internal_dns_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />Отключает внутренний DNS-кэш. Рекомендуется при эксплуатации ClickHouse в системах с часто меняющейся инфраструктурой, таких, как Kubernetes.

## disable&#95;tunneling&#95;for&#95;https&#95;requests&#95;over&#95;http&#95;proxy {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию для выполнения запросов `HTTPS` через прокси `HTTP` используется туннелирование (т.е. `HTTP CONNECT`). Этот параметр позволяет его отключить.

**no&#95;proxy**

По умолчанию все запросы проходят через прокси. Чтобы отключить его для отдельных хостов, необходимо задать переменную `no_proxy`.
Её можно указать внутри секции `<proxy>` для list- и remote-resolvers, а также задать как переменную окружения для environment-resolver.
Поддерживаются IP-адреса, домены, поддомены и шаблон `'*'` для полного обхода прокси. Ведущие точки удаляются так же, как это делает curl.

**Пример**

Приведённая ниже конфигурация обходит прокси для запросов к `clickhouse.cloud` и ко всем его поддоменам (например, `auth.clickhouse.cloud`).
То же самое относится к GitLab, даже если домен указан с ведущей точкой. И `gitlab.com`, и `about.gitlab.com` будут обходить прокси.

```xml
<proxy>
    <no_proxy>clickhouse.cloud,.gitlab.com</no_proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```


## disk_connections_soft_limit {#disk_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />Соединения, превышающие этот лимит, имеют значительно более короткий срок жизни. Лимит применяется к соединениям с дисками.

## disk_connections_store_limit {#disk_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="30000" />Подключения, превышающие этот лимит, сбрасываются после использования. Установите значение 0, чтобы отключить кэш подключений. Лимит применяется к подключениям к дискам.

## disk_connections_warn_limit {#disk_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Предупреждающие сообщения записываются в логи, если число активных соединений превышает этот предел. Предел применяется к соединениям с дисками.

## display_secrets_in_show_and_select {#display_secrets_in_show_and_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает отображение секретов в запросах `SHOW` и `SELECT` для таблиц, баз данных, табличных функций и словарей.

Пользователь, желающий видеть секреты, также должен включить
настройку формата [`format_display_secrets_in_show_and_select`](../settings/formats#format_display_secrets_in_show_and_select)
и иметь привилегию
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Возможные значения:

- `0` — Отключено.
- `1` — Включено.

## distributed_cache_apply_throttling_settings_from_client {#distributed_cache_apply_throttling_settings_from_client} 

<SettingsInfoBlock type="Bool" default_value="1" />Применять ли серверу кэша настройки ограничения нагрузки (throttling), полученные от клиента.

## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio} 

<SettingsInfoBlock type="Float" default_value="0.1" />Мягкое ограничение на количество подключений, которые распределённый кэш будет стараться держать свободными. Когда количество свободных подключений опускается ниже значения distributed_cache_keep_up_free_connections_ratio * max_connections, соединения с самой старой активностью будут закрываться до тех пор, пока число свободных подключений снова не превысит этот предел.

## distributed&#95;ddl {#distributed_ddl}

Управляет выполнением [распределённых DDL-запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) в кластере.
Работает только, если [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) включён.

Настраиваемые параметры в секции `<distributed_ddl>` включают:

| Setting                | Description                                                                                                                                   | Default Value                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `path`                 | путь в Keeper к `task_queue` для DDL-запросов                                                                                                 |                                        |
| `profile`              | профиль, используемый для выполнения DDL-запросов                                                                                             |                                        |
| `pool_size`            | количество запросов `ON CLUSTER`, которые могут выполняться одновременно                                                                      |                                        |
| `max_tasks_in_queue`   | максимальное количество задач, которые могут находиться в очереди.                                                                            | `1,000`                                |
| `task_max_lifetime`    | удалить узел, если его возраст превышает это значение.                                                                                        | `7 * 24 * 60 * 60` (неделя в секундах) |
| `cleanup_delay_period` | очистка начинается после получения события о новом узле, если последняя очистка выполнялась не менее чем `cleanup_delay_period` секунд назад. | `60` секунд                            |

**Пример**

```xml
<distributed_ddl>
    <!-- Путь в ZooKeeper к очереди с DDL-запросами -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Настройки из этого профиля будут использоваться для выполнения DDL-запросов -->
    <profile>default</profile>

    <!-- Определяет, сколько запросов ON CLUSTER может выполняться одновременно. -->
    <pool_size>1</pool_size>

    <!--
         Настройки очистки (активные задачи не удаляются)
    -->

    <!-- Определяет TTL задачи (по умолчанию 1 неделя) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Определяет, как часто выполняется очистка (в секундах) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Определяет максимальное количество задач в очереди -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```


## distributed_ddl_use_initial_user_and_roles {#distributed_ddl_use_initial_user_and_roles} 

<SettingsInfoBlock type="Bool" default_value="0" />Если включено, запросы ON CLUSTER будут выполняться на удалённых шардах от имени пользователя, инициировавшего запрос, с сохранением его ролей. Это обеспечивает единообразный контроль доступа во всём кластере, но требует, чтобы этот пользователь и его роли существовали на всех узлах.

## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4} 

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает преобразовывать имена в IPv4-адреса.

## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6} 

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает преобразование доменных имён в IPv6-адреса.

## dns_cache_max_entries {#dns_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Максимальное количество записей во внутреннем DNS-кэше.

## dns_cache_update_period {#dns_cache_update_period} 

<SettingsInfoBlock type="Int32" default_value="15" />Период обновления внутреннего DNS-кэша в секундах.

## dns_max_consecutive_failures {#dns_max_consecutive_failures} 

<SettingsInfoBlock type="UInt32" default_value="10" />Максимальное количество последовательных сбоев разрешения имени хоста через DNS, после которого это имя хоста удаляется из DNS-кэша ClickHouse.

## drop_distributed_cache_pool_size {#drop_distributed_cache_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Размер пула потоков, используемого для очистки распределённого кэша.

## drop_distributed_cache_queue_size {#drop_distributed_cache_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Размер очереди пула потоков, используемого для очистки распределённого кэша.

## enable_azure_sdk_logging {#enable_azure_sdk_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />Включает логирование SDK Azure

## encryption {#encryption}

Задаёт команду для получения ключа, который будет использоваться [кодеками шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должен быть передан через переменные окружения или указан в конфигурационном файле.

Ключи могут быть в шестнадцатеричном формате или строками длиной 16 байт.

**Пример**

Загрузка из конфигурации:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
Хранение ключей в файле конфигурации не рекомендуется — это небезопасно. Вы можете вынести ключи в отдельный файл конфигурации на защищённом диске и создать символическую ссылку на этот файл в каталоге `config.d/`.
:::

Загрузка из конфигурации, когда ключ задан в шестнадцатеричном виде:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Чтение ключа из переменной окружения:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Здесь `current_key_id` устанавливает активный ключ шифрования, а все перечисленные ключи могут использоваться для расшифровки.

Каждый из этих методов поддерживает работу с несколькими ключами:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Здесь `current_key_id` указывает текущий ключ для шифрования.

Также пользователи могут задать nonce длиной 12 байт (по умолчанию процессы шифрования и расшифровки используют nonce, состоящий из нулевых байтов):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Или его можно указать в шестнадцатеричном виде:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
Всё вышесказанное применимо и к `aes_256_gcm_siv` (но длина ключа должна составлять 32 байта).
:::


## error&#95;log {#error_log}

По умолчанию он отключён.

**Включение**

Чтобы вручную включить сбор истории ошибок [`system.error_log`](../../operations/system-tables/error_log.md), создайте файл `/etc/clickhouse-server/config.d/error_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <error_log>
        <database>system</database>
        <table>error_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </error_log>
</clickhouse>
```

**Отключение**

Чтобы отключить параметр `error_log`, создайте файл `/etc/clickhouse-server/config.d/disable_error_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## format_parsing_thread_pool_queue_size {#format_parsing_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество задач, которые могут находиться в очереди пула потоков для разбора входных данных.

:::note
Значение `0` означает отсутствие ограничения.
:::

## format&#95;schema&#95;path {#format_schema_path}

Путь к каталогу со схемами для входных данных, например к схемам для формата [CapnProto](/interfaces/formats/CapnProto).

**Пример**

```xml
<!-- Директория, содержащая файлы схем для различных входных форматов. -->
<format_schema_path>format_schemas/</format_schema_path>
```


## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />Период таймера тактов процессора для глобального профайлера (в наносекундах). Установите значение 0, чтобы отключить глобальный профайлер по тактам процессора. Рекомендуемое значение — не менее 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (раз в секунду) для профилирования всего кластера.

## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />Период таймера реального времени глобального профилировщика (в наносекундах). Установите значение 0, чтобы отключить глобальный профилировщик реального времени. Рекомендуемое значение — не менее 10000000 (100 раз в секунду) для отдельных запросов или 1000000000 (раз в секунду) для профилирования на уровне всего кластера.

## google&#95;protos&#95;path {#google_protos_path}

Задает каталог, содержащий proto-файлы для типов Protobuf.

Пример:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## graphite {#graphite}

Отправка данных в [Graphite](https://github.com/graphite-project).

Настройки:

* `host` – сервер Graphite.
* `port` – порт на сервере Graphite.
* `interval` – интервал отправки, в секундах.
* `timeout` – таймаут отправки данных, в секундах.
* `root_path` – префикс для ключей.
* `metrics` – отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
* `events` – отправка данных-дельт, накопленных за период, из таблицы [system.events](/operations/system-tables/events).
* `events_cumulative` – отправка накопительных (кумулятивных) данных из таблицы [system.events](/operations/system-tables/events).
* `asynchronous_metrics` – отправка данных из таблицы [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics).

Можно настроить несколько блоков `<graphite>`. Например, вы можете использовать это для отправки разных данных с разными интервалами.

**Пример**

```xml
<graphite>
    <host>localhost</host>
    <port>42000</port>
    <timeout>0.1</timeout>
    <interval>60</interval>
    <root_path>one_min</root_path>
    <metrics>true</metrics>
    <events>true</events>
    <events_cumulative>false</events_cumulative>
    <asynchronous_metrics>true</asynchronous_metrics>
</graphite>
```


## graphite&#95;rollup {#graphite_rollup}

Настройки прореживания данных Graphite.

Подробнее см. в разделе [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md).

**Пример**

```xml
<graphite_rollup_example>
    <default>
        <function>max</function>
        <retention>
            <age>0</age>
            <precision>60</precision>
        </retention>
        <retention>
            <age>3600</age>
            <precision>300</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>3600</precision>
        </retention>
    </default>
</graphite_rollup_example>
```


## hsts&#95;max&#95;age {#hsts_max_age}

Время действия HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. Если вы зададите положительное число, HSTS будет включён, а max-age будет равен указанному вами числу.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## http_connections_soft_limit {#http_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />Соединения сверх этого лимита имеют значительно более короткий срок жизни. Лимит применяется к HTTP‑соединениям, которые не привязаны ни к одному диску или хранилищу.

## http_connections_store_limit {#http_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />Соединения сверх этого предела очищаются после использования. Установите 0, чтобы отключить кэш соединений. Предел применяется к HTTP‑соединениям, которые не привязаны ни к какому диску или хранилищу.

## http_connections_warn_limit {#http_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Предупреждающие сообщения записываются в журнал, если число используемых соединений превышает этот предел. Ограничение применяется к HTTP‑соединениям, которые не принадлежат никакому диску или хранилищу.

## http&#95;handlers {#http_handlers}

Позволяет использовать пользовательские HTTP‑обработчики.
Чтобы добавить новый http‑обработчик, просто добавьте новый `<rule>`.
Правила проверяются сверху вниз в указанном порядке,
и при первом совпадении соответствующий обработчик запускается.

Следующие параметры могут быть настроены с помощью подтегов:

| Sub-tags             | Definition                                                                                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                | Для сопоставления URL запроса можно использовать префикс &#39;regex:&#39; для сопоставления по регулярному выражению (необязательно)                                                                                        |
| `methods`            | Для сопоставления HTTP‑методов запроса можно использовать запятые для разделения нескольких методов (необязательно)                                                                                                         |
| `headers`            | Для сопоставления заголовков запроса сопоставляйте каждый дочерний элемент (имя дочернего элемента — имя заголовка); можно использовать префикс &#39;regex:&#39; для сопоставления по регулярному выражению (необязательно) |
| `handler`            | Обработчик запроса                                                                                                                                                                                                          |
| `empty_query_string` | Проверяет, что в URL отсутствует строка запроса                                                                                                                                                                             |

`handler` содержит следующие параметры, которые могут быть настроены с помощью подтегов:

| Sub-tags           | Definition                                                                                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`              | Адрес перенаправления                                                                                                                                                                                          |
| `type`             | Поддерживаемые типы: static, dynamic&#95;query&#95;handler, predefined&#95;query&#95;handler, redirect                                                                                                         |
| `status`           | Используется с типом static, код статуса ответа                                                                                                                                                                |
| `query_param_name` | Используется с типом dynamic&#95;query&#95;handler, извлекает и выполняет значение, соответствующее `<query_param_name>` в параметрах HTTP‑запроса                                                             |
| `query`            | Используется с типом predefined&#95;query&#95;handler, выполняет запрос при вызове обработчика                                                                                                                 |
| `content_type`     | Используется с типом static, значение заголовка Content-Type ответа                                                                                                                                            |
| `response_content` | Используется с типом static, содержимое ответа, отправляемое клиенту; при использовании префикса &#39;file://&#39; или &#39;config://&#39; содержимое берётся из файла или конфигурации и отправляется клиенту |

Вместе со списком правил можно указать `<defaults/>`, который включает все обработчики по умолчанию.

Пример:

```xml
<http_handlers>
    <rule>
        <url>/</url>
        <methods>POST,GET</methods>
        <headers><pragma>no-cache</pragma></headers>
        <handler>
            <type>dynamic_query_handler</type>
            <query_param_name>query</query_param_name>
        </handler>
    </rule>

    <rule>
        <url>/predefined_query</url>
        <methods>POST,GET</methods>
        <handler>
            <type>predefined_query_handler</type>
            <query>SELECT * FROM system.settings</query>
        </handler>
    </rule>

    <rule>
        <handler>
            <type>static</type>
            <status>200</status>
            <content_type>text/plain; charset=UTF-8</content_type>
            <response_content>config://http_server_default_response</response_content>
        </handler>
    </rule>
</http_handlers>
```


## http&#95;options&#95;response {#http_options_response}

Используется для добавления заголовков к ответу на HTTP-запрос `OPTIONS`.
Метод `OPTIONS` используется при выполнении предварительных CORS-запросов (preflight).

Подробнее см. в разделе [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS).

Пример:

```xml
<http_options_response>
     <header>
            <name>Access-Control-Allow-Origin</name>
            <value>*</value>
     </header>
     <header>
          <name>Access-Control-Allow-Headers</name>
          <value>origin, x-requested-with, x-clickhouse-format, x-clickhouse-user, x-clickhouse-key, Authorization</value>
     </header>
     <header>
          <name>Access-Control-Allow-Methods</name>
          <value>POST, GET, OPTIONS</value>
     </header>
     <header>
          <name>Access-Control-Max-Age</name>
          <value>86400</value>
     </header>
</http_options_response>
```


## http&#95;server&#95;default&#95;response {#http_server_default_response}

Страница, которая отображается по умолчанию при обращении к HTTP(S)-серверу ClickHouse.
Значение по умолчанию — «Ok.» (с символом перевода строки в конце)

**Пример**

Открывает `https://tabix.io/` при обращении к `http://localhost: http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />Размер пула фоновых потоков для каталога Iceberg

## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Максимальное количество задач, которые можно поставить в очередь пула каталога Iceberg

## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Максимальный размер кэша файлов метаданных Iceberg в количестве записей. Ноль означает, что кэш отключён.

## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики кэширования метаданных Iceberg.

## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Максимальный размер кэша метаданных Iceberg в байтах. Нулевое значение отключает кэш.

## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (при использовании политики SLRU) в кэше метаданных Iceberg по отношению к общему размеру кэша.

## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

При значении `true` ClickHouse не записывает значение по умолчанию для пустого предложения `SQL SECURITY` в запросах `CREATE VIEW`.

:::note
Этот параметр нужен только на период миграции и станет устаревшим в версии 24.4.
:::

## include&#95;from {#include_from}

Путь к файлу с подстановками. Поддерживаются форматы XML и YAML.

Дополнительные сведения см. в разделе &quot;[Файлы конфигурации](/operations/configuration-files)&quot;.

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## index_mark_cache_policy {#index_mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики кэширования меток вторичных индексов.

## index_mark_cache_size {#index_mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

Максимальный размер кэша для индексных отметок.

:::note

Значение `0` означает, что кэш отключен.

Этот параметр можно изменять во время работы сервера; изменения вступают в силу немедленно.
:::

## index_mark_cache_size_ratio {#index_mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.3" />Размер защищённой очереди (в случае политики SLRU) в кэше меток вторичного индекса относительно общего размера кэша.

## index_uncompressed_cache_policy {#index_uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша несжатых данных вторичных индексов.

## index_uncompressed_cache_size {#index_uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер кэша для несжатых блоков индексов `MergeTree`.

:::note
Значение `0` означает, что кэш отключен.

Этот параметр можно изменить во время работы, и изменения вступают в силу немедленно.
:::

## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше несжатого вторичного индекса относительно общего размера кэша.

## interserver&#95;http&#95;credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер использует эти учетные данные для аутентификации других реплик.
Поэтому значение `interserver_http_credentials` должно совпадать для всех реплик в кластере.

:::note

* По умолчанию, если секция `interserver_http_credentials` отсутствует, аутентификация при репликации не используется.
* Настройки `interserver_http_credentials` не относятся к [конфигурации](../../interfaces/cli.md#configuration_files) учетных данных клиента ClickHouse.
* Эти учетные данные общие для репликации по `HTTP` и `HTTPS`.
  :::

Следующие настройки могут быть заданы с помощью подтегов:

* `user` — имя пользователя.
* `password` — пароль.
* `allow_empty` — если `true`, то другим репликам разрешено подключаться без аутентификации, даже если заданы учетные данные. Если `false`, то подключения без аутентификации отклоняются. Значение по умолчанию: `false`.
* `old` — содержит старые `user` и `password`, использовавшиеся при ротации учетных данных. Можно указать несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию межсерверных учетных данных без одновременной остановки всех реплик для обновления их конфигурации. Учетные данные можно менять в несколько шагов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволит устанавливать подключения как с аутентификацией, так и без нее.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите для `allow_empty` значение `false` или удалите этот параметр. Это сделает аутентификацию с новыми учетными данными обязательной.

Чтобы изменить существующие учетные данные, перенесите имя пользователя и пароль в раздел `interserver_http_credentials.old` и задайте для `user` и `password` новые значения. На этом этапе сервер использует новые учетные данные для подключения к другим репликам и принимает подключения как с новыми, так и со старыми учетными данными.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>222</password>
    <old>
        <user>admin</user>
        <password>111</password>
    </old>
    <old>
        <user>temp</user>
        <password>000</password>
    </old>
</interserver_http_credentials>
```

После применения новых учетных данных ко всем репликам старые можно удалить.


## interserver&#95;http&#95;host {#interserver_http_host}

Имя хоста, которое другие серверы могут использовать для доступа к этому серверу.

Если не задано, определяется так же, как при выполнении команды `hostname -f`.

Полезно, чтобы не зависеть от конкретного сетевого интерфейса.

**Пример**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver&#95;http&#95;port {#interserver_http_port}

Порт для обмена данными между серверами ClickHouse.

**Пример**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver&#95;https&#95;host {#interserver_https_host}

Аналогично [`interserver_http_host`](#interserver_http_host), за исключением того, что это имя хоста используется другими серверами для доступа к этому серверу по `HTTPS`.

**Пример**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver&#95;https&#95;port {#interserver_https_port}

Порт для обмена данными между серверами ClickHouse по `HTTPS`.

**Пример**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver&#95;listen&#95;host {#interserver_listen_host}

Ограничение на хосты, которые могут обмениваться данными между серверами ClickHouse.
Если используется Keeper, то это же ограничение будет применено к обмену данными между разными экземплярами Keeper.

:::note
По умолчанию значение совпадает с параметром [`listen_host`](#listen_host).
:::

**Пример**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

Тип:

Значение по умолчанию:


## io_thread_pool_queue_size {#io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество задач, которые могут быть поставлены в очередь пула потоков ввода-вывода.

:::note
Значение `0` означает отсутствие ограничения.
:::

## jemalloc_collect_global_profile_samples_in_trace_log {#jemalloc_collect_global_profile_samples_in_trace_log} 

<SettingsInfoBlock type="Bool" default_value="0" />Сохранять выборочные выделения памяти jemalloc в system.trace_log

## jemalloc_enable_background_threads {#jemalloc_enable_background_threads} 

<SettingsInfoBlock type="Bool" default_value="1" />Включает использование фоновых потоков jemalloc. Jemalloc использует фоновые потоки для очистки неиспользуемых страниц памяти. Отключение может привести к снижению производительности.

## jemalloc_enable_global_profiler {#jemalloc_enable_global_profiler} 

<SettingsInfoBlock type="Bool" default_value="0" />Включает глобальный профилировщик выделений памяти jemalloc для всех потоков. Jemalloc будет выборочно отслеживать выделения памяти и все освобождения для выборочно отслеживаемых выделений.
Профили можно сбрасывать с помощью SYSTEM JEMALLOC FLUSH PROFILE, что может использоваться для анализа выделений памяти.
Выборки профиля также могут сохраняться в system.trace_log с помощью конфигурации jemalloc_collect_global_profile_samples_in_trace_log или параметра запроса jemalloc_collect_profile_samples_in_trace_log.
См. [Профилирование выделений памяти](/operations/allocation-profiling)

## jemalloc_flush_profile_interval_bytes {#jemalloc_flush_profile_interval_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />Сброс профиля jemalloc будет выполняться после увеличения глобального пикового потребления памяти на jemalloc_flush_profile_interval_bytes

## jemalloc_flush_profile_on_memory_exceeded {#jemalloc_flush_profile_on_memory_exceeded} 

<SettingsInfoBlock type="Bool" default_value="0" />Сброс профиля jemalloc будет выполняться при ошибках превышения общего лимита памяти

## jemalloc_max_background_threads_num {#jemalloc_max_background_threads_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальное количество фоновых потоков jemalloc, которые может быть создано; установите 0, чтобы использовать значение по умолчанию jemalloc

## keep&#95;alive&#95;timeout {#keep_alive_timeout}

<SettingsInfoBlock type="Seconds" default_value="30" />

Время в секундах, в течение которого ClickHouse ожидает входящие HTTP‑запросы перед закрытием соединения.

**Пример**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```


## keeper_hosts {#keeper_hosts} 

Динамическая настройка. Содержит набор хостов [Zoo]Keeper, с которыми ClickHouse потенциально может установить соединение. Не отображает информацию из `<auxiliary_zookeepers>`

## keeper_multiread_batch_size {#keeper_multiread_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальный размер пакета для запроса MultiRead к [Zoo]Keeper с поддержкой пакетной обработки. Если установить значение 0, пакетная обработка будет отключена. Доступно только в ClickHouse Cloud.

## ldap_servers {#ldap_servers} 

Перечислите здесь серверы LDAP с их параметрами подключения, чтобы:

- использовать их как аутентификаторы для отдельных локальных пользователей, у которых указана схема аутентификации `ldap` вместо `password`
- использовать их как удалённые каталоги пользователей.

Следующие настройки можно задать при помощи подтегов:

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | Имя хоста или IP-адрес сервера LDAP — этот параметр является обязательным и не может быть пустым.                                                                                                                                                                                                                                                                                                                                        |
| `port`                         | Порт сервера LDAP. По умолчанию используется 636, если `enable_tls` установлен в true, иначе — `389`.                                                                                                                                                                                                                                                                                                                                     |
| `bind_dn`                      | Шаблон, используемый для построения DN для привязки (bind). Итоговый DN будет сформирован путём замены всех подстрок `\{user_name\}` в шаблоне фактическим именем пользователя при каждой попытке аутентификации.                                                                                                                                                                                                                          |
| `user_dn_detection`            | Раздел с параметрами поиска LDAP для определения фактического DN пользователя, к которому выполняется привязка. В основном используется в фильтрах поиска для последующего сопоставления ролей, когда сервером является Active Directory. Полученный DN пользователя будет использоваться при замене подстрок `\{user_dn\}` везде, где это допускается. По умолчанию DN пользователя установлен равным bind DN, но после выполнения поиска он будет обновлён до фактически обнаруженного значения DN пользователя. |
| `verification_cooldown`        | Период времени в секундах после успешной попытки привязки, в течение которого считается, что пользователь успешно аутентифицирован для всех последующих запросов без обращения к серверу LDAP. Укажите `0` (по умолчанию), чтобы отключить кэширование и принудительно обращаться к серверу LDAP для каждого запроса аутентификации.                                                                                                       |
| `enable_tls`                   | Флаг включения защищённого соединения с сервером LDAP. Укажите `no` для протокола в открытом виде (`ldap://`) (не рекомендуется). Укажите `yes` для LDAP поверх SSL/TLS (`ldaps://`) (рекомендуется, значение по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (протокол в открытом виде (`ldap://`), обновляемый до TLS).                                                                                         |
| `tls_minimum_protocol_version` | Минимальная версия протокола SSL/TLS. Допустимые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (значение по умолчанию).                                                                                                                                                                                                                                                                                                         |
| `tls_require_cert`             | Поведение проверки сертификата однорангового узла (peer) в SSL/TLS. Допустимые значения: `never`, `allow`, `try`, `demand` (значение по умолчанию).                                                                                                                                                                                                                                                                                       |
| `tls_cert_file`                | Путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `tls_key_file`                 | Путь к файлу с ключом сертификата.                                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_ca_cert_file`             | Путь к файлу сертификата ЦС (CA).                                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_ca_cert_dir`              | Путь к каталогу, содержащему сертификаты ЦС (CA).                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`             | Разрешённый набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                                                                                            |

Настройка `user_dn_detection` может быть задана при помощи подтегов:

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | Шаблон, используемый для построения базового DN для поиска LDAP. Итоговый DN будет сформирован путём замены всех подстрок `\{user_name\}` и '\{bind_dn\}' в шаблоне фактическим именем пользователя и bind DN во время поиска LDAP.                                                                                                           |
| `scope`         | Область поиска LDAP. Допустимые значения: `base`, `one_level`, `children`, `subtree` (значение по умолчанию).                                                                                                                                                                                                                                  |
| `search_filter` | Шаблон, используемый для построения фильтра поиска для запроса LDAP. Итоговый фильтр будет сформирован путём замены всех подстрок `\{user_name\}`, `\{bind_dn\}` и `\{base_dn\}` в шаблоне фактическим именем пользователя, bind DN и base DN во время поиска LDAP. Обратите внимание, что специальные символы должны быть корректно экранированы в XML. |

Пример:

```xml
<my_ldap_server>
    <host>localhost</host>
    <port>636</port>
    <bind_dn>uid={user_name},ou=users,dc=example,dc=com</bind_dn>
    <verification_cooldown>300</verification_cooldown>
    <enable_tls>yes</enable_tls>
    <tls_minimum_protocol_version>tls1.2</tls_minimum_protocol_version>
    <tls_require_cert>demand</tls_require_cert>
    <tls_cert_file>/path/to/tls_cert_file</tls_cert_file>
    <tls_key_file>/path/to/tls_key_file</tls_key_file>
    <tls_ca_cert_file>/path/to/tls_ca_cert_file</tls_ca_cert_file>
    <tls_ca_cert_dir>/path/to/tls_ca_cert_dir</tls_ca_cert_dir>
    <tls_cipher_suite>ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:AES256-GCM-SHA384</tls_cipher_suite>
</my_ldap_server>
```

Пример (типичная среда Active Directory с настроенным определением DN пользователя для последующего сопоставления ролей):

```xml
<my_ad_server>
    <host>localhost</host>
    <port>389</port>
    <bind_dn>EXAMPLE\{user_name}</bind_dn>
    <user_dn_detection>
        <base_dn>CN=Users,DC=example,DC=com</base_dn>
        <search_filter>(&amp;(objectClass=user)(sAMAccountName={user_name}))</search_filter>
    </user_dn_detection>
    <enable_tls>no</enable_tls>
</my_ad_server>
```


## license_key {#license_key} 

Лицензионный ключ для ClickHouse Enterprise Edition

## listen&#95;backlog {#listen_backlog}

Backlog (размер очереди ожидающих установления соединений) для прослушивающего сокета. Значение по умолчанию `4096` совпадает со значением для Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не требуется менять, поскольку:

* значение по умолчанию достаточно велико,
* для приёма клиентских соединений у сервера есть отдельный поток.

Поэтому даже если у вас ненулевое значение `TcpExtListenOverflows` (из `nstat`) и этот счётчик растёт для сервера ClickHouse, это не означает, что данное значение нужно увеличивать, поскольку:

* обычно, если `4096` недостаточно, это указывает на некоторую внутреннюю проблему масштабирования ClickHouse, поэтому лучше сообщить об этой проблеме;
* это не означает, что сервер позже сможет обработать больше соединений (и даже если сможет, к тому моменту клиенты уже могут уйти или отключиться).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```


## listen&#95;host {#listen_host}

Ограничение для хостов, с которых могут поступать запросы. Если вы хотите, чтобы сервер отвечал на запросы со всех хостов, укажите `::`.

Примеры:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## listen&#95;reuse&#95;port {#listen_reuse_port}

Разрешает нескольким серверам прослушивать один и тот же адрес:порт. Запросы будут направляться к случайному серверу операционной системой. Включение этого параметра не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

Значение по умолчанию:


## listen&#95;try {#listen_try}

Сервер не завершит работу, если сети IPv6 или IPv4 недоступны при попытке начать приём подключений.

**Пример**

```xml
<listen_try>0</listen_try>
```


## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />Размер пула фоновых задач для загрузки меток

## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно поместить в пул предварительной выборки

## logger {#logger} 

Расположение и формат сообщений журнала.

**Ключи**:

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | Уровень логирования. Допустимые значения: `none` (выключить логирование), `fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test` |
| `log`                  | Путь к файлу журнала.                                                                                                                                              |
| `errorlog`             | Путь к файлу журнала ошибок.                                                                                                                                       |
| `size`                 | Политика ротации: максимальный размер файлов журнала в байтах. После превышения этого порога файл переименовывается и архивируется, создаётся новый файл журнала. |
| `count`                | Политика ротации: максимальное количество исторических файлов журнала ClickHouse, которые хранятся.                                                               |
| `stream_compress`      | Сжимать сообщения журнала с помощью LZ4. Установите `1` или `true` для включения.                                                                                  |
| `console`              | Включить логирование в консоль. Установите `1` или `true` для включения. Значение по умолчанию — `1`, если ClickHouse не запущен в режиме демона, иначе — `0`.     |
| `console_log_level`    | Уровень логирования для консольного вывода. По умолчанию равен `level`.                                                                                            |
| `formatting.type`      | Формат журнала для консольного вывода. В настоящее время поддерживается только `json`.                                                                            |
| `use_syslog`           | Также перенаправлять вывод журнала в syslog.                                                                                                                       |
| `syslog_level`         | Уровень логирования при отправке в syslog.                                                                                                                         |
| `async`                | При значении `true` (по умолчанию) логирование выполняется асинхронно (один фоновый поток на канал вывода). В противном случае логирование идёт в потоке, вызвавшем LOG. |
| `async_queue_max_size` | При использовании асинхронного логирования — максимальное количество сообщений, которые будут храниться в очереди в ожидании сброса. Избыточные сообщения будут отброшены. |
| `startup_level`        | Уровень при запуске используется для установки уровня корневого логгера при старте сервера. После запуска уровень логирования возвращается к настройке `level`.   |
| `shutdown_level`       | Уровень при завершении используется для установки уровня корневого логгера при завершении работы сервера.                                                         |

**Спецификаторы формата журнала**

Имена файлов в путях `log` и `errorLog` поддерживают приведённые ниже спецификаторы формата для результирующего имени файла (для части пути, соответствующей каталогу, они не поддерживаются).

Столбец "Example" показывает вывод для времени `2023-07-06 18:32:07`.

| Спецификатор | Описание                                                                                                                                                                                      | Пример                     |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `%%`         | Литерал %                                                                                                                                                                                     | `%`                        |
| `%n`         | Символ новой строки                                                                                                                                                                           |                            |
| `%t`         | Символ горизонтальной табуляции                                                                                                                                                               |                            |
| `%Y`         | Год в десятичном формате, например 2017                                                                                                                                                       | `2023`                     |
| `%y`         | Две последние цифры года в виде десятичного числа (диапазон [00, 99])                                                                                                                         | `23`                       |
| `%C`         | Первые две цифры года как десятичное число (диапазон [00, 99])                                                                                                                                | `20`                       |
| `%G`         | Четырёхзначный [год по ISO 8601, основанный на номере недели](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), то есть год, содержащий указанную неделю. Обычно используется только с `%V` | `2023`                     |
| `%g`         | Последние 2 цифры [годa по ISO 8601 на основе недель](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), то есть года, который содержит указанную неделю.                                    | `23`                       |
| `%b`         | Сокращённое название месяца, например, Oct (зависит от локали)                                                                                                                                | `Июл`                      |
| `%h`         | Синоним для %b                                                                                                                                                                                | `июл`                      |
| `%B`         | Полное название месяца, например «Октябрь» (зависит от локали)                                                                                                                                | `Июль`                     |
| `%m`         | Месяц в десятичном виде (диапазон [01, 12])                                                                                                                                                   | `07`                       |
| `%U`         | Номер недели в году в виде десятичного числа (воскресенье — первый день недели) (диапазон [00,53])                                                                                            | `27`                       |
| `%W`         | Номер недели года в формате десятичного числа (понедельник — первый день недели) (диапазон [00,53])                                                                                           | `27`                       |
| `%V`         | Номер недели по ISO 8601 (в диапазоне [01,53])                                                                                                                                                | `27`                       |
| `%j`         | День года как десятичное число (диапазон [001, 366])                                                                                                                                          | `187`                      |
| `%d`         | День месяца в виде десятичного числа с ведущим нулём (диапазон [01,31]). Для однозначных чисел добавляется ведущий ноль.                                                                      | `06`                       |
| `%e`         | День месяца в виде десятичного числа, дополненного ведущим пробелом (диапазон [1,31]). Одноразрядному числу предшествует пробел.                                                              | `&nbsp; 6`                 |
| `%a`         | Сокращённое название дня недели, например «Пт» (в зависимости от локали)                                                                                                                      | `Чт`                       |
| `%A`         | Полное название дня недели, например пятница (в зависимости от локали)                                                                                                                        | `Четверг`                  |
| `%w`         | День недели в виде целого числа, где воскресенье — 0 (диапазон [0–6])                                                                                                                         | `4`                        |
| `%u`         | День недели в виде десятичного числа, где понедельник — 1 (формат ISO 8601) (диапазон [1-7])                                                                                                  | `4`                        |
| `%H`         | Час в виде десятичного числа, 24-часовой формат времени (диапазон [00–23])                                                                                                                    | `18`                       |
| `%I`         | Час как десятичное число, в 12-часовом формате (диапазон [01, 12])                                                                                                                            | `06`                       |
| `%M`         | Минута как десятичное число (диапазон [00, 59])                                                                                                                                               | `32`                       |
| `%S`         | Секунда как десятичное число (в диапазоне [00,60])                                                                                                                                            | `07`                       |
| `%c`         | Стандартная строка даты и времени, например, Sun Oct 17 04:41:13 2010 (зависящая от локали)                                                                                                   | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованный формат даты (зависит от локали)                                                                                                                                                | `06.07.23`                 |
| `%X`         | Формат времени с учётом локали, например 18:40:20 или 6:40:20 PM (зависит от локали)                                                                                                          | `18:32:07`                 |
| `%D`         | Краткий формат даты MM/DD/YY, эквивалентный %m/%d/%y                                                                                                                                          | `06.07.23`                 |
| `%F`         | Краткий формат даты YYYY-MM-DD, эквивалентен %Y-%m-%d                                                                                                                                         | `2023-07-06`               |
| `%r`         | Локализованное время в 12‑часовом формате (зависит от настроек локали)                                                                                                                        | `18:32:07`                 |
| `%R`         | Эквивалентно &quot;%H:%M&quot;                                                                                                                                                                | `18:32`                    |
| `%T`         | Эквивалентно «%H:%M:%S» (формат времени ISO 8601)                                                                                                                                             | `18:32:07`                 |
| `%p`         | Локализованное обозначение формата a.m./p.m. (зависит от локали)                                                                                                                              | `PM`                       |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430) или пустая строка, если информация о часовом поясе недоступна                                                                            | `+0800`                    |
| `%Z`         | Локализованное имя или аббревиатура часового пояса, либо пустая строка, если информация о часовом поясе недоступна                                                                            | `Z AWST `                  |

**Пример**

```xml
<logger>
    <level>trace</level>
    <log>/var/log/clickhouse-server/clickhouse-server-%F-%T.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server-%F-%T.err.log</errorlog>
    <size>1000M</size>
    <count>10</count>
    <stream_compress>true</stream_compress>
</logger>
```

Чтобы выводить сообщения журнала только в консоль:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**Переопределения на уровне отдельных логгеров**

Уровень логирования для отдельных логгеров можно переопределять. Например, чтобы отключить все сообщения логгеров «Backup» и «RBAC».

```xml
<logger>
    <levels>
        <logger>
            <name>Backup</name>
            <level>none</level>
        </logger>
        <logger>
            <name>RBAC</name>
            <level>none</level>
        </logger>
    </levels>
</logger>
```

**syslog**

Чтобы дополнительно отправлять сообщения журнала в syslog:

```xml
<logger>
    <use_syslog>1</use_syslog>
    <syslog>
        <address>syslog.remote:10514</address>
        <hostname>myhost.local</hostname>
        <facility>LOG_LOCAL6</facility>
        <format>syslog</format>
    </syslog>
</logger>
```

Ключи для `<syslog>`:

| Key        | Description                                                                                                                                                                                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | Адрес syslog в формате `host\[:port\]`. Если не указан, используется локальный демон.                                                                                                                                                                                                     |
| `hostname` | Имя хоста, с которого отправляются логи (необязательный параметр).                                                                                                                                                                                                                        |
| `facility` | [Ключевое слово facility](https://en.wikipedia.org/wiki/Syslog#Facility) для syslog. Должно быть указано прописными буквами с префиксом &quot;LOG&#95;&quot;, например `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т. д. По умолчанию: `LOG_USER`, если задан `address`, иначе `LOG_DAEMON`. |
| `format`   | Формат сообщения лога. Возможные значения: `bsd` и `syslog.`                                                                                                                                                                                                                              |

**Форматы логов**

Вы можете указать формат лога, который будет выводиться в консоль. В настоящее время поддерживается только JSON.

**Пример**

Ниже приведён пример выходного JSON-лога:

```json
{
  "date_time_utc": "2024-11-06T09:06:09Z",
  "date_time": "1650918987.180175",
  "thread_name": "#1",
  "thread_id": "254545",
  "level": "Trace",
  "query_id": "",
  "logger_name": "BaseDaemon",
  "message": "Получен сигнал 2",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

Чтобы включить поддержку JSON-логирования, используйте следующий фрагмент:

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- Может быть настроено для каждого канала (log, errorlog, console, syslog) или глобально для всех каналов (тогда просто опустите этот параметр). -->
        <!-- <channel></channel> -->
        <names>
            <date_time>date_time</date_time>
            <thread_name>thread_name</thread_name>
            <thread_id>thread_id</thread_id>
            <level>level</level>
            <query_id>query_id</query_id>
            <logger_name>logger_name</logger_name>
            <message>message</message>
            <source_file>source_file</source_file>
            <source_line>source_line</source_line>
        </names>
    </formatting>
</logger>
```

**Переименование ключей для JSON-логов**

Имена ключей можно изменить, задав другие значения тегов внутри тега `<names>`. Например, чтобы изменить `DATE_TIME` на `MY_DATE_TIME`, можно использовать `<date_time>MY_DATE_TIME</date_time>`.

**Пропуск ключей для JSON-логов**

Свойства лога можно исключить, закомментировав соответствующий тег. Например, если вы не хотите, чтобы ваш лог выводил `query_id`, вы можете закомментировать тег `<query_id>`.


## macros {#macros}

Подстановки параметров для реплицируемых таблиц.

Можно опустить, если реплицируемые таблицы не используются.

Для получения дополнительной информации см. раздел [Создание реплицируемых таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```


## mark_cache_policy {#mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша меток.

## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />Доля общего объёма кэша меток, заполняемого при предварительном прогреве.

## mark_cache_size {#mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

Максимальный размер кэша меток (индекса таблиц семейства [`MergeTree`](/engines/table-engines/mergetree-family)).

:::note
Этот параметр можно изменять во время работы, и изменения вступают в силу сразу.
:::

## mark_cache_size_ratio {#mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше меток относительно общего размера кэша.

## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />Количество потоков для загрузки активного набора частей данных (active parts) при запуске.

## max_authentication_methods_per_user {#max_authentication_methods_per_user} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Максимальное количество методов аутентификации, с которыми пользователь может быть создан или изменён.
Изменение этой настройки не влияет на существующих пользователей. Запросы на создание/изменение, связанные с аутентификацией, завершатся с ошибкой, если превысят лимит, указанный в этом параметре.
Запросы на создание/изменение, не связанные с аутентификацией, будут выполняться успешно.

:::note
Значение `0` означает отсутствие ограничения.
:::

## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения в байтах в секунду для всех операций резервного копирования на сервере. Ноль означает отсутствие ограничений.

## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Если количество **неактивных** потоков в пуле потоков ввода-вывода для резервного копирования (Backups IO Thread Pool) превышает `max_backup_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занятые этими потоками, и уменьшит размер пула. При необходимости потоки могут быть созданы снова.

## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse использует потоки из пула Backups IO Thread для выполнения операций ввода-вывода при резервном копировании в S3. `max_backups_io_thread_pool_size` ограничивает максимальное количество потоков в этом пуле.

## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />

Максимальное число потоков, используемых при построении векторных индексов.

:::note
Значение `0` означает использование всех ядер.
:::

## max_concurrent_insert_queries {#max_concurrent_insert_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на общее число одновременно выполняемых запросов INSERT.

:::note

Значение `0` (по умолчанию) означает отсутствие ограничения.

Этот параметр можно изменять во время работы, и изменения вступят в силу немедленно. Уже выполняющиеся запросы останутся без изменений.
:::

## max_concurrent_queries {#max_concurrent_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на общее количество одновременно выполняемых запросов. Обратите внимание, что также необходимо учитывать ограничения на запросы `INSERT` и `SELECT`, а также ограничение на максимальное число запросов для пользователей.

См. также:

- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

Значение `0` (по умолчанию) означает отсутствие ограничения.

Этот параметр можно изменять во время работы сервера, и изменения вступают в силу немедленно. Уже выполняющиеся запросы не будут затронуты.
:::

## max_concurrent_select_queries {#max_concurrent_select_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение общего числа одновременно выполняемых запросов `SELECT`.

:::note

Значение `0` (по умолчанию) означает отсутствие ограничений.

Этот параметр можно изменить во время работы, и изменение вступит в силу немедленно. Уже выполняющиеся запросы останутся без изменений.
:::

## max_connections {#max_connections} 

<SettingsInfoBlock type="Int32" default_value="4096" />Максимальное число одновременных подключений к серверу.

## max_database_num_to_throw {#max_database_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />Если количество баз данных превышает это значение, сервер выбросит исключение. 0 означает отсутствие ограничения.

## max&#95;database&#95;num&#95;to&#95;warn {#max_database_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если количество подключённых баз данных превышает заданное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```


## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size} 

<SettingsInfoBlock type="UInt32" default_value="1" />Количество потоков, используемых для создания таблиц во время восстановления реплики в DatabaseReplicated. Нулевое значение означает, что число потоков равно числу ядер.

## max&#95;dictionary&#95;num&#95;to&#95;throw {#max_dictionary_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество словарей превышает это значение, сервер сгенерирует исключение.

Считаются только таблицы для движков баз данных:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```


## max&#95;dictionary&#95;num&#95;to&#95;warn {#max_dictionary_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если количество подключённых словарей превышает указанное значение, сервер ClickHouse будет добавлять предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```


## max_distributed_cache_read_bandwidth_for_server {#max_distributed_cache_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная суммарная скорость чтения с распределённого кэша на сервере в байтах в секунду. Ноль означает отсутствие ограничений.

## max_distributed_cache_write_bandwidth_for_server {#max_distributed_cache_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная суммарная скорость записи в распределённый кэш на сервере в байтах в секунду. Ноль означает отсутствие ограничения.

## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Сколько записей может содержать статистика хеш-таблицы, собираемая при агрегации

## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />Число потоков, используемых командой ALTER TABLE FETCH PARTITION.

## max_format_parsing_thread_pool_free_size {#max_format_parsing_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество неактивных резервных потоков в пуле потоков для разбора входных данных.

## max_format_parsing_thread_pool_size {#max_format_parsing_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Максимальное суммарное количество потоков, используемых для разбора входных данных.

## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество **простаивающих** потоков в пуле потоков ввода-вывода превышает `max_io_thread_pool_free_size`, ClickHouse освобождает ресурсы, занятые этими потоками, и уменьшает размер пула. При необходимости потоки могут быть созданы заново.

## max_io_thread_pool_size {#max_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse использует потоки из пула потоков ввода-вывода (IO Thread pool) для выполнения операций ввода-вывода (например, для взаимодействия с S3). `max_io_thread_pool_size` ограничивает максимальное число потоков в этом пуле.

## max&#95;keep&#95;alive&#95;requests {#max_keep_alive_requests}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество запросов по одному соединению с keep-alive, после чего оно будет закрыто сервером ClickHouse.

**Пример**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```


## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость локального чтения в байтах в секунду.

:::note
Значение `0` означает отсутствие ограничений.
:::

## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость локальной записи в байтах в секунду.

:::note
Значение `0` означает отсутствие ограничения.
:::

## max_materialized_views_count_for_table {#max_materialized_views_count_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на количество материализованных представлений, привязанных к таблице.

:::note
Здесь учитываются только представления, напрямую зависящие от таблицы, а создание одного представления поверх другого не учитывается.
:::

## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения всех операций слияния на сервере в байтах в секунду. Ноль означает отсутствие ограничений.

## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения всех мутаций на сервере в байтах в секунду. Ноль означает отсутствие ограничений.

## max&#95;named&#95;collection&#95;num&#95;to&#95;throw {#max_named_collection_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если число именованных коллекций превышает это значение, сервер сгенерирует исключение.

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```


## max&#95;named&#95;collection&#95;num&#95;to&#95;warn {#max_named_collection_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если количество именованных коллекций превышает указанное значение, сервер ClickHouse добавляет предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```


## max&#95;open&#95;files {#max_open_files}

Максимальное количество открытых файлов.

:::note
Мы рекомендуем использовать этот параметр в macOS, поскольку функция `getrlimit()` возвращает некорректное значение.
:::

**Пример**

```xml
<max_open_files>262144</max_open_files>
```


## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />

Максимальное отношение времени ожидания CPU в ОС (метрика OSCPUWaitMicroseconds) к времени занятости (метрика OSCPUVirtualTimeMicroseconds), при котором соединения могут быть разорваны. Для вычисления вероятности используется линейная интерполяция между минимальным и максимальным значениями этого отношения; в этой точке вероятность равна 1.
Подробнее см. в разделе [Управление поведением при перегрузке CPU сервера](/operations/settings/server-overload).

## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />Количество потоков для загрузки неактивного набора частей данных (устаревших частей) при запуске.

## max&#95;part&#95;num&#95;to&#95;warn {#max_part_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="100000" />

Если количество активных частей превышает указанное значение, сервер ClickHouse добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```


## max&#95;partition&#95;size&#95;to&#95;drop {#max_partition_size_to_drop}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

Ограничение на удаление разделов.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает значение [`max_partition_size_to_drop`](#max_partition_size_to_drop) (в байтах), вы не можете удалить раздел с помощью запроса [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart).
Для применения этой настройки не требуется перезапуск сервера ClickHouse. Другой способ отключить ограничение — создать файл `<clickhouse-path>/flags/force_drop_table`.

:::note
Значение `0` означает, что вы можете удалять разделы без каких-либо ограничений.

Это ограничение не распространяется на операции DROP TABLE и TRUNCATE TABLE, см. [max&#95;table&#95;size&#95;to&#95;drop](/operations/settings/settings#max_table_size_to_drop).
:::

**Пример**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```


## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />Количество потоков для одновременного удаления неактивных частей данных.

## max&#95;pending&#95;mutations&#95;execution&#95;time&#95;to&#95;warn {#max_pending_mutations_execution_time_to_warn}

<SettingsInfoBlock type="UInt64" default_value="86400" />

Если какая-либо из ожидающих выполнения мутаций превысит указанное значение в секундах, сервер ClickHouse добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```


## max&#95;pending&#95;mutations&#95;to&#95;warn {#max_pending_mutations_to_warn}

<SettingsInfoBlock type="UInt64" default_value="500" />

Если количество ожидающих выполнения мутаций превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```


## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество **простаивающих** потоков в пуле потоков десериализации префиксов превышает `max_prefixes_deserialization_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые простаивающими потоками, и уменьшит размер пула. При необходимости потоки могут быть созданы вновь.

## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse использует потоки из пула десериализации префиксов для параллельного чтения метаданных столбцов и подстолбцов из префиксов файлов в широких частях (Wide) в MergeTree. `max_prefixes_deserialization_thread_pool_size` ограничивает максимальное количество потоков в этом пуле.

## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость обмена данными по сети в байт в секунду для чтения.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость обмена данными по сети при записи, в байтах в секунду.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость обмена данными по сети в байтах в секунду для реплицированных операций fetch. Ноль означает отсутствие ограничений.

## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость обмена данными по сети в байтах в секунду для реплицированных отправок. Ноль означает отсутствие ограничений.

## max&#95;replicated&#95;table&#95;num&#95;to&#95;throw {#max_replicated_table_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество реплицированных таблиц больше этого значения, сервер сгенерирует исключение.

Считаются только таблицы для движков баз данных:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```


## max_server_memory_usage {#max_server_memory_usage} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объём памяти, который может использовать сервер, в байтах.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается настройкой `max_server_memory_usage_to_ram_ratio`.
:::

В качестве особого случая значение `0` (по умолчанию) означает, что сервер может использовать всю доступную память (за исключением дополнительных ограничений, накладываемых `max_server_memory_usage_to_ram_ratio`).

## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />

Максимальный объём памяти, который серверу разрешено использовать, выраженный как отношение к суммарному доступному объёму памяти.

Например, значение `0.9` (по умолчанию) означает, что сервер может использовать до 90% доступной памяти.

Позволяет снизить использование памяти на системах с небольшим объёмом ОЗУ.
На хостах с небольшим объёмом ОЗУ и пространства подкачки, возможно, потребуется установить [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) больше 1.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается настройкой `max_server_memory_usage`.
:::

## max&#95;session&#95;timeout {#max_session_timeout}

Максимальный тайм-аут сеанса (в секундах).

Пример:

```xml
<max_session_timeout>3600</max_session_timeout>
```


## max&#95;table&#95;num&#95;to&#95;throw {#max_table_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если число таблиц превышает это значение, сервер выбросит исключение.

Следующие таблицы не учитываются:

* view
* remote
* dictionary
* system

Считаются только таблицы для следующих движков баз данных:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```


## max&#95;table&#95;num&#95;to&#95;warn {#max_table_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="5000" />

Если количество подключённых таблиц превышает указанное значение, сервер ClickHouse запишет предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```


## max&#95;table&#95;size&#95;to&#95;drop {#max_table_size_to_drop}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

Ограничение на удаление таблиц.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает `max_table_size_to_drop` (в байтах), удалить её с помощью запроса [`DROP`](../../sql-reference/statements/drop.md) или [`TRUNCATE`](../../sql-reference/statements/truncate.md) нельзя.

:::note
Значение `0` означает, что вы можете удалять все таблицы без каких-либо ограничений.

Для применения этого параметра не требуется перезапуск сервера ClickHouse. Другой способ отключить ограничение — создать файл `<clickhouse-path>/flags/force_drop_table`.
:::

**Пример**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```


## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объем дискового пространства, который может быть использован для внешней агрегации, соединений (joins) или сортировки.
Запросы, превышающие это ограничение, приводят к возникновению исключения.

:::note
Значение `0` означает отсутствие ограничения.
:::

См. также:

- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

## max&#95;thread&#95;pool&#95;free&#95;size {#max_thread_pool_free_size}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если число **простаивающих** потоков в глобальном пуле потоков превышает [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size), ClickHouse освобождает ресурсы, занятые частью потоков, и размер пула уменьшается. При необходимости потоки могут быть созданы снова.

**Пример**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```


## max&#95;thread&#95;pool&#95;size {#max_thread_pool_size}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse использует потоки из глобального пула потоков для обработки запросов. Если в пуле нет свободного потока для обработки запроса, создаётся новый поток. `max_thread_pool_size` ограничивает максимальное количество потоков в пуле.

**Пример**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```


## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Количество потоков для загрузки неактивного набора неожиданных частей данных при запуске.

## max&#95;view&#95;num&#95;to&#95;throw {#max_view_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если число представлений превышает это значение, сервер генерирует исключение.

Считаются только таблицы баз данных со следующими движками:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```


## max&#95;view&#95;num&#95;to&#95;warn {#max_view_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Если количество подключённых представлений превышает указанное значение, сервер ClickHouse добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```


## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на общее количество одновременно ожидающих выполнения запросов.
Выполнение ожидающего запроса блокируется, пока требуемые таблицы загружаются асинхронно (см. [`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases)).

:::note
Ожидающие запросы не учитываются при проверке ограничений, задаваемых следующими настройками:

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

Это сделано для того, чтобы избежать достижения этих лимитов сразу после запуска сервера.
:::

:::note

Значение `0` (по умолчанию) означает отсутствие ограничения.

Эта настройка может быть изменена во время работы сервера и вступает в силу немедленно. Уже выполняющиеся запросы останутся без изменений.
:::

## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, должен ли фоновый рабочий поток памяти корректировать внутренний трекер памяти на основе сведений из внешних источников, например jemalloc и cgroups.

## memory_worker_period_ms {#memory_worker_period_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Период тика фонового процесса управления памятью, который корректирует значения счётчика использования памяти и очищает неиспользуемые страницы при повышенном потреблении памяти. Если установлено значение 0, будет использовано значение по умолчанию в зависимости от источника потребления памяти.

## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

<SettingsInfoBlock type="Bool" default_value="1" />Использовать данные об использовании памяти текущей cgroup для корректировки учета памяти.

## merge&#95;tree {#merge_tree}

Тонкая настройка таблиц на движке [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Для получения дополнительной информации см. заголовочный файл MergeTreeSettings.h.

**Пример**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```


## merge_workload {#merge_workload} 

<SettingsInfoBlock type="String" default_value="default" />

Используется для регулирования использования и распределения ресурсов между операциями слияния и другими рабочими нагрузками. Указанное значение применяется как значение настройки `workload` для всех фоновых слияний. Может быть переопределено настройкой движка MergeTree.

**См. также**

- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)

## merges&#95;mutations&#95;memory&#95;usage&#95;soft&#95;limit {#merges_mutations_memory_usage_soft_limit}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает ограничение на объем ОЗУ, который разрешено использовать для выполнения операций слияния и мутаций.
Если ClickHouse достигает установленного лимита, он не будет планировать новые фоновые операции слияния и мутаций, но продолжит выполнять уже запланированные задачи.

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```


## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />

Значение параметра `merges_mutations_memory_usage_soft_limit` по умолчанию рассчитывается как `memory_amount * merges_mutations_memory_usage_to_ram_ratio`.

**См. также:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)

## metric&#95;log {#metric_log}

По умолчанию он отключен.

**Включение**

Чтобы вручную включить сбор истории метрик [`system.metric_log`](../../operations/system-tables/metric_log.md), создайте файл `/etc/clickhouse-server/config.d/metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <metric_log>
        <database>system</database>
        <table>metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </metric_log>
</clickhouse>
```

**Отключение**

Чтобы отключить параметр `metric_log`, необходимо создать файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />

Минимальное значение отношения между временем ожидания CPU в ОС (метрика OSCPUWaitMicroseconds) и временем его занятости (метрика OSCPUVirtualTimeMicroseconds), при котором рассматривается возможность разрыва соединений. Для вычисления вероятности используется линейная интерполяция между минимальным и максимальным значениями этого отношения, при этом в этой точке вероятность равна 0.
Дополнительные сведения см. в разделе [Управление поведением при перегрузке CPU сервера](/operations/settings/server-overload).

## mlock&#95;executable {#mlock_executable}

Выполнить `mlockall` после запуска, чтобы снизить задержку первых запросов и предотвратить выгрузку из памяти исполняемого файла ClickHouse при высокой нагрузке на ввод-вывод.

:::note
Включение этой опции рекомендуется, но приведёт к увеличению времени запуска на несколько секунд.
Имейте в виду, что этот параметр не будет работать без capability &quot;CAP&#95;IPC&#95;LOCK&quot;.
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```


## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

Этот параметр позволяет избежать частых вызовов open/close (которые очень затратны из-за последующих промахов по страницам, page faults) и повторно использовать отображения из нескольких потоков и запросов. Значение параметра — это количество отображённых областей (обычно равно количеству отображённых файлов).

Объём данных в отображённых файлах можно отслеживать в следующих системных таблицах по следующим метрикам:

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells` в [`system.metrics`](/operations/system-tables/metrics), [`system.metric_log`](/operations/system-tables/metric_log)
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses` в [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)

:::note
Объём данных в отображённых файлах не расходует память напрямую и не учитывается в потреблении памяти запросом или сервером — поскольку эта память может быть отброшена аналогично кэшу страниц ОС. Кэш сбрасывается (файлы закрываются) автоматически при удалении старых частей в таблицах семейства MergeTree, также он может быть сброшен вручную запросом `SYSTEM DROP MMAP CACHE`.

Этот параметр можно изменять во время работы, и изменения вступят в силу немедленно.
:::

## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />

Используется для регулирования распределения и совместного использования ресурсов между мутациями и другими типами нагрузки. Указанное значение применяется как значение настройки `workload` для всех фоновых мутаций. Может быть переопределено настройкой MergeTree.

**См. также**

- [Планирование нагрузки](/operations/workload-scheduling.md)

## mysql&#95;port {#mysql_port}

Порт для взаимодействия с клиентами по протоколу MySQL.

:::note

* Положительные целые числа задают номер порта, который будет прослушиваться
* Пустые значения используются для отключения взаимодействия с клиентами по протоколу MySQL.
  :::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```


## mysql_require_secure_transport {#mysql_require_secure_transport} 

Если имеет значение `true`, для взаимодействия с клиентами по [mysql_port](#mysql_port) требуется защищённое соединение. Подключения с опцией `--ssl-mode=none` будут отклоняться. Используйте этот параметр вместе с настройками [OpenSSL](#openssl).

## openSSL {#openssl} 

Настройки клиента и сервера SSL.

Поддержка SSL обеспечивается библиотекой `libpoco`. Доступные параметры конфигурации описаны в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию приведены в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи параметров конфигурации сервера и клиента:

| Параметр                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Значение по умолчанию                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | Путь к файлу с закрытым ключом PEM-сертификата. Файл может одновременно содержать и ключ, и сертификат.                                                                                                                                                                                                                                                                                                                                                                                                              |                                                                                            |
| `certificateFile`             | Путь к файлу клиентского/серверного сертификата в формате PEM. Можно не указывать, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                            |
| `caConfig`                    | Путь к файлу или каталогу, содержащему доверенные сертификаты центров сертификации (CA). Если путь указывает на файл, он должен быть в формате PEM и может содержать несколько сертификатов CA. Если путь указывает на каталог, в нём должен быть один файл .pem на каждый сертификат CA. Имена файлов определяются по хеш‑значению имени субъекта CA. Подробности см. на man‑странице [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                                                                            |
| `verificationMode`            | Метод проверки сертификатов узла. Подробности см. в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                                                                                             | `relaxed`                                                                                  |
| `verificationDepth`           | Максимальная длина цепочки проверки. Проверка завершится с ошибкой, если длина цепочки сертификатов превысит заданное значение.                                                                                                                                                                                                                                                                                                                                                                                      | `9`                                                                                        |
| `loadDefaultCAFile`           | Будут ли использоваться встроенные CA-сертификаты для OpenSSL. ClickHouse предполагает, что встроенные CA-сертификаты находятся в файле `/etc/ssl/cert.pem` (соответственно, в каталоге `/etc/ssl/certs`) или в файле (соответственно, каталоге), указанном в переменной окружения `SSL_CERT_FILE` (соответственно, `SSL_CERT_DIR`).                                                                                                                                                                                 | `true`                                                                                     |
| `cipherList`                  | Поддерживаемые шифры OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | Включает или отключает кэширование сеансов. Необходимо использовать совместно с `sessionIdContext`. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                            | `false`                                                                                    |
| `sessionIdContext`            | Уникальная последовательность случайных символов, которую сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Указывать этот параметр настоятельно рекомендуется, поскольку он помогает избежать проблем как при кэшировании сеанса на стороне сервера, так и при запросе кэширования со стороны клиента.                                                                                                                                  | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | Максимальное количество сеансов, которые сервер кэширует. Значение `0` означает неограниченное число сеансов.                                                                                                                                                                                                                                                                                                                                                                                                        | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | Время хранения сеанса в кэше на сервере (в часах).                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                                                                        |
| `extendedVerification`        | Если параметр включён, убедитесь, что CN или SAN в сертификате совпадает с именем хоста удалённого узла.                                                                                                                                                                                                                                                                                                                                                                                                             | `false`                                                                                    |
| `requireTLSv1`                | Требовать соединение по TLSv1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                                                                    |
| `requireTLSv1_1`              | Требовать соединение по TLSv1.1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                               | `false`                                                                                    |
| `requireTLSv1_2`              | Требовать подключение по TLSv1.2. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                              | `false`                                                                                    |
| `fips`                        | Включает режим FIPS в OpenSSL. Поддерживается, если используемая версия библиотеки OpenSSL поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                                                                    |
| `privateKeyPassphraseHandler` | Класс (подкласс PrivateKeyPassphraseHandler), который запрашивает парольную фразу для доступа к закрытому ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                                                         | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | Класс (подкласс CertificateHandler) для обработки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`.                                                                                                                                                                                                                                                                                                                         | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | Протоколы, использование которых запрещено.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |                                                                                            |
| `preferServerCiphers`         | Серверные наборы шифров, предпочитаемые клиентом.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `false`                                                                                    |

**Пример конфигурации:**

```xml
<openSSL>
    <server>
        <!-- openssl req -subj "/CN=localhost" -new -newkey rsa:2048 -days 365 -nodes -x509 -keyout /etc/clickhouse-server/server.key -out /etc/clickhouse-server/server.crt -->
        <certificateFile>/etc/clickhouse-server/server.crt</certificateFile>
        <privateKeyFile>/etc/clickhouse-server/server.key</privateKeyFile>
        <!-- openssl dhparam -out /etc/clickhouse-server/dhparam.pem 4096 -->
        <dhParamsFile>/etc/clickhouse-server/dhparam.pem</dhParamsFile>
        <verificationMode>none</verificationMode>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
    </server>
    <client>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
        <!-- Для самоподписанных сертификатов: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- Для самоподписанных сертификатов: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```


## opentelemetry&#95;span&#95;log {#opentelemetry_span_log}

Параметры для системной таблицы [`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md).

<SystemLogParameters />

Пример:

```xml
<opentelemetry_span_log>
    <engine>
        engine MergeTree
        partition by toYYYYMM(finish_date)
        order by (finish_date, finish_time_us, trace_id)
    </engine>
    <database>system</database>
    <table>opentelemetry_span_log</table>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</opentelemetry_span_log>
```


## os_cpu_busy_time_threshold {#os_cpu_busy_time_threshold} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Порог занятого времени CPU операционной системы в микросекундах (метрика OSCPUVirtualTimeMicroseconds), при превышении которого считается, что CPU выполняет полезную работу; при значении занятого времени ниже этого порога перегрузка CPU не считается.

## os_threads_nice_value_distributed_cache_tcp_handler {#os_threads_nice_value_distributed_cache_tcp_handler} 

<SettingsInfoBlock type="Int32" default_value="0" />

Значение `nice` в Linux для потоков обработчика TCP распределённого кэша. Более низкие значения означают более высокий приоритет для CPU.

Требует привилегии CAP_SYS_NICE, в противном случае параметр игнорируется.

Возможные значения: от -20 до 19.

## os_threads_nice_value_merge_mutate {#os_threads_nice_value_merge_mutate} 

<SettingsInfoBlock type="Int32" default_value="0" />

Значение `nice` в Linux для потоков слияний и мутаций. Меньшие значения означают более высокий приоритет на CPU.

Требуется привилегия CAP_SYS_NICE, в противном случае параметр не имеет эффекта.

Возможные значения: от -20 до 19.

## os_threads_nice_value_zookeeper_client_send_receive {#os_threads_nice_value_zookeeper_client_send_receive} 

<SettingsInfoBlock type="Int32" default_value="0" />

Значение nice в Linux для потоков отправки и приёма в клиенте ZooKeeper. Более низкие значения означают более высокий приоритет на CPU.

Требуется capability CAP_SYS_NICE, в противном случае параметр не оказывает никакого эффекта.

Возможные значения: от -20 до 19.

## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

<SettingsInfoBlock type="Double" default_value="0.15" />Доля лимита памяти, которую следует держать свободной от кэша страниц в пространстве пользователя. Аналогично параметру Linux min_free_kbytes.

## page_cache_history_window_ms {#page_cache_history_window_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Задержка, по истечении которой освобождённая память может быть повторно использована кешем страниц пользовательского пространства.

## page_cache_max_size {#page_cache_max_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальный размер кэша страниц в пользовательском пространстве. Установите значение 0, чтобы отключить кэш. Если значение больше, чем page_cache_min_size, размер кэша будет постоянно подстраиваться в этом диапазоне, чтобы использовать большую часть доступной памяти, одновременно удерживая суммарное потребление памяти ниже ограничения (max_server_memory_usage[_to_ram_ratio]).

## page_cache_min_size {#page_cache_min_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />Минимальный размер кэша страниц в пользовательском пространстве.

## page_cache_policy {#page_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики пользовательского кэша страниц.

## page_cache_shards {#page_cache_shards} 

<SettingsInfoBlock type="UInt64" default_value="4" />Разделяет пользовательский кеш страниц Stripe в пространстве пользователя на заданное число шардов, чтобы снизить конкуренцию за мьютексы. Экспериментальная настройка, вряд ли приведёт к улучшению производительности.

## page_cache_size_ratio {#page_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди в кэше страниц в пространстве пользователя относительно общего размера кэша.

## part&#95;log {#part_log}

Ведение журнала событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md), например добавление или слияние данных. Журнал можно использовать для моделирования алгоритмов слияния и сравнения их характеристик. Также можно визуализировать процесс слияния.

Запросы записываются в таблицу [system.part&#95;log](/operations/system-tables/part_log), а не в отдельный файл. Имя этой таблицы можно настроить в параметре `table` (см. ниже).

<SystemLogParameters />

**Пример**

```xml
<part_log>
    <database>system</database>
    <table>part_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</part_log>
```


## parts_kill_delay_period {#parts_kill_delay_period} 

<SettingsInfoBlock type="UInt64" default_value="30" />

Период до полного удаления частей для SharedMergeTree. Параметр доступен только в ClickHouse Cloud.

## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />

Добавляет равномерно распределённое случайное значение от 0 до x секунд к `kill_delay_period`, чтобы избежать эффекта thundering herd и последующего DoS ZooKeeper в случае очень большого числа таблиц. Доступно только в ClickHouse Cloud.

## parts_killer_pool_size {#parts_killer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />

Потоки для очистки устаревших частей общего SharedMergeTree. Доступно только в ClickHouse Cloud

## path {#path}

Путь к каталогу, содержащему данные.

:::note
Обязателен завершающий слэш.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```


## postgresql&#95;port {#postgresql_port}

Порт для взаимодействия с клиентами по протоколу PostgreSQL.

:::note

* Положительные целые числа указывают номер порта, который будет прослушиваться.
* Пустые значения используются для отключения взаимодействия с клиентами по протоколу PostgreSQL.
  :::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```


## postgresql_require_secure_transport {#postgresql_require_secure_transport} 

Если установлено значение true, при работе с клиентами по [postgresql_port](#postgresql_port) требуется защищённое соединение. Подключения с параметром `sslmode=disable` будут отклонены. Используйте этот параметр совместно с настройками [OpenSSL](#openssl).

## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />Размер фонового пула для операций предварительной выборки данных из удалённых объектных хранилищ

## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно поставить в очередь пула предварительной выборки

## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество задач, которые могут быть поставлены в очередь пула потоков десериализации префиксов.

:::note
Значение `0` означает отсутствие ограничения.
:::

## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр имеет значение true, ClickHouse создаёт все настроенные таблицы `system.*_log` до запуска. Это может быть полезно, если некоторые скрипты инициализации зависят от этих таблиц.

## primary_index_cache_policy {#primary_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования первичного индекса.

## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />Доля общего размера кэша меток, заполняемая во время предварительного прогрева.

## primary_index_cache_size {#primary_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />Максимальный размер кэша для первичного индекса (индекса таблиц семейства MergeTree).

## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае использования политики SLRU) в кэше первичного индекса относительно общего размера кэша.

## process&#95;query&#95;plan&#95;packet {#process_query_plan_packet}

<SettingsInfoBlock type="Bool" default_value="0" />

Эта настройка позволяет читать пакет QueryPlan. Этот пакет отправляется при выполнении распределённых запросов, когда включён параметр serialize&#95;query&#95;plan.
По умолчанию настройка отключена, чтобы избежать потенциальных проблем с безопасностью, которые могут быть вызваны ошибками при бинарной десериализации плана запроса.

**Пример**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```


## processors&#95;profile&#95;log {#processors_profile_log}

Настройки системной таблицы [`processors_profile_log`](../system-tables/processors_profile_log.md).

<SystemLogParameters />

Значения по умолчанию:

```xml
<processors_profile_log>
    <database>system</database>
    <table>processors_profile_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</processors_profile_log>
```


## prometheus {#prometheus}

Публикация данных метрик для сбора с помощью [Prometheus](https://prometheus.io).

Настройки:

* `endpoint` – HTTP-эндпоинт для сбора метрик сервером Prometheus. Должен начинаться с &#39;/&#39;.
* `port` – Порт для `endpoint`.
* `metrics` – Экспортировать метрики из таблицы [system.metrics](/operations/system-tables/metrics).
* `events` – Экспортировать метрики из таблицы [system.events](/operations/system-tables/events).
* `asynchronous_metrics` – Экспортировать текущие значения метрик из таблицы [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics).
* `errors` - Экспортировать число ошибок по кодам, произошедших с момента последнего перезапуска сервера. Эти данные также можно получить из таблицы [system.errors](/operations/system-tables/errors).

**Пример**

```xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <!-- highlight-start -->
    <prometheus>
        <endpoint>/metrics</endpoint>
        <port>9363</port>
        <metrics>true</metrics>
        <events>true</events>
        <asynchronous_metrics>true</asynchronous_metrics>
        <errors>true</errors>
    </prometheus>
    <!-- highlight-end -->
</clickhouse>
```

Проверьте (замените `127.0.0.1` на IP-адрес или имя хоста вашего сервера ClickHouse):

```bash
curl 127.0.0.1:9363/metrics
```


## proxy {#proxy}

Задайте прокси-серверы для HTTP- и HTTPS-запросов, которые в настоящее время поддерживаются хранилищем S3, табличными функциями S3 и функциями URL.

Существует три способа задать прокси-серверы:

* переменные окружения
* списки прокси
* удалённые резолверы прокси.

Обход прокси-серверов для отдельных хостов также поддерживается с использованием `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать
прокси-сервер для заданного протокола. Если они настроены в вашей системе, всё должно работать без дополнительной настройки.

Это самый простой подход, если для данного протокола используется
только один прокси-сервер и этот прокси-сервер не меняется.

**Списки прокси**

Этот подход позволяет указать один или несколько
прокси-серверов для протокола. Если определено более одного прокси-сервера,
ClickHouse использует разные прокси по кругу (round-robin), распределяя
нагрузку между серверами. Это самый простой подход, если для протокола
используется несколько прокси-серверов и список прокси-серверов не меняется.

**Шаблон конфигурации**

```xml
<proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```

Выберите родительское поле на вкладках ниже, чтобы просмотреть его дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Поле      | Описание                                  |
    | --------- | ----------------------------------------- |
    | `<http>`  | Список одного или нескольких HTTP-прокси  |
    | `<https>` | Список одного или нескольких HTTPS-прокси |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | Поле    | Описание           |
    | ------- | ------------------ |
    | `<uri>` | URI прокси-сервера |
  </TabItem>
</Tabs>

**Удалённые резолверы прокси**

Прокси-серверы могут динамически меняться. В этом случае можно задать endpoint резолвера. ClickHouse отправляет пустой GET-запрос на этот endpoint, удалённый резолвер должен вернуть хост прокси. ClickHouse использует его для формирования URI прокси по следующему шаблону: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

**Шаблон конфигурации**

```xml
<proxy>
    <http>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>80</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </http>

    <https>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>3128</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </https>

</proxy>
```

Выберите родительское поле на вкладках ниже, чтобы просмотреть его дочерние поля:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Field     | Description                                 |
    | --------- | ------------------------------------------- |
    | `<http>`  | Список из одного или нескольких резолверов* |
    | `<https>` | Список из одного или нескольких резолверов* |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | Field        | Description                                |
    | ------------ | ------------------------------------------ |
    | `<resolver>` | Конечная точка и другие сведения резолвера |

    :::note
    Можно использовать несколько элементов `<resolver>`, но только первый
    `<resolver>` для заданного протокола используется. Все остальные элементы `<resolver>`
    для этого протокола игнорируются. Это означает, что балансировку нагрузки
    (если она необходима) должен реализовывать удалённый резолвер.
    :::
  </TabItem>

  <TabItem value="resolver" label="<resolver>">
    | Field                | Description                                                                                                                                                                                                        |
    | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
    | `<endpoint>`         | URI прокси-резолвера                                                                                                                                                                                               |
    | `<proxy_scheme>`     | Протокол итогового URI прокси. Может быть либо `http`, либо `https`.                                                                                                                                               |
    | `<proxy_port>`       | Номер порта прокси-резолвера                                                                                                                                                                                       |
    | `<proxy_cache_time>` | Время в секундах, в течение которого значения, полученные от резолвера, должны кэшироваться в ClickHouse. Установка значения `0` заставляет ClickHouse обращаться к резолверу для каждого HTTP- или HTTPS-запроса. |
  </TabItem>
</Tabs>

**Приоритет**

Параметры прокси определяются в следующем порядке:

| Order | Setting                    |
| ----- | -------------------------- |
| 1.    | Удалённые прокси-резолверы |
| 2.    | Списки прокси              |
| 3.    | Переменные окружения       |


ClickHouse будет проверять резолвер с наивысшим приоритетом для протокола запроса. Если он не задан,
будет проверен следующий по приоритету тип резолвера, пока ClickHouse не дойдёт до резолвера окружения.
Это также позволяет комбинировать разные типы резолверов.

## query&#95;cache {#query_cache}

Конфигурация [кэша запросов](../query-cache.md).

Доступны следующие настройки:

| Setting                   | Description                                                                                                     | Default Value |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------- |
| `max_size_in_bytes`       | Максимальный размер кэша в байтах. Значение `0` означает, что кэш запросов отключён.                            | `1073741824`  |
| `max_entries`             | Максимальное количество результатов запросов `SELECT`, сохраняемых в кэше.                                      | `1024`        |
| `max_entry_size_in_bytes` | Максимальный размер в байтах, который могут иметь результаты запросов `SELECT`, чтобы быть сохранёнными в кэше. | `1048576`     |
| `max_entry_size_in_rows`  | Максимальное количество строк в результатах запросов `SELECT`, которые могут быть сохранены в кэше.             | `30000000`    |

:::note

* Изменённые настройки вступают в силу немедленно.
* Данные для кэша запросов выделяются в DRAM. Если память ограничена, задайте небольшое значение `max_size_in_bytes` или полностью отключите кэш запросов.
  :::

**Пример**

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```


## query_condition_cache_policy {#query_condition_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кеширования условий запроса.

## query_condition_cache_size {#query_condition_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />

Максимальный размер кэша условий запроса.
:::note
Этот параметр можно изменять во время работы, и изменения вступают в силу немедленно.
:::

## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (при использовании политики SLRU) в кэше условий запроса по отношению к общему размеру кэша.

## query&#95;log {#query_log}

Настройка для ведения журнала запросов при установленной настройке [log&#95;queries=1](../../operations/settings/settings.md).

Запросы записываются в таблицу [system.query&#95;log](/operations/system-tables/query_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters />

Если таблица отсутствует, ClickHouse создаст её. Если структура журнала запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет создана автоматически.

**Пример**

```xml
<query_log>
    <database>system</database>
    <table>query_log</table>
    <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_log>
```


## query&#95;masking&#95;rules {#query_masking_rules}

Правила на основе регулярных выражений, которые будут применяться к запросам, а также ко всем записям журналов перед их сохранением в журналы сервера,
таблицы [`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes), а также в журналы, отправляемые клиенту. Это позволяет предотвратить утечку конфиденциальных данных из SQL‑запросов, таких как имена, адреса электронной почты, персональные идентификаторы или номера кредитных карт, в журналы.

**Пример**

```xml
<query_masking_rules>
    <rule>
        <name>скрыть номер SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**Поля конфигурации**:

| Setting   | Description                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| `name`    | имя правила (необязательно)                                                                                 |
| `regexp`  | регулярное выражение, совместимое с RE2 (обязательно)                                                       |
| `replace` | строка подстановки для маскирования конфиденциальных данных (необязательно, по умолчанию — шесть звёздочек) |

Правила маскирования применяются ко всему запросу (чтобы предотвратить утечки конфиденциальных данных из некорректных / неподдающихся разбору запросов).

В таблице [`system.events`](/operations/system-tables/events) есть счётчик `QueryMaskingRulesMatch`, который содержит общее количество срабатываний правил маскирования запросов.

Для распределённых запросов каждый сервер должен быть настроен отдельно, иначе подзапросы, передаваемые на другие узлы, будут сохраняться без маскирования.


## query&#95;metric&#95;log {#query_metric_log}

По умолчанию он отключен.

**Включение**

Чтобы вручную включить сбор истории метрик [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md), создайте файл `/etc/clickhouse-server/config.d/query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log>
        <database>system</database>
        <table>query_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </query_metric_log>
</clickhouse>
```

**Отключение**

Чтобы отключить параметр `query_metric_log`, необходимо создать файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## query&#95;thread&#95;log {#query_thread_log}

Настройка для логирования потоков запросов, включаемая параметром [log&#95;query&#95;threads=1](/operations/settings/settings#log_query_threads).

Запросы логируются в таблицу [system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log), а не в отдельный файл. Вы можете изменить имя таблицы с помощью параметра `table` (см. ниже).

<SystemLogParameters />

Если таблица отсутствует, ClickHouse создаст её. Если структура журнала потоков запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, а новая таблица будет создана автоматически.

**Пример**

```xml
<query_thread_log>
    <database>system</database>
    <table>query_thread_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_thread_log>
```


## query&#95;views&#95;log {#query_views_log}

Настройка логирования представлений (live, materialized и т. п.) в зависимости от запросов, при условии, что включена настройка [log&#95;query&#95;views=1](/operations/settings/settings#log_query_views).

Запросы логируются в таблицу [system.query&#95;views&#95;log](/operations/system-tables/query_views_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура лога представлений запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет создана автоматически.

**Пример**

```xml
<query_views_log>
    <database>system</database>
    <table>query_views_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_views_log>
```


## remap&#95;executable {#remap_executable}

Параметр для перераспределения памяти под машинный код (&quot;text&quot;) с использованием больших страниц памяти.

:::note
Эта возможность является крайне экспериментальной.
:::

Пример:

```xml
<remap_executable>false</remap_executable>
```


## remote&#95;servers {#remote_servers}

Конфигурация кластеров, используемых движком таблиц [Distributed](../../engines/table-engines/special/distributed.md) и табличной функцией `cluster`.

**Пример**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

Информацию о значении атрибута `incl` см. в разделе «[Файлы конфигурации](/operations/configuration-files)».

**См. также**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [Cluster Discovery](../../operations/cluster-discovery.md)
* [Replicated database engine](../../engines/database-engines/replicated.md)


## remote&#95;url&#95;allow&#95;hosts {#remote_url_allow_hosts}

Список хостов, которые разрешено использовать в движках хранения и табличных функциях, работающих с URL.

При добавлении хоста с xml-тегом `\<host\>`:

* он должен быть указан в точности как в URL, так как имя проверяется до DNS‑резолвинга. Например: `<host>clickhouse.com</host>`
* если порт явно указан в URL, то пара host:port проверяется целиком. Например: `<host>clickhouse.com:80</host>`
* если хост указан без порта, то разрешён любой порт этого хоста. Например: если указан `<host>clickhouse.com</host>`, тогда `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т. д. разрешены.
* если хост указан как IP‑адрес, то он проверяется так же, как указан в URL. Например: `[2a02:6b8:a::a]`.
* если есть редиректы и поддержка редиректов включена, то каждый редирект (поле Location) проверяется.

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


## replica&#95;group&#95;name {#replica_group_name}

Имя группы реплик для базы данных Replicated.

Кластер, созданный базой данных Replicated, будет состоять из реплик одной группы.
DDL-запросы будут ожидать только реплики из той же группы.

По умолчанию — пустое значение.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```


## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />Таймаут HTTP-подключения для запросов на выборку частей. Наследуется из профиля по умолчанию `http_connection_timeout`, если не задан явно.

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />Таймаут ожидания HTTP-ответа для запросов на получение частей. Наследуется из профиля по умолчанию `http_receive_timeout`, если не задан явно.

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />Тайм-аут отправки HTTP при запросах на получение частей. Наследуется из профиля по умолчанию `http_send_timeout`, если не указан явно.

## replicated&#95;merge&#95;tree {#replicated_merge_tree}

Тонкая настройка для таблиц в [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Этот параметр имеет более высокий приоритет.

Для получения дополнительной информации см. заголовочный файл MergeTreeSettings.h.

**Пример**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```


## restore_threads {#restore_threads} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />Максимальное количество потоков для выполнения запросов RESTORE.

## s3_credentials_provider_max_cache_size {#s3_credentials_provider_max_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />Максимальное количество провайдеров учетных данных для S3, которые могут быть сохранены в кэше

## s3_max_redirects {#s3_max_redirects} 

<SettingsInfoBlock type="UInt64" default_value="10" />Максимальное допустимое количество перенаправлений S3.

## s3_retry_attempts {#s3_retry_attempts} 

<SettingsInfoBlock type="UInt64" default_value="500" />Настройка для Aws::Client::RetryStrategy, Aws::Client выполняет повторы запросов самостоятельно, 0 означает отсутствие повторов

## s3queue_disable_streaming {#s3queue_disable_streaming} 

<SettingsInfoBlock type="Bool" default_value="0" />Отключает стриминг в S3Queue, даже если таблица создана и к ней подключены материализованные представления

## s3queue&#95;log {#s3queue_log}

Настройки системной таблицы `s3queue_log`.

<SystemLogParameters />

Настройки по умолчанию:

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```


## send&#95;crash&#95;reports {#send_crash_reports}

Настройки отправки отчётов о сбоях команде разработчиков ядра ClickHouse.

Включение этой функции, особенно в предпроизводственных средах, крайне приветствуется.

Ключи:

| Key                   | Description                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`             | Логический флаг для включения функции, по умолчанию — `true`. Установите `false`, чтобы не отправлять отчёты о сбоях.                            |
| `send_logical_errors` | `LOGICAL_ERROR` подобна `assert`: это ошибка (bug) в ClickHouse. Этот логический флаг включает отправку таких исключений (по умолчанию: `true`). |
| `endpoint`            | Можно переопределить URL конечной точки для отправки отчётов о сбоях.                                                                            |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


## series_keeper_path {#series_keeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />

Путь в Keeper, под которым с помощью функции `generateSerialID` создаются узлы с автоинкрементными номерами. Каждая серия будет отдельным узлом по этому пути.

## show_addresses_in_stack_traces {#show_addresses_in_stack_traces} 

<SettingsInfoBlock type="Bool" default_value="1" />Если имеет значение true, в трассировках стека будут отображаться адреса

## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores} 

<SettingsInfoBlock type="Bool" default_value="1" />Если установлено в true, ClickHouse будет ожидать завершения выполняющихся операций резервного копирования и восстановления перед завершением работы.

## shutdown_wait_unfinished {#shutdown_wait_unfinished} 

<SettingsInfoBlock type="UInt64" default_value="5" />Время ожидания незавершённых запросов в секундах

## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />Если параметр установлен в значение true, ClickHouse будет ожидать завершения выполняющихся запросов перед завершением работы.

## skip_binary_checksum_checks {#skip_binary_checksum_checks} 

<SettingsInfoBlock type="Bool" default_value="0" />Пропускает проверки целостности бинарного файла ClickHouse по контрольной сумме

## ssh&#95;server {#ssh_server}

Публичная часть ключа хоста будет записана в файл known&#95;hosts
на стороне SSH-клиента при первом подключении.

Параметры ключей хоста по умолчанию отключены.
Раскомментируйте параметры ключей хоста и укажите путь к соответствующему ssh-ключу, чтобы включить их:

Пример:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```


## startup_mv_delay_ms {#startup_mv_delay_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />Отладочный параметр для эмуляции задержки при создании материализованного представления

## storage&#95;configuration {#storage_configuration}

Позволяет задать многодисковую конфигурацию хранилища.

Конфигурация хранилища имеет следующую структуру:

```xml
<storage_configuration>
    <disks>
        <!-- конфигурация -->
    </disks>
    <policies>
        <!-- конфигурация -->
    </policies>
</storage_configuration>
```


### Конфигурация дисков {#configuration-of-disks}

Конфигурация параметра `disks` имеет следующую структуру:

```xml
<storage_configuration>
    <disks>
        <disk_name_1>
            <path>/mnt/fast_ssd/clickhouse/</path>
        </disk_name_1>
        <disk_name_2>
            <path>/mnt/hdd1/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_2>
        <disk_name_3>
            <path>/mnt/hdd2/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_3>
        ...
    </disks>
</storage_configuration>
```

Подтеги, приведённые выше, определяют следующие настройки для `disks`:

| Параметр                | Описание                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `<disk_name_N>`         | Имя диска, которое должно быть уникальным.                                                                       |
| `path`                  | Путь, по которому будут храниться данные сервера (каталоги `data` и `shadow`). Должен заканчиваться символом `/` |
| `keep_free_space_bytes` | Размер зарезервированного свободного места на диске.                                                             |

:::note
Порядок дисков не имеет значения.
:::


### Конфигурация политик {#configuration-of-policies}

Подтеги выше задают следующие настройки для `policies`:

| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `volume_name_N`              | Имя тома. Имена томов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `disk`                       | Диск, находящийся внутри тома.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `max_data_part_size_bytes`   | Максимальный размер части данных, которая может размещаться на любом из дисков в этом томе. Если в результате слияния ожидается, что размер части будет больше `max_data_part_size_bytes`, она будет записана в следующий том. По сути, эта возможность позволяет хранить новые / небольшие части данных на «горячем» томе (SSD) и перемещать их на «холодный» том (HDD), когда они достигают большого размера. Не используйте эту опцию, если в политике только один том.                              |
| `move_factor`                | Доля доступного свободного пространства на томе. Если свободного места становится меньше, данные начинают переноситься на следующий том, если он есть. Для переноса части данных сортируются по размеру от большего к меньшему (по убыванию), и выбираются части, суммарный размер которых достаточен для выполнения условия `move_factor`; если суммарный размер всех частей недостаточен, будут перенесены все части.                                                                            |
| `perform_ttl_move_on_insert` | Отключает перемещение данных с истекшим TTL при вставке. По умолчанию (если включено), если мы вставляем данные, срок жизни которых уже истёк в соответствии с правилом перемещения по времени жизни, они немедленно перемещаются в том / на диск, указанный в правиле перемещения. Это может существенно замедлить вставку, если целевой том / диск медленный (например, S3). Если опция отключена, просроченная часть данных записывается в том по умолчанию, а затем сразу перемещается в том, указанный в правиле для истекшего TTL. |
| `load_balancing`             | Политика балансировки по дискам: `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `least_used_ttl_ms`          | Устанавливает тайм-аут (в миллисекундах) для обновления доступного пространства на всех дисках (`0` — всегда обновлять, `-1` — никогда не обновлять, значение по умолчанию — `60000`). Обратите внимание: если диск используется только ClickHouse и не будет подлежать динамическому изменению размера файловой системы «на лету», можно использовать значение `-1`. Во всех остальных случаях это не рекомендуется, так как в итоге приведёт к некорректному распределению пространства.                             |
| `prefer_not_to_merge`        | Отключает слияние частей данных на этом томе. Примечание: это потенциально вредно и может приводить к замедлению работы. Когда этот параметр включён (не делайте так), слияние данных на этом томе запрещено (что плохо). Это позволяет контролировать то, как ClickHouse взаимодействует с медленными дисками. Мы рекомендуем вообще не использовать этот параметр.                                                                                                                                                |
| `volume_priority`            | Определяет приоритет (порядок), в котором заполняются тома. Чем меньше значение, тем выше приоритет. Значения параметра должны быть натуральными числами и непрерывно покрывать диапазон от 1 до N (где N — наибольшее указанное значение параметра) без пропусков.                                                                                                                                                                                                                                             |

Для `volume_priority`:

- Если у всех томов задан этот параметр, они получают приоритет в указанном порядке.
- Если параметр задан только у _части_ томов, тома без него имеют наименьший приоритет. Тома, у которых он задан, упорядочиваются по значению параметра, приоритет остальных определяется порядком их описания в конфигурационном файле относительно друг друга.
- Если _ни у одного_ тома не задан этот параметр, их порядок определяется порядком описания в конфигурационном файле.
- Приоритеты томов могут различаться.

## storage_connections_soft_limit {#storage_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />Подключения сверх этого лимита имеют значительно меньшее время жизни. Лимит применяется к подключениям к хранилищам.

## storage_connections_store_limit {#storage_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />Соединения, превышающие этот лимит, сбрасываются после использования. Установите значение 0, чтобы отключить кэширование соединений. Лимит применяется к соединениям хранилищ.

## storage_connections_warn_limit {#storage_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Предупреждающие сообщения записываются в журналы, если число активных соединений превышает этот лимит. Лимит применяется к соединениям хранилищ.

## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

<SettingsInfoBlock type="Bool" default_value="1" />Записывать файлы метаданных диска в формате VERSION_FULL_OBJECT_KEY. Включено по умолчанию. Этот параметр устарел.

## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

<SettingsInfoBlock type="Bool" default_value="1" />Если параметр включён, при создании SharedSet и SharedJoin генерируется внутренний UUID. Только в ClickHouse Cloud.

## table_engines_require_grant {#table_engines_require_grant} 

Если установлено в значение true, пользователям требуется привилегия для создания таблицы с определённым движком, например: `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию, для обеспечения обратной совместимости, при создании таблицы с определённым движком таблицы привилегия игнорируется, однако вы можете изменить это поведение, установив данный параметр в true.
:::

## tables_loader_background_pool_size {#tables_loader_background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Задает количество потоков в фоновом пуле, выполняющих асинхронные задачи загрузки. Фоновый пул используется для асинхронной загрузки таблиц после запуска сервера, если нет запросов, ожидающих эту таблицу. При большом количестве таблиц может быть полезно использовать небольшое количество потоков в фоновом пуле. Это позволит зарезервировать CPU-ресурсы для параллельного выполнения запросов.

:::note
Значение `0` означает, что будут использованы все доступные CPU.
:::

## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Задает количество потоков, выполняющих задания загрузки в пуле foreground. Пул foreground используется для синхронной загрузки таблиц до того, как сервер начнет прослушивать порт, а также для загрузки таблиц, загрузки которых ожидают. Пул foreground имеет более высокий приоритет, чем пул background. Это означает, что ни одно задание не будет запущено в пуле background, пока в пуле foreground выполняются задания.

:::note
Значение `0` означает, что будут использованы все доступные CPU.
:::

## tcp_close_connection_after_queries_num {#tcp_close_connection_after_queries_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальное количество запросов, разрешённых для одного TCP‑соединения, после чего оно закрывается. Установите значение 0 для неограниченного числа запросов.

## tcp_close_connection_after_queries_seconds {#tcp_close_connection_after_queries_seconds} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальное время жизни TCP-соединения в секундах до его закрытия. Установите 0 для неограниченного времени жизни соединения.

## tcp&#95;port {#tcp_port}

Порт для взаимодействия с клиентами по протоколу TCP.

**Пример**

```xml
<tcp_port>9000</tcp_port>
```


## tcp&#95;port&#95;secure {#tcp_port_secure}

TCP-порт для защищённого соединения с клиентами. Используйте его совместно с настройками [OpenSSL](#openssl).

**Значение по умолчанию**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```


## tcp&#95;ssh&#95;port {#tcp_ssh_port}

Порт SSH-сервера, который позволяет пользователю подключаться и выполнять запросы в интерактивном режиме, используя встроенный клиент через PTY.

Пример:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


## temporary&#95;data&#95;in&#95;cache {#temporary_data_in_cache}

При включении этой опции временные данные будут сохраняться в кэше для конкретного диска.
В этом разделе следует указать имя диска с типом `cache`.
В этом случае кэш и временные данные будут использовать одно и то же пространство, и кэш диска может быть очищен для размещения временных данных.

:::note
Для настройки хранения временных данных может использоваться только один параметр конфигурации: `tmp_path`, `tmp_policy` или `temporary_data_in_cache`.
:::

**Пример**

И кэш для `local_disk`, и временные данные будут храниться в `/tiny_local_cache` в файловой системе, управляемой `tiny_local_cache`.

```xml
<clickhouse>
<storage_configuration>
<disks>
<local_disk>
<type>local</type>
<path>/local_disk/</path>
</local_disk>

<!-- highlight-start -->
<tiny_local_cache>
<type>cache</type>
<disk>local_disk</disk>
<path>/tiny_local_cache/</path>
<max_size_rows>10M</max_size_rows>
<max_file_segment_size>1M</max_file_segment_size>
<cache_on_write_operations>1</cache_on_write_operations>
</tiny_local_cache>
<!-- highlight-end -->
</disks>
</storage_configuration>

<!-- highlight-start -->
<temporary_data_in_cache>tiny_local_cache</temporary_data_in_cache>
<!-- highlight-end -->
</clickhouse>
```


## temporary_data_in_distributed_cache {#temporary_data_in_distributed_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />Хранить временные данные в распределённом кэше.

## text_index_dictionary_block_cache_max_entries {#text_index_dictionary_block_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Размер кэша для блока словаря текстового индекса, задаваемый в количестве записей. Нулевое значение означает, что кэш отключен.

## text_index_dictionary_block_cache_policy {#text_index_dictionary_block_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики кэширования блоков словаря текстового индекса.

## text_index_dictionary_block_cache_size {#text_index_dictionary_block_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Размер кэша для блоков словаря текстового индекса. Нулевое значение отключает кэш.

:::note
Этот параметр можно изменить во время работы, и изменение вступит в силу немедленно.
:::

## text_index_dictionary_block_cache_size_ratio {#text_index_dictionary_block_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае политики SLRU) в кэше блоков словаря текстового индекса относительно общего размера кэша.

## text_index_header_cache_max_entries {#text_index_header_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="100000" />Размер кэша заголовков текстового индекса (в записях). Значение 0 отключает кэш.

## text_index_header_cache_policy {#text_index_header_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования заголовков текстового индекса.

## text_index_header_cache_size {#text_index_header_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Размер кэша заголовков текстового индекса. Ноль означает, что кэш отключён.

:::note
Этот параметр можно изменять во время работы, и изменения вступают в силу немедленно.
:::

## text_index_header_cache_size_ratio {#text_index_header_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае политики SLRU) в кэше заголовков текстового индекса относительно общего размера этого кэша.

## text_index_postings_cache_max_entries {#text_index_postings_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Размер кэша списка вхождений текстового индекса (в элементах). Ноль означает отключение.

## text_index_postings_cache_policy {#text_index_postings_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики кэша списков вхождений текстового индекса.

## text_index_postings_cache_size {#text_index_postings_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="2147483648" />Размер кэша для списков вхождений текстового индекса. Нулевое значение отключает кэш.

:::note
Этот параметр может быть изменён во время работы и вступает в силу немедленно.
:::

## text_index_postings_cache_size_ratio {#text_index_postings_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше списков вхождений текстового индекса относительно общего размера этого кэша.

## text&#95;log {#text_log}

Настройки системной таблицы [text&#95;log](/operations/system-tables/text_log), используемой для логирования текстовых сообщений.

<SystemLogParameters />

Дополнительно:

| Настройка | Описание                                                                                    | Значение по умолчанию |
| --------- | ------------------------------------------------------------------------------------------- | --------------------- |
| `level`   | Максимальный уровень сообщений (по умолчанию `Trace`), которые будут сохраняться в таблице. | `Trace`               |

**Пример**

```xml
<clickhouse>
    <text_log>
        <level>notice</level>
        <database>system</database>
        <table>text_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <partition_by>event_date</partition_by> -->
        <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    </text_log>
</clickhouse>
```


## thread&#95;pool&#95;queue&#95;size {#thread_pool_queue_size}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество заданий, которые могут быть поставлены в очередь в глобальный пул потоков. Увеличение размера очереди приводит к увеличению использования памяти. Рекомендуется устанавливать это значение равным [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size).

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```


## threadpool_local_fs_reader_pool_size {#threadpool_local_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />Количество потоков в пуле для чтения из локальной файловой системы при `local_filesystem_read_method = 'pread_threadpool'`.

## threadpool_local_fs_reader_queue_size {#threadpool_local_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Максимальное количество заданий, которые могут быть поставлены в пул потоков для чтения с локальной файловой системы.

## threadpool_remote_fs_reader_pool_size {#threadpool_remote_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" />Количество потоков в пуле потоков, используемом для чтения из удалённой файловой системы, когда `remote_filesystem_read_method = 'threadpool'`.

## threadpool_remote_fs_reader_queue_size {#threadpool_remote_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Максимальное количество заданий, которые могут быть поставлены в очередь пула потоков для чтения из удалённой файловой системы.

## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />Размер фонового пула потоков для запросов на запись в объектные хранилища

## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно поставить в очередь фонового пула для операций записи в объектные хранилища

## throw&#95;on&#95;unknown&#95;workload {#throw_on_unknown_workload}

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет поведение при обращении к неизвестной WORKLOAD при установленном параметре запроса &#39;workload&#39;.

* Если `true`, запрос, пытающийся получить доступ к неизвестной WORKLOAD, завершится с исключением RESOURCE&#95;ACCESS&#95;DENIED. Полезно для принудительного применения планирования ресурсов для всех запросов после того, как иерархия WORKLOAD настроена и содержит WORKLOAD default.
* Если `false` (значение по умолчанию), запросу с параметром &#39;workload&#39;, указывающим на неизвестную WORKLOAD, предоставляется неограниченный доступ без планирования ресурсов. Это важно на этапе настройки иерархии WORKLOAD, до добавления WORKLOAD default.

**Пример**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**См. также**

* [Планирование рабочих нагрузок](/operations/workload-scheduling.md)


## timezone {#timezone}

Часовой пояс сервера.

Указывается как идентификатор IANA для часового пояса UTC или географического региона (например, Africa/Abidjan).

Часовой пояс необходим для преобразования между форматами String и DateTime при выводе полей типа DateTime в текстовый формат (на экран или в файл), а также при получении значения типа DateTime из строки. Кроме того, часовой пояс используется в функциях, работающих с датой и временем, если они не получили часовой пояс во входных параметрах.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**См. также**

* [session&#95;timezone](../settings/settings.md#session_timezone)


## tmp&#95;path {#tmp_path}

Путь в локальной файловой системе для хранения временных данных при обработке больших запросов.

:::note

* Для настройки хранения временных данных можно использовать только один из параметров: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
* Обязателен слэш в конце пути.
  :::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## tmp&#95;policy {#tmp_policy}

Политика для хранилища временных данных. Все файлы с префиксом `tmp` будут удалены при запуске.

:::note
Рекомендации по использованию объектного хранилища в качестве `tmp_policy`:

* Используйте отдельный `bucket:path` на каждом сервере
* Используйте `metadata_type=plain`
* При необходимости задайте TTL для этого bucket
  :::

:::note

* Для настройки хранилища временных данных можно использовать только один параметр: `tmp_path`, `tmp_policy` или `temporary_data_in_cache`.
* Параметры `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes` игнорируются.
* Политика должна содержать ровно *один том*.

Дополнительные сведения см. в документации [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree).
:::

**Пример**

Когда `/disk1` заполнен, временные данные будут записываться на `/disk2`.

```xml
<clickhouse>
<storage_configuration>
<disks>
<disk1>
<path>/disk1/</path>
</disk1>
<disk2>
<path>/disk2/</path>
</disk2>
</disks>

<policies>
<!-- highlight-start -->
<tmp_two_disks>
<volumes>
<main>
<disk>disk1</disk>
<disk>disk2</disk>
</main>
</volumes>
</tmp_two_disks>
<!-- highlight-end -->
</policies>
</storage_configuration>

<!-- highlight-start -->
<tmp_policy>tmp_two_disks</tmp_policy>
<!-- highlight-end -->
</clickhouse>
```


## top&#95;level&#95;domains&#95;list {#top_level_domains_list}

Определяет список пользовательских доменов верхнего уровня для добавления, где каждая запись имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/путь/к/файлу/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

См. также:

* функцию [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) и её вариации,
  которая принимает имя пользовательского списка TLD и возвращает часть домена, включающую поддомены верхнего уровня вплоть до первого значимого поддомена.


## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Собирать случайные выделения памяти размером меньше или равным указанному значению с вероятностью, равной `total_memory_profiler_sample_probability`. 0 — отключено. Возможно, вам потребуется установить `max_untracked_memory` в 0, чтобы этот порог работал ожидаемым образом.

## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Собирает случайные выделения памяти размером не меньше указанного значения с вероятностью, равной `total_memory_profiler_sample_probability`. Значение 0 означает отключение. Рекомендуется установить `max_untracked_memory` в 0, чтобы этот порог работал так, как ожидается.

## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />Каждый раз, когда использование памяти сервером превышает очередной порог (в байтах), профилировщик памяти собирает трассировку стека выделения. Значение 0 отключает профилировщик памяти. Значения меньше нескольких мегабайт замедлят работу сервера.

## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />

Позволяет собирать случайные операции выделения и освобождения памяти и записывать их в системную таблицу [system.trace_log](../../operations/system-tables/trace_log.md) с `trace_type`, равным `MemorySample`, с указанной вероятностью. Эта вероятность применяется к каждой операции выделения или освобождения памяти, независимо от размера выделения. Обратите внимание, что семплирование выполняется только тогда, когда объём неотслеживаемой памяти превышает лимит неотслеживаемой памяти (значение по умолчанию — `4` MiB). Лимит можно уменьшить, если уменьшить значение [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step). Вы можете установить `total_memory_profiler_step` равным `1` для сверхдетализированного семплирования.

Возможные значения:

- Положительное число типа double.
- `0` — запись случайных операций выделения и освобождения памяти в системную таблицу `system.trace_log` отключена.

## trace&#95;log {#trace_log}

Настройки системной таблицы [trace&#95;log](/operations/system-tables/trace_log).

<SystemLogParameters />

Файл конфигурации сервера по умолчанию `config.xml` содержит следующий раздел настроек:

```xml
<trace_log>
    <database>system</database>
    <table>trace_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
    <symbolize>false</symbolize>
</trace_log>
```


## uncompressed_cache_policy {#uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики несжатого кэша.

## uncompressed_cache_size {#uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер (в байтах) несжатых данных, используемых движками таблиц семейства MergeTree.

Для сервера используется один общий кэш. Память выделяется по требованию. Кэш используется, если включена опция `use_uncompressed_cache`.

Кэш несжатых данных полезен для очень коротких запросов в некоторых сценариях.

:::note
Значение `0` означает, что кэш отключен.

Этот параметр можно изменять во время работы сервера, и изменение вступит в силу немедленно.
:::

## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (для политики SLRU) в несжатом кэше относительно общего размера кэша.

## url&#95;scheme&#95;mappers {#url_scheme_mappers}

Конфигурация для преобразования сокращённых или символических префиксов URL-адресов в полные URL-адреса.

Пример:

```xml
<url_scheme_mappers>
    <s3>
        <to>https://{bucket}.s3.amazonaws.com</to>
    </s3>
    <gs>
        <to>https://storage.googleapis.com/{bucket}</to>
    </gs>
    <oss>
        <to>https://{bucket}.oss.aliyuncs.com</to>
    </oss>
</url_scheme_mappers>
```


## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper} 

Метод хранения заголовков частей данных в ZooKeeper. Этот параметр применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Его можно задать:

**Глобально в секции [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует этот параметр для всех таблиц на сервере. Вы можете изменить его в любой момент. Поведение существующих таблиц меняется при изменении параметра.

**Для каждой таблицы**

При создании таблицы укажите соответствующий [параметр движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этим параметром не меняется, даже если глобальный параметр изменится.

**Возможные значения**

- `0` — Функция отключена.
- `1` — Функция включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицируемые](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки частей данных компактно, используя один `znode`. Если таблица содержит много столбцов, этот способ хранения значительно уменьшает объём данных, хранящихся в ZooKeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` вы не сможете понизить версию сервера ClickHouse до версии, которая не поддерживает этот параметр. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все серверы одновременно. Безопаснее тестировать новые версии ClickHouse в тестовой среде или только на нескольких серверах кластера.

Заголовки частей данных, уже сохранённые с этим параметром, нельзя восстановить к их прежнему (некомпактному) представлению.
:::

## user&#95;defined&#95;executable&#95;functions&#95;config {#user_defined_executable_functions_config}

Путь к файлу конфигурации для исполняемых пользовательских определяемых функций.

Путь:

* Укажите абсолютный путь или путь относительно файла конфигурации сервера.
* Путь может содержать подстановочные символы * и ?.

См. также:

* [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## user&#95;defined&#95;path {#user_defined_path}

Каталог с файлами, определёнными пользователем. Используется для пользовательских SQL-функций [SQL User Defined Functions](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


## user&#95;directories {#user_directories}

Раздел конфигурационного файла, который содержит настройки:

* Путь к файлу конфигурации с предопределёнными пользователями.
* Путь к папке, где хранятся пользователи, созданные SQL-командами.
* Путь к узлу ZooKeeper, где хранятся и реплицируются пользователи, созданные SQL-командами.

Если этот раздел указан, путь из [users&#95;config](/operations/server-configuration-parameters/settings#users_config) и [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path) использоваться не будут.

Раздел `user_directories` может содержать любое количество элементов, порядок элементов определяет их приоритет (чем выше элемент, тем выше приоритет).

**Примеры**

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <local_directory>
        <path>/var/lib/clickhouse/access/</path>
    </local_directory>
</user_directories>
```

Пользователи, роли, политики на уровне строк, квоты и профили также могут храниться в ZooKeeper:

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <replicated>
        <zookeeper_path>/clickhouse/access/</zookeeper_path>
    </replicated>
</user_directories>
```

Вы также можете определить секции `memory` — для хранения информации только в памяти без записи на диск и `ldap` — для хранения информации на сервере LDAP.

Чтобы добавить сервер LDAP в качестве удалённого каталога пользователей, не определённых локально, задайте одну секцию `ldap` со следующими настройками:

| Setting  | Description                                                                                                                                                                                                                                                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server` | одно из имён серверов LDAP, определённых в конфигурационной секции `ldap_servers`. Этот параметр является обязательным и не может быть пустым.                                                                                                                                                                                                                                                          |
| `roles`  | секция со списком локально определённых ролей, которые будут назначены каждому пользователю, полученному с сервера LDAP. Если роли не указаны, пользователь не сможет выполнять какие-либо действия после аутентификации. Если любая из перечисленных ролей не определена локально на момент аутентификации, попытка аутентификации будет считаться неуспешной, как если бы был указан неверный пароль. |

**Пример**

```xml
<ldap>
    <server>my_ldap_server</server>
        <roles>
            <my_local_role1 />
            <my_local_role2 />
        </roles>
</ldap>
```


## user&#95;files&#95;path {#user_files_path}

Каталог с пользовательскими файлами. Используется табличными функциями [file()](../../sql-reference/table-functions/file.md) и [fileCluster()](../../sql-reference/table-functions/fileCluster.md).

**Пример**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user&#95;scripts&#95;path {#user_scripts_path}

Каталог, содержащий файлы пользовательских скриптов. Используется для исполняемых пользовательских функций [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).

**Пример**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

Тип:

По умолчанию:


## users&#95;config {#users_config}

Путь к файлу, содержащему:

* Конфигурации пользователей.
* Права доступа.
* Профили настроек.
* Параметры квот.

**Пример**

```xml
<users_config>users.xml</users_config>
```


## validate&#95;tcp&#95;client&#95;information {#validate_tcp_client_information}

<SettingsInfoBlock type="Bool" default_value="0" />Определяет, включена ли проверка клиентской информации при получении пакета запроса.

По умолчанию — `false`:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```


## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />Размер кэша индекса векторного поиска (по количеству записей). Ноль означает, что кэш отключен.

## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования индекса векторного сходства.

## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />Размер кэша для индексов векторного сходства. Ноль — кэш отключен.

:::note
Этот параметр можно изменять во время работы сервера, и изменения вступают в силу немедленно.
:::

## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше индекса векторного сходства относительно его общего размера.

## wait&#95;dictionaries&#95;load&#95;at&#95;startup {#wait_dictionaries_load_at_startup}

<SettingsInfoBlock type="Bool" default_value="1" />

Этот параметр определяет поведение, когда `dictionaries_lazy_load` имеет значение `false`.
(Если `dictionaries_lazy_load` имеет значение `true`, этот параметр ни на что не влияет.)

Если `wait_dictionaries_load_at_startup` имеет значение `false`, сервер
начнёт загружать все словари при старте и параллельно с этим будет принимать подключения.
Когда словарь используется в запросе впервые, запрос будет ждать, пока словарь не загрузится, если он ещё не загружен.
Установка `wait_dictionaries_load_at_startup` в `false` может ускорить запуск ClickHouse, однако некоторые запросы могут выполняться медленнее
(поскольку им придётся ждать загрузки некоторых словарей).

Если `wait_dictionaries_load_at_startup` имеет значение `true`, сервер при запуске будет ждать,
пока все словари завершат загрузку (успешно или с ошибкой), прежде чем начинать принимать подключения.

**Пример**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```


## workload&#95;path {#workload_path}

Каталог, используемый для хранения всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется папка `/workload/` в рабочем каталоге сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**См. также**

* [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)


## workload&#95;zookeeper&#95;path {#workload_zookeeper_path}

Путь к узлу ZooKeeper, который используется как хранилище для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для согласованности все SQL-определения хранятся в значении одного znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**См. также**

* [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)


## zookeeper {#zookeeper}

Содержит настройки, позволяющие ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицируемых таблиц. Если реплицируемые таблицы не используются, этот раздел параметров можно опустить.

Следующие настройки могут быть заданы с помощью подтегов:

| Setting                                    | Description                                                                                                                                                                                                                         |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | Endpoint ZooKeeper. Можно указать несколько endpoint&#39;ов. Например, `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` определяет порядок перебора узлов при подключении к кластеру ZooKeeper. |
| `session_timeout_ms`                       | Максимальный таймаут клиентской сессии в миллисекундах.                                                                                                                                                                             |
| `operation_timeout_ms`                     | Максимальный таймаут одной операции в миллисекундах.                                                                                                                                                                                |
| `root` (optional)                          | Znode, используемый как корневой для znode, с которыми работает сервер ClickHouse.                                                                                                                                                  |
| `fallback_session_lifetime.min` (optional) | Минимальное ограничение на время жизни сессии ZooKeeper к запасному узлу при недоступности основного (балансировка нагрузки). Указывается в секундах. По умолчанию: 3 часа.                                                         |
| `fallback_session_lifetime.max` (optional) | Максимальное ограничение на время жизни сессии ZooKeeper к запасному узлу при недоступности основного (балансировка нагрузки). Указывается в секундах. По умолчанию: 6 часов.                                                       |
| `identity` (optional)                      | Пользователь и пароль, необходимые ZooKeeper для доступа к запрашиваемым znode.                                                                                                                                                     |
| `use_compression` (optional)               | Включает сжатие в протоколе Keeper, если установлено значение true.                                                                                                                                                                 |

Также существует настройка `zookeeper_load_balancing` (необязательно), которая позволяет выбрать алгоритм выбора узла ZooKeeper:

| Algorithm Name                  | Description                                                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `random`                        | случайным образом выбирает один из узлов ZooKeeper.                                                                   |
| `in_order`                      | выбирает первый узел ZooKeeper; если он недоступен, то второй и так далее.                                            |
| `nearest_hostname`              | выбирает узел ZooKeeper с именем хоста, максимально похожим на имя хоста сервера; имя хоста сравнивается по префиксу. |
| `hostname_levenshtein_distance` | аналогично `nearest_hostname`, но имя хоста сравнивается по расстоянию Левенштейна.                                   |
| `first_or_random`               | выбирает первый узел ZooKeeper; если он недоступен, то случайным образом выбирает один из оставшихся узлов ZooKeeper. |
| `round_robin`                   | выбирает первый узел ZooKeeper, при переподключении выбирает следующий.                                               |

**Пример конфигурации**

```xml
<zookeeper>
    <node>
        <host>example1</host>
        <port>2181</port>
    </node>
    <node>
        <host>example2</host>
        <port>2181</port>
    </node>
    <session_timeout_ms>30000</session_timeout_ms>
    <operation_timeout_ms>10000</operation_timeout_ms>
    <!-- Необязательный параметр. Суффикс chroot. Должен существовать. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Необязательный параметр. Строка digest ACL для Zookeeper. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**См. также**

* [Репликация](../../engines/table-engines/mergetree-family/replication.md)
* [Руководство программиста по работе с ZooKeeper](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
* [Опциональное защищённое взаимодействие между ClickHouse и ZooKeeper](/operations/ssl-zookeeper)


## zookeeper&#95;log {#zookeeper_log}

Настройки системной таблицы [`zookeeper_log`](/operations/system-tables/zookeeper_log).

Следующие настройки могут быть настроены с помощью под‑тегов:

<SystemLogParameters />

**Пример**

```xml
<clickhouse>
    <zookeeper_log>
        <database>system</database>
        <table>zookeeper_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <ttl>event_date + INTERVAL 1 WEEK DELETE</ttl>
    </zookeeper_log>
</clickhouse>
```
