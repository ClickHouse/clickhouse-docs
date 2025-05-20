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

Перезагружает все [внутренние словари](../../sql-reference/dictionaries/index.md). По умолчанию внутренние словари отключены. Всегда возвращает `Ok.`, независимо от результата обновления внутреннего словаря.

## RELOAD DICTIONARIES {#reload-dictionaries}

Перезагружает все словари, которые были успешно загружены ранее. По умолчанию словари загружаются лениво (см. [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)), так что вместо автоматической загрузки при запуске, они инициализируются при первом доступе через функцию dictGet или выборке из таблиц с ENGINE = Dictionary. Запрос `SYSTEM RELOAD DICTIONARIES` перезагружает такие словари (LOADED). Всегда возвращает `Ok.`, независимо от результата обновления словаря.

**Синтаксис**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## RELOAD DICTIONARY {#reload-dictionary}

Полностью перезагружает словарь `dictionary_name`, независимо от состояния словаря (LOADED / NOT_LOADED / FAILED). Всегда возвращает `Ok.`, независимо от результата обновления словаря.

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

Выгружает CatBoost модель по указанному `model_path`.

**Синтаксис**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```

## RELOAD FUNCTIONS {#reload-functions}

Перезагружает все зарегистрированные [выполнимые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions) или одну из них из файла конфигурации.

**Синтаксис**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

Перерассчитывает все [асинхронные метрики](../../operations/system-tables/asynchronous_metrics.md). Поскольку асинхронные метрики периодически обновляются на основе настройки [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md), их ручное обновление с помощью этого оператора обычно не требуется.

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

Мертвые реплики таблиц `ReplicatedMergeTree` могут быть удалены с помощью следующего синтаксиса:

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

Запросы удалят путь реплики `ReplicatedMergeTree` в ZooKeeper. Это полезно, когда реплика мертва и ее метаданные не могут быть удалены из ZooKeeper с помощью `DROP TABLE`, потому что такой таблицы больше нет. Это удалит только неактивную/устаревшую реплику, и вы не можете удалить локальную реплику, для этого используйте `DROP TABLE`. `DROP REPLICA` не удаляет никакие таблицы и не удаляет данные или метаданные с диска.

Первый запрос удаляет метаданные реплики `'replica_name'` таблицы `database.table`. Второй запрос делает то же самое для всех реплицированных таблиц в базе данных. Третий запрос делает то же самое для всех реплицированных таблиц на локальном сервере. Четвертый запрос полезен для удаления метаданных мертвой реплики, когда все другие реплики таблицы были удалены. Он требует явного указания пути таблицы, он должен быть тем же путем, который был передан в первом аргументе движка `ReplicatedMergeTree` при создании таблицы.

## DROP DATABASE REPLICA {#drop-database-replica}

Мертвые реплики баз данных `Replicated` могут быть удалены с помощью следующего синтаксиса:

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

Аналогично `SYSTEM DROP REPLICA`, но удаляет путь реплики `Replicated` базы данных из ZooKeeper, когда нет базы данных для выполнения `DROP DATABASE`. Пожалуйста, обратите внимание, что это не удаляет реплики `ReplicatedMergeTree` (поэтому вам может понадобиться также использовать `SYSTEM DROP REPLICA`). Имена шардов и реплик - это имена, которые были указаны в аргументах движка `Replicated` при создании базы данных. Эти имена также можно получить из столбцов `database_shard_name` и `database_replica_name` в `system.clusters`. Если оператор `FROM SHARD` отсутствует, то `replica_name` должен быть полным именем реплики в формате `shard_name|replica_name`.

## DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

Очищает кэш необработанных данных. Кэш необработанных данных включается/выключается с помощью настройки [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache). Его размер может быть настроен с помощью настройки уровня сервера [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size).

## DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

Очищает кэш скомпилированных выражений. Кэш скомпилированных выражений включается/выключается с помощью настройки уровня запроса/пользователя/профиля [`compile_expressions`](../../operations/settings/settings.md#compile_expressions).

## DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

Очищает кэш условий запросов.

## DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
````

Очищает [кэш запросов](../../operations/query-cache.md). Если указан тег, удаляются только записи кэша запросов с указанным тегом.

## DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

Очищает кэш для схем, загруженных из [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path).

Поддерживаемые форматы:

- Protobuf

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]
```

## FLUSH LOGS {#flush-logs}

Сбрасывает буферизованные сообщения журнала в системные таблицы, например system.query_log. В основном полезно для отладки, поскольку у большинства системных таблиц есть интервал сброса по умолчанию 7.5 секунд. Это также создаст системные таблицы, даже если очередь сообщений пуста.

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

