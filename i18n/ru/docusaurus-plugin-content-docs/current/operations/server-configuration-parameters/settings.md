description: 'Этот раздел содержит описания настроек сервера, т.е. настроек, которые не могут быть изменены на уровне сессии или запроса.'
keywords: ['глобальные настройки сервера']
sidebar_label: 'Настройки сервера'
sidebar_position: 57
slug: /operations/server-configuration-parameters/settings
title: 'Настройки сервера'
```

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/docs/operations/server-configuration-parameters/_snippets/_system-log-parameters.md'

# Настройки сервера

Этот раздел содержит описания настроек сервера. Эти настройки не могут быть изменены на уровне сессии или запроса.

Для получения дополнительной информации о файлах конфигурации в ClickHouse смотрите [Файлы конфигурации](/operations/configuration-files).

Другие настройки описаны в разделе [Настройки](/operations/settings/overview).
Перед изучением настроек мы рекомендуем прочитать раздел [Файлы конфигурации](/operations/configuration-files) и обратить внимание на использование подстановок (атрибуты  и  ).

## access_control_improvements {#access_control_improvements}

Настройки для дополнительных улучшений в системе контроля доступа.

| Настройка                                         | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | По умолчанию |
|--------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `users_without_row_policies_can_read_rows`      | Устанавливает, могут ли пользователи без разрешений на строки все еще читать строки с помощью запроса `SELECT`. Например, если есть два пользователя A и B и политика строк определена только для A, то если эта настройка истинна, пользователь B увидит все строки. Если эта настройка ложна, пользователь B не увидит ни одной строки.                                                                                                                                 | `true`       |
| `on_cluster_queries_require_cluster_grant`      | Устанавливает, требуется ли для запросов `ON CLUSTER` разрешение `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                    | `true`       |
| `select_from_system_db_requires_grant`          | Устанавливает, требуется ли для `SELECT * FROM system.<table>` какие-либо разрешения, и может ли этот запрос выполняться любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON system.<table>`, как и для нестандартных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые постоянные таблицы, такие как `one`, `contributors`) по-прежнему доступны для всех; и если есть привилегия `SHOW` (например, `SHOW USERS`), то соответствующая системная таблица (т.е. `system.users`) будет доступна. | `true`       |
| `select_from_information_schema_requires_grant` | Устанавливает, требуется ли для `SELECT * FROM information_schema.<table>` какие-либо разрешения, и может ли этот запрос выполняться любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON information_schema.<table>`, так же как для обычных таблиц.                                                                                                                                                                                                                 | `true`       |
| `settings_constraints_replace_previous`         | Устанавливает, отменяет ли ограничение в профиле настроек для некоторой настройки действия предыдущего ограничения (определенного в других профилях) для этой настройки, включая поля, которые не задаются новым ограничением. Это также позволяет использовать тип ограничения `changeable_in_readonly`.                                                                                                                                                                        | `true`       |
| `table_engines_require_grant`                   | Устанавливает, требуется ли для создания таблицы с конкретным движком таблицы разрешение.                                                                                                                                                                                                                                                                                                                                                                                                                     | `false`      |
| `role_cache_expiration_time_seconds`            | Устанавливает количество секунд с момента последнего доступа, за которое роль хранится в кэше ролей.                                                                                                                                                                                                                                                                                                                                                                                                           | `600`        |

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

Путь к папке, где сервер ClickHouse хранит конфигурации пользователей и ролей, созданные с помощью SQL-команд.

**Смотрите также**

- [Контроль доступа и управление учетными записями](/operations/access-rights#access-control-usage)

## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached}

Действие, выполняемое при превышении максимального размера элемента массива в groupArray: `throw` исключение или `discard` лишние значения.

## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size}

Максимальный размер элемента массива в байтах для функции groupArray. Этот лимит проверяется при сериализации и помогает избежать большого размера состояния.

## allow_feature_tier {#allow_feature_tier}

Управляет тем, может ли пользователь изменять настройки, связанные с различными уровнями функций.

- `0` - Разрешены изменения любой настройки (экспериментальные, бета, производственные).
- `1` - Разрешены только изменения настроек бета и производственных функций. Изменения экспериментальных настроек отклоняются.
- `2` - Разрешены только изменения производственных настроек. Изменения экспериментальных или бета-настроек отклоняются.

Это эквивалентно установке ограничения только для чтения на все функции `EXPERIMENTAL` / `BETA`.

:::note
Значение `0` означает, что все настройки могут быть изменены.
:::

## allow_implicit_no_password {#allow_implicit_no_password}

Запрещает создание пользователя без пароля, если не указано "IDENTIFIED WITH no_password".

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```

## allow_no_password {#allow_no_password}

Устанавливает, разрешен ли небезопасный тип пароля no_password или нет.

```xml
<allow_no_password>1</allow_no_password>
```

## allow_plaintext_password {#allow_plaintext_password}

Устанавливает, разрешены ли типы паролей в открытом виде (небезопасные) или нет.

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```

## allow_use_jemalloc_memory {#allow_use_jemalloc_memory}

Разрешает использовать память jemalloc.

## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown}

Если истинно, очередь асинхронных вставок очищается при корректном завершении работы.

## async_insert_threads {#async_insert_threads}

Максимальное количество потоков для фактического анализа и вставки данных в фоновом режиме. Ноль означает, что асинхронный режим отключен.

## async_load_databases {#async_load_databases}

Асинхронная загрузка баз данных и таблиц.

- Если `true`, все нестандартные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружаться асинхронно после запуска сервера ClickHouse. Смотрите таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к таблице, которая еще не загружена, будет ждать, пока именно эта таблица не будет запущена. Если задача загрузки не удалась, запрос вернет ошибку (вместо прекращения работы всего сервера в случае `async_load_databases = false`). Таблица, на которую ждет хотя бы один запрос, будет загружена с более высоким приоритетом. DDL-запросы к базе данных будут ждать, пока именно эта база данных не будет запущена. Также рассмотрите возможность установки лимита `max_waiting_queries` для общего количества ожидающих запросов.

- Если `false`, все базы данных загружаются во время запуска сервера.

**Пример**

```xml
<async_load_databases>true</async_load_databases>
```

## async_load_system_database {#async_load_system_database}

Асинхронная загрузка системных таблиц. Полезно, если имеется большое количество журналов таблиц и частей в базе данных `system`. Независимо от настройки `async_load_databases`.

- Если установлено в `true`, все системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружаться асинхронно после запуска сервера ClickHouse. Смотрите таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к системной таблице, которая еще не загружена, будет ждать, пока именно эта таблица не будет запущена. Таблица, на которую ждет хотя бы один запрос, будет загружена с более высоким приоритетом. Также рассмотрите возможность установки настройки `max_waiting_queries`, чтобы ограничить общее количество ожидающих запросов.

- Если установлено в `false`, системная база данных загружается перед запуском сервера.

**Пример**

```xml
<async_load_system_database>true</async_load_system_database>
```

## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s}

Период в секундах для обновления тяжелых асинхронных метрик.

## asynchronous_insert_log {#asynchronous_insert_log}

Настройки для системы [asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) для ведения журнала асинхронных вставок.

<SystemLogParameters/>

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

По умолчанию включен в развертывания ClickHouse Cloud.

Если настройка не включена по умолчанию в вашей среде, в зависимости от того, как был установлен ClickHouse, вы можете следовать инструкции ниже, чтобы включить или отключить ее.

**Включение**

Чтобы вручную включить сбор истории асинхронных метрик [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md), создайте файл `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` со следующим содержанием:

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

Чтобы отключить настройку `asynchronous_metric_log`, вы должны создать следующий файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержанием:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>

## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics}

Включает расчет тяжелых асинхронных метрик.

## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s}

Период в секундах для обновления асинхронных метрик.

## auth_use_forwarded_address {#auth_use_forwarded_address}

Использует исходящий адрес для аутентификации клиентов, подключающихся через прокси.

:::note
Эта настройка должна использоваться с особой осторожностью, так как переданные адреса могут быть легко подделаны – сервера, принимающие такую аутентификацию, не должны быть доступны непосредственно, а только через надежный прокси.
:::

## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size}

Максимальное количество потоков, которые будут использоваться для выполнения операций сброса для таблиц с движком [Buffer](/engines/table-engines/special/buffer) в фоновом режиме.

## background_common_pool_size {#background_common_pool_size}

Максимальное количество потоков, которые будут использоваться для выполнения различных операций (в основном сбор мусора) для таблиц с движком [*MergeTree](/engines/table-engines/mergetree-family) в фоновом режиме.

## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size}

Максимальное количество потоков, которые будут использоваться для выполнения распределенных отправок.

## background_fetches_pool_size {#background_fetches_pool_size}

Максимальное количество потоков, которые будут использоваться для извлечения частей данных из другой реплики для таблиц с движком [*MergeTree](/engines/table-engines/mergetree-family) в фоновом режиме.

## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio}

Устанавливает отношение между количеством потоков и количеством фоновых слияний и мутаций, которые могут выполняться одновременно.

Например, если отношение равно 2 и [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) установлено на 16, то ClickHouse может одновременно выполнять 32 фоновых слияния. Это возможно, потому что фоновые операции могут быть приостановлены и отложены. Это необходимо, чтобы дать маленьким слияниям более высокий приоритет выполнения.

:::note
Вы можете только увеличить это соотношение во время выполнения. Чтобы уменьшить его, вам нужно перезапустить сервер.

Как и в случае с настройкой [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size), [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) может применяться из профиля `default` для обратной совместимости.
:::

## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy}

Политика того, как выполнять планирование фоновых слияний и мутаций. Возможные значения: `round_robin` и `shortest_task_first`.

Алгоритм, используемый для выбора следующего слияния или мутации, которые будут выполняться пулом фоновых потоков. Политика может быть изменена во время выполнения без перезапуска сервера и может применяться из профиля `default` для обратной совместимости.

Возможные значения:

- `round_robin` — Каждое одновременное слияние и мутация выполняется в порядке очереди, чтобы гарантировать свободную работу. Меньшие слияния завершаются быстрее, чем большие, только потому, что у них меньше блоков для слияния.
- `shortest_task_first` — Всегда выполняется меньшее слияние или мутация. Слияния и мутации назначаются приоритетам на основе их результирующего размера. Слияния с меньшими размерами строго предпочитаются более крупным. Эта политика обеспечивает максимально быстрое слияние небольших частей, но может привести к бесконечному голоданию больших слияний в разделах, сильно перегруженных `INSERT`.

## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size}

Максимальное количество потоков, которые будут использоваться для выполнения фоновых операций для потоковой передачи сообщений.

## background_move_pool_size {#background_move_pool_size}

Максимальное количество потоков, которые будут использоваться для перемещения частей данных на другой диск или том для таблиц с движком *MergeTree в фоновом режиме.

## background_pool_size {#background_pool_size}

Устанавливает количество потоков, выполняющих фоновые слияния и мутации для таблиц с движками MergeTree.

:::note
- Эта настройка также может применяться при запуске сервера из конфигурации профиля `default` для обратной совместимости при запуске сервера ClickHouse.
- Вы можете только увеличить количество потоков во время выполнения.
- Чтобы уменьшить количество потоков, вам нужно перезапустить сервер.
- Настраивая эту настройку, вы управляете нагрузкой на CPU и диск.
:::

:::danger
Меньший размер пула использует меньше ресурсов CPU и диска, но фоновым процессам требуется больше времени, что может в конечном итоге повлиять на производительность запросов.
:::

Перед изменением, пожалуйста, также ознакомьтесь с связанными настройками MergeTree, такими как:
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number-of-free-entries-in-pool-to-lower-max-size-of-merge).
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number-of-free-entries-in-pool-to-execute-mutation).

**Пример**

```xml
<background_pool_size>16</background_pool_size>
```

## background_schedule_pool_size {#background_schedule_pool_size}

Максимальное количество потоков, которые будут использоваться для выполнения легковесных периодических операций для реплицированных таблиц, потоковой передачи Kafka и обновления DNS-кеша.

## backup_log {#backup_log}

Настройки для системы [backup_log](../../operations/system-tables/backup_log.md) для ведения журнала операций `BACKUP` и `RESTORE`.

<SystemLogParameters/>

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

Максимальное количество потоков для выполнения запросов `BACKUP`.

## backups {#backups}

Настройки для резервного копирования, используемые при записи `BACKUP TO File()`.

Следующие настройки могут быть настроены с помощью под-тегов:

| Настройка                             | Описание                                                                                                                                                                    | По умолчанию |
|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `allowed_path`                        | Путь для резервного копирования при использовании `File()`. Эта настройка должна быть установлена, чтобы использовать `File`. Путь может быть относительным к каталогу экземпляра или может быть абсолютным. | `true`       |
| `remove_backup_files_after_failure` | Если команда `BACKUP` терпит неудачу, ClickHouse попытается удалить файлы, которые были уже скопированы в резервную копию до сбоя, в противном случае он оставит скопированные файлы как есть. | `true`       |

