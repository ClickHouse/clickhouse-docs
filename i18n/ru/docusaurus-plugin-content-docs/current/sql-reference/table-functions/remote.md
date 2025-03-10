---
slug: /sql-reference/table-functions/remote
sidebar_position: 175
sidebar_label: remote
title: "remote, remoteSecure"
description: "Табличная функция `remote` позволяет получать доступ к удалённым серверам на лету, т.е. без создания [распределенной](../../engines/table-engines/special/distributed.md) таблицы. Табличная функция `remoteSecure` такая же, как `remote`, но через безопасное соединение."
---


# Табличная функция remote, remoteSecure

Табличная функция `remote` позволяет получать доступ к удалённым серверам на лету, т.е. без создания [распределенной](../../engines/table-engines/special/distributed.md) таблицы. Табличная функция `remoteSecure` такая же, как `remote`, но через безопасное соединение.

Об обеих функциях можно использовать в `SELECT` и `INSERT` запросах.

## Синтаксис {#syntax}

``` sql
remote(addresses_expr, [db, table, user [, password], sharding_key])
remote(addresses_expr, [db.table, user [, password], sharding_key])
remote(named_collection[, option=value [,..]])
remoteSecure(addresses_expr, [db, table, user [, password], sharding_key])
remoteSecure(addresses_expr, [db.table, user [, password], sharding_key])
remoteSecure(named_collection[, option=value [,..]])
```

## Параметры {#parameters}

