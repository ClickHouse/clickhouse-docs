---
description: 'Этот раздел содержит описания серверных настроек, т.е. настроек,
которые не могут быть изменены на уровне сеанса или запроса.'
keywords: ['глобальные серверные настройки']
sidebar_label: 'Серверные настройки'
sidebar_position: 57
slug: /operations/server-configuration-parameters/settings
title: 'Серверные настройки'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/docs/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';


# Настройки сервера

В этом разделе описываются настройки сервера. Это параметры, которые
нельзя изменять на уровне сессии или запроса.

Дополнительную информацию о файлах конфигурации в ClickHouse см. в разделе [«Файлы конфигурации»](/operations/configuration-files).

Другие настройки описаны в разделе [«Настройки»](/operations/settings/overview).
Перед изучением настроек рекомендуется прочитать раздел [«Файлы конфигурации»](/operations/configuration-files)
и обратить внимание на использование подстановок (атрибуты `incl` и `optional`).



## abort_on_logical_error {#abort_on_logical_error}

<SettingsInfoBlock type='Bool' default_value='0' />
Аварийно завершает работу сервера при возникновении исключений LOGICAL_ERROR. Только для экспертов.


## access_control_improvements {#access_control_improvements}

Настройки для дополнительных улучшений системы контроля доступа.

| Настройка                                       | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | По умолчанию |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | Определяет, могут ли пользователи без разрешающих политик строк читать строки с помощью запроса `SELECT`. Например, если есть два пользователя A и B, и политика строк определена только для A, то при значении true пользователь B увидит все строки. При значении false пользователь B не увидит ни одной строки.                                                                                                                                                                                              | `true`  |
| `on_cluster_queries_require_cluster_grant`      | Определяет, требуют ли запросы `ON CLUSTER` привилегию `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                                | `true`  |
| `select_from_system_db_requires_grant`          | Определяет, требует ли запрос `SELECT * FROM system.<table>` каких-либо привилегий и может ли он быть выполнен любым пользователем. При значении true этот запрос требует `GRANT SELECT ON system.<table>`, как и для несистемных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые константные таблицы, такие как `one`, `contributors`) остаются доступными для всех; и если предоставлена привилегия `SHOW` (например, `SHOW USERS`), то соответствующая системная таблица (т. е. `system.users`) будет доступна. | `true`  |
| `select_from_information_schema_requires_grant` | Определяет, требует ли запрос `SELECT * FROM information_schema.<table>` каких-либо привилегий и может ли он быть выполнен любым пользователем. При значении true этот запрос требует `GRANT SELECT ON information_schema.<table>`, как и для обычных таблиц.                                                                                                                                                                                                                                                   | `true`  |
| `settings_constraints_replace_previous`         | Определяет, будет ли ограничение в профиле настроек для некоторой настройки отменять действия предыдущего ограничения (определенного в других профилях) для этой настройки, включая поля, которые не установлены новым ограничением. Также включает тип ограничения `changeable_in_readonly`.                                                                                                                                                                                                                    | `true`  |
| `table_engines_require_grant`                   | Определяет, требует ли создание таблицы с определенным движком таблицы наличия привилегии.                                                                                                                                                                                                                                                                                                                                                                                                                       | `false` |
| `role_cache_expiration_time_seconds`            | Устанавливает количество секунд с момента последнего обращения, в течение которых роль хранится в кэше ролей.                                                                                                                                                                                                                                                                                                                                                                                                    | `600`   |

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

Путь к папке, где сервер ClickHouse хранит конфигурации пользователей и ролей, созданных SQL-командами.

**См. также**

- [Управление доступом и учётными записями](/operations/access-rights#access-control-usage)


## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached}

<SettingsInfoBlock
  type='GroupArrayActionWhenLimitReached'
  default_value='throw'
/>
Действие при превышении максимального размера массива в groupArray: `throw` — выбросить исключение, `discard` — отбросить лишние значения


## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size}

<SettingsInfoBlock type='UInt64' default_value='16777215' />
Максимальный размер элемента массива в байтах для функции groupArray. Это ограничение проверяется
при сериализации и помогает избежать чрезмерного увеличения размера состояния.


## allow_feature_tier {#allow_feature_tier}

<SettingsInfoBlock type='UInt32' default_value='0' />
Управляет возможностью пользователя изменять настройки, относящиеся к различным уровням функциональности.

- `0` - Разрешены изменения любых настроек (экспериментальных, бета-версий, продакшена).
- `1` - Разрешены изменения только настроек бета-версий и продакшена. Изменения экспериментальных настроек отклоняются.
- `2` - Разрешены изменения только настроек продакшена. Изменения экспериментальных настроек или настроек бета-версий отклоняются.

Это эквивалентно установке ограничения только для чтения для всех функций `EXPERIMENTAL` / `BETA`.

:::note
Значение `0` означает, что все настройки могут быть изменены.
:::


## allow_impersonate_user {#allow_impersonate_user}

<SettingsInfoBlock type='Bool' default_value='0' />
Включает/отключает функцию IMPERSONATE (EXECUTE AS target_user).


## allow_implicit_no_password {#allow_implicit_no_password}

Запрещает создание пользователя без пароля, если явно не указано `IDENTIFIED WITH no_password`.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## allow_no_password {#allow_no_password}

Определяет, разрешён ли небезопасный тип пароля no_password.

```xml
<allow_no_password>1</allow_no_password>
```


## allow_plaintext_password {#allow_plaintext_password}

Определяет, разрешено ли использование паролей в открытом виде (небезопасно).

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_use_jemalloc_memory {#allow_use_jemalloc_memory}

<SettingsInfoBlock type='Bool' default_value='1' />
Разрешает использовать память jemalloc.


## allowed_disks_for_table_engines {#allowed_disks_for_table_engines}

Список дисков, разрешённых для использования с Iceberg


## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown}

<SettingsInfoBlock type='Bool' default_value='1' />
Если значение true, очередь асинхронных вставок сбрасывается при корректном завершении работы


## async_insert_threads {#async_insert_threads}

<SettingsInfoBlock type='UInt64' default_value='16' />
Максимальное количество потоков для фактического разбора и вставки данных в фоновом режиме. Значение 0 означает, что асинхронный режим отключён


## async_load_databases {#async_load_databases}

<SettingsInfoBlock type='Bool' default_value='1' />
Асинхронная загрузка баз данных и таблиц.

- Если `true`, все несистемные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружаться асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, обращающийся к таблице, которая еще не загружена, будет ожидать запуска именно этой таблицы. Если задание загрузки завершится с ошибкой, запрос вернет ошибку (вместо остановки всего сервера, как в случае `async_load_databases = false`). Таблица, которую ожидает хотя бы один запрос, будет загружена с более высоким приоритетом. DDL-запросы к базе данных будут ожидать запуска именно этой базы данных. Также рекомендуется установить ограничение `max_waiting_queries` для общего количества ожидающих запросов.
- Если `false`, все базы данных загружаются при запуске сервера.

**Пример**

```xml
<async_load_databases>true</async_load_databases>
```


## async_load_system_database {#async_load_system_database}

<SettingsInfoBlock type='Bool' default_value='0' />
Асинхронная загрузка системных таблиц. Полезна при наличии большого количества таблиц логов
и партиций в базе данных `system`. Не зависит от настройки
`async_load_databases`.

- Если установлено значение `true`, все системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружаться асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, серверные настройки `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, обращающийся к системной таблице, которая еще не загружена, будет ожидать запуска именно этой таблицы. Таблица, ожидаемая хотя бы одним запросом, будет загружена с более высоким приоритетом. Также рекомендуется установить настройку `max_waiting_queries` для ограничения общего количества ожидающих запросов.
- Если установлено значение `false`, системная база данных загружается до запуска сервера.

**Пример**

```xml
<async_load_system_database>true</async_load_system_database>
```


## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s}

<SettingsInfoBlock type='UInt32' default_value='120' />
Период в секундах для обновления ресурсоёмких асинхронных метрик.


## asynchronous_insert_log {#asynchronous_insert_log}

Настройки для системной таблицы [asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log), предназначенной для журналирования асинхронных вставок.

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


## asynchronous_metric_log {#asynchronous_metric_log}

По умолчанию включено в развертываниях ClickHouse Cloud.

Если настройка не включена по умолчанию в вашей среде, в зависимости от способа установки ClickHouse вы можете воспользоваться приведенными ниже инструкциями для ее включения или отключения.

**Включение**

Чтобы вручную включить сбор истории асинхронных метрик [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md), создайте файл `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `asynchronous_metric_log`, создайте файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержимым:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />


## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics}

<SettingsInfoBlock type='Bool' default_value='0' />
Включает вычисление ресурсоёмких асинхронных метрик.


## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s}

<SettingsInfoBlock type='UInt32' default_value='1' />
Период обновления асинхронных метрик в секундах.


## auth_use_forwarded_address {#auth_use_forwarded_address}

Использовать исходный адрес для аутентификации клиентов, подключающихся через прокси-сервер.

:::note
Эту настройку следует использовать с особой осторожностью, поскольку переадресованные адреса могут быть легко подделаны — серверы, принимающие такую аутентификацию, не должны быть доступны напрямую, а исключительно через доверенный прокси-сервер.
:::


## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
Максимальное количество потоков, которые будут использоваться для выполнения операций сброса данных
для [таблиц с движком Buffer](/engines/table-engines/special/buffer) в
фоновом режиме.


## background_common_pool_size {#background_common_pool_size}

<SettingsInfoBlock type='UInt64' default_value='8' />
Максимальное количество потоков, которые будут использоваться для выполнения различных
операций (в основном сборки мусора) для таблиц семейства движков
[*MergeTree](/engines/table-engines/mergetree-family) в фоновом режиме.


## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
Максимальное количество потоков для выполнения распределённых отправок.


## background_fetches_pool_size {#background_fetches_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
Максимальное количество потоков, которые будут использоваться для фоновой загрузки кусков данных из
другой реплики для таблиц с движком [*MergeTree](/engines/table-engines/mergetree-family).


## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio}

<SettingsInfoBlock type='Float' default_value='2' />
Задает соотношение между количеством потоков и количеством фоновых слияний
и мутаций, которые могут выполняться одновременно.

Например, если соотношение равно 2, а [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) установлен равным 16, то ClickHouse может выполнять 32 фоновых слияния одновременно. Это возможно, поскольку фоновые операции могут быть приостановлены и отложены. Это необходимо для того, чтобы предоставить небольшим слияниям более высокий приоритет выполнения.

:::note
Это соотношение можно только увеличить во время работы. Чтобы уменьшить его, необходимо перезапустить сервер.

Как и настройка [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size), параметр [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) может применяться из профиля `default` для обратной совместимости.
:::


## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy}

<SettingsInfoBlock type='String' default_value='round_robin' />
Политика планирования фоновых слияний и мутаций.
Возможные значения: `round_robin` и `shortest_task_first`.

Алгоритм выбора следующего слияния или мутации для выполнения пулом фоновых потоков. Политику можно изменить во время работы без перезапуска сервера.
Может применяться из профиля `default` для обратной совместимости.

Возможные значения:

- `round_robin` — каждое параллельное слияние и мутация выполняются в циклическом порядке, что исключает голодание операций. Меньшие слияния завершаются быстрее больших просто потому, что содержат меньше блоков для слияния.
- `shortest_task_first` — всегда выполняется меньшее слияние или мутация. Слияниям и мутациям назначаются приоритеты на основе их итогового размера. Слияния меньшего размера имеют строгий приоритет над более крупными. Эта политика обеспечивает максимально быстрое слияние небольших частей, но может привести к бесконечному голоданию крупных слияний в партициях, сильно перегруженных операциями `INSERT`.


## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
Максимальное количество потоков, которые будут использоваться для выполнения фоновых
операций для потоковой передачи сообщений.


## background_move_pool_size {#background_move_pool_size}

<SettingsInfoBlock type='UInt64' default_value='8' />
Максимальное количество потоков, которые будут использоваться для перемещения кусков данных на другой диск или том для таблиц семейства *MergeTree в фоновом режиме.


## background_pool_size {#background_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
Задает количество потоков, выполняющих фоновые слияния и мутации для таблиц
с движками семейства MergeTree.

:::note

- Эта настройка также может применяться при запуске сервера из конфигурации профиля `default` для обеспечения обратной совместимости при старте сервера ClickHouse.
- Количество потоков можно только увеличить во время работы сервера.
- Для уменьшения количества потоков необходимо перезапустить сервер.
- Изменяя эту настройку, вы управляете нагрузкой на процессор и диск.
  :::

:::danger
Меньший размер пула потребляет меньше ресурсов процессора и диска, но фоновые процессы выполняются медленнее, что в конечном итоге может негативно повлиять на производительность запросов.
:::

Перед изменением этой настройки рекомендуется также ознакомиться со связанными настройками MergeTree, такими как:

- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).
- [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**Пример**

```xml
<background_pool_size>16</background_pool_size>
```


## background_schedule_pool_max_parallel_tasks_per_type_ratio {#background_schedule_pool_max_parallel_tasks_per_type_ratio}

<SettingsInfoBlock type='Float' default_value='0.8' />
Максимальная доля потоков в пуле, которые могут одновременно выполнять задачи одного типа.


## background_schedule_pool_size {#background_schedule_pool_size}

<SettingsInfoBlock type='UInt64' default_value='512' />
Максимальное количество потоков, которые будут использоваться для постоянного выполнения
некоторых легковесных периодических операций для реплицируемых таблиц, потоковой передачи Kafka и
обновлений кеша DNS.


## backup_log {#backup_log}

Настройки системной таблицы [backup_log](../../operations/system-tables/backup_log.md) для регистрации операций `BACKUP` и `RESTORE`.

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

<SettingsInfoBlock type='NonZeroUInt64' default_value='16' />
Максимальное количество потоков для выполнения запросов `BACKUP`.


## backups {#backups}

Настройки для резервного копирования, используемые при выполнении операторов [`BACKUP` и `RESTORE`](../backup.md).

Следующие настройки можно задать с помощью подтегов:


<!-- SQL
WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','Determines whether multiple backup operations can run concurrently on the same host.', 'true'),
    ('allow_concurrent_restores', 'Bool', 'Determines whether multiple restore operations can run concurrently on the same host.', 'true'),
    ('allowed_disk', 'String', 'Disk to backup to when using `File()`. This setting must be set in order to use `File`.', ''),
    ('allowed_path', 'String', 'Path to backup to when using `File()`. This setting must be set in order to use `File`.', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', 'Number of attempts to collect metadata before sleeping in case of inconsistency after comparing collected metadata.', '2'),
    ('collect_metadata_timeout', 'UInt64', 'Timeout in milliseconds for collecting metadata during backup.', '600000'),
    ('compare_collected_metadata', 'Bool', 'If true, compares the collected metadata with the existing metadata to ensure they are not changed during backup .', 'true'),
    ('create_table_timeout', 'UInt64', 'Timeout in milliseconds for creating tables during restore.', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', 'Maximum number of attempts to retry after encountering a bad version error during coordinated backup/restore.', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Maximum sleep time in milliseconds before the next attempt to collect metadata.', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Minimum sleep time in milliseconds before the next attempt to collect metadata.', '5000'),
    ('remove_backup_files_after_failure', 'Bool', 'If the `BACKUP` command fails, ClickHouse will try to remove the files already copied to the backup before the failure,  otherwise it will leave the copied files as they are.', 'true'),
    ('sync_period_ms', 'UInt64', 'Synchronization period in milliseconds for coordinated backup/restore.', '5000'),
    ('test_inject_sleep', 'Bool', 'Testing related sleep', 'false'),
    ('test_randomize_order', 'Bool', 'If true, randomizes the order of certain operations for testing purposes.', 'false'),
    ('zookeeper_path', 'String', 'Path in ZooKeeper where backup and restore metadata is stored when using `ON CLUSTER` clause.', '/clickhouse/backups')
  ]) AS t )
SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
-->

| Настройка                                           | Тип    | Описание                                                                                                                                                                      | По умолчанию          |
| :-------------------------------------------------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | Определяет, могут ли несколько операций резервного копирования выполняться одновременно на одном хосте.                                                                       | `true`                |
| `allow_concurrent_restores`                         | Bool   | Определяет, могут ли несколько операций восстановления выполняться одновременно на одном хосте.                                                                               | `true`                |
| `allowed_disk`                                      | String | Диск для резервного копирования при использовании `File()`. Эта настройка должна быть задана для использования `File`.                                                       | ``                    |
| `allowed_path`                                      | String | Путь для резервного копирования при использовании `File()`. Эта настройка должна быть задана для использования `File`.                                                       | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | Количество попыток сбора метаданных перед переходом в режим ожидания в случае несоответствия после сравнения собранных метаданных.                                           | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | Таймаут в миллисекундах для сбора метаданных во время резервного копирования.                                                                                                | `600000`              |
| `compare_collected_metadata`                        | Bool   | Если включено, сравнивает собранные метаданные с существующими метаданными, чтобы убедиться, что они не изменились во время резервного копирования.                          | `true`                |
| `create_table_timeout`                              | UInt64 | Таймаут в миллисекундах для создания таблиц во время восстановления.                                                                                                         | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | Максимальное количество попыток повтора после обнаружения ошибки несовместимой версии во время координированного резервного копирования/восстановления.                       | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | Максимальное время ожидания в миллисекундах перед следующей попыткой сбора метаданных.                                                                                       | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | Минимальное время ожидания в миллисекундах перед следующей попыткой сбора метаданных.                                                                                        | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | Если команда `BACKUP` завершается с ошибкой, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до сбоя, в противном случае скопированные файлы останутся без изменений. | `true`                |
| `sync_period_ms`                                    | UInt64 | Период синхронизации в миллисекундах для координированного резервного копирования/восстановления.                                                                            | `5000`                |
| `test_inject_sleep`                                 | Bool   | Задержка, связанная с тестированием                                                                                                                                           | `false`               |
| `test_randomize_order`                              | Bool   | Если включено, рандомизирует порядок определенных операций в целях тестирования.                                                                                             | `false`               |
| `zookeeper_path`                                    | String | Путь в ZooKeeper, где хранятся метаданные резервного копирования и восстановления при использовании конструкции `ON CLUSTER`.                                                | `/clickhouse/backups` |

По умолчанию для этого параметра установлено следующее значение:

```xml
<backups>
    ....
