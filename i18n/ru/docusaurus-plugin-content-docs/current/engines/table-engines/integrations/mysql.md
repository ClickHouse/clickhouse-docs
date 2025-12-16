---
description: 'Документация по табличному движку MySQL'
sidebar_label: 'MySQL'
sidebar_position: 138
slug: /engines/table-engines/integrations/mysql
title: 'Табличный движок MySQL'
doc_type: 'reference'
---

# Движок таблицы MySQL {#mysql-table-engine}

Движок MySQL позволяет выполнять запросы `SELECT` и `INSERT` к данным, которые хранятся на удалённом сервере MySQL.

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

См. подробное описание запроса [CREATE TABLE](/sql-reference/statements/create/table).

Структура таблицы может отличаться от исходной структуры таблицы MySQL:

* Имена столбцов должны совпадать с именами в исходной таблице MySQL, но вы можете использовать только некоторые из этих столбцов и в любом порядке.
* Типы столбцов могут отличаться от типов в исходной таблице MySQL. ClickHouse пытается [приводить](../../../engines/database-engines/mysql.md#data_types-support) значения к типам данных ClickHouse.
* Настройка [external&#95;table&#95;functions&#95;use&#95;nulls](/operations/settings/settings#external_table_functions_use_nulls) определяет, как обрабатывать столбцы типа Nullable. Значение по умолчанию: 1. Если 0, табличная функция не делает столбцы Nullable и вставляет значения по умолчанию вместо null. Это также применимо к значениям NULL внутри массивов.

**Параметры движка**

* `host:port` — адрес сервера MySQL.
* `database` — имя удалённой базы данных.
* `table` — имя удалённой таблицы.
* `user` — пользователь MySQL.
* `password` — пароль пользователя.
* `replace_query` — флаг, который преобразует запросы `INSERT INTO` в `REPLACE INTO`. Если `replace_query=1`, запрос подменяется.
* `on_duplicate_clause` — выражение `ON DUPLICATE KEY on_duplicate_clause`, которое добавляется к запросу `INSERT`.
  Пример: `INSERT INTO t (c1,c2) VALUES ('a', 2) ON DUPLICATE KEY UPDATE c2 = c2 + 1`, где `on_duplicate_clause` — это `UPDATE c2 = c2 + 1`. См. [документацию MySQL](https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html), чтобы узнать, какое значение `on_duplicate_clause` вы можете использовать с предложением `ON DUPLICATE KEY`.
  Чтобы указать `on_duplicate_clause`, необходимо передать `0` в параметр `replace_query`. Если одновременно переданы `replace_query = 1` и `on_duplicate_clause`, ClickHouse генерирует исключение.

Аргументы также можно передавать с помощью [именованных коллекций](/operations/named-collections.md). В этом случае `host` и `port` должны быть указаны отдельно. Такой подход рекомендуется для продакшн-среды.

Простые выражения `WHERE`, такие как `=, !=, >, >=, <, <=`, выполняются на сервере MySQL.

Остальные условия и ограничение выборки `LIMIT` выполняются в ClickHouse только после завершения запроса к MySQL.

Поддерживаются несколько реплик, которые должны быть перечислены через `|`. Например:

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

Получение данных из таблицы MySQL:

```sql
SELECT * FROM mysql_table
```

```text
┌─float_nullable─┬─int_id─┐
│           ᴺᵁᴸᴸ │      1 │
└────────────────┴────────┘
```

## Настройки {#mysql-settings}

Настройки по умолчанию не очень эффективны, поскольку соединения при этом даже не переиспользуются. Эти настройки позволяют увеличить число запросов, выполняемых сервером в секунду.

### `connection_auto_close` {#connection-auto-close}

Позволяет автоматически закрывать соединение после выполнения запроса, то есть отключать повторное использование соединения.

Возможные значения:

- 1 — автоматическое закрытие соединения включено, повторное использование соединения отключено
- 0 — автоматическое закрытие соединения выключено, повторное использование соединения включено

Значение по умолчанию: `1`.

### `connection_max_tries` {#connection-max-tries}

Задаёт число попыток для пула с отказоустойчивостью (failover).

Возможные значения:

- Положительное целое число.
- 0 — нет повторных попыток для пула с отказоустойчивостью.

Значение по умолчанию: `3`.

### `connection_pool_size` {#connection-pool-size}

Размер пула соединений (если все соединения используются, запрос будет ждать, пока какое-либо соединение не освободится).

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `16`.

### `connection_wait_timeout` {#connection-wait-timeout}

Таймаут ожидания свободного соединения (в секундах) при уже активных `connection_pool_size` соединениях; 0 — не ждать.

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `5`.

### `connect_timeout` {#connect-timeout}

Таймаут установки соединения (в секундах).

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `10`.

### `read_write_timeout` {#read-write-timeout}

Таймаут чтения/записи (в секундах).

Возможные значения:

- Положительное целое число.

Значение по умолчанию: `300`.

## См. также {#see-also}

- [Табличная функция MySQL](../../../sql-reference/table-functions/mysql.md)
- [Использование MySQL в качестве источника словаря](/sql-reference/dictionaries#mysql)
