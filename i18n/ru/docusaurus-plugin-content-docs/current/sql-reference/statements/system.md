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

## SYSTEM RELOAD EMBEDDED DICTIONARIES \{#reload-embedded-dictionaries\}

Перезагружает все [внутренние словари](../../sql-reference/dictionaries/index.md).
По умолчанию внутренние словари отключены.
Всегда возвращает `Ok.` независимо от результата обновления внутренних словарей.

## SYSTEM RELOAD DICTIONARIES

Запрос `SYSTEM RELOAD DICTIONARIES` перезагружает словари со статусом `LOADED` (см. столбец `status` таблицы [`system.dictionaries`](/operations/system-tables/dictionaries)), то есть словари, которые ранее были успешно загружены.
По умолчанию словари загружаются лениво (см. [dictionaries&#95;lazy&#95;load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)), поэтому вместо автоматической загрузки при запуске они инициализируются при первом обращении через функцию [`dictGet`](/sql-reference/functions/ext-dict-functions#dictGet) или при выполнении `SELECT` из таблиц с `ENGINE = Dictionary`.

**Синтаксис**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER имя_кластера]
```


## SYSTEM RELOAD DICTIONARY

Полностью перезагружает словарь `dictionary_name`, независимо от его состояния (LOADED / NOT&#95;LOADED / FAILED).
Всегда возвращает `Ok.` независимо от результата обновления словаря.

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER имя_кластера] имя_словаря
```

Статус словаря можно проверить, выполнив запрос к таблице `system.dictionaries`.

```sql
SELECT name, status FROM system.dictionaries;
```


## SYSTEM RELOAD MODELS

:::note
Эта команда и `SYSTEM RELOAD MODEL` только выгружают модели CatBoost из clickhouse-library-bridge. Функция `catboostEvaluate()`
загружает модель при первом обращении, если она ещё не загружена.
:::

Выгружает все модели CatBoost.

**Синтаксис**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER имя_кластера]
```


## SYSTEM RELOAD MODEL

Выгружает из памяти модель CatBoost, расположенную по пути `model_path`.

**Синтаксис**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER имя_кластера] <путь_модели>
```


## ФУНКЦИИ SYSTEM RELOAD

Перезагружает все зарегистрированные [исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions) или одну из них из конфигурационного файла.

**Синтаксис**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER имя_кластера]
SYSTEM RELOAD FUNCTION [ON CLUSTER имя_кластера] имя_функции
```


## SYSTEM RELOAD ASYNCHRONOUS METRICS

Пересчитывает все [асинхронные метрики](../../operations/system-tables/asynchronous_metrics.md). Поскольку асинхронные метрики периодически обновляются в соответствии с параметром конфигурации [asynchronous&#95;metrics&#95;update&#95;period&#95;s](../../operations/server-configuration-parameters/settings.md), их ручное обновление с помощью этого оператора, как правило, не требуется.

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER имя_кластера]
```


## SYSTEM DROP DNS CACHE \{#drop-dns-cache\}

Очищает внутренний DNS-кэш ClickHouse. Иногда (для старых версий ClickHouse) необходимо использовать эту команду при изменении инфраструктуры (при изменении IP-адреса другого сервера ClickHouse или сервера, используемого словарями).

Для более удобного (автоматического) управления кэшем см. параметры `disable_internal_dns_cache`, `dns_cache_max_entries`, `dns_cache_update_period`.

## SYSTEM DROP MARK CACHE \{#drop-mark-cache\}

Очищает кэш меток.

## SYSTEM DROP ICEBERG METADATA CACHE \{#drop-iceberg-metadata-cache\}

Очищает кэш метаданных Iceberg.

## SYSTEM DROP TEXT INDEX DICTIONARY CACHE \{#drop-text-index-dictionary-cache\}

Очищает кэш словаря текстового индекса.

## SYSTEM DROP TEXT INDEX HEADER CACHE \{#drop-text-index-header-cache\}

Очищает кэш заголовков текстового индекса.

## SYSTEM DROP TEXT INDEX POSTINGS CACHE \{#drop-text-index-postings-cache\}

Очищает кэш постингов текстового индекса.

## SYSTEM DROP TEXT INDEX CACHES \{#drop-text-index-caches\}

Очищает кэш заголовков текстового индекса, кэш словаря и кэш постингов.

