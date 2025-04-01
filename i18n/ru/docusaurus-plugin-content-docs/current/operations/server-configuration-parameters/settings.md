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

Этот раздел содержит описания настроек сервера. Это настройки, которые не могут быть изменены на уровне сессии или запроса.

Для получения дополнительной информации о файлах конфигурации в ClickHouse см. [Файлы конфигурации](/operations/configuration-files).

Другие настройки описаны в разделе [Настройки](/operations/settings/overview).
Перед изучением настроек мы рекомендуем прочитать раздел [Файлы конфигурации](/operations/configuration-files) и обратить внимание на использование замен (атрибуты  и ).
## access_control_improvements {#access_control_improvements}

Настройки для необязательных улучшений в системе контроля доступа.

| Настройка                                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Значение по умолчанию |
|------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| `users_without_row_policies_can_read_rows`      | Определяет, могут ли пользователи без разрешающих политик по строкам по-прежнему считывать строки с помощью запроса `SELECT`. Например, если есть два пользователя A и B, и политика строк определена только для A, то если эта настройка истинна, пользователь B увидит все строки. Если эта настройка ложна, пользователь B не увидит ни одной строки.                                                                                                                                                   | `true`                |
| `on_cluster_queries_require_cluster_grant`      | Определяет, требует ли запросы `ON CLUSTER` разрешение `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `true`                |
| `select_from_system_db_requires_grant`          | Определяет, требует ли `SELECT * FROM system.<table>` любых разрешений и может ли он выполняться любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON system.<table>` так же, как для нестандартных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые постоянные таблицы, такие как `one`, `contributors`) по-прежнему доступны для всех; и если есть привилегия `SHOW` (например, `SHOW USERS`), то соответствующая системная таблица (т.е. `system.users`) будет доступна. | `true`                |
| `select_from_information_schema_requires_grant` | Определяет, требует ли `SELECT * FROM information_schema.<table>` каких-либо разрешений и может ли он выполняться любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON information_schema.<table>`, так же как для обычных таблиц.                                                                                                                                                                                                                                                                                 | `true`                |
| `settings_constraints_replace_previous`         | Определяет, будет ли ограничение в профиле настроек для некоторой настройки отменять действия предыдущего ограничения (определенного в других профилях) для этой настройки, включая поля, которые не установлены новым ограничением. Также позволяет устанавливать тип ограничения `changeable_in_readonly`.                                                                                                                                                                                                 | `true`                |
| `table_engines_require_grant`                   | Определяет, требует ли создание таблицы с конкретным движком таблицы разрешение.                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false`               |
| `role_cache_expiration_time_seconds`            | Устанавливает количество секунд с момента последнего доступа, в течение которых роль хранится в кэше ролей.                                                                                                                                                                                                                                                                                                                                                                                                                           | `600`                 |

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

Путь к папке, где сервер ClickHouse хранит настройки пользователей и ролей, созданные с помощью SQL-команд.

**Смотрите также**

- [Контроль доступа и управление учетными записями](/operations/access-rights#access-control-usage)
## aggregate_function_group_array_action_when_limit_is_reached {#aggregate_function_group_array_action_when_limit_is_reached}

Действие, которое нужно выполнить, когда максимальный размер элемента массива превышен в groupArray: выбросить исключение или отбросить лишние значения.
## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size}

Максимальный размер элемента массива в байтах для функции groupArray. Этот предел проверяется при сериализации и помогает избежать большого размера состояния.
## allow_feature_tier {#allow_feature_tier}

Контролирует, может ли пользователь изменять настройки, связанные с различными уровнями функций.

- `0` - Изменения любой настройки разрешены (экспериментальные, бета, продакшн).
- `1` - Разрешены только изменения настроек бета и продакшн. Изменения экспериментальных настроек отклоняются.
- `2` - Разрешены только изменения продакшн настроек. Изменения экспериментальных или бета настроек отклоняются.

Это эквивалентно установке ограничения только для чтения для всех функций `EXPERIMENTAL` / `BETA`.

:::note
Значение `0` означает, что все настройки могут быть изменены.
:::
## allow_implicit_no_password {#allow_implicit_no_password}

Запрещает создание пользователя без пароля, если явно не указано 'IDENTIFIED WITH no_password'.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## allow_no_password {#allow_no_password}

Определяет, разрешен ли небезопасный тип пароля без пароля или нет.

```xml
<allow_no_password>1</allow_no_password>
```
## allow_plaintext_password {#allow_plaintext_password}

Определяет, разрешены ли типы паролей в открытом виде (небезопасные) или нет.

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```
## allow_use_jemalloc_memory {#allow_use_jemalloc_memory}

Разрешает использовать память jemalloc.
## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown}

Если истинно, очередь асинхронных вставок сбрасывается при корректном завершении работы.
## async_insert_threads {#async_insert_threads}

Максимальное количество потоков, фактически парсирующих и вставляющих данные в фоновом режиме. Ноль означает, что асинхронный режим отключен.
## async_load_databases {#async_load_databases}

Асинхронная загрузка баз данных и таблиц.

- Если `true`, все нестандартные базы данных с движком `Ordinary`, `Atomic` и `Replicated` будут загружены асинхронно после старта сервера ClickHouse. См. таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к таблице, которая еще не загружена, будет ждать именно этой таблицы, чтобы она была запущена. Если задача загрузки терпит неудачу, запрос выдаст ошибку (вместо завершения всей работы сервера в случае `async_load_databases = false`). Таблица, которую ожидает хотя бы один запрос, будет загружена с более высоким приоритетом. DDL-запросы к базе данных будут ждать именно этой базы данных, чтобы она была запущена. Также рассмотрите возможность установки лимита `max_waiting_queries` для общего числа ожидающих запросов.
- Если `false`, все базы данных загружаются при старте сервера.

**Пример**

```xml
<async_load_databases>true</async_load_databases>
```
## async_load_system_database {#async_load_system_database}

Асинхронная загрузка системных таблиц. Полезно, если в базе данных `system` имеется большое количество таблиц и частей журналов. Не зависит от настройки `async_load_databases`.

- Если установлено в `true`, все системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружены асинхронно после старта сервера ClickHouse. См. таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к системной таблице, которая еще не загружена, будет ждать именно этой таблицы, чтобы она была запущена. Таблица, которую ожидает хотя бы один запрос, будет загружена с более высоким приоритетом. Также рассмотрите возможность установки настройки `max_waiting_queries`, чтобы ограничить общее количество ожидающих запросов.
- Если установлено в `false`, системная база данных загружается перед запуском сервера.

**Пример**

```xml
<async_load_system_database>true</async_load_system_database>
```
## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s}

Период в секундах для обновления тяжелых асинхронных метрик.
## asynchronous_insert_log {#asynchronous_insert_log}

Настройки для системной таблицы [asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log), регистрирующей асинхронные вставки.

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

По умолчанию включен в ClickHouse Cloud развертывания.

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

Чтобы отключить настройку `asynchronous_metric_log`, необходимо создать следующий файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержимым:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics}

Включает расчет тяжелых асинхронных метрик.
## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s}

Период в секундах для обновления асинхронных метрик.
## auth_use_forwarded_address {#auth_use_forwarded_address}

Используйте исходный адрес для аутентификации клиентов, подключенных через прокси.

:::note
Эта настройка должна использоваться с особой осторожностью, так как переданные адреса могут быть легко подделаны — сервера, принимающие такую аутентификацию, не должны находиться в прямом доступе, а должны быть доступны исключительно через доверенный прокси.
:::
## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size}

Максимальное количество потоков, которое будет использоваться для выполнения операций сброса для таблиц с [Buffer-engine](/engines/table-engines/special/buffer) в фоновом режиме.
## background_common_pool_size {#background_common_pool_size}

Максимальное количество потоков, которое будет использоваться для выполнения различных операций (в основном сборки мусора) для таблиц с [*MergeTree-engine](/engines/table-engines/mergetree-family) в фоновом режиме.
## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size}

Максимальное количество потоков, которое будет использоваться для выполнения распределенных отправок.
## background_fetches_pool_size {#background_fetches_pool_size}

Максимальное количество потоков, которое будет использоваться для извлечения частей данных из другой реплики для таблиц с [*MergeTree-engine](/engines/table-engines/mergetree-family) в фоновом режиме.
## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio}

Устанавливает соотношение между количеством потоков и количеством фоново выполняемых слияний и мутаций, которые могут быть выполнены одновременно.

Например, если соотношение равно 2, а [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) установлено на 16, то ClickHouse может одновременно выполнить 32 фоновых слияния. Это возможно, потому что фоновые операции могут быть приостановлены и отложены. Это необходимо, чтобы дать малыми слияниям больший приоритет выполнения.

:::note
Вы можете только увеличивать это соотношение во время выполнения. Чтобы уменьшить его, необходимо перезапустить сервер.

Как и настройка [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) настройка [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) может быть применена из профиля `default` для обратной совместимости.
:::
## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy}

Политика, определяющая, как выполнять планирование фоновых слияний и мутаций. Возможные значения: `round_robin` и `shortest_task_first`.

Алгоритм, используемый для выбора следующего слияния или мутации, которое будет выполнено фоновым пулом потоков. Политику можно изменить в режиме реального времени без перезапуска сервера.
Может быть применена из профиля `default` для обратной совместимости.

Возможные значения:

- `round_robin` — Каждое параллельное слияние и мутация выполняются в порядке очереди, чтобы обеспечить отсутствие голодания. Меньшие слияния завершаются быстрее, чем более крупные, просто потому, что им нужно меньше блоков для слияния.
- `shortest_task_first` — Всегда выполняйте более мелкое слияние или мутацию. Слияния и мутации получают приоритеты на основе их итогового размера. Слияния меньших размеров строго предпочтительнее больших. Эта политика обеспечивает максимально быстрое слияние мелких частей, но может привести к бесконечному голоданию крупных слияний в партициях, сильно перегруженных `INSERT`-ами.
## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size}

Максимальное количество потоков, которое будет использоваться для выполнения фоновых операций для потоковой передачи сообщений.
## background_move_pool_size {#background_move_pool_size}

Максимальное количество потоков, которое будет использоваться для перемещения частей данных на другой диск или объем для таблиц с *MergeTree-engine в фоновом режиме.
## background_pool_size {#background_pool_size}

Устанавливает количество потоков, выполняющих фоновое слияние и мутации для таблиц с движками MergeTree.

:::note
- Эта настройка также может быть применена при запуске сервера из конфигурации профиля `default` для обратной совместимости при запуске сервера ClickHouse.
- Вы можете только увеличивать количество потоков во время выполнения.
- Чтобы уменьшить количество потоков, вам необходимо перезапустить сервер.
- Настраивая эту настройку, вы управляете нагрузкой на CPU и диск.
:::

:::danger
Меньший размер пула использует меньше ресурсов CPU и диска, но фоновые процессы продвигаются медленнее, что может в конечном итоге сказаться на производительности запросов.
:::

Перед изменением также пожалуйста обратите внимание на связанные настройки MergeTree, такие как:
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).

**Пример**

```xml
<background_pool_size>16</background_pool_size>
```
## background_schedule_pool_size {#background_schedule_pool_size}

Максимальное количество потоков, которое будет использоваться для постоянного выполнения некоторых легковесных периодических операций для реплицированных таблиц, потоковой передачи Kafka и обновлений кэша DNS.
## backup_log {#backup_log}

Настройки для системной таблицы [backup_log](../../operations/system-tables/backup_log.md), для регистрации операций `BACKUP` и `RESTORE`.

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

Настройки для резервных копий, используемых при записи `BACKUP TO File()`.

Следующие настройки могут быть настроены с помощью подпунктов:

| Настройка                             | Описание                                                                                                                                                                    | Значение по умолчанию |
|-------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| `allowed_path`                      | Путь к резервной копии, используемой с `File()`. Эта настройка должна быть установлена, чтобы использовать `File`. Путь может быть относительным к директории инстанса или абсолютным.              | `true`                |
| `remove_backup_files_after_failure` | Если команда `BACKUP` завершится с ошибкой, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до сбоя, иначе он оставит скопированные файлы как есть. | `true`                |

Эта настройка по умолчанию имеет следующий вид:

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size}

Максимальное количество заданий, которые могут быть запланированы в пуле потоков ввода-вывода резервных копий. Рекомендуется оставлять эту очередь неограниченной из-за текущей логики резервного копирования S3.

:::note
Значение `0` (по умолчанию) означает неограниченное количество.
:::
## bcrypt_workfactor {#bcrypt_workfactor}

Рабочий коэффициент для типа аутентификации bcrypt_password, использующего [Алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).

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

ClickHouse перезагружает встроенные словари каждые x секунд. Это позволяет редактировать словари "на лету" без перезапуска сервера.

**Пример**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```
## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio}

Установите максимальное соотношение размера кэша к RAM. Позволяет уменьшить размер кэша на системах с низкой памятью.
## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability}

Для целей тестирования.
## cgroup_memory_watcher_hard_limit_ratio {#cgroup_memory_watcher_hard_limit_ratio}

Устанавливает "жесткий" порог потребления памяти процесса сервера согласно cgroups, после достижения которого максимальное потребление памяти сервера корректируется до значения порога.

Смотрите настройки:
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio)
## cgroup_memory_watcher_soft_limit_ratio {#cgroup_memory_watcher_soft_limit_ratio}

