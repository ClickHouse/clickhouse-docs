---
sidebar_label: 'Руководства'
slug: /integrations/dbt/guides
sidebar_position: 2
description: 'Руководства по использованию dbt с ClickHouse'
keywords: ['clickhouse', 'dbt', 'руководства']
title: 'Руководства'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import dbt_01 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_01.png';
import dbt_02 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_02.png';
import dbt_03 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_03.png';
import dbt_04 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_04.png';
import dbt_05 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_05.png';
import dbt_06 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_06.png';
import dbt_07 from '@site/static/images/integrations/data-ingestion/etl-tools/dbt/dbt_07.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Руководства {#guides}

<ClickHouseSupportedBadge/>

В этом разделе приведены руководства по настройке dbt и адаптера ClickHouse, а также пример использования dbt с ClickHouse на основе общедоступного датасета IMDB. В примере рассматриваются следующие шаги:

1. Создание проекта dbt и настройка адаптера ClickHouse.
2. Определение модели.
3. Обновление модели.
4. Создание инкрементальной модели.
5. Создание snapshot-модели.
6. Использование материализованных представлений.

Эти руководства предназначены для использования в сочетании с остальной [документацией](/integrations/dbt) и разделом [возможностей и конфигураций](/integrations/dbt/features-and-configurations).

<TOCInline toc={toc}  maxHeadingLevel={2} />

## Настройка {#setup}

Следуйте инструкциям из раздела [Настройка dbt и адаптера ClickHouse](/integrations/dbt), чтобы подготовить ваше окружение.

**Важно: приведённые ниже инструкции протестированы с Python 3.9.**

### Подготовка ClickHouse {#prepare-clickhouse}

