---
description: 'Документация по операторам SYSTEM'
sidebar_label: 'SYSTEM'
sidebar_position: 36
slug: /sql-reference/statements/system
title: 'Операторы SYSTEM'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Операторы SYSTEM {#system-statements}

## SYSTEM RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

Перезагружает все [внутренние словари](../../sql-reference/dictionaries/index.md).
По умолчанию внутренние словари отключены.
Всегда возвращает `Ok.` независимо от результата обновления внутреннего словаря.

## SYSTEM RELOAD DICTIONARIES {#reload-dictionaries}

Запрос `SYSTEM RELOAD DICTIONARIES` перезагружает словари со статусом `LOADED` (см. столбец `status` в [`system.dictionaries`](/operations/system-tables/dictionaries)), то есть словари, которые ранее были успешно загружены.
По умолчанию словари загружаются по требованию (см. [dictionaries&#95;lazy&#95;load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)), поэтому вместо автоматической загрузки при запуске они инициализируются при первом обращении через функцию [`dictGet`](/sql-reference/functions/ext-dict-functions#dictGet) или при выполнении `SELECT` из таблиц с `ENGINE = Dictionary`.

**Синтаксис**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD DICTIONARY {#reload-dictionary}

Полностью перезагружает словарь `dictionary_name` вне зависимости от его состояния (LOADED / NOT&#95;LOADED / FAILED).
Всегда возвращает `Ok.` независимо от того, удалось обновить словарь или нет.

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

Статус словаря можно проверить, выполнив запрос к таблице `system.dictionaries`.

```sql
SELECT name, status FROM system.dictionaries;
```


## SYSTEM RELOAD MODELS {#reload-models}

:::note
Эта команда и `SYSTEM RELOAD MODEL` только выгружают модели CatBoost из clickhouse-library-bridge. Функция `catboostEvaluate()`
загружает модель при первом обращении, если она ещё не загружена.
:::

Выгружает все модели CatBoost.

**Синтаксис**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD MODEL {#reload-model}

Выгружает модель CatBoost, расположенную по пути `model_path`.

**Синтаксис**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```


## SYSTEM RELOAD FUNCTIONS {#reload-functions}

Перезагружает все зарегистрированные [исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions) или одну из них из конфигурационного файла.

**Синтаксис**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```


## SYSTEM RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

Повторно вычисляет все [асинхронные метрики](../../operations/system-tables/asynchronous_metrics.md). Поскольку асинхронные метрики периодически обновляются на основе настройки [asynchronous&#95;metrics&#95;update&#95;period&#95;s](../../operations/server-configuration-parameters/settings.md), их ручное обновление с помощью этой команды, как правило, не требуется.

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```


## SYSTEM DROP DNS CACHE {#drop-dns-cache}

Очищает внутренний DNS‑кэш ClickHouse. Иногда, в старых версиях ClickHouse, при изменении инфраструктуры (например, при смене IP‑адреса другого сервера ClickHouse или сервера, используемого словарями) необходимо использовать эту команду.

Для более удобного (автоматического) управления кэшем см. параметры `disable_internal_dns_cache`, `dns_cache_max_entries`, `dns_cache_update_period`.

## SYSTEM DROP MARK CACHE {#drop-mark-cache}

Очищает кеш меток.

## SYSTEM DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

Очищает кеш метаданных Iceberg.

## SYSTEM DROP TEXT INDEX CACHES {#drop-text-index-caches}

Очищает кеш заголовков текстового индекса, кеш словаря и кеш постингов.

Если вы хотите очистить один из этих кешей по отдельности, выполните:

- `SYSTEM DROP TEXT INDEX HEADER CACHE`,
- `SYSTEM DROP TEXT INDEX DICTIONARY CACHE` или
- `SYSTEM DROP TEXT INDEX POSTINGS CACHE`

## SYSTEM DROP REPLICA {#drop-replica}

Неактивные реплики таблиц `ReplicatedMergeTree` можно удалить с помощью следующего синтаксиса:

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

Запросы удаляют путь реплики `ReplicatedMergeTree` в Zookeeper. Это полезно, когда реплика «мертвая» и её метаданные не могут быть удалены из Zookeeper командой `DROP TABLE`, потому что такой таблицы больше не существует. Будет удалена только неактивная или устаревшая реплика; локальную реплику этим способом удалить нельзя, для этого используйте `DROP TABLE`. `DROP REPLICA` не удаляет никакие таблицы и не удаляет данные или метаданные с диска.

Первый вариант удаляет метаданные реплики `'replica_name'` таблицы `database.table`.
Второй делает то же самое для всех реплицированных таблиц в базе данных.
Третий делает то же самое для всех реплицированных таблиц на локальном сервере.
Четвёртый полезен для удаления метаданных мёртвой реплики, когда все остальные реплики таблицы были удалены. Он требует явного указания пути таблицы. Путь должен совпадать с тем, который был передан в первый аргумент движка `ReplicatedMergeTree` при создании таблицы.

## SYSTEM DROP DATABASE REPLICA {#drop-database-replica}

Мёртвые реплики баз данных типа `Replicated` можно удалить с помощью следующего синтаксиса:

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

Аналогично `SYSTEM DROP REPLICA`, но удаляет путь реплики базы данных `Replicated` из ZooKeeper, когда нет базы данных, к которой можно применить `DROP DATABASE`. Обратите внимание, что эта команда не удаляет реплики `ReplicatedMergeTree` (поэтому вам также может понадобиться `SYSTEM DROP REPLICA`). Имена сегмента и реплики — это имена, которые были указаны в аргументах движка `Replicated` при создании базы данных. Также эти имена можно получить из столбцов `database_shard_name` и `database_replica_name` в `system.clusters`. Если предложение `FROM SHARD` отсутствует, то `replica_name` должен быть полным именем реплики в формате `shard_name|replica_name`.


## SYSTEM DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

Очищает кэш несжатых данных.
Кэш несжатых данных включается и отключается с помощью настройки на уровне запроса, USER или профиля [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache).
Его размер можно настроить с помощью серверной настройки [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size).

## SYSTEM DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

Очищает кеш скомпилированных выражений.
Кеш скомпилированных выражений включается и отключается с помощью настройки [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) на уровне запроса, USER или профиля.

## SYSTEM DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

Очищает кеш условий запроса.

## SYSTEM DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

Очищает [кеш запросов](../../operations/query-cache.md).
Если указан тег, удаляются только записи кеша запросов, помеченные этим тегом.

## SYSTEM DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

Очищает кэш для схем, загруженных из [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path).

Поддерживаемые варианты:

* Protobuf: Удаляет из памяти импортированные определения сообщений Protobuf.
* Files: Удаляет из кэша локально сохранённые файлы схем в [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path), которые были сгенерированы, когда для `format_schema_source` установлено значение `query`.
  Примечание: если вариант не указан, оба кэша очищаются.

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf/Files]
```


## SYSTEM FLUSH LOGS {#flush-logs}

Сбрасывает буферизованные сообщения журнала в системные таблицы, например system.query&#95;log. В основном полезно для отладки, так как большинство системных таблиц имеют интервал сброса по умолчанию 7,5 секунды.
Команда также создаёт системные таблицы, даже если очередь сообщений пуста.

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

Если не требуется сбрасывать все логи, можно сбросить один или несколько отдельных, указав либо их имя, либо целевую таблицу:

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```


## SYSTEM RELOAD CONFIG {#reload-config}

Перезагружает конфигурацию ClickHouse. Используется, когда конфигурация хранится в ZooKeeper. Обратите внимание, что `SYSTEM RELOAD CONFIG` не перезагружает конфигурацию `USER`, хранящуюся в ZooKeeper, а только конфигурацию `USER`, которая хранится в `users.xml`. Чтобы перезагрузить всю конфигурацию `USER`, используйте `SYSTEM RELOAD USERS`.

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD USERS {#reload-users}

Перезагружает все хранилища доступа, включая users.xml, хранилище доступа на локальном диске и реплицируемое (в ZooKeeper) хранилище доступа.

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```


## SYSTEM SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

Обычно завершает работу сервера ClickHouse (аналогично `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`)

## SYSTEM KILL {#kill}

Принудительно завершает процесс ClickHouse (например, как `kill -9 {$ pid_clickhouse-server}`)

## SYSTEM INSTRUMENT {#instrument}

Управляет точками инструментирования с помощью функции XRay в LLVM, доступной, когда ClickHouse собран с параметром `ENABLE_XRAY=1`.
Это позволяет выполнять отладку и профилирование в продакшене без изменения исходного кода и с минимальными накладными расходами.
Когда не добавлено ни одной точки инструментирования, штраф по производительности пренебрежимо мал, поскольку добавляется лишь один дополнительный переход
на близкий адрес в прологе и эпилоге тех функций, которые содержат более 200 инструкций.

### SYSTEM INSTRUMENT ADD {#instrument-add}

Добавляет новую точку инструментирования. Инструментированные функции можно просмотреть в системной таблице [`system.instrumentation`](../../operations/system-tables/instrumentation.md). Для одной и той же функции можно добавить более одного обработчика, и они будут выполняться в том же порядке, в котором было добавлено инструментирование.
Функции для инструментирования можно получить из системной таблицы [`system.symbols`](../../operations/system-tables/symbols.md).

Существует три разных типа обработчиков, которые можно добавить к функциям:

**Синтаксис**

```sql
SYSTEM INSTRUMENT ADD FUNCTION HANDLER [PARAMETERS]
```

где `FUNCTION` — любая функция или подстрока имени функции, например `QueryMetricLog::startQuery`, а обработчик — один из следующих вариантов

#### LOG {#instrument-add-log}

Выводит переданный в аргументе текст и стек вызовов при `ENTRY` или `EXIT` функции.

```sql
SYSTEM INSTRUMENT ADD `QueryMetricLog::startQuery` LOG ENTRY 'this is a log printed at entry'
SYSTEM INSTRUMENT ADD `QueryMetricLog::startQuery` LOG EXIT 'this is a log printed at exit'
```


#### SLEEP {#instrument-add-sleep}

Приостанавливает выполнение на фиксированное число секунд при `ENTRY` или `EXIT`:

```sql
SYSTEM INSTRUMENT ADD `QueryMetricLog::startQuery` SLEEP ENTRY 0.5
```

или — для равномерно распределённого случайного интервала в секундах, указав минимум и максимум через пробел:

```sql
SYSTEM INSTRUMENT ADD `QueryMetricLog::startQuery` SLEEP ENTRY 0 1
```


#### PROFILE {#instrument-add-profile}

Измеряет время, прошедшее между `ENTRY` и `EXIT` функции.
Результаты профилирования сохраняются в [`system.trace_log`](../../operations/system-tables/trace_log.md) и могут быть преобразованы
в [Chrome Event Trace Format](../../operations/system-tables/trace_log.md#chrome-event-trace-format).

```sql
SYSTEM INSTRUMENT ADD `QueryMetricLog::startQuery` PROFILE
```


### SYSTEM INSTRUMENT REMOVE {#instrument-remove}

Удаляет одну точку инструментирования с помощью:

```sql
SYSTEM INSTRUMENT REMOVE ID
```

во всех используется параметр `ALL`:

```sql
SYSTEM INSTRUMENT REMOVE ALL
```

или набор идентификаторов из подзапроса:

```sql
SYSTEM INSTRUMENT REMOVE (SELECT id FROM system.instrumentation WHERE handler = 'log')
```

Идентификатор точки инструментации можно получить из системной таблицы [`system.instrumentation`](../../operations/system-tables/instrumentation.md).


## Управление distributed таблицами {#managing-distributed-tables}

ClickHouse может работать с [distributed](../../engines/table-engines/special/distributed.md) таблицами. При вставке данных в такие таблицы ClickHouse сначала создаёт очередь данных для отправки на узлы кластера, а затем асинхронно отправляет их. Вы можете управлять обработкой очереди с помощью запросов [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends), [FLUSH DISTRIBUTED](#flush-distributed) и [`START DISTRIBUTED SENDS`](#start-distributed-sends). Вы также можете выполнять синхронную вставку данных в distributed таблицы с помощью настройки [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert).

### SYSTEM STOP DISTRIBUTED SENDS {#stop-distributed-sends}

Отключает фоновое распределение данных при вставке данных в distributed таблицы.

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
Если параметр [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) включён (по умолчанию), данные всё равно будут вставляться в локальный сегмент.
:::

### SYSTEM FLUSH DISTRIBUTED {#flush-distributed}

Принудительно инициирует синхронную отправку данных на узлы кластера в ClickHouse. Если какие-либо узлы недоступны, ClickHouse выбрасывает исключение и останавливает выполнение запроса. Вы можете повторять запрос до тех пор, пока он не выполнится успешно, то есть когда все узлы снова будут доступны.

Вы также можете переопределить некоторые настройки с помощью предложения `SETTINGS` — это может быть полезно для обхода временных ограничений, таких как `max_concurrent_queries_for_all_users` или `max_memory_usage`.

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
Каждый ожидающий отправки блок хранится на диске с настройками из исходного запроса INSERT, поэтому иногда может потребоваться переопределить эти настройки.
:::


### SYSTEM START DISTRIBUTED SENDS {#start-distributed-sends}

Включает фоновую отправку данных при вставке в distributed таблицы.

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```


### SYSTEM STOP LISTEN {#stop-listen}

Закрывает сокет и корректно завершает активные подключения к серверу на указанном порту с указанным протоколом.

Однако, если соответствующие настройки протокола не заданы в конфигурации clickhouse-server, эта команда не окажет эффекта.

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

* Если указан модификатор `CUSTOM 'protocol'`, будет остановлен пользовательский протокол с указанным именем, определённый в разделе `protocols` конфигурации сервера.
* Если указан модификатор `QUERIES ALL [EXCEPT .. [,..]]`, будут остановлены все протоколы, за исключением протоколов, перечисленных в выражении `EXCEPT`.
* Если указан модификатор `QUERIES DEFAULT [EXCEPT .. [,..]]`, будут остановлены все протоколы по умолчанию, за исключением протоколов, перечисленных в выражении `EXCEPT`.
* Если указан модификатор `QUERIES CUSTOM [EXCEPT .. [,..]]`, будут остановлены все пользовательские протоколы, за исключением протоколов, перечисленных в выражении `EXCEPT`.


### SYSTEM START LISTEN {#start-listen}

Включает приём новых подключений по указанным протоколам.

Однако если сервер на указанном порту и протоколе не был остановлен с помощью команды SYSTEM STOP LISTEN, эта команда не будет иметь эффекта.

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```


## Управление таблицами MergeTree {#managing-mergetree-tables}

ClickHouse может управлять фоновыми процессами в таблицах [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

### SYSTEM STOP MERGES {#stop-merges}

<CloudNotSupportedBadge />

Позволяет остановить фоновые слияния для таблиц семейства MergeTree:

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
Выполнение `DETACH / ATTACH` таблицы запустит фоновые слияния для этой таблицы, даже если слияния ранее были остановлены для всех таблиц MergeTree.
:::

### SYSTEM START MERGES {#start-merges}

<CloudNotSupportedBadge />

Команда позволяет запускать фоновые слияния для таблиц семейства MergeTree:

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```


### SYSTEM STOP TTL MERGES {#stop-ttl-merges}

Позволяет остановить фоновое удаление старых данных в соответствии с [выражением TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц семейства MergeTree.
Возвращает `Ok.` даже если таблица не существует или таблица не использует движок MergeTree. Возвращает ошибку, если база данных не существует.

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM START TTL MERGES {#start-ttl-merges}

Позволяет запустить фоновое удаление устаревших данных в соответствии с [выражением TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц семейства MergeTree.
Возвращает `Ok.` даже если таблица не существует. Возвращает ошибку, если база данных не существует.

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM STOP MOVES {#stop-moves}

Позволяет остановить фоновое перемещение данных в соответствии с [TTL-выражением таблицы с оператором TO VOLUME или TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц семейства MergeTree:
Возвращает `Ok.` даже если таблица не существует. Возвращает ошибку, если база данных не существует:

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM START MOVES {#start-moves}

Предоставляет возможность запустить фоновое перемещение данных в соответствии с [TTL-выражением таблицы с предложениями TO VOLUME и TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц семейства MergeTree.
Возвращает `Ok.` даже в случае, если таблица не существует. Возвращает ошибку, если база данных не существует.

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM SYSTEM UNFREEZE {#query_language-system-unfreeze}

Очищает замороженный бэкап с указанным именем на всех дисках. Подробнее о разморозке отдельных частей см. в [ALTER TABLE table&#95;name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```


### SYSTEM WAIT LOADING PARTS {#wait-loading-parts}

Ожидает, пока все асинхронно загружаемые части таблицы (устаревшие части данных) не будут загружены.

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```


## Управление таблицами ReplicatedMergeTree {#managing-replicatedmergetree-tables}

ClickHouse может управлять процессами фоновой репликации в таблицах [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication).

### SYSTEM STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge />

Позволяет остановить фоновую загрузку вставленных частей для таблиц семейства `ReplicatedMergeTree`:
Всегда возвращает `Ok.` независимо от движка таблицы и даже если таблица или база данных не существует.

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START FETCHES {#start-fetches}

<CloudNotSupportedBadge />

Предоставляет возможность запустить фоновые операции FETCH для вставленных частей в таблицах семейства `ReplicatedMergeTree`.
Всегда возвращает `Ok.` независимо от движка таблицы и даже если таблица или база данных не существует.

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP REPLICATED SENDS {#stop-replicated-sends}

Позволяет остановить фоновую отправку на другие реплики в кластере новых частей, вставляемых в таблицы семейства `ReplicatedMergeTree`:

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START REPLICATED SENDS {#start-replicated-sends}

Позволяет запустить фоновые отправки новых вставленных частей другим репликам кластера для таблиц семейства `ReplicatedMergeTree`:

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP REPLICATION QUEUES {#stop-replication-queues}

Позволяет остановить фоновые задачи выборки из очередей репликации, которые хранятся в ZooKeeper для таблиц семейства `ReplicatedMergeTree`. Возможные типы фоновых задач — слияния, выборки, мутации, DDL-команды с предложением ON CLUSTER:

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START REPLICATION QUEUES {#start-replication-queues}

Позволяет запустить фоновые задачи выборки из очередей репликации, которые хранятся в ZooKeeper для таблиц семейства `ReplicatedMergeTree`. Возможные типы фоновых задач — слияния, выборки, мутации, DDL‑команды с предложением ON CLUSTER:

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

Прекращает чтение новых записей из журнала репликации и помещение их в очередь репликации в таблице `ReplicatedMergeTree`.

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START PULLING REPLICATION LOG {#start-pulling-replication-log}

Отменяет команду `SYSTEM STOP PULLING REPLICATION LOG`.

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM SYNC REPLICA {#sync-replica}

Ожидает синхронизации таблицы `ReplicatedMergeTree` с другими репликами в кластере, но не более `receive_timeout` секунд.

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

После выполнения этого оператора `[db.]replicated_merge_tree_family_table_name` загружает команды из общего журнала репликации в свою собственную очередь репликации, после чего запрос ожидает, пока реплика обработает все полученные команды. Поддерживаются следующие модификаторы:

* С модификатором `IF EXISTS` (доступен начиная с 25.6) запрос не будет выдавать ошибку, если таблица не существует. Это полезно при добавлении новой реплики в кластер, когда она уже является частью конфигурации кластера, но таблица ещё находится в процессе создания и синхронизации.
* Если указан модификатор `STRICT`, то запрос ожидает, пока очередь репликации не станет пустой. Вариант `STRICT` может никогда не завершиться успешно, если в очереди репликации постоянно появляются новые записи.
* Если указан модификатор `LIGHTWEIGHT`, то запрос ожидает только обработки записей `GET_PART`, `ATTACH_PART`, `DROP_RANGE`, `REPLACE_RANGE` и `DROP_PART`.
  Дополнительно модификатор `LIGHTWEIGHT` поддерживает необязательное предложение `FROM 'srcReplicas'`, где `'srcReplicas'` — это список имён исходных реплик, разделённых запятыми. Это расширение обеспечивает более точечную синхронизацию, фокусируясь только на задачах репликации, исходящих от указанных реплик-источников.
* Если указан модификатор `PULL`, то запрос подтягивает новые записи очереди репликации из ZooKeeper, но не ожидает обработки каких-либо записей.


### SYNC DATABASE REPLICA {#sync-database-replica}

Ожидает, пока указанная [реплицируемая база данных](/engines/database-engines/replicated) не применит все изменения схемы из очереди DDL этой базы данных.

**Синтаксис**

```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```


### SYSTEM RESTART REPLICA {#restart-replica}

Позволяет повторно инициализировать состояние сессии ZooKeeper для таблицы `ReplicatedMergeTree`: текущее состояние будет сопоставлено с ZooKeeper как источником истины, и при необходимости в очередь ZooKeeper будут добавлены задания.
Инициализация очереди репликации на основе данных ZooKeeper происходит так же, как для оператора `ATTACH TABLE`. В течение короткого времени таблица будет недоступна для любых операций.

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```


### SYSTEM RESTORE REPLICA {#restore-replica}

Восстанавливает реплику, если данные (возможно) присутствуют, но метаданные ZooKeeper утеряны.

Работает только с таблицами `ReplicatedMergeTree` в режиме только для чтения (readonly).

Запрос можно выполнить после:

- потери корня ZooKeeper `/`;
- потери пути реплик `/replicas`;
- потери пути отдельной реплики `/replicas/replica_name/`.

Реплика прикрепляет локально найденные части и отправляет информацию о них в ZooKeeper.
Части, присутствовавшие на реплике до потери метаданных, не загружаются повторно с других реплик, если они не устарели (то есть восстановление реплики не означает повторную загрузку всех данных по сети).

:::note
Все части во всех состояниях перемещаются в папку `detached/`. Части, которые были активны до потери данных (committed), прикрепляются.
:::

### SYSTEM RESTORE DATABASE REPLICA {#restore-database-replica}

Восстанавливает реплику, если данные, возможно, присутствуют, но метаданные Zookeeper утеряны.

**Синтаксис**

```sql
SYSTEM RESTORE DATABASE REPLICA repl_db [ON CLUSTER cluster]
```

**Пример**

```sql
CREATE DATABASE repl_db
ENGINE=Replicated("/clickhouse/repl_db", shard1, replica1);

CREATE TABLE repl_db.test_table (n UInt32)
ENGINE = ReplicatedMergeTree
ORDER BY n PARTITION BY n % 10;

-- zookeeper_delete_path("/clickhouse/repl_db", recursive=True) <- root loss.

SYSTEM RESTORE DATABASE REPLICA repl_db;
```

**Синтаксис**

```sql
SYSTEM RESTORE REPLICA [db.]replicated_merge_tree_family_table_name [ON CLUSTER cluster_name]
```

Другой синтаксис:

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**Пример**

Создание таблицы на нескольких серверах. После потери метаданных реплики в Zookeeper таблица подключится в режиме только чтения, так как метаданные отсутствуют. Последний запрос должен быть выполнен на каждой реплике.

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- root loss.

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

Другой способ:

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```

### SYSTEM RESTART REPLICAS {#restart-replicas}

Позволяет переинициализировать состояние сессий ZooKeeper для всех таблиц `ReplicatedMergeTree`, сравнивает текущее состояние с ZooKeeper как источником истины и при необходимости добавляет задания в очередь ZooKeeper.

### SYSTEM DROP FILESYSTEM CACHE {#drop-filesystem-cache}

Позволяет сбросить кеш файловой системы.

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYSTEM SYNC FILE CACHE {#sync-file-cache}

:::note
Операция слишком ресурсоёмкая и может быть легко использована неправильно.
:::

Вызывает системный вызов sync.

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```


### SYSTEM LOAD PRIMARY KEY {#load-primary-key}

Загрузить первичные ключи для заданной таблицы или для всех таблиц.

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```


### SYSTEM UNLOAD PRIMARY KEY {#unload-primary-key}

Выгрузить первичные ключи для указанной таблицы или для всех таблиц.

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```


## Управление Refreshable Materialized Views {#refreshable-materialized-views}

Команды для управления фоновыми задачами, выполняемыми [Refreshable Materialized Views](../../sql-reference/statements/create/view.md#refreshable-materialized-view).

При работе с ними отслеживайте таблицу [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md).

### SYSTEM REFRESH VIEW {#refresh-view}

Запускает немедленное внеплановое обновление указанного представления.

```sql
SYSTEM REFRESH VIEW [db.]name
```

### SYSTEM WAIT VIEW {#wait-view}

Ожидает завершения текущего обновления, выполняющегося в данный момент. Если обновление завершается с ошибкой, генерируется исключение. Если обновление не выполняется, немедленно завершает выполнение, генерируя исключение, если предыдущее обновление завершилось с ошибкой.

### SYSTEM STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

Отключает периодическое обновление указанного представления или всех обновляемых представлений. Если обновление уже выполняется, также отменяет его.

Если представление находится в базе данных Replicated или Shared, `STOP VIEW` влияет только на текущую реплику, тогда как `STOP REPLICATED VIEW` влияет на все реплики.

```sql
SYSTEM STOP VIEW [db.]name
```

```sql
SYSTEM STOP VIEWS
```

### SYSTEM START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

Запускает периодическое обновление для указанного представления или для всех представлений с поддержкой обновления. Немедленное обновление при этом не выполняется.

Если представление находится в базе данных типа Replicated или Shared, `START VIEW` отменяет действие `STOP VIEW`, а `START REPLICATED VIEW` отменяет действие `STOP REPLICATED VIEW`.

```sql
SYSTEM START VIEW [db.]name
```

```sql
SYSTEM START VIEWS
```


### SYSTEM CANCEL VIEW {#cancel-view}

Если для указанного представления на текущей реплике в данный момент выполняется обновление, команда прерывает и отменяет его; в противном случае ничего не происходит.

```sql
SYSTEM CANCEL VIEW [db.]name
```


### SYSTEM WAIT VIEW {#system-wait-view}

Ожидает завершения текущего обновления. Если обновление не выполняется, немедленно возвращает управление. Если последняя попытка обновления завершилась с ошибкой, генерирует ошибку.

Может использоваться сразу после создания нового refreshable materialized view (без ключевого слова EMPTY), чтобы дождаться завершения начального обновления.

Если представление находится в базе данных Replicated или Shared и обновление выполняется на другой реплике, ожидает завершения этого обновления.

```sql
SYSTEM WAIT VIEW [db.]name
```
