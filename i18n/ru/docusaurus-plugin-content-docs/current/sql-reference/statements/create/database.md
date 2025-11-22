---
description: 'Документация по CREATE DATABASE'
sidebar_label: 'БАЗА ДАННЫХ'
sidebar_position: 35
slug: /sql-reference/statements/create/database
title: 'CREATE DATABASE'
doc_type: 'reference'
---



# CREATE DATABASE

Создает новую базу данных.

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster] [ENGINE = engine(...)] [COMMENT 'Comment']
```


## Секции {#clauses}

### IF NOT EXISTS {#if-not-exists}

Если база данных `db_name` уже существует, то ClickHouse не создаёт новую базу данных и:

- Не генерирует исключение, если секция указана.
- Генерирует исключение, если секция не указана.

### ON CLUSTER {#on-cluster}

ClickHouse создаёт базу данных `db_name` на всех серверах указанного кластера. Подробнее см. в статье [Распределённые DDL-запросы](../../../sql-reference/distributed-ddl.md).

### ENGINE {#engine}

По умолчанию ClickHouse использует собственный движок баз данных [Atomic](../../../engines/database-engines/atomic.md). Также доступны движки [Lazy](../../../engines/database-engines/lazy.md), [MySQL](../../../engines/database-engines/mysql.md), [PostgresSQL](../../../engines/database-engines/postgresql.md), [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md), [Replicated](../../../engines/database-engines/replicated.md), [SQLite](../../../engines/database-engines/sqlite.md).

### COMMENT {#comment}

При создании базы данных можно добавить к ней комментарий.

Комментарии поддерживаются для всех движков баз данных.

**Синтаксис**

```sql
CREATE DATABASE db_name ENGINE = engine(...) COMMENT 'Comment'
```

**Пример**

Запрос:

```sql
CREATE DATABASE db_comment ENGINE = Memory COMMENT 'The temporary database';
SELECT name, comment FROM system.databases WHERE name = 'db_comment';
```

Результат:

```text
┌─name───────┬─comment────────────────┐
│ db_comment │ The temporary database │
└────────────┴────────────────────────┘
```
