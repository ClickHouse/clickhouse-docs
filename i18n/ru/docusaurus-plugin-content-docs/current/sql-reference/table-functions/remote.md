---
description: 'Табличная функция `remote` позволяет динамически обращаться к удалённым серверам, т.е. без создания распределённой таблицы. Табличная функция `remoteSecure` та же, что и `remote`, но работает по защищённому соединению.'
sidebar_label: 'remote'
sidebar_position: 175
slug: /sql-reference/table-functions/remote
title: 'remote, remoteSecure'
doc_type: 'reference'
---



# Табличные функции remote и remoteSecure

Табличная функция `remote` позволяет получать доступ к удалённым серверам «на лету», то есть без создания таблицы [Distributed](../../engines/table-engines/special/distributed.md). Табличная функция `remoteSecure` аналогична функции `remote`, но использует защищённое соединение.

Обе функции могут использоваться в запросах `SELECT` и `INSERT`.



## Синтаксис {#syntax}

```sql
remote(addresses_expr, [db, table, user [, password], sharding_key])
remote(addresses_expr, [db.table, user [, password], sharding_key])
remote(named_collection[, option=value [,..]])
remoteSecure(addresses_expr, [db, table, user [, password], sharding_key])
remoteSecure(addresses_expr, [db.table, user [, password], sharding_key])
remoteSecure(named_collection[, option=value [,..]])
```


## Параметры {#parameters}

