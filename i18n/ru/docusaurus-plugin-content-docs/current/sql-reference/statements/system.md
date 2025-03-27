---
description: 'Документация для операторов SYSTEM'
sidebar_label: 'SYSTEM'
sidebar_position: 36
slug: /sql-reference/statements/system
title: 'Операторы SYSTEM'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Операторы SYSTEM

## RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

Перезагружает все [внутренние словари](../../sql-reference/dictionaries/index.md).  
По умолчанию внутренние словари отключены.  
Всегда возвращает `Ok.`, независимо от результата обновления внутреннего словаря.

## RELOAD DICTIONARIES {#reload-dictionaries}

Перезагружает все словари, которые были ранее успешно загружены.  
По умолчанию словари загружаются лениво (см. [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)), поэтому вместо автоматической загрузки при старте, они инициализируются при первом доступе через функцию dictGet или SELECT из таблиц с ENGINE = Dictionary. Запрос `SYSTEM RELOAD DICTIONARIES` перезагружает такие словари (LOADED).  
Всегда возвращает `Ok.`, независимо от результата обновления словаря.

**Синтаксис**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## RELOAD DICTIONARY {#reload-dictionary}

Полностью перезагружает словарь `dictionary_name`, независимо от состояния словаря (LOADED / NOT_LOADED / FAILED).  
Всегда возвращает `Ok.`, независимо от результата обновления словаря.

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

Статус словаря можно проверить, выполнив запрос к таблице `system.dictionaries`.

```sql
SELECT name, status FROM system.dictionaries;
```

## RELOAD MODELS {#reload-models}

:::note  
Этот оператор и `SYSTEM RELOAD MODEL` просто выгружают модели catboost из clickhouse-library-bridge. Функция `catboostEvaluate()` загружает модель при первом доступе, если она еще не загружена.  
:::

Выгружает все модели CatBoost.

**Синтаксис**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```

## RELOAD MODEL {#reload-model}

Выгружает модель CatBoost по `model_path`.

**Синтаксис**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```

## RELOAD FUNCTIONS {#reload-functions}

Перезагружает все зарегистрированные [выполнимые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions) или одну из них из файла конфигурации.

**Синтаксис**

```sql
RELOAD FUNCTIONS [ON CLUSTER cluster_name]
RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

Переоценивает все [асинхронные метрики](../../operations/system-tables/asynchronous_metrics.md). Поскольку асинхронные метрики периодически обновляются на основе настройки [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md), обычно не нужно вручную обновлять их с помощью этого оператора.

```sql
RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## DROP DNS CACHE {#drop-dns-cache}

Очищает внутренний кэш DNS ClickHouse. Иногда (для старых версий ClickHouse) необходимо использовать эту команду при изменении инфраструктуры (изменении IP-адреса другого сервера ClickHouse или сервера, используемого словарями).

Для более удобного (автоматического) управления кэшем см. параметры disable_internal_dns_cache, dns_cache_max_entries, dns_cache_update_period.

## DROP MARK CACHE {#drop-mark-cache}

Очищает кэш меток.

## DROP REPLICA {#drop-replica}

"Мертвые" реплики таблиц `ReplicatedMergeTree` можно удалить, используя следующий синтаксис:

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

Запросы удаляют путь к реплике `ReplicatedMergeTree` в ZooKeeper. Это полезно, когда реплика не работает, и ее метаданные не могут быть удалены из ZooKeeper с помощью `DROP TABLE`, потому что такой таблицы больше не существует. Он удалит только неактивную/устаревшую реплику, и не может удалить локальную реплику, пожалуйста, используйте `DROP TABLE` для этого. `DROP REPLICA` не удаляет никаких таблиц и не удаляет никаких данных или метаданных с диска.

Первый удаляет метаданные реплики `'replica_name'` таблицы `database.table`.  
Второй делает то же самое для всех реплицируемых таблиц в базе данных.  
Третий делает то же самое для всех реплицируемых таблиц на локальном сервере.  
Четвертый полезен для удаления метаданных мертвой реплики, когда все другие реплики таблицы были удалены. Для этого необходимо явно указать путь к таблице. Он должен быть тем же путем, который был передан в качестве первого аргумента движка `ReplicatedMergeTree` при создании таблицы.

