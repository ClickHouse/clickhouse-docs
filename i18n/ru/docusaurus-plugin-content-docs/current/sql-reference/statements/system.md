---
slug: /sql-reference/statements/system
sidebar_position: 36
sidebar_label: 'Системные'
keywords: ['системные команды', 'ClickHouse', 'запросы', 'инструменты администрирования']
description: 'Справочник системных команд ClickHouse для управления базами данных, таблицами и репликацией.'
---
```

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Системные команды

## PERезагрузить встроенные словари {#reload-embedded-dictionaries}

Перезагружает все [внутренние словари](../../sql-reference/dictionaries/index.md).
По умолчанию внутренние словари отключены.
Всегда возвращает `Ok.` независимо от результата обновления внутреннего словаря.

## PERезагрузить словари {#reload-dictionaries}

Перезагружает все словари, которые были успешно загружены ранее.
По умолчанию словари загружаются лениво (см. [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)), поэтому вместо автоматической загрузки при запуске они инициализируются при первом доступе через функцию dictGet или SELECT из таблиц с ENGINE = Dictionary. Запрос `SYSTEM RELOAD DICTIONARIES` перезагружает такие словари (ЗАГРУЖЕНЫ).
Всегда возвращает `Ok.` независимо от результата обновления словаря.

**Синтаксис**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## PERезагрузить словарь {#reload-dictionary}

Полностью перезагружает словарь `dictionary_name`, независимо от состояния словаря (ЗАГРУЖЕН / НЕ ЗАГРУЖЕН / ОШИБКА).
Всегда возвращает `Ok.` независимо от результата обновления словаря.

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

Состояние словаря можно проверить, выполнив запрос к таблице `system.dictionaries`.

```sql
SELECT name, status FROM system.dictionaries;
```

## PERезагрузить модели {#reload-models}

:::note
Эта команда и `SYSTEM RELOAD MODEL` просто выгружают модели catboost из clickhouse-library-bridge. Функция `catboostEvaluate()`
загружает модель при первом доступе, если она еще не загружена.
:::

Выгружает все модели CatBoost.

**Синтаксис**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```

## PERезагрузить модель {#reload-model}

Выгружает модель CatBoost по `model_path`.

**Синтаксис**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```

## PERезагрузить функции {#reload-functions}

Перезагружает все зарегистрированные [исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions) или одну из них из конфигурационного файла.

**Синтаксис**

```sql
RELOAD FUNCTIONS [ON CLUSTER cluster_name]
RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## PERезагрузить асинхронные метрики {#reload-asynchronous-metrics}

Переоценивает все [асинхронные метрики](../../operations/system-tables/asynchronous_metrics.md). Поскольку асинхронные метрики периодически обновляются на основе параметра [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md), вручную обновлять их с помощью этого запроса обычно не нужно.

```sql
RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## Удалить DNS кэш {#drop-dns-cache}

Очищает внутренний DNS-кэш ClickHouse. Иногда (для старых версий ClickHouse) необходимо использовать эту команду при изменении инфраструктуры (изменение IP-адреса другого сервера ClickHouse или сервера, используемого для словарей).

Для более удобного (автоматического) управления кэшем смотрите параметры disable_internal_dns_cache, dns_cache_max_entries, dns_cache_update_period.

## Удалить кэш меток {#drop-mark-cache}

Очищает кэш меток.

## Удалить реплику {#drop-replica}

Старые реплики таблиц `ReplicatedMergeTree` можно удалить с помощью следующего синтаксиса:

``` sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

Запросы удалят путь реплики `ReplicatedMergeTree` в ZooKeeper. Это полезно, когда реплика потеряна, и ее метаданные не могут быть удалены из ZooKeeper с помощью `DROP TABLE`, потому что такой таблицы больше не существует. Это удалит только неактивную/устаревшую реплику и не сможет удалить локальную реплику, пожалуйста, используйте `DROP TABLE` для этого. `DROP REPLICA` не удаляет никакие таблицы и не удаляет никаких данных или метаданных с диска.

