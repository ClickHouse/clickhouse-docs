---
description: 'Движок `ExternalDistributed` позволяет выполнять запросы `SELECT`
  к данным, которые хранятся на удалённых серверах MySQL или PostgreSQL. Использует
  табличные движки MySQL или PostgreSQL в качестве аргумента, что позволяет реализовать сегментацию данных.'
sidebar_label: 'ExternalDistributed'
sidebar_position: 55
slug: /engines/table-engines/integrations/ExternalDistributed
title: 'Табличный движок ExternalDistributed'
doc_type: 'reference'
---

# Движок таблицы ExternalDistributed \{#externaldistributed-table-engine\}

Движок `ExternalDistributed` позволяет выполнять запросы `SELECT` к данным, которые хранятся на удалённых серверах с MySQL или PostgreSQL. Принимает в качестве аргумента движки [MySQL](../../../engines/table-engines/integrations/mysql.md) или [PostgreSQL](../../../engines/table-engines/integrations/postgresql.md), поэтому возможен шардинг.

## Создание таблицы \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = ExternalDistributed('engine', 'host:port', 'database', 'table', 'user', 'password');
```

См. подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

Структура таблицы может отличаться от структуры исходной таблицы:

* Имена столбцов должны совпадать с именами в исходной таблице, но вы можете использовать только часть этих столбцов и в любом порядке.
* Типы столбцов могут отличаться от типов в исходной таблице. ClickHouse пытается [привести](/sql-reference/functions/type-conversion-functions#CAST) значения к типам данных ClickHouse.

**Параметры движка**

* `engine` — Движок таблицы `MySQL` или `PostgreSQL`.
* `host:port` — Адрес сервера MySQL или PostgreSQL.
* `database` — Имя удалённой базы данных.
* `table` — Имя удалённой таблицы.
* `user` — Имя пользователя.
* `password` — Пароль пользователя.


## Детали реализации \{#implementation-details\}

Поддерживаются несколько реплик; их необходимо перечислять через `|`, а шарды — через `,`. Например:

```sql
CREATE TABLE test_shards (id UInt32, name String, age UInt32, money UInt32) ENGINE = ExternalDistributed('MySQL', `mysql{1|2}:3306,mysql{3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

При задании реплик при чтении для каждого шарда выбирается одна из доступных реплик. Если подключение не удалось, выбирается следующая реплика и так далее для всех реплик. Если попытка подключения ко всем репликам завершилась неудачей, попытка повторяется тем же образом несколько раз.

Вы можете указывать любое количество шардов и любое количество реплик для каждого шарда.

**См. также**

* [Движок таблицы MySQL](../../../engines/table-engines/integrations/mysql.md)
* [Движок таблицы PostgreSQL](../../../engines/table-engines/integrations/postgresql.md)
* [Распределённый движок таблицы](../../../engines/table-engines/special/distributed.md)
