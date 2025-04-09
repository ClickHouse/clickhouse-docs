---
description: 'Документация по ATTACH'
sidebar_label: 'ATTACH'
sidebar_position: 40
slug: /sql-reference/statements/attach
title: 'Команда ATTACH'
---

Прикрепляет таблицу или словарь, например, при переносе базы данных на другой сервер.

**Синтаксис**

```sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

Запрос не создает данные на диске, а предполагает, что данные уже находятся в соответствующих местах, и просто добавляет информацию о заданной таблице, словаре или базе данных на сервер. После выполнения запроса `ATTACH` сервер будет знать о существовании таблицы, словаря или базы данных.

Если таблица была ранее отключена (запрос [DETACH](../../sql-reference/statements/detach.md)), что означает, что ее структура известна, можно использовать короткую запись без определения структуры.

## Прикрепление существующей таблицы {#attach-existing-table}

**Синтаксис**

```sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

Этот запрос используется при запуске сервера. Сервер хранит метаданные таблиц как файлы с запросами `ATTACH`, которые он просто выполняет при запуске (за исключением некоторых системных таблиц, которые явно создаются на сервере).

Если таблица была отключена навсегда, она не будет повторно подключена при запуске сервера, поэтому нужно явно использовать запрос `ATTACH`.

## Создание новой таблицы и прикрепление данных {#create-new-table-and-attach-data}

### С указанным путем к данным таблицы {#with-specified-path-to-table-data}

Запрос создает новую таблицу с указанной структурой и прикрепляет данные таблицы из указанного каталога в `user_files`.

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

Этот запрос создает новую таблицу с указанной структурой и прикрепляет данные из таблицы с заданным UUID.
Поддерживается движком базы данных [Atomic](../../engines/database-engines/atomic.md).

**Синтаксис**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```

## Прикрепление таблицы MergeTree как ReplicatedMergeTree {#attach-mergetree-table-as-replicatedmergetree}

Позволяет прикрепить не реплицированную таблицу MergeTree как ReplicatedMergeTree. Таблица ReplicatedMergeTree будет создана со значениями настроек `default_replica_path` и `default_replica_name`. Также можно прикрепить реплицированную таблицу как обычную таблицу MergeTree.

Обратите внимание, что данные таблицы в ZooKeeper не затрагиваются в этом запросе. Это означает, что вам нужно добавить метаданные в ZooKeeper с помощью `SYSTEM RESTORE REPLICA` или очистить их с помощью `SYSTEM DROP REPLICA ... FROM ZKPATH ...` после прикрепления.

Если вы пытаетесь добавить реплику к существующей таблице ReplicatedMergeTree, имейте в виду, что все локальные данные в конвертированной таблице MergeTree будут отключены.

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

**Преобразовать таблицу в не реплицированную**

Получите путь к ZooKeeper и имя реплики для таблицы:

```sql
SELECT replica_name, zookeeper_path FROM system.replicas WHERE table='test';
```
Результат:
```sql
┌─replica_name─┬─zookeeper_path─────────────────────────────────────────────┐
│ r1           │ /clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1 │
└──────────────┴────────────────────────────────────────────────────────────┘
```
Прикрепите таблицу как не реплицированную и удалите данные реплики из ZooKeeper:
```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```

## Прикрепление существующего словаря {#attach-existing-dictionary}

Прикрепляет ранее отключенный словарь.

**Синтаксис**

```sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

## Прикрепление существующей базы данных {#attach-existing-database}

Прикрепляет ранее отключенную базу данных.

**Синтаксис**

```sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```