## SYSTEM DROP REPLICA

Неактивные реплики таблиц `ReplicatedMergeTree` можно удалить с помощью следующего синтаксиса:

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

Запросы удаляют путь к реплике `ReplicatedMergeTree` в ZooKeeper. Это полезно, когда реплика неактивна (мертвая), и её метаданные не могут быть удалены из ZooKeeper с помощью `DROP TABLE`, потому что соответствующей таблицы больше не существует. Будет удалена только неактивная/устаревшая реплика; локальную реплику таким образом удалить нельзя, для неё используйте `DROP TABLE`. `DROP REPLICA` не удаляет таблицы и не удаляет какие‑либо данные или метаданные с диска.

Первый запрос удаляет метаданные реплики `'replica_name'` таблицы `database.table`.
Второй делает то же самое для всех реплицируемых таблиц в базе данных.
Третий делает то же самое для всех реплицируемых таблиц на локальном сервере.
Четвёртый полезен для удаления метаданных неактивной (мертвой) реплики, когда все остальные реплики таблицы были удалены. Для него требуется явно указать путь к таблице. Он должен совпадать с путём, который был передан в первый аргумент движка `ReplicatedMergeTree` при создании таблицы.


## SYSTEM DROP DATABASE REPLICA

«Мёртвые» реплики баз данных с движком `Replicated` можно удалить, используя следующий синтаксис:

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

Аналогично команде `SYSTEM DROP REPLICA`, но удаляет путь реплики базы данных `Replicated` в ZooKeeper, когда нет самой базы данных, над которой можно выполнить `DROP DATABASE`. Обратите внимание, что эта команда не удаляет реплики `ReplicatedMergeTree` (поэтому вам также может понадобиться `SYSTEM DROP REPLICA`). Имена шарда и реплики — это имена, которые были указаны в аргументах движка `Replicated` при создании базы данных. Кроме того, эти имена можно получить из столбцов `database_shard_name` и `database_replica_name` в `system.clusters`. Если предложение `FROM SHARD` отсутствует, то `replica_name` должен быть полным именем реплики в формате `shard_name|replica_name`.


## SYSTEM DROP UNCOMPRESSED CACHE \{#drop-uncompressed-cache\}

Очищает кеш несжатых данных.
Кеш несжатых данных включается и отключается настройкой на уровне запроса/пользователя/профиля [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache).
Его размер можно настроить с помощью настройки на уровне сервера [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size).

## SYSTEM DROP COMPILED EXPRESSION CACHE \{#drop-compiled-expression-cache\}

