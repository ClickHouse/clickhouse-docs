---
description: 'Этот раздел содержит описания настроек сервера, то есть настроек,
которые не могут быть изменены на уровне сеанса или запроса.'
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


# Настройки сервера \{#server-settings\}

Этот раздел содержит описания настроек сервера. Это настройки, которые
нельзя изменить на уровне сеанса или запроса.

Для получения дополнительной информации о конфигурационных файлах в ClickHouse см. раздел [«Configuration Files»](/operations/configuration-files).

Другие настройки описаны в разделе «[Settings](/operations/settings/overview)».
Перед изучением настроек рекомендуем прочитать раздел [Configuration files](/operations/configuration-files)
и обратить внимание на использование подстановок (атрибуты `incl` и `optional`).

## abort_on_logical_error \{#abort_on_logical_error\}

<SettingsInfoBlock type="Bool" default_value="0" />Аварийно останавливать сервер при исключениях LOGICAL_ERROR. Только для экспертов.

## access_control_improvements \{#access_control_improvements\}

Настройки для дополнительных необязательных улучшений в системе управления доступом.

| Setting                                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Default |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | Определяет, могут ли пользователи без разрешающих политик строк (ROW POLICY) по-прежнему читать строки с помощью запроса `SELECT`. Например, если есть два пользователя A и B, и политика строк (ROW POLICY) определена только для A, то если этот параметр равен `true`, пользователь B увидит все строки. Если этот параметр равен `false`, пользователь B не увидит ни одной строки.                                                                                                                                                                              | `true`  |
| `on_cluster_queries_require_cluster_grant`      | Определяет, требуют ли запросы `ON CLUSTER` привилегию `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `true`  |
| `select_from_system_db_requires_grant`          | Определяет, требует ли `SELECT * FROM system.<table>` каких‑либо привилегий или может выполняться любым пользователем. Если установлено значение `true`, то этот запрос требует `GRANT SELECT ON system.<table>` так же, как и для несистемных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые константные таблицы, такие как `one`, `contributors`) по‑прежнему доступны всем; а если выдана привилегия `SHOW` (например, `SHOW USERS`), то соответствующая системная таблица (то есть `system.users`) будет доступна. | `true`  |
| `select_from_information_schema_requires_grant` | Определяет, требует ли `SELECT * FROM information_schema.<table>` каких‑либо привилегий или может выполняться любым пользователем. Если установлено значение `true`, то этот запрос требует `GRANT SELECT ON information_schema.<table>` так же, как и для обычных таблиц.                                                                                                                                                                                                                                                                                           | `true`  |
| `settings_constraints_replace_previous`         | Определяет, будет ли ограничение в профиле настроек для некоторой настройки отменять действие предыдущего ограничения (определённого в других профилях) для этой настройки, включая поля, которые не заданы новым ограничением. Также включает тип ограничения `changeable_in_readonly`.                                                                                                                                                                                                                                                                             | `true`  |
| `table_engines_require_grant`                   | Определяет, требуется ли привилегия для создания таблицы с определённым движком таблицы.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `false` |
| `role_cache_expiration_time_seconds`            | Задаёт количество секунд с момента последнего обращения, в течение которых роль хранится в кэше ролей (Role Cache).                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `600`   |

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


## access_control_path \{#access_control_path\}

Путь к каталогу, в котором сервер ClickHouse хранит конфигурации пользователей и ролей, созданные SQL-командами.

**См. также**

- [Управление доступом и учетными записями](/operations/access-rights#access-control-usage)

## aggregate_function_group_array_action_when_limit_is_reached \{#aggregate_function_group_array_action_when_limit_is_reached\}

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />Действие, выполняемое при превышении максимального размера элемента массива в groupArray: сгенерировать исключение (`throw`) или отбросить (`discard`) лишние значения

## aggregate_function_group_array_max_element_size \{#aggregate_function_group_array_max_element_size\}

<SettingsInfoBlock type="UInt64" default_value="16777215" />Максимальный размер элемента массива в байтах для функции groupArray. Этот лимит проверяется при сериализации и позволяет избежать чрезмерного размера состояния.

## allow_feature_tier \{#allow_feature_tier\}

<SettingsInfoBlock type="UInt32" default_value="0" />

Определяет, может ли пользователь изменять настройки, связанные с различными уровнями функциональности (feature tiers).

- `0` - Разрешены изменения любых настроек (experimental, beta, production).
- `1` - Разрешены только изменения настроек уровней beta и production. Изменения настроек уровня experimental отклоняются.
- `2` - Разрешены только изменения настроек уровня production. Изменения настроек уровней experimental или beta отклоняются.

Это эквивалентно заданию ограничения readonly на все функции `EXPERIMENTAL` / `BETA`.

:::note
Значение `0` означает, что можно изменять все настройки.
:::

## allow_impersonate_user \{#allow_impersonate_user\}

<SettingsInfoBlock type="Bool" default_value="0" />Включает или отключает использование функции IMPERSONATE (EXECUTE AS target_user).

## allow_implicit_no_password \{#allow_implicit_no_password\}

Запрещает создавать пользователя без пароля, если только явно не указано &#39;IDENTIFIED WITH no&#95;password&#39;.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## allow_no_password \{#allow_no_password\}

Определяет, разрешено ли использование небезопасного типа пароля `no_password`.

```xml
<allow_no_password>1</allow_no_password>
```


## allow_plaintext_password \{#allow_plaintext_password\}

Определяет, разрешено ли использование небезопасных типов паролей в открытом виде (plaintext).

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_use_jemalloc_memory \{#allow_use_jemalloc_memory\}

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает использование памяти jemalloc.

## allowed_disks_for_table_engines \{#allowed_disks_for_table_engines\}

Список дисков, которые могут использоваться с Iceberg

## async_insert_queue_flush_on_shutdown \{#async_insert_queue_flush_on_shutdown\}

<SettingsInfoBlock type="Bool" default_value="1" />Если включено, очередь асинхронных вставок принудительно обрабатывается при корректном завершении работы сервера

## async_insert_threads \{#async_insert_threads\}

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков для непосредственного разбора и вставки данных в фоновом режиме. Ноль означает, что асинхронный режим отключен.

## async_load_databases \{#async_load_databases\}

<SettingsInfoBlock type="Bool" default_value="1" />

Асинхронная загрузка баз данных и таблиц.

* Если `true`, все несистемные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружаться асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, а также настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который попытается обратиться к таблице, которая ещё не загружена, будет ждать запуска именно этой таблицы. Если задание загрузки завершится неуспешно, запрос пробросит ошибку (вместо остановки всего сервера в случае `async_load_databases = false`). Таблица, которую ожидает хотя бы один запрос, будет загружаться с более высоким приоритетом. DDL-запросы к базе данных будут ждать запуска именно этой базы данных. Также рассмотрите установку лимита `max_waiting_queries` на общее количество ожидающих запросов.
* Если `false`, все базы данных загружаются при старте сервера.

**Пример**

```xml
<async_load_databases>true</async_load_databases>
```


## async_load_system_database \{#async_load_system_database\}

<SettingsInfoBlock type="Bool" default_value="0" />

Асинхронная загрузка системных таблиц. Полезно, если в базе данных `system` много таблиц журналов и частей. Не зависит от настройки `async_load_databases`.

* Если установлено значение `true`, все системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружаться асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, а также серверные настройки `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который попытается обратиться к ещё не загруженной системной таблице, будет ожидать запуска именно этой таблицы. Таблица, которую ожидает хотя бы один запрос, будет загружаться с более высоким приоритетом. Также рассмотрите возможность настройки параметра `max_waiting_queries` для ограничения общего числа ожидающих запросов.
* Если установлено значение `false`, системная база данных загружается до запуска сервера.

**Пример**

```xml
<async_load_system_database>true</async_load_system_database>
```


## asynchronous_heavy_metrics_update_period_s \{#asynchronous_heavy_metrics_update_period_s\}

<SettingsInfoBlock type="UInt32" default_value="120" />Интервал (в секундах) обновления тяжёлых асинхронных метрик.

## asynchronous_insert_log \{#asynchronous_insert_log\}

Настройки системной таблицы [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log) для ведения журнала асинхронных вставок.

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


## asynchronous_metric_log \{#asynchronous_metric_log\}

По умолчанию включено в развертываниях ClickHouse Cloud.

Если параметр по умолчанию не включен в вашей среде, в зависимости от того, как был установлен ClickHouse, вы можете воспользоваться приведённой ниже инструкцией, чтобы включить или отключить его.

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

Чтобы отключить настройку `asynchronous_metric_log`, создайте файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержимым:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />


## asynchronous_metrics_enable_heavy_metrics \{#asynchronous_metrics_enable_heavy_metrics\}

<SettingsInfoBlock type="Bool" default_value="0" />Включает вычисление ресурсоёмких асинхронных метрик.

## asynchronous_metrics_keeper_metrics_only \{#asynchronous_metrics_keeper_metrics_only\}

<SettingsInfoBlock type="Bool" default_value="0" />Ограничивает вычисление асинхронных метрик только метриками, относящимися к Keeper.

## asynchronous_metrics_update_period_s \{#asynchronous_metrics_update_period_s\}

<SettingsInfoBlock type="UInt32" default_value="1" />Период обновления асинхронных метрик в секундах.

## auth_use_forwarded_address \{#auth_use_forwarded_address\}

Использовать исходный IP-адрес клиента для аутентификации при подключении через прокси.

:::note
Этот параметр следует использовать с особой осторожностью, поскольку пересылаемые адреса легко подделать. Серверы, принимающие такую аутентификацию, не должны быть доступны напрямую, а только через доверенный прокси.
:::

## background_buffer_flush_schedule_pool_size \{#background_buffer_flush_schedule_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которое будет использоваться для выполнения операций фонового сброса данных для таблиц движка [Buffer](/engines/table-engines/special/buffer).

## background_common_pool_size \{#background_common_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="8" />Максимальное количество потоков, которые будут использоваться для выполнения различных операций (в основном для сборки мусора) над таблицами движка [*MergeTree](/engines/table-engines/mergetree-family) в фоновом режиме.

## background_distributed_schedule_pool_size \{#background_distributed_schedule_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которое будет использовано для выполнения распределённых отправок.

## background_fetches_pool_size \{#background_fetches_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которое будет использоваться для загрузки частей данных с другой реплики для таблиц [*MergeTree-engine](/engines/table-engines/mergetree-family) в фоновом режиме.

## background_merges_mutations_concurrency_ratio \{#background_merges_mutations_concurrency_ratio\}

<SettingsInfoBlock type="Float" default_value="2" />

Задает соотношение между количеством потоков и количеством фоновых слияний и мутаций, которые могут выполняться параллельно.

Например, если коэффициент равен 2 и [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) установлен в значение 16, то ClickHouse может выполнять 32 фоновых слияния одновременно. Это возможно, потому что фоновые операции могут быть приостановлены и отложены. Это необходимо, чтобы дать небольшим слияниям более высокий приоритет на выполнение.

:::note
Во время работы сервера вы можете только увеличивать это соотношение. Чтобы его уменьшить, необходимо перезапустить сервер.

Как и параметр [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size), настройка [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) может быть задана в профиле `default` для обеспечения обратной совместимости.
:::

## background_merges_mutations_scheduling_policy \{#background_merges_mutations_scheduling_policy\}

<SettingsInfoBlock type="String" default_value="round_robin" />

Политика планирования фоновых слияний и мутаций. Возможные значения: `round_robin` и `shortest_task_first`.

Алгоритм, используемый для выбора следующего слияния или мутации, которые будут выполнены пулом фоновых потоков. Политика может быть изменена во время работы сервера без его перезапуска.
Может быть применена из профиля `default` для обеспечения обратной совместимости.

Возможные значения:

- `round_robin` — Каждое одновременно выполняющееся слияние и мутация выполняются в порядке round-robin, чтобы избежать голодания по ресурсам. Меньшие слияния завершаются быстрее, чем большие, просто потому что у них меньше блоков для слияния.
- `shortest_task_first` — Всегда выполнять меньшее слияние или мутацию. Слияниям и мутациям назначаются приоритеты на основе их результирующего размера. Слияния с меньшим размером строго предпочитаются большим. Эта политика обеспечивает максимально быстрое слияние маленьких частей, но может привести к бесконечному голоданию больших слияний в партициях, сильно перегруженных `INSERT`-ами.

## background_message_broker_schedule_pool_size \{#background_message_broker_schedule_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное число потоков, используемых для выполнения фоновых операций потоковой передачи сообщений.

## background_move_pool_size \{#background_move_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="8" />Максимальное число потоков, используемых для перемещения частей данных на другой диск или том в фоновом режиме для таблиц на движке *MergeTree.

## background_pool_size \{#background_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />

Задаёт количество потоков, выполняющих фоновые слияния и мутации для таблиц с движками MergeTree.

:::note

* Этот параметр также может быть задан при запуске сервера из конфигурации профиля `default` для обеспечения обратной совместимости при старте сервера ClickHouse.
* Во время работы сервера можно только увеличить количество потоков.
* Чтобы уменьшить количество потоков, необходимо перезапустить сервер.
* Настраивая этот параметр, вы управляете нагрузкой на CPU и диск.
  :::

:::danger
Меньший размер пула потребляет меньше ресурсов CPU и диска, но фоновые операции выполняются медленнее, что в конечном итоге может повлиять на производительность запросов.
:::

Перед изменением этого параметра также ознакомьтесь со связанными настройками MergeTree, такими как:

* [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
* [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).
* [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**Пример**

```xml
<background_pool_size>16</background_pool_size>
```


## background_schedule_pool_log \{#background_schedule_pool_log\}

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


## background_schedule_pool_max_parallel_tasks_per_type_ratio \{#background_schedule_pool_max_parallel_tasks_per_type_ratio\}

<SettingsInfoBlock type="Float" default_value="0.8" />Максимальная доля потоков пула, которые могут одновременно выполнять задачи одного типа.

## background_schedule_pool_size \{#background_schedule_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="512" />Максимальное количество потоков, которое будет использоваться для постоянного выполнения легковесных периодических операций для реплицируемых таблиц, потоковой обработки данных из Kafka и обновления DNS-кэша.

## backup_log \{#backup_log\}

Настройки системной таблицы [backup&#95;log](../../operations/system-tables/backup_log.md), используемой для журналирования операций `BACKUP` и `RESTORE`.

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


## backup_threads \{#backup_threads\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />Максимальное число потоков, используемых для выполнения запросов `BACKUP`.

## backups \{#backups\}

Настройки резервного копирования, используемые при выполнении команд [`BACKUP` и `RESTORE`](/operations/backup/overview).

Следующие параметры могут быть заданы в подтегах:

{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','Определяет, могут ли несколько операций резервного копирования выполняться параллельно на одном хосте.', 'true'),
    ('allow_concurrent_restores', 'Bool', 'Определяет, могут ли несколько операций восстановления выполняться параллельно на одном хосте.', 'true'),
    ('allowed_disk', 'String', 'Диск для резервного копирования при использовании `File()`. Эта настройка должна быть задана, чтобы использовать `File`.', ''),
    ('allowed_path', 'String', 'Путь для резервного копирования при использовании `File()`. Эта настройка должна быть задана, чтобы использовать `File`.', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', 'Количество попыток собрать метаданные перед переходом в режим ожидания при обнаружении несогласованности после сравнения собранных метаданных.', '2'),
    ('collect_metadata_timeout', 'UInt64', 'Таймаут в миллисекундах на сбор метаданных во время резервного копирования.', '600000'),
    ('compare_collected_metadata', 'Bool', 'Если значение true, сравнивает собранные метаданные с существующими, чтобы убедиться, что они не изменились во время резервного копирования.', 'true'),
    ('create_table_timeout', 'UInt64', 'Таймаут в миллисекундах на создание таблиц во время восстановления.', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', 'Максимальное количество попыток повтора после ошибки неверной версии при координированном резервном копировании/восстановлении.', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Максимальное время ожидания в миллисекундах перед следующей попыткой собрать метаданные.', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Минимальное время ожидания в миллисекундах перед следующей попыткой собрать метаданные.', '5000'),
    ('remove_backup_files_after_failure', 'Bool', 'Если команда `BACKUP` завершается ошибкой, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до сбоя, в противном случае оставит скопированные файлы как есть.', 'true'),
    ('sync_period_ms', 'UInt64', 'Период синхронизации в миллисекундах для координированного резервного копирования/восстановления.', '5000'),
    ('test_inject_sleep', 'Bool', 'Пауза, используемая при тестировании', 'false'),
    ('test_randomize_order', 'Bool', 'Если значение true, случайным образом изменяет порядок некоторых операций в целях тестирования.', 'false'),
    ('zookeeper_path', 'String', 'Путь в ZooKeeper, где хранятся метаданные резервного копирования и восстановления при использовании предложения `ON CLUSTER`.', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }


| Setting                                             | Type   | Description                                                                                                                                                                                         | Default               |
| :-------------------------------------------------- | :----- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | Определяет, могут ли несколько операций резервного копирования выполняться одновременно на одном и том же хосте.                                                                                    | `true`                |
| `allow_concurrent_restores`                         | Bool   | Определяет, могут ли несколько операций восстановления выполняться одновременно на одном и том же хосте.                                                                                            | `true`                |
| `allowed_disk`                                      | String | Диск, на который выполняется резервное копирование при использовании `File()`. Этот параметр должен быть установлен для использования `File`.                                                       | ``                    |
| `allowed_path`                                      | String | Путь, по которому выполняется резервное копирование при использовании `File()`. Этот параметр должен быть установлен для использования `File`.                                                      | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | Количество попыток собрать метаданные перед переходом в режим ожидания в случае несогласованности после сравнения собранных метаданных.                                                             | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | Таймаут в миллисекундах для сбора метаданных во время резервного копирования.                                                                                                                       | `600000`              |
| `compare_collected_metadata`                        | Bool   | Если `true`, сравнивает собранные метаданные с существующими метаданными, чтобы убедиться, что они не изменяются во время резервного копирования.                                                   | `true`                |
| `create_table_timeout`                              | UInt64 | Таймаут в миллисекундах для создания таблиц во время операции восстановления.                                                                                                                       | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | Максимальное количество попыток повторного выполнения после возникновения ошибки неверной версии во время координированного резервного копирования/восстановления.                                  | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | Максимальное время ожидания в миллисекундах перед следующей попыткой собрать метаданные.                                                                                                            | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | Минимальное время ожидания в миллисекундах перед следующей попыткой собрать метаданные.                                                                                                             | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | Если команда `BACKUP` завершится с ошибкой, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до сбоя, в противном случае скопированные файлы будут оставлены без изменений. | `true`                |
| `sync_period_ms`                                    | UInt64 | Период синхронизации в миллисекундах для координированного резервного копирования/восстановления.                                                                                                   | `5000`                |
| `test_inject_sleep`                                 | Bool   | Тестовая задержка (sleep).                                                                                                                                                                          | `false`               |
| `test_randomize_order`                              | Bool   | Если `true`, случайным образом меняет порядок определённых операций в целях тестирования.                                                                                                           | `false`               |
| `zookeeper_path`                                    | String | Путь в ZooKeeper, где хранятся метаданные резервного копирования и восстановления при использовании выражения `ON CLUSTER`.                                                                         | `/clickhouse/backups` |

По умолчанию этот параметр настроен следующим образом:

```xml
<backups>
    ....
</backups>
```


## backups_io_thread_pool_queue_size \{#backups_io_thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество задач, которые могут ожидать выполнения в пуле потоков ввода-вывода резервного копирования (Backups IO Thread pool). Рекомендуется оставлять эту очередь неограниченной из-за текущей логики резервного копирования в S3.

:::note
Значение `0` (по умолчанию) означает, что очередь не ограничена.
:::

## bcrypt_workfactor \{#bcrypt_workfactor\}

Коэффициент сложности для типа аутентификации `bcrypt_password`, который использует [алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).
Этот коэффициент определяет объём вычислений и время, необходимые для вычисления хеша и проверки пароля.

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
Для приложений с частой аутентификацией
рассмотрите альтернативные методы аутентификации из-за
вычислительных издержек bcrypt при более высоких значениях фактора сложности.
:::


## blob_storage_log \{#blob_storage_log\}

Параметры системной таблицы [`blob_storage_log`](../system-tables/blob_storage_log.md).

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


## builtin_dictionaries_reload_interval \{#builtin_dictionaries_reload_interval\}

Интервал в секундах между перезагрузками встроенных словарей.

ClickHouse перезагружает встроенные словари каждые x секунд. Это позволяет редактировать словари «на лету» без перезапуска сервера.

**Пример**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


## cache_size_to_ram_max_ratio \{#cache_size_to_ram_max_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />Задает максимальное соотношение размера кеша к объему оперативной памяти (RAM). Позволяет уменьшить размер кеша на системах с небольшим объемом памяти.

## cannot_allocate_thread_fault_injection_probability \{#cannot_allocate_thread_fault_injection_probability\}

<SettingsInfoBlock type="Double" default_value="0" />Для тестирования.

## cgroups_memory_usage_observer_wait_time \{#cgroups_memory_usage_observer_wait_time\}

<SettingsInfoBlock type="UInt64" default_value="15" />

Интервал в секундах, в течение которого максимальное допустимое потребление памяти сервером корректируется соответствующим пороговым значением в cgroups.

Чтобы отключить наблюдатель cgroups, установите это значение в `0`.

## compiled_expression_cache_elements_size \{#compiled_expression_cache_elements_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />Устанавливает размер кэша (в элементах) для [скомпилированных выражений](../../operations/caches.md).

## compiled_expression_cache_size \{#compiled_expression_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="134217728" />Задает размер кэша (в байтах) для [скомпилированных выражений](../../operations/caches.md).

## compression \{#compression\}

Настройки сжатия данных для таблиц с движком [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

:::note
Рекомендуем не изменять эти настройки, если вы только начали использовать ClickHouse.
:::

**Пример конфигурации**:

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
Если ни одно условие для части данных не выполнено, ClickHouse использует сжатие `lz4`.
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


## concurrent_threads_scheduler \{#concurrent_threads_scheduler\}

<SettingsInfoBlock type="String" default_value="fair_round_robin" />

Политика планирования слотов CPU, определённых `concurrent_threads_soft_limit_num` и `concurrent_threads_soft_limit_ratio_to_cores`. Алгоритм, определяющий, как ограниченное количество слотов CPU распределяется между конкурирующими запросами. Планировщик можно изменить во время работы без перезапуска сервера.

Возможные значения:

- `round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads` слотов CPU. Один слот на поток. При конкуренции слоты CPU выдаются запросам по круговому принципу (round-robin). Обратите внимание, что первый слот выделяется безусловно, что может приводить к несправедливости и увеличению задержки запросов с большим значением `max_threads` при наличии большого количества запросов с `max_threads` = 1.
- `fair_round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads - 1` слотов CPU. Вариант `round_robin`, не требующий слот CPU для первого потока каждого запроса. Таким образом, запросы с `max_threads` = 1 не требуют ни одного слота и не могут несправедливо занять все слоты. Слоты не выделяются безусловно.

## concurrent_threads_soft_limit_num \{#concurrent_threads_soft_limit_num\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество потоков обработки запросов, за исключением потоков для получения данных с удалённых серверов, которые могут одновременно выполняться всеми запросами. Это не жёсткое ограничение. Если лимит достигнут, запрос всё равно получит как минимум один поток для выполнения. Во время выполнения запрос может масштабироваться до нужного числа потоков, если становится доступно больше потоков.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничения.
:::

## concurrent_threads_soft_limit_ratio_to_cores \{#concurrent_threads_soft_limit_ratio_to_cores\}

<SettingsInfoBlock type="UInt64" default_value="0" />То же, что и [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num), но задаётся как отношение к числу ядер.

## файл конфигурации \{#config-file\}

<SettingsInfoBlock type="String" default_value="config.xml" />Путь к конфигурационному файлу сервера.

## config_reload_interval_ms \{#config_reload_interval_ms\}

<SettingsInfoBlock type="UInt64" default_value="2000" />

Как часто ClickHouse будет перечитывать конфигурацию и проверять наличие новых изменений.

## core_dump \{#core_dump\}

Устанавливает мягкий лимит на размер файла дампа памяти (core dump).

:::note
Жёсткий лимит задаётся средствами операционной системы
:::

**Пример**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```


## cpu_slot_preemption \{#cpu_slot_preemption\}

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, как осуществляется планирование нагрузки для ресурсов CPU (MASTER THREAD и WORKER THREAD).

* Если `true` (рекомендуется), учет ведется на основе фактически потребленного CPU-времени. Конкурирующим нагрузкам выделяется справедливая доля CPU-времени. Слоты выделяются на ограниченный период и повторно запрашиваются после его истечения. Запрос слота может блокировать выполнение потока в случае перегрузки по ресурсам CPU, т.е. может происходить вытеснение (preemption). Это обеспечивает справедливое распределение CPU-времени.
* Если `false` (значение по умолчанию), учет ведется на основе количества выделенных CPU-слотов. Конкурирующим нагрузкам выделяется справедливое количество CPU-слотов. Слот выделяется при запуске потока, удерживается непрерывно и освобождается при завершении выполнения потока. Количество потоков, выделенных для выполнения запроса, может только увеличиваться от 1 до `max_threads` и никогда не уменьшаться. Это более благоприятно для долго работающих запросов и может приводить к голоданию коротких запросов по CPU.

**Пример**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**См. также**

* [Планирование рабочих нагрузок](/operations/workload-scheduling.md)


## cpu_slot_preemption_timeout_ms \{#cpu_slot_preemption_timeout_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Определяет, сколько миллисекунд рабочий поток может ждать во время вытеснения, то есть пока не будет выделен другой CPU-слот. По истечении этого таймаута, если потоку не удалось получить новый CPU-слот, он завершится, а запрос будет динамически масштабирован до меньшего числа одновременно выполняющихся потоков. Обратите внимание, что главный поток никогда не масштабируется вниз, но может вытесняться бесконечно долго. Имеет смысл только когда `cpu_slot_preemption` включён и CPU-ресурс определён для WORKER THREAD.

**Пример**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**См. также**

* [Планирование рабочих нагрузок](/operations/workload-scheduling.md)


## cpu_slot_quantum_ns \{#cpu_slot_quantum_ns\}

<SettingsInfoBlock type="UInt64" default_value="10000000" />

Определяет, сколько наносекунд CPU поток может потребить после получения слота CPU и до того, как ему необходимо запросить следующий слот CPU. Имеет смысл только в случае, если `cpu_slot_preemption` включён и ресурс CPU определён для MASTER THREAD или WORKER THREAD.

**Пример**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**См. также**

* [Планирование рабочих нагрузок](/operations/workload-scheduling.md)


## crash_log \{#crash_log\}

Настройки для работы системной таблицы [crash&#95;log](../../operations/system-tables/crash_log.md).

Следующие настройки можно задать с помощью подтегов:

| Setting                            | Description                                                                                                                                                     | Default             | Note                                                                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `database`                         | Имя базы данных.                                                                                                                                                |                     |                                                                                                                                   |
| `table`                            | Имя системной таблицы.                                                                                                                                          |                     |                                                                                                                                   |
| `engine`                           | [Определение движка MergeTree](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table) для системной таблицы.                |                     | Не может использоваться, если заданы `partition_by` или `order_by`. Если не указан, по умолчанию выбирается `MergeTree`.          |
| `partition_by`                     | [Пользовательский ключ партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key.md) для системной таблицы.                            |                     | Если `engine` указан для системной таблицы, параметр `partition_by` должен быть указан непосредственно внутри &#39;engine&#39;.   |
| `ttl`                              | Задает для таблицы [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl).                                                         |                     | Если `engine` указан для системной таблицы, параметр `ttl` должен быть указан непосредственно внутри &#39;engine&#39;.            |
| `order_by`                         | [Пользовательский ключ сортировки](/engines/table-engines/mergetree-family/mergetree#order_by) для системной таблицы. Нельзя использовать, если задан `engine`. |                     | Если `engine` указан для системной таблицы, параметр `order_by` должен быть указан непосредственно внутри &#39;engine&#39;.       |
| `storage_policy`                   | Имя политики хранения, используемой для таблицы (необязательно).                                                                                                |                     | Если `engine` указан для системной таблицы, параметр `storage_policy` должен быть указан непосредственно внутри &#39;engine&#39;. |
| `settings`                         | [Дополнительные параметры](/engines/table-engines/mergetree-family/mergetree/#settings), управляющие поведением MergeTree (необязательно).                      |                     | Если `engine` указан для системной таблицы, параметр `settings` должен быть указан непосредственно внутри &#39;engine&#39;.       |
| `flush_interval_milliseconds`      | Интервал сброса данных из буфера в памяти в таблицу.                                                                                                            | `7500`              |                                                                                                                                   |
| `max_size_rows`                    | Максимальный размер журнала в строках. Когда количество несброшенных логов достигает `max_size_rows`, логи сбрасываются на диск.                                | `1024`              |                                                                                                                                   |
| `reserved_size_rows`               | Предварительно выделенный объем памяти в строках для логов.                                                                                                     | `1024`              |                                                                                                                                   |
| `buffer_size_rows_flush_threshold` | Порог по количеству строк. При достижении порога в фоновом режиме запускается сброс логов на диск.                                                              | `max_size_rows / 2` |                                                                                                                                   |
| `flush_on_crash`                   | Определяет, нужно ли сбрасывать логи на диск в случае аварийного завершения работы.                                                                             | `false`             |                                                                                                                                   |

Конфигурационный файл сервера по умолчанию `config.xml` содержит следующий раздел настроек:

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


## custom_cached_disks_base_directory \{#custom_cached_disks_base_directory\}

Этот параметр задает путь к кэшу для пользовательских (созданных из SQL) кэшируемых дисков.
`custom_cached_disks_base_directory` имеет более высокий приоритет для пользовательских дисков по сравнению с `filesystem_caches_path` (задано в `filesystem_caches_path.xml`),
который используется, если первый отсутствует.
Путь к файловому кэшу должен лежать внутри этого каталога,
в противном случае будет выброшено исключение, не позволяющее создать диск.

:::note
Это не повлияет на диски, созданные в более старой версии, до обновления сервера.
В этом случае исключение выброшено не будет, чтобы сервер смог успешно запуститься.
:::

Пример:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```


## custom_settings_prefixes \{#custom_settings_prefixes\}

Список префиксов для [пользовательских настроек](/operations/settings/query-level#custom_settings). Префиксы должны быть разделены запятыми.

**Пример**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**См. также**

* [Пользовательские настройки](/operations/settings/query-level#custom_settings)


## database_atomic_delay_before_drop_table_sec \{#database_atomic_delay_before_drop_table_sec\}

<SettingsInfoBlock type="UInt64" default_value="480" />

Задержка, в течение которой удалённую таблицу можно восстановить с помощью команды [`UNDROP`](/sql-reference/statements/undrop.md). Если команда `DROP TABLE` выполнялась с модификатором `SYNC`, эта настройка игнорируется.
Значение по умолчанию для этой настройки — `480` (8 минут).

## database_catalog_drop_error_cooldown_sec \{#database_catalog_drop_error_cooldown_sec\}

<SettingsInfoBlock type="UInt64" default_value="5" />В случае неудачной попытки удалить таблицу ClickHouse будет ждать в течение этого тайм-аута, прежде чем повторить операцию.

## database_catalog_drop_table_concurrency \{#database_catalog_drop_table_concurrency\}

<SettingsInfoBlock type="UInt64" default_value="16" />Размер пула потоков, используемого при удалении таблиц.

## database_catalog_unused_dir_cleanup_period_sec \{#database_catalog_unused_dir_cleanup_period_sec\}

<SettingsInfoBlock type="UInt64" default_value="86400" />

Параметр задачи, которая удаляет ненужные данные из директории `store/`.
Задает периодичность выполнения этой задачи.

:::note
Значение `0` означает «никогда». Значение по умолчанию соответствует одним суткам.
:::

## database_catalog_unused_dir_hide_timeout_sec \{#database_catalog_unused_dir_hide_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="3600" />

Параметр задачи, которая удаляет «мусор» из директории `store/`.
Если какой-либо подкаталог не используется clickhouse-server и этот каталог не изменялся в течение последних
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) секунд, задача «спрячет» этот каталог,
удалив все права доступа к нему. Это также применяется к каталогам, которые clickhouse-server не
ожидает увидеть внутри `store/`.

:::note
Значение `0` означает «немедленно».
:::

## database_catalog_unused_dir_rm_timeout_sec \{#database_catalog_unused_dir_rm_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="2592000" />

Параметр задачи, которая очищает мусор из каталога `store/`.
Если какой-либо подкаталог не используется сервером ClickHouse и ранее был «спрятан»
(см. [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec)),
и этот каталог не изменялся в течение последних
[`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) секунд, задача удалит этот каталог.
Это также относится к каталогам, которые сервер ClickHouse не
ожидает увидеть внутри `store/`.

:::note
Значение `0` означает «никогда». Значение по умолчанию соответствует 30 дням.
:::

## database_replicated_allow_detach_permanently \{#database_replicated_allow_detach_permanently\}

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает постоянное отсоединение таблиц в базах данных Replicated

## database_replicated_drop_broken_tables \{#database_replicated_drop_broken_tables\}

<SettingsInfoBlock type="Bool" default_value="0" />Удалять неожиданные таблицы из баз данных Replicated вместо перемещения их в отдельную локальную базу данных

## dead_letter_queue \{#dead_letter_queue\}

Параметр для системной таблицы &#39;dead&#95;letter&#95;queue&#39;.

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


## default_database \{#default_database\}

<SettingsInfoBlock type="String" default_value="default" />Имя базы данных по умолчанию.

## default_password_type \{#default_password_type\}

Устанавливает тип пароля, который будет использоваться по умолчанию в запросах вида `CREATE USER u IDENTIFIED BY 'p'`.

Допустимые значения:

* `plaintext_password`
* `sha256_password`
* `double_sha1_password`
* `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```


## default_profile \{#default_profile\}

Профиль настроек по умолчанию. Профили настроек находятся в файле, заданном в параметре `user_config`.

**Пример**

```xml
<default_profile>default</default_profile>
```


## default_replica_name \{#default_replica_name\}

<SettingsInfoBlock type="String" default_value="{replica}" />

Имя реплики в ZooKeeper.

**Пример**

```xml
<default_replica_name>{replica}</default_replica_name>
```


## default_replica_path \{#default_replica_path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/tables/{uuid}/{shard}" />

Путь к таблице в ZooKeeper.

**Пример**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```


## default_session_timeout \{#default_session_timeout\}

Таймаут сеанса по умолчанию в секундах.

```xml
<default_session_timeout>60</default_session_timeout>
```


## dictionaries_config \{#dictionaries_config\}

Путь к конфигурационному файлу словарей.

Путь:

* Укажите абсолютный путь или путь относительно файла конфигурации сервера.
* Путь может содержать подстановочные символы * и ?.

См. также:

* &quot;[Словари](../../sql-reference/dictionaries/index.md)&quot;.

**Пример**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```


## dictionaries_lazy_load \{#dictionaries_lazy_load\}

<SettingsInfoBlock type="Bool" default_value="1" />

Ленивая загрузка словарей.

* Если `true`, то каждый словарь загружается при первом использовании. Если загрузка завершилась неудачно, функция, использовавшая словарь, выбрасывает исключение.
* Если `false`, то сервер загружает все словари при запуске.

:::note
При запуске сервер будет ждать полной загрузки всех словарей, прежде чем принимать какие-либо подключения
(исключение: если параметр [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) имеет значение `false`).
:::

**Пример**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```


## dictionaries_lib_path \{#dictionaries_lib_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/dictionaries_lib/" />

Каталог с библиотеками словарей.

**Пример**

```xml
<dictionaries_lib_path>/var/lib/clickhouse/dictionaries_lib/</dictionaries_lib_path>
```


## dictionary_background_reconnect_interval \{#dictionary_background_reconnect_interval\}

<SettingsInfoBlock type="UInt64" default_value="1000" />Интервал в миллисекундах между попытками повторного подключения словарей MySQL и Postgres с включённым `background_reconnect` после сбоя.

## disable_insertion_and_mutation \{#disable_insertion_and_mutation\}

<SettingsInfoBlock type="Bool" default_value="0" />

Отключает запросы INSERT/ALTER/DELETE. Этот параметр включают, если требуются узлы только для чтения, чтобы операции вставки и модификации не влияли на производительность чтения. Вставки во внешние движки (S3, DataLake, MySQL, PostgreSQL, Kafka и т. д.) разрешены независимо от этого параметра.

## disable_internal_dns_cache \{#disable_internal_dns_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />Отключает внутренний DNS-кэш. Рекомендуется при эксплуатации ClickHouse в средах с часто меняющейся инфраструктурой, например Kubernetes.

## disable_tunneling_for_https_requests_over_http_proxy \{#disable_tunneling_for_https_requests_over_http_proxy\}

По умолчанию для выполнения `HTTPS`-запросов через `HTTP`-прокси используется туннелирование (т.е. `HTTP CONNECT`). Этот параметр можно использовать для его отключения.

**no&#95;proxy**

По умолчанию все запросы проходят через прокси. Чтобы отключить его для отдельных хостов, необходимо установить переменную `no_proxy`.
Её можно задать внутри секции `<proxy>` для list и remote resolvers, а также в виде переменной окружения для environment resolver.
Поддерживаются IP-адреса, домены, поддомены и подстановочный символ `'*'` для полного обхода прокси. Ведущие точки отбрасываются так же, как это делает curl.

**Пример**

Ниже приведена конфигурация, которая обходит прокси для запросов к `clickhouse.cloud` и ко всем её поддоменам (например, `auth.clickhouse.cloud`).
То же самое относится к GitLab, даже несмотря на ведущую точку. И `gitlab.com`, и `about.gitlab.com` будут обходить прокси.

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


## disk_connections_hard_limit \{#disk_connections_hard_limit\}

<SettingsInfoBlock type="UInt64" default_value="200000" />При попытке создания, когда этот лимит достигнут, выбрасывается исключение. Установите 0, чтобы отключить жесткое ограничение. Лимит применяется к подключениям к дискам.

## disk_connections_soft_limit \{#disk_connections_soft_limit\}

<SettingsInfoBlock type="UInt64" default_value="5000" />Соединения сверх этого лимита имеют значительно меньший срок жизни. Лимит применяется к подключениям к дискам.

## disk_connections_store_limit \{#disk_connections_store_limit\}

<SettingsInfoBlock type="UInt64" default_value="10000" />Подключения сверх этого лимита очищаются после использования. Установите 0, чтобы отключить кэш подключений. Лимит применяется к соединениям с дисками.

## disk_connections_warn_limit \{#disk_connections_warn_limit\}

<SettingsInfoBlock type="UInt64" default_value="8000" />Предупреждающие сообщения записываются в журналы, если количество активных соединений превышает этот предел. Предел применяется к соединениям с дисками.

## display_secrets_in_show_and_select \{#display_secrets_in_show_and_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает отображение секретных значений в запросах `SHOW` и `SELECT` для таблиц, баз данных, табличных функций и словарей.

Пользователь, который хочет видеть секреты, также должен включить
настройку формата [`format_display_secrets_in_show_and_select`](../settings/formats#format_display_secrets_in_show_and_select)
и иметь право
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Возможные значения:

- `0` — Отключено.
- `1` — Включено.

## distributed_cache_apply_throttling_settings_from_client \{#distributed_cache_apply_throttling_settings_from_client\}

<SettingsInfoBlock type="Bool" default_value="1" />Определяет, следует ли серверу кэша применять настройки ограничения (throttling), полученные от клиента.

## distributed_cache_keep_up_free_connections_ratio \{#distributed_cache_keep_up_free_connections_ratio\}

<SettingsInfoBlock type="Float" default_value="0.1" />Мягкое ограничение на количество активных подключений, которые распределённый кэш подключений будет пытаться поддерживать свободными. Когда число свободных подключений опускается ниже distributed_cache_keep_up_free_connections_ratio * max_connections, подключения с самой давней активностью будут закрываться до тех пор, пока число не превысит этот порог.

## distributed_ddl \{#distributed_ddl\}

Управляет выполнением [распределённых DDL-запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) на кластере.
Работает только при включённом [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper).

Настраиваемые параметры внутри `<distributed_ddl>` включают:

| Setting                | Description                                                                                                                                    | Default Value                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `path`                 | путь в Keeper для `task_queue` с DDL-запросами                                                                                                 |                                        |
| `profile`              | профиль, используемый для выполнения DDL-запросов                                                                                              |                                        |
| `pool_size`            | сколько запросов `ON CLUSTER` может выполняться одновременно                                                                                   |                                        |
| `max_tasks_in_queue`   | максимальное количество задач, которое может находиться в очереди                                                                              | `1,000`                                |
| `task_max_lifetime`    | удалить узел, если его «возраст» превышает это значение                                                                                        | `7 * 24 * 60 * 60` (неделя в секундах) |
| `cleanup_delay_period` | очистка запускается после получения события о новом узле, если предыдущая очистка выполнялась не менее чем `cleanup_delay_period` секунд назад | `60` секунд                            |

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


## distributed_ddl.cleanup_delay_period \{#distributed_ddl.cleanup_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="60" />очистка начинается после получения события о новом узле, если с момента последней очистки прошло не менее `<cleanup_delay_period>` секунд.

## distributed_ddl.max_tasks_in_queue \{#distributed_ddl.max_tasks_in_queue\}

<SettingsInfoBlock type="UInt64" default_value="1000" />максимальное число задач в очереди.

## distributed_ddl.path \{#distributed_ddl.path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/task_queue/ddl/" />путь в Keeper к `<task_queue>` для DDL-запросов

## distributed_ddl.pool_size \{#distributed_ddl.pool_size\}

<SettingsInfoBlock type="Int32" default_value="1" />Сколько запросов `<ON CLUSTER>` может выполняться одновременно

## distributed_ddl.profile \{#distributed_ddl.profile\}

профиль, используемый для выполнения DDL-запросов

## distributed_ddl.replicas_path \{#distributed_ddl.replicas_path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/task_queue/replicas/" />путь в Keeper к `<task_queue>` для реплик

## distributed_ddl.task_max_lifetime \{#distributed_ddl.task_max_lifetime\}

<SettingsInfoBlock type="UInt64" default_value="604800" />Удаляет узел, если его возраст превышает это значение.

## distributed_ddl_use_initial_user_and_roles \{#distributed_ddl_use_initial_user_and_roles\}

<SettingsInfoBlock type="Bool" default_value="0" />Если параметр включён, запросы ON CLUSTER будут сохранять и использовать пользователя и роли инициатора для выполнения на удалённых сегментах. Это обеспечивает последовательный контроль доступа во всём кластере, но требует, чтобы этот пользователь и роли существовали на всех узлах.

## dns_allow_resolve_names_to_ipv4 \{#dns_allow_resolve_names_to_ipv4\}

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает преобразовывать имена в IPv4-адреса.

## dns_allow_resolve_names_to_ipv6 \{#dns_allow_resolve_names_to_ipv6\}

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает преобразование имён в IPv6-адреса.

## dns_cache_max_entries \{#dns_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="10000" />Максимальное число записей во внутреннем DNS-кэше.

## dns_cache_update_period \{#dns_cache_update_period\}

<SettingsInfoBlock type="Int32" default_value="15" />Период обновления внутреннего DNS-кэша в секундах.

## dns_max_consecutive_failures \{#dns_max_consecutive_failures\}

<SettingsInfoBlock type="UInt32" default_value="5" />

Прекращает дальнейшие попытки обновить DNS-кэш для имени хоста после указанного количества последовательных сбоев. Информация при этом остаётся в DNS-кэше. Ноль означает отсутствие ограничения.

**См. также**

- [`SYSTEM DROP DNS CACHE`](../../sql-reference/statements/system#drop-dns-cache)

## drop_distributed_cache_pool_size \{#drop_distributed_cache_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="8" />Размер пула потоков, используемого для очистки распределённого кэша.

## drop_distributed_cache_queue_size \{#drop_distributed_cache_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />Размер очереди пула потоков, используемого для очистки распределённого кэша.

## enable_azure_sdk_logging \{#enable_azure_sdk_logging\}

<SettingsInfoBlock type="Bool" default_value="0" />Включает логирование Azure SDK

## encryption \{#encryption\}

Настраивает команду для получения ключа, который будет использоваться [кодеками шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должен храниться в переменных окружения или быть задан в файле конфигурации.

Ключи могут задаваться в шестнадцатеричном виде или в виде строки длиной 16 байт.

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
Хранить ключи в файле конфигурации не рекомендуется. Это небезопасно. Вы можете переместить ключи в отдельный файл конфигурации на защищённом диске и поместить символическую ссылку на этот файл конфигурации в папку `config.d/`.
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

Каждый из этих методов может использоваться для нескольких ключей:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Здесь параметр `current_key_id` указывает текущий ключ шифрования.

Также можно задать nonce длиной 12 байт (по умолчанию при шифровании и расшифровке используется nonce, состоящий из нулевых байтов):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Или его можно задать в шестнадцатеричном виде:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
Все вышеперечисленное также применимо к `aes_256_gcm_siv` (но длина ключа должна составлять 32 байта).
:::


## error_log \{#error_log\}

По умолчанию он отключён.

**Включение**

Чтобы вручную включить сбор истории ошибок [`system.error_log`](../../operations/system-tables/error_log.md), создайте `/etc/clickhouse-server/config.d/error_log.xml` со следующим содержимым:

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


## filesystem_caches_path \{#filesystem_caches_path\}

Этот параметр указывает путь к кэшу.

**Пример**

```xml
<filesystem_caches_path>/var/lib/clickhouse/filesystem_caches/</filesystem_caches_path>
```


## format_parsing_thread_pool_queue_size \{#format_parsing_thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество заданий, которые могут быть поставлены в очередь пула потоков для разбора входных данных.

:::note
Значение `0` означает отсутствие ограничения.
:::

## format_schema_path \{#format_schema_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/format_schemas/" />

Путь к каталогу со схемами для входных данных, например, схемами для формата [CapnProto](/interfaces/formats/CapnProto).

**Пример**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>/var/lib/clickhouse/format_schemas/</format_schema_path>
```


## format_schema_path \{#format_schema_path\}

Путь к каталогу со схемами входных данных, например со схемами для формата [CapnProto](/interfaces/formats/CapnProto).

**Пример**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>format_schemas/</format_schema_path>
```


## global_profiler_cpu_time_period_ns \{#global_profiler_cpu_time_period_ns\}

<SettingsInfoBlock type="UInt64" default_value="10000000000" />Период таймера тактов CPU для глобального профайлера (в наносекундах). Установите значение 0, чтобы отключить глобальный профайлер тактов CPU. Рекомендуемое значение — не менее 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (один раз в секунду) для профилирования по всему кластеру.

## global_profiler_real_time_period_ns \{#global_profiler_real_time_period_ns\}

<SettingsInfoBlock type="UInt64" default_value="10000000000" />Период таймера глобального профилировщика по реальному времени (в наносекундах). Установите значение 0, чтобы отключить глобальный профилировщик по реальному времени. Рекомендуемое значение — не менее 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (один раз в секунду) для профилирования на уровне всего кластера.

## google_protos_path \{#google_protos_path\}

<SettingsInfoBlock type="String" default_value="/usr/share/clickhouse/protos/" />

Задает каталог с proto-файлами для типов Protobuf.

**Пример**

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## google_protos_path \{#google_protos_path\}

Определяет путь к каталогу, содержащему proto-файлы для типов Protobuf.

Пример:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## graphite \{#graphite\}

Отправка данных в [Graphite](https://github.com/graphite-project).

Настройки:

* `host` – сервер Graphite.
* `port` – порт на сервере Graphite.
* `interval` – интервал отправки, в секундах.
* `timeout` – время ожидания при отправке данных, в секундах.
* `root_path` – префикс для ключей.
* `metrics` – отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
* `events` – отправка значений дельт, накопленных за период времени, из таблицы [system.events](/operations/system-tables/events).
* `events_cumulative` – отправка накопительных данных из таблицы [system.events](/operations/system-tables/events).
* `asynchronous_metrics` – отправка данных из таблицы [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics).

Вы можете настроить несколько блоков `<graphite>`. Например, это можно использовать для отправки различных данных с разными интервалами.

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


## graphite_rollup \{#graphite_rollup\}

Настройки прореживания данных Graphite.

Для получения дополнительной информации см. [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md).

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


## hdfs.libhdfs3_conf \{#hdfs.libhdfs3_conf\}

Задает для libhdfs3 корректное местоположение его конфигурации.

## hsts_max_age \{#hsts_max_age\}

Срок действия HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. Если вы зададите положительное число, HSTS будет включён, а max-age будет равен указанному вами числу.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## http_connections_hard_limit \{#http_connections_hard_limit\}

<SettingsInfoBlock type="UInt64" default_value="200000" />При попытке создать соединение, когда этот предел достигнут, выбрасывается исключение. Установите 0, чтобы отключить жёсткое ограничение. Ограничение применяется к HTTP-соединениям, которые не принадлежат ни к какому диску или хранилищу.

## http_connections_soft_limit \{#http_connections_soft_limit\}

<SettingsInfoBlock type="UInt64" default_value="100" />Соединения, число которых превышает этот лимит, имеют значительно более короткое время жизни. Лимит применяется к HTTP‑соединениям, которые не привязаны ни к какому диску или хранилищу.

## http_connections_store_limit \{#http_connections_store_limit\}

<SettingsInfoBlock type="UInt64" default_value="1000" />Подключения сверх этого лимита сбрасываются после использования. Установите значение 0, чтобы отключить кэш подключений. Лимит применяется к HTTP-подключениям, которые не привязаны ни к какому диску или хранилищу.

## http_connections_warn_limit \{#http_connections_warn_limit\}

<SettingsInfoBlock type="UInt64" default_value="500" />Предупреждающие сообщения записываются в логи, если число используемых соединений превышает этот предел. Предел применяется к HTTP-соединениям, которые не относятся ни к одному диску или хранилищу.

## http_handlers \{#http_handlers\}

Позволяет использовать пользовательские HTTP‑обработчики.
Чтобы добавить новый http‑обработчик, просто добавьте новый `<rule>`.
Правила проверяются сверху вниз в указанном порядке,
и первый совпавший запустит обработчик.

Следующие настройки могут быть заданы с помощью подтегов:

| Sub-tags             | Definition                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                | Для сопоставления URL запроса можно использовать префикс &#39;regex:&#39; для сопоставления по регулярному выражению (необязательно)                                                                                      |
| `methods`            | Для сопоставления HTTP‑методов запроса можно использовать запятые для разделения нескольких значений методов (необязательно)                                                                                              |
| `headers`            | Для сопоставления заголовков запроса сопоставьте каждый дочерний элемент (имя дочернего элемента — имя заголовка); можно использовать префикс &#39;regex:&#39; для сопоставления по регулярному выражению (необязательно) |
| `handler`            | Обработчик запроса                                                                                                                                                                                                        |
| `empty_query_string` | Проверяет, что в URL отсутствует строка запроса                                                                                                                                                                           |

`handler` содержит следующие настройки, которые могут быть заданы с помощью подтегов:

| Sub-tags           | Definition                                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `url`              | Адрес для перенаправления                                                                                                                                                                                          |
| `type`             | Поддерживаемые типы: static, dynamic&#95;query&#95;handler, predefined&#95;query&#95;handler, redirect                                                                                                             |
| `status`           | Используется с типом static, код статуса ответа                                                                                                                                                                    |
| `query_param_name` | Используется с типом dynamic&#95;query&#95;handler, извлекает и выполняет значение, соответствующее значению `<query_param_name>` в параметрах HTTP‑запроса                                                        |
| `query`            | Используется с типом predefined&#95;query&#95;handler, выполняет запрос при вызове обработчика                                                                                                                     |
| `content_type`     | Используется с типом static, content-type ответа                                                                                                                                                                   |
| `response_content` | Используется с типом static, содержимое ответа, отправляемое клиенту; при использовании префикса &#39;file://&#39; или &#39;config://&#39; считывает содержимое из файла или конфигурации и отправляет его клиенту |

Наряду со списком правил вы можете указать `<defaults/>`, который включает все обработчики по умолчанию.

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


## http_options_response \{#http_options_response\}

Используется для добавления заголовков к ответу на HTTP-запрос `OPTIONS`.
Метод `OPTIONS` используется при выполнении предварительных CORS-запросов (preflight-запросов).

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


## http_server_default_response \{#http_server_default_response\}

Страница, которая отображается по умолчанию при обращении к HTTP(S)-серверу ClickHouse.
Значение по умолчанию — «Ok.» (с символом перевода строки в конце)

**Пример**

Открывает `https://tabix.io/` при обращении к `http://localhost:http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## iceberg_catalog_threadpool_pool_size \{#iceberg_catalog_threadpool_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="50" />Размер фонового пула потоков для каталога Iceberg

## iceberg_catalog_threadpool_queue_size \{#iceberg_catalog_threadpool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно поместить в очередь пула потоков каталога Iceberg

## iceberg_metadata_files_cache_max_entries \{#iceberg_metadata_files_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="1000" />Максимальный размер кэша файлов метаданных iceberg в количестве записей. Нулевое значение отключает кэш.

## iceberg_metadata_files_cache_policy \{#iceberg_metadata_files_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики кэширования метаданных Iceberg.

## iceberg_metadata_files_cache_size \{#iceberg_metadata_files_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Максимальный размер кэша метаданных Iceberg в байтах. Нулевое значение означает, что кэш отключён.

## iceberg_metadata_files_cache_size_ratio \{#iceberg_metadata_files_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше метаданных Iceberg относительно общего размера кэша.

## ignore_empty_sql_security_in_create_view_query \{#ignore_empty_sql_security_in_create_view_query\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если значение `true`, ClickHouse не записывает значения по умолчанию для пустого оператора `SQL SECURITY` в запросах `CREATE VIEW`.

:::note
Этот параметр нужен только на период миграции и станет устаревшим начиная с версии 24.4.
:::

## include_from \{#include_from\}

<SettingsInfoBlock type="String" default_value="/etc/metrika.xml" />

Путь к файлу с подстановками. Поддерживаются форматы XML и YAML.

Подробнее см. в разделе [Файлы конфигурации](/operations/configuration-files).

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## include_from \{#include_from\}

Путь к файлу с подстановками. Поддерживаются форматы XML и YAML.

Для получения дополнительной информации см. раздел &quot;[Файлы конфигурации](/operations/configuration-files)&quot;.

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## index_mark_cache_policy \{#index_mark_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования меток вторичного индекса.

## index_mark_cache_size \{#index_mark_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

Максимальный размер кэша для маркеров индекса.

:::note

Значение `0` означает, что кэш отключен.

Этот параметр можно изменять во время работы, и изменения вступят в силу немедленно.
:::

## index_mark_cache_size_ratio \{#index_mark_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.3" />Размер защищённой очереди (в случае политики SLRU) в кэше меток вторичного индекса относительно общего размера кэша.

## index_uncompressed_cache_policy \{#index_uncompressed_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша несжатого вторичного индекса.

## index_uncompressed_cache_size \{#index_uncompressed_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер кэша для несжатых блоков индекса `MergeTree`.

:::note
Значение `0` означает, что кэш отключен.

Этот параметр можно изменять во время работы, и изменения вступают в силу немедленно.
:::

## index_uncompressed_cache_size_ratio \{#index_uncompressed_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае использования политики SLRU) в кэше несжатого вторичного индекса по отношению к общему размеру кэша.

## interserver_http_credentials \{#interserver_http_credentials\}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики, используя эти учетные данные.
Поэтому значение `interserver_http_credentials` должно быть одинаковым для всех реплик в кластере.

:::note

* По умолчанию если секция `interserver_http_credentials` опущена, аутентификация во время репликации не используется.
* Настройки `interserver_http_credentials` не относятся к [конфигурации](../../interfaces/cli.md#configuration_files) учетных данных клиента ClickHouse.
* Эти учетные данные общие для репликации по `HTTP` и `HTTPS`.
  :::

Следующие настройки могут быть заданы с помощью подтегов:

* `user` — Имя пользователя.
* `password` — Пароль.
* `allow_empty` — Если `true`, другим репликам разрешено подключаться без аутентификации даже при наличии заданных учетных данных. Если `false`, подключения без аутентификации отклоняются. Значение по умолчанию: `false`.
* `old` — Содержит старые `user` и `password`, использовавшиеся при ротации учетных данных. Может быть указано несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию межсерверных учетных данных без одновременной остановки всех реплик для обновления их конфигурации. Учетные данные можно изменить в несколько шагов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это разрешит подключения как с аутентификацией, так и без нее.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После конфигурирования всех реплик установите для `allow_empty` значение `false` или удалите этот параметр. Это делает аутентификацию с использованием новых учетных данных обязательной.

Чтобы изменить существующие учетные данные, перенесите имя пользователя и пароль в раздел `interserver_http_credentials.old` и задайте новые значения для `user` и `password`. На этом этапе сервер использует новые учетные данные для подключения к другим репликам и принимает подключения как с новыми, так и со старыми учетными данными.

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

После применения новых учетных данных ко всем репликам старые учетные данные могут быть удалены.


## interserver_http_host \{#interserver_http_host\}

Имя хоста, которое другие серверы могут использовать для доступа к этому серверу.

Если параметр не задан, значение определяется так же, как в команде `<hostname -f>`.

Полезен для отвязки от конкретного сетевого интерфейса.

**Пример**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver_http_host \{#interserver_http_host\}

Имя хоста, которое может использоваться другими серверами для доступа к этому серверу.

Если не задано, определяется так же, как результат команды `hostname -f`.

Полезно для отказа от привязки к конкретному сетевому интерфейсу.

**Пример**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver_http_port \{#interserver_http_port\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Порт для обмена данными между серверами ClickHouse.

**Пример**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver_http_port \{#interserver_http_port\}

Порт для обмена данными между серверами ClickHouse.

**Пример**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver_https_host \{#interserver_https_host\}

Аналогично `<interserver_http_host>`, за тем исключением, что это имя хоста используется другими серверами для доступа к этому серверу по `<HTTPS>`.

**Пример**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver_https_host \{#interserver_https_host\}

Аналогично [`interserver_http_host`](#interserver_http_host), за исключением того, что это имя хоста используется другими серверами для доступа к этому серверу по `HTTPS`.

**Пример**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver_https_port \{#interserver_https_port\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Порт для обмена данными между серверами ClickHouse по протоколу `<HTTPS>`.

**Пример**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver_https_port \{#interserver_https_port\}

Порт для обмена данными между серверами ClickHouse по протоколу `HTTPS`.

**Пример**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver_listen_host \{#interserver_listen_host\}

Ограничение для хостов, которые могут обмениваться данными между серверами ClickHouse.
Если используется Keeper, то то же ограничение будет применяться к взаимодействию между разными экземплярами Keeper.

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


## io_thread_pool_queue_size \{#io_thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество заданий, которые могут быть поставлены в очередь пула потоков ввода-вывода.

:::note
Значение `0` означает отсутствие ограничения.
:::

## jemalloc_collect_global_profile_samples_in_trace_log \{#jemalloc_collect_global_profile_samples_in_trace_log\}

<SettingsInfoBlock type="Bool" default_value="0" />Хранить выборочные выделения памяти jemalloc в system.trace_log

## jemalloc_enable_background_threads \{#jemalloc_enable_background_threads\}

<SettingsInfoBlock type="Bool" default_value="1" />Включает фоновые потоки jemalloc. Jemalloc использует фоновые потоки для очистки неиспользуемых страниц памяти. Его отключение может привести к снижению производительности.

## jemalloc_enable_global_profiler \{#jemalloc_enable_global_profiler\}

<SettingsInfoBlock type="Bool" default_value="0" />Включает глобальный профилировщик выделений jemalloc для всех потоков. Jemalloc будет выборочно отслеживать операции выделения и все освобождения для выборочно отслеженных выделений.
Профили можно сбрасывать командой SYSTEM JEMALLOC FLUSH PROFILE, которую можно использовать для анализа выделений.
Выборки также могут сохраняться в system.trace_log с помощью конфигурации jemalloc_collect_global_profile_samples_in_trace_log или с настройкой запроса jemalloc_collect_profile_samples_in_trace_log.
См. раздел [Профилирование выделений](/operations/allocation-profiling).

## jemalloc_flush_profile_interval_bytes \{#jemalloc_flush_profile_interval_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />Сброс профиля jemalloc будет выполнен после того, как глобальное пиковое потребление памяти увеличится на jemalloc_flush_profile_interval_bytes

## jemalloc_flush_profile_on_memory_exceeded \{#jemalloc_flush_profile_on_memory_exceeded\}

<SettingsInfoBlock type="Bool" default_value="0" />Сброс профиля jemalloc будет выполняться при ошибках из-за превышения общего объёма памяти

## jemalloc_max_background_threads_num \{#jemalloc_max_background_threads_num\}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальное количество фоновых потоков jemalloc, которые создаются; установите 0, чтобы использовать значение по умолчанию jemalloc

## keep_alive_timeout \{#keep_alive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="30" />

Количество секунд, в течение которых ClickHouse ожидает входящих HTTP-запросов перед закрытием соединения.

**Пример**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```


## keeper_hosts \{#keeper_hosts\}

Динамическая настройка. Содержит набор хостов [Zoo]Keeper, к которым ClickHouse потенциально может подключаться. Не включает информацию из `<auxiliary_zookeepers>`.

## keeper_multiread_batch_size \{#keeper_multiread_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальный размер пакета для запроса MultiRead к [Zoo]Keeper с поддержкой пакетной обработки. Если установлено значение 0, пакетная обработка отключается. Доступно только в ClickHouse Cloud.

## keeper_server.socket_receive_timeout_sec \{#keeper_server.socket_receive_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="300" />Таймаут ожидания при получении данных сокетом Keeper.

## keeper_server.socket_send_timeout_sec \{#keeper_server.socket_send_timeout_sec\}

<SettingsInfoBlock type="UInt64" default_value="300" />Таймаут отправки данных через сокет Keeper.

## ldap_servers \{#ldap_servers\}

Перечислите здесь LDAP‑серверы с их параметрами подключения, чтобы:

- использовать их как аутентификаторы для отдельных локальных пользователей, у которых вместо механизма аутентификации `password` задан `ldap`;
- использовать их как удалённые каталоги пользователей.

Следующие настройки можно задать с помощью подтегов:

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | Имя хоста или IP‑адрес LDAP‑сервера, этот параметр является обязательным и не может быть пустым.                                                                                                                                                                                                                                                                                                                                         |
| `port`                         | Порт LDAP‑сервера, по умолчанию `636`, если `enable_tls` установлено в `true`, иначе `389`.                                                                                                                                                                                                                                                                                                                                              |
| `bind_dn`                      | Шаблон, используемый для построения DN для привязки (bind). Итоговый DN формируется путём замены всех подстрок `\{user_name\}` в шаблоне фактическим именем пользователя при каждой попытке аутентификации.                                                                                                                                                                                                                             |
| `user_dn_detection`            | Раздел с параметрами поиска LDAP для определения фактического DN пользователя, к которому выполняется привязка. В основном используется в поисковых фильтрах для дальнейшего сопоставления ролей, когда сервер — Active Directory. Итоговый DN пользователя будет использоваться при замене подстрок `\{user_dn\}` везде, где это допускается. По умолчанию DN пользователя устанавливается равным bind DN, но после выполнения поиска он будет обновлён фактически обнаруженным значением DN пользователя. |
| `verification_cooldown`        | Период времени в секундах после успешной попытки привязки, в течение которого пользователь считается успешно аутентифицированным для всех последующих запросов без обращения к LDAP‑серверу. Укажите `0` (значение по умолчанию), чтобы отключить кэширование и принудительно обращаться к LDAP‑серверу для каждого запроса аутентификации.                                                                                                         |
| `enable_tls`                   | Флаг, включающий использование защищённого подключения к LDAP‑серверу. Укажите `no` для протокола в открытом виде (`ldap://`) (не рекомендуется). Укажите `yes` для LDAP поверх SSL/TLS (`ldaps://`) (рекомендуется, значение по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (протокол в открытом виде (`ldap://`), повышаемый до TLS).                                                                                                             |
| `tls_minimum_protocol_version` | Минимальная версия протокола SSL/TLS. Допустимые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (значение по умолчанию).                                                                                                                                                                                                                                                                                                         |
| `tls_require_cert`             | Поведение проверки сертификата SSL/TLS удалённого узла. Допустимые значения: `never`, `allow`, `try`, `demand` (значение по умолчанию).                                                                                                                                                                                                                                                                                                   |
| `tls_cert_file`                | Путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `tls_key_file`                 | Путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `tls_ca_cert_file`             | Путь к файлу корневого сертификата (CA).                                                                                                                                                                                                                                                                                                                                                                                                  |
| `tls_ca_cert_dir`              | Путь к каталогу, содержащему корневые сертификаты (CA).                                                                                                                                                                                                                                                                                                                                                                                  |
| `tls_cipher_suite`             | Разрешённый набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                                                                                            |

Настройка `user_dn_detection` может быть задана с помощью подтегов:

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | Шаблон, используемый для построения base DN для поиска LDAP. Итоговый DN формируется путём замены всех подстрок `\{user_name\}` и `\{bind_dn\}` в шаблоне фактическим именем пользователя и bind DN во время поиска LDAP.                                                                                                                    |
| `scope`         | Область поиска LDAP. Допустимые значения: `base`, `one_level`, `children`, `subtree` (значение по умолчанию).                                                                                                                                                                                                                                  |
| `search_filter` | Шаблон, используемый для построения фильтра поиска для запроса LDAP. Итоговый фильтр формируется путём замены всех подстрок `\{user_name\}`, `\{bind_dn\}` и `\{base_dn\}` в шаблоне фактическим именем пользователя, bind DN и base DN во время поиска LDAP. Обратите внимание, что специальные символы должны быть корректно экранированы в XML.  |

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


## license_file \{#license_file\}

Содержимое файла лицензии для ClickHouse Enterprise Edition

## license_public_key_for_testing \{#license_public_key_for_testing\}

Демонстрационный лицензионный ключ, только для использования в CI

## listen_backlog \{#listen_backlog\}

<SettingsInfoBlock type="UInt32" default_value="4096" />

Backlog (размер очереди ожидающих соединений) для прослушивающего сокета. Значение по умолчанию `<4096>` такое же, как в Linux 5.4+.

Обычно это значение не нужно изменять, поскольку:

* значение по умолчанию достаточно велико;
* для приёма клиентских соединений у сервера есть отдельный поток.

Поэтому даже если счётчик `<TcpExtListenOverflows>` (из `<nstat>`) ненулевой и растёт для сервера ClickHouse, это не значит, что это значение необходимо увеличивать, поскольку:

* обычно, если `<4096>` недостаточно, это указывает на внутреннюю проблему масштабирования ClickHouse, поэтому лучше создать отчёт об ошибке;
* это не означает, что сервер сможет обработать больше соединений позже (и даже если бы смог, к тому моменту клиенты могут уже отключиться или пропасть).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```


## listen_backlog \{#listen_backlog\}

Backlog (размер очереди ожидающих подключений) прослушивающего сокета. Значение по умолчанию `4096` такое же, как и в Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не требуется изменять, поскольку:

* Значение по умолчанию достаточно велико.
* Для приёма клиентских подключений у сервера есть отдельный поток.

Поэтому даже если у вас `TcpExtListenOverflows` (из `nstat`) имеет ненулевое значение и этот счётчик растёт для сервера ClickHouse, это не означает, что это значение нужно увеличивать, поскольку:

* Обычно, если `4096` недостаточно, это указывает на внутреннюю проблему масштабирования ClickHouse, поэтому лучше сообщить о проблеме.
* Это не означает, что сервер сможет позже обработать больше подключений (и даже если сможет, к тому моменту клиенты могут уже уйти или отключиться).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```


## listen_host \{#listen_host\}

Ограничение на хосты, с которых принимаются запросы. Если вы хотите, чтобы сервер принимал запросы со всех хостов, укажите `::`.

Примеры:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## listen_reuse_port \{#listen_reuse_port\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает нескольким серверам прослушивать один и тот же адрес:порт. Запросы будут направляться операционной системой на случайный сервер. Включать этот параметр не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```


## listen_reuse_port \{#listen_reuse_port\}

Разрешает нескольким серверам прослушивать одно и то же сочетание адрес:порт. Запросы будут операционной системой направляться на случайный сервер. Включать этот параметр не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

Значение по умолчанию:


## listen_try \{#listen_try\}

<SettingsInfoBlock type="Bool" default_value="0" />

Сервер не завершит работу, если сети IPv6 или IPv4 недоступны при попытке начать прослушивание (открыть порт).

**Пример**

```xml
<listen_try>0</listen_try>
```


## listen_try \{#listen_try\}

Сервер не будет завершать работу, если при попытке начать прослушивание недоступны сети IPv6 или IPv4.

**Пример**

```xml
<listen_try>0</listen_try>
```


## load_marks_threadpool_pool_size \{#load_marks_threadpool_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="50" />Размер фонового пула потоков для загрузки меток

## load_marks_threadpool_queue_size \{#load_marks_threadpool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно поставить в очередь пула предварительной выборки

## logger \{#logger\}

Расположение и формат сообщений журнала.

**Ключи**:

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | Уровень логирования. Допустимые значения: `none` (выключить логирование), `fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test` |
| `log`                  | Путь к файлу журнала.                                                                                                                                              |
| `errorlog`             | Путь к файлу журнала ошибок.                                                                                                                                       |
| `size`                 | Политика ротации: максимальный размер файлов журнала в байтах. Когда размер файла журнала превышает этот порог, он переименовывается и архивируется, после чего создаётся новый файл журнала. |
| `rotation`             | Политика ротации: определяет, когда файлы журнала ротируются. Ротация может выполняться по размеру, времени или их комбинации. Примеры: 100M, daily, 100M,daily. Когда размер файла журнала превышает указанный размер или наступает заданный интервал времени, файл переименовывается и архивируется, после чего создаётся новый файл журнала. |
| `count`                | Политика ротации: максимальное количество исторических файлов журналов ClickHouse, которые хранятся.                                                               |
| `stream_compress`      | Сжимать сообщения журнала с помощью LZ4. Установите `1` или `true` для включения.                                                                                  |
| `console`              | Включить логирование в консоль. Установите `1` или `true` для включения. Значение по умолчанию — `1`, если ClickHouse не запущен в режиме демона, иначе `0`.      |
| `console_log_level`    | Уровень логирования для вывода в консоль. По умолчанию — `level`.                                                                                                  |
| `formatting.type`      | Формат журнала для вывода в консоль. В настоящее время поддерживается только `json`.                                                                              |
| `use_syslog`           | Дополнительно перенаправлять вывод журнала в syslog.                                                                                                               |
| `syslog_level`         | Уровень логирования для записи в syslog.                                                                                                                           |
| `async`                | Если `true` (по умолчанию), логирование выполняется асинхронно (один фоновый поток на каждый канал вывода). В противном случае логирование выполняется в потоке, вызывающем LOG. |
| `async_queue_max_size` | При использовании асинхронного логирования — максимальное количество сообщений, которые будут находиться в очереди в ожидании сброса. Лишние сообщения будут отброшены. |
| `startup_level`        | Уровень логирования при запуске используется для установки уровня корневого логгера при старте сервера. После запуска уровень логирования возвращается к настройке `level`. |
| `shutdown_level`       | Уровень логирования при остановке используется для установки уровня корневого логгера при остановке сервера.                                                      |

**Спецификаторы формата журнала**

Имена файлов в путях `log` и `errorLog` поддерживают следующие спецификаторы формата для результирующего имени файла (для части пути, соответствующей каталогу, спецификаторы не поддерживаются).

Столбец «Example» показывает вывод для `2023-07-06 18:32:07`.

| Спецификатор | Описание                                                                                                                                                                                             | Пример                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `%%`         | Буквальный символ %                                                                                                                                                                                  | `%`                        |
| `%n`         | Символ перевода строки                                                                                                                                                                               |                            |
| `%t`         | Символ горизонтальной табуляции                                                                                                                                                                      |                            |
| `%Y`         | Год в виде десятичного числа, например, 2017                                                                                                                                                         | `2023`                     |
| `%y`         | Последние две цифры года как десятичное число (диапазон [00, 99])                                                                                                                                    | `23`                       |
| `%C`         | Первые две цифры года в виде десятичного числа (диапазон [00,99])                                                                                                                                    | `20`                       |
| `%G`         | Четырёхзначный [год по ISO 8601, основанный на неделях](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), то есть год, который содержит указанную неделю. Обычно используется только вместе с `%V` | `2023`                     |
| `%g`         | Последние две цифры [ISO 8601 week-based year](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), то есть года, в который входит указанная неделя.                                                  | `23`                       |
| `%b`         | Сокращённое название месяца, например, Oct (зависит от локали).                                                                                                                                      | `Jul`                      |
| `%h`         | Синоним спецификатора %b                                                                                                                                                                             | `Jul`                      |
| `%B`         | Полное название месяца, например October (зависит от настроек локали)                                                                                                                                | `июль`                     |
| `%m`         | Месяц как десятичное число (диапазон [01,12])                                                                                                                                                        | `07`                       |
| `%U`         | Номер недели в году в виде десятичного числа (воскресенье — первый день недели) (диапазон [00,53])                                                                                                   | `27`                       |
| `%W`         | Номер недели года в виде десятичного числа (понедельник — первый день недели) (диапазон [00,53])                                                                                                     | `27`                       |
| `%V`         | Номер недели по стандарту ISO 8601 (диапазон [01,53])                                                                                                                                                | `27`                       |
| `%j`         | День года как десятичное число (диапазон [001, 366])                                                                                                                                                 | `187`                      |
| `%d`         | День месяца в виде десятичного числа с ведущим нулём (диапазон [01,31]). Одноразрядное число дополняется ведущим нулём.                                                                              | `06`                       |
| `%e`         | День месяца в виде десятичного числа с заполнением пробелом (диапазон [1,31]). Одноразрядное число дополняется пробелом слева.                                                                       | `&nbsp; 6`                 |
| `%a`         | Краткое название дня недели, например Fri (зависит от локали)                                                                                                                                        | `Чт`                       |
| `%A`         | Полное название дня недели, например «Friday» (зависит от локали)                                                                                                                                    | `четверг`                  |
| `%w`         | День недели в виде целого числа, где воскресенье — 0 (диапазон [0–6])                                                                                                                                | `4`                        |
| `%u`         | День недели как целое число, где понедельник — 1 (в формате ISO 8601) (диапазон [1-7])                                                                                                               | `4`                        |
| `%H`         | Час в виде десятичного числа, 24-часовой формат (диапазон [00–23])                                                                                                                                   | `18`                       |
| `%I`         | Час в виде десятичного числа в 12-часовом формате (диапазон [01, 12])                                                                                                                                | `06`                       |
| `%M`         | Минута как десятичное число (в диапазоне [00,59])                                                                                                                                                    | `32`                       |
| `%S`         | Секунда в формате десятичного числа (диапазон [00,60])                                                                                                                                               | `07`                       |
| `%c`         | Стандартное строковое представление даты и времени, например Sun Oct 17 04:41:13 2010 (зависит от локали)                                                                                            | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованный формат даты (зависит от локали)                                                                                                                                                       | `06.07.23`                 |
| `%X`         | Локализованное представление времени, например 18:40:20 или 6:40:20 PM (в зависимости от локали)                                                                                                     | `18:32:07`                 |
| `%D`         | Краткая дата в формате MM/DD/YY, эквивалент формату %m/%d/%y                                                                                                                                         | `07/06/23`                 |
| `%F`         | Краткая дата в формате YYYY-MM-DD, эквивалент записи %Y-%m-%d                                                                                                                                        | `2023-07-06`               |
| `%r`         | Локализованное время в 12‑часовом формате (зависит от региональных настроек)                                                                                                                         | `06:32:07 PM`              |
| `%R`         | Эквивалент «%H:%M»                                                                                                                                                                                   | `18:32`                    |
| `%T`         | Эквивалентно &quot;%H:%M:%S&quot; (время в формате ISO 8601)                                                                                                                                         | `18:32:07`                 |
| `%p`         | Локализованное обозначение «a.m.» или «p.m.» (зависит от локали)                                                                                                                                     | `PM`                       |
| `%z`         | Смещение от UTC в формате ISO 8601 (например -0430) или пустая строка, если сведения о часовом поясе недоступны                                                                                      | `+0800`                    |
| `%Z`         | Зависимое от локали название или аббревиатура часового пояса, либо пустая строка, если информация о часовом поясе недоступна                                                                         | `Z AWST `                  |

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

Чтобы выводить лог‑сообщения только в консоль:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**Переопределения по уровням**

Уровень логирования для отдельных логгеров по имени может быть переопределён. Например, чтобы отключить все сообщения логгеров &quot;Backup&quot; и &quot;RBAC&quot;.

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

Чтобы дополнительно записывать лог-сообщения в syslog:

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

| Key        | Description                                                                                                                                                                                                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | Адрес syslog в формате `host\[:port\]`. Если не указан — используется локальный демон.                                                                                                                                                                                                        |
| `hostname` | Имя хоста, с которого отправляются логи (необязательное поле).                                                                                                                                                                                                                                |
| `facility` | [Ключевое слово facility](https://en.wikipedia.org/wiki/Syslog#Facility) для syslog. Должно быть указано в верхнем регистре с префиксом &quot;LOG&#95;&quot;, например: `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т. д. По умолчанию: `LOG_USER`, если указан `address`, иначе — `LOG_DAEMON`. |
| `format`   | Формат сообщения лога. Возможные значения: `bsd` и `syslog.`                                                                                                                                                                                                                                  |

**Форматы логов**

Вы можете задать формат логов, выводимых в консоль. В данный момент поддерживается только JSON.

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

Чтобы включить поддержку логирования в формате JSON, используйте следующий фрагмент конфигурации:

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

**Переименование ключей для JSON-логов**

Имена ключей можно изменить, задав другие значения тегов внутри тега `<names>`. Например, чтобы изменить `DATE_TIME` на `MY_DATE_TIME`, можно использовать `<date_time>MY_DATE_TIME</date_time>`.

**Пропуск ключей для JSON-логов**

Поля логов можно опустить, закомментировав соответствующее поле. Например, если вы не хотите, чтобы лог выводил `query_id`, вы можете закомментировать тег `<query_id>`.


## logger.async \{#logger.async\}

<SettingsInfoBlock type="Bool" default_value="1" />Когда установлено значение `<true>` (по умолчанию), логирование выполняется асинхронно (один фоновый поток на каждый канал вывода). В противном случае записи в лог выполняются в потоке, из которого вызывается LOG.

## logger.async_queye_max_size \{#logger.async_queye_max_size\}

<SettingsInfoBlock type="UInt64" default_value="65536" />При использовании асинхронного логирования задаёт максимальное количество сообщений, которые могут находиться в очереди в ожидании сброса. Сообщения сверх этого лимита будут отброшены.

## logger.console \{#logger.console\}

<SettingsInfoBlock type="Bool" default_value="0" />Включает вывод логов в консоль. Установите значение `<1>` или `<true>`, чтобы включить параметр. Значение по умолчанию — `<1>`, если ClickHouse не запущен в режиме демона, и `<0>` в противном случае.

## logger.console_log_level \{#logger.console_log_level\}

<SettingsInfoBlock type="String" default_value="trace" />Уровень логирования для вывода в консоль. По умолчанию — `<level>`.

## logger.count \{#logger.count\}

<SettingsInfoBlock type="UInt64" default_value="1" />Политика ротации: максимальное количество старых файлов журнала ClickHouse, которые могут храниться.

## logger.errorlog \{#logger.errorlog\}

Путь к файлу журнала ошибок.

## logger.formatting.type \{#logger.formatting.type\}

<SettingsInfoBlock type="String" default_value="json" />Формат логов для вывода в консоль. Сейчас поддерживается только `<json>`.

## logger.level \{#logger.level\}

<SettingsInfoBlock type="String" default_value="trace" />Уровень логирования. Допустимые значения: `<none>` (отключить логирование), `<fatal>`, `<critical>`, `<error>`, `<warning>`, `<notice>`, `<information>`, `<debug>`, `<trace>`, `<test>`.

## logger.log \{#logger.log\}

Путь к файлу журнала.

## logger.rotation \{#logger.rotation\}

<SettingsInfoBlock type="String" default_value="100M" />Политика ротации: определяет, когда выполняется ротация файлов журнала. Ротация может выполняться на основе размера, времени или их комбинации. Примеры: 100M, daily, 100M,daily. Как только файл журнала превышает указанный размер или достигается заданный временной интервал, он переименовывается и архивируется, а вместо него создаётся новый файл журнала.

## logger.shutdown_level \{#logger.shutdown_level\}

Уровень завершения используется для установки уровня корневого логгера при остановке сервера.

## logger.size \{#logger.size\}

<SettingsInfoBlock type="String" default_value="100M" />Политика ротации: максимальный допустимый размер файлов журнала в байтах. После превышения этого порога файл журнала переименовывается и архивируется, а затем создаётся новый файл журнала.

## logger.startup_level \{#logger.startup_level\}

Стартовый уровень используется для задания уровня корневого логгера при запуске сервера. После запуска уровень логирования возвращается к значению параметра `<level>`.

## logger.stream_compress \{#logger.stream_compress\}

<SettingsInfoBlock type="Bool" default_value="0" />Сжимает сообщения журнала с помощью LZ4. Установите значение `<1>` или `<true>`, чтобы включить.

## logger.syslog_level \{#logger.syslog_level\}

<SettingsInfoBlock type="String" default_value="trace" />Уровень детализации журналирования при выводе в syslog.

## logger.use_syslog \{#logger.use_syslog\}

<SettingsInfoBlock type="Bool" default_value="0" />Также перенаправлять вывод логов в syslog.

## macros \{#macros\}

Параметры подстановки для реплицированных таблиц.

Эту секцию можно опустить, если реплицированные таблицы не используются.

Для получения дополнительной информации см. раздел [Создание реплицированных таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```


## mark_cache_policy \{#mark_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики кэша меток.

## mark_cache_prewarm_ratio \{#mark_cache_prewarm_ratio\}

<SettingsInfoBlock type="Double" default_value="0.95" />Доля общего объёма кэша меток, заполняемая при предварительном прогреве.

## mark_cache_size \{#mark_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />

Максимальный размер кэша меток (индекса таблиц семейства [`MergeTree`](/engines/table-engines/mergetree-family)).

:::note
Этот параметр можно изменять во время работы сервера, и изменения вступят в силу немедленно.
:::

## mark_cache_size_ratio \{#mark_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше меток относительно общего размера кэша.

## max_active_parts_loading_thread_pool_size \{#max_active_parts_loading_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="64" />Количество потоков в пуле для загрузки активного набора частей данных при запуске.

## max_authentication_methods_per_user \{#max_authentication_methods_per_user\}

<SettingsInfoBlock type="UInt64" default_value="100" />

Максимальное количество методов аутентификации, с которыми пользователь может быть создан или изменён.
Изменение этой настройки не влияет на уже существующих пользователей. Запросы CREATE/ALTER, связанные с аутентификацией, будут завершаться с ошибкой, если они превышают лимит, указанный в этой настройке.
Запросы CREATE/ALTER, не связанные с аутентификацией, будут выполняться успешно.

:::note
Значение `0` означает отсутствие ограничения.
:::

## max_backup_bandwidth_for_server \{#max_backup_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения в байтах в секунду для всех резервных копий на сервере. Значение 0 означает отсутствие ограничения.

## max_backups_io_thread_pool_free_size \{#max_backups_io_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />Если количество **бездействующих** потоков в пуле потоков ввода-вывода резервных копий (Backups IO Thread pool) превышает `max_backup_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занятые этими потоками, и уменьшит размер пула. Потоки могут быть созданы снова при необходимости.

## max_backups_io_thread_pool_size \{#max_backups_io_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse использует потоки из пула потоков Backups IO Thread pool для выполнения операций ввода-вывода при резервном копировании в S3. `max_backups_io_thread_pool_size` ограничивает максимальное количество потоков в этом пуле.

## max_build_vector_similarity_index_thread_pool_size \{#max_build_vector_similarity_index_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="16" />

Максимальное количество потоков, используемых для построения векторных индексов.

:::note
Значение `0` означает все ядра.
:::

## max_concurrent_insert_queries \{#max_concurrent_insert_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на общее число одновременно выполняемых запросов INSERT.

:::note

Значение `0` (по умолчанию) означает отсутствие ограничений.

Этот параметр может быть изменён во время работы и вступает в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::

## max_concurrent_queries \{#max_concurrent_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на общее число одновременно выполняемых запросов. Обратите внимание, что также необходимо учитывать ограничения на запросы `INSERT` и `SELECT`, а также на максимальное число запросов для пользователей.

См. также:

- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

Значение `0` (по умолчанию) означает отсутствие ограничений.

Этот параметр можно изменить во время работы сервера, и изменение вступит в силу немедленно. Уже выполняющиеся запросы останутся без изменений.
:::

## max_concurrent_select_queries \{#max_concurrent_select_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на общее количество одновременно выполняемых запросов SELECT.

:::note

Значение `0` (по умолчанию) означает отсутствие ограничения.

Этот параметр можно изменить во время работы сервера, и изменение вступит в силу немедленно. Уже выполняющиеся запросы останутся без изменений.
:::

## max_connections \{#max_connections\}

<SettingsInfoBlock type="Int32" default_value="4096" />Максимальное количество подключений к серверу.

## max_database_num_to_throw \{#max_database_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />Если число баз данных превышает это значение, сервер выбросит исключение. 0 означает отсутствие ограничения.

## max_database_num_to_warn \{#max_database_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если количество подключённых баз данных превышает указанное значение, сервер ClickHouse добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```


## max_database_replicated_create_table_thread_pool_size \{#max_database_replicated_create_table_thread_pool_size\}

<SettingsInfoBlock type="UInt32" default_value="1" />Количество потоков, используемых для создания таблиц во время восстановления реплики в DatabaseReplicated. Ноль означает, что количество потоков равно количеству ядер.

## max_dictionary_num_to_throw \{#max_dictionary_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если число словарей превышает это значение, сервер выбросит исключение.

В счет идут только таблицы баз данных со следующими движками:

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


## max_dictionary_num_to_warn \{#max_dictionary_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если количество подключенных словарей превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```


## max_distributed_cache_read_bandwidth_for_server \{#max_distributed_cache_read_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная суммарная скорость чтения из распределённого кэша на сервере в байтах в секунду. Ноль означает отсутствие ограничения.

## max_distributed_cache_write_bandwidth_for_server \{#max_distributed_cache_write_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная суммарная скорость записи в распределённый кэш на сервере в байтах в секунду. Ноль означает отсутствие ограничений.

## max_entries_for_hash_table_stats \{#max_entries_for_hash_table_stats\}

<SettingsInfoBlock type="UInt64" default_value="10000" />Максимальное количество записей в статистике хеш-таблицы, собираемой во время агрегации

## max_fetch_partition_thread_pool_size \{#max_fetch_partition_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="64" />Количество потоков для выполнения ALTER TABLE FETCH PARTITION.

## max_format_parsing_thread_pool_free_size \{#max_format_parsing_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество свободных резервных потоков в пуле потоков для разбора входных данных.

## max_format_parsing_thread_pool_size \{#max_format_parsing_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="100" />

Максимальное общее количество потоков, используемых для разбора входных данных.

## max_io_thread_pool_free_size \{#max_io_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество **свободных** потоков в пуле потоков ввода-вывода превышает `max_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занятые этими потоками, и уменьшит размер пула. При необходимости потоки могут быть созданы заново.

## max_io_thread_pool_size \{#max_io_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse использует потоки из пула потоков ввода-вывода (IO thread pool) для выполнения отдельных операций ввода-вывода (например, для взаимодействия с S3). `max_io_thread_pool_size` ограничивает максимальное количество потоков в этом пуле.

## max_keep_alive_requests \{#max_keep_alive_requests\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество запросов через одно keep-alive-соединение до того, как оно будет закрыто сервером ClickHouse.

**Пример**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```


## max_local_read_bandwidth_for_server \{#max_local_read_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость локального чтения в байтах в секунду.

:::note
Значение `0` означает отсутствие ограничений.
:::

## max_local_write_bandwidth_for_server \{#max_local_write_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость локальной записи в байтах в секунду.

:::note
Значение `0` означает отсутствие ограничений.
:::

## max_materialized_views_count_for_table \{#max_materialized_views_count_for_table\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничение на число materialized views, привязанных к таблице.

:::note
Здесь учитываются только непосредственно зависящие от неё представления; создание одного представления поверх другого представления не принимается во внимание.
:::

## max_merges_bandwidth_for_server \{#max_merges_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения всех слияний на сервере в байтах в секунду. Ноль означает отсутствие ограничений.

## max_mutations_bandwidth_for_server \{#max_mutations_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная совокупная скорость чтения всех мутаций на сервере в байтах в секунду. 0 означает отсутствие ограничений.

## max_named_collection_num_to_throw \{#max_named_collection_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество именованных коллекций превышает это значение, сервер выбросит исключение.

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**

```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```


## max_named_collection_num_to_warn \{#max_named_collection_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если количество именованных коллекций превышает заданное значение, сервер ClickHouse добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```


## max_open_files \{#max_open_files\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальное количество открытых файлов.

:::note
Мы рекомендуем использовать эту опцию в macOS, поскольку функция getrlimit() возвращает некорректное значение.
:::

## max_open_files \{#max_open_files\}

Максимальное количество открытых файлов.

:::note
Рекомендуем использовать этот параметр на macOS, поскольку функция `getrlimit()` возвращает некорректное значение.
:::

**Пример**

```xml
<max_open_files>262144</max_open_files>
```


## max_os_cpu_wait_time_ratio_to_drop_connection \{#max_os_cpu_wait_time_ratio_to_drop_connection\}

<SettingsInfoBlock type="Float" default_value="0" />

Максимальное соотношение между временем ожидания CPU в ОС (метрика OSCPUWaitMicroseconds) и временем занятости (метрика OSCPUVirtualTimeMicroseconds), при котором соединения могут быть разорваны. Для вычисления вероятности используется линейная интерполяция между минимальным и максимальным значением соотношения, при достижении этого значения вероятность равна 1.
Подробнее см. раздел [Управление поведением при перегрузке CPU сервера](/operations/settings/server-overload).

## max_outdated_parts_loading_thread_pool_size \{#max_outdated_parts_loading_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="32" />Количество потоков в пуле для загрузки неактивных (устаревших) частей данных при запуске.

## max_part_num_to_warn \{#max_part_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

Если количество активных частей превышает указанное значение, сервер ClickHouse будет записывать предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```


## max_partition_size_to_drop \{#max_partition_size_to_drop\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

Ограничение на удаление партиций.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает значение [`max_partition_size_to_drop`](#max_partition_size_to_drop) (в байтах), партицию нельзя удалить с помощью запроса [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart).
Для применения этого параметра не требуется перезапуск сервера ClickHouse. Другой способ отключить ограничение — создать файл `<clickhouse-path>/flags/force_drop_table`.

:::note
Значение `0` означает, что вы можете удалять партиции без каких-либо ограничений.

Это ограничение не распространяется на DROP TABLE и TRUNCATE TABLE, см. [max&#95;table&#95;size&#95;to&#95;drop](/operations/settings/settings#max_table_size_to_drop)
:::

**Пример**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```


## max_parts_cleaning_thread_pool_size \{#max_parts_cleaning_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="128" />Количество потоков для одновременного удаления неактивных частей данных.

## max_pending_mutations_execution_time_to_warn \{#max_pending_mutations_execution_time_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="86400" />

Если время выполнения какой-либо из ожидающих мутаций превышает указанное значение в секундах, сервер ClickHouse добавляет предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```


## max_pending_mutations_to_warn \{#max_pending_mutations_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="500" />

Если количество отложенных мутаций превышает заданное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```


## max_prefixes_deserialization_thread_pool_free_size \{#max_prefixes_deserialization_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество **свободных** потоков в пуле потоков десериализации префиксов превышает `max_prefixes_deserialization_thread_pool_free_size`, ClickHouse освободит ресурсы, занятые этими потоками, и уменьшит размер пула. При необходимости потоки могут быть созданы заново.

## max_prefixes_deserialization_thread_pool_size \{#max_prefixes_deserialization_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="100" />

ClickHouse использует потоки пула десериализации префиксов для параллельного чтения метаданных столбцов и подстолбцов из префиксов файлов в Wide-частях движка MergeTree. `max_prefixes_deserialization_thread_pool_size` ограничивает максимальное количество потоков в этом пуле.

## max_remote_read_network_bandwidth_for_server \{#max_remote_read_network_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость сетевого обмена данными при чтении, в байтах в секунду.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

## max_remote_write_network_bandwidth_for_server \{#max_remote_write_network_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальная скорость обмена данными по сети в байтах в секунду для записи.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

## max_replicated_fetches_network_bandwidth_for_server \{#max_replicated_fetches_network_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость обмена данными по сети в байтах в секунду для реплицированных выборок. Ноль означает отсутствие ограничений.

## max_replicated_sends_network_bandwidth_for_server \{#max_replicated_sends_network_bandwidth_for_server\}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость обмена данными по сети, в байтах в секунду, для операций replicated sends. Ноль означает отсутствие ограничений.

## max_replicated_table_num_to_throw \{#max_replicated_table_num_to_throw\}

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


## max_server_memory_usage \{#max_server_memory_usage\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объем памяти, который сервер может использовать, в байтах.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается параметром `max_server_memory_usage_to_ram_ratio`.
:::

В качестве особого случая значение `0` (по умолчанию) означает, что сервер может использовать всю доступную память (за исключением дополнительных ограничений, накладываемых параметром `max_server_memory_usage_to_ram_ratio`).

## max_server_memory_usage_to_ram_ratio \{#max_server_memory_usage_to_ram_ratio\}

<SettingsInfoBlock type="Double" default_value="0.9" />

Максимальный объём памяти, который серверу разрешено использовать, выраженный как отношение к суммарному объёму доступной памяти.

Например, значение `0.9` (по умолчанию) означает, что сервер может использовать 90% доступной памяти.

Позволяет снизить использование памяти на системах с малым объёмом ОЗУ.
На хостах с небольшим объёмом ОЗУ и swap, возможно, потребуется установить параметр [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) больше 1.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается параметром `max_server_memory_usage`.
:::

## max_session_timeout \{#max_session_timeout\}

Максимальное время ожидания сеанса, в секундах.

Пример:

```xml
<max_session_timeout>3600</max_session_timeout>
```


## max_table_num_to_throw \{#max_table_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если количество таблиц превышает это значение, сервер выбросит исключение.

Следующие таблицы не учитываются:

* view
* remote
* dictionary
* system

Считаются только таблицы в базах данных с движками:

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


## max_table_num_to_warn \{#max_table_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="5000" />

Если число присоединённых таблиц превышает указанное значение, сервер ClickHouse добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```


## max_table_size_to_drop \{#max_table_size_to_drop\}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />

Ограничение на удаление таблиц.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает `max_table_size_to_drop` (в байтах), вы не можете удалить её с помощью запроса [`DROP`](../../sql-reference/statements/drop.md) или запроса [`TRUNCATE`](../../sql-reference/statements/truncate.md).

:::note
Значение `0` означает, что вы можете удалять любые таблицы без каких-либо ограничений.

Для применения этой настройки не требуется перезапуск сервера ClickHouse. Другой способ отключить ограничение — создать файл `<clickhouse-path>/flags/force_drop_table`.
:::

**Пример**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```


## max_temporary_data_on_disk_size \{#max_temporary_data_on_disk_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный объем дискового пространства, который может быть использован для внешней агрегации, операций JOIN или сортировки.
Запросы, которые превысят этот лимит, завершатся с ошибкой (исключением).

:::note
Значение `0` означает отсутствие ограничения.
:::

См. также:

- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

## max_thread_pool_free_size \{#max_thread_pool_free_size\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Если количество **простаивающих** потоков в глобальном пуле потоков (Global Thread Pool) превышает значение [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size), ClickHouse освобождает ресурсы, занимаемые некоторыми потоками, и размер пула уменьшается. При необходимости потоки могут быть созданы заново.

**Пример**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```


## max_thread_pool_size \{#max_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

ClickHouse использует потоки из глобального пула потоков (global thread pool) для обработки запросов. Если нет свободного потока для обработки запроса, в пуле создаётся новый поток. `max_thread_pool_size` ограничивает максимальное количество потоков в пуле.

**Пример**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```


## max_unexpected_parts_loading_thread_pool_size \{#max_unexpected_parts_loading_thread_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="8" />Количество потоков для загрузки неактивного набора частей данных («неожиданных») при запуске.

## max_view_num_to_throw \{#max_view_num_to_throw\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Если число представлений превышает это значение, сервер выбросит исключение.

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


## max_view_num_to_warn \{#max_view_num_to_warn\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Если количество подключённых представлений превышает указанное значение, сервер ClickHouse добавит предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```


## max_waiting_queries \{#max_waiting_queries\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Лимит на общее количество одновременно ожидающих выполнения запросов.
Выполнение ожидающего запроса блокируется, пока необходимые таблицы загружаются асинхронно (см. [`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases)).

:::note
Ожидающие запросы не учитываются при проверке ограничений, контролируемых следующими настройками:

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

Это сделано для того, чтобы избежать срабатывания этих лимитов сразу после запуска сервера.
:::

:::note

Значение `0` (по умолчанию) означает отсутствие ограничения.

Эту настройку можно изменять во время работы сервера, и изменения вступают в силу немедленно. Уже выполняющиеся запросы останутся без изменений.
:::

## memory_worker_correct_memory_tracker \{#memory_worker_correct_memory_tracker\}

<SettingsInfoBlock type="Bool" default_value="0" />

Должен ли фоновый обработчик памяти корректировать внутренний трекер памяти на основе информации из внешних источников, таких как jemalloc и cgroups.

## memory_worker_period_ms \{#memory_worker_period_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Период тиков фонового процесса управления памятью, который корректирует значения memory tracker и очищает неиспользуемые страницы при повышенном использовании памяти. Если установлено значение 0, будет использовано значение по умолчанию в зависимости от источника использования памяти.

## memory_worker_purge_dirty_pages_threshold_ratio \{#memory_worker_purge_dirty_pages_threshold_ratio\}

<SettingsInfoBlock type="Double" default_value="0.2" />

Пороговое значение доли «грязных» страниц jemalloc от объёма памяти, доступной серверу ClickHouse. Когда размер «грязных» страниц превышает эту долю, фоновый рабочий поток памяти принудительно очищает «грязные» страницы. Если установлено значение 0, принудительная очистка отключается.

## memory_worker_use_cgroup \{#memory_worker_use_cgroup\}

<SettingsInfoBlock type="Bool" default_value="1" />Использовать сведения о текущем использовании памяти в cgroup для корректировки отслеживания памяти.

## merge_tree \{#merge_tree\}

Параметры тонкой настройки для таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Для получения дополнительной информации см. заголовочный файл MergeTreeSettings.h.

**Пример**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```


## merge_workload \{#merge_workload\}

<SettingsInfoBlock type="String" default_value="default" />

Используется для регулирования использования и распределения ресурсов между слияниями и другими нагрузками. Указанное значение используется как значение настройки `workload` для всех фоновых слияний. Может быть переопределено настройкой таблицы MergeTree.

**См. также**

- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)

## merges_mutations_memory_usage_soft_limit \{#merges_mutations_memory_usage_soft_limit\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает ограничение на объем оперативной памяти, который можно использовать для выполнения операций слияния (merge) и мутаций (mutation).
Если ClickHouse достигнет установленного лимита, он не будет планировать новые фоновые операции слияния или мутации, но продолжит выполнять уже запланированные задачи.

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```


## merges_mutations_memory_usage_to_ram_ratio \{#merges_mutations_memory_usage_to_ram_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />

Значение настройки `merges_mutations_memory_usage_soft_limit` по умолчанию рассчитывается как `memory_amount * merges_mutations_memory_usage_to_ram_ratio`.

**См. также:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)

## metric_log \{#metric_log\}

По умолчанию он отключён.

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

Чтобы отключить параметр `metric_log`, необходимо создать следующий файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## min_os_cpu_wait_time_ratio_to_drop_connection \{#min_os_cpu_wait_time_ratio_to_drop_connection\}

<SettingsInfoBlock type="Float" default_value="0" />

Минимальное отношение между временем ожидания ЦП ОС (метрика OSCPUWaitMicroseconds) и временем занятости (метрика OSCPUVirtualTimeMicroseconds), при котором можно рассматривать отключение соединений. Для вычисления вероятности используется линейная интерполяция между минимальным и максимальным отношением; при этом значении отношения вероятность равна 0.
См. раздел [Управление поведением при перегрузке ЦП сервера](/operations/settings/server-overload) для получения более подробной информации.

## mlock_executable \{#mlock_executable\}

<SettingsInfoBlock type="Bool" default_value="0" />

Выполнить `<mlockall>` после запуска, чтобы уменьшить задержку первых запросов и предотвратить выгрузку исполняемого файла ClickHouse при высокой нагрузке на ввод-вывод.

:::note
Включение этой опции рекомендуется, но приведёт к увеличению времени запуска на несколько секунд. Имейте в виду, что этот параметр не будет работать без capability CAP&#95;IPC&#95;LOCK.
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```


## mlock_executable \{#mlock_executable\}

Выполняет `mlockall` после старта, чтобы снизить задержку первых запросов и предотвратить выгрузку исполняемого файла clickhouse из памяти при высокой нагрузке на ввод‑вывод.

:::note
Рекомендуется включать эту опцию, но это приведёт к увеличению времени запуска на несколько секунд.
Имейте в виду, что этот параметр не будет работать без capability &quot;CAP&#95;IPC&#95;LOCK&quot;.
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```


## mlock_executable_min_total_memory_amount_bytes \{#mlock_executable_min_total_memory_amount_bytes\}

<SettingsInfoBlock type="UInt64" default_value="5000000000" />Минимальный порог объёма памяти, необходимый для выполнения `<mlockall>`

## mmap_cache_size \{#mmap_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="1024" />

Этот параметр позволяет избежать частых вызовов open/close (которые очень затратны из‑за последующих пэйджфолтов) и повторно использовать отображения между несколькими потоками и запросами. Значение параметра — это количество отображённых участков памяти (обычно равное количеству отображённых файлов).

Объём данных в отображённых файлах можно отслеживать в следующих системных таблицах по следующим метрикам:

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells` в [`system.metrics`](/operations/system-tables/metrics), [`system.metric_log`](/operations/system-tables/metric_log)
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses` в [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)

:::note
Объём данных в отображённых файлах напрямую не занимает оперативную память и не учитывается в использовании памяти запросом или сервером, поскольку эта память может быть освобождена подобно кэшу страниц ОС. Кэш сбрасывается (файлы закрываются) автоматически при удалении старых частей в таблицах семейства MergeTree, также его можно сбросить вручную запросом `SYSTEM DROP MMAP CACHE`.

Этот параметр можно изменять во время работы сервера и изменения вступают в силу немедленно.
:::

## mutation_workload \{#mutation_workload\}

<SettingsInfoBlock type="String" default_value="default" />

Используется для регулирования того, как ресурсы используются и распределяются между мутациями и другими типами нагрузки. Указанное значение используется как значение настройки `workload` для всех фоновых мутаций. Может быть переопределено настройкой таблиц семейства MergeTree.

**См. также**

- [Планирование нагрузки](/operations/workload-scheduling.md)

## mysql_port \{#mysql_port\}

Порт для обмена данными с клиентами по протоколу MySQL.

:::note

* Положительные целые числа задают номер порта для прослушивания (ожидания входящих соединений)
* Пустое значение используется для отключения обмена данными с клиентами по протоколу MySQL.
  :::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```


## mysql_require_secure_transport \{#mysql_require_secure_transport\}

<SettingsInfoBlock type="Bool" default_value="0" />Если установлено значение true, для клиентских подключений через [mysql_port](/operations/server-configuration-parameters/settings#mysql_port) требуется защищённое соединение. Подключения с опцией `<--ssl-mode=none>` будут отклонены. Используйте вместе с настройками [OpenSSL](/operations/server-configuration-parameters/settings#openssl).

## mysql_require_secure_transport \{#mysql_require_secure_transport\}

Если значение параметра — `true`, для клиентов на [mysql_port](#mysql_port) требуется защищённое соединение. Подключения с опцией `--ssl-mode=none` будут отклоняться. Используйте этот параметр вместе с настройками [OpenSSL](#openssl).

## oom_score \{#oom_score\}

<SettingsInfoBlock type="Int32" default_value="0" />В системах Linux этот параметр может управлять работой OOM-killer.

## openSSL \{#openssl\}

Настройка SSL-клиента и сервера.

Поддержка SSL обеспечивается библиотекой `libpoco`. Доступные параметры настройки описаны в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи настроек сервера и клиента:

| Параметр                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Значение по умолчанию                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | Путь к файлу с закрытым ключом PEM-сертификата. Файл может одновременно содержать как ключ, так и сертификат.                                                                                                                                                                                                                                                                                                                                                                                                 |                                                                                            |
| `certificateFile`             | Путь к файлу сертификата клиента/сервера в формате PEM. Можно не указывать, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                            |
| `caConfig`                    | Путь к файлу или каталогу, содержащему доверенные сертификаты центра сертификации (CA). Если указан файл, он должен быть в формате PEM и может содержать несколько сертификатов CA. Если указан каталог, он должен содержать по одному файлу .pem на каждый сертификат CA. Имена файлов определяются по хеш-значению имени субъекта CA. Подробности можно найти на man-странице [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                                                                            |
| `verificationMode`            | Способ проверки сертификатов узла. Подробности см. в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                                                                                     | `relaxed`                                                                                  |
| `verificationDepth`           | Максимальная длина цепочки проверки сертификатов. Проверка завершится ошибкой, если длина цепочки сертификатов превысит заданное значение.                                                                                                                                                                                                                                                                                                                                                                    | `9`                                                                                        |
| `loadDefaultCAFile`           | Будут ли использоваться встроенные сертификаты ЦС для OpenSSL. ClickHouse предполагает, что встроенные сертификаты ЦС находятся в файле `/etc/ssl/cert.pem` (или, соответственно, в каталоге `/etc/ssl/certs`), либо в файле (соответственно, каталоге), указанном в переменной окружения `SSL_CERT_FILE` (соответственно, `SSL_CERT_DIR`).                                                                                                                                                                   | `true`                                                                                     |
| `cipherList`                  | Список поддерживаемых шифров OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | Включает или отключает кэширование сеансов. Параметр должен использоваться совместно с `sessionIdContext`. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                              | `false`                                                                                    |
| `sessionIdContext`            | Уникальный набор случайных символов, который сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Настоятельно рекомендуется задавать этот параметр, так как он помогает избежать проблем как при кэшировании сеансов на стороне сервера, так и когда клиент запрашивает кэширование.                                                                                                                                                | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | Максимальное число сеансов, кэшируемых сервером. Значение `0` означает неограниченное число сеансов.                                                                                                                                                                                                                                                                                                                                                                                                          | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | Время, в течение которого сервер кеширует сессию (в часах).                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                                                                        |
| `extendedVerification`        | Если параметр включён, проверяется, что CN или SAN сертификата совпадает с именем хоста узла-партнёра.                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                                                                    |
| `requireTLSv1`                | Требовать соединение по протоколу TLSv1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                | `false`                                                                                    |
| `requireTLSv1_1`              | Требовать подключение по TLSv1.1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                                                                    |
| `requireTLSv1_2`              | Требовать соединение по TLSv1.2. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                                                                    |
| `fips`                        | Активирует режим OpenSSL FIPS. Поддерживается, если используемая версия библиотеки OpenSSL поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                                                                    |
| `privateKeyPassphraseHandler` | Класс (подкласс PrivateKeyPassphraseHandler), запрашивающий парольную фразу для доступа к закрытому ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                                                        | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | Класс (подкласс CertificateHandler) для обработки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` .                                                                                                                                                                                                                                                                                                                 | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | Протоколы, использование которых запрещено.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |                                                                                            |
| `preferServerCiphers`         | Серверные шифры, предпочитаемые клиентом.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false`                                                                                    |

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
        <!-- Use for self-signed: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- Use for self-signed: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```


## openSSL.client.caConfig \{#openssl.client.caconfig\}

Путь к файлу или каталогу, содержащему доверенные сертификаты центра сертификации (CA). Если указано имя файла, он должен быть в формате PEM и может содержать несколько сертификатов CA. Если указан каталог, он должен содержать по одному файлу с расширением .pem на каждый сертификат CA. Имена файлов подбираются по хешу имени субъекта CA. Подробности можно найти на man-странице [SSL_CTX_load_verify_locations](https://docs.openssl.org/3.0/man3/SSL_CTX_load_verify_locations/).

## openSSL.client.cacheSessions \{#openssl.client.cachesessions\}

<SettingsInfoBlock type="Bool" default_value="0" />Включает или отключает кэширование сеансов. Должен использоваться в сочетании с `<sessionIdContext>`. Допустимые значения: `<true>`, `<false>`.

## openSSL.client.certificateFile \{#openssl.client.certificatefile\}

Путь к файлу сертификата клиента/сервера в формате PEM. Этот параметр можно не указывать, если в `<privateKeyFile>` содержится сертификат.

## openSSL.client.cipherList \{#openssl.client.cipherlist\}

<SettingsInfoBlock type="String" default_value="ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH" />Поддерживаемые шифры OpenSSL.

## openSSL.client.disableProtocols \{#openssl.client.disableprotocols\}

Протоколы, использование которых запрещено.

## openSSL.client.extendedVerification \{#openssl.client.extendedverification\}

<SettingsInfoBlock type="Bool" default_value="0" />Если параметр включён, проверяется, что значение поля CN или SAN сертификата соответствует имени хоста узла.

## openSSL.client.fips \{#openssl.client.fips\}

<SettingsInfoBlock type="Bool" default_value="0" />Активирует режим OpenSSL FIPS. Поддерживается, если версия библиотеки OpenSSL поддерживает FIPS.

## openSSL.client.invalidCertificateHandler.name \{#openssl.client.invalidcertificatehandler.name\}

<SettingsInfoBlock type="String" default_value="RejectCertificateHandler" />Класс (подкласс CertificateHandler) для обработки недействительных сертификатов. Например: `<<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>>`.

## openSSL.client.loadDefaultCAFile \{#openssl.client.loaddefaultcafile\}

<SettingsInfoBlock type="Bool" default_value="1" />Определяет, следует ли использовать встроенные CA-сертификаты для OpenSSL. ClickHouse по умолчанию считает, что встроенные CA-сертификаты находятся в файле `</etc/ssl/cert.pem>` (соответственно, в каталоге `</etc/ssl/certs>`) либо в файле (соответственно, каталоге), указанном в переменной окружения `<SSL_CERT_FILE>` (соответственно, `<SSL_CERT_DIR>`).

## openSSL.client.preferServerCiphers \{#openssl.client.preferserverciphers\}

<SettingsInfoBlock type="Bool" default_value="0" />Шифры сервера в порядке, предпочитаемом клиентом.

## openSSL.client.privateKeyFile \{#openssl.client.privatekeyfile\}

Путь к файлу с закрытым ключом PEM-сертификата. Файл может одновременно содержать как ключ, так и сертификат.

## openSSL.client.privateKeyPassphraseHandler.name \{#openssl.client.privatekeypassphrasehandler.name\}

<SettingsInfoBlock type="String" default_value="KeyConsoleHandler" />Класс (подкласс PrivateKeyPassphraseHandler), который запрашивает парольную фразу для доступа к закрытому ключу. Например: `<<privateKeyPassphraseHandler>>`, `<<name>KeyFileHandler</name>>`, `<<options><password>test</password></options>>`, `<</privateKeyPassphraseHandler>>`

## openSSL.client.requireTLSv1 \{#openssl.client.requiretlsv1\}

<SettingsInfoBlock type="Bool" default_value="0" />Требует соединения по TLSv1. Допустимые значения: `<true>`, `<false>`.

## openSSL.client.requireTLSv1_1 \{#openssl.client.requiretlsv1_1\}

<SettingsInfoBlock type="Bool" default_value="0" />Требует соединения по TLSv1.1. Допустимые значения: `<true>`, `<false>`.

## openSSL.client.requireTLSv1_2 \{#openssl.client.requiretlsv1_2\}

<SettingsInfoBlock type="Bool" default_value="0" />Требует соединения по TLSv1.2. Допустимые значения: `<true>`, `<false>`.

## openSSL.client.verificationDepth \{#openssl.client.verificationdepth\}

<SettingsInfoBlock type="UInt64" default_value="9" />Максимально допустимая длина цепочки проверки. Проверка завершится ошибкой, если длина цепочки сертификатов превысит заданное значение.

## openSSL.client.verificationMode \{#openssl.client.verificationmode\}

<SettingsInfoBlock type="String" default_value="relaxed" />Способ проверки сертификатов узла. Подробности приведены в описании класса [Context](https://github.com/ClickHouse/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `<none>`, `<relaxed>`, `<strict>`, `<once>`.

## openSSL.server.caConfig \{#openssl.server.caconfig\}

Путь к файлу или каталогу, содержащему доверенные сертификаты центров сертификации (CA). Если указан файл, он должен быть в формате PEM и может содержать несколько сертификатов CA. Если указан каталог, он должен содержать по одному файлу .pem на каждый сертификат CA. Имена файлов подбираются по хешу имени субъекта CA. Подробности можно найти на справочной странице man для [SSL_CTX_load_verify_locations](https://docs.openssl.org/3.0/man3/SSL_CTX_load_verify_locations/).

## openSSL.server.cacheSessions \{#openssl.server.cachesessions\}

<SettingsInfoBlock type="Bool" default_value="0" />Включает или отключает кэширование сеансов. Должен использоваться в сочетании с `<sessionIdContext>`. Допустимые значения: `<true>`, `<false>`.

## openSSL.server.certificateFile \{#openssl.server.certificatefile\}

Путь к файлу сертификата клиента/сервера в формате PEM. Можно не указывать, если `<privateKeyFile>` содержит сертификат.

## openSSL.server.cipherList \{#openssl.server.cipherlist\}

<SettingsInfoBlock type="String" default_value="ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH" />Поддерживаемые наборы шифров OpenSSL.

## openSSL.server.disableProtocols \{#openssl.server.disableprotocols\}

Протоколы, использование которых запрещено.

## openSSL.server.extendedVerification \{#openssl.server.extendedverification\}

<SettingsInfoBlock type="Bool" default_value="0" />Если параметр включён, проверяется, что CN или SAN в сертификате совпадает с именем хоста удалённого узла.

## openSSL.server.fips \{#openssl.server.fips\}

<SettingsInfoBlock type="Bool" default_value="0" />Активирует режим OpenSSL FIPS. Поддерживается, если версия библиотеки OpenSSL поддерживает FIPS.

## openSSL.server.invalidCertificateHandler.name \{#openssl.server.invalidcertificatehandler.name\}

<SettingsInfoBlock type="String" default_value="RejectCertificateHandler" />Класс (подкласс CertificateHandler), используемый для обработки недействительных сертификатов. Например: `<<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>>`.

## openSSL.server.loadDefaultCAFile \{#openssl.server.loaddefaultcafile\}

<SettingsInfoBlock type="Bool" default_value="1" />Определяет, будут ли использоваться встроенные CA‑сертификаты для OpenSSL. ClickHouse предполагает, что встроенные CA‑сертификаты находятся в файле `</etc/ssl/cert.pem>` (соответственно, в каталоге `</etc/ssl/certs>`) или в файле (соответственно, каталоге), указанном в переменной окружения `<SSL_CERT_FILE>` (соответственно, `<SSL_CERT_DIR>`).

## openSSL.server.preferServerCiphers \{#openssl.server.preferserverciphers\}

<SettingsInfoBlock type="Bool" default_value="0" />Серверные шифры, выбираемые в соответствии с предпочтениями клиента.

## openSSL.server.privateKeyFile \{#openssl.server.privatekeyfile\}

Путь к файлу с закрытым ключом PEM‑сертификата. Файл может одновременно содержать и ключ, и сертификат.

## openSSL.server.privateKeyPassphraseHandler.name \{#openssl.server.privatekeypassphrasehandler.name\}

<SettingsInfoBlock type="String" default_value="KeyConsoleHandler" />Класс (наследник PrivateKeyPassphraseHandler), который запрашивает парольную фразу для доступа к закрытому ключу. Например: `<<privateKeyPassphraseHandler>>`, `<<name>KeyFileHandler</name>>`, `<<options><password>test</password></options>>`, `<</privateKeyPassphraseHandler>>`

## openSSL.server.requireTLSv1 \{#openssl.server.requiretlsv1\}

<SettingsInfoBlock type="Bool" default_value="0" />Требует соединения по протоколу TLSv1. Допустимые значения: `<true>`, `<false>`.

## openSSL.server.requireTLSv1_1 \{#openssl.server.requiretlsv1_1\}

<SettingsInfoBlock type="Bool" default_value="0" />Требует соединения TLSv1.1. Допустимые значения: `<true>`, `<false>`.

## openSSL.server.requireTLSv1_2 \{#openssl.server.requiretlsv1_2\}

<SettingsInfoBlock type="Bool" default_value="0" />Требует соединения по протоколу TLSv1.2. Допустимые значения: `<true>`, `<false>`.

## openSSL.server.sessionCacheSize \{#openssl.server.sessioncachesize\}

<SettingsInfoBlock type="UInt64" default_value="20480" />Максимальное число сеансов, которые сервер может кэшировать. Значение 0 означает неограниченное количество сеансов.

## openSSL.server.sessionIdContext \{#openssl.server.sessionidcontext\}

<SettingsInfoBlock type="String" default_value="application.name" />Уникальная последовательность случайных символов, которую сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `<SSL_MAX_SSL_SESSION_ID_LENGTH>`. Настоятельно рекомендуется всегда задавать этот параметр, поскольку он помогает избежать проблем как при кэшировании сеанса на сервере, так и при запросе кэширования со стороны клиента.

## openSSL.server.sessionTimeout \{#openssl.server.sessiontimeout\}

<SettingsInfoBlock type="UInt64" default_value="2" />Время кэширования сеанса на сервере в часах.

## openSSL.server.verificationDepth \{#openssl.server.verificationdepth\}

<SettingsInfoBlock type="UInt64" default_value="9" />Максимальная длина цепочки проверки сертификатов. Проверка завершится с ошибкой, если длина цепочки сертификатов превысит установленное значение.

## openSSL.server.verificationMode \{#openssl.server.verificationmode\}

<SettingsInfoBlock type="String" default_value="relaxed" />Метод проверки сертификатов узла. Подробности см. в описании класса [Context](https://github.com/ClickHouse/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `<none>`, `<relaxed>`, `<strict>`, `<once>`.

## opentelemetry_span_log \{#opentelemetry_span_log\}

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


## os_collect_psi_metrics \{#os_collect_psi_metrics\}

<SettingsInfoBlock type="Bool" default_value="1" />Включить сбор метрик PSI из файлов /proc/pressure/.

## os_cpu_busy_time_threshold \{#os_cpu_busy_time_threshold\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />Порог занятого времени CPU операционной системы в микросекундах (метрика OSCPUVirtualTimeMicroseconds), при превышении которого считается, что CPU выполняет полезную работу; перегрузка CPU не будет зафиксирована, если занятое время ниже этого значения.

## os_threads_nice_value_distributed_cache_tcp_handler \{#os_threads_nice_value_distributed_cache_tcp_handler\}

<SettingsInfoBlock type="Int32" default_value="0" />

Значение `nice` в Linux для потоков обработчика TCP распределённого кэша. Чем меньше значение, тем выше приоритет по ЦП.

Требуются права CAP_SYS_NICE, иначе параметр не оказывает эффекта (no-op).

Возможные значения: от -20 до 19.

## os_threads_nice_value_merge_mutate \{#os_threads_nice_value_merge_mutate\}

<SettingsInfoBlock type="Int32" default_value="0" />

Значение `nice` в Linux для потоков слияния и мутаций. Более низкие значения означают более высокий приоритет для CPU.

Требуются привилегии CAP_SYS_NICE, в противном случае параметр не оказывает эффекта.

Возможные значения: от -20 до 19.

## os_threads_nice_value_zookeeper_client_send_receive \{#os_threads_nice_value_zookeeper_client_send_receive\}

<SettingsInfoBlock type="Int32" default_value="0" />

Значение `nice` в Linux для потоков отправки и приёма в клиенте ZooKeeper. Более низкие значения означают более высокий приоритет по ЦП.

Требуется capability CAP_SYS_NICE, в противном случае параметр не оказывает эффекта.

Возможные значения: от -20 до 19.

## page_cache_free_memory_ratio \{#page_cache_free_memory_ratio\}

<SettingsInfoBlock type="Double" default_value="0.15" />Доля лимита памяти, которую следует резервировать, не используя под пользовательский кэш страниц (userspace page cache). Аналогично параметру Linux min_free_kbytes.

## page_cache_history_window_ms \{#page_cache_history_window_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />Задержка перед тем, как освобождённая память может быть использована кэшем страниц в пространстве пользователя.

## page_cache_max_size \{#page_cache_max_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальный размер кэша страниц в пользовательском пространстве. Установите 0, чтобы отключить кэш. Если значение больше page_cache_min_size, размер кэша будет динамически изменяться в этих пределах, чтобы использовать большую часть доступной памяти, при этом удерживая общее потребление памяти ниже лимита (max_server_memory_usage[_to_ram_ratio]).

## page_cache_min_size \{#page_cache_min_size\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />Минимальный размер кэша страниц в пространстве пользователя.

## page_cache_policy \{#page_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кеша страниц в пространстве пользователя.

## page_cache_shards \{#page_cache_shards\}

<SettingsInfoBlock type="UInt64" default_value="4" />Распределяет пользовательский кэш страниц (userspace page cache) по указанному числу сегментов, чтобы уменьшить конкуренцию за мьютексы. Экспериментальная опция, маловероятно, что она даст прирост производительности.

## page_cache_size_ratio \{#page_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди в кэше страниц в пространстве пользователя относительно общего размера кэша.

## part_log \{#part_log\}

Журналирование событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md), например добавления или слияния данных. Вы можете использовать этот лог для моделирования алгоритмов слияния и сравнения их характеристик. Также можно визуализировать процесс слияния.

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


## parts_kill_delay_period \{#parts_kill_delay_period\}

<SettingsInfoBlock type="UInt64" default_value="30" />

Период, через который полностью удаляются части для SharedMergeTree. Доступно только в ClickHouse Cloud.

## parts_kill_delay_period_random_add \{#parts_kill_delay_period_random_add\}

<SettingsInfoBlock type="UInt64" default_value="10" />

Добавляет к параметру kill_delay_period равномерно распределённое значение от 0 до x секунд, чтобы избежать эффекта «thundering herd» и последующей DoS-атаки на ZooKeeper при очень большом количестве таблиц. Этот параметр доступен только в ClickHouse Cloud.

## parts_killer_pool_size \{#parts_killer_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="128" />

Потоки для очистки устаревших частей в общем хранилище SharedMergeTree. Доступно только в ClickHouse Cloud

## path \{#path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/" />

Путь к каталогу, содержащему данные.

:::note
Конечный слэш обязателен.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```


## path \{#path\}

Путь к каталогу, содержащему данные.

:::note
Слеш в конце пути обязателен.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```


## postgresql_port \{#postgresql_port\}

Порт для взаимодействия с клиентами по протоколу PostgreSQL.

:::note

* Положительные целые числа указывают номер порта для прослушивания.
* Пустые значения используются для отключения взаимодействия с клиентами по протоколу PostgreSQL.
  :::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```


## postgresql_require_secure_transport \{#postgresql_require_secure_transport\}

<SettingsInfoBlock type="Bool" default_value="0" />Если установлено значение true, для работы с клиентами по [postgresql_port](/operations/server-configuration-parameters/settings#postgresql_port) требуется защищённое соединение. Подключение с опцией `<sslmode=disable>` будет отклонено. Используйте совместно с настройками [OpenSSL](/operations/server-configuration-parameters/settings#openssl).

## postgresql_require_secure_transport \{#postgresql_require_secure_transport\}

Если имеет значение `true`, для взаимодействия с клиентами через [postgresql_port](#postgresql_port) требуется защищённое соединение. Подключения с опцией `sslmode=disable` будут отклоняться. Используйте этот параметр совместно с настройками [OpenSSL](#openssl).

## prefetch_threadpool_pool_size \{#prefetch_threadpool_pool_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />Размер фонового пула для предварительного чтения (prefetch) из удалённых объектных хранилищ

## prefetch_threadpool_queue_size \{#prefetch_threadpool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно поставить в очередь пула потоков предварительной выборки

## prefixes_deserialization_thread_pool_thread_pool_queue_size \{#prefixes_deserialization_thread_pool_thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество задач, которые могут находиться в очереди пула потоков десериализации префиксов.

:::note
Значение `0` означает отсутствие ограничения.
:::

## prepare_system_log_tables_on_startup \{#prepare_system_log_tables_on_startup\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение равно `true`, ClickHouse создает все настроенные таблицы `system.*_log` перед запуском сервера. Это может быть полезно, если некоторые скрипты инициализации зависят от этих таблиц.

## primary_index_cache_policy \{#primary_index_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики кэширования первичного индекса.

## primary_index_cache_prewarm_ratio \{#primary_index_cache_prewarm_ratio\}

<SettingsInfoBlock type="Double" default_value="0.95" />Доля общего размера кэша меток, которую нужно заполнить при предварительном прогреве.

## primary_index_cache_size \{#primary_index_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />Максимальный размер кэша первичного индекса (индекса семейства таблиц MergeTree).

## primary_index_cache_size_ratio \{#primary_index_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (при использовании политики SLRU) в кэше первичного индекса по отношению к общему размеру кэша.

## process_query_plan_packet \{#process_query_plan_packet\}

<SettingsInfoBlock type="Bool" default_value="0" />

Этот параметр позволяет считывать пакет QueryPlan. Этот пакет отправляется при выполнении распределённых запросов, когда включён `serialize_query_plan`.
По умолчанию параметр отключён, чтобы избежать возможных проблем с безопасностью, которые могут быть вызваны ошибками при двоичной десериализации плана запроса.

**Пример**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```


## processors_profile_log \{#processors_profile_log\}

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


## prometheus \{#prometheus\}

Публикация данных метрик для опроса системой [Prometheus](https://prometheus.io).

Настройки:

* `endpoint` – HTTP-эндпоинт для сбора метрик сервером Prometheus. Должен начинаться с &#39;/&#39;.
* `port` – Порт для `endpoint`.
* `metrics` – Публиковать метрики из таблицы [system.metrics](/operations/system-tables/metrics).
* `events` – Публиковать метрики из таблицы [system.events](/operations/system-tables/events).
* `asynchronous_metrics` – Публиковать текущие значения метрик из таблицы [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics).
* `errors` - Публиковать число ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эти данные также можно получить из таблицы [system.errors](/operations/system-tables/errors).

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

Проверьте, заменив `127.0.0.1` на IP-адрес или имя хоста сервера ClickHouse:

```bash
curl 127.0.0.1:9363/metrics
```


## prometheus.keeper_metrics_only \{#prometheus.keeper_metrics_only\}

<SettingsInfoBlock type="Bool" default_value="0" />Экспортировать метрики, относящиеся к ClickHouse Keeper

## proxy \{#proxy\}

Определите прокси‑серверы для HTTP‑ и HTTPS‑запросов, в настоящее время поддерживаемые хранилищем S3, табличными функциями S3 и функциями URL.

Есть три способа задать прокси‑серверы:

* переменные окружения
* списки прокси
* удалённые резолверы прокси.

Обход прокси‑серверов для конкретных хостов также поддерживается с помощью `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать
прокси‑сервер для данного протокола. Если они заданы в вашей системе, всё должно работать прозрачно.

Это самый простой подход, если для данного протокола есть
только один прокси‑сервер и этот прокси‑сервер не меняется.

**Списки прокси**

Этот подход позволяет указать один или несколько
прокси‑серверов для протокола. Если задано более одного прокси‑сервера,
ClickHouse использует различные прокси по очереди (round‑robin), распределяя
нагрузку между серверами. Это самый простой подход, если для протокола
существует более одного прокси‑сервера и список прокси‑серверов не меняется.

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

Выберите родительское поле во вкладках ниже, чтобы просмотреть их дочерние элементы:

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

Прокси-серверы могут динамически меняться. В этом случае можно определить конечную точку (endpoint) резолвера. ClickHouse отправляет пустой запрос GET на эту конечную точку, а удалённый резолвер должен вернуть хост прокси.
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
    | Поле         | Описание                              |
    | ------------ | ------------------------------------- |
    | `<resolver>` | Endpoint и другие параметры резолвера |

    :::note
    Вы можете указать несколько элементов `<resolver>`, но используется
    только первый `<resolver>` для данного протокола. Любые другие
    элементы `<resolver>` для этого протокола игнорируются. Это означает,
    что балансировку нагрузки (если она требуется) должен реализовывать
    удалённый резолвер.
    :::
  </TabItem>

  <TabItem value="resolver" label="<resolver>">
    | Поле                 | Описание                                                                                                                                                                                                                |
    | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `<endpoint>`         | URI прокси-резолвера                                                                                                                                                                                                    |
    | `<proxy_scheme>`     | Протокол итогового URI прокси. Может принимать значения `http` или `https`.                                                                                                                                             |
    | `<proxy_port>`       | Номер порта прокси-резолвера                                                                                                                                                                                            |
    | `<proxy_cache_time>` | Время в секундах, в течение которого значения, полученные от резолвера, должны кэшироваться ClickHouse. Установка этого значения в `0` заставляет ClickHouse обращаться к резолверу при каждом HTTP- или HTTPS-запросе. |
  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:

| Порядок | Параметр                   |
| ------- | -------------------------- |
| 1.      | Удалённые прокси-резолверы |
| 2.      | Списки прокси-серверов     |
| 3.      | Переменные окружения       |


ClickHouse будет проверять тип резолвера с наивысшим приоритетом для протокола запроса. Если он не определён,
ClickHouse проверит следующий по приоритету тип резолвера и так далее, пока не будет достигнут резолвер окружения.
Это также позволяет сочетать разные типы резолверов.

## query_cache \{#query_cache\}

Конфигурация [кэша запросов](../query-cache.md).

Доступны следующие настройки:

| Setting                   | Description                                                                                         | Default Value |
| ------------------------- | --------------------------------------------------------------------------------------------------- | ------------- |
| `max_size_in_bytes`       | Максимальный размер кэша в байтах. Значение `0` означает, что кэш запросов отключен.                | `1073741824`  |
| `max_entries`             | Максимальное число результатов запросов `SELECT`, сохраняемых в кэше.                               | `1024`        |
| `max_entry_size_in_bytes` | Максимальный размер в байтах результатов запросов `SELECT`, которые могут быть сохранены в кэше.    | `1048576`     |
| `max_entry_size_in_rows`  | Максимальное количество строк в результатах запросов `SELECT`, которые могут быть сохранены в кэше. | `30000000`    |

:::note

* Изменённые настройки вступают в силу немедленно.
* Память под данные кэша запросов выделяется в DRAM. Если память ограничена, установите небольшое значение для `max_size_in_bytes` или полностью отключите кэш запросов.
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


## query_cache.max_entries \{#query_cache.max_entries\}

<SettingsInfoBlock type="UInt64" default_value="1024" />Максимальное количество результатов запросов SELECT, хранящихся в кэше.

## query_cache.max_entry_size_in_bytes \{#query_cache.max_entry_size_in_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />Максимальный допустимый размер в байтах результатов запроса SELECT, которые могут быть сохранены в кэше.

## query_cache.max_entry_size_in_rows \{#query_cache.max_entry_size_in_rows\}

<SettingsInfoBlock type="UInt64" default_value="30000000" />Максимальное количество строк в результатах запроса SELECT, которые могут быть сохранены в кэше.

## query_cache.max_size_in_bytes \{#query_cache.max_size_in_bytes\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Максимальный размер кэша в байтах. 0 означает, что кэш запросов отключен.

## query_condition_cache_policy \{#query_condition_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша условий запроса.

## query_condition_cache_size \{#query_condition_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="104857600" />

Максимальный размер кэша условий запроса.
:::note
Этот параметр можно изменить во время работы, и изменение вступит в силу немедленно.
:::

## query_condition_cache_size_ratio \{#query_condition_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше условий запроса по отношению к общему размеру кэша.

## query_log \{#query_log\}

Настройка для логирования запросов, полученных при включённой настройке [log&#95;queries=1](../../operations/settings/settings.md).

Запросы записываются в таблицу [system.query&#95;log](/operations/system-tables/query_log), а не в отдельный файл. Вы можете изменить имя таблицы с помощью параметра `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура журнала запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, а новая таблица будет создана автоматически.

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


## query_masking_rules \{#query_masking_rules\}

Основанные на регулярных выражениях правила, которые будут применяться к запросам, а также ко всем сообщениям журналов перед их сохранением в серверные журналы,
таблицы [`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) и в журналы, отправляемые клиенту. Это позволяет предотвратить утечку конфиденциальных данных из SQL-запросов, таких как имена, адреса электронной почты, персональные идентификаторы или номера кредитных карт, в журналы.

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

| Setting   | Description                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------- |
| `name`    | имя правила (необязательно)                                                                    |
| `regexp`  | регулярное выражение, совместимое с RE2 (обязательно)                                          |
| `replace` | строка подстановки для конфиденциальных данных (необязательно, по умолчанию — шесть звездочек) |

Правила маскирования применяются ко всему запросу (чтобы предотвратить утечки конфиденциальных данных из некорректных / неразбираемых запросов).

В таблице [`system.events`](/operations/system-tables/events) есть счётчик `QueryMaskingRulesMatch`, который содержит общее число срабатываний правил маскирования запросов.

Для распределённых запросов каждый сервер должен быть настроен отдельно, иначе подзапросы, передаваемые на другие
узлы, будут сохраняться без маскирования.


## query_metric_log \{#query_metric_log\}

По умолчанию он отключен.

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


## query_thread_log \{#query_thread_log\}

Настройка для логирования потоков запросов при включённой настройке [log&#95;query&#95;threads=1](/operations/settings/settings#log_query_threads).

Запросы логируются в таблицу [system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log), а не в отдельный файл. Вы можете изменить имя таблицы с помощью параметра `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура журнала потоков запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, а новая — создана автоматически.

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


## query_views_log \{#query_views_log\}

Настройка ведения журнала представлений (live, materialized и т. д.), управление которой осуществляется параметром [log&#95;query&#95;views=1](/operations/settings/settings#log_query_views).

Запросы записываются в таблицу [system.query&#95;views&#95;log](/operations/system-tables/query_views_log), а не в отдельный файл. Вы можете изменить имя таблицы с помощью параметра `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура журнала представлений запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, а новая таблица создана автоматически.

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


## remap_executable \{#remap_executable\}

<SettingsInfoBlock type="Bool" default_value="0" />

Настройка для переразмещения памяти под машинный код (&quot;text&quot;) с использованием больших страниц.

:::note
Это крайне экспериментальная функция.
:::

**Пример**

```xml
<remap_executable>false</remap_executable>
```


## remap_executable \{#remap_executable\}

Настройка для перераспределения памяти под машинный код (сегмент &quot;text&quot;) с использованием больших страниц.

:::note
Эта функция является крайне экспериментальной.
:::

Пример:

```xml
<remap_executable>false</remap_executable>
```


## remote_servers \{#remote_servers\}

Конфигурация кластеров, используемых табличным движком [Distributed](../../engines/table-engines/special/distributed.md) и табличной функцией `cluster`.

**Пример**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

Значение атрибута `incl` см. в разделе &quot;[Конфигурационные файлы](/operations/configuration-files)&quot;.

**См. также**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [Обнаружение кластера](../../operations/cluster-discovery.md)
* [Движок реплицируемой базы данных](../../engines/database-engines/replicated.md)


## remote_url_allow_hosts \{#remote_url_allow_hosts\}

Список хостов, которые разрешено использовать в движках хранения и табличных функциях, работающих с URL.

При добавлении хоста с xml-тегом `\<host\>`:

* он должен быть указан в точности так же, как в URL, поскольку имя проверяется до разрешения DNS-имени. Например: `<host>clickhouse.com</host>`
* если порт явно указан в URL, то проверяется пара host:port целиком. Например: `<host>clickhouse.com:80</host>`
* если хост указан без порта, то разрешён любой порт данного хоста. Например: если указан `<host>clickhouse.com</host>`, то `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т. д. разрешены.
* если хост указан как IP-адрес, то он проверяется так, как указан в URL. Например: `[2a02:6b8:a::a]`.
* если есть перенаправления и поддержка перенаправлений включена, то каждое перенаправление (поле `location`) проверяется.

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


## replica_group_name \{#replica_group_name\}

Имя группы реплик для базы данных Replicated.

Кластер, создаваемый базой данных Replicated, будет состоять из реплик в одной группе.
DDL-запросы будут дожидаться только реплик из той же группы.

По умолчанию — пустое значение.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```


## replicated_fetches_http_connection_timeout \{#replicated_fetches_http_connection_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />Таймаут HTTP-соединения для запросов на выборку частей. Наследуется из профиля по умолчанию `http_connection_timeout`, если не задан явно.

## replicated_fetches_http_receive_timeout \{#replicated_fetches_http_receive_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />Таймаут ожидания получения HTTP-ответа для запросов на получение кусков данных. Наследуется от профиля по умолчанию `http_receive_timeout`, если не задан явно.

## replicated_fetches_http_send_timeout \{#replicated_fetches_http_send_timeout\}

<SettingsInfoBlock type="Seconds" default_value="0" />Тайм-аут отправки HTTP-запросов при получении частей. Наследуется из профиля по умолчанию `http_send_timeout`, если не задан явно.

## replicated_merge_tree \{#replicated_merge_tree\}

Тонкая настройка для таблиц в [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Этот параметр имеет более высокий приоритет.

Для получения дополнительной информации см. заголовочный файл MergeTreeSettings.h.

**Пример**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```


## restore_threads \{#restore_threads\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />Максимальное количество потоков при выполнении запросов RESTORE.

## s3_credentials_provider_max_cache_size \{#s3_credentials_provider_max_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="100" />Максимальное число провайдеров учётных данных S3, которые могут храниться в кэше

## s3_max_redirects \{#s3_max_redirects\}

<SettingsInfoBlock type="UInt64" default_value="10" />Максимальное число допустимых переходов при перенаправлениях S3.

## s3_retry_attempts \{#s3_retry_attempts\}

<SettingsInfoBlock type="UInt64" default_value="500" />Параметр для Aws::Client::RetryStrategy; повторные попытки выполняются самим Aws::Client, 0 — без повторных попыток

## s3queue_disable_streaming \{#s3queue_disable_streaming\}

<SettingsInfoBlock type="Bool" default_value="0" />Отключает потоковую обработку (streaming) в S3Queue, даже если таблица уже создана и к ней присоединены материализованные представления

## s3queue_log \{#s3queue_log\}

Параметры системной таблицы `s3queue_log`.

<SystemLogParameters />

Параметры по умолчанию:

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```


## send_crash_reports \{#send_crash_reports\}

Настройки отправки отчётов о сбоях команде разработчиков ядра ClickHouse.

Включение этой функции, особенно в предпродакшн-средах, крайне приветствуется.

Ключи:

| Key                   | Description                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`             | Логический флаг для включения функции, по умолчанию `true`. Установите в `false`, чтобы отключить отправку отчётов о сбоях.                  |
| `send_logical_errors` | `LOGICAL_ERROR` похожа на `assert`: это ошибка в ClickHouse. Этот логический флаг включает отправку таких исключений (по умолчанию: `true`). |
| `endpoint`            | Вы можете переопределить URL конечной точки для отправки отчётов о сбоях.                                                                    |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


## series_keeper_path \{#series_keeper_path\}

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />

Путь в Keeper, под которым размещаются автоинкрементируемые числовые идентификаторы, генерируемые функцией `generateSerialID`. Каждая серия будет отдельным узлом по этому пути.

## show_addresses_in_stack_traces \{#show_addresses_in_stack_traces\}

<SettingsInfoBlock type="Bool" default_value="1" />Если параметр имеет значение true, в трассировках стека отображаются адреса

## shutdown_wait_backups_and_restores \{#shutdown_wait_backups_and_restores\}

<SettingsInfoBlock type="Bool" default_value="1" />Если установлено значение true, ClickHouse будет дожидаться завершения выполняющихся операций резервного копирования и восстановления перед завершением работы.

## shutdown_wait_unfinished \{#shutdown_wait_unfinished\}

<SettingsInfoBlock type="UInt64" default_value="5" />Время ожидания незавершённых запросов в секундах

## shutdown_wait_unfinished_queries \{#shutdown_wait_unfinished_queries\}

<SettingsInfoBlock type="Bool" default_value="0" />Если установлено значение `true`, ClickHouse будет дожидаться завершения выполняющихся запросов перед остановкой.

## skip_binary_checksum_checks \{#skip_binary_checksum_checks\}

<SettingsInfoBlock type="Bool" default_value="0" />Пропускает проверки целостности контрольных сумм исполняемого файла ClickHouse

## skip_check_for_incorrect_settings \{#skip_check_for_incorrect_settings\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение параметра установлено в true, настройки сервера не будут проверяться на корректность.

**Пример**

```xml
<skip_check_for_incorrect_settings>1</skip_check_for_incorrect_settings>
```


## ssh_server \{#ssh_server\}

Публичная часть ключа хоста будет записана в файл known&#95;hosts
на стороне SSH-клиента при первом подключении.

Настройки ключа хоста по умолчанию неактивны.
Раскомментируйте настройки ключа хоста и укажите путь к соответствующему SSH-ключу, чтобы их активировать:

Пример:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```


## startup_mv_delay_ms \{#startup_mv_delay_ms\}

<SettingsInfoBlock type="UInt64" default_value="0" />Отладочный параметр для моделирования задержки при создании материализованного представления

## startup_scripts.throw_on_error \{#startup_scripts.throw_on_error\}

<SettingsInfoBlock type="Bool" default_value="0" />Если параметр имеет значение `true`, сервер не запустится, если во время выполнения скрипта произойдет ошибка.

## storage_configuration \{#storage_configuration\}

Позволяет настроить многодисковую конфигурацию подсистемы хранения.

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


### Настройка дисков \{#configuration-of-disks\}

Настройка `disks` имеет следующую структуру:

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

| Параметр                | Описание                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| `<disk_name_N>`         | Имя диска, которое должно быть уникальным.                                                                  |
| `path`                  | Путь, по которому будут храниться данные сервера (каталоги `data` и `shadow`). Должен заканчиваться на `/`. |
| `keep_free_space_bytes` | Размер зарезервированного свободного места на диске.                                                        |

:::note
Порядок дисков не имеет значения.
:::


### Конфигурация политик \{#configuration-of-policies\}

Подтеги выше определяют следующие настройки для `policies`:

| Параметр                     | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `volume_name_N`              | Имя тома. Имена томов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `disk`                       | Диск, расположенный внутри тома.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `max_data_part_size_bytes`   | Максимальный размер фрагмента данных, который может находиться на любом из дисков в этом томе. Если результат слияния приводит к ожидаемому размеру фрагмента, превышающему `max_data_part_size_bytes`, фрагмент будет записан в следующий том. По сути, эта функция позволяет хранить новые / небольшие фрагменты на горячем (SSD) томе и перемещать их на холодный (HDD) том, когда они достигают большого размера. Не используйте эту опцию, если в политике только один том.                          |
| `move_factor`                | Доля доступного свободного пространства на томе. Если пространства становится меньше, данные начнут переноситься на следующий том, если он существует. Для переноса фрагменты сортируются по размеру от большего к меньшему (по убыванию) и выбираются фрагменты, суммарный размер которых достаточен для удовлетворения условия `move_factor`; если суммарный размер всех фрагментов недостаточен, будут перенесены все фрагменты.                                                                 |
| `perform_ttl_move_on_insert` | Отключает перемещение данных с истёкшим TTL при вставке. По умолчанию (если включено), если мы вставляем часть данных, срок жизни которой уже истёк в соответствии с правилом перемещения по времени жизни, она немедленно перемещается на том / диск, указанный в правиле перемещения. Это может существенно замедлить вставку, если целевой том / диск медленный (например, S3). Если опция отключена, просроченная часть данных записывается на том по умолчанию, а затем немедленно перемещается на том, указанный в правиле для истёкшего TTL. |
| `load_balancing`             | Политика балансировки дисков: `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `least_used_ttl_ms`          | Устанавливает таймаут (в миллисекундах) для обновления доступного пространства на всех дисках (`0` — всегда обновлять, `-1` — никогда не обновлять, значение по умолчанию — `60000`). Обратите внимание: если диск используется только ClickHouse и не будет подвержен динамическому изменению размера файловой системы, вы можете использовать значение `-1`. Во всех остальных случаях это не рекомендуется, так как в итоге приведёт к некорректному распределению пространства.                         |
| `prefer_not_to_merge`        | Отключает слияние частей данных на этом томе. Примечание: это потенциально опасно и может вызвать замедление. Когда этот параметр включён (не делайте этого), слияние данных на этом томе запрещено (что плохо). Это позволяет контролировать, как ClickHouse взаимодействует с медленными дисками. Мы рекомендуем вообще не использовать эту настройку.                                                                                                                                                               |
| `volume_priority`            | Определяет приоритет (порядок), в котором заполняются тома. Чем меньше значение, тем выше приоритет. Значения параметра должны быть натуральными числами и покрывать диапазон от 1 до N (где N — наибольшее указанное значение параметра) без пропусков.                                                                                                                                                                                                                                                      |

Для `volume_priority`:

- Если все тома имеют этот параметр, они получают приоритет в указанном порядке.
- Если только _некоторые_ тома имеют его, тома без этого параметра получают наименьший приоритет. Те, у которых он есть, ранжируются в соответствии со значением тега, приоритет остальных определяется порядком их описания в конфигурационном файле относительно друг друга.
- Если _ни одному_ тому этот параметр не задан, их порядок определяется порядком описания в конфигурационном файле.
- Приоритеты томов могут не совпадать.

## storage_connections_hard_limit \{#storage_connections_hard_limit\}

<SettingsInfoBlock type="UInt64" default_value="200000" />При достижении этого лимита при попытке создания соединения выбрасывается исключение. Установите 0, чтобы отключить жесткий предел. Лимит применяется к соединениям хранилищ.

## storage_connections_soft_limit \{#storage_connections_soft_limit\}

<SettingsInfoBlock type="UInt64" default_value="100" />Подключения, превышающие этот лимит, имеют существенно более короткое время жизни. Лимит применяется к подключениям хранилищ.

## storage_connections_store_limit \{#storage_connections_store_limit\}

<SettingsInfoBlock type="UInt64" default_value="1000" />Подключения сверх этого лимита сбрасываются после использования. Установите значение 0, чтобы отключить кэш подключений. Лимит применяется к подключениям к хранилищам.

## storage_connections_warn_limit \{#storage_connections_warn_limit\}

<SettingsInfoBlock type="UInt64" default_value="500" />Предупреждающие сообщения записываются в логи, если количество активных подключений превышает этот предел. Предел применяется к подключениям к хранилищам.

## storage_metadata_write_full_object_key \{#storage_metadata_write_full_object_key\}

<SettingsInfoBlock type="Bool" default_value="1" />Записывать файлы метаданных диска в формате VERSION_FULL_OBJECT_KEY. Включено по умолчанию. Настройка устарела.

## storage_shared_set_join_use_inner_uuid \{#storage_shared_set_join_use_inner_uuid\}

<SettingsInfoBlock type="Bool" default_value="1" />Если параметр включён, при создании SharedSet и SharedJoin генерируется внутренний UUID. Только для ClickHouse Cloud.

## table_engines_require_grant \{#table_engines_require_grant\}

Если установлено в значение true, пользователям требуется GRANT для создания таблицы с определённым табличным движком, например: `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию, для обеспечения обратной совместимости, при создании таблицы с конкретным табличным движком требование GRANT игнорируется, однако вы можете изменить это поведение, установив параметр в true.
:::

## tables_loader_background_pool_size \{#tables_loader_background_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает количество потоков, выполняющих асинхронные задачи по загрузке в фоновом пуле. Фоновый пул используется для асинхронной загрузки таблиц после запуска сервера, если нет запросов, ожидающих эту таблицу. При большом количестве таблиц может быть полезно держать небольшое количество потоков в фоновом пуле. Это позволит зарезервировать ресурсы CPU для конкурентного выполнения запросов.

:::note
Значение `0` означает, что будут использоваться все доступные CPU.
:::

## tables_loader_foreground_pool_size \{#tables_loader_foreground_pool_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Задаёт количество потоков, выполняющих задания загрузки в пуле foreground. Пул foreground используется для синхронной загрузки таблиц до того, как сервер начнёт прослушивать порт, а также для загрузки таблиц, загрузку которых явно ожидают. Пул foreground имеет более высокий приоритет, чем пул background. Это означает, что никакие задания не запускаются в пуле background, пока в пуле foreground выполняются задания.

:::note
Значение `0` означает, что будут использованы все доступные ядра CPU.
:::

## tcp_close_connection_after_queries_num \{#tcp_close_connection_after_queries_num\}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальное количество запросов по одному TCP‑соединению, после которого соединение будет закрыто. Установите значение 0 для неограниченного числа запросов.

## tcp_close_connection_after_queries_seconds \{#tcp_close_connection_after_queries_seconds\}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальное время жизни TCP‑соединения в секундах до его закрытия. Установите значение 0 для неограниченного времени жизни соединения.

## tcp_port \{#tcp_port\}

Порт для связи с клиентами по протоколу TCP.

**Пример**

```xml
<tcp_port>9000</tcp_port>
```


## tcp_port_secure \{#tcp_port_secure\}

TCP-порт для защищённого взаимодействия с клиентами. Используйте его с настройками [OpenSSL](#openssl).

**Значение по умолчанию**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```


## tcp_ssh_port \{#tcp_ssh_port\}

Порт SSH-сервера, который позволяет пользователю подключаться и выполнять запросы в интерактивном режиме с использованием встроенного клиента по PTY.

Пример:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


## temporary_data_in_cache \{#temporary_data_in_cache\}

С этой опцией временные данные будут храниться в кэше для конкретного диска.
В этом разделе необходимо указать имя диска с типом `cache`.
В этом случае кэш и временные данные будут использовать одно и то же пространство, и кэш диска может быть вытеснен, освобождая место под временные данные.

:::note
Для настройки хранения временных данных можно использовать только одну из следующих опций: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
:::

**Пример**

И кэш для `local_disk`, и временные данные будут храниться в каталоге `/tiny_local_cache` файловой системы, управляемой `tiny_local_cache`.

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


## temporary_data_in_distributed_cache \{#temporary_data_in_distributed_cache\}

<SettingsInfoBlock type="Bool" default_value="0" />Хранит временные данные в распределённом кэше.

## text_index_dictionary_block_cache_max_entries \{#text_index_dictionary_block_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />Размер кэша для блока словаря текстового индекса в элементах. Ноль — кэш отключён.

## text_index_dictionary_block_cache_policy \{#text_index_dictionary_block_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования блоков словаря текстового индекса.

## text_index_dictionary_block_cache_size \{#text_index_dictionary_block_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Размер кэша блоков словаря текстового индекса. Значение 0 означает, что кэш отключён.

:::note
Этот параметр можно изменять во время работы сервера, и изменения вступают в силу немедленно.
:::

## text_index_dictionary_block_cache_size_ratio \{#text_index_dictionary_block_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае политики SLRU) в кэше блоков словаря текстового индекса относительно общего размера кэша.

## text_index_header_cache_max_entries \{#text_index_header_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="100000" />Размер кэша заголовка текстового индекса (в количестве элементов). Ноль отключает кэш.

## text_index_header_cache_policy \{#text_index_header_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования заголовков текстового индекса.

## text_index_header_cache_size \{#text_index_header_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Размер кэша заголовков текстового индекса. Ноль — отключено.

:::note
Этот параметр можно изменить во время работы, и изменение вступит в силу немедленно.
:::

## text_index_header_cache_size_ratio \{#text_index_header_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (при использовании политики SLRU) в кэше заголовков текстового индекса относительно общего размера кэша.

## text_index_postings_cache_max_entries \{#text_index_postings_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />Размер кэша списков вхождений текстового индекса (в записях). Значение 0 означает отключение.

## text_index_postings_cache_policy \{#text_index_postings_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования списка постингов текстового индекса.

## text_index_postings_cache_size \{#text_index_postings_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="2147483648" />Размер кэша списков вхождений текстового индекса. Ноль отключает кэш.

:::note
Этот параметр можно изменить во время работы, и изменение вступит в силу немедленно.
:::

## text_index_postings_cache_size_ratio \{#text_index_postings_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />Относительный размер защищённой очереди (в случае политики SLRU) в кэше списков вхождений текстового индекса по отношению к общему размеру этого кэша.

## text_log \{#text_log\}

Настройки системной таблицы [text&#95;log](/operations/system-tables/text_log) для логирования текстовых сообщений.

<SystemLogParameters />

Дополнительно:

| Setting | Description                                                                                  | Default Value |
| ------- | -------------------------------------------------------------------------------------------- | ------------- |
| `level` | Максимальный уровень сообщений (по умолчанию `Trace`), которые будут записываться в таблицу. | `Trace`       |

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


## thread_pool_queue_size \{#thread_pool_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальное количество задач, которые могут быть поставлены в очередь в глобальный пул потоков. Увеличение размера очереди приводит к большему потреблению памяти. Рекомендуется устанавливать это значение равным [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size).

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```


## threadpool_local_fs_reader_pool_size \{#threadpool_local_fs_reader_pool_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />Количество потоков в пуле для чтения из локальной файловой системы, когда `local_filesystem_read_method = 'pread_threadpool'`.

## threadpool_local_fs_reader_queue_size \{#threadpool_local_fs_reader_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />Максимальное количество задач, которые могут быть поставлены в очередь пула потоков для чтения из локальной файловой системы.

## threadpool_remote_fs_reader_pool_size \{#threadpool_remote_fs_reader_pool_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" />Количество потоков в пуле потоков, используемом для чтения из удалённой файловой системы при `remote_filesystem_read_method = 'threadpool'`.

## threadpool_remote_fs_reader_queue_size \{#threadpool_remote_fs_reader_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />Максимальное количество задач, которые может быть запланировано в пуле потоков для чтения из удалённой файловой системы.

## threadpool_writer_pool_size \{#threadpool_writer_pool_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />Размер фонового пула для обработки запросов на запись в объектные хранилища

## threadpool_writer_queue_size \{#threadpool_writer_queue_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно поместить в фоновый пул для обработки запросов на запись в объектные хранилища

## throw_on_unknown_workload \{#throw_on_unknown_workload\}

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет поведение при обращении к неизвестному WORKLOAD с параметром запроса &#39;workload&#39;.

* Если `true`, запрос, пытающийся обратиться к неизвестному WORKLOAD, завершится исключением RESOURCE&#95;ACCESS&#95;DENIED. Полезно для принудительного применения планирования ресурсов для всех запросов после того, как иерархия WORKLOAD сформирована и содержит WORKLOAD default.
* Если `false` (значение по умолчанию), запросу с параметром &#39;workload&#39;, указывающим на неизвестный WORKLOAD, предоставляется неограниченный доступ без планирования ресурсов. Это важно при настройке иерархии WORKLOAD до того, как будет добавлен WORKLOAD default.

**Пример**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**См. также**

* [Планирование рабочих нагрузок](/operations/workload-scheduling.md)


## timezone \{#timezone\}

Часовой пояс сервера.

Указывается как идентификатор IANA для часового пояса UTC или географического региона (например, Africa/Abidjan).

Часовой пояс необходим для преобразований между форматами String и DateTime при выводе полей типа DateTime в текстовый формат (на экран или в файл), а также при получении значения DateTime из строки. Кроме того, часовой пояс используется в функциях, работающих с датой и временем, если часовой пояс не был передан во входных параметрах.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**См. также**

* [session&#95;timezone](../settings/settings.md#session_timezone)


## tmp_path \{#tmp_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/tmp/" />

Путь в локальной файловой системе для хранения временных данных при обработке больших запросов.

:::note

* Для настройки хранения временных данных можно использовать только один параметр: tmp&#95;path, tmp&#95;policy, temporary&#95;data&#95;in&#95;cache.
* Символ / в конце пути обязателен.
  :::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## tmp_path \{#tmp_path\}

Путь на локальной файловой системе для хранения временных данных при обработке больших запросов.

:::note

* Для настройки хранилища временных данных можно использовать только один из вариантов: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
* Обязателен завершающий слэш.
  :::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## tmp_policy \{#tmp_policy\}

Политика для хранилища с временными данными. Все файлы с префиксом `tmp` будут удалены при запуске.

:::note
Рекомендации по использованию объектного хранилища в качестве `tmp_policy`:

* Используйте отдельный `bucket:path` на каждом сервере
* Используйте `metadata_type=plain`
* Возможно, вы также захотите настроить TTL для этого bucket
  :::

:::note

* Для настройки хранилища временных данных может быть использован только один из вариантов: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
* Параметры `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes` игнорируются.
* Политика должна содержать ровно *один том* (volume)

Дополнительную информацию см. в документации по [движку таблиц MergeTree](/engines/table-engines/mergetree-family/mergetree).
:::

**Пример**

Когда `/disk1` заполнен, временные данные будут храниться на `/disk2`.

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


## top_level_domains_list \{#top_level_domains_list\}

Определяет список добавляемых пользовательских доменов верхнего уровня, где каждая запись имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

См. также:

* функцию [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) и её варианты,
  которая принимает на вход имя пользовательского списка TLD и возвращает часть домена, включающую поддомены верхнего уровня вплоть до первого значимого поддомена.


## top_level_domains_path \{#top_level_domains_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/top_level_domains/" />

Каталог, содержащий домены верхнего уровня.

**Пример**

```xml
<top_level_domains_path>/var/lib/clickhouse/top_level_domains/</top_level_domains_path>
```


## total_memory_profiler_sample_max_allocation_size \{#total_memory_profiler_sample_max_allocation_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />Собирать случайные выделения памяти размером меньше либо равным указанному значению с вероятностью, равной `total_memory_profiler_sample_probability`. 0 означает, что параметр отключён. Имеет смысл установить `max_untracked_memory` в 0, чтобы этот порог работал как ожидается.

## total_memory_profiler_sample_min_allocation_size \{#total_memory_profiler_sample_min_allocation_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />Случайным образом собирать выделения памяти размером не менее указанного значения с вероятностью `total_memory_profiler_sample_probability`. 0 означает, что функция отключена. Имеет смысл установить `max_untracked_memory` в 0, чтобы этот порог работал как ожидается.

## total_memory_profiler_step \{#total_memory_profiler_step\}

<SettingsInfoBlock type="UInt64" default_value="0" />Каждый раз, когда использование памяти сервером превышает очередной шаг (в байтах), профилировщик памяти собирает стек трассировки по месту выделения. Нулевое значение означает, что профилировщик памяти отключен. Значения меньше нескольких мегабайт будут замедлять работу сервера.

## total_memory_tracker_sample_probability \{#total_memory_tracker_sample_probability\}

<SettingsInfoBlock type="Double" default_value="0" />

Позволяет собирать случайные выделения и освобождения памяти и записывать их в системную таблицу [system.trace_log](../../operations/system-tables/trace_log.md) с `trace_type`, равным `MemorySample`, с указанной вероятностью. Вероятность применяется к каждому выделению или освобождению памяти, вне зависимости от размера выделения. Обратите внимание, что сэмплирование происходит только тогда, когда объём неотслеживаемой памяти превышает лимит неотслеживаемой памяти (значение по умолчанию — `4` MiB). Этот лимит можно снизить, если уменьшен параметр [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step). Можно задать `total_memory_profiler_step`, равный `1`, для сверхдетального сэмплирования.

Возможные значения:

- Положительное число с плавающей запятой.
- `0` — запись случайных выделений и освобождений памяти в системную таблицу `system.trace_log` отключена.

## trace_log \{#trace_log\}

Настройки работы системной таблицы [trace&#95;log](/operations/system-tables/trace_log).

<SystemLogParameters />

Файл конфигурации сервера `config.xml` по умолчанию содержит следующий раздел настроек:

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


## uncompressed_cache_policy \{#uncompressed_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша несжатых данных.

## uncompressed_cache_size \{#uncompressed_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Максимальный размер (в байтах) несжатых данных, используемых табличными движками семейства MergeTree.

Для сервера существует один общий кэш. Память выделяется по требованию. Кэш используется, если включена опция `use_uncompressed_cache`.

Несжатый кэш может быть полезен для очень коротких запросов в отдельных случаях.

:::note
Значение `0` означает, что кэш отключен.

Этот параметр можно изменять во время работы сервера, и изменения вступают в силу немедленно.
:::

## uncompressed_cache_size_ratio \{#uncompressed_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в неразжатом кэше относительно общего размера этого кэша.

## url_scheme_mappers \{#url_scheme_mappers\}

Конфигурация для преобразования сокращённых или символьных префиксов URL в полные URL-адреса.

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


## use_minimalistic_part_header_in_zookeeper \{#use_minimalistic_part_header_in_zookeeper\}

Способ хранения заголовков частей данных в ZooKeeper. Этот параметр применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Его можно задать:

**Глобально в секции [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует этот параметр для всех таблиц на сервере. Вы можете изменить его в любой момент. При изменении параметра существующие таблицы меняют своё поведение.

**Для каждой таблицы**

При создании таблицы укажите соответствующий [параметр движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этим параметром не меняется, даже если глобальный параметр изменяется.

**Возможные значения**

- `0` — Функция отключена.
- `1` — Функция включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицируемые](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки частей данных в компактном виде, используя один `znode`. Если таблица содержит много столбцов, этот способ хранения значительно сокращает объём данных, хранящихся в Zookeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` вы не сможете понизить версию сервера ClickHouse до версии, которая не поддерживает этот параметр. Будьте осторожны при обновлении ClickHouse на серверах кластера. Не обновляйте все серверы одновременно. Безопаснее тестировать новые версии ClickHouse в тестовом окружении или только на нескольких серверах кластера.

Заголовки частей данных, уже сохранённые с этим параметром, нельзя вернуть к их прежнему (некомпактному) представлению.
:::

## user_defined_executable_functions_config \{#user_defined_executable_functions_config\}

Путь к файлу конфигурации для исполняемых пользовательских функций.

Путь:

* Укажите абсолютный путь или путь относительно конфигурационного файла сервера.
* Путь может содержать подстановочные символы * и ?.

См. также:

* &quot;[Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions).&quot;.

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## user_defined_path \{#user_defined_path\}

Каталог для файлов, определённых пользователем. Используется для SQL-функций, определяемых пользователем (SQL User Defined Functions) [/sql-reference/functions/udf](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


## user_directories \{#user_directories\}

Раздел конфигурационного файла, который содержит настройки:

* Путь к конфигурационному файлу с предопределёнными пользователями.
* Путь к каталогу, где хранятся пользователи, созданные SQL-командами.
* Путь к узлу ZooKeeper, где хранятся и реплицируются пользователи, созданные SQL-командами.

Если этот раздел задан, путь из [users&#95;config](/operations/server-configuration-parameters/settings#users_config) и [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path) использоваться не будет.

Раздел `user_directories` может содержать произвольное количество элементов, порядок элементов определяет их приоритет (чем выше элемент в списке, тем выше приоритет).

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

Пользователи, роли, политики доступа к строкам, квоты и профили также могут храниться в ZooKeeper:

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

Вы также можете определить разделы `memory` (хранение информации только в памяти, без записи на диск) и `ldap` (хранение информации на сервере LDAP).

Чтобы добавить сервер LDAP как удалённый каталог пользователей для пользователей, которые не определены локально, задайте один раздел `ldap` со следующими настройками:

| Setting  | Description                                                                                                                                                                                                                                                                                                                                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server` | одно из имён серверов LDAP, определённых в конфигурационном разделе `ldap_servers`. Этот параметр является обязательным и не может быть пустым.                                                                                                                                                                                                                                               |
| `roles`  | раздел со списком локально определённых ролей, которые будут назначены каждому пользователю, полученному с сервера LDAP. Если роли не указаны, пользователь не сможет выполнять никакие действия после аутентификации. Если любая из перечисленных ролей не определена локально на момент аутентификации, попытка аутентификации завершится неудачно, как если бы был указан неверный пароль. |

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


## user_files_path \{#user_files_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/user_files/" />

Каталог с пользовательскими файлами. Используется в табличных функциях [file()](/sql-reference/table-functions/file), [fileCluster()](/sql-reference/table-functions/fileCluster).

**Пример**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user_files_path \{#user_files_path\}

Каталог с пользовательскими файлами. Используется в табличных функциях [file()](../../sql-reference/table-functions/file.md), [fileCluster()](../../sql-reference/table-functions/fileCluster.md).

**Пример**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user_scripts_path \{#user_scripts_path\}

<SettingsInfoBlock type="String" default_value="/var/lib/clickhouse/user_scripts/" />

Каталог с файлами пользовательских скриптов. Используется для исполняемых пользовательских функций [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).

**Пример**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```


## user_scripts_path \{#user_scripts_path\}

Каталог, содержащий файлы пользовательских скриптов. Используется исполняемыми пользовательскими функциями [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).

**Пример**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

Тип:

Значение по умолчанию:


## users_config \{#users_config\}

Путь к файлу, в котором содержатся:

* Конфигурации пользователей.
* Права доступа.
* Профили настроек.
* Настройки квот.

**Пример**

```xml
<users_config>users.xml</users_config>
```


## validate_tcp_client_information \{#validate_tcp_client_information\}

<SettingsInfoBlock type="Bool" default_value="0" />Определяет, включена ли проверка информации о клиенте при получении пакета запроса.

По умолчанию значение — `false`:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```


## vector_similarity_index_cache_max_entries \{#vector_similarity_index_cache_max_entries\}

<SettingsInfoBlock type="UInt64" default_value="10000000" />Размер кэша для индекса векторного сходства в элементах. Ноль означает, что кэш отключён.

## vector_similarity_index_cache_policy \{#vector_similarity_index_cache_policy\}

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования индекса векторного сходства.

## vector_similarity_index_cache_size \{#vector_similarity_index_cache_size\}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />Размер кэша индексов векторного сходства. 0 — отключено.

:::note
Этот параметр можно изменять на лету; изменения применяются немедленно.
:::

## vector_similarity_index_cache_size_ratio \{#vector_similarity_index_cache_size_ratio\}

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше индекса поиска по векторному сходству относительно общего размера кэша.

## wait_dictionaries_load_at_startup \{#wait_dictionaries_load_at_startup\}

<SettingsInfoBlock type="Bool" default_value="1" />

Этот параметр определяет поведение, если `dictionaries_lazy_load` равно `false`.
(Если `dictionaries_lazy_load` равно `true`, этот параметр ни на что не влияет.)

Если `wait_dictionaries_load_at_startup` равно `false`, сервер
начинает загружать все словари при запуске и параллельно с этой загрузкой начинает принимать подключения.
Когда словарь используется в запросе впервые, запрос будет ждать, пока словарь не будет загружен, если он ещё не загружен.
Установка `wait_dictionaries_load_at_startup` в `false` может ускорить запуск ClickHouse, однако некоторые запросы могут выполняться медленнее
(поскольку им придётся ждать загрузки некоторых словарей).

Если `wait_dictionaries_load_at_startup` равно `true`, сервер при запуске будет ждать,
пока все словари не завершат свою загрузку (успешно или нет), прежде чем принимать какие-либо подключения.

**Пример**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```


## workload_path \{#workload_path\}

Каталог, используемый в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется папка `/workload/` в рабочем каталоге сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**См. также**

* [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)


## workload_zookeeper_path \{#workload_zookeeper_path\}

Путь к узлу ZooKeeper, который используется как хранилище для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для единообразия все SQL-определения хранятся в значении одного znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**См. также**

* [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)


## zookeeper \{#zookeeper\}

Содержит настройки, позволяющие ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицируемых таблиц. Если реплицируемые таблицы не используются, этот раздел параметров можно опустить.

Следующие настройки могут быть сконфигурированы с помощью подтегов:

| Setting                                    | Description                                                                                                                                                                                                                                   |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | Конечная точка (endpoint) ZooKeeper. Можно задать несколько конечных точек. Например: `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` задает порядок узлов при попытке подключения к кластеру ZooKeeper. |
| `session_timeout_ms`                       | Максимальный таймаут клиентской сессии в миллисекундах.                                                                                                                                                                                       |
| `operation_timeout_ms`                     | Максимальный таймаут одной операции в миллисекундах.                                                                                                                                                                                          |
| `root` (optional)                          | znode, который используется как корневой для znode-ов, используемых сервером ClickHouse.                                                                                                                                                      |
| `fallback_session_lifetime.min` (optional) | Минимальный предел времени жизни сессии ZooKeeper на fallback-узле, когда основной узел недоступен (балансировка нагрузки). Задается в секундах. По умолчанию: 3 часа.                                                                        |
| `fallback_session_lifetime.max` (optional) | Максимальный предел времени жизни сессии ZooKeeper на fallback-узле, когда основной узел недоступен (балансировка нагрузки). Задается в секундах. По умолчанию: 6 часов.                                                                      |
| `identity` (optional)                      | Пользователь и пароль, требуемые ZooKeeper для доступа к запрашиваемым znode-ам.                                                                                                                                                              |
| `use_compression` (optional)               | Включает сжатие в протоколе Keeper, если установлено значение true.                                                                                                                                                                           |

Также существует настройка `zookeeper_load_balancing` (optional), которая позволяет выбрать алгоритм выбора узла ZooKeeper:

| Algorithm Name                  | Description                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `random`                        | случайным образом выбирает один из узлов ZooKeeper.                                                                 |
| `in_order`                      | выбирает первый узел ZooKeeper, если он недоступен — второй и так далее.                                            |
| `nearest_hostname`              | выбирает узел ZooKeeper с именем хоста, наиболее похожим на имя хоста сервера; имя хоста сравнивается по префиксу.  |
| `hostname_levenshtein_distance` | аналогично nearest&#95;hostname, но сравнивает имена хостов по расстоянию Левенштейна.                              |
| `first_or_random`               | выбирает первый узел ZooKeeper, если он недоступен — случайным образом выбирает один из оставшихся узлов ZooKeeper. |
| `round_robin`                   | выбирает первый узел ZooKeeper, при переподключении выбирает следующий.                                             |

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
* [ZooKeeper Programmer&#39;s Guide](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
* [Опциональное защищённое взаимодействие между ClickHouse и ZooKeeper](/operations/ssl-zookeeper)


## zookeeper_log \{#zookeeper_log\}

Настройки системной таблицы [`zookeeper_log`](/operations/system-tables/zookeeper_log).

Следующие настройки могут быть заданы с помощью подтегов:

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
