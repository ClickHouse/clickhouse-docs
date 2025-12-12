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

Полностью перезагружает словарь `dictionary_name` независимо от его состояния (LOADED / NOT&#95;LOADED / FAILED).
Всегда возвращает значение `Ok.` независимо от результата обновления словаря.

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

Статус словаря можно проверить, выполнив запрос к таблице `system.dictionaries`.

```sql
SELECT name, status FROM system.dictionaries;
```


## SYSTEM RELOAD MODELS {#reload-models}

:::note
Этот оператор и `SYSTEM RELOAD MODEL` лишь выгружают модели CatBoost из clickhouse-library-bridge. Функция `catboostEvaluate()`
загружает модель при первом обращении, если она ещё не загружена.
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

Перезагружает все зарегистрированные [исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions) или одну из них из файла конфигурации.

**Синтаксис**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```


## SYSTEM RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

Повторно вычисляет все [асинхронные метрики](../../operations/system-tables/asynchronous_metrics.md). Поскольку асинхронные метрики периодически обновляются на основе настройки [asynchronous&#95;metrics&#95;update&#95;period&#95;s](../../operations/server-configuration-parameters/settings.md), их ручное обновление с помощью этого оператора, как правило, не требуется.

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```


## SYSTEM DROP DNS CACHE {#drop-dns-cache}

Очищает внутренний DNS‑кеш ClickHouse. Иногда (для старых версий ClickHouse) при изменении инфраструктуры, например при изменении IP-адреса другого сервера ClickHouse или сервера, используемого словарями, необходимо использовать эту команду.

Для более удобного (автоматического) управления кешем см. параметры `disable_internal_dns_cache`, `dns_cache_max_entries`, `dns_cache_update_period`.

## SYSTEM DROP MARK CACHE {#drop-mark-cache}

Очищает кеш меток.

## SYSTEM DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

Очищает кеш метаданных Iceberg.

## SYSTEM DROP TEXT INDEX DICTIONARY CACHE {#drop-text-index-dictionary-cache}

Очищает кеш словаря текстового индекса.

## SYSTEM DROP TEXT INDEX HEADER CACHE {#drop-text-index-header-cache}

Очищает кеш заголовков текстового индекса.

## SYSTEM DROP TEXT INDEX POSTINGS CACHE {#drop-text-index-postings-cache}

Очищает кеш списков вхождений текстового индекса.

## SYSTEM DROP TEXT INDEX CACHES {#drop-text-index-caches}

Очищает кеш заголовков текстового индекса, кеш словаря и кеш постингов.

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

&quot;Мёртвые&quot; реплики баз данных `Replicated` можно удалить с помощью следующего синтаксиса:

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

Аналогично `SYSTEM DROP REPLICA`, но удаляет путь реплики базы данных `Replicated` из Zookeeper в случае, когда отсутствует база данных, для которой можно выполнить `DROP DATABASE`. Обратите внимание, что эта команда не удаляет реплики `ReplicatedMergeTree` (поэтому вам может понадобиться также `SYSTEM DROP REPLICA`). Имена сегмента и реплики — это имена, указанные в аргументах движка `Replicated` при создании базы данных. Также эти имена можно получить из столбцов `database_shard_name` и `database_replica_name` в `system.clusters`. Если предложение `FROM SHARD` опущено, то `replica_name` должен быть полным именем реплики в формате `shard_name|replica_name`.


## SYSTEM DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

Очищает кеш несжатых данных.
Кеш несжатых данных включается или отключается с помощью настройки на уровне запроса/USER/профиля [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache).
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

Очищает кеш схем, загружаемых из [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path).

Поддерживаемые варианты:

* Protobuf: Удаляет импортированные определения сообщений Protobuf из памяти.
* Files: Удаляет локально кешированные файлы схем в [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path), которые генерируются, когда `format_schema_source` имеет значение `query`.
  Примечание: если цель не задана, очищаются оба кеша.

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf/Files]
```


## SYSTEM FLUSH LOGS {#flush-logs}

Сбрасывает буферизованные сообщения журнала в системные таблицы, например system.query&#95;log. Полезна в основном для отладки, так как большинство системных таблиц имеют интервал сброса по умолчанию 7,5 секунды.
Также создаёт системные таблицы, даже если очередь сообщений пуста.

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

Если вы не хотите сбрасывать всё сразу, вы можете сбросить один или несколько отдельных логов, передав их имя или имя целевой таблицы:

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```


## SYSTEM RELOAD CONFIG {#reload-config}