## DROP DATABASE REPLICA {#drop-database-replica}

"Мертвые" реплики баз данных `Replicated` можно удалить с использованием следующего синтаксиса:

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

Похоже на `SYSTEM DROP REPLICA`, но удаляет путь реплики `Replicated` базы данных из ZooKeeper, когда базы данных нет для выполнения `DROP DATABASE`. Пожалуйста, обратите внимание, что он не удаляет реплики `ReplicatedMergeTree` (поэтому вам также может потребоваться `SYSTEM DROP REPLICA`). Имена шардов и реплик — это имена, указанные в параметрах движка `Replicated` при создании базы данных. Также эти имена можно получить из столбцов `database_shard_name` и `database_replica_name` в `system.clusters`. Если предложение `FROM SHARD` отсутствует, то `replica_name` должно быть полным именем реплики в формате `shard_name|replica_name`.

## DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

Очищает кэш необработанных данных.  
Кэш необработанных данных включается/выключается запросом/настройкой на уровне пользователя/профиля [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache).  
Его размер можно настроить с помощью настройки на уровне сервера [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size).

## DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

Очищает кэш скомпилированных выражений.  
Кэш скомпилированных выражений включается/выключается запросом/настройкой на уровне пользователя/профиля [`compile_expressions`](../../operations/settings/settings.md#compile_expressions).

## DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

Очищает кэш условий запросов.

## DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

Очищает [кэш запросов](../../operations/query-cache.md).  
Если указана метка, удаляются только записи кэша запросов с указанной меткой.

## DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

Очищает кэш для схем, загруженных из [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path).

Поддерживаемые форматы:

- Protobuf

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]
```

## FLUSH LOGS {#flush-logs}

Сбрасывает буферизованные журнальные сообщения в системные таблицы, например, system.query_log. В основном полезно для отладки, поскольку для большинства системных таблиц установлен интервал сброса по умолчанию в 7,5 секунд.  
Это также создаст системные таблицы, даже если очередь сообщений пуста.

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

Если вы не хотите сбрасывать все, вы можете сбросить один или несколько индивидуальных журналов, передав их название или целевую таблицу:

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## RELOAD CONFIG {#reload-config}

Перезагружает конфигурацию ClickHouse. Используется, когда конфигурация хранится в ZooKeeper. Обратите внимание, что `SYSTEM RELOAD CONFIG` не перезагружает конфигурацию `USER`, хранящуюся в ZooKeeper, она перезагружает только конфигурацию `USER`, которая хранится в `users.xml`. Для перезагрузки всей конфигурации `USER` используйте `SYSTEM RELOAD USERS`.

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## RELOAD USERS {#reload-users}

Перезагружает все хранилища доступа, включая: users.xml, локальное хранилище доступа на диске, реплицированное (в ZooKeeper) хранилище доступа.

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

Обычно завершает работу ClickHouse (как `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`)

## KILL {#kill}

Прерывает процесс ClickHouse (как `kill -9 {$ pid_clickhouse-server}`)

## Управление распределенными таблицами {#managing-distributed-tables}

ClickHouse может управлять [распределенными](../../engines/table-engines/special/distributed.md) таблицами. Когда пользователь вставляет данные в эти таблицы, ClickHouse сначала создает очередь данных, которые должны быть отправлены на узлы кластера, а затем асинхронно отправляет их. Вы можете управлять обработкой очереди с помощью запросов [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends), [FLUSH DISTRIBUTED](#flush-distributed) и [`START DISTRIBUTED SENDS`](#start-distributed-sends). Вы также можете синхронно вставлять распределенные данные с помощью настройки [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert).

### STOP DISTRIBUTED SENDS {#stop-distributed-sends}

Отключает фоновую распределенную передачу данных при вставке данных в распределенные таблицы.

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note  
В случае, если [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) включен (по умолчанию), данные в локальный шард все равно будут вставлены.  
:::

### FLUSH DISTRIBUTED {#flush-distributed}

Принудительно заставляет ClickHouse отправлять данные на узлы кластера синхронно. Если какие-либо узлы недоступны, ClickHouse выдает исключение и останавливает выполнение запроса. Вы можете повторить запрос до тех пор, пока он не выполнится успешно, что произойдет, когда все узлы снова станут доступны.

Вы также можете переопределить некоторые настройки с помощью условия `SETTINGS`, это может быть полезно для избежания некоторых временных ограничений, таких как `max_concurrent_queries_for_all_users` или `max_memory_usage`.

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note  
Каждый ожидающий блок хранится на диске с настройками из исходного запроса INSERT, поэтому иногда может потребоваться переопределить настройки.  
:::

### START DISTRIBUTED SENDS {#start-distributed-sends}

Включает фоновую распределенную передачу данных при вставке данных в распределенные таблицы.

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### STOP LISTEN {#stop-listen}

Закрывает сокет и корректно завершает существующие подключения к серверу на указанном порту с указанным протоколом.

Однако, если соответствующие настройки протокола не были указаны в конфигурации clickhouse-server, эта команда не окажет никакого эффекта.

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- Если указан модификатор `CUSTOM 'protocol'`, будет остановлен пользовательский протокол с указанным именем, определенным в разделе протоколов конфигурации сервера.  
- Если указан модификатор `QUERIES ALL [EXCEPT .. [,..]]`, все протоколы будут остановлены, если не указаны с помощью условия `EXCEPT`.  
- Если указан модификатор `QUERIES DEFAULT [EXCEPT .. [,..]]`, все протоколы по умолчанию будут остановлены, если не указаны с помощью условия `EXCEPT`.  
- Если указан модификатор `QUERIES CUSTOM [EXCEPT .. [,..]]`, все пользовательские протоколы будут остановлены, если не указаны с помощью условия `EXCEPT`.  

### START LISTEN {#start-listen}

Позволяет устанавливать новые соединения по указанным протоколам.

Однако, если сервер на указанном порту и протокол не был остановлен с помощью команды SYSTEM STOP LISTEN, эта команда не окажет никакого эффекта.

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```