- `addresses_expr` — Адрес удаленного сервера или выражение, генерирующее несколько адресов удаленных серверов. Формат: `host` или `host:port`.

    `host` может быть указан как имя сервера или как IPv4 или IPv6 адрес. IPv6 адрес должен быть указан в квадратных скобках.

    `port` — это TCP порт на удаленном сервере. Если порт пропущен, используется [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port) из файла конфигурации сервера для табличной функции `remote` (по умолчанию 9000) и [tcp_port_secure](../../operations/server-configuration-parameters/settings.md#tcp_port_secure) для табличной функции `remoteSecure` (по умолчанию 9440).

    Для IPv6 адресов порт обязателен.

    Если указан только параметр `addresses_expr`, то `db` и `table` будут использовать `system.one` по умолчанию.

    Тип: [String](../../sql-reference/data-types/string.md).

- `db` — Имя базы данных. Тип: [String](../../sql-reference/data-types/string.md).
- `table` — Имя таблицы. Тип: [String](../../sql-reference/data-types/string.md).
- `user` — Имя пользователя. Если не указано, используется `default`. Тип: [String](../../sql-reference/data-types/string.md).
- `password` — Пароль пользователя. Если не указан, используется пустой пароль. Тип: [String](../../sql-reference/data-types/string.md).
- `sharding_key` — Ключ шarding для поддержки распределения данных между узлами. Например: `insert into remote('127.0.0.1:9000,127.0.0.2', db, table, 'default', rand())`. Тип: [UInt32](../../sql-reference/data-types/int-uint.md).

Аргументы также могут быть переданы с использованием [именованных коллекций](operations/named-collections.md).

## Возвращаемое значение {#returned-value}

Таблица, расположенная на удаленном сервере.

## Использование {#usage}

Поскольку табличные функции `remote` и `remoteSecure` восстанавливают соединение для каждого запроса, рекомендуется использовать `распределенную` таблицу вместо этого. Также, если установлены имена хостов, они разрешаются, и ошибки не учитываются при работе с различными репликами. При обработке большого количества запросов всегда создавайте `распределенную` таблицу заранее и не используйте табличную функцию `remote`.

Табличная функция `remote` может быть полезна в следующих случаях:

- Одноразовая миграция данных из одной системы в другую
- Доступ к конкретному серверу для сравнения данных, отладки и тестирования, т.е. ad-hoc соединения.
- Запросы между различными кластерами ClickHouse для исследовательских целей.
- Редкие распределенные запросы, которые выполняются вручную.
- Распределенные запросы, где набор серверов переопределяется каждый раз.

### Адреса {#addresses}

``` text
example01-01-1
example01-01-1:9440
example01-01-1:9000
localhost
127.0.0.1
[::]:9440
[::]:9000
[2a02:6b8:0:1111::11]:9000
```

Несколько адресов могут быть разделены запятыми. В этом случае ClickHouse будет использовать распределённую обработку и отправит запрос на все указанные адреса (как шардированные с различными данными). Пример:

``` text
example01-01-1,example01-02-1
```

## Примеры {#examples}

### Выбор данных из удалённого сервера: {#selecting-data-from-a-remote-server}

``` sql
SELECT * FROM remote('127.0.0.1', db.remote_engine_table) LIMIT 3;
```

Или используя [именованные коллекции](operations/named-collections.md):

```sql
CREATE NAMED COLLECTION creds AS
        host = '127.0.0.1',
        database = 'db';
SELECT * FROM remote(creds, table='remote_engine_table') LIMIT 3;
```

### Вставка данных в таблицу на удалённом сервере: {#inserting-data-into-a-table-on-a-remote-server}

``` sql
CREATE TABLE remote_table (name String, value UInt32) ENGINE=Memory;
INSERT INTO FUNCTION remote('127.0.0.1', currentDatabase(), 'remote_table') VALUES ('test', 42);
SELECT * FROM remote_table;
```

### Миграция таблиц из одной системы в другую: {#migration-of-tables-from-one-system-to-another}

В этом примере используется одна таблица из выборки данных. База данных — `imdb`, а таблица — `actors`.

#### На исходной системе ClickHouse (системе, которая в данный момент хостит данные) {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- Проверьте имя исходной базы данных и таблицы (`imdb.actors`)

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

#### Вернитесь к исходному развертыванию {#back-on-the-source-deployment}

Вставьте данные в новую базу данных и таблицу, созданные на удалённой системе. Вам понадобятся хост, порт, имя пользователя, пароль, целевая база данных и целевая таблица.

```sql
INSERT INTO FUNCTION
remoteSecure('remote.clickhouse.cloud:9440', 'imdb.actors', 'USER', 'PASSWORD')
SELECT * from imdb.actors
```

## Глобальный поиск {#globs-in-addresses}

Шаблоны в фигурных скобках `{ }` используются для генерации набора шардов и для указания реплик. Если есть несколько пар фигурных скобок, тогда генерируется прямое произведение соответствующих множеств.

Поддерживаются следующие типы шаблонов.

- `{a,b,c}` - Представляет любую из альтернативных строк `a`, `b` или `c`. Шаблон заменяется на `a` в первом адресе шарда и заменяется на `b` во втором адресе шарда и так далее. Например, `example0{1,2}-1` генерирует адреса `example01-1` и `example02-1`.
- `{N..M}` - Диапазон чисел. Этот шаблон генерирует адреса шардов с увеличивающимися индексами от `N` до (включительно) `M`. Например, `example0{1..2}-1` генерирует `example01-1` и `example02-1`.
- `{0n..0m}` - Диапазон чисел с ведущими нулями. Этот шаблон сохраняет ведущие нули в индексах. Например, `example{01..03}-1` генерирует `example01-1`, `example02-1` и `example03-1`.
- `{a|b}` - Любое число вариантов, разделенных `|`. Шаблон указывает реплики. Например, `example01-{1|2}` генерирует реплики `example01-1` и `example01-2`.

Запрос будет отправлен на первую здоровую реплику. Однако для `remote` реплики перебираются в порядке, установленном в настройке [load_balancing](../../operations/settings/settings.md#load_balancing).
Количество сгенерированных адресов ограничивается настройкой [table_function_remote_max_addresses](../../operations/settings/settings.md#table_function_remote_max_addresses).
