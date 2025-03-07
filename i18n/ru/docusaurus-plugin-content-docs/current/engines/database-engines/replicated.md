---
slug: /engines/database-engines/replicated
sidebar_position: 30
sidebar_label: Реплицированные
title: "Реплицированные"
description: "Движок основан на Atomic. Он поддерживает репликацию метаданных через DDL лог, который записывается в ZooKeeper и выполняется на всех репликах для данной базы данных."
---


# Реплицированные

Движок основан на [Atomic](../../engines/database-engines/atomic.md) движке. Он поддерживает репликацию метаданных через DDL лог, который записывается в ZooKeeper и выполняется на всех репликах для данной базы данных.

Один сервер ClickHouse может иметь несколько реплицированных баз данных, работающих и обновляющихся одновременно. Но не может быть нескольких реплик одной и той же реплицированной базы данных.

## Создание базы данных {#creating-a-database}
``` sql
CREATE DATABASE testdb ENGINE = Replicated('zoo_path', 'shard_name', 'replica_name') [SETTINGS ...]
```

**Параметры движка**

- `zoo_path` — Путь в ZooKeeper. Один и тот же путь в ZooKeeper соответствует одной и той же базе данных.
- `shard_name` — Имя шарда. Реплики базы данных группируются по шардовому имени `shard_name`.
- `replica_name` — Имя реплики. Имена реплик должны быть разными для всех реплик одного и того же шарда.

Для таблиц [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication), если аргументы не предоставлены, то используются аргументы по умолчанию: `/clickhouse/tables/{uuid}/{shard}` и `{replica}`. Их можно изменить в настройках сервера [default_replica_path](../../operations/server-configuration-parameters/settings.md#default_replica_path) и [default_replica_name](../../operations/server-configuration-parameters/settings.md#default_replica_name). Макрос `{uuid}` разворачивается в uuid таблицы, `{shard}` и `{replica}` разворачиваются в значения из конфигурации сервера, а не из аргументов движка базы данных. Однако в будущем будет возможно использовать `shard_name` и `replica_name` реплицированной базы данных.

## Специфика и рекомендации {#specifics-and-recommendations}

DDL запросы с реплицированной базой данных работают аналогично запросам [ON CLUSTER](../../sql-reference/distributed-ddl.md), но с небольшими отличиями.

Во-первых, DDL запрос старается выполнить на инициаторе (хосте, который изначально получил запрос от пользователя). Если запрос не выполнен, то пользователь немедленно получает ошибку, другие хосты не пытаются его выполнить. Если запрос успешно завершился на инициаторе, то все остальные хосты автоматически повторят попытку до тех пор, пока не завершат его. Инициатор будет пытаться дождаться завершения запроса на других хостах (не более, чем [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)) и вернёт таблицу с состояниями выполнения запроса на каждом хосте.

Поведение в случае ошибок регулируется настройкой [distributed_ddl_output_mode](../../operations/settings/settings.md#distributed_ddl_output_mode), для реплицированной базы данных лучше установить её в `null_status_on_timeout` — т.е. если некоторые хосты не успели выполнить запрос за [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout), то не выбрасывать исключение, а показывать статус `NULL` для них в таблице.

Системная таблица [system.clusters](../../operations/system-tables/clusters.md) содержит кластер, названный как реплицированная база данных, который состоит из всех реплик базы данных. Этот кластер автоматически обновляется при создании/удалении реплик и может использоваться для [Распределенных](/engines/table-engines/special/distributed) таблиц.

При создании новой реплики базы данных эта реплика самостоятельно создаёт таблицы. Если реплика была недоступна долгое время и отстала от логов репликации — она проверяет свои локальные метаданные с текущими метаданными в ZooKeeper, перемещает лишние таблицы с данными в отдельную нереплицированную базу данных (чтобы случайно не удалить что-то лишнее), создаёт отсутствующие таблицы и обновляет имена таблиц, если они были переименованы. Данные реплицируются на уровне `ReplicatedMergeTree`, т.е. если таблица не реплицируется, данные не будут реплицироваться (база данных отвечает только за метаданные).

Запросы [`ALTER TABLE FREEZE|ATTACH|FETCH|DROP|DROP DETACHED|DETACH PARTITION|PART`](../../sql-reference/statements/alter/partition.md) разрешены, но не реплицируются. Движок базы данных только добавляет/забирает/удаляет партицию/часть для текущей реплики. Тем не менее, если сама таблица использует движок реплицированной таблицы, данные будут реплицироваться после использования `ATTACH`.

В случае, если нужно только настроить кластер без поддержки репликации таблиц, обратитесь к функции [Обнаружение кластеров](../../operations/cluster-discovery.md).

## Пример использования {#usage-example}

Создание кластера с тремя хостами:

``` sql
node1 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','replica1');
node2 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','other_replica');
node3 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','{replica}');
```

Запуск DDL-запроса:

``` sql
CREATE TABLE r.rmt (n UInt64) ENGINE=ReplicatedMergeTree ORDER BY n;
```

``` text
┌─────hosts────────────┬──status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ shard1|replica1      │    0    │       │          2          │        0         │
│ shard1|other_replica │    0    │       │          1          │        0         │
│ other_shard|r1       │    0    │       │          0          │        0         │
└──────────────────────┴─────────┴───────┴─────────────────────┴──────────────────┘
```

Просмотр системной таблицы:

``` sql
SELECT cluster, shard_num, replica_num, host_name, host_address, port, is_local
FROM system.clusters WHERE cluster='r';
```

``` text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

Создание распределенной таблицы и вставка данных:

``` sql
node2 :) CREATE TABLE r.d (n UInt64) ENGINE=Distributed('r','r','rmt', n % 2);
node3 :) INSERT INTO r.d SELECT * FROM numbers(10);
node1 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

``` text
┌─hosts─┬─groupArray(n)─┐
│ node3 │  [1,3,5,7,9]  │
│ node2 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```

Добавление реплики на один хост:

``` sql
node4 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','r2');
```

Конфигурация кластера будет выглядеть так:

``` text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     1     │      2      │   node4   │  127.0.0.1   │ 9003 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

Распределенная таблица также получит данные с нового хоста:

```sql
node2 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

```text
┌─hosts─┬─groupArray(n)─┐
│ node2 │  [1,3,5,7,9]  │
│ node4 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```
