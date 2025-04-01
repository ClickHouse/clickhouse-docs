---
description: 'Этот раздел содержит описания параметров настройки сервера т.е. параметров, которые нельзя изменить на уровне сессии или запроса.'
keywords: ['глобальные параметры сервера']
sidebar_label: 'Параметры сервера'
sidebar_position: 57
slug: /operations/server-configuration-parameters/settings
title: 'Параметры сервера'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/docs/operations/server-configuration-parameters/_snippets/_system-log-parameters.md'

# Параметры сервера

Этот раздел содержит описания параметров настройки сервера. Эти параметры не могут быть изменены на уровне сессии или запроса.

Для получения дополнительной информации о файлах конфигурации в ClickHouse см. [""Файлы конфигурации""](/operations/configuration-files).

Другие параметры описаны в разделе ""[Параметры](/operations/settings/overview)"".
Перед изучением параметров мы рекомендуем ознакомиться с разделом [Файлы конфигурации](/operations/configuration-files) и отметить использование подстановок (атрибуты `incl` и `optional`).
## access_control_improvements {#access_control_improvements} 

Параметры для необязательных улучшений в системе контроля доступа.

| Параметр                                         | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | По умолчанию |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `users_without_row_policies_can_read_rows`      | Устанавливает, могут ли пользователи без разрешающих правил строк по-прежнему читать строки, используя запрос `SELECT`. Например, если есть два пользователя A и B, а правило строки задано только для A, то если этот параметр установлен в true, пользователь B увидит все строки. Если этот параметр установлен в false, пользователь B не увидит ни одной строки.                                                                                                                                                                                                                    | `true`  |
| `on_cluster_queries_require_cluster_grant`      | Устанавливает, требуют ли запросы `ON CLUSTER` разрешение `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `true`  |
| `select_from_system_db_requires_grant`          | Устанавливает, требует ли `SELECT * FROM system.<table>` каких-либо разрешений и может ли он быть выполнен любым пользователем. Если установить в true, то этот запрос требует `GRANT SELECT ON system.<table>`, так же как и для обычных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases`, и некоторые постоянные таблицы, такие как `one`, `contributors`) по-прежнему доступны для всех; и если есть привилегия `SHOW` (например, `SHOW USERS`), то соответствующая системная таблица (т.е. `system.users`) будет доступна. | `true`  |
| `select_from_information_schema_requires_grant` | Устанавливает, требует ли `SELECT * FROM information_schema.<table>` каких-либо разрешений и может ли он быть выполнен любым пользователем. Если установить в true, то этот запрос требует `GRANT SELECT ON information_schema.<table>`, так же как и для обычных таблиц.                                                                                                                                                                                                                                                                                 | `true`  |
| `settings_constraints_replace_previous`         | Устанавливает, будет ли ограничение в профиле параметров для некоторого параметра отменять действия предыдущего ограничения (определенного в других профилях) для этого параметра, включая поля, которые не устанавливаются новым ограничением. Это также включает тип ограничения `changeable_in_readonly`.                                                                                                                                                                                                                            | `true`  |
| `table_engines_require_grant`                   | Устанавливает, требуется ли разрешение для создания таблицы с определенным движком таблицы.                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false` |

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

|Тип|По умолчанию|
|---|---|
|`GroupArrayActionWhenLimitReached`|`throw`|

Действие, которое выполняется, когда превышен максимальный размер массива элементов в groupArray: `throw` исключение или `discard` лишние значения.
## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`16777215`|

Максимальный размер элемента массива в байтах для функции groupArray. Этот лимит проверяется при сериализации и помогает избежать большого размера состояния.
## allow_feature_tier {#allow_feature_tier} 

|Тип|По умолчанию|
|---|---|
|`UInt32`|`0`|


Контролирует, может ли пользователь изменять настройки, касающиеся различных уровней функциональности.

- `0` - Изменения любых настроек разрешены (экспериментальные, бета, производственные).
- `1` - Разрешены только изменения настроек бета и производственной функциональности. Изменения экспериментальных настроек отклоняются.
- `2` - Разрешены только изменения производственных настроек. Изменения экспериментальных или бета-настроек отклоняются.

Это эквивалентно установке ограничения readonly для всех функций `EXPERIMENTAL` / `BETA`.

:::note
Значение `0` означает, что все настройки могут быть изменены.
:::
## allow_implicit_no_password {#allow_implicit_no_password} 

Запрещает создание пользователя без пароля, если не указано 'IDENTIFIED WITH no_password'.

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

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|

Разрешает использование памяти jemalloc.
## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|

Если true, очередь асинхронных вставок очищается при корректном завершении работы.
## async_insert_threads {#async_insert_threads} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`16`|

Максимальное количество потоков, которое будет использоваться для парсинга и вставки данных в фоновом режиме. Ноль означает, что асинхронный режим отключен.
## async_load_databases {#async_load_databases} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Асинхронная загрузка баз данных и таблиц.

- Если `true`, все не системные базы данных с движком `Ordinary`, `Atomic` и `Replicated` будут загружаться асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, параметры сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к таблице, которая еще не загружена, будет ждать, пока именно эта таблица не будет запущена. Если задача загрузки завершится неудачно, запрос повторно выдаст ошибку (вместо того, чтобы завершить работу всего сервера в случае `async_load_databases = false`). Таблица, к которой ожидает доступа хотя бы один запрос, будет загружена с более высоким приоритетом. DDL-запросы на базу данных будут ждать, пока именно эта база данных не будет запущена. Также рассмотрите возможность установки предела `max_waiting_queries` для общего количества ожидающих запросов.
- Если `false`, все базы данных загружаются при запуске сервера.

**Пример**

```xml
<async_load_databases>true</async_load_databases>
```
## async_load_system_database {#async_load_system_database} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Асинхронная загрузка системных таблиц. Полезно, если в базе данных `system` имеется большое количество логов таблиц и частей. Независимо от настройки `async_load_databases`.

- Если установлен в `true`, все системные базы данных с движком `Ordinary`, `Atomic` и `Replicated` будут загружены асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, параметры сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к системной таблице, которая еще не загружена, будет ждать, пока именно эта таблица не будет запущена. Таблица, к которой ожидает доступа хотя бы один запрос, будет загружена с более высоким приоритетом. Также рассмотрите возможность установки настройки `max_waiting_queries`, чтобы ограничить общее количество ожидающих запросов.
- Если установлен в `false`, системная база данных загружается до старта сервера.

**Пример**

```xml
<async_load_system_database>true</async_load_system_database>
```
## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s} 

|Тип|По умолчанию|
|---|---|
|`UInt32`|`120`|

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

Включено по умолчанию в ClickHouse Cloud развертываниях.

Если параметр не включен по умолчанию в вашей среде, в зависимости от того, как был установлен ClickHouse, вы можете следовать приведенным ниже инструкциям, чтобы включить или отключить его.

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

Чтобы отключить параметр `asynchronous_metric_log`, вы должны создать следующий файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержимым:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|

Включает расчет тяжелых асинхронных метрик.
## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

|Тип|По умолчанию|
|---|---|
|`UInt32`|`1`|

Период в секундах для обновления асинхронных метрик.
## auth_use_forwarded_address {#auth_use_forwarded_address} 

Использовать исходящий адрес для аутентификации для клиентов, подключенных через прокси.

:::note
Этот параметр следует использовать с особой осторожностью, поскольку переадресованные адреса могут быть легко подделаны - сервера, принимающие такую аутентификацию, не должны быть доступны напрямую, а исключительно через доверенный прокси.
:::
## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`16`|

Максимальное количество потоков, которые будут использоваться для выполнения операций сброса для таблиц с [Buffer-engine](/engines/table-engines/special/buffer) в фоновом режиме.
## background_common_pool_size {#background_common_pool_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`8`|

Максимальное количество потоков, которые будут использоваться для выполнения различных операций (в основном сборка мусора) для таблиц с [*MergeTree-engine](/engines/table-engines/mergetree-family) в фоновом режиме.
## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`16`|

Максимальное количество потоков, которые будут использоваться для выполнения распределенных отправок.
## background_fetches_pool_size {#background_fetches_pool_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`16`|

Максимальное количество потоков, которые будут использоваться для получения частей данных из другой реплики для таблиц с [*MergeTree-engine](/engines/table-engines/mergetree-family) в фоновом режиме.
## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

|Тип|По умолчанию|
|---|---|
|`Float`|`2`|


Устанавливает соотношение между количеством потоков и количеством фоновых слияний и мутаций, которые могут выполняться одновременно.

Например, если соотношение равно 2 и [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) установлено на 16, ClickHouse может выполнять 32 фоновых слияния одновременно. Это возможно, потому что фоновые операции могут быть приостановлены и отложены. Это необходимо, чтобы дать малым слияниям больший приоритет выполнения.

:::note
Вы можете только увеличить это соотношение во время выполнения. Чтобы уменьшить его, необходимо перезапустить сервер.

Так же как и параметр [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) настройка [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) может применяться из профиля `default` для обратной совместимости.
:::
## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

|Тип|По умолчанию|
|---|---|
|`String`|`round_robin`|


Политика, которая определяет, как выполнять планирование фоновых слияний и мутаций. Возможные значения: `round_robin` и `shortest_task_first`.

Алгоритм, используемый для выбора следующего слияния или мутации, который будет выполняться пулом потоков в фоновом режиме. Политика может быть изменена в режиме выполнения без перезапуска сервера.
Может применяться из профиля `default` для обратной совместимости.

Возможные значения:

- `round_robin` — Каждое одновременно выполняемое слияние и мутация выполняются по принципу круговой очереди, чтобы обеспечить работу без голодания. Меньшие слияния завершаются быстрее, чем большие, просто потому, что у них меньше блоков для слияния.
- `shortest_task_first` — Всегда выполнять меньшие слияния или мутации. Слияния и мутации получают приоритеты на основе их конечного размера. Слияния с меньшими размерами строго предпочитаются перед большими. Эта политика обеспечивает максимально быстрое слияние малых частей, но может привести к бесконечному голоданию больших слияний в разделах, сильно нагруженных `INSERT`ами.
## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`16`|

Максимальное количество потоков, которые будут использоваться для выполнения фоновых операций для потоковой передачи сообщений.
## background_move_pool_size {#background_move_pool_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`8`|

Максимальное количество потоков, которые будут использоваться для перемещения частей данных на другой диск или том для таблиц с *MergeTree-engine в фоновом режиме.
## background_pool_size {#background_pool_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`16`|


Устанавливает количество потоков, работающих в фоновом режиме, выполняющих слияния и мутации для таблиц с движками MergeTree.

:::note
- Этот параметр также может применяться при старте сервера из конфигурации профиля `default` для обратной совместимости при старте сервера ClickHouse.
- Вы можете только увеличить количество потоков во время выполнения.
- Чтобы уменьшить количество потоков, необходимо перезапустить сервер.
- Настраивая этот параметр, вы управляете загрузкой CPU и диска.
:::

:::danger
Меньший размер пула использует меньше ресурсов CPU и диска, но фоновые процессы продвигаются медленнее, что в конечном итоге может повлиять на производительность запросов.
:::

Прежде чем изменять его, пожалуйста, также обратите внимание на связанные настройки MergeTree, такие как:
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).

**Пример**

```xml
<background_pool_size>16</background_pool_size>
```
## background_schedule_pool_size {#background_schedule_pool_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`512`|

Максимальное количество потоков, которые будут использоваться для постоянного выполнения некоторых легковесных периодических операций для реплицируемых таблиц, потоковой передачи Kafka и обновления кеша DNS.
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

|Тип|По умолчанию|
|---|---|
|`UInt64`|`16`|

Максимальное количество потоков для выполнения запросов `BACKUP`.
## backups {#backups} 

Настройки для резервных копий, используемых при записи `BACKUP TO File()`.

Следующие параметры могут быть настроены с помощью под-тегов:

| Параметр                             | Описание                                                                                                                                                                    | По умолчанию |
|-------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `allowed_path`                      | Путь к резервной копии, когда используется `File()`. Этот параметр необходимо установить, чтобы использовать `File`. Путь может быть относительным к директории экземпляра или абсолютным.              | `true`  |
| `remove_backup_files_after_failure` | Если команда `BACKUP` завершится неудачно, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до сбоя, в противном случае он оставит скопированные файлы как есть. | `true`  |

Этот параметр по умолчанию настроен так:

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Максимальное количество задач, которые могут быть запланированы в пуле потоков IO резервных копий. Рекомендуется оставить эту очередь неограниченной из-за текущей логики резервного копирования S3.

:::note
Значение `0` (по умолчанию) означает неограниченно.
:::
## bcrypt_workfactor {#bcrypt_workfactor} 

Коэффициент работы для типа аутентификации bcrypt_password, который использует [алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```
## blog_storage_log {#blog_storage_log} 

Настройки для системной таблицы [`blob_storage_log`](../system-tables/blob_storage_log.md).

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

Интервал в секундах перед загрузкой встроенных словарей.

ClickHouse перезагружает встроенные словари каждые x секунд. Это позволяет редактировать словари "на лету" без перезагрузки сервера.

