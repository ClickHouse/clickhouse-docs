---
slug: '/engines/database-engines/mysql'
sidebar_label: MySQL
sidebar_position: 50
description: 'Позволяет подключаться к DATABASE на удаленном сервере MySQL и выполнять'
title: MySQL
doc_type: reference
---
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Движок базы данных MySQL

<CloudNotSupportedBadge />

Позволяет подключаться к базам данных на удаленном сервере MySQL и выполнять `INSERT` и `SELECT` запросы для обмена данными между ClickHouse и MySQL.

Движок базы данных `MySQL` переводит запросы на сервер MySQL, так что вы можете выполнять такие операции, как `SHOW TABLES` или `SHOW CREATE TABLE`.

Вы не можете выполнять следующие запросы:

- `RENAME`
- `CREATE TABLE`
- `ALTER`

## Создание базы данных {#creating-a-database}

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MySQL('host:port', ['database' | database], 'user', 'password')
```

**Параметры движка**

- `host:port` — адрес сервера MySQL.
- `database` — имя удаленной базы данных.
- `user` — пользователь MySQL.
- `password` — пароль пользователя.

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

Все другие типы данных MySQL преобразуются в [String](../../sql-reference/data-types/string.md).

Поддерживается [Nullable](../../sql-reference/data-types/nullable.md).

## Поддержка глобальных переменных {#global-variables-support}

Для лучшей совместимости вы можете адресовать глобальные переменные в стиле MySQL, как `@@identifier`.

Поддерживаются следующие переменные:
- `version`
- `max_allowed_packet`

:::note
На данный момент эти переменные являются заглушками и не соответствуют ничего.
:::

Пример:

```sql
SELECT @@version;
```

## Примеры использования {#examples-of-use}

Таблица в MySQL:

```text
mysql> USE test;
Database changed

mysql> CREATE TABLE `mysql_table` (
    ->   `int_id` INT NOT NULL AUTO_INCREMENT,
    ->   `float` FLOAT NOT NULL,
    ->   PRIMARY KEY (`int_id`));
Query OK, 0 rows affected (0,09 sec)

mysql> insert into mysql_table (`int_id`, `float`) VALUES (1,2);
Query OK, 1 row affected (0,00 sec)

mysql> select * from mysql_table;
+------+-----+
| int_id | value |
+------+-----+
|      1 |     2 |
+------+-----+
1 row in set (0,00 sec)
```

База данных в ClickHouse, обменивающаяся данными с сервером MySQL:

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