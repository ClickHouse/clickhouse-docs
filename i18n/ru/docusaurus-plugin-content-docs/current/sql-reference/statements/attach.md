---
description: 'Документация по оператору ATTACH'
sidebar_label: 'ATTACH'
sidebar_position: 40
slug: /sql-reference/statements/attach
title: 'Оператор ATTACH'
doc_type: 'reference'
---

Подключает таблицу или словарь, например, при переносе базы данных на другой сервер.

**Синтаксис**

```sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

Запрос не создает данные на диске, а предполагает, что данные уже находятся в соответствующих местах, и лишь добавляет информацию о указанной таблице, словаре или базе данных на сервер. После выполнения запроса `ATTACH` сервер будет знать о существовании таблицы, словаря или базы данных.

Если таблица ранее была отсоединена (запрос [DETACH](../../sql-reference/statements/detach.md)), то есть ее структура известна, можно использовать сокращенную форму без определения структуры.


## Присоединение существующей таблицы {#attach-existing-table}

**Синтаксис**

```sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

Этот запрос используется при запуске сервера. Сервер хранит метаданные таблиц в виде файлов с запросами `ATTACH`, которые он просто выполняет при запуске (за исключением некоторых системных таблиц, которые явно создаются на сервере).

Если таблица была отсоединена навсегда, она не будет автоматически присоединена при запуске сервера, поэтому необходимо явно использовать запрос `ATTACH`.


## Создание новой таблицы и подключение данных {#create-new-table-and-attach-data}

### С указанием пути к данным таблицы {#with-specified-path-to-table-data}

Запрос создаёт новую таблицу с заданной структурой и подключает данные таблицы из указанного каталога в `user_files`.

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

### С указанием UUID таблицы {#with-specified-table-uuid}

Этот запрос создаёт новую таблицу с заданной структурой и подключает данные из таблицы с указанным UUID.
Поддерживается движком баз данных [Atomic](../../engines/database-engines/atomic.md).

**Синтаксис**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```


## Присоединение таблицы MergeTree как ReplicatedMergeTree {#attach-mergetree-table-as-replicatedmergetree}

Позволяет присоединить нереплицируемую таблицу MergeTree как ReplicatedMergeTree. Таблица ReplicatedMergeTree будет создана со значениями настроек `default_replica_path` и `default_replica_name`. Также возможно присоединить реплицируемую таблицу как обычную MergeTree.

Обратите внимание, что данные таблицы в ZooKeeper не изменяются этим запросом. Это означает, что после присоединения необходимо добавить метаданные в ZooKeeper с помощью `SYSTEM RESTORE REPLICA` или очистить их с помощью `SYSTEM DROP REPLICA ... FROM ZKPATH ...`.

Если вы добавляете реплику к существующей таблице ReplicatedMergeTree, учтите, что все локальные данные в преобразованной таблице MergeTree будут отсоединены.

**Синтаксис**

```sql
ATTACH TABLE [db.]name AS [NOT] REPLICATED
```

**Преобразование таблицы в реплицируемую**

```sql
DETACH TABLE test;
ATTACH TABLE test AS REPLICATED;
SYSTEM RESTORE REPLICA test;
```

**Преобразование таблицы в нереплицируемую**

Получение пути ZooKeeper и имени реплики для таблицы:

```sql
SELECT replica_name, zookeeper_path FROM system.replicas WHERE table='test';
```

Результат:

```sql
┌─replica_name─┬─zookeeper_path─────────────────────────────────────────────┐
│ r1           │ /clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1 │
└──────────────┴────────────────────────────────────────────────────────────┘
```

Присоединение таблицы как нереплицируемой и удаление данных реплики из ZooKeeper:

```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```


## Подключение существующего словаря {#attach-existing-dictionary}

Подключает ранее отсоединённый словарь.

**Синтаксис**

```sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```


## Подключение существующей базы данных {#attach-existing-database}

Подключает ранее отсоединённую базу данных.

**Синтаксис**

```sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```
