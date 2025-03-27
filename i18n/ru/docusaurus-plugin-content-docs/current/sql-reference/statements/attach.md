---
description: 'Документация для ATTACH'
sidebar_label: 'ATTACH'
sidebar_position: 40
slug: /sql-reference/statements/attach
title: 'Заявление ATTACH'
---

Прикрепляет таблицу или словарь, например, при перемещении базы данных на другой сервер.

**Синтаксис**

```sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

Запрос не создает данные на диске, а предполагает, что данные уже находятся в соответствующих местах, и просто добавляет информацию о указанной таблице, словаре или базе данных на сервер. После выполнения запроса `ATTACH` сервер будет знать о существовании таблицы, словаря или базы данных.

Если таблица ранее была отсоединена (запрос [DETACH](../../sql-reference/statements/detach.md)), то есть ее структура известна, можно использовать короткую запись без определения структуры.

## Прикрепить существующую таблицу {#attach-existing-table}

**Синтаксис**

```sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

Этот запрос используется при запуске сервера. Сервер хранит метаданные таблицы как файлы с запросами `ATTACH`, которые он просто выполняет при запуске (за исключением некоторых системных таблиц, которые создаются явно на сервере).

Если таблица была отсоединена навсегда, она не будет повторно прикреплена при запуске сервера, поэтому необходимо явно использовать запрос `ATTACH`.

## Создать новую таблицу и прикрепить данные {#create-new-table-and-attach-data}

### С указанным путем к данным таблицы {#with-specified-path-to-table-data}

Запрос создает новую таблицу с заданной структурой и прикрепляет данные таблицы из указанного каталога в `user_files`.

**Синтаксис**

```sql
ATTACH TABLE name FROM 'path/to/data/' (col1 Type1, ...)
```

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS test;
INSERT INTO TABLE FUNCTION file('01188_attach/test/data.TSV', 'TSV', 's String, n UInt8') VALUES ('test', 42);
ATTACH TABLE test FROM '01188_attach/test' (s String, n UInt8) ENGINE = File(TSV);
SELECT * FROM test;
```
Результат:

```sql
┌─s────┬──n─┐
│ test │ 42 │
└──────┴────┘
```

### С указанным UUID таблицы {#with-specified-table-uuid}

Этот запрос создает новую таблицу с заданной структурой и прикрепляет данные из таблицы с указанным UUID. Это поддерживается движком баз данных [Atomic](../../engines/database-engines/atomic.md).

**Синтаксис**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```

## Прикрепить таблицу MergeTree как ReplicatedMergeTree {#attach-mergetree-table-as-replicatedmergetree}

Позволяет прикрепить неповторяющуюся таблицу MergeTree как ReplicatedMergeTree. Таблица ReplicatedMergeTree будет создана с значениями настроек `default_replica_path` и `default_replica_name`. Также возможно прикрепить реплицированную таблицу как обычный MergeTree.

Обратите внимание, что данные таблицы в ZooKeeper не изменяются в этом запросе. Это означает, что вы должны добавить метаданные в ZooKeeper, используя `SYSTEM RESTORE REPLICA`, или очистить их с помощью `SYSTEM DROP REPLICA ... FROM ZKPATH ...` после прикрепления.

Если вы пытаетесь добавить реплику к существующей таблице ReplicatedMergeTree, имейте в виду, что все локальные данные в преобразованной таблице MergeTree будут отсоединены.

**Синтаксис**

```sql
ATTACH TABLE [db.]name AS [NOT] REPLICATED
```

**Преобразовать таблицу в реплицированную**

```sql
DETACH TABLE test;
ATTACH TABLE test AS REPLICATED;
SYSTEM RESTORE REPLICA test;
```

**Преобразовать таблицу в нереплицированную**

Получить путь ZooKeeper и имя реплики для таблицы:

```sql
SELECT replica_name, zookeeper_path FROM system.replicas WHERE table='test';
```
Результат:
```sql
┌─replica_name─┬─zookeeper_path─────────────────────────────────────────────┐
│ r1           │ /clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1 │
└──────────────┴────────────────────────────────────────────────────────────┘
```
Прикрепить таблицу как нереплицированную и удалить данные реплики из ZooKeeper:
```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```

## Прикрепить существующий словарь {#attach-existing-dictionary}

Прикрепляет ранее отсоединенный словарь.

**Синтаксис**

```sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

## Прикрепить существующую базу данных {#attach-existing-database}

Прикрепляет ранее отсоединенную базу данных.

**Синтаксис**

```sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```
