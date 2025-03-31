---
description: 'Этот раздел содержит описания настроек сервера, т.е. настроек, которые не могут быть изменены на уровне сессии или запроса.'
keywords: ['глобальные настройки сервера']
sidebar_label: 'Настройки сервера'
sidebar_position: 57
slug: /operations/server-configuration-parameters/settings
title: 'Настройки сервера'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/docs/operations/server-configuration-parameters/_snippets/_system-log-parameters.md'

# Настройки сервера

Этот раздел содержит описания настроек сервера. Эти настройки не могут быть изменены на уровне сессии или запроса.

Для получения дополнительной информации о файлах конфигурации в ClickHouse смотрите [Файлы конфигурации](/operations/configuration-files).

Другие настройки описаны в разделе [Настройки](/operations/settings/overview).
Перед изучением настроек мы рекомендуем ознакомиться с разделом [Файлы конфигурации](/operations/configuration-files) и обратить внимание на использование подстановок (атрибуты  и ).

## access_control_improvements {#access_control_improvements}

Настройки для необязательных улучшений в системе контроля доступа.

| Настройка                                          | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | По умолчанию |
|----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `users_without_row_policies_can_read_rows`         | Устанавливает, могут ли пользователи без разрешительных политик строк все равно читать строки, используя запрос `SELECT`. Например, если есть два пользователя A и B, и политика строк определена только для A, то если эта настройка истинна, пользователь B увидит все строки. Если это значение ложно, пользователь B не увидит ни одной строки.                                                                                                                                              | `true`       |
| `on_cluster_queries_require_cluster_grant`         | Устанавливает, требует ли `ON CLUSTER` запросы `CLUSTER` разрешения.                                                                                                                                                                                                                                                                                                                                                                                                                                               | `true`       |
| `select_from_system_db_requires_grant`             | Устанавливает, требуется ли для `SELECT * FROM system.<table>` какие-либо разрешения, и может ли его выполнить любой пользователь. Если это значение истинно, тогда этот запрос требует `GRANT SELECT ON system.<table>`, так же как и для не системных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые постоянные таблицы, такие как `one`, `contributors`) по-прежнему доступны для всех; и если есть привилегия `SHOW` (например, `SHOW USERS`), то соответствующая системная таблица (т.е. `system.users`) будет доступна. | `true`       |
| `select_from_information_schema_requires_grant`    | Устанавливает, требуется ли для `SELECT * FROM information_schema.<table>` какие-либо разрешения, и может ли его выполнить любой пользователь. Если установлено в true, то этот запрос требует `GRANT SELECT ON information_schema.<table>`, так же как и для обычных таблиц.                                                                                                                                                                                                                                | `true`       |
| `settings_constraints_replace_previous`            | Устанавливает, будет ли ограничение в профиле настроек для некоторой настройки отменять действия предыдущего ограничения (определенного в других профилях) для этой настройки, включая поля, которые не установлены новым ограничением. Также включает тип ограничения `changeable_in_readonly`.                                                                                                                                                                           | `true`       |
| `table_engines_require_grant`                      | Устанавливает, требуется ли для создания таблицы с конкретным движком таблицы разрешение.                                                                                                                                                                                                                                                                                                                                                                                                                                            | `false`      |
| `role_cache_expiration_time_seconds`               | Устанавливает количество секунд с момента последнего доступа, в течение которых роль хранится в кеше ролей.                                                                                                                                                                                                                                                                                                                                                                                                                                 | `600`        |

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

**См. также**

- [Контроль доступа и управление учетными записями](/operations/access-rights#access-control-usage)

## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached}

Действие, которое необходимо выполнить, когда максимальный размер элемента массива превышен в groupArray: выбросить исключение или отбросить лишние значения.

## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size}

Максимальный размер элемента массива в байтах для функции groupArray. Это ограничение проверяется при сериализации и помогает избежать большого размера состояния.

## allow_feature_tier {#allow_feature_tier}

Управляет, может ли пользователь изменять настройки, связанные с различными уровнями функционала.

- `0` - Изменения любой настройки разрешены (экспериментальный, бета, производственный).
- `1` - Разрешены только изменения бета- и производственных функциональных настроек. Изменения экспериментальных настроек отклоняются.
- `2` - Разрешены только изменения производственных настроек. Изменения экспериментальных или бета-настроек отклоняются.

Это эквивалентно установке ограничения на запись для всех `EXPERIMENTAL` / `BETA` функций.

:::note
Значение `0` означает, что все настройки могут быть изменены.
:::

## allow_implicit_no_password {#allow_implicit_no_password}

Запрещает создание пользователя без пароля, если 'IDENTIFIED WITH no_password' явно не указано.

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

Разрешает использование памяти jemalloc.

## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown}

Если это значение истинно, очередь асинхронных вставок очищается при корректном завершении работы.

## async_insert_threads {#async_insert_threads}

Максимальное количество потоков для фактического разбора и вставки данных в фоновом режиме. Ноль означает, что асинхронный режим отключен.

## async_load_databases {#async_load_databases}

Асинхронная загрузка баз данных и таблиц.

- Если `true`, все не системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружены асинхронно после запуска сервера ClickHouse. Смотрите таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к таблице, которая еще не загружена, будет ждать, пока именно эта таблица не будет загружена. Если задание загрузки не удается, запрос выдаст ошибку (вместо завершения всей работы сервера в случае `async_load_databases = false`). Таблица, на которую ожидает хотя бы один запрос, будет загружена с более высоким приоритетом. Запросы DDL на базу данных будут ожидать, пока именно эта база данных не будет загружена. Также рассмотрите возможность установки предела `max_waiting_queries` для общего количества ожидающих запросов.
- Если `false`, все базы данных загружаются при запуске сервера.

**Пример**

```xml
<async_load_databases>true</async_load_databases>
```

## async_load_system_database {#async_load_system_database}

Асинхронная загрузка системных таблиц. Полезно, если в базе данных `system` есть большое количество журнальных таблиц и частей. Независимо от настройки `async_load_databases`.

- Если установлено в `true`, все системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружены асинхронно после запуска сервера ClickHouse. Смотрите таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к системной таблице, которая еще не загружена, будет ждать, пока именно эта таблица не будет загружена. Таблица, на которую ожидает хотя бы один запрос, будет загружена с более высоким приоритетом. Также рассмотрите возможность установки настройки `max_waiting_queries`, чтобы ограничить общее количество ожидающих запросов.
- Если установлено в `false`, системная база данных загружается перед запуском сервера.

**Пример**

```xml
<async_load_system_database>true</async_load_system_database>
```

## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s}

Период в секундах для обновления тяжелых асинхронных метрик.

## asynchronous_insert_log {#asynchronous_insert_log}

Настройки для системной таблицы [asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) для логирования асинхронных вставок.

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

Включена по умолчанию в развертываниях ClickHouse Cloud.

Если настройка не включена по умолчанию в вашей среде, в зависимости от того, как ClickHouse был установлен, вы можете следовать инструкциям ниже, чтобы включить или отключить ее.

**Включение**

Чтобы вручную включить сбор истории асинхронных метрик [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md), создайте `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `asynchronous_metric_log`, вы должны создать следующий файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержимым:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>

## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics}

Включить вычисление тяжелых асинхронных метрик.

## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s}

Период в секундах для обновления асинхронных метрик.

## auth_use_forwarded_address {#auth_use_forwarded_address}

Использовать исходящий адрес для аутентификации клиентов, подключенных через прокси.

:::note
Эту настройку следует использовать с повышенной осторожностью, так как перенаправленные адреса могут быть легко подделаны - серверам, принимающим такую аутентификацию, не следует получать доступ напрямую, а только через доверенный прокси.
:::

## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size}

Максимальное количество потоков, которые будут использоваться для выполнения операций сброса для таблиц [Buffer-engine](/engines/table-engines/special/buffer) в фоновом режиме.

## background_common_pool_size {#background_common_pool_size}

Максимальное количество потоков, которые будут использоваться для выполнения различных операций (в основном сборка мусора) для таблиц [*MergeTree-engine](/engines/table-engines/mergetree-family) в фоновом режиме.

## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size}

Максимальное количество потоков, которые будут использоваться для выполнения распределенных отправок.

## background_fetches_pool_size {#background_fetches_pool_size}

Максимальное количество потоков, которые будут использоваться для извлечения частей данных из другой реплики для таблиц [*MergeTree-engine](/engines/table-engines/mergetree-family) в фоновом режиме.

## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio}

Устанавливает соотношение между количеством потоков и количеством фоновых слияний и мутаций, которые могут выполняться одновременно.

Например, если соотношение равно 2 и [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) установлено в 16, то ClickHouse может одновременно выполнять 32 фоновых слияния. Это возможно, потому что фоновые операции могут быть приостановлены и перенесены. Это нужно, чтобы дать небольшим слияниям больший приоритет выполнения.

:::note
Это соотношение можно только увеличить во время выполнения. Чтобы уменьшить его, необходимо перезапустить сервер.

Как и настройка [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size), [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) может быть применено из профиля `default` для обратной совместимости.
:::

## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy}

Политика по выполнению планирования для фоновых слияний и мутаций. Возможные значения: `round_robin` и `shortest_task_first`.

Алгоритм, используемый для выбора следующего слияния или мутации, которые будут выполнены пулом фоновых потоков. Политику можно изменить во время выполнения без перезапуска сервера. Может применяться из профиля `default` для обратной совместимости.

Возможные значения:

- `round_robin` — Каждое параллельное слияние и мутация выполняются в круговом порядке, чтобы обеспечить отсутствие голодания. Меньшие слияния завершаются быстрее, чем большие, просто потому что у них меньше блоков для слияния.
- `shortest_task_first` — Всегда выполняется меньшее слияние или мутация. Слияния и мутации получают приоритеты на основе их результирующего размера. Слияния с меньшими размерами строго предпочитаются большим. Эта политика обеспечивает максимально быстрое слияние небольших частей, но может привести к бесконечному голоданию больших слияний в разделах, которые сильно перегружены `INSERT`.

## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size}

Максимальное количество потоков, которые будут использоваться для выполнения фоновых операций для потоковой передачи сообщений.

## background_move_pool_size {#background_move_pool_size}

Максимальное количество потоков, которые будут использоваться для перемещения частей данных на другой диск или том для таблиц *MergeTree-engine в фоновом режиме.

## background_pool_size {#background_pool_size}

Устанавливает количество потоков, выполняющих фоновые слияния и мутации для таблиц с движками MergeTree.

:::note
- Эта настройка также может быть применена при запуске сервера из конфигурации профиля `default` для обратной совместимости при запуске сервера ClickHouse.
- Вы можете только увеличить количество потоков во время выполнения.
- Чтобы уменьшить количество потоков, необходимо перезапустить сервер.
- Регулируя эту настройку, вы управляете нагрузкой на CPU и диск.
:::

:::danger
Меньшее количество потоков использует меньше ресурсов CPU и диска, но фоновые процессы продвигаются медленнее, что в конечном итоге может повлиять на производительность запросов.
:::

Перед изменением этой настройки также посмотрите связанные настройки MergeTree, такие как:
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).

**Пример**

```xml
<background_pool_size>16</background_pool_size>
```

## background_schedule_pool_size {#background_schedule_pool_size}

Максимальное количество потоков, которые будут использоваться для постоянного выполнения некоторых легковесных периодических операций для реплицированных таблиц, потоковой передачи Kafka и обновлений кэша DNS.

## backup_log {#backup_log}

Настройки для системной таблицы [backup_log](../../operations/system-tables/backup_log.md) для логирования операций `BACKUP` и `RESTORE`.

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

Настройки для резервных копий, используемые при написании `BACKUP TO File()`.

Следующие настройки могут быть настроены с помощью вложенных тегов:

| Настройка                             | Описание                                                                                                                                                                    | По умолчанию |
|---------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `allowed_path`                        | Путь для резервного копирования при использовании `File()`. Эта настройка должна быть установлена, чтобы использовать `File`. Путь может быть относительно каталога экземпляра или абсолютным.              | `true`       |
| `remove_backup_files_after_failure`   | Если команда `BACKUP` завершится ошибкой, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до сбоя, в противном случае скопированные файлы останутся без изменений. | `true`       |

Эта настройка по умолчанию конфигурируется следующим образом:

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```

## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size}

Максимальное количество задач, которые могут быть запланированы в пуле потоков IO резервного копирования. Рекомендуется оставить эту очередь неограниченной из-за текущей логики резервного копирования S3.

:::note
Значение `0` (по умолчанию) означает неограниченное.
:::

## bcrypt_workfactor {#bcrypt_workfactor}

Рабочий коэффициент для типа аутентификации bcrypt_password, который использует [алгори   
тм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

## blog_storage_log {#blog_storage_log}

Настройки для системной таблицы [`blob_storage_log`](../system-tables/blob_storage_log.md).

<SystemLogParameters/>

Пример:

```xml
<blob_storage_log>
    <database>system</database>
    <table>blob_storage_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```

## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

Интервал в секундах перед перезагрузкой встроенных словарей.

ClickHouse перезагружает встроенные словари каждые x секунд. Это позволяет редактировать словари «на лету» без перезапуска сервера.

**Пример**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio}

Устанавливает максимальное соотношение размера кеша к RAM. Позволяет уменьшить размер кеша на системах с низкой памятью.

## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability}

Для тестирования.

## cgroup_memory_watcher_hard_limit_ratio {#cgroup_memory_watcher_hard_limit_ratio}

Определяет «жесткий» порог потребления памяти процесса сервера в соответствии с cgroups, после которого максимальное потребление памяти сервера корректируется до значения порога.

Смотрите настройки:
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio)

