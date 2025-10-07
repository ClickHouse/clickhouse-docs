---
slug: '/engines/table-engines/integrations/postgresql'
sidebar_label: PostgreSQL
sidebar_position: 160
description: 'PostgreSQL движок позволяет `SELECT` и `INSERT` запроса на данные,'
title: 'Движок таблиц PostgreSQL'
doc_type: guide
---
The PostgreSQL engine позволяет выполнять запросы `SELECT` и `INSERT` к данным, хранящимся на удаленном сервере PostgreSQL.

:::note
В настоящее время поддерживаются только версии PostgreSQL 12 и выше.
:::

:::note
Пользователям ClickHouse Cloud рекомендуется использовать [ClickPipes](/integrations/clickpipes) для потоковой передачи данных из Postgres в ClickHouse. Это нативно поддерживает высокопроизводительную вставку, обеспечивая при этом разделение обязанностей с возможностью масштабирования приема данных и ресурсов кластера независимо.
:::

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 type1 [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 type2 [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = PostgreSQL({host:port, database, table, user, password[, schema, [, on_conflict]] | named_collection[, option=value [,..]]})
```

Смотрите подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

Структура таблицы может отличаться от структуры оригинальной таблицы PostgreSQL:

- Имена колонок должны совпадать с оригинальными именами колонок в таблице PostgreSQL, но вы можете использовать только часть из этих колонок и в любом порядке.
- Типы колонок могут отличаться от тех, что в оригинальной таблице PostgreSQL. ClickHouse пытается [преобразовать](../../../engines/database-engines/postgresql.md#data_types-support) значения в типы данных ClickHouse.
- Параметр [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) определяет, как обрабатывать Nullable колонки. Значение по умолчанию: 1. Если 0, табличная функция не создает Nullable колонки и вставляет значения по умолчанию вместо null. Это также применяется к NULL значениям внутри массивов.

**Параметры движка**

- `host:port` — адрес сервера PostgreSQL.
- `database` — имя удаленной базы данных.
- `table` — имя удаленной таблицы.
- `user` — пользователь PostgreSQL.
- `password` — пароль пользователя.
- `schema` — нестандартная схема таблицы. Необязательно.
- `on_conflict` — стратегия разрешения конфликтов. Пример: `ON CONFLICT DO NOTHING`. Необязательно. Обратите внимание: добавление этой опции сделает вставку менее эффективной.

Рекомендуется использовать [именованные коллекции](/operations/named-collections.md) (доступны с версии 21.11) для производственной среды. Вот пример:

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

Некоторые параметры могут быть переопределены аргументами ключ-значение:
```sql
SELECT * FROM postgresql(postgres_creds, table='table1');
```

## Подробности реализации {#implementation-details}

Запросы `SELECT` на стороне PostgreSQL выполняются как `COPY (SELECT ...) TO STDOUT` внутри транзакции PostgreSQL только для чтения с коммитом после каждого запроса `SELECT`.

Простые условия `WHERE`, такие как `=`, `!=`, `>`, `>=`, `<`, `<=` и `IN`, выполняются на сервере PostgreSQL.

Все соединения, агрегации, сортировки, условия `IN [ array ]` и ограничение выборки `LIMIT` выполняются в ClickHouse только после завершения запроса к PostgreSQL.

Запросы `INSERT` на стороне PostgreSQL выполняются как `COPY "table_name" (field1, field2, ... fieldN) FROM STDIN` внутри транзакции PostgreSQL с автоматическим коммитом после каждого оператора `INSERT`.

Типы `Array` в PostgreSQL преобразуются в массивы ClickHouse.

:::note
Будьте осторожны - в PostgreSQL данные массива, созданные как `type_name[]`, могут содержать многомерные массивы разных размеров в разных строках одной и той же колонки. Но в ClickHouse разрешено иметь только многомерные массивы с одинаковым количеством измерений во всех строках одной и той же колонки.
:::

Поддерживаются несколько реплик, которые должны быть перечислены через `|`. Например:

```sql
CREATE TABLE test_replicas (id UInt32, name String) ENGINE = PostgreSQL(`postgres{2|3|4}:5432`, 'clickhouse', 'test_replicas', 'postgres', 'mysecretpassword');
```

Поддерживается приоритет реплик для источника словаря PostgreSQL. Чем больше число в карте, тем меньше приоритет. Самый высокий приоритет — `0`.

В приведенном ниже примере реплика `example01-1` имеет наивысший приоритет:

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

### Создание таблицы в ClickHouse и подключение к таблице PostgreSQL, созданной выше {#creating-table-in-clickhouse-and-connecting-to--postgresql-table-created-above}

В этом примере используется [движок таблиц PostgreSQL](/engines/table-engines/integrations/postgresql.md) для подключения таблицы ClickHouse к таблице PostgreSQL и использования как операторов SELECT, так и INSERT к базе данных PostgreSQL:

```sql
CREATE TABLE default.postgresql_table
(
    `float_nullable` Nullable(Float32),
    `str` String,
    `int_id` Int32
)
ENGINE = PostgreSQL('localhost:5432', 'public', 'test', 'postgres_user', 'postgres_password');
```

### Вставка первоначальных данных из таблицы PostgreSQL в таблицу ClickHouse, с использованием запроса SELECT {#inserting-initial-data-from-postgresql-table-into-clickhouse-table-using-a-select-query}

Табличная функция [postgresql](/sql-reference/table-functions/postgresql.md) копирует данные из PostgreSQL в ClickHouse, что часто используется для улучшения производительности запросов данных путем их запроса или анализа в ClickHouse, а не в PostgreSQL, или также может использоваться для миграции данных из PostgreSQL в ClickHouse. Поскольку мы будем копировать данные из PostgreSQL в ClickHouse, мы используем движок таблиц MergeTree в ClickHouse и называем его postgresql_copy:

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

### Вставка инкрементальных данных из таблицы PostgreSQL в таблицу ClickHouse {#inserting-incremental-data-from-postgresql-table-into-clickhouse-table}

Если затем выполняется постоянная синхронизация между таблицей PostgreSQL и таблицей ClickHouse после первоначальной вставки, вы можете использовать условие WHERE в ClickHouse для вставки только данных, добавленных в PostgreSQL на основе отметки времени или уникального идентификатора последовательности.

Это потребует отслеживания максимального ID или отметки времени, ранее добавленного, например:

```sql
SELECT max(`int_id`) AS maxIntID FROM default.postgresql_copy;
```

Затем вставка значений из таблицы PostgreSQL, превышающих максимум

```sql
INSERT INTO default.postgresql_copy
SELECT * FROM postgresql('localhost:5432', 'public', 'test', 'postges_user', 'postgres_password');
WHERE int_id > maxIntID;
```

### Выборка данных из результирующей таблицы ClickHouse {#selecting-data-from-the-resulting-clickhouse-table}

```sql
SELECT * FROM postgresql_copy WHERE str IN ('test');
```

```text
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

- [Табличная функция `postgresql`](../../../sql-reference/table-functions/postgresql.md)
- [Использование PostgreSQL в качестве источника словаря](/sql-reference/dictionaries#mysql)

## Связанный контент {#related-content}

- Блог: [ClickHouse и PostgreSQL - идеальная пара для работы с данными - часть 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- Блог: [ClickHouse и PostgreSQL - идеальная пара для работы с данными - часть 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)