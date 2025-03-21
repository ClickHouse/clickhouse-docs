---
slug: /sql-reference/statements/attach
sidebar_position: 40
sidebar_label: ATTACH
title: "Оператор ATTACH"
---

Присоединяет таблицу или словарь, например, при переносе базы данных на другой сервер.

**Синтаксис**

``` sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

Запрос не создает данные на диске, а предполагает, что данные уже находятся в соответствующих местах, и просто добавляет информацию о указанной таблице, словаре или базе данных на сервер. После выполнения запроса `ATTACH` сервер будет знать о существовании таблицы, словаря или базы данных.

Если таблица была ранее отсоединена (запрос [DETACH](../../sql-reference/statements/detach.md)), что означает, что ее структура известна, вы можете использовать сокращенную запись без определения структуры.

## Присоединение Существующей Таблицы {#attach-existing-table}

**Синтаксис**

``` sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

Этот запрос используется при старте сервера. Сервер хранит метаданные таблицы в виде файлов с запросами `ATTACH`, которые он просто выполняет при запуске (за исключением некоторых системных таблиц, которые создаются явно на сервере).

Если таблица была отсоединена навсегда, она не будет повторно присоединена при запуске сервера, поэтому вам нужно явно использовать запрос `ATTACH`.

## Создание Новой Таблицы И Присоединение Данных {#create-new-table-and-attach-data}

### С Указанным Путем К Данные Таблицы {#with-specified-path-to-table-data}

Запрос создает новую таблицу с предоставленной структурой и присоединяет данные таблицы из указанного каталога в `user_files`.

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

Этот запрос создает новую таблицу с предоставленной структурой и присоединяет данные из таблицы с указанным UUID. Это поддерживается движком базы данных [Atomic](../../engines/database-engines/atomic.md).

**Синтаксис**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```

## Присоединение Таблицы MergeTree Как ReplicatedMergeTree {#attach-mergetree-table-as-replicatedmergetree}

Позволяет присоединить не реплицированную таблицу MergeTree как ReplicatedMergeTree. Таблица ReplicatedMergeTree будет создана со значениями настроек `default_replica_path` и `default_replica_name`. Также возможно присоединение реплицированной таблицы как обычной MergeTree.

Обратите внимание, что данные таблицы в ZooKeeper не затрагиваются в этом запросе. Это означает, что вам нужно добавить метаданные в ZooKeeper, используя `SYSTEM RESTORE REPLICA`, или удалить их с помощью `SYSTEM DROP REPLICA ... FROM ZKPATH ...` после присоединения.

Если вы пытаетесь добавить реплику в существующую таблицу ReplicatedMergeTree, имейте в виду, что все локальные данные в конвертированной таблице MergeTree будут отсоединены.

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
Присоедините таблицу как не реплицированную и удалите данные реплики из ZooKeeper:
```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```

## Присоединение Существующего Словаря {#attach-existing-dictionary}

Присоединяет ранее отсоединенный словарь.

**Синтаксис**

``` sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

## Присоединение Существующей Базы Данных {#attach-existing-database}

Присоединяет ранее отсоединенную базу данных.

**Синтаксис**

``` sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```
