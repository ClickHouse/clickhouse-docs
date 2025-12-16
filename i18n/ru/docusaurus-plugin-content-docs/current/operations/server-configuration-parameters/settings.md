---
description: 'В этом разделе приведены описания серверных настроек, то есть настроек,
которые нельзя изменить на уровне сессии или запроса.'
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

В этом разделе приведены описания настроек сервера. Это настройки, которые
нельзя изменить на уровне сессии или запроса.

Дополнительную информацию о конфигурационных файлах в ClickHouse см. в разделе [«Configuration Files»](/operations/configuration-files).

Другие настройки описаны в разделе «[Settings](/operations/settings/overview)».
Перед изучением настроек мы рекомендуем ознакомиться с разделом [«Configuration files»](/operations/configuration-files)
и обратить внимание на использование подстановок (атрибуты `incl` и `optional`).

## abort_on_logical_error {#abort_on_logical_error} 

<SettingsInfoBlock type="Bool" default_value="0" />Аварийно останавливать сервер при возникновении исключений LOGICAL_ERROR. Только для экспертов.

## access&#95;control&#95;improvements {#access_control_improvements}

Настройки для дополнительных (необязательных) улучшений системы управления доступом.

| Setting                                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Default |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | Определяет, могут ли пользователи без разрешающих ROW POLICY по‑прежнему читать строки с помощью запроса `SELECT`. Например, если есть два пользователя A и B и политика строк (ROW POLICY) определена только для A, то при значении параметра true пользователь B увидит все строки. При значении false пользователь B не увидит ни одной строки.                                                                                                                                                                                                                                                                | `true`  |
| `on_cluster_queries_require_cluster_grant`      | Определяет, требуют ли запросы `ON CLUSTER` привилегии `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `true`  |
| `select_from_system_db_requires_grant`          | Определяет, требуется ли для `SELECT * FROM system.&lt;table&gt;` наличие каких‑либо привилегий или же запрос может выполняться любым пользователем. Если установлено в true, то для этого запроса требуется `GRANT SELECT ON system.&lt;table&gt;` так же, как и для несистемных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые константные таблицы, такие как `one`, `contributors`) по‑прежнему доступны всем; кроме того, если выдана привилегия `SHOW` (например, `SHOW USERS`), то соответствующая системная таблица (то есть `system.users`) будет доступна. | `true`  |
| `select_from_information_schema_requires_grant` | Определяет, требуется ли для `SELECT * FROM information_schema.&lt;table&gt;` наличие каких‑либо привилегий или же запрос может выполняться любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON information_schema.&lt;table&gt;` так же, как и для обычных таблиц.                                                                                                                                                                                                                                                                                                             | `true`  |
| `settings_constraints_replace_previous`         | Определяет, будет ли CONSTRAINT в SETTINGS PROFILE для некоторой настройки отменять действие предыдущего CONSTRAINT (определённого в других профилях) для этой настройки, включая поля, которые не устанавливаются новым CONSTRAINT. Также включает тип CONSTRAINT `changeable_in_readonly`.                                                                                                                                                                                                                                                                                                                      | `true`  |
| `table_engines_require_grant`                   | Определяет, требуется ли привилегия для создания таблицы с использованием конкретного движка таблицы.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `false` |
| `role_cache_expiration_time_seconds`            | Определяет количество секунд с момента последнего обращения, в течение которых роль хранится в Role Cache.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `600`   |

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

Путь к директории, в которой сервер ClickHouse хранит конфигурации пользователей и ролей, созданные SQL-командами.

**См. также**