Перезагружает конфигурацию ClickHouse. Используется, когда конфигурация хранится в Zookeeper. Обратите внимание, что `SYSTEM RELOAD CONFIG` не перезагружает конфигурацию пользователей (`USER`), хранящуюся в Zookeeper; он перезагружает только конфигурацию пользователей (`USER`), которая хранится в `users.xml`. Чтобы перезагрузить всю конфигурацию пользователей (`USER`), используйте `SYSTEM RELOAD USERS`.

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD USERS {#reload-users}

Перезагружает все хранилища управления доступом, включая users.xml, локальное дисковое хранилище управления доступом и реплицируемое хранилище управления доступом (в Zookeeper).

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```


## ОСТАНОВКА СИСТЕМЫ {#shutdown}

<CloudNotSupportedBadge/>

Стандартным образом останавливает ClickHouse (как `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`)

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

Выводит переданный в качестве аргумента текст и стек вызовов при входе (`ENTRY`) или выходе (`EXIT`) из функции.

```sql
SYSTEM INSTRUMENT ADD `QueryMetricLog::startQuery` LOG ENTRY 'this is a log printed at entry'
SYSTEM INSTRUMENT ADD `QueryMetricLog::startQuery` LOG EXIT 'this is a log printed at exit'
```


#### SLEEP {#instrument-add-sleep}

Приостанавливает выполнение на фиксированное число секунд при `ENTRY` или `EXIT`:

```sql
SYSTEM INSTRUMENT ADD `QueryMetricLog::startQuery` SLEEP ENTRY 0.5
```

или для равномерно распределённого случайного интервала в секундах, задав минимум и максимум, разделённые пробелом:

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

Удаляет одну точку инструментирования командой:

```sql
SYSTEM INSTRUMENT REMOVE ID
```

все они с параметром `ALL`:

```sql
SYSTEM INSTRUMENT REMOVE ALL
```

или набор идентификаторов из подзапроса:

```sql
SYSTEM INSTRUMENT REMOVE (SELECT id FROM system.instrumentation WHERE handler = 'log')
```

Идентификатор точки инструментирования можно получить из системной таблицы [`system.instrumentation`](../../operations/system-tables/instrumentation.md).


## Управление distributed таблицами {#managing-distributed-tables}

ClickHouse может управлять [distributed](../../engines/table-engines/special/distributed.md) таблицами. Когда пользователь вставляет данные в такие таблицы, ClickHouse сначала создает очередь данных, которые должны быть отправлены на узлы кластера, после чего асинхронно отправляет их. Вы можете управлять обработкой очереди с помощью запросов [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends), [FLUSH DISTRIBUTED](#flush-distributed) и [`START DISTRIBUTED SENDS`](#start-distributed-sends). Также вы можете синхронно вставлять распределённые данные с помощью настройки [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert).

### SYSTEM STOP DISTRIBUTED SENDS {#stop-distributed-sends}

Отключает фоновое распределение данных при вставке данных в distributed таблицы.

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
Если параметр [`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica) включён (по умолчанию), данные всё равно будут вставляться в локальный сегмент.
:::


### SYSTEM FLUSH DISTRIBUTED {#flush-distributed}

Выполняет принудительную синхронную отправку данных с ClickHouse на узлы кластера. Если какие-либо узлы недоступны, ClickHouse генерирует исключение и останавливает выполнение запроса. Вы можете повторно выполнять запрос до тех пор, пока он не завершится успешно, что произойдёт, когда все узлы снова станут доступными.

Вы также можете переопределить некоторые настройки с помощью предложения `SETTINGS` — это может быть полезно для обхода временных ограничений, таких как `max_concurrent_queries_for_all_users` или `max_memory_usage`.

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
Каждый ожидающий блок хранится на диске с настройками из исходного оператора INSERT, поэтому иногда имеет смысл переопределить эти настройки.
:::


### SYSTEM START DISTRIBUTED SENDS {#start-distributed-sends}

Включает фоновое распределение при вставке данных в distributed таблицы.

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```


### SYSTEM STOP LISTEN {#stop-listen}

Закрывает сокет и корректно завершает существующие соединения с сервером на указанном порту с указанным протоколом.

Однако если соответствующие настройки протокола не были указаны в конфигурации clickhouse-server, эта команда не будет иметь никакого эффекта.

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

* Если указан модификатор `CUSTOM 'protocol'`, останавливается пользовательский протокол с указанным именем, определённый в секции `protocols` конфигурации сервера.
* Если указан модификатор `QUERIES ALL [EXCEPT .. [,..]]`, останавливаются все протоколы, если они не указаны в секции `EXCEPT`.
* Если указан модификатор `QUERIES DEFAULT [EXCEPT .. [,..]]`, останавливаются все протоколы по умолчанию, если они не указаны в секции `EXCEPT`.
* Если указан модификатор `QUERIES CUSTOM [EXCEPT .. [,..]]`, останавливаются все пользовательские протоколы, если они не указаны в секции `EXCEPT`.


### SYSTEM START LISTEN {#start-listen}

Разрешает устанавливать новые подключения по указанным протоколам.

Однако если сервер на указанном порту и протоколе не был остановлен с помощью команды SYSTEM STOP LISTEN, эта команда не будет иметь никакого эффекта.

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

Позволяет запустить фоновые слияния для таблиц семейства MergeTree:

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```