Очищает кэш скомпилированных выражений.
Кэш скомпилированных выражений управляется настройкой на уровне запроса, пользователя или профиля [`compile_expressions`](../../operations/settings/settings.md#compile_expressions).

## SYSTEM DROP QUERY CONDITION CACHE \{#drop-query-condition-cache\}

Очищает кеш условий запросов.

## SYSTEM DROP QUERY CACHE

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
```

Очищает [кэш запросов](../../operations/query-cache.md).
Если указан тег, удаляются только записи кэша запросов с этим тегом.


## SYSTEM DROP FORMAT SCHEMA CACHE

Очищает кэш для схем, загруженных из [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path).

Поддерживаемые варианты:

* Protobuf: удаляет импортированные определения Protobuf-сообщений из памяти.
* Files: удаляет кэшированные файлы схем, сохранённые локально в [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path), которые были сгенерированы, когда для `format_schema_source` задано значение `query`.

Примечание: если цель не указана, оба кэша очищаются.

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf/Files]
```


## SYSTEM FLUSH LOGS

Сбрасывает буферизованные сообщения журнала в системные таблицы, например `system.query_log`. В основном полезно для отладки, поскольку для большинства системных таблиц интервал сброса по умолчанию составляет 7,5 секунды.
Эта команда также создаст системные таблицы, даже если очередь сообщений пуста.

```sql
SYSTEM FLUSH LOGS [ON CLUSTER имя_кластера] [имя_журнала|[база_данных.таблица]] [, ...]
```

Если вы не хотите сбрасывать всё содержимое, можно сбросить один или несколько отдельных логов, передав их имя или целевую таблицу:

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```


## SYSTEM RELOAD CONFIG

Перезагружает конфигурацию ClickHouse. Используется, когда конфигурация хранится в ZooKeeper. Обратите внимание, что `SYSTEM RELOAD CONFIG` не перезагружает конфигурацию `USER`, хранящуюся в ZooKeeper, а только конфигурацию `USER`, которая хранится в `users.xml`. Чтобы перезагрузить всю конфигурацию `USER`, используйте `SYSTEM RELOAD USERS`.

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD USERS

Перезагружает все хранилища доступа, включая users.xml, локальное хранилище доступа на диске и реплицируемое (в ZooKeeper) хранилище доступа.

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```


## SYSTEM SHUTDOWN \{#shutdown\}

<CloudNotSupportedBadge/>

Выполняет штатное завершение работы ClickHouse (аналогично `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`)

## SYSTEM KILL \{#kill\}

Принудительно завершает процесс ClickHouse (аналогично `kill -9 {$ pid_clickhouse-server}`)

## Управление распределёнными таблицами \{#managing-distributed-tables\}

ClickHouse может управлять [распределёнными](../../engines/table-engines/special/distributed.md) таблицами. Когда пользователь вставляет данные в эти таблицы, ClickHouse сначала создаёт очередь данных, подлежащих отправке на узлы кластера, а затем асинхронно отправляет их. Вы можете управлять обработкой очереди с помощью запросов [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends), [FLUSH DISTRIBUTED](#flush-distributed) и [`START DISTRIBUTED SENDS`](#start-distributed-sends). Вы также можете синхронно вставлять распределённые данные с помощью настройки [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert).

### SYSTEM STOP DISTRIBUTED SENDS

Отключает фоновое распределение данных при вставке в распределённые таблицы.

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<имя_распределённой_таблицы> [ON CLUSTER имя_кластера]
```

:::note
Если параметр [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) включён (по умолчанию), данные всё равно будут записаны в локальный шард.
:::


### SYSTEM FLUSH DISTRIBUTED

Принудительно инициирует синхронную отправку данных ClickHouse на узлы кластера. Если какие-либо узлы недоступны, ClickHouse генерирует исключение и останавливает выполнение запроса. Вы можете повторять запрос до тех пор, пока он не выполнится успешно, то есть пока все узлы снова не станут доступными.

Вы также можете переопределить некоторые настройки с помощью оператора `SETTINGS`, что может быть полезно для обхода временных ограничений, таких как `max_concurrent_queries_for_all_users` или `max_memory_usage`.

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
Каждый блок в ожидании обработки сохраняется на диск с параметрами из исходного запроса INSERT, поэтому иногда может потребоваться переопределить эти параметры.
:::


### SYSTEM START DISTRIBUTED SENDS

Включает фоновое распределение данных при вставке в распределённые таблицы.

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```


### SYSTEM STOP LISTEN

Закрывает сокет и корректно завершает существующие подключения к серверу на указанном порту с использованием указанного протокола.

Однако, если соответствующие настройки протокола не были заданы в конфигурации clickhouse-server, эта команда не окажет никакого действия.

```sql
SYSTEM STOP LISTEN [ON CLUSTER имя_кластера] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'протокол']
```

* Если указан модификатор `CUSTOM 'protocol'`, будет остановлен пользовательский протокол с указанным именем, определённый в секции `protocols` конфигурации сервера.
* Если указан модификатор `QUERIES ALL [EXCEPT .. [,..]]`, будут остановлены все протоколы, за исключением явно указанных в операторе `EXCEPT`.
* Если указан модификатор `QUERIES DEFAULT [EXCEPT .. [,..]]`, будут остановлены все протоколы по умолчанию, за исключением явно указанных в операторе `EXCEPT`.
* Если указан модификатор `QUERIES CUSTOM [EXCEPT .. [,..]]`, будут остановлены все пользовательские протоколы, за исключением явно указанных в операторе `EXCEPT`.


### SYSTEM START LISTEN

Позволяет устанавливать новые соединения по указанным протоколам.

Однако если сервер на указанном порту и протоколе не был остановлен с помощью команды SYSTEM STOP LISTEN, эта команда не подействует.

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```


## Управление таблицами MergeTree \{#managing-mergetree-tables\}

ClickHouse может управлять фоновыми процессами в таблицах типа [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

### SYSTEM STOP MERGES

<CloudNotSupportedBadge />

Позволяет останавливать фоновые слияния для таблиц семейства MergeTree:

```sql
SYSTEM STOP MERGES [ON CLUSTER имя_кластера] [ON VOLUME <имя_тома> | [бд.]имя_таблицы_семейства_merge_tree]
```

:::note
Операции `DETACH / ATTACH` таблицы запустят фоновые слияния для этой таблицы даже в том случае, если слияния были остановлены для всех таблиц MergeTree.
:::


### SYSTEM START MERGES

<CloudNotSupportedBadge />

Позволяет запустить фоновые слияния для таблиц семейства MergeTree:

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```


### SYSTEM STOP TTL MERGES

Позволяет остановить фоновое удаление старых данных в соответствии с [TTL-выражением](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц семейства MergeTree.
Возвращает `Ok.` даже если таблица не существует или таблица не использует движок MergeTree. Возвращает ошибку, если база данных не существует.

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER имя_кластера] [[бд.]имя_таблицы_семейства_merge_tree]
```


### SYSTEM START TTL MERGES

Позволяет запустить фоновое удаление старых данных в соответствии с [TTL-выражением](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц семейства MergeTree.\
Возвращает `Ok.`, даже если таблица не существует. Возвращает ошибку, если база данных не существует.

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM STOP MOVES

Позволяет остановить фоновое перемещение данных в соответствии с [TTL-выражением таблицы с оператором TO VOLUME или TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц семейства MergeTree.\
Возвращает `Ok.` даже, если таблица не существует. Возвращает ошибку, если база данных не существует:

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM START MOVES

Позволяет запустить фоновое перемещение данных в соответствии с [TTL-выражением таблицы с операторами TO VOLUME и TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц семейства MergeTree:
Возвращает `Ok.` даже если таблица отсутствует. Возвращает ошибку, если база данных не существует:

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM SYSTEM UNFREEZE

Удаляет замороженный бэкап с указанным именем со всех дисков. Подробнее о разморозке отдельных частей см. в разделе [ALTER TABLE table&#95;name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)

```sql
РАЗМОРОЗИТЬ СИСТЕМУ С ИМЕНЕМ <backup_name>
```


### SYSTEM WAIT LOADING PARTS

Ожидать, пока все асинхронно загружаемые части данных таблицы (устаревшие части данных) не будут загружены.

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```


## Управление таблицами ReplicatedMergeTree \{#managing-replicatedmergetree-tables\}

ClickHouse может управлять фоновыми процессами, связанными с репликацией, в таблицах [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication).

### SYSTEM STOP FETCHES

<CloudNotSupportedBadge />

Останавливает фоновую загрузку вставленных кусков данных для таблиц семейства `ReplicatedMergeTree`.
Всегда возвращает `Ok.` независимо от движка таблицы, а также если таблица или база данных не существует.

```sql
SYSTEM STOP FETCHES [ON CLUSTER имя_кластера] [[бд.]имя_реплицируемой_таблицы_семейства_merge_tree]
```


### SYSTEM START FETCHES

<CloudNotSupportedBadge />

Позволяет запустить фоновые загрузки вставленных частей данных для таблиц семейства `ReplicatedMergeTree`.
Всегда возвращает `Ok.` независимо от движка таблицы, даже если таблица или база данных не существует.

```sql
SYSTEM START FETCHES [ON CLUSTER имя_кластера] [[бд.]имя_таблицы_семейства_replicated_merge_tree]
```


### SYSTEM STOP REPLICATED SENDS

Позволяет остановить фоновую отправку новых вставленных частей таблиц семейства `ReplicatedMergeTree` на другие реплики кластера:

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER имя_кластера] [[бд.]имя_таблицы_семейства_replicated_merge_tree]
```


### SYSTEM START REPLICATED SENDS

Позволяет запустить фоновые отправки новых вставленных частей на другие реплики кластера для таблиц семейства `ReplicatedMergeTree`:

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER имя_кластера] [[бд.]имя_таблицы_семейства_replicated_merge_tree]
```


### SYSTEM STOP REPLICATION QUEUES

Предоставляет возможность остановить фоновые задачи загрузки (`fetch`) из очередей репликации, хранящихся в Zookeeper для таблиц семейства `ReplicatedMergeTree`. Возможные типы фоновых задач — слияния (`merges`), загрузки (`fetches`), мутации (`mutations`), операторы DDL с клаузой ON CLUSTER:

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER имя_кластера] [[бд.]имя_таблицы_семейства_replicated_merge_tree]
```


### SYSTEM START REPLICATION QUEUES

Позволяет запустить фоновые задачи загрузки из очередей репликации, которые хранятся в ZooKeeper для таблиц семейства `ReplicatedMergeTree`. Возможные типы фоновых задач — слияния, загрузки, мутации, DDL-операторы с предложением ON CLUSTER:

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER имя_кластера] [[бд.]имя_таблицы_семейства_replicated_merge_tree]
```


