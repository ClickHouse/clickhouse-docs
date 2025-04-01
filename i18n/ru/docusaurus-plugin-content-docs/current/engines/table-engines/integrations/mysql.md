---
description: 'Документация для движка таблиц MySQL'
sidebar_label: 'MySQL'
sidebar_position: 138
slug: /engines/table-engines/integrations/mysql
title: 'Движок MySQL позволяет выполнять запросы `SELECT` и `INSERT` к данным, 
  которые хранятся на удаленном MySQL сервере.'
---


# MySQL Table Engine

Движок MySQL позволяет выполнять запросы `SELECT` и `INSERT` к данным, которые хранятся на удаленном MySQL сервере.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
    ...
) ENGINE = MySQL({host:port, database, table, user, password[, replace_query, on_duplicate_clause] | named_collection[, option=value [,..]]})
SETTINGS
    [ connection_pool_size=16, ]
    [ connection_max_tries=3, ]
    [ connection_wait_timeout=5, ]
    [ connection_auto_close=true, ]
    [ connect_timeout=10, ]
    [ read_write_timeout=300 ]
;
```

Смотрите подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

Структура таблицы может отличаться от оригинальной структуры таблицы MySQL:

- Имена колонок должны совпадать с именами в оригинальной таблице MySQL, но вы можете использовать только некоторые из этих колонок и в любом порядке.
- Типы колонок могут отличаться от тех, что в оригинальной таблице MySQL. ClickHouse пытается [привести](../../../engines/database-engines/mysql.md#data_types-support) значения к типам данных ClickHouse.
- Настройка [external_table_functions_use_nulls](/operations/settings/settings#external_table_functions_use_nulls) определяет, как обрабатывать Nullable колонки. Значение по умолчанию: 1. Если 0, функция таблицы не создаёт Nullable колонки и вставляет значения по умолчанию вместо null. Это также применимо к NULL значениям внутри массивов.

:::note
Движок MySQL в настоящее время недоступен в сборках ClickHouse для MacOS ([issue](https://github.com/ClickHouse/ClickHouse/issues/21191))
:::

**Параметры движка**

- `host:port` — адрес сервера MySQL.
- `database` — имя удаленной базы данных.
- `table` — имя удаленной таблицы.
- `user` — пользователь MySQL.
- `password` — пароль пользователя.
- `replace_query` — флаг, который преобразует запросы `INSERT INTO` в `REPLACE INTO`. Если `replace_query=1`, запрос заменяется.
- `on_duplicate_clause` — выражение `ON DUPLICATE KEY on_duplicate_clause`, которое добавляется к запросу `INSERT`.
    Пример: `INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1`, где `on_duplicate_clause` это `UPDATE c2 = c2 + 1`. Смотрите [документацию MySQL](https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html), чтобы узнать, какое `on_duplicate_clause` вы можете использовать с `ON DUPLICATE KEY`.
    Чтобы указать `on_duplicate_clause`, нужно передать `0` параметру `replace_query`. Если вы одновременно передаете `replace_query = 1` и `on_duplicate_clause`, ClickHouse генерирует исключение.

Аргументы также могут быть переданы с использованием [именованных коллекций](/operations/named-collections.md). В этом случае `host` и `port` должны быть указаны отдельно. Этот подход рекомендуется для производственной среды.

Простые условия `WHERE`, такие как `=, !=, >, >=, <, <=`, выполняются на сервере MySQL.

Остальные условия и ограничение `LIMIT` выполняются в ClickHouse только после завершения запроса к MySQL.

Поддерживает несколько реплик, которые должны быть перечислены через `|`. Например:

```sql
CREATE TABLE test_replicas (id UInt32, name String, age UInt32, money UInt32) ENGINE = MySQL(`mysql{2|3|4}:3306`, 'clickhouse', 'test_replicas', 'root', 'clickhouse');
```

## Пример использования {#usage-example}

Создайте таблицу в MySQL:

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

Создайте таблицу в ClickHouse, используя обычные аргументы:

```sql
CREATE TABLE mysql_table
(
    `float_nullable` Nullable(Float32),
    `int_id` Int32
)
ENGINE = MySQL('localhost:3306', 'test', 'test', 'bayonet', '123')
```

Или используя [именованные коллекции](/operations/named-collections.md):

```sql
CREATE NAMED COLLECTION creds AS
        host = 'localhost',
        port = 3306,
        database = 'test',
        user = 'bayonet',
        password = '123';
CREATE TABLE mysql_table
(
    `float_nullable` Nullable(Float32),
    `int_id` Int32
)
ENGINE = MySQL(creds, table='test')
```

Извлечение данных из таблицы MySQL:

```sql
SELECT * FROM mysql_table
```

```text
┌─float_nullable─┬─int_id─┐
│           ᴺᵁᴸᴸ │      1 │
└────────────────┴────────┘
```

## Настройки {#mysql-settings}

Настройки по умолчанию не очень эффективны, так как они даже не повторно используют соединения. Эти настройки позволяют увеличить количество запросов, выполняемых сервером в секунду.

### connection_auto_close {#connection-auto-close}

Позволяет автоматически закрывать соединение после выполнения запроса, т.е. отключить повторное использование соединения.

Возможные значения:

- 1 — Авто-закрытие соединения разрешено, поэтому повторное использование соединения отключено
- 0 — Авто-закрытие соединения не разрешено, поэтому повторное использование соединения включено

Значение по умолчанию: `1`.

### connection_max_tries {#connection-max-tries}

Устанавливает количество попыток для пула с переключением на резервный сервер.

Возможные значения:

- Положительное целое число.
- 0 — Нет попыток для пула с переключением на резервный сервер.

Значение по умолчанию: `3`.

### connection_pool_size {#connection-pool-size}

Размер пула соединений (если все соединения используются, запрос будет ждать, пока какое-то соединение не будет освобождено).

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `16`.

### connection_wait_timeout {#connection-wait-timeout}

Тайм-аут (в секундах) для ожидания свободного соединения (в случае, если уже есть connection_pool_size активных соединений), 0 - не ждать.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `5`.

### connect_timeout {#connect-timeout}

Тайм-аут подключения (в секундах).

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `10`.

### read_write_timeout {#read-write-timeout}

Тайм-аут чтения/записи (в секундах).

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `300`.

## Дополнительно {#see-also}

- [Функция таблицы mysql](../../../sql-reference/table-functions/mysql.md)
- [Использование MySQL в качестве источника словаря](/sql-reference/dictionaries#mysql)