- [Управление доступом и учетными записями](/operations/access-rights#access-control-usage)

## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached} 

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />Действие, выполняемое при превышении максимального размера массива в groupArray: выбросить исключение (`throw`) или отбросить лишние значения (`discard`)

## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

<SettingsInfoBlock type="UInt64" default_value="16777215" />Максимальный размер элемента массива в байтах для функции groupArray. Этот лимит проверяется при сериализации и позволяет избежать чрезмерного размера состояния.

## allow_feature_tier {#allow_feature_tier} 

<SettingsInfoBlock type="UInt32" default_value="0" />

Определяет, может ли пользователь изменять настройки, связанные с различными уровнями функциональности.

- `0` — разрешены изменения любых настроек (experimental, beta, production).
- `1` — разрешены изменения только настроек уровней beta и production. Изменения настроек уровня experimental отклоняются.
- `2` — разрешены изменения только настроек уровня production. Изменения настроек уровней experimental и beta отклоняются.

Это эквивалентно установке ограничения только на чтение для всех функций уровней `EXPERIMENTAL` / `BETA`.

:::note
Значение `0` означает, что могут быть изменены все настройки.
:::

## allow_impersonate_user {#allow_impersonate_user} 

<SettingsInfoBlock type="Bool" default_value="0" />Включает/отключает функцию IMPERSONATE (EXECUTE AS target_user).

## allow&#95;implicit&#95;no&#95;password {#allow_implicit_no_password}

Запрещает создавать пользователя без пароля, если явно не указано &#39;IDENTIFIED WITH no&#95;password&#39;.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```

## allow&#95;no&#95;password {#allow_no_password}

Определяет, допускается ли использование небезопасного типа пароля `no_password`.

```xml
<allow_no_password>1</allow_no_password>
```

## allow&#95;plaintext&#95;password {#allow_plaintext_password}

Разрешает или запрещает использование паролей в открытом виде (небезопасных).

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```

## allow_use_jemalloc_memory {#allow_use_jemalloc_memory} 

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает использовать память jemalloc.

## allowed_disks_for_table_engines {#allowed_disks_for_table_engines} 

Список дисков, разрешенных для использования с Iceberg

## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

<SettingsInfoBlock type="Bool" default_value="1" />Если значение равно true, очередь асинхронных вставок сбрасывается при корректном завершении работы сервера

## async_insert_threads {#async_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков для разбора и вставки данных в фоновом режиме. Значение 0 означает, что асинхронный режим отключен

## async&#95;load&#95;databases {#async_load_databases}

<SettingsInfoBlock type="Bool" default_value="1" />

Асинхронная загрузка баз данных и таблиц.

* Если `true`, все несистемные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружаться асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается обратиться к ещё не загруженной таблице, будет ждать запуска именно этой таблицы. Если задача загрузки завершится с ошибкой, запрос повторно выбросит это исключение (вместо завершения работы всего сервера при `async_load_databases = false`). Таблица, которую ожидает хотя бы один запрос, будет загружаться с более высоким приоритетом. DDL-запросы к базе данных будут ждать запуска именно этой базы данных. Также рассмотрите установку ограничения `max_waiting_queries` на общее число ожидающих запросов.
* Если `false`, все базы данных загружаются при запуске сервера.

**Пример**

```xml
<async_load_databases>true</async_load_databases>
```

## async&#95;load&#95;system&#95;database {#async_load_system_database}

<SettingsInfoBlock type="Bool" default_value="0" />

Асинхронная загрузка системных таблиц. Полезна, если в базе данных `system` много таблиц логов и частей. Независима от настройки `async_load_databases`.

* Если установлено значение `true`, все системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружаться асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, а также настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который попытается получить доступ к системной таблице, которая ещё не загружена, будет ожидать запуска именно этой таблицы. Таблица, которой ожидает хотя бы один запрос, будет загружена с более высоким приоритетом. Также рассмотрите возможность настройки параметра `max_waiting_queries` для ограничения общего числа ожидающих запросов.
* Если установлено значение `false`, системная база данных загружается до запуска сервера.

**Пример**

```xml
<async_load_system_database>true</async_load_system_database>
```

## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="120" />Интервал обновления тяжёлых асинхронных метрик в секундах.

## asynchronous&#95;insert&#95;log {#asynchronous_insert_log}

Настройки системной таблицы [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log) для логирования асинхронных вставок.

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

Если этот параметр не включен по умолчанию в вашей среде, в зависимости от того, как был установлен ClickHouse, вы можете воспользоваться приведенной ниже инструкцией, чтобы включить или выключить его.

**Включение**

Чтобы вручную включить сбор истории в журнале асинхронных метрик [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md), создайте `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `asynchronous_metric_log`, необходимо создать файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержимым:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />

## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics} 

<SettingsInfoBlock type="Bool" default_value="0" />Включает вычисление ресурсоёмких асинхронных метрик.

## asynchronous_metrics_keeper_metrics_only {#asynchronous_metrics_keeper_metrics_only} 

<SettingsInfoBlock type="Bool" default_value="0" />Включает расчёт только тех асинхронных метрик, которые относятся к Keeper.

## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="1" />Интервал обновления асинхронных метрик в секундах.

## auth_use_forwarded_address {#auth_use_forwarded_address} 

Использовать исходный адрес клиента для аутентификации при подключении через прокси.

:::note
Этот параметр должен использоваться с особой осторожностью, так как пересылаемые адреса легко подменить — серверы, принимающие такую аутентификацию, не должны быть доступны напрямую, а только через доверенный прокси.
:::

## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которые будут использоваться для выполнения операций сброса данных для [таблиц с движком Buffer](/engines/table-engines/special/buffer) в фоновом режиме.

## background_common_pool_size {#background_common_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Максимальное количество потоков, которые будут использоваться для выполнения различных операций (в основном сборки мусора) с таблицами на [*движке MergeTree](/engines/table-engines/mergetree-family) в фоновом режиме.

## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, используемых для выполнения распределённых отправок.

## background_fetches_pool_size {#background_fetches_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, используемых для фоновой загрузки частей данных с другой реплики для таблиц семейства [*MergeTree](/engines/table-engines/mergetree-family).

## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />

Устанавливает соотношение между числом потоков и числом фоновых слияний и мутаций, которые могут выполняться одновременно.

Например, если это соотношение равно 2 и параметр [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) установлен равным 16, то ClickHouse может одновременно выполнять 32 фоновых слияния. Это возможно, потому что фоновые операции могут быть приостановлены и отложены. Это необходимо, чтобы предоставить небольшим слияниям более высокий приоритет на выполнение.

:::note
Вы можете увеличивать это соотношение только во время работы сервера. Чтобы уменьшить его, необходимо перезапустить сервер.

Как и в случае с параметром [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size), [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) может быть применен из профиля `default` для сохранения обратной совместимости.
:::

## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

<SettingsInfoBlock type="String" default_value="round_robin" />

Политика планирования фоновых слияний и мутаций. Возможные значения: `round_robin` и `shortest_task_first`.

Алгоритм, используемый для выбора следующего слияния или мутации, которые будут выполняться пулом фоновых потоков. Политика может быть изменена во время работы без перезапуска сервера.
Может быть применена из профиля `default` для сохранения обратной совместимости.

Возможные значения:

- `round_robin` — Каждое одновременное слияние и мутация выполняются по кругу (по принципу round-robin), чтобы избежать голодания задач. Меньшие слияния завершаются быстрее, чем большие, просто потому что им нужно объединить меньше блоков.
- `shortest_task_first` — Всегда выполнять слияние или мутацию меньшего размера. Слияниям и мутациям назначаются приоритеты на основе их результирующего объёма. Слияния с меньшим размером строго предпочитаются большим. Эта политика обеспечивает максимально быстрое выполнение слияний небольших частей, но может приводить к неограниченному голоданию больших слияний в партициях, сильно перегруженных операциями `INSERT`.

## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которые будут использоваться для выполнения фоновых операций при потоковой передаче сообщений.

## background_move_pool_size {#background_move_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Максимальное количество потоков, которые будут использоваться для перемещения частей данных на другой диск или том для таблиц семейства движков MergeTree в фоновом режиме.

## background&#95;pool&#95;size {#background_pool_size}

<SettingsInfoBlock type="UInt64" default_value="16" />

Задаёт количество потоков, выполняющих фоновые слияния и мутации для таблиц с движками MergeTree.

:::note

* Этот параметр также может быть задан при запуске сервера из конфигурации профиля `default` для обеспечения обратной совместимости при старте сервера ClickHouse.
* В процессе работы сервера можно только увеличить количество потоков.
* Чтобы уменьшить количество потоков, необходимо перезапустить сервер.
* Регулируя этот параметр, вы управляете нагрузкой на CPU и диск.
  :::

:::danger
Меньший размер пула требует меньше ресурсов CPU и диска, но фоновые процессы выполняются медленнее, что в конечном итоге может повлиять на производительность запросов.
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

<SettingsInfoBlock type="UInt64" default_value="512" />Максимальное количество потоков, которые будут использоваться для постоянного выполнения лёгких периодических операций с реплицируемыми таблицами, потоковой обработкой Kafka и обновлением кэша DNS.

## backup&#95;log {#backup_log}

Настройки системной таблицы [backup&#95;log](../../operations/system-tables/backup_log.md), предназначенной для логирования операций `BACKUP` и `RESTORE`.

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

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />Максимальное количество потоков, используемых для выполнения запросов `BACKUP`.

## Резервные копии {#backups}

Настройки резервного копирования, используемые при выполнении команд [`BACKUP` и `RESTORE`](/operations/backup/overview).

Следующие параметры можно настроить с помощью вложенных тегов:

{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','Определяет, могут ли несколько операций резервного копирования выполняться параллельно на одном и том же хосте.', 'true'),
    ('allow_concurrent_restores', 'Bool', 'Определяет, могут ли несколько операций восстановления выполняться параллельно на одном и том же хосте.', 'true'),
    ('allowed_disk', 'String', 'Диск, на который выполняется резервное копирование при использовании `File()`. Этот параметр должен быть задан, чтобы использовать `File`.', ''),
    ('allowed_path', 'String', 'Путь для резервного копирования при использовании `File()`. Этот параметр должен быть задан, чтобы использовать `File`.', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', 'Количество попыток сбора метаданных перед переходом в режим ожидания в случае несогласованности после сравнения собранных метаданных.', '2'),
    ('collect_metadata_timeout', 'UInt64', 'Таймаут в миллисекундах на сбор метаданных во время резервного копирования.', '600000'),
    ('compare_collected_metadata', 'Bool', 'Если установлено значение true, сравнивает собранные метаданные с существующими, чтобы убедиться, что они не изменились во время резервного копирования.', 'true'),
    ('create_table_timeout', 'UInt64', 'Таймаут в миллисекундах на создание таблиц при восстановлении.', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', 'Максимальное количество попыток повторить операцию после ошибки «bad version» при координированном резервном копировании/восстановлении.', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Максимальное время ожидания в миллисекундах перед следующей попыткой сбора метаданных.', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Минимальное время ожидания в миллисекундах перед следующей попыткой сбора метаданных.', '5000'),
    ('remove_backup_files_after_failure', 'Bool', 'Если команда `BACKUP` завершается с ошибкой, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до сбоя; в противном случае скопированные файлы будут оставлены как есть.', 'true'),
    ('sync_period_ms', 'UInt64', 'Период синхронизации в миллисекундах для координированного резервного копирования/восстановления.', '5000'),
    ('test_inject_sleep', 'Bool', 'Тестовая задержка ожидания', 'false'),
    ('test_randomize_order', 'Bool', 'Если установлено значение true, случайным образом меняет порядок некоторых операций в тестовых целях.', 'false'),
    ('zookeeper_path', 'String', 'Путь в ZooKeeper, где хранятся метаданные резервного копирования и восстановления при использовании предложения `ON CLUSTER`.', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }


| Setting                                             | Type   | Description                                                                                                                                                                       | Default               |
| :-------------------------------------------------- | :----- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | Определяет, могут ли несколько операций резервного копирования выполняться параллельно на одном и том же хосте.                                                                   | `true`                |
| `allow_concurrent_restores`                         | Bool   | Определяет, могут ли несколько операций восстановления выполняться параллельно на одном и том же хосте.                                                                           | `true`                |
| `allowed_disk`                                      | String | Диск, на который выполняется резервное копирование при использовании `File()`. Эта настройка должна быть задана, чтобы использовать `File`.                                       | ``                    |
| `allowed_path`                                      | String | Путь, по которому выполняется резервное копирование при использовании `File()`. Эта настройка должна быть задана, чтобы использовать `File`.                                      | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | Количество попыток собрать метаданные перед переходом в режим ожидания в случае несоответствия после сравнения собранных метаданных.                                              | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | Таймаут в миллисекундах для сбора метаданных во время резервного копирования.                                                                                                     | `600000`              |
| `compare_collected_metadata`                        | Bool   | Если `true`, сравнивает собранные метаданные с существующими, чтобы убедиться, что они не изменялись во время резервного копирования.                                             | `true`                |
| `create_table_timeout`                              | UInt64 | Таймаут в миллисекундах для создания таблиц во время восстановления.                                                                                                              | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | Максимальное количество попыток повторить операцию после возникновения ошибки некорректной версии при координированном резервном копировании/восстановлении.                      | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | Максимальное время ожидания в миллисекундах перед следующей попыткой собрать метаданные.                                                                                          | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | Минимальное время ожидания в миллисекундах перед следующей попыткой собрать метаданные.                                                                                           | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | Если команда `BACKUP` завершилась с ошибкой, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до ошибки, иначе оставит скопированные файлы без изменений. | `true`                |
| `sync_period_ms`                                    | UInt64 | Период синхронизации в миллисекундах для координированного резервного копирования и восстановления.                                                                               | `5000`                |
| `test_inject_sleep`                                 | Bool   | Задержка для целей тестирования.                                                                                                                                                  | `false`               |
| `test_randomize_order`                              | Bool   | Если `true`, случайным образом изменяет порядок выполнения некоторых операций в тестовых целях.                                                                                   | `false`               |
| `zookeeper_path`                                    | String | Путь в ZooKeeper, где хранятся метаданные резервного копирования и восстановления при использовании предложения `ON CLUSTER`.                                                     | `/clickhouse/backups` |

Эта настройка по умолчанию имеет значение:

```xml
<backups>
    ....
</backups>
```

## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество задач, которые могут быть поставлены в пул потоков ввода-вывода резервных копий (Backups IO Thread pool). Рекомендуется оставлять эту очередь неограниченной из-за особенностей текущей логики резервного копирования в S3.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничения.
:::

## bcrypt&#95;workfactor {#bcrypt_workfactor}

Коэффициент сложности для типа аутентификации `bcrypt_password`, использующего [алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).
Этот коэффициент определяет объём вычислений и время, необходимое для вычисления хеша и проверки пароля.

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
Для приложений с частой аутентификацией
рассмотрите использование альтернативных методов аутентификации
из-за вычислительных затрат bcrypt при повышенных значениях фактора сложности.
:::

## blob&#95;storage&#95;log {#blob_storage_log}

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

## builtin&#95;dictionaries&#95;reload&#95;interval {#builtin_dictionaries_reload_interval}

Интервал в секундах между перезагрузками встроенных словарей.

ClickHouse перезагружает встроенные словари каждые x секунд. Это позволяет редактировать словари «на лету» без перезапуска сервера.

**Пример**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Устанавливает максимальное отношение размера кэша к объёму оперативной памяти. Позволяет уменьшить размер кэша на системах с малым объёмом памяти.

## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

<SettingsInfoBlock type="Double" default_value="0" />Для тестовых целей.

## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

<SettingsInfoBlock type="UInt64" default_value="15" />

Интервал в секундах, за который максимальное допустимое потребление памяти сервером приводится в соответствие с пороговым значением в cgroups.

Чтобы отключить наблюдатель cgroups, установите это значение в `0`.

## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Устанавливает размер кэша (в элементах) для [скомпилированных выражений](../../operations/caches.md).

## compiled_expression_cache_size {#compiled_expression_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />Определяет размер кэша (в байтах) для [скомпилированных выражений](../../operations/caches.md).

## compression {#compression}

Настройки сжатия данных для таблиц с движком [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

:::note
Мы рекомендуем не изменять эти настройки, если вы только начали использовать ClickHouse.
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

**поля `<case>`**:

* `min_part_size` – Минимальный размер части данных.
* `min_part_size_ratio` – Отношение размера части данных к размеру таблицы.
* `method` – Метод сжатия. Допустимые значения: `lz4`, `lz4hc`, `zstd`,`deflate_qpl`.
* `level` – Уровень сжатия. См. [Codecs](/sql-reference/statements/create/table#general-purpose-codecs).

:::note
Вы можете настроить несколько секций `<case>`.
:::

**Действия при выполнении условий**:

* Если часть данных соответствует набору условий, ClickHouse использует указанный метод сжатия.
* Если часть данных соответствует нескольким наборам условий, ClickHouse использует первый совпавший набор условий.

:::note
Если ни одно условие не выполняется для части данных, ClickHouse использует сжатие `lz4`.
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

Политика планирования слотов CPU, задаваемых `concurrent_threads_soft_limit_num` и `concurrent_threads_soft_limit_ratio_to_cores`. Алгоритм, определяющий, как ограниченное количество слотов CPU распределяется между параллельными запросами. Планировщик может быть изменён во время работы без перезапуска сервера.

Возможные значения:

- `round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads` слотов CPU. Один слот на поток. При конкуренции за ресурсы слоты CPU выделяются запросам по принципу round-robin. Обратите внимание, что первый слот выделяется безусловно, что может приводить к несправедливому распределению и увеличенной задержке запросов с высоким значением `max_threads` при наличии большого количества запросов с `max_threads` = 1.
- `fair_round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads - 1` слотов CPU. Вариант `round_robin`, который не требует слота CPU для первого потока каждого запроса. Таким образом, запросы с `max_threads` = 1 не требуют ни одного слота и не могут несправедливо занять все слоты. Ни один слот не выделяется безусловно.

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество потоков обработки запросов, исключая потоки для получения данных с удалённых серверов, которые могут одновременно использоваться всеми запросами. Это не жёсткий лимит. Если лимит достигнут, запрос всё равно получит как минимум один поток для выполнения. Во время выполнения запрос может увеличивать число потоков до требуемого значения, если становятся доступны дополнительные потоки.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" />То же, что и [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num), но задаётся как отношение к числу ядер.

## config_reload_interval_ms {#config_reload_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="2000" />

Как часто ClickHouse будет перезагружать конфигурацию и проверять наличие новых изменений

## core&#95;dump {#core_dump}

Настраивает мягкий лимит на размер файла дампа ядра.

:::note
Жесткий лимит настраивается с помощью системных инструментов
:::

**Пример**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```

## cpu&#95;slot&#95;preemption {#cpu_slot_preemption}

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, как осуществляется планирование рабочих нагрузок по CPU-ресурсам (MASTER THREAD и WORKER THREAD).

* Если `true` (рекомендуется), учёт ведётся на основе фактически потреблённого CPU-времени. Конкурирующим рабочим нагрузкам будет выделяться справедливый объём CPU-времени. Слоты выделяются на ограниченный промежуток времени и повторно запрашиваются после истечения срока действия. Запрос слота может блокировать выполнение потока в случае перегрузки по CPU-ресурсам, т.е. может происходить вытеснение (preemption). Это обеспечивает справедливое распределение CPU-времени.
* Если `false` (по умолчанию), учёт ведётся на основе количества выделенных CPU-слотов. Конкурирующим рабочим нагрузкам будет выделяться справедливое количество CPU-слотов. Слот выделяется при запуске потока, удерживается непрерывно и освобождается при завершении выполнения потока. Количество потоков, выделенных для выполнения запроса, может только увеличиваться от 1 до `max_threads` и никогда не уменьшаться. Это более благоприятно для долгих запросов и может приводить к голоданию по CPU для коротких запросов.

**Пример**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**См. также**

* [Планирование рабочих нагрузок](/operations/workload-scheduling.md)

## cpu&#95;slot&#95;preemption&#95;timeout&#95;ms {#cpu_slot_preemption_timeout_ms}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Определяет, сколько миллисекунд рабочий поток может ожидать во время вытеснения, то есть в ожидании предоставления другого CPU-слота. По истечении этого таймаута, если потоку не удалось получить новый CPU-слот, он завершит работу, а запрос будет динамически уменьшен до меньшего числа одновременно выполняющихся потоков. Обратите внимание, что основной (master) поток никогда не уменьшается по числу, но может вытесняться неограниченно долго. Имеет смысл только при включённом `cpu_slot_preemption` и когда ресурс CPU задан для WORKER THREAD.

**Пример**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**См. также**

* [Планирование рабочих нагрузок](/operations/workload-scheduling.md)

## cpu&#95;slot&#95;quantum&#95;ns {#cpu_slot_quantum_ns}

<SettingsInfoBlock type="UInt64" default_value="10000000" />

Определяет, сколько наносекунд CPU может потреблять поток после получения слота CPU и до того, как ему следует запросить следующий слот CPU. Имеет смысл только в том случае, если `cpu_slot_preemption` включён и ресурс CPU задан для MASTER THREAD или WORKER THREAD.

**Пример**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**См. также**

* [Планирование рабочих нагрузок](/operations/workload-scheduling.md)

## crash&#95;log {#crash_log}

Настройки для работы системной таблицы [crash&#95;log](../../operations/system-tables/crash_log.md).

Следующие параметры можно задать с помощью подтегов:

| Setting                            | Description                                                                                                                                                     | Default             | Note                                                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `database`                         | Имя базы данных.                                                                                                                                                |                     |                                                                                                                                 |
| `table`                            | Имя системной таблицы.                                                                                                                                          |                     |                                                                                                                                 |
| `engine`                           | [Определение движка MergeTree](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table) для системной таблицы.                |                     | Не может использоваться, если заданы `partition_by` или `order_by`. Если не указан, по умолчанию выбирается `MergeTree`         |
| `partition_by`                     | [Пользовательский ключ партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key.md) для системной таблицы.                            |                     | Если для системной таблицы указан `engine`, параметр `partition_by` должен быть задан непосредственно внутри &#39;engine&#39;   |
| `ttl`                              | Задает табличный [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl).                                                           |                     | Если для системной таблицы указан `engine`, параметр `ttl` должен быть задан непосредственно внутри &#39;engine&#39;            |
| `order_by`                         | [Пользовательский ключ сортировки](/engines/table-engines/mergetree-family/mergetree#order_by) для системной таблицы. Нельзя использовать, если задан `engine`. |                     | Если для системной таблицы указан `engine`, параметр `order_by` должен быть задан непосредственно внутри &#39;engine&#39;       |
| `storage_policy`                   | Имя политики хранения, используемой для таблицы (необязательно).                                                                                                |                     | Если для системной таблицы указан `engine`, параметр `storage_policy` должен быть задан непосредственно внутри &#39;engine&#39; |
| `settings`                         | [Дополнительные параметры](/engines/table-engines/mergetree-family/mergetree/#settings), управляющие поведением MergeTree (необязательно).                      |                     | Если для системной таблицы указан `engine`, параметр `settings` должен быть задан непосредственно внутри &#39;engine&#39;       |
| `flush_interval_milliseconds`      | Интервал сброса данных из буфера в памяти в таблицу.                                                                                                            | `7500`              |                                                                                                                                 |
| `max_size_rows`                    | Максимальный размер логов в строках. Когда количество несброшенных логов достигает `max_size_rows`, логи сбрасываются на диск.                                  | `1024`              |                                                                                                                                 |
| `reserved_size_rows`               | Предварительно выделенный размер памяти в строках для логов.                                                                                                    | `1024`              |                                                                                                                                 |
| `buffer_size_rows_flush_threshold` | Порог по количеству строк. Если порог достигнут, в фоновом режиме запускается сброс логов на диск.                                                              | `max_size_rows / 2` |                                                                                                                                 |
| `flush_on_crash`                   | Определяет, должны ли логи быть сброшены на диск в случае сбоя.                                                                                                 | `false`             |                                                                                                                                 |

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
`custom_cached_disks_base_directory` имеет более высокий приоритет для пользовательских дисков по сравнению с `filesystem_caches_path` (указанным в `filesystem_caches_path.xml`),
который используется, если первый не задан.
Путь параметра кэша файловой системы должен находиться внутри этого каталога,
в противном случае будет сгенерировано исключение, которое предотвратит создание диска.

:::note
Это не затронет диски, созданные в более старой версии, до обновления сервера.
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

Задержка, в течение которой удалённую таблицу можно восстановить с помощью команды [`UNDROP`](/sql-reference/statements/undrop.md). Если `DROP TABLE` выполнялась с модификатором `SYNC`, этот параметр игнорируется.
Значение параметра по умолчанию — `480` (8 минут).

## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

<SettingsInfoBlock type="UInt64" default_value="5" />В случае неудачного удаления таблицы ClickHouse подождёт заданный интервал ожидания, прежде чем повторить операцию.

## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="16" />Размер пула потоков, используемого при удалении таблиц.

## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

<SettingsInfoBlock type="UInt64" default_value="86400" />

Параметр задачи, которая удаляет ненужные данные из каталога `store/`.
Определяет период запуска этой задачи.

:::note
Значение `0` означает «никогда». Значение по умолчанию соответствует одним суткам.
:::

## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

Параметр задачи, которая очищает каталог `store/` от мусора.
Если некоторый подкаталог не используется clickhouse-server и этот подкаталог не изменялся в течение последних
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) секунд, задача «спрячет» этот подкаталог,
удалив все права доступа. Это также работает для каталогов, которые clickhouse-server не ожидает
увидеть внутри `store/`.

:::note
Значение `0` означает «немедленно».
:::

## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />

Параметр задачи, которая удаляет лишние данные и файлы из директории `store/`.
Если какой-либо подкаталог не используется clickhouse-server и ранее был «спрятан»
(см. [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec))
и этот каталог не изменялся в течение последних
[`database_catalog_unused_dir_rm_timeout_sec`]/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) секунд, задача удалит этот каталог.
Параметр также применяется к каталогам, наличие которых clickhouse-server не ожидает внутри `store/`.

:::note
Значение `0` означает «никогда». Значение по умолчанию соответствует 30 дням.
:::

## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает навсегда отсоединять таблицы в реплицируемых базах данных

## database_replicated_drop_broken_tables {#database_replicated_drop_broken_tables} 

<SettingsInfoBlock type="Bool" default_value="0" />Удалять неожиданные таблицы из реплицируемых баз данных вместо перемещения их в отдельную локальную базу данных

## dead&#95;letter&#95;queue {#dead_letter_queue}

Настройка системной таблицы &#39;dead&#95;letter&#95;queue&#39;.

<SystemLogParameters />

Значения по умолчанию:

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

Задает тип пароля, который будет автоматически устанавливаться в запросах вида `CREATE USER u IDENTIFIED BY 'p'`.

Допустимые значения:

* `plaintext_password`
* `sha256_password`
* `double_sha1_password`
* `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```

## default&#95;profile {#default_profile}

Профиль настроек по умолчанию. Профили настроек хранятся в файле, указанном в параметре `user_config`.

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

Тайм-аут сеанса по умолчанию (в секундах).

```xml
<default_session_timeout>60</default_session_timeout>
```

## dictionaries&#95;config {#dictionaries_config}

Путь к конфигурационному файлу словарей.

Путь:

* Укажите абсолютный путь или путь относительно файла конфигурации сервера.
* Путь может содержать маски * и ?.

См. также:

* &quot;[Dictionaries](../../sql-reference/dictionaries/index.md)&quot;.

**Пример**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```

## dictionaries&#95;lazy&#95;load {#dictionaries_lazy_load}

<SettingsInfoBlock type="Bool" default_value="1" />

Отложенная загрузка словарей.

* Если `true`, то каждый словарь загружается при первом использовании. Если загрузка завершилась неудачно, функция, использующая словарь, генерирует исключение.
* Если `false`, то сервер загружает все словари при запуске.

:::note
При запуске сервер будет ждать, пока не завершится загрузка всех словарей, прежде чем принимать какие-либо подключения
(исключение: если параметр [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) установлен в значение `false`).
:::

**Пример**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```

## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Интервал в миллисекундах между повторными попытками подключения к MySQL- и Postgres-словарям с включённым `background_reconnect` после неудачного подключения.

## disable_insertion_and_mutation {#disable_insertion_and_mutation} 

<SettingsInfoBlock type="Bool" default_value="0" />

Отключает запросы INSERT/ALTER/DELETE. Этот параметр включают, когда требуются узлы только для чтения, чтобы операции вставки и мутации не влияли на производительность чтения. Вставки во внешние движки (S3, DataLake, MySQL, PostrgeSQL, Kafka и т. д.) разрешены независимо от значения этого параметра.

## disable_internal_dns_cache {#disable_internal_dns_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />Отключает внутренний DNS-кэш. Рекомендуется при эксплуатации ClickHouse в средах с часто меняющейся инфраструктурой, таких как Kubernetes.

## disable&#95;tunneling&#95;for&#95;https&#95;requests&#95;over&#95;http&#95;proxy {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию для выполнения запросов `HTTPS` через прокси `HTTP` используется туннелирование (т.е. `HTTP CONNECT`). Этот параметр можно использовать, чтобы его отключить.

**no&#95;proxy**

По умолчанию все запросы проходят через прокси. Чтобы отключить его для определённых хостов, необходимо установить переменную `no_proxy`.
Её можно задать внутри секции `<proxy>` для list- и remote-резолверов, а также как переменную окружения для environment-резолвера.
Поддерживаются IP-адреса, домены, поддомены и подстановочный знак `'*'` для полного обхода. Начальные точки удаляются так же, как это делает curl.

**Пример**

Ниже приведена конфигурация, которая обходит прокси для запросов к `clickhouse.cloud` и всем его поддоменам (например, `auth.clickhouse.cloud`).
То же самое относится к GitLab, даже несмотря на начальную точку. И `gitlab.com`, и `about.gitlab.com` будут обходить прокси.

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

## disk_connections_hard_limit {#disk_connections_hard_limit} 

<SettingsInfoBlock type="UInt64" default_value="200000" />При попытке создания нового подключения по достижении этого лимита генерируется исключение. Установите значение 0, чтобы отключить жесткий лимит. Лимит применяется к подключениям к дискам.

## disk_connections_soft_limit {#disk_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />Соединения сверх этого лимита имеют значительно более короткий срок жизни. Лимит применяется к соединениям с дисками.

## disk_connections_store_limit {#disk_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Соединения сверх этого лимита сбрасываются после использования. Установите значение 0, чтобы отключить кэш соединений. Лимит применяется к соединениям с дисками.

## disk_connections_warn_limit {#disk_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="8000" />Предупреждающие сообщения записываются в логи, если количество активных соединений превышает этот предел. Лимит применяется к дисковым соединениям.

## display_secrets_in_show_and_select {#display_secrets_in_show_and_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает показ секретов в запросах `SHOW` и `SELECT` для таблиц, баз данных, табличных функций и словарей.

Пользователь, желающий видеть секреты, также должен иметь
включённую [настройку формата `format_display_secrets_in_show_and_select`](../settings/formats#format_display_secrets_in_show_and_select)
и привилегию
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Возможные значения:

- `0` — Отключено.
- `1` — Включено.

## distributed_cache_apply_throttling_settings_from_client {#distributed_cache_apply_throttling_settings_from_client} 

<SettingsInfoBlock type="Bool" default_value="1" />Следует ли серверу кэша применять настройки троттлинга, полученные от клиента.

## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio} 

<SettingsInfoBlock type="Float" default_value="0.1" />Мягкое ограничение на количество активных соединений, которые распределённый кэш будет пытаться удерживать свободными. Когда число свободных соединений становится меньше distributed_cache_keep_up_free_connections_ratio * max_connections, соединения с самой давней активностью будут закрываться до тех пор, пока это число не превысит заданный предел.

## distributed&#95;ddl {#distributed_ddl}

Управление выполнением [распределённых DDL‑запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) в кластере.
Работает только при включённом [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper).

Настраиваемые параметры в `<distributed_ddl>` включают:

| Setting                | Description                                                                                                                              | Default Value                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `path`                 | путь в Keeper для `task_queue` с DDL‑запросами                                                                                           |                                        |
| `profile`              | профиль, используемый для выполнения DDL‑запросов                                                                                        |                                        |
| `pool_size`            | сколько запросов `ON CLUSTER` может выполняться одновременно                                                                             |                                        |
| `max_tasks_in_queue`   | максимальное количество задач, которое может находиться в очереди                                                                        | `1,000`                                |
| `task_max_lifetime`    | удалить узел, если его возраст превышает это значение                                                                                    | `7 * 24 * 60 * 60` (неделя в секундах) |
| `cleanup_delay_period` | очистка запускается после получения события о новом узле, если с момента последней очистки прошло не менее `cleanup_delay_period` секунд | `60` секунд                            |

**Пример**

```xml
<distributed_ddl>
    <!-- Путь в ZooKeeper к очереди DDL-запросов -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Настройки из этого профиля будут использованы для выполнения DDL-запросов -->
    <profile>default</profile>

    <!-- Определяет, сколько запросов ON CLUSTER может выполняться одновременно. -->
    <pool_size>1</pool_size>

    <!--
         Настройки очистки (активные задачи не удаляются)
    -->

    <!-- Определяет TTL задачи (по умолчанию 1 неделя) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Определяет частоту выполнения очистки (в секундах) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Определяет максимальное количество задач в очереди -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```

## distributed_ddl_use_initial_user_and_roles {#distributed_ddl_use_initial_user_and_roles} 

<SettingsInfoBlock type="Bool" default_value="0" />Если параметр включён, запросы ON CLUSTER будут сохранять и использовать пользователя, инициировавшего запрос, и его роли для выполнения на удалённых сегментах. Это обеспечивает единообразный контроль доступа во всём кластере, но требует, чтобы этот пользователь и роли существовали на всех узлах.

## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4} 

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает преобразование DNS-имён в IPv4-адреса.

## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6} 

<SettingsInfoBlock type="Bool" default_value="1" />Позволяет разрешать DNS-имена в IPv6-адреса.

## dns_cache_max_entries {#dns_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Максимальное количество записей во внутреннем DNS-кэше.

## dns_cache_update_period {#dns_cache_update_period} 

<SettingsInfoBlock type="Int32" default_value="15" />Интервал обновления внутреннего DNS-кэша в секундах.

## dns_max_consecutive_failures {#dns_max_consecutive_failures} 

<SettingsInfoBlock type="UInt32" default_value="10" />Максимальное количество последовательных неудачных попыток разрешения DNS‑имени хоста перед его удалением из DNS‑кэша ClickHouse.

## drop_distributed_cache_pool_size {#drop_distributed_cache_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Размер пула потоков, используемого для очистки распределённого кэша.

## drop_distributed_cache_queue_size {#drop_distributed_cache_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Размер очереди пула потоков, используемого для очистки распределённого кэша.

## enable_azure_sdk_logging {#enable_azure_sdk_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />Включает логирование SDK Azure

## encryption {#encryption}

Настраивает команду для получения ключа, который будет использоваться [кодеками шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должен быть записан в переменных окружения или задан в конфигурационном файле.

Ключи могут задаваться в шестнадцатеричном виде или в виде строки длиной 16 байт.

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
Хранение ключей в конфигурационном файле не рекомендуется. Это небезопасно. Вы можете перенести ключи в отдельный конфигурационный файл на защищённом диске и поместить в папку `config.d/` символьную ссылку на этот файл.
:::

Загрузка из конфигурации, если ключ задан в шестнадцатеричном виде:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Загрузка ключа из переменной среды:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Здесь `current_key_id` задаёт текущий ключ шифрования, а все указанные ключи могут использоваться для расшифровки.

Каждый из этих методов можно использовать с несколькими ключами:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Здесь `current_key_id` показывает текущий ключ шифрования.

Также можно задать nonce длиной 12 байт (по умолчанию при шифровании и расшифровке используется nonce, состоящий из нулевых байтов):

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
Все вышеперечисленное применимо и к `aes_256_gcm_siv` (но длина ключа должна составлять 32 байта).
:::

## error&#95;log {#error_log}

Он отключен по умолчанию.

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

Чтобы отключить параметр `error_log`, необходимо создать файл `/etc/clickhouse-server/config.d/disable_error_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## format_parsing_thread_pool_queue_size {#format_parsing_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество задач, которые могут быть поставлены в пул потоков для разбора входных данных.

:::note
Значение `0` означает отсутствие ограничений.
:::

## format&#95;schema&#95;path {#format_schema_path}

Путь к каталогу, содержащему схемы для входных данных, например, схемы для формата [CapnProto](/interfaces/formats/CapnProto).

**Пример**

```xml
<!-- Директория, содержащая файлы схем для различных входных форматов. -->
<format_schema_path>format_schemas/</format_schema_path>
```

## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />Период таймера процессорных тактов для глобального профилировщика (в наносекундах). Установите значение 0, чтобы отключить глобальный профилировщик по тактам CPU. Рекомендуемое значение — не менее 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (один раз в секунду) для профилирования на уровне кластера.

## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />Период таймера реального времени глобального профайлера (в наносекундах). Установите значение 0, чтобы отключить глобальный профайлер по реальному времени. Рекомендуемое значение — не менее 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (один раз в секунду) для профилирования на уровне кластера.

## google&#95;protos&#95;path {#google_protos_path}

Задает каталог, содержащий файлы .proto для типов Protobuf.

Пример:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```

## graphite {#graphite}

Отправка данных в [Graphite](https://github.com/graphite-project).

Параметры:

* `host` – сервер Graphite.
* `port` – порт на сервере Graphite.
* `interval` – интервал отправки, в секундах.
* `timeout` – таймаут отправки данных, в секундах.
* `root_path` – префикс для ключей.
* `metrics` – отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
* `events` – отправка дельт, накопленных за период времени, из таблицы [system.events](/operations/system-tables/events).
* `events_cumulative` – отправка накопительных данных из таблицы [system.events](/operations/system-tables/events).
* `asynchronous_metrics` – отправка данных из таблицы [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics).

Можно настроить несколько блоков `<graphite>`. Например, это можно использовать для отправки разных данных с разными интервалами.

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

Настройки прореживания данных для Graphite.

Дополнительные сведения см. в разделе [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md).

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
Значение `0` означает, что ClickHouse отключает HSTS. Если вы зададите положительное число, HSTS будет включён, а max-age будет равен этому числу.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```

## http_connections_hard_limit {#http_connections_hard_limit} 

<SettingsInfoBlock type="UInt64" default_value="200000" />Исключение будет выброшено при попытке создания нового подключения, когда достигнут этот предел. Установите значение 0, чтобы отключить жёсткое ограничение. Предел применяется к HTTP‑подключениям, не принадлежащим ни одному диску или хранилищу.

## http_connections_soft_limit {#http_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />Соединения сверх этого лимита имеют значительно более короткий срок жизни. Лимит применяется к HTTP‑соединениям, которые не привязаны ни к какому диску или хранилищу.

## http_connections_store_limit {#http_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Соединения сверх этого лимита закрываются после использования. Установите значение 0, чтобы отключить кэш соединений. Лимит применяется к HTTP‑соединениям, которые не принадлежат ни одному диску или хранилищу.

## http_connections_warn_limit {#http_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="500" />Предупреждающие сообщения записываются в логи, если число активных соединений превышает этот лимит. Лимит применяется к HTTP-соединениям, которые не относятся ни к одному диску или хранилищу.

## http&#95;handlers {#http_handlers}

Позволяет использовать пользовательские HTTP-обработчики.
Чтобы добавить новый http-обработчик, просто добавьте новый `<rule>`.
Правила проверяются сверху вниз в указанном порядке,
и первый совпавший запустит обработчик.

Следующие настройки могут быть заданы с помощью подтегов:

| Sub-tags             | Definition                                                                                                                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                | Для сопоставления URL запроса можно использовать префикс &#39;regex:&#39; для сопоставления по регулярному выражению (необязательно)                                                                                          |
| `methods`            | Для сопоставления HTTP-методов запроса можно использовать запятую для перечисления нескольких методов (необязательно)                                                                                                         |
| `headers`            | Для сопоставления заголовков запроса сопоставьте каждый дочерний элемент (имя дочернего элемента — это имя заголовка); можно использовать префикс &#39;regex:&#39; для сопоставления по регулярному выражению (необязательно) |
| `handler`            | Обработчик запроса                                                                                                                                                                                                            |
| `empty_query_string` | Проверяет, что в URL отсутствует query string                                                                                                                                                                                 |

`handler` содержит следующие настройки, которые можно задать с помощью подтегов:

| Sub-tags           | Definition                                                                                                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`              | Адрес для перенаправления                                                                                                                                                                                       |
| `type`             | Поддерживаемые типы: static, dynamic&#95;query&#95;handler, predefined&#95;query&#95;handler, redirect                                                                                                          |
| `status`           | Используется с типом static, код статуса ответа                                                                                                                                                                 |
| `query_param_name` | Используется с типом dynamic&#95;query&#95;handler, извлекает и выполняет значение параметра HTTP-запроса, соответствующее `<query_param_name>`                                                                 |
| `query`            | Используется с типом predefined&#95;query&#95;handler, выполняет запрос при вызове обработчика                                                                                                                  |
| `content_type`     | Используется с типом static, content-type ответа                                                                                                                                                                |
| `response_content` | Используется с типом static, содержимое ответа, отправляемое клиенту; при использовании префикса &#39;file://&#39; или &#39;config://&#39; читает содержимое из файла или конфигурации и отправляет его клиенту |

Вместе со списком правил вы можете указать `<defaults/>`, который включает все обработчики по умолчанию.

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

Используется для добавления заголовков в ответ на HTTP-запрос `OPTIONS`.
Метод `OPTIONS` используется при выполнении предварительных CORS-запросов (preflight).

Дополнительную информацию см. в разделе [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS).

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

Открывается `https://tabix.io/` при обращении к `http://localhost:http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```

## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />Размер фонового пула потоков для каталога Iceberg

## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Максимальное количество задач, которые можно поставить в очередь пула каталога Iceberg

## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Максимальный размер кэша файлов метаданных Iceberg в записях. Ноль означает отключение кэша.

## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики кэширования метаданных Iceberg.

## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Максимальный размер кэша метаданных Iceberg в байтах. Нулевое значение означает отключение.

## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше метаданных Iceberg относительно общего размера кэша.

## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если имеет значение `true`, ClickHouse не записывает значение по умолчанию для пустого оператора `SQL SECURITY` в запросах `CREATE VIEW`.

:::note
Этот параметр необходим только на период миграции и станет устаревшим в версии 24.4.
:::

## include&#95;from {#include_from}

Путь к файлу с подстановками. Поддерживаются форматы XML и YAML.

Подробнее см. раздел «[Configuration files](/operations/configuration-files)».

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```

## index_mark_cache_policy {#index_mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша меток вторичного индекса.

## index_mark_cache_size {#index_mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

Максимальный размер кэша меток индекса.

:::note

Значение `0` означает, что кэш отключен.

Этот параметр можно изменять во время работы; изменения вступают в силу немедленно.
:::

## index_mark_cache_size_ratio {#index_mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.3" />Размер защищённой очереди (в случае политики SLRU) во вторичном кэше меток индекса относительно его общего размера.

## index_uncompressed_cache_policy {#index_uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики кэша несжатого вторичного индекса.

## index_uncompressed_cache_size {#index_uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер кэша для несжатых блоков индексов `MergeTree`.

:::note
Значение `0` означает, что кэш отключен.

Этот параметр можно изменить во время работы, и изменение вступит в силу немедленно.
:::

## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (при политике SLRU) в кэше несжатого вторичного индекса относительно общего размера кэша.

## interserver&#95;http&#95;credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики, используя эти учетные данные.
Поэтому значение `interserver_http_credentials` должно быть одинаковым для всех реплик в кластере.

:::note

* По умолчанию, если раздел `interserver_http_credentials` опущен, аутентификация при репликации не используется.
* Настройки `interserver_http_credentials` не относятся к [конфигурации](../../interfaces/cli.md#configuration_files) учетных данных клиента ClickHouse.
* Эти учетные данные общие для репликации через `HTTP` и `HTTPS`.
  :::

Следующие настройки могут быть заданы в под-тегах:

* `user` — Имя пользователя.
* `password` — Пароль.
* `allow_empty` — Если `true`, другим репликам разрешено подключаться без аутентификации, даже если заданы учетные данные. Если `false`, подключения без аутентификации отклоняются. Значение по умолчанию: `false`.
* `old` — Содержит старые `user` и `password`, используемые при ротации учетных данных. Может быть указано несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию межсерверных учетных данных без одновременной остановки всех реплик для обновления их конфигурации. Учетные данные можно менять в несколько шагов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволяет выполнять подключения как с аутентификацией, так и без нее.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите для `allow_empty` значение `false` или удалите этот параметр. Это делает обязательной аутентификацию с использованием новых учетных данных.

Чтобы изменить текущие учетные данные, переместите имя пользователя и пароль в раздел `interserver_http_credentials.old` и задайте новые значения для `user` и `password`. На этом этапе сервер использует новые учетные данные для подключения к другим репликам и принимает подключения как с новыми, так и со старыми учетными данными.

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

## interserver&#95;http&#95;host {#interserver_http_host}

Имя хоста, которое может использоваться другими серверами для доступа к этому серверу.

Если параметр не задан, значение определяется так же, как командой `hostname -f`.

Полезно для отвязки от конкретного сетевого интерфейса.

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

Аналогично [`interserver_http_host`](#interserver_http_host), только это имя хоста может использоваться другими серверами для доступа к этому серверу по протоколу `HTTPS`.

**Пример**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```

## interserver&#95;https&#95;port {#interserver_https_port}

Порт для обмена данными между серверами ClickHouse через `HTTPS`.

**Пример**

```xml
<interserver_https_port>9010</interserver_https_port>
```

## interserver&#95;listen&#95;host {#interserver_listen_host}

Ограничение на список хостов, которые могут обмениваться данными между серверами ClickHouse.
Если используется Keeper, то это же ограничение будет применяться к обмену данными между разными экземплярами Keeper.

:::note
По умолчанию значение равно настройке [`listen_host`](#listen_host).
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

<SettingsInfoBlock type="Bool" default_value="0" />Сохранять семплированные выделения памяти jemalloc в system.trace_log

## jemalloc_enable_background_threads {#jemalloc_enable_background_threads} 

<SettingsInfoBlock type="Bool" default_value="1" />Включает фоновые потоки jemalloc. Jemalloc использует фоновые потоки для очистки неиспользуемых страниц памяти. Отключение этой настройки может привести к снижению производительности.

## jemalloc_enable_global_profiler {#jemalloc_enable_global_profiler} 

<SettingsInfoBlock type="Bool" default_value="0" />Включает глобальный профилировщик выделений jemalloc для всех потоков. Jemalloc будет выборочно профилировать выделения и все освобождения для выборочно отобранных выделений.
Профили можно сбрасывать с помощью SYSTEM JEMALLOC FLUSH PROFILE, что можно использовать для анализа выделений.
Образцы также могут сохраняться в system.trace_log с помощью настройки jemalloc_collect_global_profile_samples_in_trace_log или параметра запроса jemalloc_collect_profile_samples_in_trace_log.
См. раздел [Профилирование выделений](/operations/allocation-profiling)

## jemalloc_flush_profile_interval_bytes {#jemalloc_flush_profile_interval_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />Сброс профиля jemalloc будет выполнен после того, как глобальное пиковое использование памяти увеличится на величину jemalloc_flush_profile_interval_bytes.

## jemalloc_flush_profile_on_memory_exceeded {#jemalloc_flush_profile_on_memory_exceeded} 

<SettingsInfoBlock type="Bool" default_value="0" />Сброс профиля jemalloc будет выполняться при ошибках, связанных с превышением общего объёма памяти

## jemalloc_max_background_threads_num {#jemalloc_max_background_threads_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальное количество фоновых потоков jemalloc, которое будет создано; установите 0, чтобы использовать значение jemalloc по умолчанию

## keep&#95;alive&#95;timeout {#keep_alive_timeout}

<SettingsInfoBlock type="Seconds" default_value="30" />

Количество секунд, в течение которых ClickHouse ожидает входящие HTTP-запросы перед закрытием соединения.

**Пример**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```

## keeper_hosts {#keeper_hosts} 

Динамический параметр. Содержит набор хостов [Zoo]Keeper, к которым ClickHouse потенциально может подключиться. Не раскрывает информацию, содержащуюся в `<auxiliary_zookeepers>`.

## keeper_multiread_batch_size {#keeper_multiread_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальный размер пакета для запроса MultiRead к [Zoo]Keeper, поддерживающему пакетную обработку. Если установлено значение 0, пакетная обработка отключена. Доступно только в ClickHouse Cloud.

## ldap_servers {#ldap_servers} 

Перечислите здесь LDAP-серверы с их параметрами подключения, чтобы:

- использовать их как средства аутентификации для выделенных локальных пользователей, у которых вместо механизма аутентификации `password` указан механизм `ldap`;
- использовать их как удалённые каталоги пользователей.

Следующие настройки могут быть заданы с помощью подтегов:

| Параметр                        | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|---------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                          | Имя хоста или IP-адрес LDAP-сервера, этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                                                                                                                      |
| `port`                          | Порт LDAP-сервера, по умолчанию `636`, если `enable_tls` установлен в `true`, иначе `389`.                                                                                                                                                                                                                                                                                                                                                  |
| `bind_dn`                       | Шаблон, используемый для построения DN для привязки (bind). Итоговый DN будет сформирован путём замены всех подстрок `\{user_name\}` в шаблоне фактическим именем пользователя при каждой попытке аутентификации.                                                                                                                                                                                                                          |
| `user_dn_detection`             | Раздел с параметрами поиска LDAP для определения фактического пользовательского DN привязанного пользователя. В основном используется в поисковых фильтрах для последующего отображения ролей, когда сервер — Active Directory. Результирующий пользовательский DN будет использоваться при замене подстрок `\{user_dn\}` в тех местах, где это допустимо. По умолчанию пользовательский DN равен bind DN, но после выполнения поиска он будет обновлён до фактически обнаруженного значения пользовательского DN. |
| `verification_cooldown`         | Промежуток времени в секундах после успешной попытки привязки, в течение которого предполагается, что пользователь успешно аутентифицирован для всех последовательных запросов без обращения к LDAP-серверу. Укажите `0` (значение по умолчанию), чтобы отключить кэширование и принудительно обращаться к LDAP-серверу для каждого запроса аутентификации.                                                                                      |
| `enable_tls`                    | Флаг, включающий использование защищённого соединения с LDAP-сервером. Укажите `no` для протокола в открытом виде (`ldap://`) (не рекомендуется). Укажите `yes` для LDAP поверх SSL/TLS (`ldaps://`) (рекомендуется, значение по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (протокол в открытом виде (`ldap://`), обновляемый до TLS).                                                                                                  |
| `tls_minimum_protocol_version`  | Минимальная версия протокола SSL/TLS. Допустимые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (значение по умолчанию).                                                                                                                                                                                                                                                                                                          |
| `tls_require_cert`              | Поведение проверки сертификата SSL/TLS узла (peer). Допустимые значения: `never`, `allow`, `try`, `demand` (значение по умолчанию).                                                                                                                                                                                                                                                                                                        |
| `tls_cert_file`                 | Путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `tls_key_file`                  | Путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_file`              | Путь к файлу CA-сертификата.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_ca_cert_dir`               | Путь к каталогу, содержащему CA-сертификаты.                                                                                                                                                                                                                                                                                                                                                                                               |
| `tls_cipher_suite`              | Разрешённый набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                                                                                              |

Настройка `user_dn_detection` может быть задана с помощью подтегов:

| Параметр        | Описание                                                                                                                                                                                                                                                                                                                                 |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | Шаблон, используемый для построения базового DN для поиска LDAP. Итоговый DN будет сформирован путём замены всех подстрок `\{user_name\}` и `\{bind_dn\}` в шаблоне фактическим именем пользователя и bind DN во время поиска LDAP.                                                                                                   |
| `scope`         | Область поиска LDAP. Допустимые значения: `base`, `one_level`, `children`, `subtree` (значение по умолчанию).                                                                                                                                                                                                                                                                 |
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

Пример (типичный Active Directory с настроенным определением DN пользователя для последующего сопоставления с ролями):

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

Лицензионный ключ ClickHouse Enterprise Edition

## listen&#95;backlog {#listen_backlog}

Очередь (размер очереди ожидающих подключений) для listen-сокета. Значение по умолчанию `4096` совпадает со значением в Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не требуется менять, поскольку:

* Значение по умолчанию достаточно велико,
* Для приёма клиентских подключений сервер использует отдельный поток.

Поэтому даже если у вас значение `TcpExtListenOverflows` (из `nstat`) ненулевое и этот счётчик для сервера ClickHouse растёт, это не значит, что данное значение нужно увеличивать, поскольку:

* Обычно, если `4096` недостаточно, это указывает на внутреннюю проблему масштабирования ClickHouse, и лучше сообщить об этой проблеме.
* Это не означает, что сервер сможет обрабатывать больше подключений в дальнейшем (и даже если бы смог, к тому моменту клиенты уже могут завершить работу или отключиться).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```

## listen&#95;host {#listen_host}

Ограничение на хосты, с которых могут поступать запросы. Если вы хотите, чтобы сервер отвечал на запросы со всех хостов, укажите `::`.

Примеры:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```

## listen&#95;reuse&#95;port {#listen_reuse_port}

Позволяет нескольким серверам прослушивать один и тот же адрес и порт. Запросы будут операционной системой направляться на случайный сервер. Включать этот параметр не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

Значение по умолчанию:

## listen&#95;try {#listen_try}

Сервер не завершит работу, если сети IPv6 или IPv4 недоступны при попытке начать прослушивание.

**Пример**

```xml
<listen_try>0</listen_try>
```

## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />Размер фонового пула потоков для загрузки меток

## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно поместить в очередь пула предварительной выборки

## logger {#logger} 

Расположение и формат сообщений журнала.

**Ключи**:

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | Уровень журналирования. Допустимые значения: `none` (выключить логирование), `fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test` |
| `log`                  | Путь к файлу журнала.                                                                                                                                              |
| `errorlog`             | Путь к файлу журнала ошибок.                                                                                                                                       |
| `size`                 | Политика ротации: максимальный размер файлов журнала в байтах. Когда размер файла журнала превышает это значение, он переименовывается и архивируется, а новый файл журнала создаётся. |
| `count`                | Политика ротации: максимальное количество архивных файлов журнала ClickHouse, которое будет сохраняться.                                                          |
| `stream_compress`      | Сжимать сообщения журнала с помощью LZ4. Установите `1` или `true`, чтобы включить.                                                                               |
| `console`              | Включить журналирование в консоль. Установите `1` или `true`, чтобы включить. По умолчанию `1`, если ClickHouse не запущен в режиме демона, иначе `0`.            |
| `console_log_level`    | Уровень журналирования для вывода в консоль. По умолчанию совпадает с `level`.                                                                                    |
| `formatting.type`      | Формат журнала для вывода в консоль. В настоящее время поддерживается только `json`.                                                                              |
| `use_syslog`           | Дополнительно перенаправлять вывод журнала в syslog.                                                                                                               |
| `syslog_level`         | Уровень журналирования для вывода в syslog.                                                                                                                        |
| `async`                | При `true` (по умолчанию) журналирование выполняется асинхронно (по одному фоновому потоку на каждый канал вывода). В противном случае запись выполняется в потоке, вызывающем LOG. |
| `async_queue_max_size` | При использовании асинхронного журналирования — максимальное количество сообщений, которое будет храниться в очереди в ожидании сброса. Лишние сообщения будут отброшены. |
| `startup_level`        | Уровень при запуске, используемый для установки уровня корневого логгера при старте сервера. После запуска уровень журналирования возвращается к настройке `level`. |
| `shutdown_level`       | Уровень при завершении работы, используемый для установки уровня корневого логгера при остановке сервера.                                                         |

**Спецификаторы формата журнала**

Имена файлов в путях `log` и `errorLog` поддерживают приведённые ниже спецификаторы формата для результирующего имени файла (часть пути, отвечающая за каталог, их не поддерживает).

Столбец "Example" показывает вывод для `2023-07-06 18:32:07`.

| Спецификатор | Описание                                                                                                                                                                                               | Пример                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| `%%`         | Литерал %                                                                                                                                                                                              | `%`                        |
| `%n`         | Символ новой строки                                                                                                                                                                                    |                            |
| `%t`         | Символ горизонтальной табуляции                                                                                                                                                                        |                            |
| `%Y`         | Год в виде десятичного числа, например 2017                                                                                                                                                            | `2023`                     |
| `%y`         | Две последние цифры года в десятичном формате (диапазон [00, 99])                                                                                                                                      | `23`                       |
| `%C`         | Первые две цифры года в десятичной записи (диапазон [00, 99])                                                                                                                                          | `20`                       |
| `%G`         | Четырёхзначный [год в недельной системе летоисчисления ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), то есть год, который содержит указанную неделю. Обычно используется только с `%V` | `2023`                     |
| `%g`         | Последние 2 цифры [года по недельной системе исчисления ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), то есть года, в который входит указанная неделя.                                 | `23`                       |
| `%b`         | Сокращённое название месяца, например Oct (в зависимости от локали)                                                                                                                                    | `Июл`                      |
| `%h`         | Синоним для %b                                                                                                                                                                                         | `июл.`                     |
| `%B`         | Полное название месяца, например «October» (в зависимости от локали)                                                                                                                                   | `Июль`                     |
| `%m`         | Месяц как десятичное число (диапазон [01, 12])                                                                                                                                                         | `07`                       |
| `%U`         | Номер недели года в виде десятичного числа (воскресенье — первый день недели) (диапазон [00,53])                                                                                                       | `27`                       |
| `%W`         | Неделя года как десятичное число (понедельник — первый день недели) (диапазон [00,53])                                                                                                                 | `27`                       |
| `%V`         | Номер недели по стандарту ISO 8601 (диапазон [01,53])                                                                                                                                                  | `27`                       |
| `%j`         | День года как десятичное число (диапазон [001, 366])                                                                                                                                                   | `187`                      |
| `%d`         | День месяца в виде десятичного числа с ведущим нулём (диапазон [01,31]). Однозначные числа записываются с ведущим нулём.                                                                               | `06`                       |
| `%e`         | День месяца в виде десятичного числа, дополненного пробелом слева (диапазон [1, 31]). Для однозначных чисел используется ведущий пробел.                                                               | `&nbsp; 6`                 |
| `%a`         | Сокращённое название дня недели, например, «Пт» (зависит от локали)                                                                                                                                    | `чт`                       |
| `%A`         | Полное название дня недели, например, Friday (в зависимости от локали)                                                                                                                                 | `Четверг`                  |
| `%w`         | День недели как целое число, где воскресенье — 0 (диапазон [0–6])                                                                                                                                      | `4`                        |
| `%u`         | День недели в виде десятичного числа, где понедельник — 1 (формат ISO 8601, значения от 1 до 7)                                                                                                        | `4`                        |
| `%H`         | Часы в виде десятичного числа в 24-часовом формате (диапазон [00–23])                                                                                                                                  | `18`                       |
| `%I`         | Час в виде десятичного числа, 12-часовой формат (диапазон [01, 12])                                                                                                                                    | `06`                       |
| `%M`         | Минута в десятичном виде (диапазон [00, 59])                                                                                                                                                           | `32`                       |
| `%S`         | Секунда как десятичное число (диапазон [00,60])                                                                                                                                                        | `07`                       |
| `%c`         | Стандартное строковое представление даты и времени, например Sun Oct 17 04:41:13 2010 (формат зависит от локали)                                                                                       | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованный формат даты (зависит от локали)                                                                                                                                                         | `06.07.23`                 |
| `%X`         | Локализованное представление времени, например 18:40:20 или 6:40:20 PM (в зависимости от локали)                                                                                                       | `18:32:07`                 |
| `%D`         | Краткий формат даты MM/DD/YY, эквивалентный %m/%d/%y                                                                                                                                                   | `07/06/23`                 |
| `%F`         | Краткий формат даты YYYY-MM-DD, эквивалентный %Y-%m-%d                                                                                                                                                 | `2023-07-06`               |
| `%r`         | Локализованное время в 12-часовом формате (зависит от настроек локали)                                                                                                                                 | `18:32:07`                 |
| `%R`         | Эквивалентно &quot;%H:%M&quot;                                                                                                                                                                         | `18:32`                    |
| `%T`         | Эквивалентно &quot;%H:%M:%S&quot; (формату времени ISO 8601)                                                                                                                                           | `18:32:07`                 |
| `%p`         | Локализованное обозначение a.m./p.m. (зависит от локали)                                                                                                                                               | `PM`                       |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430) или пустая строка, если информация о часовом поясе недоступна                                                                                     | `+0800`                    |
| `%Z`         | Зависящее от локали название или сокращение часового пояса, либо пустая строка, если информация о часовом поясе недоступна                                                                             | `Z AWST `                  |

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

Чтобы выводить лог-сообщения только в консоль:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**Переопределения уровней для отдельных логгеров**

Уровень логирования отдельных логгеров можно переопределить. Например, чтобы отключить все сообщения логгеров «Backup» и «RBAC».

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

Чтобы дополнительно записывать сообщения журнала в syslog:

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

| Key        | Description                                                                                                                                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | Адрес syslog в формате `host\[:port\]`. Если не указан, используется локальный демон.                                                                                                                                                                                        |
| `hostname` | Имя хоста, с которого отправляются логи (необязательный параметр).                                                                                                                                                                                                           |
| `facility` | [Ключевое слово facility](https://en.wikipedia.org/wiki/Syslog#Facility) syslog. Должно быть указано заглавными буквами с префиксом «LOG&#95;», например `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т. д. По умолчанию: `LOG_USER`, если указан `address`, иначе `LOG_DAEMON`. |
| `format`   | Формат сообщения журнала. Возможные значения: `bsd` и `syslog`.                                                                                                                                                                                                              |

**Форматы логов**

Вы можете указать формат логов, который будет выводиться в консольный журнал. В настоящее время поддерживается только JSON.

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
  "message": "Received signal 2",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

Используйте следующий фрагмент, чтобы включить поддержку логирования в формате JSON:

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- Можно настроить для каждого канала отдельно (log, errorlog, console, syslog) или глобально для всех каналов (в этом случае просто опустите параметр). -->
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

Имена ключей можно изменять, изменяя значения тегов внутри тега `<names>`. Например, чтобы заменить `DATE_TIME` на `MY_DATE_TIME`, можно использовать `<date_time>MY_DATE_TIME</date_time>`.

**Пропуск ключей для JSON-логов**

Свойства логов можно опустить, закомментировав соответствующее свойство. Например, если вы не хотите, чтобы в логе выводился `query_id`, можно закомментировать тег `<query_id>`.

## macros {#macros}

Подстановки параметров для реплицируемых таблиц.

Можно не указывать, если реплицируемые таблицы не используются.

Для получения дополнительной информации см. раздел [Создание реплицируемых таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```

## Политика кэширования меток {#mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики кэширования меток.

## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />Часть общего объёма кэша меток, заполняемая при предварительном прогреве.

## mark_cache_size {#mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

Максимальный размер кэша для меток (индекса таблиц семейства [`MergeTree`](/engines/table-engines/mergetree-family)).

:::note
Этот параметр можно изменять во время работы, и изменения вступают в силу сразу.
:::

## mark_cache_size_ratio {#mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди кэша меток (в случае политики SLRU) относительно общего размера кэша.

## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />Количество потоков для загрузки активного набора частей данных (в состоянии Active) при запуске.

## max_authentication_methods_per_user {#max_authentication_methods_per_user} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Максимальное количество методов аутентификации, с которыми пользователь может быть создан или изменён.
Изменение этого параметра не влияет на существующих пользователей. Запросы на создание/изменение, связанные с аутентификацией, завершатся ошибкой, если они превышают лимит, указанный в этом параметре.
Запросы на создание/изменение, не связанные с аутентификацией, будут успешно выполнены.

:::note
Значение `0` означает отсутствие ограничения.
:::

## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения в байтах в секунду для всех резервных копий на сервере. Ноль означает отсутствие ограничений.

## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Если количество **бездействующих** потоков в пуле потоков ввода-вывода резервного копирования (Backups IO Thread pool) превышает `max_backup_io_thread_pool_free_size`, ClickHouse освобождает ресурсы, занятые этими потоками, и уменьшает размер пула. При необходимости потоки могут быть созданы заново.

## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse использует потоки из пула Backups IO Thread pool для выполнения операций ввода‑вывода при резервном копировании в S3. `max_backups_io_thread_pool_size` ограничивает максимальное количество потоков в этом пуле.

## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />

Максимальное количество потоков, используемых для построения векторных индексов.

:::note
Значение `0` означает использование всех ядер.
:::

## max_concurrent_insert_queries {#max_concurrent_insert_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение общего числа одновременно выполняющихся запросов `INSERT`.

:::note

Значение `0` (по умолчанию) означает отсутствие ограничения.

Этот параметр можно изменить во время работы, и он вступит в силу немедленно. Уже выполняющиеся запросы останутся без изменений.
:::

## max_concurrent_queries {#max_concurrent_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на общее количество одновременно выполняемых запросов. Также следует учитывать ограничения на запросы `INSERT` и `SELECT`, а также на максимальное количество запросов для пользователей.

См. также:

- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

Значение `0` (по умолчанию) означает отсутствие ограничения.

Этот параметр можно изменить во время работы сервера, и изменение вступит в силу немедленно. Уже выполняющиеся запросы останутся без изменений.
:::

## max_concurrent_select_queries {#max_concurrent_select_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на общее количество одновременно выполняемых запросов `SELECT`.

:::note

Значение `0` (по умолчанию) означает отсутствие ограничения.

Этот SETTING можно изменить во время работы, и изменение вступит в силу немедленно. Уже выполняющиеся запросы останутся без изменений.
:::

## max_connections {#max_connections} 

<SettingsInfoBlock type="Int32" default_value="4096" />Максимальное количество подключений к серверу.

## max_database_num_to_throw {#max_database_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />Если количество баз данных больше этого значения, сервер выбросит исключение. 0 означает отсутствие ограничений.

## max&#95;database&#95;num&#95;to&#95;warn {#max_database_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если количество подключённых баз данных превышает заданное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```

## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size} 

<SettingsInfoBlock type="UInt32" default_value="1" />Количество потоков для создания таблиц во время восстановления реплики в DatabaseReplicated. Ноль означает, что количество потоков равно количеству ядер.

## max&#95;dictionary&#95;num&#95;to&#95;throw {#max_dictionary_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество словарей превышает это значение, на сервере будет сгенерировано исключение.

Учитываются только таблицы для движков баз данных:

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

Если число подключенных словарей превышает указанное значение, сервер ClickHouse добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```

## max_distributed_cache_read_bandwidth_for_server {#max_distributed_cache_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная суммарная скорость чтения с распределённого кэша на сервере в байтах в секунду. Ноль означает отсутствие ограничения.

## max_distributed_cache_write_bandwidth_for_server {#max_distributed_cache_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная суммарная скорость записи в распределённый кэш на сервере в байтах в секунду. Ноль означает, что ограничений нет.

## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Сколько записей может содержать статистика хеш‑таблицы, собираемая во время агрегации

## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />Количество потоков, используемых командой ALTER TABLE FETCH PARTITION.

## max_format_parsing_thread_pool_free_size {#max_format_parsing_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество свободных ожидающих потоков, поддерживаемых в пуле потоков для разбора входных данных.

## max_format_parsing_thread_pool_size {#max_format_parsing_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Максимальное общее количество потоков, используемых для парсинга входных данных.

## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество **бездействующих** потоков в пуле потоков ввода-вывода превышает `max_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые простаивающими потоками, и уменьшит размер пула. При необходимости потоки могут быть созданы снова.

## max_io_thread_pool_size {#max_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse использует потоки из пула потоков ввода-вывода (IO thread pool) для выполнения части операций ввода-вывода (например, для взаимодействия с S3). `max_io_thread_pool_size` ограничивает максимальное количество потоков в этом пуле.

## max&#95;keep&#95;alive&#95;requests {#max_keep_alive_requests}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество запросов через одно keep-alive-соединение, после чего оно будет закрыто сервером ClickHouse.

**Пример**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```

## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость операций локального чтения в байтах в секунду.

:::note
Значение `0` означает отсутствие ограничений.
:::

## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная локальная пропускная способность записи в байтах в секунду.

:::note
Значение `0` означает отсутствие ограничений.
:::

## max_materialized_views_count_for_table {#max_materialized_views_count_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на количество materialized views, прикреплённых к таблице.

:::note
Здесь учитываются только непосредственно зависящие от таблицы представления; создание представления поверх другого представления не учитывается.
:::

## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения данных всеми операциями слияния на сервере в байтах в секунду. Ноль означает отсутствие ограничений.

## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения для всех мутаций на сервере в байтах в секунду. Ноль означает отсутствие ограничений.

## max&#95;named&#95;collection&#95;num&#95;to&#95;throw {#max_named_collection_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество именованных коллекций превышает это значение, сервер выбросит исключение.

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```

## max&#95;named&#95;collection&#95;num&#95;to&#95;warn {#max_named_collection_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если число именованных коллекций превышает указанное значение, сервер ClickHouse добавит предупреждения в таблицу `system.warnings`.

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

Максимальное отношение между временем ожидания CPU в ОС (метрика OSCPUWaitMicroseconds) и временем его занятости (метрика OSCPUVirtualTimeMicroseconds), при котором принимается решение о разрыве соединений. Для вычисления вероятности используется линейная интерполяция между минимальным и максимальным значениями отношения; при этом значении вероятность равна 1.
См. подробности в разделе [Управление поведением при перегрузке CPU сервера](/operations/settings/server-overload).

## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />Количество потоков для загрузки неактивных (устаревших) частей данных при запуске.

## max&#95;part&#95;num&#95;to&#95;warn {#max_part_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="100000" />

Если количество активных частей превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```

## max&#95;partition&#95;size&#95;to&#95;drop {#max_partition_size_to_drop}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

Ограничение на удаление партиций.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает [`max_partition_size_to_drop`](#max_partition_size_to_drop) (в байтах), вы не можете удалить партицию с помощью запроса [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart).
Для применения этого SETTING не требуется перезапуск сервера ClickHouse. Другой способ снять это ограничение — создать файл `<clickhouse-path>/flags/force_drop_table`.

:::note
Значение `0` означает, что вы можете удалять партиции без каких-либо ограничений.

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

Если время выполнения какой-либо из ожидающих мутаций превышает заданное значение (в секундах), сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```

## max&#95;pending&#95;mutations&#95;to&#95;warn {#max_pending_mutations_to_warn}

<SettingsInfoBlock type="UInt64" default_value="500" />

Если количество невыполненных мутаций превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```

## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если число **простаивающих** потоков в пуле потоков десериализации префиксов превышает `max_prefixes_deserialization_thread_pool_free_size`, ClickHouse освободит ресурсы, занятые простаивающими потоками, и уменьшит размер пула. При необходимости потоки могут быть созданы заново.

## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse использует потоки из пула десериализации префиксов для параллельного чтения метаданных столбцов и подстолбцов из префиксов файлов в широких частях таблиц MergeTree. `max_prefixes_deserialization_thread_pool_size` ограничивает максимальное количество потоков в пуле.

## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость обмена данными по сети в байтах в секунду при чтении.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость передачи данных по сети при записи, в байтах в секунду.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничения.
:::

## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость обмена данными по сети в байтах в секунду для реплицируемых выборок (replicated fetches). Ноль означает отсутствие ограничения.

## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость обмена данными по сети в байтах в секунду для реплицированных отправок. Ноль означает отсутствие ограничения.

## max&#95;replicated&#95;table&#95;num&#95;to&#95;throw {#max_replicated_table_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество реплицируемых таблиц превышает это значение, сервер выбросит исключение.

Считаются только таблицы баз данных со следующими движками:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**

```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```

## max_server_memory_usage {#max_server_memory_usage} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объём памяти в байтах, который серверу разрешено использовать.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается настройкой `max_server_memory_usage_to_ram_ratio`.
:::

В особом случае значение `0` (значение по умолчанию) означает, что сервер может использовать всю доступную память (за исключением дополнительных ограничений, задаваемых `max_server_memory_usage_to_ram_ratio`).

## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />

Максимальный объём памяти, который серверу разрешено использовать, выраженный как отношение ко всему доступному объёму памяти.

Например, значение `0.9` (по умолчанию) означает, что сервер может потреблять 90% доступной памяти.

Позволяет снизить использование памяти на системах с небольшим объёмом оперативной памяти.
На хостах с малым объёмом RAM и swap может потребоваться задать [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) больше 1.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается настройкой `max_server_memory_usage`.
:::

## max&#95;session&#95;timeout {#max_session_timeout}

Максимальный тайм-аут сеанса, в секундах.

Пример:

```xml
<max_session_timeout>3600</max_session_timeout>
```

## max&#95;table&#95;num&#95;to&#95;throw {#max_table_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество таблиц превышает это значение, сервер выбросит исключение.

Следующие таблицы не учитываются:

* view
* remote
* dictionary
* system

Учитываются только таблицы баз данных со следующими движками:

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

Если количество подключённых таблиц превышает указанное значение, сервер ClickHouse добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```

## max&#95;table&#95;size&#95;to&#95;drop {#max_table_size_to_drop}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

Ограничение на удаление таблиц по размеру.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает `max_table_size_to_drop` (в байтах), вы не можете удалить её с помощью запросов [`DROP`](../../sql-reference/statements/drop.md) или [`TRUNCATE`](../../sql-reference/statements/truncate.md).

:::note
Значение `0` означает, что вы можете удалять все таблицы без каких-либо ограничений.

Для применения этой настройки не требуется перезапуск сервера ClickHouse. Другой способ отключить ограничение — создать файл `<clickhouse-path>/flags/force_drop_table`.
:::

**Пример**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```

## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объем дискового пространства, который может быть использован для внешней агрегации, операций JOIN или сортировки.
Запросы, превышающие этот лимит, приведут к возникновению исключения.

:::note
Значение `0` означает отсутствие ограничения.
:::

См. также:

- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

## max&#95;thread&#95;pool&#95;free&#95;size {#max_thread_pool_free_size}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если количество **простаивающих** потоков в глобальном пуле потоков больше, чем [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size), ClickHouse освобождает ресурсы, занимаемые некоторыми потоками, и размер пула уменьшается. При необходимости потоки создаются снова.

**Пример**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```

## max&#95;thread&#95;pool&#95;size {#max_thread_pool_size}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse использует потоки из глобального пула потоков (Global Thread Pool) для обработки запросов. Если в пуле нет свободного потока для обработки запроса, создаётся новый поток. `max_thread_pool_size` ограничивает максимально допустимое количество потоков в пуле.

**Пример**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```

## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Количество потоков, используемых для загрузки неактивного набора частей данных (unexpected parts) при запуске.

## max&#95;view&#95;num&#95;to&#95;throw {#max_view_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество представлений превышает это значение, сервер выбросит исключение.

Учитываются только таблицы для движков баз данных:

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

Если количество присоединённых представлений превышает указанное значение, сервер ClickHouse запишет предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```

## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на общее число запросов, одновременно находящихся в ожидании.
Выполнение ожидающего запроса блокируется, пока необходимые таблицы загружаются асинхронно (см. [`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases)).

:::note
Ожидающие запросы не учитываются при проверке ограничений, задаваемых следующими настройками:

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

Это сделано для того, чтобы избежать срабатывания этих ограничений сразу после запуска сервера.
:::

:::note

Значение `0` (по умолчанию) означает отсутствие ограничения.

Эту настройку можно изменять во время работы сервера; изменения вступают в силу немедленно. Уже выполняющиеся запросы останутся без изменений.
:::

## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

<SettingsInfoBlock type="Bool" default_value="0" />

Должен ли фоновый обработчик памяти корректировать внутренний трекер памяти на основе информации из внешних источников, таких как jemalloc и cgroups.

## memory_worker_period_ms {#memory_worker_period_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Период тиков фонового обработчика памяти, который корректирует учет использования памяти в трекере памяти и очищает неиспользуемые страницы при высоком уровне использования памяти. Если установлено значение 0, используется значение по умолчанию, зависящее от источника использования памяти.

## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

<SettingsInfoBlock type="Bool" default_value="1" />Использовать актуальные данные об использовании памяти текущей cgroup для корректировки учета памяти.

## merge&#95;tree {#merge_tree}

Параметры тонкой настройки для таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Дополнительные сведения см. в заголовочном файле MergeTreeSettings.h.

**Пример**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

## merge_workload {#merge_workload} 

<SettingsInfoBlock type="String" default_value="default" />

Используется для регулирования того, как ресурсы распределяются и используются между операциями слияния и другими нагрузками. Указанное значение используется как значение настройки `workload` для всех фоновых слияний. Может быть переопределено настройкой MergeTree.

**См. также**

- [Планирование нагрузки](/operations/workload-scheduling.md)

## merges&#95;mutations&#95;memory&#95;usage&#95;soft&#95;limit {#merges_mutations_memory_usage_soft_limit}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает лимит на объем оперативной памяти, который можно использовать для выполнения операций слияния и мутаций.
Если ClickHouse достигнет заданного лимита, он перестанет планировать новые фоновые операции слияния или мутации, но продолжит выполнять уже запланированные задачи.

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```

## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />

Значение параметра `merges_mutations_memory_usage_soft_limit` по умолчанию вычисляется как `memory_amount * merges_mutations_memory_usage_to_ram_ratio`.

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

Чтобы отключить настройку `metric_log`, необходимо создать файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />

Минимальное соотношение между временем ожидания CPU в ОС (метрика OSCPUWaitMicroseconds) и временем его занятости (метрика OSCPUVirtualTimeMicroseconds), начиная с которого соединения могут быть разорваны. Для вычисления вероятности используется линейная интерполяция между минимальным и максимальным соотношениями, при этом в этой точке вероятность равна 0.
Дополнительные сведения см. в разделе [Управление поведением сервера при перегрузке CPU](/operations/settings/server-overload).

## mlock&#95;executable {#mlock_executable}

Выполняет `mlockall` после запуска, чтобы уменьшить задержку первых запросов и предотвратить выгрузку исполняемого файла ClickHouse в условиях высокой нагрузки на ввод‑вывод.

:::note
Рекомендуется включить эту опцию, однако это приведёт к увеличению времени запуска на несколько секунд.
Имейте в виду, что этот параметр не будет работать без capability «CAP&#95;IPC&#95;LOCK».
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```

## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

Этот параметр позволяет избежать частых вызовов open/close (которые очень затратны из‑за последующих промахов по страницам) и повторно использовать отображения (mappings) между несколькими потоками и запросами. Значение параметра — это количество отображённых регионов (обычно равно количеству отображённых файлов).

Объём данных в отображённых файлах можно отслеживать в следующих системных таблицах по следующим метрикам:

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells` в [`system.metrics`](/operations/system-tables/metrics), [`system.metric_log`](/operations/system-tables/metric_log)
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses` в [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)

:::note
Объём данных в отображённых файлах напрямую не занимает оперативную память и не учитывается в использовании памяти запросом или сервером, поскольку эта память может быть освобождена, подобно кэшу страниц ОС. Кэш сбрасывается (файлы закрываются) автоматически при удалении старых частей в таблицах семейства MergeTree, а также может быть сброшен вручную запросом `SYSTEM DROP MMAP CACHE`.

Этот параметр можно изменять во время работы сервера, и изменения вступают в силу немедленно.
:::

## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />

Используется для регулирования того, как ресурсы выделяются и распределяются между мутациями и другими нагрузками. Указанное значение используется как значение настройки `workload` для всех фоновых мутаций. Может быть переопределено настройкой MergeTree.

**См. также**

- [Планирование нагрузки](/operations/workload-scheduling.md)

## mysql&#95;port {#mysql_port}

Порт для взаимодействия с клиентами по протоколу MySQL.

:::note

* Положительные целые числа задают номер порта для прослушивания
* Пустые значения используются для отключения взаимодействия с клиентами по протоколу MySQL.
  :::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```

## mysql_require_secure_transport {#mysql_require_secure_transport} 

Если параметр имеет значение true, для взаимодействия с клиентами через [mysql_port](#mysql_port) требуется защищённое соединение. Подключения с опцией `--ssl-mode=none` будут отклоняться. Используйте совместно с настройками [OpenSSL](#openssl).

## openSSL {#openssl} 

Настройка SSL-клиента и сервера.

Поддержка SSL обеспечивается библиотекой `libpoco`. Доступные параметры конфигурации описаны в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи настроек сервера и клиента:

| Параметр                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Значение по умолчанию                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | Путь к файлу с закрытым ключом сертификата в формате PEM. Файл может одновременно содержать и ключ, и сертификат.                                                                                                                                                                                                                                                                                                                                                                        |                                                                                            |
| `certificateFile`             | Путь к файлу клиентского/серверного сертификата в формате PEM. Можно не указывать, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                                                            |                                                                                            |
| `caConfig`                    | Путь к файлу или каталогу, содержащему доверенные сертификаты CA. Если указывается файл, он должен быть в формате PEM и может содержать несколько сертификатов CA. Если указывается каталог, он должен содержать по одному файлу .pem на каждый сертификат CA. Имена файлов подбираются по хеш-значению имени субъекта CA. Подробности см. на man-странице [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                                                                            |
| `verificationMode`            | Метод проверки сертификатов узла. Подробности приведены в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                                                           | `relaxed`                                                                                  |
| `verificationDepth`           | Максимальная допустимая длина цепочки проверки. Проверка завершится ошибкой, если длина цепочки сертификатов превышает заданное значение.                                                                                                                                                                                                                                                                                                                                                | `9`                                                                                        |
| `loadDefaultCAFile`           | Будут ли использоваться встроенные сертификаты удостоверяющих центров (CA) OpenSSL. ClickHouse предполагает, что встроенные сертификаты УЦ находятся в файле `/etc/ssl/cert.pem` (соответственно, в каталоге `/etc/ssl/certs`) или в файле (соответственно, каталоге), указанном в переменной окружения `SSL_CERT_FILE` (соответственно, `SSL_CERT_DIR`).                                                                                                                                | `true`                                                                                     |
| `cipherList`                  | Поддерживаемые алгоритмы шифрования OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                             | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | Включает или отключает кэширование сеансов. Должен использоваться совместно с `sessionIdContext`. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                  | `false`                                                                                    |
| `sessionIdContext`            | Уникальная последовательность случайных символов, которую сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Использование этого параметра всегда рекомендуется, поскольку он помогает избежать проблем как при кэшировании сеанса сервером, так и при запросе кэширования со стороны клиента.                                                                                                                | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | Максимальное количество сеансов, которые сервер кэширует. Значение `0` означает неограниченное количество сеансов.                                                                                                                                                                                                                                                                                                                                                                       | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | Время хранения сессии в кеше на сервере (в часах).                                                                                                                                                                                                                                                                                                                                                                                                                                       | `2`                                                                                        |
| `extendedVerification`        | Если параметр включён, убедитесь, что CN или SAN сертификата совпадает с именем хоста пира.                                                                                                                                                                                                                                                                                                                                                                                              | `false`                                                                                    |
| `requireTLSv1`                | Требовать использование соединения по TLSv1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                                                                    |
| `requireTLSv1_1`              | Требовать соединение по TLSv1.1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                   | `false`                                                                                    |
| `requireTLSv1_2`              | Требовать соединение по TLSv1.2. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                   | `false`                                                                                    |
| `fips`                        | Активирует режим OpenSSL FIPS. Поддерживается, если используемая библиотекой версия OpenSSL поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                           | `false`                                                                                    |
| `privateKeyPassphraseHandler` | Класс (подкласс PrivateKeyPassphraseHandler), который запрашивает парольную фразу для доступа к закрытому ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                             | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | Класс (подкласс CertificateHandler) для обработки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` .                                                                                                                                                                                                                                                                                            | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | Протоколы, использование которых не допускается.                                                                                                                                                                                                                                                                                                                                                                                                                                         |                                                                                            |
| `preferServerCiphers`         | Шифры сервера, предпочитаемые клиентом.                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `false`                                                                                    |

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

## opentelemetry&#95;span&#95;log {#opentelemetry_span_log}

Настройки системной таблицы [`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md).

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

## os_collect_psi_metrics {#os_collect_psi_metrics} 

<SettingsInfoBlock type="Bool" default_value="1" />Включить учет метрик PSI из файлов /proc/pressure/.

## os_cpu_busy_time_threshold {#os_cpu_busy_time_threshold} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Порог занятого времени CPU операционной системы в микросекундах (метрика OSCPUVirtualTimeMicroseconds), при превышении которого считается, что CPU выполняет полезную работу; если занятое время ниже этого значения, перегрузка CPU не фиксируется.

## os_threads_nice_value_distributed_cache_tcp_handler {#os_threads_nice_value_distributed_cache_tcp_handler} 

<SettingsInfoBlock type="Int32" default_value="0" />

Значение `nice` в Linux для потоков обработчика TCP распределённого кэша. Меньшие значения означают более высокий приоритет использования CPU.

Требуется CAP_SYS_NICE capability, иначе параметр не оказывает эффекта.

Возможные значения: от -20 до 19.

## os_threads_nice_value_merge_mutate {#os_threads_nice_value_merge_mutate} 

<SettingsInfoBlock type="Int32" default_value="0" />

Значение `nice` в Linux для потоков слияния и мутаций. Меньшие значения означают более высокий приоритет использования CPU.

Требуется capability CAP_SYS_NICE, иначе параметр не оказывает эффекта.

Возможные значения: от -20 до 19.

## os_threads_nice_value_zookeeper_client_send_receive {#os_threads_nice_value_zookeeper_client_send_receive} 

<SettingsInfoBlock type="Int32" default_value="0" />

Значение nice в Linux для потоков отправки и получения в клиенте ZooKeeper. Меньшие значения означают более высокий приоритет по отношению к CPU.

Требует capability CAP_SYS_NICE, иначе параметр не оказывает эффекта.

Возможные значения: от -20 до 19.

## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

<SettingsInfoBlock type="Double" default_value="0.15" />Доля лимита памяти, которую следует оставлять свободной от кэша страниц в пространстве пользователя (userspace). Аналогично параметру Linux min_free_kbytes.

## page_cache_history_window_ms {#page_cache_history_window_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Задержка перед тем, как освобождённая память может быть повторно использована кэшем страниц в пространстве пользователя.

## page_cache_max_size {#page_cache_max_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальный размер кэша страниц в пространстве пользователя (userspace page cache). Установите значение 0, чтобы отключить кэш. Если значение больше, чем page_cache_min_size, размер кэша будет динамически изменяться в этих пределах, чтобы использовать большую часть доступной памяти, при этом общее потребление памяти будет оставаться ниже заданного лимита (max_server_memory_usage[_to_ram_ratio]).

## page_cache_min_size {#page_cache_min_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />Минимальный размер кэша страниц в пользовательском пространстве.

## page_cache_policy {#page_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша страниц в пространстве пользователя.

## page_cache_shards {#page_cache_shards} 

<SettingsInfoBlock type="UInt64" default_value="4" />Разделяет пользовательский кэш страниц Stripe на такое количество сегментов, чтобы уменьшить конкуренцию за мьютекс. Экспериментальная опция, вряд ли даст прирост производительности.

## page_cache_size_ratio {#page_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди в кэше страниц в пользовательском пространстве по отношению к общему размеру кэша.

## part&#95;log {#part_log}

Журналирование событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md), например добавления или слияния данных. Этот журнал можно использовать для моделирования алгоритмов слияния и сравнения их характеристик, а также для визуализации процесса слияния.

Запросы записываются в таблицу [system.part&#95;log](/operations/system-tables/part_log), а не в отдельный файл. Имя этой таблицы можно настроить с помощью параметра `table` (см. ниже).

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

Период до полного удаления частей для SharedMergeTree. Доступно только в ClickHouse Cloud.

## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />

Добавляет к `kill_delay_period` равномерно распределённое значение в диапазоне от 0 до x секунд, чтобы избежать «эффекта стада» и последующей DoS-атаки на ZooKeeper в случае очень большого числа таблиц. Доступно только в ClickHouse Cloud.

## parts_killer_pool_size {#parts_killer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />

Потоки, выполняющие очистку устаревших потоков shared MergeTree. Доступно только в ClickHouse Cloud

## path {#path}

Путь к каталогу, содержащему данные.

:::note
Обязателен слэш в конце пути.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```

## postgresql&#95;port {#postgresql_port}

Порт для взаимодействия с клиентами по протоколу PostgreSQL.

:::note

* Положительные целые числа указывают номер порта, который будет прослушиваться
* Пустые значения используются для отключения взаимодействия с клиентами по протоколу PostgreSQL.
  :::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```

## postgresql_require_secure_transport {#postgresql_require_secure_transport} 

Если имеет значение true, для клиентов на порту [postgresql_port](#postgresql_port) требуется защищённое соединение. Подключения с опцией `sslmode=disable` будут отклонены. Используйте совместно с настройками [OpenSSL](#openssl).

## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />Размер фонового пула предварительной подгрузки данных для удалённых объектных хранилищ

## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно поместить в пул предварительной выборки

## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество задач, которые могут быть поставлены в очередь пула потоков десериализации префиксов.

:::note
Значение `0` означает отсутствие ограничений.
:::

## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение параметра равно `true`, ClickHouse создаёт все сконфигурированные таблицы `system.*_log` до запуска. Это может быть полезно, если некоторые скрипты запуска зависят от этих таблиц.

## primary_index_cache_policy {#primary_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша первичного индекса.

## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />Доля общего размера кэша меток, заполняемая при предварительном прогреве.

## primary_index_cache_size {#primary_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />Максимальный размер кэша первичного индекса (индекса таблиц семейства MergeTree).

## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше первичного индекса по отношению к общему размеру кэша.

## process&#95;query&#95;plan&#95;packet {#process_query_plan_packet}

<SettingsInfoBlock type="Bool" default_value="0" />

Этот параметр позволяет читать пакет QueryPlan. Этот пакет отправляется при выполнении распределённых запросов, когда включён serialize&#95;query&#95;plan.
По умолчанию параметр отключён, чтобы избежать возможных проблем с безопасностью, которые могут быть вызваны ошибками при бинарной десериализации плана запроса.

**Пример**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```

## processors&#95;profile&#95;log {#processors_profile_log}

Настройки системной таблицы [`processors_profile_log`](../system-tables/processors_profile_log.md).

<SystemLogParameters />

Следующие настройки используются по умолчанию:

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

Экспорт метрик для сбора системой [Prometheus](https://prometheus.io).

Параметры:

* `endpoint` – HTTP-эндпоинт для сбора метрик сервером Prometheus. Должен начинаться с &#39;/&#39;.
* `port` – Порт для `endpoint`.
* `metrics` – Публиковать метрики из таблицы [system.metrics](/operations/system-tables/metrics).
* `events` – Публиковать метрики из таблицы [system.events](/operations/system-tables/events).
* `asynchronous_metrics` – Публиковать текущие значения метрик из таблицы [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics).
* `errors` - Публиковать количество ошибок по их кодам, произошедших с момента последнего перезапуска сервера. Эту информацию также можно получить из таблицы [system.errors](/operations/system-tables/errors).

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

Определяет прокси-серверы для HTTP- и HTTPS-запросов, в настоящее время поддерживаемые хранилищем S3, табличными функциями S3 и функциями URL.

Существует три способа задать прокси-серверы:

* переменные окружения
* списки прокси
* удалённые резолверы прокси.

Обход прокси-серверов для отдельных хостов также поддерживается с помощью `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать
прокси-сервер для заданного протокола. Если они настроены в вашей системе, всё должно работать прозрачно.

Это самый простой подход, если для данного протокола
используется только один прокси-сервер и этот прокси-сервер не меняется.

**Списки прокси**

Этот подход позволяет указать один или несколько
прокси-серверов для протокола. Если определено более одного прокси-сервера,
ClickHouse использует разные прокси по циклу (round-robin), распределяя
нагрузку между серверами. Это самый простой подход, если для протокола
существует более одного прокси-сервера и список прокси-серверов не меняется.

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

Выберите родительское поле на вкладках ниже, чтобы просмотреть его дочерние поля:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Field     | Description                               |
    | --------- | ----------------------------------------- |
    | `<http>`  | Список одного или нескольких HTTP‑прокси  |
    | `<https>` | Список одного или нескольких HTTPS‑прокси |
  </TabItem>

  <TabItem value="http_https" label="<http> и <https>">
    | Field   | Description        |
    | ------- | ------------------ |
    | `<uri>` | URI прокси‑сервера |
  </TabItem>
</Tabs>

**Удалённые прокси‑резолверы**

Прокси‑серверы могут динамически изменяться. В этом случае вы можете задать конечную точку (endpoint) резолвера. ClickHouse отправляет пустой GET‑запрос на эту конечную точку, а удалённый резолвер должен вернуть хост прокси.
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
    | Поле      | Описание                                    |
    | --------- | ------------------------------------------- |
    | `<http>`  | Список из одного или нескольких резолверов* |
    | `<https>` | Список из одного или нескольких резолверов* |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | Поле         | Описание                                    |
    | ------------ | ------------------------------------------- |
    | `<resolver>` | Конечная точка и другие параметры резолвера |

    :::note
    Можно использовать несколько элементов `<resolver>`, но обрабатывается только
    первый `<resolver>` для данного протокола. Все остальные элементы `<resolver>`
    для этого протокола игнорируются. Это означает, что балансировка нагрузки
    (если требуется) должна быть реализована на стороне удалённого резолвера.
    :::
  </TabItem>

  <TabItem value="resolver" label="<resolver>">
    | Поле                 | Описание                                                                                                                                                                                              |
    | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `<endpoint>`         | URI прокси-резолвера                                                                                                                                                                                  |
    | `<proxy_scheme>`     | Протокол итогового URI прокси. Может быть либо `http`, либо `https`.                                                                                                                                  |
    | `<proxy_port>`       | Номер порта прокси-резолвера                                                                                                                                                                          |
    | `<proxy_cache_time>` | Время в секундах, в течение которого значения от резолвера должны кэшироваться в ClickHouse. Установка значения `0` заставляет ClickHouse обращаться к резолверу для каждого HTTP- или HTTPS-запроса. |
  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:

| Порядок | Настройка                  |
| ------- | -------------------------- |
| 1.      | Удалённые прокси-резолверы |
| 2.      | Списки прокси              |
| 3.      | Переменные окружения       |

ClickHouse проверит тип резолвера с наивысшим приоритетом для протокола запроса. Если он не определён,
будет проверен следующий по приоритету тип резолвера, пока не будет достигнут резолвер окружения.
Также допускается комбинировать различные типы резолверов.

## query&#95;cache {#query_cache}

Конфигурация [кэша запросов](../query-cache.md).

Доступны следующие настройки:

| Setting                   | Description                                                                                         | Default Value |
| ------------------------- | --------------------------------------------------------------------------------------------------- | ------------- |
| `max_size_in_bytes`       | Максимальный размер кэша в байтах. Значение `0` означает, что кэш запросов отключён.                | `1073741824`  |
| `max_entries`             | Максимальное количество результатов запросов `SELECT`, сохраняемых в кэше.                          | `1024`        |
| `max_entry_size_in_bytes` | Максимальный размер результатов запросов `SELECT` в байтах, которые могут быть сохранены в кэше.    | `1048576`     |
| `max_entry_size_in_rows`  | Максимальное количество строк в результатах запросов `SELECT`, которые могут быть сохранены в кэше. | `30000000`    |

:::note

* Изменённые настройки вступают в силу немедленно.
* Память под кэш запросов выделяется в оперативной памяти (DRAM). Если память ограничена, задайте небольшое значение для `max_size_in_bytes` или полностью отключите кэш запросов.
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

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша условий запроса.

## query_condition_cache_size {#query_condition_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />

Максимальный размер кэша условий запроса.
:::note
Этот параметр можно изменять во время работы сервера; изменения вступают в силу немедленно.
:::

## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше условий запроса относительно общего размера кэша.

## query&#95;log {#query_log}

Параметр для ведения журнала запросов, полученных при включённой настройке [log&#95;queries=1](../../operations/settings/settings.md).

Запросы записываются в таблицу [system.query&#95;log](/operations/system-tables/query_log), а не в отдельный файл. Вы можете изменить имя таблицы с помощью параметра `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура журнала запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет создана автоматически.

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

Правила на основе регулярных выражений, которые применяются к запросам, а также ко всем сообщениям журнала перед тем, как они будут сохранены в серверные логи,
таблицы [`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes), а также в логи, отправляемые клиенту. Это позволяет предотвратить утечку конфиденциальных данных из SQL-запросов (таких как имена, адреса электронной почты, персональные идентификаторы или номера кредитных карт) в логи.

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

| Параметр  | Описание                                                                                  |
| --------- | ----------------------------------------------------------------------------------------- |
| `name`    | имя правила (необязательно)                                                               |
| `regexp`  | регулярное выражение, совместимое с RE2 (обязательно)                                     |
| `replace` | строка для замены конфиденциальных данных (необязательно, по умолчанию — шесть звездочек) |

Правила маскирования применяются ко всему запросу (чтобы предотвратить утечку конфиденциальных данных из некорректных или неразбираемых запросов).

В таблице [`system.events`](/operations/system-tables/events) есть счётчик `QueryMaskingRulesMatch`, который отражает общее количество срабатываний правил маскирования запросов.

Для распределённых запросов каждый сервер необходимо настраивать отдельно, иначе подзапросы, передаваемые на другие узлы, будут сохраняться без маскирования.

## query&#95;metric&#95;log {#query_metric_log}

По умолчанию он отключён.

**Включение**

Чтобы вручную включить сбор истории метрик [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md), создайте `/etc/clickhouse-server/config.d/query_metric_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `query_metric_log`, необходимо создать файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## query&#95;thread&#95;log {#query_thread_log}

Настройка логирования потоков запросов, включаемая параметром [log&#95;query&#95;threads=1](/operations/settings/settings#log_query_threads).

Запросы логируются в таблицу [system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log), а не в отдельный файл. Вы можете изменить имя таблицы с помощью параметра `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура журнала потоков запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и новая таблица создаётся автоматически.

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

Настройка журнала представлений (live, materialized и т. д.), зависящая от запросов, полученных при включённой настройке [log&#95;query&#95;views=1](/operations/settings/settings#log_query_views).

Запросы записываются в таблицу [system.query&#95;views&#95;log](/operations/system-tables/query_views_log), а не в отдельный файл. Вы можете изменить имя таблицы с помощью параметра `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура журнала представлений запросов изменилась после обновления сервера ClickHouse, таблица со старой структурой будет переименована, а новая таблица автоматически создана.

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

Настройка для перераспределения памяти под машинный код («text») с использованием больших страниц памяти (huge pages).

:::note
Эта функция является крайне экспериментальной.
:::

Пример:

```xml
<remap_executable>false</remap_executable>
```

## remote&#95;servers {#remote_servers}

Конфигурация кластеров, используемых [распределённым](../../engines/table-engines/special/distributed.md) движком таблиц Distributed и табличной функцией `cluster`.

**Пример**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

Значение атрибута `incl` см. в разделе «[Configuration files](/operations/configuration-files)».

**См. также**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [Cluster Discovery](../../operations/cluster-discovery.md)
* [Replicated database engine](../../engines/database-engines/replicated.md)

## remote&#95;url&#95;allow&#95;hosts {#remote_url_allow_hosts}

Список хостов, которые разрешено использовать в движках хранения и табличных функциях, работающих с URL.

При добавлении хоста с xml‑тегом `\<host\>`:

* он должен быть указан в точности так же, как в URL, так как имя проверяется до DNS‑разрешения. Например: `<host>clickhouse.com</host>`
* если порт явно указан в URL, то `host:port` проверяется как единое целое. Например: `<host>clickhouse.com:80</host>`
* если хост указан без порта, то разрешен любой порт этого хоста. Например: если указано `<host>clickhouse.com</host>`, то `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т. д. разрешены.
* если хост указан как IP‑адрес, то он проверяется в том же виде, в каком указан в URL. Например: `[2a02:6b8:a::a]`.
* если есть перенаправления и поддержка перенаправлений включена, то каждое перенаправление (поле Location) проверяется.

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```

## replica&#95;group&#95;name {#replica_group_name}

Имя группы реплик для базы данных Replicated.

Кластер, созданный базой данных Replicated, будет состоять из реплик в одной группе.
DDL-запросы будут дожидаться только реплик из той же группы.

По умолчанию — пусто.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```

## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />Таймаут HTTP-подключения для запросов на получение частей. Наследуется из профиля по умолчанию `http_connection_timeout`, если не задан явно.

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />Таймаут ожидания приёма HTTP-ответа для запросов на загрузку части. Наследуется из профиля по умолчанию `http_receive_timeout`, если не задан явно.

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />Тайм-аут HTTP-отправки для запросов на получение частей. Наследуется из профиля по умолчанию `http_send_timeout`, если не задан явно.

## replicated&#95;merge&#95;tree {#replicated_merge_tree}

Тонкая настройка для таблиц в [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Этот SETTING имеет более высокий приоритет.

Для получения дополнительных сведений см. заголовочный файл MergeTreeSettings.h.

**Пример**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```

## restore_threads {#restore_threads} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />Максимальное количество потоков, используемых для выполнения запросов RESTORE.

## s3_credentials_provider_max_cache_size {#s3_credentials_provider_max_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />Максимальное количество провайдеров учетных данных S3, которые могут быть сохранены в кэше

## s3_max_redirects {#s3_max_redirects} 

<SettingsInfoBlock type="UInt64" default_value="10" />Максимальное допустимое количество последовательных перенаправлений S3.

## s3_retry_attempts {#s3_retry_attempts} 

<SettingsInfoBlock type="UInt64" default_value="500" />Настройка для Aws::Client::RetryStrategy, Aws::Client выполняет повторные попытки самостоятельно, 0 означает отсутствие повторных попыток

## s3queue_disable_streaming {#s3queue_disable_streaming} 

<SettingsInfoBlock type="Bool" default_value="0" />Отключает потоковую обработку в S3Queue, даже если таблица создана и к ней подключены материализованные представления.

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

Настройки отправки отчётов о сбоях основной команде разработчиков ClickHouse.

Включение этой опции, особенно в препродукционных средах, крайне приветствуется.

Ключи:

| Key                   | Description                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`             | Булевый флаг для включения функции, по умолчанию `true`. Установите `false`, чтобы отключить отправку отчётов о сбоях.                      |
| `send_logical_errors` | `LOGICAL_ERROR` подобен `assert`, это ошибка (bug) в ClickHouse. Этот булевый флаг включает отправку этих исключений (по умолчанию `true`). |
| `endpoint`            | Вы можете переопределить URL конечной точки для отправки отчётов о сбоях.                                                                   |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```

## series_keeper_path {#series_keeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />

Путь в Keeper с автоинкрементируемыми идентификаторами, которые генерируются функцией `generateSerialID`. Каждая серия будет отдельным узлом-потомком по этому пути.

## show_addresses_in_stack_traces {#show_addresses_in_stack_traces} 

<SettingsInfoBlock type="Bool" default_value="1" />Если включено, в трассировках стека будут отображаться адреса

## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores} 

<SettingsInfoBlock type="Bool" default_value="1" />Если значение параметра равно true, ClickHouse будет ждать завершения выполняющихся операций резервного копирования и восстановления перед завершением работы.

## shutdown_wait_unfinished {#shutdown_wait_unfinished} 

<SettingsInfoBlock type="UInt64" default_value="5" />Задержка в секундах для ожидания незавершённых запросов

## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />Если значение параметра установлено в true, ClickHouse будет дожидаться завершения выполняющихся запросов перед завершением работы.

## skip_binary_checksum_checks {#skip_binary_checksum_checks} 

<SettingsInfoBlock type="Bool" default_value="0" />Пропускает проверки целостности бинарного файла ClickHouse по контрольным суммам

## ssh&#95;server {#ssh_server}

Публичная часть ключа хоста будет записана в файл known&#95;hosts
на стороне SSH-клиента при первом подключении.

Конфигурации ключей хоста по умолчанию отключены.
Раскомментируйте конфигурации ключей хоста и укажите путь к соответствующему SSH-ключу, чтобы их включить:

Пример:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```

## startup_mv_delay_ms {#startup_mv_delay_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />Отладочный параметр для имитации задержки при создании материализованного представления

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

Подтеги, перечисленные выше, определяют следующие настройки для `disks`:

| Setting                 | Description                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `<disk_name_N>`         | Имя диска, которое должно быть уникальным.                                                                       |
| `path`                  | Путь, по которому будут храниться данные сервера (каталоги `data` и `shadow`). Должен заканчиваться символом `/` |
| `keep_free_space_bytes` | Размер зарезервированного свободного места на диске.                                                             |

:::note
Порядок дисков не имеет значения.
:::

### Настройка политик {#configuration-of-policies}

Приведённые выше под-теги определяют следующие параметры для `policies`:

| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `volume_name_N`              | Имя тома. Имена томов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `disk`                       | Диск, расположенный внутри тома.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `max_data_part_size_bytes`   | Максимальный размер фрагмента данных, который может находиться на любом из дисков в этом томе. Если в результате слияния ожидается размер фрагмента больше, чем `max_data_part_size_bytes`, фрагмент будет записан в следующий том. По сути, эта возможность позволяет хранить новые / маленькие фрагменты на «горячем» (SSD) томе и перемещать их на «холодный» (HDD) том при достижении большого размера. Не используйте эту опцию, если в политике только один том.                         |
| `move_factor`                | Доля доступного свободного места на томе. Если свободного места становится меньше, данные начинают переноситься на следующий том, если он есть. Для переноса фрагменты сортируются по размеру от большего к меньшему (по убыванию) и выбираются фрагменты, суммарный размер которых достаточен для выполнения условия `move_factor`; если суммарный размер всех фрагментов недостаточен, будут перенесены все фрагменты.                                                                           |
| `perform_ttl_move_on_insert` | Отключает перемещение данных с истёкшим TTL при вставке. По умолчанию (если включено), если мы вставляем часть данных, срок жизни которой уже истёк согласно правилу перемещения по времени жизни, она немедленно перемещается на том / диск, указанный в правиле перемещения. Это может значительно замедлить вставку в случае, если целевой том / диск медленный (например, S3). Если отключено, просроченная часть данных записывается в том по умолчанию и затем сразу перемещается на том, указанный в правиле для истёкшего TTL. |
| `load_balancing`             | Политика балансировки дисков: `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `least_used_ttl_ms`          | Задаёт таймаут (в миллисекундах) для обновления доступного пространства на всех дисках (`0` — всегда обновлять, `-1` — никогда не обновлять, значение по умолчанию — `60000`). Заметьте: если диск используется только ClickHouse и не будет подвержен динамическому изменению размера файловой системы, можно использовать значение `-1`. Во всех остальных случаях это не рекомендуется, так как в конечном итоге приведёт к некорректному распределению пространства.                         |
| `prefer_not_to_merge`        | Отключает слияние частей данных на этом томе. Примечание: это потенциально вредно и может вызывать замедление. Когда этот параметр включён (не делайте так), слияние данных на этом томе запрещено (что плохо). Это позволяет управлять тем, как ClickHouse работает с медленными дисками. Мы рекомендуем вообще не использовать этот параметр.                                                                                                                                                           |
| `volume_priority`            | Определяет приоритет (порядок), в котором заполняются тома. Чем меньше значение, тем выше приоритет. Значения параметра должны быть натуральными числами и покрывать диапазон от 1 до N (где N — наибольшее указанное значение параметра) без пропусков.                                                                                                                                                                                                                                                        |

Для `volume_priority`:

- Если у всех томов задан этот параметр, они получают приоритет в указанном порядке.
- Если он есть только у _части_ томов, тома без этого параметра имеют наименьший приоритет. Те, у которых он есть, получают приоритет в соответствии со значением тега, приоритет остальных определяется порядком их описания в конфигурационном файле относительно друг друга.
- Если _ни у одного_ тома этот параметр не задан, их порядок определяется порядком описания в конфигурационном файле.
- Приоритет томов может отличаться.

## storage_connections_hard_limit {#storage_connections_hard_limit} 

<SettingsInfoBlock type="UInt64" default_value="200000" />При достижении этого предела при попытке создания будет выброшено исключение. Установите значение 0, чтобы отключить строгое ограничение. Предел применяется к соединениям хранилищ.

## storage_connections_soft_limit {#storage_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />Подключения сверх этого лимита имеют существенно более короткий срок жизни. Лимит применяется к подключениям к хранилищам.

## storage_connections_store_limit {#storage_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Соединения сверх этого лимита сбрасываются после использования. Установите значение 0, чтобы отключить кеш соединений. Лимит применяется к соединениям хранилищ.

## storage_connections_warn_limit {#storage_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="500" />Предупреждающие сообщения записываются в журнал логов, если число используемых соединений превышает это значение. Предел применяется к соединениям хранилищ.

## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

<SettingsInfoBlock type="Bool" default_value="1" />Записывать файлы метаданных диска в формате VERSION_FULL_OBJECT_KEY. По умолчанию включено. Параметр устарел.

## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

<SettingsInfoBlock type="Bool" default_value="1" />Если параметр включён, при создании SharedSet и SharedJoin генерируется внутренний UUID. Только для ClickHouse Cloud

## table_engines_require_grant {#table_engines_require_grant} 

Если установлено в true, пользователям требуется привилегия (`GRANT`) для создания таблицы с определённым движком, например: `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию, для обеспечения обратной совместимости, при создании таблицы с конкретным движком таблицы проверка привилегий игнорируется, однако вы можете изменить это поведение, установив данный параметр в true.
:::

## tables_loader_background_pool_size {#tables_loader_background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Задаёт количество потоков, выполняющих асинхронные задачи загрузки в фоновом пуле. Фоновый пул используется для асинхронной загрузки таблиц после запуска сервера, если нет запросов, ожидающих доступ к таблице. При большом количестве таблиц может быть полезно поддерживать небольшое число потоков в фоновом пуле. Это позволит зарезервировать ресурсы CPU для одновременного выполнения запросов.

:::note
Значение `0` означает, что будут использованы все доступные CPU.
:::

## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Задает число потоков, выполняющих задачи загрузки во foreground-пуле. Foreground-пул используется для синхронной загрузки таблиц до того, как сервер начнет прослушивать порт, а также для загрузки таблиц, загрузки которых ожидают. Foreground-пул имеет более высокий приоритет, чем background-пул. Это означает, что ни одна задача не запускается в background-пуле, пока в foreground-пуле выполняются задачи.

:::note
Значение `0` означает, что будут использованы все доступные процессорные ядра.
:::

## tcp_close_connection_after_queries_num {#tcp_close_connection_after_queries_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальное количество запросов, разрешённых для одного TCP-подключения, после чего подключение закрывается. Установите значение 0 для неограниченного числа запросов.

## tcp_close_connection_after_queries_seconds {#tcp_close_connection_after_queries_seconds} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальное время жизни TCP-соединения в секундах перед его закрытием. Установите значение 0, чтобы время жизни соединения было неограниченным.

## tcp&#95;port {#tcp_port}

Порт для взаимодействия с клиентами по протоколу TCP.

**Пример**

```xml
<tcp_port>9000</tcp_port>
```

## tcp&#95;port&#95;secure {#tcp_port_secure}

TCP-порт для защищённого обмена данными с клиентами. Используйте его совместно с настройками [OpenSSL](#openssl).

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

С помощью этой опции временные данные будут храниться в кэше на конкретном диске.
В этом разделе следует указать имя диска с типом `cache`.
В этом случае кэш и временные данные будут использовать одно и то же пространство, и кэш диска может очищаться для размещения временных данных.

:::note
Для настройки хранилища временных данных можно использовать только одну из следующих опций: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
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

<SettingsInfoBlock type="UInt64" default_value="1000000" />Размер кэша блока словаря текстового индекса (в элементах). Значение 0 отключает кэш.

## text_index_dictionary_block_cache_policy {#text_index_dictionary_block_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования блоков словаря текстового индекса.

## text_index_dictionary_block_cache_size {#text_index_dictionary_block_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Размер кэша для блоков словаря текстового индекса. Ноль означает, что кэш отключен.

:::note
Этот параметр можно изменить во время работы, и изменение вступит в силу немедленно.
:::

## text_index_dictionary_block_cache_size_ratio {#text_index_dictionary_block_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше блоков словаря текстового индекса по отношению к общему размеру кэша.

## text_index_header_cache_max_entries {#text_index_header_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="100000" />Размер кэша заголовка текстового индекса в записях. Ноль — кэш отключён.

## text_index_header_cache_policy {#text_index_header_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кеша заголовков текстового индекса.

## text_index_header_cache_size {#text_index_header_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Размер кэша для заголовков текстового индекса. Нулевое значение отключает кэш.

:::note
Этот параметр можно изменять динамически, и изменения вступают в силу немедленно.
:::

## text_index_header_cache_size_ratio {#text_index_header_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше заголовков текстового индекса относительно общего размера кэша.

## text_index_postings_cache_max_entries {#text_index_postings_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Размер кэша (в записях) для списка вхождений текстового индекса. Ноль означает, что кэш отключен.

## text_index_postings_cache_policy {#text_index_postings_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования списка вхождений текстового индекса.

## text_index_postings_cache_size {#text_index_postings_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="2147483648" />Размер кэша для списков вхождений текстового индекса. Нулевое значение означает, что кэш отключён.

:::note
Этот параметр можно изменить во время работы, и изменение вступит в силу немедленно.
:::

## text_index_postings_cache_size_ratio {#text_index_postings_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше списков вхождений текстового индекса по отношению к общему размеру кэша.

## text&#95;log {#text_log}

Настройки системной таблицы [text&#95;log](/operations/system-tables/text_log) для журналирования текстовых сообщений.

<SystemLogParameters />

Дополнительно:

| Параметр | Описание                                                                                     | Значение по умолчанию |
| -------- | -------------------------------------------------------------------------------------------- | --------------------- |
| `level`  | Максимальный уровень сообщений (по умолчанию `Trace`), которые будут записываться в таблицу. | `Trace`               |

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

Максимальное количество заданий, которые могут быть поставлены в очередь глобального пула потоков. Увеличение размера очереди приводит к большему использованию памяти. Рекомендуется устанавливать это значение равным [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size).

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```

## threadpool_local_fs_reader_pool_size {#threadpool_local_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />Количество потоков в пуле для чтения с локальной файловой системы при `local_filesystem_read_method = 'pread_threadpool'`.

## threadpool_local_fs_reader_queue_size {#threadpool_local_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Максимальное количество задач, которые могут быть поставлены в пул потоков для чтения из локальной файловой системы.

## threadpool_remote_fs_reader_pool_size {#threadpool_remote_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" />Количество потоков в пуле потоков, используемом для чтения из удалённой файловой системы при `remote_filesystem_read_method = 'threadpool'`.

## threadpool_remote_fs_reader_queue_size {#threadpool_remote_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Максимальное количество задач, которые могут быть поставлены в очередь пула потоков для чтения из удалённой файловой системы.

## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />Размер фонового пула для запросов на запись в объектные хранилища

## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Максимальное количество задач, которые можно поставить в фоновый пул потоков для выполнения запросов записи в объектные хранилища

## throw&#95;on&#95;unknown&#95;workload {#throw_on_unknown_workload}

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет поведение при обращении к неизвестному WORKLOAD при установленной настройке запроса &#39;workload&#39;.

* Если `true`, из запроса, который пытается обратиться к неизвестному WORKLOAD, выбрасывается исключение RESOURCE&#95;ACCESS&#95;DENIED. Полезно для принудительного применения планирования ресурсов для всех запросов после того, как иерархия WORKLOAD сформирована и содержит WORKLOAD default.
* Если `false` (по умолчанию), запросу с настройкой &#39;workload&#39;, указывающей на неизвестный WORKLOAD, предоставляется неограниченный доступ без планирования ресурсов. Это важно при настройке иерархии WORKLOAD до того, как будет добавлен WORKLOAD default.

**Пример**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**См. также**

* [Планирование рабочих нагрузок](/operations/workload-scheduling.md)

## timezone {#timezone}

Часовой пояс сервера.

Указывается как идентификатор IANA для часового пояса UTC или географического региона (например, Africa/Abidjan).

Часовой пояс необходим для преобразований между форматами String и DateTime при выводе полей DateTime в текстовый формат (на экран или в файл), а также при получении значения DateTime из строки. Кроме того, часовой пояс используется в функциях, работающих с датой и временем, если они не получили часовой пояс во входных параметрах.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**См. также**

* [session&#95;timezone](../settings/settings.md#session_timezone)

## tmp&#95;path {#tmp_path}

Путь на локальной файловой системе для хранения временных данных при обработке больших запросов.

:::note

* Для настройки хранения временных данных можно использовать только один из параметров: `tmp_path`, `tmp_policy` или `temporary_data_in_cache`.
* Обязателен завершающий слеш.
  :::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```

## tmp&#95;policy {#tmp_policy}

Политика хранения временных данных. Все файлы с префиксом `tmp` будут удалены при запуске.

:::note
Рекомендации по использованию объектного хранилища в качестве `tmp_policy`:

* Используйте отдельный `bucket:path` на каждом сервере
* Используйте `metadata_type=plain`
* Возможно, вы также захотите настроить TTL для этого bucket
  :::

:::note

* Для настройки хранилища временных данных может быть использован только один вариант: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
* Параметры `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes` игнорируются.
* Политика должна содержать ровно *один том*.

Для получения дополнительной информации см. документацию по [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree).
:::

**Пример**

Когда `/disk1` заполнен, временные данные будут сохраняться на `/disk2`.

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

Определяет список пользовательских доменов верхнего уровня, добавляемых к конфигурации, где каждая запись имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

См. также:

* функцию [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) и её вариации,
  которая принимает имя пользовательского списка TLD и возвращает часть домена, включающую поддомены верхнего уровня вплоть до первого значимого поддомена.

## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Собирает случайные выделения памяти (allocations) размером, меньшим или равным указанному значению, с вероятностью, равной `total_memory_profiler_sample_probability`. Значение 0 означает, что параметр отключен. Имеет смысл установить `max_untracked_memory` в 0, чтобы этот порог работал как ожидается.

## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Собирает случайные выделения памяти размером больше или равным заданному значению с вероятностью, равной `total_memory_profiler_sample_probability`. 0 означает, что настройка отключена. Возможно, вам потребуется установить `max_untracked_memory` в 0, чтобы этот порог работал так, как ожидается.

## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />Каждый раз, когда использование памяти сервером превышает очередной порог (в байтах), профилировщик памяти собирает стек вызовов в момент выделения памяти. Ноль означает, что профилировщик памяти отключен. Значения меньше нескольких мегабайт будут замедлять сервер.

## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />

Позволяет собирать случайные операции выделения и освобождения памяти и записывать их в системную таблицу [system.trace_log](../../operations/system-tables/trace_log.md) с `trace_type`, равным `MemorySample`, с указанной вероятностью. Вероятность применяется к каждой операции выделения или освобождения, независимо от объёма выделяемой памяти. Обратите внимание, что семплирование выполняется только тогда, когда объём неотслеживаемой памяти превышает лимит неотслеживаемой памяти (значение по умолчанию — `4` MiB). Этот лимит может быть снижен, если уменьшено значение параметра [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step). Вы можете установить `total_memory_profiler_step` равным `1` для более детализированного семплирования.

Возможные значения:

- Положительное число типа double.
- `0` — запись случайных операций выделения и освобождения памяти в системную таблицу `system.trace_log` отключена.

## trace&#95;log {#trace_log}

Настройки для системной таблицы [trace&#95;log](/operations/system-tables/trace_log).

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

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики несжатого кэша.

## uncompressed_cache_size {#uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер (в байтах) несжатых данных, используемых табличными движками семейства MergeTree.

Для сервера используется один общий кэш. Память выделяется по требованию. Кэш используется, если включена опция `use_uncompressed_cache`.

Кэш несжатых данных может быть полезен для очень коротких запросов в отдельных случаях.

:::note
Значение `0` означает, что кэш отключен.

Этот параметр можно изменять во время работы, и изменения вступают в силу немедленно.
:::

## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае использования политики SLRU) в несжатом кеше относительно общего размера кеша.

## url&#95;scheme&#95;mappers {#url_scheme_mappers}

Конфигурация для преобразования сокращённых или символических префиксов URL в полные URL.

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

Способ хранения заголовков частей данных в ZooKeeper. Этот SETTING применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Его можно задать:

**Глобально в секции [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует этот параметр для всех таблиц на сервере. Вы можете изменить его в любое время. При изменении параметра поведение существующих таблиц также изменяется.

**Для каждой таблицы**

При создании таблицы укажите соответствующий [параметр движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этим параметром не изменяется, даже если глобальный параметр изменён.

**Возможные значения**

- `0` — функциональность отключена.
- `1` — функциональность включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицируемые](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки частей данных компактно, используя один `znode`. Если таблица содержит много столбцов, этот способ хранения существенно уменьшает объём данных, хранящихся в Zookeeper.

:::note
После включения `use_minimalistic_part_header_in_zookeeper = 1` вы не можете откатить сервер ClickHouse на версию, которая не поддерживает этот параметр. Будьте осторожны при обновлении ClickHouse на серверах кластера. Не обновляйте все серверы одновременно. Безопаснее протестировать новые версии ClickHouse в тестовой среде или на нескольких серверах кластера.

Заголовки частей данных, уже сохранённые с этим параметром, нельзя вернуть к предыдущему (некомпактному) представлению.
:::

## user&#95;defined&#95;executable&#95;functions&#95;config {#user_defined_executable_functions_config}

Путь к конфигурационному файлу исполняемых пользовательских функций.

Путь:

* Укажите абсолютный путь или путь относительно конфигурационного файла сервера.
* Путь может содержать подстановочные символы * и ?.

См. также:

* &quot;[Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions).&quot;.

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

Раздел файла конфигурации, содержащий настройки:

* Путь к файлу конфигурации с предопределёнными пользователями.
* Путь к папке, где хранятся пользователи, созданные SQL-командами.
* Путь к узлу ZooKeeper, где хранятся и реплицируются пользователи, созданные SQL-командами.

Если этот раздел указан, путь из [users&#95;config](/operations/server-configuration-parameters/settings#users_config) и [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path) не будет использоваться.

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

Вы также можете определить секции `memory` — для хранения информации только в памяти, без записи на диск, и `ldap` — для хранения информации на LDAP-сервере.

Чтобы добавить LDAP-сервер как удалённый каталог для пользователей, которые не определены локально, определите единственную секцию `ldap` со следующими параметрами:

| Параметр | Описание                                                                                                                                                                                                                                                                                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server` | одно из имён LDAP-серверов, определённых в секции конфигурации `ldap_servers`. Этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                                       |
| `roles`  | секция со списком локально определённых ролей, которые будут назначены каждому пользователю, полученному с LDAP-сервера. Если роли не указаны, пользователь не сможет выполнять какие-либо действия после аутентификации. Если какая-либо из перечисленных ролей не определена локально на момент аутентификации, попытка аутентификации завершится неудачно, как если бы был указан неверный пароль. |

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

Каталог с пользовательскими файлами. Используется в табличных функциях [file()](../../sql-reference/table-functions/file.md), [fileCluster()](../../sql-reference/table-functions/fileCluster.md).

**Пример**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

## user&#95;scripts&#95;path {#user_scripts_path}

Каталог с файлами пользовательских скриптов. Используется для пользовательских функций типа Executable [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).

**Пример**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

Тип:

Значение по умолчанию:

## users&#95;config {#users_config}

Путь к файлу, в котором содержатся:

* Конфигурации пользователей.
* Права доступа.
* Профили настроек.
* Настройки QUOTA.

**Пример**

```xml
<users_config>users.xml</users_config>
```

## validate&#95;tcp&#95;client&#95;information {#validate_tcp_client_information}

<SettingsInfoBlock type="Bool" default_value="0" />Определяет, включена ли проверка информации о клиенте при получении пакета запроса.

По умолчанию — `false`:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```

## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />Размер кэша (в количестве записей) для индекса векторного сходства. Ноль означает, что кэш отключён.

## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования индекса для поиска по сходству векторов.

## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />Размер кэша для индексов векторного сходства. Нулевое значение отключает кэш.

:::note
Этот параметр можно изменять во время работы сервера; изменения применяются сразу.
:::

## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше индекса векторного сходства относительно его общего размера.

## wait&#95;dictionaries&#95;load&#95;at&#95;startup {#wait_dictionaries_load_at_startup}

<SettingsInfoBlock type="Bool" default_value="1" />

Этот параметр задаёт поведение, если `dictionaries_lazy_load` имеет значение `false`.
(Если `dictionaries_lazy_load` имеет значение `true`, этот параметр ни на что не влияет.)

Если `wait_dictionaries_load_at_startup` имеет значение `false`, сервер
начнёт загружать все словари при старте и одновременно с этим будет принимать подключения.
Когда словарь используется в запросе впервые, запрос будет ждать, пока словарь не загрузится, если он ещё не загружен.
Установка `wait_dictionaries_load_at_startup` в значение `false` может ускорить запуск ClickHouse, однако некоторые запросы могут выполняться медленнее
(поскольку им придётся ждать загрузки некоторых словарей).

Если `wait_dictionaries_load_at_startup` имеет значение `true`, сервер при запуске будет ждать
завершения загрузки всех словарей (успешно или с ошибкой) перед тем, как начать принимать подключения.

**Пример**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```

## workload&#95;path {#workload_path}

Каталог, используемый как хранилище для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется папка `/workload/` в рабочем каталоге сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**См. также**

* [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)

## workload&#95;zookeeper&#95;path {#workload_zookeeper_path}

Путь к узлу ZooKeeper, который используется как хранилище для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для единообразия все SQL-определения хранятся в значении единственного znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**См. также**

* [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)

## zookeeper {#zookeeper}

Содержит настройки, которые позволяют ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицируемых таблиц. Если реплицируемые таблицы не используются, этот раздел параметров можно опустить.

Следующие настройки могут быть заданы с помощью подтегов:

| Параметр                                   | Описание                                                                                                                                                                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | Точка входа ZooKeeper. Можно задать несколько точек входа. Например: `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` определяет порядок узлов при попытке подключения к кластеру ZooKeeper. |
| `session_timeout_ms`                       | Максимальный таймаут клиентской сессии в миллисекундах.                                                                                                                                                                          |
| `operation_timeout_ms`                     | Максимальный таймаут одной операции в миллисекундах.                                                                                                                                                                             |
| `root` (optional)                          | Znode, который используется как корневой для znode, используемых сервером ClickHouse.                                                                                                                                            |
| `fallback_session_lifetime.min` (optional) | Минимальный предел времени жизни сессии ZooKeeper с резервным узлом, когда основной недоступен (балансировка нагрузки). Задаётся в секундах. По умолчанию: 3 часа.                                                               |
| `fallback_session_lifetime.max` (optional) | Максимальный предел времени жизни сессии ZooKeeper с резервным узлом, когда основной недоступен (балансировка нагрузки). Задаётся в секундах. По умолчанию: 6 часов.                                                             |
| `identity` (optional)                      | Пользователь и пароль, которые ZooKeeper запрашивает для доступа к запрашиваемым znode.                                                                                                                                          |
| `use_compression` (optional)               | Включает сжатие в протоколе Keeper, если установлено значение true.                                                                                                                                                              |

Также существует параметр `zookeeper_load_balancing` (необязательно), который позволяет выбрать алгоритм выбора узла ZooKeeper:

| Имя алгоритма                   | Описание                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `random`                        | случайным образом выбирает один из узлов ZooKeeper.                                                                   |
| `in_order`                      | выбирает первый узел ZooKeeper, если он недоступен, то второй и так далее.                                            |
| `nearest_hostname`              | выбирает узел ZooKeeper с именем хоста, максимально похожим на имя хоста сервера; имя хоста сравнивается по префиксу. |
| `hostname_levenshtein_distance` | аналогично `nearest_hostname`, но сравнение имён хостов выполняется по метрике расстояния Левенштейна.                |
| `first_or_random`               | выбирает первый узел ZooKeeper, если он недоступен, то случайным образом выбирает один из оставшихся узлов ZooKeeper. |
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
* [Руководство программиста ZooKeeper](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
* [Необязательное защищённое взаимодействие между ClickHouse и ZooKeeper](/operations/ssl-zookeeper)

## zookeeper&#95;log {#zookeeper_log}

Настройки для системной таблицы [`zookeeper_log`](/operations/system-tables/zookeeper_log).

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
