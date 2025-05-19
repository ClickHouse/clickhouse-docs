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

Перезагрузка всех [внутренних словарей](../../sql-reference/dictionaries/index.md).
По умолчанию внутренние словари отключены.
Всегда возвращает `Ok.`, независимо от результата обновления внутреннего словаря.

## RELOAD DICTIONARIES {#reload-dictionaries}

Перезагружает все словари, которые были успешно загружены ранее.
По умолчанию словари загружаются лениво (см. [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)), поэтому вместо автоматической загрузки при запуске они инициализируются при первом обращении через функцию dictGet или SELECT из таблиц с ENGINE = Dictionary. Запрос `SYSTEM RELOAD DICTIONARIES` перезагружает такие словари (LOADED).
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

Статус словаря можно проверить, запросив таблицу `system.dictionaries`.

```sql
SELECT name, status FROM system.dictionaries;
```

## RELOAD MODELS {#reload-models}

:::note
Этот оператор и `SYSTEM RELOAD MODEL` просто выгружают модели catboost из clickhouse-library-bridge. Функция `catboostEvaluate()`
загружает модель при первом доступе, если она еще не загружена.
:::

Выгружает все модели CatBoost.

**Синтаксис**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```

## RELOAD MODEL {#reload-model}

Выгружает модель CatBoost по пути `model_path`.

**Синтаксис**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```

## RELOAD FUNCTIONS {#reload-functions}

Перезагружает все зарегистрированные [исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions) или одну из них из файла конфигурации.

**Синтаксис**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

Пересчитывает все [асинхронные метрики](../../operations/system-tables/asynchronous_metrics.md). Поскольку асинхронные метрики периодически обновляются на основе настройки [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md), их ручное обновление с использованием этого оператора обычно не требуется.

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## DROP DNS CACHE {#drop-dns-cache}

Очищает внутренний кэш DNS ClickHouse. Иногда (для старых версий ClickHouse) необходимо использовать эту команду при изменении инфраструктуры (изменение IP-адреса другого сервера ClickHouse или сервера, используемого словарями).

Для более удобного (автоматического) управления кэшем см. параметры disable_internal_dns_cache, dns_cache_max_entries, dns_cache_update_period.

## DROP MARK CACHE {#drop-mark-cache}

Очищает кэш меток.

## DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

Очищает кэш метаданных iceberg.

## DROP REPLICA {#drop-replica}

Мертвые реплики таблиц `ReplicatedMergeTree` можно удалить с помощью следующего синтаксиса:

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

Запросы удалят путь реплики `ReplicatedMergeTree` в ZooKeeper. Это полезно, когда реплика мертва и ее метаданные не могут быть удалены из ZooKeeper с помощью `DROP TABLE`, потому что такой таблицы больше нет. Будет удалена только неактивная/устаревшая реплика, и нельзя удалить локальную реплику, для этого используйте `DROP TABLE`. `DROP REPLICA` не удаляет какие-либо таблицы и не удаляет данные или метаданные с диска.

Первый запрос удаляет метаданные реплики `'replica_name'` таблицы `database.table`.
Второй запрос делает то же самое для всех реплицированных таблиц в базе данных.
Третий запрос делает то же самое для всех реплицированных таблиц на локальном сервере.
Четвертый запрос полезен для удаления метаданных мертвой реплики, когда все другие реплики таблицы были удалены. Для этого требуется явно указать путь к таблице. Он должен быть таким же, как тот, который передавался как первый аргумент движка `ReplicatedMergeTree` при создании таблицы.

## DROP DATABASE REPLICA {#drop-database-replica}

Мертвые реплики `Replicated` баз данных можно удалить с помощью следующего синтаксиса:

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

Похоже на `SYSTEM DROP REPLICA`, но удаляет путь реплики `Replicated` базы данных из ZooKeeper, когда нет базы данных для выполнения `DROP DATABASE`. Обратите внимание, что он не удаляет реплики `ReplicatedMergeTree` (так что вам может понадобиться также `SYSTEM DROP REPLICA`). Названия шардов и реплик - это имена, которые были указаны в аргументах движка `Replicated` при создании базы данных. Эти имена также можно получить из столбцов `database_shard_name` и `database_replica_name` в `system.clusters`. Если условие `FROM SHARD` отсутствует, то `replica_name` должен быть полным именем реплики в формате `shard_name|replica_name`.

## DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

Очищает кэш некомпрессированных данных.
Кэш некомпрессированных данных включается/отключается с помощью настройки запроса/уровня пользователя [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache).
Его размер можно настроить с помощью настройки на уровне сервера [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size).

## DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

