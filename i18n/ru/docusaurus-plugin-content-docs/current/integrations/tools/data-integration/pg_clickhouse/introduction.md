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


## Тестовый пример: TPC-H {#test-case-tpc-h}

В этой таблице сравнивается производительность запросов [TPC-H] между
обычными таблицами PostgreSQL и pg_clickhouse, подключённым к ClickHouse; обе
загружены с коэффициентом масштабирования 1. ✔︎ обозначает полный
pushdown, тире — отмену запроса по истечении 1 минуты. Все тесты
выполнялись на MacBook Pro M4 Max с 36 ГБ памяти.

<!-- cd dev/tpch && make ch && make pg && make run -->

|    Запрос  | PostgreSQL | pg_clickhouse | Pushdown |
| ----------:| ----------:| -------------:|:--------:|
|  [Query 1] |    4693 ms |        268 ms |     ✔︎    |
|  [Query 2] |     458 ms |       3446 ms |          |
|  [Query 3] |     742 ms |        111 ms |     ✔︎    |
|  [Query 4] |     270 ms |        130 ms |     ✔︎    |
|  [Query 5] |     337 ms |       1460 ms |     ✔︎    |
|  [Query 6] |     764 ms |         53 ms |     ✔︎    |
|  [Query 7] |     619 ms |         96 ms |     ✔︎    |
|  [Query 8] |     342 ms |        156 ms |     ✔︎    |
|  [Query 9] |    3094 ms |        298 ms |     ✔︎    |
| [Query 10] |     581 ms |        197 ms |     ✔︎    |
| [Query 11] |     212 ms |         24 ms |     ✔︎    |
| [Query 12] |    1116 ms |         84 ms |     ✔︎    |
| [Query 13] |     958 ms |       1368 ms |          |
| [Query 14] |     181 ms |         73 ms |     ✔︎    |
| [Query 15] |    1118 ms |        557 ms |          |
| [Query 16] |     497 ms |       1714 ms |          |
| [Query 17] |    1846 ms |      32709 ms |          |
| [Query 18] |    5823 ms |      10649 ms |          |
| [Query 19] |      53 ms |        206 ms |     ✔︎    |
| [Query 20] |     421 ms |             - |          |
| [Query 21] |    1349 ms |       4434 ms |          |
| [Query 22] |     258 ms |       1415 ms |          |

### Сборка из исходного кода {#compile-from-source}

#### Прочие Unix-системы {#general-unix}

Пакеты разработки для PostgreSQL и curl включают `pg_config` и
`curl-config` в `PATH`, поэтому вы можете просто выполнить `make` (или
`gmake`), затем `make install`, а затем выполнить в вашей базе данных команду `CREATE EXTENSION pg_clickhouse`.

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

[Запрос 1] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/1.sql
  [Запрос 2] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/2.sql
  [Запрос 3] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/3.sql
  [Запрос 4] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/4.sql
  [Запрос 5] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/5.sql
  [Запрос 6] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/6.sql
  [Запрос 7] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/7.sql
  [Запрос 8] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/8.sql
  [Запрос 9] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/9.sql
  [Запрос 10] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/10.sql
  [Запрос 11] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/11.sql
  [Запрос 12] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/12.sql
  [Запрос 13] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/13.sql
  [Запрос 14] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/14.sql
  [Запрос 15] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/15.sql
  [Запрос 16] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/16.sql
  [Запрос 17] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/17.sql
  [Запрос 18] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/18.sql
  [Запрос 19] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/19.sql
  [Запрос 20] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/20.sql
  [Запрос 21] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/21.sql
  [Запрос 22] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/22.sql