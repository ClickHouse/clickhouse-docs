---
description: 'Движок основан на движке Atomic. Он поддерживает репликацию метаданных
  посредством DDL-журнала, который записывается в ZooKeeper и исполняется на всех репликах
  данной базы данных.'
sidebar_label: 'Replicated'
sidebar_position: 30
slug: /engines/database-engines/replicated
title: 'Replicated'
doc_type: 'reference'
---



# Replicated

Движок основан на движке [Atomic](../../engines/database-engines/atomic.md). Он поддерживает репликацию метаданных по журналу DDL, который записывается в ZooKeeper и выполняется на всех репликах заданной базы данных.

Один сервер ClickHouse может одновременно запускать и обновлять несколько реплицируемых баз данных. Однако для одной и той же реплицируемой базы данных не может существовать несколько реплик.



## Создание базы данных

```sql
CREATE DATABASE testdb [UUID '...'] ENGINE = Replicated('zoo_path', 'shard_name', 'replica_name') [SETTINGS ...]
```

**Параметры движка**

* `zoo_path` — путь в ZooKeeper. Один и тот же путь в ZooKeeper соответствует одной базе данных.
* `shard_name` — имя шарда. Реплики базы данных группируются в шарды по `shard_name`.
* `replica_name` — имя реплики. Имена реплик должны отличаться для всех реплик одного и того же шарда.

Параметры можно опустить, в этом случае отсутствующие параметры будут подставлены по умолчанию.

Если `zoo_path` содержит макрос `{uuid}`, необходимо указать явный UUID или добавить [ON CLUSTER](../../sql-reference/distributed-ddl.md) к оператору CREATE, чтобы гарантировать, что все реплики используют один и тот же UUID для этой базы данных.