Очищает кэш скомпилированных выражений.
Кэш скомпилированных выражений включается/отключается с помощью настройки на уровне запроса/пользователя [`compile_expressions`](../../operations/settings/settings.md#compile_expressions).

## DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

Очищает кэш условий запроса.

## DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

Очищает [кэш запросов](../../operations/query-cache.md).
Если указан тег, будут удалены только записи кэша запросов с указанным тегом.

## DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

Очищает кэш для схем, загруженных из [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path).

Поддерживаемые форматы:

- Protobuf

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]
```

## FLUSH LOGS {#flush-logs}

Сбрасывает буферизированные лог-сообщения в системные таблицы, например, system.query_log. В основном полезно для отладки, поскольку большинство системных таблиц имеют интервал сброса по умолчанию в 7,5 секунды.
Это также создаст системные таблицы, даже если очередь сообщений пуста.

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

Если вы не хотите сбрасывать все, вы можете сбросить один или несколько отдельных логов, передав либо их имя, либо их целевую таблицу:

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## RELOAD CONFIG {#reload-config}

Перезагружает конфигурацию ClickHouse. Используется, когда конфигурация хранится в ZooKeeper. Обратите внимание, что `SYSTEM RELOAD CONFIG` не перезагружает конфигурацию `USER`, сохраненную в ZooKeeper, он только перезагружает конфигурацию `USER`, которая хранится в `users.xml`. Чтобы перезагрузить всю конфигурацию `USER`, используйте `SYSTEM RELOAD USERS`.

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## RELOAD USERS {#reload-users}

Перезагружает все источники доступа, включая: users.xml, локальный диск доступа, реплицированный (в ZooKeeper) источник доступа.

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

Обычно завершает работу ClickHouse (как `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`)

## KILL {#kill}

Прерывает процесс ClickHouse (как `kill -9 {$ pid_clickhouse-server}`)

## Управление распределенными таблицами {#managing-distributed-tables}

ClickHouse может управлять [распределенными](../../engines/table-engines/special/distributed.md) таблицами. Когда пользователь вставляет данные в эти таблицы, ClickHouse сначала создает очередь данных, которые должны быть отправлены узлам кластера, затем асинхронно отправляет их. Вы можете управлять обработкой очереди с помощью запросов [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends), [FLUSH DISTRIBUTED](#flush-distributed) и [`START DISTRIBUTED SENDS`](#start-distributed-sends). Вы также можете синхронно вставлять распределенные данные с помощью настройки [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert).

### STOP DISTRIBUTED SENDS {#stop-distributed-sends}

Отключает фоновое распределение данных при вставке данных в распределенные таблицы.

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
В случае включения [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) (по умолчанию) данные в локальную шарду будут вставляться все равно.
:::

### FLUSH DISTRIBUTED {#flush-distributed}

Принуждает ClickHouse отправлять данные на узлы кластера синхронно. Если какие-либо узлы недоступны, ClickHouse выбрасывает исключение и останавливает выполнение запроса. Вы можете повторить запрос, пока он не выполнится успешно, что произойдет, когда все узлы вернутся в онлайн.

Вы также можете переопределить некоторые настройки через предложение `SETTINGS`, это может быть полезно для избежания временных ограничений, таких как `max_concurrent_queries_for_all_users` или `max_memory_usage`.

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
Каждый ожидающий блок хранится на диске с настройками из начального запроса INSERT, поэтому иногда вам может понадобиться переопределить настройки.
:::

### START DISTRIBUTED SENDS {#start-distributed-sends}

Включает фоновое распределение данных при вставке данных в распределенные таблицы.

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### STOP LISTEN {#stop-listen}

Закрывает сокет и корректно завершает существующие соединения с сервером на указанном порту с указанным протоколом.

Однако, если соответствующие настройки протокола не были указаны в конфигурации clickhouse-server, эта команда не будет иметь эффекта.

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- Если указан модификатор `CUSTOM 'protocol'`, будет остановлен пользовательский протокол с указанным именем, определённым в разделе протоколов конфигурации сервера.
- Если указан модификатор `QUERIES ALL [EXCEPT .. [,..]]`, все протоколы будут остановлены, если не указаны с помощью условия `EXCEPT`.
- Если указан модификатор `QUERIES DEFAULT [EXCEPT .. [,..]]`, все протоколы по умолчанию будут остановлены, если не указаны с помощью условия `EXCEPT`.
- Если указан модификатор `QUERIES CUSTOM [EXCEPT .. [,..]]`, все пользовательские протоколы будут остановлены, если не указаны с помощью условия `EXCEPT`.

### START LISTEN {#start-listen}

Позволяет устанавливать новые соединения по указанным протоколам.

Однако, если сервер на указанном порту и протоколе не был остановлен с помощью команды SYSTEM STOP LISTEN, эта команда не будет иметь эффекта.

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## Управление таблицами MergeTree {#managing-mergetree-tables}

ClickHouse может управлять фоновыми процессами в таблицах [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

### STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

Предоставляет возможность остановить фоновое объединение для таблиц в семействе MergeTree:

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
Команда `DETACH / ATTACH` начнет фоновое объединение для таблицы, даже если объединения были остановлены для всех таблиц MergeTree ранее.
:::

### START MERGES {#start-merges}

<CloudNotSupportedBadge/>

Предоставляет возможность начать фоновое объединение для таблиц в семействе MergeTree:

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### STOP TTL MERGES {#stop-ttl-merges}

Предоставляет возможность остановить фоновое удаление старых данных в соответствии с [выражением TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц в семействе MergeTree:
Возвращает `Ok.`, даже если таблицы не существует или таблица не имеет движка MergeTree. Возвращает ошибку, когда база данных не существует:

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START TTL MERGES {#start-ttl-merges}

Предоставляет возможность начать фоновое удаление старых данных в соответствии с [выражением TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц в семействе MergeTree:
Возвращает `Ok.`, даже если таблицы не существует. Возвращает ошибку, когда база данных не существует:

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### STOP MOVES {#stop-moves}

Предоставляет возможность остановить фоновое перемещение данных в соответствии с [выражением TTL таблицы с предложением TO VOLUME или TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц в семействе MergeTree:
Возвращает `Ok.`, даже если таблицы не существует. Возвращает ошибку, когда база данных не существует:

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START MOVES {#start-moves}

Предоставляет возможность начать фоновое перемещение данных в соответствии с [выражением TTL таблицы с предложением TO VOLUME и TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц в семействе MergeTree:
Возвращает `Ok.`, даже если таблицы не существует. Возвращает ошибку, когда база данных не существует:

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM UNFREEZE {#query_language-system-unfreeze}

Очищает замороженный бэкап с указанным именем со всех дисков. Подробнее о размораживании отдельных частей см. в разделе [ALTER TABLE table_name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### WAIT LOADING PARTS {#wait-loading-parts}

Ждет, пока все асинхронно загружаемые части данных таблицы (устаревшие части данных) будут загружены.

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## Управление таблицами ReplicatedMergeTree {#managing-replicatedmergetree-tables}

ClickHouse может управлять фоновыми процессами, связанными с репликацией, в таблицах [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication).

### STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

Предоставляет возможность остановить фоновые выборки для вставленных частей для таблиц в семействе `ReplicatedMergeTree`:
Всегда возвращает `Ok.`, независимо от движка таблицы и даже если таблицы или базы данных не существует.

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

Предоставляет возможность начать фоновые выборки для вставленных частей для таблиц в семействе `ReplicatedMergeTree`:
Всегда возвращает `Ok.`, независимо от движка таблицы и даже если таблицы или базы данных не существует.

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATED SENDS {#stop-replicated-sends}

Предоставляет возможность остановить фоновые отправки на другие реплики в кластере для новых вставленных частей для таблиц в семействе `ReplicatedMergeTree`:

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATED SENDS {#start-replicated-sends}

Предоставляет возможность начать фоновые отправки на другие реплики в кластере для новых вставленных частей для таблиц в семействе `ReplicatedMergeTree`:

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATION QUEUES {#stop-replication-queues}

Предоставляет возможность остановить фоновые задачи выборки из очередей репликации, которые хранятся в ZooKeeper для таблиц в семействе `ReplicatedMergeTree`. Виды фоновых задач - объединение, выборки, мутации, DDL-операторы с условием ON CLUSTER:

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATION QUEUES {#start-replication-queues}

Предоставляет возможность начать фоновые задачи выборки из очередей репликации, которые хранятся в ZooKeeper для таблиц в семействе `ReplicatedMergeTree`. Виды фоновых задач - объединение, выборки, мутации, DDL-операторы с условием ON CLUSTER:

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

Останавливает загрузку новых записей из журнала репликации в очередь репликации в таблице `ReplicatedMergeTree`.

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START PULLING REPLICATION LOG {#start-pulling-replication-log}

Отменяет команду `SYSTEM STOP PULLING REPLICATION LOG`.

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYNC REPLICA {#sync-replica}

Ждет, пока таблица `ReplicatedMergeTree` будет синхронизирована с другими репликами в кластере, но не более чем `receive_timeout` секунд.

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

После выполнения этого оператора `[db.]replicated_merge_tree_family_table_name` извлекает команды из общего журнала репликации в свою очередь репликации, а затем запрос ждет, пока реплика обработает все извлеченные команды. Поддерживаются следующие модификаторы:

 - Если был указан модификатор `STRICT`, запрос ждет, пока очередь репликации не станет пустой. Версия `STRICT` может никогда не выполниться, если в очереди репликации постоянно появляются новые записи.
 - Если был указан модификатор `LIGHTWEIGHT`, запрос ждет только обработки записей `GET_PART`, `ATTACH_PART`, `DROP_RANGE`, `REPLACE_RANGE` и `DROP_PART`.
   Кроме того, модификатор LIGHTWEIGHT поддерживает необязательное условие FROM 'srcReplicas', где 'srcReplicas' - это через запятую перечисленные имена реплик источников. Это расширение позволяет более точно синхронизировать, сосредоточившись только на задачах репликации, исходящих из указанных реплик источников.
 - Если был указан модификатор `PULL`, запрос извлекает новые записи из очереди репликации из ZooKeeper, но не ждет, пока произойдет что-либо.

### SYNC DATABASE REPLICA {#sync-database-replica}

Ждет, пока указанная [реплицированная база данных](/engines/database-engines/replicated) применит все изменения схемы из очереди DDL этой базы данных.

**Синтаксис**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### RESTART REPLICA {#restart-replica}

Предоставляет возможность реинициализировать состояние сессии ZooKeeper для таблицы `ReplicatedMergeTree`, сравнит текущее состояние с ZooKeeper как источником правды и добавит задачи в очередь ZooKeeper при необходимости.
Инициализация очереди репликации на основе данных ZooKeeper происходит так же, как для оператора `ATTACH TABLE`. На короткое время таблица будет недоступна для любых операций.

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### RESTORE REPLICA {#restore-replica}

Восстанавливает реплику, если данные [возможно] присутствуют, но метаданные ZooKeeper потеряны.

Работает только на `ReplicatedMergeTree` таблицах, доступных только для чтения.

Можно выполнить запрос после:

  - Потери корня ZooKeeper `/`.
  - Потери пути реплик `/replicas`.
  - Потери индивидуального пути реплики `/replicas/replica_name/`.

Реплика присоединяет локально найденные части и отправляет информацию о них в ZooKeeper.
Части, присутствующие на реплике до потери метаданных, не загружаются вновь из других, если только они не устарели (поэтому восстановление реплики не означает повторную загрузку всех данных по сети).

:::note
Части в любом состоянии перемещаются в папку `detached/`. Активные части до потери данных (подтвержденные) присоединяются.
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

Создание таблицы на нескольких серверах. После потери метаданных реплики в ZooKeeper таблица присоединится как только для чтения, так как метаданные отсутствуют. Последний запрос должен выполняться на каждой реплике.

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- утрата корня.

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

Другой способ:

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```

