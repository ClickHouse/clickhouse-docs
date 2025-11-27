---
description: 'Позволяет подключаться к базам данных на удалённом сервере MySQL и выполнять
  запросы `INSERT` и `SELECT` для обмена данными между ClickHouse и MySQL.'
sidebar_label: 'MySQL'
sidebar_position: 50
slug: /engines/database-engines/mysql
title: 'MySQL'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Движок базы данных MySQL

<CloudNotSupportedBadge />

Позволяет подключаться к базам данных на удалённом сервере MySQL и выполнять запросы `INSERT` и `SELECT` для обмена данными между ClickHouse и MySQL.

Движок базы данных `MySQL` транслирует запросы к серверу MySQL, чтобы вы могли выполнять операции, такие как `SHOW TABLES` или `SHOW CREATE TABLE`.

Нельзя выполнять следующие запросы:

- `RENAME`
- `CREATE TABLE`
- `ALTER`



## Создание базы данных

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MySQL('host:port', ['database' | database], 'user', 'password')
```

**Параметры движка**

* `host:port` — адрес сервера MySQL.
* `database` — имя удалённой базы данных.
* `user` — пользователь MySQL.
* `password` — пароль пользователя.


## Поддержка типов данных {#data_types-support}

| MySQL                            | ClickHouse                                                   |
|----------------------------------|--------------------------------------------------------------|
| UNSIGNED TINYINT                 | [UInt8](../../sql-reference/data-types/int-uint.md)          |
| TINYINT                          | [Int8](../../sql-reference/data-types/int-uint.md)           |
| UNSIGNED SMALLINT                | [UInt16](../../sql-reference/data-types/int-uint.md)         |
| SMALLINT                         | [Int16](../../sql-reference/data-types/int-uint.md)          |
| UNSIGNED INT, UNSIGNED MEDIUMINT | [UInt32](../../sql-reference/data-types/int-uint.md)         |
| INT, MEDIUMINT                   | [Int32](../../sql-reference/data-types/int-uint.md)          |
| UNSIGNED BIGINT                  | [UInt64](../../sql-reference/data-types/int-uint.md)         |
| BIGINT                           | [Int64](../../sql-reference/data-types/int-uint.md)          |
| FLOAT                            | [Float32](../../sql-reference/data-types/float.md)           |
| DOUBLE                           | [Float64](../../sql-reference/data-types/float.md)           |
| DATE                             | [Date](../../sql-reference/data-types/date.md)               |
| DATETIME, TIMESTAMP              | [DateTime](../../sql-reference/data-types/datetime.md)       |
| BINARY                           | [FixedString](../../sql-reference/data-types/fixedstring.md) |

Все остальные типы данных MySQL преобразуются в тип [String](../../sql-reference/data-types/string.md).

Поддерживается тип [Nullable](../../sql-reference/data-types/nullable.md).



## Поддержка глобальных переменных

Для лучшей совместимости вы можете обращаться к глобальным переменным в стиле MySQL — как к `@@identifier`.

Поддерживаются следующие переменные:

* `version`
* `max_allowed_packet`

:::note
В настоящее время эти переменные являются заглушками и ни с какими реальными настройками не связаны.
:::

Пример:

```sql
SELECT @@version;
```


## Примеры использования

Таблица в MySQL:

```text
mysql> USE test;
База данных изменена

mysql> CREATE TABLE `mysql_table` (
    ->   `int_id` INT NOT NULL AUTO_INCREMENT,
    ->   `float` FLOAT NOT NULL,
    ->   PRIMARY KEY (`int_id`));
Запрос выполнен, затронуто строк: 0 (0,09 сек.)

mysql> insert into mysql_table (`int_id`, `float`) VALUES (1,2);
Запрос выполнен, затронута 1 строка (0,00 сек.)

mysql> select * from mysql_table;
+------+-----+
| int_id | value |
+------+-----+
|      1 |     2 |
+------+-----+
Строк в результате: 1 (0,00 сек.)
```

База данных ClickHouse, обменивающаяся данными с сервером MySQL:

```sql
CREATE DATABASE mysql_db ENGINE = MySQL('localhost:3306', 'test', 'my_user', 'user_password') SETTINGS read_write_timeout=10000, connect_timeout=100;
```

```sql
SHOW DATABASES
```

```text
┌─name─────┐
│ default  │
│ mysql_db │
│ system   │
└──────────┘
```

```sql
SHOW TABLES FROM mysql_db
```

```text
┌─name─────────┐
│  mysql_table │
└──────────────┘
```

```sql
SELECT * FROM mysql_db.mysql_table
```

```text
┌─int_id─┬─value─┐
│      1 │     2 │
└────────┴───────┘
```

```sql
INSERT INTO mysql_db.mysql_table VALUES (3,4)
```

```sql
SELECT * FROM mysql_db.mysql_table
```

```text
┌─int_id─┬─value─┐
│      1 │     2 │
│      3 │     4 │
└────────┴───────┘
```
