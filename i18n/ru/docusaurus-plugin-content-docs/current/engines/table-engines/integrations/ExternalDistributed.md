---
slug: /engines/table-engines/integrations/ExternalDistributed
sidebar_position: 55
sidebar_label: ExternalDistributed
title: ExternalDistributed
description: "Движок `ExternalDistributed` позволяет выполнять `SELECT` запросы к данным, которые хранятся на удаленных серверах MySQL или PostgreSQL. Принимает в качестве аргументов движки MySQL или PostgreSQL, поэтому возможен шардинг."
---

Движок `ExternalDistributed` позволяет выполнять `SELECT` запросы к данным, которые хранятся на удаленных серверах MySQL или PostgreSQL. Принимает [MySQL](../../../engines/table-engines/integrations/mysql.md) или [PostgreSQL](../../../engines/table-engines/integrations/postgresql.md) движки в качестве аргумента, поэтому возможен шардинг.

## Создание таблицы {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = ExternalDistributed('engine', 'host:port', 'database', 'table', 'user', 'password');
```

Смотрите подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

Структура таблицы может отличаться от структуры исходной таблицы:

- Имена колонок должны совпадать с именами в исходной таблице, но вы можете использовать только некоторые из этих колонок и в любом порядке.
- Типы колонок могут отличаться от тех, что в исходной таблице. ClickHouse пытается [преобразовать](/sql-reference/functions/type-conversion-functions#cast) значения в типы данных ClickHouse.

**Параметры движка**

- `engine` — Движок таблицы `MySQL` или `PostgreSQL`.
- `host:port` — Адрес сервера MySQL или PostgreSQL.
- `database` — Имя удаленной базы данных.
- `table` — Имя удаленной таблицы.
- `user` — Имя пользователя.
- `password` — Пароль пользователя.

## Подробности реализации {#implementation-details}

Поддерживает несколько реплик, которые должны перечисляться через `|`, а шарды — через `,`. Например:

```sql
CREATE TABLE test_shards (id UInt32, name String, age UInt32, money UInt32) ENGINE = ExternalDistributed('MySQL', `mysql{1|2}:3306,mysql{3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

При указании реплик для каждого из шардов выбирается одна из доступных реплик при чтении. Если соединение не удается установить, выбирается следующая реплика и так далее для всех реплик. Если попытка подключения не удалась для всех реплик, попытка повторяется тем же образом несколько раз.

Вы можете указать любое количество шардов и любое количество реплик для каждого шарда.

**Смотрите также**

- [MySQL table engine](../../../engines/table-engines/integrations/mysql.md)
- [PostgreSQL table engine](../../../engines/table-engines/integrations/postgresql.md)
- [Distributed table engine](../../../engines/table-engines/special/distributed.md)