Устанавливает "мягкий" порог потребления памяти процесса сервера согласно cgroups, после достижения которого аренды в jemalloc очищаются.

Смотрите настройки:
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)
## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time}

Интервал в секундах, в течение которого максимальное допустимое потребление памяти сервера корректируется соответствующим порогом в cgroups.

Чтобы отключить наблюдатель cgroup, установите это значение в `0`.

Смотрите настройки:
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio).
## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size}

Устанавливает размер кэша (в элементах) для [скомпилированных выражений](../../operations/caches.md).
## compiled_expression_cache_size {#compiled_expression_cache_size}

Устанавливает размер кэша (в байтах) для [скомпилированных выражений](../../operations/caches.md).
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
- `level` – Уровень сжатия. См. [Кодеки](/sql-reference/statements/create/table#general-purpose-codecs).

:::note
Вы можете настроить несколько секций `<case>`.
:::

**Действия, когда условия выполняются**:

- Если часть данных соответствует установленному условию, ClickHouse использует указанный метод сжатия.
- Если часть данных соответствует нескольким множествам условий, ClickHouse использует первое соответствующее множество условий.

:::note
Если для части данных не выполнены условия, ClickHouse использует сжатие `lz4`.
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

Политика, определяющая, как выполнять планирование CPU-слотов, указанных параметрами `concurrent_threads_soft_limit_num` и `concurrent_threads_soft_limit_ratio_to_cores`. Алгоритм, используемый для управления тем, как ограниченное количество CPU-слотов распределяется среди параллельных запросов. Планировщик может быть изменен в режиме реального времени без перезапуска сервера.

Возможные значения:

- `round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads` CPU-слотов. Один слот на поток. При конфликте CPU-слоты предоставляются запросам по кругу. Обратите внимание, что первый слот предоставляется без условий, что может привести к несправедливости и увеличению задержки запросов с высоким `max_threads` при большом количестве запросов с `max_threads` = 1.
- `fair_round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads - 1` CPU-слотов. Вариация `round_robin`, которая не требует CPU-слота для первого потока каждого запроса. Таким образом, запросы с `max_threads` = 1 не требуют слота и не могут несправедливо выделить все слоты. Нет слотов, предоставляемых без условий.
## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num}

Максимальное количество потоков обработки запросов, исключая потоки для извлечения данных с удаленных серверов, разрешенных для выполнения всех запросов. Это не жесткий лимит. В случае достижения ограничения запрос по-прежнему получит хотя бы один поток для выполнения. Запрос может увеличить количество потоков до желаемого числа во время выполнения, если больше потоков становится доступными.

:::note
Значение `0` (по умолчанию) означает неограниченное.
:::
## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores}

То же самое, что и [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num), но с учетом соотношения к ядрам.
## config_reload_interval_ms {#config_reload_interval_ms}

Как часто ClickHouse будет перезагружать конфигурацию и проверять новые изменения.
## core_dump {#core_dump}

Настраивает мягкий лимит для размера файла дампа ядра.

:::note
Жесткий лимит настраивается через системные инструменты.
:::

**Пример**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```
## crash_log {#crash_log}

Настройки для работы системной таблицы [crash_log](../../operations/system-tables/crash-log.md).

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

Этот параметр указывает путь к кэшу для пользовательских (созданных из SQL) кэшированных дисков. 
`custom_cached_disks_base_directory` имеет более высокий приоритет для пользовательских дисков по сравнению с `filesystem_caches_path` (который находится в `filesystem_caches_path.xml`), который используется, если первый отсутствует. 
Путь к параметру кэша файловой системы должен находиться внутри этого каталога, в противном случае будет выброшено исключение, предотвращающее создание диска.

:::note
Это не повлияет на диски, созданные на более ранней версии, для которой сервер был обновлен. В этом случае исключение не будет выброшено, чтобы сервер мог успешно запуститься.
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


Задержка, в течение которой удалённая таблица может быть восстановлена с помощью [`UNDROP`](/sql-reference/statements/undrop.md) команды. Если `DROP TABLE` выполнялся с модификатором `SYNC`, настройка игнорируется. 
По умолчанию для этой настройки составляет `480` (8 минут).
## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec}

В случае неудачного удаления таблицы ClickHouse будет ждать это время перед повторной попыткой операции.
## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency}

Размер пула потоков, используемого для удаления таблиц.
## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec}


Параметр задачи, которая очищает мусор из каталога `store/`. 
Устанавливает период планирования задачи.

:::note
Значение `0` означает "никогда". Значение по умолчанию соответствует 1 дню.
:::
## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec}


Параметр задачи, которая очищает мусор из каталога `store/`. 
Если какая-либо подсистема не используется clickhouse-server и этот каталог не был модифицирован за последние
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) секунд, задача "скроет" этот каталог, удалив все права доступа. 
Это также работает для каталогов, которые clickhouse-server не ожидает увидеть внутри `store/`.

:::note
Значение `0` означает "немедленно".
:::
## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec}


Параметр задачи, которая очищает мусор из каталога `store/`. 
Если какая-либо подсистема не используется clickhouse-server и она ранее была "скрыта" 
(см. [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec)) 
и этот каталог не был модифицирован за последние 
[`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) секунды, задача удалит этот каталог. 
Это также работает для каталогов, которые clickhouse-server не ожидает увидеть внутри `store/`.

:::note
Значение `0` означает "никогда". Значение по умолчанию составляет 30 дней.
:::
## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently}

Разрешить постоянное отделение таблиц в реплицированных базах данных
## default_database {#default_database}

Имя базы данных по умолчанию.
## default_password_type {#default_password_type}

Устанавливает тип пароля, который будет автоматически установлен для запросов, таких как `CREATE USER u IDENTIFIED BY 'p'`.

Допустимые значения:
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## default_profile {#default_profile}

Профиль параметров по умолчанию. Профили параметров находятся в файле, указанном в настройке `user_config`.

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

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать подстановочные знаки \* и ?.

Смотрите также:
- "[Словари](../../sql-reference/dictionaries/index.md)".

**Пример**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## dictionaries_lazy_load {#dictionaries_lazy_load}


Ленива загрузка словарей.

- Если `true`, то каждый словарь загружается при первом использовании. Если загрузка не удалась, функция, использующая словарь, выбрасывает исключение.
- Если `false`, сервер загружает все словари при запуске.

:::note
Сервер будет ждать при старте, пока все словари завершат свою загрузку, прежде чем принять какие-либо соединения (исключение: если [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) установлено в `false`).
:::

**Пример**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```
## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval}

Интервал в миллисекундах для попыток переподключения неудачных словарей MySQL и Postgres с включенной опцией `background_reconnect`.
## disable_insertion_and_mutation {#disable_insertion_and_mutation}


Отключает все запросы на вставку/изменение/удаление. Эта настройка будет включена, если кому-то нужны узлы только для чтения, чтобы предотвратить влияние вставки и мутации на производительность чтения.
## disable_internal_dns_cache {#disable_internal_dns_cache}

Отключает внутренний DNS-кэш. Рекомендуется для работы ClickHouse в системах с часто изменяющейся инфраструктурой, такой как Kubernetes.
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию туннелирование (т.е. `HTTP CONNECT`) используется для выполнения `HTTPS` запросов через `HTTP` прокси. Эта настройка может быть использована для его отключения.

**no_proxy**

По умолчанию все запросы будут проходить через прокси. Чтобы отключить его для определённых хостов, переменная `no_proxy` должна быть установлена. 
Её можно установить внутри `<proxy>` клаузы для списковых и удалённых резолверов, а также как переменную окружения для резолвера окружения. 
Она поддерживает IP-адреса, домены, поддомены и `'*'` подстановочный знак для полного обхода. Ведущие точки удаляются, как делает curl.

**Пример**

Следующая конфигурация обходит запросы прокси к `clickhouse.cloud` и всем его поддоменам (например, `auth.clickhouse.cloud`). То же самое касается GitLab, даже если у него есть ведущая точка. Оба `gitlab.com` и `about.gitlab.com` будут обходить прокси.

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

Соединения сверх этого лимита имеют значительно более короткое время жизни. Лимит применяется к соединениям дисков.
## disk_connections_store_limit {#disk_connections_store_limit}

Соединения выше этого лимита сбрасываются после использования. Установите в 0, чтобы отключить кэш соединений. Лимит применяется к соединениям дисков.
## disk_connections_warn_limit {#disk_connections_warn_limit}

Предупреждающие сообщения записываются в логи, если количество используемых соединений превышает этот лимит. Лимит применяется к соединениям дисков.
## display_secrets_in_show_and_select {#display_secrets_in_show_and_select}


Включает или отключает отображение секретов в запросах `SHOW` и `SELECT` для таблиц, баз данных, табличных функций и словарей.

Пользователь, желающий видеть секреты, также должен иметь
[`format_display_secrets_in_show_and_select` формат настройки](../settings/formats#format_display_secrets_in_show_and_select)
включённые и право
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Допустимые значения:

- `0` — Отключено.
- `1` — Включено.
## distributed_ddl {#distributed_ddl}

Управление выполнением [распределённых ddl запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) в кластере. 
Работает только если [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) включён.

Настройки, которые можно настроить внутри `<distributed_ddl>` включают:

| Параметр               | Описание                                                                                                                        | Значение по умолчанию              |
|------------------------|---------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| `path`                 | путь в Keeper для `task_queue` запросов DDL                                                                                   |                                     |
| `profile`              | профиль, используемый для выполнения запросов DDL                                                                                |                                     |
| `pool_size`            | сколько `ON CLUSTER` запросов могут выполняться одновременно                                                                    |                                     |
| `max_tasks_in_queue`   | максимальное количество задач, которые могут находиться в очереди.                                                               | `1,000`                             |
| `task_max_lifetime`    | удаление узла, если его возраст превышает это значение.                                                                         | `7 * 24 * 60 * 60` (неделя в секундах) |
| `cleanup_delay_period` | очистка начинается после получения события нового узла, если последняя очистка не производилась раньше, чем `cleanup_delay_period` секунд назад. | `60` секунд                         |

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

    <!-- Контролирует время жизни задач (по умолчанию 1 неделя) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Контролирует, как часто следует выполнять очистку (в секундах) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Контролирует, сколько задач может находиться в очереди -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```
## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4}

Разрешает разрешение имен в ipv4 адреса.
## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6}

Разрешает разрешение имен в ipv6 адреса.
## dns_cache_max_entries {#dns_cache_max_entries}

Максимальное количество записей внутреннего DNS-кэша.
## dns_cache_update_period {#dns_cache_update_period}

Период обновления внутреннего DNS-кэша в секундах.
## dns_max_consecutive_failures {#dns_max_consecutive_failures}

Максимальное количество неудачных попыток разрешения DNS для имени хоста, прежде чем удалить имя хоста из DNS кэша ClickHouse.
## enable_azure_sdk_logging {#enable_azure_sdk_logging}

Включает логирование из Azure sdk
## encryption {#encryption}

Настраивает команду для получения ключа, который будет использоваться кодеками [шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должны быть записаны в переменных окружения или установлены в конфигурационном файле.

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
Хранение ключей в конфигурационном файле не рекомендуется. Это небезопасно. Вы можете переместить ключи в отдельный конфигурационный файл на защищённом диске и сделать символьную ссылку на этот конфигурационный файл в папку `config.d/`.
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

Каждый из этих методов может быть применён для нескольких ключей:

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

Также пользователи могут добавить nonce, который должен быть длиной 12 байт (по умолчанию процессы шифрования и расшифровки используют nonce, состоящий из нулевых байтов):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Или его можно установить в шестнадцатеричном формате:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
Всё, упомянутое выше, может применяться для `aes_256_gcm_siv` (но ключ должен быть длиной 32 байта).
:::
## error_log {#error_log}

По умолчанию отключен.

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

Чтобы отключить настройку `error_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_error_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## format_alter_operations_with_parentheses {#format_alter_operations_with_parentheses}

Если установлено в `true`, тогда операции изменения будут обрамлены в скобки в форматируемых запросах. Это делает парсинг форматируемых alter запросов менее неоднозначным.
## format_schema_path {#format_schema_path}

Путь к директории со схемами для входных данных, таким как схемы для формата [CapnProto](../../interfaces/formats.md#capnproto).

**Пример**

```xml
<!-- Директория, содержащая файлы схем для различных форматов ввода. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns}

