---
slug: '/operations/server-configuration-parameters/settings'
sidebar_label: 'Настройки сервера'
sidebar_position: 57
description: 'Этот раздел содержит описания настроек сервера, то есть настроек,'
title: 'Настройки сервера'
keywords: ['глобальные настройки сервера']
doc_type: reference
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/i18n/ru/docusaurus-plugin-content-docs/current/operations/server-configuration-parameters/_snippets/_system-log-parameters.md';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';


# Настройки сервера

Этот раздел содержит описания настроек сервера. Это настройки, которые не могут быть изменены на уровне сессии или запроса.

Для получения дополнительной информации о файлах конфигурации в ClickHouse смотрите [""Файлы конфигурации""](/operations/configuration-files).

Другие настройки описаны в разделе ""[Настройки](/operations/settings/overview)"".
Перед изучением настроек мы рекомендуем прочитать раздел [Файлы конфигурации](/operations/configuration-files) и обратить внимание на использование подстановок (атрибуты `incl` и `optional`).
## abort_on_logical_error {#abort_on_logical_error} 

<SettingsInfoBlock type="Bool" default_value="0" />Завершение работы сервера при возникновении исключений LOGICAL_ERROR. Только для экспертов.
## access_control_improvements {#access_control_improvements} 

Настройки для опциональных улучшений в системе контроля доступа.

| Настройка                                         | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | По умолчанию |
|---------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `users_without_row_policies_can_read_rows`        | Устанавливает, могут ли пользователи без разрешений на строки все же читать строки с помощью запроса `SELECT`. Например, если есть два пользователя A и B и политика строк определена только для A, то если эта настройка истинна, пользователь B увидит все строки. Если эта настройка ложна, пользователь B не увидит никаких строк.                                                                                                                                           | `true`       |
| `on_cluster_queries_require_cluster_grant`        | Устанавливает, требуется ли для запросов `ON CLUSTER` разрешение `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `true`       |
| `select_from_system_db_requires_grant`            | Устанавливает, требуется ли для `SELECT * FROM system.<table>` какие-либо разрешения и может ли он выполняться любым пользователем. Если установлено в `true`, этот запрос требует `GRANT SELECT ON system.<table>`, так же как и для нестандартных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые постоянные таблицы, такие как `one`, `contributors`) все еще доступны для всех; и если предоставлено привилегия `SHOW` (например, `SHOW USERS`), то соответствующая системная таблица (т.е. `system.users`) будет доступна. | `true`       |
| `select_from_information_schema_requires_grant`   | Устанавливает, требуется ли для `SELECT * FROM information_schema.<table>` какие-либо разрешения и может ли он выполняться любым пользователем. Если установлено в `true`, этот запрос требует `GRANT SELECT ON information_schema.<table>`, так же как и для обычных таблиц.                                                                                                                                                                                                                                                            | `true`       |
| `settings_constraints_replace_previous`           | Устанавливает, будет ли ограничение в профиле настроек для некоторой настройки отменять действия предыдущего ограничения (определенного в других профилях) для этой настройки, включая поля, которые не устанавливаются новым ограничением. Также включает тип ограничения `changeable_in_readonly`.                                                                                                                                                                                                               | `true`       |
| `table_engines_require_grant`                     | Устанавливает, требуется ли разрешение для создания таблицы с определенным движком таблицы.                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false`      |
| `role_cache_expiration_time_seconds`              | Устанавливает количество секунд с момента последнего доступа, на которое роль сохраняется в кеше ролей.                                                                                                                                                                                                                                                                                                                                                                                                                           | `600`        |

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

<SettingsInfoBlock type="GroupArrayActionWhenLimitReached" default_value="throw" />Действие, которое нужно выполнить, когда максимальный размер элемента массива превышен в groupArray: `выбросить` исключение или `отбросить` лишние значения.
## aggregate_function_group_array_max_element_size {#aggregate_function_group_array_max_element_size} 

<SettingsInfoBlock type="UInt64" default_value="16777215" />Максимальный размер элемента массива в байтах для функции groupArray. Этот лимит проверяется при сериализации и помогает избежать большого размера состояния.
## allow_feature_tier {#allow_feature_tier} 

<SettingsInfoBlock type="UInt32" default_value="0" />
Контролирует, может ли пользователь изменять настройки, связанные с различными уровнями функций.

- `0` - Разрешены изменения любой настройки (экспериментальные, бета, производственные).
- `1` - Разрешены изменения только для настроек бета и производственных функций. Изменения экспериментальных настроек отклоняются.
- `2` - Разрешены изменения только для производственных настроек. Изменения экспериментальных или бета-настроек отклоняются.

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

<SettingsInfoBlock type="Bool" default_value="1" />Разрешает использование памяти jemalloc.
## allowed_disks_for_table_engines {#allowed_disks_for_table_engines} 

Список дисков, разрешенных для использования с Iceberg.
## async_insert_queue_flush_on_shutdown {#async_insert_queue_flush_on_shutdown} 

<SettingsInfoBlock type="Bool" default_value="1" />Если истинно, очередь асинхронных вставок очищается при корректном завершении работы.
## async_insert_threads {#async_insert_threads} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков для фактического разбора и вставки данных в фоновом режиме. Ноль означает, что асинхронный режим отключен.
## async_load_databases {#async_load_databases} 

<SettingsInfoBlock type="Bool" default_value="1" />
Асинхронная загрузка баз данных и таблиц.

- Если `true`, все нестандартные базы данных с движком `Ordinary`, `Atomic` и `Replicated` будут загружены асинхронно после запуска сервера ClickHouse. Смотрите таблицу `system.asynchronous_loader`, параметры сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к таблице, которая еще не загружена, будет ждать, пока эта таблица не будет запущена. Если задача загрузки завершилась неудачно, запрос выбросит ошибку (вместо завершения всей работы сервера в случае `async_load_databases = false`). Таблица, которая ожидалась хотя бы одним запросом, будет загружена с более высоким приоритетом. DDL-запросы на базу данных будут ждать, пока эта база данных не будет запущена. Также рассмотрите возможность установки лимита `max_waiting_queries` для общего числа ожидающих запросов.
- Если `false`, все базы данных загружаются при старте сервера.

**Пример**

```xml
<async_load_databases>true</async_load_databases>
```
## async_load_system_database {#async_load_system_database} 

<SettingsInfoBlock type="Bool" default_value="0" />
Асинхронная загрузка системных таблиц. Полезно, если есть большое количество таблиц журналов и частей в базе данных `system`. Независимо от настройки `async_load_databases`.

- Если установлено в `true`, все системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружены асинхронно после запуска сервера ClickHouse. Смотрите таблицу `system.asynchronous_loader`, параметры сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к системной таблице, которая еще не загружена, будет ждать, пока эта таблица не будет запущена. Таблица, которая ожидалась хотя бы одним запросом, будет загружена с более высоким приоритетом. Также рассмотрите возможность установки параметра `max_waiting_queries`, чтобы ограничить общее количество ожидающих запросов.
- Если установлено в `false`, системная база данных загружается перед запуском сервера.

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

Включен по умолчанию при развертывании ClickHouse Cloud.

Если настройка по умолчанию не включена в вашей среде, в зависимости от способа установки ClickHouse, вы можете следовать инструкциям ниже, чтобы включить или отключить ее.

**Включение**

Чтобы вручную включить сбор истории асинхронных логов метрик [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md), создайте файл `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` со следующим содержимым:

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

<SettingsInfoBlock type="Bool" default_value="0" />Включить расчёт тяжелых асинхронных метрик.
## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s} 

<SettingsInfoBlock type="UInt32" default_value="1" />Период в секундах для обновления асинхронных метрик.
## auth_use_forwarded_address {#auth_use_forwarded_address} 

Использовать исходный адрес для аутентификации клиентов, подключенных через прокси.

:::note
Эту настройку следует использовать с особой осторожностью, поскольку перенаправленные адреса могут быть легко подделаны — сервера, принимающие такую аутентификацию, не должны быть доступны непосредственно, а только через доверенный прокси.
:::
## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которые будут использоваться для выполнения операций сброса для [таблиц с движком Buffer](/engines/table-engines/special/buffer) в фоновом режиме.
## background_common_pool_size {#background_common_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Максимальное количество потоков, которые будут использоваться для выполнения различных операций (в большинстве случаев сборки мусора) для таблиц с [*MergeTree-engine](/engines/table-engines/mergetree-family) в фоновом режиме.
## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которые будут использоваться для выполнения распределенных операций отправки.
## background_fetches_pool_size {#background_fetches_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которые будут использоваться для извлечения частей данных из другой реплики для [*MergeTree-engine](/engines/table-engines/mergetree-family) в фоновом режиме.
## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio} 

<SettingsInfoBlock type="Float" default_value="2" />
Устанавливает соотношение между количеством потоков и количеством фоновых слияний и мутаций, которые могут выполняться одновременно.

Например, если отношение равно 2 и [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size) установлено в 16, то ClickHouse может выполнять 32 фоновых слияния одновременно. Это возможно, потому что фоновые операции могут быть приостановлены и отложены. Это необходимо, чтобы дать маленьким слияниям больше приоритета при выполнении.

:::note
Вы можете только увеличить это соотношение во время выполнения. Чтобы уменьшить его, необходимо перезапустить сервер.