Для таблиц [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication), если аргументы не заданы, используются значения по умолчанию: `/clickhouse/tables/{uuid}/{shard}` и `{replica}`. Их можно изменить в настройках сервера [default&#95;replica&#95;path](../../operations/server-configuration-parameters/settings.md#default_replica_path) и [default&#95;replica&#95;name](../../operations/server-configuration-parameters/settings.md#default_replica_name). Макрос `{uuid}` раскрывается в UUID таблицы, `{shard}` и `{replica}` раскрываются в значения из конфигурации сервера, а не из аргументов движка базы данных. В будущем можно будет использовать `shard_name` и `replica_name` реплицируемой базы данных.


## Особенности и рекомендации {#specifics-and-recommendations}

DDL-запросы с базой данных `Replicated` работают аналогично запросам [ON CLUSTER](../../sql-reference/distributed-ddl.md), но с небольшими отличиями.

Сначала DDL-запрос пытается выполниться на инициаторе (хосте, который изначально получил запрос от пользователя). Если запрос не был выполнен, пользователь сразу получает ошибку, другие хосты не пытаются его выполнить. Если запрос был успешно выполнен на инициаторе, то все остальные хосты будут автоматически повторять попытки до тех пор, пока не завершат его выполнение. Инициатор будет пытаться дождаться завершения запроса на других хостах (не дольше чем [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)) и вернёт таблицу со статусами выполнения запроса на каждом хосте.

Поведение в случае ошибок регулируется настройкой [distributed_ddl_output_mode](../../operations/settings/settings.md#distributed_ddl_output_mode), для базы данных `Replicated` лучше установить её в значение `null_status_on_timeout` — т. е. если какие-то хосты не успели выполнить запрос за время [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout), то не выбрасывать исключение, а показать статус `NULL` для них в таблице.

Системная таблица [system.clusters](../../operations/system-tables/clusters.md) содержит кластер с именем, совпадающим с именем реплицируемой базы данных, который состоит из всех реплик этой базы данных. Этот кластер автоматически обновляется при создании/удалении реплик и может использоваться для таблиц [Distributed](/engines/table-engines/special/distributed).

При создании новой реплики базы данных эта реплика создаёт таблицы самостоятельно. Если реплика была недоступна долгое время и отстала от журнала репликации, она сверяет свои локальные метаданные с текущими метаданными в ZooKeeper, перемещает лишние таблицы с данными в отдельную нереплицируемую базу данных (чтобы не удалить что-либо лишнее по ошибке), создаёт недостающие таблицы, обновляет имена таблиц, если они были переименованы. Данные реплицируются на уровне `ReplicatedMergeTree`, т. е. если таблица не является реплицируемой, данные реплицироваться не будут (база данных отвечает только за метаданные).

Запросы [`ALTER TABLE FREEZE|ATTACH|FETCH|DROP|DROP DETACHED|DETACH PARTITION|PART`](../../sql-reference/statements/alter/partition.md) разрешены, но не реплицируются. Движок базы данных будет добавлять/получать/удалять раздел/часть только на текущей реплике. Однако, если сама таблица использует реплицируемый движок таблицы, то данные будут реплицированы после использования `ATTACH`.

Если вам необходимо только настроить кластер без поддержки репликации таблиц, воспользуйтесь функцией [Cluster Discovery](../../operations/cluster-discovery.md).



## Пример использования

Создание кластера с тремя хостами:

```sql
node1 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','replica1');
node2 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','other_replica');
node3 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','{replica}');
```

Создание базы данных на кластере с неявно заданными параметрами:

```sql
CREATE DATABASE r ON CLUSTER default ENGINE=Replicated;
```

Выполнение DDL-запроса:

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

Просмотр системной таблицы:

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

Создание распределённой таблицы и вставка данных:

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

Добавление реплики на дополнительном хосте:

```sql
node4 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','r2');
```

Добавление реплики на дополнительном хосте, если макрос `{uuid}` используется в `zoo_path`:

```sql
node1 :) SELECT uuid FROM system.databases WHERE database='r';
node4 :) CREATE DATABASE r UUID '<uuid из предыдущего запроса>' ENGINE=Replicated('some/path/{uuid}','other_shard','r2');
```

Конфигурация кластера будет выглядеть следующим образом:


```text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     1     │      2      │   node4   │  127.0.0.1   │ 9003 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

Распределённая таблица также будет получать данные от нового хоста:

```sql
node2 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

```text
┌─hosts─┬─groupArray(n)─┐
│ node2 │  [1,3,5,7,9]  │
│ node4 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```


## Параметры

Поддерживаются следующие параметры:

| Setting                                                                      | Default                        | Description                                                                                                                                                                 |
| ---------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `max_broken_tables_ratio`                                                    | 1                              | Не восстанавливать реплику автоматически, если отношение числа повреждённых таблиц к общему числу таблиц больше заданного значения                                          |
| `max_replication_lag_to_enqueue`                                             | 50                             | Реплика будет генерировать исключение при попытке выполнить запрос, если её лаг репликации больше заданного значения                                                        |
| `wait_entry_commited_timeout_sec`                                            | 3600                           | Реплики попытаются отменить запрос, если истёк таймаут, но инициирующий хост ещё не выполнил его                                                                            |
| `collection_name`                                                            |                                | Имя коллекции, определённой в конфигурации сервера, в которой задана вся информация для аутентификации в кластере                                                           |
| `check_consistency`                                                          | true                           | Проверять согласованность локальных метаданных и метаданных в Keeper, выполнять восстановление реплики при обнаружении несогласованности                                    |
| `max_retries_before_automatic_recovery`                                      | 10                             | Максимальное число попыток выполнить запись в очереди перед пометкой реплики как потерянной и её восстановлением из снимка (0 означает неограниченное число попыток)        |
| `allow_skipping_old_temporary_tables_ddls_of_refreshable_materialized_views` | false                          | Если включено, при обработке DDL в реплицируемых базах данных по возможности пропускается создание и обмен DDL временных таблиц обновляемых материализованных представлений |
| `logs_to_keep`                                                               | 1000                           | Количество записей журнала по умолчанию, которое нужно хранить в ZooKeeper для реплицируемой базы данных.                                                                   |
| `default_replica_path`                                                       | `/clickhouse/databases/{uuid}` | Путь к базе данных в ZooKeeper. Используется при создании базы данных, если аргументы опущены.                                                                              |
| `default_replica_shard_name`                                                 | `{shard}`                      | Имя шарда реплики в базе данных. Используется при создании базы данных, если аргументы опущены.                                                                             |
| `default_replica_name`                                                       | `{replica}`                    | Имя реплики в базе данных. Используется при создании базы данных, если аргументы опущены.                                                                                   |

Значения по умолчанию могут быть переопределены в конфигурационном файле.

```xml
<clickhouse>
    <database_replicated>
        <max_broken_tables_ratio>0.75</max_broken_tables_ratio>
        <max_replication_lag_to_enqueue>100</max_replication_lag_to_enqueue>
        <wait_entry_commited_timeout_sec>1800</wait_entry_commited_timeout_sec>
        <collection_name>postgres1</collection_name>
        <check_consistency>false</check_consistency>
        <max_retries_before_automatic_recovery>5</max_retries_before_automatic_recovery>
        <default_replica_path>/clickhouse/databases/{uuid}</default_replica_path>
        <default_replica_shard_name>{shard}</default_replica_shard_name>
        <default_replica_name>{replica}</default_replica_name>
    </database_replicated>
</clickhouse>
```
