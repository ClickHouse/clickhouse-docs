---
description: 'Документация для CREATE DATABASE'
sidebar_label: 'БАЗА ДАННЫХ'
sidebar_position: 35
slug: /sql-reference/statements/create/database
title: 'CREATE DATABASE'
---


# CREATE DATABASE

Создает новую базу данных.

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster] [ENGINE = engine(...)] [COMMENT 'Комментарий']
```

## Clauses {#clauses}

### IF NOT EXISTS {#if-not-exists}

Если база данных `db_name` уже существует, то ClickHouse не создает новую базу данных и:

- Не выбрасывает исключение, если указан данный клауз.
- Выбрасывает исключение, если данный клауз не указан.

### ON CLUSTER {#on-cluster}

ClickHouse создает базу данных `db_name` на всех серверах указанного кластера. Подробности в статье о [распределенном DDL](../../../sql-reference/distributed-ddl.md).

### ENGINE {#engine}

По умолчанию ClickHouse использует свой собственный [атомарный](../../../engines/database-engines/atomic.md) движок базы данных. Также доступны [Lazy](../../../engines/database-engines/lazy.md), [MySQL](../../../engines/database-engines/mysql.md), [PostgresSQL](../../../engines/database-engines/postgresql.md), [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md), [Replicated](../../../engines/database-engines/replicated.md), [SQLite](../../../engines/database-engines/sqlite.md).

### COMMENT {#comment}

Вы можете добавить комментарий к базе данных при ее создании.

Комментарий поддерживается для всех движков баз данных.

**Синтаксис**

```sql
CREATE DATABASE db_name ENGINE = engine(...) COMMENT 'Комментарий'
```

**Пример**

Запрос:

```sql
CREATE DATABASE db_comment ENGINE = Memory COMMENT 'Временная база данных';
SELECT name, comment FROM system.databases WHERE name = 'db_comment';
```

Результат:

```text
┌─name───────┬─comment────────────────┐
│ db_comment │ Временная база данных │
└────────────┴────────────────────────┘
```