Если вы не хотите сбрасывать все, вы можете сбросить один или несколько отдельных журналов, передав либо их имя, либо их целевую таблицу:

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## RELOAD CONFIG {#reload-config}

Перезагружает конфигурацию ClickHouse. Используется, когда конфигурация хранится в ZooKeeper. Обратите внимание, что `SYSTEM RELOAD CONFIG` не перезагружает конфигурацию `USER`, хранящуюся в ZooKeeper, он только перезагружает конфигурацию `USER`, которая хранится в `users.xml`. Чтобы перезагрузить всю конфигурацию `USER`, используйте `SYSTEM RELOAD USERS`

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## RELOAD USERS {#reload-users}

Перезагружает все хранилища доступа, включая: users.xml, хранилище доступа на локальном диске, реплицированное (в ZooKeeper) хранилище доступа.

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

Обычно завершает работу ClickHouse (как `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`)

## KILL {#kill}

Прерывает процесс ClickHouse (как `kill -9 {$ pid_clickhouse-server}`)

## Управление распределенными таблицами {#managing-distributed-tables}

ClickHouse может управлять [распределенными](../../engines/table-engines/special/distributed.md) таблицами. Когда пользователь вставляет данные в эти таблицы, ClickHouse сначала создает очередь данных, которые должны быть отправлены на узлы кластера, а затем отправляет их асинхронно. Вы можете управлять обработкой очереди с помощью запросов [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends), [FLUSH DISTRIBUTED](#flush-distributed) и [`START DISTRIBUTED SENDS`](#start-distributed-sends). Вы также можете синхронно вставлять распределенные данные с настройкой [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert).

### STOP DISTRIBUTED SENDS {#stop-distributed-sends}

Отключает фоновую распределение данных при вставке данных в распределенные таблицы.

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
В случае, если включена настройка [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) (по умолчанию), данные будут вставлены в локальный шард, несмотря на это.
:::

### FLUSH DISTRIBUTED {#flush-distributed}

Принудительно заставляет ClickHouse отправить данные в узлы кластера синхронно. Если какие-либо узлы недоступны, ClickHouse выбрасывает исключение и останавливает выполнение запроса. Вы можете повторить запрос до тех пор, пока он не будет успешным, что произойдет, когда все узлы снова будут онлайн.

Вы также можете переопределить некоторые настройки с помощью оператора `SETTINGS`, это может быть полезно для избегания некоторых временных ограничений, таких как `max_concurrent_queries_for_all_users` или `max_memory_usage`.

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
Каждый ожидающий блок хранится на диске с настройками из начального запроса INSERT, так что иногда вы можете захотеть переопределить настройки.
:::

### START DISTRIBUTED SENDS {#start-distributed-sends}

Включает фоновое распределение данных при вставке данных в распределенные таблицы.

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### STOP LISTEN {#stop-listen}

Закрывает сокет и корректно завершает существующие соединения с сервером на указанном порту с указанным протоколом.

Тем не менее, если соответствующие настройки протокола не были указаны в конфигурации clickhouse-server, эта команда не окажет эффекта.

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- Если указан модификатор `CUSTOM 'protocol'`, будет остановлен пользовательский протокол с указанным именем, определенным в разделе протоколов конфигурации сервера.
- Если указан модификатор `QUERIES ALL [EXCEPT .. [,..]]`, все протоколы останавливаются, за исключением тех, которые указаны с помощью оператора `EXCEPT`.
- Если указан модификатор `QUERIES DEFAULT [EXCEPT .. [,..]]`, все протоколы по умолчанию останавливаются, за исключением тех, которые указаны с помощью оператора `EXCEPT`.
- Если указан модификатор `QUERIES CUSTOM [EXCEPT .. [,..]]`, все пользовательские протоколы останавливаются, за исключением тех, которые указаны с помощью оператора `EXCEPT`.

### START LISTEN {#start-listen}

Позволяет устанавливать новые соединения по указанным протоколам.

Тем не менее, если сервер на указанном порту и протоколе не был остановлен с помощью команды SYSTEM STOP LISTEN, эта команда не окажет эффекта.

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## Управление таблицами MergeTree {#managing-mergetree-tables}

ClickHouse может управлять фоновыми процессами в таблицах [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

### STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

Предоставляет возможность остановить фоновое слияние для таблиц семейства MergeTree:

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
Команда `DETACH / ATTACH` финализирует фоновую слияние для таблицы, даже если слияние было остановлено для всех таблиц MergeTree ранее.
:::

### START MERGES {#start-merges}

<CloudNotSupportedBadge/>

Предоставляет возможность начать фоновое слияние для таблиц семейства MergeTree:

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### STOP TTL MERGES {#stop-ttl-merges}

Предоставляет возможность остановить фоновое удаление старых данных в соответствии с [TTL выражением](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц семейства MergeTree:
Возвращает `Ok.`, даже если таблица не существует или таблица не имеет движка MergeTree. Возвращает ошибку, когда база данных не существует:

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START TTL MERGES {#start-ttl-merges}

Предоставляет возможность начать фоновое удаление старых данных в соответствии с [TTL выражением](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц семейства MergeTree:
Возвращает `Ok.`, даже если таблица не существует. Возвращает ошибку, когда база данных не существует:

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### STOP MOVES {#stop-moves}

Предоставляет возможность остановить фоновое перемещение данных в соответствии с [TTL таблицы выражением с TO VOLUME или TO DISK оператором](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц семейства MergeTree:
Возвращает `Ok.`, даже если таблица не существует. Возвращает ошибку, когда база данных не существует:

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### START MOVES {#start-moves}

Предоставляет возможность начать фоновое перемещение данных в соответствии с [TTL таблицы выражением с TO VOLUME и TO DISK оператором](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц семейства MergeTree:
Возвращает `Ok.`, даже если таблица не существует. Возвращает ошибку, когда база данных не существует:

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM UNFREEZE {#query_language-system-unfreeze}

Очищает замороженную резервную копию с указанным именем со всех дисков. Смотрите больше о размораживании отдельных частей в [ALTER TABLE table_name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### WAIT LOADING PARTS {#wait-loading-parts}

Ждет, пока все асинхронно загружаемые части данных таблицы (устаревшие части данных) станут загруженными.

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## Управление таблицами ReplicatedMergeTree {#managing-replicatedmergetree-tables}

ClickHouse может управлять фоновой репликацией связанных процессов в таблицах [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication).

### STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

Предоставляет возможность остановить фоновую выгрузку для вставленных частей для таблиц семейства `ReplicatedMergeTree`:
Всегда возвращает `Ok.`, независимо от движка таблицы и даже если таблица или база данных не существуют.

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

Предоставляет возможность начать фоновую выгрузку для вставленных частей для таблиц семейства `ReplicatedMergeTree`:
Всегда возвращает `Ok.`, независимо от движка таблицы и даже если таблица или база данных не существуют.

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATED SENDS {#stop-replicated-sends}

Предоставляет возможность остановить фоновую выгрузку для других реплик в кластере для новых вставленных частей для таблиц семейства `ReplicatedMergeTree`:

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATED SENDS {#start-replicated-sends}

Предоставляет возможность начать фоновую выгрузку для других реплик в кластере для новых вставленных частей для таблиц семейства `ReplicatedMergeTree`:

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### STOP REPLICATION QUEUES {#stop-replication-queues}

Предоставляет возможность остановить фоновые задачи выгрузки из очередей репликации, которые хранятся в Zookeeper для таблиц семейства `ReplicatedMergeTree`. Возможные типы фоновых задач - слияния, выгрузки, мутации, DDL операторы с оператором ON CLUSTER:

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### START REPLICATION QUEUES {#start-replication-queues}

Предоставляет возможность начать фоновые задачи выгрузки из очередей репликации, которые хранятся в Zookeeper для таблиц семейства `ReplicatedMergeTree`. Возможные типы фоновых задач - слияния, выгрузки, мутации, DDL операторы с оператором ON CLUSTER:

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

Ждет, пока таблица `ReplicatedMergeTree` синхронизируется с другими репликами в кластере, но не более чем на `receive_timeout` секунд.

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

После выполнения этого оператора `[db.]replicated_merge_tree_family_table_name` извлекает команды из общего журнала репликации в свою собственную очередь репликации, а затем запрос ожидает, пока реплика обработает все извлеченные команды. Поддерживаются следующие модификаторы:

 - Если указан модификатор `STRICT`, тогда запрос ждет, пока очередь репликации не станет пустой. Версия `STRICT` может никогда не завершиться успешно, если в очереди репликации постоянно появляются новые записи.
 - Если указан модификатор `LIGHTWEIGHT`, тогда запрос ждет только обработки записей `GET_PART`, `ATTACH_PART`, `DROP_RANGE`, `REPLACE_RANGE` и `DROP_PART`. 
   Дополнительно, модификатор LIGHTWEIGHT поддерживает необязательный оператор FROM 'srcReplicas', где 'srcReplicas' - это запятая-разделенный список имен исходных реплик. Это расширение позволяет более целенаправленную синхронизацию, сосредотачиваясь только на задачах репликации, происходящих от указанных исходных реплик.
 - Если указан модификатор `PULL`, запрос извлекает новые записи очереди репликации из ZooKeeper, но не ждет обработки ничего.

### SYNC DATABASE REPLICA {#sync-database-replica}

Ждет, пока указанная [реплицированная база данных](/engines/database-engines/replicated) применит все изменения схемы из DDL очереди этой базы данных.

**Синтаксис**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### RESTART REPLICA {#restart-replica}

Предоставляет возможность повторной инициализации состояния сессии ZooKeeper для таблицы `ReplicatedMergeTree`, будет сравнивать текущее состояние с ZooKeeper как источник правды и добавлять задачи в очередь ZooKeeper, если это необходимо.
Инициализация очереди репликации на основе данных ZooKeeper происходит так же, как для оператора `ATTACH TABLE`. На короткое время таблица будет недоступна для любых операций.

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### RESTORE REPLICA {#restore-replica}

Восстанавливает реплику, если данные [возможно] присутствуют, но метаданные ZooKeeper потеряны.

Работает только на `ReplicatedMergeTree` таблицах с режимом только для чтения.

Запрос можно выполнить после:

  - Потери корня ZooKeeper `/`.
  - Потери пути реплик `/replicas`.
  - Потери отдельного пути реплики `/replicas/replica_name/`.

Реплика прикрепляет локально найденные части и отправляет информацию о них в ZooKeeper. Части, присутствующие на реплике до потери метаданных, не извлекаются снова из других частей, если они не являются устаревшими (поэтому восстановление реплики не означает повторной загрузки всех данных через сеть).

:::note
Части во всех состояниях перемещаются в папку `detached/`. Части, активные до потери данных (зафиксированные), прикрепляются.
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

Создание таблицы на нескольких серверах. После потери метаданных реплики в ZooKeeper, таблица будет прикреплена как только для чтения, так как метаданные отсутствуют. Последний запрос нужно выполнить на каждой реплике.

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

### RESTART REPLICAS {#restart-replicas}

Предоставляет возможность повторной инициализации состояния сессий ZooKeeper для всех таблиц `ReplicatedMergeTree`, будет сравнивать текущее состояние с ZooKeeper как источник правды и добавлять задачи в очередь ZooKeeper, если это необходимо.

### DROP FILESYSTEM CACHE {#drop-filesystem-cache}

Позволяет удалить кэш файловой системы.

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYNC FILE CACHE {#sync-file-cache}

:::note
Это очень тяжелая операция и имеет потенциал для неправильного использования.
:::

Выполнит системный вызов синхронизации.

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```

### LOAD PRIMARY KEY {#load-primary-key}

Загружает первичные ключи для указанной таблицы или для всех таблиц.

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```

### UNLOAD PRIMARY KEY {#unload-primary-key}

Выгружает первичные ключи для указанной таблицы или для всех таблиц.

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

Запускает немедленное обновление вне расписания для данного представления.

```sql
SYSTEM REFRESH VIEW [db.]name
```

### REFRESH VIEW {#refresh-view-1}

Ждет завершения текущего обновления. Если обновление не удалось, выбрасывает исключение. Если обновление не выполняется, завершается немедленно, выбрасывая исключение, если предыдущее обновление не удалось.

### STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

Отключает периодическое обновление данного представления или всех обновляемых представлений. Если обновление выполняется, отменяет его тоже.

Если представление находится в реплицированной или общей базе данных, `STOP VIEW` влияет только на текущую реплику, в то время как `STOP REPLICATED VIEW` влияет на все реплики.

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

Включает периодическое обновление для данного представления или для всех обновляемых представлений. Никакое немедленное обновление не инициируется.

Если представление находится в реплицированной или общей базе данных, `START VIEW` отменяет эффект `STOP VIEW`, а `START REPLICATED VIEW` отменяет эффект `STOP REPLICATED VIEW`.

```sql
SYSTEM START VIEW [db.]name
```
```sql
SYSTEM START VIEWS
```

### CANCEL VIEW {#cancel-view}

Если для данного представления на текущей реплике выполняется обновление, прерывает и отменяет его. В противном случае не делает ничего.

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

Ждет завершения выполняющегося обновления. Если обновление не выполняется, сразу возвращает. Если последняя попытка обновления не удалась, сообщает об ошибке.

Может использоваться сразу после создания нового обновляемого материализованного представления (без ключевого слова EMPTY), чтобы дождаться завершения первоначального обновления.

Если представление находится в реплицированной или общей базе данных, и обновление выполняется на другой реплике, ждет завершения этого обновления.

```sql
SYSTEM WAIT VIEW [db.]name
```
