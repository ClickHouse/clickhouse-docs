---
description: 'Позволяет выполнять `SELECT` и `INSERT` запросы на данные, которые хранятся на удалённом сервере PostgreSQL.'
sidebar_label: 'postgresql'
sidebar_position: 160
slug: /sql-reference/table-functions/postgresql
title: 'postgresql'
---


# Функция таблицы postgresql

Позволяет выполнять `SELECT` и `INSERT` запросы на данные, которые хранятся на удалённом сервере PostgreSQL.

**Синтаксис**

```sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

**Параметры**

- `host:port` — адрес сервера PostgreSQL.
- `database` — имя удалённой базы данных.
- `table` — имя удалённой таблицы.
- `user` — пользователь PostgreSQL.
- `password` — пароль пользователя.
- `schema` — нестандартная схема таблицы. Необязательный.
- `on_conflict` — стратегия разрешения конфликтов. Пример: `ON CONFLICT DO NOTHING`. Необязательный.

Аргументы также могут передаваться с использованием [именованных коллекций](operations/named-collections.md). В этом случае `host` и `port` должны быть указаны отдельно. Этот подход рекомендуется для производственной среды.

**Возвращаемое значение**

Объект таблицы с такими же столбцами, как и у оригинальной таблицы PostgreSQL.

:::note
В запросе `INSERT`, чтобы отличить функцию таблицы `postgresql(...)` от имени таблицы со списком имен столбцов, необходимо использовать ключевые слова `FUNCTION` или `TABLE FUNCTION`. См. примеры ниже.
:::

## Подробности реализации {#implementation-details}

Запросы `SELECT` на стороне PostgreSQL выполняются как `COPY (SELECT ...) TO STDOUT` внутри транзакции PostgreSQL только для чтения с коммитом после каждого запроса `SELECT`.

Простые условия `WHERE`, такие как `=`, `!=`, `>`, `>=`, `<`, `<=`, и `IN` выполняются на сервере PostgreSQL.

Все соединения, агрегации, сортировки, условия `IN [ array ]` и ограничение выборки `LIMIT` выполняются в ClickHouse только после завершения запроса к PostgreSQL.

Запросы `INSERT` на стороне PostgreSQL выполняются как `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` внутри транзакции PostgreSQL с авто-коммитом после каждого оператора `INSERT`.

Типы массивов PostgreSQL конвертируются в массивы ClickHouse.

:::note
Будьте осторожны, в PostgreSQL столбец типа данных массива, такой как Integer[], может содержать массивы различной размерности в разных строках, но в ClickHouse разрешено иметь только многомерные массивы одинаковой размерности во всех строках.
:::

Поддерживает несколько реплик, которые должны быть перечислены через `|`. Например:

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

или

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

Поддерживает приоритет реплик для источника словаря PostgreSQL. Чем больше число в карте, тем меньше приоритет. Высший приоритет — `0`.

**Примеры**

Таблица в PostgreSQL:

```text
postgres=# CREATE TABLE "public"."test" (
"int_id" SERIAL,
"int_nullable" INT NULL DEFAULT NULL,
"float" FLOAT NOT NULL,
"str" VARCHAR(100) NOT NULL DEFAULT '',
"float_nullable" FLOAT NULL DEFAULT NULL,
PRIMARY KEY (int_id));

CREATE TABLE

postgres=# INSERT INTO test (int_id, str, "float") VALUES (1,'test',2);
INSERT 0 1

postgresql> SELECT * FROM test;
  int_id | int_nullable | float | str  | float_nullable
 --------+--------------+-------+------+----------------
       1 |              |     2 | test |
(1 row)
```

Выбор данных из ClickHouse с использованием простых аргументов:

```sql
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password') WHERE str IN ('test');
```

Или с использованием [именованных коллекций](operations/named-collections.md):

```sql
CREATE NAMED COLLECTION mypg AS
        host = 'localhost',
        port = 5432,
        database = 'test',
        user = 'postgresql_user',
        password = 'password';
SELECT * FROM postgresql(mypg, table='test') WHERE str IN ('test');
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

Вставка:

```sql
INSERT INTO TABLE FUNCTION postgresql('localhost:5432', 'test', 'test', 'postgrsql_user', 'password') (int_id, float) VALUES (2, 3);
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password');
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
│      2 │         ᴺᵁᴸᴸ │     3 │      │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

Используя нестандартную схему:

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i);
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

**См. также**

- [Движок таблиц PostgreSQL](../../engines/table-engines/integrations/postgresql.md)
- [Использование PostgreSQL в качестве источника словаря](/sql-reference/dictionaries#postgresql)

## Связанный контент {#related-content}

- Блог: [ClickHouse и PostgreSQL - идеальная пара в мире данных - часть 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- Блог: [ClickHouse и PostgreSQL - идеальная пара в мире данных - часть 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)

### Репликация или миграция данных Postgres с использованием PeerDB {#replicating-or-migrating-postgres-data-with-with-peerdb}

> В дополнение к функциям таблиц, вы всегда можете использовать [PeerDB](https://docs.peerdb.io/introduction) от ClickHouse для настройки непрерывного конвейера данных от Postgres к ClickHouse. PeerDB — это инструмент, специально разработанный для репликации данных из Postgres в ClickHouse с использованием захвата изменений данных (CDC).
