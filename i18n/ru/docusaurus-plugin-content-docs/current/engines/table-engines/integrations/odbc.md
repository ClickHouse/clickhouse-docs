---
description: 'Позволяет ClickHouse подключаться к внешним базам данных через ODBC.'
sidebar_label: 'ODBC'
sidebar_position: 150
slug: /engines/table-engines/integrations/odbc
title: 'ODBC'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ODBC

<CloudNotSupportedBadge/>

Позволяет ClickHouse подключаться к внешним базам данных через [ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity).

Для безопасной реализации ODBC подключений ClickHouse использует отдельную программу `clickhouse-odbc-bridge`. Если ODBC драйвер загружается напрямую из `clickhouse-server`, проблемы с драйвером могут привести к сбою сервера ClickHouse. ClickHouse автоматически запускает `clickhouse-odbc-bridge`, когда это необходимо. Программа ODBC моста устанавливается из того же пакета, что и `clickhouse-server`.

Этот движок поддерживает [Nullable](../../../sql-reference/data-types/nullable.md) тип данных.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1],
    name2 [type2],
    ...
)
ENGINE = ODBC(connection_settings, external_database, external_table)
```

Смотрите подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

Структура таблицы может отличаться от структуры исходной таблицы:

- Имена колонок должны быть такими же, как в исходной таблице, но вы можете использовать только некоторые из этих колонок и в любом порядке.
- Типы колонок могут отличаться от типов в исходной таблице. ClickHouse пытается [преобразовать](/sql-reference/functions/type-conversion-functions#cast) значения в типы данных ClickHouse.
- Настройка [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) определяет, как обрабатывать Nullable колонки. Значение по умолчанию: 1. Если 0, табличная функция не создает Nullable колонки и вставляет значения по умолчанию вместо null. Это также применимо к значениям NULL внутри массивов.

**Параметры движка**

- `connection_settings` — Имя секции с настройками подключения в файле `odbc.ini`.
- `external_database` — Имя базы данных во внешней СУБД.
- `external_table` — Имя таблицы в `external_database`.

## Пример использования {#usage-example}

**Получение данных из локальной установки MySQL через ODBC**

Этот пример проверен на Ubuntu Linux 18.04 и MySQL сервере 5.7.

Убедитесь, что unixODBC и MySQL Connector установлены.

По умолчанию (если установлено из пакетов) ClickHouse запускается как пользователь `clickhouse`. Поэтому вам нужно создать и настроить этого пользователя в MySQL сервере.

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'localhost' WITH GRANT OPTION;
```

Затем настройте подключение в `/etc/odbc.ini`.

```bash
$ cat /etc/odbc.ini
[mysqlconn]
DRIVER = /usr/local/lib/libmyodbc5w.so
SERVER = 127.0.0.1
PORT = 3306
DATABASE = test
USER = clickhouse
PASSWORD = clickhouse
```

Вы можете проверить подключение с помощью утилиты `isql` из установки unixODBC.

```bash
$ isql -v mysqlconn
+-------------------------+
| Connected!                            |
|                                       |
...
```

Таблица в MySQL:

```text
mysql> CREATE DATABASE test;
Query OK, 1 row affected (0,01 sec)

mysql> CREATE TABLE `test`.`test` (
    ->   `int_id` INT NOT NULL AUTO_INCREMENT,
    ->   `int_nullable` INT NULL DEFAULT NULL,
    ->   `float` FLOAT NOT NULL,
    ->   `float_nullable` FLOAT NULL DEFAULT NULL,
    ->   PRIMARY KEY (`int_id`));
Query OK, 0 rows affected (0,09 sec)

mysql> insert into test.test (`int_id`, `float`) VALUES (1,2);
Query OK, 1 row affected (0,00 sec)

mysql> select * from test.test;
+------+----------+-----+----------+
| int_id | int_nullable | float | float_nullable |
+------+----------+-----+----------+
|      1 |         NULL |     2 |           NULL |
+------+----------+-----+----------+
1 row in set (0,00 sec)
```

Таблица в ClickHouse, получение данных из таблицы MySQL:

```sql
CREATE TABLE odbc_t
(
    `int_id` Int32,
    `float_nullable` Nullable(Float32)
)
ENGINE = ODBC('DSN=mysqlconn', 'test', 'test')
```

```sql
SELECT * FROM odbc_t
```

```text
┌─int_id─┬─float_nullable─┐
│      1 │           ᴺᵁᴸᴸ │
└────────┴────────────────┘
```

## См. также {#see-also}

- [ODBC dictionaries](/sql-reference/dictionaries#mysql)
- [ODBC table function](../../../sql-reference/table-functions/odbc.md)