Первый запрос удаляет метаданные реплики `'replica_name'` таблицы `database.table`.
Второй запрос делает то же самое для всех реплицируемых таблиц в базе данных.
Третий запрос делает то же самое для всех реплицируемых таблиц на локальном сервере.
Четвертый запрос полезен для удаления метаданных мертвой реплики, когда все другие реплики таблицы были удалены. Он требует явного указания пути к таблице. Он должен быть тем же путем, который был передан в первый аргумент движка `ReplicatedMergeTree` при создании таблицы.

## Удалить реплику базы данных {#drop-database-replica}

Старые реплики `Replicated` баз данных можно удалить с помощью следующего синтаксиса:

``` sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

Похож на `SYSTEM DROP REPLICA`, но удаляет путь реплики `Replicated` базы данных из ZooKeeper, когда нет базы данных для выполнения `DROP DATABASE`. Пожалуйста, обратите внимание, что он не удаляет реплики `ReplicatedMergeTree` (поэтому может понадобиться `SYSTEM DROP REPLICA` также). Имена шардов и реплик - это имена, заданные в аргументах движка `Replicated` при создании базы данных. Также эти имена можно получить из колонок `database_shard_name` и `database_replica_name` в `system.clusters`. Если отсутствует условие `FROM SHARD`, то `replica_name` должен быть полным именем реплики в формате `shard_name|replica_name`.

## Удалить кэш несжатых данных {#drop-uncompressed-cache}

Очищает кэш несжатых данных.
Кэш несжатых данных включается/выключается с помощью настройки запроса/пользователя/профиля [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache).
Его размер можно настроить с помощью настройки уровня сервера [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size).

## Удалить кэш скомпилированных выражений {#drop-compiled-expression-cache}

Очищает кэш скомпилированных выражений.
Кэш скомпилированных выражений включается/выключается с помощью настройки запроса/пользователя/профиля [`compile_expressions`](../../operations/settings/settings.md#compile_expressions).

## Удалить кэш запросов {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
````

Очищает [кэш запросов](../../operations/query-cache.md).
Если указан тег, удаляются только записи кэша запросов с указанным тегом.

## Удалить кэш схем форматов {#system-drop-schema-format}

Очищает кэш для схем, загруженных из [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path).

Поддерживаемые форматы:

- Protobuf

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]
```

## Сбросить логи {#flush-logs}

Сбрасывает буферизованные сообщения журнала в системные таблицы, например, system.query_log. Главное предназначение - отладка, поскольку у большинства системных таблиц есть интервал сброса по умолчанию 7.5 секунд.
Это также создаст системные таблицы, даже если очередь сообщений пуста.

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

Если вы не хотите сбрасывать все, вы можете сбросить один или несколько отдельных журналов, передав либо их имя, либо их целевую таблицу:

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## PERезагрузить конфигурацию {#reload-config}

Перезагружает конфигурацию ClickHouse. Используется, когда конфигурация хранится в ZooKeeper. Обратите внимание, что `SYSTEM RELOAD CONFIG` не перезагружает конфигурацию `USER`, хранящуюся в ZooKeeper, он перезагружает только конфигурацию `USER`, хранящуюся в `users.xml`.  Для перезагрузки всей конфигурации `USER` используйте `SYSTEM RELOAD USERS`

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## PERезагрузить пользователей {#reload-users}

Перезагружает все хранилища доступа, включая: users.xml, локальное хранилище доступа, реплицированное (в ZooKeeper) хранилище доступа.

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## ВЫКЛЮЧИТЬ {#shutdown}

<CloudNotSupportedBadge/>

Обычно отключает ClickHouse (как `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`)

## УБИТЬ {#kill}

Прерывает процесс ClickHouse (как `kill -9 {$ pid_clickhouse-server}`)

