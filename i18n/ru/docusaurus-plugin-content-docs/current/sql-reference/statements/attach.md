---
slug: '/sql-reference/statements/attach'
sidebar_label: ATTACH
sidebar_position: 40
description: 'Документация для Attach'
title: 'Команда ATTACH'
doc_type: reference
---
Прикрепляет таблицу или словарь, например, при переносе базы данных на другой сервер.

**Синтаксис**

```sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

Запрос не создает данные на диске, но предполагает, что данные уже находятся в соответствующих местах, и просто добавляет информацию о указанной таблице, словаре или базе данных на сервер. После выполнения запроса `ATTACH` сервер будет знать о существовании таблицы, словаря или базы данных.

Если таблица была ранее отсоединена (запрос [DETACH](../../sql-reference/statements/detach.md)), то есть ее структура известна, вы можете использовать сокращенную версию без определения структуры.

## Прикрепить Существующую Таблицу {#attach-existing-table}

**Синтаксис**

```sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

Этот запрос используется при запуске сервера. Сервер хранит метаданные таблиц как файлы с запросами `ATTACH`, которые он просто выполняет при запуске (за исключением некоторых системных таблиц, которые создаются явно на сервере).

Если таблица была отсоединена навсегда, она не будет повторно прикреплена при старте сервера, поэтому необходимо использовать запрос `ATTACH` явно.

## Создать Новую Таблицу И Прикрепить Данные {#create-new-table-and-attach-data}

### С Указанным Путем К Данных Таблицы {#with-specified-path-to-table-data}

Запрос создает новую таблицу с указанной структурой и прикрепляет данные таблицы из предоставленной директории в `user_files`.

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

### С Указанным UUID Таблицы {#with-specified-table-uuid}

Этот запрос создает новую таблицу с указанной структурой и прикрепляет данные из таблицы с указанным UUID.
Он поддерживается движком баз данных [Atomic](../../engines/database-engines/atomic.md).

**Синтаксис**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```

## Прикрепить Таблицу MergeTree Как ReplicatedMergeTree {#attach-mergetree-table-as-replicatedmergetree}

Позволяет прикрепить нереплицированную таблицу MergeTree как ReplicatedMergeTree. Таблица ReplicatedMergeTree будет создана с значениями настроек `default_replica_path` и `default_replica_name`. Также возможно прикрепить реплицированную таблицу как обычный MergeTree.

Обратите внимание, что данные таблицы в ZooKeeper не затрагиваются в этом запросе. Это означает, что вам нужно будет добавить метаданные в ZooKeeper с помощью `SYSTEM RESTORE REPLICA` или очистить их с помощью `SYSTEM DROP REPLICA ... FROM ZKPATH ...` после прикрепления.

Если вы пытаетесь добавить реплику к существующей таблице ReplicatedMergeTree, имейте в виду, что все локальные данные в преобразованной таблице MergeTree будут отсоединены.

**Синтаксис**

```sql
ATTACH TABLE [db.]name AS [NOT] REPLICATED
```

**Преобразование таблицы в реплицированную**

```sql
DETACH TABLE test;
ATTACH TABLE test AS REPLICATED;
SYSTEM RESTORE REPLICA test;
```

**Преобразование таблицы в нереплицированную**

Получите путь ZooKeeper и имя реплики для таблицы:

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

## Прикрепить Существующий Словарь {#attach-existing-dictionary}

Прикрепляет ранее отсоединенный словарь.

**Синтаксис**

```sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

## Прикрепить Существующую Базу Данных {#attach-existing-database}

Прикрепляет ранее отсоединенную базу данных.

**Синтаксис**

```sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```