Как и параметр [`background_pool_size`](/operations/server-configuration-parameters/settings#background_pool_size), [`background_merges_mutations_concurrency_ratio`](/operations/server-configuration-parameters/settings#background_merges_mutations_concurrency_ratio) может быть применен из профиля `default` для обеспечения обратной совместимости.
:::
## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy} 

<SettingsInfoBlock type="String" default_value="round_robin" />
Политика определения порядка выполнения фоновых слияний и мутаций. Возможные значения: `round_robin` и `shortest_task_first`.

Алгоритм, используемый для выбора следующего слияния или мутации, которые будут выполняться пулом фоновых потоков. Политика может быть изменена во время выполнения без перезапуска сервера.
Может быть применена из профиля `default` для обеспечения обратной совместимости.

Возможные значения:

- `round_robin` — Каждое одновременное слияние и мутация выполняются по круговому принципу, чтобы обеспечить отсутствие голодания. Меньшие слияния завершаются быстрее, чем большие, просто потому, что у них меньше блоков для слияния.
- `shortest_task_first` — Всегда выполняйте меньшее слияние или мутацию. Слияния и мутации получают приоритеты на основе их конечного размера. Слияния с меньшими размерами строго предпочтительнее больших. Эта политика обеспечивает как можно быстрее слияние малых частей, но может привести к бесконечному голоданию больших слияний в партициях, перегруженных `INSERT`-ами.
## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />Максимальное количество потоков, которые будут использоваться для выполнения фоновых операций для потоковой передачи сообщений.
## background_move_pool_size {#background_move_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Максимальное количество потоков, которые будут использоваться для перемещения частей данных на другой диск или том для таблиц с *MergeTree-engine в фоновом режиме.
## background_pool_size {#background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />
Устанавливает количество потоков, выполняющих фоновые слияния и мутации для таблиц с движками MergeTree.

:::note
- Эта настройка также может быть применена при запуске сервера из конфигурации профиля `default` для обеспечения обратной совместимости при старте сервера ClickHouse.
- Вы можете только увеличить количество потоков во время выполнения.
- Чтобы уменьшить количество потоков, необходимо перезапустить сервер.
- Настройка этой параметрой управляет загрузкой CPU и диска.
:::

:::danger
Размер пула меньше использует ресурсы CPU и диска, но фоновые процессы развиваются медленнее, что может в конечном итоге повлиять на производительность запросов.
:::

Перед изменением обратите внимание и на связанные настройки MergeTree, такие как:
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_lower_max_size_of_merge).
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number_of_free_entries_in_pool_to_execute_mutation).
- [`number_of_free_entries_in_pool_to_execute_optimize_entire_partition`](/operations/settings/merge-tree-settings#number_of_free_entries_in_pool_to_execute_optimize_entire_partition)

**Пример**

```xml
<background_pool_size>16</background_pool_size>
```
## background_schedule_pool_max_parallel_tasks_per_type_ratio {#background_schedule_pool_max_parallel_tasks_per_type_ratio} 

<SettingsInfoBlock type="Float" default_value="0.8" />Максимальное соотношение потоков в пуле, которые могут одновременно выполнять задачи одного типа.
## background_schedule_pool_size {#background_schedule_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="512" />Максимальное количество потоков, которые будут использоваться для постоянного выполнения некоторых легковесных периодических операций для реплицируемых таблиц, потоковой передачи Kafka и обновлений кэша DNS.
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

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />Максимальное количество потоков для выполнения запросов `BACKUP`.
## backups {#backups} 

Настройки для резервного копирования, используемые при записи `BACKUP TO File()`.

Следующие настройки могут быть настроены с помощью подметок:

| Настройка                             | Описание                                                                                                                                                                    | По умолчанию |
|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `allowed_path`                        | Путь для резервного копирования при использовании `File()`. Эта настройка должна быть установлена для использования `File`. Путь может быть относительным к каталогу экземпляра или абсолютным.              | `true`       |
| `remove_backup_files_after_failure`   | Если команда `BACKUP` завершается неудачно, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до сбоя, иначе он оставит скопированные файлы без изменений. | `true`       |

Эта настройка конфигурируется по умолчанию, как:

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальное количество заданий, которые могут быть запланированы в пуле потоков ввода-вывода резервных копий. Рекомендуется оставить эту очередь неограниченной из-за текущей логики резервного копирования S3.

:::note
Значение `0` (по умолчанию) означает неограниченно.
:::
## bcrypt_workfactor {#bcrypt_workfactor} 

Фактор работы для типа аутентификации `bcrypt_password`, который использует [алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).
Фактор работы определяет количество вычислений и времени, необходимых для вычисления хеша и проверки пароля.

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
Для приложений с высокой частотой аутентификации,
рассмотрите альтернативные методы аутентификации из-за
вычислительных затрат bcrypt при более высоких факторах работы.
:::
## blob_storage_log {#blob_storage_log} 

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

Интервал в секундах перед перезагрузкой встроенных словарей.

ClickHouse перезагружает встроенные словари каждые x секунд. Это позволяет редактировать словари "на лету" без перезапуска сервера.

**Пример**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```
## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Установите максимальное соотношение размера кеша к ОЗУ. Позволяет снижать размер кеша на системах с низкой памятью.
## cannot_allocate_thread_fault_injection_probability {#cannot_allocate_thread_fault_injection_probability} 

<SettingsInfoBlock type="Double" default_value="0" />Для целей тестирования.
## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time} 

<SettingsInfoBlock type="UInt64" default_value="15" />
Интервал в секундах, в течение которого максимальное разрешенное потребление памяти сервером настраивается соответствующим порогом в cgroups.

Чтобы отключить наблюдатель cgroup, установите это значение в `0`.
## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Устанавливает размер кеша (в элементах) для [составленных выражений](../../operations/caches.md).
## compiled_expression_cache_size {#compiled_expression_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="134217728" />Устанавливает размер кеша (в байтах) для [составленных выражений](../../operations/caches.md).
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

**Действия при выполнении условий**:

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

<SettingsInfoBlock type="String" default_value="fair_round_robin" />
Политика по определению порядка распределения слотов CPU, указанных в `concurrent_threads_soft_limit_num` и `concurrent_threads_soft_limit_ratio_to_cores`. Алгоритм, используемый для регулирования того, как ограниченное количество слотов CPU распределяется между одновременными запросами. Планировщик может быть изменен во время выполнения без перезапуска сервера.

Возможные значения:

- `round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads` слотов CPU. Один слот на поток. В случае конфликта слоты CPU выделяются запросам по круговому принципу. Обратите внимание, что первый слот выделяется без условий, что может привести к несправедливости и увеличению задержки запросов с высоким `max_threads` при наличии большого количества запросов с `max_threads` = 1.
- `fair_round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads - 1` слотов CPU. Вариант `round_robin`, не требующий слот CPU для первого потока каждого запроса. Таким образом запросы с `max_threads` = 1 не требуют никаких слотов и не могут несправедливо выделить все слоты. Слоты не выделяются без условий.
## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальное количество потоков обработки запросов, не включая потоки для извлечения данных из удаленных серверов, разрешенных для выполнения всех запросов. Это не жесткий лимит. В случае достижения лимита запрос все равно получит как минимум один поток для выполнения. Запрос может увеличить желаемое количество потоков во время выполнения, если станет доступно больше потоков.

:::note
Значение `0` (по умолчанию) означает неограниченно.
:::
## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores} 

<SettingsInfoBlock type="UInt64" default_value="0" />То же самое, что и [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num), но с соотношением к ядрам.
## config_reload_interval_ms {#config_reload_interval_ms} 

<SettingsInfoBlock type="UInt64" default_value="2000" />
Как часто ClickHouse будет перезагружать конфигурацию и проверять новые изменения.
## core_dump {#core_dump} 

Конфигурирует мягкий лимит для размера файла дампа памяти.

:::note
Жесткий лимит настраивается с помощью системных инструментов.
:::

**Пример**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```
## cpu_slot_preemption {#cpu_slot_preemption} 

<SettingsInfoBlock type="Bool" default_value="0" />
Определяет, как выполняется планирование загрузки для ресурсов CPU (MASTER THREAD и WORKER THREAD).

- Если `true` (рекомендуется), учёт ведется на основе фактического времени CPU, которое было использовано. Число CPU-вычислений будет выделено конкурентным рабочим нагрузкам. Слоты выделяются на ограниченный период времени и запрашиваются повторно по истечении срока. Запрос слота может блокировать выполнение потока в случае перегрузки ресурсов CPU, т.е. может произойти предвосхищение. Это обеспечивает справедливость времени CPU.
- Если `false` (по умолчанию), учёт ведется на основе количества выделенных слотов CPU. Число слотов CPU будет справедливо выделено конкурентным рабочим нагрузкам. Слот выделяется, когда поток начинает выполнение, удерживается непрерывно и освобождается, когда поток завершает выполнение. Число потоков, выделенных для выполнения запросов, может только увеличиваться с 1 до `max_threads` и никогда не уменьшаться. Это более выгодно для долгосрочных запросов и может привести к голоданию коротких запросов.

**Пример**

```xml
<cpu_slot_preemption>true</cpu_slot_preemption>
```

**Смотрите также**
- [Планирование рабочей нагрузки](/operations/workload-scheduling.md)
## cpu_slot_preemption_timeout_ms {#cpu_slot_preemption_timeout_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
Определяет, сколько миллисекунд может ждать рабочий поток во время предвосхищения, т.е. в ожидании, когда будет предоставлен другой слот CPU. После этого времени ожидания, если поток не смог получить новый слот CPU, он завершит работу, а запрос будет уменьшен до меньшего количества одновременно выполняемых потоков динамически. Обратите внимание, что главный поток никогда не уменьшается, но может быть предвосхищен без ограничения. Имеет смысл только при включенном `cpu_slot_preemption` и если ресурс CPU определен для WORKER THREAD.

**Пример**

```xml
<cpu_slot_preemption_timeout_ms>1000</cpu_slot_preemption_timeout_ms>
```

**Смотрите также**
- [Планирование рабочей нагрузки](/operations/workload-scheduling.md)
## cpu_slot_quantum_ns {#cpu_slot_quantum_ns} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />
Определяет, сколько наносекунд CPU разрешено потоку потреблять после получения слота CPU и перед тем, как он должен запросить другой слот CPU. Имеет смысл только при включенном `cpu_slot_preemption` и если ресурс CPU определен для MASTER THREAD или WORKER THREAD.

**Пример**

```xml
<cpu_slot_quantum_ns>10000000</cpu_slot_quantum_ns>
```

**Смотрите также**
- [Планирование рабочей нагрузки](/operations/workload-scheduling.md)
## crash_log {#crash_log} 

Настройки для работы системной таблицы [crash_log](../../operations/system-tables/crash_log.md).

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

Эта настройка определяет путь к кешу для пользовательских (созданных из SQL) кешированных дисков.
`custom_cached_disks_base_directory` имеет более высокий приоритет для пользовательских дисков, чем `filesystem_caches_path` (найден в `filesystem_caches_path.xml`),
который используется, если первый отсутствует.
Путь для кеша файловой системы должен находиться внутри этого каталога,
в противном случае будет выброшено исключение, предотвращающее создание диска.

:::note
Это не повлияет на диски, созданные в предыдущей версии, для которой сервер был обновлён.
В этом случае исключение не будет выброшено, чтобы сервер мог успешно запуститься.
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

<SettingsInfoBlock type="UInt64" default_value="480" />
Задержка, в течение которой удаляемую таблицу можно восстановить с помощью оператора [`UNDROP`](/sql-reference/statements/undrop.md). Если `DROP TABLE` выполняется с модификатором `SYNC`, настройка игнорируется.
По умолчанию это значение равно `480` (8 минут).
## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec} 

<SettingsInfoBlock type="UInt64" default_value="5" />В случае неудачного удаления таблицы ClickHouse будет ждать на этом время перед повторной попыткой выполнения операции.
## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency} 

<SettingsInfoBlock type="UInt64" default_value="16" />Размер пула потоков, используемого для удаления таблиц.
## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec} 

<SettingsInfoBlock type="UInt64" default_value="86400" />
Параметр задачи, которая очищает мусор из каталога `store/`.
Устанавливает период планирования задачи.

:::note
Значение `0` означает "никогда". Значение по умолчанию соответствует 1 дню.
:::
## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec} 

<SettingsInfoBlock type="UInt64" default_value="3600" />
Параметр задачи, которая очищает мусор из каталога `store/`.
Если какая-либо подкаталога не используется сервером clickhouse и этот каталог не изменялся в течение последних
[`database_catalog_unused_dir_hide_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec) секунд, задача "скроет" этот каталог, удалив все права доступа. Это также работает для каталогов, которые сервер clickhouse не ожидает увидеть внутри `store/`.

:::note
Значение `0` означает "немедленно".
:::
## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec}

<SettingsInfoBlock type="UInt64" default_value="2592000" />
Параметр задачи, которая очищает мусор из директории `store/`.
Если какая-либо поддиректория не используется `clickhouse-server` и ранее была "скрыта"
(см. [database_catalog_unused_dir_hide_timeout_sec](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_hide_timeout_sec))
и эта директория не была изменена в течение последних
[`database_catalog_unused_dir_rm_timeout_sec`](/operations/server-configuration-parameters/settings#database_catalog_unused_dir_rm_timeout_sec) секунд, задача удалит эту директорию.
Он также работает для директорий, которые `clickhouse-server` не ожидает видеть внутри `store/`.

:::note
Значение `0` означает "никогда". Значение по умолчанию соответствует 30 дням.
:::
## database_replicated_allow_detach_permanently {#database_replicated_allow_detach_permanently}

<SettingsInfoBlock type="Bool" default_value="1" />Позволяет навсегда отсоединять таблицы в реплицированных базах данных.
## dead_letter_queue {#dead_letter_queue}

Настройка для системной таблицы 'dead_letter_queue'.

<SystemLogParameters/>

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

Тайм-аут сессии по умолчанию, в секундах.

```xml
<default_session_timeout>60</default_session_timeout>
```
## dictionaries_config {#dictionaries_config}

Путь к файлу конфигурации для словарей.

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

<SettingsInfoBlock type="Bool" default_value="1" />
Ленивая загрузка словарей.

- Если `true`, тогда каждый словарь загружается при первом использовании. Если загрузка не удалась, функция, использующая словарь, выбрасывает исключение.
- Если `false`, тогда сервер загружает все словари при старте.

:::note
Сервер будет ждать при старте, пока все словари завершат свою загрузку, прежде чем принимать какие-либо подключения
(исключение: если [`wait_dictionaries_load_at_startup`](/operations/server-configuration-parameters/settings#wait_dictionaries_load_at_startup) установлено в `false`).
:::

**Пример**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```
## dictionary_background_reconnect_interval {#dictionary_background_reconnect_interval}

<SettingsInfoBlock type="UInt64" default_value="1000" />Интервал в миллисекундах для попыток повторного подключения неудачных MySQL и Postgres словарей с включенной `background_reconnect`.
## disable_insertion_and_mutation {#disable_insertion_and_mutation}

<SettingsInfoBlock type="Bool" default_value="0" />
Отключает все запросы вставки/изменения/удаления. Эта настройка будет включена, если кому-то нужны узлы только для чтения, чтобы предотвратить влияние вставок и мутаций на производительность чтения.
## disable_internal_dns_cache {#disable_internal_dns_cache}

<SettingsInfoBlock type="Bool" default_value="0" />Отключает внутренний кэш DNS. Рекомендуется для работы ClickHouse в системах с часто меняющейся инфраструктурой, таких как Kubernetes.
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию используется туннелирование (т.е. `HTTP CONNECT`) для выполнения `HTTPS` запросов через `HTTP` прокси. Эта настройка может быть использована для его отключения.

**no_proxy**

По умолчанию все запросы проходят через прокси. Для отключения его для конкретных хостов, необходимо установить переменную `no_proxy`.
Ее можно установить внутри клаузулы `<proxy>` для списковых и удаленных резолверов, а также как переменную окружения для резолвера окружения.
Поддерживаются IP-адреса, домены, подсистемы и символ `'*'` для полного обхода. Ведущие точки отбрасываются так же, как это делает curl.

**Пример**

Следующая конфигурация обходит прокси-запросы к `clickhouse.cloud` и ко всем его подсистемам (например, `auth.clickhouse.cloud`).
То же самое применяется к GitLab, даже несмотря на наличие ведущей точки. И `gitlab.com`, и `about.gitlab.com` будут обходить прокси.

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

<SettingsInfoBlock type="UInt64" default_value="5000" />Соединения выше этого лимита имеют значительно более короткое время жизни. Ограничение применяется к дисковым соединениям.
## disk_connections_store_limit {#disk_connections_store_limit}

<SettingsInfoBlock type="UInt64" default_value="30000" />Соединения выше этого лимита сбрасываются после использования. Установите значение 0, чтобы отключить кэш соединений. Ограничение применяется к дисковым соединениям.
## disk_connections_warn_limit {#disk_connections_warn_limit}

<SettingsInfoBlock type="UInt64" default_value="10000" />Предупреждающие сообщения записываются в журналы, если количество используемых соединений превышает этот лимит. Ограничение применяется к дисковым соединениям.
## display_secrets_in_show_and_select {#display_secrets_in_show_and_select}

<SettingsInfoBlock type="Bool" default_value="0" />
Включает или отключает отображение секретов в запросах `SHOW` и `SELECT` для таблиц, баз данных, табличных функций и словарей.

Пользователь, желающий видеть секреты, также должен иметь
[`format_display_secrets_in_show_and_select` формат настройки](../settings/formats#format_display_secrets_in_show_and_select)
включенным и привилегию
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Возможные значения:

- `0` — Отключено.
- `1` — Включено.
## distributed_cache_apply_throttling_settings_from_client {#distributed_cache_apply_throttling_settings_from_client}

<SettingsInfoBlock type="Bool" default_value="1" />Определяет, должен ли сервер кэша применять настройки ограничения, полученные от клиента.
## distributed_cache_keep_up_free_connections_ratio {#distributed_cache_keep_up_free_connections_ratio}

<SettingsInfoBlock type="Float" default_value="0.1" />Мягкий лимит на количество активных соединений, которые распределенный кэш будет пытаться поддерживать свободными. После того как количество свободных соединений опускается ниже distributed_cache_keep_up_free_connections_ratio * max_connections, соединения с самой старой активностью будут закрыты до тех пор, пока число не превысит лимит.
## distributed_ddl {#distributed_ddl}

Управляет выполнением [распределенных ddl запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) в кластере.
Работает только если включен [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper).

Настраиваемые параметры внутри `<distributed_ddl>` включают:

| Параметр                | Описание                                                                                                                       | Значение по умолчанию                          |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| `path`                 | путь в Keeper для `task_queue` для DDL запросов                                                                           |                                        |
| `profile`              | профиль, используемый для выполнения DDL запросов                                                                                       |                                        |
| `pool_size`            | сколько запросов `ON CLUSTER` может выполняться одновременно                                                                           |                                        |
| `max_tasks_in_queue`   | максимальное количество задач, которые могут находиться в очереди.                                                                             | `1,000`                                |
| `task_max_lifetime`    | удалить узел, если его возраст превышает это значение.                                                                                | `7 * 24 * 60 * 60` (неделя в секундах) |
| `cleanup_delay_period` | очистка начинается после получения нового события узла, если последняя очистка не проводилась не ранее чем `cleanup_delay_period` секунд назад. | `60` секунд                           |

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
## dns_allow_resolve_names_to_ipv4 {#dns_allow_resolve_names_to_ipv4}

<SettingsInfoBlock type="Bool" default_value="1" />Позволяет разрешать имена в ipv4 адреса.
## dns_allow_resolve_names_to_ipv6 {#dns_allow_resolve_names_to_ipv6}

<SettingsInfoBlock type="Bool" default_value="1" />Позволяет разрешать имена в ipv6 адреса.
## dns_cache_max_entries {#dns_cache_max_entries}

<SettingsInfoBlock type="UInt64" default_value="10000" />Максимальное количество записей внутреннего кэша DNS.
## dns_cache_update_period {#dns_cache_update_period}

<SettingsInfoBlock type="Int32" default_value="15" />Период обновления внутреннего кэша DNS в секундах.
## dns_max_consecutive_failures {#dns_max_consecutive_failures}

<SettingsInfoBlock type="UInt32" default_value="10" />Максимальное количество последующих неудач разрешения DNS имени хоста, прежде чем удалить имя хоста из кэша DNS ClickHouse.
## drop_distributed_cache_pool_size {#drop_distributed_cache_pool_size}

<SettingsInfoBlock type="UInt64" default_value="8" />Размер пула потоков, используемого для удаления распределенного кэша.
## drop_distributed_cache_queue_size {#drop_distributed_cache_queue_size}

<SettingsInfoBlock type="UInt64" default_value="1000" />Размер очереди пула потоков, используемого для удаления распределенного кэша.
## enable_azure_sdk_logging {#enable_azure_sdk_logging}

<SettingsInfoBlock type="Bool" default_value="0" />Включает логирование из Azure sdk.
## encryption {#encryption}

Конфигурирует команду для получения ключа, который будет использоваться кодеками [шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должны быть записаны в переменные окружения или установлены в файл конфигурации.

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
Хранение ключей в файле конфигурации не рекомендуется. Это небезопасно. Вы можете переместить ключи в отдельный конфигурационный файл на безопасном диске и создать для него символическую ссылку в папке `config.d/`.
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

Также пользователи могут добавить nonce, который должен иметь длину 12 байт (по умолчанию процессы шифрования и расшифровки используют nonce, состоящий из нулевых байтов):

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
Все вышесказанное может применяться к `aes_256_gcm_siv` (но ключ должен быть длиной 32 байта).
:::
## error_log {#error_log}

Он отключен по умолчанию.

**Включение**

Чтобы вручную включить сбор истории ошибок, создайте `/etc/clickhouse-server/config.d/error_log.xml` со следующим содержимым:

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
## format_parsing_thread_pool_queue_size {#format_parsing_thread_pool_queue_size}

<SettingsInfoBlock type="UInt64" default_value="10000" />
Максимальное количество задач, которые могут быть запланированы в пуле потоков для разбора входных данных.

:::note
Значение `0` означает неограниченное.
:::
## format_schema_path {#format_schema_path}

Путь к директории с схемами для входных данных, такими как схемы для формата [CapnProto](../../interfaces/formats.md#capnproto).

**Пример**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## global_profiler_cpu_time_period_ns {#global_profiler_cpu_time_period_ns}

<SettingsInfoBlock type="UInt64" default_value="0" />Период для таймера ЦП глобального профайлера (в наносекундах). Установите значение 0, чтобы отключить глобальный профайлер ЦП. Рекомендуемое значение - не менее 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (раз в секунду) для профилирования по кластеру.
## global_profiler_real_time_period_ns {#global_profiler_real_time_period_ns}

<SettingsInfoBlock type="UInt64" default_value="0" />Период для реального таймера глобального профайлера (в наносекундах). Установите значение 0, чтобы отключить реальный таймер глобального профайлера. Рекомендуемое значение - не менее 10000000 (100 раз в секунду) для одиночных запросов или 1000000000 (раз в секунду) для профилирования по кластеру.
## google_protos_path {#google_protos_path}

Определяет директорию, содержащую proto файлы для типов Protobuf.

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
- `timeout` – Тайм-аут для отправки данных, в секундах.
- `root_path` – Префикс для ключей.
- `metrics` – Отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Отправка дельты данных, накопленных за период времени, из таблицы [system.events](/operations/system-tables/events).
- `events_cumulative` – Отправка кумулятивных данных из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Отправка данных из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Вы можете настроить несколько клауз `<graphite>`. Например, вы можете использовать это для отправки различных данных с различными интервалами.

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

Настройки для уменьшения данных для Graphite.

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

Срок действия HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. Если вы установите положительное число, HSTS будет включен, а max-age будет равен заданному вами числу.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## http_connections_soft_limit {#http_connections_soft_limit}

<SettingsInfoBlock type="UInt64" default_value="100" />Соединения выше этого лимита имеют значительно более короткое время жизни. Ограничение применяется к http-подключениям, которые не принадлежат никакому диску или хранилищу.
## http_connections_store_limit {#http_connections_store_limit}

<SettingsInfoBlock type="UInt64" default_value="5000" />Соединения выше этого лимита сбрасываются после использования. Установите значение 0, чтобы отключить кэш соединений. Ограничение применяется к http-подключениям, которые не принадлежат никакому диску или хранилищу.
## http_connections_warn_limit {#http_connections_warn_limit}

<SettingsInfoBlock type="UInt64" default_value="1000" />Предупреждающие сообщения записываются в журналы, если количество используемых соединений превышает этот лимит. Ограничение применяется к http-подключениям, которые не принадлежат никакому диску или хранилищу.
## http_handlers {#http_handlers}

Позволяет использовать пользовательские HTTP-обработчики.
Чтобы добавить новый http-обработчик, просто добавьте новую `<rule>`.
Правила проверяются сверху вниз, как определено,
и первое совпадение выполнит обработчик.

Следующие настройки могут быть настроены с помощью под-тэгов:

| Под-тэги             | Определение                                                                                                                                        |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | Для сопоставления URL запроса вы можете использовать префикс 'regex:' для использования регулярного выражения (необязательно)                       |
| `methods`            | Для сопоставления методов запроса вы можете использовать запятые для разделения нескольких совпадений методов (необязательно)                       |
| `headers`            | Для сопоставления заголовков запроса сопоставьте каждый дочерний элемент (имя дочернего элемента — имя заголовка), вы можете использовать префикс 'regex:' для использования регулярного выражения (необязательно) |
| `handler`            | Обработчик запроса                                                                                                                               |
| `empty_query_string` | Проверяйте, что в URL нет строки запроса                                                                                                        |

`handler` содержит следующие настройки, которые можно настроить с помощью под-тэгов:

| Под-тэги           | Определение                                                                                                                                                            |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | Местоположение для перенаправления                                                                                                                                               |
| `type`             | Поддерживаемые типы: static, dynamic_query_handler, predefined_query_handler, redirect                                                                                    |
| `status`           | Используйте с типом static, код состояния ответа                                                                                                                            |
| `query_param_name` | Используйте с типом dynamic_query_handler, извлекает и выполняет значение, соответствующее значению `<query_param_name>` в параметрах HTTP-запроса                                |
| `query`            | Используйте с типом predefined_query_handler, выполняет запрос, когда вызывается обработчик                                                                                     |
| `content_type`     | Используйте с типом static, тип содержимого ответа                                                                                                                           |
| `response_content` | Используйте с типом static, Содержимое ответа, отправляемое клиенту, при использовании префикса 'file://' или 'config://', найдите содержимое из файла или конфигурации, отправляемой клиенту |

Вместе со списком правил, вы можете указать `<defaults/>`, который указывает включить все стандартные обработчики.

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

Используется для добавления заголовков к ответу в запросе HTTP `OPTIONS`.
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

Страница, которая отображается по умолчанию, когда вы получаете доступ к HTTP(s) серверу ClickHouse.
Значение по умолчанию — "Ok." (с переносом строки в конце)

**Пример**

Открывает `https://tabix.io/` при доступе к `http://localhost: http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## iceberg_catalog_threadpool_pool_size {#iceberg_catalog_threadpool_pool_size}

<SettingsInfoBlock type="UInt64" default_value="50" />Размер фона для пула каталога ледянойberg
## iceberg_catalog_threadpool_queue_size {#iceberg_catalog_threadpool_queue_size}

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно поместить в пул каталога ледянойberg
## iceberg_metadata_files_cache_max_entries {#iceberg_metadata_files_cache_max_entries}

<SettingsInfoBlock type="UInt64" default_value="1000" />Максимальный размер кэша файлов метаданных iceberg в записях. Ноль означает отключение.
## iceberg_metadata_files_cache_policy {#iceberg_metadata_files_cache_policy}

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша метаданных iceberg.
## iceberg_metadata_files_cache_size {#iceberg_metadata_files_cache_size}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />Максимальный размер кэша метаданных iceberg в байтах. Ноль означает отключение.
## iceberg_metadata_files_cache_size_ratio {#iceberg_metadata_files_cache_size_ratio}

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае политики SLRU) в кэше метаданных iceberg относительно общего размера кэша.
## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query}

<SettingsInfoBlock type="Bool" default_value="1" />
Если истинно, ClickHouse не записывает значения по умолчанию для пустого оператора SQL безопасности в запросах `CREATE VIEW`.

:::note
Эта настройка необходима только на период миграции и устареет в 24.4
:::
## include_from {#include_from}

Путь к файлу с заменами. Поддерживаются форматы XML и YAML.

Для получения дополнительной информации см. раздел "[Файлы конфигурации](/operations/configuration-files)".

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## index_mark_cache_policy {#index_mark_cache_policy}

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша меток вторичных индексов.
## index_mark_cache_size {#index_mark_cache_size}

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
Максимальный размер кэша для меток индексов.

:::note

Значение `0` означает отключение.

Эту настройку можно изменить во время выполнения, и она немедленно вступит в силу.
:::
## index_mark_cache_size_ratio {#index_mark_cache_size_ratio}

<SettingsInfoBlock type="Double" default_value="0.3" />Размер защищенной очереди (в случае политики SLRU) в кэше меток вторичных индексов относительно общего размера кэша.
## index_uncompressed_cache_policy {#index_uncompressed_cache_policy}

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша для некодированных индексов.
## index_uncompressed_cache_size {#index_uncompressed_cache_size}

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальный размер кэша для некодированных блоков индексов `MergeTree`.

:::note
Значение `0` означает отключение.

Эту настройку можно изменить во время выполнения, и она немедленно вступит в силу.
:::
## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio}

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае политики SLRU) в кэше некодированных индексов относительно общего размера кэша.
## interserver_http_credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Дополнительно, сервер аутентифицирует другие реплики, используя эти учетные данные.
Таким образом, `interserver_http_credentials` должны быть одинаковыми для всех реплик в кластере.

:::note
- По умолчанию, если раздел `interserver_http_credentials` опущен, аутентификация не используется во время репликации.
- Настройки `interserver_http_credentials` не относятся к учетным данным клиента ClickHouse [конфигурации](../../interfaces/cli.md#configuration_files).
- Эти учетные данные общие для репликации через `HTTP` и `HTTPS`.
:::

Следующие настройки могут быть настроены с помощью под-тэгов:

- `user` — Имя пользователя.
- `password` — Пароль.
- `allow_empty` — Если `true`, то другим репликам разрешается подключение без аутентификации, даже если учетные данные установлены. Если `false`, то подключения без аутентификации будут отклонены. По умолчанию: `false`.
- `old` — Содержит старые `user` и `password`, использованные во время вращения учетных данных. Можно указать несколько разделов `old`.

**Вращение Учетных Данных**

ClickHouse поддерживает динамическое вращение учетных данных между серверами без остановки всех реплик одновременно для обновления их конфигурации. Учетные данные могут быть изменены за несколько шагов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволяет подключениям как с аутентификацией, так и без нее.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите `allow_empty` в `false` или удалите эту настройку. Это сделает аутентификацию с новыми учетными данными обязательной.

Чтобы изменить существующие учетные данные, переместите имя пользователя и пароль в раздел `interserver_http_credentials.old` и обновите `user` и `password` новыми значениями. В этот момент сервер использует новые учетные данные для подключения к другим репликам и принимает подключения как с новыми, так и со старыми учетными данными.

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

Имя хоста, которое могут использовать другие серверы для доступа к этому серверу.

Если опущено, оно определяется так же, как команда `hostname -f`.

Полезно, чтобы отвязаться от конкретного сетевого интерфейса.

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

Ограничение для хостов, которые могут обмениваться данными между серверами ClickHouse.
Если используется Keeper, то то же ограничение будет применяться к связи между различными экземплярами Keeper.

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
Максимальное количество задач, которые могут быть запланированы в пуле потоков ввода-вывода.

:::note
Значение `0` означает неограниченное.
:::
## jemalloc_collect_global_profile_samples_in_trace_log {#jemalloc_collect_global_profile_samples_in_trace_log}

<SettingsInfoBlock type="Bool" default_value="0" />Хранит выборочные allocations jemalloc в system.trace_log.
## jemalloc_enable_background_threads {#jemalloc_enable_background_threads}

<SettingsInfoBlock type="Bool" default_value="1" />Включает фоновые потоки jemalloc. Jemalloc использует фоновые потоки для очистки неиспользуемых страниц памяти. Отключение этого может привести к ухудшению производительности.
## jemalloc_enable_global_profiler {#jemalloc_enable_global_profiler}

<SettingsInfoBlock type="Bool" default_value="0" />Включает профайлер allocations jemalloc для всех потоков. Jemalloc будет выбирать allocations и все деалокации для выбранных allocations.
Профили могут быть сброшены с помощью SYSTEM JEMALLOC FLUSH PROFILE, который может использоваться для анализа allocations.
Выборки также могут храниться в system.trace_log с использованием конфигурации jemalloc_collect_global_profile_samples_in_trace_log или с помощью задания запроса jemalloc_collect_profile_samples_in_trace_log.
Смотрите [Профилирование allocations](/operations/allocation-profiling).
## jemalloc_flush_profile_interval_bytes {#jemalloc_flush_profile_interval_bytes}

<SettingsInfoBlock type="UInt64" default_value="0" />Сброс профиля jemalloc будет выполнен после того, как глобальное пиковое использование памяти увеличится на jemalloc_flush_profile_interval_bytes.
## jemalloc_flush_profile_on_memory_exceeded {#jemalloc_flush_profile_on_memory_exceeded}

<SettingsInfoBlock type="Bool" default_value="0" />Сброс профиля jemalloc будет выполнен при ошибках превышения общего объема памяти.
## jemalloc_max_background_threads_num {#jemalloc_max_background_threads_num}

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальное количество фоновых потоков jemalloc для создания, установите в 0, чтобы использовать стандартное значение jemalloc.
## keep_alive_timeout {#keep_alive_timeout}

<SettingsInfoBlock type="Seconds" default_value="30" />
Количество секунд, которое ClickHouse ждет входящих запросов для протокола HTTP, прежде чем закрыть подключение.

**Пример**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## keeper_hosts {#keeper_hosts}

Динамическая настройка. Содержит набор [Zoo]Keeper хостов, к которым ClickHouse может потенциально подключаться. Не раскрывает информацию из ``<auxiliary_zookeepers>``
## keeper_multiread_batch_size {#keeper_multiread_batch_size}

<SettingsInfoBlock type="UInt64" default_value="10000" />
Максимальный размер батча для запроса MultiRead к [Zoo]Keeper, который поддерживает пакетирование. Если установить в 0, пакетирование отключается. Доступно только в ClickHouse Cloud.
## ldap_servers {#ldap_servers} 

Список LDAP серверов с их параметрами подключения для:
- использования их в качестве аутентификаторов для выделенных локальных пользователей, у которых механизм аутентификации 'ldap' указан вместо 'password'
- использования их в качестве удалённых каталогов пользователей.

Следующие настройки могут быть сконфигурированы с помощью под-тегов:

| Настройка                     | Описание                                                                                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                        | Имя хоста или IP адрес LDAP сервера, этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                                                                                                                |
| `port`                        | Порт LDAP сервера, по умолчанию 636, если `enable_tls` установлен в true, в противном случае `389`.                                                                                                                                                                                                                                                                                                                                  |
| `bind_dn`                     | Шаблон, используемый для построения DN для подключения. Полученный DN будет построен, заменив все подстроки `\{user_name\}` шаблона на фактическое имя пользователя во время каждой попытки аутентификации.                                                                                                                                                                                                                            |
| `user_dn_detection`           | Раздел с параметрами поиска LDAP для определения фактического DN пользователя, к которому выполнено подключение. В основном используется в фильтрах поиска для дальнейшего сопоставления ролей, когда сервер является Active Directory. Полученный DN пользователя будет использоваться для замены подстрок `\{user_dn\}` там, где это разрешено. По умолчанию DN пользователя устанавливается равным DN подключения, однако после выполнения поиска он будет обновлён фактическим обнаруженным значением DN пользователя. |
| `verification_cooldown`       | Период времени в секундах после успешной попытки подключения, в течение которого пользователь будет считаться успешно аутентифицированным для всех последовательных запросов без обращения к LDAP серверу. Укажите `0` (по умолчанию), чтобы отключить кэширование и заставить звонить к LDAP серверу для каждого запроса аутентификации.                                                                                                                  |
| `enable_tls`                  | Флаг для активации использования защищенного соединения с LDAP сервером. Укажите `no` для протокола открытого текста (`ldap://`) (не рекомендуется). Укажите `yes` для LDAP по SSL/TLS (`ldaps://`) (рекомендуется, по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (простой текст (`ldap://`), обновленный до TLS).                                                                                          |
| `tls_minimum_protocol_version`| Минимальная версия протокола SSL/TLS. Приемлемые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (по умолчанию).                                                                                                                                                                                                                                                                                                            |
| `tls_require_cert`            | Поведение проверки сертификата SSL/TLS для пиров. Приемлемые значения: `never`, `allow`, `try`, `demand` (по умолчанию).                                                                                                                                                                                                                                                                                                              |
| `tls_cert_file`               | Путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_key_file`                | Путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                                                                                       |
| `tls_ca_cert_file`            | Путь к файлу CA сертификата.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `tls_ca_cert_dir`             | Путь к директории, содержащей CA сертификаты.                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`            | Разрешенный набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                                                                                        |

Настройка `user_dn_detection` может быть сконфигурирована с под-тегами:

| Настройка         | Описание                                                                                                                                                                                                                                                                                                                                    |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`         | Шаблон, используемый для построения базового DN для поиска в LDAP. Полученный DN будет построен, заменив все подстроки `\{user_name\}` и '\{bind_dn\}' шаблона на фактическое имя пользователя и DN подключения во время поиска в LDAP.                                                                                                       |
| `scope`           | Область поиска в LDAP. Приемлемые значения: `base`, `one_level`, `children`, `subtree` (по умолчанию).                                                                                                                                                                                                                                       |
| `search_filter`   | Шаблон, используемый для построения фильтра поиска для поиска в LDAP. Полученный фильтр будет построен, заменив все подстроки `\{user_name\}`, `\{bind_dn\}`, и `\{base_dn\}` шаблона на фактическое имя пользователя, DN подключения и базовый DN во время поиска в LDAP. Обратите внимание, что специальные символы должны быть корректно экранированы в XML.  |

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

Размер очереди ожидания соединений для сокета прослушивания. Значение по умолчанию `4096` совпадает со значением в linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не нужно изменять, так как:
- Значение по умолчанию достаточно велико,
- Для принятия соединений клиентов у сервера есть отдельный поток.

Таким образом, даже если у вас есть `TcpExtListenOverflows` (из `nstat`) ненулевое и этот счетчик увеличивается для сервера ClickHouse, это не означает, что это значение нужно увеличивать, так как:
- Обычно, если `4096` недостаточно, это показывает некоторые внутренние проблемы масштабирования ClickHouse, поэтому лучше сообщить о проблеме.
- Это не означает, что сервер сможет обрабатывать больше соединений позже (и даже если сможет, к этому моменту клиенты могут исчезнуть или быть отключены).

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

Разрешить нескольким серверам слушать на одном адресе:порт. Запросы будут направляться на случайный сервер операционной системой. Включение этой настройки не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

По умолчанию:
## listen_try {#listen_try} 

Сервер не завершит работу, если сети IPv6 или IPv4 недоступны при попытке прослушивания.

**Пример**

```xml
<listen_try>0</listen_try>
```
## load_marks_threadpool_pool_size {#load_marks_threadpool_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="50" />Размер фоново пула для загрузки меток
## load_marks_threadpool_queue_size {#load_marks_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно добавить в пул предварительной выборки
## logger {#logger} 

Расположение и формат лог-сообщений.

**Ключи**:

| Ключ                     | Описание                                                                                                                                                        |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                  | Уровень логирования. Приемлемые значения: `none` (выключить логирование), `fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test`                 |
| `log`                    | Путь к файлу лога.                                                                                                                                          |
| `errorlog`               | Путь к файлу ошибок.                                                                                                                                        |
| `size`                   | Политика ротации: Максимальный размер файлов лога в байтах. Как только размер файла лога превышает этот порог, он переименовывается и архивируется, и создается новый файл лога. |
| `count`                  | Политика ротации: Сколько исторических файлов лога Clickhouse хранится максимально.                                                                                        |
| `stream_compress`        | Сжимать сообщения лога с помощью LZ4. Установите на `1` или `true`, чтобы включить.                                                                                                  |
| `console`                | Включить логирование в консоль. Установите на `1` или `true`, чтобы включить. Значение по умолчанию `1`, если Clickhouse не работает в режиме демона, `0` в противном случае.                            |
| `console_log_level`      | Уровень логирования для вывода в консоль. По умолчанию равен `level`.                                                                                                                 |
| `formatting.type`        | Формат логирования для вывода в консоль. В настоящее время поддерживается только `json`                                                                                                 |
| `use_syslog`             | Также перенаправлять лог-вывод в syslog.                                                                                                                                 |
| `syslog_level`           | Уровень логирования для записи в syslog.                                                                                                                                   |
| `async`                  | Когда `true` (по умолчанию) логирование будет выполняться асинхронно (один фоновый поток на канал вывода). В противном случае он будет записывать внутри потока, вызывающего LOG           |
| `async_queue_max_size`   | При использовании асинхронного логирования, максимальное количество сообщений, которые будут храниться в очереди, ожидая сброса. Дополнительные сообщения будут отбрасываться                       |
| `startup_level`          | Уровень запуска используется для установки уровня корневого логгера при запуске сервера. После запуска уровень логирования возвращается к настройке `level`                                   |
| `shutdown_level`         | Уровень завершения используется для установки уровня корневого логгера при завершении сервера.                                                                                            |

**Спецификаторы формата лога**

Файлы в путях `log` и `errorLog` поддерживают следующие спецификаторы формата для полученного имени файла (причем часть директории их не поддерживает).

Столбец "Пример" показывает вывод на `2023-07-06 18:32:07`.

| Спецификатор | Описание                                                                                                         | Пример                  |
|--------------|---------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | Литерал %                                                                                                           | `%`                        |
| `%n`         | Символ новой строки                                                                                                  |                          |
| `%t`         | Символ горизонтальной табуляции                                                                                            |                          |
| `%Y`         | Год в десятичном формате, например, 2017                                                                                 | `2023`                     |
| `%y`         | Последние 2 цифры года в десятичном формате (диапазон [00,99])                                                           | `23`                       |
| `%C`         | Первые 2 цифры года в десятичном формате (диапазон [00,99])                                                          | `20`                       |
| `%G`         | Четырехзначный [недельно-ориентированный год ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, который содержит указанную неделю. Обычно полезен только с `%V`  | `2023`       |
| `%g`         | Последние 2 цифры [недельно-ориентированного года ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, который содержит указанную неделю.                         | `23`         |
| `%b`         | Сокращенное название месяца, например, Окт (зависит от локали)                                                                 | `Jul`                      |
| `%h`         | Синоним `%b`                                                                                                       | `Jul`                      |
| `%B`         | Полное название месяца, например, Октябрь (зависит от локали)                                                                    | `July`                     |
| `%m`         | Месяц в десятичном формате (диапазон [01,12])                                                                           | `07`                       |
| `%U`         | Номер недели в году в десятичном формате (воскресенье - первый день недели) (диапазон [00,53])                          | `27`                       |
| `%W`         | Номер недели в году в десятичном формате (понедельник - первый день недели) (диапазон [00,53])                          | `27`                       |
| `%V`         | Номер недели ISO 8601 (диапазон [01,53])                                                                                | `27`                       |
| `%j`         | День в году в десятичном формате (диапазон [001,366])                                                               | `187`                      |
| `%d`         | День месяца в десятичном формате с заполнением нулями (диапазон [01,31]). Одноцифровое число предшествует нолю.                 | `06`                       |
| `%e`         | День месяца в десятичном формате с заполнением пробелами (диапазон [1,31]). Одноцифровое число предшествует пробелу.              | `&nbsp; 6`                 |
| `%a`         | Сокращенное название дня недели, например, Пт (зависит от локали)                                                               | `Thu`                      |
| `%A`         | Полное название дня недели, например, Пятница (зависит от локали)                                                                   | `Thursday`                 |
| `%w`         | День недели в виде целого числа, где воскресенье - 0 (диапазон [0-6])                                                          | `4`                        |
| `%u`         | День недели в десятичном формате, где понедельник - 1 (формат ISO 8601) (диапазон [1-7])                                      | `4`                        |
| `%H`         | Час в десятичном формате, 24-часовой формат (диапазон [00-23])                                                             | `18`                       |
| `%I`         | Час в десятичном формате, 12-часовой формат (диапазон [01,12])                                                             | `06`                       |
| `%M`         | Минуты в десятичном формате (диапазон [00,59])                                                                          | `32`                       |
| `%S`         | Секунды в десятичном формате (диапазон [00,60])                                                                          | `07`                       |
| `%c`         | Стандартная строка даты и времени, например, Вск Окт 17 04:41:13 2010 (зависит от локали)                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованное представление даты (зависит от локали)                                                                    | `07/06/23`                 |
| `%X`         | Локализованное представление времени, например, 18:40:20 или 6:40:20 PM (зависит от локали)                                       | `18:32:07`                 |
| `%D`         | Краткая дата в формате MM/DD/YY, эквивалентно %m/%d/%y                                                                         | `07/06/23`                 |
| `%F`         | Краткая дата в формате YYYY-MM-DD, эквивалентно %Y-%m-%d                                                                       | `2023-07-06`               |
| `%r`         | Локализованное 12-часовое время (зависит от локали)                                                                     | `06:32:07 PM`              |
| `%R`         | Эквивалентно "%H:%M"                                                                                               | `18:32`                    |
| `%T`         | Эквивалентно "%H:%M:%S" (формат ISO 8601 времени)                                                                 | `18:32:07`                 |
| `%p`         | Локализованное обозначение д.м. или п.м. (зависит от локали)                                                               | `PM`                       |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430), или без символов, если информация о временной зоне недоступна | `+0800`                    |
| `%Z`         | Название или сокращение часового пояса, зависящее от локали, или без символов, если информация о временной зоне недоступна     | `Z AWST `                  |

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

**Переопределения на уровне логирования**

Уровень логирования отдельных имен логов можно переопределить. Например, чтобы отключить все сообщения логгеров "Backup" и "RBAC".

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

| Ключ         | Описание                                                                                                                                                                                                                                                    |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`    | Адрес syslog в формате `host\[:port\]`. Если опущен, используется локальный демон.                                                                                                                                                                          |
| `hostname`   | Имя хоста, с которого отправляются логи (необязательно).                                                                                                                                                                                                      |
| `facility`   | Ключевое слово syslog [facility](https://en.wikipedia.org/wiki/Syslog#Facility). Должен указываться с заглавными буквами и префиксом "LOG_", например, `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т. д. По умолчанию: `LOG_USER`, если указан `address`, иначе `LOG_DAEMON`.                                           |
| `format`     | Формат сообщения лога. Возможные значения: `bsd` и `syslog.`                                                                                                                                                                                                |

**Форматы логов**

Вы можете указать формат лога, который будет выводиться в консоль. В настоящее время поддерживается только JSON.

**Пример**

Вот пример JSON логов на выходе:

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

Чтобы включить поддержку JSON логирования, используйте следующую часть кода:

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

**Переименование ключей для JSON логов**

Названия ключей можно изменить, изменив значения тега внутри тега `<names>`. Например, чтобы изменить `DATE_TIME` на `MY_DATE_TIME`, вы можете использовать `<date_time>MY_DATE_TIME</date_time>`.

**Пропуск ключей для JSON логов**

Свойства лога могут быть пропущены, закомментировав свойство. Например, если вы не хотите, чтобы ваш лог печатал `query_id`, вы можете закомментировать тег `<query_id>`.
## macros {#macros} 

Подстановка параметров для реплицированных таблиц.

Может быть пропущен, если реплицированные таблицы не используются.

Для получения дополнительной информации см. раздел [Создание реплицированных таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```
## mark_cache_policy {#mark_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша меток.
## mark_cache_prewarm_ratio {#mark_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />Соотношение общего размера кэша меток, которое нужно заполнить во время предварительного прогрева.
## mark_cache_size {#mark_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />
Максимальный размер кэша для меток (индекс семейства [`MergeTree`](/engines/table-engines/mergetree-family)).

:::note
Эту настройку можно изменять во время выполнения, и она вступит в силу немедленно.
:::
## mark_cache_size_ratio {#mark_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае политики SLRU) в кэше меток относительно общего размера кэша.
## max_active_parts_loading_thread_pool_size {#max_active_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />Количество потоков для загрузки активного набора данных (активные) при старте.
## max_authentication_methods_per_user {#max_authentication_methods_per_user} 

<SettingsInfoBlock type="UInt64" default_value="100" />
Максимальное количество методов аутентификации, с которыми может быть создан или изменён пользователь.
Изменение этой настройки не влияет на существующих пользователей. Запросы на создание/изменение, связанные с аутентификацией, потерпят неудачу, если они превысят предел, указанный в этой настройке.
Неаутентификационные запросы на создание/изменение будут успешными.

:::note
Значение `0` означает неограниченно.
:::
## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения в байтах в секунду для всех резервных копий на сервере. Ноль означает неограниченно.
## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Если количество **неактивных** потоков в пуле потоков IO резервных копий превышает `max_backup_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занятые неактивными потоками, и уменьшит размер пула. Потоки могут быть созданы снова при необходимости.
## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />ClickHouse использует потоки из пула потоков IO резервных копий для операций IO резервного копирования в S3. `max_backups_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.
## max_build_vector_similarity_index_thread_pool_size {#max_build_vector_similarity_index_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="16" />
Максимальное количество потоков, используемых для построения векторных индексов.

:::note
Значение `0` означает использование всех ядер.
:::
## max_concurrent_insert_queries {#max_concurrent_insert_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Ограничение на общее количество одновременно выполняемых запросов на вставку.

:::note

Значение `0` (по умолчанию) означает неограниченно.

Эту настройку можно изменять во время выполнения, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::
## max_concurrent_queries {#max_concurrent_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Ограничение на общее количество одновременно выполняемых запросов. Обратите внимание, что также необходимо учитывать ограничения на запросы `INSERT` и `SELECT`, а также на максимальное количество запросов для пользователей.

См. также:
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

:::note

Значение `0` (по умолчанию) означает неограниченно.

Эту настройку можно изменять во время выполнения, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::
## max_concurrent_select_queries {#max_concurrent_select_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Ограничение на общее количество одновременно выполняемых запросов на выборку.

:::note

Значение `0` (по умолчанию) означает неограниченно.

Эту настройку можно изменять во время выполнения, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::
## max_connections {#max_connections} 

<SettingsInfoBlock type="Int32" default_value="4096" />Максимальные соединения сервера.
## max_database_num_to_throw {#max_database_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />Если количество баз данных превышает это значение, сервер вызовет исключение. 0 означает отсутствие ограничений.
## max_database_num_to_warn {#max_database_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
Если количество присоединенных баз данных превышает указанное значение, сервер ClickHouse добавит сообщения предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```
## max_database_replicated_create_table_thread_pool_size {#max_database_replicated_create_table_thread_pool_size} 

<SettingsInfoBlock type="UInt32" default_value="1" />Количество потоков для создания таблиц во время восстановления реплика в DatabaseReplicated. Ноль означает, что количество потоков равно количеству ядер.
## max_dictionary_num_to_throw {#max_dictionary_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Если количество словарей превышает это значение, сервер вызовет исключение.

Считаются только таблицы для движков баз данных:
- Атомные
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
Если количество присоединенных словарей превышает указанное значение, сервер ClickHouse добавит сообщения предупреждения в таблицу `system.warnings`.

**Пример**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```
## max_distributed_cache_read_bandwidth_for_server {#max_distributed_cache_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная общая скорость чтения из распределенного кэша на сервере в байтах в секунду. Ноль означает неограниченно.
## max_distributed_cache_write_bandwidth_for_server {#max_distributed_cache_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная общая скорость записи в распределенный кэш на сервере в байтах в секунду. Ноль означает неограниченно.
## max_entries_for_hash_table_stats {#max_entries_for_hash_table_stats} 

<SettingsInfoBlock type="UInt64" default_value="10000" />Максимальное количество записей, которые может содержать статистика хеш-таблицы, собранная во время агрегации.
## max_fetch_partition_thread_pool_size {#max_fetch_partition_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="64" />Количество потоков для ALTER TABLE FETCH PARTITION.
## max_format_parsing_thread_pool_free_size {#max_format_parsing_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальное количество бездействующих резервных потоков, чтобы поддерживать в пуле потоков для разбора входных данных.
## max_format_parsing_thread_pool_size {#max_format_parsing_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
Максимальное общее количество потоков, используемых для разбора входных данных.
## max_io_thread_pool_free_size {#max_io_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Если количество **бездействующих** потоков в пуле потоков IO превышает `max_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые бездействующими потоками, и уменьшит размер пула. Потоки могут быть созданы заново при необходимости.
## max_io_thread_pool_size {#max_io_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouse использует потоки из пула потоков IO для выполнения некоторых операций ввода-вывода (например, для взаимодействия с S3). `max_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.
## max_keep_alive_requests {#max_keep_alive_requests} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
Максимальное количество запросов через одно соединение keep-alive, после чего оно будет закрыто сервером ClickHouse.

**Пример**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```
## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальная скорость локальных чтений в байтах в секунду.

:::note
Значение `0` означает отсутствие ограничений.
:::
## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальная скорость локальных записей в байтах в секунду.

:::note
Значение `0` означает отсутствие ограничений.
:::
## max_materialized_views_count_for_table {#max_materialized_views_count_for_table} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Ограничение на количество материализованных представлений, прикрепленных к таблице.

:::note
Здесь рассматриваются только напрямую зависимые представления, и создание одного представления поверх другого не учитывается.
:::
## max_merges_bandwidth_for_server {#max_merges_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения всех слияний на сервере в байтах в секунду. Ноль означает отсутствие ограничений.
## max_mutations_bandwidth_for_server {#max_mutations_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость чтения всех мутаций на сервере в байтах в секунду. Ноль означает отсутствие ограничений.
## max_named_collection_num_to_throw {#max_named_collection_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Если количество именованных коллекций превышает это значение, сервер вызовет исключение.

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**
```xml
<max_named_collection_num_to_throw>400</max_named_collection_num_to_throw>
```
## max_named_collection_num_to_warn {#max_named_collection_num_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
Если количество именованных коллекций превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_named_collection_num_to_warn>400</max_named_collection_num_to_warn>
```
## max_open_files {#max_open_files} 

Максимальное количество открытых файлов.

:::note
Рекомендуется использовать эту опцию в macOS, поскольку функция `getrlimit()` возвращает некорректное значение.
:::

**Пример**

```xml
<max_open_files>262144</max_open_files>
```
## max_os_cpu_wait_time_ratio_to_drop_connection {#max_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />
Максимальное соотношение между временем ожидания CPU ОС (метрика OSCPUWaitMicroseconds) и временем, когда CPU занят (метрика OSCPUVirtualTimeMicroseconds), для принятия решения о разрыве соединений. Для расчета вероятности используется линейная интерполяция между минимальным и максимальным соотношением, вероятность равна 1 в этой точке.
Смотрите [Управление поведением при перегрузке CPU сервера](/operations/settings/server-overload) для получения дополнительных сведений.
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

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает [`max_partition_size_to_drop`](#max_partition_size_to_drop) (в байтах), вы не можете удалить партицию, используя запрос [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart).
Эта настройка не требует перезапуска сервера ClickHouse для применения. Другой способ отключить ограничение - это создать файл `<clickhouse-path>/flags/force_drop_table`.

:::note
Значение `0` означает, что вы можете удалять партиции без каких-либо ограничений.

Это ограничение не касается удаления таблиц и обрезки таблиц, см. [max_table_size_to_drop](/operations/settings/settings#max_table_size_to_drop)
:::

**Пример**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```
## max_parts_cleaning_thread_pool_size {#max_parts_cleaning_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />Количество потоков для параллельного удаления неактивных частей данных.
## max_pending_mutations_execution_time_to_warn {#max_pending_mutations_execution_time_to_warn} 

<SettingsInfoBlock type="UInt64" default_value="86400" />
Если любая из ожидающих мутаций превышает указанное значение в секундах, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

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
Если количество **бездействующих** потоков в пуле потоков десериализации префиксов превышает `max_prefixes_deserialization_thread_pool_free_size`, ClickHouse освободит ресурсы, занимаемые бездействующими потоками, и уменьшит размер пула. Потоки могут быть созданы заново при необходимости.
## max_prefixes_deserialization_thread_pool_size {#max_prefixes_deserialization_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="100" />
ClickHouse использует потоки из пула потоков десериализации префиксов для параллельного чтения метаданных колонок и подколонок из префиксов файлов в широких частях в MergeTree. `max_prefixes_deserialization_thread_pool_size` ограничивает максимальное количество потоков в пуле.
## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальная скорость обмена данными по сети в байтах в секунду для чтения.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::
## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальная скорость обмена данными по сети в байтах в секунду для записи.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::
## max_replicated_fetches_network_bandwidth_for_server {#max_replicated_fetches_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость обмена данными по сети в байтах в секунду для реплицированных выборок. Ноль означает отсутствие ограничений.
## max_replicated_sends_network_bandwidth_for_server {#max_replicated_sends_network_bandwidth_for_server} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальная скорость обмена данными по сети в байтах в секунду для реплицированных отправок. Ноль означает отсутствие ограничений.
## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Если количество реплицированных таблиц превышает это значение, сервер вызовет исключение.

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

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальное количество памяти, которое сервер может использовать, выраженное в байтах.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается установкой `max_server_memory_usage_to_ram_ratio`.
:::

В качестве исключения, значение `0` (по умолчанию) означает, что сервер может использовать всю доступную память (исключая дальнейшие ограничения, налагаемые `max_server_memory_usage_to_ram_ratio`).
## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.9" />
Максимальное количество памяти, которое сервер может использовать, выраженное как отношение к всей доступной памяти.

Например, значение `0.9` (по умолчанию) означает, что сервер может использовать 90% от доступной памяти.

Позволяет снизить использование памяти на системах с небольшим объемом оперативной памяти.
На хостах с низким объемом ОЗУ и свопа вам, возможно, потребуется установить [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) больше чем 1.

:::note
Максимальное потребление памяти сервером дополнительно ограничивается установкой `max_server_memory_usage`.
:::
## max_session_timeout {#max_session_timeout} 

Максимальный тайм-аут сессии в секундах.

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
Если количество прикрепленных таблиц превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```
## max_table_size_to_drop {#max_table_size_to_drop} 

<SettingsInfoBlock type="UInt64" default_value="50000000000" />
Ограничение на удаление таблиц.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает `max_table_size_to_drop` (в байтах), вы не можете удалить ее, используя запрос [`DROP`](../../sql-reference/statements/drop.md) или [`TRUNCATE`](../../sql-reference/statements/truncate.md).

:::note
Значение `0` означает, что вы можете удалять все таблицы без каких-либо ограничений.

Эта настройка не требует перезапуска сервера ClickHouse для применения. Другой способ отключить ограничение - это создать файл `<clickhouse-path>/flags/force_drop_table`.
:::

**Пример**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```
## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Максимальное количество места для хранения, которое может быть использовано для внешней агрегации, соединений или сортировки.
Запросы, превышающие этот лимит, завершатся с исключением.

:::note
Значение `0` означает отсутствие ограничений.
:::

Смотрите также:
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)
## max_thread_pool_free_size {#max_thread_pool_free_size} 

<SettingsInfoBlock type="UInt64" default_value="1000" />
Если количество **бездействующих** потоков в глобальном пуле потоков больше чем [`max_thread_pool_free_size`](/operations/server-configuration-parameters/settings#max_thread_pool_free_size), то ClickHouse освобождает ресурсы, занимаемые некоторыми потоками, и размер пула уменьшается. Потоки могут быть созданы заново при необходимости.

**Пример**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```
## max_thread_pool_size {#max_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
ClickHouse использует потоки из глобального пула потоков для обработки запросов. Если нет бездействующего потока для обработки запроса, то в пуле создается новый поток. `max_thread_pool_size` ограничивает максимальное число потоков в пуле.

**Пример**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```
## max_unexpected_parts_loading_thread_pool_size {#max_unexpected_parts_loading_thread_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="8" />Количество потоков для загрузки неактивного набора частей данных (Неожиданных) при запуске.
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
Если количество прикрепленных представлений превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```
## max_waiting_queries {#max_waiting_queries} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Лимит на общее количество одновременно ожидающих запросов.
Выполнение ожидающего запроса блокируется, пока требуемые таблицы загружаются асинхронно (см. [`async_load_databases`](/operations/server-configuration-parameters/settings#async_load_databases).

:::note
Ожидающие запросы не учитываются, когда проверяются ограничения, контролируемые следующими настройками:

- [`max_concurrent_queries`](/operations/server-configuration-parameters/settings#max_concurrent_queries)
- [`max_concurrent_insert_queries`](/operations/server-configuration-parameters/settings#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/settings/settings#max_concurrent_queries_for_user)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

Эта коррекция сделана для избежания достижения этих ограничений сразу после старта сервера.
:::

:::note

Значение `0` (по умолчанию) означает отсутствие ограничений.

Эта настройка может быть изменена во время выполнения и вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::
## memory_worker_correct_memory_tracker {#memory_worker_correct_memory_tracker} 

<SettingsInfoBlock type="Bool" default_value="0" />
Должен ли фоновый рабочий процесс памяти корректировать внутренний трекер памяти на основе информации из внешних источников, таких как jemalloc и cgroups.
## memory_worker_period_ms {#memory_worker_period_ms} 

Период тика фонового рабочего процесса памяти, который корректирует использование памяти трекера памяти и очищает неиспользуемые страницы при высоком использовании памяти. Если установлено на 0, будет использоваться значение по умолчанию в зависимости от источника использования памяти.
## memory_worker_use_cgroup {#memory_worker_use_cgroup} 

Использовать текущую информацию о использовании памяти в cgroup для корректировки отслеживания памяти.
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

<SettingsInfoBlock type="String" default_value="default" />
Используется для регулирования того, как ресурсы используются и распределяются между процедурами слияния и другими рабочими процессами. Указанное значение используется в качестве значения настройки `workload` для всех фоновых слияний. Может быть переопределено настройкой дерева слияний.

**Смотрите также**
- [Планирование нагрузки](/operations/workload-scheduling.md)
## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Устанавливает лимит на то, сколько ОЗУ разрешается использовать для выполнения операций слияния и мутации.
Если ClickHouse достигает установленного лимита, он не будет планировать никаких новых фоновых процессов слияния или мутации, но продолжит выполнять уже запланированные задачи.

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```
## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />
Значение по умолчанию для `merges_mutations_memory_usage_soft_limit` вычисляется как `memory_amount * merges_mutations_memory_usage_to_ram_ratio`.

**Смотрите также:**

- [max_memory_usage](/operations/settings/settings#max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](/operations/server-configuration-parameters/settings#merges_mutations_memory_usage_soft_limit)
## metric_log {#metric_log} 

По умолчанию отключен.

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

Чтобы отключить настройки `metric_log`, вам следует создать следующий файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` со следующим содержанием:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## min_os_cpu_wait_time_ratio_to_drop_connection {#min_os_cpu_wait_time_ratio_to_drop_connection} 

<SettingsInfoBlock type="Float" default_value="0" />
Минимальное соотношение между временем ожидания CPU ОС (метрика OSCPUWaitMicroseconds) и временем, когда CPU занят (метрика OSCPUVirtualTimeMicroseconds), для принятия решения о разрыве соединений. Для расчета вероятности используется линейная интерполяция между минимальным и максимальным соотношением, вероятность равна 0 в этой точке.
Смотрите [Управление поведением при перегрузке CPU сервера](/operations/settings/server-overload) для получения дополнительных сведений.
## mlock_executable {#mlock_executable} 

Выполнять `mlockall` после старта для снижения задержки первых запросов и предотвращения выгрузки исполняемого файла clickhouse под высоким нагрузкой ввода-вывода.

:::note
Рекомендуется включать эту опцию, но это приведет к увеличению времени запуска до нескольких секунд.
Имейте в виду, что эта настройка не будет работать без возможности "CAP_IPC_LOCK".
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```
## mmap_cache_size {#mmap_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="1024" />
Эта настройка позволяет избежать частых вызовов открытия/закрытия (которые очень затратны из-за последующих ошибок страниц) и повторно использовать отображения из нескольких потоков и запросов. Значение настройки - это количество отображенных регионов (обычно равно количеству отображенных файлов).

Количество данных в отображаемых файлах можно отслеживать в следующих системных таблицах с помощью следующих метрик:

- `MMappedFiles`/`MMappedFileBytes`/`MMapCacheCells` в [`system.metrics`](/operations/system-tables/metrics), [`system.metric_log`](/operations/system-tables/metric_log)
- `CreatedReadBufferMMap`/`CreatedReadBufferMMapFailed`/`MMappedFileCacheHits`/`MMappedFileCacheMisses` в [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)

:::note
Количество данных в отображаемых файлах не потребляет память напрямую и не учитывается в использовании памяти запроса или сервера — так как эта память может быть отброшена, аналогично кешу страниц ОС. Кеш автоматически сбрасывается (файлы закрываются) при удалении старых частей в таблицах, относящихся к семейству MergeTree, также его можно сбросить вручную с помощью запроса `SYSTEM DROP MMAP CACHE`.

Эта настройка может быть изменена во время выполнения и вступит в силу немедленно.
:::
## mutation_workload {#mutation_workload} 

<SettingsInfoBlock type="String" default_value="default" />
Используется для регулирования того, как ресурсы используются и распределяются между мутациями и другими рабочими процессами. Указанное значение используется в качестве значения настройки `workload` для всех фоновых мутаций. Может быть переопределено настройкой дерева слияний.

**Смотрите также**
- [Планирование нагрузки](/operations/workload-scheduling.md)
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
## mysql_require_secure_transport {#mysql_require_secure_transport} 

Если установлено в true, требуется безопасная связь с клиентами через [mysql_port](#mysql_port). Соединение с опцией `--ssl-mode=none` будет отклонено. Используйте вместе с настройками [OpenSSL](#openssl).
## openSSL {#openssl} 

Конфигурация SSL клиента/сервера.

Поддержка SSL предоставляется библиотекой `libpoco`. Доступные параметры конфигурации объясняются в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи для настроек сервера/клиента:

| Опция                       | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Значение по умолчанию                      |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`            | Путь к файлу с секретным ключом PEM-сертификата. Файл может содержать как ключ, так и сертификат одновременно.                                                                                                                                                                                                                                                                                                                                                     |                                            |
| `certificateFile`           | Путь к файлу клиентского/серверного сертификата в формате PEM. Вы можете опустить его, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                                 |                                            |
| `caConfig`                  | Путь к файлу или директории, содержащей доверенные CA-сертификаты. Если это указывает на файл, он должен быть в формате PEM и может содержать несколько CA-сертификатов. Если это указывает на директорию, она должна содержать один .pem файл на каждый CA-сертификат. Имена файлов ищутся по хешу имени субъекта CA. Подробности можно найти в описании команды [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                            |
| `verificationMode`          | Метод проверки сертификатов узла. Подробности приведены в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                                | `relaxed`                                  |
| `verificationDepth`         | Максимальная длина цепочки проверки. Проверка завершится неудачей, если длина цепочки сертификатов превышает установленное значение.                                                                                                                                                                                                                                                                                                                                | `9`                                        |
| `loadDefaultCAFile`         | Использовать встроенные CA-сертификаты для OpenSSL или нет. ClickHouse предполагает, что встроенные CA-сертификаты находятся в файле `/etc/ssl/cert.pem` (или директории `/etc/ssl/certs`) или в файле (или директории), указанной переменной окружения `SSL_CERT_FILE` (или `SSL_CERT_DIR`).                                                                                                                                                               | `true`                                     |
| `cipherList`                | Поддерживаемые шифры OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                        | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`             | Включает или отключает кэширование сессий. Должен использоваться в сочетании с `sessionIdContext`. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                       | `false`                                    |
| `sessionIdContext`          | Уникальный набор случайных символов, который сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Этот параметр всегда рекомендуется использовать, так как он помогает избежать проблем как при кэшировании сессии сервером, так и если клиент запрашивает кэширование.                                                                                      | `$\{application.name\}`                     |
| `sessionCacheSize`          | Максимальное количество сессий, которые сервер кэширует. Значение `0` означает неограниченное количество сессий.                                                                                                                                                                                                                                                                                                                                                  | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`            | Время для кэширования сессии на сервере в часах.                                                                                                                                                                                                                                                                                                                                                                                                                     | `2`                                        |
| `extendedVerification`      | Если включено, проверяет, что CN или SAN сертификата совпадает с именем хоста партнера.                                                                                                                                                                                                                                                                                                                                                                            | `false`                                    |
| `requireTLSv1`              | Требовать TLSv1 соединение. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                   | `false`                                    |
| `requireTLSv1_1`            | Требовать TLSv1.1 соединение. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                    | `false`                                    |
| `requireTLSv1_2`            | Требовать TLSv1.2 соединение. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                    | `false`                                    |
| `fips`                      | Активирует режим FIPS OpenSSL. Поддерживается, если версия OpenSSL библиотеки поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                    | `false`                                    |
| `privateKeyPassphraseHandler` | Класс (подкласс PrivateKeyPassphraseHandler), который запрашивает пароль для доступа к приватному ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                  | `KeyConsoleHandler`                        |
| `invalidCertificateHandler` | Класс (подкласс CertificateHandler) для проверки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`.                                                                                                                                                                                                                                                                   | `RejectCertificateHandler`                 |
| `disableProtocols`          | Протоколы, использование которых запрещено.                                                                                                                                                                                                                                                                                                                                                                                                                           |                                            |
| `preferServerCiphers`       | Предпочтительные шифры сервера для клиента.                                                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |

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

<SettingsInfoBlock type="UInt64" default_value="1000000" />Пороговое значение времени загрузки CPU ОС в микросекундах (метрика OSCPUVirtualTimeMicroseconds), чтобы считать, что CPU выполняет какую-то полезную работу. Никакое перегрузка CPU не будет считаться, если время загрузки было ниже этого значения.
## os_threads_nice_value_distributed_cache_tcp_handler {#os_threads_nice_value_distributed_cache_tcp_handler} 

<SettingsInfoBlock type="Int32" default_value="0" />
Значение nice в Linux для потоков обработчика TCP кэша распределенного. Более низкие значения означают более высокий приоритет CPU.

Требуется возможность CAP_SYS_NICE, в противном случае неактивно.

Допустимые значения: от -20 до 19.
## os_threads_nice_value_merge_mutate {#os_threads_nice_value_merge_mutate} 

<SettingsInfoBlock type="Int32" default_value="0" />
Значение nice в Linux для потоков слияния и мутаций. Более низкие значения означают более высокий приоритет CPU.

Требуется возможность CAP_SYS_NICE, в противном случае неактивно.

Допустимые значения: от -20 до 19.
## os_threads_nice_value_zookeeper_client_send_receive {#os_threads_nice_value_zookeeper_client_send_receive} 

<SettingsInfoBlock type="Int32" default_value="0" />
Значение nice в Linux для потоков отправки и получения в клиенте ZooKeeper. Более низкие значения означают более высокий приоритет CPU.

Требуется возможность CAP_SYS_NICE, в противном случае неактивно.

Допустимые значения: от -20 до 19.
## page_cache_free_memory_ratio {#page_cache_free_memory_ratio} 

<SettingsInfoBlock type="Double" default_value="0.15" />Доля лимита памяти, которую нужно оставить свободной от кэша страниц пользовательского пространства. Аналогично настройке min_free_kbytes в Linux.
## page_cache_history_window_ms {#page_cache_history_window_ms} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Задержка перед тем, как освобожденная память может быть использована кэшем страниц пользовательского пространства.
## page_cache_max_size {#page_cache_max_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальный размер кэша страниц пользовательского пространства. Установите 0, чтобы отключить кэш. Если больше, чем page_cache_min_size, размер кэша будет постоянно регулироваться в этом диапазоне, чтобы использовать большую часть доступной памяти, сохраняя общее использование памяти ниже лимита (max_server_memory_usage[_to_ram_ratio]).
## page_cache_min_size {#page_cache_min_size} 

<SettingsInfoBlock type="UInt64" default_value="104857600" />Минимальный размер кэша страниц пользовательского пространства.
## page_cache_policy {#page_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша страниц пользовательского пространства.
## page_cache_shards {#page_cache_shards} 

<SettingsInfoBlock type="UInt64" default_value="4" />Разделите кэш страниц пользовательского пространства на заданное количество шардов, чтобы уменьшить конкуренцию за мьютексы. Экспериментально, маловероятно, что улучшит производительность.
## page_cache_size_ratio {#page_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди в кэше страниц пользовательского пространства относительно общего размера кэша.
## part_log {#part_log} 

Ведение журнала событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Например, добавление или слияние данных. Вы можете использовать журнал для имитации алгоритмов слияния и сравнения их характеристик. Вы можете визуализировать процесс слияния.

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

<SettingsInfoBlock type="UInt64" default_value="30" />
Период для полного удаления частей для SharedMergeTree. Доступно только в ClickHouse Cloud
## parts_kill_delay_period_random_add {#parts_kill_delay_period_random_add} 

<SettingsInfoBlock type="UInt64" default_value="10" />
Добавляет равномерно распределённое значение от 0 до x секунд к kill_delay_period, чтобы избежать эффекта громогласных толп и последующего DoS ZooKeeper в случае очень большого числа таблиц. Доступно только в ClickHouse Cloud
## parts_killer_pool_size {#parts_killer_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="128" />
Потоки для очистки устаревших потоков общего дерева слияния. Доступно только в ClickHouse Cloud
## path {#path} 

Путь к директории, содержащей данные.

:::note
Косая черта в конце обязательна.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```
## postgresql_port {#postgresql_port} 

Порт для связи с клиентами по протоколу PostgreSQL.

:::note
- Положительные целые числа указывают номер порта для прослушивания.
- Пустые значения используются для отключения связи с клиентами по протоколу PostgreSQL.
:::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```
## postgresql_require_secure_transport {#postgresql_require_secure_transport} 

Если установлено в true, требуется защищенная связь с клиентами по [postgresql_port](#postgresql_port). Соединение с параметром `sslmode=disable` будет отказано. Используйте это с настройками [OpenSSL](#openssl).
## prefetch_threadpool_pool_size {#prefetch_threadpool_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />Размер фонового пула для предварительной выборки для удаленных объектных хранилищ.
## prefetch_threadpool_queue_size {#prefetch_threadpool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно добавить в пул предварительной выборки.
## prefixes_deserialization_thread_pool_thread_pool_queue_size {#prefixes_deserialization_thread_pool_thread_pool_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="10000" />
Максимальное количество задач, которые могут быть запланированы в пул потоков десериализации префиксов.

:::note
Значение `0` означает неограниченное количество.
:::
## prepare_system_log_tables_on_startup {#prepare_system_log_tables_on_startup} 

<SettingsInfoBlock type="Bool" default_value="0" />
Если true, ClickHouse создает все настроенные `system.*_log` таблицы перед запуском. Это может быть полезно, если некоторые стартовые скрипты зависят от этих таблиц.
## primary_index_cache_policy {#primary_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша первичного индекса.
## primary_index_cache_prewarm_ratio {#primary_index_cache_prewarm_ratio} 

<SettingsInfoBlock type="Double" default_value="0.95" />Отношение общего размера кэша меток к размеру, который нужно заполнить во время предварительного прогрева.
## primary_index_cache_size {#primary_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />Максимальный размер кэша для первичного индекса (индекс таблиц семейства MergeTree).
## primary_index_cache_size_ratio {#primary_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищённой очереди (в случае политики SLRU) в кэше первичного индекса относительно общего размера кэша.
## process_query_plan_packet {#process_query_plan_packet} 

<SettingsInfoBlock type="Bool" default_value="0" />
Эта настройка позволяет читать пакет QueryPlan. Этот пакет отправляется для распределенных запросов, когда включено serialize_query_plan.
Отключено по умолчанию, чтобы избежать возможных проблем с безопасностью, которые могут быть вызваны ошибками в бинарной десериализации плана запроса.

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

Экспорт метрик для сбора из [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP-эндпоинт для сбора метрик сервером prometheus. Начинается с '/'.
- `port` – Порт для `endpoint`.
- `metrics` – Экспорт метрик из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Экспорт метрик из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Экспорт текущих значений метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).
- `errors` - Экспорт количества ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эта информация также может быть получена из [system.errors](/operations/system-tables/errors).

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

Определите прокси-серверы для HTTP и HTTPS запросов, которые в настоящее время поддерживаются S3 хранилищем, S3 табличными функциями и URL функциями.

Есть три способа определения прокси-серверов:
- переменные окружения
- списки прокси
- удаленные резолверы прокси.

Поддерживается также обход прокси-серверов для конкретных хостов с помощью `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать
прокси-сервер для определенного протокола. Если вы настроили это в своей системе, оно должно работать без проблем.

Это самый простой подход, если для данного протокола есть только один прокси-сервер, и этот прокси-сервер не меняется.

**Списки прокси**

Этот подход позволяет указать один или несколько
прокси-серверов для протокола. Если определено более одного прокси-сервера,
ClickHouse использует разные прокси по круговому принципу, распределяя
нагрузку между серверами. Это самый простой подход, если существует более одного
прокси-сервера для протокола, и список прокси-серверов не меняется.

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
Выберите родительское поле в вкладках ниже, чтобы просмотреть их дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле     | Описание                            |
|----------|-------------------------------------|
| `<http>` | Список одного или нескольких HTTP-прокси  |
| `<https>`| Список одного или нескольких HTTPS-прокси |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">

| Поле   | Описание          |
|--------|-------------------|
| `<uri>` | URI прокси |

  </TabItem>
</Tabs>

**Удаленные резолверы прокси**

Возможно, что прокси-серверы меняются динамически. В этом случае
вы можете определить конечную точку резолвера. ClickHouse отправляет
пустой GET запрос к этой конечной точке, удаленный резолвер должен вернуть хост прокси.
ClickHouse будет использовать его для формирования URI прокси, используя следующий шаблон: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

Выберите родительское поле в вкладках ниже, чтобы просмотреть их дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле    | Описание                       |
|---------|--------------------------------|
| `<http>`| Список одного или нескольких резолверов* |
| `<https>`| Список одного или нескольких резолверов* |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">

| Поле        | Описание                                    |
|-------------|----------------------------------------------|
| `<resolver>`| Конечная точка и другие детали для резолвера |

:::note
Вы можете иметь несколько `<resolver>` элементов, но используется только первый
`<resolver>` для данного протокола. Любые другие `<resolver>`
элементы для этого протокола игнорируются. Это означает, что балансировка нагрузки
(если это необходимо) должна быть реализована удаленным резолвером.
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| Поле                | Описание                                                                                                                                                                             |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | URI резолвера прокси                                                                                                                                                               |
| `<proxy_scheme>`    | Протокол конечного URI прокси. Это может быть либо `http`, либо `https`.                                                                                                           |
| `<proxy_port>`      | Номер порта резолвера прокси                                                                                                                                                       |
| `<proxy_cache_time>` | Время в секундах, в течение которого значения из резолвера должны кэшироваться ClickHouse. Установка этого значения в `0` приводит к тому, что ClickHouse будет обращаться к резолверу для каждого HTTP или HTTPS запроса. |

  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:

| Порядок | Настройка               |
|---------|-------------------------|
| 1.      | Удаленные резолверы прокси |
| 2.      | Списки прокси           |
| 3.      | Переменные окружения     |

ClickHouse будет проверять резолвер с наивысшим приоритетом для запрашиваемого протокола. Если он не определен,
он проверит следующий резолвер с более высоким приоритетом, пока не достигнет резолвера окружения.
Это также позволяет использовать смешанные типы резолверов.
## query_cache {#query_cache} 

Конфигурация [кэша запросов](../query-cache.md).

Доступные настройки:

| Настройка                   | Описание                                                                         | Значение по умолчанию |
|-----------------------------|----------------------------------------------------------------------------------|-----------------------|
| `max_size_in_bytes`         | Максимальный размер кэша в байтах. `0` означает, что кэш запросов отключен.        | `1073741824`          |
| `max_entries`               | Максимальное количество результатов `SELECT` запросов, хранящихся в кэше.         | `1024`                |
| `max_entry_size_in_bytes`   | Максимальный размер в байтах, который могут иметь результаты `SELECT` запросов, чтобы быть сохраненными в кэше. | `1048576`             |
| `max_entry_size_in_rows`    | Максимальное количество строк, которые могут иметь результаты `SELECT` запросов, чтобы быть сохраненными в кэше.  | `30000000`            |

:::note
- Измененные настройки вступают в силу немедленно.
- Данные для кэша запросов выделяются в DRAM. Если память в дефиците, убедитесь, что установлено небольшое значение для `max_size_in_bytes` или полностью отключите кэш запросов.
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
Эту настройку можно изменять во время выполнения, и она вступит в силу немедленно.
:::
## query_condition_cache_size_ratio {#query_condition_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае политики SLRU) в кэше условий запроса относительно общего размера кэша.
## query_log {#query_log} 

Настройка для ведения журнала запросов, полученных с настроенной [log_queries=1](../../operations/settings/settings.md).

Запросы регистрируются в таблице [system.query_log](/operations/system-tables/query_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

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

Правила на основе регулярных выражений, которые будут применены к запросам, а также ко всем сообщениям журнала перед их сохранением в журналах сервера,
[`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) и в журналах, отправленных клиенту. Это позволяет предотвратить
утечку конфиденциальных данных из SQL-запросов, таких как имена, электронные адреса, личные идентификаторы или номера кредитных карт в журналы.

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
|-------------|---------------------------------------------------------------------------|
| `name`      | название правила (необязательно)                                          |
| `regexp`    | Совместимое регулярное выражение RE2 (обязательно)                        |
| `replace`   | строка замещения для конфиденциальных данных (необязательно, по умолчанию - шесть звездочек) |

Правила маскировки применяются ко всему запросу (чтобы предотвратить утечку конфиденциальных данных из неправильно оформленных / неразборчивых запросов).

В таблице [`system.events`](/operations/system-tables/events) находится счетчик `QueryMaskingRulesMatch`, который содержит общее количество совпадений правил маскировки запросов.

Для распределенных запросов каждый сервер должен быть настроен отдельно, в противном случае подзапросы, переданные другим
узлам, будут храниться без маскировки.
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

Чтобы отключить настройку `query_metric_log`, вы должны создать следующий файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_thread_log {#query_thread_log} 

Настройка для ведения журнала потоков запросов, полученных с настроенной [log_query_threads=1](/operations/settings/settings#log_query_threads).

Запросы регистрируются в таблице [system.query_thread_log](/operations/system-tables/query_thread_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст ее. Если структура журнала потоков запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, а новая таблица будет создана автоматически.

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

Настройка для логирования представлений (live, материализованные и т.д.), зависящих от полученных запросов с настройкой [log_query_views=1](/operations/settings/settings#log_query_views).

Запросы записываются в таблицу [system.query_views_log](/operations/system-tables/query_views_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст ее. Если структура лога представлений запросов изменится при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет создана автоматически.

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
Эта функция является altamente экспериментальной.
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

**См. также**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Cluster Discovery](../../operations/cluster-discovery.md)
- [Replicated database engine](../../engines/database-engines/replicated.md)

## remote_url_allow_hosts {#remote_url_allow_hosts} 

Список хостов, которые разрешены для использования в движках хранения и табличных функциях, связанных с URL.

При добавлении хоста с помощью xml-тега `\<host\>`:
- он должен быть указан точно так же, как в URL, так как имя проверяется до разрешения DNS. Например: `<host>clickhouse.com</host>`
- если порт явно указан в URL, то проверяется host:port целиком. Например: `<host>clickhouse.com:80</host>`
- если хост указан без порта, разрешается любой порт хоста. Например: если указан `<host>clickhouse.com</host>`, то разрешены `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т.д.
- если хост указан как IP-адрес, то он проверяется так, как указано в URL. Например: `[2a02:6b8:a::a]`.
- если есть перенаправления и поддержка перенаправлений включена, то каждое перенаправление (поле location) проверяется.

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```

## replica_group_name {#replica_group_name} 

Имя группы реплик для базы данных Replicated.

Кластер, созданный реплицированной базой данных, будет состоять из реплик в одной и той же группе.
DDL запросы будут ждать только реплик в одной группе.

По умолчанию пусто.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```

## replicated_fetches_http_connection_timeout {#replicated_fetches_http_connection_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />HTTP таймаут соединения для запросов на получение частей. Унаследовано из профиля по умолчанию `http_connection_timeout`, если явно не задано.
## replicated_fetches_http_receive_timeout {#replicated_fetches_http_receive_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />HTTP таймаут получения для запросов на получение частей. Унаследовано из профиля по умолчанию `http_receive_timeout`, если явно не задано.
## replicated_fetches_http_send_timeout {#replicated_fetches_http_send_timeout} 

<SettingsInfoBlock type="Seconds" default_value="0" />HTTP таймаут отправки для запросов на получение частей. Унаследовано из профиля по умолчанию `http_send_timeout`, если явно не задано.
## replicated_merge_tree {#replicated_merge_tree} 

Тонкая настройка для таблиц в [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Эта настройка имеет более высокий приоритет.

Дополнительную информацию смотрите в заголовочном файле MergeTreeSettings.h.

**Пример**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```
## restore_threads {#restore_threads} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="16" />Максимальное количество потоков для выполнения запросов RESTORE.
## s3_max_redirects {#s3_max_redirects} 

<SettingsInfoBlock type="UInt64" default_value="10" />Максимальное количество перенаправлений S3.
## s3_retry_attempts {#s3_retry_attempts} 

<SettingsInfoBlock type="UInt64" default_value="100" />Настройка для Aws::Client::RetryStrategy, Aws::Client выполняет повторные попытки самостоятельно, 0 означает отсутствие повторных попыток.
## s3queue_disable_streaming {#s3queue_disable_streaming} 

<SettingsInfoBlock type="Bool" default_value="0" />Отключить потоковую передачу в S3Queue, даже если таблица создана и есть прикрепленные материализованные представления.
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

Включение этой функции, особенно в пред-продуктовых средах, очень приветствуется.

Ключи:

| Ключ                  | Описание                                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | Логический флаг для включения функции, по умолчанию `true`. Установите в `false`, чтобы избежать отправки отчетов о сбоях.                |
| `send_logical_errors` | `LOGICAL_ERROR` подобен `assert`, это ошибка в ClickHouse. Этот логический флаг позволяет отправлять эти исключения (По умолчанию: `true`). |
| `endpoint`            | Вы можете переопределить URL-адрес конечной точки для отправки отчетов о сбоях.                                                           |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## series_keeper_path {#series_keeper_path} 

<SettingsInfoBlock type="String" default_value="/clickhouse/series" />
Путь в Keeper с автоинкрементными номерами, генерируемыми функцией `generateSerialID`. Каждая серия будет узлом под этим путем.
## show_addresses_in_stack_traces {#show_addresses_in_stack_traces} 

<SettingsInfoBlock type="Bool" default_value="1" />Если установлено в true, будут показаны адреса в трассировках стека.
## shutdown_wait_backups_and_restores {#shutdown_wait_backups_and_restores} 

<SettingsInfoBlock type="Bool" default_value="1" />Если установлено в true, ClickHouse будет ждать завершения активных резервных копий и восстановлений перед завершением работы.
## shutdown_wait_unfinished {#shutdown_wait_unfinished} 

<SettingsInfoBlock type="UInt64" default_value="5" />Задержка в секундах для ожидания незавершенных запросов.
## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries} 

<SettingsInfoBlock type="Bool" default_value="0" />Если установлено в true, ClickHouse будет ждать завершения активных запросов перед завершением работы.
## skip_binary_checksum_checks {#skip_binary_checksum_checks} 

<SettingsInfoBlock type="Bool" default_value="0" />Пропускает проверки целостности бинарной контрольной суммы ClickHouse.
## ssh_server {#ssh_server} 

Публичная часть ключа хоста будет записана в файл known_hosts
на стороне клиента SSH при первом подключении.

Конфигурации ключей хоста по умолчанию неактивны.
Раскомментируйте конфигурации ключей хоста и укажите путь к соответствующему ssh ключу, чтобы активировать их:

Пример:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## startup_mv_delay_ms {#startup_mv_delay_ms} 

<SettingsInfoBlock type="UInt64" default_value="0" />Параметр отладки для имитации задержки создания материализованного представления.
## storage_configuration {#storage_configuration} 

Позволяет настраивать многодисковую конфигурацию хранения.

Конфигурация хранения основывается на следующей структуре:

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
### Configuration of disks {#configuration-of-disks}

Конфигурация `disks` соответствует структуре, приведенной ниже:

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
|---------------------------|----------------------------------------------------------------------------------------------------|
| `<disk_name_N>`           | Имя диска, которое должно быть уникальным.                                                        |
| `path`                    | Путь, по которому будут храниться данные сервера (каталоги `data` и `shadow`). Должен заканчиваться на `/` |
| `keep_free_space_bytes`   | Размер резервируемого свободного пространства на диске.                                           |

:::note
Порядок дисков не имеет значения.
:::
### Configuration of policies {#configuration-of-policies}

Подтеги выше определяют следующие параметры для `policies`:

| Настройка                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`                | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `volume_name_N`                | Имя тома. Имена томов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `disk`                         | Диск, находящийся внутри тома.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `max_data_part_size_bytes`     | Максимальный размер блока данных, который может находиться на любом из дисков в этом томе. Если в результате слияния размер блока превышает max_data_part_size_bytes, блок будет записан в следующий том. Эта функция позволяет хранить новые / маленькие блоки на горячем (SSD) томе и перемещать их на холодный (HDD) том, когда они достигают большого размера. Не используйте эту опцию, если у политики только один том.                  |
| `move_factor`                  | Доля доступного свободного пространства на томе. Если пространство становится меньше, данные начнут перемещаться на следующий том, если он существует. Для переноса блоки сортируются по размеру от большего к меньшему (по убыванию), и выбираются блоки, общий размер которых достаточен для выполнения условия `move_factor`. Если общий размер всех блоков недостаточен, будут перемещены все блоки.                                          |
| `perform_ttl_move_on_insert`   | Отключает перемещение данных с истекшим TTL при вставке. По умолчанию (если включено), если мы вставляем часть данных, которая уже истекла согласно правилу перемещения по времени жизни, она немедленно перемещается на указанный в правиле том / диск. Это может значительно замедлить вставку в случае, если целевой том / диск медленный (например, S3). Если отключено, истекшая часть данных записывается на том по умолчанию, а затем немедленно перемещается на указанный в правилах том для истекшего TTL. |
| `load_balancing`               | Политика балансировки дисков, `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `least_used_ttl_ms`            | Устанавливает таймаут (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - всегда обновлять, `-1` - никогда не обновлять, значение по умолчанию `60000`). Обратите внимание, если диск используется только ClickHouse и не будет подвергаться динамическому изменению файловой системы, вы можете использовать значение `-1`. В противном случае это не рекомендуется, так как в конечном итоге приведет к неправильному распределению пространства.                  |
| `prefer_not_to_merge`          | Отключает слияние частей данных на этом томе. Примечание: это потенциально вредно и может вызвать замедление. Когда эта настройка включена (не делайте этого), слияние данных на этом томе запрещено (что плохо). Это позволяет контролировать, как ClickHouse взаимодействует с медленными дисками. Мы рекомендуем вообще не использовать это.                                                                                                                                                                                                          |
| `volume_priority`              | Определяет приоритет (порядок) заполнения томов. Чем меньше значение, тем выше приоритет. Значения параметров должны быть натуральными числами и охватывать диапазон от 1 до N (N — наибольшее указанное значение параметра) без пропусков.                                                                                                                                                                                                                                          |

Что касается `volume_priority`:
- Если все тома имеют этот параметр, они получают приоритет в указанном порядке.
- Если только _некоторые_ тома имеют его, то тома, которые его не имеют, имеют наименьший приоритет. Те, которые его имеют, получают приоритет в соответствии со значением тега, приоритет остальных определяется по порядку описания в файле конфигурации относительно друг друга.
- Если _никакие_ тома не имеют этого параметра, их порядок определяется порядком описания в файле конфигурации.
- Приоритет томов может быть не идентичным.

## storage_connections_soft_limit {#storage_connections_soft_limit} 

<SettingsInfoBlock type="UInt64" default_value="100" />Соединения выше этого лимита имеют значительно более короткое время жизни. Лимит применяется к соединениям с хранилищами.

## storage_connections_store_limit {#storage_connections_store_limit} 

<SettingsInfoBlock type="UInt64" default_value="5000" />Соединения выше этого лимита сбрасываются после использования. Установите в 0, чтобы отключить кеш соединений. Лимит применяется к соединениям с хранилищами.

## storage_connections_warn_limit {#storage_connections_warn_limit} 

<SettingsInfoBlock type="UInt64" default_value="1000" />Предупреждающие сообщения записываются в логи, если число используемых соединений превышает этот лимит. Лимит применяется к соединениям с хранилищами.

## storage_metadata_write_full_object_key {#storage_metadata_write_full_object_key} 

<SettingsInfoBlock type="Bool" default_value="1" />Запись файлов метаданных диска в формате VERSION_FULL_OBJECT_KEY. Это включено по умолчанию. Настройка устарела.

## storage_shared_set_join_use_inner_uuid {#storage_shared_set_join_use_inner_uuid} 

<SettingsInfoBlock type="Bool" default_value="1" />Если включено, внутренний UUID генерируется при создании SharedSet и SharedJoin. Только ClickHouse Cloud.

## table_engines_require_grant {#table_engines_require_grant} 

Если установлено в true, пользователи требуют разрешения для создания таблицы с конкретным движком, например `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию, для обратной совместимости создание таблицы с конкретным движком таблицы игнорирует разрешения, однако вы можете изменить это поведение, установив это значение в true.
:::

## tables_loader_background_pool_size {#tables_loader_background_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Устанавливает количество потоков, выполняющих асинхронные задания загрузки в фоновом режиме. Фоновый пул используется для асинхронной загрузки таблиц после запуска сервера, если нет ожидающих запросов для таблицы. Рекомендуется поддерживать небольшое количество потоков в фоновом пуле, если таблиц много. Это сохранит ресурсы CPU для выполнения параллельных запросов.

:::note
Значение `0` означает, что будут использоваться все доступные ЦП.
:::

## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />
Устанавливает количество потоков, выполняющих задания загрузки в фоновом пуле. Фоновый пул используется для синхронной загрузки таблиц перед тем, как сервер начинает прослушивать порт, и для загрузки таблиц, которые ожидаются. Фоновый пул имеет более высокий приоритет, чем фоновой пул. Это означает, что никаких заданий не запускается в фоновом пуле, пока в фоновом пуле работают задания.

:::note
Значение `0` означает, что будут использоваться все доступные ЦП.
:::

## tcp_close_connection_after_queries_num {#tcp_close_connection_after_queries_num} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальное количество запросов, разрешенное для одного TCP-соединения, прежде чем соединение будет закрыто. Установите в 0 для неограниченного количества запросов.

## tcp_close_connection_after_queries_seconds {#tcp_close_connection_after_queries_seconds} 

<SettingsInfoBlock type="UInt64" default_value="0" />Максимальное время жизни TCP-соединения в секундах, прежде чем оно будет закрыто. Установите в 0 для неограниченной продолжительности соединения.

## tcp_port {#tcp_port} 

Порт для связи с клиентами по протоколу TCP.

**Пример**

```xml
<tcp_port>9000</tcp_port>
```

## tcp_port_secure {#tcp_port_secure} 

Порт TCP для безопасной связи с клиентами. Используйте его с настройками [OpenSSL](#openssl).

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

С этой опцией временные данные будут храниться в кэше для конкретного диска. В этом разделе вы должны указать имя диска с типом `cache`. В этом случае кэш и временные данные будут разделять одно и то же пространство, и кэш диска может быть очищен для создания временных данных.

:::note
Можно использовать только одну опцию для конфигурации хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
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

## temporary_data_in_distributed_cache {#temporary_data_in_distributed_cache} 

<SettingsInfoBlock type="Bool" default_value="0" />Хранить временные данные в распределенном кэше.

## text_log {#text_log} 

Настройки для системной таблицы [text_log](/operations/system-tables/text_log) для логирования текстовых сообщений.

<SystemLogParameters/>

Кроме того:

| Настройка | Описание                                                                                                                                                                                                 | Значение по умолчанию |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| `level`   | Максимальный уровень сообщения (по умолчанию `Trace`), который будет храниться в таблице.                                                                                                               | `Trace`               |

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
Максимальное количество заданий, которое может быть запланировано в Объединённом Потоке. Увеличение размера очереди приводит к большему использованию памяти. Рекомендуется поддерживать это значение равным [`max_thread_pool_size`](/operations/server-configuration-parameters/settings#max_thread_pool_size).

:::note
Значение `0` означает неограниченное количество.
:::

**Пример**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```

## threadpool_local_fs_reader_pool_size {#threadpool_local_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />Количество потоков в пуле потоков для чтения с локальной файловой системы, когда `local_filesystem_read_method = 'pread_threadpool'`.

## threadpool_local_fs_reader_queue_size {#threadpool_local_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Максимальное количество заданий, которое можно запланировать в пуле потоков для чтения с локальной файловой системы.

## threadpool_remote_fs_reader_pool_size {#threadpool_remote_fs_reader_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="250" />Количество потоков в пуле потоков, используемом для чтения с удаленной файловой системы, когда `remote_filesystem_read_method = 'threadpool'`.

## threadpool_remote_fs_reader_queue_size {#threadpool_remote_fs_reader_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Максимальное количество заданий, которое можно запланировать в пуле потоков для чтения с удаленной файловой системы.

## threadpool_writer_pool_size {#threadpool_writer_pool_size} 

<SettingsInfoBlock type="NonZeroUInt64" default_value="100" />Размер фонового пула для запросов на запись в объектные хранилища.

## threadpool_writer_queue_size {#threadpool_writer_queue_size} 

<SettingsInfoBlock type="UInt64" default_value="1000000" />Количество задач, которые можно добавить в фоновый пул для запросов на запись в объектные хранилища.

## throw_on_unknown_workload {#throw_on_unknown_workload} 

<SettingsInfoBlock type="Bool" default_value="0" />
Определяет поведение при доступе к неизвестной WORKLOAD с настройкой запроса 'workload'.

- Если `true`, выбрасывается исключение RESOURCE_ACCESS_DENIED из запроса, который пытается получить доступ к неизвестной нагрузке. Полезно для принуждения распределения ресурсов для всех запросов после установления иерархии WORKLOAD, которая содержит WORKLOAD по умолчанию.
- Если `false` (по умолчанию), неограниченный доступ без распределения ресурсов предоставляется запросу с настройкой 'workload', указывающим на неизвестную нагрузку. Это важно на этапе настройки иерархии WORKLOAD, до добавления WORKLOAD по умолчанию.

**Пример**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```

**См. также**
- [Планирование нагрузки](/operations/workload-scheduling.md)

## timezone {#timezone} 

Часовой пояс сервера.

Указывается как идентификатор IANA для часового пояса UTC или географического местоположения (например, Africa/Abidjan).

Часовой пояс необходим для преобразования между строковыми и временными форматами при выводе полей DateTime в текстовом формате (выведены на экран или в файл) и при получении DateTime из строки. Кроме того, часовой пояс используется в функциях, которые работают со временем и датой, если они не получили часовой пояс в входных параметрах.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**См. также**

- [session_timezone](../settings/settings.md#session_timezone)

## tmp_path {#tmp_path} 

Путь на локальной файловой системе для хранения временных данных для обработки больших запросов.

:::note
- Можно использовать только одну опцию для конфигурации хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- Обязательна косая черта в конце.
:::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```

## tmp_policy {#tmp_policy} 

Политика хранения временных данных. Все файлы с префиксом `tmp` будут удалены при запуске.

:::note
Рекомендации по использованию объектного хранения в качестве `tmp_policy`:
- Используйте отдельные `bucket:path` на каждом сервере.
- Используйте `metadata_type=plain`.
- Вы также можете установить TTL для этой корзины.
:::

:::note
- Можно использовать только одну опцию для конфигурации хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes` игнорируются.
- Политика должна иметь ровно *один том*.

Для получения дополнительной информации смотрите документацию [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree).
:::

**Пример**

Когда `/disk1` будет заполнен, временные данные будут храниться на `/disk2`.

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
- Функция [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) и ее вариации,
  которая принимает имя пользовательского списка TLD и возвращает часть домена, которая включает субдомены верхнего уровня до первого значимого субдомена.

## total_memory_profiler_sample_max_allocation_size {#total_memory_profiler_sample_max_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Собирать случайные выделения размера меньше или равного указанному значению с вероятностью, равной `total_memory_profiler_sample_probability`. 0 означает отключено. Возможно, вам стоит установить 'max_untracked_memory' в 0, чтобы этот порог работал как ожидается.

## total_memory_profiler_sample_min_allocation_size {#total_memory_profiler_sample_min_allocation_size} 

<SettingsInfoBlock type="UInt64" default_value="0" />Собирать случайные выделения размера больше или равного указанному значению с вероятностью, равной `total_memory_profiler_sample_probability`. 0 означает отключено. Возможно, вам стоит установить 'max_untracked_memory' в 0, чтобы этот порог работал как ожидается.

## total_memory_profiler_step {#total_memory_profiler_step} 

<SettingsInfoBlock type="UInt64" default_value="0" />Всякий раз, когда использование памяти сервера превышает каждый следующий шаг в количестве байт, профайлер памяти будет собирать трассировку стека выделения. Ноль означает отключенный профайлер памяти. Значения ниже нескольких мегабайт замедлят сервер.

## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability} 

<SettingsInfoBlock type="Double" default_value="0" />
Позволяет собирать случайные выделения и деалокации и записывать их в системную таблицу [system.trace_log](../../operations/system-tables/trace_log.md) с `trace_type`, равным `MemorySample`, с заданной вероятностью. Вероятность относится к каждому выделению или деалокации, независимо от размера выделения. Обратите внимание, что выборка происходит только тогда, когда количество неучтенной памяти превышает лимит неучтенной памяти (значение по умолчанию `4` MiB). Его можно уменьшить, если [total_memory_profiler_step](/operations/server-configuration-parameters/settings#total_memory_profiler_step) будет уменьшен. Вы можете установить `total_memory_profiler_step` равным `1` для дополнительной детализированной выборки.

Допустимые значения:

- Положительное дробное число.
- `0` — Запись случайных выделений и деалокаций в системной таблице `system.trace_log` отключена.

## trace_log {#trace_log} 

Настройки для системной таблицы [trace_log](/operations/system-tables/trace_log).

<SystemLogParameters/>

Конфигурационный файл сервера по умолчанию `config.xml` содержит следующий раздел настроек:

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

Существует один общий кэш для сервера. Память выделяется по мере необходимости. Кэш используется, если параметр `use_uncompressed_cache` включен.

Несжатый кэш выгоден для очень коротких запросов в отдельных случаях.

:::note
Значение `0` означает отключено.

Эту настройку можно изменять во время выполнения, и она вступит в силу немедленно.
:::

## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае политики SLRU) в несжатом кэше относительно общего размера кэша. 

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

ClickHouse использует настройку для всех таблиц на сервере. Вы можете изменить настройку в любое время. Существующие таблицы изменяют свое поведение, когда настройка изменяется.

**Для каждой таблицы**

При создании таблицы укажите соответствующую [настройку движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этой настройкой не изменяется, даже если глобальная настройка изменяется.

**Возможные значения**

- `0` — Функциональность отключена.
- `1` — Функциональность включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицированные](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки частей данных компактно, используя один `znode`. Если таблица содержит много колонок, этот метод хранения значительно сокращает объем данных, хранящихся в Zookeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` вы не можете понизить версию сервера ClickHouse на версию, которая не поддерживает эту настройку. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все серверы сразу. Безопаснее тестировать новые версии ClickHouse в тестовой среде или на лишь нескольких серверах кластера.

Заголовки частей данных, уже хранящиеся с этой настройкой, не могут быть восстановлены в их прежнее (не компактное) представление.
:::
## user_defined_executable_functions_config {#user_defined_executable_functions_config} 

Путь к файлу конфигурации для исполняемых пользовательских функций.

Путь:

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать подстановочные знаки \* и ?.

См. также:
- "[Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions).".

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## user_defined_path {#user_defined_path} 

Директория с пользовательскими файлами. Используется для SQL пользовательских функций [SQL пользовательские функции](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## user_directories {#user_directories} 

Раздел файла конфигурации, который содержит настройки:
- Путь к файлу конфигурации с предопределенными пользователями.
- Путь к папке, где хранятся пользователи, созданные SQL-командами.
- Путь узла ZooKeeper, где хранятся и реплицируются пользователи, созданные SQL-командами (экспериментально).

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

Вы также можете определить разделы `memory` — означает хранение информации только в памяти, без записи на диск, и `ldap` — означает хранение информации на сервере LDAP.

Чтобы добавить сервер LDAP в качестве удаленной директории пользователей, которые не определены локально, определите единый раздел `ldap` со следующими настройками:

| Настройка | Описание                                                                                                                                                                                                                                                                                                                                                                     |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server`  | одна из имен серверов LDAP, определенных в разделе конфигурации `ldap_servers`. Этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                           |
| `roles`   | раздел со списком локально определенных ролей, которые будут назначены каждому пользователю, полученному от сервера LDAP. Если роли не указаны, пользователь не сможет выполнять никакие действия после аутентификации. Если любая из указанных ролей не определена локально в момент аутентификации, попытка аутентификации завершится неудачей, как будто предоставленный пароль был неверным. |

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

Директория с файлами пользовательских скриптов. Используется для исполняемых пользовательских функций [Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions).

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

<SettingsInfoBlock type="Bool" default_value="0" />Определяет, включена ли проверка информации о клиенте при получении пакета запроса.

По умолчанию это `false`:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```
## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries} 

<SettingsInfoBlock type="UInt64" default_value="10000000" />Размер кэша для индекса векторного сходства в записях. Ноль означает отключение.
## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy} 

<SettingsInfoBlock type="String" default_value="SLRU" />Имя политики кэша для индекса векторного сходства.
## vector_similarity_index_cache_size {#vector_similarity_index_cache_size} 

<SettingsInfoBlock type="UInt64" default_value="5368709120" />Размер кэша для индексов векторного сходства. Ноль означает отключение.

:::note
Эту настройку можно изменить во время выполнения, и она вступит в силу мгновенно.
:::
## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio} 

<SettingsInfoBlock type="Double" default_value="0.5" />Размер защищенной очереди (в случае политики SLRU) в кэше индекса векторного сходства относительно общего размера кэша.
## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup} 

<SettingsInfoBlock type="Bool" default_value="1" />
Эта настройка позволяет указать поведение, если `dictionaries_lazy_load` равно `false`.
(Если `dictionaries_lazy_load` равно `true`, эта настройка не влияет на что-либо.)

Если `wait_dictionaries_load_at_startup` равно `false`, то сервер
начнет загрузку всех словарей при старте, и он будет принимать подключения параллельно с этой загрузкой.
Когда словарь используется в запросе впервые, запрос будет ожидать, пока словарь не будет загружен, если он еще не загружен.
Установка `wait_dictionaries_load_at_startup` в `false` может ускорить запуск ClickHouse, однако некоторые запросы могут выполняться медленнее
(поскольку им придется ждать, пока некоторые словари загрузятся).

Если `wait_dictionaries_load_at_startup` равно `true`, то сервер будет ждать при старте,
пока все словари не завершат свою загрузку (успешно или нет) перед получением каких-либо подключений.

**Пример**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```
## workload_path {#workload_path} 

Директория, используемая в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется папка `/workload/` под рабочей директорией сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**См. также**
- [Иерархия нагрузки](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path} 

Путь к узлу ZooKeeper, который используется в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для согласованности все определения SQL хранятся как значение этого единственного znod. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**См. также**
- [Иерархия нагрузки](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
## zookeeper {#zookeeper} 

Содержит настройки, которые позволяют ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицированных таблиц. Если реплицированные таблицы не используются, этот раздел параметров можно опустить.

Следующие параметры можно настроить с помощью подметок:

| Настройка                                   | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                       | Контактная точка ZooKeeper. Вы можете установить несколько контактных точек. Например, `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` указывает порядок узла при попытке подключиться к кластеру ZooKeeper.                                                                                                                                                                                                                                                                     |
| `session_timeout_ms`                         | Максимальный тайм-аут для сессии клиента в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `operation_timeout_ms`                       | Максимальный тайм-аут для одной операции в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `root` (необязательный)                      | Узел, который используется в качестве корня для znodes, используемых сервером ClickHouse.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `fallback_session_lifetime.min` (необязательный) | Минимальный лимит для продолжительности сессии зоопарка для резервного узла, когда основной недоступен (балансировка нагрузки). Указывается в секундах. По умолчанию: 3 часа.                                                                                                                                                                                                                                                                                                                                         |
| `fallback_session_lifetime.max` (необязательный) | Максимальный лимит для продолжительности сессии зоопарка для резервного узла, когда основной недоступен (балансировка нагрузки). Указывается в секундах. По умолчанию: 6 часов.                                                                                                                                                                                                                                                                                                                                         |
| `identity` (необязательный)                  | Пользователь и пароль, необходимые для ZooKeeper для доступа к запрашиваемым znodes.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `use_compression` (необязательный)           | Включает сжатие в протоколе Keeper, если установлено в true.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

Существует также настройка `zookeeper_load_balancing` (необязательная), которая позволяет выбрать алгоритм для выбора узла ZooKeeper:

| Название алгоритма              | Описание                                                                                                                    |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `random`                        | случайно выбирает один из узлов ZooKeeper.                                                                                |
| `in_order`                      | выбирает первый узел ZooKeeper, если он недоступен, то второй и так далее.                                               |
| `nearest_hostname`              | выбирает узел ZooKeeper с именем хоста, наиболее похожим на имя хоста сервера; имя хоста сравнивается по префиксу.       |
| `hostname_levenshtein_distance` | как nearest_hostname, но сравнивает имя хоста с учетом расстояния Левенштейна.                                           |
| `first_or_random`               | выбирает первый узел ZooKeeper, если он недоступен, то случайным образом выбирает один из оставшихся узлов ZooKeeper.     |
| `round_robin`                   | выбирает первый узел ZooKeeper; если происходит повторное подключение, выбирает следующий.                                 |

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

- [Репликация](../../engines/table-engines/mergetree-family/replication.md)
- [Руководство программиста ZooKeeper](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [Дополнительная защищенная связь между ClickHouse и Zookeeper](/operations/ssl-zookeeper)