</backups>
```


## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальное количество заданий, которые могут быть запланированы в пуле потоков ввода-вывода резервного копирования.
Рекомендуется не ограничивать размер этой очереди из-за особенностей текущей реализации резервного копирования в S3.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::


## bcrypt_workfactor {#bcrypt_workfactor}

Фактор сложности для типа аутентификации `bcrypt_password`, который использует [алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).
Фактор сложности определяет объём вычислений и время, необходимые для вычисления хеша и проверки пароля.

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
Для приложений с частой аутентификацией
рекомендуется использовать альтернативные методы аутентификации из-за
высоких вычислительных затрат bcrypt при больших значениях фактора сложности.
:::


## blob_storage_log {#blob_storage_log}

Настройки для системной таблицы [`blob_storage_log`](../system-tables/blob_storage_log.md).

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


## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

Интервал в секундах между перезагрузками встроенных словарей.

ClickHouse перезагружает встроенные словари каждые x секунд. Это позволяет редактировать словари «на лету» без перезапуска сервера.

**Пример**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
Задаёт максимальное соотношение размера кэша к объёму оперативной памяти. Позволяет уменьшить размер кэша в системах с малым объёмом памяти.


## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability}

<SettingsInfoBlock type='Double' default_value='0' />
Для тестирования.


## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time}

<SettingsInfoBlock type='UInt64' default_value='15' />
Интервал в секундах, в течение которого максимально допустимое потребление памяти сервера
корректируется в соответствии с пороговым значением в cgroups.

Чтобы отключить наблюдатель cgroup, установите значение `0`.


## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
Задаёт размер кэша (в элементах) для [скомпилированных
выражений](../../operations/caches.md).


## compiled_expression_cache_size {#compiled_expression_cache_size}

<SettingsInfoBlock type='UInt64' default_value='134217728' />
Задаёт размер кэша (в байтах) для [скомпилированных
выражений](../../operations/caches.md).


## compression {#compression}

Настройки сжатия данных для таблиц с движками семейства [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

:::note
Не рекомендуется изменять эти настройки, если вы только начинаете работать с ClickHouse.
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

- `min_part_size` – Минимальный размер куска данных.
- `min_part_size_ratio` – Отношение размера куска данных к размеру таблицы.
- `method` – Метод сжатия. Допустимые значения: `lz4`, `lz4hc`, `zstd`, `deflate_qpl`.
- `level` – Уровень сжатия. См. [Кодеки](/sql-reference/statements/create/table#general-purpose-codecs).

:::note
Можно настроить несколько секций `<case>`.
:::

**Действия при выполнении условий**:

- Если кусок данных соответствует набору условий, ClickHouse использует указанный метод сжатия.
- Если кусок данных соответствует нескольким наборам условий, ClickHouse использует первый подходящий набор.

:::note
Если для куска данных не выполнено ни одно условие, ClickHouse использует сжатие `lz4`.
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

<SettingsInfoBlock type='String' default_value='fair_round_robin' />
Политика планирования слотов CPU, определяемых параметрами
`concurrent_threads_soft_limit_num` и
`concurrent_threads_soft_limit_ratio_to_cores`. Алгоритм управляет распределением
ограниченного количества слотов CPU между конкурирующими запросами. Планировщик
можно изменить во время работы без перезапуска сервера.

Возможные значения:

- `round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads` слотов CPU. Один слот на поток. При конкуренции слоты CPU распределяются между запросами по алгоритму round-robin. Обратите внимание, что первый слот выделяется безусловно, что может привести к несправедливому распределению и увеличению задержки запросов с высоким значением `max_threads` при наличии большого количества запросов с `max_threads` = 1.
- `fair_round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads - 1` слотов CPU. Вариант `round_robin`, который не требует слота CPU для первого потока каждого запроса. Таким образом, запросы с `max_threads` = 1 не требуют слотов и не могут несправедливо занять все слоты. Слоты не выделяются безусловно.


## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальное количество потоков обработки запросов (за исключением потоков для получения данных с удалённых серверов), которые могут использоваться для выполнения всех запросов. Это не жёсткое ограничение. При достижении лимита запрос всё равно получит как минимум один поток для выполнения. Запрос может увеличить количество потоков до требуемого значения в процессе выполнения, если появятся дополнительные доступные потоки.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::


## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores}

<SettingsInfoBlock type='UInt64' default_value='0' />
Аналогично
[`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num), но
в виде соотношения к количеству ядер.


## config_reload_interval_ms {#config_reload_interval_ms}

<SettingsInfoBlock type='UInt64' default_value='2000' />
Как часто ClickHouse перезагружает конфигурацию и проверяет наличие новых изменений


## core_dump {#core_dump}

Настраивает мягкое ограничение размера файла core dump.

:::note
Жёсткое ограничение настраивается с помощью системных инструментов
:::

**Пример**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```


## cpu_slot_preemption {#cpu_slot_preemption}

<SettingsInfoBlock type='Bool' default_value='0' />
Определяет способ планирования рабочей нагрузки для ресурсов процессора (MASTER THREAD и WORKER THREAD).

- Если `true` (рекомендуется), учёт ведётся на основе фактически потреблённого процессорного времени. Между конкурирующими рабочими нагрузками распределяется справедливое количество процессорного времени. Слоты выделяются на ограниченное время и запрашиваются повторно после истечения срока. Запрос слота может блокировать выполнение потока при перегрузке ресурсов процессора, то есть может произойти вытеснение. Это обеспечивает справедливое распределение процессорного времени.
- Если `false` (по умолчанию), учёт ведётся на основе количества выделенных слотов процессора. Между конкурирующими рабочими нагрузками распределяется справедливое количество слотов процессора. Слот выделяется при запуске потока, удерживается непрерывно и освобождается при завершении выполнения потока. Количество потоков, выделенных для выполнения запроса, может только увеличиваться от 1 до `max_threads` и никогда не уменьшается. Это более благоприятно для длительных запросов и может привести к нехватке ресурсов процессора для коротких запросов.

**Пример**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**См. также**

- [Планирование рабочей нагрузки](/operations/workload-scheduling.md)


## cpu_slot_preemption_timeout_ms {#cpu_slot_preemption_timeout_ms}

<SettingsInfoBlock type='UInt64' default_value='1000' />
Определяет, сколько миллисекунд рабочий поток может ожидать во время вытеснения,
то есть в ожидании выделения другого слота CPU. По истечении этого таймаута, если
поток не смог получить новый слот CPU, он завершится, и запрос будет динамически
масштабирован до меньшего количества одновременно выполняющихся потоков. Обратите внимание, что
главный поток никогда не масштабируется вниз, но может быть вытеснен на неограниченное время. Имеет смысл
только при включенном `cpu_slot_preemption` и определенном ресурсе CPU для
WORKER THREAD.

**Пример**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**См. также**

- [Планирование рабочей нагрузки](/operations/workload-scheduling.md)


## cpu_slot_quantum_ns {#cpu_slot_quantum_ns}

<SettingsInfoBlock type='UInt64' default_value='10000000' />
Определяет, сколько наносекунд процессорного времени может использовать поток после
получения слота CPU и перед тем, как он должен запросить следующий слот CPU. Имеет смысл
только при включенном параметре `cpu_slot_preemption` и определенном ресурсе CPU для MASTER
THREAD или WORKER THREAD.

**Пример**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**См. также**

- [Планирование рабочей нагрузки](/operations/workload-scheduling.md)


## crash_log {#crash_log}

Настройки для работы системной таблицы [crash_log](../../operations/system-tables/crash_log.md).

Следующие настройки могут быть заданы с помощью подтегов:

| Настройка                          | Описание                                                                                                                                     | По умолчанию        | Примечание                                                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `database`                         | Имя базы данных.                                                                                                                             |                     |                                                                                                                    |
| `table`                            | Имя системной таблицы.                                                                                                                       |                     |                                                                                                                    |
| `engine`                           | [Определение движка MergeTree](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table) для системной таблицы. |                     | Не может использоваться, если определены `partition_by` или `order_by`. Если не указано, по умолчанию используется `MergeTree`        |
| `partition_by`                     | [Пользовательский ключ партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key.md) для системной таблицы.            |                     | Если для системной таблицы указан `engine`, параметр `partition_by` должен быть указан непосредственно внутри 'engine'   |
| `ttl`                              | Задает [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) таблицы.                                     |                     | Если для системной таблицы указан `engine`, параметр `ttl` должен быть указан непосредственно внутри 'engine'            |
| `order_by`                         | [Пользовательский ключ сортировки](/engines/table-engines/mergetree-family/mergetree#order_by) для системной таблицы. Не может использоваться, если определен `engine`.      |                     | Если для системной таблицы указан `engine`, параметр `order_by` должен быть указан непосредственно внутри 'engine'       |
| `storage_policy`                   | Имя политики хранения, используемой для таблицы (необязательно).                                                                                  |                     | Если для системной таблицы указан `engine`, параметр `storage_policy` должен быть указан непосредственно внутри 'engine' |
| `settings`                         | [Дополнительные параметры](/engines/table-engines/mergetree-family/mergetree/#settings), управляющие поведением MergeTree (необязательно).  |                     | Если для системной таблицы указан `engine`, параметр `settings` должен быть указан непосредственно внутри 'engine'       |
| `flush_interval_milliseconds`      | Интервал сброса данных из буфера в памяти в таблицу.                                                                           | `7500`              |                                                                                                                    |
| `max_size_rows`                    | Максимальный размер логов в строках. Когда количество несброшенных логов достигает max_size, логи сбрасываются на диск.                   | `1024`              |                                                                                                                    |
| `reserved_size_rows`               | Предварительно выделенный размер памяти в строках для логов.                                                                                             | `1024`              |                                                                                                                    |
| `buffer_size_rows_flush_threshold` | Пороговое значение количества строк. При достижении порога сброс логов на диск запускается в фоновом режиме.                             | `max_size_rows / 2` |                                                                                                                    |
| `flush_on_crash`                   | Определяет, должны ли логи сбрасываться на диск в случае сбоя.                                                                           | `false`             |                                                                                                                    |

Файл конфигурации сервера по умолчанию `config.xml` содержит следующую секцию настроек:

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


## custom_cached_disks_base_directory {#custom_cached_disks_base_directory}

Эта настройка задает путь к кэшу для пользовательских кэшируемых дисков (созданных из SQL).
Для пользовательских дисков параметр `custom_cached_disks_base_directory` имеет более высокий приоритет, чем `filesystem_caches_path` (находится в `filesystem_caches_path.xml`),
который используется при отсутствии первого.
Путь настройки кэша файловой системы должен находиться внутри этого каталога,
иначе будет выброшено исключение, препятствующее созданию диска.

:::note
Это не повлияет на диски, созданные в более старой версии, с которой был выполнен апгрейд сервера.
В этом случае исключение не будет выброшено, чтобы сервер мог успешно запуститься.
:::

Пример:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```


## custom_settings_prefixes {#custom_settings_prefixes}