Период для таймера тактового времени CPU глобального профилировщика (в наносекундах). Установите значение 0, чтобы отключить глобальный профилировщик тактового времени CPU. Рекомендуемое значение — не менее 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (один раз в секунду) для кластерного профилирования.
## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns}

Период для таймера реального времени глобального профилировщика (в наносекундах). Установите значение 0, чтобы отключить глобальный профилировщик реального времени. Рекомендуемое значение — не менее 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (один раз в секунду) для кластерного профилирования.
## google_protos_path {#google_protos_path}

Определяет директорию, содержащую proto файлы для типов Protobuf.

Пример:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## graphite {#graphite}

Отправка данных в [Graphite](https://github.com/graphite-project).

Настройки:

- `host` – сервер Graphite.
- `port` – порт на сервере Graphite.
- `interval` – интервал отправки, в секундах.
- `timeout` – тайм-аут для отправки данных, в секундах.
- `root_path` – префикс для ключей.
- `metrics` – отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – отправка дельты данных, накопленных за время, из таблицы [system.events](/operations/system-tables/events).
- `events_cumulative` – отправка кумулятивных данных из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – отправка данных из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Вы можете настроить несколько `<graphite>` клауз. Например, вы можете использовать это для отправки различных данных с разными интервалами.

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

Настройки для упрощения данных для Graphite.

Для получения более подробной информации см. [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md).

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
Значение `0` означает, что ClickHouse отключает HSTS. Если вы установите положительное число, HSTS будет включён, и максимальный срок действия равен установленному вами значению.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## http_connections_soft_limit {#http_connections_soft_limit}

Соединения выше этого лимита имеют значительно более короткое время жизни. Лимит применяется к http соединениям, которые не принадлежат ни одному диску или хранилищу.
## http_connections_store_limit {#http_connections_store_limit}

Соединения выше этого лимита сбрасываются после использования. Установите в 0, чтобы отключить кэш соединений. Лимит применяется к http соединениям, которые не принадлежат ни одному диску или хранилищу.
## http_connections_warn_limit {#http_connections_warn_limit}

Предупреждающие сообщения записываются в логи, если количество используемых соединений превышает этот лимит. Лимит применяется к http соединениям, которые не принадлежат ни одному диску или хранилищу.
## http_handlers {#http_handlers}

Позволяет использовать пользовательские HTTP обработчики. 
Чтобы добавить новый http обработчик, просто добавьте новое `<rule>`. 
Правила проверяются сверху вниз, как определено, и первое совпадение выполнит обработчик.

Следующие настройки могут быть настроены с помощью под-тегов:

| Под-теги              | Определение                                                                                                                                           |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | Для сопоставления URL запроса, вы можете использовать префикс 'regex:' для использования регулярного выражения (по желанию)                             |
| `methods`            | Для сопоставления методов запроса, вы можете использовать запятые для разделения нескольких совпадений метода (по желанию)                             |
| `headers`            | Для сопоставления заголовков запроса, сопоставляйте каждый дочерний элемент (имя дочернего элемента — это имя заголовка), можно использовать префикс 'regex:' для использования регулярного выражения (по желанию) |
| `handler`            | Обработчик запроса                                                                                                                                 |
| `empty_query_string` | Проверяет, что в URL нет строки запроса                                                                                                               |

`handler` содержит следующие настройки, которые могут быть настроены с помощью под-тегов:

| Под-теги            | Определение                                                                                                                                                      |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | Локация для перенаправления                                                                                                                                     |
| `type`             | Поддерживаемые типы: static, dynamic_query_handler, predefined_query_handler, redirect                                                                           |
| `status`           | Используйте с типом static, код статуса ответа                                                                                                                  |
| `query_param_name` | Используйте с типом dynamic_query_handler, извлекает и выполняет значение, соответствующее значению `<query_param_name>` в параметрах HTTP-запроса               |
| `query`            | Используйте с типом predefined_query_handler, выполняет запрос, когда вызывается обработчик                                                                      |
| `content_type`     | Используйте с типом static, content-type ответа                                                                                                                 |
| `response_content` | Используйте с типом static, содержимое ответа, отправляемое клиенту, при использовании префиксов 'file://' или 'config://', найти содержимое из файла или конфигурации и отправить клиенту  |

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

Используется для добавления заголовков к ответу на HTTP запрос `OPTIONS`. 
Метод `OPTIONS` используется при выполнении предварительных запросов CORS.

Для получения дополнительной информации см. [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS).

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

Страница, которая показывается по умолчанию, когда вы обращаетесь к HTTP(s) серверу ClickHouse. 
Значение по умолчанию — "Ok." (с переводом строки в конце)

**Пример**

Открывает `https://tabix.io/`, когда обращаетесь к `http://localhost: http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size}

Размер фонового пула для каталога iceberg.
## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size}

Количество задач, которые можно добавить в пул каталога iceberg.
## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query}


Если true, ClickHouse не записывает значения по умолчанию для пустых SQL-заявлений о безопасности в запросах `CREATE VIEW`.

:::note
Эта настройка необходима только на переходный период и станет устаревшей в 24.4
:::
## include_from {#include_from}

Путь к файлу с заменами. Поддерживаются форматы XML и YAML.

Для получения дополнительной информации см. раздел "[Конфигурационные файлы](/operations/configuration-files)".

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## index_mark_cache_policy {#index_mark_cache_policy}

Имя политики кэша меток вторичного индекса.
## index_mark_cache_size {#index_mark_cache_size}


Максимальный размер кэша для меток индекса.

:::note

Значение `0` означает отключено.

Эта настройка может быть изменена во время выполнения и вступит в силу немедленно.
:::
## index_mark_cache_size_ratio {#index_mark_cache_size_ratio}

Размер защищённой очереди (в случае политики SLRU) в кэше меток вторичного индекса относительно общего размера кэша.
## index_uncompressed_cache_policy {#index_uncompressed_cache_policy}

Имя политики кэша для некомпрессированных блоков индексов вторичного `MergeTree`.

## index_uncompressed_cache_size {#index_uncompressed_cache_size}

Максимальный размер кэша для некомпрессированных блоков индексов `MergeTree`.

:::note
Значение `0` означает отключено.

Эта настройка может быть изменена во время выполнения и вступит в силу немедленно.
:::
## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio}

Размер защищённой очереди (в случае политики SLRU) в кэше некомпрессированных индексов вторичного кэша относительно общего размера кэша.
## interserver_http_credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). 
Кроме того, сервер аутентифицирует другие реплики, используя эти учетные данные. 
`interserver_http_credentials` должны быть одинаковыми для всех реплик в кластере.

:::note
- По умолчанию, если секция `interserver_http_credentials` пропущена, аутентификация не используется во время репликации.
- Настройки `interserver_http_credentials` не относятся к учетным данным клиента ClickHouse [конфигурации](../../interfaces/cli.md#configuration_files).
- Эти учетные данные общие для репликации через `HTTP` и `HTTPS`.
:::

Следующие настройки могут быть настроены с помощью под-тегов:

- `user` — Имя пользователя.
- `password` — Пароль.
- `allow_empty` — Если `true`, то другим репликам разрешено подключаться без аутентификации, даже если учетные данные установлены. Если `false`, то подключения без аутентификации отклоняются. По умолчанию: `false`.
- `old` — Содержит старые `user` и `password`, используемые во время ротации учетных данных. Можно указать несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию учетных данных межсерверов без остановки всех реплик одновременно для обновления их конфигурации. Учетные данные можно изменять в несколько шагов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволяет подключениям с аутентификацией и без.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите `allow_empty` в `false` или удалите эту настройку. Это сделает аутентификацию с новыми учетными данными обязательной.

Чтобы изменить существующие учетные данные, переместите имя пользователя и пароль в секцию `interserver_http_credentials.old` и обновите `user` и `password` новыми значениями. В этот момент сервер использует новые учетные данные для подключения к другим репликам и принимает подключения как с новыми, так и со старыми учетными данными.

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

Когда новые учетные данные применяются ко всем репликам, старые учетные данные могут быть удалены.
## interserver_http_host {#interserver_http_host}

Имя хоста, которое может использоваться другими серверами для доступа к этому серверу.

Если опущено, оно определяется так же, как команда `hostname -f`.

Полезно для выхода за пределы конкретного сетевого интерфейса.

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

Похоже на [`interserver_http_host`](#interserver_http_host), за исключением того, что это имя хоста может использоваться другими серверами для доступа к этому серверу через `HTTPS`.

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

Ограничение на хосты, которые могут обмениваться данными между серверами ClickHouse. Если используется Keeper, то то же ограничение будет применяться к коммуникации между разными экземплярами Keeper.

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

Максимальное количество задач, которые могут быть запланированы в пул потока ввода-вывода.

:::note
Значение `0` означает неограниченное количество.
:::
## keep_alive_timeout {#keep_alive_timeout}

Количество секунд, на которое ClickHouse ожидает входящие запросы по протоколу HTTP, прежде чем закрыть соединение.

**Пример**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## keeper_multiread_batch_size {#keeper_multiread_batch_size}

Максимальный размер пакета для запроса MultiRead к [Zoo]Keeper, который поддерживает пакетирование. Если установлено значение 0, пакетирование отключено. Доступно только в ClickHouse Cloud.
## latency_log {#latency_log}

По умолчанию отключен.

**Включение**

Чтобы вручную включить сбор истории задержки, создайте `/etc/clickhouse-server/config.d/latency_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `latency_log`, вы должны создать следующий файл `/etc/clickhouse-server/config.d/disable_latency_log.xml` со следующим содержимым:

```xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## ldap_servers {#ldap_servers}

Список серверов LDAP с их параметрами подключения для:
- использования их в качестве аутентификаторов для выделенных локальных пользователей, у которых указан механизм аутентификации 'ldap' вместо 'password'
- использования их в качестве удалённых пользовательских каталогов.

Следующие настройки могут быть сконфигурированы с помощью под-tags:

| Настройка                       | Описание                                                                                                                                                                                                                                                                                                                                                                                                                              |
|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                          | Имя хоста или IP сервера LDAP, этот параметр обязательный и не может быть пустым.                                                                                                                                                                                                                                                                                                                                                     |
| `port`                          | Порт сервера LDAP, по умолчанию 636, если `enable_tls` установлен в true, иначе `389`.                                                                                                                                                                                                                                                                                                                                                  |
| `bind_dn`                       | Шаблон, используемый для построения DN для привязки. Полученный DN будет создан путем замены всех подстрок `\{user_name\}` шаблона на актуальное имя пользователя в ходе каждой попытки аутентификации.                                                                                                                                                                                                                                  |
| `user_dn_detection`             | Раздел с параметрами поиска LDAP для определения фактического DN пользователя, которому была выполнена привязка. Это в основном используется в фильтрах поиска для дальнейшего сопоставления ролей, когда сервер является Active Directory. Полученный DN пользователя будет использоваться при замене подстрок `\{user_dn\}` везде, где это разрешено. По умолчанию DN пользователя равен DN привязки, но после выполнения поиска он будет обновлён до фактического обнаруженного значения DN пользователя. |
| `verification_cooldown`         | Период времени в секундах после успешной попытки привязки, в течение которого пользователь будет считаться успешно аутентифицированным для всех последующих запросов без обращения к серверу LDAP. Укажите `0` (по умолчанию), чтобы отключить кэширование и заставить сервер LDAP обращаться для каждого запроса аутентификации.                                                                                                         |
| `enable_tls`                    | Флаг для включения безопасного соединения с сервером LDAP. Укажите `no` для протокола в простом тексте (`ldap://`) (не рекомендуется). Укажите `yes` для протокола LDAP через SSL/TLS (`ldaps://`) (рекомендуется, по умолчанию). Укажите `starttls`, чтобы использовать устаревший протокол StartTLS (простой текстовый протокол (`ldap://`), обновлённый до TLS).                                                            |
| `tls_minimum_protocol_version`  | Минимальная версия протокола SSL/TLS. Принятые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (по умолчанию).                                                                                                                                                                                                                                                                                                               |
| `tls_require_cert`              | Поведение проверки сертификата SSL/TLS. Принятые значения: `never`, `allow`, `try`, `demand` (по умолчанию).                                                                                                                                                                                                                                                                                                                         |
| `tls_cert_file`                 | Путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                              |
| `tls_key_file`                  | Путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                                                                                          |
| `tls_ca_cert_file`              | Путь к файлу CA-сертификата.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `tls_ca_cert_dir`               | Путь к директории, содержащей CA-сертификаты.                                                                                                                                                                                                                                                                                                                                                                                         |
| `tls_cipher_suite`              | Разрешённый набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                                                                                         |

Настройка `user_dn_detection` может быть сконфигурирована с под-tags:

| Настройка         | Описание                                                                                                                                                                                                                                                                                                                                    |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`         | Шаблон, используемый для создания базового DN для поиска LDAP. Полученный DN будет создан путём замены всех подстрок `\{user_name\}` и `\{bind_dn\}` шаблона на актуальное имя пользователя и DN привязки во время поиска LDAP.                                                                                                                             |
| `scope`           | Область поиска LDAP. Принятые значения: `base`, `one_level`, `children`, `subtree` (по умолчанию).                                                                                                                                                                                                                                       |
| `search_filter`   | Шаблон, используемый для создания фильтра поиска для поиска LDAP. Полученный фильтр будет создан путём замены всех подстрок `\{user_name\}`, `\{bind_dn\}` и `\{base_dn\}` шаблона на актуальное имя пользователя, DN привязки и базовый DN при выполнении поиска LDAP. Обратите внимание, что специальные символы должны быть корректно экранированы в XML. |

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

Пример (типичный Active Directory с настроенным определением пользователского DN для дальнейшего сопоставления ролей):

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

Ключ лицензии для ClickHouse Enterprise Edition.
## listen_backlog {#listen_backlog}

Запас (размер очереди ожидающих соединений) сокета прослушивания. Значение по умолчанию `4096` совпадает с таковым в linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4).

Обычно это значение не нужно изменять, так как:
- Значение по умолчанию достаточно велико,
- Для принятия клиентских соединений сервер имеет отдельный поток.

Так что даже если у вас `TcpExtListenOverflows` (из `nstat`) ненулевое и этот счётчик растёт для сервера ClickHouse, это не означает, что это значение нужно увеличивать, так как:
- Обычно, если `4096` недостаточно, это указывает на некоторые внутренние проблемы масштабирования ClickHouse, поэтому лучше сообщить о проблеме.
- Это не означает, что сервер сможет обрабатывать больше соединений позже (а даже если сможет, в тот момент клиенты могли уже покинуть соединение или отключиться).

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

Разрешить нескольким серверам прослушивать один и тот же адрес:порт. Запросы будут направлены на случайный сервер операционной системой. Включение этой настройки не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

По умолчанию:
## listen_try {#listen_try}

Сервер не будет завершаться, если сети IPv6 или IPv4 недоступны при попытке прослушивания.

**Пример**

```xml
<listen_try>0</listen_try>
```
## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size}

Размер фонового пула для загрузки меток.
## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size}

Количество задач, которые можно добавить в пул предварительной загрузки.
## logger {#logger}

Местоположение и формат логов.

**Ключи**:

| Ключ                       | Описание                                                                                                                                                                         |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                   | Уровень логирования. Приемлемые значения: `none` (выключить логирование), `fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test`                                  |
| `log`                     | Путь к файлу лога.                                                                                                                                                           |
| `errorlog`                | Путь к файлу с ошибками.                                                                                                                                                     |
| `size`                    | Политика ротации: Максимальный размер файлов логов в байтах. Как только размер файла лога превышает этот порог, он переименовывается и архивируется, и создаётся новый файл лога.                  |
| `count`                   | Политика ротации: Сколько исторических файлов логов Clickhouse хранится максимум.                                                                                                         |
| `stream_compress`         | Сжимать сообщения логов с помощью LZ4. Установите на `1` или `true`, чтобы включить.                                                                                                                    |
| `console`                 | Не записывать сообщения логов в файлы логов, а вместо этого выводить их в консоль. Установите на `1` или `true`, чтобы включить. По умолчанию `1`, если Clickhouse не работает в режимe демона, иначе `0`. |
| `console_log_level`       | Уровень логирования для вывода в консоль. По умолчанию это `level`.                                                                                                                                  |
| `formatting`              | Формат логов для вывода в консоль. В настоящее время поддерживается только `json`.                                                                                                                  |
| `use_syslog`              | Также пересылать вывод логов в syslog.                                                                                                                                                  |
| `syslog_level`            | Уровень логирования для записи в syslog.                                                                                                                                                    |

**Спецификаторы формата логирования**

Имена файлов в путях `log` и `errorLog` поддерживают следующие спецификаторы формата для результирующего имени файла (директория не поддерживает их).

Колонка "Пример" показывает вывод на `2023-07-06 18:32:07`.

| Спецификатор | Описание                                                                                                         | Пример                  |
|--------------|---------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | Литерал %                                                                                                           | `%`                        |
| `%n`         | Символ новой строки                                                                                                  |                          |
| `%t`         | Горизонтальный символ табуляции                                                                                            |                          |
| `%Y`         | Год в десятичном формате, например 2017                                                                                 | `2023`                     |
| `%y`         | Последние 2 цифры года в десятичном формате (диапазон [00,99])                                                           | `23`                       |
| `%C`         | Первые 2 цифры года в десятичном формате (диапазон [00,99])                                                          | `20`                       |
| `%G`         | Четырёхзначный [год в формате ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, содержащий указанную неделю. Обычно полезен только с `%V`  | `2023`       |
| `%g`         | Последние 2 цифры [года в формате ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, содержащий указанную неделю.                         | `23`         |
| `%b`         | Сокращённое название месяца, например, Окт (в зависимости от локали)                                                                 | `Jul`                      |
| `%h`         | Синоним для %b                                                                                                       | `Jul`                      |
| `%B`         | Полное название месяца, например, Октябрь (в зависимости от локали)                                                                    | `July`                     |
| `%m`         | Месяц в десятичном формате (диапазон [01,12])                                                                           | `07`                       |
| `%U`         | Номер недели в году в десятичном формате (воскресенье является первым днем недели) (диапазон [00,53])                          | `27`                       |
| `%W`         | Номер недели в году в десятичном формате (понедельник является первым днем недели) (диапазон [00,53])                          | `27`                       |
| `%V`         | Номер недели по стандарту ISO 8601 (диапазон [01,53])                                                                                | `27`                       |
| `%j`         | Номер дня в году в десятичном формате (диапазон [001,366])                                                               | `187`                      |
| `%d`         | День месяца в виде десятичного числа с заранее добавленным нулём (диапазон [01,31]). Однозначные числа предшествует нулём.                 | `06`                       |
| `%e`         | День месяца в виде десятичного числа с пробелом (диапазон [1,31]). Однозначные числа предшествует пробелом.              | `&nbsp; 6`                 |
| `%a`         | Сокращённое название дня недели, например, Пт (в зависимости от локали)                                                               | `Thu`                      |
| `%A`         | Полное название дня недели, например, Четверг (в зависимости от локали)                                                                   | `Thursday`                 |
| `%w`         | День недели в виде целого числа, где воскресенье равно 0 (диапазон [0-6])                                                          | `4`                        |
| `%u`         | День недели в десятичном формате, где понедельник равен 1 (ISO 8601 формат) (диапазон [1-7])                                      | `4`                        |
| `%H`         | Час в десятичном формате, 24-часовой формат (диапазон [00-23])                                                             | `18`                       |
| `%I`         | Час в десятичном формате, 12-часовой формат (диапазон [01,12])                                                             | `06`                       |
| `%M`         | Минута в десятичном формате (диапазон [00,59])                                                                          | `32`                       |
| `%S`         | Секунда в десятичном формате (диапазон [00,60])                                                                          | `07`                       |
| `%c`         | Стандартная строка даты и времени, например, Вс Окт 17 04:41:13 2010 (в зависимости от локали)                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованное представление даты (в зависимости от локали)                                                                    | `07/06/23`                 |
| `%X`         | Локализованное представление времени, например, 18:40:20 или 6:40:20 PM (в зависимости от локали)                                       | `18:32:07`                 |
| `%D`         | Короткая дата в формате ММ/ДД/ГГ, эквивалентно %m/%d/%y                                                                         | `07/06/23`                 |
| `%F`         | Короткая дата в формате ГГГГ-ММ-ДД, эквивалентно %Y-%m-%d                                                                       | `2023-07-06`               |
| `%r`         | Локализованное время в 12-часовом формате (в зависимости от локали)                                                                     | `06:32:07 PM`              |
| `%R`         | Эквивалентно "%H:%M"                                                                                               | `18:32`                    |
| `%T`         | Эквивалентно "%H:%M:%S" (формат времени ISO 8601)                                                                 | `18:32:07`                 |
| `%p`         | Локализованное обозначение a.m. или p.m. (в зависимости от локали)                                                               | `PM`                       |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430), или никаких символов, если информация о временной зоне недоступна | `+0800`                    |
| `%Z`         | Название временной зоны в зависимости от локали или аббревиатура, или никаких символов, если информация о временной зоне недоступна     | `Z AWST `                  |

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

Чтобы выводить сообщения логов только в консоль:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**Переопределения по уровням**

Уровень логирования отдельных имен логов может быть переопределён. Например, чтобы отключить все сообщения логгеров "Backup" и "RBAC".

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

Чтобы дополнительно записывать сообщения логов в syslog:

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
| `address`  | Адрес syslog в формате `host\[:port\]`. Если опущен, используется локальный демон.                                                                                                                                                                         |
| `hostname` | Имя хоста, с которого отправляются логи (необязательно).                                                                                                                                                                                                      |
| `facility` | Ключевое слово syslog [facility](https://en.wikipedia.org/wiki/Syslog#Facility). Должен быть указан верхний регистр с префиксом "LOG_", например, `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т.д. По умолчанию: `LOG_USER`, если указан `address`, иначе `LOG_DAEMON`.                                           |
| `format`   | Формат сообщения лога. Возможные значения: `bsd` и `syslog.`                                                                                                                                                                                                       |

**Форматы логов**

Вы можете указать формат лога, который будет выведен в консоль. В настоящее время поддерживается только JSON.

**Пример**

Вот пример выходного JSON лога:

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

**Переименование ключей для JSON логов**

Имена ключей могут быть изменены путём изменения значений тегов внутри `<names>`. Например, чтобы изменить `DATE_TIME` на `MY_DATE_TIME`, можно использовать `<date_time>MY_DATE_TIME</date_time>`.

**Пропуск ключей для JSON логов**

Свойства лога могут быть пропущены путём комментирования свойства. Например, если вы не хотите, чтобы ваш лог выводил `query_id`, вы можете закомментировать тег `<query_id>`.
## macros {#macros}

Подстановки параметров для реплицированных таблиц.

Можно опустить, если реплицированные таблицы не используются.

Для получения дополнительной информации смотрите раздел [Создание реплицированных таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```
## mark_cache_policy {#mark_cache_policy}

Имя политики кэширования меток.
## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio}

Соотношение общего размера кэша меток, который необходимо заполнить во время предварительного прогрева.

## mark_cache_size {#mark_cache_size}

Максимальный размер кэша для меток (индекс семейства [`MergeTree`](/engines/table-engines/mergetree-family) таблиц).

:::note
Эту настройку можно изменить во время работы, и изменения вступят в силу немедленно.
:::
## mark_cache_size_ratio {#mark_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше меток относительно общего размера кэша.
## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size}

Количество потоков для загрузки активного набора частей данных (активных) при запуске.
## max_authentication_methods_per_user {#max_authentication_methods_per_user}

Максимальное количество методов аутентификации, с помощью которых может быть создан или изменен пользователь. Изменение этой настройки не влияет на существующих пользователей. Запросы на создание/изменение, связанные с аутентификацией, завершатся неудачно, если они превысят предел, указанный в этой настройке. Запросы на создание/изменение, не связанные с аутентификацией, будут успешными.

:::note
Значение `0` означает неограниченное.
:::
## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server}

Максимальная скорость чтения в байтах в секунду для всех резервных копий на сервере. Ноль означает неограниченное.
## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size}

Если количество **безделичных** потоков в пуле потоков ввода-вывода резервных копий превышает `max_backup_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые бездельничающими потоками, и уменьшит размер пула. Потоки могут быть созданы снова, если это потребуется.
## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size}

ClickHouse использует потоки из пула потоков ввода-вывода резервных копий для выполнения операций ввода-вывода резервного копирования S3. `max_backups_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.
## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size}

Максимальное количество потоков для построения векторных индексов.

:::note
Значение `0` означает все ядра.
:::
## max_concurrent_insert_queries {#max_concurrent_insert_queries}

Ограничение на общее количество одновременно выполняемых запросов на вставку.

:::note
Значение `0` (по умолчанию) означает неограниченное.

Эту настройку можно изменить во время работы, и изменения вступят в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::
## max_concurrent_queries {#max_concurrent_queries}

Ограничение на общее количество одновременно выполняемых запросов. Обратите внимание, что также следует учитывать ограничения на запросы `INSERT` и `SELECT`, а также максимальное количество запросов для пользователей.

См. также:
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note
Значение `0` (по умолчанию) означает неограниченное.

Эту настройку можно изменить во время работы, и изменения вступят в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::
## max_concurrent_select_queries {#max_concurrent_select_queries}

Ограничение на общее количество одновременно выполняемых запросов выбора.

:::note
Значение `0` (по умолчанию) означает неограниченное.

Эту настройку можно изменить во время работы, и изменения вступят в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::
## max_connections {#max_connections}

Максимальное количество подключений к серверу.
## max_database_num_to_throw {#max_database_num_to_throw}

Если количество баз данных превышает это значение, сервер выдаст исключение. 0 означает отсутствие ограничений.
## max_database_num_to_warn {#max_database_num_to_warn}

Если количество подключенных баз данных превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```
## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size}

Количество потоков для создания таблиц во время восстановления реплик в DatabaseReplicated. Ноль означает, что количество потоков равно количеству ядер.
## max_dictionary_num_to_throw {#max_dictionary_num_to_throw}

Если количество словарей превышает это значение, сервер выдаст исключение.

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

Максимальное количество записей, которое разрешается для статистики хеш-таблицы, собранной во время агрегации.
## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size}

Количество потоков для ALTER TABLE FETCH PARTITION.
## max_io_thread_pool_free_size {#max_io_thread_pool_free_size}

Если количество **безделичных** потоков в пуле потоков ввода-вывода превышает `max_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые бездельничающими потоками, и уменьшит размер пула. Потоки могут быть созданы снова, если это потребуется.
## max_io_thread_pool_size {#max_io_thread_pool_size}

ClickHouse использует потоки из пула потоков ввода-вывода для выполнения некоторых операций ввода-вывода (например, для взаимодействия с S3). `max_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.
## max_keep_alive_requests {#max_keep_alive_requests}

Максимальное количество запросов через одно соединение keep-alive, пока оно не будет закрыто сервером ClickHouse.

**Пример**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```
## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server}

Максимальная скорость локальных чтений в байтах в секунду.

:::note
Значение `0` означает неограниченное.
:::
## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server}

Максимальная скорость локальных записей в байтах в секунду.

:::note
Значение `0` означает неограниченное.
:::
## max_materialized_views_count_for_table {#max_materialized_views_count_for_table}

Ограничение на количество материализованных представлений, связанных с таблицей.

:::note
При этом учитываются только напрямую зависимые представления, и создание одного представления на основе другого не учитывается.
:::
## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server}

Максимальная скорость чтения всех слияний на сервере в байтах в секунду. Ноль означает неограниченное.
## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server}

Максимальная скорость чтения всех мутаций на сервере в байтах в секунду. Ноль означает неограниченное.
## max_open_files {#max_open_files}

Максимальное количество открытых файлов.

:::note
Мы рекомендуем использовать эту настройку в macOS, так как функция `getrlimit()` возвращает некорректное значение.
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

Это ограничение не касается операции удаления таблиц и обрезки таблиц; см. [max_table_size_to_drop](/operations/settings/settings#max_table_size_to_drop).
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

Если количество **безделичных** потоков в пуле потоков десериализации префиксов превышает `max_prefixes_deserialization_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые бездельничающими потоками, и уменьшит размер пула. Потоки могут быть созданы снова, если это потребуется.
## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size}

ClickHouse использует потоки из пула потоков десериализации префиксов для параллельного чтения метаданных колонок и подколонок из префиксов файлов в широких частях в MergeTree. `max_prefixes_deserialization_thread_pool_size` ограничивает максимальное количество потоков в пуле.
## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server}

Максимальная скорость обмена данными по сети в байтах в секунду для чтения.

:::note
Значение `0` (по умолчанию) означает неограниченное.
:::
## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server}

Максимальная скорость обмена данными по сети в байтах в секунду для записи.

:::note
Значение `0` (по умолчанию) означает неограниченное.
:::
## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server}

Максимальная скорость обмена данными по сети в байтах в секунду для реплицированных выборок. Ноль означает неограниченное.
## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server}

Максимальная скорость обмена данными по сети в байтах в секунду для реплицированных отправок. Ноль означает неограниченное.
## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw}

Если количество реплицированных таблиц превышает это значение, сервер выдаст исключение.

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

Максимальное количество памяти, которое разрешено использовать серверу, выраженное в байтах.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается установкой `max_server_memory_usage_to_ram_ratio`.
:::

В качестве особого случая, значение `0` (по умолчанию) означает, что сервер может использовать всю доступную память (исключая дальнейшие ограничения, наложенные `max_server_memory_usage_to_ram_ratio`).
## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio}

Максимальное количество памяти, которое разрешено использовать серверу, выраженное в отношении к всей доступной памяти.

Например, значение `0.9` (по умолчанию) означает, что сервер может использовать 90% доступной памяти.

Позволяет снизить использование памяти на системах с низким объемом памяти.
На хостах с малой оперативной памятью и подкачкой вы, возможно, захотите установить значение [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) больше 1.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается установкой `max_server_memory_usage`.
:::
## max_session_timeout {#max_session_timeout}

Максимальное время ожидания сессии в секундах.

Пример:

```xml
<max_session_timeout>3600</max_session_timeout>
```
## max_table_num_to_throw {#max_table_num_to_throw}

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

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает `max_table_size_to_drop` (в байтах), вы не можете удалить ее с помощью запроса [`DROP`](../../sql-reference/statements/drop.md) или [`TRUNCATE`](../../sql-reference/statements/truncate.md) запрос.

:::note
Значение `0` означает, что вы можете удалять все таблицы без каких-либо ограничений.

Эта настройка не требует перезапуска сервера ClickHouse для применения. Другим способом отключить ограничение является создание файла `<clickhouse-path>/flags/force_drop_table`.
:::

**Пример**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```
## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size}

Максимальное количество хранилища, которое может быть использовано для внешней агрегации, соединений или сортировки. Запросы, превышающие этот лимит, завершатся с исключением.

:::note
Значение `0` означает неограниченное.
:::

См. также:
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)
## max_thread_pool_free_size {#max_thread_pool_free_size}

Если количество **безделичных** потоков в Глобальном пуле потоков больше чем [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size), то ClickHouse освобождает ресурсы, занимаемые некоторыми потоками, и размер пула уменьшается. Потоки могут быть созданы снова, если это потребуется.

**Пример**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```
## max_thread_pool_size {#max_thread_pool_size}

ClickHouse использует потоки из Глобального пула потоков для обработки запросов. Если нет бездельного потока для обработки запроса, то в пуле создается новый поток. `max_thread_pool_size` ограничивает максимальное количество потоков в пуле.

**Пример**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```
## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size}

Количество потоков для загрузки неактивного набора частей данных (неожиданных) при запуске.
## max_view_num_to_throw {#max_view_num_to_throw}

Если количество представлений превышает это значение, сервер выдаст исключение.

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

Ограничение на общее количество одновременно ожидающих запросов. Выполнение ожидающего запроса блокируется, пока требуемые таблицы загружаются асинхронно (см. [`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases)).