Эта настройка по умолчанию настроена следующим образом:

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```

## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size}

Максимальное количество задач, которые могут быть запланированы в пуле потоков IO резервного копирования. Рекомендуется оставлять эту очередь неограниченной из-за текущей логики резервного копирования S3.

:::note
Значение `0` (по умолчанию) означает неограниченное.
:::

## bcrypt_workfactor {#bcrypt_workfactor}

Фактор работы для типа аутентификации bcrypt_password, который использует [алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

## blog_storage_log {#blog_storage_log}

Настройки для системы [`blob_storage_log`](../system-tables/blob_storage_log.md).

<SystemLogParameters/>

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

Интервал в секундах перед перезагрузкой встроенных словарей.

ClickHouse перезагружает встроенные словари каждые x секунд. Это позволяет редактировать словари "на лету" без перезапуска сервера.

**Пример**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio}

Устанавливает максимальное соотношение размера кеша к объему RAM. Позволяет уменьшить размер кеша на системах с низкой памятью.

## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability}

Для целей тестирования.

## cgroup_memory_watcher_hard_limit_ratio {#cgroup_memory_watcher_hard_limit_ratio}

Указывает "жесткий" порог потребления памяти серверного процесса согласно cgroups, после которого максимальное потребление памяти сервера корректируется до значения порога.

Смотрите настройки:
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio)

## cgroup_memory_watcher_soft_limit_ratio {#cgroup_memory_watcher_soft_limit_ratio}

Указывает "мягкий" порог потребления памяти серверного процесса согласно cgroups, после которого арены в jemalloc очищаются.

Смотрите настройки:
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)

## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time}

Интервал в секундах, в течение которого максимальное допустимое потребление памяти сервером корректируется по соответствующему порогу в cgroups.

Чтобы отключить наблюдатель cgroup, установите это значение на `0`.

Смотрите настройки:
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio).

## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size}

Устанавливает размер кеша (в элементах) для [составленных выражений](../../operations/caches.md).

## compiled_expression_cache_size {#compiled_expression_cache_size}

Устанавливает размер кеша (в байтах) для [составленных выражений](../../operations/caches.md).

## compression {#compression}

Настройки сжатия данных для таблиц с движком [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

:::note
Мы рекомендуем не изменять это, если вы только начали использовать ClickHouse.
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

- `min_part_size` – Минимальный размер части данных.
- `min_part_size_ratio` – Соотношение размера части данных к размеру таблицы.
- `method` – Метод сжатия. Допустимые значения: `lz4`, `lz4hc`, `zstd`,`deflate_qpl`.
- `level` – Уровень сжатия. Смотрите [Кодеки](/sql-reference/statements/create/table#general-purpose-codecs).

:::note
Вы можете настроить несколько разделов `<case>`.
:::

**Действия, когда условия соблюдаются**:

- Если часть данных соответствует установленному условию, ClickHouse использует указанный метод сжатия.
- Если часть данных соответствует нескольким наборам условий, ClickHouse использует первый соответствующий набор условий.

:::note
Если ни одно из условий не выполнено для части данных, ClickHouse использует сжатие `lz4`.
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

Политика по планированию слотов CPU в контроле параллелизма. Алгоритм, используемый для управления тем, как ограниченное число слотов CPU `concurrent_threads_soft_limit` распределяется среди параллельных запросов. Планировщик может быть изменен во время выполнения без перезапуска сервера.

Возможные значения:

- `round_robin` — Каждый запрос с установкой `use_concurrency_control` = 1 выделяет до `max_threads` слотов CPU. Один слот на поток. При конфликте слоты CPU предоставляются запросам по кругу. Обратите внимание, что первый слот предоставляется без условий, что может привести к несправедливости и увеличению задержки запросов с высоким `max_threads` при наличии большого количества запросов с `max_threads` = 1.
- `fair_round_robin` — Каждый запрос с установкой `use_concurrency_control` = 1 выделяет до `max_threads - 1` слотов CPU. Модификация `round_robin`, которая не требует слота CPU для первого потока каждого запроса. Таким образом, запросы с `max_threads` = 1 не требуют никаких слотов и не могут несправедливо выделить все слоты. Нет слотов, предоставленных без условий.

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num}

Максимальное количество потоков обработки запросов, исключая потоки для извлечения данных из удаленных серверов, разрешенных для выполнения всех запросов. Это не жесткий предел. В случае достижения предела запрос все равно получит минимум один поток для выполнения. Запрос может увеличить желаемое количество потоков во время выполнения, если освобождаются дополнительные потоки.

:::note
Значение `0` (по умолчанию) означает неограниченное.
:::

## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores}

То же самое, что и concurrent_threads_soft_limit_num, но с соотношением к ядрам.

## config_reload_interval_ms {#config_reload_interval_ms}

С какой частотой ClickHouse будет перезагружать конфигурацию и проверять новые изменения.

## core_dump {#core_dump}

Настраивает мягкий предел для размера файла core dump.

:::note
Жесткий предел настраивается через системные инструменты.
:::

**Пример**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```

## crash_log {#crash_log}

Настройки для работы с системой [crash_log](../../operations/system-tables/crash-log.md).

<SystemLogParameters/>

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
## custom_cached_disks_base_directory {#custom_cached_disks_base_directory}

Эта настройка указывает путь к кэшу для пользовательских (созданных с помощью SQL) кэшированных дисков.  
`custom_cached_disks_base_directory` имеет более высокий приоритет для пользовательских дисков по сравнению с `filesystem_caches_path` (найденным в `filesystem_caches_path.xml`), который используется, если первый отсутствует.  
Путь настройки файлового кэша должен находиться внутри этого каталога, в противном случае будет выдано исключение, предотвращающее создание диска.

:::note
Это не повлияет на диски, созданные в более старой версии, для которой сервер был обновлён. В этом случае исключение не будет выдано, чтобы позволить серверу успешно стартовать.
:::

Пример:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```
## custom_settings_prefixes {#custom_settings_prefixes}

Список префиксов для [пользовательских настроек](/operations/settings/query-level#custom_settings). Префиксы должны быть разделены запятыми.

**Пример**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**См. Также**

- [Пользовательские настройки](/operations/settings/query-level#custom_settings)
## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec}


Задержка, в течение которой удалённую таблицу можно восстановить с помощью команды [`UNDROP`](/sql-reference/statements/undrop.md). Если `DROP TABLE` был выполнен с модификатором `SYNC`, настройка игнорируется.  
По умолчанию эта настройка равна `480` (8 минут).
## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec}

В случае неудачи при удалении таблицы ClickHouse будет ждать это время, прежде чем повторить операцию.
## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency}

Размер пула потоков, используемого для удаления таблиц.
## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec}


Параметр задачи, которая очищает мусор из директории `store/`.  
Задаёт периодичность выполнения задачи.

:::note
Значение `0` означает "никогда". Значение по умолчанию соответствует 1 дню.
:::
## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec}


Параметр задачи, которая очищает мусор из директории `store/`.  
Если какой-то подпапки не используется `clickhouse-server`, и эта директория не была изменена в последние 
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) секунд, задача "скроет" эту директорию, удалив все права доступа. Это также работает для директорий, которые `clickhouse-server` не ожидает увидеть в `store/`.

:::note
Значение `0` означает "немедленно".
:::
## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec}


Параметр задачи, которая очищает мусор из директории `store/`.  
Если какая-то подпапка не используется `clickhouse-server`, и она была ранее "скрыта" 
(см. [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec)), 
и эта директория не была изменена в последние 
[`database_catalog_unused_dir_rm_timeout_sec`]/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) секунд, задача удалит эту директорию.  
Это также работает для директорий, которые `clickhouse-server` не ожидает увидеть в `store/`.

:::note
Значение `0` означает "никогда". Значение по умолчанию соответствует 30 дням.
:::
## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently}

Разрешить постоянное отсоединение таблиц в реплицированных базах данных.
## default_database {#default_database}

Имя базы данных по умолчанию.
## default_password_type {#default_password_type}

Устанавливает тип пароля, который автоматически будет установлен для запросов, таких как `CREATE USER u IDENTIFIED BY 'p'`.

Допустимые значения:
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## default_profile {#default_profile}

Профиль настроек по умолчанию. Профили настроек находятся в файле, указанном в настройке `user_config`.

**Пример**

```xml
<default_profile>default</default_profile>
```
## default_replica_name {#default_replica_name}


Имя реплики в ZooKeeper.

**Пример**

```xml
<default_replica_name>{replica}</default_replica_name>
```
## default_replica_path {#default_replica_path}


Путь к таблице в ZooKeeper.

**Пример**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```
## default_session_timeout {#default_session_timeout}

Таймаут сессии по умолчанию, в секундах.

```xml
<default_session_timeout>60</default_session_timeout>
```
## dictionaries_config {#dictionaries_config}

Путь к конфигурационному файлу для словарей.

Путь:

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать подстановочные символы \* и ?.

См. также:
- "[Словари](../../sql-reference/dictionaries/index.md)".

**Пример**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## dictionaries_lazy_load {#dictionaries_lazy_load}


Ленивая загрузка словарей.

- Если `true`, то каждый словарь загружается при первом использовании. Если загрузка не удалась, функция, использующая словарь, выбрасывает исключение.
- Если `false`, то сервер загружает все словари при запуске.

:::note
Сервер будет ждать при запуске, пока все словари не завершат свою загрузку, прежде чем принимать какие-либо подключения (исключение: если [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) установлено в `false`).
:::

**Пример**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```
## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval}

Интервал в миллисекундах для попыток переподключения неудавшихся словарей MySQL и Postgres с включенным `background_reconnect`.
## disable_insertion_and_mutation {#disable_insertion_and_mutation}


Отключает все запросы на вставку/изменение/удаление. Эта настройка будет включена, если кто-то нуждается в узлах только для чтения, чтобы предотвратить влияние вставок и мутаций на производительность чтения.
## disable_internal_dns_cache {#disable_internal_dns_cache}

Полностью отключает внутреннее кеширование DNS.
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию используется туннелирование (т.е. `HTTP CONNECT`) для выполнения `HTTPS` запросов через `HTTP` прокси. Эта настройка может быть использована для его отключения.

**no_proxy**

По умолчанию все запросы будут проходить через прокси. Чтобы отключить его для конкретных хостов, переменная `no_proxy` должна быть установлена.  
Она может быть установлена внутри `<proxy>` для списковых и удалённых резолверов, а также как переменная окружения для резолвера окружения.  
Она поддерживает IP-адреса, домены, подклассы и подстановочный символ `'*'` для полного обхода. Ведущие точки отбрасываются, как и в curl.

**Пример**

Нижеуказанная конфигурация обходит запросы прокси для `clickhouse.cloud` и всех его поддоменов (например, `auth.clickhouse.cloud`).  
То же самое касается GitLab, даже если у него есть ведущая точка. И `gitlab.com`, и `about.gitlab.com` будут обходить прокси.

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

Подключения, превышающие этот лимит, имеют значительно более короткое время жизни. Ограничение применяется к подключениям к дискам.
## disk_connections_store_limit {#disk_connections_store_limit}

Подключения, превышающие этот лимит, сбрасываются после использования. Установите 0, чтобы отключить кеширование подключения. Ограничение применяется к подключениям к дискам.
## disk_connections_warn_limit {#disk_connections_warn_limit}

Предупреждающие сообщения записываются в журналы, если количество используемых подключений превышает этот лимит. Ограничение применяется к подключениям к дискам.
## display_secrets_in_show_and_select {#display_secrets_in_show_and_select}


Включает или отключает отображение секретов в запросах `SHOW` и `SELECT` для таблиц, баз данных, табличных функций и словарей.

Пользователь, желающий видеть секреты, также должен иметь настроенный 
[`format_display_secrets_in_show_and_select` формат](../settings/formats#format_display_secrets_in_show_and_select),
включённый и иметь
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect) привилегию.

Возможные значения:

- `0` — Отключено.
- `1` — Включено.
## distributed_ddl {#distributed_ddl}

Управляет выполнением [распределённых DDL запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) в кластере.  
Работает только если [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) включен.

Конфигурируемые настройки внутри `<distributed_ddl>` включают:

| Настройка                | Описание                                                                                                                       | Значение по умолчанию                          |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| `path`                  | путь в Keeper для `task_queue` для DDL запросов                                                                               |                                               |
| `profile`               | профиль, используемый для выполнения DDL запросов                                                                                       |                                               |
| `pool_size`             | сколько `ON CLUSTER` запросов может выполняться одновременно                                                                           |                                               |
| `max_tasks_in_queue`    | максимальное количество задач, которые могут находиться в очереди.                                                             | `1,000`                                       |
| `task_max_lifetime`     | удалить узел, если его возраст больше этого значения.                                                                              | `7 * 24 * 60 * 60` (неделя в секундах)      |
| `cleanup_delay_period`  | очистка начинается после получения события нового узла, если последняя очистка не была сделана ранее, чем `cleanup_delay_period` секунд назад. | `60` секунд                                   |

**Пример**

```xml
<distributed_ddl>
    <!-- Путь в ZooKeeper к очереди с DDL запросами -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Настройки из этого профиля будут использоваться для выполнения DDL запросов -->
    <profile>default</profile>

    <!-- Контролирует, сколько ON CLUSTER запросов может быть выполнено одновременно. -->
    <pool_size>1</pool_size>

    <!--
         Настройки очистки (активные задачи не будут удалены)
    -->

    <!-- Контролирует TTL задач (по умолчанию 1 неделя) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Контролирует, как часто должна выполняться очистка (в секундах) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Контролирует, сколько задач может быть в очереди -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```
## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4}

Разрешает разрешение имен в адреса ipv4.
## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6}

Разрешает разрешение имен в адреса ipv6.
## dns_cache_max_entries {#dns_cache_max_entries}

Максимальное количество записей в внутреннем кэше DNS.
## dns_cache_update_period {#dns_cache_update_period}

Период обновления внутреннего кэша DNS в секундах.
## dns_max_consecutive_failures {#dns_max_consecutive_failures}

Максимальное количество неудач при разрешении DNS имени хоста, прежде чем удалить имя хоста из кэша DNS ClickHouse.
## enable_azure_sdk_logging {#enable_azure_sdk_logging}

Включает сбор журналов от Azure sdk.
## encryption {#encryption}

Настраивает команду для получения ключа, который будет использоваться кодеками [шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должны быть записаны в переменные окружения или установлены в конфигурационном файле.

Ключи могут быть в шестнадцатеричном формате или строке длиной 16 байт.

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
Хранение ключей в конфигурационном файле не рекомендуется. Это небезопасно. Вы можете переместить ключи в отдельный конфигурационный файл на защищённом диске и поместить символьную ссылку на этот конфигурационный файл в папку `config.d/`.
:::

Загрузка из конфигурации, когда ключ в шестнадцатеричном формате:

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

Здесь `current_key_id` устанавливает текущий ключ для шифрования, и все указанные ключи могут использоваться для расшифровки.

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

Здесь `current_key_id` показывает текущий ключ для шифрования.

Также пользователи могут добавить nonce, который должен быть длиной 12 байт (по умолчанию процедуры шифрования и расшифровки используют nonce, состоящий из нулевых байт):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Или его можно установить в шестнадцатеричном виде:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
Все вышеупомянутое может быть применено и для `aes_256_gcm_siv` (но ключ должен быть длиной 32 байта).
:::
## error_log {#error_log}

По умолчанию отключен.

**Включение**

Чтобы вручную включить коллекцию истории ошибок [`system.error_log`](../../operations/system-tables/error_log.md), создайте `/etc/clickhouse-server/config.d/error_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `error_log`, вы должны создать следующий файл `/etc/clickhouse-server/config.d/disable_error_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## format_alter_operations_with_parentheses {#format_alter_operations_with_parentheses}

Если установлено в `true`, то операции изменения будут обрамлены скобками в форматированных запросах. Это делает парсинг форматированных запросов изменения менее неоднозначным.
## format_schema_path {#format_schema_path}

Путь к директории со схемами для входящих данных, такими как схемы для формата [CapnProto](../../interfaces/formats.md#capnproto).

**Пример**

```xml
<!-- Директория, содержащая файлы схем для различных форматов ввода. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns}

