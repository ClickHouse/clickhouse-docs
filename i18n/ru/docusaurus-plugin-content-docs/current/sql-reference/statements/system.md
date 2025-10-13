---
slug: '/sql-reference/statements/system'
sidebar_label: SYSTEM
sidebar_position: 36
description: 'Документация для SYSTEM Statements'
title: 'Операторы SYSTEM'
doc_type: reference
---
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Системные операторы

## SYSTEM RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

Перезагружает все [внутренние словари](../../sql-reference/dictionaries/index.md). По умолчанию внутренние словари отключены. Всегда возвращает `Ok.`, независимо от результата обновления внутреннего словаря.

## SYSTEM RELOAD DICTIONARIES {#reload-dictionaries}

Перезагружает все словари, которые были успешно загружены ранее. По умолчанию словари загружаются лениво (см. [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)), поэтому вместо автоматической загрузки при запуске они инициализируются при первом обращении через функцию dictGet или SELECT из таблиц с ENGINE = Dictionary. Запрос `SYSTEM RELOAD DICTIONARIES` перезагружает такие словари (LOADED). Всегда возвращает `Ok.`, независимо от результата обновления словаря.

**Синтаксис**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD DICTIONARY {#reload-dictionary}

Полностью перезагружает словарь `dictionary_name`, независимо от состояния словаря (LOADED / NOT_LOADED / FAILED). Всегда возвращает `Ok.`, независимо от результата обновления словаря.

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

Состояние словаря можно проверить, запросив таблицу `system.dictionaries`.

```sql
SELECT name, status FROM system.dictionaries;
```

## SYSTEM RELOAD MODELS {#reload-models}

:::note
Этот оператор и `SYSTEM RELOAD MODEL` просто выгружают модели catboost из clickhouse-library-bridge. Функция `catboostEvaluate()`
загружает модель при первом обращении, если она еще не загружена.
:::

Выгружает все модели CatBoost.

**Синтаксис**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD MODEL {#reload-model}

Выгружает модель CatBoost по адресу `model_path`.

**Синтаксис**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```

## SYSTEM RELOAD FUNCTIONS {#reload-functions}

Перезагружает все зарегистрированные [выполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions) или одну из них из файла конфигурации.

**Синтаксис**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## SYSTEM RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

Пересчитывает все [асинхронные метрики](../../operations/system-tables/asynchronous_metrics.md). Поскольку асинхронные метрики периодически обновляются на основе настройки [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md), их обновление вручную с помощью этого оператора обычно не требуется.

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## SYSTEM DROP DNS CACHE {#drop-dns-cache}

Очищает внутренний кэш DNS ClickHouse. Иногда (для старых версий ClickHouse) требуется использовать эту команду при изменении инфраструктуры (изменении IP-адреса другого сервера ClickHouse или сервера, используемого словарями).

Для более удобного (автоматического) управления кэшем смотрите параметры `disable_internal_dns_cache`, `dns_cache_max_entries`, `dns_cache_update_period`.

## SYSTEM DROP MARK CACHE {#drop-mark-cache}

Очищает кэш меток.

## SYSTEM DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

Очищает кэш метаданных iceberg.

## SYSTEM DROP REPLICA {#drop-replica}

Мертвые реплики таблиц `ReplicatedMergeTree` можно удалить, используя следующий синтаксис:

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

Запросы удалят путь реплики `ReplicatedMergeTree` в ZooKeeper. Это полезно для случаев, когда реплика мертва, и ее метаданные не могут быть удалены из ZooKeeper с помощью `DROP TABLE`, потому что такой таблицы больше не существует. Он удалит только неактивную/устаревшую реплику и не может удалить локальную реплику, для этого используйте `DROP TABLE`. `DROP REPLICA` не удаляет никаких таблиц и не удаляет никаких данных или метаданных с диска.

Первый удаляет метаданные реплики `'replica_name'` таблицы `database.table`. Второй делает то же самое для всех реплицированных таблиц в базе данных. Третий делает то же самое для всех реплицированных таблиц на локальном сервере. Четвертый полезен для удаления метаданных мертвой реплики, когда все другие реплики таблицы были удалены. Он требует, чтобы путь к таблице был указан явно. Он должен быть тем же путем, который был передан в первом аргументе движка `ReplicatedMergeTree` при создании таблицы.

## SYSTEM DROP DATABASE REPLICA {#drop-database-replica}

Мертвые реплики баз данных `Replicated` можно удалить, используя следующий синтаксис:

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

Похоже на `SYSTEM DROP REPLICA`, но удаляет путь реплики базы данных `Replicated` из ZooKeeper, когда нет базы данных для выполнения `DROP DATABASE`. Пожалуйста, обратите внимание, что он не удаляет реплики `ReplicatedMergeTree` (поэтому вам также может понадобиться `SYSTEM DROP REPLICA`). Названия шардов и реплик - это имена, которые были указаны в аргументах движка `Replicated` при создании базы данных. Также эти имена можно получить из столбцов `database_shard_name` и `database_replica_name` в `system.clusters`. Если отсутствует условие `FROM SHARD`, то `replica_name` должен быть полным именем реплики в формате `shard_name|replica_name`.

## SYSTEM DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

Очищает кэш нежатых данных. Кэш нежатых данных включается/выключается с помощью запроса/параметра уровня пользователя/профиля [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache). Его размер можно настроить с помощью настройки на уровне сервера [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size).

## SYSTEM DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

Очищает кэш скомпилированного выражения. Кэш скомпилированного выражения включается/выключается с помощью запроса/параметра уровня пользователя/профиля [`compile_expressions`](../../operations/settings/settings.md#compile_expressions).

## SYSTEM DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

Очищает кэш условий запросов.

## SYSTEM DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
````

Clears the [query cache](../../operations/query-cache.md).
If a tag is specified, only query cache entries with the specified tag are deleted.

## SYSTEM DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

Clears cache for schemas loaded from [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path).

Supported targets:
- Protobuf: Removes imported Protobuf message definitions from memory.
- Files: Deletes cached schema files stored locally in the [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path), generated when `format_schema_source` is set to `query`.
Note: If no target is specified, both caches are cleared.

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf/Files]
```

## SYSTEM FLUSH LOGS {#flush-logs}

Сбрасывает буферизованные журналы сообщений в системные таблицы, например system.query_log. В основном полезно для отладки, поскольку у большинства системных таблиц есть интервал сброса по умолчанию 7,5 секунд. Это также создаст системные таблицы, даже если очередь сообщений пуста.

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

Если вы не хотите сбрасывать все, вы можете сбросить один или несколько отдельных журналов, передав либо их имя, либо их целевую таблицу:

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## SYSTEM RELOAD CONFIG {#reload-config}

Перезагружает конфигурацию ClickHouse. Используется, когда конфигурация хранится в ZooKeeper. Обратите внимание, что `SYSTEM RELOAD CONFIG` не перезагружает конфигурацию `USER`, хранящуюся в ZooKeeper, он только перезагружает конфигурацию `USER`, которая хранится в `users.xml`. Для перезагрузки всей конфигурации `USER` используйте `SYSTEM RELOAD USERS`

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD USERS {#reload-users}

Перезагружает все хранилища доступа, включая: users.xml, доступ к локальному диску, реплицированное (в ZooKeeper) хранилище доступа.

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SYSTEM SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

Нормально завершает работу ClickHouse (как `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`)

## SYSTEM KILL {#kill}

Прерывает процесс ClickHouse (как `kill -9 {$ pid_clickhouse-server}`)

## Управление распределенными таблицами {#managing-distributed-tables}

ClickHouse может управлять [распределенными](../../engines/table-engines/special/distributed.md) таблицами. Когда пользователь вставляет данные в эти таблицы, ClickHouse сначала создает очередь данных, которые должны быть отправлены на узлы кластера, а затем асинхронно отправляет их. Вы можете управлять обработкой очереди с помощью запросов [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends), [FLUSH DISTRIBUTED](#flush-distributed) и [`START DISTRIBUTED SENDS`](#start-distributed-sends). Вы также можете синхронно вставлять распределенные данные с параметром [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert).

### SYSTEM STOP DISTRIBUTED SENDS {#stop-distributed-sends}

Отключает фоновое распределение данных при вставке данных в распределенные таблицы.

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
Если включен [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) (по умолчанию), данные будут вставлены в локальный шард в любом случае.
:::

### SYSTEM FLUSH DISTRIBUTED {#flush-distributed}

Принуждает ClickHouse синхронно отправлять данные на узлы кластера. Если какие-либо узлы недоступны, ClickHouse выдает исключение и останавливает выполнение запроса. Вы можете повторить запрос, пока он не будет выполнен успешно, что произойдет, когда все узлы будут снова в рабочем состоянии.

Вы также можете переопределить некоторые настройки через клаузу `SETTINGS`, это может быть полезно для избежания некоторых временных ограничений, таких как `max_concurrent_queries_for_all_users` или `max_memory_usage`.

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
Каждый ожидающий блок сохраняется на диске с настройками из первоначального запроса INSERT, поэтому иногда вам может потребоваться переопределить настройки.
:::

### SYSTEM START DISTRIBUTED SENDS {#start-distributed-sends}

Включает фоновое распределение данных при вставке данных в распределенные таблицы.

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### SYSTEM STOP LISTEN {#stop-listen}

Закрывает сокет и корректно завершает существующие соединения с сервером на указанном порту с указанным протоколом.

Однако, если соответствующие настройки протокола не были указаны в конфигурации clickhouse-server, эта команда не будет иметь эффекта.

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- Если указан модификатор `CUSTOM 'protocol'`, будет остановлен пользовательский протокол с указанным именем, определенным в разделе протоколов конфигурации сервера.
- Если указан модификатор `QUERIES ALL [EXCEPT .. [,..]]`, будут остановлены все протоколы, если они не указаны с клаузой `EXCEPT`.
- Если указан модификатор `QUERIES DEFAULT [EXCEPT .. [,..]]`, будут остановлены все протоколы по умолчанию, если они не указаны с клаузой `EXCEPT`.
- Если указан модификатор `QUERIES CUSTOM [EXCEPT .. [,..]]`, будут остановлены все пользовательские протоколы, если они не указаны с клаузой `EXCEPT`.

### SYSTEM START LISTEN {#start-listen}

Позволяет устанавливать новые соединения для указанных протоколов.

Однако, если сервер на указанном порту и протоколе не был остановлен с помощью команды SYSTEM STOP LISTEN, эта команда не будет иметь эффекта.

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## Управление таблицами MergeTree {#managing-mergetree-tables}

ClickHouse может управлять фоновыми процессами в таблицах [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

### SYSTEM STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

Предоставляет возможность остановить фоновые слияния для таблиц в семействе MergeTree:

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
Команда `DETACH / ATTACH` для таблицы запустит фоновые слияния для таблицы, даже если ранее слияния были остановлены для всех таблиц MergeTree.
:::

### SYSTEM START MERGES {#start-merges}

<CloudNotSupportedBadge/>

Предоставляет возможность запустить фоновые слияния для таблиц в семействе MergeTree:

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### SYSTEM STOP TTL MERGES {#stop-ttl-merges}

Предоставляет возможность остановить фоновое удаление старых данных в соответствии с [выражением TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц в семействе MergeTree:
Возвращает `Ok.`, даже если таблица не существует или у таблицы нет движка MergeTree. Возвращает ошибку, когда база данных не существует:

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM START TTL MERGES {#start-ttl-merges}

Предоставляет возможность запустить фоновое удаление старых данных в соответствии с [выражением TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц в семействе MergeTree:
Возвращает `Ok.`, даже если таблица не существует. Возвращает ошибку, когда база данных не существует:

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM STOP MOVES {#stop-moves}

Предоставляет возможность остановить фоновое перемещение данных в соответствии с [выражением TTL таблицы с клаузой TO VOLUME или TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц в семействе MergeTree:
Возвращает `Ok.`, даже если таблица не существует. Возвращает ошибку, когда база данных не существует:

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM START MOVES {#start-moves}

Предоставляет возможность запустить фоновые перемещения данных в соответствии с [выражением TTL таблицы с клаузой TO VOLUME и TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц в семействе MergeTree:
Возвращает `Ok.`, даже если таблица не существует. Возвращает ошибку, когда база данных не существует:

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM SYSTEM UNFREEZE {#query_language-system-unfreeze}

Очищает замороженную резервную копию с указанным именем со всех дисков. Дополнительную информацию о размораживании отдельных частей см. в [ALTER TABLE table_name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### SYSTEM WAIT LOADING PARTS {#wait-loading-parts}

Ожидание, пока все асинхронно загружаемые части данных таблицы (устаревшие части данных) не будут загружены.

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## Управление таблицами ReplicatedMergeTree {#managing-replicatedmergetree-tables}

ClickHouse может управлять фоновыми процессами, связанными с репликацией, в таблицах [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication).

### SYSTEM STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

Предоставляет возможность остановить фоновые выборки для вставленных частей для таблиц в семействе `ReplicatedMergeTree`:
Всегда возвращает `Ok.`, независимо от движка таблицы и даже если таблица или база данных не существуют.

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

Предоставляет возможность запустить фоновые выборки для вставленных частей для таблиц в семействе `ReplicatedMergeTree`:
Всегда возвращает `Ok.`, независимо от движка таблицы и даже если таблица или база данных не существуют.

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP REPLICATED SENDS {#stop-replicated-sends}

Предоставляет возможность остановить фоновые отправки на другие реплики в кластере для вновь вставленных частей таблиц в семействе `ReplicatedMergeTree`:

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START REPLICATED SENDS {#start-replicated-sends}

Предоставляет возможность запустить фоновые отправки на другие реплики в кластере для вновь вставленных частей таблиц в семействе `ReplicatedMergeTree`:

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP REPLICATION QUEUES {#stop-replication-queues}

Предоставляет возможность остановить фоновые задачи выборки из очередей репликации, которые хранятся в Zookeeper для таблиц в семействе `ReplicatedMergeTree`. Возможные типы фоновых задач - слияния, выборки, мутации, операторы DDL с клаузой ON CLUSTER:

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START REPLICATION QUEUES {#start-replication-queues}

Предоставляет возможность запустить фоновые задачи выборки из очередей репликации, которые хранятся в Zookeeper для таблиц в семействе `ReplicatedMergeTree`. Возможные типы фоновых задач - слияния, выборки, мутации, операторы DDL с клаузой ON CLUSTER:

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

Останавливает загрузку новых записей из журнала репликации в очередь репликации в таблице `ReplicatedMergeTree`.

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START PULLING REPLICATION LOG {#start-pulling-replication-log}

Отменяет `SYSTEM STOP PULLING REPLICATION LOG`.

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM SYNC REPLICA {#sync-replica}

Ожидание, пока таблица `ReplicatedMergeTree` будет синхронизирована с другими репликами в кластере, но не более `receive_timeout` секунд.

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

После выполнения этого оператора `[db.]replicated_merge_tree_family_table_name` выбирает команды из общего реплицированного журнала в свою очередь репликации, а затем запрос ожидания завершает обработку всех выбранных команд. Поддерживаются следующие модификаторы:

- При использовании `IF EXISTS` (доступен с версии 25.6) запрос не выдаст ошибку, если таблица не существует. Это полезно при добавлении новой реплики в кластер, когда она уже является частью конфигурации кластера, но все еще находится в процессе создания и синхронизации таблицы.
- Если задан модификатор `STRICT`, то запрос ожидает, пока очередь репликации не станет пустой. Версия `STRICT` может никогда не удаться, если новые записи постоянно появляются в очереди репликации.
- Если задан модификатор `LIGHTWEIGHT`, запрос ожидает только обработки записей `GET_PART`, `ATTACH_PART`, `DROP_RANGE`, `REPLACE_RANGE` и `DROP_PART`. Дополнительно модификатор LIGHTWEIGHT поддерживает необязательную клаузу FROM 'srcReplicas', где 'srcReplicas' - это список имен источников реплик, разделенных запятыми. Это расширение позволяет более целенаправленно синхронизировать, сосредоточившись только на задачах репликации, исходящих от указанных реплик.
- Если задан модификатор `PULL`, запрос выбирает новые записи очереди репликации из ZooKeeper, но не ожидает обработки.

### SYNC DATABASE REPLICA {#sync-database-replica}

Ожидает, пока указанная [реплицированная база данных](/engines/database-engines/replicated) применит все изменения схемы из очереди DDL этой базы данных.

**Синтаксис**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### SYSTEM RESTART REPLICA {#restart-replica}

Предоставляет возможность повторно инициализировать состояние сеанса Zookeeper для таблицы `ReplicatedMergeTree`, сравнит текущее состояние с ZooKeeper как источником правды и добавит задачи в очередь ZooKeeper, если это необходимо. Инициализация очереди репликации на основе данных ZooKeeper происходит так же, как и для оператора `ATTACH TABLE`. На короткое время таблица будет недоступна для любых операций.

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### SYSTEM RESTORE REPLICA {#restore-replica}

Восстанавливает реплику, если данные [возможно] присутствуют, но метаданные ZooKeeper потеряны.

Работает только на таблицах `ReplicatedMergeTree` в режиме только для чтения.

Можно выполнить запрос после:

- Утраты корня в ZooKeeper `/`.
- Утраты пути реплик `/replicas`.
- Утраты индивидуального пути реплики `/replicas/replica_name/`.

Реплика присоединяет локально найденные части и отправляет информацию о них в ZooKeeper. Части, находящиеся на реплике до потери метаданных, не извлекаются из других, если они не устарели (поэтому восстановление реплики не означает повторной загрузки всех данных через сеть).

:::note
Части во всех состояниях перемещаются в папку `detached/`. Активные части до потери данных (зафиксированные) прикрепляются.
:::

### SYSTEM RESTORE DATABASE REPLICA {#restore-database-replica}

Восстанавливает реплику, если данные [возможно] присутствуют, но метаданные ZooKeeper потеряны.

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

Альтернативный синтаксис:

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**Пример**

Создание таблицы на нескольких серверах. После того, как метаданные реплики в ZooKeeper будут потеряны, таблица будет присоединена как только для чтения, так как метаданные отсутствуют. Последний запрос необходимо выполнить на каждой реплике.

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

Предоставляет возможность повторно инициализировать состояние сеансов Zookeeper для всех таблиц `ReplicatedMergeTree`, будет сравнивать текущее состояние с ZooKeeper как источником правды и добавлять задачи в очередь ZooKeeper при необходимости.

### SYSTEM DROP FILESYSTEM CACHE {#drop-filesystem-cache}

Позволяет очистить файловый кэш.

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYSTEM SYNC FILE CACHE {#sync-file-cache}

:::note
Это слишком тяжело и имеет потенциал для злоупотреблений.
:::

Выполнит системный вызов синхронизации.

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```

### SYSTEM LOAD PRIMARY KEY {#load-primary-key}

Загружает первичные ключи для данной таблицы или для всех таблиц.

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```

### SYSTEM UNLOAD PRIMARY KEY {#unload-primary-key}

Выгружает первичные ключи для данной таблицы или для всех таблиц.

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```

## Управление обновляемыми материализованными представлениями {#refreshable-materialized-views}

Команды для управления фоновыми задачами, выполняемыми [обновляемыми материализованными представлениями](../../sql-reference/statements/create/view.md#refreshable-materialized-view)

Следите за [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md) при их использовании.

### SYSTEM REFRESH VIEW {#refresh-view}

Запускает немедленное обновление запланированного обновления данного представления.

```sql
SYSTEM REFRESH VIEW [db.]name
```

### SYSTEM WAIT VIEW {#wait-view}

Ожидает завершения текущего запущенного обновления. Если обновление не удалось, возникает исключение. Если обновление не выполняется, завершается немедленно, вызывая исключение, если предыдущее обновление не удалось.

### SYSTEM STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

Отключает периодическое обновление данного представления или всех обновляемых представлений. Если обновление выполняется, оно также отменяется.

Если представление находится в реплицированной или общей базе данных, `STOP VIEW` затрагивает только текущую реплику, в то время как `STOP REPLICATED VIEW` влияет на все реплики.

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### SYSTEM START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

Включает периодическое обновление данного представления или всех обновляемых представлений. Немедленное обновление не запускается.

Если представление находится в реплицированной или общей базе данных, `START VIEW` отменяет действие `STOP VIEW`, а `START REPLICATED VIEW` отменяет действие `STOP REPLICATED VIEW`.

```sql
SYSTEM START VIEW [db.]name
```
```sql
SYSTEM START VIEWS
```

### SYSTEM CANCEL VIEW {#cancel-view}

Если для данного представления на текущей реплике выполняется обновление, прерывает и отменяет его. В противном случае ничего не делает.

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

Ожидает завершения запущенного обновления. Если обновление не выполняется, возвращает немедленно. Если последняя попытка обновления не удалась, сообщает об ошибке.

Может использоваться сразу после создания нового обновляемого материализованного представления (без ключевого слова EMPTY), чтобы дождаться завершения первоначального обновления.

Если представление находится в реплицированной или общей базе данных, и обновление выполняется на другой реплике, ожидает завершения этого обновления.

```sql
SYSTEM WAIT VIEW [db.]name
```