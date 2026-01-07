---
sidebar_label: 'Введение'
description: 'Выполняйте аналитические запросы к ClickHouse прямо из PostgreSQL без переписывания SQL-запросов'
slug: '/integrations/pg_clickhouse'
title: 'Справочная документация по pg_clickhouse'
doc_type: 'landing-page'
keywords: ['PostgreSQL', 'Postgres', 'FDW', 'обёртка внешних данных', 'pg_clickhouse', 'расширение']
---

# pg_clickhouse {#pg_clickhouse}

## Введение {#introduction}

[pg_clickhouse] — это расширение PostgreSQL с открытым исходным кодом, позволяющее выполнять
аналитические запросы в ClickHouse прямо из PostgreSQL без переписывания SQL. Оно поддерживает
PostgreSQL 13 и выше и ClickHouse v23 и выше.

Когда [ClickPipes](/integrations/clickpipes) начинает синхронизировать данные с ClickHouse,
используйте pg_clickhouse, чтобы быстро [import foreign tables] в
схему PostgreSQL. Затем запускайте существующие запросы PostgreSQL к этим
таблицам, сохраняя текущую кодовую базу и при этом передавая выполнение запросов в
ClickHouse.

## Первые шаги {#getting-started}

Самый простой способ опробовать pg&#95;clickhouse — использовать [Docker image],
который представляет собой стандартный Docker-образ PostgreSQL с расширением pg&#95;clickhouse:

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres -c 'CREATE EXTENSION pg_clickhouse'
```

См. [руководство], чтобы начать импортировать таблицы ClickHouse и выполнять
запросы на стороне ClickHouse.


## Тестовый сценарий: TPC-H {#test-case-tpc-h}

В этой таблице сравнивается производительность запросов [TPC-H] между
обычными таблицами PostgreSQL и pg_clickhouse, подключённым к ClickHouse,
в обоих случаях использован коэффициент масштабирования 1; ✅ обозначает
полный pushdown, а дефис — отмену запроса через 1 минуту. Все тесты
запускались на MacBook Pro M4 Max с 36 ГБ памяти.

| Query      | Pushdown | pg_clickhouse | PostgreSQL |
| ---------: | :------: | ------------: | ---------: |
|  [Query 1] |     ✅    |         73ms  |     4478ms |
|  [Query 2] |          |             - |      560ms |
|  [Query 3] |     ✅    |          74ms |     1454ms |
|  [Query 4] |     ✅    |          67ms |      650ms |
|  [Query 5] |     ✅    |         104ms |      452ms |
|  [Query 6] |     ✅    |          42ms |      740ms |
|  [Query 7] |     ✅    |          83ms |      633ms |
|  [Query 8] |     ✅    |         114ms |      320ms |
|  [Query 9] |     ✅    |         136ms |     3028ms |
| [Query 10] |     ✅    |          10ms |        6ms |
| [Query 11] |     ✅    |          78ms |      213ms |
| [Query 12] |     ✅    |          37ms |     1101ms |
| [Query 13] |          |        1242ms |      967ms |
| [Query 14] |     ✅    |          51ms |      193ms |
| [Query 15] |          |         522ms |     1095ms |
| [Query 16] |          |        1797ms |      492ms |
| [Query 17] |          |           9ms |     1802ms |
| [Query 18] |          |          10ms |     6185ms |
| [Query 19] |          |         532ms |       64ms |
| [Query 20] |          |        4595ms |      473ms |
| [Query 21] |          |        1702ms |     1334ms |
| [Query 22] |          |         268ms |      257ms |

### Сборка из исходного кода {#compile-from-source}

#### Прочие Unix-системы {#general-unix}

Пакеты разработки для PostgreSQL и curl включают `pg_config` и
`curl-config` в `PATH`, поэтому вы можете просто выполнить `make` (или
`gmake`), затем `make install`, а затем выполнить в вашей базе данных команду `CREATE EXTENSION http`.

#### Debian / Ubuntu / APT {#debian--ubuntu--apt}

Подробности см. в разделе [PostgreSQL Apt], описывающем использование репозитория PostgreSQL Apt.

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


#### RedHat / CentOS / Yum {#redhat--centos--yum}

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

Подробности о получении пакетов из репозитория PostgreSQL Yum см. в разделе [PostgreSQL Yum].


#### Установка из PGXN {#install-from-pgxn}

После установки всех перечисленных выше зависимостей используйте [PGXN client] (доступен в виде пакетов [Homebrew], [Apt] и Yum с именем `pgxnclient`), чтобы загрузить, скомпилировать
и установить `pg_clickhouse`:

```sh
pgxn install pg_clickhouse
```


#### Сборка и установка {#compile-and-install}

Чтобы собрать и установить библиотеку ClickHouse и `pg_clickhouse`, выполните следующую команду:

```sh
make
sudo make install
```

{/* XXX DSO currently disabled.
  По умолчанию `make` динамически подключает библиотеку `clickhouse-cpp` (за
  исключением macOS, где динамическая библиотека `clickhouse-cpp` пока не
  поддерживается). Чтобы статически включить библиотеку ClickHouse в
  `pg_clickhouse`, передайте `CH_BUILD=static`:

  ```sh
  make CH_BUILD=static
  sudo make install CH_BUILD=static
  ```
  */ }

Если на вашем хосте установлено несколько версий PostgreSQL, вам может понадобиться указать
нужную версию `pg_config`:

```sh
export PG_CONFIG=/usr/lib/postgresql/18/bin/pg_config
make
sudo make install
```

Если утилита `curl-config` отсутствует в `PATH` на хосте, вы можете явно указать к ней путь:

```sh
export CURL_CONFIG=/opt/homebrew/opt/curl/bin/curl-config
make
sudo make install
```

Если вы столкнетесь с такой ошибкой, как:

```text
"Makefile", line 8: Need an operator
```

Вам нужно использовать GNU make, который может быть установлен на вашей системе как
`gmake`:

```sh
gmake
gmake install
gmake installcheck
```

Если вы получите ошибку вроде следующей:

```text
make: pg_config: Command not found
```

Убедитесь, что `pg_config` установлен и находится в вашем `PATH`. Если вы устанавливали PostgreSQL с помощью
системы управления пакетами, такой как RPM, убедитесь, что пакет
`-devel` также установлен. При необходимости укажите процессу сборки, где найти `pg_config`:

```sh
export PG_CONFIG=/path/to/pg_config
make
sudo make install
```

Чтобы установить расширение в пользовательский префикс в PostgreSQL 18 или более поздней версии, передайте
аргумент `prefix` команде `install` (но не другим целям `make`):

```sh
sudo make install prefix=/usr/local/extras
```

Затем убедитесь, что префикс указан в следующих параметрах файла [`postgresql.conf`]:

```ini
extension_control_path = '/usr/local/extras/postgresql/share:$system'
dynamic_library_path   = '/usr/local/extras/postgresql/lib:$libdir'
```


#### Тестирование {#testing}

После установки расширения для запуска набора тестов выполните

```sh
make installcheck
```

Если вы столкнётесь с ошибкой, например:

```text
ERROR:  must be owner of database regression
```

Нужно запустить набор тестов от имени суперпользователя, например, стандартного суперпользователя по умолчанию &quot;postgres&quot;:

```sh
make installcheck PGUSER=postgres
```


### Загрузка {#loading}

После установки `pg_clickhouse` вы можете добавить его в базу данных, подключившись с правами суперпользователя и выполнив следующую команду:

```sql
CREATE EXTENSION pg_clickhouse;
```

Если вы хотите установить `pg_clickhouse` и все его вспомогательные объекты в
определённую схему, используйте предложение `SCHEMA`, чтобы указать эту схему следующим образом:

```sql
CREATE SCHEMA env;
CREATE EXTENSION pg_clickhouse SCHEMA env;
```


## Зависимости {#dependencies}

Для работы расширения `pg_clickhouse` требуются [PostgreSQL] 13 или новее, [libcurl],
[libuuid]. Для сборки расширения необходимы компилятор C и C++, [libSSL], [GNU
make] и [CMake].

## Дорожная карта {#road-map}

Наш главный приоритет — завершить покрытие pushdown-оптимизаций для аналитических нагрузок, прежде чем добавлять функции DML. Наша дорожная карта:

*   Добиться оптимального планирования для оставшихся 10 запросов TPC-H, для которых ещё не выполняется pushdown
*   Протестировать и исправить pushdown для запросов ClickBench
*   Обеспечить прозрачный pushdown всех агрегатных функций PostgreSQL
*   Обеспечить прозрачный pushdown всех функций PostgreSQL
*   Разрешить задание параметров ClickHouse на уровне сервера и сессии с помощью CREATE SERVER
    и GUC
*   Поддержать все типы данных ClickHouse
*   Поддержать операции легковесного DELETE и UPDATE
*   Поддержать пакетную вставку через COPY
*   Добавить функцию для выполнения произвольного запроса ClickHouse и возврата его
    результатов в виде таблицы
*   Добавить поддержку pushdown для запросов с UNION, когда все они обращаются к удалённой
    базе данных

## Авторы {#authors}

*   [David E. Wheeler](https://justatheory.com/)
*   [Ildus Kurbangaliev](https://github.com/ildus)
*   [Ibrar Ahmed](https://github.com/ibrarahmad)

## Авторские права {#copyright}

*   Copyright (c) 2025-2026, ClickHouse
*   Отдельные части — Copyright (c) 2023-2025, Ildus Kurbangaliev
*   Отдельные части — Copyright (c) 2019-2023, Adjust GmbH
*   Отдельные части — Copyright (c) 2012-2019, PostgreSQL Global Development Group

[pg_clickhouse]: https://github.com/clickHouse/pg_clickhouse
    "pg_clickhouse на GitHub"

[import foreign tables]: /integrations/pg_clickhouse/reference#import-foreign-schema

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse
    "Последний Docker-релиз"

[tutorial]: /integrations/pg_clickhouse/tutorial "Учебное руководство по pg_clickhouse"

[PostgreSQL Apt]: https://wiki.postgresql.org/wiki/Apt

[PostgreSQL Yum]: https://yum.postgresql.org

[PGXN client]: https://pgxn.github.io/pgxnclient/ "Документация клиента PGXN"

[Homebrew]: https://formulae.brew.sh/formula/pgxnclient#default
    "Клиент PGXN в Homebrew"

[Apt]: https://tracker.debian.org/pkg/pgxnclient
    "Клиент PGXN в Debian Apt"

[`postgresql.conf` parameters]: https://www.postgresql.org/docs/devel/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-OTHER

[PostgreSQL]: https://www.postgresql.org "PostgreSQL: самая продвинутая в мире свободная реляционная база данных с открытым исходным кодом"

[libcurl]: https://curl.se/libcurl/ "libcurl — ваша библиотека сетевого обмена данными"

[libuuid]: https://linux.die.net/man/3/libuuid "libuuid — совместимая с DCE библиотека Universally Unique Identifier"

[GNU make]: https://www.gnu.org/software/make "GNU Make"

[CMake]: https://cmake.org/ "CMake: мощная система сборки программного обеспечения"

[LibSSL]: https://openssl-library.org "Библиотека OpenSSL"

[TPC-H]: https://www.tpc.org/tpch/

[Query 1]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/1.sql

[Query 2]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/2.sql

[Query 3]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/3.sql

[Query 4]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/4.sql

[Query 5]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/5.sql

[Query 6]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/6.sql

[Query 7]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/7.sql

[Query 8]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/8.sql

[Query 9]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/9.sql

[Query 10]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/10.sql

[Query 11]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/11.sql

[Query 12]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/12.sql

[Query 13]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/13.sql

[Query 14]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/14.sql

[Query 15]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/15.sql

[Query 16]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/16.sql

[Query 17]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/17.sql

[Query 18]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/18.sql

[Query 19]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/19.sql

[Query 20]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/20.sql

[Query 21]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/21.sql

[Query 22]: https://github.com/Vonng/pgtpc/blob/master/tpch/queries/22.sql