## cgroup_memory_watcher_soft_limit_ratio {#cgroup_memory_watcher_soft_limit_ratio}

Определяет «мягкий» порог потребления памяти процесса сервера в соответствии с cgroups, после которого арены в jemalloc очищаются.

Смотрите настройки:
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)

## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time}

Интервал в секундах, в течение которого максимальное допустимое потребление памяти сервером корректируется в соответствии с соответствующим порогом в cgroups.

Чтобы отключить наблюдатель cgroup, установите это значение в `0`.

Смотрите настройки:
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio).

## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size}

Устанавливает размер кеша (в элементах) для [скомпилированных выражений](../../operations/caches.md).

## compiled_expression_cache_size {#compiled_expression_cache_size}

Устанавливает размер кеша (в байтах) для [скомпилированных выражений](../../operations/caches.md).

## compression {#compression}

Настройки сжатия данных для таблиц с движком [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

:::note
Рекомендуем не изменять это, если вы только начали использовать ClickHouse.
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
Вы можете настроить несколько секций `<case>`.
:::

**Действия, когда условия выполнены**:

- Если часть данных соответствует установленному условию, ClickHouse использует указанный метод сжатия.
- Если часть данных соответствует нескольким наборам условий, ClickHouse использует первый совпадающий набор условий.

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

Политика по выполнению планирования слотов CPU, указанного в `concurrent_threads_soft_limit_num` и `concurrent_threads_soft_limit_ratio_to_cores`. Алгоритм, используемый для управления тем, как ограниченное количество слотов CPU распределяется среди параллельных запросов. Планировщик может быть изменен во время выполнения без перезапуска сервера.

Возможные значения:

- `round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads` слотов CPU. Один слот на поток. В случае конфликта слоты CPU предоставляются запросам по круговому принципу. Обратите внимание, что первый слот предоставляется без условий, что может привести к нерегулярности и увеличенной задержке запросов с высоким `max_threads` при наличии большого количества запросов с `max_threads` = 1.
- `fair_round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads - 1` слотов CPU. Вариант `round_robin`, который не требует слот CPU для первого потока каждого запроса. Таким образом, запросы с `max_threads` = 1 не требуют никаких слотов и не могут несправедливо захватывать все слоты. Нет слотов, предоставляемых без условий.

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num}

Максимальное количество потоков обработки запросов, исключая потоки для извлечения данных с удаленных серверов, разрешенных для выполнения всех запросов. Это не жесткий лимит. В случае достижения лимита запрос все равно получит хотя бы один поток для выполнения. Запрос может увеличить количество потоков до желаемого количества во время выполнения, если станет доступно больше потоков.

:::note
Значение `0` (по умолчанию) означает неограниченное.
:::

## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores}

То же самое, что и [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num), но с соотношением к ядрам.

## config_reload_interval_ms {#config_reload_interval_ms}

Как часто ClickHouse будет перезагружать конфигурацию и проверять новые изменения.

## core_dump {#core_dump}

Настраивает мягкий лимит для размера файла дампа памяти.

:::note
Жесткий лимит настраивается с помощью системных инструментов.
:::

**Пример**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```

## crash_log {#crash_log}

Настройки для операции системной таблицы [crash_log](../../operations/system-tables/crash-log.md).

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

Этот параметр определяет путь к кэшу для пользовательских (созданных из SQL) кэшированных дисков.  
`custom_cached_disks_base_directory` имеет более высокий приоритет для пользовательских дисков по сравнению с `filesystem_caches_path` (находится в `filesystem_caches_path.xml`), который используется, если первый отсутствует.  
Путь к настройкам файлового кэша должен находиться внутри этого каталога, иначе будет выдано исключение, предотвращающее создание диска.

:::note
Это не повлияет на диски, созданные в предыдущей версии, для которой сервер был обновлен. В этом случае исключение не будет выдано, чтобы позволить серверу успешно запуститься.
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

**См. также**

- [Пользовательские настройки](/operations/settings/query-level#custom_settings)
## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec}

Задержка, в течение которой удаленная таблица может быть восстановлена с использованием команды [`UNDROP`](/sql-reference/statements/undrop.md). Если команда `DROP TABLE` была выполнена с модификатором `SYNC`, этот параметр игнорируется.  
По умолчанию для этого параметра установлено значение `480` (8 минут).
## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec}

В случае неудачного удаления таблицы ClickHouse будет ждать это время перед повторной попыткой операции.
## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency}

Размер пула потоков, используемого для удаления таблиц.
## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec}

Параметр задачи, которая очищает мусор из каталога `store/`.  
Устанавливает период расписания задачи.

:::note
Значение `0` означает "никогда". Значение по умолчанию соответствует 1 дню.
:::
## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec}

Параметр задачи, которая очищает мусор из каталога `store/`.  
Если какая-либо подкаталог не используется `clickhouse-server` и этот каталог не изменялся в течение последних
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) секунд, задача "скроет" этот каталог, удалив все права доступа. Он также работает для каталогов, которые `clickhouse-server` не ожидает увидеть внутри `store/`.

:::note
Значение `0` означает "немедленно".
:::
## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec}

Параметр задачи, которая очищает мусор из каталога `store/`.  
Если какая-либо подкаталог не используется `clickhouse-server` и он был ранее "скрыт"  
(см. [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec))  
и этот каталог не изменялся в течение последних  
[`database_catalog_unused_dir_rm_timeout_sec`]/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) секунд, задача удалит этот каталог.  
Он также работает для каталогов, которые `clickhouse-server` не ожидает увидеть внутри `store/`.

:::note
Значение `0` означает "никогда". Значение по умолчанию соответствует 30 дням.
:::
## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently}

Разрешить постоянное отсоединение таблиц в реплицированных базах данных
## default_database {#default_database}

Имя базы данных по умолчанию.
## default_password_type {#default_password_type}

Устанавливает тип пароля, который будет автоматически установлен для запросов, таких как `CREATE USER u IDENTIFIED BY 'p'`.

Принимаемые значения:
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## default_profile {#default_profile}

Профиль настроек по умолчанию. Профили настроек расположены в файле, указанном в параметре `user_config`.

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

Тайм-аут сессии по умолчанию, в секундах.

```xml
<default_session_timeout>60</default_session_timeout>
```
## dictionaries_config {#dictionaries_config}

Путь к конфигурационному файлу для словарей.

Путь:
- Укажите абсолютный путь или путь, относительный к конфигурационному файлу сервера.
- Путь может содержать подстановочные знаки \* и ?.

См. также:
- "[Словари](../../sql-reference/dictionaries/index.md)".

**Пример**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## dictionaries_lazy_load {#dictionaries_lazy_load}

Ленивая загрузка словарей.

- Если `true`, каждый словарь загружается при первом использовании. Если загрузка не удалась, функция, использующая словарь, выдает исключение.
- Если `false`, сервер загружает все словари при запуске.

:::note
Сервер будет ждать при запуске, пока все словари не закончат загрузку, прежде чем принимать какие-либо подключения  
(исключение: если [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) установлено в `false`).
:::

**Пример**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```
## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval}

Интервал в миллисекундах для попыток переподключения неудавшихся словарей MySQL и Postgres с включенным `background_reconnect`.
## disable_insertion_and_mutation {#disable_insertion_and_mutation}

Отключение всех запросов на вставку/изменение/удаление. Этот параметр будет включен, если кто-то нуждается в узлах только для чтения, чтобы предотвратить влияние вставок и мутаций на производительность чтения.
## disable_internal_dns_cache {#disable_internal_dns_cache}

Отключает внутренний кэш DNS. Рекомендуется для работы ClickHouse в системах с часто меняющейся инфраструктурой, такой как Kubernetes.
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию для выполнения `HTTPS` запросов через `HTTP` прокси используется туннелирование (т.е. `HTTP CONNECT`). Этот параметр можно использовать для его отключения.

**no_proxy**

По умолчанию все запросы проходят через прокси. Чтобы отключить его для конкретных хостов, переменная `no_proxy` должна быть установлена.  
Она может быть установлена внутри `<proxy>` для списочных и удаленных резольверов, а также как переменная окружения для резольвера окружения.  
Поддерживаются IP-адреса, домены, поддомены и символ `'*'` для полного обхода. Ведущие точки удаляются так же, как и в curl.

**Пример**

Следующая конфигурация обходит прокси-запросы к `clickhouse.cloud` и всем его поддоменам (например, `auth.clickhouse.cloud`).  
То же самое применяется к GitLab, хотя у него есть ведущая точка. Оба `gitlab.com` и `about.gitlab.com` также будут обходить прокси.

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

Соединения, превышающие этот лимит, имеют значительно более короткое время жизни. Лимит применяется к соединениям с дисками.
## disk_connections_store_limit {#disk_connections_store_limit}

Соединения, превышающие этот лимит, сбрасываются после использования. Установите 0, чтобы отключить кэш соединений. Лимит применяется к соединениям с дисками.
## disk_connections_warn_limit {#disk_connections_warn_limit}

Предупреждающие сообщения записываются в логи, если количество используемых соединений превышает этот лимит. Лимит применяется к соединениям с дисками.
## display_secrets_in_show_and_select {#display_secrets_in_show_and_select}

Включает или отключает отображение секретов в запросах `SHOW` и `SELECT` для таблиц, баз данных, табличных функций и словарей. 

Пользователь, желающий видеть секреты, также должен иметь  
[`format_display_secrets_in_show_and_select` форматный параметр](../settings/formats#format_display_secrets_in_show_and_select)  
включенным и притом наличие права  
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Возможные значения:

- `0` — Отключено.
- `1` — Включено.
## distributed_ddl {#distributed_ddl}

Управляет выполнением [распределенных ddl запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) в кластере.  
Работает только если [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) включен.

Настраиваемые параметры внутри `<distributed_ddl>` включают:

| Параметр            | Описание                                                                                                                       | Значение по умолчанию                  |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| `path`              | путь в Keeper для `task_queue` для DDL запросов                                                                              |                                        |
| `profile`           | профиль, используемый для выполнения DDL запросов                                                                            |                                        |
| `pool_size`         | сколько `ON CLUSTER` запросов может выполняться одновременно                                                                 |                                        |
| `max_tasks_in_queue`| максимальное количество задач, которые могут быть в очереди.                                                                  | `1,000`                                |
| `task_max_lifetime` | удалить узел, если его возраст больше этого значения.                                                                        | `7 * 24 * 60 * 60` (неделя в секундах) |
| `cleanup_delay_period` | очистка начинается после получения нового события узла, если последняя очистка не была выполнена ранее чем `cleanup_delay_period` секунд назад. | `60` секунд                           |

**Пример**

```xml
<distributed_ddl>
    <!-- Путь в ZooKeeper к очереди с DDL запросами -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Настройки из этого профиля будут использоваться для выполнения DDL запросов -->
    <profile>default</profile>

    <!-- Контролирует, сколько ON CLUSTER запросов может выполняться одновременно. -->
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

Позволяет разрешать имена в адреса ipv4.
## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6}

Позволяет разрешать имена в адреса ipv6.
## dns_cache_max_entries {#dns_cache_max_entries}

Максимальное количество записей во внутреннем кэше DNS.
## dns_cache_update_period {#dns_cache_update_period}

Период обновления внутреннего кэша DNS в секундах.
## dns_max_consecutive_failures {#dns_max_consecutive_failures}

Максимальное количество неудачных разрешений DNS для имени хоста перед его исключением из кэша DNS ClickHouse.
## enable_azure_sdk_logging {#enable_azure_sdk_logging}

Включает ведение журналов от Azure sdk
## encryption {#encryption}

Конфигурирует команду для получения ключа, который будет использоваться кодеками [шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должны быть записаны в переменных окружения или установлены в конфигурационном файле.

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
Хранение ключей в конфигурационном файле не рекомендуется. Это небезопасно. Вы можете перенести ключи в отдельный конфигурационный файл на безопасном диске и поместить символическую ссылку на этот файл конфигурации в папку `config.d/`.
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

Здесь `current_key_id` устанавливает текущий ключ для шифрования, и все указанные ключи могут быть использованы для расшифровки.

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

Кроме того, пользователи могут добавить `nonce`, который должен быть длиной 12 байт (по умолчанию процессы шифрования и расшифрования используют `nonce`, состоящий из нулевых байтов):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Или он может быть установлен в шестнадцатеричном формате:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
Все вышеперечисленное может применяться для `aes_256_gcm_siv` (но ключ должен быть длиной 32 байта).
:::
## error_log {#error_log}

По умолчанию отключен.

**Включение**

Чтобы вручную включить сбор истории ошибок в [`system.error_log`](../../operations/system-tables/error_log.md), создайте `/etc/clickhouse-server/config.d/error_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `error_log`, необходимо создать следующий файл `/etc/clickhouse-server/config.d/disable_error_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## format_alter_operations_with_parentheses {#format_alter_operations_with_parentheses}

Если установлено значение `true`, то операции изменения будут обрамляться в скобки в форматированных запросах. Это делает разбор форматированных запросов на изменение менее неоднозначным.
## format_schema_path {#format_schema_path}

Путь к директории со схемами для входных данных, такими как схемы для формата [CapnProto](../../interfaces/formats.md#capnproto).

**Пример**

```xml
<!-- Директория, содержащая файлы схем для различных входных форматов. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns}

