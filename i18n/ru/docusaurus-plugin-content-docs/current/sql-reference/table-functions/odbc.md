---
description: 'Возвращает таблицу, которая подключена через ODBC.'
sidebar_label: 'odbc'
sidebar_position: 150
slug: /sql-reference/table-functions/odbc
title: 'odbc'
---


# odbc Табличная Функция

Возвращает таблицу, которая подключена через [ODBC](https://en.wikipedia.org/wiki/Open_Database_Connectivity).

```sql
odbc(connection_settings, external_database, external_table)
```

Параметры:

- `connection_settings` — Имя секции с настройками подключения в файле `odbc.ini`.
- `external_database` — Имя базы данных в внешней СУБД.
- `external_table` — Имя таблицы в `external_database`.

Для безопасной реализации ODBC подключений ClickHouse использует отдельную программу `clickhouse-odbc-bridge`. Если драйвер ODBC загружается напрямую из `clickhouse-server`, проблемы с драйвером могут привести к падению сервера ClickHouse. ClickHouse автоматически запускает `clickhouse-odbc-bridge`, когда это требуется. Программа моста ODBC устанавливается из того же пакета, что и `clickhouse-server`.

Поля со значениями `NULL` из внешней таблицы преобразуются в значения по умолчанию для базового типа данных. Например, если поле таблицы MySQL имеет тип `INT NULL`, оно преобразуется в 0 (значение по умолчанию для типа данных ClickHouse `Int32`).

## Пример Использования {#usage-example}

**Получение данных из локальной установки MySQL через ODBC**

Этот пример проверен на Ubuntu Linux 18.04 и MySQL сервере 5.7.

Убедитесь, что установлен unixODBC и MySQL Connector.

По умолчанию (если установлен из пакетов) ClickHouse запускается как пользователь `clickhouse`. Поэтому вам нужно создать и настроить этого пользователя в сервере MySQL.

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

Вы можете проверить подключение, используя утилиту `isql` из установки unixODBC.

```bash
$ isql -v mysqlconn
+-------------------------+
| Подключено!                       |
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
Запрос выполнен, 0 строк затронуто (0,09 сек)

mysql> insert into test (`int_id`, `float`) VALUES (1,2);
Запрос выполнен, 1 строка затронута (0,00 сек)

mysql> select * from test;
+------+----------+-----+----------+
| int_id | int_nullable | float | float_nullable |
+------+----------+-----+----------+
|      1 |         NULL |     2 |           NULL |
+------+----------+-----+----------+
1 строка в наборе (0,00 сек)
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

## См. Также {#see-also}

- [ODBC словари](/sql-reference/dictionaries#dbms)
- [ODBC движок таблиц](/engines/table-engines/integrations/odbc).
