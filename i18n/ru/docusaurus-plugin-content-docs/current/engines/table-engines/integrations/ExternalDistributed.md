---
slug: '/engines/table-engines/integrations/ExternalDistributed'
sidebar_label: ExternalDistributed
sidebar_position: 55
description: 'Двигатель `ExternalDistributed` позволяет выполнять `SELECT` запросы'
title: ExternalDistributed
doc_type: reference
---
Движок `ExternalDistributed` позволяет выполнять запросы `SELECT` к данным, которые хранятся на удалённых серверах MySQL или PostgreSQL. Принимает в качестве аргумента движки [MySQL](../../../engines/table-engines/integrations/mysql.md) или [PostgreSQL](../../../engines/table-engines/integrations/postgresql.md), поэтому возможна шардинг.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = ExternalDistributed('engine', 'host:port', 'database', 'table', 'user', 'password');
```

Смотрите подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

Структура таблицы может отличаться от исходной структуры таблицы:

- Имена колонок должны совпадать с именами в исходной таблице, но вы можете использовать только некоторые из этих колонок и в любом порядке.
- Типы колонок могут отличаться от тех, что в исходной таблице. ClickHouse пытается [привести](/sql-reference/functions/type-conversion-functions#cast) значения к типам данных ClickHouse.

**Параметры движка**

- `engine` — Движок таблицы `MySQL` или `PostgreSQL`.
- `host:port` — Адрес сервера MySQL или PostgreSQL.
- `database` — Имя удалённой базы данных.
- `table` — Имя удалённой таблицы.
- `user` — Имя пользователя.
- `password` — Пароль пользователя.

## Подробности реализации {#implementation-details}

Поддерживает несколько реплик, которые должны быть перечислены через `|`, а шардов — через `,`. Например:

```sql
CREATE TABLE test_shards (id UInt32, name String, age UInt32, money UInt32) ENGINE = ExternalDistributed('MySQL', `mysql{1|2}:3306,mysql{3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

При указании реплик одна из доступных реплик выбирается для каждого шардирования при чтении. Если соединение не удаётся, выбирается следующая реплика, и так далее для всех реплик. Если попытка соединения не удаётся для всех реплик, попытка повторяется тем же образом несколько раз.

Вы можете указать любое количество шардов и любое количество реплик для каждого шарда.

**Смотрите также**

- [Движок таблицы MySQL](../../../engines/table-engines/integrations/mysql.md)
- [Движок таблицы PostgreSQL](../../../engines/table-engines/integrations/postgresql.md)
- [Движок распределённой таблицы](../../../engines/table-engines/special/distributed.md)