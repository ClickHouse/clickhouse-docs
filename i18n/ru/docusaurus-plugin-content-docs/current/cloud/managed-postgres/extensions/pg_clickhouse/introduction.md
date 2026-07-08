---
sidebar_label: 'Введение'
description: 'Выполняйте аналитические запросы к ClickHouse прямо из PostgreSQL без переписывания SQL'
slug: '/cloud/managed-postgres/extensions/pg_clickhouse'
title: 'Справочник по pg_clickhouse'
doc_type: 'landing-page'
keywords: ['PostgreSQL', 'Postgres', 'FDW', 'foreign data wrapper', 'pg_clickhouse', 'расширение']
---

## Введение \{#introduction\}

[pg&#95;clickhouse] — это расширение PostgreSQL с открытым исходным кодом, которое выполняет аналитические запросы
в ClickHouse прямо из PostgreSQL без переписывания SQL. Оно поддерживает
PostgreSQL 13 и более поздних версий, а также ClickHouse v23 и более поздних версий.

Как только [ClickPipes](/integrations/clickpipes) начнёт синхронизировать данные с ClickHouse,
используйте pg&#95;clickhouse, чтобы быстро и просто [импортировать внешние таблицы] в
схему PostgreSQL. Затем выполняйте существующие запросы PostgreSQL к этим
таблицам, сохраняя текущую кодовую базу и передавая выполнение в
ClickHouse.

## Начало работы \{#getting-started\}

Самый простой способ попробовать pg&#95;clickhouse — воспользоваться [Docker-образ], который содержит
стандартный Docker-образ PostgreSQL с расширениями pg&#95;clickhouse и [re2]:

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres -c 'CREATE EXTENSION pg_clickhouse'
```

См. [руководство], чтобы приступить к импорту таблиц ClickHouse и переносу
запросов на сторону ClickHouse.

## Тестовый пример: TPC-H \{#test-case-tpc-h\}

В этой таблице сравнивается производительность запросов [TPC-H] для обычных
таблиц PostgreSQL и pg&#95;clickhouse, подключённого к ClickHouse; в обоих случаях использован коэффициент
масштабирования 1. ✔︎ означает полный pushdown, а тире — отмену запроса
спустя 1 минуту. Все тесты выполнялись на MacBook Pro M4 Max с 36 ГБ
памяти.

|     Запрос | PostgreSQL | pg&#95;clickhouse | Pushdown |
| ---------: | ---------: | ----------------: | :------: |
|  [Query 1] |    4693 ms |            268 ms |    ✔︎    |
|  [Query 2] |     458 ms |           3446 ms |          |
|  [Query 3] |     742 ms |            111 ms |    ✔︎    |
|  [Query 4] |     270 ms |            130 ms |    ✔︎    |
|  [Query 5] |     337 ms |           1460 ms |    ✔︎    |
|  [Query 6] |     764 ms |             53 ms |    ✔︎    |
|  [Query 7] |     619 ms |             96 ms |    ✔︎    |
|  [Query 8] |     342 ms |            156 ms |    ✔︎    |
|  [Query 9] |    3094 ms |            298 ms |    ✔︎    |
| [Query 10] |     581 ms |            197 ms |    ✔︎    |
| [Query 11] |     212 ms |             24 ms |          |
| [Query 12] |    1116 ms |             84 ms |    ✔︎    |
| [Query 13] |     958 ms |           1368 ms |          |
| [Query 14] |     181 ms |             73 ms |    ✔︎    |
| [Query 15] |    1118 ms |            557 ms |          |
| [Query 16] |     497 ms |           1714 ms |          |
| [Query 17] |    1846 ms |          32709 ms |          |
| [Query 18] |    5823 ms |          10649 ms |          |
| [Query 19] |      53 ms |            206 ms |    ✔︎    |
| [Query 20] |     421 ms |                 - |          |
| [Query 21] |    1349 ms |           4434 ms |          |
| [Query 22] |     258 ms |           1415 ms |          |

### Сборка из исходного кода \{#compile-from-source\}

#### Unix: общий случай \{#general-unix\}

Пакеты для разработки PostgreSQL и curl включают `pg_config` и
`curl-config` в `PATH`, поэтому достаточно просто выполнить `make` (или
`gmake`), затем `make install`, а затем в базе данных выполнить
`CREATE EXTENSION pg_clickhouse`.

#### Debian / Ubuntu / APT \{#debian--ubuntu--apt\}

См. [PostgreSQL Apt], где подробно описано, как получать пакеты из репозитория PostgreSQL Apt.

```sh
sudo apt install \
  postgresql-server-18 \
  libcurl4-openssl-dev \
  uuid-dev \
  libssl-dev \
  make \
  cmake \
  g++
```

#### RedHat / CentOS / Yum \{#redhat--centos--yum\}

```sh
sudo yum install \
  postgresql-server \
  libcurl-devel \
  libuuid-devel \
  openssl-libs \
  automake \
  cmake \
  gcc
```

Подробнее о получении пакетов из репозитория PostgreSQL Yum см. в [PostgreSQL Yum].

#### Установка из PGXN \{#install-from-pgxn\}

После установки указанных выше зависимостей используйте [клиент PGXN] (доступен
через [Homebrew], [Apt] и в виде пакетов Yum под именем `pgxnclient`) для загрузки, компиляции
и установки `pg_clickhouse`:

```sh
pgxn install pg_clickhouse
```

#### Сборка и установка \{#compile-and-install\}

Чтобы собрать и установить библиотеку ClickHouse и `pg_clickhouse`, выполните:

```sh
make
sudo make install
```

{/* XXX DSO в настоящее время отключён.
  По умолчанию `make` выполняет динамическую линковку библиотеки `clickhouse-cpp` (кроме
  macOS, где динамическая библиотека `clickhouse-cpp` пока не поддерживается). Чтобы
  статически включить библиотеку ClickHouse в `pg_clickhouse` при сборке, передайте
  `CH_BUILD=static`:

  ```sh
  make CH_BUILD=static
  sudo make install CH_BUILD=static
  ```
  */ }

Если на вашем хосте установлено несколько версий PostgreSQL, может потребоваться указать
подходящую версию `pg_config`:

```sh
export PG_CONFIG=/usr/lib/postgresql/18/bin/pg_config
make
sudo make install
```

Если `curl-config` отсутствует в переменной PATH на вашем хосте, можно
явно указать путь:

```sh
export CURL_CONFIG=/opt/homebrew/opt/curl/bin/curl-config
make
sudo make install
```

Если вы столкнулись с такой ошибкой:

```text
"Makefile", line 8: Need an operator
```

Вам нужно использовать GNU make, который вполне может быть установлен в вашей системе под именем
`gmake`:

```sh
gmake
gmake install
gmake installcheck
```

Если вы столкнулись с такой ошибкой:

```text
make: pg_config: Command not found
```

Убедитесь, что `pg_config` установлен и доступен в переменной `PATH`. Если вы устанавливали PostgreSQL с помощью системы управления пакетами, например RPM, убедитесь, что пакет `-devel` тоже установлен. При необходимости укажите процессу сборки, где его найти:

```sh
export PG_CONFIG=/path/to/pg_config
make
sudo make install
```

Чтобы установить расширение с пользовательским префиксом в PostgreSQL 18 и более поздних версиях, передайте
аргумент `prefix` цели `install` (но не другим целям `make`):

```sh
sudo make install prefix=/usr/local/extras
```

Затем убедитесь, что префикс указан в следующих [`postgresql.conf`
параметрах]:

```ini
extension_control_path = '/usr/local/extras/postgresql/share:$system'
dynamic_library_path   = '/usr/local/extras/postgresql/lib:$libdir'
```

#### Тестирование \{#testing\}

Чтобы запустить набор тестов, после установки расширения выполните

```sh
make installcheck
```

Если вы столкнулись с ошибкой, например:

```text
ERROR:  must be owner of database regression
```

Вам нужно запустить набор тестов под учетной записью суперпользователя, например
стандартного суперпользователя &quot;postgres&quot;:

```sh
make installcheck PGUSER=postgres
```

### Подключение \{#loading\}

После установки `pg_clickhouse` вы можете подключить его к базе данных, войдя
как суперпользователь и выполнив:

```sql
CREATE EXTENSION pg_clickhouse;
```

Если вы хотите установить `pg_clickhouse` и все связанные с ним объекты в
конкретную схему, используйте конструкцию `SCHEMA`, чтобы указать схему, например:

```sql
CREATE SCHEMA env;
CREATE EXTENSION pg_clickhouse SCHEMA env;
```

## Зависимости \{#dependencies\}

Для расширения `pg_clickhouse` требуются [PostgreSQL] 13 или новее, [libcurl],
[libuuid]. Для сборки расширения требуются компиляторы C и C++, [libSSL], [GNU
make] и [CMake].

## Дорожная карта \{#road-map\}

Сейчас наш главный приоритет — завершить поддержку pushdown для аналитических рабочих нагрузок, прежде
чем добавлять функциональность DML. Наша дорожная карта:

* Обеспечить оптимальное планирование оставшихся 10 запросов TPC-H без pushdown
* Протестировать и доработать pushdown для запросов ClickBench
* Поддержать прозрачный pushdown всех агрегатных функций PostgreSQL
* Поддержать прозрачный pushdown всех функций PostgreSQL
* Разрешить настройки ClickHouse на уровне сервера и сеанса через CREATE SERVER
  и GUC
* Поддержать все типы данных ClickHouse
* Поддержать легковесные DELETE и UPDATE
* Поддержать вставку батчами через COPY
* Добавить функцию для выполнения произвольного запроса ClickHouse и возврата его
  результатов в виде таблиц
* Добавить поддержку pushdown для запросов UNION, если все они обращаются к удаленной
  базе данных

## Авторы \{#authors\}

* [David E. Wheeler](https://justatheory.com/)
* [Ildus Kurbangaliev](https://github.com/ildus)
* [Ibrar Ahmed](https://github.com/ibrarahmad)

## Авторские права \{#copyright\}

* Авторские права (c) 2025-2026, ClickHouse
* Авторские права на отдельные части (c) 2023-2025, Ildus Kurbangaliev
* Авторские права на отдельные части (c) 2019-2023, Adjust GmbH
* Авторские права на отдельные части (c) 2012-2019, PostgreSQL Global Development Group

[pg_clickhouse]: https://github.com/clickHouse/pg_clickhouse "pg_clickhouse на GitHub"

[import foreign tables]: /cloud/managed-postgres/extensions/pg_clickhouse/reference#import-foreign-schema

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse "Последний релиз Docker-образа"

[tutorial]: /cloud/managed-postgres/extensions/pg_clickhouse/tutorial "Руководство по pg_clickhouse"

[PostgreSQL Apt]: https://wiki.postgresql.org/wiki/Apt

[PostgreSQL Yum]: https://yum.postgresql.org

[PGXN client]: https://pgxn.github.io/pgxnclient/ "Документация клиента PGXN"

[Homebrew]: https://formulae.brew.sh/formula/pgxnclient#default "PGXN client в Homebrew"

[Apt]: https://tracker.debian.org/pkg/pgxnclient "PGXN client в Debian Apt"

[`postgresql.conf` parameters]: https://www.postgresql.org/docs/devel/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-OTHER

[PostgreSQL]: https://www.postgresql.org "PostgreSQL: самая совершенная в мире реляционная СУБД с открытым исходным кодом"

[libcurl]: https://curl.se/libcurl/ "libcurl — библиотека для передачи данных по сети"

[libuuid]: https://linux.die.net/man/3/libuuid "libuuid — библиотека универсальных уникальных идентификаторов, совместимая с DCE"

[GNU make]: https://www.gnu.org/software/make "GNU Make"

[CMake]: https://cmake.org/ "CMake: мощная система сборки программного обеспечения"

[LibSSL]: https://openssl-library.org "Библиотека OpenSSL"

[TPC-H]: https://www.tpc.org/tpch/

[re2]: https://github.com/ClickHouse/pg_re2 "pg_re2: regex-функции, совместимые с ClickHouse и использующие RE2"

[Запрос 1] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/1.sql
[Запрос 2] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/2.sql
[Запрос 3] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/3.sql
[Запрос 4] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/4.sql
[Запрос 5] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/5.sql
[Запрос 6] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/6.sql
[Запрос 7] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/7.sql
[Запрос 8] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/8.sql
[Запрос 9] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/9.sql
[Запрос 10] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/10.sql
[Запрос 11] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/11.sql
[Запрос 12] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/12.sql
[Запрос 13] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/13.sql
[Запрос 14] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/14.sql
[Запрос 15] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/15.sql
[Запрос 16] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/16.sql
[Запрос 17] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/17.sql
[Запрос 18] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/18.sql
[Запрос 19] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/19.sql
[Запрос 20] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/20.sql
[Запрос 21] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/21.sql
[Запрос 22] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/22.sql