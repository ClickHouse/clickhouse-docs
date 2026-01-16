---
description: 'Позволяет подключаться к базам данных SQLite и выполнять операторы `INSERT` и `SELECT`
  для обмена данными между ClickHouse и SQLite.'
sidebar_label: 'SQLite'
sidebar_position: 55
slug: /engines/database-engines/sqlite
title: 'SQLite'
doc_type: 'reference'
---

# SQLite \\{#sqlite\\}

Позволяет подключаться к базе данных [SQLite](https://www.sqlite.org/index.html) и выполнять запросы `INSERT` и `SELECT` для обмена данными между ClickHouse и SQLite.

## Создание базы данных \\{#creating-a-database\\}

```sql
    CREATE DATABASE sqlite_database
    ENGINE = SQLite('db_path')
```

**Параметры двигателя**

* `db_path` — Путь к файлу с базой данных SQLite.

## Поддерживаемые типы данных \\{#data_types-support\\}

|  SQLite   | ClickHouse                                              |
|---------------|---------------------------------------------------------|
| INTEGER       | [Int32](../../sql-reference/data-types/int-uint.md)     |
| REAL          | [Float32](../../sql-reference/data-types/float.md)      |
| TEXT          | [String](../../sql-reference/data-types/string.md)      |
| BLOB          | [String](../../sql-reference/data-types/string.md)      |

## Особенности и рекомендации \\{#specifics-and-recommendations\\}

SQLite хранит всю базу данных (определения, таблицы, индексы и сами данные) в одном кроссплатформенном файле на хосте. Во время записи SQLite блокирует весь файл базы данных, поэтому операции записи выполняются последовательно. Операции чтения могут выполняться параллельно.
SQLite не требует отдельного управления службой (например, скриптов запуска) или управления доступом на основе `GRANT` и паролей. Контроль доступа осуществляется с помощью разрешений файловой системы, заданных непосредственно для файла базы данных.

## Пример использования \\{#usage-example\\}

База данных в ClickHouse, подключённая к SQLite:

```sql
CREATE DATABASE sqlite_db ENGINE = SQLite('sqlite.db');
SHOW TABLES FROM sqlite_db;
```

```text
┌──name───┐
│ table1  │
│ table2  │
└─────────┘
```

Выводит таблицы:

```sql
SELECT * FROM sqlite_db.table1;
```

```text
┌─col1──┬─col2─┐
│ line1 │    1 │
│ line2 │    2 │
│ line3 │    3 │
└───────┴──────┘
```

Запись данных в таблицу SQLite из таблицы ClickHouse:

```sql
CREATE TABLE clickhouse_table(`col1` String,`col2` Int16) ENGINE = MergeTree() ORDER BY col2;
INSERT INTO clickhouse_table VALUES ('text',10);
INSERT INTO sqlite_db.table1 SELECT * FROM clickhouse_table;
SELECT * FROM sqlite_db.table1;
```

```text
┌─col1──┬─col2─┐
│ line1 │    1 │
│ line2 │    2 │
│ line3 │    3 │
│ text  │   10 │
└───────┴──────┘
```
