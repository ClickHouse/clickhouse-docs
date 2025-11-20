---
sidebar_label: 'Руководства'
slug: /integrations/dbt/guides
sidebar_position: 2
description: 'Руководства по использованию dbt с ClickHouse'
keywords: ['clickhouse', 'dbt', 'guides']
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


# Руководства

<ClickHouseSupportedBadge/>

В этом разделе приводятся руководства по настройке `dbt` и адаптера ClickHouse, а также пример использования `dbt` с ClickHouse на основе общедоступного набора данных IMDB. В примере рассматриваются следующие шаги:

1. Создание проекта `dbt` и настройка адаптера ClickHouse.
2. Определение модели.
3. Обновление модели.
4. Создание инкрементной модели.
5. Создание snapshot‑модели.
6. Использование материализованных представлений.

Эти руководства предназначены для использования вместе с остальной [документацией](/integrations/dbt) и разделом о [возможностях и конфигурации](/integrations/dbt/features-and-configurations).

<TOCInline toc={toc}  maxHeadingLevel={2} />



## Настройка {#setup}

Следуйте инструкциям в разделе [Настройка dbt и адаптера ClickHouse](/integrations/dbt) для подготовки вашей среды.

**Важно: Приведенные ниже инструкции протестированы на Python 3.9.**

### Подготовка ClickHouse {#prepare-clickhouse}

