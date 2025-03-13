---
slug: /operations/server-configuration-parameters/settings
sidebar_position: 57
sidebar_label: Глобальные параметры сервера
description: Этот раздел содержит описания параметров сервера, которые не могут быть изменены на уровне сессии или запроса.
keywords: [глобальные параметры сервера]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SystemLogParameters from '@site/i18n/ru/docusaurus-plugin-content-docs/current/operations/server-configuration-parameters/_snippets/_system-log-parameters.md'

# Глобальные параметры сервера

Этот раздел содержит описания параметров сервера, которые не могут быть изменены на уровне сессии или запроса. Эти параметры хранятся в файле `config.xml` на сервере ClickHouse. Для получения дополнительной информации о файлах конфигурации в ClickHouse см. ["Файлы конфигурации"](/operations/configuration-files).

Другие параметры описаны в разделе "[Настройки](/operations/settings/overview)".
Перед изучением параметров рекомендуется прочитать раздел [Файлы конфигурации](/operations/configuration-files) и обратить внимание на использование подстановок (атрибуты `incl` и `optional`).
## allow_use_jemalloc_memory {#allow_use_jemalloc_memory}

Разрешает использование памяти jemalloc.

Тип: `Bool`

По умолчанию: `1`
## asynchronous_heavy_metrics_update_period_s {#asynchronous_heavy_metrics_update_period_s}

Период в секундах для обновления асинхронных метрик.

Тип: `UInt32`

По умолчанию: `120`
## asynchronous_metric_log {#asynchronous_metric_log}

Включено по умолчанию в развертываниях ClickHouse Cloud.

Если этот параметр не включен по умолчанию в вашей среде, в зависимости от того, как был установлен ClickHouse, вы можете следовать инструкциям ниже, чтобы включить или отключить его.

**Включение**

Чтобы вручную включить сбор истории журналов асинхронной метрики [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md), создайте `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` со следующим содержанием:

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

Чтобы отключить параметр `asynchronous_metric_log`, вам нужно создать следующий файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержанием:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## asynchronous_metrics_update_period_s {#asynchronous_metrics_update_period_s}

Период в секундах для обновления асинхронных метрик.

Тип: `UInt32`

По умолчанию: `1`
## auth_use_forwarded_address {#auth_use_forwarded_address}

Использовать исходный адрес для аутентификации для клиентов, подключенных через прокси.

:::note
Этот параметр следует использовать с осторожностью, так как перенаправленные адреса могут быть легко подделаны - сервера, принимающие такую аутентификацию, не должны быть доступны напрямую, а только через надежный прокси.
:::

Тип: `Bool`

По умолчанию: `0`
## background_buffer_flush_schedule_pool_size {#background_buffer_flush_schedule_pool_size}

Максимальное количество потоков, которое будет использоваться для выполнения операций сброса для [таблиц с Buffer-engine](/engines/table-engines/special/buffer) в фоновом режиме.

Тип: `UInt64`

По умолчанию: `16`
## background_common_pool_size {#background_common_pool_size}

Максимальное количество потоков, которое будет использоваться для выполнения различных операций (в основном сборки мусора) для таблиц с [*MergeTree-engine](/engines/table-engines/mergetree-family) в фоновом режиме.

Тип: `UInt64`

По умолчанию: `8`
## background_distributed_schedule_pool_size {#background_distributed_schedule_pool_size}

Максимальное количество потоков, которое будет использоваться для выполнения распределенных отправок.

Тип: `UInt64`

По умолчанию: `16`
## background_fetches_pool_size {#background_fetches_pool_size}

Максимальное количество потоков, которое будет использоваться для извлечения частей данных из другой реплики для таблиц с [*MergeTree-engine](/engines/table-engines/mergetree-family) в фоновом режиме.

Тип: `UInt64`

По умолчанию: `16`
## background_merges_mutations_concurrency_ratio {#background_merges_mutations_concurrency_ratio}

Устанавливает соотношение между количеством потоков и количеством фоновых слияний и мутаций, которые могут выполняться одновременно.