## Управление распределенными таблицами {#managing-distributed-tables}

ClickHouse может управлять [распределенными](../../engines/table-engines/special/distributed.md) таблицами. Когда пользователь вставляет данные в эти таблицы, ClickHouse сначала создает очередь данных, которые должны быть отправлены узлам кластера, затем асинхронно отправляет их. Вы можете управлять обработкой очереди с помощью запросов [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends), [FLUSH DISTRIBUTED](#flush-distributed) и [`START DISTRIBUTED SENDS`](#start-distributed-sends). Вы также можете синхронно вставлять распределенные данные с помощью настройки [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert).

### ОСТАНОВИТЬ РАСПРЕДЕЛЕННЫЕ ОТПРАВКИ {#stop-distributed-sends}

Отключает распределение данных в фоновом режиме при вставке данных в распределенные таблицы.

``` sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
Если включена [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) (по умолчанию), данные будут вставляться в локальный шард в любом случае.
:::

### СБРОСИТЬ РАСПРЕДЕЛЕННЫЕ {#flush-distributed}

Заставляет ClickHouse отправить данные узлам кластера синхронно. Если какие-либо узлы недоступны, ClickHouse выбрасывает исключение и останавливает выполнение запроса. Вы можете повторять запрос до тех пор, пока он не выполнится успешно, что произойдет, когда все узлы снова станут доступны.

Вы также можете переопределить некоторые настройки через оператор `SETTINGS`, это может быть полезно, чтобы избежать некоторых временных ограничений, таких как `max_concurrent_queries_for_all_users` или `max_memory_usage`.

``` sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
Каждый ожидающий блок хранится на диске с настройками из первоначального запроса INSERT, поэтому иногда вы можете захотеть переопределить настройки.
:::

### НАЧАТЬ РАСПРЕДЕЛЕННЫЕ ОТПРАВКИ {#start-distributed-sends}

Включает распределение данных в фоновом режиме при вставке данных в распределенные таблицы.

``` sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### ОСТАНОВИТЬ СЛУШАНИЕ {#stop-listen}

Закрывает сокет и корректно завершает существующие подключения к серверу на указанном порту с указанным протоколом.

Однако, если соответствующие настройки протокола не были указаны в конфигурации clickhouse-server, эта команда не будет иметь эффекта.

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- Если указан модификатор `CUSTOM 'protocol'`, будет остановлен пользовательский протокол с указанным именем, определенным в разделе протоколов конфигурации сервера.
- Если указан модификатор `QUERIES ALL [EXCEPT .. [,..]]`, все протоколы останавливаются, если не указано с помощью условия `EXCEPT`.
- Если указан модификатор `QUERIES DEFAULT [EXCEPT .. [,..]]`, останавливаются все стандартные протоколы, если не указано с помощью условия `EXCEPT`.
- Если указан модификатор `QUERIES CUSTOM [EXCEPT .. [,..]]`, останавливаются все пользовательские протоколы, если не указано с помощью условия `EXCEPT`.

### НАЧАТЬ СЛУШАНИЕ {#start-listen}

Позволяет устанавливать новые подключения по указанным протоколам.

Однако, если сервер на указанном порту и протоколе не был остановлен с помощью команды SYSTEM STOP LISTEN, эта команда не будет иметь эффекта.

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## Управление таблицами MergeTree {#managing-mergetree-tables}

ClickHouse может управлять фоновыми процессами в таблицах [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

### ОСТАНОВИТЬ СЛИЯНИЯ {#stop-merges}

<CloudNotSupportedBadge/>

Предоставляет возможность остановить фоновое слияние для таблиц в семействе MergeTree:

``` sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
`DETACH / ATTACH` таблица запустит фоновое слияние для таблицы, даже если слияния были остановлены для всех таблиц MergeTree ранее.
:::

### НАЧАТЬ СЛИЯНИЯ {#start-merges}

<CloudNotSupportedBadge/>

Предоставляет возможность запустить фоновое слияние для таблиц в семействе MergeTree:

``` sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### ОСТАНОВИТЬ СЛИЯНИЯ TTL {#stop-ttl-merges}

Предоставляет возможность остановить фоновое удаление старых данных в соответствии с [выражением TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц в семействе MergeTree:
Возвращает `Ok.` даже если таблицы не существует или у таблицы нет движка MergeTree. Возвращает ошибку, если базы данных не существует:

``` sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### НАЧАТЬ СЛИЯНИЯ TTL {#start-ttl-merges}

Предоставляет возможность запустить фоновое удаление старых данных в соответствии с [выражением TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц в семействе MergeTree:
Возвращает `Ok.` даже если таблицы не существует. Возвращает ошибку, если базы данных не существует:

``` sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### ОСТАНОВИТЬ ПЕРЕПИСКИ {#stop-moves}

Предоставляет возможность остановить фоновое перемещение данных в соответствии с [выражением TTL таблицы с TO VOLUME или TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц в семействе MergeTree:
Возвращает `Ok.` даже если таблицы не существует. Возвращает ошибку, если базы данных не существует:

``` sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### НАЧАТЬ ПЕРЕПИСКИ {#start-moves}

Предоставляет возможность запустить фоновое перемещение данных в соответствии с [выражением TTL таблицы с TO VOLUME и TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц в семействе MergeTree:
Возвращает `Ok.` даже если таблицы не существует. Возвращает ошибку, если базы данных не существует:

``` sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM UNFREEZE {#query_language-system-unfreeze}

Очищает замороженный бэкап с указанным именем со всех дисков. См. больше о размораживании отдельных частей в [ALTER TABLE table_name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)

``` sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### ЖДАТЬ ЗАГРУЖЕННЫЕ ЧАСТИ {#wait-loading-parts}

Ждет, пока все асинхронно загружаемые части данных таблицы (устаревшие части данных) не будут загружены.

``` sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## Управление таблицами ReplicatedMergeTree {#managing-replicatedmergetree-tables}

ClickHouse может управлять процессами, связанными с фоновыми репликациями в таблицах [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication).

### ОСТАНОВИТЬ ИЗВЛЕЧЕНИЯ {#stop-fetches}

<CloudNotSupportedBadge/>

Предоставляет возможность остановить фоновое извлечение вставленных частей для таблиц в семействе `ReplicatedMergeTree`:
Всегда возвращает `Ok.` независимо от движка таблицы и даже если таблицы или базы данных не существуют.

``` sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### НАЧАТЬ ИЗВЛЕЧЕНИЯ {#start-fetches}

<CloudNotSupportedBadge/>

Предоставляет возможность запустить фоновое извлечение вставленных частей для таблиц в семействе `ReplicatedMergeTree`:
Всегда возвращает `Ok.` независимо от движка таблицы и даже если таблицы или базы данных не существуют.

``` sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### ОСТАНОВИТЬ РАСПРЕДЕЛЕННЫЕ ОТПРАВКИ {#stop-replicated-sends}

Предоставляет возможность остановить фоновую отправку другим репликам в кластере для новых вставленных частей для таблиц в семействе `ReplicatedMergeTree`:

``` sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### НАЧАТЬ РАСПРЕДЕЛЕННЫЕ ОТПРАВКИ {#start-replicated-sends}

Предоставляет возможность запустить фоновую отправку другим репликам в кластер для новых вставленных частей для таблиц в семействе `ReplicatedMergeTree`:

``` sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### ОСТАНОВИТЬ ОЧЕРЕДИ РЕПЛИКАЦИИ {#stop-replication-queues}

Предоставляет возможность остановить фоновые извлечение задач из очередей репликации, хранящихся в ZooKeeper для таблиц в семействе `ReplicatedMergeTree`. Возможные типы фоновых задач - слияния, извлечения, мутации, операторы DDL с клаузой ON CLUSTER:

``` sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### НАЧАТЬ ОЧЕРЕДИ РЕПЛИКАЦИИ {#start-replication-queues}

Предоставляет возможность запустить фоновые извлечения задач из очередей репликации, хранящихся в ZooKeeper для таблиц в семействе `ReplicatedMergeTree`. Возможные типы фоновых задач - слияния, извлечения, мутации, операторы DDL с клаузой ON CLUSTER:

``` sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### ОСТАНОВИТЬ ЗАГРУЗКУ ЖУРНАЛА РЕПЛИКАЦИИ {#stop-pulling-replication-log}

Останавливает загрузку новых записей из журнала репликации в очередь репликации в таблице `ReplicatedMergeTree`.

``` sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### НАЧАТЬ ЗАГРУЗКУ ЖУРНАЛА РЕПЛИКАЦИИ {#start-pulling-replication-log}

Отменяет `SYSTEM STOP PULLING REPLICATION LOG`.

``` sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### СИНХРОНИЗИРОВАТЬ РЕПЛИКУ {#sync-replica}

Ждет, пока таблица `ReplicatedMergeTree` не будет синхронизирована с другими репликами в кластере, но не более чем `receive_timeout` секунд.

``` sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

После выполнения этого запроса таблица `[db.]replicated_merge_tree_family_table_name` извлекает команды из общего журнала репликаций в свою очередь репликаций, и затем запрос ждет, пока реплика обработает все извлеченные команды. Поддерживаются следующие модификаторы:

 - Если был указан модификатор `STRICT`, то запрос ждет, пока очередь репликаций не станет пустой. Версия `STRICT` может никогда не завершиться успешно, если в очереди репликаций постоянно появляются новые записи.
 - Если был указан модификатор `LIGHTWEIGHT`, то запрос ждет лишь обработки записей `GET_PART`, `ATTACH_PART`, `DROP_RANGE`, `REPLACE_RANGE` и `DROP_PART`.
   Дополнительно модификатор LIGHTWEIGHT поддерживает необязательную клаузу FROM 'srcReplicas', где 'srcReplicas' - это список имен исходных реплик, разделенных запятыми. Это расширение позволяет более целенаправленно синхронизироваться, сосредоточив внимание только на задачах репликации, исходящих от указанных исходных реплик.
 - Если был указан модификатор `PULL`, то запрос извлекает новые записи из очереди репликаций из ZooKeeper, но не ждет обработки.

### СИНХРОНИЗИРОВАТЬ РЕПЛИКУ БАЗЫ ДАННЫХ {#sync-database-replica}

Ждет, пока указанная [реплицированная база данных](/engines/database-engines/replicated) применит все изменения схемы из очереди DDL этой базы данных.

**Синтаксис**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### ПЕРЕЗАПУСТИТЬ РЕПЛИКУ {#restart-replica}

Предоставляет возможность повторной инициализации состояния сессии ZooKeeper для таблицы `ReplicatedMergeTree`, будет сравнивать текущее состояние с ZooKeeper как источником правды и при необходимости добавит задачи в очередь ZooKeeper.
Инициализация очереди репликаций на основе данных ZooKeeper происходит так же, как и для оператора `ATTACH TABLE`. На короткое время таблица будет недоступна для любых операций.

``` sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### ВОССТАНОВИТЬ РЕПЛИКУ {#restore-replica}

Восстанавливает реплику, если данные [возможно] присутствуют, но метаданные ZooKeeper потеряны.

Работает только на таблицах `ReplicatedMergeTree` с режимом только для чтения.

Один может выполнить запрос после:

  - потери корневого каталога ZooKeeper `/`.
  - потери пути к репликам `/replicas`.
  - потери индивидуального пути к реплике `/replicas/replica_name/`.

Реплика прикрепляет локально найденные части и отправляет информацию о них в ZooKeeper.
Части, присутствующие на реплике до потери метаданных, не будут повторно загружены из других, если не устарели (поэтому восстановление реплики не означает повторную загрузку всех данных по сети).

:::note
Части во всех состояниях перемещаются в папку `detached/`. Части, активные до потери данных (проверенные), прикрепляются.
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

Создание таблицы на нескольких серверах. После потери метаданных реплики в ZooKeeper таблица будет прикреплена как только для чтения, так как метаданные отсутствуют. Последний запрос необходимо выполнить на каждой реплике.

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

### ПЕРЕЗАПУСТИТЬ РЕПЛИКИ {#restart-replicas}

Предоставляет возможность повторной инициализации состояния сессий ZooKeeper для всех таблиц `ReplicatedMergeTree`, будет сравнивать текущее состояние с ZooKeeper как источником правды и при необходимости добавит задачи в очередь ZooKeeper.

### УДАЛИТЬ КЭШ ФАЙЛОВОЙ СИСТЕМЫ {#drop-filesystem-cache}

Позволяет удалить кэш файловой системы.

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### СИНХРОНИЗИРОВАТЬ КЭШ ФАЙЛОВ {#sync-file-cache}

:::note
Это слишком тяжелая операция и может быть использована неправильно.
:::

Сделает системный вызов синхронизации.

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```

### ЗАГРУЗИТЬ ПЕРВИЧНЫЙ КЛЮЧ {#load-primary-key}

Загружает первичные ключи для указанной таблицы или для всех таблиц.

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```

### ВЫГРУЗИТЬ ПЕРВИЧНЫЙ КЛЮЧ {#unload-primary-key}

Выгружает первичные ключи для указанной таблицы или для всех таблиц.

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```

## Управление обновляемыми материализованными представлениями {#refreshable-materialized-views}

Команды для управления фоновыми задачами, выполняемыми [обновляемыми материализованными представлениями](../../sql-reference/statements/create/view.md#refreshable-materialized-view)

Следите за [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md), пока используете их.

### ОБНОВИТЬ ПРЕДСТАВЛЕНИЕ {#refresh-view}

Запускает немедленное обновление расписания заданного представления.

```sql
SYSTEM REFRESH VIEW [db.]name
```

### ОБНОВИТЬ ПРЕДСТАВЛЕНИЕ {#refresh-view-1}

Ждет, пока текущее обновление не завершится. Если обновление завершится с ошибкой, выбрасывает исключение. Если обновление не выполняется, завершается немедленно, выбрасывая исключение, если предыдущее обновление завершилось с ошибкой.

### ОСТАНОВИТЬ ПРЕДСТАВЛЕНИЕ, ОСТАНОВИТЬ ПРЕДСТАВЛЕНИЯ {#stop-view-stop-views}

Отключает периодическое обновление заданного представления или всех обновляемых представлений. Если обновление выполняется, отменяет его также.

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### НАЧАТЬ ПРЕДСТАВЛЕНИЕ, НАЧАТЬ ПРЕДСТАВЛЕНИЯ {#start-view-start-views}

Включает периодическое обновление заданного представления или всех обновляемых представлений. Немедленное обновление не вызвано.

```sql
SYSTEM START VIEW [db.]name
```
```sql
SYSTEM START VIEWS
```

### ОТМЕНИТЬ ПРЕДСТАВЛЕНИЕ {#cancel-view}

Если обновление выполняется для заданного представления, прерывает и отменяет его. В противном случае ничего не делать.

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

Ждет завершения текущего обновления. Если обновление не выполняется, возвращает немедленно. Если последняя попытка обновления завершилась с ошибкой, сообщает об ошибке.

Может использоваться сразу после создания нового обновляемого материализованного представления (без ключевого слова EMPTY), чтобы дождаться завершения первоначального обновления.

```sql
SYSTEM WAIT VIEW [db.]name
```  