### SYSTEM STOP PULLING REPLICATION LOG

Прекращает загрузку новых записей из журнала репликации в очередь репликации в таблице `ReplicatedMergeTree`.

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START PULLING REPLICATION LOG

Отменяет `SYSTEM STOP PULLING REPLICATION LOG`.

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM SYNC REPLICA

Ожидает, пока таблица `ReplicatedMergeTree` не будет синхронизирована с другими репликами в кластере, но не дольше, чем `receive_timeout` секунд.

```sql
SYSTEM SYNC REPLICA [ON CLUSTER имя_кластера] [бд.]имя_таблицы_семейства_replicated_merge_tree [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'исходная_реплика1'[, 'исходная_реплика2'[, ...]]] | PULL]
```

После выполнения этого запроса `[db.]replicated_merge_tree_family_table_name` получает команды из общего журнала репликации в собственную очередь репликации, после чего запрос ожидает, пока реплика обработает все полученные команды. Поддерживаются следующие модификаторы:

* При использовании `IF EXISTS` (доступен начиная с 25.6) запрос не будет выдавать ошибку, если таблица не существует. Это полезно при добавлении новой реплики в кластер, когда она уже является частью конфигурации кластера, но таблица ещё находится в процессе создания и синхронизации.
* Если указан модификатор `STRICT`, то запрос ожидает, пока очередь репликации не опустеет. Вариант `STRICT` может никогда не завершиться успешно, если в очередь репликации постоянно добавляются новые записи.
* Если указан модификатор `LIGHTWEIGHT`, то запрос ожидает только обработки записей `GET_PART`, `ATTACH_PART`, `DROP_RANGE`, `REPLACE_RANGE` и `DROP_PART`.
  Дополнительно модификатор `LIGHTWEIGHT` поддерживает необязательное предложение `FROM 'srcReplicas'`, где `'srcReplicas'` — это список имён исходных реплик, разделённых запятыми. Это расширение позволяет выполнять более целевую синхронизацию, фокусируясь только на задачах репликации, исходящих от указанных исходных реплик.