Список префиксов для [пользовательских настроек](/operations/settings/query-level#custom_settings). Префиксы должны разделяться запятыми.

**Пример**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**См. также**

- [Пользовательские настройки](/operations/settings/query-level#custom_settings)


## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec}

<SettingsInfoBlock type='UInt64' default_value='480' />
Задержка, в течение которой удалённую таблицу можно восстановить с помощью
оператора [`UNDROP`](/sql-reference/statements/undrop.md). Если `DROP TABLE` был выполнен
с модификатором `SYNC`, настройка игнорируется. Значение по умолчанию —
`480` (8 минут).


## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec}

<SettingsInfoBlock type='UInt64' default_value='5' />
В случае неудачного удаления таблицы ClickHouse ожидает указанное время перед
повторной попыткой операции.


## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency}

<SettingsInfoBlock type='UInt64' default_value='16' />
Размер пула потоков, используемых для удаления таблиц.


## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec}

<SettingsInfoBlock type='UInt64' default_value='86400' />
Параметр задачи, которая очищает устаревшие данные из каталога `store/`. Задаёт
период выполнения задачи.

:::note
Значение `0` означает «никогда». Значение по умолчанию соответствует 1 дню.
:::


## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec}

<SettingsInfoBlock type='UInt64' default_value='3600' />
Параметр задачи, которая очищает мусор из директории `store/`. Если какая-либо
поддиректория не используется clickhouse-server и эта директория не
изменялась в течение последних
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec)
секунд, задача «скроет» эту директорию, удалив все права доступа. Это
также применяется к директориям, которые clickhouse-server не ожидает обнаружить внутри
`store/`.

:::note
Значение `0` означает «немедленно».
:::


## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec}

<SettingsInfoBlock type='UInt64' default_value='2592000' />
Параметр задачи, которая очищает мусор из каталога `store/`. Если какой-либо
подкаталог не используется clickhouse-server и был ранее «скрыт»
(см.
[database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec))
и этот каталог не изменялся в течение последних
[`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec)
секунд, задача удалит этот каталог. Также работает для каталогов, которые
clickhouse-server не ожидает обнаружить внутри `store/`.

:::note
Значение `0` означает «никогда». Значение по умолчанию соответствует 30 дням.
:::


## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently}

<SettingsInfoBlock type='Bool' default_value='1' />
Разрешить постоянное отключение таблиц в реплицируемых базах данных


## database_replicated_drop_broken_tables {#database_replicated_drop_broken_tables}

<SettingsInfoBlock type='Bool' default_value='0' />
Удалять неожиданные таблицы из реплицируемых баз данных вместо их перемещения в
отдельную локальную базу данных


## dead_letter_queue {#dead_letter_queue}

Настройка системной таблицы `dead_letter_queue`.

<SystemLogParameters />

Настройки по умолчанию:

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```


## default_database {#default_database}

<SettingsInfoBlock type='String' default_value='default' />
Имя базы данных по умолчанию.


## default_password_type {#default_password_type}

Задает тип пароля, который будет автоматически использоваться в запросах вида `CREATE USER u IDENTIFIED BY 'p'`.

Допустимые значения:

- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```


## default_profile {#default_profile}

Профиль настроек по умолчанию. Профили настроек располагаются в файле, указанном в настройке `user_config`.

**Пример**

```xml
<default_profile>default</default_profile>
```


## default_replica_name {#default_replica_name}

<SettingsInfoBlock type='String' default_value='{replica}' />
Имя реплики в ZooKeeper.

**Пример**

```xml
<default_replica_name>{replica}</default_replica_name>
```


## default_replica_path {#default_replica_path}

<SettingsInfoBlock
  type='String'
  default_value='/clickhouse/tables/{uuid}/{shard}'
/>
Путь к таблице в ZooKeeper.

**Пример**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```


## default_session_timeout {#default_session_timeout}

Тайм-аут сеанса по умолчанию, в секундах.

```xml
<default_session_timeout>60</default_session_timeout>
```


## dictionaries_config {#dictionaries_config}

Путь к файлу конфигурации словарей.

Путь:

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать символы подстановки \* и ?.

См. также:

- "[Словари](../../sql-reference/dictionaries/index.md)".

**Пример**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```


## dictionaries_lazy_load {#dictionaries_lazy_load}

<SettingsInfoBlock type='Bool' default_value='1' />
Отложенная загрузка словарей.

- Если `true`, каждый словарь загружается при первом обращении к нему. Если загрузка завершается неудачей, функция, использующая словарь, генерирует исключение.
- Если `false`, сервер загружает все словари при запуске.

:::note
При запуске сервер ожидает завершения загрузки всех словарей перед приёмом соединений
(исключение: если параметр [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) установлен в `false`).
:::

**Пример**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```


## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval}

<SettingsInfoBlock type='UInt64' default_value='1000' />
Интервал в миллисекундах для попыток переподключения к неработающим словарям MySQL и Postgres
при включенном параметре `background_reconnect`.


## disable_insertion_and_mutation {#disable_insertion_and_mutation}

<SettingsInfoBlock type='Bool' default_value='0' />
Отключает запросы INSERT/ALTER/DELETE. Эту настройку следует включать, когда необходимы
узлы только для чтения, чтобы операции вставки и изменения данных не влияли на
производительность чтения. Вставки во внешние движки (S3, DataLake, MySQL, PostgreSQL,
Kafka и т. д.) разрешены независимо от этой настройки.


## disable_internal_dns_cache {#disable_internal_dns_cache}

<SettingsInfoBlock type='Bool' default_value='0' />
Отключает внутренний кэш DNS. Рекомендуется для эксплуатации ClickHouse в системах
с часто изменяющейся инфраструктурой, таких как Kubernetes.


## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию для выполнения `HTTPS`-запросов через `HTTP`-прокси используется туннелирование (т. е. `HTTP CONNECT`). Эта настройка позволяет его отключить.

**no_proxy**

По умолчанию все запросы проходят через прокси-сервер. Чтобы отключить прокси для определённых хостов, необходимо задать переменную `no_proxy`.
Её можно указать внутри секции `<proxy>` для списочных и удалённых резолверов, а также в качестве переменной окружения для резолвера окружения.
Поддерживаются IP-адреса, домены, поддомены и символ подстановки `'*'` для полного обхода прокси. Ведущие точки удаляются так же, как это делает curl.

**Пример**

Приведённая ниже конфигурация обходит прокси для запросов к `clickhouse.cloud` и всем его поддоменам (например, `auth.clickhouse.cloud`).
То же самое относится к GitLab, несмотря на наличие ведущей точки. И `gitlab.com`, и `about.gitlab.com` будут обходить прокси.

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

<SettingsInfoBlock type='UInt64' default_value='5000' />
Соединения сверх этого лимита имеют значительно меньшее время жизни. Лимит
применяется к соединениям с дисками.


## disk_connections_store_limit {#disk_connections_store_limit}

<SettingsInfoBlock type='UInt64' default_value='30000' />
Соединения сверх этого лимита сбрасываются после использования. Установите значение 0, чтобы отключить кэш соединений. Лимит применяется к соединениям с дисками.


## disk_connections_warn_limit {#disk_connections_warn_limit}

<SettingsInfoBlock type='UInt64' default_value='10000' />
Предупреждающие сообщения записываются в логи, если количество активных соединений
превышает этот лимит. Лимит применяется к соединениям с дисками.


## display_secrets_in_show_and_select {#display_secrets_in_show_and_select}

<SettingsInfoBlock type='Bool' default_value='0' />
Включает или отключает отображение секретов в запросах `SHOW` и `SELECT` для таблиц,
баз данных, табличных функций и словарей.

Для просмотра секретов пользователь также должен иметь
включенную настройку формата [`format_display_secrets_in_show_and_select`](../settings/formats#format_display_secrets_in_show_and_select)
и привилегию
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Возможные значения:

- `0` — Отключено.
- `1` — Включено.


## distributed_cache_apply_throttling_settings_from_client {#distributed_cache_apply_throttling_settings_from_client}

<SettingsInfoBlock type='Bool' default_value='1' />
Определяет, должен ли сервер кэша применять настройки троттлинга, полученные от клиента.


## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio}

<SettingsInfoBlock type='Float' default_value='0.1' />
Мягкое ограничение на количество активных соединений, которые распределённый кэш будет пытаться поддерживать
в свободном состоянии. Когда количество свободных соединений опустится ниже
distributed_cache_keep_up_free_connections_ratio * max_connections, соединения
с наиболее старой активностью будут закрываться до тех пор, пока количество не превысит установленный лимит.


## distributed_ddl {#distributed_ddl}

Управление выполнением [распределённых DDL-запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) на кластере.
Работает только при включённом [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper).

Настраиваемые параметры в секции `<distributed_ddl>`:

| Параметр               | Описание                                                                                                                          | Значение по умолчанию                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `path`                 | путь в Keeper для очереди задач (`task_queue`) DDL-запросов                                                                      |                                        |
| `profile`              | профиль, используемый для выполнения DDL-запросов                                                                                 |                                        |
| `pool_size`            | количество запросов `ON CLUSTER`, которые могут выполняться одновременно                                                          |                                        |
| `max_tasks_in_queue`   | максимальное количество задач в очереди                                                                                           | `1,000`                                |
| `task_max_lifetime`    | удаление узла, если его возраст превышает указанное значение                                                                      | `7 * 24 * 60 * 60` (неделя в секундах) |
| `cleanup_delay_period` | очистка запускается после получения события нового узла, если последняя очистка была выполнена не ранее чем `cleanup_delay_period` секунд назад | `60` секунд                            |

**Пример**

```xml
<distributed_ddl>
    <!-- Путь в ZooKeeper к очереди DDL-запросов -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Настройки из этого профиля будут использоваться для выполнения DDL-запросов -->
    <profile>default</profile>

    <!-- Управляет количеством запросов ON CLUSTER, которые могут выполняться одновременно -->
    <pool_size>1</pool_size>

    <!--
         Настройки очистки (активные задачи не удаляются)
    -->

    <!-- Управляет TTL задачи (по умолчанию 1 неделя) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Управляет частотой выполнения очистки (в секундах) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Управляет максимальным количеством задач в очереди -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```


## distributed_ddl_use_initial_user_and_roles {#distributed_ddl_use_initial_user_and_roles}

<SettingsInfoBlock type='Bool' default_value='0' />
Если включено, запросы ON CLUSTER будут сохранять и использовать пользователя и
роли инициатора для выполнения на удалённых шардах. Это обеспечивает единообразный контроль доступа
в кластере, но требует, чтобы пользователь и роли существовали на всех узлах.


## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4}

<SettingsInfoBlock type='Bool' default_value='1' />
Разрешает преобразование имён в IPv4-адреса.


## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6}

<SettingsInfoBlock type='Bool' default_value='1' />
Разрешает разрешение имён в IPv6-адреса.


## dns_cache_max_entries {#dns_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='10000' />
Максимальное количество записей во внутреннем кеше DNS.


## dns_cache_update_period {#dns_cache_update_period}

<SettingsInfoBlock type='Int32' default_value='15' />
Период обновления внутреннего кеша DNS в секундах.


## dns_max_consecutive_failures {#dns_max_consecutive_failures}

<SettingsInfoBlock type='UInt32' default_value='10' />
Максимальное количество последовательных неудачных попыток разрешения DNS для имени хоста перед его удалением из DNS-кеша ClickHouse.


## drop_distributed_cache_pool_size {#drop_distributed_cache_pool_size}

<SettingsInfoBlock type='UInt64' default_value='8' />
Размер пула потоков, используемого для очистки распределённого кеша.


## drop_distributed_cache_queue_size {#drop_distributed_cache_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000' />
Размер очереди пула потоков, используемого для очистки распределённого кеша.


## enable_azure_sdk_logging {#enable_azure_sdk_logging}

<SettingsInfoBlock type='Bool' default_value='0' />
Включает логирование из Azure SDK


## encryption {#encryption}

Настраивает команду для получения ключа, используемого [кодеками шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должны быть записаны в переменные окружения или заданы в конфигурационном файле.

Ключи могут быть представлены в шестнадцатеричном формате или в виде строки длиной 16 байт.

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
Хранение ключей в конфигурационном файле не рекомендуется, так как это небезопасно. Вы можете переместить ключи в отдельный конфигурационный файл на защищённом диске и разместить символическую ссылку на этот файл в папке `config.d/`.
:::

Загрузка из конфигурации, когда ключ задан в шестнадцатеричном формате:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Загрузка ключа из переменной окружения:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Здесь `current_key_id` задаёт текущий ключ для шифрования, а все указанные ключи могут использоваться для расшифровки.

Каждый из этих методов может применяться для нескольких ключей:

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

Также можно добавить nonce, который должен иметь длину 12 байт (по умолчанию процессы шифрования и расшифровки используют nonce, состоящий из нулевых байтов):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Или его можно задать в шестнадцатеричном формате:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
Всё вышеперечисленное применимо и к `aes_256_gcm_siv` (но ключ должен иметь длину 32 байта).
:::


## error_log {#error_log}

По умолчанию отключен.

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

Чтобы отключить настройку `error_log`, создайте файл `/etc/clickhouse-server/config.d/disable_error_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## format_parsing_thread_pool_queue_size {#format_parsing_thread_pool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
Максимальное количество задач, которые могут быть запланированы в пуле потоков для разбора
входных данных.

:::note
Значение `0` означает отсутствие ограничения.
:::


## format_schema_path {#format_schema_path}

Путь к каталогу со схемами для входных данных, например, схемами для формата [CapnProto](/interfaces/formats/CapnProto).

**Пример**

```xml
<!-- Каталог, содержащий файлы схем для различных форматов входных данных. -->
<format_schema_path>format_schemas/</format_schema_path>
```


## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns}

<SettingsInfoBlock type='UInt64' default_value='10000000000' />
Период таймера процессорного времени для глобального профилировщика (в наносекундах). Установите значение 0, чтобы отключить глобальный профилировщик процессорного времени. Рекомендуемое значение — не менее 10000000 (100 раз в секунду) для отдельных запросов или 1000000000 (один раз в секунду) для профилирования на уровне кластера.


## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns}

<SettingsInfoBlock type='UInt64' default_value='10000000000' />
Период таймера реального времени глобального профилировщика (в наносекундах). Установите значение 0, чтобы
отключить глобальный профилировщик реального времени. Рекомендуемое значение — не менее 10000000
(100 раз в секунду) для отдельных запросов или 1000000000 (раз в секунду) для
профилирования на уровне кластера.


## google_protos_path {#google_protos_path}

Определяет каталог, содержащий proto-файлы для типов Protobuf.

Пример:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## graphite {#graphite}

Отправка данных в [Graphite](https://github.com/graphite-project).

Настройки:

- `host` – Сервер Graphite.
- `port` – Порт сервера Graphite.
- `interval` – Интервал отправки в секундах.
- `timeout` – Таймаут отправки данных в секундах.
- `root_path` – Префикс для ключей.
- `metrics` – Отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Отправка данных о приращениях, накопленных за период времени, из таблицы [system.events](/operations/system-tables/events).
- `events_cumulative` – Отправка накопительных данных из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Отправка данных из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Можно настроить несколько секций `<graphite>`. Например, это можно использовать для отправки различных данных с разными интервалами.

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


## graphite_rollup {#graphite_rollup}

Настройки для прореживания данных Graphite.

Подробнее см. [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md).

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


## hsts_max_age {#hsts_max_age}

Время действия HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. При установке положительного числа HSTS будет включен, а max-age будет равен указанному значению.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## http_connections_soft_limit {#http_connections_soft_limit}

<SettingsInfoBlock type='UInt64' default_value='100' />
Соединения, превышающие этот лимит, имеют значительно более короткое время жизни. Лимит
применяется к HTTP-соединениям, которые не относятся ни к одному диску или хранилищу.


## http_connections_store_limit {#http_connections_store_limit}

<SettingsInfoBlock type='UInt64' default_value='5000' />
Соединения, превышающие этот лимит, сбрасываются после использования. Установите значение 0, чтобы отключить кэш соединений. Лимит применяется к HTTP-соединениям, которые не относятся ни к одному диску или хранилищу.


## http_connections_warn_limit {#http_connections_warn_limit}

<SettingsInfoBlock type='UInt64' default_value='1000' />
Предупреждающие сообщения записываются в журнал, если количество активных соединений
превышает этот лимит. Лимит применяется к HTTP-соединениям, которые не
относятся к какому-либо диску или хранилищу.


## http_handlers {#http_handlers}

Позволяет использовать пользовательские HTTP-обработчики.
Чтобы добавить новый HTTP-обработчик, просто добавьте новый элемент `<rule>`.
Правила проверяются сверху вниз в порядке их определения,
и первое совпадение запустит обработчик.

Следующие настройки могут быть сконфигурированы с помощью вложенных элементов:

| Вложенные элементы   | Определение                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                | Для сопоставления URL запроса можно использовать префикс 'regex:' для применения регулярного выражения (необязательно)                            |
| `methods`            | Для сопоставления методов запроса можно использовать запятые для разделения нескольких методов (необязательно)                                    |
| `headers`            | Для сопоставления заголовков запроса сопоставляется каждый дочерний элемент (имя дочернего элемента — это имя заголовка), можно использовать префикс 'regex:' для применения регулярного выражения (необязательно) |
| `handler`            | Обработчик запроса                                                                                                                                |
| `empty_query_string` | Проверка отсутствия строки запроса в URL                                                                                                          |

`handler` содержит следующие настройки, которые могут быть сконфигурированы с помощью вложенных элементов:

| Вложенные элементы | Определение                                                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`              | Адрес для перенаправления                                                                                                                                             |
| `type`             | Поддерживаемые типы: static, dynamic_query_handler, predefined_query_handler, redirect                                                                                |
| `status`           | Используется с типом static, код статуса ответа                                                                                                                       |
| `query_param_name` | Используется с типом dynamic_query_handler, извлекает и выполняет значение, соответствующее значению `<query_param_name>` в параметрах HTTP-запроса                  |
| `query`            | Используется с типом predefined_query_handler, выполняет запрос при вызове обработчика                                                                                |
| `content_type`     | Используется с типом static, тип содержимого ответа                                                                                                                   |
| `response_content` | Используется с типом static, содержимое ответа, отправляемое клиенту; при использовании префикса 'file://' или 'config://' содержимое извлекается из файла или конфигурации и отправляется клиенту |

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


## http_options_response {#http_options_response}

Используется для добавления заголовков к ответу на HTTP-запрос `OPTIONS`.
Метод `OPTIONS` применяется при выполнении предварительных CORS-запросов (preflight requests).

Подробнее см. [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS).

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


## http_server_default_response {#http_server_default_response}

Страница, отображаемая по умолчанию при обращении к HTTP(s)-серверу ClickHouse.
Значение по умолчанию: "Ok." (с символом перевода строки в конце)

**Пример**

Открывает `https://tabix.io/` при обращении к `http://localhost: http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size}

<SettingsInfoBlock type='UInt64' default_value='50' />
Размер фонового пула потоков для каталога Iceberg


## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
Количество задач, которые можно добавить в очередь пула каталога Iceberg


## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='1000' />
Максимальный размер кеша файлов метаданных Iceberg в записях. Ноль означает отключено.


## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
Название политики кэширования метаданных Iceberg.


## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />
Максимальный размер кеша метаданных Iceberg в байтах. Ноль означает отключено.


## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
Размер защищённой очереди (при использовании политики SLRU) в кеше метаданных Iceberg
относительно общего размера кеша.


## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query}

<SettingsInfoBlock type='Bool' default_value='1' />
Если установлено значение true, ClickHouse не записывает значения по умолчанию для пустого оператора SQL security в
запросах `CREATE VIEW`.

:::note
Эта настройка необходима только на период миграции и станет устаревшей в версии 24.4
:::


## include_from {#include_from}

Путь к файлу с подстановками. Поддерживаются форматы XML и YAML.

Подробнее см. в разделе «[Конфигурационные файлы](/operations/configuration-files)».

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## index_mark_cache_policy {#index_mark_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
Имя политики кэша меток вторичного индекса.


## index_mark_cache_size {#index_mark_cache_size}

<SettingsInfoBlock type='UInt64' default_value='5368709120' />
Максимальный размер кэша для индексных меток.

:::note

Значение `0` означает отключено.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::


## index_mark_cache_size_ratio {#index_mark_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.3' />
Размер защищённой очереди (в случае политики SLRU) в кеше отметок вторичного индекса относительно общего размера кеша.


## index_uncompressed_cache_policy {#index_uncompressed_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
Название политики кэша несжатых вторичных индексов.


## index_uncompressed_cache_size {#index_uncompressed_cache_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальный размер кеша для несжатых блоков индексов `MergeTree`.

:::note
Значение `0` означает отключено.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::


## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
Размер защищённой очереди (в случае политики SLRU) в кеше несжатых вторичных индексов относительно общего размера кеша.


## interserver_http_credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики с помощью этих учетных данных.
Параметр `interserver_http_credentials` должен быть одинаковым для всех реплик в кластере.

:::note

- По умолчанию, если секция `interserver_http_credentials` отсутствует, аутентификация при репликации не используется.
- Настройки `interserver_http_credentials` не связаны с [конфигурацией](../../interfaces/cli.md#configuration_files) учетных данных клиента ClickHouse.
- Эти учетные данные являются общими для репликации по протоколам `HTTP` и `HTTPS`.
  :::

Следующие настройки могут быть заданы с помощью вложенных тегов:

- `user` — имя пользователя.
- `password` — пароль.
- `allow_empty` — если `true`, другим репликам разрешено подключаться без аутентификации, даже если учетные данные заданы. Если `false`, подключения без аутентификации отклоняются. Значение по умолчанию: `false`.
- `old` — содержит старые значения `user` и `password`, используемые при ротации учетных данных. Можно указать несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию межсерверных учетных данных без одновременной остановки всех реплик для обновления их конфигурации. Учетные данные можно изменить в несколько этапов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволяет подключаться как с аутентификацией, так и без нее.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите `allow_empty` в `false` или удалите этот параметр. Это сделает аутентификацию с новыми учетными данными обязательной.

Чтобы изменить существующие учетные данные, переместите имя пользователя и пароль в секцию `interserver_http_credentials.old` и обновите `user` и `password` новыми значениями. На этом этапе сервер использует новые учетные данные для подключения к другим репликам и принимает подключения как с новыми, так и со старыми учетными данными.

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

После применения новых учетных данных ко всем репликам старые учетные данные можно удалить.


## interserver_http_host {#interserver_http_host}

Имя хоста, которое может использоваться другими серверами для доступа к данному серверу.

Если параметр не указан, он определяется так же, как и при выполнении команды `hostname -f`.

Полезно для отвязки от конкретного сетевого интерфейса.

**Пример**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver_http_port {#interserver_http_port}

Порт для обмена данными между серверами ClickHouse.

**Пример**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver_https_host {#interserver_https_host}

Аналогично [`interserver_http_host`](#interserver_http_host), но это имя хоста используется другими серверами для доступа к данному серверу по протоколу `HTTPS`.

**Пример**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver_https_port {#interserver_https_port}

Порт для обмена данными между серверами ClickHouse по протоколу `HTTPS`.

**Пример**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver_listen_host {#interserver_listen_host}

Ограничение на хосты, которые могут обмениваться данными между серверами ClickHouse.
Если используется Keeper, то же ограничение применяется к обмену данными между различными экземплярами Keeper.

:::note
По умолчанию значение совпадает с настройкой [`listen_host`](#listen_host).
:::

**Пример**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

Тип:

По умолчанию:


## io_thread_pool_queue_size {#io_thread_pool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
Максимальное количество задач, которые могут быть запланированы в пуле потоков ввода-вывода.

:::note
Значение `0` означает отсутствие ограничения.
:::


## jemalloc_collect_global_profile_samples_in_trace_log {#jemalloc_collect_global_profile_samples_in_trace_log}

<SettingsInfoBlock type='Bool' default_value='0' />
Сохранять образцы выделений памяти jemalloc в system.trace_log


## jemalloc_enable_background_threads {#jemalloc_enable_background_threads}

<SettingsInfoBlock type='Bool' default_value='1' />
Включает фоновые потоки jemalloc. Jemalloc использует фоновые потоки для очистки
неиспользуемых страниц памяти. Отключение может привести к снижению производительности.


## jemalloc_enable_global_profiler {#jemalloc_enable_global_profiler}

<SettingsInfoBlock type='Bool' default_value='0' />
Включает профилировщик выделения памяти jemalloc для всех потоков. Jemalloc будет производить выборку
выделений и всех освобождений для выделений, попавших в выборку. Профили можно
сбросить с помощью SYSTEM JEMALLOC FLUSH PROFILE, что позволяет анализировать
выделение памяти. Образцы также могут сохраняться в system.trace_log с использованием конфигурационного параметра
jemalloc_collect_global_profile_samples_in_trace_log или настройки запроса
jemalloc_collect_profile_samples_in_trace_log. См. [Профилирование выделения памяти](/operations/allocation-profiling)


## jemalloc_flush_profile_interval_bytes {#jemalloc_flush_profile_interval_bytes}

<SettingsInfoBlock type='UInt64' default_value='0' />
Сброс профиля jemalloc выполняется после того, как глобальное пиковое использование памяти увеличится на значение jemalloc_flush_profile_interval_bytes


## jemalloc_flush_profile_on_memory_exceeded {#jemalloc_flush_profile_on_memory_exceeded}

<SettingsInfoBlock type='Bool' default_value='0' />
Сброс профиля jemalloc будет выполнен при ошибках превышения общего объёма памяти


## jemalloc_max_background_threads_num {#jemalloc_max_background_threads_num}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальное количество фоновых потоков jemalloc, которые можно создать. Установите значение 0, чтобы использовать значение по умолчанию jemalloc


## keep_alive_timeout {#keep_alive_timeout}

<SettingsInfoBlock type='Seconds' default_value='30' />
Количество секунд, в течение которых ClickHouse ожидает входящих запросов по протоколу HTTP перед закрытием соединения.

**Пример**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```


## keeper_hosts {#keeper_hosts}

Динамическая настройка. Содержит набор хостов [Zoo]Keeper, к которым ClickHouse может подключиться. Не раскрывает информацию из `<auxiliary_zookeepers>`


## keeper_multiread_batch_size {#keeper_multiread_batch_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
Максимальный размер пакета для запроса MultiRead к [Zoo]Keeper, который поддерживает
пакетную обработку. Если установлено значение 0, пакетная обработка отключается. Доступно только в ClickHouse Cloud.


## ldap_servers {#ldap_servers}

Укажите здесь LDAP-серверы с параметрами подключения для:

- использования в качестве аутентификаторов для выделенных локальных пользователей, у которых указан механизм аутентификации 'ldap' вместо 'password'
- использования в качестве удалённых каталогов пользователей.

Следующие настройки можно задать с помощью вложенных тегов:

| Настройка                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `host`                         | Имя хоста или IP-адрес LDAP-сервера. Этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                                                                                                               |
| `port`                         | Порт LDAP-сервера. По умолчанию 636, если `enable_tls` установлен в true, иначе `389`.                                                                                                                                                                                                                                                                                                                                                          |
| `bind_dn`                      | Шаблон для построения DN для привязки. Результирующий DN будет построен путём замены всех подстрок `\{user_name\}` в шаблоне на фактическое имя пользователя при каждой попытке аутентификации.                                                                                                                                                                                                               |
| `user_dn_detection`            | Секция с параметрами поиска LDAP для определения фактического DN привязанного пользователя. Используется в основном в фильтрах поиска для дальнейшего сопоставления ролей, когда сервером является Active Directory. Результирующий DN пользователя будет использоваться при замене подстрок `\{user_dn\}` везде, где они разрешены. По умолчанию DN пользователя устанавливается равным DN привязки, но после выполнения поиска он будет обновлён до фактического обнаруженного значения DN пользователя. |
| `verification_cooldown`        | Период времени в секундах после успешной попытки привязки, в течение которого пользователь будет считаться успешно аутентифицированным для всех последующих запросов без обращения к LDAP-серверу. Укажите `0` (по умолчанию) для отключения кэширования и принудительного обращения к LDAP-серверу при каждом запросе аутентификации.                                                                                                                    |
| `enable_tls`                   | Флаг для включения защищённого соединения с LDAP-сервером. Укажите `no` для протокола открытого текста (`ldap://`) (не рекомендуется). Укажите `yes` для протокола LDAP over SSL/TLS (`ldaps://`) (рекомендуется, по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (протокол открытого текста (`ldap://`), обновлённый до TLS).                                                                                                                 |
| `tls_minimum_protocol_version` | Минимальная версия протокола SSL/TLS. Допустимые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (по умолчанию).                                                                                                                                                                                                                                                                                                                  |
| `tls_require_cert`             | Поведение проверки сертификата узла SSL/TLS. Допустимые значения: `never`, `allow`, `try`, `demand` (по умолчанию).                                                                                                                                                                                                                                                                                                                      |
| `tls_cert_file`                | Путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                  |
| `tls_key_file`                 | Путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                                                                                              |
| `tls_ca_cert_file`             | Путь к файлу сертификата CA.                                                                                                                                                                                                                                                                                                                                                                                                               |
| `tls_ca_cert_dir`              | Путь к каталогу, содержащему сертификаты CA.                                                                                                                                                                                                                                                                                                                                                                                          |
| `tls_cipher_suite`             | Разрешённый набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                |

Настройка `user_dn_detection` может быть задана с помощью вложенных тегов:

| Настройка         | Описание                                                                                                                                                                                                                                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base_dn`       | Шаблон для построения базового DN для поиска LDAP. Результирующий DN будет построен путём замены всех подстрок `\{user_name\}` и '\{bind_dn\}' в шаблоне на фактическое имя пользователя и DN привязки во время поиска LDAP.                                                                                                                                                                                        |
| `scope`         | Область поиска LDAP. Допустимые значения: `base`, `one_level`, `children`, `subtree` (по умолчанию).                                                                                                                                                                                                                                            |
| `search_filter` | Шаблон для построения фильтра поиска для поиска LDAP. Результирующий фильтр будет построен путём замены всех подстрок `\{user_name\}`, `\{bind_dn\}` и `\{base_dn\}` в шаблоне на фактическое имя пользователя, DN привязки и базовый DN во время поиска LDAP. Обратите внимание, что специальные символы должны быть правильно экранированы в XML. |

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

Пример (типичная конфигурация Active Directory с настроенным определением DN пользователя для последующего сопоставления ролей):

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


## listen_backlog {#listen_backlog}

Backlog (размер очереди ожидающих соединений) сокета прослушивания. Значение по умолчанию `4096` соответствует значению в Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не требует изменения, так как:

- Значение по умолчанию достаточно велико,
- Для приёма клиентских соединений сервер использует отдельный поток.

Таким образом, даже если значение `TcpExtListenOverflows` (из `nstat`) отлично от нуля и этот счётчик растёт для сервера ClickHouse, это не означает, что данное значение необходимо увеличивать, так как:

- Обычно, если `4096` недостаточно, это указывает на внутреннюю проблему масштабирования ClickHouse, поэтому лучше сообщить об этом.
- Это не означает, что сервер сможет обработать больше соединений позже (и даже если бы мог, к тому моменту клиенты могут уже отключиться).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```


## listen_host {#listen_host}

Ограничение на хосты, с которых могут поступать запросы. Если необходимо, чтобы сервер принимал запросы со всех хостов, укажите `::`.

Примеры:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## listen_reuse_port {#listen_reuse_port}

Позволяет нескольким серверам прослушивать один и тот же адрес:порт. Запросы будут направляться операционной системой на случайный сервер. Не рекомендуется включать эту настройку.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

По умолчанию:


## listen_try {#listen_try}

Сервер не завершит работу, если сети IPv6 или IPv4 недоступны при попытке начать прослушивание.

**Пример**

```xml
<listen_try>0</listen_try>
```


## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size}

<SettingsInfoBlock type='UInt64' default_value='50' />
Размер фонового пула потоков для загрузки засечек


## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
Количество задач, которые можно добавить в очередь пула предварительной загрузки


## logger {#logger}

Расположение и формат сообщений журнала.

**Ключи**:

| Ключ                   | Описание                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `level`                | Уровень журналирования. Допустимые значения: `none` (отключить журналирование), `fatal`, `critical`, `error`, `warning`, `notice`, `information`, `debug`, `trace`, `test` |
| `log`                  | Путь к файлу журнала.                                                                                                                                              |
| `errorlog`             | Путь к файлу журнала ошибок.                                                                                                                                       |
| `size`                 | Политика ротации: максимальный размер файлов журнала в байтах. Когда размер файла журнала превышает этот порог, он переименовывается и архивируется, после чего создается новый файл журнала. |
| `count`                | Политика ротации: максимальное количество исторических файлов журнала, которые хранятся в ClickHouse.                                                              |
| `stream_compress`      | Сжимать сообщения журнала с использованием LZ4. Установите значение `1` или `true` для включения.                                                                  |
| `console`              | Включить журналирование в консоль. Установите значение `1` или `true` для включения. По умолчанию `1`, если ClickHouse не работает в режиме демона, иначе `0`.    |
| `console_log_level`    | Уровень журналирования для вывода в консоль. По умолчанию соответствует значению `level`.                                                                          |
| `formatting.type`      | Формат журнала для вывода в консоль. В настоящее время поддерживается только `json`.                                                                               |
| `use_syslog`           | Также перенаправлять вывод журнала в syslog.                                                                                                                       |
| `syslog_level`         | Уровень журналирования для записи в syslog.                                                                                                                        |
| `async`                | Если установлено значение `true` (по умолчанию), журналирование будет выполняться асинхронно (один фоновый поток на канал вывода). В противном случае запись будет выполняться внутри потока, вызывающего LOG. |
| `async_queue_max_size` | При использовании асинхронного журналирования — максимальное количество сообщений, которые будут храниться в очереди в ожидании записи. Дополнительные сообщения будут отброшены. |
| `startup_level`        | Уровень запуска используется для установки уровня корневого логгера при запуске сервера. После запуска уровень журналирования возвращается к значению параметра `level`. |
| `shutdown_level`       | Уровень завершения используется для установки уровня корневого логгера при завершении работы сервера.                                                              |

**Спецификаторы формата журнала**

Имена файлов в путях `log` и `errorLog` поддерживают следующие спецификаторы формата для результирующего имени файла (часть пути с директорией их не поддерживает).

Столбец «Example» показывает вывод на момент `2023-07-06 18:32:07`.


| Спецификатор | Описание                                                                                                                                                                                 | Пример                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `%%`         | Литерал %                                                                                                                                                                                | `%`                        |
| `%n`         | Символ перевода строки                                                                                                                                                                   |                            |
| `%t`         | Символ горизонтальной табуляции                                                                                                                                                          |                            |
| `%Y`         | Год как десятичное число, например 2017                                                                                                                                                  | `2023`                     |
| `%y`         | Две последние цифры года в виде десятичного числа (диапазон [00, 99])                                                                                                                    | `23`                       |
| `%C`         | Первые две цифры года в виде десятичного числа (диапазон [00, 99])                                                                                                                       | `20`                       |
| `%G`         | Четырёхзначный [недельный год по ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т. е. год, который содержит указанную неделю. Обычно используется только совместно с `%V` | `2023`                     |
| `%g`         | Последние 2 цифры [недельного года по ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), то есть года, в который входит указанная неделя.                                     | `23`                       |
| `%b`         | Сокращённое название месяца, например Oct (в зависимости от локали)                                                                                                                      | `июл`                      |
| `%h`         | Синоним для %b                                                                                                                                                                           | `Jul`                      |
| `%B`         | Полное название месяца, например «октябрь» (зависит от локали)                                                                                                                           | `Июль`                     |
| `%m`         | Месяц в виде десятичного числа (диапазон [01, 12])                                                                                                                                       | `07`                       |
| `%U`         | Неделя года как десятичное число (воскресенье — первый день недели) (диапазон [00,53])                                                                                                   | `27`                       |
| `%W`         | Номер недели года как десятичное число (понедельник — первый день недели) (диапазон [00, 53])                                                                                            | `27`                       |
| `%V`         | Номер недели по стандарту ISO 8601 (диапазон [01,53])                                                                                                                                    | `27`                       |
| `%j`         | День года в виде десятичного числа (диапазон [001, 366])                                                                                                                                 | `187`                      |
| `%d`         | День месяца в виде десятичного числа с ведущим нулём (диапазон [01,31]). Однозначные числа дополняются ведущим нулём.                                                                    | `06`                       |
| `%e`         | День месяца в виде десятичного числа с заполнением слева пробелом (диапазон [1,31]). Одноразрядное число дополняется слева пробелом.                                                     | `&nbsp; 6`                 |
| `%a`         | Сокращённое название дня недели, например «Fri» (зависит от локали)                                                                                                                      | `Чт`                       |
| `%A`         | Полное название дня недели, например «Friday» (зависит от локали).                                                                                                                       | `четверг`                  |
| `%w`         | День недели как целое число, где воскресенье соответствует 0 (диапазон [0–6])                                                                                                            | `4`                        |
| `%u`         | День недели в виде десятичного числа, где понедельник — 1 (формат ISO 8601, диапазон [1–7])                                                                                              | `4`                        |
| `%H`         | Час в виде десятичного числа, в 24-часовом формате (диапазон [00–23])                                                                                                                    | `18`                       |
| `%I`         | Час в виде десятичного числа, 12-часовой формат времени (диапазон [01, 12])                                                                                                              | `06`                       |
| `%M`         | Минута в виде десятичного числа (в диапазоне [00, 59])                                                                                                                                   | `32`                       |
| `%S`         | Секунда в виде десятичного числа (в диапазоне [00,60])                                                                                                                                   | `07`                       |
| `%c`         | Стандартная строка даты и времени, например: Sun Oct 17 04:41:13 2010 (формат зависит от локали)                                                                                         | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованное представление даты (зависящее от локали)                                                                                                                                  | `06.07.23`                 |
| `%X`         | Локализованное отображение времени, например 18:40:20 или 6:40:20 PM (в зависимости от локали)                                                                                           | `18:32:07`                 |
| `%D`         | Краткий формат даты MM/DD/YY, эквивалентный %m/%d/%y                                                                                                                                     | `07/06/23`                 |
| `%F`         | Краткий формат даты YYYY-MM-DD, эквивалентен %Y-%m-%d                                                                                                                                    | `2023-07-06`               |
| `%r`         | Локализованное время в 12-часовом формате (зависит от локали)                                                                                                                            | `18:32:07`                 |
| `%R`         | Эквивалент формату &quot;%H:%M&quot;                                                                                                                                                     | `18:32`                    |
| `%T`         | Эквивалентно «%H:%M:%S» (формат времени ISO 8601)                                                                                                                                        | `18:32:07`                 |
| `%p`         | Локализованное обозначение «a.m.» или «p.m.» (в зависимости от локали)                                                                                                                   | `PM`                       |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430) или пустая строка, если сведения о часовом поясе недоступны                                                                         | `+0800`                    |
| `%Z`         | Зависящее от локали название или аббревиатура часового пояса, либо пустая строка, если информация о часовом поясе недоступна                                                             | `Z AWST `                  |

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

Чтобы выводить сообщения лога только в консоль:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**Переопределение уровней для отдельных логгеров**

Уровни логирования отдельных логгеров можно переопределять. Например, чтобы отключить все сообщения логгеров «Backup» и «RBAC».

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

Чтобы также записывать сообщения журнала в syslog:

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

| Ключ       | Описание                                                                                                                                                                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | Адрес syslog в формате `host\[:port\]`. Если не указан, используется локальный демон.                                                                                                                                                                                                    |
| `hostname` | Имя хоста, с которого отправляются логи (необязательно).                                                                                                                                                                                                                                 |
| `facility` | [Ключевое слово facility](https://en.wikipedia.org/wiki/Syslog#Facility) для syslog. Должно указываться заглавными буквами с префиксом &quot;LOG&#95;&quot;, например `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т. д. По умолчанию: `LOG_USER`, если задан `address`, иначе `LOG_DAEMON`. |
| `format`   | Формат сообщения журнала. Допустимые значения: `bsd` и `syslog`.                                                                                                                                                                                                                         |

**Форматы журналов**

Вы можете указать формат журнала, который будет выводиться в консольный лог. В настоящий момент поддерживается только JSON.

**Пример**

Ниже приведён пример выходного JSON-журнала:

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

Чтобы включить поддержку логирования в формате JSON, используйте следующий фрагмент:

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- Может быть настроено для каждого канала отдельно (log, errorlog, console, syslog) или глобально для всех каналов (в этом случае просто не указывайте этот параметр). -->
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

**Переименование ключей для JSON‑логов**

Имена ключей можно изменить, изменив значения тегов внутри тега `<names>`. Например, чтобы заменить `DATE_TIME` на `MY_DATE_TIME`, можно использовать `<date_time>MY_DATE_TIME</date_time>`.

**Пропуск ключей для JSON‑логов**

Свойства лога можно исключить, закомментировав соответствующее свойство. Например, если вы не хотите, чтобы лог выводил `query_id`, вы можете закомментировать тег `<query_id>`.


## macros {#macros}

Подстановка параметров для реплицируемых таблиц.

Можно не указывать, если реплицируемые таблицы не используются.

Подробнее см. раздел [Создание реплицируемых таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```


## mark_cache_policy {#mark_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
Имя политики кэша меток.


## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio}

<SettingsInfoBlock type='Double' default_value='0.95' />
Доля от общего размера кэша меток, заполняемая во время предварительного прогрева.


## mark_cache_size {#mark_cache_size}

<SettingsInfoBlock type='UInt64' default_value='5368709120' />
Максимальный размер кеша для засечек (индекса
семейства таблиц [`MergeTree`](/engines/table-engines/mergetree-family)).

:::note
Эту настройку можно изменить во время работы, изменения вступят в силу немедленно.
:::


## mark_cache_size_ratio {#mark_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
Размер защищённой очереди (при использовании политики SLRU) в кеше меток
относительно общего размера кеша.


## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='64' />
Количество потоков для загрузки активного набора кусков данных при запуске.


## max_authentication_methods_per_user {#max_authentication_methods_per_user}

<SettingsInfoBlock type='UInt64' default_value='100' />
Максимальное количество методов аутентификации, с которыми может быть создан или изменён пользователь. Изменение этой настройки не влияет на существующих пользователей. Запросы CREATE/ALTER, связанные с аутентификацией, завершатся ошибкой при превышении лимита, указанного в этой настройке. Запросы CREATE/ALTER, не связанные с аутентификацией, будут выполнены успешно.

:::note
Значение `0` означает отсутствие ограничений.
:::


## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальная скорость чтения в байтах в секунду для всех резервных копий на сервере. Ноль означает отсутствие ограничений.


## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
Если количество **простаивающих** потоков в пуле потоков ввода-вывода для резервного копирования превышает
`max_backup_io_thread_pool_free_size`, ClickHouse освободит ресурсы,
занимаемые простаивающими потоками, и уменьшит размер пула. При необходимости потоки могут быть созданы
заново.


## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='1000' />
ClickHouse использует потоки из пула потоков ввода-вывода резервного копирования (Backups IO Thread pool) для выполнения операций ввода-вывода при резервном копировании в S3. Параметр `max_backups_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.


## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='16' />
Максимальное количество потоков, используемых для построения векторных индексов.

:::note
Значение `0` означает использование всех ядер процессора.
:::


## max_concurrent_insert_queries {#max_concurrent_insert_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />
Ограничение на общее количество одновременных запросов INSERT.

:::note

Значение `0` (по умолчанию) означает отсутствие ограничений.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно. Уже выполняющиеся запросы останутся без изменений.
:::


## max_concurrent_queries {#max_concurrent_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />
Ограничение на общее количество одновременно выполняемых запросов. Обратите внимание, что также необходимо учитывать ограничения на
запросы `INSERT` и `SELECT`, а также на максимальное количество запросов для пользователей.

См. также:

- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

Значение `0` (по умолчанию) означает отсутствие ограничений.

Эта настройка может быть изменена во время выполнения и вступит в силу немедленно. Уже выполняющиеся запросы останутся без изменений.
:::


## max_concurrent_select_queries {#max_concurrent_select_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />
Ограничение на общее количество одновременно выполняемых запросов SELECT.

:::note

Значение `0` (по умолчанию) означает отсутствие ограничений.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно. Уже выполняющиеся запросы останутся без изменений.
:::


## max_connections {#max_connections}

<SettingsInfoBlock type='Int32' default_value='4096' />
Максимальное количество подключений к серверу.


## max_database_num_to_throw {#max_database_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
Если количество баз данных превышает это значение, сервер выдаст
исключение. 0 означает отсутствие ограничения.


## max_database_num_to_warn {#max_database_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='1000' />
Если количество подключённых баз данных превышает указанное значение, сервер ClickHouse
добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```


## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size}

<SettingsInfoBlock type='UInt32' default_value='1' />
Количество потоков для создания таблиц при восстановлении реплики в
DatabaseReplicated. Значение 0 означает, что количество потоков равно количеству ядер процессора.


## max_dictionary_num_to_throw {#max_dictionary_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
Если количество словарей превышает данное значение, сервер выдаст
исключение.

Учитываются только таблицы для следующих движков баз данных:

- Atomic
- Ordinary
- Replicated
- Lazy

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```


## max_dictionary_num_to_warn {#max_dictionary_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='1000' />
Если количество подключенных словарей превышает указанное значение, сервер ClickHouse
добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```


## max_distributed_cache_read_bandwidth_for_server {#max_distributed_cache_read_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальная суммарная скорость чтения из распределённого кеша на сервере в байтах в секунду. Ноль означает отсутствие ограничений.


## max_distributed_cache_write_bandwidth_for_server {#max_distributed_cache_write_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальная общая скорость записи в распределённый кеш на сервере в байтах в секунду. Ноль означает неограниченную скорость.


## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats}

<SettingsInfoBlock type='UInt64' default_value='10000' />
Максимальное количество записей в статистике хеш-таблицы, собираемой в процессе агрегации


## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='64' />
Количество потоков для выполнения запроса ALTER TABLE FETCH PARTITION.


## max_format_parsing_thread_pool_free_size {#max_format_parsing_thread_pool_free_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальное количество простаивающих резервных потоков, которые следует сохранять в пуле потоков для разбора
входных данных.


## max_format_parsing_thread_pool_size {#max_format_parsing_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='100' />
Максимальное общее количество потоков для разбора входных данных.


## max_io_thread_pool_free_size {#max_io_thread_pool_free_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
Если количество **неактивных** потоков в пуле потоков ввода-вывода превышает
`max_io_thread_pool_free_size`, ClickHouse освободит занятые ими
ресурсы и уменьшит размер пула. При необходимости потоки могут быть созданы заново.


## max_io_thread_pool_size {#max_io_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='100' />
ClickHouse использует потоки из пула потоков ввода-вывода для выполнения операций ввода-вывода (например,
для взаимодействия с S3). Параметр `max_io_thread_pool_size` ограничивает максимальное количество
потоков в пуле.


## max_keep_alive_requests {#max_keep_alive_requests}

<SettingsInfoBlock type='UInt64' default_value='10000' />
Максимальное количество запросов через одно постоянное соединение (keep-alive), после которого оно будет закрыто сервером ClickHouse.

**Пример**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```


## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальная скорость локального чтения в байтах в секунду.

:::note
Значение `0` означает неограниченную скорость.
:::


## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальная скорость локальной записи в байтах в секунду.

:::note
Значение `0` означает отсутствие ограничения.
:::


## max_materialized_views_count_for_table {#max_materialized_views_count_for_table}

<SettingsInfoBlock type='UInt64' default_value='0' />Ограничение на количество
материализованных представлений, присоединённых к таблице.

:::note
Учитываются только непосредственно зависимые представления, создание одного представления на основе другого не учитывается.
:::


## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальная скорость чтения для всех слияний на сервере в байтах в секунду. Ноль означает отсутствие ограничений.


## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальная скорость чтения для всех мутаций на сервере в байтах в секунду. Ноль означает отсутствие ограничений.


## max_named_collection_num_to_throw {#max_named_collection_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
Если количество именованных коллекций превышает это значение, сервер выдаст
исключение.

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```


## max_named_collection_num_to_warn {#max_named_collection_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='1000' />
Если количество именованных коллекций превышает указанное значение, сервер ClickHouse
добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```


## max_open_files {#max_open_files}

Максимальное количество открытых файлов.

:::note
Рекомендуется использовать эту опцию в macOS, так как функция `getrlimit()` возвращает некорректное значение.
:::

**Пример**

```xml
<max_open_files>262144</max_open_files>
```


## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection}

<SettingsInfoBlock type='Float' default_value='0' />
Максимальное соотношение между временем ожидания процессора операционной системы (метрика OSCPUWaitMicroseconds) и временем его занятости
(метрика OSCPUVirtualTimeMicroseconds), при котором рассматривается возможность разрыва соединений.
Для вычисления вероятности используется линейная интерполяция между минимальным и максимальным соотношением;
вероятность равна 1 в данной точке. Подробнее см. [Управление поведением при
перегрузке процессора сервера](/operations/settings/server-overload).


## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='32' />
Количество потоков для загрузки неактивного набора кусков данных (устаревших) при запуске.


## max_part_num_to_warn {#max_part_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='100000' />
Если количество активных частей превышает указанное значение, сервер ClickHouse
добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```


## max_partition_size_to_drop {#max_partition_size_to_drop}

<SettingsInfoBlock type='UInt64' default_value='50000000000' />
Ограничение на удаление партиций.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает [`max_partition_size_to_drop`](#max_partition_size_to_drop) (в байтах), удалить партицию с помощью запроса [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart) невозможно.
Эта настройка не требует перезапуска сервера ClickHouse для применения. Другой способ отключить ограничение — создать файл `<clickhouse-path>/flags/force_drop_table`.

:::note
Значение `0` означает, что партиции можно удалять без каких-либо ограничений.

Это ограничение не распространяется на операции DROP TABLE и TRUNCATE TABLE, см. [max_table_size_to_drop](/operations/settings/settings#max_table_size_to_drop)
:::

**Пример**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```


## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='128' />
Количество потоков для параллельного удаления неактивных частей данных.


## max_pending_mutations_execution_time_to_warn {#max_pending_mutations_execution_time_to_warn}

<SettingsInfoBlock type='UInt64' default_value='86400' />
Если время выполнения любой из ожидающих мутаций превысит указанное значение в секундах,
сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```


## max_pending_mutations_to_warn {#max_pending_mutations_to_warn}

<SettingsInfoBlock type='UInt64' default_value='500' />
Если количество ожидающих мутаций превышает указанное значение, сервер ClickHouse добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```


## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
Если количество **простаивающих** потоков в пуле потоков десериализации префиксов
превышает `max_prefixes_deserialization_thread_pool_free_size`, ClickHouse
освободит занятые ими ресурсы и уменьшит размер пула. При необходимости потоки
могут быть созданы повторно.


## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='100' />
ClickHouse использует потоки из пула потоков десериализации префиксов для
параллельного чтения метаданных столбцов и подстолбцов из префиксов файлов в
Wide-частях таблиц MergeTree. Параметр `max_prefixes_deserialization_thread_pool_size` ограничивает
максимальное количество потоков в пуле.


## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальная скорость обмена данными по сети в байтах в секунду для операций чтения.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничения.
:::


## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальная скорость обмена данными по сети в байтах в секунду для операций записи.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничения.
:::


## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальная скорость обмена данными по сети в байтах в секунду для
репликационных загрузок. Ноль означает отсутствие ограничений.


## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальная скорость обмена данными по сети в байтах в секунду для
репликационных отправок. Ноль означает отсутствие ограничений.


## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
Если количество реплицируемых таблиц превышает это значение, сервер
выдаст исключение.

Учитываются только таблицы для следующих движков баз данных:

- Atomic
- Ordinary
- Replicated
- Lazy

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```


## max_server_memory_usage {#max_server_memory_usage}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальный объем памяти, который может использовать сервер, в байтах.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается параметром `max_server_memory_usage_to_ram_ratio`.
:::

Особый случай: значение `0` (по умолчанию) означает, что сервер может использовать всю доступную память (за исключением дополнительных ограничений, накладываемых параметром `max_server_memory_usage_to_ram_ratio`).


## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio}

<SettingsInfoBlock type='Double' default_value='0.9' />
Максимальный объем памяти, который может использовать сервер, выраженный в виде доли от всей доступной памяти.

Например, значение `0.9` (по умолчанию) означает, что сервер может использовать до 90% доступной памяти.

Позволяет снизить потребление памяти на системах с ограниченным объемом памяти.
На хостах с малым объемом оперативной памяти и файла подкачки может потребоваться установить значение параметра [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) больше 1.

:::note
Максимальное потребление памяти сервером также ограничивается параметром `max_server_memory_usage`.
:::


## max_session_timeout {#max_session_timeout}

Максимальное время ожидания сеанса в секундах.

Пример:

```xml
<max_session_timeout>3600</max_session_timeout>
```


## max_table_num_to_throw {#max_table_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
Если количество таблиц превышает это значение, сервер выдаст исключение.

Следующие таблицы не учитываются:

- view
- remote
- dictionary
- system

Учитываются только таблицы для движков баз данных:

- Atomic
- Ordinary
- Replicated
- Lazy

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```


## max_table_num_to_warn {#max_table_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='5000' />
Если количество подключённых таблиц превышает указанное значение, сервер ClickHouse
добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```


## max_table_size_to_drop {#max_table_size_to_drop}

<SettingsInfoBlock type='UInt64' default_value='50000000000' />
Ограничение на удаление таблиц.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает `max_table_size_to_drop` (в байтах), её нельзя удалить с помощью запроса [`DROP`](../../sql-reference/statements/drop.md) или [`TRUNCATE`](../../sql-reference/statements/truncate.md).

:::note
Значение `0` означает, что можно удалять все таблицы без ограничений.

Эта настройка не требует перезапуска сервера ClickHouse для применения. Альтернативный способ отключить ограничение — создать файл `<clickhouse-path>/flags/force_drop_table`.
:::

**Пример**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```


## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальный объем дискового пространства, который может быть использован для внешней агрегации, соединений
или сортировки. Запросы, превышающие этот лимит, завершатся с исключением.

:::note
Значение `0` означает отсутствие ограничений.
:::

См. также:

- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)


## max_thread_pool_free_size {#max_thread_pool_free_size}

<SettingsInfoBlock type='UInt64' default_value='1000' />
Если количество **неактивных** потоков в глобальном пуле потоков превышает значение
[`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size),
то ClickHouse освобождает ресурсы, занятые некоторыми потоками, и размер пула
уменьшается. При необходимости потоки могут быть созданы повторно.

**Пример**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```


## max_thread_pool_size {#max_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
ClickHouse использует потоки из глобального пула потоков для обработки запросов. Если свободный поток для обработки запроса отсутствует, в пуле создаётся новый поток.
Параметр `max_thread_pool_size` ограничивает максимальное количество потоков в пуле.

**Пример**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```


## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size}

<SettingsInfoBlock type='UInt64' default_value='8' />
Количество потоков для загрузки неактивного набора кусков данных (неожиданных) при запуске.


## max_view_num_to_throw {#max_view_num_to_throw}

<SettingsInfoBlock type='UInt64' default_value='0' />
Если количество представлений превышает это значение, сервер выдаст
исключение.

Учитываются только таблицы для движков баз данных:

- Atomic
- Ordinary
- Replicated
- Lazy

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```


## max_view_num_to_warn {#max_view_num_to_warn}

<SettingsInfoBlock type='UInt64' default_value='10000' />
Если количество подключенных представлений превышает указанное значение, сервер ClickHouse
добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```


## max_waiting_queries {#max_waiting_queries}

<SettingsInfoBlock type='UInt64' default_value='0' />
Ограничение на общее количество одновременно ожидающих запросов. Выполнение ожидающего
запроса блокируется на время асинхронной загрузки необходимых таблиц (см.
[`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases).

:::note
Ожидающие запросы не учитываются при проверке ограничений, задаваемых следующими настройками:

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

Эта корректировка позволяет избежать превышения данных ограничений сразу после запуска сервера.
:::

:::note

Значение `0` (по умолчанию) означает отсутствие ограничения.

Эту настройку можно изменить во время работы сервера, изменения вступят в силу немедленно. Уже выполняющиеся запросы останутся без изменений.
:::


## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker}

<SettingsInfoBlock type='Bool' default_value='0' />
Определяет, должен ли фоновый обработчик памяти корректировать внутренний трекер памяти на основе информации из внешних источников, таких как jemalloc и cgroups


## memory_worker_period_ms {#memory_worker_period_ms}

<SettingsInfoBlock type='UInt64' default_value='0' />
Период срабатывания фонового процесса управления памятью, который корректирует данные трекера памяти и очищает неиспользуемые страницы при высоком потреблении памяти. Если установлено значение 0, будет использовано значение по умолчанию в зависимости от источника потребления памяти


## memory_worker_use_cgroup {#memory_worker_use_cgroup}

<SettingsInfoBlock type='Bool' default_value='1' />
Использовать информацию о текущем использовании памяти cgroup для корректировки учёта памяти.


## merge_tree {#merge_tree}

Тонкая настройка таблиц семейства [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Дополнительную информацию см. в заголовочном файле MergeTreeSettings.h.

**Пример**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```


## merge_workload {#merge_workload}

<SettingsInfoBlock type='String' default_value='default' />
Используется для управления распределением ресурсов между слияниями и другими
рабочими нагрузками. Указанное значение используется в качестве значения настройки `workload` для всех
фоновых слияний. Может быть переопределено настройкой таблицы семейства MergeTree.

**См. также**

- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)


## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit}

<SettingsInfoBlock type='UInt64' default_value='0' />
Устанавливает ограничение на объём оперативной памяти, допустимый для выполнения операций слияния и мутации. При достижении установленного ограничения ClickHouse не будет планировать новые фоновые операции слияния или мутации, но продолжит выполнение уже запланированных задач.

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```


## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
Значение `merges_mutations_memory_usage_soft_limit` по умолчанию вычисляется как
`memory_amount * merges_mutations_memory_usage_to_ram_ratio`.

**См. также:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)


## metric_log {#metric_log}

По умолчанию отключен.

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

Чтобы отключить настройку `metric_log`, создайте файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection}

<SettingsInfoBlock type='Float' default_value='0' />
Минимальное соотношение между временем ожидания процессора операционной системы (метрика OSCPUWaitMicroseconds) и временем его занятости
(метрика OSCPUVirtualTimeMicroseconds), при котором рассматривается возможность разрыва соединений.
Для вычисления вероятности используется линейная интерполяция между минимальным и максимальным соотношением;
в данной точке вероятность равна 0. Подробнее см. [Управление поведением при
перегрузке процессора сервера](/operations/settings/server-overload).


## mlock_executable {#mlock_executable}

Выполняет `mlockall` после запуска для снижения задержки первых запросов и предотвращения выгрузки исполняемого файла ClickHouse из памяти при высокой нагрузке на ввод-вывод.

:::note
Рекомендуется включить эту опцию, однако это приведет к увеличению времени запуска до нескольких секунд.
Обратите внимание, что эта настройка не будет работать без привилегии «CAP_IPC_LOCK».
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```


## mmap_cache_size {#mmap_cache_size}

<SettingsInfoBlock type='UInt64' default_value='1024' />
Эта настройка позволяет избежать частых вызовов open/close (которые являются очень затратными
из-за последующих ошибок страниц) и повторно использовать отображения из нескольких потоков и
запросов. Значение настройки — это количество отображённых областей (обычно равно
количеству отображённых файлов).

Объём данных в отображённых файлах можно отслеживать в следующих системных таблицах с помощью следующих метрик:

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells` in [`system.metrics`](/operations/system-tables/metrics), [`system.metric_log`](/operations/system-tables/metric_log)
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses` in [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)

:::note
Объём данных в отображённых файлах не потребляет память напрямую и не учитывается в использовании памяти запросами или сервером — поскольку эта память может быть освобождена аналогично кэшу страниц ОС. Кэш сбрасывается (файлы закрываются) автоматически при удалении старых кусков в таблицах семейства MergeTree, также его можно сбросить вручную с помощью запроса `SYSTEM DROP MMAP CACHE`.

Эта настройка может быть изменена во время работы и вступит в силу немедленно.
:::


## mutation_workload {#mutation_workload}

<SettingsInfoBlock type='String' default_value='default' />
Используется для регулирования использования и распределения ресурсов между мутациями и другими рабочими нагрузками. Указанное значение используется в качестве значения настройки `workload` для всех фоновых мутаций. Может быть переопределено настройкой таблицы семейства MergeTree.

**См. также**

- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)


## mysql_port {#mysql_port}

Порт для взаимодействия с клиентами по протоколу MySQL.

:::note

- Положительные целые числа указывают номер порта для прослушивания
- Пустые значения используются для отключения взаимодействия с клиентами по протоколу MySQL.
  :::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```


## mysql_require_secure_transport {#mysql_require_secure_transport}

Если установлено значение true, для клиентов требуется защищённое соединение через [mysql_port](#mysql_port). Подключение с параметром `--ssl-mode=none` будет отклонено. Используйте совместно с настройками [OpenSSL](#openssl).


## openSSL {#openssl}

Конфигурация SSL для клиента и сервера.

Поддержка SSL обеспечивается библиотекой `libpoco`. Доступные параметры конфигурации описаны в файле [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в файле [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи для настроек сервера и клиента:


| Опция                         | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Значение по умолчанию                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | Путь к файлу с закрытым ключом сертификата в формате PEM. Файл может одновременно содержать и ключ, и сертификат.                                                                                                                                                                                                                                                                                                                                                                                                                         |                                                                                            |
| `certificateFile`             | Путь к файлу клиентского/серверного сертификата в формате PEM. Можно опустить, если сертификат содержится в `privateKeyFile`.                                                                                                                                                                                                                                                                                                                                                                                                             |                                                                                            |
| `caConfig`                    | Путь к файлу или каталогу, содержащему доверенные сертификаты центров сертификации (ЦС). Если указывается файл, он должен быть в формате PEM и может содержать несколько сертификатов ЦС. Если указывается каталог, он должен содержать по одному файлу с расширением .pem для каждого сертификата ЦС. Имена файлов определяются по хеш-значению имени субъекта ЦС. Подробности можно найти на man-странице [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                                                                            |
| `verificationMode`            | Метод проверки сертификатов узла. Подробности — в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                                                                                                                    | `relaxed`                                                                                  |
| `verificationDepth`           | Максимальная длина цепочки проверки. Проверка завершится с ошибкой, если длина цепочки сертификатов превысит установленное значение.                                                                                                                                                                                                                                                                                                                                                                                                      | `9`                                                                                        |
| `loadDefaultCAFile`           | Будут ли использоваться встроенные корневые сертификаты удостоверяющего центра (CA) для OpenSSL. ClickHouse предполагает, что встроенные CA-сертификаты находятся в файле `/etc/ssl/cert.pem` (соответственно, в каталоге `/etc/ssl/certs`) или в файле (соответственно, каталоге), указанном в переменной окружения `SSL_CERT_FILE` (соответственно, `SSL_CERT_DIR`).                                                                                                                                                                    | `true`                                                                                     |
| `cipherList`                  | Поддерживаемые алгоритмы шифрования OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | Включает или отключает кэширование сеансов. Должен использоваться вместе с `sessionIdContext`. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                                                                    |
| `sessionIdContext`            | Уникальная последовательность случайных символов, которую сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Этот параметр рекомендуется всегда указывать, поскольку он помогает избежать проблем как при кэшировании сеанса на сервере, так и при запросе кэширования со стороны клиента.                                                                                                                                                                     | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | Максимальное число сеансов, кэшируемых сервером. Значение `0` означает, что число сеансов не ограничено.                                                                                                                                                                                                                                                                                                                                                                                                                                  | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | Время хранения сеанса в кэше на сервере (в часах).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `2`                                                                                        |
| `extendedVerification`        | Если параметр включён, проверить, что CN или SAN сертификата совпадает с именем хоста удалённого узла.                                                                                                                                                                                                                                                                                                                                                                                                                                    | `false`                                                                                    |
| `requireTLSv1`                | Требовать соединение по TLSv1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                                                                    |
| `requireTLSv1_1`              | Требовать соединение по TLSv1.1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `false`                                                                                    |
| `requireTLSv1_2`              | Требовать соединение по TLSv1.2. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `false`                                                                                    |
| `fips`                        | Активирует режим OpenSSL FIPS. Поддерживается, если используемая версия OpenSSL поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                                                                    |
| `privateKeyPassphraseHandler` | Класс (подкласс PrivateKeyPassphraseHandler), запрашивающий парольную фразу для доступа к закрытому ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                                                                                    | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | Класс (подкласс CertificateHandler), предназначенный для проверки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`.                                                                                                                                                                                                                                                                                                                              | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | Запрещённые протоколы.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |                                                                                            |
| `preferServerCiphers`         | Серверные шифры, предпочитаемые клиентом.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                                                                    |

**Пример настроек:**

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


## opentelemetry_span_log {#opentelemetry_span_log}

Настройки для системной таблицы [`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md).

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

<SettingsInfoBlock type='UInt64' default_value='1000000' />
Пороговое значение времени занятости процессора операционной системы в микросекундах (метрика OSCPUVirtualTimeMicroseconds), при превышении которого считается, что процессор выполняет полезную работу. Если время занятости ниже этого значения, перегрузка процессора не фиксируется.


## os_threads_nice_value_distributed_cache_tcp_handler {#os_threads_nice_value_distributed_cache_tcp_handler}

<SettingsInfoBlock type='Int32' default_value='0' />
Значение nice в Linux для потоков обработчика TCP распределённого кеша. Меньшие значения
соответствуют более высокому приоритету процессора.

Требуется возможность CAP_SYS_NICE, в противном случае не выполняет никаких действий.

Возможные значения: от -20 до 19.


## os_threads_nice_value_merge_mutate {#os_threads_nice_value_merge_mutate}

<SettingsInfoBlock type='Int32' default_value='0' />
Значение nice в Linux для потоков слияния и мутации. Меньшие значения соответствуют более высокому приоритету процессора.

Требуется capability CAP_SYS_NICE, в противном случае настройка не применяется.

Возможные значения: от -20 до 19.


## os_threads_nice_value_zookeeper_client_send_receive {#os_threads_nice_value_zookeeper_client_send_receive}

<SettingsInfoBlock type='Int32' default_value='0' />
Значение nice в Linux для потоков отправки и приёма в клиенте ZooKeeper. Меньшие значения
означают более высокий приоритет процессора.

Требуется привилегия CAP_SYS_NICE, в противном случае не выполняет никаких действий.

Возможные значения: от -20 до 19.


## page_cache_free_memory_ratio {#page_cache_free_memory_ratio}

<SettingsInfoBlock type='Double' default_value='0.15' />
Доля лимита памяти, которая должна оставаться свободной от пользовательского кеша страниц.
Аналогично параметру min_free_kbytes в Linux.


## page_cache_history_window_ms {#page_cache_history_window_ms}

<SettingsInfoBlock type='UInt64' default_value='1000' />
Задержка перед тем, как освобождённая память может быть использована кешем страниц в пользовательском пространстве.


## page_cache_max_size {#page_cache_max_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальный размер кэша страниц в пользовательском пространстве. Установите значение 0, чтобы отключить кэш. Если
значение больше page_cache_min_size, размер кэша будет непрерывно корректироваться
в этом диапазоне для использования максимально доступной памяти при сохранении общего
потребления памяти ниже установленного лимита (max_server_memory_usage[_to_ram_ratio]).


## page_cache_min_size {#page_cache_min_size}

<SettingsInfoBlock type='UInt64' default_value='104857600' />
Минимальный размер кеша страниц в пространстве пользователя.


## page_cache_policy {#page_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
Название политики кэша страниц пользовательского пространства.


## page_cache_shards {#page_cache_shards}

<SettingsInfoBlock type='UInt64' default_value='4' />
Распределяет кэш страниц пользовательского пространства по указанному количеству сегментов для уменьшения конкуренции за мьютексы.
Экспериментальная настройка, скорее всего не улучшит производительность.


## page_cache_size_ratio {#page_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
Размер защищённой очереди в кеше страниц пользовательского пространства относительно общего размера кеша.


## part_log {#part_log}

Журналирование событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Например, добавление или слияние данных. Журнал можно использовать для моделирования алгоритмов слияния и сравнения их характеристик. Процесс слияния можно визуализировать.

События регистрируются в таблице [system.part_log](/operations/system-tables/part_log), а не в отдельном файле. Имя этой таблицы можно настроить в параметре `table` (см. ниже).

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

<SettingsInfoBlock type='UInt64' default_value='30' />
Период полного удаления частей для SharedMergeTree. Доступно только в
ClickHouse Cloud


## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add}

<SettingsInfoBlock type='UInt64' default_value='10' />
Добавляет равномерно распределённое значение от 0 до x секунд к kill_delay_period для
предотвращения эффекта «лавинообразного запроса» и последующей DoS-атаки на ZooKeeper при очень
большом количестве таблиц. Доступно только в ClickHouse Cloud


## parts_killer_pool_size {#parts_killer_pool_size}

<SettingsInfoBlock type='UInt64' default_value='128' />
Потоки для очистки устаревших частей общего дерева слияний. Доступно только в
ClickHouse Cloud


## path {#path}

Путь к каталогу с данными.

:::note
Завершающий слеш обязателен.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```


## postgresql_port {#postgresql_port}

Порт для взаимодействия с клиентами по протоколу PostgreSQL.

:::note

- Положительные целые числа задают номер порта для прослушивания
- Пустые значения используются для отключения взаимодействия с клиентами по протоколу PostgreSQL.
  :::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```


## postgresql_require_secure_transport {#postgresql_require_secure_transport}

Если установлено значение true, для клиентов требуется защищённое соединение через [postgresql_port](#postgresql_port). Подключение с параметром `sslmode=disable` будет отклонено. Используйте совместно с настройками [OpenSSL](#openssl).


## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='100' />
Размер фонового пула потоков для предварительной загрузки данных из удалённых объектных хранилищ


## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
Количество задач, которые можно добавить в очередь пула предварительной загрузки


## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
Максимальное количество задач, которые могут быть поставлены в очередь пула потоков десериализации префиксов.

:::note
Значение `0` означает отсутствие ограничений.
:::


## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup}

<SettingsInfoBlock type='Bool' default_value='0' />
Если значение true, ClickHouse создаёт все настроенные таблицы `system.*_log` до
запуска. Это может быть полезно, если некоторые скрипты запуска зависят от этих таблиц.


## primary_index_cache_policy {#primary_index_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
Имя политики кэша первичного индекса.


## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio}

<SettingsInfoBlock type='Double' default_value='0.95' />
Доля от общего размера кэша индекса, которая заполняется во время предварительного прогрева.


## primary_index_cache_size {#primary_index_cache_size}

<SettingsInfoBlock type='UInt64' default_value='5368709120' />
Максимальный размер кеша для первичного индекса (индекс таблиц семейства MergeTree).


## primary_index_cache_size_ratio {#primary_index_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
Размер защищённой очереди (при использовании политики SLRU) в кеше первичного индекса
относительно общего размера кеша.


## process_query_plan_packet {#process_query_plan_packet}

<SettingsInfoBlock type='Bool' default_value='0' />
Эта настройка позволяет читать пакет QueryPlan. Этот пакет отправляется для
распределённых запросов при включённой настройке serialize_query_plan. По умолчанию отключена во
избежание возможных проблем безопасности, которые могут быть вызваны ошибками при бинарной
десериализации плана запроса.

**Пример**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```


## processors_profile_log {#processors_profile_log}

Настройки системной таблицы [`processors_profile_log`](../system-tables/processors_profile_log.md).

<SystemLogParameters />

Настройки по умолчанию:

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

Предоставление данных метрик для сбора сервером [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP-эндпоинт для сбора метрик сервером Prometheus. Должен начинаться с '/'.
- `port` – Порт для `endpoint`.
- `metrics` – Предоставлять метрики из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Предоставлять метрики из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Предоставлять текущие значения метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).
- `errors` – Предоставлять количество ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эту информацию также можно получить из таблицы [system.errors](/operations/system-tables/errors).

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

Проверка (замените `127.0.0.1` на IP-адрес или имя хоста вашего сервера ClickHouse):

```bash
curl 127.0.0.1:9363/metrics
```


## proxy {#proxy}

Определение прокси-серверов для HTTP и HTTPS запросов. В настоящее время поддерживается для хранилища S3, табличных функций S3 и функций URL.

Существует три способа определения прокси-серверов:

- переменные окружения
- списки прокси
- удалённые резолверы прокси.

Также поддерживается обход прокси-серверов для конкретных хостов с использованием `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать
прокси-сервер для заданного протокола. Если они установлены в вашей системе, всё должно работать без проблем.

Это самый простой подход, если для данного протокола используется
только один прокси-сервер, который не изменяется.

**Списки прокси**

Этот подход позволяет указать один или несколько
прокси-серверов для протокола. Если определено более одного прокси-сервера,
ClickHouse использует различные прокси по принципу round-robin, распределяя
нагрузку между серверами. Это самый простой подход, если для протокола используется более
одного прокси-сервера, и список прокси-серверов не изменяется.

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

| Поле      | Описание                                     |
| --------- | -------------------------------------------- |
| `<http>`  | Список из одного или нескольких HTTP прокси  |
| `<https>` | Список из одного или нескольких HTTPS прокси |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">

| Поле    | Описание           |
| ------- | ------------------ |
| `<uri>` | URI прокси-сервера |

  </TabItem>
</Tabs>

**Удалённые резолверы прокси**

Возможна ситуация, когда прокси-серверы изменяются динамически. В таком
случае можно определить конечную точку резолвера. ClickHouse отправляет
пустой GET запрос на эту конечную точку, а удалённый резолвер должен вернуть хост прокси.
ClickHouse использует его для формирования URI прокси по следующему шаблону: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

Выберите родительское поле на вкладках ниже, чтобы просмотреть его дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле      | Описание                                     |
| --------- | -------------------------------------------- |
| `<http>`  | Список из одного или нескольких резолверов\* |
| `<https>` | Список из одного или нескольких резолверов\* |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">

| Поле         | Описание                                        |
| ------------ | ----------------------------------------------- |
| `<resolver>` | Конечная точка и другие параметры для резолвера |

:::note
Можно указать несколько элементов `<resolver>`, но используется только первый
`<resolver>` для данного протокола. Любые другие элементы `<resolver>`
для этого протокола игнорируются. Это означает, что балансировка нагрузки
(при необходимости) должна быть реализована удалённым резолвером.
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| Поле                 | Описание                                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<endpoint>`         | URI резолвера прокси                                                                                                                                                                                         |
| `<proxy_scheme>`     | Протокол итогового URI прокси. Может быть либо `http`, либо `https`.                                                                                                                                        |
| `<proxy_port>`       | Номер порта резолвера прокси                                                                                                                                                                                 |
| `<proxy_cache_time>` | Время в секундах, в течение которого значения от резолвера должны кэшироваться в ClickHouse. Установка этого значения в `0` приводит к тому, что ClickHouse обращается к резолверу при каждом HTTP или HTTPS запросе. |

  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:


| Порядок | Настройка                  |
|---------|----------------------------|
| 1.      | Удалённые прокси-резолверы |
| 2.      | Списки прокси              |
| 3.      | Переменные окружения       |

ClickHouse будет проверять тип резолвера с наившим приоритетом для протокола запроса. Если он не задан,
будет проверен следующий по приоритету тип резолвера, пока не будет достигнут резолвер на основе переменных окружения.
Это также позволяет использовать комбинацию разных типов резолверов.



## query_cache {#query_cache}

Конфигурация [кеша запросов](../query-cache.md).

Доступны следующие настройки:

| Настройка                 | Описание                                                                          | Значение по умолчанию |
| ------------------------- | ------------------------------------------------------------------------------------ | ------------- |
| `max_size_in_bytes`       | Максимальный размер кеша в байтах. Значение `0` означает, что кеш запросов отключен.              | `1073741824`  |
| `max_entries`             | Максимальное количество результатов запросов `SELECT`, сохраняемых в кеше.                    | `1024`        |
| `max_entry_size_in_bytes` | Максимальный размер в байтах результатов запросов `SELECT`, которые могут быть сохранены в кеше.  | `1048576`     |
| `max_entry_size_in_rows`  | Максимальное количество строк в результатах запросов `SELECT`, которые могут быть сохранены в кеше. | `30000000`    |

:::note

- Изменения настроек вступают в силу немедленно.
- Данные кеша запросов размещаются в оперативной памяти (DRAM). При нехватке памяти рекомендуется установить небольшое значение для `max_size_in_bytes` или полностью отключить кеш запросов.
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

<SettingsInfoBlock type='String' default_value='SLRU' />
Имя политики кэширования условий запросов.


## query_condition_cache_size {#query_condition_cache_size}

<SettingsInfoBlock type='UInt64' default_value='104857600' />
Максимальный размер кэша условий запроса. :::note Эту настройку можно изменить
во время работы, изменения вступят в силу немедленно. :::


## query_condition_cache_size_ratio {#query_condition_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
Размер защищённой очереди (при использовании политики SLRU) в кеше условий запросов
относительно общего размера кеша.


## query_log {#query_log}

Настройка для журналирования запросов, полученных с параметром [log_queries=1](../../operations/settings/settings.md).

Запросы записываются в таблицу [system.query_log](/operations/system-tables/query_log), а не в отдельный файл. Имя таблицы можно изменить в параметре `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура журнала запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и автоматически создаётся новая таблица.

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


## query_masking_rules {#query_masking_rules}

Правила на основе регулярных выражений, которые применяются к запросам и всем сообщениям журналов перед их сохранением в журналы сервера,
таблицы [`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes), а также в журналы, отправляемые клиенту. Это позволяет предотвратить
утечку конфиденциальных данных из SQL-запросов, таких как имена, адреса электронной почты, персональные идентификаторы или номера кредитных карт.

**Пример**

```xml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**Поля конфигурации**:

| Параметр  | Описание                                                                                  |
| --------- | ----------------------------------------------------------------------------------------- |
| `name`    | имя правила (необязательно)                                                               |
| `regexp`  | регулярное выражение, совместимое с RE2 (обязательно)                                     |
| `replace` | строка замены для конфиденциальных данных (необязательно, по умолчанию — шесть звездочек) |

Правила маскирования применяются ко всему запросу (для предотвращения утечек конфиденциальных данных из некорректно сформированных или не поддающихся разбору запросов).

Таблица [`system.events`](/operations/system-tables/events) содержит счетчик `QueryMaskingRulesMatch`, который показывает общее количество срабатываний правил маскирования запросов.

Для распределенных запросов каждый сервер должен быть настроен отдельно, в противном случае подзапросы, передаваемые на другие
узлы, будут сохраняться без маскирования.


## query_metric_log {#query_metric_log}

По умолчанию отключён.

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

Чтобы отключить настройку `query_metric_log`, создайте файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## query_thread_log {#query_thread_log}

Настройка для логирования потоков запросов, полученных с настройкой [log_query_threads=1](/operations/settings/settings#log_query_threads).

Запросы логируются в таблицу [system.query_thread_log](/operations/system-tables/query_thread_log), а не в отдельный файл. Имя таблицы можно изменить в параметре `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура лога потоков запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и автоматически создаётся новая таблица.

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


## query_views_log {#query_views_log}

Настройка для логирования представлений (live, материализованных и т.д.), зависящих от запросов, полученных с настройкой [log_query_views=1](/operations/settings/settings#log_query_views).

Запросы логируются в таблице [system.query_views_log](/operations/system-tables/query_views_log), а не в отдельном файле. Имя таблицы можно изменить в параметре `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура журнала представлений запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и автоматически создаётся новая таблица.

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


## remap_executable {#remap_executable}

Настройка для перераспределения памяти машинного кода («text») с использованием больших страниц памяти.

:::note
Эта функция находится на экспериментальной стадии разработки.
:::

Пример:

```xml
<remap_executable>false</remap_executable>
```


## remote_servers {#remote_servers}

Конфигурация кластеров, используемых движком таблиц [Distributed](../../engines/table-engines/special/distributed.md) и табличной функцией `cluster`.

**Пример**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

Значение атрибута `incl` см. в разделе «[Конфигурационные файлы](/operations/configuration-files)».

**См. также**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Обнаружение кластеров](../../operations/cluster-discovery.md)
- [Движок баз данных Replicated](../../engines/database-engines/replicated.md)


## remote_url_allow_hosts {#remote_url_allow_hosts}

Список хостов, которые разрешено использовать в движках хранения и табличных функциях, работающих с URL.

При добавлении хоста с помощью XML-тега `\<host\>`:

- он должен быть указан точно так же, как в URL, поскольку имя проверяется до разрешения DNS. Например: `<host>clickhouse.com</host>`
- если порт явно указан в URL, то проверяется комбинация host:port целиком. Например: `<host>clickhouse.com:80</host>`
- если хост указан без порта, то разрешён любой порт этого хоста. Например: если указан `<host>clickhouse.com</host>`, то разрешены `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т. д.
- если хост указан как IP-адрес, то он проверяется в том виде, в котором указан в URL. Например: `[2a02:6b8:a::a]`.
- если есть перенаправления и поддержка перенаправлений включена, то проверяется каждое перенаправление (поле location).

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


## replica_group_name {#replica_group_name}

Имя группы реплик для реплицируемой базы данных (Replicated).

Кластер, создаваемый реплицируемой базой данных, будет состоять из реплик одной группы.
DDL-запросы будут ожидать выполнения только на репликах той же группы.

По умолчанию не задано.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```


## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout}

<SettingsInfoBlock type='Seconds' default_value='0' />
Тайм-аут HTTP-соединения для запросов на получение частей данных. Наследуется из профиля по умолчанию `http_connection_timeout`, если не установлен явно.


## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout}

<SettingsInfoBlock type='Seconds' default_value='0' />
Таймаут получения HTTP для запросов на получение частей данных. Наследуется из профиля по умолчанию `http_receive_timeout`, если не установлен явно.


## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout}

<SettingsInfoBlock type='Seconds' default_value='0' />
Таймаут отправки HTTP для запросов на получение частей данных. Наследуется из профиля по умолчанию `http_send_timeout`, если не установлен явно.


## replicated_merge_tree {#replicated_merge_tree}

Тонкая настройка для таблиц [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Эта настройка имеет более высокий приоритет.

Дополнительную информацию см. в заголовочном файле MergeTreeSettings.h.

**Пример**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```


## restore_threads {#restore_threads}

<SettingsInfoBlock type='NonZeroUInt64' default_value='16' />
Максимальное количество потоков для выполнения запросов RESTORE.


## s3_credentials_provider_max_cache_size {#s3_credentials_provider_max_cache_size}

<SettingsInfoBlock type='UInt64' default_value='100' />
Максимальное количество провайдеров учетных данных S3, которые могут быть помещены в кэш


## s3_max_redirects {#s3_max_redirects}

<SettingsInfoBlock type='UInt64' default_value='10' />
Максимальное количество разрешённых переходов по перенаправлениям S3.


## s3_retry_attempts {#s3_retry_attempts}

<SettingsInfoBlock type='UInt64' default_value='500' />
Настройка для Aws::Client::RetryStrategy. Aws::Client выполняет повторные попытки самостоятельно. Значение 0 означает отсутствие повторных попыток.


## s3queue_disable_streaming {#s3queue_disable_streaming}

<SettingsInfoBlock type='Bool' default_value='0' />
Отключает потоковую передачу данных в S3Queue, даже если таблица создана и к ней присоединены
материализованные представления


## s3queue_log {#s3queue_log}

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


## send_crash_reports {#send_crash_reports}

Настройки для отправки отчётов о сбоях команде основных разработчиков ClickHouse.

Включение этой функции, особенно в предпродакшн-окружениях, крайне приветствуется.

Ключи:

| Ключ                  | Описание                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`             | Логический флаг для включения функции, по умолчанию `true`. Установите значение `false`, чтобы отключить отправку отчётов о сбоях.         |
| `send_logical_errors` | `LOGICAL_ERROR` подобна `assert`, это ошибка в ClickHouse. Этот логический флаг включает отправку таких исключений (по умолчанию: `true`). |
| `endpoint`            | Вы можете переопределить URL конечной точки для отправки отчётов о сбоях.                                                                   |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


## series_keeper_path {#series_keeper_path}

<SettingsInfoBlock type='String' default_value='/clickhouse/series' />
Путь в Keeper с автоинкрементными номерами, генерируемыми
функцией `generateSerialID`. Каждая серия будет представлена узлом в этом пути.


## show_addresses_in_stack_traces {#show_addresses_in_stack_traces}

<SettingsInfoBlock type='Bool' default_value='1' />
Если установлено значение true, в трассировках стека будут показаны адреса


## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores}

<SettingsInfoBlock type='Bool' default_value='1' />
Если установлено значение true, ClickHouse будет ожидать завершения выполняющихся операций резервного копирования и восстановления перед завершением работы.


## shutdown_wait_unfinished {#shutdown_wait_unfinished}

<SettingsInfoBlock type='UInt64' default_value='5' />
Задержка в секундах для ожидания завершения незавершённых запросов


## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries}

<SettingsInfoBlock type='Bool' default_value='0' />
Если установлено значение true, ClickHouse будет ожидать завершения выполняющихся запросов перед остановкой.


## skip_binary_checksum_checks {#skip_binary_checksum_checks}

<SettingsInfoBlock type='Bool' default_value='0' />
Пропускает проверки целостности контрольных сумм бинарных файлов ClickHouse


## ssh_server {#ssh_server}

Публичная часть ключа хоста будет записана в файл known_hosts
на стороне SSH-клиента при первом подключении.

Конфигурации ключей хоста по умолчанию неактивны.
Раскомментируйте конфигурации ключей хоста и укажите путь к соответствующему SSH-ключу, чтобы активировать их:

Пример:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```


## startup_mv_delay_ms {#startup_mv_delay_ms}

<SettingsInfoBlock type='UInt64' default_value='0' />
Отладочный параметр для имитации задержки при создании материализованного представления


## storage_configuration {#storage_configuration}

Позволяет настроить многодисковую конфигурацию хранилища.

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

Конфигурация `disks` имеет следующую структуру:

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

Указанные выше подтеги определяют следующие параметры для `disks`:

| Параметр                | Описание                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `<disk_name_N>`         | Имя диска, которое должно быть уникальным.                                                            |
| `path`                  | Путь, по которому будут храниться данные сервера (каталоги `data` и `shadow`). Должен заканчиваться на `/` |
| `keep_free_space_bytes` | Размер зарезервированного свободного пространства на диске.                                           |

:::note
Порядок дисков не имеет значения.
:::

### Конфигурация политик {#configuration-of-policies}

Указанные выше подтеги определяют следующие параметры для `policies`:


| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `volume_name_N`              | Имя тома. Имена томов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `disk`                       | Диск, входящий в состав тома.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `max_data_part_size_bytes`   | Максимальный размер части данных, которая может находиться на любом из дисков в этом томе. Если ожидаемый размер результата слияния превышает `max_data_part_size_bytes`, часть данных будет записана в следующий том. По сути, эта возможность позволяет хранить новые/маленькие части данных на «горячем» томе (SSD) и перемещать их на «холодный» том (HDD), когда они достигают большого размера. Не используйте эту опцию, если в политике только один том.                                          |
| `move_factor`                | Доля доступного свободного места на томе. Если свободного места становится меньше, данные начинают переноситься на следующий том (если он есть). Для переноса части данных сортируются по размеру от большего к меньшему (по убыванию) и выбираются те, суммарный размер которых достаточен для выполнения условия `move_factor`; если суммарный размер всех частей данных недостаточен, будут перенесены все части.                                                                                              |
| `perform_ttl_move_on_insert` | Отключает перенос данных с истекшим TTL при вставке. По умолчанию (если включено), если вставляется часть данных, которая уже просрочена в соответствии с правилом переноса по времени жизни, она немедленно переносится на том/диск, указанный в правиле переноса. Это может значительно замедлить вставку, если целевой том/диск медленный (например, S3). Если отключено, просроченная часть данных записывается на том по умолчанию и затем сразу же переносится на том, указанный в правиле для истекшего TTL. |
| `load_balancing`             | Политика балансировки нагрузки на диски: `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `least_used_ttl_ms`          | Устанавливает тайм-аут (в миллисекундах) для обновления информации о доступном пространстве на всех дисках (`0` — всегда обновлять, `-1` — никогда не обновлять, значение по умолчанию — `60000`). Обратите внимание: если диск используется только ClickHouse и на нём не планируется динамическое изменение размера файловой системы, можно использовать значение `-1`. Во всех остальных случаях это не рекомендуется, так как в конечном итоге приведёт к некорректному распределению пространства.          |
| `prefer_not_to_merge`        | Отключает слияние частей данных на этом томе. Примечание: это потенциально вредно и может привести к замедлению. Когда этот параметр включён (не делайте так), слияние данных на этом томе запрещено (что плохо). Это позволяет управлять тем, как ClickHouse взаимодействует с медленными дисками. Мы рекомендуем вообще не использовать этот параметр.                                                                                                                                            |
| `volume_priority`            | Определяет приоритет (порядок), в котором заполняются тома. Чем меньше значение, тем выше приоритет. Значения параметра должны быть натуральными числами и непрерывно покрывать диапазон от 1 до N (где N — наибольшее указанное значение параметра) без пропусков.                                                                                                                                                                                                                                           |

Для параметра `volume_priority`:
- Если параметр задан для всех томов, они заполняются в указанном порядке приоритетов.
- Если параметр задан только для _некоторых_ томов, тома без параметра получают наименьший приоритет. Тома с заданным параметром упорядочиваются по его значению, а приоритет остальных определяется их порядком в конфигурационном файле по отношению друг к другу.
- Если параметр _не_ задан ни для одного тома, порядок их использования определяется порядком описания в конфигурационном файле.
- Приоритеты томов могут отличаться друг от друга.



## storage_connections_soft_limit {#storage_connections_soft_limit}

<SettingsInfoBlock type='UInt64' default_value='100' />
Соединения сверх этого лимита имеют значительно меньшее время жизни. Лимит
применяется к соединениям с хранилищами.


## storage_connections_store_limit {#storage_connections_store_limit}

<SettingsInfoBlock type='UInt64' default_value='5000' />
Соединения сверх этого лимита сбрасываются после использования. Установите значение 0, чтобы отключить кэш соединений. Лимит применяется к соединениям хранилищ.


## storage_connections_warn_limit {#storage_connections_warn_limit}

<SettingsInfoBlock type='UInt64' default_value='1000' />
Предупреждающие сообщения записываются в журнал, если количество активных соединений
превышает этот лимит. Лимит применяется к соединениям с хранилищами.


## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key}

<SettingsInfoBlock type='Bool' default_value='1' />
Записывать файлы метаданных диска в формате VERSION_FULL_OBJECT_KEY. По умолчанию включена. Настройка устарела.


## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid}

<SettingsInfoBlock type='Bool' default_value='1' />
Если включено, при создании SharedSet и SharedJoin генерируется внутренний UUID. Только ClickHouse Cloud


## table_engines_require_grant {#table_engines_require_grant}

Если установлено значение true, для создания таблицы с определённым движком пользователям требуется соответствующее разрешение, например `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию для обратной совместимости при создании таблицы с определённым движком разрешения не проверяются, однако это поведение можно изменить, установив данный параметр в true.
:::


## tables_loader_background_pool_size {#tables_loader_background_pool_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
Задает количество потоков, выполняющих задачи асинхронной загрузки в фоновом пуле.
Фоновый пул используется для асинхронной загрузки таблиц после запуска сервера
в случае отсутствия запросов, ожидающих загрузки таблицы. Может быть полезно
поддерживать небольшое количество потоков в фоновом пуле при наличии большого количества таблиц. Это
позволит зарезервировать ресурсы CPU для параллельного выполнения запросов.

:::note
Значение `0` означает, что будут использованы все доступные CPU.
:::


## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
Задаёт количество потоков, выполняющих задачи загрузки в приоритетном пуле. Приоритетный пул используется для синхронной загрузки таблиц перед началом прослушивания портов сервером, а также для загрузки таблиц, ожидающих обработки. Приоритетный пул имеет более высокий приоритет, чем фоновый пул. Это означает, что задачи в фоновом пуле не запускаются, пока выполняются задачи в приоритетном пуле.

:::note
Значение `0` означает, что будут использованы все доступные процессоры.
:::


## tcp_close_connection_after_queries_num {#tcp_close_connection_after_queries_num}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальное количество запросов, допустимых для одного TCP-соединения перед его закрытием. Установите значение 0 для снятия ограничения на количество запросов.


## tcp_close_connection_after_queries_seconds {#tcp_close_connection_after_queries_seconds}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальное время жизни TCP-соединения в секундах перед его закрытием. Установите значение 0 для неограниченного времени жизни соединения.


## tcp_port {#tcp_port}

Порт для взаимодействия с клиентами по протоколу TCP.

**Пример**

```xml
<tcp_port>9000</tcp_port>
```


## tcp_port_secure {#tcp_port_secure}

TCP-порт для защищённого соединения с клиентами. Используется с настройками [OpenSSL](#openssl).

**Значение по умолчанию**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```


## tcp_ssh_port {#tcp_ssh_port}

Порт для SSH-сервера, который позволяет пользователю подключаться и выполнять запросы в интерактивном режиме с использованием встроенного клиента через PTY.

Пример:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


## temporary_data_in_cache {#temporary_data_in_cache}

При использовании этой опции временные данные будут храниться в кеше конкретного диска.
В этом разделе необходимо указать имя диска с типом `cache`.
В таком случае кеш и временные данные будут совместно использовать одно и то же пространство, при этом данные из кеша диска могут быть вытеснены для размещения временных данных.

:::note
Для настройки хранилища временных данных может использоваться только одна из опций: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
:::

**Пример**

Кеш для `local_disk` и временные данные будут храниться в `/tiny_local_cache` в файловой системе под управлением `tiny_local_cache`.

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

<SettingsInfoBlock type='Bool' default_value='0' />
Сохранять временные данные в распределённом кеше.


## text_index_dictionary_block_cache_max_entries {#text_index_dictionary_block_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
Размер кэша для блоков словаря текстового индекса в записях. Ноль означает отключено.


## text_index_dictionary_block_cache_policy {#text_index_dictionary_block_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
Имя политики кэширования блоков словаря текстового индекса.


## text_index_dictionary_block_cache_size {#text_index_dictionary_block_cache_size}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />
Размер кэша для блоков словаря текстового индекса. Нулевое значение отключает кэш.

:::note
Эту настройку можно изменить во время работы, изменения вступят в силу немедленно.
:::


## text_index_dictionary_block_cache_size_ratio {#text_index_dictionary_block_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
Размер защищённой очереди (в случае политики SLRU) в кеше блоков словаря текстового индекса относительно общего размера кеша.


## text_index_header_cache_max_entries {#text_index_header_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='100000' />
Размер кэша заголовков текстовых индексов в записях. Ноль означает отключено.


## text_index_header_cache_policy {#text_index_header_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
Имя политики кэша заголовков текстового индекса.


## text_index_header_cache_size {#text_index_header_cache_size}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />
Размер кэша для заголовков текстовых индексов. Нулевое значение отключает кэш.

:::note
Эту настройку можно изменить во время работы, изменения вступят в силу немедленно.
:::


## text_index_header_cache_size_ratio {#text_index_header_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
Размер защищённой очереди (при использовании политики SLRU) в кеше заголовков текстового индекса относительно общего размера кеша.


## text_index_postings_cache_max_entries {#text_index_postings_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
Размер кэша для списка постингов текстового индекса в количестве записей. Ноль означает отключено.


## text_index_postings_cache_policy {#text_index_postings_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
Название политики кэша списка постингов текстового индекса.


## text_index_postings_cache_size {#text_index_postings_cache_size}

<SettingsInfoBlock type='UInt64' default_value='2147483648' />
Размер кэша для списков постингов текстового индекса. Значение 0 означает отключение.

:::note
Эту настройку можно изменить во время выполнения, изменения вступят в силу немедленно.
:::


## text_index_postings_cache_size_ratio {#text_index_postings_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
Размер защищённой очереди (при использовании политики SLRU) в кэше списка постингов текстового индекса относительно общего размера кэша.


## text_log {#text_log}

Настройки системной таблицы [text_log](/operations/system-tables/text_log) для журналирования текстовых сообщений.

<SystemLogParameters />

Дополнительно:

| Настройка | Описание                                                                 | Значение по умолчанию |
| ------- | --------------------------------------------------------------------------- | ------------- |
| `level` | Максимальный уровень сообщений (по умолчанию `Trace`), которые будут сохраняться в таблице. | `Trace`       |

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


## thread_pool_queue_size {#thread_pool_queue_size}

<SettingsInfoBlock type='UInt64' default_value='10000' />
Максимальное количество задач, которые могут быть запланированы в глобальном пуле потоков.
Увеличение размера очереди приводит к увеличению потребления памяти. Рекомендуется устанавливать
это значение равным
[`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size).

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```


## threadpool_local_fs_reader_pool_size {#threadpool_local_fs_reader_pool_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='100' />
Количество потоков в пуле потоков для чтения из локальной файловой системы при
`local_filesystem_read_method = 'pread_threadpool'`.


## threadpool_local_fs_reader_queue_size {#threadpool_local_fs_reader_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
Максимальное количество задач, которые могут быть запланированы в пуле потоков для чтения из локальной файловой системы.


## threadpool_remote_fs_reader_pool_size {#threadpool_remote_fs_reader_pool_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='250' />
Количество потоков в пуле потоков, используемых для чтения из удалённой файловой системы
при `remote_filesystem_read_method = 'threadpool'`.


## threadpool_remote_fs_reader_queue_size {#threadpool_remote_fs_reader_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
Максимальное количество задач, которые могут быть запланированы в пуле потоков для чтения из удалённой файловой системы.


## threadpool_writer_pool_size {#threadpool_writer_pool_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='100' />
Размер фонового пула для запросов записи в объектные хранилища


## threadpool_writer_queue_size {#threadpool_writer_queue_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />
Количество задач, которые можно добавить в фоновый пул для обработки запросов на запись
в объектные хранилища


## throw_on_unknown_workload {#throw_on_unknown_workload}

<SettingsInfoBlock type='Bool' default_value='0' />
Определяет поведение при обращении к неизвестной рабочей нагрузке (WORKLOAD) с помощью настройки запроса 'workload'.

- Если `true`, при попытке обращения к неизвестной рабочей нагрузке генерируется исключение RESOURCE_ACCESS_DENIED. Полезно для обязательного применения планирования ресурсов ко всем запросам после того, как иерархия WORKLOAD установлена и содержит WORKLOAD default.
- Если `false` (по умолчанию), запросу с настройкой 'workload', указывающей на неизвестную рабочую нагрузку (WORKLOAD), предоставляется неограниченный доступ без планирования ресурсов. Это важно при настройке иерархии WORKLOAD до добавления WORKLOAD default.

**Пример**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**См. также**

- [Планирование рабочей нагрузки](/operations/workload-scheduling.md)


## timezone {#timezone}

Часовой пояс сервера.

Указывается в виде идентификатора IANA для часового пояса UTC или географического местоположения (например, Africa/Abidjan).

Часовой пояс необходим для преобразования между форматами String и DateTime при выводе полей DateTime в текстовый формат (вывод на экран или в файл), а также при получении DateTime из строки. Кроме того, часовой пояс используется в функциях для работы со временем и датой, если часовой пояс не был передан во входных параметрах.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**См. также**

- [session_timezone](../settings/settings.md#session_timezone)


## tmp_path {#tmp_path}

Путь в локальной файловой системе для хранения временных данных при обработке больших запросов.

:::note

- Для настройки хранилища временных данных можно использовать только один параметр: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- Завершающий слеш обязателен.
  :::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## tmp_policy {#tmp_policy}

Политика хранения временных данных. Все файлы с префиксом `tmp` удаляются при запуске.

:::note
Рекомендации по использованию объектного хранилища в качестве `tmp_policy`:

- Используйте отдельный `bucket:path` на каждом сервере
- Используйте `metadata_type=plain`
- Также рекомендуется настроить TTL для этого bucket
  :::

:::note

- Для настройки хранения временных данных можно использовать только один параметр: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- Параметры `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes` игнорируются.
- Политика должна содержать ровно _один том_

Дополнительную информацию см. в документации по [движку таблиц MergeTree](/engines/table-engines/mergetree-family/mergetree).
:::

**Пример**

Когда `/disk1` заполнен, временные данные сохраняются на `/disk2`.

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


## top_level_domains_list {#top_level_domains_list}

Определяет список пользовательских доменов верхнего уровня для добавления, где каждая запись имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

См. также:

- функция [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) и её варианты,
  которая принимает имя пользовательского списка доменов верхнего уровня и возвращает часть домена, включающую поддомены верхнего уровня до первого значимого поддомена.


## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
Собирать случайные выделения памяти размером, меньшим или равным указанному значению, с
вероятностью, равной `total_memory_profiler_sample_probability`. Значение 0 означает
отключение функции. Рекомендуется установить параметр 'max_untracked_memory' в 0, чтобы данный порог
работал корректно.


## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
Собирать случайные выделения памяти размером больше или равным указанному значению с
вероятностью, равной `total_memory_profiler_sample_probability`. Значение 0 означает
отключение функции. Рекомендуется установить 'max_untracked_memory' в 0, чтобы этот порог
работал корректно.


## total_memory_profiler_step {#total_memory_profiler_step}

<SettingsInfoBlock type='UInt64' default_value='0' />
Когда использование памяти сервером превышает каждый следующий шаг (в байтах), профилировщик памяти собирает трассировку стека выделения памяти. Значение 0 означает, что профилировщик памяти отключен. Значения менее нескольких мегабайт снизят производительность сервера.


## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability}

<SettingsInfoBlock type='Double' default_value='0' />
Позволяет собирать случайные выделения и освобождения памяти и записывать их в системную таблицу
[system.trace_log](../../operations/system-tables/trace_log.md)
с `trace_type`, равным `MemorySample`, с указанной вероятностью.
Вероятность применяется к каждому выделению или освобождению памяти независимо от размера
выделения. Обратите внимание, что сэмплирование происходит только тогда, когда объём неотслеживаемой
памяти превышает лимит неотслеживаемой памяти (значение по умолчанию — `4` МиБ). Его можно
уменьшить, если уменьшить значение параметра
[total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step).
Можно установить `total_memory_profiler_step` равным `1` для более
детального сэмплирования.

Возможные значения:

- Положительное число с плавающей точкой.
- `0` — запись случайных выделений и освобождений памяти в системную таблицу `system.trace_log` отключена.


## trace_log {#trace_log}

Настройки для работы системной таблицы [trace_log](/operations/system-tables/trace_log).

<SystemLogParameters />

Файл конфигурации сервера по умолчанию `config.xml` содержит следующую секцию настроек:

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

<SettingsInfoBlock type='String' default_value='SLRU' />
Название политики кэша несжатых данных.


## uncompressed_cache_size {#uncompressed_cache_size}

<SettingsInfoBlock type='UInt64' default_value='0' />
Максимальный размер (в байтах) несжатых данных, используемых движками таблиц семейства
MergeTree.

На сервере используется один общий кэш. Память выделяется по мере необходимости. Кэш используется, если включена опция `use_uncompressed_cache`.

Кэш несжатых данных может быть полезен для очень коротких запросов в отдельных случаях.

:::note
Значение `0` означает, что кэш отключен.

Эту настройку можно изменить во время работы, изменения вступят в силу немедленно.
:::


## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
Размер защищённой очереди (при использовании политики SLRU) в несжатом
кеше относительно общего размера кеша.


## url_scheme_mappers {#url_scheme_mappers}

Конфигурация для преобразования сокращённых или символьных префиксов URL в полные URL.

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

Метод хранения заголовков кусков данных в ZooKeeper. Эта настройка применяется только к семейству движков [`MergeTree`](/engines/table-engines/mergetree-family). Она может быть указана:

**Глобально в секции [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует эту настройку для всех таблиц на сервере. Настройку можно изменить в любое время. Существующие таблицы изменяют свое поведение при изменении настройки.

**Для каждой таблицы**

При создании таблицы укажите соответствующую [настройку движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этой настройкой не изменяется, даже если изменится глобальная настройка.

**Возможные значения**

- `0` — функциональность отключена.
- `1` — функциональность включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицируемые](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки кусков данных компактно, используя единственный `znode`. Если таблица содержит много столбцов, этот метод хранения значительно сокращает объем данных, хранящихся в Zookeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` невозможно откатить сервер ClickHouse до версии, которая не поддерживает эту настройку. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все серверы одновременно. Безопаснее тестировать новые версии ClickHouse в тестовой среде или только на нескольких серверах кластера.

Заголовки кусков данных, уже сохраненные с этой настройкой, невозможно восстановить в их предыдущее (некомпактное) представление.
:::


## user_defined_executable_functions_config {#user_defined_executable_functions_config}

Путь к файлу конфигурации для исполняемых пользовательских функций.

Путь:

- Укажите абсолютный путь или путь относительно конфигурационного файла сервера.
- Путь может содержать подстановочные символы \* и ?.

См. также:

- «[Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions)».

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## user_defined_path {#user_defined_path}

Директория с пользовательскими файлами. Используется для пользовательских функций SQL [Пользовательские функции SQL](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


## user_directories {#user_directories}

Раздел конфигурационного файла, содержащий настройки:

- Путь к конфигурационному файлу с предопределёнными пользователями.
- Путь к папке, в которой хранятся пользователи, созданные SQL-командами.
- Путь к узлу ZooKeeper, в котором хранятся и реплицируются пользователи, созданные SQL-командами.

Если этот раздел указан, пути из [users_config](/operations/server-configuration-parameters/settings#users_config) и [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) использоваться не будут.

Раздел `user_directories` может содержать любое количество элементов, порядок элементов определяет их приоритет (чем выше элемент в списке, тем выше его приоритет).

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

Пользователи, роли, политики строк, квоты и профили также могут храниться в ZooKeeper:

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

Также можно определить разделы `memory` — для хранения информации только в памяти, без записи на диск, и `ldap` — для хранения информации на LDAP-сервере.

Чтобы добавить LDAP-сервер в качестве удалённого каталога пользователей, не определённых локально, создайте один раздел `ldap` со следующими настройками:

| Настройка  | Описание                                                                                                                                                                                                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `server` | Одно из имён LDAP-серверов, определённых в разделе конфигурации `ldap_servers`. Этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                            |
| `roles`  | Раздел со списком локально определённых ролей, которые будут назначены каждому пользователю, полученному с LDAP-сервера. Если роли не указаны, пользователь не сможет выполнять никакие действия после аутентификации. Если какая-либо из перечисленных ролей не определена локально на момент аутентификации, попытка аутентификации завершится неудачей, как если бы был указан неверный пароль. |

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


## user_files_path {#user_files_path}

Директория с пользовательскими файлами. Используется в табличных функциях [file()](../../sql-reference/table-functions/file.md), [fileCluster()](../../sql-reference/table-functions/fileCluster.md).

**Пример**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user_scripts_path {#user_scripts_path}

Директория с файлами пользовательских скриптов. Используется для исполняемых пользовательских функций [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).

**Пример**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

Тип:

Значение по умолчанию:


## users_config {#users_config}

Путь к файлу, содержащему:

- Конфигурации пользователей.
- Права доступа.
- Профили настроек.
- Настройки квот.

**Пример**

```xml
<users_config>users.xml</users_config>
```


## validate_tcp_client_information {#validate_tcp_client_information}

<SettingsInfoBlock type='Bool' default_value='0' />
Определяет, включена ли проверка информации клиента при получении пакета запроса.

По умолчанию имеет значение `false`:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```


## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries}

<SettingsInfoBlock type='UInt64' default_value='10000000' />
Размер кэша индекса векторного сходства в записях. Ноль означает отключено.


## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy}

<SettingsInfoBlock type='String' default_value='SLRU' />
Название политики кэширования индекса векторного подобия.


## vector_similarity_index_cache_size {#vector_similarity_index_cache_size}

<SettingsInfoBlock type='UInt64' default_value='5368709120' />
Размер кэша для индексов векторного подобия. Нулевое значение означает отключение.

:::note
Эту настройку можно изменить во время работы, изменения вступят в силу немедленно.
:::


## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio}

<SettingsInfoBlock type='Double' default_value='0.5' />
Размер защищённой очереди (в случае политики SLRU) в кеше индекса векторного подобия относительно общего размера кеша.


## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup}

<SettingsInfoBlock type='Bool' default_value='1' />
Эта настройка определяет поведение системы, если `dictionaries_lazy_load` имеет значение `false`.
(Если `dictionaries_lazy_load` имеет значение `true`, данная настройка не оказывает никакого влияния.)

Если `wait_dictionaries_load_at_startup` имеет значение `false`, сервер
начнёт загружать все словари при запуске и будет принимать соединения параллельно с загрузкой.
При первом использовании словаря в запросе выполнение запроса будет приостановлено до завершения загрузки словаря, если он ещё не загружен.
Установка `wait_dictionaries_load_at_startup` в `false` может ускорить запуск ClickHouse, однако некоторые запросы могут выполняться медленнее
(так как им придётся ожидать загрузки необходимых словарей).

Если `wait_dictionaries_load_at_startup` имеет значение `true`, сервер будет ожидать при запуске
завершения загрузки всех словарей (успешной или неуспешной) перед началом приёма соединений.

**Пример**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```


## workload_path {#workload_path}

Директория, используемая для хранения всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется папка `/workload/` в рабочем каталоге сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**См. также**

- [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)


## workload_zookeeper_path {#workload_zookeeper_path}

Путь к узлу ZooKeeper, который используется в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для обеспечения согласованности все SQL-определения хранятся как значение этого единственного znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**См. также**

- [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)


## zookeeper {#zookeeper}

Содержит настройки, которые позволяют ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицируемых таблиц. Если реплицируемые таблицы не используются, этот раздел параметров можно опустить.

Следующие настройки могут быть заданы с помощью подтегов:

| Настройка                                  | Описание                                                                                                                                                                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | Конечная точка ZooKeeper. Можно указать несколько конечных точек. Например: `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` определяет порядок узлов при попытке подключения к кластеру ZooKeeper. |
| `session_timeout_ms`                       | Максимальное время ожидания клиентской сессии в миллисекундах.                                                                                                                                                              |
| `operation_timeout_ms`                     | Максимальное время ожидания одной операции в миллисекундах.                                                                                                                                                                 |
| `root` (необязательно)                     | Узел znode, который используется в качестве корневого для узлов znode, используемых сервером ClickHouse.                                                                                                                    |
| `fallback_session_lifetime.min` (необязательно) | Минимальное ограничение времени жизни сессии zookeeper к резервному узлу, когда основной узел недоступен (балансировка нагрузки). Указывается в секундах. По умолчанию: 3 часа.                                        |
| `fallback_session_lifetime.max` (необязательно) | Максимальное ограничение времени жизни сессии zookeeper к резервному узлу, когда основной узел недоступен (балансировка нагрузки). Указывается в секундах. По умолчанию: 6 часов.                                      |
| `identity` (необязательно)                 | Имя пользователя и пароль, требуемые ZooKeeper для доступа к запрашиваемым узлам znode.                                                                                                                                     |
| `use_compression` (необязательно)          | Включает сжатие в протоколе Keeper, если установлено значение true.                                                                                                                                                         |

Также существует настройка `zookeeper_load_balancing` (необязательно), которая позволяет выбрать алгоритм выбора узла ZooKeeper:

| Название алгоритма              | Описание                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `random`                        | случайным образом выбирает один из узлов ZooKeeper.                                                                            |
| `in_order`                      | выбирает первый узел ZooKeeper, если он недоступен, то второй, и так далее.                                                    |
| `nearest_hostname`              | выбирает узел ZooKeeper с именем хоста, наиболее похожим на имя хоста сервера; имя хоста сравнивается по префиксу имени.      |
| `hostname_levenshtein_distance` | аналогично nearest_hostname, но сравнивает имя хоста с использованием расстояния Левенштейна.                                  |
| `first_or_random`               | выбирает первый узел ZooKeeper, если он недоступен, то случайным образом выбирает один из оставшихся узлов ZooKeeper.          |
| `round_robin`                   | выбирает первый узел ZooKeeper, при переподключении выбирает следующий.                                                        |

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
    <!-- Необязательно. Суффикс chroot. Должен существовать. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Необязательно. Строка digest ACL для Zookeeper. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**См. также**

- [Репликация](../../engines/table-engines/mergetree-family/replication.md)
- [Руководство программиста ZooKeeper](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [Опциональная защищенная связь между ClickHouse и Zookeeper](/operations/ssl-zookeeper)


## zookeeper_log {#zookeeper_log}

Настройки системной таблицы [`zookeeper_log`](/operations/system-tables/zookeeper_log).

Следующие настройки можно задать с помощью подтегов:

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
