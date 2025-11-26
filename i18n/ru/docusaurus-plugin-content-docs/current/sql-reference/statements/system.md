---
description: 'Документация по операторам SYSTEM'
sidebar_label: 'SYSTEM'
sidebar_position: 36
slug: /sql-reference/statements/system
title: 'Операторы SYSTEM'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Операторы SYSTEM



## SYSTEM RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

Перезагружает все [внутренние словари](../../sql-reference/dictionaries/index.md).
По умолчанию внутренние словари отключены.
Всегда возвращает `Ok.` независимо от результата обновления внутреннего словаря.


## SYSTEM RELOAD DICTIONARIES {#reload-dictionaries}

Перезагружает все словари, которые были успешно загружены ранее.
По умолчанию словари загружаются по требованию (см. [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)), поэтому вместо автоматической загрузки при запуске они инициализируются при первом обращении через функцию dictGet или SELECT из таблиц с ENGINE = Dictionary. Запрос `SYSTEM RELOAD DICTIONARIES` перезагружает такие словари (LOADED).
Всегда возвращает `Ok.` независимо от результата обновления словаря.

**Синтаксис**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD DICTIONARY {#reload-dictionary}

Полностью перезагружает словарь `dictionary_name` независимо от его состояния (LOADED / NOT_LOADED / FAILED).
Всегда возвращает `Ok.` независимо от результата обновления словаря.

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

Статус словаря можно проверить, выполнив запрос к таблице `system.dictionaries`.

```sql
SELECT name, status FROM system.dictionaries;
```


## SYSTEM RELOAD MODELS {#reload-models}

:::note
Эта команда и `SYSTEM RELOAD MODEL` только выгружают модели CatBoost из clickhouse-library-bridge. Функция `catboostEvaluate()` загружает модель при первом обращении, если она ещё не загружена.
:::

Выгружает все модели CatBoost.

**Синтаксис**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD MODEL {#reload-model}

Перезагружает модель CatBoost, расположенную по пути `model_path`.

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

Пересчитывает все [асинхронные метрики](../../operations/system-tables/asynchronous_metrics.md). Поскольку асинхронные метрики периодически обновляются на основе параметра [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md), их ручное обновление с помощью данной команды обычно не требуется.

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```


## SYSTEM DROP DNS CACHE {#drop-dns-cache}

Очищает внутренний DNS-кеш ClickHouse. В некоторых случаях (для старых версий ClickHouse) необходимо использовать эту команду при изменении инфраструктуры (например, при изменении IP-адреса другого сервера ClickHouse или сервера, используемого словарями).

Для более удобного (автоматического) управления кешем см. параметры `disable_internal_dns_cache`, `dns_cache_max_entries`, `dns_cache_update_period`.


## SYSTEM DROP MARK CACHE {#drop-mark-cache}

Очищает кеш засечек.


## SYSTEM DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

Очищает кэш метаданных Iceberg.


## SYSTEM DROP TEXT INDEX DICTIONARY CACHE {#drop-text-index-dictionary-cache}

Очищает кэш словаря текстового индекса.


## SYSTEM DROP TEXT INDEX HEADER CACHE {#drop-text-index-header-cache}

Очищает кеш заголовков текстовых индексов.


## SYSTEM DROP TEXT INDEX POSTINGS CACHE {#drop-text-index-postings-cache}

Очищает кэш постингов текстового индекса.


## SYSTEM DROP TEXT INDEX CACHES {#drop-text-index-caches}

Очищает кэш заголовков текстового индекса, кэш словаря и кэш постингов.


## SYSTEM DROP REPLICA {#drop-replica}

Неактивные реплики таблиц `ReplicatedMergeTree` можно удалить с помощью следующего синтаксиса:

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

Запросы удаляют путь реплики `ReplicatedMergeTree` в ZooKeeper. Это полезно, когда реплика неактивна и её метаданные невозможно удалить из ZooKeeper командой `DROP TABLE`, поскольку такой таблицы больше не существует. Команда удаляет только неактивные/устаревшие реплики и не может удалить локальную реплику — для этого используйте `DROP TABLE`. `DROP REPLICA` не удаляет таблицы и не удаляет данные или метаданные с диска.

Первый вариант удаляет метаданные реплики `'replica_name'` таблицы `database.table`.
Второй выполняет то же самое для всех реплицируемых таблиц в базе данных.
Третий выполняет то же самое для всех реплицируемых таблиц на локальном сервере.
Четвёртый вариант полезен для удаления метаданных неактивной реплики, когда все остальные реплики таблицы были удалены. Требуется явно указать путь к таблице. Это должен быть тот же путь, который был передан в качестве первого аргумента движка `ReplicatedMergeTree` при создании таблицы.


## SYSTEM DROP DATABASE REPLICA {#drop-database-replica}

Неработающие реплики баз данных `Replicated` можно удалить с помощью следующего синтаксиса:

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

Аналогично `SYSTEM DROP REPLICA`, но удаляет путь реплики базы данных `Replicated` из ZooKeeper в случае, когда отсутствует база данных для выполнения `DROP DATABASE`. Обратите внимание, что данная команда не удаляет реплики `ReplicatedMergeTree` (поэтому может также потребоваться выполнение `SYSTEM DROP REPLICA`). Имена шарда и реплики — это имена, которые были указаны в аргументах движка `Replicated` при создании базы данных. Эти имена также можно получить из столбцов `database_shard_name` и `database_replica_name` в таблице `system.clusters`. Если предложение `FROM SHARD` отсутствует, то `replica_name` должно быть полным именем реплики в формате `shard_name|replica_name`.


## SYSTEM DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

Очищает кэш несжатых данных.
Кэш несжатых данных включается и отключается с помощью настройки [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache) на уровне запроса, пользователя или профиля.
Размер кэша настраивается с помощью серверной настройки [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size).


## SYSTEM DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

Очищает кэш скомпилированных выражений.
Кэш скомпилированных выражений включается и отключается с помощью настройки [`compile_expressions`](../../operations/settings/settings.md#compile_expressions) на уровне запроса, пользователя или профиля.


## SYSTEM DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

Очищает кеш условий запроса.


## SYSTEM DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

Очищает [кеш запросов](../../operations/query-cache.md).
Если указан тег, удаляются только записи кеша запросов с указанным тегом.


## SYSTEM DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

Очищает кэш схем, загруженных из [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path).

Поддерживаемые типы:

- Protobuf: Удаляет из памяти импортированные определения сообщений Protobuf.
- Files: Удаляет кэшированные файлы схем, хранящиеся локально в [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path), которые создаются при установке `format_schema_source` в значение `query`.
  Примечание: Если тип не указан, очищаются оба кэша.

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf/Files]
```


## SYSTEM FLUSH LOGS {#flush-logs}

Сбрасывает буферизованные сообщения журнала в системные таблицы, например system.query_log. Полезна в основном для отладки, так как большинство системных таблиц имеют интервал сброса по умолчанию 7,5 секунд.
Эта команда также создаст системные таблицы, даже если очередь сообщений пуста.

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

Если не требуется сбрасывать всё, можно сбросить один или несколько отдельных журналов, указав их имя или целевую таблицу:

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```


## SYSTEM RELOAD CONFIG {#reload-config}

Перезагружает конфигурацию ClickHouse. Используется, когда конфигурация хранится в ZooKeeper. Обратите внимание, что `SYSTEM RELOAD CONFIG` не перезагружает конфигурацию пользователей (`USER`), хранящуюся в ZooKeeper, а только конфигурацию пользователей из файла `users.xml`. Для перезагрузки всей конфигурации пользователей используйте `SYSTEM RELOAD USERS`.

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD USERS {#reload-users}

Перезагружает все хранилища управления доступом, включая: users.xml, локальное дисковое хранилище доступа, реплицируемое (в ZooKeeper) хранилище доступа.

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```


## SYSTEM SHUTDOWN {#shutdown}

<CloudNotSupportedBadge />

Корректно завершает работу ClickHouse (аналогично командам `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`)


## SYSTEM KILL {#kill}

Завершает процесс ClickHouse (аналогично `kill -9 {$ pid_clickhouse-server}`)


## Управление распределёнными таблицами {#managing-distributed-tables}

ClickHouse может управлять [распределёнными](../../engines/table-engines/special/distributed.md) таблицами. Когда пользователь вставляет данные в эти таблицы, ClickHouse сначала создаёт очередь данных, которые должны быть отправлены на узлы кластера, а затем асинхронно отправляет их. Управлять обработкой очереди можно с помощью запросов [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends), [FLUSH DISTRIBUTED](#flush-distributed) и [`START DISTRIBUTED SENDS`](#start-distributed-sends). Также можно синхронно вставлять распределённые данные с помощью настройки [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert).

### SYSTEM STOP DISTRIBUTED SENDS {#stop-distributed-sends}

Отключает фоновое распределение данных при вставке данных в распределённые таблицы.

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
Если включена настройка [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) (по умолчанию), данные в локальный шард всё равно будут вставлены.
:::

### SYSTEM FLUSH DISTRIBUTED {#flush-distributed}

Заставляет ClickHouse синхронно отправлять данные на узлы кластера. Если какие-либо узлы недоступны, ClickHouse выбрасывает исключение и останавливает выполнение запроса. Запрос можно повторять до тех пор, пока он не выполнится успешно, что произойдёт, когда все узлы снова будут в сети.

Также можно переопределить некоторые настройки с помощью секции `SETTINGS`, что может быть полезно для обхода некоторых временных ограничений, таких как `max_concurrent_queries_for_all_users` или `max_memory_usage`.

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
Каждый ожидающий блок хранится на диске с настройками из исходного запроса INSERT, поэтому иногда может потребоваться переопределить настройки.
:::

### SYSTEM START DISTRIBUTED SENDS {#start-distributed-sends}

Включает фоновое распределение данных при вставке данных в распределённые таблицы.

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### SYSTEM STOP LISTEN {#stop-listen}

Закрывает сокет и корректно завершает существующие соединения с сервером на указанном порту с указанным протоколом.

Однако если соответствующие настройки протокола не были указаны в конфигурации clickhouse-server, эта команда не будет иметь эффекта.

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- Если указан модификатор `CUSTOM 'protocol'`, будет остановлен пользовательский протокол с указанным именем, определённый в секции protocols конфигурации сервера.
- Если указан модификатор `QUERIES ALL [EXCEPT .. [,..]]`, останавливаются все протоколы, если они не указаны в секции `EXCEPT`.
- Если указан модификатор `QUERIES DEFAULT [EXCEPT .. [,..]]`, останавливаются все протоколы по умолчанию, если они не указаны в секции `EXCEPT`.
- Если указан модификатор `QUERIES CUSTOM [EXCEPT .. [,..]]`, останавливаются все пользовательские протоколы, если они не указаны в секции `EXCEPT`.

### SYSTEM START LISTEN {#start-listen}

Разрешает установку новых соединений по указанным протоколам.

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
`DETACH / ATTACH` таблицы запустит фоновые слияния для таблицы, даже если слияния были остановлены для всех таблиц MergeTree ранее.
:::

### SYSTEM START MERGES {#start-merges}

<CloudNotSupportedBadge />

Позволяет запустить фоновые слияния для таблиц семейства MergeTree:

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### SYSTEM STOP TTL MERGES {#stop-ttl-merges}

Позволяет остановить фоновое удаление старых данных согласно [выражению TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц семейства MergeTree.
Возвращает `Ok.`, даже если таблица не существует или таблица не использует движок MergeTree. Возвращает ошибку, если база данных не существует:

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM START TTL MERGES {#start-ttl-merges}

Позволяет запустить фоновое удаление старых данных согласно [выражению TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц семейства MergeTree.
Возвращает `Ok.`, даже если таблица не существует. Возвращает ошибку, если база данных не существует:

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM STOP MOVES {#stop-moves}

Позволяет остановить фоновое перемещение данных согласно [табличному выражению TTL с предложением TO VOLUME или TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц семейства MergeTree.
Возвращает `Ok.`, даже если таблица не существует. Возвращает ошибку, если база данных не существует:

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM START MOVES {#start-moves}

Позволяет запустить фоновое перемещение данных согласно [табличному выражению TTL с предложением TO VOLUME и TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц семейства MergeTree.
Возвращает `Ok.`, даже если таблица не существует. Возвращает ошибку, если база данных не существует:

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM SYSTEM UNFREEZE {#query_language-system-unfreeze}

Удаляет замороженную резервную копию с указанным именем со всех дисков. Подробнее о размораживании отдельных частей см. в [ALTER TABLE table_name UNFREEZE WITH NAME](/sql-reference/statements/alter/partition#unfreeze-partition)

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### SYSTEM WAIT LOADING PARTS {#wait-loading-parts}

Ожидает завершения загрузки всех асинхронно загружаемых частей данных таблицы (устаревших частей данных).

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```


## Управление таблицами ReplicatedMergeTree {#managing-replicatedmergetree-tables}

ClickHouse может управлять фоновыми процессами, связанными с репликацией, в таблицах [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication).

### SYSTEM STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge />

Позволяет остановить фоновую загрузку вставленных кусков данных для таблиц семейства `ReplicatedMergeTree`.
Всегда возвращает `Ok.` независимо от движка таблицы, даже если таблица или база данных не существует.

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START FETCHES {#start-fetches}

<CloudNotSupportedBadge />

Позволяет запустить фоновую загрузку вставленных кусков данных для таблиц семейства `ReplicatedMergeTree`.
Всегда возвращает `Ok.` независимо от движка таблицы, даже если таблица или база данных не существует.

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP REPLICATED SENDS {#stop-replicated-sends}

Позволяет остановить фоновую отправку новых вставленных кусков данных другим репликам в кластере для таблиц семейства `ReplicatedMergeTree`:

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START REPLICATED SENDS {#start-replicated-sends}

Позволяет запустить фоновую отправку новых вставленных кусков данных другим репликам в кластере для таблиц семейства `ReplicatedMergeTree`:

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP REPLICATION QUEUES {#stop-replication-queues}

Позволяет остановить фоновые задачи загрузки из очередей репликации, хранящихся в ZooKeeper, для таблиц семейства `ReplicatedMergeTree`. Возможные типы фоновых задач: слияния, загрузки, мутации, DDL-операторы с предложением ON CLUSTER:

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START REPLICATION QUEUES {#start-replication-queues}

Позволяет запустить фоновые задачи загрузки из очередей репликации, хранящихся в ZooKeeper, для таблиц семейства `ReplicatedMergeTree`. Возможные типы фоновых задач: слияния, загрузки, мутации, DDL-операторы с предложением ON CLUSTER:

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

Останавливает загрузку новых записей из журнала репликации в очередь репликации таблицы `ReplicatedMergeTree`.

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START PULLING REPLICATION LOG {#start-pulling-replication-log}

Отменяет действие `SYSTEM STOP PULLING REPLICATION LOG`.

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM SYNC REPLICA {#sync-replica}

Ожидает синхронизации таблицы `ReplicatedMergeTree` с другими репликами в кластере, но не более `receive_timeout` секунд.

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

После выполнения этого оператора таблица `[db.]replicated_merge_tree_family_table_name` загружает команды из общего журнала репликации в свою очередь репликации, после чего запрос ожидает, пока реплика обработает все загруженные команды. Поддерживаются следующие модификаторы:


- С `IF EXISTS` (доступно с версии 25.6) запрос не вызовет ошибку, если таблица не существует. Это полезно при добавлении новой реплики в кластер, когда она уже является частью конфигурации кластера, но всё ещё находится в процессе создания и синхронизации таблицы.
- Если указан модификатор `STRICT`, запрос ожидает, пока очередь репликации не станет пустой. Версия `STRICT` может никогда не завершиться успешно, если в очереди репликации постоянно появляются новые записи.
- Если указан модификатор `LIGHTWEIGHT`, запрос ожидает обработки только записей `GET_PART`, `ATTACH_PART`, `DROP_RANGE`, `REPLACE_RANGE` и `DROP_PART`.
  Кроме того, модификатор LIGHTWEIGHT поддерживает необязательное предложение FROM 'srcReplicas', где 'srcReplicas' — это список имён исходных реплик, разделённых запятыми. Это расширение позволяет выполнять более целенаправленную синхронизацию, фокусируясь только на задачах репликации, поступающих от указанных исходных реплик.
- Если указан модификатор `PULL`, запрос извлекает новые записи очереди репликации из ZooKeeper, но не ожидает их обработки.

### SYNC DATABASE REPLICA {#sync-database-replica}

Ожидает, пока указанная [реплицируемая база данных](/engines/database-engines/replicated) применит все изменения схемы из очереди DDL этой базы данных.

**Синтаксис**

```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### SYSTEM RESTART REPLICA {#restart-replica}

Предоставляет возможность повторно инициализировать состояние сессии Zookeeper для таблицы `ReplicatedMergeTree`, сравнивает текущее состояние с Zookeeper как источником истины и добавляет задачи в очередь Zookeeper при необходимости.
Инициализация очереди репликации на основе данных ZooKeeper происходит так же, как и для оператора `ATTACH TABLE`. На короткое время таблица будет недоступна для любых операций.

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### SYSTEM RESTORE REPLICA {#restore-replica}

Восстанавливает реплику, если данные [возможно] присутствуют, но метаданные Zookeeper утеряны.

Работает только с таблицами `ReplicatedMergeTree`, доступными только для чтения.

Запрос можно выполнить после:

- Потери корня ZooKeeper `/`.
- Потери пути реплик `/replicas`.
- Потери пути отдельной реплики `/replicas/replica_name/`.

Реплика присоединяет локально найденные части и отправляет информацию о них в Zookeeper.
Части, присутствующие на реплике до потери метаданных, не загружаются повторно с других реплик, если они не устарели (таким образом, восстановление реплики не означает повторную загрузку всех данных по сети).

:::note
Части во всех состояниях перемещаются в папку `detached/`. Части, активные до потери данных (зафиксированные), присоединяются.
:::

### SYSTEM RESTORE DATABASE REPLICA {#restore-database-replica}

Восстанавливает реплику, если данные [возможно] присутствуют, но метаданные Zookeeper утеряны.

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

-- zookeeper_delete_path("/clickhouse/repl_db", recursive=True) <- потеря корня.

SYSTEM RESTORE DATABASE REPLICA repl_db;
```

**Синтаксис**

```sql
SYSTEM RESTORE REPLICA [db.]replicated_merge_tree_family_table_name [ON CLUSTER cluster_name]
```

Альтернативный синтаксис:

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**Пример**

Создание таблицы на нескольких серверах. После потери метаданных реплики в ZooKeeper таблица будет присоединена в режиме только для чтения, так как метаданные отсутствуют. Последний запрос необходимо выполнить на каждой реплике.

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- потеря корня.

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

Другой способ:

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```

### SYSTEM RESTART REPLICAS {#restart-replicas}

Предоставляет возможность повторно инициализировать состояние сессий Zookeeper для всех таблиц `ReplicatedMergeTree`, сравнивает текущее состояние с Zookeeper как источником истины и добавляет задачи в очередь Zookeeper при необходимости


### SYSTEM DROP FILESYSTEM CACHE {#drop-filesystem-cache}

Позволяет очистить кеш файловой системы.

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYSTEM SYNC FILE CACHE {#sync-file-cache}

:::note
Эта операция ресурсоёмкая и может быть использована некорректно.
:::

Выполняет системный вызов sync.

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```

### SYSTEM LOAD PRIMARY KEY {#load-primary-key}

Загружает первичные ключи для указанной таблицы или для всех таблиц.

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```

### SYSTEM UNLOAD PRIMARY KEY {#unload-primary-key}

Выгружает первичные ключи для указанной таблицы или для всех таблиц.

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```


## Управление обновляемыми материализованными представлениями {#refreshable-materialized-views}

Команды для управления фоновыми задачами, выполняемыми [обновляемыми материализованными представлениями](../../sql-reference/statements/create/view.md#refreshable-materialized-view)

При использовании отслеживайте состояние в таблице [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md).

### SYSTEM REFRESH VIEW {#refresh-view}

Запускает немедленное внеплановое обновление указанного представления.

```sql
SYSTEM REFRESH VIEW [db.]name
```

### SYSTEM WAIT VIEW {#wait-view}

Ожидает завершения текущего обновления. Если обновление завершается с ошибкой, генерирует исключение. Если обновление не выполняется, завершается немедленно, генерируя исключение, если предыдущее обновление завершилось с ошибкой.

### SYSTEM STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

Отключает периодическое обновление указанного представления или всех обновляемых представлений. Если обновление выполняется, также отменяет его.

Если представление находится в реплицируемой (Replicated) или общей (Shared) базе данных, `STOP VIEW` влияет только на текущую реплику, тогда как `STOP REPLICATED VIEW` влияет на все реплики.

```sql
SYSTEM STOP VIEW [db.]name
```

```sql
SYSTEM STOP VIEWS
```

### SYSTEM START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

Включает периодическое обновление для указанного представления или всех обновляемых представлений. Немедленное обновление не запускается.

Если представление находится в реплицируемой (Replicated) или общей (Shared) базе данных, `START VIEW` отменяет действие `STOP VIEW`, а `START REPLICATED VIEW` отменяет действие `STOP REPLICATED VIEW`.

```sql
SYSTEM START VIEW [db.]name
```

```sql
SYSTEM START VIEWS
```

### SYSTEM CANCEL VIEW {#cancel-view}

Если для указанного представления на текущей реплике выполняется обновление, прерывает и отменяет его. В противном случае ничего не делает.

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

Ожидает завершения выполняющегося обновления. Если обновление не выполняется, возвращает управление немедленно. Если последняя попытка обновления завершилась с ошибкой, сообщает об ошибке.

Может использоваться сразу после создания нового обновляемого материализованного представления (без ключевого слова EMPTY) для ожидания завершения начального обновления.

Если представление находится в реплицируемой (Replicated) или общей (Shared) базе данных и обновление выполняется на другой реплике, ожидает завершения этого обновления.

```sql
SYSTEM WAIT VIEW [db.]name
```