:::note
Ожидающие запросы не учитываются, когда проверяются ограничения, контролируемые следующими настройками:

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

Эта корректировка выполняется, чтобы избежать превышения этих лимитов сразу после запуска сервера.
:::

:::note
Значение `0` (по умолчанию) означает неограниченное.

Эту настройку можно изменить во время работы, и изменения вступят в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::
## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker}

Должен ли фоновый рабочий процесс памяти корректировать внутренний трекер памяти на основе информации из внешних источников, таких как jemalloc и cgroups
## memory_worker_period_ms {#memory_worker_period_ms}

Период тика фонового рабочего процесса памяти, который корректирует использование памяти трекера памяти и очищает неиспользуемые страницы при высокой загрузке памяти. Если установлено значение 0, будет использоваться значение по умолчанию, зависящее от источника использования памяти.
## memory_worker_use_cgroup {#memory_worker_use_cgroup}

Используйте информацию о текущем использовании памяти cgroup для корректировки отслеживания памяти.
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
- [Планирование нагрузки](/operations/workload-scheduling.md)
## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit}

Устанавливает ограничение на то, сколько RAM разрешается использовать для выполнения операций слияния и мутации. Если ClickHouse достигает установленного лимита, он не будет планировать новые фоновые операции слияния или мутации, но продолжит выполнять уже запланированные задачи.

