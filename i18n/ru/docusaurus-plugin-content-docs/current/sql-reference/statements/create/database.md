---
description: 'Документация по оператору CREATE DATABASE'
sidebar_label: 'DATABASE'
sidebar_position: 35
slug: /sql-reference/statements/create/database
title: 'CREATE DATABASE'
doc_type: 'reference'
---

# CREATE DATABASE \{#create-database\}

Создает новую базу данных.

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster] [ENGINE = engine(...)] [SETTINGS ...] [COMMENT 'Comment']
```


## Условия \{#clauses\}

### IF NOT EXISTS \{#if-not-exists\}

Если база данных `db_name` уже существует, ClickHouse не создаёт новую базу данных и:

- Не выбрасывает исключение, если указано это условие.
- Выбрасывает исключение, если это условие не указано.

### ON CLUSTER \{#on-cluster\}

ClickHouse создаёт базу данных `db_name` на всех серверах указанного кластера. Подробнее см. в статье [Distributed DDL](../../../sql-reference/distributed-ddl.md).

### ENGINE \{#engine\}

По умолчанию ClickHouse использует собственный движок базы данных [Atomic](../../../engines/database-engines/atomic.md). Также доступны [MySQL](../../../engines/database-engines/mysql.md), [PostgresSQL](../../../engines/database-engines/postgresql.md), [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md), [Replicated](../../../engines/database-engines/replicated.md), [SQLite](../../../engines/database-engines/sqlite.md).

### COMMENT \{#comment\}

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


### SETTINGS \{#settings\}

#### lazy_load_tables \{#lazy-load-tables\}

При включении таблицы не загружаются полностью при запуске базы данных. Вместо этого для каждой таблицы создаётся лёгкий прокси, а реальный движок таблицы материализуется при первом обращении к ней. Это сокращает время запуска и потребление памяти для баз данных с большим количеством таблиц, из которых активно запрашивается только часть.

```sql
CREATE DATABASE db_name ENGINE = Atomic SETTINGS lazy_load_tables = 1;
```

Применяется к движкам баз данных, которые хранят метаданные таблиц на диске (например, `Atomic`, `Ordinary`). VIEW, materialized views, словари и таблицы, основанные на табличных функциях, всегда загружаются немедленно, независимо от этого SETTING.

**Когда использовать:** Этот SETTING полезен для баз данных с большим числом таблиц (сотни или тысячи), из которых фактически используется только подмножество. Он сокращает время запуска сервера и потребление памяти, откладывая создание объектов движка таблиц, сканирование частей и инициализацию фоновых потоков до первого обращения.

**Влияние на `system.tables`:**

* До обращения к таблице `system.tables` показывает ее движок как `TableProxy`. После первого обращения отображается реальное имя движка (например, `MergeTree`).
* Столбцы вроде `total_rows` и `total_bytes` возвращают `NULL` для незагруженных таблиц, поскольку реальное хранилище еще не создано.

**Взаимодействие с DDL-операциями:**

* `SELECT`, `INSERT`, `ALTER`, `DROP` прозрачно инициируют загрузку реального движка таблицы при первом использовании.
* `RENAME TABLE` работает без инициирования загрузки.
* После того как таблица загружена, она остается загруженной на протяжении всего времени жизни серверного процесса.

**Ограничения:**

* Инструменты мониторинга, которые полагаются на метаданные `system.tables` (например, `total_rows`, `engine`), могут видеть неполную информацию для незагруженных таблиц.
* Первый запрос к незагруженной таблице имеет единовременные накладные расходы на загрузку (разбор сохраненного выражения `CREATE TABLE` и инициализацию движка).

Значение по умолчанию: `0` (отключено).
