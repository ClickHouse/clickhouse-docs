---
description: 'Этот раздел содержит описания настроек сервера, то есть настроек,
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

В этом разделе приведены описания настроек сервера. Это настройки,
которые не могут быть изменены на уровне сеанса или запроса.

Для получения дополнительной информации о конфигурационных файлах в ClickHouse см. раздел [«Configuration Files»](/operations/configuration-files).

Другие настройки описаны в разделе [«Settings»](/operations/settings/overview). Перед изучением настроек рекомендуется прочитать раздел [«Configuration files»](/operations/configuration-files)
и обратить внимание на использование подстановок (атрибуты `incl` и `optional`).

## abort_on_logical_error {#abort_on_logical_error} 

<SettingsInfoBlock type="Bool" default_value="0" />При возникновении исключений LOGICAL_ERROR аварийно завершает работу сервера. Только для экспертов.

## access&#95;control&#95;improvements {#access_control_improvements}

Настройки для необязательных улучшений в системе управления доступом.

| Setting                                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Default |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | Определяет, могут ли пользователи без разрешающих политик строк по‑прежнему читать строки с помощью запроса `SELECT`. Например, если есть два пользователя A и B, и политика строк определена только для A, то при значении параметра `true` пользователь B будет видеть все строки. При значении `false` пользователь B не будет видеть ни одной строки.                                                                                                                                                                                                                                   | `true`  |
| `on_cluster_queries_require_cluster_grant`      | Определяет, требуется ли для запросов `ON CLUSTER` привилегия `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `true`  |
| `select_from_system_db_requires_grant`          | Определяет, требуется ли для `SELECT * FROM system.<table>` какие‑либо привилегии или запрос может быть выполнен любым пользователем. Если установлено значение `true`, то для этого запроса требуется `GRANT SELECT ON system.<table>` так же, как и для несистемных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые константные таблицы, такие как `one`, `contributors`) по‑прежнему доступны всем; а если выдана привилегия `SHOW` (например, `SHOW USERS`), то будет доступна соответствующая системная таблица (то есть `system.users`). | `true`  |
| `select_from_information_schema_requires_grant` | Определяет, требуется ли для `SELECT * FROM information_schema.<table>` какие‑либо привилегии или запрос может быть выполнен любым пользователем. Если установлено значение `true`, то для этого запроса требуется `GRANT SELECT ON information_schema.<table>` так же, как и для обычных таблиц.                                                                                                                                                                                                                                                                                           | `true`  |
| `settings_constraints_replace_previous`         | Определяет, будет ли ограничение в профиле настроек для некоторой настройки отменять действия предыдущего ограничения (определённого в других профилях) для этой настройки, включая поля, которые не заданы новым ограничением. Также включает тип ограничения `changeable_in_readonly`.                                                                                                                                                                                                                                                                                                    | `true`  |
| `table_engines_require_grant`                   | Определяет, требуется ли привилегия для создания таблицы с определённым движком таблицы.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `false` |
| `role_cache_expiration_time_seconds`            | Определяет количество секунд с момента последнего обращения, в течение которых роль хранится в Role Cache.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `600`   |

Example:

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

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />Действие, выполняемое при превышении максимального размера элемента массива в groupArray: сгенерировать исключение (`throw`) или отбросить лишние значения (`discard`)

## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

<SettingsInfoBlock type="UInt64" default_value="16777215" />Максимальный размер элемента массива в байтах для функции groupArray. Этот лимит проверяется при сериализации и позволяет избежать чрезмерного размера состояния.

## allow_feature_tier {#allow_feature_tier} 

<SettingsInfoBlock type="UInt32" default_value="0" />

Определяет, может ли пользователь изменять настройки, относящиеся к разным уровням функциональности.

- `0` — Разрешены изменения любых настроек (experimental, beta, production).
- `1` — Разрешены только изменения настроек уровней beta и production. Изменения настроек experimental отклоняются.
- `2` — Разрешены только изменения настроек уровня production. Изменения настроек experimental или beta отклоняются.

Это эквивалентно установке ограничения `readonly` на все функции `EXPERIMENTAL` / `BETA`.

:::note
Значение `0` означает, что можно изменять любые настройки.
:::

## allow_impersonate_user {#allow_impersonate_user} 

<SettingsInfoBlock type="Bool" default_value="0" />Включает/отключает возможность использования функции IMPERSONATE (EXECUTE AS target_user).

## allow&#95;implicit&#95;no&#95;password {#allow_implicit_no_password}

Запрещает создавать пользователя без пароля, если явно не указано &#39;IDENTIFIED WITH no&#95;password&#39;.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## allow&#95;no&#95;password {#allow_no_password}

Устанавливает, разрешён ли небезопасный тип пароля `no&#95;password`.

```xml
<allow_no_password>1</allow_no_password>
```


## allow&#95;plaintext&#95;password {#allow_plaintext_password}