dbt особенно эффективен при моделировании сильно связанных реляционных данных. В качестве примера мы предоставляем небольшой набор данных IMDB со следующей реляционной схемой. Этот набор данных взят из [репозитория реляционных наборов данных](https://relational.fit.cvut.cz/dataset/IMDb). Он тривиален по сравнению с типичными схемами, используемыми с dbt, но является удобным для работы примером:

<Image img={dbt_01} size="lg" alt="Схема таблиц IMDB" />

Мы используем подмножество этих таблиц, показанное выше.

Создайте следующие таблицы:

```sql
CREATE DATABASE imdb;

CREATE TABLE imdb.actors
(
    id         UInt32,
    first_name String,
    last_name  String,
    gender     FixedString(1)
) ENGINE = MergeTree ORDER BY (id, first_name, last_name, gender);

CREATE TABLE imdb.directors
(
    id         UInt32,
    first_name String,
    last_name  String
) ENGINE = MergeTree ORDER BY (id, first_name, last_name);

CREATE TABLE imdb.genres
(
    movie_id UInt32,
    genre    String
) ENGINE = MergeTree ORDER BY (movie_id, genre);

CREATE TABLE imdb.movie_directors
(
    director_id UInt32,
    movie_id    UInt64
) ENGINE = MergeTree ORDER BY (director_id, movie_id);

CREATE TABLE imdb.movies
(
    id   UInt32,
    name String,
    year UInt32,
    rank Float32 DEFAULT 0
) ENGINE = MergeTree ORDER BY (id, name, year);

CREATE TABLE imdb.roles
(
    actor_id   UInt32,
    movie_id   UInt32,
    role       String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree ORDER BY (actor_id, movie_id);
```

:::note
Столбец `created_at` в таблице `roles` по умолчанию имеет значение `now()`. Позже мы используем его, чтобы определять инкрементальные обновления наших моделей — см. раздел [Incremental Models](#creating-an-incremental-materialization).
:::

Мы используем функцию `s3` для чтения исходных данных из публичных конечных точек и вставки этих данных. Выполните следующие команды, чтобы заполнить таблицы:

```sql
INSERT INTO imdb.actors
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_actors.tsv.gz',
'TSVWithNames');

INSERT INTO imdb.directors
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_directors.tsv.gz',
'TSVWithNames');

INSERT INTO imdb.genres
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_movies_genres.tsv.gz',
'TSVWithNames');

INSERT INTO imdb.movie_directors
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_movies_directors.tsv.gz',
        'TSVWithNames');

INSERT INTO imdb.movies
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_movies.tsv.gz',
'TSVWithNames');

INSERT INTO imdb.roles(actor_id, movie_id, role)
SELECT actor_id, movie_id, role
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/imdb/imdb_ijs_roles.tsv.gz',
'TSVWithNames');
```

Время выполнения этих операций может различаться в зависимости от пропускной способности вашего соединения, но каждая из них должна занимать всего несколько секунд. Выполните следующий запрос, чтобы получить сводную статистику по каждому актёру, упорядоченную по числу появлений в фильмах, и убедиться, что данные были успешно загружены:

```sql
SELECT id,
       any(actor_name)          AS name,
       uniqExact(movie_id)    AS num_movies,
       avg(rank)                AS avg_rank,
       uniqExact(genre)         AS unique_genres,
       uniqExact(director_name) AS uniq_directors,
       max(created_at)          AS updated_at
FROM (
         SELECT imdb.actors.id  AS id,
                concat(imdb.actors.first_name, ' ', imdb.actors.last_name)  AS actor_name,
                imdb.movies.id AS movie_id,
                imdb.movies.rank AS rank,
                genre,
                concat(imdb.directors.first_name, ' ', imdb.directors.last_name) AS director_name,
                created_at
         FROM imdb.actors
                  JOIN imdb.roles ON imdb.roles.actor_id = imdb.actors.id
                  LEFT OUTER JOIN imdb.movies ON imdb.movies.id = imdb.roles.movie_id
                  LEFT OUTER JOIN imdb.genres ON imdb.genres.movie_id = imdb.movies.id
                  LEFT OUTER JOIN imdb.movie_directors ON imdb.movie_directors.movie_id = imdb.movies.id
                  LEFT OUTER JOIN imdb.directors ON imdb.directors.id = imdb.movie_directors.director_id
         )
GROUP BY id
ORDER BY num_movies DESC
LIMIT 5;
```

Ответ должен выглядеть следующим образом:

```response
+------+------------+----------+------------------+-------------+--------------+-------------------+
|id    |name        |num_movies|avg_rank          |unique_genres|uniq_directors|updated_at         |
+------+------------+----------+------------------+-------------+--------------+-------------------+
|45332 |Mel Blanc   |832       |6.175853582979779 |18           |84            |2022-04-26 14:01:45|
|621468|Bess Flowers|659       |5.57727638854796  |19           |293           |2022-04-26 14:01:46|
|372839|Lee Phelps  |527       |5.032976449684617 |18           |261           |2022-04-26 14:01:46|
|283127|Tom London  |525       |2.8721716524875673|17           |203           |2022-04-26 14:01:46|
|356804|Bud Osborne |515       |2.0389507108727773|15           |149           |2022-04-26 14:01:46|
+------+------------+----------+------------------+-------------+--------------+-------------------+
```

В последующих руководствах мы превратим этот запрос в модель, материализовав его в ClickHouse как представление и таблицу в dbt.

## Подключение к ClickHouse {#connecting-to-clickhouse}

1. Создайте проект dbt. В этом примере мы назовём его так же, как наш источник `imdb`. Когда появится запрос, выберите `clickhouse` в качестве источника базы данных.

    ```bash
    clickhouse-user@clickhouse:~$ dbt init imdb

    16:52:40  Running with dbt=1.1.0
    Which database would you like to use?
    [1] clickhouse

    (Don't see the one you want? https://docs.getdbt.com/docs/available-adapters)

    Enter a number: 1
    16:53:21  No sample profile found for clickhouse.
    16:53:21
    Your new dbt project "imdb" was created!

    For more information on how to configure the profiles.yml file,
    please consult the dbt documentation here:

    https://docs.getdbt.com/docs/configure-your-profile
    ```

2. Перейдите в каталог проекта с помощью команды `cd`:

    ```bash
    cd imdb
    ```

3. На этом этапе вам понадобится текстовый редактор по вашему выбору. В примерах ниже мы используем популярный VS Code. Открыв каталог imdb, вы должны увидеть набор файлов yml и sql:

    <Image img={dbt_02} size="lg" alt="Новый проект dbt" />

4. Обновите файл `dbt_project.yml`, чтобы указать нашу первую модель — `actor_summary`, а также установить профиль `clickhouse_imdb`.

    <Image img={dbt_03} size="lg" alt="Профиль dbt" />

    <Image img={dbt_04} size="lg" alt="Профиль dbt" />

5. Далее нам нужно предоставить dbt параметры подключения к нашему экземпляру ClickHouse. Добавьте следующее в `~/.dbt/profiles.yml`.

    ```yml
    clickhouse_imdb:
      target: dev
      outputs:
        dev:
          type: clickhouse
          schema: imdb_dbt
          host: localhost
          port: 8123
          user: default
          password: ''
          secure: False
    ```

    Обратите внимание на необходимость изменить значения `user` и `password`. Дополнительные доступные настройки задокументированы [здесь](https://github.com/silentsokolov/dbt-clickhouse#example-profile).

6. Из каталога imdb выполните команду `dbt debug`, чтобы проверить, может ли dbt подключиться к ClickHouse.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt debug
    17:33:53  Running with dbt=1.1.0
    dbt version: 1.1.0
    python version: 3.10.1
    python path: /home/dale/.pyenv/versions/3.10.1/bin/python3.10
    os info: Linux-5.13.0-10039-tuxedo-x86_64-with-glibc2.31
    Using profiles.yml file at /home/dale/.dbt/profiles.yml
    Using dbt_project.yml file at /opt/dbt/imdb/dbt_project.yml

    Configuration:
    profiles.yml file [OK found and valid]
    dbt_project.yml file [OK found and valid]

    Required dependencies:
    - git [OK found]

    Connection:
    host: localhost
    port: 8123
    user: default
    schema: imdb_dbt
    secure: False
    verify: False
    Connection test: [OK connection ok]

    All checks passed!
    ```

    Убедитесь, что в ответе содержится строка `Connection test: [OK connection ok]`, что указывает на успешное подключение.

## Создание простой материализации представления {#creating-a-simple-view-materialization}

При использовании материализации представления модель при каждом запуске пересоздаётся как представление с помощью оператора `CREATE VIEW AS` в ClickHouse. Это не требует дополнительного хранения данных, но запросы к таким моделям будут выполняться медленнее, чем к материализованным в виде таблиц.

1. Из папки `imdb` удалите каталог `models/example`:

    ```bash
    clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
    ```

2. Создайте новую папку `actors` внутри каталога `models`. Здесь мы создадим файлы, каждый из которых представляет модель актёра:

    ```bash
    clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
    ```

3. Создайте файлы `schema.yml` и `actor_summary.sql` в папке `models/actors`.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
    ```
    Файл `schema.yml` описывает наши таблицы. Впоследствии они будут доступны для использования в макросах. Отредактируйте
    `models/actors/schema.yml`, чтобы он содержал следующее:
    ```yml
    version: 2

    sources:
    - name: imdb
      tables:
      - name: directors
      - name: actors
      - name: roles
      - name: movies
      - name: genres
      - name: movie_directors
    ```
    Файл `actors_summary.sql` определяет саму модель. Обратите внимание, что в функции config мы также указываем, что модель должна быть материализована как представление в ClickHouse. Наши таблицы ссылаются из файла `schema.yml` через функцию `source`, например `source('imdb', 'movies')` ссылается на таблицу `movies` в базе данных `imdb`. Отредактируйте `models/actors/actors_summary.sql`, чтобы он содержал следующее:
    ```sql
    {{ config(materialized='view') }}

    with actor_summary as (
    SELECT id,
        any(actor_name) as name,
        uniqExact(movie_id)    as num_movies,
        avg(rank)                as avg_rank,
        uniqExact(genre)         as genres,
        uniqExact(director_name) as directors,
        max(created_at) as updated_at
    FROM (
            SELECT {{ source('imdb', 'actors') }}.id as id,
                    concat({{ source('imdb', 'actors') }}.first_name, ' ', {{ source('imdb', 'actors') }}.last_name) as actor_name,
                    {{ source('imdb', 'movies') }}.id as movie_id,
                    {{ source('imdb', 'movies') }}.rank as rank,
                    genre,
                    concat({{ source('imdb', 'directors') }}.first_name, ' ', {{ source('imdb', 'directors') }}.last_name) as director_name,
                    created_at
            FROM {{ source('imdb', 'actors') }}
                        JOIN {{ source('imdb', 'roles') }} ON {{ source('imdb', 'roles') }}.actor_id = {{ source('imdb', 'actors') }}.id
                        LEFT OUTER JOIN {{ source('imdb', 'movies') }} ON {{ source('imdb', 'movies') }}.id = {{ source('imdb', 'roles') }}.movie_id
                        LEFT OUTER JOIN {{ source('imdb', 'genres') }} ON {{ source('imdb', 'genres') }}.movie_id = {{ source('imdb', 'movies') }}.id
                        LEFT OUTER JOIN {{ source('imdb', 'movie_directors') }} ON {{ source('imdb', 'movie_directors') }}.movie_id = {{ source('imdb', 'movies') }}.id
                        LEFT OUTER JOIN {{ source('imdb', 'directors') }} ON {{ source('imdb', 'directors') }}.id = {{ source('imdb', 'movie_directors') }}.director_id
            )
    GROUP BY id
    )

    select *
    from actor_summary
    ```
    Обратите внимание, что мы включаем столбец `updated_at` в итоговую actor_summary. Позже мы будем использовать его для инкрементных материализаций.

4. Из каталога `imdb` выполните команду `dbt run`.

```bash
    clickhouse-user@clickhouse:~/imdb$ dbt run
    15:05:35  Running with dbt=1.1.0
    15:05:35  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 6 sources, 0 exposures, 0 metrics
    15:05:35
    15:05:36  Concurrency: 1 threads (target='dev')
    15:05:36
    15:05:36  1 of 1 START view model imdb_dbt.actor_summary.................................. [RUN]
    15:05:37  1 of 1 OK created view model imdb_dbt.actor_summary............................. [OK in 1.00s]
    15:05:37
    15:05:37  Finished running 1 view model in 1.97s.
    15:05:37
    15:05:37  Completed successfully
    15:05:37
    15:05:37  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

5. dbt будет представлять модель в виде представления (view) в ClickHouse, как и было задано. Теперь мы можем напрямую выполнять запросы к этому представлению. Это представление будет создано в базе данных `imdb_dbt` — это определяется параметром `schema` в файле `~/.dbt/profiles.yml` в профиле `clickhouse_imdb`.

   ```sql
    SHOW DATABASES;
    ```

   ```response
    +------------------+
    |name              |
    +------------------+
    |INFORMATION_SCHEMA|
    |default           |
    |imdb              |
    |imdb_dbt          |  <---created by dbt!
    |information_schema|
    |system            |
    +------------------+
    ```

   Выполняя запрос к этому представлению, мы можем воспроизвести результаты нашего предыдущего запроса с более простым синтаксисом:

   ```sql
    SELECT * FROM imdb_dbt.actor_summary ORDER BY num_movies DESC LIMIT 5;
    ```

   ```response
    +------+------------+----------+------------------+------+---------+-------------------+
    |id    |name        |num_movies|avg_rank          |genres|directors|updated_at         |
    +------+------------+----------+------------------+------+---------+-------------------+
    |45332 |Mel Blanc   |832       |6.175853582979779 |18    |84       |2022-04-26 15:26:55|
    |621468|Bess Flowers|659       |5.57727638854796  |19    |293      |2022-04-26 15:26:57|
    |372839|Lee Phelps  |527       |5.032976449684617 |18    |261      |2022-04-26 15:26:56|
    |283127|Tom London  |525       |2.8721716524875673|17    |203      |2022-04-26 15:26:56|
    |356804|Bud Osborne |515       |2.0389507108727773|15    |149      |2022-04-26 15:26:56|
    +------+------------+----------+------------------+------+---------+-------------------+
    ```

## Создание материализованной таблицы {#creating-a-table-materialization}

В предыдущем примере наша модель была материализована как представление. Хотя этого может быть достаточно для некоторых запросов, более сложные SELECT-запросы или часто выполняемые запросы могут быть эффективнее материализованы как таблица. Такая материализация полезна для моделей, к которым будут обращаться BI-инструменты, чтобы обеспечить пользователям более высокую скорость работы. Фактически это приводит к тому, что результаты запроса сохраняются как новая таблица с соответствующими накладными расходами на хранение — по сути, выполняется `INSERT INTO ... SELECT`. Обратите внимание, что эта таблица будет пересоздаваться каждый раз, то есть она не является инкрементальной. Таким образом, большие наборы результатов могут приводить к длительному времени выполнения — см. раздел [Ограничения dbt](/integrations/dbt#limitations).

1. Измените файл `actors_summary.sql` так, чтобы параметр `materialized` был установлен в значение `table`. Обратите внимание, как определён `ORDER BY`, и что мы используем табличный движок `MergeTree`:

    ```sql
    {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
    ```

2. Из директории `imdb` выполните команду `dbt run`. Этот запуск может занять немного больше времени — около 10 секунд на большинстве машин.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt run
    15:13:27  Running with dbt=1.1.0
    15:13:27  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 6 sources, 0 exposures, 0 metrics
    15:13:27
    15:13:28  Concurrency: 1 threads (target='dev')
    15:13:28
    15:13:28  1 of 1 START table model imdb_dbt.actor_summary................................. [RUN]
    15:13:37  1 of 1 OK created table model imdb_dbt.actor_summary............................ [OK in 9.22s]
    15:13:37
    15:13:37  Finished running 1 table model in 10.20s.
    15:13:37
    15:13:37  Completed successfully
    15:13:37
    15:13:37  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

3. Подтвердите создание таблицы `imdb_dbt.actor_summary`:

    ```sql
    SHOW CREATE TABLE imdb_dbt.actor_summary;
    ```

    Вы должны увидеть таблицу с соответствующими типами данных:
    ```response
    +----------------------------------------
    |statement
    +----------------------------------------
    |CREATE TABLE imdb_dbt.actor_summary
    |(
    |`id` UInt32,
    |`first_name` String,
    |`last_name` String,
    |`num_movies` UInt64,
    |`updated_at` DateTime
    |)
    |ENGINE = MergeTree
    |ORDER BY (id, first_name, last_name)
    +----------------------------------------
    ```

4. Убедитесь, что результаты из этой таблицы соответствуют предыдущим результатам. Обратите внимание на заметное улучшение времени ответа теперь, когда модель материализована как таблица:

    ```sql
    SELECT * FROM imdb_dbt.actor_summary ORDER BY num_movies DESC LIMIT 5;
    ```

    ```response
    +------+------------+----------+------------------+------+---------+-------------------+
    |id    |name        |num_movies|avg_rank          |genres|directors|updated_at         |
    +------+------------+----------+------------------+------+---------+-------------------+
    |45332 |Mel Blanc   |832       |6.175853582979779 |18    |84       |2022-04-26 15:26:55|
    |621468|Bess Flowers|659       |5.57727638854796  |19    |293      |2022-04-26 15:26:57|
    |372839|Lee Phelps  |527       |5.032976449684617 |18    |261      |2022-04-26 15:26:56|
    |283127|Tom London  |525       |2.8721716524875673|17    |203      |2022-04-26 15:26:56|
    |356804|Bud Osborne |515       |2.0389507108727773|15    |149      |2022-04-26 15:26:56|
    +------+------------+----------+------------------+------+---------+-------------------+
    ```

Вы можете выполнять и другие запросы к этой модели. Например, у каких актёров, снявшихся более чем в пяти фильмах, самые высокие рейтинги фильмов?

```sql
    SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
    ```

## Создание инкрементальной материализации {#creating-an-incremental-materialization}

В предыдущем примере была создана таблица для материализации модели. Эта таблица будет заново создаваться при каждом выполнении dbt. Для больших результирующих наборов или сложных трансформаций это может быть невыполнимо и крайне затратно. Чтобы решить эту задачу и сократить время сборки, dbt предлагает инкрементальные материализации (Incremental). Они позволяют dbt вставлять или обновлять записи в таблице, начиная с последнего запуска, что делает этот подход подходящим для событийных данных. Под капотом создаётся временная таблица со всеми обновлёнными записями, после чего все нетронутые записи, а также обновлённые записи вставляются в новую целевую таблицу. В результате для больших результирующих наборов возникают схожие [ограничения](/integrations/dbt#limitations), как и для табличной модели.

Чтобы обойти эти ограничения для больших наборов, адаптер поддерживает режим `inserts_only`, при котором все обновления вставляются в целевую таблицу без создания временной таблицы (подробнее об этом ниже).

Для иллюстрации этого примера мы добавим актёра «Clicky McClickHouse», который появится в невероятных 910 фильмах — гарантируя, что он снимется в большем количестве картин, чем даже [Мел Бланк](https://en.wikipedia.org/wiki/Mel_Blanc).

1. Сначала мы изменим нашу модель, чтобы сделать её типа incremental. Это изменение требует:

    1. **unique_key** — Чтобы адаптер мог однозначно идентифицировать строки, мы должны указать `unique_key` — в данном случае поля `id` из нашего запроса будет достаточно. Это гарантирует отсутствие дубликатов строк в нашей материализованной таблице. Подробности об ограничениях уникальности см. [здесь](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional).
    2. **Инкрементальный фильтр** — Нам также нужно сообщить dbt, как он должен определять, какие строки изменились при инкрементальном запуске. Это достигается за счёт передачи delta-выражения. Обычно это включает в себя временную метку для событийных данных; в нашем случае — поле временной метки `updated_at`. Этот столбец, который по умолчанию принимает значение `now()` при вставке строк, позволяет идентифицировать новые строки. Дополнительно нам нужно обработать альтернативный случай, когда добавляются новые актёры. Используя переменную `{{this}}` для обозначения существующей материализованной таблицы, мы получаем выражение `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})`. Мы помещаем его внутрь условия `{% if is_incremental() %}`, гарантируя, что оно используется только при инкрементальных запусках и не применяется при первичном создании таблицы. Для получения дополнительной информации о фильтрации строк для инкрементальных моделей см. [это обсуждение в документации dbt](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run).

    Обновите файл `actor_summary.sql` следующим образом:

```sql
    {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id') }}
    with actor_summary as (
        SELECT id,
            any(actor_name) as name,
            uniqExact(movie_id)    as num_movies,
            avg(rank)                as avg_rank,
            uniqExact(genre)         as genres,
            uniqExact(director_name) as directors,
            max(created_at) as updated_at
        FROM (
            SELECT {{ source('imdb', 'actors') }}.id as id,
                concat({{ source('imdb', 'actors') }}.first_name, ' ', {{ source('imdb', 'actors') }}.last_name) as actor_name,
                {{ source('imdb', 'movies') }}.id as movie_id,
                {{ source('imdb', 'movies') }}.rank as rank,
                genre,
                concat({{ source('imdb', 'directors') }}.first_name, ' ', {{ source('imdb', 'directors') }}.last_name) as director_name,
                created_at
        FROM {{ source('imdb', 'actors') }}
            JOIN {{ source('imdb', 'roles') }} ON {{ source('imdb', 'roles') }}.actor_id = {{ source('imdb', 'actors') }}.id
            LEFT OUTER JOIN {{ source('imdb', 'movies') }} ON {{ source('imdb', 'movies') }}.id = {{ source('imdb', 'roles') }}.movie_id
            LEFT OUTER JOIN {{ source('imdb', 'genres') }} ON {{ source('imdb', 'genres') }}.movie_id = {{ source('imdb', 'movies') }}.id
            LEFT OUTER JOIN {{ source('imdb', 'movie_directors') }} ON {{ source('imdb', 'movie_directors') }}.movie_id = {{ source('imdb', 'movies') }}.id
            LEFT OUTER JOIN {{ source('imdb', 'directors') }} ON {{ source('imdb', 'directors') }}.id = {{ source('imdb', 'movie_directors') }}.director_id
        )
        GROUP BY id
    )
    select *
    from actor_summary

    {% if is_incremental() %}

    -- this filter will only be applied on an incremental run
    where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

    {% endif %}
    ```

Обратите внимание, что наша модель будет обновляться только при изменениях (обновлениях и добавлениях) в таблицах `roles` и `actors`. Чтобы обрабатывать все таблицы, рекомендуется разделить эту модель на несколько подмоделей — каждая со своими собственными инкрементальными критериями. Эти модели, в свою очередь, могут ссылаться друг на друга и связываться между собой. Для получения дополнительной информации о кросс-ссылках между моделями смотрите [здесь](https://docs.getdbt.com/reference/dbt-jinja-functions/ref).

2. Выполните `dbt run` и проверьте результирующую таблицу:

   ```response
    clickhouse-user@clickhouse:~/imdb$  dbt run
    15:33:34  Running with dbt=1.1.0
    15:33:34  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 6 sources, 0 exposures, 0 metrics
    15:33:34
    15:33:35  Concurrency: 1 threads (target='dev')
    15:33:35
    15:33:35  1 of 1 START incremental model imdb_dbt.actor_summary........................... [RUN]
    15:33:41  1 of 1 OK created incremental model imdb_dbt.actor_summary...................... [OK in 6.33s]
    15:33:41
    15:33:41  Finished running 1 incremental model in 7.30s.
    15:33:41
    15:33:41  Completed successfully
    15:33:41
    15:33:41  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

   ```sql
    SELECT * FROM imdb_dbt.actor_summary ORDER BY num_movies DESC LIMIT 5;
    ```

```response
    +------+------------+----------+------------------+------+---------+-------------------+
    |id    |name        |num_movies|avg_rank          |genres|directors|updated_at         |
    +------+------------+----------+------------------+------+---------+-------------------+
    |45332 |Mel Blanc   |832       |6.175853582979779 |18    |84       |2022-04-26 15:26:55|
    |621468|Bess Flowers|659       |5.57727638854796  |19    |293      |2022-04-26 15:26:57|
    |372839|Lee Phelps  |527       |5.032976449684617 |18    |261      |2022-04-26 15:26:56|
    |283127|Tom London  |525       |2.8721716524875673|17    |203      |2022-04-26 15:26:56|
    |356804|Bud Osborne |515       |2.0389507108727773|15    |149      |2022-04-26 15:26:56|
    +------+------------+----------+------------------+------+---------+-------------------+
    ```

3. Теперь добавим данные в нашу модель, чтобы продемонстрировать инкрементальное обновление. Добавьте нашего актёра «Clicky McClickHouse» в таблицу `actors`:

   ```sql
    INSERT INTO imdb.actors VALUES (845466, 'Clicky', 'McClickHouse', 'M');
    ```

4. Давайте дадим «Clicky» сняться в 910 случайных фильмах:

   ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, id as movie_id, 'Himself' as role
    FROM imdb.movies
    LIMIT 910 OFFSET 10000;
    ```

5. Убедитесь, что он действительно стал актёром с наибольшим количеством появлений, выполнив запрос к исходной таблице и обойдя любые модели dbt:

   ```sql
    SELECT id,
        any(actor_name)          as name,
        uniqExact(movie_id)    as num_movies,
        avg(rank)                as avg_rank,
        uniqExact(genre)         as unique_genres,
        uniqExact(director_name) as uniq_directors,
        max(created_at)          as updated_at
    FROM (
            SELECT imdb.actors.id                                                   as id,
                    concat(imdb.actors.first_name, ' ', imdb.actors.last_name)       as actor_name,
                    imdb.movies.id as movie_id,
                    imdb.movies.rank                                                 as rank,
                    genre,
                    concat(imdb.directors.first_name, ' ', imdb.directors.last_name) as director_name,
                    created_at
            FROM imdb.actors
                    JOIN imdb.roles ON imdb.roles.actor_id = imdb.actors.id
                    LEFT OUTER JOIN imdb.movies ON imdb.movies.id = imdb.roles.movie_id
                    LEFT OUTER JOIN imdb.genres ON imdb.genres.movie_id = imdb.movies.id
                    LEFT OUTER JOIN imdb.movie_directors ON imdb.movie_directors.movie_id = imdb.movies.id
                    LEFT OUTER JOIN imdb.directors ON imdb.directors.id = imdb.movie_directors.director_id
            )
    GROUP BY id
    ORDER BY num_movies DESC
    LIMIT 2;
    ```

   ```response
    +------+-------------------+----------+------------------+------+---------+-------------------+
    |id    |name               |num_movies|avg_rank          |genres|directors|updated_at         |
    +------+-------------------+----------+------------------+------+---------+-------------------+
    |845466|Clicky McClickHouse|910       |1.4687938697032283|21    |662      |2022-04-26 16:20:36|
    |45332 |Mel Blanc          |909       |5.7884792542982515|19    |148      |2022-04-26 16:17:42|
    +------+-------------------+----------+------------------+------+---------+-------------------+
    ```

6. Выполните `dbt run` и убедитесь, что наша модель обновилась и соответствует приведённым выше результатам:

```response
    clickhouse-user@clickhouse:~/imdb$  dbt run
    16:12:16  Running with dbt=1.1.0
    16:12:16  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 6 sources, 0 exposures, 0 metrics
    16:12:16
    16:12:17  Concurrency: 1 threads (target='dev')
    16:12:17
    16:12:17  1 of 1 START incremental model imdb_dbt.actor_summary........................... [RUN]
    16:12:24  1 of 1 OK created incremental model imdb_dbt.actor_summary...................... [OK in 6.82s]
    16:12:24
    16:12:24  Finished running 1 incremental model in 7.79s.
    16:12:24
    16:12:24  Completed successfully
    16:12:24
    16:12:24  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

```sql
    SELECT * FROM imdb_dbt.actor_summary ORDER BY num_movies DESC LIMIT 2;
    ```

```response
    +------+-------------------+----------+------------------+------+---------+-------------------+
    |id    |name               |num_movies|avg_rank          |genres|directors|updated_at         |
    +------+-------------------+----------+------------------+------+---------+-------------------+
    |845466|Clicky McClickHouse|910       |1.4687938697032283|21    |662      |2022-04-26 16:20:36|
    |45332 |Mel Blanc          |909       |5.7884792542982515|19    |148      |2022-04-26 16:17:42|
    +------+-------------------+----------+------------------+------+---------+-------------------+
    ```

### Внутреннее устройство {#internals}

Мы можем определить, какие запросы выполнялись для реализации описанного выше инкрементального обновления, обратившись к журналу запросов ClickHouse.

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

Отрегулируйте приведённый выше запрос под период выполнения. Проверку результата оставляем пользователю, но выделим общую стратегию, которую адаптер использует для выполнения инкрементальных обновлений:

1. Адаптер создаёт временную таблицу `actor_sumary__dbt_tmp`. Строки с внесёнными изменениями построчно записываются (streamed) в эту таблицу.
2. Создаётся новая таблица `actor_summary_new`. Строки из старой таблицы по очереди переносятся (streamed) из старой в новую с проверкой на отсутствие идентификаторов строк во временной таблице. Это эффективно обрабатывает обновления и дубликаты.
3. Результаты из временной таблицы построчно записываются в новую таблицу `actor_summary`.
4. Наконец, новая таблица атомарно обменивается со старой версией с помощью оператора `EXCHANGE TABLES`. Старая и временная таблицы затем удаляются.

Это показано ниже:

<Image img={dbt_05} size="lg" alt="incremental updates dbt" />

Такая стратегия может создавать сложности на очень больших моделях. Для получения дополнительной информации см. раздел [Limitations](/integrations/dbt#limitations).

### Стратегия append (режим только вставки) {#append-strategy-inserts-only-mode}

Чтобы обойти ограничения, связанные с большими наборами данных в инкрементальных моделях, адаптер использует параметр конфигурации dbt `incremental_strategy`. Его можно установить в значение `append`. В этом случае обновлённые строки вставляются непосредственно в целевую таблицу (т.е. `imdb_dbt.actor_summary`), и временная таблица не создаётся.
Примечание: режим только append требует, чтобы ваши данные были неизменяемыми или чтобы дубликаты были допустимы. Если вам нужна инкрементальная модель таблицы, поддерживающая изменение строк, не используйте этот режим!

Чтобы проиллюстрировать этот режим, мы добавим ещё одного нового актёра и повторно запустим dbt run с `incremental_strategy='append'`.

1. Настройте режим только append в actor&#95;summary.sql:

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
   ```

2. Давайте добавим ещё одного известного актёра — Danny DeBito

   ```sql
   INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeBito', 'M');
   ```

3. Давайте снимем Danny в 920 случайных фильмах.

```sql
   INSERT INTO imdb.roles
   SELECT now() as created_at, 845467 as actor_id, id as movie_id, 'Himself' as role
   FROM imdb.movies
   LIMIT 920 OFFSET 10000;
   ```

4. Выполните `dbt run` и убедитесь, что Danny был добавлен в таблицу actor-summary

   ```response
   clickhouse-user@clickhouse:~/imdb$ dbt run
   16:12:16  Running with dbt=1.1.0
   16:12:16  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 186 macros, 0 operations, 0 seed files, 6 sources, 0 exposures, 0 metrics
   16:12:16
   16:12:17  Concurrency: 1 threads (target='dev')
   16:12:17
   16:12:17  1 of 1 START incremental model imdb_dbt.actor_summary........................... [RUN]
   16:12:24  1 of 1 OK created incremental model imdb_dbt.actor_summary...................... [OK in 0.17s]
   16:12:24
   16:12:24  Finished running 1 incremental model in 0.19s.
   16:12:24
   16:12:24  Completed successfully
   16:12:24
   16:12:24  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
   ```

   ```sql
   SELECT * FROM imdb_dbt.actor_summary ORDER BY num_movies DESC LIMIT 3;
   ```

   ```response
   +------+-------------------+----------+------------------+------+---------+-------------------+
   |id    |name               |num_movies|avg_rank          |genres|directors|updated_at         |
   +------+-------------------+----------+------------------+------+---------+-------------------+
   |845467|Danny DeBito       |920       |1.4768987303293204|21    |670      |2022-04-26 16:22:06|
   |845466|Clicky McClickHouse|910       |1.4687938697032283|21    |662      |2022-04-26 16:20:36|
   |45332 |Mel Blanc          |909       |5.7884792542982515|19    |148      |2022-04-26 16:17:42|
   +------+-------------------+----------+------------------+------+---------+-------------------+
   ```

Обратите внимание, насколько быстрее был этот инкрементальный запуск по сравнению с вставкой «Clicky».

Если снова посмотреть на таблицу query&#95;log, можно увидеть различия между двумя инкрементальными запусками:

```sql
INSERT INTO imdb_dbt.actor_summary ("id", "name", "num_movies", "avg_rank", "genres", "directors", "updated_at")
WITH actor_summary AS (
   SELECT id,
      any(actor_name) AS name,
      uniqExact(movie_id)    AS num_movies,
      avg(rank)                AS avg_rank,
      uniqExact(genre)         AS genres,
      uniqExact(director_name) AS directors,
      max(created_at) AS updated_at
   FROM (
      SELECT imdb.actors.id AS id,
         concat(imdb.actors.first_name, ' ', imdb.actors.last_name) AS actor_name,
         imdb.movies.id AS movie_id,
         imdb.movies.rank AS rank,
         genre,
         concat(imdb.directors.first_name, ' ', imdb.directors.last_name) AS director_name,
         created_at
      FROM imdb.actors
         JOIN imdb.roles ON imdb.roles.actor_id = imdb.actors.id
         LEFT OUTER JOIN imdb.movies ON imdb.movies.id = imdb.roles.movie_id
         LEFT OUTER JOIN imdb.genres ON imdb.genres.movie_id = imdb.movies.id
         LEFT OUTER JOIN imdb.movie_directors ON imdb.movie_directors.movie_id = imdb.movies.id
         LEFT OUTER JOIN imdb.directors ON imdb.directors.id = imdb.movie_directors.director_id
   )
   GROUP BY id
)

SELECT *
FROM actor_summary
-- this filter will only be applied on an incremental run
WHERE id > (SELECT max(id) FROM imdb_dbt.actor_summary) OR updated_at > (SELECT max(updated_at) FROM imdb_dbt.actor_summary)
   ```

В этом прогоне непосредственно в таблицу `imdb_dbt.actor_summary` добавляются только новые строки, при этом создание таблицы не выполняется.

### Режим удаления и вставки (экспериментальный) {#deleteinsert-mode-experimental}

Традиционно ClickHouse имел лишь ограниченную поддержку операций обновления и удаления в виде асинхронных [Mutations](/sql-reference/statements/alter/index.md). Эти операции могут быть крайне ресурсоёмкими по вводу-выводу, и, как правило, их следует избегать.

В ClickHouse 22.8 были добавлены [облегчённые удаления](/sql-reference/statements/delete.md), а в ClickHouse 25.7 — [облегчённые обновления](/sql-reference/statements/update). С появлением этих возможностей изменения, выполняемые одиночными запросами обновления, даже при асинхронной материализации, будут происходить мгновенно с точки зрения пользователя.

Этот режим может быть настроен для модели с помощью параметра `incremental_strategy`, то есть:

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

Эта стратегия работает напрямую с целевой таблицей модели, поэтому если во время операции произойдет ошибка, данные в инкрементальной модели, скорее всего, окажутся в некорректном состоянии — атомарного обновления нет.

Вкратце, этот подход выполняет следующее:

1. Адаптер создает временную таблицу `actor_sumary__dbt_tmp`. Строки, в которых были изменения, потоково записываются в эту таблицу.
2. Выполняется `DELETE` по текущей таблице `actor_summary`. Строки удаляются по id из `actor_sumary__dbt_tmp`.
3. Строки из `actor_sumary__dbt_tmp` вставляются в `actor_summary` с помощью `INSERT INTO actor_summary SELECT * FROM actor_sumary__dbt_tmp`.

Этот процесс показан ниже:

<Image img={dbt_06} size="lg" alt="легковесное инкрементальное обновление с удалением" />

### режим insert&#95;overwrite (экспериментальный) {#insert_overwrite-mode-experimental}

Выполняет следующие шаги:

1. Создать staging (временную) таблицу с той же структурой, что и у отношения инкрементальной модели: `CREATE TABLE {staging} AS {target}`.
2. Вставить только новые записи (результат SELECT) во временную таблицу.
3. Заменить в целевой таблице только те партиции, которые присутствуют во временной таблице.

<br />

У этого подхода есть следующие преимущества:

* Он быстрее, чем стратегия по умолчанию, потому что не копирует всю таблицу.
* Он безопаснее других стратегий, потому что не изменяет исходную таблицу до тех пор, пока операция INSERT не завершится успешно: в случае промежуточного сбоя исходная таблица не изменяется.
* Он реализует практику data engineering «неизменяемости партиций» (partitions immutability), что упрощает инкрементальную и параллельную обработку данных, откаты и т. д.

<Image img={dbt_07} size="lg" alt="инкрементальное обновление через insert overwrite" />

## Создание снимка {#creating-a-snapshot}

Снимки dbt позволяют зафиксировать изменения изменяемой модели во времени. Это, в свою очередь, позволяет выполнять запросы к моделям на состояние в конкретный момент времени, когда аналитики могут «оглядываться назад» и просматривать предыдущее состояние модели. Это достигается с помощью [измерений типа 2 (Slowly Changing Dimensions)](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row), где столбцы from и to фиксируют период, в течение которого строка считалась актуальной. Эта функциональность поддерживается адаптером ClickHouse и продемонстрирована ниже.

В этом примере предполагается, что вы завершили шаг [Creating an Incremental Table Model](#creating-an-incremental-materialization). Убедитесь, что ваш actor&#95;summary.sql не устанавливает inserts&#95;only=True. Ваш models/actor&#95;summary.sql должен выглядеть следующим образом:

```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id') }}

   with actor_summary as (
       SELECT id,
           any(actor_name) as name,
           uniqExact(movie_id)    as num_movies,
           avg(rank)                as avg_rank,
           uniqExact(genre)         as genres,
           uniqExact(director_name) as directors,
           max(created_at) as updated_at
       FROM (
           SELECT {{ source('imdb', 'actors') }}.id as id,
               concat({{ source('imdb', 'actors') }}.first_name, ' ', {{ source('imdb', 'actors') }}.last_name) as actor_name,
               {{ source('imdb', 'movies') }}.id as movie_id,
               {{ source('imdb', 'movies') }}.rank as rank,
               genre,
               concat({{ source('imdb', 'directors') }}.first_name, ' ', {{ source('imdb', 'directors') }}.last_name) as director_name,
               created_at
       FROM {{ source('imdb', 'actors') }}
           JOIN {{ source('imdb', 'roles') }} ON {{ source('imdb', 'roles') }}.actor_id = {{ source('imdb', 'actors') }}.id
           LEFT OUTER JOIN {{ source('imdb', 'movies') }} ON {{ source('imdb', 'movies') }}.id = {{ source('imdb', 'roles') }}.movie_id
           LEFT OUTER JOIN {{ source('imdb', 'genres') }} ON {{ source('imdb', 'genres') }}.movie_id = {{ source('imdb', 'movies') }}.id
           LEFT OUTER JOIN {{ source('imdb', 'movie_directors') }} ON {{ source('imdb', 'movie_directors') }}.movie_id = {{ source('imdb', 'movies') }}.id
           LEFT OUTER JOIN {{ source('imdb', 'directors') }} ON {{ source('imdb', 'directors') }}.id = {{ source('imdb', 'movie_directors') }}.director_id
       )
       GROUP BY id
   )
   select *
   from actor_summary

   {% if is_incremental() %}

   -- this filter will only be applied on an incremental run
   where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

   {% endif %}
   ```

1. Создайте файл `actor_summary` в директории snapshots.

   ```bash
     touch snapshots/actor_summary.sql
    ```

2. Обновите содержимое файла actor&#95;summary.sql следующим кодом:
   ```sql
    {% snapshot actor_summary_snapshot %}

    {{
    config(
    target_schema='snapshots',
    unique_key='id',
    strategy='timestamp',
    updated_at='updated_at',
    )
    }}

    select * from {{ref('actor_summary')}}

    {% endsnapshot %}
    ```

Несколько замечаний относительно этого содержимого:

* Оператор select определяет результаты, по которым вы хотите строить снимки (snapshots) во времени. Функция ref используется для ссылки на ранее созданную модель actor&#95;summary.
* Нам необходим столбец с типом timestamp для фиксации изменений записей. Наш столбец updated&#95;at (см. [Creating an Incremental Table Model](#creating-an-incremental-materialization)) можно использовать здесь. Параметр strategy указывает, что мы используем временную метку для обозначения обновлений, а параметр updated&#95;at определяет столбец, который следует использовать. Если такого столбца нет в вашей модели, вы можете вместо этого использовать [check strategy](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy). Этот подход значительно менее эффективен и требует от пользователя указать список столбцов для сравнения. dbt сравнивает текущие и исторические значения этих столбцов, фиксируя любые изменения (или не делая ничего, если значения идентичны).

3. Выполните команду `dbt snapshot`.

```response
    clickhouse-user@clickhouse:~/imdb$ dbt snapshot
    13:26:23  Running with dbt=1.1.0
    13:26:23  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 3 sources, 0 exposures, 0 metrics
    13:26:23
    13:26:25  Concurrency: 1 threads (target='dev')
    13:26:25
    13:26:25  1 of 1 START snapshot snapshots.actor_summary_snapshot...................... [RUN]
    13:26:25  1 of 1 OK snapshotted snapshots.actor_summary_snapshot...................... [OK in 0.79s]
    13:26:25
    13:26:25  Finished running 1 snapshot in 2.11s.
    13:26:25
    13:26:25  Completed successfully
    13:26:25
    13:26:25  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

Обратите внимание, что в базе данных snapshots (определяется параметром target&#95;schema) была создана таблица actor&#95;summary&#95;snapshot.

4. При выборочной выборке этих данных вы увидите, что dbt добавил столбцы dbt&#95;valid&#95;from и dbt&#95;valid&#95;to. Для последнего значения установлены в null. Последующие запуски будут обновлять их.

   ```sql
    SELECT id, name, num_movies, dbt_valid_from, dbt_valid_to FROM snapshots.actor_summary_snapshot ORDER BY num_movies DESC LIMIT 5;
    ```

   ```response
    +------+----------+------------+----------+-------------------+------------+
    |id    |first_name|last_name   |num_movies|dbt_valid_from     |dbt_valid_to|
    +------+----------+------------+----------+-------------------+------------+
    |845467|Danny     |DeBito      |920       |2022-05-25 19:33:32|NULL        |
    |845466|Clicky    |McClickHouse|910       |2022-05-25 19:32:34|NULL        |
    |45332 |Mel       |Blanc       |909       |2022-05-25 19:31:47|NULL        |
    |621468|Bess      |Flowers     |672       |2022-05-25 19:31:47|NULL        |
    |283127|Tom       |London      |549       |2022-05-25 19:31:47|NULL        |
    +------+----------+------------+----------+-------------------+------------+
    ```

5. Сделаем так, чтобы наш любимый актёр Clicky McClickHouse появился ещё в 10 фильмах.

   ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
    FROM system.numbers
    LIMIT 10;
    ```

6. Повторно выполните команду dbt run из каталога `imdb`. Это обновит инкрементальную модель. После завершения запустите dbt snapshot, чтобы зафиксировать изменения.

   ```response
    clickhouse-user@clickhouse:~/imdb$ dbt run
    13:46:14  Running with dbt=1.1.0
    13:46:14  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 3 sources, 0 exposures, 0 metrics
    13:46:14
    13:46:15  Concurrency: 1 threads (target='dev')
    13:46:15
    13:46:15  1 of 1 START incremental model imdb_dbt.actor_summary....................... [RUN]
    13:46:18  1 of 1 OK created incremental model imdb_dbt.actor_summary.................. [OK in 2.76s]
    13:46:18
    13:46:18  Finished running 1 incremental model in 3.73s.
    13:46:18
    13:46:18  Completed successfully
    13:46:18
    13:46:18  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1

    clickhouse-user@clickhouse:~/imdb$ dbt snapshot
    13:46:26  Running with dbt=1.1.0
    13:46:26  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 3 sources, 0 exposures, 0 metrics
    13:46:26
    13:46:27  Concurrency: 1 threads (target='dev')
    13:46:27
    13:46:27  1 of 1 START snapshot snapshots.actor_summary_snapshot...................... [RUN]
    13:46:31  1 of 1 OK snapshotted snapshots.actor_summary_snapshot...................... [OK in 4.05s]
    13:46:31
    13:46:31  Finished running 1 snapshot in 5.02s.
    13:46:31
    13:46:31  Completed successfully
    13:46:31
    13:46:31  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
   ```

clickhouse-user@clickhouse:~/imdb$ dbt snapshot
13:46:26  Запуск с использованием dbt=1.1.0
13:46:26  Найдена 1 модель, 0 тестов, 1 snapshot, 0 анализов, 181 макрос, 0 операций, 0 seed-файлов, 3 источника, 0 exposures, 0 метрик
13:46:26
13:46:27  Параллелизм: 1 поток (target=&#39;dev&#39;)
13:46:27
13:46:27  1 of 1 START snapshot snapshots.actor&#95;summary&#95;snapshot...................... [RUN]
13:46:31  1 of 1 OK snapshotted snapshots.actor&#95;summary&#95;snapshot...................... [OK in 4.05s]
13:46:31
13:46:31  Завершён запуск 1 snapshot за 5.02s.
13:46:31
13:46:31  Завершено успешно
13:46:31
13:46:31  Готово. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1

```sql
    SELECT id, name, num_movies, dbt_valid_from, dbt_valid_to FROM snapshots.actor_summary_snapshot ORDER BY num_movies DESC LIMIT 5;
    ```sql
 SELECT id, name, num_movies, dbt_valid_from, dbt_valid_to FROM snapshots.actor_summary_snapshot ORDER BY num_movies DESC LIMIT 5;
```response
    +------+----------+------------+----------+-------------------+-------------------+
    |id    |first_name|last_name   |num_movies|dbt_valid_from     |dbt_valid_to       |
    +------+----------+------------+----------+-------------------+-------------------+
    |845467|Danny     |DeBito      |920       |2022-05-25 19:33:32|NULL               |
    |845466|Clicky    |McClickHouse|920       |2022-05-25 19:34:37|NULL               |
    |845466|Clicky    |McClickHouse|910       |2022-05-25 19:32:34|2022-05-25 19:34:37|
    |45332 |Mel       |Blanc       |909       |2022-05-25 19:31:47|NULL               |
    |621468|Bess      |Flowers     |672       |2022-05-25 19:31:47|NULL               |
    +------+----------+------------+----------+-------------------+-------------------+
    ```response
+------+----------+------------+----------+-------------------+-------------------+
|id    |first_name|last_name   |num_movies|dbt_valid_from     |dbt_valid_to       |
+------+----------+------------+----------+-------------------+-------------------+
|845467|Danny     |DeBito      |920       |2022-05-25 19:33:32|NULL               |
|845466|Clicky    |McClickHouse|920       |2022-05-25 19:34:37|NULL               |
|845466|Clicky    |McClickHouse|910       |2022-05-25 19:32:34|2022-05-25 19:34:37|
|45332 |Mel       |Blanc       |909       |2022-05-25 19:31:47|NULL               |
|621468|Bess      |Flowers     |672       |2022-05-25 19:31:47|NULL               |
+------+----------+------------+----------+-------------------+-------------------+
```bash
    clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
    "SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
    LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
    ```bash
    clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
    "SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
    LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt seed
    17:03:23  Running with dbt=1.1.0
    17:03:23  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 1 seed file, 6 sources, 0 exposures, 0 metrics
    17:03:23
    17:03:24  Concurrency: 1 threads (target='dev')
    17:03:24
    17:03:24  1 of 1 START seed file imdb_dbt.genre_codes..................................... [RUN]
    17:03:24  1 of 1 OK loaded seed file imdb_dbt.genre_codes................................. [INSERT 21 in 0.65s]
    17:03:24
    17:03:24  Finished running 1 seed in 1.62s.
    17:03:24
    17:03:24  Completed successfully
    17:03:24
    17:03:24  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt seed
    17:03:23  Running with dbt=1.1.0
    17:03:23  Found 1 model, 0 tests, 1 snapshot, 0 analyses, 181 macros, 0 operations, 1 seed file, 6 sources, 0 exposures, 0 metrics
    17:03:23
    17:03:24  Concurrency: 1 threads (target='dev')
    17:03:24
    17:03:24  1 of 1 START seed file imdb_dbt.genre_codes..................................... [RUN]
    17:03:24  1 of 1 OK loaded seed file imdb_dbt.genre_codes................................. [INSERT 21 in 0.65s]
    17:03:24
    17:03:24  Finished running 1 seed in 1.62s.
    17:03:24
    17:03:24  Completed successfully
    17:03:24
    17:03:24  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```sql
    SELECT * FROM imdb_dbt.genre_codes LIMIT 10;
    ```sql
    SELECT * FROM imdb_dbt.genre_codes LIMIT 10;
    ```response
    +-------+----+
    |genre  |code|
    +-------+----+
    |Drama  |DRA |
    |Romance|ROM |
    |Short  |SHO |
    |Mystery|MYS |
    |Adult  |ADU |
    |Family |FAM |

    |Action |ACT |
    |Sci-Fi |SCI |
    |Horror |HOR |
    |War    |WAR |
    +-------+----+=
    ```response
    +-------+----+
    |genre  |code|
    +-------+----+
    |Drama  |DRA |
    |Romance|ROM |
    |Short  |SHO |
    |Mystery|MYS |
    |Adult  |ADU |
    |Family |FAM |

    |Action |ACT |
    |Sci-Fi |SCI |
    |Horror |HOR |
    |War    |WAR |
    +-------+----+=
    ```

## Дополнительная информация {#further-information}

В предыдущих руководствах затронута лишь небольшая часть функциональности dbt. Рекомендуем ознакомиться с отличной [документацией dbt](https://docs.getdbt.com/docs/introduction).
