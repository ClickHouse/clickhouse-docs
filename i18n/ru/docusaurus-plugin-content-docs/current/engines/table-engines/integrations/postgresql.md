---
description: 'Табличный движок PostgreSQL позволяет выполнять запросы `SELECT` и `INSERT` к данным, хранящимся на удалённом сервере PostgreSQL.'
sidebar_label: 'PostgreSQL'
sidebar_position: 160
slug: /engines/table-engines/integrations/postgresql
title: 'Табличный движок PostgreSQL'
doc_type: 'guide'
---

# Движок таблиц PostgreSQL \{#postgresql-table-engine\}

Движок PostgreSQL позволяет выполнять запросы `SELECT` и `INSERT` к данным, хранящимся на удалённом сервере PostgreSQL.

:::note
В настоящее время поддерживаются только версии PostgreSQL 12 и выше.
:::

:::tip
Пользователям ClickHouse Cloud рекомендуется использовать [ClickPipes](/integrations/clickpipes) для потоковой передачи данных из Postgres в ClickHouse. Это обеспечивает встроенную поддержку высокопроизводительной вставки, при этом сохраняя разделение зон ответственности за счёт возможности независимо масштабировать ингестию и ресурсы кластера.
:::

## Создание таблицы \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 type1 [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 type2 [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = PostgreSQL({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

См. подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

Структура таблицы может отличаться от исходной структуры таблицы PostgreSQL:

* Имена столбцов должны совпадать с исходной таблицей PostgreSQL, но вы можете использовать только часть этих столбцов и в любом порядке.
* Типы столбцов могут отличаться от типов в исходной таблице PostgreSQL. ClickHouse пытается [привести](../../../engines/database-engines/postgresql.md#data_types-support) значения к типам данных ClickHouse.
* Настройка [external&#95;table&#95;functions&#95;use&#95;nulls](/operations/settings/settings#external_table_functions_use_nulls) определяет, как обрабатывать столбцы с типом Nullable. Значение по умолчанию: 1. При значении 0 табличная функция не создаёт столбцы Nullable и вставляет значения по умолчанию вместо null. Это также относится к значениям NULL внутри массивов.

**Параметры движка**

* `host:port` — адрес сервера PostgreSQL.
* `database` — имя удалённой базы данных.
* `table` — имя удалённой таблицы.
* `user` — пользователь PostgreSQL.
* `password` — пароль пользователя.
* `schema` — схема таблицы, отличная от схемы по умолчанию. Необязательный параметр.
* `on_conflict` — стратегия разрешения конфликтов. Пример: `ON CONFLICT DO NOTHING`. Необязательный параметр. Примечание: добавление этой опции сделает вставку менее эффективной.

Для продакшен-среды рекомендуется использовать [именованные коллекции](/operations/named-collections.md) (доступно начиная с версии 21.11). Ниже приведён пример:

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

Некоторые параметры можно переопределить, передав аргументы вида «ключ–значение»:

```sql
SELECT * FROM postgresql(postgres_creds, table='table1');
```

## Особенности реализации \{#implementation-details\}

Запросы `SELECT` на стороне PostgreSQL выполняются как `COPY (SELECT ...) TO STDOUT` внутри транзакции PostgreSQL только для чтения с фиксацией (commit) после каждого запроса `SELECT`.

Простые выражения `WHERE`, такие как `=`, `!=`, `>`, `>=`, `<`, `<=` и `IN`, выполняются на сервере PostgreSQL.

Все соединения, агрегации, сортировка, условия `IN [ array ]`, а также ограничение выборки `LIMIT` выполняются в ClickHouse только после завершения запроса к PostgreSQL.

Запросы `INSERT` на стороне PostgreSQL выполняются как `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` внутри транзакции PostgreSQL с автоматической фиксацией (auto-commit) после каждого оператора `INSERT`.

Типы `Array` в PostgreSQL преобразуются в массивы ClickHouse.

:::note
Будьте внимательны: в PostgreSQL массивы, созданные как `type_name[]`, могут содержать многомерные массивы с разным числом измерений в разных строках таблицы в одном и том же столбце. В ClickHouse же допускаются только многомерные массивы с одинаковым числом измерений во всех строках таблицы в одном и том же столбце.
:::

Поддерживается несколько реплик, которые должны быть перечислены через `|`. Например:

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

Поддерживается приоритизация реплик для источника словаря PostgreSQL. Чем больше число в карте, тем ниже приоритет. Наивысший приоритет — `0`.

В примере ниже реплика `example01-1` имеет наивысший приоритет:

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

## Пример использования \{#usage-example\}

### Таблица в PostgreSQL \{#table-in-postgresql\}

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

### Создание таблицы в ClickHouse и подключение к таблице PostgreSQL, созданной выше \{#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above\}

В этом примере используется [движок таблицы PostgreSQL](/engines/table-engines/integrations/postgresql.md) для подключения таблицы ClickHouse к таблице PostgreSQL и выполнения операторов SELECT и INSERT над базой данных PostgreSQL:

```sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```

### Вставка начальных данных из таблицы PostgreSQL в таблицу ClickHouse с использованием запроса SELECT \{#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query\}

[Табличная функция postgresql](/sql-reference/table-functions/postgresql.md) копирует данные из PostgreSQL в ClickHouse. Её часто используют для повышения производительности запросов за счёт выполнения запросов и аналитики в ClickHouse, а не в PostgreSQL, а также для миграции данных из PostgreSQL в ClickHouse. Поскольку мы будем копировать данные из PostgreSQL в ClickHouse, мы используем в ClickHouse табличный движок MergeTree и назовём таблицу postgresql&#95;copy:

```sql
CREATE TABLE default.postgresql_copy
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = MergeTree
ORDER BY (int_id);
```

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```

### Вставка инкрементальных данных из таблицы PostgreSQL в таблицу ClickHouse \{#inserting-incremental-data-from-postgresql-table-into-clickhouse-table\}

Если после первоначальной вставки вы выполняете дальнейшую синхронизацию между таблицей PostgreSQL и таблицей ClickHouse, вы можете использовать предложение WHERE в ClickHouse, чтобы вставлять только данные, добавленные в PostgreSQL, на основе метки времени или уникального последовательного идентификатора.

Для этого потребуется отслеживать максимальный идентификатор или метку времени, добавленные ранее, например, следующим образом:

```sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

Затем вставляем значения из таблицы PostgreSQL, которые больше текущего максимума

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
WHERE int_id > maxIntID;
```

### Выбор данных из полученной таблицы ClickHouse \{#selecting-data-from-the-resulting-clickhouse-table\}

```sql
SELECT * FROM postgresql_copy WHERE str IN ('test');
```

```text
┌─float_nullable─┬─str──┬─int_id─┐
│           ᴺᵁᴸᴸ │ test │      1 │
└────────────────┴──────┴────────┘
```

### Использование схемы, отличной от схемы по умолчанию \{#using-non-default-schema\}

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

* [Табличная функция `postgresql`](../../../sql-reference/table-functions/postgresql.md)
* [Использование PostgreSQL как источника словаря](/sql-reference/dictionaries#mysql)

## Связанные материалы \{#related-content\}

- Блог: [ClickHouse и PostgreSQL — союз, заключённый в раю данных — часть 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- Блог: [ClickHouse и PostgreSQL — союз, заключённый в раю данных — часть 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
