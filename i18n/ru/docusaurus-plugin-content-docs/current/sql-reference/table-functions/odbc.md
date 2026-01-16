---
description: 'Возвращает таблицу, подключенную через ODBC.'
sidebar_label: 'odbc'
sidebar_position: 150
slug: /sql-reference/table-functions/odbc
title: 'odbc'
doc_type: 'reference'
---

# Табличная функция ODBC \{#odbc-table-function\}

Возвращает таблицу, подключённую через [ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity).

## Синтаксис \{#syntax\}

```sql
odbc(datasource, external_database, external_table)
odbc(datasource, external_table)
odbc(named_collection)
```

## Аргументы \{#arguments\}

| Аргумент            | Описание                                                            |
|---------------------|------------------------------------------------------------------------|
| `datasource` | Имя секции с настройками подключения в файле `odbc.ini`. |
| `external_database` | Имя базы данных во внешней СУБД.                                |
| `external_table`    | Имя таблицы в `external_database`.                            |

Эти параметры также можно передавать с помощью [именованных коллекций](operations/named-collections.md).

Для безопасной организации ODBC-подключений ClickHouse использует отдельную программу `clickhouse-odbc-bridge`. Если ODBC-драйвер загружается напрямую из `clickhouse-server`, проблемы драйвера могут привести к сбою сервера ClickHouse. ClickHouse автоматически запускает `clickhouse-odbc-bridge`, когда это требуется. Программа ODBC bridge устанавливается из того же пакета, что и `clickhouse-server`.

Поля со значениями `NULL` из внешней таблицы преобразуются в значения по умолчанию для базового типа данных. Например, если поле удалённой таблицы MySQL имеет тип `INT NULL`, оно преобразуется в 0 (значение по умолчанию для типа данных ClickHouse `Int32`).

## Пример использования \{#usage-example\}

**Получение данных из локального экземпляра MySQL через ODBC**

Этот пример протестирован в Ubuntu Linux 18.04 и MySQL Server 5.7.

Убедитесь, что установлены unixODBC и MySQL Connector.

По умолчанию (если установлен из пакетов) ClickHouse запускается от имени пользователя `clickhouse`. Поэтому необходимо создать и настроить этого пользователя на сервере MySQL.

```bash
$ sudo mysql
```

```sql
mysql> CREATE USER 'clickhouse'@'localhost' IDENTIFIED BY 'clickhouse';
mysql> GRANT ALL PRIVILEGES ON *.* TO 'clickhouse'@'clickhouse' WITH GRANT OPTION;
```

Затем настройте подключение в `/etc/odbc.ini`.

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

Вы можете проверить подключение с помощью утилиты `isql`, входящей в состав unixODBC.

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

## См. также \{#see-also\}

- [Словари ODBC](/sql-reference/dictionaries#dbms)
- [Табличный движок ODBC](/engines/table-engines/integrations/odbc).
