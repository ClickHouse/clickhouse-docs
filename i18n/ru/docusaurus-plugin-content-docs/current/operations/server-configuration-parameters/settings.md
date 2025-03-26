---
description: 'В этом разделе содержатся описания настроек сервера, которые невозможно изменить на уровне сессии или запроса.'
keywords: ['глобальные настройки сервера']
sidebar_label: 'Глобальные настройки сервера'
sidebar_position: 57
slug: /operations/server-configuration-parameters/settings
title: 'Глобальные настройки сервера'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/docs/operations/server-configuration-parameters/_snippets/_system-log-parameters.md'

# Глобальные настройки сервера

В этом разделе содержатся описания настроек сервера, которые невозможно изменить на уровне сессии или запроса. Эти настройки хранятся в файле `config.xml` на сервере ClickHouse. Для получения дополнительной информации о файлах конфигурации в ClickHouse см. ["Файлы конфигурации"](/operations/configuration-files).

Другие настройки описаны в разделе "[Настройки](/operations/settings/overview)". Перед изучением настроек, мы рекомендуем прочитать раздел [Файлы конфигурации](/operations/configuration-files) и обратить внимание на использование замен (атрибуты `incl` и `optional`).
## allow_use_jemalloc_memory {#allow_use_jemalloc_memory}

Разрешает использование jemalloc памяти.

Тип: `Bool`

По умолчанию: `1`
## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s}

Период в секундах для обновления асинхронных метрик.

Тип: `UInt32`

По умолчанию: `120`
## asynchronous_metric_log {#asynchronous_metric_log}

Включено по умолчанию в развертываниях ClickHouse Cloud.

Если настройка не включена по умолчанию в вашей среде, в зависимости от способа установки ClickHouse, ниже объясняется, как можно ее включить или отключить.

**Включение**

Чтобы вручную включить историю логов асинхронных метрик [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md), создайте файл `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` со следующим содержанием:

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

Чтобы отключить настройку `asynchronous_metric_log`, вы должны создать файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержанием:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s}

Период в секундах для обновления асинхронных метрик.

Тип: `UInt32`

По умолчанию: `1`
## auth_use_forwarded_address {#auth_use_forwarded_address}

Использует исходный адрес для аутентификации клиентов, подключенных через прокси.

:::note
Эту настройку следует использовать с особой осторожностью, поскольку перешедшие адреса могут быть легко подделаны - серверы, принимающие такую аутентификацию, не должны быть доступны напрямую, только через доверенный прокси.
:::

Тип: `Bool`

По умолчанию: `0`
## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size}

Максимальное количество потоков, которые будут использоваться для выполнения операций сброса для [таблиц с движком Buffer](/engines/table-engines/special/buffer) в фоне.

Тип: `UInt64`

По умолчанию: `16`
## background_common_pool_size {#background_common_pool_size}

Максимальное количество потоков, которые будут использоваться для выполнения различных операций (в основном сбор мусора) для таблиц с движком [*MergeTree](/engines/table-engines/mergetree-family) в фоне.

Тип: `UInt64`

По умолчанию: `8`
## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size}

Максимальное количество потоков, которые будут использоваться для выполнения распределенных отправок.

Тип: `UInt64`

По умолчанию: `16`
## background_fetches_pool_size {#background_fetches_pool_size}

Максимальное количество потоков, которые будут использоваться для извлечения частей данных с другой реплики для таблиц с движком [*MergeTree](/engines/table-engines/mergetree-family) в фоне.

Тип: `UInt64`

По умолчанию: `16`
## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio}

Устанавливает соотношение между числом потоков и числом фоновых слияний и мутаций, которые могут выполняться одновременно.