**Пример**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```
## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio} 

|Тип|По умолчанию|
|---|---|
|`Double`|`0.5`|

Устанавливает максимальное соотношение размера кеша к ОЗУ. Позволяет уменьшать размер кеша на системах с низким объемом памяти.
## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

|Тип|По умолчанию|
|---|---|
|`Double`|`0`|

Для целей тестирования.
## cgroup_memory_watcher_hard_limit_ratio {#cgroup_memory_watcher_hard_limit_ratio} 

|Тип|По умолчанию|
|---|---|
|`Double`|`0.95`|


Указывает "жесткий" порог потребления памяти сервером согласно cgroups, после которого максимальное потребление памяти сервером корректируется до значения порога.

Смотрите настройки:
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio)
## cgroup_memory_watcher_soft_limit_ratio {#cgroup_memory_watcher_soft_limit_ratio} 

|Тип|По умолчанию|
|---|---|
|`Double`|`0.9`|


Указывает "мягкий" порог потребления памяти сервером согласно cgroups, после которого арены в jemalloc очищаются.

Смотрите настройки:
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)
## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`15`|


Интервал в секундах, в течение которого максимальное разрешенное потребление памяти сервера корректируется соответствующим порогом в cgroups.

Чтобы отключить наблюдатель cgroup, установите это значение в `0`.

Смотрите настройки:
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio).
## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10000`|

Устанавливает размер кеша (в элементах) для [содержательных выражений](../../operations/caches.md).
## compiled_expression_cache_size {#compiled_expression_cache_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`134217728`|

Устанавливает размер кеша (в байтах) для [содержательных выражений](../../operations/caches.md).
## compression {#compression} 

