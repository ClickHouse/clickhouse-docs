---
description: 'Документация по оператору CREATE DATABASE'
sidebar_label: 'DATABASE'
sidebar_position: 35
slug: /sql-reference/statements/create/database
title: 'CREATE DATABASE'
doc_type: 'reference'
---

# CREATE DATABASE {#create-database}

Создает новую базу данных.

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster] [ENGINE = engine(...)] [COMMENT 'Comment']
```

## Условия {#clauses}

### IF NOT EXISTS {#if-not-exists}

Если база данных `db_name` уже существует, ClickHouse не создаёт новую базу данных и:

* Не выбрасывает исключение, если указано это условие.
* Выбрасывает исключение, если это условие не указано.

### ON CLUSTER {#on-cluster}

ClickHouse создаёт базу данных `db_name` на всех серверах указанного кластера. Подробнее см. в статье [Distributed DDL](../../../sql-reference/distributed-ddl.md).

### ENGINE {#engine}

По умолчанию ClickHouse использует собственный движок базы данных [Atomic](../../../engines/database-engines/atomic.md). Также доступны [Lazy](../../../engines/database-engines/lazy.md), [MySQL](../../../engines/database-engines/mysql.md), [PostgresSQL](../../../engines/database-engines/postgresql.md), [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md), [Replicated](../../../engines/database-engines/replicated.md), [SQLite](../../../engines/database-engines/sqlite.md).

### COMMENT {#comment}

Вы можете добавить комментарий к базе данных при её создании.

Комментарии поддерживаются всеми движками баз данных.

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
