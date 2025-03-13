---
slug: /engines/table-engines/integrations/postgresql
title: "PostgreSQL Table Engine"
sidebar_position: 160
sidebar_label: PostgreSQL
description: "PostgreSQL движок позволяет выполнять `SELECT` и `INSERT` запросы к данным, хранящимся на удалённом сервере PostgreSQL."
---

PostgreSQL движок позволяет выполнять `SELECT` и `INSERT` запросы к данным, хранящимся на удалённом сервере PostgreSQL.

:::note
В данный момент поддерживаются только версии PostgreSQL 12 и выше.
:::

:::note Репликация или миграция данных Postgres с помощью PeerDB
> В дополнение к движку таблиц Postgres, вы можете использовать [PeerDB](https://docs.peerdb.io/introduction) от ClickHouse для настройки непрерывного канала данных из Postgres в ClickHouse. PeerDB - это инструмент, специально разработанный для репликации данных из Postgres в ClickHouse с использованием захвата изменений данных (CDC).
:::

## Создание таблицы {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 type1 [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 type2 [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = PostgreSQL({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

Смотрите подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

Структура таблицы может отличаться от оригинальной структуры таблицы PostgreSQL:

- Имена колонок должны совпадать с именами в оригинальной таблице PostgreSQL, но вы можете использовать лишь некоторые из этих колонок и в любом порядке.
- Типы колонок могут отличаться от тех, что в оригинальной таблице PostgreSQL. ClickHouse пытается [привести](../../../engines/database-engines/postgresql.md#data_types-support) значения к типам данных ClickHouse.
- Параметр [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) определяет, как обрабатывать Nullable колонки. Значение по умолчанию: 1. Если 0, функция таблицы не создаёт Nullable колонки и вместо null вставляет значения по умолчанию. Это также касается NULL значений внутри массивов.

**Параметры движка**

- `host:port` — адрес сервера PostgreSQL.
- `database` — имя удалённой базы данных.
- `table` — имя удалённой таблицы.
- `user` — пользователь PostgreSQL.
- `password` — пароль пользователя.
- `schema` — схема таблицы, отличная от схемы по умолчанию. Необязательно.
- `on_conflict` — стратегия разрешения конфликтов. Пример: `ON CONFLICT DO NOTHING`. Необязательно. Примечание: добавление этой опции сделает вставку менее эффективной.

Рекомендуется использовать [именованные коллекции](/operations/named-collections.md) (доступные с версии 21.11) в производственной среде. Вот пример:

```xml
<named_collections>
    <postgres_creds>
        <host>localhost</host>
        <port>5432</port>
        <user>postgres</user>
        <password>****</password>
        <schema>schema1</schema>
    </postgres_creds>
</named_collections>
```

Некоторые параметры можно переопределить с помощью аргументов ключ-значение:
``` sql
SELECT * FROM postgresql(postgres_creds, table='table1');
```

## Детали реализации {#implementation-details}

`SELECT` запросы на стороне PostgreSQL выполняются как `COPY (SELECT ...) TO STDOUT` внутри транзакции PostgreSQL только для чтения с коммитом после каждого `SELECT` запроса.

Простые условия `WHERE`, такие как `=`, `!=`, `>`, `>=`, `<`, `<=` и `IN`, выполняются на сервере PostgreSQL.

Все соединения, агрегирования, сортировки, условия `IN [ array ]` и ограничение выборки `LIMIT` выполняются в ClickHouse только после завершения запроса к PostgreSQL.

`INSERT` запросы на стороне PostgreSQL выполняются как `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` внутри транзакции PostgreSQL с автокоммитом после каждого оператора `INSERT`.

Типы `Array` PostgreSQL преобразуются в массивы ClickHouse.

:::note
Будьте осторожны - в PostgreSQL массив данных, созданный как `type_name[]`, может содержать многомерные массивы разных размеров в разных строках таблицы в одном столбце. Однако в ClickHouse разрешено иметь только многомерные массивы одинакового количества измерений во всех строках таблицы в одном столбце.
:::

Поддерживаются множественные реплики, которые должны быть перечислены через `|`. Например:

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

Поддерживается приоритет реплик для источника словаря PostgreSQL. Чем больше число в карте, тем меньше приоритет. Высший приоритет — `0`.

В примере ниже реплика `example01-1` имеет высший приоритет:

```xml
<postgresql>
    <port>5432</port>
    <user>clickhouse</user>
    <password>qwerty</password>
    <replica>
        <host>example01-1</host>
        <priority>1</priority>
    </replica>
    <replica>
        <host>example01-2</host>
        <priority>2</priority>
    </replica>
    <db>db_name</db>
    <table>table_name</table>
    <where>id=10</where>
    <invalidate_query>SQL_QUERY</invalidate_query>
</postgresql>
</source>
```

## Пример использования {#usage-example}

### Таблица в PostgreSQL {#table-in-postgresql}

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

### Создание таблицы в ClickHouse и подключение к таблице PostgreSQL, созданной выше {#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above}

Этот пример использует [PostgreSQL движок таблицы](/engines/table-engines/integrations/postgresql.md) для подключения таблицы ClickHouse к таблице PostgreSQL и использования как SELECT, так и INSERT операторов к базе данных PostgreSQL:

``` sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
```

### Вставка начальных данных из таблицы PostgreSQL в таблицу ClickHouse с использованием запроса SELECT {#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query}

Функция таблицы [postgresql](/sql-reference/table-functions/postgresql.md) копирует данные из PostgreSQL в ClickHouse, что часто используется для повышения производительности запросов к данным, запрашивая или выполняя аналитику в ClickHouse вместо PostgreSQL, или может также использоваться для миграции данных из PostgreSQL в ClickHouse. Поскольку мы будем копировать данные из PostgreSQL в ClickHouse, мы будем использовать движок таблицы MergeTree в ClickHouse и назовем его postgresql_copy:

``` sql
CREATE TABLE default.postgresql_copy
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = MergeTree
ORDER BY (int_id);
```

``` sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
```

### Вставка инкрементальных данных из таблицы PostgreSQL в таблицу ClickHouse {#inserting-incremental-data-from-postgresql-table-into-clickhouse-table}

Если затем выполнять постоянную синхронизацию между таблицей PostgreSQL и таблицей ClickHouse после начальной вставки, вы можете использовать условие WHERE в ClickHouse, чтобы вставлять только данные, добавленные в PostgreSQL на основе временной метки или уникального последовательностного идентификатора.

Это потребует отслеживания максимального ID или времени, ранее добавленного, как в следующем:

``` sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

Затем вставка значений из таблицы PostgreSQL, больших, чем макс:

``` sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
WHERE int_id > maxIntID;
```

### Выбор данных из полученной таблицы ClickHouse {#selecting-data-from-the-resulting-clickhouse-table}

``` sql
SELECT * FROM postgresql_copy WHERE str IN ('test');
```

``` text
┌─float_nullable─┬─str──┬─int_id─┐
│           ᴺᵁᴸᴸ │ test │      1 │
└────────────────┴──────┴────────┘
```

### Использование нестандартной схемы {#using-non-default-schema}

```text
postgres=# CREATE SCHEMA "nice.schema";

postgres=# CREATE TABLE "nice.schema"."nice.table" (a integer);

postgres=# INSERT INTO "nice.schema"."nice.table" SELECT i FROM generate_series(0, 99) as t(i)
```

```sql
CREATE TABLE pg_table_schema_with_dots (a UInt32)
        ENGINE PostgreSQL('localhost:5432', 'clickhouse', 'nice.table', 'postgrsql_user', 'password', 'nice.schema');
```

**Смотрите также**

- [Функция таблицы `postgresql`](../../../sql-reference/table-functions/postgresql.md)
- [Использование PostgreSQL в качестве источника словаря](/sql-reference/dictionaries#mysql)

## Связанное содержимое {#related-content}

- Блог: [ClickHouse и PostgreSQL - идеальная пара в мире данных - часть 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- Блог: [ClickHouse и PostgreSQL - идеальная пара в мире данных - часть 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
