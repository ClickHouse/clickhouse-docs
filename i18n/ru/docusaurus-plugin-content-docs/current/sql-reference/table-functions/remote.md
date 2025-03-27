---
description: 'Функция таблицы `remote` позволяет получить доступ к удалённым серверам на лету, т.е. без создания [распределенной](../../engines/table-engines/special/distributed.md) таблицы. Функция таблицы `remoteSecure` аналогична `remote`, но использует защищённое соединение.'
sidebar_label: 'remote'
sidebar_position: 175
slug: /sql-reference/table-functions/remote
title: 'remote, remoteSecure'
---


# Функция таблицы remote, remoteSecure

Функция таблицы `remote` позволяет получить доступ к удалённым серверам на лету, т.е. без создания [распределенной](../../engines/table-engines/special/distributed.md) таблицы. Функция таблицы `remoteSecure` аналогична `remote`, но использует защищённое соединение.

Общие функции могут использоваться в запросах `SELECT` и `INSERT`.

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

- `addresses_expr` — Адрес удалённого сервера или выражение, генерирующее несколько адресов удалённых серверов. Формат: `host` или `host:port`.

    `host` может быть указан в виде имени сервера или как адрес IPv4 или IPv6. Адрес IPv6 должен быть указан в квадратных скобках.

    `port` — TCP порт удалённого сервера. Если порт не указан, используется [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port) из конфигурационного файла сервера для функции таблицы `remote` (по умолчанию 9000) и [tcp_port_secure](../../operations/server-configuration-parameters/settings.md#tcp_port_secure) для функции таблицы `remoteSecure` (по умолчанию 9440).

    Для адресов IPv6 порт обязателен.

    Если указан только параметр `addresses_expr`, `db` и `table` по умолчанию будут использовать `system.one`.

    Тип: [String](../../sql-reference/data-types/string.md).

- `db` — Имя базы данных. Тип: [String](../../sql-reference/data-types/string.md).
- `table` — Имя таблицы. Тип: [String](../../sql-reference/data-types/string.md).
- `user` — Имя пользователя. Если не указано, используется `default`. Тип: [String](../../sql-reference/data-types/string.md).
- `password` — Пароль пользователя. Если не указан, используется пустой пароль. Тип: [String](../../sql-reference/data-types/string.md).
- `sharding_key` — Ключ шардирования для поддержки распределения данных между узлами. Например: `insert into remote('127.0.0.1:9000,127.0.0.2', db, table, 'default', rand())`. Тип: [UInt32](../../sql-reference/data-types/int-uint.md).

Аргументы также могут передаваться с помощью [именованных коллекций](operations/named-collections.md).

## Возвращаемое значение {#returned-value}

Таблица, расположенная на удалённом сервере.

## Использование {#usage}

Поскольку функции таблицы `remote` и `remoteSecure` восстанавливают соединение для каждого запроса, рекомендуется использовать распределённую таблицу вместо этого. Кроме того, если заданы имена хостов, они разрешаются, и ошибки не учитываются при работе с различными репликами. При обработке большого количества запросов всегда создавайте распределённую таблицу заранее и не используйте функцию таблицы `remote`.

Функция таблицы `remote` может быть полезна в следующих случаях:

- Однократная миграция данных из одной системы в другую
- Доступ к конкретному серверу для сравнения данных, отладки и тестирования, т.е. ad-hoc соединения.
- Запросы между различными кластерами ClickHouse в исследовательских целях.
- Непостоянные распределённые запросы, которые выполняются вручную.
- Распределённые запросы, где набор серверов определятся каждый раз заново.

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

Несколько адресов могут быть разделены запятыми. В этом случае ClickHouse будет использовать распределённую обработку и отправлять запрос на все указанные адреса (как шардов с различными данными). Пример:

```text
example01-01-1,example01-02-1
```

## Примеры {#examples}

### Выбор данных с удалённого сервера: {#selecting-data-from-a-remote-server}

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

Этот пример использует одну таблицу из выборки данных. База данных — `imdb`, таблица — `actors`.

#### На исходной системе ClickHouse (системе, которая в настоящее время содержит данные) {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- Проверьте имя базы данных и таблицы (`imdb.actors`)

  ```sql
  show databases
  ```

  ```sql
  show tables in imdb
  ```

- Получите оператор CREATE TABLE из источника:

```sql
  select create_table_query
  from system.tables
  where database = 'imdb' and table = 'actors'
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

#### На целевой системе ClickHouse {#on-the-destination-clickhouse-system}

- Создайте целевую базу данных:

  ```sql
  CREATE DATABASE imdb
  ```

- Используя оператор CREATE TABLE из источника, создайте целевую таблицу:

  ```sql
  CREATE TABLE imdb.actors (`id` UInt32,
                            `first_name` String,
                            `last_name` String,
                            `gender` FixedString(1))
                  ENGINE = MergeTree
                  ORDER BY (id, first_name, last_name, gender);
  ```

#### Вернуться на исходное развертывание {#back-on-the-source-deployment}

Вставьте данные в новую базу данных и таблицу, созданные на удалённой системе. Вам понадобятся хост, порт, имя пользователя, пароль, целевая база данных и целевая таблица.

```sql
INSERT INTO FUNCTION
remoteSecure('remote.clickhouse.cloud:9440', 'imdb.actors', 'USER', 'PASSWORD')
SELECT * from imdb.actors
```

## Глоббинг {#globs-in-addresses}

Шаблоны в фигурных скобках `{ }` используются для генерации набора шардов и для указания реплик. Если есть несколько пар фигурных скобок, то генерируется прямое произведение соответствующих наборов.

Поддерживаются следующие типы шаблонов.

- `{a,b,c}` - Представляет любую из альтернативных строк `a`, `b` или `c`. Шаблон заменяется на `a` в первом адресе шардирования и заменяется на `b` во втором адресе шардирования и так далее. Например, `example0{1,2}-1` генерирует адреса `example01-1` и `example02-1`.
- `{N..M}` - Диа диапазон чисел. Этот шаблон генерирует адреса шардов с увеличивающимися индексами от `N` до (включительно) `M`. Например, `example0{1..2}-1` генерирует `example01-1` и `example02-1`.
- `{0n..0m}` - Диапазон чисел с ведущими нулями. Этот шаблон сохраняет ведущие нули в индексах. Например, `example{01..03}-1` генерирует `example01-1`, `example02-1` и `example03-1`.
- `{a|b}` - Любое количество вариантов, разделенных `|`. Шаблон указывает на реплики. Например, `example01-{1|2}` генерирует реплики `example01-1` и `example01-2`.

Запрос будет отправлен первой здоровой реплике. Однако для `remote` реплики перебираются в порядке, установленном в настройке [load_balancing](../../operations/settings/settings.md#load_balancing).
Количество сгенерированных адресов ограничено настройкой [table_function_remote_max_addresses](../../operations/settings/settings.md#table_function_remote_max_addresses).