Период для таймера тактов CPU глобального профайлера (в наносекундах). Установите значение 0, чтобы отключить глобальный профайлер тактов CPU. Рекомендуемое значение - как минимум 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (один раз в секунду) для профилирования по всему кластеру.
## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns}

Период для реального таймера глобального профайлера (в наносекундах). Установите значение 0, чтобы отключить глобальный профайлер реального времени. Рекомендуемое значение - как минимум 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (один раз в секунду) для профилирования по всему кластеру.
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
- `port` – Порт на сервере Graphite.
- `interval` – Интервал для отправки, в секундах.
- `timeout` – Таймаут для отправки данных, в секундах.
- `root_path` – Префикс для ключей.
- `metrics` – Отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Отправка данных дельт, накопленных за период времени, из таблицы [system.events](/operations/system-tables/events).
- `events_cumulative` – Отправка кумулятивных данных из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Отправка данных из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Можно настроить множество `<graphite>` клауз. Например, можно использовать это для отправки различных данных с разными интервалами.

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

Настройки для уменьшения объёма данных для Graphite.

За более подробной информацией смотрите [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md).

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

Время действия для HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. Если вы зададите положительное число, HSTS будет включен, и max-age будет равен заданному числу.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## http_connections_soft_limit {#http_connections_soft_limit}

Подключения, превышающие этот лимит, имеют значительно более короткое время жизни. Ограничение применяется к http-подключениям, которые не принадлежат ни одному диску или хранилищу.
## http_connections_store_limit {#http_connections_store_limit}

Подключения, превышающие этот лимит, сбрасываются после использования. Установите 0, чтобы отключить кеширование подключения. Ограничение применяется к http-подключениям, которые не принадлежат ни одному диску или хранилищу.
## http_connections_warn_limit {#http_connections_warn_limit}

Предупреждающие сообщения записываются в журналы, если количество используемых подключений превышает этот лимит. Ограничение применяется к http-подключениям, которые не принадлежат ни одному диску или хранилищу.
## http_handlers {#http_handlers}

Позволяет использовать пользовательские HTTP обработчики.  
Чтобы добавить новый http обработчик, просто добавьте новый `<rule>`.  
Правила проверяются сверху вниз, как определено, и первое совпадение выполнит обработчик.

Следующие настройки можно конфигурировать с помощью под-тэгов:

| Под-тэги             | Определение                                                                                                                                        |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | Для сопоставления URL запроса вы можете использовать префикс 'regex:' для использования регулярного выражения (необязательно)                       |
| `methods`            | Для сопоставления методов запроса вы можете использовать запятые для разделения нескольких совпадений методов (необязательно)                      |
| `headers`            | Для сопоставления заголовков запроса сопоставьте каждый дочерний элемент (имя дочернего элемента - имя заголовка), вы можете использовать префикс 'regex:' для использования регулярного выражения (необязательно) |
| `handler`            | Обработчик запроса                                                                                                                               |
| `empty_query_string` | Проверка на отсутствие строки запроса в URL                                                                                                    |

`handler` содержит следующие настройки, которые можно конфигурировать с помощью под-тэгов:

| Под-тэги           | Определение                                                                                                                                                            |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | Место для перенаправления                                                                                                                                              |
| `type`             | Поддерживаемые типы: static, dynamic_query_handler, predefined_query_handler, redirect                                                                                    |
| `status`           | Используйте с типом static, код ответа статус                                                                                                                            |
| `query_param_name` | Используйте с типом dynamic_query_handler, извлекает и выполняет значение, соответствующее значению `<query_param_name>` в параметрах HTTP-запроса                             |
| `query`            | Используйте с типом predefined_query_handler, выполняет запрос при вызове обработчика                                                                                     |
| `content_type`     | Используйте с типом static, тип контента ответа                                                                                                                           |
| `response_content` | Используйте с типом static, содержимое ответа, отправляемое клиенту, при использовании префикса 'file://' или 'config://', содержимое будет найдено из файла или конфигурации, отправляемое клиенту |

Помимо списка правил, вы можете указать `<defaults/>`, что позволяет включить все обработчики по умолчанию.

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

Используется для добавления заголовков к ответу на HTTP запрос `OPTIONS`.  
Метод `OPTIONS` используется при выполнении CORS предусловных запросов.

Для получения дополнительной информации смотрите [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS).

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

Страница, которая отображается по умолчанию, когда вы получаете доступ к серверу ClickHouse HTTP(s).  
Значение по умолчанию — "Ok." (с переходом на новую строку в конце)

**Пример**

Открывает `https://tabix.io/`, когда вы получаете доступ к `http://localhost: http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size}

Размер фонового пула для каталога iceberg.
## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size}

Количество задач, которые возможно добавить в пул каталога iceberg.
## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query}


Если `true`, ClickHouse не записывает значения по умолчанию для пустой SQL безопасности в запросах `CREATE VIEW`.

:::note
Эта настройка необходима только в переходный период и станет устаревшей в версии 24.4.
:::
## include_from {#include_from}

Путь к файлу с подстановками. Поддерживаются форматы XML и YAML.

Для получения дополнительной информации смотрите раздел "[Файлы конфигурации](/operations/configuration-files)".

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## index_mark_cache_policy {#index_mark_cache_policy}

Имя политики кэша вторичных индексов.
## index_mark_cache_size {#index_mark_cache_size}


Максимальный размер кэша для меток индексов.

:::note

Значение `0` означает отключено.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::
## index_mark_cache_size_ratio {#index_mark_cache_size_ratio}

Размер защищённой очереди (в случае политики SLRU) в кэше меток вторичных индексов относительно общего размера кэша.
## index_uncompressed_cache_policy {#index_uncompressed_cache_policy}

Имя политики кэша для не сжатых блоков индексов `MergeTree`.
## index_uncompressed_cache_size {#index_uncompressed_cache_size}


Максимальный размер кэша для не сжатых блоков индексов `MergeTree`.

:::note
Значение `0` означает отключено.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::
## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio}

Размер защищённой очереди (в случае политики SLRU) в кэше не сжатых индексов относительно общего размера кэша.
## interserver_http_credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики, используя эти учетные данные.  
Поэтому `interserver_http_credentials` должны быть одинаковыми для всех реплик в кластере.

:::note
- По умолчанию, если секция `interserver_http_credentials` пропущена, аутентификация не используется во время репликации.
- Настройки `interserver_http_credentials` не относятся к конфигурации учётных данных клиента ClickHouse [конфигурации](../../interfaces/cli.md#configuration_files).
- Эти учётные данные общие для репликации через `HTTP` и `HTTPS`.
:::

Следующие настройки могут быть настроены с помощью под-тэгов:

- `user` — имя пользователя.
- `password` — пароль.
- `allow_empty` — Если `true`, то другим репликам разрешено подключаться без аутентификации, даже если учётные данные установлены. Если `false`, то подключения без аутентификации отклоняются. Значение по умолчанию: `false`.
- `old` — Содержит старые `user` и `password`, используемые во время ротации учётных данных. Можно указать несколько секций `old`.

**Ротация учётных данных**

ClickHouse поддерживает динамическую ротацию учётных данных между серверами без остановки всех реплик одновременно для обновления их конфигурации. Учётные данные можно изменить в несколько этапов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учётные данные. Это позволяет подключениям с аутентификацией и без неё.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите значение `allow_empty` в `false` или удалите эту настройку. Это сделает аутентификацию с новыми учётными данными обязательной.

Чтобы изменить существующие учётные данные, переместите имя пользователя и пароль в секцию `interserver_http_credentials.old` и обновите `user` и `password` новыми значениями. В этот момент сервер использует новые учётные данные для подключения к другим репликам и принимает подключения как с новыми, так и со старыми учётными данными.

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

Когда новые учётные данные применены ко всем репликам, старые учётные данные могут быть удалены.

## interserver_http_host {#interserver_http_host}

Имя хоста, которое могут использовать другие серверы для доступа к этому серверу.

Если опущено, оно определяется так же, как команда `hostname -f`.

Полезно для отказа от конкретного сетевого интерфейса.

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

Похож на [`interserver_http_host`](#interserver_http_host), за исключением того, что это имя хоста может быть использовано другими серверами для доступа к этому серверу через `HTTPS`.

**Пример**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_https_port {#interserver_https_port}

Порт для обмена данными между серверами ClickHouse через `HTTPS`.

**Пример**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_listen_host {#interserver_listen_host}

Ограничение на хосты, которые могут обмениваться данными между серверами ClickHouse. Если используется Keeper, то то же самое ограничение будет применяться к связи между различными экземплярами Keeper.

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


Максимальное количество задач, которые могут быть запланированы в пуле потоков ввода-вывода.

:::note
Значение `0` означает неограниченное количество.
:::
## keep_alive_timeout {#keep_alive_timeout}


Количество секунд, в течение которых ClickHouse ждет входящие запросы по протоколу HTTP, прежде чем закрыть соединение.

**Пример**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## keeper_multiread_batch_size {#keeper_multiread_batch_size}


Максимальный размер партии для MultiRead запроса к [Zoo]Keeper, который поддерживает пакетирование. Если установить в 0, пакетирование отключается. Доступно только в ClickHouse Cloud.
## latency_log {#latency_log}

По умолчанию отключен.

**Включение**

Чтобы вручную включить сбор истории задержек [`system.latency_log`](../../operations/system-tables/latency_log.md), создайте файл `/etc/clickhouse-server/config.d/latency_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <latency_log>
        <database>system</database>
        <table>latency_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </latency_log>
</clickhouse>
```

**Отключение**

Чтобы отключить настройку `latency_log`, необходимо создать следующий файл `/etc/clickhouse-server/config.d/disable_latency_log.xml` со следующим содержимым:

```xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## ldap_servers {#ldap_servers}

Список серверов LDAP с их параметрами подключения для:
- использования их в качестве аутентификаторов для выделенных локальных пользователей, у которых указан механизм аутентификации 'ldap' вместо 'password'
- использования их в качестве удаленных каталогов пользователей.

Следующие настройки могут быть настроены с помощью подметок:

| Настройка                        | Описание                                                                                                                                                                                                                                                                                                                                                                                                                              |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                           | Имя хоста LDAP сервера или IP, этот параметр обязательный и не может быть пустым.                                                                                                                                                                                                                                                                                                                                                     |
| `port`                           | Порт LDAP сервера, по умолчанию 636, если `enable_tls` установлен в true, иначе 389.                                                                                                                                                                                                                                                                                                                                                   |
| `bind_dn`                        | Шаблон, используемый для построения DN для привязки. Результирующий DN будет сформирован заменой всех подстрок `\{user_name\}` в шаблоне на фактическое имя пользователя при каждой попытке аутентификации.                                                                                                                                                                                                                                   |
| `user_dn_detection`              | Раздел с параметрами поиска LDAP для обнаружения фактического DN пользователя, к которому привязан сервер. Этот параметр используется в основном в фильтрах поиска для дальнейшего сопоставления ролей при активном каталоге. Результирующий DN пользователя будет использован при замене подстрок `\{user_dn\}` везде, где это разрешено. По умолчанию DN пользователя устанавливается равным DN для привязки, но после выполнения поиска он будет обновлен до фактического обнаруженного значения DN пользователя. |
| `verification_cooldown`          | Период времени в секундах после успешной привязки, в течение которого пользователю будет считаться успешно аутентифицированным для всех последовательных запросов без обращения к серверу LDAP. Укажите `0` (значение по умолчанию), чтобы отключить кэширование и принудить к обращению к серверу LDAP для каждого запроса аутентификации.                                                                                          |
| `enable_tls`                     | Флаг для включения использования защищенного соединения с сервером LDAP. Укажите `no` для протокола в открытом текстовом виде (`ldap://`) (не рекомендуется). Укажите `yes` для протокола LDAP через SSL/TLS (`ldaps://`) (рекомендуется, значение по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (протокол в открытом текстовом виде (`ldap://`), обновленный до TLS).                                                                                      |
| `tls_minimum_protocol_version`   | Минимальная версия протокола SSL/TLS. Допустимые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (значение по умолчанию).                                                                                                                                                                                                                                                                                                      |
| `tls_require_cert`               | Поведение проверки сертификатов SSL/TLS. Допустимые значения: `never`, `allow`, `try`, `demand` (значение по умолчанию).                                                                                                                                                                                                                                                                                                             |
| `tls_cert_file`                  | путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                   | путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`               | путь к файлу сертификата CA.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`                | путь к директории, содержащей сертификаты CA.                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`               | разрешенный набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                                                                                              |

Настройка `user_dn_detection` может быть настроена с использованием подметок:

| Настройка         | Описание                                                                                                                                                                                                                                                                                                                                    |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`         | шаблон, используемый для построения базового DN для поиска LDAP. Результирующий DN будет сформирован заменой всех подстрок `\{user_name\}` и '\{bind_dn\}' в шаблоне на фактическое имя пользователя и DN для привязки во время поиска LDAP.                                                                                                       |
| `scope`           | область поиска LDAP. Допустимые значения: `base`, `one_level`, `children`, `subtree` (значение по умолчанию).                                                                                                                                                                                                                                       |
| `search_filter`   | шаблон, используемый для формирования фильтра поиска для поиска LDAP. Результирующий фильтр будет сформирован заменой всех подстрок `\{user_name\}`, `\{bind_dn\}` и `\{base_dn\}` в шаблоне на фактическое имя пользователя, DN для привязки и базовый DN во время поиска LDAP. Обратите внимание, что специальные символы должны быть правильно экранированы в XML.  |

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

Пример (типичный Active Directory с настроенным обнаружением DN пользователя для дальнейшего сопоставления ролей):

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

Очередь (размер очереди ожидающих соединений) сокета прослушивания. Значение по умолчанию `4096`, такое же как и в linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не нужно изменять, поскольку:
- Значение по умолчанию достаточно велико,
- Для принятия подключений от клиентов у сервера есть отдельный поток.

Так что даже если у вас есть `TcpExtListenOverflows` (из `nstat`) не ноль и этот счетчик увеличивается для сервера ClickHouse, это не значит, что это значение нужно увеличивать, поскольку:
- Обычно, если `4096` недостаточно, это указывает на некоторые внутренние проблемы масштабирования ClickHouse, поэтому лучше сообщить об этой проблеме.
- Это не означает, что сервер сможет обрабатывать больше соединений позже (и даже если может, к тому моменту клиенты могут исчезнуть или отключиться).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```
## listen_host {#listen_host}

Ограничение на хосты, с которых могут приходить запросы. Если вы хотите, чтобы сервер отвечал на все из них, укажите `::`.

Примеры:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_reuse_port {#listen_reuse_port}

Разрешить нескольким серверам слушать на одном адресе:порту. Запросы будут направляться на случайный сервер операционной системой. Включение этой настройки не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

По умолчанию:
## listen_try {#listen_try}

Сервер не будет выходить, если сети IPv6 или IPv4 недоступны при попытке прослушивания.

**Пример**

```xml
<listen_try>0</listen_try>
```
## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size}

Размер фонового пула для загрузки меток
## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size}

Количество задач, которые можно добавить в пул предварительной выборки
## logger {#logger}

Местоположение и формат лог-сообщений.

**Ключи**:

| Ключ                       | Описание                                                                                                                                                                         |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                   | Уровень логирования. Допустимые значения: `none` (выключить логирование), `fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test`                                  |
| `log`                     | Путь к файлу журнала.                                                                                                                                                           |
| `errorlog`                | Путь к файлу журнала ошибок.                                                                                                                                                     |
| `size`                    | Политика ротации: максимальный размер файлов журнала в байтах. Как только размер файла журнала превышает этот порог, он переименовывается и архивируется, а новый файл журнала создается.                  |
| `count`                   | Политика ротации: сколько исторических файлов журнала ClickHouse хранится максимум.                                                                                                         |
| `stream_compress`         | Компрессия сообщений журнала с помощью LZ4. Установите `1` или `true`, чтобы включить.                                                                                                                    |
| `console`                 | Не записывать сообщения журнала в файлы журнала, вместо этого выводить их в консоль. Установите `1` или `true`, чтобы включить. Значение по умолчанию - `1`, если ClickHouse не запущен в режиме демона, `0` в противном случае. |
| `console_log_level`       | Уровень логирования для вывода на консоль. По умолчанию `level`.                                                                                                                                  |
| `formatting`              | Формат журнала для вывода на консоль. В настоящее время поддерживается только `json`                                                                                                                  |
| `use_syslog`              | Также пересылать вывод журнала в syslog.                                                                                                                                                  |
| `syslog_level`            | Уровень логирования для записи в syslog.                                                                                                                                                    |

**Спецификаторы формата журнала**

Имена файлов в путях `log` и `errorLog` поддерживают ниже указанные спецификаторы формата для результирующего имени файла (часть директории их не поддерживает).

Столбец "Пример" показывает вывод на `2023-07-06 18:32:07`.

| Спецификатор | Описание                                                                                                         | Пример                  |
|--------------|---------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | Литеральный %                                                                                                           | `%`                        |
| `%n`         | Символ новой строки                                                                                                  |                          |
| `%t`         | Символ горизонтальной табуляции                                                                                            |                          |
| `%Y`         | Год в десятичном формате, например 2017                                                                                 | `2023`                     |
| `%y`         | Последние 2 цифры года в десятичном формате (диапазон [00,99])                                                           | `23`                       |
| `%C`         | Первые 2 цифры года в десятичном формате (диапазон [00,99])                                                          | `20`                       |
| `%G`         | Четырехзначный [Год по недели ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), то есть год, содержащий указанную неделю. Обычно полезно только с `%V`  | `2023`       |
| `%g`         | Последние 2 цифры [Года по недели ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), то есть год, содержащий указанную неделю.                         | `23`         |
| `%b`         | Сокращенное название месяца, например окт (в зависимости от локали)                                                                 | `Jul`                      |
| `%h`         | Синоним %b                                                                                                       | `Jul`                      |
| `%B`         | Полное название месяца, например октябрь (в зависимости от локали)                                                                    | `July`                     |
| `%m`         | Месяц в десятичном формате (диапазон [01,12])                                                                           | `07`                       |
| `%U`         | Неделя года в десятичном формате (воскресенье - первый день недели) (диапазон [00,53])                          | `27`                       |
| `%W`         | Неделя года в десятичном формате (понедельник - первый день недели) (диапазон [00,53])                          | `27`                       |
| `%V`         | Номер недели ISO 8601 (диапазон [01,53])                                                                                | `27`                       |
| `%j`         | День в году в десятичном формате (диапазон [001,366])                                                               | `187`                      |
| `%d`         | День месяца в виде числа с ведущими нулями (диапазон [01,31]). Одноцифровое число предшествует нулю.                 | `06`                       |
| `%e`         | День месяца в виде числа с пробелами (диапазон [1,31]). Одноцифровое число предшествует пробелу.              | `&nbsp; 6`                 |
| `%a`         | Сокращенное название дня недели, например пят (в зависимости от локали)                                                               | `Thu`                      |
| `%A`         | Полное название дня недели, например пятница (в зависимости от локали)                                                                   | `Thursday`                 |
| `%w`         | День недели в виде целого числа с воскресеньем как 0 (диапазон [0-6])                                                          | `4`                        |
| `%u`         | День недели в десятичном формате, где понедельник - 1 (ISO 8601 формат) (диапазон [1-7])                                      | `4`                        |
| `%H`         | Час в десятичном формате, 24-часовой формат (диапазон [00-23])                                                             | `18`                       |
| `%I`         | Час в десятичном формате, 12-часовой формат (диапазон [01,12])                                                             | `06`                       |
| `%M`         | Минута в десятичном формате (диапазон [00,59])                                                                          | `32`                       |
| `%S`         | Секунда в десятичном формате (диапазон [00,60])                                                                          | `07`                       |
| `%c`         | Стандартная строка даты и времени, например Вс, 17 октября 04:41:13 2010 (в зависимости от локали)                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованное представление даты (в зависимости от локали)                                                                    | `07/06/23`                 |
| `%X`         | Локализованное представление времени, например 18:40:20 или 6:40:20 PM (в зависимости от локали)                                       | `18:32:07`                 |
| `%D`         | Короткая дата MM/DD/YY, эквивалентная %m/%d/%y                                                                         | `07/06/23`                 |
| `%F`         | Короткая дата YYYY-MM-DD, эквивалентная %Y-%m-%d                                                                       | `2023-07-06`               |
| `%r`         | Локализованное время в 12-часовом формате (в зависимости от локали)                                                                     | `06:32:07 PM`              |
| `%R`         | Эквивалентно "%H:%M"                                                                                               | `18:32`                    |
| `%T`         | Эквивалентно "%H:%M:%S" (формат времени ISO 8601)                                                                 | `18:32:07`                 |
| `%p`         | Локализованная ам или пм обозначение (в зависимости от локали)                                                               | `PM`                       |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430), или без символов, если информация о временной зоне недоступна | `+0800`                    |
| `%Z`         | Название временной зоны, зависящее от локали, или без символов, если информация о временной зоне недоступна     | `Z AWST `                  |

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

**Переопределения по уровням**

Уровень журнала отдельных имен журналов можно переопределить. Например, чтобы отключить все сообщения журналов "Backup" и "RBAC".

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

| Ключ        | Описание                                                                                                                                                                                                                                                    |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`  | Адрес syslog в формате `host\[:port\]`. Если опущено, используется локальный демон.                                                                                                                                                                         |
| `hostname` | Имя хоста, с которого отправляются журналы (необязательно).                                                                                                                                                                                                      |
| `facility` | Ключевое слово [факультета syslog](https://en.wikipedia.org/wiki/Syslog#Facility). Должен быть указан в верхнем регистре с префиксом "LOG_", например, `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т.д. По умолчанию: `LOG_USER`, если указан `address`, иначе `LOG_DAEMON`.                                           |
| `format`   | Формат сообщения журнала. Возможные значения: `bsd` и `syslog.`                                                                                                                                                                                                       |

**Форматы журнала**

Вы можете указать формат журнала, который будет выводиться в лог консоли. В настоящее время поддерживается только JSON.

**Пример**

Вот пример вывода JSON журнала:

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

Чтобы включить поддержку JSON логирования, используйте следующий фрагмент:

```xml
<logger>
    <formatting>
        <type>json</type>
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

**Переименование ключей для JSON журналов**

Имена ключей можно изменить, изменив значения тегов внутри тега `<names>`. Например, чтобы изменить `DATE_TIME` на `MY_DATE_TIME`, вы можете использовать `<date_time>MY_DATE_TIME</date_time>`.

**Пропуск ключей для JSON журналов**

Свойства журнала можно пропустить, закомментировав это свойство. Например, если вы не хотите, чтобы ваш журнал печатал `query_id`, вы можете закомментировать тег `<query_id>`.
## macros {#macros}

Подстановки параметров для реплицированных таблиц.

Может быть опущен, если не используются реплицированные таблицы.

Для получения дополнительной информации см. раздел [Создание реплицированных таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```
## mark_cache_policy {#mark_cache_policy}

Имя политики кэширования меток.
## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio}

Соотношение общего размера кэша меток, который следует заполнять во время предварительного разогрева.
```

## mark_cache_size {#mark_cache_size}

Максимальный размер кэша для меток (индекс таблиц семейства [`MergeTree`](/engines/table-engines/mergetree-family)).

:::note
Эту настройку можно изменить во время работы, и она вступит в силу немедленно.
:::

## mark_cache_size_ratio {#mark_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше меток относительно общего размера кэша.

## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size}

Количество потоков для загрузки активного набора частей данных (активных) при старте.

## max_authentication_methods_per_user {#max_authentication_methods_per_user}

Максимальное количество методов аутентификации, с которыми может быть создан или изменен пользователь. Изменение этой настройки не затрагивает существующих пользователей. Запросы на создание/изменение, связанные с аутентификацией, завершатся неудачей, если они превысят лимит, указанный в этой настройке. Запросы на создание/изменение, не связанные с аутентификацией, будут успешными.

:::note
Значение `0` означает неограниченное количество.
:::

## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server}

Максимальная скорость чтения в байтах в секунду для всех резервных копий на сервере. Ноль означает неограниченную скорость.

## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size}

Если количество **праздных** потоков в пуле потоков Backups IO превышает `max_backup_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые неактивными потоками, и уменьшит размер пула. Потоки могут быть созданы снова при необходимости.

## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size}

ClickHouse использует потоки из пула потоков Backups IO для выполнения операций ввода-вывода резервных копий S3. `max_backups_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.

## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size}

Максимальное количество потоков для создания векторных индексов.

:::note
Значение `0` означает использование всех ядер.
:::

## max_concurrent_insert_queries {#max_concurrent_insert_queries}

Ограничение на общее количество одновременно выполняемых запросов на вставку.

:::note
Значение `0` (по умолчанию) означает неограниченное количество.

Эту настройку можно изменить во время работы, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::

## max_concurrent_queries {#max_concurrent_queries}

Ограничение на общее количество одновременно выполняемых запросов. Обратите внимание, что также необходимо учитывать ограничения на запросы `INSERT` и `SELECT`, а также на максимальное количество запросов для пользователей.

См. также:
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note
Значение `0` (по умолчанию) означает неограниченное количество.

Эту настройку можно изменить во время работы, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::

## max_concurrent_select_queries {#max_concurrent_select_queries}

Ограничение на общее количество одновременно выполняемых запросов на выборку.

:::note
Значение `0` (по умолчанию) означает неограниченное количество.

Эту настройку можно изменить во время работы, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::

## max_connections {#max_connections}

Максимальные соединения с сервером.

## max_database_num_to_throw {#max_database_num_to_throw}

Если количество баз данных превышает это значение, сервер выдаст исключение. 0 означает отсутствие ограничений.

## max_database_num_to_warn {#max_database_num_to_warn}

Если количество подключенных баз данных превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```

## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size}

Количество потоков для создания таблиц во время восстановления реплики в DatabaseReplicated. Ноль означает количество потоков, равное количеству ядер.

## max_dictionary_num_to_throw {#max_dictionary_num_to_throw}

Если количество словарей превышает это значение, сервер выдаст исключение.

Подсчитываются только таблицы для движков баз данных:
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**

```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```

## max_dictionary_num_to_warn {#max_dictionary_num_to_warn}

Если количество подключенных словарей превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```

## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats}

Сколько записей статистики хеш-таблицы, собранной во время агрегации, может иметь.

## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size}

Количество потоков для ALTER TABLE FETCH PARTITION.

## max_io_thread_pool_free_size {#max_io_thread_pool_free_size}

Если количество **праздных** потоков в пуле потоков IO превышает `max_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые неактивными потоками, и уменьшит размер пула. Потоки могут быть созданы снова при необходимости.

## max_io_thread_pool_size {#max_io_thread_pool_size}

ClickHouse использует потоки из пула потоков IO для выполнения некоторых операций ввода-вывода (например, для взаимодействия с S3). `max_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.

## max_keep_alive_requests {#max_keep_alive_requests}

Максимальное количество запросов через одно соединение keep-alive, после чего оно будет закрыто сервером ClickHouse.

**Пример**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```

## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server}

Максимальная скорость локальных чтений в байтах в секунду.

:::note
Значение `0` означает неограниченную скорость.
:::

## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server}

Максимальная скорость локальных записей в байтах в секунду.

:::note
Значение `0` означает неограниченную скорость.
:::

## max_materialized_views_count_for_table {#max_materialized_views_count_for_table}

Ограничение на количество материализованных представлений, прикрепленных к таблице.

:::note
Здесь рассматриваются только напрямую зависимые представления, и создание одного представления на основе другого представления не рассматривается.
:::

## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server}

Максимальная скорость чтения всех слияний на сервере в байтах в секунду. Ноль означает неограниченную скорость.

## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server}

Максимальная скорость чтения всех мутаций на сервере в байтах в секунду. Ноль означает неограниченную скорость.

## max_open_files {#max_open_files}

Максимальное количество открытых файлов.

:::note
Рекомендуется использовать эту опцию в macOS, так как функция `getrlimit()` возвращает некорректное значение.
:::

**Пример**

```xml
<max_open_files>262144</max_open_files>
```

## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size}

Количество потоков для загрузки неактивного набора частей данных (устаревших) при старте.

## max_part_num_to_warn {#max_part_num_to_warn}

Если количество активных частей превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```

## max_partition_size_to_drop {#max_partition_size_to_drop}

Ограничение на удаление разделов.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает [`max_partition_size_to_drop`](/operations/settings/settings#max_partition_size_to_drop) (в байтах), вы не сможете удалить раздел, используя запрос [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart). Эта настройка не требует перезапуска сервера ClickHouse для применения. Другой способ отключить ограничение - создать файл `<clickhouse-path>/flags/force_drop_table`.

:::note
Значение `0` означает, что вы можете удалять разделы без каких-либо ограничений.

Это ограничение не распространяется на удаление таблиц и усечение таблиц, см. [max_table_size_to_drop](/operations/settings/settings#max_table_size_to_drop).
:::

**Пример**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```

## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size}

Количество потоков для параллельного удаления неактивных частей данных.

## max_pending_mutations_to_warn {#max_pending_mutations_to_warn}

Если количество ожидающих мутаций превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```

## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size}

Если количество **праздных** потоков в пуле десериализации префиксов превышает `max_prefixes_deserialization_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые неактивными потоками, и уменьшит размер пула. Потоки могут быть созданы снова при необходимости.

## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size}

ClickHouse использует потоки из пула десериализации префиксов для параллельного чтения метаданных столбцов и подсубколов из префиксов файлов в широких частях в MergeTree. `max_prefixes_deserialization_thread_pool_size` ограничивает максимальное количество потоков в пуле.

## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server}

Максимальная скорость обмена данными по сети в байтах в секунду для чтения.

:::note
Значение `0` (по умолчанию) означает неограниченную скорость.
:::

## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server}

Максимальная скорость обмена данными по сети в байтах в секунду для записи.

:::note
Значение `0` (по умолчанию) означает неограниченную скорость.
:::

## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server}

Максимальная скорость обмена данными по сети в байтах в секунду для реплицированных выборок. Ноль означает неограниченную скорость.

## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server}

Максимальная скорость обмена данными по сети в байтах в секунду для реплицированных отправок. Ноль означает неограниченную скорость.

## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw}

Если количество реплицированных таблиц превышает это значение, сервер выдаст исключение.

Подсчитываются только таблицы для движков баз данных:
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**

```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```

## max_server_memory_usage {#max_server_memory_usage}

Максимальное количество памяти, которое разрешено использовать серверу, выраженное в байтах.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается настройкой `max_server_memory_usage_to_ram_ratio`.
:::

В качестве особого случая значение `0` (по умолчанию) означает, что сервер может использовать всю доступную память (за исключением других ограничений, установленных `max_server_memory_usage_to_ram_ratio`).

## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio}

Максимальное количество памяти, которое разрешено использовать серверу, выраженное в соотношении с общей доступной памятью. Например, значение `0.9` (по умолчанию) означает, что сервер может потреблять 90% доступной памяти.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается настройкой `max_server_memory_usage`.
:::

## max_session_timeout {#max_session_timeout}

Максимальный таймаут сессии, в секундах.

**Пример**

```xml
<max_session_timeout>3600</max_session_timeout>
```

## max_table_num_to_throw {#max_table_num_to_throw}

Если количество таблиц превышает это значение, сервер выдаст исключение.

Следующие таблицы не подсчитываются:
- view
- remote
- dictionary
- system

Подсчитываются только таблицы для движков баз данных:
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**

```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```

## max_table_num_to_warn {#max_table_num_to_warn}

Если количество подключенных таблиц превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```

## max_table_size_to_drop {#max_table_size_to_drop}

Ограничение на удаление таблиц.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает `max_table_size_to_drop` (в байтах), вы не сможете удалить ее с помощью запроса [`DROP`](../../sql-reference/statements/drop.md) или запроса [`TRUNCATE`](../../sql-reference/statements/truncate.md).

:::note
Значение `0` означает, что вы можете удалять все таблицы без каких-либо ограничений.

Эта настройка не требует перезапуска сервера ClickHouse для применения. Другой способ отключить ограничение - создать файл `<clickhouse-path>/flags/force_drop_table`.
:::

**Пример**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```

## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size}

Максимальное количество хранилища, которое может быть использовано для внешней агрегации, соединений или сортировки. Запросы, превышающие этот лимит, завершатся с исключением.

:::note
Значение `0` означает неограниченное количество.
:::

См. также:
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

## max_thread_pool_free_size {#max_thread_pool_free_size}

Если количество **праздных** потоков в глобальном пуле потоков больше [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size), ClickHouse освободит ресурсы, занимаемые некоторыми потоками, и уменьшит размер пула. Потоки могут быть созданы снова при необходимости.

**Пример**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```

## max_thread_pool_size {#max_thread_pool_size}

ClickHouse использует потоки из глобального пула потоков для обработки запросов. Если нет праздного потока для обработки запроса, новый поток создается в пуле. `max_thread_pool_size` ограничивает максимальное количество потоков в пуле.

**Пример**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```

## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size}

Количество потоков для загрузки неактивного набора частей данных (непредвиденных) при старте.

## max_view_num_to_throw {#max_view_num_to_throw}

Если количество представлений превышает это значение, сервер выдаст исключение.

Подсчитываются только таблицы для движков баз данных:
- Atomic
- Ordinary
- Replicated
- Lazy

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**

```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```

## max_view_num_to_warn {#max_view_num_to_warn}

Если количество подключенных представлений превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```

## max_waiting_queries {#max_waiting_queries}

Ограничение на общее количество одновременно ожидающих запросов. Выполнение ожидающего запроса заблокировано, пока необходимые таблицы загружаются асинхронно (см. [`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases)).