### SYSTEM STOP TTL MERGES {#stop-ttl-merges}

Позволяет остановить фоновое удаление старых данных согласно [выражению TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц семейства MergeTree:
Возвращает `Ok.` даже если таблица не существует или у неё движок, отличный от MergeTree. Возвращает ошибку, если база данных не существует:

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM START TTL MERGES {#start-ttl-merges}

Позволяет запустить фоновое удаление старых данных согласно [выражению TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) для таблиц семейства MergeTree.
Возвращает `Ok.` даже если таблица не существует. Возвращает ошибку, если база данных не существует:

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM STOP MOVES {#stop-moves}

Предоставляет возможность остановить фоновые перемещения данных согласно [TTL-выражению таблицы с предложением TO VOLUME или TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц семейства MergeTree.
Возвращает `Ok.` даже если таблица не существует. Возвращает ошибку, когда база данных не существует:

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM START MOVES {#start-moves}

Позволяет запустить фоновое перемещение данных согласно [TTL-выражению таблицы с операторами TO VOLUME и TO DISK](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) для таблиц семейства MergeTree.
Возвращает `Ok.` даже если таблица не существует. Возвращает ошибку, если база данных не существует:

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM SYSTEM UNFREEZE {#query_language-system-unfreeze}

Удаляет замороженную резервную копию с указанным именем со всех дисков. Подробнее о разморозке отдельных частей см. в [ALTER TABLE table&#95;name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition).

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```


### SYSTEM WAIT LOADING PARTS {#wait-loading-parts}

Ожидает завершения загрузки всех асинхронно загружаемых частей данных таблицы (устаревших частей данных).

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```


## Управление таблицами ReplicatedMergeTree {#managing-replicatedmergetree-tables}

ClickHouse может управлять процессами репликации в фоновом режиме в таблицах [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication).

### SYSTEM STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge />

Позволяет остановить фоновую загрузку вставленных частей для таблиц семейства `ReplicatedMergeTree`:
Всегда возвращает `Ok.` независимо от движка таблицы и даже если таблица или база данных не существует.

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START FETCHES {#start-fetches}

<CloudNotSupportedBadge />

Позволяет запустить фоновые загрузки вставленных частей для таблиц семейства `ReplicatedMergeTree`:
Всегда возвращает `Ok.` независимо от движка таблицы и даже если таблица или база данных не существует.

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

Предоставляет возможность остановить выполнение фоновых задач выборки данных из очередей репликации в ZooKeeper для таблиц семейства `ReplicatedMergeTree`. Типы возможных фоновых задач: слияния, выборки, мутации, DDL-команды с предложением ON CLUSTER:

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START REPLICATION QUEUES {#start-replication-queues}

Предоставляет возможность запускать фоновые задачи выборки из очередей репликации, которые хранятся в ZooKeeper, для таблиц семейства `ReplicatedMergeTree`. Возможные типы фоновых задач — слияния, выборки, мутации, DDL-команды с предложением ON CLUSTER:

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

Останавливает загрузку новых записей из журнала репликации в очередь репликации таблицы `ReplicatedMergeTree`.

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START PULLING REPLICATION LOG {#start-pulling-replication-log}

Отменяет действие команды `SYSTEM STOP PULLING REPLICATION LOG`.

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM SYNC REPLICA {#sync-replica}

Ожидает, пока таблица `ReplicatedMergeTree` не будет синхронизирована с другими репликами в кластере, но не дольше, чем `receive_timeout` секунд.

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

После выполнения этого оператора таблица `[db.]replicated_merge_tree_family_table_name` извлекает команды из общего реплицируемого лога в свою собственную очередь репликации, после чего оператор ожидает, пока реплика обработает все извлечённые команды. Поддерживаются следующие модификаторы:

* С `IF EXISTS` (доступно начиная с 25.6) оператор не выдаст ошибку, если таблица не существует. Это полезно при добавлении новой реплики в кластер, когда она уже является частью конфигурации кластера, но всё ещё находится в процессе создания и синхронизации таблицы.
* Если указан модификатор `STRICT`, то оператор ожидает, пока очередь репликации не станет пустой. Вариант `STRICT` может никогда не завершиться успешно, если в очередь репликации постоянно поступают новые записи.
* Если указан модификатор `LIGHTWEIGHT`, то оператор ожидает только обработки записей `GET_PART`, `ATTACH_PART`, `DROP_RANGE`, `REPLACE_RANGE` и `DROP_PART`.
  Дополнительно модификатор `LIGHTWEIGHT` поддерживает необязательное предложение `FROM 'srcReplicas'`, где `srcReplicas` — это список имён исходных реплик, разделённых запятыми. Это расширение позволяет выполнять более целевую синхронизацию, фокусируясь только на задачах репликации, исходящих от указанных исходных реплик.
* Если указан модификатор `PULL`, то оператор извлекает новые записи очереди репликации из Zookeeper, но не ожидает обработки каких-либо записей.


### SYNC DATABASE REPLICA {#sync-database-replica}

Ожидает, пока указанная [реплицируемая база данных](/engines/database-engines/replicated) применит все изменения схемы из очереди DDL этой базы данных.

**Синтаксис**

```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```


### SYSTEM RESTART REPLICA {#restart-replica}

Предоставляет возможность повторно инициализировать состояние сессии Zookeeper для таблицы `ReplicatedMergeTree`: текущее состояние будет сверено с Zookeeper как источником истины, и при необходимости в очередь Zookeeper будут добавлены задания. Инициализация очереди репликации на основе данных Zookeeper выполняется так же, как при выполнении оператора `ATTACH TABLE`. В течение короткого времени таблица будет недоступна для любых операций.

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```


### SYSTEM RESTORE REPLICA {#restore-replica}

Восстанавливает реплику, если данные (возможно) сохранены, но метаданные Zookeeper утрачены.

Работает только с таблицами `ReplicatedMergeTree` в режиме только для чтения (readonly).

Команду можно выполнить после:

- Потери корня Zookeeper `/`.
- Потери пути реплик `/replicas`.
- Потери пути отдельной реплики `/replicas/replica_name/`.

Реплика присоединяет локально найденные части и отправляет информацию о них в Zookeeper.
Части, присутствующие на реплике до потери метаданных, не запрашиваются заново с других реплик, если они не устарели (поэтому восстановление реплики не означает повторную загрузку всех данных по сети).

:::note
Части во всех состояниях перемещаются в папку `detached/`. Части, активные до потери данных (committed), присоединяются.
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

Позволяет повторно инициализировать состояние сессий Zookeeper для всех таблиц `ReplicatedMergeTree`: текущее состояние будет сопоставлено с Zookeeper как с источником истины, и при необходимости в очередь Zookeeper будут добавлены задания.

### SYSTEM DROP FILESYSTEM CACHE {#drop-filesystem-cache}

Позволяет сбросить кеш файловой системы.

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```


### SYSTEM SYNC FILE CACHE {#sync-file-cache}

:::note
Этот механизм ресурсоёмкий и может быть использован некорректно.
:::

Вызывает системный вызов sync.

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```


### SYSTEM LOAD PRIMARY KEY {#load-primary-key}

Загружает первичные ключи для заданной таблицы или для всех таблиц.

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


## Управление refreshable materialized views {#refreshable-materialized-views}

Команды для управления фоновыми задачами, выполняемыми [refreshable materialized views](../../sql-reference/statements/create/view.md#refreshable-materialized-view).

При использовании отслеживайте состояние в таблице [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md).

### SYSTEM REFRESH VIEW {#refresh-view}

Запускает немедленное внеплановое обновление указанного представления.

```sql
SYSTEM REFRESH VIEW [db.]name
```


### SYSTEM WAIT VIEW {#wait-view}

Ожидает завершения выполняющегося обновления. Если обновление завершается с ошибкой, генерирует исключение. Если обновление не выполняется, завершает работу немедленно, генерируя исключение, если предыдущее обновление завершилось с ошибкой.

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

Включает периодическое обновление для заданного представления или всех обновляемых представлений. Немедленное обновление не запускается.

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

Может использоваться сразу после создания новой refreshable materialized view (без ключевого слова EMPTY), чтобы дождаться завершения начального обновления.

Если view находится в базе данных Replicated или Shared, и обновление выполняется на другой реплике, ожидает завершения этого обновления.

```sql
SYSTEM WAIT VIEW [db.]name
```