* Если указан модификатор `PULL`, то запрос получает новые записи очереди репликации из ZooKeeper, но не ожидает обработки каких-либо записей.


### SYNC DATABASE REPLICA

Ожидает, пока указанная [реплицируемая база данных](/engines/database-engines/replicated) не применит все изменения схемы из своей очереди DDL.

**Синтаксис**

```sql
SYSTEM SYNC DATABASE REPLICA имя_реплицируемой_бд;
```


### SYSTEM RESTART REPLICA

Предоставляет возможность повторно инициализировать состояние сессии ZooKeeper для таблицы `ReplicatedMergeTree`, сравнивает текущее состояние с ZooKeeper как источником истины и при необходимости добавляет задачи в очередь ZooKeeper.
Инициализация очереди репликации на основе данных ZooKeeper происходит так же, как для инструкции `ATTACH TABLE`. В течение короткого времени таблица будет недоступна для каких-либо операций.

```sql
SYSTEM RESTART REPLICA [ON CLUSTER имя_кластера] [бд.]имя_реплицируемой_таблицы_семейства_merge_tree
```


### SYSTEM RESTORE REPLICA \{#restore-replica\}

Восстанавливает реплику, если данные, возможно, присутствуют, но метаданные ZooKeeper утеряны.

Работает только для таблиц `ReplicatedMergeTree` в режиме только для чтения (readonly).

Запрос можно выполнить после:

- Утраты корня ZooKeeper `/`.
- Утраты пути реплик `/replicas`.
- Утраты пути отдельной реплики `/replicas/replica_name/`.

Реплика прикрепляет локально найденные парты и отправляет сведения о них в ZooKeeper.
Парты, присутствовавшие на реплике до потери метаданных, не перекачиваются с других реплик, если они не устарели (то есть восстановление реплики не означает повторную загрузку всех данных по сети).