:::note
Ожидающие запросы не учитываются, когда проверяются ограничения, контролируемые следующими настройками:

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

Это исправление сделано, чтобы избежать достижения этих лимитов сразу после старта сервера.
:::

:::note
Значение `0` (по умолчанию) означает неограниченное количество.

Эту настройку можно изменить во время работы, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::

## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker}

Должен ли фоновый работник памяти корректировать внутренний трекер памяти на основе информации из внешних источников, таких как jemalloc и cgroups.

## memory_worker_period_ms {#memory_worker_period_ms}

Период тиков фонового работника памяти, который корректирует использование памяти трекера и очищает неиспользуемые страницы во время высокого использования памяти. Если установлено значение 0, используется значение по умолчанию в зависимости от источника использования памяти.

## memory_worker_use_cgroup {#memory_worker_use_cgroup}

Используйте текущую информацию о использовании памяти cgroup для корректировки отслеживания памяти.

## merge_tree {#merge_tree}

Тонкая настройка для таблиц в [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Для получения дополнительной информации смотрите заголовочный файл MergeTreeSettings.h.

**Пример**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

## merge_workload {#merge_workload}

Используется для регулирования того, как ресурсы используются и делятся между слияниями и другими рабочими нагрузками. Указанное значение используется как значение настройки `workload` для всех фоновых слияний. Может быть переопределено настройкой дерева слияния.

**См. также**
- [Планирование рабочей нагрузки](/operations/workload-scheduling.md)

## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit}

Устанавливает предел на то, сколько ОЗУ разрешено использовать для выполнения операций слияний и мутаций. Если ClickHouse достигает установленного предела, он не будет планировать новые фоновые операции слияния или мутации, но будет продолжать выполнять уже запланированные задачи.

:::note
Значение `0` означает неограниченное количество.
:::

**Пример**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```

## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio}

Значение по умолчанию для `merges_mutations_memory_usage_soft_limit` рассчитывается как `memory_amount * merges_mutations_memory_usage_to_ram_ratio`.

**См. также:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)

## metric_log {#metric_log}

По умолчанию отключен.

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

Чтобы отключить настройку `metric_log`, вам следует создать следующий файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>

## mlock_executable {#mlock_executable}

Выполнить `mlockall` после старта, чтобы снизить задержку первых запросов и предотвратить выгрузку исполняемого файла ClickHouse при высокой нагрузке ввода-вывода.

:::note
Рекомендуется включать эту опцию, но она приведет к увеличению времени запуска до нескольких секунд. Имейте в виду, что эта настройка не будет работать без способности "CAP_IPC_LOCK".
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```

## mmap_cache_size {#mmap_cache_size}

Устанавливает размер кэша (в байтах) для сопоставленных файлов. Эта настройка позволяет избежать частых вызовов открытия/закрытия (которые очень дороги из-за последующих ошибок страниц) и переиспользовать сопоставления из нескольких потоков и запросов. Значение настройки - это количество сопоставленных областей (обычно равное количеству сопоставленных файлов).

Количество данных в сопоставленных файлах можно контролировать в следующих системных таблицах с использованием следующих метрик:

| Системная таблица                                                                                                                                                                                                                                                                                                                                                      | Метрика                                                                                                   |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [`system.metrics`](/operations/system-tables/metrics) и [`system.metric_log`](/operations/system-tables/metric_log)                                                                                                                                                                                                                               | `MMappedFiles` и `MMappedFileBytes`                                                                    |
| [`system.asynchronous_metrics_log`](/operations/system-tables/asynchronous_metric_log)                                                                                                                                                                                                                                                                              | `MMapCacheCells`                                                                                         |
| [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log) | `CreatedReadBufferMMap`, `CreatedReadBufferMMapFailed`, `MMappedFileCacheHits`, `MMappedFileCacheMisses` |

:::note
Количество данных в сопоставленных файлах не потребляет память напрямую и не учитывается в использовании памяти по запросам или серверу - поскольку эта память может быть выброшена аналогично кэшу страниц ОС. Кэш сбрасывается (файлы закрываются) автоматически при удалении старых частей в таблицах семейства MergeTree, также его можно сбросить вручную с помощью запроса `SYSTEM DROP MMAP CACHE`.

Эту настройку можно изменить во время работы, и она вступит в силу немедленно.
:::

## mutation_workload {#mutation_workload}

Используется для регулирования того, как ресурсы используются и делятся между мутациями и другими рабочими нагрузками. Указанное значение используется как значение настройки `workload` для всех фоновых мутаций. Может быть переопределено настройкой дерева слияния.

**См. также**
- [Планирование рабочей нагрузки](/operations/workload-scheduling.md)

## mysql_port {#mysql_port}

Порт для взаимодействия с клиентами по протоколу MySQL.

:::note
- Положительные целые числа указывают номер порта для прослушивания.
- Пустые значения используются для отключения взаимодействия с клиентами по протоколу MySQL.
:::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```
```
## openSSL {#openssl}

Конфигурация SSL клиента/сервера.

Поддержка SSL обеспечивается библиотекой `libpoco`. Доступные параметры конфигурации описаны в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи для настроек сервера/клиента:

| Опция                        | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Значение по умолчанию                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`              | Путь к файлу с секретным ключом PEM сертификата. Файл может содержать как ключ, так и сертификат.                                                                                                                                                                                                                                                                                                                                              |                                            |
| `certificateFile`             | Путь к файлу с сертификатом клиента/сервера в формате PEM. Вы можете пропустить этот параметр, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                                                |                                            |
| `caConfig`                    | Путь к файлу или директории, содержащей доверенные CA сертификаты. Если это файл, он должен быть в формате PEM и может содержать несколько CA сертификатов. Если это директория, она должна содержать один .pem файл на каждый CA сертификат. Имена файлов находятся с использованием хэш-значения имени субъекта CA. Подробности можно найти в руководстве по [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                            |
| `verificationMode`            | Метод проверки сертификатов узла. Подробности описаны в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                         | `relaxed`                                  |
| `verificationDepth`           | Максимальная длина цепочки проверки. Проверка не пройдет, если длина цепочки сертификатов превысит установленное значение.                                                                                                                                                                                                                                                                                                                                            | `9`                                        |
| `loadDefaultCAFile`           | Будут ли использованы встроенные CA сертификаты для OpenSSL. ClickHouse предполагает, что встроенные CA сертификаты находятся в файле `/etc/ssl/cert.pem` (или в директории `/etc/ssl/certs`) или в файле (или директории), указанной в переменной среды `SSL_CERT_FILE` (или `SSL_CERT_DIR`).                                                                                                                                                                        | `true`                                     |
| `cipherList`                  | Поддерживаемые шифрования OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | Включает или отключает кэширование сессий. Должен использоваться в сочетании с `sessionIdContext`. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                         | `false`                                    |
| `sessionIdContext`            | Уникальный набор случайных символов, который сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Этот параметр всегда рекомендуется, так как он помогает избежать проблем как в случае, если сервер кэширует сессию, так и в случае, если клиент запросил кэширование.                                                                                                                                                        | `$\{application.name\}`                      |
| `sessionCacheSize`            | Максимальное количество сессий, которое сервер кэширует. Значение `0` означает неограниченное количество сессий.                                                                                                                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | Время кэширования сессии на сервере в часах.                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                        |
| `extendedVerification`        | Если включено, проверьте, что CN или SAN сертификата соответствуют имени хоста пира.                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `requireTLSv1`                | Требуется соединение TLSv1. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `requireTLSv1_1`              | Требуется соединение TLSv1.1. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `requireTLSv1_2`              | Требуется соединение TLSv1.2. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `fips`                        | Активирует режим FIPS OpenSSL. Поддерживается, если версия OpenSSL библиотеки поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                    |
| `privateKeyPassphraseHandler` | Класс (подкласс PrivateKeyPassphraseHandler), который запрашивает пароль для доступа к приватному ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | Класс (подкласс CertificateHandler) для проверки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` .                                                                                                                                                                                                                                                                           | `RejectCertificateHandler`                 |
| `disableProtocols`            | Протоколы, которые не могут быть использованы.                                                                                                                                                                                                                                                                                                                                                                                                                             |                                            |
| `preferServerCiphers`         | Шифры сервера, предпочитаемые клиентом.                                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                    |

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
        <!-- Используйте для самоподписанных: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- Используйте для самоподписанных: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```

## opentelemetry_span_log {#opentelemetry_span_log}

Настройки для системной таблицы [`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md).

