---
sidebar_label: 'Введение'
description: 'Выполняйте аналитические запросы к ClickHouse напрямую из PostgreSQL, не переписывая SQL‑запросы'
slug: '/integrations/pg_clickhouse'
title: 'Справочная документация по pg_clickhouse'
doc_type: 'landing-page'
keywords: ['PostgreSQL', 'Postgres', 'FDW', 'обёртка внешних данных', 'pg_clickhouse', 'расширение']
---

# pg_clickhouse \{#pg_clickhouse\}

## Введение \{#introduction\}

[pg_clickhouse], расширение PostgreSQL с открытым исходным кодом, выполняет аналитические запросы
в ClickHouse непосредственно из PostgreSQL без переписывания SQL. Оно поддерживает
PostgreSQL 13 и новее и ClickHouse v23 и новее.

Как только [ClickPipes](/integrations/clickpipes) начинают синхронизировать данные в ClickHouse,
используйте pg_clickhouse, чтобы быстро и просто [импортировать внешние таблицы] в
схему PostgreSQL. Затем запускайте ваши существующие PostgreSQL‑запросы по этим
таблицам, сохраняя вашу текущую кодовую базу и при этом передавая выполнение запросов в ClickHouse.

## Начало работы \{#getting-started\}

Самый простой способ попробовать pg&#95;clickhouse — воспользоваться [образом Docker], который
содержит стандартный Docker-образ PostgreSQL с расширением pg&#95;clickhouse:

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres -c 'CREATE EXTENSION pg_clickhouse'
```

См. [руководство], чтобы начать импорт таблиц ClickHouse и настроить проталкивание запросов.


## Тестовый пример: TPC-H \{#test-case-tpc-h\}

В этой таблице сравнивается производительность запросов [TPC-H] между обычными таблицами PostgreSQL и таблицами pg&#95;clickhouse, подключёнными к ClickHouse, при коэффициенте масштабирования 1; ✔︎ означает полное проталкивание вычислений (full pushdown), а дефис — отмену запроса по истечении 1 минуты. Все тесты запускались на MacBook Pro M4 Max с 36 ГБ ОЗУ.

|      Запрос | PostgreSQL | pg&#95;clickhouse | Pushdown |
| ----------: | ---------: | ----------------: | :------: |
|  [Запрос 1] |    4693 ms |            268 ms |    ✔︎    |
|  [Запрос 2] |     458 ms |           3446 ms |          |
|  [Запрос 3] |     742 ms |            111 ms |    ✔︎    |
|  [Запрос 4] |     270 ms |            130 ms |    ✔︎    |
|  [Запрос 5] |     337 ms |           1460 ms |    ✔︎    |
|  [Запрос 6] |     764 ms |             53 ms |    ✔︎    |
|  [Запрос 7] |     619 ms |             96 ms |    ✔︎    |
|  [Запрос 8] |     342 ms |            156 ms |    ✔︎    |
|  [Запрос 9] |    3094 ms |            298 ms |    ✔︎    |
| [Запрос 10] |     581 ms |            197 ms |    ✔︎    |
| [Запрос 11] |     212 ms |             24 ms |          |
| [Запрос 12] |    1116 ms |             84 ms |    ✔︎    |
| [Запрос 13] |     958 ms |           1368 ms |          |
| [Запрос 14] |     181 ms |             73 ms |    ✔︎    |
| [Запрос 15] |    1118 ms |            557 ms |          |
| [Запрос 16] |     497 ms |           1714 ms |          |
| [Запрос 17] |    1846 ms |          32709 ms |          |
| [Запрос 18] |    5823 ms |          10649 ms |          |
| [Запрос 19] |      53 ms |            206 ms |    ✔︎    |
| [Запрос 20] |     421 ms |                 - |          |
| [Запрос 21] |    1349 ms |           4434 ms |          |
| [Запрос 22] |     258 ms |           1415 ms |          |

### Сборка из исходного кода \{#compile-from-source\}

#### Общий Unix \{#general-unix\}

Пакеты разработки PostgreSQL и curl добавляют `pg_config` и
`curl-config` в PATH, поэтому вы можете просто выполнить `make` (или
`gmake`), затем `make install`, а затем в вашей базе данных выполнить
`CREATE EXTENSION pg_clickhouse`.

#### Debian / Ubuntu / APT \{#debian--ubuntu--apt\}

Подробнее о получении пакетов из репозитория PostgreSQL Apt см. в разделе [PostgreSQL Apt].

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


#### Red Hat / CentOS / Yum \{#redhat--centos--yum\}

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

См. [PostgreSQL Yum] для получения подробных сведений о получении пакетов из репозитория PostgreSQL Yum.


#### Установка из PGXN \{#install-from-pgxn\}

После установки указанных выше зависимостей используйте [PGXN client] (доступен в виде пакетов [Homebrew], [Apt] и Yum с именем `pgxnclient`), чтобы загрузить, скомпилировать
и установить `pg_clickhouse`:

```sh
pgxn install pg_clickhouse
```


#### Компиляция и установка \{#compile-and-install\}

Чтобы скомпилировать и установить библиотеку ClickHouse и `pg_clickhouse`, выполните:

```sh
make
sudo make install
```

{/* XXX DSO в настоящее время отключён.
  По умолчанию `make` динамически линкует библиотеку `clickhouse-cpp` (кроме
  macOS, где динамическая библиотека `clickhouse-cpp` пока не поддерживается). Чтобы
  статически собрать библиотеку ClickHouse в `pg_clickhouse`, передайте
  `CH_BUILD=static`:

  ```sh
  make CH_BUILD=static
  sudo make install CH_BUILD=static
  ```
  */ }

Если на вашем хосте установлено несколько версий PostgreSQL, вам может понадобиться
указать подходящую версию утилиты `pg_config`:

```sh
export PG_CONFIG=/usr/lib/postgresql/18/bin/pg_config
make
sudo make install
```

Если `curl-config` отсутствует в переменной окружения `PATH` на вашем хосте, вы можете явно указать путь:

```sh
export CURL_CONFIG=/opt/homebrew/opt/curl/bin/curl-config
make
sudo make install
```

Если вы получите ошибку вроде следующей:

```text
"Makefile", line 8: Need an operator
```

Вам нужно использовать GNU make, который, вероятнее всего, уже установлен в вашей системе под именем
`gmake`:

```sh
gmake
gmake install
gmake installcheck
```

Если вы видите ошибку вроде следующей:

```text
make: pg_config: Command not found
```

Убедитесь, что у вас установлен `pg_config` и что он находится в переменной окружения `PATH`. Если вы использовали систему управления пакетами, такую как RPM, для установки PostgreSQL, убедитесь, что пакет `-devel` также установлен. При необходимости укажите процессу сборки, где его найти:

```sh
export PG_CONFIG=/path/to/pg_config
make
sudo make install
```

Чтобы установить расширение в пользовательский префикс в PostgreSQL 18 или более поздней версии, передайте
аргумент `prefix` цели `install` (но не другим целям `make`):

```sh
sudo make install prefix=/usr/local/extras
```

Затем убедитесь, что префикс указан в следующих параметрах [`postgresql.conf` parameters]:

```ini
extension_control_path = '/usr/local/extras/postgresql/share:$system'
dynamic_library_path   = '/usr/local/extras/postgresql/lib:$libdir'
```


#### Тестирование \{#testing\}

После установки расширения для запуска набора тестов выполните

```sh
make installcheck
```

Если вы получите ошибку вроде следующей:

```text
ERROR:  must be owner of database regression
```

Необходимо запускать набор тестов от имени суперпользователя, например,
суперпользователя по умолчанию «postgres»:

```sh
make installcheck PGUSER=postgres
```


### Загрузка \{#loading\}

После установки `pg_clickhouse` вы можете добавить его в базу данных, подключившись
как суперпользователь и выполнив:

```sql
CREATE EXTENSION pg_clickhouse;
```

Если вы хотите установить `pg_clickhouse` и все его вспомогательные объекты
в определённую схему, используйте предложение `SCHEMA`, чтобы указать схему следующим образом:

```sql
CREATE SCHEMA env;
CREATE EXTENSION pg_clickhouse SCHEMA env;
```


## Зависимости \{#dependencies\}

Расширение `pg_clickhouse` требует [PostgreSQL] версии 13 или более новой, [libcurl],
[libuuid]. Для сборки расширения требуются компиляторы C и C++, [libSSL], [GNU
make] и [CMake].

## Дорожная карта \{#road-map\}

Наш главный приоритет — завершить реализацию pushdown для аналитических нагрузок
прежде, чем добавлять возможности DML. Наша дорожная карта:

*   Оптимально спланировать оставшиеся 10 запросов TPC-H, для которых еще не выполняется pushdown
*   Протестировать и исправить pushdown для запросов ClickBench
*   Реализовать прозрачный pushdown для всех агрегатных функций PostgreSQL
*   Реализовать прозрачный pushdown для всех функций PostgreSQL
*   Разрешить использование настроек ClickHouse на уровне сервера и сессии через
    CREATE SERVER и GUC
*   Поддержать все типы данных ClickHouse
*   Поддержать легковесное удаление (DELETE) и операции UPDATE
*   Поддержать пакетную вставку через COPY
*   Добавить функцию для выполнения произвольного запроса ClickHouse и возврата
    его результатов в виде таблицы
*   Добавить поддержку pushdown для запросов UNION, когда все они обращаются к
    удаленной базе данных

## Авторы \{#authors\}

*   [David E. Wheeler](https://justatheory.com/)
*   [Ildus Kurbangaliev](https://github.com/ildus)
*   [Ibrar Ahmed](https://github.com/ibrarahmad)

## Авторские права \{#copyright\}

*   Copyright (c) 2025-2026, ClickHouse
*   Отдельные части Copyright (c) 2023-2025, Ildus Kurbangaliev
*   Отдельные части Copyright (c) 2019-2023, Adjust GmbH
*   Отдельные части Copyright (c) 2012-2019, PostgreSQL Global Development Group

[pg_clickhouse]: https://github.com/clickHouse/pg_clickhouse
    "pg_clickhouse на GitHub"

[import foreign tables]: /integrations/pg_clickhouse/reference#import-foreign-schema

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse
    "Последний выпуск Docker-образа"

[tutorial]: /integrations/pg_clickhouse/tutorial "Учебное руководство по pg_clickhouse"

[PostgreSQL Apt]: https://wiki.postgresql.org/wiki/Apt

[PostgreSQL Yum]: https://yum.postgresql.org

[PGXN client]: https://pgxn.github.io/pgxnclient/ "Документация по PGXN Client"

[Homebrew]: https://formulae.brew.sh/formula/pgxnclient#default
    "PGXN client в Homebrew"

[Apt]: https://tracker.debian.org/pkg/pgxnclient
    "PGXN client в Debian Apt"

[`postgresql.conf` parameters]: https://www.postgresql.org/docs/devel/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-OTHER

[PostgreSQL]: https://www.postgresql.org "PostgreSQL: самая продвинутая в мире система управления реляционными базами данных с открытым исходным кодом"

[libcurl]: https://curl.se/libcurl/ "libcurl — сетевая библиотека для передачи данных"

[libuuid]: https://linux.die.net/man/3/libuuid "libuuid — библиотека универсальных уникальных идентификаторов, совместимая с DCE"

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