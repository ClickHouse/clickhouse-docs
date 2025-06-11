---
description: 'В этом разделе содержатся описания настроек сервера, т.е. настроек, которые нельзя изменить на уровне сессии или запроса.'
keywords: ['глобальные настройки сервера']
sidebar_label: 'Настройки сервера'
sidebar_position: 57
slug: /operations/server-configuration-parameters/settings
title: 'Настройки сервера'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/i18n/docusaurus-plugin-content-docs/ru/current/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';

# Настройки сервера

В этом разделе содержатся описания настроек сервера. Эти настройки не могут быть изменены на уровне сессии или запроса.

Для получения дополнительной информации о файлах конфигурации в ClickHouse смотрите [""Файлы конфигурации""](/operations/configuration-files).

Другие настройки описаны в разделе ""[Настройки](/operations/settings/overview)"".
Перед изучением настроек рекомендуется ознакомиться с разделом [Файлы конфигурации](/operations/configuration-files) и обратить внимание на использование подстановок (атрибуты `incl` и `optional`).
## access_control_improvements {#access_control_improvements} 

Настройки для несущественных улучшений в системе контроля доступа.

| Настройка                                         | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Значение по умолчанию |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `users_without_row_policies_can_read_rows`      | Устанавливает, могут ли пользователи без разрешающих политик на уровне строк все равно читать строки с помощью запроса `SELECT`. Например, если есть два пользователя А и Б, и политика строк определена только для А, тогда если эта настройка истинна, пользователь Б увидит все строки. Если эта настройка ложна, пользователь Б не увидит никаких строк.                                                                                                                                                                                                                    | `true`              |
| `on_cluster_queries_require_cluster_grant`      | Устанавливает, требуют ли запросы `ON CLUSTER` грант `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `true`              |
| `select_from_system_db_requires_grant`          | Устанавливает, требует ли `SELECT * FROM system.<table>` какие-либо гранты и может ли он быть выполнен любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON system.<table>` так же, как и для не_system таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые постоянные таблицы, такие как `one`, `contributors`) по-прежнему доступны для всех; и если есть привилегия `SHOW` (например, `SHOW USERS`), соответствующая системная таблица (т.е. `system.users`) будет доступна. | `true`              |
| `select_from_information_schema_requires_grant` | Устанавливает, требует ли `SELECT * FROM information_schema.<table>` какие-либо гранты и может ли он быть выполнен любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON information_schema.<table>`, так же как для обычных таблиц.                                                                                                                                                                                                                                                                                 | `true`              |
| `settings_constraints_replace_previous`         | Устанавливает, будет ли ограничение в профиле настроек для некоторого параметра отменять действия предыдущего ограничения (определенного в других профилях) для этого параметра, включая поля, которые не установлены новым ограничением. Также позволяет использовать тип ограничения `changeable_in_readonly`.                                                                                                                                                                                                                            | `true`              |
| `table_engines_require_grant`                   | Устанавливает, требует ли создание таблицы с определенным движком таблицы грант.                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false`             |
| `role_cache_expiration_time_seconds`            | Устанавливает количество секунд с момента последнего доступа, в течение которых роль хранится в кэше ролей.                                                                                                                                                                                                                                                                                                                                                                                                                           | `600`               |

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

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />Действие, выполняемое, когда максимальный размер элемента массива превышен в groupArray: `throw` исключение или `discard` дополнительные значения.
## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

<SettingsInfoBlock type="UInt64" default_value="16777215" />Максимальный размер элемента массива в байтах для функции groupArray. Этот предел проверяется при сериализации и помогает избежать большого размера состояния.
## allow_feature_tier {#allow_feature_tier} 

<SettingsInfoBlock type="UInt32" default_value="0" />
Управляет, может ли пользователь изменять настройки, относящиеся к различным уровням функций.

- `0` - Изменения любой настройки разрешены (экспериментальные, бета, производственные).
- `1` - Разрешены только изменения настроек бета и производственных функций. Изменения экспериментальных настроек отклоняются.
- `2` - Разрешены только изменения производственных настроек. Изменения экспериментальных или бета-настроек отклоняются.

Это эквивалентно установке ограничения только для чтения на все функции `EXPERIMENTAL` / `BETA`.

:::note
Значение `0` означает, что все настройки могут быть изменены.
:::
## allow_implicit_no_password {#allow_implicit_no_password} 

Запрещает создание пользователя без пароля, если не указано явно 'IDENTIFIED WITH no_password'.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## allow_no_password {#allow_no_password} 

Устанавливает, разрешен ли небезопасный тип пароля no_password.

```xml
<allow_no_password>1</allow_no_password>
```
## allow_plaintext_password {#allow_plaintext_password} 