:::note
Значение `0` означает неограниченное.
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

Чтобы отключить настройку `metric_log`, вам следует создать следующий файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## mlock_executable {#mlock_executable}

Выполнять `mlockall` после запуска для снижения задержки первых запросов и предотвращения выгрузки исполняемого файла clickhouse при высокой нагрузке ввода-вывода.

:::note
Рекомендуется включить эту опцию, но это приведет к увеличению времени загрузки до нескольких секунд. Имейте в виду, что эта настройка не будет работать без возможности "CAP_IPC_LOCK".
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```
## mmap_cache_size {#mmap_cache_size}

Устанавливает размер кэша (в байтах) для картированных файлов. Эта настройка позволяет избежать частых вызовов открытия/закрытия (которые очень дорогостоящие из-за последующих ошибок с страницами) и повторно использовать отображения из нескольких потоков и запросов. Значение настройки является количеством картированных регионов (обычно равным количеству картированных файлов).

Объем данных в картированных файлах можно отслеживать в следующих системных таблицах с соответствующими метриками:

| Системная таблица                                                                                                                                                                                                                                                                                                                                                       | Метрика                                                                                                   |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [`system.metrics`](/operations/system-tables/metrics) и [`system.metric_log`](/operations/system-tables/metric_log)                                                                                                                                                                                                                              | `MMappedFiles` и `MMappedFileBytes`                                                                    |
| [`system.asynchronous_metrics_log`](/operations/system-tables/asynchronous_metric_log)                                                                                                                                                                                                                                                                     | `MMapCacheCells`                                                                                         |
| [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)  | `CreatedReadBufferMMap`, `CreatedReadBufferMMapFailed`, `MMappedFileCacheHits`, `MMappedFileCacheMisses` |

:::note
Объем данных в картированных файлах не потребляет память напрямую и не учитывается в использовании памяти запроса или сервера, поскольку эта память может быть выброшена аналогично кэшу страниц ОС. Кэш автоматически сбрасывается (файлы закрываются) при удалении старых частей в таблицах семейства MergeTree; также его можно сбросить вручную с помощью запроса `SYSTEM DROP MMAP CACHE`.

Эту настройку можно изменить во время работы, и она вступит в силу немедленно.
:::
## mutation_workload {#mutation_workload}

Используется для регулирования того, как ресурсы используются и делятся между мутациями и другими рабочими нагрузками. Указанное значение используется как значение настройки `workload` для всех фоновых мутаций. Может быть переопределено настройкой дерева слияния.

**См. также**
- [Планирование нагрузки](/operations/workload-scheduling.md)
## mysql_port {#mysql_port}

Порт для связи с клиентами через протокол MySQL.

:::note
- Положительные целые числа указывают номер порта для прослушивания.
- Пустые значения используются для отключения связи с клиентами через протокол MySQL.
:::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```
## openSSL {#openssl}

Конфигурация клиента/сервера SSL.

Поддержка SSL обеспечивается библиотекой `libpoco`. Доступные параметры конфигурации описаны в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи для настроек сервера/клиента:

