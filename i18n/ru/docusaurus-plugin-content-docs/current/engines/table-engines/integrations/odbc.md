---
description: 'Позволяет ClickHouse подключаться к внешним базам данных через ODBC.'
sidebar_label: 'ODBC'
sidebar_position: 150
slug: /engines/table-engines/integrations/odbc
title: 'Табличный движок ODBC'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Табличный движок ODBC

<CloudNotSupportedBadge/>

Позволяет ClickHouse подключаться к внешним базам данных через [ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity).

Для безопасного использования соединений по ODBC ClickHouse использует отдельную программу `clickhouse-odbc-bridge`. Если ODBC-драйвер загружается непосредственно из `clickhouse-server`, проблемы драйвера могут привести к сбою сервера ClickHouse. ClickHouse автоматически запускает `clickhouse-odbc-bridge`, когда это требуется. Программа ODBC bridge устанавливается из того же пакета, что и `clickhouse-server`.

Этот движок поддерживает тип данных [Nullable](../../../sql-reference/data-types/nullable.md).



## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1],
    name2 [type2],
    ...
)
ENGINE = ODBC(datasource, external_database, external_table)
```

Подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table) см. в соответствующем разделе.

Структура таблицы может отличаться от структуры исходной таблицы:

- Имена столбцов должны совпадать с именами в исходной таблице, но можно использовать только некоторые из этих столбцов в любом порядке.
- Типы столбцов могут отличаться от типов в исходной таблице. ClickHouse пытается [привести](/sql-reference/functions/type-conversion-functions#cast) значения к типам данных ClickHouse.
- Настройка [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) определяет способ обработки столбцов Nullable. Значение по умолчанию: 1. Если установлено значение 0, табличная функция не создает столбцы Nullable и вставляет значения по умолчанию вместо null. Это также применимо к значениям NULL внутри массивов.

**Параметры движка**

- `datasource` — имя секции с настройками подключения в файле `odbc.ini`.
- `external_database` — имя базы данных во внешней СУБД.
- `external_table` — имя таблицы в `external_database`.

Эти параметры также можно передать с помощью [именованных коллекций](operations/named-collections.md).


## Пример использования {#usage-example}

**Получение данных из локальной установки MySQL через ODBC**

Этот пример проверен для Ubuntu Linux 18.04 и MySQL server 5.7.

Убедитесь, что установлены unixODBC и MySQL Connector.

По умолчанию (при установке из пакетов) ClickHouse запускается от имени пользователя `clickhouse`. Поэтому необходимо создать и настроить этого пользователя на сервере MySQL.

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'localhost' WITH GRANT OPTION;
```

Затем настройте соединение в `/etc/odbc.ini`.

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

Проверить соединение можно с помощью утилиты `isql` из установки unixODBC.

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

Таблица в ClickHouse, получающая данные из таблицы MySQL:

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

- [ODBC-словари](/sql-reference/dictionaries#mysql)
- [Табличная функция ODBC](../../../sql-reference/table-functions/odbc.md)
