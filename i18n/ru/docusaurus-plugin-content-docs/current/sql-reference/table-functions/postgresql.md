---
slug: /sql-reference/table-functions/postgresql
sidebar_position: 160
sidebar_label: postgresql
title: 'postgresql'
description: 'Позволяет выполнять `SELECT` и `INSERT` запросы к данным, которые хранятся на удаленном сервере PostgreSQL.'
---


# postgresql Table Function

Позволяет выполнять `SELECT` и `INSERT` запросы к данным, которые хранятся на удаленном сервере PostgreSQL.

**Синтаксис**

``` sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

**Параметры**

- `host:port` — адрес сервера PostgreSQL.
- `database` — имя удаленной базы данных.
- `table` — имя удаленной таблицы.
- `user` — пользователь PostgreSQL.
- `password` — пароль пользователя.
- `schema` — схема таблицы, отличная от схемы по умолчанию. Необязательный.
- `on_conflict` — стратегия разрешения конфликтов. Пример: `ON CONFLICT DO NOTHING`. Необязательный.

Аргументы также могут передаваться с использованием [именованных коллекций](operations/named-collections.md). В этом случае `host` и `port` должны быть указаны отдельно. Этот подход рекомендуется для производственной среды.

**Возвращаемое значение**

Объект таблицы с теми же колонками, что и у оригинальной таблицы PostgreSQL.

:::note
В запросе `INSERT`, чтобы отличить функцию таблицы `postgresql(...)` от имени таблицы с перечислением имен колонок, вы должны использовать ключевые слова `FUNCTION` или `TABLE FUNCTION`. См. примеры ниже.
:::

## Детали реализации {#implementation-details}

`SELECT` запросы на стороне PostgreSQL выполняются как `COPY (SELECT ...) TO STDOUT` внутри транзакции PostgreSQL только для чтения с коммитом после каждого `SELECT` запроса.

Простые условия `WHERE`, такие как `=`, `!=`, `>`, `>=`, `<`, `<=`, и `IN`, выполняются на сервере PostgreSQL.

Все соединения, агрегирования, сортировки, условия `IN [ array ]` и ограничение выборки `LIMIT` выполняются в ClickHouse только после завершения запроса к PostgreSQL.

`INSERT` запросы на стороне PostgreSQL выполняются как `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` внутри транзакции PostgreSQL с авто-коммитом после каждого оператора `INSERT`.

Типы массивов PostgreSQL преобразуются в массивы ClickHouse.

:::note
Будьте осторожны, в PostgreSQL колонка типа данных массива, такая как Integer[], может содержать массивы разных размерностей в разных строках, но в ClickHouse разрешено иметь многомерные массивы одной размерности во всех строках.
:::

Поддерживает множество реплик, которые должны быть указаны через `|`. Например:

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

``` text
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

Выбор данных из ClickHouse, используя простые аргументы:

```sql
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password') WHERE str IN ('test');
```

Или используя [именованные коллекции](operations/named-collections.md):

```sql
CREATE NAMED COLLECTION mypg AS
        host = 'localhost',
        port = 5432,
        database = 'test',
        user = 'postgresql_user',
        password = 'password';
SELECT * FROM postgresql(mypg, table='test') WHERE str IN ('test');
```

``` text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

Вставка:

```sql
INSERT INTO TABLE FUNCTION postgresql('localhost:5432', 'test', 'test', 'postgrsql_user', 'password') (int_id, float) VALUES (2, 3);
SELECT * FROM postgresql('localhost:5432', 'test', 'test', 'postgresql_user', 'password');
```

``` text
┌─int_id─┬─int_nullable─┬─float─┬─str──┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │ test │           ᴺᵁᴸᴸ │
│      2 │         ᴺᵁᴸᴸ │     3 │      │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴──────┴────────────────┘
```

Использование схемы, отличной от схемы по умолчанию:

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

**См. также**

- [Движок таблицы PostgreSQL](../../engines/table-engines/integrations/postgresql.md)
- [Использование PostgreSQL в качестве источника словаря](/sql-reference/dictionaries#postgresql)

## Связанное содержимое {#related-content}

- Блог: [ClickHouse и PostgreSQL - идеальное сочетание в мире данных - часть 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- Блог: [ClickHouse и PostgreSQL - идеальное сочетание в мире данных - часть 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)

### Репликация или миграция данных Postgres с помощью PeerDB {#replicating-or-migrating-postgres-data-with-with-peerdb}

> В дополнение к функциям таблиц вы всегда можете использовать [PeerDB](https://docs.peerdb.io/introduction) от ClickHouse для настройки непрерывного потока данных из Postgres в ClickHouse. PeerDB — это инструмент, разработанный специально для репликации данных из Postgres в ClickHouse с использованием захвата изменений данных (CDC).
