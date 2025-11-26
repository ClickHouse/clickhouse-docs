---
description: 'Позволяет выполнять запросы `SELECT` и `INSERT` к данным, хранящимся на удалённом сервере PostgreSQL.'
sidebar_label: 'postgresql'
sidebar_position: 160
slug: /sql-reference/table-functions/postgresql
title: 'postgresql'
doc_type: 'reference'
---



# Табличная функция PostgreSQL

Позволяет выполнять запросы `SELECT` и `INSERT` к данным, которые хранятся на удалённом сервере PostgreSQL.



## Синтаксис

```sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```


## Аргументы {#arguments}

| Аргумент      | Описание                                                                  |
|---------------|----------------------------------------------------------------------------|
| `host:port`   | Адрес сервера PostgreSQL.                                                 |
| `database`    | Имя удалённой базы данных.                                                |
| `table`       | Имя удалённой таблицы.                                                    |
| `user`        | Пользователь PostgreSQL.                                                  |
| `password`    | Пароль пользователя.                                                      |
| `schema`      | Схема таблицы, отличная от схемы по умолчанию. Необязательно.            |
| `on_conflict` | Стратегия разрешения конфликтов. Пример: `ON CONFLICT DO NOTHING`. Необязательно. |

Аргументы также могут быть переданы с использованием [именованных коллекций](operations/named-collections.md). В этом случае `host` и `port` должны быть указаны отдельно. Такой подход рекомендуется для продакшен-среды.



## Возвращаемое значение {#returned_value}

Объект таблицы с теми же столбцами, что и исходная таблица PostgreSQL.

:::note
В запросе `INSERT`, чтобы отличить табличную функцию `postgresql(...)` от имени таблицы со списком имён столбцов, необходимо использовать ключевые слова `FUNCTION` или `TABLE FUNCTION`. См. примеры ниже.
:::



## Детали реализации

Запросы `SELECT` на стороне PostgreSQL выполняются в виде `COPY (SELECT ...) TO STDOUT` внутри транзакции PostgreSQL только для чтения с фиксацией (commit) после каждого запроса `SELECT`.

Простые выражения `WHERE`, такие как `=`, `!=`, `>`, `>=`, `<`, `<=` и `IN`, выполняются на сервере PostgreSQL.

Все операции JOIN, агрегации, сортировка, условия `IN [ array ]` и ограничение выборки `LIMIT` выполняются в ClickHouse только после завершения запроса к PostgreSQL.

Запросы `INSERT` на стороне PostgreSQL выполняются в виде `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` внутри транзакции PostgreSQL в режиме автокоммита после каждого оператора `INSERT`.

Типы Array в PostgreSQL преобразуются в массивы ClickHouse.

:::note
Будьте осторожны: в PostgreSQL столбец с типом данных массив, например Integer[], может содержать массивы разной размерности в разных строках, но в ClickHouse допускаются только многомерные массивы одной и той же размерности во всех строках.
:::

Поддерживаются несколько реплик, которые должны быть перечислены через `|`. Например:

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

или

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

Поддерживаются приоритеты реплик для источника словаря PostgreSQL. Чем больше число в отображении, тем ниже приоритет. Наивысший приоритет — `0`.


## Примеры

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

Использование нестандартной схемы:

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```


## Связанные материалы {#related}

- [Движок таблиц PostgreSQL](../../engines/table-engines/integrations/postgresql.md)
- [Использование PostgreSQL как источника словаря](/sql-reference/dictionaries#postgresql)

### Репликация или миграция данных Postgres с помощью PeerDB {#replicating-or-migrating-postgres-data-with-with-peerdb}

> В дополнение к табличным функциям вы всегда можете использовать [PeerDB](https://docs.peerdb.io/introduction) от ClickHouse для настройки непрерывного конвейера передачи данных из Postgres в ClickHouse. PeerDB — это специализированный инструмент, разработанный для репликации данных из Postgres в ClickHouse с использованием фиксации изменений данных (CDC).