## Управление таблицами MergeTree {#managing-mergetree-tables}

ClickHouse может управлять фоновыми процессами в таблицах [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

### STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

Предоставляет возможность остановить фоновое слияние для таблиц в семействе MergeTree:

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note  
`DETACH / ATTACH` таблицы запустит фоновое слияние для таблицы, даже если слияние было остановлено для всех таблиц MergeTree ранее.  
:::

### START MERGES {#start-merges}

<CloudNotSupportedBadge/>

Предоставляет возможность запустить фоновое слияние для таблиц в семействе MergeTree:

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### STOP TTL MERGES {#stop-ttl-merges}

Предоставляет возможность остановить фоновое удаление устаревших данных в соответствии с [выражением TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц в семействе MergeTree:  
Возвращает `Ok.`, даже если таблица не существует или таблица не имеет движка MergeTree. Возвращает ошибку, если база данных не существует:

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START TTL MERGES {#start-ttl-merges}

Предоставляет возможность запустить фоновое удаление устаревших данных в соответствии с [выражением TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц в семействе MergeTree:  
Возвращает `Ok.`, даже если таблица не существует. Возвращает ошибку, если база данных не существует:

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### STOP MOVES {#stop-moves}

Предоставляет возможность остановить фоновую перемещение данных в соответствии с [выражением TTL таблицы с TO VOLUME или TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц в семействе MergeTree:  
Возвращает `Ok.`, даже если таблица не существует. Возвращает ошибку, если база данных не существует:

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START MOVES {#start-moves}

Предоставляет возможность запустить фоновую перемещение данных в соответствии с [выражением TTL таблицы с TO VOLUME и TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц в семействе MergeTree:  
Возвращает `Ok.`, даже если таблица не существует. Возвращает ошибку, если база данных не существует:

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM UNFREEZE {#query_language-system-unfreeze}

Очищает замороженную резервную копию с указанным именем со всех дисков. См. подробнее о размораживании отдельных частей в [ALTER TABLE table_name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### WAIT LOADING PARTS {#wait-loading-parts}

Ждет, пока все асинхронно загружаемые части данных таблицы (устаревшие части данных) будут загружены.

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## Управление таблицами ReplicatedMergeTree {#managing-replicatedmergetree-tables}

ClickHouse может управлять фоновыми процессами, связанными с репликацией в таблицах [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication).

### STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

Предоставляет возможность остановить фоновую загрузку вставленных частей для таблиц в семействе `ReplicatedMergeTree`:  
Всегда возвращает `Ok.`, независимо от движка таблицы и даже если таблица или база данных не существует.

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

Предоставляет возможность запустить фоновую загрузку вставленных частей для таблиц в семействе `ReplicatedMergeTree`:  
Всегда возвращает `Ok.`, независимо от движка таблицы и даже если таблица или база данных не существует.

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATED SENDS {#stop-replicated-sends}

Предоставляет возможность остановить фоновую отправку новых вставленных частей другим репликам в кластере для таблиц в семействе `ReplicatedMergeTree`:

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATED SENDS {#start-replicated-sends}

Предоставляет возможность запустить фоновую отправку новых вставленных частей другим репликам в кластере для таблиц в семействе `ReplicatedMergeTree`:

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATION QUEUES {#stop-replication-queues}

Предоставляет возможность остановить фоновые задачи загрузки из очередей репликации, которые хранятся в ZooKeeper для таблиц в семействе `ReplicatedMergeTree`. Возможные типы фоновых задач - слияния, загрузки, мутации, DDL-запросы с предложением ON CLUSTER:

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATION QUEUES {#start-replication-queues}

Предоставляет возможность запустить фоновые задачи загрузки из очередей репликации, которые хранятся в ZooKeeper для таблиц в семействе `ReplicatedMergeTree`. Возможные типы фоновых задач - слияния, загрузки, мутации, DDL-запросы с предложением ON CLUSTER:

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

Останавливает загрузку новых записей из журнала репликации в очередь репликации в таблице `ReplicatedMergeTree`.

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START PULLING REPLICATION LOG {#start-pulling-replication-log}

Отменяет `SYSTEM STOP PULLING REPLICATION LOG`.

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYNC REPLICA {#sync-replica}

Ждет, пока таблица `ReplicatedMergeTree` будет синхронизирована с другими репликами в кластере, но не более чем на `receive_timeout` секунд.

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

После выполнения этого оператора `[db.]replicated_merge_tree_family_table_name` загружает команды из общего журнала репликации в свою очередь репликации, а затем запрос ждет, пока реплика обработает все загруженные команды. Поддерживаются следующие модификаторы:

 - Если указан модификатор `STRICT`, то запрос ждет, пока очередь репликации не станет пустой. Версия `STRICT` может никогда не выполниться, если в очереди репликации постоянно появляются новые записи.
 - Если указан модификатор `LIGHTWEIGHT`, то запрос ждет только обработки записей `GET_PART`, `ATTACH_PART`, `DROP_RANGE`, `REPLACE_RANGE` и `DROP_PART`.  
   Кроме того, модификатор LIGHTWEIGHT поддерживает необязательное предложение FROM 'srcReplicas', где 'srcReplicas' - это разделенный запятыми список имен источников реплик. Это расширение позволяет более целенаправленно синхронизироваться, сосредоточив внимание только на задачах репликации, происходящих из указанных источников реплик.
 - Если указан модификатор `PULL`, то запрос загружает новые записи очереди репликации из ZooKeeper, но не ждет обработки ничего.

### SYNC DATABASE REPLICA {#sync-database-replica}

Ждет, пока указанная [реплицированная база данных](/engines/database-engines/replicated) применит все изменения схемы из DDL-очереди этой базы данных.

**Синтаксис**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### RESTART REPLICA {#restart-replica}

Предоставляет возможность повторной инициализации состояния сессии ZooKeeper для таблицы `ReplicatedMergeTree`, будет сравнивать текущее состояние с ZooKeeper как источником правды и добавлять задачи в очередь ZooKeeper, если это необходимо.  
Инициализация очереди репликации на основе данных ZooKeeper происходит таким же образом, как и для оператора `ATTACH TABLE`. На короткое время таблица будет недоступна для любых операций.

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### RESTORE REPLICA {#restore-replica}

Восстанавливает реплику, если данные [возможно] присутствуют, но метаданные ZooKeeper потеряны.

Работает только с таблицами `ReplicatedMergeTree` в режиме только для чтения.

Запрос можно выполнить после:

  - Потери корневого узла ZooKeeper `/`.  
  - Потери пути реплик `/replicas`.  
  - Потери индивидуального пути реплики `/replicas/replica_name/`.

Реплика присоединяет локально найденные части и отправляет информацию о них в ZooKeeper.  
Части, присутствующие на реплике до потери метаданных, не перезагружаются из других, если не являются устаревшими (поэтому восстановление реплики не означает повторной загрузки всех данных через сеть).

:::note  
Части во всех состояниях перемещаются в папку `detached/`. Активные до потери данных части (зафиксированные) присоединяются.  
:::

**Синтаксис**

```sql
SYSTEM RESTORE REPLICA [db.]replicated_merge_tree_family_table_name [ON CLUSTER cluster_name]
```

Альтернативный синтаксис:

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**Пример**

Создание таблицы на нескольких серверах. После потери метаданных реплики в ZooKeeper таблица присоединяется как только для чтения, так как метаданные отсутствуют. Последний запрос необходимо выполнить на каждой реплике.

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- потеря корня.

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

Еще один способ:

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```

### RESTART REPLICAS {#restart-replicas}

Предоставляет возможность повторно инициализировать состояние сессий ZooKeeper для всех таблиц `ReplicatedMergeTree`, будет сравнивать текущее состояние с ZooKeeper как источником правды и добавлять задачи в очередь ZooKeeper, если это необходимо.

### DROP FILESYSTEM CACHE {#drop-filesystem-cache}

Разрешает удалить кэш файловой системы.

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYNC FILE CACHE {#sync-file-cache}

:::note  
Это слишком тяжелая операция и может быть использована неправильно.  
:::

Выполнит системный вызов синхронизации.

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```

### LOAD PRIMARY KEY {#load-primary-key}

Загружает первичные ключи для данной таблицы или для всех таблиц.

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```

### UNLOAD PRIMARY KEY {#unload-primary-key}

Выгружает первичные ключи для данной таблицы или для всех таблиц.

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```

## Управление обновляемыми материализованными представлениями {#refreshable-materialized-views}

Команды для управления фоновыми задачами, выполняемыми [обновляемыми материализованными представлениями](../../sql-reference/statements/create/view.md#refreshable-materialized-view)

Следите за [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md) во время их использования.

### REFRESH VIEW {#refresh-view}

Запускает немедленное обновление запланированного представления.

```sql
SYSTEM REFRESH VIEW [db.]name
```

### REFRESH VIEW {#refresh-view-1}

Ожидает завершения текущего обновления. Если обновление не удалось, вызывается исключение. Если обновление не выполняется, завершается немедленно, вызывая исключение, если предыдущее обновление не удалось.

### STOP VIEW, STOP VIEWS {#stop-view-stop-views}

Отключает периодическое обновление данного представления или всех обновляемых представлений. Если обновление в процессе, отменяет его тоже.

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### START VIEW, START VIEWS {#start-view-start-views}

Включает периодическое обновление для данного представления или всех обновляемых представлений. Немедленное обновление не запускается.

```sql
SYSTEM START VIEW [db.]name
```
```sql
SYSTEM START VIEWS
```

### CANCEL VIEW {#cancel-view}

Если в данный момент выполняется обновление для данного представления, прерывает и отменяет его. В противном случае ничего не делает.

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

Ждет завершения выполняющегося обновления. Если обновление не выполняется, возвращает немедленно. Если последняя попытка обновления не удалась, сообщает об ошибке.

Можно использовать сразу после создания нового обновляемого материализованного представления (без ключевого слова EMPTY), чтобы дождаться завершения первичного обновления.

```sql
SYSTEM WAIT VIEW [db.]name
```
