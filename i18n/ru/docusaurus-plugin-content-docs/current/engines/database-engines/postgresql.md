---
description: 'Позволяет подключаться к базам данных на удалённом сервере PostgreSQL.'
sidebar_label: 'PostgreSQL'
sidebar_position: 40
slug: /engines/database-engines/postgresql
title: 'PostgreSQL'
doc_type: 'guide'
---

# PostgreSQL \\{#postgresql\\}

Позволяет подключаться к базам данных на удалённом сервере [PostgreSQL](https://www.postgresql.org). Поддерживает операции чтения и записи (запросы `SELECT` и `INSERT`) для обмена данными между ClickHouse и PostgreSQL.

Обеспечивает доступ в режиме реального времени к списку таблиц и их структуре на удалённом сервере PostgreSQL с помощью запросов `SHOW TABLES` и `DESCRIBE TABLE`.

Поддерживает модификацию структуры таблиц (`ALTER TABLE ... ADD|DROP COLUMN`). Если параметр `use_table_cache` (см. параметры движка ниже) установлен в `1`, структура таблиц кэшируется и не проверяется на наличие изменений, но может быть обновлена с помощью запросов `DETACH` и `ATTACH`.

## Создание базы данных \\{#creating-a-database\\}

```sql
CREATE DATABASE test_database
ENGINE = PostgreSQL('host:port', 'database', 'user', 'password'[, `schema`, `use_table_cache`]);
```

**Параметры движка**

* `host:port` — адрес сервера PostgreSQL.
* `database` — имя удалённой базы данных.
* `user` — пользователь PostgreSQL.
* `password` — пароль пользователя.
* `schema` — схема PostgreSQL.
* `use_table_cache` — определяет, кэшируется ли структура таблицы базы данных. Необязательный параметр. Значение по умолчанию: `0`.

## Поддержка типов данных \\{#data_types-support\\}

| PostgreSQL       | ClickHouse                                                   |
|------------------|--------------------------------------------------------------|
| DATE             | [Date](../../sql-reference/data-types/date.md)               |
| TIMESTAMP        | [DateTime](../../sql-reference/data-types/datetime.md)       |
| REAL             | [Float32](../../sql-reference/data-types/float.md)           |
| DOUBLE           | [Float64](../../sql-reference/data-types/float.md)           |
| DECIMAL, NUMERIC | [Decimal](../../sql-reference/data-types/decimal.md)         |
| SMALLINT         | [Int16](../../sql-reference/data-types/int-uint.md)          |
| INTEGER          | [Int32](../../sql-reference/data-types/int-uint.md)          |
| BIGINT           | [Int64](../../sql-reference/data-types/int-uint.md)          |
| SERIAL           | [UInt32](../../sql-reference/data-types/int-uint.md)         |
| BIGSERIAL        | [UInt64](../../sql-reference/data-types/int-uint.md)         |
| TEXT, CHAR       | [String](../../sql-reference/data-types/string.md)           |
| INTEGER          | Nullable([Int32](../../sql-reference/data-types/int-uint.md))|
| ARRAY            | [Array](../../sql-reference/data-types/array.md)             |

## Примеры использования \\{#examples-of-use\\}

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

Чтение данных из таблицы в PostgreSQL:

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

Предположим, что в PostgreSQL изменили структуру таблицы:

```sql
postgre> ALTER TABLE test_table ADD COLUMN data Text
```

Поскольку параметр `use_table_cache` был установлен в значение `1` при создании базы данных, структура таблицы в ClickHouse была помещена в кэш и, соответственно, не изменилась:

```sql
DESCRIBE TABLE test_database.test_table;
```

```text
┌─name───┬─type──────────────┐
│ id     │ Nullable(Integer) │
│ value  │ Nullable(Integer) │
└────────┴───────────────────┘
```

После отсоединения и повторного присоединения таблицы её структура была обновлена:

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

## Связанные материалы \\{#related-content\\}

- Блог: [ClickHouse и PostgreSQL — идеальный союз в мире данных — часть 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- Блог: [ClickHouse и PostgreSQL — идеальный союз в мире данных — часть 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
