---
slug: '/sql-reference/table-functions/postgresql'
sidebar_label: postgresql
sidebar_position: 160
description: 'Позволяет выполнять `SELECT` и `INSERT` запросы на данные, которые'
title: postgresql
doc_type: reference
---
# postgresql Табличная Функция

Позволяет выполнять запросы `SELECT` и `INSERT` на данных, которые хранятся на удаленном сервере PostgreSQL.

## Синтаксис {#syntax}

```sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

## Аргументы {#arguments}

| Аргумент      | Описание                                                                   |
|---------------|---------------------------------------------------------------------------|
| `host:port`   | Адрес сервера PostgreSQL.                                                |
| `database`    | Имя удаленной базы данных.                                               |
| `table`       | Имя удаленной таблицы.                                                  |
| `user`        | Пользователь PostgreSQL.                                                |
| `password`    | Пароль пользователя.                                                    |
| `schema`      | Неподразумеваемая схема таблицы. Необязательный аргумент.                |
| `on_conflict` | Стратегия разрешения конфликтов. Например: `ON CONFLICT DO NOTHING`. Необязательный аргумент. |

Аргументы также могут быть переданы с использованием [именованных коллекций](operations/named-collections.md). В этом случае `host` и `port` должны быть указаны отдельно. Этот подход рекомендуется для производственной среды.

## Возвращаемое значение {#returned_value}

Объект таблицы с теми же колонками, что и в оригинальной таблице PostgreSQL.

:::note
В `INSERT` запросе для различения табличной функции `postgresql(...)` от имени таблицы с перечислением имен колонок необходимо использовать ключевые слова `FUNCTION` или `TABLE FUNCTION`. Смотрите примеры ниже.
:::

## Подробности реализации {#implementation-details}

Запросы `SELECT` на стороне PostgreSQL выполняются как `COPY (SELECT ...) TO STDOUT` внутри транзакции только для чтения с коммитом после каждого запроса `SELECT`.

Простые условия `WHERE`, такие как `=`, `!=`, `>`, `>=`, `<`, `<=` и `IN`, выполняются на сервере PostgreSQL.

Все соединения, агрегации, сортировка, условия `IN [ array ]` и ограничение выборки `LIMIT` выполняются в ClickHouse только после завершения запроса к PostgreSQL.

Запросы `INSERT` на стороне PostgreSQL выполняются как `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` внутри транзакции PostgreSQL с автокоммитом после каждого оператора `INSERT`.

Типы массивов PostgreSQL конвертируются в массивы ClickHouse.

:::note
Будьте осторожны: в PostgreSQL колонка типа массив (например, Integer[]) может содержать массивы различных размерностей в разных строках, однако в ClickHouse разрешены только многомерные массивы одинаковой размерности во всех строках.
:::

Поддерживает несколько реплик, которые должны быть перечислены через `|`. Например:

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

или

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

Поддерживает приоритет реплик для источника словаря PostgreSQL. Чем больше число в карте, тем меньше приоритет. Наивысший приоритет — `0`.

## Примеры {#examples}

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

Выборка данных из ClickHouse с использованием простых аргументов:

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

Использование Неподразумеваемой Схемы:

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

## Связанные темы {#related}

- [Движок таблиц PostgreSQL](../../engines/table-engines/integrations/postgresql.md)
- [Использование PostgreSQL в качестве источника словаря](/sql-reference/dictionaries#postgresql)

### Репликация или миграция данных Postgres с PeerDB {#replicating-or-migrating-postgres-data-with-with-peerdb}

> В дополнение к табличным функциям вы всегда можете использовать [PeerDB](https://docs.peerdb.io/introduction) от ClickHouse для настройки непрерывного конвейера данных из Postgres в ClickHouse. PeerDB — это инструмент, специально предназначенный для репликации данных из Postgres в ClickHouse с использованием технологии захвата изменений данных (CDC).