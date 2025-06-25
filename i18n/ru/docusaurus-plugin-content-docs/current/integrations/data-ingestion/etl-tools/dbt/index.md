---
sidebar_label: 'dbt'
slug: /integrations/dbt
sidebar_position: 1
description: 'Пользователи могут преобразовывать и моделировать свои данные в ClickHouse с использованием dbt'
title: 'Интеграция dbt и ClickHouse'
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

# Интеграция dbt и ClickHouse

<ClickHouseSupportedBadge/>

**dbt** (инструмент сборки данных) позволяет аналитическим инженерам преобразовывать данные в своих хранилищах, просто написав операторы select. dbt обрабатывает материализацию этих операторов select в объекты в базе данных в виде таблиц и представлений - выполняя T из [Извлечения, Загрузки и Преобразования (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform). Пользователи могут создавать модель, определенную оператором SELECT.

В dbt эти модели могут ссылаться друг на друга и быть layered, чтобы позволить построение более высокоуровневых концепций. Стандартный SQL, необходимый для подключения моделей, автоматически генерируется. Более того, dbt идентифицирует зависимости между моделями и гарантирует, что они создаются в соответствующем порядке с помощью направленного ациклического графа (DAG).

Dbt совместим с ClickHouse через [поддерживаемый плагин для ClickHouse](https://github.com/ClickHouse/dbt-clickhouse). Мы описываем процесс подключения ClickHouse с простым примером на основе общедоступного набора данных IMDB. Мы также подчеркиваем некоторые ограничения текущего соединителя.

<TOCInline toc={toc}  maxHeadingLevel={2} />
## Концепции {#concepts}

dbt вводит концепцию модели. Это определяется как оператор SQL, потенциально объединяющий многие таблицы. Модель может быть "материализована" различными способами. Материализация представляет собой стратегию сборки для запроса select модели. Код, стоящий за материализацией, - это стандартный SQL, который оборачивает ваш запрос SELECT в оператор, чтобы создать новое или обновить существующее отношение.

dbt предоставляет 4 типа материализации:

* **view** (по умолчанию): Модель строится как представление в базе данных.
* **table**: Модель строится как таблица в базе данных.
* **ephemeral**: Модель не строится напрямую в базе данных, а вместо этого интегрируется в зависимые модели в виде общих табличных выражений.
* **incremental**: Модель изначально материализуется как таблица, а в последующих запусках dbt вставляет новые строки и обновляет измененные строки в таблице.

Дополнительный синтаксис и конструкции определяют, как эти модели должны обновляться, если их исходные данные изменяются. dbt обычно рекомендует начинать с материализации в виде представления, пока производительность не станет проблемой. Материализация в виде таблицы обеспечивает улучшение производительности времени выполнения запросов, захватывая результаты запроса модели в виде таблицы с увеличением объема хранения. Инкрементальный подход дополнительно развивает это, позволяя последующим обновлениям исходных данных быть зафиксированными в целевой таблице.

Текущий [плагин](https://github.com/silentsokolov/dbt-clickhouse) для ClickHouse поддерживает **view**, **table**, **ephemeral** и **incremental** материализации. Плагин также поддерживает [снимки](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) и [посевы](https://docs.getdbt.com/docs/building-a-dbt-project/seeds), которые мы рассмотрим в этом руководстве.

Для следующих руководств мы предполагаем, что у вас есть доступный экземпляр ClickHouse.
## Установка dbt и плагина ClickHouse {#setup-of-dbt-and-the-clickhouse-plugin}
### dbt {#dbt}

Мы предполагаем использование dbt CLI для следующих примеров. Пользователям также может быть интересно рассмотреть возможность использования [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview), который предлагает веб-интерфейс для интегрированной среды разработки (IDE), позволяющий пользователям редактировать и запускать проекты.

dbt предлагает множество вариантов установки CLI. Следуйте инструкциям, описанным [здесь](https://docs.getdbt.com/dbt-cli/install/overview). На данном этапе установите только dbt-core. Мы рекомендуем использовать `pip`.

```bash
pip install dbt-core
```

**Важно: Следующее протестировано на python 3.9.**
### Плагин ClickHouse {#clickhouse-plugin}

Установите плагин dbt ClickHouse:

```bash
pip install dbt-clickhouse
```
### Подготовка ClickHouse {#prepare-clickhouse}

dbt отлично подходит для моделирования высоко реляционных данных. В качестве примера мы предоставляем небольшой набор данных IMDB со следующим реляционным схематическим описанием. Этот набор данных происходит из [репозитория реляционных наборов данных](https://relational.fit.cvut.cz/dataset/IMDb). Это тривиально по сравнению с общими схемами, используемыми с dbt, но представляет собой управляемую выборку:

<Image img={dbt_01} size="lg" alt="Схема таблицы IMDB" />

Мы используем подмножество этих таблиц, как показано.

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
В колонке `created_at` таблицы `roles` устанавливается значение по умолчанию `now()`. Мы используем это позже, чтобы определить инкрементные обновления для наших моделей - см. [Инкрементные модели](#creating-an-incremental-materialization).
:::

Мы используем функцию `s3` для чтения исходных данных с общедоступных конечных точек для вставки данных. Выполните следующие команды для заполнения таблиц:

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

Время выполнения этих запросов может варьироваться в зависимости от вашей пропускной способности, но каждый из них должен занять лишь несколько секунд для завершения. Выполните следующий запрос для вычисления сводки по каждому актеру, отсортированной по количеству появления в фильмах, и для подтверждения того, что данные были загружены успешно:

```sql
SELECT id,
       any(actor_name)          as name,
       uniqExact(movie_id)    as num_movies,
       avg(rank)                as avg_rank,
       uniqExact(genre)         as unique_genres,
       uniqExact(director_name) as uniq_directors,
       max(created_at)          as updated_at
FROM (
         SELECT imdb.actors.id  as id,
                concat(imdb.actors.first_name, ' ', imdb.actors.last_name)  as actor_name,
                imdb.movies.id as movie_id,
                imdb.movies.rank as rank,
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

В следующих руководствах мы преобразуем этот запрос в модель - материализуем его в ClickHouse как представление и таблицу dbt.
## Подключение к ClickHouse {#connecting-to-clickhouse}

1. Создайте проект dbt. В данном случае мы назовем его по нашему источнику `imdb`. Когда будет предложено, выберите `clickhouse` в качестве источника базы данных.

    ```bash
    clickhouse-user@clickhouse:~$ dbt init imdb

    16:52:40  Running with dbt=1.1.0
    Какую базу данных вы хотите использовать?
    [1] clickhouse

    (Не видите, что хотите? https://docs.getdbt.com/docs/available-adapters)

    Введите номер: 1
    16:53:21  Образец профиля не найден для clickhouse.
    16:53:21
    Ваш новый проект dbt "imdb" был создан!

    Для получения дополнительной информации о том, как настроить файл profiles.yml,
    пожалуйста, обратитесь к документации dbt здесь:

    https://docs.getdbt.com/docs/configure-your-profile
    ```

2. `cd` в папку вашего проекта:

    ```bash
    cd imdb
    ```

3. На этом этапе вам понадобится текстовый редактор на ваш выбор. В приведенных ниже примерах мы используем популярный VS Code. Открыв директорию IMDB, вы должны увидеть набор файлов yml и sql:

    <Image img={dbt_02} size="lg" alt="Новый проект dbt" />

4. Обновите ваш файл `dbt_project.yml`, чтобы указать нашу первую модель - `actor_summary` и установить профиль на `clickhouse_imdb`.

    <Image img={dbt_03} size="lg" alt="Профиль dbt" />

    <Image img={dbt_04} size="lg" alt="Профиль dbt" />

5. Затем мы должны предоставить dbt информацию для подключения к нашему экземпляру ClickHouse. Добавьте следующее в ваш файл `~/.dbt/profiles.yml`.

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

    Обратите внимание на необходимость изменения пользователя и пароля. Есть дополнительные доступные настройки, документированные [здесь](https://github.com/silentsokolov/dbt-clickhouse#example-profile).

6. Из директории IMDB выполните команду `dbt debug`, чтобы подтвердить, что dbt может подключиться к ClickHouse.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt debug
    17:33:53  Running with dbt=1.1.0
    версия dbt: 1.1.0
    версия python: 3.10.1
    путь python: /home/dale/.pyenv/versions/3.10.1/bin/python3.10
    информация об os: Linux-5.13.0-10039-tuxedo-x86_64-with-glibc2.31
    Используя файл profiles.yml по адресу /home/dale/.dbt/profiles.yml
    Используя файл dbt_project.yml по адресу /opt/dbt/imdb/dbt_project.yml

    Конфигурация:
    файл profiles.yml [ОК, найден и валиден]
    файл dbt_project.yml [ОК, найден и валиден]

    Обязательные зависимости:
    - git [ОК, найден]

    Соединение:
    host: localhost
    port: 8123
    user: default
    schema: imdb_dbt
    secure: False
    verify: False
    Тест подключения: [ОК, соединение установлено]

    Все проверки пройдены!
    ```

    Подтвердите, что ответ включает `Тест подключения: [ОК, соединение установлено]`, что указывает на успешное подключение.
## Создание простой материализации представления {#creating-a-simple-view-materialization}

При использовании материализации представления модель пересоздается как представление при каждом выполнении через оператор `CREATE VIEW AS` в ClickHouse. Это не требует дополнительных затрат на хранение данных, но будет медленнее по сравнению с материализациями таблиц.

1. Из папки `imdb` удалите директорию `models/example`:

    ```bash
    clickhouse-user@clickhouse:~/imdb$ rm -rf models/example
    ```

2. Создайте новый файл в `actors` внутри папки `models`. Здесь мы создаем файлы, которые каждый представляют модель актера:

    ```bash
    clickhouse-user@clickhouse:~/imdb$ mkdir models/actors
    ```

3. Создайте файлы `schema.yml` и `actor_summary.sql` в папке `models/actors`.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/actor_summary.sql
    clickhouse-user@clickhouse:~/imdb$ touch models/actors/schema.yml
    ```
    Файл `schema.yml` определяет наши таблицы. Эти таблицы будут впоследствии доступны для использования в макросах. Отредактируйте `models/actors/schema.yml`, чтобы он содержал этот контент:
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
    Файл `actors_summary.sql` определяет нашу фактическую модель. Обратите внимание, что в конфигурационной функции мы также запрашиваем, чтобы модель была материализирована как представление в ClickHouse. Наши таблицы ссылаются на файл `schema.yml` через функцию `source`, например, `source('imdb', 'movies')` ссылается на таблицу `movies` в базе данных `imdb`. Отредактируйте `models/actors/actors_summary.sql`, чтобы он содержал этот контент:
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
    Обратите внимание, как мы включаем колонку `updated_at` в нашем окончательном actor_summary. Мы используем это позже для инкрементных материализаций.

4. Из директории `imdb` выполните команду `dbt run`.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt run
    15:05:35  Running with dbt=1.1.0
    15:05:35  Найдена 1 модель, 0 тестов, 1 снимок, 0 анализов, 181 макрос, 0 операций, 0 файлов семян, 6 источников, 0 экспозиций, 0 метрик
    15:05:35
    15:05:36  Конкуренция: 1 потоки (цель='dev')
    15:05:36
    15:05:36  1 из 1 НАЧАЛО модели представления imdb_dbt.actor_summary.................................. [RUN]
    15:05:37  1 из 1 ОК создано представление модели imdb_dbt.actor_summary............................. [ОК за 1.00с]
    15:05:37
    15:05:37  Завершено выполнение 1 модели представления за 1.97с.
    15:05:37
    15:05:37  Завершено успешно
    15:05:37
    15:05:37  Готово. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```

5. dbt будет представлять модель как представление в ClickHouse, как было запрошено. Теперь мы можем запрашивать это представление напрямую. Это представление будет создано в базе данных `imdb_dbt` - это определяется параметром schema в файле `~/.dbt/profiles.yml` под профилем `clickhouse_imdb`.

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
    |imdb_dbt          |  <---создано dbt!
    |information_schema|
    |system            |
    +------------------+
    ```

    Запрашивая это представление, мы можем воспроизвести результаты нашего предыдущего запроса с более простой синтаксисом:

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
## Создание материализации таблицы {#creating-a-table-materialization}

В предыдущем примере наша модель была материализирована как представление. Хотя это может обеспечить достаточную производительность для некоторых запросов, более сложные SELECT или часто выполняемые запросы могут быть лучше материализированы как таблица. Эта материализация полезна для моделей, которые будут запрашиваться BI-инструментами, чтобы обеспечить пользователям более быстрый опыт. Это фактически приводит к тому, что результаты запросов сохраняются как новая таблица с сопутствующими затратами на хранение - фактически выполняется `INSERT TO SELECT`. Обратите внимание, что эта таблица будет перестраиваться каждый раз, т.е. она не инкрементная. Большие наборы результатов могут, следовательно, привести к долгим временам выполнения - см. [Ограничения dbt](#limitations).

1. Измените файл `actors_summary.sql`, чтобы параметр `materialized` был установлен в `table`. Обратите внимание, как определяется `ORDER BY` и как мы используем движок таблиц `MergeTree`:

    ```sql
    {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='table') }}
    ```

2. Из директории `imdb` выполните команду `dbt run`. Это выполнение может занять немного больше времени - около 10 секунд на большинстве машин.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt run
    15:13:27  Running with dbt=1.1.0
    15:13:27  Найдена 1 модель, 0 тестов, 1 снимок, 0 анализов, 181 макрос, 0 операций, 0 файлов семян, 6 источников, 0 экспозиций, 0 метрик
    15:13:27
    15:13:28  Конкуренция: 1 потоки (цель='dev')
    15:13:28
    15:13:28  1 из 1 НАЧАЛО модели таблицы imdb_dbt.actor_summary................................. [RUN]
    15:13:37  1 из 1 ОК создана модель таблицы imdb_dbt.actor_summary............................ [ОК за 9.22с]
    15:13:37
    15:13:37  Завершено выполнение 1 модели таблицы за 10.20с.
    15:13:37
    15:13:37  Завершено успешно
    15:13:37
    15:13:37  Готово. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
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

4. Подтвердите, что результаты из этой таблицы совпадают с предыдущими ответами. Обратите внимание на заметное улучшение времени ответа теперь, когда модель является таблицей:

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

    Не стесняйтесь выполнять другие запросы к этой модели. Например, какие актеры имеют фильмы с самым высоким рейтингом более чем с 5 появлениями?

    ```sql
    SELECT * FROM imdb_dbt.actor_summary WHERE num_movies > 5 ORDER BY avg_rank  DESC LIMIT 10;
    ```
## Создание инкрементного материализованного представления {#creating-an-incremental-materialization}

Предыдущий пример создал таблицу для материализации модели. Эта таблица будет реконструироваться при каждом выполнении dbt. Это может быть непрактично и крайне затратно для больших наборов данных или сложных трансформаций. Чтобы справиться с этой задачей и уменьшить время сборки, dbt предлагает инкрементные материализации. Это позволяет dbt вставлять или обновлять записи в таблице с момента последнего выполнения, что делает его подходящим для событийных данных. Внутри создается временная таблица со всеми обновленными записями, после чего все незатронутые записи, а также обновленные записи вставляются в новую целевую таблицу. Это приводит к аналогичным [ограничениям](#limitations) для больших наборов данных, как и для табличной модели.

Чтобы преодолеть эти ограничения для больших наборов, плагин поддерживает режим 'inserts_only', где все обновления вставляются непосредственно в целевую таблицу без создания временной таблицы (подробнее об этом ниже).

Чтобы проиллюстрировать этот пример, мы добавим актера "Clicky McClickHouse", который появится в невероятных 910 фильмах - тем самым он станет более популярным, чем даже [Mel Blanc](https://en.wikipedia.org/wiki/Mel_Blanc).

1. Сначала мы модифицируем нашу модель так, чтобы она была инкрементной. Это требует:

    1. **unique_key** - Чтобы гарантировать, что плагин может уникально идентифицировать строки, мы должны предоставить unique_key - в данном случае поле `id` из нашего запроса подойдет. Это обеспечит отсутствие дубликатов строк в нашей материализованной таблице. Для получения дополнительной информации о ограничениях уникальности, смотрите [здесь](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#defining-a-uniqueness-constraint-optional).
    2. **Инкрементный фильтр** - Мы также должны указать dbt, как оно должно определять, какие строки изменились при инкрементном выполнении. Это достигается за счет предоставления выражения дельты. Обычно это включает временную метку для событийных данных; следовательно, наше поле временной метки updated_at. Этот столбец, который по умолчанию принимает значение now() при вставке строк, позволяет идентифицировать новые роли. Кроме того, нам нужно указать альтернативный случай, где добавляются новые актеры. Используя переменную `{{this}}`, которая обозначает существующую материализованную таблицу, мы получаем выражение `where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})`. Мы помещаем это внутри условия `{% if is_incremental() %}`, чтобы убедиться, что оно используется только при инкрементных запусках, а не когда таблица впервые создается. Для получения дополнительной информации о фильтрации строк для инкрементных моделей, смотрите [это обсуждение в документации dbt](https://docs.getdbt.com/docs/building-a-dbt-project/building-models/configuring-incremental-models#filtering-rows-on-an-incremental-run).

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

    -- этот фильтр будет применен только при инкрементном запуске
    where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

    {% endif %}
    ```

    Обратите внимание, что наша модель будет реагировать только на обновления и добавления в таблицы `roles` и `actors`. Чтобы реагировать на все таблицы, пользователям будет предложено разделить эту модель на несколько подмоделей - каждая из которых с собственными инкрементными критериями. Эти модели, в свою очередь, могут быть соотнесены и связаны. Для получения дополнительной информации о перекрестных ссылках моделей смотрите [здесь](https://docs.getdbt.com/reference/dbt-jinja-functions/ref).

2. Выполните `dbt run` и подтвердите результаты итоговой таблицы:

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

3. Теперь мы добавим данные в нашу модель, чтобы проиллюстрировать инкрементное обновление. Добавьте нашего актера "Clicky McClickHouse" в таблицу `actors`:

    ```sql
    INSERT INTO imdb.actors VALUES (845466, 'Clicky', 'McClickHouse', 'M');
    ```

4. Пусть "Clicky" снимется в 910 случайных фильмах:

    ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, id as movie_id, 'Himself' as role
    FROM imdb.movies
    LIMIT 910 OFFSET 10000;
    ```

5. Убедитесь, что он действительно стал актером с наибольшим количеством появлений, запросив исходную таблицу и обойдя любые модели dbt:

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

6. Выполните `dbt run` и подтвердите, что наша модель обновилась и соответствует вышеприведенным результатам:

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
### Внутренности {#internals}

Мы можем определить операторы, выполненные для выполнения указанного выше инкрементного обновления, запросив журнал запросов ClickHouse.

```sql
SELECT event_time, query  FROM system.query_log WHERE type='QueryStart' AND query LIKE '%dbt%'
AND event_time > subtractMinutes(now(), 15) ORDER BY event_time LIMIT 100;
```

Отрегулируйте вышеуказанный запрос в соответствии с периодом выполнения. Мы оставляем проверку результатов пользователю, но подчеркиваем общую стратегию, использованную плагином для выполнения инкрементных обновлений:

1. Плагин создает временную таблицу `actor_sumary__dbt_tmp`. Измененные строки передаются в эту таблицу.
2. Создается новая таблица `actor_summary_new`. Строки из старой таблицы передаются старой и новой, с проверкой, чтобы гарантировать, что идентификаторы строк не существуют во временной таблице. Это эффективно обрабатывает обновления и дубликаты.
3. Результаты из временной таблицы передаются в новую таблицу `actor_summary`.
4. Наконец, новая таблица атомарно заменяется старой версией с помощью оператора `EXCHANGE TABLES`. В свою очередь, старая и временная таблицы удаляются.

Это визуализировано ниже:

<Image img={dbt_05} size="lg" alt="инкрементные обновления dbt" />

Эта стратегия может столкнуться с проблемами на очень больших моделях. Для получения дополнительной информации смотрите [Ограничения](#limitations).
### Стратегия добавления (режим inserts-only) {#append-strategy-inserts-only-mode}

Чтобы преодолеть ограничения больших наборов данных в инкрементных моделях, плагин использует параметр конфигурации dbt `incremental_strategy`. Это может быть установлено на значение `append`. При установленном значении обновленные строки вставляются непосредственно в целевую таблицу (также известную как `imdb_dbt.actor_summary`), и временная таблица не создается.
Примечание: Режим добавления требует, чтобы ваши данные были неизменяемыми или чтобы дубликаты были приемлемыми. Если вам нужна инкрементная табличная модель, поддерживающая измененные строки, не используйте этот режим!

Чтобы проиллюстрировать этот режим, мы добавим еще одного нового актера и повторно выполним dbt run с параметром `incremental_strategy='append'`.

1. Настройте режим добавления только в actor_summary.sql:

   ```sql
   {{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='append') }}
   ```

2. Давайте добавим еще одного известного актера - Дэни ДеВито

   ```sql
   INSERT INTO imdb.actors VALUES (845467, 'Danny', 'DeBito', 'M');
   ```

3. Давайте снимем Дэни в 920 случайных фильмах.

   ```sql
   INSERT INTO imdb.roles
   SELECT now() as created_at, 845467 as actor_id, id as movie_id, 'Himself' as role
   FROM imdb.movies
   LIMIT 920 OFFSET 10000;
   ```

4. Выполните `dbt run` и подтвердите, что Дэни был добавлен в таблицу actor-summary

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

Обратите внимание, насколько быстрее было это инкрементное обновление по сравнению с вставкой "Clicky".

Проверка снова таблицы query_log показывает различия между двумя инкрементными запусками:

   ```sql
   insert into imdb_dbt.actor_summary ("id", "name", "num_movies", "avg_rank", "genres", "directors", "updated_at")
   with actor_summary as (
      SELECT id,
         any(actor_name) as name,
         uniqExact(movie_id)    as num_movies,
         avg(rank)                as avg_rank,
         uniqExact(genre)         as genres,
         uniqExact(director_name) as directors,
         max(created_at) as updated_at
      FROM (
         SELECT imdb.actors.id as id,
            concat(imdb.actors.first_name, ' ', imdb.actors.last_name) as actor_name,
            imdb.movies.id as movie_id,
            imdb.movies.rank as rank,
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
   )

   select *
   from actor_summary
   -- этот фильтр будет применен только при инкрементном запуске
   where id > (select max(id) from imdb_dbt.actor_summary) or updated_at > (select max(updated_at) from imdb_dbt.actor_summary)
   ```

В этом запуске только новые строки добавляются прямо в таблицу `imdb_dbt.actor_summary`, и создание таблицы не требуется.
### Режим Delete+Insert (Экспериментальный) {#deleteinsert-mode-experimental}

Исторически в ClickHouse было только ограниченное количество обновлений и удалений в виде асинхронных [мутаций](/sql-reference/statements/alter/index.md). Эти операции могут потребовать значительных затрат по вводу-выведению и должны в целом избегаться.

ClickHouse 22.8 представил [Легковесные удаления](/sql-reference/statements/delete.md). Эти функции в настоящее время являются экспериментальными, но предлагают более производительный способ удаления данных.

Этот режим можно настроить для модели через параметр `incremental_strategy`, т.е.

```sql
{{ config(order_by='(updated_at, id, name)', engine='MergeTree()', materialized='incremental', unique_key='id', incremental_strategy='delete+insert') }}
```

Эта стратегия работает непосредственно с таблицей целевой модели, поэтому, если возникнет проблема во время операции, данные в инкрементной модели, вероятно, окажутся в недействительном состоянии - атомарного обновления нет.

Вкратце, этот подход:

1. Плагин создает временную таблицу `actor_sumary__dbt_tmp`. Измененные строки передаются в эту таблицу.
2. Выдается команда `DELETE` для текущей таблицы `actor_summary`. Строки удаляются по id из `actor_sumary__dbt_tmp`.
3. Строки из `actor_sumary__dbt_tmp` вставляются в `actor_summary` с помощью команды `INSERT INTO actor_summary SELECT * FROM actor_sumary__dbt_tmp`.

Этот процесс показан ниже:

<Image img={dbt_06} size="lg" alt="легковесное удаление инкрементного" />
### Режим insert_overwrite (Экспериментальный) {#insert_overwrite-mode-experimental}

Выполняет следующие шаги:

1. Создайте промежуточную (временную) таблицу с той же структурой, что и инкрементная модель: `CREATE TABLE {staging} AS {target}`.
2. Вставьте только новые записи (сгенерированные с помощью SELECT) в промежуточную таблицу.
3. Замените только новые партиции (представленные в промежуточной таблице) в целевой таблице.

<br />

Этот подход имеет следующие преимущества:

* Он быстрее, чем стратегия по умолчанию, потому что не копирует всю таблицу.
* Он безопаснее, чем другие стратегии, поскольку не изменяет оригинальную таблицу, пока операция INSERT не завершится успешно: в случае промежуточной ошибки оригинальная таблица не будет изменена.
* Он реализует лучшие практики инженерии данных по "неизменяемости партиций", что упрощает инкрементную и параллельную обработку данных, откаты и т.д.

<Image img={dbt_07} size="lg" alt="инкрементное обновление вставкой" />
## Создание снимка {#creating-a-snapshot}

Снимки dbt позволяют зафиксировать изменения в изменяемой модели с течением времени. Это, в свою очередь, позволяет выполнять запросы на модели с точки зрения времени, где аналитики могут "оглядываться назад" на предыдущее состояние модели. Это достигается с помощью [типа 2 Постепенно Изменяющиеся Размеры](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row), где столбцы дата начала и дата окончания фиксируют, когда строка была актуальна. Эта функция поддерживается плагином ClickHouse и продемонстрирована ниже.

Этот пример предполагает, что вы завершили [Создание инкрементной табличной модели](#creating-an-incremental-materialization). Убедитесь, что ваш actor_summary.sql не устанавливает inserts_only=True. Ваши models/actor_summary.sql должны выглядеть следующим образом:

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

-- этот фильтр будет применен только при инкрементном запуске
where id > (select max(id) from {{ this }}) or updated_at > (select max(updated_at) from {{this}})

{% endif %}
```

1. Создайте файл `actor_summary` в каталоге снимков.

    ```bash
     touch snapshots/actor_summary.sql
    ```

2. Обновите содержимое файла actor_summary.sql следующим образом:
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

Несколько наблюдений по этому содержимому:
* SQL-запрос определяет результаты, которые вы хотите сохранить во времени. Функция ref используется для ссылки на ранее созданную модель actor_summary.
* Нам требуется столбец временной метки для указания изменений записей. Наша колонка updated_at (см. [Создание инкрементной табличной модели](#creating-an-incremental-materialization)) может быть использована здесь. Параметр strategy указывает на использование временной метки для обозначения обновлений, а параметр updated_at определяет столбец для использования. Если его нет в вашей модели, вы можете альтернативно использовать [check strategy](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy). Это значительно менее эффективно и требует от пользователя указать список столбцов для сравнения. dbt сравнивает текущие и исторические значения этих столбцов, фиксируя любые изменения (или ничего не делает, если они идентичны).

3. Запустите команду `dbt snapshot`.

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

Обратите внимание, что таблица actor_summary_snapshot была создана в базе данных снимков (определяемая параметром target_schema).

4. При выборке этих данных вы увидите, что dbt включило столбцы dbt_valid_from и dbt_valid_to. Последний имеет значения, установленные в null. Последующие запуски обновят это.

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

5. Сделайте так, чтобы наш любимый актер Clicky McClickHouse снялся еще в 10 фильмах.

    ```sql
    INSERT INTO imdb.roles
    SELECT now() as created_at, 845466 as actor_id, rand(number) % 412320 as movie_id, 'Himself' as role
    FROM system.numbers
    LIMIT 10;
    ```

6. Повторно выполните команду dbt run из каталога `imdb`. Это обновит инкрементную модель. После завершения запустите dbt snapshot, чтобы зафиксировать изменения.

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

7. Если мы теперь запрашиваем наш снимок, обратите внимание, что у Clicky McClickHouse теперь есть 2 строки. Наша предыдущая запись сейчас имеет значение dbt_valid_to. Наша новая запись фиксируется с тем же значением в столбце dbt_valid_from и значением dbt_valid_to, равным null. Если бы у нас были новые строки, они также были бы добавлены к снимку.

    ```sql
    SELECT id, name, num_movies, dbt_valid_from, dbt_valid_to FROM snapshots.actor_summary_snapshot ORDER BY num_movies DESC LIMIT 5;
    ```

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

Для получения дополнительной информации о снимках dbt смотрите [здесь](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots).
## Использование Seeds {#using-seeds}

dbt предоставляет возможность загружать данные из CSV файлов. Эта функция не предназначена для загрузки больших экспортов базы данных и больше подходит для небольших файлов, которые обычно используются для кодовых таблиц и [словарей](../../../../sql-reference/dictionaries/index.md), например, для сопоставления кодов стран с названиями стран. В качестве простого примера мы сгенерируем и затем загрузим список кодов жанров, используя функциональность seed.

1. Мы генерируем список кодов жанров из нашего существующего набора данных. Из директории dbt используйте `clickhouse-client`, чтобы создать файл `seeds/genre_codes.csv`:

    ```bash
    clickhouse-user@clickhouse:~/imdb$ clickhouse-client --password <password> --query
    "SELECT genre, ucase(substring(genre, 1, 3)) as code FROM imdb.genres GROUP BY genre
    LIMIT 100 FORMAT CSVWithNames" > seeds/genre_codes.csv
    ```

2. Выполните команду `dbt seed`. Это создаст новую таблицу `genre_codes` в нашей базе данных `imdb_dbt` (как определено в нашей конфигурации схемы) с записями из нашего CSV файла.

    ```bash
    clickhouse-user@clickhouse:~/imdb$ dbt seed
    17:03:23  Запуск с dbt=1.1.0
    17:03:23  Найдена 1 модель, 0 тестов, 1 снимок, 0 анализов, 181 макрос, 0 операций, 1 seed файл, 6 источников, 0 экспозиций, 0 метрик
    17:03:23
    17:03:24  Параллелизм: 1 поток (целевой='dev')
    17:03:24
    17:03:24  1 из 1 НАЧАЛО seed файла imdb_dbt.genre_codes..................................... [RUN]
    17:03:24  1 из 1 ОК загружен seed файл imdb_dbt.genre_codes................................. [INSERT 21 in 0.65s]
    17:03:24
    17:03:24  Завершено выполнение 1 seed за 1.62s.
    17:03:24
    17:03:24  Успешно завершено
    17:03:24
    17:03:24  Готово. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1
    ```
3. Подтвердите, что данные были загружены:

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
## Ограничения {#limitations}

Текущий плагин ClickHouse для dbt имеет несколько ограничений, о которых пользователи должны быть осведомлены:

1. Плагин в настоящее время материализует модели как таблицы, используя `INSERT TO SELECT`. Это фактически приводит к дублированию данных. Очень большие наборы данных (PB) могут приводить к чрезвычайно долгому времени выполнения, что делает некоторые модели непрактичными. Стремитесь минимизировать количество строк, возвращаемых любым запросом, используя GROUP BY, где это возможно. Предпочитайте модели, которые обобщают данные, над теми, которые просто выполняют преобразование, сохраняя количество строк в источнике.
2. Для использования распределенных таблиц для представления модели пользователи должны создать основные реплицируемые таблицы на каждом узле вручную. Распределенная таблица, в свою очередь, может быть создана поверх этих таблиц. Плагин не управляет созданием кластера.
3. Когда dbt создает отношение (таблицу/представление) в базе данных, оно обычно создает его как: `{{ database }}.{{ schema }}.{{ table/view id }}`. ClickHouse не имеет понятия схем. Поэтому плагин использует `{{schema}}.{{ table/view id }}`, где `schema` — это база данных ClickHouse.

Дополнительная информация

Предыдущие руководства только касаются функциональности dbt. Пользователям рекомендуется ознакомиться с отличной [документацией dbt](https://docs.getdbt.com/docs/introduction).

Дополнительная конфигурация для плагина описана [здесь](https://github.com/silentsokolov/dbt-clickhouse#model-configuration).
## Fivetran {#fivetran}

Коннектор `dbt-clickhouse` также доступен для использования в [преобразованиях Fivetran](https://fivetran.com/docs/transformations/dbt), что позволяет легко интегрировать и преобразовывать данные непосредственно в платформе Fivetran с помощью `dbt`.
## Связанное содержимое {#related-content}

- Блог и вебинар: [ClickHouse и dbt - Подарок от сообщества](https://clickhouse.com/blog/clickhouse-dbt-project-introduction-and-webinar)