### RESTART REPLICAS {#restart-replicas}

Предоставляет возможность реинициализировать состояние сессий ZooKeeper для всех таблиц `ReplicatedMergeTree`, сравнит текущее состояние с ZooKeeper как источником правды и добавит задачи в очередь ZooKeeper при необходимости.

### DROP FILESYSTEM CACHE {#drop-filesystem-cache}

Позволяет сбросить кэш файловой системы.

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYNC FILE CACHE {#sync-file-cache}

:::note
Это слишком тяжело и имеет потенциал для неправильного использования.
:::

Выполнит системный вызов sync.

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

Запускает немедленное обновление расписания для данного представления.

```sql
SYSTEM REFRESH VIEW [db.]name
```

### REFRESH VIEW {#refresh-view-1}

Ждет завершения текущего обновления. Если обновление не удалось, выбрасывает исключение. Если обновления не выполняется, завершается немедленно, выбрасывая исключение, если предыдущее обновление не удалось.

### STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

Отключает периодическое обновление данного представления или всех обновляемых представлений. Если обновление выполняется, отменяет его тоже.

Если представление находится в реплицированной или общей базе данных, `STOP VIEW` влияет только на текущую реплику, тогда как `STOP REPLICATED VIEW` влияет на все реплики.

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

Включает периодическое обновление для данного представления или всех обновляемых представлений. Немедленное обновление не запускается.

Если представление находится в реплицированной или общей базе данных, `START VIEW` отменяет эффект `STOP VIEW`, а `START REPLICATED VIEW` отменяет эффект `STOP REPLICATED VIEW`.

```sql
SYSTEM START VIEW [db.]name
```
```sql
SYSTEM START VIEWS
```

### CANCEL VIEW {#cancel-view}

Если для данного представления на текущей реплике выполняется обновление, прерывает и отменяет его. В противном случае ничего не делает.

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

Ждет завершения выполняющегося обновления. Если обновления не выполняется, возвращает немедленно. Если последняя попытка обновления завершилась неудачно, сообщает об ошибке.

Может использоваться сразу после создания нового обновляемого материализованного представления (без ключевого слова EMPTY), чтобы дождаться завершения начального обновления.

Если представление находится в реплицированной или общей базе данных, и обновление выполняется на другой реплике, ждет завершения этого обновления.

```sql
SYSTEM WAIT VIEW [db.]name
```