Определяет, разрешено ли использование паролей в открытом виде (небезопасных).

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_use_jemalloc_memory {#allow_use_jemalloc_memory} 

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает использовать jemalloc для управления памятью.

## allowed_disks_for_table_engines {#allowed_disks_for_table_engines} 

Список дисков, разрешённых для использования с Iceberg

## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

<SettingsInfoBlock type="Bool" default_value="1" />Если установлено значение true, то очередь асинхронных вставок сбрасывается при корректном завершении работы сервера

## async_insert_threads {#async_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков для фонового разбора и вставки данных. Ноль означает, что асинхронный режим отключен.

## async&#95;load&#95;databases {#async_load_databases}

<SettingsInfoBlock type="Bool" default_value="1" />

Асинхронная загрузка баз данных и таблиц.

* Если `true`, все несистемные базы данных на движках `Ordinary`, `Atomic` и `Replicated` будут загружаться асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, а также настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к таблице, которая ещё не загружена, будет ждать запуска именно этой таблицы. Если задача загрузки завершится с ошибкой, запрос повторно завершится с этой ошибкой (вместо завершения работы всего сервера в случае `async_load_databases = false`). Таблица, которую ожидает хотя бы один запрос, будет загружаться с более высоким приоритетом. DDL-запросы к базе данных будут ждать запуска именно этой базы данных. Также рассмотрите установку ограничения `max_waiting_queries` на общее количество ожидающих запросов.
* Если `false`, все базы данных загружаются при запуске сервера.

**Пример**

```xml
<async_load_databases>true</async_load_databases>
```


## async&#95;load&#95;system&#95;database {#async_load_system_database}

<SettingsInfoBlock type="Bool" default_value="0" />

Асинхронная загрузка системных таблиц. Полезно, если в базе данных `system` много таблиц логов и частей. Независима от настройки `async_load_databases`.

* Если установлено значение `true`, все системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружаться асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, а также настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который попытается обратиться к системной таблице, которая ещё не загружена, будет ожидать запуска именно этой таблицы. Таблица, которую ожидает как минимум один запрос, будет загружена с повышенным приоритетом. Также рассмотрите настройку `max_waiting_queries`, чтобы ограничить общее количество ожидающих запросов.
* Если установлено значение `false`, системная база данных загружается до запуска сервера.

**Пример**

```xml
<async_load_system_database>true</async_load_system_database>
```


## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="120" />Интервал в секундах для обновления «тяжёлых» асинхронных метрик.

## asynchronous&#95;insert&#95;log {#asynchronous_insert_log}

Настройки системной таблицы [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log) для журналирования асинхронных вставок.

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

Если этот параметр не включен по умолчанию в вашей среде, в зависимости от того, как был установлен ClickHouse, вы можете выполнить следующие действия, чтобы включить или отключить его.

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

Чтобы отключить параметр `asynchronous_metric_log`, нужно создать файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержимым:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />


## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics} 

<SettingsInfoBlock type="Bool" default_value="0" />Включает вычисление ресурсоёмких асинхронных метрик.

## asynchronous_metrics_keeper_metrics_only {#asynchronous_metrics_keeper_metrics_only} 

<SettingsInfoBlock type="Bool" default_value="0" />Заставляет асинхронный сбор метрик вычислять только метрики, относящиеся к Keeper.

## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="1" />Период обновления асинхронных метрик в секундах.

## auth_use_forwarded_address {#auth_use_forwarded_address} 

Использовать исходный адрес для аутентификации клиентов, подключённых через прокси.

:::note
Этот параметр следует использовать с особой осторожностью, так как пересылаемые адреса легко подделать. Серверы, принимающие такую аутентификацию, не должны быть доступны напрямую, а только через доверенный прокси.
:::

## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которые будут использоваться для фонового выполнения операций сброса в [таблицах с движком Buffer](/engines/table-engines/special/buffer).

## background_common_pool_size {#background_common_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Максимальное количество потоков, которые будут использоваться для выполнения различных операций (в основном сбора мусора) для таблиц движка [*MergeTree](/engines/table-engines/mergetree-family) в фоновом режиме.

## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которые будут использоваться для выполнения распределённых отправок.

## background_fetches_pool_size {#background_fetches_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное число потоков, которые будут использоваться для фоновой загрузки частей данных с другой реплики для таблиц семейства движков [*MergeTree](/engines/table-engines/mergetree-family).

## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />

Устанавливает соотношение между количеством потоков и количеством фоновых слияний и мутаций, которые могут выполняться одновременно.

Например, если это соотношение равно 2 и параметр [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) равен 16, то ClickHouse может выполнять 32 фоновых слияния одновременно. Это возможно, поскольку фоновые операции могут быть приостановлены и отложены. Это необходимо для того, чтобы задавать более высокий приоритет выполнению небольших слияний.

:::note
Это соотношение можно увеличить во время работы сервера. Чтобы уменьшить его, необходимо перезапустить сервер.

Как и параметр [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size), настройка [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) может быть применена из профиля `default` для обратной совместимости.
:::

## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

<SettingsInfoBlock type="String" default_value="round_robin" />

Политика планирования фоновых слияний и мутаций. Возможные значения: `round_robin` и `shortest_task_first`.

Алгоритм выбора следующего слияния или мутации, которые будут выполнены пулом фоновых потоков. Политику можно изменять во время работы без перезапуска сервера.
Может быть применена из профиля `default` для сохранения обратной совместимости.

Возможные значения:

- `round_robin` — Каждое одновременное слияние и мутация выполняются в порядке round-robin, чтобы избежать голодания. Малые слияния завершаются быстрее больших просто потому, что содержат меньше блоков для слияния.
- `shortest_task_first` — Всегда выполнять более мелкое слияние или мутацию. Слияниям и мутациям назначаются приоритеты на основе их результирующего размера. Слияния с меньшим размером строго предпочтительнее больших. Эта политика обеспечивает максимально быстрое слияние малых частей, но может приводить к бесконечному голоданию больших слияний в партициях, сильно перегруженных операциями `INSERT`.

## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которое будет использоваться для выполнения фоновых операций потоковой передачи сообщений.

## background_move_pool_size {#background_move_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Максимальное количество потоков, используемых для перемещения частей данных на другой диск или том для таблиц семейства движков *MergeTree в фоновом режиме.

## background&#95;pool&#95;size {#background_pool_size}

<SettingsInfoBlock type="UInt64" default_value="16" />

Определяет количество потоков, выполняющих фоновые слияния и мутации для таблиц с движками MergeTree.

:::note

* Этот параметр также может быть применён при запуске сервера из конфигурации профиля `default` для обеспечения обратной совместимости при запуске сервера ClickHouse.
* Во время работы сервера вы можете только увеличивать количество потоков.
* Чтобы уменьшить количество потоков, необходимо перезапустить сервер.
* Настраивая этот параметр, вы управляете нагрузкой на CPU и диск.
  :::

:::danger
При меньшем размере пула потребляется меньше ресурсов CPU и диска, но фоновые процессы продвигаются медленнее, что в итоге может повлиять на производительность запросов.
:::

Перед изменением этого параметра пожалуйста также ознакомьтесь со связанными настройками MergeTree, такими как:

* [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
* [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).
* [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**Пример**

```xml
<background_pool_size>16</background_pool_size>
```


## background&#95;schedule&#95;pool&#95;log {#background_schedule_pool_log}

Содержит информацию обо всех фоновых задачах, которые выполняются в различных фоновых пулах.

```xml
<background_schedule_pool_log>
    <database>system</database>
    <table>background_schedule_pool_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
    <!-- Only tasks longer than duration_threshold_milliseconds will be logged. Zero means log everything -->
    <duration_threshold_milliseconds>0</duration_threshold_milliseconds>
</background_schedule_pool_log>
```


## background_schedule_pool_max_parallel_tasks_per_type_ratio {#background_schedule_pool_max_parallel_tasks_per_type_ratio} 

<SettingsInfoBlock type="Float" default_value="0.8" />Максимальная доля потоков в пуле, которые могут одновременно выполнять задачи одного типа.

## background_schedule_pool_size {#background_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="512" />Максимальное количество потоков, используемых для постоянного выполнения легковесных периодических операций для реплицируемых таблиц, потоковой обработки данных из Kafka и обновления кэша DNS.

## backup&#95;log {#backup_log}

Настройки системной таблицы [backup&#95;log](../../operations/system-tables/backup_log.md), которая регистрирует операции `BACKUP` и `RESTORE`.

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

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />Максимальное количество потоков для выполнения запросов `BACKUP`.

## backups {#backups}

Настройки резервного копирования, используемые при выполнении команд [`BACKUP` и `RESTORE`](/operations/backup/overview).

Следующие настройки могут быть заданы с помощью подтегов (sub-tags):

{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','Определяет, могут ли несколько операций резервного копирования выполняться одновременно на одном и том же хосте.', 'true'),
    ('allow_concurrent_restores', 'Bool', 'Определяет, могут ли несколько операций восстановления выполняться одновременно на одном и том же хосте.', 'true'),
    ('allowed_disk', 'String', 'Диск, на который выполняется резервное копирование при использовании `File()`. Этот параметр должен быть установлен, чтобы использовать `File`.', ''),
    ('allowed_path', 'String', 'Путь для резервного копирования при использовании `File()`. Этот параметр должен быть установлен, чтобы использовать `File`.', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', 'Количество попыток собрать метаданные перед паузой в случае несогласованности после сравнения собранных метаданных.', '2'),
    ('collect_metadata_timeout', 'UInt64', 'Таймаут в миллисекундах на сбор метаданных во время резервного копирования.', '600000'),
    ('compare_collected_metadata', 'Bool', 'Если установлено в true, сравнивает собранные метаданные с существующими метаданными, чтобы убедиться, что они не изменяются во время резервного копирования.', 'true'),
    ('create_table_timeout', 'UInt64', 'Таймаут в миллисекундах на создание таблиц во время восстановления.', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', 'Максимальное количество попыток повтора после возникновения ошибки неверной версии при координированном резервном копировании/восстановлении.', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Максимальное время ожидания в миллисекундах перед следующей попыткой собрать метаданные.', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Минимальное время ожидания в миллисекундах перед следующей попыткой собрать метаданные.', '5000'),
    ('remove_backup_files_after_failure', 'Bool', 'Если команда `BACKUP` завершилась сбоем, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до сбоя, иначе оставит скопированные файлы как есть.', 'true'),
    ('sync_period_ms', 'UInt64', 'Период синхронизации в миллисекундах для координированного резервного копирования/восстановления.', '5000'),
    ('test_inject_sleep', 'Bool', 'Задержка для тестирования', 'false'),
    ('test_randomize_order', 'Bool', 'Если установлено в true, случайным образом изменяет порядок некоторых операций в тестовых целях.', 'false'),
    ('zookeeper_path', 'String', 'Путь в ZooKeeper, где хранятся метаданные резервного копирования и восстановления при использовании предложения `ON CLUSTER`.', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }


| Setting                                             | Тип    | Описание                                                                                                                                                                     | Значение по умолчанию |
| :-------------------------------------------------- | :----- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | Определяет, могут ли несколько операций резервного копирования выполняться одновременно на одном и том же хосте.                                                             | `true`                |
| `allow_concurrent_restores`                         | Bool   | Определяет, могут ли несколько операций восстановления выполняться одновременно на одном и том же хосте.                                                                     | `true`                |
| `allowed_disk`                                      | String | Диск, на который выполняется резервное копирование при использовании `File()`. Этот параметр должен быть задан, чтобы использовать `File()`.                                 | ``                    |
| `allowed_path`                                      | String | Путь, по которому выполняется резервное копирование при использовании `File()`. Этот параметр должен быть задан, чтобы использовать `File()`.                                | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | Количество попыток собрать метаданные перед переходом в ожидание в случае несоответствий, обнаруженных при сравнении собранных метаданных.                                   | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | Таймаут в миллисекундах для сбора метаданных во время резервного копирования.                                                                                                | `600000`              |
| `compare_collected_metadata`                        | Bool   | Если `true`, сравнивает собранные метаданные с существующими, чтобы убедиться, что они не были изменены во время резервного копирования.                                     | `true`                |
| `create_table_timeout`                              | UInt64 | Таймаут в миллисекундах для создания таблиц во время восстановления.                                                                                                         | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | Максимальное количество повторных попыток после возникновения ошибки «bad version» при координированном резервном копировании/восстановлении.                                | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | Максимальное время ожидания в миллисекундах перед следующей попыткой собрать метаданные.                                                                                     | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | Минимальное время ожидания в миллисекундах перед следующей попыткой собрать метаданные.                                                                                      | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | Если команда `BACKUP` завершилась с ошибкой, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до ошибки, иначе оставит скопированные файлы как есть. | `true`                |
| `sync_period_ms`                                    | UInt64 | Период синхронизации в миллисекундах для координированного резервного копирования/восстановления.                                                                            | `5000`                |
| `test_inject_sleep`                                 | Bool   | Тестовая задержка                                                                                                                                                            | `false`               |
| `test_randomize_order`                              | Bool   | Если `true`, случайным образом меняет порядок некоторых операций в целях тестирования.                                                                                       | `false`               |
| `zookeeper_path`                                    | String | Путь в ZooKeeper, где хранятся метаданные резервного копирования и восстановления при использовании оператора `ON CLUSTER`.                                                  | `/clickhouse/backups` |

Этот параметр по умолчанию настроен следующим образом:

```xml
<backups>
    ....
</backups>
```


## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество заданий, которые могут быть поставлены в очередь пула потоков ввода-вывода резервного копирования (Backups IO thread pool). Рекомендуется не ограничивать размер этой очереди из-за текущей логики резервного копирования в S3.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничения.
:::

## bcrypt&#95;workfactor {#bcrypt_workfactor}

Параметр сложности для типа аутентификации `bcrypt_password`, который использует [алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).
Параметр сложности определяет объем вычислений и время, необходимые для вычисления хеша и проверки пароля.

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
Для приложений с частой аутентификацией
рассмотрите использование альтернативных методов аутентификации
из-за высокой вычислительной нагрузки bcrypt при более высоких значениях параметра сложности (work factor).
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

Интервал в секундах, через который выполняется перезагрузка встроенных словарей.

ClickHouse перезагружает встроенные словари каждые x секунд. Это позволяет редактировать словари «на лету» без перезапуска сервера.

**Пример**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Устанавливает максимальное соотношение размера кэша к объёму оперативной памяти (RAM). Позволяет уменьшить размер кэша на системах с ограниченным объёмом памяти.

## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

<SettingsInfoBlock type="Double" default_value="0" />Для тестирования.

## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

<SettingsInfoBlock type="UInt64" default_value="15" />

Интервал в секундах, в течение которого максимально допустимое потребление памяти сервером корректируется в соответствии с пороговым значением из cgroups.

Чтобы отключить наблюдатель cgroups, установите это значение в `0`.

## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Устанавливает размер кэша (в элементах) для [скомпилированных выражений](../../operations/caches.md).

## compiled_expression_cache_size {#compiled_expression_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />Задает размер кэша (в байтах) для [скомпилированных выражений](../../operations/caches.md).

## compression {#compression}

Настройки сжатия данных для таблиц движка [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

:::note
Мы рекомендуем не изменять эти настройки, если вы только начали работать с ClickHouse.
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
* Если часть данных соответствует нескольким наборам условий, ClickHouse использует первый подходящий набор.

:::note
Если для части данных ни одно из условий не выполняется, ClickHouse использует сжатие `lz4`.
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

Политика, определяющая порядок планирования слотов CPU, задаваемых с помощью `concurrent_threads_soft_limit_num` и `concurrent_threads_soft_limit_ratio_to_cores`. Алгоритм, который определяет, как ограниченное число слотов CPU распределяется между параллельными запросами. Планировщик можно изменить в процессе работы без перезапуска сервера.

Возможные значения:

- `round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 может выделять до `max_threads` слотов CPU. Один слот на поток. При конкуренции за ресурсы слоты CPU выдаются запросам по принципу round-robin. Обратите внимание, что первый слот выделяется безусловно, что может приводить к несправедливому распределению и повышенной задержке выполнения запросов с большим `max_threads` при наличии большого числа запросов с `max_threads` = 1.
- `fair_round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 может выделять до `max_threads - 1` слотов CPU. Вариант `round_robin`, который не требует выделения слота CPU для первого потока каждого запроса. Таким образом, запросы с `max_threads` = 1 не требуют ни одного слота и не могут несправедливо занять все слоты. Слоты не выделяются безусловно.

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное общее количество потоков обработки запросов, за исключением потоков для получения данных с удалённых серверов, которые могут одновременно выполняться для всех запросов. Это не жёсткий лимит. Если лимит достигнут, запрос всё равно получит как минимум один поток для выполнения. Во время выполнения запрос может увеличивать число используемых потоков до требуемого, если дополнительные потоки становятся доступными.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" />То же, что и [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num), но задаётся как коэффициент относительно числа ядер.

## config_reload_interval_ms {#config_reload_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="2000" />

Как часто ClickHouse будет перезагружать конфигурацию и проверять наличие изменений.

## core&#95;dump {#core_dump}

Устанавливает мягкий лимит на размер файла дампа памяти (core dump).

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

Определяет, как выполняется планирование рабочих нагрузок по ресурсам CPU (MASTER THREAD и WORKER THREAD).

* Если `true` (рекомендуется), учёт ведётся по фактическому потреблённому времени CPU. Конкурирующим рабочим нагрузкам выделяется справедливый объём процессорного времени. Слоты выделяются на ограниченный промежуток времени и повторно запрашиваются после его истечения. Запрос слота может блокировать выполнение потока в случае перегрузки CPU‑ресурсов, т. е. может происходить вытеснение (preemption). Это обеспечивает справедливое распределение процессорного времени.
* Если `false` (по умолчанию), учёт ведётся по количеству выделенных CPU‑слотов. Конкурирующим рабочим нагрузкам выделяется справедливое количество CPU‑слотов. Слот выделяется при запуске потока, удерживается непрерывно и освобождается при завершении выполнения потока. Количество потоков, выделенных для выполнения запроса, может увеличиваться только с 1 до `max_threads` и никогда не уменьшаться. Такой режим более благоприятен для долго выполняющихся запросов и может приводить к голоданию по CPU‑ресурсам для коротких запросов.

**Пример**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**См. также**

* [Планирование рабочих нагрузок](/operations/workload-scheduling.md)


## cpu&#95;slot&#95;preemption&#95;timeout&#95;ms {#cpu_slot_preemption_timeout_ms}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Определяет, сколько миллисекунд рабочий поток может ждать во время вытеснения, то есть в ожидании предоставления другого CPU‑слота. По истечении этого тайм-аута, если потоку не удалось получить новый CPU‑слот, он завершает выполнение, а запрос динамически масштабируется вниз до меньшего числа одновременно выполняющихся потоков. Обратите внимание, что основной поток никогда не масштабируется вниз, но может вытесняться бесконечно долго. Имеет смысл только когда `cpu_slot_preemption` включён и ресурс CPU определён для WORKER THREAD.

**Пример**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**См. также**

* [Планирование нагрузки](/operations/workload-scheduling.md)


## cpu&#95;slot&#95;quantum&#95;ns {#cpu_slot_quantum_ns}

<SettingsInfoBlock type="UInt64" default_value="10000000" />

Определяет, сколько наносекунд CPU может потреблять поток после получения слота CPU и прежде чем ему необходимо запросить следующий слот CPU. Имеет смысл только если `cpu_slot_preemption` включён и ресурс CPU задан для MASTER THREAD или WORKER THREAD.

**Пример**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**См. также**

* [Планирование рабочих нагрузок](/operations/workload-scheduling.md)


## crash&#95;log {#crash_log}

Настройки для работы системной таблицы [crash&#95;log](../../operations/system-tables/crash_log.md).

Следующие настройки могут быть сконфигурированы с помощью под-тегов:

| Setting                            | Description                                                                                                                                                     | Default             | Note                                                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `database`                         | Имя базы данных.                                                                                                                                                |                     |                                                                                                                                 |
| `table`                            | Имя системной таблицы.                                                                                                                                          |                     |                                                                                                                                 |
| `engine`                           | [Определение движка MergeTree](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table) для системной таблицы.                |                     | Нельзя использовать, если определены `partition_by` или `order_by`. Если не указано, по умолчанию выбирается `MergeTree`        |
| `partition_by`                     | [Пользовательский ключ партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key.md) для системной таблицы.                            |                     | Если для системной таблицы указан `engine`, параметр `partition_by` должен быть задан непосредственно внутри &#39;engine&#39;   |
| `ttl`                              | Задаёт [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) таблицы.                                                             |                     | Если для системной таблицы указан `engine`, параметр `ttl` должен быть задан непосредственно внутри &#39;engine&#39;            |
| `order_by`                         | [Пользовательский ключ сортировки](/engines/table-engines/mergetree-family/mergetree#order_by) для системной таблицы. Нельзя использовать, если задан `engine`. |                     | Если для системной таблицы указан `engine`, параметр `order_by` должен быть задан непосредственно внутри &#39;engine&#39;       |
| `storage_policy`                   | Имя политики хранения, используемой для таблицы (необязательно).                                                                                                |                     | Если для системной таблицы указан `engine`, параметр `storage_policy` должен быть задан непосредственно внутри &#39;engine&#39; |
| `settings`                         | [Дополнительные параметры](/engines/table-engines/mergetree-family/mergetree/#settings), управляющие поведением MergeTree (необязательно).                      |                     | Если для системной таблицы указан `engine`, параметр `settings` должен быть задан непосредственно внутри &#39;engine&#39;       |
| `flush_interval_milliseconds`      | Интервал сброса данных из буфера в памяти в таблицу.                                                                                                            | `7500`              |                                                                                                                                 |
| `max_size_rows`                    | Максимальный размер логов в строках. Когда количество не сброшенных логов достигает `max_size_rows`, логи сбрасываются на диск.                                 | `1024`              |                                                                                                                                 |
| `reserved_size_rows`               | Предварительно выделенный размер памяти в строках для логов.                                                                                                    | `1024`              |                                                                                                                                 |
| `buffer_size_rows_flush_threshold` | Порог по количеству строк. При достижении порога запускается фоновый сброс логов на диск.                                                                       | `max_size_rows / 2` |                                                                                                                                 |
| `flush_on_crash`                   | Определяет, должны ли логи сбрасываться на диск в случае сбоя.                                                                                                  | `false`             |                                                                                                                                 |

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
в противном случае будет выброшено исключение, препятствующее созданию диска.

:::note
Это не повлияет на диски, созданные в более старой версии, с которой затем был обновлен сервер.
В этом случае исключение выброшено не будет, чтобы позволить серверу успешно запуститься.
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

Задержка, в течение которой удалённая таблица может быть восстановлена с помощью команды [`UNDROP`](/sql-reference/statements/undrop.md). Если `DROP TABLE` выполнялась с модификатором `SYNC`, этот параметр не учитывается.
Значение по умолчанию для этого параметра — `480` (8 минут).

## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

<SettingsInfoBlock type="UInt64" default_value="5" />В случае неудачного удаления таблицы ClickHouse будет ждать в течение этого интервала, прежде чем повторить операцию.

## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="16" />Размер пула потоков, используемого при удалении таблиц.

## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

<SettingsInfoBlock type="UInt64" default_value="86400" />

Параметр задачи, которая удаляет неиспользуемые данные из каталога `store/`.
Задаёт период запуска этой задачи.

:::note
Значение `0` означает «никогда». Значение по умолчанию соответствует 1 дню.
:::

## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="3600" />

Параметр задачи, которая выполняет очистку `store/` от «мусора».
Если некоторый подкаталог не используется clickhouse-server и этот каталог не модифицировался в течение последних
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) секунд, задача «спрячет» этот каталог,
удалив все права доступа к нему. Это также работает для каталогов, которые clickhouse-server не
ожидает увидеть внутри `store/`.

:::note
Значение `0` означает «немедленно».
:::

## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />

Параметр задачи, которая очищает от мусора каталог `store/`.
Если какой-либо подкаталог не используется clickhouse-server и ранее был «скрыт»
(см. [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec)),
и этот каталог не изменялся в течение последних
[`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) секунд, задача удалит этот каталог.
Параметр также применяется к каталогам, которые clickhouse-server не
ожидает увидеть внутри `store/`.

:::note
Значение `0` означает «никогда». Значение по умолчанию соответствует 30 дням.
:::

## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает навсегда отсоединять таблицы в базах данных типа Replicated

## database_replicated_drop_broken_tables {#database_replicated_drop_broken_tables} 

<SettingsInfoBlock type="Bool" default_value="0" />Удалять неожиданные таблицы из баз данных Replicated вместо перемещения их в отдельную локальную базу данных

## dead&#95;letter&#95;queue {#dead_letter_queue}

Параметр настройки для системной таблицы &#39;dead&#95;letter&#95;queue&#39;.

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

<SettingsInfoBlock type="String" default_value="default" />Имя базы данных, используемой по умолчанию.

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

Профиль настроек по умолчанию. Профили настроек расположены в файле, заданном в параметре `user_config`.

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

Таймаут сеанса по умолчанию (в секундах).

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

* Если `true`, то каждый словарь загружается при первом использовании. Если загрузка завершилась с ошибкой, функция, использующая словарь, генерирует исключение.
* Если `false`, то сервер загружает все словари при запуске.

:::note
При запуске сервер будет ждать завершения загрузки всех словарей, прежде чем принимать какие-либо подключения
(исключение: если [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) установлен в значение `false`).
:::

**Пример**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```


## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Интервал в миллисекундах между повторными попытками подключения словарей MySQL и Postgres с включённым параметром `background_reconnect` после сбоя подключения.

## disable_insertion_and_mutation {#disable_insertion_and_mutation} 

<SettingsInfoBlock type="Bool" default_value="0" />

Отключает запросы INSERT/ALTER/DELETE. Этот параметр можно включить, если требуются узлы только для чтения, чтобы операции вставки и мутации не влияли на производительность чтения. Вставки во внешние движки (S3, DataLake, MySQL, PostgreSQL, Kafka и т. д.) разрешены даже при включённом этом параметре.

## disable_internal_dns_cache {#disable_internal_dns_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />Отключает внутренний DNS-кэш. Рекомендуется при эксплуатации ClickHouse в системах с часто изменяющейся инфраструктурой, таких как Kubernetes.

## disable&#95;tunneling&#95;for&#95;https&#95;requests&#95;over&#95;http&#95;proxy {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию туннелирование (т.е. `HTTP CONNECT`) используется для выполнения запросов `HTTPS` через прокси `HTTP`. Этот параметр позволяет его отключить.

**no&#95;proxy**

По умолчанию все запросы проходят через прокси. Чтобы отключить его для конкретных хостов, необходимо задать переменную `no_proxy`.
Её можно задать внутри секции `<proxy>` для list и remote resolvers, а также как переменную окружения для environment resolver.
Поддерживаются IP-адреса, домены, поддомены и шаблон `'*'` для полного обхода. Ведущие точки удаляются так же, как это делает curl.

**Пример**

Ниже приведена конфигурация, которая обходит прокси для запросов к `clickhouse.cloud` и всем его поддоменам (например, `auth.clickhouse.cloud`).
То же самое относится к GitLab, даже если в домене есть начальная точка. И `gitlab.com`, и `about.gitlab.com` будут обходить прокси.

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

<SettingsInfoBlock type="UInt64" default_value="200000" />Исключение выбрасывается при попытке создания, когда достигнут этот лимит. Установите значение 0, чтобы отключить жесткое ограничение. Лимит применяется к подключениям к дискам.

## disk_connections_soft_limit {#disk_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />Подключения сверх этого лимита имеют значительно меньший срок жизни. Лимит применяется к подключению к дискам.

## disk_connections_store_limit {#disk_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Соединения сверх этого лимита сбрасываются после использования. Установите значение 0, чтобы отключить кэш соединений. Лимит применяется к соединениям с дисками.

## disk_connections_warn_limit {#disk_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="8000" />Предупреждающие сообщения записываются в логи, если число активных подключений превышает это значение. Ограничение распространяется на подключения к дискам.

## display_secrets_in_show_and_select {#display_secrets_in_show_and_select} 

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает отображение секретов в запросах `SHOW` и `SELECT` для таблиц, баз данных, табличных функций и словарей.

Чтобы пользователь мог видеть секреты, он также должен включить
параметр формата [`format_display_secrets_in_show_and_select`](../settings/formats#format_display_secrets_in_show_and_select)
и иметь привилегию
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Возможные значения:

- `0` — Отключено.
- `1` — Включено.

## distributed_cache_apply_throttling_settings_from_client {#distributed_cache_apply_throttling_settings_from_client} 

<SettingsInfoBlock type="Bool" default_value="1" />Определяет, следует ли серверу кэша применять настройки троттлинга, полученные от клиента.

## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio} 

<SettingsInfoBlock type="Float" default_value="0.1" />Мягкое ограничение на количество активных соединений, которые кэш распределённых соединений будет стараться держать свободными. Когда количество свободных соединений опускается ниже значения distributed_cache_keep_up_free_connections_ratio * max_connections, соединения с самой давней активностью будут закрыты, пока количество не превысит этот порог.

## distributed&#95;ddl {#distributed_ddl}

Управление выполнением [распределённых DDL-запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) в кластере.
Работает только при включённом [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper).

Настраиваемые параметры внутри `<distributed_ddl>` включают:

| Setting                | Description                                                                                                                              | Default Value                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `path`                 | путь в Keeper к `task_queue` для DDL-запросов                                                                                            |                                        |
| `profile`              | профиль, используемый для выполнения DDL-запросов                                                                                        |                                        |
| `pool_size`            | сколько запросов `ON CLUSTER` может выполняться одновременно                                                                             |                                        |
| `max_tasks_in_queue`   | максимальное количество задач, которое может находиться в очереди                                                                        | `1,000`                                |
| `task_max_lifetime`    | удалять узел, если его возраст превышает это значение                                                                                    | `7 * 24 * 60 * 60` (неделя в секундах) |
| `cleanup_delay_period` | очистка запускается после получения события о новом узле, если с момента последней очистки прошло не менее `cleanup_delay_period` секунд | `60` секунд                            |

**Пример**

```xml
<distributed_ddl>
    <!-- Path in ZooKeeper to queue with DDL queries -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Settings from this profile will be used to execute DDL queries -->
    <profile>default</profile>

    <!-- Controls how much ON CLUSTER queries can be run simultaneously. -->
    <pool_size>1</pool_size>

    <!--
         Cleanup settings (active tasks will not be removed)
    -->

    <!-- Controls task TTL (default 1 week) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Controls how often cleanup should be performed (in seconds) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Controls how many tasks could be in the queue -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```


## distributed_ddl_use_initial_user_and_roles {#distributed_ddl_use_initial_user_and_roles} 

<SettingsInfoBlock type="Bool" default_value="0" />Если включено, запросы ON CLUSTER будут сохранять и использовать пользователя и роли инициатора при выполнении на удалённых сегментах. Это обеспечивает единообразный контроль доступа по всему кластеру, но требует, чтобы этот пользователь и роли были созданы на всех узлах.

## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4} 

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает преобразование имён в IPv4-адреса.

## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6} 

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает преобразование доменных имён в IPv6-адреса.

## dns_cache_max_entries {#dns_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Максимальное число записей во внутреннем DNS-кэше.

## dns_cache_update_period {#dns_cache_update_period} 

<SettingsInfoBlock type="Int32" default_value="15" />Период обновления внутреннего DNS-кэша в секундах.

## dns_max_consecutive_failures {#dns_max_consecutive_failures} 

<SettingsInfoBlock type="UInt32" default_value="10" />Максимальное количество последовательных ошибок DNS‑разрешения имени хоста перед его удалением из DNS‑кэша ClickHouse.

## drop_distributed_cache_pool_size {#drop_distributed_cache_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Размер пула потоков, используемого для очистки распределённого кэша.

## drop_distributed_cache_queue_size {#drop_distributed_cache_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Размер очереди пула потоков, используемого для очистки распределённого кэша.

## enable_azure_sdk_logging {#enable_azure_sdk_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />Включает ведение журнала в Azure SDK

## encryption {#encryption}

Настраивает команду для получения ключа, который будет использоваться [кодеками шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должен быть задан в переменных окружения или в конфигурационном файле.

Ключи могут быть в шестнадцатеричном формате или в виде строки длиной ровно 16 байт.

**Пример**

Загрузка из конфигурационного файла:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
Хранить ключи в конфигурационном файле не рекомендуется. Это небезопасно. Вы можете вынести ключи в отдельный конфигурационный файл на защищённом диске и создать символическую ссылку на этот файл в каталоге `config.d/`.
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

Здесь `current_key_id` показывает текущий ключ для шифрования.

Также можно указать nonce длиной 12 байт (по умолчанию процессы шифрования и расшифровки используют nonce, состоящий из нулевых байт):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Или задать в шестнадцатеричном формате:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
Все, о чем говорилось выше, применимо и к `aes_256_gcm_siv` (но длина ключа должна составлять 32 байта).
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
Значение `0` означает отсутствие ограничения.
:::

## format&#95;schema&#95;path {#format_schema_path}

Путь к каталогу со схемами для входных данных, таких как схемы для формата [CapnProto](/interfaces/formats/CapnProto).

**Пример**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>format_schemas/</format_schema_path>
```


## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />Период таймера тактов процессора глобального профайлера (в наносекундах). Установите значение 0, чтобы отключить глобальный профайлер по тактам CPU. Рекомендуемое значение — не менее 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (раз в секунду) для профилирования кластера целиком.

## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000000" />Период таймера реального времени глобального профилировщика (в наносекундах). Установите значение 0, чтобы выключить глобальный профилировщик по реальному времени. Рекомендуемое значение — не менее 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (раз в секунду) для профилирования всего кластера.

## google&#95;protos&#95;path {#google_protos_path}

Определяет каталог, содержащий proto‑файлы для типов Protobuf.

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
* `timeout` – тайм-аут отправки данных, в секундах.
* `root_path` – префикс для ключей.
* `metrics` – отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
* `events` – отправка дельт значений, накопленных за период времени, из таблицы [system.events](/operations/system-tables/events).
* `events_cumulative` – отправка накопительных данных из таблицы [system.events](/operations/system-tables/events).
* `asynchronous_metrics` – отправка данных из таблицы [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics).

Можно настроить несколько секций `<graphite>`. Например, это можно использовать для отправки разных данных с разными интервалами.

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


## hsts&#95;max&#95;age {#hsts_max_age}

Срок действия HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. Если вы задаёте положительное число, HSTS будет включён, и max-age будет равен указанному числу.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## http_connections_hard_limit {#http_connections_hard_limit} 

<SettingsInfoBlock type="UInt64" default_value="200000" />Исключение генерируется при попытке создания, когда достигнут этот лимит. Установите значение 0, чтобы отключить жесткое ограничение. Лимит применяется к HTTP‑подключениям, которые не привязаны ни к какому диску или хранилищу.

## http_connections_soft_limit {#http_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />Соединения сверх этого предела имеют значительно более короткий срок жизни. Лимит применяется к HTTP‑соединениям, которые не привязаны ни к какому диску или хранилищу.

## http_connections_store_limit {#http_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Соединения сверх этого лимита сбрасываются после использования. Установите значение 0, чтобы отключить кэш соединений. Лимит применяется к HTTP‑соединениям, которые не относятся ни к какому диску или хранилищу.

## http_connections_warn_limit {#http_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="500" />Предупреждающие сообщения записываются в журналы, если количество активных подключений превышает этот предел. Предел применяется к HTTP‑подключениям, которые не относятся ни к одному диску или хранилищу.

## http&#95;handlers {#http_handlers}

Позволяет использовать пользовательские HTTP-обработчики.
Чтобы добавить новый HTTP-обработчик, просто добавьте новый `<rule>`.
Правила проверяются сверху вниз в указанном порядке,
и первый совпавший запустит обработчик.

Следующие параметры можно настроить с помощью подтегов:

| Sub-tags             | Definition                                                                                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                | Для сопоставления URL запроса можно использовать префикс &#39;regex:&#39; для сопоставления по регулярному выражению (необязательно)                                                                                        |
| `methods`            | Для сопоставления методов запроса можно использовать запятые для разделения нескольких методов (необязательно)                                                                                                              |
| `headers`            | Для сопоставления заголовков запроса сопоставляйте каждый дочерний элемент (имя дочернего элемента — имя заголовка); можно использовать префикс &#39;regex:&#39; для сопоставления по регулярному выражению (необязательно) |
| `handler`            | Обработчик запроса                                                                                                                                                                                                          |
| `empty_query_string` | Проверяет отсутствие строки запроса (query string) в URL                                                                                                                                                                    |

`handler` содержит следующие параметры, которые можно настроить с помощью подтегов:

| Sub-tags           | Definition                                                                                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`              | Адрес перенаправления                                                                                                                                                                                          |
| `type`             | Поддерживаемые типы: static, dynamic&#95;query&#95;handler, predefined&#95;query&#95;handler, redirect                                                                                                         |
| `status`           | Используется с типом static, код статуса ответа                                                                                                                                                                |
| `query_param_name` | Используется с типом dynamic&#95;query&#95;handler, извлекает и выполняет значение, соответствующее значению `<query_param_name>` в параметрах HTTP-запроса                                                    |
| `query`            | Используется с типом predefined&#95;query&#95;handler, выполняет запрос при вызове обработчика                                                                                                                 |
| `content_type`     | Используется с типом static, значение content-type ответа                                                                                                                                                      |
| `response_content` | Используется с типом static, содержимое ответа, отправляемое клиенту; при использовании префикса &#39;file://&#39; или &#39;config://&#39; содержимое берётся из файла или конфигурации и отправляется клиенту |

Вместе со списком правил вы можете указать `<defaults/>`, чтобы включить все обработчики по умолчанию.

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

Используется для добавления заголовков в ответ HTTP-запроса `OPTIONS`.
Метод `OPTIONS` используется при выполнении предварительных (preflight) CORS-запросов.

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
Значение по умолчанию — &quot;Ok.&quot; (с переводом строки в конце)

**Пример**

Открывает `https://tabix.io/` при обращении к `http://localhost:http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />Размер пула фоновых потоков для каталога iceberg

## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно добавить в очередь пула каталога Iceberg

## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Максимальный размер кэша файлов метаданных Iceberg (в записях). Ноль — кэш отключен.

## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики кэширования метаданных Iceberg.

## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Максимальный размер кэша метаданных Iceberg в байтах. Ноль означает, что кэш отключен.

## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше метаданных Iceberg относительно общего размера кэша.

## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query} 

<SettingsInfoBlock type="Bool" default_value="1" />

Если значение равно `true`, ClickHouse не записывает значения по умолчанию для пустого оператора `SQL SECURITY` в запросах `CREATE VIEW`.

:::note
Этот параметр необходим только в период миграции и утратит актуальность в версии 24.4.
:::

## include&#95;from {#include_from}

Путь к файлу с подстановками. Поддерживаются форматы XML и YAML.

Для получения дополнительной информации см. раздел «[Configuration files](/operations/configuration-files)».

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## index_mark_cache_policy {#index_mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования меток вторичного индекса.

## index_mark_cache_size {#index_mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

Максимальный размер кэша меток индекса.

:::note

Значение `0` означает, что параметр отключен.

Этот параметр можно изменять во время работы сервера, и изменения вступают в силу немедленно.
:::

## index_mark_cache_size_ratio {#index_mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.3" />Размер защищённой очереди (в случае политики SLRU) во вторичном кэше меток индекса по отношению к общему размеру этого кэша.

## index_uncompressed_cache_policy {#index_uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования несжатого вторичного индекса.

## index_uncompressed_cache_size {#index_uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер кэша для несжатых блоков индексов `MergeTree`.

:::note
Значение `0` означает, что кэш отключен.

Этот параметр можно изменять во время работы сервера, и изменения вступают в силу немедленно.
:::

## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) во вторичном кэше несжатого индекса по отношению к общему размеру кэша.

## interserver&#95;http&#95;credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики, используя эти учетные данные.
Поэтому `interserver_http_credentials` должны быть одинаковыми для всех реплик в кластере.

:::note

* По умолчанию если раздел `interserver_http_credentials` опущен, аутентификация во время репликации не используется.
* Настройки `interserver_http_credentials` не связаны с учетными данными клиента ClickHouse в [конфигурации](../../interfaces/cli.md#configuration_files).
* Эти учетные данные общие для репликации через `HTTP` и `HTTPS`.
  :::

Следующие настройки могут быть заданы во вложенных тегах:

* `user` — Имя пользователя.
* `password` — Пароль.
* `allow_empty` — Если `true`, то другим репликам разрешено подключаться без аутентификации даже при заданных учетных данных. Если `false`, то подключения без аутентификации отклоняются. Значение по умолчанию: `false`.
* `old` — Содержит старые `user` и `password`, использовавшиеся во время ротации учетных данных. Может быть указано несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию межсерверных учетных данных без одновременной остановки всех реплик для обновления их конфигурации. Учетные данные можно изменить в несколько шагов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволит принимать как подключения с аутентификацией, так и без нее.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите для `allow_empty` значение `false` или удалите этот параметр. Это сделает обязательной аутентификацию с новыми учетными данными.

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

Если параметр не указан, оно определяется аналогично результату команды `hostname -f`.

Полезен для отвязки сервера от конкретного сетевого интерфейса.

**Пример**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver&#95;http&#95;port {#interserver_http_port}

Порт, используемый для обмена данными между серверами ClickHouse.

**Пример**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver&#95;https&#95;host {#interserver_https_host}

Аналогично [`interserver_http_host`](#interserver_http_host), но в данном случае это имя хоста может использоваться другими серверами для доступа к этому серверу по протоколу `HTTPS`.

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

Ограничение на хосты, между которыми серверам ClickHouse разрешён обмен данными.
Если используется Keeper, то такое же ограничение применяется к взаимодействию между разными экземплярами Keeper.

:::note
По умолчанию значение равно настройке [`listen_host`](#listen_host).
:::

**Пример**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

Тип:

По умолчанию:


## io_thread_pool_queue_size {#io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное число задач, которые могут быть поставлены в очередь пула потоков ввода-вывода (IO thread pool).

:::note
Значение `0` означает отсутствие ограничения.
:::

## jemalloc_collect_global_profile_samples_in_trace_log {#jemalloc_collect_global_profile_samples_in_trace_log} 

<SettingsInfoBlock type="Bool" default_value="0" />Сохранять выборочные выделения памяти jemalloc в system.trace_log

## jemalloc_enable_background_threads {#jemalloc_enable_background_threads} 

<SettingsInfoBlock type="Bool" default_value="1" />Включает фоновые потоки jemalloc. Jemalloc использует фоновые потоки для очистки неиспользуемых страниц памяти. Отключение этой настройки может привести к снижению производительности.

## jemalloc_enable_global_profiler {#jemalloc_enable_global_profiler} 

<SettingsInfoBlock type="Bool" default_value="0" />Включает профилировщик выделений памяти jemalloc для всех потоков. Jemalloc будет выполнять выборочное профилирование выделений и всех освобождений для тех выделений, которые попали в выборку.
Профили можно сбрасывать с помощью SYSTEM JEMALLOC FLUSH PROFILE, что может использоваться для анализа выделений памяти.
Выборки также могут сохраняться в system.trace_log с помощью конфигурационного параметра jemalloc_collect_global_profile_samples_in_trace_log или настройки запроса jemalloc_collect_profile_samples_in_trace_log.
См. раздел [Профилирование выделений памяти](/operations/allocation-profiling)

## jemalloc_flush_profile_interval_bytes {#jemalloc_flush_profile_interval_bytes} 

<SettingsInfoBlock type="UInt64" default_value="0" />Сброс профиля jemalloc будет выполняться после увеличения глобального пикового потребления памяти на jemalloc_flush_profile_interval_bytes

## jemalloc_flush_profile_on_memory_exceeded {#jemalloc_flush_profile_on_memory_exceeded} 

<SettingsInfoBlock type="Bool" default_value="0" />Сброс профиля jemalloc будет выполняться при ошибках, связанных с превышением общего объёма памяти

## jemalloc_max_background_threads_num {#jemalloc_max_background_threads_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальное количество фоновых потоков jemalloc, которые будут созданы; установите 0, чтобы использовать значение по умолчанию jemalloc

## keep&#95;alive&#95;timeout {#keep_alive_timeout}

<SettingsInfoBlock type="Seconds" default_value="30" />

Количество секунд, в течение которых ClickHouse ожидает входящие запросы по протоколу HTTP перед закрытием соединения.

**Пример**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```


## keeper_hosts {#keeper_hosts} 

Динамическая настройка. Содержит набор хостов ZooKeeper, к которым ClickHouse потенциально может подключаться. Не раскрывает информацию из `<auxiliary_zookeepers>`.

## keeper_multiread_batch_size {#keeper_multiread_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальный размер пакета для запроса MultiRead к [Zoo]Keeper, поддерживающему пакетную обработку. Если установить значение 0, пакетная обработка будет отключена. Доступно только в ClickHouse Cloud.

## ldap_servers {#ldap_servers} 

Перечислите здесь LDAP‑серверы с их параметрами подключения, чтобы:

- использовать их в качестве аутентификаторов для выделенных локальных пользователей, у которых в качестве механизма аутентификации указан `ldap` вместо `password`
- использовать их в качестве удалённых пользовательских каталогов.

Следующие настройки могут быть заданы с помощью под‑тегов:

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | Имя хоста или IP‑адрес сервера LDAP, этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                                                                                                                    |
| `port`                         | Порт сервера LDAP, по умолчанию `636`, если `enable_tls` установлен в `true`, иначе `389`.                                                                                                                                                                                                                                                                                                                                               |
| `bind_dn`                      | Шаблон, используемый для построения DN для bind‑операции. Итоговый DN будет сформирован путём замены всех подстрок `\{user_name\}` в шаблоне фактическим именем пользователя при каждой попытке аутентификации.                                                                                                                                                                                                                         |
| `user_dn_detection`            | Раздел с параметрами LDAP‑поиска для определения фактического DN пользователя, к которому производится bind. В основном используется в поисковых фильтрах для дальнейшего сопоставления ролей, когда сервером является Active Directory. Итоговый DN пользователя будет использоваться при замене подстрок `\{user_dn\}` везде, где они разрешены. По умолчанию DN пользователя равен bind DN, но после выполнения поиска он будет обновлён до фактически обнаруженного значения DN пользователя. |
| `verification_cooldown`        | Период времени в секундах после успешной попытки bind, в течение которого считается, что пользователь успешно аутентифицирован для всех последующих запросов без обращения к серверу LDAP. Укажите `0` (значение по умолчанию), чтобы отключить кэширование и принудительно обращаться к серверу LDAP для каждого запроса на аутентификацию.                                                                                                           |
| `enable_tls`                   | Флаг, включающий использование защищённого соединения с сервером LDAP. Укажите `no` для протокола с открытым текстом (`ldap://`) (не рекомендуется). Укажите `yes` для LDAP поверх SSL/TLS (`ldaps://`) (рекомендуется, значение по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (протокол с открытым текстом (`ldap://`), переключаемый на TLS).                                                                                                          |
| `tls_minimum_protocol_version` | Минимальная версия протокола SSL/TLS. Допустимые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (значение по умолчанию).                                                                                                                                                                                                                                                                                                         |
| `tls_require_cert`             | Поведение проверки сертификата SSL/TLS удалённого узла (peer). Допустимые значения: `never`, `allow`, `try`, `demand` (значение по умолчанию).                                                                                                                                                                                                                                                                                            |
| `tls_cert_file`                | Путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `tls_key_file`                 | Путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `tls_ca_cert_file`             | Путь к файлу сертификата CA.                                                                                                                                                                                                                                                                                                                                                                                                              |
| `tls_ca_cert_dir`              | Путь к каталогу, содержащему сертификаты CA.                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_cipher_suite`             | Разрешённый набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                                                                                            |

Параметр `user_dn_detection` может быть настроен с помощью под‑тегов:

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | Шаблон, используемый для построения базового DN для LDAP‑поиска. Итоговый DN будет сформирован путём замены всех подстрок `\{user_name\}` и `\{bind_dn\}` в шаблоне фактическим именем пользователя и bind DN во время выполнения LDAP‑поиска.                                                                                                  |
| `scope`         | Область LDAP‑поиска. Допустимые значения: `base`, `one_level`, `children`, `subtree` (значение по умолчанию).                                                                                                                                                                                                                                  |
| `search_filter` | Шаблон, используемый для построения поискового фильтра для LDAP‑поиска. Итоговый фильтр будет сформирован путём замены всех подстрок `\{user_name\}`, `\{bind_dn\}` и `\{base_dn\}` в шаблоне фактическим именем пользователя, bind DN и base DN во время выполнения LDAP‑поиска. Обратите внимание, что специальные символы в XML должны быть корректно экранированы. |

Example:

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

Пример (типичный Active Directory с настроенным определением DN пользователя для последующего сопоставления ролей):

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


## license_file {#license_file} 

Содержимое файла лицензии для ClickHouse Enterprise Edition

## license_public_key_for_testing {#license_public_key_for_testing} 

Демонстрационный лицензионный ключ, предназначенный только для использования в CI

## listen&#95;backlog {#listen_backlog}

Backlog (размер очереди ожидающих установления подключений) прослушивающего сокета. Значение по умолчанию `4096` совпадает со значением в Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не требуется менять, поскольку:

* значение по умолчанию достаточно велико;
* для принятия клиентских подключений у сервера есть отдельный поток.

Поэтому даже если у вас `TcpExtListenOverflows` (из `nstat`) не равен нулю и этот счетчик растет для сервера ClickHouse, это не означает, что это значение нужно увеличивать, поскольку:

* обычно, если `4096` недостаточно, это указывает на внутреннюю проблему масштабирования ClickHouse, поэтому лучше сообщить об этой проблеме;
* это не означает, что сервер сможет обработать больше подключений в дальнейшем (и даже если бы смог, к тому моменту клиенты уже могут завершить работу или отключиться).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```


## listen&#95;host {#listen_host}

Ограничение на хосты, с которых могут приходить запросы. Если вы хотите, чтобы сервер принимал запросы с любых хостов, укажите `::`.

Примеры:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## listen&#95;reuse&#95;port {#listen_reuse_port}

Разрешает нескольким серверам прослушивать один и тот же адрес:порт. Операционная система будет направлять запросы на случайный сервер. Не рекомендуется включать этот параметр.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

Значение по умолчанию:


## listen&#95;try {#listen_try}

Сервер не завершит работу, если сети IPv6 или IPv4 недоступны при попытке начать прослушивание сокета.

**Пример**

```xml
<listen_try>0</listen_try>
```


## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />Размер фонового пула потоков для загрузки меток

## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно отправить в пул предварительной выборки

## logger {#logger} 

Расположение и формат сообщений журнала.

**Ключи**:

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | Уровень логирования. Допустимые значения: `none` (выключить логирование), `fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test` |
| `log`                  | Путь к файлу журнала.                                                                                                                                              |
| `errorlog`             | Путь к файлу журнала ошибок.                                                                                                                                       |
| `size`                 | Политика ротации: максимальный размер файлов журнала в байтах. Когда размер файла журнала превышает этот порог, он переименовывается и архивируется, а затем создаётся новый файл журнала. |
| `rotation`             | Политика ротации: определяет, когда выполняется ротация файлов журнала. Ротация может осуществляться на основе размера, времени или их комбинации. Примеры: 100M, daily, 100M,daily. Когда размер файла журнала превышает указанный порог или наступает заданный интервал времени, файл переименовывается и архивируется, а затем создаётся новый файл журнала. |
| `count`                | Политика ротации: максимальное количество архивных файлов журнала ClickHouse, которые будут храниться.                                                            |
| `stream_compress`      | Сжимать сообщения журнала с помощью LZ4. Установите `1` или `true` для включения.                                                                                  |
| `console`              | Включить логирование в консоль. Установите `1` или `true` для включения. Значение по умолчанию — `1`, если ClickHouse не запущен в режиме демона, иначе `0`.      |
| `console_log_level`    | Уровень логирования для вывода в консоль. По умолчанию — значение `level`.                                                                                        |
| `formatting.type`      | Формат журнала для вывода в консоль. В данный момент поддерживается только `json`.                                                                                |
| `use_syslog`           | Дополнительно пересылать вывод журнала в syslog.                                                                                                                   |
| `syslog_level`         | Уровень логирования для записи в syslog.                                                                                                                           |
| `async`                | При значении `true` (по умолчанию) логирование выполняется асинхронно (один фоновый поток на каждый канал вывода). В противном случае логирование выполняется в потоке, вызывающем LOG. |
| `async_queue_max_size` | При использовании асинхронного логирования — максимальное количество сообщений, которые будут находиться в очереди в ожидании сброса. Лишние сообщения будут отброшены. |
| `startup_level`        | Уровень при запуске используется для задания уровня корневого логгера при старте сервера. После запуска уровень логирования возвращается к значению параметра `level`. |
| `shutdown_level`       | Уровень при завершении работы используется для задания уровня корневого логгера при остановке сервера.                                                            |

**Спецификаторы формата журнала**

Имена файлов в путях `log` и `errorLog` поддерживают приведённые ниже спецификаторы формата для результирующего имени файла (каталожная часть пути их не поддерживает).

Столбец «Example» показывает значение для момента времени `2023-07-06 18:32:07`.

| Спецификатор | Описание                                                                                                                                                                                        | Пример                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `%%`         | Символ «%»                                                                                                                                                                                      | `%`                        |
| `%n`         | Символ перевода строки                                                                                                                                                                          |                            |
| `%t`         | Символ горизонтальной табуляции                                                                                                                                                                 |                            |
| `%Y`         | Год в десятичном формате, например 2017                                                                                                                                                         | `2023`                     |
| `%y`         | Две последние цифры года в десятичном формате (диапазон [00,99])                                                                                                                                | `23`                       |
| `%C`         | Первые две цифры года в формате десятичного числа (диапазон [00, 99])                                                                                                                           | `20`                       |
| `%G`         | Четырёхзначный [год по недельному календарю ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), то есть год, к которому относится указанная неделя. Обычно используется только с `%V` | `2023`                     |
| `%g`         | Последние 2 цифры [недельного года по ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), то есть года, к которому относится указанная неделя.                                        | `23`                       |
| `%b`         | Сокращённое название месяца, например, Oct (зависит от настроек локали)                                                                                                                         | `Jul`                      |
| `%h`         | То же, что %b                                                                                                                                                                                   | `Jul`                      |
| `%B`         | Полное название месяца, например, October (в зависимости от локали)                                                                                                                             | `Июль`                     |
| `%m`         | Месяц как десятичное число (диапазон [01,12])                                                                                                                                                   | `07`                       |
| `%U`         | Номер недели в году в виде десятичного числа (воскресенье — первый день недели) (диапазон [00,53])                                                                                              | `27`                       |
| `%W`         | Номер недели года в виде десятичного числа (понедельник — первый день недели) (диапазон [00,53])                                                                                                | `27`                       |
| `%V`         | Номер недели по стандарту ISO 8601 (диапазон [01,53])                                                                                                                                           | `27`                       |
| `%j`         | День года как десятичное число (диапазон [001,366])                                                                                                                                             | `187`                      |
| `%d`         | День месяца в виде десятичного числа с ведущим нулём (диапазон [01,31]). Однозначные числа записываются с ведущим нулём.                                                                        | `06`                       |
| `%e`         | День месяца в виде десятичного числа с заполнением слева пробелами (диапазон [1,31]). Однозначное число дополняется слева пробелом.                                                             | `&nbsp; 6`                 |
| `%a`         | Сокращённое название дня недели, например Fri (зависит от настроек локали)                                                                                                                      | `чт`                       |
| `%A`         | Полное название дня недели, например «Friday» (в зависимости от локали)                                                                                                                         | `четверг`                  |
| `%w`         | День недели целым числом, где воскресенье — 0 (диапазон [0–6])                                                                                                                                  | `4`                        |
| `%u`         | День недели в виде десятичного числа, где понедельник — 1 (формат ISO 8601) (диапазон [1-7])                                                                                                    | `4`                        |
| `%H`         | Час в виде десятичного числа, 24-часовый формат времени (диапазон [00–23])                                                                                                                      | `18`                       |
| `%I`         | Час в виде десятичного числа, 12-часовой формат (диапазон [01, 12])                                                                                                                             | `06`                       |
| `%M`         | Минуты в виде десятичного числа (в диапазоне [00,59])                                                                                                                                           | `32`                       |
| `%S`         | Секунда как десятичное число (диапазон [00,60])                                                                                                                                                 | `07`                       |
| `%c`         | Стандартное строковое представление даты и времени, например Sun Oct 17 04:41:13 2010 (зависит от локали)                                                                                       | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованный формат даты (зависит от локали)                                                                                                                                                  | `07.06.23`                 |
| `%X`         | Локализованное представление времени, например, 18:40:20 или 6:40:20 PM (в зависимости от локали)                                                                                               | `18:32:07`                 |
| `%D`         | Краткая дата в формате MM/DD/YY, эквивалент формата %m/%d/%y                                                                                                                                    | `07/06/23`                 |
| `%F`         | Краткий формат даты YYYY-MM-DD, эквивалент %Y-%m-%d                                                                                                                                             | `2023-07-06`               |
| `%r`         | Время в локализованном 12-часовом формате (зависит от локали)                                                                                                                                   | `06:32:07 PM`              |
| `%R`         | То же, что &quot;%H:%M&quot;                                                                                                                                                                    | `18:32`                    |
| `%T`         | Эквивалент «%H:%M:%S» (формат времени ISO 8601)                                                                                                                                                 | `18:32:07`                 |
| `%p`         | Локализованное обозначение a.m./p.m., зависящее от локали                                                                                                                                       | `PM`                       |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430) или ничего, если сведения о часовом поясе недоступны                                                                                       | `+0800`                    |
| `%Z`         | Зависящее от локали название или аббревиатура часового пояса, либо пустая строка, если информация о часовом поясе недоступна                                                                    | `Z AWST `                  |

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

**Переопределение по уровням**

Уровень логирования для отдельных логгеров (по имени) можно переопределить. Например, чтобы заглушить все сообщения логгеров «Backup» и «RBAC».

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

| Key        | Description                                                                                                                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | Адрес syslog в формате `host\[:port\]`. Если не указан, используется локальный демон.                                                                                                                                                                                                       |
| `hostname` | Имя хоста, с которого отправляются логи (необязательный параметр).                                                                                                                                                                                                                          |
| `facility` | [Ключевое слово facility](https://en.wikipedia.org/wiki/Syslog#Facility) для syslog. Должно быть указано прописными буквами с префиксом «LOG&#95;», например `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т. д. Значение по умолчанию: `LOG_USER`, если указан `address`, иначе — `LOG_DAEMON`. |
| `format`   | Формат сообщения лога. Возможные значения: `bsd` и `syslog`.                                                                                                                                                                                                                                |

**Форматы логов**

Вы можете задать формат логов, который будет выводиться в консоль. В данный момент поддерживается только JSON.

**Пример**

Ниже приведён пример JSON-лога на выходе:

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

Чтобы включить поддержку JSON‑логирования, используйте следующий фрагмент:

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- Can be configured on a per-channel basis (log, errorlog, console, syslog), or globally for all channels (then just omit it). -->
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

Имена ключей можно изменить, задав другие значения тегов внутри тега `<names>`. Например, чтобы заменить `DATE_TIME` на `MY_DATE_TIME`, можно использовать `<date_time>MY_DATE_TIME</date_time>`.

**Исключение ключей из JSON‑логов**

Свойства лога можно исключить, закомментировав соответствующее свойство. Например, если вы не хотите, чтобы лог выводил `query_id`, вы можете закомментировать тег `<query_id>`.


## macros {#macros}

Подстановки параметров для реплицируемых таблиц.

Можно опустить, если реплицируемые таблицы не используются.

Дополнительные сведения см. в разделе [Создание реплицируемых таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```


## Политика кэша меток {#mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша меток.

## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />Доля общего объема кэша меток, которая должна быть заполнена при предварительном прогреве.

## mark_cache_size {#mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

Максимальный размер кэша для меток (индекса семейства таблиц [`MergeTree`](/engines/table-engines/mergetree-family)).

:::note
Этот параметр можно изменить во время работы сервера, и он вступит в силу немедленно.
:::

## mark_cache_size_ratio {#mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (при политике SLRU) в кэше меток по отношению к общему размеру кэша.

## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />Количество потоков, используемых для загрузки активного набора частей данных (Active) при запуске сервера.

## max_authentication_methods_per_user {#max_authentication_methods_per_user} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Максимальное количество методов аутентификации, с которыми пользователь может быть создан или к которым может быть изменён.
Изменение этого параметра не влияет на существующих пользователей. Запросы на создание/изменение, связанные с аутентификацией, завершатся с ошибкой, если они превышают лимит, заданный этим параметром.
Запросы на создание/изменение, не связанные с аутентификацией, при этом выполняются успешно.

:::note
Значение `0` означает отсутствие ограничения.
:::

## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения в байтах в секунду для всех операций резервного копирования на сервере. Ноль означает, что ограничений нет.

## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Если количество **простаивающих** потоков в пуле потоков Backups IO превышает `max_backup_io_thread_pool_free_size`, ClickHouse освобождает ресурсы, занятые простаивающими потоками, и уменьшает размер пула. При необходимости потоки могут быть созданы снова.

## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse использует потоки из пула потоков Backups IO Thread pool для выполнения операций ввода-вывода при резервном копировании в S3. `max_backups_io_thread_pool_size` ограничивает максимальное количество потоков в этом пуле.

## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />

Максимальное количество потоков, используемых для построения векторных индексов.

:::note
Значение `0` означает, что используются все ядра.
:::

## max_concurrent_insert_queries {#max_concurrent_insert_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на общее количество одновременных запросов INSERT.

:::note

Значение `0` (по умолчанию) означает отсутствие ограничения.

Этот параметр можно изменять во время работы сервера, и изменение вступает в силу немедленно. Уже выполняющиеся запросы не затрагиваются.
:::

## max_concurrent_queries {#max_concurrent_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на общее число одновременно выполняемых запросов. Обратите внимание, что также необходимо учитывать ограничения на запросы `INSERT` и `SELECT`, а также на максимальное количество запросов для отдельных пользователей.

См. также:

- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

Значение `0` (по умолчанию) означает отсутствие ограничения.

Этот параметр может быть изменён во время работы и вступит в силу немедленно. Уже выполняющиеся запросы останутся без изменений.
:::

## max_concurrent_select_queries {#max_concurrent_select_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на общее количество одновременно выполняющихся запросов `SELECT`.

:::note

Значение `0` (по умолчанию) означает отсутствие ограничения.

Этот параметр можно изменять во время работы сервера; изменения вступают в силу немедленно. Уже выполняющиеся запросы не будут затронуты.
:::

## max_connections {#max_connections} 

<SettingsInfoBlock type="Int32" default_value="4096" />Максимальное число подключений к серверу.

## max_database_num_to_throw {#max_database_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />Если количество баз данных превышает это значение, сервер сгенерирует исключение. 0 означает отсутствие ограничения.

## max&#95;database&#95;num&#95;to&#95;warn {#max_database_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если число подключённых баз данных превышает указанное значение, сервер ClickHouse запишет предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```


## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size} 

<SettingsInfoBlock type="UInt32" default_value="1" />Количество потоков, используемых для создания таблиц при восстановлении реплики в DatabaseReplicated. Ноль означает, что число потоков равно числу ядер.

## max&#95;dictionary&#95;num&#95;to&#95;throw {#max_dictionary_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество словарей превышает это значение, сервер выбросит исключение.

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

Если количество подключённых словарей превышает указанное значение, сервер ClickHouse записывает предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```


## max_distributed_cache_read_bandwidth_for_server {#max_distributed_cache_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная суммарная скорость чтения из распределённого кэша сервера в байтах в секунду. Ноль означает отсутствие ограничения.

## max_distributed_cache_write_bandwidth_for_server {#max_distributed_cache_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная суммарная скорость записи в распределённый кэш на сервере в байтах в секунду. Ноль означает отсутствие ограничений.

## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Максимально допустимое количество записей статистики хеш-таблицы, собираемой при агрегации

## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />Количество потоков, используемых для ALTER TABLE FETCH PARTITION.

## max_format_parsing_thread_pool_free_size {#max_format_parsing_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество простаивающих резервных потоков, которые сохраняются в пуле потоков для разбора входных данных.

## max_format_parsing_thread_pool_size {#max_format_parsing_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

Максимальное общее число потоков, которые можно использовать для разбора входных данных.

## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество **простаивающих** потоков в пуле потоков ввода-вывода превышает `max_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занятые этими потоками, и уменьшит размер пула. При необходимости потоки могут быть созданы снова.

## max_io_thread_pool_size {#max_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse использует потоки из пула потоков ввода‑вывода (IO thread pool) для выполнения некоторых операций ввода‑вывода (например, для взаимодействия с S3). `max_io_thread_pool_size` ограничивает максимальное количество потоков в этом пуле.

## max&#95;keep&#95;alive&#95;requests {#max_keep_alive_requests}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество запросов, которое может быть выполнено по одному keep-alive‑соединению, прежде чем сервер ClickHouse его закроет.

**Пример**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```


## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная локальная пропускная способность чтения в байтах в секунду.

:::note
Значение `0` означает отсутствие ограничений.
:::

## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость локальной записи в байтах в секунду.

:::note
Значение `0` означает отсутствие ограничений.
:::

## max_materialized_views_count_for_table {#max_materialized_views_count_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на количество materialized view, прикреплённых к таблице.

:::note
Здесь учитываются только непосредственно зависящие от таблицы представления; создание представления на основе другого представления сюда не входит.
:::

## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения для всех операций слияния на сервере в байтах в секунду. Ноль означает, что ограничений нет.

## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная суммарная скорость чтения при выполнении всех мутаций на сервере, в байтах в секунду. Ноль означает отсутствие ограничения.

## max&#95;named&#95;collection&#95;num&#95;to&#95;throw {#max_named_collection_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если число именованных коллекций превышает это значение, сервер выбросит исключение.

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```


## max&#95;named&#95;collection&#95;num&#95;to&#95;warn {#max_named_collection_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если количество именованных коллекций превысит указанное значение, сервер ClickHouse добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```


## max&#95;open&#95;files {#max_open_files}

Максимальное количество открытых файлов.

:::note
Рекомендуется использовать этот параметр в macOS, так как функция `getrlimit()` возвращает некорректное значение.
:::

**Пример**

```xml
<max_open_files>262144</max_open_files>
```


## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />

Максимальное соотношение между временем ожидания CPU в ОС (метрика OSCPUWaitMicroseconds) и временем занятости (метрика OSCPUVirtualTimeMicroseconds), при котором рассматривается разрыв соединений. Для вычисления вероятности используется линейная интерполяция между минимальным и максимальным значениями этого соотношения; при этом значении вероятность равна 1.
Дополнительные сведения см. в разделе [Управление поведением при перегрузке CPU сервера](/operations/settings/server-overload).

## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="32" />Количество потоков для загрузки неактивных (устаревших) частей данных при запуске.

## max&#95;part&#95;num&#95;to&#95;warn {#max_part_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="100000" />

Если количество активных частей превышает указанное значение, сервер ClickHouse добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```


## max&#95;partition&#95;size&#95;to&#95;drop {#max_partition_size_to_drop}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

Ограничение на удаление партиций.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает значение [`max_partition_size_to_drop`](#max_partition_size_to_drop) (в байтах), вы не можете удалить партицию с помощью запроса [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart).
Для применения этой настройки не требуется перезапуск сервера ClickHouse. Другой способ отключить ограничение — создать файл `<clickhouse-path>/flags/force_drop_table`.

:::note
Значение `0` означает, что вы можете удалять партиции без каких-либо ограничений.

Это ограничение не распространяется на операции DROP TABLE и TRUNCATE TABLE, см. [max&#95;table&#95;size&#95;to&#95;drop](/operations/settings/settings#max_table_size_to_drop)
:::

**Пример**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```


## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />Количество потоков для одновременного удаления неактивных частей данных.

## max&#95;pending&#95;mutations&#95;execution&#95;time&#95;to&#95;warn {#max_pending_mutations_execution_time_to_warn}

<SettingsInfoBlock type="UInt64" default_value="86400" />

Если любая из отложенных мутаций превысит указанное значение (в секундах), сервер ClickHouse добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```


## max&#95;pending&#95;mutations&#95;to&#95;warn {#max_pending_mutations_to_warn}

<SettingsInfoBlock type="UInt64" default_value="500" />

Если количество невыполненных мутаций превышает указанное значение, сервер ClickHouse будет добавлять предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```


## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество **простаивающих** потоков в пуле потоков десериализации префиксов превышает `max_prefixes_deserialization_thread_pool_free_size`, ClickHouse освобождает ресурсы, занятые простаивающими потоками, и уменьшает размер пула. При необходимости потоки могут быть созданы вновь.

## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse использует пул потоков десериализации префиксов для параллельного чтения метаданных столбцов и подстолбцов из файловых префиксов в широких частях MergeTree. `max_prefixes_deserialization_thread_pool_size` ограничивает максимальное количество потоков в пуле.

## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость сетевого обмена данными при чтении, в байтах в секунду.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничения.
:::

## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость обмена данными по сети при записи, в байтах в секунду.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость обмена данными по сети в байтах в секунду для операций репликации (replicated fetches). Ноль означает отсутствие ограничений.

## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость обмена данными по сети, в байтах в секунду, для replicated sends. Нулевое значение означает отсутствие ограничения.

## max&#95;replicated&#95;table&#95;num&#95;to&#95;throw {#max_replicated_table_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если число реплицированных таблиц превышает это значение, сервер выбросит исключение.

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

Максимальный объём памяти в байтах, который разрешено использовать серверу.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается настройкой `max_server_memory_usage_to_ram_ratio`.
:::

Как частный случай, значение `0` (по умолчанию) означает, что сервер может потреблять всю доступную память (за исключением дополнительных ограничений, накладываемых `max_server_memory_usage_to_ram_ratio`).

## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />

Максимальный объём памяти, который серверу разрешено использовать, выраженный как доля от всего доступного объёма памяти.

Например, значение `0.9` (по умолчанию) означает, что сервер может использовать до 90% доступной памяти.

Позволяет снизить потребление памяти на системах с малым объёмом памяти.
На хостах с небольшим объёмом RAM и swap может потребоваться установить для параметра [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) значение больше 1.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается параметром `max_server_memory_usage`.
:::

## max&#95;session&#95;timeout {#max_session_timeout}

Максимальное значение тайм-аута сеанса в секундах.

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
<max_table_num_to_throw>400</max_table_num_to_throw>
```


## max&#95;table&#95;num&#95;to&#95;warn {#max_table_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="5000" />

Если число подключённых таблиц превышает указанное значение, сервер ClickHouse добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```


## max&#95;table&#95;size&#95;to&#95;drop {#max_table_size_to_drop}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

Ограничение на удаление таблиц.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает значение `max_table_size_to_drop` (в байтах), вы не можете удалить её с помощью запроса [`DROP`](../../sql-reference/statements/drop.md) или [`TRUNCATE`](../../sql-reference/statements/truncate.md).

:::note
Значение `0` означает, что вы можете удалять любые таблицы без каких-либо ограничений.

Этот параметр применяется без перезапуска сервера ClickHouse. Другой способ отключить это ограничение — создать файл `<clickhouse-path>/flags/force_drop_table`.
:::

**Пример**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```


## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объем дискового пространства, который может быть использован для внешней агрегации, объединений или сортировки.
Запросы, превышающие этот предел, завершатся с ошибкой (будет выброшено исключение).

:::note
Значение `0` означает отсутствие ограничения.
:::

См. также:

- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

## max&#95;thread&#95;pool&#95;free&#95;size {#max_thread_pool_free_size}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если число **простаивающих** потоков в глобальном пуле потоков превышает значение параметра [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size), ClickHouse освобождает ресурсы, занятые некоторыми потоками, и размер пула уменьшается. При необходимости потоки могут быть созданы снова.

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

<SettingsInfoBlock type="UInt64" default_value="8" />Количество потоков для загрузки неактивных (неожидаемых) частей данных при запуске.

## max&#95;view&#95;num&#95;to&#95;throw {#max_view_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если число представлений превышает это значение, сервер сгенерирует исключение.

Учитываются только таблицы для движков баз данных:

* Atomic
* Ordinary
* Replicated
* Lazy

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**

```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```


## max&#95;view&#95;num&#95;to&#95;warn {#max_view_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Если число подключённых представлений превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```


## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на общее количество одновременно ожидающих выполнения запросов.
Выполнение ожидающего запроса блокируется, пока необходимые таблицы загружаются асинхронно (см. [`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases)).

:::note
Ожидающие запросы не учитываются при проверке ограничений, контролируемых следующими настройками:

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

Эта корректировка введена для того, чтобы избежать достижения этих лимитов сразу после запуска сервера.
:::

:::note

Значение `0` (по умолчанию) означает отсутствие ограничения.

Эту настройку можно изменять в процессе работы сервера; изменения вступают в силу сразу. Уже выполняющиеся запросы при этом не изменяются.
:::

## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, должен ли фоновый обработчик памяти корректировать внутренний трекер памяти на основе информации из внешних источников, таких как jemalloc и cgroups.

## memory_worker_period_ms {#memory_worker_period_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Период срабатывания фонового обработчика памяти, который корректирует показания трекера памяти и очищает неиспользуемые страницы при повышенном потреблении памяти. Если установлено значение 0, будет использовано значение по умолчанию, зависящее от источника потребления памяти.

## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

<SettingsInfoBlock type="Bool" default_value="1" />Использовать данные о текущем использовании памяти cgroup для корректировки учета памяти.

## merge&#95;tree {#merge_tree}

Тонкая настройка таблиц в [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Для дополнительной информации см. заголовочный файл MergeTreeSettings.h.

**Пример**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```


## merge_workload {#merge_workload} 

<SettingsInfoBlock type="String" default_value="default" />

Используется для регулирования использования и распределения ресурсов между слияниями и другими рабочими нагрузками. Указанное значение используется в качестве значения настройки `workload` для всех фоновых слияний. Может быть переопределено настройкой MergeTree.

**См. также**

- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)

## merges&#95;mutations&#95;memory&#95;usage&#95;soft&#95;limit {#merges_mutations_memory_usage_soft_limit}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает ограничение на объём оперативной памяти, который разрешено использовать для выполнения операций слияния и мутаций.
Если ClickHouse достигает установленного лимита, он не будет планировать новые фоновые операции слияния или мутаций, но продолжит выполнять уже запланированные задачи.

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```


## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />

Значение `merges_mutations_memory_usage_soft_limit` по умолчанию рассчитывается как `memory_amount * merges_mutations_memory_usage_to_ram_ratio`.

**См. также:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)

## metric&#95;log {#metric_log}

По умолчанию он отключен.

**Включение**

Чтобы вручную включить сбор истории метрик [`system.metric_log`](../../operations/system-tables/metric_log.md), создайте `/etc/clickhouse-server/config.d/metric_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `metric_log`, следует создать файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />

Минимальное соотношение между временем ожидания CPU в ОС (метрика OSCPUWaitMicroseconds) и временем занятости (метрика OSCPUVirtualTimeMicroseconds), при достижении которого рассматривается возможность разрыва соединений. Для вычисления вероятности используется линейная интерполяция между минимальным и максимальным значением этого соотношения; при минимальном значении вероятность равна 0.
Подробности см. в разделе [Управление поведением при перегрузке CPU сервера](/operations/settings/server-overload).

## mlock&#95;executable {#mlock_executable}

Выполнить `mlockall` после старта, чтобы снизить задержку первых запросов и предотвратить выгрузку исполняемого файла clickhouse из памяти при высокой нагрузке на ввод-вывод.

:::note
Рекомендуется включить эту опцию, но это приведёт к увеличению времени запуска на несколько секунд.
Имейте в виду, что этот параметр не будет работать без capability `CAP&#95;IPC&#95;LOCK`.
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```


## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />

Этот параметр позволяет избегать частых вызовов open/close (которые очень затратны из‑за связанных с этим промахов по страницам) и повторно использовать отображения (memory mappings) из нескольких потоков и запросов. Значение параметра — это количество отображённых регионов (обычно равно количеству отображённых файлов).

Объём данных в отображённых файлах можно отслеживать в следующих системных таблицах по следующим метрикам:

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells` в [`system.metrics`](/operations/system-tables/metrics), [`system.metric_log`](/operations/system-tables/metric_log)
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses` в [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)

:::note
Объём данных в отображённых файлах напрямую не потребляет память и не учитывается в использовании памяти запросом или сервером, потому что эта память может быть отброшена аналогично кэшу страниц операционной системы. Кэш сбрасывается (файлы закрываются) автоматически при удалении старых частей в таблицах семейства MergeTree, также его можно сбросить вручную запросом `SYSTEM DROP MMAP CACHE`.

Этот параметр можно изменять во время работы сервера, и изменения вступят в силу немедленно.
:::

## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />

Используется для регулирования использования и распределения ресурсов между мутациями и другими рабочими нагрузками. Указанное значение используется в качестве значения настройки `workload` для всех фоновых мутаций. Может быть переопределено настройкой MergeTree.

**См. также**

- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)

## mysql&#95;port {#mysql_port}

Порт для обмена данными с клиентами по протоколу MySQL.

:::note

* Положительные целые числа указывают номер порта, который необходимо прослушивать
* Пустые значения используются для отключения обмена данными с клиентами по протоколу MySQL.
  :::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```


## mysql_require_secure_transport {#mysql_require_secure_transport} 

Если установлено значение true, для клиентов при работе через [mysql_port](#mysql_port) требуется защищённое соединение. Подключения с опцией `--ssl-mode=none` будут отклоняться. Используйте совместно с настройками [OpenSSL](#openssl).

## openSSL {#openssl} 

Конфигурация клиента и сервера SSL.

Поддержка SSL реализована библиотекой `libpoco`. Доступные параметры конфигурации описаны в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи параметров настроек сервера и клиента:

| Параметр                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Значение по умолчанию                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | Путь к файлу с закрытым ключом PEM-сертификата. Файл может содержать как ключ, так и сертификат.                                                                                                                                                                                                                                                                                                                                                                                                 |                                                                                            |
| `certificateFile`             | Путь к файлу сертификата клиента/сервера в формате PEM. Можно опустить, если в `privateKeyFile` уже содержится сертификат.                                                                                                                                                                                                                                                                                                                                                                       |                                                                                            |
| `caConfig`                    | Путь к файлу или каталогу, содержащему доверенные сертификаты CA. Если он указывает на файл, тот должен быть в формате PEM и может содержать несколько сертификатов CA. Если он указывает на каталог, в нём должен быть один файл .pem на каждый сертификат CA. Имена файлов определяются по хеш-значению имени субъекта CA. Подробности приведены на man-странице [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                                                                            |
| `verificationMode`            | Метод проверки сертификатов узла. Подробности см. в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                                                                         | `relaxed`                                                                                  |
| `verificationDepth`           | Максимальная длина цепочки проверки сертификатов. Проверка завершится с ошибкой, если длина цепочки сертификатов превышает заданное значение.                                                                                                                                                                                                                                                                                                                                                    | `9`                                                                                        |
| `loadDefaultCAFile`           | Будут ли использоваться встроенные CA‑сертификаты OpenSSL. ClickHouse предполагает, что встроенные CA‑сертификаты находятся в файле `/etc/ssl/cert.pem` (или, соответственно, в каталоге `/etc/ssl/certs`) либо в файле (или, соответственно, каталоге), указанном в переменной окружения `SSL_CERT_FILE` (или, соответственно, `SSL_CERT_DIR`).                                                                                                                                                 | `true`                                                                                     |
| `cipherList`                  | Поддерживаемые наборы шифров OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | Включает или отключает кэширование сеансов. Необходимо использовать совместно с `sessionIdContext`. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                        | `false`                                                                                    |
| `sessionIdContext`            | Уникальная последовательность случайных символов, которую сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Этот параметр всегда рекомендуется указывать, так как он помогает избежать проблем как при кэшировании сеанса сервером, так и при запросе кэширования со стороны клиента.                                                                                                                                | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | Максимальное количество сеансов, которые сервер может кэшировать. Значение `0` означает отсутствие ограничения на число сеансов.                                                                                                                                                                                                                                                                                                                                                                 | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | Время кеширования сеанса на сервере (в часах).                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                                                                        |
| `extendedVerification`        | Если включено, проверяет, что CN или SAN в сертификате совпадает с именем хоста пира.                                                                                                                                                                                                                                                                                                                                                                                                            | `false`                                                                                    |
| `requireTLSv1`                | Требовать соединение по TLSv1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                             | `false`                                                                                    |
| `requireTLSv1_1`              | Требовать соединение по TLSv1.1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                                                                    |
| `requireTLSv1_2`              | Требовать соединение по TLSv1.2. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                                                                    |
| `fips`                        | Включает режим FIPS в OpenSSL. Поддерживается, если используемая версия библиотеки OpenSSL поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                                    | `false`                                                                                    |
| `privateKeyPassphraseHandler` | Класс (подкласс класса PrivateKeyPassphraseHandler), который запрашивает парольную фразу для доступа к закрытому ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                              | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | Класс (подкласс CertificateHandler), предназначенный для проверки недействительных сертификатов. Например: `<invalidCertificateHandler><name>RejectCertificateHandler</name></invalidCertificateHandler>`.                                                                                                                                                                                                                                                                                       | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | Протоколы, использование которых запрещено.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |                                                                                            |
| `preferServerCiphers`         | Серверные наборы шифров, предпочитаемые клиентом.                                                                                                                                                                                                                                                                                                                                                                                                                                                | `false`                                                                                    |

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
        <!-- Use for self-signed: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- Use for self-signed: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```


## opentelemetry&#95;span&#95;log {#opentelemetry_span_log}

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


## os_collect_psi_metrics {#os_collect_psi_metrics} 

<SettingsInfoBlock type="Bool" default_value="1" />Включает сбор метрик PSI из файлов /proc/pressure/.

## os_cpu_busy_time_threshold {#os_cpu_busy_time_threshold} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Порог времени занятости CPU операционной системы в микросекундах (метрика OSCPUVirtualTimeMicroseconds), при котором считается, что CPU выполняет полезную работу; перегрузка CPU не фиксируется, если время занятости ниже этого значения.

## os_threads_nice_value_distributed_cache_tcp_handler {#os_threads_nice_value_distributed_cache_tcp_handler} 

<SettingsInfoBlock type="Int32" default_value="0" />

Значение nice в Linux для потоков обработчика TCP распределённого кэша. Меньшие значения означают более высокий приоритет для CPU.

Требует capability `CAP_SYS_NICE`, иначе не оказывает эффекта (no-op).

Возможные значения: от -20 до 19.

## os_threads_nice_value_merge_mutate {#os_threads_nice_value_merge_mutate} 

<SettingsInfoBlock type="Int32" default_value="0" />

Значение `nice` в Linux для потоков слияния и мутаций. Более низкие значения означают более высокий приоритет использования CPU.

Требуется capability CAP_SYS_NICE, в противном случае параметр не оказывает эффекта.

Возможные значения: от -20 до 19.

## os_threads_nice_value_zookeeper_client_send_receive {#os_threads_nice_value_zookeeper_client_send_receive} 

<SettingsInfoBlock type="Int32" default_value="0" />

Значение `nice` в Linux для потоков отправки и приёма в клиенте ZooKeeper. Меньшие значения означают более высокий приоритет по CPU.

Требуется capability CAP_SYS_NICE, иначе параметр не оказывает эффекта.

Возможные значения: от -20 до 19.

## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

<SettingsInfoBlock type="Double" default_value="0.15" />Доля лимита памяти, которую следует оставлять свободной от кэша страниц в пространстве пользователя. Аналогично параметру Linux min_free_kbytes.

## page_cache_history_window_ms {#page_cache_history_window_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Задержка перед тем, как освобождённая память может быть использована кэшем страниц в пространстве пользователя.

## page_cache_max_size {#page_cache_max_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальный размер кэша страниц в пространстве пользователя. Установите значение 0, чтобы отключить кэш. Если значение больше page_cache_min_size, размер кэша будет динамически подстраиваться в этих пределах, чтобы использовать большую часть доступной памяти, при этом общий объём потребляемой памяти будет оставаться ниже лимита (max_server_memory_usage[_to_ram_ratio]).

## page_cache_min_size {#page_cache_min_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />Минимальный размер кэша страниц в пространстве пользователя.

## page_cache_policy {#page_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша страниц в пользовательском пространстве.

## page_cache_shards {#page_cache_shards} 

<SettingsInfoBlock type="UInt64" default_value="4" />Разбейте пользовательский кэш страниц в пространстве пользователя на указанное число сегментов, чтобы уменьшить конкуренцию за мьютекс. Экспериментальная настройка; маловероятно, что она улучшит производительность.

## page_cache_size_ratio {#page_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди в кэше страниц в пользовательском пространстве (userspace page cache) относительно общего размера кэша.

## part&#95;log {#part_log}

Логирование событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md), например добавления или слияния данных. Вы можете использовать лог для моделирования алгоритмов слияния и сравнения их характеристик, а также для визуализации процесса слияния.

Запросы записываются в таблицу [system.part&#95;log](/operations/system-tables/part_log), а не в отдельный файл. Имя этой таблицы можно задать в параметре `table` (см. ниже).

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

Интервал времени, по истечении которого части для SharedMergeTree удаляются полностью. Доступно только в ClickHouse Cloud.

## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />

Добавляет к `kill_delay_period` равномерно распределённое значение в диапазоне от 0 до x секунд, чтобы избежать эффекта массовых одновременных обращений (thundering herd) и последующей DoS-атаки на ZooKeeper в случае очень большого количества таблиц. Параметр доступен только в ClickHouse Cloud.

## parts_killer_pool_size {#parts_killer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />

Потоки, выполняющие очистку устаревших частей в общем SharedMergeTree. Доступно только в ClickHouse Cloud.

## path {#path}

Путь к каталогу, содержащему данные.

:::note
Слэш на конце обязателен.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```


## postgresql&#95;port {#postgresql_port}

Порт для взаимодействия с клиентами по протоколу PostgreSQL.

:::note

* Положительные целые числа задают номер порта для прослушивания.
* Пустое значение используется для отключения взаимодействия с клиентами по протоколу PostgreSQL.
  :::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```


## postgresql_require_secure_transport {#postgresql_require_secure_transport} 

Если параметр установлен в true, для связи с клиентами по [postgresql_port](#postgresql_port) требуется защищённое соединение. Подключение с параметром `sslmode=disable` будет отклонено. Используйте совместно с настройками [OpenSSL](#openssl).

## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />Размер фонового пула для упреждающей выборки данных из удалённых объектных хранилищ

## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно поместить в пул задач предварительной выборки

## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество задач в очереди пула потоков десериализации prefixes.

:::note
Значение `0` означает отсутствие ограничений.
:::

## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр имеет значение `true`, ClickHouse создаёт все настроенные таблицы `system.*_log` перед запуском. Это может быть полезно, если некоторые стартовые скрипты зависят от этих таблиц.

## primary_index_cache_policy {#primary_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования основного индекса.

## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />Часть общего объёма кэша меток, которая заполняется во время предварительного прогрева.

## primary_index_cache_size {#primary_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />Максимальный размер кэша первичного индекса (индекса семейства таблиц MergeTree).

## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше первичного индекса по отношению к общему размеру кэша.

## process&#95;query&#95;plan&#95;packet {#process_query_plan_packet}

<SettingsInfoBlock type="Bool" default_value="0" />

Этот параметр позволяет считывать пакет QueryPlan. Этот пакет отправляется для распределённых запросов, когда включён `serialize_query_plan`.
По умолчанию параметр отключён, чтобы избежать возможных проблем с безопасностью, которые могут быть вызваны ошибками при двоичной десериализации плана запроса.

**Пример**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```


## processors&#95;profile&#95;log {#processors_profile_log}

Настройки для системной таблицы [`processors_profile_log`](../system-tables/processors_profile_log.md).

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

Экспорт метрик для сбора системой [Prometheus](https://prometheus.io).

Настройки:

* `endpoint` – HTTP endpoint для сбора метрик сервером Prometheus. Должен начинаться с &#39;/&#39;.
* `port` – Порт для `endpoint`.
* `metrics` – Экспортировать метрики из таблицы [system.metrics](/operations/system-tables/metrics).
* `events` – Экспортировать метрики из таблицы [system.events](/operations/system-tables/events).
* `asynchronous_metrics` – Экспортировать текущие значения метрик из таблицы [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics).
* `errors` - Экспортировать количество ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эти данные также можно получить из таблицы [system.errors](/operations/system-tables/errors).

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

Проверьте (замените `127.0.0.1` на IP‑адрес или имя хоста сервера ClickHouse):

```bash
curl 127.0.0.1:9363/metrics
```


## proxy {#proxy}

Определите прокси‑серверы для HTTP‑ и HTTPS‑запросов, которые в данный момент поддерживаются хранилищем S3, табличными функциями S3 и функциями URL.

Есть три способа задать прокси‑серверы:

* переменные окружения
* списки прокси
* удалённые прокси‑резолверы.

Обход прокси‑серверов для отдельных хостов также поддерживается с использованием `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать
прокси‑сервер для заданного протокола. Если они настроены в вашей системе, всё должно работать без дополнительной настройки.

Это самый простой подход, если для данного протокола есть
только один прокси‑сервер и этот прокси‑сервер не меняется.

**Списки прокси**

Этот подход позволяет указать один или несколько
прокси‑серверов для протокола. Если определено более одного прокси‑сервера,
ClickHouse использует разные прокси по круговой схеме (round‑robin), распределяя
нагрузку между серверами. Это самый простой подход, если для протокола существует более одного
прокси‑сервера и список прокси‑серверов не меняется.

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

Выберите родительское поле во вкладках ниже, чтобы просмотреть его дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Field     | Description                                           |
    | --------- | ----------------------------------------------------- |
    | `<http>`  | Список из одного или нескольких HTTP-прокси-серверов  |
    | `<https>` | Список из одного или нескольких HTTPS-прокси-серверов |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | Field   | Description        |
    | ------- | ------------------ |
    | `<uri>` | URI прокси-сервера |
  </TabItem>
</Tabs>

**Удалённые резолверы прокси-серверов**

Прокси-серверы могут меняться динамически. В этом случае вы можете задать конечную точку (endpoint) резолвера. ClickHouse отправляет пустой GET-запрос на эту конечную точку, удалённый резолвер должен вернуть хост прокси-сервера.
ClickHouse будет использовать его для формирования URI прокси по следующему шаблону: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

Выберите родительское поле во вкладках ниже, чтобы просмотреть их дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Поле      | Описание                                    |
    | --------- | ------------------------------------------- |
    | `<http>`  | Список из одного или нескольких резолверов* |
    | `<https>` | Список из одного или нескольких резолверов* |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | Поле         | Описание                                        |
    | ------------ | ----------------------------------------------- |
    | `<resolver>` | Конечная точка и другие параметры для резолвера |

    :::note
    Можно использовать несколько элементов `<resolver>`, но используется только первый
    `<resolver>` для данного протокола. Любые другие элементы `<resolver>`
    для этого протокола игнорируются. Это означает, что балансировка нагрузки
    (если требуется) должна быть реализована удалённым резолвером.
    :::
  </TabItem>

  <TabItem value="resolver" label="<resolver>">
    | Поле                 | Описание                                                                                                                                                                                                      |
    | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `<endpoint>`         | URI прокси-резолвера                                                                                                                                                                                          |
    | `<proxy_scheme>`     | Протокол итогового URI прокси. Может быть либо `http`, либо `https`.                                                                                                                                          |
    | `<proxy_port>`       | Номер порта прокси-резолвера                                                                                                                                                                                  |
    | `<proxy_cache_time>` | Время в секундах, в течение которого значения от резолвера должны кэшироваться в ClickHouse. Установка этого значения в `0` заставляет ClickHouse обращаться к резолверу для каждого HTTP- или HTTPS-запроса. |
  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:

| Порядок | Настройка                  |
| ------- | -------------------------- |
| 1.      | Удалённые прокси-резолверы |
| 2.      | Списки прокси              |
| 3.      | Переменные окружения       |


ClickHouse будет проверять тип резолвера с наивысшим приоритетом для протокола запроса. Если он не определён,
будет проверен следующий по приоритету тип резолвера, пока не будет задействован резолвер окружения.
Это также позволяет одновременно использовать несколько типов резолверов.

## query&#95;cache {#query_cache}

Конфигурация [кеша запросов](../query-cache.md).

Доступны следующие настройки:

| Setting                   | Description                                                                                      | Default Value |
| ------------------------- | ------------------------------------------------------------------------------------------------ | ------------- |
| `max_size_in_bytes`       | Максимальный размер кеша в байтах. `0` означает, что кеш запросов отключён.                      | `1073741824`  |
| `max_entries`             | Максимальное количество результатов запросов `SELECT`, сохраняемых в кеше.                       | `1024`        |
| `max_entry_size_in_bytes` | Максимальный размер в байтах, который могут иметь результаты запросов `SELECT` для кеширования.  | `1048576`     |
| `max_entry_size_in_rows`  | Максимальное количество строк, которое могут иметь результаты запросов `SELECT` для кеширования. | `30000000`    |

:::note

* Изменённые настройки вступают в силу сразу.
* Данные для кеша запросов размещаются в DRAM. Если память ограничена, установите небольшое значение `max_size_in_bytes` или полностью отключите кеш запросов.
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
Этот параметр можно изменить во время работы сервера, и изменение вступит в силу немедленно.
:::

## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше условий запроса по отношению к общему размеру кэша.

## query&#95;log {#query_log}

Настройка логирования запросов, полученных при включённой настройке [log&#95;queries=1](../../operations/settings/settings.md).

Запросы логируются в таблицу [system.query&#95;log](/operations/system-tables/query_log), а не в отдельный файл. Вы можете изменить имя таблицы с помощью параметра `table` (см. ниже).

<SystemLogParameters />

Если таблица отсутствует, ClickHouse создаст её. Если структура журнала запросов изменилась после обновления сервера ClickHouse, таблица со старой структурой будет переименована, а новая таблица создана автоматически.

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

Правила на основе регулярных выражений, которые будут применяться к запросам, а также ко всем сообщениям журнала перед их записью в серверные журналы:
таблицы [`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes), а также к журналам, отправляемым клиенту. Это позволяет предотвратить утечку конфиденциальных данных из SQL-запросов, таких как имена, адреса электронной почты, персональные идентификаторы или номера кредитных карт, в журналы.

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

| Setting   | Description                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------- |
| `name`    | имя правила (необязательное поле)                                                                       |
| `regexp`  | регулярное выражение, совместимое с RE2 (обязательное поле)                                             |
| `replace` | строка подстановки для конфиденциальных данных (необязательное поле, по умолчанию — шесть символов `*`) |

Правила маскирования применяются ко всему запросу (чтобы предотвратить утечку конфиденциальных данных из некорректных / неразбираемых запросов).

Таблица [`system.events`](/operations/system-tables/events) содержит счётчик `QueryMaskingRulesMatch`, который показывает общее количество срабатываний правил маскирования запросов.

Для распределённых запросов каждый сервер должен быть настроен отдельно, иначе подзапросы, передаваемые на другие узлы, будут сохраняться без маскирования.


## query&#95;metric&#95;log {#query_metric_log}

По умолчанию этот лог отключён.

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

Чтобы отключить настройку `query_metric_log`, необходимо создать файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## query&#95;thread&#95;log {#query_thread_log}

Настройка для журналирования потоков запросов при включённой настройке [log&#95;query&#95;threads=1](/operations/settings/settings#log_query_threads).

Запросы записываются в таблицу [system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура журнала потоков запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, а новая таблица будет создана автоматически.

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

Настройка для логирования представлений (live, materialized и т. д.) в зависимости от запросов, для которых включена настройка [log&#95;query&#95;views=1](/operations/settings/settings#log_query_views).

Запросы записываются в таблицу [system.query&#95;views&#95;log](/operations/system-tables/query_views_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура таблицы журнала представлений запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет создана автоматически.

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

Параметр для перевыделения памяти под машинный код (&quot;text&quot;) с использованием больших страниц памяти (huge pages).

:::note
Это экспериментальная возможность.
:::

Пример:

```xml
<remap_executable>false</remap_executable>
```


## remote&#95;servers {#remote_servers}

Конфигурация кластеров, используемых движком таблицы [Distributed](../../engines/table-engines/special/distributed.md) и табличной функцией `cluster`.

**Пример**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

Значение атрибута `incl` см. в разделе «[Файлы конфигурации](/operations/configuration-files)».

**См. также**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [Обнаружение кластера](../../operations/cluster-discovery.md)
* [Движок реплицируемой базы данных](../../engines/database-engines/replicated.md)


## remote&#95;url&#95;allow&#95;hosts {#remote_url_allow_hosts}

Список хостов, которые разрешено использовать в движках хранения и табличных функциях, работающих с URL.

При добавлении хоста с xml‑тегом `\<host\>`:

* он должен быть указан в точности так же, как в URL, так как имя проверяется до DNS‑разрешения. Например: `<host>clickhouse.com</host>`
* если порт явно указан в URL, то проверяется связка host:port целиком. Например: `<host>clickhouse.com:80</host>`
* если хост указан без порта, разрешается любой порт этого хоста. Например: если указан `<host>clickhouse.com</host>`, то `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т. д. разрешены.
* если хост указан как IP‑адрес, то он проверяется в том виде, в котором указан в URL. Например: `[2a02:6b8:a::a]`.
* если есть редиректы и поддержка редиректов включена, то каждый редирект (заголовок Location) проверяется.

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


## replica&#95;group&#95;name {#replica_group_name}

Имя группы реплик для базы данных с движком Replicated.

Кластер, созданный базой данных Replicated, будет состоять из реплик одной группы.
DDL‑запросы будут ожидать только реплики из этой группы.

По умолчанию пусто.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```


## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />Таймаут HTTP-соединения для запросов на загрузку частей данных. Наследуется из профиля по умолчанию `http_connection_timeout`, если явно не задан.

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />Таймаут ожидания получения данных по HTTP для запросов выборки частей (fetch part). Наследуется от профиля по умолчанию `http_receive_timeout`, если не установлен явно.

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />Тайм-аут отправки HTTP при запросах на получение кусков данных. Наследуется из профиля по умолчанию `http_send_timeout`, если не задан явно.

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

<SettingsInfoBlock type="UInt64" default_value="100" />Максимальное количество провайдеров учетных данных S3, которые могут храниться в кэше

## s3_max_redirects {#s3_max_redirects} 

<SettingsInfoBlock type="UInt64" default_value="10" />Максимальное допустимое количество перенаправлений S3.

## s3_retry_attempts {#s3_retry_attempts} 

<SettingsInfoBlock type="UInt64" default_value="500" />Настройка для Aws::Client::RetryStrategy, Aws::Client самостоятельно выполняет повторные попытки, 0 означает отсутствие повторных попыток

## s3queue_disable_streaming {#s3queue_disable_streaming} 

<SettingsInfoBlock type="Bool" default_value="0" />Отключает потоковую обработку в S3Queue, даже если таблица уже создана и к ней прикреплены материализованные представления

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

Включение этой опции, особенно в предпроизводственных средах, настоятельно рекомендуется.

Ключи:

| Key                   | Description                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`             | Логический флаг для включения функции, по умолчанию `true`. Установите `false`, чтобы не отправлять отчёты о сбоях.                              |
| `send_logical_errors` | `LOGICAL_ERROR` похож на `assert`: это ошибка (bug) в ClickHouse. Этот логический флаг включает отправку таких исключений (по умолчанию `true`). |
| `endpoint`            | Позволяет переопределить URL конечной точки для отправки отчётов о сбоях.                                                                        |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


## series_keeper_path {#series_keeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />

Путь в Keeper, под которым создаются узлы с автоинкрементными номерами, генерируемыми функцией `generateSerialID`. Каждая серия представлена отдельным узлом по этому пути.

## show_addresses_in_stack_traces {#show_addresses_in_stack_traces} 

<SettingsInfoBlock type="Bool" default_value="1" />Если установлено значение true, в трассировках стека будут отображаться адреса

## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores} 

<SettingsInfoBlock type="Bool" default_value="1" />Если параметр установлен в true, ClickHouse будет ожидать завершения всех выполняющихся операций резервного копирования и восстановления перед завершением работы.

## shutdown_wait_unfinished {#shutdown_wait_unfinished} 

<SettingsInfoBlock type="UInt64" default_value="5" />Время ожидания незавершённых запросов в секундах

## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />Если значение параметра равно true, ClickHouse будет дожидаться завершения выполняющихся запросов перед остановкой.

## skip_binary_checksum_checks {#skip_binary_checksum_checks} 

<SettingsInfoBlock type="Bool" default_value="0" />Отключает проверку контрольных сумм бинарного файла ClickHouse

## ssh&#95;server {#ssh_server}

Публичная часть ключа хоста будет записана в файл known&#95;hosts
на стороне SSH-клиента при первом подключении.

Конфигурации ключа хоста по умолчанию отключены.
Раскомментируйте конфигурации ключа хоста и укажите путь к соответствующему SSH-ключу, чтобы их активировать:

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
        <!-- configuration -->
    </disks>
    <policies>
        <!-- configuration -->
    </policies>
</storage_configuration>
```


### Настройка дисков {#configuration-of-disks}

Секция `disks` имеет следующую структуру:

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

Приведённые выше подтеги задают следующие настройки для `disks`:

| Setting                 | Description                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `<disk_name_N>`         | Имя диска, которое должно быть уникальным.                                                                       |
| `path`                  | Путь, по которому будут храниться данные сервера (каталоги `data` и `shadow`). Должен оканчиваться символом `/`. |
| `keep_free_space_bytes` | Размер зарезервированного свободного места на диске.                                                             |

:::note
Порядок дисков не имеет значения.
:::


### Конфигурация политик {#configuration-of-policies}

Приведённые выше подтеги определяют следующие настройки для `policies`:

| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `volume_name_N`              | Имя тома. Имена томов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `disk`                       | Диск, находящийся внутри тома.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `max_data_part_size_bytes`   | Максимальный размер фрагмента данных, который может находиться на любом из дисков в этом томе. Если в результате слияния ожидается размер фрагмента больше, чем `max_data_part_size_bytes`, фрагмент будет записан в следующий том. По сути, эта возможность позволяет хранить новые / маленькие фрагменты на горячем (SSD) томе и перемещать их на холодный (HDD) том, когда они достигают большого размера. Не используйте эту опцию, если в политике только один том.                          |
| `move_factor`                | Доля доступного свободного пространства на томе. Если свободного пространства становится меньше, данные начинают переноситься на следующий том, если он есть. Для переноса фрагменты сортируются по размеру от большего к меньшему (по убыванию) и выбираются фрагменты, суммарный размер которых достаточен для выполнения условия `move_factor`; если суммарный размер всех фрагментов недостаточен, будут перенесены все фрагменты.                                                                                      |
| `perform_ttl_move_on_insert` | Отключает перенос данных с истекшим TTL при вставке. По умолчанию (если включено), если мы вставляем фрагмент данных, срок жизни которого уже истёк согласно правилу переноса по времени жизни, он немедленно переносится на том / диск, указанный в правиле переноса. Это может существенно замедлить вставку в случае, если целевой том / диск медленный (например, S3). Если отключено, истекшая часть данных записывается в том по умолчанию, а затем сразу же переносится в том, указанный в правиле для истекшего TTL. |
| `load_balancing`             | Политика балансировки по дискам: `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `least_used_ttl_ms`          | Устанавливает таймаут (в миллисекундах) для обновления информации о доступном пространстве на всех дисках (`0` — всегда обновлять, `-1` — никогда не обновлять, значение по умолчанию — `60000`). Учтите, что если диск используется только ClickHouse и к нему не будет применяться динамическое изменение размера файловой системы, можно использовать значение `-1`. Во всех остальных случаях это не рекомендуется, так как в итоге приведёт к некорректному распределению пространства.            |
| `prefer_not_to_merge`        | Отключает слияние частей данных на этом томе. Примечание: это потенциально опасно и может привести к замедлению. При включении этого параметра (не делайте так) слияние данных на этом томе запрещено (что плохо). Это позволяет управлять тем, как ClickHouse работает с медленными дисками. Мы рекомендуем вообще не использовать этот параметр.                                                                                                                                                |
| `volume_priority`            | Определяет приоритет (порядок), в котором заполняются тома. Чем меньше значение, тем выше приоритет. Значения параметра должны быть натуральными числами и покрывать диапазон от 1 до N (N — наибольшее указанное значение параметра) без пропусков.                                                                                                                                                                                                                                                         |

Для `volume_priority`:

- Если у всех томов есть этот параметр, они получают приоритет в указанном порядке.
- Если он есть только у _некоторых_ томов, тома, у которых его нет, имеют наименьший приоритет. Те, у которых он есть, упорядочиваются в соответствии со значением тега, приоритет остальных определяется порядком их описания в конфигурационном файле относительно друг друга.
- Если _ни одному_ тому этот параметр не задан, их порядок определяется порядком описания в конфигурационном файле.
- Приоритет томов может отличаться.

## storage_connections_hard_limit {#storage_connections_hard_limit} 

<SettingsInfoBlock type="UInt64" default_value="200000" />Исключение генерируется при попытке создать новое соединение, когда этот лимит достигнут. Установите 0, чтобы отключить жёсткий лимит. Ограничение применяется к соединениям хранилищ.

## storage_connections_soft_limit {#storage_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />Подключения сверх этого лимита имеют значительно более короткое время жизни. Ограничение применяется к подключениям к хранилищам.

## storage_connections_store_limit {#storage_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Соединения сверх этого предела сбрасываются после использования. Установите 0, чтобы отключить кэш соединений. Предел применяется к соединениям хранилищ.

## storage_connections_warn_limit {#storage_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="500" />Предупреждающие сообщения записываются в журнал, если количество используемых подключений превышает этот предел. Этот предел распространяется на подключения к хранилищам.

## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

<SettingsInfoBlock type="Bool" default_value="1" />Записывать файлы метаданных диска в формате VERSION_FULL_OBJECT_KEY. Эта настройка включена по умолчанию. Настройка устарела.

## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

<SettingsInfoBlock type="Bool" default_value="1" />Если параметр включён, при создании SharedSet и SharedJoin генерируется внутренний UUID. Только в ClickHouse Cloud

## table_engines_require_grant {#table_engines_require_grant} 

Если установлено в true, пользователям требуется grant, чтобы создать таблицу с конкретным движком, например: `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию, для обеспечения обратной совместимости, при создании таблицы с конкретным движком grant игнорируется, однако вы можете изменить это поведение, установив данный параметр в true.
:::

## tables_loader_background_pool_size {#tables_loader_background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Задает количество потоков, выполняющих асинхронные задачи загрузки во фоновом пуле. Фоновый пул используется для асинхронной загрузки таблиц после запуска сервера в случае, если нет запросов, ожидающих таблицу. При большом количестве таблиц может быть полезно использовать небольшое число потоков в фоновом пуле. Это позволит сохранить ресурсы CPU для одновременного выполнения запросов.

:::note
Значение `0` означает, что будут использоваться все доступные CPU.
:::

## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Задает количество потоков, выполняющих задачи загрузки во foreground-пуле. Foreground-пул используется для синхронной загрузки таблиц до того, как сервер начнет прослушивать порт, а также для загрузки таблиц, загрузку которых необходимо дождаться. Foreground-пул имеет более высокий приоритет, чем background-пул. Это означает, что в background-пуле не запускаются задачи, пока во foreground-пуле выполняются задачи.

:::note
Значение `0` означает, что будут использованы все доступные CPU.
:::

## tcp_close_connection_after_queries_num {#tcp_close_connection_after_queries_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальное число запросов, которое может быть выполнено по одному TCP‑соединению, прежде чем соединение будет закрыто. Установите 0 для неограниченного числа запросов.

## tcp_close_connection_after_queries_seconds {#tcp_close_connection_after_queries_seconds} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальное время жизни TCP‑подключения в секундах до его закрытия. Установите значение 0 для неограниченного времени жизни подключения.

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

Порт SSH-сервера, который позволяет пользователю подключаться и выполнять запросы в интерактивном режиме, используя встроенный клиент поверх PTY.

Пример:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


## temporary&#95;data&#95;in&#95;cache {#temporary_data_in_cache}

При использовании этой настройки временные данные будут храниться в кеше для соответствующего диска.
В этом разделе следует указать имя диска с типом `cache`.
В этом случае кеш и временные данные будут использовать одно и то же пространство, и кеш диска может быть вытеснен для освобождения места под временные данные.

:::note
Для настройки хранилища временных данных может быть использована только одна из опций: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
:::

**Пример**

И кеш для `local_disk`, и временные данные будут храниться в `/tiny_local_cache` в файловой системе, управляемой `tiny_local_cache`.

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

<SettingsInfoBlock type="UInt64" default_value="1000000" />Размер кеша блока словаря текстового индекса (в элементах). Ноль означает, что кеш отключён.

## text_index_dictionary_block_cache_policy {#text_index_dictionary_block_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования блоков словаря текстового индекса.

## text_index_dictionary_block_cache_size {#text_index_dictionary_block_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Размер кэша для блоков словаря текстового индекса. Нулевое значение отключает кэш.

:::note
Этот параметр можно изменять во время работы сервера, и изменения вступают в силу немедленно.
:::

## text_index_dictionary_block_cache_size_ratio {#text_index_dictionary_block_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше блоков словаря текстового индекса по отношению к общему размеру кэша.

## text_index_header_cache_max_entries {#text_index_header_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="100000" />Размер кэша заголовков текстового индекса в элементах. Значение 0 отключает кэш.

## text_index_header_cache_policy {#text_index_header_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования заголовков текстового индекса.

## text_index_header_cache_size {#text_index_header_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Размер кэша заголовков текстового индекса. Ноль означает, что кэш отключён.

:::note
Этот параметр можно изменить во время работы сервера, и изменение вступает в силу немедленно.
:::

## text_index_header_cache_size_ratio {#text_index_header_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше заголовков текстового индекса по отношению к общему размеру кэша.

## text_index_postings_cache_max_entries {#text_index_postings_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Размер кэша для списка вхождений текстового индекса, измеряемый числом элементов. Значение 0 отключает кэш.

## text_index_postings_cache_policy {#text_index_postings_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования списков постингов текстового индекса.

## text_index_postings_cache_size {#text_index_postings_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="2147483648" />Размер кэша для списков вхождений текстового индекса. Ноль означает, что кэш отключен.

:::note
Этот параметр можно изменить во время работы сервера, и изменения вступают в силу немедленно.
:::

## text_index_postings_cache_size_ratio {#text_index_postings_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше списка вхождений текстового индекса относительно общего объёма кэша.

## text&#95;log {#text_log}

Настройки системной таблицы [text&#95;log](/operations/system-tables/text_log), используемой для логирования текстовых сообщений.

<SystemLogParameters />

Дополнительно:

| Setting | Description                                                                                          | Default Value |
| ------- | ---------------------------------------------------------------------------------------------------- | ------------- |
| `level` | Максимальный уровень важности сообщений (по умолчанию `Trace`), которые будут сохраняться в таблице. | `Trace`       |

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

Максимальное количество заданий, которые могут быть поставлены в глобальный пул потоков. Увеличение размера очереди приводит к большему потреблению памяти. Рекомендуется устанавливать это значение равным [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size).

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```


## threadpool_local_fs_reader_pool_size {#threadpool_local_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />Количество потоков в пуле, используемом для чтения из локальной файловой системы, когда `local_filesystem_read_method = 'pread_threadpool'`.

## threadpool_local_fs_reader_queue_size {#threadpool_local_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Максимальное количество заданий в очереди пула потоков для чтения из локальной файловой системы.

## threadpool_remote_fs_reader_pool_size {#threadpool_remote_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" />Количество потоков в пуле потоков, используемом для чтения из удалённой файловой системы при значении `remote_filesystem_read_method = 'threadpool'`.

## threadpool_remote_fs_reader_queue_size {#threadpool_remote_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Максимальное количество задач, которые могут быть запланированы в пуле потоков для чтения с удалённой файловой системы.

## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />Размер фонового пула потоков для операций записи в объектные хранилища

## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно добавить в фоновый пул потоков, обрабатывающий запросы на запись в объектные хранилища

## throw&#95;on&#95;unknown&#95;workload {#throw_on_unknown_workload}

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет поведение при доступе к неизвестному WORKLOAD с установкой параметра запроса &#39;workload&#39;.

* Если `true`, из запроса, который пытается получить доступ к неизвестному WORKLOAD, выбрасывается исключение RESOURCE&#95;ACCESS&#95;DENIED. Полезно для принудительного применения планирования ресурсов для всех запросов после того, как иерархия WORKLOAD настроена и содержит WORKLOAD default.
* Если `false` (значение по умолчанию), запросу с параметром &#39;workload&#39;, указывающим на неизвестный WORKLOAD, предоставляется неограниченный доступ без планирования ресурсов. Это важно при настройке иерархии WORKLOAD до добавления WORKLOAD default.

**Пример**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**См. также**

* [Планирование рабочих нагрузок](/operations/workload-scheduling.md)


## timezone {#timezone}

Часовой пояс сервера.

Указывается как идентификатор IANA для часового пояса UTC или географического региона (например, Africa/Abidjan).

Часовой пояс необходим для преобразования между форматами String и DateTime при выводе полей DateTime в текстовый формат (на экран или в файл), а также при получении значения типа DateTime из строки. Кроме того, часовой пояс используется в функциях, работающих с датой и временем, если они не получили часовой пояс во входных параметрах.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**См. также**

* [session&#95;timezone](../settings/settings.md#session_timezone)


## tmp&#95;path {#tmp_path}

Путь в локальной файловой системе для хранения временных данных при обработке крупных запросов.

:::note

* Для настройки хранения временных данных может быть использован только один из параметров: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
* Обязателен слеш в конце пути.
  :::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## tmp&#95;policy {#tmp_policy}

Политика хранения временных данных. Все файлы с префиксом `tmp` будут удалены при старте.

:::note
Рекомендации по использованию объектного хранилища в качестве `tmp_policy`:

* Используйте отдельный `bucket:path` на каждом сервере
* Используйте `metadata_type=plain`
* При необходимости настройте TTL для этого bucket
  :::

:::note

* Для конфигурации хранилища временных данных может использоваться только один из вариантов: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
* Параметры `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes` игнорируются.
* Политика должна содержать ровно *один том*.

Дополнительные сведения см. в документации по [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree).
:::

**Пример**

Когда на `/disk1` заканчивается свободное место, временные данные будут сохраняться на `/disk2`.

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

Определяет список пользовательских доменов верхнего уровня для добавления, где каждый элемент имеет вид `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

См. также:

* функцию [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) и варианты этой функции,
  которая принимает имя пользовательского списка TLD и возвращает часть домена, включающую поддомены верхнего уровня вплоть до первого значимого поддомена.


## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Собирать случайные выделения памяти размером не больше указанного значения с вероятностью, равной `total_memory_profiler_sample_probability`. 0 означает, что параметр отключён. Имеет смысл установить значение параметра `max_untracked_memory` равным 0, чтобы этот порог работал как ожидается.

## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Собирать случайные выделения памяти размером не меньше указанного значения с вероятностью, равной `total_memory_profiler_sample_probability`. 0 — отключено. Возможно, вам потребуется установить `max_untracked_memory` в 0, чтобы этот порог работал как ожидается.

## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />Каждый раз, когда объём потребляемой сервером памяти превышает очередной порог по числу байт, профилировщик памяти будет собирать трассировку стека выделения. Нулевое значение означает, что профилировщик памяти отключён. Значения меньше нескольких мегабайт будут замедлять работу сервера.

## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />

Позволяет собирать случайные выделения и освобождения памяти и записывать их в системную таблицу [system.trace_log](../../operations/system-tables/trace_log.md) с `trace_type`, равным `MemorySample`, с указанной вероятностью. Вероятность применяется к каждой операции выделения или освобождения памяти, независимо от размера выделения. Обратите внимание, что семплирование происходит только тогда, когда объём неотслеживаемой памяти превышает лимит неотслеживаемой памяти (значение по умолчанию — `4` MiB). Его можно уменьшить, если уменьшено значение [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step). Для более детального семплирования вы можете установить `total_memory_profiler_step` равным `1`.

Возможные значения:

- Положительное число с плавающей запятой.
- `0` — запись случайных выделений и освобождений памяти в системную таблицу `system.trace_log` отключена.

## trace&#95;log {#trace_log}

Настройки работы системной таблицы [trace&#95;log](/operations/system-tables/trace_log).

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

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики кэширования несжатых данных.

## uncompressed_cache_size {#uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер (в байтах) несжатых данных, используемых табличными движками семейства MergeTree.

Для сервера существует один общий кэш. Память выделяется по требованию. Кэш используется, если включена опция `use_uncompressed_cache`.

Несжатый кэш полезен для очень коротких запросов в некоторых случаях.

:::note
Значение `0` означает, что кэш отключен.

Эту настройку можно изменять во время работы сервера, и изменения вступают в силу немедленно.
:::

## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в несжатом кэше относительно общего размера кэша.

## url&#95;scheme&#95;mappers {#url_scheme_mappers}

Конфигурация для преобразования сокращённых или символических префиксов URL в полные URL-адреса.

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

Способ хранения заголовков частей данных в ZooKeeper. Этот параметр применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Его можно задать:

**Глобально в разделе [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует этот параметр для всех таблиц на сервере. Вы можете изменить этот параметр в любое время. Поведение существующих таблиц меняется при изменении параметра.

**Для каждой таблицы**

При создании таблицы укажите соответствующий [параметр движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этим параметром не изменится, даже если глобальный параметр будет изменён.

**Возможные значения**

- `0` — Функция отключена.
- `1` — Функция включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицируемые](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки частей данных компактно, используя один `znode`. Если таблица содержит много столбцов, этот способ хранения существенно уменьшает объём данных, хранящихся в Zookeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` вы не сможете понизить версию сервера ClickHouse до версии, которая не поддерживает этот параметр. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все серверы сразу. Безопаснее тестировать новые версии ClickHouse в тестовой среде или только на нескольких серверах кластера.

Заголовки частей данных, уже сохранённые с этим параметром, нельзя восстановить в их прежнее (некомпактное) представление.
:::

## user&#95;defined&#95;executable&#95;functions&#95;config {#user_defined_executable_functions_config}

Путь к файлу конфигурации для исполняемых пользовательских определяемых функций.

Путь:

* Укажите абсолютный путь или путь относительно файла конфигурации сервера.
* Путь может содержать подстановочные знаки * и ?.

См. также:

* &quot;[Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).&quot;.

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## user&#95;defined&#95;path {#user_defined_path}

Каталог для пользовательских файлов. Используется для пользовательских SQL-функций, см. [SQL User Defined Functions](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


## user&#95;directories {#user_directories}

Раздел конфигурационного файла, содержащий настройки:

* Путь к конфигурационному файлу с предопределёнными пользователями.
* Путь к каталогу, в котором хранятся пользователи, созданные SQL-командами.
* Путь к узлу ZooKeeper, где хранятся и реплицируются пользователи, созданные SQL-командами.

Если этот раздел задан, путь из [users&#95;config](/operations/server-configuration-parameters/settings#users_config) и [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path) использоваться не будет.

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

Пользователи, роли, политики доступа к строкам, QUOTA и профили также могут храниться в ZooKeeper:

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

Вы также можете определить секции `memory` — хранение информации только в памяти без записи на диск, и `ldap` — хранение информации на сервере LDAP.

Чтобы добавить сервер LDAP в качестве удалённого каталога пользователей, учётные записи которых не определены локально, задайте одну секцию `ldap` со следующими настройками:

| Setting  | Description                                                                                                                                                                                                                                                                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server` | одно из имён серверов LDAP, определённых в секции конфигурации `ldap_servers`. Этот параметр является обязательным и не может быть пустым.                                                                                                                                                                                                                                                          |
| `roles`  | секция со списком локально определённых ролей, которые будут назначаться каждому пользователю, полученному с сервера LDAP. Если роли не указаны, пользователь не сможет выполнять никакие действия после аутентификации. Если любая из перечисленных ролей не определена локально на момент аутентификации, попытка аутентификации завершится неудачей так, как если бы был указан неверный пароль. |

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

Каталог пользовательских файлов. Используется в табличных функциях [file()](../../sql-reference/table-functions/file.md), [fileCluster()](../../sql-reference/table-functions/fileCluster.md).

**Пример**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user&#95;scripts&#95;path {#user_scripts_path}

Каталог, содержащий файлы пользовательских скриптов. Используется для исполняемых функций, определённых пользователем [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).

**Пример**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

Тип:

Значение по умолчанию:


## users&#95;config {#users_config}

Путь к файлу с:

* Конфигурациями пользователей.
* Правами доступа.
* Профилями настроек.
* Настройками квот.

**Пример**

```xml
<users_config>users.xml</users_config>
```


## validate&#95;tcp&#95;client&#95;information {#validate_tcp_client_information}

<SettingsInfoBlock type="Bool" default_value="0" />Определяет, включена ли проверка информации о клиенте при получении пакета с запросом.

По умолчанию имеет значение `false`:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```


## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />Размер кэша индекса векторного сходства в записях. Ноль означает отключение.

## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики кэширования индекса векторного сходства.

## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />Размер кэша для индексов векторного сходства. Ноль — отключено.

:::note
Этот параметр можно изменять во время работы, и изменения вступают в силу немедленно.
:::

## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше индекса векторного сходства относительно его общего размера.

## wait&#95;dictionaries&#95;load&#95;at&#95;startup {#wait_dictionaries_load_at_startup}

<SettingsInfoBlock type="Bool" default_value="1" />

Этот параметр задаёт поведение, если `dictionaries_lazy_load` имеет значение `false`.
(Если `dictionaries_lazy_load` имеет значение `true`, этот параметр ни на что не влияет.)

Если `wait_dictionaries_load_at_startup` имеет значение `false`, сервер
начнёт загружать все словари при запуске и параллельно с этой загрузкой будет принимать подключения.
Когда словарь используется в запросе впервые, запрос будет ждать, пока словарь не загрузится, если он ещё не загружен.
Установка `wait_dictionaries_load_at_startup` в `false` может ускорить запуск ClickHouse, однако некоторые запросы могут выполняться медленнее
(потому что им придётся ждать загрузки некоторых словарей).

Если `wait_dictionaries_load_at_startup` имеет значение `true`, сервер при запуске будет ждать,
пока все словари не завершат свою загрузку (успешно или нет), прежде чем начинать принимать какие-либо подключения.

**Пример**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```


## workload&#95;path {#workload_path}

Директория, используемая для хранения всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется директория `/workload/` в рабочем каталоге сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**См. также**

* [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)


## workload&#95;zookeeper&#95;path {#workload_zookeeper_path}

Путь к узлу ZooKeeper, который используется как хранилище для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для согласованности все SQL-определения хранятся в виде значения этого единственного znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**См. также**

* [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)


## zookeeper {#zookeeper}

Содержит настройки, которые позволяют ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицируемых таблиц. Если реплицируемые таблицы не используются, этот раздел параметров можно опустить.

Следующие настройки могут быть заданы с помощью вложенных тегов:

| Setting                                    | Description                                                                                                                                                                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `node`                                     | Конечная точка ZooKeeper (endpoint). Можно задать несколько endpoint-ов. Например, `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` задаёт порядок узлов при попытке подключения к кластеру ZooKeeper. |
| `session_timeout_ms`                       | Максимальное время ожидания (тайм-аут) клиентской сессии в миллисекундах.                                                                                                                                                                  |
| `operation_timeout_ms`                     | Максимальное время ожидания (тайм-аут) одной операции в миллисекундах.                                                                                                                                                                     |
| `root` (optional)                          | Znode, который используется как корневой для znode-ов, применяемых сервером ClickHouse.                                                                                                                                                    |
| `fallback_session_lifetime.min` (optional) | Минимальное ограничение времени жизни сессии ZooKeeper с fallback-узлом, когда основной узел недоступен (балансировка нагрузки). Задаётся в секундах. Значение по умолчанию: 3 часа.                                                       |
| `fallback_session_lifetime.max` (optional) | Максимальное ограничение времени жизни сессии ZooKeeper с fallback-узлом, когда основной узел недоступен (балансировка нагрузки). Задаётся в секундах. Значение по умолчанию: 6 часов.                                                     |
| `identity` (optional)                      | Пользователь и пароль, требуемые ZooKeeper для доступа к запрашиваемым znode-ам.                                                                                                                                                           |
| `use_compression` (optional)               | Включает сжатие в протоколе Keeper, если установлено значение true.                                                                                                                                                                        |

Также есть настройка `zookeeper_load_balancing` (необязательная), которая позволяет выбрать алгоритм выбора узла ZooKeeper:

| Algorithm Name                  | Description                                                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `random`                        | случайным образом выбирает один из узлов ZooKeeper.                                                                   |
| `in_order`                      | выбирает первый узел ZooKeeper, если он недоступен — второй и так далее.                                              |
| `nearest_hostname`              | выбирает узел ZooKeeper с именем хоста, максимально похожим на имя хоста сервера; имя хоста сравнивается по префиксу. |
| `hostname_levenshtein_distance` | аналогично `nearest_hostname`, но сравнение имён хостов выполняется по метрике расстояния Левенштейна.                |
| `first_or_random`               | выбирает первый узел ZooKeeper, если он недоступен — случайным образом выбирает один из оставшихся узлов ZooKeeper.   |
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
    <!-- Optional. Chroot suffix. Should exist. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Optional. Zookeeper digest ACL string. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**См. также**

* [Репликация](../../engines/table-engines/mergetree-family/replication.md)
* [Руководство программиста ZooKeeper](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
* [Необязательное защищённое взаимодействие между ClickHouse и Zookeeper](/operations/ssl-zookeeper)


## zookeeper&#95;log {#zookeeper_log}

Настройки для системной таблицы [`zookeeper_log`](/operations/system-tables/zookeeper_log).

Следующие настройки можно задать с помощью вложенных тегов:

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