| Опция                        | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Значение по умолчанию                      |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`              | Путь к файлу с закрытым ключом PEM сертификата. Файл может одновременно содержать и ключ, и сертификат.                                                                                                                                                                                                                                                                                                                                              |                                            |
| `certificateFile`             | Путь к файлу сертификата клиента/сервера в формате PEM. Можно опустить, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                                                |                                            |
| `caConfig`                    | Путь к файлу или директории, содержащей доверенные CA сертификаты. Если это файл, он должен быть в формате PEM и может содержать несколько CA сертификатов. Если это директория, она должна содержать один .pem файл для каждого CA сертификата. Имена файлов ищутся по значению хеш-значения имени субъекта CA. Подробности можно найти в мануале к [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                            |
| `verificationMode`            | Метод проверки сертификатов узла. Подробности находятся в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                         | `relaxed`                                  |
| `verificationDepth`           | Максимальная длина цепочки проверки. Проверка завершится неуспешно, если длина цепочки сертификатов превышает установленное значение.                                                                                                                                                                                                                                                                                                                                            | `9`                                        |
| `loadDefaultCAFile`           | Использовать ли встроенные CA сертификаты для OpenSSL. ClickHouse предполагает, что встроенные CA сертификаты находятся в файле `/etc/ssl/cert.pem` (или в директории `/etc/ssl/certs`) или в файле (или директории), указанном переменной окружения `SSL_CERT_FILE` (или `SSL_CERT_DIR`).                                                                                                                                                                        | `true`                                     |
| `cipherList`                  | Поддерживаемые шифры OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | Включает или отключает кэширование сессий. Должен использоваться в сочетании с `sessionIdContext`. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                         | `false`                                    |
| `sessionIdContext`            | Уникальный набор случайных символов, который сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Этот параметр всегда рекомендуется, так как он помогает избежать проблем как если сервер кэширует сессию, так и если клиент запрашивает кэширование.                                                                                                                                                        | `$\{application.name\}`                      |
| `sessionCacheSize`            | Максимальное количество сессий, которые сервер кэширует. Значение `0` означает неограниченное количество сессий.                                                                                                                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | Время кэширования сессии на сервере в часах.                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                        |
| `extendedVerification`        | Если включено, проверяет, соответствует ли CN или SAN сертификата хостнейму пиринга.                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `requireTLSv1`                | Требовать соединение TLSv1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `requireTLSv1_1`              | Требовать соединение TLSv1.1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `requireTLSv1_2`              | Требовать соединение TLSv1.2. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `fips`                        | Активировать режим FIPS OpenSSL. Поддерживается, если версия OpenSSL библиотеки поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                    |
| `privateKeyPassphraseHandler` | Класс (подкласс PrivateKeyPassphraseHandler), который запрашивает пароль для доступа к закрытому ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | Класс (подкласс CertificateHandler) для проверки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` .                                                                                                                                                                                                                                                                           | `RejectCertificateHandler`                 |
| `disableProtocols`            | Протоколы, которые не разрешено использовать.                                                                                                                                                                                                                                                                                                                                                                                                                             |                                            |
| `preferServerCiphers`         | Шифры сервера, предпочтительные для клиента.                                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                    |

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
        <!-- Используйте для самоподписанного: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- Используйте для самоподписанного: <name>AcceptCertificateHandler</name> -->
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

Размер файловых кусочков для хранения в кэше страниц пользовательского пространства, в байтах. Все чтения, которые проходят через кэш, будут округлены до кратного этому размеру.
## page_cache_free_memory_ratio {#page_cache_free_memory_ratio}

Доля лимита памяти, которая должна быть свободна в кэше страниц пользовательского пространства. Аналогично настройке min_free_kbytes в Linux.
## page_cache_history_window_ms {#page_cache_history_window_ms}

Задержка перед тем, как освобожденная память может быть использована кэшем страниц пользовательского пространства.
## page_cache_lookahead_blocks {#page_cache_lookahead_blocks}

При промахе кэша пользовательского пространства, прочитать до этого количества последовательных блоков за раз из основного хранилища, если они также не находятся в кэше. Каждый блок составляет page_cache_block_size байт.
## page_cache_max_size {#page_cache_max_size}

Максимальный размер кэша страниц пользовательского пространства. Установите в 0, чтобы отключить кэш. Если больше, чем page_cache_min_size, размер кэша будет непрерывно регулироваться в этом диапазоне, чтобы использовать большую часть доступной памяти, сохраняя при этом общее использование памяти ниже предела (max_server_memory_usage[_to_ram_ratio]).
## page_cache_min_size {#page_cache_min_size}

Минимальный размер кэша страниц пользовательского пространства.
## page_cache_policy {#page_cache_policy}

Имя политики кэша страниц пользовательского пространства.
## page_cache_shards {#page_cache_shards}

Распределите кэш страниц пользовательского пространства по этому количеству шардов, чтобы уменьшить конкуренцию за мютексы. Экспериментально, маловероятно, что это улучшит производительность.
## page_cache_size_ratio {#page_cache_size_ratio}

Размер защищенной очереди в кэше страниц пользовательского пространства относительно общего размера кэша.
## part_log {#part_log}

Логирование событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Например, добавление или слияние данных. Вы можете использовать журнал для имитации алгоритмов слияния и сравнения их характеристик. Вы можете визуализировать процесс слияния.

Запросы записываются в таблицу [system.part_log](/operations/system-tables/part_log), а не в отдельный файл. Вы можете настроить имя этой таблицы с помощью параметра `table` (см. ниже).

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

Добавляет равномерно распределенное значение от 0 до x секунд к kill_delay_period, чтобы избежать эффекта грома и последующего DoS ZooKeeper в случае очень большого количества таблиц. Доступно только в ClickHouse Cloud.
## parts_killer_pool_size {#parts_killer_pool_size}

Потоки для очистки устаревших потоков общего дерева слияния. Доступно только в ClickHouse Cloud.
## path {#path}

Путь к директории, содержащей данные.

:::note
Указывающий слэш обязателен.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```
## postgresql_port {#postgresql_port}

Порт для связи с клиентами через протокол PostgreSQL.

:::note
- Положительные целые числа указывают номер порта, на который следует слушать
- Пустые значения используются для отключения связи с клиентами по протоколу MySQL.
:::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```
## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size}

Размер фонового пула для предвыборок для удаленных объектных хранилищ.
## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size}

Количество задач, которые можно отправить в пул предвыборок.
## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size}

Максимальное количество задач, которые могут быть запланированы в пуле потоков десериализации префиксов.

:::note
Значение `0` означает неограниченное количество.
:::
## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup}

Если true, ClickHouse создает все сконфигурированные таблицы `system.*_log` перед запуском. Это может быть полезно, если некоторые скрипты запуска зависят от этих таблиц.
## primary_index_cache_policy {#primary_index_cache_policy}

Имя политики кэша первичного индекса.
## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio}

Отношение общего размера кэша меток, которое необходимо заполнить во время предварительного подогрева.
## primary_index_cache_size {#primary_index_cache_size}

Максимальный размер кэша для первичного индекса (индекс таблиц семейства MergeTree).
## primary_index_cache_size_ratio {#primary_index_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше первичного индекса относительно общего размера кэша.
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

Экспонирование метрик для сбора с [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP конечная точка для сбора метрик сервером prometheus. Начинается с '/'.
- `port` – Порт для `endpoint`.
- `metrics` – Экспонировать метрики из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Экспонировать метрики из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Экспонировать текущие значения метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).
- `errors` - Экспонировать количество ошибок по кодам ошибок, произошедших с момента последней перезагрузки сервера. Эта информация также может быть получена из [system.errors](/operations/system-tables/errors).

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

Проверьте (замените `127.0.0.1` на IP адрес или имя хоста вашего сервера ClickHouse):
```bash
curl 127.0.0.1:9363/metrics
```
## proxy {#proxy}

Определите прокси-серверы для HTTP и HTTPS запросов, в настоящее время поддерживается S3 хранилищами, таблицами S3 и URL функциями.

Существует три способа определения прокси-серверов:
- переменные окружения
- списки прокси
- удаленные разрешители прокси.

Также поддерживается обход прокси-серверов для определенных хостов с помощью `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют вам указать прокси-сервер для данного протокола. Если у вас это настроено в системе, это должно работать без сбоев.

Это самый простой подход, если для данного протокола есть только один прокси-сервер и этот прокси-сервер не меняется.

**Списки прокси**

Этот подход позволяет вам указать один или несколько прокси-серверов для протокола. Если определяется более одного прокси-сервера, ClickHouse использует различные прокси в режиме round-robin, распределяя нагрузку по серверам. Это самый простой подход, если существует более одного прокси-сервера для протокола и список прокси-серверов не меняется.

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

| Поле     | Описание                          |
|-----------|-------------------------------------|
| `<http>`  | Список одного или более HTTP прокси  |
| `<https>` | Список одного или более HTTPS прокси |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">


| Поле   | Описание          |
|---------|----------------------|
| `<uri>` | URI прокси |

  </TabItem>
</Tabs>

**Удаленные разрешители прокси**

Возможно, прокси-серверы меняются динамически. В этом случае вы можете определить конечную точку разрешителя. ClickHouse отправляет пустой GET запрос по этой конечной точке, удаленный разрешитель должен вернуть хост прокси. ClickHouse будет использовать его для формирования URI прокси, используя следующий шаблон: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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
|----------|----------------------------------|
| `<http>` | Список одного или более разрешителей* |
| `<https>` | Список одного или более разрешителей* |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">

| Поле       | Описание                                   |
|-------------|-----------------------------------------------|
| `<resolver>` | Конечная точка и другие детали для разрешителя |

:::note
Вы можете иметь несколько элементов `<resolver>`, но только первый
`<resolver>` для данного протокола будет использоваться. Все остальные элементы `<resolver>`
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
| `<proxy_cache_time>` | Время в секундах, в течение которого значения от разрешителя должны кэшироваться ClickHouse. Установка этого значения в `0` вызывает повторный запрос к разрешителю для каждого HTTP или HTTPS запроса. |

  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:

| Порядок | Настройка                |
|-------|------------------------|
| 1.    | Удаленные разрешители прокси |
| 2.    | Списки прокси            |
| 3.    | Переменные окружения  |

ClickHouse проверит тип разрешителя с наивысшим приоритетом для протокола запроса. Если он не определен,
он проверит следующий тип разрешителя с наивысшим приоритетом, пока не дойдет до разрешителя окружения.
Это также позволяет использовать сочетание типов разрешителей.
## query_cache {#query_cache}

Конфигурация [Кэша запросов](../query-cache.md).

Доступные настройки:

| Настройка                   | Описание                                                                            | Значение по умолчанию |
|---------------------------|----------------------------------------------------------------------------------------|---------------|
| `max_size_in_bytes`       | Максимальный размер кэша в байтах. `0` означает, что кэш запросов отключен.                | `1073741824`  |
| `max_entries`             | Максимальное количество результатов запросов `SELECT`, хранящихся в кэше.                      | `1024`        |
| `max_entry_size_in_bytes` | Максимальный размер в байтах, который могут иметь результаты запросов `SELECT`, чтобы быть сохраненными в кэше.    | `1048576`     |
| `max_entry_size_in_rows`  | Максимальное количество строк, которые результаты запросов `SELECT` могут иметь, чтобы быть сохраненными в кэше.   | `30000000`    |

:::note
- Измененные настройки вступают в силу немедленно.
- Данные для кэша запросов выделяются в DRAM. Если память ограничена, убедитесь, что установлено небольшое значение для `max_size_in_bytes` или полностью отключите кэш запросов.
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
Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::
## query_condition_cache_size_ratio {#query_condition_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше условий запроса относительно общего размера кэша.
## query_log {#query_log}

Настройка для логирования полученных запросов с помощью параметра [log_queries=1](../../operations/settings/settings.md).

Запросы записываются в таблицу [system.query_log](/operations/system-tables/query_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст ее. Если структура журнала запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет автоматически создана.

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

Правила на основе регулярных выражений, которые будут применяться к запросам, а также ко всем сообщениям журналов перед сохранением их в журналах сервера, 
[`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) таблицах и в журналах, отправленных клиенту. Это позволяет предотвратить
утечку конфиденциальных данных из SQL-запросов, таких как имена, электронные адреса, личные идентификаторы или номера кредитных карт в журналы.

**Пример**

