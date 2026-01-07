---
sidebar_label: 'Справочник'
description: 'Полная справочная документация по pg_clickhouse'
slug: '/integrations/pg_clickhouse/reference'
title: 'Справочная документация по pg_clickhouse'
doc_type: 'reference'
keywords: ['PostgreSQL', 'Postgres', 'FDW', 'foreign data wrapper', 'pg_clickhouse', 'extension']
---

# Справочная документация по pg_clickhouse {#pg_clickhouse-reference-documentation}

## Описание {#description}

pg_clickhouse — это расширение PostgreSQL, которое позволяет выполнять удалённые запросы
к базам данных ClickHouse, включая [обёртку внешних данных (foreign data wrapper)]. Оно поддерживает
PostgreSQL 13 и новее и ClickHouse 23 и новее.

## Начало работы {#getting-started}

Самый простой способ попробовать pg&#95;clickhouse — использовать [Docker image], который представляет собой стандартный Docker-образ PostgreSQL с расширением pg&#95;clickhouse:

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres
```

См. [руководство](tutorial.md), чтобы начать импортировать таблицы ClickHouse и
настроить проброс запросов в ClickHouse.


## Использование {#usage}

```sql
CREATE EXTENSION pg_clickhouse;
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'default');
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA taxi FROM SERVER taxi_srv INTO taxi;
```


## Политика версионирования {#versioning-policy}

pg_clickhouse следует [Semantic Versioning] для своих публичных релизов.

* Основная (major) версия увеличивается при изменениях API
* Минорная (minor) версия увеличивается при обратно совместимых изменениях SQL
* Патч-версия (patch) увеличивается при изменениях, касающихся только бинарных файлов

После установки PostgreSQL отслеживает два варианта версии:

* Версия библиотеки (определяется `PG_MODULE_MAGIC` в PostgreSQL 18 и выше)
    включает полную семантическую версию, которая видна в выводе функции
    `pg_get_loaded_modules()`.
* Версия расширения (определяется в control-файле) включает только основную и
    минорную версии, видна в таблице `pg_catalog.pg_extension`, в выводе
    функции `pg_available_extension_versions()` и в `\dx pg_clickhouse`.

На практике это означает, что релиз, в котором увеличивается патч-версия,
например с `v0.1.0` до `v0.1.1`, применяется ко всем базам данных, которые
загрузили `v0.1`, и им не нужно выполнять `ALTER EXTENSION`, чтобы получить
преимущества обновления.

Релиз, в котором увеличивается минорная или основная версия, напротив,
будет сопровождаться SQL-скриптами обновления, и все существующие базы данных,
содержащие расширение, должны выполнить `ALTER EXTENSION pg_clickhouse UPDATE`,
чтобы получить преимущества обновления.

## Справочник по SQL {#sql-reference}

В следующих SQL-примерах используется pg_clickhouse.

### CREATE EXTENSION {#create-extension}

Используйте [CREATE EXTENSION], чтобы добавить pg&#95;clickhouse в базу данных:

```sql
CREATE EXTENSION pg_clickhouse;
```

Используйте `WITH SCHEMA`, чтобы установить расширение в определённую схему (рекомендуется):

```sql
CREATE SCHEMA ch;
CREATE EXTENSION pg_clickhouse WITH SCHEMA ch;
```


### ALTER EXTENSION {#alter-extension}

Используйте [ALTER EXTENSION], чтобы изменить расширение pg_clickhouse. Примеры:

* После установки нового релиза pg_clickhouse используйте предложение `UPDATE`:

    ```sql
    ALTER EXTENSION pg_clickhouse UPDATE;
    ```

* Используйте `SET SCHEMA`, чтобы перенести расширение в новую схему:

    ```sql
    CREATE SCHEMA ch;
    ALTER EXTENSION pg_clickhouse SET SCHEMA ch;
    ```

### DROP EXTENSION {#drop-extension}

Используйте [DROP EXTENSION], чтобы удалить расширение pg&#95;clickhouse из базы данных:

```sql
DROP EXTENSION pg_clickhouse;
```

Эта команда завершится ошибкой, если существуют какие‑либо объекты, зависящие от pg&#95;clickhouse. Используйте предложение `CASCADE`, чтобы удалить их также:

```sql
DROP EXTENSION pg_clickhouse CASCADE;
```


### CREATE SERVER {#create-server}

Используйте [CREATE SERVER], чтобы создать удалённый сервер, который подключается к серверу ClickHouse. Пример:

```sql
CREATE SERVER taxi_srv FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host 'localhost', dbname 'taxi');
```

Поддерживаемые параметры:

* `driver`: драйвер подключения к ClickHouse — либо &quot;binary&quot;, либо
  &quot;http&quot;. **Обязательный параметр.**
* `dbname`: база данных ClickHouse, используемая при подключении. По умолчанию —
  &quot;default&quot;.
* `host`: имя хоста сервера ClickHouse. По умолчанию &quot;localhost&quot;.
* `port`: порт для подключения к серверу ClickHouse. Значения по умолчанию:
  * 9440, если `driver` — &quot;binary&quot; и `host` — хост ClickHouse Cloud
  * 9004, если `driver` — &quot;binary&quot; и `host` не является хостом ClickHouse Cloud
  * 8443, если `driver` — &quot;http&quot; и `host` — хост ClickHouse Cloud
  * 8123, если `driver` — &quot;http&quot; и `host` не является хостом ClickHouse Cloud


### ALTER SERVER {#alter-server}

Используйте [ALTER SERVER] для изменения внешнего сервера. Например:

```sql
ALTER SERVER taxi_srv OPTIONS (SET driver 'http');
```

Параметры те же, что и у [CREATE SERVER](#create-server).


### DROP SERVER {#drop-server}

Используйте [DROP SERVER] для удаления внешнего сервера:

```sql
DROP SERVER taxi_srv;
```

Эта команда приведёт к ошибке, если от сервера зависят какие-либо другие объекты. Используйте `CASCADE`, чтобы
также удалить эти зависимости:

```sql
DROP SERVER taxi_srv CASCADE;
```


### CREATE USER MAPPING {#create-user-mapping}

Используйте [CREATE USER MAPPING], чтобы сопоставить пользователя PostgreSQL с пользователем ClickHouse. Например, чтобы сопоставить текущего пользователя PostgreSQL с удалённым пользователем ClickHouse при подключении к внешнему серверу `taxi_srv`:

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (user 'demo');
```