dbt отлично подходит для моделирования высокореляционных данных. В качестве примера мы предоставляем небольшой набор данных IMDB со следующей реляционной схемой. Этот набор данных взят из [репозитория реляционных наборов данных](https://relational.fit.cvut.cz/dataset/IMDb). Он упрощен по сравнению с типичными схемами, используемыми с dbt, но представляет собой удобный для работы пример:

<Image img={dbt_01} size='lg' alt='Схема таблиц IMDB' />

Мы используем подмножество этих таблиц, как показано ниже.

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
Столбец `created_at` в таблице `roles` имеет значение по умолчанию `now()`. Мы используем его далее для определения инкрементальных обновлений наших моделей — см. [Инкрементальные модели](#creating-an-incremental-materialization).
:::

Мы используем функцию `s3` для чтения исходных данных из публичных источников и вставки данных. Выполните следующие команды для заполнения таблиц:

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

Время выполнения этих команд может варьироваться в зависимости от пропускной способности вашего канала, но каждая команда должна занять всего несколько секунд. Выполните следующий запрос для получения сводки по каждому актеру, упорядоченной по количеству появлений в фильмах, и для подтверждения успешной загрузки данных:


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
|id    |имя         |кол_фильмов|средний_рейтинг   |уник_жанры   |уник_режиссёры|обновлено          |
+------+------------+----------+------------------+-------------+--------------+-------------------+
|45332 |Mel Blanc   |832       |6.175853582979779 |18           |84            |2022-04-26 14:01:45|
|621468|Bess Flowers|659       |5.57727638854796  |19           |293           |2022-04-26 14:01:46|
|372839|Lee Phelps  |527       |5.032976449684617 |18           |261           |2022-04-26 14:01:46|
|283127|Tom London  |525       |2.8721716524875673|17           |203           |2022-04-26 14:01:46|
|356804|Bud Osborne |515       |2.0389507108727773|15           |149           |2022-04-26 14:01:46|
+------+------------+----------+------------------+-------------+--------------+-------------------+
```

В последующих руководствах мы преобразуем этот запрос в модель, материализовав его в ClickHouse как представление и таблицу dbt.


## Подключение к ClickHouse {#connecting-to-clickhouse}

1. Создайте проект dbt. В нашем случае мы называем его по имени источника `imdb`. Когда появится запрос, выберите `clickhouse` в качестве типа базы данных.

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

3. На этом этапе вам понадобится текстовый редактор на ваш выбор. В примерах ниже мы используем популярный VS Code. Открыв каталог IMDB, вы должны увидеть набор файлов yml и sql:

   <Image img={dbt_02} size='lg' alt='Новый проект dbt' />

4. Обновите файл `dbt_project.yml`, чтобы указать нашу первую модель — `actor_summary` и установить профиль `clickhouse_imdb`.

   <Image img={dbt_03} size='lg' alt='Профиль dbt' />

   <Image img={dbt_04} size='lg' alt='Профиль dbt' />

5. Далее необходимо указать dbt параметры подключения к нашему экземпляру ClickHouse. Добавьте следующее в файл `~/.dbt/profiles.yml`.

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
         password: ""
         secure: False
   ```

   Обратите внимание, что необходимо изменить пользователя и пароль. Дополнительные параметры настроек описаны [здесь](https://github.com/silentsokolov/dbt-clickhouse#example-profile).

6. В каталоге IMDB выполните команду `dbt debug`, чтобы проверить, может ли dbt подключиться к ClickHouse.

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

   Убедитесь, что в выводе присутствует строка `Connection test: [OK connection ok]`, что означает успешное подключение.


## Создание простой материализации представления {#creating-a-simple-view-materialization}

При использовании материализации представления модель пересоздается как представление при каждом запуске с помощью оператора `CREATE VIEW AS` в ClickHouse. Это не требует дополнительного хранения данных, но запросы будут выполняться медленнее, чем при материализации таблиц.

1. Из папки `imdb` удалите директорию `models/example`:

   ```bash
   clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
   ```

2. Создайте новую папку `actors` внутри директории `models`. Здесь мы создадим файлы, каждый из которых представляет модель актера:

   ```bash
   clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
   ```

3. Создайте файлы `schema.yml` и `actor_summary.sql` в папке `models/actors`.

   ```bash
   clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
   clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
   ```

   Файл `schema.yml` определяет наши таблицы. Они впоследствии будут доступны для использования в макросах. Отредактируйте
   `models/actors/schema.yml`, чтобы он содержал следующее содержимое:

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

   Файл `actors_summary.sql` определяет нашу фактическую модель. Обратите внимание, что в функции config мы также указываем, что модель должна быть материализована как представление в ClickHouse. На наши таблицы ссылаются из файла `schema.yml` через функцию `source`, например `source('imdb', 'movies')` ссылается на таблицу `movies` в базе данных `imdb`. Отредактируйте `models/actors/actors_summary.sql`, чтобы он содержал следующее содержимое:

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

   Обратите внимание, что мы включаем столбец `updated_at` в нашу итоговую таблицу actor_summary. Мы используем его позже для инкрементальных материализаций.

4. Из директории `imdb` выполните команду `dbt run`.


```bash
    clickhouse-user@clickhouse:~/imdb$ dbt run
    15:05:35  Запуск с dbt=1.1.0
    15:05:35  Найдено: 1 модель, 0 тестов, 1 снимок, 0 анализов, 181 макрос, 0 операций, 0 файлов seed, 6 источников, 0 exposures, 0 метрик
    15:05:35
    15:05:36  Параллелизм: 1 поток (target='dev')
    15:05:36
    15:05:36  1 из 1 НАЧАЛО модели представления imdb_dbt.actor_summary.................................. [ВЫПОЛНЯЕТСЯ]
    15:05:37  1 из 1 OK создана модель представления imdb_dbt.actor_summary............................. [OK за 1.00с]
    15:05:37
    15:05:37  Завершено выполнение 1 модели представления за 1.97с.
    15:05:37
    15:05:37  Успешно завершено
    15:05:37
    15:05:37  Готово. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
```

5. dbt будет представлять модель в ClickHouse в виде представления (view), как и запрошено. Теперь мы можем напрямую выполнять запросы к этому представлению. Оно будет создано в базе данных `imdb_dbt` — это определяется параметром `schema` в файле `~/.dbt/profiles.yml` в профиле `clickhouse_imdb`.

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

   Выполнив запрос к этому представлению, мы можем получить те же результаты, что и в предыдущем запросе, с более простой записью:

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


## Создание табличной материализации {#creating-a-table-materialization}

В предыдущем примере наша модель была материализована как представление. Хотя это может обеспечить достаточную производительность для некоторых запросов, более сложные SELECT или часто выполняемые запросы целесообразнее материализовать как таблицу. Такая материализация полезна для моделей, к которым будут обращаться инструменты BI, чтобы обеспечить пользователям более быстрый отклик. Фактически это приводит к сохранению результатов запроса в виде новой таблицы с соответствующими накладными расходами на хранение — по сути, выполняется `INSERT TO SELECT`. Обратите внимание, что эта таблица будет перестраиваться каждый раз, то есть она не является инкрементальной. Большие наборы результатов могут поэтому приводить к длительному времени выполнения — см. [Ограничения dbt](/integrations/dbt#limitations).

1. Измените файл `actors_summary.sql` так, чтобы параметр `materialized` был установлен в `table`. Обратите внимание на то, как определён `ORDER BY`, и что мы используем движок таблицы `MergeTree`:

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
   ```

2. Из директории `imdb` выполните команду `dbt run`. Выполнение может занять немного больше времени — около 10 секунд на большинстве машин.

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

4. Убедитесь, что результаты из этой таблицы согласуются с предыдущими ответами. Обратите внимание на заметное улучшение времени отклика теперь, когда модель является таблицей:

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


Можете выполнять и другие запросы к этой модели. Например: у каких актёров есть фильмы с самым высоким рейтингом и более чем 5 появлениями?

```sql
SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
```


## Создание инкрементальной материализации {#creating-an-incremental-materialization}

В предыдущем примере была создана таблица для материализации модели. Эта таблица будет перестраиваться при каждом выполнении dbt. Для больших наборов результатов или сложных преобразований это может быть неосуществимо и крайне затратно. Для решения этой проблемы и сокращения времени построения dbt предлагает инкрементальные материализации. Это позволяет dbt вставлять или обновлять записи в таблице с момента последнего выполнения, что делает этот подход подходящим для событийных данных. Внутри создается временная таблица со всеми обновленными записями, а затем все неизмененные записи вместе с обновленными записями вставляются в новую целевую таблицу. Это приводит к аналогичным [ограничениям](/integrations/dbt#limitations) для больших наборов результатов, как и для табличной модели.

Для преодоления этих ограничений при работе с большими наборами данных адаптер поддерживает режим 'inserts_only', в котором все обновления вставляются в целевую таблицу без создания временной таблицы (подробнее об этом ниже).

Для иллюстрации этого примера мы добавим актера "Clicky McClickHouse", который появится в невероятных 910 фильмах — это гарантирует, что он снялся в большем количестве фильмов, чем даже [Mel Blanc](https://en.wikipedia.org/wiki/Mel_Blanc).

1. Сначала мы изменяем нашу модель на тип incremental. Это требует:
   1. **unique_key** — Чтобы адаптер мог однозначно идентифицировать строки, мы должны указать unique_key — в данном случае достаточно поля `id` из нашего запроса. Это гарантирует отсутствие дубликатов строк в нашей материализованной таблице. Для получения дополнительной информации об ограничениях уникальности см.[ здесь](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional).
   2. **Incremental filter** — Нам также необходимо указать dbt, как определять, какие строки изменились при инкрементальном выполнении. Это достигается путем указания дельта-выражения. Обычно это включает временную метку для событийных данных; отсюда наше поле временной метки updated_at. Этот столбец, который по умолчанию принимает значение now() при вставке строк, позволяет идентифицировать новые записи. Кроме того, нам нужно учесть альтернативный случай, когда добавляются новые актеры. Используя переменную `{{this}}` для обозначения существующей материализованной таблицы, мы получаем выражение `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})`. Мы встраиваем это внутрь условия `{% if is_incremental() %}`, гарантируя, что оно используется только при инкрементальных выполнениях, а не при первоначальном построении таблицы. Для получения дополнительной информации о фильтрации строк для инкрементальных моделей см. [это обсуждение в документации dbt](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run).

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

    -- этот фильтр применяется только при инкрементном запуске
    where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

    {% endif %}
```

Обратите внимание, что наша модель будет обновляться только при изменениях и добавлениях в таблицы `roles` и `actors`. Чтобы реагировать на изменения во всех таблицах, рекомендуется разбить эту модель на несколько подмоделей — у каждой будут свои собственные критерии инкрементального обновления. Эти модели, в свою очередь, можно связывать между собой и ссылаться на них. Подробности о перекрёстных ссылках на модели см. [здесь](https://docs.getdbt.com/reference/dbt-jinja-functions/ref).

2. Выполните `dbt run` и проверьте содержимое получившейся таблицы:

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
    |id    |имя         |кол_фильмов|средний_рейтинг   |жанры |режиссёры|обновлено          |
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

5. Убедитесь, что теперь он действительно актёр с наибольшим количеством появлений, выполнив запрос к исходной таблице и обходя любые модели dbt:

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

Мы можем определить выполненные запросы для реализации вышеуказанного инкрементального обновления, запросив журнал запросов ClickHouse.

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

Настройте приведенный выше запрос на период выполнения. Мы оставляем анализ результатов пользователю, но выделяем общую стратегию, используемую адаптером для выполнения инкрементальных обновлений:

1. Адаптер создает временную таблицу `actor_sumary__dbt_tmp`. Измененные строки передаются в эту таблицу потоком.
2. Создается новая таблица `actor_summary_new`. Строки из старой таблицы, в свою очередь, передаются потоком из старой в новую с проверкой отсутствия идентификаторов строк во временной таблице. Это эффективно обрабатывает обновления и дубликаты.
3. Результаты из временной таблицы передаются потоком в новую таблицу `actor_summary`:
4. Наконец, новая таблица атомарно обменивается со старой версией с помощью оператора `EXCHANGE TABLES`. Старая и временная таблицы, в свою очередь, удаляются.

Это визуализировано ниже:

<Image img={dbt_05} size='lg' alt='incremental updates dbt' />

Эта стратегия может столкнуться с проблемами на очень больших моделях. Для получения дополнительной информации см. [Ограничения](/integrations/dbt#limitations).

### Стратегия добавления (режим только вставок) {#append-strategy-inserts-only-mode}

Чтобы преодолеть ограничения больших наборов данных в инкрементальных моделях, адаптер использует параметр конфигурации dbt `incremental_strategy`. Он может быть установлен в значение `append`. При установке обновленные строки вставляются непосредственно в целевую таблицу (т.е. `imdb_dbt.actor_summary`), и временная таблица не создается.
Примечание: режим только добавления требует, чтобы ваши данные были неизменяемыми или чтобы дубликаты были допустимы. Если вам нужна инкрементальная модель таблицы, которая поддерживает измененные строки, не используйте этот режим!

Чтобы проиллюстрировать этот режим, мы добавим еще одного нового актера и повторно выполним dbt run с `incremental_strategy='append'`.

1. Настройте режим только добавления в actor_summary.sql:

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
   ```

2. Давайте добавим еще одного известного актера — Danny DeBito

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

4. Выполните команду dbt run и убедитесь, что Danny был добавлен в таблицу actor-summary

   ```response
   clickhouse-user@clickhouse:~/imdb$ dbt run
   16:12:16  Запуск с dbt=1.1.0
   16:12:16  Найдено: 1 модель, 0 тестов, 1 снимок, 0 анализов, 186 макросов, 0 операций, 0 seed-файлов, 6 источников, 0 exposures, 0 метрик
   16:12:16
   16:12:17  Параллелизм: 1 поток (цель='dev')
   16:12:17
   16:12:17  1 из 1 НАЧАЛО инкрементальной модели imdb_dbt.actor_summary........................... [RUN]
   16:12:24  1 из 1 OK создана инкрементальная модель imdb_dbt.actor_summary...................... [OK за 0.17с]
   16:12:24
   16:12:24  Завершено выполнение 1 инкрементальной модели за 0.19с.
   16:12:24
   16:12:24  Успешно завершено
   16:12:24
   16:12:24  Готово. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
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

Обратите внимание, насколько быстрее выполнилось это инкрементальное обновление по сравнению с добавлением «Clicky».

Повторная проверка таблицы query_log показывает различия между двумя инкрементальными запусками:

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
-- этот фильтр применяется только при инкрементальном запуске
WHERE id > (SELECT max(id) FROM imdb_dbt.actor_summary) OR updated_at > (SELECT max(updated_at) FROM imdb_dbt.actor_summary)
```

При этом запуске только новые строки добавляются непосредственно в таблицу `imdb_dbt.actor_summary`, и создание таблицы не требуется.

### Режим удаления и вставки (экспериментальный) {#deleteinsert-mode-experimental}


Исторически ClickHouse имел лишь ограниченную поддержку обновлений и удалений в виде асинхронных [мутаций](/sql-reference/statements/alter/index.md). Они могут быть крайне ресурсоёмкими по операциям ввода-вывода, и их, как правило, следует избегать.

ClickHouse 22.8 представил [лёгкие удаления](/sql-reference/statements/delete.md), а ClickHouse 25.7 представил [лёгкие обновления](/sql-reference/statements/update). С появлением этих возможностей изменения от отдельных запросов обновления, даже при асинхронной материализации, будут происходить мгновенно с точки зрения пользователя.

Этот режим можно настроить для модели через параметр `incremental_strategy`, например:

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

Эта стратегия работает непосредственно с таблицей целевой модели, поэтому при возникновении проблемы во время операции данные в инкрементной модели, вероятно, окажутся в некорректном состоянии — атомарного обновления не происходит.

В целом этот подход работает следующим образом:

1. Адаптер создаёт временную таблицу `actor_sumary__dbt_tmp`. Изменённые строки передаются в эту таблицу.
2. Выполняется `DELETE` для текущей таблицы `actor_summary`. Строки удаляются по идентификаторам из `actor_sumary__dbt_tmp`.
3. Строки из `actor_sumary__dbt_tmp` вставляются в `actor_summary` с помощью `INSERT INTO actor_summary SELECT * FROM actor_sumary__dbt_tmp`.

Этот процесс показан ниже:

<Image img={dbt_06} size='lg' alt='lightweight delete incremental' />

### Режим insert_overwrite (экспериментальный) {#insert_overwrite-mode-experimental}

Выполняет следующие шаги:

1. Создаёт промежуточную (временную) таблицу с той же структурой, что и отношение инкрементной модели: `CREATE TABLE {staging} AS {target}`.
2. Вставляет только новые записи (полученные с помощью SELECT) в промежуточную таблицу.
3. Заменяет только новые партиции (присутствующие в промежуточной таблице) в целевой таблице.

<br />

Этот подход имеет следующие преимущества:

- Он быстрее стратегии по умолчанию, поскольку не копирует всю таблицу.
- Он безопаснее других стратегий, поскольку не изменяет исходную таблицу до успешного завершения операции INSERT: в случае промежуточного сбоя исходная таблица остаётся неизменной.
- Он реализует лучшую практику инженерии данных «неизменяемость партиций», что упрощает инкрементную и параллельную обработку данных, откаты и т. д.

<Image img={dbt_07} size='lg' alt='insert overwrite incremental' />


## Создание снимка {#creating-a-snapshot}

Снимки dbt позволяют фиксировать изменения изменяемой модели с течением времени. Это, в свою очередь, позволяет выполнять запросы к моделям на определённый момент времени, когда аналитики могут «заглянуть в прошлое» и увидеть предыдущее состояние модели. Это достигается с использованием [медленно изменяющихся измерений типа 2](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row), где столбцы дат начала и окончания фиксируют период действительности строки. Эта функциональность поддерживается адаптером ClickHouse и демонстрируется ниже.

Этот пример предполагает, что вы завершили [Создание инкрементальной модели таблицы](#creating-an-incremental-materialization). Убедитесь, что ваш actor_summary.sql не устанавливает inserts_only=True. Ваш models/actor_summary.sql должен выглядеть следующим образом:

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

-- этот фильтр будет применяться только при инкрементальном запуске
where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

{% endif %}
```

1. Создайте файл `actor_summary` в директории snapshots.

   ```bash
    touch snapshots/actor_summary.sql
   ```

2. Обновите содержимое файла actor_summary.sql следующим содержимым:

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

- Запрос select определяет результаты, которые вы хотите фиксировать в снимках с течением времени. Функция ref используется для ссылки на ранее созданную модель actor_summary.
- Требуется столбец с временной меткой для обозначения изменений записей. Здесь можно использовать наш столбец updated_at (см. [Создание инкрементальной модели таблицы](#creating-an-incremental-materialization)). Параметр strategy указывает на использование временной метки для обозначения обновлений, а параметр updated_at определяет используемый столбец. Если он отсутствует в вашей модели, вы можете использовать альтернативную [стратегию check](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy). Она значительно менее эффективна и требует от пользователя указания списка столбцов для сравнения. dbt сравнивает текущие и исторические значения этих столбцов, фиксируя любые изменения (или не выполняя никаких действий, если они идентичны).

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

Обратите внимание, что в базе данных snapshots была создана таблица actor&#95;summary&#95;snapshot (имя БД определяется параметром target&#95;schema).

4. Если выборочно посмотреть на эти данные, вы увидите, что dbt добавил столбцы dbt&#95;valid&#95;from и dbt&#95;valid&#95;to. Для последнего значения установлены в NULL. При последующих запусках это поле будет обновлено.

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

5. Сделаем так, чтобы наш любимый актер Clicky McClickHouse появился еще в 10 фильмах.

   ```sql
   INSERT INTO imdb.roles
   SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
   FROM system.numbers
   LIMIT 10;
   ```

6. Повторно выполните команду dbt run из каталога `imdb`. Это обновит инкрементальную модель. После завершения выполните dbt snapshot, чтобы зафиксировать изменения.

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
   ```


clickhouse-user@clickhouse:~/imdb$ dbt snapshot
13:46:26  Запуск с dbt=1.1.0
13:46:26  Найдено 1 модель, 0 тестов, 1 snapshot, 0 analyses, 181 macros, 0 operations, 0 seed files, 3 sources, 0 exposures, 0 metrics
13:46:26
13:46:27  Параллелизм: 1 поток (target=&#39;dev&#39;)
13:46:27
13:46:27  1 из 1 START snapshot snapshots.actor&#95;summary&#95;snapshot...................... [RUN]
13:46:31  1 из 1 OK snapshotted snapshots.actor&#95;summary&#95;snapshot...................... [OK за 4.05s]
13:46:31
13:46:31  Завершён запуск 1 snapshot за 5.02s.
13:46:31
13:46:31  Успешно завершено
13:46:31
13:46:31  Готово. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1

````

7. Если теперь выполнить запрос к снимку, можно заметить, что для Clicky McClickHouse существует 2 строки. В предыдущей записи теперь установлено значение dbt_valid_to. Новое значение записано с тем же значением в столбце dbt_valid_from и значением dbt_valid_to равным null. Если бы появились новые строки, они также были бы добавлены в снимок.

 ```sql
 SELECT id, name, num_movies, dbt_valid_from, dbt_valid_to FROM snapshots.actor_summary_snapshot ORDER BY num_movies DESC LIMIT 5;
````

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
```

Подробную информацию о dbt snapshots см. [в документации](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots).


## Использование seeds {#using-seeds}

dbt предоставляет возможность загрузки данных из CSV-файлов. Эта функциональность не предназначена для загрузки больших экспортов базы данных, а скорее рассчитана на небольшие файлы, обычно используемые для справочных таблиц и [словарей](../../../../sql-reference/dictionaries/index.md), например, для сопоставления кодов стран с их названиями. В качестве простого примера мы сгенерируем и загрузим список кодов жанров, используя функциональность seed.

1. Генерируем список кодов жанров из существующего набора данных. Из директории dbt используйте `clickhouse-client` для создания файла `seeds/genre_codes.csv`:

   ```bash
   clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
   "SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
   LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
   ```

2. Выполните команду `dbt seed`. Это создаст новую таблицу `genre_codes` в базе данных `imdb_dbt` (как определено в конфигурации схемы) со строками из csv-файла.

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
   ```

3. Убедитесь, что данные загружены:

   ```sql
   SELECT * FROM imdb_dbt.genre_codes LIMIT 10;
   ```

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

Предыдущие руководства лишь поверхностно описывают возможности dbt. Рекомендуется ознакомиться с подробной [документацией dbt](https://docs.getdbt.com/docs/introduction).