<SystemLogParameters/>

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

## page_cache_block_size {#page_cache_block_size}

Размер частей файла для хранения в кеше страниц пользовательского пространства, в байтах. Все чтения, проходящие через кэш, будут округлены до ближайшего кратного этого размера.

## page_cache_free_memory_ratio {#page_cache_free_memory_ratio}

Доля лимита памяти, которую следует держать свободной в кэше страниц пользовательского пространства. Аналогично настройке min_free_kbytes в Linux.

## page_cache_history_window_ms {#page_cache_history_window_ms}

Задержка перед тем, как освобожденная память может быть использована кэшем страниц пользовательского пространства.

## page_cache_lookahead_blocks {#page_cache_lookahead_blocks}

При промахе кэша страниц пользовательского пространства прочитайте до этого количества последовательных блоков сразу из основного хранилища, если они также не находятся в кэше. Каждый блок имеет размер page_cache_block_size байт.

## page_cache_max_size {#page_cache_max_size}

Максимальный размер кэша страниц пользовательского пространства. Установите в 0, чтобы отключить кэш. Если больше, чем page_cache_min_size, размер кэша будет непрерывно настраиваться в этом диапазоне, чтобы использовать большую часть доступной памяти, сохраняя при этом общее использование памяти ниже лимита (max_server_memory_usage[_to_ram_ratio]).

## page_cache_min_size {#page_cache_min_size}

Минимальный размер кэша страниц пользовательского пространства.

## page_cache_policy {#page_cache_policy}

Имя политики кэша страниц пользовательского пространства.

## page_cache_shards {#page_cache_shards}

Разделите кэш страниц пользовательского пространства на это количество шардов, чтобы уменьшить конкуренцию за мьютексы. Экспериментально, маловероятно, что это улучшит производительность.

## page_cache_size_ratio {#page_cache_size_ratio}

Размер защищенной очереди в кэше страниц пользовательского пространства относительно общего размера кэша.

## part_log {#part_log}

Логирование событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Например, добавление или слияние данных. Вы можете использовать журнал для моделирования алгоритмов слияния и сравнения их характеристик. Вы можете визуализировать процесс слияния.

Запросы записываются в таблицу [system.part_log](/operations/system-tables/part_log), а не в отдельный файл. Вы можете настроить имя этой таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

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

Период для полного удаления частей для SharedMergeTree. Доступно только в ClickHouse Cloud.

## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add}

Добавляет равномерно распределенное значение от 0 до x секунд к kill_delay_period, чтобы избежать эффекта молнии и последующего DoS ZooKeeper в случае очень большого количества таблиц. Доступно только в ClickHouse Cloud.

## parts_killer_pool_size {#parts_killer_pool_size}

Потоки для очистки устаревших потоков совместного дерева слияния. Доступно только в ClickHouse Cloud.

## path {#path}

Путь к директории, содержащей данные.

:::note
Заключительный слеш обязателен.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```

## postgresql_port {#postgresql_port}

Порт для связи с клиентами по протоколу PostgreSQL.

:::note
- Положительные целые числа указывают номер порта, на который нужно прослушивать
- Пустые значения используются для отключения связи с клиентами по протоколу MySQL.
:::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```

## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size}

Размер пула фона для предварительной выборки для удаленных объектных хранилищ.

## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size}

Количество задач, которые можно добавить в пул предварительных выборок.

## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size}

Максимальное число заданий, которые можно запланировать в пуле потоков десериализации префиксов.

:::note
Значение `0` означает неограниченное количество.
:::

## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup}

Если точно, ClickHouse создает все сконфигурированные таблицы `system.*_log` перед стартом. Это может быть полезно, если некоторые стартовые скрипты зависят от этих таблиц.

## primary_index_cache_policy {#primary_index_cache_policy}

Имя политики кэша основного индекса.

## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio}

Соотношение общего размера кэша меток, которое нужно заполнить во время предварительного прогрева.

## primary_index_cache_size {#primary_index_cache_size}

Максимальный размер кэша для основного индекса (индекс таблиц семейства MergeTree).

## primary_index_cache_size_ratio {#primary_index_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше основного индекса относительно общего размера кэша.

## processors_profile_log {#processors_profile_log}

Настройки для системной таблицы [`processors_profile_log`](../system-tables/processors_profile_log.md).

<SystemLogParameters/>

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

Экспорт метрик для снятия данных с [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP-эндпоинт для снятия метрик сервером prometheus. Начинается с '/'.
- `port` – Порт для `endpoint`.
- `metrics` – Экспортировать метрики из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Экспортировать метрики из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Экспортировать текущие значения метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).
- `errors` - Экспортировать количество ошибок по кодам ошибок, возникших с момента последнего перезапуска сервера. Эта информация также может быть получена из [system.errors](/operations/system-tables/errors).

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

Определите прокси-серверы для HTTP и HTTPS запросов, в настоящее время поддерживаемые хранилищем S3, табличными функциями S3 и URL-функциями.

Существует три способа определения прокси-серверов:
- переменные среды
- списки прокси
- удаленные разрешатели прокси.

Может быть также поддержано обход прокси-серверов для конкретных хостов с использованием `no_proxy`.

**Переменные среды**

Переменные окружения `http_proxy` и `https_proxy` позволяют вам указать прокси-сервер для заданного протокола. Если она установлена в вашей системе, она должна работать без проблем.

Это самый простой подход, если для данного протокола существует только один прокси-сервер и этот прокси-сервер не изменяется.

**Списки прокси**

Этот подход позволяет вам указать один или несколько прокси-серверов для протокола. Если определено более одного прокси-сервера, ClickHouse использует различные прокси-серверы по круговой очереди, распределяя нагрузку между серверами. Это самый простой подход, если для протокола существует более одного прокси-сервера и список прокси-серверов не изменяется.

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

Выберите родительское поле в таблицах ниже, чтобы просмотреть их дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле     | Описание                         |
|-----------|-------------------------------------|
| `<http>`  | Список одного или нескольких HTTP прокси  |
| `<https>` | Список одного или нескольких HTTPS прокси |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| Поле   | Описание          |
|---------|----------------------|
| `<uri>` | URI прокси |

  </TabItem>
</Tabs>

**Удаленные разрешатели прокси**

Возможно, прокси-серверы меняются динамически. В этом случае можно определить конечную точку разрешателя. ClickHouse отправляет пустой GET-запрос на эту конечную точку, удаленный разрешатель должен вернуть хост прокси. ClickHouse будет использовать его для формирования URI прокси с использованием следующего шаблона: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

Выберите родительское поле в таблицах ниже, чтобы просмотреть их дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле    | Описание                      |
|----------|----------------------------------|
| `<http>` | Список одного или нескольких разрешителей* |
| `<https>` | Список одного или нескольких разрешителей* |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| Поле       | Описание                                   |
|-------------|-----------------------------------------------|
| `<resolver>` | Конечная точка и другие детали для разрешителя |

:::note
Вы можете иметь несколько элементов `<resolver>`, но только первый
`<resolver>` для данного протокола используется. Любые другие элементы `<resolver>`
для этого протокола игнорируются. Это означает, что балансировка нагрузки
(если необходимо) должна быть реализована удаленным разрешителем.
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| Поле               | Описание                                                                                                                                                                            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | URI разрешителя прокси                                                                                                                                                          |
| `<proxy_scheme>`    | Протокол конечного URI прокси. Это может быть либо `http`, либо `https`.                                                                                                             |
| `<proxy_port>`      | Номер порта разрешителя прокси                                                                                                                                                  |
| `<proxy_cache_time>` | Время в секундах, в течение которого значения от разрешителя должны кэшироваться ClickHouse. Установка этого значения в `0` заставляет ClickHouse обращаться к разрешителю для каждого HTTP или HTTPS запроса. |

  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:

| Порядок | Настройка                |
|-------|------------------------|
| 1.    | Удаленные разрешители прокси |
| 2.    | Списки прокси            |
| 3.    | Переменные среды          |

ClickHouse будет проверять тип разрешателя с наивысшим приоритетом для запрашиваемого протокола. Если он не определен,
он проверит следующий тип разрешителя с нижним приоритетом, пока не дойдет до разрешателя в переменных окружения.
Это также позволяет использовать смешанные типы разрешителей.

## query_cache {#query_cache}

Конфигурация [кэша запросов](../query-cache.md).

Доступные следующие настройки:

| Настройка                   | Описание                                                                            | Значение по умолчанию |
|---------------------------|----------------------------------------------------------------------------------------|---------------|
| `max_size_in_bytes`       | Максимальный размер кэша в байтах. `0` означает, что кэш запросов отключен.                | `1073741824`  |
| `max_entries`             | Максимальное количество результатов `SELECT` запросов, хранящихся в кэше.                      | `1024`        |
| `max_entry_size_in_bytes` | Максимальный размер в байтах, который могут иметь результаты `SELECT` запросов, чтобы быть сохраненными в кэше.    | `1048576`     |
| `max_entry_size_in_rows`  | Максимальное количество строк, которые могут иметь результаты `SELECT` запросов, чтобы быть сохраненными в кэше.   | `30000000`    |

:::note
- Измененные настройки вступают в силу немедленно.
- Данные для кэша запросов размещаются в DRAM. Если память на исходе, убедитесь, что установили небольшое значение для `max_size_in_bytes` или полностью отключили кэш запросов.
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

Имя политики кэша условий запроса.

## query_condition_cache_size {#query_condition_cache_size}

Максимальный размер кэша условий запроса.
:::note
Эту настройку можно изменить во время выполнения, и она немедленно вступит в силу.
:::

## query_condition_cache_size_ratio {#query_condition_cache_size_ratio}

Размер защищенной очереди в кэше условий запроса относительно общего размера кэша.

## query_log {#query_log}

Настройка для логирования запросов, полученных с помощью настройки [log_queries=1](../../operations/settings/settings.md).