```xml
<query_masking_rules>
    <rule>
        <name>hidden SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**Поля конфигурации**:

| Настройка   | Описание                                                                   |
|-------------|---------------------------------------------------------------------------|
| `name`      | имя правила (необязательно)                                              |
| `regexp`    | Регулярное выражение совместимо с RE2 (обязательно)                     |
| `replace`   | строка замены для конфиденциальных данных (необязательно, по умолчанию - шесть звездочек) |

Правила маскировки применяются ко всему запросу (чтобы предотвратить утечки конфиденциальных данных из неправильно сформированных / неразбираемых запросов).

Таблица [`system.events`](/operations/system-tables/events) имеет счетчик `QueryMaskingRulesMatch`, который содержит общее количество совпадений правил маскировки запросов.

Для распределенных запросов каждый сервер должен быть настроен отдельно, в противном случае подзапросы, переданные другим узлам, будут сохранены без маскировки.

## query_metric_log {#query_metric_log}

По умолчанию отключено.

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

Настройка для ведения журналов потоков запросов, полученных с помощью настройки [log_query_threads=1](/operations/settings/settings#log_query_threads).

Запросы регистрируются в таблице [system.query_thread_log](/operations/system-tables/query_thread_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала потоков запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет создана автоматически.

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

Настройка для ведения журналов представлений (живых, материализованных и т.д.), зависимых от запросов, полученных с помощью настройки [log_query_views=1](/operations/settings/settings#log_query_views).

Запросы регистрируются в таблице [system.query_views_log](/operations/system-tables/query_views_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала представлений запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет создана автоматически.

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

Конфигурация кластеров, используемых движком таблиц [Distributed](../../engines/table-engines/special/distributed.md) и табличной функции `cluster`.

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

Список хостов, которые разрешены для использования в движках хранения и табличных функциях, связанных с URL.

При добавлении хоста с помощью тега xml `\<host\>`:
- он должен быть указан точно, как в URL, так как имя проверяется перед разрешением DNS. Например: `<host>clickhouse.com</host>`
- если порт явно указан в URL, тогда хост:порт проверяется целиком. Например: `<host>clickhouse.com:80</host>`
- если хост указан без порта, тогда разрешен любой порт этого хоста. Например: если указан `<host>clickhouse.com</host>`, тогда допускаются `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т.д.
- если хост указан как IP-адрес, он проверяется так, как указано в URL. Например: `[2a02:6b8:a::a]`.
- если есть перенаправления и поддержка перенаправлений включена, тогда каждое перенаправление (поле location) проверяется.

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## replica_group_name {#replica_group_name}

Имя группы реплик для базы данных Replicated.

Кластер, созданный с помощью Replicated базы данных, будет состоять из реплик в одной группе.
DDL-запросы будут ждать только реплик в одной группе.

По умолчанию пусто.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout}

Тайм-аут подключения HTTP для запросов на получение частей. Унаследован от профиля по умолчанию `http_connection_timeout`, если не установлен явно.
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout}

Тайм-аут получения HTTP для запросов на получение частей. Унаследован от профиля по умолчанию `http_receive_timeout`, если не установлен явно.
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout}

Тайм-аут отправки HTTP для запросов на получение частей. Унаследован от профиля по умолчанию `http_send_timeout`, если не установлен явно.
## replicated_merge_tree {#replicated_merge_tree}