Например, если соотношение равно 2 и [`background_pool_size`](#background_pool_size) установлено на 16, тогда ClickHouse может выполнять 32 фоновых слияния одновременно. Это возможно, потому что фоновые операции могут быть приостановлены и отложены. Это необходимо для того, чтобы небольшие слияния имели более высокий приоритет выполнения.

:::note
Вы можете увеличить это соотношение во время выполнения. Чтобы его уменьшить, необходимо перезапустить сервер.

Как и в случае с настройкой [`background_pool_size`](#background_pool_size), [`background_merges_mutations_concurrency_ratio`](#background_merges_mutations_concurrency_ratio) может быть применено из профиля `default` для обратной совместимости.
:::

Тип: `Float`

По умолчанию: `2`
## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy}

Политика выполнения планирования для фоновых слияний и мутаций. Возможные значения: `round_robin` и `shortest_task_first`.

Алгоритм, используемый для выбора слияния или мутации, выполняемого следующим потоком фоновых задач. Политика может быть изменена в процессе выполнения без перезапуска сервера.
Может быть применена из профиля `default` для обратной совместимости.

Возможные значения:

- `round_robin` — Каждое параллельное слияние и мутация выполняются в порядке round-robin для обеспечения бесперебойной работы. Меньшие слияния завершаются быстрее, чем большие, просто потому что имеют меньше блоков для слияния.
- `shortest_task_first` — Всегда выполняется меньшее слияние или мутация. Мучения и мутации назначаются приоритеты на основе их результирующего размера. Слияния с меньшими размерами строго предпочтительны перед большими. Эта политика обеспечивает максимально быстрое слияние небольших частей, но может привести к бесконечной блокировке больших слияний в разделах, интенсивно перегруженных `INSERT`.
 
Тип: String

По умолчанию: `round_robin`
## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size}

Максимальное количество потоков, которые будут использоваться для выполнения фоновых операций потоковой передачи сообщений.

Тип: UInt64

По умолчанию: `16`
## background_move_pool_size {#background_move_pool_size}

Максимальное количество потоков, которые будут использоваться для перемещения частей данных на другой диск или том для таблиц с движком *MergeTree в фоне.

Тип: UInt64

По умолчанию: `8`
## background_schedule_pool_size {#background_schedule_pool_size}

Максимальное количество потоков, которые будут использоваться для постоянного выполнения некоторых лёгких периодических операций для реплицированных таблиц, потоковой передачи Kafka и обновлений кэша DNS.

Тип: UInt64

По умолчанию: `512`
## backups {#backups}

Настройки для резервных копий, используемые при записи `BACKUP TO File()`.

Следующие настройки могут быть сконфигурированы с помощью под-тегов:

| Настройка                          | Описание                                                                                                                                                                    | По умолчанию |
|------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `allowed_path`                     | Путь для резервного копирования при использовании `File()`. Эта настройка должна быть установлена для использования `File`. Путь может быть относительным к директории экземпляра или абсолютным.                                                              | `true`      |
| `remove_backup_files_after_failure`| Если команда `BACKUP` завершится неудачей, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до момента неудачи, в противном случае они останутся как есть.                                                                         | `true`      |

Эта настройка по умолчанию конфигурируется как:

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## backup_threads {#backup_threads}

Максимальное количество потоков для выполнения запросов `BACKUP`.

Тип: `UInt64`

По умолчанию: `16`
## backups_io_thread_pool_queue_size {#backups_io_thread_pool_queue_size}

Максимальное количество задач, которые могут быть запланированы в пуле потоков ввода-вывода для резервных копий. Рекомендуется оставлять эту очередь без ограничений из-за текущей логики резервного копирования S3.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

Тип: `UInt64`

По умолчанию: `0`
## bcrypt_workfactor {#bcrypt_workfactor}

Фактор работы для типа аутентификации bcrypt_password, который использует [алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).

По умолчанию: `12`

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```
## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio}

Устанавливает максимальное соотношение размера кэша к объёму RAM. Позволяет уменьшать размер кэша на системах с небольшим объёмом памяти.

Тип: `Double`

По умолчанию: `0.5`
## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num}

Максимальное число потоков обработки запросов, исключая потоки для получения данных с удалённых серверов, разрешённых для выполнения всех запросов. Этот лимит не является жёстким: если лимит достигается, запрос всё равно получит как минимум один поток для выполнения. Запросы могут увеличить количество потоков в процессе выполнения, если они становятся доступными.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

Тип: `UInt64`

По умолчанию: `0`
## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores}

То же, что и [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num), но с соотношением к ядрам.

Тип: `UInt64`

По умолчанию: `0`
## concurrent_threads_scheduler {#concurrent_threads_scheduler}

Политика выполнения планирования CPU слотов, указанных настройками `concurrent_threads_soft_limit_num` и `concurrent_threads_soft_limit_ratio_to_cores`. Алгоритм, используемый для распределения ограниченного числа CPU слотов между параллельными запросами. Планировщик может быть изменен в процессе выполнения без перезапуска сервера.

Тип: String

По умолчанию: `round_robin`

Возможные значения:

- `round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads` CPU-слотов. Один слот на поток. При возникновении конкуренции CPU-слоты выделяются запросам в порядке round-robin. Обратите внимание, что первый слот выделяется безусловно, что может привести к несправедливости и повышенной задержке выполнения запросов с высоким значением `max_threads` при наличии большого количества запросов с `max_threads` = 1.
- `fair_round_robin` — Каждый запрос с настройкой `use_concurrency_control` = 1 выделяет до `max_threads - 1` CPU-слотов. Вариант `round_robin`, который не требует CPU-слота для первого потока каждого запроса. Таким образом, запросы с `max_threads` = 1 не требуют слотов и не могут несправедливо использовать все слоты. Нет слотов, выделяемых безусловно.
## default_database {#default_database}

Имя базы данных по умолчанию.

Тип: `String`

По умолчанию: `default`
## disable_internal_dns_cache {#disable_internal_dns_cache}

Отключает внутренний кэш DNS. Рекомендуется для эксплуатации ClickHouse в системах с часто изменяющейся инфраструктурой, таких как Kubernetes.

Тип: `Bool`

По умолчанию: `0`
## dns_cache_max_entries {#dns_cache_max_entries}

Максимальное количество записей во внутреннем кэше DNS.

Тип: `UInt64`

По умолчанию: `10000`
## dns_cache_update_period {#dns_cache_update_period}

Период обновления внутреннего кэша DNS в секундах.

Тип: `Int32`

По умолчанию: `15`
## dns_max_consecutive_failures {#dns_max_consecutive_failures}

Максимальное количество последовательных ошибок разрешения перед удалением узла из кэша DNS ClickHouse

Тип: `UInt32`

По умолчанию: `10`
## index_mark_cache_policy {#index_mark_cache_policy}

Название политики кэша меток индексов.

Тип: `String`

По умолчанию: `SLRU`
## index_mark_cache_size {#index_mark_cache_size}

Максимальный размер кэша для меток индексов.

:::note

Значение `0` означает отключено.

Эту настройку можно изменить в процессе выполнения, и она вступит в силу немедленно.
:::

Тип: `UInt64`

По умолчанию: `0`
## index_mark_cache_size_ratio {#index_mark_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше меток индексов относительно общего размера кэша.

Тип: `Double`

По умолчанию: `0.5`
## index_uncompressed_cache_policy {#index_uncompressed_cache_policy}

Название политики кэша не сжатых блоков индексов.

Тип: `String`

По умолчанию: `SLRU`
## index_uncompressed_cache_size {#index_uncompressed_cache_size}

Максимальный размер кэша для не сжатых блоков индексов `MergeTree`.

:::note
Значение `0` означает отключено.

Эту настройку можно изменить в процессе выполнения, и она вступит в силу немедленно.
:::

Тип: `UInt64`

По умолчанию: `0`
## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше не сжатых блоков индексов относительно общего размера кэша.

Тип: `Double`

По умолчанию: `0.5`
## vector_similarity_index_cache_policy {#vector_similarity_index_cache_policy}

Название политики кэша индексов векторного сходства.

Тип: `String`

По умолчанию: `SLRU`
## vector_similarity_index_cache_size {#vector_similarity_index_cache_size}

Размер кэша для индексов векторного сходства. Ноль означает отключено.

:::note
Эту настройку можно изменить в процессе выполнения, и она вступит в силу немедленно.
:::

Тип: `UInt64`

По умолчанию: `5368709120` (= 5 GiB)
## vector_similarity_index_cache_size_ratio {#vector_similarity_index_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше индексов векторного сходства относительно общего размера кэша.

Тип: `Double`

По умолчанию: `0.5`
## vector_similarity_index_cache_max_entries {#vector_similarity_index_cache_max_entries}

Максимальное количество записей в кэше индексов векторного сходства.

Тип: `UInt64`

По умолчанию: `10000000`
## io_thread_pool_queue_size {#io_thread_pool_queue_size}

Максимальное количество задач, которые можно запланировать в пуле потоков ввода-вывода.

:::note
Значение `0` означает отсутствие ограничений.
:::

Тип: `UInt64`

По умолчанию: `10000`
## mark_cache_policy {#mark_cache_policy}

Название политики кэша меток.

Тип: `String`

По умолчанию: `SLRU`
## mark_cache_size {#mark_cache_size}

Максимальный размер кэша для меток (индекс семейств таблиц [`MergeTree`](/engines/table-engines/mergetree-family)).

:::note
Эту настройку можно изменить в процессе выполнения, и она вступит в силу немедленно.
:::

Тип: `UInt64`

По умолчанию: `5368709120`
## mark_cache_size_ratio {#mark_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше меток относительно общего размера кэша.

Тип: `Double`

По умолчанию: `0.5`
## query_condition_cache_policy {#query_condition_cache_policy}

Название политики кэша условий запроса.

Тип: `String`

По умолчанию: `SLRU`
## query_condition_cache_size {#query_condition_cache_size}

Максимальный размер кэша условий запроса.

:::note
Эту настройку можно изменить в процессе выполнения, и она вступит в силу немедленно.
:::

Тип: `UInt64`

По умолчанию: `1073741824` (100 MiB)
## query_condition_cache_size_ratio {#query_condition_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше условий запроса относительно общего размера кэша.

Тип: `Double`

По умолчанию: `0.5`
## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server}

Максимальная скорость чтения в байтах в секунду для всех резервных копий на сервере. Ноль означает отсутствие ограничений.

Тип: `UInt64`

По умолчанию: `0`
## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size}

Если количество **не занятых** потоков в пуле потоков Backups IO превышает `max_backup_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занятые простаивающими потоками, и уменьшит размер пула. Потоки могут быть созданы снова, если это необходимо.

Тип: `UInt64`

По умолчанию: `0`
## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size}

ClickHouse использует потоки из пула потоков Backups IO для выполнения IO операций S3 для резервных копий. `max_backups_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.

Тип: `UInt64`

По умолчанию: `1000`
## max_concurrent_queries {#max_concurrent_queries}

Ограничение на общее количество одновременно выполненных запросов. Обратите внимание, что должны также учитываться ограничения на `INSERT` и `SELECT` запросы, а также максимальное количество запросов для пользователей.

См. также:
- [`max_concurrent_insert_queries`](#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings/#max_concurrent_queries_for_all_users)

:::note

Значение `0` (по умолчанию) означает отсутствие ограничений.

Эту настройку можно изменить в процессе выполнения, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_concurrent_insert_queries {#max_concurrent_insert_queries}

Ограничение на общее количество одновременно выполняемых запросов на вставку.

:::note

Значение `0` (по умолчанию) означает отсутствие ограничений.

Эту настройку можно изменить в процессе выполнения, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_concurrent_select_queries {#max_concurrent_select_queries}

Ограничение на общее количество одновременно выполняемых запросов на выборку.

:::note

Значение `0` (по умолчанию) означает отсутствие ограничений.

Эту настройку можно изменить в процессе выполнения, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_waiting_queries {#max_waiting_queries}

Ограничение на общее количество ожидающих запросов.
Выполнение ожидающего запроса блокируется, пока таблицы загружаются асинхронно (см. [`async_load_databases`](#async_load_databases)).

:::note
Ожидающие запросы не учитываются при проверке ограничений, управляемых следующими настройками:

- [`max_concurrent_queries`](#max_concurrent_queries)
- [`max_concurrent_insert_queries`](#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

Эта коррекция выполняется, чтобы избежать достижения этих лимитов сразу после запуска сервера.
:::

:::note

Значение `0` (по умолчанию) означает отсутствие ограничений.

Эту настройку можно изменить в процессе выполнения, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся без изменений.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_connections {#max_connections}

Максимальное количество подключений к серверу.

Тип: `Int32`

По умолчанию: `1024`
## max_io_thread_pool_free_size {#max_io_thread_pool_free_size}

Если количество **не занятых** потоков в пуле потоков ввода-вывода превышает `max_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занятые простаивающими потоками, и уменьшит размер пула. Потоки могут быть созданы снова, если это необходимо.

Тип: `UInt64`

По умолчанию: `0`
## max_io_thread_pool_size {#max_io_thread_pool_size}

ClickHouse использует потоки из пула потоков ввода-вывода для выполнения некоторых IO операций (например, для взаимодействия с S3). `max_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.

Тип: `UInt64`

По умолчанию: `100`
## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server}

Максимальная скорость локальных чтений в байтах в секунду.

:::note
Значение `0` означает отсутствие ограничений.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server}

Максимальная скорость локальных записей в байтах в секунду.

:::note
Значение `0` означает отсутствие ограничений.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_partition_size_to_drop {#max_partition_size_to_drop}

Ограничение на удаление разделов.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает [`max_partition_size_to_drop`](#max_partition_size_to_drop) (в байтах), вы не можете удалить раздел, используя запрос [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart).
Эта настройка не требует перезапуска сервера ClickHouse для применения. Другой способ отключить ограничение - создать файл `<clickhouse-path>/flags/force_drop_table`.

:::note
Значение `0` означает, что вы можете удалять разделы без ограничений.

Это ограничение не ограничивает удаление и очистку таблиц, см. [max_table_size_to_drop](#max_table_size_to_drop)
:::

**Пример**

```xml
<max_partition_size_to_drop>0</max_partition_size_to_drop>
```

Тип: `UInt64`

По умолчанию: `50`
## max_remote_read_network_bandwidth_for_server {#max_remote_read_network_bandwidth_for_server}

Максимальная скорость обмена данными по сети в байтах в секунду для чтения.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server}

Максимальная скорость обмена данными по сети в байтах в секунду для записи.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_server_memory_usage {#max_server_memory_usage}

Ограничение на общее использование памяти.
Значение [`max_server_memory_usage`](#max_server_memory_usage) по умолчанию рассчитывается как `memory_amount * max_server_memory_usage_to_ram_ratio`.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio}

То же, что и [`max_server_memory_usage`](#max_server_memory_usage), но с соотношением к физической оперативной памяти. Позволяет уменьшить использование памяти в системах с небольшим объёмом памяти.

На хостах с небольшим объёмом ОЗУ и свопа возможно потребуется установить [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) больше, чем 1.

:::note
Значение `0` означает отсутствие ограничений.
:::

Тип: `Double`

По умолчанию: `0.9`
## max_build_vector_similarity_index_thread_pool_size {#server_configuration_parameters_max_build_vector_similarity_index_thread_pool_size}

Максимальное количество потоков для создания векторных индексов.

:::note
Значение `0` означает все ядра.
:::

Тип: `UInt64`

По умолчанию: `16`
## cgroups_memory_usage_observer_wait_time {#cgroups_memory_usage_observer_wait_time}

Интервал в секундах, в течение которого максимальное разрешённое потребление памяти сервером регулируется соответствующим порогом в cgroups.

Чтобы отключить наблюдатель cgroup, установите это значение в `0`.

см. настройки:
- [`cgroup_memory_watcher_hard_limit_ratio`](#cgroup_memory_watcher_hard_limit_ratio)
- [`cgroup_memory_watcher_soft_limit_ratio`](#cgroup_memory_watcher_soft_limit_ratio).

Тип: `UInt64`

По умолчанию: `15`
## cgroup_memory_watcher_hard_limit_ratio {#cgroup_memory_watcher_hard_limit_ratio}

Указывает "жёсткий" порог объёма потребляемой памяти процессом сервера в соответствии с cgroups, после которого максимальное потребление памяти сервером регулируется до порогового значения.

См. настройки:
- [`cgroups_memory_usage_observer_wait_time`](#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_soft_limit_ratio`](#cgroup_memory_watcher_soft_limit_ratio)

Тип: `Double`

По умолчанию: `0.95`
## cgroup_memory_watcher_soft_limit_ratio {#cgroup_memory_watcher_soft_limit_ratio}

Указывает "мягкий" порог объёма потребляемой памяти процессом сервера в соответствии с cgroups, после которого арены в jemalloc очищаются.

См. настройки:
- [`cgroups_memory_usage_observer_wait_time`](#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_hard_limit_ratio`](#cgroup_memory_watcher_hard_limit_ratio)

Тип: `Double`

По умолчанию: `0.9`
## max_database_num_to_warn {#max_database_num_to_warn}

Если количество прикреплённых баз данных превышает заданное значение, сервер ClickHouse будет добавлять предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```

По умолчанию: `1000`
## max_table_num_to_warn {#max_table_num_to_warn}

Если количество прикреплённых таблиц превышает заданное значение, сервер ClickHouse будет добавлять предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```

По умолчанию: `5000`
## max_view_num_to_warn {#max_view_num_to_warn}

Если количество прикреплённых представлений превышает заданное значение, сервер ClickHouse будет добавлять предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```

Тип: `UInt64`

По умолчанию: `10000`
## max_dictionary_num_to_warn {#max_dictionary_num_to_warn}

Если количество прикреплённых словарей превышает заданное значение, сервер ClickHouse будет добавлять предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```

Тип: `UInt64`

По умолчанию: `1000`
## max_part_num_to_warn {#max_part_num_to_warn}

Если количество активных частей превышает заданное значение, сервер ClickHouse будет добавлять предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```

Тип: `UInt64`

По умолчанию: `100000`
## max_pending_mutations_to_warn {#max_pending_mutations_to_warn}

Если количество ожидающих выполнения мутаций превышает заданное значение, сервер ClickHouse будет добавлять предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_pending_mutations_to_warn>400</max_pending_mutations_to_warn>
```

Тип: `UInt64`

По умолчанию: `500`
## max_table_num_to_throw {#max_table_num_to_throw}

Если количество таблиц больше этого значения, сервер выдаст исключение.

Следующие таблицы не учитываются:
- view
- remote
- dictionary
- system

Учитываются только таблицы для движков базы данных:
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

Тип: `UInt64`

По умолчанию: `0`
## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw}

Если количество реплицированных таблиц больше этого значения, сервер выдаст исключение.

Учитываются только таблицы для движков базы данных:
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

Тип: `UInt64`

По умолчанию: `0`
## max_dictionary_num_to_throw {#max_dictionary_num_to_throw}

Если количество словарей больше этого значения, сервер выдаст исключение.

Учитываются только таблицы для движков базы данных:
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

Тип: `UInt64`

По умолчанию: `0`
## max_view_num_to_throw {#max_view_num_to_throw}

Если количество представлений больше этого значения, сервер выдаст исключение.

Учитываются только таблицы для движков базы данных:
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

Тип: `UInt64`

По умолчанию: `0`
## max\_database\_num\_to\_throw {#max-table-num-to-throw}

Если количество баз данных превышает это значение, сервер выдаст исключение.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничений.
:::

**Пример**

```xml
<max_database_num_to_throw>400</max_database_num_to_throw>
```

Тип: `UInt64`

По умолчанию: `0`
## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size}

Максимальный объём хранилища, который можно использовать для внешней агрегации, соединений или сортировки.
Запросы, превышающие этот лимит, завершатся с исключением.

:::note
Значение `0` означает отсутствие ограничений.
:::

См. также:
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

Тип: `UInt64`

По умолчанию: `0`
## max_thread_pool_free_size {#max_thread_pool_free_size}

Если количество **не занятых** потоков в Глобальном пуле потоков больше, чем [`max_thread_pool_free_size`](#max_thread_pool_free_size), ClickHouse освобождает ресурсы, занятые некоторыми потоками, и размер пула уменьшается. Потоки могут быть созданы снова, если это необходимо.

**Пример**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```

Тип: `UInt64`

По умолчанию: `0`
## max_thread_pool_size {#max_thread_pool_size}

ClickHouse использует потоки из Глобального пула потоков для обработки запросов. Если нет свободного потока для обработки запроса, то в пуле создаётся новый поток. `max_thread_pool_size` ограничивает максимальное количество потоков в пуле.

**Пример**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```

Тип: `UInt64`

По умолчанию: `10000`
## mmap_cache_size {#mmap_cache_size}

Устанавливает размер кэша (в байтах) для отображаемых файлов. Эта настройка позволяет избежать частых вызовов open/close (которые очень затратные из-за последующих ошибок страниц) и повторно использовать отображения из нескольких потоков и запросов. Значение настройки — это количество отображаемых регионов (обычно равно количеству отображаемых файлов).

Количество данных в отображаемых файлах можно отслеживать в следующих системных таблицах с помощью следующих метрик:

| Системная таблица                                                                                                                                                                                                                                                                                                                                               | Метрика                                                                                                     |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| [`system.metrics`](/operations/system-tables/metrics) и [`system.metric_log`](/operations/system-tables/metric_log)                                                                                                                                                                                                                                             | `MMappedFiles` и `MMappedFileBytes`                                                                         |
| [`system.asynchronous_metrics_log`](/operations/system-tables/asynchronous_metric_log)                                                                                                                                                                                                                                                                          | `MMapCacheCells`                                                                                            |
| [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log) | `CreatedReadBufferMMap`, `CreatedReadBufferMMapFailed`, `MMappedFileCacheHits`, `MMappedFileCacheMisses`    |

:::note
Объем данных в отображаемых файлах не потребляет напрямую память и не учитывается в использовании памяти запросом или сервером — потому что эта память может быть отброшена аналогично кэшу страниц ОС. Кэш сбрасывается (файлы закрываются) автоматически при удалении старых частей в таблицах семейства MergeTree, также он может быть сброшен вручную с помощью запроса `SYSTEM DROP MMAP CACHE`.

Эта настройка может быть изменена в процессе выполнения и вступит в силу немедленно.
:::

Тип: `UInt64`

По умолчанию: `1000`
## restore_threads {#restore_threads}

Максимальное количество потоков для выполнения запросов RESTORE.

Тип: UInt64

По умолчанию: `16`
## show_addresses_in_stack_traces {#show_addresses_in_stack_traces}

Если установлено значение true, в трассировках стека будут показаны адреса

Тип: `Bool`

По умолчанию: `1`
## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries}

Если установлено значение true, ClickHouse будет ждать завершения выполнения запросов перед завершением работы.

Тип: `Bool`

По умолчанию: `0`
## table_engines_require_grant {#table_engines_require_grant}

Если установлено значение true, пользователи требуют грант для создания таблицы с конкретным движком, например, `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию, для обеспечения обратной совместимости, создание таблицы с конкретным движком таблицы игнорирует грант, однако вы можете изменить это поведение, установив это значение в true.
:::

Тип: `Bool`

По умолчанию: `false`
## temporary_data_in_cache {#temporary_data_in_cache}

С этой опцией временные данные будут сохраняться в кэше для конкретного диска. В этом разделе вы должны указать имя диска с типом `cache`. В этом случае кэш и временные данные будут использовать одно и то же пространство, и кэш диска может быть выгружен для создания временных данных.

:::note
Только одна опция может быть использована для настройки хранения временных данных: `tmp_path` , `tmp_policy`, `temporary_data_in_cache`.
:::

**Пример**

И кэш для `local_disk`, и временные данные будут храниться в `/tiny_local_cache` на файловой системе, управляемой `tiny_local_cache`.

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

Тип: `String`

По умолчанию: ""
## thread_pool_queue_size {#thread_pool_queue_size}

Максимальное количество задач, которые могут быть запланированы на Глобальный пул потоков. Увеличение размера очереди приводит к большему использованию памяти. Рекомендуется поддерживать это значение равным [`max_thread_pool_size`](#max_thread_pool_size).

:::note
Значение `0` означает неограниченно.
:::

**Пример**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```

Тип: UInt64

По умолчанию: `10000`
## tmp_policy {#tmp_policy}

Политика для хранения временных данных. Для получения дополнительной информации см. документацию [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree).

:::note
- Только одна опция может быть использована для настройки хранения временных данных: `tmp_path` , `tmp_policy`, `temporary_data_in_cache`.
- `move_factor`, `keep_free_space_bytes`,`max_data_part_size_bytes` игнорируются.
- Политика должна иметь точно *один том* с *локальными* дисками.
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
Тип: String

По умолчанию: ""
## uncompressed_cache_policy {#uncompressed_cache_policy}

Имя политики некопрежатого кэша.

Тип: String

По умолчанию: `SLRU`
## uncompressed_cache_size {#uncompressed_cache_size}

Максимальный размер кэша (в байтах) для некопрежатых данных, используемых движками таблиц из семейства MergeTree.

Существует один общий кэш для сервера. Память выделяется по требованию. Кэш используется, если опция use_uncompressed_cache включена.

Некопрежатый кэш выгоден для очень коротких запросов в отдельных случаях.

:::note
Значение `0` означает отключено.

Эта настройка может быть изменена в процессе выполнения и вступит в силу немедленно.
:::

Тип: UInt64

По умолчанию: `0`
## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio}

Размер защищённой очереди (в случае политики SLRU) в некопрежатом кэше относительно общего размера кэша.

Тип: Double

По умолчанию: `0.5`
## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

Интервал в секундах перед перезагрузкой встроенных словарей.

ClickHouse перезагружает встроенные словари каждые x секунд. Это позволяет редактировать словари "на лету" без перезапуска сервера.

**Пример**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

Тип: UInt64

По умолчанию: `3600`
## compression {#compression}

Настройки сжатия данных для таблиц с движком [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

:::note
Рекомендуется не изменять этот параметр, если вы только начали использовать ClickHouse.
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
- `min_part_size_ratio` – Отношение размера части данных к размеру таблицы.
- `method` – Метод сжатия. Допустимые значения: `lz4`, `lz4hc`, `zstd`,`deflate_qpl`.
- `level` – Уровень сжатия. Смотрите [Кодеки](/sql-reference/statements/create/table#general-purpose-codecs).

:::note
Вы можете настроить несколько секций `<case>`.
:::

**Действия при выполнении условий**:

- Если часть данных соответствует набору условий, ClickHouse использует указанный метод сжатия.
- Если часть данных соответствует нескольким наборам условий, ClickHouse использует первый совпавший набор условий.

:::note
Если условия для части данных не выполняются, ClickHouse использует сжатие `lz4`.
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
## encryption {#encryption}

Настраивает команду для получения ключа, который будет использоваться [кодеками шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должен(-ы) быть записан(-ы) в переменные окружения или установлен(-ы) в файле конфигурации.

Ключи могут быть в шестнадцатеричном формате или строкой длиной в 16 байт.

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
Хранение ключей в файле конфигурации не рекомендуется. Это небезопасно. Вы можете переместить ключи в отдельный файл конфигурации на защищённом диске и разместить символическую ссылку на этот файл конфигурации в папке `config.d/`.
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

Каждый из этих методов можно применить для нескольких ключей:

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

Также пользователи могут добавить nonce, который должен состоять из 12 байт (по умолчанию в процессах шифрования и расшифровки используется nonce, состоящий из нулевых байт):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Или он может быть указан в шестнадцатеричном формате:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
Всё вышеперечисленное можно применить для `aes_256_gcm_siv` (но ключ должен быть длиной 32 байта).
:::
## error_log {#error_log}

По умолчанию отключено.

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
## custom_settings_prefixes {#custom_settings_prefixes}

Список префиксов для [пользовательских настроек](/operations/settings/query-level#custom_settings). Префиксы должны быть разделены запятыми.

**Пример**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**См. также**

- [Пользовательские настройки](/operations/settings/query-level#custom_settings)
## core_dump {#core_dump}

Настраивает мягкий предел для размера файла дампа ядра.

:::note
Жёсткий предел настраивается через системные средства
:::

**Пример**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```

По умолчанию: `1073741824`
## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec}

Задержка, в течение которой удалённая таблица может быть восстановлена с использованием оператора [`UNDROP`](/sql-reference/statements/undrop.md). Если `DROP TABLE` запускается с модификатором `SYNC`, настройка игнорируется.
По умолчанию для этой настройки установлено значение `480` (8 минут).

По умолчанию: `480`
## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec}

Параметр задачи, которая очищает мусор из каталога `store/`.
Если какой-то подкаталог не используется clickhouse-server и этот каталог не был изменён за последнее время
[`database_catalog_unused_dir_hide_timeout_sec`](#database_catalog_unused_dir_hide_timeout_sec) секунд, задача "скрывает" этот каталог, удаляя все права доступа. Это также работает для каталогов, которые clickhouse-server не ожидает увидеть внутри `store/`.

:::note
Значение `0` означает "немедленно".
:::

По умолчанию: `3600` (1 час)
## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec}

Параметр задачи, которая очищает мусор из каталога `store/`.
Если какой-то подкаталог не используется clickhouse-server и он был ранее "скрыт"
(см. [database_catalog_unused_dir_hide_timeout_sec](#database_catalog_unused_dir_hide_timeout_sec))
и этот каталог не был изменён за последнее время
[`database_catalog_unused_dir_rm_timeout_sec`](#database_catalog_unused_dir_rm_timeout_sec) секунд, задача удаляет этот каталог.
Это также работает для каталогов, которые clickhouse-server не ожидает увидеть внутри `store/`.

:::note
Значение `0` означает "никогда". Значение по умолчанию соответствует 30 дням.
:::

По умолчанию: `2592000` (30 дней).
## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec}

В случае неудачного удаления таблицы ClickHouse подождёт это время перед повторной попыткой операции.

Тип: [`UInt64`](../../sql-reference/data-types/int-uint.md)

По умолчанию: `5`
## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency}

Размер пула потоков, используемого для удаления таблиц.

Тип: [`UInt64`](../../sql-reference/data-types/int-uint.md)

По умолчанию: `16`
## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec}

Параметр задачи, которая очищает мусор из каталога `store/`.
Устанавливает период планирования задачи.

:::note
Значение `0` означает "никогда". Значение по умолчанию соответствует 1 дню.
:::

По умолчанию: `86400` (1 день).
## default_profile {#default_profile}

Профиль настроек по умолчанию. Профили настроек находятся в файле, указанном в настройке `user_config`.

**Пример**

```xml
<default_profile>default</default_profile>
```
## default_replica_path {#default_replica_path}

Путь к таблице в ZooKeeper.

**Пример**

```xml
<default_replica_path>/clickhouse/tables/{uuid}/{shard}</default_replica_path>
```
## default_replica_name {#default_replica_name}

Имя реплики в ZooKeeper.

**Пример**

```xml
<default_replica_name>{replica}</default_replica_name>
```
## dictionaries_config {#dictionaries_config}

Путь к файлу конфигурации для словарей.

Путь:

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать символы подстановки \* и ?.

См. также:
- "[Словари](../../sql-reference/dictionaries/index.md)".

**Пример**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## user_defined_executable_functions_config {#user_defined_executable_functions_config}

Путь к файлу конфигурации для исполняемых пользовательских функций.

Путь:

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать символы подстановки \* и ?.

См. также:
- "[Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions).".

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## dictionaries_lazy_load {#dictionaries_lazy_load}

Ленивая загрузка словарей.

- Если `true`, то каждый словарь загружается при первом использовании. Если загрузка завершилась неудачно, функция, использовавшая словарь, генерирует исключение.
- Если `false`, то сервер загружает все словари при запуске.

:::note
Сервер будет ждать при запуске, пока все словари не завершат свою загрузку, прежде чем принимать какие-либо подключения
(исключение: если [`wait_dictionaries_load_at_startup`](#wait_dictionaries_load_at_startup) установлено в `false`).
:::

**Пример**

```xml
<dictionaries_lazy_load>true</dictionaries_lazy_load>
```
## format_schema_path {#format_schema_path}

Путь к директории со схемами для входных данных, таких как схемы для формата [CapnProto](../../interfaces/formats.md#capnproto).

**Пример**

```xml
<!-- Директория, содержащая файлы схем для различных входных форматов. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## graphite {#graphite}

Отправка данных в [Graphite](https://github.com/graphite-project).

Настройки:

- `host` – Сервер Graphite.
- `port` – Порт на сервере Graphite.
- `interval` – Интервал отправки в секундах.
- `timeout` – Тайм-аут отправки данных в секундах.
- `root_path` – Префикс для ключей.
- `metrics` – Отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Отправка изменений данных за временной период из таблицы [system.events](/operations/system-tables/events).
- `events_cumulative` – Отправка накопленных данных из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Отправка данных из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Вы можете настроить несколько блоков `<graphite>`. Например, вы можете использовать это для отправки различных данных с разными интервалами.

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

Настройки для разрежения данных для Graphite.

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
## google_protos_path {#google_protos_path}

Определяет директорию, содержащую proto-файлы для типов Protobuf.

Пример:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## http_handlers {#http_handlers}

Позволяет использовать настраиваемые HTTP обработчики.
Чтобы добавить новый HTTP обработчик, просто добавьте новое `<rule>`.
Правила проверяются сверху вниз в порядке, в котором они определены,
и первый совпавший обработчик будет выполнен.

Следующие настройки могут быть сконфигурированы через подтеги:

| Подтеги               | Определение                                                                                                                                                                      |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                  | Для сопоставления URL запроса, вы можете использовать префикс 'regex:' для замены регулярного выражения (необязательно)                                                           |
| `methods`              | Для сопоставления методов запроса, вы можете использовать запятые для разделения нескольких совпадений методов (необязательно)                                                     |
| `headers`              | Для сопоставления заголовков запроса, сопоставьте каждый дочерний элемент (имя дочернего элемента - это имя заголовка), вы можете использовать префикс 'regex:' для замены регулярного выражения (необязательно) |
| `handler`              | Обработчик запроса                                                                                                                 |
| `empty_query_string`   | Проверьте, что в URL-адресе отсутствует строка запроса                                                                                  |

`handler` содержит следующие настройки, которые могут быть сконфигурированы через подтеги:

| Подтеги             | Определение                                                                                                                                                        |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | Место для перенаправления                                                                                                                                           |
| `type`               | Поддерживаемые типы: static, dynamic_query_handler, predefined_query_handler, redirect                                                                              |
| `status`             | Используйте с типом static, код состояния ответа                                                                                                                     |
| `query_param_name`   | Используйте с типом dynamic_query_handler, извлекает и выполняет значение, соответствующее `<query_param_name>` в параметрах HTTP запроса                              |
| `query`              | Используйте с типом predefined_query_handler, выполняет запрос при вызове обработчика                                                                                 |
| `content_type`       | Используйте с типом static, тип содержимого ответа                                                                                                                   |
| `response_content`   | Используйте с типом static, содержимое ответа, отправляемое клиенту, при использовании префикса 'file://' или 'config://', находите содержимое из файла или конфигурации, отправляемое клиенту |

Вместе с списком правил вы можете указать `<defaults/>`, который указывает на включение всех обработчиков по умолчанию.

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
## http_port/https_port {#http_porthttps_port}

Порт для подключения к серверу через HTTP(s).

- Если указан `https_port`, должна быть настроена [OpenSSL](#openssl).
- Если указан `http_port`, конфигурация OpenSSL игнорируется даже если она установлена.

**Пример**

```xml
<https_port>9999</https_port>
```
## http_server_default_response {#http_server_default_response}

Страница, которая отображается по умолчанию при доступе к HTTP(s) серверу ClickHouse.
Значение по умолчанию: "Ok." (с переводом строки в конце).

**Пример**

Открывается `https://tabix.io/`, когда вы обращаетесь к `http://localhost: http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## http_options_response {#http_options_response}

Используется для добавления заголовков к ответу на HTTP-запрос `OPTIONS`.
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
## hsts_max_age {#hsts_max_age}

Время истечения срока действия HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. Если вы указываете положительное число, HSTS будет включён и максимальный возраст будет равен указанному вами числу.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## mlock_executable {#mlock_executable}

Выполните `mlockall` после запуска, чтобы уменьшить задержку первых запросов и предотвратить выгрузку исполняемого файла clickhouse под высокой нагрузкой на ввод-вывод.

:::note
Включение этой опции рекомендуется, но приведёт к увеличению времени запуска на несколько секунд. Учтите, что эта настройка не будет работать без прав доступа "CAP_IPC_LOCK".
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```
## include_from {#include_from}

Путь к файлу с подстановками. Поддерживаются форматы XML и YAML.

Для получения дополнительной информации, см. раздел "[Файлы конфигурации](/operations/configuration-files)".

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## interserver_listen_host {#interserver_listen_host}

Ограничение на хосты, которые могут обмениваться данными между серверами ClickHouse.
Если используется Keeper, такое же ограничение будет применено к связи между различными экземплярами Keeper.

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
## interserver_http_port {#interserver_http_port}

Порт для обмена данными между серверами ClickHouse.

**Пример**

```xml
<interserver_http_port>9009</interserver_http_port>
```
## interserver_http_host {#interserver_http_host}

Имя хоста, которое может быть использовано другими серверами для доступа к этому серверу.

Если не указано, оно определяется аналогично команде `hostname -f`.

Полезно для отвязки от конкретного сетевого интерфейса.

**Пример**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_https_port {#interserver_https_port}

Порт для обмена данными между серверами ClickHouse через `HTTPS`.

**Пример**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_https_host {#interserver_https_host}

Аналогично [`interserver_http_host`](#interserver_http_host), за исключением того, что это имя хоста может быть использовано другими серверами для доступа к этому серверу через `HTTPS`.

**Пример**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_http_credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам в процессе [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики, используя эти учетные данные.
`interserver_http_credentials` должны быть одинаковыми для всех реплик в кластере.

:::note
- По умолчанию, если секция `interserver_http_credentials` опущена, аутентификация при репликации не используется.
- Настройки `interserver_http_credentials` не относятся к учетным данным клиента ClickHouse [configuration](../../interfaces/cli.md#configuration_files).
- Эти учетные данные общие для репликации через `HTTP` и `HTTPS`.
:::

Следующие настройки могут быть сконфигурированы с помощью под-тегов:

- `user` — Имя пользователя.
- `password` — Пароль.
- `allow_empty` — Если `true`, то другим репликам разрешено подключаться без аутентификации, даже если учетные данные установлены. Если `false`, то подключения без аутентификации отвергаются. По умолчанию: `false`.
- `old` — Содержит старые `user` и `password`, используемые во время ротации учетных данных. Может быть указано несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию межсерверных учетных данных без остановки всех реплик одновременно для обновления их конфигурации. Учетные данные можно изменить в несколько шагов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволяет подключаться с аутентификацией и без нее.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите `allow_empty` в `false` или удалите эту настройку. Это делает аутентификацию с новыми учетными данными обязательной.

Для изменения существующих учетных данных переместите имя пользователя и пароль в секцию `interserver_http_credentials.old` и обновите `user` и `password` на новые значения. На этом этапе сервер использует новые учетные данные для подключения к другим репликам и принимает подключения как с новыми, так и со старыми учетными данными.

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

## keep_alive_timeout {#keep_alive_timeout}

Количество секунд, в течение которых ClickHouse ожидает входящих запросов по протоколу HTTP перед закрытием соединения.

**Пример**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```

## max_keep_alive_requests {#max_keep_alive_requests}

Максимальное количество запросов через одно соединение с поддержкой keep-alive, после чего оно будет закрыто сервером ClickHouse.

**Пример**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```

## ldap_servers {#ldap_servers}

Список серверов LDAP с их параметрами подключения здесь для:
- использования их в качестве аутентификаторов для локальных пользователей, у которых аутентификационный механизм 'ldap' указан вместо 'password'
- использования их как удалённые пользовательские директории.

Следующие настройки могут быть сконфигурированы с помощью под-тегов:

| Настройка                     | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | Имя хоста или IP адрес сервера LDAP, этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                                                                                                                                |
| `port`                         | Порт сервера LDAP, по умолчанию 636, если `enable_tls` установлен в true, `389` в противном случае.                                                                                                                                                                                                                                                                                                                                                  |
| `bind_dn`                      | Шаблон, используемый для построения DN для привязки. Результирующий DN будет построен заменой всех подстрок `\{user_name\}` шаблона на фактическое имя пользователя во время каждой попытки аутентификации.                                                                                                                                                                                                                                           |
| `user_dn_detection`            | Секция с параметрами поиска LDAP для обнаружения фактического DN пользователя привязанного пользователя. Это в основном используется в фильтрах поиска для дальнейшего сопоставления роли, когда сервер является Active Directory. Результирующий DN пользователя будет использоваться при замене подстрок `\{user_dn\}` там, где это разрешено. По умолчанию DN пользователя задана равной bind DN, но как только выполняется поиск, он будет обновлен на фактически обнаруженное значение DN пользователя. |
| `verification_cooldown`        | Период времени в секундах после успешной попытки привязки, в течение которого пользователь считается успешно аутентифицированным для всех последующих запросов без обращения к серверу LDAP. Укажите `0` (по умолчанию), чтобы отключить кэширование и принудить обращаться к серверу LDAP для каждого запроса аутентификации.                                                                                                                                                          |
| `enable_tls`                   | Флаг для включения использования защищенного соединения с сервером LDAP. Укажите `no` для протокола в открытом тексте (`ldap://`) (не рекомендуется). Укажите `yes` для LDAP по протоколу SSL/TLS (`ldaps://`) (рекомендуется, по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (открытый текст (`ldap://`) протокол, обновленный до TLS).                                                                                                                                               |
| `tls_minimum_protocol_version` | Минимальная версия протокола SSL/TLS. Принимаемые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (по умолчанию).                                                                                                                                                                                                                                                                                                                             |
| `tls_require_cert`             | Поведение проверки сертификата SSL/TLS партнера. Принимаемые значения: `never`, `allow`, `try`, `demand` (по умолчанию).                                                                                                                                                                                                                                                                                                                             |
| `tls_cert_file`                | путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `tls_key_file`                 | путь к ключевому файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `tls_ca_cert_file`             | путь к файлу сертификата CA.                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_ca_cert_dir`              | путь к директории, содержащей сертификаты CA.                                                                                                                                                                                                                                                                                                                                                                                                       |
| `tls_cipher_suite`             | разрешённый набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                                                                                                       |

Настройка `user_dn_detection` может быть сконфигурирована с под-тегами:

| Настройка     | Описание                                                                                                                                                                                                                                                                                                                                    |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`     | шаблон, используемый для построения базового DN для поиска LDAP. Результирующий DN будет построен заменой всех подстрок `\{user_name\}` и '\{bind_dn\}' шаблона на фактическое имя пользователя и bind DN во время поиска LDAP.                                                                                                           |
| `scope`       | область поиска LDAP. Приемлемые значения: `base`, `one_level`, `children`, `subtree` (по умолчанию).                                                                                                                                                                                                                                       |
| `search_filter` | Шаблон, используемый для построения фильтра поиска для поиска LDAP. Результирующий фильтр будет построен заменой всех подстрок `\{user_name\}`, `\{bind_dn\}`, и `\{base_dn\}` шаблона на фактическое имя пользователя, bind DN и base DN во время поиска LDAP. Обратите внимание, что специальные символы должны быть правильно экранированы в XML.  |

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

Пример (типичный Active Directory с настроенным обнаружением DN пользователя для дальнейшего сопоставления роли):

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

## listen_host {#listen_host}

Ограничение на хосты, с которых могут поступать запросы. Если вы хотите, чтобы сервер отвечал на запросы из всех из них, укажите `::`.

Примеры:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```

## listen_try {#listen_try}

Сервер не выйдет из строя, если сети IPv6 или IPv4 недоступны при попытке прослушивания.

**Пример**

```xml
<listen_try>0</listen_try>
```

## listen_reuse_port {#listen_reuse_port}

Позволяет нескольким серверам прослушивать один и тот же адрес:порт. Запросы будут маршрутизированы к случайному серверу операционной системой. Включение этой настройки не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

По умолчанию:

## listen_backlog {#listen_backlog}

Backlog (размер очереди ожидающих подключений) сокета прослушивания. Значение по умолчанию `4096` такое же, как и в linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не нужно изменять, так как:
- Значение по умолчанию достаточно велико,
- Для приёма подключения клиента сервером используется отдельный поток.

Таким образом, даже если `TcpExtListenOverflows` (из `nstat`) имеет ненулевое значение и этот счётчик растёт для сервера ClickHouse, это не означает, что значение необходимо увеличивать, так как:
- Обычно, если `4096` недостаточно, это говорит о некоторой внутренней проблеме с масштабированием ClickHouse и лучше сообщить об этом.
- Это не означает, что сервер сможет обработать больше подключений позже (и даже если он сможет, к тому моменту клиенты могут исчезнуть или быть отключены).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```

## logger {#logger}

Расположение и формат лог-сообщений.

**Ключи**:

| Ключ                       | Описание                                                                                                                                                                         |
|----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                    | Уровень логирования. Допустимые значения: `none` (отключить логирование), `fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test`.             |
| `log`                      | Путь к лог-файлу.                                                                                                                                                                |
| `errorlog`                 | Путь к файлу с логом ошибок.                                                                                                                                                     |
| `size`                     | Политика ротации: Максимальный размер лог-файлов в байтах. Как только размер лог-файла превышает этот порог, он переименовывается и архивируется, и создаётся новый лог-файл.    |
| `count`                    | Политика ротации: Сколько исторических лог-файлов ClickHouse сохраняет в наибольшем количестве.                                                                                 |
| `stream_compress`          | Сжимать лог-сообщения с помощью LZ4. Установите `1` или `true` для включения.                                                                                                    |
| `console`                  | Не записывать лог-сообщения в лог-файлы, вместо этого выводить их в консоль. Установите `1` или `true` для включения. По умолчанию `1`, если ClickHouse не запускается в режиме демона, иначе `0`. |
| `console_log_level`        | Уровень логирования для консольного вывода. По умолчанию равен `level`.                                                                                                                                  |
| `formatting`               | Формат логов для консольного вывода. В настоящее время поддерживается только `json`.                                                                                             |
| `use_syslog`               | Дополнительно направлять вывод логов в syslog.                                                                                                                                   |
| `syslog_level`             | Уровень логирования для записи в syslog.                                                                                                                                         |

**Спецификаторы формата логов**

Имена файлов в путях `log` и `errorLog` поддерживают приведенные ниже спецификаторы формата для результирующего имени файла (часть пути с директориями их не поддерживает).

Колонка "Пример" показывает вывод для даты и времени `2023-07-06 18:32:07`.

| Спецификатор | Описание                                                                                                         | Пример                    |
|--------------|------------------------------------------------------------------------------------------------------------------|---------------------------|
| `%%`         | Символ `%`                                                                                                       | `%`                       |
| `%n`         | Перевод строки                                                                                                   |                           |
| `%t`         | Горизонтальная табуляция                                                                                        |                           |
| `%Y`         | Год в виде десятичного числа, например, 2017                                                                     | `2023`                    |
| `%y`         | Последние 2 цифры года в виде десятичного числа (диапазон [00,99])                                               | `23`                      |
| `%C`         | Первые 2 цифры года в виде десятичного числа (диапазон [00,99])                                                  | `20`                      |
| `%G`         | Четырёхзначный год [ISO 8601 на основе недели](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, содержащий указанную неделю. Полезен только с `%V`  | `2023`       |
| `%g`         | Последние 2 цифры [ISO 8601 на основе недели](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, содержащий указанную неделю.             | `23`         |
| `%b`         | Аббревиатура названия месяца, например, Oct (зависит от локали)                                                  | `Jul`                     |
| `%h`         | Синоним %b                                                                                                       | `Jul`                     |
| `%B`         | Полное название месяца, например, October (зависит от локали)                                                    | `July`                    |
| `%m`         | Месяц в виде десятичного числа (диапазон [01,12])                                                                | `07`                      |
| `%U`         | Неделя года в виде десятичного числа (воскресенье — первый день недели) (диапазон [00,53])                       | `27`                      |
| `%W`         | Неделя года в виде десятичного числа (понедельник — первый день недели) (диапазон [00,53])                       | `27`                      |
| `%V`         | ISO 8601 номер недели (диапазон [01,53])                                                                         | `27`                      |
| `%j`         | День года в виде десятичного числа (диапазон [001,366])                                                          | `187`                     |
| `%d`         | День месяца в виде десятичного числа с наполнением нулями (диапазон [01,31]). Однозначное число предшествует нулю. | `06`                      |
| `%e`         | День месяца в виде десятичного числа с наполнением пробелами (диапазон [1,31]). Однозначное число предшествует пробелу. | `&nbsp; 6`             |
| `%a`         | Аббревиатура названия дня недели, например, Fri (зависит от локали)                                              | `Thu`                     |
| `%A`         | Полное название дня недели, например, Friday (зависит от локали)                                                 | `Thursday`                |
| `%w`         | День недели в виде целого числа с воскресеньем в качестве 0 (диапазон [0-6])                                     | `4`                       |
| `%u`         | День недели в виде десятичного числа, где понедельник равен 1 (формат ISO 8601) (диапазон [1-7])                 | `4`                       |
| `%H`         | Час в виде десятичного числа, 24-часовой формат (диапазон [00-23])                                              | `18`                      |
| `%I`         | Час в виде десятичного числа, 12-часовой формат (диапазон [01,12])                                              | `06`                      |
| `%M`         | Минута в виде десятичного числа (диапазон [00,59])                                                               | `32`                      |
| `%S`         | Секунда в виде десятичного числа (диапазон [00,60])                                                              | `07`                      |
| `%c`         | Стандартная строка даты и времени, например, Sun Oct 17 04:41:13 2010 (зависит от локали)                        | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованная дата (зависит от локали)                                                                         | `07/06/23`                |
| `%X`         | Локализованное время, например, 18:40:20 или 6:40:20 PM (зависит от локали)                                      | `18:32:07`                |
| `%D`         | Краткая дата MM/DD/YY, эквивалент %m/%d/%y                                                                       | `07/06/23`                |
| `%F`         | Краткая дата YYYY-MM-DD, эквивалент %Y-%m-%d                                                                     | `2023-07-06`              |
| `%r`         | Локализованное время в 12-часовом формате (зависит от локали)                                                    | `06:32:07 PM`             |
| `%R`         | Эквивалент "%H:%M"                                                                                               | `18:32`                   |
| `%T`         | Эквивалент "%H:%M:%S" (формат времени ISO 8601)                                                                  | `18:32:07`                |
| `%p`         | Локализованное обозначение a.m. или p.m. (зависит от локали)                                                     | `PM`                      |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430) или никаких символов, если информация о временной зоне недоступна | `+0800`               |
| `%Z`         | Зависящее от локали имя или аббревиатура временной зоны, или никаких символов, если информация о временной зоне недоступна     | `Z AWST `                  |

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

**Переопределение уровней**

Уровень логирования отдельных лог-имен может быть переопределен. Например, чтобы отключить все сообщения логеров "Backup" и "RBAC".

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

| Ключ        | Описание                                                                                                                                                                                                                                                    |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`  | Адрес syslog в формате `host\[:port\]`. Если не указан, используется локальный демон.                                                                                                                                                                         |
| `hostname` | Имя хоста, с которого отправляются логи (необязательно).                                                                                                                                                                                                      |
| `facility` | Ключевое слово [фасилити](https://en.wikipedia.org/wiki/Syslog#Facility) syslog. Должно быть указано в верхнем регистре с префиксом "LOG_", например, `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т.д. По умолчанию: `LOG_USER`, если `address` указан, `LOG_DAEMON` в противном случае.                                           |
| `format`   | Формат сообщения лога. Возможные значения: `bsd` и `syslog.`                                                                                                                                                                                                       |

**Форматы логов**

Вы можете указать формат логов, который будет выводиться в консольный лог. В настоящее время поддерживается только JSON.

**Пример**

Вот пример вывода лога в формате JSON:

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

**Переименование ключей для логов в формате JSON**

Имена ключей можно изменить, изменив значения тегов внутри тега `<names>`. Например, чтобы изменить `DATE_TIME` на `MY_DATE_TIME`, используйте `<date_time>MY_DATE_TIME</date_time>`.

**Опускание ключей для логов в формате JSON**

Свойства журнала можно опустить, закомментировав свойство. Например, если вы не хотите, чтобы в вашем логе печатался `query_id`, вы можете закомментировать тег `<query_id>`.
## send_crash_reports {#send_crash_reports}

Настройки для отправки сведений о сбоях по желанию пользователя команде разработчиков ядра ClickHouse через [Sentry](https://sentry.io).

Включение этой функции особенно приветствуется в тестовых (pre-production) средах.

Сервер должен иметь доступ к публичному интернету через IPv4 (на момент написания Sentry не поддерживает IPv6), чтобы эта функция работала корректно.

Ключи:

| Ключ                   | Описание                                                                                                                                                                                            |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`              | Логический флаг для включения данной функции, по умолчанию `false`. Установите `true`, чтобы разрешить отправку отчетов о сбоях.                                                                    |
| `send_logical_errors`  | `LOGICAL_ERROR` похож на `assert`, это ошибка в ClickHouse. Этот логический флаг позволяет отправлять такие исключения в Sentry (по умолчанию: `false`).                                            |
| `endpoint`             | Вы можете переопределить URL-адрес конечной точки Sentry для отправки отчетов о сбоях. Это может быть как отдельная учетная запись Sentry, так и ваша собственная локально размещённая инстанция Sentry. Используйте [Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=native#configure-the-sdk) синтаксис.                                                                                                            |
| `anonymize`            | Избегайте прикрепления имени хоста сервера к отчету о сбоях.                                                                                                                                        |
| `http_proxy`           | Настройка HTTP-прокси для отправки отчетов о сбоях.                                                                                                                                                 |
| `debug`                | Устанавливает клиент Sentry в режим отладки.                                                                                                                                                        |
| `tmp_path`             | Файловая система для временного состояния отчетов о сбоях.                                                                                                                                          |
| `environment`          | Произвольное имя среды, в которой работает сервер ClickHouse. Оно будет упомянуто в каждом отчете о сбоях. Значение по умолчанию - `test` или `prod` в зависимости от версии ClickHouse.                |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## ssh_server {#ssh_server}

Публичная часть ключа хоста будет записана в файл known_hosts на стороне SSH-клиента при первом подключении.

Конфигурации ключей хоста неактивны по умолчанию.
Раскомментируйте конфигурации ключей хоста и укажите путь к соответствующему SSH-ключу, чтобы активировать их:

Пример:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## tcp_ssh_port {#tcp_ssh_port}

Порт для SSH-сервера, который позволяет пользователю подключаться и выполнять запросы интерактивно, используя встроенного клиента через PTY.

Пример:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## storage_configuration {#storage_configuration}

Позволяет настроить много-дисковую конфигурацию хранилища.

Конфигурация хранилища следует структуре:

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

| Настройка                | Описание                                                                                                    |
|--------------------------|-------------------------------------------------------------------------------------------------------------|
| `<disk_name_N>`          | Имя диска, которое должно быть уникальным.                                                                  |
| `path`                   | Путь, в который будут сохранены данные сервера (`data` и `shadow` каталоги). Должен заканчиваться `/`       |
| `keep_free_space_bytes`  | Размер зарезервированного свободного пространства на диске.                                                 |

:::note
Порядок дисков не имеет значения.
:::
### Configuration of policies {#configuration-of-policies}

Подтеги выше определяют следующие настройки для `policies`:

| Настройка                     | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`               | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `volume_name_N`               | Имя тома. Имена томов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `disk`                        | Диск, расположенный внутри тома.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `max_data_part_size_bytes`    | Максимальный размер части данных, которая может находиться на любом из дисков в этом томе. Если при слиянии размер части ожидается больше, чем max_data_part_size_bytes, часть будет записана в следующий том. По сути, эта функция позволяет хранить новые / небольшие части на горячем (SSD) томе и перемещать их на холодный (HDD) том, когда они достигают большого размера. Не используйте эту опцию, если у политики только один том.                                           |
| `move_factor`                 | Доля доступного свободного пространства на томе. Если пространства становится меньше, данные начнут переноситься на следующий том, если он есть. Для переноса части упорядочиваются по размеру от большего к меньшему (по убыванию), и выбираются части, общий размер которых достаточен для выполнения условия `move_factor`, если общий размер всех частей недостаточен, все части будут перемещены.                                                            |
| `perform_ttl_move_on_insert`  | Отключает перемещение данных с истёкшим TTL при вставке. По умолчанию (если включено), если мы вставляем часть данных, чей срок действия уже истек по правилу перемещения, она сразу перемещается в том / на диск, указанный в правиле перемещения. Это может значительно замедлить вставку в случае, если целевой том / диск медленный (например, S3). Если отключено, просроченная часть данных записывается в том по умолчанию и затем немедленно перемещается в том, указанный в правиле для истёкшего TTL. |
| `load_balancing`              | Политика балансировки дисков, `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                    |
| `least_used_ttl_ms`           | Устанавливает время ожидания (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - всегда обновлять, `-1` - никогда не обновлять, значение по умолчанию - `60000`). Учтите, если диск используется только ClickHouse и не подвергается изменению файловой системы на лету, вы можете использовать значение `-1`. В остальных случаях это не рекомендуется, так как со временем это приведет к некорректному распределению пространства.                       |
| `prefer_not_to_merge`         | Отключает слияние частей данных на этом томе. Примечание: это потенциально опасно и может вызвать замедление. Когда эта настройка включена (не делайте этого), объединение данных на этом томе запрещено (что плохо). Это позволяет контролировать, как ClickHouse взаимодействует с медленными дисками. Мы не рекомендуем использовать это вообще.                                                                                                                                                      |
| `volume_priority`             | Определяет приоритет (порядок), в котором заполняются тома. Чем меньше значение, тем выше приоритет. Значения параметров должны быть натуральными числами и охватывать диапазон от 1 до N (N - наибольшее указанное значение параметра) без пропусков.                                                                                                                                                                                                                                      |

Для `volume_priority`:
- Если у всех томов есть этот параметр, они приоритизируются в указанном порядке.
- Если только _у некоторых_ томов он есть, тома, у которых его нет, имеют низший приоритет. Те, у кого он есть, приоритизируются в соответствии со значением тега, приоритет остальных определяется порядком описания в конфигурационном файле относительно друг друга.
- Если _ни у одного_ из томов нет этого параметра, их порядок определяется порядком описания в конфигурационном файле.
- Приоритет томов не может быть идентичным.
## macros {#macros}

Замены параметров для реплицируемых таблиц.

Можно опустить, если реплицируемые таблицы не используются.

Для получения дополнительной информации см. раздел [Создание реплицируемых таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```
## replica_group_name {#replica_group_name}

Имя группы реплик для базы данных Replicated.

Кластер, созданный базой данных Replicated, будет состоять из реплик в одной группе.
DDL-запросы будут ожидать только реплики в одной группе.

По умолчанию - пусто.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```

Тип: String

По умолчанию: ""
## remap_executable {#remap_executable}

Настройка для перераспределения памяти для машинного кода ("text") с использованием больших страниц.

По умолчанию: `false`

:::note
Эта функция является экспериментальной.
:::

Пример:

```xml
<remap_executable>false</remap_executable>
```
## max_open_files {#max_open_files}

Максимальное количество открытых файлов.

:::note
Мы рекомендуем использовать этот параметр в macOS, так как функция `getrlimit()` возвращает некорректное значение.
:::

**Пример**

```xml
<max_open_files>262144</max_open_files>
```
## max_session_timeout {#max_session_timeout}

Максимальное время ожидания сессии в секундах.

По умолчанию: `3600`

Пример:

```xml
<max_session_timeout>3600</max_session_timeout>
```
## max_table_size_to_drop {#max_table_size_to_drop}

Ограничение на удаление таблиц.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает `max_table_size_to_drop` (в байтах), её нельзя удалить с помощью запроса [`DROP`](../../sql-reference/statements/drop.md) или запроса [`TRUNCATE`](../../sql-reference/statements/truncate.md).

:::note
Значение `0` означает, что можно удалить все таблицы без каких-либо ограничений.

Для применения этой настройки не требуется перезапуск сервера ClickHouse. Другой способ отключить ограничение - создать файл `<clickhouse-path>/flags/force_drop_table`.
:::

**Пример**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```

По умолчанию: 50 ГБ.
## background_pool_size {#background_pool_size}

Устанавливает количество потоков, выполняющих фоновое слияние и мутации для таблиц с движками MergeTree.

:::note
- Эта настройка также может быть применена при запуске сервера из конфигурации профиля `default` для обратной совместимости при запуске сервера ClickHouse.
- Вы можете увеличить количество потоков в режиме реального времени.
- Чтобы уменьшить количество потоков, вам нужно перезапустить сервер.
- Настраивая эту настройку, вы управляете нагрузкой на процессор и диск.
:::

:::danger
Меньший размер пула требует меньше ресурсов CPU и диска, но фоновые процессы продвигаются медленнее, что может произойти на производительности запросов.
:::

Перед изменением этой настройки также ознакомьтесь со связанными настройками MergeTree, такими как:
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number-of-free-entries-in-pool-to-lower-max-size-of-merge).
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number-of-free-entries-in-pool-to-execute-mutation).

**Пример**

```xml
<background_pool_size>16</background_pool_size>
```

Тип:

По умолчанию: 16.
## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit}

Устанавливает ограничение на то, сколько оперативной памяти разрешено использовать для выполнения операций слияния и мутаций.
Если ClickHouse достигнет установленного лимита, он не будет запускать новые фоновые операции слияния или мутации, но продолжит выполнение уже запланированных задач.

:::note
Значение `0` означает отсутствие ограничений.
:::

**Пример**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```
## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio}

Значение по умолчанию для `merges_mutations_memory_usage_soft_limit` рассчитывается как `memory_amount * merges_mutations_memory_usage_to_ram_ratio`.

**См. также:**

- [max_memory_usage](../../operations/settings/query-complexity.md#settings_max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](#merges_mutations_memory_usage_soft_limit)

По умолчанию: `0.5`.
## async_load_databases {#async_load_databases}

Асинхронная загрузка баз данных и таблиц.

- Если `true`, все не системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружены асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к таблице, которая ещё не загружена, будет ожидать инициализации именно этой таблицы. Если загрузка неудачна, запрос вызовет ошибку (вместо отключения всего сервера в случае `async_load_databases = false`). Таблица, которая ожидается хотя бы одним запросом, будет загружена с более высоким приоритетом. DDL-запросы на базе данных будут ожидать инициализации именно этой базы данных. Также учитывайте установку лимита `max_waiting_queries` на общее количество ожидающих запросов.
- Если `false`, все базы данных загружаются при запуске сервера.

**Пример**

```xml
<async_load_databases>true</async_load_databases>
```

По умолчанию: `false`.
## async_load_system_database {#async_load_system_database}

Асинхронная загрузка системных таблиц. Полезно, если в базе данных `system` имеется большое количество таблиц и частей. Независимо от настройки `async_load_databases`.

- Если установлено в `true`, все системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружены асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к системной таблице, которая ещё не загружена, будет ожидать инициализации именно этой таблицы. Таблица, которая ожидается хотя бы одним запросом, будет загружена с более высоким приоритетом. Также учитывайте установку ограничения `max_waiting_queries` для общего количества ожидающих запросов.
- Если установлено в `false`, системная база данных загружается до старта сервера.

**Пример**

```xml
<async_load_system_database>true</async_load_system_database>
```

По умолчанию: `false`.
## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size}

Устанавливает количество потоков, выполняющих задания загрузки в переднем пуле. Передний пул используется для синхронной загрузки таблицы перед началом прослушивания сервером на порту и для загрузки таблиц, которые ожидаются. Передний пул имеет более высокий приоритет, чем задний пул. Это означает, что никакое задание не запускается в заднем пуле, пока в переднем пуле выполняются задания.

:::note
Значение `0` означает, что будут использованы все доступные процессоры.
:::

По умолчанию: `0`
## tables_loader_background_pool_size {#tables_loader_background_pool_size}

Устанавливает количество потоков, выполняющих асинхронные задачи загрузки в заднем пуле. Задний пул используется для асинхронной загрузки таблиц после старта сервера в случае отсутствия ожидающих запросов для таблицы. Это может быть полезно для поддержания малого количества потоков в заднем пуле, если имеется много таблиц. Это освободит ресурсы CPU для выполнения конкурентных запросов.

:::note
Значение `0` означает, что будут использованы все доступные процессоры.
:::

По умолчанию: `0`
## merge_tree {#merge_tree}

Тонкая настройка для таблиц в [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Для получения дополнительной информации см. заголовочный файл MergeTreeSettings.h.

**Пример**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## metric_log {#metric_log}

Эта функция отключена по умолчанию.

**Включение**

Чтобы вручную включить сбор данных истории метрик [`system.metric_log`](../../operations/system-tables/metric_log.md), создайте файл `/etc/clickhouse-server/config.d/metric_log.xml` со следующим содержимым:

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

<SystemLogParameters/>
## latency_log {#latency_log}

Эта функция отключена по умолчанию.

**Включение**

Чтобы вручную включить сбор данных истории задержек [`system.latency_log`](../../operations/system-tables/latency_log.md), создайте файл `/etc/clickhouse-server/config.d/latency_log.xml` со следующим содержимым:

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
## replicated_merge_tree {#replicated_merge_tree}

Тонкая настройка для таблиц в [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Эта настройка имеет более высокий приоритет.

Для получения дополнительной информации см. заголовочный файл MergeTreeSettings.h.

**Пример**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
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
## openSSL {#openssl}

Настройка клиента/сервера SSL.

Поддержка SSL предоставляется библиотекой `libpoco`. Доступные параметры настройки объясняются в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи для настроек сервера/клиента:

| Опция                        | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Значение по умолчанию                      |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`             | Путь к файлу с секретным ключом сертификата PEM. Файл может содержать как ключ, так и сертификат одновременно.                                                                                                                                                                                                                                                                                                                                                             |                                            |
| `certificateFile`            | Путь к файлу клиентского/серверного сертификата в формате PEM. Можно пропустить, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                                               |                                            |
| `caConfig`                   | Путь к файлу или директории, содержащей доверенные сертификаты CA. Если это файл, он должен быть в формате PEM и может содержать несколько сертификатов CA. Если это директория, она должна содержать один .pem файл на сертификат CA. Имя файла ищется по хеш значению имени субъекта CA. Подробности можно найти на странице man [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                            |
| `verificationMode`           | Метод проверки сертификатов узла. Подробности в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                 | `relaxed`                                  |
| `verificationDepth`          | Максимальная длина цепочки проверки. Проверка завершится неудачей, если длина цепочки сертификатов превысит указанное значение.                                                                                                                                                                                                                                                                                                                                            | `9`                                        |
| `loadDefaultCAFile`          | Использование встроенных сертификатов CA для OpenSSL. ClickHouse предполагает, что встроенные сертификаты CA находятся в файле `/etc/ssl/cert.pem` (соответственно, в директории `/etc/ssl/certs`) или в файле (соответственно, директории), указанном переменной среды `SSL_CERT_FILE` (соответственно, `SSL_CERT_DIR`).                                                                                                                                                     | `true`                                     |
| `cipherList`                 | Поддерживаемые шифры OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                              | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`              | Включение или выключение кэширования сессий. Должен использоваться в сочетании с `sessionIdContext`. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                | `false`                                    |
| `sessionIdContext`           | Уникальный набор случайных символов, который сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Этот параметр всегда рекомендуется, так как помогает избежать проблем как в случае, если сервер кэширует сессию, так и если клиент запрашивает кэширование.                                                                                                                                                 | `$\{application.name\}`                    |
| `sessionCacheSize`           | Максимальное количество сессий, которые сервер кэширует. Значение `0` означает неограниченное количество сессий.                                                                                                                                                                                                                                                                                                                                                          | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`             | Время кэширования сессии на сервере в часах.                                                                                                                                                                                                                                                                                                                                                                                                                               | `2`                                        |
| `extendedVerification`       | Если включено, проверяет, соответствует ли CN не хоста пир-сертификату.                                                                                                                                                                                                                                                                                                                                                                                                    | `false`                                    |
| `requireTLSv1`               | Требовать соединение TLSv1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                          | `false`                                    |
| `requireTLSv1_1`             | Требовать соединение TLSv1.1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `requireTLSv1_2`             | Требовать соединение TLSv1.2. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `fips`                       | Активация режима OpenSSL FIPS. Поддерживается, если версия OpenSSL библиотеки поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `privateKeyPassphraseHandler`| Класс (подкласс PrivateKeyPassphraseHandler), который запрашивает пароль для доступа к секретному ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                 | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`  | Класс (подкласс CertificateHandler) для проверки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`.                                                                                                                                                                                                                                                                               | `RejectCertificateHandler`                 |
| `disableProtocols`           | Протоколы, использование которых не допускается.                                                                                                                                                                                                                                                                                                                                                                                                                            |                                            |
| `preferServerCiphers`        | Шифры серверов, предпочтительные для клиента.                                                                                                                                                                                                                                                                                                                                                                                                                              | `false`                                    |

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
## path {#path}

Путь к директории, содержащей данные.

:::note
Окончательный слэш обязателен.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
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
## Prometheus {#prometheus}

Предоставление метрик данных для сбора в [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP-адрес для сбора метрик сервером prometheus. Начинается с '/'.
- `port` – Порт для `endpoint`.
- `metrics` – Экспорт метрик из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Экспорт метрик из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Экспорт текущих значений метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).
- `errors` - Экспорт количества ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эта информация также доступна из [system.errors](/operations/system-tables/errors).

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
## query_log {#query-log}

Настройка логирования запросов, полученных с настройкой [log_queries=1](../../operations/settings/settings.md).

Запросы записываются в таблицу [system.query_log](/operations/system-tables/query_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала запросов изменилась после обновления сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет создана автоматически.

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
## query_metric_log {#query_metric_log}

По умолчанию отключено.

**Включение**

Чтобы вручную включить сбор истории метрик [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md), создайте файл `/etc/clickhouse-server/config.d/query_metric_log.xml` с следующим содержимым:

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

Чтобы отключить настройку `query_metric_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` с следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_cache {#query_cache}

Конфигурация [кэша запросов](../query-cache.md).

Доступны следующие настройки:

| Настройка                   | Описание                                                                               | Значение по умолчанию |
|-----------------------------|----------------------------------------------------------------------------------------|-----------------------|
| `max_size_in_bytes`         | Максимальный размер кэша в байтах. `0` означает, что кэш запросов отключен.            | `1073741824`          |
| `max_entries`               | Максимальное количество результатов запросов `SELECT`, хранящихся в кэше.              | `1024`                |
| `max_entry_size_in_bytes`   | Максимальный размер в байтах, который могут иметь результаты запросов `SELECT`, чтобы быть сохранёнными в кэше. | `1048576`             |
| `max_entry_size_in_rows`    | Максимальное количество строк, которое могут иметь результаты запросов `SELECT`, чтобы быть сохранёнными в кэше. | `30000000`            |

:::note
- Изменённые настройки вступают в силу немедленно.
- Данные для кэша запросов выделены в DRAM. Если памяти не хватает, убедитесь, что установлено маленькое значение для `max_size_in_bytes` или полностью отключите кэш запросов.
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
## query_thread_log {#query_thread_log}

Настройка для логирования потоков запросов, полученных с настройкой [log_query_threads=1](/operations/settings/settings#log_query_threads).

Запросы записываются в таблицу [system.query_thread_log](/operations/system-tables/query_thread_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

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

Настройка для логирования представлений (live, материализованных и т.д.), зависящих от запросов, полученных с настройкой [log_query_views=1](/operations/settings/settings#log_query_views).

Запросы записываются в таблицу [system.query_views_log](/operations/system-tables/query_views_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

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
## text_log {#text_log}

Настройки для системной таблицы [text_log](/operations/system-tables/text_log) для логирования текстовых сообщений.

<SystemLogParameters/>

Дополнительно:

| Настройка | Описание                                                                                                                 | Значение по умолчанию   |
|-----------|--------------------------------------------------------------------------------------------------------------------------|-------------------------|
| `level`   | Максимальный уровень сообщений (по умолчанию `Trace`), который будет сохранён в таблице. | `Trace`                 |

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
## trace_log {#trace_log}

Настройки для работы системной таблицы [trace_log](/operations/system-tables/trace_log).

<SystemLogParameters/>

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
## crash_log {#crash_log}

Настройки для работы системной таблицы [crash_log](../../operations/system-tables/crash-log.md).

<SystemLogParameters/>

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

Эта настройка указывает путь кэша для пользовательских (созданных из SQL) кэшированных дисков.
`custom_cached_disks_base_directory` имеет более высокий приоритет для пользовательских дисков по сравнению с `filesystem_caches_path` (найденным в `filesystem_caches_path.xml`),
который используется, если первый отсутствует.
Путь к настройке файлового кэша должен лежать внутри этой директории,
в противном случае будет выброшено исключение, предотвращающее создание диска.

:::note
Это не повлияет на диски, созданные в старой версии, для которой сервер был обновлён.
В этом случае исключение не будет выброшено, чтобы сервер мог успешно запуститься.
:::

Пример:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```
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
## blob_storage_log {#blog_storage_log}

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
## query_masking_rules {#query_masking_rules}

Регулярные выражения, которые будут применяться к запросам, а также ко всем сообщениям логов перед сохранением их в серверные логи,
в таблицы [`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) и в логи, отправляемые клиенту. Это позволяет предотвращать утечку конфиденциальных данных из SQL-запросов, таких как имена, электронные почты, персональные идентификаторы или номера кредитных карт.

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

| Настройка | Описание                                                                   |
|-----------|----------------------------------------------------------------------------|
| `name`    | имя для правила (опционально)                                              |
| `regexp`  | регулярное выражение, совместимое с RE2 (обязательно)                      |
| `replace` | подстрока замены для конфиденциальных данных (опционально, по умолчанию — шесть звездочек) |

Правила маскирования применяются ко всему запросу (чтобы предотвратить утечку конфиденциальных данных из некорректных / неразбираемых запросов).

Таблица [`system.events`](/operations/system-tables/events) содержит счётчик `QueryMaskingRulesMatch`, который показывает общее количество совпадений правил маскирования запросов.

Для распределённых запросов каждый сервер должен быть настроен отдельно, в противном случае подзапросы, передаваемые другим узлам, будут сохраняться без маскирования.
## remote_servers {#remote_servers}

Конфигурация кластеров, используемых движком таблиц [Distributed](../../engines/table-engines/special/distributed.md) и табличной функцией `cluster`.

**Пример**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

Узнать значение атрибута `incl` можно в разделе "[Файлы конфигурации](/operations/configuration-files)".

**См. также**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Обнаружение кластеров](../../operations/cluster-discovery.md)
- [Движок реплицированных баз данных](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts}

Список хостов, которые разрешены для использования в движках хранения и табличных функциях, связанных с URL.

При добавлении хоста с помощью xml-тега `\<host\>`:
- он должен быть указан точно так же, как в URL, поскольку имя проверяется до разрешения DNS. Например: `<host>clickhouse.com</host>`
- если порт явно указан в URL, тогда хост:порт проверяется как единое целое. Например: `<host>clickhouse.com:80</host>`
- если хост указан без порта, то разрешён любой порт хоста. Например, если указано `<host>clickhouse.com</host>`, то разрешены `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т.д.
- если хост указан как IP-адрес, то он проверяется, как указано в URL. Например: `[2a02:6b8:a::a]`.
- если есть перенаправления и поддержка перенаправлений включена, то каждое перенаправление (поле location) проверяется.

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## timezone {#timezone}

Часовой пояс сервера.

Указан как идентификатор IANA для часового пояса UTC или географического местоположения (например, Africa/Abidjan).

Часовой пояс необходим для преобразования между форматами String и DateTime, когда поля DateTime выводятся в текстовом формате (печатаются на экране или в файле), а также при получении DateTime из строки. Кроме того, часовой пояс используется в функциях, работающих со временем и датой, если они не получили часовой пояс во входных параметрах.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**См. также**

- [session_timezone](../settings/settings.md#session_timezone)
## tcp_port {#tcp_port}

Порт для общения с клиентами по протоколу TCP.

**Пример**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure}

TCP-порт для безопасного общения с клиентами. Используется с настройками [OpenSSL](#openssl).

**Значение по умолчанию**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## mysql_port {#mysql_port}

Порт для общения с клиентами по протоколу MySQL.

:::note
- Положительные целые числа указываются для порта, который будет слушать
- Пустые значения используются, чтобы отключить общение с клиентами по протоколу MySQL.
:::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```
## postgresql_port {#postgresql_port}

Порт для общения с клиентами по протоколу PostgreSQL.

:::note
- Положительные целые числа указываются для порта, который будет слушать
- Пустые значения используются, чтобы отключить общение с клиентами по протоколу PostgreSQL.
:::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```
## tmp_path {#tmp_path}

Путь в локальной файловой системе для хранения временных данных для обработки больших запросов.

:::note
- Может быть использован только один вариант для настройки хранилища временных данных: `tmp_path` ,`tmp_policy`, `temporary_data_in_cache`.
- Закрывающая косая черта обязательна.
:::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## url_scheme_mappers {#url_scheme_mappers}

Конфигурация для перевода сокращённых или символических префиксов URL в полные URL.

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
## user_files_path {#user_files_path}

Директория с пользовательскими файлами. Используется в табличной функции [file()](../../sql-reference/table-functions/file.md), [fileCluster()](../../sql-reference/table-functions/fileCluster.md).

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

По умолчанию:
## user_defined_path {#user_defined_path}

Директория с файлами пользовательских определений. Используется для пользовательских SQL функций [SQL User Defined Functions](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
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

Определяет, включено ли подтверждение информации о клиенте при получении пакета запроса.

По умолчанию это `false`:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```
## access_control_improvements {#access_control_improvements}

Настройки для опциональных улучшений в системе контроля доступа.

| Настройка                                    | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | По умолчанию |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `users_without_row_policies_can_read_rows`      | Определяет, могут ли пользователи без разрешительных политик строк всё ещё читать строки с помощью запроса `SELECT`. Например, если есть два пользователя A и B, и политика строк определена только для A, то если эта настройка выставлена в true, пользователь B увидит все строки. Если эта настройка выставлена в false, пользователь B не увидит ни одной строки.                                                                                                                                                                                                                     | `true`  |
| `on_cluster_queries_require_cluster_grant`      | Определяет, требуют ли запросы `ON CLUSTER` гранта `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `true`  |
| `select_from_system_db_requires_grant`          | Определяет, требуют ли запросы `SELECT * FROM system.<table>` каких-либо грантов и могут быть выполнены любым пользователем. Если установлено в true, этот запрос требует `GRANT SELECT ON system.<table>`, как и для несистемных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые постоянные таблицы, такие как `one`, `contributors`) всё ещё доступны всем; и если предоставлено право `SHOW` (например, `SHOW USERS`), то соответствующая системная таблица (т.е. `system.users`) будет доступна. | `true`  |
| `select_from_information_schema_requires_grant` | Определяет, требуют ли запросы `SELECT * FROM information_schema.<table>` каких-либо грантов и могут быть выполнены любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON information_schema.<table>`, как и для обычных таблиц.                                                                                                                                                                                                                                                                                 | `true`  |
| `settings_constraints_replace_previous`         | Определяет, будет ли ограничение в профиле настроек для какого-либо параметра отменять действия предыдущего ограничения (определённого в других профилях) для этого параметра, включая поля, которые не установлены новым ограничением. Это также позволяет использовать тип ограничения `changeable_in_readonly`.                                                                                                                                                                                                                            | `true`  |
| `table_engines_require_grant`                   | Определяет, требует ли создание таблицы с движком таблиц полученного гранта.                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false` |
| `role_cache_expiration_time_seconds`            | Устанавливает количество секунд с последнего доступа, в течение которых роль хранится в кэше ролей.                                                                                                                                                                                                                                                                                                                                                                                                                           | `600`   |

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
## wait_dictionaries_load_at_startup {#wait_dictionaries_load_at_startup}

Эта настройка позволяет указать поведение, если `dictionaries_lazy_load` — `false`.
(Если `dictionaries_lazy_load` — `true`, эта настройка не влияет ни на что.)

Если `wait_dictionaries_load_at_startup` — `false`, то сервер начнёт загружать все словари при старте и будет принимать подключения параллельно с этой загрузкой.
Когда словарь используется в запросе в первый раз, запрос будет ждать, пока словарь не будет загружен, если он ещё не загружен.
Установка `wait_dictionaries_load_at_startup` в `false` может ускорить запуск ClickHouse, однако некоторые запросы могут выполняться медленнее
(потому что они будут вынуждены ждать, пока некоторые словари не будут загружены).

Если `wait_dictionaries_load_at_startup` — `true`, то сервер будет ждать при старте
пока все словари не завершат загрузку (успешно или нет) перед приёмом любых подключений.

**Пример**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```

По умолчанию: true
## zookeeper {#zookeeper}

Содержит настройки, которые позволяют ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицированных таблиц. Если реплицированные таблицы не используются, этот раздел параметров можно опустить.

Следующие настройки можно настроить с помощью подпараметров:

| Настройка                                    | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                     | Точка подключения ZooKeeper. Можно задать несколько таких точек. Например, `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` указывает порядок выбора ноды при попытке подключиться к кластеру ZooKeeper.                                                                                                                                                                                                                                                                                           |
| `session_timeout_ms`                       | Максимальный тайм-аут для сессии клиента в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `operation_timeout_ms`                     | Максимальный тайм-аут для одной операции в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `root` (опционально)                    | ZNode, используемый в качестве корня для znode, используемых сервером ClickHouse.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `fallback_session_lifetime.min` (опционально) | Минимальный предел для времени жизни сессии zookeeper для резервной ноды, когда основная недоступна (балансировка нагрузки). Устанавливается в секундах. По умолчанию: 3 часа.                                                                                                                                                                                                                                                                                                                                                                           |
| `fallback_session_lifetime.max` (опционально) | Максимальный предел для времени жизни сессии zookeeper для резервной ноды, когда основная недоступна (балансировка нагрузки). Устанавливается в секундах. По умолчанию: 6 часов.                                                                                                                                                                                                                                                                                                                                                                           |
| `identity` (опционально)                  | Пользователь и пароль, требуемые ZooKeeper для доступа к требуемым znode.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `use_compression` (опционально)             | Включает сжатие в протоколе Keeper, если установлено в true.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

Существует также параметр `zookeeper_load_balancing` (опционально), который позволяет выбрать алгоритм выбора ноды ZooKeeper:

| Имя алгоритма                        | Описание                                                                                                                      |
|--------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| `random`                             | случайно выбирает одну из нод ZooKeeper.                                                                                     |
| `in_order`                           | выбирает первую ноду ZooKeeper, если она недоступна, то вторую и так далее.                                                  |
| `nearest_hostname`                   | выбирает ноду ZooKeeper с именем, наиболее похожим на имя сервера, сравнивается префикс имени хоста.                         |
| `hostname_levenshtein_distance`      | так же, как и nearest_hostname, но сравнивает имя хоста с помощью метрики Левенштейна.                                       |
| `first_or_random`                    | выбирает первую ноду ZooKeeper, если она недоступна, случайно выбирает одну из оставшихся нод ZooKeeper.                      |
| `round_robin`                        | выбирает первую ноду ZooKeeper, если происходит переподключение, выбирает следующую.                                        |

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
    <!-- Опционально. Суффикс chroot. Должен существовать. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Опционально. Строка Zookeeper digest ACL. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**См. также**

- [Репликация](../../engines/table-engines/mergetree-family/replication.md)
- [Руководство программиста ZooKeeper](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [Опциональная защищённая связь между ClickHouse и Zookeeper](/operations/ssl-zookeeper)
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

Метод хранения заголовков частей данных в ZooKeeper. Эта настройка применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Её можно указать:

**Глобально в разделе [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует эту настройку для всех таблиц на сервере. Вы можете изменить настройку в любое время. Существующие таблицы изменяют своё поведение, когда изменяется настройка.

**Для каждой таблицы**

При создании таблицы укажите соответствующую [настройку движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этой настройкой не изменяется, даже если изменится глобальная настройка.

**Возможные значения**

- `0` — Функциональность выключена.
- `1` — Функциональность включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицированные](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки частей данных компактно, используя один `znode`. Если таблица содержит много столбцов, этот метод хранения значительно уменьшает объем данных, хранящихся в Zookeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` вы не сможете понизить версию сервера ClickHouse до версии, которая не поддерживает эту настройку. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все серверы сразу. Безопаснее тестировать новые версии ClickHouse в тестовой среде или на нескольких серверах кластера.

Заголовки частей данных, уже хранящиеся с этой настройкой, не могут быть восстановлены в их прежнее (не-компактное) представление.
:::

Тип: UInt8

По умолчанию: 0
## distributed_ddl {#distributed_ddl}

Управление выполнением [распределённых DDL запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) на кластере.
Работает только если [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) включен.

Настраиваемые параметры в `<distributed_ddl>` включают:

| Настройка               | Описание                                                                                                                        | Значение по умолчанию                     |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|
| `path`                  | путь в Keeper для `task_queue` для DDL-запросов                                                                                  |                                           |
| `profile`               | профиль, используемый для исполнения DDL-запросов                                                                                |                                           |
| `pool_size`             | сколько `ON CLUSTER` запросов может выполняться одновременно                                                                     |                                           |
| `max_tasks_in_queue`    | максимальное количество задач, которые могут находиться в очереди                                                                              | `1,000`                                   |
| `task_max_lifetime`     | удаляет узел, если его возраст превышает это значение                                                                             | `7 * 24 * 60 * 60` (неделя в секундах)    |
| `cleanup_delay_period`  | очистка начинается после получения события о новом узле, если предыдущая очистка не была проведена раньше, чем `cleanup_delay_period` секунд назад | `60` секунд                               |

**Пример**

```xml
<distributed_ddl>
    <!-- Путь в ZooKeeper к очереди с DDL запросами -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Параметры из этого профиля будут использоваться для выполнения DDL запросов -->
    <profile>default</profile>

    <!-- Контролирует, сколько ON CLUSTER запросов можно выполнять одновременно. -->
    <pool_size>1</pool_size>

    <!--
         Настройки очистки (активные задачи не будут удалены)
    -->

    <!-- Контролирует время жизни задачи (по умолчанию 1 неделя) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Контролирует, как часто должна проводиться очистка (в секундах) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Контролирует, сколько задач может находиться в очереди -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```
## access_control_path {#access_control_path}

Путь к папке, в которой сервер ClickHouse хранит конфигурации пользователей и ролей, созданные с помощью SQL-команд.

**См. также**

- [Контроль доступа и управление учётными записями](/operations/access-rights#access-control-usage)

Тип: Строка

По умолчанию: `/var/lib/clickhouse/access/`.
## allow_plaintext_password {#allow_plaintext_password}

Определяет, разрешены ли небезопасные типы паролей в открытую (plaintext-password).

По умолчанию: `1` (authType plaintext_password разрешён)

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```
## allow_no_password {#allow_no_password}

Определяет, разрешён ли небезопасный тип пароля без пароля (no_password).

По умолчанию: `1` (authType no_password разрешён)

```xml
<allow_no_password>1</allow_no_password>
```
## allow_implicit_no_password {#allow_implicit_no_password}

Запрещает создание пользователя без пароля, если 'IDENTIFIED WITH no_password' не указано явно.

По умолчанию: `1`

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## default_session_timeout {#default_session_timeout}

Тайм-аут сессии по умолчанию, в секундах.

По умолчанию: `60`

```xml
<default_session_timeout>60</default_session_timeout>
```
## default_password_type {#default_password_type}

Устанавливает тип пароля, который будет автоматически установлен в запросах типа `CREATE USER u IDENTIFIED BY 'p'`.

Допустимые значения:
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## user_directories {#user_directories}

Раздел файла конфигурации, содержащий настройки:
- Путь к файлу конфигурации с предопределёнными пользователями.
- Путь к папке, где хранятся пользователи, созданные SQL-командами.
- Путь к узлу ZooKeeper, где хранятся и реплицируются пользователи, созданные SQL-командами (экспериментальная функция).

Если этот раздел указан, путь из [users_config](/operations/server-configuration-parameters/settings#users_config) и [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) не будет использоваться.

Раздел `user_directories` может содержать любое количество элементов, порядок элементов определяет их приоритет (чем выше элемент, тем выше его приоритет).

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

Пользователи, роли, политики для строк, квоты и профили также могут храниться в ZooKeeper:

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

Чтобы добавить LDAP-сервер в качестве удалённого каталога пользователей, которые не определены локально, определите один раздел `ldap` с следующими настройками:

| Настройка  | Описание                                                                                                                                                                                                                                                                                                         |
|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server`   | одно из имён LDAP-сервера, определённых в разделе конфигурации `ldap_servers`. Этот параметр обязателен и не может быть пустым.                                                                                                                                                                                 |
| `roles`    | раздел со списком локально определённых ролей, которые будут назначены каждому пользователю, извлечённому с LDAP-сервера. Если роли не указаны, пользователь не сможет выполнять никаких действий после аутентификации. Если какая-либо из указанных ролей не определена локально на момент аутентификации, попытка аутентификации завершится неудачей, как если бы предоставленный пароль был неверным. |

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
## top_level_domains_list {#top_level_domains_list}

Определяет список пользовательских доменов верхнего уровня, где каждая запись имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

Смотрите также:
- функцию [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) и её вариации, которая принимает имя пользовательского списка TLD, возвращая часть домена, включающую домены верхнего уровня до первого значимого поддомена.
## total_memory_profiler_step {#total_memory_profiler_step}

Устанавливает размер памяти (в байтах) для трассировки стека на каждом этапе пикового выделения. Данные хранятся в системной таблице [system.trace_log](../../operations/system-tables/trace_log.md) с `query_id`, равным пустой строке.

По умолчанию: `4194304`.
## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability}

Позволяет собирать случайные выделения и удаления памяти и записывает их в системную таблицу [system.trace_log](../../operations/system-tables/trace_log.md) с `trace_type`, равным `MemorySample` с указанной вероятностью. Вероятность применяется к каждому выделению или удалению памяти, независимо от размера выделения. Обратите внимание, что выборка происходит только тогда, когда количество непроиндексированной памяти превышает лимит непроиндексированной памяти (значение по умолчанию — `4` MiB). Оно может быть уменьшено, если уменьшен [total_memory_profiler_step](#total_memory_profiler_step). Вы можете установить `total_memory_profiler_step` равным `1` для более детальной выборки.

Возможные значения:

- Положительное целое число.
- `0` — Запись случайных выделений и удалений памяти в системную таблицу `system.trace_log` отключена.

По умолчанию: `0`.
## compiled_expression_cache_size {#compiled_expression_cache_size}

Устанавливает размер кэша (в байтах) для [скомпилированных выражений](../../operations/caches.md).

По умолчанию: `134217728`.
## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size}

Устанавливает размер кэша (в элементах) для [скомпилированных выражений](../../operations/caches.md).

По умолчанию: `10000`.
## display_secrets_in_show_and_select {#display_secrets_in_show_and_select}

Включает или отключает отображение секретов в запросах `SHOW` и `SELECT` для таблиц, баз данных, табличных функций и словарей.

Пользователь, желающий увидеть секреты, также должен иметь включенную
настройку формата [`format_display_secrets_in_show_and_select`](../settings/formats#format_display_secrets_in_show_and_select)
и привилегию
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Возможные значения:

- `0` — Отключено.
- `1` — Включено.

По умолчанию: `0`
## proxy {#proxy}

Определяет прокси-серверы для HTTP и HTTPS-запросов, в настоящее время поддерживается хранилищем S3, табличными функциями S3 и URL-функциями.

Существует три способа определить прокси-серверы:
- переменные окружения
- списки прокси
- удалённые резолверы прокси.

Обход прокси-серверов для определённых хостов также поддерживается с использованием `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать
прокси-сервер для данного протокола. Если она установлена на вашей системе, она должна работать без сбоев.

Это самый простой подход, если для данного протокола
есть только один прокси-сервер и этот прокси-сервер не меняется.

**Списки прокси**

Этот подход позволяет указать один или несколько
прокси-серверов для протокола. Если определено более одного прокси-сервера,
ClickHouse использует разные прокси в порядке кругового чередования, распределяя
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
Выберите родительское поле на вкладках ниже, чтобы увидеть их дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле     | Описание                                 |
|----------|------------------------------------------|
| `<http>`  | Список из одного или нескольких HTTP-прокси |
| `<https>` | Список из одного или нескольких HTTPS-прокси |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">


| Поле   | Описание          |
|--------|-------------------|
| `<uri>` | URI прокси       |

  </TabItem>
</Tabs>

**Удалённые резолверы прокси**

Возможно, что прокси-серверы изменяются динамически. В этом
случае можно определить конечную точку резолвера. ClickHouse отправляет
пустой GET-запрос на эту конечную точку, удалённый резолвер должен вернуть хост прокси.
ClickHouse будет использовать его для формирования URI прокси с использованием следующего шаблона: `{proxy_scheme}://{proxy_host}:{proxy_port}`

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

Выберите родительское поле на вкладках ниже, чтобы увидеть их дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле     | Описание                       |
|----------|--------------------------------|
| `<http>` | Список из одного или нескольких резолверов |
| `<https>` | Список из одного или нескольких резолверов |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">

| Поле       | Описание                                                       |
|------------|----------------------------------------------------------------|
| `<resolver>` | Конечная точка и другие детали для резолвера                   |

:::note
Вы можете иметь несколько элементов `<resolver>`, но только первый
`<resolver>` для данного протокола используется. Все другие элементы `<resolver>`
для этого протокола игнорируются. Это означает, что распределение нагрузки
(если необходимо) должно быть реализовано удалённым резолвером.
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| Поле               | Описание                                                                                                                                                                            |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | URI резолвера прокси                                                                                                                                                                |
| `<proxy_scheme>`    | Протокол окончательного URI прокси. Это может быть либо `http`, либо `https`.                                                                                                       |
| `<proxy_port>`      | Номер порта резолвера прокси                                                                                                                                                       |
| `<proxy_cache_time>` | Время в секундах, в течение которого значения от резолвера должны кэшироваться ClickHouse. Установка этого значения в `0` приводит к тому, что ClickHouse будет обращаться к резолверу для каждого запроса HTTP или HTTPS. |

  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:

| Порядок | Настройка                 |
|---------|---------------------------|
| 1.      | Удалённые резолверы прокси |
| 2.      | Списки прокси             |
| 3.      | Переменные окружения      |

ClickHouse будет проверять наиболее приоритетный тип резолвера для протокола запроса. Если он не определён,
проверит следующий наиболее приоритетный тип резолвера, пока не достигнет резолвера окружения.
Это также позволяет использовать смесь типов резолверов.
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию туннелирование (т.е. `HTTP CONNECT`) используется для создания `HTTPS`-запросов через `HTTP`-прокси. Эта настройка может быть использована для его отключения.

**no_proxy**

По умолчанию все запросы проходят через прокси. Для отключения его для определённых хостов переменная `no_proxy` должна быть установлена.
Её можно задать внутри директивы `<proxy>` для списка и удалённых резолверов и как переменную окружения для резолвера окружения.
Поддерживаются IP-адреса, домены, поддомены и подстановочный знак `'*'` для полного обхода. Начальные точки удаляются так же, как это делает curl.

**Пример**

Ниже приведённая конфигурация обходит запросы прокси к `clickhouse.cloud` и всем его поддоменам (например, `auth.clickhouse.cloud`).
То же самое касается GitLab, даже если у него есть начальная точка. И `gitlab.com`, и `about.gitlab.com` будут обходить прокси.

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
## max_materialized_views_count_for_table {#max_materialized_views_count_for_table}

Ограничение на количество материализованных представлений, прикреплённых к таблице.

:::note
Здесь учитываются только непосредственно зависимые представления, и создание одного представления на основе другого представления не учитывается.
:::

По умолчанию: `0`.
## format_alter_operations_with_parentheses {#format_alter_operations_with_parentheses}

Если установлено значение `true`, то операции изменения будут заключены в скобки в отформатированных запросах. Это делает разбор отформатированных запросов на изменение менее неоднозначным.

Тип: `Bool`

По умолчанию: `0`
## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query}

Если установлено значение `true`, ClickHouse не записывает значения по умолчанию для пустых операторов безопасности SQL в запросах `CREATE VIEW`.

:::note
Эта настройка необходима только в течение периода миграции и станет устаревшей в версии 24.4
:::

Тип: `Bool`

По умолчанию: `1`
## merge_workload {#merge_workload}

Используется для регулирования того, как ресурсы используются и распределяются между слияниями и другими рабочими нагрузками. Указанное значение используется как значение настройки `workload` для всех фоновых слияний. Может быть переопределено настройкой слияния дерева.

Тип: `String`

По умолчанию: `default`

**Смотрите также**
- [Workload Scheduling](/operations/workload-scheduling.md)
## mutation_workload {#mutation_workload}

Используется для регулирования того, как ресурсы используются и распределяются между мутациями и другими рабочими нагрузками. Указанное значение используется как значение настройки `workload` для всех фоновых мутаций. Может быть переопределено настройкой слияния дерева.

**Смотрите также**
- [Workload Scheduling](/operations/workload-scheduling.md)

Тип: `String`

По умолчанию: `default`
## throw_on_unknown_workload {#throw_on_unknown_workload}

Определяет поведение при доступе к неизвестной РАБОЧЕЙ НАГРУЗКЕ с настройкой запроса 'workload'.

- Если `true`, исключение RESOURCE_ACCESS_DENIED выбрасывается из запроса, который пытается получить доступ к неизвестной рабочей нагрузке. Полезно для обеспечения планирования ресурсов для всех запросов после того, как иерархия РАБОЧИХ НАГРУЗОК будет установлена и будет содержать РАБОЧУЮ НАГРУЗКУ по умолчанию.
- Если `false` (по умолчанию), предоставляется неограниченный доступ без планирования ресурсов к запросу с установкой 'workload', указывающей на неизвестную РАБОЧУЮ НАГРУЗКУ. Это важно во время настройки иерархии РАБОЧИХ НАГРУЗОК, до того как будет добавлена РАБОЧАЯ НАГРУЗКА по умолчанию.

**Смотрите также**
- [Workload Scheduling](/operations/workload-scheduling.md)

Тип: String

По умолчанию: false

**Пример**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```
## workload_path {#workload_path}

Директория, используемая как хранилище для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется папка `/workload/` в рабочей директории сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**Смотрите также**
- [Иерархия Рабочих Нагрузок](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path}

Путь к узлу ZooKeeper, который используется как хранилище для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для согласованности все SQL-определения хранятся как значение этого единственного узла znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**Смотрите также**
- [Иерархия Рабочих Нагрузок](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
## max_authentication_methods_per_user {#max_authentication_methods_per_user}

Максимальное количество методов аутентификации, с которыми пользователь может быть создан или изменён.
Изменение этой настройки не влияет на существующих пользователей. Запросы на создание/изменение, связанные с аутентификацией, завершатся неудачей, если они превышают лимит, указанный в этой настройке.
Запросы на создание/изменение, не связанные с аутентификацией, выполнятся.

:::note
Значение `0` означает неограниченное количество.
:::

Тип: `UInt64`

По умолчанию: `100`
## allow_feature_tier {#allow_feature_tier}

Контролирует, может ли пользователь изменять настройки, связанные с различными уровнями функций.

- `0` - Изменения любых настроек разрешены (экспериментальные, бета, производственные).
- `1` - Разрешены только изменения для бета и производственных функций. Изменения экспериментальных функций запрещены.
- `2` - Разрешены только изменения для производственных функций. Изменения экспериментальных или бета функций запрещены.

Это эквивалентно настройке ограничения на изменяемость для всех `EXPERIMENTAL` / `BETA` функций.

:::note
Значение `0` означает, что все настройки могут быть изменены.
:::

Тип: `UInt32`

По умолчанию: `0`
