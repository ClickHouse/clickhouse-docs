---
slug: '/sql-reference/table-functions/odbc'
sidebar_label: odbc
sidebar_position: 150
description: 'Возвращает таблицу, которая подключена через ODBC.'
title: odbc
doc_type: reference
---
# odbc Табличная Функция

Возвращает таблицу, которая подключена через [ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity).

## Синтаксис {#syntax}

```sql
odbc(datasource, external_database, external_table)
odbc(datasource, external_table)
odbc(named_collection)
```

## Аргументы {#arguments}

| Аргумент            | Описание                                                                |
|---------------------|-------------------------------------------------------------------------|
| `datasource` | Имя секции с настройками подключения в файле `odbc.ini`.                |
| `external_database` | Имя базы данных во внешней СУБД.                                       |
| `external_table`    | Имя таблицы во `external_database`.                                     |

Эти параметры также могут быть переданы с использованием [именованных коллекций](operations/named-collections.md).

Для безопасной реализации ODBC подключений ClickHouse использует отдельную программу `clickhouse-odbc-bridge`. Если ODBC драйвер загружается напрямую из `clickhouse-server`, проблемы с драйвером могут привести к сбою сервера ClickHouse. ClickHouse автоматически запускает `clickhouse-odbc-bridge`, когда это требуется. Программа ODBC моста устанавливается из того же пакета, что и `clickhouse-server`.

Поля с `NULL` значениями из внешней таблицы преобразуются в значения по умолчанию для базового типа данных. Например, если поле таблицы MySQL на удаленном сервере имеет тип `INT NULL`, оно преобразуется в 0 (значение по умолчанию для типа данных ClickHouse `Int32`).

## Пример использования {#usage-example}

**Получение данных из локальной установки MySQL через ODBC**

Этот пример проверен на Ubuntu Linux 18.04 и MySQL сервере 5.7.

Убедитесь, что установлены unixODBC и MySQL Connector.

По умолчанию (если установлено из пакетов) ClickHouse запускается от имени пользователя `clickhouse`. Таким образом, вам нужно создать и настроить этого пользователя на сервере MySQL.

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'clickhouse' WITH GRANT OPTION;
```

Затем настройте соединение в `/etc/odbc.ini`.

```bash
$ cat /etc/odbc.ini
[mysqlconn]
DRIVER = /usr/local/lib/libmyodbc5w.so
SERVER = 127.0.0.1
PORT = 3306
DATABASE = test
USERNAME = clickhouse
PASSWORD = clickhouse
```

Вы можете проверить соединение, используя утилиту `isql` из установки unixODBC.

```bash
$ isql -v mysqlconn
+-------------------------+
| Connected!                            |
|                                       |
...
```

Таблица в MySQL:

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

Извлечение данных из таблицы MySQL в ClickHouse:

```sql
SELECT * FROM odbc('DSN=mysqlconn', 'test', 'test')
```

```text
┌─int_id─┬─int_nullable─┬─float─┬─float_nullable─┐
│      1 │            0 │     2 │              0 │
└────────┴──────────────┴───────┴────────────────┘
```

## См. также {#see-also}

- [ODBC словари](/sql-reference/dictionaries#dbms)
- [ODBC движок таблиц](/engines/table-engines/integrations/odbc).