Тонкая настройка для таблиц в [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Эта настройка имеет более высокий приоритет.

Для получения дополнительной информации см. заголовочный файл MergeTreeSettings.h.

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

Настройки для отправки отчетов об ошибках команде разработчиков ClickHouse через [Sentry](https://sentry.io).

Включение этой функции, особенно в предвыпускных средах, очень приветствуется.

Серверу потребуется доступ к публичному интернету через IPv4 (на момент написания IPv6 не поддерживается Sentry) для корректной работы этой функции.

Ключи:

| Ключ                   | Описание                                                                                                                                                                                            |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | Логический флаг для включения функции, по умолчанию `false`. Установите в `true`, чтобы разрешить отправку отчетов об ошибках.                                                                 |
| `send_logical_errors` | `LOGICAL_ERROR` похож на `assert`, это ошибка в ClickHouse. Этот логический флаг включает отправку этих исключений в Sentry (по умолчанию: `false`).                                                  |
| `endpoint`            | Вы можете переопределить URL-адрес точки Sentry для отправки отчетов об ошибках. Это может быть отдельная учетная запись Sentry или ваша хостинговая Sentry-инстанция. Используйте синтаксис [Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=native#configure-the-sdk). |
| `anonymize`           | Избегайте прикрепления имени хоста сервера к отчету об ошибке.                                                                                                                                   |
| `http_proxy`          | Настройте HTTP-прокси для отправки отчетов об ошибках.                                                                                                                                              |
| `debug`               | Устанавливает клиент Sentry в режим отладки.                                                                                                                                                        |
| `tmp_path`            | Путь в файловой системе для временного состояния отчета об ошибке.                                                                                                                                  |
| `environment`         | Произвольное имя окружения, в котором работает сервер ClickHouse. Оно будет упоминаться в каждом отчете об ошибке. Значение по умолчанию - `test` или `prod` в зависимости от версии ClickHouse. |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## series_keeper_path {#series_keeper_path}


Путь в Keeper с автоинкрементными номерами, сгенерированными функцией `generateSerialID`. Каждая серия будет узлом под этим путем.
## show_addresses_in_stack_traces {#show_addresses_in_stack_traces}

Если установлено в true, будут показаны адреса в трассировках стека.
## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores}

Если установлено в true, ClickHouse будет ждать завершения запущенных резервных копий и восстановлений перед завершением работы.
## shutdown_wait_unfinished {#shutdown_wait_unfinished}

Задержка в секундах для ожидания незавершенных запросов.
## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries}

Если установлено в true, ClickHouse будет ждать завершения выполняющихся запросов перед завершением работы.
## ssh_server {#ssh_server}

Публичная часть ключа хоста будет записана в файл known_hosts
на стороне клиента SSH при первом подключении.

Настройки ключа хоста по умолчанию неактивны.
Распкомментируйте настройки ключа хоста и укажите путь к соответствующему SSH-ключу для их активации:

Пример:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## storage_configuration {#storage_configuration}

Позволяет многодисковую конфигурацию хранилища.

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

Подтеги выше определяют следующие настройки для `disks`:

| Настройка                 | Описание                                                                                           |
|---------------------------|-----------------------------------------------------------------------------------------------------|
| `<disk_name_N>`           | Имя диска, которое должно быть уникальным.                                                         |
| `path`                    | Путь, по которому будут храниться серверные данные (каталоги `data` и `shadow`). Должен заканчиваться на `/` |
| `keep_free_space_bytes`   | Размер зарезервированного свободного пространства на диске.                                         |

:::note
Порядок дисков не имеет значения.
:::
### Конфигурация политик {#configuration-of-policies}

Подтеги выше определяют следующие настройки для `policies`:

| Настройка                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`                | Название политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`                | Название тома. Имена томов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `disk`                         | Диск, расположенный внутри тома.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes`     | Максимальный размер куска данных, который может находиться на любом из дисков в этом томе. Если слияние приводит к размеру куска, ожидаемому большим, чем max_data_part_size_bytes, кусок будет записан в следующий том. Эта функция позволяет вам хранить новые / маленькие куски на горячем (SSD) томе и перемещать их на холодный (HDD) том, когда они достигают большого размера. Не используйте этот параметр, если политика имеет только один том.                                                                 |
| `move_factor`                  | Доля доступного свободного пространства на томе. Если место становится меньше, данные начнут переноситься на следующий том, если таковой имеется. Для переноса куски сортируются по размеру от большего к меньшему (по убыванию) и выбираются куски, общий размер которых достаточно для выполнения условия `move_factor`, если общего размера всех кусков недостаточно, все куски будут перемещены.                                                                                                        |
| `perform_ttl_move_on_insert`   | Отключает перемещение данных с истекшим TTL при вставке. По умолчанию (если включено), если мы вставляем кусок данных, который уже истек в соответствии с правилом перемещения по жизни, он сразу перемещается в том / диск, указанный в правиле перемещения. Это может значительно замедлить вставку в том случае, если целевой том / диск медленный (например, S3). Если отключено, истекшая часть данных записывается в том по умолчанию, а затем сразу перемещается в том, указанный в правиле для истекшего TTL. |
| `load_balancing`               | Политика балансировки дисков: `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`            | Устанавливает тайм-аут (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - всегда обновлять, `-1` - никогда не обновлять, значение по умолчанию - `60000`). Обратите внимание, если диск используется только ClickHouse и не будет подлежать изменению размера файловой системы на лету, вы можете использовать значение `-1`. В остальных случаях это не рекомендуется, так как в конечном итоге приведет к неправильному распределению пространства.                                                                                                                   |
| `prefer_not_to_merge`          | Отключает слияние частей данных на этом томе. Примечание: это потенциально вредно и может вызвать замедление. Когда эта настройка включена (не делайте этого), слияние данных на этом томе запрещено (что плохо). Это позволяет контролировать, как ClickHouse взаимодействует с медленными дисками. Мы рекомендуем вообще не использовать это.                                                                                                                                                                       |
| `volume_priority`              | Определяет приоритет (порядок), в котором заполняются тома. Чем меньше значение, тем выше приоритет. Параметры должны быть натуральными числами и охватывать диапазон от 1 до N (N - максимальное значение параметра, указанное) без пропусков.                                                                                                                                                                                                                                                                |

Для `volume_priority`:
- Если все тома имеют этот параметр, они будут приоритезированы в указанном порядке.
- Если только _некоторые_ тома имеют этот параметр, тома, которые его не имеют, имеют наименьший приоритет. Те, которые его имеют, приоритезируются в соответствии с значением тега, приоритет остальных определяется порядком описания в файле конфигурации относительно друг друга.
- Если _ни один_ из томов не имеет этот параметр, их порядок определяется порядком описания в файле конфигурации.
- Приоритет томов может не быть одинаковым.

## storage_connections_soft_limit {#storage_connections_soft_limit}

Соединения, превышающие этот лимит, имеют значительно более короткий срок жизни. Лимит применяется к соединениям хранилищ.
## storage_connections_store_limit {#storage_connections_store_limit}

Соединения, превышающие этот лимит, сбрасываются после использования. Установите значение 0, чтобы отключить кэш соединений. Лимит применяется к соединениям хранилищ.
## storage_connections_warn_limit {#storage_connections_warn_limit}

Предупреждающие сообщения записываются в журналы, если количество используемых соединений превышает этот лимит. Лимит применяется к соединениям хранилищ.
## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key}

Запись файлов метаданных диска в формате VERSION_FULL_OBJECT_KEY.
## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid}

Если включено, внутренний UUID генерируется во время создания SharedSet и SharedJoin. Только для ClickHouse Cloud.
## table_engines_require_grant {#table_engines_require_grant}

Если установлено в true, пользователи требуют гранта для создания таблицы с конкретным движком, например, `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию, для обеспечения обратной совместимости создание таблицы с конкретным движком таблицы игнорирует грант, однако вы можете изменить это поведение, установив это значение в true.
:::
## tables_loader_background_pool_size {#tables_loader_background_pool_size}

Устанавливает количество потоков, выполняющих асинхронные задачи загрузки в фоновом пуле. Фоновый пул используется для загрузки таблиц асинхронно после старта сервера в случае, если нет ожидающих запросов к таблице. Может быть полезно сохранять небольшое количество потоков в фоновом пуле, если есть много таблиц. Это позволит зарезервировать ресурсы CPU для конкурентного выполнения запросов.

:::note
Значение `0` означает, что будут использоваться все доступные процессоры.
:::
## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size}

Устанавливает количество потоков, выполняющих задачи загрузки в фоновом пуле. Фоновый пул используется для загрузки таблицы синхронно до тех пор, пока сервер не начнет прослушивание порта, и для загрузки таблиц, которые ожидаются. Фоновый пул имеет более высокий приоритет, чем фоновый пул. Это означает, что никакая задача не начинается в фоновом пуле, пока в фоновом пуле выполняются задачи.

:::note
Значение `0` означает, что будут использоваться все доступные процессоры.
:::
## tcp_port {#tcp_port}

Порт для общения с клиентами по протоколу TCP.

**Пример**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure}

TCP порт для защищенной связи с клиентами. Используйте его с настройками [OpenSSL](#openssl).

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

С помощью этой опции временные данные будут храниться в кэше для конкретного диска.
В этом разделе вы должны указать имя диска с типом `cache`.
В этом случае кэш и временные данные будут делить одно и то же пространство, и кэш диска может быть освобожден для создания временных данных.

:::note
Может быть использована только одна опция для настройки хранения временных данных: `tmp_path` ,`tmp_policy`, `temporary_data_in_cache`.
:::

**Пример**

Как кэш для `local_disk`, так и временные данные будут храниться в `/tiny_local_cache` в файловой системе, управляемой `tiny_local_cache`.

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

Настройки для системной таблицы [text_log](/operations/system-tables/text_log) для ведения журнала текстовых сообщений.

<SystemLogParameters/>

Дополнительно:

| Настройка | Описание                                                                                                                                                                                                 | Значение по умолчанию |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------|
| `level`   | Максимальный уровень сообщений (по умолчанию `Trace`), которые будут храниться в таблице.                                                                                                                                 | `Trace`              |

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

Максимальное количество задач, которые могут быть запланированы в глобальном пуле потоков. Увеличение размера очереди приводит к большему использованию памяти. Рекомендуется поддерживать это значение равным [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size).

:::note
Значение `0` означает неограниченное количество.
:::

**Пример**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```
## threadpool_writer_pool_size {#threadpool_writer_pool_size}

Размер фонового пула для запросов записи в объектные хранилища.
## threadpool_writer_queue_size {#threadpool_writer_queue_size}

Количество задач, которые можно добавить в фоновый пул для запросов записи в объектные хранилища.
## throw_on_unknown_workload {#throw_on_unknown_workload}

Определяет поведение при доступе к неизвестной НАГРУЗКЕ с настройкой запроса 'workload'.

- Если `true`, исключение RESOURCE_ACCESS_DENIED выбрасывается из запроса, который пытается получить доступ к неизвестной нагрузке. Полезно для принудительного выполнения планирования ресурсов для всех запросов после установления иерархии НАГРУЗКИ, когда содержит НАГРУЗКУ по умолчанию.
- Если `false` (по умолчанию), неограниченный доступ без планирования ресурсов предоставляется запросу с настройкой 'workload', указывающей на неизвестную нагрузку. Это важно в процессе настройки иерархии НАГРУЗКИ, прежде чем добавляется НАГРУЗКА по умолчанию.

**Пример**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**См. также**
- [Планирование нагрузки](/operations/workload-scheduling.md)
## timezone {#timezone}

Часовой пояс сервера.

Указывается как идентификатор IANA для часового пояса UTC или географического местоположения (например, Africa/Abidjan).

Часовой пояс необходим для преобразований между строками и форматом DateTime, когда поля DateTime выводятся в текстовый формат (выводятся на экран или в файл) и при получении DateTime из строки. Кроме того, часовой пояс используется в функциях, работающих с временем и датой, если они не получили часовой пояс в параметрах ввода.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**Смотрите также**

- [session_timezone](../settings/settings.md#session_timezone)
## tmp_path {#tmp_path}

Путь в локальной файловой системе для хранения временных данных при обработке больших запросов.

:::note
- Может быть использована только одна опция для настройки временного хранения данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- Заключительная косая черта обязательна.
:::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## tmp_policy {#tmp_policy}

Политика хранения временных данных. Дополнительную информацию см. в документации по [движку таблиц MergeTree](/engines/table-engines/mergetree-family/mergetree).

:::note
- Для настройки хранения временных данных может использоваться только один параметр: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
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

Определяет список пользовательских доменов верхнего уровня, которые следует добавить, где каждая запись имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

См. также:
- функцию [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) и её вариации,
  которая принимает имя пользовательского списка TLD и возвращает часть домена, которая включает домены верхнего уровня вплоть до первого значимого поддомена.

## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size}

Собирать случайные распределения размером меньше или равным указанному значению с вероятностью, равной `total_memory_profiler_sample_probability`. 0 означает отключено. Вы можете установить 'max_untracked_memory' в 0, чтобы этот порог работал как ожидалось.

## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size}

Собирать случайные распределения размером больше или равным указанному значению с вероятностью, равной `total_memory_profiler_sample_probability`. 0 означает отключено. Вы можете установить 'max_untracked_memory' в 0, чтобы этот порог работал как ожидалось.

## total_memory_profiler_step {#total_memory_profiler_step}

Каждый раз, когда использование памяти сервера превышает каждый следующий шаг в байтах, профайлер памяти соберет трассировку стека распределений. Ноль означает отключенный профайлер памяти. Значения меньше нескольких мегабайт замедляют работу сервера.

## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability}

Позволяет собирать случайные распределения и де-распределения и записывать их в системную таблицу [system.trace_log](../../operations/system-tables/trace_log.md) с `trace_type`, равным `MemorySample`, с указанной вероятностью. Вероятность применяется для каждого распределения или де-распределения, независимо от размера распределения. Обратите внимание, что выборка происходит только тогда, когда количество неотслеживаемой памяти превышает лимит неотслеживаемой памяти (значение по умолчанию — `4` MiB). Его можно уменьшить, если [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step) уменьшен. Вы можете установить `total_memory_profiler_step` равным `1` для более детализированной выборки.

Возможные значения:

- Положительное целое число.
- `0` — Запись случайных распределений и де-распределений в системную таблицу `system.trace_log` отключена.

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

Имя политики кэширования для несжатых данных.

## uncompressed_cache_size {#uncompressed_cache_size}

Максимальный размер (в байтах) для несжатых данных, используемых движками таблиц из семейства MergeTree.

Существует один общий кэш для сервера. Память выделяется по мере необходимости. Кэш используется, если опция `use_uncompressed_cache` включена.

Несжатый кэш является выгодным для очень коротких запросов в индивидуальных случаях.

:::note
Значение `0` означает отключение.

Эта настройка может быть изменена во время выполнения и вступит в силу немедленно.
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

Метод хранения заголовков частей данных в ZooKeeper. Эта настройка применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Она может быть указана:

**Глобально в разделе [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует настройку для всех таблиц на сервере. Вы можете менять эту настройку в любое время. Существующие таблицы меняют своё поведение, когда настройка изменяется.

**Для каждой таблицы**

При создании таблицы укажите соответствующую [настройку движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этой настройкой не изменится, даже если глобальная настройка изменится.

**Возможные значения**

- `0` — Функциональность отключена.
- `1` — Функциональность включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицированные](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки частей данных компактно, используя один `znode`. Если таблица содержит много колонок, этот метод хранения значительно уменьшает объем данных, хранящихся в ZooKeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` вы не сможете понизить версию сервера ClickHouse до версии, которая не поддерживает эту настройку. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все серверы одновременно. Безопаснее тестировать новые версии ClickHouse в тестовой среде или всего на нескольких серверах кластера.

Заголовки частей данных, которые уже хранятся с этой настройкой, не могут быть восстановлены к предыдущему (не компактному) представлению.
:::

## user_defined_executable_functions_config {#user_defined_executable_functions_config}

Путь к файлу конфигурации для исполняемых пользовательских функций.

Путь:

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать подстановочные символы \* и ?.

См. также:
- "[Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions).".

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```

## user_defined_path {#user_defined_path}

Каталог с пользовательскими определенными файлами. Используется для SQL пользовательских функций [SQL User Defined Functions](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```

## user_directories {#user_directories}

Раздел файла конфигурации, который содержит настройки:
- Путь к файлу конфигурации с предопределенными пользователями.
- Путь к папке, где хранятся пользователи, созданные SQL-командами.
- Путь к узлу ZooKeeper, где хранятся и реплицируются пользователи, созданные SQL-командами (экспериментально).

Если этот раздел указан, путь из [users_config](/operations/server-configuration-parameters/settings#users_config) и [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) не будет использоваться.

Раздел `user_directories` может содержать любое количество элементов, порядок элементов означает их преемственность (чем выше элемент, тем выше его приоритет).

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

Вы также можете определить секции `memory` — означает хранение информации только в памяти, без записи на диск, и `ldap` — означает хранение информации на LDAP-сервере.

Чтобы добавить LDAP-сервер в качестве удаленного каталога пользователей, которые не определены локально, определите единую секцию `ldap` с следующими настройками:

| Параметр  | Описание                                                                                                                                                                                                                                   |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server`  | одно из имен LDAP-серверов, определенных в разделе конфигурации `ldap_servers`. Этот параметр является обязательным и не может быть пустым.                                                                                               |
| `roles`   | секция со списком локально определенных ролей, которые будут назначены каждому пользователю, полученному с LDAP-сервера. Если роли не указаны, пользователь не сможет выполнять какие-либо действия после аутентификации. Если любая из указанных ролей не определена локально во время аутентификации, попытка аутентификации завершится неудачей, как будто введенный пароль был неверным. |

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

Каталог с пользовательскими скриптами. Используется для исполняемых пользовательских функций [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).

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

Размер кэша для индекса векторного сходства в записях. Ноль означает отключение.

## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy}

Имя политики кэширования для индекса векторного сходства.

## vector_similarity_index_cache_size {#vector_similarity_index_cache_size}

Размер кэша для индексов векторного сходства. Ноль означает отключение.

:::note
Эта настройка может быть изменена во время выполнения и вступит в силу немедленно.
:::

## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше индекса векторного сходства относительно общего размера кэша.

## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup}

Эта настройка позволяет указать поведение, если `dictionaries_lazy_load` равно `false`.
(Если `dictionaries_lazy_load` равно `true`, то эта настройка не влияет на что-либо.)

Если `wait_dictionaries_load_at_startup` равно `false`, сервер
начнет загружать все словари при запуске, и он будет принимать соединения параллельно с этой загрузкой.
Когда словарь используется в запросе впервые, запрос будет ждать, пока словарь не будет загружен, если он еще не загружен.
Установка `wait_dictionaries_load_at_startup` в `false` может сделать ClickHouse быстрее, однако некоторые запросы могут выполняться медленнее
(потому что им придется ждать, пока некоторые словари будут загружены).

Если `wait_dictionaries_load_at_startup` равно `true`, сервер будет ждать при старте,
пока все словари не завершат свою загрузку (успешно или нет) перед тем, как принимать какие-либо соединения.

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

**См. также**
- [Иерархия рабочей нагрузки](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)

## workload_zookeeper_path {#workload_zookeeper_path}

Путь к узлу ZooKeeper, который используется в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для согласованности все SQL-определения хранятся как значение этого единственного znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**См. также**
- [Иерархия рабочей нагрузки](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)

## zookeeper {#zookeeper}

Содержит настройки, позволяющие ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицированных таблиц. Если реплицированные таблицы не используются, этот раздел параметров может быть опущен.

Следующие настройки могут быть настроены с помощью подметок:

| Параметр                                | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|-----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                  | Узел ZooKeeper. Вы можете установить несколько узлов. Например, `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` указывает порядок узла при попытке подключения к кластеру ZooKeeper.                                                                                                                                                                                                                                                                                       |
| `session_timeout_ms`                    | Максимальное время ожидания для клиентской сессии в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `operation_timeout_ms`                  | Максимальное время ожидания для одной операции в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `root` (необязательно)                  | Узел, который используется как корень для znodes, используемых сервером ClickHouse.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `fallback_session_lifetime.min` (необязательно) | Минимальный лимит для времени жизни сессии ZooKeeper к запасному узлу, когда основной недоступен (балансировка нагрузки). Устанавливается в секундах. Значение по умолчанию: 3 часа.                                                                                                                                                                                                                                                                                                                                 |
| `fallback_session_lifetime.max` (необязательно) | Максимальный лимит для времени жизни сессии ZooKeeper к запасному узлу, когда основной недоступен (балансировка нагрузки). Устанавливается в секундах. Значение по умолчанию: 6 часов.                                                                                                                                                                                                                                                                                                                             |
| `identity` (необязательно)             | Пользователь и пароль, требуемые ZooKeeper для доступа к запрашиваемым znodes.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `use_compression` (необязательно)      | Включает сжатие в протоколе Keeper, если установлено в true.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

Также существует настройка `zookeeper_load_balancing` (необязательно), которая позволяет выбрать алгоритм для выбора узла ZooKeeper:

| Название алгоритма                    | Описание                                                                                                                                                     |
|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `random`                              | случайным образом выбирает один из узлов ZooKeeper.                                                                                                       |
| `in_order`                            | выбирает первый узел ZooKeeper, если он недоступен, то второй, и так далее.                                                                              |
| `nearest_hostname`                   | выбирает узел ZooKeeper с именем хоста, наиболее похожим на имя хоста сервера, имя хоста сравнивается с префиксом имени.                                  |
| `hostname_levenshtein_distance`      | так же, как и nearest_hostname, но сравнивает имя хоста в манере расстояния Левенштейна.                                                                   |
| `first_or_random`                    | выбирает первый узел ZooKeeper, если он недоступен, то случайным образом выбирает один из оставшихся узлов ZooKeeper.                                     |
| `round_robin`                         | выбирает первый узел ZooKeeper, если происходит повторное подключение, выбирает следующий.                                                                |

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
    <!-- Необязательно. Сuffix Chroot. Должен существовать. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Необязательно. Строка доступа Digest ZooKeeper. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**См. также**

- [Репликация](../../engines/table-engines/mergetree-family/replication.md)
- [Руководство программиста ZooKeeper](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [Необязательно защищенная связь между ClickHouse и ZooKeeper](/operations/ssl-zookeeper)