:::note
Парты во всех состояниях перемещаются в каталог `detached/`. Парты, активные до потери данных (committed), прикрепляются.
:::

### SYSTEM RESTORE DATABASE REPLICA

Восстанавливает реплику, если данные, возможно, присутствуют, но метаданные ZooKeeper утрачены.

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

Альтернативный вариант синтаксиса:

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**Пример**

Создание таблицы на нескольких серверах. После того как метаданные реплики в ZooKeeper будут утеряны, таблица будет подключена в режиме только для чтения, так как метаданные отсутствуют. Последний запрос необходимо выполнить на каждой реплике.

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- потеря корневого узла.

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

Альтернативный способ:

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```


### SYSTEM RESTART REPLICAS \{#restart-replicas\}

Позволяет повторно инициализировать состояние сессий Zookeeper для всех таблиц `ReplicatedMergeTree`, сравнивает текущее состояние с Zookeeper, выступающим в качестве источника истины, и при необходимости добавляет задачи в очередь Zookeeper.

### SYSTEM DROP FILESYSTEM CACHE

Позволяет очистить кэш файловой системы.

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```


### SYSTEM SYNC FILE CACHE

:::note
Это слишком ресурсоёмкая операция и может использоваться неправильно.
:::

Выполнит системный вызов sync.

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```


### SYSTEM LOAD PRIMARY KEY

Загрузить первичные ключи для указанной таблицы или для всех таблиц.

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```


### SYSTEM UNLOAD PRIMARY KEY

Выгрузить первичные ключи для указанной таблицы или для всех таблиц.

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```


## Управление обновляемыми материализованными представлениями \{#refreshable-materialized-views\}

Команды для управления фоновыми задачами, выполняемыми для [обновляемых материализованных представлений](../../sql-reference/statements/create/view.md#refreshable-materialized-view).

При работе с ними следите за таблицей [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md).

### SYSTEM REFRESH VIEW

Выполнить немедленное внеплановое обновление указанного представления.

```sql
SYSTEM REFRESH VIEW [db.]name
```


### SYSTEM WAIT VIEW \{#wait-view\}

Ожидает завершения текущего обновления. Если обновление завершается с ошибкой, выбрасывается исключение. Если обновление не выполняется, завершается немедленно и выбрасывает исключение, если предыдущее обновление завершилось с ошибкой.

### SYSTEM STOP [REPLICATED] VIEW, STOP VIEWS

Отключает периодическое обновление указанного представления или всех обновляемых представлений. Если обновление выполняется, оно также будет отменено.

Если представление находится в реплицируемой (Replicated) или общей (Shared) базе данных, `STOP VIEW` затрагивает только текущую реплику, тогда как `STOP REPLICATED VIEW` затрагивает все реплики.

```sql
SYSTEM STOP VIEW [db.]name
```

```sql
ВИДЫ СИСТЕМНЫХ ОСТАНОВОК
```


### SYSTEM START [REPLICATED] VIEW, START VIEWS

Включает периодическое обновление для указанного представления или всех представлений, поддерживающих обновление. При этом немедленное обновление не выполняется.

Если представление находится в базе данных Replicated или Shared, `START VIEW` отменяет действие `STOP VIEW`, а `START REPLICATED VIEW` отменяет действие `STOP REPLICATED VIEW`.

```sql
SYSTEM START VIEW [db.]name
```

```sql
ВИДЫ ЗАПУСКА СИСТЕМЫ
```


### SYSTEM CANCEL VIEW

Если на текущей реплике в данный момент выполняется обновление указанного представления, оно прерывается и отменяется. В противном случае ничего не происходит.

```sql
SYSTEM CANCEL VIEW [db.]name
```


### SYSTEM WAIT VIEW

Ожидает завершения текущего обновления. Если обновление не выполняется, немедленно завершается. Если последняя попытка обновления завершилась с ошибкой, сообщает об ошибке.

Может использоваться сразу после создания нового обновляемого материализованного представления (без ключевого слова EMPTY), чтобы дождаться завершения начального обновления.

Если представление находится в базе данных Replicated или Shared и обновление выполняется на другой реплике, ожидает завершения этого обновления.

```sql
SYSTEM WAIT VIEW [db.]name
```