Запросы записываются в таблицу [system.query_log](/operations/system-tables/query_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст ее. Если структура журнала запросов изменилась после обновления сервера ClickHouse, таблица со старой структурой будет переименована, а новая таблица будет создана автоматически.

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

Правила на основе регулярных выражений, которые будут применяться к запросам, а также ко всем сообщениям журналов перед их сохранением в серверных журналах,
[`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) таблицах и в журналах, отправленных клиенту. Это позволяет предотвращать утечку
чувствительных данных из SQL запросов, таких как имена, электронные почты, личные идентификаторы или номера кредитных карт в журналы.

**Пример**

```xml
<query_masking_rules>
    <rule>
        <name>скрыть SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**Поля конфигурации**:

| Настройка | Описание                                                                   |
|-----------|-------------------------------------------------------------------------------|
| `name`    | имя правила (необязательное)                                                  |
| `regexp`  | регулярное выражение, совместимое с RE2 (обязательное)                                 |
| `replace` | строка замены для чувствительных данных (необязательное, по умолчанию - шесть звездочек) |

Правила маскирования применяются ко всему запросу (чтобы предотвратить утечку чувствительных данных из неправильно сформированных / непарсируемых запросов).

В таблице [`system.events`](/operations/system-tables/events) есть счетчик `QueryMaskingRulesMatch`, который содержит общее количество совпадений правил маскирования запросов.

Для распределенных запросов каждый сервер должен быть настроен отдельно, в противном случае подзапросы, переданные на другие
узлы, будут сохранены без маскирования.

## query_metric_log {#query_metric_log}

По умолчанию отключен.

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

Чтобы отключить настройку `query_metric_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_thread_log {#query_thread_log}

Настройка для логирования потоков запросов, полученных с помощью настройки [log_query_threads=1](/operations/settings/settings#log_query_threads).

Запросы записываются в таблицу [system.query_thread_log](/operations/system-tables/query_thread_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала потоков запросов изменилась при обновлении сервера ClickHouse, таблица с устаревшей структурой будет переименована, а новая таблица будет автоматически создана.

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

Настройка для логирования представлений (живых, материализованных и т. д.), зависимых от запросов, полученных с помощью настройки [log_query_views=1](/operations/settings/settings#log_query_views).

Запросы записываются в таблицу [system.query_views_log](/operations/system-tables/query_views_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала представлений запросов изменилась при обновлении сервера ClickHouse, таблица с устаревшей структурой будет переименована, а новая таблица будет автоматически создана.

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

Настройка для перераспределения памяти для машинного кода ("текста") с использованием больших страниц.

:::note
Эта функция является высокоэкспериментальной.
:::

Пример:

```xml
<remap_executable>false</remap_executable>
```
## remote_servers {#remote_servers}

Конфигурация кластеров, используемых движком таблиц [Distributed](../../engines/table-engines/special/distributed.md) и функцией таблицы `cluster`.

**Пример**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

Для значения атрибута `incl` см. раздел "[Файлы конфигурации](/operations/configuration-files)".

**См. также**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Cluster Discovery](../../operations/cluster-discovery.md)
- [Replicated database engine](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts}

Список хостов, которые разрешено использовать в движках хранения и функциях таблиц, связанных с URL.

При добавлении хоста с помощью тега xml `\<host\>`:
- он должен быть указан точно так же, как в URL, так как имя проверяется перед разрешением DNS. Например: `<host>clickhouse.com</host>`
- если порт явно указан в URL, то проверяется хост:порт как единое целое. Например: `<host>clickhouse.com:80</host>`
- если хост указан без порта, то разрешены любые порты хоста. Например: если указан `<host>clickhouse.com</host>`, то разрешены `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т.д.
- если хост указан как IP-адрес, то он проверяется так, как указано в URL. Например: `[2a02:6b8:a::a]`.
- если есть перенаправления и поддержка перенаправлений включена, то проверяется каждое перенаправление (поле location).

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## replica_group_name {#replica_group_name}

Имя группы реплик для базы данных Replicated.

Кластер, созданный над реплицированной базой данных, будет состоять из реплик в одной и той же группе.
DDL запросы будут ждать только реплик в одной и той же группе.

По умолчанию пусто.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout}

Таймаут HTTP соединения для запросов получения частей. Унаследован от профиля по умолчанию `http_connection_timeout`, если не установлен явно.
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout}

Таймаут приема HTTP для запросов получения частей. Унаследован от профиля по умолчанию `http_receive_timeout`, если не установлен явно.
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout}

Таймаут отправки HTTP для запросов получения частей. Унаследован от профиля по умолчанию `http_send_timeout`, если не установлен явно.
## replicated_merge_tree {#replicated_merge_tree}

Тонкая настройка для таблиц в [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Эта настройка имеет более высокий приоритет.

Для получения более подробной информации смотрите файл заголовка MergeTreeSettings.h.

**Пример**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```
## restore_threads {#restore_threads}

Максимальное количество потоков для выполнения запросов RESTORE.
## s3queue_log {#s3queue_log}

Настройки для системной таблицы `s3queue_log`.

<SystemLogParameters/>

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

Настройки для отправки отчетов о сбоях команде разработчиков ClickHouse через [Sentry](https://sentry.io) на основании пожелания.

Включение этой функции, особенно в предварительных производственных средах, высоко рекомендуется.

Серверу потребуется доступ в интернет по протоколу IPv4 (на момент написания IPv6 не поддерживается Sentry) для корректной работы этой функции.

Ключи:

| Ключ                   | Описание                                                                                                                                                                                            |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | Логический флаг для включения функции, по умолчанию `false`. Установите в `true`, чтобы разрешить отправку отчетов о сбоях.                                                                                                  |
| `send_logical_errors` | `LOGICAL_ERROR` подобен `assert`, это ошибка в ClickHouse. Этот логический флаг включает отправку этих исключений в sentry (по умолчанию: `false`).                                                        |
| `endpoint`            | Вы можете переопределить URL-адрес конечной точки Sentry для отправки отчетов о сбоях. Это может быть либо отдельная учетная запись Sentry, либо ваш собственный самоуправляемый экземпляр Sentry. Используйте синтаксис [Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=native#configure-the-sdk).                  |
| `anonymize`           | Избегайте прикрепления имени хоста сервера к отчету о сбое.                                                                                                                                               |
| `http_proxy`          | Настройте HTTP-прокси для отправки отчетов о сбоях.                                                                                                                                                        |
| `debug`               | Устанавливает клиент Sentry в режим отладки.                                                                                                                                                                |
| `tmp_path`            | Путь к файловой системе для временного состояния отчета о сбое.                                                                                                                                                      |
| `environment`         | Произвольное имя среды, в которой работает сервер ClickHouse. Оно будет упомянуто в каждом отчете о сбое. Значение по умолчанию - `test` или `prod` в зависимости от версии ClickHouse. |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## series_keeper_path {#series_keeper_path}

Путь в Keeper с автоинкрементными номерами, генерируемыми функцией `generateSerialID`. Каждая серия будет являться узлом под этим путем.
## show_addresses_in_stack_traces {#show_addresses_in_stack_traces}

Если установлено в true, будут показаны адреса в трассировках стека.
## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores}

Если установлено в true, ClickHouse будет ждать завершения работающих резервных копий и восстановлений перед завершением работы.
## shutdown_wait_unfinished {#shutdown_wait_unfinished}

Задержка в секундах для ожидания незавершенных запросов.
## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries}

Если установлено в true, ClickHouse будет ждать завершения запущенных запросов перед завершением работы.
## ssh_server {#ssh_server}

Публичная часть ключа хоста будет записана в файл known_hosts
на стороне SSH клиента при первом подключении.

Конфигурации ключей хоста по умолчанию не активны.
Раскомментируйте конфигурации ключей хоста и укажите путь к соответствующему ssh ключу, чтобы активировать их:

Пример:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## storage_configuration {#storage_configuration}

Позволяет многодисковую конфигурацию хранения.

Конфигурация хранения следует структуре:

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

Конфигурация `disks` следует структуре, представленной ниже:

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

Подтеги выше определяют следующие настройки для `disks`:

| Настройка                 | Описание                                                                                           |
|-------------------------|-------------------------------------------------------------------------------------------------------|
| `<disk_name_N>`         | Имя диска, которое должно быть уникальным.                                                         |
| `path`                  | Путь, по которому будут храниться данные сервера (`каталоги data и shadow`). Должен заканчиваться `/` |
| `keep_free_space_bytes` | Размер зарезервированного свободного места на диске.                                                              |

:::note
Порядок дисков не имеет значения.
:::
### Конфигурация политик {#configuration-of-policies}

Подтеги выше определяют следующие настройки для `policies`:

| Настройка                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`              | Имя объема. Имена объемов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `disk`                       | Диск, находящийся внутри объема.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes`   | Максимальный размер части данных, который может находиться на любом из дисков в этом объеме. Если результат слияния приводит к размеру части, ожидаемому больше, чем max_data_part_size_bytes, часть будет записана в следующий объем. В основном, эта функция позволяет вам хранить новые / маленькие части на горячем (SSD) объеме и перемещать их на холодный (HDD) объем, когда они достигают большого размера. Не используйте эту опцию, если политика имеет только один объем.                                                                 |
| `move_factor`                | Доля доступного свободного места на объеме. Если места становится меньше, данные начнут передаваться в следующий объем, если он есть. Для передачи части сортируются по размеру от большего к меньшему (в порядке убывания), и выбираются части, общий размер которых достаточно для удовлетворения условия `move_factor`. Если общий размер всех частей недостаточен, все части будут перемещены.                                                                                                           |
| `perform_ttl_move_on_insert` | Отключает перемещение данных с истекшим TTL при вставке. По умолчанию (если включено), если мы вставляем часть данных, которая уже истекла в соответствии с правилом перемещения по сроку службы, она немедленно перемещается в указанный в правиле объем / диск. Это может значительно замедлить вставку, если целевой объем / диск медленен (например, S3). Если отключить, истекшая часть данных будет записана в объем по умолчанию и затем немедленно перемещена в объем, указанный в правиле для истекшего TTL. |
| `load_balancing`             | Политика балансировки дисков, `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`          | Устанавливает таймаут (в миллисекундах) для обновления доступного места на всех дисках (`0` - всегда обновлять, `-1` - никогда не обновлять, значение по умолчанию `60000`). Обратите внимание, если диск используется только ClickHouse и не будет подвергаться изменениям файловой системы на лету, можно использовать значение `-1`. В остальных случаях это не рекомендуется, так как это в конечном итоге приведет к неправильному распределению памяти.                                                                                                                   |
| `prefer_not_to_merge`        | Отключает слияние частей данных на этом объеме. Примечание: это потенциально вредно и может привести к замедлению работы. При включении этой настройки (не делайте этого) слияние данных на этом объеме запрещено (что плохо). Это позволяет контролировать, как ClickHouse взаимодействует с медленными дисками. Мы рекомендуем вообще не использовать это.                                                                                                                                                                                       |
| `volume_priority`            | Определяет приоритет (порядок), в котором заполняются объемы. Чем меньше значение, тем выше приоритет. Значения параметров должны быть натуральными числами и охватывать диапазон от 1 до N (N - максимальное указанное значение параметра) без пропусков.                                                                                                                                                                                                                                                                |

Для `volume_priority`:
- Если все объемы имеют этот параметр, они имеют приоритет в указанном порядке.
- Если только _некоторые_ объемы имеют этот параметр, объемы, не имеющие его, имеют самый низкий приоритет. Те, которые его имеют, имеют приоритет в соответствии с значением тега, а приоритет остальных определяется порядком описания в конфигурационном файле относительно друг друга.
- Если _ни одному_ объему не присвоен этот параметр, их порядок определяется порядком описания в конфигурационном файле.
- Приоритет объемов может не совпадать.
## storage_connections_soft_limit {#storage_connections_soft_limit}

Подключения, превышающие этот лимит, имеют значительно более короткое время жизни. Лимит применяется к соединениям с хранилищами.
## storage_connections_store_limit {#storage_connections_store_limit}

Подключения, превышающие этот лимит, сбрасываются после использования. Установите 0, чтобы отключить кэширование соединений. Лимит применяется к соединениям с хранилищами.
## storage_connections_warn_limit {#storage_connections_warn_limit}

Предупреждающие сообщения записываются в журналы, если количество используемых подключений превышает этот лимит. Лимит применяется к соединениям с хранилищами.
## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key}

Запись файлов метаданных диска в формате VERSION_FULL_OBJECT_KEY.
## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid}

Если включено, внутренний UUID генерируется во время создания SharedSet и SharedJoin. Только для ClickHouse Cloud.
## table_engines_require_grant {#table_engines_require_grant}

Если установлено в true, пользователям требуется разрешение для создания таблицы с определенным движком, например, `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию для обеспечения обратной совместимости создание таблицы с определенным движком таблицы игнорирует разрешение, однако вы можете изменить это поведение, установив это значение в true.
:::
## tables_loader_background_pool_size {#tables_loader_background_pool_size}

Устанавливает количество потоков, выполняющих асинхронные операции загрузки в фоновом режиме. Фоновый пул используется для асинхронной загрузки таблиц после запуска сервера в случае, если нет ожиданий запросов на таблицу. Будет полезно сохранять низкое количество потоков в фоновом пуле, если имеется большое количество таблиц. Это зарезервирует ресурсы CPU для одновременного выполнения запросов.

:::note
Значение `0` означает, что будут использованы все доступные CPU.
:::
## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size}

Устанавливает количество потоков, выполняющих операции загрузки в переднем плане. Фронтальный пул используется для синхронной загрузки таблицы до того, как сервер начнет слушать порт, и для загрузки таблиц, которые ожидаются. Фронтальный пул имеет более высокий приоритет чем фоновый пул. Это означает, что ни одна работа в фоновом пуле не начнется, пока есть выполняющиеся работы в фронтальном пуле.

:::note
Значение `0` означает, что будут использованы все доступные CPU.
:::
## tcp_port {#tcp_port}

Порт для общения с клиентами по протоколу TCP.

**Пример**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure}

