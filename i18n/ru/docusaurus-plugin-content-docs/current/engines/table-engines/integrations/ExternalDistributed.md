---
description: 'Движок `ExternalDistributed` позволяет выполнять запросы `SELECT` к данным, хранящимся на удаленных серверах MySQL или PostgreSQL. Принимает движки MySQL или PostgreSQL в качестве аргумента, что делает возможным шардирование.'
sidebar_label: 'ExternalDistributed'
sidebar_position: 55
slug: /engines/table-engines/integrations/ExternalDistributed
title: 'ExternalDistributed'
---

Движок `ExternalDistributed` позволяет выполнять запросы `SELECT` к данным, хранящимся на удаленных серверах MySQL или PostgreSQL. Принимает [MySQL](../../../engines/table-engines/integrations/mysql.md) или [PostgreSQL](../../../engines/table-engines/integrations/postgresql.md) в качестве аргумента, что делает возможным шардирование.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = ExternalDistributed('engine', 'host:port', 'database', 'table', 'user', 'password');
```

Смотрите детальное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

Структура таблицы может отличаться от оригинальной структуры таблицы:

- Имена столбцов должны совпадать с именами в оригинальной таблице, но вы можете использовать только некоторые из этих столбцов и в любом порядке.
- Типы столбцов могут отличаться от тех, что в оригинальной таблице. ClickHouse пытается [преобразовать](/sql-reference/functions/type-conversion-functions#cast) значения в типы данных ClickHouse.

**Параметры движка**

- `engine` — Движок таблицы `MySQL` или `PostgreSQL`.
- `host:port` — Адрес сервера MySQL или PostgreSQL.
- `database` — Имя удаленной базы данных.
- `table` — Имя удаленной таблицы.
- `user` — Имя пользователя.
- `password` — Пароль пользователя.

## Подробности реализации {#implementation-details}

Поддерживает несколько реплик, которые должны быть перечислены через `|`, а шардирование должно быть перечислено через `,`. Например:

```sql
CREATE TABLE test_shards (id UInt32, name String, age UInt32, money UInt32) ENGINE = ExternalDistributed('MySQL', `mysql{1|2}:3306,mysql{3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

При указании реплик одна из доступных реплик выбирается для каждой шард при чтении. Если подключение не удается, выбирается следующая реплика, и так продолжается со всеми репликами. Если попытка подключения не удается для всех реплик, попытка повторяется тем же образом несколько раз.

Вы можете указать любое количество шард и любое количество реплик для каждой шард.

**Смотрите также**

- [MySQL table engine](../../../engines/table-engines/integrations/mysql.md)
- [PostgreSQL table engine](../../../engines/table-engines/integrations/postgresql.md)
- [Distributed table engine](../../../engines/table-engines/special/distributed.md)
