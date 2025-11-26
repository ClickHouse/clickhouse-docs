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

Запрос не создаёт данные на диске, а предполагает, что данные уже размещены в соответствующих местах, и просто добавляет на сервер информацию об указанной таблице, словаре или базе данных. После выполнения запроса `ATTACH` сервер будет знать о существовании таблицы, словаря или базы данных.

Если таблица ранее была отсоединена (запрос [DETACH](../../sql-reference/statements/detach.md)), то есть её структура уже известна, можно использовать сокращённую форму без определения структуры.


## Подключить существующую таблицу

**Синтаксис**

```sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

Этот запрос используется при запуске сервера. Сервер хранит метаданные таблиц в виде файлов с запросами `ATTACH`, которые он просто выполняет при старте (за исключением некоторых системных таблиц, которые создаются на сервере явно).

Если таблица была отсоединена окончательно, она не будет повторно присоединена при запуске сервера, поэтому вам нужно явно выполнить запрос `ATTACH`.


## Создание новой таблицы и подключение данных

### С указанием пути к данным таблицы

Запрос создает новую таблицу с заданной структурой и подключает данные таблицы из указанного каталога в директории `user_files`.

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

### С заданным UUID таблицы

Этот запрос создает новую таблицу с заданной структурой и присоединяет данные из таблицы с указанным UUID.
Поддерживается в движке базы данных [Atomic](../../engines/database-engines/atomic.md).

**Синтаксис**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```


## Подключение таблицы MergeTree как ReplicatedMergeTree

Позволяет подключить нереплицируемую таблицу MergeTree как ReplicatedMergeTree. Таблица ReplicatedMergeTree будет создана с использованием значений настроек `default_replica_path` и `default_replica_name`. Также возможно подключить реплицируемую таблицу как обычную MergeTree.

Обратите внимание, что данные таблицы в ZooKeeper этим запросом не изменяются. Это означает, что вам необходимо либо добавить метаданные в ZooKeeper с помощью `SYSTEM RESTORE REPLICA`, либо очистить их с помощью `SYSTEM DROP REPLICA ... FROM ZKPATH ...` после выполнения операции ATTACH.

Если вы пытаетесь добавить реплику к уже существующей таблице ReplicatedMergeTree, имейте в виду, что все локальные данные в преобразованной таблице MergeTree будут отсоединены.

**Синтаксис**

```sql
ATTACH TABLE [db.]name AS [NOT] REPLICATED
```

**Преобразование таблицы в реплицируемую таблицу**

```sql
DETACH TABLE test;
ATTACH TABLE test AS REPLICATED;
SYSTEM RESTORE REPLICA test;
```

**Преобразовать таблицу в нереплицируемую**

Определите путь в ZooKeeper и имя реплики таблицы:

```sql
SELECT replica_name, zookeeper_path FROM system.replicas WHERE table='test';
```

Результат:

```sql
┌─replica_name─┬─zookeeper_path─────────────────────────────────────────────┐
│ r1           │ /clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1 │
└──────────────┴────────────────────────────────────────────────────────────┘
```

Подключите таблицу как нереплицируемую и удалите данные этой реплики из ZooKeeper:

```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```


## Подключить существующий словарь

Подключает ранее отключённый словарь.

**Синтаксис**

```sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```


## Подключить существующую базу данных

Подключает ранее отсоединённую базу данных.

**Синтаксис**

```sql
ATTACH DATABASE [IF NOT EXISTS] имя [ENGINE=<движок_базы_данных>] [ON CLUSTER кластер]
```