Поддерживаемые параметры:

* `user`: Имя пользователя ClickHouse. Значение по умолчанию — &quot;default&quot;.
* `password`: Пароль пользователя ClickHouse.


### ALTER USER MAPPING {#alter-user-mapping}

Используйте [ALTER USER MAPPING], чтобы изменить определение отображения пользователя:

```sql
ALTER USER MAPPING FOR CURRENT_USER SERVER taxi_srv
       OPTIONS (SET user 'default');
```

Параметры те же, что и для [CREATE USER MAPPING](#create-user-mapping).


### DROP USER MAPPING {#drop-user-mapping}

Используйте [DROP USER MAPPING], чтобы удалить отображение пользователя:

```sql
DROP USER MAPPING FOR CURRENT_USER SERVER taxi_srv;
```


### IMPORT FOREIGN SCHEMA {#import-foreign-schema}

Используйте оператор [IMPORT FOREIGN SCHEMA], чтобы импортировать все таблицы, определённые в базе данных ClickHouse как внешние таблицы в схему PostgreSQL:

```sql
CREATE SCHEMA taxi;
IMPORT FOREIGN SCHEMA demo FROM SERVER taxi_srv INTO taxi;
```

Используйте `LIMIT TO`, чтобы выполнять импорт только для определённых таблиц:

```sql
IMPORT FOREIGN SCHEMA demo LIMIT TO (trips) FROM SERVER taxi_srv INTO taxi;
```

Используйте `EXCEPT`, чтобы исключить таблицы:

```sql
IMPORT FOREIGN SCHEMA demo EXCEPT (users) FROM SERVER taxi_srv INTO taxi;
```

pg&#95;clickhouse получит список всех таблиц в указанной базе данных ClickHouse
(«demo» в приведённых выше примерах), извлечёт определения столбцов для каждой
из них и выполнит команды [CREATE FOREIGN TABLE](#create-foreign-table) для создания
внешних таблиц. Столбцы будут определены с использованием [поддерживаемых типов
данных](#data-types) и, где это можно обнаружить, параметров, поддерживаемых [CREATE
FOREIGN TABLE](#create-foreign-table).


### CREATE FOREIGN TABLE {#create-foreign-table}

Используйте [IMPORT FOREIGN SCHEMA], чтобы создать внешнюю таблицу, которая позволяет выполнять запросы к данным в базе данных ClickHouse:

```sql
CREATE FOREIGN TABLE uact (
    user_id    bigint NOT NULL,
    page_views int,
    duration   smallint,
    sign       smallint
) SERVER taxi_srv OPTIONS(
    table_name 'uact'
    engine 'CollapsingMergeTree'
);
```

Поддерживаемые параметры таблицы:

* `database`: Имя удалённой базы данных. По умолчанию используется база данных,
  определённая для внешнего сервера.
* `table_name`: Имя удалённой таблицы. По умолчанию используется имя,
  указанное для внешней таблицы.
* `engine`: [Движок таблицы], используемый таблицей ClickHouse. Для
  `CollapsingMergeTree()` и `AggregatingMergeTree()` pg&#95;clickhouse
  автоматически применяет параметры к функциональным выражениям, выполняемым
  над таблицей.

Используйте [тип данных](#data-types), соответствующий удалённому типу данных
ClickHouse каждого столбца. Для столбцов типа [AggregateFunction Type] и
[SimpleAggregateFunction Type] сопоставьте тип данных с типом ClickHouse,
передаваемым функции, и укажите имя агрегатной функции через соответствующий
параметр столбца:

* `AggregateFunction`: Имя агрегатной функции, применяемой к столбцу
  типа [AggregateFunction Type]
* `SimpleAggregateFunction`: Имя агрегатной функции, применяемой к
  столбцу типа [SimpleAggregateFunction Type]

Пример:

(aggregatefunction &#39;sum&#39;)

```sql
CREATE FOREIGN TABLE test (
    column1 bigint  OPTIONS(AggregateFunction 'uniq'),
    column2 integer OPTIONS(AggregateFunction 'anyIf'),
    column3 bigint  OPTIONS(AggregateFunction 'quantiles(0.5, 0.9)')
) SERVER clickhouse_srv;
```

Для столбцов типа `AggregateFunction` pg&#95;clickhouse автоматически добавит `Merge` к агрегатной функции, вычисляющей значение столбца.


### ALTER FOREIGN TABLE {#alter-foreign-table}

Используйте оператор [ALTER FOREIGN TABLE], чтобы изменить определение внешней таблицы:

```sql
ALTER TABLE table ALTER COLUMN b OPTIONS (SET AggregateFunction 'count');
```

Поддерживаемые параметры таблиц и столбцов совпадают с параметрами для [CREATE FOREIGN
TABLE].


### DROP FOREIGN TABLE {#drop-foreign-table}

Используйте [DROP FOREIGN TABLE], чтобы удалить внешнюю таблицу:

```sql
DROP FOREIGN TABLE uact;
```

Эта команда завершится с ошибкой, если существуют какие-либо объекты, зависящие от внешней таблицы.
Используйте опцию `CASCADE`, чтобы удалить и их также:

```sql
DROP FOREIGN TABLE uact CASCADE;
```


## Справочник функций и операторов {#function-and-operator-reference}

### Типы данных {#data-types}

pg_clickhouse сопоставляет следующие типы данных ClickHouse с типами данных
PostgreSQL:

| ClickHouse |    PostgreSQL    |                    Примечания                     |
| -----------|------------------|---------------------------------------------------|
| Bool       | boolean          |                                                   |
| Date       | date             |                                                   |
| DateTime   | timestamp        |                                                   |
| Decimal    | numeric          |                                                   |
| Float32    | real             |                                                   |
| Float64    | double precision |                                                   |
| IPv4       | inet             |                                                   |
| IPv6       | inet             |                                                   |
| Int16      | smallint         |                                                   |
| Int32      | integer          |                                                   |
| Int64      | bigint           |                                                   |
| Int8       | smallint         |                                                   |
| JSON       | jsonb            | Только для HTTP-движка                            |
| String     | text             |                                                   |
| UInt16     | integer          |                                                   |
| UInt32     | bigint           |                                                   |
| UInt64     | bigint           | Вызывает ошибку для значений > максимального BIGINT |
| UInt8      | smallint         |                                                   |
| UUID       | uuid             |                                                   |

### Функции {#functions}

Эти функции предоставляют интерфейс для выполнения запросов к базе данных ClickHouse.

#### `clickhouse_raw_query` {#clickhouse_raw_query}

```sql
SELECT clickhouse_raw_query(
    'CREATE TABLE t1 (x String) ENGINE = Memory',
    'host=localhost port=8123'
);
```

Подключается к сервису ClickHouse через его HTTP-интерфейс, выполняет один
запрос и отключается. Необязательный второй аргумент задаёт строку подключения,
по умолчанию используется `host=localhost port=8123`. Поддерживаются следующие
параметры подключения:

* `host`: Хост для подключения; обязательный параметр.
* `port`: HTTP-порт для подключения; по умолчанию `8123`, если `host` не
  является хостом ClickHouse Cloud; в противном случае по умолчанию `8443`.
* `dbname`: Имя базы данных, к которой требуется подключиться.
* `username`: Имя пользователя, под которым выполняется подключение; по умолчанию `default`.
* `password`: Пароль, используемый для аутентификации; по умолчанию пароль отсутствует.

Полезно для запросов, которые не возвращают записей; результаты запросов, которые возвращают значения,
будут возвращены как одно текстовое значение:

```sql
SELECT clickhouse_raw_query(
    'SELECT schema_name, schema_owner from information_schema.schemata',
    'host=localhost port=8123'
);
```

```sql
      clickhouse_raw_query       
---------------------------------
 INFORMATION_SCHEMA      default+
 default default                +
 git     default                +
 information_schema      default+
 system  default                +
 
(1 row)
```


### Функции pushdown {#pushdown-functions}

Все встроенные функции PostgreSQL, используемые в условных выражениях (в конструкциях `HAVING` и `WHERE`) при выполнении запросов к внешним таблицам ClickHouse, автоматически передаются на исполнение (pushdown) в ClickHouse с теми же именами и сигнатурами. Однако у некоторых функции имена или сигнатуры отличаются, и их необходимо сопоставить с эквивалентами. `pg_clickhouse` сопоставляет следующие функции:

* `date_part`:
  * `date_part('day')`: [toDayOfMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfMonth)
  * `date_part('doy')`: [toDayOfYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfYear)
  * `date_part('dow')`: [toDayOfWeek](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toDayOfWeek)
  * `date_part('year')`: [toYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toYear)
  * `date_part('month')`: [toMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMonth)
  * `date_part('hour')`: [toHour](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toHour)
  * `date_part('minute')`: [toMinute](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMinute)
  * `date_part('second')`: [toSecond](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toSecond)
  * `date_part('quarter')`: [toQuarter](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toQuarter)
  * `date_part('isoyear')`: [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toISOYear)
  * `date_part('week')`: [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toISOWeek)
  * `date_part('epoch')`: [toISOYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toUnixTimestamp)
* `date_trunc`:
  * `date_trunc('week')`: [toMonday](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toMonday)
  * `date_trunc('second')`: [toStartOfSecond](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfSecond)
  * `date_trunc('minute')`: [toStartOfMinute](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfMinute)
  * `date_trunc('hour')`: [toStartOfHour](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfHour)
  * `date_trunc('day')`: [toStartOfDay](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfDay)
  * `date_trunc('month')`: [toStartOfMonth](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfMonth)
  * `date_trunc('quarter')`: [toStartOfQuarter](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfQuarter)
  * `date_trunc('year')`: [toStartOfYear](https://clickhouse.com/docs/sql-reference/functions/date-time-functions#toStartOfYear)
* `array_position`: [indexOf](https://clickhouse.com/docs/sql-reference/functions/array-functions#indexOf)
* `btrim`: [trimBoth](https://clickhouse.com/docs/sql-reference/functions/string-functions#trimboth)
* `strpos`: [position](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#position)
* `regexp_like`: [match](https://clickhouse.com/docs/sql-reference/functions/string-search-functions#match)

### Пользовательские функции {#custom-functions}

Эти пользовательские функции, созданные `pg_clickhouse`, обеспечивают pushdown удалённых запросов (foreign query pushdown) для некоторых функций ClickHouse, не имеющих эквивалентов в PostgreSQL. Если какую-либо из этих функций нельзя протолкнуть (push down), будет возбуждено исключение.

* [dictGet](https://clickhouse.com/docs/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)

### Проталкивание приведений типов {#pushdown-casts}

pg_clickhouse проталкивает приведения типов, такие как `CAST(x AS bigint)`, для совместимых
типов данных. Для несовместимых типов проталкивание завершится ошибкой; если `x` в этом
примере имеет тип ClickHouse `UInt64`, ClickHouse откажется приводить это значение.

Чтобы проталкивать приведения к несовместимым типам данных, pg_clickhouse предоставляет
следующие функции. Они вызывают исключение в PostgreSQL, если приведение не было протолкнуто.

* [toUInt8](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint8)
* [toUInt16](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint16)
* [toUInt32](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint32)
* [toUInt64](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint64)
* [toUInt128](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#touint128)

### Агрегаты с pushdown {#pushdown-aggregates}

Эти агрегатные функции PostgreSQL могут быть протолкнуты для выполнения в ClickHouse (pushdown).

* [count](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/count)

### Пользовательские агрегатные функции {#custom-aggregates}

Эти пользовательские агрегатные функции, созданные `pg_clickhouse`, поддерживают foreign query pushdown для ряда агрегатных функций ClickHouse, не имеющих эквивалентов в PostgreSQL. Если для какой-либо из этих функций pushdown невозможен, будет сгенерировано исключение.

* [argMax](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/argmax)
* [argMin](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/argmin)
* [uniq](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqCombined64](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqHLL12](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqTheta](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/uniqthetasketch)
* [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)

### Pushdown агрегатных функций Ordered Set {#pushdown-ordered-set-aggregates}

Эти [ordered-set aggregate functions] отображаются на ClickHouse [Parametric
aggregate functions], при этом их *direct argument* передаётся как параметр, а выражения `ORDER BY` — как аргументы. Например, такой PostgreSQL-запрос:

```sql
SELECT percentile_cont(0.25) WITHIN GROUP (ORDER BY a) FROM t1;
```

Соответствует следующему запросу ClickHouse:

```sql
SELECT quantile(0.25)(a) FROM t1;
```

Обратите внимание, что суффиксы `ORDER BY` `DESC` и `NULLS FIRST`, отличные от значения по умолчанию,
не поддерживаются и вызовут ошибку.

* `percentile_cont(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantile(double)`: [quantile](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantile)
* `quantileExact(double)`: [quantileExact](https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/quantileexact)


### Настройки сессии {#session-settings}

Установите параметр времени выполнения `pg_clickhouse.session_settings`, чтобы задать
[настройки ClickHouse], которые будут применяться к последующим запросам. Пример:

```sql
SET pg_clickhouse.session_settings = 'join_use_nulls 1, final 1';
```

Значение по умолчанию — `join_use_nulls 1`. Установите пустую строку, чтобы использовать настройки, заданные на сервере ClickHouse.

```sql
SET pg_clickhouse.session_settings = '';
```

Синтаксис представляет собой список пар ключ-значение, разделённых запятыми и отделённых
одним или несколькими пробелами. Ключи должны соответствовать [ClickHouse settings]. Экранируйте пробелы,
запятые и обратные косые черты в значениях с помощью обратной косой черты:

```sql
SET pg_clickhouse.session_settings = 'join_algorithm grace_hash\,hash';
```

Или используйте значения в одинарных кавычках, чтобы избежать экранирования пробелов и запятых; рассмотрите вариант использования [dollar quoting], чтобы не приходилось обрамлять значения двойными кавычками:

```sql
SET pg_clickhouse.session_settings = $$join_algorithm 'grace_hash,hash'$$;
```

Если для вас важна читаемость и нужно задать много параметров, используйте несколько строк, например:

```sql
SET pg_clickhouse.session_settings TO $$
    connect_timeout 2,
    count_distinct_implementation uniq,
    final 1,
    group_by_use_nulls 1,
    join_algorithm 'prefer_partial_merge',
    join_use_nulls 1,
    log_queries_min_type QUERY_FINISH,
    max_block_size 32768,
    max_execution_time 45,
    max_result_rows 1024,
    metrics_perf_events_list 'this,that',
    network_compression_method ZSTD,
    poll_interval 5,
    totals_mode after_having_auto
$$;
```

pg&#95;clickhouse не проверяет настройки, а передаёт их в ClickHouse
для каждого запроса. Таким образом, он поддерживает все настройки для каждой версии ClickHouse.

Обратите внимание, что pg&#95;clickhouse должен быть загружен до установки
`pg_clickhouse.session_settings`: либо используйте [library preloading], либо просто
обратитесь к одному из объектов расширения, чтобы гарантировать его загрузку.


## Авторы {#authors}

* [David E. Wheeler](https://justatheory.com/)
* [Ildus Kurbangaliev](https://github.com/ildus)
* [Ibrar Ahmed](https://github.com/ibrarahmad)

## Авторские права {#copyright}

* Copyright (c) 2025-2026, ClickHouse
* Отдельные части Copyright (c) 2023-2025, Ildus Kurbangaliev
* Отдельные части Copyright (c) 2019-2023, Adjust GmbH
* Отдельные части Copyright (c) 2012-2019, PostgreSQL Global Development Group

  [foreign data wrapper]: https://www.postgresql.org/docs/current/fdwhandler.html
    "Документация PostgreSQL: создание foreign data wrapper"
  [Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse
    "Последняя версия на Docker Hub"
  [ClickHouse]: https://clickhouse.com/clickhouse
  [Semantic Versioning]: https://semver.org/spec/v2.0.0.html
    "Семантическое версионирование 2.0.0"
  [CREATE EXTENSION]: https://www.postgresql.org/docs/current/sql-createextension.html
    "Документация PostgreSQL: CREATE EXTENSION"
  [ALTER EXTENSION]: https://www.postgresql.org/docs/current/sql-alterextension.html
    "Документация PostgreSQL: ALTER EXTENSION"
  [DROP EXTENSION]: https://www.postgresql.org/docs/current/sql-dropextension.html
    "Документация PostgreSQL: DROP EXTENSION"
  [CREATE SERVER]: https://www.postgresql.org/docs/current/sql-createserver.html
    "Документация PostgreSQL: CREATE SERVER"
  [ALTER SERVER]: https://www.postgresql.org/docs/current/sql-alterserver.html
    "Документация PostgreSQL: ALTER SERVER"
  [DROP SERVER]: https://www.postgresql.org/docs/current/sql-dropserver.html
    "Документация PostgreSQL: DROP SERVER"
  [CREATE USER MAPPING]: https://www.postgresql.org/docs/current/sql-createusermapping.html
    "Документация PostgreSQL: CREATE USER MAPPING"
  [ALTER USER MAPPING]: https://www.postgresql.org/docs/current/sql-alterusermapping.html
    "Документация PostgreSQL: ALTER USER MAPPING"
  [DROP USER MAPPING]: https://www.postgresql.org/docs/current/sql-dropusermapping.html
    "Документация PostgreSQL: DROP USER MAPPING"
  [IMPORT FOREIGN SCHEMA]: https://www.postgresql.org/docs/current/sql-importforeignschema.html
    "Документация PostgreSQL: IMPORT FOREIGN SCHEMA"
  [table engine]: https://clickhouse.com/docs/engines/table-engines
    "Документация ClickHouse: движки таблиц"
  [AggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/aggregatefunction
    "Документация ClickHouse: тип AggregateFunction"
  [SimpleAggregateFunction Type]: https://clickhouse.com/docs/sql-reference/data-types/simpleaggregatefunction
    "Документация ClickHouse: тип SimpleAggregateFunction"
  [ordered-set aggregate functions]: https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE
  [Parametric aggregate functions]: https://clickhouse.com/docs/sql-reference/aggregate-functions/parametric-functions
  [ClickHouse settings]: https://clickhouse.com/docs/operations/settings/settings
    "Документация ClickHouse: параметры сессии"
  [dollar quoting]: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
    "Документация PostgreSQL: строковые константы в формате dollar quoting"
  [library preloading]: https://www.postgresql.org/docs/18/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-PRELOAD
    "Документация PostgreSQL: предзагрузка разделяемых библиотек"