| Аргумент         | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `addresses_expr` | Адрес удалённого сервера или выражение, генерирующее несколько адресов удалённых серверов. Формат: `host` или `host:port`.<br/><br/> Параметр `host` может быть указан как имя сервера или как IPv4- или IPv6-адрес. IPv6-адрес должен быть указан в квадратных скобках.<br/><br/> Параметр `port` — это TCP-порт удалённого сервера. Если порт не указан, используется значение [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port) из конфигурационного файла сервера для табличной функции `remote` (по умолчанию 9000) и [tcp_port_secure](../../operations/server-configuration-parameters/settings.md#tcp_port_secure) для табличной функции `remoteSecure` (по умолчанию 9440).<br/><br/> Для IPv6-адресов указание порта обязательно.<br/><br/> Если указан только параметр `addresses_expr`, то для `db` и `table` по умолчанию используется `system.one`.<br/><br/> Тип: [String](../../sql-reference/data-types/string.md). |
| `db`             | Имя базы данных. Тип: [String](../../sql-reference/data-types/string.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `table`          | Имя таблицы. Тип: [String](../../sql-reference/data-types/string.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `user`           | Имя пользователя. Если не указано, используется `default`. Тип: [String](../../sql-reference/data-types/string.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `password`       | Пароль пользователя. Если не указан, используется пустой пароль. Тип: [String](../../sql-reference/data-types/string.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `sharding_key`   | Ключ шардирования для распределения данных по узлам. Например: `insert into remote('127.0.0.1:9000,127.0.0.2', db, table, 'default', rand())`. Тип: [UInt32](../../sql-reference/data-types/int-uint.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

Аргументы также могут быть переданы с помощью [именованных коллекций](operations/named-collections.md).


## Возвращаемое значение {#returned-value}

Таблица, расположенная на удалённом сервере.


## Использование {#usage}

Поскольку табличные функции `remote` и `remoteSecure` устанавливают соединение заново для каждого запроса, рекомендуется использовать вместо них таблицу типа `Distributed`. Кроме того, если заданы имена хостов, имена разрешаются, и ошибки не учитываются при работе с различными репликами. При обработке большого количества запросов всегда создавайте таблицу `Distributed` заранее и не используйте табличную функцию `remote`.

Табличная функция `remote` может быть полезна в следующих случаях:

- Однократная миграция данных из одной системы в другую
- Доступ к конкретному серверу для сравнения данных, отладки и тестирования, т. е. разовые подключения.
- Запросы между различными кластерами ClickHouse в исследовательских целях.
- Нечастые распределённые запросы, выполняемые вручную.
- Распределённые запросы, в которых набор серверов переопределяется каждый раз.

### Адреса {#addresses}

```text
example01-01-1
example01-01-1:9440
example01-01-1:9000
localhost
127.0.0.1
[::]:9440
[::]:9000
[2a02:6b8:0:1111::11]:9000
```

Несколько адресов можно указать через запятую. В этом случае ClickHouse будет использовать распределённую обработку и отправит запрос на все указанные адреса (как на шарды с различными данными). Пример:

```text
example01-01-1,example01-02-1
```


## Примеры {#examples}

### Выборка данных с удалённого сервера: {#selecting-data-from-a-remote-server}

```sql
SELECT * FROM remote('127.0.0.1', db.remote_engine_table) LIMIT 3;
```

Или с использованием [именованных коллекций](operations/named-collections.md):

```sql
CREATE NAMED COLLECTION creds AS
        host = '127.0.0.1',
        database = 'db';
SELECT * FROM remote(creds, table='remote_engine_table') LIMIT 3;
```

### Вставка данных в таблицу на удалённом сервере: {#inserting-data-into-a-table-on-a-remote-server}

```sql
CREATE TABLE remote_table (name String, value UInt32) ENGINE=Memory;
INSERT INTO FUNCTION remote('127.0.0.1', currentDatabase(), 'remote_table') VALUES ('test', 42);
SELECT * FROM remote_table;
```

### Миграция таблиц из одной системы в другую: {#migration-of-tables-from-one-system-to-another}

В этом примере используется одна таблица из тестового набора данных. База данных — `imdb`, таблица — `actors`.

#### В исходной системе ClickHouse (система, в которой в настоящее время размещены данные) {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- Проверьте имя исходной базы данных и таблицы (`imdb.actors`)

  ```sql
  show databases
  ```

  ```sql
  show tables in imdb
  ```

- Получите инструкцию CREATE TABLE из источника:

```sql
  SELECT create_table_query
  FROM system.tables
  WHERE database = 'imdb' AND table = 'actors'
```

Ответ

```sql
CREATE TABLE imdb.actors (`id` UInt32,
                          `first_name` String,
                          `last_name` String,
                          `gender` FixedString(1))
                ENGINE = MergeTree
                ORDER BY (id, first_name, last_name, gender);
```

#### В целевой системе ClickHouse {#on-the-destination-clickhouse-system}

- Создайте целевую базу данных:

  ```sql
  CREATE DATABASE imdb
  ```

- Используя инструкцию CREATE TABLE из источника, создайте целевую таблицу:

  ```sql
  CREATE TABLE imdb.actors (`id` UInt32,
                            `first_name` String,
                            `last_name` String,
                            `gender` FixedString(1))
                  ENGINE = MergeTree
                  ORDER BY (id, first_name, last_name, gender);
  ```

#### Возвращаемся к исходному развёртыванию {#back-on-the-source-deployment}

Вставьте данные в новую базу данных и таблицу, созданные в удалённой системе. Вам потребуются хост, порт, имя пользователя, пароль, целевая база данных и целевая таблица.

```sql
INSERT INTO FUNCTION
remoteSecure('remote.clickhouse.cloud:9440', 'imdb.actors', 'USER', 'PASSWORD')
SELECT * from imdb.actors
```


## Использование шаблонов {#globs-in-addresses}

Шаблоны в фигурных скобках `{ }` используются для генерации набора шардов и указания реплик. Если присутствует несколько пар фигурных скобок, генерируется декартово произведение соответствующих множеств.

Поддерживаются следующие типы шаблонов:

- `{a,b,c}` — представляет любую из альтернативных строк `a`, `b` или `c`. Шаблон заменяется на `a` в адресе первого шарда, на `b` в адресе второго шарда и так далее. Например, `example0{1,2}-1` генерирует адреса `example01-1` и `example02-1`.
- `{N..M}` — диапазон чисел. Этот шаблон генерирует адреса шардов с возрастающими индексами от `N` до `M` (включительно). Например, `example0{1..2}-1` генерирует `example01-1` и `example02-1`.
- `{0n..0m}` — диапазон чисел с ведущими нулями. Этот шаблон сохраняет ведущие нули в индексах. Например, `example{01..03}-1` генерирует `example01-1`, `example02-1` и `example03-1`.
- `{a|b}` — любое количество вариантов, разделённых символом `|`. Шаблон указывает реплики. Например, `example01-{1|2}` генерирует реплики `example01-1` и `example01-2`.

Запрос будет отправлен первой доступной реплике. Однако для `remote` реплики перебираются в порядке, заданном настройкой [load_balancing](../../operations/settings/settings.md#load_balancing).
Количество генерируемых адресов ограничено настройкой [table_function_remote_max_addresses](../../operations/settings/settings.md#table_function_remote_max_addresses).
