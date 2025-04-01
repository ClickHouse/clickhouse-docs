---
description: 'Движок основан на атомарном движке. Он поддерживает репликацию метаданных через DDL-журнал, записываемый в ZooKeeper и выполняемый на всех репликах для данной базы данных.'
sidebar_label: 'Реплицированный'
sidebar_position: 30
slug: /engines/database-engines/replicated
title: 'Реплицированный'
---


# Реплицированный

Движок основан на [атомарном](../../engines/database-engines/atomic.md) движке. Он поддерживает репликацию метаданных через DDL-журнал, записываемый в ZooKeeper и выполняемый на всех репликах для данной базы данных.

Один сервер ClickHouse может иметь несколько реплицированных баз данных, работающих и обновляющихся одновременно. Но не может быть нескольких реплик одной и той же реплицированной базы данных.

## Создание базы данных {#creating-a-database}
```sql
CREATE DATABASE testdb ENGINE = Replicated('zoo_path', 'shard_name', 'replica_name') [SETTINGS ...]
```

**Параметры движка**

- `zoo_path` — путь в ZooKeeper. Один и тот же путь в ZooKeeper соответствует одной и той же базе данных.
- `shard_name` — имя шарда. Реплики базы данных сгруппированы в шард по `shard_name`.
- `replica_name` — имя реплики. Имена реплик должны быть разными для всех реплик одного и того же шарда.

Для таблиц [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) при отсутствии аргументов используются значения по умолчанию: `/clickhouse/tables/{uuid}/{shard}` и `{replica}`. Эти параметры можно изменить в настройках сервера [default_replica_path](../../operations/server-configuration-parameters/settings.md#default_replica_path) и [default_replica_name](../../operations/server-configuration-parameters/settings.md#default_replica_name). Макрос `{uuid}` разворачивается в uuid таблицы, `{shard}` и `{replica}` — в значения из конфигурации сервера, а не из аргументов движка базы данных. Однако в будущем будет возможным использовать `shard_name` и `replica_name` реплицированной базы данных.

## Особенности и рекомендации {#specifics-and-recommendations}

Запросы DDL с реплицированной базой данных работают аналогично запросам [ON CLUSTER](../../sql-reference/distributed-ddl.md), но с небольшими отличиями.

Сначала DDL-запрос старается выполнить свой на инициаторе (хосте, который изначально получил запрос от пользователя). Если запрос не выполнен, пользователь сразу получает ошибку, другие хосты не пытаются его выполнить. Если запрос был успешно выполнен на инициаторе, то все остальные хосты автоматически повторяют попытку, пока не завершат его. Инициатор будет стараться дождаться завершения запроса на других хостах (не дольше [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)) и вернет таблицу со статусами выполнения запроса на каждом хосте.

Поведение в случае ошибок регулируется настройкой [distributed_ddl_output_mode](../../operations/settings/settings.md#distributed_ddl_output_mode). Для реплицированной базы данных лучше установить значение `null_status_on_timeout` — т.е. если некоторым хостам не удалось выполнить запрос за [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout), то нужно не выдавать исключение, а показывать статус `NULL` для них в таблице.

Системная таблица [system.clusters](../../operations/system-tables/clusters.md) содержит кластер с именем, аналогичным имени реплицированной базы данных, который состоит из всех реплик базы данных. Этот кластер обновляется автоматически при создании/удалении реплик и может быть использован для таблиц [Distributed](/engines/table-engines/special/distributed).

При создании новой реплики базы данных эта реплика создает таблицы самостоятельно. Если реплика была недоступна длительное время и отстала от журнала репликации, она проверяет свои локальные метаданные с текущими метаданными в ZooKeeper, перемещает лишние таблицы с данными в отдельную непереплицированную базу данных (чтобы случайно не удалить ничего излишнего), создает отсутствующие таблицы, обновляет имена таблиц, если они были переименованы. Данные реплицируются на уровне `ReplicatedMergeTree`, т.е. если таблица не реплицирована, данные не будут реплицированы (база данных отвечает только за метаданные).

Запросы [`ALTER TABLE FREEZE|ATTACH|FETCH|DROP|DROP DETACHED|DETACH PARTITION|PART`](../../sql-reference/statements/alter/partition.md) разрешены, но не реплицируются. Движок базы данных будет только добавлять/извлекать/удалять партицию/часть в текущую реплику. Однако если сама таблица использует движок реплицированной таблицы, то данные будут реплицированы после использования `ATTACH`.

Если вам нужно только настроить кластер без обслуживания репликации таблиц, обратитесь к функции [Cluster Discovery](../../operations/cluster-discovery.md).

## Пример использования {#usage-example}

Создание кластера с тремя хостами:

```sql
node1 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','replica1');
node2 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','other_replica');
node3 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','{replica}');
```

Запуск DDL-запроса:

```sql
CREATE TABLE r.rmt (n UInt64) ENGINE=ReplicatedMergeTree ORDER BY n;
```

```text
┌─────hosts────────────┬──status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ shard1|replica1      │    0    │       │          2          │        0         │
│ shard1|other_replica │    0    │       │          1          │        0         │
│ other_shard|r1       │    0    │       │          0          │        0         │
└──────────────────────┴─────────┴───────┴─────────────────────┴──────────────────┘
```

Отображение системной таблицы:

```sql
SELECT cluster, shard_num, replica_num, host_name, host_address, port, is_local
FROM system.clusters WHERE cluster='r';
```

```text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

Создание распределенной таблицы и вставка данных:

```sql
node2 :) CREATE TABLE r.d (n UInt64) ENGINE=Distributed('r','r','rmt', n % 2);
node3 :) INSERT INTO r.d SELECT * FROM numbers(10);
node1 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

```text
┌─hosts─┬─groupArray(n)─┐
│ node3 │  [1,3,5,7,9]  │
│ node2 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```

Добавление реплики на одном из хостов:

```sql
node4 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','r2');
```

Конфигурация кластера будет выглядеть так:

```text
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