Устанавливает, разрешены ли небезопасные типы паролей в открытом виде.

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```
## allow_use_jemalloc_memory {#allow_use_jemalloc_memory} 

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает использование памяти jemalloc.
## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

<SettingsInfoBlock type="Bool" default_value="1" />Если истинно, очередь асинхронных вставок очищается при корректном завершении работы.
## async_insert_threads {#async_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которые фактически будут парсить и вставлять данные в фоновом режиме. Ноль означает, что асинхронный режим отключен.
## async_load_databases {#async_load_databases} 

<SettingsInfoBlock type="Bool" default_value="1" />
Асинхронная загрузка баз данных и таблиц.

- Если `true`, все не системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружены асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, пытающийся получить доступ к таблице, которая еще не загружена, будет ждать, пока эта таблица не будет запущена. Если работа загрузки не удалась, запрос выдаст ошибку (вместо прекращения работы всего сервера, если `async_load_databases = false`). Таблица, на которую ждут хотя бы один запрос, будет загружена с более высоким приоритетом. DDL-запросы для базы данных будут ждать, пока именно эта база данных не будет запущена. Также рекомендуется установить лимит `max_waiting_queries` для общего числа ожидающих запросов.
- Если `false`, все базы данных загружаются при запуске сервера.

**Пример**

```xml
<async_load_databases>true</async_load_databases>
```
## async_load_system_database {#async_load_system_database} 

<SettingsInfoBlock type="Bool" default_value="0" />
Асинхронная загрузка системных таблиц. Полезно, если существует большое количество логов таблиц и частей в базе данных `system`. Независимо от настройки `async_load_databases`.

- Если установлено в `true`, все системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружены асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, пытающийся получить доступ к системной таблице, которая еще не загружена, будет ждать, пока эта таблица не будет запущена. Таблица, на которую ждут хотя бы один запрос, будет загружена с более высоким приоритетом. Также рекомендуется установить настройку `max_waiting_queries`, чтобы ограничить общее количество ожидающих запросов.
- Если установлено в `false`, системная база данных загружается до запуска сервера.

**Пример**

```xml
<async_load_system_database>true</async_load_system_database>
```
## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="120" />Период в секундах для обновления тяжелых асинхронных метрик.
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

Включен по умолчанию в развертываниях ClickHouse Cloud.

Если настройка по умолчанию не включена в вашей среде, в зависимости от способа установки ClickHouse, выполните следующие действия, чтобы включить или отключить ее.

**Включение**

Чтобы вручную включить сбор истории асинхронных метрик [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md), создайте `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` с следующим содержимым:

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

Чтобы отключить настройку `asynchronous_metric_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` с следующим содержимым:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## asynchronous_metrics_enable_heavy_metrics {#asynchronous_metrics_enable_heavy_metrics} 

<SettingsInfoBlock type="Bool" default_value="0" />Включает расчет тяжелых асинхронных метрик.
## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="1" />Период в секундах для обновления асинхронных метрик.
## auth_use_forwarded_address {#auth_use_forwarded_address} 

Использовать исходящий адрес для аутентификации клиентов, подключенных через прокси.

:::note
Эту настройку следует использовать с особой осторожностью, так как перенаправленные адреса могут быть легко подделаны. Серверы, принимающие такую аутентификацию, не должны быть доступны напрямую, а только через доверенный прокси.
:::
## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которые будут использоваться для выполнения операций слива для [таблиц с движком Buffer](/engines/table-engines/special/buffer) в фоновом режиме.
## background_common_pool_size {#background_common_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Максимальное количество потоков, которые будут использоваться для выполнения различных операций (в основном сборка мусора) для таблиц с [*MergeTree-движком](/engines/table-engines/mergetree-family) в фоновом режиме.
## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которые будут использоваться для выполнения распределенных отправок.
## background_fetches_pool_size {#background_fetches_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которые будут использоваться для получения частей данных от другой реплики для [*MergeTree-движка](/engines/table-engines/mergetree-family) таблиц в фоновом режиме.
## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />
Устанавливает соотношение между количеством потоков и количеством фоновых слияний и мутаций, которые могут выполняться одновременно.

Например, если соотношение равно 2, а [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) установлено в 16, то ClickHouse может выполнять 32 фоновых слияния одновременно. Это возможно, потому что фоновые операции могут приостанавливаться и откладываться. Это необходимо, чтобы дать небольшим слияниям больше приоритета в выполнении.

:::note
Это соотношение можно увеличивать только во время работы. Чтобы уменьшить его, необходимо перезапустить сервер.

Как и настройка [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size), [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) может применяться из профиля `default` для обратной совместимости.
:::
## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

<SettingsInfoBlock type="String" default_value="round_robin" />
Политика планирования фоновых слияний и мутаций. Возможные значения: `round_robin` и `shortest_task_first`.

Алгоритм, используемый для выбора следующего слияния или мутации, который будет выполняться пулом фоновых потоков. Политику можно изменять во время работы без перезапуска сервера.
Может применяться из профиля `default` для обратной совместимости.

Возможные значения:

- `round_robin` — Каждое concurrent слияние и мутация выполняются в порядке очереди, чтобы обеспечить бесперебойную работу. Меньшие слияния завершаются быстрее, чем большие, просто потому, что у них меньше блоков для слияния.
- `shortest_task_first` — Всегда выполняйте меньшее слияние или мутацию. Слияния и мутации получают приоритеты на основе их итогового размера. Слияния с меньшими размерами строго предпочтительнее больших. Эта политика обеспечивает максимально быстрое слияние мелких частей, но может привести к неопределенной задержке больших слияний в секциях, перегруженных `INSERT`.
## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которые будут использоваться для выполнения фоновых операций для потоковой передачи сообщений.
## background_move_pool_size {#background_move_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Максимальное количество потоков, которые будут использоваться для перемещения частей данных на другой диск или объем для таблиц с *MergeTree-движком в фоновом режиме.
## background_pool_size {#background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />
Устанавливает количество потоков, выполняющих фоновое слияние и мутации для таблиц с движками MergeTree.

:::note
- Эта настройка также может применяться при запуске сервера из конфигурации профиля `default` для обратной совместимости при запуске сервера ClickHouse.
- Вы можете увеличивать количество потоков только во время работы.
- Чтобы уменьшить количество потоков, необходимо перезапустить сервер.
- Настраивая эту настройку, вы управляете загрузкой CPU и диска.
:::

:::danger
Меньший размер пула использует меньше ресурсов CPU и диска, но фоновые процессы продвигаются медленнее, что в конечном итоге может повлиять на производительность запросов.
:::

Перед изменением обратите внимание на связанные настройки MergeTree, такие как:
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).

**Пример**

```xml
<background_pool_size>16</background_pool_size>
```
## background_schedule_pool_size {#background_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="512" />Максимальное количество потоков, которые будут использоваться для постоянно выполнения некоторых легковесных периодических операций для реплицированных таблиц, потоковой передачи Kafka и обновлений кэша DNS.
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

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков для выполнения запросов `BACKUP`.
## backups {#backups} 

Настройки для резервных копий, используемых при записи `BACKUP TO File()`.

Следующие настройки могут быть настроены через подпараметры:

| Настройка                             | Описание                                                                                                                                                                    | Значение по умолчанию |
|-------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `allowed_path`                      | Путь к резервной копии при использовании `File()`. Эта настройка должна быть установлена, чтобы использовать `File`. Путь может быть относительным к директории экземпляра или абсолютным.              | `true`              |
| `remove_backup_files_after_failure` | Если команда `BACKUP` не удается, ClickHouse попытается удалить файлы, которые были ранее скопированы в резервную копию до сбоя, в противном случае оставит скопированные файлы без изменений. | `true`              |

Эта настройка по умолчанию настраивается следующим образом:

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальное количество задач, которые могут быть запланированы в пуле потоков ввода-вывода резервных копий. Рекомендуется сохранять эту очередь неограниченной из-за текущей логики резервного копирования S3.

:::note
Значение `0` (по умолчанию) означает без ограничений.
:::
## bcrypt_workfactor {#bcrypt_workfactor} 

Рабочий коэффициент для типа аутентификации bcrypt_password, который использует [алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).

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

<SettingsInfoBlock type="Double" default_value="0.5" />Устанавливает максимальное соотношение размера кэша к памяти RAM. Позволяет уменьшить размер кэша на системах с низким объемом памяти.
## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

<SettingsInfoBlock type="Double" default_value="0" />Для тестирования.
## cgroup_memory_watcher_hard_limit_ratio {#cgroup_memory_watcher_hard_limit_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />
Указывает "жесткий" предел потребления памяти процесса сервера в соответствии с cgroups, после которого предельное значение максимального потребления памяти сервера настраивается на значение порога.

Смотрите настройки:
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio)
## cgroup_memory_watcher_soft_limit_ratio {#cgroup_memory_watcher_soft_limit_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />
Указывает "мягкий" предел потребления памяти процесса сервера в соответствии с cgroups, после которого арены в jemalloc очищаются.

Смотрите настройки:
- [`cgroups_memory_usage_observer_wait_time`](/operations/server-configuration-parameters/settings#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)
## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

<SettingsInfoBlock type="UInt64" default_value="15" />
Интервал в секундах, в течение которого максимальное допустимое потребление памяти сервера настраивается в соответствии с соответствующим пределом в cgroups.

Чтобы отключить наблюдатель cgroup, установите это значение в `0`.

см. настройки:
- [`cgroup_memory_watcher_hard_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_hard_limit_ratio)
- [`cgroup_memory_watcher_soft_limit_ratio`](/operations/server-configuration-parameters/settings#cgroup_memory_watcher_soft_limit_ratio).
## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Устанавливает размер кэша (в элементах) для [собранных выражений](../../operations/caches.md).
## compiled_expression_cache_size {#compiled_expression_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />Устанавливает размер кэша (в байтах) для [собранных выражений](../../operations/caches.md).
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
- `method` – Метод сжатия. Допустимые значения: `lz4`, `lz4hc`, `zstd`,`deflate_qpl`.
- `level` – Уровень сжатия. Смотрите [Кодеки](/sql-reference/statements/create/table#general-purpose-codecs).

:::note
Вы можете настроить несколько секций `<case>`.
:::

**Действия, когда условия выполняются**:

- Если часть данных соответствует установленному условию, ClickHouse использует указанный метод сжатия.
- Если часть данных соответствует нескольким наборам условий, ClickHouse использует первый совпадающий набор условий.

:::note
Если для части данных не выполняются условия, ClickHouse использует сжатие `lz4`.
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

<SettingsInfoBlock type="String" default_value="round_robin" />
Политика, как выполнять планирование CPU-слотов, указанных `concurrent_threads_soft_limit_num` и `concurrent_threads_soft_limit_ratio_to_cores`. Алгоритм, используемый для регулирования того, как ограниченное количество CPU-слотов распределяется между concurrent-запросами. Планировщик может быть изменен во время работы без перезапуска сервера.

Возможные значения:

- `round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads` CPU-слотов. Один слот на поток. При конфликте CPU-слоты выделяются запросам по круговой схеме. Обратите внимание, что первый слот выделяется без условий, что может привести к нечестности и увеличению задержки запросов с высоким `max_threads` при наличии большого количества запросов с `max_threads` = 1.
- `fair_round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads - 1` CPU-слотов. Вариация `round_robin`, которая не требует CPU-слота для первого потока каждого запроса. Таким образом, запросы с `max_threads` = 1 не требуют слотов и не могут нечестно выделить все слоты. Слоты не выделяются без условий.
```yaml
title: 'Параметры конфигурации'
sidebar_label: 'Параметры конфигурации'
keywords: [''параметры'', ''конфигурация'', ''ClickHouse'']
description: 'Описание параметров конфигурации ClickHouse.'
```

## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальное количество потоков обработки запросов, исключая потоки для получения данных с удаленных серверов, разрешенное для выполнения всех запросов. Это не жесткий предел. В случае достижения лимита, запрос все равно получит хотя бы один поток для выполнения. Запрос может увеличить количество потоков до желаемого уровня во время выполнения, если станут доступны дополнительные потоки.

:::note
Значение `0` (по умолчанию) означает неограниченно.
:::
## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" />Аналогично [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num), но с учетом соотношения к ядрам.
## config_reload_interval_ms {#config_reload_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="2000" />
Как часто ClickHouse будет перезагружать конфигурацию и проверять на наличие новых изменений.
## core_dump {#core_dump} 

Настраивает мягкий лимит для размера файла дампа ядра.

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

Эта настройка указывает путь к кэшу для пользовательских (созданных из SQL) кэшированных дисков.
`custom_cached_disks_base_directory` имеет приоритет перед `filesystem_caches_path` (находится в `filesystem_caches_path.xml`),
который используется, если первый отсутствует.
Путь к настройке кэша файловой системы должен находиться внутри этого каталога,
в противном случае будет выброшено исключение, предотвращающее создание диска.

:::note
Это не повлияет на диски, созданные в старой версии, для которой сервер был обновлен.
В этом случае исключение не будет выброшено, чтобы сервер успешно запустился.
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

**Смотрите также**

- [Пользовательские настройки](/operations/settings/query-level#custom_settings)
## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec} 

<SettingsInfoBlock type="UInt64" default_value="480" />
Задержка, в течение которой удалённая таблица может быть восстановлена с помощью оператора [`UNDROP`](/sql-reference/statements/undrop.md). Если `DROP TABLE` выполнен с модификатором `SYNC`, эта настройка игнорируется.
По умолчанию это значение равно `480` (8 минут).
## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

<SettingsInfoBlock type="UInt64" default_value="5" />В случае неудачного удаления таблицы ClickHouse будет ожидать это время перед повторной попыткой операции.
## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="16" />Размер пула потоков, используемого для удаления таблиц.
## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

<SettingsInfoBlock type="UInt64" default_value="86400" />
Параметр задачи, очищающей мусор из каталога `store/`.
Устанавливает период планирования задачи.

:::note
Значение `0` означает "никогда". Значение по умолчанию соответствует 1 дню.
:::
## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="3600" />
Параметр задачи, очищающей мусор из каталога `store/`.
Если какая-либо подсDIRECToria не используется clickhouse-server и этот каталог не был изменен в течение последних
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) секунд, задача "скроет" этот каталог, удаляя все права доступа. Это также работает для каталогов, которые clickhouse-server не ожидает увидеть внутри `store/`.

:::note
Значение `0` означает "немедленно".
:::
## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="2592000" />
Параметр задачи, очищающей мусор из каталога `store/`.
Если какая-либо подсDIRECToria не используется clickhouse-server и она была ранее "скрыта"
(см. [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec))
и этот каталог не был изменен в течение последних
[`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) секунд, задача удалит этот каталог.
Это также работает для каталогов, которые clickhouse-server не ожидает увидеть внутри `store/`.

:::note
Значение `0` означает "никогда". Значение по умолчанию соответствует 30 дням.
:::
## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently} 

<SettingsInfoBlock type="Bool" default_value="1" />Разрешить постоянное отсоединение таблиц в реплицированных базах данных.
## default_database {#default_database} 

<SettingsInfoBlock type="String" default_value="default" />Имя базы данных по умолчанию.
## default_password_type {#default_password_type} 

Устанавливает тип пароля, который будет автоматически устанавливаться для запросов типа `CREATE USER u IDENTIFIED BY 'p'`.

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

<SettingsInfoBlock type="String" default_value="{replica}" />
Имя реплики в ZooKeeper.

**Пример**

```xml
<default_replica_name>{replica}</default_replica_name>
```
## default_replica_path {#default_replica_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/tables/{uuid}/{shard}" />
Путь к таблице в ZooKeeper.

**Пример**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```
## default_session_timeout {#default_session_timeout} 

Истекший таймаут сессии по умолчанию, в секундах.

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

<SettingsInfoBlock type="Bool" default_value="1" />
Ленивая загрузка словарей.

- Если `true`, то каждый словарь загружается при первом использовании. Если загрузка завершилась неудачей, функция, использующая словарь, вызывает исключение.
- Если `false`, то сервер загружает все словари при запуске.

:::note
Сервер будет ожидать на старте, пока все словари завершат свою загрузку, прежде чем принимать любые подключения
(исключение: если [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) установлено в `false`).
:::

**Пример**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```
## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Интервал в миллисекундах для попыток повторного подключения к неудавшимся словарям MySQL и Postgres, у которых включен `background_reconnect`.
## disable_insertion_and_mutation {#disable_insertion_and_mutation} 

<SettingsInfoBlock type="Bool" default_value="0" />
Отключить все запросы вставки/изменения/удаления. Эта настройка будет включена, если кому-то нужны узлы только для чтения, чтобы предотвратить влияние вставок и мутаций на производительность чтения.
## disable_internal_dns_cache {#disable_internal_dns_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />Отключает внутренний кэш DNS. Рекомендуется для работы ClickHouse в системах с часто меняющейся инфраструктурой, таких как Kubernetes.
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy} 

По умолчанию используется туннелирование (т.е., `HTTP CONNECT`), чтобы выполнять `HTTPS` запросы через `HTTP` прокси. Эта настройка может быть использована для отключения этого.

**no_proxy**

По умолчанию все запросы проходят через прокси. Чтобы отключить это для конкретных хостов, переменная `no_proxy` должна быть установлена.
Ее можно установить внутри элемента `<proxy>` для списковых и удаленных резолверов, а также как переменную окружения для резолвера окружения.
Она поддерживает IP-адреса, домены, подсистемы и `'*'` для полного обхода. Ведущие точки убираются так же, как это делает curl.

**Пример**

Нижеуказанная конфигурация обходит прокси-запросы к `clickhouse.cloud` и всем его подсистемам (например, `auth.clickhouse.cloud`).
То же самое касается GitLab, даже если у него есть ведущая точка. И `gitlab.com`, и `about.gitlab.com` будут миновать прокси.

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

<SettingsInfoBlock type="UInt64" default_value="5000" />Подключения выше этого лимита имеют значительно более короткое время жизни. Лимит применяется к подключениям дисков.
## disk_connections_store_limit {#disk_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="30000" />Подключения выше этого лимита сбрасываются после использования. Установите в 0, чтобы отключить кэш подключения. Лимит применяется к подключениям дисков.
## disk_connections_warn_limit {#disk_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Предупреждения записываются в журналы, если количество используемых подключений превышает этот лимит. Лимит применяется к подключениям дисков.
## display_secrets_in_show_and_select {#display_secrets_in_show_and_select} 

<SettingsInfoBlock type="Bool" default_value="0" />
Включает или отключает отображение секретов в запросах `SHOW` и `SELECT` для таблиц, баз данных, табличных функций и словарей.

Пользователь, желающий видеть секреты, также должен иметь
[`format_display_secrets_in_show_and_select` формат настройка](../settings/formats#format_display_secrets_in_show_and_select)
включенной и привилегию
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Возможные значения:

- `0` — Отключено.
- `1` — Включено.
## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio} 

<SettingsInfoBlock type="Float" default_value="0.1" />Мягкий лимит для числа активных подключений, которые распределенный кэш постарается сохранить свободными. Когда количество свободных подключений падает ниже distributed_cache_keep_up_free_connections_ratio * max_connections, подключения с самой старой активностью будут закрыты, пока количество не превысит лимит.
## distributed_ddl {#distributed_ddl} 

Управление выполнением [распределенных DDL запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) в кластере.
Работает только если включен [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper).

Настраиваемые параметры внутри `<distributed_ddl>` включают:

| Параметр              | Описание                                                                                                                       | Значение по умолчанию                   |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|
| `path`                 | путь в Keeper для `task_queue` для DDL запросов                                                                                  |                                         |
| `profile`              | профиль, используемый для выполнения DDL запросов                                                                                 |                                         |
| `pool_size`            | сколько `ON CLUSTER` запросов можно выполнить одновременно                                                                           |                                         |
| `max_tasks_in_queue`   | максимальное количество задач, которые могут находиться в очереди.                                                               | `1,000`                                 |
| `task_max_lifetime`    | удалить узел, если его возраст больше этого значения.                                                                          | `7 * 24 * 60 * 60` (неделя в секундах)  |
| `cleanup_delay_period` | очистка начинается после получения нового события узла, если последняя очистка не была выполнена раньше, чем `cleanup_delay_period` секунд назад. | `60` секунд                            |

**Пример**

```xml
<distributed_ddl>
    <!-- Путь в ZooKeeper к очереди с DDL запросами -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Настройки из этого профиля будут использоваться для выполнения DDL запросов -->
    <profile>default</profile>

    <!-- Контроль того, сколько ON CLUSTER запросов может быть выполнено одновременно. -->
    <pool_size>1</pool_size>

    <!--
         Настройки очистки (активные задачи не будут удалены)
    -->

    <!-- Контроль срока жизни задач (по умолчанию 1 неделя) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Контроль того, как часто следует проводить очистку (в секундах) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Контроль того, сколько задач может быть в очереди -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```
## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4} 

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает разрешение имен в IPv4 адреса.
## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6} 

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает разрешение имен в IPv6 адреса.
## dns_cache_max_entries {#dns_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Максимальное количество записей в внутреннем кэше DNS.
## dns_cache_update_period {#dns_cache_update_period} 

<SettingsInfoBlock type="Int32" default_value="15" />Период обновления внутреннего кэша DNS в секундах.
## dns_max_consecutive_failures {#dns_max_consecutive_failures} 

<SettingsInfoBlock type="UInt32" default_value="10" />Максимальное количество неудач разрешения DNS имени хоста перед его удалением из кэша DNS ClickHouse.
## enable_azure_sdk_logging {#enable_azure_sdk_logging} 

<SettingsInfoBlock type="Bool" default_value="0" />Включает логирование из Azure SDK.
## encryption {#encryption} 

Настраивает команду для получения ключа, который будет использоваться кодеками [шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должен быть записан в переменные окружения или установлен в файле конфигурации.

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
Хранение ключей в файле конфигурации не рекомендуется. Это небезопасно. Вы можете переместить ключи в отдельный файл конфигурации на защищенном диске и поместить символическую ссылку на этот файл конфигурации в папку `config.d/`.
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

Каждый из этих методов может быть применен к нескольким ключам:

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

Также пользователи могут добавить nonce, который должен быть длиной 12 байт (по умолчанию процессы шифрования и расшифрования используют nonce, который состоит из нулевых байт):

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
Все, что упомянуто выше, может быть применено к `aes_256_gcm_siv` (но ключ должен быть длиной 32 байта).
:::
## error_log {#error_log} 

По умолчанию отключен.

**Включение**

Для ручного включения сбора истории ошибок [`system.error_log`](../../operations/system-tables/error_log.md) создайте файл `/etc/clickhouse-server/config.d/error_log.xml` со следующим содержимым:

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
## format_schema_path {#format_schema_path} 

Путь к каталогу со схемами для входящих данных, например, схемы для формата [CapnProto](../../interfaces/formats.md#capnproto).

**Пример**

```xml
<!-- Каталог, содержащий файлы схем для различных форматов ввода. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="0" />Период для таймера процессора глобального профайлера (в наносекундах). Установите значение 0, чтобы отключить глобальный профилировщик по времени процессора. Рекомендуемое значение — не менее 10000000 (100 раз в секунду) для единичных запросов или 1000000000 (один раз в секунду) для кластерного профилирования.
## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns} 

<SettingsInfoBlock type="UInt64" default_value="0" />Период для реального таймера глобального профайлера (в наносекундах). Установите значение 0, чтобы отключить глобальный профилировщик по реальному времени. Рекомендуемое значение — не менее 10000000 (100 раз в секунду) для единичных запросов или 1000000000 (один раз в секунду) для кластерного профилирования.
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
- `interval` – Интервал отправки, в секундах.
- `timeout` – Таймаут на отправку данных, в секундах.
- `root_path` – Префикс для ключей.
- `metrics` – Отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Отправка накопленных дельт за период времени из таблицы [system.events](/operations/system-tables/events).
- `events_cumulative` – Отправка кумулятивных данных из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Отправка данных из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Вы можете настроить несколько элементов `<graphite>`. Например, вы можете использовать это для отправки различных данных с различными интервалами.

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

Для получения более подробной информации смотрите [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md).

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
Значение `0` означает, что ClickHouse отключает HSTS. Если вы устанавливаете положительное число, HSTS будет включен, и max-age будет равен заданному вами числу.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## http_connections_soft_limit {#http_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />Подключения выше этого лимита имеют значительно более короткое время жизни. Лимит применяется к HTTP подключениям, которые не принадлежат никакому диску или хранилищу.
## http_connections_store_limit {#http_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />Подключения выше этого лимита сбрасываются после использования. Установите в 0, чтобы отключить кэш подключения. Лимит применяется к HTTP подключениям, которые не принадлежат никакому диску или хранилищу.
## http_connections_warn_limit {#http_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Предупреждения записываются в журналы, если количество используемых подключений превышает этот лимит. Лимит применяется к HTTP подключениям, которые не принадлежат никакому диску или хранилищу.
## http_handlers {#http_handlers} 

Позволяет использовать пользовательские HTTP-обработчики.
Чтобы добавить новый HTTP обработчик, просто добавьте новый `<rule>`.
Правила проверяются сверху вниз, как задано,
и первое совпадение запустит обработчик.

Следующие настройки могут быть настроены с помощью под-тегов:

| Под-теги             | Определение                                                                                                                                        |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | Чтобы сопоставить URL запроса, вы можете использовать префикс 'regex:', чтобы использовать регулярное выражение (опционально)                      |
| `methods`            | Чтобы сопоставить методы запроса, вы можете использовать запятые для разделения нескольких совпадений методов (опционально)                       |
| `headers`            | Чтобы сопоставить заголовки запроса, сопоставьте каждый дочерний элемент (имя дочернего элемента — имя заголовка), вы можете использовать префикс 'regex:' для использования регулярного выражения (опционально) |
| `handler`            | Обработчик запроса                                                                                                                               |
| `empty_query_string` | Проверка на отсутствие строки запроса в URL                                                                                                    |

`handler` содержит следующие настройки, которые могут быть настроены с помощью под-тегов:

| Под-теги           | Определение                                                                                                                                                            |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | Локация для перенаправления                                                                                                                                               |
| `type`             | Поддерживаемые типы: static, dynamic_query_handler, predefined_query_handler, redirect                                                                                    |
| `status`           | Используйте с типом static, код статуса ответа                                                                                                                            |
| `query_param_name` | Используйте с типом dynamic_query_handler, извлекает и выполняет значение, соответствующее значению `<query_param_name>` в параметрах HTTP-запроса                             |
| `query`            | Используйте с типом predefined_query_handler, выполняет запрос, когда вызывается обработчик                                                                                     |
| `content_type`     | Используйте с типом static, тип содержимого ответа                                                                                                                           |
| `response_content` | Используйте с типом static, содержимое ответа, отправленное клиенту, при использовании префикса 'file://' или 'config://', найдите содержимое из файла или конфигурации, отправьте клиенту |

Вместе со списком правил вы можете указать `<defaults/>`, что указывает на включение всех стандартных обработчиков.

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

Используется для добавления заголовков к ответу в HTTP-запросе `OPTIONS`.
Метод `OPTIONS` используется при выполнении предзапросов CORS.

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

Страница, которая отображается по умолчанию при доступе к HTTP (S) серверу ClickHouse.
Значение по умолчанию — "Ok." (с символом новой строки в конце)

**Пример**

Открывает `https://tabix.io/` при доступе к `http://localhost: http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />Размер фона пула для каталога iceberg.
## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно добавить в пул каталога iceberg.
## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Максимальный размер кэша файлов метаданных iceberg в записях. Ноль означает отключение.

## политика_кэша_файлов_метаданных_айсберга {#iceberg_metadata_files_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша метаданных айсберга.
## размер_кэша_файлов_метаданных_айсберга {#iceberg_metadata_files_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Максимальный размер кэша метаданных айсберга в байтах. Ноль означает отключение.
## отношение_размера_кэша_файлов_метаданных_айсберга {#iceberg_metadata_files_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае политики SLRU) в кэше метаданных айсберга относительно общего размера кэша.
## игнорировать_пустой_sql_безопасность_в_запросе_create_view {#ignore_empty_sql_security_in_create_view_query} 

<SettingsInfoBlock type="Bool" default_value="1" />
Если истинно, ClickHouse не пишет значения по умолчанию для пустого SQL-заявления безопасности в запросах `CREATE VIEW`.

:::note
Эта настройка необходима только в миграционный период и станет устаревшей в 24.4
:::
## include_from {#include_from} 

Путь к файлу с заменами. Поддерживаются форматы XML и YAML.

Для получения дополнительной информации см. раздел "[Конфигурационные файлы](/operations/configuration-files)".

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## политика_кэша_меток_индекса {#index_mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша меток вторичного индекса.
## размер_кэша_меток_индекса {#index_mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
Максимальный размер кэша для меток индекса.

:::note

Значение `0` означает отключение.

Эту настройку можно изменять во время выполнения, и она вступит в силу немедленно.
:::
## отношение_размера_кэша_меток_индекса {#index_mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.3" />Размер защищенной очереди (в случае политики SLRU) в кэше меток вторичного индекса относительно общего размера кэша.
## политика_некорректированного_кэша_индекса {#index_uncompressed_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики некорректированного кэша вторичного индекса.
## размер_некорректированного_кэша_индекса {#index_uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальный размер кэша для некорректированных блоков индексов `MergeTree`.

:::note
Значение `0` означает отключение.

Эту настройку можно изменять во время выполнения, и она вступит в силу немедленно.
:::
## отношение_размера_некорректированного_кэша_индекса {#index_uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае политики SLRU) в некорректированном кэше вторичного индекса относительно общего размера кэша.
## межсерверные_http_учетные_данные {#interserver_http_credentials} 

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики, используя эти учетные данные.
`interserver_http_credentials` должны быть одинаковыми для всех реплик в кластере.

:::note
- По умолчанию, если раздел `interserver_http_credentials` опущен, аутентификация не используется во время репликации.
- Настройки `interserver_http_credentials` не относятся к учетным данным клиента ClickHouse [конфигурации](../../interfaces/cli.md#configuration_files).
- Эти учетные данные общие для репликации через `HTTP` и `HTTPS`.
:::

Следующие настройки могут быть настроены с помощью под-тегов:

- `user` — Имя пользователя.
- `password` — Пароль.
- `allow_empty` — Если `true`, то другим репликам разрешается подключение без аутентификации, даже если учетные данные установлены. Если `false`, то подключения без аутентификации отклоняются. По умолчанию: `false`.
- `old` — Содержит старые `user` и `password`, используемые во время ротации учетных данных. Можно указать несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию межсерверных учетных данных без остановки всех реплик одновременно для обновления их конфигурации. Учетные данные могут быть изменены в несколько этапов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволяет подключениям как с аутентификацией, так и без нее.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите `allow_empty` в `false` или удалите эту настройку. Это делает аутентификацию с новыми учетными данными обязательной.

Чтобы изменить существующие учетные данные, переместите имя пользователя и пароль в раздел `interserver_http_credentials.old` и обновите `user` и `password` новыми значениями. В этот момент сервер использует новые учетные данные для подключения к другим репликам и принимает подключения как с новыми, так и старыми учетными данными.

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
## межсерверный_http_хост {#interserver_http_host} 

Имя хоста, которое могут использовать другие серверы для доступа к этому серверу.

Если опущено, оно определяется так же, как команда `hostname -f`.

Полезно для отказа от конкретного сетевого интерфейса.

**Пример**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## межсерверный_http_порт {#interserver_http_port} 

Порт для обмена данными между серверами ClickHouse.

**Пример**

```xml
<interserver_http_port>9009</interserver_http_port>
```
## межсерверный_https_хост {#interserver_https_host} 

Аналогично [`interserver_http_host`](#interserver_http_host), за исключением того, что этот имя хоста может использоваться другими серверами для доступа к этому серверу через `HTTPS`.

**Пример**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## межсерверный_https_порт {#interserver_https_port} 

Порт для обмена данными между серверами ClickHouse через `HTTPS`.

**Пример**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## межсерверный_слушающий_хост {#interserver_listen_host} 

Ограничение на хосты, которые могут обмениваться данными между серверами ClickHouse.
Если используется Keeper, то то же ограничение будет применяться к связи между разными экземплярами Keeper.

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
## размер_очереди_пулов_потоков_io {#io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
Максимальное количество задач, которые могут быть запланированы в пуле потоков IO.

:::note
Значение `0` означает неограниченное количество.
:::
## таймаут_keep_alive {#keep_alive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="30" />
Количество секунд, в течение которых ClickHouse ждет входящих запросов для протокола HTTP перед закрытием соединения.

**Пример**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## размер_пакета_multiRead_для_keeper {#keeper_multiread_batch_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
Максимальный размер пакета для MultiRead запроса к [Zoo]Keeper, который поддерживает пакетирование. Если установлен в 0, пакетирование отключено. Доступно только в ClickHouse Cloud.
## журнал_задержки {#latency_log} 

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

Чтобы отключить настройку `latency_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_latency_log.xml` со следующим содержимым:

```xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## ldap_сервера {#ldap_servers} 

Список серверов LDAP с параметрами подключения здесь для:
- использования их в качестве аутентификаторов для выделенных локальных пользователей, у которых указан механизм аутентификации 'ldap', а не 'password'
- использования их в качестве удаленных каталогов пользователей.

Следующие настройки могут быть настроены с помощью под-тегов:

| Настройка                     | Описание                                                                                                                                                                                                                                                                                                                                                                                                                              |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                        | Имя хоста или IP-адрес сервера LDAP, этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                                                                                                                     |
| `port`                        | Порт сервера LDAP, по умолчанию 636, если `enable_tls` установлен в true, иначе `389`.                                                                                                                                                                                                                                                                                                                                                      |
| `bind_dn`                     | Шаблон, используемый для построения DN для подключения. Результирующий DN будет построен путем замены всех подстрок `\{user_name\}` шаблона на фактическое имя пользователя во время каждой попытки аутентификации.                                                                                                                                                                                                               |
| `user_dn_detection`           | Раздел с параметрами поиска LDAP для определения фактического DN пользователя, к которому выполняется привязка. Это используется в основном в фильтрах поиска для дальнейшего отображения ролей, когда сервер является Active Directory. Результирующий DN пользователя будет использован при замене подстрок `\{user_dn\}` там, где это разрешено. По умолчанию DN пользователя устанавливается равным DN подключения, но после выполнения поиска он будет обновлен до фактического обнаруженного значения DN пользователя. |
| `verification_cooldown`       | Период времени в секундах после успешной попытки подключения, в течение которого пользователь будет считаться успешно аутентифицированным для всех последовательных запросов без обращения к серверу LDAP. Укажите `0` (по умолчанию), чтобы отключить кэширование и принудительно обращаться к серверу LDAP для каждого запроса аутентификации.                                                                                                         |
| `enable_tls`                  | Флаг, который активирует использование безопасного соединения с сервером LDAP. Укажите `no` для протокола обычного текста (`ldap://`, не рекомендуется). Укажите `yes` для протокола LDAP через SSL/TLS (`ldaps://`, рекомендуется, по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (простой текст (`ldap://`), обновленного до TLS).                                                                            |
| `tls_minimum_protocol_version` | Минимальная версия протокола SSL/TLS. Приемлемые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (по умолчанию).                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`            | Поведение проверки сертификата SSL/TLS. Приемлемые значения: `never`, `allow`, `try`, `demand` (по умолчанию).                                                                                                                                                                                                                                                                                                                        |
| `tls_cert_file`               | путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                              |
| `tls_key_file`                | путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_ca_cert_file`            | путь к файлу сертификата CA.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`             | путь к директории, содержащей сертификаты CA.                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`            | разрешенные наборы шифров (в записи OpenSSL).                                                                                                                                                                                                                                                                                                                                                                                        |

Настройка `user_dn_detection` может быть настроена с помощью под-тегов:

| Настройка        | Описание                                                                                                                                                                                                                                                                                                                                    |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`        | шаблон, используемый для построения базового DN для LDAP поиска. Результирующий DN будет построен путем замены всех подстрок `\{user_name\}` и '\{bind_dn\}' шаблона на фактическое имя пользователя и DN подключения во время LDAP поиска.                                                                                                       |
| `scope`          | область LDAP поиска. Приемлемые значения: `base`, `one_level`, `children`, `subtree` (по умолчанию).                                                                                                                                                                                                                                       |
| `search_filter`  | шаблон, используемый для построения фильтра поиска для LDAP поиска. Результирующий фильтр будет построен путем замены всех подстрок `\{user_name\}`, `\{bind_dn\}` и `\{base_dn\}` шаблона на фактическое имя пользователя, DN подключения и базовый DN во время LDAP поиска. Обратите внимание, что специальные символы должны быть правильно экранированы в XML.  |

**Пример:**

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

**Пример (типичная Active Directory с настроенной детекцией DN пользователя для дальнейшего отображения ролей):**

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
## лицензия {#license_key} 

Ключ лицензии для ClickHouse Enterprise Edition.
## очередь_слушания {#listen_backlog} 

Очередь (размер очереди ожидающих соединений) сокета прослушивания. Значение по умолчанию `4096` такое же, как у Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не нужно изменять, так как:
- Значение по умолчанию достаточно велико,
- Для приема соединений клиентов сервер имеет отдельный поток.

Поэтому, даже если у вас `TcpExtListenOverflows` (из `nstat`) ненульевое и этот счетчик растет для сервера ClickHouse, это не означает, что значение нужно увеличить, так как:
- Обычно, если `4096` недостаточно, это указывает на какую-то внутреннюю проблему масштабирования ClickHouse, и лучше сообщить о проблеме.
- Это не означает, что сервер может обработать больше соединений позже (и даже если бы мог, к тому времени клиенты могли бы исчезнуть или отключиться).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```
## слушающий_хост {#listen_host} 

Ограничение на хосты, с которых могут поступать запросы. Если вы хотите, чтобы сервер отвечал на все запросы, укажите `::`.

Примеры:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## разрешить_повторное_использование_слушающих_портов {#listen_reuse_port} 

Разрешить нескольким серверам прослушивать один и тот же адрес:порт. Запросы будут направляться на случайный сервер операционной системой. Включение этой настройки не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

По умолчанию:
## попытка_прослушивания {#listen_try} 

Сервер не завершит работу, если сети IPv6 или IPv4 недоступны во время попытки прослушивания.

**Пример**

```xml
<listen_try>0</listen_try>
```
## размер_пула_потоков_для_загрузки_меток {#load_marks_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />Размер фона пула для загрузки меток.
## размер_очереди_потоков_для_загрузки_меток {#load_marks_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно поместить в пул предзагрузок.
```yaml
title: 'логгер'
sidebar_label: 'логгер'
keywords: ['логирование', 'настройки']
description: 'Расположение и формат сообщений логов.'
```

## logger {#logger}

Расположение и формат сообщений логов.

**Ключи**:

| Ключ                       | Описание                                                                                                                                                                         |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                   | Уровень логирования. Допустимые значения: `none` (отключить логирование), `fatal`, `critical`, `error`, `warning`, `notice`, `information`, `debug`, `trace`, `test`                                  |
| `log`                     | Путь к файлу лога.                                                                                                                                                           |
| `errorlog`                | Путь к файлу лога ошибок.                                                                                                                                                     |
| `size`                    | Политика ротации: Максимальный размер файлов логов в байтах. Как только размер файла лога превышает этот порог, он переименовывается и архивируется, после чего создается новый файл лога.                  |
| `count`                   | Политика ротации: Максимальное количество исторических файлов логов, которые ClickHouse сохраняет.                                                                                 |
| `stream_compress`         | Сжимать сообщения логов с использованием LZ4. Установите значение `1` или `true`, чтобы включить.                                                                                  |
| `console`                 | Не записывать сообщения логов в файлы логов, вместо этого выводить их в консоль. Установите значение `1` или `true`, чтобы включить. По умолчанию `1`, если ClickHouse не работает в режиме демона, `0` в противном случае. |
| `console_log_level`       | Уровень логирования для вывода в консоль. По умолчанию равен `level`.                                                                                                                                  |
| `formatting`              | Формат лога для вывода в консоль. В данный момент поддерживается только `json`.                                                                                                                  |
| `use_syslog`              | Также передавать вывод логов в syslog.                                                                                                                                                  |
| `syslog_level`            | Уровень логирования для записи в syslog.                                                                                                                                                    |

**Спецификаторы формата журнала**

Имена файлов в путях `log` и `errorLog` поддерживают нижеупомянутые спецификаторы формата для результирующего имени файла (часть каталога не поддерживает их).

Колонка "Пример" показывает результат при `2023-07-06 18:32:07`.

| Спецификатор | Описание                                                                                                         | Пример                   |
|--------------|---------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | Литерал %                                                                                                           | `%`                        |
| `%n`         | Символ новой строки                                                                                                  |                          |
| `%t`         | Символ горизонтальной табуляции                                                                                     |                          |
| `%Y`         | Год в десятичном формате, например 2017                                                                                 | `2023`                     |
| `%y`         | Последние 2 цифры года в десятичном формате (диапазон [00,99])                                                           | `23`                       |
| `%C`         | Первые 2 цифры года в десятичном формате (диапазон [00,99])                                                          | `20`                       |
| `%G`         | Четырехзначный [год на основе недели ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, содержащий указанную неделю. Обычно полезно только с `%V` | `2023`       |
| `%g`         | Последние 2 цифры [года на основе недели ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, содержащий указанную неделю.                         | `23`         |
| `%b`         | Сокращенное название месяца, например Oct (в зависимости от локали)                                                                 | `Jul`                      |
| `%h`         | Синоним %b                                                                                                       | `Jul`                      |
| `%B`         | Полное название месяца, например October (в зависимости от локали)                                                                    | `July`                     |
| `%m`         | Месяц в десятичном формате (диапазон [01,12])                                                                           | `07`                       |
| `%U`         | Номер недели в году в десятичном формате (воскресенье — первый день недели) (диапазон [00,53])                          | `27`                       |
| `%W`         | Номер недели в году в десятичном формате (понедельник — первый день недели) (диапазон [00,53])                          | `27`                       |
| `%V`         | Номер недели ISO 8601 (диапазон [01,53])                                                                                | `27`                       |
| `%j`         | День в году в десятичном формате (диапазон [001,366])                                                               | `187`                      |
| `%d`         | День месяца в виде десятичного числа с нулевым заполнением (диапазон [01,31]). Однозначный номер предшествует нулю.                 | `06`                       |
| `%e`         | День месяца в виде десятичного числа с заполнением пробелами (диапазон [1,31]). Однозначный номер предшествует пробелу.              | `&nbsp; 6`                 |
| `%a`         | Сокращенное название дня недели, например Fri (в зависимости от локали)                                                               | `Thu`                      |
| `%A`         | Полное название дня недели, например Friday (в зависимости от локали)                                                                   | `Thursday`                 |
| `%w`         | День недели в виде целого числа, где воскресенье — 0 (диапазон [0-6])                                                          | `4`                        |
| `%u`         | День недели в виде десятичного числа, где понедельник — 1 (формат ISO 8601) (диапазон [1-7])                                      | `4`                        |
| `%H`         | Час в десятичном формате, 24-часовой формат (диапазон [00-23])                                                             | `18`                       |
| `%I`         | Час в десятичном формате, 12-часовой формат (диапазон [01,12])                                                             | `06`                       |
| `%M`         | Минуты в десятичном формате (диапазон [00,59])                                                                          | `32`                       |
| `%S`         | Секунды в десятичном формате (диапазон [00,60])                                                                          | `07`                       |
| `%c`         | Стандартная строка даты и времени, например Sun Oct 17 04:41:13 2010 (в зависимости от локали)                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованное представление даты (в зависимости от локали)                                                                    | `07/06/23`                 |
| `%X`         | Локализованное представление времени, например 18:40:20 или 6:40:20 PM (в зависимости от локали)                                       | `18:32:07`                 |
| `%D`         | Краткая дата в формате MM/DD/YY, эквивалентная %m/%d/%y                                                                         | `07/06/23`                 |
| `%F`         | Краткая дата в формате YYYY-MM-DD, эквивалентная %Y-%m-%d                                                                       | `2023-07-06`               |
| `%r`         | Локализованное время в 12-часовом формате (в зависимости от локали)                                                                     | `06:32:07 PM`              |
| `%R`         | Эквивалент "%H:%M"                                                                                               | `18:32`                    |
| `%T`         | Эквивалент "%H:%M:%S" (формат времени ISO 8601)                                                                 | `18:32:07`                 |
| `%p`         | Локализованное обозначение a.m. или p.m. (в зависимости от локали)                                                               | `PM`                       |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430), или никаких символов, если информация о часовом поясе недоступна | `+0800`                    |
| `%Z`         | Название или сокращение часового пояса в зависимости от локали, или никаких символов, если информация о часовом поясе недоступна     | `Z AWST `                  |

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

Чтобы печатать сообщения логов только в консоли:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**Переопределения по уровням**

Уровень логирования отдельных имен логов может быть переопределен. Например, чтобы отключить все сообщения логгеров "Backup" и "RBAC".

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
| `facility` | Ключевое слово [фасилити syslog](https://en.wikipedia.org/wiki/Syslog#Facility). Должно быть указано в верхнем регистре с префиксом "LOG_", например `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т.д. По умолчанию: `LOG_USER`, если указан `address`, `LOG_DAEMON` в противном случае.                                           |
| `format`   | Формат сообщения лога. Возможные значения: `bsd` и `syslog`.                                                                                                                                                                                                       |

**Форматы логов**

Вы можете указать формат лога, который будет выводиться в консоли. В данный момент поддерживается только JSON.

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

Имена ключей могут быть изменены путем изменения значений тегов внутри `<names>`. Например, чтобы изменить `DATE_TIME` на `MY_DATE_TIME`, вы можете использовать `<date_time>MY_DATE_TIME</date_time>`.

**Упускание ключей для JSON логов**

Свойства логов могут быть опущены путем комментирования свойства. Например, если вы не хотите, чтобы ваш лог печатал `query_id`, вы можете закомментировать тег `<query_id>`.

## macros {#macros}

Замены параметров для реплицированных таблиц.

Можно пропустить, если реплицированные таблицы не используются.

Для получения дополнительной информации смотрите раздел [Создание реплицированных таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```

## mark_cache_policy {#mark_cache_policy}

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэширования меток.

## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio}

<SettingsInfoBlock type="Double" default_value="0.95" />Соотношение общего размера кэша меток, который нужно заполнить во время предварительного прогрева.

## mark_cache_size {#mark_cache_size}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
Максимальный размер кэша для меток (индекс [MergeTree](/engines/table-engines/mergetree-family) семейства таблиц).

:::note
Эта настройка может быть изменена во время работы и вступит в силу немедленно.
:::

## mark_cache_size_ratio {#mark_cache_size_ratio}

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае политики SLRU) в кэше меток относительно общего размера кэша.

## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size}

<SettingsInfoBlock type="UInt64" default_value="64" />Количество потоков для загрузки активного набора частей данных (активных) при запуске.

## max_authentication_methods_per_user {#max_authentication_methods_per_user}

<SettingsInfoBlock type="UInt64" default_value="100" />
Максимальное количество методов аутентификации, с помощью которых может быть создан или изменен пользователь.
Изменение этой настройки не влияет на существующих пользователей. Запросы на создание/изменение, связанные с аутентификацией, потерпят неудачу, если они превысят предел, указанный в этой настройке.
Запросы на создание/изменение, не связанные с аутентификацией, будут выполнены успешно.

:::note
Значение `0` означает неограниченное количество.
:::

## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения в байтах в секунду для всех резервных копий на сервере. Ноль означает неограниченное количество.

## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size}

<SettingsInfoBlock type="UInt64" default_value="0" />Если количество **бездействующих** потоков в пуле потоков для резервных копий превышает `max_backup_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые неактивными потоками, и уменьшит размер пула. Потоки могут быть созданы повторно, если необходимо.

## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size}

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse использует потоки из пула потоков для резервных копий для выполнения операций ввода-вывода S3. `max_backups_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.

## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size}

<SettingsInfoBlock type="UInt64" default_value="16" />
Максимальное количество потоков, которые можно использовать для построения векторных индексов.

:::note
Значение `0` означает использование всех ядер.
:::

## max_concurrent_insert_queries {#max_concurrent_insert_queries}

<SettingsInfoBlock type="UInt64" default_value="0" />
Лимит на общее количество одновременно выполняемых запросов на вставку.

:::note

Значение `0` (по умолчанию) означает неограниченное количество.

Эта настройка может быть изменена во время работы и вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::

## max_concurrent_queries {#max_concurrent_queries}

<SettingsInfoBlock type="UInt64" default_value="0" />
Лимит на общее количество одновременно выполняемых запросов. Обратите внимание, что также нужно учитывать пределы на `INSERT` и `SELECT` запросы, а также на максимальное количество запросов для пользователей.

Смотрите также:
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

Значение `0` (по умолчанию) означает неограниченное количество.

Эта настройка может быть изменена во время работы и вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::

## max_concurrent_select_queries {#max_concurrent_select_queries}

<SettingsInfoBlock type="UInt64" default_value="0" />
Лимит на общее количество одновременно выполняемых запросов на выборку.

:::note

Значение `0` (по умолчанию) означает неограниченное количество.

Эта настройка может быть изменена во время работы и вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::

## max_connections {#max_connections}

<SettingsInfoBlock type="Int32" default_value="4096" />Максимальное количество подключений к серверу.

## max_database_num_to_throw {#max_database_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />Если количество баз данных превышает это значение, сервер вызовет исключение. 0 означает отсутствие ограничений.

## max_database_num_to_warn {#max_database_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />
Если количество подключенных баз данных превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```

## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size}

<SettingsInfoBlock type="UInt32" default_value="1" />Количество потоков для создания таблиц во время восстановления реплики в DatabaseReplicated. Ноль означает, что количество потоков равно количеству ядер.

## max_dictionary_num_to_throw {#max_dictionary_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />
Если количество словарей превышает это значение, сервер вызовет исключение.

Учитываются только таблицы для движков баз данных:
- Атомарные
- Обычные
- Реплицированные
- Ленивые

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**
```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```

## max_dictionary_num_to_warn {#max_dictionary_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="1000" />
Если количество подключенных словарей превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```

## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats}

<SettingsInfoBlock type="UInt64" default_value="10000" />Сколько записей статистики хеш-таблицы, собранной во время агрегации, разрешено иметь.

## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size}

<SettingsInfoBlock type="UInt64" default_value="64" />Количество потоков для ALTER TABLE FETCH PARTITION.

## max_io_thread_pool_free_size {#max_io_thread_pool_free_size}

<SettingsInfoBlock type="UInt64" default_value="0" />
Если количество **бездействующих** потоков в пуле потоков ввода-вывода превышает `max_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые неактивными потоками, и уменьшит размер пула. Потоки могут быть созданы повторно, если необходимо.

## max_io_thread_pool_size {#max_io_thread_pool_size}

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouse использует потоки из пула потоков ввода-вывода для выполнения некоторых операций ввода-вывода (например, для взаимодействия с S3). `max_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.

## max_keep_alive_requests {#max_keep_alive_requests}

<SettingsInfoBlock type="UInt64" default_value="10000" />
Максимальное количество запросов через одно соединение с поддержкой keep-alive до его закрытия сервером ClickHouse.

**Пример**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```

## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server}

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальная скорость локальных чтений в байтах в секунду.

:::note
Значение `0` означает неограниченное количество.
:::

## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server}

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальная скорость локальных записей в байтах в секунду.

:::note
Значение `0` означает неограниченное количество.
:::

## max_materialized_views_count_for_table {#max_materialized_views_count_for_table}

<SettingsInfoBlock type="UInt64" default_value="0" />
Ограничение на количество материализованных представлений, прикрепленных к таблице.

:::note
Здесь учитываются только непосредственно зависимые представления, и создание одного представления на основе другого представления не учитывается.
:::

## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения всех слияний на сервере в байтах в секунду. Ноль означает неограниченное количество.

## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения всех мутаций на сервере в байтах в секунду. Ноль означает неограниченное количество.

## max_open_files {#max_open_files}

Максимальное количество открытых файлов.

:::note
Рекомендуем использовать эту опцию в macOS, так как функция `getrlimit()` возвращает некорректное значение.
:::

**Пример**

```xml
<max_open_files>262144</max_open_files>
```

## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection}

<SettingsInfoBlock type="Float" default_value="0" />Максимальное соотношение между временем ожидания CPU ОС (метрика OSCPUWaitMicroseconds) и занятым временем (метрика OSCPUVirtualTimeMicroseconds), чтобы рассмотреть возможность сброса соединений. Линейная интерполяция между минимальным и максимальным соотношением используется для расчета вероятности, при этом вероятность 1 в данной точке.

## max_outdated_parts_loading_thread_pool_size {#max_outdated_parts_loading_thread_pool_size}

<SettingsInfoBlock type="UInt64" default_value="32" />Количество потоков для загрузки неактивного набора частей данных (устаревших) при запуске.

## max_part_num_to_warn {#max_part_num_to_warn}

<SettingsInfoBlock type="UInt64" default_value="100000" />
Если количество активных частей превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```

## max_partition_size_to_drop {#max_partition_size_to_drop}

<SettingsInfoBlock type="UInt64" default_value="50000000000" />
Ограничение на удаление партиций.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает [`max_partition_size_to_drop`](#max_partition_size_to_drop) (в байтах), вы не можете удалить партицию с помощью запроса [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart).
Эта настройка не требует перезапуска сервера ClickHouse для применения. Другой способ отключить ограничение — создать файл `<clickhouse-path>/flags/force_drop_table`.

:::note
Значение `0` означает, что вы можете удалять партиции без каких-либо ограничений.

Это ограничение не влияет на удаление таблиц и усечение таблиц, см. [max_table_size_to_drop](/operations/settings/settings#max_table_size_to_drop)
:::

**Пример**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```

## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size}

<SettingsInfoBlock type="UInt64" default_value="128" />Количество потоков для одновременного удаления неактивных частей данных.

## max_pending_mutations_execution_time_to_warn {#max_pending_mutations_execution_time_to_warn}

<SettingsInfoBlock type="UInt64" default_value="86400" />
Если любое из ожидающих мутаций превышает указанное значение в секундах, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_pending_mutations_execution_time_to_warn>10000</max_pending_mutations_execution_time_to_warn>
```

## max_pending_mutations_to_warn {#max_pending_mutations_to_warn}

<SettingsInfoBlock type="UInt64" default_value="500" />
Если количество ожидающих мутаций превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```

## max_prefixes_deserialization_thread_pool_free_size {#max_prefixes_deserialization_thread_pool_free_size}

<SettingsInfoBlock type="UInt64" default_value="0" />
Если количество **бездействующих** потоков в пуле потоков десериализации префиксов превышает `max_prefixes_deserialization_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые неактивными потоками, и уменьшит размер пула. Потоки могут быть созданы повторно, если необходимо.

## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size}

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouse использует потоки из пула потоков десериализации префиксов для параллельного чтения метаданных колонок и подсегментов из префиксов файлов в широких частях в MergeTree. `max_prefixes_deserialization_thread_pool_size` ограничивает максимальное количество потоков в пуле.

## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server}

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальная скорость обмена данными по сети в байтах в секунду для чтения.

:::note
Значение `0` (по умолчанию) означает неограниченное количество.
:::

## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server}

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальная скорость обмена данными по сети в байтах в секунду для записи.

:::note
Значение `0` (по умолчанию) означает неограниченное количество.
:::

## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость обмена данными по сети в байтах в секунду для реплицированных выборок. Ноль означает неограниченное количество.

## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость обмена данными по сети в байтах в секунду для реплицированных отправок. Ноль означает неограниченное количество.

## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw}

<SettingsInfoBlock type="UInt64" default_value="0" />
Если количество реплицированных таблиц превышает это значение, сервер вызовет исключение.

Учитываются только таблицы для движков баз данных:
- Атомарные
- Обычные
- Реплицированные
- Ленивые

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**
```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```

## max_server_memory_usage {#max_server_memory_usage}

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальное количество памяти, которое сервер может использовать, выраженное в байтах.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается установкой `max_server_memory_usage_to_ram_ratio`.
:::

В качестве особого случая значение `0` (по умолчанию) означает, что сервер может потреблять всю доступную память (исключая другие ограничения, налагаемые `max_server_memory_usage_to_ram_ratio`).

## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio}

<SettingsInfoBlock type="Double" default_value="0.9" />
Максимальное количество памяти, которое сервер может использовать, выраженное как отношение ко всей доступной памяти.

Например, значение `0.9` (по умолчанию) означает, что сервер может потреблять 90% доступной памяти.

Позволяет снизить потребление памяти на системах с ограниченной памятью.
На хостах с низким объемом ОЗУ и свопа вы, возможно, должны будете привязать значение [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) больше 1.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается установкой `max_server_memory_usage`.
:::

## max_session_timeout {#max_session_timeout}

Максимальный тайм-аут сессии, в секундах.

Пример:

```xml
<max_session_timeout>3600</max_session_timeout>
```
## max_table_num_to_throw {#max_table_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Если количество таблиц превышает это значение, сервер вызовет исключение.

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

<SettingsInfoBlock type="UInt64" default_value="5000" />
Если количество подключенных таблиц превышает указанное значение, сервер ClickHouse добавит сообщения о предупреждении в таблицу `system.warnings`.

**Пример**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```
## max_table_size_to_drop {#max_table_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />
Ограничение на удаление таблиц.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает `max_table_size_to_drop` (в байтах), вы не сможете удалить ее с помощью запроса [`DROP`](../../sql-reference/statements/drop.md) или [`TRUNCATE`](../../sql-reference/statements/truncate.md).

:::note
Значение `0` означает, что вы можете удалять все таблицы без ограничений.

Эта настройка не требует перезагрузки сервера ClickHouse для применения. Другой способ отключить ограничение - создать файл `<clickhouse-path>/flags/force_drop_table`.
:::

**Пример**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```
## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальный объем хранилища, который может быть использован для внешней агрегации, соединений или сортировки.
Запросы, превышающие этот предел, завершатся с исключением.

:::note
Значение `0` означает отсутствие ограничений.
:::

Смотрите также:
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)
## max_thread_pool_free_size {#max_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
Если количество **простых** потоков в глобальном пуле потоков превышает [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size), то ClickHouse освободит ресурсы, занимаемые некоторыми потоками, и размер пула уменьшится. Потоки могут быть созданы снова при необходимости.

**Пример**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```
## max_thread_pool_size {#max_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
ClickHouse использует потоки из глобального пула потоков для обработки запросов. Если нет свободного потока для обработки запроса, то в пуле создается новый поток. `max_thread_pool_size` ограничивает максимальное количество потоков в пуле.

**Пример**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```
## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Количество потоков для загрузки неактивного набора частей данных (неожиданных) при запуске.
## max_view_num_to_throw {#max_view_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Если количество представлений превышает это значение, сервер вызовет исключение.

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

<SettingsInfoBlock type="UInt64" default_value="10000" />
Если количество подключенных представлений превышает указанное значение, сервер ClickHouse добавит сообщения о предупреждении в таблицу `system.warnings`.

**Пример**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```
## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Лимит на общее количество одновременно ожидающих запросов.
Выполнение ожидающего запроса блокируется, пока требуемые таблицы загружаются асинхронно (см. [`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases).

:::note
Ожидающие запросы не учитываются при проверке лимитов, контролируемых следующими настройками:

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

Это исправление выполняется, чтобы избежать достижения этих лимитов сразу после запуска сервера.
:::

:::note

Значение `0` (по умолчанию) означает отсутствие ограничений.

Эту настройку можно изменить во время выполнения, она вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::
## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

<SettingsInfoBlock type="Bool" default_value="0" />
Должен ли фоновый рабочий процесс памяти корректировать внутренний отслеживатель памяти на основе информации из внешних источников, таких как jemalloc и cgroups
## memory_worker_period_ms {#memory_worker_period_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Период тиков фонового рабочего процесса памяти, который корректирует использования памяти отслеживателя памяти и очищает неиспользуемые страницы во время увеличенного использования памяти. Если установить в 0, будет использоваться значение по умолчанию в зависимости от источника использования памяти.
## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

<SettingsInfoBlock type="Bool" default_value="1" />Использовать текущую информацию о использовании памяти cgroup для корректировки отслеживания памяти.
## merge_tree {#merge_tree} 

Тонкая настройка для таблиц в [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Для получения дополнительной информации смотрите файл заголовка MergeTreeSettings.h.

**Пример**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## merge_workload {#merge_workload} 

<SettingsInfoBlock type="String" default_value="default" />
Используется для регулирования того, как ресурсы используются и распределяются между слияниями и другими рабочими нагрузками. Указанное значение используется как значение настройки `workload` для всех фоновых слияний. Может быть переопределено настройкой дерева слияния.

**Смотрите также**
- [Планирование рабочей нагрузки](/operations/workload-scheduling.md)
## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Устанавливает предел на количество ОЗУ, которое разрешено использовать для выполнения операций слияния и мутации.
Если ClickHouse достигнет установленного предела, он не будет планировать новые фоновые операции слияния или мутации, но продолжит выполнять уже запланированные задачи.

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```
## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />
Значение по умолчанию для `merges_mutations_memory_usage_soft_limit` рассчитывается как `memory_amount * merges_mutations_memory_usage_to_ram_ratio`.

**Смотрите также:**

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

Чтобы отключить настройку `metric_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />Минимальное отношение между временем ожидания CPU ОС (метрика OSCPUWaitMicroseconds) и временем занятости (метрика OSCPUVirtualTimeMicroseconds), чтобы рассмотреть возможность разрыва соединений. Линейная интерполяция между минимальным и максимальным соотношением используется для расчета вероятности, вероятность равна 0 в этот момент.
## mlock_executable {#mlock_executable} 

Выполните `mlockall` после запуска, чтобы снизить задержку первых запросов и предотвратить выгрузку исполняемого файла ClickHouse при высоких IO нагрузках.

:::note
Рекомендуется включить эту опцию, однако она приведет к увеличению времени запуска на несколько секунд.
Имейте в виду, что эта настройка не будет работать без возможности "CAP_IPC_LOCK".
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```
## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />
Устанавливает размер кэша (в байтах) для отображенных файлов. Эта настройка позволяет избежать частых вызовов открытия/закрытия (которые очень дорогостоящие из-за сопутствующих нарушений страниц) и повторно использовать отображения из нескольких потоков и запросов. Значение настройки — это количество отображенных регионов (обычно равное количеству отображенных файлов).

Объем данных в отображенных файлах можно отслеживать в следующих системных таблицах с помощью следующих метрик:

| Системная таблица                                                                                                                                                                                                                                                                                                                                                       | Метрика                                                                                                   |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [`system.metrics`](/operations/system-tables/metrics) и [`system.metric_log`](/operations/system-tables/metric_log)                                                                                                                                                                                                                              | `MMappedFiles` и `MMappedFileBytes`                                                                    |
| [`system.asynchronous_metrics_log`](/operations/system-tables/asynchronous_metric_log)                                                                                                                                                                                                                                                                     | `MMapCacheCells`                                                                                         |
| [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)  | `CreatedReadBufferMMap`, `CreatedReadBufferMMapFailed`, `MMappedFileCacheHits`, `MMappedFileCacheMisses` |

:::note
Объем данных в отображенных файлах не потребляет память напрямую и не учитывается в использовании памяти запросов или сервера — потому что эта память может быть освобождена так же, как кэш страниц ОС. Кэш автоматически удаляется (файлы закрываются) при удалении старых частей в таблицах семейства MergeTree, также его можно удалить вручную с помощью запроса `SYSTEM DROP MMAP CACHE`.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::
## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />
Используется для регулирования того, как ресурсы используются и распределяются между мутациями и другими рабочими нагрузками. Указанное значение используется как значение настройки `workload` для всех фоновых мутаций. Может быть переопределено настройкой дерева слияния.

**Смотрите также**
- [Планирование рабочей нагрузки](/operations/workload-scheduling.md)
## mysql_port {#mysql_port} 

Порт для связи с клиентами по протоколу MySQL.

:::note
- Положительные целые числа указывают номер порта для прослушивания
- Пустые значения используются для отключения связи с клиентами по протоколу MySQL.
:::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```
## openSSL {#openssl} 

Настройка SSL клиента/сервера.

Поддержка SSL обеспечивается библиотекой `libpoco`. Доступные варианты конфигурации объяснены в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи для настроек сервера/клиента:

| Параметр                       | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Значение по умолчанию                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| `privateKeyFile`              | Путь к файлу с секретным ключом PEM-сертификата. Файл может содержать одновременно и ключ, и сертификат.                                                                                                                                                                                                                                                                                                                                              |                                                   |
| `certificateFile`             | Путь к файлу сертификата клиента/сервера в формате PEM. Вы можете опустить его, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                                                |                                                   |
| `caConfig`                    | Путь к файлу или директории, содержащей доверенные сертификаты CA. Если это указывает на файл, он должен быть в формате PEM и может содержать несколько сертификатов CA. Если это указывает на директорию, она должна содержать один .pem файл на каждый сертификат CA. Имена файлов ищутся по хешу имени субъекта CA. Подробности можно найти в справочной странице [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                                   |
| `verificationMode`            | Метод проверки сертификатов узла. Подробности в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                         | `relaxed`                                  |
| `verificationDepth`           | Максимальная длина цепочки проверки. Проверка завершится неудачей, если длина цепочки сертификатов превышает установленное значение.                                                                                                                                                                                                                                                                                                                                            | `9`                                        |
| `loadDefaultCAFile`           | Использовать ли встроенные сертификаты CA для OpenSSL. ClickHouse предполагает, что встроенные сертификаты CA находятся в файле `/etc/ssl/cert.pem` (или в директории `/etc/ssl/certs`) или в файле (или директории), указанном переменной окружения `SSL_CERT_FILE` (или `SSL_CERT_DIR`).                                                                                                                                                                        | `true`                                     |
| `cipherList`                  | Поддерживаемые шифрования OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | Включает или отключает кэширование сессий. Должен использоваться в сочетании с `sessionIdContext`. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                         | `false`                                    |
| `sessionIdContext`            | Уникальный набор случайных символов, который сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Этот параметр всегда рекомендуется, так как он помогает избежать проблем как если сервер кэширует сессию, так и если клиент запрашивает кэширование.                                                                                                                                                        | `$\{application.name\}`                      |
| `sessionCacheSize`            | Максимальное количество сессий, которые сервер кэширует. Значение `0` означает неограниченное количество сессий.                                                                                                                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | Время для кэширования сессии на сервере в часах.                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                        |
| `extendedVerification`        | Если включено, проверяет, соответствует ли CN или SAN сертификата имени узла-собеседника.                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `requireTLSv1`                | Требовать соединение TLSv1. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `requireTLSv1_1`              | Требовать соединение TLSv1.1. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `requireTLSv1_2`              | Требовать соединение TLSv1.2. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `fips`                        | Активирует режим FIPS OpenSSL. Поддерживается, если версия библиотеки OpenSSL поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                    |
| `privateKeyPassphraseHandler` | Класс (подкласс PrivateKeyPassphraseHandler), который запрашивает пароль для доступа к закрытому ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | Класс (подкласс CertificateHandler) для проверки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` .                                                                                                                                                                                                                                                                           | `RejectCertificateHandler`                 |
| `disableProtocols`            | Протоколы, которые не разрешено использовать.                                                                                                                                                                                                                                                                                                                                                                                                                             |                                                   |
| `preferServerCiphers`         | Предпочтительные серверные шифры клиента.                                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                    |

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
## os_cpu_busy_time_threshold {#os_cpu_busy_time_threshold} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Порог времени занятости CPU ОС в микросекундах (метрика OSCPUVirtualTimeMicroseconds), чтобы считать CPU выполняющим полезную работу, превышение этого значения не будет считаться перегрузкой CPU.
## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

<SettingsInfoBlock type="Double" default_value="0.15" />Доля ограниченной памяти, которую следует держать свободной от кэша страниц пользовательского пространства. Аналогично настройке min_free_kbytes в Linux.
## page_cache_history_window_ms {#page_cache_history_window_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Задержка перед тем, как освобожденная память может быть использована кэшем страниц пользовательского пространства.
## page_cache_max_size {#page_cache_max_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальный размер кэша страниц пользовательского пространства. Установите в 0, чтобы отключить кэш. Если больше, чем page_cache_min_size, размер кэша будет непрерывно регулироваться в пределах этого диапазона, чтобы использовать большую часть доступной памяти, сохраняя общее использование памяти ниже лимита (max_server_memory_usage[_to_ram_ratio]).
## page_cache_min_size {#page_cache_min_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />Минимальный размер кэша страниц пользовательского пространства.
## page_cache_policy {#page_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша страниц пользовательского пространства.
## page_cache_shards {#page_cache_shards} 

<SettingsInfoBlock type="UInt64" default_value="4" />Разделите кэш страниц пользовательского пространства на указанное количество шардов, чтобы уменьшить конфликты мьютексов. Экспериментально, маловероятно, что улучшит производительность.
## page_cache_size_ratio {#page_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди в кэше страниц пользовательского пространства относительно общего размера кэша.
## part_log {#part_log} 

Логирование событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Например, добавление или объединение данных. Вы можете использовать лог для симуляции алгоритмов объединения и сравнения их характеристик. Вы можете визуализировать процесс объединения.

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

<SettingsInfoBlock type="UInt64" default_value="30" />
Период для полного удаления частей для SharedMergeTree. Доступно только в ClickHouse Cloud.
## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />
Добавить равномерно распределенное значение от 0 до x секунд к kill_delay_period, чтобы избежать эффекта громкого стада и последующего DoS ZooKeeper в случае очень большого количества таблиц. Доступно только в ClickHouse Cloud.
## parts_killer_pool_size {#parts_killer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />
Потоки для очистки устаревших потоков общего дерева слияния. Доступно только в ClickHouse Cloud.
## path {#path} 

Путь к директории, содержащей данные.

:::note
Требуется добавлять завершающий слеш.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```
## postgresql_port {#postgresql_port} 

Порт для общения с клиентами по протоколу PostgreSQL.

:::note
- Положительные целые числа указывают номер порта, на который следует слушать
- Пустые значения используются для отключения связи с клиентами по протоколу MySQL.
:::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```
## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />Размер фонов pool для предзагрузки для удаленных объектных хранилищ.
## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно поместить в пул предзагрузки.
## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
Максимальное количество задач, которые могут быть запланированы в пуле потоков десериализации префиксов.

:::note
Значение `0` означает отсутствие ограничений.
:::
## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

<SettingsInfoBlock type="Bool" default_value="0" />
Если true, ClickHouse создает все настроенные таблицы `system.*_log` перед запуском. Это может быть полезно, если некоторые сценарии запуска зависят от этих таблиц.
## primary_index_cache_policy {#primary_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики кэша первичного индекса.
## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />Соотношение общего размера кэша меток, которое нужно заполнить во время предварительного разогрева.
## primary_index_cache_size {#primary_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />Максимальный размер кэша для первичного индекса (индекс таблиц семейства MergeTree).
## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае политики SLRU) в кэше первичного индекса относительно общего размера кэша.
## process_query_plan_packet {#process_query_plan_packet} 

<SettingsInfoBlock type="Bool" default_value="0" />
Эта настройка позволяет читать пакет QueryPlan. Этот пакет отправляется для распределенных запросов, когда serialize_query_plan включен.
По умолчанию отключено, чтобы избежать возможных проблем безопасности, которые могут быть вызваны ошибками в бинарной десериализации плана запроса.

**Пример**

```xml
<process_query_plan_packet>true</process_query_plan_packet>
```
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

Экспорт метрик для извлечения из [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP-эндпоинт для извлечения метрик сервером prometheus. Начинается с '/'.
- `port` – Порт для `endpoint`.
- `metrics` – Экспортировать метрики из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Экспортировать метрики из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Экспортировать текущие значения метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).
- `errors` - Отображать количество ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эта информация также может быть получена из [system.errors](/operations/system-tables/errors).

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

Определите прокси-серверы для HTTP и HTTPS-запросов, в настоящее время поддерживаемых хранилищем S3, табличными функциями S3 и URL-функциями.

Есть три способа определить прокси-серверы:
- переменные окружения
- списки прокси
- удаленные резолверы прокси.

Отключение прокси-серверов для определенных хостов также поддерживается с использованием `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать прокси-сервер для данного протокола. Если он установлен в вашей системе, он должен работать без проблем.

Это самый простой подход, если у данного протокола есть только один прокси-сервер и этот прокси-сервер не меняется.

**Списки прокси**

Этот подход позволяет указать один или несколько прокси-серверов для протокола. Если указано более одного прокси-сервера, ClickHouse использует разные прокси по круговому принципу, балансируя нагрузку между серверами. Это самый простой подход, если есть более одного прокси-сервера для протокола и список прокси-серверов не меняется.

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

**Удаленные резолверы прокси**

Возможно, что прокси-серверы изменяются динамически. В этом случае вы можете определить конечную точку резолвера. ClickHouse отправляет пустой GET-запрос на эту конечную точку, удаленный резолвер должен вернуть хост прокси. ClickHouse использует его для формирования URI прокси с использованием следующего шаблона: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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
| `<http>` | Список одного или нескольких резолверов* |
| `<https>` | Список одного или нескольких резолверов* |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| Поле       | Описание                                   |
|-------------|-----------------------------------------------|
| `<resolver>` | Конечная точка и другие детали для резолвера |

:::note
Вы можете иметь несколько элементов `<resolver>`, но используется только первый
`<resolver>` для данного протокола. Все остальные элементы `<resolver>`
для этого протокола игнорируются. Это означает, что балансировка нагрузки
(если необходимо) должна осуществляться удаленным резолвером.
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| Поле               | Описание                                                                                                                                                                            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | URI резолвера прокси                                                                                                                                                          |
| `<proxy_scheme>`    | Протокол окончательного URI прокси. Это может быть либо `http`, либо `https`.                                                                                                             |
| `<proxy_port>`      | Номер порта резолвера прокси                                                                                                                                                  |
| `<proxy_cache_time>` | Время в секундах, в течение которого значения от резолвера должны храниться в кэше ClickHouse. Установка этого значения в `0` приводит к тому, что ClickHouse будет обращаться к резолверу для каждого HTTP или HTTPS запроса. |

  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:

| Порядок | Настройка                |
|-------|------------------------|
| 1.    | Удаленные резолверы прокси |
| 2.    | Списки прокси            |
| 3.    | Переменные окружения  |

ClickHouse проверит резолвер самого высокого приоритета для запрашиваемого протокола. Если он не определен,
он проверит следующий тип резолвера более низкого приоритета, пока не дойдет до резолвера окружения.
Это также позволяет использовать комбинацию типов резолверов.
## query_cache {#query_cache} 

Конфигурация [кэша запросов](../query-cache.md).

Доступные настройки:

| Настройка                   | Описание                                                                            | Значение по умолчанию |
|---------------------------|----------------------------------------------------------------------------------------|---------------|
| `max_size_in_bytes`       | Максимальный размер кэша в байтах. `0` означает, что кэш запросов отключен.                | `1073741824`  |
| `max_entries`             | Максимальное количество результатов запросов `SELECT`, хранящихся в кэше.                      | `1024`        |
| `max_entry_size_in_bytes` | Максимальный размер в байтах, который могут иметь результаты запросов `SELECT`, для сохранения в кэше.    | `1048576`     |
| `max_entry_size_in_rows`  | Максимальное количество строк, которые могут иметь результаты запросов `SELECT`, для сохранения в кэше.   | `30000000`    |

:::note
- Измененные настройки вступают в силу немедленно.
- Данные для кэша запросов выделяются в DRAM. Если память ограничена, убедитесь, что вы установили маленькое значение для `max_size_in_bytes` или полностью отключили кэш запросов.
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

<SettingsInfoBlock type="String" default_value="SLRU" />Название политики кэша условий запроса.
## query_condition_cache_size {#query_condition_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />
Максимальный размер кэша условий запроса.
:::note
Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::
## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае политики SLRU) в кэше условий запроса относительно общего размера кэша.
## query_log {#query_log} 

Настройка для логирования запросов, полученных с настройкой [log_queries=1](../../operations/settings/settings.md).

Запросы записываются в таблицу [system.query_log](/operations/system-tables/query_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и новая таблица создается автоматически.

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

Правила на основе регулярных выражений, которые будут применяться к запросам, а также ко всем сообщениям журнала перед их сохранением в серверных логах,
[`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) таблицах и в логах, отправленных клиенту. Это позволяет предотвратить
утечку конфиденциальных данных из SQL-запросов, таких как имена, электронные адреса, персональные идентификаторы или номера кредитных карт в логи.

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
|-----------|-------------------------------------------------------------------------------|
| `name`    | название правила (необязательно)                                                  |
| `regexp`  | регулярное выражение совместимое с RE2 (обязательно)                                 |
| `replace` | строка замещения для конфиденциальных данных (необязательно, по умолчанию - шесть звездочек) |

Правила маскировки применяются ко всему запросу (для предотвращения утечек конфиденциальных данных из неправильно сформулированных или непарсируемых запросов).

Таблица [`system.events`](/operations/system-tables/events) имеет счетчик `QueryMaskingRulesMatch`, который содержит общее количество совпадений правил маскировки запросов.

Для распределенных запросов каждый сервер должен быть сконфигурирован отдельно, в противном случае подзапросы, переданные другим
узлам, будут храниться без маскировки.
## query_metric_log {#query_metric_log} 

По умолчанию отключено.

**Включение**

Чтобы вручную включить сбор истории метрик для [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md), создайте файл `/etc/clickhouse-server/config.d/query_metric_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `query_metric_log`, вам нужно создать следующий файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_thread_log {#query_thread_log} 

Настройка для логирования потоков запросов, полученных с настройкой [log_query_threads=1](/operations/settings/settings#log_query_threads).

Запросы записываются в таблицу [system.query_thread_log](/operations/system-tables/query_thread_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала потоков запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и новая таблица создается автоматически.

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

Запросы записываются в таблицу [system.query_views_log](/operations/system-tables/query_views_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала представлений запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и новая таблица создается автоматически.

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
- [Обнаружение кластера](../../operations/cluster-discovery.md)
- [Движок базы данных с репликацией](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts} 

Список хостов, которые разрешены к использованию в движках хранилища и табличными функциями, связанными с URL.

При добавлении хоста с помощью XML-тега `\<host\>`:
- он должен быть указан точно так же, как в URL, так как имя проверяется до разрешения DNS. Например: `<host>clickhouse.com</host>`
- если порт явно указан в URL, то проверяется хост:порт как единое целое. Например: `<host>clickhouse.com:80</host>`
- если хост указан без порта, то разрешен любой порт данного хоста. Например: если указан `<host>clickhouse.com</host>`, то `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т.д. разрешены.
- если хост указан как IP-адрес, то он проверяется, как указано в URL. Например: `[2a02:6b8:a::a]`.
- если есть перенаправления и поддержка перенаправлений включена, проверяется каждое перенаправление (поле location).

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## replica_group_name {#replica_group_name} 

Имя группы реплик для базы данных Replicated.

Кластер, созданный реплицированной базой данных, будет состоять из реплик в одной группе.
DDL-запросы будут ожидать только реплики в одной группе.

По умолчанию пусто.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```
## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />HTTP-таймаут для соединений запросов на получение частей. Унаследован от профиля по умолчанию `http_connection_timeout`, если не установлен явно.
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />HTTP-таймаут для запросов на получение частей. Унаследован от профиля по умолчанию `http_receive_timeout`, если не установлен явно.
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />HTTP-таймаут для запросов на отправку частей. Унаследован от профиля по умолчанию `http_send_timeout`, если не установлен явно.
## replicated_merge_tree {#replicated_merge_tree} 

Точная настройка для таблиц в [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Эта настройка имеет более высокий приоритет.

Для получения дополнительной информации см. заголовочный файл MergeTreeSettings.h.

**Пример**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```
## restore_threads {#restore_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков для выполнения запросов RESTORE.
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

Настройки для отправки отчетов о сбоях команде разработчиков ClickHouse.

Включение этой функции, особенно в средах предшествующей эксплуатации, высоко ценится.

Ключи:

| Ключ                   | Описание                                                                                                                          |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | Логический флаг для включения функции, по умолчанию `true`. Установите в `false`, чтобы избежать отправки отчетов о сбоях.                                |
| `send_logical_errors` | `LOGICAL_ERROR` подобен `assert`, это ошибка в ClickHouse. Этот логический флаг включает отправку этих исключений (по умолчанию: `true`). |
| `endpoint`            | Вы можете переопределить URL конечной точки для отправки отчетов о сбоях.                                                                         |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## series_keeper_path {#series_keeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />
Путь в Keeper с автоинкрементными номерами, создаваемыми функцией `generateSerialID`. Каждая серия будет являться узлом под этим путем.
## show_addresses_in_stack_traces {#show_addresses_in_stack_traces} 

<SettingsInfoBlock type="Bool" default_value="1" />Если установлено в true, будут показаны адреса в стек-трейсах.
## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores} 

<SettingsInfoBlock type="Bool" default_value="1" />Если установлено в true, ClickHouse будет ждать завершения работающих резервных копий и восстановления перед выключением.
## shutdown_wait_unfinished {#shutdown_wait_unfinished} 

<SettingsInfoBlock type="UInt64" default_value="5" />Задержка в секундах для ожидания незавершенных запросов.
## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />Если установлено в true, ClickHouse будет ждать завершения работающих запросов перед выключением.
## ssh_server {#ssh_server} 

Публичная часть ключа хоста будет записана в файл known_hosts
на стороне SSH клиента при первом соединении.

Конфигурации ключа хоста по умолчанию неактивны.
Раскомментируйте конфигурации ключа хоста и укажите путь к соответствующему ssh ключу, чтобы активировать их:

Пример:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## startup_mv_delay_ms {#startup_mv_delay_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />Отладочный параметр для имитации задержки создания материализованного представления.
## storage_configuration {#storage_configuration} 

Позволяет для многодисковой конфигурации хранения.

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

Конфигурация `disks` следует приведенной ниже структуре:

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
| `path`                  | Путь, по которому будут храниться серверные данные (каталоги `data` и `shadow`). Он должен заканчиваться на `/` |
| `keep_free_space_bytes` | Размер зарезервированного свободного пространства на диске.                                                              |

:::note
Порядок дисков не имеет значения.
:::
### Конфигурация политик {#configuration-of-policies}

Подтеги выше определяют следующие настройки для `policies`:

| Настройка                   | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`             | Название политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `volume_name_N`             | Имя тома. Имена томов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `disk`                      | Диск, расположенный внутри тома.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes`   | Максимальный размер фрагмента данных, который может находиться на любом из дисков в этом томе. Если в результате объединения размер фрагмента превышает `max_data_part_size_bytes`, фрагмент будет записан на следующий том. В основном эта функция позволяет хранить новые / небольшие фрагменты на горячем (SSD) томе и перемещать их на холодный (HDD) том, когда они достигают большого размера. Не используйте эту опцию, если у политики только один том.                  |
| `move_factor`               | Доля доступного свободного места на томе. Если пространства становится меньше, данные начнут перемещаться на следующий том, если таковой имеется. Для переноса фрагменты сортируются по размеру от большего к меньшему (в порядке убывания), и выбираются фрагменты, общий размер которых достаточен для выполнения условия `move_factor`, если общий размер всех фрагментов недостаточен, будут перемещены все фрагменты.                                          |
| `perform_ttl_move_on_insert` | Отключает перемещение данных с истекшим TTL при вставке. По умолчанию (если включено), если мы вставляем часть данных, которая уже истекла согласно правилу перемещения по времени жизни, она немедленно перемещается на том / диске, который указан в правиле перемещения. Это может значительно замедлить вставку в случае, если целевой том / диск медленный (например, S3). Если отключено, истекшая часть данных записывается на стандартный том, а затем немедленно перемещается на том, указанном в правиле для истекшего TTL. |
| `load_balancing`            | Политика балансировки дисков, `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `least_used_ttl_ms`         | Устанавливает тайм-аут (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - всегда обновлять, `-1` - никогда не обновлять, значение по умолчанию `60000`). Обратите внимание, если диск используется только ClickHouse и не будет подвергаться изменению размера файловой системы в реальном времени, вы можете использовать значение `-1`. Во всех остальных случаях это не рекомендуется, так как это в конечном итоге приведет к неправильному распределению пространства. |
| `prefer_not_to_merge`       | Отключает объединение частей данных на этом томе. Примечание: это потенциально опасно и может вызвать замедление работы. Когда эта настройка включена (не делайте этого), объединение данных на этом томе запрещено (что плохо). Это позволяет контролировать, как ClickHouse взаимодействует с медленными дисками. Мы рекомендуем вообще не использовать это.                                                                                                                             |
| `volume_priority`           | Определяет приоритет (порядок), в котором заполняются тома. Чем меньше значение, тем выше приоритет. Значения параметров должны быть натуральными числами и охватывать диапазон от 1 до N (N - наибольшее указанное значение параметра) без пропусков.                                                                                                                                                                                                                             |

Для `volume_priority`:
- Если все тома имеют этот параметр, они имеют приоритет в указанном порядке.
- Если только _некоторые_ тома имеют его, тома, которые его не имеют, имеют самый низкий приоритет. Тома, у которых он есть, имеют приоритет в соответствии с значением тега, приоритет остальных определяется порядком описания в файле конфигурации относительно друг друга.
- Если _нет_ томов, которым дан этот параметр, их порядок определяется порядком описания в файле конфигурации.
- Приоритет томов может не совпадать.
## storage_connections_soft_limit {#storage_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />Соединения выше этого лимита имеют значительно более короткое время жизни. Лимит применяется к соединениям с хранилищами.
## storage_connections_store_limit {#storage_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />Соединения выше этого лимита сбрасываются после использования. Установите на 0, чтобы отключить кэш соединения. Лимит применяется к соединениям с хранилищами.
## storage_connections_warn_limit {#storage_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Предупреждающие сообщения записываются в журналы, если количество используемых соединений превышает этот лимит. Лимит применяется к соединениям с хранилищами.
## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

<SettingsInfoBlock type="Bool" default_value="0" />Запись файлов метаданных диска с форматом VERSION_FULL_OBJECT_KEY
## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

<SettingsInfoBlock type="Bool" default_value="1" />Если включено, внутренний UUID генерируется во время создания SharedSet и SharedJoin. Только ClickHouse Cloud
## table_engines_require_grant {#table_engines_require_grant} 

Если установить значение true, пользователи требуют предоставления прав для создания таблицы с конкретным движком, например `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию для обратной совместимости создание таблицы с конкретным движком таблицы игнорирует грант, однако вы можете изменить это поведение, установив это значение в true.
:::
## tables_loader_background_pool_size {#tables_loader_background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Устанавливает количество потоков, выполняющих асинхронные загрузочные задачи в фоновом пуле. Фоновый пул используется для асинхронной загрузки таблиц после старта сервера в случае если нет запросов, ожидающих таблицы. Рекомендуется держать низкое количество потоков в фоновом пуле, если таблиц много. Это зарезервирует ресурсы CPU для параллельного выполнения запросов.

:::note
Значение `0` означает, что будут использоваться все доступные CPU.
:::
## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Устанавливает количество потоков, выполняющих загрузочные задачи вForeground пуле. Передний пул используется для синхронной загрузки таблицы до того, как сервер начнет слушать на порту, и для загрузки таблиц, которые ожидаются. Передний пул имеет более высокий приоритет, чем фоновый пул. Это значит, что никакая работа не начинается в фоновом пуле, пока выполняются работы в переднем пуле.

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

Порт для SSH-сервера, который позволяет пользователю подключаться и выполнять запросы интерактивно, используя встроенный клиент через PTY.

Пример:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## temporary_data_in_cache {#temporary_data_in_cache} 

С этой опцией временные данные будут храниться в кэше для конкретного диска. В этом разделе следует указать имя диска с типом `cache`. В этом случае кэш и временные данные будут делить одно и то же пространство, и кэш диска может быть вытеснен для создания временных данных.

:::note
Можно использовать только одну опцию для конфигурации хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
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

Настройки для системной таблицы [text_log](/operations/system-tables/text_log) для журналирования текстовых сообщений.

<SystemLogParameters/>

Дополнительно:

| Настройка | Описание                                                                                                                                                                                                 | Значение по умолчанию |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| `level`   | Максимальный уровень сообщения (по умолчанию `Trace`), который будет храниться в таблице.                                                                                                             | `Trace`               |

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

<SettingsInfoBlock type="UInt64" default_value="10000" />
Максимальное количество заданий, которые могут быть запланированы в глобальном пуле потоков. Увеличение размера очереди приводит к большему использованию памяти. Рекомендуется держать это значение равным [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size).

:::note
Значение `0` означает неограниченное.
:::

**Пример**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```
## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />Размер фонового пула для запросов на запись в объектные хранилища
## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно добавить в фоновый пул для запросов на запись в объектные хранилища
## throw_on_unknown_workload {#throw_on_unknown_workload} 

<SettingsInfoBlock type="Bool" default_value="0" />
Определяет поведение при доступе к неизвестной WORKLOAD с параметром запроса 'workload'.

- Если `true`, выбрасывается исключение RESOURCE_ACCESS_DENIED от запроса, который пытается получить доступ к неизвестной нагрузке. Полезно для обеспечения планирования ресурсов для всех запросов после установки иерархии WORKLOAD и добавления WORKLOAD по умолчанию.
- Если `false` (по умолчанию), неограниченный доступ без планирования ресурсов предоставляется запросу с параметром 'workload', указывающим на неизвестную нагрузку. Это важно во время настройки иерархии WORKLOAD, перед добавлением WORKLOAD по умолчанию.

**Пример**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**См. также**
- [Планирование рабочей нагрузки](/operations/workload-scheduling.md)
## timezone {#timezone} 

Часовой пояс сервера.

Указывается как идентификатор IANA для часового пояса UTC или географического местоположения (например, Africa/Abidjan).

Часовой пояс необходим для преобразований между строками и форматами DateTime, когда поля DateTime выводятся в текстовый формат (выводятся на экран или в файл), и при получении DateTime из строки. Кроме того, часовой пояс используется в функциях, работающих со временем и датой, если они не получили часовой пояс в параметрах ввода.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**См. также**

- [session_timezone](../settings/settings.md#session_timezone)
## tmp_path {#tmp_path} 

Путь в локальной файловой системе для хранения временных данных для обработки больших запросов.

:::note
- Можно использовать только одну опцию для конфигурации хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- Заключительная косая черта обязательна.
:::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## tmp_policy {#tmp_policy} 

Политика для хранения временных данных. Более подробную информацию смотрите в документации [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree).

:::note
- Можно использовать только одну опцию для конфигурации хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes` игнорируются.
- Политика должна иметь *один том* с *локальными* дисками.
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

Определяет список пользовательских доменов верхнего уровня для добавления, где каждая запись имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

См. также:
- функция [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) и ее вариации,
  которая принимает имя списка пользовательских TLD, возвращая часть домена, которая содержит домены верхнего уровня вплоть до первого значимого поддомена.
## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Собирает случайные аллокации размером меньше или равным указанному значению с вероятностью, равной `total_memory_profiler_sample_probability`. 0 означает отключено. Вы можете установить 'max_untracked_memory' на 0, чтобы этот порог работал как ожидается.
## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Собирает случайные аллокации размером больше или равным указанному значению с вероятностью, равной `total_memory_profiler_sample_probability`. 0 означает отключено. Вы можете установить 'max_untracked_memory' на 0, чтобы этот порог работал как ожидается.
## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />Каждый раз, когда использование памяти сервера превышает следующий шаг в байтах, профайлер памяти будет собирать трассировку стека аллокации. Ноль означает отключенный профайлер памяти. Значения ниже нескольких мегабайт замедлят работу сервера.
## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />
Позволяет собирать случайные аллокации и деалокации и записывать их в системную таблицу [system.trace_log](../../operations/system-tables/trace_log.md) с `trace_type`, равным `MemorySample`, с указанной вероятностью. Вероятность применяется к каждой аллокации или деалокации, независимо от размера аллокации. Обратите внимание, что выборка происходит только тогда, когда объем неотслеживаемой памяти превышает лимит неотслеживаемой памяти (значение по умолчанию `4` MiB). Его можно уменьшить, если [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step) уменьшить. Вы можете установить `total_memory_profiler_step` равным `1` для более точной выборки.

Возможные значения:

- Положительное целое число.
- `0` — Запись случайных аллокаций и деалокаций в системную таблицу `system.trace_log` отключена.
## trace_log {#trace_log} 

Настройки для выполнения системной таблицы [trace_log](/operations/system-tables/trace_log).

<SystemLogParameters/>

Стандартный файл конфигурации сервера `config.xml` содержит следующий раздел настроек:

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

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша без сжатия.
## uncompressed_cache_size {#uncompressed_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальный размер (в байтах) для несжатых данных, используемых движками таблиц из семейства MergeTree.

Существует один общий кэш для сервера. Память выделяется по мере необходимости. Кэш используется, если опция `use_uncompressed_cache` включена.

Несжатый кэш полезен для очень коротких запросов в индивидуальных случаях.

:::note
Значение `0` означает отключено.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::
## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае политики SLRU) в несжатом кэше относительно общего размера кэша.
## url_scheme_mappers {#url_scheme_mappers} 

Конфигурация для перевода сокращенных или символических префиксов URL в полные URL.

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

Метод хранения заголовков частей данных в ZooKeeper. Эта настройка применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Она может быть определена:

**Глобально в разделе [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует настройку для всех таблиц на сервере. Вы можете изменить настройку в любое время. Существующие таблицы изменяют свое поведение, когда настраивается изменение.

**Для каждой таблицы**

При создании таблицы укажите соответствующую [настройку движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этой настройкой не изменится, даже если глобальная настройка изменится.

**Возможные значения**

- `0` — Функция отключена.
- `1` — Функция включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицированные](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки частей данных компактно, используя один `znode`. Если таблица содержит много колонок, этот метод хранения значительно уменьшает объем данных, хранящихся в ZooKeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` вы не сможете понизить ClickHouse сервер до версии, не поддерживающей эту настройку. Будьте осторожны при обновлении ClickHouse на серверах кластера. Не обновляйте все серверы одновременно. Безопаснее всего тестировать новые версии ClickHouse в тестовой среде или только на нескольких серверах кластера.

Заголовки частей данных, уже хранящиеся с этой настройкой, не могут быть восстановлены к их предыдущему (не компактному) представлению.
:::
## user_defined_executable_functions_config {#user_defined_executable_functions_config} 

Путь к файлу конфигурации для исполняемых пользовательских функций.

Путь:

- Укажите абсолютный путь или путь относительного к файлу конфигурации сервера.
- Путь может содержать подстановочные знаки \* и ?.

См. также:
- "[Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions).".

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## user_defined_path {#user_defined_path} 

Директория с пользовательскими определенными файлами. Используется для SQL пользовательских определенных функций [SQL пользовательские определенные функции](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## user_directories {#user_directories} 

Раздел файла конфигурации, который содержит настройки:
- Путь к файлу конфигурации с предопределенными пользователями.
- Путь к папке, в которой пользователи, созданные с помощью SQL-команд, хранятся.
- Путь к узлу ZooKeeper, где пользователи, созданные с помощью SQL-команд, хранятся и реплицируются (экспериментально).

Если этот раздел указан, путь из [users_config](/operations/server-configuration-parameters/settings#users_config) и [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) не будет использоваться.

Секция `user_directories` может содержать любое количество элементов, порядок элементов определяет их приоритет (чем выше элемент, тем выше приоритет).

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

Чтобы добавить LDAP-сервер в качестве удаленного каталога пользователей, которые не определены локально, определите единую секцию `ldap` со следующими настройками:

| Настройка | Описание                                                                                                                                                                                                                                                                                                                                                                    |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server`  | одно из имен LDAP-серверов, определенных в разделе конфигурации `ldap_servers`. Этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                          |
| `roles`   | раздел со списком локально определенных ролей, которые будут назначены каждому пользователю, полученному из LDAP-сервера. Если роли не указаны, пользователь не сможет выполнять никаких действий после аутентификации. Если какая-либо из указанных ролей не определена локально на момент аутентификации, попытка аутентификации потерпит неудачу, как если бы предоставленный пароль был неверным. |

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

Директория с пользовательскими файлами. Используется в табличной функции [file()](../../sql-reference/table-functions/file.md), [fileCluster()](../../sql-reference/table-functions/fileCluster.md).

**Пример**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
## user_scripts_path {#user_scripts_path} 

Директория с пользовательскими файлами скриптов. Используется для исполняемых пользовательских определенных функций [Исполняемые пользовательские определенные функции](/sql-reference/functions/udf#executable-user-defined-functions).

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
- Настройки профилей.
- Настройки квот.

**Пример**

```xml
<users_config>users.xml</users_config>
```
## validate_tcp_client_information {#validate_tcp_client_information} 

<SettingsInfoBlock type="Bool" default_value="0" />Определяет, включена ли проверка информации клиента при получении пакета запроса.

По умолчанию это `false`:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```
## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />Размер кэша для индекса векторного сходства в записях. Ноль означает отключено.
## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша для индекса векторного сходства.
## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />Размер кэша для индексов векторного сходства. Ноль означает отключено.

:::note
Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::
## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup} 

<SettingsInfoBlock type="Bool" default_value="1" />
Эта настройка позволяет указать поведение, если `dictionaries_lazy_load` равно `false`.
(Если `dictionaries_lazy_load` равно `true`, эта настройка не влияет ни на что.)

Если `wait_dictionaries_load_at_startup` равно `false`, то сервер начнет загружать все словари при запуске и будет принимать подключения параллельно с этой загрузкой.
Когда словарь используется в запросе в первый раз, запрос будет ждать, пока словарь загрузится, если он еще не загружен.
Установка `wait_dictionaries_load_at_startup` в `false` может ускорить запуск ClickHouse, однако некоторые запросы могут выполняться медленнее
(поскольку им придется ждать загрузки некоторых словарей).

Если `wait_dictionaries_load_at_startup` равно `true`, то сервер будет ждать при запуске
пока все словари завершат свою загрузку (успешно или нет) перед тем, как принимать какие-либо подключения.

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
- [Иерархия нагрузки](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path} 

Путь к узлу ZooKeeper, который используется в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для согласованности все SQL определения хранятся в качестве значения этого единственного znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**См. также**
- [Иерархия нагрузки](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
## zookeeper {#zookeeper} 

Содержит настройки, которые позволяют ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицируемых таблиц. Если реплицируемые таблицы не используются, этот раздел параметров можно опустить.

Следующие настройки могут быть сконфигурированы с помощью подметок:

| Параметр                                  | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|-------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                    | Узел ZooKeeper. Вы можете установить несколько узлов. Например, `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` указывает порядок узла при попытке подключиться к кластеру ZooKeeper.                                                                                                                                                                                                                                                                                           |
| `session_timeout_ms`                      | Максимальный тайм-аут для клиентской сессии в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `operation_timeout_ms`                    | Максимальный тайм-аут для одной операции в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `root` (опционально)                      | Znode, который используется в качестве корня для znodes, используемых сервером ClickHouse.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `fallback_session_lifetime.min` (опционально) | Минимальный лимит для продолжительности сессии zookeeper к резервному узлу, когда основной недоступен (балансировка нагрузки). Устанавливается в секундах. По умолчанию: 3 часа.                                                                                                                                                                                                                                                                                                                           |
| `fallback_session_lifetime.max` (опционально) | Максимальный лимит для продолжительности сессии zookeeper к резервному узлу, когда основной недоступен (балансировка нагрузки). Устанавливается в секундах. По умолчанию: 6 часов.                                                                                                                                                                                                                                                                                                                          |
| `identity` (опционально)                  | Имя пользователя и пароль, необходимые для ZooKeeper для доступа к запрашиваемым znodes.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `use_compression` (опционально)           | Включает сжатие в протоколе Keeper, если установлено в true.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

Существует также настройка `zookeeper_load_balancing` (опционально), которая позволяет выбрать алгоритм выбора узла ZooKeeper:

| Название алгоритма                 | Описание                                                                                                                     |
|------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `random`                           | случайно выбирает один из узлов ZooKeeper.                                                                                |
| `in_order`                         | выбирает первый узел ZooKeeper, если он недоступен, то второй, и так далее.                                              |
| `nearest_hostname`                 | выбирает узел ZooKeeper с именем хоста, наиболее похожим на имя хоста сервера, имя хоста сравнивается с префиксом имени. |
| `hostname_levenshtein_distance`    | так же, как nearest_hostname, но сравнивает имя хоста с учетом расстояния Левенштейна.                                     |
| `first_or_random`                  | выбирает первый узел ZooKeeper, если он недоступен, тогда случайно выбирает один из оставшихся узлов ZooKeeper.            |
| `round_robin`                      | выбирает первый узел ZooKeeper, если происходит восстановление соединения, выбирает следующий.                             |

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
    <!-- Опционально. Строка доступа к zookeeper digest ACL. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**См. также**

- [Репликация](../../engines/table-engines/mergetree-family/replication.md)
- [Руководство для программиста ZooKeeper](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [Опциональная безопасная связь между ClickHouse и ZooKeeper](/operations/ssl-zookeeper)