Период для таймера часов CPU глобального профайлера (в наносекундах). Установите значение 0, чтобы отключить глобальный профайлер часов CPU. Рекомендуемое значение - не менее 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (один раз в секунду) для профилирования по всему кластеру.
## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns}

Период для таймера реального времени глобального профайлера (в наносекундах). Установите значение 0, чтобы отключить глобальный профайлер реального времени. Рекомендуемое значение - не менее 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (один раз в секунду) для профилирования по всему кластеру.
## google_protos_path {#google_protos_path}

Определяет директорию, содержащую файлы proto для типов Protobuf.

Пример:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## graphite {#graphite}

Отправка данных в [Graphite](https://github.com/graphite-project).

Настройки:

- `host` – Сервер Graphite.
- `port` – Порт на сервере Graphite.
- `interval` – Интервал отправки, в секундах.
- `timeout` – Тайм-аут отправки данных, в секундах.
- `root_path` – Префикс для ключей.
- `metrics` – Отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Отправка данных дельт, накопленных за период времени, из таблицы [system.events](/operations/system-tables/events).
- `events_cumulative` – Отправка накопленных данных из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Отправка данных из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Вы можете настроить несколько разделов `<graphite>`. Например, вы можете использовать это для отправки различных данных с различными интервалами.

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

Настройки для сгущения данных для Graphite.

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
## hsts_max_age {#hsts_max_age}

Время истечения HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. Если вы устанавливаете положительное число, HSTS будет включен, и max-age будет равно установленному вами числу.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## http_connections_soft_limit {#http_connections_soft_limit}

Соединения, превышающие этот лимит, имеют значительно более короткое время жизни. Лимит применяется к http соединениям, которые не принадлежат никакому диску или хранилищу.
## http_connections_store_limit {#http_connections_store_limit}

Соединения, превышающие этот лимит, сбрасываются после использования. Установите 0, чтобы отключить кэш соединений. Лимит применяется к http соединениям, которые не принадлежат никакому диску или хранилищу.
## http_connections_warn_limit {#http_connections_warn_limit}

Предупреждающие сообщения записываются в логи, если количество используемых соединений превышает этот лимит. Лимит применяется к http соединениям, которые не принадлежат никакому диску или хранилищу.
## http_handlers {#http_handlers}

Позволяет использовать пользовательские HTTP-обработчики.  
Чтобы добавить новый http-обработчик, достаточно добавить новый `<rule>`.  
Правила проверяются сверху вниз, как определено, и первое соответствие выполнит обработчик.

Следующие параметры могут быть настроены с помощью дочерних тегов:

| Дочерние теги       | Определение                                                                                                                                      |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | Чтобы сопоставить URL запроса, вы можете использовать префикс 'regex:', чтобы использовать сопоставление по регулярному выражению (необязательно)   |
| `methods`            | Чтобы сопоставить методы запроса, вы можете использовать запятые для разделения нескольких совпадений методов (необязательно)                   |
| `headers`            | Чтобы сопоставить заголовки запроса, сопоставьте каждый дочерний элемент (имя дочернего элемента - это имя заголовка), вы можете использовать префикс 'regex:' для использования сопоставления по регулярному выражению (необязательно) |
| `handler`            | Обработчик запроса                                                                                                                                  |
| `empty_query_string` | Проверить, что в URL нет строки запроса                                                                                                            |

`handler` содержит следующие настройки, которые могут быть настроены с помощью дочерних тегов:

| Дочерние теги       | Определение                                                                                                                                                           |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | Местоимение для перенаправления                                                                                                                                     |
| `type`               | Поддерживаемые типы: static, dynamic_query_handler, predefined_query_handler, redirect                                                                                 |
| `status`             | Используется с статическим типом, статус код ответа                                                                                                                   |
| `query_param_name`   | Используется с динамическим типом обработчика запросов, извлекает и выполняет значение, соответствующее значению `<query_param_name>` в параметрах HTTP-запроса        |
| `query`              | Используется с заранее определенным типом обработчика запросов, выполняет запрос, когда вызывается обработчик                                                            |
| `content_type`       | Используется с статическим типом, тип содержимого ответа                                                                                                              |
| `response_content`   | Используется с статическим типом, содержимое ответа, отправляемое клиенту, при использовании префиксов 'file://' или 'config://', находим содержимое из файла или конфигурации, отправляемой клиенту |

Вместе со списком правил вы можете указать `<defaults/>`, который указывает на включение всех обработчиков по умолчанию.

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

Используется для добавления заголовков в ответ на HTTP-запрос `OPTIONS`.  
Метод `OPTIONS` используется при CORS предварительных запросах.

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

Страница, которая отображается по умолчанию при доступе к ClickHouse HTTP(s) серверу.  
Значение по умолчанию - "Ok." (с переводом строки в конце)

**Пример**

Открывает `https://tabix.io/`, когда доступ к `http://localhost: http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size}

Размер фона пула для каталога iceberg
## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size}

Количество задач, которые можно добавить в пул iceberg catalog
## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query}

Если установлено значение true, ClickHouse не записывает значения по умолчанию для пустого SQL-заявления безопасности в запросах `CREATE VIEW`.

:::note
Этот параметр необходим только на период миграции и станет устаревшим в 24.4
:::
## include_from {#include_from}

Путь к файлу с заменами. Поддерживаются как XML, так и YAML форматы.

Для получения дополнительной информации обратитесь к разделу "[Файлы конфигурации](/operations/configuration-files)".

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## index_mark_cache_policy {#index_mark_cache_policy}

Имя политики кэша индексных меток второй индекс.
## index_mark_cache_size {#index_mark_cache_size}

Максимальный размер кэша для меток индексов.

:::note

Значение `0` означает отключение.

Этот параметр может быть изменен во время выполнения и вступит в силу немедленно.
:::
## index_mark_cache_size_ratio {#index_mark_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше вторичных индексных меток относительно общего размера кэша.
## index_uncompressed_cache_policy {#index_uncompressed_cache_policy}

Имя политики кэша для не сжатых блоков индексов `MergeTree`.
## index_uncompressed_cache_size {#index_uncompressed_cache_size}

Максимальный размер кэша для несжатых блоков индексов `MergeTree`.

:::note
Значение `0` означает отключение.

Этот параметр может быть изменен во время выполнения и вступит в силу немедленно.
:::
## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше несжатых индексов второго уровня относительно общего размера кэша.
## interserver_http_credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики с использованием этих учетных данных.  
`interserver_http_credentials` должно быть одинаковым для всех реплик в кластере.

:::note
- По умолчанию, если раздел `interserver_http_credentials` пропущен, аутентификация не используется во время репликации.
- Настройки `interserver_http_credentials` не относятся к учетным данным клиента ClickHouse [конфигурации](../../interfaces/cli.md#configuration_files).
- Эти учетные данные общие для репликации через `HTTP` и `HTTPS`.
:::

Следующие параметры могут быть настроены с помощью дочерних тегов:

- `user` — Имя пользователя.
- `password` — Пароль.
- `allow_empty` — Если `true`, другие реплики могут подключаться без аутентификации, даже если учетные данные установлены. Если `false`, подключения без аутентификации отклоняются. Значение по умолчанию: `false`.
- `old` — Содержит старые `user` и `password`, используемые во время ротации учетных данных. Можно указать несколько `old` секций.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию учетных данных межсерверов без остановки всех реплик одновременно для обновления их конфигурации. Учетные данные можно изменить несколькими шагами.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволяет подключениям с аутентификацией и без нее.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите `allow_empty` в `false` или удалите этот параметр. Это сделает аутентификацию с новыми учетными данными обязательной.

Чтобы изменить существующие учетные данные, переместите имя пользователя и пароль в раздел `interserver_http_credentials.old` и обновите `user` и `password` новыми значениями. В этот момент сервер использует новые учетные данные для подключения к другим репликам и принимает подключения с новыми или старыми учетными данными.

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

Когда новые учетные данные применены ко всем репликам, старые учетные данные могут быть удалены.
## interserver_http_host {#interserver_http_host}

Имя хоста, которое может быть использовано другими серверами для доступа к этому серверу.

Если опущено, оно определяется аналогично команде `hostname -f`.

Полезно для выхода за рамки конкретного сетевого интерфейса.

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

Похоже на [`interserver_http_host`](#interserver_http_host), за исключением того, что это имя хоста может быть использовано другими серверами для доступа к этому серверу через `HTTPS`.

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

Ограничение на хосты, которые могут обмениваться данными между серверами ClickHouse. Если используется Keeper, такое же ограничение будет применяться к通信 между различными экземплярами Keeper.

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
Значение `0` означает без ограничений.
:::
## keep_alive_timeout {#keep_alive_timeout}


Количество секунд, в течение которых ClickHouse ожидает входящие запросы для протокола HTTP перед закрытием соединения.

**Пример**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## keeper_multiread_batch_size {#keeper_multiread_batch_size}


Максимальный размер пакета для запроса MultiRead к [Zoo]Keeper, который поддерживает объединение. Если установлено значение 0, объединение отключено. Доступно только в ClickHouse Cloud.
## latency_log {#latency_log}

По умолчанию отключено.

**Включение**

Чтобы вручную включить сбор истории задержек [`system.latency_log`](../../operations/system-tables/latency_log.md), создайте `/etc/clickhouse-server/config.d/latency_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `latency_log`, вам нужно создать следующий файл `/etc/clickhouse-server/config.d/disable_latency_log.xml` со следующим содержимым:

```xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## ldap_servers {#ldap_servers}

Список LDAP-серверов с их параметрами подключения здесь для:
- использования их в качестве аутентификаторов для выделенных локальных пользователей, у которых механизм аутентификации 'ldap' указан вместо 'password'
- использования их в качестве удаленных каталогов пользователей.

Следующие параметры могут быть настроены с помощью подметок:

| Параметр                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                              |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                        | Имя хоста LDAP-сервера или IP, этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                                                                                                                             |
| `port`                        | Порт LDAP-сервера, по умолчанию 636, если `enable_tls` установлен в значение true, иначе 389.                                                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                     | Шаблон, используемый для формирования DN для связи. Результирующий DN будет сформирован путем замены всех подстрок `\{user_name\}` шаблона на фактическое имя пользователя во время каждой попытки аутентификации.                                                                                                                                                                                                                               |
| `user_dn_detection`           | Раздел с параметрами поиска LDAP для обнаружения фактического DN пользователя, к которому привязан соединение. Это в основном используется в фильтрах поиска для дальнейшего отображения ролей, когда сервер является Active Directory. Результирующий DN пользователя будет использоваться при замене подстрок `\{user_dn\}` там, где это разрешено. По умолчанию DN пользователя устанавливается равным DN связи, но после выполнения поиска будет обновлен до фактического обнаруженного значения DN пользователя. |
| `verification_cooldown`       | Период времени в секундах, после успешной попытки связи, в течение которого пользователь будет считаться успешно аутентифицированным для всех последовательных запросов без обращения к LDAP-серверу. Укажите `0` (по умолчанию), чтобы отключить кэширование и заставить обращаться к LDAP-серверу для каждого запроса аутентификации.                                                                                                                  |
| `enable_tls`                  | Флаг для активации использования защищенного соединения с LDAP-сервером. Укажите `no` для протокола обычного текста (`ldap://`) (не рекомендуется). Укажите `yes` для протокола LDAP через SSL/TLS (`ldaps://`) (рекомендуется, по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (обычного текста (`ldap://`), улучшенного до TLS).                                                                                                               |
| `tls_minimum_protocol_version`| Минимальная версия протокола SSL/TLS. Приемлемые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (по умолчанию).                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`            | Поведение проверки сертификата SSL/TLS. Приемлемые значения: `never`, `allow`, `try`, `demand` (по умолчанию).                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`               | путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                | путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`            | путь к файлу сертификата CA.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`             | путь к директории, содержащей сертификаты CA.                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`            | разрешенный набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                                                                                              |

Параметр `user_dn_detection` можно настроить с подметками:

| Параметр       | Описание                                                                                                                                                                                                                                                                                                                                    |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`      | шаблон, используемый для формирования базового DN для LDAP- поиска. Результирующий DN будет сформирован путем замены всех подстрок `\{user_name\}` и '\{bind_dn\}' шаблона на фактическое имя пользователя и DN связи во время LDAP-поиска.                                                                                                       |
| `scope`        | область LDAP-поиска. Приемлемые значения: `base`, `one_level`, `children`, `subtree` (по умолчанию).                                                                                                                                                                                                                                       |
| `search_filter`| шаблон, используемый для формирования фильтра поиска для LDAP-поиска. Результирующий фильтр будет сформирован путем замены всех подстрок `\{user_name\}`, `\{bind_dn\}`, и `\{base_dn\}` шаблона на фактическое имя пользователя, DN связи и базовый DN во время LDAP-поиска. Обратите внимание, что специальные символы должны быть правильно экранированы в XML.  |

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

Пример (типичная Active Directory с настроенным обнаружением DN пользователя для дальнейшего отображения ролей):

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

Ключ лицензии для ClickHouse Enterprise Edition
## listen_backlog {#listen_backlog}

Очередь (размер очереди ожидающих соединений) для сокета прослушивания. Значение по умолчанию `4096` такое же, как и в linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не нужно изменять, поскольку:
- Значение по умолчанию достаточно велико,
- Для принятия соединений клиентов сервер имеет отдельный поток.

Так что даже если у вас `TcpExtListenOverflows` (из `nstat`) ненулевое, и этот счетчик растет для сервера ClickHouse, это не означает, что это значение нужно увеличивать, так как:
- Обычно, если `4096` недостаточно, это указывает на какую-то внутреннюю проблему масштабирования ClickHouse, поэтому лучше сообщить о проблеме.
- Это не означает, что сервер сможет обработать больше соединений позже (и даже если сможет, на тот момент клиенты могут быть отключены).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```
## listen_host {#listen_host}

Ограничение на хосты, с которых могут поступать запросы. Если вы хотите, чтобы сервер отвечал на все, укажите `::`.

Примеры:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_reuse_port {#listen_reuse_port}

Разрешить нескольким серверам прослушивать одно и то же адрес:порт. Запросы будут маршрутизироваться к случайному серверу операционной системой. Включение этой настройки не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

По умолчанию:
## listen_try {#listen_try}

Сервер не завершит работу, если сети IPv6 или IPv4 недоступны во время попытки прослушивания.

**Пример**

```xml
<listen_try>0</listen_try>
```
## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size}

Размер фонового пула для загрузки меток
## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size}

Число задач, которые можно добавить в пул предзагрузки
## logger {#logger}

Расположение и формат сообщений журнала.

**Ключи**:

| Ключ                       | Описание                                                                                                                                                                         |
|-----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                     | Уровень журнала. Допустимые значения: `none` (выключить ведение журнала), `fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test`                                  |
| `log`                       | Путь к файлу журнала.                                                                                                                                                           |
| `errorlog`                  | Путь к файлу журнала ошибок.                                                                                                                                                     |
| `size`                      | Политика ротации: максимальный размер файлов журнала в байтах. Как только размер файла журнала превышает этот предел, он переименовывается и архивируется, а новый файл журнала создается.                  |
| `count`                     | Политика ротации: сколько исторических файлов журналов ClickHouse хранится максимум.                                                                                             |
| `stream_compress`           | Сжимать сообщения журнала с помощью LZ4. Установите значение `1` или `true`, чтобы включить.                                                                                      |
| `console`                   | Не записывать сообщения журнала в файлы журнала, вместо этого выводить их в консоль. Установите значение `1` или `true`, чтобы включить. По умолчанию `1`, если ClickHouse не работает в режиме демона, `0` в противном случае. |
| `console_log_level`         | Уровень журнала для консольного вывода. По умолчанию `level`.                                                                                                                                  |
| `formatting`                | Формат журнала для консольного вывода. В настоящее время поддерживается только `json`                                                                                                                  |
| `use_syslog`                | Также перенаправлять вывод журнала в syslog.                                                                                                                                                  |
| `syslog_level`              | Уровень журнала для записи в syslog.                                                                                                                                                    |

**Спецификаторы формата журнала**

Имена файлов в путях `log` и `errorLog` поддерживают ниже указанные спецификаторы формата для результирующего имени файла (часть директории не поддерживает их).

Столбец "Пример" показывает вывод на `2023-07-06 18:32:07`.

| Спецификатор  | Описание                                                                                                         | Пример                  |
|----------------|--------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`           | Буквальный %                                                                                                      | `%`                        |
| `%n`           | Символ новой строки                                                                                               |                          |
| `%t`           | Символ горизонтального табулятора                                                                                 |                          |
| `%Y`           | Год в десятичном формате, например, 2017                                                                           | `2023`                     |
| `%y`           | Последние 2 цифры года в десятичном формате (диапазон [00,99])                                                    | `23`                       |
| `%C`           | Первые 2 цифры года в десятичном формате (диапазон [00,99])                                                       | `20`                       |
| `%G`           | Четырехзначный [год, основанный на неделях ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, содержащий указанную неделю. Обычно полезен только с `%V` | `2023`       |
| `%g`           | Последние 2 цифры [года, основанного на неделях ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, содержащий указанную неделю.                         | `23`         |
| `%b`           | Сокращенное название месяца, например, Окт (в зависимости от локали)                                             | `Jul`                      |
| `%h`           | Синоним `%b`                                                                                                      | `Jul`                      |
| `%B`           | Полное название месяца, например, Октябрь (в зависимости от локали)                                             | `July`                     |
| `%m`           | Месяц в десятичном формате (диапазон [01,12])                                                                     | `07`                       |
| `%U`           | Номер недели в году в десятичном формате (воскресенье - первый день недели) (диапазон [00,53])                   | `27`                       |
| `%W`           | Номер недели в году в десятичном формате (понедельник - первый день недели) (диапазон [00,53])                   | `27`                       |
| `%V`           | Номер недели ISO 8601 (диапазон [01,53])                                                                          | `27`                       |
| `%j`           | Номер дня в году в десятичном формате (диапазон [001,366])                                                       | `187`                      |
| `%d`           | Номер дня в месяце как десятичное число с нулевым дополнением (диапазон [01,31]). Однозначная цифра предшествует нулю. | `06`                       |
| `%e`           | Номер дня в месяце как десятичное число с пробелом для дополнения (диапазон [1,31]). Однозначная цифра предшествует пробелу. | `&nbsp; 6`                 |
| `%a`           | Сокращенное название дня недели, например, Пт (в зависимости от локали)                                         | `Thu`                      |
| `%A`           | Полное название дня недели, например, Пятница (в зависимости от локали)                                          | `Thursday`                 |
| `%w`           | День недели в виде целого числа, где воскресенье - это 0 (диапазон [0-6])                                      | `4`                        |
| `%u`           | День недели в десятичном формате, где понедельник - 1 (формат ISO 8601) (диапазон [1-7])                        | `4`                        |
| `%H`           | Час в десятичном формате, 24-часовой формат (диапазон [00-23])                                                 | `18`                       |
| `%I`           | Час в десятичном формате, 12-часовой формат (диапазон [01,12])                                                 | `06`                       |
| `%M`           | Минута в десятичном формате (диапазон [00,59])                                                                  | `32`                       |
| `%S`           | Секунда в десятичном формате (диапазон [00,60])                                                                  | `07`                       |
| `%c`           | Стандартная строка даты и времени, например, Вс Окт 17 04:41:13 2010 (в зависимости от локали)                    | `Thu Jul  6 18:32:07 2023` |
| `%x`           | Локализованное представление даты (в зависимости от локали)                                                       | `07/06/23`                 |
| `%X`           | Локализованное представление времени, например, 18:40:20 или 6:40:20 PM (в зависимости от локали)                 | `18:32:07`                 |
| `%D`           | Короткая дата в формате MM/DD/YY, эквивалентно %m/%d/%y                                                         | `07/06/23`                 |
| `%F`           | Короткая дата в формате YYYY-MM-DD, эквивалентно %Y-%m-%d                                                       | `2023-07-06`               |
| `%r`           | Локализованное время 12-часового формата (в зависимости от локали)                                             | `06:32:07 PM`              |
| `%R`           | Эквивалентно "%H:%M"                                                                                               | `18:32`                    |
| `%T`           | Эквивалентно "%H:%M:%S" (ISO 8601 формат времени)                                                                 | `18:32:07`                 |
| `%p`           | Локализованное обозначение a.m. или p.m. (в зависимости от локали)                                           | `PM`                       |
| `%z`           | Смещение от UTC в формате ISO 8601 (например, -0430), или без символов, если информация о зоне времени недоступна  | `+0800`                    |
| `%Z`           | Название или сокращение временной зоны на основе локали, или без символов, если информация о зоне времени недоступна | `Z AWST `                  |

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

Уровень журнала отдельных имен журналов может быть переопределен. Например, чтобы отключить все сообщения логгеров "Backup" и "RBAC".

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
|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`    | Адрес syslog в формате `host\[:port\]`. Если опущен, используется локальный демонт.                                                                                                                                                                         |
| `hostname`   | Имя хоста, с которого отправляются журналы (необязательно).                                                                                                                                                                                              |
| `facility`   | Ключевое слово syslog [facility](https://en.wikipedia.org/wiki/Syslog#Facility). Должен быть указан в верхнем регистре с префиксом "LOG_", например, `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т.д. По умолчанию: `LOG_USER`, если указан `address`, `LOG_DAEMON` в противном случае.      |
| `format`     | Формат сообщений журнала. Возможные значения: `bsd` и `syslog.`                                                                                                                                                                                           |

**Форматы журнала**

Вы можете указать формат журнала, который будет выводиться в консоль. В настоящее время поддерживается только JSON.

**Пример**

Вот пример выходного JSON-журнала:

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

Чтобы включить поддержку JSON-журналирования, используйте следующий фрагмент:

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

Имена ключей могут быть изменены путем изменения значений тегов внутри `<names>`. Например, чтобы изменить `DATE_TIME` на `MY_DATE_TIME`, вы можете использовать `<date_time>MY_DATE_TIME</date_time>`.

**Пропуск ключей для JSON журналов**

Свойства журнала могут быть пропущены путем комментирования свойства. Например, если вы не хотите, чтобы ваш журнал выводил `query_id`, вы можете закомментировать тег `<query_id>`.
## macros {#macros}

Параметры замены для реплицированных таблиц.

Могут быть опущены, если реплицированные таблицы не используются.

Для получения дополнительной информации смотрите раздел [Создание реплицированных таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```
## mark_cache_policy {#mark_cache_policy}

Имя политики кэширования меток.
## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio}

Соотношение общего размера кэша меток, который нужно заполнить во время преднагрева.
## mark_cache_size {#mark_cache_size}

Максимальный размер кэша для меток (индекс семейства [`MergeTree`](/engines/table-engines/mergetree-family) таблиц).

:::note
Эту настройку можно изменять во время работы, и изменения вступят в силу немедленно.
:::
## mark_cache_size_ratio {#mark_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше меток относительно общего размера кэша.
## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size}

Количество потоков для загрузки активного набора частей данных (активные) при запуске.
## max_authentication_methods_per_user {#max_authentication_methods_per_user}

Максимальное количество методов аутентификации, с которыми пользователь может быть создан или изменен.
Изменение этой настройки не повлияет на существующих пользователей. Запросы на создание/изменение, связанные с аутентификацией, завершатся неудачей, если они превышают лимит, указанный в этой настройке.
Запросы на создание/изменение, не связанные с аутентификацией, будут успешными.

:::note
Значение `0` означает безлимитное количество.
:::
## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server}

Максимальная скорость чтения в байтах в секунду для всех резервных копий на сервере. Ноль означает безлимитно.
## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size}

Если количество **свободных** потоков в пуле потоков резервных копий превышает `max_backup_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые бездействующими потоками, и уменьшит размер пула. Потоки могут быть созданы снова по мере необходимости.
## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size}

ClickHouse использует потоки из пула потоков резервных копий для выполнения операций ввода-вывода резервных копий S3. `max_backups_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.
## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size}

Максимальное количество потоков, которые могут использоваться для построения векторных индексов.

:::note
Значение `0` означает, что используются все ядра.
:::
## max_concurrent_insert_queries {#max_concurrent_insert_queries}

Лимит на общее количество одновременно выполняемых запросов на вставку.

:::note
Значение `0` (по умолчанию) обозначает безлимитное количество.

Эту настройку можно изменять во время работы, и изменения вступят в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::
## max_concurrent_queries {#max_concurrent_queries}

Лимит на общее количество одновременно выполняемых запросов. Обратите внимание, что необходимо также учитывать лимиты на запросы `INSERT` и `SELECT`, а также на максимальное количество запросов на пользователя.

См. также:
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note
Значение `0` (по умолчанию) обозначает безлимитное количество.

Эту настройку можно изменять во время работы, и изменения вступят в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::
## max_concurrent_select_queries {#max_concurrent_select_queries}

Лимит на общее количество одновременно выполняемых запросов `SELECT`.

:::note
Значение `0` (по умолчанию) обозначает безлимитное количество.

Эту настройку можно изменять во время работы, и изменения вступят в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::
## max_connections {#max_connections}

Максимальное количество соединений с сервером.
## max_database_num_to_throw {#max_database_num_to_throw}

Если количество баз данных превышает это значение, сервер выбросит исключение. 0 означает отсутствие ограничений.
## max_database_num_to_warn {#max_database_num_to_warn}

Если количество подключенных баз данных превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```
## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size}

Количество потоков для создания таблиц во время восстановления реплики в DatabaseReplicated. Ноль означает, что количество потоков равно количеству ядер.
## max_dictionary_num_to_throw {#max_dictionary_num_to_throw}

Если количество словарей превышает это значение, сервер выбросит исключение.

Учитываются только таблицы для движков баз данных:
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

Сколько записей статистики для хеш-таблицы, собранной во время агрегации, разрешено иметь.
## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size}

Количество потоков для `ALTER TABLE FETCH PARTITION`.
## max_io_thread_pool_free_size {#max_io_thread_pool_free_size}

Если количество **свободных** потоков в пуле потоков ввода-вывода превышает `max_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые бездействующими потоками, и уменьшит размер пула. Потоки могут быть созданы снова по мере необходимости.
## max_io_thread_pool_size {#max_io_thread_pool_size}

ClickHouse использует потоки из пула потоков ввода-вывода для выполнения некоторых операций ввода-вывода (например, для взаимодействия с S3). `max_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.
## max_keep_alive_requests {#max_keep_alive_requests}

Максимальное количество запросов через одно соединение с поддержкой keep-alive, после которого оно будет закрыто сервером ClickHouse.

**Пример**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```
## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server}

Максимальная скорость локального чтения в байтах в секунду.

:::note
Значение `0` означает безлимитное количество.
:::
## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server}

Максимальная скорость локальной записи в байтах в секунду.

:::note
Значение `0` означает безлимитное количество.
:::
## max_materialized_views_count_for_table {#max_materialized_views_count_for_table}

Лимит на количество материализованных представлений, прикрепленных к таблице.

:::note
Здесь учитываются только напрямую зависимые представления, и создание одного представления на основе другого представления не рассматривается.
:::
## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server}

Максимальная скорость чтения для всех слияний на сервере в байтах в секунду. Ноль означает безлимитно.
## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server}

Максимальная скорость чтения для всех мутаций на сервере в байтах в секунду. Ноль означает безлимитно.
## max_open_files {#max_open_files}

Максимальное количество открытых файлов.

:::note
Мы рекомендуем использовать эту опцию в macOS, поскольку функция `getrlimit()` возвращает некорректное значение.
:::

**Пример**

```xml
<max_open_files>262144</max_open_files>
```
## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size}

Количество потоков для загрузки неактивного набора частей данных (устаревших) при запуске.
## max_part_num_to_warn {#max_part_num_to_warn}

Если количество активных частей превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```
## max_partition_size_to_drop {#max_partition_size_to_drop}

Ограничение на удаление партиций.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает [`max_partition_size_to_drop`](#max_partition_size_to_drop) (в байтах), вы не можете удалить партицию с помощью запроса [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart).
Эта настройка не требует перезапуска сервера ClickHouse для применения. Другим способом отключить ограничение является создание файла `<clickhouse-path>/flags/force_drop_table`.

:::note
Значение `0` означает, что вы можете удалять партиции без каких-либо ограничений.

Это ограничение не препятствует удалению таблиц и обрезке таблиц, см. [max_table_size_to_drop](/operations/settings/settings#max_table_size_to_drop).
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

Если количество **свободных** потоков в пуле потоков десериализации префиксов превышает `max_prefixes_deserialization_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые бездействующими потоками, и уменьшит размер пула. Потоки могут быть созданы снова по мере необходимости.
## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size}

ClickHouse использует потоки из пула потоков десериализации префиксов для параллельного чтения метаданных колонок и субколонок из файловых префиксов в широких частях в MergeTree. `max_prefixes_deserialization_thread_pool_size` ограничивает максимальное количество потоков в пуле.
## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server}

Максимальная скорость обмена данными по сети в байтах в секунду для чтения.

:::note
Значение `0` (по умолчанию) означает безлимитное количество.
:::
## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server}

Максимальная скорость обмена данными по сети в байтах в секунду для записи.

:::note
Значение `0` (по умолчанию) означает безлимитное количество.
:::
## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server}

Максимальная скорость обмена данными по сети в байтах в секунду для реплицированных извлечений. Ноль означает безлимитно.
## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server}

Максимальная скорость обмена данными по сети в байтах в секунду для реплицированных отправок. Ноль означает безлимитно.
## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw}

Если количество реплицированных таблиц превышает это значение, сервер выбросит исключение.

Учитываются только таблицы для движков баз данных:
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

Максимальное количество памяти, которое сервер может использовать, выраженное в байтах.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается настройкой `max_server_memory_usage_to_ram_ratio`.
:::

В качестве специального случая значение `0` (по умолчанию) означает, что сервер может использовать всю доступную память (исключая дополнительные ограничения, налагаемые `max_server_memory_usage_to_ram_ratio`).
## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio}

Максимальное количество памяти, которое сервер может использовать, выраженное как отношение к всей доступной памяти.

Например, значение `0.9` (по умолчанию) означает, что сервер может использовать 90% доступной памяти.

Позволяет снижать потребление памяти на системах с низким объёмом памяти.
На хостах с низким объемом ОЗУ и подкачкой, возможно, вам потребуется установить [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) больше 1.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается настройкой `max_server_memory_usage`.
:::
## max_session_timeout {#max_session_timeout}

Максимальное время ожидания сессии, в секундах.

Пример:

```xml
<max_session_timeout>3600</max_session_timeout>
```
## max_table_num_to_throw {#max_table_num_to_throw}

Если количество таблиц превышает это значение, сервер выбросит исключение.

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

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает `max_table_size_to_drop` (в байтах), вы не можете удалить её с помощью запроса [`DROP`](../../sql-reference/statements/drop.md) или запроса [`TRUNCATE`](../../sql-reference/statements/truncate.md).

:::note
Значение `0` означает, что вы можете удалять все таблицы без каких-либо ограничений.

Эта настройка не требует перезапуска сервера ClickHouse для применения. Другой способ отключить ограничение — создать файл `<clickhouse-path>/flags/force_drop_table`.
:::

**Пример**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```
## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size}

Максимальное количество хранилища, которое может быть использовано для внешней агрегации, соединений или сортировки.
Запросы, превышающие этот лимит, завершатся с исключением.

:::note
Значение `0` означает безлимитное количество.
:::

См. также:
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)
## max_thread_pool_free_size {#max_thread_pool_free_size}

Если количество **свободных** потоков в глобальном пуле потоков больше, чем [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size), то ClickHouse освобождает ресурсы, занятые некоторыми потоками, и размер пула уменьшается. Потоки могут быть созданы снова по мере необходимости.

**Пример**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```
## max_thread_pool_size {#max_thread_pool_size}

ClickHouse использует потоки из глобального пула потоков для обработки запросов. Если нет свободного потока для обработки запроса, то в пуле создается новый поток. `max_thread_pool_size` ограничивает максимальное количество потоков в пуле.

**Пример**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```
## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size}

Количество потоков для загрузки неактивного набора частей данных (неожиданных) при запуске.
## max_view_num_to_throw {#max_view_num_to_throw}

Если количество представлений превышает это значение, сервер выбросит исключение.

Учитываются только таблицы для движков баз данных:
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

Лимит на общее количество одновременно ожидающих запросов.
Выполнение ожидающего запроса заблокировано, пока требуемые таблицы загружаются асинхронно (см. [`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases)).

:::note
Ожидающие запросы не учитываются, когда проверяются лимиты, контролируемые следующими настройками:

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

Это исправление выполняется, чтобы избежать превышения этих лимитов сразу после запуска сервера.
:::

:::note
Значение `0` (по умолчанию) означает безлимитное количество.

Эту настройку можно изменять во время работы, и изменения вступят в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::
## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker}

Должен ли фоновый рабочий процесс памяти корректировать внутренний трекер памяти на основе информации из внешних источников, таких как jemalloc и cgroups.
## memory_worker_period_ms {#memory_worker_period_ms}

Период тика фонового рабочего процесса памяти, который исправляет использование памяти трекера памяти и очищает неиспользуемые страницы во время более высокого использования памяти. Если установлено в 0, будет использоваться значение по умолчанию, в зависимости от источника использования памяти.
## memory_worker_use_cgroup {#memory_worker_use_cgroup}

Используйте текущую информацию об использовании памяти cgroup для корректировки отслеживания памяти.
## merge_tree {#merge_tree}

Тонкая настройка для таблиц в [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Для получения дополнительной информации см. файл заголовка MergeTreeSettings.h.

**Пример**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## merge_workload {#merge_workload}

Используется для регулирования того, как ресурсы используются и распределяются между слияниями и другими нагрузками. Указанное значение используется как значение настройки `workload` для всех фоновых слияний. Может быть переопределено настройкой дерева слияния.

**См. также**
- [Планирование нагрузки](/operations/workload-scheduling.md)
## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit}

Устанавливает лимит на то, сколько ОЗУ разрешено использовать для выполнения операций слияния и мутации.
Если ClickHouse достигает установленного лимита, он не будет планировать новые фоновые операции слияния или мутации, но продолжит выполнять уже запланированные задачи.

:::note
Значение `0` означает безлимитное количество.
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

По умолчанию отключено.

**Включение**

Чтобы вручную включить сбор истории метрик в [`system.metric_log`](../../operations/system-tables/metric_log.md), создайте `/etc/clickhouse-server/config.d/metric_log.xml` со следующим содержимым:

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

Выполнить `mlockall` после запуска, чтобы снизить задержку первых запросов и предотвратить вытеснение исполняемого файла ClickHouse под высоким вводом-выводом.

:::note
Рекомендуется включить эту опцию, но это приведет к увеличению времени запуска на несколько секунд.
Имейте в виду, что эта настройка не будет работать без возможности "CAP_IPC_LOCK".
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```
## mmap_cache_size {#mmap_cache_size}

Устанавливает размер кэша (в байтах) для отображаемых файлов. Эта настройка позволяет избежать частых вызовов открытия/закрытия (которые очень дорогие из-за последующих ошибок страниц) и повторно использовать отображения из нескольких потоков и запросов. Значение настройки — это количество отображаемых регионов (обычно равное количеству отображаемых файлов).

Количество данных в отображаемых файлах можно контролировать в следующих системных таблицах с помощью следующих метрик:

| Системная таблица                                                                                                                                                                                                                                                                                                                                                              | Метрика                                                                                                   |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [`system.metrics`](/operations/system-tables/metrics) и [`system.metric_log`](/operations/system-tables/metric_log)                                                                                                                                                                                                                             | `MMappedFiles` и `MMappedFileBytes`                                                                    |
| [`system.asynchronous_metrics_log`](/operations/system-tables/asynchronous_metric_log)                                                                                                                                                                                                                                                                         | `MMapCacheCells`                                                                                         |
| [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log) | `CreatedReadBufferMMap`, `CreatedReadBufferMMapFailed`, `MMappedFileCacheHits`, `MMappedFileCacheMisses` |

:::note
Количество данных в отображаемых файлах не потребляет память напрямую и не учитывается в использовании памяти запросов или сервера, поскольку эта память может быть сброшена аналогично кэшу страниц ОС. Кэш автоматически очищается (файлы закрываются) при удалении старых частей в таблицах семейства MergeTree, также его можно сбросить вручную с помощью запроса `SYSTEM DROP MMAP CACHE`.

Эту настройку можно изменять во время работы, и изменения вступят в силу немедленно.
:::
## mutation_workload {#mutation_workload}

Используется для регулирования того, как ресурсы используются и распределяются между мутациями и другими нагрузками. Указанное значение используется как значение настройки `workload` для всех фоновых мутаций. Может быть переопределено настройкой дерева слияния.

**См. также**
- [Планирование нагрузки](/operations/workload-scheduling.md)
## mysql_port {#mysql_port}

Порт для связи с клиентами по протоколу MySQL.

:::note
- Положительные целые числа указывают номер порта для прослушивания.
- Пустые значения используются для отключения связи с клиентами по протоколу MySQL.
:::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```
## openSSL {#openssl}

Конфигурация SSL клиента/сервера.

Поддержка SSL предоставляется библиотекой `libpoco`. Доступные варианты конфигурации объясняются в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи для настроек сервера/клиента:

| Опция                         | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Значение по умолчанию                      |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`              | Путь к файлу с секретным ключом PEM сертификата. Файл может содержать как ключ, так и сертификат одновременно.                                                                                                                                                                                                                                                                                                                                                      |                                            |
| `certificateFile`             | Путь к файлу сертификата клиента/сервера в формате PEM. Его можно опустить, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                                                |                                            |
| `caConfig`                    | Путь к файлу или каталогу, содержащему доверенные CA сертификаты. Если указывает на файл, он должен быть в формате PEM и может содержать несколько CA сертификатов. Если указывает на каталог, он должен содержать один .pem файл на каждый CA сертификат. Имена файлов ищутся по хэш-значению имени субъекта CA. Подробности можно найти на странице man [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                            |
| `verificationMode`            | Метод проверки сертификатов узла. Подробности содержатся в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                             | `relaxed`                                  |
| `verificationDepth`           | Максимальная длина цепочки проверки. Проверка завершится неудачно, если длина цепочки сертификатов превышает установленное значение.                                                                                                                                                                                                                                                                                                                                   | `9`                                        |
| `loadDefaultCAFile`           | Использовать встроенные CA сертификаты для OpenSSL. ClickHouse предполагает, что встроенные CA сертификаты находятся в файле `/etc/ssl/cert.pem` (соответственно, в каталоге `/etc/ssl/certs`) или в файле (соответственно, каталоге), указанном переменной окружения `SSL_CERT_FILE` (соответственно, `SSL_CERT_DIR`).                                                                                                                                                                    | `true`                                     |
| `cipherList`                  | Поддерживаемые шифры OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | Включает или отключает кэширование сессий. Должен использоваться в комбинации с `sessionIdContext`. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `sessionIdContext`            | Уникальный набор случайных символов, который сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Этот параметр всегда рекомендуется, поскольку он помогает избежать проблем как при кэшировании сессии на сервере, так и при запросе кэширования со стороны клиента.                                                                                                                                                    | `$\{application.name\}`                      |
| `sessionCacheSize`            | Максимальное количество сессий, которые сервер кэширует. Значение `0` означает неограниченное количество сессий.                                                                                                                                                                                                                                                                                                                                                      | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | Время кэширования сессии на сервере в часах.                                                                                                                                                                                                                                                                                                                                                                                                                        | `2`                                        |
| `extendedVerification`        | Если включено, проверьте, что CN или SAN сертификата соответствуют имени хоста пира.                                                                                                                                                                                                                                                                                                                                                                                  | `false`                                    |
| `requireTLSv1`                | Требовать подключения TLSv1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                  | `false`                                    |
| `requireTLSv1_1`              | Требовать подключения TLSv1.1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                | `false`                                    |
| `requireTLSv1_2`              | Требовать подключения TLSv1.2. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                  | `false`                                    |
| `fips`                        | Активирует режим FIPS OpenSSL. Поддерживается, если версия OpenSSL библиотеки поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                     | `false`                                    |
| `privateKeyPassphraseHandler` | Класс (подкласс PrivateKeyPassphraseHandler), который запрашивает пароль для доступа к секретному ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                         | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | Класс (подкласс CertificateHandler) для проверки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`.                                                                                                                                                                                                                                                  | `RejectCertificateHandler`                 |
| `disableProtocols`            | Протоколы, которые не разрешается использовать.                                                                                                                                                                                                                                                                                                                                                                                                                     |                                            |
| `preferServerCiphers`         | Шифры сервера, предпочитаемые клиентом.                                                                                                                                                                                                                                                                                                                                                                                                                               | `false`                                    |

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
        <!-- Использовать для самоподписанных: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- Использовать для самоподписанных: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```

## opentelemetry_span_log {#opentelemetry_span_log}

Настройки для системы таблицы [`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md).

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

Размер файловых чанков, которые будут храниться в кэше страниц пользователей, в байтах. Все чтения, проходящие через кэш, будут округлены до целого числа, кратного этому размеру.

## page_cache_free_memory_ratio {#page_cache_free_memory_ratio}

Доля лимита памяти, которая будет оставаться свободной в кэше страниц пользователей. А аналогично настройке min_free_kbytes в Linux.

## page_cache_history_window_ms {#page_cache_history_window_ms}

Задержка перед использованием освобожденной памяти кэшем страниц пользователей.

## page_cache_lookahead_blocks {#page_cache_lookahead_blocks}

При промахе кэша страниц пользователей, чтение до этого количества последовательных блоков сразу из основного хранилища, если их также нет в кэше. Каждый блок занимает page_cache_block_size байт.

## page_cache_max_size {#page_cache_max_size}

Максимальный размер кэша страниц пользователей. Установите на 0, чтобы отключить кэш. Если больше page_cache_min_size, размер кэша будет постоянно регулироваться в этом диапазоне, чтобы использовать большинство доступной памяти, сохраняя общее использование памяти ниже лимита (max_server_memory_usage[_to_ram_ratio]).

## page_cache_min_size {#page_cache_min_size}

Минимальный размер кэша страниц пользователей.

## page_cache_policy {#page_cache_policy}

Имя политики кэша страниц пользователей.

## page_cache_shards {#page_cache_shards}

Стрельба кэша страниц пользователей по этому количеству шардов для уменьшения конкуренции за мьютексы. Экспериментально, скорее всего, не улучшит производительность.

## page_cache_size_ratio {#page_cache_size_ratio}

Размер защищенной очереди в кэше страниц пользователей относительно общего размера кэша.

## part_log {#part_log}

Логирование событий, которые связаны с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Например, добавление или слияние данных. Вы можете использовать лог для имитации алгоритмов слияния и сравнения их характеристик. Вы можете визуализировать процесс слияния.

Запросы ведутся в таблице [system.part_log](/operations/system-tables/part_log), а не в отдельном файле. Вы можете настроить имя этой таблицы в параметре `table` (см. ниже).

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

Добавляет равномерно распределенное значение от 0 до x секунд к kill_delay_period, чтобы избежать эффекта "громадного стада" и последующего DoS ZooKeeper в случае очень большого количества таблиц. Доступно только в ClickHouse Cloud.

## parts_killer_pool_size {#parts_killer_pool_size}

Потоки для очистки устаревших потоков общего дерева слияния. Доступно только в ClickHouse Cloud.

## path {#path}

Путь к каталогу, содержащему данные.

:::note
Замечание: косая черта в конце обязательна.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```

## postgresql_port {#postgresql_port}

Порт для связи с клиентами через протокол PostgreSQL.

:::note
- Положительные целые числа задают номер порта для прослушивания
- Пустые значения используются для отключения связи с клиентами через протокол MySQL.
:::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```

## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size}

Размер фонового пула для предварительной выборки удаленных объектных хранилищ.

## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size}

Количество задач, которые можно разместить в пулах предварительной выборки.

## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size}

Максимальное количество заданий, которые можно запланировать в пуле потоков десериализации префиксов.

:::note
Значение `0` означает неограниченное количество.
:::

## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup}

Если true, ClickHouse создает все настроенные таблицы `system.*_log` перед запуском. Это может быть полезно, если некоторые скрипты инициализации зависят от этих таблиц.

## primary_index_cache_policy {#primary_index_cache_policy}

Имя политики кэша первичного индекса.

## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio}

Соотношение общего размера мета-кэша, который следует заполнить во время предварительного прогрева.

## primary_index_cache_size {#primary_index_cache_size}

Максимальный размер кэша для первичного индекса (индекс семейства таблиц MergeTree).

## primary_index_cache_size_ratio {#primary_index_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше первичного индекса относительно общего размера кэша.

## processors_profile_log {#processors_profile_log}

Настройки для системы таблицы [`processors_profile_log`](../system-tables/processors_profile_log.md).

<SystemLogParameters/>

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

Экспорт данных метрик для сбора с [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP endpoint для сбора метрик сервером prometheus. Начинается с '/'.
- `port` – Порт для `endpoint`.
- `metrics` – Экспортируйте метрики из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Экспортируйте метрики из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Экспортируйте текущие значения метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).
- `errors` - Экспортируйте количество ошибок по кодам ошибок, произошедших с момента последней перезагрузки сервера. Эта информация также может быть получена из [system.errors](/operations/system-tables/errors).

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

Определите прокси-серверы для HTTP и HTTPS запросов, в настоящее время поддерживается хранилищем S3, табличными функциями S3 и URL-функциями.

Существует три способа определения прокси-серверов:
- переменные окружения
- списки прокси
- удаленные разрешители прокси.

Поддерживается также обход прокси-серверов для определенных хостов с использованием `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать прокси-сервер для заданного протокола. Если у вас это установлено в системе, оно должно работать без проблем. 

Это самый простой подход, если у заданного протокола есть только один прокси-сервер, и этот прокси-сервер не меняется.

**Списки прокси**

Этот подход позволяет указать один или несколько прокси-серверов для протокола. Если определено более одного прокси-сервера, ClickHouse будет использовать различные прокси по кругу, распределяя нагрузку между серверами. Это самый простой способ, если существует более одного прокси-сервера для протокола, и список прокси-серверов не меняется.

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

Выберите родительское поле на вкладках ниже, чтобы просмотреть их дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле      | Описание                             |
|-----------|--------------------------------------|
| `<http>`  | Список одного или нескольких HTTP прокси  |
| `<https>` | Список одного или нескольких HTTPS прокси |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">

| Поле    | Описание         |
|---------|------------------|
| `<uri>` | URI прокси      |

  </TabItem>
</Tabs>

**Удаленные разрешители прокси**

Возможно, что прокси-серверы меняются динамически. В этом случае вы можете определить конечную точку разрешителя. ClickHouse отправляет пустой GET-запрос к этой конечной точке, удаленный разрешитель должен вернуть хост прокси. ClickHouse будет использовать его для формирования URI прокси с использованием следующего шаблона: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

Выберите родительское поле на вкладках ниже, чтобы просмотреть их дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле    | Описание                      |
|---------|-------------------------------|
| `<http>` | Список одного или нескольких разрешителей* |
| `<https>` | Список одного или нескольких разрешителей* |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">

| Поле        | Описание                                      |
|-------------|-----------------------------------------------|
| `<resolver>` | Конечная точка и другие детали для разрешителя |

:::note
Вы можете иметь несколько элементов `<resolver>`, но будет использоваться только первый `<resolver>` для данного протокола. Любые другие элементы `<resolver>` для этого протокола игнорируются. Это означает, что балансировка нагрузки (если это требуется) должна быть реализована удаленным разрешителем.
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| Поле                  | Описание                                                                                                                                                                       |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`          | URI разрешителя прокси                                                                                                                                                       |
| `<proxy_scheme>`      | Протокол окончательного URI прокси. Это может быть либо `http`, либо `https`.                                                                                                 |
| `<proxy_port>`        | Номер порта разрешителя прокси                                                                                                                                               |
| `<proxy_cache_time>`  | Время в секундах, в течение которого значения от разрешителя должны кэшироваться ClickHouse. Установка этого значения в `0` заставляет ClickHouse обращаться к разрешителю для каждого HTTP или HTTPS запроса. |

  </TabItem>
</Tabs>

**Приоритетность**

Настройки прокси определяются в следующем порядке:

| Порядок | Настройка                |
|---------|--------------------------|
| 1.      | Удаленные разрешители прокси |
| 2.      | Списки прокси            |
| 3.      | Переменные окружения      |

ClickHouse проверяет тип разрешителя с наивысшим приоритетом для протокола запроса. Если он не определен, он проверяет следующий тип разрешителя с более низким приоритетом, пока не достигнет разрешителя окружения. Это также позволяет использовать комбинации типов разрешителей.

## query_cache {#query_cache}

Конфигурация [кэша запросов](../query-cache.md).

Доступные настройки:

| Настройка                   | Описание                                                                                      | Значение по умолчанию |
|-----------------------------|-----------------------------------------------------------------------------------------------|------------------------|
| `max_size_in_bytes`         | Максимальный размер кэша в байтах. `0` означает, что кэш запросов отключен.                   | `1073741824`           |
| `max_entries`               | Максимальное количество результатов запросов `SELECT`, хранящихся в кэше.                     | `1024`                 |
| `max_entry_size_in_bytes`   | Максимальный размер в байтах, который могут иметь результаты запросов `SELECT`, чтобы быть сохраненными в кэше. | `1048576`              |
| `max_entry_size_in_rows`    | Максимальное количество строк, которое могут иметь результаты запросов `SELECT`, чтобы быть сохраненными в кэше.    | `30000000`             |

:::note
- Измененные настройки вступают в силу немедленно.
- Данные для кэша запросов выделяются в DRAM. Если памяти недостаточно, убедитесь, что вы установили небольшое значение для `max_size_in_bytes`, или полностью отключите кэш запросов.
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

Максимальный размер кэша условий запросов.

:::note
Эту настройку можно изменять во время выполнения, и она вступает в силу немедленно.
:::

## query_condition_cache_size_ratio {#query_condition_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше условий запросов относительно общего размера кэша.

## query_log {#query_log}

Настройки для ведения журналов запросов, полученных с настройкой [log_queries=1](../../operations/settings/settings.md).

Запросы ведутся в таблице [system.query_log](/operations/system-tables/query_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст ее. Если структура журнала запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, а новая таблица будет создана автоматически.

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

Правила на основе регулярных выражений, которые будут применяться к запросам, а также ко всем сообщениям журналов перед их сохранением в серверных логах,
[`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) и в логах, отправленных клиенту. Это позволяет предотвратить 
утечку конфиденциальных данных из SQL-запросов, таких как имена, адреса электронной почты, личные идентификаторы или номера кредитных карт в логи.

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

| Настройка   | Описание                                                                   |
|-------------|----------------------------------------------------------------------------|
| `name`      | имя правила (опционально)                                                  |
| `regexp`    | Регулярное выражение, совместимое с RE2 (обязательно)                    |
| `replace`   | строка замены для конфиденциальных данных (опционально, по умолчанию - шесть звездочек) |

Правила маскировки применяются ко всему запросу (для предотвращения утечек конфиденциальных данных из неправильно сформированных / неразбираемых запросов).

В таблице [`system.events`](/operations/system-tables/events) есть счетчик `QueryMaskingRulesMatch`, который содержит общее количество совпадений правил маскировки запросов.

Для распределенных запросов каждый сервер должен быть настроен отдельно, в противном случае подзапросы, переданные на другие
узлы, будут храниться без маскировки.
## query_metric_log {#query_metric_log}

По умолчанию отключено.

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

Чтобы отключить настройку `query_metric_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_thread_log {#query_thread_log}

Настройка для регистрации потоков запросов, полученных с помощью настройки [log_query_threads=1](/operations/settings/settings#log_query_threads).

Запросы регистрируются в таблице [system.query_thread_log](/operations/system-tables/query_thread_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала потоков запросов изменилась после обновления сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет создана автоматически.

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

Настройка для регистрации представлений (живых, материализованных и т. д.), зависящих от запросов, полученных с помощью настройки [log_query_views=1](/operations/settings/settings#log_query_views).

Запросы регистрируются в таблице [system.query_views_log](/operations/system-tables/query_views_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала представлений запросов изменилась после обновления сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет создана автоматически.

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

Настройка для перераспределения памяти для машинного кода ("текст") с использованием больших страниц.

:::note
Эта функция является сильно экспериментальной.
:::

Пример:

```xml
<remap_executable>false</remap_executable>
```
## remote_servers {#remote_servers}

Конфигурация кластеров, используемых движком таблиц [Distributed](../../engines/table-engines/special/distributed.md) и табличной функции `cluster`.

**Пример**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

Для значения атрибута `incl` смотрите раздел "[Файлы конфигурации](/operations/configuration-files)".

**См. Также**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Cluster Discovery](../../operations/cluster-discovery.md)
- [Replicated database engine](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts}

Список хостов, которые могут использоваться в хранилищах и табличных функциях, связанных с URL.

При добавлении хоста с помощью тега `\<host\>` xml:
- он должен быть указан точно так же, как в URL, так как имя проверяется до разрешения DNS. Например: `<host>clickhouse.com</host>`
- если порт явно указан в URL, то проверяется имя хоста:порт целиком. Например: `<host>clickhouse.com:80</host>`
- если хост указан без порта, то допускается любой порт хоста. Например: если указан `<host>clickhouse.com</host>`, то `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т. д. разрешены.
- если хост указан как IP-адрес, то он проверяется так, как указано в URL. Например: `[2a02:6b8:a::a]`.
- если имеются перенаправления и поддержка перенаправлений включена, то каждое перенаправление (поле location) проверяется.

Пример:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## replica_group_name {#replica_group_name}

Имя группы реплик для базы данных Replicated.

Кластер, созданный реплицированной базой данных, будет состоять из реплик в одной группе.
DDL-запросы будут ждать только реплики в одной группе.

По умолчанию пустое.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout}

Тайм-аут HTTP-соединения для запросов на получение частей. Унаследован из профиля по умолчанию `http_connection_timeout`, если явно не задан.
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout}

Тайм-аут HTTP получения для запросов на получение частей. Унаследован из профиля по умолчанию `http_receive_timeout`, если явно не задан.
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout}

Тайм-аут HTTP отправки для запросов на получение частей. Унаследован из профиля по умолчанию `http_send_timeout`, если явно не задан.
## replicated_merge_tree {#replicated_merge_tree}

Тонкая настройка для таблиц в [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Эта настройка имеет более высокий приоритет.

Для получения дополнительной информации смотрите заголовочный файл MergeTreeSettings.h.

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

Настройки для отправки отчетов о сбоях команде разработчиков ClickHouse через [Sentry](https://sentry.io).

Включение этой функции, особенно в средах предшествующих продакшену, очень оценено.

Серверу потребуется доступ к публичному интернету через IPv4 (на момент написания IPv6 не поддерживается Sentry) для корректной работы этой функции.

Ключи:

| Ключ                   | Описание                                                                                                                                                                                             |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | Булевый флаг для включения функции, по умолчанию `false`. Установите значение `true`, чтобы разрешить отправку отчетов о сбоях.                                                                     |
| `send_logical_errors` | `LOGICAL_ERROR` похож на `assert`, это ошибка в ClickHouse. Этот булевый флаг включает отправку этих исключений в Sentry (по умолчанию: `false`).                                                  |
| `endpoint`            | Вы можете переопределить URL-адрес конечной точки Sentry для отправки отчетов о сбоях. Это может быть отдельная учетная запись Sentry или ваша собственная самоуправляемая инстанция Sentry. Используйте синтаксис [Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=native#configure-the-sdk). |
| `anonymize`           | Избегайте присоединения имени хоста сервера к отчету о сбое.                                                                                                                                      |
| `http_proxy`          | Настройка HTTP-прокси для отправки отчетов о сбоях.                                                                                                                                               |
| `debug`               | Установите клиент Sentry в режим отладки.                                                                                                                                                          |
| `tmp_path`            | Путь в файловой системе для временного состояния отчета о сбое.                                                                                                                                  |
| `environment`         | Произвольное имя среды, в которой работает сервер ClickHouse. Оно будет упомянуто в каждом отчете о сбое. Значение по умолчанию - `test` или `prod` в зависимости от версии ClickHouse.             |

**Рекомендованное использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## series_keeper_path {#series_keeper_path}

Путь в Keeper с автоинкрементными номерами, сгенерированными с помощью функции `generateSerialID`. Каждая серия будет являться узлом под этим путем.
## show_addresses_in_stack_traces {#show_addresses_in_stack_traces}

Если установлено в true, будет показан адрес в трассировках стека
## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores}

Если установлено в true, ClickHouse будет ждать завершения запущенных резервных копий и восстановлений перед завершением работы.
## shutdown_wait_unfinished {#shutdown_wait_unfinished}

Задержка в секундах для ожидания незавершенных запросов
## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries}

Если установлено в true, ClickHouse будет ждать завершения запущенных запросов перед завершением работы.
## ssh_server {#ssh_server}

Публичная часть ключа хоста будет записана в файл known_hosts
на стороне клиента SSH при первом подключении.

Настройки ключа хоста по умолчанию неактивны.
Раскомментируйте настройки ключа хоста и укажите путь к соответствующему ssh-ключу для активации:

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

Конфигурация хранения состоит из следующих структур:

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

Конфигурация `disks` следует указанной ниже структуре:

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

Подтеги выше определяют следующие параметры для `disks`:

| Настройка                 | Описание                                                                                           |
|---------------------------|---------------------------------------------------------------------------------------------------|
| `<disk_name_N>`           | Имя диска, которое должно быть уникальным.                                                       |
| `path`                    | Путь, по которому будут храниться данные сервера (каталоги `data` и `shadow`). Он должен заканчиваться `/` |
| `keep_free_space_bytes`   | Размер резервируемого свободного пространства на диске.                                          |

:::note
Порядок дисков не имеет значения.
:::
### Конфигурация политик {#configuration-of-policies}

Подтеги выше определяют следующие параметры для `policies`:

| Настройка                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`                | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `volume_name_N`                | Имя тома. Имена томов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `disk`                         | Диск, расположенный внутри тома.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes`     | Максимальный размер блока данных, который может находиться на любом из дисков в этом томе. Если результат слияния приведет к размеру блока, превышающему max_data_part_size_bytes, блок будет записан в следующий том. Эта функция позволяет хранить новые / маленькие блоки на горячем (SSD) томе и перемещать их на холодный (HDD) том, когда они достигают большого размера. Не используйте эту опцию, если у политики есть только один том.                                                                 |
| `move_factor`                  | Доля доступного свободного пространства на томе. Если пространство становится меньше, данные начнут передаваться на следующий том, если он есть. Для передачи блоки сортируются по размеру от большего к меньшему (в порядке убывания), и выбираются блоки, общий размер которых достаточен для выполнения условия `move_factor`. Если общий размер всех блоков недостаточен, все блоки будут перемещены.                                                                                                             |
| `perform_ttl_move_on_insert`   | Отключает перемещение данных с истекшим TTL при вставке. По умолчанию (если включено), если мы вставляем часть данных, которая уже истекла в соответствии с правилом перемещения по времени жизни, она немедленно перемещается в том / диск, указанный в правиле перемещения. Это может значительно замедлить вставку, если целевой том / диск является медленным (например, S3). Если отключить, устаревшая часть данных будет записана в стандартный том, а затем немедленно перемещена в том, указанный в правиле для истекшего TTL. |
| `load_balancing`               | Политика балансировки дисков: `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`            | Устанавливает тайм-аут (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - всегда обновлять, `-1` - никогда не обновлять, значение по умолчанию - `60000`). Обратите внимание, если диск используется только ClickHouse и не будет подвергаться динамическому изменению размера файловой системы, вы можете использовать значение `-1`. В остальных случаях это не рекомендуется, поскольку это может привести к неправильному распределению пространства.                                                                                                                   |
| `prefer_not_to_merge`          | Отключает слияние частей данных на этом томе. Примечание: это потенциально вредно и может вызвать замедление. Когда эта настройка включена (не делайте это), слияние данных на этом томе запрещено (что плохо). Это позволяет контролировать, как ClickHouse взаимодействует с медленными дисками. Мы рекомендуем вообще не использовать это.                                                                                                                                                                                       |
| `volume_priority`              | Определяет приоритет (порядок) заполнения томов. Чем меньше значение, тем выше приоритет. Значения параметров должны быть натуральными числами и охватывать диапазон от 1 до N (N - самое большое заданное значение параметра) с отсутствием пропусков.                                                                                                                                                                                                                                                                |

Для `volume_priority`:
- Если все тома имеют этот параметр, они приоритизируются в указанном порядке.
- Если только _некоторые_ тома имеют этот параметр, тома, у которых его нет, имеют самый низкий приоритет. Те, у которых он есть, приоритизируются в соответствии со значением тега, приоритет остальных определяется порядком их описания в конфигурационном файле относительно друг друга.
- Если _ни один_ из томов не имеет этого параметра, их порядок определяется порядком их описания в конфигурационном файле.
- Приоритет томов может не совпадать.
## storage_connections_soft_limit {#storage_connections_soft_limit}

Соединения выше этого предела имеют значительно более короткое время жизни. Предел применяется к соединениям хранения.
## storage_connections_store_limit {#storage_connections_store_limit}

Соединения выше этого предела сбрасываются после использования. Установите значение 0, чтобы отключить кэш соединений. Предел применяется к соединениям хранения.
## storage_connections_warn_limit {#storage_connections_warn_limit}

Предупреждающие сообщения записываются в журналы, если число используемых соединений превышает этот предел. Предел применяется к соединениям хранения.
## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key}

Запись файлов метаданных диска в формате VERSION_FULL_OBJECT_KEY
## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid}

Если включено, внутренний UUID генерируется во время создания SharedSet и SharedJoin. Только ClickHouse Cloud
## table_engines_require_grant {#table_engines_require_grant}

Если установлено в true, пользователи требуют разрешение для создания таблицы с конкретным движком, например `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию, для обратной совместимости, создание таблицы с конкретным движком таблицы игнорирует разрешение, однако вы можете изменить это поведение, установив это значение в true.
:::
## tables_loader_background_pool_size {#tables_loader_background_pool_size}

Устанавливает количество потоков, выполняющих асинхронные загрузочные задания в фоновом пуле. Фоновый пул используется для асинхронной загрузки таблиц после запуска сервера в случае, если нет ожидающих запросов на таблицу. Сохраняйте низкое количество потоков в фоновом пуле, если много таблиц. Это освободит ресурсы CPU для параллельного выполнения запросов.

:::note
Значение `0` означает, что будут использоваться все доступные ЦП.
:::
## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size}

Устанавливает количество потоков, выполняющих загрузочные задания в фоновом пуле. Фоновый пул используется для синхронной загрузки таблиц перед тем, как сервер начнет прослушивать на порту, и для загрузки таблиц, которые ожидаются. Пул в переднем плане имеет более высокий приоритет, чем фоновой пул. Это означает, что никакое задание не стартует в фоновой пуле, пока выполняются задания в пуле с передним планом.

:::note
Значение `0` означает, что будут использоваться все доступные ЦП.
:::
## tcp_port {#tcp_port}

Порт для связи с клиентами через протокол TCP.

**Пример**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure}

TCP-порт для безопасной связи с клиентами. Используйте его с настройками [OpenSSL](#openssl).

**Значение по умолчанию**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## tcp_ssh_port {#tcp_ssh_port}

Порт для SSH-сервера, который позволяет пользователю подключаться и выполнять запросы в интерактивном режиме с помощью встроенного клиента через PTY.

Пример:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## temporary_data_in_cache {#temporary_data_in_cache}

С этой опцией временные данные будут храниться в кэше для конкретного диска.
В этом разделе вы должны указать имя диска с типом `cache`.
В этом случае кэш и временные данные будут использовать одно и то же пространство, и кэш диска может быть вытеснен для создания временных данных.

:::note
Можно использовать только один вариант для настройки хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
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
## text_log {#text_log}

Настройки для системной таблицы [text_log](/operations/system-tables/text_log) для регистрации текстовых сообщений.

<SystemLogParameters/>

Дополнительно:

| Настройка | Описание                                                                                                                                                                                                 | Значение по умолчанию |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| `level`   | Максимальный уровень сообщения (по умолчанию `Trace`), который будет храниться в таблице.                                                                                                            | `Trace`               |

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

Максимальное количество заданий, которые могут быть запланированы в глобальном пуле потоков. Увеличение размера очереди приводит к большему использованию памяти. Рекомендуется поддерживать это значение равным [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size).

:::note
Значение `0` означает неограниченное.
:::

**Пример**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```
## threadpool_writer_pool_size {#threadpool_writer_pool_size}

Размер фонового пула для запросов на запись в объектные хранилища
## threadpool_writer_queue_size {#threadpool_writer_queue_size}

Количество задач, которые можно добавить в фоновый пул для запросов на запись в объектные хранилища
## throw_on_unknown_workload {#throw_on_unknown_workload}

Определяет поведение при доступе к неизвестной WORKLOAD с настройкой запроса 'workload'.

- Если `true`, исключение RESOURCE_ACCESS_DENIED выбрасывается из запроса, который пытается получить доступ к неизвестной workload. Полезно для обеспечения планирования ресурсов для всех запросов после установления иерархии WORKLOAD и добавления WORKLOAD по умолчанию.
- Если `false` (по умолчанию), предоставляется неограниченный доступ без планирования ресурсов для запроса с настройкой 'workload', указывающим на неизвестную WORKLOAD. Это важно во время настройки иерархии WORKLOAD, прежде чем будет добавлен WORKLOAD по умолчанию.

**Пример**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**См. также**
- [Планирование загрузки](/operations/workload-scheduling.md)
## timezone {#timezone}

Часовой пояс сервера.

Указывается как идентификатор IANA для часового пояса UTC или географического местоположения (например, Africa/Abidjan).

Часовой пояс необходим для преобразований между строковыми и датой-временем форматами, когда поля DateTime выводятся в текстовом формате (печатаются на экране или в файле) и при получении DateTime из строки. Кроме того, часовой пояс используется в функциях, которые работают с временем и датой, если они не получили часовой пояс в входных параметрах.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**См. также**

- [session_timezone](../settings/settings.md#session_timezone)
## tmp_path {#tmp_path}

Путь в локальной файловой системе для хранения временных данных для обработки крупных запросов.

:::note
- Только один вариант может быть использован для настройки временного хранения данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- Заключительная косая черта обязательна.
:::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## tmp_policy {#tmp_policy}

Политика для хранения временных данных. Для получения дополнительной информации смотрите документацию по [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree).

:::note
- Для конфигурации временного хранения данных можно использовать только один параметр: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- Параметры `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes` игнорируются.
- Политика должна иметь ровно *один том* с *локальными* дисками.
:::

**Пример**

Когда `/disk1` будет полон, временные данные будут храниться на `/disk2`.

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

Определяет список пользовательских доменных зон верхнего уровня, которые будут добавлены, где каждая запись имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

Смотрите также:
- функция [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) и ее варианты,
  которая принимает имя пользовательского списка TLD, возвращая часть домена, которая включает доменные субдомены до первого значащего субдомена.
## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size}

Собирает случайные аллокации размером меньше или равным указанному значению с вероятностью, равной `total_memory_profiler_sample_probability`. 0 означает отключено. Вы можете установить 'max_untracked_memory' в 0, чтобы этот порог работал как ожидается.
## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size}

Собирает случайные аллокации размером больше или равным указанному значению с вероятностью, равной `total_memory_profiler_sample_probability`. 0 означает отключено. Вы можете установить 'max_untracked_memory' в 0, чтобы этот порог работал как ожидается.
## total_memory_profiler_step {#total_memory_profiler_step}

Когда использование памяти сервером превышает каждый следующий шаг в количестве байт, профайлер памяти будет собирать трассировку стека аллокации. Ноль означает отключение профайлера памяти. Значения меньше нескольких мегабайт замедлят сервер.
## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability}

Позволяет собирать случайные аллокации и деаллокции и записывать их в системную таблицу [system.trace_log](../../operations/system-tables/trace_log.md) с `trace_type`, равным `MemorySample`, с заданной вероятностью. Вероятность применяется для каждой аллокации или деаллокции, независимо от размера аллокации. Обратите внимание, что выборка происходит только тогда, когда количество необработанной памяти превышает предел необработанной памяти (значение по умолчанию равно `4` MiB). Это значение можно уменьшить, если [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step) уменьшен. Вы можете установить `total_memory_profiler_step` равным `1` для более детальной выборки.

Возможные значения:

- Положительное целое число.
- `0` — Запись случайных аллокаций и деаллокций в системную таблицу `system.trace_log` отключена.
## trace_log {#trace_log}

Настройки для операции системной таблицы [trace_log](/operations/system-tables/trace_log).

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

Имя политики кэша без сжатия.
## uncompressed_cache_size {#uncompressed_cache_size}

Максимальный размер (в байтах) для несжатых данных, используемых движками таблиц из семейства MergeTree.

Существует один общий кэш для сервера. Память выделяется по мере необходимости. Кэш используется, если опция `use_uncompressed_cache` включена.

Несжатый кэш выгоден для очень коротких запросов в отдельных случаях.

:::note
Значение `0` означает отключено.

Эта настройка может быть изменена во время выполнения и сразу вступит в силу.
:::
## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в несжатом кэше относительно общего размера кэша.
## url_scheme_mappers {#url_scheme_mappers}

Конфигурация для перевода укороченных или символических префиксов URL в полные URL.

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

Метод хранения заголовков частей данных в ZooKeeper. Эта настройка применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Ее можно указать:

**Глобально в разделе [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует настройку для всех таблиц на сервере. Вы можете изменять эту настройку в любое время. Существующие таблицы изменяют свое поведение при изменении настройки.

**Для каждой таблицы**

При создании таблицы укажите соответствующую [настройку движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этой настройкой не изменяется, даже если глобальная настройка меняется.

**Возможные значения**

- `0` — Функциональность отключена.
- `1` — Функциональность включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), тогда [реплицированные](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки частей данных компактно, используя единственный `znode`. Если таблица содержит много колонок, этот метод хранения значительно уменьшает объем данных, хранящихся в ZooKeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` вы не сможете понизить версию сервера ClickHouse до версии, которая не поддерживает эту настройку. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все сервера сразу. Лучше протестировать новые версии ClickHouse в тестовой среде или на нескольких серверах кластера.

Заголовки частей данных, уже сохраненные с этой настройкой, нельзя восстановить в их предыдущую (не компактную) интерпретацию.
:::
## user_defined_executable_functions_config {#user_defined_executable_functions_config}

Путь к файлу конфигурации для исполняемых пользовательских функций.

Путь:

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать подстановочные символы * и ?.

Смотрите также:
- "[Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions).".

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## user_defined_path {#user_defined_path}

Каталог с пользовательскими файлами. Используется для SQL пользовательских функций [SQL User Defined Functions](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## user_directories {#user_directories}

Раздел файла конфигурации, содержащий настройки:
- Путь к файлу конфигурации с предопределенными пользователями.
- Путь к папке, в которой хранятся пользователи, созданные с помощью SQL-команд.
- Дорожка узла ZooKeeper, где хранятся и реплицируются пользователи, созданные с помощью SQL-команд (экспериментально).

Если этот раздел указан, путь из [users_config](/operations/server-configuration-parameters/settings#users_config) и [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) не будет использоваться.

Раздел `user_directories` может содержать любое количество элементов, порядок элементов означает их приоритет (чем выше элемент, тем выше приоритет).

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

Вы также можете определить разделы `memory` — означает хранение информации только в памяти, без записи на диск, и `ldap` — означает хранение информации на LDAP-сервере.

Чтобы добавить LDAP-сервер в качестве удаленного каталога пользователей, которые не определены локально, определите один раздел `ldap` с следующими параметрами:

| Настройка  | Описание                                                                                                                                                                                                                                                                                                                                                                    |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server`   | одно из имен LDAP-серверов, определенных в разделе конфигурации `ldap_servers`. Этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                           |
| `roles`    | раздел со списком локально определенных ролей, которые будут присвоены каждому пользователю, полученному от LDAP-сервера. Если роли не указаны, пользователь не сможет выполнять никакие действия после аутентификации. Если любая из перечисленных ролей не определена локально на момент аутентификации, попытка аутентификации будет считаться неудачной, как если бы предоставленный пароль был неверным. |

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

Определяет, включена ли проверка информации о клиенте при получении пакета запроса.

По умолчанию это `false`:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```
## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries}

Размер кэша для индекса векторного сходства в записях. Ноль означает отключено.
## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy}

Имя политики кэша для индекса векторного сходства.
## vector_similarity_index_cache_size {#vector_similarity_index_cache_size}

Размер кэша для индексов векторного сходства. Ноль означает отключено.

:::note
Эта настройка может быть изменена во время выполнения и сразу вступит в силу.
:::
## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше индекса векторного сходства относительно общего размера кэша.
## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup}

Эта настройка позволяет определить поведение, если `dictionaries_lazy_load` равно `false`.
(Если `dictionaries_lazy_load` равно `true`, эта настройка ничего не изменяет.)

Если `wait_dictionaries_load_at_startup` равно `false`, сервер
начнет загружать все словари при запуске и будет принимать соединения параллельно с этой загрузкой.
Когда словарь используется в запросе в первый раз, запрос будет ждать, пока словарь не загрузится, если он еще не загружен.
Установка `wait_dictionaries_load_at_startup` в `false` может ускорить запуск ClickHouse, однако некоторые запросы могут выполняться медленнее
(потому что им придется ждать загрузки некоторых словарей).

Если `wait_dictionaries_load_at_startup` равно `true`, сервер будет ожидать на старте
завершения загрузки всех словарей (успешно или нет) перед принятием каких-либо соединений.

**Пример**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```
## workload_path {#workload_path}

Каталог, используемый в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется папка `/workload/` в каталоге работы сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**Смотрите также**
- [Иерархия нагрузки](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path}

Путь к узлу ZooKeeper, который используется в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для согласованности все SQL-определения хранятся как значение этого единственного znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**Смотрите также**
- [Иерархия нагрузки](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
## zookeeper {#zookeeper}

Содержит настройки, которые позволяют ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицированных таблиц. Если реплицированные таблицы не используются, этот раздел параметров можно пропустить.

Следующие настройки могут быть настроены с помощью подметок:

| Настройка                                    | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                       | Точка доступа ZooKeeper. Вы можете установить несколько конечных точек. Например, `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` указывает порядок узлов при попытке подключения к кластеру ZooKeeper.                                                                                                                                                                                                                                                                           |
| `session_timeout_ms`                         | Максимальный тайм-аут для клиентской сессии в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `operation_timeout_ms`                       | Максимальный тайм-аут для одной операции в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `root` (необязательно)                       | znode, который используется в качестве корня для znodes, используемых сервером ClickHouse.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `fallback_session_lifetime.min` (необязательно) | Минимальный предел для продолжительности сессии ZooKeeper на резервном узле, когда основной недоступен (балансировка нагрузки). Устанавливается в секундах. По умолчанию: 3 часа.                                                                                                                                                                                                                                                                                                                                   |
| `fallback_session_lifetime.max` (необязательно) | Максимальный предел для продолжительности сессии ZooKeeper на резервном узле, когда основной недоступен (балансировка нагрузки). Устанавливается в секундах. По умолчанию: 6 часов.                                                                                                                                                                                                                                                                                                                                   |
| `identity` (необязательно)                  | Пользователь и пароль, требуемые ZooKeeper для доступа к запрошенным znodes.                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `use_compression` (необязательно)           | Включает сжатие в протоколе Keeper, если установлено в true.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

Также имеется настройка `zookeeper_load_balancing` (необязательная), которая позволяет выбрать алгоритм для выбора узла ZooKeeper:

| Название алгоритма                   | Описание                                                                                                                    |
|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `random`                             | случайно выбирает один из узлов ZooKeeper.                                                                                |
| `in_order`                           | выбирает первый узел ZooKeeper, если он недоступен, тогда второй и так далее.                                            |
| `nearest_hostname`                   | выбирает узел ZooKeeper с именем хоста, наиболее близким к имени хоста сервера, имя хоста сравнивается с префиксом имени. |
| `hostname_levenshtein_distance`      | аналогично nearest_hostname, но сравнивает имя хоста с помощью расстояния Левенштейна.                                   |
| `first_or_random`                    | выбирает первый узел ZooKeeper, если он недоступен, тогда случайным образом выбирает один из оставшихся узлов ZooKeeper. |
| `round_robin`                        | выбирает первый узел ZooKeeper, если происходит повторное подключение, выбирает следующий.                                |

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
    <!-- Необязательно. Строка ACL для ZooKeeper. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**Смотрите также**

- [Репликация](../../engines/table-engines/mergetree-family/replication.md)
- [Руководство программиста ZooKeeper](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [Необходимая защищенная связь между ClickHouse и ZooKeeper](/operations/ssl-zookeeper)
