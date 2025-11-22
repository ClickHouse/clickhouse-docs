---
description: 'Движок `ExternalDistributed` позволяет выполнять запросы `SELECT`
  к данным, хранящимся на удалённых серверах MySQL или PostgreSQL. Принимает
  в качестве аргумента движки MySQL или PostgreSQL, что позволяет выполнять шардирование.'
sidebar_label: 'ExternalDistributed'
sidebar_position: 55
slug: /engines/table-engines/integrations/ExternalDistributed
title: 'Движок таблицы ExternalDistributed'
doc_type: 'reference'
---



# Движок таблицы ExternalDistributed

Движок `ExternalDistributed` позволяет выполнять запросы `SELECT` к данным, которые хранятся на удалённых серверах с MySQL или PostgreSQL. Принимает в качестве аргумента движок [MySQL](../../../engines/table-engines/integrations/mysql.md) или [PostgreSQL](../../../engines/table-engines/integrations/postgresql.md), что позволяет использовать шардинг.



## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = ExternalDistributed('engine', 'host:port', 'database', 'table', 'user', 'password');
```

Подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

Структура таблицы может отличаться от структуры исходной таблицы:

- Имена столбцов должны совпадать с именами в исходной таблице, но можно использовать только некоторые из этих столбцов и в любом порядке.
- Типы столбцов могут отличаться от типов в исходной таблице. ClickHouse пытается [привести](/sql-reference/functions/type-conversion-functions#cast) значения к типам данных ClickHouse.

**Параметры движка**

- `engine` — движок таблицы `MySQL` или `PostgreSQL`.
- `host:port` — адрес сервера MySQL или PostgreSQL.
- `database` — имя удалённой базы данных.
- `table` — имя удалённой таблицы.
- `user` — имя пользователя.
- `password` — пароль пользователя.


## Детали реализации {#implementation-details}

Поддерживает несколько реплик, которые должны быть перечислены через `|`, и шарды, которые должны быть перечислены через `,`. Например:

```sql
CREATE TABLE test_shards (id UInt32, name String, age UInt32, money UInt32) ENGINE = ExternalDistributed('MySQL', `mysql{1|2}:3306,mysql{3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

При указании реплик для каждого шарда при чтении выбирается одна из доступных реплик. Если соединение не удается установить, выбирается следующая реплика, и так далее для всех реплик. Если попытка соединения не удается для всех реплик, попытка повторяется таким же образом несколько раз.

Можно указать любое количество шардов и любое количество реплик для каждого шарда.

**См. также**

- [Движок таблиц MySQL](../../../engines/table-engines/integrations/mysql.md)
- [Движок таблиц PostgreSQL](../../../engines/table-engines/integrations/postgresql.md)
- [Движок таблиц Distributed](../../../engines/table-engines/special/distributed.md)
