---
slug: '/engines/database-engines/postgresql'
sidebar_label: PostgreSQL
sidebar_position: 40
description: 'Позволяет подключаться к DATABASE на удаленном сервере PostgreSQL.'
title: PostgreSQL
doc_type: guide
---
# PostgreSQL

Позволяет подключаться к базам данных на удаленном [PostgreSQL](https://www.postgresql.org) сервере. Поддерживает операции чтения и записи (запросы `SELECT` и `INSERT`) для обмена данными между ClickHouse и PostgreSQL.

Предоставляет доступ в реальном времени к списку таблиц и структуре таблиц из удаленного PostgreSQL с помощью запросов `SHOW TABLES` и `DESCRIBE TABLE`.

Поддерживает изменения структуры таблицы (`ALTER TABLE ... ADD|DROP COLUMN`). Если параметр `use_table_cache` (см. параметры движка ниже) установлен в `1`, структура таблицы кэшируется и не проверяется на изменения, но может быть обновлена с помощью запросов `DETACH` и `ATTACH`.

## Создание базы данных {#creating-a-database}

```sql
CREATE DATABASE test_database
ENGINE = PostgreSQL('host:port', 'database', 'user', 'password'[, `schema`, `use_table_cache`]);
```

**Параметры движка**

- `host:port` — адрес сервера PostgreSQL.
- `database` — имя удаленной базы данных.
- `user` — пользователь PostgreSQL.
- `password` — пароль пользователя.
- `schema` — схема PostgreSQL.
- `use_table_cache` — определяет, кэшируется ли структура таблицы базы данных или нет. Необязательный. Значение по умолчанию: `0`.

## Поддержка типов данных {#data_types-support}

| PostgreSQL       | ClickHouse                                                   |
|------------------|--------------------------------------------------------------|
| DATE             | [Date](../../sql-reference/data-types/date.md)               |
| TIMESTAMP        | [DateTime](../../sql-reference/data-types/datetime.md)       |
| REAL             | [Float32](../../sql-reference/data-types/float.md)           |
| DOUBLE           | [Float64](../../sql-reference/data-types/float.md)           |
| DECIMAL, NUMERIC | [Decimal](../../sql-reference/data-types/decimal.md)       |
| SMALLINT         | [Int16](../../sql-reference/data-types/int-uint.md)          |
| INTEGER          | [Int32](../../sql-reference/data-types/int-uint.md)          |
| BIGINT           | [Int64](../../sql-reference/data-types/int-uint.md)          |
| SERIAL           | [UInt32](../../sql-reference/data-types/int-uint.md)         |
| BIGSERIAL        | [UInt64](../../sql-reference/data-types/int-uint.md)         |
| TEXT, CHAR       | [String](../../sql-reference/data-types/string.md)           |
| INTEGER          | Nullable([Int32](../../sql-reference/data-types/int-uint.md))|
| ARRAY            | [Array](../../sql-reference/data-types/array.md)             |

## Примеры использования {#examples-of-use}

База данных в ClickHouse, обменивающаяся данными с сервером PostgreSQL:

```sql
CREATE DATABASE test_database
ENGINE = PostgreSQL('postgres1:5432', 'test_database', 'postgres', 'mysecretpassword', 'schema_name',1);
```

```sql
SHOW DATABASES;
```

```text
┌─name──────────┐
│ default       │
│ test_database │
│ system        │
└───────────────┘
```

```sql
SHOW TABLES FROM test_database;
```

```text
┌─name───────┐
│ test_table │
└────────────┘
```

Чтение данных из таблицы PostgreSQL:

```sql
SELECT * FROM test_database.test_table;
```

```text
┌─id─┬─value─┐
│  1 │     2 │
└────┴───────┘
```

Запись данных в таблицу PostgreSQL:

```sql
INSERT INTO test_database.test_table VALUES (3,4);
SELECT * FROM test_database.test_table;
```

```text
┌─int_id─┬─value─┐
│      1 │     2 │
│      3 │     4 │
└────────┴───────┘
```

Предположим, что структура таблицы была изменена в PostgreSQL:

```sql
postgre> ALTER TABLE test_table ADD COLUMN data Text
```

Поскольку параметр `use_table_cache` был установлен в `1` при создании базы данных, структура таблицы в ClickHouse была кэширована и, следовательно, не была изменена:

```sql
DESCRIBE TABLE test_database.test_table;
```
```text
┌─name───┬─type──────────────┐
│ id     │ Nullable(Integer) │
│ value  │ Nullable(Integer) │
└────────┴───────────────────┘
```

После отсоединения таблицы и повторного присоединения структура была обновлена:

```sql
DETACH TABLE test_database.test_table;
ATTACH TABLE test_database.test_table;
DESCRIBE TABLE test_database.test_table;
```
```text
┌─name───┬─type──────────────┐
│ id     │ Nullable(Integer) │
│ value  │ Nullable(Integer) │
│ data   │ Nullable(String)  │
└────────┴───────────────────┘
```

## Связанный контент {#related-content}

- Блог: [ClickHouse и PostgreSQL - идеальное сочетание данных - часть 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- Блог: [ClickHouse и PostgreSQL - идеальное сочетание данных - часть 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)