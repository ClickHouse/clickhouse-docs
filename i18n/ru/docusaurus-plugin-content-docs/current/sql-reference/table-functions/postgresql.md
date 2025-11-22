---
description: 'Позволяет выполнять запросы `SELECT` и `INSERT` к данным, которые
  хранятся на удалённом сервере PostgreSQL.'
sidebar_label: 'postgresql'
sidebar_position: 160
slug: /sql-reference/table-functions/postgresql
title: 'postgresql'
doc_type: 'reference'
---



# Табличная функция PostgreSQL

Позволяет выполнять запросы `SELECT` и `INSERT` к данным, которые хранятся на удалённом сервере PostgreSQL.



## Синтаксис {#syntax}

```sql
postgresql({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```


## Аргументы {#arguments}

| Аргумент      | Описание                                                                   |
| ------------- | -------------------------------------------------------------------------- |
| `host:port`   | Адрес сервера PostgreSQL.                                                  |
| `database`    | Имя удалённой базы данных.                                                 |
| `table`       | Имя удалённой таблицы.                                                     |
| `user`        | Пользователь PostgreSQL.                                                   |
| `password`    | Пароль пользователя.                                                       |
| `schema`      | Схема таблицы, отличная от используемой по умолчанию. Необязательный.     |
| `on_conflict` | Стратегия разрешения конфликтов. Пример: `ON CONFLICT DO NOTHING`. Необязательный. |

Аргументы также можно передать с помощью [именованных коллекций](operations/named-collections.md). В этом случае `host` и `port` должны быть указаны отдельно. Этот подход рекомендуется для production-среды.


## Возвращаемое значение {#returned_value}

Табличный объект с теми же столбцами, что и в исходной таблице PostgreSQL.

:::note
В запросе `INSERT` для отличия табличной функции `postgresql(...)` от имени таблицы со списком имён столбцов необходимо использовать ключевые слова `FUNCTION` или `TABLE FUNCTION`. См. примеры ниже.
:::


## Детали реализации {#implementation-details}

Запросы `SELECT` на стороне PostgreSQL выполняются как `COPY (SELECT ...) TO STDOUT` внутри транзакции PostgreSQL в режиме только для чтения с фиксацией после каждого запроса `SELECT`.

Простые условия `WHERE`, такие как `=`, `!=`, `>`, `>=`, `<`, `<=` и `IN`, выполняются на сервере PostgreSQL.

Все объединения, агрегации, сортировка, условия `IN [ array ]` и ограничение выборки `LIMIT` выполняются в ClickHouse только после завершения запроса к PostgreSQL.

Запросы `INSERT` на стороне PostgreSQL выполняются как `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` внутри транзакции PostgreSQL с автоматической фиксацией после каждого оператора `INSERT`.

Типы массивов PostgreSQL преобразуются в массивы ClickHouse.

:::note
Обратите внимание: в PostgreSQL столбец с типом данных массива, например Integer[], может содержать массивы различной размерности в разных строках, но в ClickHouse допускаются только многомерные массивы одинаковой размерности во всех строках.
:::

Поддерживается использование нескольких реплик, которые должны быть перечислены через `|`. Например:

```sql
SELECT name FROM postgresql(`postgres{1|2|3}:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

или

```sql
SELECT name FROM postgresql(`postgres1:5431|postgres2:5432`, 'postgres_database', 'postgres_table', 'user', 'password');
```

Поддерживается приоритизация реплик для источника словаря PostgreSQL. Чем больше число в карте, тем ниже приоритет. Наивысший приоритет — `0`.


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

Выборка данных из ClickHouse с использованием обычных аргументов:

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

Вставка данных:

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
- [Использование PostgreSQL в качестве источника словаря](/sql-reference/dictionaries#postgresql)

### Репликация или миграция данных Postgres с помощью PeerDB {#replicating-or-migrating-postgres-data-with-with-peerdb}

> Помимо табличных функций, вы можете использовать [PeerDB](https://docs.peerdb.io/introduction) от ClickHouse для настройки непрерывного конвейера данных из Postgres в ClickHouse. PeerDB — это инструмент, специально разработанный для репликации данных из Postgres в ClickHouse с использованием технологии захвата изменений данных (CDC).