Настройки сжатия данных для таблиц с движком [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

:::note
Рекомендуется не изменять это, если вы только начали использовать ClickHouse.
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
- `method` – Метод сжатия. Приемлемые значения: `lz4`, `lz4hc`, `zstd`,`deflate_qpl`.
- `level` – Уровень сжатия. Смотрите [Кодеки](/sql-reference/statements/create/table#general-purpose-codecs).

:::note
Вы можете настроить несколько секций `<case>`.
:::

**Действия, когда условия выполнены**:

- Если часть данных соответствует заданному условию, ClickHouse использует указанный метод сжатия.
- Если часть данных соответствует нескольким наборам условий, ClickHouse использует первый совпадающий набор условий.

:::note
Если ни одно из условий не выполняется для части данных, ClickHouse использует сжатие `lz4`.
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

|Тип|По умолчанию|
|---|---|
|`String`|`round_robin`|


Политика, которая определяет, как выполнить планирование CPU-слотов, определенных `concurrent_threads_soft_limit_num` и `concurrent_threads_soft_limit_ratio_to_cores`. Алгоритм, используемый для регулирования того, как ограниченное количество слотов CPU распределяется между параллельными запросами. Планировщик может быть изменен во время выполнения без перезапуска сервера.

Возможные значения:

- `round_robin` — Каждый запрос с установкой `use_concurrency_control` = 1 выделяет до `max_threads` слотов CPU. Один слот на поток. При конфликте слоты CPU выделяются запросам по принципу круговой очереди. Обратите внимание, что первый слот выделяется без условий, что может привести к несправедливости и увеличению задержки запросов с высоким `max_threads` при наличии большого количества запросов с `max_threads` = 1.
- `fair_round_robin` — Каждый запрос с установкой `use_concurrency_control` = 1 выделяет до `max_threads - 1` слотов CPU. Вариация `round_robin`, которая не требует слот для первого потока каждого запроса. Таким образом, запросы с `max_threads` = 1 не требуют никаких слотов и не могут несправедливо выделять все слоты. Нет слотов, выделенных без условий.
## config_reload_interval_ms {#config_reload_interval_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`2000`|


Как часто ClickHouse будет перезагружать конфигурацию и проверять на наличие изменений.
## core_dump {#core_dump} 

Настраивает мягкий лимит для размера файла дампа памяти.

:::note
Жесткий лимит настраивается через системные инструменты
:::

**Пример**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```
## crash_log {#crash_log} 

Настройки для системной таблицы [crash_log](../../operations/system-tables/crash-log.md).

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

Эта настройка определяет путь к кэшу для пользовательских (созданных из SQL) кэшированных дисков.
`custom_cached_disks_base_directory` имеет более высокий приоритет для пользовательских дисков по сравнению с `filesystem_caches_path` (найденным в `filesystem_caches_path.xml`),
который используется, если первый отсутствует.
Путь настройки файловой системы должен находиться внутри этого каталога,
в противном случае будет выброшено исключение, предотвращающее создание диска.

:::note
Это не повлияет на диски, созданные на более старой версии, для которой сервер был обновлен.
В этом случае исключение не будет выброшено, чтобы позволить серверу успешно запуститься.
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

**Смотрите также**

- [Пользовательские настройки](/operations/settings/query-level#custom_settings)
## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`480`|


Задержка, в течение которой удалённая таблица может быть восстановлена с помощью команды [`UNDROP`](/sql-reference/statements/undrop.md). Если `DROP TABLE` была выполнена с модификатором `SYNC`, настройка игнорируется.
По умолчанию эта настройка равна `480` (8 минут).
## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`5`|

В случае неудачи операции удаления таблицы, ClickHouse будет ждать это время перед повторной попыткой операции.
## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`16`|

Размер пула потоков, используемого для удаления таблиц.
## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`86400`|


Параметр задачи, очищающей мусор из каталога `store/`.
Устанавливает периодичность выполнения задачи.

:::note
Значение `0` означает "никогда". Значение по умолчанию соответствует 1 дню.
:::
## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`3600`|


Параметр задачи, очищающей мусор из каталога `store/`.
Если некоторый подкаталог не используется clickhouse-server и этот каталог не был изменен в течение последних
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) секунд, задача "скроет" этот каталог, убрав все права доступа. Это также работает для каталогов, которые clickhouse-server не ожидает увидеть внутри `store/`.

:::note
Значение `0` означает "немедленно".
:::
## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`2592000`|


Параметр задачи, очищающей мусор из каталога `store/`.
Если некоторый подкаталог не используется clickhouse-server и он ранее был "скрыт"
(см. [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec))
и этот каталог не был изменен в течение последних
[`database_catalog_unused_dir_rm_timeout_sec`]/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) секунд, задача удалит этот каталог.
Это также работает для каталогов, которые clickhouse-server не ожидает увидеть внутри `store/`.

:::note
Значение `0` означает "никогда". Значение по умолчанию соответствует 30 дням.
:::
## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|

Разрешить постоянное отсоединение таблиц в реплицированных базах данных.
## default_database {#default_database} 

|Тип|По умолчанию|
|---|---|
|`String`|`default`|

Имя базы данных по умолчанию.
## default_password_type {#default_password_type} 

Устанавливает тип пароля, который будет автоматически установлен для запросов типа `CREATE USER u IDENTIFIED BY 'p'`.

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

|Тип|По умолчанию|
|---|---|
|`String`|`{replica}`|


Имя реплики в ZooKeeper.

**Пример**

```xml
<default_replica_name>{replica}</default_replica_name>
```
## default_replica_path {#default_replica_path} 

|Тип|По умолчанию|
|---|---|
|`String`|`/clickhouse/tables/{uuid}/{shard}`|


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

Путь к файлу конфигурации для словарей.

Путь:

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать подстановочные символы \* и ?.

Смотрите также:
- "[Словари](../../sql-reference/dictionaries/index.md)".

**Пример**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## dictionaries_lazy_load {#dictionaries_lazy_load} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Ленивая загрузка словарей.

- Если `true`, тогда каждый словарь загружается при первом использовании. Если загрузка не удалась, функция, использующая словарь, выбрасывает исключение.
- Если `false`, сервер загружает все словари при старте.

:::note
Сервер будет ждать при запуске, пока все словари не завершат свою загрузку, прежде чем принимать любые соединения
(исключение: если [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) установлено в `false`).
:::

**Пример**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```
## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000`|

Интервал в миллисекундах для попыток повторного подключения к неудачным словарям MySQL и Postgres с включенной настройкой `background_reconnect`.
## disable_insertion_and_mutation {#disable_insertion_and_mutation} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Отключить все запросы вставки/изменения/удаления. Эта настройка будет включена, если кому-то нужны узлы только для чтения, чтобы предотвратить влияние вставки и мутаций на производительность чтения.
## disable_internal_dns_cache {#disable_internal_dns_cache} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|

Отключает внутренний кэш DNS. Рекомендуется для работы ClickHouse в системах с часто изменяющейся инфраструктурой, такой как Kubernetes.
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy} 

По умолчанию, туннелирование (т.е. `HTTP CONNECT`) используется для выполнения `HTTPS` запросов через `HTTP` прокси. Эта настройка может быть использована для отключения этого.

**no_proxy**

По умолчанию все запросы проходят через прокси. Чтобы отключить его для определённых хостов, нужно установить переменную `no_proxy`.
Её можно установить внутри `<proxy>` для списков и удалённых резольверов, а также в виде переменной окружения для резольвера среды.
Поддерживаются IP-адреса, домены, поддомены и символ `'*'` для полного обхода. Ведущие точки отбрасываются так же, как это делает curl.

**Пример**

Следующая конфигурация обходит прокси для запросов к `clickhouse.cloud` и всем его поддоменам (например, `auth.clickhouse.cloud`).
То же самое относится к GitLab, даже если у него есть ведущая точка. И `gitlab.com`, и `about.gitlab.com` будут обходить прокси.

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

|Тип|По умолчанию|
|---|---|
|`UInt64`|`5000`|

Соединения выше этого лимита имеют значительно более короткое время жизни. Лимит применяется к соединениям дисков.
## disk_connections_store_limit {#disk_connections_store_limit} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`30000`|

Соединения выше этого лимита сбрасываются после использования. Установите на 0, чтобы отключить кэш соединений. Лимит применяется к соединениям дисков.
## disk_connections_warn_limit {#disk_connections_warn_limit} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10000`|

Предупреждающие сообщения записываются в журналы, если количество активных соединений превышает этот лимит. Лимит применяется к соединениям дисков.
## display_secrets_in_show_and_select {#display_secrets_in_show_and_select} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Включает или отключает отображение секретов в запросах `SHOW` и `SELECT` для таблиц, баз данных, табличных функций и словарей.

Чтобы увидеть секреты, пользователь также должен иметь 
[`format_display_secrets_in_show_and_select` формат настройки](../settings/formats#format_display_secrets_in_show_and_select)
включённым и 
привилегию [`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Возможные значения:

- `0` — Отключено.
- `1` — Включено.
## distributed_ddl {#distributed_ddl} 

Управляет выполнением [распределенных ddl запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) на кластере.
Работает только если включён [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper).

Настраиваемые параметры внутри `<distributed_ddl>` включают:

| Настройка                | Описание                                                                                                                       | Значение по умолчанию                          |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| `path`                   | путь в Keeper для `task_queue` для DDL запросов                                                                                   |                                               |
| `profile`                | профиль, используемый для выполнения DDL запросов                                                                                   |                                               |
| `pool_size`              | сколько `ON CLUSTER` запросов можно выполнять одновременно                                                                            |                                               |
| `max_tasks_in_queue`     | максимальное количество задач, которые могут находиться в очереди.                                                                 | `1,000`                                       |
| `task_max_lifetime`      | удалить узел, если его возраст больше этого значения.                                                                             | `7 * 24 * 60 * 60` (неделя в секундах)      |
| `cleanup_delay_period`   | очистка начинается после получения нового события узла, если последняя очистка не была выполнена раньше, чем `cleanup_delay_period` секунд назад. | `60` секунд                                   |

**Пример**

```xml
<distributed_ddl>
    <!-- Путь в ZooKeeper к очереди с DDL запросами -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Настройки из этого профиля будут использованы для выполнения DDL запросов -->
    <profile>default</profile>

    <!-- Управляет тем, сколько ON CLUSTER запросов можно выполнять одновременно. -->
    <pool_size>1</pool_size>

    <!--
         Настройки очистки (активные задачи не будут удалены)
    -->

    <!-- Управляет временем жизни задачи (по умолчанию 1 неделя) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Управляет тем, как часто должна выполняться очистка (в секундах) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Управляет тем, сколько задач может быть в очереди -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```
## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|

Разрешает разрешение имён в ipv4 адреса.
## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|

Разрешает разрешение имён в ipv6 адреса.
## dns_cache_max_entries {#dns_cache_max_entries} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10000`|

Максимальное количество записей во внутреннем кэше DNS.
## dns_cache_update_period {#dns_cache_update_period} 

|Тип|По умолчанию|
|---|---|
|`Int32`|`15`|

Период обновления внутреннего кэша DNS в секундах.
## dns_max_consecutive_failures {#dns_max_consecutive_failures} 

|Тип|По умолчанию|
|---|---|
|`UInt32`|`10`|

Максимальное количество ошибок разрешения DNS для имени хоста до удаления этого имени из кэша DNS ClickHouse.
## enable_azure_sdk_logging {#enable_azure_sdk_logging} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|

Включает логирование из Azure SDK.
## encryption {#encryption} 

Настраивает команду для получения ключа, который будет использоваться кодеками [шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должны быть записаны в переменные окружения или установлены в конфигурационном файле.

Ключи могут быть в шестнадцатеричном формате или строкой длиной 16 байт.

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
Не рекомендуется хранить ключи в конфигурационном файле. Это не безопасно. Вы можете переместить ключи в отдельный конфигурационный файл на безопасном диске и сделать символическую ссылку на этот файл конфигурации в папке `config.d/`.
:::

Загрузка из конфигурации, когда ключ имеет шестнадцатеричный формат:

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

Каждый из этих методов может быть применен для нескольких ключей:

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

Также пользователи могут добавить nonce, который должен быть длиной 12 байт (по умолчанию процессы шифрования и расшифровки используют nonce, состоящий из нулевых байт):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Или это может быть установлено в шестнадцатеричном формате:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
Все, упомянутое выше, можно применить для `aes_256_gcm_siv` (но ключ должен быть длиной 32 байта).
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

Чтобы отключить настройку `error_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_error_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## format_alter_operations_with_parentheses {#format_alter_operations_with_parentheses} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|

Если установлено в `true`, операции изменения будут окружены скобками в форматируемых запросах. Это уменьшает неоднозначность разбора отформатированных запросов на изменение.
## format_schema_path {#format_schema_path} 

Путь к каталогу со схемами для входных данных, такими как схемы для формата [CapnProto](../../interfaces/formats.md#capnproto).

**Пример**

```xml
<!-- Каталог, содержащий файлы схем для различных входных форматов. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Период для таймера процессорных часов глобального профилировщика (в наносекундах). Установите значение 0, чтобы отключить глобальный профилировщик процессорных часов. Рекомендуемое значение — как минимум 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (раз в секунду) для кластерного профилирования.
## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Период для таймера реального времени глобального профилировщика (в наносекундах). Установите значение 0, чтобы отключить глобальный профилировщик реального времени. Рекомендуемое значение — как минимум 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (раз в секунду) для кластерного профилирования.
## google_protos_path {#google_protos_path} 

Определяет каталог, содержащий proto-файлы для типов Protobuf.

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
- `timeout` – таймаут для отправки данных, в секундах.
- `root_path` – префикс для ключей.
- `metrics` – отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – отправка дельта-данных, накопленных за период времени, из таблицы [system.events](/operations/system-tables/events).
- `events_cumulative` – отправка кумулятивных данных из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – отправка данных из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Вы можете настроить несколько `<graphite>` конструкций. Например, можно использовать это для отправки различных данных с различными интервалами.

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

Подробности см. в [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md).

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

Срок действия HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. Если вы установите положительное число, HSTS будет включен, а max-age будет равен указанному вами значению.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## http_connections_soft_limit {#http_connections_soft_limit} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`100`|

Соединения, превышающие этот лимит, имеют значительно более короткое время жизни. Лимит применяется к HTTP соединениям, которые не принадлежат никакому диску или хранилищу.
## http_connections_store_limit {#http_connections_store_limit} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`5000`|

Соединения, превышающие этот лимит, сбрасываются после использования. Установите на 0, чтобы отключить кэш соединений. Лимит применяется к HTTP соединениям, которые не принадлежат никакому диску или хранилищу.
## http_connections_warn_limit {#http_connections_warn_limit} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000`|

Предупреждающие сообщения записываются в журналы, если количество активных соединений превышает этот лимит. Лимит применяется к HTTP соединениям, которые не принадлежат никакому диску или хранилищу.
## http_handlers {#http_handlers} 

Позволяет использовать настраиваемые HTTP обработчики.
Чтобы добавить новый HTTP обработчик, просто добавьте новое `<rule>`.
Правила проверяются сверху вниз в определенном порядке,
и первое совпадение запустит обработчик.

Следующие параметры могут быть настроены с помощью подпараметров:

| Подпараметры          | Определение                                                                                                                                                                   |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                 | Для сопоставления URL запроса вы можете использовать префикс 'regex:' для применения регулярного соответствия (по желанию)                                                            |
| `methods`             | Для сопоставления методов запроса вы можете использовать запятые для разделения нескольких совпадений методов (по желанию)                                                       |
| `headers`             | Для сопоставления заголовков запроса сопоставьте каждый дочерний элемент (имя дочернего элемента — это имя заголовка), вы можете использовать префикс 'regex:' для применения регулярного соответствия (по желанию) |
| `handler`             | Обработчик запроса                                                                                                                                                          |
| `empty_query_string`  | Проверка на отсутствие строки запроса в URL                                                                                                                                  |

`handler` содержит следующие параметры, которые могут быть настроены с помощью подпараметров:

| Подпараметры        | Определение                                                                                                                                                 |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | Путь для перенаправления                                                                                                                                    |
| `type`             | Поддерживаемые типы: static, dynamic_query_handler, predefined_query_handler, redirect                                                                         |
| `status`           | Используется при статическом типе, код состояния ответа                                                                                                         |
| `query_param_name` | Используется с типом dynamic_query_handler, извлекает и выполняет значение, соответствующее `<query_param_name>` в параметрах HTTP-запроса                      |
| `query`            | Используется с типом predefined_query_handler, выполняет запрос, когда вызывается обработчик                                                                     |
| `content_type`     | Используется с типом static, тип контента ответа                                                                                                             |
| `response_content` | Используется с типом static, контент ответа, отправляемый клиенту, когда используется префикс 'file://' или 'config://', находите содержимое из файла или конфигурации, отправляемой клиенту |

Помимо списка правил, вы можете указать `<defaults/>`, которое определяет включение всех стандартных обработчиков.

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

Страница, которая отображается по умолчанию, когда вы обращаетесь к HTTP(s) серверу ClickHouse.
Значение по умолчанию "Ok." (с переводом строки в конце)

**Пример**

Открывает `https://tabix.io/` при обращении к `http://localhost: http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`50`|

Размер фона пула для каталога iceberg.
## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000000`|

Количество задач, которые возможно добавить в пул каталога iceberg.
## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Если true, ClickHouse не записывает значения по умолчанию для пустых операторов SQL безопасности в запросах `CREATE VIEW`.

:::note
Эта настройка необходима только на период миграции и станет устаревшей в 24.4
:::
## include_from {#include_from} 

Путь к файлу с подстановками. Поддерживаются форматы XML и YAML.

Для дополнительной информации смотрите раздел "[Файлы конфигурации](/operations/configuration-files)".

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## index_mark_cache_policy {#index_mark_cache_policy} 

|Тип|По умолчанию|
|---|---|
|`String`|`SLRU`|

Имя политики кэша индексных меток второго индекса.
## index_mark_cache_size {#index_mark_cache_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`5368709120`|


Максимальный размер кэша для индексных меток.

:::note

Значение `0` означает отключено.

Эту настройку можно изменить во время работы, и она вступит в силу немедленно.
:::
## index_mark_cache_size_ratio {#index_mark_cache_size_ratio} 

|Тип|По умолчанию|
|---|---|
|`Double`|`0.3`|

Размер защищенной очереди (в случае политики SLRU) в кэше меток вторичного индекса относительно общего размера кэша.
## index_uncompressed_cache_policy {#index_uncompressed_cache_policy} 

|Тип|По умолчанию|
|---|---|
|`String`|`SLRU`|

Имя политики кэша для не сжатого вторичного индекса.
## index_uncompressed_cache_size {#index_uncompressed_cache_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Максимальный размер кэша для некомпрессированных блоков индексов `MergeTree`.

:::note
Значение `0` означает, что функция отключена.

Эта настройка может быть изменена во время исполнения и вступит в силу немедленно.
:::
## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio} 

|Тип|По умолчанию|
|---|---|
|`Double`|`0.5`|

Размер защищенной очереди (в случае политики SLRU) в некомпрессированном кэше вторичного индекса относительно общего размера кэша.
## interserver_http_credentials {#interserver_http_credentials} 

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики с помощью этих учетных данных. 
Следовательно, `interserver_http_credentials` должны быть одинаковыми для всех реплик в кластере.

:::note
- По умолчанию, если раздел `interserver_http_credentials` опущен, аутентификация не используется во время репликации.
- Настройки `interserver_http_credentials` не относятся к учетным данным клиента ClickHouse [конфигурации](../../interfaces/cli.md#configuration_files).
- Эти учетные данные общие для репликации через `HTTP` и `HTTPS`.
:::

Следующие настройки могут быть настроены с помощью под-тегов:

- `user` — Имя пользователя.
- `password` — Пароль.
- `allow_empty` — Если `true`, другие реплики могут подключаться без аутентификации, даже если учетные данные установлены. Если `false`, то подключения без аутентификации отклоняются. По умолчанию: `false`.
- `old` — Содержит старые `user` и `password`, использованные во время ротации учетных данных. Можно указать несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию межсерверных учетных данных без остановки всех реплик одновременно для обновления их конфигурации. Учетные данные могут быть изменены поэтапно.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволяет подключения как с аутентификацией, так и без нее.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите `allow_empty` в `false` или удалите эту настройку. Это сделает аутентификацию с новыми учетными данными обязательной.

Чтобы изменить существующие учетные данные, переместите имя пользователя и пароль в раздел `interserver_http_credentials.old` и обновите `user` и `password` новыми значениями. На этом этапе сервер будет использовать новые учетные данные для подключения к другим репликам и принимать подключения как с новыми, так и со старыми учетными данными.

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

Если опущено, оно определяется так же, как и команда `hostname -f`.

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

Аналогично [`interserver_http_host`](#interserver_http_host), за исключением того, что это имя хоста может использоваться другими серверами для доступа к этому серверу через `HTTPS`.

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

Ограничение на хосты, которые могут обмениваться данными между серверами ClickHouse. 
Если используется Keeper, то то же ограничение будет применяться к связи между различными экземплярами Keeper.

:::note
По умолчанию, значение равно настройке [`listen_host`](#listen_host).
:::

**Пример**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

Тип:

По умолчанию:
## io_thread_pool_queue_size {#io_thread_pool_queue_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10000`|


Максимальное количество задач, которое может быть запланировано в пуле потоков IO.

:::note
Значение `0` означает неограниченное число.
:::
## keep_alive_timeout {#keep_alive_timeout} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`30`|


Количество секунд, которое ClickHouse ожидает входящих запросов для протокола HTTP перед закрытием соединения.

**Пример**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## keeper_multiread_batch_size {#keeper_multiread_batch_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10000`|


Максимальный размер батча для запроса MultiRead к [Zoo]Keeper, который поддерживает пакетную обработку. Если установлено значение 0, пакетная обработка отключена. Доступно только в ClickHouse Cloud.
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

Чтобы отключить настройку `latency_log`, создайте файл `/etc/clickhouse-server/config.d/disable_latency_log.xml` со следующим содержимым:

```xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## ldap_servers {#ldap_servers} 

Список LDAP серверов с их параметрами подключения здесь для:
- использования их в качестве аутентификаторов для выделенных локальных пользователей, у которых указан механизм аутентификации 'ldap' вместо 'password'
- использования их в качестве удаленных каталогов пользователей.

Следующие настройки могут быть настроены с помощью под-тегов:

| Настройка                        | Описание                                                                                                                                                                                                                                                                                                                                                                                                                              |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                           | Имя хоста или IP LDAP-сервера, этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                                                                                                                             |
| `port`                           | Порт LDAP-сервера, по умолчанию 636, если `enable_tls` установлен в true, 389 в противном случае.                                                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                        | Шаблон, используемый для построения DN для подключения. Результирующий DN будет построен путем замены всех подстрок `\{user_name\}` шаблона фактическим именем пользователя при каждой попытке аутентификации.                                                                                                                                                                                                                               |
| `user_dn_detection`              | Раздел с параметрами поиска LDAP для обнаружения фактического DN пользователя, к которому осуществляется подключение. Это в основном используется в фильтрах поиска для дальнейшего сопоставления ролей, когда сервер является Active Directory. Результирующий DN пользователя будет использоваться при замене подстрок `\{user_dn\}` везде, где это допускается. По умолчанию DN пользователя устанавливается равным DN подключения, но после выполнения поиска он будет обновлен до фактического обнаруженного значения DN пользователя. |
| `verification_cooldown`          | Период времени, в секундах, после успешной попытки подключения, в течение которого пользователь будет считаться успешно аутентифицированным для всех последующих запросов без обращения к серверу LDAP. Укажите `0` (по умолчанию), чтобы отключить кэширование и принудить обращения к серверу LDAP для каждого запроса аутентификации.                                                                                                                  |
| `enable_tls`                     | Флаг для включения использования защищенного соединения с сервером LDAP. Укажите `no` для протокола в открытом тексте (`ldap://`) (не рекомендуется). Укажите `yes` для LDAP через SSL/TLS (`ldaps://`) (рекомендуется, по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (простой текст (`ldap://`), обновленный до TLS).                                                                                                               |
| `tls_minimum_protocol_version`   | Минимальная версия протокола SSL/TLS. Принятые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (по умолчанию).                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`               | Поведение проверки сертификата пира SSL/TLS. Принятые значения: `never`, `allow`, `try`, `demand` (по умолчанию).                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`                  | путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                   | путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`               | путь к файлу сертификата CA.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`                | путь к директории, содержащей сертификаты CA.                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`               | допустимый набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                                                                                              |

Настройка `user_dn_detection` может быть настроена с помощью под-тегов:

| Настройка         | Описание                                                                                                                                                                                                                                                                                                                                    |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`         | шаблон, используемый для построения базового DN для LDAP-поиска. Результирующий DN будет построен путем замены всех подстрок `\{user_name\}` и '\{bind_dn\}' шаблона фактическим именем пользователя и DN подключения во время LDAP-поиска.                                                                                                       |
| `scope`           | область LDAP-поиска. Принятые значения: `base`, `one_level`, `children`, `subtree` (по умолчанию).                                                                                                                                                                                                                                       |
| `search_filter`   | шаблон, используемый для построения фильтра поиска для LDAP-поиска. Результующий фильтр будет построен путем замены всех подстрок `\{user_name\}`, `\{bind_dn\}` и `\{base_dn\}` шаблона фактическим именем пользователя, DN подключения и базовым DN во время LDAP-поиска. Обратите внимание, что специальные символы должны быть корректно экранированы в XML.  |

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

Пример (типичный Active Directory с настроенной детекцией DN пользователя для дальнейшего сопоставления ролей):

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

Размер очереди ожидания (размер очереди ожидающих подключений) для сокета прослушивания. Значение по умолчанию `4096` является тем же, что и у Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не нужно изменять, поскольку:
- Значение по умолчанию достаточно велико,
- Для принятия подключений клиентов сервер имеет отдельный поток.

Таким образом, даже если у вас есть `TcpExtListenOverflows` (из `nstat`) ненулевое, и этот счетчик растет для сервера ClickHouse, это не означает, что это значение нужно увеличить, поскольку:
- Обычно, если `4096` недостаточно, это показывает какую-то внутреннюю проблему масштабирования ClickHouse, поэтому лучше сообщить о проблеме.
- Это не значит, что сервер может позднее обработать больше подключений (и даже если бы мог, на тот момент клиенты могут быть отключены или потеряны).

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

Разрешить нескольким серверам прослушивать один и тот же адрес:порт. Запросы будут направлены на случайный сервер операционной системой. Включение этой настройки не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

По умолчанию:
## listen_try {#listen_try} 

Сервер не выйдет из строя, если сети IPv6 или IPv4 недоступны во время попытки прослушивания.

**Пример**

```xml
<listen_try>0</listen_try>
```
## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`50`|

Размер фоновоего пула для загрузки меток.
## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000000`|

Количество задач, которое можно добавить в пул предварительной выборки.
## logger {#logger} 

Расположение и формат сообщений логирования.

**Ключи**:

| Ключ                      | Описание                                                                                                                                                                            |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                   | Уровень логирования. Допустимые значения: `none` (выключить логирование), `fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test`                 |
| `log`                     | Путь к файлу лога.                                                                                                                                                                  |
| `errorlog`                | Путь к файлу лога ошибок.                                                                                                                                                          |
| `size`                    | Политика ротации: Максимальный размер лог-файлов в байтах. После превышения этого порога, лог-файл будет переименован и архивирован, а новый лог-файл будет создан.                    |
| `count`                   | Политика ротации: Максимальное количество исторических лог-файлов, которые сохраняет ClickHouse.                                                                                     |
| `stream_compress`         | Сжимать сообщения логирования с использованием LZ4. Установите на `1` или `true` для включения.                                                                                     |
| `console`                 | Не записывать сообщения логирования в файлы логов, вместо этого выводить их в консоль. Установите на `1` или `true` для включения. По умолчанию `1`, если ClickHouse не работает в режиме демона, `0` в противном случае. |
| `console_log_level`       | Уровень логирования для вывода в консоль. По умолчанию `level`.                                                                                                                    |
| `formatting`              | Формат логирования для вывода в консоль. В настоящее время поддерживается только `json`.                                                                                           |
| `use_syslog`              | Также перенаправлять вывод логов в syslog.                                                                                                                                         |
| `syslog_level`            | Уровень логирования для логирования в syslog.                                                                                                                                       |

**Спецификаторы формата логирования**

Имена файлов в путях `log` и `errorLog` поддерживают следующие спецификаторы формата для результирующего имени файла (часть директории не поддерживает их).

Колонка "Пример" показывает вывод на `2023-07-06 18:32:07`.

| Спецификатор | Описание                                                                                                                   | Пример                       |
|--------------|----------------------------------------------------------------------------------------------------------------------------|------------------------------|
| `%%`         | Литерал %                                                                                                                 | `%`                          |
| `%n`         | Символ новой строки                                                                                                      |                              |
| `%t`         | Символ горизонтальной табуляции                                                                                            |                              |
| `%Y`         | Год в десятичном формате, например, 2017                                                                                  | `2023`                       |
| `%y`         | Последние 2 цифры года в десятичном формате (диапазон [00,99])                                                           | `23`                         |
| `%C`         | Первые 2 цифры года в десятичном формате (диапазон [00,99])                                                              | `20`                         |
| `%G`         | Четырехзначный [ISO 8601 год на основе недель](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, содержащий указанную неделю. Обычно полезен только с `%V` | `2023`                       |
| `%g`         | Последние 2 цифры [ISO 8601 года на основе недель](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)                   | `23`                         |
| `%b`         | Сокращенное название месяца, например, Окт (в зависимости от локали)                                                    | `Jul`                        |
| `%h`         | Синоним `%b`                                                                                                             | `Jul`                        |
| `%B`         | Полное название месяца, например, Октябрь (в зависимости от локали)                                                     | `July`                       |
| `%m`         | Месяц в десятичном формате (диапазон [01,12])                                                                           | `07`                         |
| `%U`         | Номер недели в году в десятичном формате (воскресенье — первый день недели) (диапазон [00,53])                         | `27`                         |
| `%W`         | Номер недели в году в десятичном формате (понедельник — первый день недели) (диапазон [00,53])                         | `27`                         |
| `%V`         | Номер недели по ISO 8601 (диапазон [01,53])                                                                            | `27`                         |
| `%j`         | День года в десятичном формате (диапазон [001,366])                                                                    | `187`                        |
| `%d`         | День месяца в виде десятичного числа с нулями (диапазон [01,31]). Однозначное число предшествует ноль.                 | `06`                         |
| `%e`         | День месяца в виде десятичного числа с пробелом (диапазон [1,31]). Однозначное число предшествует пробелу.              | `&nbsp; 6`                  |
| `%a`         | Сокращенное название дня недели, например, Пт (в зависимости от локали)                                               | `Thu`                        |
| `%A`         | Полное название дня недели, например, Пятница (в зависимости от локали)                                               | `Thursday`                   |
| `%w`         | День недели в виде целого числа, где воскресенье — 0 (диапазон [0-6])                                                  | `4`                          |
| `%u`         | День недели в виде десятичного числа, где понедельник — 1 (формат ISO 8601) (диапазон [1-7])                          | `4`                          |
| `%H`         | Час в десятичном формате, 24-часовой формат (диапазон [00-23])                                                         | `18`                         |
| `%I`         | Час в десятичном формате, 12-часовой формат (диапазон [01,12])                                                         | `06`                         |
| `%M`         | Минуты в десятичном формате (диапазон [00,59])                                                                          | `32`                         |
| `%S`         | Секунды в десятичном формате (диапазон [00,60])                                                                          | `07`                         |
| `%c`         | Стандартная строка даты и времени, например, Вс Окт 17 04:41:13 2010 (в зависимости от локали)                         | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованное представление даты (в зависимости от локали)                                                            | `07/06/23`                  |
| `%X`         | Локализованное представление времени, например, 18:40:20 или 6:40:20 PM (в зависимости от локали)                      | `18:32:07`                  |
| `%D`         | Краткая дата MM/DD/YY, эквивалентная %m/%d/%y                                                                           | `07/06/23`                  |
| `%F`         | Краткая дата YYYY-MM-DD, эквивалентная %Y-%m-%d                                                                         | `2023-07-06`                |
| `%r`         | Локализованное время в 12-часовом формате (в зависимости от локали)                                                   | `06:32:07 PM`               |
| `%R`         | Эквивалент "%H:%M"                                                                                                     | `18:32`                      |
| `%T`         | Эквивалент "%H:%M:%S" (формат времени ISO 8601)                                                                        | `18:32:07`                  |
| `%p`         | Локализованное обозначение a.m. или p.m. (в зависимости от локали)                                                   | `PM`                         |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430), или никаких символов, если информация о часовых поясах недоступна                                               | `+0800`                     |
| `%Z`         | Название или сокращение часового пояса, зависящее от локали, или никаких символов, если информация о часовом поясе недоступна                                           | `Z AWST `                   |

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

Чтобы выводить сообщения логирования только в консоль:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**Переопределения для каждого уровня**

Уровень логирования для отдельных логов может быть переопределен. Например, чтобы отключить все сообщения логгеров "Backup" и "RBAC".

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

Чтобы дополнительно записывать сообщения логирования в syslog:

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

| Ключ        | Описание                                                                                                                                                                                                                                                  |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`   | Адрес syslog в формате `host\[:port\]`. Если пропущен, используется локальный демон.                                                                                                                                                                      |
| `hostname`  | Имя хоста, с которого отправляются логи (необязательно).                                                                                                                                                                                                 |
| `facility`  | Ключевое слово [facility syslog](https://en.wikipedia.org/wiki/Syslog#Facility). Должен быть указан верхним регистром с префиксом "LOG_", например, `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т.д. По умолчанию: `LOG_USER`, если указан `address`, иначе `LOG_DAEMON`. |
| `format`    | Формат сообщения логирования. Возможные значения: `bsd` и `syslog.`                                                                                                                                                                                       |

**Форматы логов**

Вы можете указать формат лога, который будет выводиться в консоли. В настоящее время поддерживается только JSON.

**Пример**

Вот пример вывода JSON лога:

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

Чтобы включить поддержку логирования в формате JSON, используйте следующий фрагмент:

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

Имена ключей могут быть изменены путём изменения значений тегов внутри тега `<names>`. Например, чтобы изменить `DATE_TIME` на `MY_DATE_TIME`, вы можете использовать `<date_time>MY_DATE_TIME</date_time>`.

**Опускание ключей для JSON логов**

Свойства лога могут быть опущены, если закомментировать свойство. Например, если вы не хотите, чтобы ваш лог выводил `query_id`, вы можете закомментировать тег `<query_id>`.

## macros {#macros} 

Замены параметров для реплицируемых таблиц.

Можно опустить, если реплицируемые таблицы не используются.

Дополнительную информацию смотрите в разделе [Создание реплицируемых таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```

## mark_cache_policy {#mark_cache_policy} 

| Тип    | По умолчанию |
|--------|--------------|
| `String` | `SLRU`      |

Имя политики кэширования меток.

## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio} 

| Тип    | По умолчанию |
|--------|--------------|
| `Double` | `0.95`     |

Доля общего размера кэша меток для заполнения во время предварительного прогрева.

## mark_cache_size {#mark_cache_size} 

| Тип    | По умолчанию   |
|--------|-----------------|
| `UInt64` | `5368709120`   |


Максимальный размер кэша для меток (индекс семейства [`MergeTree`](/engines/table-engines/mergetree-family) таблиц).

:::note
Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::

## mark_cache_size_ratio {#mark_cache_size_ratio} 

| Тип    | По умолчанию |
|--------|--------------|
| `Double` | `0.5`      |

Размер защищенной очереди (в случае политики SLRU) в кэше меток в сравнении с общим размером кэша.

## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `64`       |

Количество потоков для загрузки активного набора частей данных (активных) при запуске.

## max_authentication_methods_per_user {#max_authentication_methods_per_user} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `100`      |


Максимальное количество методов аутентификации, с которыми можно создать или изменить пользователя.
Изменение этой настройки не затрагивает существующих пользователей. Запросы, связанные с созданием/изменением аутентификации, будут завершены неудачей, если они превысят лимит, указанный в этой настройке.
Запросы на создание/изменение, не связанные с аутентификацией, будут успешными.

:::note
Значение `0` означает неограниченное количество.
:::

## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |

Максимальная скорость чтения в байтах в секунду для всех резервных копий на сервере. Ноль означает неограниченную скорость.

## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |

Если количество **бездействующих** потоков в пуле потоков IO резервных копий превышает `max_backup_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые бездействующими потоками и уменьшит размер пула. Потоки могут быть созданы снова, если это необходимо.

## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `1000`      |

ClickHouse использует потоки из пула потоков IO резервных копий для выполнения операций резервного копирования S3. `max_backups_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.

## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `16`       |


Максимальное количество потоков, используемых для построения векторных индексов.

:::note
Значение `0` означает использование всех ядер.
:::

## max_concurrent_insert_queries {#max_concurrent_insert_queries} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |


Ограничение на общее количество одновременно выполняемых запросов на вставку.

:::note

Значение `0` (по умолчанию) означает неограниченное количество.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::

## max_concurrent_queries {#max_concurrent_queries} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |


Ограничение на общее количество одновременно выполняемых запросов. Следует также учитывать ограничения на запросы `INSERT` и `SELECT`, а также на максимальное количество запросов для пользователей.

См. также:
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

Значение `0` (по умолчанию) означает неограниченное количество.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::

## max_concurrent_select_queries {#max_concurrent_select_queries} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |


Ограничение на общее количество одновременно выполняемых запросов на выборку.

:::note

Значение `0` (по умолчанию) означает неограниченное количество.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::

## max_connections {#max_connections} 

| Тип    | По умолчанию |
|--------|--------------|
| `Int32` | `4096`      |

Максимальное количество соединений с сервером.

## max_database_num_to_throw {#max_database_num_to_throw} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |

Если количество баз данных превышает это значение, сервер выдает исключение. 0 означает отсутствие ограничений.

## max_database_num_to_warn {#max_database_num_to_warn} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `1000`      |


Если количество присоединенных баз данных превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```

## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt32` | `1`        |

Количество потоков для создания таблиц во время восстановления реплики в DatabaseReplicated. Ноль означает, что количество потоков равно количеству ядер.

## max_dictionary_num_to_throw {#max_dictionary_num_to_throw} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |


Если количество словарей превышает это значение, сервер выдает исключение.

Учитываются только таблицы для движков баз данных:
- Атомарные
- Обычные
- Реплицируемые
- Ленивая

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**
```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```

## max_dictionary_num_to_warn {#max_dictionary_num_to_warn} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `1000`      |


Если количество присоединенных словарей превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```

## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `10000`     |

Сколько записей в статистике хеш-таблицы, собранной во время агрегации, разрешено иметь.

## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `64`        |

Количество потоков для ALTER TABLE FETCH PARTITION.

## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |


Если количество **бездействующих** потоков в пуле потоков IO превышает `max_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые бездействующими потоками и уменьшит размер пула. Потоки могут быть созданы снова, если это необходимо.

## max_io_thread_pool_size {#max_io_thread_pool_size} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `100`      |


ClickHouse использует потоки из пула потоков IO для выполнения некоторых операций ввода-вывода (например, для взаимодействия с S3). `max_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.

## max_keep_alive_requests {#max_keep_alive_requests} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `10000`     |


Максимальное количество запросов через одно соединение keep-alive до его закрытия сервером ClickHouse.

**Пример**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```

## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |


Максимальная скорость локальных чтений в байтах в секунду.

:::note
Значение `0` означает неограниченное количество.
:::

## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |


Максимальная скорость локальных записей в байтах в секунду.

:::note
Значение `0` означает неограниченное количество.
:::

## max_materialized_views_count_for_table {#max_materialized_views_count_for_table} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |


Ограничение на количество материализованных представлений, присоединенных к таблице.

:::note
Учитываются только непосредственно зависимые представления, а создание одного представления поверх другого не считается.
:::

## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |

Максимальная скорость чтения всех слияний на сервере в байтах в секунду. Ноль означает неограниченную скорость.

## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |

Максимальная скорость чтения всех мутаций на сервере в байтах в секунду. Ноль означает неограниченную скорость.

## max_open_files {#max_open_files} 

Максимальное количество открытых файлов.

:::note
Мы рекомендуем использовать эту опцию в macOS, так как функция `getrlimit()` возвращает неправильное значение.
:::

**Пример**

```xml
<max_open_files>262144</max_open_files>
```

## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `32`       |

Количество потоков для загрузки неактивного набора частей данных (устаревших) при запуске.

## max_part_num_to_warn {#max_part_num_to_warn} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `100000`    |


Если количество активных частей превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```

## max_partition_size_to_drop {#max_partition_size_to_drop} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `50000000000`|


Ограничение на удаление партиций.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает [`max_partition_size_to_drop`](#max_partition_size_to_drop) (в байтах), вы не можете удалить партицию с помощью запроса [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart).
Эта настройка не требует перезапуска сервера ClickHouse для применения. Другой способ отключить ограничение — создать файл `<clickhouse-path>/flags/force_drop_table`.

:::note
Значение `0` означает, что вы можете удалять партиции без каких-либо ограничений.

Это ограничение не распространяется на удаление таблицы и обрезку таблицы, см. [max_table_size_to_drop](/operations/settings/settings#max_table_size_to_drop)
:::

**Пример**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```

## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `128`      |

Количество потоков для параллельного удаления неактивных частей данных.

## max_pending_mutations_to_warn {#max_pending_mutations_to_warn} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `500`       |


Если количество ожидающих мутаций превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```

## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |


Если количество **бездействующих** потоков в пуле потоков десериализации префиксов превышает `max_prefixes_deserialization_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые бездействующими потоками и уменьшит размер пула. Потоки могут быть созданы снова, если это необходимо.

## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `100`      |


ClickHouse использует потоки из пула потоков десериализации префиксов для параллельного чтения метаданных столбцов и подстолбцов из файловых префиксов в широких частях MergeTree. `max_prefixes_deserialization_thread_pool_size` ограничивает максимальное количество потоков в пуле.

## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |


Максимальная скорость обмена данными по сети в байтах в секунду для чтения.

:::note
Значение `0` (по умолчанию) означает неограниченную скорость.
:::

## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |


Максимальная скорость обмена данными по сети в байтах в секунду для записи.

:::note
Значение `0` (по умолчанию) означает неограниченную скорость.
:::

## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |

Максимальная скорость обмена данными по сети в байтах в секунду для реплицируемых выборок. Ноль означает неограниченную скорость.

## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |

Максимальная скорость обмена данными по сети в байтах в секунду для реплицируемых отправок. Ноль означает неограниченную скорость.

## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |


Если количество реплицируемых таблиц превышает это значение, сервер выдает исключение.

Учитываются только таблицы для движков баз данных:
- Атомарные
- Обычные
- Реплицируемые
- Ленивая

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**
```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```

## max_server_memory_usage {#max_server_memory_usage} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |


Максимальное количество памяти, которое сервер может использовать, выраженное в байтах.

:::note
Максимальное потребление памяти сервером дополнительно ограничено настройкой `max_server_memory_usage_to_ram_ratio`.
:::

Как особый случай, значение `0` (по умолчанию) означает, что сервер может использовать всю доступную память (за исключением дополнительных ограничений, накладываемых `max_server_memory_usage_to_ram_ratio`).

## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

| Тип    | По умолчанию |
|--------|--------------|
| `Double` | `0.9`      |


Максимальное количество памяти, которое сервер может использовать, выраженное в отношении ко всей доступной памяти.

Например, значение `0.9` (по умолчанию) означает, что сервер может использовать 90% доступной памяти.

Позволяет снизить потребление памяти на системах с ограниченной памятью.
На хостах с низким объёмом ОЗУ и подкачки, вам, возможно, придётся установить [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) больше 1.

:::note
Максимальное потребление памяти сервером дополнительно ограничено настройкой `max_server_memory_usage`.
:::

## max_session_timeout {#max_session_timeout} 

Максимальный тайм-аут сессии в секундах.

Пример:

```xml
<max_session_timeout>3600</max_session_timeout>
```

## max_table_num_to_throw {#max_table_num_to_throw} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `0`        |


Если количество таблиц превышает это значение, сервер выдает исключение.

Следующие таблицы не учитываются:
- представление
- удаленное
- словарь
- системный

Учитываются только таблицы для движков баз данных:
- Атомарные
- Обычные
- Реплицируемые
- Ленивая

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**
```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```

## max_table_num_to_warn {#max_table_num_to_warn} 

| Тип    | По умолчанию |
|--------|--------------|
| `UInt64` | `5000`      |


Если количество присоединенных таблиц превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```
## max_table_size_to_drop {#max_table_size_to_drop} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`50000000000`|


Ограничение на удаление таблиц.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает `max_table_size_to_drop` (в байтах), вы не сможете удалить её с помощью запроса [`DROP`](../../sql-reference/statements/drop.md) или запроса [`TRUNCATE`](../../sql-reference/statements/truncate.md).

:::note
Значение `0` означает, что вы можете удалять все таблицы без каких-либо ограничений.

Эта настройка не требует перезапуска сервера ClickHouse для применения. Другой способ отключить ограничение — это создать файл `<clickhouse-path>/flags/force_drop_table`.
:::

**Пример**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```
## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Максимальное количество хранилища, которое может быть использовано для внешней агрегации, соединений или сортировки.
Запросы, которые превышают этот предел, будут завершены с исключением.

:::note
Значение `0` означает без ограничений.
:::

Смотрите также:
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)
## max_thread_pool_free_size {#max_thread_pool_free_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000`|


Если количество **бездействующих** потоков в глобальном пуле потоков больше [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size), то ClickHouse освобождает ресурсы, занимаемые некоторыми потоками, и размер пула уменьшается. Потоки могут быть созданы снова при необходимости.

**Пример**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```
## max_thread_pool_size {#max_thread_pool_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10000`|


ClickHouse использует потоки из глобального пула потоков для обработки запросов. Если нет бездействующего потока для обработки запроса, создается новый поток в пуле. `max_thread_pool_size` ограничивает максимальное количество потоков в пуле.

**Пример**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```
## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`8`|

Количество потоков для загрузки неактивного набора данных (неожиданных) при запуске.
## max_view_num_to_throw {#max_view_num_to_throw} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


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

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10000`|


Если количество прикрепленных представлений превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```
## max_waiting_queries {#max_waiting_queries} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Предел на общее количество одновременно ожидающих запросов.
Выполнение ожидающего запроса блокируется, пока требуемые таблицы загружаются асинхронно (см. [`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases).

:::note
Ожидающие запросы не учитываются при проверке лимитов, контролируемых следующими настройками:

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

Это исправление выполняется, чтобы избежать превышения этих лимитов сразу после старта сервера.
:::

:::note

Значение `0` (по умолчанию) означает без ограничений.

Эта настройка может быть изменена во время работы и вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::
## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Необходимо ли фоновому рабочему процессу памяти исправлять внутренний учетчик памяти на основе информации из внешних источников, таких как jemalloc и cgroups.
## memory_worker_period_ms {#memory_worker_period_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Период тикера фонового рабочего процесса памяти, который исправляет учет использования памяти и очищает неиспользуемые страницы при высоком использовании памяти. Если установлено значение 0, будет использоваться значение по умолчанию в зависимости от источника использования памяти.
## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|

Использовать текущую информацию о использовании памяти cgroup для исправления учета памяти.
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

|Тип|По умолчанию|
|---|---|
|`String`|`default`|


Используется для регулирования того, как ресурсы используются и делятся между объединениями и другими рабочими нагрузками. Указанное значение используется как значение параметра `workload` для всех фоновых объединений. Может быть переопределено настройкой дерева объединения.

**Смотрите также**
- [Workload Scheduling](/operations/workload-scheduling.md)
## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|


Устанавливает предел на то, сколько ОЗУ разрешено использовать для выполнения операций с объединениями и мутациями.
Если ClickHouse достигает установленного лимита, он не будет планировать новые фоновые операции объединения или мутации, но продолжит выполнять уже запланированные задачи.

:::note
Значение `0` означает неограниченно.
:::

**Пример**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```
## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

|Тип|По умолчанию|
|---|---|
|`Double`|`0.5`|


Значение по умолчанию для `merges_mutations_memory_usage_soft_limit` вычисляется как `memory_amount * merges_mutations_memory_usage_to_ram_ratio`.

**Смотрите также:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)
## metric_log {#metric_log} 

Отключен по умолчанию.

**Включение**

Чтобы вручную включить сбор истории метрик [`system.metric_log`](../../operations/system-tables/metric_log.md), создайте файл `/etc/clickhouse-server/config.d/metric_log.xml` со следующим содержанием:

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

Чтобы отключить настройку `metric_log`, вы должны создать следующий файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` со следующим содержанием:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## mlock_executable {#mlock_executable} 

Выполнить `mlockall` после старта, чтобы снизить задержку первых запросов и предотвратить свопирование исполняемого кода ClickHouse при высокой нагрузке на диски.

:::note
Рекомендуется включить эту опцию, но это приведет к увеличению времени загрузки на несколько секунд.
Имейте в виду, что эта настройка не будет работать без возможности "CAP_IPC_LOCK".
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```
## mmap_cache_size {#mmap_cache_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1024`|


Устанавливает размер кэша (в байтах) для отображаемых файлов. Эта настройка позволяет избежать частых вызовов открытия/закрытия (которые являются очень затратными из-за последующих обращений к страницам) и повторно использовать отображения от нескольких потоков и запросов. Значение настройки — это количество отображенных регионов (обычно равно количеству отображаемых файлов).

Количество данных в отображаемых файлах можно контролировать в следующих системных таблицах с следующими метриками:

| Системная таблица                                                                                                                                                                                                                                                                                                                                                       | Метрика                                                                                                   |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [`system.metrics`](/operations/system-tables/metrics) и [`system.metric_log`](/operations/system-tables/metric_log)                                                                                                                                                                                                                              | `MMappedFiles` и `MMappedFileBytes`                                                                    |
| [`system.asynchronous_metrics_log`](/operations/system-tables/asynchronous_metric_log)                                                                                                                                                                                                                                                                     | `MMapCacheCells`                                                                                         |
| [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)  | `CreatedReadBufferMMap`, `CreatedReadBufferMMapFailed`, `MMappedFileCacheHits`, `MMappedFileCacheMisses` |

:::note
Количество данных в отображаемых файлах не потребляет память напрямую и не учитывается в использовании памяти в запросах или сервере — потому что эта память может быть освобождена, как кэш страниц ОС. Кэш автоматически сбрасывается (файлы закрываются) при удалении старых частей в таблицах семейства MergeTree, также его можно сбросить вручную с помощью запроса `SYSTEM DROP MMAP CACHE`.

Эта настройка может быть изменена во время работы и вступит в силу немедленно.
:::
## mutation_workload {#mutation_workload} 

|Тип|По умолчанию|
|---|---|
|`String`|`default`|


Используется для регулирования того, как ресурсы используются и делятся между мутациями и другими рабочими нагрузками. Указанное значение используется как значение параметра `workload` для всех фоновых мутаций. Может быть переопределено настройкой дерева объединения.

**Смотрите также**
- [Workload Scheduling](/operations/workload-scheduling.md)
## mysql_port {#mysql_port} 

Порт для связи с клиентами через MySQL-протокол.

:::note
- Положительные целые числа указывают номер порта для прослушивания.
- Пустые значения используются для отключения связи с клиентами по MySQL-протоколу.
:::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```
## openSSL {#openssl} 

Конфигурация клиента/сервера SSL.

Поддержка SSL обеспечивается библиотекой `libpoco`. Доступные параметры конфигурации объясняются в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи для настроек сервера/клиента:

| Параметр                        | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Значение по умолчанию                              |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`              | Путь к файлу с секретным ключом PEM-сертификата. Файл может одновременно содержать ключ и сертификат.                                                                                                                                                                                                                                                                                                                                              |                                            |
| `certificateFile`             | Путь к файлу клиентского/серверного сертификата в формате PEM. Вы можете опустить его, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                                                |                                            |
| `caConfig`                    | Путь к файлу или директории, содержащей доверенные сертификаты CA. Если он указывает на файл, он должен быть в формате PEM и может содержать несколько сертификатов CA. Если он указывает на директорию, она должна содержать один .pem файл на каждый сертификат CA. Имена файлов ищутся по хешу имени субъекта CA. Подробности можно найти в странице man [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                            |
| `verificationMode`            | Метод проверки сертификатов узла. Подробности см. в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                         | `relaxed`                                  |
| `verificationDepth`           | Максимальная длина цепочки проверки. Проверка не пройдет, если длина цепочки сертификатов превышает установленное значение.                                                                                                                                                                                                                                                                                                                                            | `9`                                        |
| `loadDefaultCAFile`           | Должны ли использоваться встроенные сертификаты CA для OpenSSL. ClickHouse предполагает, что встроенные сертификаты CA находятся в файле `/etc/ssl/cert.pem` (или в директории `/etc/ssl/certs`) или в файле (или директории), указанном переменной окружения `SSL_CERT_FILE` (или `SSL_CERT_DIR`).                                                                                                                                                                        | `true`                                     |
| `cipherList`                  | Поддерживаемые шифры OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | Включает или отключает кэширование сессий. Должен использоваться в сочетании с `sessionIdContext`. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                         | `false`                                    |
| `sessionIdContext`            | Уникальный набор случайных символов, который сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Этот параметр всегда рекомендуется, так как он помогает избежать проблем как при кэшировании сессии сервером, так и при запросе кэширования клиентом.                                                                                                                                                        | `$\{application.name\}`                      |
| `sessionCacheSize`            | Максимальное количество сессий, которые сервер кэширует. Значение `0` означает неограниченное количество сессий.                                                                                                                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | Время кэширования сессии на сервере в часах.                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                        |
| `extendedVerification`        | Если включено, проверьте, что CN или SAN сертификата соответствуют имени узла партнера.                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `requireTLSv1`                | Требуется соединение TLSv1. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `requireTLSv1_1`              | Требуется соединение TLSv1.1. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `requireTLSv1_2`              | Требуется соединение TLSv1.2. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `fips`                        | Включает режим OpenSSL FIPS. Поддерживается, если версия библиотеки OpenSSL поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                    |
| `privateKeyPassphraseHandler` | Класс (субкласс PrivateKeyPassphraseHandler), который запрашивает пароль для доступа к приватному ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | Класс (субкласс CertificateHandler) для проверки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` .                                                                                                                                                                                                                                                                           | `RejectCertificateHandler`                 |
| `disableProtocols`            | Протоколы, которые не могут быть использованы.                                                                                                                                                                                                                                                                                                                                                                                                                             |                                            |
| `preferServerCiphers`         | Предпочитаемые клиентом шифры сервера.                                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                    |

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

Параметры для системной таблицы [`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md).

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

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1048576`|

Размер частей файлов, чтобы хранить в кэше страниц пользовательского пространства, в байтах. Все чтения, которые проходят через кэш, будут округлены до ближайшего кратного этого размера.
## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

|Тип|По умолчанию|
|---|---|
|`Double`|`0.15`|

Доля лимита памяти для освобождения от кэша страниц пользовательского пространства. Аналогично настройке min_free_kbytes в Linux.
## page_cache_history_window_ms {#page_cache_history_window_ms} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000`|

Задержка перед освобожденной памятью, которая может быть использована кэшем страниц пользовательского пространства.
## page_cache_lookahead_blocks {#page_cache_lookahead_blocks} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`16`|

При промахе кэша страниц пользовательского пространства прочитайте до этого количества последовательных блоков за раз из основного хранилища, если они также не находятся в кэше. Каждый блок занимает page_cache_block_size байт.
## page_cache_max_size {#page_cache_max_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`0`|

Максимальный размер кэша страниц пользовательского пространства. Установите в 0, чтобы отключить кэш. Если больше, чем page_cache_min_size, размер кэша будет постоянно регулироваться в пределах этого диапазона, чтобы использовать большую часть доступной памяти, сохраняя общее использование памяти ниже предела (max_server_memory_usage[_to_ram_ratio]).
## page_cache_min_size {#page_cache_min_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`104857600`|

Минимальный размер кэша страниц пользовательского пространства.
## page_cache_policy {#page_cache_policy} 

|Тип|По умолчанию|
|---|---|
|`String`|`SLRU`|

Название политики кэша страниц пользовательского пространства.
## page_cache_shards {#page_cache_shards} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`4`|

Полосой кэша страниц пользовательского пространства по этому количеству шардов, чтобы снизить конкуренцию мьютексов. Экспериментально, вряд ли улучшит производительность.
## page_cache_size_ratio {#page_cache_size_ratio} 

|Тип|По умолчанию|
|---|---|
|`Double`|`0.5`|

Размер защищенной очереди в кэше страниц пользовательского пространства относительно общего размера кэша.
## part_log {#part_log} 

Запись событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Например, добавление или слияние данных. Вы можете использовать журнал, чтобы смоделировать алгоритмы слияния и сравнить их характеристики. Вы можете визуализировать процесс слияния.

Запросы регистрируются в таблице [system.part_log](/operations/system-tables/part_log), а не в отдельном файле. Вы можете настроить имя этой таблицы в параметре `table` (см. ниже).

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

|Тип|По умолчанию|
|---|---|
|`UInt64`|`30`|


Период полного удаления частей для SharedMergeTree. Доступно только в ClickHouse Cloud
## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10`|


Добавляет равномерно распределённое значение от 0 до x секунд к kill_delay_period, чтобы избежать эффекта гремящего стада и последующего DoS ZooKeeper в случае очень большого количества таблиц. Доступно только в ClickHouse Cloud

## parts_killer_pool_size {#parts_killer_pool_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`128`|


Потоки для очистки устаревших потоков общего дерева слияния. Доступно только в ClickHouse Cloud

## path {#path} 

Путь к директории, содержащей данные.

:::note
Значок наклона обязателен.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```

## postgresql_port {#postgresql_port} 

Порт для связи с клиентами через протокол PostgreSQL.

:::note
- Положительные целые числа определяют номер порта для прослушивания
- Пустые значения используются для отключения связи с клиентами через протокол MySQL.
:::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```

## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`100`|

Размер фона пула для предвыборок для удалённых объектных хранилищ

## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`1000000`|

Количество задач, которые можно поместить в пул предвыборок

## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`10000`|


Максимальное количество заданий, которые можно запланировать в пуле потоков десериализации префиксов.

:::note
Значение `0` означает неограниченное.
:::

## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|


Если установлено в true, ClickHouse создаёт все сконфигурированные таблицы `system.*_log` перед запуском. Это может быть полезно, если некоторые скрипты запуска зависят от этих таблиц.

## primary_index_cache_policy {#primary_index_cache_policy} 

|Тип|По умолчанию|
|---|---|
|`String`|`SLRU`|

Имя политики кэширования первичного индекса.

## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

|Тип|По умолчанию|
|---|---|
|`Double`|`0.95`|

Соотношение общего размера кэша меток для заполнения во время предварительного прогрева.

## primary_index_cache_size {#primary_index_cache_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`5368709120`|

Максимальный размер кэша для первичного индекса (индекс семейств таблиц MergeTree).

## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

|Тип|По умолчанию|
|---|---|
|`Double`|`0.5`|

Размер защищённой очереди (в случае политики SLRU) в кэше первичного индекса относительно общего размера кэша.

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

Экспонирование данных метрик для сбора с [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP конечная точка для сбора метрик сервером prometheus. Начинается с '/'.
- `port` – Порт для `endpoint`.
- `metrics` – Экспонирование метрик из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Экспонирование метрик из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Экспонирование текущих значений метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).
- `errors` - Экспонирование количества ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эта информация также может быть получена из [system.errors](/operations/system-tables/errors).

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

Определение прокси-серверов для HTTP и HTTPS запросов, на данный момент поддерживается хранилищем S3, табличными функциями S3 и URL-функциями.

Существует три способа определения прокси-серверов:
- переменные окружения
- списки прокси
- удалённые резолверы прокси.

Поддерживается обход прокси-серверов для определённых хостов с использованием `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать
прокси-сервер для данного протокола. Если у вас она настроена на вашей системе, это должно работать без проблем.

Это самый простой подход, если для данного протокола есть
только один прокси-сервер и этот прокси-сервер не изменяется.

**Списки прокси**

Этот подход позволяет указать один или несколько
прокси-серверов для протокола. Если определено более одного прокси-сервера,
ClickHouse использует разные прокси на принципе "кругового распределения", балансируя
нагрузку между серверами. Это самый простой подход, если для протокола есть более одного прокси-сервера и список прокси-серверов не меняется.

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

Выберите родительское поле в вкладках ниже, чтобы увидеть их дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле     | Описание                         |
|-----------|-------------------------------------|
| `<http>`  | Список одного или нескольких HTTP-прокси  |
| `<https>` | Список одного или нескольких HTTPS-прокси |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| Поле   | Описание          |
|---------|----------------------|
| `<uri>` | URI прокси |

  </TabItem>
</Tabs>

**Удалённые резолверы прокси**

Возможно, что прокси-серверы изменяются динамически. 
В этом случае вы можете определить конечную точку резолвера. ClickHouse отправляет
пустой GET запрос на эту конечную точку, удалённый резолвер должен вернуть хост прокси.
ClickHouse будет использовать его, чтобы сформировать URI прокси, используя следующий шаблон: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

Выберите родительское поле в вкладках ниже, чтобы увидеть их дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле    | Описание                      |
|----------|----------------------------------|
| `<http>` | Список одного или нескольких резолверов* |
| `<https>` | Список одного или нескольких резолверов* |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| Поле       | Описание                                   |
|-------------|-----------------------------------------------|
| `<resolver>` | Конечная точка и другие детали для резолвера |

:::note
Вы можете иметь несколько элементов `<resolver>`, но используется только первый
`<resolver>` для данного протокола. Любые другие элементы `<resolver>`
для этого протокола игнорируются. Это означает, что балансировка нагрузки
(если это необходимо) должна быть реализована удалённым резолвером.
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| Поле               | Описание                                                                                                                                                                            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | URI резолвера прокси                                                                                                                                                          |
| `<proxy_scheme>`    | Протокол конечного URI прокси. Это может быть либо `http`, либо `https`.                                                                                                             |
| `<proxy_port>`      | Номер порта резолвера прокси                                                                                                                                                  |
| `<proxy_cache_time>` | Время в секундах, на которое значения из резолвера должны кэшироваться ClickHouse. Установка этого значения в `0` вызывает обращение ClickHouse к резолверу для каждого HTTP или HTTPS запроса. |

  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:

| Порядок | Настройка                |
|-------|------------------------|
| 1.    | Удалённые резолверы прокси |
| 2.    | Списки прокси            |
| 3.    | Переменные окружения  |

ClickHouse будет проверять тип резолвера с наивысшим приоритетом для протокола запроса. Если он не определён,
он проверит следующий резолвер с наивысшим приоритетом, пока не дойдёт до резолвера окружения.
Это также позволяет использовать сочетания типов резолверов.

## query_cache {#query_cache} 

[Настройки кэша запросов](../query-cache.md).

Доступны следующие настройки:

| Настройка                   | Описание                                                                            | Значение по умолчанию |
|---------------------------|----------------------------------------------------------------------------------------|---------------|
| `max_size_in_bytes`       | Максимальный размер кэша в байтах. `0` означает, что кэш запросов отключён.                | `1073741824`  |
| `max_entries`             | Максимальное количество результатов запросов `SELECT`, хранящихся в кэше.                      | `1024`        |
| `max_entry_size_in_bytes` | Максимальный размер в байтах, который могут иметь результаты запросов `SELECT`, сохранённые в кэше.    | `1048576`     |
| `max_entry_size_in_rows`  | Максимальное количество строк, которые могут иметь результаты запросов `SELECT`, сохранённые в кэше.   | `30000000`    |

:::note
- Изменённые настройки вступают в силу немедленно.
- Данные для кэша запросов выделяются в DRAM. Если память дефицитна, убедитесь, что установлено небольшое значение для `max_size_in_bytes` или отключите кэш запросов полностью.
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

|Тип|По умолчанию|
|---|---|
|`String`|`SLRU`|

Имя политики кэширования условий запроса.

## query_condition_cache_size {#query_condition_cache_size} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`104857600`|


Максимальный размер кэша условий запроса.
:::note
Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::

## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

|Тип|По умолчанию|
|---|---|
|`Double`|`0.5`|

Размер защищённой очереди (в случае политики SLRU) в кэше условий запроса относительно общего размера кэша.

## query_log {#query_log} 

Настройка для логирования запросов, полученных с помощью настройки [log_queries=1](../../operations/settings/settings.md).

Запросы регистрируются в таблице [system.query_log](/operations/system-tables/query_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и новая таблица создаётся автоматически.

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

Правила на основе Regexp, которые будут применяться к запросам, а также всем сообщениям журнала перед их сохранением в журналах сервера,
[`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) таблицах и в логах, отправляемых клиенту. Это позволяет предотвратить
утечку конфиденциальных данных из SQL-запросов, таких как имена, электронные письма, персональные идентификаторы или номера кредитных карт в логи.

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

| Настройка   | Описание                                                                   |
|-----------|-------------------------------------------------------------------------------|
| `name`    | имя для правила (необязательно)                                                  |
| `regexp`  | Совместимое с RE2 регулярное выражение (обязательно)                               |
| `replace` | строка замещения для конфиденциальных данных (необязательно, по умолчанию - шесть знаков звёздочки) |

Правила маскировки применяются к целому запросу (чтобы предотвратить утечку конфиденциальных данных из неверных / непарсируемых запросов).

В таблице [`system.events`](/operations/system-tables/events) есть счётчик `QueryMaskingRulesMatch`, который показывает общее количество совпадений правил маскировки запросов.

Для распределённых запросов каждый сервер должен быть настроен отдельно, иначе подзапросы, переданные на другие
узлы, будут храниться без маскировки.

## query_metric_log {#query_metric_log} 

По умолчанию отключен.

**Включение**

Чтобы вручную включить сбор истории метрик для [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md), создайте `/etc/clickhouse-server/config.d/query_metric_log.xml` с следующим содержимым:

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

Чтобы отключить настройку `query_metric_log`, вам следует создать следующий файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` с следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>

## query_thread_log {#query_thread_log} 

Настройка для логирования потоков запросов, полученных с помощью настройки [log_query_threads=1](/operations/settings/settings#log_query_threads).

Запросы регистрируются в таблице [system.query_thread_log](/operations/system-tables/query_thread_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

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

## query_views_log {#query_views_log} 

Настройка для логирования представлений (живых, материализованных и т.д.), зависимых от запросов, полученных с помощью настройки [log_query_views=1](/operations/settings/settings#log_query_views).

Запросы регистрируются в таблице [system.query_views_log](/operations/system-tables/query_views_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала представлений запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и новая таблица создаётся автоматически.

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

Настройка для перераспределения памяти для машинного кода ("текста") с использованием огромных страниц.

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

**Смотрите также**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Обнаружение кластера](../../operations/cluster-discovery.md)
- [Движок реплицированной базы данных](../../engines/database-engines/replicated.md)

## remote_url_allow_hosts {#remote_url_allow_hosts} 

Список хостов, которые могут быть использованы в движках хранения и табличных функциях, связанных с URL.

При добавлении хоста с помощью XML-тега `\<host\>`:
- он должен быть указан точно так же, как в URL, так как имя проверяется перед разрешением DNS. Например: `<host>clickhouse.com</host>`
- если порт явно указан в URL, тогда проверяется host:port целиком. Например: `<host>clickhouse.com:80</host>`
- если хост указан без порта, то разрешается любой порт хоста. Например: если указан `<host>clickhouse.com</host>`, тогда разрешены `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т.д.
- если хост указан как IP-адрес, тогда он проверяется так, как указано в URL. Например: `[2a02:6b8:a::a]`.
- если есть перенаправления и поддержка перенаправлений включена, тогда каждое перенаправление (поле location) проверяется.

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```

## replica_group_name {#replica_group_name} 

Имя группы реплик для базы данных Replicated.

Кластер, созданный реплицированной базой данных, будет состоять из реплик в одной и той же группе.
DDL-запросы будут ожидать только реплики в одной и той же группе.

По умолчанию пусто.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```

## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`0`|

Тайм-аут HTTP-соединения для запросов извлечения частей. Наследуется от профиля по умолчанию `http_connection_timeout`, если не установлен явно.

## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`0`|

Тайм-аут приёма HTTP для запросов извлечения частей. Наследуется от профиля по умолчанию `http_receive_timeout`, если не установлен явно.

## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

|Тип|По умолчанию|
|---|---|
|`Seconds`|`0`|

Тайм-аут отправки HTTP для запросов извлечения частей. Наследуется от профиля по умолчанию `http_send_timeout`, если не установлен явно.

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

|Тип|По умолчанию|
|---|---|
|`UInt64`|`16`|

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

Настройки для отправки отчётов об ошибках команде разработчиков ClickHouse через [Sentry](https://sentry.io).

Включение этой функции, особенно в пред-производственных средах, очень рекомендуется.

Серверу потребуется доступ к общему Интернету через IPv4 (на момент написания IPv6 не поддерживается Sentry), чтобы эта функция работала правильно.

Ключи:

| Ключ                   | Описание                                                                                                                                                                                            |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | Логический флаг для включения функции, по умолчанию `false`. Установите значение `true`, чтобы разрешить отправку отчётов об ошибках.                                                                 |
| `send_logical_errors` | `LOGICAL_ERROR` подобен `assert`, это ошибка в ClickHouse. Этот логический флаг позволяет отправлять эти исключения в Sentry (по умолчанию: `false`).                                                  |
| `endpoint`            | Вы можете переопределить URL-адрес конечной точки Sentry для отправки отчетов об ошибках. Это может быть либо отдельная учётная запись Sentry, либо ваш собственный экземпляр Sentry. Используйте синтаксис [Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=native#configure-the-sdk).                               |
| `anonymize`           | Избегайте прикрепления имени хоста сервера к отчёту об ошибках.                                                                                                                                               |
| `http_proxy`          | Настройка HTTP-прокси для отправки отчётов об ошибках.                                                                                                                                                        |
| `debug`               | Устанавливает Sentry клиент в режим отладки.                                                                                                                                                                |
| `tmp_path`            | Путь на файловой системе для временного состояния отчёта об ошибках.                                                                                                                                                      |
| `environment`         | Произвольное имя окружения, в котором работает сервер ClickHouse. Оно будет указано в каждом отчете об ошибках. Значение по умолчанию - `test` или `prod`, в зависимости от версии ClickHouse. |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```

## series_keeper_path {#series_keeper_path} 

|Тип|По умолчанию|
|---|---|
|`String`|`/clickhouse/series`|


Путь в Keeper с автоинкрементными номерами, которые генерируются функцией `generateSerialID`. Каждая серия будет узлом под этим путём.

## show_addresses_in_stack_traces {#show_addresses_in_stack_traces} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|

Если установлено в true, будет отображать адреса в стеке вызовов.

## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|

Если установлено в true, ClickHouse будет ждать завершения текущих резервных копий и восстанавливаний перед завершением работы.

## shutdown_wait_unfinished {#shutdown_wait_unfinished} 

|Тип|По умолчанию|
|---|---|
|`UInt64`|`5`|

Задержка в секундах для ожидания незавершённых запросов.

## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`0`|

Если установлено в true, ClickHouse будет ждать завершения выполняющихся запросов перед завершением работы.

## ssh_server {#ssh_server} 

Публичная часть ключа хоста будет записана в файл known_hosts
на стороне клиента SSH при первом подключении.

Конфигурации ключей хоста по умолчанию неактивны.
Закомментируйте конфигурации ключей хоста и предоставьте путь к соответствующему ssh-ключу, чтобы активировать их:

Пример:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```

## storage_configuration {#storage_configuration} 

Позволяет настроить много-дисковую конфигурацию хранения.

Конфигурация хранения имеет следующую структуру:

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

Конфигурация `disks` следует приведённой ниже структуре:

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
|-------------------------|-------------------------------------------------------------------------------------------------------|
| `<disk_name_N>`         | Имя диска, которое должно быть уникальным.                                                         |
| `path`                  | Путь, по которому будет храниться серверные данные (каталоги `data` и `shadow`). Должен заканчиваться `/` |
| `keep_free_space_bytes` | Размер зарезервированного свободного пространства на диске.                                                              |

:::note
Порядок дисков не имеет значения.
:::
### Конфигурация политик {#configuration-of-policies}

Подтеги выше определяют следующие настройки для `policies`:

| Настройка                   | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`             | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `volume_name_N`             | Имя тома. Имена томов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `disk`                      | Диск, расположенный внутри тома.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes`   | Максимальный размер части данных, который может находиться на любом из дисков в этом томе. Если слияние приведет к размеру части, ожидаемому больше чем `max_data_part_size_bytes`, эта часть будет записана на следующий том. По сути, эта функция позволяет вам хранить новые / маленькие части на горячем (SSD) томе и перемещать их на холодный (HDD) том, когда они достигают крупного размера. Не используйте этот вариант, если у политики только один том.                |
| `move_factor`               | Доля доступного свободного места на томе. Если пространство становится меньше, данные начнут передаваться на следующий том, если он есть. Для передачи части сортируются по размеру от большего к меньшему (по убыванию), и выбираются части, общий размер которых достаточен для соблюдения условия `move_factor`. Если общий размер всех частей недостаточен, все части будут перемещены.                                                                                                             |
| `perform_ttl_move_on_insert`| Отключает перемещение данных с истекшим TTL при вставке. По умолчанию (если включено), если мы вставляем кусок данных, который уже истек в соответствии с правилом перемещения в течение срока жизни, он немедленно перемещается на том / диске, указанном в правиле перемещения. Это может значительно замедлить вставку в случае, если целевой том / диск медленный (например, S3). Если отключено, истекшая часть данных записывается на стандартный том, а затем немедленно перемещается на том, указанном в правиле для истекшего TTL.|
| `load_balancing`            | Политика балансировки дисков, `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`         | Устанавливает таймаут (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - всегда обновлять, `-1` - никогда не обновлять, значение по умолчанию `60000`). Обратите внимание, если диск используется только ClickHouse и не будет подвергаться изменению размера файловой системы в реальном времени, вы можете использовать значение `-1`. В противном случае это не рекомендуется, так как в конечном итоге приведет к неправильному распределению пространства.                     |
| `prefer_not_to_merge`       | Отключает слияние частей данных на этом томе. Заметьте: это потенциально вредно и может вызвать замедление. Когда эта настройка включена (не делайте этого), слияние данных на этом томе запрещено (что плохо). Это позволяет контролировать, как ClickHouse взаимодействует с медленными дисками. Мы рекомендуем вообще не использовать это.                                                                                                                                                                   |
| `volume_priority`           | Определяет приоритет (порядок) заполнения томов. Чем меньше значение, тем выше приоритет. Значения параметров должны быть натуральными числами и охватывать диапазон от 1 до N (N - наибольшее указанное значение параметра) без разрывов.                                                                                                                                                                                                                                                                |

Для `volume_priority`:
- Если все тома имеют этот параметр, они сортируются в указанном порядке.
- Если только _некоторые_ тома имеют его, то тома, которые его не имеют, имеют наименьший приоритет. Те, которые его имеют, сортируются в соответствии со значением тега, приоритет остальных определяется порядком описания в файле конфигурации относительно друг друга.
- Если _ни один_ том не имеет этого параметра, их порядок определяется порядком описания в файле конфигурации.
- Приоритет томов может не быть идентичным.

## storage_connections_soft_limit {#storage_connections_soft_limit} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `UInt64`| `100`               |

Соединения выше этого лимита имеют значительно более короткий срок жизни. Лимит применяется к соединениям с хранилищами.

## storage_connections_store_limit {#storage_connections_store_limit} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `UInt64`| `5000`              |

Соединения выше этого лимита сбрасываются после использования. Установите в `0`, чтобы отключить кэш соединений. Лимит применяется к соединениям с хранилищами.

## storage_connections_warn_limit {#storage_connections_warn_limit} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `UInt64`| `1000`              |

Предупреждающие сообщения записываются в журналы, если количество используемых соединений превышает этот лимит. Лимит применяется к соединениям с хранилищами.

## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `Bool`  | `0`                 |

Записывать файлы метаданных диска в формате VERSION_FULL_OBJECT_KEY.

## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `Bool`  | `1`                 |

Если включено, внутренний UUID генерируется при создании SharedSet и SharedJoin. Только ClickHouse Cloud.

## table_engines_require_grant {#table_engines_require_grant} 

Если установлено в `true`, пользователям требуется разрешение для создания таблицы с конкретным движком, например, `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию, для обратной совместимости создание таблицы с конкретным движком таблицы игнорирует разрешение, однако вы можете изменить это поведение, установив значение в `true`.
:::

## tables_loader_background_pool_size {#tables_loader_background_pool_size} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `UInt64`| `0`                 |

Устанавливает количество потоков, выполняющих асинхронные задачи загрузки в фоновом режиме. Фоновый пул используется для загрузки таблиц асинхронно после запуска сервера, в случае если нет ожидающих запросов к таблице. Может быть полезно поддерживать небольшое количество потоков в фоновом пуле, если много таблиц. Это зарезервирует ресурсы CPU для параллельного выполнения запросов.

:::note
Значение `0` означает, что будут использоваться все доступные CPU.
:::

## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `UInt64`| `0`                 |

Устанавливает количество потоков, выполняющих задачи загрузки в переднем пуле. Передний пул используется для синхронной загрузки таблицы перед началом прослушивания порта сервером и для загрузки таблиц, которые ожидаются. Передний пул имеет более высокий приоритет, чем фоновый пул. Это означает, что ни одна задача не начинается в фоновом пуле, пока в переднем пуле выполняются задачи.

:::note
Значение `0` означает, что будут использоваться все доступные CPU.
:::

## tcp_port {#tcp_port} 

Порт для общения с клиентами по протоколу TCP.

**Пример**

```xml
<tcp_port>9000</tcp_port>
```

## tcp_port_secure {#tcp_port_secure} 

TCP порт для безопасной связи с клиентами. Используйте его с настройками [OpenSSL](#openssl).

**Значение по умолчанию**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```

## tcp_ssh_port {#tcp_ssh_port} 

Порт для SSH сервера, который позволяет пользователю подключаться и выполнять запросы в интерактивном режиме, используя встроенный клиент через PTY.

**Пример:**

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```

## temporary_data_in_cache {#temporary_data_in_cache} 

С этим параметром временные данные будут храниться в кэше для конкретного диска.
В этом разделе вы должны указать имя диска с типом `cache`.
В этом случае кэш и временные данные будут делить одно и то же пространство, и кэш диска может быть удален для создания временных данных.

:::note
Можно использовать только один вариант для настройки хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
:::

**Пример**

Как для кэша `local_disk`, так и временные данные будут храниться в `/tiny_local_cache` в файловой системе, управляемой `tiny_local_cache`.

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

| Настройка | Описание                                                                                                                                                                                                      | Значение по умолчанию |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| `level`   | Максимальный уровень сообщения (по умолчанию `Trace`), который будет храниться в таблице.                                                                                                                  | `Trace`               |

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

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `UInt64`| `10000`             |

Максимальное количество задач, которые могут быть запланированы в глобальном пуле потоков. Увеличение размера очереди приводит к большему использованию памяти. Рекомендуется поддерживать это значение равным [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size).

:::note
Значение `0` означает неограниченно.
:::

**Пример**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```

## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `UInt64`| `100`               |

Размер фона пула для записей запросов к объектным хранилищам.

## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `UInt64`| `1000000`           |

Количество задач, которые можно добавить в фоновый пул для записей запросов к объектным хранилищам.

## throw_on_unknown_workload {#throw_on_unknown_workload} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `Bool`  | `0`                 |

Определяет поведение при доступе к неизвестной рабочей нагрузке с настройкой запроса 'workload'.

- Если `true`, выбрасывается исключение RESOURCE_ACCESS_DENIED из запроса, пытающегося получить доступ к неизвестной рабочей нагрузке. Полезно для обеспечения планирования ресурсов для всех запросов после того, как иерархия WORKLOAD установлена и содержит WORKLOAD по умолчанию.
- Если `false` (по умолчанию), неограниченный доступ без планирования ресурсов предоставляется запросу с настройкой 'workload', указывающей на неизвестную рабочую нагрузку. Это важно во время настройки иерархии WORKLOAD, до добавления WORKLOAD по умолчанию.

**Пример**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**См. также**
- [Планирование рабочей нагрузки](/operations/workload-scheduling.md)

## timezone {#timezone} 

Часовой пояс сервера.

Указывается как идентификатор IANA для часового пояса UTC или географического местоположения (например, Africa/Abidjan).

Часовой пояс необходим для преобразований между строковыми и форматами DateTime, когда поля DateTime выводятся в текстовом формате (печатаются на экране или в файл) и при получении DateTime из строки. Кроме того, часовой пояс используется в функциях, которые работают с временем и датой, если они не получили часовой пояс в входных параметрах.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**См. также**

- [session_timezone](../settings/settings.md#session_timezone)

## tmp_path {#tmp_path} 

Путь в локальной файловой системе для хранения временных данных для обработки больших запросов.

:::note
- Можно использовать только один вариант для настройки хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- Заключительный слэш обязателен.
:::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```

## tmp_policy {#tmp_policy} 

Политика для хранения с временными данными. Для получения дополнительной информации см. документацию [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree).

:::note
- Можно использовать только один вариант для настройки хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
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

Определяет список пользовательских доменов верхнего уровня, которые необходимо добавить, где каждый элемент имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

См. также:
- функция [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) и ее вариации,
  которая принимает имя пользовательского списка TLD, возвращая часть домена, которая включает верхние поддомены до первого значительного поддомена.

## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `UInt64`| `0`                 |

Собирать случайные аллокации размером меньше или равным указанному значению с вероятностью, равной `total_memory_profiler_sample_probability`. 0 означает отключение. Вы можете установить 'max_untracked_memory' в 0, чтобы этот порог работал как ожидалось.

## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `UInt64`| `0`                 |

Собирать случайные аллокации размером больше или равным указанному значению с вероятностью, равной `total_memory_profiler_sample_probability`. 0 означает отключение. Вы можете установить 'max_untracked_memory' в 0, чтобы этот порог работал как ожидалось.

## total_memory_profiler_step {#total_memory_profiler_step} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `UInt64`| `0`                 |

Каждый раз, когда использование памяти сервером превышает каждый следующий шаг в байтах, профилировщик памяти соберет стек трассировки аллокации. Ноль означает отключение профилировщика памяти. Значения ниже нескольких мегабайт замедлят сервер.

## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `Double`| `0`                 |

Позволяет собирать случайные аллокации и деаллокации и записывать их в системную таблицу [system.trace_log](../../operations/system-tables/trace_log.md) с `trace_type`, равным `MemorySample`, с указанной вероятностью. Вероятность касается каждой аллокации или деаллокации, независимо от размера аллокации. Обратите внимание, что выборка происходит только тогда, когда количество непроверенной памяти превышает лимит непроверенной памяти (значение по умолчанию — `4` MiB). Его можно уменьшить, если [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step) уменьшить. Вы можете установить `total_memory_profiler_step` равным `1` для более тонкой выборки.

Возможные значения:

- Положительное целое число.
- `0` — Запись случайных аллокаций и деаллокаций в системную таблицу `system.trace_log` отключена.

## trace_log {#trace_log} 

Настройки для системной таблицы [trace_log](/operations/system-tables/trace_log) операции.

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

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `String`| `SLRU`              |

Имя политики для неупакованного кэша.

## uncompressed_cache_size {#uncompressed_cache_size} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `UInt64`| `0`                 |

Максимальный размер (в байтах) для неупакованных данных, используемых движками таблиц из семейства MergeTree.

Существует один общий кэш для сервера. Память выделяется по мере необходимости. Кэш используется, если опция `use_uncompressed_cache` включена.

Неупакованный кэш выгоден для очень коротких запросов в отдельных случаях.

:::note
Значение `0` означает отключение.

Эту настройку можно изменить во время работы, и она вступит в силу немедленно.
:::

## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `Double`| `0.5`               |

Размер защищенной очереди (в случае политики SLRU) в неупакованном кэше относительно общего размера кэша.

## url_scheme_mappers {#url_scheme_mappers} 

Конфигурация для перевода сокращенных или символических префиксов URL в полные URL.

**Пример:**

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

Метод хранения заголовков данных в ZooKeeper. Эта настройка применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Указать можно:

**Глобально в разделе [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует настройку для всех таблиц на сервере. Вы можете изменить настройку в любое время. Существующие таблицы изменяют свое поведение при изменении настройки.

**Для каждой таблицы**

При создании таблицы указывайте соответствующую [настройку движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этой настройкой не изменяется, даже если глобальная настройка изменится.

**Возможные значения**

- `0` — Функциональность отключена.
- `1` — Функциональность включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), тогда [реплицированные](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки частей данных компактно, используя один `znode`. Если в таблице много колонок, этот метод хранения значительно уменьшает объем данных, хранящихся в ZooKeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` вы не сможете понизить версию сервера ClickHouse до версии, которая не поддерживает эту настройку. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все серверы одновременно. Безопаснее протестировать новые версии ClickHouse в тестовой среде или на нескольких серверах кластера.

Заголовки частей данных, уже сохраненные с этой настройкой, не могут быть восстановлены до их предыдущего (не компактного) представления.
:::

## user_defined_executable_functions_config {#user_defined_executable_functions_config} 

Путь к файлу конфигурации для исполняемых пользовательских определяемых функций.

Путь:

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать символы подстановки \* и ?.

См. также:
- "[Исполняемые Пользовательские Определяемые Функции](/sql-reference/functions/udf#executable-user-defined-functions).".

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```

## user_defined_path {#user_defined_path} 

Каталог с пользовательскими определяемыми файлами. Используется для SQL пользовательских определяемых функций [SQL User Defined Functions](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```

## user_directories {#user_directories} 

Раздел файла конфигурации, который содержит настройки:
- Путь к файлу конфигурации с предопределенными пользователями.
- Путь к папке, где хранятся пользователи, созданные SQL-командами.
- Путь к узлу ZooKeeper, где хранятся и реплицируются пользователи, созданные SQL-командами (экспериментально).

Если этот раздел указан, путь из [users_config](/operations/server-configuration-parameters/settings#users_config) и [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) не будут использоваться.

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

Вы также можете определить секции `memory` — означает хранение информации только в памяти, без записи на диск, и `ldap` — означает хранение информации на LDAP-сервере.

Чтобы добавить LDAP-сервер в качестве удаленного каталога пользователей, не определенных локально, определите единую секцию `ldap` со следующими настройками:

| Настройка | Описание                                                                                                                                                                                                                                      |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server`  | одно из имен LDAP-серверов, определенных в разделе конфигурации `ldap_servers`. Этот параметр обязателен и не может быть пустым.                                                                                                         |
| `roles`   | секция со списком локально определенных ролей, которые будут назначены каждому пользователю, извлеченному с LDAP-сервера. Если роли не указаны, пользователь не сможет выполнять никаких действий после аутентификации.                          |

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

Каталог с пользовательскими скриптами. Используется для исполняемых пользовательских определяемых функций [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).

**Пример**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

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

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `Bool`  | `0`                 |

Определяет, включена ли валидация информации клиента при получении пакета запроса.

По умолчанию это `false`:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```

## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `UInt64`| `10000000`          |

Размер кэша для индекса векторного сходства в записях. Ноль означает отключение.

## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `String`| `SLRU`              |

Имя политики кэша для индекса векторного сходства.

## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `UInt64`| `5368709120`        |

Размер кэша для индексов векторного сходства. Ноль означает отключение.

:::note
Эту настройку можно изменить во время работы, и она вступит в силу немедленно.
::: 

## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio} 

| Тип     | Значение по умолчанию |
|---------|---------------------|
| `Double`| `0.5`               |

Размер защищенной очереди (в случае политики SLRU) в кэше индекса векторного сходства относительно общего размера кэша.
## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup} 

|Тип|По умолчанию|
|---|---|
|`Bool`|`1`|


Эта настройка позволяет указать поведение, если `dictionaries_lazy_load` равно `false`.
(Если `dictionaries_lazy_load` равно `true`, эта настройка ничего не изменяет.)

Если `wait_dictionaries_load_at_startup` равно `false`, то сервер
начнет загружать все словари при запуске и будет принимать соединения параллельно с этой загрузкой.
Когда словарь используется в запросе в первый раз, запрос будет ждать, пока словарь не будет загружен, если он еще не загружен.
Установка `wait_dictionaries_load_at_startup` в значение `false` может сделать запуск ClickHouse быстрее, однако некоторые запросы могут выполняться медленнее
(потому что им придется ждать загрузки некоторых словарей).

Если `wait_dictionaries_load_at_startup` равно `true`, то сервер будет ждать при запуске
пока все словари не завершат свою загрузку (успешно или нет) перед тем, как принять какие-либо соединения.

**Пример**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```
## workload_path {#workload_path} 

Директория, используемая в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется папка `/workload/` в рабочей директории сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**Смотрите также**
- [Иерархия Рабочих Нагрузок](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path} 

Путь к узлу ZooKeeper, который используется в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для согласованности все SQL определения хранятся в качестве значения этого единственного znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**Смотрите также**
- [Иерархия Рабочих Нагрузок](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
## zookeeper {#zookeeper} 

Содержит настройки, которые позволяют ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицированных таблиц. Если реплицированные таблицы не используются, этот раздел параметров можно опустить.

Следующие настройки могут быть настроены с помощью подметок:

| Настройка                                | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                   | Конечная точка ZooKeeper. Вы можете установить несколько конечных точек. Например, `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` указывает порядок узлов при попытке подключиться к кластеру ZooKeeper.                                                                                                                                                                                                                                                                                            |
| `session_timeout_ms`                     | Maximum timeout for the client session in milliseconds.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `operation_timeout_ms`                   | Maximum timeout for one operation in milliseconds.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `root` (опционально)                    | Znode, который используется в качестве корня для znodes, используемых сервером ClickHouse.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `fallback_session_lifetime.min` (опционально) | Минимальный предел для продолжительности сессии zookeeper для резервного узла, когда основной недоступен (балансировка нагрузки). Установка в секундах. По умолчанию: 3 часа.                                                                                                                                                                                                                                                                                                                                                              |
| `fallback_session_lifetime.max` (опционально) | Максимальный предел для продолжительности сессии zookeeper для резервного узла, когда основной недоступен (балансировка нагрузки). Установка в секундах. По умолчанию: 6 часов.                                                                                                                                                                                                                                                                                                                                                              |
| `identity` (опционально)                | Имя пользователя и пароль, требуемые ZooKeeper для доступа к запрашиваемым znodes.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `use_compression` (опционально)         | Включает сжатие в протоколе Keeper, если установлено в true.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

Также существует настройка `zookeeper_load_balancing` (опционально), которая позволяет выбрать алгоритм выбора узла ZooKeeper:

| Название Алгоритма                     | Описание                                                                                                                    |
|-----------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `random`                               | случайным образом выбирает один из узлов ZooKeeper.                                                                       |
| `in_order`                             | выбирает первый узел ZooKeeper, если он недоступен, то второй и так далее.                                               |
| `nearest_hostname`                     | выбирает узел ZooKeeper с именем хоста, наиболее похожим на имя хоста сервера, имя хоста сравнивается с префиксом имени. |
| `hostname_levenshtein_distance`        | как nearest_hostname, но сравнивает имя хоста с учетом расстояния Левенштейна.                                           |
| `first_or_random`                      | выбирает первый узел ZooKeeper, если он недоступен, то случайным образом выбирает один из оставшихся узлов ZooKeeper.    |
| `round_robin`                          | выбирает первый узел ZooKeeper, если происходит повторное подключение, выбирает следующий.                                |

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
    <!-- Опционально. Суффикс Chroot. Должен существовать. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Опционально. Строка ACL для zookeeper digest. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**Смотрите также**

- [Репликация](../../engines/table-engines/mergetree-family/replication.md)
- [Руководство программиста ZooKeeper](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [Опциональная защищенная связь между ClickHouse и Zookeeper](/operations/ssl-zookeeper)