Например, если соотношение равно 2, а [`background_pool_size`](#background_pool_size) установлено на 16, то ClickHouse может выполнять 32 фоновых слияния одновременно. Это возможно, потому что фоновые операции могут быть приостановлены и отложены. Это необходимо, чтобы дать малым слияниям больше приоритета для выполнения.

:::note
Вы можете только увеличить это соотношение во время работы. Для его уменьшения необходимо перезагрузить сервер.

Как и параметр [`background_pool_size`](#background_pool_size), [`background_merges_mutations_concurrency_ratio`](#background_merges_mutations_concurrency_ratio) может быть применен из профиля `default` для обратной совместимости.
:::

Тип: `Float`

По умолчанию: `2`
## background_merges_mutations_scheduling_policy {#background_merges_mutations_scheduling_policy}

Политика, по которой выполняется планирование фоновых слияний и мутаций. Возможные значения: `round_robin` и `shortest_task_first`.

Алгоритм, используемый для выбора следующего слияния или мутации, которые будут выполнены пулом фоновых потоков. Политику можно изменить в режиме выполнения без перезагрузки сервера. Она может быть применена из профиля `default` для обратной совместимости.

Возможные значения:

- `round_robin` — Каждое параллельное слияние и мутация выполняются по методу round-robin, чтобы обеспечить отсутствие голодания. Мелкие слияния завершаются быстрее, чем крупные, просто потому что у них меньше блоков для слияния.
- `shortest_task_first` — Всегда выполняйте более мелкое слияние или мутацию. Слияния и мутации получают приоритеты в зависимости от их результирующего размера. Слияния с меньшими размерами строго предпочтительнее по сравнению с более крупными. Эта политика обеспечивает максимально быстрое слияние небольших частей, но может привести к бесконечному голоданию больших слияний в партициях, сильно перегруженных `INSERT`.

Тип: String

По умолчанию: `round_robin`
## background_message_broker_schedule_pool_size {#background_message_broker_schedule_pool_size}

Максимальное количество потоков, которое будет использоваться для выполнения фоновых операций для обмена сообщениями.

Тип: UInt64

По умолчанию: `16`
## background_move_pool_size {#background_move_pool_size}

Максимальное количество потоков, которое будет использоваться для перемещения частей данных на другой диск или том для таблиц *MergeTree-engine в фоновом режиме.

Тип: UInt64

По умолчанию: `8`
## background_schedule_pool_size {#background_schedule_pool_size}

Максимальное количество потоков, которое будет использоваться для постоянного выполнения некоторых легковесных периодических операций для реплицированных таблиц, потоков Kafka и обновлений кэша DNS.

Тип: UInt64

По умолчанию: `512`
## backups {#backups}

Настройки для резервных копий, используемые при выполнении `BACKUP TO File()`.

Следующие настройки могут быть настроены с помощью подметок:

| Параметр                             | Описание                                                                                                                                                                    | По умолчанию |
|-------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `allowed_path`                      | Путь для резервного копирования при использовании `File()`. Этот параметр должен быть установлен для использования `File`. Путь может быть относительным к каталогу экземпляра или абсолютным.              | `true`  |
| `remove_backup_files_after_failure` | Если команда `BACKUP` завершится не удачно, ClickHouse попытается удалить файлы, уже скопированные в резервную копию, до сбоя, в противном случае он оставит скопированные файлы как есть. | `true`  |

Этот параметр по умолчанию настроен как:

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

Максимальное количество заданий, которые могут быть запланированы в пуле потоков ввода-вывода резервных копий. Рекомендуется оставить эту очередь без ограничений из-за текущей логики резервного копирования S3.

:::note
Значение `0` (по умолчанию) означает неограниченно.
:::

Тип: `UInt64`

По умолчанию: `0`
## bcrypt_workfactor {#bcrypt_workfactor}

Фактор работы для типа аутентификации bcrypt_password, который использует [Алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).

По умолчанию: `12`

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```
## cache_size_to_ram_max_ratio {#cache_size_to_ram_max_ratio}

Установите максимум отношения размера кеша к ОЗУ. Позволяет уменьшить размер кеша на системах с низкой памятью.

Тип: `Double`

По умолчанию: `0.5`
## concurrent_threads_soft_limit_num {#concurrent_threads_soft_limit_num}

Максимальное количество потоков обработки запросов, не учитывая потоки для получения данных с удаленных серверов, которые разрешены для обработки всех запросов. Это не жесткий лимит. В случае достижения лимита запрос все равно получит как минимум один поток для выполнения. Запрос может увеличить желаемое количество потоков во время выполнения, если доступны дополнительные потоки.

:::note
Значение `0` (по умолчанию) означает неограниченно.
:::

Тип: `UInt64`

По умолчанию: `0`
## concurrent_threads_soft_limit_ratio_to_cores {#concurrent_threads_soft_limit_ratio_to_cores}

То же самое, что и [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num), но с соотношением к ядрам.

Тип: `UInt64`

По умолчанию: `0`
## concurrent_threads_scheduler {#concurrent_threads_scheduler}

Политика, по которой выполняется планирование слотов ЦП, указанных в [`concurrent_threads_soft_limit_num`](#concurrent_threads_soft_limit_num) и [`concurrent_threads_soft_limit_ratio_to_cores`](#concurrent_threads_soft_limit_ratio_to_cores). Алгоритм, используемый для управления, как ограниченное количество слотов ЦП распределяется между параллельными запросами. Планировщик может быть изменен в режиме выполнения без перезагрузки сервера.

Тип: String

По умолчанию: `round_robin`

Возможные значения:

- `round_robin` — Каждый запрос с параметром `use_concurrency_control` = 1 выделяет до `max_threads` слотов ЦП. Один слот на поток. В условиях конкуренции слоты ЦП предоставляются запросам по методу round-robin. Обратите внимание, что первый слот предоставляется без условий, что может привести к нечестности и увеличению задержки запросов с высоким `max_threads` при наличии большого количества запросов с `max_threads` = 1.
- `fair_round_robin` — Каждый запрос с параметром `use_concurrency_control` = 1 выделяет до `max_threads - 1` слотов ЦП. Вариация `round_robin`, которая не требует слот ЦП для первого потока каждого запроса. Таким образом, запросы с `max_threads` = 1 не требуют слота и не могут несправедливо распределить все слоты. Слоты не предоставляются без условий.
## default_database {#default_database}

Имя базы данных по умолчанию.

Тип: `String`

По умолчанию: `default`
## disable_internal_dns_cache {#disable_internal_dns_cache}

Отключает внутренний кэш DNS. Рекомендуется для работы ClickHouse в системах
с часто изменяющейся инфраструктурой, такой как Kubernetes.

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

Максимальное количество последовательных сбоев разрешения перед удалением хоста из кэша DNS ClickHouse.

Тип: `UInt32`

По умолчанию: `10`
## index_mark_cache_policy {#index_mark_cache_policy}

Имя политики кэша меток индекса.

Тип: `String`

По умолчанию: `SLRU`
## index_mark_cache_size {#index_mark_cache_size}

Максимальный размер кэша для меток индекса.

:::note

Значение `0` означает отключение.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::

Тип: `UInt64`

По умолчанию: `0`
## index_mark_cache_size_ratio {#index_mark_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше меток индекса относительно общего размера кэша.

Тип: `Double`

По умолчанию: `0.5`
## index_uncompressed_cache_policy {#index_uncompressed_cache_policy}

Имя политики кэша для неконтируемых индексов.

Тип: `String`

По умолчанию: `SLRU`
## index_uncompressed_cache_size {#index_uncompressed_cache_size}

Максимальный размер кэша для неконтируемых блоков индексов `MergeTree`.

:::note
Значение `0` означает отключение.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::

Тип: `UInt64`

По умолчанию: `0`
## index_uncompressed_cache_size_ratio {#index_uncompressed_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше неконтируемых индексов относительно общего размера кэша.

Тип: `Double`

По умолчанию: `0.5`
## skipping_index_cache_policy {#skipping_index_cache_policy}

Имя политики кэша пропускающего индекса.

Тип: `String`

По умолчанию: `SLRU`
## skipping_index_cache_size {#skipping_index_cache_size}

Размер кэша для пропускающих индексов. Ноль означает отключение.

:::note
Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::

Тип: `UInt64`

По умолчанию: `5368709120` (= 5 GiB)
## skipping_index_cache_size_ratio {#skipping_index_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше пропускающих индексов относительно общего размера кэша.

Тип: `Double`

По умолчанию: `0.5`
## skipping_index_cache_max_entries {#skipping_index_cache_max_entries}

Максимальное количество записей в кэше пропускающего индекса.

Тип: `UInt64`

По умолчанию: `10000000`
## io_thread_pool_queue_size {#io_thread_pool_queue_size}

Максимальное количество заданий, которые могут быть запланированы в пуле потоков ввода-вывода.

:::note
Значение `0` означает неограниченно.
:::

Тип: `UInt64`

По умолчанию: `10000`
## mark_cache_policy {#mark_cache_policy}

Имя политики кэша меток.

Тип: `String`

По умолчанию: `SLRU`
## mark_cache_size {#mark_cache_size}

Максимальный размер кэша для меток (индекс [`MergeTree`](/engines/table-engines/mergetree-family) семейства таблиц).

:::note
Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::

Тип: `UInt64`

По умолчанию: `5368709120`
## mark_cache_size_ratio {#mark_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в кэше меток относительно общего размера кэша.

Тип: `Double`

По умолчанию: `0.5`
## max_backup_bandwidth_for_server {#max_backup_bandwidth_for_server}

Максимальная скорость чтения в байтах в секунду для всех резервных копий на сервере. Ноль означает неограниченно.

Тип: `UInt64`

По умолчанию: `0`
## max_backups_io_thread_pool_free_size {#max_backups_io_thread_pool_free_size}

Если количество **бездействующих** потоков в пуле потоков ввода-вывода резервных копий превышает `max_backup_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занятые бездействующими потоками, и уменьшит размер пула. Потоки могут быть созданы снова, если это необходимо.

Тип: `UInt64`

По умолчанию: `0`
## max_backups_io_thread_pool_size {#max_backups_io_thread_pool_size}

ClickHouse использует потоки из пула потоков ввода-вывода резервных копий для выполнения операций ввода-вывода резервного копирования S3. `max_backups_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.

Тип: `UInt64`

По умолчанию: `1000`
## max_concurrent_queries {#max_concurrent_queries}

Лимит на общее количество одновременно выполняемых запросов. Обратите внимание, что также следует учитывать лимиты на запросы `INSERT` и `SELECT`, а также максимальное количество запросов для пользователей.

См. также:
- [`max_concurrent_insert_queries`](#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings/#max_concurrent_queries_for_all_users)

:::note

Значение `0` (по умолчанию) означает неограниченно.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся неизменными.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_concurrent_insert_queries {#max_concurrent_insert_queries}

Лимит на общее количество одновременно выполняемых запросов на вставку.

:::note

Значение `0` (по умолчанию) означает неограниченно.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся неизменными.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_concurrent_select_queries {#max_concurrent_select_queries}

Лимит на общее количество одновременно выполняемых запросов на выборку.

:::note

Значение `0` (по умолчанию) означает неограниченно.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся неизменными.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_waiting_queries {#max_waiting_queries}

Лимит на общее количество одновременно ожидающих запросов.
Выполнение ожидающего запроса заблокировано, пока требуемые таблицы загружаются асинхронно (см. [`async_load_databases`](#async_load_databases).

:::note
Ожидающие запросы не учитываются при проверке лимитов, управляемых следующими настройками:

- [`max_concurrent_queries`](#max_concurrent_queries)
- [`max_concurrent_insert_queries`](#max_concurrent_insert_queries)
- [`max_concurrent_select_queries`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_user`](/operations/server-configuration-parameters/settings#max_concurrent_select_queries)
- [`max_concurrent_queries_for_all_users`](/operations/settings/settings#max_concurrent_queries_for_all_users)

Это исправление сделано для того, чтобы избежать достижения этих лимитов сразу после запуска сервера.
:::

:::note

Значение `0` (по умолчанию) означает неограниченно.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно. Запросы, которые уже выполняются, останутся неизменными.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_connections {#max_connections}

Максимальное количество соединений с сервером.

Тип: `Int32`

По умолчанию: `1024`
## max_io_thread_pool_free_size {#max_io_thread_pool_free_size}

Если количество **бездействующих** потоков в пуле потоков ввода-вывода превышает `max_io_thread_pool_free_size`, ClickHouse освободит ресурсы, занятые бездействующими потоками, и уменьшит размер пула. Потоки могут быть созданы снова, если это необходимо.

Тип: `UInt64`

По умолчанию: `0`
## max_io_thread_pool_size {#max_io_thread_pool_size}

ClickHouse использует потоки из пула потоков ввода-вывода для выполнения некоторых операций ввода-вывода (например, для взаимодействия с S3). `max_io_thread_pool_size` ограничивает максимальное количество потоков в пуле.

Тип: `UInt64`

По умолчанию: `100`
## max_local_read_bandwidth_for_server {#max_local_read_bandwidth_for_server}

Максимальная скорость локальных чтений в байтах в секунду.

:::note
Значение `0` означает неограниченно.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_local_write_bandwidth_for_server {#max_local_write_bandwidth_for_server}

Максимальная скорость локальных записей в байтах в секунду.

:::note
Значение `0` означает неограниченно.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_partition_size_to_drop {#max_partition_size_to_drop}

Ограничение на удаление партиций.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает [`max_partition_size_to_drop`](#max_partition_size_to_drop) (в байтах), вы не можете удалить партицию с помощью запроса [DROP PARTITION](../../sql-reference/statements/alter/partition.md#drop-partitionpart).
Эта настройка не требует перезагрузки сервера ClickHouse для применения. Другой способ отключить ограничение - создать файл `<clickhouse-path>/flags/force_drop_table`.

:::note
Значение `0` означает, что вы можете удалять партиции без каких-либо ограничений.

Это ограничение неRestricts таблицы drop и truncate table, см. [max_table_size_to_drop](#max_table_size_to_drop)
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
Значение `0` (по умолчанию) означает неограниченно.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_remote_write_network_bandwidth_for_server {#max_remote_write_network_bandwidth_for_server}

Максимальная скорость обмена данными по сети в байтах в секунду для записи.

:::note
Значение `0` (по умолчанию) означает неограниченно.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_server_memory_usage {#max_server_memory_usage}

Лимит на общее использование памяти.
Значение [`max_server_memory_usage`](#max_server_memory_usage) по умолчанию вычисляется как `memory_amount * max_server_memory_usage_to_ram_ratio`.

:::note
Значение `0` (по умолчанию) означает неограниченно.
:::

Тип: `UInt64`

По умолчанию: `0`
## max_server_memory_usage_to_ram_ratio {#max_server_memory_usage_to_ram_ratio}

То же самое, что и [`max_server_memory_usage`](#max_server_memory_usage), но в соотношении к физической ОЗУ. Позволяет уменьшить использование памяти на системах с низкой памятью.

На хостах с низкой ОЗУ и свопом, возможно, необходимо задать значение [`max_server_memory_usage_to_ram_ratio`](#max_server_memory_usage_to_ram_ratio) больше 1.

:::note
Значение `0` означает неограниченно.
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

Интервал в секундах, в течение которого максимальное разрешенное потребление памяти сервером настраивается соответствующим порогом в cgroups.

Чтобы отключить наблюдатель cgroup, установите это значение в `0`.

Смотрите настройки:
- [`cgroup_memory_watcher_hard_limit_ratio`](#cgroup_memory_watcher_hard_limit_ratio)
- [`cgroup_memory_watcher_soft_limit_ratio`](#cgroup_memory_watcher_soft_limit_ratio).

Тип: `UInt64`

По умолчанию: `15`
## cgroup_memory_watcher_hard_limit_ratio {#cgroup_memory_watcher_hard_limit_ratio}

Указывает "жесткий" порог потребления памяти процесса сервера в соответствии с cgroups, после которого максимальное потребление памяти сервера настраивается на значение порога.

Смотрите настройки:
- [`cgroups_memory_usage_observer_wait_time`](#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_soft_limit_ratio`](#cgroup_memory_watcher_soft_limit_ratio)

Тип: `Double`

По умолчанию: `0.95`
## cgroup_memory_watcher_soft_limit_ratio {#cgroup_memory_watcher_soft_limit_ratio}

Указывает "мягкий" порог потребления памяти процесса сервера в соответствии с cgroups, после которого арены в jemalloc очищаются.

Смотрите настройки:
- [`cgroups_memory_usage_observer_wait_time`](#cgroups_memory_usage_observer_wait_time)
- [`cgroup_memory_watcher_hard_limit_ratio`](#cgroup_memory_watcher_hard_limit_ratio)

Тип: `Double`

По умолчанию: `0.9`
## max_database_num_to_warn {#max_database_num_to_warn}

Если количество подключенных баз данных превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_database_num_to_warn>50</max_database_num_to_warn>
```

По умолчанию: `1000`
## max_table_num_to_warn {#max_table_num_to_warn}

Если количество подключенных таблиц превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_table_num_to_warn>400</max_table_num_to_warn>
```

По умолчанию: `5000`
## max_view_num_to_warn {#max_view_num_to_warn}

Если количество подключенных представлений превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_view_num_to_warn>400</max_view_num_to_warn>
```

Тип: `UInt64`

По умолчанию: `10000`
## max_dictionary_num_to_warn {#max_dictionary_num_to_warn}

Если количество подключенных словарей превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_dictionary_num_to_warn>400</max_dictionary_num_to_warn>
```

Тип: `UInt64`

По умолчанию: `1000`
## max_part_num_to_warn {#max_part_num_to_warn}

Если количество активных частей превышает указанное значение, сервер ClickHouse добавит предупреждающие сообщения в таблицу `system.warnings`.

**Пример**

```xml
<max_part_num_to_warn>400</max_part_num_to_warn>
```

Тип: `UInt64`

По умолчанию: `100000`
## max_table_num_to_throw {#max_table_num_to_throw}

Если количество таблиц больше этого значения, сервер вызовет исключение.

Следующие таблицы не учитываются:
- представление
- удаленный
- словарь
- системный

Учитываются только таблицы для движков баз данных:
- Atomic
- Обычный
- Реплицированный
- Ленивый

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**
```xml
<max_table_num_to_throw>400</max_table_num_to_throw>
```

Тип: `UInt64`

По умолчанию: `0`
## max_replicated_table_num_to_throw {#max_replicated_table_num_to_throw}

Если количество реплицированных таблиц превышает это значение, сервер вызовет исключение.

Учитываются только таблицы для движков баз данных:
- Atomic
- Обычный
- Реплицированный
- Ленивый

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**
```xml
<max_replicated_table_num_to_throw>400</max_replicated_table_num_to_throw>
```

Тип: `UInt64`

По умолчанию: `0`
## max_dictionary_num_to_throw {#max_dictionary_num_to_throw}

Если количество словарей превышает это значение, сервер вызовет исключение.

Учитываются только таблицы для движков баз данных:
- Atomic
- Обычный
- Реплицированный
- Ленивый

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**
```xml
<max_dictionary_num_to_throw>400</max_dictionary_num_to_throw>
```

Тип: `UInt64`

По умолчанию: `0`
## max_view_num_to_throw {#max_view_num_to_throw}

Если количество представлений превышает это значение, сервер вызовет исключение.

Учитываются только таблицы для движков баз данных:
- Atomic
- Обычный
- Реплицированный
- Ленивый

:::note
Значение `0` означает отсутствие ограничения.
:::

**Пример**
```xml
<max_view_num_to_throw>400</max_view_num_to_throw>
```

Тип: `UInt64`

По умолчанию: `0`
## max_database_num_to_throw {#max-table-num-to-throw}

Если количество баз данных превышает это значение, сервер вызовет исключение.

:::note
Значение `0` (по умолчанию) означает отсутствие ограничения.
:::

**Пример**

```xml
<max_database_num_to_throw>400</max_database_num_to_throw>
```

Тип: `UInt64`

По умолчанию: `0`
## max_temporary_data_on_disk_size {#max_temporary_data_on_disk_size}

Максимальное количество хранилища, которое может быть использовано для внешней агрегации, соединений или сортировки.
Запросы, которые превышают этот лимит, завершатся с исключением.

:::note
Значение `0` означает неограниченно.
:::

См. также:
- [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#max_temporary_data_on_disk_size_for_user)
- [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query)

Тип: `UInt64`

По умолчанию: `0`
## max_thread_pool_free_size {#max_thread_pool_free_size}

Если количество **бездействующих** потоков в Глобальном пуле потоков больше, чем [`max_thread_pool_free_size`](#max_thread_pool_free_size), то ClickHouse освобождает ресурсы, занятые некоторыми потоками, и размер пула уменьшается. Потоки могут быть созданы снова, если это необходимо.

**Пример**

```xml
<max_thread_pool_free_size>1200</max_thread_pool_free_size>
```

Тип: `UInt64`

По умолчанию: `0`
## max_thread_pool_size {#max_thread_pool_size}

ClickHouse использует потоки из Глобального пула потоков для обработки запросов. Если нет свободного потока для обработки запроса, то в пуле создается новый поток. `max_thread_pool_size` ограничивает максимальное количество потоков в пуле.

**Пример**

```xml
<max_thread_pool_size>12000</max_thread_pool_size>
```

Тип: `UInt64`

По умолчанию: `10000`
```yaml
title: 'Настройки ClickHouse'
sidebar_label: 'Настройки ClickHouse'
keywords: ['ClickHouse', 'настройки', 'база данных']
description: 'Настройки и параметры для ClickHouse.'
```

## mmap_cache_size {#mmap_cache_size}

Устанавливает размер кэша (в байтах) для отображаемых файлов. Эта настройка позволяет избежать частых вызовов открытия/закрытия (которые очень затратные из-за последующих ошибок страницы) и повторно использовать отображения из нескольких потоков и запросов. Значение настройки — это количество отображаемых областей (обычно равно количеству отображаемых файлов).

Объем данных в отображаемых файлах можно отслеживать в следующих системных таблицах с использованием следующих метрик:

| Системная таблица                                                                                                                                                                                                                                                                                                                                                       | Метрика                                                                                                   |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [`system.metrics`](/operations/system-tables/metrics) и [`system.metric_log`](/operations/system-tables/metric_log)                                                                                                                                                                                                                              | `MMappedFiles` и `MMappedFileBytes`                                                                    |
| [`system.asynchronous_metrics_log`](/operations/system-tables/asynchronous_metric_log)                                                                                                                                                                                                                                                                     | `MMapCacheCells`                                                                                         |
| [`system.events`](/operations/system-tables/events), [`system.processes`](/operations/system-tables/processes), [`system.query_log`](/operations/system-tables/query_log), [`system.query_thread_log`](/operations/system-tables/query_thread_log), [`system.query_views_log`](/operations/system-tables/query_views_log)  | `CreatedReadBufferMMap`, `CreatedReadBufferMMapFailed`, `MMappedFileCacheHits`, `MMappedFileCacheMisses` |

:::note
Объем данных в отображаемых файлах не потребляет память напрямую и не учитывается в использовании памяти запросами или сервером — потому что эту память можно сбросить, подобно кэшу страниц ОС. Кэш сбрасывается (файлы закрываются) автоматически при удалении старых частей в таблицах семейства MergeTree, также он может быть сброшен вручную с помощью запроса `SYSTEM DROP MMAP CACHE`.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::

Тип: `UInt64`

По умолчанию: `1000`
## restore_threads {#restore_threads}

Максимальное количество потоков для выполнения запросов RESTORE.

Тип: UInt64

По умолчанию: `16`
## show_addresses_in_stack_traces {#show_addresses_in_stack_traces}

Если установлено в true, будут отображаться адреса в трассировках стека.

Тип: `Bool`

По умолчанию: `1`
## shutdown_wait_unfinished_queries {#shutdown_wait_unfinished_queries}

Если установлено в true, ClickHouse будет ожидать завершения запущенных запросов перед отключением.

Тип: `Bool`

По умолчанию: `0`
## table_engines_require_grant {#table_engines_require_grant}

Если установлено в true, пользователям требуется предоставление прав для создания таблицы с конкретным движком, например, `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию, для обеспечения обратной совместимости создание таблицы с конкретным движком игнорирует предоставление прав, однако вы можете изменить это поведение, установив значение в true.
:::

Тип: `Bool`

По умолчанию: `false`
## temporary_data_in_cache {#temporary_data_in_cache}

С этим параметром временные данные будут храниться в кэше для конкретного диска.
В этом разделе вы должны указать имя диска с типом `cache`.
В этом случае кэш и временные данные будут использовать одно и то же пространство, и кэш диска может быть сброшен для создания временных данных.

:::note
Можно использовать только один параметр для конфигурации хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
:::

**Пример**

Как кэш для `local_disk`, так и временные данные будут храниться в `/tiny_local_cache` на файловой системе, управляемой `tiny_local_cache`.

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

Максимальное количество задач, которые могут быть запланированы в глобальном пуле потоков. Увеличение размера очереди приводит к большему потреблению памяти. Рекомендуется поддерживать это значение равным [`max_thread_pool_size`](#max_thread_pool_size).

:::note
Значение `0` означает неограниченное.
:::

**Пример**

```xml
<thread_pool_queue_size>12000</thread_pool_queue_size>
```

Тип: UInt64

По умолчанию: `10000`
## tmp_policy {#tmp_policy}

Политика хранения временных данных. Для получения дополнительной информации см. [MergeTree Table Engine](/engines/table-engines/mergetree-family/mergetree) документацию.

:::note
- Можно использовать только одну опцию для настройки хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- `move_factor`, `keep_free_space_bytes`, `max_data_part_size_bytes` игнорируются.
- Политика должна содержать ровно *один объем* с *локальными* дисками.
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

Имя политики не сжатого кэша.

Тип: String

По умолчанию: `SLRU`
## uncompressed_cache_size {#uncompressed_cache_size}

Максимальный размер кэша (в байтах) для не сжатых данных, используемых движками таблиц из семейства MergeTree.

Существует один общий кэш для сервера. Память выделяется по мере необходимости. Кэш используется, если параметр use_uncompressed_cache включен.

Не сжатый кэш выгоден для очень коротких запросов в отдельных случаях.

:::note
Значение `0` означает отключено.

Эту настройку можно изменить во время выполнения, и она вступит в силу немедленно.
:::

Тип: UInt64

По умолчанию: `0`
## uncompressed_cache_size_ratio {#uncompressed_cache_size_ratio}

Размер защищенной очереди (в случае политики SLRU) в не сжатом кэше относительно общего размера кэша.

Тип: Double

По умолчанию: `0.5`
## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

Интервал в секундах перед перезагрузкой встроенных словарей.

ClickHouse перезагружает встроенные словари каждые x секунд. Это позволяет редактировать словари "на лету", не перезапуская сервер.

**Пример**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

Тип: UInt64

По умолчанию: `3600`
## compression {#compression}

Настройки сжатия данных для таблиц с движком [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

:::note
Мы рекомендуем не менять это, если вы только начали использовать ClickHouse.
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
- `method` – Метод сжатия. Допустимые значения: `lz4`, `lz4hc`, `zstd`, `deflate_qpl`.
- `level` – Уровень сжатия. См. [Codecs](/sql-reference/statements/create/table#general-purpose-codecs).

:::note
Вы можете настроить несколько секций `<case>`.
:::

**Действия, когда условия выполнены**:

- Если часть данных соответствует установленному набору условий, ClickHouse использует указанный метод сжатия.
- Если часть данных соответствует нескольким наборам условий, ClickHouse использует первый подходящий набор условий.

:::note
Если для части данных не выполнено ни одно условие, ClickHouse использует сжатие `lz4`.
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

Настраивает команду для получения ключа, который будет использоваться кодеками [шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должны быть записаны в переменные окружения или установлены в файле конфигурации.

Ключи могут быть хекс или строкой длиной 16 байтов.

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
Не рекомендуется хранить ключи в файле конфигурации. Это небезопасно. Вы можете переместить ключи в отдельный файл конфигурации на безопасном диске и выделить символическую ссылку на этот файл конфигурации в папке `config.d/`.
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

Здесь `current_key_id` устанавливает текущий ключ для шифрования, а все указанные ключи можно использовать для расшифровки.

Каждый из этих методов можно применять для нескольких ключей:

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

Также пользователи могут добавить nonce, который должен иметь длину 12 байтов (по умолчанию процессы шифрования и расшифровки используют nonce, состоящий из нулевых байтов):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Или его можно задать в шестнадцатеричном формате:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
Все вышеперечисленное может применяться к `aes_256_gcm_siv` (но ключ должен быть длиной 32 байта).
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

Чтобы отключить настройку `error_log`, необходимо создать следующий файл `/etc/clickhouse-server/config.d/disable_error_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## custom_settings_prefixes {#custom_settings_prefixes}

Список префиксов для [настраиваемых настроек](/operations/settings/query-level#custom_settings). Префиксы должны быть разделены запятыми.

**Пример**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**См. также**

- [Настраиваемые настройки](/operations/settings/query-level#custom_settings)
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

По умолчанию: `1073741824`
## database_atomic_delay_before_drop_table_sec {#database_atomic_delay_before_drop_table_sec}

Задержка, в течение которой удалённая таблица может быть восстановлена с использованием команды [`UNDROP`](/sql-reference/statements/undrop.md). Если `DROP TABLE` выполнен с модификатором `SYNC`, настройка игнорируется.
По умолчанию для этой настройки стоит `480` (8 минут).

По умолчанию: `480`
## database_catalog_unused_dir_hide_timeout_sec {#database_catalog_unused_dir_hide_timeout_sec}

Параметр задачи, которая очищает мусор из директории `store/`.
Если какая-либо подсистема не используется `clickhouse-server` и эта директория не была изменена за последние
[`database_catalog_unused_dir_hide_timeout_sec`](#database_catalog_unused_dir_hide_timeout_sec) секунд, задача "скроет" эту директорию, убрав все права доступа. Это также работает для директорий, которые `clickhouse-server` не ожидает увидеть внутри `store/`.

:::note
Значение `0` означает "немедленно".
:::

По умолчанию: `3600` (1 час)
## database_catalog_unused_dir_rm_timeout_sec {#database_catalog_unused_dir_rm_timeout_sec}

Параметр задачи, которая очищает мусор из директории `store/`.
Если какая-либо подсистема не используется `clickhouse-server`, и она была ранее "скрыта"
(см. [database_catalog_unused_dir_hide_timeout_sec](#database_catalog_unused_dir_hide_timeout_sec))
и эта директория не была изменена за последние
[`database_catalog_unused_dir_rm_timeout_sec`](#database_catalog_unused_dir_rm_timeout_sec) секунд, задача удалит эту директорию.
Это также работает для директорий, которые `clickhouse-server` не ожидает увидеть внутри `store/`.

:::note
Значение `0` означает "никогда". Значение по умолчанию соответствует 30 дням.
:::

По умолчанию: `2592000` (30 дней).
## database_catalog_drop_error_cooldown_sec {#database_catalog_drop_error_cooldown_sec}

В случае неудачного удаления таблицы ClickHouse будет ждать этот тайм-аут перед повторной попыткой операции.

Тип: [`UInt64`](../../sql-reference/data-types/int-uint.md)

По умолчанию: `5`
## database_catalog_drop_table_concurrency {#database_catalog_drop_table_concurrency}

Размер пула потоков, используемого для удаления таблиц.

Тип: [`UInt64`](../../sql-reference/data-types/int-uint.md)

По умолчанию: `16`
## database_catalog_unused_dir_cleanup_period_sec {#database_catalog_unused_dir_cleanup_period_sec}

Параметр задачи, которая очищает мусор из директории `store/`.
Устанавливает период расписания задачи.

:::note
Значение `0` означает "никогда". Значение по умолчанию соответствует 1 дню.
:::

По умолчанию: `86400` (1 день).
## default_profile {#default_profile}

Профиль настроек по умолчанию. Профили настроек расположены в файле, указанном в настройке `user_config`.

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
- Путь может содержать подстановочные знаки \* и ?.

См. также:
- "[Словари](../../sql-reference/dictionaries/index.md)".

**Пример**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## user_defined_executable_functions_config {#user_defined_executable_functions_config}

Путь к файлу конфигурации для выполняемых определённых пользователем функций.

Путь:

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать подстановочные знаки \* и ?.

См. также:
- "[Выполняемые функции, определенные пользователем](/sql-reference/functions/udf#executable-user-defined-functions).".

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## dictionaries_lazy_load {#dictionaries_lazy_load}

Ленивая загрузка словарей.

- Если `true`, то каждый словарь загружается при первом использовании. Если загрузка не удалась, функция, использующая словарь, вызывает исключение.
- Если `false`, тогда сервер загружает все словари при запуске.

:::note
Сервер будет ждать на старте, пока все словари закончат свою загрузку, прежде чем получать какие-либо соединения
(исключение: если [`wait_dictionaries_load_at_startup`](#wait_dictionaries_load_at_startup) установлен в `false`).
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
- `interval` – Интервал для отправки, в секундах.
- `timeout` – Время ожидания для отправки данных, в секундах.
- `root_path` – Префикс для ключей.
- `metrics` – Отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Отправка данных дельты, накопленных за период времени, из таблицы [system.events](/operations/system-tables/events).
- `events_cumulative` – Отправка кумулятивных данных из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Отправка данных из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Вы можете настроить несколько `<graphite>` клауз. Например, вы можете использовать это для отправки различных данных через разные интервалы.

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
## google_protos_path {#google_protos_path}

Определяет директорию, содержащую proto файлы для типов Protobuf.

Пример:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## http_handlers {#http_handlers}

Разрешает использовать настраиваемые HTTP-обработчики.
Чтобы добавить новый http-обработчик, просто добавьте новое `<rule>`.
Правила проверяются сверху вниз, как определено, и первая совпавшая запустит обработчик.

Следующие настройки могут быть настроены с помощью подпунктов:

| Подпункты             | Определение                                                                                                                                        |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | Для сопоставления URL запроса вы можете использовать префикс 'regex:' для использования рег. выражений (по желанию)                                 |
| `methods`            | Для сопоставления методов запроса вы можете использовать запятые для разделения нескольких совпадений методов (по желанию)                           |
| `headers`            | Для сопоставления заголовков запроса сопоставьте каждый дочерний элемент (имя дочернего элемента — имя заголовка), вы можете использовать 'regex:' префикс для использования рег. выражений (по желанию) |
| `handler`            | Обработчик запроса                                                                                                                               |
| `empty_query_string` | Проверить, что в URL нет строки запроса                                                                                                         |

`handler` содержит следующие настройки, которые могут быть настроены с помощью подпунктов:

| Подпункты           | Определение                                                                                                                                                            |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | Локация для перенаправления                                                                                                                                               |
| `type`             | Поддерживаемые типы: static, dynamic_query_handler, predefined_query_handler, redirect                                                                                    | 
| `status`           | Используйте с типом static, код состояния ответа                                                                                                                        |
| `query_param_name` | Используйте с типом dynamic_query_handler, извлекает и выполняет значение, соответствующее значению `<query_param_name>` в параметрах HTTP-запроса                         |
| `query`            | Используйте с типом predefined_query_handler, выполняет запрос, когда вызывается обработчик                                                                                 |
| `content_type`     | Используйте с типом static, тип содержимого ответа                                                                                                                       |
| `response_content` | Используйте с типом static, содержимое ответа, отправляемое клиенту, при использовании префикса 'file://' или 'config://', найти содержимое из файла или конфигурации, отправим клиенту |

Вместе с списком правил, вы можете указать `<defaults/>`, которые укажут на включение всех стандартных обработчиков.

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

- Если указан `https_port`, необходимо настроить [OpenSSL](#openssl).
- Если указан `http_port`, конфигурация OpenSSL игнорируется, даже если она установлена.

**Пример**

```xml
<https_port>9999</https_port>
```
## http_server_default_response {#http_server_default_response}

Страница, которая отображается по умолчанию, когда вы обращаетесь к HTTP(s) серверу ClickHouse.
По умолчанию значение — "Ok." (с переводом строки в конце)

**Пример**

Открывает `https://tabix.io/` при доступе к `http://localhost: http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## http_options_response {#http_options_response}

Используется для добавления заголовков к ответу на HTTP-запрос `OPTIONS`. 
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
## hsts_max_age {#hsts_max_age}

Истекшее время для HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. Если вы установите положительное число, HSTS будет включен, а max-age — это число, которое вы установили.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## mlock_executable {#mlock_executable}

Выполнить `mlockall` после запуска, чтобы уменьшить задержку первых запросов и предотвратить вытеснение выполняемого файла clickhouse под высокой нагрузкой ввода-вывода.

:::note
Рекомендуется включить эту опцию, но она приведет к увеличению времени запуска до нескольких секунд.
Имейте в виду, что эта настройка не будет работать без возможности "CAP_IPC_LOCK".
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```
## include_from {#include_from}

Путь к файлу с подстановками. Поддерживаются как XML, так и YAML форматы.

Для получения дополнительной информации см. раздел "[Файлы конфигурации](/operations/configuration-files)".

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## interserver_listen_host {#interserver_listen_host}

Ограничение на хосты, которые могут обмениваться данными между серверами ClickHouse.
Если используется Keeper, то такая же мера ограничения будет применяться для связи между разными экземплярами Keeper.

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

Имя хоста, которое могут использовать другие серверы для доступа к этому серверу.

Если опущено, оно определяется так же, как и команда `hostname -f`.

Полезно для выхода за рамки конкретного сетевого интерфейса.

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

Похоже на [`interserver_http_host`](#interserver_http_host), за исключением того, что это имя хоста может быть использовано другими серверами для доступа к этому серверу через `HTTPS`.

**Пример**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_http_credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики с помощью этих учетных данных. 
`interserver_http_credentials` должны быть одинаковыми для всех реплик в кластере.

:::note
- По умолчанию, если раздел `interserver_http_credentials` пропущен, аутентификация не используется во время репликации.
- Параметры `interserver_http_credentials` не относятся к учетным данным клиента ClickHouse [конфигурации](../../interfaces/cli.md#configuration_files).
- Эти учетные данные общие для репликации по `HTTP` и `HTTPS`.
:::

Следующие настройки могут быть настроены с помощью под-тегов:

- `user` — Имя пользователя.
- `password` — Пароль.
- `allow_empty` — Если `true`, то другим репликам разрешается подключаться без аутентификации, даже если учетные данные установлены. Если `false`, то соединения без аутентификации отклоняются. По умолчанию: `false`.
- `old` — Содержит старые `user` и `password`, используемые во время ротации учетных данных. Можно указать несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию учетных данных межсерверной аутентификации без остановки всех реплик одновременно для обновления их конфигурации. Учетные данные могут быть изменены в несколько шагов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволяет подключения с аутентификацией и без нее.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите `allow_empty` в `false` или удалите эту настройку. Это делает аутентификацию с новыми учетными данными обязательной.

Чтобы изменить существующие учетные данные, переместите имя пользователя и пароль в раздел `interserver_http_credentials.old` и обновите `user` и `password` новыми значениями. В этот момент сервер использует новые учетные данные для подключения к другим репликам и принимает соединения как с новыми, так и со старыми учетными данными.

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
## keep_alive_timeout {#keep_alive_timeout}

Количество секунд, которые ClickHouse ждет входящих запросов перед закрытием соединения.

**Пример**

```xml
<keep_alive_timeout>10</keep_alive_timeout>
```
## max_keep_alive_requests {#max_keep_alive_requests}

Максимальное количество запросов через одно соединение keep-alive, после чего оно будет закрыто сервером ClickHouse.

**Пример**

```xml
<max_keep_alive_requests>10</max_keep_alive_requests>
```
## ldap_servers {#ldap_servers}

Список серверов LDAP с их параметрами подключения здесь для:
- использования их в качестве аутентификаторов для специализированных локальных пользователей, у которых указан механизм аутентификации 'ldap' вместо 'password'
- использования их в качестве удаленных пользовательских каталогов.

Следующие настройки могут быть настроены с помощью под-тегов:

| Настройка                     | Описание                                                                                                                                                                                                                                                                                                                                                                                            |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                        | Имя хоста или IP сервера LDAP, этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                                                                                  |
| `port`                        | Порт сервера LDAP, по умолчанию 636, если `enable_tls` установлен в true, иначе 389.                                                                                                                                                                                                                                                                                                               |
| `bind_dn`                     | Шаблон, используемый для построения DN для привязки. Результирующий DN будет построен путем замены всех подстрок `\{user_name\}` шаблона на фактическое имя пользователя во время каждой попытки аутентификации.                                                                                                                                                                                            |
| `user_dn_detection`           | Раздел с параметрами поиска LDAP для определения фактического DN пользователя, к которому подключен пользователь. Это в основном используется в фильтрах поиска для дальнейшего сопоставления ролей, когда сервер является Active Directory. Результирующий DN пользователя будет использоваться при замене подстрок `\{user_dn\}` где это разрешено. По умолчанию, DN пользователя устанавливается равным DN привязки, но после выполнения поиска будет обновлен до фактического обнаруженного значения DN пользователя. |
| `verification_cooldown`       | Период времени, в секундах, после успешной попытки привязки, в течение которого пользователь будет считаться успешно аутентифицированным для всех последующих запросов без обращения к серверу LDAP. Укажите `0` (по умолчанию), чтобы отключить кэширование и заставить обращаться к серверу LDAP для каждого запроса аутентификации.                                                                              |
| `enable_tls`                  | Флаг, включающий использование защищенного соединения с сервером LDAP. Укажите `no` для протокола в открытом виде (`ldap://`) (не рекомендуется). Укажите `yes` для протокола LDAP через SSL/TLS (`ldaps://`) (рекомендуется, по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (протокол в открытом виде (`ldap://`), обновленный до TLS).                                             |
| `tls_minimum_protocol_version`| Минимальная версия протокола SSL/TLS. Допустимые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (по умолчанию).                                                                                                                                                                                                                                                                            |
| `tls_require_cert`            | Поведение проверки сертификата SSL/TLS. Допустимые значения: `never`, `allow`, `try`, `demand` (по умолчанию).                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`               | Путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_key_file`                | Путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                                                   |
| `tls_ca_cert_file`            | Путь к файлу сертификата CA.                                                                                                                                                                                                                                                                                                                                                                      |
| `tls_ca_cert_dir`             | Путь к директории, содержащей сертификаты CA.                                                                                                                                                                                                                                                                                                                                                   |
| `tls_cipher_suite`            | допустимый набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                                                      |

Настройка `user_dn_detection` может быть настроена с помощью под-тегов:

| Настройка        | Описание                                                                                                                                                                                                                                                                                                                                  |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`        | Шаблон, используемый для построения базового DN для поиска LDAP. Результирующий DN будет построен путем замены всех подстрок `\{user_name\}` и '\{bind_dn\}' шаблона на фактическое имя пользователя и DN привязки во время поиска LDAP.                                                                                                  |
| `scope`          | Область поиска LDAP. Допустимые значения: `base`, `one_level`, `children`, `subtree` (по умолчанию).                                                                                                                                                                                                                                  |
| `search_filter`  | Шаблон, используемый для построения фильтра поиска для поиска LDAP. Результирующий фильтр будет построен путем замены всех подстрок `\{user_name\}`, `\{bind_dn\}` и `\{base_dn\}` шаблона на фактическое имя пользователя, DN привязки и базовый DN во время поиска LDAP. Заметьте, что специальные символы должны быть правильно экранированы в XML. |

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
## listen_host {#listen_host}

Ограничение на хосты, с которых могут поступать запросы. Если вы хотите, чтобы сервер отвечал на все из них, укажите `::`.

Примеры:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_try {#listen_try}

Сервер не выйдет, если сети IPv6 или IPv4 недоступны во время попытки слушать.

**Пример**

```xml
<listen_try>0</listen_try>
```
## listen_reuse_port {#listen_reuse_port}

Разрешить нескольким серверам слушать на одном адресе: порту. Запросы будут направлены к случайному серверу операционной системой. Включение этой настройки не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

По умолчанию:
## listen_backlog {#listen_backlog}

Очередь (размер очереди ожидающих соединений) сокета для прослушивания. Значение по умолчанию `4096` такое же, как у linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не нужно изменять, поскольку:
- Значение по умолчанию достаточно велико,
- Для принятия соединений клиентов сервер имеет отдельный поток.

Так что, даже если у вас `TcpExtListenOverflows` (из `nstat`) не равно нулю и этот счетчик растет для сервера ClickHouse, это не означает, что это значение нужно увеличить, так как:
- Обычно, если `4096` недостаточно, это показывает некоторые внутренние проблемы масштабирования ClickHouse, поэтому лучше сообщить о проблеме.
- Это не означает, что сервер может обрабатывать больше соединений позже (и даже если бы и мог, в этот момент клиенты могут уйти или отключиться).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```
## logger {#logger}

Местоположение и формат лог-сообщений.

**Ключи**:

| Ключ                       | Описание                                                                                                                                                                         |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                    | Уровень логирования. Допустимые значения: `none` (отключить ведение журнала), `fatal`, `critical`, `error`, `warning`, `notice`, `information`,`debug`, `trace`, `test`       |
| `log`                      | Путь к файлу журнала.                                                                                                                                                           |
| `errorlog`                 | Путь к файлу журнала ошибок.                                                                                                                                                     |
| `size`                     | Политика ротации: Максимальный размер файлов журнала в байтах. Как только размер файла журнала превышает этот лимит, он переименовывается и архивируется, и создается новый файл журнала.                  |
| `count`                    | Политика ротации: Сколько исторических файлов журнала ClickHouse хранится максимум.                                                                                           |
| `stream_compress`          | Сжимать сообщения журнала с помощью LZ4. Установите в `1` или `true`, чтобы включить.                                                                                          |
| `console`                  | Не записывать сообщения журнала в файлы журнала, а вместо этого выводить их в консоль. Установите в `1` или `true`, чтобы включить. По умолчанию `1`, если ClickHouse не работает в режиме демона, `0` в противном случае. |
| `console_log_level`        | Уровень журнала для консольного вывода. По умолчанию — `level`.                                                                                                                                                               |
| `formatting`               | Формат журнала для консольного вывода. В настоящее время поддерживается только `json`                                                                                                |
| `use_syslog`               | Также перенаправить вывод журнала в syslog.                                                                                                                                          |
| `syslog_level`             | Уровень журнала для записи в syslog.                                                                                                                                                  |

**Спецификаторы формата журнала**

Имена файлов в путях `log` и `errorLog` поддерживают ниже перечисленные спецификаторы формата для результирующего имени файла (часть директории не поддерживает их).

Столбец "Пример" показывает вывод на `2023-07-06 18:32:07`.

| Спецификатор | Описание                                                                                                                     | Пример                  |
|--------------|-----------------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | Литеральный %                                                                                                             | `%`                        |
| `%n`         | Символ новой строки                                                                                                        |                          |
| `%t`         | Символ горизонтальной табуляции                                                                                            |                          |
| `%Y`         | Год в десятичном формате, например 2017                                                                                    | `2023`                     |
| `%y`         | Последние 2 цифры года в десятичном формате (диапазон [00,99])                                                             | `23`                       |
| `%C`         | Первые 2 цифры года в десятичном формате (диапазон [00,99])                                                              | `20`                       |
| `%G`         | Четырехзначный [неделя ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, который содержит указанную неделю. Обычно полезен только с `%V` | `2023`       |
| `%g`         | Последние 2 цифры [года, основанного на неделях ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, который содержит указанную неделю. | `23`         |
| `%b`         | Сокращенное название месяца, например, окт (в зависимости от локали)                                                     | `Jul`                      |
| `%h`         | Синоним %@b                                                                                                           | `Jul`                      |
| `%B`         | Полное название месяца, например, октябрь (в зависимости от локали)                                                         | `July`                     |
| `%m`         | Месяц в десятичном формате (диапазон [01,12])                                         | `07`                       |
| `%U`         | Номер недели в году в десятичном формате (воскресенье — первый день недели) (диапазон [00,53])                          | `27`                       |
| `%W`         | Номер недели в году в десятичном формате (понедельник — первый день недели) (диапазон [00,53])                          | `27`                       |
| `%V`         | Номер ISO 8601 недели (диапазон [01,53])                                                                                | `27`                       |
| `%j`         | Номер дня в году в десятичном формате (диапазон [001,366])                                                               | `187`                      |
| `%d`         | День месяца в виде десятичного числа с нулями (диапазон [01,31]). Однозначное число предшествует нулю.                  | `06`                       |
| `%e`         | День месяца в виде десятичного числа с пробелами (диапазон [1,31]). Однозначное число предшествует пробелу.                         | `&nbsp; 6`                 |
| `%a`         | Сокращенное название дня недели, например, пт (в зависимости от локали)                                                   | `Thu`                      |
| `%A`         | Полное название дня недели, например, пятница (в зависимости от локали)                                                      | `Thursday`                 |
| `%w`         | День недели в виде целого числа с воскресеньем как 0 (диапазон [0-6])                                                   | `4`                        |
| `%u`         | День недели в десятичном формате, где понедельник — 1 (формат ISO 8601) (диапазон [1-7])                                        | `4`                        |
| `%H`         | Час в десятичном формате, 24-часовой формат (диапазон [00-23])                                                            | `18`                       |
| `%I`         | Час в десятичном формате, 12-часовой формат (диапазон [01,12])                                                            | `06`                       |
| `%M`         | Минута в десятичном формате (диапазон [00,59])                                                                         | `32`                       |
| `%S`         | Секунда в десятичном формате (диапазон [00,60])                                                                         | `07`                       |
| `%c`         | Стандартная строка даты и времени, например, Вс Окт 17 04:41:13 2010 (в зависимости от локали)                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованное представление даты (в зависимости от локали)                                                                  | `07/06/23`                 |
| `%X`         | Локализованное представление времени, например, 18:40:20 или 6:40:20 PM (в зависимости от локали)                                   | `18:32:07`                 |
| `%D`         | Краткая дата MM/DD/YY, эквивалентная %m/%d/%y                                                                                | `07/06/23`                 |
| `%F`         | Краткая дата YYYY-MM-DD, эквивалентная %Y-%m-%d                                                                               | `2023-07-06`               |
| `%r`         | Локализованное время 12-часового формата (в зависимости от локали)                                                            | `06:32:07 PM`              |
| `%R`         | Эквивалентно "%H:%M"                                                                                                        | `18:32`                    |
| `%T`         | Эквивалентно "%H:%M:%S" (формат времени ISO 8601)                                                                           | `18:32:07`                 |
| `%p`         | Локализованное обозначение a.m. или p.m. (в зависимости от локали)                                                         | `PM`                       |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430) или никаких символов, если информация о временной зоне недоступна                    | `+0800`                    |
| `%Z`         | Название временной зоны, зависящее от локали, или аббревиатура, или никаких символов, если информация о временной зоне недоступна | `Z AWST `                  |

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

Чтобы выводить сообщения журнала только в консоли:

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

| Ключ        | Описание                                                                                                                                                                                                                                                      |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`   | Адрес syslog в формате `host\[:port\]`. Если опущен, используется локальный демон.                                                                                                                                                                           |
| `hostname`  | Имя хоста, с которого отправляются журналы (необязательно).                                                                                                                                                                                                 |
| `facility`  | Ключевое слово [системного журнала](https://en.wikipedia.org/wiki/Syslog#Facility). Должен быть указан в верхнем регистре с префиксом "LOG_", например, `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т.д. По умолчанию: `LOG_USER`, если указан `address`, иначе `LOG_DAEMON`.                                           |
| `format`    | Формат сообщения журнала. Возможные значения: `bsd` и `syslog.`                                                                                                                                                                                          |

**Форматы журнала**

Вы можете указать формат журнала, который будет выводиться в консольном журнале. В настоящее время поддерживается только JSON.

**Пример**

Вот пример вывода JSON-журнала:

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

Чтобы включить поддержку JSON-журналов, используйте следующий фрагмент:

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

**Переименование ключей для JSON-журналов**

Имена ключей можно изменить, изменив значения тегов внутри тега `<names>`. Например, чтобы изменить `DATE_TIME` на `MY_DATE_TIME`, вы можете использовать `<date_time>MY_DATE_TIME</date_time>`.

**Пропуск ключей для JSON-журналов**

Свойства журнала могут быть пропущены, закомментировав свойство. Например, если вы не хотите, чтобы ваш журнал печатал `query_id`, вы можете закомментировать тег `<query_id>`.

## send_crash_reports {#send_crash_reports}

Настройки для выбора отправки отчетов о сбоях команде разработчиков ClickHouse через [Sentry](https://sentry.io).

Включение этой функции, особенно в предпроизводственных средах, высоко ценится.

Серверу потребуется доступ к публичному интернету через IPv4 (на момент написания поддержка IPv6 в Sentry не реализована) для правильной работы этой функции.

Ключи:

| Ключ                  | Описание                                                                                                                                                                                               |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | Булевый флаг для включения функции, по умолчанию `false`. Установите значение `true`, чтобы разрешить отправку отчетов о сбоях.                                                                       |
| `send_logical_errors` | `LOGICAL_ERROR` — это как `assert`, это баг в ClickHouse. Этот булевый флаг включает отправку этих исключений в Sentry (по умолчанию: `false`).                                                       |
| `endpoint`            | Вы можете переопределить URL-адрес конечной точки Sentry для отправки отчетов о сбоях. Это может быть отдельная учетная запись Sentry или ваш собственный экземпляр Sentry. Используйте синтаксис [Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=native#configure-the-sdk).                  |
| `anonymize`           | Избегайте прикрепления имени хоста сервера к отчету о сбое.                                                                                                                                             |
| `http_proxy`          | Настройка HTTP-прокси для отправки отчетов о сбоях.                                                                                                                                                    |
| `debug`               | Устанавливает клиент Sentry в режим отладки.                                                                                                                                                            |
| `tmp_path`            | Путь в файловой системе для временного состояния отчета о сбое.                                                                                                                                       |
| `environment`         | Произвольное имя среды, в которой работает сервер ClickHouse. Оно будет упомянуто в каждом отчете о сбое. Значение по умолчанию - `test` или `prod` в зависимости от версии ClickHouse.                     |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```

## ssh_server {#ssh_server}

Публичная часть ключа хоста будет записана в файл known_hosts на стороне клиента SSH при первом подключении.

Конфигурации ключей хоста по умолчанию не активированы. 
Раскомментируйте конфигурации ключей хоста и укажите путь к соответствующему ssh ключу для их активации:

Пример:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```

## tcp_ssh_port {#tcp_ssh_port}

Порт для SSH сервера, который позволяет пользователю подключаться и выполнять запросы интерактивно с использованием встроенного клиента через PTY.

Пример: 

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```

## storage_configuration {#storage_configuration}

Позволяет настраивать многодисковую конфигурацию хранения.

Конфигурация хранения следует приведенной ниже структуре:

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

| Настройка               | Описание                                                                                             |
|-------------------------|-------------------------------------------------------------------------------------------------------|
| `<disk_name_N>`         | Имя диска, которое должно быть уникальным.                                                          |
| `path`                  | Путь, по которому будут храниться данные сервера (каталоги `data` и `shadow`). Должен заканчиваться на `/` |
| `keep_free_space_bytes` | Размер резервируемого свободного места на диске.                                                   |

:::note
Порядок дисков не имеет значения.
:::

### Конфигурация политик {#configuration-of-policies}

Подтеги выше определяют следующие настройки для `policies`:

| Настройка                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                |
|--------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`                | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                   |
| `volume_name_N`                | Имя тома. Имена томов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                        |
| `disk`                         | Диск, расположенный внутри тома.                                                                                                                                                                                                                                                                                                                                                                                       |
| `max_data_part_size_bytes`     | Максимальный размер части данных, которая может находиться на любом из дисков этого тома. Если в результате объединения размер части данных превысит `max_data_part_size_bytes`, часть будет записана на следующий том. В основном, эта функция позволяет сохранять новые / маленькие части на горячем (SSD) томе и перемещать их на холодный (HDD) том, когда они достигают большого размера. Не используйте эту опцию, если у политики только один том. |
| `move_factor`                  | Доля доступного свободного пространства на томе. Если пространства становится меньше, данные начнут перемещаться на следующий том, если таковой имеется. Для передачи части данные сортируются по размеру от большего к меньшему (по убыванию), и выбираются части, общий размер которых достаточен для выполнения условия `move_factor`. Если общий размер всех частей недостаточен, будут перемещены все части.                                |
| `perform_ttl_move_on_insert`   | Отключает перемещение данных с истекшим временем жизни при вставке. По умолчанию (если включено), если мы вставляем кусок данных, который уже истек в соответствии с правилом перемещения по времени жизни, он немедленно перемещается на том / диске, указанном в правиле перемещения. Это может значительно замедлить вставку в случае, если целевой том / диск медленный (например, S3). Если отключено, истекшая часть данных записывается на резервный том и затем немедленно перемещается на том, указанном в правиле для истекшего времени жизни. |
| `load_balancing`               | Политика балансировки дисков, `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                          |
| `least_used_ttl_ms`            | Устанавливает таймаут (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - всегда обновлять, `-1` - никогда не обновлять, значение по умолчанию `60000`). Обратите внимание, если диск используется только ClickHouse и не будет подвержен изменению размера файловой системы на лету, вы можете использовать значение `-1`. Во всех остальных случаях это не рекомендуется, так как это в конечном итоге приведет к неправильному распределению пространства. |
| `prefer_not_to_merge`          | Отключает объединение частей данных на этом томе. Обратите внимание: это потенциально вредно и может вызвать замедление. Когда эта настройка включена (не делайте этого), объединение данных на этом томе запрещено (что плохо). Это позволяет контролировать, как ClickHouse взаимодействует с медленными дисками. Мы рекомендуем вообще не использовать это.                                                                                 |
| `volume_priority`              | Определяет приоритет (порядок), в котором заполняются тома. Чем меньше значение, тем выше приоритет. Параметры должны быть натуральными числами и охватывать диапазон от 1 до N (N - наибольшее значение параметра) без пробелов.                                                                                                                                                                    |

Для `volume_priority`:
- Если все тома имеют этот параметр, они приоритизируются в указанном порядке.
- Если только _некоторые_ тома имеют его, тома, у которых его нет, имеют наименьший приоритет. Те, у которых он есть, приоритизируются в соответствии со значением тега, приоритет остальных определяется по порядку описания в конфигурационном файле относительно друг друга.
- Если _ни один_ том не имеет этого параметра, их порядок определяется порядком описания в конфигурационном файле.
- Приоритет томов может не совпадать.

## macros {#macros}

Подстановки параметров для реплицированных таблиц.

Можно опустить, если реплицированные таблицы не используются.

Для получения дополнительной информации см. раздел [Создание реплицированных таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```

## replica_group_name {#replica_group_name}

Имя группы реплик для базы данных Replicated.

Кластер, созданный базой данных Replicated, будет состоять из реплик в одной группе.
DDL-запросы будут ждать только реплик в одной группе.

По умолчанию пусто.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```

Тип: строка

По умолчанию: ""

## remap_executable {#remap_executable}

Настройка для перераспределения памяти для машинного кода ("текста") с использованием больших страниц.

По умолчанию: `false`

:::note
Эта функция является высокоэкспериментальной.
:::

Пример:

```xml
<remap_executable>false</remap_executable>
```

## max_open_files {#max_open_files}

Максимальное количество открытых файлов.

:::note
Рекомендуем использовать эту опцию в macOS, так как функция `getrlimit()` возвращает неверное значение.
:::

**Пример**

```xml
<max_open_files>262144</max_open_files>
```

## max_session_timeout {#max_session_timeout}

Максимальное время ожидания сеанса в секундах.

По умолчанию: `3600`

Пример:

```xml
<max_session_timeout>3600</max_session_timeout>
```

## max_table_size_to_drop {#max_table_size_to_drop}

Ограничение на удаление таблиц.

Если размер таблицы [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) превышает `max_table_size_to_drop` (в байтах), вы не можете удалить ее с помощью запроса [`DROP`](../../sql-reference/statements/drop.md) или запроса [`TRUNCATE`](../../sql-reference/statements/truncate.md).

:::note
Значение `0` означает, что вы можете удалить все таблицы без каких-либо ограничений.

Для применения этой настройки не требуется перезапуск сервера ClickHouse. Другой способ отключить ограничение — создать файл `<clickhouse-path>/flags/force_drop_table`.
:::

**Пример**

```xml
<max_table_size_to_drop>0</max_table_size_to_drop>
```

По умолчанию: 50 ГБ.

## background_pool_size {#background_pool_size}

Устанавливает количество потоков, выполняющих фоновое объединение и мутации для таблиц с движками MergeTree.

:::note
- Эта настройка также может применяться при запуске сервера из конфигурации профиля `default` для обратной совместимости при запуске сервера ClickHouse.
- Вы можете увеличивать количество потоков во время работы.
- Чтобы уменьшить количество потоков, необходимо перезапустить сервер.
- Настраивая эту настройку, вы управляете загрузкой ЦП и диска.
:::

:::danger
Меньший размер пула использует меньше ресурсов ЦП и диска, но фоновые процессы продвигаются медленнее, что в конечном итоге может повлиять на производительность запросов.
:::

Прежде чем изменять его, пожалуйста, также ознакомьтесь с связанными настройками MergeTree, такими как:
- [`number_of_free_entries_in_pool_to_lower_max_size_of_merge`](../../operations/settings/merge-tree-settings.md#number-of-free-entries-in-pool-to-lower-max-size-of-merge).
- [`number_of_free_entries_in_pool_to_execute_mutation`](../../operations/settings/merge-tree-settings.md#number-of-free-entries-in-pool-to-execute_mutation).

**Пример**

```xml
<background_pool_size>16</background_pool_size>
```

Тип:

По умолчанию: 16.

## merges_mutations_memory_usage_soft_limit {#merges_mutations_memory_usage_soft_limit}

Устанавливает предел на то, сколько оперативной памяти разрешено использовать для выполнения операций объединения и мутации.
Если ClickHouse достигает установленного предела, он не будет планировать новые фоновые операции объединения или мутации, но продолжит выполнять уже запланированные задачи.

:::note
Значение `0` означает неограниченное количество.
:::

**Пример**

```xml
<merges_mutations_memory_usage_soft_limit>0</merges_mutations_memory_usage_soft_limit>
```

## merges_mutations_memory_usage_to_ram_ratio {#merges_mutations_memory_usage_to_ram_ratio}

Значение по умолчанию `merges_mutations_memory_usage_soft_limit` вычисляется как `memory_amount * merges_mutations_memory_usage_to_ram_ratio`.

**См. также:**

- [max_memory_usage](../../operations/settings/query-complexity.md#settings_max_memory_usage)
- [merges_mutations_memory_usage_soft_limit](#merges_mutations_memory_usage_soft_limit)

По умолчанию: `0.5`.

## async_load_databases {#async_load_databases}

Асинхронная загрузка баз данных и таблиц.

- Если `true`, все не системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружены асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к таблице, которая еще не загружена, будет ждать, пока эта таблица не будет запущена. Если задача загрузки не удалась, запрос выдаст ошибку (вместо отключения всего сервера в случае `async_load_databases = false`). Таблица, которую ожидает хотя бы один запрос, будет загружена с более высоким приоритетом. DDL-запросы на базу данных будут ждать, пока эта база данных не будет запущена. Также рассмотрите возможность установки ограничения `max_waiting_queries` для общего числа ожидающих запросов.
- Если `false`, все базы данных загружаются при запуске сервера.

**Пример**

```xml
<async_load_databases>true</async_load_databases>
```

По умолчанию: `false`.

## async_load_system_database {#async_load_system_database}

Асинхронная загрузка системных таблиц. Полезно, если есть большое количество таблиц журналов и частей в базе данных `system`. Независимо от настройки `async_load_databases`.

- Если установлено в `true`, все системные базы данных с движками `Ordinary`, `Atomic` и `Replicated` будут загружены асинхронно после запуска сервера ClickHouse. См. таблицу `system.asynchronous_loader`, настройки сервера `tables_loader_background_pool_size` и `tables_loader_foreground_pool_size`. Любой запрос, который пытается получить доступ к системной таблице, которая еще не загружена, будет ждать, пока эта таблица не будет запущена. Таблица, которую ожидает хотя бы один запрос, будет загружена с более высоким приоритетом. Также рассмотрите возможность установки настройки `max_waiting_queries`, чтобы ограничить общее количество ожидающих запросов.
- Если установлено в `false`, 
системная база данных загружается перед запуском сервера.

**Пример**

```xml
<async_load_system_database>true</async_load_system_database>
```

По умолчанию: `false`.

## tables_loader_foreground_pool_size {#tables_loader_foreground_pool_size}

Устанавливает количество потоков, выполняющих загрузочные задачи в фоновом пуле. Фоновый пул используется для загрузки таблицы синхронно перед запуском сервера на порту и для загрузки таблиц, которые ожидаются. Фоновый пул имеет более высокий приоритет, чем пул работы в фоновом режиме. Это означает, что никакая работа не начнется в фоновой группе, пока в фоновой группе выполняются рабочие задачи.

:::note
Значение `0` означает, что будут использоваться все доступные ЦП.
:::

По умолчанию: `0`

## tables_loader_background_pool_size {#tables_loader_background_pool_size}

Устанавливает количество потоков, выполняющих асинхронные загрузочные задачи в фоновом пуле. Фоновый пул используется для асинхронной загрузки таблиц после запуска сервера в случае, если нет запросов, ожидающих таблицу. Полезно поддерживать малое количество потоков в фоновом пуле, если существует много таблиц. Это зарезервирует ресурсы ЦП для одновременного выполнения запросов.

:::note
Значение `0` означает, что будут использоваться все доступные ЦП.
:::

По умолчанию: `0`

## merge_tree {#merge_tree}

Тонкая настройка для таблиц в [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Для получения дополнительной информации см. файл заголовка MergeTreeSettings.h.

**Пример**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

## metric_log {#metric_log}

По умолчанию отключен.

**Включение**

Чтобы вручную включить сбор истории метрик [`system.metric_log`](../../operations/system-tables/metric_log.md), создайте файл `/etc/clickhouse-server/config.d/metric_log.xml` с следующим содержимым:

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

Чтобы отключить настройку `metric_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` с следующим содержимым:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## latency_log {#latency_log}

По умолчанию отключен.

**Включение**

Чтобы вручную включить сбор истории задержек [`system.latency_log`](../../operations/system-tables/latency_log.md), создайте файл `/etc/clickhouse-server/config.d/latency_log.xml` с следующим содержимым:

``` xml
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

Чтобы отключить настройку `latency_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_latency_log.xml` с следующим содержимым:

``` xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```

## replicated_merge_tree {#replicated_merge_tree}

Тонкая настройка для таблиц в [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Эта настройка имеет более высокий приоритет.

Для получения дополнительной информации см. файл заголовка MergeTreeSettings.h.

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
```

## openSSL {#openssl}

Конфигурация SSL клиента/сервера.

Поддержка SSL обеспечивается библиотекой `libpoco`. Доступные параметры конфигурации объясняются в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи для настроек сервера/клиента:

| Опция                         | Описание                                                                                                                                                                                                                                                                                                                                                                      | Значение по умолчанию                       |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|
| `privateKeyFile`              | Путь к файлу с секретным ключом PEM-сертификата. Файл может одновременно содержать ключ и сертификат.                                                                                                                                                                                                                                                                         |                                             |
| `certificateFile`             | Путь к файлу сертификата клиента/сервера в формате PEM. Вы можете его опустить, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                 |                                             |
| `caConfig`                    | Путь к файлу или каталогу, который содержит доверенные CA-сертификаты. Если это указывает на файл, он должен быть в формате PEM и может содержать несколько CA-сертификатов. Если это указывает на каталог, он должен содержать один .pem файл на каждый CA-сертификат. Имена файлов ищутся по значению хэш-значения имени субъекта CA. Подробности можно найти в мануале [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                             |
| `verificationMode`            | Метод проверки сертификатов узла. Подробности находятся в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                              | `relaxed`                                   |
| `verificationDepth`           | Максимальная длина цепочки проверки. Проверка завершится неудачей, если длина цепочки сертификатов превысит установленное значение.                                                                                                                                                                                                                                          | `9`                                         |
| `loadDefaultCAFile`           | Использовать ли встроенные CA-сертификаты для OpenSSL. ClickHouse предполагает, что встроенные CA-сертификаты находятся в файле `/etc/ssl/cert.pem` (соответственно, в каталоге `/etc/ssl/certs`) или в файле (соответственно, каталоге), указанном переменной окружения `SSL_CERT_FILE` (соответственно, `SSL_CERT_DIR`).                                                                                                                         | `true`                                      |
| `cipherList`                  | Поддерживаемые шифрования OpenSSL.                                                                                                                                                                                                                                                                                                                                                           | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH` |
| `cacheSessions`               | Включает или отключает кэширование сессий. Должен использоваться в сочетании с `sessionIdContext`. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                              | `false`                                     |
| `sessionIdContext`            | Уникальный набор случайных символов, который сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Этот параметр всегда рекомендуется, поскольку он помогает избежать проблем как в случае, если сервер кэширует сессию, так и в случае, если клиент запрашивает кэширование.                                                                                              | `$\{application.name\}`                     |
| `sessionCacheSize`            | Максимальное количество сессий, которые сервер кэширует. Значение `0` означает неограниченное количество сессий.                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | Время кэширования сессии на сервере в часах.                                                                                                                                                                                                                                                                                                                                                   | `2`                                         |
| `extendedVerification`        | Если включено, проверить, соответствует ли CN или SAN сертификата имени хоста пиринга.                                                                                                                                                                                                                                                                                                  | `false`                                     |
| `requireTLSv1`                | Требуется подключение TLSv1. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                              | `false`                                     |
| `requireTLSv1_1`              | Требуется подключение TLSv1.1. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                           | `false`                                     |
| `requireTLSv1_2`              | Требуется подключение TLSv1.2. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                           | `false`                                     |
| `fips`                        | Активирует режим FIPS OpenSSL. Поддерживается, если версия OpenSSL библиотеки поддерживает FIPS.                                                                                                                                                                                                                                                                                           | `false`                                     |
| `privateKeyPassphraseHandler` | Класс (подкласс PrivateKeyPassphraseHandler), который запрашивает кодовую фразу для доступа к закрытому ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                              | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | Класс (подкласс CertificateHandler) для проверки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`.                                                                                                                                                                                            | `RejectCertificateHandler`                 |
| `disableProtocols`            | Протоколы, использование которых не допускается.                                                                                                                                                                                                                                                                                                                                        |                                             |
| `preferServerCiphers`         | Шифры сервера, предпочтительные для клиента.                                                                                                                                                                                                                                                                                                                                                     | `false`                                     |

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
## part_log {#part_log}

Запись событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Например, добавление или слияние данных. Вы можете использовать журнал для симуляции алгоритмов слияния и сравнения их характеристик. Вы можете визуализировать процесс слияния.

Запросы записываются в таблицу [system.part_log](/operations/system-tables/part_log), а не в отдельный файл. Вы можете настроить название этой таблицы в параметре `table` (см. ниже).

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

Путь к каталогу, содержащему данные.

:::note
Обязательный слэш в конце.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```
## processors_profile_log {#processors_profile_log}

Настройки для системной таблицы [`processors_profile_log`](../system-tables/processors_profile_log.md).

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
## Prometheus {#prometheus}

Экспонирование данных метрик для сбора с [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP-эндпоинт для сбора метрик сервером Prometheus. Начинается с '/'.
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

Проверка (замените `127.0.0.1` на IP-адрес или имя хоста вашего сервера ClickHouse):
```bash
curl 127.0.0.1:9363/metrics
```
## query_log {#query-log}

Настройка для записи запросов, полученных с помощью параметра [log_queries=1](../../operations/settings/settings.md).

Запросы записываются в таблицу [system.query_log](/operations/system-tables/query_log), а не в отдельный файл. Вы можете изменить название таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

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
## query_metric_log {#query_metric_log}

По умолчанию отключен.

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

Чтобы отключить настройку `query_metric_log`, вы должны создать следующий файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` с следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_cache {#query_cache}

Конфигурация [кэша запросов](../query-cache.md).

Доступные параметры:

| Настройка                   | Описание                                                                            | Значение по умолчанию |
|-----------------------------|------------------------------------------------------------------------------------|-----------------------|
| `max_size_in_bytes`         | Максимальный размер кэша в байтах. `0` означает, что кэш запросов отключен.        | `1073741824`          |
| `max_entries`               | Максимальное количество результатов `SELECT` запросов, хранящихся в кэше.          | `1024`                |
| `max_entry_size_in_bytes`   | Максимальный размер в байтах, который может иметь результат `SELECT` запроса, чтобы быть сохранённым в кэше. | `1048576`             |
| `max_entry_size_in_rows`    | Максимальное количество строк, которое могут содержать результаты `SELECT` запроса, чтобы быть сохранёнными в кэше. | `30000000`            |

:::note
- Изменённые настройки вступают в силу немедленно.
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
## query_thread_log {#query_thread_log}

Настройка для записи потоков запросов, полученных с помощью параметра [log_query_threads=1](/operations/settings/settings#log_query_threads).

Запросы записываются в таблицу [system.query_thread_log](/operations/system-tables/query_thread_log), а не в отдельный файл. Вы можете изменить название таблицы в параметре `table` (см. ниже).

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

Настройка для записи представлений (живых, материализованных и т.д.), зависящих от запросов, полученных с помощью параметра [log_query_views=1](/operations/settings/settings#log_query_views).

Запросы записываются в таблицу [system.query_views_log](/operations/system-tables/query_views_log), а не в отдельный файл. Вы можете изменить название таблицы в параметре `table` (см. ниже).

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
## text_log {#text_log}

Настройки для системной таблицы [text_log](/operations/system-tables/text_log) для записи текстовых сообщений.

<SystemLogParameters/>

Дополнительно:

| Настройка | Описание                                                                                                                                                                                                 | Значение по умолчанию       |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| `level`   | Максимальный уровень сообщения (по умолчанию `Trace`), который будет храниться в таблице.                                                                                                             | `Trace`                     |

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
## asynchronous_insert_log {#asynchronous_insert_log}

Настройки для системной таблицы [asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) для записи асинхронных вставок.

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

Настройки для системной таблицы [crash_log](../../operations/system-tables/crash-log.md) операции.

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

Эта настройка определяет путь к кэшу для пользовательских (созданных из SQL) кэшированных дисков. `custom_cached_disks_base_directory` имеет более высокий приоритет для пользовательских дисков, чем `filesystem_caches_path` (который находится в `filesystem_caches_path.xml`), и используется, если первый отсутствует. Путь настройки файлового кэша должен находиться внутри этого каталога, в противном случае будет выброшено исключение, предотвращающее создание диска.

:::note
Это не повлияет на диски, созданные в более ранней версии, для которой сервер был обновлен. В этом случае исключение не будет выброшено, чтобы сервер смог успешно запуститься.
:::

Пример:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```
## backup_log {#backup_log}

Настройки для системной таблицы [backup_log](../../operations/system-tables/backup_log.md) для записи операций `BACKUP` и `RESTORE`.

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
## правила_маскирования_запросов {#query_masking_rules}

Правила на основе регулярных выражений, которые будут применяться к запросам, а также ко всем сообщениям журналов перед их сохранением в серверных журналах, таблицах [`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) и в журналах, отправляемых клиенту. Это позволяет предотвратить утечку конфиденциальных данных из SQL-запросов, таких как имена, электронные адреса, персональные идентификаторы или номера кредитных карт в журналы.

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
|-------------|---------------------------------------------------------------------------|
| `name`      | имя для правила (необязательно)                                          |
| `regexp`    | регулярное выражение, совместимое с RE2 (обязательно)                   |
| `replace`   | строка замены для конфиденциальных данных (необязательно, по умолчанию - шесть звездочек) |

Правила маскирования применяются ко всему запросу (чтобы предотвратить утечки конфиденциальных данных из неправильных / непарсируемых запросов).

В таблице [`system.events`](/operations/system-tables/events) есть счетчик `QueryMaskingRulesMatch`, который содержит общее количество совпадений правил маскирования запросов.

Для распределенных запросов каждый сервер должен быть настроен отдельно, в противном случае, подзапросы, передаваемые на другие узлы, будут храниться без маскировки.

## удаленные_серверы {#remote_servers}

Конфигурация кластеров, используемых движком таблиц [Distributed](../../engines/table-engines/special/distributed.md) и функцией таблицы `cluster`.

**Пример**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

Для значения атрибута `incl` смотрите раздел "[Конфигурационные файлы](/operations/configuration-files)".

**Смотрите также**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Обнаружение кластера](../../operations/cluster-discovery.md)
- [Реплицируемый движок базы данных](../../engines/database-engines/replicated.md)

## разрешенные_хосты_удаленного_url {#remote_url_allow_hosts}

Список хостов, которые разрешено использовать в движках хранения и функциях таблиц, связанных с URL.

При добавлении хоста с xml тегом `\<host\>`:
- он должен быть указан точно так же, как в URL, так как имя проверяется перед разрешением DNS. Например: `<host>clickhouse.com</host>`
- если порт явно указан в URL, то проверяется host:port целиком. Например: `<host>clickhouse.com:80</host>`
- если хост указан без порта, то разрешен любой порт хоста. Например: если `<host>clickhouse.com</host>` указан, то разрешены `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т. д.
- если хост указан как IP-адрес, то он проверяется так, как указан в URL. Например: `[2a02:6b8:a::a]`.
- если имеются перенаправления и поддержка перенаправлений включена, то каждое перенаправление (поле location) проверяется.

Например: 

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```

## часовой_пояс {#timezone}

Часовой пояс сервера.

Указывается как IANA идентификатор для часового пояса UTC или географического местоположения (например, Africa/Abidjan).

Часовой пояс необходим для конвертации между строковыми и DateTime форматами, когда поля DateTime выводятся в текстовый формат (печатаются на экране или в файл) и при получении DateTime из строки. Кроме того, часовой пояс используется в функциях, работающих с временем и датой, если они не получили часовой пояс в входных параметрах.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**Смотрите также**

- [session_timezone](../settings/settings.md#session_timezone)

## tcp_порт {#tcp_port}

Порт для связи с клиентами по протоколу TCP.

**Пример**

```xml
<tcp_port>9000</tcp_port>
```

## tcp_порт_защищенный {#tcp_port_secure}

TCP порт для защищенной связи с клиентами. Используйте его с настройками [OpenSSL](#openssl).

**Значение по умолчанию**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```

## mysql_порт {#mysql_port}

Порт для связи с клиентами по протоколу MySQL.

:::note
- Положительные целые числа указывают номер порта для прослушивания
- Пустые значения используются для отключения связи с клиентами по протоколу MySQL.
:::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```

## postgresql_порт {#postgresql_port}

Порт для связи с клиентами по протоколу PostgreSQL.

:::note
- Положительные целые числа указывают номер порта для прослушивания
- Пустые значения используются для отключения связи с клиентами по протоколу PostgreSQL.
:::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```

## tmp_путь {#tmp_path}

Путь на локальной файловой системе для хранения временных данных для обработки крупных запросов.

:::note
- Можно использовать только один параметр для настройки хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- Заключительный слэш обязателен.
:::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```

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

## путь_пользовательских_файлов {#user_files_path}

Директория с пользовательскими файлами. Используется в функции таблицы [file()](../../sql-reference/table-functions/file.md), [fileCluster()](../../sql-reference/table-functions/fileCluster.md).

**Пример**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

## путь_пользовательских_скриптов {#user_scripts_path}

Директория с файлами пользовательских скриптов. Используется для выполняемых пользовательских функций [Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions).

**Пример**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

Тип:

Значение по умолчанию:

## путь_пользовательских_определений {#user_defined_path}

Директория с файлами пользовательских определений. Используется для SQL пользовательских функций [SQL пользовательские функции](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```

## конфигурация_пользователей {#users_config}

Путь к файлу, содержащему:

- Конфигурации пользователей.
- Права доступа.
- Профили настроек.
- Настройки квот.

**Пример**

```xml
<users_config>users.xml</users_config>
```

## проверка_tcp_информации_клиента {#validate_tcp_client_information}

Определяет, включена ли валидация информации клиента при получении пакета запроса.

По умолчанию: `false`:

```xml
<validate_tcp_client_information>false</validate_tcp_client_information>
```

## улучшения_контроля_доступа {#access_control_improvements}

Настройки для опциональных улучшений в системе контроля доступа.

| Настройка                                         | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Значение по умолчанию |
|--------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|
| `users_without_row_policies_can_read_rows`      | Устанавливает, могут ли пользователи без разрешений на строки все равно читать строки с помощью запроса `SELECT`. Например, если есть два пользователя A и B, и политика строк определена только для A, то если эта настройка истина, пользователь B увидит все строки. Если эта настройка ложно, пользователь B не увидит никаких строк.                                                                                                                                   | `true`                 |
| `on_cluster_queries_require_cluster_grant`      | Устанавливает, требуют ли запросы `ON CLUSTER` разрешение `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                          | `true`                 |
| `select_from_system_db_requires_grant`          | Устанавливает, требует ли `SELECT * FROM system.<table>` каких-либо разрешений и может выполняться любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON system.<table>`, как и для не системных таблиц. Исключения: некоторые системные таблицы (`tables`, `columns`, `databases` и некоторые постоянные таблицы, такие как `one`, `contributors`) все еще доступны для всех; и если есть привилегия `SHOW` (например, `SHOW USERS`), то соответствующая системная таблица (т. е. `system.users`) будет доступна.                 | `true`                 |
| `select_from_information_schema_requires_grant` | Устанавливает, требует ли `SELECT * FROM information_schema.<table>` каких-либо разрешений и может выполняться любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON information_schema.<table>`, как и для обычных таблиц.                                                                                                                                                                                                                                      | `true`                 |
| `settings_constraints_replace_previous`         | Устанавливает, будет ли ограничение в профиле настроек для некоторой настройки отменять действия предыдущего ограничения (определенного в других профилях) для этой настройки, включая поля, которые не установлены новым ограничением. Также включает тип ограничения `changeable_in_readonly`.                                                                                                                                                                                                        | `true`                 |
| `table_engines_require_grant`                   | Устанавливает, требует ли создание таблицы с конкретным движком таблицы разрешения.                                                                                                                                                                                                                                                                                                                                                                                                                            | `false`                |
| `role_cache_expiration_time_seconds`            | Устанавливает количество секунд с момента последнего доступа, в течение которого роль хранится в кеше ролей.                                                                                                                                                                                                                                                                                                                                                                                                     | `600`                  |

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

Значения по умолчанию:

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```

## ожидать_загрузки_словарей_при_старте {#wait_dictionaries_load_at_startup}

Эта настройка позволяет задать поведение, если `dictionaries_lazy_load` установлено в `false`.
(Если `dictionaries_lazy_load` установлено в `true`, эта настройка не влияет на ничего.)

Если `wait_dictionaries_load_at_startup` установлено в `false`, то сервер начнет загружать все словари при старте и будет принимать подключения параллельно с этой загрузкой.
Когда словарь впервые используется в запросе, запрос будет ждать, пока словарь будет загружен, если он еще не загружен.
Установка `wait_dictionaries_load_at_startup` в `false` может ускорить запуск ClickHouse, однако некоторые запросы могут выполняться медленнее (поскольку им придется ждать, пока загрузятся некоторые словари).

Если `wait_dictionaries_load_at_startup` установлено в `true`, то сервер будет ждать на старте, пока все словари закончат свою загрузку (успешно или нет) перед тем, как принимать подключения.

**Пример**

```xml
<wait_dictionaries_load_at_startup>true</wait_dictionaries_load_at_startup>
```

Значение по умолчанию: true

## zookeeper {#zookeeper}

Содержит настройки, которые позволяют ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик, когда используются реплицируемые таблицы. Если реплицируемые таблицы не используются, этот раздел параметров можно опустить.

Следующие настройки могут быть настроены с помощью под-тегов:

| Настройка                                    | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                       | Узел ZooKeeper. Вы можете установить несколько узлов. Например, `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` указывает порядок узлов при попытке подключиться к кластеру ZooKeeper.                                                                                                                                                                                                                                                                                            |
| `session_timeout_ms`                         | Максимальное время ожидания для клиентской сессии в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `operation_timeout_ms`                       | Максимальное время ожидания для одной операции в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `root` (необязательно)                      | Узел, который используется в качестве корня для узлов, используемых сервером ClickHouse.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `fallback_session_lifetime.min` (необязательно) | Минимальный предел для срока службы сессии ZooKeeper для резервного узла, когда основной недоступен (балансировка нагрузки). Установлен в секундах. Значение по умолчанию: 3 часа.                                                                                                                                                                                                                                                                                                                                  |
| `fallback_session_lifetime.max` (необязательно) | Максимальный предел для срока службы сессии ZooKeeper для резервного узла, когда основной недоступен (балансировка нагрузки). Установлен в секундах. Значение по умолчанию: 6 часов.                                                                                                                                                                                                                                                                                                                                  |
| `identity` (необязательно)                  | Пользователь и пароль, требуемые ZooKeeper для доступа к запрашиваемым узлам.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `use_compression` (необязательно)           | Включает сжатие в протоколе Keeper, если установлено в true.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

Существует также настройка `zookeeper_load_balancing` (необязательно), которая позволяет вам выбрать алгоритм для выбора узлов ZooKeeper:

| Имя алгоритма                   | Описание                                                                                                                    |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| `random`                         | случайно выбирает один из узлов ZooKeeper.                                                                                       |
| `in_order`                       | выбирает первый узел ZooKeeper, если он недоступен, то второй, и так далее.                                            |
| `nearest_hostname`               | выбирает узел ZooKeeper с доменным именем, наиболее схожим с доменным именем сервера, имя хоста сравнивается с префиксом. |
| `hostname_levenshtein_distance`  | как `nearest_hostname`, но сравнивает имя хоста по методу расстояния Левенштейна.                                         |
| `first_or_random`                | выбирает первый узел ZooKeeper, если он недоступен, то случайно выбирает один из оставшихся узлов ZooKeeper.                |
| `round_robin`                    | выбирает первый узел ZooKeeper, если происходит повторное соединение, выбирает следующий.                                                    |

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
    <!-- Необязательно. Суффикс Chroot. Должен существовать. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Необязательно. Строка контроля доступа (ACL) для ZooKeeper. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**Смотрите также**

- [Репликация](../../engines/table-engines/mergetree-family/replication.md)
- [Руководство для программистов ZooKeeper](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [Опциональная защищенная связь между ClickHouse и Zookeeper](/operations/ssl-zookeeper)

## использовать_минималистичный_заголовок_части_в_zookeeper {#use_minimalistic_part_header_in_zookeeper}

Метод хранения заголовков частей данных в ZooKeeper. Эта настройка применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Она может быть указана:

**Глобально в разделе [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует настройку для всех таблиц на сервере. Вы можете изменить настройку в любое время. Существующие таблицы изменяют свое поведение, когда изменяется настройка.

**Для каждой таблицы**

При создании таблицы укажите соответствующую настройку [движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этой настройкой не изменяется, даже если глобальная настройка изменяется.

**Возможные значения**

- `0` — Функциональность отключена.
- `1` — Функциональность включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицированные](../../engines/table-engines/mergetree-family/replication.md) таблицы компактно хранят заголовки частей данных, используя единственный `znode`. Если таблица содержит много колонок, этот метод хранения значительно снижает объем данных, хранящихся в ZooKeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1`, вы не сможете откатить сервер ClickHouse на версию, которая не поддерживает эту настройку. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все серверы одновременно. Безопаснее всего тестировать новые версии ClickHouse в тестовой среде или на нескольких серверах кластера.

Заголовки частей данных, уже хранящиеся с этой настройкой, не могут быть восстановлены до предыдущего (не компактного) представления.
:::

Тип: UInt8

Значение по умолчанию: 0

## распределенный_ddl {#distributed_ddl}

Управляет выполнением [распределенных ddl запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) в кластере.
Работает только если включен [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper).

Настройки, которые можно настроить в `<distributed_ddl>` включают:

| Настройка                | Описание                                                                                                                                           | Значение по умолчанию                     |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|
| `path`                   | путь в Keeper для `task_queue` для DDL запросов                                                                                                  |                                           |
| `profile`                | профиль, используемый для выполнения DDL запросов                                                                                                 |                                           |
| `pool_size`              | сколько запросов `ON CLUSTER` могут выполняться одновременно                                                                                     |                                           |
| `max_tasks_in_queue`     | максимальное количество задач, которые могут находиться в очереди.                                                                                  | `1,000`                                   |
| `task_max_lifetime`      | удалить узел, если его возраст больше этого значения.                                                                                             | `7 * 24 * 60 * 60` (неделя в секундах)   |
| `cleanup_delay_period`   | очистка начинается после получения нового события узла, если последняя очистка не была выполнена раньше, чем `cleanup_delay_period` секунд назад. | `60` секунд                               |

**Пример**

```xml
<distributed_ddl>
    <!-- Путь в ZooKeeper к очереди с DDL запросами -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Настройки из этого профиля будут использоваться для выполнения DDL запросов -->
    <profile>default</profile>

    <!-- Контролирует, сколько запросов ON CLUSTER могут выполняться одновременно. -->
    <pool_size>1</pool_size>

    <!--
         Настройки очистки (активные задачи не будут удалены)
    -->

    <!-- Контролирует TTL задач (значение по умолчанию 1 неделя) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Контролирует, как часто должна выполняться очистка (в секундах) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Контролирует, сколько задач может находиться в очереди -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```

## путь_контроля_доступа {#access_control_path}

Путь к папке, где сервер ClickHouse хранит конфигурации пользователей и ролей, созданные SQL командами.

**Смотрите также**

- [Контроль доступа и управление учетными записями](/operations/access-rights#access-control-usage)

Тип: String

Значение по умолчанию: `/var/lib/clickhouse/access/`.

## разрешить_пароли_в_открытом_виде {#allow_plaintext_password}

Устанавливает, разрешены ли типы паролей в открытом виде (небезопасные).

Значение по умолчанию: `1` (тип authType plaintext_password разрешен)

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```

## разрешить_без_пароля {#allow_no_password}

Устанавливает, разрешен ли небезопасный тип пароля без пароля.

Значение по умолчанию: `1` (тип authType no_password разрешен)

```xml
<allow_no_password>1</allow_no_password>
```

## запрещать_неявный_без_пароля {#allow_implicit_no_password}

Запрещает создание пользователя без пароля, если 'IDENTIFIED WITH no_password' явно не указано.

Значение по умолчанию: `1`

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```

## таймаут_сессии_по_умолчанию {#default_session_timeout}

Таймаут сессии по умолчанию, в секундах.

Значение по умолчанию: `60`

```xml
<default_session_timeout>60</default_session_timeout>
```

## тип_пароля_по_умолчанию {#default_password_type}

Устанавливает тип пароля, который будет автоматически установлен для запросов, таких как `CREATE USER u IDENTIFIED BY 'p'`.

Принимаемые значения:
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
```yaml
title: 'Пользовательские директории'
sidebar_label: 'Пользовательские директории'
keywords: ['пользователи', 'настройки', 'ClickHouse']
description: 'Секция конфигурационного файла, содержащая настройки для работы с пользователями.'
```

## user_directories {#user_directories}

Секция конфигурационного файла, содержащая настройки:
- Путь к конфигурационному файлу с предопределёнными пользователями.
- Путь к папке, где хранятся пользователи, созданные с помощью SQL-команд.
- Путь к узлу ZooKeeper, где хранятся и реплицируются пользователи, созданные с помощью SQL-команд (экспериментально).

Если эта секция указана, путь из [users_config](/operations/server-configuration-parameters/settings#users_config) и [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) использоваться не будет.

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

Также можно определить секции `memory` — означает хранение информации только в памяти, без записи на диск, и `ldap` — означает хранение информации на LDAP-сервере.

Чтобы добавить LDAP-сервер как удаленный каталог пользователей, которые не определены локально, определите одну секцию `ldap` со следующими настройками:

| Настройка  | Описание                                                                                                                                                                                                                                                                                                                                                                    |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server`   | одно из имен LDAP-серверов, определенных в секции конфигурации `ldap_servers`. Этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                          |
| `roles`    | секция с перечнем локально определенных ролей, которые будут назначены каждому пользователю, полученному с LDAP-сервера. Если роли не указаны, пользователь не сможет выполнять никакие действия после аутентификации. Если какая-либо из указанных ролей не определена локально на момент аутентификации, попытка аутентификации будет неудачной, как если бы введённый пароль был неверным. |

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

Определяет список пользовательских доменов верхнего уровня для добавления, где каждая запись имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

См. также:
- функция [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) и её вариации,
которая принимает имя пользовательского списка TLD, возвращая часть домена, которая включает домены верхнего уровня до первого значительного подсайта.
## total_memory_profiler_step {#total_memory_profiler_step}

Устанавливает размер памяти (в байтах) для стека вызовов на каждом пике выделения памяти. Данные хранятся в системной таблице [system.trace_log](../../operations/system-tables/trace_log.md) с `query_id`, равным пустой строке.

По умолчанию: `4194304`.
## total_memory_tracker_sample_probability {#total_memory_tracker_sample_probability}

Позволяет собирать случайные выделения и освобождения памяти и записывать их в системную таблицу [system.trace_log](../../operations/system-tables/trace_log.md) с `trace_type`, равным `MemorySample`, с заданной вероятностью. Вероятность относилась к каждому выделению или освобождению памяти, независимо от размера выделения. Обратите внимание, что выборка происходит только тогда, когда количество неучтенной памяти превышает предел неучтенной памяти (значение по умолчанию — `4` MiB). Его можно уменьшить, если понижено значение [total_memory_profiler_step](#total_memory_profiler_step). Вы можете установить `total_memory_profiler_step` равным `1` для более мелкой выборки.

Возможные значения:

- Положительное целое число.
- `0` — запись случайных выделений и освобождений памяти в системную таблицу `system.trace_log` отключена.

По умолчанию: `0`.
## compiled_expression_cache_size {#compiled_expression_cache_size}

Устанавливает размер кеша (в байтах) для [собранных выражений](../../operations/caches.md).

По умолчанию: `134217728`.
## compiled_expression_cache_elements_size {#compiled_expression_cache_elements_size}

Устанавливает размер кеша (в элементах) для [собранных выражений](../../operations/caches.md).

По умолчанию: `10000`.
## display_secrets_in_show_and_select {#display_secrets_in_show_and_select}

Включает или отключает отображение секретов в запросах `SHOW` и `SELECT` для таблиц, баз данных, табличных функций и словарей.

Пользователь, желающий видеть секреты, также должен иметь
[`format_display_secrets_in_show_and_select` формат настройки](../settings/formats#format_display_secrets_in_show_and_select)
включенной и привилегию
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Возможные значения:

- `0` — Отключено.
- `1` — Включено.

По умолчанию: `0`
## proxy {#proxy}

Определяет прокси-серверы для HTTP и HTTPS-запросов, в настоящее время поддерживаемые хранилищем S3, табличными функциями S3 и URL-функциями.

Существует три способа определения прокси-серверов:
- переменные окружения
- списки прокси
- удалённые разрешающие серверы.

Прокси-серверы могут быть обойдены для конкретных хостов с помощью переменной `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать
прокси-сервер для данного протокола. Если это задано в вашей системе, оно должно работать без сбоев.

Это самый простой подход, если у данного протокола есть
только один прокси-сервер и этот прокси-сервер не меняется.

**Списки прокси**

Этот подход позволяет указать один или несколько
прокси-серверов для протокола. Если определено несколько прокси-серверов,
ClickHouse использует разные прокси по круговой схеме, балансируя
нагрузку между серверами. Это самый простой подход, если есть более одного
прокси-сервера для протокола и список прокси-серверов не меняется.

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
Выберите родительское поле в вкладках ниже, чтобы просмотреть их дочерние:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле     | Описание                          |
|-----------|----------------------------------|
| `<http>`  | Список одного или нескольких HTTP-прокси  |
| `<https>` | Список одного или нескольких HTTPS-прокси |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">


| Поле   | Описание          |
|---------|----------------------|
| `<uri>` | URI прокси |

  </TabItem>
</Tabs>

**Удалённые разрешающие серверы**

Возможно, что прокси-серверы изменяются динамически. В этом
случае вы можете определить конечную точку разрешателя. ClickHouse отправляет
пустой GET-запрос на эту конечную точку, удалённый разрешатель должен вернуть хост прокси.
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

Выберите родительское поле в вкладках ниже, чтобы просмотреть их дочерние:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле    | Описание                       |
|----------|----------------------------------|
| `<http>` | Список одного или нескольких разрешителей* |
| `<https>` | Список одного или нескольких разрешителей* |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">

| Поле       | Описание                                   |
|-------------|-----------------------------------------------|
| `<resolver>` | Конечная точка и другие детали для разрешателя |

:::note
Вы можете иметь несколько элементов `<resolver>`, но только первый
`<resolver>` для данного протокола будет использоваться. Все остальные элементы `<resolver>`
для данного протокола игнорируются. Это означает, что балансировка нагрузки
(при необходимости) должна быть реализована удалённым разрешателем.
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| Поле               | Описание                                                                                                                                                                            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | URI разрешителя прокси                                                                                                                                                          |
| `<proxy_scheme>`    | Протокол конечного URI прокси. Это может быть либо `http`, либо `https`.                                                                                                             |
| `<proxy_port>`      | Номер порта разрешителя прокси                                                                                                                                                  |
| `<proxy_cache_time>` | Время в секундах, в течение которого значения от разрешителя должны кэшироваться ClickHouse. Установка этого значения в `0` заставляет ClickHouse обращаться к разрешителю для каждого HTTP или HTTPS-запроса. |

  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:

| Порядок | Настройка                |
|-------|------------------------|
| 1.    | Удалённые разрешители  |
| 2.    | Списки прокси          |
| 3.    | Переменные окружения   |

ClickHouse проверит тип разрешателя высшего приоритета для протокола запроса. Если он не определён,
он проверит следующий тип разрешателя с более низким приоритетом, пока не достигнет разрешателя окружения.
Это также позволяет использовать смешанные типы разрешителей.
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию используется туннелирование (т.е. `HTTP CONNECT`) для выполнения `HTTPS` запросов через `HTTP` прокси. Эта настройка может быть использована для его отключения.

**no_proxy**

По умолчанию все запросы проходят через прокси. Чтобы отключить его для конкретных хостов, переменная `no_proxy` должна быть установлена.
Она может быть установлена внутри секции `<proxy>` для списков и удалённых разрешителей и как переменная окружения для разрешителя окружения.
Она поддерживает IP-адреса, домены, подсайты и символ `'*'` для полного обхода. Начальные точки отбрасываются, как это делает curl.

**Пример**

Следующая конфигурация обходит прокси-запросы к `clickhouse.cloud` и всем его подсайтам (например, `auth.clickhouse.cloud`).
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
Здесь рассматриваются только напрямую зависимые представления, и создание одного представления на основе другого представления не рассматривается.
:::

По умолчанию: `0`.
## format_alter_operations_with_parentheses {#format_alter_operations_with_parentheses}

Если установлено в `true`, операции изменения будут окружены скобками в отформатированных запросах. Это делает синтаксический разбор отформатированных запросов изменений менее неоднозначным.

Тип: `Bool`

По умолчанию: `0`
## ignore_empty_sql_security_in_create_view_query {#ignore_empty_sql_security_in_create_view_query}

Если это истинно, ClickHouse не записывает значения по умолчанию для пустого SQL-заявления безопасности в запросах `CREATE VIEW`.

:::note
Эта настройка необходима только на период миграции и станет устаревшей в 24.4
:::

Тип: `Bool`

По умолчанию: `1`
## merge_workload {#merge_workload}

Используется для регулировки того, как ресурсы используются и распределяются между слияниями и другими рабочими нагрузками. Указанное значение используется как значение настройки `workload` для всех фоновых слияний. Может быть переопределено настройкой дерева слияния.

Тип: `String`

По умолчанию: `default`

**См. также**
- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)
## mutation_workload {#mutation_workload}

Используется для регулировки того, как ресурсы используются и распределяются между мутациями и другими рабочими нагрузками. Указанное значение используется как значение настройки `workload` для всех фоновых мутаций. Может быть переопределено настройкой дерева слияния.

**См. также**
- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)

Тип: `String`

По умолчанию: `default`
## throw_on_unknown_workload {#throw_on_unknown_workload}

Определяет поведение при доступе к неизвестной WORKLOAD с настройкой запроса 'workload'.

- Если `true`, исключение RESOURCE_ACCESS_DENIED будет выброшено из запроса, который пытается получить доступ к неизвестной нагрузке. Полезно для обеспечения планирования ресурсов для всех запросов после установления иерархии WORKLOAD и наличия WORKLOAD по умолчанию.
- Если `false` (по умолчанию), предоставляется неограниченный доступ без планирования ресурсов для запроса с настройкой 'workload', указывающей на неизвестную WORKLOAD. Это важно во время настройки иерархии WORKLOAD, прежде чем будет добавлено значение по умолчанию.

**См. также**
- [Планирование рабочих нагрузок](/operations/workload-scheduling.md)

Тип: String

По умолчанию: false

**Пример**

```xml
<throw_on_unknown_workload>true</throw_on_unknown_workload>
```
## workload_path {#workload_path}

Каталог, используемый в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется папка `/workload/` в рабочем каталоге сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**См. также**
- [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path}

Путь к узлу ZooKeeper, который используется в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для согласованности все SQL-определения хранятся как значение этого единственного znode. По умолчанию ZooKeeper не используется и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**См. также**
- [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
## use_legacy_mongodb_integration {#use_legacy_mongodb_integration}

Использовать устаревшую реализацию интеграции с MongoDB. Устарело.

Тип: `Bool`

По умолчанию: `true`.
## max_authentication_methods_per_user {#max_authentication_methods_per_user}

Максимальное количество методов аутентификации, с которыми может быть создан или изменён пользователь.
Изменение этой настройки не влияет на существующих пользователей. Запросы на создание/изменение, связанные с аутентификацией, завершатся неудачей, если они превышают лимит, указанный в этой настройке.
Запросы на создание/изменение, не связанные с аутентификацией, будут успешными.

:::note
Значение `0` означает безлимитность.
:::

Тип: `UInt64`

По умолчанию: `100`
## allow_feature_tier {#allow_feature_tier}

Контролирует, может ли пользователь изменять настройки, связанные с различными уровнями функций.

- `0` - Изменения любых настроек разрешены (экспериментальные, бета, производственные).
- `1` - Разрешены только изменения настроек бета и производственной версии. Изменения экспериментальных настроек отклоняются.
- `2` - Разрешены только изменения производственных настроек. Изменения экспериментальных или бета-настроек отклоняются.

Это эквивалентно установке ограничения только для чтения на все функции `EXPERIMENTAL` / `BETA`.

:::note
Значение `0` означает, что все настройки могут быть изменены.
:::

Тип: `UInt32`

По умолчанию: `0`