TCP порт для безопасного взаимодействия с клиентами. Используйте его с настройками [OpenSSL](#openssl).

**Значение по умолчанию**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## tcp_ssh_port {#tcp_ssh_port}

Порт для SSH сервера, который позволяет пользователю подключаться и выполнять запросы интерактивно с использованием встроенного клиента через PTY.

Пример:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## temporary_data_in_cache {#temporary_data_in_cache}

С этой опцией временные данные будут храниться в кэше для данного диска.
В этом разделе вы должны указать имя диска с типом `cache`.
В этом случае кэш и временные данные будут делить одно и то же пространство, и кэш диска может быть освобожден для создания временных данных.

:::note
Можно использовать только одну опцию для конфигурации временного хранения данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
:::

**Пример**

В кэше для `local_disk` и временные данные будут храниться в `/tiny_local_cache` в файловой системе, управляемой `tiny_local_cache`.

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
## text_log {#text_log}

Настройки для системной таблицы [text_log](/operations/system-tables/text_log) для логирования текстовых сообщений.

<SystemLogParameters/>

Дополнительно:

| Настройка | Описание                                                                                                                                                                                                 | Значение по умолчанию       |
|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `level` | Максимальный уровень сообщения (по умолчанию `Trace`), который будет храниться в таблице.                                                                                                                                 | `Trace`             |

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

Максимальное количество задач, которые могут быть запланированы в глобальном пуле потоков. Увеличение размера очереди ведет к большему использованию памяти. Рекомендуется держать это значение равным [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size).

:::note
Значение `0` означает неограниченно.
:::

**Пример**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```
## threadpool_writer_pool_size {#threadpool_writer_pool_size}

Размер фонового пула для запросов записи в объектные хранилища.
## threadpool_writer_queue_size {#threadpool_writer_queue_size}

Количество задач, которые можно отправить в фоновый пул для запросов записи в объектные хранилища.
## throw_on_unknown_workload {#throw_on_unknown_workload}

Определяет поведение при доступе к неизвестной WORKLOAD с настройкой запроса 'workload'.

- Если `true`, выбрасывается исключение RESOURCE_ACCESS_DENIED из запроса, который пытается получить доступ к неизвестной нагрузке. Полезно для обеспечения планирования ресурсов для всех запросов после установки иерархии WORKLOAD и добавления WORKLOAD по умолчанию.
- Если `false` (по умолчанию), предоставляется неограниченный доступ без планирования ресурсов запросу с настройкой 'workload', указывающей на неизвестную нагрузку. Это важно на этапе настройки иерархии WORKLOAD, до добавления WORKLOAD по умолчанию.

**Пример**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**См. также**
- [Планирование загрузки](/operations/workload-scheduling.md)
## timezone {#timezone}

Часовой пояс сервера.

Указывается в виде идентификатора IANA для часового пояса UTC или географического местоположения (например, Africa/Abidjan).

Часовой пояс необходим для преобразования между строковыми и временными форматами, когда поля DateTime выводятся в текстовый формат (выводятся на экран или в файл), и при получении DateTime из строки. Кроме того, часовой пояс используется в функциях, которые работают с временем и датой, если они не получили часовой пояс в качестве входных параметров.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**См. также**

- [session_timezone](../settings/settings.md#session_timezone)
## tmp_path {#tmp_path}

Путь на локальной файловой системе для хранения временных данных для обработки больших запросов.

:::note
- Можно использовать только одну опцию для конфигурации временного хранения данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- Закрывающий слэш является обязательным.
  :::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```

## tmp_policy {#tmp_policy}

Политика хранения для временных данных. Для получения дополнительной информации см. документацию по [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree).

:::note
- Можно использовать только один параметр для настройки хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes` игнорируются.
- Политика должна иметь ровно *один том* с *локальными* дисками.
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
## top_level_domains_list {#top_level_domains_list}

Определяет список пользовательских доменов верхнего уровня, которые необходимо добавить. Каждый элемент имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

Смотрите также:
- функция [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) и её вариации, 
  которая принимает имя пользовательского списка TLD и возвращает часть домена, которая включает поддомены верхнего уровня вплоть до первого значимого поддомена.
## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size}

Собирает случайные выделения памяти размером меньше или равным указанному значению с вероятностью, равной `total_memory_profiler_sample_probability`. 0 означает отключено. Вы можете установить 'max_untracked_memory' в 0, чтобы этот предел работал как ожидается.
## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size}

Собирает случайные выделения памяти размером больше или равным указанному значению с вероятностью, равной `total_memory_profiler_sample_probability`. 0 означает отключено. Вы можете установить 'max_untracked_memory' в 0, чтобы этот предел работал как ожидается.
## total_memory_profiler_step {#total_memory_profiler_step}

Когда использование памяти сервером становится больше, чем каждый следующий шаг в байтах, профилировщик памяти будет собирать трассировку стека выделений. Ноль означает отключённый профилировщик памяти. Значения ниже нескольких мегабайт замедлят работу сервера.
## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability}

Позволяет собирать случайные выделения и освобождения памяти и записывать их в системную таблицу [system.trace_log](../../operations/system-tables/trace_log.md) с `trace_type`, равным `MemorySample`, с заданной вероятностью. Вероятность применяется ко всем выделениям и освобождениям, независимо от размера выделения. Обратите внимание, что выборка происходит только при превышении объема незарегистрированной памяти лимита незарегистрированной памяти (значение по умолчанию — `4` MiB). Его можно уменьшить, если [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step) будет уменьшен. Вы можете установить `total_memory_profiler_step` равным `1` для более детальной выборки.

Возможные значения:

- Положительное целое число.
- `0` — Запись случайных выделений и освобождений памяти в системную таблицу `system.trace_log` отключена.
## trace_log {#trace_log}

Настройки для работы системной таблицы [trace_log](/operations/system-tables/trace_log).

<SystemLogParameters/>

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

Имя политики кеширования без сжатия.
## uncompressed_cache_size {#uncompressed_cache_size}

Максимальный размер (в байтах) для несжатых данных, используемых движками таблиц из семейства MergeTree.

Существует один общий кеш для сервера. Память выделяется по запросу. Кеш используется, если опция use_uncompressed_cache включена.

Несжатый кеш полезен для очень коротких запросов в отдельных случаях.

:::note
Значение `0` означает отключено.

Эта настройка может быть изменена во время выполнения и будет действовать немедленно.
:::
## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio}

Размер защищённой очереди (в случае политики SLRU) в несжатом кеше относительно общего размера кеша.
## url_scheme_mappers {#url_scheme_mappers}

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

Способ хранения заголовков частей данных в ZooKeeper. Эта настройка применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Её можно указать:

**Глобально в разделе [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует настройку для всех таблиц на сервере. Вы можете изменить настройку в любое время. Существующие таблицы изменяют своё поведение, когда настройка меняется.

**Для каждой таблицы**

При создании таблицы укажите соответствующую [настройку движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этой настройкой не изменится, даже если глобальная настройка изменится.

**Возможные значения**

- `0` — Функциональность отключена.
- `1` — Функциональность включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицированные](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки частей данных компактно, используя один `znode`. Если таблица содержит много столбцов, этот способ хранения значительно снижает объем данных, хранящихся в Zookeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` вы не можете понизить версию сервера ClickHouse до версии, которая не поддерживает эту настройку. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все серверы одновременно. Безопаснее протестировать новые версии ClickHouse в тестовой среде или на нескольких серверах кластера.

Заголовки частей данных, уже хранящиеся с этой настройкой, не могут быть восстановлены в их прежнее (некомпактное) представление.
:::
## user_defined_executable_functions_config {#user_defined_executable_functions_config}

Путь к конфигурационному файлу для исполняемых пользовательских функций.

Путь:

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать подстановочные знаки \* и ?.

Смотрите также:
- "[Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions)".

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## user_defined_path {#user_defined_path}

Каталог с пользовательскими определёнными файлами. Используется для SQL пользовательских определённых функций [SQL User Defined Functions](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## user_directories {#user_directories}

Раздел файла конфигурации, содержащий настройки:
- Путь к конфигурационному файлу с предопределёнными пользователями.
- Путь к папке, где хранятся пользователи, созданные SQL-командами.
- Путь узла ZooKeeper, где хранятся и реплицируются пользователи, созданные SQL-командами (экспериментально).

Если этот раздел указан, путь из [users_config](/operations/server-configuration-parameters/settings#users_config) и [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) не будет использоваться.

Раздел `user_directories` может содержать любое количество элементов, порядок которых определяет их приоритет (чем выше элемент, тем выше приоритет).

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

Вы также можете определить секции `memory` — что означает хранение информации только в памяти, без записи на диск, и `ldap` — что означает хранение информации на LDAP-сервере.

Чтобы добавить LDAP-сервер в качестве удалённого каталога пользователей, которые не определены локально, определите единственную секцию `ldap` со следующими настройками:

| Настройка  | Описание                                                                                                                                                                                                                                                                                                                                                                    |
|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server`   | одно из имён серверов LDAP, определённых в разделе `ldap_servers`. Этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                        |
| `roles`    | секция со списком локально определённых ролей, которые будут назначены каждому пользователю, полученному из LDAP-сервера. Если роли не указаны, пользователь не сможет выполнить никаких действий после аутентификации. Если какая-либо из перечисленных ролей не определена локально на момент аутентификации, попытка аутентификации провалится, как если бы введённый пароль был неверным. |

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

Каталог с пользовательскими файлами. Используется в табличной функции [file()](../../sql-reference/table-functions/file.md), [fileCluster()](../../sql-reference/table-functions/fileCluster.md).

**Пример**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
## user_scripts_path {#user_scripts_path}

Каталог с файлами пользовательских скриптов. Используется для исполняемых пользовательских функций [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).

**Пример**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

Тип:

По умолчанию:
## users_config {#users_config}

Путь к файлу, который содержит:

- Конфигурации пользователей.
- Права доступа.
- Профили настроек.
- Настройки квоты.

**Пример**

```xml
<users_config>users.xml</users_config>
```
## validate_tcp_client_information {#validate_tcp_client_information}

Проверка client_information в запросе пакета по протоколу TCP.
## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries}

Размер кеша для индекса векторного сходства в записях. Ноль означает отключено.
## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy}

Имя политики кеша для индекса векторного сходства.
## vector_similarity_index_cache_size {#vector_similarity_index_cache_size}

Размер кеша для индекса векторного сходства в байтах. Ноль означает отключено.
## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio}

Размер защищённой очереди (в случае политики SLRU) в кеше индекса векторного сходства относительно общего размера кеша.
## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup}

Эта настройка позволяет определить поведение, если `dictionaries_lazy_load` равно `false`.
(Если `dictionaries_lazy_load` равно `true`, эта настройка не оказывает никакого влияния.)

Если `wait_dictionaries_load_at_startup` равно `false`, то сервер
начнёт загружать все словари при старте, и он будет принимать соединения параллельно с этой загрузкой.
Когда словарь используется в запросе первый раз, то запрос будет ждать, пока словарь загрузится, если он ещё не загружен.
Установка `wait_dictionaries_load_at_startup` в `false` может ускорить запуск ClickHouse, однако некоторые запросы могут выполняться медленнее
(поскольку им придётся ждать загрузки некоторых словарей).

Если `wait_dictionaries_load_at_startup` равно `true`, то сервер будет ждать при старте
пока все словари завершат свою загрузку (успешно или нет) перед тем, как принимать любые соединения.

**Пример**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```
## workload_path {#workload_path}

Каталог, используемый в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется папка `/workload/` в рабочем каталоге сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**Смотрите также**
- [Workload Hierarchy](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path}

Путь к узлу ZooKeeper, который используется как хранилище для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для согласованности все SQL определения хранятся в качестве значения этого единственного znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**Смотрите также**
- [Workload Hierarchy](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
## zookeeper {#zookeeper}

Содержит настройки, которые позволяют ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицированных таблиц. Если реплицированные таблицы не используются, этот раздел параметров можно пропустить.

Следующие настройки могут быть настроены с помощью под-тегов:

| Настройка                                    | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|--------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                     | Точка доступа ZooKeeper. Вы можете установить несколько конечных точек. Например, `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` указывает порядок узла при попытке подключиться к кластеру ZooKeeper.                                                                                                                                                                                                                                                                                            |
| `session_timeout_ms`                       | Максимальный тайм-аут для сессии клиента в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `operation_timeout_ms`                     | Максимальный тайм-аут для одной операции в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `root` (опционально)                          | Znode, который используется в качестве корня для znodes, используемых сервером ClickHouse.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `fallback_session_lifetime.min` (опционально) | Минимальный предел для срока действия сессии ZooKeeper до резервного узла, когда основной недоступен (балансировка нагрузки). Указывается в секундах. Значение по умолчанию: 3 часа.                                                                                                                                                                                                                                                                                                                                                              |
| `fallback_session_lifetime.max` (опционально) | Максимальный предел для срока действия сессии ZooKeeper до резервного узла, когда основной недоступен (балансировка нагрузки). Указывается в секундах. Значение по умолчанию: 6 часов.                                                                                                                                                                                                                                                                                                                                                              |
| `identity` (опционально)                      | Имя пользователя и пароль, требуемые ZooKeeper для доступа к запрашиваемым znodes.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `use_compression` (опционально)               | Включает сжатие в протоколе Keeper, если установлено значение true.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

Также существует настройка `zookeeper_load_balancing` (опционально), которая позволяет выбрать алгоритм для выбора узла ZooKeeper:

| Название алгоритма                   | Описание                                                                                                                    |
|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `random`                             | случайным образом выбирает один из узлов ZooKeeper.                                                                        |
| `in_order`                           | выбирает первый узел ZooKeeper, если он недоступен, то второй и т. д.                                                     |
| `nearest_hostname`                   | выбирает узел ZooKeeper с именем хоста, наиболее сходным с именем хоста сервера, имя хоста сравнивается с префиксом имени. |
| `hostname_levenshtein_distance`      | так же как nearest_hostname, но сравнивает имя хоста по методу расстояния Левенштейна.                                     |
| `first_or_random`                    | выбирает первый узел ZooKeeper, если он недоступен, то случайным образом выбирает один из оставшихся узлов ZooKeeper.     |
| `round_robin`                        | выбирает первый узел ZooKeeper, если происходит повторное подключение, выбирает следующий.                                 |

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
    <!-- Опционально. Suффикс Chroot. Должен существовать. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Опционально. Строка ACL для метода аутентификации Zookeeper. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**Смотрите также**

- [Replication](../../engines/table-engines/mergetree-family/replication.md)
- [Руководство программиста ZooKeeper](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [Опциональная защищённая связь между ClickHouse и Zookeeper](/operations/ssl-zookeeper)
