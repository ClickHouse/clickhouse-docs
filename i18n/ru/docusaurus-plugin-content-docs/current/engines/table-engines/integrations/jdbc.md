---
description: 'Позволяет ClickHouse подключаться к внешним базам данных через JDBC.'
sidebar_label: 'JDBC'
sidebar_position: 100
slug: /engines/table-engines/integrations/jdbc
title: 'Табличный движок JDBC'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Движок таблицы JDBC {#jdbc-table-engine}

<CloudNotSupportedBadge/>

:::note
clickhouse-jdbc-bridge содержит экспериментальный код и больше не поддерживается. Он может содержать проблемы с надежностью и уязвимости в области безопасности. Используйте его на свой страх и риск. 
ClickHouse рекомендует использовать встроенные табличные функции ClickHouse, которые являются более удачной альтернативой для сценариев разовых запросов (Postgres, MySQL, MongoDB и т. д.).
:::

Позволяет ClickHouse подключаться к внешним базам данных через [JDBC](https://en.wikipedia.org/wiki/Java_Database_Connectivity).

Для реализации JDBC-подключения ClickHouse использует отдельную программу [clickhouse-jdbc-bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge), которая должна работать как демон.

Этот движок поддерживает тип данных [Nullable](../../../sql-reference/data-types/nullable.md).

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    columns list...
)
ENGINE = JDBC(datasource, external_database, external_table)
```

**Параметры движка**

* `datasource` — URI или имя внешней СУБД.

  Формат URI: `jdbc:<driver_name>://<host_name>:<port>/?user=<username>&password=<password>`.
  Пример для MySQL: `jdbc:mysql://localhost:3306/?user=root&password=root`.

* `external_database` — имя базы данных во внешней СУБД или, вместо этого, явно заданная схема таблицы (см. примеры).

* `external_table` — имя таблицы во внешней базе данных или оператор SELECT вида `select * from table1 where column1=1`.

* Эти параметры также можно передавать с использованием [именованных коллекций](operations/named-collections.md).

## Пример использования {#usage-example}

Создание таблицы на сервере MySQL, подключившись к нему напрямую через консольный клиент:

```text
mysql> CREATE TABLE `test`.`test` (
    ->   `int_id` INT NOT NULL AUTO_INCREMENT,
    ->   `int_nullable` INT NULL DEFAULT NULL,
    ->   `float` FLOAT NOT NULL,
    ->   `float_nullable` FLOAT NULL DEFAULT NULL,
    ->   PRIMARY KEY (`int_id`));
Query OK, 0 rows affected (0,09 sec)

mysql> insert into test (`int_id`, `float`) VALUES (1,2);
Query OK, 1 row affected (0,00 sec)

mysql> select * from test;
+------+----------+-----+----------+
| int_id | int_nullable | float | float_nullable |
+------+----------+-----+----------+
|      1 |         NULL |     2 |           NULL |
+------+----------+-----+----------+
1 row in set (0,00 sec)
```

Создание таблицы на сервере ClickHouse и выборка данных из неё:

```sql
CREATE TABLE jdbc_table
(
    `int_id` Int32,
    `int_nullable` Nullable(Int32),
    `float` Float32,
    `float_nullable` Nullable(Float32)
)
ENGINE JDBC('jdbc:mysql://localhost:3306/?user=root&password=root', 'test', 'test')
```

```sql
SELECT *
FROM jdbc_table
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─float_nullable─┐
│      1 │         ᴺᵁᴸᴸ │     2 │           ᴺᵁᴸᴸ │
└────────┴──────────────┴───────┴────────────────┘
```

```sql
INSERT INTO jdbc_table(`int_id`, `float`)
SELECT toInt32(number), toFloat32(number * 1.0)
FROM system.numbers
```

## См. также {#see-also}

- [табличная функция JDBC](../../../sql-reference/table-functions/jdbc.md).
